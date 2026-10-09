import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Build & Deployment Hardening (Phase 8)', () => {
  it('confirms production sourcemaps are explicitly disabled in vite.config.ts', () => {
    const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
    const content = fs.readFileSync(viteConfigPath, 'utf8');

    expect(content).toContain('sourcemap: false');
  });

  it('verifies public/_headers contains all mandatory HTTP security headers', () => {
    const headersPath = path.resolve(process.cwd(), 'public', '_headers');
    expect(fs.existsSync(headersPath)).toBe(true);

    const headersContent = fs.readFileSync(headersPath, 'utf8');
    expect(headersContent).toContain('X-Content-Type-Options: nosniff');
    expect(headersContent).toContain('X-Frame-Options: DENY');
    expect(headersContent).toContain('Strict-Transport-Security');
    expect(headersContent).toContain('Content-Security-Policy');
    expect(headersContent).toContain('Referrer-Policy: strict-origin-when-cross-origin');
    expect(headersContent).toContain("frame-ancestors 'none'");
  });
});
