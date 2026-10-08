// ============================================================
// Suite Tests — Application Tracker Insights & CSV (Stage 3.2)
// Funnel math, small-sample guard, gone quiet, CSV round-trip
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  computeTrackerInsights,
  isGoneQuiet,
  exportTrackerToCSV,
  importTrackerFromCSV,
} from '../insights';
import { ApplicationEntry } from '../../profile/types';

function createMockApplications(count = 6): ApplicationEntry[] {
  const apps: ApplicationEntry[] = [
    {
      id: 'app-1',
      company: 'Google',
      role: 'SDE II',
      source: 'Referral',
      status: 'Interview',
      appliedDate: '2026-09-01',
      lastUpdateDate: '2026-09-10',
      scanScore: 82,
      tier: 'Tier S',
    },
    {
      id: 'app-2',
      company: 'Microsoft',
      role: 'SDE II',
      source: 'Campus',
      status: 'Offer',
      appliedDate: '2026-09-02',
      lastUpdateDate: '2026-09-20',
      scanScore: 78,
      tier: 'Tier S',
    },
    {
      id: 'app-3',
      company: 'Razorpay',
      role: 'Backend Engineer',
      source: 'Off-campus portal',
      status: 'Rejected',
      appliedDate: '2026-09-05',
      lastUpdateDate: '2026-09-12',
      scanScore: 65,
      tier: 'Tier A',
    },
    {
      id: 'app-4',
      company: 'Swiggy',
      role: 'Full Stack Engineer',
      source: 'Referral',
      status: 'Online Assessment',
      appliedDate: '2026-09-10',
      lastUpdateDate: '2026-09-14',
      scanScore: 71,
      tier: 'Tier A',
    },
    {
      id: 'app-5',
      company: 'TCS',
      role: 'Systems Engineer',
      source: 'Campus',
      status: 'Applied',
      appliedDate: '2026-09-15',
      lastUpdateDate: '2026-09-15',
      scanScore: 54,
      tier: 'Tier C',
    },
    {
      id: 'app-6',
      company: 'Infosys',
      role: 'Specialist Programmer',
      source: 'Campus',
      status: 'Saved',
      appliedDate: '2026-09-18',
      lastUpdateDate: '2026-09-18',
      scanScore: 60,
      tier: 'Tier C',
    },
  ];

  return apps.slice(0, count);
}

describe('Stage 3.2 — Tracker Insights', () => {
  it('requires at least 5 entries before computing pipeline insights', () => {
    const fewApps = createMockApplications(3);
    const insights = computeTrackerInsights(fewApps);
    expect(insights.hasEnoughData).toBe(false);
    expect(insights.sampleSize).toBe(3);
  });

  it('computes funnel and metric breakdowns when entries >= 5', () => {
    const apps = createMockApplications(6);
    const insights = computeTrackerInsights(apps);

    expect(insights.hasEnoughData).toBe(true);
    expect(insights.sampleSize).toBe(6);
    expect(insights.isSmallSample).toBe(true); // n < 20
    expect(insights.sampleNotice).toContain('n < 20');

    // Funnel
    const interviewCount = insights.funnel.find((f) => f.status === 'Interview');
    expect(interviewCount?.count).toBe(1);

    const offerCount = insights.funnel.find((f) => f.status === 'Offer');
    expect(offerCount?.count).toBe(1);

    // Source conversion
    const referralGroup = insights.bySource.find((s) => s.label === 'Referral');
    expect(referralGroup?.total).toBe(2);

    // Score band breakdown
    expect(insights.byScoreBand.length).toBeGreaterThan(0);
  });

  it('detects gone-quiet applications based on elapsed days', () => {
    const quietApp: ApplicationEntry = {
      id: 'quiet-1',
      company: 'Amazon',
      role: 'SDE I',
      source: 'Off-campus portal',
      status: 'Applied',
      appliedDate: '2026-09-01',
      lastUpdateDate: '2026-09-01',
    };

    const referenceNow = new Date('2026-09-25'); // 24 days later
    expect(isGoneQuiet(quietApp, 14, referenceNow)).toBe(true);

    const activeApp: ApplicationEntry = {
      ...quietApp,
      lastUpdateDate: '2026-09-20', // only 5 days later
    };
    expect(isGoneQuiet(activeApp, 14, referenceNow)).toBe(false);

    // Terminal status (Offer or Rejected) never goes quiet
    const offerApp: ApplicationEntry = {
      ...quietApp,
      status: 'Offer',
    };
    expect(isGoneQuiet(offerApp, 14, referenceNow)).toBe(false);
  });

  it('exports and imports CSV correctly with round-trip fidelity', () => {
    const apps = createMockApplications(4);
    const csv = exportTrackerToCSV(apps);

    expect(csv).toContain('Google');
    expect(csv).toContain('Microsoft');

    const imported = importTrackerFromCSV(csv);
    expect(imported.rejectedCount).toBe(0);
    expect(imported.valid.length).toBe(4);
    expect(imported.valid[0].company).toBe('Google');
    expect(imported.valid[0].role).toBe('SDE II');
  });

  it('rejects malformed CSV rows missing company or role', () => {
    const badCSV = `company,role,status
Google,SDE I,Applied
,Missing Company,Applied
Meta,,Interview`;

    const imported = importTrackerFromCSV(badCSV);
    expect(imported.valid.length).toBe(1);
    expect(imported.rejectedCount).toBe(2);
  });
});
