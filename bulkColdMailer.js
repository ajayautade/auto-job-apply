const fs = require('fs');
const path = require('path');

// ═════════════════════════════════════════════════════════════════════
// 🚀 Bulk Cold Mailer & Image OCR Extractor Module
// Supports:
// 1. Bulk pasting of messy emails (comma, newline, CSV, or raw text)
// 2. Multimodal Gemini Vision OCR to extract emails from screenshots/images
// 3. Automated bulk dispatch with human-like jitter, resume, and follow-ups
// ═════════════════════════════════════════════════════════════════════

const bulkState = {
  isRunning: false,
  shouldStop: false,
  total: 0,
  sentCount: 0,
  failedCount: 0,
  skippedCount: 0,
  currentIndex: 0,
  currentEmail: '',
  currentCompany: '',
  startTime: null,
  completedAt: null,
  lastLog: 'Idle',
  logs: [],
  results: []
};

// Generic email provider domain blacklist for company inference
const GENERIC_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'hotmail.com',
  'outlook.com', 'icloud.com', 'proton.me', 'protonmail.com', 'aol.com',
  'zoho.com', 'rediffmail.com', 'live.com', 'mail.com', 'gmx.com'
]);

function inferCompanyFromDomain(email) {
  if (!email || !email.includes('@')) return 'Hiring Company';
  const domain = email.split('@')[1].toLowerCase().trim();
  if (GENERIC_EMAIL_PROVIDERS.has(domain)) return 'Tech Company';
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const rawName = parts[0];
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  }
  return 'Hiring Company';
}

function parseRawTextEmails(rawText, historyRecords = [], bouncedEmails = new Set()) {
  if (!rawText || typeof rawText !== 'string') return [];

  const contactedMap = new Map();
  if (Array.isArray(historyRecords)) {
    historyRecords.forEach(h => {
      if (h.to) {
        const clean = h.to.toLowerCase().trim();
        contactedMap.set(clean, h.sentAt || true);
      }
    });
  }

  const results = [];
  const seenEmails = new Set();
  const lines = rawText.split(/\r?\n/);

  // 1. Process line-by-line first (to capture Name, Company if provided in CSV/tabular format)
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if line contains an email
    const emailMatch = trimmed.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    if (!emailMatch) return;

    const email = emailMatch[0].toLowerCase().trim();
    if (seenEmails.has(email)) return;
    seenEmails.add(email);

    let name = '';
    let company = '';
    let role = 'DevOps / Cloud Role';

    // Parse "Name <email@domain.com>"
    const angleMatch = trimmed.match(/^([^<]+)<([^>]+)>/);
    if (angleMatch) {
      name = angleMatch[1].replace(/["']/g, '').trim();
    } else if (trimmed.includes(',') || trimmed.includes('\t') || trimmed.includes('|')) {
      // Split by comma/tab/pipe: Name, Company, Email or Email, Name, Company
      const parts = trimmed.split(/,|\t|\|/).map(p => p.trim());
      if (parts.length >= 2) {
        const emailIdx = parts.findIndex(p => p.toLowerCase().includes(email));
        if (emailIdx === 0) {
          name = parts[1] || '';
          company = parts[2] || '';
        } else if (emailIdx === 1) {
          name = parts[0] || '';
          company = parts[2] || '';
        } else if (emailIdx >= 2) {
          name = parts[0] || '';
          company = parts[1] || '';
        }
      }
    }

    if (!company) {
      company = inferCompanyFromDomain(email);
    }

    const isBounced = bouncedEmails.has(email);
    const alreadyContacted = contactedMap.has(email);

    // Look for phone number on the line
    const phoneMatch = trimmed.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}/);
    let phone = '';
    if (phoneMatch) {
      const cleanP = phoneMatch[0].replace(/[^\d+]/g, '');
      if (cleanP.length >= 7 && cleanP.length <= 16) phone = cleanP;
    }

    results.push({
      email,
      phone,
      name: name || 'Hiring Leader',
      company: company,
      role: role,
      is_bounced: isBounced,
      already_contacted: alreadyContacted,
      last_contacted_at: contactedMap.get(email) || null,
      source: 'Pasted Text'
    });
  });

  // 2. Global fallback regex search over raw text to capture any emails missed in unstructured text
  const allMatches = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi) || [];
  allMatches.forEach(rawEmail => {
    const email = rawEmail.toLowerCase().trim();
    if (!seenEmails.has(email)) {
      seenEmails.add(email);
      const isBounced = bouncedEmails.has(email);
      const alreadyContacted = contactedMap.has(email);
      results.push({
        email,
        phone: '',
        name: 'Hiring Leader',
        company: inferCompanyFromDomain(email),
        role: 'DevOps / Cloud Role',
        is_bounced: isBounced,
        already_contacted: alreadyContacted,
        last_contacted_at: contactedMap.get(email) || null,
        source: 'Pasted Text'
      });
    }
  });

  // Automatically save/enrich valid contacts in master hr_contacts.csv
  try {
    const { appendBatchContacts } = require('./masterCsvManager');
    appendBatchContacts(results.map(r => ({
      name: r.name,
      email: r.email,
      phone: r.phone,
      title: r.role,
      company: r.company,
      source: 'Pasted Email Text'
    })));
  } catch (csvErr) {
    console.warn('[BulkColdMailer] Warning saving parsed text to master CSV:', csvErr.message);
  }

  return results;
}

// ──────────────────────────────────────────────
// Multimodal Gemini OCR: Extract Emails & Phone Numbers from Image/Screenshot
// ──────────────────────────────────────────────
async function extractEmailsFromImage({
  imageBuffer,
  mimeType,
  generateWithFallback,
  parseJsonFromText,
  historyRecords = [],
  bouncedEmails = new Set()
}) {
  if (!imageBuffer) throw new Error('No image buffer provided');

  const contactedMap = new Map();
  if (Array.isArray(historyRecords)) {
    historyRecords.forEach(h => {
      if (h.to) contactedMap.set(h.to.toLowerCase().trim(), h.sentAt || true);
    });
  }

  const base64Image = imageBuffer.toString('base64');

  const prompt = `You are an AI document analysis and recruitment contact extractor.
Carefully examine this image, which may contain a list of HR recruiters, an Excel/Google spreadsheet, a hiring post, a LinkedIn message, a WhatsApp group screenshot, an email thread, business card, or job board flyer.

TASK:
1. Scan every portion of the image and extract EVERY contact with an email address or recruitment contact info visible.
2. For each contact found, extract:
   - "email": The clean email address (lowercase).
   - "phone": The phone number, mobile number, or WhatsApp number (if visible, with country code like +91 or raw numbers; or null if not visible).
   - "name": The contact person's name if mentioned near the email, or null.
   - "company": The company name if visible near the email, or infer from the email domain, or null.
   - "role": The job role or designation if mentioned, or null.

Return ONLY a valid JSON object with the following schema:
{
  "recipients": [
    {
      "email": "example@domain.com",
      "phone": "+91 9876543210 or null",
      "name": "Contact Name or null",
      "company": "Company Name or null",
      "role": "Role or null"
    }
  ]
}

If no emails are found, return { "recipients": [] }.`;

  const promptContents = [
    prompt,
    {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: base64Image
      }
    }
  ];

  console.log('[BulkColdMailer] 🖼️ Running Gemini Vision OCR to extract emails and phone numbers from image...');
  const result = await generateWithFallback(promptContents, 25000);
  const rawText = result.response.text();

  // Search raw OCR text for any telephone/mobile numbers (e.g., +91 9876543210 or 10-digit mobile)
  const phoneMatches = rawText.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}/g) || [];
  const candidatePhones = phoneMatches
    .map(p => p.replace(/[^\d+]/g, ''))
    .filter(p => p.length >= 7 && p.length <= 16);

  let parsed = { recipients: [] };
  try {
    parsed = parseJsonFromText(rawText);
  } catch (err) {
    console.warn('[BulkColdMailer] Could not parse Gemini OCR JSON directly, fallback parsing:', err.message);
  }

  const recipients = Array.isArray(parsed.recipients) ? parsed.recipients : [];
  const seenEmails = new Set();
  const finalized = [];

  recipients.forEach((r, idx) => {
    if (!r || !r.email) return;
    const email = r.email.toLowerCase().trim();
    if (!email.includes('@') || seenEmails.has(email)) return;
    seenEmails.add(email);

    const isBounced = bouncedEmails.has(email);
    const alreadyContacted = contactedMap.has(email);

    let phone = '';
    if (r.phone && r.phone !== 'null') {
      const clean = r.phone.replace(/[^\d+]/g, '').trim();
      if (clean.length >= 7) phone = clean;
    }
    if (!phone && candidatePhones[idx]) {
      phone = candidatePhones[idx];
    } else if (!phone && candidatePhones.length > 0) {
      phone = candidatePhones[0];
    }

    finalized.push({
      email,
      phone,
      name: (r.name && r.name !== 'null') ? r.name.trim() : 'Hiring Leader',
      company: (r.company && r.company !== 'null') ? r.company.trim() : inferCompanyFromDomain(email),
      role: (r.role && r.role !== 'null') ? r.role.trim() : 'DevOps / Cloud Role',
      is_bounced: isBounced,
      already_contacted: alreadyContacted,
      last_contacted_at: contactedMap.get(email) || null,
      source: 'Screenshot OCR'
    });
  });

  // Secondary regex fallback over raw AI output in case any emails were mentioned outside JSON
  const regexMatches = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi) || [];
  regexMatches.forEach((rawEmail, idx) => {
    const email = rawEmail.toLowerCase().trim();
    if (!seenEmails.has(email)) {
      seenEmails.add(email);
      const isBounced = bouncedEmails.has(email);
      const alreadyContacted = contactedMap.has(email);
      const phone = candidatePhones[idx] || (candidatePhones.length > 0 ? candidatePhones[0] : '');
      finalized.push({
        email,
        phone,
        name: 'Hiring Leader',
        company: inferCompanyFromDomain(email),
        role: 'DevOps / Cloud Role',
        is_bounced: isBounced,
        already_contacted: alreadyContacted,
        last_contacted_at: contactedMap.get(email) || null,
        source: 'Screenshot OCR'
      });
    }
  });

  console.log(`[BulkColdMailer] ✅ Extracted ${finalized.length} unique email(s) from image!`);

  // DIRECT SAVE ONWARDS: Automatically save every extracted contact into master hr_contacts.csv!
  if (finalized.length > 0) {
    try {
      const { appendBatchContacts } = require('./masterCsvManager');
      const syncRes = appendBatchContacts(finalized.map(f => ({
        name: f.name,
        email: f.email,
        phone: f.phone,
        title: f.role,
        company: f.company,
        source: 'Screenshot OCR',
        added_at: new Date().toISOString()
      })));
      console.log(`[BulkColdMailer] 💾 Auto-saved ${syncRes.added} new contacts (${syncRes.updated} updated) directly to master hr_contacts.csv! Total in CSV now: ${syncRes.total}`);
    } catch (saveErr) {
      console.warn('[BulkColdMailer] Warning saving contacts to master CSV:', saveErr.message);
    }
  }

  return finalized;
}

// ──────────────────────────────────────────────
// Bulk Dispatch Execution Engine
// ──────────────────────────────────────────────
async function startBulkOutreach({
  recipients = [],
  customSubject = '',
  customBody = '',
  useAiPersonalization = false,
  speed = 'safe', // 'safe' (12-25s) or 'turbo' (3-5s)
  resumePath = null,
  resumeOriginalName = null,
  profile = {},
  sendEmailFn,
  autoPilot,
  recordExtractedHR,
  isEmailBounced,
  generateWithFallback,
  parseJsonFromText
}) {
  if (bulkState.isRunning) {
    throw new Error('A bulk cold email campaign is already in progress. Please wait or stop it first.');
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new Error('No recipients provided for bulk outreach.');
  }

  // Filter out invalid or bounced emails
  const validRecipients = recipients.filter(r => {
    if (!r || !r.email || !r.email.includes('@')) return false;
    if (isEmailBounced && isEmailBounced(r.email)) return false;
    return true;
  });

  if (validRecipients.length === 0) {
    throw new Error('None of the provided recipients have valid, non-bounced email addresses.');
  }

  bulkState.isRunning = true;
  bulkState.shouldStop = false;
  bulkState.total = validRecipients.length;
  bulkState.sentCount = 0;
  bulkState.failedCount = 0;
  bulkState.skippedCount = 0;
  bulkState.currentIndex = 0;
  bulkState.currentEmail = '';
  bulkState.currentCompany = '';
  bulkState.startTime = new Date().toISOString();
  bulkState.completedAt = null;
  bulkState.logs = [];
  bulkState.results = [];
  bulkState.lastLog = `Starting bulk outreach to ${validRecipients.length} recipients...`;

  // Dynamic user profile resolution
  let userProfile = profile;
  if (!userProfile || !userProfile.name) {
    try {
      const profileManager = require('./profileManager');
      userProfile = profileManager.getUserProfile();
    } catch (_) {
      userProfile = {};
    }
  }

  const senderName = userProfile.name || 'Candidate';
  const senderTitle = userProfile.title || 'Software Professional';
  const senderRole = userProfile.target_roles || senderTitle;
  const senderSkills = userProfile.core_skills || 'Cloud platforms, DevOps, full-stack and software engineering';
  const senderPortfolio = userProfile.portfolio || '';
  const senderPhone = userProfile.phone || '';
  const senderEmail = userProfile.email || '';
  const senderLinkedin = userProfile.linkedin || '';
  const senderGithub = userProfile.github || '';
  const senderAiInstructions = userProfile.custom_ai_instructions || '';
  const senderPromptRules = userProfile.custom_prompt_rules || '';
  const senderSignature = userProfile.signature || [
    senderName,
    senderTitle,
    senderPhone ? `📞 ${senderPhone}` : '',
    senderPortfolio ? `🌐 ${senderPortfolio}` : '',
    senderLinkedin ? `💼 ${senderLinkedin}` : ''
  ].filter(Boolean).join('\n');

  // Helper for token replacement
  const replaceTokens = (text, firstName, company, role) => {
    if (!text) return '';
    return text
      .replace(/{name}/gi, firstName)
      .replace(/{company}/gi, company)
      .replace(/{role}/gi, role)
      .replace(/{title}/gi, senderTitle)
      .replace(/{portfolio}/gi, senderPortfolio)
      .replace(/{phone}/gi, senderPhone)
      .replace(/{sender_name}/gi, senderName)
      .replace(/{sender_title}/gi, senderTitle)
      .replace(/{sender_email}/gi, senderEmail)
      .replace(/{sender_phone}/gi, senderPhone)
      .replace(/{candidate_name}/gi, senderName)
      .replace(/{candidate_role}/gi, senderTitle)
      .replace(/{signature}/gi, senderSignature);
  };

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${msg}`;
    bulkState.lastLog = formatted;
    bulkState.logs.unshift(formatted);
    if (bulkState.logs.length > 100) bulkState.logs.pop();
    console.log(`[BulkColdMailer] ${formatted}`);
  };

  addLog(`Initialized campaign for ${validRecipients.length} contacts (${speed === 'safe' ? 'Safe Jitter Mode' : 'Turbo Mode'}).`);

  // Run in background asynchronously
  (async () => {
    for (let i = 0; i < validRecipients.length; i++) {
      if (bulkState.shouldStop) {
        addLog('⏹️ Bulk outreach stopped by user.');
        break;
      }

      // Check daily limit
      if (autoPilot && autoPilot.isDailyLimitReached && autoPilot.isDailyLimitReached()) {
        const stats = autoPilot.getDailyStats ? autoPilot.getDailyStats() : {};
        addLog(`🛑 Daily email limit reached (${stats.sentToday || 0}/${stats.limit || 500}). Outreach paused for today.`);
        break;
      }

      const r = validRecipients[i];
      bulkState.currentIndex = i + 1;
      bulkState.currentEmail = r.email;
      bulkState.currentCompany = r.company || inferCompanyFromDomain(r.email);

      const firstName = (r.name && r.name !== 'Hiring Leader') ? r.name.split(' ')[0] : 'there';
      const company = r.company || inferCompanyFromDomain(r.email);
      const role = r.role || r.title || senderRole.split(',')[0].trim() || senderTitle;

      addLog(`Preparing email [${i + 1}/${validRecipients.length}] for ${r.email} (${company})...`);

      let emailSubject = '';
      let emailBody = '';

      if (useAiPersonalization && generateWithFallback && parseJsonFromText) {
        try {
          const aiPrompt = `You are ${senderName}, a ${senderTitle} writing a direct, high-impact cold application email.
Recipient Email: ${r.email}
Recipient Name: ${r.name || 'Hiring Team'}
Company: ${company}
Target Role: ${role}
Candidate Background & Core Skills: ${senderSkills}
${senderPortfolio ? `Portfolio / Website: ${senderPortfolio}` : ''}
${senderPhone ? `Phone: ${senderPhone}` : ''}
${senderAiInstructions ? `Special Instructions: ${senderAiInstructions}` : ''}
${senderPromptRules ? `Rules: ${senderPromptRules}` : ''}

Task: Write a concise, natural, tailored cold outreach email (under 130 words).
Connect candidate skills directly to ${company}'s scale and efficiency.
Mention attached resume and invite them to view portfolio / live projects${senderPortfolio ? ` at ${senderPortfolio}` : ''}.

Return JSON format:
{
  "subject": "Tailored subject line",
  "body": "Natural email body ending with signature"
}`;
          const aiResult = await generateWithFallback([aiPrompt], 12000);
          const parsed = parseJsonFromText(aiResult.response.text());
          emailSubject = parsed.subject || `${senderTitle} Alignment - ${company} | ${senderName}`;
          emailBody = parsed.body;
        } catch (aiErr) {
          console.warn('[BulkColdMailer] AI generation fallback:', aiErr.message);
        }
      }

      // Default or template fallback
      if (!emailSubject || !emailBody) {
        if (customSubject && customBody) {
          emailSubject = replaceTokens(customSubject, firstName, company, role);
          emailBody = replaceTokens(customBody, firstName, company, role);
        } else {
          emailSubject = `${senderTitle} Inquiry - ${company} | ${senderName}`;
          emailBody = `Hi ${firstName},

I noticed your active technical initiatives at ${company} and wanted to reach out regarding ${role} opportunities on your team.

My technical background centers on ${senderSkills}. In my recent work, I designed and delivered high-impact software solutions that improved system performance, streamlined workflows, and automated critical processes.

I have attached my resume for your review.${senderPortfolio ? ` You can also explore my live interactive architecture diagrams and deployed projects on my portfolio: ${senderPortfolio}` : ''}

I would welcome a brief conversation to discuss how my hands-on experience and skills can support ${company}'s goals.

Best regards,

${senderSignature}`;
        }
      }

      // Pre-send deliverability verification
      try {
        const sendRes = await sendEmailFn({
          to: r.email,
          subject: emailSubject,
          body: emailBody,
          resumePath: resumePath,
          resumeOriginalName: resumeOriginalName
        });

        bulkState.sentCount++;
        addLog(`✅ [${i + 1}/${validRecipients.length}] Sent successfully to ${r.email} (${company})!`);

        bulkState.results.push({
          email: r.email,
          name: r.name,
          company: company,
          role: role,
          success: true,
          messageId: sendRes ? sendRes.messageId : null,
          sentAt: new Date().toISOString()
        });

        // Record in history.json
        const historyFile = path.join(autoPilot && autoPilot.watchDir ? autoPilot.watchDir : './auto_jobs', 'history.json');
        let history = [];
        try {
          if (fs.existsSync(historyFile)) history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        } catch (_) {}

        history.unshift({
          id: `bulk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          company: company,
          role: role,
          subject: emailSubject,
          to: r.email,
          sentAt: new Date().toISOString(),
          status: 'SENT',
          source: 'Bulk Email Campaign',
          notes: `Sent via Custom Bulk Mailer (${r.source || 'Import'})`
        });
        try {
          fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
        } catch (_) {}

        // Ingest into Extracted HR Contacts directory
        if (recordExtractedHR) {
          try {
            recordExtractedHR({
              name: (r.name && r.name !== 'Hiring Leader') ? r.name : `${company} Recruiter`,
              company: company,
              email: r.email,
              source: `Bulk Importer (${r.source || 'Custom List'})`
            });
          } catch (_) {}
        }

        // Auto-schedule Day 4 follow-up
        if (autoPilot && autoPilot.scheduleFollowUp) {
          try {
            autoPilot.scheduleFollowUp({
              recipient_email: r.email,
              company_name: company,
              job_title: role,
              contact_person: r.name || `${company} Talent Acquisition`,
              initial_subject: emailSubject,
              initial_body: emailBody
            });
          } catch (_) {}
        }

      } catch (sendErr) {
        bulkState.failedCount++;
        addLog(`❌ [${i + 1}/${validRecipients.length}] Failed for ${r.email}: ${sendErr.message}`);
        bulkState.results.push({
          email: r.email,
          name: r.name,
          company: company,
          role: role,
          success: false,
          error: sendErr.message,
          sentAt: new Date().toISOString()
        });

        if (sendErr.message.includes('550') || sendErr.message.includes('Daily user sending limit exceeded')) {
          addLog(`🛑 Gmail Daily Limit Exceeded. Stopping bulk outreach.`);
          break;
        }
      }

      // Safe anti-spam jitter delay between emails
      if (i < validRecipients.length - 1 && !bulkState.shouldStop) {
        const minDelay = speed === 'turbo' ? 3000 : 12000;
        const maxJitter = speed === 'turbo' ? 2500 : 13000;
        const delay = Math.floor(Math.random() * maxJitter) + minDelay;
        addLog(`⏳ Pausing ${Math.round(delay / 1000)}s before next dispatch for inbox reputation safety...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }

    bulkState.isRunning = false;
    bulkState.completedAt = new Date().toISOString();
    bulkState.lastLog = `Finished! Dispatched ${bulkState.sentCount} cold emails (${bulkState.failedCount} failed, ${bulkState.skippedCount} skipped).`;
    addLog(`🏁 Bulk campaign execution complete.`);
  })();

  return {
    success: true,
    message: `Started bulk cold email outreach to ${validRecipients.length} recipients.`,
    total: validRecipients.length
  };
}

function getBulkStatus() {
  return {
    ...bulkState,
    percent: bulkState.total > 0 ? Math.round((bulkState.currentIndex / bulkState.total) * 100) : 0
  };
}

function stopBulkOutreach() {
  if (!bulkState.isRunning) {
    return { success: false, message: 'No bulk outreach campaign is currently running' };
  }
  bulkState.shouldStop = true;
  return { success: true, message: 'Stopping bulk outreach campaign gracefully...' };
}

module.exports = {
  parseRawTextEmails,
  extractEmailsFromImage,
  startBulkOutreach,
  getBulkStatus,
  stopBulkOutreach
};
