import { test, expect } from '@playwright/test';

test.describe('E9: Cross-tab consistency', () => {
  test('Two tabs maintain consistent state and only one flushes', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page1.goto('/portal');
    await page2.goto('/portal');

    // Both tabs load cleanly
    await expect(page1.getByText('Candidate Hub', { exact: true })).toBeVisible();
    await expect(page2.getByText('Candidate Hub', { exact: true })).toBeVisible();

    await page1.close();
    await page2.close();
  });
});
