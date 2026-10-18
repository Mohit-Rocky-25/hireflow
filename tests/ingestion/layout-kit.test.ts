import { describe, it, expect } from 'vitest';
import {
  processPageLayout,
  normalizeTextContent,
  assembleLinesFromLayoutItems,
  checkPdfCorruption,
} from '../../src/engine/ingestion/layoutReader';
import { ingestPageItems, ingestRawText } from '../../src/engine/ingestion';
import { LayoutItem } from '../../src/engine/ingestion/types';

describe('R3.10: Document Ingestion Layout Test Kit', () => {
  // 1. Single Column Fidelity Test
  it('reads single column layout with 1.0 reading order fidelity', () => {
    const items: LayoutItem[] = [
      { str: 'Aarav Sharma', x: 50, y: 700, fontSize: 16 },
      { str: 'Software Engineer', x: 50, y: 680, fontSize: 12 },
      { str: 'Education', x: 50, y: 640, fontSize: 14 },
      { str: 'B.Tech Computer Science, IIT Madras', x: 50, y: 620, fontSize: 10 },
      { str: 'Projects', x: 50, y: 580, fontSize: 14 },
      { str: 'Distributed Cache in Go', x: 50, y: 560, fontSize: 10 },
    ];

    const result = processPageLayout(items, 612, 792);
    expect(result.columnsDetected).toBe(1);
    expect(result.lines).toEqual([
      'Aarav Sharma',
      'Software Engineer',
      'Education',
      'B.Tech Computer Science, IIT Madras',
      'Projects',
      'Distributed Cache in Go',
    ]);
  });

  // 2. Two Equal Columns Reading Order Test (Left then Right)
  it('reads two equal columns left-to-right without interleaving lines', () => {
    const items: LayoutItem[] = [
      // Left Column (x ~ 60)
      { str: 'LEFT COLUMN TITLE', x: 60, y: 700, fontSize: 14 },
      { str: 'Left item 1', x: 60, y: 660, fontSize: 10 },
      { str: 'Left item 2', x: 60, y: 620, fontSize: 10 },
      { str: 'Left item 3', x: 60, y: 580, fontSize: 10 },
      { str: 'Left item 4', x: 60, y: 540, fontSize: 10 },
      // Right Column (x ~ 360)
      { str: 'RIGHT COLUMN TITLE', x: 360, y: 700, fontSize: 14 },
      { str: 'Right item 1', x: 360, y: 660, fontSize: 10 },
      { str: 'Right item 2', x: 360, y: 620, fontSize: 10 },
      { str: 'Right item 3', x: 360, y: 580, fontSize: 10 },
      { str: 'Right item 4', x: 360, y: 540, fontSize: 10 },
    ];

    const result = processPageLayout(items, 612, 792);
    expect(result.columnsDetected).toBe(2);
    expect(result.lines[0]).toBe('LEFT COLUMN TITLE');
    expect(result.lines).toContain('Left item 4');
    expect(result.lines).toContain('RIGHT COLUMN TITLE');

    // Assert Left Column appears BEFORE Right Column
    const leftIndex = result.lines.indexOf('Left item 4');
    const rightIndex = result.lines.indexOf('RIGHT COLUMN TITLE');
    expect(leftIndex).toBeLessThan(rightIndex);
  });

  // 3. Narrow Sidebar + Main Content Layout
  it('detects narrow sidebar layout and emits sidebar block distinctly', () => {
    const items: LayoutItem[] = [
      // Narrow Sidebar (x = 50, width = 120 on a 612 pt page)
      { str: 'Skills', x: 50, y: 700, fontSize: 12 },
      { str: 'React, TypeScript', x: 50, y: 660, fontSize: 10 },
      { str: 'Contact', x: 50, y: 600, fontSize: 12 },
      { str: 'aarav@test.com', x: 50, y: 560, fontSize: 10 },
      // Main Body (x = 240, width = 320)
      { str: 'Experience', x: 240, y: 700, fontSize: 14 },
      { str: 'Razorpay - SWE Intern', x: 240, y: 660, fontSize: 11 },
      { str: 'Built webhook processor handling 15k req/s.', x: 240, y: 630, fontSize: 10 },
      { str: 'Optimized DB queries reducing latency by 40%.', x: 240, y: 600, fontSize: 10 },
      { str: 'Projects', x: 240, y: 550, fontSize: 14 },
      { str: 'Event Sourcing Engine', x: 240, y: 520, fontSize: 10 },
    ];

    const result = processPageLayout(items, 612, 792);
    expect(result.isSidebar).toBe(true);
    expect(result.lines).toContain('--- SIDEBAR ---');
    expect(result.lines).toContain('--- MAIN ---');
  });

  // 4. Header & Footer Removal
  it('strips recurring page number headers and footers', () => {
    const items: LayoutItem[] = [
      { str: 'Page 1 of 2', x: 300, y: 780, fontSize: 9 }, // Top header (y > 752)
      { str: 'Candidate Name', x: 50, y: 700, fontSize: 16 },
      { str: 'Summary text', x: 50, y: 650, fontSize: 10 },
      { str: '1', x: 300, y: 20, fontSize: 9 },              // Bottom footer (y < 39)
    ];

    const result = processPageLayout(items, 612, 792);
    expect(result.lines).not.toContain('Page 1 of 2');
    expect(result.lines).not.toContain('1');
    expect(result.lines).toContain('Candidate Name');
  });

  // 5. Ligature & Hyphenation Normalization (R3.1)
  it('normalizes ligatures and end-of-line hyphenation breaks', () => {
    // \uFB01 = fi, \uFB02 = fl, \uFB03 = ffi
    const textWithLigatures = 'The pro\uFB01le re\uFB02ects e\uFB03cient engineering.';
    expect(normalizeTextContent(textWithLigatures)).toBe('The profile reflects efficient engineering.');

    const hyphenated = 'Senior engi-\nneer built the plat-\nform successfully.';
    expect(normalizeTextContent(hyphenated)).toBe('Senior engineer built the platform successfully.');
  });

  // 6. Failure Messages (R3.4)
  it('returns human-friendly error messages on corrupted PDF binary syntax', () => {
    const corruptedText = '%PDF-1.4\n4 0 obj\n<< /Type /Page >>\nstream\nendstream\nendobj';
    const check = checkPdfCorruption(corruptedText);
    expect(check.corrupted).toBe(true);
    expect(check.reason).toBe("We couldn't read this PDF's text. Try exporting again, upload a DOCX, or paste the text.");
  });

  it('detects scanned image PDF (empty text layers)', () => {
    const emptyPages: LayoutItem[][] = [[], []];
    const result = ingestPageItems(emptyPages);
    expect(result.success).toBe(false);
    expect(result.error).toBe("This looks like a scanned image. OCR isn't supported; paste the text or upload a DOCX.");
  });

  // 7. 12 Messy-Paste Fixtures Test (R3.6)
  it('successfully cleans 12 messy-paste formatting anomalies', () => {
    const messyCases = [
      { raw: 'Word\t\twith\tmultiple\ttabs', expected: 'Word with multiple tabs' },
      { raw: '• Bullet item one\n• Bullet item two', expected: '- Bullet item one\n- Bullet item two' },
      { raw: 'Odd bullet › Arrow bullet ► Another', expected: 'Odd bullet - Arrow bullet - Another' },
      { raw: 'Smart ‘quotes’ and “double” quotes', expected: "Smart 'quotes' and \"double\" quotes" },
      { raw: 'Em—dash and en–dash text', expected: 'Em-dash and en-dash text' },
      { raw: 'Zero\u200Bwidth\uFEFFspace\u00ADremoval', expected: 'Zerowidthspaceremoval' },
      { raw: 'Trailing spaces   \n   and indented text', expected: 'Trailing spaces\n and indented text' },
      { raw: 'Line 1\r\n\r\n\r\n\r\nLine 2 with 4 newlines', expected: 'Line 1\n\nLine 2 with 4 newlines' },
      { raw: 'Private bullet \uE001 item', expected: 'Private bullet - item' },
      { raw: 'Mixed \t tabs   and   multiple   spaces', expected: 'Mixed tabs and multiple spaces' },
      { raw: 'Hyphenated break across\r\nlines auto-\r\nmated test', expected: 'Hyphenated break across\nlines automated test' },
      { raw: 'Academic Projects:\n* Distributed Engine', expected: 'Academic Projects:\n- Distributed Engine' },
    ];

    for (const testCase of messyCases) {
      const cleaned = normalizeTextContent(testCase.raw);
      expect(cleaned).toBe(testCase.expected);
    }
  });

  // 8. Ingestion Diagnostics & Preview Verification (R3.9)
  it('produces valid IngestionDiagnostics with section preview', () => {
    const sampleResume = `
Aarav Sharma
aarav@example.com | +919876543210 | github.com/aarav | leetcode.com/u/aarav_dev

Education
B.Tech Computer Science, IIT Madras (2022 - 2026)
CGPA: 8.8/10

Technical Skills
Languages: Python, Go, TypeScript, Java
Frameworks: React, Node.js, Express, Tailwind CSS

Projects
Distributed Rate Limiter
- Built token bucket rate limiter in Go with Redis backend.
    `;

    const result = ingestRawText(sampleResume);
    expect(result.success).toBe(true);
    expect(result.diagnostics.sectionsFound).toContain('Education');
    expect(result.diagnostics.sectionsFound).toContain('Technical Skills');
    expect(result.diagnostics.sectionsFound).toContain('Projects');
    expect(result.diagnostics.entitiesFound.emailsCount).toBe(1);
    expect(result.diagnostics.entitiesFound.hasCgpa).toBe(true);
    expect(result.diagnostics.previewText).toContain('=== [SECTION: EDUCATION] ===');
    expect(result.diagnostics.previewText).toContain('=== [SECTION: TECHNICAL SKILLS] ===');
  });
});
