import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import {
  buildWorkspaceAssetSummary,
  buildContinueWorkItems,
  buildUnifiedActivityFeed,
} from '@/features/my-space/mySpaceSelectors';
import { OverviewSection } from '@/features/my-space/OverviewSection';
import { ProfileSection } from '@/features/my-space/ProfileSection';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useSavedRoleStore } from '@/store/savedRoleStore';
import { useBriefProgressStore } from '@/store/briefProgressStore';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import { resetAllUserMemoryStores } from '@/lib/cloud/cloudHydrator';

describe('Phase 12 — My Space Real-Data Selectors, Empty States, Continuation & Demo Honesty', () => {
  beforeEach(() => {
    resetAllUserMemoryStores();
  });

  it('computes strictly real asset counts with zero fabricated defaults', () => {
    const emptySummary = buildWorkspaceAssetSummary({
      workspaces: {},
      versions: {},
      tailorSessions: {},
      exportHistory: {},
      planItems: {},
      briefProgress: {},
      watchlist: {},
      savedJdsCount: 0,
      savedRolesCount: 0,
      auditsCount: 0,
      outreachDraftsCount: 0,
    });

    expect(emptySummary.resumeWorkspacesCount).toBe(0);
    expect(emptySummary.projectsAndPlanCount).toBe(0);
    expect(emptySummary.savedOpportunitiesCount).toBe(0);
    expect(emptySummary.auditsCount).toBe(0);
  });

  it('builds real Continue Where You Left Off items and Unified Recent Activity feed sorted newest-first', () => {
    const continueItems = buildContinueWorkItems({
      tailorSessions: [
        {
          sessionId: 'sess-1',
          title: 'Razorpay Backend Tailoring',
          mode: 'jd',
          draftStatus: 'in_progress',
          jdCompany: 'Razorpay',
          updatedAt: '2026-11-28T09:00:00Z',
        },
        {
          sessionId: 'sess-done',
          title: 'Old Exported Draft',
          mode: 'improve',
          draftStatus: 'exported',
          updatedAt: '2026-11-27T09:00:00Z',
        },
      ],
      planItems: [
        {
          id: 'plan-1',
          kind: 'credential',
          refId: 'cred-1',
          title: 'AWS Developer Associate',
          status: 'planned',
          linkedGapIds: [],
          addedFromAuditId: null,
          createdAt: '2026-11-27T00:00:00Z',
          updatedAt: '2026-11-28T08:00:00Z',
          completedAt: null,
        },
      ],
      briefProgress: {
        'brief-rate-limiter': { status: 'building', updatedAt: '2026-11-28T10:00:00Z' },
      },
      targets: [
        {
          id: 't-1',
          targetKey: 'stripe:swe',
          companyName: 'Stripe',
          roleTitle: 'Software Engineer',
          addedAt: '2026-11-28T07:00:00Z',
          archivedAt: null,
        },
      ],
      audits: [],
    });

    expect(continueItems).toHaveLength(4);
    expect(continueItems[0].id).toBe('continue_brief_brief-rate-limiter');
    expect(continueItems[0].to).toBe('/tools/build-briefs?brief=brief-rate-limiter');
    expect(continueItems[1].to).toBe('/tools/tailor?draft=sess-1');
    expect(continueItems.some((c) => c.id.includes('sess-done'))).toBe(false);

    const activity = buildUnifiedActivityFeed({
      audits: [],
      events: [],
      tailorSessions: [
        {
          sessionId: 'sess-1',
          title: 'Razorpay Backend Tailoring',
          createdAt: '2026-11-28T08:00:00Z',
          updatedAt: '2026-11-28T09:30:00Z',
        },
      ],
      exportHistory: {
        'sess-1': [
          {
            id: 'exp-1',
            format: 'pdf',
            fileName: 'Ananya_Razorpay.pdf',
            createdAt: '2026-11-28T10:00:00Z',
          },
        ],
      },
      workspaces: [],
      planItems: [],
      savedJds: [{ id: 'jd-1', title: 'SDE II', company: 'Razorpay', createdAt: '2026-11-28T07:00:00Z' }],
    });

    expect(activity.map((a) => a.actionType)).toEqual(['Exported', 'Edited', 'Saved']);
  });

  it('renders honest empty states in OverviewSection and Demo RAM disclosure in ProfileSection', () => {
    useAuthStore.setState({
      status: 'authenticated',
      isDemo: true,
      userId: 'demo-user-1',
      displayName: 'Neha Kapoor',
      email: 'neha@example.com',
    });

    const overviewHtml = renderToString(
      <MemoryRouter>
        <OverviewSection
          audits={{}}
          targets={{}}
          planItems={{}}
          gapOverlay={{}}
          authOverride={{ displayName: 'Neha Kapoor', isDemo: true, status: 'authenticated' }}
        />
      </MemoryRouter>
    );

    expect(overviewHtml).toContain('Neha');
    expect(overviewHtml).toContain('Demo Session · RAM Only');
    expect(overviewHtml).toContain('Continue where you left off');
    expect(overviewHtml).toContain('No unfinished tailoring drafts');
    expect(overviewHtml).toContain('No activity recorded yet');

    const profileHtml = renderToString(
      <MemoryRouter>
        <ProfileSection authOverride={{ status: 'authenticated', isDemo: true }} />
      </MemoryRouter>
    );
    expect(profileHtml).toContain('Demo Mode active (session memory only)');
    expect(profileHtml).not.toContain('Synced to your Supabase Cloud account');
    expect(profileHtml).not.toContain('Delete my cloud data');
  });

  it('reflects live Tailoring drafts, Build Briefs, Saved Roles, and JDs on OverviewSection', async () => {
    useAuthStore.setState({
      status: 'authenticated',
      isDemo: true,
      userId: 'demo-user-2',
      displayName: 'Arjun Dev',
      email: 'arjun@example.com',
    });

    await useTailorWorkspaceStore.getState().createSessionFromText({
      text: 'Arjun Dev\narjun@example.com\n\nEXPERIENCE\nBackend Engineer | Acme | 2023 - Present\n- Built APIs in Go and PostgreSQL',
      label: 'Arjun Master',
      entrySource: 'paste',
      mode: 'improve',
    });
    useBriefProgressStore.getState().setStatus('brief-outbox', 'building');
    useSavedRoleStore.getState().saveRole({
      companyName: 'Google',
      companyId: 'google',
      roleTitle: 'Software Engineer',
      requiredSkills: ['TypeScript', 'Go'],
      tier: 'Tier A',
    });
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    useMySpaceStore.setState({ watchlist: {}, planItems: {}, outreachDrafts: {} });
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
    useSavedJdStore.setState({ jds: [] });

    const html = renderToString(
      <MemoryRouter>
        <OverviewSection
          authOverride={{ displayName: 'Arjun Dev', isDemo: true, status: 'authenticated' }}
          tailorSessionsOverride={useTailorWorkspaceStore.getState().sessions}
          briefProgressOverride={useBriefProgressStore.getState().progress}
        />
      </MemoryRouter>
    );
    expect(html).toContain('Resume Draft');
    expect(html).toContain('Continue Brief');
    expect(html).toContain('Tailor My Resume draft');
    expect(html).toMatch(/>(?:Created|Edited)</);
  });
});
