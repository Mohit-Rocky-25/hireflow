// ============================================================
// HireFlow Scoring Suite — Stage 7.2: 500-Iteration Seeded PRNG Property Tests
// Invariants: Range [0, 100], Pure Determinism, Renormalization Sum = 1.0,
// Sensitivity Band Invariant, Single-Counting (Rule A3).
// ============================================================

import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec/canonicalSpec';
import { runScoringEngine } from '../../src/scoring/core/traceBuilder';
import { buildScoringContext } from '../../src/scoring/core/context';
import { ResumeScoringInput } from '../../src/scoring/core/calculators';
import { RoleFamily, ExperienceLevel } from '../../src/scoring/spec/types';

// Seeded PRNG (Mulberry32) for deterministic reproducible property testing
function createPrng(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROLE_FAMILIES: RoleFamily[] = ['Backend', 'Frontend', 'Full-stack', 'Data/ML', 'Mobile', 'DevOps', 'General'];
const EXP_LEVELS: ExperienceLevel[] = ['Student', 'Intern', '0-2 yrs', '2+ yrs'];
const POSSIBLE_SECTIONS = ['Experience', 'Education', 'Projects', 'Skills', 'Certifications', 'Leadership'];
const SAMPLE_BULLETS = [
  'Architected distributed caching layer in Go using Redis, reducing p99 latency by 45ms for 30,000 QPS.',
  'Built full-stack React and Node.js application with PostgreSQL database and Jest tests.',
  'Configured Docker containers and automated GitHub Actions CI/CD deployment pipelines.',
  'Designed relational schema and optimized slow SQL joins reducing query response times by 35%.',
  'Developed reusable component library in TypeScript and Tailwind CSS with 100% test coverage.',
  'Collaborated with product squads to resolve customer issues in agile sprint cycles.',
  'Assisted in data migration scripts for legacy databases.',
  'Java, Python, C++, Docker, Kubernetes, AWS, PostgreSQL, MongoDB, Redis',
];

describe('Stage 7.2: 500-Iteration Seeded PRNG Property & Invariant Tests', () => {
  it('verifies core scoring invariants across 500 random inputs with fixed seed', () => {
    const rng = createPrng(0xdeadbeef);
    const ITERATIONS = 500;

    for (let i = 0; i < ITERATIONS; i++) {
      // 1. Generate pseudo-random context
      const roleFamily = ROLE_FAMILIES[Math.floor(rng() * ROLE_FAMILIES.length)];
      const experienceLevel = EXP_LEVELS[Math.floor(rng() * EXP_LEVELS.length)];
      const candidateYears = Math.round(rng() * 80) / 10; // 0.0 to 8.0 yrs
      const requiredYears = Math.round(rng() * 60) / 10;  // 0.0 to 6.0 yrs

      const context = buildScoringContext({
        roleFamily,
        experienceLevel,
        candidateYearsExperience: candidateYears,
        requiredYearsExperience: requiredYears,
      });

      // 2. Generate pseudo-random resumeData
      const wordCount = Math.floor(rng() * 800);
      const sectionCount = Math.floor(rng() * POSSIBLE_SECTIONS.length) + 1;
      const sectionsFound = POSSIBLE_SECTIONS.slice(0, sectionCount);

      const expBulletCount = Math.floor(rng() * 4);
      const projBulletCount = Math.floor(rng() * 4);

      const expBullets: string[] = [];
      for (let b = 0; b < expBulletCount; b++) {
        expBullets.push(SAMPLE_BULLETS[Math.floor(rng() * SAMPLE_BULLETS.length)]);
      }
      const projBullets: string[] = [];
      for (let b = 0; b < projBulletCount; b++) {
        projBullets.push(SAMPLE_BULLETS[Math.floor(rng() * SAMPLE_BULLETS.length)]);
      }

      const resumeInput: ResumeScoringInput = {
        rawText: `Synthetic candidate ${i}\n` + expBullets.join('\n') + '\n' + projBullets.join('\n'),
        sectionsFound,
        experienceBullets: expBullets,
        projectBullets: projBullets,
        skillsBlockText: rng() > 0.5 ? 'Go, Redis, Docker, TypeScript, PostgreSQL' : '',
        hasGithubOrDemoLink: rng() > 0.5,
        hasPhoto: rng() > 0.7,
        hasDeclaration: rng() > 0.8,
        hasFatherNameOrFullAddress: rng() > 0.9,
        detectedWordCount: wordCount,
      };

      // 3. Execute core engine
      const trace1 = runScoringEngine(context, resumeInput);
      const trace2 = runScoringEngine(context, resumeInput);

      // Invariant 1: Range Guarantee
      expect(trace1.compositeDisplay).toBeGreaterThanOrEqual(0);
      expect(trace1.compositeDisplay).toBeLessThanOrEqual(100);
      expect(Number.isInteger(trace1.compositeDisplay)).toBe(true);

      // Invariant 2: Pure Determinism
      expect(trace1.compositeDisplay).toBe(trace2.compositeDisplay);
      expect(trace1.composite).toBeCloseTo(trace2.composite, 12);
      expect(trace1.specFingerprint).toBe(trace2.specFingerprint);
      expect(trace1.profileId).toBe(trace2.profileId);
      expect(trace1.pillars.length).toBe(trace2.pillars.length);

      // Invariant 3: Renormalization Sum = 1.0
      const applicablePillars = trace1.pillars.filter((p) => p.applicable);
      if (applicablePillars.length > 0) {
        const weightSum = applicablePillars.reduce((sum, p) => sum + p.effectiveWeight, 0);
        expect(weightSum).toBeCloseTo(1.0, 9);
      }

      // Invariant 4: Sensitivity Band Invariant
      expect(trace1.band.low).toBeGreaterThanOrEqual(0);
      expect(trace1.band.high).toBeLessThanOrEqual(100);
      expect(trace1.band.low).toBeLessThanOrEqual(trace1.compositeDisplay);
      expect(trace1.band.high).toBeGreaterThanOrEqual(trace1.compositeDisplay);
      expect(trace1.band.width).toBe(trace1.band.high - trace1.band.low);

      // Invariant 5: Single-Counting & Pillar Uniqueness
      const pillarIds = trace1.pillars.map((p) => p.id);
      const uniquePillarIds = new Set(pillarIds);
      expect(uniquePillarIds.size).toBe(pillarIds.length);
    }
  });
});
