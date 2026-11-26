// ============================================================
// HIREFLOW PHASE 10.7 — WORKSTREAM A (SECTIONS 4 & 5: A1–A9)
// Real Chrome E2E Workflows, Format Uploads, JD & Evidence Semantics,
// Multi-Candidate Isolation, Classic + Spruce Parity, and Deep Binary
// PDF / DOCX / Markdown Export Parity Verification.
// ============================================================

import { test, expect, type Page, type TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  CANDIDATE_A_NAME,
  CANDIDATE_A_EMAIL,
  CANDIDATE_A_EMPLOYER,
  CANDIDATE_A_ROLE,
  CANDIDATE_A_RESUME,
  CANDIDATE_A_JD,
  CANDIDATE_A_JD_ABOUT_THE_ROLE,
  CANDIDATE_B_NAME,
  CANDIDATE_B_EMPLOYER,
  CANDIDATE_B_ROLE,
  CANDIDATE_B_RESUME,
  CANDIDATE_B_JD,
  CANDIDATE_C_NAME,
  CANDIDATE_C_EMPLOYER,
  CANDIDATE_C_ROLE,
  CANDIDATE_C_RESUME,
  CANDIDATE_C_JD,
  CANDIDATE_A_ALT_JD,
  RESUME_MISSING_CONTACT,
  RESUME_AMBIGUOUS_DATES,
  JD_COMPLEX_LOGIC_AND_MALFORMED,
  JD_NO_EMPLOYER_NO_EXPERIENCE,
  EVIDENCE_SEMANTICS_NAME,
  EVIDENCE_SEMANTICS_RESUME,
  EVIDENCE_SEMANTICS_JD,
  buildDocxBufferFromLines,
  buildPdfBufferFromLines,
  buildCorruptDocxBuffer,
  buildOversizedTxtBuffer,
  inspectDownloadedPdf,
  inspectDownloadedDocx,
  extractMarkdownTables,
} from './helpers/syntheticFixtures';

interface RuntimeTelemetry {
  consoleErrors: string[];
  pageErrors: string[];
  forbiddenEgress: string[];
}

function attachTelemetry(page: Page): RuntimeTelemetry {
  const telemetry: RuntimeTelemetry = {
    consoleErrors: [],
    pageErrors: [],
    forbiddenEgress: [],
  };
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      telemetry.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    telemetry.pageErrors.push(err.message);
  });
  page.on('request', (req) => {
    const url = req.url();
    if (
      url.includes('supabase.co') ||
      url.includes('google.com/auth') ||
      url.includes('googleapis.com') ||
      url.includes('analytics') ||
      url.includes('telemetry')
    ) {
      telemetry.forbiddenEgress.push(url);
    }
  });
  return telemetry;
}

async function initClassicPage(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('hf_seen_cinematic', 'true');
  });
  await page.goto('/tools/resume-checker');
  await page.evaluate(() => {
    if (window.localStorage.getItem('hireflow:v4:design') !== 'neon-volt') {
      window.localStorage.setItem('hireflow:v4:design', 'neon-volt');
    }
  });
  await expect(page.getByPlaceholder(/Paste your complete resume here/i)).toBeVisible({ timeout: 25_000 });
}

async function runClassicScanViaInputs(page: Page, resumeText: string, jdText: string) {
  const resumeBox = page.getByPlaceholder(/Paste your complete resume here/i);
  const jdBox = page.getByPlaceholder(/Paste the target job description/i);

  await resumeBox.fill(resumeText);
  await jdBox.fill(jdText);

  const analyzeBtn = page.getByRole('button', { name: /Roast & Analyze Match/i });
  await expect(analyzeBtn).toBeEnabled();
  await analyzeBtn.click();

  const confirmModalHeading = page.getByRole('heading', { name: /Confirm Job Requirements/i });
  await expect(confirmModalHeading).toBeVisible();
  await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();

  await expect(page.getByText(/Resume Match Estimate/i)).toBeVisible({ timeout: 15_000 });
}

async function downloadReportFormat(
  page: Page,
  formatLabelRegex: RegExp,
  expectedExt: '.pdf' | '.docx' | '.md'
): Promise<{ filename: string; buffer: Buffer }> {
  const chevron = page.getByRole('button', { name: /Choose report download format/i }).first();
  await chevron.click();

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    page.getByRole('button', { name: formatLabelRegex }).click(),
  ]);

  const filename = download.suggestedFilename();
  expect(filename.endsWith(expectedExt)).toBe(true);
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  const buffer = fs.readFileSync(filePath!);
  expect(buffer.byteLength).toBeGreaterThan(0);
  return { filename, buffer };
}

async function writeTempFile(testInfo: TestInfo, filename: string, content: Buffer | string): Promise<string> {
  const outPath = testInfo.outputPath(filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  return outPath;
}

test.describe('Phase 10.7 Workstream A: End-to-End Workflows, Semantics, Isolation & Export Parity', () => {
  test.setTimeout(60_000);

  // =========================================================================
  // A1 + A7–A9: Full Upload-to-Export Workflow + Deep PDF/DOCX/MD Parity
  // =========================================================================
  test('A1 & A7-A9: full upload-to-export workflow in Chrome with PDF, DOCX & Markdown binary/XML/table parity', async ({
    page,
  }, testInfo) => {
    const telemetry = attachTelemetry(page);
    await initClassicPage(page);

    // Prepare real .txt upload for Candidate A so file-upload -> scan -> export runs end-to-end
    const txtPath = await writeTempFile(testInfo, 'vikram-menon-resume.txt', CANDIDATE_A_RESUME);
    await page.getByRole('button', { name: /^Upload File$/i }).first().click();
    await page.locator('input[type="file"]').first().setInputFiles(txtPath);
    await expect(page.getByText('vikram-menon-resume.txt')).toBeVisible();

    // Fill realistic JD with explicit employer & role metadata
    await page.getByPlaceholder(/Paste the target job description/i).fill(CANDIDATE_A_JD);
    await page.getByRole('button', { name: /Roast & Analyze Match/i }).click();
    await expect(page.getByRole('heading', { name: /Confirm Job Requirements/i })).toBeVisible();
    await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();

    await expect(page.getByText(/Resume Match Estimate/i)).toBeVisible({ timeout: 15_000 });

    // 1. Capture authoritative UI Score, Band, Role Title, and 7 Dimensions
    const midpointText = await page.locator('text=/Midpoint:\\s*\\d+\\/100/').first().textContent();
    const uiScoreMatch = midpointText?.match(/(\d+)\/100/);
    expect(uiScoreMatch).toBeTruthy();
    const uiScore = Number(uiScoreMatch![1]);
    expect(uiScore).toBeGreaterThanOrEqual(60);

    // Verify Role Title in summary & JobRoleProjectBridge
    await expect(page.getByText(new RegExp(CANDIDATE_A_ROLE, 'i')).first()).toBeVisible();

    // Verify "Why this score" ScoreTrace drawer + mathematical reconciliation
    await page.getByRole('button', { name: /Why this score/i }).click();
    await expect(page.getByRole('heading', { name: /Why This Score\?/i })).toBeVisible();
    await expect(page.getByText(new RegExp(`${uiScore}`)).first()).toBeVisible();
    await page.getByRole('button', { name: /Close dialog/i }).click();

    // Verify 1. Overview: all 7 Dimensions rendered with numeric scores & weights
    await page.getByRole('button', { name: /1\. Overview/i }).click();
    const overviewExpectedDimensions = [
      'Must-Have Skill Coverage',
      'Evidence & Implementation Depth',
      'Impact & Quantified Numerical Metrics',
      'Project Relevance & Open-Source Signals',
      'Seniority Alignment & Experience Fit',
      'Format, Layout & Parsing Safety',
      'Target Company Tier Alignment',
    ];
    for (const dimLabel of overviewExpectedDimensions) {
      await expect(page.getByText(dimLabel).first()).toBeVisible();
    }

    // Extract 7 dimension contributions & weights directly from Overview DOM
    const uiDimMap: Record<string, { score: number; max: number }> = {};
    for (const dimLabel of overviewExpectedDimensions) {
      const rowText = await page
        .locator('div', { hasText: dimLabel })
        .filter({ hasText: /\/\s*\d+\s*pts/ })
        .last()
        .textContent();
      const m = rowText?.match(/([\d.]+)\s*\/\s*(\d+)\s*pts/);
      expect(m, `Expected numeric score/max for dimension "${dimLabel}", got "${rowText}"`).toBeTruthy();
      uiDimMap[dimLabel] = { score: Number(m![1]), max: Number(m![2]) };
    }

    // 2. Verify 2. Skills tab: Competency Matches & Verbatim Evidence/Citations
    await page.getByRole('button', { name: /2\. Skills/i }).click();
    await expect(page.getByText('Apache Airflow').first()).toBeVisible();
    await expect(page.getByText('Snowflake').first()).toBeVisible();
    await expect(page.getByText(/18 million records per day/i).first()).toBeVisible();
    await expect(page.getByText(/VERIFIED EXACT/i).first()).toBeVisible();
    await expect(page.getByText(/DIRECTLY SUPPORTED/i).first()).toBeVisible();
    // GraphQL is listed only in Skills section -> should appear as Partial / Weak / Claimed (never Satisfied)
    const graphqlRow = page.locator('tr', { hasText: 'GraphQL' }).first();
    await expect(graphqlRow).toBeVisible();
    const graphqlRowText = (await graphqlRow.textContent()) || '';
    expect(graphqlRowText).toMatch(/Partial|Claimed/i);

    // 3. Verify 3. Resume Audit tab: Candidate Identity (exact parsed name, NEVER 'Mohit'), Extracted Experience & Projects, Seniority & Eligibility
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    const candidateNameRow = page.locator('div', { hasText: 'Candidate Name' }).filter({ hasText: CANDIDATE_A_NAME }).first();
    await expect(candidateNameRow).toBeVisible();
    const auditText = (await page.locator('#main-content, main, body').first().textContent()) || '';
    // Candidate Identity section specifically must NOT display 'Mohit'
    const contactSectionText = (await page.locator('div', { hasText: 'Recruiter Contact Channels' }).last().textContent()) || '';
    expect(contactSectionText).toContain(CANDIDATE_A_NAME);
    expect(contactSectionText).toContain(CANDIDATE_A_EMAIL);
    expect(contactSectionText).not.toContain('Mohit');

    // Extracted Experience Roles (2: FinCore Clearing + ByteBridge Labs) & Projects (1: OpenStream)
    const expTile = await page.locator('div', { hasText: 'Experience Roles' }).filter({ hasText: 'Parsed job tenures' }).last().textContent();
    expect(expTile).toContain('2');
    const projTile = await page.locator('div', { hasText: 'Projects Detected' }).filter({ hasText: 'Independent systems' }).last().textContent();
    expect(projTile).toContain('1');
    // Seniority & Tenure Analysis
    await expect(page.getByText(/Seniority & Tenure Analysis/i)).toBeVisible();
    await expect(page.getByText(/MEETS REQUIREMENT|EXCEEDS REQUIREMENT/i).first()).toBeVisible();

    // 4. Verify Quick Roast mode: Strengths, Gaps, Prioritized Actions
    await page.getByRole('button', { name: /^Quick Roast$/i }).click();
    await expect(page.getByText(/Grounded Quick Roast/i)).toBeVisible();
    await expect(page.getByText(/Key Verified Strengths/i)).toBeVisible();
    await expect(page.getByText(/Top Priority Gaps/i)).toBeVisible();
    await expect(page.getByText(/Top Prioritized Action Items/i)).toBeVisible();
    await expect(page.getByText(/Missing Terraform/i).first()).toBeVisible();

    // Switch back to Deep Roaster
    await page.getByRole('button', { name: /^Deep Roaster$/i }).click();

    // 5. Verify Cloud-First zero localStorage leakage ('hireflow_tool_ats_v3' stays null)
    const storedHistoryRaw = await page.evaluate(() => window.localStorage.getItem('hireflow_tool_ats_v3'));
    expect(storedHistoryRaw).toBeNull();
    const visibleBody = await page.locator('main, body').first().innerText();
    expect(visibleBody).not.toContain('Mohit');

    // 6. Trigger REAL browser downloads for PDF, DOCX, and Markdown & inspect binary/XML/tables
    const pdfDownload = await downloadReportFormat(page, /Print-Ready PDF/i, '.pdf');
    const docxDownload = await downloadReportFormat(page, /Word Document/i, '.docx');
    const mdDownload = await downloadReportFormat(page, /Markdown Report/i, '.md');

    // --- A7: Deep PDF Inspection ---
    const parsedPdf = await inspectDownloadedPdf(pdfDownload.buffer);
    expect(parsedPdf.pageCount).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < parsedPdf.pageCount; i++) {
      expect(parsedPdf.pagesText[i].length, `PDF page ${i + 1} should not be blank`).toBeGreaterThan(40);
    }
    expect(parsedPdf.fullText).not.toContain('\uFFFD');
    expect(parsedPdf.fullText).toContain(CANDIDATE_A_NAME);
    expect(parsedPdf.fullText).not.toContain('Mohit');
    expect(parsedPdf.fullText).toContain(CANDIDATE_A_EMPLOYER);
    expect(parsedPdf.fullText).toContain(CANDIDATE_A_ROLE);
    expect(parsedPdf.fullText).toContain(`${uiScore}`);
    expect(parsedPdf.fullText).toContain('Score Reconciliation:');
    expect(parsedPdf.fullText).toContain('Seniority & Eligibility:');
    expect(parsedPdf.fullText).toContain('VERIFIED_EXACT');
    expect(parsedPdf.fullText).toContain('DIRECTLY_SUPPORTED');
    expect(parsedPdf.fullText).toContain('18 million records');
    expect(parsedPdf.fullText).toContain('CREDITED');

    for (const [dimLabel, vals] of Object.entries(uiDimMap)) {
      expect(parsedPdf.fullText).toContain(dimLabel);
      expect(parsedPdf.fullText).toContain(`${vals.score} / ${vals.max} pts`);
      expect(parsedPdf.fullText).toContain(`${vals.max}%`);
    }

    // --- A8: Deep DOCX ZIP + XML Inspection ---
    const parsedDocx = await inspectDownloadedDocx(docxDownload.buffer);
    expect(parsedDocx.entryNames).toContain('word/document.xml');
    expect(parsedDocx.xmlParseErrors).toHaveLength(0);
    expect(parsedDocx.tableCount).toBeGreaterThanOrEqual(3); // Layer 3 Skills, Layer 5 Citations, Layer 5B Metrics
    expect(parsedDocx.documentXml).toContain('<w:tbl>');
    expect(parsedDocx.fullText).toContain(CANDIDATE_A_NAME);
    expect(parsedDocx.fullText).not.toContain('Mohit');
    expect(parsedDocx.fullText).toContain(CANDIDATE_A_EMPLOYER);
    expect(parsedDocx.fullText).toContain(CANDIDATE_A_ROLE);
    expect(parsedDocx.fullText).toContain(`${uiScore} / 100`);
    expect(parsedDocx.fullText).toContain('Mathematical Score Reconciliation:');
    expect(parsedDocx.fullText).toContain('18 million records per day');
    // Ampersand in "Kafka | RabbitMQ ... & deterministic" must be XML-escaped in raw XML (&amp;)
    expect(parsedDocx.documentXml).toContain('&amp;');
    for (const [dimLabel, vals] of Object.entries(uiDimMap)) {
      expect(parsedDocx.fullText).toContain(`${dimLabel}: ${vals.score} / ${vals.max} pts (${vals.max}%)`);
    }

    // --- A9: Deep Markdown Inspection + Cross-Channel Parity ---
    const mdText = mdDownload.buffer.toString('utf-8');
    expect(mdText).toContain(`- **Target Role**: ${CANDIDATE_A_ROLE} at ${CANDIDATE_A_EMPLOYER}`);
    expect(mdText).toContain(`- **Candidate**: ${CANDIDATE_A_NAME}`);
    expect(mdText).not.toContain('Mohit');
    expect(mdText).toContain(`## Overall Benchmark Score: ${uiScore} / 100`);
    expect(mdText).toContain('### Layer 1: 7-Dimension Weighted Subscores');
    expect(mdText).toContain('### Seniority & Eligibility Assessment');
    expect(mdText).toContain('### Layer 2: High-Impact Fix These First');
    expect(mdText).toContain('### Layer 3: Complete Skills Inventory');
    expect(mdText).toContain('### Layer 4: Formatting, Structural & Bullet Audit');
    expect(mdText).toContain('### Layer 5: Evidence Provenance & Citation Validation Ledger');
    expect(mdText).toContain('### Layer 5B: Quantified Impact & Outcome Metrics Ledger');

    for (const [dimLabel, vals] of Object.entries(uiDimMap)) {
      expect(mdText).toContain(`- **${dimLabel}**: ${vals.score} / ${vals.max} pts (${vals.max}%)`);
    }

    // Verify ScoreTrace arithmetic in Markdown reconciliation line
    const reconMatch = mdText.match(
      /Raw Subtotal ([\d.]+) pts \+ Bonuses ([\d.]+) pts - Deductions ([\d.]+) pts = ([\d.]+) pts -> Final Score: (\d+) \/ 100/
    );
    expect(reconMatch).toBeTruthy();
    const rawSub = Number(reconMatch![1]);
    const bonuses = Number(reconMatch![2]);
    const deductions = Number(reconMatch![3]);
    const preClamp = Number(reconMatch![4]);
    const finalMdScore = Number(reconMatch![5]);
    const dimSum = Math.round(Object.values(uiDimMap).reduce((acc, v) => acc + v.score, 0) * 10) / 10;
    expect(rawSub).toBe(dimSum);
    expect(Math.round((rawSub + bonuses - deductions) * 10) / 10).toBe(preClamp);
    expect(finalMdScore).toBe(uiScore);
    expect(Math.max(0, Math.min(100, Math.round(preClamp)))).toBe(finalMdScore);

    // Verify Markdown tables are intact (unescaped pipe counts match header, pipe inside "Kafka \| RabbitMQ" escaped)
    const mdTables = extractMarkdownTables(mdText);
    expect(mdTables.length).toBeGreaterThanOrEqual(3);
    for (const tbl of mdTables) {
      expect(tbl.rows.length).toBeGreaterThan(0);
      for (const row of tbl.rows) {
        expect(row.length).toBe(tbl.headers.length);
      }
    }
    expect(mdText).toContain('Kafka \\| RabbitMQ');

    // Emit structured summary to test output for verification log
    console.log(
      JSON.stringify({
        test: 'A1_A7_A9',
        uiScore,
        rawSub,
        bonuses,
        deductions,
        preClamp,
        finalMdScore,
        pdfPages: parsedPdf.pageCount,
        docxTables: parsedDocx.tableCount,
        mdTables: mdTables.length,
        consoleErrors: telemetry.consoleErrors.length,
        pageErrors: telemetry.pageErrors.length,
        forbiddenEgress: telemetry.forbiddenEgress.length,
      })
    );

    // Verify My Space -> Scans shows Employer, Role, and Score (after completing downloads)
    const mySpaceLink = page.getByRole('link', { name: /View in My Space/i });
    await expect(mySpaceLink).toBeVisible({ timeout: 5_000 });
    await mySpaceLink.click();
    const dialog = page.getByRole('dialog', { name: /My Space/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(CANDIDATE_A_EMPLOYER).first()).toBeVisible();
    await expect(dialog.getByText(new RegExp(CANDIDATE_A_ROLE, 'i')).first()).toBeVisible();
    await expect(dialog.getByText(new RegExp(`${uiScore}\\s*of 100`)).first()).toBeVisible();

    expect(telemetry.consoleErrors).toHaveLength(0);
    expect(telemetry.pageErrors).toHaveLength(0);
    expect(telemetry.forbiddenEgress).toHaveLength(0);
  });

  // =========================================================================
  // A2: Real File Upload Coverage (.txt, .docx, .pdf, corrupt, >5MB, edge cases)
  // =========================================================================
  test('A2: real file uploads (.txt, .docx, .pdf), invalid file alerts, missing contact, ambiguous dates & error isolation', async ({
    page,
  }, testInfo) => {
    const telemetry = attachTelemetry(page);
    await initClassicPage(page);

    const jdBox = page.getByPlaceholder(/Paste the target job description/i);
    await jdBox.fill(CANDIDATE_A_JD);

    // 1. Valid .docx upload via real <input type="file">
    const docxResumeLines = CANDIDATE_B_RESUME.split('\n');
    const docxPath = await writeTempFile(
      testInfo,
      'meera-deshpande.docx',
      await buildDocxBufferFromLines(docxResumeLines)
    );
    await page.getByRole('button', { name: /^Upload File$/i }).first().click();
    await page.locator('input[type="file"]').first().setInputFiles(docxPath);
    await expect(page.getByText('meera-deshpande.docx')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/DOCX XML/i)).toBeVisible();

    await jdBox.fill(CANDIDATE_B_JD);
    await page.getByRole('button', { name: /Roast & Analyze Match/i }).click();
    await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();
    await expect(page.getByText(/Resume Match Estimate/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    await expect(page.locator('div', { hasText: 'Recruiter Contact Channels' }).last()).toContainText(CANDIDATE_B_NAME);

    // Return to inputs
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await expect(page.getByText(/Resume Match Estimate/i)).toHaveCount(0);

    // 2. Valid .pdf upload via real <input type="file">
    const pdfPath = await writeTempFile(
      testInfo,
      'arjun-kulkarni.pdf',
      await buildPdfBufferFromLines(CANDIDATE_C_RESUME.split('\n'))
    );
    await page.getByRole('button', { name: /^Upload File$/i }).first().click();
    await page.locator('input[type="file"]').first().setInputFiles(pdfPath);
    await expect(page.getByText('arjun-kulkarni.pdf')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/PDF Text/i)).toBeVisible();

    await page.getByPlaceholder(/Paste the target job description/i).fill(CANDIDATE_C_JD);
    await page.getByRole('button', { name: /Roast & Analyze Match/i }).click();
    await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();
    await expect(page.getByText(/Resume Match Estimate/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    await expect(page.locator('div', { hasText: 'Recruiter Contact Channels' }).last()).toContainText(CANDIDATE_C_NAME);

    // 3. Error isolation: return to input, clear, upload corrupt .docx & >5 MB file
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await page.getByRole('button', { name: /Remove File/i }).first().click();
    await expect(page.getByText('arjun-kulkarni.pdf')).toHaveCount(0);

    const corruptDocxPath = await writeTempFile(testInfo, 'corrupt.docx', buildCorruptDocxBuffer());
    await page.locator('input[type="file"]').first().setInputFiles(corruptDocxPath);
    await expect(page.getByText(/File Extraction Notice:/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Corrupt File Signature|invalid Microsoft Word archive/i)).toBeVisible();
    // Prior candidate's score/identity MUST NOT be shown when subsequent upload fails
    await expect(page.getByText(/Resume Match Estimate/i)).toHaveCount(0);
    await expect(page.getByText(CANDIDATE_C_NAME)).toHaveCount(0);

    const oversizedPath = await writeTempFile(testInfo, 'oversized.txt', buildOversizedTxtBuffer());
    await page.locator('input[type="file"]').first().setInputFiles(oversizedPath);
    await expect(page.getByText(/File Extraction Notice:/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/5 MB/i)).toBeVisible();
    await expect(page.getByText(/Resume Match Estimate/i)).toHaveCount(0);

    // 4. Resume missing contact info: verify clean scan + Missing channels + zero fabricated contact/Mohit
    const noContactPath = await writeTempFile(testInfo, 'no-contact.txt', RESUME_MISSING_CONTACT);
    await page.locator('input[type="file"]').first().setInputFiles(noContactPath);
    await expect(page.getByText('no-contact.txt')).toBeVisible({ timeout: 10_000 });
    await page.getByPlaceholder(/Paste the target job description/i).fill(CANDIDATE_A_JD);
    await page.getByRole('button', { name: /Roast & Analyze Match/i }).click();
    await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();
    await expect(page.getByText(/Resume Match Estimate/i)).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    const noContactPanel = await page.locator('div', { hasText: 'Recruiter Contact Channels' }).last().textContent();
    expect(noContactPanel).not.toContain('Mohit');
    expect(noContactPanel).toContain('Missing');

    // 5. Resume with ambiguous dates: verify clean scan without crash + experience roles parsed
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await page.getByRole('button', { name: /Remove File/i }).first().click();
    const ambigPath = await writeTempFile(testInfo, 'ambiguous-dates.txt', RESUME_AMBIGUOUS_DATES);
    await page.locator('input[type="file"]').first().setInputFiles(ambigPath);
    await expect(page.getByText('ambiguous-dates.txt')).toBeVisible({ timeout: 10_000 });
    await page.getByPlaceholder(/Paste the target job description/i).fill(JD_NO_EMPLOYER_NO_EXPERIENCE);
    await page.getByRole('button', { name: /Roast & Analyze Match/i }).click();
    await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();
    await expect(page.getByText(/Resume Match Estimate/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    await expect(page.locator('div', { hasText: 'Recruiter Contact Channels' }).last()).toContainText('Neha Verma');

    expect(telemetry.consoleErrors).toHaveLength(0);
    expect(telemetry.pageErrors).toHaveLength(0);
  });

  // =========================================================================
  // A3: Real JD Semantics in UI (AND, OR, Nested, Malformed, Missing Employer/Exp)
  // =========================================================================
  test('A3: JD boolean expressions (AND, OR, A AND (B OR C)), malformed lines, and missing employer/experience redistribution', async ({
    page,
  }) => {
    const telemetry = attachTelemetry(page);
    await initClassicPage(page);

    // 1. Complex Boolean + Malformed JD
    await runClassicScanViaInputs(page, CANDIDATE_A_RESUME, JD_COMPLEX_LOGIC_AND_MALFORMED);

    await page.getByRole('button', { name: /2\. Skills/i }).click();
    // Candidate A has Python, SQL, PostgreSQL, Docker, AWS, Kubernetes, NOT Terraform/Ansible
    // Check that compound OR branches / alternatives are represented cleanly
    await expect(page.getByText('Python').first()).toBeVisible();
    await expect(page.getByText('SQL').first()).toBeVisible();
    await expect(page.getByText(/PostgreSQL/i).first()).toBeVisible();
    await expect(page.getByText(/AWS/i).first()).toBeVisible();
    await expect(page.getByText(/Kubernetes/i).first()).toBeVisible();
    // Verify Nice-to-Have vs Must-Have labels both appear
    await expect(page.getByText('Must-Have').first()).toBeVisible();
    await expect(page.getByText('Nice-to-Have').first()).toBeVisible();

    // 2. Missing Employer & Missing Experience JD -> dynamic weight redistribution & Unspecified Employer in export
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await runClassicScanViaInputs(page, CANDIDATE_A_RESUME, JD_NO_EMPLOYER_NO_EXPERIENCE);

    await page.getByRole('button', { name: /1\. Overview/i }).click();
    await expect(page.getByText(/N\/A — Weight redistributed/i).first()).toBeVisible();
    await expect(page.getByText(/\(Weight: 25 pts\)/)).toBeVisible(); // evidenceDepth redistributed 20 -> 25
    await expect(page.getByText(/\(Weight: 15 pts\)/).nth(1)).toBeVisible(); // impactMetrics 15 & projectsAndOss 10 -> 15

    const mdNoEmp = await downloadReportFormat(page, /Markdown Report/i, '.md');
    const mdNoEmpText = mdNoEmp.buffer.toString('utf-8');
    expect(mdNoEmpText).toContain('Unspecified Employer');
    expect(mdNoEmpText).not.toContain('NovaPay');
    expect(mdNoEmpText).toContain('N/A (Redistributed) (0%)');

    expect(telemetry.consoleErrors).toHaveLength(0);
    expect(telemetry.pageErrors).toHaveLength(0);
  });

  // =========================================================================
  // A4: Real Evidence Semantics in UI (Skills-only, Prod vs Intern vs Personal vs Aspirational vs Negated)
  // =========================================================================
  test('A4: evidence provenance, skills-only weakness, internship/personal attribution, negation & metric credit', async ({
    page,
  }) => {
    const telemetry = attachTelemetry(page);
    await initClassicPage(page);

    await runClassicScanViaInputs(page, EVIDENCE_SEMANTICS_RESUME, EVIDENCE_SEMANTICS_JD);

    await page.getByRole('button', { name: /2\. Skills/i }).click();

    // Production Experience -> Satisfied + VERIFIED EXACT + PROFESSIONAL EXPERIENCE + PRODUCTION
    const airflowRow = page.locator('tr', { hasText: 'Apache Airflow' }).first();
    await expect(airflowRow).toContainText(/Satisfied/i);
    await expect(airflowRow).toContainText(/VERIFIED EXACT/i);
    await expect(airflowRow).toContainText(/PROFESSIONAL EXPERIENCE/i);
    await expect(airflowRow).toContainText(/PRODUCTION/i);

    // Skills-Only -> Partial / Weak (never Satisfied / DIRECTLY SUPPORTED)
    const redisRow = page.locator('tr', { hasText: 'Redis' }).first();
    const redisText = (await redisRow.textContent()) || '';
    expect(redisText).toMatch(/Partial|Claimed/i);
    expect(redisText).not.toMatch(/\bSatisfied\b/i);

    // Internship + Assisted -> INTERNSHIP provenance
    const dockerRow = page.locator('tr', { hasText: 'Docker' }).first();
    const dockerText = (await dockerRow.textContent()) || '';
    expect(dockerText).toContain('INTERNSHIP');

    // Personal Project -> PERSONAL PROJECT provenance + PROTOTYPE
    const goRow = page.locator('tr', { has: page.locator('td div', { hasText: /^Go$/ }) }).first();
    const goText = (await goRow.textContent()) || '';
    expect(goText).toContain('PERSONAL PROJECT');
    expect(goText).toContain('PROTOTYPE');

    // Aspirational ("Planning to introduce Terraform") -> Missing (never Satisfied)
    const terraformRow = page.locator('tr', { hasText: 'Terraform' }).first();
    const terraformText = (await terraformRow.textContent()) || '';
    expect(terraformText).toMatch(/Missing|NOT SUPPORTED/i);
    expect(terraformText).not.toMatch(/\bSatisfied\b/i);

    // Explicit Negation / Migration Away ("migrated away from MongoDB", "never used Cassandra") -> Contradicted
    const mongoRow = page.locator('tr', { has: page.locator('td div', { hasText: /^MongoDB$/ }) }).first();
    await expect(mongoRow).toContainText(/Contradicted/i);
    const cassandraRow = page
      .locator('tr', { has: page.locator('td div', { hasText: /^(?:Apache\s+)?Cassandra$/i }) })
      .first();
    await expect(cassandraRow).toContainText(/Contradicted/i);

    // Quantified metrics (18 million records per day & 94 minutes to 31 minutes) credited in Markdown Layer 5B
    const mdOut = await downloadReportFormat(page, /Markdown Report/i, '.md');
    const mdText = mdOut.buffer.toString('utf-8');
    expect(mdText).toContain('18 million records per day');
    expect(mdText).toContain('94 minutes to 31 minutes');
    expect(mdText).toContain('CREDITED');

    expect(telemetry.consoleErrors).toHaveLength(0);
    expect(telemetry.pageErrors).toHaveLength(0);
  });

  // =========================================================================
  // A5: Multi-Candidate Sequential Isolation (A -> B -> C -> A(altJD) -> fail -> clear -> nav away & back)
  // =========================================================================
  test('A5: sequential multi-candidate isolation with zero identity, score, evidence, or citation leaks', async ({
    page,
  }, testInfo) => {
    const telemetry = attachTelemetry(page);
    await initClassicPage(page);

    // Scan 1: Candidate A
    await runClassicScanViaInputs(page, CANDIDATE_A_RESUME, CANDIDATE_A_JD);
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    await expect(page.locator('div', { hasText: 'Recruiter Contact Channels' }).last()).toContainText(CANDIDATE_A_NAME);

    // Scan 2: Candidate B
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await runClassicScanViaInputs(page, CANDIDATE_B_RESUME, CANDIDATE_B_JD);
    await page.getByRole('button', { name: /2\. Skills/i }).click();
    await expect(page.getByText('Terraform').first()).toBeVisible();
    await expect(page.getByText('Apache Airflow')).toHaveCount(0);
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    const scan2Contact = (await page.locator('div', { hasText: 'Recruiter Contact Channels' }).last().textContent()) || '';
    expect(scan2Contact).toContain(CANDIDATE_B_NAME);
    expect(scan2Contact).not.toContain(CANDIDATE_A_NAME);

    // Scan 3: Candidate C
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await runClassicScanViaInputs(page, CANDIDATE_C_RESUME, CANDIDATE_C_JD);
    await page.getByRole('button', { name: /2\. Skills/i }).click();
    await expect(page.getByText('Playwright').first()).toBeVisible();
    await expect(page.getByText('Terraform')).toHaveCount(0);
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    const scan3Contact = (await page.locator('div', { hasText: 'Recruiter Contact Channels' }).last().textContent()) || '';
    expect(scan3Contact).toContain(CANDIDATE_C_NAME);
    expect(scan3Contact).not.toContain(CANDIDATE_B_NAME);
    expect(scan3Contact).not.toContain(CANDIDATE_A_NAME);

    // Scan 4: Re-scan Candidate A against DIFFERENT JD (Zenith Ledger Corp)
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await runClassicScanViaInputs(page, CANDIDATE_A_RESUME, CANDIDATE_A_ALT_JD);
    await page.getByRole('button', { name: /3\. Resume Audit/i }).click();
    const scan4Contact = (await page.locator('div', { hasText: 'Recruiter Contact Channels' }).last().textContent()) || '';
    expect(scan4Contact).toContain(CANDIDATE_A_NAME);
    expect(scan4Contact).not.toContain(CANDIDATE_C_NAME);

    // Export Markdown after Scan 4 and ensure ZERO leakage from Candidate B, C, or NovaPay
    const md4 = (await downloadReportFormat(page, /Markdown Report/i, '.md')).buffer.toString('utf-8');
    expect(md4).toContain(CANDIDATE_A_NAME);
    expect(md4).toContain('Zenith Ledger Corp');
    expect(md4).not.toContain(CANDIDATE_B_NAME);
    expect(md4).not.toContain(CANDIDATE_C_NAME);
    expect(md4).not.toContain(CANDIDATE_A_EMPLOYER);

    // Step 5: Failed upload after valid scan -> Clear Text -> Navigate away & return
    await page.getByRole('button', { name: /Try Another Job/i }).click();
    await page.getByRole('button', { name: /Clear Text/i }).first().click();
    const corruptPath = await writeTempFile(testInfo, 'corrupt-isolation.docx', buildCorruptDocxBuffer());
    await page.locator('input[type="file"]').first().setInputFiles(corruptPath);
    await expect(page.getByText(/File Extraction Notice:/i)).toBeVisible();
    await expect(page.getByText(/Resume Match Estimate/i)).toHaveCount(0);

    // Navigate away to /tools and back to /tools/resume-checker
    await page.goto('/tools');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
    await page.goto('/tools/resume-checker');
    await expect(page.getByPlaceholder(/Paste your complete resume here/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Resume Match Estimate/i)).toHaveCount(0);

    expect(telemetry.consoleErrors).toHaveLength(0);
    expect(telemetry.pageErrors).toHaveLength(0);
  });

  // =========================================================================
  // A6: Classic vs Spruce Design Parity Check
  // =========================================================================
  test('A6: Classic vs Spruce ResumeChecker authoritative score, dimensions & parity', async ({ page }) => {
    const telemetry = attachTelemetry(page);

    // 1. Run authoritative scan on Primary/Classic UI
    await initClassicPage(page);
    await runClassicScanViaInputs(page, CANDIDATE_A_RESUME, CANDIDATE_A_JD);

    const classicMidpoint = await page.locator('text=/Midpoint:\\s*\\d+\\/100/').first().textContent();
    const classicScore = Number(classicMidpoint!.match(/(\d+)\/100/)![1]);

    await page.getByRole('button', { name: /1\. Overview/i }).click();
    const classicDims: Record<string, string> = {};
    const dimLabels = [
      'Must-Have Skill Coverage',
      'Evidence & Implementation Depth',
      'Impact & Quantified Numerical Metrics',
      'Project Relevance & Open-Source Signals',
      'Seniority Alignment & Experience Fit',
      'Format, Layout & Parsing Safety',
      'Target Company Tier Alignment',
    ];
    for (const lbl of dimLabels) {
      const txt = await page
        .locator('div', { hasText: lbl })
        .filter({ hasText: /\/\s*\d+\s*pts/ })
        .last()
        .textContent();
      const m = txt!.match(/([\d.]+\s*\/\s*\d+)\s*pts/);
      classicDims[lbl] = m![1].replace(/\s+/g, ' ');
    }

    // 2. Switch to Spruce design via localStorage ('hireflow:v4:design = spruce')
    await page.evaluate(() => {
      window.localStorage.setItem('hireflow:v4:design', 'spruce');
    });
    await page.reload();

    await expect(page.getByRole('heading', { name: 'ATS Resume Roaster' })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('html')).toHaveAttribute('data-design', 'spruce');

    // Run exact same Candidate A + JD in Spruce UI
    await page.getByPlaceholder(/Paste your raw text or Markdown resume content here/i).fill(CANDIDATE_A_RESUME);
    await page.getByPlaceholder(/Paste target job description and requirements here/i).fill(CANDIDATE_A_JD);
    await page.getByRole('button', { name: /Scan & Roast Resume/i }).click();

    await expect(page.getByText('Overall ATS Score', { exact: true })).toBeVisible({ timeout: 15_000 });
    const spruceScoreText =
      (await page.getByText('Overall ATS Score', { exact: true }).locator('..').textContent()) || '';
    const spruceUiScore = Number(spruceScoreText.match(/(\d+)%/)?.[1] ?? NaN);
    expect(spruceUiScore).toBe(classicScore);

    // Collect all 7 Spruce SpecGrid dimension scores before checking strict parity
    const spruceLabels = [
      { spruce: 'Must-Have Coverage', classic: 'Must-Have Skill Coverage' },
      { spruce: 'Evidence Depth', classic: 'Evidence & Implementation Depth' },
      { spruce: 'Impact Metrics', classic: 'Impact & Quantified Numerical Metrics' },
      { spruce: 'Projects & OSS', classic: 'Project Relevance & Open-Source Signals' },
      { spruce: 'Seniority Fit', classic: 'Seniority Alignment & Experience Fit' },
      { spruce: 'Format & Parse', classic: 'Format, Layout & Parsing Safety' },
      { spruce: 'Tier Fit', classic: 'Target Company Tier Alignment' },
    ];
    const spruceDims: Record<string, string> = {};
    for (const pair of spruceLabels) {
      const cellText = await page
        .locator('div', { hasText: pair.spruce })
        .filter({ hasText: /\d+(?:\.\d+)?\s*\/\s*\d+/ })
        .last()
        .innerText();
      const m = cellText?.match(/([\d.]+\s*\/\s*\d+)/);
      spruceDims[pair.spruce] = m ? m[1].replace(/\s+/g, ' ') : `MISSING(${cellText?.trim() ?? 'null'})`;
    }

    // Verify Spruce Skills & Gaps tab & Actionability Plan tab
    const skillsTabBtn = page.getByRole('tab', { name: /Skills & Gaps/i });
    await skillsTabBtn.click();
    await expect(page.getByText('Requirement Skills Match')).toBeVisible();
    await expect(page.getByText('Apache Airflow').first()).toBeVisible();

    await page.getByRole('tab', { name: /Actionability Plan/i }).click();
    await expect(page.getByText('Recommended Priority Fixes')).toBeVisible();

    // Verify zero browser localStorage persistence during Spruce scan
    const spruceStoredRaw = await page.evaluate(() => window.localStorage.getItem('hireflow_tool_ats_v3'));
    expect(spruceStoredRaw).toBeNull();

    // Probe Spruce UI differences / parity gaps empirically
    await page.getByRole('tab', { name: /^Overview$/i }).click();
    const spruceHasExportButton =
      (await page.getByRole('button', { name: /Download|Export|PDF|DOCX|Markdown/i }).count()) > 0;
    const spruceHasCandidateName = await page.getByText(CANDIDATE_A_NAME).count();
    const spruceHasDoubleMinus = (await page.getByText('−-4pts:').count()) > 0;
    const spruceShowsRealCitationOnOverview =
      (await page.getByText(/18 million records per day/i).count()) > 0;

    // Emit structured comparison BEFORE strict 7-dimension parity assertion
    console.log(
      JSON.stringify({
        test: 'A6_CLASSIC_VS_SPRUCE',
        classicScore,
        spruceUiScore,
        classicDims,
        spruceDims,
        spruceHasExportButton,
        spruceHasCandidateName,
        spruceHasDoubleMinus,
        spruceShowsRealCitationOnOverview,
        consoleErrors: telemetry.consoleErrors.length,
        pageErrors: telemetry.pageErrors.length,
      })
    );

    // Strictly assert all 7 dimensions match Classic authoritative values
    for (const pair of spruceLabels) {
      expect(
        spruceDims[pair.spruce],
        `Spruce "${pair.spruce}" must equal Classic "${pair.classic}"`
      ).toBe(classicDims[pair.classic]);
    }

    expect(telemetry.consoleErrors).toHaveLength(0);
    expect(telemetry.pageErrors).toHaveLength(0);
  });

  // =========================================================================
  // DEFECT REPRODUCTIONS: Genuine src/ bugs observed during Phase 10.7 Chrome E2E
  // (Kept isolated so A1-A5 / A7-A9 execute end-to-end without masking src/ defects)
  // =========================================================================
  test('DEFECT-REPRO-1: JD prose "About the Role:\\nAt <Employer>..." must not corrupt targetRoleTitle', async ({ page }) => {
    await initClassicPage(page);
    await runClassicScanViaInputs(page, CANDIDATE_A_RESUME, CANDIDATE_A_JD_ABOUT_THE_ROLE);

    const storedRaw = await page.evaluate(() => window.localStorage.getItem('hireflow_tool_ats_v3'));
    expect(storedRaw).toBeNull();
    const roleBannerText = await page.locator('main, body').first().innerText();
    expect(roleBannerText).toContain(CANDIDATE_A_ROLE);
  });

  test('DEFECT-REPRO-2: Replacement invalid file upload after valid scan must clear stale resume & identity', async ({
    page,
  }, testInfo) => {
    await initClassicPage(page);
    const validDocxPath = await writeTempFile(
      testInfo,
      'candidate-a-valid.docx',
      await buildDocxBufferFromLines(CANDIDATE_A_RESUME.split('\n'))
    );
    await page.getByRole('button', { name: /^Upload File$/i }).first().click();
    await page.locator('input[type="file"]').first().setInputFiles(validDocxPath);
    await expect(page.getByText('candidate-a-valid.docx')).toBeVisible({ timeout: 10_000 });

    await page.getByPlaceholder(/Paste the target job description/i).fill(CANDIDATE_A_JD);
    await page.getByRole('button', { name: /Roast & Analyze Match/i }).click();
    await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();
    await expect(page.getByText(/Resume Match Estimate/i)).toBeVisible({ timeout: 15_000 });

    // Return to inputs via "Modify Inputs", then upload a corrupt .docx WITHOUT clicking "Remove File"
    await page.getByRole('button', { name: /Modify Inputs/i }).click();
    const corruptPath = await writeTempFile(testInfo, 'corrupt-replace.docx', buildCorruptDocxBuffer());
    await page.locator('input[type="file"]').first().setInputFiles(corruptPath);
    await expect(page.getByText(/File Extraction Notice:/i)).toBeVisible({ timeout: 10_000 });

    const staleFileChipVisible = await page.getByText('candidate-a-valid.docx').isVisible();
    console.log(
      JSON.stringify({
        test: 'DEFECT_REPRO_2_REPLACE_UPLOAD_STALE_STATE',
        staleFileChipVisible,
      })
    );
    expect(staleFileChipVisible).toBe(false);
  });

  test('DEFECT-REPRO-3: Spruce ResumeChecker full feature parity (Export button, no double-minus, Clear resets scan, audit store)', async ({
    page,
  }) => {
    await initClassicPage(page);
    await page.evaluate(() => {
      window.localStorage.setItem('hireflow:v4:design', 'spruce');
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'ATS Resume Roaster' })).toBeVisible({ timeout: 15_000 });

    await page.getByPlaceholder(/Paste your raw text or Markdown resume content here/i).fill(CANDIDATE_A_RESUME);
    await page.getByPlaceholder(/Paste target job description and requirements here/i).fill(CANDIDATE_A_JD);
    await page.getByRole('button', { name: /Scan & Roast Resume/i }).click();
    await expect(page.getByText(/Overall ATS Score/i)).toBeVisible({ timeout: 15_000 });

    const spruceHasExportButton =
      (await page.getByRole('button', { name: /Download|Export|PDF|DOCX|Markdown/i }).count()) > 0;
    const spruceHasDoubleMinus = (await page.getByText(/−-\d+\s*pts:/).count()) > 0;
    const spruceMd = await downloadReportFormat(page, /Markdown Report/i, '.md');
    const spruceMdText = spruceMd.buffer.toString('utf-8');
    expect(spruceMdText).toContain(CANDIDATE_A_NAME);
    expect(spruceMdText).toContain(CANDIDATE_A_EMPLOYER);
    expect(spruceMdText).toContain('91 / 100');

    await page.getByRole('button', { name: /^Clear$/i }).first().click();
    const spruceScoreStillVisibleAfterClear = await page.getByText(/Overall ATS Score/i).isVisible();

    console.log(
      JSON.stringify({
        test: 'DEFECT_REPRO_3_SPRUCE_PARITY',
        spruceHasExportButton,
        spruceHasDoubleMinus,
        spruceMdBytes: spruceMd.buffer.length,
        spruceScoreStillVisibleAfterClear,
      })
    );

    expect(spruceHasExportButton).toBe(true);
    expect(spruceHasDoubleMinus).toBe(false);
    expect(spruceScoreStillVisibleAfterClear).toBe(false);
  });
});
