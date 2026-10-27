// ============================================================
// PDF Fixture Generator using pdf-lib
// 100% Deterministic (fixed metadata timestamps, seeded styling)
// ============================================================

import { PDFDocument, StandardFonts, rgb, PDFName, PDFDict, PDFString, PDFArray } from 'pdf-lib';
import { CandidateProfileData, FixtureTruth, LayoutFamilyId } from './types';
import { SeededPRNG } from './prng';

const STATIC_DATE = new Date(1704067200000); // 2024-01-01T00:00:00.000Z

export async function generatePdfFixture(
  candidate: CandidateProfileData,
  family: LayoutFamilyId,
  variantIndex: number,
  prng: SeededPRNG,
  fixtureId: string
): Promise<{ buffer: Uint8Array; truth: FixtureTruth }> {
  // Family K: Image-only PDF (No text operators, just an embedded image or vector shapes)
  if (family === 'k_image_only') {
    return generateImageOnlyPdf(candidate, fixtureId);
  }

  // Family L: Corrupt or Encrypted PDF
  if (family === 'l_corrupt_encrypted') {
    return generateCorruptOrEncryptedPdf(candidate, variantIndex, fixtureId);
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setCreationDate(STATIC_DATE);
  pdfDoc.setModificationDate(STATIC_DATE);
  pdfDoc.setTitle(`${candidate.firstName} ${candidate.lastName} - Resume`);
  pdfDoc.setAuthor(`${candidate.firstName} ${candidate.lastName}`);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_WIDTH = 612; // Letter
  const PAGE_HEIGHT = 792;
  const MARGIN_LEFT = family === 'e_latex_dense' ? 36 : 50;
  const MARGIN_RIGHT = family === 'e_latex_dense' ? 576 : 562;

  let currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let currentY = PAGE_HEIGHT - 50;

  const linesList: string[] = [];
  const bulletsTruth: FixtureTruth['bullets'] = [];
  const sectionsTruth: FixtureTruth['sections'] = [];
  const datesTruth: FixtureTruth['dates'] = [];
  const warnings: string[] = [];

  const fullName = `${candidate.firstName} ${candidate.lastName}`;

  // Helper to ensure page space
  function ensureSpace(needed: number) {
    if (currentY - needed < 50) {
      if (family === 'h_multipage_header_footer') {
        // Draw page 1 footer
        drawFooter(currentPage, 1, 2);
      }
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentY = PAGE_HEIGHT - 50;
      if (family === 'h_multipage_header_footer') {
        // Draw page 2 header
        drawHeader(currentPage, fullName, 2, 2);
        currentY -= 35;
      }
    }
  }

  function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
        cur = test;
      } else {
        if (cur) lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    return lines.length > 0 ? lines : [text];
  }

  function drawHeader(page: typeof currentPage, name: string, pageNum: number, total: number) {
    const text = `${name} — Page ${pageNum} of ${total}`;
    page.drawText(text, {
      x: 50,
      y: PAGE_HEIGHT - 35,
      size: 9,
      font: fontOblique,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  function drawFooter(page: typeof currentPage, pageNum: number, total: number) {
    const text = `Confidential Resume • Page ${pageNum} of ${total}`;
    page.drawText(text, {
      x: PAGE_WIDTH / 2 - 80,
      y: 25,
      size: 8,
      font: fontOblique,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  function recordSection(canonical: string, start: number, end: number) {
    sectionsTruth.push({ canonical, startLine: start, endLine: end });
  }

  // --- LAYOUT RENDERING ---

  if (family === 'b_two_col_sidebar') {
    // Two column layout
    warnings.push('multi-column');

    // Full width Header
    const headStartLine = linesList.length + 1;
    currentPage.drawText(fullName, {
      x: MARGIN_LEFT,
      y: currentY,
      size: 20,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    linesList.push(fullName);
    currentY -= 25;

    const contactLine = `${candidate.email}  |  ${candidate.phone}  |  ${candidate.github}  |  ${candidate.linkedin}  |  ${candidate.portfolio}`;
    currentPage.drawText(contactLine, {
      x: MARGIN_LEFT,
      y: currentY,
      size: 7.0,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });
    linesList.push(contactLine);
    currentY -= 30;
    recordSection('Contact', headStartLine, linesList.length);

    // Left Column X: 50..220 | Right Column X: 240..560
    const col1X = 50;
    const col2X = 240;
    let col1Y = currentY;
    let col2Y = currentY;

    // LEFT COLUMN: Education & Skills
    const eduStart = linesList.length + 1;
    currentPage.drawText('EDUCATION', { x: col1X, y: col1Y, size: 11, font: fontBold });
    linesList.push('EDUCATION');
    col1Y -= 16;
    for (const edu of candidate.education) {
      const wrappedDeg = wrapText(edu.degree, 170, fontBold, 9);
      for (const dl of wrappedDeg) {
        currentPage.drawText(dl, { x: col1X, y: col1Y, size: 9, font: fontBold });
        col1Y -= 12;
      }
      linesList.push(edu.degree);
      col1Y -= 1;

      const wrappedInst = wrapText(edu.institution, 170, fontRegular, 8);
      for (const il of wrappedInst) {
        currentPage.drawText(il, { x: col1X, y: col1Y, size: 8, font: fontRegular });
        col1Y -= 11;
      }
      linesList.push(edu.institution);
      col1Y -= 1;

      const grade = `CGPA: ${edu.cgpaOrPercent} (${edu.startYear}-${edu.endYear})`;
      currentPage.drawText(grade, { x: col1X, y: col1Y, size: 8, font: fontRegular });
      linesList.push(grade);
      col1Y -= 18;
    }
    recordSection('Education', eduStart, linesList.length);

    const skillsStart = linesList.length + 1;
    currentPage.drawText('SKILLS', { x: col1X, y: col1Y, size: 11, font: fontBold });
    linesList.push('SKILLS');
    col1Y -= 16;
    for (const sGroup of candidate.skills) {
      currentPage.drawText(sGroup.category, { x: col1X, y: col1Y, size: 8.5, font: fontBold });
      linesList.push(sGroup.category);
      col1Y -= 12;
      const sList = sGroup.skills.join(', ');
      const wrappedSkills = wrapText(sList, 170, fontRegular, 8);
      for (const wLine of wrappedSkills) {
        currentPage.drawText(wLine, { x: col1X, y: col1Y, size: 8, font: fontRegular });
        col1Y -= 11;
      }
      linesList.push(sList);
      col1Y -= 5;
    }
    recordSection('Skills', skillsStart, linesList.length);

    // RIGHT COLUMN: Experience & Projects
    const expStart = linesList.length + 1;
    currentPage.drawText('EXPERIENCE', { x: col2X, y: col2Y, size: 11, font: fontBold });
    linesList.push('EXPERIENCE');
    col2Y -= 16;

    for (const exp of candidate.experience) {
      const expHead = `${exp.role} — ${exp.company}`;
      const expDates = `${exp.startDate} - ${exp.endDate}`;
      currentPage.drawText(expHead, { x: col2X, y: col2Y, size: 9.5, font: fontBold });
      currentPage.drawText(expDates, { x: 440, y: col2Y, size: 8.5, font: fontOblique });
      linesList.push(`${expHead} ${expDates}`);
      datesTruth.push({ start: exp.startDate, end: exp.endDate, isCurrent: exp.isCurrent });
      col2Y -= 14;

      for (const b of exp.bullets) {
        const wrapped = wrapText(`• ${b}`, 315, fontRegular, 8);
        for (const wl of wrapped) {
          currentPage.drawText(wl, { x: col2X + 6, y: col2Y, size: 8, font: fontRegular });
          col2Y -= 12;
        }
        linesList.push(`• ${b}`);
        bulletsTruth.push({ text: b, section: 'Experience', entry: exp.company });
        col2Y -= 4;
      }
      col2Y -= 8;
    }
    recordSection('Experience', expStart, linesList.length);

    const projStart = linesList.length + 1;
    currentPage.drawText('PROJECTS', { x: col2X, y: col2Y, size: 11, font: fontBold });
    linesList.push('PROJECTS');
    col2Y -= 16;

    for (const proj of candidate.projects) {
      const pHead = `${proj.title} [${proj.techStack.join(', ')}]`;
      const wrappedPHead = wrapText(pHead, 330, fontBold, 9);
      for (const phl of wrappedPHead) {
        currentPage.drawText(phl, { x: col2X, y: col2Y, size: 9, font: fontBold });
        col2Y -= 12;
      }
      linesList.push(pHead);
      col2Y -= 2;

      for (const b of proj.bullets) {
        const wrapped = wrapText(`• ${b}`, 315, fontRegular, 8);
        for (const wl of wrapped) {
          currentPage.drawText(wl, { x: col2X + 6, y: col2Y, size: 8, font: fontRegular });
          col2Y -= 12;
        }
        linesList.push(`• ${b}`);
        bulletsTruth.push({ text: b, section: 'Projects', entry: proj.title });
        col2Y -= 4;
      }
      col2Y -= 6;
    }
    recordSection('Projects', projStart, linesList.length);
  } else {
    // Single column families (a, c, e, f, g, h, i, j)

    // Header
    if (family === 'h_multipage_header_footer') {
      drawHeader(currentPage, fullName, 1, 2);
      currentY -= 35;
    }

    const headStart = linesList.length + 1;
    currentPage.drawText(fullName, {
      x: MARGIN_LEFT,
      y: currentY,
      size: family === 'e_latex_dense' ? 18 : 22,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    linesList.push(fullName);
    currentY -= 24;

    // Contact info line
    let glyphPhone = candidate.phone;
    let glyphEmail = candidate.email;
    if (family === 'f_decorative_bullets') {
      glyphPhone = `Tel: ${candidate.phone}`;
      glyphEmail = `Email: ${candidate.email}`;
    }
    let contactLine = `${glyphEmail} | ${glyphPhone} | ${candidate.github} | ${candidate.linkedin} | ${candidate.portfolio}`;
    if (family === 'i_annotated_links') {
      contactLine = `${glyphEmail} | ${glyphPhone} | GitHub | LinkedIn | Portfolio`;
    }
    currentPage.drawText(contactLine, {
      x: MARGIN_LEFT,
      y: currentY,
      size: family === 'e_latex_dense' ? 7.2 : 7.0,
      font: fontRegular,
      color: rgb(0.25, 0.25, 0.25),
    });
    linesList.push(contactLine);
    currentY -= 24;
    recordSection('Contact', headStart, linesList.length);

    // Summary Section
    const sumStart = linesList.length + 1;
    ensureSpace(60);
    currentPage.drawText('PROFESSIONAL SUMMARY', { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
    linesList.push('PROFESSIONAL SUMMARY');
    currentY -= 16;
    const maxSummaryWidth = MARGIN_RIGHT - MARGIN_LEFT;
    const wrappedSummary = wrapText(candidate.summary, maxSummaryWidth, fontRegular, 8.5);
    for (const sLine of wrappedSummary) {
      ensureSpace(16);
      currentPage.drawText(sLine, { x: MARGIN_LEFT, y: currentY, size: 8.5, font: fontRegular });
      currentY -= 13;
    }
    linesList.push(candidate.summary);
    currentY -= 12;
    recordSection('Summary', sumStart, linesList.length);

    // Education Section
    const eduStart = linesList.length + 1;
    ensureSpace(80);
    const eduTitle = family === 'j_indian_fresher' ? 'ACADEMIC QUALIFICATIONS' : 'EDUCATION';
    currentPage.drawText(eduTitle, { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
    linesList.push(eduTitle);
    currentY -= 16;

    for (const edu of candidate.education) {
      const degLine = `${edu.degree} — ${edu.institution}`;
      const yearRange = `${edu.startYear} - ${edu.endYear}`;
      const rightX = MARGIN_RIGHT - 80;

      currentPage.drawText(degLine, { x: MARGIN_LEFT, y: currentY, size: 9, font: fontBold });
      currentPage.drawText(yearRange, { x: rightX, y: currentY, size: 8.5, font: fontOblique });
      linesList.push(`${degLine}  ${yearRange}`);
      currentY -= 14;

      let scoreLine = `Cumulative Grade Point Average: ${edu.cgpaOrPercent}`;
      if (family === 'j_indian_fresher' && edu.tenthScore && edu.twelfthScore) {
        scoreLine += ` | Class XII: ${edu.twelfthScore} | Class X: ${edu.tenthScore}`;
      }
      currentPage.drawText(scoreLine, { x: MARGIN_LEFT, y: currentY, size: 8.5, font: fontRegular });
      linesList.push(scoreLine);
      currentY -= 20;
    }
    recordSection('Education', eduStart, linesList.length);

    // Experience Section
    const expStart = linesList.length + 1;
    if (family === 'h_multipage_header_footer') {
      drawFooter(currentPage, 1, 2);
      currentPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentY = PAGE_HEIGHT - 50;
      drawHeader(currentPage, fullName, 2, 2);
      currentY -= 35;
    } else {
      ensureSpace(120);
    }
    currentPage.drawText('WORK EXPERIENCE', { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
    linesList.push('WORK EXPERIENCE');
    currentY -= 16;

    for (const exp of candidate.experience) {
      const roleLine = `${exp.role} — ${exp.company}, ${exp.location}`;
      const dateStr = `${exp.startDate} - ${exp.endDate}`;
      datesTruth.push({ start: exp.startDate, end: exp.endDate, isCurrent: exp.isCurrent });

      currentPage.drawText(roleLine, { x: MARGIN_LEFT, y: currentY, size: 9.5, font: fontBold });
      currentPage.drawText(dateStr, { x: MARGIN_RIGHT - 90, y: currentY, size: 8.5, font: fontOblique });
      linesList.push(`${roleLine}  ${dateStr}`);
      currentY -= 15;

      for (const bullet of exp.bullets) {
        ensureSpace(24);
        let bulletPrefix = '• ';
        if (family === 'f_decorative_bullets') {
          const decorBullets = ['•', '–', '—', '*', '>', '~', '§'];
          bulletPrefix = `${decorBullets[variantIndex % decorBullets.length]} `;
        }

        let processedBullet = bullet;
        if (family === 'g_ligatures_hyphens') {
          // Add soft hyphens (\u00AD is supported in WinAnsi)
          processedBullet = bullet
            .replace(/config/g, 'con\u00ADfig')
            .replace(/optimization/g, 'opti\u00ADmization')
            .replace(/throughput/g, 'through\u00ADput')
            .replace(/architecture/g, 'archi\u00ADtecture');
        }

        const fullBulletStr = `${bulletPrefix}${processedBullet}`;
        const maxBulletWidth = MARGIN_RIGHT - MARGIN_LEFT - 12;
        const wrappedBullet = wrapText(fullBulletStr, maxBulletWidth, fontRegular, 8.5);
        for (const wb of wrappedBullet) {
          ensureSpace(14);
          currentPage.drawText(wb, { x: MARGIN_LEFT + 8, y: currentY, size: 8.5, font: fontRegular });
          currentY -= 13;
        }
        linesList.push(fullBulletStr);
        bulletsTruth.push({ text: bullet, section: 'Experience', entry: exp.company });
        currentY -= 3;
      }
      currentY -= 6;
    }
    recordSection('Experience', expStart, linesList.length);

    // Projects Section
    const projStart = linesList.length + 1;
    ensureSpace(120);
    currentPage.drawText('TECHNICAL PROJECTS', { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
    linesList.push('TECHNICAL PROJECTS');
    currentY -= 16;

    for (const proj of candidate.projects) {
      ensureSpace(40);
      const projHeader = `${proj.title} | Technologies: ${proj.techStack.join(', ')}`;
      currentPage.drawText(projHeader, { x: MARGIN_LEFT, y: currentY, size: 9, font: fontBold });
      linesList.push(projHeader);
      currentY -= 14;

      for (const bullet of proj.bullets) {
        ensureSpace(22);
        let bulletPrefix = '• ';
        if (family === 'f_decorative_bullets') {
          bulletPrefix = '> ';
        }

        const fullProjBullet = `${bulletPrefix}${bullet}`;
        const maxProjBulletWidth = MARGIN_RIGHT - MARGIN_LEFT - 12;
        const wrappedProjBullet = wrapText(fullProjBullet, maxProjBulletWidth, fontRegular, 8.5);
        for (const wpb of wrappedProjBullet) {
          ensureSpace(14);
          currentPage.drawText(wpb, { x: MARGIN_LEFT + 8, y: currentY, size: 8.5, font: fontRegular });
          currentY -= 13;
        }
        linesList.push(fullProjBullet);
        bulletsTruth.push({ text: bullet, section: 'Projects', entry: proj.title });
        currentY -= 3;
      }
      currentY -= 6;
    }
    recordSection('Projects', projStart, linesList.length);

    // Skills Section
    const skillsStart = linesList.length + 1;
    ensureSpace(80);
    currentPage.drawText('TECHNICAL SKILLS', { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
    linesList.push('TECHNICAL SKILLS');
    currentY -= 16;

    for (const s of candidate.skills) {
      const sLine = `${s.category}: ${s.skills.join(', ')}`;
      currentPage.drawText(sLine, { x: MARGIN_LEFT, y: currentY, size: 8.5, font: fontRegular });
      linesList.push(sLine);
      currentY -= 14;
    }
    recordSection('Skills', skillsStart, linesList.length);

    // Freshers sections for Indian Fresher family
    if (family === 'j_indian_fresher') {
      ensureSpace(80);
      const achStart = linesList.length + 1;
      currentPage.drawText('ACHIEVEMENTS & HONORS', { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
      linesList.push('ACHIEVEMENTS & HONORS');
      currentY -= 16;
      for (const ach of candidate.achievements || []) {
        const fullAch = `• ${ach}`;
        const wrappedAch = wrapText(fullAch, MARGIN_RIGHT - MARGIN_LEFT - 12, fontRegular, 8.5);
        for (const wa of wrappedAch) {
          ensureSpace(14);
          currentPage.drawText(wa, { x: MARGIN_LEFT + 8, y: currentY, size: 8.5, font: fontRegular });
          currentY -= 13;
        }
        linesList.push(fullAch);
        bulletsTruth.push({ text: ach, section: 'Achievements' });
        currentY -= 3;
      }
      recordSection('Achievements', achStart, linesList.length);

      ensureSpace(80);
      const porStart = linesList.length + 1;
      currentPage.drawText('POSITIONS OF RESPONSIBILITY', { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
      linesList.push('POSITIONS OF RESPONSIBILITY');
      currentY -= 16;
      for (const por of candidate.responsibilities || []) {
        const fullPor = `• ${por}`;
        const wrappedPor = wrapText(fullPor, MARGIN_RIGHT - MARGIN_LEFT - 12, fontRegular, 8.5);
        for (const wp of wrappedPor) {
          ensureSpace(14);
          currentPage.drawText(wp, { x: MARGIN_LEFT + 8, y: currentY, size: 8.5, font: fontRegular });
          currentY -= 13;
        }
        linesList.push(fullPor);
        bulletsTruth.push({ text: por, section: 'Positions of Responsibility' });
        currentY -= 3;
      }
      recordSection('Positions of Responsibility', porStart, linesList.length);

      ensureSpace(40);
      const declStart = linesList.length + 1;
      currentPage.drawText('DECLARATION', { x: MARGIN_LEFT, y: currentY, size: 11, font: fontBold });
      linesList.push('DECLARATION');
      currentY -= 16;
      currentPage.drawText(candidate.declaration || '', { x: MARGIN_LEFT, y: currentY, size: 8, font: fontOblique });
      linesList.push(candidate.declaration || '');
      recordSection('Declaration', declStart, linesList.length);
    }

    if (family === 'h_multipage_header_footer') {
      drawFooter(currentPage, 2, 2);
    }
  }

  // Set link annotations for family i (or everywhere applicable)
  const linksTruth: string[] = [candidate.github, candidate.linkedin, candidate.portfolio];
  if (family === 'i_annotated_links') {
    // Add real PDF link annotations for all candidate links
    try {
      const pageDict = currentPage.node;
      const context = pdfDoc.context;
      let annots = pageDict.lookup(PDFName.of('Annots')) as PDFArray;
      if (!annots) {
        annots = context.obj([]) as PDFArray;
        pageDict.set(PDFName.of('Annots'), annots);
      }
      const linksToAnnotate = [
        candidate.github,
        candidate.linkedin,
        candidate.portfolio,
      ];
      let annotX = 50;
      for (const linkUrl of linksToAnnotate) {
        const annotDict = context.obj({
          Type: 'Annot',
          Subtype: 'Link',
          Rect: [annotX, currentY, annotX + 80, currentY + 15],
          A: {
            Type: 'Action',
            S: 'URI',
            URI: PDFString.of(linkUrl),
          },
        });
        const annotRef = context.register(annotDict);
        annots.push(annotRef);
        annotX += 90;
      }
    } catch {
      // ignore
    }
  }

  const pdfBytes = await pdfDoc.save();

  const truth: FixtureTruth = {
    id: fixtureId,
    name: fullName,
    email: candidate.email,
    phone: candidate.phone,
    links: linksTruth,
    sections: sectionsTruth,
    bullets: bulletsTruth,
    dates: datesTruth,
    education: candidate.education.map((e) => ({
      degree: e.degree,
      institution: e.institution,
      cgpaOrPercent: e.cgpaOrPercent,
      scale: 'cgpa10',
    })),
    skillsText: candidate.skills.flatMap((s) => s.skills),
    expectedWarnings: warnings,
    layoutFamily: family,
    format: 'pdf',
    fullGroundTruthText: linesList.join('\n'),
  };

  return { buffer: pdfBytes, truth };
}

// Family K: Image-only PDF with zero text operators
async function generateImageOnlyPdf(
  candidate: CandidateProfileData,
  fixtureId: string
): Promise<{ buffer: Uint8Array; truth: FixtureTruth }> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setCreationDate(STATIC_DATE);
  pdfDoc.setModificationDate(STATIC_DATE);
  const page = pdfDoc.addPage([612, 792]);

  // Draw 1x1 transparent/white pixel PNG image stretched across page (representing scanned raster image)
  const base64Png =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const imgBytes = Buffer.from(base64Png, 'base64');
  const embeddedImg = await pdfDoc.embedPng(imgBytes);
  page.drawImage(embeddedImg, { x: 0, y: 0, width: 612, height: 792 });

  const bytes = await pdfDoc.save();
  const truth: FixtureTruth = {
    id: fixtureId,
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone,
    links: [],
    sections: [],
    bullets: [],
    dates: [],
    education: [],
    skillsText: [],
    expectedWarnings: ['image-only'],
    layoutFamily: 'k_image_only',
    format: 'pdf',
    fullGroundTruthText: '',
    isImageOnly: true,
  };
  return { buffer: bytes, truth };
}

// Family L: Corrupt or Encrypted PDF
async function generateCorruptOrEncryptedPdf(
  candidate: CandidateProfileData,
  variantIndex: number,
  fixtureId: string
): Promise<{ buffer: Uint8Array; truth: FixtureTruth }> {
  let bytes: Uint8Array;
  const warnings: string[] = [];

  if (variantIndex === 0) {
    // Encrypted PDF with standard trailer /Encrypt
    const rawPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
4 0 obj
<< /Filter /Standard /V 2 /R 3 /U <0000000000000000000000000000000000000000000000000000000000000000> /O <0000000000000000000000000000000000000000000000000000000000000000> /P -4 >>
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000187 00000 n 
trailer
<< /Size 5 /Root 1 0 R /Encrypt 4 0 R /ID [<12345678901234567890123456789012><12345678901234567890123456789012>] >>
startxref
340
%%EOF`;
    bytes = Buffer.from(rawPdf, 'utf-8');
    warnings.push('encrypted');
  } else if (variantIndex === 1) {
    // Truncated PDF (cut off midway)
    bytes = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1', 'utf-8');
    warnings.push('corrupt');
  } else {
    // Corrupt random bytes with PDF header
    bytes = Buffer.from('%PDF-1.4\n\xFF\xFE\x00\x00CorruptGarbageStream\x00\xFF\xFE\xFD\xFC', 'latin1');
    warnings.push('corrupt');
  }

  const truth: FixtureTruth = {
    id: fixtureId,
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone,
    links: [],
    sections: [],
    bullets: [],
    dates: [],
    education: [],
    skillsText: [],
    expectedWarnings: warnings,
    layoutFamily: 'l_corrupt_encrypted',
    format: 'pdf',
    fullGroundTruthText: '',
    isCorruptOrEncrypted: true,
  };
  return { buffer: bytes, truth };
}
