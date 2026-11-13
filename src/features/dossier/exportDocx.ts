import type { DossierModel } from './dossierModel';

export async function generateDocxDossier(model: DossierModel): Promise<Blob> {
  const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, Packer } =
    await import('docx');

  const children = [
    new Paragraph({
      text: 'HIREFLOW — CANDIDATE CAREER DOSSIER',
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Target: ', bold: true }),
        new TextRun(`${model.target.roleTitle || 'Role'} at ${model.target.company || 'Company'}`),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Candidate: ', bold: true }),
        new TextRun(`${model.candidate.name} (${model.candidate.resumeLabel})`),
        new TextRun({ text: ` | Generated: ${new Date(model.meta.generatedAt).toLocaleDateString()}` }),
      ],
    }),
    new Paragraph({
      text: '',
    }),

    // Integrity
    new Paragraph({
      children: [
        new TextRun({ text: 'Cryptographic Snapshot Integrity (SHA-256):', bold: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Resume Hash: ${model.meta.integrity.resumeHash}\nJD Hash:     ${model.meta.integrity.jdHash}`, font: 'Courier New', size: 18 }),
      ],
    }),
    new Paragraph({
      text: '',
    }),

    // Fit Benchmark Score
    new Paragraph({
      text: 'FIT BENCHMARK SCORE',
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${model.headline.score} / 100`,
          bold: true,
          size: 32,
        }),
        new TextRun({
          text: model.headline.deltaText ? ` (${model.headline.deltaText})` : '',
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      text: '',
    }),

    // Executive Summary
    new Paragraph({
      text: 'EXECUTIVE SUMMARY',
      heading: HeadingLevel.HEADING_2,
    }),
    ...model.summary.map(
      (s) =>
        new Paragraph({
          children: [new TextRun({ text: `- ${s}` })],
        })
    ),
    new Paragraph({
      text: '',
    }),

    // Dimensional Breakdown
    new Paragraph({
      text: 'DIMENSIONAL BREAKDOWN',
      heading: HeadingLevel.HEADING_2,
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Dimension', bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Score', bold: true })] })] }),
          ],
        }),
        ...model.breakdown.map(
          (b) =>
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(b.label)] }),
                new TableCell({ children: [new Paragraph(`${b.score} / 100`)] }),
              ],
            })
        ),
      ],
    }),
    new Paragraph({
      text: '',
    }),

    // Verified Strengths
    new Paragraph({
      text: 'VERIFIED STRENGTHS',
      heading: HeadingLevel.HEADING_2,
    }),
    ...model.strengths.map(
      (st) =>
        new Paragraph({
          children: [new TextRun({ text: `+ ${st}` })],
        })
    ),
    new Paragraph({
      text: '',
    }),

    // Gaps
    new Paragraph({
      text: `CRITICAL GAPS (${model.gaps.open.length})`,
      heading: HeadingLevel.HEADING_2,
    }),
    ...model.gaps.open.map(
      (g) =>
        new Paragraph({
          children: [
            new TextRun({ text: `- [Severity ${g.severity}] ${g.label} (${g.category}): `, bold: true }),
            new TextRun(g.detail || ''),
          ],
        })
    ),
    new Paragraph({
      text: '',
    }),

    // Execution Plan
    new Paragraph({
      text: 'ACTION PLAN & BRIEF ITEMS',
      heading: HeadingLevel.HEADING_2,
    }),
    ...model.planned.map(
      (p) =>
        new Paragraph({
          children: [
            new TextRun({ text: `[${p.status.toUpperCase()}] `, bold: true }),
            new TextRun(`${p.title} (${p.kind.replace('_', ' ')})`),
          ],
        })
    ),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
