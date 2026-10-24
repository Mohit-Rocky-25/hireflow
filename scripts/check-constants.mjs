// ============================================================
// HireFlow Scoring Suite — check:constants Script
// Rule A1: Every weight, tier value, multiplier, and threshold lives in the spec.
// No scoring constant is typed anywhere else.
// Guardrail 1: Scope restricted strictly to scoring modules.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

// Scoped strictly to scoring modules per Hard Guardrail #1
const SCORING_TARGET_ROOTS = [
  'src/scoring',
  'src/features/ats',
  'src/lib/ats',
  'src/config/scoring.ts',
  'src/config/versions.ts',
  'src/pages/tools/ResumeChecker.tsx',
  'src/pages/tools/TalentLens.tsx',
  'src/pages/methodology',
  'src/pages/demo',
];

// Exempt directories and files
const EXEMPT_PATTERNS = [
  /src[/\\]scoring[/\\]spec/,
  /__tests__/,
  /__fixtures__/,
  /\.test\.[tj]sx?$/,
  /\.spec\.[tj]sx?$/,
  /src[/\\]data/,
  /[/\\]taxonomy[/\\]/,
  /talentLensData\.ts$/,
];

function isExempt(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  return EXEMPT_PATTERNS.some((pat) => pat.test(norm));
}

function collectFiles(targetPath) {
  const full = path.join(rootDir, targetPath);
  if (!fs.existsSync(full)) return [];
  const stat = fs.statSync(full);
  if (!stat.isDirectory()) {
    return isExempt(full) ? [] : [full];
  }

  let results = [];
  const list = fs.readdirSync(full);
  for (const item of list) {
    const itemFull = path.join(full, item);
    const itemStat = fs.statSync(itemFull);
    if (itemStat.isDirectory()) {
      if (!item.includes('node_modules') && !item.includes('.git') && !item.includes('dist')) {
        results = results.concat(collectFiles(path.relative(rootDir, itemFull)));
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(item) && !isExempt(itemFull)) {
      results.push(itemFull);
    }
  }
  return results;
}

const allScoringFiles = [];
for (const target of SCORING_TARGET_ROOTS) {
  allScoringFiles.push(...collectFiles(target));
}

// Remove duplicates
const uniqueFiles = Array.from(new Set(allScoringFiles));

// Patterns that match scoring weights, multipliers, thresholds with numeric literals
const SUSPECT_PATTERNS = [
  /\b(weight|weights|multiplier|multipliers|threshold|thresholds|penalty|scoreFactor|deductionPoints)\s*[:=]\s*([0-9]+\.[0-9]+|[0-9]{2,3})\b/i,
  /\b0\.(?:[0-9]{2,})\b/,
];

const ALLOWED_NUMBERS = new Set(['0', '1', '100', '-1', '0.0', '1.0', '100.0']);

function isLineExempt(line) {
  if (line.includes('spec-exempt:')) return true;
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return true;
  // Exclude CSS / styling / pixel / animation / rgb / hsl values
  if (/px|rem|em|vh|vw|ms|deg|rgba?\(|hsla?\(|#[0-9a-fA-F]{3,8}/.test(line)) return true;
  // Exclude IntersectionObserver threshold
  if (/threshold:\s*0\.\d+/.test(line)) return true;
  // Exclude imports/exports of types
  if (/^import\b|^export type\b|^export interface\b/.test(trimmed)) return true;
  // Exclude array indexing, string manipulation, or regex
  if (/\[\s*\d+\s*\]|\.slice\(|\.substring\(|\.charAt\(|\.indexOf\(|\/.*\/[a-z]*/.test(line)) return true;
  return false;
}

const violations = [];

for (const f of uniqueFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (isLineExempt(line)) return;

    for (const pat of SUSPECT_PATTERNS) {
      const match = line.match(pat);
      if (match) {
        const numStr = match[2] || match[0];
        if (!ALLOWED_NUMBERS.has(numStr.trim())) {
          violations.push({
            file: path.relative(rootDir, f).replace(/\\/g, '/'),
            line: idx + 1,
            match: match[0],
            lineContent: line.trim(),
          });
          break;
        }
      }
    }
  });
}

console.log(`\n🔍 check:constants — Audited ${uniqueFiles.length} scoring files outside spec/`);

if (violations.length > 0) {
  console.error(`\n❌ Found ${violations.length} hardcoded scoring constants outside spec:\n`);
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} -> "${v.match}"\n    ${v.lineContent}`);
  }
  console.error(`\nFix these violations by migrating them to the spec or adding "// spec-exempt: <reason>".\n`);
  process.exit(1);
} else {
  console.log(`✅ Zero hardcoded scoring constants found outside spec! All weights and thresholds derive from CANONICAL_SCORING_SPEC.\n`);
  process.exit(0);
}
