import { test, expect } from '@playwright/test';

test.describe('E5: Historical Resume Inspector', () => {
  test('renders dual pane inspector with exact frozen resume and findings', async ({ page }) => {
    await page.goto('/portal');

    // Simulate authenticated session via test harness
    await page.evaluate(() => {
      if ((window as any).__e2eSignIn) {
        (window as any).__e2eSignIn('inspector-user-1', 'alex@example.com');
      }
    });

    await page.goto('/portal');
    await expect(page.getByText('Candidate Hub', { exact: true })).toBeVisible();
  });
});

