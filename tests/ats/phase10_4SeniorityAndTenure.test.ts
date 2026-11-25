// ============================================================
// ATS Resume Roaster — Phase 10.4 Seniority, Scope Separation & Tenure Precision
// Covers Workstream A (A1-A5):
//   A1: Zero-experience vs NOT_SPECIFIED clarity & JD pattern precision
//   A2: Strict scope separation (internships, academic, OSS/personal, volunteer) & unions
//   A3: Month-granular fractional experience & boundary shortfall/eligibility
//   A4: Specific competency & production scopes
//   A5: Unified experienceEstimator <-> tenureCalculator <-> seniorityMatcher parity
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  extractSeniorityRequirements,
  evaluateSeniorityFit,
} from '@/features/ats/engine/seniorityMatcher';
import {
  calculateTenure,
  calculateCompetencyTenure,
  extractIntervalFromEntry,
} from '@/features/ats/engine/tenureCalculator';
import { estimateCandidateExperience } from '@/features/ats/engine/experienceEstimator';
import { runAtsEngine } from '@/features/ats/engine';
import {
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
} from '@/features/ats/fixtures/benchmarkFixtures';

const ANCHOR_NOV_2024 = new Date(2024, 10, 24); // Nov 24, 2024

describe('Phase 10.4 — Seniority, Scope Separation & Tenure Precision', () => {
  // ============================================================
  // A1: ZERO-EXPERIENCE & UNSPECIFIED REQUIREMENT CLARITY
  // ============================================================
  describe('A1: Zero-Experience vs NOT_SPECIFIED & JD Pattern Extraction', () => {
    it('classifies JD with no experience minimum as NOT_SPECIFIED and sets shouldRedistributeWeight=true', () => {
      const jd = `
        Senior Distributed Systems Engineer
        Requirements:
        - Strong proficiency in Go, PostgreSQL, and Kubernetes
        - Experience scaling to 10+ microservices and 50M users
        - 99.9% uptime SLA ownership across team of 5 engineers
      `;
      const reqs = extractSeniorityRequirements(jd);
      expect(reqs).toEqual([]);

      const fit = evaluateSeniorityFit(
        [{ employerName: 'Tech Co', originalDateText: 'Jan 2023 - Dec 2023', employmentType: 'FULL_TIME' as const }],
        jd,
        { asOfDate: ANCHOR_NOV_2024 }
      );
      expect(fit.status).toBe('NOT_SPECIFIED');
      expect(fit.isMandatoryGateActive).toBe(false);
      expect(fit.provenance).toBe('NONE');
      expect(fit.requiredYears).toBe(0);
      expect(fit.requiredMonths).toBe(0);
      expect(fit.shortfallMonths).toBe(0);
      expect(fit.isEligible).toBe(true);
      expect(fit.scoreFactor).toBe(1.0);
      expect(fit.shouldRedistributeWeight).toBe(true);
    });

    it('distinguishes explicit 0 YOE / 0-2 years / up to 1 year / entry-level from NOT_SPECIFIED and sets shouldRedistributeWeight=true even for experienced candidates', () => {
      const zeroYoeJds = [
        'Required: 0 years of experience in software engineering',
        'Required: 0+ years of experience',
        'Required: 0-2 years of backend development experience',
        'Required: 0 to 2 years of experience',
        'Required: up to 1 year of software engineering experience',
        'Graduate Engineer Trainee / New Grad Software Engineer',
      ];

      const experiencedCandidate = [
        {
          employerName: 'Senior Corp',
          originalDateText: 'Jan 2019 - Dec 2023',
          startYear: 2019,
          startMonth: 'Jan',
          endYear: 2023,
          endMonth: 'Dec',
          employmentType: 'FULL_TIME' as const,
        },
      ];
      const fresherCandidate = [
        {
          employerName: 'Intern Co',
          originalDateText: 'Jan 2024 - Jun 2024',
          startYear: 2024,
          startMonth: 'Jan',
          endYear: 2024,
          endMonth: 'Jun',
          employmentType: 'INTERNSHIP' as const,
        },
      ];

      for (const jd of zeroYoeJds) {
        const reqs = extractSeniorityRequirements(jd);
        expect(reqs.length).toBeGreaterThanOrEqual(1);
        expect(reqs[0].requiredYears).toBe(0);
        expect(reqs[0].requiredMonths).toBe(0);
        expect(reqs[0].provenance).toBe('EXPLICIT_EMPLOYER');

        for (const cand of [experiencedCandidate, fresherCandidate]) {
          const fit = evaluateSeniorityFit(cand, jd, { asOfDate: ANCHOR_NOV_2024 });
          expect(fit.status).toBe('MEETS_REQUIREMENT');
          expect(fit.isMandatoryGateActive).toBe(true);
          expect(fit.provenance).toBe('EXPLICIT_EMPLOYER');
          expect(fit.requiredMonths).toBe(0);
          expect(fit.shortfallMonths).toBe(0);
          expect(fit.isEligible).toBe(true);
          expect(fit.scoreFactor).toBe(1.0);
          expect(fit.shouldRedistributeWeight).toBe(true);
        }
      }
    });

    it('extracts fractional years, month-based thresholds, and minimum/at-least phrases while rejecting false numeric triggers', () => {
      const r1 = extractSeniorityRequirements('Required: 1.5+ years of Python experience');
      expect(r1[0].requiredYears).toBe(1.5);
      expect(r1[0].requiredMonths).toBe(18);
      expect(r1[0].scope).toBe('SPECIFIC_COMPETENCY');
      expect(r1[0].competency).toBe('python');

      const r2 = extractSeniorityRequirements('Required: 18+ months of software engineering experience');
      expect(r2[0].requiredMonths).toBe(18);
      expect(r2[0].requiredYears).toBe(1.5);
      expect(r2[0].scope).toBe('PROFESSIONAL');

      const r3 = extractSeniorityRequirements('At least 3 years of backend engineering experience');
      expect(r3[0].requiredYears).toBe(3);
      expect(r3[0].requiredMonths).toBe(36);
      expect(r3[0].scope).toBe('PROFESSIONAL');

      const r4 = extractSeniorityRequirements('Minimum 2 years of experience required');
      expect(r4[0].requiredYears).toBe(2);
      expect(r4[0].requiredMonths).toBe(24);

      const r5 = extractSeniorityRequirements('Scale 10+ microservices and 50M users; 2+ years of backend experience');
      expect(r5.length).toBe(1);
      expect(r5[0].requiredYears).toBe(2);
      expect(r5[0].requiredMonths).toBe(24);

      const fitPositive = evaluateSeniorityFit(
        [{ employerName: 'Tech Co', originalDateText: 'Jan 2022 - Dec 2023', employmentType: 'FULL_TIME' as const }],
        'Minimum 2 years of experience',
        { asOfDate: ANCHOR_NOV_2024 }
      );
      expect(fitPositive.shouldRedistributeWeight).toBe(false);
    });

    it('excludes undergraduate/academic coursework durations and handles label-before-number & multi-alternative language lists', () => {
      const fresherCampusJd = `
        Microsoft — Software Engineer
        Experience Level: Fresher / University Graduate (2026-2027 Batch)
        - Bachelor's or Master's degree in Computer Science (2026-2027 graduating batch, 4+ years of undergraduate coursework and project experience).
      `;
      const campusReqs = extractSeniorityRequirements(fresherCampusJd);
      expect(campusReqs.length).toBe(1);
      expect(campusReqs[0].requiredYears).toBe(0);
      expect(campusReqs[0].requiredMonths).toBe(0);

      const campusFit = evaluateSeniorityFit(
        [{ employerName: 'Intern Lab', originalDateText: 'Jan 2024 - Jun 2024', employmentType: 'INTERNSHIP' as const }],
        fresherCampusJd,
        { asOfDate: ANCHOR_NOV_2024 }
      );
      expect(campusFit.requiredYears).toBe(0);
      expect(campusFit.status).toBe('MEETS_REQUIREMENT');
      expect(campusFit.shouldRedistributeWeight).toBe(true);

      const seniorBackendJd = `
        Senior Backend Engineer
        Experience Required: 5+ Years
        Requirements:
        - 5+ years of software engineering experience in Java, Go, or C++.
      `;
      const seniorReqs = extractSeniorityRequirements(seniorBackendJd);
      expect(seniorReqs.length).toBe(2);
      expect(seniorReqs[0].requiredYears).toBe(5);
      expect(seniorReqs[0].requiredMonths).toBe(60);
      expect(seniorReqs[0].scope).toBe('PROFESSIONAL');
      expect(seniorReqs[1].requiredYears).toBe(5);
      expect(seniorReqs[1].scope).toBe('PROFESSIONAL');
      expect(seniorReqs[1].competency).toBeUndefined();

      const seniorFit = evaluateSeniorityFit(
        [{ employerName: 'Scale Co', originalDateText: 'Jan 2016 - Dec 2023', employmentType: 'FULL_TIME' as const }],
        seniorBackendJd,
        { asOfDate: ANCHOR_NOV_2024 }
      );
      expect(seniorFit.scope).toBe('PROFESSIONAL');
      expect(seniorFit.requiredYears).toBe(5);
      expect(seniorFit.status).toBe('EXCEEDS_REQUIREMENT');
      expect(seniorFit.isEligible).toBe(true);
    });
  });

  // ============================================================
  // A2: STRICT SCOPE SEPARATION & INTERVAL UNIONS
  // ============================================================
  describe('A2: Strict Scope Separation & Overlap/Date Precision', () => {
    it('excludes internships, academic/coursework, student assistantships, personal/OSS projects, and volunteer roles from professionalMonths', () => {
      const entries = [
        { employerName: 'Prod Corp', jobTitle: 'Software Engineer', originalDateText: 'Jan 2023 - Dec 2023', employmentType: 'FULL_TIME' as const }, // 12m prof
        { employerName: 'Summer Intern Co', jobTitle: 'Software Intern', originalDateText: 'Jan 2022 - Dec 2022' }, // 12m intern (inferred from title)
        { employerName: 'State University', jobTitle: 'Graduate Teaching Assistant', originalDateText: 'Jan 2021 - Dec 2021', employmentType: 'FULL_TIME' as const }, // non-prof academic
        { employerName: 'CS Capstone', jobTitle: 'Academic Project Lead', originalDateText: 'Jan 2020 - Jun 2020', sourceType: 'ACADEMIC_PROJECT' }, // 6m non-prof
        { employerName: 'CNCF', jobTitle: 'Open Source Contributor', originalDateText: 'Jul 2020 - Dec 2020', sourceType: 'OPEN_SOURCE' }, // 6m non-prof
        { employerName: 'CodeForGood', jobTitle: 'Volunteer Backend Developer', originalDateText: 'Jan 2019 - Dec 2019', employmentType: 'VOLUNTEER' as const }, // 12m non-prof
      ];

      const tenure = calculateTenure(entries, { asOfDate: ANCHOR_NOV_2024 });
      expect(tenure.totalProfessionalMonths).toBe(12);
      expect(tenure.minPossibleProfessionalMonths).toBe(12);
      expect(tenure.maxPossibleProfessionalMonths).toBe(12);
      expect(tenure.internshipMonths).toBe(12);
      expect(tenure.projectMonths).toBe(36); // Teaching Assistant (12m) + Academic Project (6m) + OSS (6m) + Volunteer (12m)
      expect(tenure.totalWorkMonths).toBe(60);

      // PROFESSIONAL JD rejects non-professional tenure
      const profFit = evaluateSeniorityFit(entries, 'Required: 2+ years of professional software engineering experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(profFit.scope).toBe('PROFESSIONAL');
      expect(profFit.demonstratedMonths).toBe(12);
      expect(profFit.status).toBe('BELOW_REQUIREMENT');
      expect(profFit.shortfallMonths).toBe(12);
      expect(profFit.isEligible).toBe(false);

      // TOTAL JD evaluates totalWorkMonths
      const totalFit = evaluateSeniorityFit(entries, 'Required: 3+ years of total experience (including internships)', { asOfDate: ANCHOR_NOV_2024 });
      expect(totalFit.scope).toBe('TOTAL');
      expect(totalFit.demonstratedMonths).toBe(60);
      expect(totalFit.status).toBe('EXCEEDS_REQUIREMENT');
      expect(totalFit.isEligible).toBe(true);
    });

    it('never double-counts overlapping/concurrent roles and tracks contract & part-time cleanly', () => {
      const entries = [
        { employerName: 'Core FTE', jobTitle: 'Backend Engineer', originalDateText: 'Jan 2022 - Dec 2023', employmentType: 'FULL_TIME' as const }, // 24m
        { employerName: 'Concurrent Contract', jobTitle: 'Contract Engineer', originalDateText: 'Jun 2022 - May 2023', employmentType: 'CONTRACT' as const }, // 12m completely inside FTE
        { employerName: 'Part-Time Advisory', jobTitle: 'Part-Time Engineer', originalDateText: 'Jan 2024 - Jun 2024', employmentType: 'PART_TIME' as const }, // 6m
      ];

      const tenure = calculateTenure(entries, { asOfDate: ANCHOR_NOV_2024 });
      expect(tenure.totalProfessionalMonths).toBe(30); // Jan 2022 - Jun 2024 union, NOT 24 + 12 + 6 = 42
      expect(tenure.contractMonths).toBe(12);
      expect(tenure.partTimeMonths).toBe(6);
    });

    it('parses months containing "to" (October, September, August) accurately instead of falling back to year-only', () => {
      const octInterval = extractIntervalFromEntry(
        { employerName: 'Oct Corp', originalDateText: 'October 2022 - Present' },
        ANCHOR_NOV_2024
      );
      expect(octInterval).not.toBeNull();
      expect(octInterval!.isYearOnly).toBe(false);
      // Oct 2022 .. Nov 2024 inclusive = 26 months touched, 25 completed
      expect(octInterval!.maxPossibleMonths).toBe(26);
      expect(octInterval!.completedMonths).toBe(25);

      const sepOctInterval = extractIntervalFromEntry(
        { employerName: 'SepOct Corp', originalDateText: 'September 2021 - October 2023' },
        ANCHOR_NOV_2024
      );
      expect(sepOctInterval).not.toBeNull();
      expect(sepOctInterval!.isYearOnly).toBe(false);
      expect(sepOctInterval!.maxPossibleMonths).toBe(26); // Sep 2021..Oct 2023 = 26m
    });

    it('preserves Rohan V2 and Ananya V2 year-only & internship isolation invariants', () => {
      const rohanRes = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, { today: ANCHOR_NOV_2024 });
      expect(rohanRes.success).toBe(true);
      if (rohanRes.success) {
        const sm = rohanRes.result.seniorityMatchResult!;
        expect(sm.scope).toBe('PROFESSIONAL');
        expect(sm.minPossibleQualifyingMonths).toBe(36); // Dec 2021..Nov 2024 touched
        expect(sm.maxPossibleQualifyingMonths).toBe(47); // Jan 2021..Nov 2024 touched
        expect(sm.minPossibleCompletedQualifyingMonths).toBe(35); // Dec 2021..Oct 2024 completed
        expect(sm.status).toBe('AMBIGUOUS'); // Completed bounds [35m..46m] cross 36m via active month
        expect(sm.scoreFactor).toBe(0.95);
        expect(sm.isEligible).toBe(false);
        expect(sm.shouldRedistributeWeight).toBe(false);
      }

      const ananyaRes = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, { today: ANCHOR_NOV_2024 });
      expect(ananyaRes.success).toBe(true);
      if (ananyaRes.success) {
        const sm = ananyaRes.result.seniorityMatchResult!;
        expect(sm.scope).toBe('PROFESSIONAL');
        expect(sm.demonstratedMonths).toBe(35);
        expect(sm.completedMonths).toBe(34);
        expect(sm.tenureBreakdown.internshipMonths).toBe(24);
        expect(sm.status).toBe('BELOW_REQUIREMENT');
        expect(sm.isEligible).toBe(false);
        expect(sm.shouldRedistributeWeight).toBe(false);
      }
    });
  });

  // ============================================================
  // A3: MONTH-GRANULAR FRACTIONAL EXPERIENCE & SHORTFALL
  // ============================================================
  describe('A3: Month-Granular Fractional Experience & Boundaries', () => {
    it('preserves exact fractional years (18m=1.5y, 30m=2.5y) and boundary shortfalls (23m vs 24m, 35m vs 36m, 18m vs 2y)', () => {
      const emp18m = [{ employerName: 'Co', originalDateText: 'Jan 2022 - Jun 2023', employmentType: 'FULL_TIME' as const }];
      const tenure18m = calculateTenure(emp18m, { asOfDate: ANCHOR_NOV_2024 });
      expect(tenure18m.totalProfessionalMonths).toBe(18);
      expect(tenure18m.totalProfessionalYears).toBe(1.5);

      const emp30m = [{ employerName: 'Co', originalDateText: 'Jan 2022 - Jun 2024', employmentType: 'FULL_TIME' as const }];
      const tenure30m = calculateTenure(emp30m, { asOfDate: ANCHOR_NOV_2024 });
      expect(tenure30m.totalProfessionalMonths).toBe(30);
      expect(tenure30m.totalProfessionalYears).toBe(2.5);

      // 18m vs 1.5y (18m) -> MEETS_REQUIREMENT
      const fit18vs18 = evaluateSeniorityFit(emp18m, 'Required: 1.5+ years of experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(fit18vs18.demonstratedMonths).toBe(18);
      expect(fit18vs18.demonstratedYears).toBe(1.5);
      expect(fit18vs18.requiredMonths).toBe(18);
      expect(fit18vs18.shortfallMonths).toBe(0);
      expect(fit18vs18.isEligible).toBe(true);
      expect(fit18vs18.status).toBe('MEETS_REQUIREMENT');
      expect(fit18vs18.scoreFactor).toBe(1.0);

      // 18m vs 2y (24m) -> BELOW_REQUIREMENT (6m shortfall)
      const fit18vs24 = evaluateSeniorityFit(emp18m, 'Required: 2+ years of experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(fit18vs24.shortfallMonths).toBe(6);
      expect(fit18vs24.isEligible).toBe(false);
      expect(fit18vs24.status).toBe('BELOW_REQUIREMENT');
      expect(fit18vs24.scoreFactor).toBe(0.75);

      // 23m vs 24m -> PARTIALLY_MEETS_REQUIREMENT (1m shortfall, ineligible)
      const emp23m = [{ employerName: 'Co', originalDateText: 'Jan 2022 - Nov 2023', employmentType: 'FULL_TIME' as const }];
      const fit23vs24 = evaluateSeniorityFit(emp23m, 'Required: 2+ years of experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(fit23vs24.demonstratedMonths).toBe(23);
      expect(fit23vs24.shortfallMonths).toBe(1);
      expect(fit23vs24.isEligible).toBe(false);
      expect(fit23vs24.status).toBe('PARTIALLY_MEETS_REQUIREMENT');
      expect(fit23vs24.scoreFactor).toBe(0.98);

      // 35m vs 36m -> PARTIALLY_MEETS_REQUIREMENT (1m shortfall, ineligible)
      const emp35m = [{ employerName: 'Co', originalDateText: 'Jan 2021 - Nov 2023', employmentType: 'FULL_TIME' as const }];
      const fit35vs36 = evaluateSeniorityFit(emp35m, 'Required: 3+ years of experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(fit35vs36.demonstratedMonths).toBe(35);
      expect(fit35vs36.shortfallMonths).toBe(1);
      expect(fit35vs36.isEligible).toBe(false);
      expect(fit35vs36.status).toBe('PARTIALLY_MEETS_REQUIREMENT');
      expect(fit35vs36.scoreFactor).toBe(0.99);
    });
  });

  // ============================================================
  // A4: SPECIFIC COMPETENCY & PRODUCTION SCOPES
  // ============================================================
  describe('A4: Specific Competency & Production Scopes', () => {
    it('evaluates "2+ years of production Python experience" strictly against production Python intervals', () => {
      const jd = 'Required: 2+ years of production Python experience';

      // Candidate 1: 3 years FTE in DEVELOPMENT/PROTOTYPE with Python + 2 years INTERNSHIP with Python -> fails!
      const nonProdCand = [
        {
          employerName: 'R&D Prototype Lab',
          originalDateText: 'Jan 2021 - Dec 2023',
          employmentType: 'FULL_TIME' as const,
          environmentMaturity: 'PROTOTYPE',
          bullets: [{ rawText: 'Built Python prototype scripts for 24 months.' }],
        },
        {
          employerName: 'Intern Lab',
          originalDateText: 'Jan 2020 - Dec 2020',
          employmentType: 'INTERNSHIP' as const,
          environmentMaturity: 'PRODUCTION',
          bullets: [{ rawText: 'Deployed production Python service for 12 months.' }],
        },
      ];
      const fitNonProd = evaluateSeniorityFit(nonProdCand, jd, { asOfDate: ANCHOR_NOV_2024 });
      expect(fitNonProd.scope).toBe('PRODUCTION');
      expect(fitNonProd.demonstratedMonths).toBe(0);
      expect(fitNonProd.status).toBe('BELOW_REQUIREMENT');
      expect(fitNonProd.isEligible).toBe(false);

      // Candidate 2: 3 years production Java (0 Python) -> fails!
      const wrongTechCand = [
        {
          employerName: 'Java Bank',
          originalDateText: 'Jan 2021 - Dec 2023',
          employmentType: 'FULL_TIME' as const,
          environmentMaturity: 'PRODUCTION',
          bullets: [{ rawText: 'Operated production Java microservices for 36 months.' }],
        },
      ];
      const fitWrongTech = evaluateSeniorityFit(wrongTechCand, jd, { asOfDate: ANCHOR_NOV_2024 });
      expect(fitWrongTech.demonstratedMonths).toBe(0);
      expect(fitWrongTech.status).toBe('BELOW_REQUIREMENT');
      expect(fitWrongTech.isEligible).toBe(false);

      // Candidate 3: 3 years production role with 2.5 years proven Python -> MEETS_REQUIREMENT!
      const prodPythonCand = [
        {
          employerName: 'PayGrid Prod',
          originalDateText: 'Jan 2021 - Dec 2023',
          employmentType: 'FULL_TIME' as const,
          environmentMaturity: 'PRODUCTION',
          bullets: [{ rawText: 'Maintained production Python payment APIs for 2.5 years.' }],
        },
      ];
      const fitProdPython = evaluateSeniorityFit(prodPythonCand, jd, { asOfDate: ANCHOR_NOV_2024 });
      expect(fitProdPython.demonstratedMonths).toBe(30);
      expect(fitProdPython.status).toBe('MEETS_REQUIREMENT');
      expect(fitProdPython.isEligible).toBe(true);
      expect(fitProdPython.surplusMonths).toBe(6);
    });

    it('evaluates "3+ years Kubernetes experience" with alias matching, negation exclusion, and unioned overlapping production roles', () => {
      const k8sJd = 'Required: 3+ years Kubernetes experience';

      // Negated Kubernetes mention does NOT count
      const negatedCand = [
        {
          employerName: 'Legacy Co',
          originalDateText: 'Jan 2020 - Dec 2023',
          employmentType: 'FULL_TIME' as const,
          evidenceRecords: [
            { competencyIds: ['kubernetes'], isNegated: true },
          ],
          bullets: [{ rawText: 'Evaluated Kubernetes but stayed on VMs.', isNegated: true }],
        },
      ];
      const negTenure = calculateCompetencyTenure('kubernetes', negatedCand, { asOfDate: ANCHOR_NOV_2024 });
      expect(negTenure.durationStatus).toBe('NOT_DEMONSTRATED');

      const fitNeg = evaluateSeniorityFit(negatedCand, k8sJd, { asOfDate: ANCHOR_NOV_2024 });
      expect(fitNeg.scope).toBe('SPECIFIC_COMPETENCY');
      expect(fitNeg.demonstratedMonths).toBe(0);
      expect(fitNeg.status).toBe('BELOW_REQUIREMENT');

      // Alias "k8s" + disjoint explicit durations (18m + 18m = 36m) -> MEETS_REQUIREMENT
      const aliasCand = [
        {
          employerName: 'Co A',
          originalDateText: 'Jan 2020 - Dec 2021',
          employmentType: 'FULL_TIME' as const,
          bullets: [{ rawText: 'Managed k8s clusters for 1.5 years.' }],
        },
        {
          employerName: 'Co B',
          originalDateText: 'Jan 2022 - Dec 2023',
          employmentType: 'FULL_TIME' as const,
          bullets: [{ rawText: 'Operated Kubernetes production workloads for 18 months.' }],
        },
      ];
      const fitAlias = evaluateSeniorityFit(aliasCand, k8sJd, { asOfDate: ANCHOR_NOV_2024 });
      expect(fitAlias.demonstratedMonths).toBe(36);
      expect(fitAlias.status).toBe('MEETS_REQUIREMENT');
      expect(fitAlias.isEligible).toBe(true);

      // Overlapping production roles do not double-count under PRODUCTION scope
      const overlappingProd = [
        {
          employerName: 'Same Corp',
          originalDateText: 'Jan 2022 - Dec 2023',
          employmentType: 'FULL_TIME' as const,
          environmentMaturity: 'PRODUCTION',
        },
        {
          employerName: 'Same Corp',
          originalDateText: 'Jun 2022 - Dec 2023',
          employmentType: 'FULL_TIME' as const,
          environmentMaturity: 'PRODUCTION',
        },
      ];
      const fitProdOverlap = evaluateSeniorityFit(overlappingProd, 'Required: 3+ years of production experience', { asOfDate: ANCHOR_NOV_2024 });
      expect(fitProdOverlap.scope).toBe('PRODUCTION');
      expect(fitProdOverlap.demonstratedMonths).toBe(24);
      expect(fitProdOverlap.status).toBe('BELOW_REQUIREMENT');
    });
  });

  // ============================================================
  // A5: UNIFY experienceEstimator.ts WITH tenureCalculator / seniorityMatcher
  // ============================================================
  describe('A5: Unified experienceEstimator <-> tenureCalculator <-> seniorityMatcher Parity', () => {
    it('aligns professionalYears, totalYears, effectiveMonths, and internshipMonths with zero split-brain discrepancy', () => {
      const entries = [
        { company: 'Alpha Corp', title: 'Backend Engineer', dateRangeStr: 'Jan 2022 - Jun 2023', startYear: 2022, startMonth: 'Jan', endYear: 2023, endMonth: 'Jun', employmentType: 'FULL_TIME' as const }, // 18m
        { company: 'Beta Corp', title: 'Software Engineer', dateRangeStr: 'Jan 2023 - Dec 2023', startYear: 2023, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', employmentType: 'FULL_TIME' as const }, // overlaps Jan-Jun 2023 -> union = 24m
        { company: 'Gamma Intern', title: 'Software Engineering Intern', dateRangeStr: 'Jan 2021 - Dec 2021', startYear: 2021, startMonth: 'Jan', endYear: 2021, endMonth: 'Dec' }, // 12m intern (inferred from title)
        { company: 'Univ CS', title: 'Teaching Assistant', dateRangeStr: 'Jan 2020 - Dec 2020', startYear: 2020, startMonth: 'Jan', endYear: 2020, endMonth: 'Dec' }, // 12m academic
      ];

      const est = estimateCandidateExperience(entries as any, 'auto', ANCHOR_NOV_2024);
      const tenure = calculateTenure(entries as any, { asOfDate: ANCHOR_NOV_2024 });
      const fit = evaluateSeniorityFit(entries as any, 'Required: 2+ years of professional experience', { asOfDate: ANCHOR_NOV_2024 });

      expect(est.professionalMonths).toBe(24);
      expect(est.professionalYears).toBe(2);
      expect(est.effectiveMonths).toBe(tenure.totalProfessionalMonths);
      expect(est.candidateMonths).toBe(tenure.totalProfessionalMonths);
      expect(est.candidateYears).toBe(tenure.totalProfessionalYears);
      expect(est.totalMonths).toBe(tenure.totalWorkMonths);
      expect(est.totalYears).toBe(tenure.totalWorkYears);
      expect(est.internshipMonths).toBe(12);
      expect(est.professionalMonths).toBe(fit.demonstratedMonths);
      expect(est.tenureBreakdown).toEqual(tenure);
    });
  });
});
