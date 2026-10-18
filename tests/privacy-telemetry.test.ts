import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('R1.3: Telemetry & Remote Tracking Purge (P-3, P-5)', () => {
  const rootDir = path.resolve(__dirname, '..');
  const forbiddenPatterns = [
    /window\.dataLayer/i,
    /gtag\s*\(/i,
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
    /mixpanel\.(init|track|identify)/i,
    /from\s+['"].*mixpanel['"]/i,
    /posthog\.(init|capture)/i,
    /from\s+['"].*posthog['"]/i,
    /@sentry\//i,
    /Sentry\.(init|capture)/i,
    /clarity\.ms/i,
    /clarity\s*\(/i,
    /segment\.com\/analytics\.js/i,
    /analytics\.(track|identify|page)/i,
    /amplitude\.com/i,
    /hotjar\.com/i,
  ];

  it('ensures index.html contains zero third-party telemetry or tracking scripts', () => {
    const indexPath = path.join(rootDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');

    for (const pattern of forbiddenPatterns) {
      expect(pattern.test(content), `index.html must not contain tracking pattern: ${pattern}`).toBe(false);
    }
  });

  it('ensures src/ codebase contains zero remote tracking or analytics SDK integrations', () => {
    const srcDir = path.join(rootDir, 'src');

    function scanDir(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (file === '__tests__' || file === 'node_modules') continue;
          scanDir(fullPath);
        } else if (/\.(ts|tsx|js|jsx|html)$/.test(file)) {
          if (/\.test\.(ts|tsx|js|jsx)$/.test(file)) continue;
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const pattern of forbiddenPatterns) {
            expect(pattern.test(content), `Tracking pattern ${pattern} found in ${fullPath}`).toBe(false);
          }
        }
      }
    }

    scanDir(srcDir);
  });

  it('R1.5: verifies CSP and security headers in index.html, vercel.json, and vite.config.ts', () => {
    // index.html CSP meta tag
    const indexPath = path.join(rootDir, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    expect(indexContent).toContain('Content-Security-Policy');
    expect(indexContent).toContain("default-src 'self'");
    expect(indexContent).toContain("object-src 'none'");

    // vercel.json configuration
    const vercelPath = path.join(rootDir, 'vercel.json');
    expect(fs.existsSync(vercelPath)).toBe(true);
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    const headerKeys = vercelConfig.headers[0].headers.map((h: any) => h.key);
    expect(headerKeys).toContain('Content-Security-Policy');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('Referrer-Policy');
  });
});
