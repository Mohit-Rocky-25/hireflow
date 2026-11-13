import { test, expect } from '@playwright/test';

test.describe('E2: Portal gate', () => {
  test('Guest visits /portal: Gate is shown and no Supabase request made', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('supabase.co') || url.includes('googleapis.com')) {
        externalRequests.push(url);
      }
    });

    await page.goto('/portal');

    // Assert Portal gate is visible
    await expect(page.locator('text=Sign In to Unlock Candidate Command Center')).toBeVisible();
    await expect(page.locator('text=Privacy Guarantee')).toBeVisible();

    // In a build where auth is unconfigured, button has exact disabled text
    const disabledBtn = page.locator('button:has-text("Accounts are not enabled in this build")');
    const normalBtn = page.locator('button:has-text("Sign in with Google")');

    const hasDisabled = await disabledBtn.isVisible();
    const hasNormal = await normalBtn.isVisible();
    expect(hasDisabled || hasNormal).toBe(true);

    // Verify ZERO external requests were made to Supabase
    expect(externalRequests).toHaveLength(0);
  });
});
