import { describe, it, expect } from 'vitest';
import { recoverResumeStructure } from '../../lib/tailorEngine/structure/recoveryEngine';
import { parseResumeDocModel } from '../../lib/tailorEngine/docModel';
import { tailorBulletLightTouch } from '../../lib/tailorEngine/actionWordEngine';
import { FLAT_ECE_FRESHER_FIXTURE } from './fixtures/flat-ece-fresher';
import {
  CS_FRESHER_INTERNSHIP_FIXTURE,
  EXPERIENCED_DEVELOPER_FIXTURE,
  ALL_CAPS_HEADINGS_FIXTURE,
  SCRAMBLED_TWO_COLUMN_FIXTURE
} from './fixtures/moreFixtures';
import { generateDocxBlob } from '../../lib/tailorEngine/docxExport';

const ALL_FIXTURES = [
  FLAT_ECE_FRESHER_FIXTURE,
  CS_FRESHER_INTERNSHIP_FIXTURE,
  EXPERIENCED_DEVELOPER_FIXTURE,
  ALL_CAPS_HEADINGS_FIXTURE,
  SCRAMBLED_TWO_COLUMN_FIXTURE
];

describe('Stage 7: Comprehensive Testing & Invariants', () => {
  it('enforces I3: Determinism across multiple runs', () => {
    const doc1 = recoverResumeStructure(FLAT_ECE_FRESHER_FIXTURE);
    const doc2 = recoverResumeStructure(FLAT_ECE_FRESHER_FIXTURE);
    expect(JSON.stringify(doc1)).toBe(JSON.stringify(doc2));
  });

  it('enforces I2: Zero fabrication across all synthetic fixtures', () => {
    for (const fixtureText of ALL_FIXTURES) {
      const doc = recoverResumeStructure(fixtureText);
      const rawLower = fixtureText.toLowerCase();

      // Check education institutions exist in source
      for (const edu of doc.education) {
        if (edu.institution) {
          const firstWord = edu.institution.split(/\s+/)[0].toLowerCase();
          expect(rawLower).toContain(firstWord);
        }
      }

      // Check project names exist in source
      for (const proj of doc.projects) {
        if (proj.name) {
          const firstWord = proj.name.split(/\s+/)[0].toLowerCase();
          expect(rawLower).toContain(firstWord);
        }
      }
    }
  });

  it('enforces word limit ≤ 60 words per bullet across recovered items and no literal bullet markers', () => {
    const doc = recoverResumeStructure(FLAT_ECE_FRESHER_FIXTURE);
    for (const proj of doc.projects) {
      for (const bullet of proj.bullets) {
        const words = bullet.trim().split(/\s+/).filter(Boolean);
        expect(words.length).toBeLessThanOrEqual(60);
        // Ensure no literal bullet markers
        expect(bullet).not.toMatch(/^[-*•]\s+/);
      }
    }
  });

  it('verifies preset section ordering correctly aligns with template requirements', () => {
    const fresherDoc = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE, {}, 'fresher');
    const eduIdx = fresherDoc.sectionOrder.indexOf('education');
    const expIdx = fresherDoc.sectionOrder.indexOf('experience');
    expect(eduIdx).toBeLessThan(expIdx);

    const profDoc = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE, {}, 'professional');
    const profEduIdx = profDoc.sectionOrder.indexOf('education');
    const profExpIdx = profDoc.sectionOrder.indexOf('experience');
    expect(profExpIdx).toBeLessThan(profEduIdx);

    const skillsDoc = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE, {}, 'skillsFirst');
    const skillsIdx = skillsDoc.sectionOrder.indexOf('skills');
    const projsIdx = skillsDoc.sectionOrder.indexOf('projects');
    expect(skillsIdx).toBeLessThan(projsIdx);
  });

  it('enforces light-touch word budget (≤ 35% words changed) on bullet updates', () => {
    const rawBullet = 'Worked on building the automated testing pipeline using GitHub Actions to improve testing speed.';
    const tailored = tailorBulletLightTouch(rawBullet, ['Automated testing', 'CI/CD']);
    
    // Total word count and budget check
    expect(tailored.budget.withinBudget).toBe(true);
    expect(tailored.budget.percentChanged).toBeLessThanOrEqual(35);
  });

  it('generateDocxBlob creates valid export document without throwing', async () => {
    const doc = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE);
    const blob = await generateDocxBlob(doc);
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(0);
  });
});
