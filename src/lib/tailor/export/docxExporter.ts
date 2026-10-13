// ============================================================
// HIREFLOW REAL BINARY DOCX EXPORTER
// Compiles TailoredResume into authentic, ATS-compliant .docx binary
// Uses official 'docx' library with standard margins and bullet hierarchy
// ============================================================

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
  convertInchesToTwip
} from 'docx';
import { TailoredResume, CandidateProfile } from '../types';

export async function generateDocxBlob(
  resume: TailoredResume,
  candidate: CandidateProfile
): Promise<Blob | Uint8Array> {
  const children: Paragraph[] = [];

  // 1. Candidate Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: candidate.fullName.toUpperCase(),
          bold: true,
          size: 32, // 16pt
          font: 'Calibri'
        })
      ]
    })
  );

  // Subheader / Contact line
  const contactParts: string[] = [];
  if (candidate.contact.email) contactParts.push(candidate.contact.email);
  if (candidate.contact.phone) contactParts.push(candidate.contact.phone);
  if (candidate.contact.location) contactParts.push(candidate.contact.location);
  if (candidate.contact.linkedin) contactParts.push(candidate.contact.linkedin.replace(/^https?:\/\//, ''));
  if (candidate.contact.github) contactParts.push(candidate.contact.github.replace(/^https?:\/\//, ''));

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 19, // 9.5pt
            font: 'Calibri',
            color: '444444'
          })
        ]
      })
    );
  }

  // 2. Sections
  for (const section of resume.sections) {
    if (!section.visible) continue;

    // Section Heading with bottom border
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        border: {
          bottom: {
            color: '2B579A',
            space: 4,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            font: 'Calibri',
            color: '1A365D'
          })
        ]
      })
    );

    // Summary Text
    if (section.content.summaryText) {
      children.push(
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: section.content.summaryText,
              size: 20, // 10pt
              font: 'Calibri'
            })
          ]
        })
      );
    }

    // Skills by Category
    if (section.content.skillsByCategory) {
      for (const [category, skills] of Object.entries(section.content.skillsByCategory)) {
        if (skills.length === 0) continue;
        children.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: `${category}: `,
                bold: true,
                size: 20,
                font: 'Calibri'
              }),
              new TextRun({
                text: skills.join(', '),
                size: 20,
                font: 'Calibri'
              })
            ]
          })
        );
      }
    }

    // Section Entries (Experience, Education, Projects)
    if (section.content.entries) {
      for (const entry of section.content.entries) {
        // Entry title line (Primary + Date)
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: entry.primaryTitle,
                bold: true,
                size: 21,
                font: 'Calibri'
              }),
              new TextRun({
                text: entry.secondaryTitle ? `  —  ${entry.secondaryTitle}` : '',
                italics: true,
                size: 20,
                font: 'Calibri',
                color: '333333'
              }),
              new TextRun({
                text: entry.dateRange ? `\t${entry.dateRange}` : '',
                bold: true,
                size: 19,
                font: 'Calibri',
                color: '555555'
              })
            ]
          })
        );

        // Subtitle / Location if available
        if (entry.location) {
          children.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: entry.location,
                  italics: true,
                  size: 18,
                  font: 'Calibri',
                  color: '666666'
                })
              ]
            })
          );
        }

        // Bullets
        if (entry.bullets) {
          for (const b of entry.bullets) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { after: 60, line: 260 },
                children: [
                  new TextRun({
                    text: b.text,
                    size: 20, // 10pt
                    font: 'Calibri'
                  })
                ]
              })
            );
          }
        }
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
              right: convertInchesToTwip(0.55)
            }
          }
        },
        children
      }
    ]
  });

  if (typeof window !== 'undefined') {
    return await Packer.toBlob(doc);
  } else {
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}

/**
 * Triggers a real browser download of the generated DOCX file
 */
export async function downloadResumeAsDocx(
  resume: TailoredResume,
  candidate: CandidateProfile,
  fileName?: string
): Promise<void> {
  const blob = await generateDocxBlob(resume, candidate);
  const name = fileName || `${candidate.fullName.replace(/\s+/g, '_')}_Tailored_Resume.docx`;

  if (typeof window !== 'undefined' && blob instanceof Blob) {
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
