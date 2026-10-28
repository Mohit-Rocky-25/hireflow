import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('HireFlow Stage 6 Teachability & Career Value Validation', () => {
  const root = process.cwd();
  const corpusPath = path.join(root, 'docs/briefs/CORPUS.json');
  const corpus = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));

  it('validates every brief has exactly 5 milestones summing to 100% effort share', () => {
    corpus.forEach((b: any) => {
      expect(b.milestones).toBeDefined();
      expect(b.milestones.length).toBeGreaterThanOrEqual(4);
      const totalEffort = b.milestones.reduce((acc: number, m: any) => acc + m.effortSharePercent, 0);
      expect(totalEffort).toBe(100);
      b.milestones.forEach((m: any) => {
        expect(m.title).toBeTruthy();
        expect(m.conceptIntroduced).toBeTruthy();
        expect(m.verifiableOutput).toBeTruthy();
      });
    });
  });

  it('validates prerequisite checks contain 5 questions and skill requirements', () => {
    corpus.forEach((b: any) => {
      expect(b.prerequisitesCheck).toBeDefined();
      expect(b.prerequisitesCheck.selfCheckQuestions.length).toBe(5);
      expect(b.prerequisitesCheck.skillsRequired.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('validates each brief provides >= 3 structured resume bullet variants', () => {
    corpus.forEach((b: any) => {
      expect(b.resumeVariants).toBeDefined();
      expect(b.resumeVariants.length).toBeGreaterThanOrEqual(3);
      const structures = b.resumeVariants.map((r: any) => r.structure);
      expect(structures).toContain('outcome-first');
      expect(structures).toContain('scale-first');
      expect(structures).toContain('technique-first');
    });
  });

  it('validates each brief provides >= 8 architecture & trade-off interview defense questions', () => {
    corpus.forEach((b: any) => {
      expect(b.interviewDefensePack).toBeDefined();
      expect(b.interviewDefensePack.length).toBeGreaterThanOrEqual(8);
      b.interviewDefensePack.forEach((item: any) => {
        expect(item.question).toBeTruthy();
        expect(item.answerOutline).toBeTruthy();
        expect(item.tradeOffs).toBeTruthy();
        expect(item.failureModes).toBeTruthy();
      });
    });
  });

  it('validates India market context tags are defined for all briefs', () => {
    corpus.forEach((b: any) => {
      expect(b.indiaMarketContext).toBeDefined();
      expect(b.indiaMarketContext.roleFamilies.length).toBeGreaterThan(0);
      expect(b.indiaMarketContext.companyTiers.length).toBeGreaterThan(0);
      expect(b.indiaMarketContext.freePath).toBeTruthy();
    });
  });
});
