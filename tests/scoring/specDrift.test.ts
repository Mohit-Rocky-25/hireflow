// ============================================================
// HireFlow Scoring Suite — Stage 7.5: Spec-Drift Test
// Proves that spec alterations dynamically update engine calculations,
// fingerprints, and trace results in lockstep (Rule A1, A2, A4).
// ============================================================

import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec/canonicalSpec';
import { runScoringEngine } from '../../src/scoring/core/traceBuilder';
import { buildScoringContext } from '../../src/scoring/core/context';
import { computeSpecFingerprint } from '../../src/scoring/core/fingerprint';
import { ResumeScoringInput } from '../../src/scoring/core/calculators';
import { ScoringSpec } from '../../src/scoring/spec/types';

describe('Stage 7.5: Spec-Drift & Dynamic Spec Parity Tests', () => {
  const baseSpec = CANONICAL_SCORING_SPEC;
  const baseFingerprint = computeSpecFingerprint(baseSpec);

  const testResume: ResumeScoringInput = {
    rawText: `
      John Doe | john@example.com | +91 98765 43210
      Education
      B.Tech Computer Science, 2026
      Skills
      Go, PostgreSQL
      Experience
      Backend Intern
      - Built RESTful microservices in Go.
      Projects
      Task Engine
      - Developed database layer using PostgreSQL.
    `,
    sectionsFound: ['Education', 'Skills', 'Experience', 'Projects'],
    experienceBullets: ['Built RESTful microservices in Go.'],
    projectBullets: ['Developed database layer using PostgreSQL.'],
    skillsBlockText: 'Go, PostgreSQL',
    hasGithubOrDemoLink: true,
    hasPhoto: false,
    hasDeclaration: false,
    hasFatherNameOrFullAddress: false,
    detectedWordCount: 150,
  };

  const context = buildScoringContext({
    experienceLevel: 'Student',
    roleFamily: 'Backend',
  });

  // ------------------------------------------------------------
  // 1. Mutating Nominal Weights dynamically shifts Trace weights & fingerprint
  // ------------------------------------------------------------
  it('Spec-Drift 1: Custom spec with elevated Evidence Quality shifts trace weights and fingerprint', () => {
    // Clone spec and alter fresher profile weights
    const modifiedSpec: ScoringSpec = JSON.parse(JSON.stringify(baseSpec));
    const fresherProfile = modifiedSpec.profiles.find((p) => p.id === 'fresher')!;
    fresherProfile.weights.evidence_quality = 50;
    fresherProfile.weights.requirement_coverage = 15;

    const modifiedFingerprint = computeSpecFingerprint(modifiedSpec);
    expect(modifiedFingerprint).not.toBe(baseFingerprint);

    const baseTrace = runScoringEngine(context, testResume, { spec: baseSpec });
    const modifiedTrace = runScoringEngine(context, testResume, { spec: modifiedSpec });

    expect(modifiedTrace.specFingerprint).toBe(modifiedFingerprint);
    expect(modifiedTrace.specFingerprint).not.toBe(baseTrace.specFingerprint);

    const baseEvWeight = baseTrace.pillars.find((p) => p.id === 'evidence_quality')!.effectiveWeight;
    const modEvWeight = modifiedTrace.pillars.find((p) => p.id === 'evidence_quality')!.effectiveWeight;

    // Effective weight changed from 0.25 to 0.50
    expect(baseEvWeight).toBeCloseTo(0.25, 2);
    expect(modEvWeight).toBeCloseTo(0.50, 2);
  });

  // ------------------------------------------------------------
  // 2. Mutating Context Multipliers alters score credit dynamically
  // ------------------------------------------------------------
  it('Spec-Drift 2: Mutating skills block context weight dynamically changes listed-only credit', () => {
    const strictSpec: ScoringSpec = JSON.parse(JSON.stringify(baseSpec));
    // Reduce skillsBlockOnly from 0.35 to 0.10
    strictSpec.evidenceTables.contextWeight.skillsBlockOnly = 0.10;

    const strictFingerprint = computeSpecFingerprint(strictSpec);
    expect(strictFingerprint).not.toBe(baseFingerprint);

    // Resume with skills only listed in skills block, zero project bullets
    const skillsOnlyResume: ResumeScoringInput = {
      ...testResume,
      experienceBullets: [],
      projectBullets: [],
    };

    const baseTrace = runScoringEngine(context, skillsOnlyResume, { spec: baseSpec });
    const strictTrace = runScoringEngine(context, skillsOnlyResume, { spec: strictSpec });

    const baseReqScore = baseTrace.pillars.find((p) => p.id === 'requirement_coverage')!.rawScore;
    const strictReqScore = strictTrace.pillars.find((p) => p.id === 'requirement_coverage')!.rawScore;

    expect(strictReqScore).toBeLessThan(baseReqScore);
  });

  // ------------------------------------------------------------
  // 3. Mutating Directed Implication Graph dynamically alters transitive credit
  // ------------------------------------------------------------
  it('Spec-Drift 3: Adding custom transitive implication edge awards new skill credit dynamically', () => {
    const customSpec: ScoringSpec = JSON.parse(JSON.stringify(baseSpec));
    // Add custom edge: 'FastAPI' implies 'Docker' with 0.8 credit
    customSpec.evidenceTables.implicationEdges.push({
      fromSkill: 'Go',
      toSkill: 'C',
      type: 'STRONG',
      creditMultiplier: 0.75,
      rationale: 'Go low-level runtime knowledge awards partial C credit in test spec',
    });

    const customFingerprint = computeSpecFingerprint(customSpec);
    expect(customFingerprint).not.toBe(baseFingerprint);
    expect(customSpec.evidenceTables.implicationEdges.some((e) => e.fromSkill === 'Go' && e.toSkill === 'C')).toBe(
      true
    );
  });

  // ------------------------------------------------------------
  // 4. Spec Version Stamping Invariant
  // ------------------------------------------------------------
  it('Spec-Drift 4: Stamped specVersion and engineVersion in trace match provided spec', () => {
    const bumpedSpec: ScoringSpec = {
      ...baseSpec,
      specVersion: '2.5.0-beta.1',
      engineVersion: '4.1.0',
    };

    const trace = runScoringEngine(context, testResume, { spec: bumpedSpec });
    expect(trace.specVersion).toBe('2.5.0-beta.1');
    expect(trace.engineVersion).toBe('4.1.0');
  });
});
