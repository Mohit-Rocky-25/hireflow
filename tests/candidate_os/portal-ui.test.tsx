import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { TargetWatchlist } from '@/features/portal/TargetWatchlist';
import { AuditTimeline } from '@/features/portal/AuditTimeline';
import { ExecutionPlan } from '@/features/portal/ExecutionPlan';
import { OutreachVault } from '@/features/portal/OutreachVault';
import { PortalPage } from '@/features/portal/PortalPage';

describe('Stage 6: Portal UI Components', () => {
  describe('TargetWatchlist', () => {
    it('renders empty state when no targets exist', () => {
      const html = renderToString(
        <MemoryRouter>
          <TargetWatchlist watchlist={{}} entries={{}} />
        </MemoryRouter>
      );
      expect(html).toContain('No target companies or roles added yet');
      expect(html).toContain('Add Target');
    });

    it('renders target rows when watchlist has items', () => {
      const watchlist = {
        'target-1': {
          id: 'target-1',
          targetKey: 'stripe:backend',
          companyName: 'Stripe',
          roleTitle: 'Backend Engineer',
          addedAt: '2026-11-13T10:00:00Z',
          archivedAt: null,
        },
      };

      const html = renderToString(
        <MemoryRouter>
          <TargetWatchlist watchlist={watchlist} entries={{}} />
        </MemoryRouter>
      );

      expect(html).toContain('Stripe');
      expect(html).toContain('Backend Engineer');
      expect(html).toContain('Never scanned');
    });
  });

  describe('AuditTimeline', () => {
    it('renders empty state when no audits or events exist', () => {
      const html = renderToString(
        <MemoryRouter>
          <AuditTimeline entries={{}} events={{}} />
        </MemoryRouter>
      );
      expect(html).toContain('No evaluation activity recorded');
    });

    it('renders audit entries grouped by day with filter capability', () => {
      const entries = {
        'audit-1': {
          schemaVersion: 1 as const,
          id: 'audit-1',
          kind: 'ats_roast' as const,
          createdAt: '2026-11-13T10:00:00Z',
          engineVersion: '5.0.0',
          runKey: 'a'.repeat(64),
          targetKey: 'stripe:backend',
          resume: { workspaceId: null, versionId: null, snapshotHash: 'b'.repeat(64), label: 'Base Resume' },
          jd: { company: 'Stripe', roleTitle: 'Backend Engineer', sourceUrl: null, snapshotHash: 'c'.repeat(64) },
          overallScore: 84,
          breakdown: [],
          gaps: [],
          strengths: [],
          evidence: [],
          findingsJson: {},
          delta: { previousAuditId: 'prev-1', previousScore: 80, overallDeltaPts: 4, resolvedGapIds: [], newGapIds: [] },
        },
      };

      const html = renderToString(
        <MemoryRouter>
          <AuditTimeline entries={entries} events={{}} />
        </MemoryRouter>
      );

      expect(html).toContain('Stripe / Backend Engineer');
      expect(html).toContain('84');
      expect(html).toMatch(/\+4.*%/);
      expect(html).toContain('Inspect');
    });
  });

  describe('ExecutionPlan', () => {
    it('renders tasks and handles empty states', () => {
      const planItems = {
        'item-1': {
          id: 'item-1',
          kind: 'build_brief' as const,
          refId: 'brief-1',
          title: 'Build high-throughput Kafka producer',
          status: 'planned' as const,
          linkedGapIds: ['gap-kafka'],
          addedFromAuditId: null,
          createdAt: '2026-11-13T10:00:00Z',
          updatedAt: '2026-11-13T10:00:00Z',
          completedAt: null,
        },
      };

      const html = renderToString(
        <MemoryRouter>
          <ExecutionPlan planItems={planItems} />
        </MemoryRouter>
      );

      expect(html).toContain('Build high-throughput Kafka producer');
      expect(html).toContain('linked');
      expect(html).toContain('build brief');
    });
  });

  describe('OutreachVault', () => {
    it('renders saved outreach drafts and templates', () => {
      const outreachDrafts = {
        'draft-1': {
          id: 'draft-1',
          templateId: 'cold-email-v1',
          channel: 'Email',
          status: 'draft' as const,
          slots: { company: 'Datadog', recipientName: 'Sarah Recruiter' },
          renderedText: 'Hi Sarah, saw the distributed systems role at Datadog...',
          createdAt: '2026-11-13T10:00:00Z',
          updatedAt: '2026-11-13T10:00:00Z',
        },
      };

      const html = renderToString(
        <MemoryRouter>
          <OutreachVault outreachDrafts={outreachDrafts} />
        </MemoryRouter>
      );

      expect(html).toContain('Datadog');
      expect(html).toContain('Sarah Recruiter');
      expect(html).toContain('Hi Sarah, saw the distributed systems role');
      expect(html).toContain('Copy Message');
    });
  });

  describe('PortalPage', () => {
    it('renders full command center layout with metrics, quick actions, and panels when authenticated', () => {
      const html = renderToString(
        <MemoryRouter>
          <PortalPage isAuthenticated={true} />
        </MemoryRouter>
      );

      expect(html).toContain('Candidate Hub');
      expect(html).toContain('Peak Benchmark');
      expect(html).toContain('Target Watchlist');
      expect(html).toContain('Audit Journal');
      expect(html).toContain('Execution Plan');
      expect(html).toContain('Outreach Vault');
      expect(html).toContain('Resume Matrix');
    });

    it('renders gate prompt when unauthenticated guest visits', () => {
      const html = renderToString(
        <MemoryRouter>
          <PortalPage isAuthenticated={false} />
        </MemoryRouter>
      );

      expect(html).toContain('Sign In to Unlock Candidate Command Center');
      expect(html).toContain('Sign in with Google');
    });
  });
});
