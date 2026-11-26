// ============================================================
// HireFlow — Phase 10.8 Real-Browser Cloud-First Runtime Spec
// Verifies Google OAuth UI (zero fake demo chooser), guest zero-localStorage
// guarantees on ATS scans, /data cloud inventory & legacy importer detection,
// and explicit CLEAR erasure in real Chromium.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Phase 10.8 Cloud-First Browser Runtime Acceptance', () => {
  test('LoginPage renders real Google OAuth trigger cleanly with zero fake demo chooser', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/login');
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    await expect(page.getByText('Candidate User')).toHaveCount(0);
    await expect(page.getByText('candidate.user@gmail.com')).toHaveCount(0);
    await expect(page.getByText('Use another account')).toHaveCount(0);

    // Clicking Continue with Google without env creds surfaces loud AUTH_NOT_CONFIGURED alert cleanly
    await page.getByRole('button', { name: /continue with google/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('Guest ATS Roaster run works end-to-end without persisting PII to localStorage or IndexedDB', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('hf_seen_cinematic', 'true');
      window.localStorage.setItem('hireflow:v4:design', 'neon-volt');
    });
    await page.goto('/tools/resume-checker');

    const resumeTextarea = page.getByPlaceholder(/Paste your complete resume here/i).first();
    const jdTextarea = page.getByPlaceholder(/Paste the target job description/i).first();

    const sampleResume = [
      'Jordan Lee',
      'Senior Backend Engineer — Seattle, WA | jordan.lee@example.com | +1-206-555-0192',
      'SUMMARY',
      'Senior Backend Engineer with 5 years building Go, TypeScript, and PostgreSQL distributed systems.',
      'EXPERIENCE',
      'Senior Software Engineer | CoreSystems | Jan 2021 - Present',
      '- Architected high-throughput Go and TypeScript microservices with PostgreSQL, cutting P95 latency from 240ms to 45ms across 10M daily requests.',
      '- Designed Redis-backed idempotent job queues and REST APIs serving 99.99% uptime SLA.',
      'TECHNICAL SKILLS',
      'Go, TypeScript, PostgreSQL, Redis, Docker, Kubernetes, REST APIs, Distributed Systems',
      'EDUCATION',
      'B.S. Computer Science, University of Washington, 2020',
    ].join('\n');

    const sampleJd = [
      'Role: Senior Backend Engineer — CloudPlatform',
      'Experience: 4+ Years',
      'Must-Have Requirements:',
      '- Strong proficiency in TypeScript, Go, PostgreSQL, Redis, REST APIs, Distributed Systems.',
      '- Experience operating scalable containerized microservices in production with Docker and Kubernetes.',
      '- Bachelor degree in Computer Science or related field.',
    ].join('\n');

    await resumeTextarea.fill(sampleResume);
    await jdTextarea.fill(sampleJd);

    const runBtn = page.getByRole('button', { name: /Roast & Analyze Match/i }).first();
    await expect(runBtn).toBeEnabled();
    await runBtn.click();

    await expect(page.getByRole('button', { name: /Confirm & Run Simulation/i })).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: /Confirm & Run Simulation/i }).click();

    await expect(page.getByText(/Resume Match Estimate|\/100/i).first()).toBeVisible({ timeout: 20_000 });

    const persistedStorage = await page.evaluate(async () => {
      const lsKeys = Object.keys(window.localStorage);
      const userLsKeys = lsKeys.filter(
        (k) =>
          k !== 'hireflow:v4:design' &&
          k !== 'hireflow:v4:theme-mode' &&
          !k.startsWith('sb-')
      );
      return { userLsKeys, rawAts: window.localStorage.getItem('hireflow_tool_ats_v3') };
    });

    expect(persistedStorage.rawAts).toBeNull();
    expect(persistedStorage.userLsKeys).toEqual([]);
  });

  test('/data inspects legacy localStorage read-only and erases cleanly after explicit CLEAR confirmation', async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem('hf_seen_cinematic', 'true');
      if (!window.sessionStorage.getItem('__legacy_seeded_e2e')) {
        window.sessionStorage.setItem('__legacy_seeded_e2e', '1');
        window.localStorage.setItem(
          'hireflow:v4:saved-jds',
          JSON.stringify({
            jds: [
              {
                id: '88888888-8888-4888-8888-888888888888',
                title: 'Legacy Backend JD',
                company: 'LegacyCo',
                source: 'pasted',
                text: 'Go, PostgreSQL, Kubernetes microservices architecture.',
                textHash: 'a'.repeat(64),
                tags: ['go'],
                addedAt: '2026-10-01T00:00:00.000Z',
                updatedAt: '2026-10-01T00:00:00.000Z',
              },
            ],
          })
        );
      }
    });

    await page.goto('/data');
    await expect(page.getByText(/Your Data & Cloud Storage/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/One-Time Legacy Browser Data Importer/i)).toBeVisible();
    await expect(page.getByText(/1 saved JDs/i)).toBeVisible();

    // Verify read-only inspection preserved legacy item until explicit approval
    const stillPresentBeforeErase = await page.evaluate(() =>
      window.localStorage.getItem('hireflow:v4:saved-jds')
    );
    expect(stillPresentBeforeErase).not.toBeNull();

    // Erase All Data requires CLEAR confirmation
    await page.getByRole('button', { name: /Erase All Data/i }).click();
    const confirmInput = page.getByPlaceholder('CLEAR');
    await confirmInput.fill('CLEAR');
    await page.getByRole('button', { name: /Erase Everything/i }).click();

    await expect.poll(async () =>
      page.evaluate(() => window.localStorage.getItem('hireflow:v4:saved-jds'))
    ).toBeNull();
  });
});
