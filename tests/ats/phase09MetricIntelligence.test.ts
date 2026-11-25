// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 09
// Impact Metrics Intelligence, Preflight Seniority Reconciliation,
// Adversarial Guards, Export Provenance & Labelled Evaluation Suite
// ============================================================

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  runAtsEngine,
  extractMetricsFromText,
  evaluateResumeImpact,
  evaluateSeniorityFit,
  analyzeBullet,
  computeAtsScore,
} from '@/features/ats/engine';
import {
  createAuthoritativeReportSnapshot,
  serializeSnapshot,
  deserializeSnapshot,
  migrateSnapshot,
} from '@/features/ats/engine/authoritativeSnapshot';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import { buildDossierModel } from '@/features/dossier/dossierModel';
import { generatePdfDossier } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import {
  BENCHMARK_A_V1_SHIPPULSE_RESUME,
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V1_LENDBRIDGE_RESUME,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';
import type { MetricAttributionStatus, MetricCategory, MetricPolarity } from '@/features/ats/engine/metricModel';

async function extractTextFromPdfBytes(pdfBytes: Uint8Array): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes, verbosity: 0 });
  const pdfDoc = await loadingTask.promise;
  let fullText = '';
  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => i.str).join(' ') + '\n';
  }
  return fullText;
}

async function extractDocxDocumentXml(docxBlob: Blob): Promise<string> {
  const buffer = await docxBlob.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) throw new Error('Missing word/document.xml');
  return await xmlFile.async('string');
}

describe('HireFlow ATS Resume Roaster — Phase 09 Metric Intelligence & Preflight Audit', () => {
  const ANCHOR_NOV_2024 = new Date(2024, 10, 24);

  // ============================================================
  // SECTION 2: MANDATORY PREFLIGHT — SENIORITY CONSISTENCY
  // ============================================================
  describe('Preflight: Phase 08.4 Seniority Consistency Reconciliation', () => {
    it('Case A (Rohan V2): year-only 2021-Present (35-46m completed vs 36m req) preserves ambiguity & non-eligibility', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: ANCHOR_NOV_2024,
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const sm = response.result.seniorityMatchResult!;
      expect(sm.minPossibleQualifyingMonths).toBe(36);
      expect(sm.maxPossibleQualifyingMonths).toBe(47);
      expect(sm.minPossibleCompletedQualifyingMonths).toBe(35);
      expect(sm.maxPossibleCompletedQualifyingMonths).toBe(46);
      expect(sm.status).toBe('AMBIGUOUS');
      expect(sm.isEligible).toBe(false);
      expect(sm.scoreFactor).toBe(0.95);
      expect(sm.minCompletedShortfallMonths).toBe(0);
      expect(sm.maxCompletedShortfallMonths).toBe(1);
      expect(sm.explanation).toContain('35m-46m completed');
      expect(sm.explanation).toContain('36m-47m touched');
    });

    it('Case B (Ananya V2): year-only 2022-Present (23-34m completed vs 36m req) avoids optimistic 0.97 & excludes internships', () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: ANCHOR_NOV_2024,
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const sm = response.result.seniorityMatchResult!;
      expect(sm.scope).toBe('PROFESSIONAL');
      expect(sm.minPossibleQualifyingMonths).toBe(24);
      expect(sm.maxPossibleQualifyingMonths).toBe(35);
      expect(sm.minPossibleCompletedQualifyingMonths).toBe(23);
      expect(sm.maxPossibleCompletedQualifyingMonths).toBe(34);
      expect(sm.expectedCompletedMonths).toBe(28.5);
      expect(sm.tenureBreakdown.internshipMonths).toBe(24);
      expect(sm.status).toBe('BELOW_REQUIREMENT');
      expect(sm.isEligible).toBe(false);
      // Midpoint 28.5 / 36 = 0.79 (replaces overstated optimistic 0.97)
      expect(sm.scoreFactor).toBe(0.79);
      expect(sm.shortfallMonths).toBe(8);
      expect(sm.touchedShortfallMonths).toBe(1);
      expect(sm.completedShortfallMonths).toBe(2);
      expect(sm.maxCompletedShortfallMonths).toBe(13);
      expect(sm.explanation).toContain('midpoint 28.5m completed');
      expect(sm.explanation).toContain('excluded from professional eligibility');

      // Monotonicity check: Rohan (35-46m) strictly outscores Ananya (23-34m) on seniorityFit
      const rohanRes = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
      expect(rohanRes.success).toBe(true);
      if (!rohanRes.success) return;
      expect(rohanRes.result.subscores.seniorityFit).toBeGreaterThan(response.result.subscores.seniorityFit);
    });
  });

  // ============================================================
  // SECTION 11A: POSITIVE NATURAL-LANGUAGE EXTRACTION & MATH
  // ============================================================
  describe('Positive Metric Extraction & Derived Mathematical Interpretation', () => {
    it('recognizes baseline-to-result runtime reductions and derives exact delta & %', () => {
      const variants = [
        'Re-architected dbt incremental models, reducing daily pipeline runtime from 94 minutes to 31 minutes.',
        'Runtime decreased from 94 min to 31 min after query plan tuning.',
        'Improved processing time: 94 → 31 minutes across nightly batch jobs.',
      ];

      for (const text of variants) {
        const metrics = extractMetricsFromText(text, { sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' });
        expect(metrics.length).toBeGreaterThanOrEqual(1);
        const m = metrics[0];
        expect(m.baselineValue).toBe(94);
        expect(m.resultValue).toBe(31);
        expect(m.unit).toBe('minutes');
        expect(m.changeType).toBe('DECREASE');
        expect(m.calculatedDelta).toBe(63);
        expect(m.calculatedRelativeChange).toBe(67.02);
        expect(m.polarity).toBe('POSITIVE');
        expect(m.isDerivedMathValid).toBe(true);
        expect(text.slice(m.sourceStart, m.sourceEnd)).toBe(m.sourceQuote);
      }

      // Delta-only phrasing without baseline does NOT invent a baseline or percentage
      const deltaOnly = extractMetricsFromText('Cut processing time by 63 minutes across ETL workflows.');
      expect(deltaOnly).toHaveLength(1);
      expect(deltaOnly[0].isDeltaOnly).toBe(true);
      expect(deltaOnly[0].value).toBe(63);
      expect(deltaOnly[0].unit).toBe('minutes');
      expect(deltaOnly[0].baselineValue).toBeUndefined();
      expect(deltaOnly[0].calculatedRelativeChange).toBeUndefined();
    });

    it('recognizes incident reductions with timeframes across natural-language forms', () => {
      const v1 = extractMetricsFromText('Implemented validation suites, decreasing data incidents from 14 to 5 per month.');
      expect(v1[0].baselineValue).toBe(14);
      expect(v1[0].resultValue).toBe(5);
      expect(v1[0].unit).toBe('incidents');
      expect(v1[0].timeframe).toBe('per_month');
      expect(v1[0].calculatedDelta).toBe(9);
      expect(v1[0].calculatedRelativeChange).toBe(64.29);
      expect(v1[0].metricCategories).toContain('RELIABILITY');

      const v2 = extractMetricsFromText('14 incidents per month reduced to 5 across core payment workers.');
      expect(v2[0].baselineValue).toBe(14);
      expect(v2[0].resultValue).toBe(5);
      expect(v2[0].unit).toBe('incidents');
      expect(v2[0].timeframe).toBe('per_month');
      expect(v2[0].calculatedRelativeChange).toBe(64.29);

      const v3 = extractMetricsFromText('Cut recurring failures by 64% using exponential backoff retry.');
      expect(v3[0].isDeltaOnly).toBe(true);
      expect(v3[0].value).toBe(64);
      expect(v3[0].unit).toBe('%');
    });

    it('recognizes latency reductions with percentiles preserved (p50/p95/p99)', () => {
      const res = extractMetricsFromText('Reduced p95 latency from 640ms to 185ms via Redis read-through caching.');
      expect(res[0].baselineValue).toBe(640);
      expect(res[0].resultValue).toBe(185);
      expect(res[0].unit).toBe('ms');
      expect(res[0].percentile).toBe('p95');
      expect(res[0].calculatedDelta).toBe(455);
      expect(res[0].calculatedRelativeChange).toBe(71.09);
      expect(res[0].metricCategories).toContain('LATENCY');
    });

    it('recognizes scale, throughput, and quality metrics without fabricating improvement percentages', () => {
      const scaleForms = [
        'Processing 18 million records per day across Snowflake tables.',
        'Ingested 18M records/day using Kafka and Spark.',
        'Processed 18,000,000 records daily in partitioned S3 buckets.',
      ];
      for (const s of scaleForms) {
        const res = extractMetricsFromText(s);
        expect(res.length).toBeGreaterThanOrEqual(1);
        expect(res[0].value).toBe(18_000_000);
        expect(res[0].unit).toBe('records');
        expect(res[0].timeframe).toBe('per_day');
        expect(res[0].metricCategory).toBe('SCALE');
        expect(res[0].calculatedRelativeChange).toBeUndefined();
      }

      const dags = extractMetricsFromText('Developed and maintained 35+ production DAGs.');
      expect(dags[0].value).toBe(35);
      expect(dags[0].unit).toBe('dags');
      expect(dags[0].isApproximateLowerBound).toBe(true);
      expect(dags[0].metricCategories).toContain('SCALE');
      expect(dags[0].calculatedRelativeChange).toBeUndefined();

      const cov = extractMetricsFromText('Authored Pytest suite achieving 86% branch coverage.');
      expect(cov[0].value).toBe(86);
      expect(cov[0].unit).toBe('%');
      expect(cov[0].metricCategory).toBe('QUALITY');
      expect(cov[0].calculatedRelativeChange).toBeUndefined();

      // Percentage-point change distinction: 72% -> 86% is +14 pp (+19.44% relative)
      const covChange = extractMetricsFromText('Increased test coverage from 72% to 86% across microservices.');
      expect(covChange[0].changeType).toBe('PERCENTAGE_POINT_CHANGE');
      expect(covChange[0].calculatedPercentagePointDelta).toBe(14);
      expect(covChange[0].calculatedRelativeChange).toBe(19.44);
    });
  });

  // ============================================================
  // SECTION 11B: NEGATIVE, ADVERSARIAL & ATTRIBUTION SAFEGUARDS
  // ============================================================
  describe('Negative, Adversarial & Attribution Safeguards', () => {
    it('rejects dates, tenure years, tech versions, HTTP codes, hashes, and unitless numbers', () => {
      const falsePositives = [
        'Worked as Backend Engineer from June 2021 to May 2023.',
        'Backend Software Engineer with 4+ years of backend software engineering experience.',
        'Migrated APIs from Python 3.11 and React 18 onto PostgreSQL 15, AWS S3, and EC2 with HMAC-SHA256 and HTTP 404 handling.',
        'Upgraded internal SDK to v2.4.0 supporting OAuth 2.0 and TLS 1.3.',
        'Achieved 45 and improved to 100.',
        'Worked 100% remotely across distributed teams.',
      ];

      for (const bullet of falsePositives) {
        const extracted = extractMetricsFromText(bullet);
        expect(extracted).toHaveLength(0);
        expect(analyzeBullet(bullet).hasMetric).toBe(false);
      }
    });

    it('rejects unrelated two numbers, incompatible units, zero baseline division, and bare ambiguous arrows', () => {
      // 1. Two unrelated numbers in one bullet
      const twoNums = extractMetricsFromText('Migrated 12 microservices and onboarded 3 enterprise pipelines.');
      expect(twoNums.every((m) => m.calculatedDelta === undefined)).toBe(true);

      // 2. Incompatible units
      const incomp = extractMetricsFromText('Shifted from 12 seconds to 300 requests.');
      if (incomp.length > 0) {
        expect(incomp[0].isDerivedMathValid).toBe(false);
        expect(incomp[0].calculatedDelta).toBeUndefined();
        expect(incomp[0].polarity).toBe('AMBIGUOUS');
      }

      // 3. Zero baseline (rejects division by zero)
      const zeroBase = extractMetricsFromText('Increased automated alerts from 0 to 50 alerts.');
      expect(zeroBase).toHaveLength(1);
      expect(zeroBase[0].calculatedDelta).toBe(50);
      expect(zeroBase[0].calculatedRelativeChange).toBeUndefined();
      expect(zeroBase[0].uncertaintyNotes?.some((n) => /zero/i.test(n))).toBe(true);

      // 4. Bare ambiguous arrow notation without units
      const bareArrow = extractMetricsFromText('Batch jobs 10 → 20.');
      expect(bareArrow).toHaveLength(0);
    });

    it('preserves negative / worsening outcomes and gives them ZERO positive Impact score credit', () => {
      const worsening = 'System migration caused p95 latency to increase from 120ms to 340ms and incidents rose from 4 to 11 per month.';
      const metrics = extractMetricsFromText(worsening, {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });
      expect(metrics.length).toBeGreaterThanOrEqual(2);
      for (const m of metrics) {
        expect(m.polarity).toBe('NEGATIVE');
      }

      const evalRes = evaluateResumeImpact({
        bullets: [{ rawText: worsening, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' }],
        impactWeight: 15,
        targetTier: 'top_product',
      });
      expect(evalRes.impactMetricsScore).toBe(0);
      expect(evalRes.creditedMetricsCount).toBe(0);
    });

    it('separates candidate attribution, environment maturity (prototype vs production), upper bounds, and JD relevance', () => {
      const direct = extractMetricsFromText('Designed and reduced processing time from 94 minutes to 31 minutes.', {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });
      const team = extractMetricsFromText('Worked with a team that reduced processing time from 94 minutes to 31 minutes.', {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });
      const contrib = extractMetricsFromText('Contributed to reducing processing time from 94 minutes to 31 minutes.', {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });
      const exposure = extractMetricsFromText('Used a system processing 18 million records per day.', {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });
      const proto = extractMetricsFromText('Built personal prototype reducing query latency from 640ms to 185ms.', {
        sourceType: 'PERSONAL_PROJECT',
        environmentMaturity: 'PROTOTYPE',
      });
      const upperBound = extractMetricsFromText('Improved batch response time up to 40%.', {
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
      });

      expect(direct[0].attribution).toBe('DIRECT_OWNERSHIP');
      expect(team[0].attribution).toBe('TEAM_QUALIFIED');
      expect(contrib[0].attribution).toBe('CONTRIBUTED');
      expect(exposure[0].attribution).toBe('EXPOSURE_ONLY');
      expect(proto[0].environmentMaturity).toBe('PROTOTYPE');
      expect(upperBound[0].isUpperBoundedOnly).toBe(true);

      const directScore = evaluateResumeImpact({
        bullets: [{ rawText: direct[0].bulletQuote!, metricEvidences: direct }],
        jdText: 'Backend Engineer working on pipeline processing time',
        impactWeight: 15,
        targetTier: 'top_product',
      });
      const teamScore = evaluateResumeImpact({
        bullets: [{ rawText: team[0].bulletQuote!, metricEvidences: team }],
        jdText: 'Backend Engineer working on pipeline processing time',
        impactWeight: 15,
        targetTier: 'top_product',
      });
      const protoScore = evaluateResumeImpact({
        bullets: [{ rawText: proto[0].bulletQuote!, metricEvidences: proto }],
        jdText: 'Backend Engineer optimizing query latency',
        impactWeight: 15,
        targetTier: 'top_product',
      });
      const irrelevantScore = evaluateResumeImpact({
        bullets: [{ rawText: direct[0].bulletQuote!, metricEvidences: direct }],
        jdText: 'Frontend iOS SwiftUI Mobile Designer UI/UX',
        impactWeight: 15,
        targetTier: 'top_product',
      });

      expect(directScore.impactMetricsScore).toBeGreaterThan(teamScore.impactMetricsScore);
      expect(directScore.impactMetricsScore).toBeGreaterThan(protoScore.impactMetricsScore);
      expect(directScore.impactMetricsScore).toBeGreaterThan(irrelevantScore.impactMetricsScore);
    });

    it('deduplicates repeated and paraphrased metrics and handles negated claims', () => {
      const b1 = 'Re-architected dbt pipelines reducing runtime from 94 minutes to 31 minutes.';
      const b2 = 'Reduced pipeline runtime from 94 min to 31 min via SQL optimization.';

      const single = evaluateResumeImpact({
        bullets: [{ rawText: b1, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' }],
        impactWeight: 15,
        targetTier: 'top_product',
      });
      const repeated = evaluateResumeImpact({
        bullets: [
          { rawText: b1, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' },
          { rawText: b2, sourceType: 'PROFESSIONAL_EXPERIENCE', environmentMaturity: 'PRODUCTION' },
        ],
        impactWeight: 15,
        targetTier: 'top_product',
      });

      expect(repeated.creditedMetricsCount).toBe(1);
      expect(repeated.excludedMetricsCount).toBe(1);
      expect(repeated.impactMetricsScore).toBe(single.impactMetricsScore);

      // Negated claim receives 0 credit
      const negatedEval = evaluateResumeImpact({
        bullets: [
          {
            rawText: 'Never achieved 68% query latency reduction on staging.',
            sourceType: 'PROFESSIONAL_EXPERIENCE',
            environmentMaturity: 'UNKNOWN',
            isNegated: true,
          },
        ],
        impactWeight: 15,
        targetTier: 'top_product',
      });
      expect(negatedEval.impactMetricsScore).toBe(0);
      expect(negatedEval.creditedMetricsCount).toBe(0);
    });

    it('prevents JD numbers, project headings, and bad source offsets from leaking into resume metric provenance', () => {
      const resume = `
Jane Engineer
jane@example.com | +91 98765 43210

EXPERIENCE
Software Engineer | AlphaCorp | Jan 2022 - Oct 2024
- Built FastAPI microservices using PostgreSQL and Docker.

PROJECTS
High-Scale Benchmark 50000 RPS | 2023
- Built personal prototype serving 120 requests per second on localhost.

SKILLS
Python, FastAPI, PostgreSQL, Docker
`.trim();
      const jd = 'Looking for backend engineer managing 999 million requests per day across 500 services.';
      const res = runAtsEngine(resume, jd, { today: ANCHOR_NOV_2024 });
      expect(res.success).toBe(true);
      if (!res.success) return;

      const quotes = (res.result.metricEvidences || []).map((m) => m.sourceQuote.toLowerCase());
      // JD numbers never leak into resume metrics
      expect(quotes.some((q) => q.includes('999 million') || q.includes('500 services'))).toBe(false);
      // Project heading metric never leaks to employment
      expect((res.result.metricEvidences || []).every((m) => !m.documentStart || resume.slice(m.documentStart, m.documentEnd) === m.sourceQuote)).toBe(true);
      const projMetrics = (res.result.metricEvidences || []).filter((m) => m.sectionType === 'projects');
      expect(projMetrics.every((m) => m.sourceType === 'PERSONAL_PROJECT' && m.environmentMaturity === 'PROTOTYPE')).toBe(true);
    });

    it('does not zero out non-quantitative roles with clear qualitative delivery evidence', () => {
      const nonQuantResume = `
Dr. Priya Nair
priya.nair@example.com | +91 99887 66554

EXPERIENCE
Regulatory Compliance Lead | BioHealth Systems | Jan 2020 - Oct 2024
- Authored global regulatory compliance architecture enabling ISO verification across clinical workflows.
- Streamlined cross-border governance review resulting in clean external audit sign-off.
- Automated internal policy sign-off templates compliant with regional medical device mandates.

EDUCATION
M.Tech in Biomedical Engineering | IIT Madras | 2016 - 2018

SKILLS
Compliance, Governance, Auditing, Policy
`.trim();
      const nonQuantJd = 'Regulatory Compliance Lead. Required: 3+ years experience in governance, policy review, and regulatory compliance.';
      const score = computeAtsScore({
        wordCount: 300,
        skillResults: [],
        experience: [
          {
            company: 'BioHealth Systems',
            title: 'Regulatory Compliance Lead',
            dateRangeStr: 'Jan 2020 - Oct 2024',
            bullets: [
              analyzeBullet('Authored global regulatory compliance architecture enabling ISO verification across clinical workflows.'),
              analyzeBullet('Streamlined cross-border governance review resulting in clean external audit sign-off.'),
              analyzeBullet('Automated internal policy sign-off templates compliant with regional medical device mandates.'),
            ],
            charStart: 0,
            charEnd: 300,
          },
        ],
        projects: [],
        contactInfo: { name: 'Dr. Priya Nair', email: 'priya.nair@example.com', phone: '+91 99887 66554', linkedin: null, github: null, portfolio: null },
        sections: [
          { type: 'experience', rawTitle: 'EXPERIENCE', content: '...', charStart: 0, charEnd: 300 },
          { type: 'education', rawTitle: 'EDUCATION', content: 'M.Tech', charStart: 301, charEnd: 330 },
          { type: 'skills', rawTitle: 'SKILLS', content: nonQuantResume, charStart: 331, charEnd: 400 },
        ],
        candidateYears: 4.8,
        requiredYears: 3,
        targetTier: 'service_mnc',
        jdText: nonQuantJd,
      });

      expect(score.subscores.impactMetrics).toBeGreaterThan(0);
      expect(score.trace.pillars.find((p) => p.id === 'impactMetrics')?.flags).toContain('QUALITATIVE_OUTCOME_ROLE_BASELINE');
    });
  });

  // ============================================================
  // SECTION 11C: PROVENANCE, MIGRATION & EXPORT PARITY
  // ============================================================
  describe('Provenance, Snapshot Migration & Full Export Pipeline (V1/V2)', () => {
    it('migrates pre-Phase-09 1.0.0 and legacy snapshots safely without breaking', () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const currentSnapshot = createAuthoritativeReportSnapshot(response.result, BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD);
      // Simulate a pre-Phase-09 1.0.0 snapshot lacking evidence.metrics and scoring.impactTrace
      const prePhase09Snapshot: any = JSON.parse(serializeSnapshot(currentSnapshot));
      delete prePhase09Snapshot.evidence.metrics;
      delete prePhase09Snapshot.scoring.impactTrace;

      const migratedV100 = migrateSnapshot(prePhase09Snapshot);
      expect(migratedV100.schemaVersion).toBe('1.0.0');
      expect(Array.isArray(migratedV100.evidence.metrics)).toBe(true);
      expect(Array.isArray(migratedV100.scoring.impactTrace)).toBe(true);

      // Legacy pre-1.0.0 object migration also preserves empty defaults cleanly
      const legacy = migrateSnapshot({ score: 78, candidateName: 'Ananya Rao', generatedAt: new Date().toISOString() });
      expect(legacy.schemaVersion).toBe('1.0.0');
      expect(legacy.isReconstructed).toBe(true);
      expect(Array.isArray(legacy.evidence.metrics)).toBe(true);
    });

    it('preserves exact Benchmark B metric quotes, derived math, and attribution across Snapshot -> History -> PDF -> DOCX', async () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(response.result, BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        resumeFileName: 'ananya_v2.pdf',
      });
      const restored = deserializeSnapshot(serializeSnapshot(snapshot));

      const runtimeMetric = restored.evidence.metrics?.find((m) => m.sourceQuote.includes('94 minutes to 31 minutes'));
      expect(runtimeMetric).toBeDefined();
      expect(runtimeMetric?.calculatedDelta).toBe(63);
      expect(runtimeMetric?.calculatedRelativeChange).toBe(67.02);
      expect(BENCHMARK_B_V2_DATAFLOW_RESUME.slice(runtimeMetric!.documentStart!, runtimeMetric!.documentEnd!)).toBe(
        runtimeMetric!.sourceQuote
      );

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
      });
      const model = buildDossierModel({
        entry: {
          id: 'hist-p09-b',
          userId: 'u1',
          kind: 'ats_roast',
          createdAt: restored.generatedAt,
          targetKey: 'northstar-de',
          overallScore: restored.scoring.score,
          engineVersion: restored.engineVersion,
          resume: { snapshotHash: 'hb', label: 'ananya_v2.pdf' },
          jd: { snapshotHash: 'hjd', company: 'Northstar Credit', roleTitle: restored.identity.targetRoleTitle },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: restored },
        },
        resumeText: '',
        jdText: '',
        baseline: null,
        generatedAt: restored.generatedAt,
        candidate: { name: 'Ananya Rao' },
        planItems: [],
      });

      const pdfText = await extractTextFromPdfBytes(await generatePdfDossier(model));
      expect(pdfText).toContain('QUANTIFIED IMPACT & OUTCOME METRICS LEDGER');
      expect(pdfText).toContain('from 94 minutes to 31 minutes');
      expect(pdfText).toContain('Derived: -63 minutes (67.02% reduction)');

      const docxXml = await extractDocxDocumentXml(await generateDocxDossier(model));
      expect(docxXml).toContain('LAYER 5B: QUANTIFIED IMPACT &amp; OUTCOME METRICS LEDGER');
      expect(docxXml).toContain('from 94 minutes to 31 minutes');
      expect(docxXml).toContain('Derived: -63 minutes (67.02% reduction)');
      expect(docxXml).toContain('from 14 to 5 per month');
      expect(docxXml).toContain('Derived: -9 incidents (64.29% reduction)');
    });

    it('keeps V1 and V2 frozen benchmarks strictly isolated with zero cross-contamination', () => {
      const aV1 = runAtsEngine(BENCHMARK_A_V1_SHIPPULSE_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
      const aV2 = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
      const bV1 = runAtsEngine(BENCHMARK_B_V1_LENDBRIDGE_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });
      const bV2 = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });

      expect(aV1.success && aV2.success && bV1.success && bV2.success).toBe(true);
      if (!aV1.success || !aV2.success || !bV1.success || !bV2.success) return;

      // ShipPulse (V1) only started June 2025 -> evaluated at Nov 2024 has strictly different seniority vs V2 (2021-Present)
      expect(aV1.result.seniorityMatchResult?.status).not.toBe(aV2.result.seniorityMatchResult?.status);
      // LendBridge (V1) vs DataFlow (V2) stay distinct
      expect(bV1.result.seniorityMatchResult?.shortfallMonths).toBeGreaterThan(bV2.result.seniorityMatchResult?.shortfallMonths || 0);
    });
  });

  // ============================================================
  // SECTION 11D: LABELLED EVALUATION BENCHMARK SET (PRECISION / RECALL / F1)
  // ============================================================
  describe('Labelled Metric Intelligence Evaluation Benchmark (N=30)', () => {
    interface LabelledExpectation {
      id: string;
      patternGroup: 'baseline_result' | 'delta_only' | 'scale_throughput' | 'quality' | 'latency' | 'adversarial_negative';
      text: string;
      expectedSpans: Array<{
        quoteSubstring: string;
        category: MetricCategory;
        polarity: MetricPolarity;
        attribution?: MetricAttributionStatus;
        expectedDelta?: number;
        expectedRelativeChange?: number;
      }>;
    }

    const LABELLED_DATASET: LabelledExpectation[] = [
      { id: 'eval_01', patternGroup: 'baseline_result', text: 'Re-architected dbt models, reducing daily pipeline runtime from 94 minutes to 31 minutes.', expectedSpans: [{ quoteSubstring: 'from 94 minutes to 31 minutes', category: 'OUTCOME', polarity: 'POSITIVE', attribution: 'DIRECT_OWNERSHIP', expectedDelta: 63, expectedRelativeChange: 67.02 }] },
      { id: 'eval_02', patternGroup: 'baseline_result', text: 'Runtime decreased from 94 min to 31 min on Snowflake.', expectedSpans: [{ quoteSubstring: 'from 94 min to 31 min', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 63, expectedRelativeChange: 67.02 }] },
      { id: 'eval_03', patternGroup: 'baseline_result', text: 'Improved processing time: 94 → 31 minutes across nightly ETL.', expectedSpans: [{ quoteSubstring: '94 → 31 minutes', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 63, expectedRelativeChange: 67.02 }] },
      { id: 'eval_04', patternGroup: 'baseline_result', text: 'Decreasing data incidents from 14 to 5 per month via Great Expectations.', expectedSpans: [{ quoteSubstring: 'from 14 to 5 per month', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 9, expectedRelativeChange: 64.29 }] },
      { id: 'eval_05', patternGroup: 'baseline_result', text: 'Monthly incidents decreased from 14 to 5 across production DAGs.', expectedSpans: [{ quoteSubstring: 'from 14 to 5', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 9, expectedRelativeChange: 64.29 }] },
      { id: 'eval_06', patternGroup: 'baseline_result', text: '14 incidents per month reduced to 5 in core billing pipelines.', expectedSpans: [{ quoteSubstring: '14 incidents per month reduced to 5', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 9, expectedRelativeChange: 64.29 }] },
      { id: 'eval_07', patternGroup: 'latency', text: 'Reduced p95 latency from 640ms to 185ms by introducing Redis caching.', expectedSpans: [{ quoteSubstring: 'from 640ms to 185ms', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 455, expectedRelativeChange: 71.09 }] },
      { id: 'eval_08', patternGroup: 'latency', text: 'Optimized API response time from 640 ms to 185 ms under load.', expectedSpans: [{ quoteSubstring: 'from 640 ms to 185 ms', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 455, expectedRelativeChange: 71.09 }] },
      { id: 'eval_09', patternGroup: 'delta_only', text: 'Cut processing time by 63 minutes per nightly batch.', expectedSpans: [{ quoteSubstring: 'Cut processing time by 63 minutes', category: 'OUTCOME', polarity: 'POSITIVE' }] },
      { id: 'eval_10', patternGroup: 'delta_only', text: 'Cut recurring failures by 64% across payment webhooks.', expectedSpans: [{ quoteSubstring: 'Cut recurring failures by 64%', category: 'OUTCOME', polarity: 'POSITIVE' }] },
      { id: 'eval_11', patternGroup: 'delta_only', text: 'Reduced production defects by 20% with automated CI gates.', expectedSpans: [{ quoteSubstring: 'Reduced production defects by 20%', category: 'OUTCOME', polarity: 'POSITIVE' }] },
      { id: 'eval_12', patternGroup: 'delta_only', text: 'Improved response time by 71% using SQL composite indexing.', expectedSpans: [{ quoteSubstring: 'Improved response time by 71%', category: 'OUTCOME', polarity: 'POSITIVE' }] },
      { id: 'eval_13', patternGroup: 'scale_throughput', text: 'Built Spark pipelines handling 18 million records per day.', expectedSpans: [{ quoteSubstring: '18 million records per day', category: 'SCALE', polarity: 'NEUTRAL' }] },
      { id: 'eval_14', patternGroup: 'scale_throughput', text: 'Processed 18M records/day across AWS S3 partitions.', expectedSpans: [{ quoteSubstring: '18M records/day', category: 'SCALE', polarity: 'NEUTRAL' }] },
      { id: 'eval_15', patternGroup: 'scale_throughput', text: 'Processed 18,000,000 records daily in distributed ingestion cluster.', expectedSpans: [{ quoteSubstring: '18,000,000 records daily', category: 'SCALE', polarity: 'NEUTRAL' }] },
      { id: 'eval_16', patternGroup: 'scale_throughput', text: 'Built 35+ production DAGs orchestrating warehouse models.', expectedSpans: [{ quoteSubstring: '35+ production DAGs', category: 'SCALE', polarity: 'NEUTRAL' }] },
      { id: 'eval_17', patternGroup: 'quality', text: 'Authored Pytest suite achieving 86% branch coverage.', expectedSpans: [{ quoteSubstring: '86% branch coverage', category: 'QUALITY', polarity: 'POSITIVE' }] },
      { id: 'eval_18', patternGroup: 'quality', text: 'Increased test coverage from 72% to 86% across services.', expectedSpans: [{ quoteSubstring: 'from 72% to 86%', category: 'OUTCOME', polarity: 'POSITIVE', expectedDelta: 14, expectedRelativeChange: 19.44 }] },
      { id: 'eval_19', patternGroup: 'baseline_result', text: 'Worked with a team that reduced latency from 500ms to 200ms.', expectedSpans: [{ quoteSubstring: 'from 500ms to 200ms', category: 'OUTCOME', polarity: 'POSITIVE', attribution: 'TEAM_QUALIFIED', expectedDelta: 300, expectedRelativeChange: 60 }] },
      { id: 'eval_20', patternGroup: 'baseline_result', text: 'Migration degraded latency from 120ms to 340ms during peak load.', expectedSpans: [{ quoteSubstring: 'from 120ms to 340ms', category: 'OUTCOME', polarity: 'NEGATIVE', expectedDelta: 220, expectedRelativeChange: 183.33 }] },
      // 10 Adversarial negative / non-metric cases
      { id: 'eval_21', patternGroup: 'adversarial_negative', text: 'Employed as Senior Data Engineer from 2021 - Present.', expectedSpans: [] },
      { id: 'eval_22', patternGroup: 'adversarial_negative', text: 'Served from June 2022 to October 2024 in platform team.', expectedSpans: [] },
      { id: 'eval_23', patternGroup: 'adversarial_negative', text: 'Candidate with 3+ years of professional backend experience.', expectedSpans: [] },
      { id: 'eval_24', patternGroup: 'adversarial_negative', text: 'Built REST APIs using Python 3.11, React 18, and PostgreSQL 15.', expectedSpans: [] },
      { id: 'eval_25', patternGroup: 'adversarial_negative', text: 'Configured AWS S3, EC2, TLS 1.3, OAuth 2.0, and HTTP 404 handlers.', expectedSpans: [] },
      { id: 'eval_26', patternGroup: 'adversarial_negative', text: 'Verified HMAC-SHA256 signatures and AES-256 encryption keys.', expectedSpans: [] },
      { id: 'eval_27', patternGroup: 'adversarial_negative', text: 'Upgraded microservice release tag to v2.4.0 cleanly.', expectedSpans: [] },
      { id: 'eval_28', patternGroup: 'adversarial_negative', text: 'Improved internal process from 10 → 20 across squads.', expectedSpans: [] },
      { id: 'eval_29', patternGroup: 'adversarial_negative', text: 'Achieved 45 and delivered 100 in agile sprints.', expectedSpans: [] },
      { id: 'eval_30', patternGroup: 'adversarial_negative', text: 'Collaborated 100% remotely with distributed engineering teams.', expectedSpans: [] },
    ];

    it('computes precision, recall, and F1 >= 0.90 across the 30-item labelled benchmark set', () => {
      let tp = 0;
      let fp = 0;
      let fn = 0;

      const byGroup: Record<string, { tp: number; fp: number; fn: number }> = {};

      for (const sample of LABELLED_DATASET) {
        if (!byGroup[sample.patternGroup]) byGroup[sample.patternGroup] = { tp: 0, fp: 0, fn: 0 };
        const extracted = extractMetricsFromText(sample.text);

        if (sample.expectedSpans.length === 0) {
          if (extracted.length === 0) {
            // True negative
          } else {
            fp += extracted.length;
            byGroup[sample.patternGroup].fp += extracted.length;
          }
          continue;
        }

        const matchedIdx = new Set<number>();
        for (const exp of sample.expectedSpans) {
          const foundIdx = extracted.findIndex((m, idx) => {
            if (matchedIdx.has(idx)) return false;
            const quoteOk = m.sourceQuote.toLowerCase().includes(exp.quoteSubstring.toLowerCase()) ||
              exp.quoteSubstring.toLowerCase().includes(m.sourceQuote.toLowerCase());
            const catOk = m.metricCategory === exp.category || m.metricCategories.includes(exp.category);
            const polOk = m.polarity === exp.polarity;
            const attrOk = !exp.attribution || m.attribution === exp.attribution;
            const deltaOk = exp.expectedDelta === undefined || m.calculatedDelta === exp.expectedDelta;
            const pctOk = exp.expectedRelativeChange === undefined || m.calculatedRelativeChange === exp.expectedRelativeChange;
            return quoteOk && catOk && polOk && attrOk && deltaOk && pctOk;
          });

          if (foundIdx !== -1) {
            matchedIdx.add(foundIdx);
            tp++;
            byGroup[sample.patternGroup].tp++;
          } else {
            fn++;
            byGroup[sample.patternGroup].fn++;
          }
        }

        const extraFp = extracted.length - matchedIdx.size;
        if (extraFp > 0) {
          fp += extraFp;
          byGroup[sample.patternGroup].fp += extraFp;
        }
      }

      const precision = tp / Math.max(1, tp + fp);
      const recall = tp / Math.max(1, tp + fn);
      const f1 = (2 * precision * recall) / Math.max(1e-9, precision + recall);

      console.log(
        `PHASE 09 LABELLED EVALUATION (N=${LABELLED_DATASET.length}): TP=${tp}, FP=${fp}, FN=${fn}, Precision=${precision.toFixed(4)}, Recall=${recall.toFixed(4)}, F1=${f1.toFixed(4)}`
      );
      console.log('GROUP BREAKDOWN:', JSON.stringify(byGroup));

      expect(precision).toBeGreaterThanOrEqual(0.95);
      expect(recall).toBeGreaterThanOrEqual(0.95);
      expect(f1).toBeGreaterThanOrEqual(0.95);
      expect(fp).toBe(0);
      expect(fn).toBe(0);
    });
  });
});
