import { test, expect } from '@playwright/test';

test.describe('Phase 12 — My Space Responsive Layouts, Filtering, Continuation & Handoffs', () => {
  test.setTimeout(90_000);

  test('verifies 1440px/1280px/768px/390px overflow-free layouts, real data continuation, filters, and Tailor handoff', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.addInitScript(() => {
      window.sessionStorage.setItem('hf_seen_cinematic', 'true');
    });

    // Register in Demo Mode & enter My Space
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill('Ananya Rao');
    await page.getByLabel(/Email Address/i).fill('ananya@example.com');
    await page.getByRole('button', { name: /Enter Demo My Space/i }).click();
    await page.waitForURL('**/my-space**');

    // Verify new Overview hierarchy & asset summary strip
    await expect(page.getByRole('heading', { name: 'Ananya' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Demo Session · RAM Only/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Continue where you left off/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Recent activity/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /Connected HireFlow Tools/i })).toBeVisible();

    // Check zero horizontal overflow across 1440px, 1280px, 768px, 390px + capture after screenshots
    await page.screenshot({
      path: 'C:/Users/yadav/.gemini/antigravity/brain/1b42eb7d-0313-49ea-a256-61804184f8c6/scratch/phase12-after-desktop-1440.png',
      fullPage: true,
    });

    for (const vp of [
      { width: 1440, height: 900 },
      { width: 1280, height: 800 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(vp);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflow, `Unexpected horizontal overflow at ${vp.width}px`).toBe(false);
    }

    await page.screenshot({
      path: 'C:/Users/yadav/.gemini/antigravity/brain/1b42eb7d-0313-49ea-a256-61804184f8c6/scratch/phase12-after-mobile-390.png',
      fullPage: true,
    });

    // Test mobile navigation drawer + clear sidebar filter + section switch
    await page.getByRole('button', { name: /Open workspace navigation/i }).click();
    const drawer = page.getByRole('dialog', { name: /Workspace navigation drawer/i });
    const navFilter = drawer.getByLabel(/Filter My Space sections or tools/i);
    await navFilter.fill('Progression');
    await drawer.getByRole('button', { name: /Score Progression/i }).click();
    await expect(page.getByRole('heading', { name: 'Score Progression', exact: true })).toBeVisible();

    // Verify Profile shows honest Demo disclosure (never Cloud synced)
    await page.goto('/my-space/profile');
    await expect(page.getByText(/Demo Mode active \(session memory only\)/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete my cloud data/i })).not.toBeVisible();

    // Verify Tailor handoff from My Space Overview
    await page.goto('/my-space');
    await page.getByRole('button', { name: /Tailor My Resume/i }).first().click();
    await page.waitForURL('**/tools/tailor**');
    await expect(page.getByRole('button', { name: /Export PDF/i })).toBeVisible({ timeout: 15_000 });

    expect(pageErrors).toEqual([]);
  });
});
