import { test, expect } from '@playwright/test';

test.describe('Phase 9: Demo Registration -> My Space -> Tools -> Refresh -> Sign Out', () => {
  test.setTimeout(60_000);
  test('full user journey from demo registration through My Space, tools, reload persistence, and sign-out protection', async ({
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

    // 1. Open HireFlow landing & navigate to Demo Registration
    await page.goto('/');
    const demoLink = page.getByRole('link', { name: /Demo Mode/i }).first();
    await expect(demoLink).toBeVisible({ timeout: 15_000 });
    await demoLink.click();

    // 2. Validate form errors on invalid input, then register demo user
    await expect(page.getByRole('heading', { name: /Register Demo Workspace/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Enter Demo My Space/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();

    await page.getByLabel(/Full Name/i).fill('Ananya Rao');
    await page.getByLabel(/Email Address/i).fill('ananya@example.com');
    await page.getByRole('button', { name: /Enter Demo My Space/i }).click();

    // 3. Enter My Space
    await page.waitForURL('**/my-space**');
    await expect(page.getByText(/Demo Mode Active:/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ananya' })).toBeVisible();

    // 4. Explore discovered My Space subsections
    await page.getByRole('button', { name: /Scans & Audits/i }).click();
    await expect(page.getByText(/ATS Roast|TalentLens/i).first()).toBeVisible();

    await page.getByRole('button', { name: /Resume Matrix/i }).click();
    await expect(page.getByText(/Role-Tailored Resumes & Version Tree/i)).toBeVisible();

    await page.getByRole('button', { name: /Target Watchlist/i }).click();
    await expect(page.getByRole('heading', { name: 'Targets', exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Skill & Build Plan/i }).click();
    await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Outreach Vault/i }).click();
    await expect(page.getByRole('heading', { name: 'Outreach', exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Saved JDs/i }).click();
    await expect(page.getByRole('heading', { name: 'Saved JDs', exact: true })).toBeVisible();

    await page.getByRole('button', { name: /Profile & Identity/i }).click();
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();

    // 5. Open existing tools & verify routes load cleanly
    await page.goto('/tools/resume-checker');
    await expect(page.getByPlaceholder(/Paste your complete resume here/i)).toBeVisible({ timeout: 15_000 });

    await page.goto('/demo');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15_000 });

    await page.goto('/tools/jd-compare');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15_000 });

    await page.goto('/tools/tailor');
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15_000 });

    // 6. Return to My Space & refresh -> verify demo session restores & mobile drawer works
    await page.goto('/my-space');
    await expect(page.getByRole('heading', { name: 'Ananya' })).toBeVisible({ timeout: 15_000 });
    await page.reload();
    await expect(page.getByText(/Demo Mode Active:/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Ananya' })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('button', { name: /Open workspace navigation/i })).toBeVisible();

    // 7. Sign out & verify protected My Space is no longer accessible
    await page.getByRole('button', { name: /Open workspace navigation/i }).click();
    await page.locator('button:visible', { hasText: /Sign out/i }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto('/my-space');
    await expect(page.getByText(/Workspace access required/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Register Demo Session/i })).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
