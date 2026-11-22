import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { OverviewSection } from '@/features/my-space/OverviewSection';
import { TargetsSection } from '@/features/my-space/TargetsSection';
import { PlanSection } from '@/features/my-space/PlanSection';
import { OutreachSection } from '@/features/my-space/OutreachSection';
import { ScansSection } from '@/features/my-space/ScansSection';
import { MySpaceSheet } from '@/features/my-space/MySpaceSheet';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { buildDemoDataset } from '@/features/demo/demoDataset';
import { importDataset } from '@/features/demo/demoImporter';

describe('My Space UI Components', () => {
  let dataset: Awaited<ReturnType<typeof buildDemoDataset>>;
  let auditsMap: Record<string, any>;
  let targetsMap: Record<string, any>;
  let planItemsMap: Record<string, any>;
  let draftsMap: Record<string, any>;

  beforeEach(async () => {
    dataset = await buildDemoDataset();
    auditsMap = {};
    for (const a of dataset.audits) auditsMap[a.id] = a;
    targetsMap = {};
    for (const t of dataset.targets) targetsMap[t.id] = t;
    planItemsMap = {};
    for (const p of dataset.planItems) planItemsMap[p.id] = p;
    draftsMap = {};
    for (const d of dataset.drafts) draftsMap[d.id] = d;

    useAuthStore.setState({
      status: 'authenticated',
      userId: 'demo-local',
      displayName: 'Mohit',
      isDemo: true,
      demoStorage: 'local',
    });

    await importDataset(dataset, true);
  });

  describe('OverviewSection', () => {
    it('renders first name, lede sentence, next best action, and previews', () => {
      const html = renderToString(
        <MemoryRouter>
          <OverviewSection
            audits={auditsMap}
            targets={targetsMap}
            planItems={planItemsMap}
            gapOverlay={dataset.gapOverlay}
          />
        </MemoryRouter>
      );

      expect(html).toContain('Mohit');
      expect(html).toContain('Your best fit is Razorpay');
      expect(html).toContain('Recent scans');
      expect(html).toContain('In your plan');
      expect(html).toContain('71');
    });
  });

  describe('TargetsSection', () => {
    it('renders tracked watchlist targets with score and gaps', () => {
      const html = renderToString(
        <MemoryRouter>
          <TargetsSection watchlist={targetsMap} entries={auditsMap} />
        </MemoryRouter>
      );

      expect(html).toContain('Targets');
      expect(html).toContain('Razorpay');
      expect(html).toContain('Google');
      expect(html).toContain('Scan again');
      expect(html).toContain('Open latest scan');
    });
  });

  describe('PlanSection', () => {
    it('renders items grouped by status with labeled controls', () => {
      const html = renderToString(
        <MemoryRouter>
          <PlanSection planItems={planItemsMap} />
        </MemoryRouter>
      );

      expect(html).toContain('Plan');
      expect(html).toContain('Build a transactional outbox in Go with CDC');
      expect(html).toContain('AWS Certified Solutions Architect Associate');
      expect(html).toContain('Done');
      expect(html).toContain('In Progress');
    });
  });

  describe('OutreachSection', () => {
    it('renders humanized channels and draft content', () => {
      const html = renderToString(
        <MemoryRouter>
          <OutreachSection outreachDrafts={draftsMap} />
        </MemoryRouter>
      );

      expect(html).toContain('Outreach');
      expect(html).toContain('LinkedIn connect');
      expect(html).toContain('Cold email');
      expect(html).toContain('Copy message');
      expect(html).toContain('Open in Reach Out');
    });
  });

  describe('ScansSection', () => {
    it('renders distinct subsections for ATS scans and TalentLens scans', () => {
      useAuditStore.setState({ entries: auditsMap });

      const html = renderToString(
        <MemoryRouter>
          <ScansSection selectedAuditId={null} onSelectAudit={() => {}} entries={auditsMap} />
        </MemoryRouter>
      );

      // Verify page titles and navigation filters
      expect(html).toContain('Scans &amp; Audits');
      expect(html).toContain('All Scans');
      expect(html).toContain('ATS Scans');
      expect(html).toContain('TalentLens');

      // Verify ATS subsection
      expect(html).toContain('ATS Resume Roaster Scans');
      expect(html).toContain('Deterministic 7-dimension keyword coverage');
      expect(html).toContain('+ New ATS Roast');

      // Verify TalentLens subsection
      expect(html).toContain('TalentLens Benchmark Scans');
      expect(html).toContain('Company-calibrated 6-layer competency evaluations');
      expect(html).toContain('+ New TalentLens Scan');
    });
  });

  describe('MySpaceSheet', () => {
    it('renders modal dialog with 7 navigation items when open', () => {
      const html = renderToString(
        <MemoryRouter initialEntries={['/?my=overview']}>
          <MySpaceSheet />
        </MemoryRouter>
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-label="My Space"');
      expect(html).toContain('Overview');
      expect(html).toContain('Scans');
      expect(html).toContain('Targets');
      expect(html).toContain('Plan');
      expect(html).toContain('Outreach');
      expect(html).toContain('Resumes');
      expect(html).toContain('Profile');
    });
  });
});
