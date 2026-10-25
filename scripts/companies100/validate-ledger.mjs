import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export const ALLOWED_FIELDS = new Set([
  'officialName',
  'industry',
  'hq',
  'officialSiteUrl',
  'indiaPresenceUrl',
  'careersUrl',
  'campusPageUrl',
  'jobFamily',
  'eligibility.aggregatePercent',
  'eligibility.cgpa',
  'eligibility.backlogRule',
  'eligibility.branches',
  'eligibility.batchYears',
  'compensation',
  'hiringRound',
  'openRoles',
  'hiringIntake'
]);

export const BANNED_DOMAINS = [
  'glassdoor.com',
  'glassdoor.co.in',
  'ambitionbox.com',
  'linkedin.com',
  'naukri.com',
  'prepinsta.com',
  'faceprep.in',
  'faceprep.com',
  'wikipedia.org',
  'crunchbase.com'
];

export const BANNED_WORDS_REGEX = /\b(typical|approximately|around|estimated|about|expected)\b/i;

export const KNOWN_OFFICIAL_ATS_DOMAINS = [
  'myworkdayjobs.com',
  'greenhouse.io',
  'lever.co',
  'taleo.net',
  'icims.com',
  'brassring.com',
  'smartrecruiters.com',
  'oraclecloud.com',
  'successfactors.com',
  'darwinbox.in',
  'darwinbox.com',
  'freshservice.com',
  'rippling.com',
  'ashbyhq.com',
  'ripplehire.com',
  'eightfold.ai'
];

export function hashUrl(url) {
  return crypto.createHash('sha256').update(url.trim()).digest('hex');
}

export function normalizeText(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Loads the fetch log into a Map of url -> { httpStatus, timestamp, companyId }
 */
export function loadFetchLog(fetchLogPath = path.join(REPO_ROOT, 'docs/companies-100/fetch-log.jsonl')) {
  const map = new Map();
  if (!fs.existsSync(fetchLogPath)) {
    return map;
  }
  const content = fs.readFileSync(fetchLogPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.url) {
        map.set(entry.url.trim(), entry);
      }
    } catch {
      // ignore malformed log line
    }
  }
  return map;
}

/**
 * Validates a single ledger row against H2, H3, H4, H5, H7 rules.
 */
export function validateLedgerRow(row, options = {}) {
  const {
    fetchLog = new Map(),
    evidenceCacheDir = path.join(REPO_ROOT, '.evidence-cache'),
    skipFetchLogCheck = false,
    skipCacheCheck = false,
    allowedDomains = []
  } = options;

  const errors = [];

  // Required fields
  if (!row.rowId || typeof row.rowId !== 'string') {
    errors.push(`Missing or invalid rowId`);
  }
  if (!row.companyId || typeof row.companyId !== 'string') {
    errors.push(`Missing or invalid companyId`);
  }
  if (!row.field || typeof row.field !== 'string') {
    errors.push(`Missing or invalid field`);
  } else if (!ALLOWED_FIELDS.has(row.field)) {
    errors.push(`Disallowed field "${row.field}". Closed list permitted by H2.`);
  }

  // Value checks (H7)
  if (row.value === undefined) {
    errors.push(`Row value cannot be undefined; use null if unknown (H6)`);
  } else if (typeof row.value === 'string') {
    if (BANNED_WORDS_REGEX.test(row.value)) {
      errors.push(`Value contains banned imputation word: "${row.value.match(BANNED_WORDS_REGEX)[0]}" (H7)`);
    }
  } else if (typeof row.value === 'object' && row.value !== null) {
    const jsonStr = JSON.stringify(row.value);
    if (BANNED_WORDS_REGEX.test(jsonStr)) {
      errors.push(`Value object contains banned imputation word (H7)`);
    }
  }

  // Source kind
  if (!['official', 'company-published'].includes(row.sourceKind)) {
    errors.push(`sourceKind must be "official" or "company-published", received: "${row.sourceKind}"`);
  }

  // URL checks (H4, H5)
  if (!row.url || typeof row.url !== 'string') {
    errors.push(`Missing or invalid url`);
  } else {
    try {
      const parsedUrl = new URL(row.url);
      const hostname = parsedUrl.hostname.toLowerCase();

      // H5 Banned domains check
      for (const banned of BANNED_DOMAINS) {
        if (hostname === banned || hostname.endsWith('.' + banned)) {
          errors.push(`URL uses banned domain "${banned}" (H5 violation): ${row.url}`);
        }
      }

      // H5 Allowlist check (if allowedDomains provided)
      if (allowedDomains.length > 0) {
        const isOfficialAts = KNOWN_OFFICIAL_ATS_DOMAINS.some(ats => hostname === ats || hostname.endsWith('.' + ats));
        const matchesAllowed = allowedDomains.some(dom => hostname === dom.toLowerCase() || hostname.endsWith('.' + dom.toLowerCase()));
        if (!matchesAllowed && !isOfficialAts) {
          errors.push(`Domain "${hostname}" is not on the company allowlist or recognized official ATS list: ${row.url}`);
        }
      }

      // H4 Fetch log check
      if (!skipFetchLogCheck) {
        const fetchEntry = fetchLog.get(row.url.trim());
        if (!fetchEntry) {
          errors.push(`URL not found in fetch-log.jsonl: ${row.url} (H4 violation)`);
        } else if (fetchEntry.httpStatus !== 200) {
          errors.push(`URL in fetch-log has non-200 status (${fetchEntry.httpStatus}): ${row.url}`);
        }
      }
    } catch {
      errors.push(`Malformed URL: ${row.url}`);
    }
  }

  // ISO Date check
  if (!row.retrievedAt || typeof row.retrievedAt !== 'string') {
    errors.push(`Missing retrievedAt timestamp`);
  } else {
    const isIsoFormat = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z?)?$/.test(row.retrievedAt);
    const isValidDate = !isNaN(Date.parse(row.retrievedAt));
    if (!isIsoFormat || !isValidDate) {
      errors.push(`retrievedAt must be a valid ISO 8601 date string, received: "${row.retrievedAt}"`);
    }
  }

  // Snippet check (H3, H4)
  if (typeof row.snippet !== 'string') {
    errors.push(`Missing snippet text`);
  } else {
    const words = row.snippet.trim() ? row.snippet.trim().split(/\s+/) : [];
    if (words.length > 15) {
      errors.push(`Snippet exceeds maximum 15 words limit (got ${words.length} words): "${row.snippet}" (H3 violation)`);
    }

    // Cache content check (H4)
    if (!skipCacheCheck && row.url && row.snippet.trim().length > 0) {
      const urlH = hashUrl(row.url);
      const flatCachePath = path.join(evidenceCacheDir, `${urlH}.txt`);
      const nestedCachePath = path.join(evidenceCacheDir, row.companyId, `${urlH}.txt`);
      const cachePath = fs.existsSync(nestedCachePath) ? nestedCachePath : flatCachePath;

      if (!fs.existsSync(cachePath)) {
        errors.push(`Evidence cache file missing for URL (hash ${urlH}): ${row.url} (H4 violation)`);
      } else {
        const cachedText = fs.readFileSync(cachePath, 'utf8');
        const normCached = normalizeText(cachedText);
        const normSnippet = normalizeText(row.snippet);
        if (!normCached.includes(normSnippet)) {
          errors.push(`Snippet not found in cached page text: "${row.snippet}" (H4 violation)`);
        }
      }
    }
  }

  // Verify object
  if (!row.verify || typeof row.verify !== 'object') {
    errors.push(`Missing verify status object`);
  } else if (!['passed', 'pending', 'failed', 'needsReview'].includes(row.verify.status)) {
    errors.push(`verify.status must be passed|pending|failed|needsReview, got: "${row.verify.status}"`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates an entire ledger file for a company.
 */
export function validateLedgerFile(filePath, options = {}) {
  const fileName = path.basename(filePath, '.json');
  const fileErrors = [];

  if (!fs.existsSync(filePath)) {
    return {
      companyId: fileName,
      valid: false,
      errors: [`File does not exist: ${filePath}`],
      rowCount: 0
    };
  }

  let content;
  try {
    content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return {
      companyId: fileName,
      valid: false,
      errors: [`Invalid JSON in ${filePath}: ${err.message}`],
      rowCount: 0
    };
  }

  const rows = Array.isArray(content) ? content : (Array.isArray(content.rows) ? content.rows : null);
  if (!rows) {
    return {
      companyId: fileName,
      valid: false,
      errors: [`Ledger content must be an array of rows or an object with a "rows" array`],
      rowCount: 0
    };
  }

  // Extract allowed company domains from rows (e.g. officialSiteUrl)
  const allowedDomains = [];
  for (const r of rows) {
    if ((r.field === 'officialSiteUrl' || r.field === 'careersUrl') && typeof r.value === 'string') {
      try {
        const u = new URL(r.value);
        allowedDomains.push(u.hostname.toLowerCase().replace(/^www\./, ''));
      } catch {
        // ignore
      }
    }
  }

  const seenRowIds = new Set();
  const rowValidationErrors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.companyId && row.companyId !== fileName) {
      rowValidationErrors.push(`Row ${i} companyId "${row.companyId}" does not match file companyId "${fileName}"`);
    }
    if (row.rowId) {
      if (seenRowIds.has(row.rowId)) {
        rowValidationErrors.push(`Duplicate rowId "${row.rowId}" in ${fileName}.json`);
      }
      seenRowIds.add(row.rowId);
    }

    const rowResult = validateLedgerRow(row, { ...options, allowedDomains });
    if (!rowResult.valid) {
      for (const err of rowResult.errors) {
        rowValidationErrors.push(`Row ${row.rowId || i} (${row.field || 'unknown'}): ${err}`);
      }
    }
  }

  const allErrors = [...fileErrors, ...rowValidationErrors];
  return {
    companyId: fileName,
    valid: allErrors.length === 0,
    errors: allErrors,
    rowCount: rows.length
  };
}

/**
 * Validates all ledger files in a directory.
 */
export function validateAllLedgers(ledgerDir = path.join(REPO_ROOT, 'docs/companies-100/ledger'), options = {}) {
  const fetchLog = options.fetchLog || loadFetchLog();
  const mergedOptions = { fetchLog, ...options };

  if (!fs.existsSync(ledgerDir)) {
    return {
      valid: true,
      totalFiles: 0,
      totalRows: 0,
      results: []
    };
  }

  const files = fs.readdirSync(ledgerDir).filter(f => f.endsWith('.json'));
  const results = [];
  let totalRows = 0;
  let allValid = true;

  for (const file of files) {
    const filePath = path.join(ledgerDir, file);
    const res = validateLedgerFile(filePath, mergedOptions);
    results.push(res);
    totalRows += res.rowCount;
    if (!res.valid) {
      allValid = false;
    }
  }

  return {
    valid: allValid,
    totalFiles: files.length,
    totalRows,
    results
  };
}

// CLI runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const companyArgIndex = args.indexOf('--company');
  const targetCompany = companyArgIndex !== -1 ? args[companyArgIndex + 1] : null;

  console.log('=== HireFlow Ledger Validator (Rules H2, H3, H4, H5, H7) ===');

  if (targetCompany) {
    const filePath = path.join(REPO_ROOT, 'docs/companies-100/ledger', `${targetCompany}.json`);
    const res = validateLedgerFile(filePath);
    if (!res.valid) {
      console.error(`❌ Validation FAILED for ${targetCompany}:`);
      for (const err of res.errors) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    } else {
      console.log(`✅ Validation PASSED for ${targetCompany} (${res.rowCount} rows)`);
      process.exit(0);
    }
  } else {
    const summary = validateAllLedgers();
    console.log(`Audited ${summary.totalFiles} ledger files (${summary.totalRows} total rows).`);
    if (!summary.valid) {
      console.error('❌ Validation FAILED:');
      for (const r of summary.results) {
        if (!r.valid) {
          console.error(`\n[${r.companyId}.json]:`);
          for (const err of r.errors) {
            console.error(`  - ${err}`);
          }
        }
      }
      process.exit(1);
    } else {
      console.log('✅ All ledger files passed validation cleanly.');
      process.exit(0);
    }
  }
}
