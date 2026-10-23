// ============================================================
// HireFlow — Claim Lint Checker Script
// Scans TalentLens and ATS Resume Roaster modules for banned marketing claims
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { BANNED_CLAIM_RULES } from '../src/lib/claims/bannedClaims.js';

const rootDir = process.cwd();
const allowlistPath = path.join(rootDir, 'src/lib/claims/claims-allowlist.json');
const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));

// Scoped strictly to TalentLens & ATS Resume Roaster per Hard Guardrail #1
const TARGET_PATHS = [
  'src/lib/ats',
  'src/features/ats',
  'src/pages/demo',
  'src/pages/tools/ResumeChecker.tsx',
  'src/pages/tools/TalentLens.tsx',
  'src/data/ats',
  'docs/technical-depth.md',
];

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];

interface Finding {
  file: string;
  line: number;
  term: string;
  ruleId: string;
  lineContent: string;
}

const findings: Finding[] = [];

function isAllowlisted(filePath: string): boolean {
  const norm = filePath.replace(/\\/g, '/');
  return allowlist.allowlistedFiles.some((allowed: string) => norm.endsWith(allowed) || norm.includes(allowed));
}

function scanFile(filePath: string) {
  if (isAllowlisted(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    for (const rule of BANNED_CLAIM_RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          file: path.relative(rootDir, filePath).replace(/\\/g, '/'),
          line: lineIdx + 1,
          term: rule.termDescription,
          ruleId: rule.id,
          lineContent: line.trim(),
        });
      }
    }
  });
}

function walkDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      scanFile(fullPath);
    }
  }
}

console.log('🔍 [Claims Linter] Scanning TalentLens & ATS Resume Roaster for banned claims...');

for (const target of TARGET_PATHS) {
  const fullPath = path.join(rootDir, target);
  if (!fs.existsSync(fullPath)) continue;

  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    walkDir(fullPath);
  } else if (stat.isFile()) {
    scanFile(fullPath);
  }
}

console.log(`\n--- CLAIMS LINT REPORT ---`);
if (findings.length === 0) {
  console.log('✅ ZERO BANNED CLAIMS FOUND. All scoped modules comply with honesty & measurement guidelines.');
  process.exit(0);
} else {
  console.warn(`⚠️ Found ${findings.length} claim violation(s) in scoped modules:`);
  findings.forEach((f, i) => {
    console.warn(`  ${i + 1}. [${f.term}] ${f.file}:${f.line} -> "${f.lineContent.slice(0, 80)}"`);
  });
  process.exit(1);
}
