// ═══════════════════════════════════════════════
// JOB APPLY AI — Frontend Application
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // ── Element References ──
  const tabAutoPilot = document.getElementById('tabAutoPilot');
  const tabManual = document.getElementById('tabManual');
  const tabLeads = document.getElementById('tabLeads');
  const tabFollowUps = document.getElementById('tabFollowUps');
  const tabWhatsApp = document.getElementById('tabWhatsApp');
  const tabProfile = document.getElementById('tabProfile');
  const autopilotSection = document.getElementById('autopilotSection');
  const manualSectionContainer = document.getElementById('manualSectionContainer');
  const leadsSection = document.getElementById('leadsSection');
  const followupsSection = document.getElementById('followupsSection');
  const whatsappSection = document.getElementById('whatsappSection');
  const profileSection = document.getElementById('profileSection');
  const leadsTabBadge = document.getElementById('leadsTabBadge');
  const followUpsTabBadge = document.getElementById('followUpsTabBadge');
  const whatsAppTabBadge = document.getElementById('whatsAppTabBadge');
  const profileRoleBadge = document.getElementById('profileRoleBadge');

  // Lead Finder Form & Control Elements
  const leadsSearchForm = document.getElementById('leadsSearchForm');
  const leadsCompanyInput = document.getElementById('leadsCompanyInput');
  const leadsTargetRole = document.getElementById('leadsTargetRole');
  const leadsLocation = document.getElementById('leadsLocation');
  const leadsAutoSendCheckbox = document.getElementById('leadsAutoSendCheckbox');
  const discoverLeadsBtn = document.getElementById('discoverLeadsBtn');
  const leadsTotalCount = document.getElementById('leadsTotalCount');
  const leadsPendingCount = document.getElementById('leadsPendingCount');
  const leadsSentCount = document.getElementById('leadsSentCount');
  const filterAllCount = document.getElementById('filterAllCount');
  const filterPendingCount = document.getElementById('filterPendingCount');
  const filterSentCount = document.getElementById('filterSentCount');
  const leadsFilterPills = document.getElementById('leadsFilterPills');
  const leadsBulkBar = document.getElementById('leadsBulkBar');
  const selectAllLeadsCheckbox = document.getElementById('selectAllLeadsCheckbox');
  const selectedLeadsLabel = document.getElementById('selectedLeadsLabel');
  const batchSendLeadsBtn = document.getElementById('batchSendLeadsBtn');
  const selectedCountNum = document.getElementById('selectedCountNum');
  const leadsListContainer = document.getElementById('leadsListContainer');
  const leadsEmptyState = document.getElementById('leadsEmptyState');
  const refreshLeadsBtn = document.getElementById('refreshLeadsBtn');

  // Profile Form Elements
  const profileForm = document.getElementById('profileForm');
  const profileName = document.getElementById('profileName');
  const profileTitle = document.getElementById('profileTitle');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const profilePortfolio = document.getElementById('profilePortfolio');
  const profileLinkedin = document.getElementById('profileLinkedin');
  const profileGithub = document.getElementById('profileGithub');
  const profileTargetRoles = document.getElementById('profileTargetRoles');
  const profileCoreSkills = document.getElementById('profileCoreSkills');
  const profileCustomAiInstructions = document.getElementById('profileCustomAiInstructions');
  const profileSignature = document.getElementById('profileSignature');
  const activePresetBadge = document.getElementById('activePresetBadge');
  const presetPillsGrid = document.getElementById('presetPillsGrid');
  const resetPresetBtn = document.getElementById('resetPresetBtn');
  const autoGenerateSigBtn = document.getElementById('autoGenerateSigBtn');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const personaLivePreview = document.getElementById('personaLivePreview');
  const profileResumeTitle = document.getElementById('profileResumeTitle');
  const profileUploadResumeBtn = document.getElementById('profileUploadResumeBtn');
  const profileResumeInput = document.getElementById('profileResumeInput');

  const watchFolderPath = document.getElementById('watchFolderPath');
  const copyPathBtn = document.getElementById('copyPathBtn');
  const scanFolderBtn = document.getElementById('scanFolderBtn');
  const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyEmpty = document.getElementById('historyEmpty');
  const historyTable = document.getElementById('historyTable');
  const historyTableBody = document.getElementById('historyTableBody');

  // Daily Quota Elements
  const quotaCount = document.getElementById('quotaCount');
  const quotaLimit = document.getElementById('quotaLimit');
  const quotaRemaining = document.getElementById('quotaRemaining');
  const quotaProgressBar = document.getElementById('quotaProgressBar');
  const jitterInfo = document.getElementById('jitterInfo');
  const editLimitBtn = document.getElementById('editLimitBtn');
  const quotaLimitSelector = document.getElementById('quotaLimitSelector');
  const customLimitInput = document.getElementById('customLimitInput');
  const applyCustomLimitBtn = document.getElementById('applyCustomLimitBtn');

  // Follow-Up Cadence Elements
  const followUpsEmpty = document.getElementById('followUpsEmpty');
  const followUpsTable = document.getElementById('followUpsTable');
  const followUpsTableBody = document.getElementById('followUpsTableBody');
  const processDueFollowUpsBtn = document.getElementById('processDueFollowUpsBtn');
  const refreshFollowUpsBtn = document.getElementById('refreshFollowUpsBtn');

  // WhatsApp Outreach Elements
  const whatsAppEmpty = document.getElementById('whatsAppEmpty');
  const whatsAppLeadsGrid = document.getElementById('whatsAppLeadsGrid');
  const refreshWhatsAppBtn = document.getElementById('refreshWhatsAppBtn');
  const manualWhatsAppCard = document.getElementById('manualWhatsAppCard');
  const manualWhatsAppPhone = document.getElementById('manualWhatsAppPhone');
  const manualWhatsAppMessage = document.getElementById('manualWhatsAppMessage');
  const manualCopyWhatsAppBtn = document.getElementById('manualCopyWhatsAppBtn');
  const manualOpenWhatsAppBtn = document.getElementById('manualOpenWhatsAppBtn');

  // Email Details Modal
  const emailDetailsModal = document.getElementById('emailDetailsModal');
  const closeEmailDetails = document.getElementById('closeEmailDetails');
  const modalJobTitle = document.getElementById('modalJobTitle');
  const modalStatusBadge = document.getElementById('modalStatusBadge');
  const modalCompany = document.getElementById('modalCompany');
  const modalRecipient = document.getElementById('modalRecipient');
  const modalTime = document.getElementById('modalTime');
  const modalResume = document.getElementById('modalResume');
  const modalFiles = document.getElementById('modalFiles');
  const modalSubject = document.getElementById('modalSubject');
  const modalBody = document.getElementById('modalBody');

  const dropZone = document.getElementById('dropZone');
  const screenshotInput = document.getElementById('screenshotInput');
  const screenshotsContainer = document.getElementById('screenshotsContainer');
  const screenshotsCountText = document.getElementById('screenshotsCountText');
  const screenshotsGrid = document.getElementById('screenshotsGrid');
  const addMoreBtn = document.getElementById('addMoreBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resumeUploadArea = document.getElementById('resumeUploadArea');
  const resumeInput = document.getElementById('resumeInput');
  const resumeStatus = document.getElementById('resumeStatus');
  const resumeFileName = document.getElementById('resumeFileName');
  const removeResume = document.getElementById('removeResume');

  // Sections
  const uploadSection = document.getElementById('uploadSection');
  const loadingSection = document.getElementById('loadingSection');
  const reviewSection = document.getElementById('reviewSection');
  const successSection = document.getElementById('successSection');
  const heroSection = document.getElementById('heroSection');

  // Email form
  const emailTo = document.getElementById('emailTo');
  const emailCc = document.getElementById('emailCc');
  const emailSubject = document.getElementById('emailSubject');
  const emailBody = document.getElementById('emailBody');
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const startOverBtn = document.getElementById('startOverBtn');
  const regenerateBtn = document.getElementById('regenerateBtn');
  const toggleCc = document.getElementById('toggleCc');
  const ccGroup = document.getElementById('ccGroup');
  const attachmentBar = document.getElementById('attachmentBar');
  const attachmentName = document.getElementById('attachmentName');
  const newApplicationBtn = document.getElementById('newApplicationBtn');

  // Duplicate Warning Elements
  const duplicateWarningBanner = document.getElementById('duplicateWarningBanner');
  const duplicateWarningTitle = document.getElementById('duplicateWarningTitle');
  const duplicateWarningDesc = document.getElementById('duplicateWarningDesc');
  const duplicateMetaRecipient = document.getElementById('duplicateMetaRecipient');
  const duplicateMetaRole = document.getElementById('duplicateMetaRole');
  const duplicateMetaTime = document.getElementById('duplicateMetaTime');
  const forceResendCheckbox = document.getElementById('forceResendCheckbox');

  // Status
  const geminiBadge = document.getElementById('geminiBadge');
  const gmailBadge = document.getElementById('gmailBadge');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettings = document.getElementById('closeSettings');

  // Steps
  const stepsBar = document.getElementById('stepsBar');

  // State
  let selectedFiles = [];
  let currentJobData = null;
  let historyData = [];
  let followUpsData = [];
  let whatsAppLeadsData = [];
  let leadsData = [];
  let currentLeadFilter = 'ALL';
  let selectedLeadIds = new Set();
  let userProfile = null;
  let rolePresets = {};
  let currentPresetId = 'devops';

  // ── Mode Switcher (6 Tabs) ──
  tabAutoPilot.addEventListener('click', () => switchMode('autopilot'));
  tabManual.addEventListener('click', () => switchMode('manual'));
  if (tabLeads) tabLeads.addEventListener('click', () => switchMode('leads'));
  if (tabFollowUps) tabFollowUps.addEventListener('click', () => switchMode('followups'));
  if (tabWhatsApp) tabWhatsApp.addEventListener('click', () => switchMode('whatsapp'));
  if (tabProfile) tabProfile.addEventListener('click', () => switchMode('profile'));

  function switchMode(mode) {
    tabAutoPilot.classList.toggle('active', mode === 'autopilot');
    tabManual.classList.toggle('active', mode === 'manual');
    if (tabLeads) tabLeads.classList.toggle('active', mode === 'leads');
    if (tabFollowUps) tabFollowUps.classList.toggle('active', mode === 'followups');
    if (tabWhatsApp) tabWhatsApp.classList.toggle('active', mode === 'whatsapp');
    if (tabProfile) tabProfile.classList.toggle('active', mode === 'profile');

    autopilotSection.style.display = mode === 'autopilot' ? 'flex' : 'none';
    manualSectionContainer.style.display = mode === 'manual' ? 'block' : 'none';
    if (leadsSection) leadsSection.style.display = mode === 'leads' ? 'flex' : 'none';
    if (followupsSection) followupsSection.style.display = mode === 'followups' ? 'flex' : 'none';
    if (whatsappSection) whatsappSection.style.display = mode === 'whatsapp' ? 'flex' : 'none';
    if (profileSection) profileSection.style.display = mode === 'profile' ? 'flex' : 'none';

    loadingSection.style.display = 'none';
    reviewSection.style.display = 'none';
    successSection.style.display = 'none';

    if (mode === 'autopilot') {
      loadHistory();
      loadDailyStats();
    } else if (mode === 'leads') {
      loadLeads();
    } else if (mode === 'followups') {
      loadFollowUps();
    } else if (mode === 'whatsapp') {
      loadWhatsAppLeads();
    } else if (mode === 'profile') {
      loadProfile();
    }
  }

  // ── Copy Watch Folder Path ──
  copyPathBtn.addEventListener('click', async () => {
    const text = watchFolderPath.textContent;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Watch folder path copied to clipboard!', 'success');
    } catch (e) {
      showToast('Could not copy path', 'error');
    }
  });

  // ── Auto-Pilot Scan Now ──
  scanFolderBtn.addEventListener('click', async () => {
    scanFolderBtn.disabled = true;
    scanFolderBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      <span>Scanning...</span>
    `;
    try {
      const res = await fetch('/api/autopilot/scan', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || 'Scan initiated', 'info');
      setTimeout(loadHistory, 3000);
    } catch (e) {
      showToast('Failed to scan folder', 'error');
    } finally {
      setTimeout(() => {
        scanFolderBtn.disabled = false;
        scanFolderBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span>Scan Folder Now</span>
        `;
      }, 1000);
    }
  });

  // ── Refresh & Clear History ──
  refreshHistoryBtn.addEventListener('click', () => {
    loadHistory();
    showToast('Activity log refreshed', 'info');
  });

  clearHistoryBtn.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to clear the Auto-Pilot activity log?')) return;
    try {
      await fetch('/api/autopilot/clear-history', { method: 'POST' });
      loadHistory();
      showToast('Activity log cleared', 'success');
    } catch (e) {
      showToast('Failed to clear log', 'error');
    }
  });

  // ── Load Auto-Pilot History ──
  async function loadHistory() {
    try {
      const res = await fetch('/api/autopilot/history');
      const data = await res.json();
      historyData = data.history || [];
      renderHistoryTable(historyData);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }

  function renderHistoryTable(items) {
    if (!items || items.length === 0) {
      historyEmpty.style.display = 'block';
      historyTable.style.display = 'none';
      return;
    }

    historyEmpty.style.display = 'none';
    historyTable.style.display = 'table';
    historyTableBody.innerHTML = '';

    items.forEach((item, index) => {
      const tr = document.createElement('tr');

      let statusBadge = '';
      if (item.status === 'SENT') {
        statusBadge = '<span class="badge badge-sent"><span class="badge-dot"></span>SENT</span>';
      } else if (item.status === 'SKIPPED_DUPLICATE') {
        statusBadge = '<span class="badge badge-duplicate"><span class="badge-dot"></span>DUPLICATE</span>';
      } else if (item.status === 'NO_EMAIL_FOUND') {
        statusBadge = '<span class="badge badge-no-email"><span class="badge-dot"></span>NO EMAIL</span>';
      } else {
        statusBadge = '<span class="badge badge-failed"><span class="badge-dot"></span>FAILED</span>';
      }

      const formattedTime = item.timestamp
        ? new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
        : 'Just now';

      tr.innerHTML = `
        <td>${statusBadge}</td>
        <td>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(item.company_name || 'Unknown Company')}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(item.job_title || 'DevOps Position')}</div>
        </td>
        <td>
          ${item.contact_email ? `<span style="color: var(--accent-secondary); font-family: monospace;">${escapeHtml(item.contact_email)}</span>` : '<span style="color: var(--text-muted); font-style: italic;">No email in image</span>'}
        </td>
        <td style="color: var(--text-muted); font-size: 12px;">${formattedTime}</td>
        <td>
          <button class="btn btn-ghost btn-sm view-details-btn" data-index="${index}" style="padding: 4px 10px; font-size: 12px;">
            👁️ View
          </button>
        </td>
      `;

      historyTableBody.appendChild(tr);
    });

    // Attach click handlers to view buttons
    historyTableBody.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        showEmailDetailsModal(historyData[idx]);
      });
    });
  }

  function showEmailDetailsModal(item) {
    if (!item) return;
    modalJobTitle.textContent = `${item.job_title || 'Job Application'} — ${item.company_name || 'Company'}`;
    
    if (item.status === 'SENT') {
      modalStatusBadge.className = 'badge badge-sent';
      modalStatusBadge.textContent = '✅ SENT VIA GMAIL';
    } else if (item.status === 'SKIPPED_DUPLICATE') {
      modalStatusBadge.className = 'badge badge-duplicate';
      modalStatusBadge.textContent = '⏭️ SKIPPED (DUPLICATE RECIPIENT)';
    } else if (item.status === 'NO_EMAIL_FOUND') {
      modalStatusBadge.className = 'badge badge-no-email';
      modalStatusBadge.textContent = '⚠️ NO RECIPIENT EMAIL FOUND';
    } else {
      modalStatusBadge.className = 'badge badge-failed';
      modalStatusBadge.textContent = `❌ FAILED: ${item.error_message || 'Error'}`;
    }

    modalCompany.textContent = item.company_name || 'N/A';
    modalRecipient.textContent = item.contact_email || 'None';
    modalTime.textContent = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A';
    modalResume.textContent = item.has_resume ? (item.resume_name || 'AjayAutadeDevopsResume.pdf') : 'No resume';
    modalFiles.textContent = (item.files || []).join(', ') || 'Screenshot';
    modalSubject.value = item.subject || '';
    modalBody.value = item.body || '';

    emailDetailsModal.style.display = 'flex';
  }

  closeEmailDetails.addEventListener('click', () => {
    emailDetailsModal.style.display = 'none';
  });

  emailDetailsModal.addEventListener('click', (e) => {
    if (e.target === emailDetailsModal) emailDetailsModal.style.display = 'none';
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Load Daily Outbound Stats & Throttling ──
  async function loadDailyStats() {
    try {
      const res = await fetch('/api/autopilot/daily-stats');
      const data = await res.json();
      if (!data) return;

      const count = (typeof data.sentToday === 'number') ? data.sentToday : (data.count || 0);
      const limit = data.limit || 150;
      const remaining = (typeof data.remaining === 'number') ? data.remaining : Math.max(0, limit - count);
      const percent = (typeof data.percent === 'number') ? data.percent : Math.min(100, Math.round((count / limit) * 100));

      if (quotaCount) quotaCount.textContent = count;
      if (quotaLimit) quotaLimit.textContent = limit;
      if (quotaRemaining) {
        quotaRemaining.textContent = `${remaining} remaining`;
        if (remaining === 0) {
          quotaRemaining.style.color = '#ef4444';
          quotaRemaining.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        } else {
          quotaRemaining.style.color = 'var(--accent-secondary)';
          quotaRemaining.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        }
      }

      if (quotaProgressBar) {
        quotaProgressBar.style.width = `${percent}%`;
        if (percent >= 100) {
          quotaProgressBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else if (percent >= 75) {
          quotaProgressBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        } else {
          quotaProgressBar.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
        }
      }

      const minJitter = data.minJitter || (data.jitter_range_seconds ? data.jitter_range_seconds[0] : 15);
      const maxJitter = data.maxJitter || (data.jitter_range_seconds ? data.jitter_range_seconds[1] : 35);
      if (jitterInfo) {
        jitterInfo.textContent = `⏳ Human Jitter: ${minJitter}s–${maxJitter}s delay`;
      }
    } catch (e) {
      console.error('Failed to load daily stats:', e);
    }
  }

  // ── Toggle Limit Selector & Update Daily Limit ──
  if (editLimitBtn && quotaLimitSelector) {
    editLimitBtn.addEventListener('click', () => {
      const isHidden = quotaLimitSelector.style.display === 'none';
      quotaLimitSelector.style.display = isHidden ? 'block' : 'none';
      editLimitBtn.textContent = isHidden ? '▲ Hide' : '⚙️ Change Limit';
    });
  }

  async function updateDailyLimit(newLimit) {
    const limitNum = parseInt(newLimit, 10);
    if (!limitNum || limitNum < 1) {
      showToast('Please enter a valid limit number (minimum 1)', 'error');
      return;
    }
    try {
      const res = await fetch('/api/autopilot/daily-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: limitNum })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Daily Outbound Limit updated to ${limitNum} emails/day!`, 'success');
        loadDailyStats();
        if (quotaLimitSelector) quotaLimitSelector.style.display = 'none';
        if (editLimitBtn) editLimitBtn.textContent = '⚙️ Change Limit';
      } else {
        showToast(data.error || 'Failed to update limit', 'error');
      }
    } catch (e) {
      showToast('Failed to update limit', 'error');
    }
  }

  document.querySelectorAll('.limit-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const limit = btn.getAttribute('data-limit');
      updateDailyLimit(limit);
    });
  });

  if (applyCustomLimitBtn && customLimitInput) {
    applyCustomLimitBtn.addEventListener('click', () => {
      const limit = customLimitInput.value.trim();
      updateDailyLimit(limit);
    });
    customLimitInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        updateDailyLimit(customLimitInput.value.trim());
      }
    });
  }

  // ── Load Follow-Ups Cadence ──
  async function loadFollowUps() {
    try {
      const res = await fetch('/api/followups');
      const data = await res.json();
      followUpsData = data.followUps || data.follow_ups || [];

      // Update badge count
      if (followUpsTabBadge) {
        const scheduledCount = followUpsData.filter(f => f.status === 'SCHEDULED').length;
        if (scheduledCount > 0) {
          followUpsTabBadge.style.display = 'inline-block';
          followUpsTabBadge.textContent = scheduledCount;
        } else {
          followUpsTabBadge.style.display = 'none';
        }
      }

      renderFollowUpsTable(followUpsData);
    } catch (e) {
      console.error('Failed to load follow-ups:', e);
    }
  }

  function renderFollowUpsTable(items) {
    if (!followUpsEmpty || !followUpsTable || !followUpsTableBody) return;

    if (!items || items.length === 0) {
      followUpsEmpty.style.display = 'block';
      followUpsTable.style.display = 'none';
      return;
    }

    followUpsEmpty.style.display = 'none';
    followUpsTable.style.display = 'table';
    followUpsTableBody.innerHTML = '';

    const now = new Date();

    items.forEach(item => {
      const tr = document.createElement('tr');
      const dueDateVal = item.follow_up_due || item.scheduled_for;
      const isDue = item.status === 'SCHEDULED' && dueDateVal && new Date(dueDateVal) <= now;

      let statusBadge = '';
      if (item.status === 'SENT') {
        statusBadge = '<span class="badge badge-sent"><span class="badge-dot"></span>SENT</span>';
      } else if (item.status === 'REPLIED') {
        statusBadge = '<span class="badge badge-replied"><span class="badge-dot"></span>REPLIED</span>';
      } else if (item.status === 'CANCELLED') {
        statusBadge = '<span class="badge badge-cancelled"><span class="badge-dot"></span>CANCELLED</span>';
      } else if (isDue) {
        statusBadge = '<span class="badge badge-due-now"><span class="badge-dot"></span>DUE NOW</span>';
      } else {
        statusBadge = '<span class="badge badge-scheduled"><span class="badge-dot"></span>SCHEDULED</span>';
      }

      const initialTime = item.original_sent_at || item.initial_sent_at;
      const initialTimeFormatted = initialTime
        ? new Date(initialTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';

      const scheduledTimeFormatted = dueDateVal
        ? new Date(dueDateVal).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';

      const recipientEmail = item.contact_email || item.recipient_email || 'N/A';

      let actionHtml = '';
      if (item.status === 'SCHEDULED') {
        actionHtml = `
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm send-followup-now-btn" data-id="${escapeHtml(item.id)}" title="Send this follow-up email right now" style="padding: 4px 8px; font-size: 11px;">
              ⚡ Send
            </button>
            <button class="btn btn-ghost btn-sm mark-replied-btn" data-id="${escapeHtml(item.id)}" title="Mark as recruiter replied (stops further follow-ups)" style="padding: 4px 8px; font-size: 11px; color: var(--accent-secondary);">
              💬 Replied
            </button>
            <button class="btn btn-ghost btn-sm cancel-followup-btn" data-id="${escapeHtml(item.id)}" title="Cancel scheduled follow-up" style="padding: 4px 8px; font-size: 11px; color: #ef4444;">
              ✕ Cancel
            </button>
          </div>
        `;
      } else if (item.status === 'SENT') {
        const sentTime = item.sent_at ? new Date(item.sent_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
        actionHtml = `<span style="font-size: 12px; color: var(--accent-secondary);">Sent ${sentTime}</span>`;
      } else if (item.status === 'REPLIED') {
        actionHtml = `<span style="font-size: 12px; color: #10b981;">Recruiter Replied</span>`;
      } else {
        actionHtml = `<span style="font-size: 12px; color: var(--text-muted);">Cancelled</span>`;
      }

      tr.innerHTML = `
        <td>${statusBadge}</td>
        <td>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(item.company_name || 'Company')}</div>
          <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(item.job_title || 'DevOps Engineer')}</div>
        </td>
        <td>
          <span style="color: var(--accent-secondary); font-family: monospace; font-size: 12px;">${escapeHtml(recipientEmail)}</span>
        </td>
        <td style="color: var(--text-muted); font-size: 12px;">${initialTimeFormatted}</td>
        <td>
          <span style="font-size: 12px; ${isDue ? 'color: #f59e0b; font-weight: 600;' : 'color: var(--text-primary);'}">
            ${scheduledTimeFormatted}
          </span>
        </td>
        <td>${actionHtml}</td>
      `;

      followUpsTableBody.appendChild(tr);
    });

    // Attach event listeners for row action buttons
    followUpsTableBody.querySelectorAll('.send-followup-now-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        btn.disabled = true;
        btn.textContent = 'Sending...';
        try {
          const res = await fetch(`/api/followups/${id}/send-now`, { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showToast('Follow-up email dispatched successfully!', 'success');
            loadFollowUps();
            loadDailyStats();
            loadHistory();
          } else {
            showToast(data.error || 'Failed to send follow-up', 'error');
            btn.disabled = false;
            btn.textContent = '⚡ Send';
          }
        } catch (e) {
          showToast('Failed to send follow-up', 'error');
          btn.disabled = false;
          btn.textContent = '⚡ Send';
        }
      });
    });

    followUpsTableBody.querySelectorAll('.mark-replied-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const res = await fetch(`/api/followups/${id}/reply`, { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showToast('Recruiter marked as replied. Follow-up closed.', 'success');
            loadFollowUps();
          } else {
            showToast(data.error || 'Failed to update follow-up', 'error');
          }
        } catch (e) {
          showToast('Failed to update follow-up', 'error');
        }
      });
    });

    followUpsTableBody.querySelectorAll('.cancel-followup-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('Cancel this scheduled follow-up?')) return;
        try {
          const res = await fetch(`/api/followups/${id}/cancel`, { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showToast('Scheduled follow-up cancelled.', 'info');
            loadFollowUps();
          } else {
            showToast(data.error || 'Failed to cancel follow-up', 'error');
          }
        } catch (e) {
          showToast('Failed to cancel follow-up', 'error');
        }
      });
    });
  }

  // ── Follow-Up Section Controls ──
  if (processDueFollowUpsBtn) {
    processDueFollowUpsBtn.addEventListener('click', async () => {
      processDueFollowUpsBtn.disabled = true;
      processDueFollowUpsBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <span>Processing...</span>
      `;
      try {
        const res = await fetch('/api/followups/process-due', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast(`Processed due follow-ups: ${data.sent_count} sent`, data.sent_count > 0 ? 'success' : 'info');
          loadFollowUps();
          loadDailyStats();
          loadHistory();
        } else {
          showToast(data.error || 'Failed to process follow-ups', 'error');
        }
      } catch (e) {
        showToast('Error processing follow-ups', 'error');
      } finally {
        setTimeout(() => {
          processDueFollowUpsBtn.disabled = false;
          processDueFollowUpsBtn.innerHTML = `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span>Process Due Follow-Ups Now</span>
          `;
        }, 800);
      }
    });
  }

  if (refreshFollowUpsBtn) {
    refreshFollowUpsBtn.addEventListener('click', () => {
      loadFollowUps();
      showToast('Follow-up schedule refreshed', 'info');
    });
  }

  // ── WhatsApp Leads Pipeline ──
  async function loadWhatsAppLeads() {
    try {
      const res = await fetch('/api/whatsapp/leads');
      const data = await res.json();
      whatsAppLeadsData = data.leads || [];

      // Update badge count for pending approval
      if (whatsAppTabBadge) {
        const pendingCount = whatsAppLeadsData.filter(l => l.status === 'PENDING_APPROVAL').length;
        if (pendingCount > 0) {
          whatsAppTabBadge.style.display = 'inline-block';
          whatsAppTabBadge.textContent = `${pendingCount} pending`;
        } else {
          whatsAppTabBadge.style.display = 'inline-block';
          whatsAppTabBadge.textContent = `${whatsAppLeadsData.length} leads`;
        }
      }

      renderWhatsAppLeads(whatsAppLeadsData);
    } catch (e) {
      console.error('Failed to load WhatsApp leads:', e);
    }
  }

  function renderWhatsAppLeads(leads) {
    if (!whatsAppEmpty || !whatsAppLeadsGrid) return;

    if (!leads || leads.length === 0) {
      whatsAppEmpty.style.display = 'block';
      whatsAppLeadsGrid.style.display = 'none';
      return;
    }

    whatsAppEmpty.style.display = 'none';
    whatsAppLeadsGrid.style.display = 'grid';
    whatsAppLeadsGrid.innerHTML = '';

    leads.forEach((lead) => {
      const card = document.createElement('div');
      card.className = `whatsapp-lead-card ${lead.status === 'SENT' ? 'lead-sent' : lead.status === 'DISMISSED' ? 'lead-dismissed' : ''}`;

      let badgeHtml = '';
      if (lead.status === 'SENT') {
        badgeHtml = `<span class="whatsapp-lead-badge-sent">✅ Message Sent</span>`;
      } else if (lead.status === 'DISMISSED') {
        badgeHtml = `<span class="whatsapp-lead-badge-dismissed">✕ Dismissed</span>`;
      } else {
        badgeHtml = `<span class="whatsapp-lead-badge-pending">⏳ Pending Approval</span>`;
      }

      const formattedDate = lead.created_at
        ? new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recently';

      card.innerHTML = `
        <div class="whatsapp-lead-header">
          <div>
            <div class="whatsapp-lead-title">${escapeHtml(lead.job_title || 'DevOps Engineer')}</div>
            <div class="whatsapp-lead-company">🏢 ${escapeHtml(lead.company_name || 'Company')}${lead.contact_person ? ` • 👤 ${escapeHtml(lead.contact_person)}` : ''}</div>
          </div>
          ${badgeHtml}
        </div>

        <div class="whatsapp-lead-phone-row">
          <span style="font-size: 16px;">📱</span>
          <span class="whatsapp-lead-phone-number">${escapeHtml(lead.display_phone || lead.phone_number)}</span>
          <span style="margin-left: auto; font-size: 11px; color: var(--text-muted);">${formattedDate}</span>
        </div>

        <div>
          <div class="whatsapp-draft-label">
            <span>WhatsApp Pitch Draft</span>
            <span style="font-size: 10px; color: var(--text-muted);">(Editable)</span>
          </div>
          <textarea class="whatsapp-textarea lead-message-input" data-id="${escapeHtml(lead.id)}" rows="6">${escapeHtml(lead.message_draft || '')}</textarea>
        </div>

        <div class="whatsapp-lead-actions">
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-whatsapp btn-sm open-wa-btn" data-id="${escapeHtml(lead.id)}" data-phone="${escapeHtml(lead.phone_number)}" title="Open directly in WhatsApp Desktop or Web with drafted message">
              <span>🚀 Open in WhatsApp</span>
            </button>
            <button class="btn btn-secondary btn-sm copy-wa-btn" data-id="${escapeHtml(lead.id)}" title="Copy message draft to clipboard">
              <span>📋 Copy</span>
            </button>
          </div>
          <div style="display: flex; gap: 6px;">
            ${lead.status === 'PENDING_APPROVAL' ? `
              <button class="btn btn-ghost btn-sm mark-wa-sent-btn" data-id="${escapeHtml(lead.id)}" title="Mark as sent" style="color: #00e68a; font-size: 12px; padding: 4px 8px;">
                ✓ Sent
              </button>
              <button class="btn btn-ghost btn-sm dismiss-wa-btn" data-id="${escapeHtml(lead.id)}" title="Dismiss lead" style="color: #ef4444; font-size: 12px; padding: 4px 8px;">
                ✕
              </button>
            ` : lead.status === 'DISMISSED' ? `
              <button class="btn btn-ghost btn-sm restore-wa-btn" data-id="${escapeHtml(lead.id)}" title="Restore to pending" style="color: var(--accent-secondary); font-size: 12px;">
                ↺ Restore
              </button>
            ` : `
              <span style="font-size: 11px; color: var(--accent-secondary); align-self: center;">Sent ${lead.sent_at ? new Date(lead.sent_at).toLocaleDateString() : ''}</span>
            `}
          </div>
        </div>
      `;

      whatsAppLeadsGrid.appendChild(card);
    });

    // Wire Open in WhatsApp
    whatsAppLeadsGrid.querySelectorAll('.open-wa-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const phone = btn.getAttribute('data-phone');
        const card = btn.closest('.whatsapp-lead-card');
        const textarea = card.querySelector('.lead-message-input');
        const messageText = textarea ? textarea.value.trim() : '';

        if (!phone) {
          showToast('No phone number found for this lead', 'error');
          return;
        }

        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
        window.open(waUrl, '_blank');

        // Automatically prompt to mark as sent
        fetch(`/api/whatsapp/leads/${id}/sent`, { method: 'POST' })
          .then(() => {
            showToast('Opening WhatsApp & marked lead as Sent!', 'success');
            loadWhatsAppLeads();
          })
          .catch(() => {});
      });
    });

    // Wire Copy Text
    whatsAppLeadsGrid.querySelectorAll('.copy-wa-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.whatsapp-lead-card');
        const textarea = card.querySelector('.lead-message-input');
        const messageText = textarea ? textarea.value.trim() : '';
        navigator.clipboard.writeText(messageText).then(() => {
          showToast('WhatsApp message copied to clipboard!', 'success');
        });
      });
    });

    // Wire Mark Sent
    whatsAppLeadsGrid.querySelectorAll('.mark-wa-sent-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await fetch(`/api/whatsapp/leads/${id}/sent`, { method: 'POST' });
          showToast('Marked WhatsApp lead as sent', 'success');
          loadWhatsAppLeads();
        } catch (e) {
          showToast('Failed to update lead', 'error');
        }
      });
    });

    // Wire Dismiss
    whatsAppLeadsGrid.querySelectorAll('.dismiss-wa-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await fetch(`/api/whatsapp/leads/${id}/dismiss`, { method: 'POST' });
          showToast('Lead dismissed', 'info');
          loadWhatsAppLeads();
        } catch (e) {
          showToast('Failed to dismiss lead', 'error');
        }
      });
    });

    // Wire Restore
    whatsAppLeadsGrid.querySelectorAll('.restore-wa-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          await fetch(`/api/whatsapp/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PENDING_APPROVAL' })
          });
          showToast('Lead restored to pending approval', 'success');
          loadWhatsAppLeads();
        } catch (e) {
          showToast('Failed to restore lead', 'error');
        }
      });
    });

    // Wire auto-save on textarea changes
    whatsAppLeadsGrid.querySelectorAll('.lead-message-input').forEach(textarea => {
      textarea.addEventListener('change', async () => {
        const id = textarea.getAttribute('data-id');
        const message_draft = textarea.value;
        try {
          await fetch(`/api/whatsapp/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_draft })
          });
        } catch (e) {}
      });
    });
  }

  if (refreshWhatsAppBtn) {
    refreshWhatsAppBtn.addEventListener('click', () => {
      loadWhatsAppLeads();
      showToast('WhatsApp leads refreshed', 'info');
    });
  }

  // ── 🎯 Recruiter Cold Outreach & Lead Finder Pipeline ──
  async function loadLeads() {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      leadsData = data.leads || [];
      const stats = data.stats || { total: 0, pending: 0, sent: 0, dismissed: 0 };

      // Update badge count
      if (leadsTabBadge) {
        if (stats.pending > 0) {
          leadsTabBadge.style.display = 'inline-block';
          leadsTabBadge.textContent = `${stats.pending} pending`;
        } else {
          leadsTabBadge.style.display = 'inline-block';
          leadsTabBadge.textContent = `${stats.total} leads`;
        }
      }

      // Update stats numbers
      if (leadsTotalCount) leadsTotalCount.textContent = stats.total;
      if (leadsPendingCount) leadsPendingCount.textContent = stats.pending;
      if (leadsSentCount) leadsSentCount.textContent = stats.sent;

      if (filterAllCount) filterAllCount.textContent = stats.total;
      if (filterPendingCount) filterPendingCount.textContent = stats.pending;
      if (filterSentCount) filterSentCount.textContent = stats.sent;

      renderLeadsList(leadsData);
    } catch (e) {
      console.error('Failed to load recruiter leads:', e);
    }
  }

  function renderLeadsList(leads) {
    if (!leadsListContainer || !leadsEmptyState) return;

    let filtered = leads || [];
    if (currentLeadFilter === 'PENDING') {
      filtered = filtered.filter(l => l.status === 'DISCOVERED' || l.status === 'PENDING');
    } else if (currentLeadFilter === 'SENT') {
      filtered = filtered.filter(l => l.status === 'SENT');
    }

    if (filtered.length === 0) {
      leadsEmptyState.style.display = 'flex';
      leadsListContainer.querySelectorAll('.lead-card').forEach(c => c.remove());
      if (leadsBulkBar) leadsBulkBar.style.display = 'none';
      return;
    }

    leadsEmptyState.style.display = 'none';
    leadsListContainer.querySelectorAll('.lead-card').forEach(c => c.remove());

    // Update bulk bar visibility
    const pendingLeads = filtered.filter(l => l.status !== 'SENT' && l.status !== 'DISMISSED');
    if (leadsBulkBar) {
      leadsBulkBar.style.display = pendingLeads.length > 0 ? 'flex' : 'none';
      updateBulkSelectCount();
    }

    filtered.forEach(lead => {
      const card = document.createElement('div');
      const isSent = lead.status === 'SENT';
      card.className = `lead-card ${isSent ? 'lead-sent' : ''}`;
      card.id = `leadCard_${lead.id}`;

      const initial = (lead.company_name || 'C').charAt(0).toUpperCase();
      const domainClean = (lead.domain || '').replace(/^https?:\/\//, '').replace(/^www\./, '');
      const domainUrl = domainClean ? `https://${domainClean}` : '#';

      const confidenceBadge = lead.confidence === 'HIGH'
        ? '<span class="lead-badge badge-confidence-high">⚡ High Confidence</span>'
        : '<span class="lead-badge badge-confidence-med">🔍 Pattern Match</span>';

      const statusBadge = isSent
        ? `<span class="lead-badge badge-status-sent">✅ Sent ${lead.sent_at ? new Date(lead.sent_at).toLocaleDateString() : ''}</span>`
        : '<span class="lead-badge badge-status-pending">Ready to Send</span>';

      const isChecked = selectedLeadIds.has(lead.id);

      card.innerHTML = `
        <div class="lead-card-header">
          <div class="lead-company-info">
            ${!isSent ? `<input type="checkbox" class="lead-select-checkbox" data-id="${lead.id}" ${isChecked ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #10b981; cursor: pointer;">` : ''}
            <div class="lead-avatar">${initial}</div>
            <div class="lead-title-box">
              <div class="lead-company-name">
                <span>${escapeHtml(lead.company_name)}</span>
                ${domainClean ? `<a href="${domainUrl}" target="_blank" rel="noopener noreferrer" class="lead-domain-link">🌐 ${escapeHtml(domainClean)}</a>` : ''}
              </div>
              <div class="lead-recruiter-title">${escapeHtml(lead.recruiter_name || 'Talent Acquisition Team')} • ${escapeHtml(lead.recruiter_title || 'Recruiter')}</div>
            </div>
          </div>
          <div class="lead-header-badges">
            ${confidenceBadge}
            ${statusBadge}
          </div>
        </div>

        <div class="lead-contact-row">
          <div class="lead-email-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>Direct Email:</span>
          </div>
          <div class="lead-email-value">${escapeHtml(lead.email)}</div>
        </div>

        <div class="lead-preview-collapse">
          <div class="lead-preview-header" data-id="${lead.id}">
            <span>📝 Cold Email Draft: "${escapeHtml(lead.email_subject || 'Job Inquiry')}"</span>
            <span class="preview-toggle-icon">▼</span>
          </div>
          <div class="lead-preview-body" id="leadBody_${lead.id}" style="display: none;">
            <div style="font-weight: 600; color: #a5b4fc; margin-bottom: 8px;">Subject: ${escapeHtml(lead.email_subject || '')}</div>
            <textarea class="form-textarea lead-email-editor" data-id="${lead.id}" rows="7" style="font-size: 13px; line-height: 1.55; width: 100%; background: rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.1);">${escapeHtml(lead.email_body || '')}</textarea>
          </div>
        </div>

        <div class="lead-actions-row">
          <div class="lead-actions-left">
            ${!isSent ? `
              <button type="button" class="btn btn-primary btn-sm send-lead-btn" data-id="${lead.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <span>Send Cold Email with Resume</span>
              </button>
            ` : `
              <span style="font-size: 12.5px; color: #4ade80; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Dispatched with Resume PDF
              </span>
            `}
            <button type="button" class="btn btn-secondary btn-sm copy-lead-pitch-btn" data-id="${lead.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>Copy Pitch</span>
            </button>
          </div>
          <div class="lead-actions-right">
            <button type="button" class="btn btn-icon-sm dismiss-lead-btn" data-id="${lead.id}" title="Dismiss lead" style="color: #94a3b8;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;

      leadsListContainer.appendChild(card);
    });

    // Wire individual lead events
    wireLeadCardEvents();
  }

  function wireLeadCardEvents() {
    // Toggle preview accordion
    leadsListContainer.querySelectorAll('.lead-preview-header').forEach(header => {
      header.addEventListener('click', () => {
        const id = header.getAttribute('data-id');
        const body = document.getElementById(`leadBody_${id}`);
        const icon = header.querySelector('.preview-toggle-icon');
        if (body) {
          const isOpen = body.style.display !== 'none';
          body.style.display = isOpen ? 'none' : 'block';
          if (icon) icon.textContent = isOpen ? '▼' : '▲';
        }
      });
    });

    // Wire single send button
    leadsListContainer.querySelectorAll('.send-lead-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width: 12px; height: 12px; margin-right: 6px;"></span> Sending...';

        try {
          const res = await fetch(`/api/leads/${id}/send`, { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showToast(`Cold email dispatched to ${data.email}!`, 'success');
            loadLeads();
            loadDailyStats();
          } else {
            showToast(`Failed: ${data.error || 'Could not send email'}`, 'error');
            btn.disabled = false;
            btn.innerHTML = originalText;
          }
        } catch (err) {
          showToast(`Send error: ${err.message}`, 'error');
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    });

    // Wire copy pitch button
    leadsListContainer.querySelectorAll('.copy-lead-pitch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const lead = leadsData.find(l => l.id === id);
        if (lead && lead.email_body) {
          navigator.clipboard.writeText(lead.email_body).then(() => {
            showToast('Cold email body copied to clipboard!', 'success');
          });
        }
      });
    });

    // Wire dismiss lead button
    leadsListContainer.querySelectorAll('.dismiss-lead-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        try {
          await fetch(`/api/leads/${id}`, { method: 'DELETE' });
          showToast('Lead dismissed', 'info');
          loadLeads();
        } catch (err) {
          showToast('Failed to dismiss lead', 'error');
        }
      });
    });

    // Wire textarea live save
    leadsListContainer.querySelectorAll('.lead-email-editor').forEach(editor => {
      editor.addEventListener('change', async () => {
        const id = editor.getAttribute('data-id');
        const updatedBody = editor.value;
        try {
          await fetch(`/api/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_body: updatedBody })
          });
        } catch (err) {}
      });
    });

    // Wire checkbox selection
    leadsListContainer.querySelectorAll('.lead-select-checkbox').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-id');
        if (chk.checked) {
          selectedLeadIds.add(id);
        } else {
          selectedLeadIds.delete(id);
        }
        updateBulkSelectCount();
      });
    });
  }

  function updateBulkSelectCount() {
    if (!selectedCountNum || !selectAllLeadsCheckbox) return;
    selectedCountNum.textContent = selectedLeadIds.size;
    if (batchSendLeadsBtn) {
      batchSendLeadsBtn.disabled = selectedLeadIds.size === 0;
    }
    const pendingCheckboxes = leadsListContainer.querySelectorAll('.lead-select-checkbox');
    selectAllLeadsCheckbox.checked = pendingCheckboxes.length > 0 && selectedLeadIds.size === pendingCheckboxes.length;
  }

  // ── Wire Lead Finder Search & Controls ──
  if (leadsSearchForm) {
    leadsSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const company_text = leadsCompanyInput ? leadsCompanyInput.value.trim() : '';
      const target_role = leadsTargetRole ? leadsTargetRole.value.trim() : '';
      const location = leadsLocation ? leadsLocation.value.trim() : '';
      const auto_send = leadsAutoSendCheckbox ? leadsAutoSendCheckbox.checked : false;

      if (!company_text) {
        showToast('Please enter at least one target company name or domain', 'warning');
        return;
      }

      const originalBtnHtml = discoverLeadsBtn.innerHTML;
      discoverLeadsBtn.disabled = true;
      discoverLeadsBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin-right: 6px;"></span> Finding Recruiters & Drafting Emails...';

      try {
        const res = await fetch('/api/leads/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_text,
            target_role,
            location,
            auto_send
          })
        });

        const data = await res.json();
        if (data.success) {
          showToast(`Discovered ${data.discovered_count} recruiter contacts (${data.new_saved_count} new)!`, 'success');
          loadLeads();
          if (auto_send) {
            loadDailyStats();
          }
        } else {
          showToast(`Discovery failed: ${data.error || 'Unknown error'}`, 'error');
        }
      } catch (err) {
        showToast(`Discovery error: ${err.message}`, 'error');
      } finally {
        discoverLeadsBtn.disabled = false;
        discoverLeadsBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  // Quick preset chips
  document.querySelectorAll('.leads-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const companies = chip.getAttribute('data-companies');
      if (leadsCompanyInput && companies) {
        leadsCompanyInput.value = companies;
        leadsCompanyInput.focus();
        showToast('Target companies filled into search box', 'info');
      }
    });
  });

  // Filter pills
  if (leadsFilterPills) {
    leadsFilterPills.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        leadsFilterPills.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentLeadFilter = pill.getAttribute('data-filter') || 'ALL';
        renderLeadsList(leadsData);
      });
    });
  }

  // Select all checkbox
  if (selectAllLeadsCheckbox) {
    selectAllLeadsCheckbox.addEventListener('change', () => {
      const checkboxes = leadsListContainer.querySelectorAll('.lead-select-checkbox');
      checkboxes.forEach(chk => {
        chk.checked = selectAllLeadsCheckbox.checked;
        const id = chk.getAttribute('data-id');
        if (selectAllLeadsCheckbox.checked) {
          selectedLeadIds.add(id);
        } else {
          selectedLeadIds.delete(id);
        }
      });
      updateBulkSelectCount();
    });
  }

  // Batch Send Selected button
  if (batchSendLeadsBtn) {
    batchSendLeadsBtn.addEventListener('click', async () => {
      const ids = Array.from(selectedLeadIds);
      if (ids.length === 0) return;

      const origText = batchSendLeadsBtn.innerHTML;
      batchSendLeadsBtn.disabled = true;
      batchSendLeadsBtn.innerHTML = '<span class="spinner" style="width: 12px; height: 12px; margin-right: 6px;"></span> Dispatching Emails with Resume...';

      try {
        const res = await fetch('/api/leads/batch-send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_ids: ids })
        });
        const data = await res.json();
        if (data.sent_count > 0) {
          showToast(`Successfully dispatched ${data.sent_count} cold emails with resume attached!`, 'success');
        } else {
          showToast(`Batch send completed: ${data.failed_count} failed`, 'warning');
        }
        selectedLeadIds.clear();
        loadLeads();
        loadDailyStats();
      } catch (err) {
        showToast(`Batch send error: ${err.message}`, 'error');
      } finally {
        batchSendLeadsBtn.disabled = false;
        batchSendLeadsBtn.innerHTML = origText;
      }
    });
  }

  if (refreshLeadsBtn) {
    refreshLeadsBtn.addEventListener('click', () => {
      loadLeads();
      showToast('Recruiter leads refreshed', 'info');
    });
  }

  // ── Initialize ──
  checkSettings();
  loadHistory();
  loadDailyStats();
  loadLeads();
  loadFollowUps();
  loadWhatsAppLeads();

  // Auto-poll history, daily stats, leads, followups, and whatsapp leads periodically
  setInterval(() => {
    if (autopilotSection && autopilotSection.style.display !== 'none') {
      loadHistory();
      loadDailyStats();
    } else if (leadsSection && leadsSection.style.display !== 'none') {
      loadLeads();
    } else if (followupsSection && followupsSection.style.display !== 'none') {
      loadFollowUps();
    } else if (whatsappSection && whatsappSection.style.display !== 'none') {
      loadWhatsAppLeads();
    }
  }, 4000);

  // ── Settings Check ──
  async function checkSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();

      if (data.watch_folder) {
        watchFolderPath.textContent = data.watch_folder;
      }

      // Update badges
      if (data.gemini_configured) {
        geminiBadge.className = 'badge badge-success';
        geminiBadge.title = 'Gemini API Connected';
        document.getElementById('geminiSetupBadge').textContent = 'Connected';
        document.getElementById('geminiSetupBadge').className = 'badge badge-sm badge-success';
      } else {
        document.getElementById('geminiSetupBadge').textContent = 'Not Set';
        document.getElementById('geminiSetupBadge').className = 'badge badge-sm badge-pending';
      }

      if (data.gmail_configured) {
        gmailBadge.className = 'badge badge-success';
        gmailBadge.title = 'Gmail SMTP Connected';
        document.getElementById('gmailSetupBadge').textContent = 'Connected';
        document.getElementById('gmailSetupBadge').className = 'badge badge-sm badge-success';
      } else {
        document.getElementById('gmailSetupBadge').textContent = 'Not Set';
        document.getElementById('gmailSetupBadge').className = 'badge badge-sm badge-pending';
      }

      if (data.profile) {
        userProfile = data.profile;
        if (profileRoleBadge) {
          const pName = data.profile.preset_id ? (data.profile.preset_id.charAt(0).toUpperCase() + data.profile.preset_id.slice(1)) : 'Profile';
          profileRoleBadge.textContent = pName;
        }
      }

      if (data.has_resume) {
        showResumeStatus(data.resume_name);
        if (profileResumeTitle) profileResumeTitle.textContent = `📄 Attached: ${data.resume_name}`;
      }
    } catch (err) {
      console.error('Failed to check settings:', err);
    }
  }

  // Load profile settings & presets in background on start
  loadProfile();

  // ── Resume Upload ──
  resumeUploadArea.addEventListener('click', () => resumeInput.click());

  resumeInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    try {
      resumeUploadArea.querySelector('span').textContent = 'Uploading...';
      const res = await fetch('/api/upload-resume', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        showResumeStatus(data.filename);
        showToast('Resume uploaded successfully', 'success');
      } else {
        showToast(data.error || 'Failed to upload resume', 'error');
        resumeUploadArea.querySelector('span').textContent = 'Attach your resume (PDF/DOC)';
      }
    } catch (err) {
      showToast('Failed to upload resume', 'error');
      resumeUploadArea.querySelector('span').textContent = 'Attach your resume (PDF/DOC)';
    }
  });

  function showResumeStatus(filename) {
    resumeUploadArea.style.display = 'none';
    resumeStatus.style.display = 'flex';
    resumeFileName.textContent = filename;
  }

  removeResume.addEventListener('click', async () => {
    try {
      await fetch('/api/remove-resume', { method: 'POST' });
    } catch (e) {}
    resumeUploadArea.style.display = 'flex';
    resumeStatus.style.display = 'none';
    resumeUploadArea.querySelector('span').textContent = 'Attach your resume (PDF/DOC)';
    resumeInput.value = '';
  });

  // ── Drag & Drop & Multi-Screenshot Handling ──
  dropZone.addEventListener('click', () => screenshotInput.click());
  addMoreBtn.addEventListener('click', () => screenshotInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      handleScreenshots(droppedFiles);
    }
  });

  screenshotInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleScreenshots(files);
    }
    screenshotInput.value = '';
  });

  function handleScreenshots(newFiles) {
    const validFiles = [];
    for (const file of newFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      const isImage = file.type.startsWith('image/') || ['heic', 'heif', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif'].includes(ext);
      if (!isImage) {
        showToast(`Skipped non-image: ${file.name}`, 'error');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name} is too large. Max 10MB each.`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    selectedFiles = [...selectedFiles, ...validFiles].slice(0, 5);
    renderScreenshotsGrid();
  }

  function renderScreenshotsGrid() {
    if (selectedFiles.length === 0) {
      dropZone.style.display = 'block';
      screenshotsContainer.style.display = 'none';
      analyzeBtn.disabled = true;
      return;
    }

    dropZone.style.display = 'none';
    screenshotsContainer.style.display = 'block';
    analyzeBtn.disabled = false;

    screenshotsCountText.textContent = `${selectedFiles.length} screenshot${selectedFiles.length > 1 ? 's' : ''} uploaded (${selectedFiles.length === 1 ? 'Part 1' : `Parts 1-${selectedFiles.length}`})`;

    screenshotsGrid.innerHTML = '';

    selectedFiles.forEach((file, index) => {
      const card = document.createElement('div');
      card.className = 'screenshot-card';

      const badge = document.createElement('div');
      badge.className = 'screenshot-badge';
      badge.textContent = `Part ${index + 1}`;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'screenshot-remove-btn';
      removeBtn.innerHTML = '✕';
      removeBtn.title = 'Remove this screenshot';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedFiles.splice(index, 1);
        renderScreenshotsGrid();
      });

      const img = document.createElement('img');
      img.alt = `Screenshot Part ${index + 1}`;

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

      card.appendChild(badge);
      card.appendChild(removeBtn);
      card.appendChild(img);
      screenshotsGrid.appendChild(card);
    });

    // Show "+ Add Part" card if under 5 screenshots
    if (selectedFiles.length < 5) {
      const addCard = document.createElement('div');
      addCard.className = 'add-screenshot-card';
      addCard.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>+ Add Part ${selectedFiles.length + 1}</span>
      `;
      addCard.addEventListener('click', () => screenshotInput.click());
      screenshotsGrid.appendChild(addCard);
    }
  }

  // ── Analyze ──
  analyzeBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;

    // Show loading
    uploadSection.style.display = 'none';
    heroSection.style.display = 'none';
    loadingSection.style.display = 'block';
    updateSteps(2);

    const ls1 = document.getElementById('ls1');
    const ls2 = document.getElementById('ls2');
    const ls3 = document.getElementById('ls3');

    document.getElementById('loadingSubtitle').textContent = `Analyzing ${selectedFiles.length} screenshot${selectedFiles.length > 1 ? 's' : ''} and drafting your email...`;

    setTimeout(() => {
      ls1.classList.add('done');
      ls1.classList.remove('active');
      ls2.classList.add('active');
    }, 1500);

    setTimeout(() => {
      ls2.classList.add('done');
      ls2.classList.remove('active');
      ls3.classList.add('active');
    }, 3000);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('screenshots', file);
    });

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        currentJobData = data;
        showReview(data);
      } else {
        showToast(data.details || data.error || 'Analysis failed', 'error');
        resetToUpload();
      }
    } catch (err) {
      showToast('Failed to connect to server. Is it running?', 'error');
      resetToUpload();
    }
  });

  // ── Duplicate Banner & Button State Helper ──
  function updateDuplicateBanner(duplicateInfo) {
    if (duplicateInfo && (duplicateInfo.is_duplicate || duplicateInfo.email)) {
      duplicateWarningBanner.style.display = 'block';
      const sentDate = duplicateInfo.timestamp
        ? new Date(duplicateInfo.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : 'Previously';

      const targetEmail = duplicateInfo.email || emailTo.value.trim() || 'Recruiter';
      const targetRole = duplicateInfo.matchedRole || (currentJobData && currentJobData.job_data && currentJobData.job_data.job_title) || 'DevOps Position';
      const targetCompany = duplicateInfo.matchedCompany || (currentJobData && currentJobData.job_data && currentJobData.job_data.company_name) || 'Company';

      duplicateMetaRecipient.textContent = '📧 ' + targetEmail;
      duplicateMetaRole.textContent = '💼 ' + targetRole;
      duplicateMetaTime.textContent = '🕒 Sent on ' + sentDate;

      duplicateWarningTitle.textContent = `Already applied to ${targetCompany} for "${targetRole}"!`;
      duplicateWarningDesc.textContent = `An application for "${targetRole}" was previously sent to ${targetEmail} on ${sentDate}. Sending duplicate emails for the same opening is blocked by default to maintain your professional reputation.`;

      if (forceResendCheckbox.checked) {
        sendEmailBtn.disabled = false;
        sendEmailBtn.classList.remove('btn-blocked');
        sendEmailBtn.classList.add('btn-force-send');
        sendEmailBtn.querySelector('span').textContent = '⚠️ Force Send Duplicate';
      } else {
        sendEmailBtn.disabled = true;
        sendEmailBtn.classList.add('btn-blocked');
        sendEmailBtn.classList.remove('btn-force-send');
        sendEmailBtn.querySelector('span').textContent = '🔒 Blocked (Already Applied)';
      }
    } else {
      duplicateWarningBanner.style.display = 'none';
      forceResendCheckbox.checked = false;
      sendEmailBtn.disabled = false;
      sendEmailBtn.classList.remove('btn-blocked', 'btn-force-send');
      sendEmailBtn.querySelector('span').textContent = 'Send Email';
    }
  }

  forceResendCheckbox.addEventListener('change', () => {
    if (currentJobData && currentJobData.duplicate_info) {
      updateDuplicateBanner(currentJobData.duplicate_info);
    }
  });

  // Debounced live duplicate checker when recipient email is manually changed
  let duplicateCheckTimer = null;
  emailTo.addEventListener('input', () => {
    clearTimeout(duplicateCheckTimer);
    duplicateCheckTimer = setTimeout(async () => {
      const email = emailTo.value.trim();
      const job_title = (currentJobData && currentJobData.job_data && currentJobData.job_data.job_title) || emailSubject.value.trim();
      const company_name = (currentJobData && currentJobData.job_data && currentJobData.job_data.company_name) || '';

      if (!email || !email.includes('@')) {
        updateDuplicateBanner(null);
        return;
      }

      try {
        const res = await fetch('/api/check-duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, job_title, company_name })
        });
        const data = await res.json();
        if (currentJobData) {
          currentJobData.duplicate_info = data.is_duplicate ? data.duplicate_info : null;
        }
        updateDuplicateBanner(currentJobData ? currentJobData.duplicate_info : null);
      } catch (e) {}
    }, 400);
  });

  // ── Show Review ──
  function showReview(data) {
    loadingSection.style.display = 'none';
    reviewSection.style.display = 'flex';
    updateSteps(2);

    // Populate job details
    const grid = document.getElementById('jobDetailsGrid');
    grid.innerHTML = '';

    const details = data.job_data;
    const fields = [
      { label: 'Company', value: details.company_name },
      { label: 'Position', value: details.job_title },
      { label: 'Location', value: details.location },
      { label: 'Job Type', value: details.job_type },
      { label: 'Experience', value: details.experience_required },
      { label: 'Contact Email', value: details.contact_email, isEmail: true },
      { label: 'Contact Person', value: details.contact_person },
      { label: 'Salary', value: details.salary_range },
      { label: 'Deadline', value: details.application_deadline }
    ];

    fields.forEach(f => {
      if (!f.value || f.value === 'null') return;
      const item = document.createElement('div');
      item.className = 'job-detail-item';
      item.innerHTML = `
        <div class="job-detail-label">${f.label}</div>
        <div class="job-detail-value ${f.isEmail ? 'email-value' : ''}">${f.value}</div>
      `;
      grid.appendChild(item);
    });

    // Summary
    if (details.job_description_summary) {
      const summary = document.createElement('div');
      summary.className = 'job-detail-item full-width';
      summary.innerHTML = `
        <div class="job-detail-label">Summary</div>
        <div class="job-detail-value">${details.job_description_summary}</div>
      `;
      grid.appendChild(summary);
    }

    // Skills
    if (details.key_skills && details.key_skills.length > 0) {
      const skills = document.createElement('div');
      skills.className = 'job-detail-item full-width';
      skills.innerHTML = `
        <div class="job-detail-label">Key Skills</div>
        <div class="job-detail-tags">
          ${details.key_skills.map(s => `<span class="job-detail-tag">${s}</span>`).join('')}
        </div>
      `;
      grid.appendChild(skills);
    }

    // Populate email form
    emailTo.value = details.contact_email || '';
    emailSubject.value = data.email_draft.subject || '';
    emailBody.value = data.email_draft.body || '';

    // Attachment
    if (data.has_resume) {
      attachmentBar.style.display = 'flex';
      attachmentName.textContent = '📎 Resume attached';
    }

    // Duplicate status banner
    if (data.duplicate_info) {
      updateDuplicateBanner(data.duplicate_info);
      const sentDate = data.duplicate_info.timestamp ? new Date(data.duplicate_info.timestamp).toLocaleDateString() : 'earlier';
      showToast(`⚠️ Already applied on ${sentDate}. Duplicate send is blocked.`, 'info');
    } else {
      updateDuplicateBanner(null);
    }

    // Recruiter WhatsApp Card (if mobile number was extracted)
    const detectedPhone = details.contact_phone || (data.whats_app_lead && data.whats_app_lead.phone_number);
    if (manualWhatsAppCard && detectedPhone) {
      manualWhatsAppCard.style.display = 'block';
      if (manualWhatsAppPhone) {
        manualWhatsAppPhone.value = (data.whats_app_lead && data.whats_app_lead.display_phone) || details.contact_phone || '';
      }
      if (manualWhatsAppMessage) {
        manualWhatsAppMessage.value = (data.whats_app_lead && data.whats_app_lead.message_draft) || '';
      }
      if (manualCopyWhatsAppBtn) {
        manualCopyWhatsAppBtn.onclick = () => {
          const text = manualWhatsAppMessage.value.trim();
          navigator.clipboard.writeText(text).then(() => {
            showToast('WhatsApp draft copied to clipboard!', 'success');
          });
        };
      }
      if (manualOpenWhatsAppBtn) {
        manualOpenWhatsAppBtn.onclick = () => {
          const rawPhone = manualWhatsAppPhone.value.trim() || detectedPhone;
          const clean = rawPhone.replace(/[^0-9]/g, '');
          const text = manualWhatsAppMessage.value.trim();
          const targetNum = clean.startsWith('91') && clean.length === 12 ? clean : (clean.length === 10 ? '91' + clean : clean);
          const url = `https://wa.me/${targetNum}?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
          showToast('Opening WhatsApp with recruiter outreach message!', 'success');
          if (data.whats_app_lead && data.whats_app_lead.id) {
            fetch(`/api/whatsapp/leads/${data.whats_app_lead.id}/sent`, { method: 'POST' }).catch(() => {});
          }
        };
      }
    } else if (manualWhatsAppCard) {
      manualWhatsAppCard.style.display = 'none';
    }

    // If no email found, highlight
    if (!details.contact_email) {
      if (detectedPhone) {
        showToast('Recruiter WhatsApp number detected! Message drafted and ready below.', 'success');
      } else {
        showToast('No email found in screenshot. Please enter the recipient email manually.', 'error');
      }
      emailTo.focus();
      emailTo.style.borderColor = 'var(--accent-warning)';
    }
  }

  // ── CC Toggle ──
  toggleCc.addEventListener('click', () => {
    ccGroup.classList.toggle('show');
    toggleCc.textContent = ccGroup.classList.contains('show') ? '− Hide CC' : '+ Add CC';
  });

  // ── Copy Email ──
  copyEmailBtn.addEventListener('click', () => {
    const text = `To: ${emailTo.value}\nSubject: ${emailSubject.value}\n\n${emailBody.value}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Email copied to clipboard!', 'success');
      copyEmailBtn.querySelector('span')?.remove();
      const originalText = copyEmailBtn.innerHTML;
      copyEmailBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Copied!`;
      setTimeout(() => { copyEmailBtn.innerHTML = originalText; }, 2000);
    });
  });

  // ── Send Email ──
  sendEmailBtn.addEventListener('click', async () => {
    const to = emailTo.value.trim();
    const subject = emailSubject.value.trim();
    const body = emailBody.value.trim();

    if (!to) {
      showToast('Please enter a recipient email address', 'error');
      emailTo.focus();
      return;
    }

    if (!subject) {
      showToast('Please enter a subject', 'error');
      emailSubject.focus();
      return;
    }

    if (!body) {
      showToast('Email body cannot be empty', 'error');
      emailBody.focus();
      return;
    }

    if (currentJobData && currentJobData.duplicate_info && !forceResendCheckbox.checked) {
      showToast('This application was already sent! Check the override box to force resend.', 'error');
      duplicateWarningBanner.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Confirm
    const confirmMsg = forceResendCheckbox.checked
      ? `⚠️ This application was already sent previously. Are you SURE you want to force resend to ${to}?`
      : `Send this email to ${to}?`;

    if (!confirm(confirmMsg)) return;

    sendEmailBtn.classList.add('btn-sending');
    sendEmailBtn.querySelector('span').textContent = 'Sending...';

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          body,
          cc: emailCc.value.trim() || undefined,
          job_title: currentJobData?.job_data?.job_title || subject,
          company_name: currentJobData?.job_data?.company_name || '',
          force_resend: forceResendCheckbox.checked
        })
      });

      const data = await res.json();

      if (res.status === 409 || data.is_duplicate) {
        showToast(data.error || 'Duplicate application blocked', 'error');
        if (currentJobData) currentJobData.duplicate_info = data.duplicate_info;
        updateDuplicateBanner(data.duplicate_info);
        sendEmailBtn.classList.remove('btn-sending');
        return;
      }

      if (data.success) {
        loadHistory();
        loadDailyStats();
        loadFollowUps();
        showSuccess(to);
      } else {
        showToast(data.error || 'Failed to send email', 'error');
        sendEmailBtn.classList.remove('btn-sending');
        updateDuplicateBanner(currentJobData?.duplicate_info || null);
      }
    } catch (err) {
      showToast('Failed to send email. Check your connection.', 'error');
      sendEmailBtn.classList.remove('btn-sending');
      updateDuplicateBanner(currentJobData?.duplicate_info || null);
    }
  });

  // ── Success ──
  function showSuccess(to) {
    reviewSection.style.display = 'none';
    successSection.style.display = 'block';
    document.getElementById('successSubtitle').textContent = `Your application has been sent to ${to}`;
    updateSteps(3);
    sendEmailBtn.classList.remove('btn-sending');
    sendEmailBtn.querySelector('span').textContent = 'Send Email';
  }

  // ── Start Over ──
  startOverBtn.addEventListener('click', resetToUpload);
  newApplicationBtn.addEventListener('click', resetToUpload);

  function resetToUpload() {
    uploadSection.style.display = 'block';
    heroSection.style.display = 'block';
    loadingSection.style.display = 'none';
    reviewSection.style.display = 'none';
    successSection.style.display = 'none';

    // Reset screenshots
    selectedFiles = [];
    dropZone.style.display = 'block';
    screenshotsContainer.style.display = 'none';
    screenshotsGrid.innerHTML = '';
    analyzeBtn.disabled = true;
    screenshotInput.value = '';

    // Reset email form
    emailTo.value = '';
    emailSubject.value = '';
    emailBody.value = '';
    emailCc.value = '';
    emailTo.style.borderColor = '';
    ccGroup.classList.remove('show');
    toggleCc.textContent = '+ Add CC';

    // Reset duplicate state
    updateDuplicateBanner(null);
    currentJobData = null;

    // Reset WhatsApp manual card
    if (manualWhatsAppCard) manualWhatsAppCard.style.display = 'none';
    if (manualWhatsAppPhone) manualWhatsAppPhone.value = '';
    if (manualWhatsAppMessage) manualWhatsAppMessage.value = '';

    // Reset loading steps
    const steps = ['ls1', 'ls2', 'ls3'];
    steps.forEach((id, i) => {
      const el = document.getElementById(id);
      el.classList.remove('active', 'done');
      if (i === 0) el.classList.add('active');
    });

    updateSteps(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Regenerate ──
  regenerateBtn.addEventListener('click', async () => {
    if (!currentJobData && selectedFiles.length === 0) {
      showToast('No job data available to regenerate.', 'error');
      return;
    }

    regenerateBtn.disabled = true;
    regenerateBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
      Regenerating with AI...
    `;

    try {
      let res, data;
      if (currentJobData && currentJobData.job_data) {
        res = await fetch('/api/regenerate-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_data: currentJobData.job_data })
        });
        data = await res.json();
      } else {
        const formData = new FormData();
        selectedFiles.forEach(f => formData.append('screenshots', f));
        res = await fetch('/api/analyze', { method: 'POST', body: formData });
        data = await res.json();
      }

      if (data.success && data.email_draft) {
        emailSubject.value = data.email_draft.subject || '';
        emailBody.value = data.email_draft.body || '';
        showToast('Personalized email regenerated with resume context!', 'success');
      } else {
        showToast(data.details || data.error || 'Regeneration failed', 'error');
      }
    } catch (err) {
      showToast('Failed to regenerate. Check your connection.', 'error');
    }

    regenerateBtn.disabled = false;
    regenerateBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
      Regenerate
    `;
  });

  // ═══════════════════════════════════════════════
  // AI PERSONA & CANDIDATE PROFILE LOGIC
  // ═══════════════════════════════════════════════

  async function loadProfile() {
    try {
      // 1. Fetch presets
      const presetsRes = await fetch('/api/profile/presets');
      if (presetsRes.ok) {
        const pData = await presetsRes.json();
        rolePresets = pData.presets || {};
      }

      // 2. Fetch profile
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        userProfile = data.profile || {};
        populateProfileForm(userProfile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      showToast('Could not load profile settings', 'error');
    }
  }

  function populateProfileForm(profile) {
    if (!profile) return;
    currentPresetId = profile.preset_id || 'devops';

    if (profileName) profileName.value = profile.name || '';
    if (profileTitle) profileTitle.value = profile.title || '';
    if (profileEmail) profileEmail.value = profile.email || '';
    if (profilePhone) profilePhone.value = profile.phone || '';
    if (profilePortfolio) profilePortfolio.value = profile.portfolio || '';
    if (profileLinkedin) profileLinkedin.value = profile.linkedin || '';
    if (profileGithub) profileGithub.value = profile.github || '';
    if (profileTargetRoles) profileTargetRoles.value = profile.target_roles || '';
    if (profileCoreSkills) profileCoreSkills.value = profile.core_skills || '';
    if (profileCustomAiInstructions) profileCustomAiInstructions.value = profile.custom_ai_instructions || '';
    if (profileSignature) profileSignature.value = profile.signature || '';

    updatePresetPillSelection(currentPresetId);

    if (profileRoleBadge) {
      const presetObj = rolePresets[currentPresetId];
      profileRoleBadge.textContent = presetObj ? presetObj.name.split(' ')[0] : 'Custom';
    }

    updateLivePreview();
  }

  function updatePresetPillSelection(presetId) {
    if (presetPillsGrid) {
      presetPillsGrid.querySelectorAll('.preset-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === presetId);
      });
    }
    const p = rolePresets[presetId];
    if (activePresetBadge) {
      activePresetBadge.textContent = p ? p.name : 'Custom Role';
    }
  }

  function selectPreset(presetId) {
    currentPresetId = presetId;
    updatePresetPillSelection(presetId);
    const p = rolePresets[presetId];
    if (!p) return;

    if (presetId !== 'custom') {
      if (profileTitle) profileTitle.value = p.title;
      if (profileTargetRoles) profileTargetRoles.value = p.target_roles;
      if (profileCoreSkills) profileCoreSkills.value = p.core_skills;
      if (profileCustomAiInstructions) profileCustomAiInstructions.value = p.custom_ai_instructions;
    }

    generateSignatureFromFields();
    updateLivePreview();
    showToast(`Loaded ${p.name} preset! Review & save.`, 'info');
  }

  function generateSignatureFromFields() {
    const name = profileName ? profileName.value.trim() : 'Candidate Name';
    const title = profileTitle ? profileTitle.value.trim() : '';
    const phone = profilePhone ? profilePhone.value.trim() : '';
    const email = profileEmail ? profileEmail.value.trim() : '';
    const portfolio = profilePortfolio ? profilePortfolio.value.trim() : '';
    const linkedin = profileLinkedin ? profileLinkedin.value.trim() : '';

    const lines = [];
    if (name) lines.push(name);
    if (title) lines.push(title);

    const contactLine = [];
    if (phone) contactLine.push(`P: ${phone}`);
    if (email) contactLine.push(`E: ${email}`);
    if (contactLine.length > 0) lines.push(contactLine.join(' | '));

    const linkLine = [];
    if (portfolio) linkLine.push(`W: ${portfolio.replace(/^https?:\/\//, '')}`);
    if (linkedin) linkLine.push(`In: ${linkedin.replace(/^https?:\/\/(www\.)?/, '')}`);
    if (linkLine.length > 0) lines.push(linkLine.join(' | '));

    const sigText = lines.join('\n');
    if (profileSignature) profileSignature.value = sigText;
    return sigText;
  }

  function updateLivePreview() {
    if (!personaLivePreview) return;
    const name = profileName ? profileName.value.trim() || 'Candidate Name' : 'Candidate Name';
    const title = profileTitle ? profileTitle.value.trim() || 'Professional' : 'Professional';
    const skills = profileCoreSkills ? profileCoreSkills.value.trim() || 'modern software engineering' : 'modern software engineering';
    const custom = profileCustomAiInstructions ? profileCustomAiInstructions.value.trim() : '';
    const sig = profileSignature ? profileSignature.value.trim() : '';

    const sampleEmail = `Hi Sarah,

I saw your opening for the ${title} role at TechCorp and wanted to reach out directly.

In my recent work, I have focused on ${skills.split(',').slice(0, 3).join(',')}, building scalable solutions and delivering high-impact results.${custom ? `\n\nKey highlights: ${custom}` : ''}

I've attached my resume for more background on my projects and experience. I would love to connect for a brief chat to see if my background is a good fit.

Best,

${sig || name}`;

    personaLivePreview.textContent = sampleEmail;
  }

  async function handleSaveProfile(e) {
    if (e) e.preventDefault();
    if (!profileForm) return;

    if (saveProfileBtn) {
      saveProfileBtn.disabled = true;
      saveProfileBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span>Saving Persona...</span>
      `;
    }

    const payload = {
      preset_id: currentPresetId,
      name: profileName ? profileName.value.trim() : '',
      title: profileTitle ? profileTitle.value.trim() : '',
      email: profileEmail ? profileEmail.value.trim() : '',
      phone: profilePhone ? profilePhone.value.trim() : '',
      portfolio: profilePortfolio ? profilePortfolio.value.trim() : '',
      linkedin: profileLinkedin ? profileLinkedin.value.trim() : '',
      github: profileGithub ? profileGithub.value.trim() : '',
      target_roles: profileTargetRoles ? profileTargetRoles.value.trim() : '',
      core_skills: profileCoreSkills ? profileCoreSkills.value.trim() : '',
      custom_ai_instructions: profileCustomAiInstructions ? profileCustomAiInstructions.value.trim() : '',
      signature: profileSignature ? profileSignature.value.trim() : ''
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        userProfile = data.profile;
        if (profileRoleBadge) {
          const p = rolePresets[currentPresetId];
          profileRoleBadge.textContent = p ? p.name.split(' ')[0] : 'Custom';
        }
        showToast('🎉 AI Persona & Profile updated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to save profile', 'error');
      }
    } catch (err) {
      showToast('Network error while saving profile', 'error');
    } finally {
      if (saveProfileBtn) {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          <span>Save Profile & Apply Changes</span>
        `;
      }
    }
  }

  // Preset pill click listeners
  if (presetPillsGrid) {
    presetPillsGrid.addEventListener('click', (e) => {
      const pill = e.target.closest('.preset-pill');
      if (pill && pill.dataset.preset) {
        selectPreset(pill.dataset.preset);
      }
    });
  }

  if (resetPresetBtn) {
    resetPresetBtn.addEventListener('click', () => {
      if (currentPresetId) selectPreset(currentPresetId);
    });
  }

  if (autoGenerateSigBtn) {
    autoGenerateSigBtn.addEventListener('click', () => {
      generateSignatureFromFields();
      updateLivePreview();
      showToast('Generated signature from your profile info!', 'success');
    });
  }

  if (profileForm) {
    profileForm.addEventListener('submit', handleSaveProfile);
  }

  // Live preview update listeners
  [profileName, profileTitle, profileCoreSkills, profileCustomAiInstructions, profileSignature].forEach(el => {
    if (el) el.addEventListener('input', updateLivePreview);
  });

  // Resume upload in profile
  if (profileUploadResumeBtn && profileResumeInput) {
    profileUploadResumeBtn.addEventListener('click', () => profileResumeInput.click());
    profileResumeInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('resume', file);
      try {
        const res = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (profileResumeTitle) profileResumeTitle.textContent = `📄 Attached: ${data.filename}`;
          if (resumeFileName) resumeFileName.textContent = data.filename;
          if (resumeStatus) resumeStatus.style.display = 'flex';
          showToast(`Resume attached: ${data.filename}`, 'success');
        } else {
          showToast(data.error || 'Failed to upload resume', 'error');
        }
      } catch (err) {
        showToast('Error uploading resume', 'error');
      }
    });
  }

  // ── Steps ──
  function updateSteps(activeStep) {
    const steps = stepsBar.querySelectorAll('.step');
    const connectors = stepsBar.querySelectorAll('.step-connector');

    steps.forEach((step, i) => {
      const num = i + 1;
      step.classList.remove('active', 'completed');
      if (num === activeStep) step.classList.add('active');
      else if (num < activeStep) step.classList.add('completed');
    });

    connectors.forEach((c, i) => {
      c.classList.toggle('completed', i + 1 < activeStep);
    });
  }

  // ── Settings Modal ──
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
  });

  closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.style.display = 'none';
  });

  // ── Toast ──
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ── Keyboard shortcut ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      settingsModal.style.display = 'none';
    }
  });
});
