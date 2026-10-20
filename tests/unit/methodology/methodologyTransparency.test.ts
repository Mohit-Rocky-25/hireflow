// ============================================================
// HIREFLOW PHASE 4: METHODOLOGY TRANSPARENCY & VERIFICATION TESTS
// Unit tests asserting that published scoring weights, indexes,
// and Truth Gate invariants are mathematically consistent and strictly sum to 100%
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  ATS_PILLAR_WEIGHTS,
  REQUIREMENT_WEIGHT_CLASSES,
  MATCH_CLASSIFICATION_MULTIPLIERS,
  EVIDENCE_LEVEL_MULTIPLIERS,
  VERB_STRENGTH_MODIFIERS,
  JD_ALIGNMENT_WEIGHTS,
  PROJECT_SUBSTANCE_WEIGHTS,
  TRUTH_GATE_RULES,
} from '../../../src/config/scoring';

describe('Phase 4: Methodology Transparency & Mathematical Integrity', () => {
  it('ATS Pillar weights strictly sum to 1.0 (100%)', () => {
    const sum =
      ATS_PILLAR_WEIGHTS.hardSkills +
      ATS_PILLAR_WEIGHTS.evidenceQuality +
      ATS_PILLAR_WEIGHTS.fresherReadiness +
      ATS_PILLAR_WEIGHTS.formatSafety;

    expect(Math.round(sum * 1000) / 1000).toBe(1.0);
  });

  it('JD Alignment Index weights strictly sum to 1.0 (100 points)', () => {
    const sum =
      JD_ALIGNMENT_WEIGHTS.mustHaveSkills +
      JD_ALIGNMENT_WEIGHTS.evidenceDepth +
      JD_ALIGNMENT_WEIGHTS.preferredSkills +
      JD_ALIGNMENT_WEIGHTS.seniorityScope +
      JD_ALIGNMENT_WEIGHTS.formatSafety;

    expect(Math.round(sum * 1000) / 1000).toBe(1.0);
  });

  it('Project Substance Index weights strictly sum to 1.0 (100 points)', () => {
    const sum =
      PROJECT_SUBSTANCE_WEIGHTS.architectureSystemsDepth +
      PROJECT_SUBSTANCE_WEIGHTS.productionRigor +
      PROJECT_SUBSTANCE_WEIGHTS.quantifiedOutcomes +
      PROJECT_SUBSTANCE_WEIGHTS.techStackCraftsmanship;

    expect(Math.round(sum * 1000) / 1000).toBe(1.0);
  });

  it('Evidence Level Multipliers enforce strictly descending verification depth (L3 > L2 > L1 > L0 > 0)', () => {
    expect(EVIDENCE_LEVEL_MULTIPLIERS.L3_MEASURED_OUTCOME).toBeGreaterThan(
      EVIDENCE_LEVEL_MULTIPLIERS.L2_INTERNSHIP_WORK
    );
    expect(EVIDENCE_LEVEL_MULTIPLIERS.L2_INTERNSHIP_WORK).toBeGreaterThan(
      EVIDENCE_LEVEL_MULTIPLIERS.L1_PROJECT_BULLET
    );
    expect(EVIDENCE_LEVEL_MULTIPLIERS.L1_PROJECT_BULLET).toBeGreaterThan(
      EVIDENCE_LEVEL_MULTIPLIERS.L0_LISTED_ONLY
    );
    expect(EVIDENCE_LEVEL_MULTIPLIERS.L0_LISTED_ONLY).toBeGreaterThan(0);
  });

  it('Requirement Weight Classes prioritize mandatory over preferred and mentioned', () => {
    expect(REQUIREMENT_WEIGHT_CLASSES.mandatory).toBeGreaterThan(
      REQUIREMENT_WEIGHT_CLASSES.preferred
    );
    expect(REQUIREMENT_WEIGHT_CLASSES.preferred).toBeGreaterThan(
      REQUIREMENT_WEIGHT_CLASSES.mentioned
    );
  });

  it('Truth Gate publishes the 4 non-negotiable verification invariants', () => {
    expect(TRUTH_GATE_RULES).toHaveLength(4);

    const ids = TRUTH_GATE_RULES.map((r) => r.id);
    expect(ids).toEqual(['TG-01', 'TG-02', 'TG-03', 'TG-04']);

    // Assert anti-fabrication and zero-PII rules exist
    const rulesText = TRUTH_GATE_RULES.map((r) => r.rule.toLowerCase() + ' ' + r.description.toLowerCase()).join(' ');
    expect(rulesText).toContain('zero tolerance for fabricated metrics');
    expect(rulesText).toContain('zero pii');
    expect(rulesText).toContain('evidence grounding');
    expect(rulesText).toContain('deterministic re-scoring');
  });

  it('Verb strength modifiers reward decisive verbs and penalize weak/passive verbs', () => {
    expect(VERB_STRENGTH_MODIFIERS.STRONG).toBeGreaterThan(VERB_STRENGTH_MODIFIERS.STANDARD);
    expect(VERB_STRENGTH_MODIFIERS.STANDARD).toBeGreaterThan(VERB_STRENGTH_MODIFIERS.WEAK);
    expect(VERB_STRENGTH_MODIFIERS.WEAK).toBeGreaterThan(VERB_STRENGTH_MODIFIERS.NEGATED);
  });
});
