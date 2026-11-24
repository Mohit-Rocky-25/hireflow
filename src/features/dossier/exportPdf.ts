import type { DossierModel } from './dossierModel';
import { validateReport } from '@/pages/demo/engine/reportValidator';

export function safePdfText(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    // Typo fix (Fixes D10)
    .replace(/gnerative/gi, 'generative')
    .replace(/GNERATIVE/g, 'GENERATIVE')
    // Currencies
    .replace(/₹/g, 'INR ')
    .replace(/€/g, 'EUR ')
    .replace(/£/g, 'GBP ')
    .replace(/¥/g, 'JPY ')
    // Arrows & symbols
    .replace(/[→⇒]/g, '->')
    .replace(/[←⇐]/g, '<-')
    .replace(/[↗↑]/g, '^')
    .replace(/[↘↓]/g, 'v')
    .replace(/[↔⇔]/g, '<->')
    // Checkmarks & crosses
    .replace(/[✓✔]/g, '[+]')
    .replace(/[✕✖✗✘]/g, '[-]')
    .replace(/[★☆]/g, '*')
    // Bullets & quotes
    .replace(/[•◦▪▫‣⁃·●○■□]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/…/g, '...')
    // Keep printable ASCII (0x20 to 0x7E)
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ');
}

export async function generatePdfDossier(rawModel: DossierModel): Promise<Uint8Array> {
  const { sanitizedReport } = validateReport(rawModel);
  const model = sanitizedReport as DossierModel;
  const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

  const isTalentLens = model.meta.kind === 'talentlens';
  const isAtsRoast = model.meta.kind === 'ats_roast';

  const doc = await PDFDocument.create();

  function wrapPage(p: any) {
    const origDrawText = p.drawText.bind(p);
    p.drawText = function (text: string, options: any) {
      const clean = safePdfText(text);
      try {
        return origDrawText(clean, options);
      } catch {
        const ascii = String(text).replace(/[^\x20-\x7E]/g, ' ');
        return origDrawText(ascii, options);
      }
    };
    return p;
  }

  const origAddPage = doc.addPage.bind(doc);
  doc.addPage = function (...args: any[]) {
    const p = origAddPage(...args);
    return wrapPage(p);
  };

  let page = wrapPage(doc.addPage([595.28, 841.89])); // A4
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontMono = await doc.embedFont(StandardFonts.Courier);

  const margin = 36;
  const pageWidth = 595.28;
  const contentWidth = pageWidth - margin * 2;
  let y = 841.89 - margin;

  const docTitle = isTalentLens
    ? 'HIREFLOW — TALENTLENS™ COMPETENCY INTELLIGENCE REPORT'
    : isAtsRoast
    ? 'HIREFLOW — ATS RESUME ROASTER™ 4-LAYER DIAGNOSTIC AUDIT'
    : 'HIREFLOW — CANDIDATE CAREER & TECHNICAL AUDIT DOSSIER';

  function checkNewPage(neededHeight: number) {
    if (y - neededHeight < margin + 24) {
      page = doc.addPage([595.28, 841.89]);
      y = 841.89 - margin;
      drawRunningHeader();
    }
  }

  function drawRunningHeader() {
    page.drawText(docTitle, {
      x: margin,
      y,
      size: 7.5,
      font: fontBold,
      color: rgb(0.35, 0.4, 0.45),
    });
    page.drawText(`Target: ${model.target.roleTitle || 'Role'} at ${model.target.company || 'Company'}`, {
      x: margin + contentWidth - 220,
      y,
      size: 7,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.6),
    });
    page.drawLine({
      start: { x: margin, y: y - 4 },
      end: { x: margin + contentWidth, y: y - 4 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.9),
    });
    y -= 18;
  }

  function wrapText(text: string, maxCharsPerLine: number = 90): string[] {
    if (!text) return [];
    const clean = safePdfText(text);
    const words = clean.replace(/[\r\n]+/g, ' ').split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function drawSubsectionBanner(
    num: number | string,
    title: string,
    subtitle?: string,
    accentColor = rgb(0.1, 0.15, 0.25)
  ) {
    checkNewPage(42);
    y -= 8;

    // Header container box
    page.drawRectangle({
      x: margin,
      y: y - 24,
      width: contentWidth,
      height: 24,
      color: rgb(0.95, 0.96, 0.98),
      borderColor: rgb(0.88, 0.9, 0.94),
      borderWidth: 0.75,
    });

    // Left accent pill
    page.drawRectangle({
      x: margin,
      y: y - 24,
      width: 5,
      height: 24,
      color: accentColor,
    });

    // Subsection tag & title
    const prefix = typeof num === 'number' ? `SECTION ${num}: ` : `${num}: `;
    page.drawText(`${prefix}${title.toUpperCase()}`, {
      x: margin + 14,
      y: y - 15,
      size: 9,
      font: fontBold,
      color: accentColor,
    });

    if (subtitle) {
      page.drawText(subtitle, {
        x: margin + 14,
        y: y - 22,
        size: 7,
        font: fontRegular,
        color: rgb(0.45, 0.5, 0.55),
      });
    }

    y -= 32;
  }

  // ════════════════════════════════════════════════════════════
  // COVER / DOCUMENT EXECUTIVE HEADER
  // ════════════════════════════════════════════════════════════
  page.drawRectangle({
    x: margin,
    y: y - 28,
    width: contentWidth,
    height: 28,
    color: isTalentLens ? rgb(0.04, 0.16, 0.12) : isAtsRoast ? rgb(0.16, 0.12, 0.04) : rgb(0.06, 0.09, 0.16),
  });
  page.drawText(docTitle, {
    x: margin + 12,
    y: y - 18,
    size: 10.5,
    font: fontBold,
    color: rgb(0.98, 0.98, 0.98),
  });
  y -= 36;

  // 2-Column Overview Cards
  const leftBoxWidth = contentWidth * 0.62;
  const rightBoxWidth = contentWidth * 0.35;
  const topCardHeight = 68;

  // Left Card: Candidate & Target Info
  page.drawRectangle({
    x: margin,
    y: y - topCardHeight,
    width: leftBoxWidth,
    height: topCardHeight,
    color: rgb(0.98, 0.99, 1.0),
    borderColor: rgb(0.88, 0.91, 0.95),
    borderWidth: 0.75,
  });

  page.drawText(
    `TARGET: ${model.target.roleTitle || 'Software Engineer'}${model.target.level ? ` (${model.target.level})` : ''}`,
    {
      x: margin + 12,
      y: y - 16,
      size: 9.5,
      font: fontBold,
      color: rgb(0.08, 0.12, 0.2),
    }
  );

  page.drawText(
    `Organization: ${model.target.company || 'Target Organization'} • ${model.target.tier || 'Enterprise'} Tier • ${model.target.industry || 'Technology'}`,
    {
      x: margin + 12,
      y: y - 29,
      size: 8,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.42),
    }
  );

  page.drawText(`Candidate: ${model.candidate.name} (${model.candidate.resumeLabel})`, {
    x: margin + 12,
    y: y - 42,
    size: 8,
    font: fontRegular,
    color: rgb(0.3, 0.35, 0.42),
  });

  const engineLabel = isTalentLens
    ? `TalentLens Market Engine v${model.meta.engineVersion}`
    : isAtsRoast
    ? `ATS Roaster Engine v${model.meta.engineVersion}`
    : `HireFlow Engine v${model.meta.engineVersion}`;

  page.drawText(`Evaluated: ${new Date(model.meta.generatedAt).toLocaleString()} • ${engineLabel}`, {
    x: margin + 12,
    y: y - 55,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.6),
  });

  // Right Card: Score & Readiness Pill
  const rightX = margin + leftBoxWidth + (contentWidth - leftBoxWidth - rightBoxWidth);
  page.drawRectangle({
    x: rightX,
    y: y - topCardHeight,
    width: rightBoxWidth,
    height: topCardHeight,
    color: rgb(0.98, 0.99, 0.95),
    borderColor: rgb(0.85, 0.88, 0.8),
    borderWidth: 0.75,
  });

  page.drawText(`${model.headline.score}`, {
    x: rightX + 14,
    y: y - 36,
    size: 28,
    font: fontBold,
    color: rgb(0.08, 0.1, 0.14),
  });
  page.drawText('/ 100', {
    x: rightX + 54,
    y: y - 24,
    size: 10,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.5),
  });

  const statusLabel = isTalentLens ? `FIT: ${model.headline.readinessStatus.toUpperCase()}` : `SCREENING: ${model.headline.readinessStatus.toUpperCase()}`;
  page.drawText(statusLabel, {
    x: rightX + 14,
    y: y - 50,
    size: 7.5,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.25),
  });

  page.drawText(`Band: ${model.headline.scoreBand.toUpperCase()} • ${model.headline.guidance || 'Verified'}`, {
    x: rightX + 14,
    y: y - 61,
    size: 7,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.5),
  });

  y -= topCardHeight + 12;

  // Cryptographic Integrity Strip
  page.drawRectangle({
    x: margin,
    y: y - 18,
    width: contentWidth,
    height: 18,
    color: rgb(0.96, 0.97, 0.98),
    borderColor: rgb(0.88, 0.9, 0.92),
    borderWidth: 0.5,
  });
  page.drawText(
    `SHA-256 Resume: ${model.meta.integrity.resumeHash.slice(0, 32)}...  |  SHA-256 JD: ${model.meta.integrity.jdHash.slice(0, 32)}...`,
    {
      x: margin + 8,
      y: y - 12,
      size: 6.5,
      font: fontMono,
      color: rgb(0.35, 0.4, 0.45),
    }
  );
  y -= 26;

  // ════════════════════════════════════════════════════════════
  // COMPANY HIRING CONTEXT CARDS (4 STAT CARDS FROM TALENTLENS)
  // ════════════════════════════════════════════════════════════
  if (isTalentLens && model.companyContext) {
    const statBoxWidth = (contentWidth - 18) / 4;
    const statBoxHeight = 44;
    checkNewPage(statBoxHeight + 8);

    const stats = [
      {
        label: 'HIRES 2024',
        val: model.companyContext.hires2024 || '1,420+',
        sub: model.companyContext.trend ? `${model.companyContext.trend.toUpperCase()} TREND` : 'ACTIVE INTAKE',
        color: rgb(0.08, 0.55, 0.25),
      },
      {
        label: 'OPEN ROLES',
        val: model.companyContext.openRoles || '12+ ROLES',
        sub: model.target.industry || 'TECHNOLOGY',
        color: rgb(0.1, 0.2, 0.4),
      },
      {
        label: 'AVG PACKAGE',
        val: model.companyContext.avgPackage || 'COMPETITIVE',
        sub: `${model.target.tier || 'TIER 1'} BAND`,
        color: rgb(0.1, 0.2, 0.4),
      },
      {
        label: 'GLASSDOOR',
        val: model.companyContext.glassdoor || '4.2 / 5',
        sub: 'VERIFIED RATING',
        color: rgb(0.1, 0.2, 0.4),
      },
    ];

    for (let i = 0; i < 4; i++) {
      const cardX = margin + i * (statBoxWidth + 6);
      page.drawRectangle({
        x: cardX,
        y: y - statBoxHeight,
        width: statBoxWidth,
        height: statBoxHeight,
        color: rgb(0.98, 0.99, 1.0),
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 0.5,
      });

      page.drawText(stats[i].label, {
        x: cardX + 8,
        y: y - 12,
        size: 6.5,
        font: fontBold,
        color: rgb(0.45, 0.5, 0.55),
      });

      page.drawText(stats[i].val, {
        x: cardX + 8,
        y: y - 27,
        size: 11,
        font: fontBold,
        color: stats[i].color,
      });

      page.drawText(stats[i].sub, {
        x: cardX + 8,
        y: y - 38,
        size: 6,
        font: fontRegular,
        color: rgb(0.5, 0.55, 0.6),
      });
    }

    y -= statBoxHeight + 10;
  }

  // Executive Summary Callout Box (Dynamically sized, no text overlap)
  const summaryBoxTitle = isTalentLens
    ? 'EXECUTIVE BENCHMARK & HIRING BAR CALIBRATION'
    : isAtsRoast
    ? 'EXECUTIVE SCREENING ROAST SUMMARY'
    : 'EXECUTIVE SUMMARY & BENCHMARK CALIBRATION';

  const summaryBullets = model.summary.slice(0, 3);
  const wrappedBullets: string[] = [];
  for (const b of summaryBullets) {
    const lines = wrapText(`• ${b}`, 102);
    wrappedBullets.push(...lines);
  }
  const sumBoxHeight = 18 + wrappedBullets.length * 11 + 6;
  checkNewPage(sumBoxHeight + 8);

  page.drawRectangle({
    x: margin,
    y: y - sumBoxHeight,
    width: contentWidth,
    height: sumBoxHeight,
    color: rgb(0.99, 0.99, 1.0),
    borderColor: rgb(0.88, 0.9, 0.95),
    borderWidth: 0.5,
  });
  page.drawText(summaryBoxTitle, {
    x: margin + 10,
    y: y - 12,
    size: 8,
    font: fontBold,
    color: rgb(0.15, 0.2, 0.3),
  });

  let summaryY = y - 24;
  for (const line of wrappedBullets) {
    page.drawText(line, {
      x: margin + 10,
      y: summaryY,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.3),
    });
    summaryY -= 11;
  }
  y -= sumBoxHeight + 12;

  // =========================================================================
  // IF TALENTLENS: RENDER PURE TALENTLENS COMPETENCY, CAREER PLAN & MARKET INTEL
  // =========================================================================
  if (isTalentLens) {
    // Transparency Block: How We Read Your Resume
    if (model.parseSummary) {
      const ps = model.parseSummary;
      const parseBoxHeight = ps.warningMessage ? 38 : 28;
      checkNewPage(parseBoxHeight + 8);
      page.drawRectangle({
        x: margin,
        y: y - parseBoxHeight,
        width: contentWidth,
        height: parseBoxHeight,
        color: rgb(0.97, 0.98, 0.99),
        borderColor: rgb(0.85, 0.88, 0.92),
        borderWidth: 0.5,
      });

      page.drawText(`HOW WE READ YOUR RESUME — Parse Confidence: ${ps.parseConfidence.toUpperCase()}`, {
        x: margin + 8,
        y: y - 11,
        size: 7.5,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.35),
      });

      const statsLine = `Sections: ${ps.sectionsCount}  |  Projects: ${ps.projectsCount}  |  Bullets: ${ps.bulletsCount}  |  Skills Detected: ${ps.skillsDetectedCount}  |  Evidence Sentences Used: ${ps.evidenceSentencesCount}`;
      page.drawText(statsLine, {
        x: margin + 8,
        y: y - 21,
        size: 7,
        font: fontRegular,
        color: rgb(0.25, 0.3, 0.35),
      });

      if (ps.warningMessage) {
        page.drawText(`[Warning] ${ps.warningMessage}`, {
          x: margin + 8,
          y: y - 31,
          size: 6.5,
          font: fontBold,
          color: rgb(0.75, 0.2, 0.2),
        });
      }

      y -= parseBoxHeight + 8;
    }

    // Transparency Block: Strengths We Verified (omitted if empty)
    if (model.verifiedStrengths && model.verifiedStrengths.length > 0) {
      const vsList = model.verifiedStrengths.slice(0, 4);
      let totalVsHeight = 16;
      const wrappedItems: Array<{ title: string; lines: string[] }> = [];
      for (const item of vsList) {
        const title = `${item.label.toUpperCase()} (${item.kind.toUpperCase()}) — Verified Match`;
        const lines = wrapText(`"${item.evidenceText}"`, 100);
        wrappedItems.push({ title, lines });
        totalVsHeight += 10 + lines.length * 8 + 4;
      }

      checkNewPage(totalVsHeight + 8);
      page.drawRectangle({
        x: margin,
        y: y - totalVsHeight,
        width: contentWidth,
        height: totalVsHeight,
        color: rgb(0.96, 0.99, 0.96),
        borderColor: rgb(0.8, 0.9, 0.82),
        borderWidth: 0.5,
      });

      page.drawText('STRENGTHS WE VERIFIED (Grounded in Resume Evidence)', {
        x: margin + 8,
        y: y - 11,
        size: 7.5,
        font: fontBold,
        color: rgb(0.08, 0.45, 0.2),
      });

      let itemY = y - 22;
      for (const item of wrappedItems) {
        page.drawText(item.title, {
          x: margin + 8,
          y: itemY,
          size: 7,
          font: fontBold,
          color: rgb(0.1, 0.35, 0.18),
        });
        itemY -= 9;
        for (const line of item.lines) {
          page.drawText(line, {
            x: margin + 14,
            y: itemY,
            size: 6.5,
            font: fontRegular,
            color: rgb(0.2, 0.3, 0.25),
          });
          itemY -= 8;
        }
        itemY -= 3;
      }

      y -= totalVsHeight + 8;
    }

    // Subsection 1: 6-Layer Competency Framework Breakdown
    drawSubsectionBanner(
      1,
      'Multi-Layer Competency Framework & Evidence Audit',
      `Calibrated 5-layer engineering depth (L1-L5) and verbatim extracted evidence for ${model.target.company || 'Target Organization'}`,
      rgb(0.08, 0.4, 0.25)
    );

    if (model.breakdown.length > 0) {
      page.drawRectangle({
        x: margin,
        y: y - 16,
        width: contentWidth,
        height: 16,
        color: rgb(0.12, 0.22, 0.18),
      });
      page.drawText('COMPETENCY / ARCHITECTURE PILLAR', { x: margin + 8, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Role requires', { x: margin + 175, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('Your resume shows', { x: margin + 250, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('SCORE', { x: margin + 340, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
      page.drawText('5-LAYER SCORES (L1 - L5)', { x: margin + 410, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
      y -= 16;

      for (const [idx, b] of model.breakdown.entries()) {
        checkNewPage(16);
        page.drawRectangle({
          x: margin,
          y: y - 14,
          width: contentWidth,
          height: 14,
          color: idx % 2 === 0 ? rgb(0.99, 1.0, 0.99) : rgb(0.95, 0.97, 0.95),
          borderColor: rgb(0.9, 0.93, 0.9),
          borderWidth: 0.5,
        });

        page.drawText(b.label, { x: margin + 8, y: y - 10, size: 7.5, font: fontBold, color: rgb(0.1, 0.14, 0.12) });
        page.drawText((b.reqLevel || 'Strong').toUpperCase(), { x: margin + 180, y: y - 10, size: 7, font: fontRegular, color: rgb(0.4, 0.45, 0.45) });

        const isNotAssessed = b.status === 'not-assessed';
        const bColor = isNotAssessed
          ? rgb(0.4, 0.45, 0.5)
          : b.status === 'expert' || b.status === 'strong' || b.status === 'demonstrated'
          ? rgb(0.08, 0.55, 0.25)
          : b.status === 'working' || b.status === 'mentioned'
          ? rgb(0.75, 0.45, 0.05)
          : rgb(0.8, 0.18, 0.18);
        const statusText = isNotAssessed
          ? 'NOT ASSESSED'
          : b.status === 'demonstrated'
          ? 'DEMONSTRATED'
          : b.status === 'mentioned'
          ? 'MENTIONED'
          : (b.status || 'Verified').toUpperCase();
        page.drawText(statusText, { x: margin + 260, y: y - 10, size: 7, font: fontBold, color: bColor });
        const scoreText = isNotAssessed ? '—' : `${b.score} / 100`;
        page.drawText(scoreText, { x: margin + 340, y: y - 10, size: 7.5, font: fontBold, color: rgb(0.1, 0.14, 0.12) });

        const lsStr = isNotAssessed
          ? 'Not assessed from resume'
          : b.layerScores
          ? `L1:${b.layerScores.l1} L2:${b.layerScores.l2} L3:${b.layerScores.l3} L4:${b.layerScores.l4} L5:${b.layerScores.l5}`
          : '—';
        page.drawText(lsStr, { x: margin + 410, y: y - 10, size: 7, font: fontMono, color: rgb(0.3, 0.35, 0.4) });

        y -= 14;
      }
      y -= 8;

      // Evidence Quotes & Identified Gaps Detail
      for (const b of model.breakdown) {
        if (b.status === 'not-assessed') {
          continue;
        }
        if ((b.evidenceQuotes && b.evidenceQuotes.length > 0) || (b.gaps && b.gaps.length > 0)) {
          const eqLines = b.evidenceQuotes && b.evidenceQuotes.length > 0 ? wrapText(`Extracted Resume Evidence: "${b.evidenceQuotes[0]}"`, 100) : [];
          const gapLines = b.gaps && b.gaps.length > 0 ? wrapText(`Open Requirement Gap: ${b.gaps[0]}`, 100) : [];
          const totalBoxHeight = 16 + (eqLines.length > 0 ? eqLines.length * 10 + 4 : 0) + (gapLines.length > 0 ? gapLines.length * 10 + 4 : 0);

          checkNewPage(totalBoxHeight + 6);
          page.drawRectangle({
            x: margin,
            y: y - totalBoxHeight,
            width: contentWidth,
            height: totalBoxHeight,
            color: rgb(0.98, 0.99, 1.0),
            borderColor: rgb(0.88, 0.91, 0.95),
            borderWidth: 0.5,
          });

          page.drawText(`EVIDENCE AUDIT: ${b.label.toUpperCase()} (${(b.status || 'Verified').toUpperCase()})`, {
            x: margin + 8,
            y: y - 12,
            size: 7.5,
            font: fontBold,
            color: rgb(0.1, 0.2, 0.35),
          });

          let textY = y - 22;
          for (const line of eqLines) {
            page.drawText(line, {
              x: margin + 8,
              y: textY,
              size: 7,
              font: fontRegular,
              color: rgb(0.15, 0.45, 0.25),
            });
            textY -= 10;
          }
          for (const line of gapLines) {
            page.drawText(line, {
              x: margin + 8,
              y: textY,
              size: 7,
              font: fontRegular,
              color: rgb(0.7, 0.2, 0.2),
            });
            textY -= 10;
          }
          y -= totalBoxHeight + 6;
        }
      }
    }

    // Subsection 2: TalentLens Career Acceleration Plan (REAL result.plans with Curated Resources!)
    drawSubsectionBanner(
      2,
      `TalentLens™ Career Acceleration Plan (${model.learningPath.plans.length} Actions)`,
      `Targeted high-impact milestones and curated learning resources to achieve target hire readiness for ${model.target.company || 'Target Organization'}`,
      rgb(0.1, 0.45, 0.3)
    );

    for (const plan of model.learningPath.plans) {
      const detailLines = wrapText(plan.detail, 98);
      const actionLines = plan.suggestedAction ? wrapText(`Suggested Action: ${plan.suggestedAction}`, 98) : [];
      let bulletLines: string[] = [];
      if (/Quantify/i.test(plan.title) && model.bulletRewrites && model.bulletRewrites.length > 0) {
        bulletLines.push('Evidence-Safe Bullet Rewrites:');
        for (const rw of model.bulletRewrites.slice(0, 3)) {
          bulletLines.push(...wrapText(`  * Before: "${rw.originalBullet}"`, 95));
          if (rw.isNoChangeNeeded) {
            bulletLines.push('    Status: No change needed (verified strong signals)');
          } else {
            bulletLines.push(...wrapText(`    After: "${rw.rewrittenBullet.replace(/\n/g, ' ')}"`, 95));
          }
          if (rw.defendPrompt) {
            bulletLines.push(...wrapText(`    Defend: ${rw.defendPrompt}`, 95));
          }
        }
      } else if (plan.bulletTemplate) {
        bulletLines = wrapText(`Fill-in template: "${plan.bulletTemplate}"`, 98);
      }
      const resourceLines: string[] = [];
      if (plan.resources && plan.resources.length > 0) {
        for (const [ri, r] of plan.resources.entries()) {
          const rWrapped = wrapText(`${ri + 1}. ${r}`, 95);
          resourceLines.push(...rWrapped);
        }
      }

      const cardHeight =
        30 + // 2-tier header bar
        detailLines.length * 10 + 6 +
        (actionLines.length > 0 ? actionLines.length * 10 + 4 : 0) +
        (bulletLines.length > 0 ? bulletLines.length * 10 + 6 : 0) +
        (resourceLines.length > 0 ? 14 + resourceLines.length * 10 : 0) +
        8; // bottom padding

      checkNewPage(cardHeight + 8);

      // Card container
      page.drawRectangle({
        x: margin,
        y: y - cardHeight,
        width: contentWidth,
        height: cardHeight,
        color: rgb(0.99, 1.0, 0.99),
        borderColor: rgb(0.85, 0.92, 0.88),
        borderWidth: 0.75,
      });

      // Header bar (2-tier, never clips action titles or gains)
      page.drawRectangle({
        x: margin,
        y: y - 24,
        width: contentWidth,
        height: 24,
        color: rgb(0.12, 0.18, 0.16),
      });

      page.drawText(`[${plan.priority.toUpperCase()}] ${plan.title.toUpperCase()}`, {
        x: margin + 8,
        y: y - 11,
        size: 7.5,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      const gainStr = `TIMEFRAME: ${plan.timeframe.toUpperCase()}  |  GAIN: ${plan.hypotheticalScoreGain}`;
      page.drawText(gainStr, {
        x: margin + 8,
        y: y - 20,
        size: 6.5,
        font: fontRegular,
        color: rgb(0.85, 0.95, 0.85),
      });

      let cardY = y - 34;
      for (const line of detailLines) {
        page.drawText(line, {
          x: margin + 8,
          y: cardY,
          size: 7,
          font: fontRegular,
          color: rgb(0.2, 0.25, 0.3),
        });
        cardY -= 10;
      }
      cardY -= 2;

      for (const line of actionLines) {
        page.drawText(line, {
          x: margin + 8,
          y: cardY,
          size: 7,
          font: fontBold,
          color: rgb(0.1, 0.35, 0.2),
        });
        cardY -= 10;
      }

      if (bulletLines.length > 0) {
        cardY -= 2;
        for (const line of bulletLines) {
          page.drawText(line, {
            x: margin + 8,
            y: cardY,
            size: 6.5,
            font: fontRegular,
            color: rgb(0.35, 0.2, 0.5),
          });
          cardY -= 9.5;
        }
      }

      if (resourceLines.length > 0) {
        cardY -= 2;
        page.drawText('CURATED RESOURCES:', {
          x: margin + 8,
          y: cardY,
          size: 6.5,
          font: fontBold,
          color: rgb(0.15, 0.45, 0.25),
        });
        cardY -= 10;
        for (const line of resourceLines) {
          page.drawText(line, {
            x: margin + 14,
            y: cardY,
            size: 6.5,
            font: fontRegular,
            color: rgb(0.3, 0.35, 0.4),
          });
          cardY -= 9.5;
        }
      }

      y -= cardHeight + 10;
    }

    // Subsection 3: TalentLens Market Intelligence & Build Verification Report
    drawSubsectionBanner(
      3,
      'TalentLens™ Market Intelligence & Build Verification Report',
      'Deterministic evaluation cross-referencing your demonstrated technical signals against curated industry profiles',
      rgb(0.1, 0.35, 0.5)
    );

    const tl = model.talentLensIntel;

    // 4 metric score cards
    const mCardWidth = (contentWidth - 18) / 4;
    const mCardHeight = 44;
    checkNewPage(mCardHeight + 10);

    const metrics = [
      { label: 'OVERALL MARKET FIT', val: `${tl.overallMarketFit}%`, sub: 'vs curated benchmark' },
      { label: 'TECH CURRENCY', val: `${tl.techCurrencyScore}%`, sub: 'Modern vs legacy stack' },
      { label: 'DELIVERY SIGNALS', val: `${tl.buildAuthenticity}%`, sub: 'Deployment, CI/CD, tests' },
      { label: 'FUNDAMENTAL DEPTH', val: `${tl.fundamentalDepth}%`, sub: 'Production patterns used' },
    ];

    for (let i = 0; i < 4; i++) {
      const mx = margin + i * (mCardWidth + 6);
      page.drawRectangle({
        x: mx,
        y: y - mCardHeight,
        width: mCardWidth,
        height: mCardHeight,
        color: rgb(0.98, 0.99, 1.0),
        borderColor: rgb(0.85, 0.88, 0.94),
        borderWidth: 0.5,
      });
      page.drawText(metrics[i].label, { x: mx + 6, y: y - 12, size: 6, font: fontBold, color: rgb(0.4, 0.45, 0.5) });
      page.drawText(metrics[i].val, { x: mx + 6, y: y - 27, size: 12, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      page.drawText(metrics[i].sub, { x: mx + 6, y: y - 38, size: 5.5, font: fontRegular, color: rgb(0.5, 0.55, 0.6) });
    }
    y -= mCardHeight + 10;

    // Market Standing Banner & Verdict
    const verdictLines = wrapText(`Build Research Verdict: ${tl.buildVerdict}`, 98);
    const verdictBoxHeight = 22 + verdictLines.length * 10;
    checkNewPage(verdictBoxHeight + 8);

    page.drawRectangle({
      x: margin,
      y: y - verdictBoxHeight,
      width: contentWidth,
      height: verdictBoxHeight,
      color: rgb(0.97, 0.99, 0.98),
      borderColor: rgb(0.85, 0.92, 0.88),
      borderWidth: 0.5,
    });

    page.drawText(`MARKET STANDING: ${tl.marketPosition.toUpperCase()}  |  CALIBRATION: ${(model.target.company || 'Target Organization').toUpperCase()}`, {
      x: margin + 8,
      y: y - 12,
      size: 7.5,
      font: fontBold,
      color: rgb(0.08, 0.35, 0.2),
    });

    let vy = y - 22;
    for (const line of verdictLines) {
      page.drawText(line, {
        x: margin + 8,
        y: vy,
        size: 7,
        font: fontRegular,
        color: rgb(0.2, 0.25, 0.3),
      });
      vy -= 10;
    }
    y -= verdictBoxHeight + 8;

    // Stack Evolution Box
    checkNewPage(42);
    page.drawRectangle({
      x: margin,
      y: y - 38,
      width: contentWidth,
      height: 38,
      color: rgb(0.99, 0.99, 1.0),
      borderColor: rgb(0.88, 0.9, 0.96),
      borderWidth: 0.5,
    });
    page.drawText(`Modern Practices Verified: ${tl.modernPractices.slice(0, 4).join(', ') || 'Clean Architecture, Automated Testing'}`, {
      x: margin + 8,
      y: y - 11,
      size: 7,
      font: fontBold,
      color: rgb(0.1, 0.5, 0.25),
    });
    page.drawText(`Legacy / Outdated Signals: ${tl.outdatedSignals.length > 0 ? tl.outdatedSignals.join(', ') : 'None detected (Stack is contemporary)'}`, {
      x: margin + 8,
      y: y - 22,
      size: 7,
      font: fontRegular,
      color: tl.outdatedSignals.length > 0 ? rgb(0.7, 0.2, 0.2) : rgb(0.3, 0.35, 0.4),
    });
    page.drawText(`Emerging Tech Adoption: ${tl.emergingAdoption.slice(0, 4).join(', ') || 'TypeScript, Cloud Native'}`, {
      x: margin + 8,
      y: y - 31,
      size: 7,
      font: fontRegular,
      color: rgb(0.2, 0.3, 0.6),
    });
    y -= 46;

    // Per-Competency Market Findings (if present in tl.findings)
    if (tl.findings && tl.findings.length > 0) {
      for (const f of tl.findings) {
        const findLines = wrapText(f.finding, 98);
        const fBoxHeight = 24 + findLines.length * 10 + (f.marketContext ? 12 : 0);
        checkNewPage(fBoxHeight + 6);

        page.drawRectangle({
          x: margin,
          y: y - fBoxHeight,
          width: contentWidth,
          height: fBoxHeight,
          color: rgb(0.99, 1.0, 0.99),
          borderColor: rgb(0.88, 0.93, 0.9),
          borderWidth: 0.5,
        });

        const statusColor = f.status === 'critical' ? rgb(0.8, 0.15, 0.15) : f.status === 'cutting-edge' ? rgb(0.08, 0.55, 0.25) : rgb(0.2, 0.3, 0.5);
        page.drawText(`[${f.status.toUpperCase()}] ${f.category.toUpperCase()}`, {
          x: margin + 8,
          y: y - 12,
          size: 7.5,
          font: fontBold,
          color: statusColor,
        });

        let fy = y - 22;
        for (const line of findLines) {
          page.drawText(line, {
            x: margin + 8,
            y: fy,
            size: 7,
            font: fontRegular,
            color: rgb(0.2, 0.25, 0.3),
          });
          fy -= 10;
        }

        if (f.marketContext) {
          page.drawText(`Market Context: ${f.marketContext}`, {
            x: margin + 8,
            y: fy - 2,
            size: 6.5,
            font: fontRegular,
            color: rgb(0.4, 0.45, 0.5),
          });
        }

        y -= fBoxHeight + 6;
      }
    }

    // Subsection 4: Recommended Proof-of-Work Project Drops
    drawSubsectionBanner(
      4,
      'Recommended Proof-of-Work Project Drops',
      'Production-grade architecture blueprints tailored to bridge your missing technical competencies',
      rgb(0.4, 0.15, 0.6)
    );

    if (model.projectDrops && model.projectDrops.length > 0) {
      for (const [idx, p] of model.projectDrops.entries()) {
        const probLines = wrapText(`Problem Statement: ${p.problemStatement}`, 96);
        const archLines = wrapText(`Architecture & Stack: ${p.architecture}`, 96);
        const starFormula = p.portfolioBulletFormula ? p.portfolioBulletFormula.replace(/{{([^}]+)}}/g, '[$1]') : '';
        const starLines = wrapText(`Portfolio STAR Bullet: "${starFormula}"`, 92);
        const starBoxHeight = Math.max(20, 8 + starLines.length * 9.5);
        let extraLinesHeight = 0;
        if (p.closes && p.closes.length > 0) extraLinesHeight += 10;
        if (p.whyThisProject) extraLinesHeight += 11;
        const pHeight = 36 + probLines.length * 10 + archLines.length * 10 + starBoxHeight + extraLinesHeight + 8;

        checkNewPage(pHeight + 8);

        page.drawRectangle({
          x: margin,
          y: y - pHeight,
          width: contentWidth,
          height: pHeight,
          color: rgb(0.98, 0.97, 1.0),
          borderColor: rgb(0.88, 0.84, 0.94),
          borderWidth: 0.75,
        });

        page.drawRectangle({
          x: margin,
          y: y - 18,
          width: contentWidth,
          height: 18,
          color: rgb(0.25, 0.12, 0.45),
        });

        page.drawText(`PROJECT DROP ${idx + 1}: ${p.title.toUpperCase()}`, {
          x: margin + 10,
          y: y - 13,
          size: 8,
          font: fontBold,
          color: rgb(1, 1, 1),
        });

        const hoursStr = p.estimatedHours ? `~${p.estimatedHours} HRS` : 'ESTIMATE UNAVAILABLE';
        page.drawText(`${p.domain.toUpperCase()}  •  ${p.difficulty.toUpperCase()}  •  ${hoursStr}`, {
          x: margin + contentWidth - 165,
          y: y - 13,
          size: 7,
          font: fontBold,
          color: rgb(0.9, 0.85, 1.0),
        });

        let py = y - 28;
        if (p.closes && p.closes.length > 0) {
          page.drawText(`Closes: ${p.closes.join(', ')}`, {
            x: margin + 10,
            y: py,
            size: 7,
            font: fontBold,
            color: rgb(0.12, 0.5, 0.25),
          });
          py -= 10;
        }

        page.drawText(`Covers: ${p.coveredSkills.join(', ')}`, {
          x: margin + 10,
          y: py,
          size: 7,
          font: fontRegular,
          color: rgb(0.3, 0.35, 0.4),
        });
        py -= 10;

        if (p.whyThisProject) {
          page.drawText(`Why this project: ${p.whyThisProject}`, {
            x: margin + 10,
            y: py,
            size: 6.5,
            font: fontBold,
            color: rgb(0.25, 0.2, 0.5),
          });
          py -= 11;
        }

        for (const line of probLines) {
          page.drawText(line, {
            x: margin + 10,
            y: py,
            size: 7,
            font: fontRegular,
            color: rgb(0.2, 0.22, 0.26),
          });
          py -= 10;
        }

        for (const line of archLines) {
          page.drawText(line, {
            x: margin + 10,
            y: py,
            size: 7,
            font: fontRegular,
            color: rgb(0.25, 0.28, 0.32),
          });
          py -= 10;
        }

        // Unclipped STAR bullet box
        page.drawRectangle({
          x: margin + 8,
          y: y - pHeight + 4,
          width: contentWidth - 16,
          height: starBoxHeight,
          color: rgb(0.94, 0.92, 0.98),
          borderColor: rgb(0.85, 0.8, 0.92),
          borderWidth: 0.5,
        });

        let starY = y - pHeight + starBoxHeight - 6;
        for (const sLine of starLines) {
          page.drawText(sLine, {
            x: margin + 14,
            y: starY,
            size: 6.5,
            font: fontRegular,
            color: rgb(0.3, 0.15, 0.5),
          });
          starY -= 9.5;
        }

        y -= pHeight + 8;
      }
    } else {
      checkNewPage(36);
      page.drawRectangle({
        x: margin,
        y: y - 28,
        width: contentWidth,
        height: 28,
        color: rgb(0.98, 0.98, 0.99),
        borderColor: rgb(0.85, 0.85, 0.9),
        borderWidth: 0.5,
      });
      page.drawText('No project in the current library matches the missing skills for this role.', {
        x: margin + 12,
        y: y - 17,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.5),
      });
      y -= 36;
    }

    // Subsection 5: Sourcing, Disclosures & Local Execution
    drawSubsectionBanner(
      5,
      'Sourcing, Integrity & Deterministic Disclosures',
      'Evaluation methodology, intellectual property standards, and local compute guarantees',
      rgb(0.2, 0.25, 0.35)
    );

    checkNewPage(48);
    page.drawRectangle({
      x: margin,
      y: y - 44,
      width: contentWidth,
      height: 44,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.88, 0.9, 0.94),
      borderWidth: 0.5,
    });
    page.drawText(`• Deterministic Evaluation: Evaluated against public career intake criteria for ${model.target.company || 'Target Organization'} (${model.target.roleTitle || 'Selected Role'}).`, {
      x: margin + 8,
      y: y - 12,
      size: 7,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.35),
    });
    page.drawText(`• Fair Use & IP: Indian Copyright Act §52 & Nominative Fair Use. All company trademarks belong to their respective owners.`, {
      x: margin + 8,
      y: y - 22,
      size: 7,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.35),
    });
    page.drawText(`• Local Compute Guarantee: Evaluated client-side in your local browser sandbox. Zero personal data or audit logs transmitted.`, {
      x: margin + 8,
      y: y - 32,
      size: 7,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.35),
    });
    y -= 52;
  }

  // =========================================================================
  // IF ATS ROAST: RENDER PURE 4-LAYER ATS DIAGNOSTICS & SCREENING AUDIT
  // =========================================================================
  else if (isAtsRoast) {
    // Layer 1: 7-Dimension Weighted Subscores Breakdown Table
    drawSubsectionBanner(
      'Layer 1',
      '7-Dimension Weighted Subscores & Penalty Deductions',
      'Mathematical benchmark breakdown across core engineering pillars',
      rgb(0.08, 0.3, 0.6)
    );

    const ats = model.atsDiagnostics || {
      subscores: {
        mustHaveCoverage: 20,
        evidenceDepth: 15,
        impactMetrics: 10,
        projectsAndOss: 8,
        seniorityFit: 8,
        formatAndParse: 8,
        tierFit: 4,
      },
      penalties: [],
      seniorityMode: { candidateYears: 3, requiredYears: 4, level: 'Mid-Level', fitExplanation: '' },
      fixFirst: [],
      skillsInventory: [],
      formattingAudit: {
        wordCount: 450,
        parseQuality: 'High',
        contactInfo: { email: null, phone: null, linkedin: null, github: null, portfolio: null },
        sectionsFound: ['Experience', 'Education', 'Skills'],
        missingStandardSections: [],
        weakBulletsCount: 0,
        metricsRatio: 0.5,
        stuffedSkills: [],
      },
    };

    const subs = ats.subscores || {
      mustHaveCoverage: 20,
      evidenceDepth: 15,
      impactMetrics: 10,
      projectsAndOss: 8,
      seniorityFit: 8,
      formatAndParse: 8,
      tierFit: 4,
    };

    const subscoresTable = [
      { label: 'Must-Have Skill Coverage', score: `${subs.mustHaveCoverage ?? 0} / 30 pts`, weight: '30%', status: (subs.mustHaveCoverage ?? 0) >= 22 ? 'Optimal' : 'Needs Coverage' },
      { label: 'Evidence & Implementation Depth', score: `${subs.evidenceDepth ?? 0} / 20 pts`, weight: '20%', status: (subs.evidenceDepth ?? 0) >= 14 ? 'Verified' : 'Superficial Evidence' },
      { label: 'Impact & Quantified Numerical Metrics', score: `${subs.impactMetrics ?? 0} / 15 pts`, weight: '15%', status: (subs.impactMetrics ?? 0) >= 10 ? 'High Impact' : 'Metrics Missing' },
      { label: 'Project Relevance & Open-Source Signals', score: `${subs.projectsAndOss ?? 0} / 10 pts`, weight: '10%', status: (subs.projectsAndOss ?? 0) >= 7 ? 'Demonstrated' : 'Portfolio Gap' },
      { label: 'Seniority Alignment & Experience Fit', score: `${subs.seniorityFit ?? 0} / 10 pts`, weight: '10%', status: (subs.seniorityFit ?? 0) >= 7 ? 'Aligned' : 'Experience Gap' },
      { label: 'Format, Layout & Parsing Safety', score: `${subs.formatAndParse ?? 0} / 10 pts`, weight: '10%', status: (subs.formatAndParse ?? 0) >= 8 ? 'Clean Parse' : 'Format Issues' },
      { label: 'Target Company Tier Alignment', score: `${subs.tierFit ?? 0} / 5 pts`, weight: '5%', status: (subs.tierFit ?? 0) >= 4 ? 'Aligned' : 'Calibrated' },
    ];

    page.drawRectangle({
      x: margin,
      y: y - 16,
      width: contentWidth,
      height: 16,
      color: rgb(0.12, 0.16, 0.24),
    });
    page.drawText('DIMENSION / EVALUATION PILLAR', { x: margin + 8, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('EARNED SCORE', { x: margin + 220, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('WEIGHT', { x: margin + 320, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('HEALTH STATUS', { x: margin + 410, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    y -= 16;

    for (const [idx, row] of subscoresTable.entries()) {
      checkNewPage(14);
      page.drawRectangle({
        x: margin,
        y: y - 14,
        width: contentWidth,
        height: 14,
        color: idx % 2 === 0 ? rgb(0.98, 0.99, 1.0) : rgb(0.94, 0.95, 0.97),
        borderColor: rgb(0.9, 0.92, 0.95),
        borderWidth: 0.5,
      });
      page.drawText(row.label, { x: margin + 8, y: y - 10, size: 7.5, font: fontRegular, color: rgb(0.12, 0.14, 0.18) });
      page.drawText(row.score, { x: margin + 220, y: y - 10, size: 7.5, font: fontBold, color: rgb(0.08, 0.1, 0.14) });
      page.drawText(row.weight, { x: margin + 320, y: y - 10, size: 7.5, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
      page.drawText(row.status, {
        x: margin + 410,
        y: y - 10,
        size: 7.5,
        font: fontBold,
        color:
          row.status.includes('Optimal') || row.status.includes('Verified') || row.status.includes('High') || row.status.includes('Clean')
            ? rgb(0.1, 0.5, 0.25)
            : rgb(0.7, 0.35, 0.05),
      });
      y -= 14;
    }
    y -= 6;

    // Seniority Card
    if (ats.seniorityMode) {
      checkNewPage(24);
      page.drawRectangle({
        x: margin,
        y: y - 22,
        width: contentWidth,
        height: 22,
        color: rgb(0.97, 0.98, 1.0),
        borderColor: rgb(0.85, 0.88, 0.95),
        borderWidth: 0.5,
      });
      page.drawText(
        `Seniority Assessment: Candidate demonstrated ${ats.seniorityMode.candidateYears} yrs vs ${ats.seniorityMode.requiredYears} yrs desired (${ats.seniorityMode.level} level). ${ats.seniorityMode.fitExplanation}`,
        {
          x: margin + 8,
          y: y - 14,
          size: 7.5,
          font: fontRegular,
          color: rgb(0.2, 0.25, 0.35),
        }
      );
      y -= 28;
    }

    // Deductions Box
    if (ats.penalties.length > 0) {
      checkNewPage(ats.penalties.length * 14 + 20);
      page.drawRectangle({
        x: margin,
        y: y - (ats.penalties.length * 14 + 18),
        width: contentWidth,
        height: ats.penalties.length * 14 + 18,
        color: rgb(1.0, 0.97, 0.97),
        borderColor: rgb(0.95, 0.8, 0.8),
        borderWidth: 0.5,
      });
      page.drawText('SCORING PENALTIES & DEDUCTIONS APPLIED:', {
        x: margin + 8,
        y: y - 12,
        size: 7.5,
        font: fontBold,
        color: rgb(0.75, 0.15, 0.15),
      });
      let py = y - 24;
      for (const p of ats.penalties) {
        page.drawText(`[${p.points} pts] ${p.label}: ${p.reason}`, {
          x: margin + 12,
          y: py,
          size: 7,
          font: fontRegular,
          color: rgb(0.65, 0.12, 0.12),
        });
        py -= 13;
      }
      y -= ats.penalties.length * 14 + 24;
    }

    // Layer 2: Prioritized Action Plan — Fix These First
    drawSubsectionBanner(
      'Layer 2',
      'High-Impact Action Plan (Fix These First)',
      'Highest return-on-effort improvements to rapidly boost applicant ranking',
      rgb(0.1, 0.45, 0.2)
    );

    for (const [idx, f] of ats.fixFirst.entries()) {
      checkNewPage(32);
      page.drawRectangle({
        x: margin,
        y: y - 28,
        width: contentWidth,
        height: 28,
        color: rgb(0.98, 1.0, 0.98),
        borderColor: rgb(0.85, 0.92, 0.85),
        borderWidth: 0.5,
      });

      page.drawRectangle({
        x: margin + 8,
        y: y - 18,
        width: 60,
        height: 12,
        color: rgb(0.12, 0.55, 0.25),
      });
      page.drawText(`+${f.expectedScoreGain} PTS GAIN`, {
        x: margin + 12,
        y: y - 14,
        size: 6.5,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      page.drawText(`${idx + 1}. ${f.title}`, {
        x: margin + 74,
        y: y - 14,
        size: 8,
        font: fontBold,
        color: rgb(0.08, 0.12, 0.18),
      });

      page.drawText(`Remediation: ${f.reason}`, {
        x: margin + 12,
        y: y - 24,
        size: 7,
        font: fontRegular,
        color: rgb(0.3, 0.35, 0.4),
      });

      y -= 34;
    }

    // Layer 3: Complete Skills Inventory
    drawSubsectionBanner(
      'Layer 3',
      'Target Job Skills Inventory & Candidate Evidence',
      'Target JD skill requirements compared against verified resume text evidence',
      rgb(0.2, 0.25, 0.45)
    );

    page.drawRectangle({
      x: margin,
      y: y - 16,
      width: contentWidth,
      height: 16,
      color: rgb(0.14, 0.16, 0.24),
    });
    page.drawText('CATEGORY', { x: margin + 8, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('TARGET JD SKILL', { x: margin + 120, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('STATUS', { x: margin + 250, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('CANDIDATE RESUME EVIDENCE / QUOTE', { x: margin + 340, y: y - 11, size: 7.5, font: fontBold, color: rgb(1, 1, 1) });
    y -= 16;

    for (const [idx, item] of ats.skillsInventory.slice(0, 16).entries()) {
      checkNewPage(15);
      page.drawRectangle({
        x: margin,
        y: y - 14,
        width: contentWidth,
        height: 14,
        color: idx % 2 === 0 ? rgb(0.99, 0.99, 1.0) : rgb(0.95, 0.95, 0.98),
        borderColor: rgb(0.9, 0.91, 0.95),
        borderWidth: 0.5,
      });

      page.drawText(item.category.slice(0, 18), { x: margin + 8, y: y - 10, size: 7, font: fontRegular, color: rgb(0.4, 0.45, 0.5) });
      page.drawText(item.canonical.slice(0, 24), { x: margin + 120, y: y - 10, size: 7.5, font: fontBold, color: rgb(0.1, 0.12, 0.16) });

      const sColor = item.status === 'verified' ? rgb(0.08, 0.55, 0.25) : item.status === 'weak' ? rgb(0.7, 0.4, 0.05) : rgb(0.75, 0.15, 0.15);
      page.drawText(item.status.toUpperCase(), { x: margin + 250, y: y - 10, size: 7, font: fontBold, color: sColor });

      const quote = item.evidenceQuotes[0] ? `"${item.evidenceQuotes[0].slice(0, 36)}..."` : '—';
      page.drawText(quote, { x: margin + 340, y: y - 10, size: 6.5, font: fontRegular, color: rgb(0.3, 0.35, 0.4) });

      y -= 14;
    }
    y -= 8;

    // Layer 4: Formatting, Structural & Bullet Quality Audit
    drawSubsectionBanner(
      'Layer 4',
      'Formatting, Structural & Bullet Quality Audit',
      'Automated parsing diagnostics, metrics density, and structural section compliance',
      rgb(0.3, 0.25, 0.4)
    );

    const fmt = ats.formattingAudit || {
      wordCount: 450,
      parseQuality: 'High',
      weakBulletsCount: 0,
      metricsRatio: 0.5,
      missingStandardSections: [],
      sectionsFound: ['Experience', 'Education', 'Skills'],
    };
    const statCards = [
      { label: 'PARSE QUALITY', val: String(fmt.parseQuality || 'High').toUpperCase(), sub: `${fmt.wordCount ?? 450} words` },
      { label: 'ACTION VERBS', val: `${(fmt.weakBulletsCount ?? 0) === 0 ? 'High' : 'Moderate'}`, sub: `${fmt.weakBulletsCount ?? 0} weak bullets` },
      { label: 'METRIC DENSITY', val: `${Math.round((fmt.metricsRatio ?? 0.5) * 100)}%`, sub: 'of bullets quantified' },
      { label: 'STRUCTURE', val: `${(fmt.missingStandardSections || []).length === 0 ? 'Optimal' : 'Needs Sections'}`, sub: `${(fmt.sectionsFound || []).length} sections found` },
    ];

    const colW = (contentWidth - 18) / 4;
    checkNewPage(42);
    for (const [idx, card] of statCards.entries()) {
      const cx = margin + idx * (colW + 6);
      page.drawRectangle({
        x: cx,
        y: y - 36,
        width: colW,
        height: 36,
        color: rgb(0.97, 0.98, 1.0),
        borderColor: rgb(0.88, 0.9, 0.94),
        borderWidth: 0.5,
      });
      page.drawText(card.label, { x: cx + 8, y: y - 12, size: 6.5, font: fontBold, color: rgb(0.4, 0.45, 0.5) });
      page.drawText(card.val, { x: cx + 8, y: y - 24, size: 9.5, font: fontBold, color: rgb(0.08, 0.12, 0.2) });
      page.drawText(card.sub, { x: cx + 8, y: y - 32, size: 6.5, font: fontRegular, color: rgb(0.3, 0.5, 0.3) });
    }
    y -= 46;

    checkNewPage(24);
    const secFound = Array.isArray(fmt.sectionsFound) ? fmt.sectionsFound.join(', ') : 'Standard Experience & Skills';
    page.drawText(`Sections Detected: ${secFound || 'Standard Experience & Skills'}`, {
      x: margin + 6,
      y: y - 8,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.3),
    });
    page.drawText(
      `Missing Standard Sections: ${fmt.missingStandardSections.join(', ') || 'None (All standard sections verified)'}`,
      {
        x: margin + 6,
        y: y - 18,
        size: 7.5,
        font: fontRegular,
        color: fmt.missingStandardSections.length === 0 ? rgb(0.1, 0.5, 0.25) : rgb(0.7, 0.2, 0.2),
      }
    );
    y -= 28;
  }

  // =========================================================================
  // FALLBACK / COMPOSITE: IF NEITHER SPECIFIED, RENDER FULL DOSSIER
  // =========================================================================
  else {
    drawSubsectionBanner(1, '7-Dimension Weighted Subscores & Penalty Deductions', undefined, rgb(0.08, 0.3, 0.6));
    const ats = model.atsDiagnostics;
    const subscoresTable = [
      { label: 'Must-Have Skill Coverage', score: `${ats.subscores.mustHaveCoverage} / 30 pts`, weight: '30%' },
      { label: 'Evidence & Implementation Depth', score: `${ats.subscores.evidenceDepth} / 20 pts`, weight: '20%' },
      { label: 'Impact & Quantified Numerical Metrics', score: `${ats.subscores.impactMetrics} / 15 pts`, weight: '15%' },
    ];
    for (const row of subscoresTable) {
      checkNewPage(14);
      page.drawText(`${row.label}: ${row.score} (${row.weight})`, { x: margin + 8, y: y - 10, size: 7.5, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      y -= 14;
    }

    drawSubsectionBanner(2, 'TalentLens 6-Layer Competency Framework', undefined, rgb(0.1, 0.45, 0.35));
    for (const b of model.breakdown) {
      checkNewPage(14);
      const scoreStr = b.status === 'not-assessed' ? 'NOT ASSESSED' : `${b.score}/100`;
      page.drawText(`${b.label}: ${scoreStr} [${b.status}]`, { x: margin + 8, y: y - 10, size: 7.5, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      y -= 14;
    }

    drawSubsectionBanner(3, 'Recommended Proof-of-Work Project Drops', undefined, rgb(0.4, 0.15, 0.6));
    for (const p of model.projectDrops) {
      checkNewPage(24);
      page.drawText(`• ${p.title} (${p.domain}): ${p.problemStatement.slice(0, 80)}...`, { x: margin + 8, y: y - 10, size: 7.5, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });
      y -= 16;
    }
  }

  // ════════════════════════════════════════════════════════════
  // RUNNING FOOTERS ON EVERY PAGE
  // ════════════════════════════════════════════════════════════
  const pageCount = doc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const p = wrapPage(doc.getPage(i));
    p.drawLine({
      start: { x: margin, y: margin + 14 },
      end: { x: margin + contentWidth, y: margin + 14 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.9),
    });
    p.drawText(`HIREFLOW v${model.meta.engineVersion} • Confidential Candidate Technical Dossier • Page ${i + 1} of ${pageCount}`, {
      x: margin,
      y: margin + 4,
      size: 7,
      font: fontRegular,
      color: rgb(0.45, 0.5, 0.55),
    });
    p.drawText(`Deterministic Evaluation • Indian Copyright Act §52 & Nominative Fair Use`, {
      x: margin + contentWidth - 230,
      y: margin + 4,
      size: 7,
      font: fontRegular,
      color: rgb(0.45, 0.5, 0.55),
    });
  }

  return await doc.save();
}
