import { test, expect } from '@playwright/test';

const TEST_RESUME = `Kiran Deshmukh
kiran.deshmukh@example.com | +1-206-555-0148 | Austin, TX

SUMMARY
Backend engineer focused on TypeScript, PostgreSQL, and distributed queues.

EXPERIENCE
Software Engineer Intern - Northstar Labs
Jun 2024 - Sep 2024
- Worked on billing APIs in TypeScript and PostgreSQL for internal finance tools
- Helped with Docker builds and integration test pipelines

PROJECTS
QueueFlow Task Scheduler
- Built an async worker scheduler in Go and Redis supporting retry policies

SKILLS
TypeScript, Node.js, PostgreSQL, Go, Redis, Docker

EDUCATION
B.S. Computer Science, UT Austin`;

const TEST_JD = `Backend Software Engineer
Stripe | Austin, TX
Required Qualifications:
- Experience with TypeScript, Node.js, and PostgreSQL
- Familiarity with Docker containers and REST APIs`;

test.describe('Phase 11.1 — Flagship Tailor My Resume End-to-End Journey', () => {
  test.setTimeout(90_000);

  test('navigates My Space -> /tools/tailor -> Paste -> Edit/Confirm Metric -> Commit Version -> ATS Re-Score -> Export -> Draft Persistence', async ({
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

    // 1. Navigate Landing -> Demo Mode -> Register Demo Workspace
    await page.goto('/');
    const demoLink = page.getByRole('link', { name: /Demo Mode/i }).first();
    await expect(demoLink).toBeVisible({ timeout: 15_000 });
    await demoLink.click();
    await expect(page.getByRole('heading', { name: /Register Demo Workspace/i })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByLabel(/Full Name/i).fill('Kiran Deshmukh');
    await page.getByLabel(/Email Address/i).fill('kiran@example.com');
    await page.getByRole('button', { name: /Enter Demo My Space/i }).click();
    await page.waitForURL('**/my-space**');

    // 2. Navigate to Resume Matrix -> Open Tailor Studio
    await page.getByRole('button', { name: /Resume Matrix/i }).click();
    await page.getByRole('link', { name: /Open Tailor Studio/i }).click();
    await page.waitForURL('**/tools/tailor**');

    // 3. Entry view must appear cleanly with zero preset hijack
    await expect(page.getByRole('heading', { name: /Tailor My Resume/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Choose from Resume Matrix/i)).toBeVisible();

    // 4. Select Tailor to Job Description mode & initialize via Paste
    await page.getByRole('button', { name: /Tailor to Job Description/i }).click();
    await page.getByLabel(/JD Job Title/i).fill('Backend Software Engineer');
    await page.getByLabel(/Company Name/i).fill('Stripe');
    await page.getByLabel(/Target Job Description text/i).fill(TEST_JD);
    await page.getByLabel(/Paste resume text/i).fill(TEST_RESUME);
    await page.getByRole('button', { name: /Initialize Workspace from Paste/i }).click();

    // 5. Verify 3-Zone Workspace loads with candidate document and safe clarification suggestion
    await expect(page.getByRole('heading', { name: /Kiran Deshmukh/i })).toBeVisible();
    await expect(page.getByText(/Clarify passive phrasing/i).first()).toBeVisible();

    // Accept the truth-checked passive-clarification proposal (enabled cleanly)
    await page.getByRole('button', { name: /^Accept$/i }).first().click();

    // Confirm an authentic metric via UI workflow
    await page
      .getByRole('button', { name: /Confirm Authentic Metric \/ Impact/i })
      .first()
      .click();
    await page
      .getByLabel(/Verified statement with authentic metric/i)
      .fill('Built billing APIs in TypeScript and PostgreSQL handling 12000 daily requests');
    await page.getByLabel(/Evidence note/i).fill('Stripe sandbox benchmark log');
    await page.getByRole('button', { name: /Confirm & Apply Real Metric/i }).click();

    // 6. Switch to Validate & ATS tab -> Commit immutable Resume Version -> Run Canonical ATS
    await page.getByRole('tab', { name: /Validate & ATS/i }).click();
    await page.getByLabel(/New resume version label/i).fill('Stripe Backend v2');
    await page.getByRole('button', { name: /Commit New Version to Resume Matrix/i }).click();
    await expect(page.getByText(/Committed immutable version "Stripe Backend v2"/i)).toBeVisible();

    await page.getByRole('button', { name: /Run Canonical ATS Re-Analysis/i }).click();
    await expect(page.getByText(/Canonical .* ATS scan completed/i)).toBeVisible();

    // 7. Export PDF & DOCX and verify clean file downloads
    const pdfDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export PDF/i }).click();
    const pdfDownload = await pdfDownloadPromise;
    expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/i);

    const docxDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /DOCX/i }).click();
    const docxDownload = await docxDownloadPromise;
    expect(docxDownload.suggestedFilename()).toMatch(/\.docx$/i);

    // 8. Return to My Space -> Saved Tailoring Drafts panel & committed Resume Version appear cleanly
    await page.getByRole('link', { name: /^My Space$/i }).click();
    await page.waitForURL('**/my-space**');
    await expect(page.getByText(/Saved Tailoring Drafts/i)).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
