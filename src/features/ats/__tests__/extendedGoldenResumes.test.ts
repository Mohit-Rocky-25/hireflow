// ============================================================
// Extended Golden Suite Benchmark (Stage 2.3)
// 20 New Cases covering ambiguous tokens, diverse engineering branches,
// hedged language, keyword-stuffing, and fresher candidates.
// Strict benchmarking: Precision >= 0.92, Recall >= 0.90, Runtime < 300ms.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '../engine';
import { NEW_GOLDEN_PAIRS } from './new-golden-pairs';

describe('Stage 2.3 — 20 Extended Golden Resumes Evaluation & Benchmark', () => {
  it('Evaluates all 20 extended golden test cases, asserting Precision >= 0.92, Recall >= 0.90, and Runtime < 300ms', () => {
    let totalTP = 0;
    let totalFP = 0;
    let totalFN = 0;
    const runtimes: number[] = [];

    // Warm-up pass to ensure cold module initialization does not skew benchmark
    runAtsEngine('Software Engineer proficient in Go and Kubernetes with Docker', 'Looking for Software Engineer with Go');

    for (const testCase of NEW_GOLDEN_PAIRS) {
      const startTime = performance.now();
      const response = runAtsEngine(testCase.resumeText, testCase.jdText);
      const elapsed = performance.now() - startTime;
      runtimes.push(elapsed);

      if (!response.success) {
        console.error(`FAILED ON EXTENDED TESTCASE ${testCase.id}: ${(response as any).message}`);
      }
      expect(response.success).toBe(true);
      if (!response.success) continue;

      const engineResult = response.result;
      const foundSkillIds = new Set(
        engineResult.skillResults
          .filter((s) => s.found)
          .map((s) => s.skillId.toLowerCase())
      );

      // Verify True Positives and False Negatives
      for (const expectedSkill of testCase.expectedPresent) {
        if (foundSkillIds.has(expectedSkill.toLowerCase())) {
          totalTP++;
        } else {
          totalFN++;
          console.log(`FN in ${testCase.id}: expected '${expectedSkill}', found:`, Array.from(foundSkillIds));
        }
      }

      // Verify False Positives
      for (const missingSkill of testCase.expectedMissing) {
        if (foundSkillIds.has(missingSkill.toLowerCase())) {
          totalFP++;
          console.log(`FP in ${testCase.id}: unexpected '${missingSkill}'`);
        }
      }

      expect(elapsed).toBeLessThan(300);
    }

    const precision = totalTP / Math.max(1, totalTP + totalFP);
    const recall = totalTP / Math.max(1, totalTP + totalFN);
    const avgRuntime = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
    const maxRuntime = Math.max(...runtimes);

    console.log(`\n============================================================`);
    console.log(`EXTENDED GOLDEN SUITE (20 TEST PAIRS):`);
    console.log(`True Positives (TP):  ${totalTP}`);
    console.log(`False Positives (FP): ${totalFP}`);
    console.log(`False Negatives (FN): ${totalFN}`);
    console.log(`Overall Precision:    ${(precision * 100).toFixed(2)}% (Target: >= 92.00%)`);
    console.log(`Overall Recall:       ${(recall * 100).toFixed(2)}% (Target: >= 90.00%)`);
    console.log(`Average Runtime:      ${avgRuntime.toFixed(2)}ms (Target: < 300ms)`);
    console.log(`Max Runtime:          ${maxRuntime.toFixed(2)}ms (Target: < 300ms)`);
    console.log(`============================================================\n`);

    expect(precision).toBeGreaterThanOrEqual(0.92);
    expect(recall).toBeGreaterThanOrEqual(0.90);
    expect(avgRuntime).toBeLessThan(300);
  });
});
