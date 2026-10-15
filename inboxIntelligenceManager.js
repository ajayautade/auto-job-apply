const fs = require('fs');
const path = require('path');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

// ═════════════════════════════════════════════════════════════════════
// 📬 Two-Way Inbox Intelligence & Auto-Reply Detection Engine
// ═════════════════════════════════════════════════════════════════════
// Responsibilities:
// 1. Monitors Gmail INBOX via IMAP for incoming replies from recruiters.
// 2. Multimodal AI Intent & Sentiment Classification via Google Gemini:
//    - 🟢 INTERVIEW_INVITATION (Screening call, tech round, calendar slots)
//    - 🌟 POSITIVE_INTEREST (Reviewing profile, forward to hiring manager)
//    - ❓ INFO_REQUESTED (Notice period, current/expected CTC, location)
//    - 🛑 REJECTION (Position closed, location mismatch, not proceeding)
//    - 🟡 OUT_OF_OFFICE (Automatic autoreply with return date)
// 3. Auto-Stops Follow-Up Cadence: Prevents embarrassing automatic follow-ups
//    when HR has already responded or rejected the application.
// 4. Generates instant 1-click tailored AI reply drafts.
// ═════════════════════════════════════════════════════════════════════

const rootDir = path.resolve('./auto_jobs');
const inboxRepliesFile = path.join(rootDir, 'inbox_replies.json');
const followUpsFile = path.join(rootDir, 'follow_ups.json');
const historyFile = path.join(rootDir, 'history.json');
const registryFile = path.join(rootDir, 'applied_recipients.json');

// Ensure auto_jobs directory exists
if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir, { recursive: true });
}

function initInboxIntelligence({ autoPilot, generateWithFallback, genAI, getUserProfile }) {
  let isScanInProgress = false;
  let periodicTimer = null;

  // ──────────────────────────────────────────────
  // Data Persistence (inbox_replies.json)
  // ──────────────────────────────────────────────
  function getStoredRepliesData() {
    try {
      if (fs.existsSync(inboxRepliesFile)) {
        return JSON.parse(fs.readFileSync(inboxRepliesFile, 'utf8'));
      }
    } catch (e) {
      console.warn('[InboxIntelligence] Warning reading inbox_replies.json:', e.message);
    }
    return {
      last_scanned_at: null,
      scanned_uids: [],
      stats: {
        total_replies: 0,
        interview_invites: 0,
        positive_interest: 0,
        info_requested: 0,
        rejections: 0,
        out_of_office: 0,
        unread_count: 0
      },
      replies: []
    };
  }

  function saveStoredRepliesData(data) {
    try {
      // Recalculate stats
      const replies = data.replies || [];
      data.stats = {
        total_replies: replies.length,
        interview_invites: replies.filter(r => r.intent === 'INTERVIEW_INVITATION').length,
        positive_interest: replies.filter(r => r.intent === 'POSITIVE_INTEREST').length,
        info_requested: replies.filter(r => r.intent === 'INFO_REQUESTED').length,
        rejections: replies.filter(r => r.intent === 'REJECTION').length,
        out_of_office: replies.filter(r => r.intent === 'OUT_OF_OFFICE').length,
        unread_count: replies.filter(r => !r.is_read).length
      };

      const tmp = `${inboxRepliesFile}.tmp.${process.pid}.${Date.now()}`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmp, inboxRepliesFile);
    } catch (e) {
      console.error('[InboxIntelligence] Error saving inbox_replies.json:', e.message);
    }
  }

  // ──────────────────────────────────────────────
  // Build Applied Contact & Thread Registry
  // ──────────────────────────────────────────────
  function getAppliedContactsLookup() {
    const contactMap = new Map(); // email (lowercase) -> { company_name, job_title, sent_at, subject }
    const subjectList = [];

    // 1. Read from applied_recipients.json
    try {
      if (fs.existsSync(registryFile)) {
        const reg = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
        for (const [rawEmail, list] of Object.entries(reg)) {
          const email = rawEmail.toLowerCase().trim();
          const items = Array.isArray(list) ? list : [list];
          if (items.length > 0) {
            const latest = items[items.length - 1];
            contactMap.set(email, {
              company_name: latest.company_name || 'Hiring Company',
              job_title: latest.job_title || 'Engineering Role',
              sent_at: latest.timestamp || null,
              original_subject: ''
            });
          }
        }
      }
    } catch (e) {}

    // 2. Read from history.json
    try {
      if (fs.existsSync(historyFile)) {
        const hist = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        for (const h of hist) {
          if ((h.status === 'SENT' || h.status === 'FOLLOW_UP_SENT') && h.contact_email) {
            const rawEmails = h.contact_email.split(/[\s,;]+/);
            for (const re of rawEmails) {
              const clean = re.toLowerCase().trim();
              if (clean && clean.includes('@')) {
                const prev = contactMap.get(clean) || {};
                contactMap.set(clean, {
                  company_name: h.company_name || prev.company_name || 'Hiring Company',
                  job_title: h.job_title || prev.job_title || 'Engineering Role',
                  sent_at: h.timestamp || prev.sent_at || null,
                  original_subject: h.subject || prev.original_subject || ''
                });
                if (h.subject) {
                  subjectList.push({
                    cleanSubject: h.subject.toLowerCase().replace(/^(re|fwd|fw):\s*/i, '').trim(),
                    email: clean,
                    company_name: h.company_name,
                    job_title: h.job_title
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {}

    // 3. Read from follow_ups.json
    try {
      if (fs.existsSync(followUpsFile)) {
        const fus = JSON.parse(fs.readFileSync(followUpsFile, 'utf8'));
        for (const f of fus) {
          if (f.contact_email) {
            const clean = f.contact_email.toLowerCase().trim();
            const prev = contactMap.get(clean) || {};
            contactMap.set(clean, {
              company_name: f.company_name || prev.company_name || 'Hiring Company',
              job_title: f.job_title || prev.job_title || 'Engineering Role',
              sent_at: f.original_sent_at || prev.sent_at || null,
              original_subject: f.original_subject || prev.original_subject || ''
            });
          }
        }
      }
    } catch (e) {}

    return { contactMap, subjectList };
  }

  // ──────────────────────────────────────────────
  // Clean Email Content (Extract only new reply text)
  // ──────────────────────────────────────────────
  function extractCleanReplySnippet(rawText) {
    if (!rawText) return '';
    let text = rawText;

    // Remove classic quoted email threads
    const quoteHeaders = [
      /_{10,}/,
      /-{5,}\s*Original Message\s*-{5,}/i,
      /On\s+[A-Za-z]+,\s+[A-Za-z0-9,\s]+at\s+[0-9:]+\s*[APMapm]*.*wrote:/i,
      /From:\s+.*Sent:\s+.*To:\s+.*Subject:\s+/is,
      /<mailto:[^>]+>/g
    ];

    for (const q of quoteHeaders) {
      const parts = text.split(q);
      if (parts.length > 1 && parts[0].trim().length > 10) {
        text = parts[0];
        break;
      }
    }

    // Remove email footer disclaimers
    text = text.replace(/This email and any attachments are confidential.*$/is, '');
    text = text.replace(/Disclaimer:.*$/is, '');

    return text.trim().slice(0, 1500);
  }

  // ──────────────────────────────────────────────
  // AI Intent & Sentiment Classifier (Gemini)
  // ──────────────────────────────────────────────
  async function classifyReplyWithAI({ fromName, fromEmail, subject, cleanText, companyName, jobTitle }) {
    const profile = getUserProfile ? getUserProfile() : { name: 'Candidate' };
    const prompt = `You are an elite talent recruiter & career agent analyzing an incoming reply from an employer/recruiter to a job application.

CONTEXT:
Candidate Name: ${profile.name || 'Candidate'}
Applied Position: ${jobTitle || 'Engineering Role'} at ${companyName || 'Target Company'}
Recruiter: ${fromName || 'Recruiter'} <${fromEmail}>
Subject: "${subject}"

RECRUITER'S MESSAGE TEXT:
"""
${cleanText}
"""

ANALYZE THE MESSAGE AND CLASSIFY IT:
1. "intent": MUST be exactly one of:
   - "INTERVIEW_INVITATION": Recruiter invites the candidate for an interview, screening call, technical discussion, meeting, or asks for availability/calendar slots/phone number.
   - "POSITIVE_INTEREST": Recruiter expresses positive interest, shortlisted the candidate, reviewing profile with team, or forwarding to hiring manager.
   - "INFO_REQUESTED": Recruiter asks for details: current CTC, expected CTC, notice period, location eligibility, visa status, portfolio, or coding test.
   - "REJECTION": Recruiter indicates they are moving forward with other candidates, position is filled, closed, on hold, or location restrictions (e.g., must be based in UK/US/onsite).
   - "OUT_OF_OFFICE": Automated out-of-office autoreply (vacation, leave, delay).
   - "GENERAL": Any other human or administrative response.

2. "sentiment": MUST be exactly one of: "POSITIVE", "NEUTRAL", "NEGATIVE".
3. "urgency": MUST be exactly one of: "HIGH" (for interview invites & time slots), "MEDIUM" (for questions/info), "LOW" (rejection or OOO).
4. "summary": A crisp 1-sentence summary of what the recruiter is saying.
5. "recommended_action": A crisp recommendation for the candidate on what to do next.
6. "suggested_reply": A professional, warm, concise reply draft (50–90 words) tailored to this specific message, signed off with candidate name.
7. "return_date": If OUT_OF_OFFICE and a return date is mentioned, format as YYYY-MM-DD, otherwise null.

Return ONLY a valid JSON object matching this schema:
{
  "intent": "INTERVIEW_INVITATION",
  "sentiment": "POSITIVE",
  "urgency": "HIGH",
  "summary": "...",
  "recommended_action": "...",
  "suggested_reply": "...",
  "return_date": null
}`;

    try {
      if (generateWithFallback) {
        const result = await generateWithFallback([prompt]);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (err) {
      console.warn('[InboxIntelligence] Gemini classification error:', err.message);
    }

    // Heuristic Fallback Classifier
    const lower = cleanText.toLowerCase();
    if (lower.includes('interview') || lower.includes('availability') || lower.includes('call') || lower.includes('schedule') || lower.includes('time slot') || lower.includes('phone screen') || lower.includes('discuss')) {
      return {
        intent: 'INTERVIEW_INVITATION',
        sentiment: 'POSITIVE',
        urgency: 'HIGH',
        summary: `${fromName || 'Recruiter'} wants to connect or schedule a discussion regarding ${jobTitle || 'the role'}.`,
        recommended_action: 'Reply promptly with 2-3 available time slots.',
        suggested_reply: `Hi ${fromName ? fromName.split(' ')[0] : 'there'},\n\nThank you for getting back to me! I would be delighted to connect. I am available this week during afternoon hours. Please let me know what time works best for you.\n\nBest regards,\n${profile.name || 'Candidate'}`
      };
    } else if (lower.includes('notice period') || lower.includes('ctc') || lower.includes('salary') || lower.includes('experience') || lower.includes('location')) {
      return {
        intent: 'INFO_REQUESTED',
        sentiment: 'NEUTRAL',
        urgency: 'MEDIUM',
        summary: `Recruiter requested additional candidate details regarding ${jobTitle || 'the position'}.`,
        recommended_action: 'Reply with your notice period, current CTC, and location availability.',
        suggested_reply: `Hi ${fromName ? fromName.split(' ')[0] : 'there'},\n\nThank you for reaching out. My notice period is 15-30 days and I am open to discussing compensation based on the scope of the role. Looking forward to speaking further.\n\nBest regards,\n${profile.name || 'Candidate'}`
      };
    } else if (lower.includes('other candidate') || lower.includes('not moving forward') || lower.includes('position is open to') || lower.includes('not shortlisted') || lower.includes('closed') || lower.includes('unsuccessful') || lower.includes('regret to inform')) {
      return {
        intent: 'REJECTION',
        sentiment: 'NEGATIVE',
        urgency: 'LOW',
        summary: `Recruiter indicated the role is restricted or moving forward with other applicants.`,
        recommended_action: 'Cadence stopped. No further action needed.',
        suggested_reply: `Hi ${fromName ? fromName.split(' ')[0] : 'there'},\n\nThank you for the update and for considering my profile. I wish you and the team all the best with the hiring process.\n\nBest regards,\n${profile.name || 'Candidate'}`
      };
    } else if (lower.includes('out of office') || lower.includes('auto-reply') || lower.includes('annual leave') || lower.includes('away from my mail')) {
      return {
        intent: 'OUT_OF_OFFICE',
        sentiment: 'NEUTRAL',
        urgency: 'LOW',
        summary: `Automated Out of Office reply received from ${fromName || 'recruiter'}.`,
        recommended_action: 'Follow-up paused until recruiter returns.',
        suggested_reply: null
      };
    }

    return {
      intent: 'GENERAL',
      sentiment: 'NEUTRAL',
      urgency: 'MEDIUM',
      summary: `Received a response from ${fromName || fromEmail} regarding ${subject}.`,
      recommended_action: 'Review message details and respond if applicable.',
      suggested_reply: `Hi ${fromName ? fromName.split(' ')[0] : 'there'},\n\nThank you for getting back to me. Let me know if you need any additional information from my side.\n\nBest regards,\n${profile.name || 'Candidate'}`
    };
  }

  // ──────────────────────────────────────────────
  // Auto-Stop Follow-Up Cadence Execution
  // ──────────────────────────────────────────────
  function handleFollowUpAutoStop(recruiterEmail, intent, returnDate = null) {
    if (!recruiterEmail) return { stopped: false };
    const cleanEmail = recruiterEmail.toLowerCase().trim();

    try {
      if (fs.existsSync(followUpsFile)) {
        const list = JSON.parse(fs.readFileSync(followUpsFile, 'utf8'));
        let modified = false;
        let actionTaken = 'NONE';

        for (const item of list) {
          const itemEmail = (item.contact_email || '').toLowerCase().trim();
          if (itemEmail === cleanEmail && item.status === 'SCHEDULED') {
            if (intent === 'REJECTION') {
              item.status = 'CANCELLED';
              item.cancellation_reason = 'HR Reply: Application declined or location ineligible';
              item.cancelled_at = new Date().toISOString();
              actionTaken = 'CANCELLED_REJECTION';
              modified = true;
            } else if (intent === 'INTERVIEW_INVITATION' || intent === 'POSITIVE_INTEREST' || intent === 'INFO_REQUESTED' || intent === 'GENERAL') {
              item.status = 'REPLIED';
              item.replied_at = new Date().toISOString();
              item.reply_intent = intent;
              actionTaken = 'STOPPED_REPLIED';
              modified = true;
            } else if (intent === 'OUT_OF_OFFICE') {
              if (returnDate) {
                const parsedReturn = new Date(returnDate);
                if (!isNaN(parsedReturn.getTime())) {
                  const newDue = new Date(parsedReturn.getTime() + 2 * 24 * 60 * 60 * 1000);
                  item.follow_up_due = newDue.toISOString();
                  item.notes = `Postponed due to HR Out of Office until ${returnDate}`;
                  actionTaken = 'RESCHEDULED_OOO';
                  modified = true;
                }
              } else {
                // Delay 5 days
                const newDue = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
                item.follow_up_due = newDue.toISOString();
                item.notes = 'Postponed due to HR Out of Office';
                actionTaken = 'RESCHEDULED_OOO';
                modified = true;
              }
            }
          }
        }

        if (modified) {
          fs.writeFileSync(followUpsFile, JSON.stringify(list, null, 2), 'utf8');
          console.log(`[InboxIntelligence] 🛑 Auto-Stop Cadence triggered for ${cleanEmail}: Action = ${actionTaken}`);
          return { stopped: true, action: actionTaken };
        }
      }
    } catch (e) {
      console.error('[InboxIntelligence] Error stopping follow-up cadence:', e.message);
    }
    return { stopped: false };
  }

  // ──────────────────────────────────────────────
  // Main Inbox Scanner (IMAP Flow)
  // ──────────────────────────────────────────────
  async function scanInboxNow({ daysBack = 14 } = {}) {
    if (isScanInProgress) {
      return { success: false, message: 'Inbox scan already in progress' };
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass || gmailUser === 'your_email@gmail.com') {
      return { success: false, message: 'Gmail credentials not configured in .env' };
    }

    isScanInProgress = true;
    console.log(`[InboxIntelligence] 🔍 Starting IMAP scan on ${gmailUser} (scanning last ${daysBack} days)...`);

    const storedData = getStoredRepliesData();
    const scannedUidSet = new Set((storedData.scanned_uids || []).map(String));
    const { contactMap, subjectList } = getAppliedContactsLookup();

    console.log(`[InboxIntelligence] 📋 Loaded ${contactMap.size} applied target contacts for reply matching.`);

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

    client.on('error', (err) => {
      console.warn('[InboxIntelligence] Handled IMAP socket warning:', err.message);
    });

    const results = {
      success: true,
      scannedCount: 0,
      newRepliesFound: 0,
      replies: [],
      errors: []
    };

    try {
      await client.connect();
      const lock = await client.getMailboxLock('INBOX');

      try {
        const sinceDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
        const uids = await client.search({ since: sinceDate }, { uid: true });

        console.log(`[InboxIntelligence] 📬 Found ${uids.length} messages in INBOX since ${sinceDate.toISOString().split('T')[0]}.`);

        if (uids.length > 0) {
          // Filter to UIDs not yet scanned
          const uidsToScan = uids.filter(uid => !scannedUidSet.has(String(uid)));
          console.log(`[InboxIntelligence] ⚡ Fetching envelopes for ${uidsToScan.length} unscanned messages...`);

          const matchedCandidates = [];

          if (uidsToScan.length > 0) {
            // Bulk fetch envelopes in streaming chunks of 150
            const CHUNK_SIZE = 150;
            for (let i = 0; i < uidsToScan.length; i += CHUNK_SIZE) {
              const chunk = uidsToScan.slice(i, i + CHUNK_SIZE);
              
              for await (const msg of client.fetch(chunk, { envelope: true }, { uid: true })) {
                const uidStr = String(msg.uid);
                results.scannedCount++;

                const env = msg.envelope;
                if (!env) {
                  scannedUidSet.add(uidStr);
                  continue;
                }

                const senderAddress = (env.from?.[0]?.address || '').toLowerCase().trim();
                const senderName = env.from?.[0]?.name || senderAddress.split('@')[0];
                const subject = env.subject || '';
                const cleanSubject = subject.toLowerCase().replace(/^(re|fwd|fw):\s*/i, '').trim();

                // Skip messages sent from ourselves
                if (senderAddress === gmailUser.toLowerCase().trim()) {
                  scannedUidSet.add(uidStr);
                  continue;
                }

                // Skip common non-recruiter system senders
                const skipSenders = [
                  'mailer-daemon', 'postmaster', 'no-reply', 'noreply', 'notifications',
                  'google.com', 'googlemail.com', 'apple.com', 'linkedin.com', 'naukri.com',
                  'indeed.com', 'github.com', 'support@', 'news@', 'info@'
                ];
                if (skipSenders.some(s => senderAddress.includes(s))) {
                  scannedUidSet.add(uidStr);
                  continue;
                }

                // Match by Recruiter Email OR matching thread subject
                let matchData = contactMap.get(senderAddress);

                if (!matchData && subject.toLowerCase().startsWith('re:')) {
                  // Try subject match
                  const foundSub = subjectList.find(s => 
                    s.cleanSubject && (cleanSubject.includes(s.cleanSubject) || s.cleanSubject.includes(cleanSubject))
                  );
                  if (foundSub) {
                    matchData = {
                      company_name: foundSub.company_name || 'Hiring Company',
                      job_title: foundSub.job_title || 'Engineering Role',
                      sent_at: null,
                      original_subject: foundSub.cleanSubject
                    };
                  }
                }

                if (matchData) {
                  console.log(`[InboxIntelligence] 🎯 MATCH! Recruiter reply queued: ${senderName} <${senderAddress}> | Subject: "${subject}"`);
                  matchedCandidates.push({
                    uidStr,
                    senderName,
                    senderAddress,
                    subject,
                    envDate: env.date,
                    matchData
                  });
                }

                // Record UID as scanned
                scannedUidSet.add(uidStr);
              }
            }
          }

          // Process and classify matched recruiter emails after envelope streaming finishes
          if (matchedCandidates.length > 0) {
            console.log(`[InboxIntelligence] 🧠 Classifying ${matchedCandidates.length} recruiter replies with Gemini AI...`);
            for (const item of matchedCandidates) {
              try {
                const fullMsg = await client.fetchOne(item.uidStr, { source: true }, { uid: true });
                const parsed = await simpleParser(fullMsg.source);
                const cleanSnippet = extractCleanReplySnippet(parsed.text || parsed.html || '');

                const classification = await classifyReplyWithAI({
                  fromName: item.senderName,
                  fromEmail: item.senderAddress,
                  subject: item.subject,
                  cleanText: cleanSnippet,
                  companyName: item.matchData.company_name,
                  jobTitle: item.matchData.job_title
                });

                // Auto-stop follow-up cadence
                const autoStopResult = handleFollowUpAutoStop(item.senderAddress, classification.intent, classification.return_date);

                const replyRecord = {
                  id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                  uid: item.uidStr,
                  from_name: item.senderName,
                  from_email: item.senderAddress,
                  to_email: gmailUser,
                  subject: item.subject,
                  received_at: (item.envDate ? new Date(item.envDate) : new Date()).toISOString(),
                  company_name: item.matchData.company_name,
                  job_title: item.matchData.job_title,
                  intent: classification.intent,
                  sentiment: classification.sentiment,
                  urgency: classification.urgency,
                  summary: classification.summary,
                  recommended_action: classification.recommended_action,
                  suggested_reply: classification.suggested_reply,
                  return_date: classification.return_date || null,
                  message_snippet: cleanSnippet.slice(0, 500),
                  full_text: cleanSnippet,
                  follow_up_stopped: autoStopResult.stopped,
                  follow_up_action: autoStopResult.action,
                  is_read: false,
                  detected_at: new Date().toISOString()
                };

                storedData.replies.unshift(replyRecord);
                results.replies.push(replyRecord);
                results.newRepliesFound++;
                console.log(`[InboxIntelligence] ✨ Classified: [${classification.intent}] from ${item.senderName} (${item.matchData.company_name}) - Follow-Up Stopped: ${autoStopResult.stopped}`);
              } catch (bodyErr) {
                console.warn(`[InboxIntelligence] Error analyzing message UID ${item.uidStr}:`, bodyErr.message);
              }
            }
          }
        }
      } finally {
        lock.release();
      }

      await client.logout();
    } catch (err) {
      console.error('[InboxIntelligence] IMAP Scan error:', err.message);
      results.errors.push(err.message);
      results.success = false;
    } finally {
      isScanInProgress = false;
      storedData.scanned_uids = Array.from(scannedUidSet).slice(-2000); // keep last 2000 UIDs
      storedData.last_scanned_at = new Date().toISOString();
      saveStoredRepliesData(storedData);
    }

    console.log(`[InboxIntelligence] ✅ Scan complete: ${results.newRepliesFound} new recruiter replies identified.`);
    return results;
  }

  // ──────────────────────────────────────────────
  // Generate Tailored AI Reply Draft
  // ──────────────────────────────────────────────
  async function generateCustomReplyDraft({ replyId, customInstructions }) {
    const storedData = getStoredRepliesData();
    const reply = (storedData.replies || []).find(r => r.id === replyId);
    if (!reply) throw new Error('Reply record not found');

    const profile = getUserProfile ? getUserProfile() : { name: 'Candidate' };
    const prompt = `You are writing a professional, human-sounding reply to an employer/recruiter.

CANDIDATE INFO:
Name: ${profile.name || 'Candidate'}
Role: ${profile.title || reply.job_title}
Phone: ${profile.phone || ''}
Portfolio: ${profile.portfolio || ''}

RECRUITER MESSAGE:
From: ${reply.from_name} <${reply.from_email}>
Company: ${reply.company_name}
Subject: ${reply.subject}
Message:
"""
${reply.full_text || reply.message_snippet}
"""

USER'S SPECIFIC INSTRUCTIONS FOR THE REPLY:
"${customInstructions || 'Accept the interview warmly, suggest afternoon time slots, and express enthusiasm for the team.'}"

GUIDELINES:
- Keep length concise: 60-100 words.
- Tone: Authentic, confident, professional, and courteous.
- Address them by first name if available.
- Include candidate signature block at the end.

Output ONLY the plain text of the email reply draft.`;

    if (generateWithFallback) {
      const result = await generateWithFallback([prompt]);
      return result.response.text().trim();
    }
    return reply.suggested_reply || 'Thank you for reaching out. I would be happy to discuss further.';
  }

  function markReplyAsRead(id) {
    const storedData = getStoredRepliesData();
    const item = (storedData.replies || []).find(r => r.id === id);
    if (item) {
      item.is_read = true;
      saveStoredRepliesData(storedData);
      return true;
    }
    return false;
  }

  function markAllRepliesAsRead() {
    const storedData = getStoredRepliesData();
    (storedData.replies || []).forEach(r => r.is_read = true);
    saveStoredRepliesData(storedData);
    return true;
  }

  function deleteReply(id) {
    const storedData = getStoredRepliesData();
    storedData.replies = (storedData.replies || []).filter(r => r.id !== id);
    saveStoredRepliesData(storedData);
    return true;
  }

  // ──────────────────────────────────────────────
  // Automatic Background Periodic Scanner (Every 10 min)
  // ──────────────────────────────────────────────
  function startBackgroundScanner(intervalMinutes = 10) {
    if (periodicTimer) clearInterval(periodicTimer);

    // Initial background scan after 10s of server launch
    setTimeout(() => {
      scanInboxNow({ daysBack: 14 }).catch(() => {});
    }, 10000);

    // Recurring scan
    periodicTimer = setInterval(() => {
      scanInboxNow({ daysBack: 7 }).catch(() => {});
    }, intervalMinutes * 60 * 1000);

    console.log(`[InboxIntelligence] ⏱️ Periodic background inbox scanner scheduled (every ${intervalMinutes}m).`);
  }

  function stop() {
    if (periodicTimer) clearInterval(periodicTimer);
  }

  return {
    getStoredRepliesData,
    scanInboxNow,
    generateCustomReplyDraft,
    markReplyAsRead,
    markAllRepliesAsRead,
    deleteReply,
    startBackgroundScanner,
    stop
  };
}

module.exports = {
  initInboxIntelligence
};
