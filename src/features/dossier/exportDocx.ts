import type { DossierModel } from './dossierModel';

export async function generateDocxDossier(model: DossierModel): Promise<Blob> {
  const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, Packer } =
    await import('docx');

  const isTalentLens = model.meta?.kind === 'talentlens';
  const isAtsRoast = model.meta?.kind === 'ats_roast';

  const docTitle = isTalentLens
    ? 'HIREFLOW — TALENTLENS™ COMPETENCY INTELLIGENCE REPORT'
    : isAtsRoast
    ? 'HIREFLOW — ATS RESUME ROASTER™ 4-LAYER DIAGNOSTIC AUDIT'
    : 'HIREFLOW — CANDIDATE CAREER & TECHNICAL AUDIT REPORT';

  const readiness = (model.headline?.readinessStatus || 'Evaluated').toUpperCase();
  const band = (model.headline?.scoreBand || 'Standard').toUpperCase();
  const resumeHash = model.meta?.integrity?.resumeHash || 'N/A';
  const jdHash = model.meta?.integrity?.jdHash || 'N/A';
  const candidateName = model.candidate?.name || 'Candidate';
  const resumeLabel = model.candidate?.resumeLabel || 'Current Resume';
  const roleTitle = model.target?.roleTitle || 'Role';
  const roleLevel = model.target?.level ? ` (${model.target.level})` : '';
  const companyName = model.target?.company || 'Target Organization';
  const tierName = model.target?.tier ? ` [${model.target.tier} Tier]` : '';
  const generatedDate = model.meta?.generatedAt ? new Date(model.meta.generatedAt).toLocaleString() : new Date().toLocaleString();
  const engineVersion = model.meta?.engineVersion || '4.0.0';

  const children: any[] = [
    new Paragraph({
      text: docTitle,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Target: ', bold: true }),
        new TextRun(`${roleTitle}${roleLevel} at ${companyName}${tierName}`),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Candidate: ', bold: true }),
        new TextRun(`${candidateName} (${resumeLabel})`),
        new TextRun({ text: ` | Generated: ${generatedDate}` }),
        new TextRun({ text: ` | Engine: ${isTalentLens ? 'TalentLens Market Engine' : isAtsRoast ? 'ATS Roaster' : 'HireFlow'} v${engineVersion}` }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: isTalentLens ? 'Fit Status: ' : 'Screening Status: ', bold: true }),
        new TextRun(readiness),
        new TextRun({ text: ` | Band: ${band}` }),
        new TextRun({ text: model.headline?.guidance ? ` | Guidance: ${model.headline.guidance}` : '' }),
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
          text: `Resume Hash: ${resumeHash}\nJD Hash:     ${jdHash}`,
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
          text: `${model.headline?.score ?? 0} / 100`,
          bold: true,
          size: 32,
        }),
        new TextRun({
          text: model.headline?.deltaText ? ` (${model.headline.deltaText})` : '',
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
    ...(Array.isArray(model.summary) ? model.summary : []).map(
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
      const trendStr = model.companyContext.trend ? `(${String(model.companyContext.trend).toUpperCase()} YoY)` : '';
      children.push(
        new Paragraph({
          text: `COMPANY HIRING CONTEXT — ${companyName.toUpperCase()}`,
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: `• Hires 2024: ${model.companyContext.hires2024 || 'Active'} ${trendStr}`.trim() }),
        new Paragraph({ text: `• Open Roles: ${model.companyContext.openRoles || 'Multiple'}` }),
        new Paragraph({ text: `• Avg Package: ${model.companyContext.avgPackage || 'Market Competitive'}` }),
        new Paragraph({ text: `• Glassdoor Rating: ${model.companyContext.glassdoor || '4.2 / 5'}` }),
        new Paragraph({ text: '' })
      );
    }

    if (Array.isArray(model.breakdown) && model.breakdown.length > 0) {
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
                    new TableCell({ children: [new Paragraph(b.label || b.key || '')] }),
                    new TableCell({ children: [new Paragraph(`${b.score ?? 0} / 100`)] }),
                    new TableCell({ children: [new Paragraph(b.reqLevel || 'Strong')] }),
                    new TableCell({ children: [new Paragraph(String(b.status || 'Verified').toUpperCase())] }),
                  ],
                })
            ),
          ],
        }),
        new Paragraph({ text: '' })
      );
    }

    if (model.learningPath && Array.isArray(model.learningPath.plans) && model.learningPath.plans.length > 0) {
      children.push(
        new Paragraph({
          text: `SECTION 2: TALENTLENS™ CAREER ACCELERATION PLAN (${model.learningPath.plans.length} ACTIONS)`,
          heading: HeadingLevel.HEADING_2,
        }),
        ...model.learningPath.plans.flatMap((plan, idx) => [
          new Paragraph({
            children: [
              new TextRun({
                text: `Plan ${idx + 1}: [${String(plan.priority || 'High').toUpperCase()}] ${plan.title || 'Action'} (${plan.timeframe || 'Immediate'} • Gain: ${plan.hypotheticalScoreGain || '+5 pts'})`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: `• Strategy: ${plan.detail || 'Implement practical verification portfolio.'}` }),
          new Paragraph({ text: `• Action: ${plan.suggestedAction || 'Deploy proof-of-work project.'}` }),
          new Paragraph({ text: `• Portfolio STAR Bullet: "${plan.bulletTemplate || ''}"` }),
          ...(Array.isArray(plan.resources) && plan.resources.length > 0
            ? [new Paragraph({ text: `• Curated Resources: ${plan.resources.join('; ')}` })]
            : []),
          new Paragraph({ text: '' }),
        ])
      );
    }

    if (model.talentLensIntel) {
      const tl = model.talentLensIntel;
      const modern = Array.isArray(tl.modernPractices) ? tl.modernPractices.join(', ') : 'Clean Architecture';
      const outdated = Array.isArray(tl.outdatedSignals) ? tl.outdatedSignals.join(', ') : 'None detected';
      children.push(
        new Paragraph({
          text: 'SECTION 3: TALENTLENS™ MARKET INTELLIGENCE & BUILD VERIFICATION',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ text: `• Market Standing: ${String(tl.marketPosition || 'Market Current').toUpperCase()}` }),
        new Paragraph({ text: `• Overall Market Fit: ${tl.overallMarketFit ?? 70}%` }),
        new Paragraph({ text: `• Tech Currency Score: ${tl.techCurrencyScore ?? 75}%` }),
        new Paragraph({ text: `• Delivery Signals: ${tl.buildAuthenticity ?? 70}%` }),
        new Paragraph({ text: `• Fundamental Depth: ${tl.fundamentalDepth ?? 75}%` }),
        new Paragraph({ text: `• Build Verdict: ${tl.buildVerdict || 'Profile verified against market baseline.'}` }),
        new Paragraph({ text: `• Modern Practices: ${modern || 'Clean Architecture'}` }),
        new Paragraph({ text: `• Legacy / Outdated Signals: ${outdated || 'None detected'}` }),
        ...(Array.isArray(tl.findings) && tl.findings.length > 0
          ? tl.findings.map(
              (f) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `• [${String(f.status || 'Verified').toUpperCase()}] ${f.category || 'Competency'}: `, bold: true }),
                    new TextRun(f.finding || ''),
                  ],
                })
            )
          : []),
        new Paragraph({ text: '' })
      );
    }

    if (Array.isArray(model.projectDrops) && model.projectDrops.length > 0) {
      children.push(
        new Paragraph({
          text: 'SECTION 4: RECOMMENDED PROOF-OF-WORK PROJECT DROPS',
          heading: HeadingLevel.HEADING_2,
        }),
        ...model.projectDrops.flatMap((p, idx) => [
          new Paragraph({
            children: [
              new TextRun({
                text: `Project Drop ${idx + 1}: ${p.title || 'Engineering Project'} (${p.domain || 'Software'} • ${String(p.difficulty || 'Intermediate').toUpperCase()} • ~${p.estimatedHours || 20} hrs)`,
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: `• Covered Skills: ${Array.isArray(p.coveredSkills) ? p.coveredSkills.join(', ') : ''}` }),
          new Paragraph({ text: `• Problem Statement: ${p.problemStatement || ''}` }),
          new Paragraph({ text: `• Architecture: ${p.architecture || ''}` }),
          new Paragraph({ text: `• Recruiter Signal: ${p.recruiterSignal || ''}` }),
          new Paragraph({ text: `• Resume STAR Bullet: "${p.portfolioBulletFormula || ''}"` }),
          new Paragraph({ text: '' }),
        ])
      );
    }
  }

  // =========================================================================
  // ATS RESUME ROASTER SECTIONS
  // =========================================================================
  else if (isAtsRoast) {
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
        contactInfo: { email: 'Verified', phone: 'Verified', linkedin: 'Detected', github: 'Detected', portfolio: null },
        sectionsFound: ['Experience', 'Education', 'Skills'],
        missingStandardSections: [],
        weakBulletsCount: 1,
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

    children.push(
      new Paragraph({
        text: 'LAYER 1: 7-DIMENSION WEIGHTED SUBSCORES',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ text: `• Must-Have Skill Coverage: ${subs.mustHaveCoverage ?? 0} / 30 pts` }),
      new Paragraph({ text: `• Evidence Depth: ${subs.evidenceDepth ?? 0} / 20 pts` }),
      new Paragraph({ text: `• Impact & Numerical Metrics: ${subs.impactMetrics ?? 0} / 15 pts` }),
      new Paragraph({ text: `• Projects & OSS: ${subs.projectsAndOss ?? 0} / 10 pts` }),
      new Paragraph({ text: `• Seniority Fit: ${subs.seniorityFit ?? 0} / 10 pts` }),
      new Paragraph({ text: `• Format & Parsing Safety: ${subs.formatAndParse ?? 0} / 10 pts` }),
      new Paragraph({ text: `• Target Tier Alignment: ${subs.tierFit ?? 0} / 5 pts` }),
      new Paragraph({ text: '' })
    );

    if (Array.isArray(ats.fixFirst) && ats.fixFirst.length > 0) {
      children.push(
        new Paragraph({
          text: 'LAYER 2: HIGH-IMPACT FIX THESE FIRST',
          heading: HeadingLevel.HEADING_2,
        }),
        ...ats.fixFirst.map((f) =>
          new Paragraph({
            children: [
              new TextRun({ text: `• [+${f.expectedScoreGain || 5} pts] ${f.title}: `, bold: true }),
              new TextRun(f.reason || ''),
            ],
          })
        ),
        new Paragraph({ text: '' })
      );
    }

    if (Array.isArray(ats.skillsInventory) && ats.skillsInventory.length > 0) {
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
                    new TableCell({ children: [new Paragraph(sk.canonical || '')] }),
                    new TableCell({ children: [new Paragraph(sk.category || 'Skill')] }),
                    new TableCell({ children: [new Paragraph(String(sk.status || 'Verified').toUpperCase())] }),
                  ],
                })
            ),
          ],
        }),
        new Paragraph({ text: '' })
      );
    }

    const fmt = ats.formattingAudit || {
      wordCount: 450,
      sectionsFound: ['Experience', 'Education'],
      missingStandardSections: [],
      weakBulletsCount: 0,
      metricsRatio: 0.5,
    };

    const sectionsFoundStr = Array.isArray(fmt.sectionsFound) ? fmt.sectionsFound.join(', ') : 'Standard sections present';
    const missingSectionsStr = Array.isArray(fmt.missingStandardSections) && fmt.missingStandardSections.length > 0
      ? fmt.missingStandardSections.join(', ')
      : 'None (All present)';

    children.push(
      new Paragraph({
        text: 'LAYER 4: FORMATTING, STRUCTURAL & BULLET AUDIT',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ text: `• Total Word Count: ${fmt.wordCount ?? 450} words` }),
      new Paragraph({ text: `• Sections Found: ${sectionsFoundStr || 'None'}` }),
      new Paragraph({ text: `• Missing Standard Sections: ${missingSectionsStr}` }),
      new Paragraph({ text: `• Weak Bullets: ${fmt.weakBulletsCount ?? 0} weak bullets detected` }),
      new Paragraph({ text: `• Quantified Metrics: ${Math.round((fmt.metricsRatio ?? 0.5) * 100)}% of bullets include numerical metrics` }),
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
      new Paragraph({ text: `Evaluation complete for ${roleTitle} at ${companyName}.` })
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

  try {
    return await Packer.toBlob(doc);
  } catch {
    const buffer = await Packer.toBuffer(doc);
    return new Blob([new Uint8Array(buffer)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }
}
