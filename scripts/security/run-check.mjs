#!/usr/bin/env node
/**
 * scripts/security/run-check.mjs
 * Comprehensive security runner for HireFlow AI.
 * Orchestrates secrets scanner, bundle scanner, dependency audit, and red-team tests.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

console.log('================================================================');
console.log('HIREFLOW AI — FULL SECURITY CHECK SUITE');
console.log('================================================================\n');

let failedStages = [];

function runStep(name, cmd) {
  console.log(`\n>>> STEP: ${name} [${cmd}]`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✓ ${name} passed.`);
  } catch (err) {
    console.error(`✗ ${name} FAILED with exit code ${err.status || 1}`);
    failedStages.push(name);
  }
}

// 1. Secrets Scan on Working Tree
runStep('Working Tree Secret Scan', 'node scripts/security/scan-secrets.mjs');

// 2. Production Bundle Security Scan
runStep('Production Bundle Security Scan', 'node scripts/security/scan-bundle.mjs');

// 3. Dependency Security Audit
runStep('Dependency Security Audit', 'node scripts/security/audit-deps.mjs');

// 4. Security & Red-Team Test Suites
const secTestsDir = path.join(process.cwd(), 'src', '__tests__', 'security');
if (fs.existsSync(secTestsDir)) {
  runStep('Adversarial & Security Test Suites', 'npx vitest run src/__tests__/security/');
}

console.log('\n================================================================');
if (failedStages.length === 0) {
  console.log('✓ ALL SECURITY CHECKS PASSED. SYSTEM IS HARDENED.');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error(`✗ SECURITY CHECK FAILED ON: ${failedStages.join(', ')}`);
  console.log('================================================================\n');
  process.exit(1);
}
