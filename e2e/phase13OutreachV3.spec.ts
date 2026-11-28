import { test, expect } from '@playwright/test';

test.describe('Phase 13 — Outreach V3 Studio & My Space Vault Closed-Loop Journey', () => {
  test.setTimeout(90_000);

  test('verifies empty defaults, Sample Mode, editable composer guards, Vault save, Mark as Sent, Follow-Up, and Draft Restore', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.addInitScript(() => {
      window.sessionStorage.setItem('hf_seen_cinematic', 'true');
    });

    // 1. Register Demo user cleanly so My Space Vault is available
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill('Riya Kulkarni');
    await page.getByLabel(/Email Address/i).fill('riya@example.com');
    await page.getByRole('button', { name: /Enter Demo My Space/i }).click();
    await page.waitForURL('**/my-space**');

    // 2. Open Reach Out via SPA navigation (preserves Demo RAM session) and verify empty safe defaults
    await page.getByRole('link', { name: /Reach Out/i }).first().click();
    await page.waitForURL('**/tools/reach-out**');
    await expect(page.getByRole('heading', { name: 'Reach Out' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder('Enter target company')).toHaveValue('');
    await expect(page.getByPlaceholder("Contact's name")).toHaveValue('');

    // 3. Explicit Load Sample & Clear Sample
    await page.getByRole('button', { name: /Load Sample/i }).click();
    await expect(page.getByText(/Sample Mode Active/i)).toBeVisible();
    await page.getByRole('button', { name: /Clear Sample/i }).click();
    await expect(page.getByPlaceholder('Enter target company')).toHaveValue('');

    // 4. Fill authentic target/candidate details & test manual edit + over-limit blocker
    await page.getByPlaceholder('Enter target company').fill('Acme Systems');
    await page.getByPlaceholder('e.g. Backend Software Engineer').fill('Backend Engineer');
    await page.getByPlaceholder("Contact's name").fill('Kiran Mehta');
    await page.getByPlaceholder('Your name').fill('Riya Kulkarni');
    await page.getByPlaceholder(/e.g. TypeScript, Go/i).fill('Go & PostgreSQL');
    await page
      .getByPlaceholder(/State concrete work you built/i)
      .fill('built Go worker queue handling 4,500 jobs/sec in local test');

    const bodyBox = page.getByLabel(/Message Body/i);
    await expect(bodyBox).toContainText('Acme Systems');

    // Exceed 200-char Free LinkedIn limit manually -> Copy & Ready Save disabled
    await bodyBox.fill('Hi Kiran, ' + 'detail '.repeat(35));
    await expect(page.getByText(/Edited Manually/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Message/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Save to Vault/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /Save Incomplete Draft/i })).toBeEnabled();

    // Trim within limit -> Save Ready Draft to Vault
    await bodyBox.fill(
      'Hi Kiran, I work with Go & PostgreSQL and built a worker queue handling 4,500 jobs/sec. Open to connecting for Backend Engineer roles at Acme Systems? Best, Riya'
    );
    await expect(page.getByRole('button', { name: /Save to Vault/i })).toBeEnabled();
    await page.getByRole('button', { name: /Save to Vault/i }).click();

    // 5. Navigate to My Space Outreach Vault via SPA link -> Mark as Sent -> Draft Follow-Up -> Open Saved Draft
    await page.getByRole('link', { name: /Open My Space Outreach Vault/i }).click();
    await page.waitForURL('**/my-space/outreach**');
    await expect(page.getByText('Kiran Mehta', { exact: true })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: /Mark as Sent/i }).first().click();
    await expect(page.getByText(/Follow-up due/i).first()).toBeVisible();

    // Open in Reach Out -> restores exact saved body
    await page.getByRole('button', { name: /Open in Reach Out/i }).first().click();
    await page.waitForURL('**/tools/reach-out?draftId=**');
    await expect(page.getByLabel(/Message Body/i)).toContainText('4,500 jobs/sec');

    // Return to Vault via SPA link & click Draft Follow-Up -> keeps real channel & switches intent to Follow-Up
    await page.getByRole('link', { name: /Open My Space Outreach Vault/i }).click();
    await page.waitForURL('**/my-space/outreach**');
    await page.getByRole('button', { name: /Draft Follow-Up/i }).first().click();
    await page.waitForURL('**/tools/reach-out?followUpFrom=**');
    await expect(page.getByText(/Linked Follow-Up/i)).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('verifies Spruce theme Reach Out Studio with clean Channel vs Intent separation and Vault save', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.addInitScript(() => {
      window.sessionStorage.setItem('hf_seen_cinematic', 'true');
      window.localStorage.setItem('hireflow:v4:design', 'spruce');
    });

    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill('Aarav Shah');
    await page.getByLabel(/Email Address/i).fill('aarav@example.com');
    await page.getByRole('button', { name: /Enter Demo My Space/i }).click();
    await page.waitForURL('**/my-space**');

    await page.getByRole('link', { name: /Reach Out/i }).first().click();
    await page.waitForURL('**/tools/reach-out**');
    await expect(page.getByRole('heading', { name: /Direct Outreach & Message Studio/i })).toBeVisible({
      timeout: 15_000,
    });

    // Verify clean communication channels (no Follow-Up / Warm Referral channel tabs)
    await expect(page.getByRole('tab', { name: 'LinkedIn Connect' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Email', exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Follow-Up', exact: true })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Warm Referral', exact: true })).toHaveCount(0);

    // Load Sample -> Clear -> Fill -> Save to Vault
    await page.getByRole('button', { name: /Load Sample/i }).click();
    await expect(page.getByText(/Sample Mode Active/i)).toBeVisible();
    await page.getByRole('button', { name: /Clear Sample/i }).click();

    await page.getByPlaceholder('Company name').fill('Nova Cloud');
    await page.getByPlaceholder('Contact name').fill('Meera Nair');
    await page.getByPlaceholder('Target role').fill('Platform Engineer');
    await page.getByPlaceholder('e.g. TypeScript, Go, PostgreSQL').fill('Go, Kubernetes');
    await page
      .getByPlaceholder('Verified project or outcome')
      .fill('built Go autoscaler reducing cold starts by 38%');

    // Trim body cleanly if needed so Free LinkedIn 200-char limit passes
    const bodyBox = page.locator('textarea').last();
    await bodyBox.fill(
      'Hi Meera, I work with Go, Kubernetes and built a Go autoscaler reducing cold starts by 38%. Open to connecting for Platform Engineer roles at Nova Cloud? Best, Aarav'
    );

    await page.getByRole('button', { name: /Save to Vault/i }).click();
    await page.getByRole('link', { name: /Open Vault/i }).click();
    await page.waitForURL('**/my-space/outreach**');
    await expect(page.getByText('Meera Nair', { exact: true })).toBeVisible({ timeout: 15_000 });

    expect(pageErrors).toEqual([]);
  });
});
