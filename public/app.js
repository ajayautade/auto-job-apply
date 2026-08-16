// ═══════════════════════════════════════════════
// JOB APPLY AI — Frontend Application
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // ── Element References ──
  const tabAutoPilot = document.getElementById('tabAutoPilot');
  const tabManual = document.getElementById('tabManual');
  const tabFollowUps = document.getElementById('tabFollowUps');
  const tabWhatsApp = document.getElementById('tabWhatsApp');
  const autopilotSection = document.getElementById('autopilotSection');
  const manualSectionContainer = document.getElementById('manualSectionContainer');
  const followupsSection = document.getElementById('followupsSection');
  const whatsappSection = document.getElementById('whatsappSection');
  const followUpsTabBadge = document.getElementById('followUpsTabBadge');
  const whatsAppTabBadge = document.getElementById('whatsAppTabBadge');

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

  // ── Mode Switcher (4 Tabs) ──
  tabAutoPilot.addEventListener('click', () => switchMode('autopilot'));
  tabManual.addEventListener('click', () => switchMode('manual'));
  if (tabFollowUps) tabFollowUps.addEventListener('click', () => switchMode('followups'));
  if (tabWhatsApp) tabWhatsApp.addEventListener('click', () => switchMode('whatsapp'));

  function switchMode(mode) {
    tabAutoPilot.classList.toggle('active', mode === 'autopilot');
    tabManual.classList.toggle('active', mode === 'manual');
    if (tabFollowUps) tabFollowUps.classList.toggle('active', mode === 'followups');
    if (tabWhatsApp) tabWhatsApp.classList.toggle('active', mode === 'whatsapp');

    autopilotSection.style.display = mode === 'autopilot' ? 'flex' : 'none';
    manualSectionContainer.style.display = mode === 'manual' ? 'block' : 'none';
    if (followupsSection) followupsSection.style.display = mode === 'followups' ? 'flex' : 'none';
    if (whatsappSection) whatsappSection.style.display = mode === 'whatsapp' ? 'flex' : 'none';

    loadingSection.style.display = 'none';
    reviewSection.style.display = 'none';
    successSection.style.display = 'none';

    if (mode === 'autopilot') {
      loadHistory();
      loadDailyStats();
    } else if (mode === 'followups') {
      loadFollowUps();
    } else if (mode === 'whatsapp') {
      loadWhatsAppLeads();
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

  // ── Initialize ──
  checkSettings();
  loadHistory();
  loadDailyStats();
  loadFollowUps();
  loadWhatsAppLeads();

  // Auto-poll history, daily stats, followups, and whatsapp leads periodically
  setInterval(() => {
    if (autopilotSection && autopilotSection.style.display !== 'none') {
      loadHistory();
      loadDailyStats();
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

      if (data.has_resume) {
        showResumeStatus(data.resume_name);
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

  // ── Keyboard shortcut ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      settingsModal.style.display = 'none';
    }
  });
});
