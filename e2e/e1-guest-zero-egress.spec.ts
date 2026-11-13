import { test, expect } from '@playwright/test';

test.describe('E1: Guest Zero-Egress Sandbox (C2)', () => {
  test('navigates to tools and ensures zero network egress to remote origins', async ({ page }) => {
    const egressRequests: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (
        url.includes('supabase.co') ||
        url.includes('google.com/auth') ||
        url.includes('googleapis.com') ||
        url.includes('analytics') ||
        url.includes('telemetry')
      ) {
        egressRequests.push(url);
      }
    });

    await page.goto('/tools/resume-checker');
    await page.waitForLoadState('networkidle');

    // Guest should make zero requests to any forbidden origin
    expect(egressRequests).toHaveLength(0);
  });
});

