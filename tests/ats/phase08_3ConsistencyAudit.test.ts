// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 08.3
// Final Score Reconciliation, Seniority Consistency & Export Provenance Audit
// Verifies Gate 1-6: Historical score reconciliation, complete mathematical ScoreTrace,
// Northstar integer-month seniority & eligibility consistency, Snapshot ID entropy,
// granular Phase 05 citation preservation, and full Scan -> Snapshot -> History -> PDF/DOCX parity.
// ============================================================

import { describe, it, expect, vi, afterEach } from 'vitest';
import crypto from 'crypto';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { runAtsEngine } from '@/features/ats/engine';
import {
  createAuthoritativeReportSnapshot,
  serializeSnapshot,
  deserializeSnapshot,
  migrateSnapshot,
  generateSnapshotId,
  toCitationPresentationLabel,
  AuthoritativeCitation,
} from '@/features/ats/engine/authoritativeSnapshot';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import { buildDossierModel } from '@/features/dossier/dossierModel';
import { generatePdfDossier } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import type { CitationValidationStatus, ClaimSupportStatus } from '@/features/ats/engine/citationModel';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
  BENCHMARK_PROVENANCE_HASHES,
} from '@/features/ats/fixtures/benchmarkFixtures';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str.trim().replace(/\r\n/g, '\n'), 'utf8').digest('hex');
}

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

describe('HireFlow ATS Resume Roaster — Phase 08.3 Final Consistency & Provenance Audit', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // GATE 1: HISTORICAL BENCHMARK PROVENANCE & DETERMINISM
  // ============================================================
  describe('Gate 1: Historical Benchmark Provenance & Score Determinism', () => {
    it('verifies frozen V2 benchmark SHA-256 hashes and deterministic scores (A=90, B=88)', () => {
      expect(sha256(BENCHMARK_A_V2_PAYTECH_RESUME)).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_a_v2_paytech_lf);
      expect(sha256(BENCHMARK_A_JD)).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_a_jd_lf);
      expect(sha256(BENCHMARK_B_V2_DATAFLOW_RESUME)).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_b_v2_dataflow_lf);
      expect(sha256(BENCHMARK_B_JD)).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_b_jd_lf);

      const opts = { today: new Date(2024, 10, 24) };
      const runA1 = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, opts);
      const runA2 = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, opts);
      expect(runA1.success && runA2.success).toBe(true);
      if (!runA1.success || !runA2.success) return;

      expect(runA1.result.score).toBe(90);
      expect(runA2.result.score).toBe(90);
      expect(runA1.result.engineVersion).toBe('4.0.0');
      expect(runA1.result.specVersion).toBe('4.0.0-ats7d');

      const runB1 = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, opts);
      const runB2 = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, opts);
      expect(runB1.success && runB2.success).toBe(true);
      if (!runB1.success || !runB2.success) return;

      expect(runB1.result.score).toBe(88);
      expect(runB2.result.score).toBe(88);
    });
  });

  // ============================================================
  // GATE 2: COMPLETE MATHEMATICAL SCORETRACE RECONCILIATION
  // ============================================================
  describe('Gate 2: Mathematical Dimension & Penalty ScoreTrace Reconciliation', () => {
    it('mathematically reconciles Benchmark A: 30+20+15+7+9.5+10+5 = 96.5 raw - 7 penalties = 89.5 -> 90 final', async () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD,
        { resumeFileName: 'rohan_deshmukh.pdf' }
      );

      expect(snapshot.scoring.subscores.mustHaveCoverage).toBe(30);
      expect(snapshot.scoring.subscores.evidenceDepth).toBe(20);
      expect(snapshot.scoring.subscores.impactMetrics).toBe(15);
      expect(snapshot.scoring.subscores.projectsAndOss).toBe(7);
      expect(snapshot.scoring.subscores.seniorityFit).toBe(9.5);
      expect(snapshot.scoring.subscores.formatAndParse).toBe(10);
      expect(snapshot.scoring.subscores.tierFit).toBe(5);

      expect(snapshot.scoring.rawSubtotal).toBe(96.5);
      expect(snapshot.scoring.rawScore).toBe(96.5);
      expect(snapshot.scoring.totalBonuses).toBe(0);
      expect(snapshot.scoring.totalDeductions).toBe(7);
      expect(snapshot.scoring.preClampScore).toBe(89.5);
      expect(snapshot.scoring.wasClamped).toBe(false);
      expect(snapshot.scoring.score).toBe(90);

      // Verify itemized deductions match exactly -3 + -4 = -7
      const penaltySum = snapshot.scoring.penalties.reduce((acc, p) => acc + p.points, 0);
      expect(penaltySum).toBe(-7);
      expect(snapshot.scoring.penalties.map((p) => p.id).sort()).toEqual(['missing_education', 'word_count_outlier']);

      // Reopen from history using ONLY snapshot (no engineResult)
      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
      });
      const reopenedModel = buildDossierModel({
        entry: {
          id: 'hist-a-083',
          userId: 'u1',
          kind: 'ats_roast',
          createdAt: snapshot.generatedAt,
          targetKey: 'paygrid-backend',
          overallScore: snapshot.scoring.score,
          engineVersion: snapshot.engineVersion,
          resume: { snapshotHash: 'hash_a', label: 'rohan_deshmukh.pdf' },
          jd: { snapshotHash: 'hash_a_jd', company: 'PayGrid Systems', roleTitle: snapshot.identity.targetRoleTitle },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: snapshot },
        },
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        generatedAt: snapshot.generatedAt,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
      });

      expect(reopenedModel.headline.score).toBe(90);
      expect(reopenedModel.atsDiagnostics.rawSubtotal).toBe(96.5);
      expect(reopenedModel.atsDiagnostics.totalDeductions).toBe(7);

      const pdfBytes = await generatePdfDossier(reopenedModel);
      const pdfText = await extractTextFromPdfBytes(pdfBytes);
      expect(pdfText).toContain('Raw Subtotal 96.5 pts + Bonuses 0 pts - Deductions 7 pts = 89.5 pts -> Final Score: 90 / 100');

      const docxBlob = await generateDocxDossier(reopenedModel);
      const docxXml = await extractDocxDocumentXml(docxBlob);
      expect(docxXml).toContain('Raw Subtotal 96.5 pts + Bonuses 0 pts - Deductions 7 pts = 89.5 pts -&gt; Final Score: 90 / 100');
    });

    it('mathematically reconciles Benchmark B: 30+20+15+7+7.9+10+5 = 94.9 raw - 7 penalties = 87.9 -> 88 final', async () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_B_V2_DATAFLOW_RESUME,
        BENCHMARK_B_JD,
        { resumeFileName: 'ananya_rao.pdf' }
      );

      expect(snapshot.scoring.subscores.mustHaveCoverage).toBe(30);
      expect(snapshot.scoring.subscores.evidenceDepth).toBe(20);
      expect(snapshot.scoring.subscores.impactMetrics).toBe(15);
      expect(snapshot.scoring.subscores.projectsAndOss).toBe(7);
      expect(snapshot.scoring.subscores.seniorityFit).toBe(7.9);
      expect(snapshot.scoring.subscores.formatAndParse).toBe(10);
      expect(snapshot.scoring.subscores.tierFit).toBe(5);

      expect(snapshot.scoring.rawSubtotal).toBe(94.9);
      expect(snapshot.scoring.rawScore).toBe(94.9);
      expect(snapshot.scoring.totalBonuses).toBe(0);
      expect(snapshot.scoring.totalDeductions).toBe(7);
      expect(snapshot.scoring.preClampScore).toBe(87.9);
      expect(snapshot.scoring.score).toBe(88);

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
      });
      const reopenedModel = buildDossierModel({
        entry: {
          id: 'hist-b-083',
          userId: 'u1',
          kind: 'ats_roast',
          createdAt: snapshot.generatedAt,
          targetKey: 'northstar-de',
          overallScore: snapshot.scoring.score,
          engineVersion: snapshot.engineVersion,
          resume: { snapshotHash: 'hash_b', label: 'ananya_rao.pdf' },
          jd: { snapshotHash: 'hash_b_jd', company: 'Northstar Credit', roleTitle: snapshot.identity.targetRoleTitle },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: snapshot },
        },
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        baseline: null,
        generatedAt: snapshot.generatedAt,
        candidate: { name: 'Ananya Rao' },
        planItems: [],
      });

      const pdfBytes = await generatePdfDossier(reopenedModel);
      const pdfText = await extractTextFromPdfBytes(pdfBytes);
      expect(pdfText).toContain('Raw Subtotal 94.9 pts + Bonuses 0 pts - Deductions 7 pts = 87.9 pts -> Final Score: 88 / 100');

      const docxBlob = await generateDocxDossier(reopenedModel);
      const docxXml = await extractDocxDocumentXml(docxBlob);
      expect(docxXml).toContain('Raw Subtotal 94.9 pts + Bonuses 0 pts - Deductions 7 pts = 87.9 pts -&gt; Final Score: 88 / 100');
    });
  });

  // ============================================================
  // GATE 3: NORTHSTAR INTEGER-MONTH SENIORITY & ELIGIBILITY
  // ============================================================
  describe('Gate 3: Northstar Integer-Month Seniority & Eligibility Consistency', () => {
    it('preserves exact integer months (35m touched, 34m completed vs 36m req), BELOW_REQUIREMENT, and GATE SHORTFALL across all surfaces', async () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const sm = response.result.seniorityMatchResult!;
      expect(sm.provenance).toBe('EXPLICIT_EMPLOYER');
      expect(sm.scope).toBe('PROFESSIONAL');
      expect(sm.isMandatoryGateActive).toBe(true);
      expect(sm.requiredMonths).toBe(36);
      expect(sm.demonstratedMonths).toBe(35);
      expect(sm.completedMonths).toBe(34);
      expect(sm.shortfallMonths).toBe(8);
      expect(sm.touchedShortfallMonths).toBe(1);
      expect(sm.completedShortfallMonths).toBe(2);
      expect(sm.maxCompletedShortfallMonths).toBe(13);
      expect(sm.expectedCompletedMonths).toBe(28.5);
      expect(sm.minPossibleQualifyingMonths).toBe(24);
      expect(sm.maxPossibleQualifyingMonths).toBe(35);
      expect(sm.tenureBreakdown.internshipMonths).toBe(24);
      expect(sm.tenureBreakdown.hasOngoingActiveMonth).toBe(true);
      expect(sm.tenureBreakdown.hasYearOnlyIntervals).toBe(true);
      expect(sm.tenureBreakdown.minPossibleWorkMonths).toBe(26);
      expect(sm.tenureBreakdown.maxPossibleWorkMonths).toBe(47);
      expect(sm.status).toBe('BELOW_REQUIREMENT');
      expect(sm.isEligible).toBe(false);

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_B_V2_DATAFLOW_RESUME,
        BENCHMARK_B_JD,
        { resumeFileName: 'ananya_rao.pdf' }
      );
      expect(snapshot.seniority.demonstratedMonths).toBe(35);
      expect(snapshot.seniority.completedMonths).toBe(34);
      expect(snapshot.seniority.requiredMonths).toBe(36);
      expect(snapshot.seniority.shortfallMonths).toBe(8);
      expect(snapshot.seniority.status).toBe('BELOW_REQUIREMENT');
      expect(snapshot.seniority.isEligible).toBe(false);

      // Reopen from history using ONLY snapshot
      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
      });
      const reopenedModel = buildDossierModel({
        entry: {
          id: 'hist-sen-b',
          userId: 'u1',
          kind: 'ats_roast',
          createdAt: snapshot.generatedAt,
          targetKey: 'northstar-de',
          overallScore: snapshot.scoring.score,
          engineVersion: snapshot.engineVersion,
          resume: { snapshotHash: 'hash_b', label: 'ananya_rao.pdf' },
          jd: { snapshotHash: 'hash_b_jd', company: 'Northstar Credit', roleTitle: snapshot.identity.targetRoleTitle },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: snapshot },
        },
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        baseline: null,
        generatedAt: snapshot.generatedAt,
        candidate: { name: 'Ananya Rao' },
        planItems: [],
      });

      const pdfBytes = await generatePdfDossier(reopenedModel);
      const pdfText = await extractTextFromPdfBytes(pdfBytes);
      expect(pdfText).toContain('Status: BELOW_REQUIREMENT | Gate: GATE SHORTFALL [Provenance: EXPLICIT_EMPLOYER]');
      expect(pdfText).toContain('(35m touched, 34m completed vs 36m required, shortfall: 8m)');
      expect(pdfText).toContain('excluded from professional eligibility');

      const docxBlob = await generateDocxDossier(reopenedModel);
      const docxXml = await extractDocxDocumentXml(docxBlob);
      expect(docxXml).toContain('BELOW_REQUIREMENT');
      expect(docxXml).toContain('GATE SHORTFALL');
      expect(docxXml).toContain('(35m touched, 34m completed vs 36m required, shortfall: 8m)');
      expect(docxXml).toContain('excluded from professional eligibility');
    });
  });

  // ============================================================
  // GATE 4: SNAPSHOT ID ENTROPY & PSEUDORANDOM FALLBACK AUDIT
  // ============================================================
  describe('Gate 4: Snapshot ID Entropy & Fallback Verification', () => {
    it('generates 128-bit random hex (32 chars) using crypto.getRandomValues(new Uint8Array(16))', () => {
      const id = generateSnapshotId();
      expect(id).toMatch(/^snap_[0-9a-z]+_[0-9a-f]{32}$/i);
    });

    it('falls back to full 122-bit UUIDv4 hex (32 chars) if crypto.getRandomValues is unavailable', () => {
      const fakeCrypto = {
        randomUUID: () => '12345678-9abc-4def-8012-3456789abcde',
      };
      vi.stubGlobal('crypto', fakeCrypto);
      const id = generateSnapshotId();
      expect(id).toMatch(/^snap_[0-9a-z]+_123456789abc4def80123456789abcde$/);
      vi.unstubAllGlobals();
    });

    it('uses explicitly tagged non-cryptographic prng fallback when Web Crypto API is unavailable', () => {
      vi.stubGlobal('crypto', undefined);
      const id = generateSnapshotId();
      expect(id).toMatch(/^snap_[0-9a-z]+_prng_[0-9a-z]+_[0-9a-z]+$/);
      vi.unstubAllGlobals();
    });
  });

  // ============================================================
  // GATE 5: GRANULAR PHASE 05 CITATION STATUS PRESERVATION
  // ============================================================
  describe('Gate 5: Granular Citation Validation & Provenance Preservation', () => {
    const ALL_12_STATUSES: CitationValidationStatus[] = [
      'VERIFIED_EXACT',
      'VERIFIED_CONTEXTUAL',
      'PARTIALLY_SUPPORTED',
      'INVALID_QUOTE',
      'WRONG_SOURCE',
      'WRONG_SECTION',
      'WRONG_ENTRY',
      'INVALID_OFFSETS',
      'CONTEXT_MISMATCH',
      'UNSUPPORTED_CLAIM',
      'AMBIGUOUS',
      'UNRESOLVED',
    ];

    it('preserves all 12 Phase 05 granular statuses distinctly alongside presentation labels, claim support, and provenance', async () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const baseSnapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      // Build 24 citations (> 15 to also verify zero PDF citation truncation!)
      const citations: AuthoritativeCitation[] = [];
      for (let i = 0; i < 24; i++) {
        const status = ALL_12_STATUSES[i % ALL_12_STATUSES.length];
        const claimSupport: ClaimSupportStatus = i % 2 === 0 ? 'DIRECTLY_SUPPORTED' : 'NOT_SUPPORTED';
        citations.push({
          id: `cit_granular_${i}`,
          competencyId: `comp_${status.toLowerCase()}_${i}`,
          originalQuotation: `Evidence quote #${i} testing granular status ${status}`,
          charStart: i * 10,
          charEnd: i * 10 + 20,
          sourceSection: 'experience',
          sourceType: i % 3 === 0 ? 'PROFESSIONAL_EXPERIENCE' : i % 3 === 1 ? 'INTERNSHIP' : 'PERSONAL_PROJECT',
          environmentMaturity: i % 2 === 0 ? 'PRODUCTION' : 'PROTOTYPE',
          candidateContribution: 'INDIVIDUAL_CONTRIBUTOR',
          claimType: 'TECHNICAL_IMPLEMENTATION',
          validationStatus: status,
          presentationValidationLabel: toCitationPresentationLabel(status),
          claimSupport,
          validationReasons: [`Granular validation: ${status}`],
          validationConfidence: 0.85,
        });
      }

      const customSnapshot = {
        ...baseSnapshot,
        evidence: {
          ...baseSnapshot.evidence,
          citations,
        },
      };

      // 1. Serialization / Deserialization round-trip
      const restored = deserializeSnapshot(serializeSnapshot(customSnapshot));
      for (const [idx, status] of ALL_12_STATUSES.entries()) {
        expect(restored.evidence.citations[idx].validationStatus).toBe(status);
        expect(restored.evidence.citations[idx].presentationValidationLabel).toBe(toCitationPresentationLabel(status));
        expect(restored.evidence.citations[idx].sourceType).toBe(citations[idx].sourceType);
        expect(restored.evidence.citations[idx].environmentMaturity).toBe(citations[idx].environmentMaturity);
      }

      // 2. Migration round-trip
      const migrated = migrateSnapshot(JSON.parse(JSON.stringify(customSnapshot)));
      for (const [idx, status] of ALL_12_STATUSES.entries()) {
        expect(migrated.evidence.citations[idx].validationStatus).toBe(status);
      }

      // 3. Reopened History -> Dossier -> PDF & DOCX preserve all 24 citations without truncation!
      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
      });
      const model = buildDossierModel({
        entry: {
          id: 'hist-cit-24',
          userId: 'u1',
          kind: 'ats_roast',
          createdAt: restored.generatedAt,
          targetKey: 'paygrid-backend',
          overallScore: restored.scoring.score,
          engineVersion: restored.engineVersion,
          resume: { snapshotHash: 'h', label: 'res.pdf' },
          jd: { snapshotHash: 'h', company: 'PayGrid Systems', roleTitle: restored.identity.targetRoleTitle },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: restored },
        },
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        generatedAt: restored.generatedAt,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
      });

      const pdfBytes = await generatePdfDossier(model);
      const pdfText = await extractTextFromPdfBytes(pdfBytes);

      const docxBlob = await generateDocxDossier(model);
      const docxXml = await extractDocxDocumentXml(docxBlob);

      // Every single one of the 12 granular statuses and item #23 (beyond old 15-item limit!) must appear
      for (const status of ALL_12_STATUSES) {
        expect(pdfText).toContain(`Quote Validity: ${status}`);
        expect(docxXml).toContain(status);
      }
      expect(pdfText).toContain('Evidence quote #23');
      expect(docxXml).toContain('Evidence quote #23');
    });
  });

  // ============================================================
  // GATE 6: HISTORY REOPEN IMMUTABILITY (ZERO RE-EXECUTION)
  // ============================================================
  describe('Gate 6: Reopened History Preserves Authoritative Snapshot Without Engine Re-Execution', () => {
    it('hydrates full dossier purely from saved authoritativeSnapshot even when source texts differ or are empty', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD,
        { resumeFileName: 'rohan_deshmukh.pdf' }
      );

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
      });

      // Hydrate with empty resumeText / jdText so runAtsEngine cannot run; snapshot alone must drive everything
      const model = buildDossierModel({
        entry: {
          id: 'hist-reopen-pure',
          userId: 'u1',
          kind: 'ats_roast',
          createdAt: snapshot.generatedAt,
          targetKey: 'paygrid-backend',
          overallScore: snapshot.scoring.score,
          engineVersion: snapshot.engineVersion,
          resume: { snapshotHash: 'h', label: 'rohan_deshmukh.pdf' },
          jd: { snapshotHash: 'h', company: 'PayGrid Systems', roleTitle: snapshot.identity.targetRoleTitle },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: { authoritativeSnapshot: snapshot },
        },
        resumeText: '',
        jdText: '',
        baseline: null,
        generatedAt: snapshot.generatedAt,
        candidate: { name: 'Wrong Profile Name' },
        planItems: [],
      });

      expect(model.candidate.name).toBe('Rohan Deshmukh');
      expect(model.target.company).toBe('PayGrid Systems');
      expect(model.target.roleTitle).toBe('Backend Software Engineer — Payments Core (Python)');
      expect(model.headline.score).toBe(90);
      expect(model.atsDiagnostics.subscores.mustHaveCoverage).toBe(30);
      expect(model.atsDiagnostics.subscores.impactMetrics).toBe(15);
      expect(model.atsDiagnostics.rawSubtotal).toBe(96.5);
      expect(model.atsDiagnostics.totalDeductions).toBe(7);
      expect(model.atsDiagnostics.formattingAudit.wordCount).toBe(197);
      expect(model.atsDiagnostics.penalties.length).toBe(2);
      expect(model.atsDiagnostics.seniorityMode?.completedMonths).toBe(snapshot.seniority.completedMonths);
    });
  });
});

