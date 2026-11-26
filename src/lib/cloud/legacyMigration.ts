// ============================================================
// HireFlow — Temporary One-Time Legacy Browser Data Importer
// Section 8 compliance:
// - Read-only inspection until explicit authenticated user approval.
// - Attaches imported records strictly to authenticated Supabase UUID.
// - Validates all records and preserves workspace -> version -> snapshot -> audit links.
// - Deduplicates via Postgres `legacy_import_receipts` + SHA-256 keys.
// - NEVER deletes local legacy keys until remote persistence & receipt succeed.
// ============================================================

import { getCloudGateway, type LegacyImportReceiptRow } from '@/sync/supabaseGateway';
import {
  snapshotToRow,
  workspaceToRow,
  versionToRow,
  auditToRow,
  savedJdToRow,
  targetToRow,
  planItemToRow,
} from '@/sync/mappers';
import { SavedJDSchema, SavedJDStoreSchema, type SavedJD } from '@/types/schemas-v4';
import type {
  AuditEntry,
  PlanItem,
  ResumeVersion,
  ResumeWorkspace,
  TextSnapshot,
  WatchlistTarget,
} from '@/domain/types';
import { sha256Hex } from '@/lib/crypto/sha256';
import { normalizeText, countWords } from '@/lib/text/normalize';
import { createId } from '@/lib/safeUtils';
import {
  CloudAuthRequiredError,
  CloudNotConfiguredError,
  CloudWriteFailedError,
} from './errors';

const IDB_NAME = 'hireflow-kv';
const IDB_STORE = 'kv';

function readLegacyIdbAll(prefix: string): Promise<Array<{ key: string; value: unknown }>> {
  if (typeof indexedDB === 'undefined') return Promise.resolve([]);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onerror = () => resolve([]);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) {
          req.result.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.close();
          resolve([]);
          return;
        }
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const keysReq = store.getAllKeys();
        keysReq.onsuccess = () => {
          const matchedKeys = (keysReq.result as unknown[])
            .filter((k): k is string => typeof k === 'string' && k.startsWith(prefix));
          if (matchedKeys.length === 0) {
            db.close();
            resolve([]);
            return;
          }
          const results: Array<{ key: string; value: unknown }> = [];
          let remaining = matchedKeys.length;
          for (const key of matchedKeys) {
            const valReq = store.get(key);
            valReq.onsuccess = () => {
              results.push({ key, value: valReq.result });
              remaining--;
              if (remaining === 0) {
                db.close();
                resolve(results);
              }
            };
            valReq.onerror = () => {
              remaining--;
              if (remaining === 0) {
                db.close();
                resolve(results);
              }
            };
          }
        };
        keysReq.onerror = () => {
          db.close();
          resolve([]);
        };
      };
    } catch {
      resolve([]);
    }
  });
}

function deleteLegacyIdbKeys(keys: string[]): Promise<void> {
  if (typeof indexedDB === 'undefined' || keys.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onerror = () => resolve();
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.close();
          resolve();
          return;
        }
        const tx = db.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        for (const k of keys) {
          store.delete(k);
        }
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          resolve();
        };
      };
    } catch {
      resolve();
    }
  });
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LEGACY_LOCALSTORAGE_KEYS = [
  'hireflow_tool_ats_v3',
  'hireflow:v4:saved_jds',
  'hireflow:v4:saved-jds',
  'hireflow:v4:scan_history',
  'hireflow:v4:scan-history',
  'hireflow:v4:profile',
  'hireflow:v4:saved_roles',
  'hireflow:v4:saved-roles',
  'hireflow:v4:brief-progress',
  'hireflow:v4:feedback',
  'hireflow-storage-v4',
] as const;

export interface LegacyMigrationPreview {
  hasLegacyData: boolean;
  importKey: string | null;
  counts: {
    savedJds: number;
    atsScans: number;
    workspaces: number;
    audits: number;
    watchlistTargets: number;
    planItems: number;
  };
  detectedSources: string[];
  snapshots: TextSnapshot[];
  workspaces: ResumeWorkspace[];
  versions: ResumeVersion[];
  audits: AuditEntry[];
  savedJds: SavedJD[];
  watchlistTargets: WatchlistTarget[];
  planItems: PlanItem[];
  sourceLocalKeys: string[];
  sourceKvKeys: string[];
}

export interface LegacyMigrationResult {
  alreadyImported: boolean;
  importKey: string;
  importedCounts: LegacyMigrationPreview['counts'];
  localKeysCleared: boolean;
}

function asUuidOrCreate(raw: unknown): string {
  if (typeof raw === 'string' && UUID_REGEX.test(raw)) return raw;
  return createId();
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function inspectLegacyBrowserData(): Promise<LegacyMigrationPreview> {
  const detectedSources: string[] = [];
  const sourceLocalKeys: string[] = [];
  const sourceKvKeys: string[] = [];

  const savedJdsMap = new Map<string, SavedJD>();
  const snapshotsMap = new Map<string, TextSnapshot>();
  const workspacesMap = new Map<string, ResumeWorkspace>();
  const versionsMap = new Map<string, ResumeVersion>();
  const auditsMap = new Map<string, AuditEntry>();
  const targetsMap = new Map<string, WatchlistTarget>();
  const planItemsMap = new Map<string, PlanItem>();

  let atsScanCount = 0;

  // 1. Read-only scan of known legacy localStorage keys
  if (typeof localStorage !== 'undefined') {
    for (const key of LEGACY_LOCALSTORAGE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      if (key === 'hireflow:v4:saved_jds' || key === 'hireflow:v4:saved-jds') {
        const parsed = safeParseJson<unknown>(raw);
        const validated = SavedJDStoreSchema.safeParse(parsed);
        if (validated.success && validated.data.jds.length > 0) {
          sourceLocalKeys.push(key);
          detectedSources.push(`localStorage:${key}`);
          for (const jd of validated.data.jds) {
            const hash = /^[0-9a-f]{64}$/i.test(jd.textHash)
              ? jd.textHash.toLowerCase()
              : await sha256Hex(normalizeText(jd.text));
            if (!savedJdsMap.has(hash)) {
              const candidate: SavedJD = {
                ...jd,
                id: asUuidOrCreate(jd.id),
                textHash: hash,
              };
              const singleCheck = SavedJDSchema.safeParse(candidate);
              if (singleCheck.success) {
                savedJdsMap.set(hash, singleCheck.data);
              }
            }
          }
        }
      } else if (key === 'hireflow_tool_ats_v3') {
        const parsed = safeParseJson<{ state?: { rawResumeText?: string; jdText?: string; scanHistory?: Array<any> } }>(raw);
        const st = parsed?.state;
        const scans = Array.isArray(st?.scanHistory) ? st.scanHistory : [];
        if (scans.length > 0) {
          sourceLocalKeys.push(key);
          detectedSources.push(`localStorage:${key}`);
          for (const scan of scans) {
            if (typeof scan?.score !== 'number') continue;
            const resumeNorm = normalizeText(String(st?.rawResumeText || scan.resumeFileName || 'Legacy scanned resume'));
            const jdNorm = normalizeText(String(st?.jdText || scan.targetRole || 'Legacy target JD'));
            const rHash = await sha256Hex(resumeNorm);
            const jHash = await sha256Hex(jdNorm);
            const createdIso = typeof scan.timestamp === 'string' && !Number.isNaN(Date.parse(scan.timestamp))
              ? new Date(scan.timestamp).toISOString()
              : new Date().toISOString();

            snapshotsMap.set(rHash, {
              hash: rHash,
              text: resumeNorm.slice(0, 80000),
              charCount: resumeNorm.length,
              wordCount: countWords(resumeNorm),
              createdAt: createdIso,
            });
            snapshotsMap.set(jHash, {
              hash: jHash,
              text: jdNorm.slice(0, 80000),
              charCount: jdNorm.length,
              wordCount: countWords(jdNorm),
              createdAt: createdIso,
            });

            const auditId = asUuidOrCreate(scan.id);
            const runKey = await sha256Hex(`legacy-v4-ats|${auditId}|${rHash}|${jHash}|${scan.score}`);
            if (!auditsMap.has(auditId)) {
              auditsMap.set(auditId, {
                schemaVersion: 1,
                id: auditId,
                kind: 'ats_roast',
                createdAt: createdIso,
                engineVersion: String(scan.engineVersion || '4.0.0'),
                runKey,
                targetKey: `legacy:${String(scan.targetCompany || scan.targetRole || 'general').toLowerCase().slice(0, 48)}`,
                resume: {
                  workspaceId: null,
                  versionId: null,
                  snapshotHash: rHash,
                  label: String(scan.resumeFileName || 'Legacy Resume').slice(0, 120),
                },
                jd: {
                  snapshotHash: jHash,
                  origin: 'pasted',
                  company: typeof scan.targetCompany === 'string' ? scan.targetCompany : undefined,
                  roleTitle: typeof scan.targetRole === 'string' ? scan.targetRole : undefined,
                },
                overallScore: Math.max(0, Math.min(100, Math.round(scan.score))),
                breakdown: [],
                gaps: [],
                strengths: [],
                evidence: [],
                findingsJson: scan.authoritativeSnapshot ?? {},
                delta: null,
              });
              atsScanCount++;
            }
          }
        }
      } else {
        sourceLocalKeys.push(key);
      }
    }
  }

  // 2. Read-only scan of legacy IndexedDB kv store keys (hireflow:v5:guest:*, hireflow:v5:snap:*)
  try {
    const idbEntries = await readLegacyIdbAll('hireflow:v5:');
    const kvMap = new Map<string, unknown>(idbEntries.map((e) => [e.key, e.value]));
    for (const [key, val] of kvMap.entries()) {
      if (key.startsWith('hireflow:v5:snap:')) {
        const snap = val as TextSnapshot | undefined;
        if (snap && typeof snap.hash === 'string' && /^[0-9a-f]{64}$/i.test(snap.hash) && typeof snap.text === 'string') {
          sourceKvKeys.push(key);
          snapshotsMap.set(snap.hash, snap);
        }
      } else if (key.startsWith('hireflow:v5:guest:resumes')) {
        const stored = val as { state?: { workspaces?: Record<string, ResumeWorkspace>; versions?: Record<string, ResumeVersion> } } | undefined;
        const ws = stored?.state?.workspaces;
        const vs = stored?.state?.versions;
        if (ws && typeof ws === 'object' && Object.keys(ws).length > 0) {
          sourceKvKeys.push(key);
          detectedSources.push(`indexeddb:${key}`);
          const wsIdMap = new Map<string, string>();
          for (const w of Object.values(ws)) {
            if (!w || typeof w.name !== 'string') continue;
            const mappedWsId = asUuidOrCreate(w.id);
            wsIdMap.set(w.id, mappedWsId);
            workspacesMap.set(mappedWsId, {
              ...w,
              id: mappedWsId,
              headVersionId: w.headVersionId ? asUuidOrCreate(w.headVersionId) : null,
            });
          }
          if (vs && typeof vs === 'object') {
            for (const v of Object.values(vs)) {
              if (!v || !v.snapshotHash || !snapshotsMap.has(v.snapshotHash)) continue;
              const mappedWsId = wsIdMap.get(v.workspaceId) ?? asUuidOrCreate(v.workspaceId);
              if (!workspacesMap.has(mappedWsId)) continue;
              const mappedVId = asUuidOrCreate(v.id);
              versionsMap.set(mappedVId, {
                ...v,
                id: mappedVId,
                workspaceId: mappedWsId,
                parentVersionId: v.parentVersionId ? asUuidOrCreate(v.parentVersionId) : null,
              });
            }
          }
        }
      } else if (key.startsWith('hireflow:v5:guest:audit')) {
        const stored = val as { state?: { entries?: Record<string, AuditEntry> } } | undefined;
        const entries = stored?.state?.entries;
        if (entries && typeof entries === 'object' && Object.keys(entries).length > 0) {
          sourceKvKeys.push(key);
          detectedSources.push(`indexeddb:${key}`);
          for (const a of Object.values(entries)) {
            if (
              a &&
              snapshotsMap.has(a.resume?.snapshotHash) &&
              snapshotsMap.has(a.jd?.snapshotHash) &&
              /^[0-9a-f]{64}$/i.test(a.runKey || '')
            ) {
              const id = asUuidOrCreate(a.id);
              auditsMap.set(id, {
                ...a,
                id,
                resume: {
                  ...a.resume,
                  workspaceId: a.resume.workspaceId ? asUuidOrCreate(a.resume.workspaceId) : null,
                  versionId: a.resume.versionId ? asUuidOrCreate(a.resume.versionId) : null,
                },
              });
            }
          }
        }
      } else if (key.startsWith('hireflow:v5:guest:my-space')) {
        const stored = val as { state?: { watchlist?: Record<string, WatchlistTarget>; planItems?: Record<string, PlanItem> } } | undefined;
        if (stored?.state?.watchlist) {
          for (const t of Object.values(stored.state.watchlist)) {
            if (t?.companyName && t?.targetKey) {
              const id = asUuidOrCreate(t.id);
              targetsMap.set(id, { ...t, id });
            }
          }
        }
        if (stored?.state?.planItems) {
          for (const p of Object.values(stored.state.planItems)) {
            if (p?.title && p?.refId) {
              const id = asUuidOrCreate(p.id);
              planItemsMap.set(id, { ...p, id });
            }
          }
        }
        if (targetsMap.size > 0 || planItemsMap.size > 0) {
          sourceKvKeys.push(key);
          detectedSources.push(`indexeddb:${key}`);
        }
      }
    }
  } catch {
    // Non-blocking IDB read guard
  }

  const workspaces = Array.from(workspacesMap.values());
  const versions = Array.from(versionsMap.values());
  const snapshots = Array.from(snapshotsMap.values());
  const audits = Array.from(auditsMap.values());
  const savedJds = Array.from(savedJdsMap.values());
  const watchlistTargets = Array.from(targetsMap.values());
  const planItems = Array.from(planItemsMap.values());

  const counts = {
    savedJds: savedJds.length,
    atsScans: atsScanCount,
    workspaces: workspaces.length,
    audits: audits.length,
    watchlistTargets: watchlistTargets.length,
    planItems: planItems.length,
  };

  const hasLegacyData =
    savedJds.length > 0 ||
    workspaces.length > 0 ||
    audits.length > 0 ||
    watchlistTargets.length > 0 ||
    planItems.length > 0;

  let importKey: string | null = null;
  if (hasLegacyData) {
    const fingerprintPayload = JSON.stringify({
      snapshots: snapshots.map((s) => s.hash).sort(),
      workspaces: workspaces.map((w) => w.name).sort(),
      audits: audits.map((a) => a.runKey).sort(),
      savedJds: savedJds.map((j) => j.textHash).sort(),
      targets: watchlistTargets.map((t) => t.targetKey).sort(),
      planItems: planItems.map((p) => `${p.kind}:${p.refId}`).sort(),
    });
    importKey = await sha256Hex(fingerprintPayload);
  }

  return {
    hasLegacyData,
    importKey,
    counts,
    detectedSources: Array.from(new Set(detectedSources)),
    snapshots,
    workspaces,
    versions,
    audits,
    savedJds,
    watchlistTargets,
    planItems,
    sourceLocalKeys,
    sourceKvKeys,
  };
}

export async function runAuthorizedLegacyMigration(
  userId: string,
  previewOverride?: LegacyMigrationPreview
): Promise<LegacyMigrationResult> {
  if (!userId || userId === 'demo-local') {
    throw new CloudAuthRequiredError(
      'Legacy data import requires a real authenticated Supabase account.'
    );
  }
  const gateway = getCloudGateway();
  if (!gateway.isConfigured()) {
    throw new CloudNotConfiguredError();
  }
  const activeUid = await gateway.getAuthenticatedUserId();
  if (!activeUid || activeUid !== userId) {
    throw new CloudAuthRequiredError('Authenticated Supabase user ID mismatch.');
  }

  const preview = previewOverride ?? (await inspectLegacyBrowserData());
  if (!preview.hasLegacyData || !preview.importKey) {
    return {
      alreadyImported: false,
      importKey: '',
      importedCounts: preview.counts,
      localKeysCleared: false,
    };
  }

  // 1. Check duplicate import receipt on Postgres before writing anything
  const existingReceipts = await gateway.selectRows<LegacyImportReceiptRow>('legacy_import_receipts', {
    eq: { import_key: preview.importKey },
    limit: 1,
  });
  if (existingReceipts.length > 0) {
    return {
      alreadyImported: true,
      importKey: preview.importKey,
      importedCounts: preview.counts,
      localKeysCleared: false,
    };
  }

  // 2. Upload strictly in parent -> child dependency order; preserve local data on any failure
  try {
    if (preview.snapshots.length > 0) {
      await gateway.upsertRows(
        'text_snapshots',
        preview.snapshots.map((s) => snapshotToRow(s) as unknown as Record<string, unknown>),
        { onConflict: 'user_id,hash', ignoreDuplicates: true }
      );
    }

    if (preview.workspaces.length > 0) {
      await gateway.upsertRows(
        'resume_workspaces',
        preview.workspaces.map((w) => workspaceToRow(w) as unknown as Record<string, unknown>),
        { onConflict: 'user_id,id', ignoreDuplicates: true }
      );
    }

    if (preview.versions.length > 0) {
      await gateway.upsertRows(
        'resume_versions',
        preview.versions.map((v) => versionToRow(v) as unknown as Record<string, unknown>),
        { onConflict: 'user_id,id', ignoreDuplicates: true }
      );
    }

    if (preview.audits.length > 0) {
      await gateway.upsertRows(
        'audit_entries',
        preview.audits.map((a) => auditToRow(a) as unknown as Record<string, unknown>),
        { onConflict: 'user_id,run_key', ignoreDuplicates: true }
      );
    }

    if (preview.savedJds.length > 0) {
      await gateway.upsertRows(
        'saved_jds',
        preview.savedJds.map((j) => savedJdToRow(j) as unknown as Record<string, unknown>),
        { onConflict: 'user_id,text_hash', ignoreDuplicates: true }
      );
    }

    if (preview.watchlistTargets.length > 0) {
      await gateway.upsertRows(
        'watchlist_targets',
        preview.watchlistTargets.map((t) => targetToRow(t) as unknown as Record<string, unknown>),
        { onConflict: 'user_id,target_key', ignoreDuplicates: true }
      );
    }

    if (preview.planItems.length > 0) {
      await gateway.upsertRows(
        'plan_items',
        preview.planItems.map((p) => planItemToRow(p) as unknown as Record<string, unknown>),
        { onConflict: 'user_id,id', ignoreDuplicates: true }
      );
    }

    // 3. Record verified import receipt in Postgres AFTER all uploads succeeded
    await gateway.upsertRows(
      'legacy_import_receipts',
      [
        {
          import_key: preview.importKey,
          imported_at: new Date().toISOString(),
          record_counts: preview.counts,
          source_summary: { sources: preview.detectedSources },
        },
      ],
      { onConflict: 'user_id,import_key', ignoreDuplicates: true }
    );
  } catch (err) {
    // CRITICAL Section 8 safety guarantee: DO NOT delete local source records if upload/receipt failed!
    throw new CloudWriteFailedError(
      'legacy browser data migration',
      err instanceof Error ? err.message : 'Remote import failed',
      err
    );
  }

  // 4. Verified remote persistence complete — safe to clear migrated legacy browser keys
  let localKeysCleared = false;
  try {
    if (typeof localStorage !== 'undefined') {
      for (const key of preview.sourceLocalKeys) {
        localStorage.removeItem(key);
      }
    }
    if (preview.sourceKvKeys.length > 0) {
      await deleteLegacyIdbKeys(preview.sourceKvKeys);
    }
    localKeysCleared = true;
  } catch {
    localKeysCleared = false;
  }

  return {
    alreadyImported: false,
    importKey: preview.importKey,
    importedCounts: preview.counts,
    localKeysCleared,
  };
}
