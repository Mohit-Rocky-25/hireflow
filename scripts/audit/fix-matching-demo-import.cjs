#!/usr/bin/env node
// Fine-grained fixer for MatchingDemo.tsx — removes COMPANIES from engine import
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../');

// ── MatchingDemo.tsx ──────────────────────────────────────────────────────────
const mdPath = path.join(root, 'src/pages/demo/MatchingDemo.tsx');
let src = fs.readFileSync(mdPath, 'utf8');

// Strategy: find the engine import block (may have CRLF) and rewrite it
// without COMPANIES; then fix the data import to include 'type Company'
const engineImportOld = `import {
  COMPANIES,
  INDUSTRIES,
  TIERS,
  TREND_COLOR,
  TREND_ICON,
  getCompanySlug,
} from "./talentLensEngine";`;

const engineImportNew = `import {
  INDUSTRIES,
  TIERS,
  TREND_COLOR,
  TREND_ICON,
  getCompanySlug,
} from "./talentLensEngine";`;

// Normalize CRLF for matching then restore
const normalized = src.replace(/\r\n/g, '\n');
let fixed = normalized.replace(engineImportOld, engineImportNew);

// Also fix the data import line to add type Company
fixed = fixed.replace(
  /import \{ COMPANIES, findCompanyBySlug \} from '\.\/talentLensData';/,
  "import { COMPANIES, findCompanyBySlug, type Company } from './talentLensData';"
);

// Fix implicit-any reduce callbacks (safe global replace)
fixed = fixed.replace(/\.reduce\(\(a, c\) =>/g, '.reduce((a: number, c: any) =>');

// Restore CRLF
fixed = fixed.replace(/\n/g, '\r\n');

fs.writeFileSync(mdPath, fixed);
console.log('✓ MatchingDemo.tsx engine import cleaned');

// ── CompanyRolesPage.tsx — verify it's clean ─────────────────────────────────
const crpPath = path.join(root, 'src/pages/demo/CompanyRolesPage.tsx');
const crp = fs.readFileSync(crpPath, 'utf8');
const engineCount = (crp.match(/COMPANIES/g) || []).length;
const fromEngine = crp.includes("from './talentLensEngine'") || crp.includes('from "./talentLensEngine"');
const fromData   = crp.includes("from './talentLensData'") || crp.includes('from "./talentLensData"');
console.log(`CompanyRolesPage.tsx — COMPANIES refs: ${engineCount}, has engine import: ${fromEngine}, has data import: ${fromData}`);
// Check no COMPANIES in the engine import
if (crp.match(/import \{[^}]*COMPANIES[^}]*\} from ['"]\.\/talentLensEngine['"]/)) {
  console.error('✗ CompanyRolesPage still imports COMPANIES from talentLensEngine — fixing...');
  let c2 = crp.replace(/\r\n/g, '\n');
  c2 = c2.replace(/,?\s*COMPANIES,?/, '');
  fs.writeFileSync(crpPath, c2.replace(/\n/g, '\r\n'));
  console.log('  → fixed');
} else {
  console.log('✓ CompanyRolesPage.tsx engine import is clean');
}

console.log('\nDone.');

