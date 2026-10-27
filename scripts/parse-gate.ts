// ============================================================
// HireFlow ATS Parser — Regression Quality Gate (Stage 6)
// Evaluates HOLDOUT resume fixtures & HOLDOUT JD fixtures
// Enforces zero crashes, >=90% F1/recall, latency limits,
// and zero-deviation determinism. Exits 1 if any gate fails.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { evalFixture, SingleEvalResult } from './parse-eval';
import { parseJD } from '../src/lib/ats/parseJD';
import { PARSE_GATE_THRESHOLDS } from '../src/config/thresholds';
import { JDFixtureTruth } from './parse-fixtures/types';

interface GateCheck {
  name: string;
  measured: number | string;
  threshold: number | string;
  passed: boolean;
  unit?: string;
  comparator?: '<=' | '>=' | '==';
}

async function runParseGate(): Promise<void> {
  console.log('====================================================');
  console.log('HIREFLOW ATS PARSING REGRESSION GATE (STAGE 6)');
  console.log('====================================================\n');

  const baseDir = path.resolve('tests/fixtures/parsing');
  const holdoutResumeDir = path.join(baseDir, 'holdout');
  const holdoutJdDir = path.join(baseDir, 'jd', 'holdout');

  // ----------------------------------------------------
  // Part 1: Resume Holdout Suite
  // ----------------------------------------------------
  console.log('[Gate: 1/2] Evaluating Resume HOLDOUT fixtures...');
  const resumeFiles = fs
    .readdirSync(holdoutResumeDir)
    .filter((f) => !f.endsWith('.truth.json'))
    .sort();

  const results: SingleEvalResult[] = [];
  for (const f of resumeFiles) {
    const ext = path.extname(f);
    const nameWithoutExt = path.basename(f, ext);
    const truthFile = path.join(holdoutResumeDir, `${nameWithoutExt}.truth.json`);
    const dataFile = path.join(holdoutResumeDir, f);
    if (fs.existsSync(truthFile)) {
      const res = await evalFixture(dataFile, truthFile, true);
      results.push(res);
    }
  }

  // Separate parseable text fixtures from image-only / corrupt fixtures
  const textResults = results.filter(
    (r) => r.family !== 'k_image_only' && r.family !== 'l_corrupt_encrypted'
  );
  const totalHoldout = results.length;
  const totalTextHoldout = textResults.length;

  console.log(`  -> Evaluated ${totalHoldout} holdout fixtures (${totalTextHoldout} text, ${totalHoldout - totalTextHoldout} scanned/corrupt).`);

  const sumText = (fn: (r: SingleEvalResult) => number) =>
    textResults.reduce((acc, r) => acc + fn(r), 0);
  const sumAll = (fn: (r: SingleEvalResult) => number) =>
    results.reduce((acc, r) => acc + fn(r), 0);

  const crashes = sumAll((r) => (r.crashed ? 1 : 0));
  const nameAccuracy = (sumText((r) => (r.nameMatch ? 1 : 0)) / totalTextHoldout) * 100;
  const emailAccuracy = (sumText((r) => (r.emailMatch ? 1 : 0)) / totalTextHoldout) * 100;
  const phoneAccuracy = (sumText((r) => (r.phoneMatch ? 1 : 0)) / totalTextHoldout) * 100;
  const sectionF1 = (sumText((r) => r.sectionF1) / totalTextHoldout) * 100;
  const bulletRecall = (sumText((r) => r.bulletRecall) / totalTextHoldout) * 100;
  const educationAccuracy = (sumText((r) => (r.educationMatch ? 1 : 0)) / totalTextHoldout) * 100;
  const warningRecall = (sumAll((r) => r.expectedWarningRecall) / totalHoldout) * 100;

  const latencies = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const p50Latency = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95Latency = latencies[Math.floor(latencies.length * 0.95)] || 0;

  // ----------------------------------------------------
  // Part 2: JD Holdout Suite
  // ----------------------------------------------------
  console.log('\n[Gate: 2/2] Evaluating Job Description HOLDOUT fixtures...');
  const jdTruthFiles = fs
    .readdirSync(holdoutJdDir)
    .filter((f) => f.endsWith('.truth.json'))
    .sort();

  let jdSeniorityMatches = 0;
  let totalMustTruth = 0;
  let matchedMust = 0;
  let jdDeterministicPass = true;

  for (const tf of jdTruthFiles) {
    const truth: JDFixtureTruth = JSON.parse(
      fs.readFileSync(path.join(holdoutJdDir, tf), 'utf-8')
    );
    const txtName = tf.replace('.truth.json', '.txt');
    const jdText = fs.readFileSync(path.join(holdoutJdDir, txtName), 'utf-8');

    const parsed1 = parseJD(jdText);
    const parsed2 = parseJD(jdText);

    // Determinism check
    if (JSON.stringify(parsed1) !== JSON.stringify(parsed2)) {
      jdDeterministicPass = false;
    }

    // Seniority check
    if (parsed1.seniority === truth.seniority) {
      jdSeniorityMatches++;
    }

    // Must-haves recall
    for (const must of truth.mustHaves) {
      totalMustTruth++;
      if (parsed1.mustHaves.includes(must)) {
        matchedMust++;
      }
    }
  }

  const jdSeniorityAccuracy = (jdSeniorityMatches / jdTruthFiles.length) * 100;
  const jdMustRecall = (matchedMust / Math.max(1, totalMustTruth)) * 100;

  console.log(`  -> Evaluated ${jdTruthFiles.length} JD holdout fixtures.`);

  // ----------------------------------------------------
  // Part 3: Evaluate All Gate Invariants
  // ----------------------------------------------------
  const checks: GateCheck[] = [
    {
      name: 'Unhandled Parser Crashes',
      measured: crashes,
      threshold: PARSE_GATE_THRESHOLDS.maxCrashes,
      passed: crashes <= PARSE_GATE_THRESHOLDS.maxCrashes,
      comparator: '==',
    },
    {
      name: 'Candidate Name Accuracy',
      measured: Number(nameAccuracy.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minNameAccuracy,
      passed: nameAccuracy >= PARSE_GATE_THRESHOLDS.minNameAccuracy,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'Email Extraction Accuracy',
      measured: Number(emailAccuracy.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minEmailAccuracy,
      passed: emailAccuracy >= PARSE_GATE_THRESHOLDS.minEmailAccuracy,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'Phone Extraction Accuracy',
      measured: Number(phoneAccuracy.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minPhoneAccuracy,
      passed: phoneAccuracy >= PARSE_GATE_THRESHOLDS.minPhoneAccuracy,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'Section Detection F1',
      measured: Number(sectionF1.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minSectionF1,
      passed: sectionF1 >= PARSE_GATE_THRESHOLDS.minSectionF1,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'Bullet Point Recall',
      measured: Number(bulletRecall.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minBulletRecall,
      passed: bulletRecall >= PARSE_GATE_THRESHOLDS.minBulletRecall,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'Education Extraction Accuracy',
      measured: Number(educationAccuracy.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minEducationAccuracy,
      passed: educationAccuracy >= PARSE_GATE_THRESHOLDS.minEducationAccuracy,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'Expected Warning Recall',
      measured: Number(warningRecall.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minWarningRecall,
      passed: warningRecall >= PARSE_GATE_THRESHOLDS.minWarningRecall,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'p50 Parsing Latency',
      measured: Number(p50Latency.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.maxP50LatencyMs,
      passed: p50Latency <= PARSE_GATE_THRESHOLDS.maxP50LatencyMs,
      unit: 'ms',
      comparator: '<=',
    },
    {
      name: 'p95 Parsing Latency',
      measured: Number(p95Latency.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.maxP95LatencyMs,
      passed: p95Latency <= PARSE_GATE_THRESHOLDS.maxP95LatencyMs,
      unit: 'ms',
      comparator: '<=',
    },
    {
      name: 'JD Seniority Accuracy',
      measured: Number(jdSeniorityAccuracy.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minJdSeniorityAccuracy,
      passed: jdSeniorityAccuracy >= PARSE_GATE_THRESHOLDS.minJdSeniorityAccuracy,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'JD Must-Haves Recall',
      measured: Number(jdMustRecall.toFixed(1)),
      threshold: PARSE_GATE_THRESHOLDS.minJdMustHavesRecall,
      passed: jdMustRecall >= PARSE_GATE_THRESHOLDS.minJdMustHavesRecall,
      unit: '%',
      comparator: '>=',
    },
    {
      name: 'JD Determinism (Pure Reproducibility)',
      measured: jdDeterministicPass ? '100% Deterministic' : 'Non-deterministic',
      threshold: '100% Deterministic',
      passed: jdDeterministicPass,
    },
  ];

  console.log('\n====================================================');
  console.log('GATE VERIFICATION SUMMARY');
  console.log('====================================================');
  console.log(
    'Metric'.padEnd(36) +
      'Measured'.padEnd(16) +
      'Gate Target'.padEnd(16) +
      'Status'
  );
  console.log('-'.repeat(76));

  let allPassed = true;
  for (const c of checks) {
    const unitStr = c.unit || '';
    const mStr = `${c.measured}${unitStr}`;
    const cmpStr = c.comparator ? `${c.comparator} ` : '';
    const tStr = `${cmpStr}${c.threshold}${unitStr}`.trim();
    const statusStr = c.passed ? '✅ PASS' : '❌ FAIL';
    if (!c.passed) allPassed = false;

    console.log(
      c.name.padEnd(36) +
        mStr.padEnd(16) +
        tStr.padEnd(16) +
        statusStr
    );
  }
  console.log('-'.repeat(76));

  if (!allPassed) {
    console.error('\n❌ [PARSE GATE FAILED] One or more quality thresholds were breached.');
    process.exit(1);
  }

  console.log('\n🎉 [PARSE GATE PASSED] All 13 quality and performance regression checks satisfied!\n');
  process.exit(0);
}

runParseGate().catch((err) => {
  console.error('[PARSE GATE ERROR] Fatal execution failure:', err);
  process.exit(1);
});
