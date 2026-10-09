import { describe, it, expect } from 'vitest';
import { parseResumeDocModel, findUnresolvedPlaceholders } from '../../lib/tailorEngine/docModel';
import { generateDocxBlob } from '../../lib/tailorEngine/docxExport';
import { SAMPLE_RESUME } from './fixtures/sampleData';
import JSZip from 'jszip';

describe('Stage 4 — Real Resume Preview & Professional Export', () => {

  describe('ResumeDocModel Parser', () => {
    it('accurately parses contact, sections, and bullets from sample resume', () => {
      const model = parseResumeDocModel(SAMPLE_RESUME);

      expect(model.contact.name).toBe('Arjun Mehta');
      expect(model.contact.email).toBe('arjun@example.com');
      expect(model.contact.headline).toBe('Full Stack Developer');

      expect(model.summary).toContain('Software engineer with 3 years');
      
      expect(model.experience.length).toBeGreaterThan(0);
      const exp1 = model.experience[0];
      expect(exp1.role).toBe('Full Stack Engineer');
      expect(exp1.company).toBe('CloudTech Solutions');
      expect(exp1.dates).toBe('2022 - Present');
      expect(exp1.bullets.length).toBe(4);

      expect(model.projects.length).toBeGreaterThan(0);
      const proj1 = model.projects[0];
      expect(proj1.name).toBe('Task Orchestrator');
      expect(proj1.bullets.length).toBe(2);

      expect(model.skills.length).toBeGreaterThan(5);
      expect(model.skills).toContain('React');
      expect(model.skills).toContain('PostgreSQL');
    });

    it('overlays accepted replacements and marks bullets as modified', () => {
      const origBullet = '- Responsible for developing modular React and TypeScript frontends serving 60,000 active users.';
      const replacement = '- Developed modular React and TypeScript frontends serving 60,000 active users.';

      const model = parseResumeDocModel(SAMPLE_RESUME, {
        [origBullet]: replacement
      });

      const exp1 = model.experience[0];
      const modifiedBullet = exp1.bullets.find(b => b.isModified);
      expect(modifiedBullet).toBeDefined();
      expect(modifiedBullet?.text).toBe('Developed modular React and TypeScript frontends serving 60,000 active users.');
      expect(modifiedBullet?.isModified).toBe(true);
    });
  });

  describe('Export Truth Gate & Placeholder Detection', () => {
    it('detects bracketed placeholders that require user input', () => {
      const textWithPlaceholder = 'Optimized queries resulting in [How many users/What %? ____]';
      const placeholders = findUnresolvedPlaceholders(textWithPlaceholder);
      expect(placeholders).toEqual(['[How many users/What %? ____]']);
    });

    it('returns empty array when text is clean', () => {
      const clean = 'Optimized queries, reducing latency by 45%.';
      const placeholders = findUnresolvedPlaceholders(clean);
      expect(placeholders.length).toBe(0);
    });
  });

  describe('DOCX Export Generation', () => {
    it('generates a valid DOCX file containing resume text and XML structure', async () => {
      const model = parseResumeDocModel(SAMPLE_RESUME);
      const blob = await generateDocxBlob(model);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(1500);

      // Verify internal zip structure using JSZip
      const arrayBuffer = await blob.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Must contain document.xml
      const docXmlFile = zip.file('word/document.xml');
      expect(docXmlFile).not.toBeNull();

      if (docXmlFile) {
        const xmlContent = await docXmlFile.async('text');
        expect(xmlContent).toContain('Arjun Mehta');
        expect(xmlContent).toContain('CloudTech Solutions');
        expect(xmlContent).toContain('PostgreSQL');
      }
    });
  });

});
