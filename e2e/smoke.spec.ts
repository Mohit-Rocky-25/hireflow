import { test, expect } from '@playwright/test';

test('smoke test: loads / and asserts title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/HireFlow/);
});
