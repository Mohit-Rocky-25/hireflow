import type { DossierModel } from './dossierModel';

export async function generatePdfDossier(model: DossierModel): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

  const doc = await PDFDocument.create();
  let page = doc.addPage([595.28, 841.89]); // A4
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontMono = await doc.embedFont(StandardFonts.Courier);

  const margin = 48;
  const pageWidth = 595.28;
  const contentWidth = pageWidth - margin * 2;
  let y = 841.89 - margin;

  function checkNewPage(neededHeight: number) {
    if (y - neededHeight < margin) {
      page = doc.addPage([595.28, 841.89]);
      y = 841.89 - margin;
    }
  }

  // Header Bar
  page.drawRectangle({
    x: margin,
    y: y - 2,
    width: contentWidth,
    height: 2,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 20;

  // Title
  page.drawText('HIREFLOW — CANDIDATE CAREER DOSSIER', {
    x: margin,
    y,
    size: 14,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 16;

  page.drawText(`Target: ${model.target.roleTitle || 'Role'} at ${model.target.company || 'Company'}`, {
    x: margin,
    y,
    size: 11,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 14;

  page.drawText(`Candidate: ${model.candidate.name} (${model.candidate.resumeLabel}) • Generated: ${new Date(model.meta.generatedAt).toLocaleDateString()}`, {
    x: margin,
    y,
    size: 9,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 24;

  // Integrity Bar
  checkNewPage(40);
  page.drawRectangle({
    x: margin,
    y: y - 28,
    width: contentWidth,
    height: 32,
    color: rgb(0.96, 0.96, 0.96),
  });
  page.drawText(`SHA-256 Resume Hash: ${model.meta.integrity.resumeHash.slice(0, 32)}...`, {
    x: margin + 8,
    y: y - 10,
    size: 8,
    font: fontMono,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText(`SHA-256 JD Hash:     ${model.meta.integrity.jdHash.slice(0, 32)}...`, {
    x: margin + 8,
    y: y - 22,
    size: 8,
    font: fontMono,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 44;

  // Headline Score
  checkNewPage(50);
  page.drawText('FIT BENCHMARK SCORE', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 22;

  const scoreStr = `${model.headline.score} / 100`;
  page.drawText(scoreStr, {
    x: margin,
    y,
    size: 22,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  if (model.headline.deltaText) {
    page.drawText(` (${model.headline.deltaText})`, {
      x: margin + 110,
      y: y + 2,
      size: 11,
      font: fontBold,
      color: model.headline.deltaPts && model.headline.deltaPts > 0 ? rgb(0.1, 0.6, 0.3) : rgb(0.4, 0.4, 0.4),
    });
  }
  y -= 24;

  // Executive Summary
  checkNewPage(80);
  page.drawText('EXECUTIVE SUMMARY', {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 14;

  for (const s of model.summary) {
    checkNewPage(24);
    page.drawText(`- ${s}`, {
      x: margin + 4,
      y,
      size: 9,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
      maxWidth: contentWidth - 8,
    });
    y -= 16;
  }
  y -= 10;

  // Breakdown Table
  if (model.breakdown.length > 0) {
    checkNewPage(model.breakdown.length * 18 + 30);
    page.drawText('DIMENSIONAL BREAKDOWN', {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 16;

    for (const b of model.breakdown) {
      checkNewPage(18);
      page.drawText(b.label, {
        x: margin,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText(`${b.score} / 100`, {
        x: margin + contentWidth - 60,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 16;
    }
    y -= 10;
  }

  // Key Strengths
  if (model.strengths.length > 0) {
    checkNewPage(model.strengths.length * 16 + 30);
    page.drawText('VERIFIED CANDIDATE STRENGTHS', {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.5, 0.2),
    });
    y -= 14;

    for (const st of model.strengths) {
      checkNewPage(20);
      page.drawText(`+ ${st}`, {
        x: margin + 4,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
        maxWidth: contentWidth - 8,
      });
      y -= 16;
    }
    y -= 10;
  }

  // Open Gaps
  if (model.gaps.open.length > 0) {
    checkNewPage(model.gaps.open.length * 28 + 30);
    page.drawText(`CRITICAL GAPS IDENTIFIED (${model.gaps.open.length})`, {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.8, 0.2, 0.2),
    });
    y -= 16;

    for (const g of model.gaps.open) {
      checkNewPage(30);
      const sevLabel = g.severity === 3 ? '[High]' : g.severity === 2 ? '[Medium]' : '[Low]';
      page.drawText(`- ${sevLabel} ${g.label} (${g.category})`, {
        x: margin + 4,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 12;

      if (g.detail) {
        page.drawText(g.detail, {
          x: margin + 14,
          y,
          size: 8,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4),
          maxWidth: contentWidth - 20,
        });
        y -= 14;
      }
    }
    y -= 10;
  }

  // Execution Plan
  if (model.planned.length > 0) {
    checkNewPage(model.planned.length * 16 + 30);
    page.drawText('EXECUTION PLAN & ACTION ITEMS', {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 14;

    for (const p of model.planned) {
      checkNewPage(18);
      page.drawText(`[${p.status.toUpperCase()}] ${p.title} (${p.kind.replace('_', ' ')})`, {
        x: margin + 4,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.25, 0.25, 0.25),
        maxWidth: contentWidth - 8,
      });
      y -= 16;
    }
  }

  // Footer on each page
  const pageCount = doc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const p = doc.getPage(i);
    p.drawText(`HIREFLOW v${model.meta.engineVersion} • Confidential Candidate Dossier • Page ${i + 1} of ${pageCount}`, {
      x: margin,
      y: margin / 2,
      size: 7,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return await doc.save();
}
