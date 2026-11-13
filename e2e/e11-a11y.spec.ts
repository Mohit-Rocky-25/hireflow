import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('E11: Accessibility Guard (WCAG 2.1 AA)', () => {
  test('verifies /tools/resume-checker has zero critical accessibility violations', async ({ page }) => {
    await page.goto('/tools/resume-checker');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );

    expect(criticalViolations).toHaveLength(0);
  });
});

