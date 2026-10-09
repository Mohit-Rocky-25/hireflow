// ============================================================
// Tailor Engine — ATS-Safe Professional DOCX Export
// ============================================================

import { ResumeDocModel } from './docModel';

export async function generateDocxBlob(model: ResumeDocModel): Promise<Blob> {
  // Dynamically import docx to keep bundle lightweight
  const docx = await import('docx');
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    TabStopType,
    BorderStyle
  } = docx;

  const children: any[] = [];

  // 1. Header — Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: model.contact.name || 'Candidate Name',
          bold: true,
          size: 36, // 18pt
          font: 'Calibri'
        })
      ]
    })
  );

  // Contact line: email | phone | headline | links
  const contactParts: string[] = [];
  if (model.contact.email) contactParts.push(model.contact.email);
  if (model.contact.phone) contactParts.push(model.contact.phone);
  if (model.contact.location) contactParts.push(model.contact.location);
  if (model.contact.headline) contactParts.push(model.contact.headline);
  if (model.contact.links) contactParts.push(...model.contact.links);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: contactParts.join('  |  '),
            size: 20, // 10pt
            color: '4B5563',
            font: 'Calibri'
          })
        ]
      })
    );
  }

  const createSectionHeader = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: '374151',
          space: 4,
          style: BorderStyle.SINGLE,
          size: 6
        }
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22, // 11pt
          font: 'Calibri',
          color: '111827'
        })
      ]
    });
  };

  // 2. Professional Summary
  if (model.summary) {
    children.push(createSectionHeader('Professional Summary'));
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [
          new TextRun({
            text: model.summary,
            size: 21, // 10.5pt
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // 3. Experience
  if (model.experience.length > 0) {
    children.push(createSectionHeader('Work Experience'));
    for (const exp of model.experience) {
      // Role & Company + Right-aligned Dates using tab stops
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: 9000 // right margin tab
            }
          ],
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
              size: 22,
              font: 'Calibri'
            }),
            new TextRun({
              text: exp.company ? `  —  ${exp.company}` : '',
              italics: true,
              size: 22,
              font: 'Calibri'
            }),
            new TextRun({
              text: exp.dates ? `\t${exp.dates}` : '',
              size: 20,
              color: '4B5563',
              font: 'Calibri'
            })
          ]
        })
      );

      // Bullets
      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: bullet.text,
                size: 21, // 10.5pt
                font: 'Calibri'
              })
            ]
          })
        );
      }
    }
  }

  // 4. Projects
  if (model.projects.length > 0) {
    children.push(createSectionHeader('Projects'));
    for (const proj of model.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 60 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: 9000
            }
          ],
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 22,
              font: 'Calibri'
            }),
            new TextRun({
              text: proj.linkOrTech ? `\t${proj.linkOrTech}` : '',
              italics: true,
              size: 20,
              color: '4B5563',
              font: 'Calibri'
            })
          ]
        })
      );

      for (const bullet of proj.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: bullet.text,
                size: 21,
                font: 'Calibri'
              })
            ]
          })
        );
      }
    }
  }

  // 5. Skills
  if (model.skills.length > 0) {
    children.push(createSectionHeader('Technical Skills'));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: model.skills.join('  •  '),
            size: 21,
            font: 'Calibri'
          })
        ]
      })
    );
  }

  // 6. Education
  if (model.education.length > 0) {
    children.push(createSectionHeader('Education'));
    for (const edu of model.education) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 60 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: 9000
            }
          ],
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
              font: 'Calibri'
            }),
            new TextRun({
              text: edu.institution ? `  —  ${edu.institution}` : '',
              size: 21,
              font: 'Calibri'
            }),
            new TextRun({
              text: edu.year ? `\t${edu.year}` : '',
              size: 20,
              color: '4B5563',
              font: 'Calibri'
            })
          ]
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,    // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
