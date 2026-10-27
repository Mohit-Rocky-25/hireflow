// ============================================================
// HireFlow Skills Regression Gate (Stage 6)
// Enforces hard quality gates on skill extraction & matching:
// - Extraction F1 >= 92% on DEV & HOLDOUT
// - Traps False Positive Rate <= 2%
// - Traps False Negative Rate <= 5%
// - Priority Classification Accuracy >= 90%
// - Implication Graph DAG Audit: 0 errors
// ============================================================

import * as path from 'path';
import { fileURLToPath } from 'url';
import { auditGraph } from './graph-audit';
import { runSkillEval } from './skill-eval';

const __filename = fileURLToPath(import.meta.url);

export function runSkillsGate(): boolean {
  console.log('========================================================');
  console.log('HIREFLOW ATS ENGINE — SKILL MATCHING REGRESSION GATE');
  console.log('========================================================\n');

  let passed = true;

  // 1. Implication Graph Invariants
  console.log('[1/2] Auditing Implication Graph DAG invariants...');
  const graphResult = auditGraph();
  if (!graphResult.passed) {
    console.error('❌ Implication Graph Audit FAILED:\n' + graphResult.errors.join('\n'));
    passed = false;
  } else {
    console.log(`✅ Implication Graph: PASSED (${graphResult.stats.totalEdges} edges, 0 cycles, strict DAG).`);
  }

  // 2. Comprehensive Skill Evaluation on DEV and HOLDOUT
  console.log('\n[2/2] Running Benchmark Evaluation across DEV (210) & HOLDOUT (130)...');
  const t0 = performance.now();
  const report = runSkillEval();
  const totalDuration = performance.now() - t0;
  const avgLatency = totalDuration / (report.counts.dev + report.counts.holdout);

  const { dev, holdout } = report;

  console.log('\n--- DEV DATASET RESULTS ---');
  console.log(`Cases: ${dev.count} | Traps: ${dev.trapsCount}`);
  console.log(`Extraction F1: ${dev.extractionF1}% (Target >= 92.0%)`);
  console.log(`Priority Accuracy: ${dev.priorityAccuracy}% (Target >= 90.0%)`);
  console.log(`Traps FPR: ${dev.trapsFPR}% (Target <= 2.0%)`);
  console.log(`Traps FNR: ${dev.trapsFNR}% (Target <= 5.0%)`);

  if (dev.extractionF1 < 92.0) {
    console.error(`❌ DEV F1 ${dev.extractionF1}% below 92.0% threshold`);
    passed = false;
  }
  if (dev.priorityAccuracy < 90.0) {
    console.error(`❌ DEV Priority Accuracy ${dev.priorityAccuracy}% below 90.0% threshold`);
    passed = false;
  }
  if (dev.trapsFPR > 2.0) {
    console.error(`❌ DEV Traps FPR ${dev.trapsFPR}% exceeds 2.0% threshold`);
    passed = false;
  }
  if (dev.trapsFNR > 5.0) {
    console.error(`❌ DEV Traps FNR ${dev.trapsFNR}% exceeds 5.0% threshold`);
    passed = false;
  }

  console.log('\n--- HOLDOUT DATASET RESULTS ---');
  console.log(`Cases: ${holdout.count} | Traps: ${holdout.trapsCount}`);
  console.log(`Extraction F1: ${holdout.extractionF1}% (Target >= 92.0%)`);
  console.log(`Priority Accuracy: ${holdout.priorityAccuracy}% (Target >= 90.0%)`);
  console.log(`Traps FPR: ${holdout.trapsFPR}% (Target <= 2.0%)`);
  console.log(`Traps FNR: ${holdout.trapsFNR}% (Target <= 5.0%)`);

  if (holdout.extractionF1 < 92.0) {
    console.error(`❌ HOLDOUT F1 ${holdout.extractionF1}% below 92.0% threshold`);
    passed = false;
  }
  if (holdout.priorityAccuracy < 90.0) {
    console.error(`❌ HOLDOUT Priority Accuracy ${holdout.priorityAccuracy}% below 90.0% threshold`);
    passed = false;
  }
  if (holdout.trapsFPR > 2.0) {
    console.error(`❌ HOLDOUT Traps FPR ${holdout.trapsFPR}% exceeds 2.0% threshold`);
    passed = false;
  }
  if (holdout.trapsFNR > 5.0) {
    console.error(`❌ HOLDOUT Traps FNR ${holdout.trapsFNR}% exceeds 5.0% threshold`);
    passed = false;
  }

  console.log(`\nAverage Latency per test case: ${avgLatency.toFixed(2)}ms (Target < 100ms)`);
  if (avgLatency > 100) {
    console.error(`❌ Avg Latency ${avgLatency.toFixed(2)}ms exceeds 100ms budget`);
    passed = false;
  }

  console.log('\n========================================================');
  if (passed) {
    console.log('✅ ALL SKILL MATCHING REGRESSION GATES PASSED (100% compliant)');
  } else {
    console.error('❌ ONE OR MORE REGRESSION GATES FAILED');
  }
  console.log('========================================================');

  return passed;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  const ok = runSkillsGate();
  process.exit(ok ? 0 : 1);
}
