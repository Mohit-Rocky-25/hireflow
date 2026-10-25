import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

export function hashUrl(url) {
  return crypto.createHash('sha256').update(url.trim()).digest('hex');
}

export function normalizeText(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Blind extraction rules: given raw text and a field name, extract candidates without knowing row.value
 */
export function extractBlindValue(cachedText, field) {
  const norm = normalizeText(cachedText);
  if (!norm) return null;

  switch (field) {
    case 'eligibility.aggregatePercent': {
      // Look for 60%, 65%, 70%, 75% aggregate or marks
      const m = norm.match(/\b(60|65|70|75|80)\s*%(?:\s*(?:aggregate|marks|criteria|throughout))?/);
      if (m) return parseInt(m[1], 10);
      return null;
    }
    case 'eligibility.cgpa': {
      // Look for CGPA 6.0, 6.5, 7.0, 7.5, 8.0
      const m = norm.match(/\b(6\.[0-9]|7\.[0-9]|8\.[0-9])\s*(?:cgpa|gpa)?/);
      if (m) return parseFloat(m[1]);
      return null;
    }
    case 'eligibility.backlogRule': {
      if (norm.includes('no active backlog') || norm.includes('zero backlogs') || norm.includes('0 active backlog') || norm.includes('no standing backlog')) {
        return 'no_active_backlogs';
      }
      if (norm.includes('no history of backlog') || norm.includes('no live or dead backlog')) {
        return 'no_history';
      }
      return null;
    }
    default:
      return null;
  }
}

/**
 * Verifies ledger rows against cached text blindly.
 */
export function verifyBlind(ledgerFilePath, options = {}) {
  const {
    evidenceCacheDir = path.join(REPO_ROOT, '.evidence-cache'),
    apply = false
  } = options;

  if (!fs.existsSync(ledgerFilePath)) {
    return { valid: false, errors: [`File not found: ${ledgerFilePath}`], updated: 0, needsReview: 0 };
  }

  const content = JSON.parse(fs.readFileSync(ledgerFilePath, 'utf8'));
  const rows = Array.isArray(content) ? content : content.rows;
  const companyId = path.basename(ledgerFilePath, '.json');

  let passed = 0;
  let needsReview = 0;
  const reports = [];

  for (const row of rows) {
    if (!row.url) {
      row.verify = { method: 'blind_consensus', status: 'failed', note: 'Missing URL' };
      needsReview++;
      continue;
    }

    const urlH = hashUrl(row.url);
    const flatPath = path.join(evidenceCacheDir, `${urlH}.txt`);
    const nestedPath = path.join(evidenceCacheDir, companyId, `${urlH}.txt`);
    const cachePath = fs.existsSync(nestedPath) ? nestedPath : flatPath;

    if (!fs.existsSync(cachePath)) {
      row.verify = { method: 'blind_consensus', status: 'pending', note: 'Cache file not yet downloaded' };
      reports.push({ rowId: row.rowId, field: row.field, status: 'pending', reason: 'Cache missing' });
      continue;
    }

    const cachedText = fs.readFileSync(cachePath, 'utf8');
    const normCached = normalizeText(cachedText);
    const normSnippet = normalizeText(row.snippet);

    // Rule: snippet must exist in cache
    if (!normCached.includes(normSnippet)) {
      row.verify = { method: 'blind_consensus', status: 'needsReview', note: 'Snippet not found in cache' };
      needsReview++;
      reports.push({ rowId: row.rowId, field: row.field, status: 'needsReview', reason: 'Snippet mismatch' });
      continue;
    }

    // For fields with deterministic extraction patterns, verify agreement
    const blindExtracted = extractBlindValue(cachedText, row.field);
    if (blindExtracted !== null) {
      if (JSON.stringify(blindExtracted) === JSON.stringify(row.value) || blindExtracted === row.value) {
        row.verify = { method: 'blind_consensus', status: 'passed' };
        passed++;
      } else {
        row.verify = {
          method: 'blind_consensus',
          status: 'needsReview',
          note: `Blind extraction (${blindExtracted}) differed from ledger (${row.value})`
        };
        needsReview++;
        reports.push({
          rowId: row.rowId,
          field: row.field,
          status: 'needsReview',
          reason: `Discrepancy: blind=${blindExtracted}, ledger=${row.value}`
        });
      }
    } else {
      // Snippet verified present in cache; mark passed via direct snippet verification
      row.verify = { method: 'snippet_verified', status: 'passed' };
      passed++;
    }
  }

  if (apply) {
    fs.writeFileSync(ledgerFilePath, JSON.stringify(content, null, 2), 'utf8');
  }

  return {
    valid: needsReview === 0,
    companyId,
    totalRows: rows.length,
    passed,
    needsReview,
    reports
  };
}

// CLI runner
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const companyArgIndex = args.indexOf('--company');
  const targetCompany = companyArgIndex !== -1 ? args[companyArgIndex + 1] : null;
  const apply = args.includes('--apply');

  console.log('=== HireFlow Blind Re-Extraction Verifier (Rule H9) ===');

  const ledgerDir = path.join(REPO_ROOT, 'docs/companies-100/ledger');
  const files = targetCompany
    ? [`${targetCompany}.json`]
    : (fs.existsSync(ledgerDir) ? fs.readdirSync(ledgerDir).filter(f => f.endsWith('.json')) : []);

  if (files.length === 0) {
    console.log('No ledger files found to verify.');
    process.exit(0);
  }

  let totalPassed = 0;
  let totalNeedsReview = 0;

  for (const file of files) {
    const filePath = path.join(ledgerDir, file);
    const res = verifyBlind(filePath, { apply });
    totalPassed += res.passed;
    totalNeedsReview += res.needsReview;
    console.log(`[${res.companyId}]: ${res.passed}/${res.totalRows} passed, ${res.needsReview} needs review`);
    for (const rep of res.reports) {
      console.log(`  - Row ${rep.rowId} (${rep.field}): [${rep.status}] ${rep.reason}`);
    }
  }

  if (totalNeedsReview > 0) {
    console.error(`\n❌ ${totalNeedsReview} rows need review.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All verified cleanly (${totalPassed} rows passed).`);
    process.exit(0);
  }
}
