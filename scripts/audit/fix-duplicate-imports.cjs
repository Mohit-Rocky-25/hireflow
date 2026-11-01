#!/usr/bin/env node
// Fix duplicate imports in demo pages left from Stage 3.1 patching
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../');

// ── useTalentLensStore.ts ─────────────────────────────────────────────────────
const storePath = path.join(root, 'src/pages/demo/useTalentLensStore.ts');
let store = fs.readFileSync(storePath, 'utf8');
// Replace the duplicated block with a clean version
store = store
  .replace(
    /import type \{[\s\r\n]+Company,[\s\r\n]+Role,[\s\r\n]+AnalysisResult,[\s\r\n]+\} from '\.\/talentLensEngine';[\s\r\n]*import type \{ Company, Role \} from '\.\/talentLensData';/,
    "import type { AnalysisResult } from './talentLensEngine';\nimport type { Company, Role } from './talentLensData';"
  );
fs.writeFileSync(storePath, store);
console.log('✓ useTalentLensStore.ts fixed');

// ── CompanyRolesPage.tsx ──────────────────────────────────────────────────────
const crpPath = path.join(root, 'src/pages/demo/CompanyRolesPage.tsx');
let crp = fs.readFileSync(crpPath, 'utf8');
// Remove duplicate import that brings in COMPANIES & findCompanyBySlug from talentLensEngine
// Keep the clean engine import (only engine functions) and the data import
crp = crp.replace(
  /import \{[\s\r\n]+findCompanyBySlug,[\s\r\n]+COMPANIES,[\s\r\n]+Role,[\s\r\n]+Company,[\s\r\n]+deepAnalyzeCompetency,[\s\r\n]+computeScore,[\s\r\n]+generateImprovementPlan,[\s\r\n]+runMarketIntelligenceEngine,[\s\r\n]+analyzeRoleMatch,[\s\r\n]+\} from '\.\/talentLensEngine';[\s\r\n]*import \{ COMPANIES, findCompanyBySlug \} from '\.\/talentLensData';/,
  `import {
  deepAnalyzeCompetency,
  computeScore,
  generateImprovementPlan,
  runMarketIntelligenceEngine,
  analyzeRoleMatch,
} from './talentLensEngine';
import { COMPANIES, findCompanyBySlug, type Company, type Role } from './talentLensData';`
);
// Fix implicit-any sort callbacks
crp = crp.replace(
  /\.reduce\(\(a, c\) =>/g,
  '.reduce((a: number, c: any) =>'
);
fs.writeFileSync(crpPath, crp);
console.log('✓ CompanyRolesPage.tsx fixed');

// ── MatchingDemo.tsx ──────────────────────────────────────────────────────────
const mdPath = path.join(root, 'src/pages/demo/MatchingDemo.tsx');
let md = fs.readFileSync(mdPath, 'utf8');
md = md.replace(
  /import \{[\s\r\n]+COMPANIES,[\s\r\n]+INDUSTRIES,[\s\r\n]+TIERS,[\s\r\n]+TREND_COLOR,[\s\r\n]+TREND_ICON,[\s\r\n]+getCompanySlug,[\s\r\n]+\} from "\.\/talentLensEngine";[\s\r\n]*import \{ COMPANIES, findCompanyBySlug \} from '\.\/talentLensData';/,
  `import {
  INDUSTRIES,
  TIERS,
  TREND_COLOR,
  TREND_ICON,
  getCompanySlug,
} from "./talentLensEngine";
import { COMPANIES, findCompanyBySlug, type Company } from './talentLensData';`
);
// Also fix implicit-any reduce callbacks in MatchingDemo
md = md.replace(
  /\.reduce\(\(a, c\) =>/g,
  '.reduce((a: number, c: any) =>'
);
fs.writeFileSync(mdPath, md);
console.log('✓ MatchingDemo.tsx fixed');

console.log('\nAll duplicate imports resolved.');

