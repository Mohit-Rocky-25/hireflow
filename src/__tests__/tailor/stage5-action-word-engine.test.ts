import { describe, it, expect } from 'vitest';
import {
  evaluateBulletFormula,
  tailorBulletLightTouch,
  checkSeniorityMismatch,
  ALL_ACTION_VERBS
} from '../../lib/tailorEngine/actionWordEngine';
import actionVerbsData from '../../data/tailor/action-verbs.json';
import { FLAT_ECE_FRESHER_FIXTURE } from './fixtures/flat-ece-fresher';
import { EXPERIENCED_DEVELOPER_FIXTURE } from './fixtures/moreFixtures';

describe('Stage 5 — Action Word Engine & JD Tailoring', () => {

  describe('Verb Ladder Data Completeness', () => {
    it('contains all 7 categories with 8-10 curated verbs each', () => {
      const categories = Object.keys(actionVerbsData.categories);
      expect(categories).toContain('build');
      expect(categories).toContain('improve');
      expect(categories).toContain('analyze');
      expect(categories).toContain('collaborate_lead');
      expect(categories).toContain('test_quality');
      expect(categories).toContain('embedded_iot');
      expect(categories).toContain('data');

      Object.entries(actionVerbsData.categories).forEach(([name, cat]) => {
        expect(cat.verbs.length).toBeGreaterThanOrEqual(8);
        expect(cat.verbs.length).toBeLessThanOrEqual(10);
      });

      expect(ALL_ACTION_VERBS.length).toBeGreaterThanOrEqual(56);
    });
  });

  describe('4-Slot Bullet Formula Evaluator (Action, Object, Tool, Result)', () => {
    it('awards 4/4 slots for a complete quantified technical bullet', () => {
      const bullet = 'Engineered modular React microservices with PostgreSQL backend, reducing API latency by 45%.';
      const formula = evaluateBulletFormula(bullet);

      expect(formula.action).toBe(true);  // "Engineered"
      expect(formula.object).toBe(true);  // "microservices", "backend"
      expect(formula.tool).toBe(true);    // "React", "PostgreSQL"
      expect(formula.result).toBe(true);  // "45%"
      expect(formula.score).toBe(4);
    });

    it('identifies missing slots in weak bullets', () => {
      const weakBullet = 'Responsible for helping the team with daily tasks.';
      const formula = evaluateBulletFormula(weakBullet);

      expect(formula.action).toBe(false); // "Responsible" is not an action verb
      expect(formula.tool).toBe(false);   // No tools mentioned
      expect(formula.result).toBe(false); // No metrics
      expect(formula.score).toBeLessThanOrEqual(1);
    });
  });

  describe('Light-Touch S1–S5 Tailoring & Word Budget Constraint (≤ 35%)', () => {
    it('upgrades weak opener while maintaining strict <= 35% word budget', () => {
      const original = 'Responsible for developing modular React and TypeScript frontends serving 60,000 active users.';
      const result = tailorBulletLightTouch(original);

      expect(result.proposedText.startsWith('Developed')).toBe(true);
      expect(result.formulaAfter.action).toBe(true);
      expect(result.formulaAfter.score).toBeGreaterThan(result.formulaBefore.score);

      // Verify budget constraint
      expect(result.budget.percentChanged).toBeLessThanOrEqual(0.35);
      expect(result.budget.withinBudget).toBe(true);
    });

    it('upgrades "helped with writing" to "Authored"', () => {
      const original = 'Helped with writing automated test suites using Jest and Cypress.';
      const result = tailorBulletLightTouch(original);

      expect(result.proposedText.startsWith('Authored')).toBe(true);
      expect(result.stepsApplied.some(s => s.includes('S1'))).toBe(true);
      expect(result.budget.withinBudget).toBe(true);
    });
  });

  describe('Seniority Mismatch Advisory Gate', () => {
    const seniorJD = `Role: Senior Principal Architect
Company: Google Cloud
Requirements:
- 8+ years experience in distributed systems design.
- Proven leadership guiding engineering orgs of 20+ engineers.`;

    it('flags seniority mismatch when fresher/student applies for Senior role', () => {
      const check = checkSeniorityMismatch(FLAT_ECE_FRESHER_FIXTURE, seniorJD);
      expect(check.isMismatch).toBe(true);
      expect(check.advisoryNote).toContain('Seniority Mismatch');
      expect(check.advisoryNote).toContain('preserving your honest student/fresher project credentials');
    });

    it('does not flag mismatch when experienced developer applies for Senior role', () => {
      const check = checkSeniorityMismatch(EXPERIENCED_DEVELOPER_FIXTURE, seniorJD);
      expect(check.isMismatch).toBe(false);
    });
  });

});
