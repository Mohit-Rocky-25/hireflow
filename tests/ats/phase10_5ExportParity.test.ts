// ============================================================
// HIREFLOW ATS — PHASE 10.5 EXPORT PARITY & REPORT STATE SUITE
// Verifies Workstream C (C1–C5):
//   - Penalty-aware ReportState & zero double penalty subtraction
//   - Dynamic effective weights (30/20/15/10/10/10/5 & 30/25/15/15/0/10/5) across PDF, DOCX & Markdown
//   - Snapshot round-trip & migration preservation of applicable / notApplicableReason
//   - Full Markdown parity (Seniority integer months, ScoreTrace reconciliation, Layer 5B metrics)
//   - Markdown table cell escaping (|, \r, \n, backticks)
//   - Zero synthetic identity / penalty / seniority / fixFirst fabrication when unresolved/empty
// ============================================================

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { runAtsEngine } from '@/features/ats/engine';
import { buildReportState, assertReportConsistency, getVerdictBand } from '@/features/ats/engine/reportState';
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
import { generateMarkdownDossier, escapeMarkdownCell } from '@/features/dossier/exportDossier';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';
import type { AuditEntry } from '@/domain/types';

const ANCHOR_NOV_2024 = new Date(2024, 10, 24);

async function extractTextFromPdfBytes(pdfBytes: Uint8Array): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBytes, verbosity: 0 });
  const pdfDoc = await loadingTask.promise;
  let fullText = '';
  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const content = await page.getTextContent();
    fullText += content.items.map((i: any) => ('str' in i ? i.str : '')).join(' ') + '\n';
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

describe('Phase 10.5 — Authoritative ReportState, Snapshot, DossierModel & Export Parity', () => {
  describe('C1: Penalty-Aware ReportState & Zero Double Subtraction', () => {
    it('aligns Benchmark A ReportState roundedScore & verdict.band with post-penalty score (96.5 - 7 = 89.5 -> 90)', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: ANCHOR_NOV_2024,
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const { result } = response;
      const rs = result.reportState!;
      expect(rs).toBeDefined();
      expect(result.score).toBe(90);
      expect(rs.scoreLedger.totalEarned).toBe(96.5);
      expect(rs.scoreLedger.totalDeductions).toBe(7);
      expect(rs.scoreLedger.preClampScore).toBe(89.5);
      expect(rs.scoreLedger.roundedScore).toBe(90);
      expect(rs.verdict.band).toBe(getVerdictBand(90));
      expect(rs.verdict.oneParagraphSummary).toContain('90%');

      const check = assertReportConsistency(rs);
      expect(check.valid).toBe(true);
      expect(check.errors).toHaveLength(0);
    });

    it('records 85 - 8 = 77 in buildReportState without double-subtracting penalties', () => {
      const state = buildReportState({
        rawText: 'Jane Doe\njane@example.com\nEXPERIENCE\nEngineer | Acme | 2021 - 2024\n- Built Python APIs.',
        wordCount: 300,
        sections: [
          { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Engineer | Acme | 2021 - 2024', charStart: 27, charEnd: 90 },
        ],
        contactInfo: { name: 'Jane Doe', email: 'jane@example.com', phone: null, linkedin: null, github: null, portfolio: null },
        requiredSkills: [
          { skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 10 },
        ],
        skillResults: [
          { skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 10, found: true, status: 'verified', proficiency: 4, evidence: [] },
        ],
        scoring: {
          score: 77,
          band: 'Competitive',
          headline: '77% ATS Fit Score',
          subscores: {
            mustHaveCoverage: 28,
            evidenceDepth: 17,
            impactMetrics: 12,
            projectsAndOss: 8,
            seniorityFit: 8,
            formatAndParse: 8,
            tierFit: 4,
          },
          rawSubtotal: 85,
          totalBonuses: 0,
          totalDeductions: 8,
          preClampScore: 77,
          wasClamped: false,
          trace: {
            composite: 77,
            rawSubtotal: 85,
            totalBonuses: 0,
            totalDeductions: 8,
            preClampScore: 77,
            wasClamped: false,
          },
          penalties: [
            { id: 'no_contact_info', label: 'Missing Phone', points: -5, reason: 'No phone number' },
            { id: 'missing_education', label: 'Missing Education', points: -3, reason: 'No education section' },
          ],
        },
        fixes: [],
        bullets: [],
        learningPathItems: [],
        rewrites: [],
        seniority: { candidateYears: 3, inferredLevel: 'mid', explanation: '3 years' },
        targetTier: 'top_product',
        roleTitle: 'Backend Engineer',
      });

      expect(state.scoreLedger.totalEarned).toBe(85);
      expect(state.scoreLedger.totalDeductions).toBe(8);
      expect(state.scoreLedger.preClampScore).toBe(77);
      expect(state.scoreLedger.roundedScore).toBe(77);
      expect(state.verdict.band).toBe('Competitive');
      expect(state.verdict.oneParagraphSummary).toContain('77%');
      expect(state.verdict.oneParagraphSummary).toContain('Competitive');
      expect(assertReportConsistency(state).valid).toBe(true);
    });
  });

  describe('C2 & C3: Dynamic Effective Weights & Full Export Parity (Standard & Fresher 0-YOE)', () => {
    it('preserves applicable/notApplicableReason in Snapshot and renders dynamic 30/25/15/15/0/10/5 weights across PDF, DOCX & Markdown', async () => {
      const fresherResume = `
Priya Nair
priya.nair@example.com | +91 98765 43210 | github.com/priyanair

SUMMARY
Final-year Computer Science student focused on Python backend systems and containerization.

PROJECTS
Distributed Task Queue | Python, PostgreSQL, Docker
- Built an async worker queue in Python and PostgreSQL handling 5,000 jobs/min across Docker containers.
- Reduced task retry latency from 420ms to 110ms using exponential backoff and connection pooling.

EDUCATION
B.Tech in Computer Science, NIT Calicut (2021 - 2025)

SKILLS
Python, PostgreSQL, Docker, Linux, Git
`;
      const zeroYoeJd = `
Graduate Backend Engineer
Acme Cloud
Experience: 0 years required (Entry-level / Fresher welcome).
Required Skills: Python, PostgreSQL, Docker
`;

      const response = runAtsEngine(fresherResume, zeroYoeJd, { today: ANCHOR_NOV_2024 });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        fresherResume,
        zeroYoeJd,
        { targetCompany: 'Acme Cloud', targetRole: 'Graduate Backend Engineer', candidateName: 'Priya Nair' }
      );

      // Verify snapshot preserves applicable & notApplicableReason across serialize/deserialize/migrate
      const seniorityDim = snapshot.scoring.dimensions.find((d) => d.id === 'seniorityFit');
      const evidenceDim = snapshot.scoring.dimensions.find((d) => d.id === 'evidenceDepth');
      const projectsDim = snapshot.scoring.dimensions.find((d) => d.id === 'projectsAndOss');
      expect(seniorityDim?.effectiveWeight).toBe(0);
      expect(seniorityDim?.applicable).toBe(false);
      expect(seniorityDim?.notApplicableReason).toBeTruthy();
      expect(Math.round((evidenceDim?.effectiveWeight ?? 0) * 100)).toBe(25);
      expect(Math.round((projectsDim?.effectiveWeight ?? 0) * 100)).toBe(15);

      const restored = deserializeSnapshot(serializeSnapshot(snapshot));
      expect(restored.scoring.dimensions.find((d) => d.id === 'seniorityFit')?.applicable).toBe(false);
      expect(restored.scoring.dimensions.find((d) => d.id === 'seniorityFit')?.notApplicableReason).toBeTruthy();

      const migrated = migrateSnapshot({
        ...JSON.parse(JSON.stringify(snapshot)),
        schemaVersion: '0.9.0',
      });
      expect(migrated.scoring.dimensions.find((d) => d.id === 'seniorityFit')?.applicable).toBe(false);
      expect(migrated.scoring.dimensions.find((d) => d.id === 'seniorityFit')?.effectiveWeight).toBe(0);

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: fresherResume,
        jdText: zeroYoeJd,
        source: 'upload',
        targetCompany: 'Acme Cloud',
        targetRole: 'Graduate Backend Engineer',
        candidateName: 'Priya Nair',
      });

      const model = buildDossierModel({
        entry: {
          id: 'fresher-parity-1',
          schemaVersion: 1,
          runKey: 'f'.repeat(64),
          kind: 'ats_roast',
          createdAt: snapshot.generatedAt,
          targetKey: 'acme:grad',
          overallScore: snapshot.scoring.score,
          engineVersion: snapshot.engineVersion,
          resume: { workspaceId: null, versionId: null, snapshotHash: 'r1', label: 'priya.pdf' },
          jd: { origin: 'uploaded', snapshotHash: 'j1', company: 'Acme Cloud', roleTitle: 'Graduate Backend Engineer' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: restored },
        },
        resumeText: fresherResume,
        jdText: zeroYoeJd,
        baseline: null,
        candidate: { name: 'Priya Nair' },
        planItems: [],
        generatedAt: snapshot.generatedAt,
      });

      expect(model.atsDiagnostics.dimensions?.find((d) => d.id === 'seniorityFit')?.effectiveWeight).toBe(0);

      const md = generateMarkdownDossier(model);
      const pdfText = await extractTextFromPdfBytes(await generatePdfDossier(model));
      const docxXml = await extractDocxDocumentXml(await generateDocxDossier(model));

      // All 3 exports must show redistributed weights (/ 25, / 15, and Seniority N/A / 0%)
      for (const output of [md, pdfText, docxXml]) {
        expect(output).toContain('/ 25 pts');
        expect(output).toContain('25%');
        expect(output).toContain('/ 15 pts');
        expect(output).toContain('15%');
        expect(output).toContain('N/A (Redistributed)');
        expect(output).toContain('0%');
      }
      expect(pdfText).not.toContain('Seniority Alignment & Experience Fit 0 / 10 pts');
      expect(md).not.toContain('**Seniority Alignment & Experience Fit**: 0 / 10 pts');
      expect(docxXml).not.toContain('Seniority Alignment &amp; Experience Fit: 0 / 10 pts');
    });

    it('brings Markdown export into full parity with PDF & DOCX on Benchmark B (Seniority integer months, ScoreTrace, Layer 5B Metrics)', () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: ANCHOR_NOV_2024,
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_B_V2_DATAFLOW_RESUME,
        BENCHMARK_B_JD,
        { targetCompany: 'Northstar Credit', targetRole: 'Data Engineer — Risk & Decisioning', candidateName: 'Ananya Rao' }
      );
      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
        targetCompany: 'Northstar Credit',
        targetRole: 'Data Engineer — Risk & Decisioning',
        candidateName: 'Ananya Rao',
      });

      const model = buildDossierModel({
        entry: {
          id: 'bench-b-md-parity',
          schemaVersion: 1,
          runKey: 'b'.repeat(64),
          kind: 'ats_roast',
          createdAt: snapshot.generatedAt,
          targetKey: 'northstar:de',
          overallScore: snapshot.scoring.score,
          engineVersion: snapshot.engineVersion,
          resume: { workspaceId: null, versionId: null, snapshotHash: 'hb', label: 'ananya.pdf' },
          jd: { origin: 'uploaded', snapshotHash: 'jb', company: 'Northstar Credit', roleTitle: 'Data Engineer — Risk & Decisioning' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: snapshot },
        },
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        baseline: null,
        candidate: { name: 'Ananya Rao' },
        planItems: [],
        generatedAt: snapshot.generatedAt,
      });

      const md = generateMarkdownDossier(model);

      // Standard weights 30/20/15/10/10/10/5
      expect(md).toContain('/ 30 pts (30%)');
      expect(md).toContain('/ 20 pts (20%)');
      expect(md).toContain('/ 15 pts (15%)');
      expect(md).toContain('/ 5 pts (5%)');

      // Seniority integer months & gate parity
      expect(md).toContain('Seniority & Eligibility Assessment');
      expect(md).toContain('BELOW_REQUIREMENT');
      expect(md).toContain('GATE SHORTFALL');
      expect(md).toContain('EXPLICIT_EMPLOYER');
      expect(md).toContain('35m touched, 34m completed vs 36m required, shortfall: 8m');

      // ScoreTrace reconciliation parity
      expect(md).toContain('Raw Subtotal 94.9 pts + Bonuses 0 pts - Deductions 7 pts = 87.9 pts -> Final Score: 88 / 100');

      // Layer 5B Metric Evidence Ledger parity
      expect(md).toContain('Layer 5B: Quantified Impact & Outcome Metrics Ledger');
      expect(md).toContain('CREDITED');
    });

    it('escapes pipes, CR/LF newlines, and backticks in Markdown table cells without breaking columns', () => {
      expect(escapeMarkdownCell('a | b\nc\r\nd `code`')).toBe('a \\| b c d \\`code\\`');

      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: ANCHOR_NOV_2024,
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const baseSnapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      const injectedQuote = 'Built Redis | Kafka\npipeline with `zero` downtime\r\nand 99.9% SLA';
      const snapshotWithSpecialChars = {
        ...baseSnapshot,
        evidence: {
          ...baseSnapshot.evidence,
          citations: [
            {
              ...baseSnapshot.evidence.citations[0],
              originalQuotation: injectedQuote,
            },
          ],
          metrics: [
            {
              ...(baseSnapshot.evidence.metrics?.[0] || {
                id: 'm1',
                sourceStart: 0,
                sourceEnd: 10,
                metricCategory: 'RELIABILITY',
                metricCategories: ['RELIABILITY'],
                attribution: 'DIRECT_INDIVIDUAL',
                polarity: 'POSITIVE',
                sourceType: 'PROFESSIONAL_EXPERIENCE',
                environmentMaturity: 'PRODUCTION',
                creditedInImpact: true,
                impactCredit: 1.0,
                creditDecisionReason: 'Verified metric | `ok`\nline2',
              }),
              sourceQuote: injectedQuote,
            },
          ],
        },
      };

      const model = buildDossierModel({
        entry: {
          id: 'escape-test',
          schemaVersion: 1,
          runKey: 'e'.repeat(64),
          kind: 'ats_roast',
          createdAt: baseSnapshot.generatedAt,
          targetKey: 'paygrid:be',
          overallScore: baseSnapshot.scoring.score,
          engineVersion: baseSnapshot.engineVersion,
          resume: { workspaceId: null, versionId: null, snapshotHash: 'he', label: 'rohan.pdf' },
          jd: { origin: 'uploaded', snapshotHash: 'je', company: 'PayGrid Systems', roleTitle: 'Backend Engineer' },
          breakdown: [],
          gaps: [],
          strengths: [],
          evidence: [],
          findingsJson: { authoritativeSnapshot: snapshotWithSpecialChars },
        },
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
        generatedAt: baseSnapshot.generatedAt,
      });

      const md = generateMarkdownDossier(model);
      // Escaped quote appears on a single table row with escaped pipes and backticks
      expect(md).toContain('Built Redis \\| Kafka pipeline with \\`zero\\` downtime and 99.9% SLA');

      // Every table row in Layer 5 and Layer 5B has exact unescaped column pipe count
      const layer5Section = md.split('### Layer 5: Evidence Provenance & Citation Validation Ledger')[1].split('### Layer 5B:')[0];
      const layer5Rows = layer5Section.trim().split('\n').filter((l) => l.startsWith('|'));
      for (const row of layer5Rows) {
        const unescapedPipes = row.replace(/\\\|/g, '').match(/\|/g)?.length ?? 0;
        expect(unescapedPipes).toBe(5); // 4 columns => 5 pipes
      }

      const layer5BSection = md.split('### Layer 5B: Quantified Impact & Outcome Metrics Ledger')[1].split('\n---\n')[0];
      const layer5BRows = layer5BSection.trim().split('\n').filter((l) => l.startsWith('|'));
      expect(layer5BRows.length).toBeGreaterThanOrEqual(3);
      for (const row of layer5BRows) {
        const unescapedPipes = row.replace(/\\\|/g, '').match(/\|/g)?.length ?? 0;
        expect(unescapedPipes).toBe(6); // 5 columns => 6 pipes
      }
    });
  });

  describe('C5: Zero Synthetic Fabrication When Identity / Penalties / Seniority / Fixes Are Empty', () => {
    it('uses honest unresolved labels and emits zero synthetic penalties, years, or fixFirst placeholders across all exports', async () => {
      const emptyAudit: AuditEntry = {
        schemaVersion: 1,
        id: 'audit-empty-c5',
        kind: 'ats_roast',
        createdAt: '2026-11-26T00:00:00Z',
        engineVersion: '4.0.0',
        runKey: '0'.repeat(64),
        targetKey: 'unresolved:role',
        resume: { workspaceId: null, versionId: null, snapshotHash: 'r0', label: 'upload.pdf' },
        jd: { origin: 'pasted', snapshotHash: 'j0' },
        overallScore: 62,
        breakdown: [],
        gaps: [],
        strengths: [],
        evidence: [],
        findingsJson: {},
        delta: null,
      };

      const model = buildDossierModel({
        entry: emptyAudit,
        resumeText: '',
        jdText: '',
        baseline: null,
        candidate: {},
        planItems: [],
        generatedAt: '2026-11-26T00:00:00Z',
      });

      expect(model.candidate.name).toBe('Unresolved Candidate');
      expect(model.target.company).toBeUndefined();
      expect(model.target.roleTitle).toBe('Unspecified Role');
      expect(model.atsDiagnostics.penalties).toEqual([]);
      expect(model.atsDiagnostics.seniorityMode).toBeUndefined();
      expect(model.atsDiagnostics.fixFirst).toEqual([]);

      const md = generateMarkdownDossier(model);
      const pdfText = await extractTextFromPdfBytes(await generatePdfDossier(model));
      const docxXml = await extractDocxDocumentXml(await generateDocxDossier(model));

      for (const output of [md, pdfText, docxXml]) {
        expect(output).toContain('Unresolved Candidate');
        expect(output).toContain('Unspecified Role');
        expect(output).toContain('Unspecified Employer');
        expect(output).not.toContain('Target Organization');
        expect(output).not.toContain('Missing Production Scale Metrics');
        expect(output).not.toContain('Quantify Engineering Accomplishments with Numerical Indicators');
        expect(output).not.toContain('3 yrs vs Required 4 yrs');
      }
    });

    it('handles buildDossierModel({ entry, resumeText, jdText }) cleanly when optional candidate and generatedAt are omitted', () => {
      const minimalEntry: AuditEntry = {
        schemaVersion: 1,
        id: 'audit-omit-optional',
        kind: 'ats_roast',
        createdAt: '2026-11-26T01:00:00Z',
        engineVersion: '4.0.0',
        runKey: '1'.repeat(64),
        targetKey: 'minimal:role',
        resume: { workspaceId: null, versionId: null, snapshotHash: 'r1', label: 'minimal.pdf' },
        jd: { origin: 'pasted', snapshotHash: 'j1', roleTitle: 'Backend Engineer' },
        overallScore: 70,
        breakdown: [],
        gaps: [],
        strengths: [],
        evidence: [],
        findingsJson: {},
        delta: null,
      };

      const model = buildDossierModel({
        entry: minimalEntry,
        resumeText: '',
        jdText: '',
      });

      expect(model.candidate.name).toBe('Unresolved Candidate');
      expect(model.candidate.email).toBeUndefined();
      expect(model.meta.generatedAt).toBe('2026-11-26T01:00:00Z');
      expect(model.target.roleTitle).toBe('Backend Engineer');
      expect(model.target.company).toBeUndefined();
    });

    it('unwraps AtsEngineResponse cleanly when buildDossierModel falls back to runAtsEngine for legacy findingsJson: {}', () => {
      const legacyEntry: AuditEntry = {
        schemaVersion: 1,
        id: 'audit-legacy-fallback',
        kind: 'ats_roast',
        createdAt: '2026-11-26T02:00:00Z',
        engineVersion: '4.0.0',
        runKey: '2'.repeat(64),
        targetKey: 'paygrid:be',
        resume: { workspaceId: null, versionId: null, snapshotHash: 'r2', label: 'rohan.pdf' },
        jd: { origin: 'pasted', snapshotHash: 'j2', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer' },
        overallScore: 90,
        breakdown: [],
        gaps: [],
        strengths: [],
        evidence: [],
        findingsJson: {},
        delta: null,
      };

      const model = buildDossierModel({
        entry: legacyEntry,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
      });

      expect(model.atsDiagnostics.subscores.mustHaveCoverage).toBe(30);
      expect(model.atsDiagnostics.subscores.impactMetrics).toBe(15);
      expect(model.atsDiagnostics.penalties.length).toBeGreaterThan(0);
      expect(model.atsDiagnostics.skillsInventory.length).toBeGreaterThan(0);
    });
  });
});
