import { test, expect } from '@playwright/test';

test.describe('E8: Cloud-First Network Error Honesty', () => {
  test('App handles offline state without crashing or writing legacy outbox keys', async ({ page, context }) => {
    await page.goto('/tools/resume-checker');
    await context.setOffline(true);
    await page.waitForTimeout(400);
    await context.setOffline(false);
    await page.waitForTimeout(400);

    const outboxExists = await page.evaluate(() =>
      Object.keys(window.localStorage).some((k) => k.includes('outbox') || k.includes('sim_cloud'))
    );
    expect(outboxExists).toBe(false);
  });
});
