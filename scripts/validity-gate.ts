// ============================================================
// HireFlow v4 — Final Validity & Reliability Gate
// Executes all validity verifications: Metamorphic, Adversarial,
// Calibration, Rating Sheet Agreement, Monte Carlo Sensitivity,
// Provenance Linting, Claims Integrity, and Zero Egress.
// ============================================================

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateRatingSheet } from './scoring-rating-sheet';
import { runSensitivityAnalysis } from './scoring-sensitivity';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface GateResult {
  step: string;
  passed: boolean;
  details: string;
}

const results: GateResult[] = [];

function runStep(name: string, fn: () => void) {
  process.stdout.write(`⏳ [Validity Gate] ${name}... `);
  try {
    fn();
    process.stdout.write(`✅ PASS\n`);
    results.push({ step: name, passed: true, details: 'OK' });
  } catch (err: any) {
    process.stdout.write(`❌ FAIL\n`);
    const msg = err?.message || String(err);
    console.error(`\nError in ${name}:\n`, msg);
    results.push({ step: name, passed: false, details: msg });
  }
}

function runCmd(cmd: string) {
  execSync(cmd, { cwd: rootDir, stdio: 'pipe' });
}

console.log('====================================================');
console.log('HIREFLOW ATS ENGINE — VALIDITY & RELIABILITY GATE');
console.log('====================================================\n');

// 1. Metamorphic Invariants Test Suite
runStep('1/9 Metamorphic Test Suite (11 Invariants)', () => {
  runCmd('npx vitest run tests/scoring/metamorphic.test.ts tests/scoring/propertyPurity.test.ts');
});

// 2. Adversarial Robustness Test Suite
runStep('2/9 Adversarial Robustness Suite (11 Attack Scenarios)', () => {
  runCmd('npx vitest run tests/scoring/adversarial.test.ts');
});

// 3. Calibration Harness Regression
runStep('3/9 Calibration Regression Suite', () => {
  runCmd('npx vitest run tests/calibration/calibration.test.ts');
});

// 4. Rating Sheet Inter-Rater Reliability
runStep('4/9 Rating Sheet Agreement (Pairwise >= 80%, Spearman >= 0.70, Kappa >= 0.60)', () => {
  const sheet = generateRatingSheet();
  if (sheet.pairwiseAgreement < 80) {
    throw new Error(`Pairwise concordance ${sheet.pairwiseAgreement}% < required 80%`);
  }
  if (sheet.spearmanRho < 0.70) {
    throw new Error(`Spearman rank correlation ${sheet.spearmanRho} < required 0.70`);
  }
  if (sheet.weightedKappa < 0.60) {
    throw new Error(`Cohen's weighted kappa ${sheet.weightedKappa} < required 0.60`);
  }
});

// 5. Monte Carlo Sensitivity Stability
runStep('5/9 Monte Carlo Sensitivity Analysis (500 Trials)', () => {
  runSensitivityAnalysis();
});

// 6. Zero Hardcoded Scoring Constants (Rule A1)
runStep('6/9 Scoring Constant Provenance Lint', () => {
  runCmd('node scripts/check-constants.mjs');
});

// 7. Banned Claims & Honest Measurement Lint
runStep('7/9 Claims & Honest Framing Lint', () => {
  runCmd('npx tsx scripts/check-claims.ts');
});

// 8. Zero UI Arithmetic Lint
runStep('8/9 Zero UI Arithmetic Lint', () => {
  runCmd('node scripts/pathways/check-ui-math.mjs');
});

// 9. Zero-Egress Privacy Audit
runStep('9/9 Privacy & Zero-Egress Static Scan', () => {
  runCmd('npx tsx scripts/check-privacy.ts');
});

console.log('\n====================================================');
console.log('VALIDITY GATE SUMMARY');
console.log('====================================================');

const allPassed = results.every((r) => r.passed);
for (const r of results) {
  console.log(`[${r.passed ? 'PASS' : 'FAIL'}] ${r.step}`);
}

if (!allPassed) {
  console.error('\n❌ Validity Gate FAILED. One or more quality criteria were not met.');
  process.exit(1);
} else {
  console.log('\n🎉 ALL 9 VALIDITY & RELIABILITY GATES PASSED! Scoring engine is mathematically sound.');
  process.exit(0);
}
