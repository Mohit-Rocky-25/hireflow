import { describe, it, expect } from 'vitest';
import {
  composeBulletFromFact,
  lintBulletOpener,
  isVerbPermittedForTier,
  getVerbsForTier,
  composeProfessionalSummary,
  Fact,
  CandidateIdentity,
  Target,
} from '../../src/lib/resume';

describe('Stage 4 — Composer: Bullets, Summary, Verbs & Weak-Phrase Lint', () => {
  const confirmedFactWithMetric: Fact = {
    id: 'fact_perf_1',
    version: 1,
    source: 'user',
    confirmed: true,
    kind: 'experience',
    action: 'Optimized',
    object: 'PostgreSQL database query execution paths',
    tech: ['PostgreSQL', 'SQL'],
    evidence: {
      type: 'metric',
      value: '28%',
      unit: '%',
    },
    outcome: 'query latency reduction',
    ownership: 3, // Tier 3: Owned a deliverable
    hash: 'hash_test_1',
    createdAt: '2026-10-28T12:00:00.000Z',
  };

  const confirmedFactWithoutMetric: Fact = {
    id: 'fact_api_1',
    version: 1,
    source: 'user',
    confirmed: true,
    kind: 'project',
    action: 'Built',
    object: 'full-stack merchant billing portal',
    tech: ['React', 'Node.js', 'Express'],
    ownership: 2, // Tier 2: Contributed a part
    hash: 'hash_test_2',
    createdAt: '2026-10-28T12:00:00.000Z',
  };

  // -------------------------------------------------------------
  // E1: 4 Composition Patterns
  // -------------------------------------------------------------
  describe('E1: 4 Composition Patterns', () => {
    it('composes action-first bullet cleanly', () => {
      const b = composeBulletFromFact(confirmedFactWithMetric, 'action-first');
      expect(b.text).toBe('Optimized PostgreSQL database query execution paths using PostgreSQL, SQL, achieving 28% query latency reduction.');
      expect(b.metricUsed).toBe('28%');
    });

    it('composes outcome-first bullet cleanly', () => {
      const b = composeBulletFromFact(confirmedFactWithMetric, 'outcome-first');
      expect(b.text).toBe('28% query latency reduction achieved by optimized PostgreSQL database query execution paths using PostgreSQL, SQL.');
    });

    it('composes scale-first bullet cleanly', () => {
      const b = composeBulletFromFact(confirmedFactWithMetric, 'scale-first');
      expect(b.text).toBe('Across 28%, optimized PostgreSQL database query execution paths using PostgreSQL, SQL to query latency reduction.');
    });

    it('composes problem-and-fix bullet cleanly', () => {
      const b = composeBulletFromFact(confirmedFactWithMetric, 'problem-and-fix');
      expect(b.text).toBe('Addressed engineering bottleneck by optimized PostgreSQL database query execution paths with PostgreSQL, SQL, realizing 28% query latency reduction.');
    });
  });

  // -------------------------------------------------------------
  // E2: Zero Metric Invention (No [X%] or invented numbers)
  // -------------------------------------------------------------
  describe('E2: Zero Metric Invention (P4)', () => {
    it('composes bullet without metric when fact has no evidence, never inserting [X%] or invented digits', () => {
      const b = composeBulletFromFact(confirmedFactWithoutMetric, 'action-first');
      expect(b.text).toBe('Built full-stack merchant billing portal using React, Node.js, Express.');
      expect(b.text).not.toContain('[X%]');
      expect(b.text).not.toContain('[X]');
      expect(b.metricUsed).toBeUndefined();
    });

    it('throws error when trying to compose from unconfirmed or tier-less fact', () => {
      const unconfirmedFact: Fact = {
        ...confirmedFactWithMetric,
        confirmed: false,
      };
      expect(() => composeBulletFromFact(unconfirmedFact, 'action-first')).toThrow('unconfirmed');
    });
  });

  // -------------------------------------------------------------
  // E3: Ownership Tier Verb Ladder Boundaries (P3)
  // -------------------------------------------------------------
  describe('E3: Ownership Tier Verb Ladder Boundaries (P3)', () => {
    it('enforces tier verb boundaries strictly', () => {
      // Tier 1 verbs
      expect(isVerbPermittedForTier('supported', 1)).toBe(true);
      expect(isVerbPermittedForTier('assisted', 1)).toBe(true);
      expect(isVerbPermittedForTier('architected', 1)).toBe(false);
      expect(isVerbPermittedForTier('spearheaded', 1)).toBe(false);

      // Tier 3 verbs
      expect(isVerbPermittedForTier('architected', 3)).toBe(true);
      expect(isVerbPermittedForTier('engineered', 3)).toBe(true);
      expect(isVerbPermittedForTier('championed', 3)).toBe(false);

      // Tier 5 verbs
      expect(isVerbPermittedForTier('championed', 5)).toBe(true);
      expect(isVerbPermittedForTier('pioneered', 5)).toBe(true);
    });

    it('caps proposed action verb to declared tier ladder instead of inflating', () => {
      // Candidate claimed "Spearheaded" (Tier 4) but declared ownership is Tier 1 (Supported)
      const inflatedFact: Fact = {
        ...confirmedFactWithMetric,
        action: 'Spearheaded',
        ownership: 1, // Tier 1
      };

      const b = composeBulletFromFact(inflatedFact, 'action-first');
      // Must not use "Spearheaded" because Tier 1 cap is enforced
      expect(b.verb).toBe('Supported');
      expect(b.text.toLowerCase()).not.toContain('spearheaded');
      expect(b.text).toContain('Supported');
    });

    it('provides permitted verb sets for each tier', () => {
      for (const tier of [1, 2, 3, 4, 5] as const) {
        const verbs = getVerbsForTier(tier);
        expect(verbs.length).toBeGreaterThan(0);
      }
    });
  });

  // -------------------------------------------------------------
  // E4: Weak Phrase Linter (I-01, I-25)
  // -------------------------------------------------------------
  describe('E4: Weak Phrase Linter (I-01, I-25)', () => {
    it('detects weak openers and issues actionable warnings without altering input', () => {
      const lint1 = lintBulletOpener('Responsible for maintaining microservices in Kubernetes.');
      expect(lint1.isWeak).toBe(true);
      expect(lint1.detectedPhrase).toBe('responsible for');
      expect(lint1.recommendedTier).toBe(1);

      const lint2 = lintBulletOpener('Assisted with database schema migration.');
      expect(lint2.isWeak).toBe(true);
      expect(lint2.detectedPhrase).toBe('assisted with');

      const lint3 = lintBulletOpener('Engineered distributed caching layer in Redis.');
      expect(lint3.isWeak).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // E5: Deterministic Professional Summary Formula (I-24)
  // -------------------------------------------------------------
  describe('E5: Deterministic Professional Summary Formula (I-24)', () => {
    it('composes factual summary strictly from confirmed facts, avoiding hollow buzzwords', () => {
      const candidate: CandidateIdentity = {
        fullName: 'Fictional SDE',
        email: 'fictional.sde@example.org',
        headline: 'Full-Stack Software Engineer',
      };

      const target: Target = {
        id: 't_razorpay',
        title: 'Full Stack Engineer',
        company: 'Razorpay',
        seniority: 'mid',
        region: 'india-private',
        requirements: [],
        domainKeywords: ['React', 'TypeScript', 'Node.js'],
        rawText: 'Role at Razorpay',
      };

      const result = composeProfessionalSummary(
        candidate,
        [confirmedFactWithMetric, confirmedFactWithoutMetric],
        target,
        3
      );

      expect(result.summary).toContain('Full-Stack Software Engineer');
      expect(result.summary).toContain('3+ years');
      expect(result.summary).toContain('PostgreSQL');
      expect(result.summary).toContain('28%');
      expect(result.summary).toContain('Razorpay');
      expect(result.hasBannedBuzzwords).toBe(false);
      expect(result.bannedWordsFound).toEqual([]);
    });

    it('detects banned buzzwords (ninja, rockstar, guru)', () => {
      const candidateWithBuzzword: CandidateIdentity = {
        fullName: 'Buzzword User',
        email: 'user@example.org',
        headline: 'Passionate Rockstar Ninja Engineer',
      };

      const result = composeProfessionalSummary(
        candidateWithBuzzword,
        [confirmedFactWithMetric],
        undefined,
        1
      );

      expect(result.hasBannedBuzzwords).toBe(true);
      expect(result.bannedWordsFound).toContain('rockstar');
      expect(result.bannedWordsFound).toContain('ninja');
      expect(result.bannedWordsFound).toContain('passionate');
    });
  });
});

