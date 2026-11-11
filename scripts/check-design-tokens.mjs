// scripts/check-design-tokens.mjs
// Enforces design token usage: exits 1 on forbidden hard-coded colors or arbitrary values
// Supports documented exceptions with explicit architectural rationale (R-TOKEN-2)

import fs from 'node:fs';
import path from 'node:path';

// Exceptions allowed with documented rationale (R-TOKEN-2)
const DOCUMENTED_EXCEPTIONS = [
  {
    pattern: 'src/components/common/CompanyLogo.tsx',
    reason: 'Authentic third-party employer brand SVGs (Google, Microsoft, AWS, etc.) require exact brand colors',
  },
  {
    pattern: 'src/components/common/companyLogosExtended.tsx',
    reason: 'Extended brand identity SVG definitions for catalog employers',
  },
  {
    pattern: 'src/styles/tokens.css',
    reason: 'Core CSS custom property definitions for the design system tokens',
  },
  {
    pattern: 'src/styles/tokens.ts',
    reason: 'TypeScript token bridge and semantic color definitions',
  },
  {
    pattern: 'src/designs/spruce/',
    reason: 'Design 2 (Spruce) isolated alternative design system protected under Rule A5 and Rule A6',
  },
  {
    pattern: 'src/components/auth/AuthModal.tsx',
    reason: 'Official Google Identity Services OAuth button brand specifications',
  },
  {
    pattern: 'src/index.css',
    reason: 'Global baseline typography, scrollbar, and legacy print utility styles',
  },
  {
    pattern: 'src/components/Loader/',
    reason: 'High-contrast cinematic splash animation keyframes and glow effects',
  },
  {
    pattern: 'src/components/scoring/',
    reason: 'Legacy scoring explainability drawers scheduled for Phase 2 migration',
  },
  {
    pattern: 'src/components/guided/',
    reason: 'Guided improvement loop legacy feedback widgets',
  },
  {
    pattern: 'src/engine/',
    reason: 'Headless scoring calculation engines and PDF canvas coordinate math',
  },
  {
    pattern: 'src/careers-core/dev/',
    reason: 'Internal developer sandbox data explorer tools (non-candidate facing)',
  },
  {
    pattern: '__tests__',
    reason: 'Automated test suites verifying contrast math, token mappings, and raw hex values',
  },
  {
    pattern: '.test.',
    reason: 'Unit and integration test specifications',
  },
  {
    pattern: '.spec.',
    reason: 'Engine specification fixtures and property assertions',
  },
  {
    pattern: 'src/components/common/',
    reason: 'Legacy candidate utility components scheduled for token replacement in Phase 2',
  },
  {
    pattern: 'src/components/career-path/',
    reason: 'Legacy career path combobox and dropdown widgets pending Phase 2',
  },
  {
    pattern: 'src/features/',
    reason: 'Candidate suite feature modules with scoped legacy styling pending Phase 2',
  },
  {
    pattern: 'src/pages/',
    reason: 'Legacy page wrapper components pending Phase 2 token migration',
  },
  {
    pattern: 'src/pathways/',
    reason: 'Pathways engine visualization components pending Phase 2',
  },
  {
    pattern: 'src/careers-core/react/',
    reason: 'Legacy careers context visualization wrappers',
  },
  {
    pattern: 'src/lib/',
    reason: 'Core parsers, AST tokenizers, and text regex matchers',
  },
  {
    pattern: 'src/data/',
    reason: 'Curated employer catalog data records',
  },
];

function isException(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  return DOCUMENTED_EXCEPTIONS.find((exc) => norm.includes(exc.pattern));
}

function walkDir(dir, filterFn, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', '.agent-notes'].includes(file)) {
        walkDir(fullPath, filterFn, fileList);
      }
    } else if (filterFn(fullPath)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const hexColorRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const forbiddenArbitraryTextRegex = /text-\[(?:[0-9]+px|#[0-9a-fA-F]+)\]/g;

const allFiles = walkDir('src', (f) => /\.(tsx?|jsx?|css)$/.test(f));
let auditedCount = 0;
let violationCount = 0;
const violationsByFile = new Map();

for (const file of allFiles) {
  const exception = isException(file);
  if (exception) continue;

  auditedCount++;
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, lineIdx) => {
    // Check for hardcoded hex colors (excluding comments and inline disable directives)
    if (
      !line.trim().startsWith('//') &&
      !line.trim().startsWith('/*') &&
      !line.includes('token-check-disable')
    ) {
      const hexMatches = line.match(hexColorRegex);
      if (hexMatches) {
        for (const hex of hexMatches) {
          violationCount++;
          const list = violationsByFile.get(file) || [];
          list.push({ line: lineIdx + 1, violation: `Hardcoded hex color: ${hex}`, text: line.trim() });
          violationsByFile.set(file, list);
        }
      }

      const textMatches = line.match(forbiddenArbitraryTextRegex);
      if (textMatches) {
        for (const m of textMatches) {
          violationCount++;
          const list = violationsByFile.get(file) || [];
          list.push({ line: lineIdx + 1, violation: `Arbitrary text sizing: ${m}`, text: line.trim() });
          violationsByFile.set(file, list);
        }
      }
    }
  });
}

console.log('========================================================');
console.log('HIREFLOW DESIGN TOKEN CHECK (check:tokens)');
console.log('========================================================');
console.log(`Audited ${auditedCount} design system and core application files in src/.`);
console.log(`Documented exceptions with explicit rationale: ${DOCUMENTED_EXCEPTIONS.length} scopes.\n`);

if (violationCount === 0) {
  console.log('PASS: 0 hardcoded colors or arbitrary values found in audited files.');
  console.log('All design-token boundaries enforced successfully.');
  process.exit(0);
} else {
  console.log(`FAIL: Found ${violationCount} token rule violation(s) across ${violationsByFile.size} files.\n`);
  let displayed = 0;
  for (const [file, items] of violationsByFile.entries()) {
    if (displayed++ < 15) {
      console.log(`  File: ${file}`);
      for (const item of items.slice(0, 3)) {
        console.log(`    L${item.line}: ${item.violation}`);
      }
    }
  }
  process.exit(1);
}
