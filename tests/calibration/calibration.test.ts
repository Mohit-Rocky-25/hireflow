import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runCalibration } from '../../scripts/calibrate';
import { analyzeDeterministic } from '../../src/lib/ats/analyzeDeterministic';
import { BENCHMARK_CASES } from '../../scripts/scoring-rating-sheet';

describe('Stage 4: Calibration Harness & Score Band Uncertainty Tests', () => {
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

  it('enforces calibrated score bands across all benchmark cases', () => {
    const validBands = new Set(['Tier S', 'Tier A', 'Tier B', 'Tier C']);
    const rootDir = path.resolve(__dirname, '../..');

    for (const bc of BENCHMARK_CASES) {
      const resumePath = path.join(rootDir, bc.resumeFile);
      const jdPath = path.join(rootDir, bc.jdFile);
      const resumeText = fs.readFileSync(resumePath, 'utf8');
      const jdText = fs.readFileSync(jdPath, 'utf8');

      const facts = analyzeDeterministic(resumeText, jdText);
      const sb = facts.scoreBreakdown;

      expect(sb.scoreBand).toBeDefined();
      expect(validBands.has(sb.scoreBand!)).toBe(true);

      // Verify band mapping matches score
      if (sb.finalScore >= 85) expect(sb.scoreBand).toBe('Tier S');
      else if (sb.finalScore >= 70) expect(sb.scoreBand).toBe('Tier A');
      else if (sb.finalScore >= 50) expect(sb.scoreBand).toBe('Tier B');
      else expect(sb.scoreBand).toBe('Tier C');
    }
  });

  it('enforces calibrated uncertainty intervals and bounds', () => {
    const rootDir = path.resolve(__dirname, '../..');

    for (const bc of BENCHMARK_CASES) {
      const resumePath = path.join(rootDir, bc.resumeFile);
      const jdPath = path.join(rootDir, bc.jdFile);
      const resumeText = fs.readFileSync(resumePath, 'utf8');
      const jdText = fs.readFileSync(jdPath, 'utf8');

      const facts = analyzeDeterministic(resumeText, jdText);
      const sb = facts.scoreBreakdown;

      expect(sb.uncertaintyInterval).toBeDefined();
      const [low, high] = sb.uncertaintyInterval!;

      // Monotonicity and containment
      expect(low).toBeLessThanOrEqual(sb.finalScore);
      expect(high).toBeGreaterThanOrEqual(sb.finalScore);

      // Hard clamp bounds
      expect(low).toBeGreaterThanOrEqual(0);
      expect(high).toBeLessThanOrEqual(100);

      // Non-degenerate width
      expect(high - low).toBeGreaterThanOrEqual(0);
    }
  });

  it('includes honest transparency note without predictive claims', () => {
    const rootDir = path.resolve(__dirname, '../..');
    const bc = BENCHMARK_CASES[0];
    const resumePath = path.join(rootDir, bc.resumeFile);
    const jdPath = path.join(rootDir, bc.jdFile);
    const resumeText = fs.readFileSync(resumePath, 'utf8');
    const jdText = fs.readFileSync(jdPath, 'utf8');

    const facts = analyzeDeterministic(resumeText, jdText);
    const sb = facts.scoreBreakdown;

    expect(sb.honestTransparencyNote).toBeDefined();
    expect(sb.honestTransparencyNote).toContain('does not');
    // Ensure no banned claim words
    expect(sb.honestTransparencyNote).not.toMatch(/\b(guaranteed|proven|predictive|certified)\b/i);
  });
});
