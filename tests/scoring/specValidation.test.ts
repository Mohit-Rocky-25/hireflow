import { describe, it, expect } from 'vitest';
import {
  CANONICAL_SCORING_SPEC,
  validateScoringSpec,
  assertValidScoringSpec,
  ScoringSpec,
} from '../../src/scoring/spec';

describe('Scoring Specification Validator (Task 1.1)', () => {
  it('validates that CANONICAL_SCORING_SPEC passes with zero errors', () => {
    const result = validateScoringSpec(CANONICAL_SCORING_SPEC);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(() => assertValidScoringSpec(CANONICAL_SCORING_SPEC)).not.toThrow();
  });

  it('fails validation when a profile weights sum does not equal 100', () => {
    const badSpec: ScoringSpec = JSON.parse(JSON.stringify(CANONICAL_SCORING_SPEC));
    badSpec.profiles[0].weights.requirement_coverage = 50; // sums to 110
    const result = validateScoringSpec(badSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('expected exactly 100'))).toBe(true);
  });

  it('fails validation when an unknown pillar id is referenced in a profile', () => {
    const badSpec: ScoringSpec = JSON.parse(JSON.stringify(CANONICAL_SCORING_SPEC));
    // @ts-expect-error test invalid pillar ID
    badSpec.profiles[0].weights['unknown_pillar'] = 10;
    const result = validateScoringSpec(badSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('unknown pillar ID'))).toBe(true);
  });

  it('fails validation when an applicability rule lacks a description', () => {
    const badSpec: ScoringSpec = JSON.parse(JSON.stringify(CANONICAL_SCORING_SPEC));
    badSpec.applicabilityRules[0].description = '';
    const result = validateScoringSpec(badSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('lacks a human-readable description'))).toBe(true);
  });

  it('fails validation when an evidence table value is outside [0, 1] or [0, 100]', () => {
    const badSpec: ScoringSpec = JSON.parse(JSON.stringify(CANONICAL_SCORING_SPEC));
    badSpec.evidenceTables.contextWeight.experience = 1.5; // must be <= 1.0
    const result = validateScoringSpec(badSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('outside [0, 1]'))).toBe(true);
  });

  it('fails validation when bullet scoring category maxes do not sum to 100', () => {
    const badSpec: ScoringSpec = JSON.parse(JSON.stringify(CANONICAL_SCORING_SPEC));
    badSpec.evidenceTables.bulletScoring.actionVerbMax = 30; // total 110
    const result = validateScoringSpec(badSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('bulletScoring category maxes sum to'))).toBe(true);
  });
});
