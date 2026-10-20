import { describe, it, expect } from 'vitest';
import { MRVI_WEIGHTS, calculateMrvi } from '../../../src/config/scoring';

describe('Market Requirement & Value Index (MRVI) Invariant Suite', () => {
  it('enforces that MRVI component weights sum exactly to 1.0', () => {
    const totalWeight =
      MRVI_WEIGHTS.marketDemandWeight +
      MRVI_WEIGHTS.recruiterScreeningImpact +
      MRVI_WEIGHTS.disqualificationRiskMitigation;
    expect(Number(totalWeight.toFixed(4))).toBe(1.0);
  });

  it('calculates perfect 100 MRVI when all component scores are 100', () => {
    const score = calculateMrvi({
      marketDemand: 100,
      recruiterImpact: 100,
      riskMitigation: 100,
    });
    expect(score).toBe(100);
  });

  it('calculates 0 MRVI when all component scores are 0', () => {
    const score = calculateMrvi({
      marketDemand: 0,
      recruiterImpact: 0,
      riskMitigation: 0,
    });
    expect(score).toBe(0);
  });

  it('correctly weighs components: 40% demand, 35% recruiter, 25% risk', () => {
    // 50 * 0.40 = 20
    // 80 * 0.35 = 28
    // 60 * 0.25 = 15
    // Sum = 63
    const score = calculateMrvi({
      marketDemand: 50,
      recruiterImpact: 80,
      riskMitigation: 60,
    });
    expect(score).toBe(63);
  });

  it('clamps output strictly within 0-100 range even with extreme values', () => {
    expect(calculateMrvi({ marketDemand: 150, recruiterImpact: 200, riskMitigation: 120 })).toBe(100);
    expect(calculateMrvi({ marketDemand: -50, recruiterImpact: -20, riskMitigation: -10 })).toBe(0);
  });

  it('produces the expected verified MRVI for Build Briefs (96)', () => {
    // Build Briefs: Market Demand 98 (0.40 = 39.2), Recruiter Impact 95 (0.35 = 33.25), Risk Mitigation 94 (0.25 = 23.5)
    // 39.2 + 33.25 + 23.5 = 95.95 -> 96
    const score = calculateMrvi({
      marketDemand: 98,
      recruiterImpact: 95,
      riskMitigation: 94,
    });
    expect(score).toBe(96);
  });
});
