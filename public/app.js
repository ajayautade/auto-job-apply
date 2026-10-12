// ═══════════════════════════════════════════════
// JOB APPLY AI — Frontend Application
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // ── Element References ──
  // ── Element References ──
  const tabAutoPilot = document.getElementById('tabAutoPilot');
  const tabManual = document.getElementById('tabManual');
  const tabLeads = document.getElementById('tabLeads');
  const tabFollowUps = document.getElementById('tabFollowUps');
  const tabWhatsApp = document.getElementById('tabWhatsApp');
  const tabBounces = document.getElementById('tabBounces');
  const tabLiveJobs = document.getElementById('tabLiveJobs');
  const autopilotSection = document.getElementById('autopilotSection');
  const manualSectionContainer = document.getElementById('manualSectionContainer');
  const leadsSection = document.getElementById('leadsSection');
  const followupsSection = document.getElementById('followupsSection');
  const whatsappSection = document.getElementById('whatsappSection');
  const bouncesSection = document.getElementById('bouncesSection');
  const livejobsSection = document.getElementById('livejobsSection');
  const leadsTabBadge = document.getElementById('leadsTabBadge');
  const followUpsTabBadge = document.getElementById('followUpsTabBadge');
  const whatsAppTabBadge = document.getElementById('whatsAppTabBadge');
  const bouncesTabBadge = document.getElementById('bouncesTabBadge');
  const liveJobsTabBadge = document.getElementById('liveJobsTabBadge');

  // WhatsApp Filter Elements
  const whatsAppSearchInput = document.getElementById('whatsAppSearchInput');
  const whatsAppStatusFilters = document.getElementById('whatsAppStatusFilters');
  const waAllCount = document.getElementById('waAllCount');
  const waPendingCount = document.getElementById('waPendingCount');
  const waSentCount = document.getElementById('waSentCount');

  // Bounce Shield Elements
  const cleanBouncesNowBtn = document.getElementById('cleanBouncesNowBtn');
  const refreshBouncesBtn = document.getElementById('refreshBouncesBtn');
  const copyGmailFilterBtn = document.getElementById('copyGmailFilterBtn');
  const statCleanedBounces = document.getElementById('statCleanedBounces');
  const statTotalBounced = document.getElementById('statTotalBounced');
  const statLastCleaned = document.getElementById('statLastCleaned');
  const bouncedListTbody = document.getElementById('bouncedListTbody');

  // Live Job Radar Elements
  const scanLiveJobsBtn = document.getElementById('scanLiveJobsBtn');
  const scanLiveJobsBtnText = document.getElementById('scanLiveJobsBtnText');
  const statLiveTotal = document.getElementById('statLiveTotal');
  const statLiveHighMatch = document.getElementById('statLiveHighMatch');
  const statLiveCompanies = document.getElementById('statLiveCompanies');
  const statLiveApplied = document.getElementById('statLiveApplied');
  const liveJobsSearch = document.getElementById('liveJobsSearch');
  const liveJobsLocationFilter = document.getElementById('liveJobsLocationFilter');
  const liveJobsAtsFilter = document.getElementById('liveJobsAtsFilter');
  const liveJobsGrid = document.getElementById('liveJobsGrid');
  const liveJobsPageInfo = document.getElementById('liveJobsPageInfo');
  const liveJobsPrevBtn = document.getElementById('liveJobsPrevBtn');
  const liveJobsNextBtn = document.getElementById('liveJobsNextBtn');

  // Pitch Modal Elements
  const jobPitchModal = document.getElementById('jobPitchModal');
  const pitchModalTitle = document.getElementById('pitchModalTitle');
  const pitchModalSubtitle = document.getElementById('pitchModalSubtitle');
  const pitchRecipientInput = document.getElementById('pitchRecipientInput');
  const pitchSubjectInput = document.getElementById('pitchSubjectInput');
  const pitchBodyInput = document.getElementById('pitchBodyInput');
  const regeneratePitchBtn = document.getElementById('regeneratePitchBtn');
  const sendPitchApplicationBtn = document.getElementById('sendPitchApplicationBtn');
  const cancelPitchModalBtn = document.getElementById('cancelPitchModalBtn');
  const closePitchModalBtn = document.getElementById('closePitchModalBtn');

  let currentLivePage = 1;
  let totalLivePages = 1;
  let currentLiveStatus = 'ACTIVE';
  let currentLiveLocation = 'ALL';
  let currentLiveMinAts = 0;
  let currentLiveSearch = '';
  let activePitchJobId = null;
  let liveSearchTimer = null;

  // Extracted HR Directory Elements
  const extractedHrCard = document.getElementById('extractedHrCard');
  const extractedHrTotalBadge = document.getElementById('extractedHrTotalBadge');
  const downloadExtractedHrBtn = document.getElementById('downloadExtractedHrBtn');
  const topDownloadExtractedHrBtn = document.getElementById('topDownloadExtractedHrBtn');
  const refreshExtractedHrBtn = document.getElementById('refreshExtractedHrBtn');
  const statExtractedTotal = document.getElementById('statExtractedTotal');
  const statExtractedEmail = document.getElementById('statExtractedEmail');
  const statExtractedName = document.getElementById('statExtractedName');
  const statExtractedCompany = document.getElementById('statExtractedCompany');
  const extractedHrSearchInput = document.getElementById('extractedHrSearchInput');
  const extractedHrClearSearchBtn = document.getElementById('extractedHrClearSearchBtn');
  const extractedHrEmpty = document.getElementById('extractedHrEmpty');
  const extractedHrTable = document.getElementById('extractedHrTable');
  const extractedHrTableBody = document.getElementById('extractedHrTableBody');
  const extractedHrPageInfo = document.getElementById('extractedHrPageInfo');
  const extractedHrPrevBtn = document.getElementById('extractedHrPrevBtn');
  const extractedHrNextBtn = document.getElementById('extractedHrNextBtn');

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

  // Autonomous Daily 100 HR Campaign Elements
  const campSourceBadge = document.getElementById('campSourceBadge');
  const startDailyCampaignBtn = document.getElementById('startDailyCampaignBtn');
  const startDailyCampaignBtnText = document.getElementById('startDailyCampaignBtnText');
  const stopDailyCampaignBtn = document.getElementById('stopDailyCampaignBtn');
  const resetCampaignBtn = document.getElementById('resetCampaignBtn');
  const campTotalHRNum = document.getElementById('campTotalHRNum');
  const campContactedNum = document.getElementById('campContactedNum');
  const campRemainingNum = document.getElementById('campRemainingNum');
  const campBatchNum = document.getElementById('campBatchNum');
  const campTodaySentNum = document.getElementById('campTodaySentNum');
  const campaignProgressBox = document.getElementById('campaignProgressBox');
  const campaignProgressStatus = document.getElementById('campaignProgressStatus');
  const campaignProgressPercentage = document.getElementById('campaignProgressPercentage');
  const campaignProgressBar = document.getElementById('campaignProgressBar');
  const campaignCurrentLog = document.getElementById('campaignCurrentLog');

  // HR Contacts Directory Table Elements
  const hrSearchInput = document.getElementById('hrSearchInput');
  const hrFilterPills = document.getElementById('hrFilterPills');
  const hrFilterAllCount = document.getElementById('hrFilterAllCount');
  const hrFilterPendingCount = document.getElementById('hrFilterPendingCount');
  const hrFilterSentCount = document.getElementById('hrFilterSentCount');
  const refreshHRListBtn = document.getElementById('refreshHRListBtn');
  const hrContactsTableBody = document.getElementById('hrContactsTableBody');
  const hrPrevPageBtn = document.getElementById('hrPrevPageBtn');
  const hrNextPageBtn = document.getElementById('hrNextPageBtn');
  const hrPageInfo = document.getElementById('hrPageInfo');

  const watchFolderPath = document.getElementById('watchFolderPath');
  const copyPathBtn = document.getElementById('copyPathBtn');
  const scanFolderBtn = document.getElementById('scanFolderBtn');
  const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyTable = document.getElementById('historyTable');
  const historyTableBody = document.getElementById('historyTableBody');
  const historyPaginationBar = document.getElementById('historyPaginationBar');
  const historyPageInfo = document.getElementById('historyPageInfo');
  const historyPrevBtn = document.getElementById('historyPrevBtn');
  const historyNextBtn = document.getElementById('historyNextBtn');
  const historyPageNumbers = document.getElementById('historyPageNumbers');

  let historyCurrentPage = 1;
  const historyPageSize = 10;

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
  const importWhatsAppCsvBtn = document.getElementById('importWhatsAppCsvBtn');
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
  let currentWhatsAppFilter = 'ALL';
  let currentWhatsAppSearch = '';
  let leadsData = [];
  let currentLeadFilter = 'ALL';
  let selectedLeadIds = new Set();
  let userProfile = null;
  let rolePresets = {};
  let currentPresetId = 'devops';

  // ── Mode Switcher (8 Tabs) ──
  tabAutoPilot.addEventListener('click', () => switchMode('autopilot'));
  tabManual.addEventListener('click', () => switchMode('manual'));
  if (tabLeads) tabLeads.addEventListener('click', () => switchMode('leads'));
  if (tabFollowUps) tabFollowUps.addEventListener('click', () => switchMode('followups'));
  if (tabWhatsApp) tabWhatsApp.addEventListener('click', () => switchMode('whatsapp'));
  if (tabBounces) tabBounces.addEventListener('click', () => switchMode('bounces'));
  if (tabLiveJobs) tabLiveJobs.addEventListener('click', () => switchMode('livejobs'));

  function switchMode(mode) {
    tabAutoPilot.classList.toggle('active', mode === 'autopilot');
    tabManual.classList.toggle('active', mode === 'manual');
    if (tabLeads) tabLeads.classList.toggle('active', mode === 'leads');
    if (tabFollowUps) tabFollowUps.classList.toggle('active', mode === 'followups');
    if (tabWhatsApp) tabWhatsApp.classList.toggle('active', mode === 'whatsapp');
    if (tabBounces) tabBounces.classList.toggle('active', mode === 'bounces');
    if (tabLiveJobs) tabLiveJobs.classList.toggle('active', mode === 'livejobs');

    autopilotSection.style.display = mode === 'autopilot' ? 'flex' : 'none';
    manualSectionContainer.style.display = mode === 'manual' ? 'block' : 'none';
    if (leadsSection) leadsSection.style.display = mode === 'leads' ? 'flex' : 'none';
    if (followupsSection) followupsSection.style.display = mode === 'followups' ? 'flex' : 'none';
    if (whatsappSection) whatsappSection.style.display = mode === 'whatsapp' ? 'flex' : 'none';
    if (bouncesSection) bouncesSection.style.display = mode === 'bounces' ? 'flex' : 'none';
    if (livejobsSection) livejobsSection.style.display = mode === 'livejobs' ? 'flex' : 'none';

    loadingSection.style.display = 'none';
    reviewSection.style.display = 'none';
    successSection.style.display = 'none';

    if (mode === 'autopilot') {
      loadHistory();
      loadDailyStats();
      loadExtractedHRContacts(1);
    } else if (mode === 'leads') {
      loadCampaignStatus();
      loadHRContacts(1);
      loadLeads();
    } else if (mode === 'followups') {
      loadFollowUps();
    } else if (mode === 'whatsapp') {
      loadWhatsAppLeads();
    } else if (mode === 'bounces') {
      loadBounceStats();
    } else if (mode === 'livejobs') {
      loadLiveJobStats();
      loadLiveJobs(1);
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
      historyCurrentPage = 1;
      loadHistory();
      showToast('Activity log cleared', 'success');
    } catch (e) {
      showToast('Failed to clear log', 'error');
    }
  });

  // History Pagination Event Handlers
  if (historyPrevBtn) {
    historyPrevBtn.addEventListener('click', () => {
      if (historyCurrentPage > 1) {
        historyCurrentPage--;
        renderHistoryTable(historyData);
      }
    });
  }

  if (historyNextBtn) {
    historyNextBtn.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil((historyData || []).length / historyPageSize));
      if (historyCurrentPage < totalPages) {
        historyCurrentPage++;
        renderHistoryTable(historyData);
      }
    });
  }

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

  function renderHistoryPageNumbers(currentPage, totalPages) {
    if (!historyPageNumbers) return;
    historyPageNumbers.innerHTML = '';
    if (totalPages <= 1) return;

    let startP = Math.max(1, currentPage - 2);
    let endP = Math.min(totalPages, startP + 4);
    if (endP - startP < 4) {
      startP = Math.max(1, endP - 4);
    }

    const createPageBtn = (pageNum, isActive) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = isActive ? 'btn btn-primary btn-xs' : 'btn btn-ghost btn-xs';
      btn.style.cssText = `min-width: 28px; height: 28px; padding: 0 6px; font-size: 12px; font-weight: ${isActive ? '700' : '500'}; ${isActive ? 'background: linear-gradient(135deg, #7c5cfc 0%, #00d4aa 100%); color: #0a0a0f;' : 'color: #94a3b8; border: 1px solid rgba(255,255,255,0.08);'}`;
      btn.textContent = pageNum;
      if (!isActive) {
        btn.addEventListener('click', () => {
          historyCurrentPage = pageNum;
          renderHistoryTable(historyData);
        });
      }
      return btn;
    };

    if (startP > 1) {
      historyPageNumbers.appendChild(createPageBtn(1, currentPage === 1));
      if (startP > 2) {
        const dots = document.createElement('span');
        dots.style.cssText = 'padding: 0 4px; color: var(--text-muted); font-size: 12px;';
        dots.textContent = '...';
        historyPageNumbers.appendChild(dots);
      }
    }

    for (let p = startP; p <= endP; p++) {
      historyPageNumbers.appendChild(createPageBtn(p, p === currentPage));
    }

    if (endP < totalPages) {
      if (endP < totalPages - 1) {
        const dots = document.createElement('span');
        dots.style.cssText = 'padding: 0 4px; color: var(--text-muted); font-size: 12px;';
        dots.textContent = '...';
        historyPageNumbers.appendChild(dots);
      }
      historyPageNumbers.appendChild(createPageBtn(totalPages, currentPage === totalPages));
    }
  }

  function renderHistoryTable(items) {
    if (!items || items.length === 0) {
      historyEmpty.style.display = 'block';
      historyTable.style.display = 'none';
      if (historyPaginationBar) historyPaginationBar.style.display = 'none';
      return;
    }

    historyEmpty.style.display = 'none';
    historyTable.style.display = 'table';

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / historyPageSize));
    if (historyCurrentPage > totalPages) historyCurrentPage = totalPages;
    if (historyCurrentPage < 1) historyCurrentPage = 1;

    const startIndex = (historyCurrentPage - 1) * historyPageSize;
    const endIndex = Math.min(startIndex + historyPageSize, totalItems);
    const pageItems = items.slice(startIndex, endIndex);

    historyTableBody.innerHTML = '';

    pageItems.forEach((item, index) => {
      const globalIndex = startIndex + index;
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
          <button class="btn btn-ghost btn-sm view-details-btn" data-index="${globalIndex}" style="padding: 4px 10px; font-size: 12px;">
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

    // Update Pagination Controls
    if (historyPaginationBar) {
      historyPaginationBar.style.display = 'flex';
      if (historyPageInfo) {
        historyPageInfo.textContent = `Showing ${totalItems > 0 ? startIndex + 1 : 0}–${endIndex} of ${totalItems} emails (Page ${historyCurrentPage} of ${totalPages})`;
      }
      if (historyPrevBtn) {
        historyPrevBtn.disabled = (historyCurrentPage <= 1);
      }
      if (historyNextBtn) {
        historyNextBtn.disabled = (historyCurrentPage >= totalPages);
      }
      renderHistoryPageNumbers(historyCurrentPage, totalPages);
    }
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

  // ──────────────────────────────────────────────
  // 📋 EXTRACTED HR CONTACTS (FROM SCREENSHOTS)
  // ──────────────────────────────────────────────
  let extractedHrCurrentPage = 1;
  let extractedHrSearchQuery = '';
  let extractedHrSearchTimer = null;

  async function loadExtractedHRContacts(page = 1) {
    extractedHrCurrentPage = page;
    try {
      const url = `/api/extracted-hr?page=${extractedHrCurrentPage}&limit=20&search=${encodeURIComponent(extractedHrSearchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) return;

      // Update counters
      const totalNum = data.total || 0;
      if (extractedHrTotalBadge) extractedHrTotalBadge.textContent = `${totalNum.toLocaleString()} Extracted`;
      if (statExtractedTotal) statExtractedTotal.textContent = totalNum.toLocaleString();
      if (statExtractedEmail) statExtractedEmail.textContent = (data.withEmailCount || 0).toLocaleString();
      if (statExtractedName) statExtractedName.textContent = (data.withNameCount || 0).toLocaleString();
      if (statExtractedCompany) statExtractedCompany.textContent = (data.withCompanyCount || 0).toLocaleString();

      // Update Pagination
      const totalPages = data.total_pages || 1;
      if (extractedHrPageInfo) {
        extractedHrPageInfo.textContent = `Page ${data.page} of ${totalPages} (${totalNum.toLocaleString()} contacts)`;
      }
      if (extractedHrPrevBtn) extractedHrPrevBtn.disabled = data.page <= 1;
      if (extractedHrNextBtn) extractedHrNextBtn.disabled = data.page >= totalPages;

      // Render Table Rows
      renderExtractedHrTable(data.contacts || []);
    } catch (err) {
      console.warn('[ExtractedHR] Failed to load contacts:', err.message);
    }
  }

  function renderExtractedHrTable(contacts) {
    if (!extractedHrTable || !extractedHrTableBody) return;

    if (!contacts || contacts.length === 0) {
      if (extractedHrEmpty) extractedHrEmpty.style.display = 'block';
      extractedHrTable.style.display = 'none';
      return;
    }

    if (extractedHrEmpty) extractedHrEmpty.style.display = 'none';
    extractedHrTable.style.display = 'table';
    extractedHrTableBody.innerHTML = '';

    contacts.forEach((c, idx) => {
      const tr = document.createElement('tr');
      const rowNum = (extractedHrCurrentPage - 1) * 20 + (idx + 1);

      const nameHtml = c.name 
        ? `<div style="font-weight: 600; color: #fff;">${escapeHtml(c.name)}</div>`
        : `<span style="color: var(--text-muted); font-size: 12px; font-style: italic;">(blank)</span>`;

      const compHtml = c.company_name
        ? `<div style="font-weight: 500; color: #e2e8f0;">🏢 ${escapeHtml(c.company_name)}</div>`
        : `<span style="color: var(--text-muted); font-size: 12px; font-style: italic;">(blank)</span>`;

      const emailHtml = c.email
        ? `<a href="mailto:${escapeHtml(c.email)}" style="color: #38bdf8; text-decoration: none; font-family: monospace; font-size: 12.5px;" title="Click to email">${escapeHtml(c.email)}</a>`
        : `<span style="color: var(--text-muted); font-size: 12px; font-style: italic;">(blank)</span>`;

      const titleHtml = c.job_title
        ? `<span style="font-size: 12.5px; color: var(--text-secondary);">${escapeHtml(c.job_title)}</span>`
        : `<span style="color: var(--text-muted); font-size: 12px; font-style: italic;">(blank)</span>`;

      const dateStr = c.extracted_at ? new Date(c.extracted_at).toLocaleDateString('en-IN') : '-';
      const sourceStr = c.source ? escapeHtml(c.source) : 'Screenshot';

      tr.innerHTML = `
        <td style="color: var(--text-muted); font-size: 12px; font-family: monospace;">#${rowNum}</td>
        <td>${nameHtml}</td>
        <td>${compHtml}</td>
        <td>${emailHtml}</td>
        <td>${titleHtml}</td>
        <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">${dateStr}</td>
        <td style="font-size: 11.5px; color: var(--text-muted); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${sourceStr}">
          📸 ${sourceStr}
        </td>
      `;
      extractedHrTableBody.appendChild(tr);
    });
  }

  if (refreshExtractedHrBtn) {
    refreshExtractedHrBtn.addEventListener('click', () => {
      loadExtractedHRContacts(1);
      showToast('Extracted HR directory refreshed', 'info');
    });
  }

  if (extractedHrSearchInput) {
    extractedHrSearchInput.addEventListener('input', (e) => {
      clearTimeout(extractedHrSearchTimer);
      extractedHrSearchQuery = e.target.value;
      extractedHrSearchTimer = setTimeout(() => {
        loadExtractedHRContacts(1);
      }, 300);
    });
  }

  if (extractedHrClearSearchBtn) {
    extractedHrClearSearchBtn.addEventListener('click', () => {
      if (extractedHrSearchInput) extractedHrSearchInput.value = '';
      extractedHrSearchQuery = '';
      loadExtractedHRContacts(1);
    });
  }

  if (extractedHrPrevBtn) {
    extractedHrPrevBtn.addEventListener('click', () => {
      if (extractedHrCurrentPage > 1) {
        loadExtractedHRContacts(extractedHrCurrentPage - 1);
      }
    });
  }

  if (extractedHrNextBtn) {
    extractedHrNextBtn.addEventListener('click', () => {
      loadExtractedHRContacts(extractedHrCurrentPage + 1);
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

      const pendingCount = whatsAppLeadsData.filter(l => l.status === 'PENDING_APPROVAL').length;
      const sentCount = whatsAppLeadsData.filter(l => l.status === 'SENT').length;
      const totalCount = whatsAppLeadsData.length;

      // Update badge count
      if (whatsAppTabBadge) {
        if (pendingCount > 0) {
          whatsAppTabBadge.style.display = 'inline-block';
          whatsAppTabBadge.textContent = `${pendingCount} pending`;
        } else {
          whatsAppTabBadge.style.display = 'inline-block';
          whatsAppTabBadge.textContent = `${totalCount} leads`;
        }
      }

      // Update WhatsApp filter counter pills
      if (waAllCount) waAllCount.textContent = totalCount;
      if (waPendingCount) waPendingCount.textContent = pendingCount;
      if (waSentCount) waSentCount.textContent = sentCount;

      applyWhatsAppFilterAndRender();
    } catch (e) {
      console.error('Failed to load WhatsApp leads:', e);
    }
  }

  function applyWhatsAppFilterAndRender() {
    let filtered = whatsAppLeadsData || [];

    // Filter by status tab
    if (currentWhatsAppFilter === 'PENDING') {
      filtered = filtered.filter(l => l.status === 'PENDING_APPROVAL');
    } else if (currentWhatsAppFilter === 'SENT') {
      filtered = filtered.filter(l => l.status === 'SENT');
    }

    // Filter by search query
    const query = (currentWhatsAppSearch || '').trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(l => {
        const title = (l.job_title || '').toLowerCase();
        const comp = (l.company_name || '').toLowerCase();
        const contact = (l.contact_person || '').toLowerCase();
        const phone = (l.phone_number || '').toLowerCase();
        const dPhone = (l.display_phone || '').toLowerCase();
        const msg = (l.message_draft || '').toLowerCase();
        return title.includes(query) ||
               comp.includes(query) ||
               contact.includes(query) ||
               phone.includes(query) ||
               dPhone.includes(query) ||
               msg.includes(query);
      });
    }

    renderWhatsAppLeads(filtered);
  }

  function renderWhatsAppLeads(leads) {
    if (!whatsAppEmpty || !whatsAppLeadsGrid) return;

    if (!leads || leads.length === 0) {
      whatsAppEmpty.style.display = 'block';
      whatsAppLeadsGrid.style.display = 'none';

      const emptyTitle = whatsAppEmpty.querySelector('.history-empty-title');
      const emptyDesc = whatsAppEmpty.querySelector('.history-empty-desc');
      if (currentWhatsAppSearch || currentWhatsAppFilter !== 'ALL') {
        if (emptyTitle) emptyTitle.textContent = 'No Matching WhatsApp Leads Found';
        if (emptyDesc) emptyDesc.textContent = 'Try searching with a different keyword or switching to "All" status.';
      } else {
        if (emptyTitle) emptyTitle.textContent = 'No WhatsApp Leads Shortlisted Yet';
        if (emptyDesc) emptyDesc.textContent = 'When you drop job screenshots containing recruiter mobile/phone numbers, they will be automatically extracted, drafted, and shortlisted here!';
      }
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

  if (importWhatsAppCsvBtn) {
    importWhatsAppCsvBtn.addEventListener('click', async () => {
      try {
        importWhatsAppCsvBtn.disabled = true;
        importWhatsAppCsvBtn.innerHTML = '<span>⏳ Importing...</span>';
        const res = await fetch('/api/whatsapp/import-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Imported ${data.imported_count} recruiter WhatsApp leads with DevOps messages!`, 'success');
          loadWhatsAppLeads();
        } else {
          showToast(data.error || 'Failed to import WhatsApp leads', 'error');
        }
      } catch (err) {
        showToast('Error importing CSV: ' + err.message, 'error');
      } finally {
        importWhatsAppCsvBtn.disabled = false;
        importWhatsAppCsvBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Import Leads from CSV
        `;
      }
    });
  }

  // ── WhatsApp Search & Filter Controls in Operations Hub ──
  if (whatsAppSearchInput) {
    whatsAppSearchInput.addEventListener('input', (e) => {
      currentWhatsAppSearch = e.target.value;
      applyWhatsAppFilterAndRender();
    });
  }

  if (whatsAppStatusFilters) {
    whatsAppStatusFilters.querySelectorAll('.wa-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        whatsAppStatusFilters.querySelectorAll('.wa-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentWhatsAppFilter = btn.getAttribute('data-filter') || 'ALL';
        applyWhatsAppFilterAndRender();
      });
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
      loadCampaignStatus();
      showToast('Recruiter leads & campaign refreshed', 'info');
    });
  }

  // ──────────────────────────────────────────────
  // 📋 HR Contacts Directory & Pagination State
  // ──────────────────────────────────────────────
  let hrCurrentPage = 1;
  let hrTotalPages = 1;
  let hrSearchQuery = '';
  let hrStatusFilter = 'ALL';
  let hrSearchTimer = null;

  async function loadHRContacts(page = 1) {
    hrCurrentPage = page;
    try {
      const url = `/api/campaign/hr-contacts?page=${hrCurrentPage}&limit=20&search=${encodeURIComponent(hrSearchQuery)}&status=${hrStatusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) return;

      hrTotalPages = data.total_pages || 1;
      if (hrPageInfo) hrPageInfo.textContent = `Page ${data.page} of ${hrTotalPages} (${data.total.toLocaleString()} contacts)`;
      const hrDirTitle = document.getElementById('hrDirectoryTitle');
      if (hrDirTitle && data.total) hrDirTitle.textContent = `📋 HR & Recruiter Contact Directory (${data.total.toLocaleString()} Contacts)`;
      if (hrPrevPageBtn) hrPrevPageBtn.disabled = data.page <= 1;
      if (hrNextPageBtn) hrNextPageBtn.disabled = data.page >= hrTotalPages;

      if (hrContactsTableBody) {
        if (!data.contacts || data.contacts.length === 0) {
          hrContactsTableBody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center; padding: 28px; color: var(--text-muted);">
                🔍 No HR contacts found matching your search.
              </td>
            </tr>
          `;
          return;
        }

        hrContactsTableBody.innerHTML = data.contacts.map((c, idx) => {
          const serial = (data.page - 1) * data.limit + idx + 1;
          const isSent = c.status === 'SENT';
          const statusBadge = isSent
            ? `<span class="badge badge-success" style="font-size: 0.75rem; padding: 3px 8px;">✅ SENT ${c.sent_at ? new Date(c.sent_at).toLocaleDateString() : ''}</span>`
            : `<span class="badge badge-warning" style="font-size: 0.75rem; padding: 3px 8px;">⏳ READY FOR BATCH</span>`;
          
          const actionBtn = isSent
            ? `<span style="font-size: 0.8rem; color: var(--text-muted);">Sent</span>`
            : `<button type="button" class="btn btn-secondary btn-sm send-direct-hr-btn" data-email="${c.email}" data-name="${encodeURIComponent(c.name)}" data-title="${encodeURIComponent(c.title)}" data-company="${encodeURIComponent(c.company)}" style="padding: 4px 10px; font-size: 0.8rem;">
                <span>⚡ Send Now</span>
               </button>`;

          return `
            <tr>
              <td style="color: var(--text-muted); font-weight: 600;">#${serial}</td>
              <td>
                <div style="font-weight: 600; color: #fff;">${c.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${c.title}</div>
              </td>
              <td><span style="font-weight: 500; color: #a5b4fc;">${c.company}</span></td>
              <td><code style="font-size: 0.82rem; color: #34d399;">${c.email}</code></td>
              <td>${statusBadge}</td>
              <td>${actionBtn}</td>
            </tr>
          `;
        }).join('');
      }
    } catch (e) {
      console.error('Failed to load HR contacts:', e);
    }
  }

  // HR Table Event Listeners
  if (hrPrevPageBtn) {
    hrPrevPageBtn.addEventListener('click', () => {
      if (hrCurrentPage > 1) loadHRContacts(hrCurrentPage - 1);
    });
  }

  if (hrNextPageBtn) {
    hrNextPageBtn.addEventListener('click', () => {
      if (hrCurrentPage < hrTotalPages) loadHRContacts(hrCurrentPage + 1);
    });
  }

  if (hrSearchInput) {
    hrSearchInput.addEventListener('input', (e) => {
      clearTimeout(hrSearchTimer);
      hrSearchTimer = setTimeout(() => {
        hrSearchQuery = e.target.value.trim();
        loadHRContacts(1);
      }, 300);
    });
  }

  if (hrFilterPills) {
    hrFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (pill && pill.dataset.filter) {
        hrFilterPills.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        hrStatusFilter = pill.dataset.filter;
        loadHRContacts(1);
      }
    });
  }

  if (refreshHRListBtn) {
    refreshHRListBtn.addEventListener('click', () => {
      loadHRContacts(hrCurrentPage);
      loadCampaignStatus();
      showToast('HR Directory refreshed', 'info');
    });
  }

  if (hrContactsTableBody) {
    hrContactsTableBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('.send-direct-hr-btn');
      if (btn && !btn.disabled) {
        const email = btn.dataset.email;
        const name = decodeURIComponent(btn.dataset.name);
        const title = decodeURIComponent(btn.dataset.title);
        const company = decodeURIComponent(btn.dataset.company);

        btn.disabled = true;
        const origText = btn.innerHTML;
        btn.innerHTML = 'Sending...';

        try {
          const res = await fetch('/api/campaign/send-hr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contact: { email, name, title, company } })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`✅ Cold email sent to ${name} at ${company}!`, 'success');
            loadHRContacts(hrCurrentPage);
            loadCampaignStatus();
          } else {
            showToast(`Failed: ${data.error || 'Could not send email'}`, 'error');
            btn.disabled = false;
            btn.innerHTML = origText;
          }
        } catch (err) {
          showToast(`Send error: ${err.message}`, 'error');
          btn.disabled = false;
          btn.innerHTML = origText;
        }
      }
    });
  }

  // ── 🚀 Autonomous Daily 100 HR Cold Mail Campaign ──
  async function loadCampaignStatus() {
    try {
      const res = await fetch('/api/campaign/status');
      const data = await res.json();
      if (!data.success) return;

      const stats = data.stats || {};
      if (campTotalHRNum) campTotalHRNum.textContent = stats.hr_csv_total || '1,842';
      if (campContactedNum) campContactedNum.textContent = stats.hr_csv_sent || 0;
      if (campRemainingNum) campRemainingNum.textContent = stats.hr_csv_remaining || 0;
      if (campBatchNum && data.batch_info) {
        campBatchNum.textContent = `Batch ${data.batch_info.current_batch} of ${data.batch_info.total_batches}`;
      }
      if (campTodaySentNum) campTodaySentNum.textContent = `${stats.today_sent || 0}/${stats.daily_limit || 150}`;

      if (hrFilterAllCount) hrFilterAllCount.textContent = stats.hr_csv_total || 0;
      if (hrFilterPendingCount) hrFilterPendingCount.textContent = stats.hr_csv_remaining || 0;
      if (hrFilterSentCount) hrFilterSentCount.textContent = stats.hr_csv_sent || 0;

      if (campSourceBadge) {
        const totalFormatted = (stats.hr_csv_total || 3044).toLocaleString();
        campSourceBadge.textContent = data.source === 'CSV_LIST'
          ? `📦 Pre-Loaded ${totalFormatted} HR Contacts (CSV)`
          : `🤖 AI Online Recruiter Discovery`;
      }

      const prog = data.progress || {};
      if (data.is_running) {
        if (startDailyCampaignBtn) startDailyCampaignBtn.style.display = 'none';
        if (stopDailyCampaignBtn) stopDailyCampaignBtn.style.display = 'inline-flex';
        if (campaignProgressBox) campaignProgressBox.style.display = 'flex';

        const pct = prog.target > 0 ? Math.round((prog.current / prog.target) * 100) : 0;
        if (campaignProgressStatus) campaignProgressStatus.textContent = `🚀 Processing: ${prog.current_contact || 'Connecting...'} (${prog.current}/${prog.target})`;
        if (campaignProgressPercentage) campaignProgressPercentage.textContent = `${pct}%`;
        if (campaignProgressBar) campaignProgressBar.style.width = `${pct}%`;
        if (campaignCurrentLog) campaignCurrentLog.textContent = prog.last_log || 'Dispatched cold email with resume...';
      } else {
        if (startDailyCampaignBtn) startDailyCampaignBtn.style.display = 'inline-flex';
        if (stopDailyCampaignBtn) stopDailyCampaignBtn.style.display = 'none';
        if (prog.completed_at && campaignProgressBox) {
          campaignProgressBox.style.display = 'flex';
          if (campaignProgressStatus) campaignProgressStatus.textContent = '✅ Today’s Batch Completed';
          if (campaignProgressPercentage) campaignProgressPercentage.textContent = '100%';
          if (campaignProgressBar) campaignProgressBar.style.width = '100%';
          if (campaignCurrentLog) campaignCurrentLog.textContent = prog.last_log || 'Finished today’s 100 cold outreach.';
        }
      }
    } catch (e) {
      console.error('Failed to load campaign status:', e);
    }
  }

  if (startDailyCampaignBtn) {
    startDailyCampaignBtn.addEventListener('click', async () => {
      const origText = startDailyCampaignBtn.innerHTML;
      startDailyCampaignBtn.disabled = true;
      startDailyCampaignBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin-right: 6px;"></span> Starting 100 Batch...';

      try {
        const res = await fetch('/api/campaign/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_count: 100 })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`🚀 Launched daily 100 HR cold email batch! Target: ${data.target_count} leaders.`, 'success');
          loadCampaignStatus();
          loadHRContacts(hrCurrentPage);
          loadLeads();
        } else {
          showToast(`Could not launch campaign: ${data.error || data.message}`, 'error');
        }
      } catch (err) {
        showToast(`Campaign launch error: ${err.message}`, 'error');
      } finally {
        startDailyCampaignBtn.disabled = false;
        startDailyCampaignBtn.innerHTML = origText;
      }
    });
  }

  if (stopDailyCampaignBtn) {
    stopDailyCampaignBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/campaign/stop', { method: 'POST' });
        const data = await res.json();
        showToast(data.message || 'Campaign paused', 'info');
        loadCampaignStatus();
        loadHRContacts(hrCurrentPage);
      } catch (err) {
        showToast(`Error stopping campaign: ${err.message}`, 'error');
      }
    });
  }

  if (resetCampaignBtn) {
    resetCampaignBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to reset the HR contacts campaign progress? This will mark all 1,842 CSV contacts as uncontacted.')) {
        try {
          const res = await fetch('/api/campaign/reset', { method: 'POST' });
          const data = await res.json();
          if (data.success) {
            showToast('HR contacts campaign history reset successfully!', 'success');
            loadCampaignStatus();
            loadHRContacts(1);
          }
        } catch (e) {
          showToast('Failed to reset campaign history', 'error');
        }
      }
    });
  }

  // ── Initialize ──
  checkSettings();
  loadHistory();
  loadDailyStats();
  loadLeads();
  loadCampaignStatus();
  loadHRContacts(1);
  loadFollowUps();
  loadWhatsAppLeads();
  loadBounceStats();

  // Auto-poll history, daily stats, leads, campaign, followups, whatsapp, bounces periodically
  setInterval(() => {
    if (autopilotSection && autopilotSection.style.display !== 'none') {
      loadHistory();
      loadDailyStats();
    } else if (leadsSection && leadsSection.style.display !== 'none') {
      loadCampaignStatus();
    } else if (followupsSection && followupsSection.style.display !== 'none') {
      loadFollowUps();
    } else if (whatsappSection && whatsappSection.style.display !== 'none') {
      loadWhatsAppLeads();
    } else if (bouncesSection && bouncesSection.style.display !== 'none') {
      loadBounceStats();
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
        const profileRoleBadge = document.getElementById('profileRoleBadge');
        if (profileRoleBadge) {
          const pName = data.profile.preset_id ? (data.profile.preset_id.charAt(0).toUpperCase() + data.profile.preset_id.slice(1)) : 'Profile';
          profileRoleBadge.textContent = pName;
        }
        if (typeof window.syncBulkPitchFromProfile === 'function') {
          window.syncBulkPitchFromProfile(data.profile);
        }
      }

      if (data.has_resume) {
        showResumeStatus(data.resume_name);
        const profileResumeTitle = document.getElementById('profileResumeTitle');
        if (profileResumeTitle) profileResumeTitle.textContent = `📄 Attached: ${data.resume_name}`;
        const bulkResumeLabel = document.getElementById('bulkAttachResumeLabel');
        if (bulkResumeLabel) bulkResumeLabel.innerHTML = `📎 Attach Active Resume (<code>${data.resume_name}</code>)`;
      }
    } catch (err) {
      console.error('Failed to check settings:', err);
    }
  }

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

  // ── Bounce Shield & Auto-Cleaner Logic ──
  async function loadBounceStats() {
    try {
      const res = await fetch('/api/bounces/stats');
      if (!res.ok) return;
      const data = await res.json();
      if (statCleanedBounces) statCleanedBounces.textContent = data.totalCleanedFromInbox || 0;
      if (statTotalBounced) statTotalBounced.textContent = data.totalBounced || 0;
      if (bouncesTabBadge) bouncesTabBadge.textContent = `${data.totalCleanedFromInbox || 0} Trashed`;
      if (statLastCleaned) {
        statLastCleaned.textContent = data.lastCleanedAt ? new Date(data.lastCleanedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending';
      }

      if (bouncedListTbody) {
        const emails = Object.entries(data.bouncedEmails || {});
        if (emails.length === 0) {
          bouncedListTbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 24px; color: var(--text-muted);">✨ No bounced addresses recorded yet. All recipients deliverable!</td></tr>`;
        } else {
          bouncedListTbody.innerHTML = emails.map(([email, info]) => {
            const dateStr = info.bouncedAt ? new Date(info.bouncedAt).toLocaleDateString() : 'Recent';
            return `
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 10px; font-weight: 600; color: #fca5a5;">${escapeHtml(email)}</td>
                <td style="padding: 10px; color: var(--text-muted); font-size: 12px;">${escapeHtml(info.reason || 'Address not found')}</td>
                <td style="padding: 10px; color: var(--text-muted); font-size: 12px;">${dateStr}</td>
                <td style="padding: 10px;"><span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(239, 68, 68, 0.2); color: #f87171; font-weight: 600;">BLOCKED</span></td>
              </tr>
            `;
          }).join('');
        }
      }
    } catch (e) {
      console.warn('Could not load bounce stats:', e.message);
    }
  }

  if (cleanBouncesNowBtn) {
    cleanBouncesNowBtn.addEventListener('click', async () => {
      cleanBouncesNowBtn.disabled = true;
      const originalText = cleanBouncesNowBtn.innerHTML;
      cleanBouncesNowBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span>Scanning & Cleaning Inbox...</span>
      `;
      try {
        const res = await fetch('/api/bounces/clean', { method: 'POST' });
        const result = await res.json();
        if (result.success) {
          if (result.cleanedCount > 0) {
            showToast(`🧹 Cleaned & trashed ${result.cleanedCount} bounce error emails from Inbox!`, 'success');
          } else {
            showToast('✨ Inbox is completely clean! Zero bounce emails found.', 'success');
          }
          await loadBounceStats();
        } else {
          showToast(`Clean failed: ${result.message || result.error}`, 'error');
        }
      } catch (err) {
        showToast(`Failed to connect: ${err.message}`, 'error');
      } finally {
        cleanBouncesNowBtn.disabled = false;
        cleanBouncesNowBtn.innerHTML = originalText;
      }
    });
  }

  if (refreshBouncesBtn) {
    refreshBouncesBtn.addEventListener('click', () => loadBounceStats());
  }

  if (copyGmailFilterBtn) {
    copyGmailFilterBtn.addEventListener('click', async () => {
      const q = document.getElementById('gmailFilterQuery').textContent;
      try {
        await navigator.clipboard.writeText(q);
        showToast('Gmail search query copied to clipboard!', 'success');
      } catch (e) {}
    });
  }

  // ═══════════════════════════════════════════════
  // 🌐 LIVE JOB RADAR (ATS JOB SOURCING CLIENT)
  // ═══════════════════════════════════════════════

  async function loadLiveJobStats() {
    try {
      const res = await fetch('/api/jobs/stats');
      const data = await res.json();
      if (!data.success) return;
      const s = data.stats || {};
      if (statLiveTotal) statLiveTotal.textContent = (s.total_jobs || 0).toLocaleString();
      if (statLiveHighMatch) statLiveHighMatch.textContent = (s.high_match || 0).toLocaleString();
      if (statLiveCompanies) statLiveCompanies.textContent = `${s.monitored_companies || 25}+`;
      if (statLiveApplied) statLiveApplied.textContent = (s.applied_jobs || 0).toLocaleString();
      if (liveJobsTabBadge) {
        liveJobsTabBadge.textContent = `${s.total_jobs || 0} jobs`;
      }
      const refreshTimeEl = document.getElementById('liveJobsRefreshTimeText');
      if (refreshTimeEl && s.last_scanned_at) {
        const lastDate = new Date(s.last_scanned_at);
        const timeStr = lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isToday = lastDate.toDateString() === new Date().toDateString();
        const dateStr = isToday ? `Today, ${timeStr}` : `${lastDate.toLocaleDateString()}, ${timeStr}`;
        refreshTimeEl.textContent = `• Last auto-scan: ${dateStr}`;
      }
    } catch (e) {
      console.warn('[LiveJobs] Failed to load stats:', e.message);
    }
  }

  async function loadLiveJobs(page = 1) {
    currentLivePage = page;
    if (!liveJobsGrid) return;

    liveJobsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <div style="margin-top: 10px; font-weight: 600;">Sourcing Live DevOps & Cloud Engineering Openings...</div>
      </div>
    `;

    try {
      const queryParams = new URLSearchParams({
        page: currentLivePage,
        limit: 18,
        search: currentLiveSearch,
        status: currentLiveStatus,
        min_ats_score: currentLiveMinAts,
        location_filter: currentLiveLocation
      });

      const res = await fetch(`/api/jobs/live?${queryParams.toString()}`);
      const data = await res.json();
      if (!data.success) return;

      totalLivePages = data.total_pages || 1;
      if (liveJobsPageInfo) {
        liveJobsPageInfo.textContent = `Page ${data.page} of ${totalLivePages} (${data.total.toLocaleString()} jobs)`;
      }
      if (liveJobsPrevBtn) liveJobsPrevBtn.disabled = data.page <= 1;
      if (liveJobsNextBtn) liveJobsNextBtn.disabled = data.page >= totalLivePages;

      if (!data.jobs || data.jobs.length === 0) {
        liveJobsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(255, 255, 255, 0.1);">
            <div style="font-size: 32px; margin-bottom: 10px;">🔍</div>
            <h3 style="font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px;">No Matching Jobs Found</h3>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 460px; margin: 0 auto 16px;">
              Try relaxing your search query or lowering the ATS Match filter. You can also trigger a live ATS scan now.
            </p>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('scanLiveJobsBtn').click()">
              ⚡ Scan Live ATS Boards Now
            </button>
          </div>
        `;
        return;
      }

      liveJobsGrid.innerHTML = data.jobs.map(job => {
        const score = job.ats_score || 70;
        let scoreClass = 'ats-score-norm';
        let scoreIcon = '🎯';
        if (score >= 80) {
          scoreClass = 'ats-score-high';
          scoreIcon = '🔥';
        } else if (score >= 74) {
          scoreClass = 'ats-score-med';
          scoreIcon = '⚡';
        }

        const isApplied = job.status === 'APPLIED';
        const isSaved = job.status === 'SAVED';
        const cardStatusClass = isApplied ? 'status-applied' : (isSaved ? 'status-saved' : '');

        const skillsHtml = (job.matched_skills || ['AWS', 'Kubernetes', 'CI/CD']).slice(0, 5).map(skill => 
          `<span class="livejob-skill-chip">${escapeHtml(skill)}</span>`
        ).join('');

        const targetEmail = job.careers_email || job.hr_email || `careers@${job.domain}`;

        return `
          <div class="livejob-card ${cardStatusClass}" data-job-id="${job.id}">
            <div>
              <div class="livejob-top">
                <div>
                  <div class="livejob-company-badge">
                    <span>🏢 ${escapeHtml(job.company)}</span>
                    <span style="font-size: 10.5px; padding: 2px 6px; border-radius: 4px; background: rgba(255, 255, 255, 0.06); color: var(--text-muted); font-weight: 500;">
                      ${escapeHtml(job.source || 'ATS')}
                    </span>
                  </div>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                    ${escapeHtml(job.category || 'Tech')}
                  </div>
                </div>
                <div class="livejob-ats-pill ${scoreClass}" title="ATS Match Algorithm Score">
                  <span>${scoreIcon}</span>
                  <span>${score}% ATS MATCH</span>
                </div>
              </div>

              <h4 class="livejob-title" title="${escapeHtml(job.title)}">
                ${escapeHtml(job.title)}
              </h4>

              <div class="livejob-meta-row">
                <span class="livejob-meta-tag">
                  📍 ${escapeHtml(job.location)}
                </span>
                ${job.is_remote ? '<span class="livejob-meta-tag" style="color: #38bdf8;">🌍 Remote</span>' : ''}
                ${job.is_india ? '<span class="livejob-meta-tag" style="color: #34d399;">🇮🇳 India</span>' : ''}
                <span class="livejob-meta-tag" style="color: var(--text-muted);" title="Target recruiter inbox">
                  ✉️ ${escapeHtml(targetEmail)}
                </span>
              </div>

              <div class="livejob-skills-wrap">
                ${skillsHtml}
              </div>

              <p style="font-size: 12px; color: var(--text-muted); line-height: 1.5; margin: 0 0 14px; max-height: 52px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                ${escapeHtml(job.description_snippet || '')}
              </p>
            </div>

            <div class="livejob-actions">
              ${isApplied ? `
                <span class="badge badge-success" style="font-size: 11.5px; padding: 5px 10px;">
                  ✅ Applied ${job.applied_at ? new Date(job.applied_at).toLocaleDateString() : ''}
                </span>
              ` : `
                <button type="button" class="btn btn-primary btn-sm livejob-pitch-btn" data-id="${job.id}" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
                  <span>✨ AI Pitch</span>
                </button>
                <button type="button" class="btn btn-secondary btn-sm livejob-quick-apply-btn" data-id="${job.id}" title="1-click apply with resume attached">
                  <span>⚡ Quick Apply</span>
                </button>
              `}

              ${job.apply_url ? `
                <a href="${escapeHtml(job.apply_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" title="Open official company job posting">
                  <span>🔗 Portal</span>
                </a>
              ` : ''}

              <button type="button" class="btn btn-ghost btn-sm livejob-save-btn" data-id="${job.id}" data-saved="${isSaved}" title="${isSaved ? 'Unsave' : 'Save'} job" style="padding: 6px 8px; margin-left: auto;">
                <span>${isSaved ? '⭐' : '☆'}</span>
              </button>
              <button type="button" class="btn btn-ghost btn-sm livejob-dismiss-btn" data-id="${job.id}" title="Dismiss job" style="padding: 6px 8px; color: var(--text-muted);">
                <span>✕</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Wire up card action buttons
      attachLiveJobCardListeners();

    } catch (e) {
      liveJobsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 24px; color: #f87171; text-align: center;">
          Failed to load live jobs: ${e.message}
        </div>
      `;
    }
  }

  function attachLiveJobCardListeners() {
    if (!liveJobsGrid) return;

    // AI Pitch modal
    liveJobsGrid.querySelectorAll('.livejob-pitch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const jobId = e.currentTarget.getAttribute('data-id');
        openJobPitchModal(jobId);
      });
    });

    // Quick apply
    liveJobsGrid.querySelectorAll('.livejob-quick-apply-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const jobId = e.currentTarget.getAttribute('data-id');
        await quickApplyJob(jobId, e.currentTarget);
      });
    });

    // Save toggle
    liveJobsGrid.querySelectorAll('.livejob-save-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const jobId = e.currentTarget.getAttribute('data-id');
        const isSaved = e.currentTarget.getAttribute('data-saved') === 'true';
        await toggleSaveJob(jobId, !isSaved, e.currentTarget);
      });
    });

    // Dismiss
    liveJobsGrid.querySelectorAll('.livejob-dismiss-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const jobId = e.currentTarget.getAttribute('data-id');
        await dismissJob(jobId, e.currentTarget);
      });
    });
  }

  // ── Live Job Radar Event Listeners ──
  if (scanLiveJobsBtn) {
    scanLiveJobsBtn.addEventListener('click', async () => {
      scanLiveJobsBtn.disabled = true;
      const originalText = scanLiveJobsBtnText.textContent;
      scanLiveJobsBtnText.textContent = 'Scanning 25+ ATS Boards...';
      try {
        const res = await fetch('/api/jobs/scan', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast(`⚡ Scanned live ATS boards! Found ${data.total} total jobs (${data.new_jobs_found} newly added).`, 'success');
          await loadLiveJobStats();
          await loadLiveJobs(1);
        } else {
          showToast(`Scan warning: ${data.message}`, 'warning');
        }
      } catch (err) {
        showToast(`Scan error: ${err.message}`, 'error');
      } finally {
        scanLiveJobsBtn.disabled = false;
        scanLiveJobsBtnText.textContent = originalText;
      }
    });
  }

  if (liveJobsSearch) {
    liveJobsSearch.addEventListener('input', (e) => {
      clearTimeout(liveSearchTimer);
      liveSearchTimer = setTimeout(() => {
        currentLiveSearch = e.target.value.trim();
        loadLiveJobs(1);
      }, 350);
    });
  }

  if (liveJobsLocationFilter) {
    liveJobsLocationFilter.addEventListener('change', (e) => {
      currentLiveLocation = e.target.value;
      loadLiveJobs(1);
    });
  }

  if (liveJobsAtsFilter) {
    liveJobsAtsFilter.addEventListener('change', (e) => {
      currentLiveMinAts = parseInt(e.target.value, 10) || 0;
      loadLiveJobs(1);
    });
  }

  document.querySelectorAll('.livejobs-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.livejobs-tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentLiveStatus = e.currentTarget.getAttribute('data-status');
      loadLiveJobs(1);
    });
  });

  if (liveJobsPrevBtn) {
    liveJobsPrevBtn.addEventListener('click', () => {
      if (currentLivePage > 1) loadLiveJobs(currentLivePage - 1);
    });
  }

  if (liveJobsNextBtn) {
    liveJobsNextBtn.addEventListener('click', () => {
      if (currentLivePage < totalLivePages) loadLiveJobs(currentLivePage + 1);
    });
  }

  // ── AI Pitch Modal Functions ──
  async function openJobPitchModal(jobId) {
    activePitchJobId = jobId;
    if (!jobPitchModal) return;

    jobPitchModal.style.display = 'flex';
    pitchBodyInput.value = 'Generating tailored DevOps & Cloud pitch using Gemini AI...';
    pitchBodyInput.disabled = true;
    if (sendPitchApplicationBtn) sendPitchApplicationBtn.disabled = true;

    try {
      const res = await fetch(`/api/jobs/${jobId}/generate-pitch`, { method: 'POST' });
      const data = await res.json();
      if (data.success && data.pitch) {
        pitchSubjectInput.value = data.pitch.subject || '';
        pitchBodyInput.value = data.pitch.body || '';
        pitchBodyInput.disabled = false;
        if (sendPitchApplicationBtn) sendPitchApplicationBtn.disabled = false;

        // Fetch job detail to populate email recipient
        const card = document.querySelector(`.livejob-card[data-job-id="${jobId}"]`);
        if (card) {
          const compName = card.querySelector('.livejob-company-badge span').textContent.replace('🏢 ', '');
          pitchModalTitle.textContent = `✨ AI Pitch for ${compName}`;
          // Get recipient email from text or default
          const emailMeta = card.querySelector('.livejob-meta-row').textContent;
          const match = emailMeta.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          pitchRecipientInput.value = match ? match[1] : `careers@company.com`;
        }
      } else {
        pitchBodyInput.value = 'Failed to generate pitch. You can type your own application message above.';
        pitchBodyInput.disabled = false;
        if (sendPitchApplicationBtn) sendPitchApplicationBtn.disabled = false;
      }
    } catch (e) {
      pitchBodyInput.value = `Error generating pitch: ${e.message}`;
      pitchBodyInput.disabled = false;
    }
  }

  if (regeneratePitchBtn) {
    regeneratePitchBtn.addEventListener('click', () => {
      if (activePitchJobId) openJobPitchModal(activePitchJobId);
    });
  }

  if (sendPitchApplicationBtn) {
    sendPitchApplicationBtn.addEventListener('click', async () => {
      if (!activePitchJobId) return;

      const recipient = pitchRecipientInput.value.trim();
      const subject = pitchSubjectInput.value.trim();
      const body = pitchBodyInput.value.trim();

      if (!recipient || !recipient.includes('@')) {
        showToast('Please enter a valid recipient email address', 'error');
        return;
      }

      sendPitchApplicationBtn.disabled = true;
      const originalText = sendPitchApplicationBtn.innerHTML;
      sendPitchApplicationBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span>Sending Application...</span>
      `;

      try {
        const res = await fetch(`/api/jobs/${activePitchJobId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            custom_email: recipient,
            custom_subject: subject,
            custom_body: body
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast(`🚀 Application email sent to ${recipient} with resume attached!`, 'success');
          jobPitchModal.style.display = 'none';

          // Update card in-place without resetting scroll or reloading grid
          const cardEl = document.querySelector(`.livejob-card[data-job-id="${activePitchJobId}"]`);
          if (cardEl) {
            cardEl.classList.add('status-applied');
            const actionsEl = cardEl.querySelector('.livejob-actions');
            if (actionsEl) {
              const pitchBtn = actionsEl.querySelector('.livejob-pitch-btn');
              const quickBtn = actionsEl.querySelector('.livejob-quick-apply-btn');
              if (pitchBtn) pitchBtn.remove();
              if (quickBtn) {
                const appliedBadge = document.createElement('span');
                appliedBadge.className = 'badge badge-success';
                appliedBadge.style.cssText = 'font-size: 11.5px; padding: 5px 10px; display: inline-flex; align-items: center; gap: 4px;';
                appliedBadge.innerHTML = `✅ Applied Today`;
                quickBtn.replaceWith(appliedBadge);
              }
            }
          }
          await loadLiveJobStats();
        } else if (data.error === 'portal_required' || data.apply_url) {
          showToast(data.message || 'Direct email blocked. Opening official ATS portal application...', 'warning');
          jobPitchModal.style.display = 'none';
          if (data.apply_url) window.open(data.apply_url, '_blank');
        } else {
          showToast(`Send failed: ${data.details || data.error || 'Unknown error'}`, 'error');
        }
      } catch (e) {
        showToast(`Failed to dispatch application: ${e.message}`, 'error');
      } finally {
        sendPitchApplicationBtn.disabled = false;
        sendPitchApplicationBtn.innerHTML = originalText;
      }
    });
  }

  if (cancelPitchModalBtn) {
    cancelPitchModalBtn.addEventListener('click', () => {
      jobPitchModal.style.display = 'none';
    });
  }

  if (closePitchModalBtn) {
    closePitchModalBtn.addEventListener('click', () => {
      jobPitchModal.style.display = 'none';
    });
  }

  async function quickApplyJob(jobId, buttonEl) {
    const cardEl = buttonEl ? buttonEl.closest('.livejob-card') : document.querySelector(`.livejob-card[data-job-id="${jobId}"]`);
    const originalText = buttonEl ? buttonEl.innerHTML : '<span>⚡ Quick Apply</span>';
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Applying...
        </span>
      `;
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        showToast(`⚡ Application sent to ${data.recipient} with resume attached! Follow-up scheduled.`, 'success');

        // In-place DOM update: update this specific card without wiping or reloading grid
        // This 100% guarantees the user's scroll position and active page/view are preserved
        if (cardEl) {
          cardEl.classList.add('status-applied');
          const actionsEl = cardEl.querySelector('.livejob-actions');
          if (actionsEl) {
            const pitchBtn = actionsEl.querySelector('.livejob-pitch-btn');
            const quickBtn = actionsEl.querySelector('.livejob-quick-apply-btn');
            if (pitchBtn) pitchBtn.remove();
            if (quickBtn) {
              const appliedBadge = document.createElement('span');
              appliedBadge.className = 'badge badge-success';
              appliedBadge.style.cssText = 'font-size: 11.5px; padding: 5px 10px; display: inline-flex; align-items: center; gap: 4px;';
              appliedBadge.innerHTML = `✅ Applied Today`;
              quickBtn.replaceWith(appliedBadge);
            }
          }
        }
        await loadLiveJobStats();
      } else if (data.error === 'portal_required' || data.apply_url) {
        showToast(data.message || 'Recruiter inboxes closed to cold emails. Opening official ATS application...', 'warning');
        if (data.apply_url) {
          window.open(data.apply_url, '_blank');
        }
        if (buttonEl) {
          buttonEl.disabled = false;
          buttonEl.innerHTML = '<span>🔗 Open Portal</span>';
          buttonEl.onclick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (data.apply_url) window.open(data.apply_url, '_blank');
          };
        }
      } else {
        showToast(`Apply failed: ${data.details || data.error || 'Recipient unreachable'}`, 'error');
        if (buttonEl) {
          buttonEl.disabled = false;
          buttonEl.innerHTML = originalText;
        }
      }
    } catch (e) {
      showToast(`Network error: ${e.message}`, 'error');
      if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.innerHTML = originalText;
      }
    }
  }

  async function toggleSaveJob(jobId, shouldSave, buttonEl) {
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: shouldSave ? 'SAVED' : 'NEW' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(shouldSave ? '⭐ Job saved to favorites!' : 'Job removed from saved list.', 'success');
        
        // Update in-place without re-rendering grid
        if (buttonEl) {
          buttonEl.setAttribute('data-saved', shouldSave ? 'true' : 'false');
          buttonEl.title = shouldSave ? 'Unsave job' : 'Save job';
          buttonEl.innerHTML = `<span>${shouldSave ? '⭐' : '☆'}</span>`;
          const cardEl = buttonEl.closest('.livejob-card');
          if (cardEl) {
            if (shouldSave) cardEl.classList.add('status-saved');
            else cardEl.classList.remove('status-saved');
          }
        }
        await loadLiveJobStats();
      }
    } catch (e) {
      showToast('Failed to update job status', 'error');
    }
  }

  async function dismissJob(jobId, buttonEl) {
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISMISSED' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Job dismissed', 'info');
        if (buttonEl) {
          const cardEl = buttonEl.closest('.livejob-card');
          if (cardEl) {
            cardEl.style.transition = 'all 0.25s ease';
            cardEl.style.opacity = '0';
            cardEl.style.transform = 'scale(0.95)';
            setTimeout(() => cardEl.remove(), 250);
          }
        }
        await loadLiveJobStats();
      }
    } catch (e) {
      showToast('Failed to dismiss job', 'error');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚡ MULTI-EMAIL IMPORTER & IMAGE OCR SCANNER (BULK COLD OUTREACH)
  // ═══════════════════════════════════════════════════════════════════════════
  function initBulkOutreachModule() {
    const bulkSection = document.getElementById('bulkOutreachSection');
    if (!bulkSection) return;

    const tabBtnText = document.getElementById('bulkTabBtnText');
    const tabBtnImage = document.getElementById('bulkTabBtnImage');
    const tabBtnCsv = document.getElementById('bulkTabBtnCsv');
    const paneText = document.getElementById('bulkPaneText');
    const paneImage = document.getElementById('bulkPaneImage');
    const paneCsv = document.getElementById('bulkPaneCsv');

    const rawTextInput = document.getElementById('bulkRawTextInput');
    const parseTextBtn = document.getElementById('bulkParseTextBtn');
    const clearTextBtn = document.getElementById('bulkClearTextBtn');
    const exampleSampleBtn = document.getElementById('bulkExampleSampleBtn');

    const dropzone = document.getElementById('bulkImageDropzone');
    const fileInput = document.getElementById('bulkImageFileInput');
    const browseFileBtn = document.getElementById('bulkBrowseFileBtn');
    const previewCard = document.getElementById('bulkImagePreviewCard');
    const previewImg = document.getElementById('bulkPreviewImg');
    const previewName = document.getElementById('bulkPreviewName');
    const previewSize = document.getElementById('bulkPreviewSize');
    const removeImageBtn = document.getElementById('bulkRemoveImageBtn');
    const extractImageBtn = document.getElementById('bulkExtractImageBtn');
    const ocrLoadingState = document.getElementById('bulkOcrLoadingState');

    // CSV Mode Elements
    const csvDropzone = document.getElementById('bulkCsvDropzone');
    const csvFileInput = document.getElementById('bulkCsvFileInput');
    const browseCsvBtn = document.getElementById('bulkBrowseCsvBtn');
    const csvPreviewCard = document.getElementById('bulkCsvPreviewCard');
    const csvPreviewName = document.getElementById('bulkCsvPreviewName');
    const csvPreviewSize = document.getElementById('bulkCsvPreviewSize');
    const removeCsvBtn = document.getElementById('bulkRemoveCsvBtn');
    const parseCsvBtn = document.getElementById('bulkParseCsvBtn');
    const csvLoadingState = document.getElementById('bulkCsvLoadingState');
    const csvSaveToMasterCheckbox = document.getElementById('bulkCsvSaveToMasterCheckbox');

    const stagingSection = document.getElementById('bulkStagingSection');
    const stagedSelectedCount = document.getElementById('bulkStagedSelectedCount');
    const stagedTotalCount = document.getElementById('bulkStagedTotalCount');
    const masterCheckbox = document.getElementById('bulkMasterCheckbox');
    const tableBody = document.getElementById('bulkStagedTableBody');
    const selectAllBtn = document.getElementById('bulkSelectAllBtn');
    const selectValidOnlyBtn = document.getElementById('bulkSelectValidOnlyBtn');
    const deselectAllBtn = document.getElementById('bulkDeselectAllBtn');
    const clearStagedBtn = document.getElementById('bulkClearStagedBtn');

    const statBadgeAll = document.getElementById('statBadgeAll');
    const statBadgeReady = document.getElementById('statBadgeReady');
    const statBadgeContacted = document.getElementById('statBadgeContacted');
    const statBadgeBounced = document.getElementById('statBadgeBounced');

    const subjectInput = document.getElementById('bulkOutreachSubject');
    const bodyInput = document.getElementById('bulkOutreachBody');
    const resetPitchBtn = document.getElementById('bulkResetPitchBtn');
    const aiPersonalizeToggle = document.getElementById('bulkAiPersonalizeToggle');
    const attachResumeCheckbox = document.getElementById('bulkAttachResumeCheckbox');
    const dispatchPace = document.getElementById('bulkDispatchPace');
    const startDispatchBtn = document.getElementById('bulkStartDispatchBtn');
    const stopDispatchBtn = document.getElementById('bulkStopDispatchBtn');
    const dispatchCountLabel = document.getElementById('bulkDispatchCountLabel');

    const monitorCard = document.getElementById('bulkMonitorCard');
    const monitorStatusText = document.getElementById('bulkMonitorStatusText');
    const monitorPercentage = document.getElementById('bulkMonitorPercentage');
    const monitorProgressBar = document.getElementById('bulkMonitorProgressBar');
    const statSent = document.getElementById('bulkStatSent');
    const statFailed = document.getElementById('bulkStatFailed');
    const statRemaining = document.getElementById('bulkStatRemaining');
    const statTotal = document.getElementById('bulkStatTotal');
    const terminalLog = document.getElementById('bulkTerminalLog');

    // Dynamic pitch builder based on user's active profile
    function getUniversalDefaultPitch(prof) {
      const p = prof || userProfile || {};
      const candidateName = p.name || 'Candidate';
      const candidateTitle = p.title || 'Software Professional';
      const candidateRole = (p.target_roles ? p.target_roles.split(',')[0].trim() : '') || candidateTitle;
      const candidateSkills = p.core_skills || 'Cloud infrastructure, automation, CI/CD, and full-stack software development';
      const candidatePortfolio = p.portfolio || '';
      const candidatePhone = p.phone || '';
      const candidateLinkedin = p.linkedin || '';

      const sigParts = [
        candidateName,
        candidateTitle,
        candidatePhone ? `Phone: ${candidatePhone}` : '',
        candidatePortfolio ? `Portfolio: ${candidatePortfolio}` : '',
        candidateLinkedin ? `LinkedIn: ${candidateLinkedin}` : ''
      ].filter(Boolean);

      const signature = p.signature || sigParts.join('\n');

      return `Hi {name},

I noticed {company} is actively scaling its engineering initiatives and wanted to reach out directly regarding ${candidateRole} opportunities on your team.

My background centers on ${candidateSkills}. In my recent work, I built and automated scalable solutions that reduced release cycles, improved system stability, and streamlined engineering processes.

I have attached my resume for your review.${candidatePortfolio ? ` You can also explore my live interactive architecture diagrams and deployed projects: ${candidatePortfolio}` : ''}

Would you or the hiring team have 10 minutes this week for a brief introductory conversation?

Best regards,

${signature}`;
    }

    function syncPitchFromProfile(prof) {
      const p = prof || userProfile || {};
      const candidateName = p.name || 'Candidate';
      const candidateTitle = p.title || 'Software Professional';
      const candidateRole = (p.target_roles ? p.target_roles.split(',')[0].trim() : '') || candidateTitle;

      if (subjectInput && (!subjectInput.value || subjectInput.value.includes('DevOps / SRE Engineer Application - Ajay Autade') || subjectInput.value === 'Software Professional Application - Inquiry')) {
        subjectInput.value = `${candidateRole} Application - ${candidateName}`;
      }

      if (bodyInput && (!bodyInput.value || bodyInput.value.includes('Ajay Autade\nDevOps & Cloud Infrastructure Engineer'))) {
        bodyInput.value = getUniversalDefaultPitch(p);
      }
    }

    window.syncBulkPitchFromProfile = syncPitchFromProfile;
    syncPitchFromProfile(userProfile);

    let stagedRecipients = [];
    let currentImageFile = null;
    let currentCsvFile = null;
    let pollInterval = null;

    // Tab Switching
    function switchBulkTab(mode) {
      if (tabBtnText) tabBtnText.classList.toggle('active', mode === 'text');
      if (tabBtnImage) tabBtnImage.classList.toggle('active', mode === 'image');
      if (tabBtnCsv) tabBtnCsv.classList.toggle('active', mode === 'csv');

      if (paneText) paneText.style.display = mode === 'text' ? 'flex' : 'none';
      if (paneImage) paneImage.style.display = mode === 'image' ? 'flex' : 'none';
      if (paneCsv) paneCsv.style.display = mode === 'csv' ? 'flex' : 'none';
    }

    if (tabBtnText) tabBtnText.addEventListener('click', () => switchBulkTab('text'));
    if (tabBtnImage) tabBtnImage.addEventListener('click', () => switchBulkTab('image'));
    if (tabBtnCsv) tabBtnCsv.addEventListener('click', () => switchBulkTab('csv'));

    // Example Sample Text
    if (exampleSampleBtn) {
      exampleSampleBtn.addEventListener('click', () => {
        rawTextInput.value = `sarah.recruiter@stripe.com, Tech Recruiter at Stripe
vikas.hr@razorpay.com (Hiring Manager, Razorpay)
"Connect with Priya Sharma at priya.s@swiggy.in for DevOps openings"
john.talent@uber.com
hr-support@netflix.com, Cloud Lead`;
        showToast('Inserted sample recruiter contacts', 'info');
      });
    }

    // Parse Text
    if (parseTextBtn) {
      parseTextBtn.addEventListener('click', async () => {
        const text = (rawTextInput.value || '').trim();
        if (!text) {
          showToast('Please paste at least one email address or text block', 'warning');
          return;
        }

        parseTextBtn.disabled = true;
        const origHtml = parseTextBtn.innerHTML;
        parseTextBtn.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin-right: 6px;"></span> Parsing...';

        try {
          const res = await fetch('/api/campaign/bulk-parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawText: text })
          });
          const data = await res.json();
          if (data.success && data.recipients && data.recipients.length > 0) {
            mergeRecipients(data.recipients);
            showToast(`Parsed ${data.recipients.length} valid email(s)!`, 'success');
          } else {
            showToast(data.error || 'No valid email addresses found in the text', 'error');
          }
        } catch (err) {
          showToast('Failed to parse emails: ' + err.message, 'error');
        } finally {
          parseTextBtn.disabled = false;
          parseTextBtn.innerHTML = origHtml;
        }
      });
    }

    if (clearTextBtn) {
      clearTextBtn.addEventListener('click', () => {
        rawTextInput.value = '';
      });
    }

    // Image File Selection & Preview
    function setBulkImageFile(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, WEBP, HEIC)', 'error');
        return;
      }
      currentImageFile = file;
      previewName.textContent = file.name || 'pasted-screenshot.png';
      previewSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      const url = URL.createObjectURL(file);
      previewImg.src = url;

      previewCard.style.display = 'flex';
      dropzone.style.display = 'none';
      if (ocrLoadingState) ocrLoadingState.style.display = 'none';
    }

    function clearBulkImageFile() {
      currentImageFile = null;
      if (fileInput) fileInput.value = '';
      previewCard.style.display = 'none';
      dropzone.style.display = 'flex';
      if (previewImg.src && previewImg.src.startsWith('blob:')) {
        URL.revokeObjectURL(previewImg.src);
      }
      previewImg.src = '';
    }

    if (browseFileBtn && fileInput) {
      browseFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
          setBulkImageFile(files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
          setBulkImageFile(files[0]);
        }
      });
    }

    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', clearBulkImageFile);
    }

    // Global Paste Listener for Screenshots (Cmd+V)
    window.addEventListener('paste', (e) => {
      // Check if Leads tab is visible
      const leadsSec = document.getElementById('leadsSection');
      if (!leadsSec || leadsSec.style.display === 'none') return;

      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            if (tabBtnImage) tabBtnImage.click();
            setBulkImageFile(blob);
            showToast('📋 Screenshot detected from clipboard and loaded!', 'info');
            break;
          }
        }
      }
    });

    // AI OCR Extraction
    if (extractImageBtn) {
      extractImageBtn.addEventListener('click', async () => {
        if (!currentImageFile) {
          showToast('Please select or paste an image first', 'warning');
          return;
        }

        extractImageBtn.disabled = true;
        ocrLoadingState.style.display = 'flex';
        extractImageBtn.style.opacity = '0.5';

        const formData = new FormData();
        formData.append('image', currentImageFile);

        try {
          const res = await fetch('/api/campaign/bulk-extract-image', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success && data.recipients && data.recipients.length > 0) {
            mergeRecipients(data.recipients);
            showToast(`✨ Gemini AI Vision extracted ${data.recipients.length} contact email(s) from screenshot!`, 'success');
          } else {
            showToast(data.error || 'No email addresses could be detected in this image. Try another screenshot.', 'error');
          }
        } catch (err) {
          showToast('AI OCR scan error: ' + err.message, 'error');
        } finally {
          extractImageBtn.disabled = false;
          extractImageBtn.style.opacity = '1';
          ocrLoadingState.style.display = 'none';
        }
      });
    }

    // ── CSV File Selection & Upload ──
    function setBulkCsvFile(file) {
      if (!file) return;
      currentCsvFile = file;
      if (csvPreviewName) csvPreviewName.textContent = file.name || 'contacts.csv';
      if (csvPreviewSize) csvPreviewSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
      if (csvPreviewCard) csvPreviewCard.style.display = 'flex';
      if (csvDropzone) csvDropzone.style.display = 'none';
      if (csvLoadingState) csvLoadingState.style.display = 'none';
    }

    function clearBulkCsvFile() {
      currentCsvFile = null;
      if (csvFileInput) csvFileInput.value = '';
      if (csvPreviewCard) csvPreviewCard.style.display = 'none';
      if (csvDropzone) csvDropzone.style.display = 'flex';
    }

    if (browseCsvBtn && csvFileInput) {
      browseCsvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        csvFileInput.click();
      });
    }

    if (csvDropzone && csvFileInput) {
      csvDropzone.addEventListener('click', () => csvFileInput.click());
      csvDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvDropzone.classList.add('drag-over');
      });
      csvDropzone.addEventListener('dragleave', () => {
        csvDropzone.classList.remove('drag-over');
      });
      csvDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        csvDropzone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) setBulkCsvFile(files[0]);
      });
      csvFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) setBulkCsvFile(files[0]);
      });
    }

    if (removeCsvBtn) {
      removeCsvBtn.addEventListener('click', clearBulkCsvFile);
    }

    if (parseCsvBtn) {
      parseCsvBtn.addEventListener('click', async () => {
        if (!currentCsvFile) {
          showToast('Please select a CSV or TXT file first', 'warning');
          return;
        }

        parseCsvBtn.disabled = true;
        if (csvLoadingState) csvLoadingState.style.display = 'flex';
        parseCsvBtn.style.opacity = '0.5';

        const formData = new FormData();
        formData.append('csvFile', currentCsvFile);
        formData.append('saveToMaster', csvSaveToMasterCheckbox ? csvSaveToMasterCheckbox.checked : true);

        try {
          const res = await fetch('/api/contacts/upload-csv', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success && data.recipients && data.recipients.length > 0) {
            mergeRecipients(data.recipients);
            const masterMsg = data.savedToMaster ? ` (Master Database: ${data.masterTotal} total)` : '';
            showToast(`✅ Successfully parsed ${data.count} contacts from ${data.fileName}!${masterMsg}`, 'success');
            if (typeof loadExtractedHRContacts === 'function') {
              loadExtractedHRContacts(1);
            }
          } else {
            showToast(data.error || 'No valid email contacts found in CSV', 'error');
          }
        } catch (err) {
          showToast('CSV import error: ' + err.message, 'error');
        } finally {
          parseCsvBtn.disabled = false;
          parseCsvBtn.style.opacity = '1';
          if (csvLoadingState) csvLoadingState.style.display = 'none';
        }
      });
    }

    // Staging List Operations
    function mergeRecipients(newItems) {
      const existingEmails = new Set(stagedRecipients.map(r => r.email.toLowerCase()));
      for (const item of newItems) {
        if (!item || !item.email) continue;
        const norm = item.email.toLowerCase().trim();
        if (!existingEmails.has(norm)) {
          existingEmails.add(norm);
          const isBounced = !!(item.is_bounced || item.isBounced);
          const isContacted = !!(item.already_contacted || item.isContacted);
          stagedRecipients.push({
            id: item.id || ('recip_' + Math.random().toString(36).substr(2, 9)),
            email: norm,
            name: item.name || '',
            phone: item.phone || item.number || '',
            company: item.company || '',
            role: item.role || item.title || '',
            selected: !isBounced, // auto-uncheck bounced emails
            isBounced: isBounced,
            bounceReason: item.bounceReason || item.bounce_reason || '',
            isContacted: isContacted,
            lastContacted: item.last_contacted_at || item.lastContacted || null
          });
        }
      }
      renderStagedUI();
    }

    function renderStagedUI() {
      if (stagedRecipients.length === 0) {
        stagingSection.style.display = 'none';
        return;
      }
      stagingSection.style.display = 'flex';

      const total = stagedRecipients.length;
      const selected = stagedRecipients.filter(r => r.selected).length;
      const ready = stagedRecipients.filter(r => !r.isBounced && !r.isContacted).length;
      const contacted = stagedRecipients.filter(r => r.isContacted && !r.isBounced).length;
      const bounced = stagedRecipients.filter(r => r.isBounced).length;

      stagedTotalCount.textContent = total;
      stagedSelectedCount.textContent = selected;
      dispatchCountLabel.textContent = selected;

      statBadgeAll.textContent = `Total: ${total}`;
      statBadgeReady.textContent = `Ready to Send: ${ready}`;
      statBadgeContacted.textContent = `Previously Contacted: ${contacted}`;
      statBadgeBounced.textContent = `Bounced / Risky: ${bounced}`;

      if (masterCheckbox) {
        masterCheckbox.checked = selected === total && total > 0;
        masterCheckbox.indeterminate = selected > 0 && selected < total;
      }

      startDispatchBtn.disabled = selected === 0;

      // Render table rows
      tableBody.innerHTML = '';
      stagedRecipients.forEach(r => {
        const tr = document.createElement('tr');
        if (r.isBounced) {
          tr.style.opacity = '0.65';
          tr.style.background = 'rgba(239, 68, 68, 0.05)';
        }

        let badgeHtml = '';
        if (r.isBounced) {
          badgeHtml = `<span class="badge-staged badge-staged-bounced" title="${r.bounceReason || 'Past delivery failure'}">🛑 Bounced</span>`;
        } else if (r.isContacted) {
          const dateStr = r.lastContacted ? new Date(r.lastContacted).toLocaleDateString() : 'Previously';
          badgeHtml = `<span class="badge-staged badge-staged-contacted" title="Last emailed on ${dateStr}">📫 Contacted (${dateStr})</span>`;
        } else {
          badgeHtml = `<span class="badge-staged badge-staged-ready">✅ Ready to Email</span>`;
        }

        const nameDisplay = r.name || 'Hiring Manager';
        const roleDisplay = r.role ? `<span style="font-size: 11px; color: #94a3b8; display: block;">${r.role}</span>` : '';
        const companyDisplay = r.company || 'Tech Company';
        const phoneDisplay = r.phone 
          ? `<a href="tel:${r.phone}" style="color: #34d399; font-size: 12px; font-family: monospace; text-decoration: none;" title="Call or WhatsApp contact">📞 ${r.phone}</a>` 
          : `<span style="color: #64748b; font-size: 11px;">—</span>`;

        tr.innerHTML = `
          <td style="text-align: center;">
            <input type="checkbox" class="bulk-row-check" data-id="${r.id}" ${r.selected ? 'checked' : ''}>
          </td>
          <td>
            <strong style="color: #f1f5f9; font-size: 13px;">${nameDisplay}</strong>
            ${roleDisplay}
          </td>
          <td>
            <code style="color: #a5b4fc; font-size: 12.5px;">${r.email}</code>
          </td>
          <td>
            ${phoneDisplay}
          </td>
          <td>
            <span style="color: #cbd5e1; font-size: 12.5px;">${companyDisplay}</span>
          </td>
          <td>
            ${badgeHtml}
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn btn-ghost btn-xs text-danger bulk-delete-btn" data-id="${r.id}" title="Remove from list">✕</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Bind row events
      tableBody.querySelectorAll('.bulk-row-check').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const id = e.target.getAttribute('data-id');
          const target = stagedRecipients.find(x => x.id === id);
          if (target) {
            target.selected = e.target.checked;
            updateSelectionCounts();
          }
        });
      });

      tableBody.querySelectorAll('.bulk-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          stagedRecipients = stagedRecipients.filter(x => x.id !== id);
          renderStagedUI();
        });
      });
    }

    function updateSelectionCounts() {
      const total = stagedRecipients.length;
      const selected = stagedRecipients.filter(r => r.selected).length;
      stagedSelectedCount.textContent = selected;
      dispatchCountLabel.textContent = selected;
      startDispatchBtn.disabled = selected === 0;

      if (masterCheckbox) {
        masterCheckbox.checked = selected === total && total > 0;
        masterCheckbox.indeterminate = selected > 0 && selected < total;
      }
    }

    // Selection buttons
    if (masterCheckbox) {
      masterCheckbox.addEventListener('change', (e) => {
        const val = e.target.checked;
        stagedRecipients.forEach(r => r.selected = val);
        renderStagedUI();
      });
    }

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        stagedRecipients.forEach(r => r.selected = true);
        renderStagedUI();
      });
    }

    if (selectValidOnlyBtn) {
      selectValidOnlyBtn.addEventListener('click', () => {
        stagedRecipients.forEach(r => {
          r.selected = !r.isBounced && !r.isContacted;
        });
        renderStagedUI();
        showToast('Selected only verified uncontacted recipients', 'info');
      });
    }

    if (deselectAllBtn) {
      deselectAllBtn.addEventListener('click', () => {
        stagedRecipients.forEach(r => r.selected = false);
        renderStagedUI();
      });
    }

    if (clearStagedBtn) {
      clearStagedBtn.addEventListener('click', () => {
        stagedRecipients = [];
        renderStagedUI();
        showToast('Cleared staged recipient list', 'info');
      });
    }

    if (resetPitchBtn) {
      resetPitchBtn.addEventListener('click', () => {
        bodyInput.value = getUniversalDefaultPitch(userProfile);
        showToast('Reset pitch body to high-converting tailored application template', 'info');
      });
    }

    // Dispatch Outbound
    if (startDispatchBtn) {
      startDispatchBtn.addEventListener('click', async () => {
        const activeRecipients = stagedRecipients.filter(r => r.selected);
        if (activeRecipients.length === 0) {
          showToast('Please select at least one recipient', 'warning');
          return;
        }

        const p = userProfile || {};
        const candidateName = p.name || 'Candidate';
        const candidateRole = (p.target_roles ? p.target_roles.split(',')[0].trim() : '') || p.title || 'Software Professional';

        const subject = (subjectInput.value || '').trim() || `${candidateRole} Application - ${candidateName}`;
        const bodyTemplate = (bodyInput.value || '').trim() || getUniversalDefaultPitch(p);
        const aiPersonalize = aiPersonalizeToggle ? aiPersonalizeToggle.checked : true;
        const attachResume = attachResumeCheckbox ? attachResumeCheckbox.checked : true;
        const jitterMode = dispatchPace ? dispatchPace.value : 'safe';

        startDispatchBtn.disabled = true;
        startDispatchBtn.style.display = 'none';
        if (stopDispatchBtn) stopDispatchBtn.style.display = 'inline-flex';
        monitorCard.style.display = 'block';

        appendTerminalLog(`[System] Launching cold email outreach to ${activeRecipients.length} recipients...`, 'info');

        try {
          const res = await fetch('/api/campaign/bulk-dispatch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipients: activeRecipients,
              subject,
              bodyTemplate,
              aiPersonalize,
              attachResume,
              jitterMode
            })
          });

          const data = await res.json();
          if (data.success) {
            showToast(`🚀 Dispatched bulk cold campaign for ${data.total} recipients!`, 'success');
            startStatusPolling();
          } else {
            showToast(data.error || 'Failed to start bulk dispatch', 'error');
            startDispatchBtn.disabled = false;
            startDispatchBtn.style.display = 'inline-flex';
            if (stopDispatchBtn) stopDispatchBtn.style.display = 'none';
          }
        } catch (err) {
          showToast('Dispatch error: ' + err.message, 'error');
          startDispatchBtn.disabled = false;
          startDispatchBtn.style.display = 'inline-flex';
          if (stopDispatchBtn) stopDispatchBtn.style.display = 'none';
        }
      });
    }

    if (stopDispatchBtn) {
      stopDispatchBtn.addEventListener('click', async () => {
        stopDispatchBtn.disabled = true;
        try {
          const res = await fetch('/api/campaign/bulk-stop', { method: 'POST' });
          const data = await res.json();
          showToast(data.message || 'Stopping dispatch...', 'info');
        } catch (e) {
          showToast('Failed to stop dispatch', 'error');
        }
      });
    }

    function appendTerminalLog(msg, type = 'info') {
      if (!terminalLog) return;
      const div = document.createElement('div');
      div.className = `log-entry log-${type}`;
      div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      terminalLog.appendChild(div);
      terminalLog.scrollTop = terminalLog.scrollHeight;
    }

    function startStatusPolling() {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(pollBulkStatus, 2000);
      pollBulkStatus();
    }

    async function pollBulkStatus() {
      try {
        const res = await fetch('/api/campaign/bulk-status');
        const json = await res.json();
        const state = json.status || json || {};

        const total = state.total || 0;
        const sent = state.sentCount || 0;
        const failed = state.failedCount || 0;
        const remaining = total > 0 ? Math.max(0, total - (sent + failed)) : 0;

        statSent.textContent = sent;
        statFailed.textContent = failed;
        statRemaining.textContent = remaining;
        statTotal.textContent = total;

        const pct = state.percent ?? (total > 0 ? Math.round(((sent + failed) / total) * 100) : 0);
        monitorProgressBar.style.width = `${pct}%`;
        monitorPercentage.textContent = `${pct}%`;

        if (state.currentEmail) {
          monitorStatusText.textContent = `Processing: ${state.currentEmail}${state.currentCompany ? ' (' + state.currentCompany + ')' : ''}...`;
        }

        // Render latest logs
        if (Array.isArray(state.logs) && state.logs.length > 0) {
          terminalLog.innerHTML = '';
          state.logs.forEach(l => {
            const div = document.createElement('div');
            let cls = 'log-info';
            if (l.type === 'success' || (l.message && l.message.includes('Sent:'))) cls = 'log-success';
            else if (l.type === 'error' || (l.message && l.message.includes('Failed:'))) cls = 'log-error';
            else if (l.type === 'warn' || (l.message && l.message.includes('Stopped'))) cls = 'log-warn';
            div.className = `log-entry ${cls}`;
            div.textContent = `[${new Date(l.time).toLocaleTimeString()}] ${l.message}`;
            terminalLog.appendChild(div);
          });
          terminalLog.scrollTop = terminalLog.scrollHeight;
        }

        if (state.isRunning) {
          // Actively running in background
          monitorCard.style.display = 'block';
          startDispatchBtn.style.display = 'none';
          stopDispatchBtn.style.display = 'inline-flex';
          stopDispatchBtn.disabled = false;
        } else {
          // Idle or finished
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
          startDispatchBtn.disabled = false;
          startDispatchBtn.style.display = 'inline-flex';
          stopDispatchBtn.style.display = 'none';
          stopDispatchBtn.disabled = false;
          
          if (state.completedAt && total > 0) {
            monitorStatusText.textContent = state.shouldStop ? 'Outreach Stopped.' : 'All Emails Dispatched!';
            if (!state.shouldStop) {
              showToast(`🎉 Bulk outreach completed! Sent: ${sent}, Failed: ${failed}`, 'success');
            }
          } else {
            monitorStatusText.textContent = 'Ready';
          }
        }
      } catch (e) {
        // Silent fail during poll
      }
    }

    // Check if background job already running on load
    pollBulkStatus();
  }

  // Load bounce stats & live job stats & extracted HR on initial boot
  loadBounceStats();
  loadLiveJobStats();
  loadExtractedHRContacts(1);
  initBulkOutreachModule();
});
