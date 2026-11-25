// ============================================================
// HIREFLOW ATS — PHASE 10.5 SCORING INDEPENDENCE & CROSS-LAYER PARITY TESTS
// Verifies Section 9 scoring independence bounds (respecting documented
// dependencies) + end-to-end Engine <-> QuickRoast <-> ReportState <-> Exports.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import { computeAtsScore } from '@/features/ats/engine/scorer';
import { createAuthoritativeReportSnapshot, deserializeSnapshot, serializeSnapshot } from '@/features/ats/engine/authoritativeSnapshot';
import { buildDossierModel } from '@/features/dossier/dossierModel';
import { generateMarkdownDossier } from '@/features/dossier/exportDossier';
import { generatePdfDossier } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import { atsToAuditInput } from '@/features/ats/journalAdapter';

const ANCHOR_NOV_2024 = new Date(2024, 10, 24);

describe('Phase 10.5 — Scoring Independence & End-to-End Authority Parity', () => {
  it('changing only metric evidence above the saturated Tier Fit threshold does not change Tier Fit', () => {
    const jd = `
Backend Software Engineer
Required: 3+ years of software engineering experience.
Must have: Python, PostgreSQL, Redis, Docker, FastAPI
`;
    const baseResume = `
Candidate One
one@example.com | +91 99999 00001

EXPERIENCE
Backend Engineer | AlphaTech | Jan 2020 - Dec 2023
- Built Python FastAPI APIs integrated with PostgreSQL and Docker.
- Managed Redis read-through cache and automated deployments.
- Cut API latency from 400ms to 120ms using PostgreSQL indexing across core endpoints.
- Reduced monthly failures from 20 to 4 via circuit breakers.
- Processed 15,000+ RPS across billing microservices with 88% test coverage.

EDUCATION
B.Tech in Computer Science (2015 - 2019)

SKILLS
Python, FastAPI, PostgreSQL, Redis, Docker
`;
    const extraMetricResume = baseResume.replace(
      'Processed 15,000+ RPS across billing microservices with 88% test coverage.',
      'Processed 25,000,000 records/day at 15,000+ RPS with 92% branch coverage and saved INR 12,50,000 annually.'
    );

    const r1 = runAtsEngine(baseResume, jd, { today: ANCHOR_NOV_2024 });
    const r2 = runAtsEngine(extraMetricResume, jd, { today: ANCHOR_NOV_2024 });
    expect(r1.success && r2.success).toBe(true);
    if (!r1.success || !r2.success) return;

    // Documented dependency: tierFit saturates at 5/5 once mustMetRatio >= 0.8 AND metricScoreFactor >= 0.7;
    // when extra metric improvements occur beyond that bar, Tier Fit remains completely invariant.
    expect(r1.result.subscores.tierFit).toBe(5);
    expect(r2.result.subscores.tierFit).toBe(5);
  });

  it('changing only candidate identity fields does not alter ScoreTrace, subscores, or composite', () => {
    const jd = `
Backend Engineer
Required: 2+ years of Python and PostgreSQL experience.
`;
    const makeResume = (header: string) => `${header}

EXPERIENCE
Backend Engineer | Zeta Corp | Jan 2021 - Jan 2024
- Built Python services with PostgreSQL reducing query latency from 320ms to 95ms.
- Maintained Docker deployments serving 2000 users.

EDUCATION
B.Tech in CSE (2016 - 2020)

SKILLS
Python, PostgreSQL, Docker
`;
    const resA = runAtsEngine(makeResume('Aarav Sharma\naarav@example.com | +91 98765 43210 | linkedin.com/in/aarav'), jd, { today: ANCHOR_NOV_2024 });
    const resB = runAtsEngine(makeResume('Priya Iyer\npriya.iyer@domain.org | +1 415 555 0199 | github.com/priya'), jd, { today: ANCHOR_NOV_2024 });
    expect(resA.success && resB.success).toBe(true);
    if (!resA.success || !resB.success) return;

    expect(resA.result.score).toBe(resB.result.score);
    expect(resA.result.subscores).toEqual(resB.result.subscores);
    expect(resA.result.trace?.rawSubtotal).toBe(resB.result.trace?.rawSubtotal);
    expect(resA.result.seniorityFit.candidateYears).toBe(resB.result.seniorityFit.candidateYears);
  });

  it('changing only Tier Fit target calibration when Impact units saturate does not change Impact Metrics score', () => {
    const resume = `
Rohan Nair
rohan.nair@example.com | +91 98111 22334

EXPERIENCE
Senior Software Engineer | CoreSystems | Jan 2020 - Dec 2023
- Cut API latency from 640ms to 120ms using Python and Redis read-through caching.
- Reduced monthly production incidents from 18 to 3 via PostgreSQL query tuning.
- Saved INR 14,00,000 annually across distributed Python and AWS payment workers.
- Reduced PostgreSQL query execution errors from 25% to 2% using automated Redis circuit breakers.
- Built Python Pytest suite achieving 91% branch coverage across 40+ production DAGs.

EDUCATION
B.Tech in Computer Science (2015 - 2019)

SKILLS
Python, Redis, PostgreSQL, AWS
`;
    const jd = `
Backend Engineer
Required: 3+ years of Python, PostgreSQL, and Redis experience.
`;
    const topRes = runAtsEngine(resume, jd, { tier: 'top_product', today: ANCHOR_NOV_2024 });
    const svcRes = runAtsEngine(resume, jd, { tier: 'service_mnc', today: ANCHOR_NOV_2024 });
    expect(topRes.success && svcRes.success).toBe(true);
    if (!topRes.success || !svcRes.success) return;

    expect(topRes.result.subscores.impactMetrics).toBe(15);
    expect(svcRes.result.subscores.impactMetrics).toBe(15);
  });

  it('evidence for one competency never inflates an unrelated missing competency', () => {
    const jd = `
Data Platform Engineer
Required: Python, Kubernetes
`;
    const resumeBase = `
Nisha Rao
nisha@example.com | +91 98000 11122

EXPERIENCE
Data Engineer | StreamWorks | Jan 2021 - Dec 2023
- Built Python ETL pipelines processing 12,00,000 events/day with 85% coverage.

EDUCATION
B.E. in CS (2016 - 2020)

SKILLS
Python
`;
    const resumeMoreKafka = `
Nisha Rao
nisha@example.com | +91 98000 11122

EXPERIENCE
Data Engineer | StreamWorks | Jan 2021 - Dec 2023
- Built Python ETL pipelines and Apache Kafka consumers processing 12,00,000 events/day.
- Tuned Kafka partitions and consumer groups reducing lag from 900ms to 80ms.

EDUCATION
B.E. in CS (2016 - 2020)

SKILLS
Python, Kafka
`;
    const r1 = runAtsEngine(resumeBase, jd, { today: ANCHOR_NOV_2024 });
    const r2 = runAtsEngine(resumeMoreKafka, jd, { today: ANCHOR_NOV_2024 });
    expect(r1.success && r2.success).toBe(true);
    if (!r1.success || !r2.success) return;

    const k8s1 = r1.result.skillResults.find(s => s.skillId === 'kubernetes');
    const k8s2 = r2.result.skillResults.find(s => s.skillId === 'kubernetes');
    expect(k8s1?.status).toBe('missing');
    expect(k8s2?.status).toBe('missing');
    expect(k8s2?.proficiency).toBe(0);
    expect(k8s2?.evidence).toEqual([]);
  });

  it('export rendering (Snapshot round-trip, Markdown, PDF, DOCX) never mutates ScoreTrace or claimSupport', async () => {
    const jd = `
Backend Engineer
Required: 0 years experience (Entry-level / Fresher).
Must have: Python, PostgreSQL
`;
    const resume = `
Diya Sen
diya.sen@example.com | +91 98765 11111

SUMMARY
Entry-level software developer building Python REST services.

PROJECTS
LedgerAPI
- Built Python REST API with PostgreSQL achieving 85% coverage across 2000 users.
- Cut local query response times by 45% with composite indexing.

EDUCATION
B.Tech in Computer Science (2020 - 2024)

SKILLS
Python, PostgreSQL
`;
    const engineResp = runAtsEngine(resume, jd, { today: ANCHOR_NOV_2024 });
    expect(engineResp.success).toBe(true);
    if (!engineResp.success) return;

    const { result } = engineResp;
    const beforeTraceJson = JSON.stringify(result.trace);
    const snapshot = deserializeSnapshot(serializeSnapshot(createAuthoritativeReportSnapshot(result, resume, jd, { candidateName: 'Diya Sen' })));
    const auditInput = atsToAuditInput({ result, resumeText: resume, jdText: jd, source: 'paste' });
    const model = buildDossierModel({
      entry: {
        id: 'audit-runtime-parity',
        userId: 'u1',
        kind: 'ats_roast',
        createdAt: snapshot.generatedAt,
        targetKey: 'target-diya',
        overallScore: result.score,
        engineVersion: result.engineVersion || '4.0.0',
        resume: { snapshotHash: snapshot.identity.resumeSha256 || 'r', label: 'diya.pdf' },
        jd: { snapshotHash: snapshot.identity.jdSha256 || 'j', roleTitle: snapshot.identity.targetRoleTitle },
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        strengths: auditInput.strengths,
        evidence: auditInput.evidence,
        findingsJson: { authoritativeSnapshot: snapshot, kind: 'ats_roast' },
      },
      resumeText: resume,
      jdText: jd,
    });

    const md = generateMarkdownDossier(model);
    const pdfBytes = await generatePdfDossier(model);
    const docxBlob = await generateDocxDossier(model);

    expect(pdfBytes.byteLength).toBeGreaterThan(500);
    expect(docxBlob.size).toBeGreaterThan(500);
    expect(md).toContain(`${result.score} / 100`);
    expect(JSON.stringify(result.trace)).toBe(beforeTraceJson);
    expect(result.reportState?.scoreLedger.roundedScore).toBe(result.score);
    expect(result.quickRoast?.finalScore).toBe(result.score);
    expect(result.subscores.seniorityFit).toBe(0);
    expect(result.activeWeights?.seniorityFit).toBe(0);
    expect(result.activeWeights?.evidenceDepth).toBe(25);
    expect(result.activeWeights?.projectsAndOss).toBe(15);

    // Persisted AuditEntry breakdown uses normalized 0-100 scores and dynamic redistributed weights
    expect(auditInput.breakdown.some((b) => b.key === 'seniorityFit' || b.key === 'seniority_fit')).toBe(false);
    expect(auditInput.breakdown.find((b) => b.key === 'evidenceDepth')?.weight).toBe(0.25);
    expect(auditInput.breakdown.find((b) => b.key === 'projectsAndOss')?.weight).toBe(0.15);
    const mustRawScore = Math.round(result.trace!.pillars.find((p) => p.id === 'mustHaveCoverage')!.rawScore);
    expect(auditInput.breakdown.find((b) => b.key === 'mustHaveCoverage')?.score).toBe(mustRawScore);
    expect(mustRawScore).toBe(50);
  });

  it('seniority weight redistribution follows activeWeights policy cleanly', () => {
    const exp = [{
      company: 'Acme',
      title: 'Engineer',
      dateRangeStr: '2021 - 2024',
      startYear: 2021,
      endYear: 2024,
      bullets: [{ rawText: 'Built Python API', wordCount: 3, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: false, hasTechMention: true, score: 70, issues: [] }],
      charStart: 0,
      charEnd: 60,
    }];
    const skills = [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must' as const, weight: 5, found: true, evidence: [], proficiency: 3, status: 'verified' as const }];
    const contact = { name: 'Alex', email: 'a@example.com', phone: '9876543210', linkedin: null, github: null, portfolio: null };
    const sections = [
      { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Python', charStart: 0, charEnd: 10 },
      { type: 'education', rawTitle: 'EDUCATION', content: 'B.Tech', charStart: 11, charEnd: 20 },
      { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 21, charEnd: 30 },
    ];

    const zeroReq = computeAtsScore({ wordCount: 350, skillResults: skills, experience: exp, projects: [], contactInfo: contact, sections, candidateYears: 3, requiredYears: 0, targetTier: 'top_product' });
    const req3Y = computeAtsScore({ wordCount: 350, skillResults: skills, experience: exp, projects: [], contactInfo: contact, sections, candidateYears: 3, requiredYears: 3, targetTier: 'top_product' });

    expect(zeroReq.activeWeights.seniorityFit).toBe(0);
    expect(zeroReq.activeWeights.evidenceDepth).toBe(25);
    expect(zeroReq.activeWeights.projectsAndOss).toBe(15);
    expect(req3Y.activeWeights.seniorityFit).toBe(10);
    expect(req3Y.activeWeights.evidenceDepth).toBe(20);
    expect(req3Y.activeWeights.projectsAndOss).toBe(10);
  });
});
