import fs from 'fs';
import path from 'path';

// Files / directories exempted from strict CSS token audits
const EXEMPT_PATHS = [
  'src/styles/tokens.css',
  'src/styles/tokens.ts',
  'src/__tests__',
  'src/data',
  'src/careers-core/legacy',
];

function shouldCheckFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  for (const ex of EXEMPT_PATHS) {
    if (norm.includes(ex)) return false;
  }
  return norm.endsWith('.tsx') || norm.endsWith('.ts') || norm.endsWith('.css') || norm.endsWith('.html');
}

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.git') && !full.includes('dist')) {
        results = results.concat(walk(full));
      }
    } else if (shouldCheckFile(full)) {
      results.push(full);
    }
  }
  return results;
}

const files = walk('src');
if (fs.existsSync('index.html')) files.push('index.html');

const violations = [];

const PATTERNS = {
  externalFont: /(https?:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.[a-z0-9.-]+\/))/i,
  tailwindDefaultPalette: /\b(bg|text|border|ring|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+\b/,
  gradient: /\b(bg-gradient-|linear-gradient\(|gradient-to-)/,
  lightBackground: /\b(bg-white|bg-gray-50|bg-gray-100|bg-slate-50|bg-slate-100|bg-\[#fff\w*\]|bg-\[#f9f\w*\])\b/,
};

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

    if (PATTERNS.externalFont.test(line)) {
      violations.push({ file: f, line: idx + 1, rule: 'No external font/CDN URL', match: line.trim() });
    }
    if (PATTERNS.tailwindDefaultPalette.test(line)) {
      violations.push({ file: f, line: idx + 1, rule: 'Tailwind default palette class forbidden', match: line.trim() });
    }
    if (PATTERNS.gradient.test(line)) {
      violations.push({ file: f, line: idx + 1, rule: 'Gradients forbidden', match: line.trim() });
    }
    if (PATTERNS.lightBackground.test(line)) {
      violations.push({ file: f, line: idx + 1, rule: 'Light background forbidden', match: line.trim() });
    }
  });
}

console.log('='.repeat(60));
console.log('HIREFLOW DESIGN SYSTEM v2 AUDIT GUARD (check:design)');
console.log('='.repeat(60));
console.log(`Audited ${files.length} source files.`);

if (violations.length > 0) {
  console.log(`\nFound ${violations.length} design rule violations.`);
  violations.slice(0, 30).forEach(v => {
    console.log(`  ✗ [${v.rule}] ${v.file}:${v.line} -> ${v.match.slice(0, 80)}`);
  });
  if (violations.length > 30) {
    console.log(`  ... and ${violations.length - 30} more violations.`);
  }
  // Exit with failure code
  process.exit(1);
} else {
  console.log('\n✓ Zero design violations found! Perfect compliance with DESIGN.md.');
  process.exit(0);
}
