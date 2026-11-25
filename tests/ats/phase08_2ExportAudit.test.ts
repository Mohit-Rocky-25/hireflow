// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 08.2
// Final PDF Text Extraction, Browser Verification & Identity Audit Suite
// ============================================================

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { runAtsEngine } from '@/features/ats/engine';
import { analyzeJobDescription } from '@/features/ats/engine/jdAnalyzer';
import {
  createAuthoritativeReportSnapshot,
  generateSnapshotId,
  serializeSnapshot,
  deserializeSnapshot,
  AuthoritativeReportSnapshot,
  AuthoritativeCitation,
} from '@/features/ats/engine/authoritativeSnapshot';
import { buildDossierModel } from '@/features/dossier/dossierModel';
import { generatePdfDossier, waitForRenderReadiness } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';
import type { CitationValidationStatus, ClaimSupportStatus } from '@/features/ats/engine/citationModel';

/**
 * Extracts raw page text directly from PDF binary bytes using pdfjs-dist.
 * Iterates through all pages, extracts textContent items, and returns consolidated text.
 */
export async function extractTextFromPdfBytes(pdfBytes: Uint8Array): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({
    data: pdfBytes,
    disableFontFace: true,
  });
  const pdfDoc = await loadingTask.promise;
  const pageTexts: string[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const pageStr = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageStr);
  }

  return pageTexts.join('\n--- PAGE BREAK ---\n');
}

describe('HireFlow ATS Resume Roaster — Phase 08.2 Final Acceptance Suite', () => {
  // ============================================================
  // GATE 1: ACTUAL PDF TEXT EXTRACTION WITH PDFJS-DIST
  // ============================================================
  describe('Gate 1: Actual PDF Text Extraction & Content-Level Verification', () => {
    it('extracts and verifies exact candidate, score, dimensions, seniority and citations from Benchmark A PDF', async () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
      });

      const dossierModel = buildDossierModel({
        entry: {
          id: 'b-a-audit-pdf',
          userId: 'user-recruiter-session',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'paygrid-backend',
          overallScore: response.result.score,
          engineVersion: response.result.engineVersion || '4.0.0',
          resume: { snapshotHash: 'h_a_res', label: 'rohan.pdf' },
          jd: { snapshotHash: 'h_a_jd', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer — Payments Core (Python)' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: auditInput.findings,
        },
        baseline: null,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        candidate: { name: 'Imposter Recruiter' }, // Must NOT appear in PDF
        planItems: [],
      });

      const pdfBytes = await generatePdfDossier(dossierModel);
      const extractedText = await extractTextFromPdfBytes(pdfBytes);

      // 1. Candidate Name Invariant
      expect(extractedText).toContain('Rohan Deshmukh');
      expect(extractedText).not.toContain('Imposter Recruiter');

      // 2. Target Organization
      expect(extractedText).toContain('PayGrid Systems');

      // 3. Exact Employer Role Title (sanitized for standard PDF font as ' - ')
      expect(extractedText).toContain('Backend Software Engineer - Payments Core (Python)');

      // 4. Overall ATS Score & Score Band
      expect(extractedText).toContain(`${response.result.score}`);
      expect(extractedText).toContain(response.result.band.toUpperCase());

      // 5. All 7 Authoritative Scoring Dimensions
      expect(extractedText).toContain('Must-Have Skill Coverage');
      expect(extractedText).toContain('Evidence & Implementation Depth');
      expect(extractedText).toContain('Impact & Quantified Numerical Metrics');
      expect(extractedText).toContain('Project Relevance & Open-Source Signals');
      expect(extractedText).toContain('Seniority Alignment & Experience Fit');
      expect(extractedText).toContain('Format, Layout & Parsing Safety');
      expect(extractedText).toContain('Target Company Tier Alignment');

      // 6. Seniority Requirement, Result & Eligibility (Phase 09 Preflight: completed bounds 35m-46m cross 36m)
      expect(extractedText).toContain('Seniority & Eligibility');
      expect(extractedText).toContain('AMBIGUOUS');
      expect(extractedText).toContain('Demonstrated: 3.9 yrs vs Required: 3 yrs');

      // 7. Layer 5: Citation Validation & Claim Support Ledger
      expect(extractedText).toContain('EVIDENCE PROVENANCE & CITATION VALIDATION LEDGER');
      expect(extractedText).toContain('Quote Validity: VERIFIED_EXACT');
      expect(extractedText).toContain('Claim Support: DIRECTLY_SUPPORTED');
    });

    it('extracts and verifies exact candidate, shortfall, and role title from Benchmark B PDF', async () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
      });

      const dossierModel = buildDossierModel({
        entry: {
          id: 'b-b-audit-pdf',
          userId: 'user-recruiter-session',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'northstar-data',
          overallScore: response.result.score,
          engineVersion: response.result.engineVersion || '4.0.0',
          resume: { snapshotHash: 'h_b_res', label: 'ananya.pdf' },
          jd: { snapshotHash: 'h_b_jd', company: 'Northstar Credit', roleTitle: 'Data Engineer — Risk & Decisioning' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: auditInput.findings,
        },
        baseline: null,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        candidate: { name: 'Imposter Recruiter' },
        planItems: [],
      });

      const pdfBytes = await generatePdfDossier(dossierModel);
      const extractedText = await extractTextFromPdfBytes(pdfBytes);

      // Candidate Name Invariant
      expect(extractedText).toContain('Ananya Rao');
      expect(extractedText).not.toContain('Imposter Recruiter');

      // Target Organization & Employer Title (sanitized for standard PDF font as ' - ')
      expect(extractedText).toContain('Northstar Credit');
      expect(extractedText).toContain('Data Engineer - Risk & Decisioning');

      // Overall Score
      expect(extractedText).toContain(`${response.result.score}`);

      // Gate Shortfall & Ineligibility
      expect(extractedText).toContain('GATE SHORTFALL');
      expect(extractedText).toContain('Demonstrated: 2.9 yrs vs Required: 3 yrs');
    });
  });

  // ============================================================
  // GATE 2: NORTHSTAR ROLE TITLE RECONCILIATION
  // ============================================================
  describe('Gate 2: Employer-Provided Role Title Reconciliation', () => {
    it('preserves exact employer-provided title "Data Engineer — Risk & Decisioning" from frozen fixture', () => {
      // 1. Verify frozen fixture contains exact employer title on Line 1
      const lines = BENCHMARK_B_JD.split('\n').map((l) => l.trim()).filter(Boolean);
      expect(lines[0]).toBe('Data Engineer — Risk & Decisioning');

      // 2. Verify jdAnalyzer extracts the exact title
      const jdAnalysis = analyzeJobDescription(BENCHMARK_B_JD);
      expect(jdAnalysis.roleTitle).toBe('Data Engineer — Risk & Decisioning');
      expect(jdAnalysis.employerProvidedTitle).toBe('Data Engineer — Risk & Decisioning');
      expect(jdAnalysis.internalClassification).toBe('Data Engineer');

      // 3. Verify AtsEngineResult preserves employer title
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      expect(response.result.targetRoleTitle).toBe('Data Engineer — Risk & Decisioning');

      // 4. Verify AuthoritativeReportSnapshot preserves original title and stores internalClassification separately
      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_B_V2_DATAFLOW_RESUME,
        BENCHMARK_B_JD
      );

      expect(snapshot.identity.targetRoleTitle).toBe('Data Engineer — Risk & Decisioning');
      expect(snapshot.identity.internalClassification).toBe('Data Engineer');
    });

    it('preserves exact employer-provided title for Benchmark A', () => {
      const lines = BENCHMARK_A_JD.split('\n').map((l) => l.trim()).filter(Boolean);
      expect(lines[0]).toBe('Backend Software Engineer — Payments Core (Python)');

      const jdAnalysis = analyzeJobDescription(BENCHMARK_A_JD);
      expect(jdAnalysis.roleTitle).toBe('Backend Software Engineer — Payments Core (Python)');
    });
  });

  // ============================================================
  // GATE 3: SECURE SNAPSHOT ID GENERATION
  // ============================================================
  describe('Gate 3: Secure Snapshot ID Generation', () => {
    it('generates 128-bit Web Crypto IDs with valid prefix and zero collisions in a 1,000-run sample', () => {
      const ids = new Set<string>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        const id = generateSnapshotId();
        expect(id).toMatch(/^snap_[0-9a-z]+_[0-9a-f]{32}$/i);
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }

      expect(ids.size).toBe(count);
    });

    it('preserves snapshot ID across serialization and deserialization', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      const serialized = serializeSnapshot(snapshot);
      const deserialized = deserializeSnapshot(serialized);

      expect(deserialized.snapshotId).toBe(snapshot.snapshotId);
      expect(deserialized.snapshotId).toMatch(/^snap_/);
    });
  });

  // ============================================================
  // GATE 4: CITATION AND CLAIM SUPPORT TYPE AUDIT
  // ============================================================
  describe('Gate 4: Citation Validity and Claim Support Type Audit', () => {
    const TEST_COMBINATIONS: Array<{
      validationStatus: CitationValidationStatus;
      claimSupport: ClaimSupportStatus;
      expectedDescription: string;
    }> = [
      {
        validationStatus: 'VERIFIED_EXACT',
        claimSupport: 'DIRECTLY_SUPPORTED',
        expectedDescription: 'Exact quote directly proving competency',
      },
      {
        validationStatus: 'VERIFIED_EXACT',
        claimSupport: 'PARTIALLY_SUPPORTED',
        expectedDescription: 'Exact quote that only partially supports the claim',
      },
      {
        validationStatus: 'VERIFIED_EXACT',
        claimSupport: 'NOT_SUPPORTED',
        expectedDescription: 'Genuine verbatim quote that fails to support capability',
      },
      {
        validationStatus: 'VERIFIED_CONTEXTUAL',
        claimSupport: 'RELATED_ONLY',
        expectedDescription: 'Contextual quote mentioning a related tool without capability mastery',
      },
      {
        validationStatus: 'INVALID_QUOTE',
        claimSupport: 'DIRECTLY_SUPPORTED',
        expectedDescription: 'Fabricated quote claiming direct capability (unsupported)',
      },
      {
        validationStatus: 'UNRESOLVED',
        claimSupport: 'AMBIGUOUS',
        expectedDescription: 'Unresolved source text with ambiguous phrasing',
      },
    ];

    it.each(TEST_COMBINATIONS)(
      'preserves orthogonal combination: $validationStatus + $claimSupport ($expectedDescription)',
      async ({ validationStatus, claimSupport }) => {
        const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);
        expect(response.success).toBe(true);
        if (!response.success) return;

        const baseSnapshot = createAuthoritativeReportSnapshot(
          response.result,
          BENCHMARK_A_V2_PAYTECH_RESUME,
          BENCHMARK_A_JD
        );

        const syntheticCit: AuthoritativeCitation = {
          id: `cit_combo_${validationStatus}_${claimSupport}`,
          competencyId: 'distributed_caching',
          originalQuotation: 'Integrated Redis read-through caching layer with cache stampede mitigation',
          charStart: 100,
          charEnd: 180,
          sourceSection: 'experience',
          sourceType: 'PROFESSIONAL_EXPERIENCE',
          environmentMaturity: 'PRODUCTION',
          candidateContribution: 'INDIVIDUAL_CONTRIBUTOR',
          claimType: 'DIRECT_TECHNOLOGY_USAGE',
          validationStatus,
          claimSupport,
          validationReasons: [`Test validation for ${validationStatus}`],
          validationConfidence: 0.9,
        };

        const testSnapshot: AuthoritativeReportSnapshot = {
          ...baseSnapshot,
          evidence: {
            ...baseSnapshot.evidence,
            citations: [syntheticCit],
          },
        };

        // 1. Serialization round-trip
        const serialized = serializeSnapshot(testSnapshot);
        const restored = deserializeSnapshot(serialized);
        expect(restored.evidence.citations[0].validationStatus).toBe(validationStatus);
        expect(restored.evidence.citations[0].claimSupport).toBe(claimSupport);

        // 2. Dossier model hydration
        const auditInput = atsToAuditInput({
          result: response.result,
          resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
          jdText: BENCHMARK_A_JD,
          source: 'upload',
        });

        const dossierModel = buildDossierModel({
          entry: {
            id: 'audit-combo-test',
            userId: 'u',
            kind: 'ats_roast',
            createdAt: new Date().toISOString(),
            targetKey: 'k',
            overallScore: response.result.score,
            engineVersion: '4.0.0',
            resume: { snapshotHash: 'h', label: 'res.pdf' },
            jd: { snapshotHash: 'h', company: 'PayGrid Systems', roleTitle: 'Backend Engineer' },
            breakdown: auditInput.breakdown,
            gaps: auditInput.gaps,
            strengths: auditInput.strengths,
            evidence: auditInput.evidence,
            findingsJson: {
              ...auditInput.findings,
              authoritativeSnapshot: testSnapshot,
            },
          },
          baseline: null,
          candidate: { name: 'Rohan Deshmukh' },
          planItems: [],
        });

        // 3. PDF generation and text extraction
        const pdfBytes = await generatePdfDossier(dossierModel);
        const pdfText = await extractTextFromPdfBytes(pdfBytes);
        expect(pdfText).toContain(`Quote Validity: ${validationStatus}`);
        expect(pdfText).toContain(`Claim Support: ${claimSupport}`);

        // 4. DOCX generation and XML inspection
        const docxBlob = await generateDocxDossier(dossierModel);
        const zip = await JSZip.loadAsync(await docxBlob.arrayBuffer());
        const docxXml = await zip.file('word/document.xml')?.async('string');
        expect(docxXml).toContain(validationStatus);
        expect(docxXml).toContain(claimSupport);
      }
    );
  });

  // ============================================================
  // GATE 5: REAL BROWSER EXPORT READINESS & TIMEOUT TESTING
  // ============================================================
  describe('Gate 5: Browser Export Readiness and Edge Cases', () => {
    it('passes readiness check under normal and delayed conditions', async () => {
      const res = await waitForRenderReadiness({ timeoutMs: 150 });
      expect(res.ready).toBe(true);
    });

    it('safely handles broken image fallbacks in capture target', async () => {
      const fakeImage = {
        complete: false,
        naturalWidth: 0,
        addEventListener: (event: string, cb: Function) => {
          if (event === 'error') setTimeout(cb, 10);
        },
      };
      const mockElement = {
        getBoundingClientRect: () => ({ width: 600, height: 800 }),
        querySelectorAll: () => [fakeImage],
      };

      const res = await waitForRenderReadiness({ element: mockElement, timeoutMs: 200 });
      expect(res.ready).toBe(true);
    });

    it('rejects zero-dimension elements to prevent blank page exports', async () => {
      const mockZeroElement = {
        getBoundingClientRect: () => ({ width: 0, height: 0 }),
      };
      const res = await waitForRenderReadiness({ element: mockZeroElement });
      expect(res.ready).toBe(false);
      expect(res.reason).toContain('zero dimensions');
    });

    it('generates multi-page PDF output cleanly when handling > 50 citations', async () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
      });

      // Construct 60 citations to test multi-page scaling
      const manyCitations = Array.from({ length: 60 }, (_, idx) => ({
        id: `cit_${idx}`,
        competencyId: `competency_${idx % 10}`,
        originalQuotation: `Engineered high-scale distributed component bullet index ${idx} with verifiable throughput.`,
        charStart: idx * 10,
        charEnd: idx * 10 + 50,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE' as const,
        environmentMaturity: 'PRODUCTION' as const,
        candidateContribution: 'DIRECT_IMPLEMENTATION' as const,
        claimType: 'DIRECT_TECHNOLOGY_USAGE' as const,
        validationStatus: 'VERIFIED_EXACT' as const,
        claimSupport: 'DIRECTLY_SUPPORTED' as const,
        validationReasons: ['Verified citation in automated volume test'],
        validationConfidence: 1.0,
      }));

      const model = buildDossierModel({
        entry: {
          id: 'audit-vol-test',
          userId: 'u',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'k',
          overallScore: 89,
          engineVersion: '4.0.0',
          resume: { snapshotHash: 'h', label: 'res.pdf' },
          jd: { snapshotHash: 'h', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: {
            ...auditInput.findings,
            citationsList: manyCitations,
          },
        },
        baseline: null,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
      });

      const pdfBytes = await generatePdfDossier(model);
      const pdfText = await extractTextFromPdfBytes(pdfBytes);

      // Verify that citations are extracted across pages without crashing
      expect(pdfText).toContain('Rohan Deshmukh');
      expect(pdfText).toContain('Quote Validity: VERIFIED_EXACT');
      expect(pdfText).toContain('--- PAGE BREAK ---'); // Confirms multi-page output
    });

    it('executes repeated exports without cross-run state pollution', async () => {
      const responseA = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);
      const responseB = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD);
      expect(responseA.success && responseB.success).toBe(true);
      if (!responseA.success || !responseB.success) return;

      const auditA = atsToAuditInput({ result: responseA.result, resumeText: BENCHMARK_A_V2_PAYTECH_RESUME, jdText: BENCHMARK_A_JD, source: 'upload' });
      const auditB = atsToAuditInput({ result: responseB.result, resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME, jdText: BENCHMARK_B_JD, source: 'upload' });

      const modelA = buildDossierModel({
        entry: {
          id: 'audit-a',
          userId: 'u1',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'ka',
          overallScore: responseA.result.score,
          engineVersion: '4.0.0',
          resume: { snapshotHash: 'ha', label: 'rohan.pdf' },
          jd: { snapshotHash: 'ha', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer' },
          breakdown: auditA.breakdown,
          gaps: auditA.gaps,
          strengths: auditA.strengths,
          evidence: auditA.evidence,
          findingsJson: auditA.findings,
        },
        baseline: null,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
      });

      const modelB = buildDossierModel({
        entry: {
          id: 'audit-b',
          userId: 'u2',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'kb',
          overallScore: responseB.result.score,
          engineVersion: '4.0.0',
          resume: { snapshotHash: 'hb', label: 'ananya.pdf' },
          jd: { snapshotHash: 'hb', company: 'Northstar Credit', roleTitle: 'Data Engineer — Risk & Decisioning' },
          breakdown: auditB.breakdown,
          gaps: auditB.gaps,
          strengths: auditB.strengths,
          evidence: auditB.evidence,
          findingsJson: auditB.findings,
        },
        baseline: null,
        candidate: { name: 'Ananya Rao' },
        planItems: [],
      });

      // Export A, then B, then A again
      const bytesA1 = await generatePdfDossier(modelA);
      const textA1 = await extractTextFromPdfBytes(bytesA1);
      expect(textA1).toContain('Rohan Deshmukh');
      expect(textA1).not.toContain('Ananya Rao');

      const bytesB = await generatePdfDossier(modelB);
      const textB = await extractTextFromPdfBytes(bytesB);
      expect(textB).toContain('Ananya Rao');
      expect(textB).not.toContain('Rohan Deshmukh');

      const bytesA2 = await generatePdfDossier(modelA);
      const textA2 = await extractTextFromPdfBytes(bytesA2);
      expect(textA2).toContain('Rohan Deshmukh');
      expect(textA2).not.toContain('Ananya Rao');
    });
  });
});
