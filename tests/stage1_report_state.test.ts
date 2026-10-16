// ============================================================
// Stage 1 Invariant Tests — Single Source of Truth & Consistency
// Verifies C5, C6 (structure), C7, and C12 guarantees
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getVerdictBand,
  getStatusCounts,
  getSkillStatusLabel,
  assertReportConsistency,
  ConsistencyError,
  buildReportState,
  ReportState,
} from '../src/features/ats/engine/reportState';
import { runAtsEngine } from '../src/features/ats/engine';
import { TEST_CORPUS } from './corpus';

describe('Stage 1 — ReportState Single Source of Truth & Invariant Assertions', () => {
  it('getVerdictBand correctly maps score ranges from config thresholds', () => {
    expect(getVerdictBand(100)).toBe('Strong');
    expect(getVerdictBand(80)).toBe('Strong');
    expect(getVerdictBand(79)).toBe('Competitive');
    expect(getVerdictBand(65)).toBe('Competitive');
    expect(getVerdictBand(64)).toBe('Needs work');
    expect(getVerdictBand(45)).toBe('Needs work');
    expect(getVerdictBand(44)).toBe('Weak match');
    expect(getVerdictBand(0)).toBe('Weak match');
  });

  it('getSkillStatusLabel returns deterministic labels for all statuses and proficiencies', () => {
    expect(getSkillStatusLabel('strong')).toBe('Strongly Supported');
    expect(getSkillStatusLabel('verified', 4)).toBe('Strongly Supported');
    expect(getSkillStatusLabel('verified', 2)).toBe('Verified in Experience');
    expect(getSkillStatusLabel('claimed')).toBe('Claimed Only (List)');
    expect(getSkillStatusLabel('missing')).toBe('Missing / Not Detected');
  });

  it('assertReportConsistency throws descriptive errors when invariants are violated in dev', () => {
    const validResult = runAtsEngine(TEST_CORPUS[0].resumeText, TEST_CORPUS[0].jdText).result;
    expect(validResult.reportState).toBeDefined();

    const baseState: ReportState = JSON.parse(JSON.stringify(validResult.reportState!));

    // Test C5 violation: tampered verdict band
    const tamperedBand: ReportState = {
      ...baseState,
      verdict: { ...baseState.verdict, band: 'Strong' },
      scoreLedger: { ...baseState.scoreLedger, roundedScore: 30 },
    };
    expect(() => assertReportConsistency(tamperedBand)).toThrow(ConsistencyError);
    expect(() => assertReportConsistency(tamperedBand)).toThrow(/C5 Violation/);

    // Test C7 violation: ledger math discrepancy
    const tamperedLedger: ReportState = {
      ...baseState,
      scoreLedger: {
        ...baseState.scoreLedger,
        totalEarned: 50,
        roundedScore: 85, // Does not equal round(50)!
      },
      verdict: { ...baseState.verdict, band: getVerdictBand(85) },
    };
    expect(() => assertReportConsistency(tamperedLedger)).toThrow(/C7 Violation/);

    // Test C6 violation: fix with zero gain
    const tamperedFixes: ReportState = {
      ...baseState,
      fixes: [{ id: 'fix_0', title: 'Zero Gain Fix', reason: 'Test', gain: 0, effort: 'small_addition', type: 'missing_must_have' }],
    };
    expect(() => assertReportConsistency(tamperedFixes)).toThrow(/C6 Violation/);

    // Test C12 violation: more rewrites than underperforming bullets
    const tamperedBullets: ReportState = {
      ...baseState,
      bullets: [
        { id: 'b1', originalText: 'Bullet 1', section: 'exp', score: 85, isUnderperforming: false, hasVerb: true, hasMetric: true, hasTech: true, issues: [], suggestedRewrite: 'Rewrite 1' },
      ],
    };
    expect(() => assertReportConsistency(tamperedBullets)).toThrow(/C12 Violation/);
  });

  it('logs to meta.warnings instead of throwing in production mode (P7 Honest Degradation)', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const validResult = runAtsEngine(TEST_CORPUS[0].resumeText, TEST_CORPUS[0].jdText).result;
      const baseState: ReportState = JSON.parse(JSON.stringify(validResult.reportState!));

      // Introduce C5 violation
      baseState.verdict.band = 'Strong';
      baseState.scoreLedger.roundedScore = 20;

      const res = assertReportConsistency(baseState);
      expect(res.valid).toBe(false);
      expect(baseState.meta.warnings.length).toBeGreaterThan(0);
      expect(baseState.meta.warnings.some((w) => w.includes('C5 Violation'))).toBe(true);
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  it('guarantees every pair in the 14-pair test corpus produces a valid, consistent ReportState', () => {
    for (const pair of TEST_CORPUS) {
      const result = runAtsEngine(pair.resumeText, pair.jdText).result;
      expect(result.reportState, `ReportState exists for ${pair.id}`).toBeDefined();

      const consistency = assertReportConsistency(result.reportState!);
      expect(consistency.valid, `ReportState consistent for ${pair.id}: ${consistency.errors.join(', ')}`).toBe(true);
      expect(consistency.errors).toHaveLength(0);

      // Verify counts agreement
      const counts = getStatusCounts(result.reportState!);
      expect(counts.totalBulletsCount).toBe(result.reportState!.bullets.length);
      expect(counts.fixesCount).toBe(result.reportState!.fixes.length);
      expect(counts.totalRequirements).toBe(result.reportState!.requirements.length);
    }
  });
});
