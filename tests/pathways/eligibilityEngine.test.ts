// ============================================================
// Pathways Eligibility Engine Test Suite
// Validates 20 C15 Profiles, CGPA Gap Math, Unit Mismatch, Invariants
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  evaluateEligibility,
  calculateCgpaGap,
  normalizeBranch
} from '../../src/pathways/engine/eligibility';
import { PATHWAYS_PROGRAMS } from '../../src/pathways/facts/programs.generated';
import type { StudentProfile, ProgramRecord } from '../../src/pathways/schema/types';

describe('Pathways Eligibility Engine', () => {
  const tcsNinja = PATHWAYS_PROGRAMS.find((p) => p.id === 'tcs-ninja')!;
  const infosysSe = PATHWAYS_PROGRAMS.find((p) => p.id === 'infosys-se')!;
  const walmartSde = PATHWAYS_PROGRAMS.find((p) => p.id === 'walmart-sde')!;
  const zohoSe = PATHWAYS_PROGRAMS.find((p) => p.id === 'zoho-se')!;

  describe('1. Branch Alias Normalization', () => {
    it('normalizes common Indian branch abbreviations', () => {
      expect(normalizeBranch('cs')).toBe('CSE');
      expect(normalizeBranch('computer science')).toBe('CSE');
      expect(normalizeBranch('e&tc')).toBe('ECE');
      expect(normalizeBranch('electronics and communication')).toBe('ECE');
      expect(normalizeBranch('mech')).toBe('ME');
      expect(normalizeBranch('it')).toBe('IT');
    });
  });

  describe('2. Twenty C15 Student Profile Fixtures', () => {
    // P-01: Standard CSE Baseline Pass
    it('P-01-STANDARD-CSE: B.Tech CSE, 2027, 8.2 CGPA, 10th 88%, 12th 85%, 0 backlogs -> meets', () => {
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2027,
        cgpa: 8.2,
        cgpaScale: 10,
        percent10: 88,
        percent12: 85,
        percentAggregate: 82,
        activeBacklogs: 0,
        gapMonths: 0
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('meets');
      expect(res.blockingInputs.length).toBe(0);
    });

    // P-02: Diploma Lateral Entry (12th waived)
    it('P-02-DIPLOMA-LATERAL: Mech, 2026, 7.5 CGPA, isDiploma=true -> satisfies 12th requirement', () => {
      const profile: StudentProfile = {
        branch: 'ME',
        batchYear: 2026,
        cgpa: 7.5,
        cgpaScale: 10,
        isDiploma: true,
        percentAggregate: 75,
        percent10: 80,
        percent12: null,
        activeBacklogs: 0,
        gapMonths: 0
      };
      const res = evaluateEligibility(profile, tcsNinja);
      const p12Criterion = res.criteria.find((c) => c.criterion === 'percent_12th');
      expect(p12Criterion?.state).toBe('pass');
      expect(p12Criterion?.provided).toBe('Diploma Lateral Entry');
      expect(res.status).toBe('meets');
    });

    // P-03: Scale 4 Unit Mismatch (Constitution E4)
    it('P-03-SCALE-4: CGPA 3.4 on scale 4.0 -> triggers unit_mismatch check, never converts linearly', () => {
      const profile: StudentProfile = {
        branch: 'IT',
        batchYear: 2026,
        cgpa: 3.4,
        cgpaScale: 4, // US / Private scale
        percent10: 75,
        percent12: 72,
        percentAggregate: 72,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('check');
      const cgpaCrit = res.criteria.find((c) => c.criterion === 'cgpa');
      expect(cgpaCrit?.state).toBe('unit_mismatch');
      expect(res.caveats.some((c) => c.includes('never linearly convert'))).toBe(true);
    });

    // P-04: Percentage Only
    it('P-04-PERCENTAGE-ONLY: Evaluates aggregate percentage against cutoffs', () => {
      const profile: StudentProfile = {
        branch: 'ECE',
        batchYear: 2026,
        cgpa: 6.85,
        cgpaScale: 10,
        percentAggregate: 68.5,
        percent10: 70,
        percent12: 65,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, infosysSe);
      expect(res.status).toBe('meets');
    });

    // P-05: MCA Fresher
    it('P-05-MCA-FRESHER: MCA degree matches programs that accept MCA', () => {
      const profile: StudentProfile = {
        degree: 'MCA',
        branch: 'MCA',
        batchYear: 2026,
        cgpa: 7.8,
        cgpaScale: 10,
        percent10: 65,
        percent12: 68,
        percentAggregate: 72,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('meets');
    });

    // P-06: M.Tech Fresher
    it('P-06-MTECH-FRESHER: M.Tech degree matches programs that accept M.Tech', () => {
      const profile: StudentProfile = {
        degree: 'M.Tech',
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 8.5,
        cgpaScale: 10,
        percent10: 75,
        percent12: 76,
        percentAggregate: 80,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('meets');
    });

    // P-07: Branch Alias E&TC -> ECE
    it('P-07-ALIAS-ENTC: "E&TC" resolves to ECE and matches ECE programs', () => {
      const profile: StudentProfile = {
        branch: 'E&TC',
        batchYear: 2026,
        cgpa: 7.2,
        cgpaScale: 10,
        percent10: 75,
        percent12: 72,
        percentAggregate: 70,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, infosysSe);
      expect(res.status).toBe('meets');
    });

    // P-08: Gap 24 Months
    it('P-08-GAP-24MO: 24 months education gap passes 24-month limit', () => {
      const profile: StudentProfile = {
        branch: 'CIVIL',
        batchYear: 2026,
        cgpa: 6.8,
        cgpaScale: 10,
        percent10: 65,
        percent12: 65,
        percentAggregate: 65,
        activeBacklogs: 0,
        gapMonths: 24
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('meets');
    });

    // P-09: Gap 36 Months
    it('P-09-GAP-36MO: 36 months education gap fails 24-month limit program', () => {
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 7.0,
        cgpaScale: 10,
        percent10: 70,
        percent12: 70,
        percentAggregate: 70,
        activeBacklogs: 0,
        gapMonths: 36
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('fails');
      const gapCrit = res.criteria.find((c) => c.criterion === 'max_gap_months');
      expect(gapCrit?.state).toBe('fail');
    });

    // P-10: Active Backlog 1
    it('P-10-ACTIVE-BACKLOG-1: 1 active backlog passes TCS Ninja (max 1), fails Infosys (max 0)', () => {
      const profile: StudentProfile = {
        branch: 'EEE',
        batchYear: 2026,
        cgpa: 6.4,
        cgpaScale: 10,
        percent10: 65,
        percent12: 65,
        percentAggregate: 64,
        activeBacklogs: 1
      };
      const resTcs = evaluateEligibility(profile, tcsNinja);
      expect(resTcs.status).toBe('meets');

      const resInfy = evaluateEligibility(profile, infosysSe);
      expect(resInfy.status).toBe('fails');
      expect(resInfy.criteria.find((c) => c.criterion === 'active_backlogs')?.state).toBe('fail');
    });

    // P-11: Cleared Backlogs 3 (Active = 0)
    it('P-11-CLEARED-BACKLOGS-3: 0 active backlogs with cleared historic backlogs passes', () => {
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 7.1,
        cgpaScale: 10,
        percent10: 70,
        percent12: 70,
        percentAggregate: 70,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, infosysSe);
      expect(res.status).toBe('meets');
    });

    // P-12: Exact Threshold (6.00 CGPA)
    it('P-12-EXACT-THRESHOLD: 6.00 CGPA exactly meets 6.0 cutoff without failure', () => {
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 6.0,
        cgpaScale: 10,
        percent10: 60,
        percent12: 60,
        percentAggregate: 60,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('meets');
    });

    // P-13: Just Below Threshold (5.99 CGPA)
    it('P-13-JUST-BELOW-THRESHOLD: 5.99 CGPA fails 6.0 cutoff cleanly', () => {
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 5.99,
        cgpaScale: 10,
        percent10: 60,
        percent12: 60,
        percentAggregate: 60,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('fails');
      expect(res.criteria.find((c) => c.criterion === 'cgpa')?.state).toBe('fail');
    });

    // P-14: Batch Unlisted (2024 pass-out)
    it('P-14-BATCH-UNLISTED: 2024 batch fails 2026 fresher campus drive', () => {
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2024,
        cgpa: 8.0,
        cgpaScale: 10,
        percent10: 80,
        percent12: 80,
        percentAggregate: 80,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, infosysSe);
      expect(res.status).toBe('fails');
      expect(res.criteria.find((c) => c.criterion === 'batch_year')?.state).toBe('fail');
    });

    // P-15: All Branches Program (Zoho)
    it('P-15-ALL-BRANCHES-PROGRAM: BioTech passes open all-branch company', () => {
      const profile: StudentProfile = {
        branch: 'BIOTECH',
        batchYear: 2026,
        cgpa: 7.5,
        cgpaScale: 10,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, zohoSe);
      expect(res.status).toBe('meets');
    });

    // P-16: Restricted Branch Rejection
    it('P-16-RESTRICTED-BRANCH: Civil fails circuit-only Walmart drive', () => {
      const profile: StudentProfile = {
        branch: 'CIVIL',
        batchYear: 2026,
        cgpa: 8.5,
        cgpaScale: 10,
        activeBacklogs: 0
      };
      const res = evaluateEligibility(profile, walmartSde);
      expect(res.status).toBe('fails');
      expect(res.criteria.find((c) => c.criterion === 'branch')?.state).toBe('fail');
    });

    // P-17: Budget Minimal (3 Core Inputs Only)
    it('P-17-BUDGET-MINIMAL: Only branch, batchYear, cgpa provided -> returns check with blockingInputs', () => {
      const profile: StudentProfile = {
        branch: 'IT',
        batchYear: 2026,
        cgpa: 7.4,
        cgpaScale: 10
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('check');
      expect(res.blockingInputs).toContain('percentAggregate');
      expect(res.blockingInputs).toContain('activeBacklogs');
    });

    // P-18: Zero Criteria Program -> Unknown
    it('P-18-NO-CUTOFF-PROGRAM: Program with no published academic cutoffs returns unknown', () => {
      const emptyProgram: ProgramRecord = {
        id: 'mock-stealth-startup',
        facts: {
          officialName: 'Mock Stealth Startup',
          programName: 'Campus Hiring',
          programPageUrl: 'https://example.com/stealth',
          eligibility: {}
        },
        evidence: {},
        lastChecked: '2026-10-26'
      };
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 7.0,
        cgpaScale: 10
      };
      const res = evaluateEligibility(profile, emptyProgram);
      expect(res.status).toBe('unknown');
      expect(res.caveats[0]).toContain('No criteria published');
    });

    // P-19: High Backlogs (4 active backlogs)
    it('P-19-HIGH-BACKLOGS: 4 active backlogs fails standard programs', () => {
      const profile: StudentProfile = {
        branch: 'ME',
        batchYear: 2026,
        cgpa: 6.2,
        cgpaScale: 10,
        percent10: 65,
        percent12: 65,
        percentAggregate: 62,
        activeBacklogs: 4
      };
      const res = evaluateEligibility(profile, tcsNinja);
      expect(res.status).toBe('fails');
    });

    // P-20: Perfect Score Baseline Pass
    it('P-20-PERFECT-SCORE: 10.0 CGPA, 99% 10th, 98% 12th, 0 backlogs passes universally', () => {
      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 10.0,
        cgpaScale: 10,
        percent10: 99,
        percent12: 98,
        percentAggregate: 98,
        activeBacklogs: 0
      };
      const resTcs = evaluateEligibility(profile, tcsNinja);
      const resInfy = evaluateEligibility(profile, infosysSe);
      const resWalmart = evaluateEligibility(profile, walmartSde);
      expect(resTcs.status).toBe('meets');
      expect(resInfy.status).toBe('meets');
      expect(resWalmart.status).toBe('meets');
    });
  });

  describe('3. CGPA Gap Calculator Formula: R = (T*N - C*n) / (N - n)', () => {
    it('calculates required remaining CGPA correctly: Current 6.5 after 4 sems, target 7.5 over 8 sems', () => {
      // T = 7.5, N = 8, C = 6.5, n = 4
      // R = (7.5 * 8 - 6.5 * 4) / 4 = (60 - 26) / 4 = 34 / 4 = 8.5
      const res = calculateCgpaGap(6.5, 4, 8, 7.5);
      expect(res.isPossible).toBe(true);
      expect(res.isAchieved).toBe(false);
      expect(res.requiredRemainingCgpa).toBe(8.5);
    });

    it('flags mathematically impossible target when R > 10.0', () => {
      // Current 5.0 after 6 sems, target 8.0 over 8 sems
      // R = (8.0 * 8 - 5.0 * 6) / 2 = (64 - 30) / 2 = 34 / 2 = 17.0 > 10.0
      const res = calculateCgpaGap(5.0, 6, 8, 8.0);
      expect(res.isPossible).toBe(false);
      expect(res.isAchieved).toBe(false);
      expect(res.requiredRemainingCgpa).toBe(17.0);
      expect(res.reason).toContain('exceeds maximum possible 10.0');
    });

    it('identifies already achieved target when current >= target', () => {
      const res = calculateCgpaGap(8.5, 6, 8, 7.0);
      expect(res.isPossible).toBe(true);
      expect(res.isAchieved).toBe(true);
    });
  });
});
