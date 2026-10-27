// ============================================================
// DOCX Fixture Generator using docx & JSZip
// 100% Deterministic (fixed zip timestamps and formatting)
// ============================================================

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
} from 'docx';
import JSZip from 'jszip';
import { CandidateProfileData, FixtureTruth, LayoutFamilyId } from './types';
import { SeededPRNG } from './prng';

const STATIC_DATE = new Date(1704067200000); // 2024-01-01T00:00:00.000Z

async function normalizeDocxZip(
  rawBuf: Buffer | Uint8Array,
  modifier?: (zip: JSZip) => Promise<void>
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(rawBuf);
  if (modifier) {
    await modifier(zip);
  }

  // 1. Overwrite dynamic timestamps inside docProps/core.xml
  const coreFile = zip.file('docProps/core.xml');
  if (coreFile) {
    let xml = await coreFile.async('text');
    xml = xml.replace(
      /<dcterms:created[^>]*>.*?<\/dcterms:created>/g,
      '<dcterms:created xsi:type="dcterms:W3CDTF">2024-01-01T00:00:00.000Z</dcterms:created>'
    );
    xml = xml.replace(
      /<dcterms:modified[^>]*>.*?<\/dcterms:modified>/g,
      '<dcterms:modified xsi:type="dcterms:W3CDTF">2024-01-01T00:00:00.000Z</dcterms:modified>'
    );
    zip.file('docProps/core.xml', xml);
  }

  // 2. Set all zip entries to static date
  zip.forEach((_relPath, file) => {
    file.date = STATIC_DATE;
  });

  const repacked = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    date: STATIC_DATE,
  });
  return repacked;
}

export async function generateDocxFixture(
  candidate: CandidateProfileData,
  family: LayoutFamilyId,
  variantIndex: number,
  prng: SeededPRNG,
  fixtureId: string
): Promise<{ buffer: Uint8Array; truth: FixtureTruth }> {
  // Family L: Corrupt DOCX
  if (family === 'l_corrupt_encrypted') {
    return generateCorruptDocx(candidate, variantIndex, fixtureId);
  }

  const linesList: string[] = [];
  const bulletsTruth: FixtureTruth['bullets'] = [];
  const sectionsTruth: FixtureTruth['sections'] = [];
  const datesTruth: FixtureTruth['dates'] = [];
  const warnings: string[] = [];

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const paragraphs: (Paragraph | Table)[] = [];

  function recordSection(canonical: string, start: number, end: number) {
    sectionsTruth.push({ canonical, startLine: start, endLine: end });
  }

  // --- HEADER & CONTACT ---
  const headStart = linesList.length + 1;
  let contactStr = `${candidate.email}  |  ${candidate.phone}  |  ${candidate.github}  |  ${candidate.linkedin}  |  ${candidate.portfolio}`;
  if (family === 'f_decorative_bullets') {
    contactStr = `✉ ${candidate.email}  |  ☎ ${candidate.phone}  |  ${candidate.github}  |  ${candidate.linkedin}  |  ${candidate.portfolio}`;
  }

  if (family === 'd_textbox_header') {
    // Name & contact are positioned exclusively inside the drawing textbox (w:txbxContent)
    linesList.push(fullName);
    linesList.push(contactStr);
    recordSection('Contact', headStart, linesList.length);
  } else {
    paragraphs.push(
      new Paragraph({
        text: fullName,
        heading: HeadingLevel.TITLE,
        spacing: { after: 120 },
      })
    );
    linesList.push(fullName);
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: contactStr, size: 19 })],
        spacing: { after: 240 },
      })
    );
    linesList.push(contactStr);
    recordSection('Contact', headStart, linesList.length);
  }

  // --- SUMMARY ---
  const sumStart = linesList.length + 1;
  paragraphs.push(
    new Paragraph({
      text: 'PROFESSIONAL SUMMARY',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 },
    })
  );
  linesList.push('PROFESSIONAL SUMMARY');

  paragraphs.push(
    new Paragraph({
      text: candidate.summary,
      spacing: { after: 200 },
    })
  );
  linesList.push(candidate.summary);
  recordSection('Summary', sumStart, linesList.length);

  // --- EDUCATION ---
  const eduStart = linesList.length + 1;
  const eduHeading = family === 'j_indian_fresher' ? 'ACADEMIC QUALIFICATIONS' : 'EDUCATION';
  paragraphs.push(
    new Paragraph({
      text: eduHeading,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 },
    })
  );
  linesList.push(eduHeading);

  for (const edu of candidate.education) {
    const degLine = `${edu.degree} — ${edu.institution}`;
    const yearLine = `${edu.startYear} - ${edu.endYear}`;
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: degLine, bold: true }),
          new TextRun({ text: `    (${yearLine})`, italics: true }),
        ],
        spacing: { after: 60 },
      })
    );
    linesList.push(`${degLine} (${yearLine})`);

    let scoreLine = `Grade: CGPA ${edu.cgpaOrPercent}`;
    if (family === 'j_indian_fresher' && edu.tenthScore && edu.twelfthScore) {
      scoreLine += ` | Class XII: ${edu.twelfthScore} | Class X: ${edu.tenthScore}`;
    }
    paragraphs.push(
      new Paragraph({
        text: scoreLine,
        spacing: { after: 160 },
      })
    );
    linesList.push(scoreLine);
  }
  recordSection('Education', eduStart, linesList.length);

  // --- EXPERIENCE ---
  const expStart = linesList.length + 1;
  paragraphs.push(
    new Paragraph({
      text: 'WORK EXPERIENCE',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 },
    })
  );
  linesList.push('WORK EXPERIENCE');

  for (const exp of candidate.experience) {
    const roleLine = `${exp.role} — ${exp.company}, ${exp.location}`;
    const dateStr = `${exp.startDate} - ${exp.endDate}`;
    datesTruth.push({ start: exp.startDate, end: exp.endDate, isCurrent: exp.isCurrent });

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: roleLine, bold: true }),
          new TextRun({ text: `  |  ${dateStr}`, italics: true }),
        ],
        spacing: { after: 80 },
      })
    );
    linesList.push(`${roleLine} | ${dateStr}`);

    for (const b of exp.bullets) {
      let bulletChar = '•';
      if (family === 'f_decorative_bullets') {
        const decor = ['•', '●', '▪', '–', '➢', '✓', '►'];
        bulletChar = decor[variantIndex % decor.length];
      }

      let processedBullet = b;
      if (family === 'g_ligatures_hyphens') {
        processedBullet = b
          .replace(/fi/g, '\uFB01')
          .replace(/fl/g, '\uFB02')
          .replace(/ff/g, '\uFB00')
          .replace(/service/g, 'ser\u00ADvice');
      }

      paragraphs.push(
        new Paragraph({
          text: `${bulletChar} ${processedBullet}`,
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
      linesList.push(`• ${processedBullet}`);
      bulletsTruth.push({ text: b, section: 'Experience', entry: exp.company });
    }
  }
  recordSection('Experience', expStart, linesList.length);

  // --- PROJECTS ---
  const projStart = linesList.length + 1;
  paragraphs.push(
    new Paragraph({
      text: 'PROJECTS',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 },
    })
  );
  linesList.push('PROJECTS');

  for (const proj of candidate.projects) {
    const pTitle = `${proj.title} [${proj.techStack.join(', ')}]`;
    paragraphs.push(
      new Paragraph({
        text: pTitle,
        children: [new TextRun({ text: pTitle, bold: true })],
        spacing: { after: 60 },
      })
    );
    linesList.push(pTitle);

    for (const b of proj.bullets) {
      paragraphs.push(
        new Paragraph({
          text: `• ${b}`,
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
      linesList.push(`• ${b}`);
      bulletsTruth.push({ text: b, section: 'Projects', entry: proj.title });
    }
  }
  recordSection('Projects', projStart, linesList.length);

  // --- SKILLS ---
  const skillsStart = linesList.length + 1;
  paragraphs.push(
    new Paragraph({
      text: 'TECHNICAL SKILLS',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 },
    })
  );
  linesList.push('TECHNICAL SKILLS');

  if (family === 'c_table_skills') {
    // Render Skills inside a Word OpenXML Table
    warnings.push('table-layout');
    const tableRows: TableRow[] = [];

    for (const s of candidate.skills) {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: s.category, bold: true })] })],
            }),
            new TableCell({
              width: { size: 6000, type: WidthType.DXA },
              children: [new Paragraph({ text: s.skills.join(', ') })],
            }),
          ],
        })
      );
      linesList.push(`${s.category}: ${s.skills.join(', ')}`);
    }

    const skillsTable = new Table({
      rows: tableRows,
      width: { size: 9000, type: WidthType.DXA },
    });
    paragraphs.push(skillsTable);
  } else {
    for (const s of candidate.skills) {
      const sLine = `${s.category}: ${s.skills.join(', ')}`;
      paragraphs.push(
        new Paragraph({
          text: sLine,
          spacing: { after: 60 },
        })
      );
      linesList.push(sLine);
    }
  }
  recordSection('Skills', skillsStart, linesList.length);

  // Indian fresher extra sections
  if (family === 'j_indian_fresher') {
    const achStart = linesList.length + 1;
    paragraphs.push(
      new Paragraph({
        text: 'KEY ACHIEVEMENTS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    linesList.push('KEY ACHIEVEMENTS');
    for (const ach of candidate.achievements || []) {
      paragraphs.push(new Paragraph({ text: `• ${ach}`, bullet: { level: 0 } }));
      linesList.push(`• ${ach}`);
      bulletsTruth.push({ text: ach, section: 'Achievements' });
    }
    recordSection('Achievements', achStart, linesList.length);

    const porStart = linesList.length + 1;
    paragraphs.push(
      new Paragraph({
        text: 'POSITIONS OF RESPONSIBILITY',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    linesList.push('POSITIONS OF RESPONSIBILITY');
    for (const por of candidate.responsibilities || []) {
      paragraphs.push(new Paragraph({ text: `• ${por}`, bullet: { level: 0 } }));
      linesList.push(`• ${por}`);
      bulletsTruth.push({ text: por, section: 'Positions of Responsibility' });
    }
    recordSection('Positions of Responsibility', porStart, linesList.length);

    const declStart = linesList.length + 1;
    paragraphs.push(
      new Paragraph({
        text: 'DECLARATION',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );
    linesList.push('DECLARATION');
    paragraphs.push(new Paragraph({ text: candidate.declaration || '' }));
    linesList.push(candidate.declaration || '');
    recordSection('Declaration', declStart, linesList.length);
  }

  // Document configuration
  const docConfig: any = {
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  };

  if (family === 'h_multipage_header_footer') {
    warnings.push('header-footer-content');
    docConfig.sections[0].headers = {
      default: new Header({
        children: [
          new Paragraph({
            text: `${fullName} — Curriculum Vitae`,
            spacing: { after: 120 },
          }),
        ],
      }),
    };
    docConfig.sections[0].footers = {
      default: new Footer({
        children: [
          new Paragraph({
            text: 'Confidential Resume • Page 1 of 2',
          }),
        ],
      }),
    };
  }

  const doc = new Document(docConfig);
  let rawBuf = await Packer.toBuffer(doc);

  // FAMILY D: Textbox Header injection in document.xml via JSZip
  if (family === 'd_textbox_header') {
    warnings.push('text-box');
    rawBuf = await normalizeDocxZip(rawBuf, async (zip) => {
      const docXmlFile = zip.file('word/document.xml');
      if (docXmlFile) {
        let xml = await docXmlFile.async('text');
        // Wrap contact info inside w:txbxContent
        const textBoxXml = `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${fullName}</w:t></w:p><w:p><w:r><w:t>${contactStr}</w:t></w:r></w:p>`;
        const drawingTextBox = `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="5000000" cy="1000000"/><wp:docPr id="1" name="TextBox 1"/><wps:wsp xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"><wps:txbx><w:txbxContent>${textBoxXml}</w:txbxContent></wps:txbx></wps:wsp></wp:inline></w:drawing></w:r></w:p>`;

        // Insert at beginning of body
        xml = xml.replace('<w:body>', `<w:body>${drawingTextBox}`);
        zip.file('word/document.xml', xml);
      }
    });
  } else {
    rawBuf = await normalizeDocxZip(rawBuf);
  }

  const truth: FixtureTruth = {
    id: fixtureId,
    name: fullName,
    email: candidate.email,
    phone: candidate.phone,
    links: [candidate.github, candidate.linkedin, candidate.portfolio],
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
    format: 'docx',
    fullGroundTruthText: linesList.join('\n'),
  };

  return { buffer: new Uint8Array(rawBuf), truth };
}

// Family L: Corrupted DOCX
async function generateCorruptDocx(
  candidate: CandidateProfileData,
  variantIndex: number,
  fixtureId: string
): Promise<{ buffer: Uint8Array; truth: FixtureTruth }> {
  let bytes: Uint8Array;
  if (variantIndex === 0) {
    // Truncated zip header
    bytes = Buffer.from('PK\x03\x04\x14\x00\x00\x00\x08\x00TruncatedZipBytes');
  } else {
    // Corrupt zip entry
    bytes = Buffer.from('PK\x03\x04\xFF\xFF\xFF\xFF\x00\x00CorruptZipEntryPayload');
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
    expectedWarnings: ['corrupt'],
    layoutFamily: 'l_corrupt_encrypted',
    format: 'docx',
    fullGroundTruthText: '',
    isCorruptOrEncrypted: true,
  };
  return { buffer: bytes, truth };
}
