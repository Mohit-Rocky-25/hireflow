import { describe, it, expect } from 'vitest';
import { validateReport, sanitizeReportPlaceholders } from '../../src/pages/demo/engine/reportValidator';

// Deep freeze helper to guarantee absolute immutability
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj as any)) {
    const val = (obj as any)[key];
    if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}

describe('Stage E: Validator Hygiene & Immutability Proof', () => {
  it('E.1: proves validateReport NEVER mutates caller input using a deep-frozen report', () => {
    const rawReport = {
      overallScore: 54,
      breakdown: [
        {
          competency: 'java',
          key: 'java',
          status: 'absent',
          score: 0,
          confidenceTag: 'Low',
          evidenceQuotes: [],
        },
        {
          competency: 'communication',
          key: 'communication',
          status: 'not-assessed',
          statusLabel: 'Not assessed',
          score: 70,
          confidenceTag: 'Low',
          evidenceQuotes: [],
        },
      ],
      marketIntel: {
        findings: [
          {
            category: 'java',
            finding: 'No evidence found in the resume for java.',
            evidence: [],
          },
        ],
      },
      learningPath: {
        plans: [
          {
            priority: 'critical',
            title: 'Build Java Service',
            detail: 'Deploy a Java service to demonstrate verified production implementation.',
            hypotheticalScoreGain: '+4 pts (calibrated estimate, per action, not additive; Cumulative path: 54 -> 58; projected if you complete this action, based on the current scoring model)',
          },
        ],
      },
      projectDrops: [
        {
          id: 'brief-fintech-idempotent-ledger',
          title: 'Automated Payment Webhook Reconciliation & Discrepancy Detection Engine',
          domain: 'FinTech',
          estimatedHours: 90,
          hoursDisplay: '~90 hrs',
          relevanceScore: 0.60,
          closes: ['java'],
          coveredSkills: ['Java', 'Spring Boot', 'PostgreSQL'],
          whyThisProject: 'Closes java gap; aligns with FinTech track.',
        },
      ],
      bulletRewrites: [
        {
          id: 'rw_1',
          originalBullet: 'Worked on a web app using React',
          rewrittenBullet: 'Worked on a web app using React, [add: what you personally built], [add: measured result].',
          qualityClass: 'improvable',
          isNoChangeNeeded: false,
        },
      ],
    };

    // Deep freeze the object
    const frozen = deepFreeze(rawReport);

    // validateReport must NOT throw a TypeError from modifying frozen object
    expect(() => validateReport(frozen)).not.toThrow();

    const result = validateReport(frozen);
    console.log('E.1 violations:', result.violations);
    expect(result.isValid).toBe(true);
    expect(result.violations).toHaveLength(0);

    // Prove deep equality before and after
    expect(frozen.overallScore).toBe(54);
    expect(frozen.projectDrops[0].coveredSkills).toEqual(['Java', 'Spring Boot', 'PostgreSQL']);
  });

  it('E.1b: proves sanitizeReportPlaceholders converts {{...}} to [...] on clone without mutating source', () => {
    const rawTemplate = {
      title: 'Build Evidence',
      bulletTemplate: 'Engineered {{module}} using Go, optimizing {{metric}}.',
    };
    const frozenTemplate = deepFreeze(rawTemplate);

    const sanitized = sanitizeReportPlaceholders(frozenTemplate);
    expect(sanitized.bulletTemplate).toBe('Engineered [module] using Go, optimizing [metric].');
    expect(frozenTemplate.bulletTemplate).toBe('Engineered {{module}} using Go, optimizing {{metric}}.');
  });

  describe('E.2: Comprehensive Negative Tests for All Checks 1-25', () => {
    it('Negative Check 1: consistency (flags mismatch between score and band)', () => {
      const badReport = {
        breakdown: [{ competency: 'golang', status: 'absent', score: 0 }],
        marketIntel: {
          findings: [{ category: 'golang', finding: 'Strong signals are present in resume', evidence: ['worked with Go'] }],
        },
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'consistency')).toBe(true);
    });

    it('Negative Check 2: numbers (flags out-of-bounds scores)', () => {
      const badReport = {
        overallScore: 105, // > 100
        breakdown: [],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'numbers')).toBe(true);
    });

    it('Negative Check 3: relevance (flags project below 0.20 threshold)', () => {
      const badReport = {
        projectDrops: [
          { title: 'Low Relevance Project', relevanceScore: 0.15 },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'relevance')).toBe(true);
    });

    it('Negative Check 4: sources (flags ungrounded company statistics)', () => {
      const badReport = {
        companyContext: {
          hires2024: '100 hires', // missing source/period/estimate annotation
        },
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'sources')).toBe(true);
    });

    it('Negative Check 5: templates (flags raw template syntax or soft skill deploying code)', () => {
      const badReport = {
        learningPath: {
          plans: [
            {
              title: 'Build Communication',
              suggestedAction: 'Deploy code project',
              bulletTemplate: 'Deploy {{code}}', // raw double braces
            },
          ],
        },
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'templates')).toBe(true);
    });

    it('Negative Check 6: confidence (flags absent skill with high confidence)', () => {
      const badReport = {
        breakdown: [{ competency: 'react', status: 'absent', score: 0, confidenceTag: 'High' }],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'confidence')).toBe(true);
    });

    it('Negative Check 7: strengths (flags non-demonstrated strength)', () => {
      const badReport = {
        breakdown: [{ competency: 'python', status: 'absent', score: 0 }],
        strengths: ['python'],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'strengths')).toBe(true);
    });

    it('Negative Check 8: parse (flags invalid email format in parseSummary)', () => {
      const badReport = {
        breakdown: [],
        parseSummary: { email: 'invalid-email-no-at-sign' },
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'parse')).toBe(true);
    });

    it('Negative Check 9: not-assessed (flags soft skill marked demonstrated without code claims)', () => {
      const badReport = {
        breakdown: [{ competency: 'leadership', status: 'demonstrated', score: 90 }],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'not-assessed')).toBe(true);
    });

    it('Negative Check 10: dates (flags chronological impossibility)', () => {
      const badReport = {
        asOfDate: '2099-01-01', // future date
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'dates')).toBe(true);
    });

    it('Negative Check 11: anti-gaming (flags uncontextualized keyword stuffing)', () => {
      const badReport = {
        breakdown: [
          {
            competency: 'kubernetes',
            analysis: {
              antiGamingFlag: true,
              evidence: ['deployed, engineered, and scaled production services with zero downtime and verified metrics'],
            },
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'anti-gaming')).toBe(true);
    });

    it('Negative Check 12: evidence (flags evidence quote reused across skills)', () => {
      const badReport = {
        resumeText: 'Real resume with brief text.',
        breakdown: [
          {
            competency: 'golang',
            evidenceQuotes: ['This is a completely fabricated quote that does not exist anywhere in the candidate resume text.'],
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'evidence')).toBe(true);
    });

    it('Negative Check 13: stack-coverage (flags fabricated tech skill)', () => {
      const badReport = {
        projectDrops: [
          {
            id: 'brief-fintech-idempotent-ledger',
            title: 'Immutable Double-Entry General Ledger',
            coveredSkills: ['Ruby On Rails'], // absent from brief tech stack
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'stack-coverage')).toBe(true);
    });

    it('Negative Check 14: coverage (flags project closes skill not in candidate gaps)', () => {
      const badReport = {
        breakdown: [{ competency: 'golang', status: 'absent' }],
        projectDrops: [
          {
            title: 'Some Project',
            closes: ['kubernetes'], // kubernetes is not a gap
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'coverage')).toBe(true);
    });

    it('Negative Check 15: score-path (flags non-monotonic score path)', () => {
      const badReport = {
        overallScore: 50,
        learningPath: {
          plans: [
            { hypotheticalScoreGain: 'Cumulative path: 50 -> 45' }, // drops from 50 to 45
          ],
        },
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'score-path')).toBe(true);
    });

    it('Negative Check 16: project-numbers (flags zero or negative project hours)', () => {
      const badReport = {
        projectDrops: [
          { title: 'Invalid Project', estimatedHours: 0, hoursDisplay: '~0 hrs' },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'project-numbers')).toBe(true);
    });

    it('Negative Check 17: vetted-concepts (flags ungrounded concept tag)', () => {
      const badReport = {
        projectDrops: [
          {
            id: 'brief-fintech-idempotent-ledger',
            title: 'Immutable Double-Entry General Ledger',
            coveredSkills: ['Systems Programming'], // not in techStack and lacks proof in text
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'vetted-concepts')).toBe(true);
    });

    it('Negative Check 18: determinism (flags NaN or non-finite score)', () => {
      const badReport = {
        score: NaN,
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'determinism')).toBe(true);
    });

    it('Negative Check 19: before-substring (flags rewrite of non-existent bullet)', () => {
      const badReport = {
        appendix: { resumeText: 'Real resume text' },
        bulletRewrites: [
          { originalBullet: 'Fabricated bullet point not in resume' },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'before-substring')).toBe(true);
    });

    it('Negative Check 20: no-new-digits (flags rewrite introducing new numbers or number words)', () => {
      const badReport = {
        appendix: { resumeText: 'Built a web application' },
        bulletRewrites: [
          {
            originalBullet: 'Built a web application',
            rewrittenBullet: 'Built a web application with 500 active users', // 500 is new digit
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'no-new-digits')).toBe(true);
    });

    it('Negative Check 21: allowed-words-or-slots (flags forbidden action/outcome words)', () => {
      const badReport = {
        appendix: { resumeText: 'Built a web application' },
        bulletRewrites: [
          {
            originalBullet: 'Built a web application',
            rewrittenBullet: 'Built a web application, deployed to production serving 100 users', // deployed and serving are forbidden action words
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'allowed-words-or-slots')).toBe(true);
      expect(res.violations.some((v) => v.message.includes('Action or outcome word'))).toBe(true);
    });

    it('Negative Check 22: ownership-guard (flags weak verb upgraded without slot)', () => {
      const badReport = {
        appendix: { resumeText: 'Helped the team with backend services' },
        bulletRewrites: [
          {
            originalBullet: 'Helped the team with backend services',
            rewrittenBullet: 'Architected backend services for the team', // improperly upgraded helped to architected
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'ownership-guard')).toBe(true);
    });

    it('Negative Check 23: slot-markers (flags malformed slot syntax)', () => {
      const badReport = {
        appendix: { resumeText: 'Built a web application' },
        bulletRewrites: [
          {
            originalBullet: 'Built a web application',
            rewrittenBullet: 'Built a web application [bad:?!@]',
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'slot-markers')).toBe(true);
    });

    it('Negative Check 24: rewrite-determinism (flags duplicate rewrite IDs)', () => {
      const badReport = {
        appendix: { resumeText: 'Built a web application\nDesigned database schema' },
        bulletRewrites: [
          {
            id: 'rw_dup_1',
            originalBullet: 'Built a web application',
            rewrittenBullet: 'Built a web application [add: detail]',
          },
          {
            id: 'rw_dup_1', // duplicate ID
            originalBullet: 'Designed database schema',
            rewrittenBullet: 'Designed database schema [add: detail]',
          },
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'rewrite-determinism')).toBe(true);
      expect(res.violations.some((v) => v.message.includes('Duplicate rewrite ID'))).toBe(true);
    });

    it('Negative Check 25: max-rewrites (flags more than 5 rewrites in report)', () => {
      const badReport = {
        bulletRewrites: [
          { originalBullet: 'b1' },
          { originalBullet: 'b2' },
          { originalBullet: 'b3' },
          { originalBullet: 'b4' },
          { originalBullet: 'b5' },
          { originalBullet: 'b6' }, // 6th rewrite exceeds max 5
        ],
      };
      const res = validateReport(badReport);
      expect(res.violations.some((v) => v.check === 'max-rewrites')).toBe(true);
    });
  });
});
