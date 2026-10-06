// ============================================================
// Career Engine Unit Tests — India Market Edition
// Tests Student mode hiring pathways, Working Professional mode, and edge cases
// ============================================================

import { describe, it, expect } from 'vitest';
import { resolvePath, resolveStudentPath, formatINR } from '../careerEngine';

describe('Career Engine Path Resolution & Deterministic Modeling (India Market)', () => {
  it('formats currency correctly in Indian LPA and Crores', () => {
    expect(formatINR(336000)).toBe('₹3.4 LPA');
    expect(formatINR(2400000)).toBe('₹24.0 LPA');
    expect(formatINR(7500000)).toBe('₹75.0 LPA');
    expect(formatINR(12800000)).toBe('₹1.28 Cr');
    expect(formatINR(24500000)).toBe('₹2.45 Cr');
  });

  // TEST 1 (Requested): IIT student to Google India SDE-L3 then L5
  it('resolves Student Route: IIT student to Google India SDE-L3 then L5', () => {
    const plan = resolveStudentPath({
      degreeAndBranch: 'BTech_CSE_IT',
      collegeTier: 'Tier 1',
      currentYearOfStudy: 'Final Year',
      expectedGraduationYear: 2026,
      cgpaBracket: 'above_8',
      internshipStatus: 'none',
      dreamCompanyId: 'google',
      dreamLevelCode: 'L5',
      track: 'SWE',
    });

    expect(plan.status).toBe('SUCCESS');
    expect(plan.dreamCompany.id).toBe('google');
    expect(plan.entryLevel.levelCode).toBe('L3');
    expect(plan.targetLevel.levelCode).toBe('L5');

    // Ranked hiring routes
    expect(plan.entryRoutes.length).toBeGreaterThan(0);
    const onCampus = plan.entryRoutes.find((r) => r.routeType === 'on-campus');
    expect(onCampus).toBeDefined();
    expect(onCampus?.adjustedLikelihood).toBe('High');
    expect(onCampus?.expectedOfferINR).toBeGreaterThanOrEqual(3000000);

    // Promotion steps: L3 -> L4 -> L5
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0].fromLevel.levelCode).toBe('L3');
    expect(plan.steps[0].toLevel.levelCode).toBe('L4');
    expect(plan.steps[1].fromLevel.levelCode).toBe('L4');
    expect(plan.steps[1].toLevel.levelCode).toBe('L5');

    // Calendar windows anchored to graduation year
    expect(plan.steps[0].calendarYearWindow).toContain('2026');
    expect(plan.compTimeline[0].calendarYear).toBe(2026);
    expect(plan.totalTimeFromGraduation.likely).toBeGreaterThan(0);
  });

  // TEST 2 (Requested): Tier 3 student to TCS Digital then Flipkart SDE-2
  it('resolves Student Route: Tier 3 student targeting Flipkart with TCS Digital stepping stone', () => {
    const plan = resolveStudentPath({
      degreeAndBranch: 'BTech_CSE_IT',
      collegeTier: 'Tier 3',
      currentYearOfStudy: '3rd Year',
      expectedGraduationYear: 2027,
      cgpaBracket: '7_to_8',
      internshipStatus: 'none',
      dreamCompanyId: 'flipkart',
      dreamLevelCode: 'SDE-2',
      track: 'SWE',
    });

    expect(plan.status).toBe('SUCCESS');
    expect(plan.entryLevel.levelCode).toBe('SDE-1');
    expect(plan.targetLevel.levelCode).toBe('SDE-2');

    // Tier 3 on-campus likelihood should reflect realistic entry
    const onCampus = plan.entryRoutes.find((r) => r.routeType === 'on-campus');
    expect(onCampus?.adjustedLikelihood).toBe('Low');

    // Hackathon competition should be recognized
    const hackathon = plan.entryRoutes.find((r) => r.routeType === 'hackathon-competition');
    expect(hackathon).toBeDefined();

    // Alternate stepping stones should recommend TCS or high-growth tech
    expect(plan.alternateSteppingStones.length).toBeGreaterThan(0);
    const tcsSteppingStone = plan.alternateSteppingStones.find((s) => s.company.id === 'tcs');
    expect(tcsSteppingStone).toBeDefined();
    expect(tcsSteppingStone?.entryRole).toContain('Digital');
  });

  // TEST 3 (Requested): Student targeting a level that does not exist
  it('handles student targeting a level that does not exist', () => {
    const plan = resolveStudentPath({
      degreeAndBranch: 'BTech_CSE_IT',
      collegeTier: 'Tier 1',
      currentYearOfStudy: 'Final Year',
      expectedGraduationYear: 2026,
      cgpaBracket: 'above_8',
      internshipStatus: 'none',
      dreamCompanyId: 'google',
      dreamLevelCode: 'NONEXISTENT_LEVEL_999',
      track: 'SWE',
    });

    expect(plan.status).toBe('TARGET_NOT_FOUND');
    expect(plan.steps.length).toBe(0);
    expect(plan.message).toContain('Could not resolve dream company or role');
  });

  // TEST 4 (Requested): Professional switching company (Amazon L5 -> Meta E6)
  it('resolves working professional cross-company switch: Amazon L5 -> Meta E6', () => {
    const plan = resolvePath(
      { companyId: 'amazon', levelCode: 'L5', track: 'SWE' },
      { companyId: 'meta', levelCode: 'E6', track: 'SWE' },
      { performanceBracket: 'EXCEEDS' }
    );

    expect(plan.status).toBe('SUCCESS');
    expect(plan.steps.length).toBeGreaterThanOrEqual(2);

    // First step is lateral company switch to Meta
    expect(plan.steps[0].isCompanySwitch).toBe(true);
    expect(plan.steps[0].fromLevel.companyId).toBe('amazon');
    expect(plan.steps[0].toLevel.companyId).toBe('meta');
    expect(plan.steps[0].stepType).toBe('LATERAL_SWITCH');

    // Structured blockers present on all steps
    expect(plan.steps[0].blockers.length).toBeGreaterThanOrEqual(6);

    // Final level reached is Meta E6
    const finalStep = plan.steps[plan.steps.length - 1];
    expect(finalStep.toLevel.levelCode).toBe('E6');
    expect(finalStep.toLevel.companyId).toBe('meta');

    // Comp in INR
    expect(plan.compJump.to).toBeGreaterThan(plan.compJump.from);
  });

  // TEST 5 (Requested): Invalid inputs handling
  it('gracefully handles invalid inputs with UNREACHABLE status and friendly message', () => {
    const plan = resolvePath(
      { companyId: 'invalid-company', levelCode: 'XYZ' },
      { companyId: 'google', levelCode: 'L5' }
    );

    expect(plan.status).toBe('UNREACHABLE');
    expect(plan.steps.length).toBe(0);
    expect(plan.message).toContain('Could not resolve company ladder node');
  });

  it('resolves same-company working professional: Google L4 -> L6', () => {
    const plan = resolvePath(
      { companyId: 'google', levelCode: 'L4', track: 'SWE' },
      { companyId: 'google', levelCode: 'L6', track: 'SWE' },
      { performanceBracket: 'MEETS', yearsInCurrentLevel: 1.0 }
    );

    expect(plan.status).toBe('SUCCESS');
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0].fromLevel.levelCode).toBe('L4');
    expect(plan.steps[0].toLevel.levelCode).toBe('L5');
    expect(plan.steps[1].fromLevel.levelCode).toBe('L5');
    expect(plan.steps[1].toLevel.levelCode).toBe('L6');
  });

  it('respects optional actual currentAnnualCTC in comp jump calculation', () => {
    const plan = resolvePath(
      { companyId: 'tcs', levelCode: 'DIGITAL', track: 'SWE' },
      { companyId: 'flipkart', levelCode: 'SDE-2', track: 'SWE' },
      { currentAnnualCTC: 800000 }
    );

    expect(plan.status).toBe('SUCCESS');
    expect(plan.compJump.from).toBe(800000);
    expect(plan.compJump.to).toBeGreaterThan(800000);
    expect(plan.compJump.percentage).toBeGreaterThan(100);
  });

  // TEST 9: Mechanical Student Adapts to Core Engineering Routes (Tata Motors, L&T, Bosch, Mahindra)
  it('adapts student roadmap for Mechanical Engineering with core routes and software lateral route', () => {
    const plan = resolveStudentPath({
      degreeAndBranch: 'B.Tech Mechanical Engineering',
      collegeTier: 'Tier 2',
      currentYearOfStudy: '3rd Year',
      expectedGraduationYear: 2028,
      cgpaBracket: '7_to_8',
      internshipStatus: 'none',
      dreamCompanyId: 'tata-motors',
      dreamLevelCode: 'L2',
      track: 'SWE',
      branchFamily: 'core-mechanical',
    });

    expect(plan.status).toBe('SUCCESS');
    expect(plan.dreamCompany.id).toBe('tata-motors');
    expect(plan.entryLevel.levelCode).toBe('GET');
    expect(plan.targetLevel.levelCode).toBe('L2');

    // Alternate stepping stones must include core engineering companies
    expect(plan.alternateSteppingStones.length).toBeGreaterThan(0);
    const hasCoreOrHybrid = plan.alternateSteppingStones.some(
      (s) => s.company.id === 'bosch-india' || s.company.id === 'lnt' || s.company.id === 'mahindra'
    );
    expect(hasCoreOrHybrid).toBe(true);

    // Advice must explain both core R&D and software lateral route
    expect(
      plan.strategicAdvice.some(
        (a) => a.includes('Dual Pathway') || a.includes('Tata Motors') || a.includes('Software Lateral')
      )
    ).toBe(true);

    // Eligibility windows must reflect 3rd year / Penultimate status
    expect(plan.eligibilityWindows).toBeDefined();
    expect(plan.eligibilityWindows?.remainingSemesters).toBeGreaterThan(0);
    expect(plan.eligibilityWindows?.internshipWindow).toContain('Summer Internship');
  });

  // TEST 10: Date-driven Eligibility Windows for Graduated Student
  it('correctly computes eligibility windows for a graduated student', () => {
    const plan = resolveStudentPath({
      degreeAndBranch: 'B.Tech CSE',
      collegeTier: 'Tier 3',
      currentYearOfStudy: 'Graduated',
      expectedGraduationYear: 2026,
      cgpaBracket: '7_to_8',
      internshipStatus: 'completed',
      dreamCompanyId: 'google',
      dreamLevelCode: 'L4',
      track: 'SWE',
    });

    expect(plan.eligibilityWindows).toBeDefined();
    expect(plan.eligibilityWindows?.remainingSemesters).toBe(0);
    expect(plan.eligibilityWindows?.currentStatus).toContain('Graduated');
    expect(plan.eligibilityWindows?.campusPlacementWindow).toContain('Off-Campus');
  });
});
