// ============================================================
// HIREFLOW PDF VECTOR RENDERER (STAGE 6)
// P5: One layout engine (units: points).
// Converts point-based LayoutDocument into pure vector PDF bytes using pdf-lib.
// Invariant HR-1, HR-2: Zero network egress, zero Math.random.
// ============================================================

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { LayoutDocument, LayoutBlock } from '../types';

function parseHexColor(hex: string) {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16) / 255;
    const g = parseInt(clean.slice(2, 4), 16) / 255;
    const b = parseInt(clean.slice(4, 6), 16) / 255;
    return rgb(r, g, b);
  }
  return rgb(0.1, 0.1, 0.1); // Default dark charcoal
}

export async function renderLayoutToPdfBytes(layout: LayoutDocument): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Embed standard font families
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  for (const pageData of layout.pages) {
    const page = pdfDoc.addPage([pageData.widthPt, pageData.heightPt]);
    const pageHeight = pageData.heightPt;

    for (const block of pageData.blocks) {
      // In PDF coordinate space, (0,0) is bottom-left. Invert Y coordinate.
      const pdfY = pageHeight - block.y - block.height;
      const color = parseHexColor(block.colorHex);

      if (block.type === 'section-rule') {
        page.drawLine({
          start: { x: block.x, y: pdfY + block.height / 2 },
          end: { x: block.x + block.width, y: pdfY + block.height / 2 },
          thickness: block.height,
          color,
        });
        continue;
      }

      if (block.text) {
        let font = helvetica;
        if (block.fontFamily === 'Times-Roman') {
          font = block.isBold ? timesBold : times;
        } else if (block.fontFamily === 'Courier') {
          font = courier;
        } else {
          font = block.isBold ? helveticaBold : helvetica;
        }

        page.drawText(block.text, {
          x: block.x,
          y: pdfY + 2, // Optical baseline adjustment
          size: block.fontSizePt,
          font,
          color,
        });
      }
    }
  }

  return pdfDoc.save();
}

