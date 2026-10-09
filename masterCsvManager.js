const fs = require('fs');
const path = require('path');

const MASTER_CSV_PATH = path.join(__dirname, 'hr_contacts.csv');
const BACKUP_CSV_PATH = path.join(__dirname, 'hr_contacts.csv.bak');

// In-memory cache
let cachedContacts = null;
let cachedMtime = 0;

/**
 * Clean & normalize a string field
 */
function cleanField(val) {
  if (!val || typeof val !== 'string') return '';
  let str = val.trim().replace(/^["\s]+|["\s]+$/g, '');
  return str.replace(/\r?\n|\r/g, ' ').trim();
}

/**
 * Validate and clean email address
 */
function cleanEmail(val) {
  if (!val || typeof val !== 'string') return '';
  const match = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (!match) return '';
  const clean = match[0].toLowerCase().trim();
  if (
    clean.includes('mailer-daemon') ||
    clean.includes('googlemail.com') ||
    clean.includes('example.com') ||
    clean.includes('domain.com') ||
    clean.includes('placeholder')
  ) {
    return '';
  }
  return clean;
}

/**
 * Clean and format phone number (handles +91, 10-digit Indian, standard US, etc.)
 */
function cleanPhone(val) {
  if (!val || typeof val !== 'string') return '';
  const cleaned = val.replace(/[^\d+]/g, '').trim();
  if (cleaned.length >= 7 && cleaned.length <= 16) {
    return cleaned;
  }
  return '';
}

/**
 * Format string for safe CSV output with RFC-4180 escaping
 */
function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Flexible, column-agnostic CSV parser that parses ANY CSV format
 */
function parseAnyCsv(text) {
  if (!text || typeof text !== 'string') return [];

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

  const headers = lines[0].map(h => cleanField(h));
  const lowerHeaders = headers.map(h => h.toLowerCase());

  // Identify column indexes based on keywords
  const emailIdx = lowerHeaders.findIndex(h => /^(email|e-mail|mail|email[-_ ]?address|hr[-_ ]?email|careers[-_ ]?email|contact[-_ ]?email)/i.test(h));
  const nameIdx = lowerHeaders.findIndex(h => /^(name|full[-_ ]?name|contact[-_ ]?person|recruiter[-_ ]?name|hr[-_ ]?name|recruiter|hr)/i.test(h));
  const companyIdx = lowerHeaders.findIndex(h => /^(company|organization|company[-_ ]?name|org|org[-_ ]?name|firm|client)/i.test(h));
  const titleIdx = lowerHeaders.findIndex(h => /^(title|job[-_ ]?title|role|designation|position|department|category)/i.test(h));
  const phoneIdx = lowerHeaders.findIndex(h => /^(phone|mobile|number|phone[-_ ]?number|mobile[-_ ]?no|whatsapp|contact[-_ ]?no|tel)/i.test(h));
  const sourceIdx = lowerHeaders.findIndex(h => /^(source|origin|channel|platform)/i.test(h));

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const r = lines[i];
    if (!r || r.length === 0) continue;

    // Direct match or fallback search across fields
    let email = emailIdx >= 0 ? cleanEmail(r[emailIdx]) : '';
    let name = nameIdx >= 0 ? cleanField(r[nameIdx]) : '';
    let company = companyIdx >= 0 ? cleanField(r[companyIdx]) : '';
    let title = titleIdx >= 0 ? cleanField(r[titleIdx]) : '';
    let phone = phoneIdx >= 0 ? cleanPhone(r[phoneIdx]) : '';
    let source = sourceIdx >= 0 ? cleanField(r[sourceIdx]) : 'CSV Import';

    // Fallback: If no column identified as email, search row fields for an @
    if (!email) {
      for (const cell of r) {
        const foundEmail = cleanEmail(cell);
        if (foundEmail) {
          email = foundEmail;
          break;
        }
      }
    }

    // Fallback: search for phone if missing
    if (!phone) {
      for (const cell of r) {
        const foundPhone = cleanPhone(cell);
        if (foundPhone && foundPhone !== email) {
          phone = foundPhone;
          break;
        }
      }
    }

    if (email) {
      records.push({
        name: name || 'Hiring Leader',
        email,
        phone,
        title: title || 'Human Resources & Talent Acquisition',
        company: company ? company.replace(/[,]+$/, '').trim() : 'Tech Organization',
        source: source || 'CSV Import',
        added_at: new Date().toISOString()
      });
    }
  }

  return records;
}

/**
 * Load all contacts from master hr_contacts.csv
 */
function getAllContacts() {
  if (fs.existsSync(MASTER_CSV_PATH)) {
    try {
      const stats = fs.statSync(MASTER_CSV_PATH);
      if (cachedContacts && cachedContacts.length > 0 && cachedMtime === stats.mtimeMs) {
        return cachedContacts;
      }
      const content = fs.readFileSync(MASTER_CSV_PATH, 'utf8');
      cachedContacts = parseAnyCsv(content);
      cachedMtime = stats.mtimeMs;
      return cachedContacts;
    } catch (err) {
      console.error('[MasterCSV] Error loading master CSV:', err.message);
    }
  }
  return [];
}

/**
 * Save contacts to master hr_contacts.csv with atomic write
 */
function saveAllContacts(contacts) {
  try {
    const headerLine = 'Name,Email,Phone,Title,Company,Source,AddedAt';
    const rows = [headerLine];

    for (const c of contacts) {
      if (!c || !c.email) continue;
      const cleanE = cleanEmail(c.email);
      if (!cleanE) continue;

      const name = escapeCsvField(c.name || 'Hiring Leader');
      const email = escapeCsvField(cleanE);
      const phone = escapeCsvField(cleanPhone(c.phone || c.number || ''));
      const title = escapeCsvField(c.title || c.job_title || c.role || 'Human Resources & Talent Acquisition');
      const company = escapeCsvField(c.company || c.company_name || 'Hiring Company');
      const source = escapeCsvField(c.source || 'Master Database');
      const addedAt = escapeCsvField(c.added_at || c.extracted_at || new Date().toISOString());

      rows.push(`${name},${email},${phone},${title},${company},${source},${addedAt}`);
    }

    const csvContent = rows.join('\n');
    const tmpFile = `${MASTER_CSV_PATH}.tmp.${process.pid}.${Date.now()}`;
    fs.writeFileSync(tmpFile, csvContent, 'utf8');
    fs.renameSync(tmpFile, MASTER_CSV_PATH);

    // Invalidate cache
    cachedContacts = null;
    cachedMtime = 0;
    console.log(`[MasterCSV] 💾 Saved ${rows.length - 1} contacts to ${MASTER_CSV_PATH}`);
    return true;
  } catch (err) {
    console.error('[MasterCSV] Error saving master CSV:', err.message);
    return false;
  }
}

/**
 * Append or update a single contact in the master CSV
 */
function appendOrUpdateContact({
  name = '',
  email = '',
  phone = '',
  title = '',
  company = '',
  source = '',
  addedAt = null
}) {
  const cleanE = cleanEmail(email);
  if (!cleanE) return null;

  const contacts = getAllContacts();
  const existingIdx = contacts.findIndex(c => c.email.toLowerCase() === cleanE);

  const cleanN = cleanField(name);
  const cleanP = cleanPhone(phone);
  const cleanT = cleanField(title);
  const cleanC = cleanField(company);
  const cleanS = cleanField(source) || 'Screenshot OCR';
  const timestamp = addedAt || new Date().toISOString();

  if (existingIdx >= 0) {
    const existing = contacts[existingIdx];
    let updated = false;

    if ((!existing.name || existing.name === 'Hiring Leader') && cleanN && cleanN !== 'Hiring Leader') {
      existing.name = cleanN;
      updated = true;
    }
    if (!existing.phone && cleanP) {
      existing.phone = cleanP;
      updated = true;
    }
    if ((!existing.company || existing.company === 'Hiring Company' || existing.company === 'Tech Organization') && cleanC) {
      existing.company = cleanC;
      updated = true;
    }
    if ((!existing.title || existing.title.includes('Head HR')) && cleanT) {
      existing.title = cleanT;
      updated = true;
    }

    if (updated) {
      saveAllContacts(contacts);
    }
    return existing;
  }

  // Brand new contact
  const newContact = {
    name: cleanN || 'Hiring Leader',
    email: cleanE,
    phone: cleanP,
    title: cleanT || 'Human Resources & Talent Acquisition',
    company: cleanC || 'Tech Organization',
    source: cleanS,
    added_at: timestamp
  };

  contacts.unshift(newContact);
  saveAllContacts(contacts);
  console.log(`[MasterCSV] ➕ Added new contact: ${cleanE} (Phone: ${cleanP || 'N/A'}) from ${cleanS}`);
  return newContact;
}

/**
 * Batch append or update multiple contacts
 */
function appendBatchContacts(newContacts = []) {
  if (!Array.isArray(newContacts) || newContacts.length === 0) {
    return { added: 0, updated: 0, total: getAllContacts().length };
  }

  const contacts = getAllContacts();
  const contactMap = new Map();
  contacts.forEach(c => contactMap.set(c.email.toLowerCase(), c));

  let addedCount = 0;
  let updatedCount = 0;

  for (const item of newContacts) {
    if (!item) continue;
    const cleanE = cleanEmail(item.email);
    if (!cleanE) continue;

    const cleanN = cleanField(item.name);
    const cleanP = cleanPhone(item.phone || item.number || item.phone_number || item.mobile);
    const cleanT = cleanField(item.title || item.job_title || item.role);
    const cleanC = cleanField(item.company || item.company_name);
    const cleanS = cleanField(item.source) || 'Screenshot OCR';
    const timestamp = item.added_at || item.extracted_at || new Date().toISOString();

    if (contactMap.has(cleanE)) {
      const existing = contactMap.get(cleanE);
      let changed = false;
      if ((!existing.name || existing.name === 'Hiring Leader') && cleanN && cleanN !== 'Hiring Leader') {
        existing.name = cleanN;
        changed = true;
      }
      if (!existing.phone && cleanP) {
        existing.phone = cleanP;
        changed = true;
      }
      if ((!existing.company || existing.company === 'Hiring Company' || existing.company === 'Tech Organization') && cleanC) {
        existing.company = cleanC;
        changed = true;
      }
      if ((!existing.title || existing.title.includes('Head HR')) && cleanT) {
        existing.title = cleanT;
        changed = true;
      }
      if (changed) updatedCount++;
    } else {
      const newObj = {
        name: cleanN || 'Hiring Leader',
        email: cleanE,
        phone: cleanP,
        title: cleanT || 'Human Resources & Talent Acquisition',
        company: cleanC || 'Tech Organization',
        source: cleanS,
        added_at: timestamp
      };
      contactMap.set(cleanE, newObj);
      addedCount++;
    }
  }

  if (addedCount > 0 || updatedCount > 0) {
    saveAllContacts(Array.from(contactMap.values()));
  }

  return {
    added: addedCount,
    updated: updatedCount,
    total: contactMap.size
  };
}

/**
 * Consolidate all CSVs and JSON lead records across the workspace into hr_contacts.csv
 */
function consolidateAllSources() {
  console.log('[MasterCSV] 🔄 Starting full workspace contact consolidation...');

  // Backup existing hr_contacts.csv
  if (fs.existsSync(MASTER_CSV_PATH)) {
    try {
      fs.copyFileSync(MASTER_CSV_PATH, BACKUP_CSV_PATH);
      console.log(`[MasterCSV] 🛡️ Created backup at ${BACKUP_CSV_PATH}`);
    } catch (e) {
      console.warn('[MasterCSV] Warning backing up CSV:', e.message);
    }
  }

  const masterMap = new Map();

  function recordMerge(r) {
    if (!r) return;
    const email = cleanEmail(r.email);
    if (!email) return;

    const name = cleanField(r.name) || 'Hiring Leader';
    const title = cleanField(r.title || r.job_title || r.role) || 'Human Resources & Talent Acquisition';
    const company = cleanField(r.company || r.company_name) || 'Hiring Company';
    const phone = cleanPhone(r.phone || r.number || r.phone_number || r.mobile);
    const source = cleanField(r.source) || 'Master Import';
    const addedAt = r.added_at || r.extracted_at || r.created_at || new Date().toISOString();

    if (!masterMap.has(email)) {
      masterMap.set(email, {
        name,
        email,
        phone,
        title,
        company,
        source,
        added_at: addedAt
      });
    } else {
      const existing = masterMap.get(email);
      if ((!existing.name || existing.name === 'Hiring Leader' || existing.name.startsWith('HR Team')) && name && name !== 'Hiring Leader') {
        existing.name = name;
      }
      if ((!existing.company || existing.company === 'Hiring Company') && company && company !== 'Hiring Company') {
        existing.company = company;
      }
      if (!existing.phone && phone) {
        existing.phone = phone;
      }
      if ((!existing.title || existing.title === 'Human Resources & Talent Acquisition') && title && title !== 'Human Resources & Talent Acquisition') {
        existing.title = title;
      }
    }
  }

  // 1. Process hr_contacts.csv
  if (fs.existsSync(MASTER_CSV_PATH)) {
    const raw = fs.readFileSync(MASTER_CSV_PATH, 'utf8');
    const parsed = parseAnyCsv(raw);
    parsed.forEach(p => recordMerge({ ...p, source: p.source || 'Preloaded HR Directory' }));
  }

  // 2. Process IT companies CSVs
  const campaignCSVs = [
    'top_100_it_companies_campaign.csv',
    'top_400_it_companies_campaign.csv'
  ];
  campaignCSVs.forEach(f => {
    const fp = path.join(__dirname, f);
    if (fs.existsSync(fp)) {
      const parsed = parseAnyCsv(fs.readFileSync(fp, 'utf8'));
      parsed.forEach(p => recordMerge({ ...p, source: 'Top IT Companies Directory' }));
    }
  });

  const directoryCSVs = [
    'top_100_it_companies_india.csv',
    'top_400_it_companies_india.csv'
  ];
  directoryCSVs.forEach(f => {
    const fp = path.join(__dirname, f);
    if (fs.existsSync(fp)) {
      const lines = fs.readFileSync(fp, 'utf8').split('\n');
      for (let i = 1; i < lines.length; i++) {
        const p = lines[i].split(',');
        if (p.length >= 4) {
          const comp = cleanField(p[0]);
          const careers = cleanEmail(p[1]);
          const hr = cleanEmail(p[2]);
          if (careers) {
            recordMerge({
              name: `Careers Team - ${comp}`,
              email: careers,
              company: comp,
              title: 'Careers & Recruitment Gateway',
              source: 'Top IT Companies Directory'
            });
          }
          if (hr) {
            recordMerge({
              name: `HR Team - ${comp}`,
              email: hr,
              company: comp,
              title: 'Human Resources & Talent Acquisition',
              source: 'Top IT Companies Directory'
            });
          }
        }
      }
    }
  });

  // 3. Process extracted_hr_contacts.json
  const extJson = path.join(__dirname, 'auto_jobs/extracted_hr_contacts.json');
  if (fs.existsSync(extJson)) {
    try {
      const data = JSON.parse(fs.readFileSync(extJson, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(d => recordMerge({
          name: d.name,
          email: d.email,
          company: d.company_name,
          title: d.job_title,
          phone: d.phone,
          source: d.source || 'Screenshot OCR',
          added_at: d.extracted_at
        }));
      }
    } catch (_) {}
  }

  // 4. Process whatsapp_leads.json
  const waJson = path.join(__dirname, 'auto_jobs/whatsapp_leads.json');
  if (fs.existsSync(waJson)) {
    try {
      const data = JSON.parse(fs.readFileSync(waJson, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(d => {
          if (d.contact_email) {
            recordMerge({
              name: d.contact_person,
              email: d.contact_email,
              company: d.company_name,
              title: d.job_title,
              phone: d.display_phone || d.phone_number,
              source: 'WhatsApp Recruiter Leads',
              added_at: d.created_at
            });
          }
        });
      }
    } catch (_) {}
  }

  // 5. Process recruiter_leads.json
  const recJson = path.join(__dirname, 'auto_jobs/recruiter_leads.json');
  if (fs.existsSync(recJson)) {
    try {
      const data = JSON.parse(fs.readFileSync(recJson, 'utf8'));
      if (Array.isArray(data)) {
        data.forEach(d => recordMerge({
          name: d.recruiter_name,
          email: d.email,
          company: d.company_name,
          title: d.recruiter_title,
          source: 'AI Recruiter Discovery',
          added_at: d.created_at
        }));
      }
    } catch (_) {}
  }

  const consolidatedList = Array.from(masterMap.values());
  saveAllContacts(consolidatedList);

  let withPhone = 0;
  consolidatedList.forEach(c => { if (c.phone) withPhone++; });

  console.log(`[MasterCSV] ✅ Full Consolidation complete! ${consolidatedList.length} total contacts (${withPhone} with Phone Number).`);

  return {
    total: consolidatedList.length,
    withPhone,
    csvPath: MASTER_CSV_PATH
  };
}

module.exports = {
  MASTER_CSV_PATH,
  parseAnyCsv,
  getAllContacts,
  saveAllContacts,
  appendOrUpdateContact,
  appendBatchContacts,
  consolidateAllSources,
  cleanEmail,
  cleanPhone
};
