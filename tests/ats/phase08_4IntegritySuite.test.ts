// ============================================================
// HIREFLOW ATS RESUME ROASTER — PHASE 08.4
// Final Scoring Authority, Scope-Correct Seniority & ScoreTrace Integrity Suite
// Verifies Gates 1-6:
//   Gate 1: Scope-specific seniority bounds (PROFESSIONAL vs TOTAL, Northstar BELOW_REQUIREMENT)
//   Gate 2: Unified 7-dimension authoritative ScoreTrace (zero dual scorer / composite overwrite)
//   Gate 3: Elimination of double penalties across formatAndParse & penalties ledger
//   Gate 4: Complete 7-enum ClaimSupportStatus round-trip (Snapshot -> History -> PDF -> DOCX)
//   Gate 5 & 6: Frozen Benchmark V2 reconciliation & end-to-end export parity
// ============================================================

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { runAtsEngine } from '@/features/ats/engine';
import { evaluateSeniorityFit } from '@/features/ats/engine/seniorityMatcher';
import { computeAtsScore } from '@/features/ats/engine/scorer';
import {
  createAuthoritativeReportSnapshot,
  serializeSnapshot,
  deserializeSnapshot,
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

describe('HireFlow ATS Resume Roaster — Phase 08.4 Final Scoring & Seniority Integrity', () => {
  const ANCHOR_NOV_2024 = new Date(2024, 10, 24);

  // ============================================================
  // GATE 1: PROFESSIONAL-SCOPE SENIORITY EVALUATION (7 SCENARIOS)
  // ============================================================
  describe('Gate 1: Scope-Specific Seniority Evaluation & Duration Measures', () => {
    it('1. Northstar year-only employment with internship excluded -> BELOW_REQUIREMENT (35m touched, 34m completed vs 36m)', () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: ANCHOR_NOV_2024,
      });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const sm = response.result.seniorityMatchResult!;
      expect(sm.scope).toBe('PROFESSIONAL');
      expect(sm.provenance).toBe('EXPLICIT_EMPLOYER');
      expect(sm.status).toBe('BELOW_REQUIREMENT');
      expect(sm.isEligible).toBe(false);
      expect(sm.requiredMonths).toBe(36);
      expect(sm.touchedMonths).toBe(35);
      expect(sm.demonstratedMonths).toBe(35);
      expect(sm.completedMonths).toBe(34);
      expect(sm.minPossibleQualifyingMonths).toBe(24);
      expect(sm.maxPossibleQualifyingMonths).toBe(35);
      expect(sm.minPossibleCompletedQualifyingMonths).toBe(23);
      expect(sm.maxPossibleCompletedQualifyingMonths).toBe(34);
      expect(sm.touchedShortfallMonths).toBe(1);
      expect(sm.completedShortfallMonths).toBe(2);
      expect(sm.tenureBreakdown.internshipMonths).toBe(24);
      expect(sm.explanation).toContain('excluded from professional eligibility');
    });

    it('2. Professional bounds wholly below requirement -> BELOW_REQUIREMENT', () => {
      const employment = [
        { employerName: 'Corp A', originalDateText: '2023 - Present', startYear: 2023, isCurrent: true, employmentType: 'FULL_TIME' as const },
        { employerName: 'Intern B', originalDateText: '2020 - 2022', startYear: 2020, endYear: 2022, employmentType: 'INTERNSHIP' as const },
      ];
      // Max professional touched at Nov 2024 = Jan 2023..Nov 2024 = 23m (< 24m required)
      const res = evaluateSeniorityFit(employment, 'Required: 2+ years of professional experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(res.status).toBe('BELOW_REQUIREMENT');
      expect(res.maxPossibleQualifyingMonths).toBe(23);
      expect(res.isEligible).toBe(false);
    });

    it('3. Professional bounds crossing requirement -> AMBIGUOUS', () => {
      const employment = [
        { employerName: 'Corp A', originalDateText: '2022 - Present', startYear: 2022, isCurrent: true, employmentType: 'FULL_TIME' as const },
      ];
      // Min touched = 24m (Dec 2022..Nov 2024), Max touched = 35m (Jan 2022..Nov 2024)
      // Requirement = 30m lies strictly inside [24m, 35m]
      const res = evaluateSeniorityFit(employment, [{
        rawText: 'Required: 2.5 years professional experience',
        requiredYears: 2.5,
        requiredMonths: 30,
        scope: 'PROFESSIONAL',
        provenance: 'EXPLICIT_EMPLOYER',
      }], { asOfDate: ANCHOR_NOV_2024 });

      expect(res.status).toBe('AMBIGUOUS');
      expect(res.minPossibleQualifyingMonths).toBe(24);
      expect(res.maxPossibleQualifyingMonths).toBe(35);
      expect(res.isEligible).toBe(false);
    });

    it('4. Professional bounds wholly meeting/exceeding requirement -> MEETS_REQUIREMENT / EXCEEDS_REQUIREMENT', () => {
      const employment = [
        { employerName: 'Corp A', originalDateText: '2020 - Present', startYear: 2020, isCurrent: true, employmentType: 'FULL_TIME' as const },
      ];
      // Min touched = 48m, min completed = 47m (>= 36m required -> MEETS_REQUIREMENT; < 48m completed so not EXCEEDS)
      const res = evaluateSeniorityFit(employment, 'Required: 3+ years of professional experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(res.minPossibleQualifyingMonths).toBe(48);
      expect(res.minPossibleCompletedQualifyingMonths).toBe(47);
      expect(res.status).toBe('MEETS_REQUIREMENT');
      expect(res.isEligible).toBe(true);

      // 2019 - Present -> min completed = 59m >= 48m -> EXCEEDS_REQUIREMENT
      const resExceeds = evaluateSeniorityFit(
        [{ employerName: 'Corp A', originalDateText: '2019 - Present', startYear: 2019, isCurrent: true, employmentType: 'FULL_TIME' as const }],
        'Required: 3+ years of professional experience',
        { asOfDate: ANCHOR_NOV_2024 }
      );
      expect(resExceeds.minPossibleCompletedQualifyingMonths).toBe(59);
      expect(resExceeds.status).toBe('EXCEEDS_REQUIREMENT');
      expect(resExceeds.isEligible).toBe(true);
    });

    it('5. Identical work history evaluated under PROFESSIONAL vs TOTAL scopes produces distinct scope decisions', () => {
      const employment = [
        { employerName: 'DataFlow Analytics', originalDateText: '2022 - Present', startYear: 2022, isCurrent: true, employmentType: 'FULL_TIME' as const },
        { employerName: 'CloudScale Labs', originalDateText: '2021 - 2022', startYear: 2021, endYear: 2022, employmentType: 'INTERNSHIP' as const },
      ];

      const profRes = evaluateSeniorityFit(employment, 'Required: 3+ years of professional experience', { asOfDate: ANCHOR_NOV_2024 });
      const totalRes = evaluateSeniorityFit(employment, 'Required: 3+ years of total experience', { asOfDate: ANCHOR_NOV_2024 });

      expect(profRes.scope).toBe('PROFESSIONAL');
      expect(profRes.maxPossibleQualifyingMonths).toBe(35);
      expect(profRes.status).toBe('BELOW_REQUIREMENT');

      expect(totalRes.scope).toBe('TOTAL');
      expect(totalRes.minPossibleQualifyingMonths).toBe(26);
      expect(totalRes.maxPossibleQualifyingMonths).toBe(47);
      expect(totalRes.status).toBe('AMBIGUOUS');
    });

    it('6. Current active month vs completed month boundary -> PARTIALLY_MEETS_REQUIREMENT when reaching threshold only via active month', () => {
      const employment = [
        { employerName: 'Cloud Co', originalDateText: 'Dec 2021 - Present', startYear: 2021, startMonth: 'Dec', isCurrent: true, employmentType: 'FULL_TIME' as const },
      ];
      // At Nov 24, 2024: Dec 2021..Nov 2024 = 36 touched, 35 completed
      const res = evaluateSeniorityFit(employment, 'Required: 3+ years of professional experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(res.touchedMonths).toBe(36);
      expect(res.completedMonths).toBe(35);
      expect(res.reachesRequirementOnlyViaActiveMonth).toBe(true);
      expect(res.status).toBe('PARTIALLY_MEETS_REQUIREMENT');
      expect(res.completedShortfallMonths).toBe(1);
      expect(res.isEligible).toBe(false);
    });

    it('7. Concurrent internship and full-time employment does not inflate PROFESSIONAL or double-count TOTAL', () => {
      const employment = [
        { employerName: 'FTE Corp', originalDateText: 'Jan 2023 - Dec 2023', startYear: 2023, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', employmentType: 'FULL_TIME' as const },
        { employerName: 'Concurrent Intern', originalDateText: 'Jun 2023 - Dec 2023', startYear: 2023, startMonth: 'Jun', endYear: 2023, endMonth: 'Dec', employmentType: 'INTERNSHIP' as const },
      ];
      const profRes = evaluateSeniorityFit(employment, 'Required: 1+ years of professional experience', { asOfDate: ANCHOR_NOV_2024 });
      const totalRes = evaluateSeniorityFit(employment, 'Required: 1+ years of total experience', { asOfDate: ANCHOR_NOV_2024 });

      expect(profRes.touchedMonths).toBe(12);
      expect(totalRes.touchedMonths).toBe(12); // Interval union prevents double counting!
      expect(profRes.tenureBreakdown.internshipMonths).toBe(7);
    });
  });

  // ============================================================
  // GATE 2: UNIFIED AUTHORITATIVE SCORETRACE INVARIANTS
  // ============================================================
  describe('Gate 2: Unified Authoritative 7-Dimension ScoreTrace Invariants', () => {
    it('enforces single-source ScoreTrace math across pillars, adjustments, snapshot, and fresher redistribution', () => {
      for (const [resume, jd] of [
        [BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD],
        [BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD],
      ]) {
        const response = runAtsEngine(resume, jd, { today: ANCHOR_NOV_2024 });
        expect(response.success).toBe(true);
        if (!response.success) return;

        const { result } = response;
        const trace = result.trace!;
        const snapshot = createAuthoritativeReportSnapshot(result, resume, jd);

        expect(trace.specVersion).toBe('4.0.0-ats7d');
        expect(trace.pillars.length).toBe(7);

        // Sum of 7 pillars === rawSubtotal
        const pillarSum = Math.round(trace.pillars.reduce((acc, p) => acc + p.contribution, 0) * 10) / 10;
        expect(pillarSum).toBe(trace.rawSubtotal);
        expect(snapshot.scoring.rawSubtotal).toBe(pillarSum);

        // Adjustments 1:1 with penalties (no duplicates, no hidden bonuses)
        const adjSum = trace.adjustments.reduce((acc, a) => acc + a.delta, 0);
        const penSum = result.penalties.reduce((acc, p) => acc + p.points, 0);
        expect(adjSum).toBe(penSum);
        expect(trace.totalDeductions).toBe(Math.abs(penSum));

        // PreClamp & Final formula
        const expectedPreClamp = Math.round((pillarSum + (trace.totalBonuses || 0) - (trace.totalDeductions || 0)) * 10) / 10;
        expect(trace.preClampScore).toBe(expectedPreClamp);
        const expectedFinal = Math.max(0, Math.min(100, Math.round(expectedPreClamp)));
        expect(result.score).toBe(expectedFinal);
        expect(trace.composite).toBe(expectedFinal);
        expect(trace.compositeDisplay).toBe(expectedFinal);
        expect(snapshot.scoring.score).toBe(expectedFinal);

        // Exact pillar <-> snapshot dimension agreement
        for (let i = 0; i < 7; i++) {
          expect(snapshot.scoring.dimensions[i].id).toBe(trace.pillars[i].id);
          expect(snapshot.scoring.dimensions[i].contribution).toBe(trace.pillars[i].contribution);
          expect(snapshot.scoring.dimensions[i].nominalWeight).toBe(trace.pillars[i].nominalWeight);
          expect(snapshot.scoring.dimensions[i].effectiveWeight).toBe(trace.pillars[i].effectiveWeight);
        }
      }
    });
  });

  // ============================================================
  // GATE 3: AUDIT POSSIBLE DOUBLE PENALTIES (4 EDUCATION SCENARIOS)
  // ============================================================
  describe('Gate 3: Single-Owner Penalty Accounting (4 Education Scenarios + Contact Info)', () => {
    const baseExp = [{
      company: 'Acme',
      title: 'Engineer',
      dateRangeStr: 'Jan 2021 - Dec 2023',
      startYear: 2021,
      endYear: 2023,
      bullets: [
        { rawText: 'Built Python API', wordCount: 3, hasStrongVerb: true, hasWeakPhrase: false, hasMetric: false, hasTechMention: true, score: 70, issues: [] },
      ],
      charStart: 0,
      charEnd: 100,
    }];
    const baseSkills = [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must' as const, weight: 5, found: true, evidence: [], proficiency: 3, status: 'verified' as const }];
    const fullContact = { name: 'Jane Doe', email: 'jane@example.com', phone: '9876543210', linkedin: null, github: null, portfolio: null };

    it('Scenario A: Education absent entirely -> -3 missing_education penalty ONLY (formatAndParse stays 10)', () => {
      const score = computeAtsScore({
        wordCount: 300,
        skillResults: baseSkills,
        experience: baseExp,
        projects: [],
        contactInfo: fullContact,
        sections: [
          { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Worked on Python.', charStart: 0, charEnd: 50 },
          { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 51, charEnd: 70 },
        ],
        candidateYears: 3,
        requiredYears: 2,
        targetTier: 'top_product',
      });
      expect(score.subscores.formatAndParse).toBe(10);
      expect(score.penalties.filter(p => p.id === 'missing_education').length).toBe(1);
      expect(score.penalties.find(p => p.id === 'missing_education')?.points).toBe(-3);
      expect(score.penalties.find(p => p.id === 'missing_education')?.owner).toBe('penalties');
    });

    it('Scenario B: Education present under unconventional heading ("Academic Background") -> 0 penalty, formatAndParse=10', () => {
      const resumeText = `Jane Doe\njane@example.com | +91 98765 43210\n\nEXPERIENCE\nEngineer | Acme | Jan 2021 - Dec 2023\n- Built distributed Python services handling 5,000 RPS.\n\nACADEMIC BACKGROUND\nB.Tech in Computer Science, NIT Trichy (2017 - 2021)\n\nSKILLS\nPython, SQL`;
      const res = runAtsEngine(resumeText, 'Backend Engineer\nRequirements:\n- Python', { today: ANCHOR_NOV_2024 });
      expect(res.success).toBe(true);
      if (!res.success) return;
      expect(res.result.subscores.formatAndParse).toBe(10);
      expect(res.result.penalties.some(p => p.id === 'missing_education')).toBe(false);
    });

    it('Scenario C: Education content inline without section header -> -1 formatAndParse hygiene ONLY, 0 missing_education penalty', () => {
      const score = computeAtsScore({
        wordCount: 300,
        skillResults: baseSkills,
        experience: baseExp,
        projects: [],
        contactInfo: fullContact,
        sections: [
          { type: 'summary', rawTitle: 'SUMMARY', content: 'B.Tech Computer Science graduate building Python APIs.', charStart: 0, charEnd: 60 },
          { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Built APIs.', charStart: 61, charEnd: 80 },
          { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 81, charEnd: 100 },
        ],
        candidateYears: 3,
        requiredYears: 2,
        targetTier: 'top_product',
      });
      expect(score.subscores.formatAndParse).toBe(9);
      expect(score.trace.pillars.find(p => p.id === 'formatAndParse')?.flags).toContain('INLINE_EDUCATION_NO_HEADER');
      expect(score.penalties.some(p => p.id === 'missing_education')).toBe(false);
    });

    it('Scenario D: Education section present but empty/unparseable -> -1 formatAndParse hygiene ONLY, 0 missing_education penalty', () => {
      const score = computeAtsScore({
        wordCount: 300,
        skillResults: baseSkills,
        experience: baseExp,
        projects: [],
        contactInfo: fullContact,
        sections: [
          { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Worked on Python.', charStart: 0, charEnd: 50 },
          { type: 'education', rawTitle: 'EDUCATION', content: '   ', charStart: 51, charEnd: 55 },
          { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 56, charEnd: 70 },
        ],
        candidateYears: 3,
        requiredYears: 2,
        targetTier: 'top_product',
      });
      expect(score.subscores.formatAndParse).toBe(9);
      expect(score.trace.pillars.find(p => p.id === 'formatAndParse')?.flags).toContain('EMPTY_EDUCATION_SECTION');
      expect(score.penalties.some(p => p.id === 'missing_education')).toBe(false);
    });

    it('Missing contact info is penalized ONCE via no_contact_info (-5), NOT duplicated in formatAndParse', () => {
      const score = computeAtsScore({
        wordCount: 300,
        skillResults: baseSkills,
        experience: baseExp,
        projects: [],
        contactInfo: { name: 'Jane Doe', email: null, phone: null, linkedin: null, github: null, portfolio: null },
        sections: [
          { type: 'experience', rawTitle: 'EXPERIENCE', content: 'Worked on Python.', charStart: 0, charEnd: 50 },
          { type: 'education', rawTitle: 'EDUCATION', content: 'B.Tech CS', charStart: 51, charEnd: 65 },
          { type: 'skills', rawTitle: 'SKILLS', content: 'Python', charStart: 66, charEnd: 80 },
        ],
        candidateYears: 3,
        requiredYears: 2,
        targetTier: 'top_product',
      });
      expect(score.subscores.formatAndParse).toBe(10);
      expect(score.penalties.find(p => p.id === 'no_contact_info')?.points).toBe(-5);
    });
  });

  // ============================================================
  // GATE 4: COMPLETE 7-ENUM CLAIM-SUPPORT ROUND-TRIP PRESERVATION
  // ============================================================
  describe('Gate 4: Complete ClaimSupportStatus Round-Trip Across Snapshot -> History -> PDF -> DOCX', () => {
    const ALL_7_CLAIM_SUPPORT_STATUSES: ClaimSupportStatus[] = [
      'DIRECTLY_SUPPORTED',
      'CONTEXTUALLY_SUPPORTED',
      'PARTIALLY_SUPPORTED',
      'RELATED_ONLY',
      'NOT_SUPPORTED',
      'CONTRADICTED',
      'AMBIGUOUS',
    ];

    const PAIRED_VALIDATION_STATUSES: CitationValidationStatus[] = [
      'VERIFIED_EXACT',
      'VERIFIED_CONTEXTUAL',
      'PARTIALLY_SUPPORTED',
      'INVALID_QUOTE',
      'WRONG_SECTION',
      'CONTEXT_MISMATCH',
      'UNRESOLVED',
    ];

    it('preserves all 7 ClaimSupportStatus values orthogonally alongside granular validationStatus through PDF and DOCX', async () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
      expect(response.success).toBe(true);
      if (!response.success) return;

      const baseSnapshot = createAuthoritativeReportSnapshot(response.result, BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD);

      const citations: AuthoritativeCitation[] = ALL_7_CLAIM_SUPPORT_STATUSES.map((cs, idx) => {
        const vs = PAIRED_VALIDATION_STATUSES[idx];
        return {
          id: `cit_cs_${idx}`,
          competencyId: `skill_cs_${cs.toLowerCase()}`,
          originalQuotation: `Citation quote ${idx} verifying ${cs} with ${vs}`,
          charStart: idx * 20,
          charEnd: idx * 20 + 30,
          sourceSection: 'experience',
          sourceType: 'PROFESSIONAL_EXPERIENCE',
          environmentMaturity: 'PRODUCTION',
          candidateContribution: 'INDIVIDUAL_CONTRIBUTOR',
          claimType: 'TECHNICAL_IMPLEMENTATION',
          validationStatus: vs,
          presentationValidationLabel: toCitationPresentationLabel(vs),
          claimSupport: cs,
          validationReasons: [`Test claim support ${cs}`],
          validationConfidence: 0.9,
        };
      });

      const snapshot = {
        ...baseSnapshot,
        evidence: { ...baseSnapshot.evidence, citations },
      };

      const restored = deserializeSnapshot(serializeSnapshot(snapshot));
      for (let i = 0; i < ALL_7_CLAIM_SUPPORT_STATUSES.length; i++) {
        expect(restored.evidence.citations[i].claimSupport).toBe(ALL_7_CLAIM_SUPPORT_STATUSES[i]);
        expect(restored.evidence.citations[i].validationStatus).toBe(PAIRED_VALIDATION_STATUSES[i]);
      }

      const auditInput = atsToAuditInput({
        result: response.result,
        resumeText: BENCHMARK_A_V2_PAYTECH_RESUME,
        jdText: BENCHMARK_A_JD,
        source: 'upload',
      });
      const reopenedModel = buildDossierModel({
        entry: {
          id: 'hist-cs-7',
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

      const pdfText = await extractTextFromPdfBytes(await generatePdfDossier(reopenedModel));
      const docxXml = await extractDocxDocumentXml(await generateDocxDossier(reopenedModel));

      for (const [idx, cs] of ALL_7_CLAIM_SUPPORT_STATUSES.entries()) {
        const vs = PAIRED_VALIDATION_STATUSES[idx];
        expect(pdfText).toContain(`Claim Support: ${cs}`);
        expect(pdfText).toContain(`Quote Validity: ${vs}`);
        expect(docxXml).toContain(cs);
        expect(docxXml).toContain(vs);
      }
    });
  });

  // ============================================================
  // GATE 5 & 6: BENCHMARK RECONCILIATION & INTERNSHIP NON-SATISFACTION
  // ============================================================
  describe('Gate 5 & 6: Frozen Benchmark V2 Reconciliation & Internship Exclusion Guard', () => {
    it('fails Northstar professional eligibility even if internship duration is extended to 5+ years', () => {
      expect(sha256(BENCHMARK_B_V2_DATAFLOW_RESUME)).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_b_v2_dataflow_lf);
      expect(sha256(BENCHMARK_B_JD)).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_b_jd_lf);

      const extendedInternResume = BENCHMARK_B_V2_DATAFLOW_RESUME.replace(
        'Data Engineering Intern | CloudScale Labs | 2021 - 2022',
        'Data Engineering Intern | CloudScale Labs | 2017 - 2022'
      );

      const res = runAtsEngine(extendedInternResume, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });
      expect(res.success).toBe(true);
      if (!res.success) return;

      const sm = res.result.seniorityMatchResult!;
      // Internship grew to ~60-72m, yet PROFESSIONAL requirement MUST still fail!
      expect(sm.tenureBreakdown.internshipMonths).toBeGreaterThanOrEqual(60);
      expect(sm.maxPossibleQualifyingMonths).toBe(35);
      expect(sm.status).toBe('BELOW_REQUIREMENT');
      expect(sm.isEligible).toBe(false);
    });
  });
});
