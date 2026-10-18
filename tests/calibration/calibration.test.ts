import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runCalibration } from '../../scripts/calibrate';

describe('R5.8: Calibration Harness Regression Tests', () => {
  it('runs calibration on 6 synthetic cases with pairwise agreement >= 80%', () => {
    const report = runCalibration();

    expect(report.caseCount).toBe(6);
    expect(report.isSyntheticOnly).toBe(true);

    // Assert regression threshold against snapshot
    expect(report.pairwiseAgreement).toBeGreaterThanOrEqual(80);
    expect(report.spearmanCorrelation).toBeGreaterThanOrEqual(0.70);

    // Verify written report disclaimer
    const reportMdPath = path.resolve(__dirname, '../../docs/calibration-report.md');
    expect(fs.existsSync(reportMdPath)).toBe(true);

    const reportContent = fs.readFileSync(reportMdPath, 'utf8');
    expect(reportContent).toContain('NOT ground truth');
    expect(reportContent).toContain('Synthetic Benchmark Set (6 cases)');
    expect(reportContent).toContain('Pairwise Ranking Agreement');
  });
});
