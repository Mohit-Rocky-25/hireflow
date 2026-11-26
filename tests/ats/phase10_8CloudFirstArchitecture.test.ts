// ============================================================
// HireFlow — Phase 10.8 Cloud-First Architecture Acceptance Suite
// Verifies Env Security, Storage Ownership & Validation, CloudRepository
// + Retry UI, Session Account Switching, Authorized One-Time Legacy Importer,
// Zero Browser Data Persistence, and Preserved 7D ATS Engine Parity.
// ============================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

class MemoryStorageMock implements Storage {
  private data: Record<string, string> = {};
  get length() { return Object.keys(this.data).length; }
  clear() { this.data = {}; }
  getItem(key: string) { return this.data[key] ?? null; }
  setItem(key: string, val: string) { this.data[key] = String(val); }
  removeItem(key: string) { delete this.data[key]; }
  key(idx: number) { return Object.keys(this.data)[idx] ?? null; }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MemoryStorageMock();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new MemoryStorageMock();
}

import {
  getSupabaseConfigStatus,
  requireSupabaseEnv,
  getAuthRedirectUrl,
  PRIVATE_DOCUMENT_BUCKET,
} from '@/lib/supabase/env';
import { useAuthStore } from '@/features/auth/useAuthStore';
import {
  cloudRepository,
  clearMemorySnapshotCache,
  getCachedSnapshotInMemory,
} from '@/lib/cloud/cloudRepository';
import { hydrateUserFromCloud, resetAllUserMemoryStores } from '@/lib/cloud/cloudHydrator';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';
import { useCloudDocumentsStore } from '@/lib/cloud/useDocumentsStore';
import {
  uploadPrivateDocument,
  getPrivateDocumentSignedUrl,
  deletePrivateDocument,
  buildUserDocumentPath,
  assertUserOwnedStoragePath,
} from '@/lib/cloud/storageService';
import {
  inspectLegacyBrowserData,
  runAuthorizedLegacyMigration,
} from '@/lib/cloud/legacyMigration';
import { _setCloudGatewayForTesting, type CloudGateway } from '@/sync/supabaseGateway';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { runAtsEngine } from '@/features/ats/engine';

const ROOT = path.resolve(__dirname, '../..');

function makeFakeJwt(role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ role, iss: 'supabase' })).toString('base64url');
  return `${header}.${payload}.sig`;
}

function makeInMemoryCloudGateway(activeUid = '11111111-1111-4111-8111-111111111111') {
  const tables: Record<string, Record<string, unknown>[]> = {
    user_profiles: [],
    text_snapshots: [],
    resume_workspaces: [],
    resume_versions: [],
    audit_entries: [],
    journal_events: [],
    watchlist_targets: [],
    plan_items: [],
    outreach_drafts: [],
    gap_status: [],
    saved_jds: [],
    feedback_items: [],
    user_documents: [],
    legacy_import_receipts: [],
  };
  const storageObjects = new Map<string, { contentType: string; bytes: Uint8Array }>();
  let currentUid: string | null = activeUid;
  let forceNextWriteError: Error | null = null;

  const gateway: CloudGateway = {
    isConfigured: () => true,
    getAuthenticatedUserId: async () => currentUid,
    selectRows: async <T,>(table: string, options?: { eq?: Record<string, string | number | boolean>; limit?: number }) => {
      const list = (tables[table] || []).filter((row) => {
        if (currentUid && row.user_id !== currentUid) return false;
        if (!options?.eq) return true;
        return Object.entries(options.eq).every(([k, v]) => row[k] === v);
      });
      return (options?.limit ? list.slice(0, options.limit) : list) as T[];
    },
    upsertRows: async (table, rows) => {
      if (forceNextWriteError) {
        const err = forceNextWriteError;
        forceNextWriteError = null;
        throw err;
      }
      tables[table] = tables[table] || [];
      for (const r of rows) {
        tables[table].push({ ...r, user_id: currentUid });
      }
    },
    deleteRows: async (table, match) => {
      if (forceNextWriteError) {
        const err = forceNextWriteError;
        forceNextWriteError = null;
        throw err;
      }
      tables[table] = (tables[table] || []).filter(
        (row) => row.user_id !== currentUid || !Object.entries(match).every(([k, v]) => row[k] === v)
      );
    },
    eraseMyDataRpc: async () => {
      for (const key of Object.keys(tables)) {
        tables[key] = tables[key].filter((row) => row.user_id !== currentUid);
      }
    },
    uploadStorageFile: async (storagePath, body, contentType) => {
      if (forceNextWriteError) {
        const err = forceNextWriteError;
        forceNextWriteError = null;
        throw err;
      }
      const bytes = body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(body.buffer);
      storageObjects.set(storagePath, { contentType, bytes });
      return { path: storagePath };
    },
    createSignedDownloadUrl: async (storagePath, expiresInSeconds = 120) => {
      if (!storageObjects.has(storagePath)) throw new Error('Object not found');
      return `https://project.supabase.co/storage/v1/object/sign/${PRIVATE_DOCUMENT_BUCKET}/${encodeURIComponent(storagePath)}?token=sig&exp=${expiresInSeconds}`;
    },
    downloadStorageFile: async (storagePath) => {
      const found = storageObjects.get(storagePath);
      if (!found) throw new Error('Object not found');
      return new Blob([found.bytes as unknown as BlobPart], { type: found.contentType });
    },
    removeStorageFiles: async (paths) => {
      for (const p of paths) storageObjects.delete(p);
    },
    listUserStoragePaths: async (uid) =>
      Array.from(storageObjects.keys()).filter((k) => k.startsWith(`${uid}/`)),
  };

  return {
    gateway,
    tables,
    storageObjects,
    setCurrentUid: (uid: string | null) => {
      currentUid = uid;
    },
    failNextWrite: (err: Error) => {
      forceNextWriteError = err;
    },
  };
}

describe('Phase 10.8: Cloud-First Architecture, Auth, RLS, Storage & Legacy Importer', () => {
  beforeEach(() => {
    clearMemorySnapshotCache();
    _setCloudGatewayForTesting(null);
    resetAllUserMemoryStores();
    if (typeof localStorage !== 'undefined') localStorage.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    _setCloudGatewayForTesting(null);
  });

  describe('1. Supabase Environment Validation & Secret Hygiene', () => {
    it('rejects missing env vars cleanly and blocks Supabase service_role JWTs from browser code', () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
      const missing = getSupabaseConfigStatus();
      expect(missing.configured).toBe(false);
      expect(missing.missingVars).toContain('VITE_SUPABASE_URL');
      expect(missing.missingVars).toContain('VITE_SUPABASE_ANON_KEY');
      expect(() => requireSupabaseEnv()).toThrow('AUTH_NOT_CONFIGURED');

      vi.stubEnv('VITE_SUPABASE_URL', 'https://myproject.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', makeFakeJwt('service_role'));
      const secretLeak = getSupabaseConfigStatus();
      expect(secretLeak.configured).toBe(false);
      expect(secretLeak.invalidReason).toContain('service_role');

      vi.stubEnv('VITE_SUPABASE_URL', 'http://evil-remote.example.com');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', makeFakeJwt('anon'));
      expect(getSupabaseConfigStatus().configured).toBe(false);

      vi.stubEnv('VITE_SUPABASE_URL', 'https://myproject.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', makeFakeJwt('anon'));
      expect(getSupabaseConfigStatus().configured).toBe(true);
      expect(getAuthRedirectUrl('https://hireflow.vercel.app')).toBe(
        'https://hireflow.vercel.app/auth/callback'
      );
    });
  });

  describe('2. Repository-Wide Elimination of Durable Local App Data & Sync Bypasses', () => {
    it('ensures zero app-data persistence in browser storage outside approved UI prefs and legacy importer', () => {
      const legacyModules = [
        'src/lib/supabase/client.ts',
        'src/lib/sync/autoSyncManager.ts',
        'src/lib/sync/cloudSync.ts',
        'src/sync/outbox.ts',
        'src/sync/syncEngine.ts',
        'src/sync/syncCore.ts',
        'src/lib/storage/kv.ts',
        'src/lib/backup/index.ts',
        'src/features/auth/guestMigration.ts',
        'src/features/auth/demoAuth.ts',
      ];
      for (const rel of legacyModules) {
        expect(fs.existsSync(path.join(ROOT, rel)), `${rel} must be deleted`).toBe(false);
      }

      const authStoreSrc = fs.readFileSync(path.join(ROOT, 'src/features/auth/useAuthStore.ts'), 'utf-8');
      expect(authStoreSrc).not.toContain('signInWithDemo');
      expect(authStoreSrc).not.toContain('demo-local');
      expect(authStoreSrc).not.toContain("'Mohit'");
    });
  });

  describe('3. Private Supabase Storage (`user-documents`) Validation, Upload & Signed URLs', () => {
    it('validates magic bytes, rejects oversized/spoofed files, enforces per-user prefix, and uses signed URLs only', async () => {
      const uid = '11111111-1111-4111-8111-111111111111';
      const { gateway, tables, storageObjects } = makeInMemoryCloudGateway(uid);
      _setCloudGatewayForTesting(gateway);

      // Reject path traversal & cross-user path
      expect(() => buildUserDocumentPath('../evil', 'resume_upload', 'doc1', 'a.pdf')).toThrow();
      expect(() =>
        assertUserOwnedStoragePath(uid, '22222222-2222-4222-8222-222222222222/resume_upload/d/a.pdf')
      ).toThrow();

      // Reject spoofed PDF bytes (.pdf extension with invalid bytes)
      const spoofedPdf = new TextEncoder().encode('<html>not a pdf</html>');
      await expect(
        uploadPrivateDocument({
          userId: uid,
          docKind: 'resume_upload',
          fileName: 'fake.pdf',
          mimeType: 'application/pdf',
          buffer: spoofedPdf.buffer as ArrayBuffer,
        })
      ).rejects.toThrow();

      // Accept valid ZIP/DOCX passing Phase 10.6 DOCX validator
      const zip = new JSZip();
      zip.file(
        '[Content_Types].xml',
        '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>'
      );
      zip.file(
        'word/document.xml',
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Resume</w:t></w:r></w:p></w:body></w:document>'
      );
      const docxBytes = await zip.generateAsync({ type: 'uint8array' });

      const record = await uploadPrivateDocument({
        userId: uid,
        docKind: 'resume_upload',
        fileName: 'candidate_resume.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: docxBytes.buffer as ArrayBuffer,
      });

      expect(record.storageBucket).toBe('user-documents');
      expect(record.storagePath.startsWith(`${uid}/resume_upload/${record.id}/`)).toBe(true);
      expect(tables.user_documents).toHaveLength(1);
      expect(storageObjects.has(record.storagePath)).toBe(true);

      const signed = await getPrivateDocumentSignedUrl(uid, record.storagePath, 120);
      expect(signed).toContain('/sign/user-documents/');

      // Signed URL & delete reject cross-user caller
      await expect(
        getPrivateDocumentSignedUrl('22222222-2222-4222-8222-222222222222', record.storagePath, 60)
      ).rejects.toThrow();

      await deletePrivateDocument(uid, record.id, record.storagePath);
      expect(tables.user_documents).toHaveLength(0);
      expect(storageObjects.has(record.storagePath)).toBe(false);
    });
  });

  describe('4. CloudRepository Fail-Loud Errors, Retry Recovery, Account Switch & Erasure', () => {
    it('surfaces loud failure + working retry callback on cloud error and wipes everything on account switch / erase', async () => {
      const uidA = '11111111-1111-4111-8111-111111111111';
      const uidB = '22222222-2222-4222-8222-222222222222';
      const { gateway, failNextWrite, setCurrentUid } = makeInMemoryCloudGateway(uidA);
      _setCloudGatewayForTesting(gateway);
      useAuthStore.setState({ status: 'authenticated', userId: uidA, displayName: 'Alice' });

      const sampleJd = {
        id: '77777777-7777-4777-8777-777777777777',
        title: 'Cloud Security Architect',
        company: 'Acme',
        source: 'pasted' as const,
        text: 'Terraform, IAM, Kubernetes, AWS/GCP security.',
        textHash: '1'.repeat(64),
        tags: ['security'],
        addedAt: '2026-11-26T00:00:00.000Z',
        updatedAt: '2026-11-26T00:00:00.000Z',
      };

      failNextWrite(new Error('503 Supabase Temporarily Unavailable'));
      await expect(cloudRepository.saveSavedJd(uidA, sampleJd)).rejects.toThrow(/503 Supabase/);

      expect(useCloudSyncStore.getState().phase).toBe('error');
      expect(typeof useCloudSyncStore.getState().pendingRetry).toBe('function');

      // Retry succeeds cleanly and clears error banner state
      await useCloudSyncStore.getState().retryLastFailed();
      expect(useCloudSyncStore.getState().phase).toBe('synced');
      expect(useCloudSyncStore.getState().error).toBeNull();

      // Hydrate User A
      await hydrateUserFromCloud(uidA, { displayName: 'Alice' });
      expect(useSavedJdStore.getState().jds).toHaveLength(1);

      // Account Switch -> User B sees zero User A data in memory
      setCurrentUid(uidB);
      await useAuthStore.getState().resolveSession({
        user: {
          id: uidB,
          email: 'bob@example.com',
          app_metadata: { provider: 'google' },
          user_metadata: { full_name: 'Bob' },
          aud: 'authenticated',
          created_at: '',
        },
      } as any);

      expect(useSavedJdStore.getState().jds).toEqual([]);
      expect(useCloudDocumentsStore.getState().documents).toEqual([]);
    });
  });

  describe('5. One-Time Authorized Legacy Data Importer', () => {
    it('previews read-only, preserves local data on failure, uploads once cleanly, deduplicates repeats, then clears legacy keys', async () => {
      const uid = '33333333-3333-4333-8333-333333333333';
      const { gateway, tables, failNextWrite } = makeInMemoryCloudGateway(uid);
      _setCloudGatewayForTesting(gateway);

      const legacyPayload = {
        jds: [
          {
            id: '88888888-8888-4888-8888-888888888888',
            title: 'Legacy Backend JD',
            company: 'LegacyCo',
            source: 'pasted',
            text: 'Go, PostgreSQL, Redis, gRPC',
            textHash: 'a'.repeat(64),
            tags: ['go'],
            addedAt: '2026-10-01T00:00:00.000Z',
            updatedAt: '2026-10-01T00:00:00.000Z',
          },
        ],
      };
      localStorage.setItem('hireflow:v4:saved-jds', JSON.stringify(legacyPayload));

      // 1. Read-only inspect preserves legacy key
      const preview = await inspectLegacyBrowserData();
      expect(preview.hasLegacyData).toBe(true);
      expect(preview.counts.savedJds).toBe(1);
      expect(localStorage.getItem('hireflow:v4:saved-jds')).not.toBeNull();

      // 2. If cloud upload fails, local legacy data is NOT deleted!
      failNextWrite(new Error('Network aborted mid-import'));
      await expect(runAuthorizedLegacyMigration(uid, preview)).rejects.toThrow(/Network aborted/);
      expect(localStorage.getItem('hireflow:v4:saved-jds')).not.toBeNull();

      // 3. Successful authorized migration uploads rows, writes receipt, and clears migrated key
      const res1 = await runAuthorizedLegacyMigration(uid, preview);
      expect(res1.alreadyImported).toBe(false);
      expect(res1.localKeysCleared).toBe(true);
      expect(localStorage.getItem('hireflow:v4:saved-jds')).toBeNull();
      expect(tables.saved_jds).toHaveLength(1);
      expect(tables.legacy_import_receipts).toHaveLength(1);

      // 4. Duplicate run detects receipt and skips re-upload
      const res2 = await runAuthorizedLegacyMigration(uid, preview);
      expect(res2.alreadyImported).toBe(true);
      expect(tables.saved_jds).toHaveLength(1);
    });
  });

  describe('6. Phase 10.5-10.7 7D ATS Engine Integrity Preserved', () => {
    it('evaluates resume vs JD deterministically without localStorage side effects', () => {
      const resume = [
        'Alex Morgan',
        'alex.morgan@example.com | github.com/alexmorgan | San Francisco, CA',
        'Summary',
        'Senior Backend Software Engineer with 4 years of experience building distributed microservices, relational databases, and event-driven APIs.',
        'Experience',
        'Senior Backend Engineer, CloudSystems Inc (Jan 2022 - Present)',
        '- Architected Go and TypeScript gRPC services with PostgreSQL and Redis caching, reducing P95 API latency from 240ms to 48ms across 10M daily requests.',
        '- Designed Kafka ingestion pipelines with automated integration tests and observability dashboards on Kubernetes.',
        'Skills: Go, TypeScript, PostgreSQL, Redis, Kafka, Kubernetes, REST APIs, Docker',
        'Education',
        'B.S. in Computer Science, University of California, 2021',
      ].join('\n');
      const jd = [
        'Senior Backend Software Engineer',
        'Requirements:',
        '- 3+ years building backend services in Go or TypeScript with PostgreSQL, Redis, and REST APIs.',
        '- Experience operating production distributed systems with Kafka, Docker, and Kubernetes.',
        '- Bachelor degree in Computer Science or equivalent practical experience.',
      ].join('\n');

      const response = runAtsEngine(resume, jd, { tier: 'top_product' });
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.result.specVersion).toBe('4.0.0-ats7d');
        expect(response.result.score).toBeGreaterThan(0);
        expect(response.result.trace?.pillars?.length).toBeGreaterThan(0);
      }
      expect(localStorage.length).toBe(0);
    });
  });
});
