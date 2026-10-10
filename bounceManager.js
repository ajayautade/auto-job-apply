const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const { ImapFlow } = require('imapflow');

const rootDir = path.resolve('./auto_jobs');
const bouncedFile = path.join(rootDir, 'bounced_emails.json');
const followUpsFile = path.join(rootDir, 'follow_ups.json');
const hrProgressFile = path.join(rootDir, 'hr_contacts_progress.json');

// Ensure directory exists
if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir, { recursive: true });
}

// ──────────────────────────────────────────────
// Domain MX Cache to avoid redundant DNS lookups
// ──────────────────────────────────────────────
const mxCache = new Map(); // domain -> { valid: boolean, checkedAt: timestamp }
const MX_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

// ──────────────────────────────────────────────
// Read & Write Bounced Emails
// ──────────────────────────────────────────────
function getBouncedRecords() {
  try {
    if (fs.existsSync(bouncedFile)) {
      return JSON.parse(fs.readFileSync(bouncedFile, 'utf8'));
    }
  } catch (e) {
    console.warn('[BounceManager] Warning reading bounced_emails.json:', e.message);
  }
  return {
    totalBounced: 0,
    totalCleanedFromInbox: 0,
    lastCleanedAt: null,
    bouncedEmails: {} // email -> { bouncedAt, reason, subject }
  };
}

function saveBouncedRecords(records) {
  try {
    records.totalBounced = Object.keys(records.bouncedEmails || {}).length;
    const tmp = `${bouncedFile}.tmp.${process.pid}.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(records, null, 2), 'utf8');
    fs.renameSync(tmp, bouncedFile);
  } catch (e) {
    console.error('[BounceManager] Error saving bounced_emails.json:', e.message);
  }
}

function isEmailBounced(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  const records = getBouncedRecords();
  return Boolean(records.bouncedEmails && records.bouncedEmails[clean]);
}

function recordBouncedEmail(email, reason = 'Address not found / Delivery failure', subject = '') {
  if (!email || typeof email !== 'string') return;
  const clean = email.trim().toLowerCase();
  if (clean.includes('mailer-daemon') || clean.includes('googlemail.com') || clean.includes('gmail.com') || clean.includes('postmaster')) {
    return;
  }

  const records = getBouncedRecords();
  if (!records.bouncedEmails) records.bouncedEmails = {};

  records.bouncedEmails[clean] = {
    bouncedAt: new Date().toISOString(),
    reason: reason,
    subject: subject || ''
  };
  saveBouncedRecords(records);

  // Auto-cancel any queued follow-up for this bounced email
  cancelFollowUpForBounced(clean);

  // Update HR contacts progress status to BOUNCED
  markHREmailAsBounced(clean);
}

function cancelFollowUpForBounced(email) {
  try {
    if (fs.existsSync(followUpsFile)) {
      const followUps = JSON.parse(fs.readFileSync(followUpsFile, 'utf8'));
      let modified = false;
      const updated = followUps.map(item => {
        if (item.recipient_email && item.recipient_email.trim().toLowerCase() === email.toLowerCase()) {
          if (item.status !== 'CANCELLED_BOUNCED') {
            modified = true;
            return { ...item, status: 'CANCELLED_BOUNCED', cancelReason: 'Email address bounced or delayed delivery' };
          }
        }
        return item;
      });
      if (modified) {
        fs.writeFileSync(followUpsFile, JSON.stringify(updated, null, 2), 'utf8');
        console.log(`[BounceManager] 🚫 Auto-cancelled scheduled follow-up for recipient: ${email}`);
      }
    }
  } catch (e) {}
}

function markHREmailAsBounced(email) {
  try {
    if (fs.existsSync(hrProgressFile)) {
      const progress = JSON.parse(fs.readFileSync(hrProgressFile, 'utf8'));
      if (progress.sent_emails && progress.sent_emails[email]) {
        progress.sent_emails[email].status = 'BOUNCED';
        progress.sent_emails[email].bounced_at = new Date().toISOString();
        fs.writeFileSync(hrProgressFile, JSON.stringify(progress, null, 2), 'utf8');
      }
    }
  } catch (e) {}
}

// ──────────────────────────────────────────────
// Fast DNS MX Record Check (Pre-Send Filter)
// ──────────────────────────────────────────────
async function verifyDomainHasMx(domain) {
  if (!domain || typeof domain !== 'string') return false;
  const cleanDomain = domain.trim().toLowerCase();

  const cached = mxCache.get(cleanDomain);
  if (cached && Date.now() - cached.checkedAt < MX_CACHE_TTL) {
    return cached.valid;
  }

  try {
    const mxRecords = await dns.resolveMx(cleanDomain);
    const isValid = Array.isArray(mxRecords) && mxRecords.length > 0;
    mxCache.set(cleanDomain, { valid: isValid, checkedAt: Date.now() });
    return isValid;
  } catch (err) {
    mxCache.set(cleanDomain, { valid: false, checkedAt: Date.now() });
    return false;
  }
}

async function validateEmailDeliverability(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Empty or invalid email address' };
  }
  const clean = email.trim().toLowerCase();

  // Basic regex check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, reason: 'Malformed email syntax' };
  }

  // Check known bounce blacklist
  if (isEmailBounced(clean)) {
    return { valid: false, reason: 'Recipient address is in bounce blacklist (previously failed)' };
  }

  // Check domain MX
  const domain = clean.split('@')[1];
  const hasMx = await verifyDomainHasMx(domain);
  if (!hasMx) {
    return { valid: false, reason: `Domain @${domain} has no active mail exchange (MX) servers` };
  }

  return { valid: true };
}

// ──────────────────────────────────────────────
// Extract Bounced / Delayed Recipient from Notification
// ──────────────────────────────────────────────
function extractBouncedEmail(rawContent, subject = '') {
  if (!rawContent && !subject) return null;
  const content = (rawContent || '') + ' ' + (subject || '');

  const patterns = [
    /wasn['’]t delivered to\s+<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /could not be delivered to\s+<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /delivering your message to\s+<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /delivery incomplete.*to\s+<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /problem while delivering to\s+<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /Final-Recipient:\s*rfc822;\s*<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /Original-Recipient:\s*rfc822;\s*<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /failed permanently:\s*<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /550[- ]5\.1\.1\s+<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i,
    /Recipient address:\s*<*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>*/i
  ];

  for (const regex of patterns) {
    const match = content.match(regex);
    if (match && match[1]) {
      const found = match[1].toLowerCase().trim();
      if (!found.includes('mailer-daemon') && 
          !found.includes('googlemail.com') && 
          !found.includes('gmail.com') && 
          !found.includes('postmaster')) {
        return found;
      }
    }
  }

  // Fallback pattern
  const allEmails = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  for (const e of allEmails) {
    const cand = e.toLowerCase().trim();
    if (!cand.includes('mailer-daemon') && 
        !cand.includes('googlemail') && 
        !cand.includes('google.com') && 
        !cand.includes('postmaster') &&
        cand !== (process.env.GMAIL_USER || '').toLowerCase()) {
      return cand;
    }
  }

  return null;
}

// ──────────────────────────────────────────────
// IMAP Inbox Cleaner (Moves Bounces & Delays to Trash/Bin via UIDs)
// ──────────────────────────────────────────────
let isCleaningInProgress = false;

async function cleanGmailBouncesNow() {
  if (isCleaningInProgress) {
    return { success: false, message: 'Clean already in progress' };
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass || gmailUser === 'your_email@gmail.com') {
    return { success: false, message: 'Gmail credentials not configured in .env' };
  }

  isCleaningInProgress = true;
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass.replace(/\s+/g, '')
    },
    logger: false,
    emitLogs: false
  });

  // Attach error handler to prevent unhandled 'error' events on socket timeout/drops
  client.on('error', (err) => {
    console.warn('[BounceCleaner] Handled IMAP socket error:', err.message);
  });

  const results = {
    success: true,
    cleanedCount: 0,
    bouncedRecipients: [],
    errors: []
  };

  try {
    await client.connect();

    // 1. Locate the Trash / Bin mailbox dynamically
    const mailboxes = await client.list();
    const trashBox = mailboxes.find(m => m.specialUse === '\\Trash') || 
                     mailboxes.find(m => m.path === '[Gmail]/Bin') || 
                     mailboxes.find(m => m.path === '[Gmail]/Trash') || 
                     { path: '[Gmail]/Bin' };

    const lock = await client.getMailboxLock('INBOX');
    try {
      // 2. Search for mailer-daemon, postmaster, delivery delays and failures
      const mdUids = await client.search({ from: 'mailer-daemon@googlemail.com' }, { uid: true }) || [];
      const pmUids = await client.search({ from: 'postmaster' }, { uid: true }) || [];
      const delayUids = await client.search({ subject: 'Delivery Status Notification (Delay)' }, { uid: true }) || [];
      const failUids = await client.search({ subject: 'Delivery Status Notification (Failure)' }, { uid: true }) || [];
      const incUids = await client.search({ subject: 'Delivery incomplete' }, { uid: true }) || [];
      const combinedUids = Array.from(new Set([...mdUids, ...pmUids, ...delayUids, ...failUids, ...incUids]));

      if (combinedUids.length > 0) {
        console.log(`[BounceCleaner] 📬 Found ${combinedUids.length} bounce/delay notification email(s) in INBOX.`);

        // For each UID, inspect envelope and extract bounced recipient if possible
        for (const uid of combinedUids) {
          try {
            const msg = await client.fetchOne(uid, { envelope: true, source: true }, { uid: true });
            const subject = msg?.envelope?.subject || '';
            const rawBody = msg?.source ? msg.source.toString('utf8') : '';

            const bouncedRecipient = extractBouncedEmail(rawBody, subject);
            if (bouncedRecipient) {
              const isDelay = subject.toLowerCase().includes('delay') || rawBody.toLowerCase().includes('retry for');
              const reason = isDelay ? 'Delivery delayed / incomplete (server timeout)' : 'Address not found / Delivery failure';
              recordBouncedEmail(bouncedRecipient, reason, subject);
              results.bouncedRecipients.push(bouncedRecipient);
            }
          } catch (fetchErr) {
            // Non-critical if fetch fails, move will still proceed
          }
        }

        // 3. Bulk move strictly these UIDs to Trash/Bin!
        await client.messageMove(combinedUids, trashBox.path, { uid: true });
        results.cleanedCount = combinedUids.length;

        // Update overall persistent stats
        const records = getBouncedRecords();
        records.totalCleanedFromInbox = (records.totalCleanedFromInbox || 0) + results.cleanedCount;
        records.lastCleanedAt = new Date().toISOString();
        saveBouncedRecords(records);

        console.log(`[BounceCleaner] ✅ Successfully moved ${results.cleanedCount} bounce/delay email(s) to ${trashBox.path}!`);
      } else {
        console.log('[BounceCleaner] ✨ INBOX is clean! Zero bounce/delay emails found.');
      }
    } finally {
      lock.release();
    }

    try {
      await client.logout();
    } catch (logoutErr) {
      try { client.close(); } catch (_) {}
    }
  } catch (err) {
    console.error('[BounceCleaner] ❌ IMAP error while cleaning bounces:', err.message);
    try { client.close(); } catch (_) {}
    results.success = false;
    results.error = err.message;
  } finally {
    isCleaningInProgress = false;
  }

  return results;
}

// ──────────────────────────────────────────────
// Background Periodic Auto-Cleaner
// ──────────────────────────────────────────────
let backgroundIntervalId = null;

function startAutoBounceCleaner(intervalMinutes = 1) {
  if (backgroundIntervalId) {
    clearInterval(backgroundIntervalId);
  }
  const ms = intervalMinutes * 60 * 1000;
  console.log(`[BounceCleaner] 🛡️ Automated Bounce & Delay Cleaner is ACTIVE (Sweeping every ${intervalMinutes} minute(s)).`);

  // Run initial scan 3 seconds after startup
  setTimeout(async () => {
    try {
      await cleanGmailBouncesNow();
    } catch (e) {}
  }, 3000);

  // Periodic recurring check
  backgroundIntervalId = setInterval(async () => {
    try {
      await cleanGmailBouncesNow();
    } catch (e) {}
  }, ms);
}

function stopAutoBounceCleaner() {
  if (backgroundIntervalId) {
    clearInterval(backgroundIntervalId);
    backgroundIntervalId = null;
  }
}

module.exports = {
  cleanGmailBouncesNow,
  startAutoBounceCleaner,
  stopAutoBounceCleaner,
  validateEmailDeliverability,
  verifyDomainHasMx,
  isEmailBounced,
  recordBouncedEmail,
  getBouncedRecords
};
