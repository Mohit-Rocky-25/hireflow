// ============================================================
// Pathways UI Math Checker
// Enforces Constitution Rule B3/E6 (Zero scoring or arithmetic in UI components)
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PATHWAYS_SRC = path.join(ROOT_DIR, 'src', 'pathways');

const SUSPICIOUS_ARITHMETIC_PATTERNS = [
  /(?:result|offer|profile|scenario)\.[a-zA-Z0-9_]+\s*[\+\-\*\/]\s*(?:result|offer|profile|scenario|\d+)/,
  /\{\s*\(?(?:result|offer|scenario)\.[a-zA-Z0-9_]+\s*[\+\-\*\/]/,
  /\bMath\.(?:round|floor|ceil)\s*\(\s*(?:result|offer|scenario)\./,
];

export function checkUiMath() {
  if (!fs.existsSync(PATHWAYS_SRC)) return { ok: true, violations: [] };

  const violations = [];
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip pure engine and test directories
        if (entry.name === 'engine' || entry.name === '__tests__' || entry.name === 'schema') continue;
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          // Skip comments
          if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;
          for (const pattern of SUSPICIOUS_ARITHMETIC_PATTERNS) {
            if (pattern.test(line)) {
              violations.push({
                file: path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/'),
                line: idx + 1,
                snippet: line.trim(),
                reason: 'Component performs direct arithmetic on result/scenario fields (Rule E6 violation). Arithmetic must live in pure engine.',
              });
            }
          }
        });
      }
    }
  }

  scanDir(PATHWAYS_SRC);
  return { ok: violations.length === 0, violations };
}

if (process.argv[1]?.endsWith('check-ui-math.mjs')) {
  const result = checkUiMath();
  if (!result.ok) {
    console.error(`❌ check:ui-math FAILED with ${result.violations.length} violations:`);
    result.violations.forEach((v) => console.error(`  - ${v.file}:${v.line} -> ${v.snippet} (${v.reason})`));
    process.exit(1);
  } else {
    console.log(`✅ check:ui-math PASSED: Zero arithmetic or scoring detected inside UI components.`);
    process.exit(0);
  }
}
