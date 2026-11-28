import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { resetAllUserMemoryStores, applyHydratedDataset } from '@/lib/cloud/cloudHydrator';
import { cloudRepository } from '@/lib/cloud/cloudRepository';
import { uploadPrivateDocument } from '@/lib/cloud/storageService';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';

const SAMPLE_RESUME = `Kiran Menon
kiran.menon@example.com | Seattle, WA

SUMMARY
Backend engineer experienced in TypeScript, Node.js, and PostgreSQL.

EXPERIENCE
Software Engineer | FinCore | Jan 2022 - Present
- Built billing APIs in TypeScript and PostgreSQL handling 12,000 daily requests

SKILLS
TypeScript, Node.js, PostgreSQL`;

function createDeferred<T = void>() {
  let resolve!: (val: T | PromiseLike<T>) => void;
  let reject!: (err?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function makeControlledGateway(userId: string) {
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
  const storageObjects = new Set<string>();
  const pendingUpserts: Array<{ table: string; gate: ReturnType<typeof createDeferred> }> = [];
  let holdNextTailoringUpsert = false;
  let failTailoringDelete = false;
  let failStorageDelete = false;
  let partialDeleteOnce = false;
  let injectConcurrentObjectOnErase = false;
  let stubbornObject: string | null = null;
  let holdEraseStartGate: ReturnType<typeof createDeferred> | null = null;

  const gateway: CloudGateway = {
    isConfigured: () => true,
    getAuthenticatedUserId: async () => userId,
    selectRows: async <T,>(table: string) =>
      [...(tables[table] || [])].filter((r) => !r.user_id || r.user_id === userId) as T[],
    upsertRows: async (table, rows, opts) => {
      if (table === 'tailoring_sessions' && holdNextTailoringUpsert) {
        const gate = createDeferred();
        pendingUpserts.push({ table, gate });
        await gate.promise;
      }
      const list = tables[table] || [];
      for (const row of rows) {
        const stamped = { user_id: userId, ...row };
        const cols = (opts?.onConflict || 'id').split(',').map((c) => c.trim());
        const idx = list.findIndex((ex) =>
          cols.every((c) => (c === 'user_id' ? ex.user_id === userId : ex[c] === stamped[c]))
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
      if (table === 'tailoring_sessions' && failTailoringDelete) {
        throw new Error('Simulated cloud delete failure');
      }
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
      if (failStorageDelete) throw new Error('Storage delete API error');
      if (partialDeleteOnce) {
        partialDeleteOnce = false;
        for (const p of paths.slice(0, 20)) storageObjects.delete(p);
        throw new Error('Partial storage deletion failure');
      }
      for (const p of paths) {
        if (p !== stubbornObject) storageObjects.delete(p);
      }
    },
    listUserStoragePaths: async (uid) => {
      if (holdEraseStartGate) {
        await holdEraseStartGate.promise;
      }
      return Array.from(storageObjects).filter((p) => p.startsWith(`${uid}/`));
    },
    eraseMyDataRpc: async () => {
      if (injectConcurrentObjectOnErase) {
        injectConcurrentObjectOnErase = false;
        storageObjects.add(`${userId}/concurrent/late-file.pdf`);
      }
      for (const k of Object.keys(tables)) {
        tables[k] = tables[k].filter((r) => r.user_id !== userId);
      }
    },
  };

  return {
    gateway,
    tables,
    storageObjects,
    pendingUpserts,
    setHoldNextTailoringUpsert: (v: boolean) => { holdNextTailoringUpsert = v; },
    setFailTailoringDelete: (v: boolean) => { failTailoringDelete = v; },
    setFailStorageDelete: (v: boolean) => { failStorageDelete = v; },
    setPartialDeleteOnce: (v: boolean) => { partialDeleteOnce = v; },
    setInjectConcurrentObjectOnErase: (v: boolean) => { injectConcurrentObjectOnErase = v; },
    setStubbornObject: (p: string | null) => { stubbornObject = p; },
    setHoldEraseStartGate: (g: ReturnType<typeof createDeferred> | null) => { holdEraseStartGate = g; },
  };
}

describe('Phase 11.1.4.1 — P0 Draft Save/Delete Linearizability', () => {
  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    resetAllUserMemoryStores();
    useAuthStore.setState({
      status: 'authenticated',
      isDemo: false,
      userId: USER_ID,
      email: 'kiran@example.com',
      displayName: 'Kiran',
    });
  });

  afterEach(() => {
    _setCloudGatewayForTesting(null);
  });

  it('guarantees linearizable ordering across in-flight saves, queued saves, edits, failed/retried deletes, stale hydration, and new sessions', async () => {
    const ctrl = makeControlledGateway(USER_ID);
    _setCloudGatewayForTesting(ctrl.gateway);

    const session = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: SAMPLE_RESUME,
      label: 'Kiran Master',
      entrySource: 'paste',
      mode: 'improve',
      createMatrixWorkspace: false,
    });
    const sid = session.sessionId;
    await useTailorWorkspaceStore.getState().persistSessionToCloud(sid);

    // 1. Save A starts + Save B queued + Edit occurs while Save A is pending -> Save A resolves cleanly without marking newer revision saved
    ctrl.setHoldNextTailoringUpsert(true);
    const saveA = useTailorWorkspaceStore.getState().persistSessionToCloud(sid);
    useTailorWorkspaceStore.getState().updateHeader({ contact: { location: 'Bellevue, WA' } });
    const revAfterEdit = useTailorWorkspaceStore.getState().sessions[sid].syncRevision!;
    const saveB = useTailorWorkspaceStore.getState().persistSessionToCloud(sid);

    // Wait a microtask for Save A to reach deferred upsert
    await new Promise((r) => setTimeout(r, 10));
    expect(ctrl.pendingUpserts).toHaveLength(1);
    ctrl.pendingUpserts[0].gate.resolve();
    await saveA;
    // Save B starts after Save A settles
    await new Promise((r) => setTimeout(r, 10));
    expect(ctrl.pendingUpserts).toHaveLength(2);
    ctrl.pendingUpserts[1].gate.resolve();
    await saveB;
    ctrl.setHoldNextTailoringUpsert(false);

    const afterSaves = useTailorWorkspaceStore.getState().sessions[sid];
    expect(afterSaves.lastSavedRevision).toBe(revAfterEdit);
    expect(afterSaves.cloudSyncStatus).toBe('saved');

    // 2. Two saves queued -> Delete requested -> both saves drain -> Delete fails -> User retries Delete -> Succeeds
    ctrl.setHoldNextTailoringUpsert(true);
    const s1 = useTailorWorkspaceStore.getState().persistSessionToCloud(sid);
    const s2 = useTailorWorkspaceStore.getState().persistSessionToCloud(sid);
    ctrl.setFailTailoringDelete(true);
    const delFailPromise = useTailorWorkspaceStore.getState().deleteDraft(sid);

    // Attempt new save AFTER deletion begins -> must be rejected cleanly
    const postDeleteSave = await useTailorWorkspaceStore.getState().persistSessionToCloud(sid);
    expect(postDeleteSave).toBe(false);

    // Drain held upserts
    await new Promise((r) => setTimeout(r, 10));
    ctrl.pendingUpserts.forEach((p) => p.gate.resolve());
    await s1;
    await new Promise((r) => setTimeout(r, 10));
    ctrl.pendingUpserts.forEach((p) => p.gate.resolve());
    await s2;

    const delOk1 = await delFailPromise;
    expect(delOk1).toBe(false);
    // Failed deletion MUST keep session visible with error so user can retry!
    expect(useTailorWorkspaceStore.getState().sessions[sid]).toBeDefined();
    expect(useTailorWorkspaceStore.getState().sessions[sid].cloudSyncStatus).toBe('error');

    // Retry deletion -> succeeds & removes from both cloud and local store
    ctrl.setFailTailoringDelete(false);
    ctrl.setHoldNextTailoringUpsert(false);
    const delOk2 = await useTailorWorkspaceStore.getState().deleteDraft(sid);
    expect(delOk2).toBe(true);
    expect(useTailorWorkspaceStore.getState().sessions[sid]).toBeUndefined();
    expect(ctrl.tables.tailoring_sessions).toHaveLength(0);

    // 3. Stale hydration MUST NOT resurrect deleted session
    useTailorWorkspaceStore.getState().hydrateFromCloudSessions({ [sid]: afterSaves }, {});
    expect(useTailorWorkspaceStore.getState().sessions[sid]).toBeUndefined();

    // 4. Newly created session gets fresh UUID and never inherits old deletion tombstone
    const fresh = await useTailorWorkspaceStore.getState().createSessionFromText({
      text: SAMPLE_RESUME,
      label: 'Kiran Fresh',
      entrySource: 'paste',
      mode: 'improve',
      createMatrixWorkspace: false,
    });
    expect(fresh.sessionId).not.toBe(sid);
    expect(await useTailorWorkspaceStore.getState().persistSessionToCloud(fresh.sessionId)).toBe(true);
    expect(ctrl.tables.tailoring_sessions).toHaveLength(1);
  });
});

describe('Phase 11.1.4.1 — P0 Private Storage Erasure Integrity & Client Upload Lock', () => {
  const USER_ID = '22222222-2222-4222-8222-222222222222';

  afterEach(() => {
    _setCloudGatewayForTesting(null);
  });

  it('handles >1000 nested/orphan/export objects, blocks concurrent in-process uploads during erasure, recovers from partial delete, catches rescan leftovers, and rejects stubborn objects', async () => {
    const ctrl = makeControlledGateway(USER_ID);
    _setCloudGatewayForTesting(ctrl.gateway);

    for (let i = 0; i < 1100; i++) {
      ctrl.storageObjects.add(`${USER_ID}/nested/a/b/item-${i}.pdf`);
    }
    ctrl.storageObjects.add(`${USER_ID}/resumes/master.pdf`);
    ctrl.storageObjects.add(`${USER_ID}/jds/role.txt`);
    ctrl.storageObjects.add(`${USER_ID}/exports/cv.pdf`);
    ctrl.storageObjects.add(`${USER_ID}/exports/cv.docx`);
    ctrl.storageObjects.add(`${USER_ID}/exports/cv.md`);
    ctrl.storageObjects.add(`${USER_ID}/orphans/abandoned.pdf`);
    ctrl.storageObjects.add('33333333-3333-4333-8333-333333333333/resumes/other.pdf');

    // 1. Upload attempted while local erasure is active MUST be blocked
    const gate = createDeferred();
    ctrl.setHoldEraseStartGate(gate);
    const activeErase = cloudRepository.eraseAllUserCloudData(USER_ID);
    await expect(
      uploadPrivateDocument({
        userId: USER_ID,
        docKind: 'resume',
        fileName: 'concurrent.pdf',
        mimeType: 'application/pdf',
        buffer: new TextEncoder().encode('%PDF-1.4\n%test').buffer,
      })
    ).rejects.toThrow(/Account erasure is currently in progress/i);
    gate.resolve();
    await activeErase;

    // Re-seed for partial failure + retry + concurrent object + stubborn object scenarios
    for (let i = 0; i < 1050; i++) {
      ctrl.storageObjects.add(`${USER_ID}/nested/page2/obj-${i}.pdf`);
    }
    ctrl.setPartialDeleteOnce(true);
    await expect(cloudRepository.eraseAllUserCloudData(USER_ID)).rejects.toThrow(
      /Partial storage deletion failure/i
    );

    // Retry succeeds and catches concurrent object injected during eraseMyDataRpc
    ctrl.setInjectConcurrentObjectOnErase(true);
    const receipt = await cloudRepository.eraseAllUserCloudData(USER_ID);
    expect(receipt.storageCleared).toBe(true);
    expect(receipt.databaseCleared).toBe(true);
    expect(Array.from(ctrl.storageObjects).some((p) => p.startsWith(`${USER_ID}/`))).toBe(false);
    expect(ctrl.storageObjects.has('33333333-3333-4333-8333-333333333333/resumes/other.pdf')).toBe(
      true
    );

    // Persistent stubborn object after MAX_ERASURE_RESCAN_ATTEMPTS MUST fail loudly
    ctrl.setStubbornObject(`${USER_ID}/locked/stubborn.pdf`);
    ctrl.storageObjects.add(`${USER_ID}/locked/stubborn.pdf`);
    await expect(cloudRepository.eraseAllUserCloudData(USER_ID)).rejects.toThrow(
      /Incomplete account erasure/i
    );
  });
});
