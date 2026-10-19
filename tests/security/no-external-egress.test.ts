import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getAllSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllSourceFiles(fullPath));
    } else if (/\.(tsx?)$/.test(entry.name) && !entry.name.includes('.test.') && !entry.name.includes('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('10.3 / P-3: Privacy & Zero-Egress Static Guard Test', () => {
  const srcDir = path.join(process.cwd(), 'src');
  const sourceFiles = getAllSourceFiles(srcDir);

  it('guarantees zero calls to navigator.sendBeacon across all application code', () => {
    const violations: string[] = [];
    const beaconRegex = /\bnavigator\.sendBeacon\b/;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (beaconRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it('guarantees zero instantiation of WebSocket or EventSource across all application code', () => {
    const violations: string[] = [];
    // Catch `new WebSocket(` or `new EventSource(` in code
    const liveNetworkRegex = /\bnew\s+(WebSocket|EventSource)\s*\(/;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (liveNetworkRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it('guarantees zero XMLHttpRequest usages across all application code', () => {
    const violations: string[] = [];
    const xhrRegex = /\bnew\s+XMLHttpRequest\s*\(/;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (xhrRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it('guarantees any fetch() call in src/ is strictly same-origin local proxy without external host egress', () => {
    const violations: string[] = [];
    // Catch fetch("http://...") or fetch('https://...') in code
    const externalFetchRegex = /\bfetch\s*\(\s*['"`](https?:)?\/\/(?!(localhost|127\.0\.0\.1))/i;

    for (const file of sourceFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (externalFetchRegex.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });
});
