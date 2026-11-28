import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'node:fs/promises';

const ARJUN_RESUME = `ARJUN KRISHNAN
arjun.krishnan@example.com | +1-206-555-0188 | Seattle, WA

SUMMARY
Backend engineer focused on TypeScript, Node.js, PostgreSQL, and Go services.

EXPERIENCE
Team Lead | NimbusPay | Jan 2022 - Present
- Worked on billing APIs in Node.js and PostgreSQL serving internal finance teams

EDUCATION
B.S. Computer Science, University of Washington (2025)

RESEARCH & PUBLICATIONS
- Co-authored distributed consensus note in UW Systems Workshop

SKILLS
TypeScript, Node.js, PostgreSQL, Go`;

test.describe('Phase 11.1.2 — End-to-End Integration, Editor, Upload & Export Parity Regressions', () => {
  test.setTimeout(90_000);

  test('verifies TalentLens opens Role Fit with immediate Fit & Gaps, scroll reset clears navbar, upload rejects corrupt PDF, and exports match edited Technologies/Education', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.addInitScript(() => {
      window.sessionStorage.setItem('hf_seen_cinematic', 'true');
    });

    // 1. Dual-JD Compare (/tools/jd-compare) must emit ZERO React 'tcs' duplicate-key console errors
    await page.goto('/tools/jd-compare');
    await expect(page.getByRole('heading', { name: /Compare Two Job Descriptions/i })).toBeVisible({
      timeout: 15_000,
    });
    expect(consoleErrors.filter((e) => e.includes('tcs'))).toEqual([]);

    // 2. TalentLens (/demo/company/google) -> Tailor for this Role must land in Role Fit with Fit & Gaps immediately populated
    await page.goto('/demo/company/google');
    await page.getByRole('button', { name: /Select Role/i }).first().click();
    await page.getByRole('button', { name: /Load Sample Resume & Verify/i }).first().click();
    await page.getByRole('button', { name: /Analyse My Fit/i }).first().click();
    const tailorForRoleBtn = page.getByRole('button', { name: /Tailor for this Role/i });
    await tailorForRoleBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await tailorForRoleBtn.click();
    await page.waitForURL('**/tools/tailor?ctx=**');
    await expect(page.getByRole('button', { name: /Role Fit/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByRole('tab', { name: /Fit & Gaps/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText(/Switch to Target Role/i)).not.toBeVisible();

    // 3. Entry View: Upload corrupt PDF shows clear error alert; scrolled Paste resets viewport cleanly below navbar
    await page.getByRole('button', { name: /Switch resume or return to workspace entry/i }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'corrupt.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\ncorrupt-invalid-stream-without-pages'),
    });
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });

    // Scroll down Entry View before initializing paste
    await page.evaluate(() => window.scrollTo(0, 700));
    await page.getByLabel(/Paste resume text/i).fill(ARJUN_RESUME);
    await page.getByRole('button', { name: /Initialize Workspace from Paste/i }).click();

    await expect(page.getByRole('button', { name: /Export PDF/i })).toBeVisible({ timeout: 10_000 });
    // Verify scroll reset placed #main-content h1 clearly below sticky navbar
    const overlapCheck = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      const h1 = document.querySelector('#main-content h1');
      return {
        navBottom: nav ? Math.round(nav.getBoundingClientRect().bottom) : 0,
        h1Top: h1 ? Math.round(h1.getBoundingClientRect().top) : 0,
      };
    });
    expect(overlapCheck.h1Top).toBeGreaterThanOrEqual(overlapCheck.navBottom);

    // 4. Add empty custom section + add entry + edit header headline + inspect generated PDF & DOCX binaries
    await page.getByRole('button', { name: /Edit candidate name and contact/i }).click();
    await page.getByLabel(/Candidate headline/i).fill('Team Lead — Go & PostgreSQL Services');
    await page.getByRole('button', { name: /Save candidate header/i }).click();

    await page.getByLabel(/New custom section title/i).fill('Open Source');
    await page.getByRole('button', { name: /Add custom section/i }).click();
    await page.getByRole('button', { name: /Add entry to Open Source/i }).click();
    await page.getByLabel(/New entry title/i).fill('Go Retry Library');
    await page.getByLabel(/New entry technologies/i).fill('Go, PostgreSQL');
    await page.getByRole('button', { name: /Save Entry/i }).click();

    // Verify Education & NO placeholder in Canvas and exports
    const pdfDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export PDF/i }).click();
    const pdfDownload = await pdfDownloadPromise;
    const pdfPath = await pdfDownload.path();
    const pdfBuf = new Uint8Array(await fs.readFile(pdfPath!));
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuf, verbosity: 0 }).promise;
    const p1 = await pdfDoc.getPage(1);
    const tc = await p1.getTextContent();
    const pdfText = tc.items.map((it: any) => it.str || '').join(' ');
    expect(pdfText).toContain('University of Washington');
    expect(pdfText).toContain('Team Lead');
    expect(pdfText).toContain('PostgreSQL Services');
    expect(pdfText).toContain('Technologies: Go, PostgreSQL');
    expect(pdfText).not.toContain('University / Institute');
    expect(pdfText).not.toContain('JavaScript');

    const docxDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /^DOCX$/i }).click();
    const docxDownload = await docxDownloadPromise;
    const docxPath = await docxDownload.path();
    const docxBuf = await fs.readFile(docxPath!);
    const zip = await JSZip.loadAsync(docxBuf);
    const docxXml = await zip.file('word/document.xml')!.async('string');
    expect(docxXml).toContain('University of Washington');
    expect(docxXml).toContain('Technologies: Go, PostgreSQL');
    expect(docxXml).not.toContain('University / Institute');

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
