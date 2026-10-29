import { describe, it, expect } from 'vitest';
import {
  evaluateSectionSequence,
  createTailoringPlan,
  parseTargetJob,
} from '../../src/lib/resume';
import { DEMO_SOFTWARE_ENGINEER_JD, DEMO_SECURITY_JD } from '../../src/lib/tailor/store/fixtures';
import personasData from '../fixtures/tailor/personas.json';
import jdsData from '../fixtures/tailor/jobDescriptions.json';

describe('Stage 3 — Target, Relevance, Planner & Section Sequence Evaluator', () => {
  const asOf = '2026-10-28';

  // -------------------------------------------------------------
  // D1: Target Job Parsing & Eligibility Detection
  // -------------------------------------------------------------
  describe('D1: Target Job Parsing & Eligibility Detection', () => {
    it('parses DEMO_SOFTWARE_ENGINEER_JD with mandatory requirements and skills', () => {
      const target = parseTargetJob(DEMO_SOFTWARE_ENGINEER_JD);
      expect(target.title).toContain('Software Engineer');
      expect(target.company).toBe('Razorpay');
      expect(target.requirements.length).toBeGreaterThan(0);
      expect(target.domainKeywords.length).toBeGreaterThan(0);
      expect(target.seniority).toBe('mid');
    });

    it('detects explicit campus eligibility cutoffs (CGPA, degree, batch)', () => {
      const campusJd = `
Graduate Engineer Trainee
Google | Bengaluru, India
Minimum Qualifications:
• B.Tech in Computer Science or related field, 2026 graduating batch.
• Minimum 7.5 CGPA or 65% aggregate.
• Strong foundation in Data Structures and Algorithms.
      `.trim();

      const target = parseTargetJob(campusJd);
      expect(target.seniority).toBe('fresher');
      expect(target.region).toBe('india-campus');
      expect(target.eligibilityCriteria?.hasEligibilityLine).toBe(true);
      expect(target.eligibilityCriteria?.minCGPA).toBe(7.5);
      expect(target.eligibilityCriteria?.minPercentage).toBe(65);
      expect(target.eligibilityCriteria?.eligibleBatches).toContain(2026);
    });
  });

  // -------------------------------------------------------------
  // D2: Rules R1 & R2 — Freshers & Recent Graduates Sequence
  // -------------------------------------------------------------
  describe('D2: Rules R1 & R2 — Freshers & Recent Graduates Sequence', () => {
    it('places Education at rank 1 for recent graduates (<= 2 years) with rationale mentioning graduation recency', () => {
      const target = parseTargetJob(DEMO_SOFTWARE_ENGINEER_JD);
      const evalResult = evaluateSectionSequence({
        candidate: {
          yearsSinceGraduation: 1,
          isStudentOrFresher: true,
          yearsExperience: 0.5,
        },
        target,
        regionId: 'india-campus',
        asOf,
      });

      expect(evalResult.recommendedOrder[0]).toBe('education');
      expect(evalResult.reasonsBySection.education).toContain('graduation was');
      expect(evalResult.isUserOverride).toBe(false);
    });

    it('places Education at rank 1 when target job has explicit eligibility line', () => {
      const campusTarget = parseTargetJob(`
Campus SDE Trainee
Amazon | Bengaluru, India
Minimum 8.0 CGPA required for 2026 batch.
      `);

      const evalResult = evaluateSectionSequence({
        candidate: {
          yearsSinceGraduation: 0,
          yearsExperience: 0,
          isStudentOrFresher: true,
        },
        target: campusTarget,
        regionId: 'india-campus',
        asOf,
      });

      expect(evalResult.recommendedOrder[0]).toBe('education');
      expect(evalResult.reasons[0]).toContain('explicit campus eligibility line');
    });
  });

  // -------------------------------------------------------------
  // D3: Rule R3 — Mid-Career Candidates (3-5 years)
  // -------------------------------------------------------------
  describe('D3: Rule R3 — Mid-Career Candidates (3-5 years)', () => {
    it('places Experience first, followed by Skills and Projects, with Education later', () => {
      const target = parseTargetJob(DEMO_SOFTWARE_ENGINEER_JD);
      const evalResult = evaluateSectionSequence({
        candidate: {
          yearsSinceGraduation: 4,
          yearsExperience: 4,
          isStudentOrFresher: false,
        },
        target,
        regionId: 'india-private',
        asOf,
      });

      expect(evalResult.recommendedOrder[0]).toBe('experience');
      const eduIndex = evalResult.recommendedOrder.indexOf('education');
      const expIndex = evalResult.recommendedOrder.indexOf('experience');
      expect(expIndex).toBeLessThan(eduIndex);
      expect(evalResult.reasons[0]).toContain('Mid-career candidate (4 years)');
    });
  });

  // -------------------------------------------------------------
  // D4: Rule R4 — Experienced Candidates (6+ years)
  // -------------------------------------------------------------
  describe('D4: Rule R4 — Experienced Candidates (6+ years)', () => {
    it('places Summary and Experience ahead of Education and budgets 2 pages', () => {
      const target = parseTargetJob(DEMO_SECURITY_JD);
      const plan = createTailoringPlan({
        candidate: {
          yearsSinceGraduation: 9,
          yearsExperience: 9,
          isStudentOrFresher: false,
        },
        target,
        regionId: 'us',
        asOf,
      });

      expect(plan.recommendedSectionOrder[0]).toBe('summary');
      expect(plan.recommendedSectionOrder[1]).toBe('experience');
      expect(plan.reasons[0]).toContain('Experienced candidate (9+ years)');

      // Total budget lines should reflect 2-page capacity (~108 lines for letter)
      const totalBudget = plan.sectionPlans.reduce((sum, sp) => sum + sp.budgetLines, 0);
      expect(totalBudget).toBeGreaterThan(60);
    });
  });

  // -------------------------------------------------------------
  // D5: Rule R5 — Career Switchers
  // -------------------------------------------------------------
  describe('D5: Rule R5 — Career Switchers', () => {
    it('prioritizes Projects over historical Experience for career switchers', () => {
      const target = parseTargetJob(DEMO_SOFTWARE_ENGINEER_JD);
      const evalResult = evaluateSectionSequence({
        candidate: {
          yearsSinceGraduation: 5,
          yearsExperience: 4,
          isCareerSwitcher: true,
        },
        target,
        regionId: 'us',
        asOf,
      });

      expect(evalResult.recommendedOrder[0]).toBe('projects');
      const projIndex = evalResult.recommendedOrder.indexOf('projects');
      const expIndex = evalResult.recommendedOrder.indexOf('experience');
      expect(projIndex).toBeLessThan(expIndex);
      expect(evalResult.reasons[0]).toContain('Career switcher profile');
    });
  });

  // -------------------------------------------------------------
  // D6: Rule R7 — User Override Integrity
  // -------------------------------------------------------------
  describe('D6: Rule R7 — User Override Integrity', () => {
    it('honors user sequence override while preserving engine recommendation and reasons', () => {
      const target = parseTargetJob(DEMO_SOFTWARE_ENGINEER_JD);
      const userOverride = ['skills', 'education', 'projects', 'experience'] as const;

      const evalResult = evaluateSectionSequence({
        candidate: {
          yearsSinceGraduation: 1,
          isStudentOrFresher: true,
        },
        target,
        regionId: 'india-campus',
        asOf,
        userOverride: [...userOverride],
      });

      expect(evalResult.isUserOverride).toBe(true);
      expect(evalResult.effectiveOrder).toEqual(userOverride);
      // Engine recommendation remains unchanged for reference
      expect(evalResult.recommendedOrder[0]).toBe('education');
      expect(evalResult.reasons.some(r => r.includes('User-defined sequence override'))).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // D7: 100% Determinism Invariant
  // -------------------------------------------------------------
  describe('D7: 100% Determinism Invariant', () => {
    it('produces byte-identical plan across 100 consecutive executions with same input and asOf', () => {
      const target = parseTargetJob(DEMO_SOFTWARE_ENGINEER_JD);
      const input = {
        candidate: { yearsSinceGraduation: 2, yearsExperience: 2, isStudentOrFresher: true },
        target,
        regionId: 'india-campus' as const,
        asOf: '2026-10-28',
      };

      const baselinePlan = JSON.stringify(createTailoringPlan(input));
      for (let i = 0; i < 100; i++) {
        const currentPlan = JSON.stringify(createTailoringPlan(input));
        expect(currentPlan).toBe(baselinePlan);
      }
    });
  });

  // -------------------------------------------------------------
  // D8: Mass Personas Evaluation Snapshot
  // -------------------------------------------------------------
  describe('D8: Mass Personas Evaluation Snapshot', () => {
    it('evaluates all 26 synthetic personas against targets and produces consistent orders', () => {
      const defaultTarget = parseTargetJob(DEMO_SOFTWARE_ENGINEER_JD);
      const evaluationTable: Array<{ persona: string; archetype: string; topSection: string; isRecent: boolean }> = [];

      for (const persona of personasData) {
        const evalResult = evaluateSectionSequence({
          candidate: {
            yearsSinceGraduation: persona.yearsSinceGraduation,
            yearsExperience: persona.yearsExperience,
            isStudentOrFresher: persona.archetype === 'student_fresher' || (persona.yearsSinceGraduation !== undefined && persona.yearsSinceGraduation <= 2),
            isCareerSwitcher: persona.archetype === 'career_switcher',
          },
          target: defaultTarget,
          regionId: (persona.region as any) || 'india-campus',
          asOf,
        });

        evaluationTable.push({
          persona: persona.fullName,
          archetype: persona.archetype,
          topSection: evalResult.recommendedOrder[0],
          isRecent: persona.yearsSinceGraduation !== undefined && persona.yearsSinceGraduation <= 2,
        });

        if (persona.archetype === 'student_fresher' || (persona.yearsSinceGraduation !== undefined && persona.yearsSinceGraduation <= 2)) {
          expect(evalResult.recommendedOrder[0]).toBe('education');
        }
      }

      expect(evaluationTable.length).toBe(26);
    });
  });
});

