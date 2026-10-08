#!/usr/bin/env node
/**
 * scripts/security/scan-bundle.mjs
 * Inspects production build bundle in `dist/` for:
 * 1. Source maps (.map files) leaking proprietary source code.
 * 2. Embedded environment secrets / credentials.
 * 3. Stray sensitive files (.git, .env, .bak, private keys).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('====================================================');
console.log('HIREFLOW AI — PRODUCTION BUNDLE SECURITY SCANNER');
console.log('====================================================\n');

if (!fs.existsSync(DIST_DIR)) {
  console.log('dist/ directory not found. Running npm run build first...');
  execSync('npm run build', { stdio: 'inherit' });
}

let violations = [];

// 1. Check for source maps (.map files)
function walkDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkDir(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const distFiles = walkDir(DIST_DIR);
console.log(`Inspecting ${distFiles.length} files in dist/...`);

const mapFiles = distFiles.filter(f => f.endsWith('.map'));
if (mapFiles.length > 0) {
  violations.push({
    severity: 'High',
    issue: 'Production source maps (.map) detected in bundle',
    details: mapFiles.map(f => path.relative(DIST_DIR, f)).join(', '),
  });
}

// 2. Check for stray sensitive files
const strayPatterns = [/\.env/, /\.pem$/, /\.key$/, /\.bak$/, /\.orig$/, /credentials/i];
for (const file of distFiles) {
  const base = path.basename(file);
  for (const p of strayPatterns) {
    if (p.test(base)) {
      violations.push({
        severity: 'Critical',
        issue: 'Stray sensitive file detected in dist/',
        details: path.relative(DIST_DIR, file),
      });
    }
  }
}

// 3. Run secret scanner on dist
console.log('\nRunning secret detector over dist/ files...');
try {
  execSync('node scripts/security/scan-secrets.mjs --dist', { stdio: 'inherit' });
} catch {
  violations.push({
    severity: 'Critical',
    issue: 'Secret scanner found unmasked secrets or credentials in dist/ bundle',
  });
}

console.log('\n--- BUNDLE AUDIT RESULTS ---');
if (violations.length === 0) {
  console.log('✓ Production bundle is clean. No source maps, stray files, or secrets detected.');
  process.exit(0);
} else {
  console.log(`⚠️ ${violations.length} bundle security violation(s) found:`);
  for (const v of violations) {
    console.log(`  [${v.severity}] ${v.issue} -> ${v.details || ''}`);
  }
  process.exit(1);
}
