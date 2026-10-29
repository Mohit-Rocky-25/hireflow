// ============================================================
// HIREFLOW DOM / SVG PREVIEW RENDERER (STAGE 6)
// Converts LayoutDocument pages into SVG / HTML nodes matching PDF vector output.
// Points-to-pixels scaling: 1 pt = 96/72 px = 1.3333 px.
// ============================================================

import { LayoutDocument, LayoutPage } from '../types';

export function renderPageToSvgString(page: LayoutPage): string {
  const scale = 96 / 72; // Points to 96 DPI CSS pixels
  const widthPx = Math.round(page.widthPt * scale);
  const heightPx = Math.round(page.heightPt * scale);

  const svgParts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${page.widthPt} ${page.heightPt}" width="${widthPx}" height="${heightPx}" style="background-color: #ffffff; display: block; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">`,
  ];

  for (const block of page.blocks) {
    if (block.type === 'section-rule') {
      svgParts.push(
        `<line x1="${block.x}" y1="${block.y}" x2="${block.x + block.width}" y2="${block.y}" stroke="${block.colorHex}" stroke-width="${block.height}" />`
      );
    } else if (block.text) {
      const fontWeight = block.isBold ? 'bold' : 'normal';
      const fontStyle = block.isItalic ? 'italic' : 'normal';
      const escapedText = block.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      svgParts.push(
        `<text x="${block.x}" y="${block.y + block.fontSizePt}" font-family="${block.fontFamily}, sans-serif" font-size="${block.fontSizePt}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${block.colorHex}">${escapedText}</text>`
      );
    }
  }

  svgParts.push('</svg>');
  return svgParts.join('\n');
}

export function renderLayoutToSvgPages(layout: LayoutDocument): string[] {
  return layout.pages.map(renderPageToSvgString);
}

