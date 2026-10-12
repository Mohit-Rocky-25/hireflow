import { describe, it, expect } from 'vitest';
import { RESUME_FIXTURES } from './fixtures';
import { processResumePipeline } from '../../lib/tailorEngine/engine/index';

describe('HireFlow Resume Tailor — 12-Fixture Verification Suite', () => {
  const resultsTable: Array<{
    id: string;
    category: string;
    status: 'PASS' | 'FAIL';
    pages: number;
    score: number;
    notes?: string;
  }> = [];

  for (const fixture of RESUME_FIXTURES) {
    it(`verifies fixture: ${fixture.id} (${fixture.category})`, () => {
      const result = processResumePipeline(fixture.rawText);
      const { canonical, layout, validation, htmlPreview } = result;

      // Invariant 1: No skills item longer than 6 words
      for (const group of canonical.skills.groups) {
        for (const item of group.items) {
          const words = item.trim().split(/\s+/).filter(Boolean);
          expect(
            words.length,
            `Skill item "${item}" in group "${group.label}" exceeds 6 words in fixture ${fixture.id}`
          ).toBeLessThanOrEqual(6);
        }
      }

      // Invariant 2: No bullet starts lowercase
      const allBullets = [
        ...canonical.experience.flatMap((e) => e.bullets),
        ...canonical.projects.flatMap((p) => p.bullets),
        ...canonical.leadership.flatMap((l) => l.bullets),
        ...(canonical.achievements || []).flatMap((a) => (a.bullets || [a.title])),
        ...(canonical.certifications || []).map((c) => c.name)
      ];
      for (const bullet of allBullets) {
        const firstChar = bullet.trim().charAt(0);
        expect(
          firstChar,
          `Bullet "${bullet}" starts with lowercase in fixture ${fixture.id}`
        ).toMatch(/[A-Z0-9"'(]/);
      }

      // Invariant 3: No ".," or ".." anywhere in output
      expect(htmlPreview).not.toContain('.,');
      expect(htmlPreview).not.toContain('..');
      expect(htmlPreview).not.toContain(',.');

      // Invariant 4: No empty section headings
      for (const sec of layout.sections) {
        expect(
          sec.lines.length,
          `Section "${sec.title}" is rendered empty in fixture ${fixture.id}`
        ).toBeGreaterThan(0);
      }

      // Invariant 5: Output fits within page limit (at most 2 pages)
      expect(layout.estimatedPages).toBeLessThanOrEqual(2);

      // Invariant 6: Regression check on Cybersecurity Fresher (Defect 1 & Defect C)
      if (fixture.id === 'cybersecurity-fresher') {
        expect(canonical.projects.length).toBe(3);
        expect(canonical.achievements.length).toBeGreaterThan(0);
        expect(canonical.skills.groups.length).toBeGreaterThan(0);
        for (const g of canonical.skills.groups) {
          for (const item of g.items) {
            expect(item).not.toContain('AndroGoat');
            expect(item).not.toContain('Performed');
            expect(item).not.toContain('Identified');
          }
        }
      }

      // Record pass in results table
      resultsTable.push({
        id: fixture.id,
        category: fixture.category,
        status: 'PASS',
        pages: layout.estimatedPages,
        score: validation.qualityScore,
        notes: layout.appliedFitAdjustments.join('; ') || 'Standard fit'
      });
    });
  }
});
