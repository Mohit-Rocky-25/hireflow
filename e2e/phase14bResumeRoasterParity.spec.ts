import { test, expect, type Browser, type Page } from '@playwright/test';

const SAMPLE_RESUME = `Riya Kulkarni
riya@example.com | +91 9876543210 | github.com/riya-dev | linkedin.com/in/riya-kulkarni

Summary
Backend software engineer experienced in building distributed Go services, PostgreSQL data pipelines, and containerized microservices.

Education
B.Tech Computer Science, Pune Institute of Technology, 2024 (CGPA 8.9)

Experience
Backend Engineer, Acme Systems (Jan 2024 - Jan 2026)
- Architected Go and PostgreSQL worker queue processing 4,500 jobs/sec with 99.9% reliability.
- Deployed Dockerized REST APIs with Redis caching, reducing p95 API latency by 38%.
- Automated CI/CD integration tests and database schema migrations for zero-downtime releases.

Projects
Distributed Rate Limiter
- Built token-bucket rate limiter in Go and Redis supporting 10,000 requests/sec in local benchmarks.
- Containerized service using Docker Compose and documented OpenAPI endpoints.

Skills
Go, PostgreSQL, Docker, REST APIs, Redis, Git, SQL`;

const COMPOUND_RESUME = `Aarav Shah
aarav@example.com | +91 9876543210 | github.com/aarav-dev

Education
B.Tech Computer Science, State University, 2022

Experience
Backend Engineer, CloudGrid (Jan 2023 - Jan 2026)
- Engineered Python APIs backed by MySQL handling 4,000 req/s with 99.9% uptime.
- Deployed services to Kubernetes clusters with automated rollbacks reducing deploy time by 35%.
- Collaborated with cross-functional teams on sprint planning, observability, and release checklists.

Skills
Python, MySQL, Kubernetes`;

interface NormalizedParitySnapshot {
  score: string;
  bandLabel: string;
  guidance: string | null;
  bodyUpper: string;
  skillsBodyUpper: string;
  recommendationsUpper: string;
}

function extractScore(text: string): string {
  const m = text.match(/\b(\d{1,3})\s*(?:\/\s*100|%)/);
  if (!m) throw new Error(`Could not extract score from:\n${text.slice(0, 600)}`);
  return m[1];
}

function extractGuidance(text: string): string | null {
  const lower = text.toLowerCase();
  const options = [
    'Ready to apply',
    'Apply after high-priority fixes',
    'Build evidence before applying',
    'Insufficient evidence to evaluate',
  ];
  return options.find((o) => lower.includes(o.toLowerCase())) ?? null;
}

function extractBand(text: string): string {
  const bands = ['Strong', 'Moderate', 'Developing', 'Weak', 'Critical'];
  for (const b of bands) {
    if (new RegExp(`\\b${b}\\s+(?:Candidate\\s+)?Match\\b`, 'i').test(text)) {
      return b.toLowerCase();
    }
  }
  return 'unknown';
}

async function runThemeScenario(
  browser: Browser,
  theme: 'neon-volt' | 'spruce',
  resume: string,
  jd: string
): Promise<NormalizedParitySnapshot> {
  const context = await browser.newContext();
  const page: Page = await context.newPage();
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.addInitScript((selectedTheme) => {
    window.sessionStorage.setItem('hf_seen_cinematic', 'true');
    window.localStorage.setItem('hireflow:v4:design', selectedTheme);
  }, theme);

  await page.goto('/tools/resume-checker');
  const textareas = page.locator('textarea');
  await expect(textareas.first()).toBeVisible({ timeout: 15_000 });
  await textareas.nth(0).click();
  await textareas.nth(0).fill(resume);
  await expect(textareas.nth(0)).toHaveValue(resume);
  await textareas.nth(1).click();
  await textareas.nth(1).fill(jd);
  await expect(textareas.nth(1)).toHaveValue(jd);

  if (theme === 'neon-volt') {
    await page.getByRole('button', { name: /Roast & Analyze Match/i }).click();
    // Modal opens when JD has requirements; wait up to 4s and confirm if visible
    const confirmBtn = page.getByRole('button', { name: /Confirm/i }).first();
    const hasModal = await confirmBtn.waitFor({ state: 'visible', timeout: 4_000 }).then(() => true).catch(() => false);
    if (hasModal) {
      await confirmBtn.click();
    }
    await expect(page.getByRole('button', { name: /2\. Skills/i }).first()).toBeVisible({ timeout: 15_000 });
    const overviewBody = await page.locator('body').innerText();
    await page.getByRole('button', { name: /2\. Skills/i }).first().click();
    const skillsBody = await page.locator('body').innerText();
    expect(pageErrors).toEqual([]);
    await context.close();
    return {
      score: extractScore(overviewBody),
      bandLabel: extractBand(overviewBody),
      guidance: extractGuidance(overviewBody),
      bodyUpper: overviewBody.toUpperCase(),
      skillsBodyUpper: skillsBody.toUpperCase(),
      recommendationsUpper: overviewBody.toUpperCase(),
    };
  }

  await page.getByRole('button', { name: /Scan & Roast Resume/i }).click();
  await expect(page.getByRole('tab', { name: /Skills & Gaps/i }).first()).toBeVisible({ timeout: 15_000 });
  const overviewBody = await page.locator('body').innerText();
  await page.getByRole('tab', { name: /Skills & Gaps/i }).first().click();
  const skillsBody = await page.locator('body').innerText();
  await page.getByRole('tab', { name: /Actionability Plan/i }).first().click();
  const recommendationsBody = await page.locator('body').innerText();
  expect(pageErrors).toEqual([]);
  await context.close();
  return {
    score: extractScore(overviewBody),
    bandLabel: extractBand(overviewBody),
    guidance: extractGuidance(overviewBody),
    bodyUpper: overviewBody.toUpperCase(),
    skillsBodyUpper: skillsBody.toUpperCase(),
    recommendationsUpper: recommendationsBody.toUpperCase(),
  };
}

test.describe('Phase 14B.1 — Complete Default & Spruce Analytical Parity (5 Scenarios)', () => {
  test.setTimeout(120_000);

  test('PARITY-01: Normal supported technical JD matches score, band, 7 dimensions, penalties, guidance & skills', async ({
    browser,
  }) => {
    const jd = `Backend Engineer
About the Role:
We are looking for a Backend Engineer to build scalable APIs and distributed services for high-availability backend systems across cloud environments.
Required Qualifications:
- Go
- PostgreSQL
- Docker
- REST APIs
Preferred Qualifications:
- Redis`;
    const def = await runThemeScenario(browser, 'neon-volt', SAMPLE_RESUME, jd);
    const spr = await runThemeScenario(browser, 'spruce', SAMPLE_RESUME, jd);

    expect(spr.score).toBe(def.score);
    expect(spr.bandLabel).toBe(def.bandLabel);
    expect(spr.guidance).toBe(def.guidance);
    for (const token of ['9.3 / 15', '10.5 / 15', '3.5 / 5', 'RESUME HAS 124 WORDS', '-4 PTS', 'MEETS 100% OF MUST-HAVE REQUIREMENTS (4/4)']) {
      expect(def.bodyUpper).toContain(token);
      expect(spr.bodyUpper).toContain(token);
    }
    for (const skill of ['GO', 'POSTGRESQL', 'DOCKER', 'REST APIS', 'REDIS']) {
      expect(def.skillsBodyUpper).toContain(skill);
      expect(spr.skillsBodyUpper).toContain(skill);
    }
    // Candidate evidence provenance (verbatim resume quote + explanation) & Fix-First recommendation parity
    expect(def.skillsBodyUpper).toContain('DEPLOYED DOCKERIZED REST APIS WITH REDIS CACHING');
    expect(spr.skillsBodyUpper).toContain('DEPLOYED DOCKERIZED REST APIS WITH REDIS CACHING');
    expect(def.skillsBodyUpper).toContain('DEMONSTRATED THROUGH VERIFIED PRODUCTION EXPERIENCE');
    expect(spr.skillsBodyUpper).toContain('DEMONSTRATED THROUGH VERIFIED PRODUCTION EXPERIENCE');
    for (const recToken of [
      'STRENGTHEN IMPACT & ACTION VERBS IN BULLETS',
      '3 BULLET POINT(S) LACK MEASURABLE OUTCOMES OR STRONG ACTION VERBS',
      'QUALITATIVE PRIORITY',
    ]) {
      expect(def.recommendationsUpper).toContain(recToken);
      expect(spr.recommendationsUpper).toContain(recToken);
    }
  });

  test('PARITY-02: Preferred-only JD preserves preferred_only state and never shows Ready to apply', async ({
    browser,
  }) => {
    const jd = `Backend Engineer
About the Role:
Join our platform engineering group to collaborate on internal tooling, developer productivity workflows, and cloud automation across multiple teams.
Preferred / Nice to have:
- Docker
- Redis`;
    const def = await runThemeScenario(browser, 'neon-volt', SAMPLE_RESUME, jd);
    const spr = await runThemeScenario(browser, 'spruce', SAMPLE_RESUME, jd);

    expect(spr.score).toBe(def.score);
    expect(spr.guidance).toBe(def.guidance);
    expect(def.guidance).not.toBe('Ready to apply');
    expect(def.bodyUpper).toContain('PREFERRED-ONLY JD');
    expect(spr.bodyUpper).toContain('PREFERRED-ONLY JD');
  });

  test('PARITY-03: Unsupported HR domain surfaces limitation banner and Insufficient evidence to evaluate', async ({
    browser,
  }) => {
    const jd = `HR Business Partner
About the Role:
Partner with regional leadership on workforce planning, organizational design, annual compensation reviews, and policy governance across business units.
Required Qualifications:
- Employee Relations
- Payroll Compliance
- HRIS Workday
- Compensation Benchmarking`;
    const def = await runThemeScenario(browser, 'neon-volt', SAMPLE_RESUME, jd);
    const spr = await runThemeScenario(browser, 'spruce', SAMPLE_RESUME, jd);

    expect(spr.guidance).toBe('Insufficient evidence to evaluate');
    expect(def.guidance).toBe('Insufficient evidence to evaluate');
    expect(def.bodyUpper).toContain('UNSUPPORTED');
    expect(spr.bodyUpper).toContain('UNSUPPORTED');
  });

  test('PARITY-04: Unrecognizable / insufficient JD surfaces Insufficient evidence to evaluate in both themes', async ({
    browser,
  }) => {
    const jd = `Looking for a motivated self-starter with great synergy, energy, curiosity, and ownership across dynamic cross-team business initiatives, stakeholder alignment, operational excellence, strategic planning, executive reporting, and continuous improvement programs across global offices worldwide.`;
    const def = await runThemeScenario(browser, 'neon-volt', SAMPLE_RESUME, jd);
    const spr = await runThemeScenario(browser, 'spruce', SAMPLE_RESUME, jd);

    expect(spr.guidance).toBe('Insufficient evidence to evaluate');
    expect(def.guidance).toBe('Insufficient evidence to evaluate');
    expect(def.bodyUpper).toContain('INSUFFICIENT EVIDENCE TO EVALUATE');
    expect(spr.bodyUpper).toContain('INSUFFICIENT EVIDENCE TO EVALUATE');
  });

  test('PARITY-05: Compound AND/OR JD shows identical score and OR-alternative satisfaction in both themes', async ({
    browser,
  }) => {
    const jd = `Backend Engineer
About the Role:
We are seeking an engineer to design reliable backend services, storage layers, and containerized deployment workflows for high-throughput customer traffic.
Required Qualifications:
- Python AND (PostgreSQL OR MySQL) AND (Docker OR Kubernetes)`;
    const def = await runThemeScenario(browser, 'neon-volt', COMPOUND_RESUME, jd);
    const spr = await runThemeScenario(browser, 'spruce', COMPOUND_RESUME, jd);

    expect(spr.score).toBe(def.score);
    expect(spr.guidance).toBe(def.guidance);
    for (const token of ['PYTHON', 'SATISFIED VIA MYSQL', 'SATISFIED VIA KUBERNETES', 'ENGINEERED PYTHON APIS BACKED BY MYSQL']) {
      expect(def.skillsBodyUpper).toContain(token);
      expect(spr.skillsBodyUpper).toContain(token);
    }
    for (const recToken of [
      'STRENGTHEN IMPACT & ACTION VERBS IN BULLETS',
      'QUALITATIVE PRIORITY',
    ]) {
      expect(def.recommendationsUpper).toContain(recToken);
      expect(spr.recommendationsUpper).toContain(recToken);
    }
  });
});
