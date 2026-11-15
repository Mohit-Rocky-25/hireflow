import { describe, it, expect } from 'vitest';
import {
  classifyBullet,
  rewriteBullet,
  ALLOWED_CONNECTIVES,
  FORBIDDEN_ACTION_OUTCOME_WORDS,
  WEAK_OWNERSHIP_VERBS,
  FORBIDDEN_UPGRADE_VERBS,
} from '../../src/pages/demo/engine/bulletRewriteEngine';
import { validateReport } from '../../src/pages/demo/engine/reportValidator';

describe('Stage B.4 / AC2: Held-Out Programmatic Bullet Safety Test Suite (120+ Bullets)', () => {
  // Generate 125 diverse held-out bullets across 5 campus categories
  const HELD_OUT_BULLETS: Array<{ bullet: string; category: string; mutation: string }> = [];

  const VERBS = ['Developed', 'Built', 'Engineered', 'Designed', 'Implemented', 'Created'];
  const WEAK_VERBS = [
    'Helped the team develop',
    'Assisted in building',
    'Supported senior engineers with',
    'Worked on',
    'Participated in developing',
    'Part of team building',
    'Contributed to',
    'Tasked with implementing',
  ];
  const ARTIFACTS = ['microservice', 'REST API', 'backend pipeline', 'web application', 'caching layer', 'database subsystem'];
  const TECHS = [
    ['Java', 'Spring Boot'],
    ['Python', 'FastAPI'],
    ['Go', 'gRPC'],
    ['TypeScript', 'React'],
    ['PostgreSQL', 'Redis'],
    ['Docker', 'Kubernetes'],
  ];
  const METRICS = ['reducing latency by 30%', 'serving 500 active users', 'processing 1000 records per minute', 'saving 4 hours per release'];

  // 1. Internship Bullets (25 bullets)
  for (let i = 0; i < 25; i++) {
    const isWeak = i % 2 === 0;
    const hasMetric = i % 3 === 0;
    const verb = isWeak ? WEAK_VERBS[i % WEAK_VERBS.length] : VERBS[i % VERBS.length];
    const art = ARTIFACTS[i % ARTIFACTS.length];
    const techPair = TECHS[i % TECHS.length].join(' and ');
    const metric = hasMetric ? ` ${METRICS[i % METRICS.length]}` : '';
    const bullet = `${verb} ${art} using ${techPair}${metric}.`;
    HELD_OUT_BULLETS.push({
      bullet,
      category: 'internship',
      mutation: isWeak ? 'weak-verb' : hasMetric ? 'metric' : 'standard',
    });
  }

  // 2. College Project Bullets (25 bullets)
  const PROJECT_DOMAINS = [
    'in-memory key-value store with replication',
    'distributed log aggregation server',
    'full-stack campus marketplace',
    'smart home IoT telemetry dashboard',
    'compiler tokenizer and recursive descent parser',
  ];
  for (let i = 0; i < 25; i++) {
    const isWeak = i % 3 === 0;
    const verb = isWeak ? 'Worked on' : 'Constructed';
    const dom = PROJECT_DOMAINS[i % PROJECT_DOMAINS.length];
    const tech = TECHS[i % TECHS.length][0];
    const bullet = `${verb} ${dom} using ${tech}.`;
    HELD_OUT_BULLETS.push({
      bullet,
      category: 'college-project',
      mutation: isWeak ? 'weak-verb' : 'standard',
    });
  }

  // 3. Hackathon Bullets (25 bullets)
  const HACKATHON_PROJECTS = [
    'emergency blood donor matching platform',
    'traffic congestion prediction tool',
    'automated code review assistant',
    'peer-to-peer file sharing protocol',
    'smart waste management system',
  ];
  for (let i = 0; i < 25; i++) {
    const isWeak = i % 2 === 1;
    const prefix = isWeak ? 'Participated in a hackathon and built' : 'Won hackathon prize by engineering';
    const proj = HACKATHON_PROJECTS[i % HACKATHON_PROJECTS.length];
    const tech = TECHS[i % TECHS.length].join(', ');
    const bullet = `${prefix} ${proj} in ${tech}.`;
    HELD_OUT_BULLETS.push({
      bullet,
      category: 'hackathon',
      mutation: isWeak ? 'weak-verb' : 'award',
    });
  }

  // 4. Coursework & DSA Bullets (25 bullets)
  const COURSEWORK_TOPICS = [
    'implemented red-black tree and AVL tree rotations',
    'solved dynamic programming knapsack and shortest path algorithms',
    'benchmarked concurrent lock-free queue against mutex queue',
    'designed multi-threaded web server handling thread pools',
    'built lexical analyzer for subset of C grammar',
  ];
  for (let i = 0; i < 25; i++) {
    const topic = COURSEWORK_TOPICS[i % COURSEWORK_TOPICS.length];
    const lang = ['C++', 'Java', 'Python', 'Go'][i % 4];
    const bullet = `Completed systems programming coursework and ${topic} in ${lang}.`;
    HELD_OUT_BULLETS.push({
      bullet,
      category: 'coursework',
      mutation: 'dsa',
    });
  }

  // 5. Leadership & Extracurriculars & Multi-Claim Bullets (25 bullets)
  const ACTIVITIES = [
    'Organized university annual hackathon with 400 participants',
    'Led college coding club conducting weekly problem solving sessions',
    'Volunteered as student placement coordinator managing campus recruitment logistics',
    'Coordinated departmental robotics exhibition demonstrating autonomous line follower bot',
    'Mentored junior students in data structures and object oriented programming',
  ];
  for (let i = 0; i < 15; i++) {
    const act = ACTIVITIES[i % ACTIVITIES.length];
    HELD_OUT_BULLETS.push({
      bullet: act,
      category: 'leadership',
      mutation: 'extracurricular',
    });
  }

  // Multi-claim and long technology list mutations (10 bullets)
  const MULTI_CLAIM_BULLETS = [
    'Implemented user authentication, role-based authorization, rate limiting, and password hashing for banking API',
    'Built real-time messaging pipeline, notification delivery service, push dispatch queue, and audit log daemon',
    'Designed scalable microservices platform, automated container builds, configured Helm charts, and wrote integration tests',
    'Engineered payment webhook listener, reconciliation ledger, refund dispatcher, and daily settlement cron job',
    'Configured Kafka topics, consumer groups, dead letter queues, and prometheus monitoring metrics for streaming pipeline',
    'Developed admin analytics dashboard, CSV export pipeline, user activity monitor, and email notification sender',
    'Created REST APIs, database migration scripts, Docker compose setup, and unit test coverage for inventory management',
    'Implemented OAuth2 login, JWT token verification, session management, and Redis caching for ecommerce backend',
    'Built customer support portal, ticket routing engine, SLA escalation daemon, and feedback reporting service',
    'Engineered IoT device registry, telemetry ingestion gateway, time-series storage, and alerting rule evaluator',
  ];
  for (const m of MULTI_CLAIM_BULLETS) {
    HELD_OUT_BULLETS.push({
      bullet: m,
      category: 'multi-claim',
      mutation: 'long-tech-or-concept-list',
    });
  }

  it('generates at least 120 held-out bullets', () => {
    expect(HELD_OUT_BULLETS.length).toBeGreaterThanOrEqual(120);
    console.log(`[AC2] Total held-out bullets generated: ${HELD_OUT_BULLETS.length}`);
  });

  describe('Strict Zero-Violation Property Verification (Checks 19-22)', () => {
    let totalEvaluated = 0;
    let totalViolations = 0;

    HELD_OUT_BULLETS.forEach(({ bullet, category, mutation }, idx) => {
      it(`Held-out #${idx + 1} [${category} / ${mutation}]: satisfies Checks 19-22 with 0 violations`, () => {
        totalEvaluated++;
        const rw = rewriteBullet(bullet);

        // 1. Report Validator Checks 19-25
        const fakeReport = {
          appendix: { resumeText: bullet },
          breakdown: [],
          bulletRewrites: [rw],
        };
        const val = validateReport(fakeReport);
        const violations = val.violations.filter((v) =>
          ['before-substring', 'no-new-digits', 'allowed-words-or-slots', 'ownership-guard', 'slot-markers'].includes(v.check)
        );

        if (violations.length > 0) {
          totalViolations += violations.length;
          console.error(`[VIOLATION] Bullet #${idx + 1}: "${bullet}" -> "${rw.rewrittenBullet}"`, violations);
        }
        expect(violations).toHaveLength(0);

        // 2. Property: No forbidden action or outcome words outside slots unless in original bullet
        const allAfterTexts = [rw.rewrittenBullet, ...(rw.splitBullets || [])];
        for (const text of allAfterTexts) {
          const stripped = text.replace(/\[(?:add|warning|note|fill-in):[^\]]+\]|\[[^\]]+\]/gi, ' ');
          const words = stripped.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || [];
          const beforeWords = new Set(bullet.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || []);

          for (const w of words) {
            if (FORBIDDEN_ACTION_OUTCOME_WORDS.has(w) && !beforeWords.has(w)) {
              expect.fail(`Introduced forbidden action/outcome asserting word "${w}" into bullet #${idx + 1}`);
            }
            const isAllowed = beforeWords.has(w) || ALLOWED_CONNECTIVES.has(w);
            expect(isAllowed).toBe(true);
          }
        }

        // 3. Property: No new digits
        const beforeDigits = new Set(bullet.match(/\d/g) || []);
        for (const text of allAfterTexts) {
          const afterDigits: string[] = text.match(/\d/g) || [];
          const newDigits = afterDigits.filter((d) => !beforeDigits.has(d));
          expect(newDigits).toHaveLength(0);
        }

        // 4. Property: Weak ownership verb never upgraded to strong verb absent from original
        const lowerBefore = bullet.toLowerCase();
        const hasWeak = Array.from(WEAK_OWNERSHIP_VERBS).some(
          (wv) => lowerBefore.startsWith(wv) || lowerBefore.includes(` ${wv} `)
        );
        const beforeWords = new Set(bullet.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || []);
        if (hasWeak) {
          for (const text of allAfterTexts) {
            const stripped = text.replace(/\[[^\]]+\]/g, ' ');
            const wordsAfter = stripped.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || [];
            for (const aw of wordsAfter) {
              if (!beforeWords.has(aw)) {
                expect(FORBIDDEN_UPGRADE_VERBS.has(aw)).toBe(false);
              }
            }
          }
        }
      });
    });
  });
});
