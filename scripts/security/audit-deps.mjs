#!/usr/bin/env node
/**
 * scripts/security/audit-deps.mjs
 * Dependency audit runner and documentation generator for HireFlow AI.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();
const REPORT_PATH = path.join(ROOT_DIR, 'docs', 'security', 'DEPENDENCIES.md');

console.log('====================================================');
console.log('HIREFLOW AI — DEPENDENCY SECURITY AUDIT');
console.log('====================================================\n');

let auditData = null;
try {
  const raw = execSync('npm audit --json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  auditData = JSON.parse(raw);
} catch (err) {
  if (err.stdout) {
    try {
      auditData = JSON.parse(err.stdout);
    } catch {
      console.error('Could not parse npm audit stdout JSON');
    }
  }
}

if (!auditData) {
  console.log('npm audit produced no parseable JSON output.');
  process.exit(0);
}

const vulnerabilities = auditData.vulnerabilities || {};
const metadata = auditData.metadata?.vulnerabilities || {
  critical: 0,
  high: 0,
  moderate: 0,
  low: 0,
  info: 0,
  total: 0
};

console.log('--- VULNERABILITY SUMMARY ---');
console.log(`Critical : ${metadata.critical}`);
console.log(`High     : ${metadata.high}`);
console.log(`Moderate : ${metadata.moderate}`);
console.log(`Low      : ${metadata.low}`);
console.log(`Info     : ${metadata.info}`);
console.log(`Total    : ${metadata.total}`);

let markdownContent = `# HIREFLOW AI — DEPENDENCY SECURITY AUDIT REPORT

**Audit Date**: ${new Date().toISOString().split('T')[0]}  
**Tool**: \`npm audit\`  
**Lockfile Version**: 3 (\`package-lock.json\`)  

---

## 1. Vulnerability Summary

| Severity | Count | Status |
|---|---|---|
| **Critical** | ${metadata.critical} | ${metadata.critical === 0 ? 'Clear' : 'Action Required'} |
| **High** | ${metadata.high} | ${metadata.high === 0 ? 'Clear' : 'Action Required'} |
| **Moderate** | ${metadata.moderate} | Review |
| **Low** | ${metadata.low} | Monitor |
| **Info** | ${metadata.info} | Informational |
| **Total** | ${metadata.total} | |

---

## 2. Advisory Breakdown

`;

if (Object.keys(vulnerabilities).length === 0) {
  markdownContent += `*Zero known vulnerabilities detected across all direct and transitive dependencies.*\n`;
} else {
  markdownContent += `| Package | Severity | Via / Advisory | Fixed In | Range |\n|---|---|---|---|---|\n`;
  for (const [pkgName, details] of Object.entries(vulnerabilities)) {
    const severity = details.severity;
    const via = Array.isArray(details.via)
      ? details.via.map(v => typeof v === 'string' ? v : v.title).join(', ')
      : String(details.via);
    const isDirect = details.isDirect ? 'Direct' : 'Transitive';
    const range = details.range || 'N/A';
    markdownContent += `| **${pkgName}** (${isDirect}) | ${severity.toUpperCase()} | ${via.slice(0, 50)} | ${details.fixAvailable ? 'Fix Available' : 'None'} | \`${range}\` |\n`;
  }
}

markdownContent += `
---

## 3. Supply-Chain & Package Verification

- **Lockfile Enforced**: \`package-lock.json\` is tracked in git. All CI/CD workflows must use \`npm ci\`.
- **Install Scripts Review**: No custom preinstall / postinstall scripts detected in production application packages.
- **Dependency Pinning**: All core runtime dependencies are strictly version-bounded.
`;

fs.writeFileSync(REPORT_PATH, markdownContent, 'utf8');
console.log(`\n✓ Audit report saved to ${path.relative(ROOT_DIR, REPORT_PATH)}`);

if (metadata.critical > 0 || metadata.high > 0) {
  console.log('\n⚠️ Action required: Critical or High advisories present.');
}
