// ============================================================
// HIREFLOW DOCX VECTOR RENDERER (STAGE 7)
// Compiles ResumeDocumentTree into an authentic, ATS-compliant DOCX binary
// Uses 'docx' library with standard margins and bullet hierarchy.
// Zero runtime network egress. 100% deterministic.
// ============================================================

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  Packer,
  convertInchesToTwip,
} from 'docx';
import { ResumeDocumentTree } from '../../types';
import { sanitizeTextForPdf } from '../unicode';

export async function renderTreeToDocxBytes(tree: ResumeDocumentTree): Promise<Uint8Array> {
  const children: Paragraph[] = [];

  // 1. Candidate Name Header
  const cleanName = sanitizeTextForPdf(tree.candidate.fullName || 'Candidate');
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: cleanName.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: 'Calibri',
          color: '111827',
        }),
      ],
    })
  );

  // 2. Candidate Contact Line
  const contactParts: string[] = [];
  if (tree.candidate.email) contactParts.push(tree.candidate.email);
  if (tree.candidate.phone) contactParts.push(tree.candidate.phone);
  if (tree.candidate.location) contactParts.push(tree.candidate.location);
  if (tree.candidate.linkedin) contactParts.push(tree.candidate.linkedin.replace(/^https?:\/\//, ''));
  if (tree.candidate.github) contactParts.push(tree.candidate.github.replace(/^https?:\/\//, ''));

  if (contactParts.length > 0) {
    const contactText = sanitizeTextForPdf(contactParts.join('  |  '));
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactText,
            size: 19, // 9.5pt floor
            font: 'Calibri',
            color: '4B5563',
          }),
        ],
      })
    );
  }

  // 3. Sections
  for (const section of tree.sections) {
    if (!section.visible) continue;

    const sectionTitle = sanitizeTextForPdf(section.title.toUpperCase());
    children.push(
      new Paragraph({
        spacing: { before: 240, after: 80 },
        children: [
          new TextRun({
            text: sectionTitle,
            bold: true,
            size: 22, // 11pt
            font: 'Calibri',
            color: '1E3A8A', // Deep navy
          }),
        ],
      })
    );

    // Summary Text
    if (section.summaryText) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: sanitizeTextForPdf(section.summaryText),
              size: 20, // 10pt
              font: 'Calibri',
              color: '1F2937',
            }),
          ],
        })
      );
    }

    // Skills By Category
    if (section.skillsByCategory) {
      for (const [catName, skills] of Object.entries(section.skillsByCategory)) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `${sanitizeTextForPdf(catName)}: `,
                bold: true,
                size: 20,
                font: 'Calibri',
                color: '111827',
              }),
              new TextRun({
                text: sanitizeTextForPdf(skills.join(', ')),
                size: 20,
                font: 'Calibri',
                color: '374151',
              }),
            ],
          })
        );
      }
    }

    // Entries
    for (const entry of section.entries) {
      const entryTitle = sanitizeTextForPdf(entry.title);
      const entrySubtitle = entry.subtitle ? sanitizeTextForPdf(entry.subtitle) : '';
      const entryDates = entry.dates ? sanitizeTextForPdf(entry.dates) : '';

      const titleRuns: TextRun[] = [
        new TextRun({
          text: entryTitle,
          bold: true,
          size: 20,
          font: 'Calibri',
          color: '111827',
        }),
      ];

      if (entrySubtitle) {
        titleRuns.push(
          new TextRun({
            text: ` — ${entrySubtitle}`,
            size: 20,
            font: 'Calibri',
            color: '374151',
          })
        );
      }

      if (entryDates) {
        titleRuns.push(
          new TextRun({
            text: ` (${entryDates})`,
            italics: true,
            size: 19,
            font: 'Calibri',
            color: '6B7280',
          })
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: titleRuns,
        })
      );

      // Bullets
      for (const bullet of entry.bullets) {
        const cleanBullet = sanitizeTextForPdf(bullet.text);
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: cleanBullet,
                size: 20, // 10pt
                font: 'Calibri',
                color: '374151',
              }),
            ],
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.5),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.55),
              right: convertInchesToTwip(0.55),
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}

