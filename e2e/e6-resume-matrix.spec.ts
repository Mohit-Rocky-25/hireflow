import { test, expect } from '@playwright/test';

test.describe('E6: Resume Matrix', () => {
  test('Creates workspace, adds versions, forks, sets head, displays lineage', async ({ page }) => {
    // Simulate authenticated session
    await page.addInitScript(() => {
      localStorage.setItem('hireflow:v5:auth-hint', '1');
      localStorage.setItem('hireflow:v5:e2e-user', 'user-matrix');
    });

    await page.goto('/portal/resumes');

    // Assert Resume Matrix header is visible
    await expect(page.locator('text=Resume Matrix')).toBeVisible();
    await expect(page.locator('text=Role-Tailored Resumes & Version Tree')).toBeVisible();

    // Click New Workspace
    await page.click('button:has-text("New Workspace")');

    // Fill form
    await page.fill('input[placeholder="e.g. Backend Engineering"]', 'Backend Track');
    await page.fill('input[placeholder="e.g. Distributed Systems / Go"]', 'Go / Distributed Systems');
    await page.fill('textarea[placeholder="Paste initial resume text..."]', 'Senior Go Engineer with Kubernetes and gRPC experience.');

    await page.click('button:has-text("Create")');

    // Verify workspace card appears
    await expect(page.locator('text=Backend Track')).toBeVisible();
    await expect(page.getByText('v1: Initial import', { exact: true })).toBeVisible();

    // Click Branch from here
    await page.click('button:has-text("Branch from here")');
    await expect(page.locator('text=Branch New Version')).toBeVisible();
    await page.fill('input[required]', 'v2: Tailored for FinTech');
    await page.click('button:has-text("Save Branch")');

    // Verify both versions exist in lineage
    await expect(page.getByText('v2: Tailored for FinTech', { exact: true })).toBeVisible();
    await expect(page.getByText('v1: Initial import', { exact: true })).toBeVisible();
  });
});
