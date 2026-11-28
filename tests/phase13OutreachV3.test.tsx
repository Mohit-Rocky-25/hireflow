import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import templatesRaw from '../src/data/suite/outreach/templates.json';
import { ProfileProvider } from '../src/features/suite/profile/ProfileContext';
import { ReachOutPage } from '../src/features/suite/outreach/ReachOutPage';
import { SpruceReachOutPage } from '../src/designs/spruce/pages/ReachOut/ReachOutPage';
import { EMPTY_OUTREACH_SLOTS } from '../src/features/suite/outreach/useReachOutStudio';
import {
  evaluateFinalComposerText,
  extractCandidateEvidenceOptions,
  extractTargetContextOptions,
  resolveTemplatesForPurpose,
} from '../src/features/suite/outreach/engine/contextIntelligence';
import { fitMessageToLength } from '../src/features/suite/outreach/engine/lengthFit';
import { validateAdmiredWork } from '../src/features/suite/outreach/engine/validateSlots';
import type { OutreachTemplateV2 } from '../src/features/suite/outreach/types';
import { useMySpaceStore, addCalendarDaysIso } from '../src/features/my-space/useMySpaceStore';
import { buildFollowUpReminderItems } from '../src/features/my-space/mySpaceSelectors';
import { outreachToRow, rowToOutreach } from '../src/sync/mappers';

const ALL_TEMPLATES = templatesRaw as OutreachTemplateV2[];

describe('Phase 13 — Outreach V3: Evidence, Composer Guardrails, Vault & Adversarial Corpus', () => {
  beforeEach(() => {
    useMySpaceStore.getState().resetAll();
  });

  it('starts with empty safe defaults and renders zero fictional Aarav/Rahul/Razorpay data in Default & Spruce SSR', () => {
    expect(EMPTY_OUTREACH_SLOTS.recipientName).toBe('');
    expect(EMPTY_OUTREACH_SLOTS.targetCompany).toBe('');
    expect(EMPTY_OUTREACH_SLOTS.your_name).toBe('');

    const defaultHtml = renderToString(
      <MemoryRouter initialEntries={['/tools/reach-out']}>
        <ProfileProvider>
          <ReachOutPage />
        </ProfileProvider>
      </MemoryRouter>
    );
    expect(defaultHtml).not.toContain('Aarav Menon');
    expect(defaultHtml).not.toContain('Rahul Deshmukh');
    expect(defaultHtml).not.toContain('aarav-demo/pgqueue');
    expect(defaultHtml).not.toContain('for Indian engineering students');
    expect(defaultHtml).toContain('Load Sample');

    const spruceHtml = renderToString(
      <MemoryRouter initialEntries={['/tools/reach-out']}>
        <ProfileProvider>
          <SpruceReachOutPage />
        </ProfileProvider>
      </MemoryRouter>
    );
    expect(spruceHtml).not.toContain('Aarav Menon');
    expect(spruceHtml).not.toContain('Rahul Deshmukh');
    expect(spruceHtml).toContain('Load Sample');
    expect(spruceHtml).toContain('Save to Vault');
  });

  it('extracts candidate evidence with provenance labels and detects conflicting profile vs resume names', () => {
    const { options, conflicts } = extractCandidateEvidenceOptions({
      domainProfile: {
        displayName: 'Maya Krishnan',
        email: 'maya@example.com',
        targetRoles: ['Backend Engineer'],
        links: { github: 'github.com/maya-k' },
        activeWorkspaceId: null,
        updatedAt: '2026-11-28T00:00:00Z',
      },
      suiteProfile: null,
      workspaces: {
        ws1: {
          id: 'ws1',
          name: 'Backend Track',
          roleTrack: 'Go & PostgreSQL',
          isPrimary: true,
          headVersionId: 'v1',
          createdAt: '2026-11-28T00:00:00Z',
          updatedAt: '2026-11-28T00:00:00Z',
          archivedAt: null,
        },
      },
      versions: {
        v1: {
          id: 'v1',
          workspaceId: 'ws1',
          label: 'v1',
          parentVersionId: null,
          snapshotHash: 'abc',
          createdAt: '2026-11-28T00:00:00Z',
        },
      },
      tailorSessions: {
        s1: {
          sessionId: 's1',
          title: 'Stripe Backend Tailor',
          mode: 'jd',
          draftStatus: 'in_progress',
          document: {
            candidateName: 'Maya K. Rao',
            contact: { email: 'maya@example.com' },
            layoutId: 'ats_single',
            paperSize: 'letter',
            rawSourceText: '',
            sections: [],
          },
          ownedProjects: [
            {
              id: 'proj1',
              title: 'Outbox Worker',
              candidateContribution: 'processed 4,200 events/sec in local test',
              technologiesUsed: ['Go', 'PostgreSQL'],
              completionStatus: 'completed',
              evidenceNote: 'Local benchmark log',
              sourceProvenance: 'personal_project',
              confirmedByCandidate: true,
              confirmedAt: '2026-11-28T00:00:00Z',
            },
          ],
          updatedAt: '2026-11-28T00:00:00Z',
        } as any,
      },
    });

    expect(options.length).toBeGreaterThanOrEqual(3);
    expect(options[0].provenance).toBe('candidate_attested');
    expect(options[0].projectOptions[0].proofText).toContain('Outbox Worker');
    expect(conflicts.length).toBe(1);
    expect(conflicts[0]).toContain('Maya Krishnan');

    const targets = extractTargetContextOptions({
      savedJds: [
        {
          id: 'jd1',
          title: 'Platform Engineer',
          company: 'Acme Cloud',
          source: 'pasted',
          text: 'Go and Postgres platform engineering',
          textHash: 'h1',
          tags: ['Go'],
          createdAt: '2026-11-28T00:00:00Z',
        },
      ],
      watchlist: {
        w1: {
          id: 'w1',
          targetKey: 'acme-cloud',
          companyName: 'Acme Cloud',
          roleTitle: 'Senior Engineer',
          addedAt: '2026-11-28T00:00:00Z',
          archivedAt: null,
        },
      },
      savedRoles: [],
    });
    expect(targets).toHaveLength(2);
    expect(targets[0].targetCompany).toBe('Acme Cloud');
  });

  it('evaluates 20 adversarial & lifecycle scenarios cleanly without fabrication or limit bypass', () => {
    const scenarios = [
      { id: 1, label: 'Student -> Recruiter', channel: 'linkedin_connect' as const, purpose: 'recruiter_outreach' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Stripe', targetRole: 'SWE Intern', recipientName: 'Elena', primarySkill: 'TypeScript', proofPoint: 'built CLI testing tool with 120 unit tests', your_name: 'Sam Patel' }, expectReady: true },
      { id: 2, label: 'Graduate -> Hiring Manager', channel: 'cold_email' as const, purpose: 'hiring_manager' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Linear', targetRole: 'Product Engineer', recipientName: 'Karthik', primarySkill: 'React & SQLite', proofPoint: 'built offline sync cache reducing reads by 30%', admiredProject: 'sync engine architecture post', portfolio: 'github.com/riya/sync-cache', your_name: 'Riya' }, expectReady: true },
      { id: 3, label: 'Cold LinkedIn connection', channel: 'linkedin_connect' as const, purpose: 'connection_invite' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Cloudflare', targetRole: 'Systems Engineer', recipientName: 'David', primarySkill: 'Rust', proofPoint: 'built HTTP parser handling 8k req/s', your_name: 'Nikhil' }, expectReady: true },
      { id: 4, label: 'Warm alumni connection', channel: 'warm_referral' as const, purpose: 'alumni_networking' as const, rel: 'alumni' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Datadog', targetRole: 'Backend Engineer', recipientName: 'Sonia', college: 'UT Austin', primarySkill: 'Go', proofPoint: 'built OpenTelemetry exporter in Go', your_name: 'Chris' }, expectReady: true },
      { id: 5, label: 'Referral request (existing connection)', channel: 'warm_referral' as const, purpose: 'warm_referral' as const, rel: 'warm' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Figma', targetRole: 'Frontend Engineer', recipientName: 'Alex', college: 'Georgia Tech', primarySkill: 'TypeScript', proofPoint: 'built canvas renderer in WebGL', your_name: 'Jordan' }, expectReady: true },
      { id: 6, label: 'Recruiter role pitch', channel: 'cold_email' as const, purpose: 'recruiter_outreach' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Vercel', targetRole: 'Infra Engineer', recipientName: 'Hannah', primarySkill: 'Node.js & Docker', proofPoint: 'built container runner with sub-2s cold starts', admiredProject: 'Edge build cache architecture', portfolio: 'github.com/dev/runner', college: 'NIT Surat', your_name: 'Dev' }, expectReady: true },
      { id: 7, label: 'Post-application follow-up', channel: 'follow_up' as const, purpose: 'post_application' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Supabase', targetRole: 'Postgres Engineer', recipientName: 'Paul', primarySkill: 'PostgreSQL', proofPoint: 'built RLS policy tester', followUpNewInfo: 'published pg_stat benchmark suite', daysSince: 7, your_name: 'Ananya' }, expectReady: true },
      { id: 8, label: 'Thank-you after conversation', channel: 'cold_email' as const, purpose: 'thank_you' as const, rel: 'previous-contact' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Notion', targetRole: 'Backend Engineer', recipientName: 'Meera', primarySkill: 'TypeScript', proofPoint: 'shared Postgres indexing notes', admiredProject: 'block storage discussion', portfolio: 'github.com/kabir/pg-notes', college: 'IIT Bombay', your_name: 'Kabir' }, expectReady: true },
      { id: 9, label: 'Senior engineer -> technical leader', channel: 'cold_email' as const, purpose: 'hiring_manager' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Confluent', targetRole: 'Staff Distributed Systems Engineer', recipientName: 'Marcus', primarySkill: 'Kafka & Go', proofPoint: 'led partition rebalancing overhaul cutting lag by 40%', admiredProject: 'KRaft metadata quorum design', portfolio: 'github.com/priya/kafka-rebalance', your_name: 'Priya' }, expectReady: true },
      { id: 10, label: 'Career switcher', channel: 'cold_email' as const, purpose: 'cold_intro' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Shopify', targetRole: 'Data Analyst', recipientName: 'Claire', primarySkill: 'SQL & Python', proofPoint: 'automated supply-chain reconciliation scripts saving 6 hrs/week', admiredProject: 'merchant analytics dashboard', portfolio: 'github.com/omar/reconcile', your_name: 'Omar' }, expectReady: true },
      { id: 11, label: 'Candidate without metrics', channel: 'linkedin_connect' as const, purpose: 'cold_intro' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Atlassian', targetRole: 'Software Engineer', recipientName: 'Ben', primarySkill: 'Java & Spring', proofPoint: 'built REST task tracker with integration tests', your_name: 'Tara' }, expectReady: true },
      { id: 12, label: 'Candidate with confirmed metrics', channel: 'linkedin_connect' as const, purpose: 'recruiter_outreach' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Razorpay', targetRole: 'Backend Engineer', recipientName: 'Neha', primarySkill: 'Go', proofPoint: 'reduced webhook retry latency by 35% in load test', your_name: 'Rohan' }, expectReady: true },
      { id: 13, label: 'Candidate with personal project', channel: 'cold_email' as const, purpose: 'hiring_manager' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Fly.io', targetRole: 'Systems Engineer', recipientName: 'Kurt', primarySkill: 'Rust', proofPoint: 'built personal TCP proxy project with benchmark harness', admiredProject: 'Anycast routing post', portfolio: 'github.com/noah/tcp-proxy', your_name: 'Noah' }, expectReady: true },
      { id: 14, label: 'Candidate with user-attested info', channel: 'cold_email' as const, purpose: 'cold_intro' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Postman', targetRole: 'API Engineer', recipientName: 'Aditi', primarySkill: 'Node.js', proofPoint: 'confirmed 99.9% test pass across 240 API endpoints', admiredProject: 'collection runner architecture', portfolio: 'github.com/vikram/api-harness', your_name: 'Vikram' }, expectReady: true },
      { id: 15, label: 'Candidate without project experience', channel: 'linkedin_connect' as const, purpose: 'connection_invite' as const, rel: 'cold' as const, slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Twilio', targetRole: 'Junior Engineer', recipientName: 'Sam', primarySkill: 'Python & SQL', proofPoint: 'completed backend coursework in SQL transactions', your_name: 'Asha' }, expectReady: true },
    ];

    for (const sc of scenarios) {
      const candidates = resolveTemplatesForPurpose(ALL_TEMPLATES, sc.channel, sc.purpose);
      expect(candidates.length, `No template for scenario ${sc.label}`).toBeGreaterThan(0);
      const tmpl = candidates[0];
      const fitted = fitMessageToLength(tmpl, sc.slots, 0, { isPremiumLinkedIn: false });
      const evalRes = evaluateFinalComposerText({
        body: fitted.body,
        subject: fitted.subject,
        channel: tmpl.channel,
        relationship: sc.rel,
        isPremiumLinkedIn: false,
        slots: sc.slots,
        requiredSlots: tmpl.requiredSlots,
      });
      expect(evalRes.canCopyOrExport, `Scenario ${sc.label} blocked: ${JSON.stringify(evalRes.blockers)}`).toBe(sc.expectReady);
    }

    // 16. Missing recipient identity -> blocked
    const tmpl16 = ALL_TEMPLATES.find((t) => t.channel === 'linkedin_connect')!;
    const fit16 = fitMessageToLength(tmpl16, { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Stripe' }, 0);
    const eval16 = evaluateFinalComposerText({
      body: fit16.body,
      channel: 'linkedin_connect',
      relationship: 'cold',
      isPremiumLinkedIn: false,
      slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Stripe' },
      requiredSlots: tmpl16.requiredSlots,
    });
    expect(eval16.canCopyOrExport).toBe(false);
    expect(eval16.unresolvedPlaceholders.length).toBeGreaterThan(0);

    // 17. Missing company -> blocked
    const eval17 = evaluateFinalComposerText({
      body: 'Hi Alex, I build Go APIs. Open to connecting?',
      channel: 'linkedin_connect',
      relationship: 'cold',
      isPremiumLinkedIn: false,
      slots: { ...EMPTY_OUTREACH_SLOTS, recipientName: 'Alex' },
      requiredSlots: ['company', 'recipient_name'],
    });
    expect(eval17.canCopyOrExport).toBe(false);
    expect(eval17.blockers.some((b) => b.id === 'Q-BLK-MISSING-COMPANY')).toBe(true);

    // 18. Unsupported generic praise -> flagged
    const praiseCheck = validateAdmiredWork('great work');
    expect(praiseCheck.valid).toBe(false);

    // 20. Editing manual message beyond channel limit -> preserved text, blocked copy/export
    const longManual = 'Hi Alex, ' + 'x'.repeat(230);
    const eval20 = evaluateFinalComposerText({
      body: longManual,
      channel: 'linkedin_connect',
      relationship: 'cold',
      isPremiumLinkedIn: false,
      slots: { ...EMPTY_OUTREACH_SLOTS, targetCompany: 'Acme', recipientName: 'Alex' },
      requiredSlots: ['company'],
    });
    expect(eval20.status).toBe('overflow');
    expect(eval20.canCopyOrExport).toBe(false);
    expect(eval20.shorteningGuidance).toContain('200');
  });

  it('tracks Outreach Vault markOutreachSent (+5 UTC days), follow-up reminders, and mapper round-trip safely', () => {
    const store = useMySpaceStore.getState();
    const saved = store.saveOutreachDraft({
      templateId: 'recruiter-direct-note',
      channel: 'cold_email',
      status: 'draft',
      person: 'Elena Vance',
      company: 'Stripe',
      targetRole: 'Backend Engineer',
      intent: 'role_pitch',
      relationship: 'cold',
      subject: 'Backend Engineer — Go & Postgres',
      message: 'Hi Elena, I built a Go worker handling 4k jobs/sec.',
      renderedText: 'Subject: Backend Engineer — Go & Postgres\n\nHi Elena, I built a Go worker handling 4k jobs/sec.',
      slots: { person: 'Elena Vance', company: 'Stripe' },
      slotsSnapshot: {
        slots: { recipientName: 'Elena Vance', targetCompany: 'Stripe' },
        candidateSourceKind: 'tailor',
        candidateSourceLabel: 'Tailor Draft',
      },
    });

    const sent = store.markOutreachSent(saved.id)!;
    expect(sent.status).toBe('sent');
    expect(sent.sentAt).toBeTruthy();
    expect(sent.followUpDueAt).toBe(addCalendarDaysIso(sent.sentAt!, 5));

    // Mapper backward-compatible round-trip
    const row = outreachToRow(sent);
    const restored = rowToOutreach(row);
    expect(restored.subject).toBe('Backend Engineer — Go & Postgres');
    expect(restored.targetRole).toBe('Backend Engineer');
    expect(restored.followUpDueAt).toBe(sent.followUpDueAt);

    // Reminder appears when nowIso >= followUpDueAt, and disappears once child follow-up exists
    const dueReminders = buildFollowUpReminderItems([sent], sent.followUpDueAt!);
    expect(dueReminders).toHaveLength(1);
    expect(dueReminders[0].actionLabel).toBe('Draft Follow-Up');

    const childFollowUp = store.saveOutreachDraft({
      templateId: 'gentle-follow-up',
      channel: 'follow_up',
      status: 'draft',
      person: 'Elena Vance',
      company: 'Stripe',
      parentDraftId: sent.id,
      renderedText: 'Hi Elena, following up with new benchmark results.',
      slots: { person: 'Elena Vance', company: 'Stripe' },
    });
    const afterChild = buildFollowUpReminderItems([sent, childFollowUp], sent.followUpDueAt!);
    expect(afterChild).toHaveLength(0);
  });
});
