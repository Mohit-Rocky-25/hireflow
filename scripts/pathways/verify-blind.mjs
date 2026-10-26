// ============================================================
// Pathways Blind Re-Extraction Check
// Enforces Constitution Rule B4/H10 (AI self-check, not verification)
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { getCachedText } from './fetch-helper.mjs';

const ROOT_DIR = process.cwd();
const LEDGER_DIR = path.join(ROOT_DIR, 'docs', 'pathways', 'ledger');

export function runBlindCheck() {
  if (!fs.existsSync(LEDGER_DIR)) {
    return { checked: 0, agreements: 0, disagreements: 0, rate: 100, logs: [] };
  }

  const files = fs.readdirSync(LEDGER_DIR).filter((f) => f.endsWith('.json'));
  let checked = 0;
  let agreements = 0;
  let disagreements = 0;
  const logs = [];

  for (const file of files) {
    const filePath = path.join(LEDGER_DIR, file);
    const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const row of rows) {
      // Blind check only numeric/eligibility rows
      if (typeof row.value !== 'number' && !Array.isArray(row.value)) continue;

      const cached = getCachedText(row.url);
      if (!cached) {
        disagreements++;
        logs.push({ rowId: row.rowId, status: 'NO_CACHE', reason: 'Cached page text missing' });
        continue;
      }

      checked++;
      const normCached = cached.toLowerCase().replace(/\s+/g, ' ');
      const normSnippet = (row.snippet || '').toLowerCase().replace(/\s+/g, ' ');

      if (!normCached.includes(normSnippet)) {
        disagreements++;
        logs.push({ rowId: row.rowId, status: 'DISAGREEMENT', reason: 'Snippet not found in cached text' });
        continue;
      }

      // Check if the exact numeric value is present within the snippet
      const valueStr = String(row.value);
      if (normSnippet.includes(valueStr) || Array.isArray(row.value)) {
        agreements++;
        logs.push({ rowId: row.rowId, status: 'AGREEMENT' });
      } else {
        // Look within 200 chars around snippet in cached text
        const idx = normCached.indexOf(normSnippet);
        const windowText = normCached.slice(Math.max(0, idx - 100), Math.min(normCached.length, idx + normSnippet.length + 100));
        if (windowText.includes(valueStr)) {
          agreements++;
          logs.push({ rowId: row.rowId, status: 'AGREEMENT_PROXIMATE' });
        } else {
          disagreements++;
          logs.push({ rowId: row.rowId, status: 'DISAGREEMENT', reason: `Value ${row.value} not found in proximity of snippet` });
        }
      }
    }
  }

  const rate = checked > 0 ? ((agreements / checked) * 100).toFixed(2) : '100.00';
  return { checked, agreements, disagreements, rate, logs };
}

if (process.argv[1]?.endsWith('verify-blind.mjs')) {
  const result = runBlindCheck();
  console.log(`=== Blind Re-Extraction Self-Check (H10) ===`);
  console.log(`Total Checked Rows: ${result.checked}`);
  console.log(`Agreements:         ${result.agreements}`);
  console.log(`Disagreements:      ${result.disagreements}`);
  console.log(`Agreement Rate:     ${result.rate}%`);

  const disagreementRate = result.checked > 0 ? (result.disagreements / result.checked) * 100 : 0;
  if (disagreementRate > 5) {
    console.error(`❌ Auto-halt: Blind-check disagreement rate (${disagreementRate.toFixed(2)}%) exceeds 5% threshold (Constitution H12)!`);
    process.exit(1);
  } else {
    console.log(`✅ Blind Re-Extraction within allowed threshold (<= 5%).`);
    process.exit(0);
  }
}
