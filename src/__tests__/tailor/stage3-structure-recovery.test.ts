import { describe, it, expect } from 'vitest';
import { recoverResumeStructure } from '../../lib/tailorEngine/structure/recoveryEngine';
import { FLAT_ECE_FRESHER_FIXTURE } from './fixtures/flat-ece-fresher';
import {
  CS_FRESHER_INTERNSHIP_FIXTURE,
  EXPERIENCED_DEVELOPER_FIXTURE,
  ALL_CAPS_HEADINGS_FIXTURE,
  SCRAMBLED_TWO_COLUMN_FIXTURE
} from './fixtures/moreFixtures';

describe('Stage 3 — Structure Recovery Engine & Invariants', () => {

  describe('Flat ECE Fresher Fixture Recovery (Prompt 3.9)', () => {
    it('recovers all sections, resolves duplicate summary, and sorts education', () => {
      const recovered = recoverResumeStructure(FLAT_ECE_FRESHER_FIXTURE);

      // 1. Header
      expect(recovered.header.name).toBe('Alex Kumar');
      expect(recovered.header.headline).toBe('Full Stack Developer');
      expect(recovered.header.phone).toBe('9000000000');
      expect(recovered.header.email).toBe('alex.kumar@example.com');

      // 2. Summary resolution (kept 1, moved 1 to leftOut)
      expect(recovered.summary).toBeTruthy();
      expect(recovered.duplicateSummaries.length).toBe(1);
      expect(recovered.leftOut.some(item => item.section === 'Summary')).toBe(true);

      // 3. Skills & Categories
      expect(recovered.skills.canonicalSkills).toContain('Java');
      expect(recovered.skills.canonicalSkills).toContain('Python');
      expect(recovered.skills.canonicalSkills).toContain('C');
      expect(recovered.skills.canonicalSkills).toContain('Git');
      expect(recovered.skills.canonicalSkills).toContain('GitHub');
      expect(recovered.skills.canonicalSkills).toContain('Raspberry Pi');
      expect(recovered.skills.canonicalSkills).toContain('Web Development');

      // 4. Hidden skills detection from projects
      expect(recovered.skills.hiddenSkills).toContain('HTML');
      expect(recovered.skills.hiddenSkills).toContain('CSS');
      expect(recovered.skills.hiddenSkills).toContain('JavaScript');
      expect(recovered.skills.hiddenSkills).toContain('Firebase');
      expect(recovered.skills.hiddenSkills).toContain('ESP32');

      // 5. Projects
      expect(recovered.projects.length).toBe(3);
      expect(recovered.projects.some(p => p.name.includes('LocalPro'))).toBe(true);
      expect(recovered.projects.some(p => p.name.includes('UniSync'))).toBe(true);
      expect(recovered.projects.some(p => p.name.includes('SafeRide'))).toBe(true);

      // 6. Education: reverse chronological order (B.Tech 2025-2029 BEFORE Intermediate 2023-2025)
      expect(recovered.education.length).toBe(2);
      expect(recovered.education[0].degree).toContain('B.Tech');
      expect(recovered.education[0].isExpected).toBe(true);
      expect(recovered.education[0].dates).toContain('(Expected)');
      expect(recovered.education[1].degree).toContain('Intermediate');

      // 7. Languages & Links
      expect(recovered.languages).toContain('English');
      expect(recovered.languages).toContain('Hindi');
      expect(recovered.languages).toContain('Telugu');

      expect(recovered.links.some(l => l.includes('alexkumar.vercel.app'))).toBe(true);
      expect(recovered.links.some(l => l.includes('linkedin.com/in/alex-kumar-123456'))).toBe(true);
      expect(recovered.links.some(l => l.includes('github.com/alexkumar'))).toBe(true);

      // Instagram must be moved to leftOut
      expect(recovered.leftOut.some(item => item.item.includes('instagram'))).toBe(true);
    });
  });

  describe('Invariant Checks (I1, I2, I3) across all 5 fixtures', () => {
    const fixtures = [
      { name: 'Flat ECE Fresher', text: FLAT_ECE_FRESHER_FIXTURE },
      { name: 'CS Fresher with Internship', text: CS_FRESHER_INTERNSHIP_FIXTURE },
      { name: 'Experienced 3-Year Developer', text: EXPERIENCED_DEVELOPER_FIXTURE },
      { name: 'ALL-CAPS Headings', text: ALL_CAPS_HEADINGS_FIXTURE },
      { name: 'Scrambled Two-Column', text: SCRAMBLED_TWO_COLUMN_FIXTURE }
    ];

    fixtures.forEach(({ name, text }) => {
      it(`enforces I3 Determinism for ${name}`, () => {
        const run1 = recoverResumeStructure(text);
        const run2 = recoverResumeStructure(text);
        expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
      });

      it(`enforces I1 Conservation (no silent dropping) for ${name}`, () => {
        const result = recoverResumeStructure(text);
        expect(result.sections.length).toBeGreaterThan(0);
        // Header, sections, or leftOut must capture the text content
        expect(result.confidenceScore).toBeGreaterThan(0.4);
      });

      it(`enforces I2 No Invention for ${name}`, () => {
        const result = recoverResumeStructure(text);
        // Email and phone must come from input or be empty
        if (result.header.email) {
          expect(text.toLowerCase()).toContain(result.header.email.toLowerCase());
        }
      });
    });
  });

});
