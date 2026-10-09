import { describe, it, expect } from 'vitest';
import { parseResumeDocModel } from '../../lib/tailorEngine/docModel';
import { calculateWordDiffBudget, evaluateBulletFormula } from '../../lib/tailorEngine/actionWordEngine';
import { FLAT_ECE_FRESHER_FIXTURE } from './fixtures/flat-ece-fresher';

describe('Stage 6 — Change Transparency UI & Verification', () => {

  describe('Layout Repairs Transparency', () => {
    it('captures automatic layout repairs and left-out explanations for flat resume', () => {
      const model = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE);

      // 1. Reverse-chronological education repair
      expect(model.education.length).toBe(2);
      expect(model.education[0].degree).toContain('B.Tech');
      expect(model.education[0].year).toContain('(Expected)');

      // 2. Offloaded items have clear user-facing reasons
      expect(model.leftOut).toBeDefined();
      expect(model.leftOut?.length).toBeGreaterThan(0);
      model.leftOut?.forEach(item => {
        expect(item.reason.length).toBeGreaterThan(10);
        expect(item.item.length).toBeGreaterThan(0);
      });

      // 3. Categorized skills rows
      expect(model.skillCategories).toBeDefined();
      expect(model.skillCategories?.length).toBeGreaterThan(0);
    });
  });

  describe('Content Edits Word-Diff & Budget Transparency', () => {
    it('accurately computes words changed and budget status', () => {
      const original = 'Responsible for developing modular React and TypeScript frontends serving 60,000 active users.';
      const proposed = 'Developed modular React and TypeScript frontends serving 60,000 active users.';

      const budget = calculateWordDiffBudget(original, proposed);
      expect(budget.wordsChanged).toBe(3); // "Responsible for developing" replaced by "Developed"
      expect(budget.totalWords).toBe(12);
      expect(budget.percentChanged).toBeLessThanOrEqual(0.35);
      expect(budget.withinBudget).toBe(true);
    });

    it('evaluates 4-slot bullet formula for transparent recruiter audit', () => {
      const bullet = 'Architected high-throughput Kafka event streaming pipeline, handling 2.5M daily events.';
      const formula = evaluateBulletFormula(bullet);

      expect(formula.action).toBe(true);
      expect(formula.object).toBe(true);
      expect(formula.result).toBe(true);
      expect(formula.score).toBeGreaterThanOrEqual(3);
    });
  });

});
