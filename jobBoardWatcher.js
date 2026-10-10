const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getUserProfile } = require('./profileManager');
const { validateEmailDeliverability, isEmailBounced } = require('./bounceManager');

// ═════════════════════════════════════════════════════════════════════
// 🌐 Job Board Watcher & Automated ATS Job Sourcing Engine
// Slices live DevOps, Cloud, SRE & Platform jobs from Greenhouse, 
// Ashby, Lever, Remotive, and Jobicy with ATS match scoring.
// ═════════════════════════════════════════════════════════════════════

function initJobBoardWatcher({
  watchDir,
  generateWithFallback,
  parseJsonFromText,
  getSavedResume,
  sendEmailFn,
  autoPilot
}) {
  const rootDir = watchDir || path.resolve('./auto_jobs');
  const jobsFile = path.join(rootDir, 'live_jobs.json');

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }

  // ──────────────────────────────────────────────
  // Target ATS Boards Registry
  // ──────────────────────────────────────────────
  const ATS_BOARDS = {
    greenhouse: [
      { name: 'Stripe', slug: 'stripe', domain: 'stripe.com', category: 'Payments & Global Cloud Infrastructure' },
      { name: 'Datadog', slug: 'datadog', domain: 'datadoghq.com', category: 'Observability & Cloud Systems' },
      { name: 'GitLab', slug: 'gitlab', domain: 'gitlab.com', category: 'DevOps & CI/CD Platform' },
      { name: 'Elastic', slug: 'elastic', domain: 'elastic.co', category: 'Search & Cloud Infra' },
      { name: 'Canonical', slug: 'canonical', domain: 'canonical.com', category: 'Linux & Kubernetes Cloud' },
      { name: 'Cloudflare', slug: 'cloudflare', domain: 'cloudflare.com', category: 'Edge Cloud & Security' },
      { name: 'MongoDB', slug: 'mongodb', domain: 'mongodb.com', category: 'Cloud Database Platform' },
      { name: 'Okta', slug: 'okta', domain: 'okta.com', category: 'Cloud Identity & DevSecOps' },
      { name: 'Reddit', slug: 'reddit', domain: 'reddit.com', category: 'High-Scale Infrastructure' },
      { name: 'Samsara', slug: 'samsara', domain: 'samsara.com', category: 'IoT & Cloud Systems' },
      { name: 'Instacart', slug: 'instacart', domain: 'instacart.com', category: 'Cloud & Kubernetes SRE' },
      { name: 'InMobi', slug: 'inmobi', domain: 'inmobi.com', category: 'AdTech & Big Data Infra' },
      { name: 'New Relic', slug: 'newrelic', domain: 'newrelic.com', category: 'Cloud Observability' },
      { name: 'PagerDuty', slug: 'pagerduty', domain: 'pagerduty.com', category: 'Incident Response & Ops' },
      { name: 'Twilio', slug: 'twilio', domain: 'twilio.com', category: 'Cloud Communications' },
      { name: 'Snyk', slug: 'snyk', domain: 'snyk.io', category: 'DevSecOps & Cloud Security' },
      { name: 'Dynatrace', slug: 'dynatrace', domain: 'dynatrace.com', category: 'Application Performance & SRE' },
      { name: 'Airbnb', slug: 'airbnb', domain: 'airbnb.com', category: 'Consumer Cloud Platform' },
      { name: 'Pinterest', slug: 'pinterest', domain: 'pinterest.com', category: 'Media Cloud & Big Data' },
      { name: 'Lyft', slug: 'lyft', domain: 'lyft.com', category: 'Distributed Systems & Cloud' }
    ],
    ashby: [
      { name: 'Supabase', slug: 'supabase', domain: 'supabase.com', category: 'Open Source Cloud Backend' },
      { name: 'Sentry', slug: 'sentry', domain: 'sentry.io', category: 'Developer Observability & SRE' },
      { name: 'Ramp', slug: 'ramp', domain: 'ramp.com', category: 'FinTech Platform Infrastructure' },
      { name: 'Linear', slug: 'linear', domain: 'linear.app', category: 'Developer Tools' }
    ],
    lever: [
      { name: 'Spotify', slug: 'spotify', domain: 'spotify.com', category: 'Streaming & Cloud Platform' },
      { name: 'Deliveroo', slug: 'deliveroo', domain: 'deliveroo.co.uk', category: 'Logistics & Cloud SRE' }
    ]
  };

  // ──────────────────────────────────────────────
  // Load Company Directory from top_400 CSV for Enrichment
  // ──────────────────────────────────────────────
  let companyDirectory = new Map();
  function loadCompanyDirectory() {
    try {
      const csvPath = path.join(process.cwd(), 'top_400_it_companies_india.csv');
      if (fs.existsSync(csvPath)) {
        const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 4) {
            const name = parts[0].replace(/^["\s]+|["\s]+$/g, '');
            const domain = parts[1].replace(/^["\s]+|["\s]+$/g, '').toLowerCase();
            const careersEmail = parts[2].replace(/^["\s]+|["\s]+$/g, '');
            const hrEmail = parts[3].replace(/^["\s]+|["\s]+$/g, '');
            const category = parts[4] ? parts[4].replace(/^["\s]+|["\s]+$/g, '') : 'Tech';
            const hq = parts[5] ? parts[5].replace(/^["\s]+|["\s]+$/g, '') : 'India';

            const record = { name, domain, careersEmail, hrEmail, category, hq };
            companyDirectory.set(domain, record);
            companyDirectory.set(name.toLowerCase(), record);
          }
        }
      }
    } catch (e) {
      console.warn('[JobWatcher] Could not load top_400 CSV directory:', e.message);
    }
  }
  loadCompanyDirectory();

  // ──────────────────────────────────────────────
  // Read & Save Live Jobs
  // ──────────────────────────────────────────────
  function getStoredJobs() {
    try {
      if (fs.existsSync(jobsFile)) {
        return JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
      }
    } catch (e) {
      console.warn('[JobWatcher] Warning reading live_jobs.json:', e.message);
    }
    return [];
  }

  function saveStoredJobs(jobs) {
    try {
      const tmp = `${jobsFile}.tmp.${process.pid}.${Date.now()}`;
      fs.writeFileSync(tmp, JSON.stringify(jobs, null, 2), 'utf8');
      fs.renameSync(tmp, jobsFile);
    } catch (e) {
      console.error('[JobWatcher] Failed to save live_jobs.json:', e.message);
    }
  }

  // ──────────────────────────────────────────────
  // Persistent Metadata & Daily Refresh Schedule
  // ──────────────────────────────────────────────
  const metaFile = path.join(rootDir, 'live_jobs_meta.json');

  function getJobsMeta() {
    try {
      if (fs.existsSync(metaFile)) {
        return JSON.parse(fs.readFileSync(metaFile, 'utf8'));
      }
    } catch (e) {}
    return {
      last_scanned_at: null,
      total_scanned: 0,
      new_jobs_found: 0,
      last_scan_status: null
    };
  }

  function saveJobsMeta(meta) {
    try {
      const tmp = `${metaFile}.tmp.${process.pid}.${Date.now()}`;
      fs.writeFileSync(tmp, JSON.stringify(meta, null, 2), 'utf8');
      fs.renameSync(tmp, metaFile);
    } catch (e) {
      console.error('[JobWatcher] Failed to save live_jobs_meta.json:', e.message);
    }
  }

  function isDailyRefreshDue() {
    const meta = getJobsMeta();
    if (!meta.last_scanned_at) return true;
    const elapsed = Date.now() - new Date(meta.last_scanned_at).getTime();
    return elapsed >= 24 * 60 * 60 * 1000; // 24 hours
  }

  function getLastScannedAt() {
    return getJobsMeta().last_scanned_at;
  }

  // ──────────────────────────────────────────────
  // DevOps Job Relevancy Filter & ATS Matcher
  // ──────────────────────────────────────────────
  const DEVOPS_TITLE_REGEX = /\b(devops|cloud|sre|site reliability|platform|infrastructure|kubernetes|ci\/cd|terraform|systems engineer|devsecops|gitops|release engineer|automation engineer)\b/i;
  const EXCLUDE_TITLE_REGEX = /\b(sales|account executive|recruiter|marketing|finance|legal|counsel|intern|internship|curator|designer|content|product manager|business development)\b/i;

  const CORE_SKILLS = [
    { name: 'AWS', regex: /\baws\b|amazon web services/i, weight: 8 },
    { name: 'Kubernetes', regex: /\bkubernetes\b|\bk8s\b|\beks\b/i, weight: 9 },
    { name: 'Terraform', regex: /\bterraform\b|\biac\b/i, weight: 8 },
    { name: 'Docker', regex: /\bdocker\b|\bcontainers?\b/i, weight: 6 },
    { name: 'CI/CD', regex: /\bci\/cd\b|\bgithub actions\b|\bjenkins\b|\bargocd\b/i, weight: 7 },
    { name: 'Prometheus & Grafana', regex: /\bprometheus\b|\bgrafana\b|\bobservability\b|\bmonitoring\b/i, weight: 6 },
    { name: 'Linux', regex: /\blinux\b|\bbash\b|\bshell\b/i, weight: 5 },
    { name: 'Python', regex: /\bpython\b/i, weight: 4 },
    { name: 'SRE / Reliability', regex: /\bsre\b|\breliability\b|\bsla\b|\bslo\b/i, weight: 6 },
    { name: 'DevSecOps', regex: /\bsecurity\b|\bdevsecops\b|\bcompliance\b/i, weight: 4 },
    { name: 'ArgoCD / GitOps', regex: /\bargocd\b|\bgitops\b/i, weight: 5 }
  ];

  function calculateATSScore(title, description = '') {
    const text = `${title} ${description}`.toLowerCase();
    let score = 56; // baseline for relevant engineering role
    const matched = [];
    const missing = [];

    // Title weightings
    if (/\bdevops\b/i.test(title)) { score += 20; matched.push('DevOps'); }
    if (/\bcloud\b/i.test(title)) { score += 16; matched.push('Cloud Infrastructure'); }
    if (/\b(platform|infrastructure)\b/i.test(title)) { score += 15; matched.push('Platform Engineering'); }
    if (/\b(sre|site reliability)\b/i.test(title)) { score += 18; matched.push('Site Reliability (SRE)'); }
    if (/\b(gitops|ci\/cd|automation)\b/i.test(title)) { score += 14; matched.push('CI/CD & GitOps'); }

    for (const skill of CORE_SKILLS) {
      if (skill.regex.test(text)) {
        score += skill.weight;
        if (!matched.includes(skill.name)) matched.push(skill.name);
      } else {
        missing.push(skill.name);
      }
    }

    const finalScore = Math.min(98, Math.max(65, Math.round(score)));
    return {
      score: finalScore,
      matchedSkills: matched.length > 0 ? matched : ['DevOps', 'AWS', 'Kubernetes', 'CI/CD'],
      missingSkills: missing.slice(0, 3)
    };
  }

  function generateJobId(board, company, rawIdOrUrl) {
    const hash = crypto.createHash('md5').update(`${board}_${company}_${rawIdOrUrl}`).digest('hex').substring(0, 12);
    return `job_${hash}`;
  }

  function resolveCompanyEmails(companyName, domain) {
    let careersEmail = `careers@${domain}`;
    let hrEmail = `hr@${domain}`;

    if (companyDirectory.has(domain)) {
      const match = companyDirectory.get(domain);
      careersEmail = match.careersEmail || careersEmail;
      hrEmail = match.hrEmail || hrEmail;
    } else if (companyDirectory.has(companyName.toLowerCase())) {
      const match = companyDirectory.get(companyName.toLowerCase());
      careersEmail = match.careersEmail || careersEmail;
      hrEmail = match.hrEmail || hrEmail;
    }

    return { careersEmail, hrEmail };
  }

  // ──────────────────────────────────────────────
  // Fetchers for each ATS Board System
  // ──────────────────────────────────────────────
  async function fetchGreenhouseBoard(board) {
    const jobs = [];
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=false`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'JobApplyAI-LiveRadar/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];

      const data = await res.json();
      const rawList = data.jobs || [];

      for (const item of rawList) {
        if (!item.title || !DEVOPS_TITLE_REGEX.test(item.title) || EXCLUDE_TITLE_REGEX.test(item.title)) continue;

        const location = item.location?.name || 'Remote / Global';
        const ats = calculateATSScore(item.title, location);
        const { careersEmail, hrEmail } = resolveCompanyEmails(board.name, board.domain);

        jobs.push({
          id: generateJobId('greenhouse', board.slug, item.id || item.absolute_url),
          external_id: String(item.id),
          title: item.title,
          company: board.name,
          domain: board.domain,
          category: board.category,
          source: 'Greenhouse ATS',
          board_type: 'greenhouse',
          location: location,
          is_remote: /remote|anywhere|worldwide|virtual/i.test(location),
          is_india: /india|bengaluru|bangalore|pune|hyderabad|mumbai|delhi|gurgaon|noida/i.test(location),
          apply_url: item.absolute_url,
          careers_email: careersEmail,
          hr_email: hrEmail,
          ats_score: ats.score,
          matched_skills: ats.matchedSkills,
          missing_skills: ats.missingSkills,
          description_snippet: `Open engineering role at ${board.name}. Requires hands-on experience in cloud platforms, CI/CD, and scalable infrastructure.`,
          discovered_at: new Date().toISOString(),
          status: 'NEW'
        });
      }
    } catch (e) {
      console.warn(`[JobWatcher] Greenhouse [${board.name}] fetch error:`, e.message);
    }
    return jobs;
  }

  async function fetchAshbyBoard(board) {
    const jobs = [];
    try {
      const url = `https://api.ashbyhq.com/posting-api/job-board/${board.slug}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'JobApplyAI-LiveRadar/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];

      const data = await res.json();
      const rawList = data.jobs || [];

      for (const item of rawList) {
        if (!item.title || !DEVOPS_TITLE_REGEX.test(item.title) || EXCLUDE_TITLE_REGEX.test(item.title)) continue;

        const location = item.location || 'Remote, Global';
        const ats = calculateATSScore(item.title, `${location} ${item.department || ''}`);
        const { careersEmail, hrEmail } = resolveCompanyEmails(board.name, board.domain);

        jobs.push({
          id: generateJobId('ashby', board.slug, item.id || item.jobUrl),
          external_id: String(item.id || item.jobUrl),
          title: item.title,
          company: board.name,
          domain: board.domain,
          category: board.category,
          source: 'Ashby ATS',
          board_type: 'ashby',
          location: location,
          is_remote: /remote|anywhere|worldwide|global|virtual/i.test(location),
          is_india: /india|bengaluru|bangalore|pune|hyderabad|mumbai/i.test(location),
          apply_url: item.jobUrl,
          careers_email: careersEmail,
          hr_email: hrEmail,
          ats_score: ats.score,
          matched_skills: ats.matchedSkills,
          missing_skills: ats.missingSkills,
          description_snippet: `High-growth infrastructure role at ${board.name}. Focus on platform scaling, cloud automation, and high reliability.`,
          discovered_at: new Date().toISOString(),
          status: 'NEW'
        });
      }
    } catch (e) {
      console.warn(`[JobWatcher] Ashby [${board.name}] fetch error:`, e.message);
    }
    return jobs;
  }

  async function fetchLeverBoard(board) {
    const jobs = [];
    try {
      const url = `https://api.lever.co/v0/postings/${board.slug}?mode=json`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'JobApplyAI-LiveRadar/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];

      const data = await res.json();
      for (const item of data) {
        if (!item.text || !DEVOPS_TITLE_REGEX.test(item.text) || EXCLUDE_TITLE_REGEX.test(item.text)) continue;

        const location = item.categories?.location || 'Global / Remote';
        const ats = calculateATSScore(item.text, `${location} ${item.descriptionPlain || ''}`);
        const { careersEmail, hrEmail } = resolveCompanyEmails(board.name, board.domain);

        jobs.push({
          id: generateJobId('lever', board.slug, item.id || item.hostedUrl),
          external_id: String(item.id || item.hostedUrl),
          title: item.text,
          company: board.name,
          domain: board.domain,
          category: board.category,
          source: 'Lever ATS',
          board_type: 'lever',
          location: location,
          is_remote: /remote|anywhere|worldwide|virtual/i.test(location),
          is_india: /india|bengaluru|bangalore|pune|hyderabad/i.test(location),
          apply_url: item.hostedUrl,
          careers_email: careersEmail,
          hr_email: hrEmail,
          ats_score: ats.score,
          matched_skills: ats.matchedSkills,
          missing_skills: ats.missingSkills,
          description_snippet: (item.descriptionPlain || '').slice(0, 200).replace(/\s+/g, ' ') || `Cloud engineering role at ${board.name}.`,
          discovered_at: new Date().toISOString(),
          status: 'NEW'
        });
      }
    } catch (e) {
      console.warn(`[JobWatcher] Lever [${board.name}] fetch error:`, e.message);
    }
    return jobs;
  }

  async function fetchRemotiveFeed() {
    const jobs = [];
    try {
      const url = 'https://remotive.com/api/remote-jobs?category=devops&limit=30';
      const res = await fetch(url, {
        headers: { 'User-Agent': 'JobApplyAI-LiveRadar/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];

      const data = await res.json();
      const list = data.jobs || [];

      for (const item of list) {
        if (!item.title || !DEVOPS_TITLE_REGEX.test(item.title) || EXCLUDE_TITLE_REGEX.test(item.title)) continue;

        const company = item.company_name || 'Tech Organization';
        const domain = (company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
        const location = item.candidate_required_location || 'Remote Worldwide';
        const plainDesc = (item.description || '').replace(/<[^>]*>?/gm, ' ').slice(0, 300);
        const ats = calculateATSScore(item.title, plainDesc);
        const { careersEmail, hrEmail } = resolveCompanyEmails(company, domain);

        jobs.push({
          id: generateJobId('remotive', company, item.id || item.url),
          external_id: String(item.id || item.url),
          title: item.title,
          company: company,
          domain: domain,
          category: 'Remote DevOps & Cloud',
          source: 'Remotive Live Feed',
          board_type: 'feed',
          location: location,
          is_remote: true,
          is_india: /india|worldwide|anywhere/i.test(location),
          apply_url: item.url,
          careers_email: careersEmail,
          hr_email: hrEmail,
          ats_score: ats.score,
          matched_skills: ats.matchedSkills,
          missing_skills: ats.missingSkills,
          description_snippet: plainDesc.replace(/\s+/g, ' ').trim(),
          discovered_at: new Date().toISOString(),
          status: 'NEW'
        });
      }
    } catch (e) {
      console.warn('[JobWatcher] Remotive feed error:', e.message);
    }
    return jobs;
  }

  async function fetchJobicyFeed() {
    const jobs = [];
    try {
      const url = 'https://jobicy.com/api/v2/remote-jobs?count=25&tag=devops';
      const res = await fetch(url, {
        headers: { 'User-Agent': 'JobApplyAI-LiveRadar/1.0' },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) return [];

      const data = await res.json();
      const list = data.jobs || [];

      for (const item of list) {
        const title = item.jobTitle || '';
        if (!title || !DEVOPS_TITLE_REGEX.test(title) || EXCLUDE_TITLE_REGEX.test(title)) continue;

        const company = item.companyName || 'Tech Organization';
        const domain = (company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
        const location = item.jobGeo || 'Remote';
        const plainDesc = (item.jobDescription || '').replace(/<[^>]*>?/gm, ' ').slice(0, 300);
        const ats = calculateATSScore(title, plainDesc);
        const { careersEmail, hrEmail } = resolveCompanyEmails(company, domain);

        jobs.push({
          id: generateJobId('jobicy', company, item.id || item.url),
          external_id: String(item.id || item.url),
          title: title,
          company: company,
          domain: domain,
          category: 'Global Tech',
          source: 'Jobicy Live Feed',
          board_type: 'feed',
          location: location,
          is_remote: true,
          is_india: /india|anywhere|global/i.test(location),
          apply_url: item.url,
          careers_email: careersEmail,
          hr_email: hrEmail,
          ats_score: ats.score,
          matched_skills: ats.matchedSkills,
          missing_skills: ats.missingSkills,
          description_snippet: plainDesc.replace(/\s+/g, ' ').trim(),
          discovered_at: new Date().toISOString(),
          status: 'NEW'
        });
      }
    } catch (e) {
      console.warn('[JobWatcher] Jobicy feed error:', e.message);
    }
    return jobs;
  }

  // ──────────────────────────────────────────────
  // Main Autonomous Scanner Function
  // ──────────────────────────────────────────────
  let isScanning = false;
  let lastScannedAt = getJobsMeta().last_scanned_at;

  async function scanLiveJobs() {
    if (isScanning) {
      return { success: false, message: 'Scan already in progress' };
    }
    isScanning = true;
    console.log('[JobWatcher] 🌐 Commencing Autonomous ATS & Live Job Radar Scan...');

    try {
      const fetchTasks = [];

      // 1. Greenhouse boards
      for (const board of ATS_BOARDS.greenhouse) {
        fetchTasks.push(fetchGreenhouseBoard(board));
      }

      // 2. Ashby boards
      for (const board of ATS_BOARDS.ashby) {
        fetchTasks.push(fetchAshbyBoard(board));
      }

      // 3. Lever boards
      for (const board of ATS_BOARDS.lever) {
        fetchTasks.push(fetchLeverBoard(board));
      }

      // 4. Remote & Open Feeds
      fetchTasks.push(fetchRemotiveFeed());
      fetchTasks.push(fetchJobicyFeed());

      const results = await Promise.all(fetchTasks);
      const flatDiscovered = results.flat();

      // Merge with stored jobs (preserve user statuses: SAVED, APPLIED, DISMISSED)
      const existing = getStoredJobs();
      const existingMap = new Map(existing.map(j => [j.id, j]));

      let newCount = 0;
      for (const fresh of flatDiscovered) {
        if (!existingMap.has(fresh.id)) {
          existingMap.set(fresh.id, fresh);
          newCount++;
        } else {
          // Update any updated properties while preserving status and notes
          const old = existingMap.get(fresh.id);
          existingMap.set(fresh.id, {
            ...fresh,
            status: old.status,
            notes: old.notes,
            applied_at: old.applied_at,
            pitch: old.pitch
          });
        }
      }

      const mergedJobs = Array.from(existingMap.values())
        .sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0));

      saveStoredJobs(mergedJobs);
      const nowIso = new Date().toISOString();
      lastScannedAt = nowIso;
      saveJobsMeta({
        last_scanned_at: nowIso,
        total_scanned: mergedJobs.length,
        new_jobs_found: newCount,
        last_scan_status: 'SUCCESS'
      });

      console.log(`[JobWatcher] ✅ Scan completed. Total: ${mergedJobs.length} live jobs (${newCount} new).`);
      return {
        success: true,
        total: mergedJobs.length,
        new_jobs_found: newCount,
        last_scanned_at: lastScannedAt
      };
    } finally {
      isScanning = false;
    }
  }

  // ──────────────────────────────────────────────
  // Query & Filter Jobs
  // ──────────────────────────────────────────────
  function getLiveJobs({
    page = 1,
    limit = 20,
    search = '',
    status = 'ACTIVE', // 'ACTIVE' (NEW+SAVED), 'NEW', 'SAVED', 'APPLIED', 'ALL'
    min_ats_score = 0,
    location_filter = 'ALL' // 'ALL', 'INDIA', 'REMOTE'
  } = {}) {
    let list = getStoredJobs();

    // Status filter
    if (status === 'ACTIVE') {
      list = list.filter(j => j.status !== 'DISMISSED');
    } else if (status !== 'ALL') {
      list = list.filter(j => j.status === status);
    }

    // Min ATS Score
    if (min_ats_score > 0) {
      list = list.filter(j => (j.ats_score || 0) >= min_ats_score);
    }

    // Location filter
    if (location_filter === 'INDIA') {
      list = list.filter(j => j.is_india);
    } else if (location_filter === 'REMOTE') {
      list = list.filter(j => j.is_remote);
    }

    // Search query
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        (j.matched_skills && j.matched_skills.some(s => s.toLowerCase().includes(q)))
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
      jobs: paginated,
      last_scanned_at: lastScannedAt
    };
  }

  function getJobStats() {
    const list = getStoredJobs();
    const meta = getJobsMeta();
    const lastScan = meta.last_scanned_at || lastScannedAt;
    const nextRefresh = lastScan 
      ? new Date(new Date(lastScan).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null;

    return {
      total_jobs: list.length,
      high_match: list.filter(j => (j.ats_score || 0) >= 80).length,
      new_jobs: list.filter(j => j.status === 'NEW').length,
      saved_jobs: list.filter(j => j.status === 'SAVED').length,
      applied_jobs: list.filter(j => j.status === 'APPLIED').length,
      monitored_companies: Object.values(ATS_BOARDS).flat().length + 2,
      last_scanned_at: lastScan,
      next_refresh_at: nextRefresh,
      is_daily_refresh_due: isDailyRefreshDue(),
      is_scanning: isScanning
    };
  }

  function updateJobStatus(jobId, status, notes = '') {
    const list = getStoredJobs();
    const job = list.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    job.status = status;
    if (notes) job.notes = notes;
    job.updated_at = new Date().toISOString();

    saveStoredJobs(list);
    return job;
  }

  // ──────────────────────────────────────────────
  // AI Tailored Application Pitch Generator
  // ──────────────────────────────────────────────
  async function generateJobPitch(jobId) {
    const list = getStoredJobs();
    const job = list.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const profile = getUserProfile();
    const prompt = `You are an elite DevOps & Cloud Engineering candidate applying for an open role.
Generate a tailored, high-converting cold email application specifically for this role:

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Key Requirements / Context: ${job.description_snippet || 'Scalable cloud infrastructure, Kubernetes, CI/CD automation'}
Candidate Profile:
- Name: ${profile.name || 'Candidate Name'}
- Role: ${profile.title || 'Software Professional'}
- Core Skills: ${profile.core_skills || 'Cloud Infrastructure, CI/CD, Containerization, Automation'}
- Achievements: Automated cloud infrastructure, cut release cycles by 60%, and configured real-time monitoring and alerting.
- Portfolio: ${profile.portfolio || 'https://yourportfolio.com'}
- LinkedIn: ${profile.linkedin || 'https://linkedin.com/in/yourprofile'}
- Phone: ${profile.phone || ''}

Guidelines:
1. Subject line must be punchy: "${job.title} Application - ${profile.name || 'Candidate'} | Hands-on Engineering"
2. Tone: Professional, direct, showing deep technical grasp without fluff or clichés.
3. Keep body under 140 words. Specifically mention why your skills match ${job.company}'s ${job.title} position.
4. End with full contact signature and links.

Return ONLY a JSON object:
{
  "subject": "Email Subject Line",
  "body": "Email Body Text"
}`;

    try {
      const result = await generateWithFallback([prompt]);
      const resText = result.response.text();
      const parsed = parseJsonFromText(resText);
      job.pitch = parsed;
      saveStoredJobs(list);
      return parsed;
    } catch (e) {
      console.warn('[JobWatcher] Gemini pitch failed, using intelligent fallback:', e.message);
      const fallback = {
        subject: `${job.title} Application - ${profile.name || 'Candidate'} | ${profile.title || 'Engineering Professional'}`,
        body: `Hi ${job.company} Talent Team,\n\nI noticed your active opening for ${job.title} in ${job.location} and wanted to reach out directly.\n\nMy engineering background aligns closely with your technical requirements, focusing on ${job.matched_skills.join(', ')}. In my recent implementations, I designed automated deployment pipelines, automated resilient cloud infrastructure, and configured real-time observability.\n\nI have attached my resume for your review.${profile.portfolio ? ` You can also explore my live interactive architecture diagrams and deployed projects on my portfolio: ${profile.portfolio}.\n\n` : '\n\n'}I would welcome the opportunity to discuss how my background can contribute to ${job.company}.\n\nBest regards,\n\n${profile.signature || `${profile.name || 'Candidate Name'}\n${profile.title || 'Software Professional'}`}`
      };
      job.pitch = fallback;
      saveStoredJobs(list);
      return fallback;
    }
  }

  // ──────────────────────────────────────────────
  // Intelligent Deliverable Recruiter Email Resolver
  // ──────────────────────────────────────────────
  async function resolveDeliverableEmail(job, customEmail = '') {
    if (customEmail && customEmail.trim()) {
      const cleanCustom = customEmail.trim();
      const deliv = await validateEmailDeliverability(cleanCustom);
      if (!deliv.valid) {
        throw new Error(`Custom email ${cleanCustom} cannot be reached: ${deliv.reason}`);
      }
      return cleanCustom;
    }

    // Build ordered list of candidate emails
    const candidates = [];

    // 1. Prioritize non-bounced registered emails
    if (job.hr_email && !isEmailBounced(job.hr_email)) {
      candidates.push(job.hr_email);
    }
    if (job.careers_email && !isEmailBounced(job.careers_email)) {
      candidates.push(job.careers_email);
    }

    // 2. Fallbacks using known active hiring prefixes for the company domain
    const d = job.domain;
    if (d) {
      const prefixes = ['hr', 'recruiting', 'talent', 'jobs', 'careers'];
      for (const prefix of prefixes) {
        const candidate = `${prefix}@${d}`;
        if (!isEmailBounced(candidate) && !candidates.includes(candidate)) {
          candidates.push(candidate);
        }
      }
    }

    // 3. Test deliverability (DNS MX check & blacklist protection)
    for (const email of candidates) {
      try {
        const deliv = await validateEmailDeliverability(email);
        if (deliv.valid) {
          return email;
        }
      } catch (e) {
        // Try next candidate
      }
    }

    return null;
  }

  // ──────────────────────────────────────────────
  // Direct Apply via Cold Email with Resume
  // ──────────────────────────────────────────────
  async function applyToJob(jobId, { customEmail = '', customSubject = '', customBody = '' } = {}) {
    const list = getStoredJobs();
    const job = list.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');

    const targetEmail = await resolveDeliverableEmail(job, customEmail);
    if (!targetEmail) {
      if (job.apply_url) {
        return {
          success: false,
          error: 'portal_required',
          apply_url: job.apply_url,
          message: `${job.company} candidate inboxes are not accepting unsolicited emails. Please apply directly through the official career portal.`
        };
      }
      throw new Error(`No deliverable recruiter email found for ${job.company}. Please apply via the portal link.`);
    }

    // Ensure we have a high-converting, tailored pitch
    let pitch = job.pitch;
    if (!pitch || !pitch.body || pitch.body.length < 50) {
      try {
        pitch = await generateJobPitch(jobId);
      } catch (err) {
        const profile = getUserProfile();
        pitch = {
          subject: `${job.title} Application - ${profile.name || 'Candidate'} | ${profile.title || 'Engineering Professional'}`,
          body: `Hi ${job.company} Talent Acquisition Team,\n\nI noticed your active opening for ${job.title} in ${job.location} and wanted to reach out directly.\n\nMy engineering background aligns closely with your technical requirements, focusing on ${job.matched_skills ? job.matched_skills.join(', ') : 'Cloud Infrastructure, CI/CD, Containerization'}. In my recent implementations, I designed automated deployment pipelines, automated resilient infrastructure, and configured real-time observability.\n\nI have attached my resume for your review.${profile.portfolio ? ` You can also explore my live interactive architecture diagrams and deployed projects on my portfolio: ${profile.portfolio}.\n\n` : '\n\n'}I would welcome the opportunity to discuss how my hands-on background can contribute to ${job.company}.\n\nBest regards,\n\n${profile.signature || `${profile.name || 'Candidate Name'}\n${profile.title || 'Software Professional'}`}`
        };
      }
    }

    const currentResume = getSavedResume();
    console.log(`[JobWatcher] 📤 Dispatching application to ${targetEmail} for ${job.title} at ${job.company}...`);

    const sendResult = await sendEmailFn({
      to: targetEmail,
      subject: customSubject || pitch.subject,
      body: customBody || pitch.body,
      resumePath: currentResume.path,
      resumeOriginalName: currentResume.originalName
    });

    job.status = 'APPLIED';
    job.applied_at = new Date().toISOString();
    job.applied_to_email = targetEmail;
    job.message_id = sendResult.messageId || null;
    saveStoredJobs(list);

    if (autoPilot) {
      if (autoPilot.recordDailySend) autoPilot.recordDailySend();
      if (autoPilot.markApplied) {
        autoPilot.markApplied(targetEmail, job.company, job.title);
      }
      if (autoPilot.scheduleFollowUp) {
        autoPilot.scheduleFollowUp({
          recipient_email: targetEmail,
          company_name: job.company,
          job_title: job.title,
          contact_person: `${job.company} Talent Acquisition Team`,
          initial_subject: customSubject || pitch.subject,
          initial_body: customBody || pitch.body
        });
      }
    }

    return {
      success: true,
      message_id: sendResult.messageId,
      recipient: targetEmail,
      job
    };
  }

  return {
    scanLiveJobs,
    getLiveJobs,
    getJobStats,
    updateJobStatus,
    generateJobPitch,
    applyToJob,
    isDailyRefreshDue,
    getLastScannedAt
  };
}

module.exports = { initJobBoardWatcher };
