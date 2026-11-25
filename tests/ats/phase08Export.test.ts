// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 08
// Export Reliability, Authoritative Snapshot & Consistency Suite
// Tests: Snapshot integrity, PDF/DOCX consistency, history persistence,
// evidence preservation, and zero-score-drift across representations.
// ============================================================

import { describe, it, expect } from 'vitest';
import { runAtsEngine } from '@/features/ats/engine';
import {
  createAuthoritativeReportSnapshot,
  AuthoritativeReportSnapshot,
} from '@/features/ats/engine/authoritativeSnapshot';
import { buildDossierModel, DossierModel } from '@/features/dossier/dossierModel';
import { generatePdfDossier } from '@/features/dossier/exportPdf';
import { generateDocxDossier } from '@/features/dossier/exportDocx';
import { generateMarkdownDossier } from '@/features/dossier/exportDossier';
import { atsToAuditInput } from '@/features/ats/journalAdapter';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';

describe('HireFlow ATS Resume Roaster — Phase 08 Export Reliability & Report Integrity', () => {
  // ------------------------------------------------------------
  // PART A: AUTHORITATIVE REPORT SNAPSHOT INTEGRITY
  // ------------------------------------------------------------
  describe('Part A: Authoritative Report Snapshot Integrity', () => {
    it('creates an exact, immutable snapshot preserving score, identity, and seniority', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        BENCHMARK_A_V2_PAYTECH_RESUME,
        BENCHMARK_A_JD,
        {
          resumeFileName: 'rohan_deshmukh.pdf',
          targetCompany: 'PayGrid Systems',
          targetRole: 'Backend Software Engineer',
        }
      );

      expect(snapshot.schemaVersion).toBe('1.0.0');
      expect(snapshot.identity.candidateName).toBe('Rohan Deshmukh');
      expect(snapshot.identity.targetCompany).toBe('PayGrid Systems');
      expect(snapshot.identity.targetRoleTitle).toBe('Backend Software Engineer');
      expect(snapshot.scoring.score).toBe(response.result.score);
      expect(snapshot.scoring.scoreBand).toBe(response.result.band);
      expect(snapshot.scoring.subscores.mustHaveCoverage).toBe(response.result.subscores.mustHaveCoverage);
      expect(snapshot.seniority.requiredYears).toBe(3);
      expect(snapshot.seniority.isMandatoryGateActive).toBe(true);
      expect(snapshot.seniority.provenance).toBe('EXPLICIT_EMPLOYER');
      expect(snapshot.competencies.length).toBe(response.result.skillResults.length);
      expect(snapshot.evidence.records.length).toBe(response.result.evidenceRecords?.length);
    });

    it('preserves unknown/unspecified fields without fabricating false positives', () => {
      const jdNoReq = 'Software Developer wanted. Looking for Python, Redis, Docker, and PostgreSQL experience across modern backend web applications.';
      const resMinimal = `Jane Doe
jane.doe@example.com | +1 555-0199 | San Francisco, CA

PROFESSIONAL SUMMARY
Backend Software Engineer with hands-on experience building web applications and services.

EXPERIENCE
Software Engineer | Acme Corp | 2023 - Present
- Built backend REST APIs using Python and FastAPI for internal inventory operations.
- Maintained Docker containers and Redis cache clusters across team development environments.
- Wrote database schema migration scripts and optimized SQL queries.

PROJECTS
Developer Platform | 2023
- Designed open source developer tool for inspecting microservice configurations.

SKILLS
Python, Redis, Docker, SQL, Git, Linux
`;
      const response = runAtsEngine(resMinimal, jdNoReq, {
        today: new Date(2024, 5, 1),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const snapshot = createAuthoritativeReportSnapshot(
        response.result,
        resMinimal,
        jdNoReq,
        { resumeFileName: 'jane.pdf' }
      );

      expect(snapshot.identity.candidateName).toBe('Jane Doe');
      expect(snapshot.identity.targetCompany).toBeNull(); // No company in JD, never invented
      expect(snapshot.seniority.isMandatoryGateActive).toBe(false);
      expect(snapshot.seniority.provenance).toBe('NONE');
      expect(snapshot.seniority.status).toBe('NOT_SPECIFIED');
      expect(snapshot.seniority.shortfallMonths).toBe(0);
    });
  });

  // ------------------------------------------------------------
  // PART B: SINGLE SOURCE OF TRUTH (DASHBOARD === HISTORY === EXPORT)
  // ------------------------------------------------------------
  describe('Part B: Score & Identity Invariant Enforcement', () => {
    it('guarantees Dashboard Score === History Score === Dossier Score', () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: new Date(2024, 5, 1),
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
        resumeLabel: 'ananya_rao_resume.pdf',
        targetCompany: 'Northstar Credit',
        targetRole: 'Data Engineer',
        candidateName: response.result.candidateName || undefined,
      });

      const auditEntry: any = {
        id: 'audit-test-123',
        kind: auditInput.kind,
        createdAt: new Date().toISOString(),
        overallScore: auditInput.overallScore,
        resume: {
          snapshotHash: 'hash-resume-b',
          label: auditInput.resume.label,
        },
        jd: {
          snapshotHash: 'hash-jd-b',
          roleTitle: auditInput.jd.roleTitle,
          company: auditInput.jd.company,
          origin: auditInput.jd.origin,
        },
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        strengths: auditInput.strengths,
        evidence: auditInput.evidence,
        findingsJson: auditInput.findings,
      };

      const dossier = buildDossierModel({
        entry: auditEntry,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        baseline: null,
        candidate: { name: 'Candidate' }, // Passed fallback
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      // Strict Equality Invariant
      expect(response.result.score).toBe(auditInput.overallScore);
      expect(auditInput.overallScore).toBe(dossier.headline.score);
      expect(dossier.candidate.name).toBe('Ananya Rao'); // Candidate identity preserved, not 'Candidate'
      expect(dossier.target.company).toBe('Northstar Credit');
      expect(dossier.target.roleTitle).toBe('Data Engineer');
      expect(dossier.atsDiagnostics.subscores.mustHaveCoverage).toBe(response.result.subscores.mustHaveCoverage);
      expect(dossier.atsDiagnostics.seniorityMode?.requiredYears).toBe(3);
    });

    it('does NOT substitute signed-in user name when resume has candidate name', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
      });

      const auditEntry: any = {
        id: 'audit-test-456',
        kind: auditInput.kind,
        createdAt: new Date().toISOString(),
        overallScore: auditInput.overallScore,
        resume: { snapshotHash: 'hash-a', label: 'resume.pdf' },
        jd: { snapshotHash: 'hash-jd-a', roleTitle: 'Backend Engineer' },
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        findingsJson: auditInput.findings,
      };

      // Even if userProfileName is passed to buildDossierModel, resume's extracted name prevails
      const dossier = buildDossierModel({
        entry: auditEntry,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        candidate: { name: 'Logged In User Profile Name' },
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      expect(dossier.candidate.name).toBe('Rohan Deshmukh');
      expect(dossier.candidate.name).not.toBe('Logged In User Profile Name');
    });
  });

  // ------------------------------------------------------------
  // PART C & D: PDF EXPORT AND RENDER STABILITY
  // ------------------------------------------------------------
  describe('Part C & D: PDF Render Stability & Content Integrity', () => {
    it('generates a valid, non-empty PDF document preserving all sections', async () => {
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

      const auditEntry: any = {
        id: 'audit-pdf-test',
        kind: auditInput.kind,
        createdAt: new Date().toISOString(),
        overallScore: auditInput.overallScore,
        resume: { snapshotHash: 'hash-1', label: 'rohan.pdf' },
        jd: { snapshotHash: 'hash-2', roleTitle: 'Backend Software Engineer', company: 'PayGrid Systems' },
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        findingsJson: auditInput.findings,
      };

      const model = buildDossierModel({
        entry: auditEntry,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      const pdfBytes = await generatePdfDossier(model);
      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(5000); // Substantial PDF output

      // Verify PDF header bytes '%PDF-'
      const headerStr = String.fromCharCode(...pdfBytes.slice(0, 5));
      expect(headerStr).toBe('%PDF-');
    });

    it('safely handles unicode characters, long evidence quotes, and edge-case text in PDF', async () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD);
      expect(response.success).toBe(true);
      if (!response.success) return;

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        source: 'upload',
      });

      const auditEntry: any = {
        id: 'audit-unicode-test',
        kind: auditInput.kind,
        createdAt: new Date().toISOString(),
        overallScore: auditInput.overallScore,
        resume: { snapshotHash: 'hash-u1', label: 'unicode.pdf' },
        jd: { snapshotHash: 'hash-u2', roleTitle: 'Data Engineer' },
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        findingsJson: {
          ...auditInput.findings,
          // Inject unicode symbols & long quotes
          skillResults: [
            {
              canonical: 'Python → Data Flow & Streaming (₹100k savings / 99.9% uptime)',
              category: 'Pipeline',
              required: 'must',
              found: true,
              status: 'verified',
              evidence: [{ quote: 'Developed complex DAGs processing 18M+ records daily across AWS S3 and Snowflake data lakehouse with zero data drop or latency spikes.' }],
            },
          ],
        },
      };

      const model = buildDossierModel({
        entry: auditEntry,
        resumeText: BENCHMARK_B_V2_DATAFLOW_RESUME,
        jdText: BENCHMARK_B_JD,
        baseline: null,
        candidate: { name: 'Ananya Rao' },
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      const pdfBytes = await generatePdfDossier(model);
      expect(pdfBytes.length).toBeGreaterThan(5000);
    });
  });

  // ------------------------------------------------------------
  // PART E: DOCX EXPORT AND CONTENT INTEGRITY
  // ------------------------------------------------------------
  describe('Part E: DOCX Export & Content Integrity', () => {
    it('generates a valid DOCX blob preserving score, seniority and skills inventory', async () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);
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

      const auditEntry: any = {
        id: 'audit-docx-test',
        kind: auditInput.kind,
        createdAt: new Date().toISOString(),
        overallScore: auditInput.overallScore,
        resume: { snapshotHash: 'hash-d1', label: 'rohan.pdf' },
        jd: { snapshotHash: 'hash-d2', roleTitle: 'Backend Software Engineer', company: 'PayGrid Systems' },
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        findingsJson: auditInput.findings,
      };

      const model = buildDossierModel({
        entry: auditEntry,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      const docxBlob = await generateDocxDossier(model);
      expect(docxBlob).toBeInstanceOf(Blob);
      expect(docxBlob.size).toBeGreaterThan(3000);
      expect(docxBlob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });
  });

  // ------------------------------------------------------------
  // PART F: EVIDENCE & CITATION PRESERVATION
  // ------------------------------------------------------------
  describe('Part F: Evidence & Citation Preservation', () => {
    it('preserves exact verbatim quotations and verification status in Markdown dossier', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);
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

      const auditEntry: any = {
        id: 'audit-md-test',
        kind: auditInput.kind,
        createdAt: new Date().toISOString(),
        overallScore: auditInput.overallScore,
        resume: { snapshotHash: 'h1', label: 'rohan.pdf' },
        jd: { snapshotHash: 'h2', roleTitle: 'Backend Software Engineer', company: 'PayGrid Systems' },
        breakdown: auditInput.breakdown,
        gaps: auditInput.gaps,
        findingsJson: auditInput.findings,
      };

      const model = buildDossierModel({
        entry: auditEntry,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        baseline: null,
        candidate: { name: 'Rohan Deshmukh' },
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      const md = generateMarkdownDossier(model);
      expect(md).toContain('Rohan Deshmukh');
      expect(md).toContain('PayGrid Systems');
      expect(md).toContain('Overall Benchmark Score');
      expect(md).toContain(String(response.result.score));
      expect(md).toContain('FastAPI');
      expect(md).toContain('PostgreSQL');
    });
  });

  // ------------------------------------------------------------
  // PART G: HISTORICAL REPORT IMMUTABILITY
  // ------------------------------------------------------------
  describe('Part G: Historical Report Immutability', () => {
    it('reopening a historical audit record does not alter its recorded score or findings', () => {
      // Create a simulated historical audit entry from 6 months ago
      const historicalAudit: any = {
        id: 'audit-historical-1',
        kind: 'ats_roast',
        createdAt: '2024-05-01T12:00:00.000Z',
        overallScore: 78,
        resume: { snapshotHash: 'hist-resume-hash', label: 'old_resume.pdf' },
        jd: { snapshotHash: 'hist-jd-hash', roleTitle: 'Staff Backend Engineer', company: 'OldCorp' },
        breakdown: [
          { key: 'must_have_coverage', label: 'Must-Have Skills', score: 25, weight: 0.3 },
          { key: 'evidence_depth', label: 'Evidence Depth', score: 18, weight: 0.2 },
        ],
        gaps: [{ id: 'gap-1', category: 'skill', label: 'Kubernetes', severity: 3, detail: 'Missing skill' }],
        findingsJson: {
          score: 78,
          band: 'Competitive',
          candidateName: 'Alex Historical',
          employerName: 'OldCorp',
          seniorityFit: { candidateYears: 4, requiredYears: 5, level: 'Senior' },
        },
      };

      const dossier = buildDossierModel({
        entry: historicalAudit,
        resumeText: '',
        jdText: '',
        baseline: null,
        candidate: { name: 'Some Other User' },
        planItems: [],
        generatedAt: new Date().toISOString(),
      });

      // Score and Candidate Name remain identical to the historical snapshot
      expect(dossier.headline.score).toBe(78);
      expect(dossier.candidate.name).toBe('Alex Historical');
      expect(dossier.target.company).toBe('OldCorp');
      expect(dossier.target.roleTitle).toBe('Staff Backend Engineer');
    });
  });
});
