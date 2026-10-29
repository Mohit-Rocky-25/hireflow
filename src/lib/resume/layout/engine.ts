// ============================================================
// HIREFLOW POINT-BASED LAYOUT ENGINE (STAGE 6)
// P5: One layout engine (units: points).
// Computes deterministic geometric LayoutDocument with exact point coordinates (x, y, w, h).
// Feeds PDF, DOM preview, and plain text renderers with identical pagination (I-05, I-07).
// ============================================================

import { ResumeDocumentTree, LayoutSettings } from '../types';
import { LayoutDocument, LayoutPage, LayoutBlock } from './types';
import { TEMPLATE_SPECS, TemplateStyleSpec } from './templates';
import { RESUME_CONFIG } from '../../../config/resume';
import { sanitizeTextForPdf } from './unicode';

/**
 * Estimates line width in points for standard fonts deterministically.
 */
function estimateTextWidthPt(text: string, fontSizePt: number, font: 'Helvetica' | 'Times-Roman' | 'Courier'): number {
  const avgCharWidthRatio = font === 'Courier' ? 0.6 : font === 'Times-Roman' ? 0.48 : 0.52;
  return text.length * fontSizePt * avgCharWidthRatio;
}

/**
 * Wraps text into lines that fit within a maximum width in points.
 */
function wrapTextToWidth(text: string, maxWidthPt: number, fontSizePt: number, font: 'Helvetica' | 'Times-Roman' | 'Courier'): string[] {
  if (!text) return [];
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const width = estimateTextWidthPt(candidate, fontSizePt, font);
    if (width <= maxWidthPt) {
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

export function computeResumeLayout(
  documentTree: ResumeDocumentTree,
  settings: LayoutSettings
): LayoutDocument {
  const paperSize = settings.paperSize || 'a4';
  const templateId = settings.template || 'modern';
  const spec: TemplateStyleSpec = TEMPLATE_SPECS[templateId] || TEMPLATE_SPECS.modern;

  // Paper dimensions in points
  const pageWidthPt = paperSize === 'a4'
    ? RESUME_CONFIG.DIMENSIONS.A4.WIDTH_PT
    : RESUME_CONFIG.DIMENSIONS.LETTER.WIDTH_PT;

  const pageHeightPt = paperSize === 'a4'
    ? RESUME_CONFIG.DIMENSIONS.A4.HEIGHT_PT
    : RESUME_CONFIG.DIMENSIONS.LETTER.HEIGHT_PT;

  const margins = {
    top: settings.marginsPt?.top || spec.defaultMarginsPt.top,
    bottom: settings.marginsPt?.bottom || spec.defaultMarginsPt.bottom,
    left: settings.marginsPt?.left || spec.defaultMarginsPt.left,
    right: settings.marginsPt?.right || spec.defaultMarginsPt.right,
  };

  const usableWidthPt = pageWidthPt - margins.left - margins.right;
  const usableHeightPt = pageHeightPt - margins.top - margins.bottom;

  // Enforce typography floor (9.5 pt minimum)
  const bodyFontSizePt = Math.max(RESUME_CONFIG.TYPOGRAPHY.MIN_FONT_SIZE_PT, settings.fontSizePt || spec.bodyFontSizePt);
  const bodyLineHeightPt = bodyFontSizePt * spec.lineHeightRatio;

  const pages: LayoutPage[] = [];
  let currentPageNumber = 1;
  let currentBlocks: LayoutBlock[] = [];
  let currentY = margins.top;

  const startNewPage = () => {
    pages.push({
      pageNumber: currentPageNumber,
      widthPt: pageWidthPt,
      heightPt: pageHeightPt,
      marginsPt: margins,
      usableWidthPt,
      usableHeightPt,
      blocks: [...currentBlocks],
    });
    currentPageNumber++;
    currentBlocks = [];
    currentY = margins.top;
  };

  const checkPageOverflow = (neededHeightPt: number) => {
    if (currentY + neededHeightPt > pageHeightPt - margins.bottom) {
      startNewPage();
    }
  };

  // -------------------------------------------------------------
  // 1. Header (Name, Headline, Contact)
  // -------------------------------------------------------------
  const candidateName = sanitizeTextForPdf(documentTree.candidate.fullName || 'Candidate');
  const nameHeight = spec.titleFontSizePt * 1.2;
  checkPageOverflow(nameHeight);

  currentBlocks.push({
    id: 'block_header_name',
    type: 'header-name',
    x: spec.isCenteredHeader ? margins.left : margins.left,
    y: currentY,
    width: usableWidthPt,
    height: nameHeight,
    text: candidateName,
    fontSizePt: spec.titleFontSizePt,
    lineHeightPt: nameHeight,
    fontFamily: spec.headingFontFamily,
    isBold: true,
    colorHex: spec.accentColorHex,
  });
  currentY += nameHeight + 4;

  // Contact line
  const contactParts: string[] = [];
  if (documentTree.candidate.email) contactParts.push(documentTree.candidate.email);
  if (documentTree.candidate.phone) contactParts.push(documentTree.candidate.phone);
  if (documentTree.candidate.location) contactParts.push(documentTree.candidate.location);
  if (documentTree.candidate.linkedin) contactParts.push(documentTree.candidate.linkedin);
  if (documentTree.candidate.github) contactParts.push(documentTree.candidate.github);

  const contactText = sanitizeTextForPdf(contactParts.join(' | '));
  if (contactText) {
    const contactLines = wrapTextToWidth(contactText, usableWidthPt, spec.entryFontSizePt, spec.fontFamily);
    const contactHeight = contactLines.length * (spec.entryFontSizePt * 1.3);
    checkPageOverflow(contactHeight);

    for (let i = 0; i < contactLines.length; i++) {
      currentBlocks.push({
        id: `block_header_contact_${i}`,
        type: 'header-contact',
        x: margins.left,
        y: currentY,
        width: usableWidthPt,
        height: spec.entryFontSizePt * 1.3,
        text: contactLines[i],
        fontSizePt: spec.entryFontSizePt,
        lineHeightPt: spec.entryFontSizePt * 1.3,
        fontFamily: spec.fontFamily,
        colorHex: '#4b5563',
      });
      currentY += spec.entryFontSizePt * 1.3;
    }
  }

  currentY += 10; // Spacing after header

  // -------------------------------------------------------------
  // 2. Sections
  // -------------------------------------------------------------
  for (const section of documentTree.sections) {
    if (!section.visible) continue;

    const sectionTitle = sanitizeTextForPdf(section.title.toUpperCase());
    const headingHeight = spec.headingFontSizePt * 1.3;
    checkPageOverflow(headingHeight + 12);

    currentBlocks.push({
      id: `block_sec_${section.type}_title`,
      type: 'section-heading',
      x: margins.left,
      y: currentY,
      width: usableWidthPt,
      height: headingHeight,
      text: sectionTitle,
      fontSizePt: spec.headingFontSizePt,
      lineHeightPt: headingHeight,
      fontFamily: spec.headingFontFamily,
      isBold: true,
      colorHex: spec.accentColorHex,
      sectionType: section.type,
    });
    currentY += headingHeight + 2;

    if (spec.hasSectionRule) {
      currentBlocks.push({
        id: `block_sec_${section.type}_rule`,
        type: 'section-rule',
        x: margins.left,
        y: currentY,
        width: usableWidthPt,
        height: 1.0,
        fontSizePt: 0,
        lineHeightPt: 1.0,
        fontFamily: spec.fontFamily,
        colorHex: '#d1d5db',
        sectionType: section.type,
      });
      currentY += 6;
    }

    // Summary Text
    if (section.summaryText) {
      const summaryClean = sanitizeTextForPdf(section.summaryText);
      const lines = wrapTextToWidth(summaryClean, usableWidthPt, bodyFontSizePt, spec.fontFamily);
      for (let lIdx = 0; lIdx < lines.length; lIdx++) {
        checkPageOverflow(bodyLineHeightPt);
        currentBlocks.push({
          id: `block_summary_${lIdx}`,
          type: 'text',
          x: margins.left,
          y: currentY,
          width: usableWidthPt,
          height: bodyLineHeightPt,
          text: lines[lIdx],
          fontSizePt: bodyFontSizePt,
          lineHeightPt: bodyLineHeightPt,
          fontFamily: spec.fontFamily,
          colorHex: '#1f2937',
          sectionType: section.type,
        });
        currentY += bodyLineHeightPt;
      }
      currentY += 8;
    }

    // Skills By Category
    if (section.skillsByCategory) {
      for (const [catName, skills] of Object.entries(section.skillsByCategory)) {
        const lineText = sanitizeTextForPdf(`${catName}: ${skills.join(', ')}`);
        const lines = wrapTextToWidth(lineText, usableWidthPt, bodyFontSizePt, spec.fontFamily);
        for (let lIdx = 0; lIdx < lines.length; lIdx++) {
          checkPageOverflow(bodyLineHeightPt);
          currentBlocks.push({
            id: `block_skill_${catName}_${lIdx}`,
            type: 'text',
            x: margins.left,
            y: currentY,
            width: usableWidthPt,
            height: bodyLineHeightPt,
            text: lines[lIdx],
            fontSizePt: bodyFontSizePt,
            lineHeightPt: bodyLineHeightPt,
            fontFamily: spec.fontFamily,
            colorHex: '#1f2937',
            sectionType: section.type,
          });
          currentY += bodyLineHeightPt;
        }
      }
      currentY += 6;
    }

    // Entries
    for (const entry of section.entries) {
      const entryTitle = sanitizeTextForPdf(entry.title);
      const entrySubtitle = entry.subtitle ? sanitizeTextForPdf(entry.subtitle) : '';
      const entryDates = entry.dates ? sanitizeTextForPdf(entry.dates) : '';

      const entryLineHeight = spec.entryFontSizePt * 1.3;
      checkPageOverflow(entryLineHeight + 4);

      currentBlocks.push({
        id: `block_entry_${entry.id}_title`,
        type: 'entry-title',
        x: margins.left,
        y: currentY,
        width: usableWidthPt * 0.7,
        height: entryLineHeight,
        text: entrySubtitle ? `${entryTitle} — ${entrySubtitle}` : entryTitle,
        fontSizePt: spec.entryFontSizePt,
        lineHeightPt: entryLineHeight,
        fontFamily: spec.fontFamily,
        isBold: true,
        colorHex: '#111827',
        sectionType: section.type,
      });

      if (entryDates) {
        currentBlocks.push({
          id: `block_entry_${entry.id}_dates`,
          type: 'entry-date',
          x: margins.left + usableWidthPt * 0.7,
          y: currentY,
          width: usableWidthPt * 0.3,
          height: entryLineHeight,
          text: entryDates,
          fontSizePt: spec.entryFontSizePt,
          lineHeightPt: entryLineHeight,
          fontFamily: spec.fontFamily,
          colorHex: '#6b7280',
          sectionType: section.type,
        });
      }

      currentY += entryLineHeight + 2;

      // Bullets
      for (let bIdx = 0; bIdx < entry.bullets.length; bIdx++) {
        const bullet = entry.bullets[bIdx];
        const cleanBullet = sanitizeTextForPdf(`• ${bullet.text}`);
        const bulletLines = wrapTextToWidth(cleanBullet, usableWidthPt - 12, bodyFontSizePt, spec.fontFamily);

        for (let lIdx = 0; lIdx < bulletLines.length; lIdx++) {
          checkPageOverflow(bodyLineHeightPt);
          currentBlocks.push({
            id: `block_bullet_${bullet.factId}_${lIdx}`,
            type: 'bullet',
            x: margins.left + 10,
            y: currentY,
            width: usableWidthPt - 10,
            height: bodyLineHeightPt,
            text: bulletLines[lIdx],
            fontSizePt: bodyFontSizePt,
            lineHeightPt: bodyLineHeightPt,
            fontFamily: spec.fontFamily,
            colorHex: '#374151',
            sectionType: section.type,
            factId: bullet.factId,
          });
          currentY += bodyLineHeightPt;
        }
        currentY += 2; // Spacing between bullets
      }

      currentY += 6; // Spacing after entry
    }

    currentY += 8; // Spacing after section
  }

  // Push final page
  if (currentBlocks.length > 0) {
    pages.push({
      pageNumber: currentPageNumber,
      widthPt: pageWidthPt,
      heightPt: pageHeightPt,
      marginsPt: margins,
      usableWidthPt,
      usableHeightPt,
      blocks: [...currentBlocks],
    });
  }

  const measuredTotalHeightPt = (pages.length - 1) * pageHeightPt + currentY;

  return {
    id: `layout_${documentTree.id}`,
    template: templateId,
    paperSize,
    pages,
    totalPageCount: pages.length,
    measuredTotalHeightPt,
    generatedAt: documentTree.updatedAt || '2026-10-28T12:00:00.000Z',
  };
}
