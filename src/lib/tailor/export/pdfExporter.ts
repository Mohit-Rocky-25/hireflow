// ============================================================
// HIREFLOW PDF & MULTI-FORMAT RESUME EXPORTER
// Client-side pixel-perfect vector PDF generation using pdf-lib,
// clean ATS plain text, Markdown, and structured JSON export
// ============================================================

import { PDFDocument, StandardFonts, rgb, RGB } from 'pdf-lib';
import { TailoredResume, CandidateProfile, TailoredSection } from '../types';

/**
 * Triggers browser print dialog styled specifically for ATS resume printing
 */
export function triggerPrintToPdf(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

/**
 * Wraps text into lines that fit within maxWidth given a specific font and size
 */
function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  if (!text) return [];
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Strips non-standard characters from text to prevent PDF encoding failures with Standard 14 fonts
 */
function sanitizeForPdf(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u25E6\u2023]/g, '*')
    .replace(/[^\x00-\x7F]/g, ' ');
}

/**
 * Generates an authentic vector PDF binary (Uint8Array) directly in the browser using pdf-lib.
 * Matches the layout, typography, and density metrics of DarkPaperPreview.
 */
export async function generatePdfResume(
  resume: TailoredResume,
  candidate: CandidateProfile
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Document Metadata
  pdfDoc.setTitle(`${candidate.fullName || 'Candidate'} - Resume`);
  pdfDoc.setAuthor(candidate.fullName || 'Candidate');
  pdfDoc.setSubject('Professional ATS Tailored Resume');
  pdfDoc.setProducer('HireFlow ATS Vector Engine');
  pdfDoc.setCreator('HireFlow');

  // Embed standard typography
  const isClassic = resume.layoutSettings?.template === 'classic';
  const regularFont = await pdfDoc.embedStandardFont(
    isClassic ? StandardFonts.TimesRoman : StandardFonts.Helvetica
  );
  const boldFont = await pdfDoc.embedStandardFont(
    isClassic ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold
  );
  const italicFont = await pdfDoc.embedStandardFont(
    isClassic ? StandardFonts.TimesRomanItalic : StandardFonts.HelveticaOblique
  );

  // Layout Dimensions & Metrics
  const isLetter = resume.layoutSettings?.paperSize !== 'a4';
  const pageWidth = isLetter ? 612 : 595.28;
  const pageHeight = isLetter ? 792 : 841.89;

  const marginsSetting = resume.layoutSettings?.margins || 'standard';
  const margin = marginsSetting === 'tight' ? 36 : marginsSetting === 'relaxed' ? 50 : 42;
  const contentWidth = pageWidth - 2 * margin;

  // Font size tokens
  const fontSizeSetting = resume.layoutSettings?.fontSize || 'standard';
  const bodySize = fontSizeSetting === 'compact' ? 8.5 : fontSizeSetting === 'spacious' ? 9.5 : 9.0;
  const lineSpacing = bodySize * 1.35;
  const headingSize = bodySize + 1.5;
  const nameSize = bodySize + 8;

  // Harmonious Palette
  const colorPrimary: RGB = rgb(0.06, 0.09, 0.16); // Slate 950
  const colorSubheading: RGB = rgb(0.12, 0.16, 0.24); // Slate 900
  const colorBody: RGB = rgb(0.18, 0.23, 0.32); // Slate 800
  const colorMuted: RGB = rgb(0.40, 0.46, 0.54); // Slate 600
  const colorRule: RGB = rgb(0.80, 0.83, 0.88); // Slate 300

  // Start with page 1
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ensureSpace = (neededHeight: number) => {
    if (y - neededHeight < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  // 1. CANDIDATE HEADER
  const fullName = sanitizeForPdf(candidate.fullName || 'Candidate Name').toUpperCase();
  ensureSpace(40);
  currentPage.drawText(fullName, {
    x: margin,
    y: y - nameSize,
    size: nameSize,
    font: boldFont,
    color: colorPrimary,
  });
  y -= nameSize + 6;

  // Contact Details
  const contactItems: string[] = [];
  if (candidate.contact?.location) contactItems.push(candidate.contact.location);
  if (candidate.contact?.phone) contactItems.push(candidate.contact.phone);
  if (candidate.contact?.email) contactItems.push(candidate.contact.email);
  if (candidate.contact?.linkedin) contactItems.push(candidate.contact.linkedin.replace(/^https?:\/\//, ''));
  if (candidate.contact?.github) contactItems.push(candidate.contact.github.replace(/^https?:\/\//, ''));

  if (contactItems.length > 0) {
    const contactLine = sanitizeForPdf(contactItems.join('  |  '));
    const wrappedContact = wrapText(contactLine, contentWidth, regularFont, bodySize - 0.5);
    for (const cline of wrappedContact) {
      ensureSpace(lineSpacing);
      currentPage.drawText(cline, {
        x: margin,
        y: y - (bodySize - 0.5),
        size: bodySize - 0.5,
        font: regularFont,
        color: colorMuted,
      });
      y -= lineSpacing;
    }
  }

  // Header separator rule
  y -= 4;
  currentPage.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: colorRule,
  });
  y -= 12;

  // 2. SECTIONS
  for (const section of resume.sections) {
    if (!section.visible) continue;

    ensureSpace(30);

    // Section Title
    const sectionTitle = sanitizeForPdf(section.title).toUpperCase();
    currentPage.drawText(sectionTitle, {
      x: margin,
      y: y - headingSize,
      size: headingSize,
      font: boldFont,
      color: colorSubheading,
    });
    y -= headingSize + 3;

    // Thin underline for section
    currentPage.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.75,
      color: colorRule,
    });
    y -= 8;

    // Summary Text
    if (section.content.summaryText) {
      const summary = sanitizeForPdf(section.content.summaryText);
      const lines = wrapText(summary, contentWidth, regularFont, bodySize);
      for (const line of lines) {
        ensureSpace(lineSpacing);
        currentPage.drawText(line, {
          x: margin,
          y: y - bodySize,
          size: bodySize,
          font: regularFont,
          color: colorBody,
        });
        y -= lineSpacing;
      }
      y -= 6;
    }

    // Skills By Category
    if (section.content.skillsByCategory) {
      for (const [rawCategory, rawSkills] of Object.entries(section.content.skillsByCategory)) {
        const skills = (rawSkills as string[]) || [];
        if (skills.length === 0) continue;

        const category = sanitizeForPdf(rawCategory);
        const skillsString = sanitizeForPdf(skills.join(', '));
        const fullSkillText = `${category}: ${skillsString}`;

        const lines = wrapText(fullSkillText, contentWidth, regularFont, bodySize);
        for (let i = 0; i < lines.length; i++) {
          ensureSpace(lineSpacing);
          const line = lines[i];

          if (i === 0 && line.startsWith(`${category}:`)) {
            const prefix = `${category}: `;
            const rest = line.substring(prefix.length);
            const prefixWidth = boldFont.widthOfTextAtSize(prefix, bodySize);

            currentPage.drawText(prefix, {
              x: margin,
              y: y - bodySize,
              size: bodySize,
              font: boldFont,
              color: colorPrimary,
            });
            currentPage.drawText(rest, {
              x: margin + prefixWidth,
              y: y - bodySize,
              size: bodySize,
              font: regularFont,
              color: colorBody,
            });
          } else {
            currentPage.drawText(line, {
              x: margin,
              y: y - bodySize,
              size: bodySize,
              font: regularFont,
              color: colorBody,
            });
          }
          y -= lineSpacing;
        }
      }
      y -= 6;
    }

    // Entries (Experience, Education, Projects)
    if (section.content.entries && section.content.entries.length > 0) {
      for (const entry of section.content.entries) {
        ensureSpace(24);

        const primaryTitle = sanitizeForPdf(entry.primaryTitle);
        const secondaryTitle = entry.secondaryTitle ? sanitizeForPdf(entry.secondaryTitle) : '';
        const dateRange = entry.dateRange ? sanitizeForPdf(entry.dateRange) : '';

        // Draw primary & secondary title on left
        const primaryWidth = boldFont.widthOfTextAtSize(primaryTitle, bodySize);
        currentPage.drawText(primaryTitle, {
          x: margin,
          y: y - bodySize,
          size: bodySize,
          font: boldFont,
          color: colorPrimary,
        });

        if (secondaryTitle) {
          const separator = ' - ';
          const sepWidth = regularFont.widthOfTextAtSize(separator, bodySize);
          currentPage.drawText(separator, {
            x: margin + primaryWidth,
            y: y - bodySize,
            size: bodySize,
            font: regularFont,
            color: colorMuted,
          });
          currentPage.drawText(secondaryTitle, {
            x: margin + primaryWidth + sepWidth,
            y: y - bodySize,
            size: bodySize,
            font: italicFont,
            color: colorSubheading,
          });
        }

        // Draw Date Range aligned to the right
        if (dateRange) {
          const dateWidth = boldFont.widthOfTextAtSize(dateRange, bodySize - 0.5);
          currentPage.drawText(dateRange, {
            x: pageWidth - margin - dateWidth,
            y: y - bodySize,
            size: bodySize - 0.5,
            font: boldFont,
            color: colorMuted,
          });
        }
        y -= lineSpacing;

        // Bullets
        if (entry.bullets && entry.bullets.length > 0) {
          for (const bullet of entry.bullets) {
            const bulletText = sanitizeForPdf(bullet.text);
            const bulletIndent = 12;
            const bulletLines = wrapText(bulletText, contentWidth - bulletIndent, regularFont, bodySize);

            for (let bIdx = 0; bIdx < bulletLines.length; bIdx++) {
              ensureSpace(lineSpacing);
              const bLine = bulletLines[bIdx];

              if (bIdx === 0) {
                // Bullet dot
                currentPage.drawCircle({
                  x: margin + 4,
                  y: y - bodySize + 3,
                  size: 1.5,
                  color: colorSubheading,
                });
              }

              currentPage.drawText(bLine, {
                x: margin + bulletIndent,
                y: y - bodySize,
                size: bodySize,
                font: regularFont,
                color: colorBody,
              });
              y -= lineSpacing;
            }
          }
        }
        y -= 4; // Gap between entries
      }
      y -= 4; // Gap after entries
    }
  }

  return await pdfDoc.save();
}

/**
 * Directly downloads the resume as a crisp vector PDF file generated in-memory via pdf-lib
 */
export async function downloadResumeAsPdf(
  resume: TailoredResume,
  candidate: CandidateProfile,
  fileName?: string
): Promise<void> {
  const pdfBytes = await generatePdfResume(resume, candidate);
  const name = fileName || `${candidate.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`;

  if (typeof window !== 'undefined') {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Generates an ATS-compliant clean plain text representation
 */
export function generatePlainTextResume(
  resume: TailoredResume,
  candidate: CandidateProfile
): string {
  const lines: string[] = [];

  // Header
  lines.push((candidate.fullName || 'Candidate').toUpperCase());
  const contactParts: string[] = [];
  if (candidate.contact?.email) contactParts.push(candidate.contact.email);
  if (candidate.contact?.phone) contactParts.push(candidate.contact.phone);
  if (candidate.contact?.location) contactParts.push(candidate.contact.location);
  if (candidate.contact?.linkedin) contactParts.push(candidate.contact.linkedin);
  if (candidate.contact?.github) contactParts.push(candidate.contact.github);
  lines.push(contactParts.join(' | '));
  lines.push('--------------------------------------------------\n');

  // Sections
  for (const section of resume.sections) {
    if (!section.visible) continue;

    lines.push(section.title.toUpperCase());
    lines.push('==================================================');

    if (section.content.summaryText) {
      lines.push(section.content.summaryText);
      lines.push('');
    }

    if (section.content.skillsByCategory) {
      for (const [cat, skills] of Object.entries(section.content.skillsByCategory)) {
        if (skills && skills.length > 0) {
          lines.push(`${cat}: ${skills.join(', ')}`);
        }
      }
      lines.push('');
    }

    if (section.content.entries) {
      for (const entry of section.content.entries) {
        lines.push(`${entry.primaryTitle}${entry.secondaryTitle ? ` - ${entry.secondaryTitle}` : ''}${entry.dateRange ? ` (${entry.dateRange})` : ''}`);
        if (entry.location) lines.push(entry.location);
        if (entry.bullets) {
          for (const b of entry.bullets) {
            lines.push(`* ${b.text}`);
          }
        }
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Downloads resume as .txt file
 */
export function downloadResumeAsTxt(
  resume: TailoredResume,
  candidate: CandidateProfile,
  fileName?: string
): void {
  const text = generatePlainTextResume(resume, candidate);
  const name = fileName || `${candidate.fullName?.replace(/\s+/g, '_') || 'Resume'}.txt`;

  if (typeof window !== 'undefined') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Generates clean Markdown formatted resume
 */
export function generateMarkdownResume(
  resume: TailoredResume,
  candidate: CandidateProfile
): string {
  const lines: string[] = [];
  lines.push(`# ${candidate.fullName || 'Candidate'}`);
  const contactParts: string[] = [];
  if (candidate.contact?.email) contactParts.push(`**Email:** ${candidate.contact.email}`);
  if (candidate.contact?.phone) contactParts.push(`**Phone:** ${candidate.contact.phone}`);
  if (candidate.contact?.location) contactParts.push(`**Location:** ${candidate.contact.location}`);
  if (candidate.contact?.linkedin) contactParts.push(`**LinkedIn:** [Profile](${candidate.contact.linkedin})`);
  if (candidate.contact?.github) contactParts.push(`**GitHub:** [Profile](${candidate.contact.github})`);
  lines.push(contactParts.join(' | '));
  lines.push('\n---\n');

  for (const section of resume.sections) {
    if (!section.visible) continue;
    lines.push(`## ${section.title}`);
    if (section.content.summaryText) {
      lines.push(`${section.content.summaryText}\n`);
    }
    if (section.content.skillsByCategory) {
      for (const [cat, skills] of Object.entries(section.content.skillsByCategory)) {
        if (skills && skills.length > 0) {
          lines.push(`- **${cat}:** ${skills.join(', ')}`);
        }
      }
      lines.push('');
    }
    if (section.content.entries) {
      for (const entry of section.content.entries) {
        lines.push(`### ${entry.primaryTitle}${entry.secondaryTitle ? ` — *${entry.secondaryTitle}*` : ''}${entry.dateRange ? ` (${entry.dateRange})` : ''}`);
        if (entry.location) lines.push(`*${entry.location}*`);
        if (entry.bullets) {
          for (const b of entry.bullets) {
            lines.push(`- ${b.text}`);
          }
        }
        lines.push('');
      }
    }
  }
  return lines.join('\n');
}

/**
 * Downloads resume as .md Markdown file
 */
export function downloadResumeAsMarkdown(
  resume: TailoredResume,
  candidate: CandidateProfile,
  fileName?: string
): void {
  const md = generateMarkdownResume(resume, candidate);
  const name = fileName || `${candidate.fullName?.replace(/\s+/g, '_') || 'Resume'}.md`;
  if (typeof window !== 'undefined') {
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Downloads full resume data as .json structured file
 */
export function downloadResumeAsJson(
  resume: TailoredResume,
  candidate: CandidateProfile,
  fileName?: string
): void {
  const data = JSON.stringify({ candidate, tailoredResume: resume }, null, 2);
  const name = fileName || `${candidate.fullName?.replace(/\s+/g, '_') || 'Resume'}.json`;
  if (typeof window !== 'undefined') {
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
