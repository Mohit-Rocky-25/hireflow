// ============================================================
// Proof Test for `briefs:gate` Rejection & Recovery (Criterion J2)
// Demonstrates that `briefs:gate` reliably fails when defects are introduced
// ============================================================

import fs from 'fs';
import path from 'path';
import { runBriefsGate } from './gate';

const root = process.cwd();
const datasetPath = path.join(root, 'src/data/suite/project-briefs.json');

// Read the verified clean baseline
const cleanData = fs.readFileSync(datasetPath, 'utf8');

console.log('--- STARTING GATE NEGATIVE DEFECT INJECTION TESTS ---');

// Case A: Introduce unbracketed outcome in rubric (S1 lint error)
console.log('\n[TEST A] Injected S1 unbracketed outcome in rubric:');
const briefsA = JSON.parse(cleanData);
briefsA[0].verificationRubric[0] = 'Execute test runner without bracketed outcome';
fs.writeFileSync(datasetPath, JSON.stringify(briefsA, null, 2), 'utf8');
const resA = runBriefsGate();
if (resA.passed === false) {
  console.log('✅ TEST A PASSED: Gate rejected invalid rubric as expected.');
} else {
  console.error('❌ TEST A FAILED: Gate failed to reject invalid rubric.');
  fs.writeFileSync(datasetPath, cleanData, 'utf8');
  process.exit(1);
}

// Case B: Expire reviewBy currency date
console.log('\n[TEST B] Injected expired reviewBy date:');
const briefsB = JSON.parse(cleanData);
briefsB[0].reviewBy = '2023-01-01';
fs.writeFileSync(datasetPath, JSON.stringify(briefsB, null, 2), 'utf8');
const resB = runBriefsGate();
if (resB.passed === false) {
  console.log('✅ TEST B PASSED: Gate rejected expired reviewBy as expected.');
} else {
  console.error('❌ TEST B FAILED: Gate failed to reject expired currency.');
  fs.writeFileSync(datasetPath, cleanData, 'utf8');
  process.exit(1);
}

// Case C: Point rubric item at missing check (mismatch count)
console.log('\n[TEST C] Injected extra unmapped rubric item:');
const briefsC = JSON.parse(cleanData);
briefsC[0].verificationRubric.push('Extra unmapped check [Should fail]');
fs.writeFileSync(datasetPath, JSON.stringify(briefsC, null, 2), 'utf8');
const resC = runBriefsGate();
if (resC.passed === false) {
  console.log('✅ TEST C PASSED: Gate rejected unmapped kit check count as expected.');
} else {
  console.error('❌ TEST C FAILED: Gate failed to reject unmapped kit check.');
  fs.writeFileSync(datasetPath, cleanData, 'utf8');
  process.exit(1);
}

// Restore original dataset and confirm passing
console.log('\n[RESTORE] Reverting to clean verified dataset:');
fs.writeFileSync(datasetPath, cleanData, 'utf8');
const resClean = runBriefsGate();
if (resClean.passed === true) {
  console.log('✅ RESTORE VERIFIED: Clean catalog passes master gate 100%.');
} else {
  console.error('❌ RESTORE FAILED: Clean catalog did not pass.');
  process.exit(1);
}

console.log('\nCriterion J2 Demonstrably Proven: Gate rejects all 3 failure modes and passes on clean state.');
