const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('./auto_jobs');
const contactsFile = path.join(rootDir, 'extracted_hr_contacts.json');

// Ensure root directory exists
if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir, { recursive: true });
}

function cleanString(val) {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  const generic = [
    'null', 'undefined', 'n/a', 'na', 'none', 'unknown', 
    'not specified', 'not mentioned', 'not available', 
    'hiring team', 'hiring manager', 'recruiter', 'hr team', 'hr'
  ];
  if (generic.includes(lower)) return '';
  return trimmed;
}

function cleanEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const match = email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (!match) return '';
  const clean = match[0].toLowerCase().trim();
  if (clean.includes('mailer-daemon') || clean.includes('googlemail.com') || clean.includes('postmaster')) {
    return '';
  }
  return clean;
}

function loadStoredContacts() {
  try {
    if (fs.existsSync(contactsFile)) {
      const data = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[ExtractedHR] Warning loading extracted_hr_contacts.json:', err.message);
  }
  return [];
}

function saveStoredContacts(contacts) {
  try {
    const tmp = `${contactsFile}.tmp.${process.pid}.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(contacts, null, 2), 'utf8');
    fs.renameSync(tmp, contactsFile);
  } catch (err) {
    console.error('[ExtractedHR] Error saving extracted_hr_contacts.json:', err.message);
  }
}

/**
 * Record or update an extracted HR contact from a screenshot
 */
function recordExtractedHR({
  name = '',
  company = '',
  email = '',
  jobTitle = '',
  phone = '',
  source = '',
  timestamp = null
}) {
  const contacts = loadStoredContacts();
  const validEmail = cleanEmail(email);
  const validName = cleanString(name);
  const validCompany = cleanString(company);
  const validTitle = cleanString(jobTitle);
  const validPhone = cleanString(phone);
  const validSource = cleanString(source) || 'Screenshot Analysis';
  const validTime = timestamp || new Date().toISOString();

  // If there's neither email nor company nor name, skip empty noise
  if (!validEmail && !validCompany && !validName) {
    return null;
  }

  // Find existing contact by email or (name + company)
  let existingIndex = -1;
  if (validEmail) {
    existingIndex = contacts.findIndex(c => c.email && c.email.toLowerCase() === validEmail);
  } else if (validName && validCompany) {
    existingIndex = contacts.findIndex(c => 
      c.name.toLowerCase() === validName.toLowerCase() && 
      c.company_name.toLowerCase() === validCompany.toLowerCase()
    );
  }

  if (existingIndex >= 0) {
    const existing = contacts[existingIndex];
    // Enrich missing fields
    if (!existing.name && validName) existing.name = validName;
    if (!existing.company_name && validCompany) existing.company_name = validCompany;
    if (!existing.email && validEmail) existing.email = validEmail;
    if (!existing.job_title && validTitle) existing.job_title = validTitle;
    if (!existing.phone && validPhone) existing.phone = validPhone;
    existing.updated_at = validTime;
    saveStoredContacts(contacts);

    // Automatically sync with master hr_contacts.csv with phone number & email
    if (validEmail) {
      try {
        const { appendOrUpdateContact } = require('./masterCsvManager');
        appendOrUpdateContact({
          name: validName || existing.name,
          email: validEmail,
          phone: validPhone || existing.phone,
          title: validTitle || existing.job_title,
          company: validCompany || existing.company_name,
          source: validSource,
          addedAt: validTime
        });
      } catch (e) {
        console.warn('[ExtractedHR] Warning syncing contact to master CSV:', e.message);
      }
    }

    return existing;
  }

  const newContact = {
    id: `hr_ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: validName,
    company_name: validCompany,
    email: validEmail,
    job_title: validTitle,
    phone: validPhone,
    source: validSource,
    extracted_at: validTime
  };

  contacts.unshift(newContact);
  saveStoredContacts(contacts);

  // Automatically sync with master hr_contacts.csv with phone number & email
  if (validEmail) {
    try {
      const { appendOrUpdateContact } = require('./masterCsvManager');
      appendOrUpdateContact({
        name: validName,
        email: validEmail,
        phone: validPhone,
        title: validTitle,
        company: validCompany,
        source: validSource,
        addedAt: validTime
      });
    } catch (e) {
      console.warn('[ExtractedHR] Warning syncing contact to master CSV:', e.message);
    }
  }

  return newContact;
}

/**
 * Get paginated & filtered contacts
 */
function getExtractedHRContacts({
  page = 1,
  limit = 20,
  search = ''
} = {}) {
  let contacts = loadStoredContacts();

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    contacts = contacts.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.company_name && c.company_name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.job_title && c.job_title.toLowerCase().includes(q))
    );
  }

  const total = contacts.length;
  const withEmailCount = contacts.filter(c => Boolean(c.email)).length;
  const withNameCount = contacts.filter(c => Boolean(c.name)).length;
  const withCompanyCount = contacts.filter(c => Boolean(c.company_name)).length;

  const startIndex = (page - 1) * limit;
  const paginated = contacts.slice(startIndex, startIndex + limit);

  return {
    total,
    withEmailCount,
    withNameCount,
    withCompanyCount,
    page,
    limit,
    total_pages: Math.ceil(total / limit) || 1,
    contacts: paginated
  };
}

/**
 * Export all contacts to CSV string
 */
function exportToCSV() {
  const contacts = loadStoredContacts();

  // CSV escape helper
  const esc = (text) => {
    if (text === null || text === undefined) return '';
    const str = String(text).trim();
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ['Name', 'Company Name', 'Email', 'Job Title', 'Phone', 'Extracted Date', 'Source'];
  const rows = [headers.join(',')];

  for (const c of contacts) {
    const row = [
      esc(c.name || ''),
      esc(c.company_name || ''),
      esc(c.email || ''),
      esc(c.job_title || ''),
      esc(c.phone || ''),
      esc(c.extracted_at ? new Date(c.extracted_at).toLocaleDateString('en-IN') : ''),
      esc(c.source || '')
    ];
    rows.push(row.join(','));
  }

  // Prepend UTF-8 BOM so Excel and spreadsheet tools recognize characters seamlessly
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Backfill from existing history.json and whatsapp_leads.json
 */
function backfillFromExistingHistory() {
  const contacts = loadStoredContacts();
  const existingMap = new Map();
  contacts.forEach(c => {
    if (c.email) existingMap.set(c.email.toLowerCase(), c);
  });

  let addedCount = 0;

  // 1. WhatsApp leads (contains high-confidence contact_person)
  const waFile = path.join(rootDir, 'whatsapp_leads.json');
  if (fs.existsSync(waFile)) {
    try {
      const waLeads = JSON.parse(fs.readFileSync(waFile, 'utf8'));
      if (Array.isArray(waLeads)) {
        for (const w of waLeads) {
          const em = cleanEmail(w.contact_email);
          const nm = cleanString(w.contact_person);
          const comp = cleanString(w.company_name);
          const role = cleanString(w.job_title);
          const ph = cleanString(w.phone_number || w.display_phone);
          const src = cleanString(w.screenshot_file) || 'WhatsApp Lead Screenshot';
          const dt = w.timestamp || w.created_at || new Date().toISOString();

          if (em && existingMap.has(em)) {
            const ex = existingMap.get(em);
            if (!ex.name && nm) ex.name = nm;
            if (!ex.company_name && comp) ex.company_name = comp;
            if (!ex.phone && ph) ex.phone = ph;
            if (!ex.job_title && role) ex.job_title = role;
          } else if (em || (nm && comp)) {
            const item = {
              id: `hr_ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: nm,
              company_name: comp,
              email: em,
              job_title: role,
              phone: ph,
              source: src,
              extracted_at: dt
            };
            contacts.push(item);
            if (em) existingMap.set(em, item);
            addedCount++;
          }
        }
      }
    } catch (e) {
      console.warn('[ExtractedHR] Backfill WhatsApp leads error:', e.message);
    }
  }

  // 2. History.json (AutoPilot screenshot emails)
  const historyFile = path.join(rootDir, 'history.json');
  if (fs.existsSync(historyFile)) {
    try {
      const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      if (Array.isArray(history)) {
        for (const h of history) {
          const em = cleanEmail(h.contact_email);
          let nm = cleanString(h.contact_person);

          // Extract greeting name if contact_person was omitted in older records
          if (!nm && h.body) {
            const m = h.body.match(/^(?:Hi|Dear|Hello)\s+([A-Za-z\s]+?)[,!\n]/i);
            if (m && m[1]) {
              const cand = m[1].trim();
              if (cand.length > 1 && cand.length < 35 && !/^(Hiring|Team|Recruiter|Sir|Madam|There)$/i.test(cand)) {
                nm = cand;
              }
            }
          }

          const comp = cleanString(h.company_name);
          const role = cleanString(h.job_title);
          const ph = cleanString(h.contact_phone);
          const src = (Array.isArray(h.files) && h.files[0]) ? h.files[0] : 'Auto-Pilot Screenshot';
          const dt = h.timestamp || new Date().toISOString();

          if (em && existingMap.has(em)) {
            const ex = existingMap.get(em);
            if (!ex.name && nm) ex.name = nm;
            if (!ex.company_name && comp) ex.company_name = comp;
            if (!ex.phone && ph) ex.phone = ph;
            if (!ex.job_title && role) ex.job_title = role;
          } else if (em || (nm && comp)) {
            const item = {
              id: `hr_ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: nm,
              company_name: comp,
              email: em,
              job_title: role,
              phone: ph,
              source: src,
              extracted_at: dt
            };
            contacts.push(item);
            if (em) existingMap.set(em, item);
            addedCount++;
          }
        }
      }
    } catch (e) {
      console.warn('[ExtractedHR] Backfill history error:', e.message);
    }
  }

  if (addedCount > 0 || contacts.length > 0) {
    saveStoredContacts(contacts);
    console.log(`[ExtractedHR] 📋 Loaded ${contacts.length} extracted HR contacts (backfilled ${addedCount} from history).`);
  }

  return contacts.length;
}

// Automatically backfill on module initialization if not already done
backfillFromExistingHistory();

module.exports = {
  recordExtractedHR,
  getExtractedHRContacts,
  exportToCSV,
  backfillFromExistingHistory
};
