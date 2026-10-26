// ============================================================
// Pathways Plan Engine Test Suite
// Validates 3-Lane Ordering, Pace Scaling, Invariants
// ============================================================

import { describe, it, expect } from 'vitest';
import { generateActionPlan, getPaceMultiplier } from '../../src/pathways/engine/plan';
import { PATHWAYS_PROGRAMS } from '../../src/pathways/facts/programs.generated';
import type { StudentProfile } from '../../src/pathways/schema/types';

describe('Pathways Action Plan Engine', () => {
  const tcsNinja = PATHWAYS_PROGRAMS.find((p) => p.id === 'tcs-ninja')!;
  const infosysSe = PATHWAYS_PROGRAMS.find((p) => p.id === 'infosys-se')!;

  describe('1. Three-Lane Ordering Invariant', () => {
    it('strictly orders tasks: eligibility_blocker -> readiness_gap -> process_prep', () => {
      const studentWithBlockers: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 5.5, // Below TCS 6.0 cutoff -> CGPA recovery blocker
        cgpaScale: 10,
        activeBacklogs: 2 // TCS allows max 1 -> Backlog clear blocker
      };

      const plan = generateActionPlan(studentWithBlockers, tcsNinja, 'standard');
      expect(plan.tasks.length).toBeGreaterThanOrEqual(5);

      const categoryOrder: Record<string, number> = {
        eligibility_blocker: 1,
        readiness_gap: 2,
        process_prep: 3
      };

      let currentMaxCategoryRank = 0;
      for (const task of plan.tasks) {
        const rank = categoryOrder[task.category];
        expect(rank).toBeGreaterThanOrEqual(currentMaxCategoryRank);
        currentMaxCategoryRank = rank;
      }
    });

    it('omits eligibility blockers when student has zero blockers', () => {
      const cleanStudent: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 8.5,
        cgpaScale: 10,
        activeBacklogs: 0
      };

      const plan = generateActionPlan(cleanStudent, infosysSe, 'standard');
      const blockerTasks = plan.tasks.filter((t) => t.category === 'eligibility_blocker');
      expect(blockerTasks.length).toBe(0);
    });
  });

  describe('2. Pace Multipliers & Relative Week Scaling', () => {
    it('applies standard (1.0), relaxed (1.5), and intense (0.67) pace multipliers', () => {
      expect(getPaceMultiplier('standard')).toBe(1.0);
      expect(getPaceMultiplier('relaxed')).toBe(1.5);
      expect(getPaceMultiplier('intense')).toBe(0.67);

      const profile: StudentProfile = {
        branch: 'CSE',
        batchYear: 2026,
        cgpa: 7.5,
        cgpaScale: 10
      };

      const planStd = generateActionPlan(profile, tcsNinja, 'standard');
      const planRel = generateActionPlan(profile, tcsNinja, 'relaxed');
      const planInt = generateActionPlan(profile, tcsNinja, 'intense');

      const dsaStd = planStd.tasks.find((t) => t.id === 'task-readiness-dsa')!;
      const dsaRel = planRel.tasks.find((t) => t.id === 'task-readiness-dsa')!;
      const dsaInt = planInt.tasks.find((t) => t.id === 'task-readiness-dsa')!;

      // Relaxed weeks should be greater than or equal to standard
      expect(dsaRel.effortLikelyWeeks).toBeGreaterThanOrEqual(dsaStd.effortLikelyWeeks);
      // Intense weeks should be less than or equal to standard
      expect(dsaInt.effortLikelyWeeks).toBeLessThanOrEqual(dsaStd.effortLikelyWeeks);
    });
  });

  describe('3. Invariant Property Checks', () => {
    it('all tasks maintain effortMinWeeks <= effortLikelyWeeks <= effortMaxWeeks', () => {
      const profile: StudentProfile = {
        branch: 'ECE',
        batchYear: 2026,
        cgpa: 5.8,
        cgpaScale: 10,
        activeBacklogs: 3
      };

      for (const pace of ['relaxed', 'standard', 'intense'] as const) {
        const plan = generateActionPlan(profile, tcsNinja, pace);
        for (const task of plan.tasks) {
          expect(task.effortMinWeeks).toBeGreaterThan(0);
          expect(task.effortLikelyWeeks).toBeGreaterThanOrEqual(task.effortMinWeeks);
          expect(task.effortMaxWeeks).toBeGreaterThanOrEqual(task.effortLikelyWeeks);
        }
      }
    });

    it('deterministic reproducibility: identical inputs yield identical task plans', () => {
      const profile: StudentProfile = {
        branch: 'ME',
        batchYear: 2026,
        cgpa: 7.0,
        cgpaScale: 10,
        activeBacklogs: 1
      };

      const run1 = generateActionPlan(profile, tcsNinja, 'standard');
      const run2 = generateActionPlan(profile, tcsNinja, 'standard');
      expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
    });
  });
});
