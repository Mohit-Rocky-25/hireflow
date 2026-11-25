// ============================================================
// HIREFLOW ATS — PHASE 10.4 RUNTIME INTEGRATION TESTS
// Verifies Coordinator integration across:
//   - Zero-YOE & NOT_SPECIFIED seniority weight redistribution (experienced & fresher)
//   - Scoped competency tenure in ScoreTrace & result.seniorityFit
//   - Live runAtsEngine metric polarity, Indian currency/INR, "2000 users", LEARNING/ASPIRATIONAL guards
//   - Frozen V2 benchmark parity (PayGrid A=90, Northstar B=88)
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { computeAtsScore } from '@/features/ats/engine/scorer';
import { analyzeStatement } from '@/features/ats/engine/statementExtractor';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';

const ANCHOR_NOV_2024 = new Date(2024, 10, 24);

describe('Phase 10.4 — Runtime Integration (Seniority + Metric Intelligence + Scorer)', () => {
  const experiencedResume = `
Aarav Mehta
aarav.mehta@example.com | +91 98765 43210 | github.com/aaravmehta

SUMMARY
Senior Backend Engineer with 4+ years of production experience building distributed APIs and data systems.

EXPERIENCE
Senior Software Engineer | CloudPulse Labs | Jan 2020 - Present
- Architected Python and FastAPI microservices handling 2000 users and 8,00,000 events/day on AWS.
- Cut annual cloud infrastructure spend from ₹12,50,000 to ₹4,00,000 by tuning RDS read replicas.
- Raised API availability by 4% using circuit breakers and PostgreSQL indexing.

PROJECTS
OpenTelemetry Profiler | Python, Docker
- Built open-source latency profiler for async Python workers.

EDUCATION
B.Tech in Computer Science, IIIT Hyderabad (2015 - 2019)

SKILLS
Python, FastAPI, PostgreSQL, Docker, AWS, Redis
`;

  it('redistributes seniorityFit (0 points) for experienced candidates on explicit 0 YOE and NOT_SPECIFIED JDs', () => {
    const zeroYoeJd = `
Graduate Software Engineer
Experience: 0 years required (Entry-level / Fresher welcome).
Required Skills: Python, PostgreSQL, Docker
`;
    const zeroRes = runAtsEngine(experiencedResume, zeroYoeJd, { today: ANCHOR_NOV_2024 });
    expect(zeroRes.success).toBe(true);
    if (!zeroRes.success) return;

    const zeroTracePillar = zeroRes.result.trace?.pillars.find(p => p.id === 'seniorityFit');
    expect(zeroTracePillar).toBeDefined();
    expect(zeroTracePillar!.applicable).toBe(false);
    expect(zeroTracePillar!.effectiveWeight).toBe(0);
    expect(zeroTracePillar!.contribution).toBe(0);
    expect(zeroRes.result.subscores.seniorityFit).toBe(0);
    expect(zeroRes.result.seniorityFit.requiredYears).toBe(0);

    const unspecifiedJd = `
Software Engineer
Must-have skills: Python, PostgreSQL, Docker
Build reliable REST APIs and maintain production SQL databases.
`;
    const unspecRes = runAtsEngine(experiencedResume, unspecifiedJd, { today: ANCHOR_NOV_2024 });
    expect(unspecRes.success).toBe(true);
    if (!unspecRes.success) return;

    const unspecPillar = unspecRes.result.trace?.pillars.find(p => p.id === 'seniorityFit');
    expect(unspecPillar!.applicable).toBe(false);
    expect(unspecPillar!.effectiveWeight).toBe(0);
    expect(unspecRes.result.subscores.seniorityFit).toBe(0);
  });

  it('aligns result.seniorityFit and ScoreTrace to scoped competency tenure without flattening to total YOE', () => {
    const polyglotResume = `
Neha Kulkarni
neha.k@example.com | +91 98201 11223 | github.com/nehak

SUMMARY
Software Engineer specializing in JVM backends and recently expanding into Python data services.

EXPERIENCE
Software Engineer | FinCore Systems | Jul 2024 - Present
- Built automated ETL validation jobs in Python and Pytest for merchant settlement data.
- Cut batch reconciliation runtime from 90 minutes to 30 minutes across PostgreSQL tables.

Backend Engineer | EnterpriseJava Corp | Jan 2020 - Jun 2024
- Built high-throughput Java and Spring Boot payment gateways handling 12,50,000 daily transactions.
- Reduced p95 JVM API latency from 420ms to 140ms using Redis clustering.

EDUCATION
B.E. in Information Technology, Pune University (2015 - 2019)

SKILLS
Java, Spring Boot, Python, PostgreSQL, Redis, Docker
`;
    const jd = `
Python Platform Engineer
Required: 2+ years of production Python experience.
Must have: Python, PostgreSQL, Redis
`;
    const res = runAtsEngine(polyglotResume, jd, { today: ANCHOR_NOV_2024 });
    expect(res.success).toBe(true);
    if (!res.success) return;

    expect(res.result.seniorityMatchResult?.scope).toBe('PRODUCTION');
    expect(res.result.seniorityMatchResult?.competencyResult?.competencyId).toBe('python');
    expect(res.result.seniorityMatchResult?.isEligible).toBe(false);
    expect(res.result.seniorityFit.requiredYears).toBe(2);
    expect(res.result.seniorityFit.candidateYears).toBeLessThan(1.5);
    expect(res.result.seniorityFit.status).toBe('BELOW_REQUIREMENT');
    expect(res.result.trace?.profileId).toBe('experienced');

    // Also verify non-production SPECIFIC_COMPETENCY scope ("2+ years of Python experience")
    const compJd = `
Python Platform Engineer
Required: 2+ years of Python experience.
Must have: Python, PostgreSQL, Redis
`;
    const compRes = runAtsEngine(polyglotResume, compJd, { today: ANCHOR_NOV_2024 });
    expect(compRes.success).toBe(true);
    if (!compRes.success) return;
    expect(compRes.result.seniorityMatchResult?.scope).toBe('SPECIFIC_COMPETENCY');
    expect(compRes.result.seniorityMatchResult?.competencyResult?.competencyId).toBe('python');
    expect(compRes.result.seniorityFit.candidateYears).toBeLessThan(1.5);
    expect(compRes.result.seniorityFit.status).toBe('BELOW_REQUIREMENT');
  });

  it('credits Indian INR/lakh metrics, "2000 users", and "raised" verbs while blocking negative/learning/aspirational metrics in live Impact scoring', () => {
    const mixedImpactResume = `
Karan Verma
karan.verma@example.com | +91 98111 22334 | github.com/karanv

SUMMARY
Backend Engineer with production experience in Python and PostgreSQL.

EXPERIENCE
Software Engineer | Nimbus Cloud | Jan 2021 - Present
- Engineered Python billing APIs serving 2000 users and processing 8,00,000 events/day.
- Saved INR 12,50,000 annually by eliminating redundant cross-AZ traffic.
- Raised service uptime by 4% via graceful Redis failover.
- Migration temporarily increased error rate by 15% and reduced throughput by 20% during rollout.
- Observed 12% error rate on legacy batch worker.
- Currently learning Rust and planning to introduce Kafka to cut latency from 500ms to 100ms.

EDUCATION
B.Tech in CSE, NIT Surathkal (2016 - 2020)

SKILLS
Python, PostgreSQL, Redis, Rust, Kafka
`;
    const jd = `
Backend Engineer
Required: 2+ years of Python and PostgreSQL experience.
Preferred: Redis
`;
    const res = runAtsEngine(mixedImpactResume, jd, { today: ANCHOR_NOV_2024 });
    expect(res.success).toBe(true);
    if (!res.success) return;

    const trace = res.result.impactTrace || [];
    const positiveQuotes = trace.filter(t => t.credited).map(t => t.sourceQuote.toLowerCase());
    const excludedItems = trace.filter(t => !t.credited);

    expect(positiveQuotes.some(q => q.includes('2000 users'))).toBe(true);
    expect(positiveQuotes.some(q => q.includes('8,00,000'))).toBe(true);
    expect(positiveQuotes.some(q => q.includes('12,50,000'))).toBe(true);

    // Negative transitions, raw error rate, and learning/aspirational clauses must NEVER be credited
    for (const item of excludedItems) {
      expect(item.credited).toBe(false);
    }
    const creditedText = positiveQuotes.join(' | ');
    expect(creditedText).not.toContain('15%');
    expect(creditedText).not.toContain('20%');
    expect(creditedText).not.toContain('12%');
    expect(creditedText).not.toContain('500ms');

    // ScoreTrace arithmetic integrity
    const st = res.result.trace!;
    const sum = Math.round(st.pillars.reduce((acc, p) => acc + p.contribution, 0) * 10) / 10;
    expect(sum).toBe(st.rawSubtotal);
    expect(Math.max(0, Math.min(100, Math.round(st.preClampScore)))).toBe(res.result.score);
  });

  it('guards manually flagged isNegated bullets passed directly to computeAtsScore', () => {
    const score = computeAtsScore({
      wordCount: 300,
      skillResults: [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 5, found: true, evidence: [], proficiency: 3, status: 'verified' }],
      experience: [{
        company: 'Acme',
        title: 'Engineer',
        dateRangeStr: 'Jan 2021 - Present',
        startYear: 2021,
        bullets: [{
          rawText: 'Reduced p95 latency from 500ms to 100ms via Rust.',
          wordCount: 8,
          hasStrongVerb: true,
          hasWeakPhrase: false,
          hasMetric: false,
          hasTechMention: true,
          score: 40,
          issues: [],
          isNegated: true,
        }],
        charStart: 0,
        charEnd: 100,
      }],
      projects: [],
      contactInfo: { name: 'Test', email: 'test@example.com', phone: '9876543210', linkedin: null, github: null, portfolio: null },
      sections: [
        { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Worked', charStart: 0, charEnd: 30 },
        { type: 'education', rawTitle: 'EDUCATION', content: 'B.Tech', charStart: 31, charEnd: 50 },
        { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 51, charEnd: 70 },
      ],
      candidateYears: 3,
      requiredYears: 2,
      targetTier: 'top_product',
    });

    expect(score.impactTrace.some(t => t.credited)).toBe(false);
    expect(score.subscores.impactMetrics).toBe(0);
  });

  it('marks metrics inside LEARNING and ASPIRATIONAL clauses as NEGATED in analyzeStatement() while preserving executed mixed clauses', () => {
    const learningStmt = analyzeStatement('Currently learning Rust by building a toy parser handling 5000 requests/sec', {
      sectionType: 'experience',
    });
    expect(learningStmt.hasMetric).toBe(false);
    expect(learningStmt.metricEvidences?.length).toBeGreaterThanOrEqual(1);
    expect(learningStmt.metricEvidences!.every(m => m.claimSupport === 'NEGATED')).toBe(true);

    const aspirationalStmt = analyzeStatement('Planning to adopt Kubernetes to reduce latency by 40%', {
      sectionType: 'experience',
    });
    expect(aspirationalStmt.hasMetric).toBe(false);
    expect(aspirationalStmt.metricEvidences!.every(m => m.claimSupport === 'NEGATED')).toBe(true);

    const mixedStmt = analyzeStatement('Built REST APIs in Python handling 2000 users; currently learning Go to handle 10000 RPS', {
      sectionType: 'experience',
    });
    expect(mixedStmt.hasMetric).toBe(true);
    const pyMetric = mixedStmt.metricEvidences!.find(m => m.sourceQuote.includes('2000'));
    const goMetric = mixedStmt.metricEvidences!.find(m => m.sourceQuote.includes('10000'));
    expect(pyMetric?.claimSupport).toBe('SUPPORTED');
    expect(goMetric?.claimSupport).toBe('NEGATED');
  });

  it('preserves Frozen V2 Benchmarks A (90) and B (88) intact', () => {
    const resA = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
    const resB = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });
    expect(resA.success).toBe(true);
    expect(resB.success).toBe(true);
    if (!resA.success || !resB.success) return;

    expect(resA.result.score).toBe(90);
    expect(resB.result.score).toBe(88);
  });
});
