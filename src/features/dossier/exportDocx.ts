import type { DossierModel } from './dossierModel';

export async function generateDocxDossier(model: DossierModel): Promise<Blob> {
  const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, Packer } =
    await import('docx');

  const isTalentLens = model.meta.kind === 'talentlens';
  const isAtsRoast = model.meta.kind === 'ats_roast';

  const docTitle = isTalentLens
    ? 'HIREFLOW — TALENTLENS™ COMPETENCY INTELLIGENCE REPORT'
    : isAtsRoast
    ? 'HIREFLOW — ATS RESUME ROASTER™ 4-LAYER DIAGNOSTIC AUDIT'
    : 'HIREFLOW — CANDIDATE CAREER & TECHNICAL AUDIT REPORT';

  const children: any[] = [
    new Paragraph({
      text: docTitle,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Target: ', bold: true }),
        new TextRun(
          `${model.target.roleTitle || 'Role'}${model.target.level ? ` (${model.target.level})` : ''} at ${model.target.company || 'Company'}${model.target.tier ? ` [${model.target.tier} Tier]` : ''}`
        ),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Candidate: ', bold: true }),
        new TextRun(`${model.candidate.name} (${model.candidate.resumeLabel})`),
        new TextRun({ text: ` | Generated: ${new Date(model.meta.generatedAt).toLocaleString()}` }),
        new TextRun({ text: ` | Engine: ${isTalentLens ? 'TalentLens Market Engine' : isAtsRoast ? 'ATS Roaster' : 'HireFlow'} v${model.meta.engineVersion}` }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: isTalentLens ? 'Fit Status: ' : 'Screening Status: ', bold: true }),
        new TextRun(`${model.headline.readinessStatus.toUpperCase()}`),
        new TextRun({ text: ` | Band: ${model.headline.scoreBand.toUpperCase()}` }),
        new TextRun({ text: model.headline.guidance ? ` | Guidance: ${model.headline.guidance}` : '' }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Integrity
    new Paragraph({
      children: [
        new TextRun({ text: 'Cryptographic Snapshot Integrity (SHA-256):', bold: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Resume Hash: ${model.meta.integrity.resumeHash}\nJD Hash:     ${model.meta.integrity.jdHash}`,
          font: 'Courier New',
          size: 16,
        }),
      ],
    }),
    new Paragraph({ text: '' }),

    // Benchmark Score
    new Paragraph({
      text: isTalentLens ? 'BENCHMARK FIT SCORE' : 'ATS SCREENING SCORE',
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
    new Paragraph({ text: '' }),

    // Executive Summary
    new Paragraph({
      text: isTalentLens ? 'EXECUTIVE BENCHMARK & HIRING BAR CALIBRATION' : 'EXECUTIVE SCREENING ROAST SUMMARY',
      heading: HeadingLevel.HEADING_2,
    }),
    ...model.summary.map(
      (s) =>
        new Paragraph({
          children: [new TextRun({ text: `• ${s}` })],
        })
    ),
    new Paragraph({ text: '' }),
  ];

  // =========================================================================
  // TALENTLENS SECTIONS
  // =========================================================================
  if (isTalentLens) {
    if (model.companyContext) {
      children.push(
        new Paragraph({
          text: `COMPANY HIRING CONTEXT — ${model.target.company || 'TARGET ORGANIZATION'}`,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: `• Hires 2024: ${model.companyContext.hires2024 || 'Active'} ${model.companyContext.trend ? `(${model.companyContext.trend.toUpperCase()} YoY)` : ''}` }),
        new Paragraph({ text: `• Open Roles: ${model.companyContext.openRoles || 'Multiple'}` }),
        new Paragraph({ text: `• Avg Package: ${model.companyContext.avgPackage || 'Market Competitive'}` }),
        new Paragraph({ text: `• Glassdoor Rating: ${model.companyContext.glassdoor || '4.2 / 5'}` }),
        new Paragraph({ text: '' })
      );
    }

    children.push(
      new Paragraph({
        text: 'SECTION 1: MULTI-LAYER COMPETENCY FRAMEWORK BREAKDOWN',
        heading: HeadingLevel.HEADING_2,
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Competency', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Score', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Required', bold: true })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] }),
            ],
          }),
          ...model.breakdown.map(
            (b) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(b.label)] }),
                  new TableCell({ children: [new Paragraph(`${b.score} / 100`)] }),
                  new TableCell({ children: [new Paragraph(b.reqLevel || 'Strong')] }),
                  new TableCell({ children: [new Paragraph((b.status || 'Verified').toUpperCase())] }),
                ],
              })
          ),
        ],
      }),
      new Paragraph({ text: '' })
    );

    if (model.learningPath && model.learningPath.plans.length > 0) {
      children.push(
        new Paragraph({
          text: `SECTION 2: TALENTLENS™ CAREER ACCELERATION PLAN (${model.learningPath.plans.length} ACTIONS)`,
          heading: HeadingLevel.HEADING_2,
        }),
        ...model.learningPath.plans.flatMap((plan, idx) => [
          new Paragraph({
            children: [
              new TextRun({ text: `Plan ${idx + 1}: [${plan.priority.toUpperCase()}] ${plan.title} (${plan.timeframe} • Gain: ${plan.hypotheticalScoreGain})`, bold: true }),
            ],
          }),
          new Paragraph({ text: `• Strategy: ${plan.detail}` }),
          new Paragraph({ text: `• Action: ${plan.suggestedAction}` }),
          new Paragraph({ text: `• Portfolio STAR Bullet: "${plan.bulletTemplate}"` }),
          ...(plan.resources && plan.resources.length > 0
            ? [new Paragraph({ text: `• Curated Resources: ${plan.resources.join('; ')}` })]
            : []),
          new Paragraph({ text: '' }),
        ])
      );
    }

    if (model.talentLensIntel) {
      const tl = model.talentLensIntel;
      children.push(
        new Paragraph({
          text: 'SECTION 3: TALENTLENS™ MARKET INTELLIGENCE & BUILD VERIFICATION',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: `• Market Standing: ${tl.marketPosition.toUpperCase()}` }),
        new Paragraph({ text: `• Overall Market Fit: ${tl.overallMarketFit}%` }),
        new Paragraph({ text: `• Tech Currency Score: ${tl.techCurrencyScore}%` }),
        new Paragraph({ text: `• Delivery Signals: ${tl.buildAuthenticity}%` }),
        new Paragraph({ text: `• Fundamental Depth: ${tl.fundamentalDepth}%` }),
        new Paragraph({ text: `• Build Verdict: ${tl.buildVerdict}` }),
        new Paragraph({ text: `• Modern Practices: ${tl.modernPractices.join(', ') || 'Clean Architecture'}` }),
        new Paragraph({ text: `• Legacy / Outdated Signals: ${tl.outdatedSignals.join(', ') || 'None detected'}` }),
        ...(tl.findings && tl.findings.length > 0
          ? tl.findings.map(
              (f) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `• [${f.status.toUpperCase()}] ${f.category}: `, bold: true }),
                    new TextRun(f.finding),
                  ],
                })
            )
          : []),
        new Paragraph({ text: '' })
      );
    }

    if (model.projectDrops && model.projectDrops.length > 0) {
      children.push(
        new Paragraph({
          text: 'SECTION 4: RECOMMENDED PROOF-OF-WORK PROJECT DROPS',
          heading: HeadingLevel.HEADING_2,
        }),
        ...model.projectDrops.flatMap((p, idx) => [
          new Paragraph({
            children: [new TextRun({ text: `Project Drop ${idx + 1}: ${p.title} (${p.domain} • ${p.difficulty.toUpperCase()} • ~${p.estimatedHours} hrs)`, bold: true })],
          }),
          new Paragraph({ text: `• Covered Skills: ${p.coveredSkills.join(', ')}` }),
          new Paragraph({ text: `• Problem Statement: ${p.problemStatement}` }),
          new Paragraph({ text: `• Architecture: ${p.architecture}` }),
          new Paragraph({ text: `• Recruiter Signal: ${p.recruiterSignal}` }),
          new Paragraph({ text: `• Resume STAR Bullet: "${p.portfolioBulletFormula}"` }),
          new Paragraph({ text: '' }),
        ])
      );
    }
  }

  // =========================================================================
  // ATS RESUME ROASTER SECTIONS
  // =========================================================================
  else if (isAtsRoast) {
    const ats = model.atsDiagnostics;
    children.push(
      new Paragraph({
        text: 'LAYER 1: 7-DIMENSION WEIGHTED SUBSCORES',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ text: `• Must-Have Skill Coverage: ${ats.subscores.mustHaveCoverage} / 30 pts` }),
      new Paragraph({ text: `• Evidence Depth: ${ats.subscores.evidenceDepth} / 20 pts` }),
      new Paragraph({ text: `• Impact & Numerical Metrics: ${ats.subscores.impactMetrics} / 15 pts` }),
      new Paragraph({ text: `• Projects & OSS: ${ats.subscores.projectsAndOss} / 10 pts` }),
      new Paragraph({ text: `• Seniority Fit: ${ats.subscores.seniorityFit} / 10 pts` }),
      new Paragraph({ text: `• Format & Parsing Safety: ${ats.subscores.formatAndParse} / 10 pts` }),
      new Paragraph({ text: `• Target Tier Alignment: ${ats.subscores.tierFit} / 5 pts` }),
      new Paragraph({ text: '' })
    );

    if (ats.fixFirst.length > 0) {
      children.push(
        new Paragraph({
          text: 'LAYER 2: HIGH-IMPACT FIX THESE FIRST',
          heading: HeadingLevel.HEADING_2,
        }),
        ...ats.fixFirst.map((f) =>
          new Paragraph({
            children: [
              new TextRun({ text: `• [+${f.expectedScoreGain} pts] ${f.title}: `, bold: true }),
              new TextRun(f.reason),
            ],
          })
        ),
        new Paragraph({ text: '' })
      );
    }

    if (ats.skillsInventory.length > 0) {
      children.push(
        new Paragraph({
          text: 'LAYER 3: TARGET JOB SKILLS INVENTORY',
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Skill', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] }),
              ],
            }),
            ...ats.skillsInventory.slice(0, 15).map(
              (sk) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(sk.canonical)] }),
                    new TableCell({ children: [new Paragraph(sk.category)] }),
                    new TableCell({ children: [new Paragraph(sk.status.toUpperCase())] }),
                  ],
                })
            ),
          ],
        }),
        new Paragraph({ text: '' })
      );
    }

    children.push(
      new Paragraph({
        text: 'LAYER 4: FORMATTING, STRUCTURAL & BULLET AUDIT',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ text: `• Total Word Count: ${ats.formattingAudit.wordCount} words` }),
      new Paragraph({ text: `• Sections Found: ${ats.formattingAudit.sectionsFound.join(', ') || 'None'}` }),
      new Paragraph({ text: `• Missing Standard Sections: ${ats.formattingAudit.missingStandardSections.join(', ') || 'None (All present)'}` }),
      new Paragraph({ text: `• Weak Bullets: ${ats.formattingAudit.weakBulletsCount} weak bullets detected` }),
      new Paragraph({ text: `• Quantified Metrics: ${Math.round(ats.formattingAudit.metricsRatio * 100)}% of bullets include numerical metrics` }),
      new Paragraph({ text: '' })
    );
  }

  // Fallback
  else {
    children.push(
      new Paragraph({
        text: 'TECHNICAL CAREER DOSSIER SUMMARY',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ text: `Evaluation complete for ${model.target.roleTitle} at ${model.target.company}.` })
    );
  }

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
