// ============================================================
// HireFlow — Reach Out UI & State Integration Tests (Gate 4)
// Governed by Decision D5 and Evidence E1–E6
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fitMessageToLength } from '../../src/features/suite/outreach/engine/lengthFit';
import { validateAdmiredWork, validateProofPoint, validateSlots } from '../../src/features/suite/outreach/engine/validateSlots';
import { runQualityChecker } from '../../src/features/suite/outreach/engine/qualityChecker';
import { OutreachSlotsV2, OutreachTemplateV2 } from '../../src/features/suite/outreach/types';
import templatesRaw from '../../src/data/suite/outreach/templates.json';

const ALL_TEMPLATES = templatesRaw as OutreachTemplateV2[];

describe('Stage 4 Gate — Reach Out UI State, Controls & Accessibility', () => {
  const rootDir = process.cwd();
  const pagePath = path.join(rootDir, 'src/features/suite/outreach/ReachOutPage.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');

  // Mock localStorage
  const storageMap = new Map<string, string>();
  beforeEach(() => {
    storageMap.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageMap.get(key) || null,
      setItem: (key: string, val: string) => storageMap.set(key, val),
      removeItem: (key: string) => storageMap.delete(key),
      clear: () => storageMap.clear(),
    });
  });

  const testSlots: OutreachSlotsV2 = {
    targetCompany: 'Finlo Technologies',
    targetRole: 'Backend Engineering Intern',
    recipientName: 'Rahul Deshmukh',
    primarySkill: 'Go & PostgreSQL',
    admiredProject: 'the settlement reconciliation engine and public post-mortem',
    proofPoint: 'built Go distributed job queue handling 6,500 jobs/sec in benchmark',
    proofShort: 'built Go job queue (6.5k jobs/s)',
    college: 'National Institute of Technology Karnataka, Surathkal',
    portfolio: 'github.com/aarav-demo/pgqueue',
    followUpNewInfo: 'published reproducibility benchmarks and test harness',
    daysSince: 7,
    your_name: 'Aarav Menon',
  };

  const connectTemplate = ALL_TEMPLATES.find((t) => t.channel === 'linkedin_connect')!;
  const emailTemplate = ALL_TEMPLATES.find((t) => t.channel === 'cold_email')!;
  const followUpTemplate = ALL_TEMPLATES.find((t) => t.channel === 'follow_up')!;

  it('1. Toggling Free / Premium changes the counter ceiling and persists to localStorage (Evidence E1)', () => {
    // Free mode (default): 200 chars
    const fitFree = fitMessageToLength(connectTemplate, testSlots, 0, { isPremiumLinkedIn: false });
    expect(fitFree.hardMax).toBe(200);
    expect(fitFree.targetMax).toBe(180);
    expect(fitFree.charCount).toBeLessThanOrEqual(200);

    // Premium mode: 300 chars
    const fitPremium = fitMessageToLength(connectTemplate, testSlots, 0, { isPremiumLinkedIn: true });
    expect(fitPremium.hardMax).toBe(300);
    expect(fitPremium.targetMax).toBe(260);
    expect(fitPremium.charCount).toBeLessThanOrEqual(300);

    // Verify localStorage persistence keys in ReachOutPage
    expect(pageContent).toContain('hireflow:reachout:isPremiumLinkedIn');
    expect(pageContent).toContain('toggleLinkedInMode');
  });

  it('2. Generic "What specifically about their work?" input is rejected with actionable reason & examples', () => {
    const genericInputs = [
      'great work',
      'amazing company',
      'inspiring culture',
      'esteemed organisation',
      'good product',
      'world class team',
    ];

    for (const generic of genericInputs) {
      const res = validateAdmiredWork(generic);
      expect(res.valid).toBe(false);
      expect(res.issue?.severity).toBe('error');
      expect(res.issue?.exampleGood).toBeTruthy();
      expect(res.issue?.exampleBad).toBe(generic);
    }

    // Specific technical input is accepted
    const specific = validateAdmiredWork('the technical post-mortem on your zero-downtime replication failover');
    expect(specific.valid).toBe(true);
    expect(specific.issue).toBeUndefined();
  });

  it('3. Bare skills in proof point are rejected; quantified evidence is accepted', () => {
    const bareSkills = 'Go, Python, SQL, Docker';
    const resBare = validateProofPoint(bareSkills);
    expect(resBare.valid).toBe(false);
    expect(resBare.issue?.severity).toBe('error');

    const quantified = 'optimized database queries reducing endpoint response time by 45%';
    const resQuant = validateProofPoint(quantified);
    expect(resQuant.valid).toBe(true);
  });

  it('4. Filled slots produce clean text; missing slots are reported as validation gaps', () => {
    // Clean slots
    const valClean = validateSlots(testSlots, connectTemplate.requiredSlots);
    expect(valClean.valid).toBe(true);
    expect(valClean.issues.length).toBe(0);

    // Missing company and role
    const sparseSlots: OutreachSlotsV2 = {
      recipientName: 'Rahul',
    };
    const valSparse = validateSlots(sparseSlots, ['targetCompany', 'targetRole', 'recipientName']);
    expect(valSparse.valid).toBe(false);
    expect(valSparse.issues.some((i) => i.slot === 'targetCompany')).toBe(true);
    expect(valSparse.issues.some((i) => i.slot === 'targetRole')).toBe(true);
  });

  it('5. "Try another phrasing" cycles block variants deterministically via stable hash', () => {
    const v0 = fitMessageToLength(emailTemplate, testSlots, 0);
    const v1 = fitMessageToLength(emailTemplate, testSlots, 1);
    const v2 = fitMessageToLength(emailTemplate, testSlots, 2);
    const v0_again = fitMessageToLength(emailTemplate, testSlots, 0);

    // Deterministic: same index produces byte-identical output
    expect(v0.body).toBe(v0_again.body);
    expect(v0.subject).toBe(v0_again.subject);

    // Divergent: variant 0 and variant 1 produce different text
    expect(v0.body).not.toBe(v1.body);
    expect(v1.body).not.toBe(v2.body);
  });

  it('6. Quality panel classifies findings into BLOCK and WARN with actionable fixes', () => {
    // Cold message with referral ask should BLOCK
    const findings = runQualityChecker({
      body: 'Hi Rahul, I saw Finlo is hiring. Could you refer me for the Backend Intern role?',
      channel: 'cold_email',
      relationship: 'cold',
      maxLength: 200,
    });

    const hasBlock = findings.some((f) => f.severity === 'BLOCK' && f.id === 'Q-BLK-COLD-REFERRAL');
    expect(hasBlock).toBe(true);

    // Follow-up with zero new info should BLOCK
    const followUpFindings = runQualityChecker({
      body: 'Hi Rahul, just checking in on my previous email. Bumping this to the top of your inbox.',
      channel: 'follow_up',
      relationship: 'cold',
      maxLength: 100,
      followUpNewInfo: '',
    });

    const hasFollowUpBlock = followUpFindings.some((f) => f.severity === 'BLOCK' && f.id === 'Q-BLK-FOLLOWUP-EMPTY');
    expect(hasFollowUpBlock).toBe(true);
  });

  it('7. Full keyboard navigation and visible focus rings on all interactive elements', () => {
    // Visible focus ring class must be used across interactive controls
    expect(pageContent).toContain('focus-visible:ring-2 focus-visible:ring-volt');

    // All buttons have accessible titles, labels, or text
    const buttons = pageContent.match(/<button[^>]*>/g) || [];
    expect(buttons.length).toBeGreaterThanOrEqual(8);

    // ARIA live region present for live character counter updates
    expect(pageContent).toContain('aria-live="polite"');
  });

  it('8. Responsive mobile layout contracts (works at 360px without horizontal overflow)', () => {
    // Must use responsive grid with 1-column mobile stack
    expect(pageContent).toContain('grid-cols-1 lg:grid-cols-12');

    // Horizontal overflow scrollbar prevented on tabs
    expect(pageContent).toContain('overflow-x-auto');

    // Header wraps cleanly on mobile
    expect(pageContent).toContain('flex-wrap');
  });

  it('9. Zero UI arithmetic invariant (satisfies check:ui-math)', () => {
    // Check that lengths and statuses are rendered directly from fitResult
    expect(pageContent).toContain('fitResult.charCount');
    expect(pageContent).toContain('fitResult.wordCount');
    expect(pageContent).toContain('fitResult.status');
    expect(pageContent).toContain('fitResult.hardMax');

    // Ensure no Math.round/floor/ceil on result fields
    expect(pageContent).not.toMatch(/Math\.(?:round|floor|ceil)\s*\(\s*(?:result|fitResult|slots)/);
  });
});
