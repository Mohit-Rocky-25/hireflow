// ============================================================
// Pathways Claims & Word Lint Checker
// Enforces Constitution Rule B6 (Banned marketing & prediction words)
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PATHWAYS_SRC = path.join(ROOT_DIR, 'src', 'pathways');
const PATHWAYS_DOCS = path.join(ROOT_DIR, 'docs', 'pathways');

export const BANNED_CLAIM_WORDS = [
  'guaranteed',
  'proven',
  'predicted',
  'certified',
  'you will get',
  'best company',
];

// Context-aware exemptions: CONSTITUTION.md, SPEC.md, ADRs, check scripts, and test mocks describing rules
const EXEMPT_FILES = [
  'CONSTITUTION.md',
  'SPEC.md',
  'check-claims.mjs',
  'validate-ledger.mjs',
  'audit.mjs',
  'spec-review.md',
  'ADR-001.md',
];

export function checkPathwaysClaims() {
  const violations = [];

  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile()) {
        if (EXEMPT_FILES.some((exempt) => entry.name.endsWith(exempt))) continue;
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            // Skip code comments that explicitly reference the banned words rule
            if (line.includes('B6') || line.includes('banned') || line.includes('BANNED')) return;

            for (const word of BANNED_CLAIM_WORDS) {
              const regex = new RegExp(`\\b${word}\\b`, 'i');
              if (regex.test(line)) {
                violations.push({
                  file: path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/'),
                  line: idx + 1,
                  word,
                  snippet: line.trim(),
                });
              }
            }
          });
        }
      }
    }
  }

  scan(PATHWAYS_SRC);
  scan(PATHWAYS_DOCS);

  return { ok: violations.length === 0, violations };
}

if (process.argv[1]?.endsWith('check-claims.mjs')) {
  const result = checkPathwaysClaims();
  if (!result.ok) {
    console.error(`❌ check:claims FAILED with ${result.violations.length} banned word violations (Constitution B6):`);
    result.violations.forEach((v) => console.error(`  - ${v.file}:${v.line} -> Found "${v.word}" in: "${v.snippet}"`));
    process.exit(1);
  } else {
    console.log(`✅ check:claims PASSED: Zero banned marketing words found across Pathways files.`);
    process.exit(0);
  }
}
