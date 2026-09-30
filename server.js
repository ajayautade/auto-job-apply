require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Multer config for screenshot uploads
const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `screenshot-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Multer config for resume uploads
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/resumes';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploadScreenshot = multer({
  storage: screenshotStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = /jpeg|jpg|png|webp|gif|bmp|heic|heif|tiff|tif/;
    const allowedMimes = /image\/(jpeg|png|webp|gif|bmp|heic|heif|tiff|avif)/;
    const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.test(file.mimetype);
    if (extname || mimetype) return cb(null, true);
    cb(new Error('Unsupported image format. Supported: JPG, PNG, WEBP, HEIC, GIF, BMP, TIFF'));
  }
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Only PDF, DOC, DOCX files are allowed'));
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multi-model candidate list for automatic fallback
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.7-flash'
];

async function generateWithFallback(contents, timeoutMs = 15000, maxRetries = 2) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[Gemini] Calling ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const apiCall = model.generateContent(contents);
        const timer = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout (${timeoutMs}ms) on ${modelName}`)), timeoutMs)
        );

        const result = await Promise.race([apiCall, timer]);
        console.log(`[Gemini] Success with ${modelName}`);
        return result;
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] Model ${modelName} failed: ${err.message}`);
      }
    }
    if (attempt < maxRetries - 1) {
      console.log(`[Gemini] ⏳ Rate limit hit on all models. Waiting 15s before retry...`);
      await new Promise(r => setTimeout(r, 15000));
    }
  }
  throw lastError;
}

function getMimeTypeForPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff'
  };
  return map[ext] || 'image/jpeg';
}

function getMimeType(file) {
  if (file.mimetype && file.mimetype !== 'application/octet-stream') {
    return file.mimetype;
  }
  return getMimeTypeForPath(file.originalname || file.path || '');
}

function parseJsonFromText(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]);
  }
  throw new Error('No valid JSON found in response: ' + text.substring(0, 100));
}

// Persistent resume state
const RESUME_STATE_FILE = path.join(__dirname, 'public/uploads/resumes/.latest_resume.json');

function getSavedResume() {
  try {
    if (fs.existsSync(RESUME_STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(RESUME_STATE_FILE, 'utf8'));
      if (data.path && fs.existsSync(data.path)) {
        return data;
      }
    }
    const resumeDir = path.join(__dirname, 'public/uploads/resumes');
    if (fs.existsSync(resumeDir)) {
      const files = fs.readdirSync(resumeDir)
        .filter(f => !f.startsWith('.'))
        .map(f => ({ file: f, mtime: fs.statSync(path.join(resumeDir, f)).mtime }))
        .sort((a, b) => b.mtime - a.mtime);
      if (files.length > 0) {
        const latestFile = files[0].file;
        const filePath = path.join(resumeDir, latestFile);
        return {
          path: filePath,
          originalName: 'AjayAutadeDevopsResume-9545034120.pdf'
        };
      }
    }
  } catch (e) {}
  return { path: null, originalName: null };
}

function saveResumeState(filePath, originalName) {
  try {
    const dir = path.dirname(RESUME_STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(RESUME_STATE_FILE, JSON.stringify({ path: filePath, originalName }));
  } catch (e) {}
}

function clearResumeState() {
  try {
    if (fs.existsSync(RESUME_STATE_FILE)) {
      fs.unlinkSync(RESUME_STATE_FILE);
    }
  } catch (e) {}
}

// ──────────────────────────────────────────────
// API: Upload Resume
// ──────────────────────────────────────────────
app.post('/api/upload-resume', (req, res) => {
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }
    saveResumeState(req.file.path, req.file.originalname);
    res.json({
      success: true,
      filename: req.file.originalname,
      message: 'Resume uploaded successfully'
    });
  });
});

// ──────────────────────────────────────────────
// API: Remove Resume
// ──────────────────────────────────────────────
app.post('/api/remove-resume', (req, res) => {
  clearResumeState();
  res.json({ success: true, message: 'Resume removed' });
});

const { getUserProfile, saveUserProfile, ROLE_PRESETS } = require('./profileManager');

async function draftPersonalizedEmail(jobData, resumeInfo) {
  const profile = getUserProfile();

  const greetingTarget = jobData.contact_person && jobData.contact_person !== 'null' && jobData.contact_person !== 'Hiring Manager'
    ? `Hi ${jobData.contact_person.split(' ')[0]},`
    : (jobData.company_name && jobData.company_name !== 'null' ? `Hi ${jobData.company_name} Team,` : 'Hi there,');

  const candidateRole = profile.title || 'DevOps & Cloud Engineer';
  const candidateSkills = profile.core_skills || 'AWS, Kubernetes, Docker, Terraform, CI/CD (GitHub Actions, ArgoCD, Jenkins), Prometheus & Grafana, Python, Linux';
  const candidatePortfolio = profile.portfolio || 'https://ajayautade.com';
  const customAiContext = profile.custom_ai_instructions ? `CANDIDATE CUSTOM CONTEXT & VERIFIED ACHIEVEMENTS:\n${profile.custom_ai_instructions}\n` : '';
  const customPromptRules = profile.custom_prompt_rules ? `CUSTOM PROMPT RULES:\n${profile.custom_prompt_rules}\n` : '';

  const emailPrompt = `You are a talented, real-world professional (${profile.name || 'Ajay Autade'}, ${candidateRole}) writing a highly personalized, authentic, and direct job outreach email to a hiring team / recruiter.

CANDIDATE PROFILE & VERIFIED PORTFOLIO (Live at ${candidatePortfolio}):
- Name: ${profile.name || 'Er. Ajay Autade'}
- Role: ${candidateRole}
- Portfolio Website: ${candidatePortfolio} (recruiter can review live interactive architecture diagrams & live deployed projects)
- Verified Hands-On Experience & Project Accomplishments:
  * Cloud & IaC: Multi-region AWS Cloud Infrastructure (VPC, EC2, S3, IAM, NAT) automated end-to-end with modular Terraform.
  * Container Orchestration: Docker containerization with multi-stage builds; Kubernetes deployments with Horizontal Pod Autoscaling (HPA, 2-10 pods) and ingress routing.
  * CI/CD & GitOps: Built zero-touch CI/CD pipelines via GitHub Actions, Jenkins, and ArgoCD — reducing release cycle times by 60% (from 45m to 8m).
  * Observability & SRE: Proactive monitoring using Prometheus metrics scraping, Alertmanager alerts, and custom Grafana health dashboards.
  * DevSecOps: Automated vulnerability scanning using Trivy and static code security quality gates with SonarQube.
  * Backend & Automation: Python (Flask/FastAPI REST APIs, automation scripts), Bash scripting for Linux sysadmin tasks.

JOB DETAILS FROM POSTING:
- Company: ${jobData.company_name || 'the team'}
- Position: ${jobData.job_title || profile.title || 'Open Position'}
- Key Requirements: ${(jobData.key_requirements || []).join(', ') || 'Cloud / Software Engineering'}
- Key Skills: ${(jobData.key_skills || []).join(', ') || 'DevOps, Cloud, Automation'}
- Contact Person: ${jobData.contact_person || ''}
${customAiContext}${customPromptRules}

MANDATORY INSTRUCTIONS FOR DYNAMIC PERSONALIZATION:
1. DYNAMIC SKILL & PROJECT MATCHING (CRITICAL):
   - Analyze the recruiter's exact Key Requirements and Key Skills.
   - Pick the TOP 2-3 specific candidate skills/projects that directly solve what this company needs:
     * If AWS / Terraform: Highlight multi-region Terraform IaC and automated cloud provisioning.
     * If Kubernetes / Docker: Highlight containerizing microservices and Kubernetes auto-scaling (HPA).
     * If CI/CD / Automation / Jenkins / ArgoCD: Highlight zero-touch GitOps deployment pipelines cutting release time by 60%.
     * If Monitoring / Prometheus / Grafana / SRE: Highlight real-time metric tracking and custom Grafana dashboards.
     * If DevSecOps / Security: Highlight container scanning with Trivy and SonarQube gates.
     * If Python / Scripting / APIs: Highlight Python automation scripts and REST APIs.
2. DIVERSE & NATURAL OPENING (NO REPETITIVE FORMULAS):
   - DO NOT start every email with "I saw your opening for X and wanted to reach out directly". Vary the opening hook naturally based on the role and company context:
     * Hook Example A: "I noticed ${jobData.company_name || 'your team'} is looking for a ${jobData.job_title || 'DevOps Engineer'} to help scale [specific tech from requirements], and wanted to connect."
     * Hook Example B: "Given ${jobData.company_name || 'your team'}'s focus on [specific requirement e.g. AWS reliability / Kubernetes automation], my background in [matching skill A] and [matching skill B] aligns directly with your goals."
     * Hook Example C: "I came across the ${jobData.job_title || 'opening'} at ${jobData.company_name || 'your company'} and wanted to reach out regarding how I can contribute to your [infrastructure / engineering] initiatives."
3. CANDIDATE PORTFOLIO REFERENCE:
   - Naturally mention that interactive architecture diagrams and live projects can be explored on the portfolio at ${candidatePortfolio}, alongside the attached resume.
4. TONE & ANTI-AI RULES:
   - Talk engineer-to-recruiter / professional-to-professional: confident, crisp, direct, and approachable.
   - Absolutely NO robotic clichés ("I am writing to express my enthusiastic interest", "proven track record", "invaluable asset", "esteemed organization", "furthermore", "moreover").
   - Length: 2 to 3 compact paragraphs (around 100-140 words total). Scannable in 15 seconds.
5. SIGNATURE:
   - End with a clean sign-off ("Best,", "Thanks,", or "Best regards,") followed by the exact signature below.

MANDATORY SIGNATURE BLOCK (Place at the end):
${profile.signature}

Return ONLY valid JSON in this format:
{
  "subject": "${jobData.job_title ? `${jobData.job_title} Application` : (profile.title ? `${profile.title} Application` : 'Job Application')} - ${profile.name}",
  "body": "Natural, dynamic, tailored email body ending with the exact signature block"
}`;

  const promptContents = [emailPrompt];

  // Feed candidate resume PDF as context to AI for deep personalization
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
        console.log('[Gemini] Feeding candidate resume PDF as context to AI for deep personalization...');
      }
    } catch (e) {
      console.warn('[Gemini] Could not load resume for AI context:', e.message);
    }
  }

  try {
    const emailResult = await generateWithFallback(promptContents);
    const emailText = emailResult.response.text();
    return parseJsonFromText(emailText);
  } catch (emailErr) {
    console.warn('Email generation failed or could not be parsed, using fallback draft:', emailErr.message);
    const fallbackGreeting = jobData.contact_person && jobData.contact_person !== 'null' && jobData.contact_person !== 'Hiring Manager'
      ? `Hi ${jobData.contact_person.split(' ')[0]},`
      : (jobData.company_name && jobData.company_name !== 'null' ? `Hi ${jobData.company_name} Team,` : 'Hi there,');

    const primarySkill = (jobData.key_skills && jobData.key_skills[0]) || 'AWS cloud automation and Kubernetes';
    const secondarySkill = (jobData.key_skills && jobData.key_skills[1]) || 'CI/CD pipeline optimization';

    return {
      subject: `${jobData.job_title ? `${jobData.job_title} Application` : (profile.title ? `${profile.title} Application` : 'Job Application')} - ${profile.name}`,
      body: `${fallbackGreeting}\n\nI noticed ${jobData.company_name || 'your team'} is looking for a ${jobData.job_title || profile.title || 'DevOps Engineer'} and wanted to reach out directly.\n\nMy background focuses on ${primarySkill} and ${secondarySkill}. In my recent projects, I've automated multi-region cloud infrastructure using Terraform, built zero-touch CI/CD pipelines cutting deployment cycles by 60%, and configured real-time monitoring with Prometheus & Grafana.\n\nI've attached my resume for reference, and you can also explore my live project architectures on my portfolio at ${candidatePortfolio}. I'd love to connect for a brief chat to see how I can add value to your team.\n\nBest,\n\n${profile.signature}`
    };
  }
}

// ──────────────────────────────────────────────
// Helper: Send Email with Attachments
// ──────────────────────────────────────────────
async function sendEmailHelper({ to, subject, body, cc, bcc, resumePath, resumeOriginalName }) {
  const profile = getUserProfile();
  if (!to || !subject || !body) {
    throw new Error('Missing required fields: to, subject, body');
  }

  if (!process.env.GMAIL_USER || process.env.GMAIL_USER === 'your_email@gmail.com') {
    throw new Error('Please configure GMAIL_USER in .env file');
  }

  if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === 'your_16_char_app_password') {
    throw new Error('Please configure GMAIL_APP_PASSWORD in .env file');
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  // Build mail options with formatted HTML and clickable signature links
  const formattedHtml = body
    .replace(/\n/g, '<br>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" style="color: #6366f1; text-decoration: underline;">$1</a>')
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" style="color: #6366f1; text-decoration: underline;">$1</a>');

  const mailOptions = {
    from: `"${process.env.YOUR_NAME || 'Er. Ajay Autade'}" <${process.env.GMAIL_USER}>`,
    to: to,
    subject: subject,
    text: body,
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b;">${formattedHtml}</div>`
  };

  if (cc) mailOptions.cc = cc;
  if (bcc) mailOptions.bcc = bcc;

  // Attach resume
  const currentResume = resumePath ? { path: resumePath, originalName: resumeOriginalName } : getSavedResume();
  if (currentResume.path && fs.existsSync(currentResume.path)) {
    mailOptions.attachments = [{
      filename: currentResume.originalName || 'AjayAutadeDevopsResume-9545034120.pdf',
      path: currentResume.path
    }];
  }

  return await transporter.sendMail(mailOptions);
}

// ──────────────────────────────────────────────
// Initialize Auto-Pilot Folder Watcher
// ──────────────────────────────────────────────
const { initAutoPilot } = require('./autoPilot');

const autoPilot = initAutoPilot({
  watchDir: path.resolve(process.env.WATCH_FOLDER || './auto_jobs'),
  generateWithFallback,
  parseJsonFromText,
  getSavedResume,
  draftPersonalizedEmail,
  sendEmailFn: sendEmailHelper,
  getMimeTypeForPath
});

// ──────────────────────────────────────────────
// API: Analyze Screenshot(s) with Gemini & Check Duplicate
// ──────────────────────────────────────────────
app.post('/api/analyze', (req, res) => {
  uploadScreenshot.any()(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      const files = req.files || [];
      if (files.length === 0 && req.file) {
        files.push(req.file);
      }

      if (files.length === 0) {
        return res.status(400).json({ error: 'No screenshot file(s) uploaded' });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
        return res.status(400).json({ error: 'Please set your GEMINI_API_KEY in the .env file' });
      }

      console.log(`[Gemini] Processing ${files.length} screenshot(s) for job analysis...`);

      const screenshotParts = files.map(file => {
        const imageData = fs.readFileSync(file.path);
        const base64Image = imageData.toString('base64');
        const mimeType = getMimeType(file);
        return {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        };
      });

      // Use Gemini to analyze the screenshot(s)
      const prompt = `You are analyzing ${files.length > 1 ? `${files.length} screenshots of a single continuous job posting` : 'a screenshot of a job posting'}. Synthesize and combine all information across ALL provided screenshots and extract the following in JSON format:

{
  "company_name": "The company name",
  "job_title": "The job title/position",
  "job_description_summary": "A concise 2-3 sentence summary of the role",
  "key_requirements": ["requirement1", "requirement2"],
  "key_skills": ["skill1", "skill2"],
  "contact_email": "The email address mentioned for applications (search every corner of ALL screenshots for HR email, recruiter email, contact email, apply-to email)",
  "contact_phone": "The recruiter/HR mobile phone number or WhatsApp number if mentioned (e.g. 10-digit number like 9545034120, +91 9876543210, etc.), otherwise null",
  "contact_person": "Name of the hiring manager/HR person/recruiter if mentioned",
  "location": "Job location if mentioned",
  "job_type": "Full-time/Part-time/Contract/Remote etc.",
  "experience_required": "Years of experience if mentioned",
  "salary_range": "Salary if mentioned, otherwise null",
  "application_deadline": "Deadline if mentioned, otherwise null"
}

IMPORTANT: 
- Scan EVERY screenshot carefully for any email address AND any recruiter mobile/phone/WhatsApp number. Look in header, body, footer, contact sections.
- If no email is found, set contact_email to null.
- If no phone number is found, set contact_phone to null.
- Merge key requirements and skills from all images.
- Return ONLY valid JSON, no markdown formatting.`;

      const result = await generateWithFallback([
        prompt,
        ...screenshotParts
      ]);

      const responseText = result.response.text();

      // Parse JSON from response
      let jobData;
      try {
        jobData = parseJsonFromText(responseText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini response:', responseText);
        return res.status(500).json({
          error: 'Failed to parse AI response',
          raw_response: responseText
        });
      }

      // Clean up uploaded screenshot files
      files.forEach(f => fs.unlink(f.path, () => {}));

      const currentResume = getSavedResume();

      // Draft personalized email using resume context
      const emailDraft = await draftPersonalizedEmail(jobData, currentResume);

      // WhatsApp recruiter draft & lead shortlisting if phone is detected
      let whatsAppLead = null;
      if (jobData.contact_phone && autoPilot && autoPilot.shortlistWhatsAppLead) {
        try {
          const waDraft = await autoPilot.draftWhatsAppPitch(jobData, currentResume);
          whatsAppLead = autoPilot.shortlistWhatsAppLead({
            phone_number: jobData.contact_phone,
            company_name: jobData.company_name,
            job_title: jobData.job_title,
            contact_person: jobData.contact_person,
            message_draft: waDraft,
            source: 'MANUAL',
            has_email: !!jobData.contact_email,
            contact_email: jobData.contact_email
          });
        } catch (waErr) {
          console.warn('[Manual Mode] Failed to draft WhatsApp message:', waErr.message);
        }
      }

      // Smart role-aware duplicate detection check
      let duplicateInfo = null;
      if (autoPilot && autoPilot.isDuplicate && jobData.contact_email) {
        duplicateInfo = autoPilot.isDuplicate(
          jobData.contact_email,
          jobData.job_title || 'DevOps Position',
          jobData.company_name || ''
        );
        if (duplicateInfo) {
          console.log(`[Manual Mode] ⚠️ Duplicate application detected for ${duplicateInfo.email} (${duplicateInfo.matchedRole || jobData.job_title} at ${duplicateInfo.matchedCompany || jobData.company_name})`);
        }
      }

      const userDetails = {
        name: process.env.YOUR_NAME || 'Er. Ajay Autade',
        email: process.env.YOUR_EMAIL || process.env.GMAIL_USER || 'ajayautade2@gmail.com',
        phone: process.env.YOUR_PHONE || '+91 9545034120',
        linkedin: process.env.YOUR_LINKEDIN || '',
        github: process.env.YOUR_GITHUB || '',
        portfolio: process.env.YOUR_PORTFOLIO || ''
      };

      res.json({
        success: true,
        job_data: jobData,
        email_draft: emailDraft,
        whats_app_lead: whatsAppLead,
        user_details: userDetails,
        has_resume: !!currentResume.path,
        duplicate_info: duplicateInfo ? {
          is_duplicate: true,
          email: duplicateInfo.email,
          matchedRole: duplicateInfo.matchedRole,
          matchedCompany: duplicateInfo.matchedCompany,
          timestamp: duplicateInfo.timestamp
        } : null
      });

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze screenshot',
        details: error.message
      });
    }
  });
});

// ──────────────────────────────────────────────
// API: Regenerate Email Draft (using resume context)
// ──────────────────────────────────────────────
app.post('/api/regenerate-email', async (req, res) => {
  try {
    const { job_data } = req.body;
    if (!job_data) {
      return res.status(400).json({ error: 'Missing job_data' });
    }
    const currentResume = getSavedResume();
    const emailDraft = await draftPersonalizedEmail(job_data, currentResume);
    res.json({
      success: true,
      email_draft: emailDraft
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to regenerate email', details: err.message });
  }
});

// ──────────────────────────────────────────────
// API: Check Duplicate Status (Live check for UI)
// ──────────────────────────────────────────────
app.post('/api/check-duplicate', (req, res) => {
  try {
    const { email, job_title, company_name } = req.body;
    if (!email) {
      return res.json({ is_duplicate: false, duplicate_info: null });
    }

    const duplicateMatch = autoPilot && autoPilot.isDuplicate
      ? autoPilot.isDuplicate(email, job_title || '', company_name || '')
      : null;

    res.json({
      is_duplicate: !!duplicateMatch,
      duplicate_info: duplicateMatch
    });
  } catch (err) {
    res.json({ is_duplicate: false, duplicate_info: null });
  }
});

// ──────────────────────────────────────────────
// API: Send Email (Manual trigger from UI with Duplicate Protection)
// ──────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, cc, bcc, job_title, company_name, force_resend } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
    }

    // Smart Duplicate Prevention Guard
    if (!force_resend && autoPilot && autoPilot.isDuplicate) {
      const duplicateMatch = autoPilot.isDuplicate(to, job_title || subject, company_name || '');
      if (duplicateMatch) {
        const sentDate = duplicateMatch.timestamp ? new Date(duplicateMatch.timestamp).toLocaleString() : 'previously';
        console.warn(`[Manual Mode] 🚫 Blocked duplicate send attempt to ${duplicateMatch.email} for "${duplicateMatch.matchedRole || job_title || subject}"`);
        return res.status(409).json({
          error: `Duplicate Application Blocked: An email was already sent to ${duplicateMatch.email} for "${duplicateMatch.matchedRole || job_title || subject}" at "${duplicateMatch.matchedCompany || company_name || 'Company'}" on ${sentDate}.`,
          is_duplicate: true,
          duplicate_info: duplicateMatch
        });
      }
    }

    const info = await sendEmailHelper({ to, subject, body, cc, bcc });

    try {
      const appliedRole = job_title || subject;
      const appliedCompany = company_name || 'Manual Application';
      
      if (autoPilot && autoPilot.markApplied) {
        autoPilot.markApplied(to, { company_name: appliedCompany, job_title: appliedRole });
      }

      if (autoPilot && autoPilot.recordDailySend) {
        autoPilot.recordDailySend(to, appliedRole, appliedCompany);
      }

      if (autoPilot && autoPilot.scheduleFollowUp) {
        autoPilot.scheduleFollowUp({
          contact_email: to,
          company_name: appliedCompany,
          job_title: appliedRole,
          original_subject: subject,
          original_sent_at: new Date().toISOString()
        });
      }

      if (autoPilot && autoPilot.saveHistory) {
        const currentResume = getSavedResume();
        autoPilot.saveHistory({
          id: `manual-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: 'SENT',
          company_name: appliedCompany,
          job_title: appliedRole,
          contact_email: to,
          subject: subject,
          body: body,
          has_resume: !!currentResume.path,
          resume_name: currentResume.originalName || null,
          files: ['manual_upload.png'],
          auto_deleted: false
        });
      }
    } catch (e) {
      console.error('[Manual Mode] Failed to record in registry/history/follow-ups:', e.message);
    }

    res.json({
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// ──────────────────────────────────────────────
// API: Auto-Pilot Endpoints
// ──────────────────────────────────────────────
app.get('/api/autopilot/status', (req, res) => {
  res.json({
    active: true,
    watchDir: autoPilot.watchDir,
    history: autoPilot.getHistory(),
    dailyStats: autoPilot.getDailyStats ? autoPilot.getDailyStats() : null
  });
});

app.get('/api/autopilot/history', (req, res) => {
  res.json({
    history: autoPilot.getHistory()
  });
});

app.get('/api/autopilot/daily-stats', (req, res) => {
  res.json(autoPilot.getDailyStats ? autoPilot.getDailyStats() : { sentToday: 0, limit: 40 });
});

app.post('/api/autopilot/daily-limit', (req, res) => {
  const { limit } = req.body;
  const updated = autoPilot.setCustomDailyLimit ? autoPilot.setCustomDailyLimit(limit) : null;
  res.json({ success: true, dailyStats: updated });
});

app.post('/api/autopilot/scan', (req, res) => {
  autoPilot.scanNow();
  res.json({ success: true, message: 'Scan initiated' });
});

app.post('/api/autopilot/clear-history', (req, res) => {
  autoPilot.clearHistory();
  res.json({ success: true, message: 'History cleared' });
});

// ──────────────────────────────────────────────
// API: Smart Follow-Up Cadence Endpoints
// ──────────────────────────────────────────────
app.get('/api/followups', (req, res) => {
  const list = autoPilot.getFollowUps ? autoPilot.getFollowUps() : [];
  res.json({ success: true, followUps: list });
});

app.post('/api/followups/schedule', (req, res) => {
  const { contact_email, company_name, job_title, original_subject } = req.body;
  if (!contact_email) return res.status(400).json({ error: 'Missing contact_email' });

  const scheduled = autoPilot.scheduleFollowUp({
    contact_email,
    company_name,
    job_title,
    original_subject
  });
  res.json({ success: true, followUp: scheduled });
});

app.post('/api/followups/:id/send-now', async (req, res) => {
  try {
    const result = await autoPilot.sendFollowUpNow(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/followups/:id/reply', (req, res) => {
  const success = autoPilot.markFollowUpReplied(req.params.id);
  res.json({ success, message: success ? 'Marked as replied' : 'Not found' });
});

app.post('/api/followups/:id/cancel', (req, res) => {
  const success = autoPilot.cancelFollowUp(req.params.id);
  res.json({ success, message: success ? 'Follow-up cancelled' : 'Not found' });
});

app.post('/api/followups/process-due', async (req, res) => {
  try {
    await autoPilot.processDueFollowUps();
    res.json({ success: true, message: 'Processed due follow-ups' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// API: WhatsApp Recruiter Outreach Endpoints
// ──────────────────────────────────────────────
app.get('/api/whatsapp/leads', (req, res) => {
  const list = autoPilot.getWhatsAppLeads ? autoPilot.getWhatsAppLeads() : [];
  res.json({ success: true, leads: list });
});

app.post('/api/whatsapp/leads/:id/sent', (req, res) => {
  const updated = autoPilot.markWhatsAppLeadSent ? autoPilot.markWhatsAppLeadSent(req.params.id) : null;
  res.json({ success: !!updated, lead: updated });
});

app.post('/api/whatsapp/leads/:id/dismiss', (req, res) => {
  const updated = autoPilot.dismissWhatsAppLead ? autoPilot.dismissWhatsAppLead(req.params.id) : null;
  res.json({ success: !!updated, lead: updated });
});

app.put('/api/whatsapp/leads/:id', (req, res) => {
  const updated = autoPilot.updateWhatsAppLead ? autoPilot.updateWhatsAppLead(req.params.id, req.body) : null;
  res.json({ success: !!updated, lead: updated });
});

app.post('/api/whatsapp/generate-message', async (req, res) => {
  try {
    const { job_data } = req.body;
    if (!job_data) return res.status(400).json({ error: 'Missing job_data' });
    const currentResume = getSavedResume();
    const draft = await autoPilot.draftWhatsAppPitch(job_data, currentResume);
    res.json({ success: true, message: draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────
// API: Profile & AI Persona Configuration
// ──────────────────────────────────────────────
app.get('/api/profile', (req, res) => {
  try {
    const profile = getUserProfile();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile', details: err.message });
  }
});

app.post('/api/profile', (req, res) => {
  try {
    const updated = saveUserProfile(req.body);
    res.json({
      success: true,
      message: 'Profile & AI Persona saved successfully',
      profile: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile', details: err.message });
  }
});

app.get('/api/profile/presets', (req, res) => {
  res.json({ success: true, presets: ROLE_PRESETS });
});

// ──────────────────────────────────────────────
// API: Get user settings
// ──────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const currentResume = getSavedResume();
  const profile = getUserProfile();
  res.json({
    name: profile.name || process.env.YOUR_NAME || '',
    email: profile.email || process.env.YOUR_EMAIL || process.env.GMAIL_USER || '',
    phone: profile.phone || process.env.YOUR_PHONE || '',
    linkedin: profile.linkedin || process.env.YOUR_LINKEDIN || '',
    github: profile.github || process.env.YOUR_GITHUB || '',
    portfolio: profile.portfolio || process.env.YOUR_PORTFOLIO || '',
    profile: profile,
    has_resume: !!currentResume.path,
    resume_name: currentResume.originalName || null,
    watch_folder: autoPilot.watchDir,
    gemini_configured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    gmail_configured: !!(process.env.GMAIL_USER && process.env.GMAIL_USER !== 'your_email@gmail.com' &&
                         process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'your_16_char_app_password')
  });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler — prevents server crashes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Job Apply AI is running at http://localhost:${PORT}`);
  console.log(`\n📋 Setup Checklist:`);
  console.log(`   ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? '✅' : '❌'} Gemini API Key`);
  console.log(`   ${process.env.GMAIL_USER && process.env.GMAIL_USER !== 'your_email@gmail.com' ? '✅' : '❌'} Gmail User`);
  console.log(`   ${process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'your_16_char_app_password' ? '✅' : '❌'} Gmail App Password`);
  console.log(`   📂 Auto-Pilot Watch Folder: ${autoPilot.watchDir}`);
  console.log(`\n💡 Get your Gemini API key at: https://aistudio.google.com/apikey`);
  console.log(`💡 Get Gmail App Password at: https://myaccount.google.com/apppasswords\n`);
});
