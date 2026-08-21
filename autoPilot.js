const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

function extractAllEmails(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  return Array.from(new Set(matches.map(e => e.trim().toLowerCase())));
}

function cleanPhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  // If there are multiple numbers (e.g. "9876543210 / 9876543211"), take the first valid one
  const parts = rawPhone.split(/[\/,|;]/);
  for (const part of parts) {
    let digits = part.trim().replace(/[^0-9+]/g, '');
    if (digits.startsWith('+')) digits = digits.substring(1);
    
    // Indian standard 10-digit mobile number
    if (/^[6-9]\d{9}$/.test(digits)) {
      return '91' + digits;
    }
    // Indian 11-digit starting with 0
    if (/^0[6-9]\d{9}$/.test(digits)) {
      return '91' + digits.substring(1);
    }
    // Indian 12-digit starting with 91
    if (/^91[6-9]\d{9}$/.test(digits)) {
      return digits;
    }
    // International numbers between 10 and 15 digits
    if (digits.length >= 10 && digits.length <= 15) {
      return digits;
    }
  }
  return null;
}

function formatDisplayPhone(phone) {
  if (!phone) return '';
  const clean = cleanPhoneNumber(phone);
  if (!clean) return phone;
  if (clean.startsWith('91') && clean.length === 12) {
    return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  }
  return `+${clean}`;
}

const ROLE_STOPWORDS = new Set([
  'application', 'apply', 'openings', 'opening', 'hiring', 'opportunity', 'opportunities',
  'position', 'positions', 'role', 'roles', 'required', 'requirement', 'requirements',
  'fresher', 'freshers', 'intern', 'interns', 'internship', 'internships', 'trainee', 'trainees',
  'experience', 'exp', 'years', 'year', 'yr', 'yrs', 'lead', 'senior', 'sr', 'junior', 'jr',
  'l1', 'l2', 'l3', 'level', 'associate', 'engineer', 'engineers', 'developer', 'developers',
  'executive', 'specialist', 'candidate', 'profile', 'resume', 'cv', 'er', 'ajay', 'autade',
  'urgent', 'urgently', 'immediate', 'joiner', 'job', 'jobs', 'vacancy', 'vacancies'
]);

function normalizeRole(role) {
  if (!role || typeof role !== 'string') return 'devops';
  const clean = role.toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !ROLE_STOPWORDS.has(word))
    .join(' ')
    .trim();
  return clean || 'devops';
}

function getRoleTokens(role) {
  if (!role || typeof role !== 'string') return new Set(['devops']);
  const words = role.toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !ROLE_STOPWORDS.has(word));
  return new Set(words.length > 0 ? words : ['devops']);
}

function normalizeCompany(comp) {
  if (!comp || typeof comp !== 'string') return '';
  const generic = ['unknown', 'not specified', 'n a', 'na', 'none', 'company', 'manual application', 'not mentioned'];
  let norm = comp.toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\b(pvt|ltd|limited|private|inc|incorporated|llc|corp|technologies|tech|solutions|services|systems|consulting|global|software|india)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (generic.some(g => norm.includes(g)) || norm.length < 2) return '';
  return norm;
}

function initAutoPilot({
  watchDir,
  generateWithFallback,
  parseJsonFromText,
  getSavedResume,
  draftPersonalizedEmail,
  sendEmailFn,
  getMimeTypeForPath
}) {
  const rootDir = watchDir || path.resolve('./auto_jobs');
  const failedDir = path.join(rootDir, 'failed');
  const historyFile = path.join(rootDir, 'history.json');
  const registryFile = path.join(rootDir, 'applied_recipients.json');
  const dailyStatsFile = path.join(rootDir, 'daily_stats.json');
  const followUpsFile = path.join(rootDir, 'follow_ups.json');
  const lockFile = path.join(rootDir, '.autopilot.lock');

  // Ensure directories exist
  [rootDir, failedDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Single-instance master lock to prevent duplicate watchers across restarts
  let isMasterWatcher = true;
  try {
    if (fs.existsSync(lockFile)) {
      const lockPid = parseInt(fs.readFileSync(lockFile, 'utf8'), 10);
      if (lockPid && lockPid !== process.pid) {
        try {
          process.kill(lockPid, 0);
          isMasterWatcher = false;
          console.log(`[Auto-Pilot] 🔒 Process PID ${lockPid} is already active as primary engine.`);
        } catch (e) {
          fs.writeFileSync(lockFile, String(process.pid));
        }
      }
    } else {
      fs.writeFileSync(lockFile, String(process.pid));
    }
  } catch (e) {}

  process.on('exit', () => {
    try {
      if (fs.existsSync(lockFile)) {
        const lockPid = parseInt(fs.readFileSync(lockFile, 'utf8'), 10);
        if (lockPid === process.pid) fs.unlinkSync(lockFile);
      }
    } catch (e) {}
  });

  // In-flight reservation locks to prevent race conditions during AI analysis & email drafting
  const inFlightRecipients = new Set();

  // ──────────────────────────────────────────────
  // 1. History & Recipient Registry
  // ──────────────────────────────────────────────
  function getHistory() {
    try {
      if (fs.existsSync(historyFile)) {
        return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      }
    } catch (e) {}
    return [];
  }

  function saveHistory(entry) {
    try {
      const history = getHistory();
      history.unshift(entry);
      fs.writeFileSync(historyFile, JSON.stringify(history.slice(0, 150), null, 2));
    } catch (e) {
      console.error('[Auto-Pilot] Failed to save history:', e.message);
    }
  }

  function getRecipientRegistry() {
    try {
      if (fs.existsSync(registryFile)) {
        const data = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
        const formatted = {};
        for (const [key, val] of Object.entries(data)) {
          formatted[key.toLowerCase()] = Array.isArray(val) ? val : [val];
        }
        return formatted;
      }
    } catch (e) {}
    return {};
  }

  function saveRecipientRegistry(registry) {
    try {
      fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2));
    } catch (e) {
      console.error('[Auto-Pilot] Failed to save recipient registry:', e.message);
    }
  }

  const sentEmailMap = new Map();
  const existingRegistry = getRecipientRegistry();
  for (const [email, list] of Object.entries(existingRegistry)) {
    sentEmailMap.set(email.toLowerCase(), Array.isArray(list) ? list : [list]);
  }

  try {
    const pastHistory = getHistory();
    for (const item of pastHistory) {
      if ((item.status === 'SENT' || item.status === 'FOLLOW_UP_SENT') && item.contact_email) {
        const emails = extractAllEmails(item.contact_email);
        for (const email of emails) {
          const list = sentEmailMap.get(email) || [];
          const exists = list.some(entry => 
            normalizeRole(entry.job_title) === normalizeRole(item.job_title) &&
            normalizeCompany(entry.company_name) === normalizeCompany(item.company_name)
          );
          if (!exists) {
            list.push({
              timestamp: item.timestamp,
              company_name: item.company_name,
              job_title: item.job_title
            });
            sentEmailMap.set(email, list);
            existingRegistry[email] = list;
          }
        }
      }
    }
    saveRecipientRegistry(existingRegistry);
  } catch (e) {}

  console.log(`[Auto-Pilot] 🛡️ Smart Role-Aware Duplicate Registry loaded (${sentEmailMap.size} unique recruiters tracked).`);

  function isDuplicateApplication(rawEmailText, newJobTitle, newCompanyName) {
    if (!rawEmailText) return null;
    const emails = extractAllEmails(rawEmailText);
    if (emails.length === 0) return null;

    const targetNormRole = normalizeRole(newJobTitle);
    const targetTokens = getRoleTokens(newJobTitle);
    const targetNormComp = normalizeCompany(newCompanyName);

    for (const email of emails) {
      // 1. Check in-flight active reservations
      for (const inFlightKey of inFlightRecipients) {
        if (inFlightKey.startsWith(`${email}#`)) {
          const inFlightRole = inFlightKey.split('#')[1] || '';
          const inFlightTokens = getRoleTokens(inFlightRole);
          const hasTokenOverlap = Array.from(targetTokens).some(t => inFlightTokens.has(t));
          if (targetNormRole === inFlightRole || targetNormRole.includes(inFlightRole) || inFlightRole.includes(targetNormRole) || hasTokenOverlap) {
            return {
              email: email,
              matchedRole: inFlightRole,
              matchedCompany: targetNormComp || 'Company',
              timestamp: new Date().toISOString(),
              reason: 'IN_FLIGHT_RESERVATION'
            };
          }
        }
      }

      // 2. Check registered past applications
      const historyList = sentEmailMap.get(email) || [];
      for (const entry of historyList) {
        const entryNormRole = normalizeRole(entry.job_title);
        const entryTokens = getRoleTokens(entry.job_title);
        const entryNormComp = normalizeCompany(entry.company_name);

        const companyMatches = (!targetNormComp || !entryNormComp) || (targetNormComp === entryNormComp) ||
          targetNormComp.includes(entryNormComp) || entryNormComp.includes(targetNormComp);

        // Role match conditions
        const exactRoleMatch = (targetNormRole === entryNormRole);
        const subRoleMatch = (targetNormRole.length > 3 && entryNormRole.length > 3) &&
          (targetNormRole.includes(entryNormRole) || entryNormRole.includes(targetNormRole));
        const tokenOverlap = Array.from(targetTokens).some(t => entryTokens.has(t));

        if (exactRoleMatch || subRoleMatch || tokenOverlap) {
          return {
            email: email,
            matchedRole: entry.job_title,
            matchedCompany: entry.company_name,
            timestamp: entry.timestamp
          };
        }
      }
    }
    return null;
  }

  function markRecipientAsApplied(rawEmailText, jobData) {
    const emails = extractAllEmails(rawEmailText);
    const currentRegistry = getRecipientRegistry();
    const timestamp = new Date().toISOString();

    for (const email of emails) {
      const list = sentEmailMap.get(email) || [];
      const newEntry = {
        timestamp,
        company_name: jobData.company_name || 'Company',
        job_title: jobData.job_title || 'Position'
      };
      list.push(newEntry);
      sentEmailMap.set(email, list);
      currentRegistry[email] = list;
    }
    saveRecipientRegistry(currentRegistry);
  }

  // ──────────────────────────────────────────────
  // 2. Daily Send Throttling & Jitter Tracker
  // ──────────────────────────────────────────────
  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getDailyStats() {
    const today = getTodayKey();
    let limit = parseInt(process.env.DAILY_SEND_LIMIT || '150', 10);
    try {
      if (fs.existsSync(dailyStatsFile)) {
        const raw = JSON.parse(fs.readFileSync(dailyStatsFile, 'utf8'));
        if (raw.customLimit) limit = raw.customLimit;
        if (raw.date === today) {
          return {
            date: today,
            sentToday: raw.sentToday || 0,
            limit: limit,
            remaining: Math.max(0, limit - (raw.sentToday || 0)),
            percent: Math.min(100, Math.round(((raw.sentToday || 0) / limit) * 100)),
            minJitter: parseInt(process.env.MIN_JITTER_SECONDS || '15', 10),
            maxJitter: parseInt(process.env.MAX_JITTER_SECONDS || '35', 10),
            lastSentTime: raw.lastSentTime || null
          };
        }
      }
    } catch (e) {}
    return {
      date: today,
      sentToday: 0,
      limit: limit,
      remaining: limit,
      percent: 0,
      minJitter: parseInt(process.env.MIN_JITTER_SECONDS || '15', 10),
      maxJitter: parseInt(process.env.MAX_JITTER_SECONDS || '35', 10),
      lastSentTime: null
    };
  }

  function recordDailySend(recipientEmail, role, company) {
    const stats = getDailyStats();
    stats.sentToday += 1;
    stats.remaining = Math.max(0, stats.limit - stats.sentToday);
    stats.percent = Math.min(100, Math.round((stats.sentToday / stats.limit) * 100));
    stats.lastSentTime = new Date().toISOString();
    try {
      fs.writeFileSync(dailyStatsFile, JSON.stringify({
        date: stats.date,
        sentToday: stats.sentToday,
        customLimit: stats.limit,
        lastSentTime: stats.lastSentTime
      }, null, 2));
    } catch (e) {
      console.error('[Auto-Pilot] Failed to save daily stats:', e.message);
    }
    return stats;
  }

  function setCustomDailyLimit(newLimit) {
    const stats = getDailyStats();
    stats.limit = parseInt(newLimit, 10) || 150;
    stats.remaining = Math.max(0, stats.limit - stats.sentToday);
    stats.percent = Math.min(100, Math.round((stats.sentToday / stats.limit) * 100));
    try {
      fs.writeFileSync(dailyStatsFile, JSON.stringify({
        date: stats.date,
        sentToday: stats.sentToday,
        customLimit: stats.limit,
        lastSentTime: stats.lastSentTime
      }, null, 2));
    } catch (e) {}

    if (!isDailyLimitReached() && pendingFiles.size > 0 && !isProcessing) {
      setTimeout(processNextInQueue, 500);
    }

    return stats;
  }

  function isDailyLimitReached() {
    const stats = getDailyStats();
    return stats.sentToday >= stats.limit;
  }

  function getRandomJitterMs() {
    const minS = parseInt(process.env.MIN_JITTER_SECONDS || '15', 10);
    const maxS = parseInt(process.env.MAX_JITTER_SECONDS || '35', 10);
    const randomSec = Math.floor(Math.random() * (maxS - minS + 1)) + minS;
    return randomSec * 1000;
  }

  // ──────────────────────────────────────────────
  // 3. Smart Automated Follow-Up Cadence
  // ──────────────────────────────────────────────
  function getFollowUps() {
    try {
      if (fs.existsSync(followUpsFile)) {
        return JSON.parse(fs.readFileSync(followUpsFile, 'utf8'));
      }
    } catch (e) {}
    return [];
  }

  function saveFollowUps(list) {
    try {
      fs.writeFileSync(followUpsFile, JSON.stringify(list, null, 2));
    } catch (e) {
      console.error('[Follow-Up Cadence] Failed to save follow-ups:', e.message);
    }
  }

  function scheduleFollowUp({ contact_email, company_name, job_title, original_subject, original_sent_at, original_job_id, contact_person }) {
    const list = getFollowUps();
    const followUpDays = parseInt(process.env.FOLLOW_UP_DAYS || '4', 10);
    const sentDate = original_sent_at ? new Date(original_sent_at) : new Date();
    const dueDate = new Date(sentDate.getTime() + followUpDays * 24 * 60 * 60 * 1000);

    const newFollowUp = {
      id: `fu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      original_job_id: original_job_id || `job-${Date.now()}`,
      contact_email: contact_email,
      company_name: company_name || 'Company',
      job_title: job_title || 'DevOps Engineer',
      contact_person: contact_person || null,
      original_subject: original_subject || 'Application',
      original_sent_at: sentDate.toISOString(),
      follow_up_due: dueDate.toISOString(),
      status: 'SCHEDULED', // SCHEDULED | SENT | REPLIED | CANCELLED
      follow_up_count: 1,
      created_at: new Date().toISOString()
    };

    const existsIndex = list.findIndex(f => 
      f.contact_email.toLowerCase() === contact_email.toLowerCase() &&
      normalizeRole(f.job_title) === normalizeRole(job_title) &&
      f.status === 'SCHEDULED'
    );

    if (existsIndex >= 0) {
      list[existsIndex] = newFollowUp;
    } else {
      list.unshift(newFollowUp);
    }

    saveFollowUps(list.slice(0, 200));
    console.log(`[Follow-Up Cadence] 📅 Follow-up scheduled for ${contact_email} ("${job_title}") due on ${dueDate.toLocaleDateString()}`);
    return newFollowUp;
  }

  function markFollowUpReplied(idOrEmail) {
    const list = getFollowUps();
    let found = false;
    list.forEach(f => {
      if (f.id === idOrEmail || f.contact_email.toLowerCase() === idOrEmail.toLowerCase()) {
        f.status = 'REPLIED';
        f.replied_at = new Date().toISOString();
        found = true;
      }
    });
    if (found) saveFollowUps(list);
    return found;
  }

  function cancelFollowUp(id) {
    const list = getFollowUps();
    const item = list.find(f => f.id === id);
    if (item) {
      item.status = 'CANCELLED';
      saveFollowUps(list);
      return true;
    }
    return false;
  }

  async function draftFollowUpEmail(followUpItem, resumeInfo) {
    const defaultSig = `Er. Ajay Autade\nDevOps Engineer | Computer Science Engineer\nP: +91 9545034120 | +91 7820902571\nE: ajayautade2@gmail.com | contact@ajayautade.com\nW: ajayautade.com | In: linkedin.com/in/ajayautadepatil`;
    const userDetails = {
      name: process.env.YOUR_NAME || 'Er. Ajay Autade',
      signature: process.env.EMAIL_SIGNATURE ? process.env.EMAIL_SIGNATURE.replace(/\\n/g, '\n') : defaultSig
    };

    const greetingTarget = followUpItem.contact_person && followUpItem.contact_person !== 'null' && followUpItem.contact_person !== 'Hiring Manager'
      ? `Hi ${followUpItem.contact_person.split(' ')[0]},`
      : (followUpItem.company_name && followUpItem.company_name !== 'null' ? `Hi ${followUpItem.company_name} Team,` : 'Hi there,');

    const prompt = `You are a real-world DevOps Engineer writing a short, polite, and human follow-up email regarding an earlier job application.

ANTI-AI RULES:
1. Keep it extremely brief: 2 short paragraphs (under 60 words total).
2. Start naturally with "${greetingTarget}".
3. State purpose clearly: "Following up briefly on my application for the ${followUpItem.job_title || 'DevOps'} role sent earlier. I wanted to reiterate my strong interest in joining ${followUpItem.company_name || 'your team'}."
4. Mention that your resume is re-attached for quick reference.
5. Close naturally ("Best,", "Thanks,", or "Best regards,") followed by the exact signature below.

MANDATORY SIGNATURE BLOCK:
${userDetails.signature}

Return ONLY valid JSON:
{
  "subject": "Following up: ${followUpItem.job_title || 'DevOps Position'} Application - ${userDetails.name}",
  "body": "Natural follow-up text ending with the exact signature"
}`;

    try {
      const result = await generateWithFallback([prompt]);
      const resText = result.response.text();
      return parseJsonFromText(resText);
    } catch (e) {
      return {
        subject: `Following up: ${followUpItem.job_title || 'DevOps Position'} Application - ${userDetails.name}`,
        body: `${greetingTarget}\n\nI wanted to follow up briefly on my application for the ${followUpItem.job_title || 'DevOps'} role sent earlier. I understand your team is busy, but I remain very interested in contributing to ${followUpItem.company_name || 'your team'}.\n\nI've re-attached my resume for your quick reference. Please let me know if you would like any additional information or have time for a brief chat.\n\nBest,\n\n${userDetails.signature}`
      };
    }
  }

  // ──────────────────────────────────────────────
  // 4. WhatsApp Recruiter Shortlisting & Outreach
  // ──────────────────────────────────────────────
  const whatsAppLeadsFile = path.join(rootDir, 'whatsapp_leads.json');

  function getWhatsAppLeads() {
    try {
      if (fs.existsSync(whatsAppLeadsFile)) {
        return JSON.parse(fs.readFileSync(whatsAppLeadsFile, 'utf8'));
      }
    } catch (e) {}
    return [];
  }

  function saveWhatsAppLeads(list) {
    try {
      fs.writeFileSync(whatsAppLeadsFile, JSON.stringify(list, null, 2));
    } catch (e) {
      console.error('[WhatsApp Outreach] Failed to save leads:', e.message);
    }
  }

  function shortlistWhatsAppLead({
    phone_number,
    display_phone,
    company_name,
    job_title,
    contact_person,
    message_draft,
    source,
    screenshot_file,
    has_email,
    contact_email
  }) {
    if (!phone_number) return null;
    const cleanPhone = cleanPhoneNumber(phone_number);
    if (!cleanPhone) return null;

    const list = getWhatsAppLeads();
    const normRole = normalizeRole(job_title);
    const existingIndex = list.findIndex(l => 
      l.phone_number === cleanPhone &&
      normalizeRole(l.job_title) === normRole
    );

    const newLead = {
      id: `wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      phone_number: cleanPhone,
      display_phone: display_phone || formatDisplayPhone(cleanPhone),
      company_name: company_name || 'Company',
      job_title: job_title || 'DevOps Engineer',
      contact_person: contact_person || null,
      message_draft: message_draft || '',
      status: 'PENDING_APPROVAL', // PENDING_APPROVAL | SENT | DISMISSED
      source: source || 'AUTOPILOT', // AUTOPILOT | MANUAL
      screenshot_file: screenshot_file || null,
      has_email: !!has_email,
      contact_email: contact_email || null,
      created_at: new Date().toISOString(),
      sent_at: null
    };

    if (existingIndex >= 0) {
      if (list[existingIndex].status === 'PENDING_APPROVAL' && message_draft) {
        list[existingIndex].message_draft = message_draft;
        list[existingIndex].updated_at = new Date().toISOString();
      }
    } else {
      list.unshift(newLead);
    }

    saveWhatsAppLeads(list.slice(0, 250));
    console.log(`[WhatsApp Outreach] 📱 Shortlisted recruiter WhatsApp lead: ${cleanPhone} ("${job_title}")`);
    return newLead;
  }

  function updateWhatsAppLead(id, updates) {
    const list = getWhatsAppLeads();
    const lead = list.find(l => l.id === id);
    if (lead) {
      if (updates.message_draft !== undefined) lead.message_draft = updates.message_draft;
      if (updates.phone_number !== undefined) {
        const clean = cleanPhoneNumber(updates.phone_number);
        if (clean) {
          lead.phone_number = clean;
          lead.display_phone = formatDisplayPhone(clean);
        }
      }
      if (updates.status !== undefined) lead.status = updates.status;
      if (updates.status === 'SENT') lead.sent_at = new Date().toISOString();
      lead.updated_at = new Date().toISOString();
      saveWhatsAppLeads(list);
      return lead;
    }
    return null;
  }

  function dismissWhatsAppLead(id) {
    return updateWhatsAppLead(id, { status: 'DISMISSED' });
  }

  function markWhatsAppLeadSent(id) {
    return updateWhatsAppLead(id, { status: 'SENT' });
  }

  async function draftWhatsAppPitch(jobData, resumeInfo) {
    if (typeof draftWhatsAppMessage === 'function') {
      return await draftWhatsAppMessage(jobData, resumeInfo);
    }
    const userDetails = {
      name: process.env.YOUR_NAME || 'Er. Ajay Autade',
      phone: process.env.YOUR_PHONE || '+91 9545034120',
      portfolio: process.env.YOUR_PORTFOLIO || 'https://ajayautade.com',
      linkedin: process.env.YOUR_LINKEDIN || 'https://linkedin.com/in/ajayautadepatil'
    };
    const recipientGreeting = jobData.contact_person && jobData.contact_person !== 'null' && jobData.contact_person !== 'Hiring Manager'
      ? `Hi ${jobData.contact_person.split(' ')[0]},`
      : `Hi ${jobData.company_name && jobData.company_name !== 'null' ? jobData.company_name + ' Team' : 'there'},`;

    const prompt = `You are a talented, real-world DevOps Engineer writing an authentic, direct, and conversational WhatsApp message to a recruiter regarding a job opening.

Write a clean, concise, human-written WhatsApp message.

CRITICAL GUIDELINES:
- Keep it concise (under 90 words total) — optimized for WhatsApp instant messaging.
- Warm, polite, confident, and natural tone (NO robotic/AI clichés).
- Mention the job role ("${jobData.job_title || 'DevOps Engineer'}") and company ("${jobData.company_name || 'your company'}").
- Highlight candidate's core strengths: AWS cloud infrastructure, Docker, Kubernetes, CI/CD pipelines, and Linux sysadmin.
- Offer to share resume PDF and invite a brief introductory chat.
- Sign off with:
  Best regards,
  ${userDetails.name}
  DevOps Engineer
  📱 +91 9545034120 / +91 7820902571
  🌐 ${userDetails.portfolio} | 💼 ${userDetails.linkedin}
- Output ONLY the plain message text with natural line breaks.`;

    const promptContents = [prompt];
    if (resumeInfo && resumeInfo.path && fs.existsSync(resumeInfo.path)) {
      try {
        const ext = path.extname(resumeInfo.path).toLowerCase();
        if (ext === '.pdf') {
          const pdfData = fs.readFileSync(resumeInfo.path).toString('base64');
          promptContents.push({
            inlineData: {
              mimeType: 'application/pdf',
              data: pdfData
            }
          });
        }
      } catch (e) {}
    }

    try {
      const result = await generateWithFallback(promptContents);
      let msg = result.response.text().trim();
      msg = msg.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '').trim();
      return msg;
    } catch (err) {
      return `${recipientGreeting}

Hope you're doing well! I saw your opening for the ${jobData.job_title || 'DevOps'} role at ${jobData.company_name || 'your team'} and wanted to connect directly.

I'm ${userDetails.name}, a Computer Science Engineer with hands-on experience in AWS, Docker, Kubernetes, CI/CD automation, and Linux. My technical background aligns well with the requirements for this role.

I'd love to share my updated resume and discuss how I can contribute. Are you available for a brief chat?

Best regards,
${userDetails.name}
DevOps Engineer
📱 +91 9545034120 / +91 7820902571
🌐 ${userDetails.portfolio} | 💼 ${userDetails.linkedin}`;
    }
  }

  async function sendFollowUpNow(id) {
    const list = getFollowUps();
    const item = list.find(f => f.id === id);
    if (!item) throw new Error('Follow-up not found');

    if (isDailyLimitReached()) {
      throw new Error(`Daily send limit (${getDailyStats().limit}) reached. Cannot send follow-up right now.`);
    }

    const currentResume = getSavedResume();
    const draft = await draftFollowUpEmail(item, currentResume);

    console.log(`[Follow-Up Cadence] 📤 Sending scheduled follow-up for "${item.job_title}" to ${item.contact_email}...`);
    const sendResult = await sendEmailFn({
      to: item.contact_email,
      subject: draft.subject,
      body: draft.body,
      resumePath: currentResume.path,
      resumeOriginalName: currentResume.originalName
    });

    item.status = 'SENT';
    item.sent_at = new Date().toISOString();
    item.message_id = sendResult.messageId || 'OK';
    saveFollowUps(list);

    recordDailySend(item.contact_email, item.job_title, item.company_name);

    saveHistory({
      id: `fu-sent-${Date.now()}`,
      timestamp: item.sent_at,
      status: 'FOLLOW_UP_SENT',
      company_name: item.company_name,
      job_title: item.job_title,
      contact_email: item.contact_email,
      subject: draft.subject,
      body: draft.body,
      has_resume: !!currentResume.path,
      resume_name: currentResume.originalName || null,
      files: ['follow_up_cadence'],
      auto_deleted: false
    });

    console.log(`[Follow-Up Cadence] ✅ Follow-up sent to ${item.contact_email} successfully!\n`);
    return { success: true, item, draft };
  }

  async function processDueFollowUps() {
    if (isDailyLimitReached()) {
      console.log(`[Follow-Up Cadence] ⏸️ Daily limit reached. Postponing due follow-ups.`);
      return;
    }

    const list = getFollowUps();
    const now = new Date();
    const dueItems = list.filter(f => f.status === 'SCHEDULED' && new Date(f.follow_up_due) <= now);

    if (dueItems.length === 0) return;

    console.log(`[Follow-Up Cadence] ⏰ Found ${dueItems.length} due follow-up(s) ready for dispatch...`);

    for (const item of dueItems) {
      if (isDailyLimitReached()) break;
      try {
        await sendFollowUpNow(item.id);
        const jitter = getRandomJitterMs();
        await new Promise(r => setTimeout(r, jitter));
      } catch (err) {
        console.error(`[Follow-Up Cadence] Failed to send follow-up to ${item.contact_email}:`, err.message);
      }
    }
  }

  // Check for due follow-ups every 30 minutes
  setInterval(processDueFollowUps, 30 * 60 * 1000);
  setTimeout(processDueFollowUps, 12000);

  // ──────────────────────────────────────────────
  // 4. Continuous Auto-Pilot Processing Loop
  // ──────────────────────────────────────────────
  let isProcessing = false;
  const pendingFiles = new Set();
  const supportedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif', '.bmp', '.tiff', '.tif'];

  function isSupportedImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return supportedExtensions.includes(ext);
  }

  async function processNextInQueue() {
    if (isProcessing || pendingFiles.size === 0) return;
    isProcessing = true;

    // Check daily quota limit
    if (isDailyLimitReached()) {
      const stats = getDailyStats();
      console.log(`\n🛑 [Auto-Pilot] DAILY LIMIT REACHED (${stats.sentToday}/${stats.limit} emails sent today).`);
      console.log(`   ⏸️ Queue paused to protect your Gmail sender reputation. Screenshots remain in queue.\n`);
      isProcessing = false;
      return;
    }

    // Get next file from queue
    const nextFile = Array.from(pendingFiles)[0];
    pendingFiles.delete(nextFile);

    if (!fs.existsSync(nextFile)) {
      isProcessing = false;
      if (pendingFiles.size > 0) setTimeout(processNextInQueue, 300);
      return;
    }

    const fileNames = [path.basename(nextFile)];
    console.log(`\n🤖 [Auto-Pilot] Processing screenshot: ${fileNames[0]} (${pendingFiles.size} remaining in queue)...`);

    try {
      const stat = fs.statSync(nextFile);
      if (stat.size === 0) {
        isProcessing = false;
        if (pendingFiles.size > 0) setTimeout(processNextInQueue, 300);
        return;
      }

      const data = fs.readFileSync(nextFile).toString('base64');
      const mimeType = getMimeTypeForPath(nextFile);
      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: data
        }
      };

      const prompt = `You are analyzing a screenshot of a job posting. Extract the following in JSON format:

{
  "company_name": "The company name",
  "job_title": "The specific job title/position (e.g., Senior DevOps Engineer, Cloud SRE, AWS Trainee, Python Backend)",
  "job_description_summary": "A concise 2-3 sentence summary of the role",
  "key_requirements": ["requirement1", "requirement2"],
  "key_skills": ["skill1", "skill2"],
  "contact_email": "The email address mentioned for applications (search every corner of the image for HR email, recruiter email, contact email, apply-to email)",
  "contact_phone": "The recruiter/HR mobile number or WhatsApp number if mentioned (e.g. +91 9876543210, 9876543210, 09876543210), otherwise null",
  "contact_person": "Name of the hiring manager/HR person/recruiter if mentioned",
  "location": "Job location if mentioned",
  "job_type": "Full-time/Part-time/Contract/Remote etc.",
  "experience_required": "Years of experience if mentioned",
  "salary_range": "Salary if mentioned, otherwise null",
  "application_deadline": "Deadline if mentioned, otherwise null"
}

IMPORTANT: 
- Scan the screenshot carefully for any email address. Look in header, body, footer, contact sections.
- Scan for recruiter mobile / WhatsApp contact numbers as well.
- If no email is found, set contact_email to null.
- If no phone is found, set contact_phone to null.
- Return ONLY valid JSON, no markdown formatting.`;

      console.log(`[Auto-Pilot] Analyzing ${fileNames[0]} with Gemini AI...`);
      const result = await generateWithFallback([prompt, imagePart]);
      const responseText = result.response.text();
      const jobData = parseJsonFromText(responseText);
      const timestamp = new Date().toISOString();

      const extractedEmails = extractAllEmails(jobData.contact_email);
      const rawPhone = jobData.contact_phone || null;
      const cleanPhone = cleanPhoneNumber(rawPhone);

      const jobRole = jobData.job_title || 'DevOps Position';
      const jobComp = jobData.company_name || 'Company';

      // ── WHATSAPP RECRUITER SHORTLISTING ──
      if (cleanPhone) {
        try {
          const currentResume = getSavedResume();
          const waPitch = await draftWhatsAppPitch(jobData, currentResume);
          shortlistWhatsAppLead({
            phone_number: cleanPhone,
            display_phone: rawPhone,
            company_name: jobComp,
            job_title: jobRole,
            contact_person: jobData.contact_person,
            message_draft: waPitch,
            source: 'AUTOPILOT',
            screenshot_file: fileNames[0],
            has_email: extractedEmails.length > 0,
            contact_email: extractedEmails.join(', ') || null
          });
          console.log(`[Auto-Pilot] 📱 Shortlisted recruiter WhatsApp: ${formatDisplayPhone(cleanPhone)} for "${jobRole}". Ready for approval in WhatsApp tab!`);
        } catch (waErr) {
          console.error('[Auto-Pilot] Could not draft WhatsApp message:', waErr.message);
        }
      }

      if (extractedEmails.length > 0) {
        const cleanEmail = extractedEmails.join(', ');

        console.log(`[Auto-Pilot] 🎯 Found posting: "${jobRole}" at "${jobComp}" -> Recipient: ${cleanEmail}`);

        // ── SMART ROLE-AWARE DUPLICATE CHECK ──
        const duplicateEntry = isDuplicateApplication(cleanEmail, jobRole, jobComp);
        if (duplicateEntry) {
          const sentDate = duplicateEntry.timestamp ? new Date(duplicateEntry.timestamp).toLocaleString() : 'previously';
          console.log(`[Auto-Pilot] ⏭️ DUPLICATE BLOCKED: Already sent application to ${duplicateEntry.email} for "${duplicateEntry.matchedRole || jobRole}" at "${duplicateEntry.matchedCompany || jobComp}" on ${sentDate}.`);

          // Delete duplicate screenshot
          if (fs.existsSync(nextFile)) {
            fs.unlinkSync(nextFile);
            console.log(`[Auto-Pilot] 🗑️ Deleted duplicate screenshot: ${fileNames[0]}`);
          }

          saveHistory({
            id: `job-${Date.now()}`,
            timestamp,
            status: 'SKIPPED_DUPLICATE',
            company_name: jobComp,
            job_title: jobRole,
            contact_email: cleanEmail,
            contact_phone: cleanPhone ? formatDisplayPhone(cleanPhone) : null,
            subject: `Skipped Duplicate: Already applied for ${duplicateEntry.matchedRole || jobRole} on ${sentDate}`,
            body: `An application for "${duplicateEntry.matchedRole || jobRole}" was already sent to ${duplicateEntry.email} on ${sentDate}. Duplicate send for this role was automatically prevented.`,
            has_resume: false,
            files: fileNames,
            auto_deleted: true
          });

          isProcessing = false;
          if (pendingFiles.size > 0) setTimeout(processNextInQueue, 800);
          return;
        }

        // ── RESERVE IN-FLIGHT CLAIM TO PREVENT CONCURRENT DUPLICATE SENDS ──
        const inFlightKeys = extractedEmails.map(e => `${e.toLowerCase()}#${normalizeRole(jobRole)}`);
        inFlightKeys.forEach(k => inFlightRecipients.add(k));

        console.log(`[Auto-Pilot] ✨ New job opening detected for ${cleanEmail}! Tailoring email for "${jobRole}"...`);

        try {
          // Draft email tailored specifically to THIS job role with candidate resume context
          const currentResume = getSavedResume();
          const emailDraft = await draftPersonalizedEmail(jobData, currentResume);

          try {
            // Send email automatically
            console.log(`[Auto-Pilot] 📤 Sending tailored application for "${jobRole}" to ${cleanEmail}...`);
            const sendResult = await sendEmailFn({
              to: cleanEmail,
              subject: emailDraft.subject,
              body: emailDraft.body,
              resumePath: currentResume.path,
              resumeOriginalName: currentResume.originalName
            });

            // Mark this specific role as applied for this recipient
            markRecipientAsApplied(cleanEmail, jobData);

            // Record in daily quota tracker
            recordDailySend(cleanEmail, jobRole, jobComp);

            // Schedule smart follow-up cadence (4 days out)
            const jobId = `job-${Date.now()}`;
            scheduleFollowUp({
              contact_email: cleanEmail,
              company_name: jobComp,
              job_title: jobRole,
              original_subject: emailDraft.subject,
              original_sent_at: timestamp,
              original_job_id: jobId,
              contact_person: jobData.contact_person
            });

            // Automatically delete screenshot after email is sent
            if (fs.existsSync(nextFile)) {
              fs.unlinkSync(nextFile);
              console.log(`[Auto-Pilot] 🗑️ Deleted processed screenshot: ${fileNames[0]}`);
            }

            saveHistory({
              id: jobId,
              timestamp,
              status: 'SENT',
              company_name: jobComp,
              job_title: jobRole,
              contact_email: cleanEmail,
              contact_phone: cleanPhone ? formatDisplayPhone(cleanPhone) : null,
              subject: emailDraft.subject,
              body: emailDraft.body,
              has_resume: !!currentResume.path,
              resume_name: currentResume.originalName || null,
              files: fileNames,
              auto_deleted: true
            });

            const currentStats = getDailyStats();
            console.log(`[Auto-Pilot] ✅ SUCCESS: Application for "${jobRole}" sent to ${cleanEmail} (MessageId: ${sendResult.messageId || 'OK'})`);
            console.log(`📊 [Daily Quota] ${currentStats.sentToday}/${currentStats.limit} sent today (${currentStats.remaining} remaining)\n`);

          } catch (sendErr) {
            console.error(`[Auto-Pilot] ❌ Failed to send email to ${cleanEmail}:`, sendErr.message);
            
            const timePrefix = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const destPath = path.join(failedDir, `${timePrefix}_${fileNames[0]}`);
            try {
              fs.renameSync(nextFile, destPath);
            } catch (e) {
              try { fs.unlinkSync(nextFile); } catch (e2) {}
            }

            saveHistory({
              id: `job-${Date.now()}`,
              timestamp,
              status: 'FAILED',
              error_message: sendErr.message,
              company_name: jobComp,
              job_title: jobRole,
              contact_email: cleanEmail,
              contact_phone: cleanPhone ? formatDisplayPhone(cleanPhone) : null,
              subject: emailDraft ? emailDraft.subject : 'Application',
              body: emailDraft ? emailDraft.body : '',
              has_resume: !!currentResume.path,
              files: fileNames,
              moved_files: [`${timePrefix}_${fileNames[0]}`]
            });
          }
        } finally {
          // Release in-flight reservation
          inFlightKeys.forEach(k => inFlightRecipients.delete(k));
        }

      } else if (cleanPhone) {
        // Screenshot contained a recruiter phone number but no email address!
        console.log(`[Auto-Pilot] 📱 Phone-only recruiter posting detected: ${formatDisplayPhone(cleanPhone)} in ${fileNames[0]}. WhatsApp lead created!`);
        
        if (fs.existsSync(nextFile)) {
          fs.unlinkSync(nextFile);
          console.log(`[Auto-Pilot] 🗑️ Processed and deleted screenshot (WhatsApp lead queued): ${fileNames[0]}`);
        }

        saveHistory({
          id: `wa-${Date.now()}`,
          timestamp,
          status: 'WHATSAPP_SHORTLISTED',
          company_name: jobComp,
          job_title: jobRole,
          contact_email: null,
          contact_phone: formatDisplayPhone(cleanPhone),
          subject: `WhatsApp Lead Shortlisted: ${formatDisplayPhone(cleanPhone)} (${jobRole})`,
          body: `Recruiter mobile number ${formatDisplayPhone(cleanPhone)} was extracted from ${fileNames[0]}. A tailored WhatsApp message was drafted and is ready for your 1-click approval in the WhatsApp Outreach tab.`,
          has_resume: false,
          files: fileNames,
          auto_deleted: true
        });

      } else {
        console.warn(`[Auto-Pilot] ⚠️ No contact email or phone number found in ${fileNames[0]}. Removing file and logging...`);
        
        if (fs.existsSync(nextFile)) {
          fs.unlinkSync(nextFile);
          console.log(`[Auto-Pilot] 🗑️ Removed screenshot (no email/phone): ${fileNames[0]}`);
        }

        saveHistory({
          id: `job-${Date.now()}`,
          timestamp,
          status: 'NO_EMAIL_FOUND',
          company_name: jobData.company_name || 'Unknown Company',
          job_title: jobData.job_title || 'Unknown Position',
          contact_email: null,
          contact_phone: null,
          subject: `No contact details found in ${fileNames[0]}`,
          body: 'AI scanned the screenshot thoroughly but could not find any recipient email address or phone number in the job posting.',
          has_resume: false,
          files: fileNames,
          auto_deleted: true
        });
      }

    } catch (err) {
      console.error(`[Auto-Pilot] ❌ Error processing ${fileNames[0]}:`, err.message);
      if (err.message && (err.message.includes('429') || err.message.includes('Quota exceeded'))) {
        console.log(`[Auto-Pilot] ⏳ Gemini rate limit reached. Re-queuing ${fileNames[0]} and pausing 25s...`);
        pendingFiles.add(nextFile);
        isProcessing = false;
        setTimeout(processNextInQueue, 25000);
        return;
      }
      if (fs.existsSync(nextFile)) {
        try {
          const timePrefix = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          fs.renameSync(nextFile, path.join(failedDir, `${timePrefix}_${fileNames[0]}`));
        } catch (e) {
          try { fs.unlinkSync(nextFile); } catch (e2) {}
        }
      }
    } finally {
      isProcessing = false;
      // Process next in queue with randomized human jitter delay
      if (pendingFiles.size > 0) {
        const jitterMs = getRandomJitterMs();
        console.log(`[Auto-Pilot] ⏳ Human Jitter: Waiting ${(jitterMs/1000).toFixed(0)}s before next application to protect Gmail sender score...`);
        setTimeout(processNextInQueue, jitterMs);
      }
    }
  }

  // Active folder scanner function
  function scanFolder() {
    if (!isMasterWatcher) return;
    try {
      if (!fs.existsSync(rootDir)) return;
      const entries = fs.readdirSync(rootDir, { withFileTypes: true });
      let addedAny = false;

      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith('.')) {
          if (isSupportedImage(entry.name)) {
            const fullPath = path.join(rootDir, entry.name);
            try {
              const stat = fs.statSync(fullPath);
              if (stat.size > 0 && (Date.now() - stat.mtimeMs) > 1000) {
                if (!pendingFiles.has(fullPath)) {
                  console.log(`[Auto-Pilot] 📥 Auto-detected screenshot in watch folder: ${entry.name}`);
                  pendingFiles.add(fullPath);
                  addedAny = true;
                }
              }
            } catch (e) {}
          }
        }
      }

      if ((addedAny || pendingFiles.size > 0) && !isProcessing && !isDailyLimitReached()) {
        processNextInQueue();
      }
    } catch (e) {
      console.error('[Auto-Pilot] Scan error:', e.message);
    }
  }

  // Chokidar real-time event watcher (only for primary master process)
  let watcher = null;
  let autoScanInterval = null;

  if (isMasterWatcher) {
    watcher = chokidar.watch(rootDir, {
      ignored: [
        /(^|[\/\\])\../, // ignore dotfiles
        path.join(rootDir, 'failed', '**'),
        path.join(rootDir, 'history.json'),
        path.join(rootDir, 'applied_recipients.json'),
        path.join(rootDir, 'daily_stats.json'),
        path.join(rootDir, 'follow_ups.json'),
        path.join(rootDir, 'whatsapp_leads.json'),
        path.join(rootDir, '.autopilot.lock')
      ],
      persistent: true,
      depth: 0,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 1500,
        pollInterval: 200
      }
    });

    watcher.on('add', (filePath) => {
      if (!isMasterWatcher) return;
      if (filePath.includes(failedDir)) return;
      if (!isSupportedImage(filePath)) return;

      try {
        const stat = fs.statSync(filePath);
        if (stat.size === 0) return;
      } catch (e) {
        return;
      }

      if (!pendingFiles.has(filePath)) {
        console.log(`[Auto-Pilot] 📥 Instant file watcher detected: ${path.basename(filePath)}`);
        pendingFiles.add(filePath);
      }

      if (!isProcessing) {
        setTimeout(processNextInQueue, 1500);
      }
    });

    autoScanInterval = setInterval(scanFolder, 3500);
  }

  const initialStats = getDailyStats();
  console.log(`\n🤖 Auto-Pilot Continuous Scanner is ACTIVE (Interval: 3.5s + Instant Watcher)`);
  console.log(`   📂 Drop screenshots into: ${rootDir}`);
  console.log(`   🛡️ Daily Throttle Limit: ${initialStats.sentToday}/${initialStats.limit} sent today (Jitter: ${initialStats.minJitter}s–${initialStats.maxJitter}s)`);
  console.log(`   📅 Smart Follow-Up Cadence: Automatic follow-ups scheduled after 4 days`);
  console.log(`   💬 WhatsApp Lead Shortlisting: Recruiter mobile numbers auto-drafted & queued for approval`);
  console.log(`   ⚡ Screenshots will be automatically analyzed, emailed, and DELETED upon sending.\n`);

  return {
    watchDir: rootDir,
    getHistory,
    saveHistory,
    clearHistory: () => {
      try {
        if (fs.existsSync(historyFile)) fs.writeFileSync(historyFile, JSON.stringify([]));
      } catch (e) {}
    },
    markApplied: markRecipientAsApplied,
    isDuplicate: isDuplicateApplication,
    getDailyStats,
    recordDailySend,
    setCustomDailyLimit,
    isDailyLimitReached,
    getFollowUps,
    scheduleFollowUp,
    markFollowUpReplied,
    cancelFollowUp,
    draftFollowUpEmail,
    sendFollowUpNow,
    processDueFollowUps,
    getWhatsAppLeads,
    saveWhatsAppLeads,
    shortlistWhatsAppLead,
    updateWhatsAppLead,
    dismissWhatsAppLead,
    markWhatsAppLeadSent,
    draftWhatsAppPitch,
    cleanPhoneNumber,
    formatDisplayPhone,
    scanNow: () => {
      scanFolder();
    },
    stop: () => {
      if (autoScanInterval) clearInterval(autoScanInterval);
      if (watcher) watcher.close();
    }
  };
}

module.exports = { initAutoPilot, cleanPhoneNumber, formatDisplayPhone };

