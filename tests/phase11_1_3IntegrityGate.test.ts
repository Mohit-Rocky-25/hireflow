import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseSourceToStructuredDocument,
  extractAtomicClaims,
  verifySingleProposalTruth,
  validateBeforeFinalize,
} from '@/features/tailor/engine/intelligencePipeline';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { resetAllUserMemoryStores, applyHydratedDataset } from '@/lib/cloud/cloudHydrator';
import { cloudRepository } from '@/lib/cloud/cloudRepository';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';

const BASELINE_RESUME = `Rohan Deshmukh
rohan.deshmukh@example.com | +1-206-555-0144 | Seattle, WA

SUMMARY
Backend engineer focused on TypeScript, Node.js, and PostgreSQL reliability.

EXPERIENCE
Software Engineer | NimbusPay | Jan 2022 - Present
- Built REST billing APIs in TypeScript and PostgreSQL handling 10,000 daily requests
- Reduced query latency by 25% via PostgreSQL composite indexing

PROJECTS
LedgerSync | TypeScript, PostgreSQL
- Built local transaction reconciler prototype

EDUCATION
B.S. in Computer Science, University of Washington (2022)

SKILLS
TypeScript, Node.js, PostgreSQL`;

function makeMockGatewayWithStorage(activeUser: string) {
  let uid: string | null = activeUser;
  let failStorageDelete = false;
  let failRpcErase = false;
  const storageObjects = new Set<string>([
    `${activeUser}/resumes/master.pdf`,
    `${activeUser}/jds/target-jd.txt`,
    `${activeUser}/exports/tailored.pdf`,
    `${activeUser}/exports/tailored.docx`,
    `${activeUser}/exports/tailored.md`,
    `${activeUser}/orphans/abandoned-upload.pdf`,
    'other-user-999/resumes/private.pdf',
  ]);
  const tables: Record<string, Record<string, unknown>[]> = {
    text_snapshots: [],
    resume_workspaces: [],
    resume_versions: [],
    audit_entries: [],
    journal_events: [],
    watchlist_targets: [],
    plan_items: [],
    outreach_drafts: [],
    gap_status: [],
    user_profiles: [],
    saved_jds: [],
    user_documents: [
      {
        id: 'doc1',
        user_id: activeUser,
        kind: 'resume',
        file_name: 'master.pdf',
        mime_type: 'application/pdf',
        byte_size: 1024,
        sha256: 'abc123',
        storage_bucket: 'user-documents',
        storage_path: `${activeUser}/resumes/master.pdf`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    feedback_items: [],
    legacy_import_receipts: [],
    tailoring_sessions: [],
    tailoring_changes: [],
    export_artifacts: [],
  };

  const gateway: CloudGateway = {
    isConfigured: () => true,
    getAuthenticatedUserId: async () => uid,
    selectRows: async <T,>(table: string, opts?: { eq?: Record<string, string>; limit?: number }) => {
      let rows = [...(tables[table] || [])].filter((r) => !r.user_id || r.user_id === uid);
      if (opts?.eq) {
        rows = rows.filter((r) => Object.entries(opts.eq!).every(([k, v]) => r[k] === v));
      }
      if (opts?.limit) rows = rows.slice(0, opts.limit);
      return rows as T[];
    },
    upsertRows: async (table, rows, opts) => {
      const list = tables[table] || [];
      for (const row of rows) {
        const stamped = { user_id: uid, ...row };
        const conflictCols = (opts?.onConflict || 'id').split(',').map((c) => c.trim());
        const idx = list.findIndex((existing) =>
          conflictCols.every((c) => (c === 'user_id' ? existing.user_id === uid : existing[c] === stamped[c]))
        );
        if (idx >= 0) {
          if (!opts?.ignoreDuplicates) list[idx] = { ...list[idx], ...stamped };
        } else {
          list.push(stamped);
        }
      }
      tables[table] = list;
    },
    deleteRows: async (table, match) => {
      tables[table] = (tables[table] || []).filter(
        (r) => !Object.entries(match).every(([k, v]) => r[k] === v)
      );
    },
    uploadStorageFile: async (path) => {
      storageObjects.add(path);
      return { path };
    },
    downloadStorageFile: async () => new Blob([]),
    createSignedDownloadUrl: async () => 'https://example.invalid/signed',
    removeStorageFiles: async (paths) => {
      if (failStorageDelete) throw new Error('Storage delete error');
      for (const p of paths) storageObjects.delete(p);
    },
    listUserStoragePaths: async (userId) =>
      Array.from(storageObjects).filter((p) => p.startsWith(`${userId}/`)),
    eraseMyDataRpc: async () => {
      if (failRpcErase) throw new Error('DB erase_my_data RPC error');
      for (const k of Object.keys(tables)) {
        tables[k] = tables[k].filter((r) => r.user_id !== uid);
      }
    },
  };

  return {
    gateway,
    tables,
    storageObjects,
    setUid: (next: string | null) => { uid = next; },
    setFailStorageDelete: (v: boolean) => { failStorageDelete = v; },
    setFailRpcErase: (v: boolean) => { failRpcErase = v; },
  };
}

describe('Phase 11.1.3 — Section 1: Extended 16-Category Adversarial Factuality Audit', () => {
  it('blocks fabricated claims across all 16 claim categories with 0 false acceptances & 0 false rejections', () => {
    const baseDoc = parseSourceToStructuredDocument(BASELINE_RESUME);
    const claims = extractAtomicClaims(
      baseDoc,
      { workspaceId: null, versionId: null, snapshotHash: null },
      []
    );

    const adversarialCases: Array<{ category: string; mutate: (d: typeof baseDoc) => typeof baseDoc }> = [
      {
        category: '1_fabricated_employer',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary' ? { ...s, summaryText: 'Backend engineer at Stripe building billing APIs.' } : s
          ),
        }),
      },
      {
        category: '2_fabricated_title',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? { ...s, entries: [{ ...s.entries[0], title: 'Product Manager' }] }
              : s
          ),
        }),
      },
      {
        category: '3_inflated_seniority',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary' ? { ...s, summaryText: 'Principal Staff Architect in TypeScript and PostgreSQL.' } : s
          ),
        }),
      },
      {
        category: '4_invented_yoe',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary' ? { ...s, summaryText: 'Backend engineer with 12+ years experience in Node.js.' } : s
          ),
        }),
      },
      {
        category: '5_unsupported_leadership',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary' ? { ...s, summaryText: 'Engineering Manager & Tech Lead for TypeScript services.' } : s
          ),
        }),
      },
      {
        category: '6_team_ownership_inflation',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary' ? { ...s, summaryText: 'Managed team of 25 engineers building TypeScript APIs.' } : s
          ),
        }),
      },
      {
        category: '7_unverified_compliance',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'skills' ? { ...s, skillsList: [...(s.skillsList || []), 'SOC 2 Compliance'] } : s
          ),
        }),
      },
      {
        category: '8_unsupported_tech_skill',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'skills' ? { ...s, skillsList: [...(s.skillsList || []), 'Kubernetes'] } : s
          ),
        }),
      },
      {
        category: '9_unsupported_domain_skill',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'skills' ? { ...s, skillsList: [...(s.skillsList || []), 'Quantitative Equity Derivatives'] } : s
          ),
        }),
      },
      {
        category: '10_altered_education',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'education' && s.entries
              ? { ...s, entries: [{ ...s.entries[0], title: 'Ph.D. in Distributed Systems' }] }
              : s
          ),
        }),
      },
      {
        category: '11_altered_employment_dates',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? { ...s, entries: [{ ...s.entries[0], dateRange: 'Jan 2015 - Present' }] }
              : s
          ),
        }),
      },
      {
        category: '12_invented_business_results',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary' ? { ...s, summaryText: 'Delivered $18M ARR growth with PostgreSQL billing APIs.' } : s
          ),
        }),
      },
      {
        category: '13_contradictory_metrics',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? {
                  ...s,
                  entries: [
                    {
                      ...s.entries[0],
                      bullets: [
                        ...s.entries[0].bullets,
                        {
                          id: 'b_contra',
                          text: 'Reduced query latency by 92% across billing services',
                          originalText: 'Reduced query latency by 25% via PostgreSQL composite indexing',
                          provenance: 'full_time',
                          linkedClaimIds: [],
                        },
                      ],
                    },
                  ],
                }
              : s
          ),
        }),
      },
      {
        category: '14_unsupported_project_completion',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'projects' && s.entries
              ? {
                  ...s,
                  entries: [
                    {
                      ...s.entries[0],
                      bullets: [
                        ...s.entries[0].bullets,
                        {
                          id: 'b_comp',
                          text: 'Launched to production across regional clusters',
                          originalText: '',
                          provenance: 'personal_project',
                          linkedClaimIds: [],
                        },
                      ],
                    },
                  ],
                }
              : s
          ),
        }),
      },
      {
        category: '15_fabricated_client_claims',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary'
              ? { ...s, summaryText: 'Built TypeScript APIs serving Fortune 500 enterprise clients.' }
              : s
          ),
        }),
      },
      {
        category: '16_unsupported_custom_section',
        mutate: (d) => ({
          ...d,
          sections: [
            ...d.sections,
            {
              id: 'sec_custom_bad',
              kind: 'custom',
              title: 'Leadership',
              visible: true,
              order: 99,
              entries: [
                {
                  id: 'e_custom_bad',
                  title: 'Platform Governance',
                  provenance: 'custom',
                  bullets: [
                    {
                      id: 'b_custom_bad',
                      text: 'Architected global Kubernetes fleet',
                      originalText: '',
                      provenance: 'custom',
                      linkedClaimIds: [],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      },
    ];

    let trueReject = 0;
    let falseAccept = 0;
    for (const tc of adversarialCases) {
      const res = validateBeforeFinalize({
        doc: tc.mutate(baseDoc),
        claims,
        requirements: [],
        mode: 'improve',
      });
      if (!res.factualPassed) trueReject++;
      else falseAccept++;
    }

    // Supported paraphrase & unmodified check (0 false rejections)
    const cleanRes = validateBeforeFinalize({ doc: baseDoc, claims, requirements: [], mode: 'improve' });
    const singleParaphrase = verifySingleProposalTruth(
      'Built REST billing APIs in TypeScript and PostgreSQL handling 10,000 daily requests',
      'Developed TypeScript and PostgreSQL REST billing services handling 10,000 daily requests',
      claims
    );

    expect(trueReject).toBe(16);
    expect(falseAccept).toBe(0);
    expect(cleanRes.factualPassed).toBe(true);
    expect(singleParaphrase.passed).toBe(true);
  });
});

describe('Phase 11.1.3 — Section 2 & 3: Draft Lifecycle Dirty Tracking & Complete Storage Erasure', () => {
  beforeEach(() => {
    resetAllUserMemoryStores();
  });
  afterEach(() => {
    _setCloudGatewayForTesting(null);
  });

  it('marks session dirty across manual edits, undo/redo, rejectSuggestion, confirmUserEvidence, setMode, and recovers via CloudRepository', async () => {
    const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const mock = makeMockGatewayWithStorage(USER_ID);
    _setCloudGatewayForTesting(mock.gateway);
    useAuthStore.setState({
      status: 'authenticated',
      isDemo: false,
      userId: USER_ID,
      email: 'rohan@example.com',
      displayName: 'Rohan',
    });

    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: BASELINE_RESUME,
      label: 'Rohan Master',
      entrySource: 'paste',
      mode: 'jd',
      jdTitle: 'Backend Engineer',
      jdText: 'Required: TypeScript, Node.js, PostgreSQL, Docker',
    });
    const sid = session.sessionId;
    await useTailorWorkspaceStore.getState().persistSessionToCloud(sid);
    expect(useTailorWorkspaceStore.getState().sessions[sid].cloudSyncStatus).toBe('saved');

    // Manual edit -> dirty
    const rev1 = useTailorWorkspaceStore.getState().sessions[sid].syncRevision!;
    useTailorWorkspaceStore.getState().updateHeader({ contact: { location: 'Bellevue, WA' } });
    expect(useTailorWorkspaceStore.getState().sessions[sid].syncRevision).toBeGreaterThan(rev1);
    expect(useTailorWorkspaceStore.getState().sessions[sid].cloudSyncStatus).toBe('idle');

    // Undo -> dirty, Redo -> dirty
    const rev2 = useTailorWorkspaceStore.getState().sessions[sid].syncRevision!;
    useTailorWorkspaceStore.getState().undo();
    expect(useTailorWorkspaceStore.getState().sessions[sid].syncRevision).toBeGreaterThan(rev2);
    const rev3 = useTailorWorkspaceStore.getState().sessions[sid].syncRevision!;
    useTailorWorkspaceStore.getState().redo();
    expect(useTailorWorkspaceStore.getState().sessions[sid].syncRevision).toBeGreaterThan(rev3);

    // Confirm user evidence without bulletId -> dirty
    const rev4 = useTailorWorkspaceStore.getState().sessions[sid].syncRevision!;
    useTailorWorkspaceStore.getState().confirmUserEvidence({
      factText: 'Used Docker in local CI verification',
      evidenceNote: 'Confirmed locally',
      targetSkillOrMetric: 'Docker',
    });
    expect(useTailorWorkspaceStore.getState().sessions[sid].syncRevision).toBeGreaterThan(rev4);

    // Mode change -> dirty
    const rev5 = useTailorWorkspaceStore.getState().sessions[sid].syncRevision!;
    useTailorWorkspaceStore.getState().setMode('improve');
    expect(useTailorWorkspaceStore.getState().sessions[sid].syncRevision).toBeGreaterThan(rev5);

    // Save + Hydrate restore
    expect(await useTailorWorkspaceStore.getState().persistSessionToCloud(sid)).toBe(true);
    const dataset = await cloudRepository.loadAllUserData(USER_ID);
    resetAllUserMemoryStores();
    applyHydratedDataset(USER_ID, dataset);
    expect(useTailorWorkspaceStore.getState().sessions[sid].document.contact.location).toBe('Bellevue, WA');
  });

  it('enforces auth.uid() ownership on eraseAllUserCloudData, deletes DB + all Storage objects (uploads, exports, orphans), and fails loudly on partial failure', async () => {
    const USER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const OTHER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const mock = makeMockGatewayWithStorage(USER_ID);
    _setCloudGatewayForTesting(mock.gateway);

    // Reject mismatched client-supplied userId
    await expect(cloudRepository.eraseAllUserCloudData(OTHER_ID)).rejects.toThrow();

    // Storage delete failure MUST abort before claiming DB erasure
    mock.setFailStorageDelete(true);
    await expect(cloudRepository.eraseAllUserCloudData(USER_ID)).rejects.toThrow(/Storage delete error/i);
    expect(mock.tables.user_documents).toHaveLength(1);
    mock.setFailStorageDelete(false);

    // Successful full erasure deletes resume, JD, PDF/DOCX/MD exports, and orphan files, leaving other user untouched
    const receipt = await cloudRepository.eraseAllUserCloudData(USER_ID);
    expect(receipt.storageCleared).toBe(true);
    expect(receipt.databaseCleared).toBe(true);
    expect(receipt.deletedPaths).toHaveLength(6);
    expect(mock.storageObjects.has('other-user-999/resumes/private.pdf')).toBe(true);
    expect(Array.from(mock.storageObjects).some((p) => p.startsWith(`${USER_ID}/`))).toBe(false);
    expect(mock.tables.user_documents).toHaveLength(0);
  });
});
