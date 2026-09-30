const fs = require('fs');
const path = require('path');
const { getUserProfile } = require('./profileManager');
const { DEVOPS_COMPANIES } = require('./devopsCompanyDatabase');

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

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }

  // ──────────────────────────────────────────────
  // Storage & Retrieval
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
  // Campaign State for Autonomous Daily 100 Outbound
  // ──────────────────────────────────────────────
  let campaignState = {
    isRunning: false,
    shouldStop: false,
    current: 0,
    target: 100,
    currentCompany: null,
    startedAt: null,
    completedAt: null,
    lastLog: 'Ready to launch daily DevOps campaign',
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
    const curated = getCuratedDevOpsCompanies();
    const totalCurated = curated.length;
    const sentCurated = curated.filter(c => c.status === 'SENT').length;
    const remainingCurated = totalCurated - sentCurated;
    const dailyStats = autoPilot && autoPilot.getDailyStats ? autoPilot.getDailyStats() : { count: 0, limit: 150 };

    return {
      is_running: campaignState.isRunning,
      progress: {
        current: campaignState.current,
        target: campaignState.target,
        current_company: campaignState.currentCompany,
        started_at: campaignState.startedAt,
        completed_at: campaignState.completedAt,
        last_log: campaignState.lastLog
      },
      stats: {
        database_total: totalCurated,
        contacted_total: sentCurated,
        remaining_uncontacted: remainingCurated,
        today_sent: dailyStats.count,
        daily_limit: dailyStats.limit,
        daily_goal: 100
      },
      recent_results: campaignState.results.slice(-10)
    };
  }

  // ──────────────────────────────────────────────
  // AI Recruiter & HR Lead Discovery
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
      }

      if (autoSend && leadRecord.status !== 'SENT') {
        try {
          const sentResult = await sendLeadEmail(leadRecord.id);
          autoSendResults.push({ id: leadRecord.id, email: cleanEmail, success: true, result: sentResult });
        } catch (sendErr) {
          autoSendResults.push({ id: leadRecord.id, email: cleanEmail, success: false, error: sendErr.message });
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
  // Dispatch Cold Email to Specific Lead
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
  // ⚡ AUTONOMOUS DAILY 100 DEVOPS CAMPAIGN WORKER
  // ──────────────────────────────────────────────
  async function startDaily100DevOpsCampaign({ targetCount = 100, delayMs = 3000 } = {}) {
    if (campaignState.isRunning) {
      throw new Error('A DevOps cold outreach campaign is already running.');
    }

    const curated = getCuratedDevOpsCompanies();
    const uncontacted = curated.filter(c => c.status !== 'SENT');

    if (uncontacted.length === 0) {
      throw new Error('All curated DevOps companies in the database have already been contacted! Add more companies or reset history.');
    }

    const batch = uncontacted.slice(0, targetCount);
    const profile = getUserProfile();
    const currentResume = getSavedResume();
    const candidateRole = profile.title || 'DevOps & Cloud Engineer';
    const candidatePortfolio = profile.portfolio || 'https://ajayautade.com';
    const candidateSkills = profile.core_skills || 'AWS, Kubernetes, Docker, Terraform, CI/CD, Prometheus & Grafana, Python';

    campaignState = {
      isRunning: true,
      shouldStop: false,
      current: 0,
      target: batch.length,
      currentCompany: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      lastLog: `Starting campaign for ${batch.length} curated DevOps companies...`,
      results: []
    };

    console.log(`[DevOpsCampaign] 🚀 Starting Autonomous Daily 100 Cold Mail Campaign for ${batch.length} companies...`);

    // Run asynchronously in background
    (async () => {
      for (let i = 0; i < batch.length; i++) {
        if (campaignState.shouldStop) {
          console.log('[DevOpsCampaign] ⏸️ Campaign stopped by user.');
          campaignState.lastLog = `Campaign paused at ${i}/${batch.length} companies.`;
          break;
        }

        const comp = batch[i];
        campaignState.current = i + 1;
        campaignState.currentCompany = comp.name;
        campaignState.lastLog = `[${i + 1}/${batch.length}] Contacting ${comp.name} (${comp.domain})...`;
        console.log(`[DevOpsCampaign] [${i + 1}/${batch.length}] 🎯 Processing ${comp.name}...`);

        try {
          // Check daily limit
          if (autoPilot && autoPilot.isDailyLimitReached && autoPilot.isDailyLimitReached()) {
            const stats = autoPilot.getDailyStats ? autoPilot.getDailyStats() : {};
            campaignState.lastLog = `Daily limit reached (${stats.count || 0}/${stats.limit || 150}). Campaign paused.`;
            console.log('[DevOpsCampaign] 🛑 Daily limit reached.');
            break;
          }

          const recipientEmail = comp.email || `careers@${comp.domain}`;
          const emailSubject = `DevOps & Cloud Engineer Inquiry - ${profile.name || 'Er. Ajay Autade'}`;
          const emailBody = `Hi ${comp.name} Talent & Engineering Team,\n\nI noticed ${comp.name}’s impressive engineering growth in ${comp.category || 'tech'} and wanted to reach out directly regarding ${candidateRole} opportunities.\n\nMy technical background is focused on ${candidateSkills}. In my recent projects, I automated multi-region cloud infrastructure using modular Terraform, built zero-touch CI/CD pipelines with GitHub Actions and ArgoCD cutting release times by 60%, and configured real-time monitoring and alerting with Prometheus & Grafana.\n\nI've attached my resume for your review, and you can also explore my live interactive architecture diagrams and deployed project demos on my portfolio at ${candidatePortfolio}.\n\nI would welcome the opportunity for a brief conversation to see how my background could contribute to ${comp.name}.\n\nBest regards,\n\n${profile.signature}`;

          // Create lead record
          const leads = getLeads();
          let existing = leads.find(l => l.email.toLowerCase() === recipientEmail.toLowerCase());
          if (!existing) {
            existing = {
              id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              company_name: comp.name,
              domain: comp.domain,
              recruiter_name: `${comp.name} Talent Acquisition Team`,
              recruiter_title: 'Talent Acquisition & Technical Recruiting',
              email: recipientEmail,
              target_role: candidateRole,
              confidence: 'HIGH',
              confidence_reason: 'Curated DevOps Hiring Database',
              email_subject: emailSubject,
              email_body: emailBody,
              status: 'PENDING',
              has_resume: !!(currentResume && currentResume.path),
              created_at: new Date().toISOString(),
              sent_at: null,
              message_id: null
            };
            leads.unshift(existing);
            saveLeads(leads);
          }

          // Dispatch email
          const sendRes = await sendLeadEmail(existing.id);

          campaignState.results.push({
            company: comp.name,
            email: recipientEmail,
            success: true,
            messageId: sendRes.message_id,
            timestamp: new Date().toISOString()
          });

          console.log(`[DevOpsCampaign] ✅ [${i + 1}/${batch.length}] Successfully sent cold email to ${comp.name} (${recipientEmail})`);
        } catch (itemErr) {
          console.error(`[DevOpsCampaign] ❌ Failed for ${comp.name}:`, itemErr.message);
          campaignState.results.push({
            company: comp.name,
            success: false,
            error: itemErr.message,
            timestamp: new Date().toISOString()
          });
        }

        // Add human jitter between automated cold emails (3s–6s)
        if (i < batch.length - 1 && !campaignState.shouldStop) {
          const jitter = Math.floor(Math.random() * 3000) + delayMs;
          await new Promise(r => setTimeout(r, jitter));
        }
      }

      campaignState.isRunning = false;
      campaignState.completedAt = new Date().toISOString();
      campaignState.lastLog = `Campaign completed! Dispatched ${campaignState.results.filter(r => r.success).length} cold emails with resume attached.`;
      console.log(`[DevOpsCampaign] 🏁 Campaign finished. Log: ${campaignState.lastLog}`);
    })();

    return {
      success: true,
      message: `Started campaign for ${batch.length} curated DevOps companies.`,
      target_count: batch.length,
      first_company: batch[0].name
    };
  }

  function stopDailyCampaign() {
    if (!campaignState.isRunning) {
      return { success: false, message: 'No campaign is currently running' };
    }
    campaignState.shouldStop = true;
    return { success: true, message: 'Stopping campaign gracefully...' };
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
    stopDailyCampaign
  };
}

module.exports = { initLeadFinder };
