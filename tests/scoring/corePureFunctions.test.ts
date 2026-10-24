import { describe, it, expect } from 'vitest';
import { CANONICAL_SCORING_SPEC } from '../../src/scoring/spec';
import {
  matchTokenInText,
  evaluateEvidenceCredit,
  scoreBullet,
  scoreBullets,
  calculateComposite,
  runScoringEngine,
  computeSpecFingerprint,
  ScoringContext,
} from '../../src/scoring/core';
import { SYNTHETIC_FIXTURES } from '../../src/scoring/__fixtures__/syntheticFixtures';

describe('Scoring Core Pure Functions & Invariants (Tasks 1.2 - 1.5)', () => {
  describe('Boundary-Safe Tokenizer (Task 1.2)', () => {
    it('accurately identifies C without false positives for California, Vitamin C, or words', () => {
      expect(matchTokenInText('C', 'Proficient in C, C++, and Assembly').found).toBe(true);
      expect(matchTokenInText('C', 'ANSI C systems programming').found).toBe(true);
      expect(matchTokenInText('C', 'Experience with C/C++ development').found).toBe(true);

      // False positive rejections
      expect(matchTokenInText('C', 'Living in San Francisco, CA').found).toBe(false);
      expect(matchTokenInText('C', 'Took Vitamin C daily during project').found).toBe(false);
      expect(matchTokenInText('C', 'Driver with Class C license').found).toBe(false);
      expect(matchTokenInText('C', 'Cat dog apple').found).toBe(false);
    });

    it('accurately identifies Go without false positives for English verbs', () => {
      expect(matchTokenInText('Go', 'Backend built with Go and PostgreSQL').found).toBe(true);
      expect(matchTokenInText('Go', 'Experienced Golang engineer').found).toBe(true);
      expect(matchTokenInText('Go', 'Wrote Go microservice with gRPC').found).toBe(true);

      // False positive rejections
      expect(matchTokenInText('Go', 'Ready to go live with the product').found).toBe(false);
      expect(matchTokenInText('Go', 'Decided to go ahead with deployment').found).toBe(false);
      expect(matchTokenInText('Go', 'Worked at Google on cloud infrastructure').found).toBe(false);
      expect(matchTokenInText('Go', 'Ongoing project with team').found).toBe(false);
    });

    it('accurately identifies R without false positives for R&D', () => {
      expect(matchTokenInText('R', 'Data analysis in R programming').found).toBe(true);
      expect(matchTokenInText('R', 'Statistical modeling using GNU R').found).toBe(true);
      expect(matchTokenInText('R', 'Python, R, SQL', true).found).toBe(true);

      // False positive rejections
      expect(matchTokenInText('R', 'Worked in R&D division for 2 years').found).toBe(false);
      expect(matchTokenInText('R', 'Passed Round 1 technical interview').found).toBe(false);
    });

    it('distinguishes Java from JavaScript', () => {
      expect(matchTokenInText('Java', 'Built enterprise backend using Java and Spring Boot').found).toBe(true);
      expect(matchTokenInText('Java', 'Frontend developed with JavaScript and HTML5').found).toBe(false);
    });
  });

  describe('Evidence Credit & Implication Edges (Task 3.1 & 1.2)', () => {
    it('applies context weights strictly according to spec', () => {
      const mentions = new Map([
        ['react', 'experience' as const],
        ['docker', 'projectWithLink' as const],
        ['c++', 'academicProject' as const],
        ['sql', 'skillsBlockOnly' as const],
      ]);

      const reqs = [
        { id: '1', name: 'React', priorityWeight: 3.0 },
        { id: '2', name: 'Docker', priorityWeight: 1.5 },
        { id: '3', name: 'C++', priorityWeight: 1.0 },
        { id: '4', name: 'SQL', priorityWeight: 1.0 },
      ];

      const result = evaluateEvidenceCredit(reqs, mentions, CANONICAL_SCORING_SPEC);
      expect(result.assessments.get('react')?.directCredit).toBe(1.0);
      expect(result.assessments.get('docker')?.directCredit).toBe(0.8);
      expect(result.assessments.get('c++')?.directCredit).toBe(0.6);
      expect(result.assessments.get('sql')?.directCredit).toBe(0.35);
    });

    it('grants 0.5x parent credit for STRONG implications and 0.0 for WEAK edges', () => {
      const mentions = new Map([
        ['next.js', 'experience' as const], // parent credit = 1.0
        ['amazon eks', 'experience' as const], // parent credit = 1.0
      ]);

      const reqs = [
        { id: '1', name: 'React', priorityWeight: 3.0 }, // strong implication from Next.js
        { id: '2', name: 'Docker', priorityWeight: 3.0 }, // weak implication from Amazon EKS
      ];

      const result = evaluateEvidenceCredit(reqs, mentions, CANONICAL_SCORING_SPEC);
      const reactAssessment = result.assessments.get('react');
      expect(reactAssessment?.effectiveCredit).toBe(0.5);
      expect(reactAssessment?.isImpliedOnly).toBe(true);

      const dockerAssessment = result.assessments.get('docker');
      expect(dockerAssessment?.effectiveCredit).toBe(0.0);
      expect(dockerAssessment?.isImpliedOnly).toBe(false);
    });
  });

  describe('100-Point Bullet Scorer (Task 3.2)', () => {
    it('awards exactly 100 points to a pristine engineering bullet', () => {
      const pristineBullet =
        'Architected distributed caching layer using Redis, reducing p99 API response latency by 45ms to deliver seamless user experience.';
      const breakdown = scoreBullet(pristineBullet, CANONICAL_SCORING_SPEC, ['Redis']);

      expect(breakdown.actionVerbScore).toBe(20);
      expect(breakdown.measuredResultScore).toBe(30);
      expect(breakdown.techInContextScore).toBe(25);
      expect(breakdown.outcomeImpactScore).toBe(25);
      expect(breakdown.totalScore).toBe(100);
      expect(breakdown.isKeywordDump).toBe(false);
    });

    it('penalizes keyword dumping (3+ technologies with no action/outcome)', () => {
      const dumpBullet = 'Python, Django, React, AWS, Docker, Kubernetes, PostgreSQL.';
      const breakdown = scoreBullet(dumpBullet, CANONICAL_SCORING_SPEC, [
        'Python',
        'Django',
        'React',
        'AWS',
        'Docker',
        'Kubernetes',
        'PostgreSQL',
      ]);

      expect(breakdown.isKeywordDump).toBe(true);
      expect(breakdown.techInContextScore).toBe(8);
      expect(breakdown.actionVerbScore).toBe(0);
      expect(breakdown.outcomeImpactScore).toBe(0);
      expect(breakdown.totalScore).toBe(8);
    });

    it('flags statistically anomalous metrics without changing the numerical score', () => {
      const normalBullet =
        'Optimized database queries in PostgreSQL, improving throughput by 35% resulting in faster reports.';
      const normalScore = scoreBullet(normalBullet, CANONICAL_SCORING_SPEC, ['PostgreSQL']).totalScore;

      const extremeBullet =
        'Optimized database queries in PostgreSQL, improving throughput by +800% resulting in faster reports.';
      const extremeBreakdown = scoreBullet(extremeBullet, CANONICAL_SCORING_SPEC, ['PostgreSQL']);

      expect(extremeBreakdown.implausibleMetricsFlag).toBe(true);
      // Changing metric from 35% to +800% does NOT change the numerical score
      expect(extremeBreakdown.totalScore).toBe(normalScore);
    });

    it('deduplicates identical bullets so they are counted only once', () => {
      const bullets = [
        'Engineered responsive web client in React, boosting user retention by 20% to achieve milestone.',
        'Engineered responsive web client in React, boosting user retention by 20% to achieve milestone.',
        'Engineered responsive web client in React, boosting user retention by 20% to achieve milestone.',
      ];
      const result = scoreBullets(bullets, CANONICAL_SCORING_SPEC, ['React']);
      expect(result.totalUniqueCount).toBe(1);
      expect(result.deduplicatedCount).toBe(2);
    });
  });

  describe('ScoreTrace Zero-Text Invariant (Task 1.3)', () => {
    it('never stores raw resume sentences in rawInputs or pillars', () => {
      const fixture = SYNTHETIC_FIXTURES[0]; // Student Honest Backend
      const context: ScoringContext = {
        experienceLevel: 'Student',
        roleFamily: 'Backend',
        jdPresent: true,
        confirmedRequirements: [
          { id: '1', text: 'Go', category: 'must', confidence: 0.9, inTaxonomy: true },
          { id: '2', text: 'PostgreSQL', category: 'must', confidence: 0.9, inTaxonomy: true },
          { id: '3', text: 'Redis', category: 'preferred', confidence: 0.8, inTaxonomy: true },
        ],
        jdLevel: 'entry',
      };

      const trace = runScoringEngine(
        context,
        {
          rawText: fixture.resumeText,
          sectionsFound: ['Experience', 'Projects', 'Skills', 'Education'],
          experienceBullets: [
            'Built RESTful microservices in Go, serving 10,000 requests/sec with p99 latency under 20ms.',
          ],
          projectBullets: [
            'Developed key-value cache in Go with Redis protocol, reducing disk lookups by 60%.',
          ],
          skillsBlockText: 'Go, PostgreSQL, Redis, Docker, Git',
          hasGithubOrDemoLink: true,
          hasPhoto: false,
          hasDeclaration: false,
          hasFatherNameOrFullAddress: false,
          detectedWordCount: 350,
        },
        { spec: CANONICAL_SCORING_SPEC }
      );

      // Verify trace fields
      expect(trace.specFingerprint.length).toBe(64); // SHA-256 hex string
      expect(trace.composite).toBeGreaterThanOrEqual(0);
      expect(trace.composite).toBeLessThanOrEqual(100);
      expect(trace.band.low).toBeLessThanOrEqual(trace.band.high);

      // Invariant: rawInputs contains ONLY numbers, booleans, and short strings (<= 40 chars)
      for (const pillar of trace.pillars) {
        for (const [key, val] of Object.entries(pillar.rawInputs)) {
          if (typeof val === 'string') {
            expect(val.length).toBeLessThanOrEqual(40);
            expect(val.includes('\n')).toBe(false);
          }
        }
      }
    });
  });
});
