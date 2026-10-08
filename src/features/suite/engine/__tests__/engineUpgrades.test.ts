// ============================================================
// Suite Engine Tests — Stage 2.5
// Tests simulateFix, rankFixes, buildQuickSummary, Invariant 6, determinism
// ============================================================

import { describe, it, expect } from 'vitest';
import { simulateFix, rankFixes, SimulationFacts } from '../simulateFix';
import { buildQuickSummary, assertSummaryConsistency } from '../quickSummary';
import { SkillResult } from '../../../ats/engine/types';

function createMockFacts(): SimulationFacts {
  const skillResults: SkillResult[] = [
    {
      skillId: 'react',
      canonical: 'React',
      category: 'frontend',
      required: 'must',
      weight: 5,
      found: true,
      status: 'verified',
      proficiency: 3,
      evidenceQuotes: [
        {
          quote: 'Built dashboard using React',
          section: 'experience',
          charStart: 0,
          charEnd: 27,
          hasMetric: true,
          evidenceTier: 1.0,
        },
      ],
    },
    {
      skillId: 'typescript',
      canonical: 'TypeScript',
      category: 'languages',
      required: 'must',
      weight: 5,
      found: true,
      status: 'weak', // claimed/alias in skills list -> Wording Fix
      proficiency: 1,
      evidenceQuotes: [
        {
          quote: 'TypeScript',
          section: 'skills',
          charStart: 30,
          charEnd: 40,
          hasMetric: false,
          evidenceTier: 0.4,
        },
      ],
    },
    {
      skillId: 'aws',
      canonical: 'AWS',
      category: 'cloud',
      required: 'must',
      weight: 4,
      found: false,
      status: 'missing', // missing completely -> Learn Needed
      proficiency: 0,
      evidenceQuotes: [],
    },
    {
      skillId: 'docker',
      canonical: 'Docker',
      category: 'devops',
      required: 'nice',
      weight: 3,
      found: false,
      status: 'missing',
      proficiency: 0,
      evidenceQuotes: [],
    },
  ];

  return {
    wordCount: 250,
    skillResults,
    baseScore: 55,
  };
}

describe('Stage 2 Engine Upgrades', () => {
  describe('simulateFix', () => {
    it('calculates score improvement without mutating input facts', () => {
      const facts = createMockFacts();
      const originalSkillsCopy = JSON.stringify(facts.skillResults);

      const result = simulateFix(facts, 'typescript');
      expect(result.scoreBefore).toBe(55);
      expect(result.scoreAfter).toBeGreaterThanOrEqual(result.scoreBefore);
      expect(result.gain).toBe(result.scoreAfter - result.scoreBefore);

      // Verify facts were NOT mutated
      expect(JSON.stringify(facts.skillResults)).toBe(originalSkillsCopy);
    });

    it('executes in well under 5ms', () => {
      const facts = createMockFacts();
      const start = performance.now();
      for (let i = 0; i < 10; i++) {
        simulateFix(facts, 'aws');
      }
      const elapsed = (performance.now() - start) / 10;
      expect(elapsed).toBeLessThan(5);
    });
  });

  describe('rankFixes', () => {
    it('correctly partitions wording vs learn fixes and ranks by priority', () => {
      const facts = createMockFacts();
      const ranked = rankFixes(facts);

      expect(ranked.length).toBe(3); // typescript, aws, docker are not verified

      const tsFix = ranked.find((f) => f.skillId === 'typescript');
      const awsFix = ranked.find((f) => f.skillId === 'aws');

      expect(tsFix).toBeDefined();
      expect(tsFix?.gapClass).toBe('wording');
      expect(tsFix?.evidenceSnippet).toBe('TypeScript');

      expect(awsFix).toBeDefined();
      expect(awsFix?.gapClass).toBe('learn');
      expect(awsFix?.evidenceSnippet).toBeUndefined();

      // Top fix has highest priority
      expect(ranked[0].priority).toBeGreaterThanOrEqual(ranked[1].priority);
    });
  });

  describe('buildQuickSummary', () => {
    it('generates accurate QuickSummary with calibrated thresholds', () => {
      const facts = createMockFacts();
      const summary = buildQuickSummary(facts);

      expect(summary.counts.exact).toBe(1); // react
      expect(summary.counts.alias).toBe(1); // typescript
      expect(summary.counts.missing).toBe(2); // aws, docker

      expect(summary.effortSplit.wording).toBe(1);
      expect(summary.effortSplit.learn).toBe(2);
      expect(summary.topFixes.length).toBeLessThanOrEqual(3);
      expect(summary.eligibility.status).toBe('unknown'); // no profile / company rules
    });

    it('returns Insufficient input for empty or low-token resumes', () => {
      const emptyFacts: SimulationFacts = {
        wordCount: 15,
        skillResults: [],
        baseScore: 0,
      };

      const summary = buildQuickSummary(emptyFacts);
      expect(summary.verdict).toBe('Insufficient input');
      expect(summary.topFixes).toHaveLength(0);
    });
  });

  describe('Invariant 6 — Summary Consistency', () => {
    it('asserts summary consistency matches underlying deterministic facts', () => {
      const facts = createMockFacts();
      const summary = buildQuickSummary(facts);

      // Invariant 6 should not throw
      expect(() => assertSummaryConsistency(summary, facts)).not.toThrow();

      // Invariant 6 should throw on tampered summary
      const tampered = { ...summary, counts: { ...summary.counts, missing: 99 } };
      expect(() => assertSummaryConsistency(tampered, facts)).toThrow();
    });
  });

  describe('Determinism', () => {
    it('produces byte-identical summary given identical inputs', () => {
      const facts1 = createMockFacts();
      const facts2 = createMockFacts();

      const summary1 = buildQuickSummary(facts1);
      const summary2 = buildQuickSummary(facts2);

      expect(JSON.stringify(summary1)).toBe(JSON.stringify(summary2));
    });
  });
});
