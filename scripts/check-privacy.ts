import * as fs from 'fs';
import * as path from 'path';

interface AllowlistEntry {
  pattern: string;
  file?: string;
  reason: string;
}

interface AllowlistConfig {
  entries: AllowlistEntry[];
}

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');
const allowlistPath = path.join(rootDir, 'config', 'privacy-allowlist.json');

let allowlist: AllowlistEntry[] = [];
if (fs.existsSync(allowlistPath)) {
  const raw = fs.readFileSync(allowlistPath, 'utf8');
  const parsed = JSON.parse(raw) as AllowlistConfig;
  allowlist = parsed.entries || [];
}

const FORBIDDEN_RULES = [
  { name: 'fetch', regex: /\bfetch\s*\(/g },
  { name: 'XMLHttpRequest', regex: /\bnew\s+XMLHttpRequest\s*\(/g },
  { name: 'sendBeacon', regex: /\bnavigator\.sendBeacon\s*\(/g },
  { name: 'WebSocket', regex: /\bnew\s+WebSocket\s*\(/g },
  { name: 'RemoteDynamicImport', regex: /import\s*\(\s*['"]https?:\/\//g },
];

interface Finding {
  file: string;
  line: number;
  rule: string;
  match: string;
  context: string;
}

const findings: Finding[] = [];

function scanFile(filePath: string) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  // Skip tests
  if (relPath.includes('__tests__') || relPath.endsWith('.test.ts') || relPath.endsWith('.test.tsx')) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
      continue;
    }

    for (const rule of FORBIDDEN_RULES) {
      // Reset regex index
      rule.regex.lastIndex = 0;
      if (rule.regex.test(line)) {
        const isAllowlisted = allowlist.some((entry) => {
          const fileMatch = !entry.file || relPath.includes(entry.file);
          const patternMatch = new RegExp(entry.pattern).test(line);
          return fileMatch && patternMatch;
        });

        if (!isAllowlisted) {
          findings.push({
            file: relPath,
            line: i + 1,
            rule: rule.name,
            match: line.trim(),
            context: line.trim(),
          });
        }
      }
    }
  }
}

function walkDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        walkDir(fullPath);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

console.log('====================================================');
console.log('HIREFLOW — PRIVACY & ZERO-EGRESS STATIC SCANNER (R8.2)');
console.log('====================================================');
console.log(`Scanning: ${srcDir}`);

walkDir(srcDir);

if (findings.length > 0) {
  console.error(`\n❌ Privacy scan failed: Found ${findings.length} unauthorized network egress call(s):`);
  findings.forEach((f, idx) => {
    console.error(`\n${idx + 1}. [${f.rule}] in ${f.file}:${f.line}`);
    console.error(`   Code: ${f.context}`);
  });
  console.error('\nEvery remote network call must be audited and listed in config/privacy-allowlist.json with explicit justification.');
  process.exit(1);
} else {
  console.log('\n✅ Privacy scan passed: Zero unauthorized network or telemetry egress calls found in src/.');
  process.exit(0);
}
