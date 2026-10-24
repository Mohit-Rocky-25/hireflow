// ============================================================
// HireFlow Scoring Suite — Boundary Lint: check:ui-scoring
// Audits UI components in src/features, src/pages, src/components
// Enforces Rule A1 & A2:
// 1. Zero imports of scoring calculator internals into UI components
// 2. Zero inline arithmetic or score modifications on displayed scores
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const SCAN_DIRS = [
  path.join(projectRoot, 'src', 'features'),
  path.join(projectRoot, 'src', 'pages'),
  path.join(projectRoot, 'src', 'components'),
];

// Folders or files exempt from UI check (internal engine and data files)
const EXEMPT_PATH_SUBSTRINGS = [
  path.normalize('/engine/'),
  path.normalize('\\engine\\'),
  path.normalize('/talentLensEngine.ts'),
  path.normalize('\\talentLensEngine.ts'),
  path.normalize('/talentLensData.ts'),
  path.normalize('\\talentLensData.ts'),
  path.normalize('/compareJDs.ts'),
  path.normalize('\\compareJDs.ts'),
  path.normalize('/__tests__/'),
  path.normalize('\\__tests__\\'),
  '.test.',
  '.spec.',
];

// Forbidden import patterns: UI must not import internal calculators directly
const FORBIDDEN_IMPORT_PATTERNS = [
  {
    regex: /from\s+['"][^'"]*\/scoring\/core\/(?:calculators|bulletScorer|composite|band)(?:['"]|;)/i,
    reason: 'UI component must not import internal scoring calculators directly. Consume ScoreTrace produced by runScoringEngine instead.',
  },
];

// Forbidden arithmetic on score variables
const FORBIDDEN_ARITHMETIC_PATTERNS = [
  {
    regex: /(?:(?:\bscore|\boverallScore|\bcompositeScore|\bresult\.score))\s*\*\s*0\.\d+/i,
    reason: 'UI component must not apply inline percentage scaling or perturbation on scores. Read sensitivity band from trace.band.',
  },
  {
    regex: /Math\.round\s*\(\s*(?:score|overallScore|result\.score)\s*\*\s*1\.\d+\s*[\+\-]\s*\d+\s*\)/i,
    reason: 'UI component must not compute ad-hoc score ranges. Read trace.band.low and trace.band.high directly.',
  },
  {
    regex: /Math\.round\s*\(\s*(?:score|overallScore|result\.score)\s*\*\s*0\.\d+\s*[\+\-]\s*\d+\s*\)/i,
    reason: 'UI component must not compute ad-hoc score ranges. Read trace.band.low and trace.band.high directly.',
  },
];

function getFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

let totalAudited = 0;
const violations = [];

for (const dir of SCAN_DIRS) {
  const files = getFilesRecursively(dir);
  for (const file of files) {
    const isExempt = EXEMPT_PATH_SUBSTRINGS.some((sub) => file.includes(sub));
    if (isExempt) continue;

    totalAudited++;
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for spec-exempt annotation
      if (line.includes('spec-exempt:')) return;
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) return;

      // 1. Check forbidden imports
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        if (pattern.regex.test(line)) {
          violations.push({
            file: path.relative(projectRoot, file),
            lineNum: index + 1,
            lineText: line.trim(),
            reason: pattern.reason,
          });
        }
      }

      // 2. Check forbidden arithmetic
      for (const pattern of FORBIDDEN_ARITHMETIC_PATTERNS) {
        if (pattern.regex.test(line)) {
          violations.push({
            file: path.relative(projectRoot, file),
            lineNum: index + 1,
            lineText: line.trim(),
            reason: pattern.reason,
          });
        }
      }
    });
  }
}

console.log(`\n🔍 check:ui-scoring — Audited ${totalAudited} UI components in src/features, src/pages, src/components`);

if (violations.length > 0) {
  console.error(`\n❌ Found ${violations.length} UI scoring boundary violations:\n`);
  for (const v of violations) {
    console.error(`  [VIOLATION] ${v.file}:${v.lineNum}`);
    console.error(`  Line:   ${v.lineText}`);
    console.error(`  Reason: ${v.reason}\n`);
  }
  process.exit(1);
} else {
  console.log('✅ Zero UI scoring arithmetic or internal calculator imports found across audited UI components!\n');
  process.exit(0);
}
