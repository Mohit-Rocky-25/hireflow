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
import { exportTailoredMarkdown } from '@/features/tailor/export/tailorExportAdapter';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';

const CANDIDATE_RESUME = `Meera Nair
meera.nair@example.com | +1-206-555-0192 | Seattle, WA

SUMMARY
Backend engineer experienced in TypeScript, Node.js, and PostgreSQL services.

EXPERIENCE
Software Engineer | FinStack | Jan 2022 - Present
- Built billing REST APIs in TypeScript and PostgreSQL handling 8,000 daily requests
Software Engineering Intern | CloudSeed | Jun 2020 - Aug 2020
- Helped with Node.js unit tests and PostgreSQL schema migrations

EDUCATION
B.S. in Computer Science, University of Washington (2021)

SKILLS
TypeScript, Node.js, PostgreSQL`;

describe('Phase 11.1.4 — Section 1: Truth Gate Edge Cases & Epistemic Separation', () => {
  it('blocks month-level, Present-substitution, reversed dates, degree specialization, intern-to-FT escalation, lateral role swaps, and indirect commercial claims while accepting supported paraphrases', () => {
    const baseDoc = parseSourceToStructuredDocument(CANDIDATE_RESUME);
    const claims = extractAtomicClaims(
      baseDoc,
      { workspaceId: null, versionId: null, snapshotHash: null },
      []
    );

    const mustBlock: Array<{ name: string; mutate: (d: typeof baseDoc) => typeof baseDoc }> = [
      {
        name: 'month_level_date_change',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? {
                  ...s,
                  entries: [{ ...s.entries[0], dateRange: 'Dec 2022 - Present' }, s.entries[1]],
                }
              : s
          ),
        }),
      },
      {
        name: 'present_substitution',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? {
                  ...s,
                  entries: [s.entries[0], { ...s.entries[1], dateRange: 'Jun 2020 - Present' }],
                }
              : s
          ),
        }),
      },
      {
        name: 'reversed_date_range',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? {
                  ...s,
                  entries: [{ ...s.entries[0], dateRange: 'Jan 2024 - Jan 2021' }, s.entries[1]],
                }
              : s
          ),
        }),
      },
      {
        name: 'degree_specialization_change',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'education' && s.entries
              ? { ...s, entries: [{ ...s.entries[0], title: 'B.S. in Aerospace Engineering' }] }
              : s
          ),
        }),
      },
      {
        name: 'internship_to_employment_escalation',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? {
                  ...s,
                  entries: [s.entries[0], { ...s.entries[1], title: 'Software Engineer' }],
                }
              : s
          ),
        }),
      },
      {
        name: 'lateral_role_change',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'experience' && s.entries
              ? { ...s, entries: [{ ...s.entries[0], title: 'DevOps Engineer' }, s.entries[1]] }
              : s
          ),
        }),
      },
      {
        name: 'indirect_client_commercial_completion',
        mutate: (d) => ({
          ...d,
          sections: d.sections.map((s) =>
            s.kind === 'summary'
              ? {
                  ...s,
                  summaryText:
                    'Shipped to production for 15 enterprise clients improving EBITDA cleanly.',
                }
              : s
          ),
        }),
      },
    ];

    for (const tc of mustBlock) {
      const res = validateBeforeFinalize({
        doc: tc.mutate(baseDoc),
        claims,
        requirements: [],
        mode: 'improve',
      });
      expect(res.factualPassed, `Expected ${tc.name} to be blocked`).toBe(false);
    }

    // Supported paraphrase must pass
    const paraCheck = verifySingleProposalTruth(
      'Built billing REST APIs in TypeScript and PostgreSQL handling 8,000 daily requests',
      'Developed TypeScript and PostgreSQL billing REST services handling 8,000 daily requests',
      claims
    );
    expect(paraCheck.passed).toBe(true);

    // Unknown ungrounded claim must be flagged as unsupported (not silently accepted)
    const unknownCheck = verifySingleProposalTruth(
      'Helped with Node.js unit tests and PostgreSQL schema migrations',
      'Owned Kubernetes cluster architecture for 20+ banking accounts',
      claims
    );
    expect(unknownCheck.passed).toBe(false);
    expect(unknownCheck.issues.length).toBeGreaterThan(0);
  });
});

describe('Phase 11.1.4 — Section 2 & 3: Concurrency & Large-Scale Storage Erasure', () => {
  beforeEach(() => {
    resetAllUserMemoryStores();
  });
  afterEach(() => {
    _setCloudGatewayForTesting(null);
  });

  it('serializes overlapping saves, preserves lastSavedRevision on mid-flight edits, prevents deleteDraft resurrection, and exports dirty valid drafts cleanly', async () => {
    const USER_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
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
      user_documents: [],
      feedback_items: [],
      legacy_import_receipts: [],
      tailoring_sessions: [],
      tailoring_changes: [],
      export_artifacts: [],
    };
    let failWrites = false;
    let delayMs = 35;

    const gateway: CloudGateway = {
      isConfigured: () => true,
      getAuthenticatedUserId: async () => USER_ID,
      selectRows: async <T,>(table: string) =>
        [...(tables[table] || [])].filter((r) => !r.user_id || r.user_id === USER_ID) as T[],
      upsertRows: async (table, rows, opts) => {
        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
        if (failWrites) throw new Error('Simulated transient failure');
        const list = tables[table] || [];
        for (const row of rows) {
          const stamped = { user_id: USER_ID, ...row };
          const cols = (opts?.onConflict || 'id').split(',').map((c) => c.trim());
          const idx = list.findIndex((ex) =>
            cols.every((c) => (c === 'user_id' ? ex.user_id === USER_ID : ex[c] === stamped[c]))
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
      uploadStorageFile: async (p) => ({ path: p }),
      downloadStorageFile: async () => new Blob([]),
      createSignedDownloadUrl: async () => 'https://example.invalid/signed',
      removeStorageFiles: async () => {},
      listUserStoragePaths: async () => [],
      eraseMyDataRpc: async () => {},
    };

    _setCloudGatewayForTesting(gateway);
    useAuthStore.setState({
      status: 'authenticated',
      isDemo: false,
      userId: USER_ID,
      email: 'meera@example.com',
      displayName: 'Meera',
    });

    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: CANDIDATE_RESUME,
      label: 'Meera Master',
      entrySource: 'paste',
      mode: 'improve',
      createMatrixWorkspace: false,
    });
    const sid = session.sessionId;

    // 1. Overlapping save + mid-flight edit -> lastSavedRevision records saved rev, cloudSyncStatus stays 'idle'
    const save1 = useTailorWorkspaceStore.getState().persistSessionToCloud(sid);
    useTailorWorkspaceStore.getState().updateHeader({ contact: { location: 'Tacoma, WA' } });
    const revAfterEdit = useTailorWorkspaceStore.getState().sessions[sid].syncRevision!;
    await save1;
    const afterSave1 = useTailorWorkspaceStore.getState().sessions[sid];
    expect(afterSave1.lastSavedRevision).toBeLessThan(revAfterEdit);
    expect(afterSave1.cloudSyncStatus).toBe('idle');

    // 2. Valid unsaved draft exports cleanly without altering unsaved dirty state
    const exported = exportTailoredMarkdown(afterSave1.document);
    expect(exported.payload).toContain('Tacoma, WA');

    // 3. Failed save followed by retry
    failWrites = true;
    expect(await useTailorWorkspaceStore.getState().persistSessionToCloud(sid)).toBe(false);
    expect(useTailorWorkspaceStore.getState().sessions[sid].cloudSyncStatus).toBe('error');
    failWrites = false;
    expect(await useTailorWorkspaceStore.getState().persistSessionToCloud(sid)).toBe(true);
    expect(useTailorWorkspaceStore.getState().sessions[sid].cloudSyncStatus).toBe('saved');

    // 4. Reload restoration preserves latest saved edit
    const dataset = await cloudRepository.loadAllUserData(USER_ID);
    resetAllUserMemoryStores();
    applyHydratedDataset(USER_ID, dataset);
    expect(useTailorWorkspaceStore.getState().sessions[sid].document.contact.location).toBe('Tacoma, WA');

    // 5. Delete while a save is pending MUST NOT resurrect deleted session in cloud
    const pendingSave = useTailorWorkspaceStore.getState().persistSessionToCloud(sid);
    await useTailorWorkspaceStore.getState().deleteDraft(sid);
    await pendingSave;
    expect(tables.tailoring_sessions).toHaveLength(0);
  });

  it('erases >1000 paginated nested Storage objects, handles partial failure + idempotent retry, catches concurrent uploads, and blocks false success if objects remain', async () => {
    const USER_ID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    const objects = new Set<string>();
    // 1,250 objects (>1 page of 1000) + nested + orphans + exports
    for (let i = 0; i < 1250; i++) {
      objects.add(`${USER_ID}/nested/level1/level2/file-${i}.pdf`);
    }
    objects.add(`${USER_ID}/resumes/cv.pdf`);
    objects.add(`${USER_ID}/jds/jd.txt`);
    objects.add(`${USER_ID}/exports/out.docx`);
    objects.add(`${USER_ID}/exports/out.md`);
    objects.add('other-user-999/nested/secret.pdf');

    let failDeleteAfterFirstBatch = false;
    let injectConcurrentUploadOnce = true;
    let stubbornObject: string | null = null;

    const gateway: CloudGateway = {
      isConfigured: () => true,
      getAuthenticatedUserId: async () => USER_ID,
      selectRows: async <T,>() => [] as T[],
      upsertRows: async () => {},
      deleteRows: async () => {},
      uploadStorageFile: async (p) => ({ path: p }),
      downloadStorageFile: async () => new Blob([]),
      createSignedDownloadUrl: async () => 'https://example.invalid/signed',
      removeStorageFiles: async (paths) => {
        if (failDeleteAfterFirstBatch) {
          // Delete half, then fail partway
          for (const p of paths.slice(0, 10)) objects.delete(p);
          throw new Error('Partial storage delete failure');
        }
        for (const p of paths) {
          if (p !== stubbornObject) objects.delete(p);
        }
      },
      listUserStoragePaths: async (userId) =>
        Array.from(objects).filter((p) => p.startsWith(`${userId}/`)),
      eraseMyDataRpc: async () => {
        if (injectConcurrentUploadOnce) {
          injectConcurrentUploadOnce = false;
          objects.add(`${USER_ID}/concurrent/late-upload.pdf`);
        }
      },
    };

    _setCloudGatewayForTesting(gateway);

    // 1. Partial failure MUST throw
    failDeleteAfterFirstBatch = true;
    await expect(cloudRepository.eraseAllUserCloudData(USER_ID)).rejects.toThrow(/Partial storage/i);
    failDeleteAfterFirstBatch = false;

    // 2. Idempotent retry catches concurrent upload in post-DB re-scan and removes all 1255 user objects
    const receipt = await cloudRepository.eraseAllUserCloudData(USER_ID);
    expect(receipt.storageCleared).toBe(true);
    expect(receipt.databaseCleared).toBe(true);
    expect(receipt.deletedPaths.length).toBeGreaterThanOrEqual(1245);
    expect(Array.from(objects).some((p) => p.startsWith(`${USER_ID}/`))).toBe(false);
    expect(objects.has('other-user-999/nested/secret.pdf')).toBe(true);

    // 3. If any user object stubbornly remains after retry, eraseAllUserCloudData MUST throw
    stubbornObject = `${USER_ID}/locked/undeletable.pdf`;
    objects.add(stubbornObject);
    await expect(cloudRepository.eraseAllUserCloudData(USER_ID)).rejects.toThrow(
      /Incomplete account erasure/i
    );
  });
});
