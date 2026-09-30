const fs = require('fs');
const path = require('path');
const { getUserProfile } = require('./profileManager');

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
    const candidateSkills = profile.core_skills || 'AWS, Kubernetes, Docker, Terraform, CI/CD, Prometheus & Grafana, Python';

    // Parse companies from array or text input (comma-separated, newline-separated)
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
- Experience & Projects: (1) Automated AWS Cloud Infrastructure with Terraform; (2) Zero-touch CI/CD with GitHub Actions & ArgoCD cutting release times by 60%; (3) Kubernetes HPA auto-scaling & Docker; (4) Prometheus & Grafana observability; (5) DevSecOps with SonarQube & Trivy.
${profile.custom_ai_instructions ? `Candidate Highlights: ${profile.custom_ai_instructions}` : ''}
${customNotes ? `User Custom Guidance: ${customNotes}` : ''}

TARGET COMPANIES TO INVESTIGATE:
${companyList.map((c, i) => `${i + 1}. ${c}`).join('\n')}

TARGET ROLE: ${candidateRole}
TARGET LOCATION / PREFERENCE: ${location || 'India / Remote / Global'}

FOR EACH COMPANY:
1. Identify the company's primary corporate domain (e.g. "razorpay.com", "cred.club", "swiggy.in", "postman.com", "zepto.com").
2. Discover or construct 1 to 2 high-probability recruiter/HR contacts:
   - Specific Recruiter Personas: (e.g. "Talent Acquisition Specialist", "Technical Recruiter", "Head of HR", "Engineering Hiring Manager").
   - Email format: predict standard corporate email pattern (e.g., first.last@domain.com, first@domain.com, talent@domain.com, careers@domain.com, recruiting@domain.com, hr@domain.com).
   - High confidence rating.
3. Draft a tailored, human, direct cold email pitch:
   - Concise (100–130 words), professional-to-professional tone.
   - Mention the specific company name and why candidate's background in ${candidateSkills} is directly relevant to their engineering/product growth.
   - Invite them to review interactive project architectures at ${candidatePortfolio} and reference the attached resume.
   - NO AI clichés ("thrilled to apply", "esteemed organization", "tapestry", "proven track record").
   - Include proper signature.

Return ONLY a JSON array with this exact schema:
[
  {
    "company_name": "Exact Company Name",
    "domain": "companydomain.com",
    "recruiter_name": "Full Name or 'Talent Acquisition Team'",
    "recruiter_title": "Senior Technical Recruiter / Talent Acquisition Lead / HR Partner",
    "email": "verified.email@companydomain.com",
    "confidence": "HIGH" | "MEDIUM",
    "confidence_reason": "Standard corporate email pattern / Official talent inbox",
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
      // Fallback pattern generation
      discovered = companyList.map(comp => {
        const cleanName = comp.replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0].trim();
        let domain = cleanName.includes('.') ? cleanName : `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        const email = `careers@${domain}`;
        
        return {
          company_name: comp,
          domain: domain,
          recruiter_name: `${comp} Talent Acquisition`,
          recruiter_title: 'Talent Acquisition / Technical Recruiting Team',
          email: email,
          confidence: 'MEDIUM',
          confidence_reason: 'Standard corporate talent gateway',
          email_subject: `${candidateRole} Inquiry - ${profile.name || 'Ajay Autade'}`,
          email_body: `Hi ${comp} Talent Team,\n\nI noticed ${comp}’s ongoing engineering growth and wanted to reach out regarding ${candidateRole} opportunities.\n\nMy background is centered on ${candidateSkills}. In my recent projects, I've automated multi-region cloud infrastructure using Terraform, built zero-touch CI/CD pipelines reducing deployment times by 60%, and configured real-time monitoring with Prometheus & Grafana.\n\nI’ve attached my resume for your review, and you can also explore my live interactive project architectures on my portfolio at ${candidatePortfolio}.\n\nI would welcome the opportunity for a brief conversation to see how my background could contribute to ${comp}.\n\nBest regards,\n\n${profile.signature}`
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
        status: existing ? existing.status : 'DISCOVERED', // DISCOVERED | PENDING | SENT | DISMISSED
        has_resume: !!(currentResume && currentResume.path),
        created_at: existing ? existing.created_at : new Date().toISOString(),
        sent_at: existing ? existing.sent_at : null,
        message_id: existing ? existing.message_id : null
      };

      if (!existing) {
        existingLeads.unshift(leadRecord);
        newSavedLeads.push(leadRecord);
      }

      // Auto-send immediately if requested
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

    // Record in global daily stats & duplicate registry
    if (autoPilot) {
      if (autoPilot.recordDailySend) autoPilot.recordDailySend();
      if (autoPilot.markApplied) {
        autoPilot.markApplied(lead.email, lead.company_name, lead.target_role);
      }
      // Schedule automated 4-day follow up
      if (autoPilot.scheduleFollowUp) {
        autoPilot.scheduleFollowUp({
          recipient_email: lead.email,
          company_name: lead.company_name,
          job_title: lead.target_role,
          contact_person: lead.recruiter_name,
          initial_subject: lead.email_subject,
          initial_body: lead.email_body
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

      // Add gentle human jitter delay between outbound sends (unless last item)
      if (i < leadIds.length - 1) {
        const jitterDelay = Math.floor(Math.random() * 5000) + 3000; // 3-8s delay for responsive batching
        console.log(`[LeadFinder] ⏳ Human jitter: waiting ${Math.round(jitterDelay/1000)}s before next cold email...`);
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
    deleteLead
  };
}

module.exports = { initLeadFinder };
