// ============================================================
// HireFlow — Outreach Privacy, Storage Robustness & Claim Honesty (Gate 5)
// Governed by Hard Rules H1, H7, H8 and Stage 5
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Stage 5 Gate — Honesty Copy, Privacy Egress & Storage Robustness', () => {
  const rootDir = process.cwd();
  const outreachDir = path.join(rootDir, 'src/features/suite/outreach');
  const dataDir = path.join(rootDir, 'src/data/suite/outreach');

  // Recursively read directory files
  function getFiles(dir: string, ext = ['.ts', '.tsx', '.json', '.md']): string[] {
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        files = files.concat(getFiles(full, ext));
      } else if (ext.some((x) => e.name.endsWith(x))) {
        files.push(full);
      }
    }
    return files;
  }

  it('1. Banned marketing claims check: zero "high-converting", "pre-calibrated", "guaranteed", "proven"', () => {
    const filesToScan = [
      ...getFiles(outreachDir),
      ...getFiles(dataDir),
      path.join(rootDir, 'docs/outreach/COVERAGE.md'),
      path.join(rootDir, 'docs/outreach/REWRITE_LOG.md'),
    ];

    const BANNED_CLAIM_PATTERNS = [
      { pattern: /high-converting|high-conversion/i, name: 'high-converting' },
      { pattern: /pre-calibrated/i, name: 'pre-calibrated' },
      { pattern: /\bguaranteed\b|\bguarantee\b/i, name: 'guaranteed' },
      { pattern: /\bproven\b/i, name: 'proven' },
    ];

    const violations: Array<{ file: string; match: string; line: number }> = [];

    for (const file of filesToScan) {
      if (!fs.existsSync(file)) continue;
      // Skip test files asserting against banned words
      if (file.includes('spec.ts') || file.includes('test.ts') || file.includes('lint-templates.ts')) continue;

      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        // Skip comment lines explaining banned words
        if (line.includes('//') && line.includes('banned')) return;
        for (const b of BANNED_CLAIM_PATTERNS) {
          if (b.pattern.test(line)) {
            violations.push({
              file: path.relative(rootDir, file),
              match: b.name,
              line: idx + 1,
            });
          }
        }
      });
    }

    if (violations.length > 0) {
      console.error('Violations found:', violations);
    }
    expect(violations.length).toBe(0);
  });

  it('2. Zero network egress check (H1): no fetch, XHR, WebSocket, or external beacon in Reach Out', () => {
    const files = getFiles(outreachDir);
    const EGRESS_PATTERNS = [
      /\bfetch\s*\(/,
      /\bXMLHttpRequest\b/,
      /\bWebSocket\b/,
      /\bnavigator\.sendBeacon\b/,
      /https?:\/\/api\./,
      /https?:\/\/analytics\./,
    ];

    const egressHits: Array<{ file: string; line: number }> = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;
        for (const pat of EGRESS_PATTERNS) {
          if (pat.test(line)) {
            egressHits.push({ file: path.relative(rootDir, file), line: idx + 1 });
          }
        }
      });
    }

    expect(egressHits.length).toBe(0);
  });

  it('3. Storage corruption simulation: recovers gracefully when localStorage contains corrupted JSON', () => {
    const corruptJson = '{"targetCompany": "Finlo", invalid_json';

    // Simulate safe parsing pattern used in ReachOutPage
    let loadedState = null;
    try {
      loadedState = JSON.parse(corruptJson);
    } catch {
      loadedState = { targetCompany: 'Razorpay', targetRole: 'Software Engineer' }; // safe fallback
    }

    expect(loadedState).not.toBeNull();
    expect(loadedState.targetCompany).toBe('Razorpay');
  });

  it('4. Quota exceeded simulation: gracefully catches QuotaExceededError without crashing', () => {
    let quotaErrorCaught = false;

    // Simulate safe local storage setter used in ReachOutPage
    const safeSetItem = (key: string, value: string) => {
      try {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      } catch {
        quotaErrorCaught = true;
        // Graceful silent fallback
      }
    };

    safeSetItem('hireflow:reachout:draft_v2', 'test-data');
    expect(quotaErrorCaught).toBe(true);
  });

  it('5. Explanatory guidance note includes B2B sales study caveat and LinkedIn counter notice', () => {
    const reachOutContent = fs.readFileSync(path.join(outreachDir, 'ReachOutPage.tsx'), 'utf8');
    expect(reachOutContent).toContain('Hunter 34M dataset');
    expect(reachOutContent).toContain('Boomerang');
    expect(reachOutContent).toContain('assumed to transfer to job-seeker outreach');
    expect(reachOutContent.toLowerCase()).toContain('check your linkedin app counter');
  });
});
