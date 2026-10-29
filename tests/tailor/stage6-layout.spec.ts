import { describe, it, expect } from 'vitest';
import {
  computeResumeLayout,
  renderLayoutToPdfBytes,
  renderPageToSvgString,
  renderLayoutToSvgPages,
  renderLayoutToPlainText,
  renderTreeToMarkdown,
  sanitizeTextForPdf,
  TEMPLATE_SPECS,
  ResumeDocumentTree,
  LayoutSettings,
} from '../../src/lib/resume';
import { RESUME_CONFIG } from '../../src/config/resume';

describe('Stage 6 — Point-Based Layout Engine, Templates & Renderers', () => {
  const sampleTree: ResumeDocumentTree = {
    id: 'doc_stage6_test',
    version: 1,
    candidate: {
      fullName: 'Chloé Lefèvre',
      email: 'chloe.lefevre@example.org',
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      linkedin: 'linkedin.com/in/chloelefevre',
      github: 'github.com/chloelefevre',
    },
    sections: [
      {
        type: 'summary',
        title: 'Professional Summary',
        visible: true,
        summaryText: 'Software Engineer with 4 years experience building distributed microservices in Go and TypeScript.',
        entries: [],
      },
      {
        type: 'experience',
        title: 'Work Experience',
        visible: true,
        entries: [
          {
            id: 'exp_1',
            title: 'Senior Systems Engineer',
            subtitle: 'DataFlow Systems',
            dates: '2022 - Present',
            bullets: [
              {
                factId: 'f_exp_1',
                text: 'Engineered high-throughput event processing pipeline handling 45,000 req/sec with sub-50ms latency.',
                ownershipTier: 4,
              },
              {
                factId: 'f_exp_2',
                text: 'Refactored legacy monolith into Docker containers, reducing CI/CD deployment cycle by 65%.',
                ownershipTier: 3,
              },
            ],
          },
        ],
      },
      {
        type: 'education',
        title: 'Education',
        visible: true,
        entries: [
          {
            id: 'edu_1',
            title: 'B.S. in Computer Science',
            subtitle: 'Sorbonne University',
            dates: '2018 - 2022',
            bullets: [
              {
                factId: 'f_edu_1',
                text: 'Graduated with First Class Honours; focused on distributed algorithms and cryptography.',
                ownershipTier: 3,
              },
            ],
          },
        ],
      },
      {
        type: 'skills',
        title: 'Technical Skills',
        visible: true,
        skillsByCategory: {
          Languages: ['Go', 'TypeScript', 'Python', 'SQL'],
          Platforms: ['Kubernetes', 'Docker', 'AWS', 'GCP'],
        },
        entries: [],
      },
    ],
    updatedAt: '2026-10-28T12:00:00.000Z',
  };

  it('G1: Evaluates exact paper geometry in points (A4 vs Letter)', () => {
    const a4Layout = computeResumeLayout(sampleTree, { paperSize: 'a4', template: 'modern' });
    expect(a4Layout.pages[0].widthPt).toBeCloseTo(RESUME_CONFIG.DIMENSIONS.A4.WIDTH_PT, 2);
    expect(a4Layout.pages[0].heightPt).toBeCloseTo(RESUME_CONFIG.DIMENSIONS.A4.HEIGHT_PT, 2);
    expect(a4Layout.paperSize).toBe('a4');

    const letterLayout = computeResumeLayout(sampleTree, { paperSize: 'letter', template: 'modern' });
    expect(letterLayout.pages[0].widthPt).toBeCloseTo(RESUME_CONFIG.DIMENSIONS.LETTER.WIDTH_PT, 2);
    expect(letterLayout.pages[0].heightPt).toBeCloseTo(RESUME_CONFIG.DIMENSIONS.LETTER.HEIGHT_PT, 2);
    expect(letterLayout.paperSize).toBe('letter');
  });

  it('G2: Enforces typography floor (>= 9.5 pt) across all templates and user overrides', () => {
    // 1. Check all template specifications
    const templateKeys = Object.keys(TEMPLATE_SPECS) as Array<keyof typeof TEMPLATE_SPECS>;
    for (const key of templateKeys) {
      expect(TEMPLATE_SPECS[key].bodyFontSizePt).toBeGreaterThanOrEqual(RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT);
      expect(TEMPLATE_SPECS[key].bodyFontSizePt).toBeGreaterThanOrEqual(9.5);
    }

    // 2. Check layout engine clamps any sub-9.5pt user setting
    const tinyFontSettings: LayoutSettings = {
      template: 'compact',
      paperSize: 'a4',
      fontSizePt: 7.0, // illegal tiny font
    };
    const layout = computeResumeLayout(sampleTree, tinyFontSettings);
    const textBlocks = layout.pages.flatMap((p) => p.blocks).filter((b) => b.type === 'bullet' || b.type === 'text');
    for (const block of textBlocks) {
      expect(block.fontSizePt).toBeGreaterThanOrEqual(RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT);
    }
  });

  it('G3: Pagination parity across renderers: single LayoutDocument feeds PDF and SVG', async () => {
    const layout = computeResumeLayout(sampleTree, { template: 'classic', paperSize: 'a4' });
    expect(layout.totalPageCount).toBeGreaterThanOrEqual(1);

    // Vector PDF generation
    const pdfBytes = await renderLayoutToPdfBytes(layout);
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    // DOM / SVG preview generation
    const svgPages = renderLayoutToSvgPages(layout);
    expect(svgPages.length).toBe(layout.totalPageCount);
    for (const svg of svgPages) {
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain(layout.pages[0].widthPt.toString());
    }

    // ATS plain text export
    const plainText = renderLayoutToPlainText(layout);
    expect(plainText).toContain('Chloe Lefevre');
    expect(plainText).toContain('Senior Systems Engineer');
    expect(plainText).toContain('45,000 req/sec');

    // Markdown export
    const markdown = renderTreeToMarkdown(sampleTree);
    expect(markdown).toContain('# Chloé Lefèvre');
    expect(markdown).toContain('## Work Experience');
  });

  it('G4: All 5 templates (classic, modern, compact, campus, executive) produce valid layouts', () => {
    const templates = ['classic', 'modern', 'compact', 'campus', 'executive'] as const;

    for (const t of templates) {
      const layout = computeResumeLayout(sampleTree, { template: t, paperSize: 'a4' });
      expect(layout.pages.length).toBeGreaterThanOrEqual(1);
      expect(layout.pages[0].blocks.length).toBeGreaterThan(5);
      expect(layout.measuredTotalHeightPt).toBeGreaterThan(100);
      expect(layout.template).toBe(t);
    }
  });

  it('G5: Unicode normalization handles accented Latin and Indic characters without stripping to empty', () => {
    const accented = 'Chloé Lefèvre — Zürich Naïve Noël résumé';
    const sanitizedAccented = sanitizeTextForPdf(accented);
    expect(sanitizedAccented).toContain('Chloe');
    expect(sanitizedAccented).toContain('Lefevre');
    expect(sanitizedAccented).toContain('Zurich');
    expect(sanitizedAccented).not.toContain('?');

    const devanagari = 'नमस्ते दुनिया (Namaste World)';
    const sanitizedIndic = sanitizeTextForPdf(devanagari);
    expect(sanitizedIndic).toContain('Namaste World');
    expect(sanitizedIndic.length).toBeGreaterThan(0);
  });

  it('G6: 100% Deterministic: identical input + asOf yields identical layout and byte outputs', async () => {
    const settings: LayoutSettings = { template: 'campus', paperSize: 'a4' };
    const run1 = computeResumeLayout(sampleTree, settings);
    const run2 = computeResumeLayout(sampleTree, settings);

    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));

    const pdf1 = await renderLayoutToPdfBytes(run1);
    const pdf2 = await renderLayoutToPdfBytes(run2);

    expect(pdf1.length).toBe(pdf2.length);
    // Byte-by-byte check
    let diff = 0;
    for (let i = 0; i < pdf1.length; i++) {
      if (pdf1[i] !== pdf2[i]) diff++;
    }
    expect(diff).toBe(0);
  });
});
