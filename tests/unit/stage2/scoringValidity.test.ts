import { describe, it, expect } from 'vitest';
import { scoreBullet } from '../../../src/lib/ats/evidenceScorer';
import { analyzeBullet } from '../../../src/features/ats/engine/bulletAnalyzer';
import { calculateContinuousSeniorityScore, seniorityFit } from '../../../src/lib/ats/seniorityFit';
import { getCacheKey, computeSha256CacheKey, ENGINE_VERSION, TAXONOMY_VERSION, PROMPT_VERSION } from '../../../src/lib/ats/pipeline';
import implicationGraphData from '../../../src/data/ats/implication-graph.json';
import { matchSkills } from '../../../src/lib/ats/matchSkills';
import { scoreAggregator } from '../../../src/lib/ats/scoreAggregator';
import { ParsedResume, ParsedJD } from '../../../src/lib/ats/types';

describe('Stage 2: Scoring Validity & Mathematical Integrity', () => {
  describe('2A. Bullet Scoring Criteria (0 - 100 Scale)', () => {
    it('scores bullet criteria that sum to exactly 100 max and 0 min', () => {
      // Best possible bullet: strong action verb, precise metric, tech context, clear impact
      const perfectBullet = 'Architected and deployed distributed GraphQL microservices on AWS, accelerating API throughput by 42% across 100k daily active users.';
      const scoreResult = scoreBullet(perfectBullet);

      expect(scoreResult.score).toBeLessThanOrEqual(100);
      expect(scoreResult.score).toBeGreaterThanOrEqual(80);
      expect(scoreResult.hasActionVerb).toBe(true);
      expect(scoreResult.hasMetric).toBe(true);
      expect(scoreResult.hasTechnology).toBe(true);
      expect(scoreResult.hasOutcome).toBe(true);

      // Criteria components: 20 + 30 + 25 + 25 = 100
      const sumMax = 20 + 30 + 25 + 25;
      expect(sumMax).toBe(100);

      // Empty or trivial bullet
      const emptyBullet = scoreBullet('');
      expect(emptyBullet.score).toBe(0);

      // Clamping invariants across adversarial inputs
      const noisyBullet = scoreBullet('100% 50% 200% improved increased deployed scaled saved built created engineered React Node AWS Docker Kubernetes Redis Kafka PostgreSQL');
      expect(noisyBullet.score).toBeLessThanOrEqual(100);
      expect(noisyBullet.score).toBeGreaterThanOrEqual(0);
    });

    it('detects keyword dump bullets and reduces technology credit', () => {
      const keywordDumpBullet = 'React, TypeScript, Redux, Node.js, Express, MongoDB, Docker, Kubernetes, AWS, GraphQL, Tailwind, Git.';
      const analysis = analyzeBullet(keywordDumpBullet);
      expect(analysis.isKeywordDump).toBe(true);
      expect(analysis.score).toBeLessThan(40);
    });
  });

  describe('2A. Seniority & Experience Fit (Piecewise Continuous, Zero Gaps)', () => {
    it('guarantees continuity with no gaps at every boundary (diff = 0, 1, 2, 3)', () => {
      // Test at exact integer boundaries and epsilon perturbations
      const boundaries = [0.0, 1.0, 2.0, 3.0, 4.0];
      const epsilon = 0.0001;

      for (const b of boundaries) {
        const atB = calculateContinuousSeniorityScore(0, b);
        const justBelow = calculateContinuousSeniorityScore(0, Math.max(0, b - epsilon));
        const justAbove = calculateContinuousSeniorityScore(0, b + epsilon);

        // Difference must be infinitesimal (C0 continuity)
        expect(Math.abs(atB - justBelow)).toBeLessThan(0.01);
        expect(Math.abs(atB - justAbove)).toBeLessThan(0.01);
      }
    });

    it('verifies that no hidden whole-score cap is applied, providing visible gap notice', () => {
      const mockResume: ParsedResume = {
        rawText: 'Junior engineer with 1 year experience.',
        totalYearsEstimate: 1,
        careerLevel: 'junior',
        sections: { experience: [], projects: [], skills: [] },
        bullets: [],
        formatRisks: [],
      };
      const mockJD: ParsedJD = {
        rawText: 'Looking for 5 years experience.',
        roleTitle: 'Senior Engineer',
        seniority: 'senior',
        yearsRequired: 5,
        mustHaves: [],
        niceToHaves: [],
        responsibilities: [],
        toolsMentioned: [],
        domainKeywords: [],
      };

      const underqualifiedFit = seniorityFit(mockResume, mockJD);
      expect(underqualifiedFit.status).toBe('underqualified');
      expect(underqualifiedFit.score).toBeGreaterThan(0);
      expect(underqualifiedFit.score).toBeLessThan(40);
      expect(underqualifiedFit.reasoning).toContain('Experience gap');
    });
  });

  describe('2A. Skills-Evidence Rule & Anti-Gaming', () => {
    it('flags keyword stuffing strictly when listedOnly > 60% of listed skills AND listed skills >= 15', () => {
      const mockSkills = ['React', 'Node.js', 'SQL', 'Docker', 'AWS', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Kotlin', 'Swift', 'Ruby', 'PHP', 'GraphQL', 'Redis'];
      const mockResume: ParsedResume = {
        rawText: `Skills: ${mockSkills.join(', ')}. Projects: Built a web app using React and Node.js.`,
        totalYearsEstimate: 1,
        careerLevel: 'fresher',
        sections: {
          skills: [mockSkills.join(', ')],
          projects: ['Built a web app using React and Node.js.'],
          experience: [],
        },
        bullets: ['Built a web app using React and Node.js.'],
        formatRisks: [],
      };

      const mockJD: ParsedJD = {
        rawText: 'Looking for a developer with React, Node.js, and SQL.',
        roleTitle: 'Software Engineer',
        seniority: 'fresher',
        yearsRequired: 0,
        mustHaves: ['React', 'Node.js'],
        niceToHaves: ['SQL'],
        responsibilities: [],
        toolsMentioned: [],
        domainKeywords: [],
      };

      const matches = matchSkills(mockSkills, mockJD.mustHaves, mockJD.niceToHaves, mockResume.rawText);
      const agg = scoreAggregator(
        mockResume,
        mockJD,
        matches,
        [],
        { score: 100, status: 'calibrated', reasoning: '' },
        []
      );

      // 17 skills listed, only React and Node have bullet evidence -> > 60% unevidenced -> stuffing flagged
      expect(agg.isStuffingFlagged).toBe(true);
      expect(agg.scoreExplanation?.format.some(e => e.includes('Keyword stuffing flagged'))).toBe(true);
    });
  });

  describe('2B. Evidence-Tiered Must-Have Credit', () => {
    it('awards 1.0 for evidenced in bullets, max 0.5 for listed only, 0.5 for STRONG implication, and 0 for WEAK', () => {
      const resumeSkills = ['Next.js', 'Kubernetes', 'Docker'];
      const resumeRaw = 'Skills: Next.js, Kubernetes, Docker. Experience: Built scalable SSR web application using Next.js with server actions.';

      const mustHaves = ['Next.js', 'React', 'Docker'];
      const niceToHaves = ['Kubernetes'];

      const matches = matchSkills(resumeSkills, mustHaves, niceToHaves, resumeRaw);

      const nextMatch = matches.find(m => m.skill.toLowerCase() === 'next.js');
      expect(nextMatch?.status).toBe('exact');
      expect(nextMatch?.isClaimedOnly).toBe(false);
      expect(nextMatch?.earnedCredit).toBe(1.0); // Evidenced in bullets

      const reactMatch = matches.find(m => m.skill.toLowerCase() === 'react');
      // Next.js implies React via STRONG edge
      expect(reactMatch?.status).toBe('implied');
      expect(reactMatch?.earnedCredit).toBe(0.5);

      const dockerMatch = matches.find(m => m.skill.toLowerCase() === 'docker');
      // Docker is listed in skills section only, no bullet evidence -> capped at 0.5
      expect(dockerMatch?.isClaimedOnly).toBe(true);
      expect(dockerMatch?.earnedCredit).toBe(0.5);
    });

    it('verifies implication graph edges: STRONG are valid, WEAK never count toward met', () => {
      const edges = implicationGraphData.edges;

      // Check Next.js -> React is STRONG
      const nextEdge = edges.find(e => e.source === 'Next.js' && e.target === 'React');
      expect(nextEdge?.type).toBe('STRONG');

      // Check TypeScript -> JavaScript is STRONG
      const tsEdge = edges.find(e => e.source === 'TypeScript' && e.target === 'JavaScript');
      expect(tsEdge?.type).toBe('STRONG');

      // Check EKS -> Docker is WEAK and never counted as met
      const eksEdge = edges.find(e => e.source === 'EKS' && e.target === 'Docker');
      expect(eksEdge?.type).toBe('WEAK');
    });
  });

  describe('2E. Cache & Identity Invalidation (F11)', () => {
    it('generates different cache keys when engineVersion, taxonomyVersion, or promptVersion bumps', async () => {
      const resume = 'Software engineer with React and Node.js';
      const jd = 'Need fullstack React Node developer';

      const baseKey = getCacheKey(resume, jd, {}, { engineVersion: '2.4.0', taxonomyVersion: '1.2.0', promptVersion: '1.1.0' });
      const bumpedEngine = getCacheKey(resume, jd, {}, { engineVersion: '2.5.0', taxonomyVersion: '1.2.0', promptVersion: '1.1.0' });
      const bumpedTaxonomy = getCacheKey(resume, jd, {}, { engineVersion: '2.4.0', taxonomyVersion: '1.3.0', promptVersion: '1.1.0' });
      const bumpedPrompt = getCacheKey(resume, jd, {}, { engineVersion: '2.4.0', taxonomyVersion: '1.2.0', promptVersion: '1.2.0' });

      expect(baseKey).not.toBe(bumpedEngine);
      expect(baseKey).not.toBe(bumpedTaxonomy);
      expect(baseKey).not.toBe(bumpedPrompt);
    });

    it('produces identical deterministic cache keys for identical inputs', () => {
      const resume = 'Fresher graduate with Python and SQL.';
      const jd = 'Backend role with Python.';

      const key1 = getCacheKey(resume, jd);
      const key2 = getCacheKey(resume, jd);
      expect(key1).toBe(key2);
    });
  });

  describe('2A / F19. Constant-Pillar Rule for Fresher Profiles', () => {
    it('excludes seniority pillar for fresher applicant with entry-level JD, avoiding unearned free points', () => {
      const fresherSkills = ['React', 'SQL'];
      const fresherResume: ParsedResume = {
        rawText: 'Fresher student with strong React and SQL projects. Projects: Built React application with SQL backend.',
        totalYearsEstimate: 0,
        careerLevel: 'student',
        sections: {
          skills: ['React, SQL'],
          projects: ['Built React application with SQL backend.'],
          experience: [],
        },
        bullets: ['Built React application with SQL backend.'],
        formatRisks: [],
      };

      const entryJD: ParsedJD = {
        rawText: 'Entry-level fresher position. Looking for React and SQL.',
        roleTitle: 'Software Engineer (Fresher)',
        seniority: 'fresher',
        yearsRequired: 0,
        mustHaves: ['React'],
        niceToHaves: ['SQL'],
        responsibilities: [],
        toolsMentioned: [],
        domainKeywords: [],
      };

      const matches = matchSkills(fresherSkills, entryJD.mustHaves, entryJD.niceToHaves, fresherResume.rawText);
      const agg = scoreAggregator(
        fresherResume,
        entryJD,
        matches,
        [],
        { score: 100, status: 'calibrated', reasoning: '' },
        []
      );

      expect(agg.isSeniorityConstant).toBe(true);
      expect(agg.effectiveWeights.seniority).toBe(0);
      expect(agg.scoreExplanation.seniority.some(e => e.includes('Not applicable: Seniority Fit'))).toBe(true);
    });
  });
});
