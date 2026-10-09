import { describe, it, expect } from 'vitest';
import { parseResumeDocModel } from '../../lib/tailorEngine/docModel';
import { generateDocxBlob } from '../../lib/tailorEngine/docxExport';
import { FLAT_ECE_FRESHER_FIXTURE } from './fixtures/flat-ece-fresher';
import { SAMPLE_RESUME } from './fixtures/sampleData';
import JSZip from 'jszip';

describe('Stage 4 — Professional Composer & Page Renderer', () => {

  describe('Single Source ResumeDocModel & Preset Selection', () => {
    it('accurately parses flat ECE fresher resume and selects Fresher preset', () => {
      const model = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE);

      // Contact
      expect(model.contact.name).toBe('Alex Kumar');
      expect(model.contact.headline).toBe('Full Stack Developer');
      expect(model.contact.phone).toBe('9000000000');
      expect(model.contact.email).toBe('alex.kumar@example.com');

      // Auto-selected preset
      expect(model.preset).toBe('fresher');
      expect(model.sectionOrder[1]).toBe('education');
      expect(model.sectionOrder.indexOf('education')).toBeLessThan(model.sectionOrder.indexOf('projects'));

      // Education & Projects
      expect(model.education.length).toBe(2);
      expect(model.projects.length).toBe(3);

      // Categorized skills
      expect(model.skillCategories).toBeDefined();
      expect(model.skillCategories?.length).toBeGreaterThan(0);
      const progLanguages = model.skillCategories?.find(c => c.category === 'Programming Languages');
      expect(progLanguages?.skills).toContain('Java');

      // Hidden skills detected from projects
      expect(model.hiddenSkills).toContain('HTML');
      expect(model.hiddenSkills).toContain('Firebase');
    });

    it('respects manual preset override to professional or skillsFirst', () => {
      const fresherModel = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE, {}, 'professional');
      expect(fresherModel.preset).toBe('professional');
      expect(fresherModel.sectionOrder.indexOf('experience')).toBeLessThan(fresherModel.sectionOrder.indexOf('education'));

      const skillsFirstModel = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE, {}, 'skillsFirst');
      expect(skillsFirstModel.preset).toBe('skillsFirst');
      expect(skillsFirstModel.sectionOrder.indexOf('skills')).toBe(1);
    });

    it('defaults experienced developer resume to professional preset', () => {
      const model = parseResumeDocModel(SAMPLE_RESUME);
      expect(model.preset).toBe('professional');
      expect(model.sectionOrder.indexOf('experience')).toBeLessThan(model.sectionOrder.indexOf('education'));
    });
  });

  describe('Render Cleanliness Rules (No literal dashes, max 60 words per bullet)', () => {
    it('ensures bullets never contain leading literal dashes or bullet glyphs', () => {
      const model = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE);

      model.projects.forEach(p => {
        p.bullets.forEach(b => {
          expect(b.text.startsWith('-')).toBe(false);
          expect(b.text.startsWith('•')).toBe(false);
          expect(b.text.startsWith('*')).toBe(false);
        });
      });
    });

    it('ensures all project and experience bullets stay under 60 words', () => {
      const model = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE);

      model.projects.forEach(p => {
        p.bullets.forEach(b => {
          const wordCount = b.text.split(/\s+/).length;
          expect(wordCount).toBeLessThanOrEqual(60);
        });
      });
    });
  });

  describe('DOCX Export with Preset Ordering & XML Verification', () => {
    it('generates a valid DOCX with education preceding projects for fresher preset', async () => {
      const model = parseResumeDocModel(FLAT_ECE_FRESHER_FIXTURE);
      const blob = await generateDocxBlob(model);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(1500);

      const arrayBuffer = await blob.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')?.async('text');

      expect(docXml).toBeDefined();
      if (docXml) {
        expect(docXml).toContain('Alex Kumar');
        expect(docXml).toContain('LocalPro');

        // Verify Education appears before Projects in the XML
        const eduIndex = docXml.indexOf('EDUCATION');
        const projIndex = docXml.indexOf('PROJECTS');
        expect(eduIndex).toBeGreaterThan(-1);
        expect(projIndex).toBeGreaterThan(-1);
        expect(eduIndex).toBeLessThan(projIndex);
      }
    });
  });

});
