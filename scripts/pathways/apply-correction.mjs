// ============================================================
// Pathways Apply Correction Tool
// Validates an external or user-reported correction file and
// applies it to docs/pathways/ledger/
// Governed by Spec C9 & Constitution B4/H2/H3/H5
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { ALLOWED_PROGRAM_FIELDS } from './validate-ledger.mjs';

const ROOT_DIR = process.cwd();
const LEDGER_DIR = path.join(ROOT_DIR, 'docs', 'pathways', 'ledger');

export function applyCorrection(correctionFilePath) {
  if (!fs.existsSync(correctionFilePath)) {
    console.error(`❌ Error: Correction file not found: ${correctionFilePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(correctionFilePath, 'utf8');
  let correction;
  try {
    correction = JSON.parse(raw);
  } catch {
    console.error(`❌ Error: Correction file must be valid JSON: ${correctionFilePath}`);
    process.exit(1);
  }

  // Validate required fields
  const required = ['subjectId', 'field', 'value', 'url', 'snippet'];
  for (const req of required) {
    if (correction[req] === undefined || correction[req] === null) {
      console.error(`❌ Error: Missing required field "${req}" in correction.`);
      process.exit(1);
    }
  }

  // Validate closed field list (H2)
  if (!ALLOWED_PROGRAM_FIELDS.includes(correction.field) && !correction.field.startsWith('tax.') && !correction.field.startsWith('epf.')) {
    console.error(`❌ Error: Field "${correction.field}" is not in the Constitution H2 closed field list.`);
    process.exit(1);
  }

  // Validate snippet length <= 15 words (H3)
  const wordCount = correction.snippet.trim().split(/\s+/).length;
  if (wordCount > 15) {
    console.error(`❌ Error: Snippet exceeds 15-word maximum (got ${wordCount} words): "${correction.snippet}"`);
    process.exit(1);
  }

  const subjectFile = path.join(LEDGER_DIR, `${correction.subjectId}.json`);
  if (!fs.existsSync(subjectFile)) {
    console.error(`❌ Error: Ledger subject file does not exist: ${subjectFile}`);
    process.exit(1);
  }

  const existingRows = JSON.parse(fs.readFileSync(subjectFile, 'utf8'));
  const newRow = {
    rowId: `${correction.subjectId}-${correction.field.replace(/\./g, '-')}-${existingRows.length}`,
    subjectId: correction.subjectId,
    field: correction.field,
    value: correction.value,
    unit: correction.unit,
    sourceKind: correction.sourceKind || 'official',
    publisherType: correction.publisherType || 'company',
    url: correction.url,
    retrievedAt: correction.retrievedAt || new Date().toISOString(),
    extractedBy: 'human',
    snippet: correction.snippet
  };

  // Replace or append
  const existingIdx = existingRows.findIndex((r) => r.field === correction.field);
  if (existingIdx >= 0) {
    existingRows[existingIdx] = newRow;
    console.log(`✓ Replaced existing row for field "${correction.field}" in ${correction.subjectId}.json`);
  } else {
    existingRows.push(newRow);
    console.log(`✓ Appended new row for field "${correction.field}" in ${correction.subjectId}.json`);
  }

  fs.writeFileSync(subjectFile, JSON.stringify(existingRows, null, 2) + '\n', 'utf8');
  console.log(`✅ Correction applied successfully! Run "npm run pathways:build" to recompile facts.`);
}

if (process.argv[1]?.endsWith('apply-correction.mjs')) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log('Usage: node scripts/pathways/apply-correction.mjs <path-to-correction.json>');
    process.exit(0);
  }
  applyCorrection(filePath);
}
