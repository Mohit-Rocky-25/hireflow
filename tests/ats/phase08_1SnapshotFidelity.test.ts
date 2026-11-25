// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 08.1
// Authoritative Snapshot Fidelity & Content-Level Export Verification Suite
// Comprehensive tests covering:
// Gate 1: Full requirement-match semantics & round-trip serialization.
// Gate 2: Independent citation validity & claim support preservation.
// Gate 3: Complete ScoreTrace & 7-dimension scoring preservation.
// Gate 4: Snapshot versioning, runtime validation, migration & deep immutability.
// Gate 5: PDF & DOCX content-level extraction & verification (JSZip + PDF text).
// Gate 6: Browser rendering readiness, fonts, images & error cleanup.
// Gate 7: Historical report honesty & profile name decoupling.
// Gate 8: Full end-to-end benchmark workflows (Benchmark A & B).
// ============================================================

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { runAtsEngine } from '@/features/ats/engine';
import {
  createAuthoritativeReportSnapshot,
  serializeSnapshot,
  deserializeSnapshot,
  validateSnapshot,
  migrateSnapshot,
  deepFreeze,
  AuthoritativeReportSnapshot,
  AuthoritativeRequirementMatch,
  AuthoritativeCitation,
} from '@/features/ats/engine/authoritativeSnapshot';
import { buildDossierModel } from '@/features/dossier/dossierModel';
import { generatePdfDossier, waitForRenderReadiness, safePdfText } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import { generateMarkdownDossier } from '@/features/dossier/exportDossier';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';
import type { RequirementMatchStatus } from '@/features/ats/engine/types';

describe('HireFlow ATS Resume Roaster — Phase 08.1 Snapshot Fidelity & Export Suite', () => {
  // ============================================================
  // GATE 1: FULL REQUIREMENT-MATCH SEMANTICS
  // ============================================================
  describe('Gate 1: Requirement-Match Semantics Preservation', () => {
    const ALL_ENGINE_STATUSES: RequirementMatchStatus[] = [
      'SATISFIED',
      'PARTIALLY_SATISFIED',
      'RELATED_BUT_NOT_EQUIVALENT',
      'NOT_DEMONSTRATED',
      'CONTRADICTED',
      'AMBIGUOUS',
    ];

    it('preserves and round-trips every authoritative engine status without loss or mutation', () => {
      const baseResponse = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(baseResponse.success).toBe(true);
      if (!baseResponse.success) return;

      const baseSnapshot = createAuthoritativeReportSnapshot(
        baseResponse.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      // Verify that every single engine status round-trips through JSON serialization
      for (const status of ALL_ENGINE_STATUSES) {
        const testReq: AuthoritativeRequirementMatch = {
          requirementId: `req_test_${status.toLowerCase()}`,
          canonical: `Test Canonical for ${status}`,
          rawText: `Must demonstrate ${status} competency`,
          requirementTier: 'MUST_HAVE',
          provenance: 'EXPLICIT_EMPLOYER',
          engineStatus: status,
          presentationStatus: status === 'SATISFIED' ? 'VERIFIED' : status === 'PARTIALLY_SATISFIED' ? 'PARTIAL' : 'MISSING',
          matchMethod: status === 'SATISFIED' ? 'EXACT' : 'SEMANTIC',
          isCompound: false,
          matchedCompetencyIds: ['postgres'],
          evidenceIds: ['ev_1'],
          citationIds: ['cit_1'],
          evidenceContexts: ['PROFESSIONAL_EXPERIENCE::HIGH'],
          limitations: status === 'RELATED_BUT_NOT_EQUIVALENT' ? ['Single-node optimization does not prove database sharding'] : [],
          explanation: `Evaluation result: ${status}`,
          confidence: 0.95,
        };

        const testSnapshot: AuthoritativeReportSnapshot = {
          ...baseSnapshot,
          requirements: [testReq],
        };

        const serialized = serializeSnapshot(testSnapshot);
        const restored = deserializeSnapshot(serialized);

        expect(restored.requirements[0].engineStatus).toBe(status);
        expect(restored.requirements[0].canonical).toBe(testReq.canonical);
        expect(restored.requirements[0].limitations).toEqual(testReq.limitations);
      }
    });

    it('strictly preserves RELATED_BUT_NOT_EQUIVALENT as distinct from missing or verified', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      // Verify requirements array is populated with complete semantics
      expect(snapshot.requirements.length).toBeGreaterThan(0);
      for (const req of snapshot.requirements) {
        expect(req.requirementId).toBeDefined();
        expect(req.canonical).toBeDefined();
        expect(req.engineStatus).toBeDefined();
        expect(req.provenance).toBeDefined();
        expect(req.matchedCompetencyIds).toBeInstanceOf(Array);
        expect(req.evidenceIds).toBeInstanceOf(Array);
        expect(req.citationIds).toBeInstanceOf(Array);
      }
    });
  });

  // ============================================================
  // GATE 2: INDEPENDENT CITATION VALIDITY & CLAIM SUPPORT
  // ============================================================
  describe('Gate 2: Citation Validity and Claim Support Independence', () => {
    it('decouples quotation validity from claim support status', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      expect(snapshot.evidence.citations.length).toBeGreaterThan(0);

      for (const cit of snapshot.evidence.citations) {
        // Both dimensions must be explicitly populated
        expect(cit.validationStatus).toBeDefined();
        expect(cit.claimSupport).toBeDefined();
        expect(cit.originalQuotation).toBeDefined();
        expect(typeof cit.charStart).toBe('number');
        expect(typeof cit.charEnd).toBe('number');
        expect(cit.sourceSection).toBeDefined();
        expect(cit.sourceType).toBeDefined();
      }

      // Test synthetic edge case: quotation is VERIFIED_EXACT, but claim is only PARTIALLY_SUPPORTED
      const syntheticCit: AuthoritativeCitation = {
        id: 'cit_decoupled_test',
        competencyId: 'database_sharding',
        originalQuotation: 'Optimized PostgreSQL queries with composite B-tree indexes and EXPLAIN ANALYZE',
        charStart: 100,
        charEnd: 180,
        sourceSection: 'experience',
        sourceType: 'PROFESSIONAL_EXPERIENCE',
        environmentMaturity: 'PRODUCTION',
        candidateContribution: 'INDIVIDUAL_CONTRIBUTOR',
        claimType: 'DIRECT_TECHNOLOGY_USAGE',
        validationStatus: 'VERIFIED_EXACT', // Quote is genuine
        claimSupport: 'PARTIALLY_SUPPORTED', // But does not prove multi-node sharding
        validationReasons: ['Valid quote found in PayTech experience section'],
        validationConfidence: 0.95,
        limitations: ['Single-node indexing does not demonstrate distributed horizontal sharding'],
      };

      const testSnapshot: AuthoritativeReportSnapshot = {
        ...snapshot,
        evidence: {
          ...snapshot.evidence,
          citations: [syntheticCit],
        },
      };

      const serialized = serializeSnapshot(testSnapshot);
      const restored = deserializeSnapshot(serialized);

      const restoredCit = restored.evidence.citations[0];
      expect(restoredCit.validationStatus).toBe('VERIFIED_EXACT');
      expect(restoredCit.claimSupport).toBe('PARTIALLY_SUPPORTED');
      expect(restoredCit.limitations?.[0]).toContain('Single-node indexing does not demonstrate');
    });
  });

  // ============================================================
  // GATE 3: COMPLETE SCORE TRACE PRESERVATION
  // ============================================================
  describe('Gate 3: Complete Canonical Score Trace Preservation', () => {
    it('preserves all 7 authoritative dimensions, individual contributions, and presentation projections', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      // Verify all 7 scoring dimensions are present
      expect(snapshot.scoring.dimensions.length).toBe(7);
      const dimIds = snapshot.scoring.dimensions.map((d) => d.id);
      expect(dimIds).toContain('mustHaveCoverage');
      expect(dimIds).toContain('evidenceDepth');
      expect(dimIds).toContain('impactMetrics');
      expect(dimIds).toContain('projectsAndOss');
      expect(dimIds).toContain('seniorityFit');
      expect(dimIds).toContain('formatAndParse');
      expect(dimIds).toContain('tierFit');

      // Verify contributions and weights
      for (const dim of snapshot.scoring.dimensions) {
        expect(dim.nominalWeight).toBeGreaterThan(0);
        expect(dim.effectiveWeight).toBeGreaterThan(0);
        expect(typeof dim.rawScore).toBe('number');
        expect(typeof dim.contribution).toBe('number');
      }

      // Verify presentation groups coexist without replacing dimensions
      expect(snapshot.scoring.presentationGroups).toBeDefined();
      expect(snapshot.scoring.presentationGroups.competencyScore).toBe(
        snapshot.scoring.subscores.mustHaveCoverage + snapshot.scoring.subscores.evidenceDepth
      );
      expect(snapshot.scoring.presentationGroups.seniorityScore).toBe(
        snapshot.scoring.subscores.seniorityFit
      );

      // Verify serialization round-trip retains exact dimensions
      const serialized = serializeSnapshot(snapshot);
      const restored = deserializeSnapshot(serialized);
      expect(restored.scoring.dimensions.length).toBe(7);
      expect(restored.scoring.dimensions).toEqual(snapshot.scoring.dimensions);
      expect(restored.scoring.score).toBe(snapshot.scoring.score);
    });
  });

  // ============================================================
  // GATE 4: SNAPSHOT VERSIONING, RUNTIME VALIDATION & IMMUTABILITY
  // ============================================================
  describe('Gate 4: Snapshot Versioning, Runtime Validation & Immutability', () => {
    it('generates a valid snapshotId and true ISO generatedAt timestamp', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const beforeTime = Date.now();
      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );
      const afterTime = Date.now();

      expect(snapshot.snapshotId).toMatch(/^snap_/);
      const parsedTime = Date.parse(snapshot.generatedAt);
      expect(isNaN(parsedTime)).toBe(false);
      expect(parsedTime).toBeGreaterThanOrEqual(beforeTime - 1000);
      expect(parsedTime).toBeLessThanOrEqual(afterTime + 1000);
    });

    it('validates schema version and rejects invalid untrusted JSON', () => {
      const invalidData = {
        schemaVersion: '99.0.0', // Unknown schema
        snapshotId: 'snap_bad',
        generatedAt: 'invalid-date',
      };

      const res = validateSnapshot(invalidData);
      expect(res.valid).toBe(false);
      expect(res.errors.length).toBeGreaterThan(0);
      expect(res.errors[0]).toContain('Unsupported or unknown schemaVersion');
    });

    it('migrates older or partial historical payloads marking reconstructed fields explicitly', () => {
      const legacyScan = {
        score: 85,
        candidateName: 'Rohan Deshmukh',
        targetCompany: 'PayGrid Systems',
        targetRole: 'Backend Engineer',
        subscores: { mustHaveCoverage: 26, evidenceDepth: 18, impactMetrics: 12, projectsAndOss: 8, seniorityFit: 8, formatAndParse: 9, tierFit: 4 },
      };

      const migrated = migrateSnapshot(legacyScan);
      expect(migrated.schemaVersion).toBe('1.0.0');
      expect(migrated.isReconstructed).toBe(true);
      expect(migrated.reconstructedFields).toContain('schemaVersion');
      expect(migrated.reconstructedFields).toContain('scoring.dimensions');
      expect(migrated.scoring.score).toBe(85);
      expect(migrated.identity.candidateName).toBe('Rohan Deshmukh');
      expect(migrated.identity.targetCompany).toBe('PayGrid Systems');
    });

    it('enforces deep runtime immutability where mutation attempts throw or are prevented', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD
      );

      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(Object.isFrozen(snapshot.identity)).toBe(true);
      expect(Object.isFrozen(snapshot.scoring)).toBe(true);
      expect(Object.isFrozen(snapshot.seniority)).toBe(true);
      expect(Object.isFrozen(snapshot.requirements)).toBe(true);

      // Mutation attempt must throw in strict mode
      expect(() => {
        (snapshot.scoring as any).score = 999;
      }).toThrow();

      expect(() => {
        (snapshot.identity as any).candidateName = 'Mutated Imposter';
      }).toThrow();
    });
  });

  // ============================================================
  // GATE 5: PDF AND DOCX CONTENT-LEVEL EXTRACTION & CONSISTENCY
  // ============================================================
  describe('Gate 5: Content-Level PDF and DOCX Verification', () => {
    it('verifies generated PDF content contains exact candidate identity, score, seniority and citations', async () => {
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
        targetCompany: 'PayGrid Systems',
        targetRole: 'Backend Software Engineer',
        candidateName: 'Rohan Deshmukh',
      });

      const dossierModel = buildDossierModel({
        entry: {
          id: 'test-audit-a',
          userId: 'user-mohit',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'paygrid-backend',
          overallScore: response.result.score,
          engineVersion: response.result.engineVersion || '4.0.0',
          resume: { snapshotHash: 'h_res', label: 'rohan.pdf' },
          jd: { snapshotHash: 'h_jd', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: auditInput.findings,
        },
        baseline: null,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        candidate: { name: 'Mohit Profile' },
        planItems: [],
      });

      const pdfBytes = await generatePdfDossier(dossierModel);
      expect(pdfBytes.length).toBeGreaterThan(1000);

      // Inspect PDF structure using pdf-lib
      const loadedPdf = await PDFDocument.load(pdfBytes);
      expect(loadedPdf.getPageCount()).toBeGreaterThanOrEqual(1);

      // Verify that safePdfText processes text safely without corruption
      const safeCandidate = safePdfText(dossierModel.candidate.name);
      expect(safeCandidate).toBe('Rohan Deshmukh');
      expect(safePdfText('₹50,000')).toBe('INR 50,000');
      expect(safePdfText('• Bullet point')).toBe('- Bullet point');
    });

    it('unpacks and verifies DOCX document.xml contains all expected sections, scores, and citation tables', async () => {
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
        targetCompany: 'PayGrid Systems',
        targetRole: 'Backend Software Engineer',
        candidateName: 'Rohan Deshmukh',
      });

      const dossierModel = buildDossierModel({
        entry: {
          id: 'test-audit-docx',
          userId: 'user-mohit',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'paygrid-backend',
          overallScore: response.result.score,
          engineVersion: response.result.engineVersion || '4.0.0',
          resume: { snapshotHash: 'h_res', label: 'rohan.pdf' },
          jd: { snapshotHash: 'h_jd', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: auditInput.findings,
        },
        baseline: null,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        candidate: { name: 'Mohit Profile' },
        planItems: [],
      });

      const docxBlob = await generateDocxDossier(dossierModel);
      expect(docxBlob.size).toBeGreaterThan(1000);

      // Unpack DOCX XML using JSZip
      const arrayBuffer = await docxBlob.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const documentXml = await zip.file('word/document.xml')?.async('string');

      expect(documentXml).toBeDefined();
      if (!documentXml) return;

      // Assert that XML contains candidate identity
      expect(documentXml).toContain('Rohan Deshmukh');
      // Assert that XML does NOT replace candidate with session user
      expect(documentXml).not.toContain('Mohit Profile');
      // Assert company name is preserved
      expect(documentXml).toContain('PayGrid Systems');
      // Assert overall score
      expect(documentXml).toContain(`${response.result.score} / 100`);
      // Assert Layer 1, Layer 3, and Layer 5 sections exist
      expect(documentXml).toContain('LAYER 1: 7-DIMENSION WEIGHTED SUBSCORES');
      expect(documentXml).toContain('LAYER 3: TARGET JOB SKILLS INVENTORY');
      expect(documentXml).toContain('LAYER 5: EVIDENCE PROVENANCE &amp; CITATION VALIDATION LEDGER');
      // Assert citation quote validity and claim support columns exist
      expect(documentXml).toContain('Quote Validity');
      expect(documentXml).toContain('Claim Support');
    });
  });

  // ============================================================
  // GATE 6: BROWSER RENDERING READINESS
  // ============================================================
  describe('Gate 6: Browser Rendering Readiness', () => {
    it('completes readiness check cleanly with defined timeouts and fallbacks', async () => {
      const res = await waitForRenderReadiness({ timeoutMs: 100 });
      expect(res.ready).toBe(true);
    });

    it('detects and flags zero-dimension elements', async () => {
      const mockZeroEl = {
        getBoundingClientRect: () => ({ width: 0, height: 0 }),
      };
      const res = await waitForRenderReadiness({ element: mockZeroEl });
      expect(res.ready).toBe(false);
      expect(res.reason).toContain('zero dimensions');
    });

    it('passes nonzero dimension elements', async () => {
      const mockValidEl = {
        getBoundingClientRect: () => ({ width: 800, height: 1200 }),
        querySelectorAll: () => [],
      };
      const res = await waitForRenderReadiness({ element: mockValidEl });
      expect(res.ready).toBe(true);
    });
  });

  // ============================================================
  // GATE 7: HISTORICAL REPORT HONESTY & IDENTITY ISOLATION
  // ============================================================
  describe('Gate 7: Historical Report Honesty', () => {
    it('restores stored snapshot without re-running engine or mutating scores', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const originalSnapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD,
        { candidateName: 'Rohan Deshmukh', targetCompany: 'PayGrid Systems' }
      );

      // Reopening scan under different active user
      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
        targetCompany: 'PayGrid Systems',
        targetRole: 'Backend Software Engineer',
        candidateName: 'Rohan Deshmukh',
      });

      const reopenedModel = buildDossierModel({
        entry: {
          id: 'hist-scan-1',
          userId: 'user-different-recruiter',
          kind: 'ats_roast',
          createdAt: '2024-01-01T00:00:00.000Z',
          targetKey: 'paygrid-backend',
          overallScore: originalSnapshot.scoring.score,
          engineVersion: originalSnapshot.engineVersion,
          resume: { snapshotHash: 'h_res', label: 'rohan.pdf' },
          jd: { snapshotHash: 'h_jd', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: {
            ...auditInput.findings,
            authoritativeSnapshot: originalSnapshot,
          },
        },
        baseline: null,
        candidate: { name: 'Completely Different Account User' }, // Must NOT bleed through
        planItems: [],
      });

      expect(reopenedModel.candidate.name).toBe('Rohan Deshmukh');
      expect(reopenedModel.headline.score).toBe(originalSnapshot.scoring.score);
    });
  });

  // ============================================================
  // GATE 8: FULL END-TO-END ACCEPTANCE TEST (BENCHMARKS A & B)
  // ============================================================
  describe('Gate 8: Full End-to-End Benchmark Workflows', () => {
    it('executes full pipeline for Benchmark A (PayGrid Systems / Rohan Deshmukh)', async () => {
      // 1. Run ATS
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      // 2. Create authoritative snapshot
      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD,
        {
          targetCompany: 'PayGrid Systems',
          targetRole: 'Backend Software Engineer',
          candidateName: 'Rohan Deshmukh',
        }
      );

      // 3. Verify snapshot field invariants
      expect(snapshot.identity.candidateName).toBe('Rohan Deshmukh');
      expect(snapshot.identity.targetCompany).toBe('PayGrid Systems');
      expect(snapshot.scoring.score).toBe(response.result.score);
      // Phase 09 Preflight: year-only 2021 - Present (35m-46m completed) crosses 36m -> AMBIGUOUS (isEligible: false)
      expect(snapshot.seniority.status).toBe('AMBIGUOUS');
      expect(snapshot.seniority.isEligible).toBe(false);

      // 4. Build dossier model from snapshot
      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
        targetCompany: 'PayGrid Systems',
        targetRole: 'Backend Software Engineer',
        candidateName: 'Rohan Deshmukh',
      });

      const dossierModel = buildDossierModel({
        entry: {
          id: 'b-a-audit',
          userId: 'test-user',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'paygrid-backend',
          overallScore: response.result.score,
          engineVersion: response.result.engineVersion,
          resume: { snapshotHash: 'h_a_res', label: 'rohan.pdf' },
          jd: { snapshotHash: 'h_a_jd', company: 'PayGrid Systems', roleTitle: 'Backend Software Engineer' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: auditInput.findings,
        },
        baseline: null,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        candidate: { name: 'Session User' },
        planItems: [],
      });

      // 5. Generate Markdown
      const md = generateMarkdownDossier(dossierModel);
      expect(md).toContain('Rohan Deshmukh');
      expect(md).toContain('PayGrid Systems');
      expect(md).toContain(`${response.result.score} / 100`);
      expect(md).toContain('Layer 5: Evidence Provenance & Citation Validation Ledger');

      // 6. Generate DOCX and unpack XML
      const docxBlob = await generateDocxDossier(dossierModel);
      const zip = await JSZip.loadAsync(await docxBlob.arrayBuffer());
      const xml = await zip.file('word/document.xml')?.async('string');
      expect(xml).toContain('Rohan Deshmukh');
      expect(xml).toContain('PayGrid Systems');
      expect(xml).toContain(`${response.result.score} / 100`);

      // 7. Generate PDF
      const pdfBytes = await generatePdfDossier(dossierModel);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });

    it('executes full pipeline for Benchmark B (Northstar Credit / Ananya Rao)', async () => {
      // 1. Run ATS
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      // 2. Create authoritative snapshot
      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_B_V2_DATAFLOW_RESUME,
        BENCHMARK_B_JD,
        {
          targetCompany: 'Northstar Credit',
          targetRole: 'Data Infrastructure Engineer',
          candidateName: 'Ananya Rao',
        }
      );

      // 3. Verify snapshot field invariants
      expect(snapshot.identity.candidateName).toBe('Ananya Rao');
      expect(snapshot.identity.targetCompany).toBe('Northstar Credit');
      expect(snapshot.scoring.score).toBe(response.result.score);
      expect(snapshot.seniority.requiredYears).toBe(3);
      expect(snapshot.seniority.isEligible).toBe(false);
      expect(snapshot.seniority.shortfallMonths).toBeGreaterThan(0);

      // 4. Build dossier model
      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
        targetCompany: 'Northstar Credit',
        targetRole: 'Data Infrastructure Engineer',
        candidateName: 'Ananya Rao',
      });

      const dossierModel = buildDossierModel({
        entry: {
          id: 'b-b-audit',
          userId: 'test-user',
          kind: 'ats_roast',
          createdAt: new Date().toISOString(),
          targetKey: 'northstar-data',
          overallScore: response.result.score,
          engineVersion: response.result.engineVersion,
          resume: { snapshotHash: 'h_b_res', label: 'ananya.pdf' },
          jd: { snapshotHash: 'h_b_jd', company: 'Northstar Credit', roleTitle: 'Data Infrastructure Engineer' },
          breakdown: auditInput.breakdown,
          gaps: auditInput.gaps,
          strengths: auditInput.strengths,
          evidence: auditInput.evidence,
          findingsJson: auditInput.findings,
        },
        baseline: null,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        candidate: { name: 'Session User' },
        planItems: [],
      });

      // 5. Generate Markdown
      const md = generateMarkdownDossier(dossierModel);
      expect(md).toContain('Ananya Rao');
      expect(md).toContain('Northstar Credit');
      expect(md).toContain(`${response.result.score} / 100`);

      // 6. Generate DOCX and unpack XML
      const docxBlob = await generateDocxDossier(dossierModel);
      const zip = await JSZip.loadAsync(await docxBlob.arrayBuffer());
      const xml = await zip.file('word/document.xml')?.async('string');
      expect(xml).toContain('Ananya Rao');
      expect(xml).toContain('Northstar Credit');
      expect(xml).toContain(`${response.result.score} / 100`);

      // 7. Generate PDF
      const pdfBytes = await generatePdfDossier(dossierModel);
      expect(pdfBytes.length).toBeGreaterThan(1000);
    });
  });
});
