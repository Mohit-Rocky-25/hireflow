import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec';
import {
  computeRequirementCoverage,
  computeEvidenceQuality,
  computeProjectReadiness,
  computeParserFriendliness,
  scoreBullet,
  scoreBullets,
  runScoringEngine,
  buildScoringContext,
  ResumeScoringInput,
} from '../../src/scoring/core';

describe('Stage 3: Roaster Pillars Wired to the Spec (Tasks 3.1 - 3.6)', () => {
  const dummyResume: ResumeScoringInput = {
    rawText: `
      Ankit Sharma | Bangalore | ankit@example.com | github.com/ankit-dev
      Experience: Software Engineer at Zeta (2024 - Present)
      - Engineered distributed caching layer in Go using Redis, reducing p99 latency by 30ms for 20,000 QPS.
      - Developed automated CI/CD pipelines in Docker and GitHub Actions, cutting deployment time by 45%.
      Projects:
      - Built search indexing engine with PostgreSQL and ElasticSearch handling 1M records.
      Skills: Go, Redis, Docker, PostgreSQL, ElasticSearch, Git
      Education: B.Tech Computer Science
    `,
    sectionsFound: ['Experience', 'Projects', 'Skills', 'Education'],
    experienceBullets: [
      'Engineered distributed caching layer in Go using Redis, reducing p99 latency by 30ms for 20,000 QPS.',
      'Developed automated CI/CD pipelines in Docker and GitHub Actions, cutting deployment time by 45%.',
    ],
    projectBullets: [
      'Built search indexing engine with PostgreSQL and ElasticSearch handling 1M records.',
    ],
    skillsBlockText: 'Go, Redis, Docker, PostgreSQL, ElasticSearch, Git',
    hasGithubOrDemoLink: true,
    hasPhoto: false,
    hasDeclaration: false,
    hasFatherNameOrFullAddress: false,
    detectedWordCount: 160,
  };

  describe('3.1 Requirement Coverage & Verb Independence', () => {
    it('verifies that changing action verbs never alters Requirement Coverage score', () => {
      const context = buildScoringContext({
        experienceLevel: 'Student',
        roleFamily: 'Backend',
        parsedJd: {
          roleTitle: 'Backend Engineer',
          roleFamily: 'Backend',
          jdLevel: 'entry',
          yearsRequired: 0,
          confirmedRequirements: [
            { id: '1', text: 'Go', category: 'must', confidence: 0.95, inTaxonomy: true },
            { id: '2', text: 'Redis', category: 'preferred', confidence: 0.9, inTaxonomy: true },
          ],
          unrecognizedRequirements: [],
          warnings: [],
        },
      });

      // Resume 1: Strong action verbs
      const resumeStrong: ResumeScoringInput = {
        ...dummyResume,
        experienceBullets: [
          'Architected and implemented high-throughput microservice in Go with Redis caching.',
        ],
      };

      // Resume 2: Weak/passive phrasing for same technical skills
      const resumeWeak: ResumeScoringInput = {
        ...dummyResume,
        experienceBullets: [
          'Assisted with tasks and was responsible for Go and Redis backend maintenance.',
        ],
      };

      const coverageStrong = computeRequirementCoverage(context, resumeStrong, CANONICAL_SCORING_SPEC);
      const coverageWeak = computeRequirementCoverage(context, resumeWeak, CANONICAL_SCORING_SPEC);

      // Rule 3.1 & 3.2: Verb effect lives strictly in Evidence Quality, never Requirement Coverage
      expect(coverageStrong.rawScore).toBe(coverageWeak.rawScore);

      // Meanwhile, Evidence Quality DOES reflect the verb disparity
      const evidenceStrong = computeEvidenceQuality(context, resumeStrong, CANONICAL_SCORING_SPEC);
      const evidenceWeak = computeEvidenceQuality(context, resumeWeak, CANONICAL_SCORING_SPEC);
      expect(evidenceStrong.rawScore).toBeGreaterThan(evidenceWeak.rawScore);
    });

    it('awards listed-only skills 0.35 in Requirement Coverage and ZERO in Evidence Quality', () => {
      const skillsOnlyResume: ResumeScoringInput = {
        rawText: 'Skills: Python, Django, SQL. Education: B.Tech.',
        sectionsFound: ['Skills', 'Education'],
        experienceBullets: [],
        projectBullets: [],
        skillsBlockText: 'Python, Django, SQL',
        hasGithubOrDemoLink: false,
        hasPhoto: false,
        hasDeclaration: false,
        hasFatherNameOrFullAddress: false,
        detectedWordCount: 50,
      };

      const context = buildScoringContext({
        experienceLevel: 'Student',
        roleFamily: 'Backend',
        parsedJd: {
          roleTitle: 'Backend Developer',
          roleFamily: 'Backend',
          jdLevel: 'entry',
          yearsRequired: 0,
          confirmedRequirements: [
            { id: '1', text: 'Python', category: 'must', confidence: 0.9, inTaxonomy: true },
          ],
          unrecognizedRequirements: [],
          warnings: [],
        },
      });

      const coverage = computeRequirementCoverage(context, skillsOnlyResume, CANONICAL_SCORING_SPEC);
      // Earns 35% placement credit in Requirement Coverage
      expect(coverage.rawScore).toBe(35);

      const evidence = computeEvidenceQuality(context, skillsOnlyResume, CANONICAL_SCORING_SPEC);
      // Earns exactly 0 in Evidence Quality (no bullets)
      expect(evidence.rawScore).toBe(0);
    });
  });

  describe('3.2 Evidence Quality Rubric Constraints', () => {
    it('bounds individual bullet scores strictly between 0 and 100', () => {
      const bullets = [
        'Architected real-time WebSocket cluster in Go, supporting 100,000 concurrent connections to deliver 99.99% uptime.',
        'Responsible for assisting with bug fixes.',
        'React, TypeScript, Next.js, Redux, Tailwind, Jest, Docker, AWS.',
        '',
      ];

      for (const b of bullets) {
        const score = scoreBullet(b, CANONICAL_SCORING_SPEC, ['Go', 'React', 'Docker']).totalScore;
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('3.3 Parser-Friendliness Unified Deduction Engine', () => {
    it('penalizes missing standard sections and Indian regional advisories per spec', () => {
      const badResume: ResumeScoringInput = {
        rawText: 'John Doe. B.Tech graduate with photo included. Father Name: Ramesh Sharma. I hereby declare that all details are true.',
        sectionsFound: [], // Missing standard sections
        experienceBullets: [],
        projectBullets: [],
        skillsBlockText: '',
        hasGithubOrDemoLink: false,
        hasPhoto: true,
        hasDeclaration: true,
        hasFatherNameOrFullAddress: true,
        detectedWordCount: 80, // Short document < 100 words
      };

      const context = buildScoringContext({ experienceLevel: 'Student', roleFamily: 'General' });
      const parserResult = computeParserFriendliness(context, badResume, CANONICAL_SCORING_SPEC);

      // Base 100 - missing sections (12) - short document (20) - photo (2) - declaration (2) - father name (2) = 62
      expect(parserResult.rawScore).toBeLessThanOrEqual(70);
      expect(parserResult.flags.some((f) => f.includes('Photo'))).toBe(true);
      expect(parserResult.flags.some((f) => f.includes('Declaration'))).toBe(true);
    });
  });

  describe('3.4 Role-Aware Project & Readiness', () => {
    it('evaluates role-specific architectural signals and keeps Modern Craftsmanship unweighted as advisory', () => {
      const contextBackend = buildScoringContext({ experienceLevel: 'Student', roleFamily: 'Backend' });
      const contextFrontend = buildScoringContext({ experienceLevel: 'Student', roleFamily: 'Frontend' });

      const backendResult = computeProjectReadiness(contextBackend, dummyResume, CANONICAL_SCORING_SPEC);
      const frontendResult = computeProjectReadiness(contextFrontend, dummyResume, CANONICAL_SCORING_SPEC);

      // The dummy resume has Redis, caching, p99, Go -> strong Backend signals
      expect(backendResult.rawScore).toBeGreaterThan(frontendResult.rawScore);

      // Modern Craftsmanship is excluded from the weighted score and lives in flags
      const trace = runScoringEngine(contextBackend, dummyResume);
      const projectPillar = trace.pillars.find((p) => p.id === 'project_readiness')!;

      // Verify sub-features do not contain Craftsmanship as a scored feature
      expect(projectPillar.subScores.some((sf) => sf.id === 'techStackCraftsmanship')).toBe(false);
      expect(projectPillar.subScores.every((sf) => sf.weight > 0)).toBe(true);
    });
  });

  describe('3.5 Single-Counting Guarantee (Rule A3)', () => {
    it('verifies that no sub-feature ID exists in more than one pillar across the entire spec', () => {
      const allSubFeatureIds = new Set<string>();

      for (const pillar of CANONICAL_SCORING_SPEC.pillars) {
        for (const sub of pillar.subFeatures) {
          expect(
            allSubFeatureIds.has(sub.id),
            `Rule A3 Violation: Duplicate sub-feature ID "${sub.id}" found in pillar "${pillar.id}"`
          ).toBe(false);
          allSubFeatureIds.add(sub.id);
        }
      }
    });
  });
});
