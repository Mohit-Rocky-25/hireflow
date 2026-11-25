// ============================================================
// ATS Resume Roaster — Phase 07.2 Final Integrity Verification Suite
// Verifies tenure accuracy, benchmark integrity, competency bounding,
// evidence-duration decoupling, fresher scoring invariants, midpoint
// arithmetic, professional contract/freelance scopes, and safe combination.
// ============================================================

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  calculateTenure,
  calculateCompetencyTenure,
  calculateCompoundCompetencyTenure,
  calculateMidpoint,
  extractIntervalFromEntry,
  unionMonthIntervals,
  calculateUniqueCoveredMonths,
  formatMonthDuration,
  DEFAULT_ANCHOR_DATE,
  toMonthIndex,
} from '@/features/ats/engine/tenureCalculator';
import {
  extractSeniorityRequirements,
  evaluateSeniorityFit,
} from '@/features/ats/engine/seniorityMatcher';
import { runAtsEngine } from '@/features/ats/engine';
import { computeAtsScore } from '@/features/ats/engine/scorer';
import {
  BENCHMARK_A_V1_SHIPPULSE_RESUME,
  BENCHMARK_A_V2_PAYTECH_RESUME,
  BENCHMARK_A_JD,
  BENCHMARK_B_V1_LENDBRIDGE_RESUME,
  BENCHMARK_B_V2_DATAFLOW_RESUME,
  BENCHMARK_B_JD,
  BENCHMARK_PROVENANCE_HASHES,
} from '@/features/ats/fixtures/benchmarkFixtures';

function sha256(str: string): string {
  return crypto.createHash('sha256').update(str.trim().replace(/\r\n/g, '\n')).digest('hex');
}

describe('HireFlow ATS Resume Roaster — Phase 07.2 Corrective Verification', () => {
  const FIXED_AS_OF_DATE = new Date(2024, 5, 1); // June 1, 2024

  // ------------------------------------------------------------
  // GATE 1: BENCHMARK VERSION AND SOURCE INTEGRITY
  // ------------------------------------------------------------
  describe('Gate 1: Benchmark Version and Source Integrity', () => {
    it('verifies explicit cryptographic hashes for Benchmark A V1 and V2', () => {
      const hashA1 = sha256(BENCHMARK_A_V1_SHIPPULSE_RESUME);
      const hashA2 = sha256(BENCHMARK_A_V2_PAYTECH_RESUME);
      const hashAJd = sha256(BENCHMARK_A_JD);

      expect(hashA1).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_a_v1_shippulse_lf);
      expect(hashA2).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_a_v2_paytech_lf);
      expect(hashAJd).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_a_jd_lf);
      expect(hashA1).not.toBe(hashA2);
    });

    it('verifies explicit cryptographic hashes for Benchmark B V1 and V2', () => {
      const hashB1 = sha256(BENCHMARK_B_V1_LENDBRIDGE_RESUME);
      const hashB2 = sha256(BENCHMARK_B_V2_DATAFLOW_RESUME);
      const hashBJd = sha256(BENCHMARK_B_JD);

      expect(hashB1).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_b_v1_lendbridge_lf);
      expect(hashB2).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_b_v2_dataflow_lf);
      expect(hashBJd).toBe(BENCHMARK_PROVENANCE_HASHES.benchmark_b_jd_lf);
      expect(hashB1).not.toBe(hashB2);
    });

    it('verifies distinct employer histories between Benchmark V1 and V2 without conflation', () => {
      expect(BENCHMARK_A_V1_SHIPPULSE_RESUME).toContain('ShipPulse Logistics');
      expect(BENCHMARK_A_V1_SHIPPULSE_RESUME).toContain('Kinetix');
      expect(BENCHMARK_A_V2_PAYTECH_RESUME).toContain('PayTech Solutions');
      expect(BENCHMARK_A_V2_PAYTECH_RESUME).not.toContain('ShipPulse Logistics');

      expect(BENCHMARK_B_V1_LENDBRIDGE_RESUME).toContain('LendBridge Technologies');
      expect(BENCHMARK_B_V1_LENDBRIDGE_RESUME).toContain('CartSpring');
      expect(BENCHMARK_B_V2_DATAFLOW_RESUME).toContain('DataFlow Analytics');
      expect(BENCHMARK_B_V2_DATAFLOW_RESUME).toContain('CloudScale Labs');
      expect(BENCHMARK_B_V2_DATAFLOW_RESUME).not.toContain('LendBridge Technologies');
    });
  });

  // ------------------------------------------------------------
  // GATE 1 & 2 (PHASE 07.2): FIX COMPETENCY TENURE LOWER BOUNDS & OCCURRENCE DECOUPLING
  // ------------------------------------------------------------
  describe('Gate 1 (Phase 07.2): Competency Tenure Lower Bounds & Evidence Decoupling', () => {
    it('does NOT manufacture positive elapsed time from occurrence count (1, 5, 10 occurrences)', () => {
      // 1 bullet mention in a 36-month role
      const emp1 = [{
        employerName: 'MultiYear Corp',
        originalDateText: 'Jan 2022 - Dec 2024',
        startYear: 2022,
        startMonth: 'Jan',
        endYear: 2024,
        endMonth: 'Dec',
        bullets: [
          { rawText: 'Implemented PostgreSQL query optimization using EXPLAIN ANALYZE.' },
        ],
      }];
      const tenure1 = calculateCompetencyTenure('postgresql', emp1, { asOfDate: FIXED_AS_OF_DATE });
      expect(tenure1.evidenceOccurrenceCount).toBe(1);
      expect(tenure1.employmentMonths).toBe(36);
      expect(tenure1.provenCompetencyMonths).toBeUndefined();
      expect(tenure1.minPossibleMonths).toBeUndefined(); // Core Phase 07.2 Gate 1 Fix!
      expect(tenure1.maxPossibleMonths).toBe(36);
      expect(tenure1.durationStatus).toBe('ROLE_BOUNDED_UNCERTAIN');

      // 5 bullet mentions in the same 36-month role
      const emp5 = [{
        employerName: 'MultiYear Corp',
        originalDateText: 'Jan 2022 - Dec 2024',
        startYear: 2022,
        startMonth: 'Jan',
        endYear: 2024,
        endMonth: 'Dec',
        bullets: [
          { rawText: 'Implemented PostgreSQL query optimization using EXPLAIN ANALYZE.' },
          { rawText: 'Designed PostgreSQL composite indexes.' },
          { rawText: 'Configured PostgreSQL connection pooling.' },
          { rawText: 'Automated PostgreSQL database migrations.' },
          { rawText: 'Tuned PostgreSQL vacuum and autovacuum parameters.' },
        ],
      }];
      const tenure5 = calculateCompetencyTenure('postgresql', emp5, { asOfDate: FIXED_AS_OF_DATE });
      expect(tenure5.evidenceOccurrenceCount).toBe(5);
      expect(tenure5.employmentMonths).toBe(36);
      expect(tenure5.provenCompetencyMonths).toBeUndefined();
      // Crucial: 5 occurrences do NOT establish 5 months elapsed time!
      expect(tenure5.minPossibleMonths).toBeUndefined();
      expect(tenure5.maxPossibleMonths).toBe(36);
      expect(tenure5.durationStatus).toBe('ROLE_BOUNDED_UNCERTAIN');

      // 10 mentions
      const emp10 = [{
        employerName: 'MultiYear Corp',
        originalDateText: 'Jan 2022 - Dec 2024',
        startYear: 2022,
        startMonth: 'Jan',
        endYear: 2024,
        endMonth: 'Dec',
        bullets: Array.from({ length: 10 }, (_, i) => ({ rawText: `Bullet ${i}: PostgreSQL tuning.` })),
      }];
      const tenure10 = calculateCompetencyTenure('postgresql', emp10, { asOfDate: FIXED_AS_OF_DATE });
      expect(tenure10.evidenceOccurrenceCount).toBe(10);
      expect(tenure10.employmentMonths).toBe(36);
      // Crucial: 10 occurrences do NOT establish 10 months elapsed time!
      expect(tenure10.minPossibleMonths).toBeUndefined();
      expect(tenure10.maxPossibleMonths).toBe(36);
    });

    it('awards explicitly proven duration when statement contains explicit timeframe', () => {
      const employment = [{
        employerName: 'Enterprise Ltd',
        originalDateText: 'Jan 2022 - Dec 2024',
        startYear: 2022,
        startMonth: 'Jan',
        endYear: 2024,
        endMonth: 'Dec',
        bullets: [
          { rawText: 'Led a 6-month PostgreSQL optimization and indexing project reducing query latency by 45%.' },
        ],
      }];

      const pgTenure = calculateCompetencyTenure('postgresql', employment, { asOfDate: FIXED_AS_OF_DATE });
      expect(pgTenure.durationStatus).toBe('EXPLICITLY_PROVEN');
      expect(pgTenure.provenCompetencyMonths).toBe(6);
      expect(pgTenure.provenMonths).toBe(6);
      expect(pgTenure.minPossibleMonths).toBe(6);
      expect(pgTenure.roleDurationMonths).toBe(36);
      expect(pgTenure.isDurationUncertain).toBe(false);
      expect(pgTenure.formattedDuration).toBe('6 months');
    });
  });

  // ------------------------------------------------------------
  // GATE 3: SENIORITY SCOPE MUST CONTROL QUALIFYING EXPERIENCE
  // ------------------------------------------------------------
  describe('Gate 3: Strict Scope Enforcement (6 Mandatory Cases)', () => {
    // Case 1: 2 years FTE + 1 year internship against 3-year professional requirement
    it('Case 1: 2 years FTE + 1 year internship against 3-year professional requirement -> BELOW_REQUIREMENT (12m shortfall)', () => {
      const candidate = [
        { employerName: 'Tech Co', originalDateText: 'Jan 2022 - Dec 2023', startYear: 2022, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', employmentType: 'FULL_TIME' as const },
        { employerName: 'Startup Lab', originalDateText: 'Jan 2021 - Dec 2021', startYear: 2021, startMonth: 'Jan', endYear: 2021, endMonth: 'Dec', employmentType: 'INTERNSHIP' as const },
      ];
      const match = evaluateSeniorityFit(candidate, 'Required: 3+ years of professional software engineering experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.scope).toBe('PROFESSIONAL');
      expect(match.demonstratedMonths).toBe(24);
      expect(match.requiredMonths).toBe(36);
      expect(match.shortfallMonths).toBe(12);
      expect(match.status).toBe('BELOW_REQUIREMENT');
      expect(match.explanation).toContain('excluded from professional eligibility');
    });

    // Case 2: 2 years FTE + 1 year internship against 3-year total-experience requirement
    it('Case 2: 2 years FTE + 1 year internship against 3-year total requirement -> MEETS_REQUIREMENT', () => {
      const candidate = [
        { employerName: 'Tech Co', originalDateText: 'Jan 2022 - Dec 2023', startYear: 2022, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', employmentType: 'FULL_TIME' as const },
        { employerName: 'Startup Lab', originalDateText: 'Jan 2021 - Dec 2021', startYear: 2021, startMonth: 'Jan', endYear: 2021, endMonth: 'Dec', employmentType: 'INTERNSHIP' as const },
      ];
      const match = evaluateSeniorityFit(candidate, 'Required: 3+ years of total work experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.scope).toBe('TOTAL');
      expect(match.demonstratedMonths).toBe(36);
      expect(match.requiredMonths).toBe(36);
      expect(match.shortfallMonths).toBe(0);
      expect(match.status).toBe('MEETS_REQUIREMENT');
    });

    // Case 3: 3 years professional employment but only 1 year of production experience
    it('Case 3: 3 years professional employment but only 1 year production -> BELOW_REQUIREMENT for production (24m shortfall)', () => {
      const candidate = [
        { employerName: 'Research Org', originalDateText: 'Jan 2021 - Dec 2022', startYear: 2021, startMonth: 'Jan', endYear: 2022, endMonth: 'Dec', employmentType: 'FULL_TIME' as const, environmentMaturity: 'DEVELOPMENT' },
        { employerName: 'Prod SaaS', originalDateText: 'Jan 2023 - Dec 2023', startYear: 2023, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', employmentType: 'FULL_TIME' as const, environmentMaturity: 'PRODUCTION', bullets: [{ rawText: 'Maintained production cluster with 99.9% uptime.' }] },
      ];
      const match = evaluateSeniorityFit(candidate, 'Required: 3+ years of production experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.scope).toBe('PRODUCTION');
      expect(match.demonstratedMonths).toBe(12);
      expect(match.requiredMonths).toBe(36);
      expect(match.shortfallMonths).toBe(24);
      expect(match.status).toBe('BELOW_REQUIREMENT');
    });

    // Case 4: 3 years of employment but only 6 months of supported Python experience
    it('Case 4: 3 years employment but only 6 months supported Python experience against 2-year Python requirement -> BELOW_REQUIREMENT', () => {
      const candidate = [
        {
          employerName: 'Legacy Corp',
          originalDateText: 'Jan 2021 - Dec 2023',
          startYear: 2021,
          startMonth: 'Jan',
          endYear: 2023,
          endMonth: 'Dec',
          employmentType: 'FULL_TIME' as const,
          bullets: [
            { rawText: 'Developed backend scripts using Java and Spring Boot for 30 months.' },
            { rawText: 'Executed a 6-month Python automation script migration for reporting.' },
          ],
        },
      ];
      const match = evaluateSeniorityFit(candidate, 'Required: 2+ years of Python experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.scope).toBe('SPECIFIC_COMPETENCY');
      expect(match.demonstratedMonths).toBe(6);
      expect(match.requiredMonths).toBe(24);
      expect(match.shortfallMonths).toBe(18);
      expect(match.status).toBe('BELOW_REQUIREMENT');
    });

    // Case 5: 3 years of employment with PostgreSQL mentioned once but no technology-specific duration
    it('Case 5: 3 years employment with PostgreSQL mentioned once without duration -> AMBIGUOUS against 3-year requirement', () => {
      const candidate = [
        {
          employerName: 'General Tech',
          originalDateText: 'Jan 2021 - Dec 2023',
          startYear: 2021,
          startMonth: 'Jan',
          endYear: 2023,
          endMonth: 'Dec',
          employmentType: 'FULL_TIME' as const,
          bullets: [
            { rawText: 'Implemented PostgreSQL index optimization.' },
            { rawText: 'Built services in Node.js.' },
          ],
        },
      ];
      const match = evaluateSeniorityFit(candidate, 'Required: 3+ years of PostgreSQL experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.scope).toBe('SPECIFIC_COMPETENCY');
      expect(match.status).toBe('AMBIGUOUS');
      expect(match.explanation).toContain('cannot verify 36 months continuous usage');
    });

    // Case 6: Production internship with no full-time experience
    it('Case 6: production internship with no full-time experience -> 0 qualifying professional months but preserves production tag', () => {
      const candidate = [
        {
          employerName: 'CloudScale Labs',
          originalDateText: 'Jan 2023 - Dec 2023',
          startYear: 2023,
          startMonth: 'Jan',
          endYear: 2023,
          endMonth: 'Dec',
          employmentType: 'INTERNSHIP' as const,
          environmentMaturity: 'PRODUCTION',
          bullets: [{ rawText: 'Deployed production Airflow pipelines.' }],
        },
      ];
      const match = evaluateSeniorityFit(candidate, 'Required: 2+ years of professional experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.scope).toBe('PROFESSIONAL');
      expect(match.demonstratedMonths).toBe(0);
      expect(match.tenureBreakdown.internshipMonths).toBe(12);
      expect(match.status).toBe('BELOW_REQUIREMENT');
    });
  });

  // ------------------------------------------------------------
  // GATE 4: TENURE DATE UNCERTAINTY
  // ------------------------------------------------------------
  describe('Gate 4: Date Precision & Min-Max Uncertainty Bounds', () => {
    it('calculates plausible min and max bounds for year-only ranges (2021 - 2023)', () => {
      const entries = [{
        employerName: 'Uncertain Corp',
        originalDateText: '2021 - 2023',
        startYear: 2021,
        endYear: 2023,
        employmentType: 'FULL_TIME' as const,
      }];
      const tenure = calculateTenure(entries, { asOfDate: FIXED_AS_OF_DATE });
      expect(tenure.hasYearOnlyIntervals).toBe(true);
      expect(tenure.intervals[0].minPossibleMonths).toBe(14); // Dec 2021 to Jan 2023
      expect(tenure.intervals[0].maxPossibleMonths).toBe(36); // Jan 2021 to Dec 2023
      expect(tenure.intervals[0].uncertaintyMonths).toBe(22);
    });

    it('returns AMBIGUOUS when requirement threshold falls between min and max bounds', () => {
      const candidate = [{
        employerName: 'Uncertain Corp',
        originalDateText: '2021 - 2023',
        startYear: 2021,
        endYear: 2023,
        employmentType: 'FULL_TIME' as const,
      }];
      // Requirement: 24 months. Min possible is 14m, max possible is 36m. 24m lies strictly inside!
      const match = evaluateSeniorityFit(candidate, 'Required: 2+ years of professional experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.status).toBe('AMBIGUOUS');
      expect(match.scoreFactor).toBe(0.70);
      expect(match.explanation).toContain('Date uncertainty bounds');
    });

    it('evaluates exact 1-month and 2-month shortfalls with deterministic scoring factors', () => {
      const cand1m = [{
        employerName: 'Tech',
        originalDateText: 'Jan 2021 - Nov 2023',
        startYear: 2021,
        startMonth: 'Jan',
        endYear: 2023,
        endMonth: 'Nov',
        employmentType: 'FULL_TIME' as const,
      }];
      const match1m = evaluateSeniorityFit(cand1m, 'Required: 3+ years of professional experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match1m.shortfallMonths).toBe(1);
      expect(match1m.status).toBe('PARTIALLY_MEETS_REQUIREMENT');
      expect(match1m.scoreFactor).toBe(0.99); // 1.0 - (1/36)*0.5 = 0.986 -> 0.99

      const cand2m = [{
        employerName: 'Tech',
        originalDateText: 'Jan 2021 - Oct 2023',
        startYear: 2021,
        startMonth: 'Jan',
        endYear: 2023,
        endMonth: 'Oct',
        employmentType: 'FULL_TIME' as const,
      }];
      const match2m = evaluateSeniorityFit(cand2m, 'Required: 3+ years of professional experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match2m.shortfallMonths).toBe(2);
      expect(match2m.status).toBe('PARTIALLY_MEETS_REQUIREMENT');
      expect(match2m.scoreFactor).toBe(0.97); // 1.0 - (2/36)*0.5 = 0.972 -> 0.97
    });
  });

  // ------------------------------------------------------------
  // GATE 5: COMPOUND COMPETENCY TENURE
  // ------------------------------------------------------------
  describe('Gate 5: Compound Boolean Competency Semantics', () => {
    it('evaluates Airflow OR Prefect without claiming 24m for a single skill', () => {
      const employment = [
        { employerName: 'Role 1', originalDateText: 'Jan 2021 - Dec 2021', startYear: 2021, startMonth: 'Jan', endYear: 2021, endMonth: 'Dec', competencies: ['airflow'] },
        { employerName: 'Role 2', originalDateText: 'Jan 2022 - Dec 2022', startYear: 2022, startMonth: 'Jan', endYear: 2022, endMonth: 'Dec', competencies: ['prefect'] },
      ];
      const res = calculateCompoundCompetencyTenure({ type: 'OR', competencies: ['airflow', 'prefect'] }, employment, { asOfDate: FIXED_AS_OF_DATE });
      expect(res.combinedMonths).toBe(24);
      expect(res.branchResults.length).toBe(2);
      expect(res.branchResults.find(b => b.competencyId === 'airflow')?.months).toBe(12);
      expect(res.branchResults.find(b => b.competencyId === 'prefect')?.months).toBe(12);
      expect(res.explanation).toContain('Does not represent continuous usage of any single technology');
    });

    it('evaluates dbt AND Spark distinguishing independent vs missing branches', () => {
      const employmentMissing = [
        { employerName: 'Role 1', originalDateText: 'Jan 2021 - Dec 2022', startYear: 2021, startMonth: 'Jan', endYear: 2022, endMonth: 'Dec', competencies: ['dbt'] },
      ];
      const resMissing = calculateCompoundCompetencyTenure({ type: 'AND', competencies: ['dbt', 'spark'] }, employmentMissing, { asOfDate: FIXED_AS_OF_DATE });
      expect(resMissing.combinedMonths).toBe(0);
      expect(resMissing.explanation).toContain('Missing mandatory branch(es): spark');

      const employmentBoth = [
        { employerName: 'Role 1', originalDateText: 'Jan 2021 - Dec 2022', startYear: 2021, startMonth: 'Jan', endYear: 2022, endMonth: 'Dec', competencies: ['dbt'] },
        { employerName: 'Role 2', originalDateText: 'Jan 2023 - Dec 2023', startYear: 2023, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', competencies: ['spark'] },
      ];
      const resBoth = calculateCompoundCompetencyTenure({ type: 'AND', competencies: ['dbt', 'spark'] }, employmentBoth, { asOfDate: FIXED_AS_OF_DATE });
      expect(resBoth.combinedMonths).toBe(12); // Bottleneck branch is Spark (12m)
      expect(resBoth.isConcurrent).toBe(false);
    });
  });

  // ------------------------------------------------------------
  // GATE 6: CANONICAL SCORING FORMULA AUDIT
  // ------------------------------------------------------------
  describe('Gate 6: Canonical Scoring Formula Verification', () => {
    it('verifies Worked Example 1: Candidate meets explicit minimum (full seniority score)', () => {
      const candidateEmployment = [{
        employerName: 'Meets Corp',
        originalDateText: 'Jan 2021 - Dec 2023',
        startYear: 2021,
        startMonth: 'Jan',
        endYear: 2023,
        endMonth: 'Dec',
        employmentType: 'FULL_TIME' as const,
        bullets: [{ rawText: 'Scaled backend architecture to 10k RPS.' }],
        charStart: 0,
        charEnd: 100,
        company: 'Meets Corp',
        title: 'Software Engineer',
        dateRangeStr: 'Jan 2021 - Dec 2023',
      }];
      const seniorityMatch = evaluateSeniorityFit(candidateEmployment, 'Required: 3+ years of professional experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(seniorityMatch.status).toBe('MEETS_REQUIREMENT');
      expect(seniorityMatch.scoreFactor).toBe(1.0);

      const score = computeAtsScore({
        wordCount: 400,
        skillResults: [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 5, found: true, evidence: [], proficiency: 3, status: 'verified' }],
        experience: candidateEmployment,
        projects: [],
        contactInfo: { name: 'Cand', email: 'c@example.com', phone: '1234567890', linkedin: null, github: null, portfolio: null },
        sections: [{ type: 'experience', rawTitle: 'Experience', content: '', charStart: 0, charEnd: 100 }, { type: 'education', rawTitle: 'Education', content: '', charStart: 100, charEnd: 200 }, { type: 'skills', rawTitle: 'Skills', content: '', charStart: 200, charEnd: 300 }],
        candidateYears: 3,
        requiredYears: 3,
        targetTier: 'top_product',
        seniorityMatchResult: seniorityMatch,
      });

      expect(score.subscores.seniorityFit).toBe(10); // Full 10.0
      expect(score.penalties.filter(p => p.id.includes('seniority')).length).toBe(0);
    });

    it('verifies Worked Example 2: Candidate narrowly misses minimum (1m shortfall, score factor 0.99)', () => {
      const candidateEmployment = [{
        employerName: 'Near Corp',
        originalDateText: 'Jan 2021 - Nov 2023',
        startYear: 2021,
        startMonth: 'Jan',
        endYear: 2023,
        endMonth: 'Nov',
        employmentType: 'FULL_TIME' as const,
        bullets: [{ rawText: 'Engineered high-scale APIs.' }],
        charStart: 0,
        charEnd: 100,
        company: 'Near Corp',
        title: 'Software Engineer',
        dateRangeStr: 'Jan 2021 - Nov 2023',
      }];
      const seniorityMatch = evaluateSeniorityFit(candidateEmployment, 'Required: 3+ years of professional experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(seniorityMatch.status).toBe('PARTIALLY_MEETS_REQUIREMENT');
      expect(seniorityMatch.scoreFactor).toBe(0.99);

      const score = computeAtsScore({
        wordCount: 400,
        skillResults: [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 5, found: true, evidence: [], proficiency: 3, status: 'verified' }],
        experience: candidateEmployment,
        projects: [],
        contactInfo: { name: 'Cand', email: 'c@example.com', phone: '1234567890', linkedin: null, github: null, portfolio: null },
        sections: [{ type: 'experience', rawTitle: 'Experience', content: '', charStart: 0, charEnd: 100 }, { type: 'education', rawTitle: 'Education', content: '', charStart: 100, charEnd: 200 }, { type: 'skills', rawTitle: 'Skills', content: '', charStart: 200, charEnd: 300 }],
        candidateYears: 2.9,
        requiredYears: 3,
        targetTier: 'top_product',
        seniorityMatchResult: seniorityMatch,
      });

      expect(score.subscores.seniorityFit).toBe(9.9); // 0.99 * 10
      expect(score.penalties.filter(p => p.id.includes('seniority')).length).toBe(0); // Zero duplicate penalty
    });

    it('verifies Worked Example 3: Strong skills but insufficient professional tenure (proportional reduction, no double penalty)', () => {
      const candidateEmployment = [{
        employerName: 'Mid Corp',
        originalDateText: 'Jan 2022 - Dec 2023',
        startYear: 2022,
        startMonth: 'Jan',
        endYear: 2023,
        endMonth: 'Dec',
        employmentType: 'FULL_TIME' as const,
        bullets: [{ rawText: 'Implemented core Python and SQL pipelines.' }],
        charStart: 0,
        charEnd: 100,
        company: 'Mid Corp',
        title: 'Mid-Level Software Engineer',
        dateRangeStr: 'Jan 2022 - Dec 2023',
      }];
      // Required: 5 years (60m). Candidate has 24m. Shortfall: 36m. Ratio: 36/60 = 0.6. Factor: 0.40
      const seniorityMatch = evaluateSeniorityFit(candidateEmployment, 'Required: 5+ years of software engineering experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(seniorityMatch.status).toBe('BELOW_REQUIREMENT');
      expect(seniorityMatch.scoreFactor).toBe(0.40);

      const score = computeAtsScore({
        wordCount: 400,
        skillResults: [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 5, found: true, evidence: [], proficiency: 5, status: 'verified' }],
        experience: candidateEmployment,
        projects: [],
        contactInfo: { name: 'Cand', email: 'c@example.com', phone: '1234567890', linkedin: null, github: null, portfolio: null },
        sections: [{ type: 'experience', rawTitle: 'Experience', content: '', charStart: 0, charEnd: 100 }, { type: 'education', rawTitle: 'Education', content: '', charStart: 100, charEnd: 200 }, { type: 'skills', rawTitle: 'Skills', content: '', charStart: 200, charEnd: 300 }],
        candidateYears: 2,
        requiredYears: 5,
        targetTier: 'top_product',
        seniorityMatchResult: seniorityMatch,
      });

      expect(score.subscores.seniorityFit).toBe(4.0); // 0.40 * 10
      expect(score.penalties.filter(p => p.id.includes('seniority')).length).toBe(0);
      expect(score.score).toBeLessThanOrEqual(100);
    });
  });

  // ------------------------------------------------------------
  // GATE 7: EMPLOYMENT AND ENVIRONMENT CLASSIFICATION
  // ------------------------------------------------------------
  describe('Gate 7: Independent Classification Dimensions', () => {
    it('verifies that technical title does NOT automatically infer production maturity', () => {
      const entry = {
        employerName: 'R&D Labs',
        jobTitle: 'Senior Distributed Systems Architect',
        originalDateText: '2023',
        employmentType: 'FULL_TIME' as const,
        environmentMaturity: 'PROTOTYPE' as const,
      };
      // Explicitly separate
      expect(entry.employmentType).toBe('FULL_TIME');
      expect(entry.environmentMaturity).toBe('PROTOTYPE');
      expect(entry.environmentMaturity).not.toBe('PRODUCTION');
    });

    it('verifies that project heading does NOT infer professional employment', () => {
      const project = {
        projectName: 'Enterprise Production Banking Engine',
        projectOrigin: 'PERSONAL_PROJECT' as const,
        environmentMaturity: 'PROTOTYPE' as const,
      };
      expect(project.projectOrigin).toBe('PERSONAL_PROJECT');
      expect(project.projectOrigin).not.toBe('EMPLOYER_INTERNAL_PROJECT');
    });
  });

  // ------------------------------------------------------------
  // GATE 8: END-TO-END BENCHMARK REGRESSION
  // ------------------------------------------------------------
  describe('Gate 8: End-to-End Benchmark V1 & V2 Regression', () => {
    it('Scenario 25A: evaluates Benchmark A V2 (Rohan Deshmukh at PayTech Solutions)', () => {
      const response = runAtsEngine(BENCHMARK_A_V2_PAYTECH_RESUME, BENCHMARK_A_JD, {
        today: new Date(2024, 10, 24),
      });

      expect(response.success).toBe(true);
      if (!response.success) return;

      const { result } = response;
      expect(result.candidateName).toBe('Rohan Deshmukh');
      expect(result.employerName).toBe('PayGrid Systems');
      expect(result.seniorityMatchResult).toBeDefined();

      if (result.seniorityMatchResult) {
        expect(result.seniorityMatchResult.requiredYears).toBe(3);
        expect(result.seniorityMatchResult.demonstratedYears).toBeGreaterThanOrEqual(3.5);
        expect(result.seniorityMatchResult.shortfallMonths).toBe(0);
      }
    });

    it('Scenario 25B: evaluates Benchmark B V2 (Ananya Rao at DataFlow Analytics)', () => {
      const response = runAtsEngine(BENCHMARK_B_V2_DATAFLOW_RESUME, BENCHMARK_B_JD, {
        today: new Date(2024, 5, 1), // June 1, 2024
      });

      expect(response.success).toBe(true);
      if (!response.success) return;

      const { result } = response;
      expect(result.candidateName).toBe('Ananya Rao');
      expect(result.employerName).toBe('Northstar Credit');
      expect(result.seniorityMatchResult).toBeDefined();

      if (result.seniorityMatchResult) {
        expect(result.seniorityMatchResult.requiredYears).toBe(3);
        expect(result.seniorityMatchResult.tenureBreakdown.internshipMonths).toBe(24);
        expect(result.seniorityMatchResult.tenureBreakdown.totalProfessionalMonths).toBeLessThanOrEqual(30);
      }
    });
  });

  // ------------------------------------------------------------
  // GATE 2 (PHASE 07.2): CORRECT FRESHER SCORING BEHAVIOR
  // ------------------------------------------------------------
  describe('Gate 2 (Phase 07.2): Fresher Scoring & Explicit Eligibility Shortfall', () => {
    it('retains seniorityFit weight and penalizes shortfall when fresher applies to senior JD', () => {
      const candidateYears = 0.5; // Fresher with 6 months
      const requiredYears = 4; // Senior role requiring 4 years
      const candidateEmployment = [{
        employerName: 'Startup',
        originalDateText: 'Jan 2024 - June 2024',
        startYear: 2024,
        startMonth: 'Jan',
        endYear: 2024,
        endMonth: 'Jun',
        employmentType: 'FULL_TIME' as const,
        bullets: [{ rawText: 'Wrote Python scripts.' }],
        charStart: 0,
        charEnd: 100,
        company: 'Startup',
        title: 'Junior Developer',
        dateRangeStr: 'Jan 2024 - June 2024',
      }];

      const seniorityMatch = evaluateSeniorityFit(candidateEmployment, 'Required: 4+ years of professional software engineering experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(seniorityMatch.status).toBe('BELOW_REQUIREMENT');
      expect(seniorityMatch.shortfallMonths).toBe(42);
      expect(seniorityMatch.isEligible).toBe(false);

      const score = computeAtsScore({
        wordCount: 350,
        skillResults: [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 5, found: true, evidence: [], proficiency: 3, status: 'verified' }],
        experience: candidateEmployment,
        projects: [],
        contactInfo: { name: 'Fresher', email: 'f@example.com', phone: '1234567890', linkedin: null, github: null, portfolio: null },
        sections: [{ type: 'experience', rawTitle: 'Experience', content: '', charStart: 0, charEnd: 100 }, { type: 'education', rawTitle: 'Education', content: '', charStart: 100, charEnd: 200 }, { type: 'skills', rawTitle: 'Skills', content: '', charStart: 200, charEnd: 300 }],
        candidateYears,
        requiredYears,
        targetTier: 'top_product',
        seniorityMatchResult: seniorityMatch,
      });

      // Core Invariant: Seniority fit weight is NOT zeroed out when JD explicitly requires experience!
      expect(score.activeWeights.seniorityFit).toBe(10);
      expect(score.subscores.seniorityFit).toBeLessThan(5); // Heavily reduced
      expect(score.eligibility.isEligible).toBe(false);
      expect(score.eligibility.shortfallMonths).toBe(42);
    });

    it('redistributes seniorityFit weight ONLY when role is entry-level / requires 0 experience', () => {
      const candidateYears = 0.5; // Fresher
      const candidateEmployment = [{
        employerName: 'Startup',
        originalDateText: 'Jan 2024 - June 2024',
        startYear: 2024,
        startMonth: 'Jan',
        endYear: 2024,
        endMonth: 'Jun',
        employmentType: 'FULL_TIME' as const,
        bullets: [{ rawText: 'Wrote Python scripts.' }],
        charStart: 0,
        charEnd: 100,
        company: 'Startup',
        title: 'Junior Developer',
        dateRangeStr: 'Jan 2024 - June 2024',
      }];

      const seniorityMatch = evaluateSeniorityFit(candidateEmployment, 'Entry level / Graduate (0 years experience required)', { asOfDate: FIXED_AS_OF_DATE });
      expect(seniorityMatch.status).toBe('MEETS_REQUIREMENT');
      expect(seniorityMatch.requiredYears).toBe(0);
      expect(seniorityMatch.isEligible).toBe(true);

      const score = computeAtsScore({
        wordCount: 350,
        skillResults: [{ skillId: 'python', canonical: 'Python', category: 'language', required: 'must', weight: 5, found: true, evidence: [], proficiency: 3, status: 'verified' }],
        experience: candidateEmployment,
        projects: [],
        contactInfo: { name: 'Fresher', email: 'f@example.com', phone: '1234567890', linkedin: null, github: null, portfolio: null },
        sections: [{ type: 'experience', rawTitle: 'Experience', content: '', charStart: 0, charEnd: 100 }, { type: 'education', rawTitle: 'Education', content: '', charStart: 100, charEnd: 200 }, { type: 'skills', rawTitle: 'Skills', content: '', charStart: 200, charEnd: 300 }],
        candidateYears,
        requiredYears: 0,
        targetTier: 'top_product',
        seniorityMatchResult: seniorityMatch,
      });

      // Seniority weight redistributed
      expect(score.activeWeights.seniorityFit).toBe(0);
      expect(score.activeWeights.projectsAndOss).toBe(15);
      expect(score.activeWeights.evidenceDepth).toBe(25);
      expect(score.eligibility.isEligible).toBe(true);
      expect(score.eligibility.shortfallMonths).toBe(0);
    });
  });

  // ------------------------------------------------------------
  // GATE 3 (PHASE 07.2): MIDPOINT ARITHMETIC & ACTIVE MONTH POLICY
  // ------------------------------------------------------------
  describe('Gate 3 (Phase 07.2): Midpoint Arithmetic & Date Boundaries', () => {
    it('calculates correct midpoints without rounding distortions', () => {
      expect(calculateMidpoint(14, 36)).toBe(25); // (14 + 36) / 2 = 50 / 2 = 25, not 24!
      expect(calculateMidpoint(1, 12)).toBe(6.5); // (1 + 12) / 2 = 13 / 2 = 6.5, not 12!
      expect(calculateMidpoint(0, 24)).toBe(12);
    });

    it('documents and verifies ongoing active month inclusion policy', () => {
      // Role: June 2025 - Present with asOfDate = Nov 24, 2026
      const asOfNov2026 = new Date(2026, 10, 24);
      const entry = {
        employerName: 'Ongoing Corp',
        originalDateText: 'June 2025 - Present',
        startYear: 2025,
        startMonth: 'June',
        isCurrent: true,
      };
      const interval = extractIntervalFromEntry(entry, asOfNov2026);
      expect(interval).not.toBeNull();
      if (!interval) return;

      // June 2025 (month idx 2025*12+5) to Nov 2026 (2026*12+10) = 18 calendar months touched
      const monthsTouched = interval.endMonthIndex - interval.startMonthIndex + 1;
      expect(monthsTouched).toBe(18);
      expect(interval.ongoingActiveMonthIncluded).toBe(true);
      expect(interval.completedMonths).toBe(17); // 17 full months completed prior to current month
    });
  });

  // ------------------------------------------------------------
  // GATE 4 (PHASE 07.2): CONTRACT AND FREELANCE SCOPES
  // ------------------------------------------------------------
  describe('Gate 4 (Phase 07.2): Professional, Contract, and Freelance Scope', () => {
    it('allows verified contract engineering to count under PROFESSIONAL scope', () => {
      const candidate = [
        { employerName: 'Tech FTE', originalDateText: 'Jan 2022 - Dec 2023', startYear: 2022, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', employmentType: 'FULL_TIME' as const },
        { employerName: 'Client Contract', originalDateText: 'Jan 2021 - Dec 2021', startYear: 2021, startMonth: 'Jan', endYear: 2021, endMonth: 'Dec', employmentType: 'CONTRACT' as const, professionalClassification: 'PROFESSIONAL' as const },
      ];
      const match = evaluateSeniorityFit(candidate, 'Required: 3+ years of professional software engineering experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(match.scope).toBe('PROFESSIONAL');
      expect(match.demonstratedMonths).toBe(36); // 24m FTE + 12m Contract
      expect(match.status).toBe('MEETS_REQUIREMENT');
      expect(match.shortfallMonths).toBe(0);
      expect(match.isEligible).toBe(true);
    });

    it('excludes internships from PROFESSIONAL scope but includes them in TOTAL scope', () => {
      const candidate = [
        { employerName: 'Tech FTE', originalDateText: 'Jan 2022 - Dec 2023', startYear: 2022, startMonth: 'Jan', endYear: 2023, endMonth: 'Dec', employmentType: 'FULL_TIME' as const },
        { employerName: 'Intern Lab', originalDateText: 'Jan 2021 - Dec 2021', startYear: 2021, startMonth: 'Jan', endYear: 2021, endMonth: 'Dec', employmentType: 'INTERNSHIP' as const },
      ];
      // Under PROFESSIONAL scope: 24m demonstrated (internship excluded)
      const matchProf = evaluateSeniorityFit(candidate, 'Required: 3+ years of professional experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(matchProf.demonstratedMonths).toBe(24);
      expect(matchProf.status).toBe('BELOW_REQUIREMENT');
      expect(matchProf.isEligible).toBe(false);

      // Under TOTAL scope: 36m demonstrated (internship included)
      const matchTotal = evaluateSeniorityFit(candidate, 'Required: 3+ years of total work experience', { asOfDate: FIXED_AS_OF_DATE });
      expect(matchTotal.demonstratedMonths).toBe(36);
      expect(matchTotal.status).toBe('MEETS_REQUIREMENT');
      expect(matchTotal.isEligible).toBe(true);
    });
  });

  // ------------------------------------------------------------
  // GATE 5 (PHASE 07.2): SAFE COMBINATION OF EXPLICIT USAGE DURATIONS
  // ------------------------------------------------------------
  describe('Gate 5 (Phase 07.2): Safe Combination of Explicit Usage Durations', () => {
    it('safely sums explicit durations across disjoint roles without exceeding union', () => {
      const employment = [
        {
          employerName: 'Role A',
          originalDateText: 'Jan 2021 - Dec 2021',
          startYear: 2021,
          startMonth: 'Jan',
          endYear: 2021,
          endMonth: 'Dec',
          bullets: [{ rawText: 'Led 6-month PostgreSQL migration project.' }],
        },
        {
          employerName: 'Role B',
          originalDateText: 'Jan 2022 - Dec 2022',
          startYear: 2022,
          startMonth: 'Jan',
          endYear: 2022,
          endMonth: 'Dec',
          bullets: [{ rawText: 'Built PostgreSQL query caching layer over 6 months.' }],
        },
      ];
      const res = calculateCompetencyTenure('postgresql', employment, { asOfDate: FIXED_AS_OF_DATE });
      expect(res.durationStatus).toBe('EXPLICITLY_PROVEN');
      expect(res.provenCompetencyMonths).toBe(12); // 6m + 6m disjoint = 12m
      expect(res.employmentMonths).toBe(24);
      expect(res.maxPossibleMonths).toBe(24);
    });
  });

  // ------------------------------------------------------------
  // PHASE 07.3: FINAL ACCEPTANCE AND SCORING INPUT VERIFICATION
  // ------------------------------------------------------------
  describe('Phase 07.3: Final Acceptance and Scoring Input Verification', () => {
    describe('Gate 1: Requirement Provenance & Fallback Eradication', () => {
      it('activates mandatory seniority gate when JD explicitly requires 3 years', () => {
        const jd = 'Looking for a Senior Backend Engineer. Required: 3+ years of professional backend experience.';
        const candidate = {
          candidateName: 'Test Dev',
          employmentHistory: [
            {
              employerName: 'Startup Inc',
              originalDateText: 'Jan 2022 - Dec 2022',
              startYear: 2022,
              startMonth: 'Jan',
              endYear: 2022,
              endMonth: 'Dec',
              isCurrentRole: false,
              bullets: [{ rawText: 'Wrote backend services in Node.js' }],
            },
          ],
        };
        const fit = evaluateSeniorityFit(candidate, jd, { asOfDate: FIXED_AS_OF_DATE });
        expect(fit.isMandatoryGateActive).toBe(true);
        expect(fit.provenance).toBe('EXPLICIT_EMPLOYER');
        expect(fit.requiredMonths).toBe(36);
        expect(fit.isEligible).toBe(false);
        expect(fit.shortfallMonths).toBe(24);
      });

      it('does NOT activate mandatory seniority gate or invent years when JD specifies no experience minimum', () => {
        const jd = 'Looking for a Python Developer. Strong knowledge of FastAPI, PostgreSQL, and Redis.';
        const candidate = {
          candidateName: 'Test Dev',
          employmentHistory: [
            {
              employerName: 'Startup Inc',
              originalDateText: 'Jan 2023 - Dec 2023',
              startYear: 2023,
              startMonth: 'Jan',
              endYear: 2023,
              endMonth: 'Dec',
              isCurrentRole: false,
              bullets: [{ rawText: 'Wrote backend services in Node.js' }],
            },
          ],
        };
        const fit = evaluateSeniorityFit(candidate, jd, { asOfDate: FIXED_AS_OF_DATE });
        expect(fit.isMandatoryGateActive).toBe(false);
        expect(fit.provenance).toBe('NONE');
        expect(fit.status).toBe('NOT_SPECIFIED');
        expect(fit.requiredYears).toBe(0);
        expect(fit.requiredMonths).toBe(0);
        expect(fit.shortfallMonths).toBe(0);
        expect(fit.isEligible).toBe(true);
        expect(fit.scoreFactor).toBe(1.0);
      });

      it('does NOT manufacture a numeric experience requirement from senior title keywords alone', () => {
        const jd = 'Senior Backend Engineer / Staff Architect. We build real-time trading engines.';
        const candidate = {
          candidateName: 'Talented Engineer',
          employmentHistory: [
            {
              employerName: 'FinTech Corp',
              originalDateText: 'Jan 2023 - Dec 2023',
              startYear: 2023,
              startMonth: 'Jan',
              endYear: 2023,
              endMonth: 'Dec',
              isCurrentRole: false,
              bullets: [{ rawText: 'Built low latency services' }],
            },
          ],
        };
        const fit = evaluateSeniorityFit(candidate, jd, { asOfDate: FIXED_AS_OF_DATE });
        expect(fit.isMandatoryGateActive).toBe(false);
        expect(fit.provenance).toBe('NONE');
        expect(fit.status).toBe('NOT_SPECIFIED');
        expect(fit.requiredYears).toBe(0);
      });

      it('respects user override as USER_OVERRIDE provenance and activates gate', () => {
        const jd = 'Software Engineer. Python experience.';
        const candidate = {
          candidateName: 'Junior Dev',
          employmentHistory: [
            {
              employerName: 'Startup Inc',
              originalDateText: 'Jan 2023 - Dec 2023',
              startYear: 2023,
              startMonth: 'Jan',
              endYear: 2023,
              endMonth: 'Dec',
              isCurrentRole: false,
              bullets: [{ rawText: 'Python dev' }],
            },
          ],
        };
        const fit = evaluateSeniorityFit(candidate, jd, {
          asOfDate: FIXED_AS_OF_DATE,
          userRequiredYears: 4,
        });
        expect(fit.isMandatoryGateActive).toBe(true);
        expect(fit.provenance).toBe('USER_OVERRIDE');
        expect(fit.requiredYears).toBe(4);
        expect(fit.requiredMonths).toBe(48);
        expect(fit.isEligible).toBe(false);
      });
    });

    describe('Gate 2: Explicit Duration Combination with Overlap Bounding', () => {
      it('bounds ambiguous duration between max and sum when explicit durations overlap in calendar time', () => {
        // Role A: Jan 2022 - Dec 2023 (24m), bullet: 6m Python
        // Role B: Jan 2023 - Dec 2024 (24m), bullet: 6m Python
        // Intervals overlap during 2023 (12 months). Placement is unstated.
        // Min possible = 6m (if concurrent during 2023 overlap), Max possible = 12m (if disjoint across Jan-Dec 2022 and Jan-Dec 2024).
        const employment = [
          {
            employerName: 'Role A',
            originalDateText: 'Jan 2022 - Dec 2023',
            startYear: 2022,
            startMonth: 'Jan',
            endYear: 2023,
            endMonth: 'Dec',
            bullets: [{ rawText: 'Developed Python microservices over 6 months.' }],
          },
          {
            employerName: 'Role B',
            originalDateText: 'Jan 2023 - Dec 2024',
            startYear: 2023,
            startMonth: 'Jan',
            endYear: 2024,
            endMonth: 'Dec',
            bullets: [{ rawText: 'Engineered Python data pipelines for 6 months.' }],
          },
        ];

        const res = calculateCompetencyTenure('python', employment, { asOfDate: new Date(2025, 0, 1) });
        expect(res.durationStatus).toBe('ROLE_BOUNDED_UNCERTAIN');
        expect(res.isCombinedPlacementAmbiguous).toBe(true);
        expect(res.minPossibleMonths).toBe(6);
        expect(res.maxPossibleMonths).toBe(12);
        expect(res.minCombinedMonths).toBe(6);
        expect(res.maxCombinedMonths).toBe(12);
        expect(res.provenCompetencyMonths).toBeUndefined(); // Cannot claim 12m as proven fact
      });

      it('reports unambiguous EXPLICITLY_PROVEN sum when explicit roles are completely disjoint in time', () => {
        // Role A: Jan 2021 - Dec 2021 (12m), bullet: 6m Python
        // Role B: Jan 2023 - Dec 2023 (12m), bullet: 6m Python
        // Roles do not overlap -> strictly disjoint -> 6m + 6m = 12m proven
        const employment = [
          {
            employerName: 'Role A',
            originalDateText: 'Jan 2021 - Dec 2021',
            startYear: 2021,
            startMonth: 'Jan',
            endYear: 2021,
            endMonth: 'Dec',
            bullets: [{ rawText: 'Developed Python microservices over 6 months.' }],
          },
          {
            employerName: 'Role B',
            originalDateText: 'Jan 2023 - Dec 2023',
            startYear: 2023,
            startMonth: 'Jan',
            endYear: 2023,
            endMonth: 'Dec',
            bullets: [{ rawText: 'Engineered Python data pipelines for 6 months.' }],
          },
        ];

        const res = calculateCompetencyTenure('python', employment, { asOfDate: FIXED_AS_OF_DATE });
        expect(res.durationStatus).toBe('EXPLICITLY_PROVEN');
        expect(res.isCombinedPlacementAmbiguous).toBe(false);
        expect(res.provenCompetencyMonths).toBe(12);
        expect(res.minPossibleMonths).toBe(12);
        expect(res.maxPossibleMonths).toBe(24); // containing roles union is 24m
      });
    });

    describe('Gate 3: Active Month vs Completed Month Eligibility Policy', () => {
      it('flags candidate who reaches threshold ONLY via ongoing active month as PARTIALLY_MEETS_REQUIREMENT', () => {
        // As of June 1, 2024:
        // Role starts July 2022 to Present (June 2024).
        // Total calendar months touched = July 2022 through June 2024 inclusive = 24 months.
        // Completed calendar months prior to June 2024 = July 2022 through May 2024 = 23 months.
        // If requirement is 24 months (2 years):
        // Candidate touched 24 calendar months, but completed only 23.
        const candidate = {
          candidateName: 'Borderline Engineer',
          employmentHistory: [
            {
              employerName: 'Cloud Co',
              originalDateText: 'July 2022 - Present',
              startYear: 2022,
              startMonth: 'Jul',
              isCurrentRole: true,
              bullets: [{ rawText: 'Full stack development' }],
            },
          ],
        };

        const jd = 'Software Engineer. Required: 2+ years of experience.';
        const fit = evaluateSeniorityFit(candidate, jd, { asOfDate: FIXED_AS_OF_DATE });

        expect(fit.demonstratedMonths).toBe(24); // calendar months touched
        expect(fit.completedMonths).toBe(23); // fully completed calendar months
        expect(fit.requiredMonths).toBe(24);
        expect(fit.reachesRequirementOnlyViaActiveMonth).toBe(true);
        expect(fit.status).toBe('PARTIALLY_MEETS_REQUIREMENT');
        expect(fit.scoreFactor).toBe(0.95);
        expect(fit.shortfallMonths).toBe(1); // 1 month of completed tenure short
      });

      it('awards MEETS_REQUIREMENT when completed calendar months independently meet threshold', () => {
        // Role starts June 2022 to Present (June 2024).
        // Completed calendar months prior to June 2024 = June 2022 through May 2024 = 24 months.
        // Demonstrated months = 25 months.
        const candidate = {
          candidateName: 'Solid Engineer',
          employmentHistory: [
            {
              employerName: 'Cloud Co',
              originalDateText: 'June 2022 - Present',
              startYear: 2022,
              startMonth: 'Jun',
              isCurrentRole: true,
              bullets: [{ rawText: 'Full stack development' }],
            },
          ],
        };

        const jd = 'Software Engineer. Required: 2+ years of experience.';
        const fit = evaluateSeniorityFit(candidate, jd, { asOfDate: FIXED_AS_OF_DATE });

        expect(fit.completedMonths).toBe(24);
        expect(fit.demonstratedMonths).toBe(25);
        expect(fit.reachesRequirementOnlyViaActiveMonth).toBe(false);
        expect(fit.status).toBe('MEETS_REQUIREMENT');
        expect(fit.scoreFactor).toBe(1.0);
        expect(fit.shortfallMonths).toBe(0);
      });
    });

    describe('Gate 4: Benchmark Reproducibility and Raw/Normalized Hashes', () => {
      it('exports both raw and normalized hash fields in BENCHMARK_PROVENANCE_HASHES', () => {
        expect(BENCHMARK_PROVENANCE_HASHES.benchmark_a_v1_shippulse_raw).toBeDefined();
        expect(BENCHMARK_PROVENANCE_HASHES.benchmark_a_v2_paytech_raw).toBeDefined();
        expect(BENCHMARK_PROVENANCE_HASHES.benchmark_a_jd_raw).toBeDefined();
        expect(BENCHMARK_PROVENANCE_HASHES.benchmark_b_v1_lendbridge_raw).toBeDefined();
        expect(BENCHMARK_PROVENANCE_HASHES.benchmark_b_v2_dataflow_raw).toBeDefined();
        expect(BENCHMARK_PROVENANCE_HASHES.benchmark_b_jd_raw).toBeDefined();
        expect(BENCHMARK_PROVENANCE_HASHES.normalizationRule).toBe('string.trim().replace(/\\r\\n/g, "\\n")');
      });
    });
  });
});
