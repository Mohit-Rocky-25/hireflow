import { test, expect } from '@playwright/test';

test.describe('E6: Resume Matrix', () => {
  test('Requires authenticated cloud account for /portal/resumes or works inside authenticated harness', async ({ page }) => {
    await page.goto('/portal/resumes');
    await expect(page.getByText(/Resume Matrix|Sign in with Google|Sign in to your account/i).first()).toBeVisible();
  });
});
