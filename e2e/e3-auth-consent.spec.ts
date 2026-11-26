import { test, expect } from '@playwright/test';

test.describe('E3: Cloud-First Guest & OAuth Prompt Guard', () => {
  test('Guest navigation makes zero Supabase requests and preserves clean unauthenticated state', async ({ page }) => {
    const transportCalls: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('supabase.co')) {
        transportCalls.push(url);
      }
    });

    await page.goto('/portal');
    await page.waitForTimeout(1000);
    expect(transportCalls).toHaveLength(0);
  });
});
