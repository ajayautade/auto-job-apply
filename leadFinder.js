const fs = require('fs');
const path = require('path');
const { getUserProfile } = require('./profileManager');
const { DEVOPS_COMPANIES } = require('./devopsCompanyDatabase');
const { validateEmailDeliverability } = require('./bounceManager');

function initLeadFinder({
  watchDir,
  generateWithFallback,
  parseJsonFromText,
  getSavedResume,
  sendEmailFn,
  autoPilot
}) {
  const rootDir = watchDir || path.resolve('./auto_jobs');
  const leadsFile = path.join(rootDir, 'recruiter_leads.json');
  const hrProgressFile = path.join(rootDir, 'hr_contacts_progress.json');

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }

  // ──────────────────────────────────────────────
  // Storage & Retrieval for Recruiter Leads
  // ──────────────────────────────────────────────
  function getLeads() {
    try {
      if (fs.existsSync(leadsFile)) {
        return JSON.parse(fs.readFileSync(leadsFile, 'utf8'));
      }
    } catch (e) {
      console.warn('[LeadFinder] Could not read recruiter_leads.json:', e.message);
    }
    return [];
  }

  function saveLeads(leads) {
    try {
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
    } catch (e) {
      console.error('[LeadFinder] Failed to save recruiter_leads.json:', e.message);
    }
  }

  function getLeadStats() {
    const leads = getLeads();
    return {
      total: leads.length,
      pending: leads.filter(l => l.status === 'DISCOVERED' || l.status === 'PENDING').length,
      sent: leads.filter(l => l.status === 'SENT').length,
      dismissed: leads.filter(l => l.status === 'DISMISSED').length
    };
  }

  // ──────────────────────────────────────────────
  // HR CONTACTS CSV PARSER & PROGRESS TRACKER
  // ──────────────────────────────────────────────
  const CSV_PATHS = [
    path.join(__dirname, 'hr_contacts.csv'),
    path.join(process.cwd(), 'hr_contacts.csv')
  ];

  function getCSVFilePath() {
    for (const p of CSV_PATHS) {
      if (fs.existsSync(p)) return p;
    }
    return CSV_PATHS[0];
  }

  function parseCSVContent(text) {
    if (!text) return [];
    const lines = [];
    let row = [];
    let inQuotes = false;
    let currentField = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        row.push(currentField.trim());
        if (row.some(f => f.length > 0)) lines.push(row);
        row = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField.length > 0 || row.length > 0) {
      row.push(currentField.trim());
      if (row.some(f => f.length > 0)) lines.push(row);
    }

    if (lines.length === 0) return [];
    const headers = lines[0].map(h => h.replace(/^["\s]+|["\s]+$/g, ''));
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      headers.forEach((h, idx) => {
        let val = lines[i][idx] || '';
        val = val.replace(/^["\s]+|["\s]+$/g, '');
        obj[h] = val;
      });
      if (obj.Email && obj.Email.includes('@')) {
        records.push({
          id: `hr_${i}`,
          index: i,
          name: obj.Name || 'Hiring Leader',
          email: obj.Email.toLowerCase().trim(),
          title: obj.Title || 'Head HR / Talent Acquisition',
          company: obj.Company ? obj.Company.replace(/[,]+$/, '').trim() : 'Tech Organization'
        });
      }
    }
    return records;
  }

  function getHRProgress() {
    try {
      if (fs.existsSync(hrProgressFile)) {
        return JSON.parse(fs.readFileSync(hrProgressFile, 'utf8'));
      }
    } catch (e) {
      console.warn('[LeadFinder] Could not read hr_contacts_progress.json:', e.message);
    }
    return {
      sent_emails: {},
      last_batch_run_date: null,
      today_sent_count: 0
    };
  }

  function saveHRProgress(progress) {
    try {
      fs.writeFileSync(hrProgressFile, JSON.stringify(progress, null, 2));
    } catch (e) {
      console.error('[LeadFinder] Failed to save hr_contacts_progress.json:', e.message);
    }
  }

  let cachedHRContacts = null;
  let cachedHRMtime = 0;
  function getRawHRContacts() {
    const csvPath = getCSVFilePath();
    if (fs.existsSync(csvPath)) {
      try {
        const stats = fs.statSync(csvPath);
        if (cachedHRContacts && cachedHRContacts.length > 0 && cachedHRMtime === stats.mtimeMs) {
          return cachedHRContacts;
        }
        const content = fs.readFileSync(csvPath, 'utf8');
        cachedHRContacts = parseCSVContent(content);
        cachedHRMtime = stats.mtimeMs;
        console.log(`[LeadFinder] 📋 Loaded ${cachedHRContacts.length} HR contacts from ${csvPath}`);
        return cachedHRContacts;
      } catch (e) {
        console.error(`[LeadFinder] Error reading ${csvPath}:`, e.message);
      }
    }
    return [];
  }

  function getEnrichedHRContacts() {
    const raw = getRawHRContacts();
    const progress = getHRProgress();
    const sentMap = progress.sent_emails || {};

    return raw.map(c => {
      const sentInfo = sentMap[c.email];
      return {
        ...c,
        status: sentInfo ? 'SENT' : 'PENDING',
        sent_at: sentInfo ? sentInfo.sent_at : null,
        message_id: sentInfo ? sentInfo.message_id : null,
        error: sentInfo ? sentInfo.error : null
      };
    });
  }

  function getHRContactsList({ page = 1, limit = 50, search = '', status = 'ALL' } = {}) {
    let list = getEnrichedHRContacts();

    if (status && status !== 'ALL') {
      list = list.filter(c => c.status === status);
    }

    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit) || 1,
      contacts: paginated
    };
  }

  // ──────────────────────────────────────────────
  // Campaign State for Autonomous Daily 100 Outbound
  // ──────────────────────────────────────────────
  let campaignState = {
    isRunning: false,
    shouldStop: false,
    current: 0,
    target: 100,
    currentContact: null,
    startedAt: null,
    completedAt: null,
    source: 'CSV_LIST', // 'CSV_LIST' or 'AI_ONLINE_FALLBACK'
    batchNumber: 1,
    totalBatches: 19,
    lastLog: 'Ready to launch daily HR cold outreach campaign',
    results: []
  };

  function getCuratedDevOpsCompanies() {
    const leads = getLeads();
    const sentDomains = new Set(
      leads.filter(l => l.status === 'SENT').map(l => (l.domain || '').toLowerCase().trim())
    );
    const sentNames = new Set(
      leads.filter(l => l.status === 'SENT').map(l => (l.company_name || '').toLowerCase().trim())
    );

    return DEVOPS_COMPANIES.map(c => {
      const isSent = sentDomains.has((c.domain || '').toLowerCase().trim()) || sentNames.has((c.name || '').toLowerCase().trim());
      const leadMatch = leads.find(l => (l.domain || '').toLowerCase().trim() === (c.domain || '').toLowerCase().trim());
      return {
        ...c,
        status: isSent ? 'SENT' : (leadMatch ? leadMatch.status : 'QUEUED'),
        sent_at: leadMatch ? leadMatch.sent_at : null,
        email: leadMatch ? leadMatch.email : `careers@${c.domain}`
      };
    });
  }

  function getCampaignStatus() {
    const allHR = getEnrichedHRContacts();
    const totalHR = allHR.length;
    const sentHR = allHR.filter(c => c.status === 'SENT').length;
    const remainingHR = totalHR - sentHR;

    const curated = getCuratedDevOpsCompanies();
    const totalCurated = curated.length;
    const sentCurated = curated.filter(c => c.status === 'SENT').length;

    const dailyStats = autoPilot && autoPilot.getDailyStats ? autoPilot.getDailyStats() : { sentToday: 0, limit: 500 };

    const batchSize = 100;
    const currentBatchNumber = Math.floor(sentHR / batchSize) + 1;
    const totalBatches = Math.ceil(totalHR / batchSize) || 1;

    return {
      is_running: campaignState.isRunning,
      source: remainingHR > 0 ? 'CSV_LIST' : 'AI_ONLINE_FALLBACK',
      batch_info: {
        current_batch: Math.min(currentBatchNumber, totalBatches),
        total_batches: totalBatches,
        batch_size: batchSize
      },
      progress: {
        current: campaignState.current,
        target: campaignState.target,
        current_contact: campaignState.currentContact,
        started_at: campaignState.startedAt,
        completed_at: campaignState.completedAt,
        last_log: campaignState.lastLog
      },
      stats: {
        hr_csv_total: totalHR,
        hr_csv_sent: sentHR,
        hr_csv_remaining: remainingHR,
        curated_total: totalCurated,
        curated_sent: sentCurated,
        today_sent: (dailyStats.sentToday !== undefined ? dailyStats.sentToday : dailyStats.count) || 0,
        daily_limit: dailyStats.limit || 500,
        daily_goal: 100
      },
      recent_results: campaignState.results.slice(-15)
    };
  }

  // ──────────────────────────────────────────────
  // AI Recruiter & HR Lead Discovery (Online Query)
  // ──────────────────────────────────────────────
  async function findRecruiterLeads({
    companies = [],
    companyText = '',
    targetRole = '',
    location = '',
    customNotes = '',
    autoSend = false
  }) {
    const profile = getUserProfile();
    const currentResume = getSavedResume();
    const candidateRole = targetRole || profile.title || 'DevOps & Cloud Engineer';
    const candidatePortfolio = profile.portfolio || 'https://ajayautade.com';
    const candidateSkills = profile.core_skills || 'AWS (VPC, EC2, S3, IAM, EKS), Kubernetes, Docker, Terraform, CI/CD (GitHub Actions, Jenkins, ArgoCD), Prometheus & Grafana, Linux, Python, Bash';

    let companyList = Array.isArray(companies) ? companies : [];
    if (companyText && typeof companyText === 'string') {
      const split = companyText
        .split(/[\n,;|]+/)
        .map(c => c.trim())
        .filter(c => c.length > 1);
      companyList = [...companyList, ...split];
    }
    companyList = Array.from(new Set(companyList)).filter(Boolean);

    if (companyList.length === 0) {
      throw new Error('Please provide at least one company name or domain to search for recruiters.');
    }

    console.log(`[LeadFinder] 🔍 Finding HR & Recruiter contacts for ${companyList.length} companies for role: "${candidateRole}"...`);

    const prompt = `You are an elite Talent Intelligence & Executive Search AI.
Your mission is to discover real-world Talent Acquisition / HR / Technical Recruiter / Engineering Hiring Manager contact points and email addresses for target companies, and draft high-converting, professional cold outreach emails for a job seeker.

CANDIDATE INFORMATION:
- Name: ${profile.name || 'Er. Ajay Autade'}
- Headline/Role: ${candidateRole}
- Core Technical Strengths: ${candidateSkills}
- Verified Portfolio: ${candidatePortfolio} (recruiter can view live interactive architecture diagrams and project demos)
- Experience & Projects: (1) Automated multi-region AWS Infrastructure with Terraform; (2) Zero-touch CI/CD with GitHub Actions & ArgoCD cutting release times by 60%; (3) Kubernetes HPA auto-scaling & Docker; (4) Prometheus & Grafana observability; (5) DevSecOps with SonarQube & Trivy.
${profile.custom_ai_instructions ? `Candidate Highlights: ${profile.custom_ai_instructions}` : ''}
${customNotes ? `User Custom Guidance: ${customNotes}` : ''}

TARGET COMPANIES TO INVESTIGATE:
${companyList.map((c, i) => `${i + 1}. ${c}`).join('\n')}

TARGET ROLE: ${candidateRole}
TARGET LOCATION / PREFERENCE: ${location || 'India / Remote / Global'}

FOR EACH COMPANY:
1. Identify the company's primary corporate domain (e.g. "razorpay.com", "cred.club", "swiggy.in", "postman.com", "zepto.com").
2. Discover or construct high-probability recruiter/HR contacts (e.g. "Talent Acquisition Team", "Technical Recruiter", "Head of Talent").
3. Construct standard corporate email: (e.g., careers@domain.com, talent@domain.com, recruiting@domain.com, hr@domain.com, first.last@domain.com).
4. Draft a tailored, crisp cold outreach email:
   - Concise (100–130 words), professional engineer-to-recruiter tone.
   - Mention the specific company name and why candidate's background in ${candidateSkills} directly aligns with their cloud/infrastructure scaling.
   - Mention live interactive architecture diagrams at ${candidatePortfolio} and attached resume.
   - NO AI clichés ("thrilled to apply", "esteemed organization", "proven track record").
   - Include signature.

Return ONLY a JSON array with this exact schema:
[
  {
    "company_name": "Exact Company Name",
    "domain": "companydomain.com",
    "recruiter_name": "Talent Acquisition Team",
    "recruiter_title": "Talent Acquisition / Technical Recruiting Team",
    "email": "careers@companydomain.com",
    "confidence": "HIGH" | "MEDIUM",
    "confidence_reason": "Standard corporate email pattern",
    "email_subject": "${candidateRole} Opportunity - ${profile.name || 'Ajay Autade'}",
    "email_body": "Personalized cold outreach email text ending with full signature"
  }
]`;

    let discovered = [];
    try {
      const result = await generateWithFallback([prompt]);
      const resText = result.response.text();
      discovered = parseJsonFromText(resText);
      if (!Array.isArray(discovered)) {
        discovered = discovered.leads || discovered.results || [];
      }
    } catch (err) {
      console.warn('[LeadFinder] Gemini discovery failed, generating verified pattern fallbacks:', err.message);
      discovered = companyList.map(comp => {
        const cleanName = comp.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
        let domain = cleanName.includes('.') ? cleanName : `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        const email = `careers@${domain}`;
        
        return {
          company_name: comp,
          domain: domain,
          recruiter_name: `${comp} Talent Acquisition Team`,
          recruiter_title: 'Talent Acquisition & Technical Recruiting',
          email: email,
          confidence: 'HIGH',
          confidence_reason: 'Corporate talent gateway',
          email_subject: `${candidateRole} Inquiry - ${profile.name || 'Er. Ajay Autade'}`,
          email_body: `Hi ${comp} Talent Team,\n\nI noticed ${comp}’s ongoing engineering growth and wanted to reach out regarding ${candidateRole} opportunities.\n\nMy background is centered on ${candidateSkills}. In my recent projects, I've automated multi-region cloud infrastructure using Terraform, built zero-touch CI/CD pipelines with GitHub Actions and ArgoCD cutting release times by 60%, and configured real-time monitoring with Prometheus & Grafana.\n\nI’ve attached my resume for your review, and you can also explore my live interactive architecture diagrams and project demos on my portfolio at ${candidatePortfolio}.\n\nI would welcome the opportunity for a brief conversation to see how my background could contribute to ${comp}.\n\nBest regards,\n\n${profile.signature}`
        };
      });
    }

    const existingLeads = getLeads();
    const newSavedLeads = [];
    const autoSendResults = [];

    for (const item of discovered) {
      if (!item.email || !item.email.includes('@')) continue;

      const cleanEmail = item.email.toLowerCase().trim();
      const existing = existingLeads.find(l => l.email.toLowerCase() === cleanEmail && l.company_name.toLowerCase() === (item.company_name || '').toLowerCase());

      const leadRecord = {
        id: existing ? existing.id : `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        company_name: item.company_name || 'Company',
        domain: item.domain || '',
        recruiter_name: item.recruiter_name || 'Talent Acquisition Team',
        recruiter_title: item.recruiter_title || 'Recruiter',
        email: cleanEmail,
        target_role: candidateRole,
        confidence: item.confidence || 'HIGH',
        confidence_reason: item.confidence_reason || 'Verified pattern',
        email_subject: item.email_subject || `${candidateRole} - ${profile.name || 'Ajay Autade'}`,
        email_body: item.email_body || '',
        status: existing ? existing.status : 'DISCOVERED',
        has_resume: !!(currentResume && currentResume.path),
        created_at: existing ? existing.created_at : new Date().toISOString(),
        sent_at: existing ? existing.sent_at : null,
        message_id: existing ? existing.message_id : null
      };

      if (!existing) {
        existingLeads.unshift(leadRecord);
        newSavedLeads.push(leadRecord);
      } else {
        Object.assign(existing, leadRecord);
      }

      if (autoSend) {
        try {
          const sendRes = await sendLeadEmail(leadRecord.id);
          autoSendResults.push({ id: leadRecord.id, email: leadRecord.email, success: true, messageId: sendRes.message_id });
        } catch (sErr) {
          console.error(`[LeadFinder] Auto-send failed for ${leadRecord.email}:`, sErr.message);
          autoSendResults.push({ id: leadRecord.id, email: leadRecord.email, success: false, error: sErr.message });
        }
      }
    }

    saveLeads(existingLeads);

    return {
      success: true,
      discovered_count: discovered.length,
      new_saved_count: newSavedLeads.length,
      leads: newSavedLeads.length > 0 ? newSavedLeads : existingLeads.slice(0, 20),
      auto_send_results: autoSendResults
    };
  }

  // ──────────────────────────────────────────────
  // Dispatch Cold Email to Specific Recruiter Lead
  // ──────────────────────────────────────────────
  async function sendLeadEmail(leadId) {
    const leads = getLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      throw new Error(`Lead ${leadId} not found`);
    }

    if (autoPilot && autoPilot.isDailyLimitReached && autoPilot.isDailyLimitReached()) {
      const stats = autoPilot.getDailyStats ? autoPilot.getDailyStats() : { count: 150, limit: 150 };
      throw new Error(`Daily send limit reached (${stats.count}/${stats.limit}). Resume tomorrow or increase limit.`);
    }

    const currentResume = getSavedResume();

    console.log(`[LeadFinder] 📤 Sending cold email to ${lead.recruiter_name} (${lead.email}) at ${lead.company_name}...`);

    const result = await sendEmailFn({
      to: lead.email,
      subject: lead.email_subject,
      body: lead.email_body,
      resumePath: currentResume.path,
      resumeOriginalName: currentResume.originalName
    });

    lead.status = 'SENT';
    lead.sent_at = new Date().toISOString();
    lead.message_id = result.messageId || null;
    saveLeads(leads);

    if (autoPilot) {
      if (autoPilot.recordDailySend) autoPilot.recordDailySend();
      if (autoPilot.markApplied) {
        autoPilot.markApplied(lead.email, lead.company_name || 'Company', lead.target_role || 'DevOps Engineer');
      }
      if (autoPilot.scheduleFollowUp) {
        autoPilot.scheduleFollowUp({
          recipient_email: lead.email,
          company_name: lead.company_name || 'Company',
          job_title: lead.target_role || 'DevOps Engineer',
          contact_person: lead.recruiter_name || 'Hiring Team',
          initial_subject: lead.email_subject || 'DevOps Engineer Application',
          initial_body: lead.email_body || ''
        });
      }
    }

    return {
      success: true,
      lead_id: lead.id,
      email: lead.email,
      message_id: result.messageId
    };
  }

  // ──────────────────────────────────────────────
  // Send Single Direct HR Contact from CSV
  // ──────────────────────────────────────────────
  async function sendDirectHRContact(contact) {
    if (!contact || !contact.email) {
      throw new Error('Invalid HR contact');
    }

    if (autoPilot && autoPilot.isDailyLimitReached && autoPilot.isDailyLimitReached()) {
      const stats = autoPilot.getDailyStats ? autoPilot.getDailyStats() : { count: 150, limit: 150 };
      throw new Error(`Daily send limit reached (${stats.count}/${stats.limit}).`);
    }

    const profile = getUserProfile();
    const currentResume = getSavedResume();
    const firstName = (contact.name || 'Hiring Leader').split(' ')[0];
    const candidateName = profile.name || 'Candidate';
    const candidateRole = profile.title || 'Software Professional';
    const candidateSkills = profile.core_skills || 'Cloud platforms, automation, CI/CD, and scalable software architecture';
    const candidatePortfolio = profile.portfolio || '';
    const candidatePhone = profile.phone || '';
    const candidateSignature = profile.signature || [
      candidateName,
      candidateRole,
      candidatePhone ? `📞 ${candidatePhone}` : '',
      candidatePortfolio ? `🌐 ${candidatePortfolio}` : '',
      profile.linkedin ? `💼 ${profile.linkedin}` : ''
    ].filter(Boolean).join('\n');

    const subject = `${candidateRole} Inquiry - ${contact.company} | ${candidateName}`;
    const body = `Hi ${firstName},

I came across your profile as ${contact.title || 'Talent Acquisition Leader'} at ${contact.company} and wanted to reach out directly regarding ${candidateRole} opportunities on your team.

My technical experience centers on ${candidateSkills}. In my recent implementations, I designed and delivered scalable software solutions that cut deployment cycles, improved infrastructure reliability, and drove engineering velocity.

I have attached my resume for your review.${candidatePortfolio ? ` You can also explore my live interactive architecture diagrams and deployed projects on my portfolio: ${candidatePortfolio}` : ''}

I would welcome the opportunity for a brief conversation to see how my hands-on background and skills could contribute to ${contact.company}.

Best regards,

${candidateSignature}`;

    const result = await sendEmailFn({
      to: contact.email,
      subject: subject,
      body: body,
      resumePath: currentResume.path,
      resumeOriginalName: currentResume.originalName
    });

    const progress = getHRProgress();
    if (!progress.sent_emails) progress.sent_emails = {};
    progress.sent_emails[contact.email] = {
      sent_at: new Date().toISOString(),
      name: contact.name,
      title: contact.title,
      company: contact.company,
      message_id: result.messageId || null,
      status: 'SENT'
    };
    saveHRProgress(progress);

    if (autoPilot) {
      if (autoPilot.recordDailySend) autoPilot.recordDailySend();
      if (autoPilot.markApplied) {
        autoPilot.markApplied(contact.email, contact.company || 'Company', candidateRole);
      }
      if (autoPilot.scheduleFollowUp) {
        autoPilot.scheduleFollowUp({
          recipient_email: contact.email,
          company_name: contact.company || 'Company',
          job_title: candidateRole,
          contact_person: contact.name,
          initial_subject: subject,
          initial_body: body
        });
      }
    }

    return {
      success: true,
      email: contact.email,
      message_id: result.messageId
    };
  }

  // ──────────────────────────────────────────────
  // ⚡ AUTONOMOUS DAILY 100 HR COLD MAIL CAMPAIGN
  // ──────────────────────────────────────────────
  async function startDaily100DevOpsCampaign({ targetCount = 100, delayMs = 3000 } = {}) {
    if (campaignState.isRunning) {
      throw new Error('An HR cold outreach campaign is already currently running.');
    }

    // 1. First check HR Contacts from CSV
    const allHR = getEnrichedHRContacts();
    const uncontactedHR = allHR.filter(c => c.status !== 'SENT');

    let batch = [];
    let isFallback = false;

    if (uncontactedHR.length > 0) {
      // Pull next batch of up to 100 HRs from CSV
      batch = uncontactedHR.slice(0, targetCount);
      campaignState.source = 'CSV_LIST';
      console.log(`[HRCampaign] 🚀 Launching daily batch of ${batch.length} HR contacts from hr_contacts.csv (${uncontactedHR.length} remaining total)...`);
    } else {
      // 2. CSV Completed! Fallback to AI Online Discovery & Curated Tech Unicorns
      isFallback = true;
      campaignState.source = 'AI_ONLINE_FALLBACK';
      const curated = getCuratedDevOpsCompanies();
      const uncontactedCurated = curated.filter(c => c.status !== 'SENT');

      if (uncontactedCurated.length === 0) {
        throw new Error('All 1,842 HR contacts from CSV AND all curated tech companies have been contacted! Reset history to re-send.');
      }

      batch = uncontactedCurated.slice(0, targetCount).map(c => ({
        name: `${c.name} Talent Acquisition Team`,
        email: c.email || `careers@${c.domain}`,
        title: 'Talent Acquisition & Technical Recruiting',
        company: c.name
      }));

      console.log(`[HRCampaign] 🔄 CSV exhausted! Falling back to AI Online / Curated Tech Unicorn database for ${batch.length} companies...`);
    }

    const profile = getUserProfile();
    const currentResume = getSavedResume();
    const candidateName = profile.name || 'Candidate';
    const candidateRole = profile.title || 'Software Professional';
    const candidateSkills = profile.core_skills || 'Cloud platforms, automation, CI/CD, and scalable software architecture';
    const candidatePortfolio = profile.portfolio || '';
    const candidatePhone = profile.phone || '';
    const candidateSignature = profile.signature || [
      candidateName,
      candidateRole,
      candidatePhone ? `📞 ${candidatePhone}` : '',
      candidatePortfolio ? `🌐 ${candidatePortfolio}` : '',
      profile.linkedin ? `💼 ${profile.linkedin}` : ''
    ].filter(Boolean).join('\n');

    campaignState = {
      isRunning: true,
      shouldStop: false,
      current: 0,
      target: batch.length,
      currentContact: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      source: isFallback ? 'AI_ONLINE_FALLBACK' : 'CSV_LIST',
      lastLog: `Starting campaign for ${batch.length} HR leaders...`,
      results: []
    };

    // Async worker execution
    (async () => {
      for (let i = 0; i < batch.length; i++) {
        if (campaignState.shouldStop) {
          campaignState.lastLog = `Campaign stopped by user at ${i}/${batch.length}.`;
          console.log('[HRCampaign] 🛑 Campaign stopped by user.');
          break;
        }

        const hr = batch[i];
        const firstName = (hr.name || 'Hiring Leader').split(' ')[0];
        campaignState.current = i + 1;
        campaignState.currentContact = `${hr.name} (${hr.company})`;
        campaignState.lastLog = `[${i + 1}/${batch.length}] Contacting ${hr.name} at ${hr.company} (${hr.email})...`;
        console.log(`[HRCampaign] [${i + 1}/${batch.length}] 🎯 Processing ${hr.name} (${hr.company})...`);

        try {
          // Check daily limit
          if (autoPilot && autoPilot.isDailyLimitReached && autoPilot.isDailyLimitReached()) {
            const stats = autoPilot.getDailyStats ? autoPilot.getDailyStats() : {};
            campaignState.lastLog = `Daily limit reached (${stats.sentToday || stats.count || 0}/${stats.limit || 500}). Campaign paused for today.`;
            console.log('[HRCampaign] 🛑 Daily limit reached.');
            break;
          }

          const emailSubject = `${candidateRole} Inquiry - ${hr.company} | ${candidateName}`;
          const emailBody = `Hi ${firstName},

I came across your role as ${hr.title || 'Talent Acquisition Leader'} at ${hr.company} and wanted to reach out directly regarding ${candidateRole} opportunities on your team.

My technical experience centers on ${candidateSkills}. In my recent implementations, I designed and delivered scalable software solutions that cut deployment cycles, improved infrastructure reliability, and drove engineering velocity.

I have attached my resume for your review.${candidatePortfolio ? ` You can also explore my live interactive architecture diagrams, infrastructure setups, and deployed projects on my portfolio: ${candidatePortfolio}` : ''}

I would welcome the opportunity for a brief conversation to see how my hands-on background and skills could contribute to ${hr.company}.

Best regards,

${candidateSignature}`;

          // Pre-send deliverability check (DNS MX verification & bounce blacklist)
          const deliverability = await validateEmailDeliverability(hr.email);
          if (!deliverability.valid) {
            console.log(`[HRCampaign] 🚫 Skipping ${hr.email} (${deliverability.reason})`);
            const progress = getHRProgress();
            if (!progress.sent_emails) progress.sent_emails = {};
            progress.sent_emails[hr.email] = {
              sent_at: new Date().toISOString(),
              name: hr.name,
              title: hr.title,
              company: hr.company,
              status: 'SKIPPED_INVALID',
              reason: deliverability.reason
            };
            saveHRProgress(progress);

            campaignState.results.push({
              name: hr.name,
              company: hr.company,
              email: hr.email,
              success: false,
              error: `Skipped: ${deliverability.reason}`,
              timestamp: new Date().toISOString()
            });
            continue;
          }

          const sendResult = await sendEmailFn({
            to: hr.email,
            subject: emailSubject,
            body: emailBody,
            resumePath: currentResume.path,
            resumeOriginalName: currentResume.originalName
          });

          // Update HR Progress
          const progress = getHRProgress();
          if (!progress.sent_emails) progress.sent_emails = {};
          progress.sent_emails[hr.email] = {
            sent_at: new Date().toISOString(),
            name: hr.name,
            title: hr.title,
            company: hr.company,
            message_id: sendResult.messageId || null,
            status: 'SENT'
          };
          saveHRProgress(progress);

          if (autoPilot) {
            if (autoPilot.recordDailySend) autoPilot.recordDailySend();
            if (autoPilot.markApplied) {
              autoPilot.markApplied(hr.email, hr.company || 'Company', candidateRole);
            }
            if (autoPilot.scheduleFollowUp) {
              autoPilot.scheduleFollowUp({
                recipient_email: hr.email,
                company_name: hr.company || 'Company',
                job_title: candidateRole,
                contact_person: hr.name,
                initial_subject: emailSubject,
                initial_body: emailBody
              });
            }
          }

          campaignState.results.push({
            name: hr.name,
            company: hr.company,
            email: hr.email,
            success: true,
            messageId: sendResult.messageId,
            timestamp: new Date().toISOString()
          });

          console.log(`[HRCampaign] ✅ [${i + 1}/${batch.length}] Successfully sent cold email to ${hr.name} at ${hr.company} (${hr.email})`);
        } catch (itemErr) {
          console.error(`[HRCampaign] ❌ Failed for ${hr.name} (${hr.company}):`, itemErr.message);
          campaignState.results.push({
            name: hr.name,
            company: hr.company,
            email: hr.email,
            success: false,
            error: itemErr.message,
            timestamp: new Date().toISOString()
          });

          if (itemErr.message.includes('550') || itemErr.message.includes('Daily user sending limit exceeded') || itemErr.message.includes('sending limit')) {
            campaignState.lastLog = `⚠️ Gmail Daily Quota Reached: Google's SMTP server reported '550 Daily user sending limit exceeded'. Google enforces a 24-hour rolling limit on free Gmail accounts. Please wait for the quota to reset tomorrow or configure an alternate sending account.`;
            console.warn(`[HRCampaign] 🛑 Halting campaign: Gmail account daily sending limit exceeded.`);
            break;
          }
        }

        // Add human jitter between automated cold emails (3s–6s)
        if (i < batch.length - 1 && !campaignState.shouldStop) {
          const jitter = Math.floor(Math.random() * 3000) + delayMs;
          await new Promise(r => setTimeout(r, jitter));
        }
      }

      campaignState.isRunning = false;
      campaignState.completedAt = new Date().toISOString();
      campaignState.lastLog = `Batch completed! Dispatched ${campaignState.results.filter(r => r.success).length} cold emails with resume attached.`;
      console.log(`[HRCampaign] 🏁 Campaign finished. Log: ${campaignState.lastLog}`);
    })();

    return {
      success: true,
      message: `Started campaign for ${batch.length} HR leaders (${campaignState.source}).`,
      target_count: batch.length,
      source: campaignState.source,
      first_contact: `${batch[0].name} (${batch[0].company})`
    };
  }

  function stopDailyCampaign() {
    if (!campaignState.isRunning) {
      return { success: false, message: 'No campaign is currently running' };
    }
    campaignState.shouldStop = true;
    return { success: true, message: 'Stopping campaign gracefully...' };
  }

  function resetHRCampaign() {
    try {
      if (fs.existsSync(hrProgressFile)) {
        fs.unlinkSync(hrProgressFile);
      }
      return { success: true, message: 'HR contacts campaign progress reset successfully' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  // ──────────────────────────────────────────────
  // Batch Dispatch Selected Leads
  // ──────────────────────────────────────────────
  async function batchSendLeads(leadIds = []) {
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      throw new Error('No lead IDs specified for batch dispatch');
    }

    const results = [];
    console.log(`[LeadFinder] ⚡ Starting batch cold outreach for ${leadIds.length} recruiter leads...`);

    for (let i = 0; i < leadIds.length; i++) {
      const id = leadIds[i];
      try {
        const res = await sendLeadEmail(id);
        results.push({ id, success: true, messageId: res.message_id });
      } catch (err) {
        console.error(`[LeadFinder] Batch send failed for lead ${id}:`, err.message);
        results.push({ id, success: false, error: err.message });
      }

      if (i < leadIds.length - 1) {
        const jitterDelay = Math.floor(Math.random() * 4000) + 3000;
        await new Promise(r => setTimeout(r, jitterDelay));
      }
    }

    return {
      total: leadIds.length,
      sent_count: results.filter(r => r.success).length,
      failed_count: results.filter(r => !r.success).length,
      results
    };
  }

  function updateLead(leadId, updates = {}) {
    const leads = getLeads();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    Object.assign(lead, updates, { updated_at: new Date().toISOString() });
    saveLeads(leads);
    return lead;
  }

  function deleteLead(leadId) {
    const leads = getLeads();
    const filtered = leads.filter(l => l.id !== leadId);
    saveLeads(filtered);
    return { success: true, deleted_id: leadId };
  }

  return {
    getLeads,
    getLeadStats,
    findRecruiterLeads,
    sendLeadEmail,
    batchSendLeads,
    updateLead,
    deleteLead,
    getCuratedDevOpsCompanies,
    getCampaignStatus,
    startDaily100DevOpsCampaign,
    stopDailyCampaign,
    resetHRCampaign,
    getHRContactsList,
    sendDirectHRContact
  };
}

module.exports = { initLeadFinder };
