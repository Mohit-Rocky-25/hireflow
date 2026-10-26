// ============================================================
// Pathways Ledger Validator
// Enforces Constitution Rules B4 (H2, H3, H4, H5, H8), B6
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { readFetchLog, getCachedText } from './fetch-helper.mjs';

const ROOT_DIR = process.cwd();
const LEDGER_DIR = path.join(ROOT_DIR, 'docs', 'pathways', 'ledger');

const BANNED_DOMAINS = [
  'glassdoor',
  'ambitionbox',
  'linkedin.com',
  'naukri.com',
  'prepinsta',
  'faceprep',
  'levels.fyi',
  'geeksforgeeks.org',
  'medium.com',
  'wikipedia.org',
  'quora.com',
];

const BANNED_WORDS = [
  'verified',
  'guaranteed',
  'proven',
  'predicted',
  'accurate',
  'certified',
  'you will get',
  'best company',
];

const BANNED_VALUE_WORDS = [
  'typical',
  'approximately',
  'around',
  'estimated',
  'about',
  'expected',
];

const ALLOWED_PROGRAM_FIELDS = new Set([
  'officialName',
  'programName',
  'programPageUrl',
  'eligibility.cgpaMin',
  'eligibility.cgpaScale',
  'eligibility.percentAggregateMin',
  'eligibility.percent10Min',
  'eligibility.percent12Min',
  'eligibility.maxActiveBacklogs',
  'eligibility.backlogHistoryRule',
  'eligibility.maxGapMonths',
  'eligibility.branches',
  'eligibility.degrees',
  'eligibility.batchYears',
  'stage.name',
  'stage.type',
  'bondMonths',
  'bondAmount',
  'stipend',
]);

const ALLOWED_RULE_PREFIXES = [
  'tax.newRegime.',
  'tax.oldRegime.',
  'tax.standardDeduction',
  'tax.rebate87A.',
  'tax.cessRate',
  'epf.employeeRate',
  'epf.wageCeiling',
  'labour.wageDefinition.',
];

function isFieldAllowed(field) {
  if (ALLOWED_PROGRAM_FIELDS.has(field)) return true;
  for (const prefix of ALLOWED_RULE_PREFIXES) {
    if (field.startsWith(prefix)) return true;
  }
  return false;
}

export function validateLedger(ledgerFiles = null) {
  if (!fs.existsSync(LEDGER_DIR)) {
    return { ok: true, rowCount: 0, errors: [] };
  }

  const files = ledgerFiles || fs.readdirSync(LEDGER_DIR).filter((f) => f.endsWith('.json'));
  const fetchLog = readFetchLog();
  const successfulUrls = new Set(
    fetchLog.filter((e) => e.httpStatus === 200).map((e) => e.url.trim().toLowerCase())
  );

  const errors = [];
  let rowCount = 0;

  for (const file of files) {
    const filePath = path.join(LEDGER_DIR, file);
    let rows;
    try {
      rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      errors.push(`${file}: Invalid JSON syntax - ${err.message}`);
      continue;
    }

    if (!Array.isArray(rows)) {
      errors.push(`${file}: Root element must be an array of rows`);
      continue;
    }

    rows.forEach((row, idx) => {
      rowCount++;
      const prefix = `${file}[${idx}] (${row.rowId || 'no-id'})`;

      // H3: Row format
      if (!row.rowId || typeof row.rowId !== 'string') errors.push(`${prefix}: Missing rowId`);
      if (!row.subjectId || typeof row.subjectId !== 'string') errors.push(`${prefix}: Missing subjectId`);
      if (!row.field || !isFieldAllowed(row.field)) errors.push(`${prefix}: Disallowed field "${row.field}" (H2 closed list)`);
      if (row.value === undefined || row.value === null) errors.push(`${prefix}: Missing value`);
      if (!row.sourceKind || (row.sourceKind !== 'official' && row.sourceKind !== 'company-published')) {
        errors.push(`${prefix}: Invalid sourceKind "${row.sourceKind}"`);
      }
      if (!row.publisherType || (row.publisherType !== 'company' && row.publisherType !== 'government')) {
        errors.push(`${prefix}: Invalid publisherType "${row.publisherType}"`);
      }
      if (!row.url || !row.url.startsWith('http')) errors.push(`${prefix}: Invalid URL`);
      if (!row.retrievedAt || isNaN(Date.parse(row.retrievedAt))) errors.push(`${prefix}: Invalid ISO retrievedAt date`);
      if (row.extractedBy !== 'ai' && row.extractedBy !== 'human') errors.push(`${prefix}: Invalid extractedBy`);

      // H3 & H4: Snippet checks
      if (!row.snippet || typeof row.snippet !== 'string') {
        errors.push(`${prefix}: Missing or empty snippet`);
      } else {
        const words = row.snippet.trim().split(/\s+/).filter(Boolean);
        if (words.length > 15) {
          errors.push(`${prefix}: Snippet exceeds 15 words limit (got ${words.length} words: "${row.snippet}")`);
        }

        // H4: Check cached text
        const cached = getCachedText(row.url);
        if (!cached) {
          errors.push(`${prefix}: No cached text found for URL ${row.url} in .evidence-cache/`);
        } else {
          const normCached = cached.toLowerCase().replace(/\s+/g, ' ');
          const normSnippet = row.snippet.toLowerCase().replace(/\s+/g, ' ');
          if (!normCached.includes(normSnippet)) {
            errors.push(`${prefix}: Snippet "${row.snippet}" not found in cached text of ${row.url}`);
          }
        }
      }

      // H4: Fetch-log status 200 check
      const normUrl = (row.url || '').trim().toLowerCase();
      if (!successfulUrls.has(normUrl)) {
        errors.push(`${prefix}: URL ${row.url} has no entry with HTTP 200 in fetch-log.jsonl`);
      }

      // H5: Banned domains check
      for (const banned of BANNED_DOMAINS) {
        if (normUrl.includes(banned)) {
          errors.push(`${prefix}: URL ${row.url} uses banned source domain "${banned}" (Constitution H5)`);
        }
      }

      // H8: Imputation words in value
      if (typeof row.value === 'string') {
        for (const bw of BANNED_VALUE_WORDS) {
          if (new RegExp(`\\b${bw}\\b`, 'i').test(row.value)) {
            errors.push(`${prefix}: Fact value contains banned imputation word "${bw}": "${row.value}" (H8)`);
          }
        }
      }

      // B6: Banned marketing words in string fields
      const textToScan = `${row.field} ${String(row.value)} ${row.snippet || ''}`.toLowerCase();
      for (const banned of BANNED_WORDS) {
        if (new RegExp(`\\b${banned}\\b`, 'i').test(textToScan)) {
          errors.push(`${prefix}: Contains banned word "${banned}" (Constitution B6)`);
        }
      }
    });
  }

  return { ok: errors.length === 0, rowCount, errors };
}

// CLI execution
if (process.argv[1]?.endsWith('validate-ledger.mjs')) {
  const result = validateLedger();
  if (!result.ok) {
    console.error(`❌ Ledger Validation FAILED with ${result.errors.length} errors:`);
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log(`✅ Ledger Validation PASSED (${result.rowCount} rows validated cleanly across all files)`);
    process.exit(0);
  }
}
