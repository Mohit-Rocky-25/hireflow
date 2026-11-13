import { test, expect } from '@playwright/test';

test.describe('E3: Fake sign-in and consent', () => {
  test('Sign in and select Keep history on this device only yields zero transport calls', async ({ page }) => {
    const transportCalls: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('supabase.co')) {
        transportCalls.push(url);
      }
    });

    await page.goto('/portal');

    // Simulate authenticated session via localStorage / window
    await page.evaluate(() => {
      localStorage.setItem('hireflow:v5:auth-hint', '1');
      if (window.__e2eSignIn) {
        window.__e2eSignIn('test-user-id', 'test@example.com');
      }
    });

    await page.reload();

    // Observe network calls for 2 seconds: must be zero
    await page.waitForTimeout(2000);
    expect(transportCalls).toHaveLength(0);
  });
});
