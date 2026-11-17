import { describe, it, expect } from 'vitest';
import {
  classifyBullet,
  rewriteBullet,
  generateEvidenceSafeRewrites,
  extractCandidateBullets,
  BulletRewrite,
  ALLOWED_CONNECTIVES,
  WEAK_OWNERSHIP_VERBS,
  FORBIDDEN_UPGRADE_VERBS,
} from '../../src/pages/demo/engine/bulletRewriteEngine';
import { validateReport, sanitizeReportPlaceholders } from '../../src/pages/demo/engine/reportValidator';
import { generateImprovementPlan, deepAnalyzeCompetency } from '../../src/pages/demo/talentLensEngine';

describe('Evidence-Safe Bullet Rewrites Engine (Phase 3B)', () => {
  // 40+ Indian campus, internship, hackathon, coursework, run-on, weak verb, and metric bullets
  const SAMPLE_BULLETS: { bullet: string; category: string; expectedClass?: 'strong' | 'improvable' | 'risky' }[] = [
    // 1-5: Internship bullets
    { bullet: 'Developed backend microservices using Java and Spring Boot for transaction processing.', category: 'internship', expectedClass: 'improvable' },
    { bullet: 'Optimized PostgreSQL database queries reducing API latency by 35%.', category: 'internship', expectedClass: 'strong' },
    { bullet: 'Implemented unit and integration tests using JUnit achieving 80% coverage.', category: 'internship', expectedClass: 'strong' },
    { bullet: 'Helped the team with backend services in Python and Flask.', category: 'internship', expectedClass: 'improvable' },
    { bullet: 'Assisted in building REST APIs using Node.js and Express for user onboarding.', category: 'internship', expectedClass: 'improvable' },

    // 6-10: College projects
    { bullet: 'Built in-memory key-value cache with raft consensus and concurrent read replication.', category: 'college-project', expectedClass: 'improvable' },
    { bullet: 'Designed and deployed an e-commerce platform using React, Node.js, and MongoDB.', category: 'college-project', expectedClass: 'improvable' },
    { bullet: 'Developed a distributed web crawler in Go that processed 100,000 URLs per minute.', category: 'college-project', expectedClass: 'strong' },
    { bullet: 'Worked on a library management system using Java Swing and MySQL.', category: 'college-project', expectedClass: 'improvable' },
    { bullet: 'Implemented a chat application using WebSockets and Redis with 500 active users.', category: 'college-project', expectedClass: 'strong' },

    // 11-15: Hackathons
    { bullet: 'Built smart parking IoT dashboard at Smart India Hackathon using React and FastAPI.', category: 'hackathon', expectedClass: 'improvable' },
    { bullet: 'Engineered disaster relief dispatch API with Twilio and PostgreSQL during hackathon.', category: 'hackathon', expectedClass: 'improvable' },
    { bullet: 'Created an automated defect triage bot using Python reducing response time by 45%.', category: 'hackathon', expectedClass: 'strong' },
    { bullet: 'Participated in college hackathon and created healthcare portal using Flutter.', category: 'hackathon', expectedClass: 'improvable' },
    { bullet: 'Won second place at Devpost hackathon by creating a real-time speech translation tool.', category: 'hackathon', expectedClass: 'improvable' },

    // 16-20: Coursework & DSA
    { bullet: 'Implemented graph algorithms including Dijkstra and Prim for network routing simulation.', category: 'coursework', expectedClass: 'improvable' },
    { bullet: 'Completed advanced operating systems coursework implementing Unix shell in C.', category: 'coursework', expectedClass: 'improvable' },
    { bullet: 'Solved over 400 LeetCode problems focusing on dynamic programming and binary trees.', category: 'coursework', expectedClass: 'improvable' },
    { bullet: 'Designed B-tree indexing engine in C++ for database internals assignment.', category: 'coursework', expectedClass: 'improvable' },
    { bullet: 'Benchmarked CPU cache locality comparing array versus linked list traversals.', category: 'coursework', expectedClass: 'improvable' },

    // 21-25: Leadership & Co-curricular
    { bullet: 'Spearheaded technical workshops on Git and Docker for 200 junior engineering students.', category: 'leadership', expectedClass: 'strong' },
    { bullet: 'Led the university ACM student chapter organizing competitive coding contests.', category: 'leadership', expectedClass: 'improvable' },
    { bullet: 'Mentored 15 peer students in data structures and object-oriented programming concepts.', category: 'leadership', expectedClass: 'improvable' },
    { bullet: 'Responsible for organizing college annual technical fest website infrastructure.', category: 'leadership', expectedClass: 'improvable' },
    { bullet: 'Coordinated logistics and corporate sponsorship outreach for departmental symposium.', category: 'leadership', expectedClass: 'improvable' },

    // 26-30: Keyword-stuffed & Run-on bullets (Risky)
    {
      bullet: 'Designed resilient event-driven data pipelines and solved complex DSA problems for algorithmic optimization and system design bottlenecks across distributed clusters',
      category: 'run-on',
      expectedClass: 'risky',
    },
    {
      bullet: 'Java, Python, C++, Go, Kubernetes, Docker, React, Redis, Kafka, PostgreSQL, AWS, Microservices.',
      category: 'keyword-stuffed',
      expectedClass: 'risky',
    },
    {
      bullet: 'Architected full-stack enterprise platform using React, Angular, Node, Spring, Kafka, Redis, Docker, AWS.',
      category: 'keyword-stuffed',
      expectedClass: 'risky',
    },
    {
      bullet: 'Built high-throughput distributed messaging pipeline and optimized low-latency database queries across multi-region Kubernetes clusters with zero downtime deployment.',
      category: 'run-on',
      expectedClass: 'risky',
    },
    {
      bullet: 'Expert in dynamic programming, greedy algorithms, graph theory, system design, microservices, and database tuning.',
      category: 'keyword-stuffed',
      expectedClass: 'risky',
    },

    // 31-35: Bullets with existing metrics
    { bullet: 'Reduced query execution time by 60% by creating composite indexes on PostgreSQL.', category: 'metric', expectedClass: 'strong' },
    { bullet: 'Scaled backend API throughput to 10,000 requests per second with Redis caching.', category: 'metric', expectedClass: 'strong' },
    { bullet: 'Decreased Docker image build time from 15 minutes to 4 minutes using multi-stage builds.', category: 'metric', expectedClass: 'strong' },
    { bullet: 'Improved frontend bundle load latency by 40% utilizing dynamic code splitting in React.', category: 'metric', expectedClass: 'strong' },
    { bullet: 'Automated CI/CD deployment pipeline with GitHub Actions cutting release cycle by 50%.', category: 'metric', expectedClass: 'strong' },

    // 36-42: Weak ownership verbs (Helped, Assisted, Worked on, Supported, Participated)
    { bullet: 'Contributed to open source repository fixing documentation and unit tests.', category: 'weak-verb', expectedClass: 'improvable' },
    { bullet: 'Supported senior engineers in debugging payment gateway timeout exceptions.', category: 'weak-verb', expectedClass: 'improvable' },
    { bullet: 'Involved in requirements gathering and sprint planning meetings for logistics portal.', category: 'weak-verb', expectedClass: 'improvable' },
    { bullet: 'Handled customer bug tickets for billing calculations in MySQL database.', category: 'weak-verb', expectedClass: 'improvable' },
    { bullet: 'Worked with team on containerizing legacy Python applications with Docker.', category: 'weak-verb', expectedClass: 'improvable' },
    { bullet: 'Part of frontend team developing responsive UI components in React.', category: 'weak-verb', expectedClass: 'improvable' },
    { bullet: 'Tasked with reviewing code submissions and maintaining documentation.', category: 'weak-verb', expectedClass: 'improvable' },
  ];

  it('contains at least 40 diverse unit test bullets', () => {
    expect(SAMPLE_BULLETS.length).toBeGreaterThanOrEqual(40);
  });

  describe('Rule 1-7 Verification Across All 42 Bullets', () => {
    SAMPLE_BULLETS.forEach(({ bullet, category, expectedClass }, idx) => {
      it(`Bullet #${idx + 1} (${category}): correctly classifies and satisfies integrity checks`, () => {
        const analysis = classifyBullet(bullet);
        if (expectedClass) {
          expect(analysis.qualityClass).toBe(expectedClass);
        }

        const rewrite = rewriteBullet(bullet);

        // Rule 6: Strong bullets are marked "No change needed"
        if (analysis.qualityClass === 'strong') {
          expect(rewrite.isNoChangeNeeded).toBe(true);
          expect(rewrite.rewrittenBullet).toBe(bullet);
          expect(rewrite.reasons.length).toBeGreaterThan(0);
        }

        // Rule 4: Ownership guard
        const lowerBefore = bullet.toLowerCase();
        const hasWeak = Array.from(WEAK_OWNERSHIP_VERBS).some(
          (w) => lowerBefore.startsWith(w) || lowerBefore.includes(` ${w} `)
        );
        if (hasWeak) {
          // Rewritten bullet must not upgrade to Built, Led, Architected, Designed
          const strippedAfter = rewrite.rewrittenBullet.replace(/\[[^\]]+\]/g, ' ');
          const wordsAfter = strippedAfter.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || [];
          for (const w of wordsAfter) {
            expect(FORBIDDEN_UPGRADE_VERBS.has(w)).toBe(false);
          }
          expect(rewrite.rewrittenBullet).toMatch(/\[add:\s*(?:what you personally built|your specific contribution|personal contribution)[^\]]*\]/i);
        }

        // Rule 3: Check 20 - Zero new digits
        const beforeDigits = new Set(bullet.match(/\d/g) || []);
        const afterDigits: string[] = rewrite.rewrittenBullet.match(/\d/g) || [];
        const newDigits = afterDigits.filter((d: string) => !beforeDigits.has(d));
        expect(newDigits).toHaveLength(0);

        // Check 21: Allowed words or slots
        const stripped = rewrite.rewrittenBullet.replace(/\[[^\]]+\]/g, ' ');
        const contentWords = stripped.match(/\b[a-zA-Z]{2,}\b/g) || [];
        const wordsBefore = new Set(bullet.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || []);
        for (const w of contentWords) {
          const wLower = w.toLowerCase();
          const isAllowed = wordsBefore.has(wLower) || ALLOWED_CONNECTIVES.has(wLower);
          expect(isAllowed).toBe(true);
        }

        // Rule 7: Defend prompt exists
        expect(rewrite.defendPrompt).toBeDefined();
        expect(rewrite.defendPrompt).toMatch(/(?:defend|questions to prepare)/i);
      });
    });
  });

  describe('Run-on Bullet Splitting (Rule 5)', () => {
    it('splits the canonical complex run-on into separate bullets with warnings', () => {
      const runOn =
        'Designed resilient event-driven data pipelines and solved complex DSA problems for algorithmic optimization and system design bottlenecks across distributed clusters';
      const rewrite = rewriteBullet(runOn);

      expect(rewrite.qualityClass).toBe('risky');
      expect(rewrite.warnings).toBeDefined();
      expect(rewrite.warnings!.some((w) => w.includes('distributed clusters: add scale'))).toBe(true);
      expect(rewrite.splitBullets).toBeDefined();
      expect(rewrite.splitBullets!.length).toBeGreaterThanOrEqual(2);
      expect(rewrite.rewrittenBullet).toContain('\n');
    });
  });

  describe('Validator Checks 19-25 Integration', () => {
    const resumeText = `Rahul Verma
Experience:
- Developed backend microservices using Java and Spring Boot for transaction processing.
- Optimized PostgreSQL database queries reducing API latency by 35%.
- Implemented unit and integration tests using JUnit achieving 80% coverage.
- Helped the team with backend services in Python and Flask.
- Worked on a library management system using Java Swing and MySQL.
Projects:
- Built in-memory key-value cache with raft consensus and concurrent read replication.
`;

    it('Check 19 & Check 25: verifies exact substring and max 5 rewrites', () => {
      const rewrites = generateEvidenceSafeRewrites(resumeText, ['java', 'dsa']);
      expect(rewrites.length).toBeLessThanOrEqual(5);

      for (const rw of rewrites) {
        expect(resumeText).toContain(rw.originalBullet);
      }

      const report = {
        score: 54,
        resumeText,
        breakdown: [],
        plans: [],
        projectDrops: [],
        bulletRewrites: rewrites,
      };

      const result = validateReport(report);
      expect(result.violations.filter((v) => v.check === 'before-substring')).toHaveLength(0);
      expect(result.violations.filter((v) => v.check === 'no-new-digits')).toHaveLength(0);
      expect(result.violations.filter((v) => v.check === 'allowed-words-or-slots')).toHaveLength(0);
      expect(result.violations.filter((v) => v.check === 'ownership-guard')).toHaveLength(0);
      expect(result.violations.filter((v) => v.check === 'max-rewrites')).toHaveLength(0);
    });

    it('Check 19 violation triggered when bullet is not in resume', () => {
      const fabricatedRewrite: BulletRewrite = {
        id: 'rw_fake',
        originalBullet: 'Fabricated bullet not in resume text at all',
        rewrittenBullet: 'Fabricated bullet [add: measured result]',
        qualityClass: 'improvable',
        signals: { hasActionVerb: false, hasArtifact: false, hasTechnology: false, hasOutcomeOrMetric: false, matchedTechs: [] },
        reasons: ['Fake'],
        isNoChangeNeeded: false,
      };

      const report = {
        score: 54,
        resumeText,
        breakdown: [],
        plans: [],
        projectDrops: [],
        bulletRewrites: [fabricatedRewrite],
      };

      const result = validateReport(report);
      expect(result.violations.some((v) => v.check === 'before-substring')).toBe(true);
    });

    it('Check 20 violation triggered when new digit is introduced', () => {
      const digitRewrite: BulletRewrite = {
        id: 'rw_digit',
        originalBullet: 'Optimized PostgreSQL database queries reducing API latency by 35%.',
        rewrittenBullet: 'Optimized PostgreSQL database queries reducing API latency by 99%.', // 9 is new
        qualityClass: 'strong',
        signals: { hasActionVerb: true, hasArtifact: true, hasTechnology: true, hasOutcomeOrMetric: true, matchedTechs: [] },
        reasons: ['Strong'],
        isNoChangeNeeded: true,
      };

      const report = {
        score: 54,
        resumeText,
        breakdown: [],
        plans: [],
        projectDrops: [],
        bulletRewrites: [digitRewrite],
      };

      const result = validateReport(report);
      expect(result.violations.some((v) => v.check === 'no-new-digits')).toBe(true);
    });

    it('Check 24: Determinism under shuffled input bullets', () => {
      const orderA = generateEvidenceSafeRewrites(resumeText, ['golang', 'dsa']);

      // Reverse lines of resume
      const shuffledResume = resumeText.split('\n').reverse().join('\n');
      const orderB = generateEvidenceSafeRewrites(shuffledResume, ['golang', 'dsa']);

      expect(orderA.length).toBe(orderB.length);
      for (let i = 0; i < orderA.length; i++) {
        expect(orderA[i].originalBullet).toBe(orderB[i].originalBullet);
        expect(orderA[i].rewrittenBullet).toBe(orderB[i].rewrittenBullet);
      }
    });
  });

  describe('Stage 0 Closes Consistency & Deduplication Test', () => {
    it('proves a project closing two gaps (e.g. Go + DSA) creates one step and no second duplicate step', () => {
      const breakdown = [
        {
          competency: 'golang',
          reqLevel: 'strong',
          analysis: {
            status: 'absent' as const,
            confidence: 0,
            layerScores: { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 },
            evidence: [],
            contextSentences: [],
            gaps: ['No Go evidence'],
          },
        },
        {
          competency: 'dsa',
          reqLevel: 'expert',
          analysis: {
            status: 'absent' as const,
            confidence: 0,
            layerScores: { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 },
            evidence: [],
            contextSentences: [],
            gaps: ['No DSA evidence'],
          },
        },
      ];

      const company = { name: 'CRED', tier: 'Unicorn', industry: 'Fintech' };
      const role = { title: 'Software Engineer Campus Hiring', desc: 'Backend' };

      // Recommended project drops with closes: ['golang', 'dsa']
      const matchedProjects = [
        {
          title: 'Distributed KV Store',
          closes: ['golang', 'dsa'],
          deliverables: ['Go server', 'Raft cluster'],
        },
      ];

      const plans = generateImprovementPlan(
        breakdown as any,
        company,
        role,
        41,
        undefined,
        matchedProjects
      );

      // Verify that "Build Distributed KV Store" was created
      const buildStep = plans.find((p) => p.title.includes('Distributed KV Store'));
      expect(buildStep).toBeDefined();
      expect(buildStep?.hypotheticalScoreGain).toMatch(/Cumulative path:\s*41\s*->\s*45/);

      // Verify that neither GOLANG nor DSA receives a second plan step!
      const duplicateGoStep = plans.filter((p) => p.title === 'Build Evidence for Missing Competency: GOLANG');
      const duplicateDsaStep = plans.filter((p) => p.title === 'Build Evidence for Missing Competency: DSA');

      expect(duplicateGoStep).toHaveLength(0);
      expect(duplicateDsaStep).toHaveLength(0);

      // Total critical steps is 1 (the unified project step)
      const criticalSteps = plans.filter((p) => p.priority === 'critical');
      expect(criticalSteps).toHaveLength(1);
    });
  });

  describe('Stage B: 12 Canonical Rewrite Safety Test Cases', () => {
    const STAGE_B_CASES = [
      {
        id: 1,
        input: 'Helped the team build a payment service',
        expectedClass: 'improvable',
        expectedRewrite: 'Helped the team build a payment service, using [add: technology or framework, if applicable], [add: what you personally built or contributed], with [add: measured metric or user scale, if available].',
        isNoChangeNeeded: false,
      },
      {
        id: 2,
        input: 'Reduced API latency by 40% using Redis caching in a Node.js service',
        expectedClass: 'strong',
        expectedRewrite: 'Reduced API latency by 40% using Redis caching in a Node.js service',
        isNoChangeNeeded: true,
      },
      {
        id: 3,
        input: 'Designed resilient event-driven data pipelines and solved complex DSA problems for algorithmic optimization and system design bottlenecks across distributed clusters',
        expectedClass: 'risky',
        expectedSplitCount: 2,
        isNoChangeNeeded: false,
      },
      {
        id: 4,
        input: 'Worked on a web app using React',
        expectedClass: 'improvable',
        expectedRewrite: 'Worked on a web app using React, [add: what you personally built or contributed], with [add: measured metric or user scale, if available].',
        isNoChangeNeeded: false,
      },
      {
        id: 5,
        input: 'Improved model accuracy from 82% to 91%',
        expectedClass: 'improvable',
        expectedRewrite: 'Improved model accuracy from 82% to 91%, using [add: architecture or framework, if applicable].',
        isNoChangeNeeded: false,
      },
      {
        id: 6,
        input: 'Organised a college fest with 500 attendees',
        expectedClass: 'improvable',
        expectedRewrite: 'Organised a college fest with 500 attendees, [add: specific role or leadership contribution].',
        isNoChangeNeeded: false,
      },
      {
        id: 7,
        input: 'Participated in a hackathon and built a chatbot',
        expectedClass: 'improvable',
        expectedRewrite: 'Participated in a hackathon and built a chatbot, using [add: technology or framework, if applicable], for [add: system or service name, if applicable], [add: what you personally built or contributed], with [add: measured metric or user scale, if available].',
        isNoChangeNeeded: false,
      },
      {
        id: 8,
        input: 'Responsible for backend APIs in Spring Boot and PostgreSQL',
        expectedClass: 'improvable',
        expectedRewrite: 'Responsible for backend APIs in Spring Boot and PostgreSQL, [add: what you personally built or contributed], with [add: measured metric or user scale, if available].',
        isNoChangeNeeded: false,
      },
      {
        id: 9,
        input: 'Led a team of 4 to deliver an inventory app in Flutter',
        expectedClass: 'improvable',
        expectedRewrite: 'Led a team of 4 to deliver an inventory app in Flutter, using [add: architecture or framework, if applicable], with [add: measured metric, if available].',
        isNoChangeNeeded: false,
      },
      {
        id: 10,
        input: 'Contributed to open source projects',
        expectedClass: 'improvable',
        expectedRewrite: 'Contributed to open source projects, [add: what you personally built or contributed], with [add: outcome or impact, if applicable].',
        isNoChangeNeeded: false,
      },
      {
        id: 11,
        input: 'Implemented JWT authentication, role-based access, Docker deployment, CI/CD and unit tests for a REST API',
        expectedClass: 'risky',
        expectedSplitCount: 3,
        isNoChangeNeeded: false,
      },
      {
        id: 12,
        input: 'Part of the robotics club',
        expectedClass: 'improvable',
        expectedRewrite: 'Part of the robotics club, [add: what you personally built or contributed], with [add: event outcome or impact, if applicable].',
        isNoChangeNeeded: false,
      },
    ];

    for (const testCase of STAGE_B_CASES) {
      it(`evaluates bullet #${testCase.id}: "${testCase.input}"`, () => {
        const cls = classifyBullet(testCase.input);
        expect(cls.qualityClass).toBe(testCase.expectedClass);

        const rw = rewriteBullet(testCase.input);
        expect(rw.qualityClass).toBe(testCase.expectedClass);
        expect(rw.isNoChangeNeeded).toBe(testCase.isNoChangeNeeded);

        if (testCase.expectedRewrite) {
          expect(rw.rewrittenBullet).toBe(testCase.expectedRewrite);
        }
        if (testCase.expectedSplitCount) {
          expect(rw.splitBullets).toHaveLength(testCase.expectedSplitCount);
        }

        // Validate through Checks 19-25
        const val = validateReport({ breakdown: [], bulletRewrites: [rw] });
        const rewriteViolations = val.violations.filter((v) =>
          ['before-substring', 'no-new-digits', 'allowed-words-or-slots', 'ownership-guard', 'slot-markers'].includes(v.check)
        );
        expect(rewriteViolations).toHaveLength(0);
      });
    }
  });

  describe('C1: Punctuation, Whitespace, and Special Tech Token Fidelity', () => {
    it('preserves exact spacing and punctuation for .NET ("scalable .NET")', () => {
      const input = 'Architected scalable .NET backend services with SQL Server';
      const rw = rewriteBullet(input);
      expect(rw.rewrittenBullet).toContain('scalable .NET');
      expect(rw.rewrittenBullet).not.toContain('scalable.NET');
      const val = validateReport({ breakdown: [], bulletRewrites: [rw] });
      expect(val.violations.filter((v) => v.check === 'before-substring')).toHaveLength(0);
    });

    it('preserves exact tokens for C++', () => {
      const input = 'Engineered low-latency C++ order matching engine with zero allocations';
      const rw = rewriteBullet(input);
      expect(rw.rewrittenBullet).toContain('C++');
      const val = validateReport({ breakdown: [], bulletRewrites: [rw] });
      expect(val.violations.filter((v) => v.check === 'before-substring')).toHaveLength(0);
    });

    it('preserves exact tokens for C# and ASP.NET Core', () => {
      const input = 'Built enterprise C# ASP.NET Core microservices on Azure';
      const rw = rewriteBullet(input);
      expect(rw.rewrittenBullet).toContain('C#');
      expect(rw.rewrittenBullet).toContain('ASP.NET Core');
      const val = validateReport({ breakdown: [], bulletRewrites: [rw] });
      expect(val.violations.filter((v) => v.check === 'before-substring')).toHaveLength(0);
    });

    it('preserves exact tokens for Node.js and Socket.io', () => {
      const input = 'Developed real-time chat application using Node.js and Socket.io';
      const rw = rewriteBullet(input);
      expect(rw.rewrittenBullet).toContain('Node.js');
      expect(rw.rewrittenBullet).toContain('Socket.io');
      const val = validateReport({ breakdown: [], bulletRewrites: [rw] });
      expect(val.violations.filter((v) => v.check === 'before-substring')).toHaveLength(0);
    });

    it('preserves exact tokens for CI/CD', () => {
      const input = 'Configured automated CI/CD pipeline using GitHub Actions and Docker';
      const rw = rewriteBullet(input);
      expect(rw.rewrittenBullet).toContain('CI/CD');
      const val = validateReport({ breakdown: [], bulletRewrites: [rw] });
      expect(val.violations.filter((v) => v.check === 'before-substring')).toHaveLength(0);
    });

    it('classifies skills-list lines without split, no metric slots, and warning', () => {
      const input = 'Java, Python, C++, Go, Kubernetes, Docker, React, Redis, Kafka, PostgreSQL, AWS, Microservices.';
      const rw = rewriteBullet(input);
      expect(rw.isSkillsList).toBe(true);
      expect(rw.splitBullets).toBeUndefined();
      expect(rw.rewrittenBullet).not.toMatch(/\[add:\s*measured metric/i);
      expect(rw.warnings).toContain('This is a skills list. Technologies belong in project bullets where they were used.');
      const requiredTechs = ['Java', 'Python', 'C++', 'Go', 'Kubernetes', 'Docker', 'React', 'Redis', 'Kafka', 'PostgreSQL', 'AWS'];
      for (const tech of requiredTechs) {
        expect(rw.rewrittenBullet).toContain(tech);
      }
      const val = validateReport({ breakdown: [], bulletRewrites: [rw] });
      expect(val.violations.filter((v) => v.check === 'before-substring')).toHaveLength(0);
    });
  });
});
