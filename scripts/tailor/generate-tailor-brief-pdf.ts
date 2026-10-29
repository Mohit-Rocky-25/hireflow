// ============================================================
// HIREFLOW PDF GENERATOR: TAILOR MY RESUME COMPLETE CONTEXTUAL BRIEF
// Compiles full architectural & contextual documentation into an
// authentic, high-resolution multi-page PDF document using pdf-lib.
// ============================================================

import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb, RGB } from 'pdf-lib';

async function generateBriefPdf() {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.setTitle('HireFlow - Tailor My Resume Complete Contextual Brief');
  pdfDoc.setAuthor('HireFlow Engineering Architecture Team');
  pdfDoc.setSubject('Complete Contextual & Architectural Specification for Tailor My Resume Studio');
  pdfDoc.setProducer('HireFlow Documentation & Vector Publishing Engine');
  pdfDoc.setCreator('HireFlow v4.0.0');

  const regularFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedStandardFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595.28; // Standard A4
  const pageHeight = 841.89;
  const marginX = 42;
  const marginTop = 50;
  const marginBottom = 45;
  const contentWidth = pageWidth - 2 * marginX;

  // Color Palette
  const colorPrimary: RGB = rgb(0.05, 0.12, 0.28); // Deep Navy (#0D1F47)
  const colorAccent: RGB = rgb(0.00, 0.45, 0.85); // Electric Blue (#0073D9)
  const colorVolt: RGB = rgb(0.72, 0.95, 0.05); // HireFlow Volt (#B8F20D)
  const colorText: RGB = rgb(0.12, 0.15, 0.20); // Dark Slate (#1F2633)
  const colorMuted: RGB = rgb(0.42, 0.46, 0.54); // Muted Slate (#6B758A)
  const colorCardBg: RGB = rgb(0.96, 0.97, 0.99); // Light Gray Surface (#F5F7FC)
  const colorCardBorder: RGB = rgb(0.85, 0.88, 0.93); // Light Border (#D9E0ED)
  const colorTableHdrBg: RGB = rgb(0.91, 0.94, 0.98); // Table Header Background
  const colorWhite: RGB = rgb(1, 1, 1);
  const colorGreen: RGB = rgb(0.05, 0.55, 0.25);
  const colorRed: RGB = rgb(0.75, 0.10, 0.10);

  let pages: any[] = [];
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  pages.push(currentPage);
  let y = pageHeight - marginTop;

  function ensureSpace(neededHeight: number) {
    if (y - neededHeight < marginBottom) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pages.push(currentPage);
      y = pageHeight - marginTop;
      drawRunningHeader();
    }
  }

  function drawRunningHeader() {
    currentPage.drawText('HIREFLOW ARCHITECTURAL DOCUMENTATION — TAILOR MY RESUME BRIEF', {
      x: marginX,
      y: pageHeight - 28,
      size: 7.5,
      font: boldFont,
      color: colorMuted,
    });
    currentPage.drawLine({
      start: { x: marginX, y: pageHeight - 33 },
      end: { x: pageWidth - marginX, y: pageHeight - 33 },
      thickness: 0.5,
      color: colorCardBorder,
    });
  }

  function sanitize(text: string): string {
    return text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2022\u25E6\u2023]/g, '*')
      .replace(/[^\x00-\x7F]/g, ' ');
  }

  function wrapTextLines(text: string, maxWidth: number, font: any, fontSize: number): string[] {
    const clean = sanitize(text);
    const words = clean.replace(/\s+/g, ' ').trim().split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(candidate, fontSize);
      if (width <= maxWidth) {
        currentLine = candidate;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function drawParagraph(text: string, fontSize = 9.2, font = regularFont, color = colorText, lineGap = 13.5) {
    const lines = wrapTextLines(text, contentWidth, font, fontSize);
    for (const line of lines) {
      ensureSpace(lineGap);
      currentPage.drawText(line, {
        x: marginX,
        y: y,
        size: fontSize,
        font: font,
        color: color,
      });
      y -= lineGap;
    }
    y -= 3;
  }

  function drawBullet(text: string, prefix = '•', indent = 14, fontSize = 9.0) {
    const clean = sanitize(text);
    const maxW = contentWidth - indent;
    const lines = wrapTextLines(clean, maxW, regularFont, fontSize);

    ensureSpace(lines.length * 13 + 3);
    currentPage.drawText(prefix, {
      x: marginX + 4,
      y: y,
      size: fontSize,
      font: boldFont,
      color: colorAccent,
    });

    for (let i = 0; i < lines.length; i++) {
      currentPage.drawText(lines[i], {
        x: marginX + indent,
        y: y,
        size: fontSize,
        font: regularFont,
        color: colorText,
      });
      y -= 13;
    }
    y -= 2;
  }

  function drawSectionHeading(num: string, title: string) {
    ensureSpace(42);
    y -= 8;
    // Decorative colored background bar
    currentPage.drawRectangle({
      x: marginX,
      y: y - 18,
      width: contentWidth,
      height: 24,
      color: colorPrimary,
    });
    currentPage.drawText(`${num}. ${title.toUpperCase()}`, {
      x: marginX + 10,
      y: y - 11,
      size: 11,
      font: boldFont,
      color: colorWhite,
    });
    y -= 28;
  }

  function drawSubheading(title: string) {
    ensureSpace(26);
    y -= 5;
    currentPage.drawText(title, {
      x: marginX,
      y: y,
      size: 10.5,
      font: boldFont,
      color: colorAccent,
    });
    currentPage.drawLine({
      start: { x: marginX, y: y - 3 },
      end: { x: marginX + contentWidth, y: y - 3 },
      thickness: 0.5,
      color: colorCardBorder,
    });
    y -= 15;
  }

  function drawCallout(title: string, bodyText: string, borderColor = colorAccent) {
    const lines = wrapTextLines(bodyText, contentWidth - 24, regularFont, 8.8);
    const boxHeight = lines.length * 12.5 + 28;
    ensureSpace(boxHeight + 8);

    currentPage.drawRectangle({
      x: marginX,
      y: y - boxHeight,
      width: contentWidth,
      height: boxHeight,
      color: colorCardBg,
      borderColor: colorCardBorder,
      borderWidth: 1,
    });

    // Left accent bar
    currentPage.drawRectangle({
      x: marginX,
      y: y - boxHeight,
      width: 4,
      height: boxHeight,
      color: borderColor,
    });

    currentPage.drawText(title.toUpperCase(), {
      x: marginX + 12,
      y: y - 14,
      size: 8.5,
      font: boldFont,
      color: borderColor,
    });

    let textY = y - 26;
    for (const line of lines) {
      currentPage.drawText(line, {
        x: marginX + 12,
        y: textY,
        size: 8.8,
        font: regularFont,
        color: colorText,
      });
      textY -= 12.5;
    }
    y -= boxHeight + 8;
  }

  function drawTable(headers: string[], rows: string[][], colWidths: number[]) {
    const rowH = 18;
    ensureSpace(rowH * (rows.length + 1) + 12);

    // Header Row
    let curX = marginX;
    currentPage.drawRectangle({
      x: marginX,
      y: y - rowH,
      width: contentWidth,
      height: rowH,
      color: colorTableHdrBg,
      borderColor: colorCardBorder,
      borderWidth: 0.5,
    });

    for (let i = 0; i < headers.length; i++) {
      currentPage.drawText(headers[i], {
        x: curX + 6,
        y: y - 13,
        size: 8.5,
        font: boldFont,
        color: colorPrimary,
      });
      curX += colWidths[i];
    }
    y -= rowH;

    // Body Rows
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      ensureSpace(rowH + 5);

      const isEven = r % 2 === 0;
      currentPage.drawRectangle({
        x: marginX,
        y: y - rowH,
        width: contentWidth,
        height: rowH,
        color: isEven ? colorWhite : colorCardBg,
        borderColor: colorCardBorder,
        borderWidth: 0.5,
      });

      curX = marginX;
      for (let c = 0; c < row.length; c++) {
        const cellText = sanitize(row[c]);
        currentPage.drawText(cellText, {
          x: curX + 6,
          y: y - 13,
          size: 8.0,
          font: c === 0 ? boldFont : regularFont,
          color: colorText,
        });
        curX += colWidths[c];
      }
      y -= rowH;
    }
    y -= 8;
  }

  // ==========================================
  // COVER / TITLE BLOCK
  // ==========================================
  // Top Banner
  currentPage.drawRectangle({
    x: marginX,
    y: y - 85,
    width: contentWidth,
    height: 85,
    color: colorPrimary,
  });

  currentPage.drawText('HIREFLOW PRODUCTION ATS PLATFORM v4.0.0', {
    x: marginX + 16,
    y: y - 24,
    size: 9.5,
    font: boldFont,
    color: colorVolt,
  });

  currentPage.drawText('TAILOR MY RESUME STUDIO', {
    x: marginX + 16,
    y: y - 48,
    size: 20,
    font: boldFont,
    color: colorWhite,
  });

  currentPage.drawText('COMPLETE CONTEXTUAL BRIEF, ARCHITECTURE, CONNECTIONS & DATA DICTIONARY', {
    x: marginX + 16,
    y: y - 68,
    size: 8.5,
    font: regularFont,
    color: rgb(0.85, 0.90, 0.98),
  });

  y -= 102;

  // Metadata Card
  drawCallout(
    'Executive System Invariants',
    '100% Client-Side Reactive SaaS Engine | Zero Runtime Network Egress | Strict Factual Non-Fabrication Truth Gate | Google XYZ Standards Elevation | Native Vector PDF & DOCX Binary Generators',
    colorAccent
  );

  // ==========================================
  // SECTION 1: EXECUTIVE OVERVIEW
  // ==========================================
  drawSectionHeading('1', 'Executive Overview & Design Philosophy');

  drawParagraph(
    'Tailor My Resume (/tools/tailor) is HireFlow\'s flagship accomplishment elevation studio. It provides engineering and technology candidates with an interactive, evidence-grounded environment to align their resume with specific Job Descriptions (JDs) while maintaining strict factual truth.'
  );

  drawBullet('Deterministic Factual Truth: Unlike standard generative AI which hallucinates metrics, dates, and unverified competencies, HireFlow strictly prohibits inventing numbers. Every bullet is cross-verified against an immutable Candidate Fact Ledger.');
  drawBullet('Google XYZ Standard: Systematically restructures weak task statements into executive-grade accomplishment bullets: Accomplished [X] measured by [Y] by doing [Z].');
  drawBullet('Zero Network Egress: Ingestion, NLP parsing, knowledge graph matching, layout height simulation, DOCX compilation, and vector PDF rendering occur entirely inside the user\'s browser.');
  drawBullet('1-Page Density Sentinel: Real-time calculation of vertical pixel height (1056px Letter / A4) prevents single-line spills onto page 2 and auto-tunes typography.');

  // ==========================================
  // SECTION 2: ECOSYSTEM INTEGRATION & DIRECTED FLOWS
  // ==========================================
  drawSectionHeading('2', 'Ecosystem Integration & Directed Navigation');

  drawParagraph(
    'Tailor My Resume functions as the central execution studio across HireFlow, receiving qualified data from discovery tools and feeding into verification pipelines:'
  );

  drawSubheading('Inbound Deep Links & Parameter Handlers');
  drawBullet('ATS Resume Roaster (FixTheseFirst.tsx): When high-ROI gaps are found, 1-click handoffs route to /tools/tailor?focus=<item_title> (missing mandatory requirements) or /tools/tailor?mode=upgrade&bullet=<bullet_title> (weak bullet elevation).');
  drawBullet('ATS Skills Tab (SkillsTab.tsx): Direct link /tools/tailor?skill=<canonical_skill> launches the studio pre-focused on bridging that exact skill into experience or project entries.');
  drawBullet('Tools Hub (ToolsHubPage.tsx): Positioned prominently in Group A "Application & Outreach" with badge "Truth-Checked Suggestions" and tags [Truth Check, Diff Editor, Version History].');
  drawBullet('Compare Job Descriptions (HeadToHeadView.tsx): Dual action buttons "Tailor for Role A" and "Tailor for Role B" allow candidates to fork role-specific branches from one source resume.');
  drawBullet('Placement Pathways (plan.ts & StudentPlacementPathway.tsx): Direct call-to-action from readiness diagnostic to the "Single-Page Technical Fresher Resume Tailoring" milestone.');
  drawBullet('Global Navigation (LocalhostNavigator.tsx & ProfileResumeChip.tsx): Shared profile context synchronizes candidate text across ATS Roaster, TalentLens, and Tailor.');

  drawSubheading('Outbound Directed Handoffs');
  drawBullet('Build Proof Project Briefs (/tools/build-briefs?query=<skill>): When a mandatory requirement is completely missing and cannot be honestly claimed on the resume, the studio links the candidate to a hands-on project brief to build verifiable proof before applying.');

  // ==========================================
  // SECTION 3: WORKSPACE ARRANGEMENT & UI COMPONENTS
  // ==========================================
  drawSectionHeading('3', 'Application Arrangement & Workspace Layout');

  drawParagraph(
    'The studio interface is divided into a high-productivity split-screen layout with synchronized live rendering:'
  );

  drawSubheading('1. Top Navigation Bar (DarkTailorHeader.tsx)');
  drawBullet('Dynamic Real-Time Score Badge: Computes baseline vs upgraded score (0-100%) reflecting power verb coverage (40%), metric density (40%), and passive pattern elimination (20%).');
  drawBullet('Quick Archetype Presets: Instant toggle between Fresher SDE (Jeswanth Kumar) and Cybersecurity Specialist (Alex Morgan CISSP).');
  drawBullet('Multi-Format Export Suite: Direct downloads for .DOCX (Word binary), .PDF (vector binary), .TXT (ATS plain text), .MD (Markdown), and .JSON (reactive backup).');
  drawBullet('Make It Better Trigger: Initiates global Google XYZ transformation modal.');

  drawSubheading('2. Left Column: Handmade Resume Editor (HandmadeResumeEditor.tsx)');
  drawBullet('Filter Tabs: Instant subsection filtering (All, Profile, Summary, Experience, Projects, Skills, Education, Requirements).');
  drawBullet('Live Search Bar: Highlights matching terms and filters entries dynamically.');
  drawBullet('Auto-Fit 1 Page Sentinel: One-click algorithm that adjusts margins, font tokens, and line spacing to force content onto 1 page.');
  drawBullet('7 Dedicated Section Editors: WorkExperienceSection, ProjectsSection, SkillsSection, EducationSection, SummarySection, JobRequirementsSection, and CandidateProfileSection.');

  drawSubheading('3. Right Column: Live Dark Paper Canvas (DarkPaperPreview.tsx)');
  drawBullet('Real-time A4 / Letter simulation with print typography, border styling, zoom scaling (80%-110%), and overflow alerts.');

  // ==========================================
  // SECTION 4: CORE DATA SCHEMAS & FACT LEDGER
  // ==========================================
  drawSectionHeading('4', 'Core Data Models, Schemas & Fact Ledger');

  drawParagraph(
    'Every operation operates on strictly-typed data models defined in src/lib/tailor/types.ts:'
  );

  drawTable(
    ['Interface / Model', 'Key Fields & Types', 'Architectural Purpose'],
    [
      ['CandidateFact', 'factId, sourceSection, rawText, normalizedConcepts, extractedMetrics, hash', 'Immutable unit of candidate history preventing AI hallucination.'],
      ['JobRequirement', 'id, text, category, priority (MANDATORY|PREFERRED), weight, normalizedConcept', 'Extracted criteria from target JD with numerical scoring weight.'],
      ['RequirementAssessment', 'requirementId, status (DIRECT|TRANSFERABLE|PARTIAL|MISSING), supportingFacts', 'Detailed alignment report between candidate facts and target JD.'],
      ['BulletTransformation', 'bulletId, factId, originalText, tailoredText, actionVerb, preservedMetrics', 'Before-and-after bullet transformation record with audit rationale.'],
      ['LayoutSettings', 'template, paperSize, fontSize, margins, lineSpacing, accentColor', 'Visual layout configuration controlling 1-page fit and export styling.'],
      ['TruthGateResult', 'passed, score, unsupportedClaimsCount, preservedMetricsCount, blockingIssues', 'Audit sentinel output blocking export if invented facts are detected.']
    ],
    [120, 215, 170]
  );

  // ==========================================
  // SECTION 5: INTELLIGENCE & CLASSIFICATION ENGINES
  // ==========================================
  drawSectionHeading('5', 'Intelligence & Classification Engines');

  drawSubheading('Candidate Archetype Classifier & Dynamic Section Ordering (strategyPlanner.ts)');
  drawParagraph(
    'The strategy planner dynamically reconfigures the section hierarchy based on candidate seniority and target domain:'
  );

  drawTable(
    ['Archetype', 'Recommended Section Ordering', 'Target Persona / Strategy'],
    [
      ['student_fresher', 'Education -> Projects -> Skills -> Experience -> Certs', 'Entry-level campus hires; prioritizes academic excellence and projects.'],
      ['cybersecurity_specialist', 'Security Summary -> Certifications -> Experience -> Skills -> Labs', 'Infosec roles; prioritizes CISSP/CEH trust signals and SOC experience.'],
      ['academic_researcher', 'Education -> Publications -> Experience -> Methodologies', 'R&D / Ph.D. roles; prioritizes peer-reviewed publications and grants.'],
      ['experienced_executive', 'Executive Summary -> Experience -> Core Competencies -> Education', 'Leadership / VP roles; frames P&L responsibility, team scaling, and strategy.'],
      ['technical_specialist', 'Technical Skills -> Work Experience -> Projects -> Education', 'Mid/Senior SDEs; front-loads technical stack for immediate ATS parsing.']
    ],
    [125, 220, 160]
  );

  drawSubheading('Make It Better Engine & Weak Opener Replacements (makeItBetterEngine.ts)');
  drawBullet('Weak Opener Elimination: Automates replacement of 12 passive patterns (e.g. "Responsible for" -> "Spearheaded", "Worked on" -> "Engineered", "Assisted with" -> "Co-engineered", "Handled" -> "Streamlined").');
  drawBullet('Context-Sensitive Power Verbs: Selects high-impact verbs based on technical domain: Performance/Latency -> "Optimized", Leadership -> "Spearheaded", Security -> "Fortified", Cloud/DevOps -> "Automated".');
  drawBullet('Strict Metric Locking: 100% of candidate numeric metrics are extracted and preserved. No synthetic numbers are ever injected.');

  drawSubheading('Requirement-Aware Accomplishment Synthesis (accomplishmentGenerator.ts)');
  drawBullet('7 Domain Suggestion Packs: Dynamically synthesizes Google XYZ accomplishment bullets across Scale & Latency, Architecture & APIs, Frontend & UX, Data & DB, Cloud & DevOps, Security & Auth, and Quality & Testing.');

  // ==========================================
  // SECTION 6: TRUTH GATE & NON-FABRICATION INVARIANTS
  // ==========================================
  drawSectionHeading('6', 'Truth Gate & Non-Fabrication Invariants');

  drawParagraph(
    'HireFlow operates a dual-sentinel truth gate system to enforce zero fabrication at runtime:'
  );

  drawCallout(
    'Sentinel 1: Interactive Truth Gate (src/lib/tailor/engine/truthGate.ts)',
    '• Invented Metric Detection: Scans every number, latency value, and dollar figure. If a number did not exist in the candidate fact ledger, it triggers a CRITICAL blocking issue.\n• Unverified Skill Scanner: Flags any technology not present in the candidate profile with a WARNING until candidate confirmation is received.',
    colorRed
  );

  drawCallout(
    'Sentinel 2: Harsh Invariant Gate (src/engine/tailor/truthGate.ts)',
    '• Claim-Strength Ladder (CLAIM_STRENGTH_LADDER): Prohibits escalating action verb strength beyond source ownership (e.g., cannot escalate "assisted" (Tier 1) to "architected" (Tier 5)).\n• Keyword Mirroring Cap (TAILOR_MIRRORING_LIMITS): Limits any target keyword to max 2 mentions across tailored bullets to prevent ATS spam penalties.\n• Deterministic Quality Fallback: If any fatal violation occurs, the system automatically falls back to original bullet phrasing.',
    colorPrimary
  );

  // ==========================================
  // SECTION 7: CANDIDATE ACTIONS & COMPLETE CHANGE CAPABILITIES
  // ==========================================
  drawSectionHeading('7', 'Candidate Actions & Complete Change Capabilities');

  drawParagraph(
    'The candidate retains full interactive agency over every aspect of their resume:'
  );

  drawBullet('1. Reorder & Toggle Sections: Move sections up/down or hide non-essential sections (e.g., hide Certifications for freshers) without deleting data.');
  drawBullet('2. In-Place Bullet Elevation: One-click "XYZ Elevate" on any bullet point to convert passive duties into metric-driven accomplishments.');
  drawBullet('3. Metric Placeholders: Injects structured prompts ([X%], [N ms], [M requests/sec]) guiding candidates to provide verifiable data.');
  drawBullet('4. Skills Taxonomy Management: Add or remove skill chips across 7 standardized categories.');
  drawBullet('5. 1-Page Auto-Fit Sentinel: Single-click optimization of layout margins (0.4in-0.65in), font tokens, and spacing.');
  drawBullet('6. Multi-Template Switcher: Switch seamlessly between Classic, Modern, Compact, and Executive visual styles.');
  drawBullet('7. Version Snapshots & Privacy Purge: Take versioned snapshots with 1-click rollback, or trigger a complete privacy wipe that permanently clears LocalStorage.');

  // ==========================================
  // SECTION 8: MULTI-FORMAT EXPORT SUITE & SENTINELS
  // ==========================================
  drawSectionHeading('8', 'Multi-Format Export Suite & Sentinels');

  drawParagraph(
    'All exports are generated locally via pure client-side libraries with pre-export validation:'
  );

  drawSubheading('Export Formats');
  drawBullet('Vector PDF (.pdf): Authentic binary PDF compiled via pdf-lib with embedded standard typography (Helvetica/Times-Roman), page break calculation, and glyph sanitization.');
  drawBullet('Word Binary (.docx): True Microsoft Word binary built via docx library featuring ATS single-column formatting, standard headings, and bullet margins.');
  drawBullet('Plain Text (.txt) & Markdown (.md): Clean ASCII formatted text formatted specifically for pasting into ATS web forms.');
  drawBullet('JSON State Backup (.json): Machine-readable dump of the full active project state.');

  drawSubheading('Quality & Sentinel Audits');
  drawBullet('Layout & Height Sentinel (layoutSentinel.ts): Evaluates vertical height against 1056px capacity, flagging single-line spill risks.');
  drawBullet('Pre-Export Formatting Checker (formattingChecker.ts): Scans for broken glyphs (Unicode replacement chars), widow/orphan lines (<3 words on final line), and missing date ranges.');

  // ==========================================
  // SECTION 9: CODE DIRECTORY & SYMBOL SITEMAP
  // ==========================================
  drawSectionHeading('9', 'Codebase Directory & Symbol Reference');

  drawTable(
    ['File Path', 'Key Symbols', 'Module Function'],
    [
      ['src/lib/tailor/store/tailorStore.ts', 'useTailorStore, createDefaultProject', 'Reactive Zustand state, pipeline stages, auto-fit.'],
      ['src/lib/tailor/engine/makeItBetterEngine.ts', 'elevateBulletPoint, elevateResumeToBestStandard', 'Google XYZ bullet transformer and scoring policy.'],
      ['src/lib/tailor/engine/truthGate.ts', 'verifyFactualIntegrity', 'Metric preservation and unverified skill blocking.'],
      ['src/engine/tailor/truthGate.ts', 'evaluateTruthGate', 'Claim-strength ladder and keyword mirroring cap.'],
      ['src/lib/tailor/engine/strategyPlanner.ts', 'planTailoringStrategy', 'Archetype classification and section reordering.'],
      ['src/lib/tailor/matching/evidenceMatcher.ts', 'matchCandidateToJob', '4-tier requirement assessment and transferability.'],
      ['src/lib/tailor/engine/accomplishmentGenerator.ts', 'generateUniqueAccomplishments', 'Requirement-mapped accomplishment suggestions.'],
      ['src/lib/tailor/export/pdfExporter.ts', 'generatePdfResume, downloadResumeAsPdf', 'Client-side vector PDF generation via pdf-lib.'],
      ['src/lib/tailor/export/docxExporter.ts', 'generateDocxBlob, downloadResumeAsDocx', 'ATS-compliant Word document binary generator.'],
      ['src/lib/tailor/export/layoutSentinel.ts', 'evaluateLayoutHeight', '1056px page height calculator and spill risk detector.'],
      ['src/lib/tailor/export/formattingChecker.ts', 'runPreExportFormattingChecks', 'Glyph audit, widow/orphan detector, date validator.'],
      ['src/features/suite/tailor/TailorResumePage.tsx', 'TailorResumePage', 'Top-level page with split editor/canvas layout.'],
      ['src/features/suite/tailor/components/HandmadeResumeEditor.tsx', 'HandmadeResumeEditor', 'Subsection 2-column editor with filter tabs.'],
      ['src/features/suite/tailor/components/DarkPaperPreview.tsx', 'DarkPaperPreview', 'Live A4/Letter paper canvas with print CSS sync.']
    ],
    [155, 185, 165]
  );

  // ==========================================
  // RUNNING FOOTERS ON ALL PAGES
  // ==========================================
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    page.drawLine({
      start: { x: marginX, y: 32 },
      end: { x: pageWidth - marginX, y: 32 },
      thickness: 0.5,
      color: colorCardBorder,
    });
    page.drawText('HIREFLOW v4.0.0 — CONFIDENTIAL ARCHITECTURAL DOCUMENTATION — ZERO EGRESS INVARIANT', {
      x: marginX,
      y: 20,
      size: 7.0,
      font: regularFont,
      color: colorMuted,
    });
    page.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: pageWidth - marginX - 55,
      y: 20,
      size: 7.5,
      font: boldFont,
      color: colorPrimary,
    });
  }

  // Save the PDF
  const pdfBytes = await pdfDoc.save();

  // Write to docs/tailor and public/downloads
  const docsDir = path.resolve('docs/tailor');
  const publicDir = path.resolve('public/downloads');

  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const docsPdfPath = path.join(docsDir, 'TAILOR_MY_RESUME_COMPLETE_BRIEF.pdf');
  const publicPdfPath = path.join(publicDir, 'TAILOR_MY_RESUME_COMPLETE_BRIEF.pdf');

  fs.writeFileSync(docsPdfPath, pdfBytes);
  fs.writeFileSync(publicPdfPath, pdfBytes);

  console.log(`Successfully generated PDF brief!`);
  console.log(`Saved to docs: ${docsPdfPath} (${pdfBytes.length} bytes, ${totalPages} pages)`);
  console.log(`Saved to public: ${publicPdfPath} (${pdfBytes.length} bytes, ${totalPages} pages)`);
}

generateBriefPdf().catch((err) => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
