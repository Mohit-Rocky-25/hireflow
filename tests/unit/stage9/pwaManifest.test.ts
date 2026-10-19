import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Stage 9: PWA Web App Manifest & Service Worker (C14)', () => {
  const rootDir = process.cwd();

  it('validates public/manifest.webmanifest schema and required fields', () => {
    const manifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
    expect(fs.existsSync(manifestPath), 'manifest.webmanifest must exist in public/').toBe(true);

    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);

    expect(manifest.name).toBe('HireFlow');
    expect(manifest.short_name).toBe('HireFlow');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#020617');
    expect(manifest.background_color).toBe('#020617');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512' && i.purpose === 'any');
    const hasMaskable = manifest.icons.some((i: any) => i.purpose === 'maskable');

    expect(has192, 'Must include 192x192 icon').toBe(true);
    expect(has512, 'Must include 512x512 icon').toBe(true);
    expect(hasMaskable, 'Must include maskable icon').toBe(true);

    // Verify all icon files exist in public directory
    manifest.icons.forEach((icon: any) => {
      const iconPath = path.join(rootDir, 'public', icon.src.replace(/^\//, ''));
      expect(fs.existsSync(iconPath), `Icon file ${icon.src} must exist`).toBe(true);
    });
  });

  it('validates public/sw.js service worker implementation and security guards', () => {
    const swPath = path.join(rootDir, 'public', 'sw.js');
    expect(fs.existsSync(swPath), 'sw.js must exist in public/').toBe(true);

    const content = fs.readFileSync(swPath, 'utf-8');

    // Lifecycle events
    expect(content).toContain("addEventListener('install'");
    expect(content).toContain("addEventListener('activate'");
    expect(content).toContain("addEventListener('message'");
    expect(content).toContain("addEventListener('fetch'");

    // Skip waiting on update
    expect(content).toContain('SKIP_WAITING');

    // Strict method guard (never intercept non-GET)
    expect(content).toContain("request.method !== 'GET'");

    // Same-origin guard
    expect(content).toContain('url.origin !== self.location.origin');

    // Navigation fallback to index.html
    expect(content).toContain("request.mode === 'navigate'");
    expect(content).toContain('/index.html');

    // Stale-While-Revalidate caching strategy
    expect(content).toContain('caches.match');
  });

  it('validates index.html links manifest and theme-color', () => {
    const indexPath = path.join(rootDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');

    expect(content).toContain('rel="manifest"');
    expect(content).toContain('href="/manifest.webmanifest"');
    expect(content).toContain('name="theme-color"');
    expect(content).toContain('content="#020617"');
  });

  it('verifies registerServiceWorker security checks and safe degradation', () => {
    const regPath = path.join(rootDir, 'src', 'lib', 'pwa', 'registerServiceWorker.ts');
    expect(fs.existsSync(regPath)).toBe(true);

    const content = fs.readFileSync(regPath, 'utf-8');

    // Must check secure context (P-13)
    expect(content).toContain('window.isSecureContext');
    expect(content).toContain("'serviceWorker' in navigator");
    expect(content).toContain('import.meta.env.PROD');
  });
});
