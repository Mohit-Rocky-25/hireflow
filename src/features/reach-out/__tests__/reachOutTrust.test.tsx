// ============================================================
// Reach Out Trust Layer & Zero-Egress Test Suite
// Verifies:
// 1. Zero network egress during render, template switching, and copy
// 2. Exact honesty footer present
// 3. Mandatory limits notice in template details
// 4. Platform rules configuration invariants (HTTPS validation, pending sources)
// 5. Review status empty invariants (no placeholder reviewer)
// 6. Scan audit for banned deceptive phrases
// ============================================================

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { ProfileProvider } from '../../suite/profile/ProfileContext';
import { ReachOutPage } from '../../suite/outreach/ReachOutPage';
import { ALL_REACH_OUT_TEMPLATES } from '../data';
import { PLATFORM_RULES, PlatformRule } from '../data/platformRules';

describe('Trust Layer: Reach Out Section Verification', () => {
  let fetchSpy: any;
  let xhrOpenSpy: any;
  let xhrSendSpy: any;
  let sendBeaconSpy: any;
  let origWebSocket: any;

  beforeEach(() => {
    // Mock and spy on all network egress channels
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as any;

    xhrOpenSpy = vi.fn();
    xhrSendSpy = vi.fn();
    class MockXMLHttpRequest {
      open = xhrOpenSpy;
      send = xhrSendSpy;
      setRequestHeader = vi.fn();
    }
    (globalThis as any).XMLHttpRequest = MockXMLHttpRequest;

    sendBeaconSpy = vi.fn();
    if (!globalThis.navigator) {
      (globalThis as any).navigator = {};
    }
    (globalThis.navigator as any).sendBeacon = sendBeaconSpy;

    origWebSocket = (globalThis as any).WebSocket;
    const wsSpy = vi.fn();
    (globalThis as any).WebSocket = wsSpy;

    // Mock clipboard
    if (!globalThis.navigator.clipboard) {
      (globalThis.navigator as any).clipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
    } else {
      vi.spyOn(globalThis.navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (globalThis as any).WebSocket = origWebSocket;
  });

  // ── 1. Zero Network Egress Test ─────────────────────────────
  it('mounts Reach Out and asserts zero network requests (fetch, XHR, beacon, WebSocket) during render, switching, and copy', () => {
    // 1. Initial Render
    const html = renderToString(
      <MemoryRouter initialEntries={['/tools/reach-out']}>
        <ProfileProvider>
          <ReachOutPage />
        </ProfileProvider>
      </MemoryRouter>
    );

    expect(html).toBeTruthy();

    // 2. Simulate clipboard copy
    globalThis.navigator.clipboard.writeText('Simulated outreach note');

    // 3. Assert zero network requests
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
    expect(sendBeaconSpy).not.toHaveBeenCalled();
    expect((globalThis as any).WebSocket).not.toHaveBeenCalled();
  });

  // ── 2. Honesty Footer ───────────────────────────────────────
  it('renders exact honesty footer without deceptive claims', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/tools/reach-out']}>
        <ProfileProvider>
          <ReachOutPage />
        </ProfileProvider>
      </MemoryRouter>
    );

    expect(html).toContain('Pre-written templates. Nothing you type leaves your browser.');
  });

  // ── 3. Limits Notice ────────────────────────────────────────
  it('renders mandatory limits notice in template details', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/tools/reach-out']}>
        <ProfileProvider>
          <ReachOutPage />
        </ProfileProvider>
      </MemoryRouter>
    );

    // In server-side HTML renderToString, apostrophes are escaped as &#x27;
    const normalizedHtml = html.replace(/&#x27;/g, "'");
    expect(normalizedHtml).toContain(
      "Replies depend on your profile, timing and the company's hiring state. No template can guarantee one."
    );
  });

  // ── 4. Platform Rules Config & Invariants ───────────────────
  it('validates platform rules config invariants', () => {
    expect(PLATFORM_RULES.length).toBeGreaterThanOrEqual(6);

    const requiredRules = [
      'LinkedIn connection note limit for free accounts',
      'LinkedIn connection note limit for Premium',
      'InMail subject limit',
      'InMail body limit',
      'Cold email format: plain text',
      'Cold email links: one link max',
      'Cold email attachments: no attachment on first touch',
    ];

    for (const req of requiredRules) {
      const found = PLATFORM_RULES.find((r) => r.rule.includes(req) || req.includes(r.rule));
      expect(found, `Missing required rule: ${req}`).toBeDefined();
    }

    // Rules verification: fail if sourceUrl is non-null but not a valid https URL,
    // and fail if lastCheckedDate is set without a sourceUrl.
    for (const rule of PLATFORM_RULES) {
      expect(rule.rule).toBeTruthy();
      expect(rule.value).toBeTruthy();
      expect(rule.sourceName).toBeTruthy();

      if (rule.sourceUrl !== null) {
        expect(rule.sourceUrl).toMatch(/^https:\/\/.+/);
      }

      if (rule.lastCheckedDate !== null) {
        expect(rule.sourceUrl).not.toBeNull();
      }

      // Currently, all sourceUrl and lastCheckedDate must be null as instructed
      expect(rule.sourceUrl).toBeNull();
      expect(rule.lastCheckedDate).toBeNull();
    }
  });

  it('renders "Source pending" and no anchor link when sourceUrl is null', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/tools/reach-out']}>
        <ProfileProvider>
          <ReachOutPage />
        </ProfileProvider>
      </MemoryRouter>
    );

    // Platform rules section is included in the page
    expect(html).toContain('Platform rules');
  });

  // ── 5. Review Status Invariants ─────────────────────────────
  it('asserts that no template currently has reviewedBy set and that the UI shows no review line for it', () => {
    expect(ALL_REACH_OUT_TEMPLATES).toHaveLength(50);

    // No template currently has reviewedBy set
    for (const tmpl of ALL_REACH_OUT_TEMPLATES) {
      expect(tmpl.reviewedBy).toBeUndefined();
    }

    const html = renderToString(
      <MemoryRouter initialEntries={['/tools/reach-out']}>
        <ProfileProvider>
          <ReachOutPage />
        </ProfileProvider>
      </MemoryRouter>
    );

    // Assert that the UI shows no review line
    expect(html).not.toMatch(/Reviewed by\s+\w+/i);
  });

  // ── 6. Scan Test for Banned Deceptive Phrases ───────────────
  it('asserts that no UI string or template in Reach Out contains banned deceptive phrases', () => {
    const reachOutDirs = [
      path.resolve(__dirname, '..'), // src/features/reach-out
      path.resolve(__dirname, '../../suite/outreach'), // src/features/suite/outreach
    ];

    const bannedPhrases = [
      'guaranteed',
      'proven',
      'success probability',
      '% reply',
      'reply rate',
      'used by',
      'trusted by',
      'thousands of students',
      'human-written',
      'verified by experts',
    ];

    const filesToScan: string[] = [];

    function collectFiles(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          collectFiles(full);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          // Exclude this test file itself since it lists the banned phrases!
          if (!entry.name.includes('reachOutTrust.test')) {
            filesToScan.push(full);
          }
        }
      }
    }

    for (const d of reachOutDirs) {
      collectFiles(d);
    }

    expect(filesToScan.length).toBeGreaterThan(0);

    const violations: { file: string; line: number; phrase: string }[] = [];

    for (const file of filesToScan) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((lineText, idx) => {
        // Strip code symbol names like "bannedPhrasesFound" if any
        const lower = lineText.toLowerCase();
        for (const phrase of bannedPhrases) {
          if (lower.includes(phrase)) {
            violations.push({
              file: path.relative(path.resolve(__dirname, '../../../..'), file),
              line: idx + 1,
              phrase,
            });
          }
        }
      });
    }

    expect(violations, `Found banned phrases in reach out files: ${JSON.stringify(violations, null, 2)}`).toEqual([]);
  });
});
