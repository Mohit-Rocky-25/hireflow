// ============================================================
// Career Engine Unit Tests
// Tests same-company, cross-company, track-switching, and edge cases
// ============================================================

import { describe, it, expect } from 'vitest';
import { resolvePath, convertComp } from '../careerEngine';

describe('Career Engine Path Resolution & Deterministic Modeling', () => {
  it('resolves same-company multi-step path: Google L4 -> L6', () => {
    const plan = resolvePath(
      { companyId: 'google', levelCode: 'L4', track: 'SWE' },
      { companyId: 'google', levelCode: 'L6', track: 'SWE' },
      { performanceBracket: 'MEETS', yearsInCurrentLevel: 1.0, currency: 'USD' }
    );

    expect(plan.status).toBe('SUCCESS');
    expect(plan.steps.length).toBe(2);

    // Step 1: L4 -> L5
    expect(plan.steps[0].fromLevel.levelCode).toBe('L4');
    expect(plan.steps[0].toLevel.levelCode).toBe('L5');
    expect(plan.steps[0].isCompanySwitch).toBe(false);
    expect(plan.steps[0].stepType).toBe('INTERNAL_PROMO');

    // Step 2: L5 -> L6
    expect(plan.steps[1].fromLevel.levelCode).toBe('L5');
    expect(plan.steps[1].toLevel.levelCode).toBe('L6');

    // Total time and comp jump
    expect(plan.totalTime.likely).toBeGreaterThan(0);
    expect(plan.compJump.to).toBeGreaterThan(plan.compJump.from);
    expect(plan.compTimeline.length).toBeGreaterThan(1);
    expect(plan.probability.percentage).toBeGreaterThan(0);
  });

  it('resolves cross-company path: Amazon SDE II -> Meta E6', () => {
    const plan = resolvePath(
      { companyId: 'amazon', levelCode: 'L5', track: 'SWE' },
      { companyId: 'meta', levelCode: 'E6', track: 'SWE' },
      { performanceBracket: 'EXCEEDS', currency: 'USD' }
    );

    expect(plan.status).toBe('SUCCESS');
    expect(plan.steps.length).toBeGreaterThanOrEqual(2);

    // First step is company switch
    expect(plan.steps[0].isCompanySwitch).toBe(true);
    expect(plan.steps[0].fromLevel.companyId).toBe('amazon');
    expect(plan.steps[0].toLevel.companyId).toBe('meta');

    // Remaining steps at Meta
    const lastStep = plan.steps[plan.steps.length - 1];
    expect(lastStep.toLevel.levelCode).toBe('E6');
    expect(lastStep.toLevel.companyId).toBe('meta');
  });

  it('resolves India Tech transition: TCS System Engineer -> Flipkart SDE-3', () => {
    const plan = resolvePath(
      { companyId: 'tcs', levelCode: 'SE', track: 'SWE' },
      { companyId: 'flipkart', levelCode: 'SDE-3', track: 'SWE' },
      { currency: 'INR' }
    );

    expect(plan.status).toBe('SUCCESS');
    expect(plan.compJump.currency).toBe('INR');
    expect(plan.compJump.to).toBeGreaterThan(plan.compJump.from);
    expect(plan.steps[0].isCompanySwitch).toBe(true);

    const lastStep = plan.steps[plan.steps.length - 1];
    expect(lastStep.toLevel.companyId).toBe('flipkart');
    expect(lastStep.toLevel.levelCode).toBe('SDE-3');
  });

  it('handles SWE to EM track transition properly', () => {
    const plan = resolvePath(
      { companyId: 'google', levelCode: 'L5', track: 'SWE' },
      { companyId: 'google', levelCode: 'M1', track: 'EM' },
      { currency: 'USD' }
    );

    expect(plan.status).toBe('SUCCESS');
    expect(plan.steps.length).toBeGreaterThan(0);
    const lastStep = plan.steps[plan.steps.length - 1];
    expect(lastStep.stepType).toBe('TRACK_SWITCH');
    expect(lastStep.notes).toContain('Discipline Transition');
  });

  it('handles edge case: target level equals current level', () => {
    const plan = resolvePath(
      { companyId: 'google', levelCode: 'L5', track: 'SWE' },
      { companyId: 'google', levelCode: 'L5', track: 'SWE' }
    );

    expect(plan.status).toBe('SAME_LEVEL');
    expect(plan.steps.length).toBe(0);
    expect(plan.totalTime.likely).toBe(0);
    expect(plan.probability.percentage).toBe(100);
  });

  it('handles edge case: target level is junior to current level', () => {
    const plan = resolvePath(
      { companyId: 'google', levelCode: 'L6', track: 'SWE' },
      { companyId: 'google', levelCode: 'L4', track: 'SWE' }
    );

    expect(plan.status).toBe('TARGET_JUNIOR');
    expect(plan.steps.length).toBe(0);
    expect(plan.message).toContain('junior in scope');
  });

  it('throws a descriptive error when company or level is invalid', () => {
    expect(() => {
      resolvePath(
        { companyId: 'nonexistent', levelCode: 'XYZ' },
        { companyId: 'google', levelCode: 'L5' }
      );
    }).toThrowError(/Cannot resolve ladder node/);
  });

  it('correctly converts compensation between USD and INR', () => {
    const usd = 100000;
    const inr = convertComp(usd, 'USD', 'INR', 87.0);
    expect(inr).toBe(8700000);

    const backToUsd = convertComp(inr, 'INR', 'USD', 87.0);
    expect(backToUsd).toBe(100000);
  });
});
