import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec';
import { runScoringEngine, ScoringContext } from '../../src/scoring/core';
import { SYNTHETIC_FIXTURES } from '../../src/scoring/__fixtures__/syntheticFixtures';

/**
 * Independent from-scratch oracle calculator (Task 1.6)
 * Uses ONLY the mathematical definitions from Tasks 1.4 and 1.5.
 * Contains ZERO references or imports to engine code.
 */
function independentOracleComposite(
  pillars: { id: string; applicable: boolean; nominalWeight: number; rawScore: number }[]
): number {
  const applicable = pillars.filter((p) => p.applicable);
  const nominalSum = applicable.reduce((sum, p) => sum + p.nominalWeight, 0);

  if (nominalSum === 0) return 0;

  let total = 0;
  for (const p of applicable) {
    const effectiveWeight = p.nominalWeight / nominalSum;
    const clampedScore = Math.min(100, Math.max(0, p.rawScore));
    total += effectiveWeight * clampedScore;
  }

  return Math.min(100, Math.max(0, total));
}

describe('Independent Oracle Test (Task 1.6)', () => {
  it('asserts exact parity to 1e-9 between engine composite and independent oracle across all 24 synthetic fixtures', () => {
    for (const fixture of SYNTHETIC_FIXTURES) {
      // Create representative context for fixture
      const context: ScoringContext = {
        experienceLevel: fixture.experienceLevel,
        roleFamily: fixture.roleFamily,
        jdPresent: fixture.jobDescription !== undefined,
        confirmedRequirements: [
          { id: '1', text: 'Backend', category: 'must', confidence: 0.9, inTaxonomy: true },
          { id: '2', text: 'Database', category: 'must', confidence: 0.85, inTaxonomy: true },
          { id: '3', text: 'Testing', category: 'preferred', confidence: 0.8, inTaxonomy: true },
        ],
        jdLevel: fixture.experienceLevel === '3+ yr' ? 'mid' : 'entry',
        candidateYearsExperience: fixture.experienceLevel === '3+ yr' ? 3.5 : 1.0,
        requiredYearsExperience: fixture.experienceLevel === '3+ yr' ? 3.0 : 0,
      };

      const trace = runScoringEngine(
        context,
        {
          rawText: fixture.resumeText,
          sectionsFound: ['Experience', 'Projects', 'Skills', 'Education'],
          experienceBullets: [
            'Architected microservices in Go, serving 10,000 requests/sec with p99 latency under 25ms.',
          ],
          projectBullets: [
            'Built distributed key-value store with raft consensus in Go to ensure high availability.',
          ],
          skillsBlockText: 'Go, PostgreSQL, Redis, Docker, Kubernetes',
          hasGithubOrDemoLink: !fixture.isFormatUgly,
          hasPhoto: fixture.isFormatUgly,
          hasDeclaration: fixture.isFormatUgly,
          hasFatherNameOrFullAddress: fixture.isFormatUgly,
          detectedWordCount: 300,
        },
        { spec: CANONICAL_SCORING_SPEC }
      );

      // Extract raw inputs for oracle
      const oracleInputs = trace.pillars.map((p) => ({
        id: p.id,
        applicable: p.applicable,
        nominalWeight: p.nominalWeight,
        rawScore: p.rawScore,
      }));

      const oracleScore = independentOracleComposite(oracleInputs);

      // Mathematical equivalence to 1e-9
      const difference = Math.abs(trace.composite - oracleScore);
      expect(difference).toBeLessThan(1e-9);

      // Display rounding assertion
      expect(trace.compositeDisplay).toBe(Math.round(oracleScore));
    }
  });
});
