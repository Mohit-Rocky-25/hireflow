import { describe, it, expect } from 'vitest';
import { normalizeRawText } from '../../lib/tailorEngine/layoutExtractor';
import { parseResumeOverview } from '../../lib/tailorEngine/parser';

describe('Stage 2 — Layout-Aware Text Extraction & Normalization', () => {

  describe('normalizeRawText', () => {
    it('cleans zero-width characters and normalizes decorative bullets', () => {
      const dirty = '\u200B• Developed web application\uFEFF● Reduced query latency';
      const clean = normalizeRawText(dirty);

      expect(clean).not.toContain('\u200B');
      expect(clean).not.toContain('\uFEFF');
      expect(clean).toContain('- Developed web application');
      expect(clean).toContain('- Reduced query latency');
    });

    it('joins words split by line-break hyphenation', () => {
      const hyphenated = 'Responsible for develop-\ning high-throughput pipelines.';
      const clean = normalizeRawText(hyphenated);

      expect(clean).toContain('developing');
      expect(clean).not.toContain('develop- ing');
    });

    it('collapses excessive linebreaks while preserving paragraph structure', () => {
      const excessive = 'Experience\n\n\n\n\nSoftware Engineer\n\n\nProjects';
      const clean = normalizeRawText(excessive);

      expect(clean).not.toContain('\n\n\n');
      expect(clean).toContain('Experience\n\nSoftware Engineer\n\nProjects');
    });
  });

  describe('Status chip honesty for flattened / un-sectioned text', () => {
    it('detects 0 sections on run-on un-punctuated text', () => {
      const flat = 'ALEX KUMAR FULL STACK DEVELOPER 9000000000 alex.kumar@example.com Career Objective Highly motivated ECE student';
      const overview = parseResumeOverview(flat);

      // Raw un-segmented string has no standard uppercase section headers on separate lines
      expect(overview.sections.length).toBeLessThan(2);
    });

    it('detects multiple sections when properly segmented', () => {
      const structured = `Arjun Mehta | Developer
EXPERIENCE:
Full Stack Engineer | CloudTech
- Built Node.js microservices.

SKILLS:
React, TypeScript, Node.js`;

      const overview = parseResumeOverview(structured);
      expect(overview.sections.length).toBeGreaterThanOrEqual(2);
    });
  });

});
