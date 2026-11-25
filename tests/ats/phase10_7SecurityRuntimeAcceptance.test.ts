// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { PGlite } from '@electric-sql/pglite';

const mockWindow = vi.hoisted(() => {
  class StorageMock implements Storage {
    private store: Record<string, string> = {};
    get length() {
      return Object.keys(this.store).length;
    }
    clear() {
      this.store = {};
    }
    getItem(key: string) {
      return this.store[key] ?? null;
    }
    setItem(key: string, value: string) {
      this.store[key] = String(value);
    }
    removeItem(key: string) {
      delete this.store[key];
    }
    key(index: number) {
      return Object.keys(this.store)[index] ?? null;
    }
  }

  if (typeof globalThis.localStorage === 'undefined') {
    (globalThis as any).localStorage = new StorageMock();
  }
  if (typeof globalThis.sessionStorage === 'undefined') {
    (globalThis as any).sessionStorage = new StorageMock();
  }
  if (typeof globalThis.window === 'undefined') {
    const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();
    (globalThis as any).window = {
      location: { pathname: '/', origin: 'http://localhost:4175' },
      localStorage: globalThis.localStorage,
      sessionStorage: globalThis.sessionStorage,
      addEventListener(type: string, cb: EventListenerOrEventListenerObject) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(cb);
      },
      removeEventListener(type: string, cb: EventListenerOrEventListenerObject) {
        listeners.get(type)?.delete(cb);
      },
      dispatchEvent(event: Event) {
        const set = listeners.get(event.type);
        if (set) {
          for (const cb of set) {
            if (typeof cb === 'function') cb(event);
            else cb.handleEvent(event);
          }
        }
        return true;
      },
    };
  }
  return (globalThis as any).window;
});

import viteConfig, { getProductionCspPolicy } from '../../vite.config';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAtsToolStore } from '@/store/tools/atsStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import {
  clearMemorySnapshotCache,
  getCachedSnapshotInMemory,
} from '@/lib/cloud/cloudRepository';
import { isAuthConfigured, getSupabase } from '@/features/auth/supabaseClient';
import { snapshotToRow } from '@/sync/mappers';

const ROOT = path.resolve(__dirname, '../..');

function createSwSandbox(swRelativePath: string, preseedRuntime: Record<string, any> = {}) {
  const swSource = fs.readFileSync(path.join(ROOT, swRelativePath), 'utf-8');
  const cacheStores = new Map<string, Map<string, any>>();
  const listeners: Record<string, Array<(event: any) => void>> = {};

  const versionMatch = swSource.match(/const\s+CACHE_VERSION\s*=\s*'([^']+)'/);
  const cacheVersion = versionMatch ? versionMatch[1] : '__HIREFLOW_SW_CACHE_VERSION__';
  const staticCacheName = `${cacheVersion}-shell`;
  const runtimeCacheName = `${cacheVersion}-runtime`;

  if (Object.keys(preseedRuntime).length > 0) {
    cacheStores.set(runtimeCacheName, new Map(Object.entries(preseedRuntime)));
  }

  const cachesMock = {
    open: vi.fn(async (name: string) => {
      if (!cacheStores.has(name)) cacheStores.set(name, new Map());
      const store = cacheStores.get(name)!;
      return {
        addAll: vi.fn(async (assets: string[]) => {
          for (const asset of assets) store.set(asset, { cachedFrom: 'addAll', asset });
        }),
        put: vi.fn(async (req: any, res: any) => {
          const key = typeof req === 'string' ? req : req.url;
          store.set(key, res);
        }),
      };
    }),
    keys: vi.fn(async () => Array.from(cacheStores.keys())),
    delete: vi.fn(async (name: string) => cacheStores.delete(name)),
    match: vi.fn(async (req: any) => {
      const key = typeof req === 'string' ? req : req.url;
      for (const store of cacheStores.values()) {
        if (store.has(key)) return store.get(key);
      }
      return undefined;
    }),
  };

  const fetchResponses = new Map<string, { status?: number; type?: string; headers?: Record<string, string>; body?: string }>();

  const fetchMock = vi.fn(async (req: any) => {
    const reqUrl = typeof req === 'string' ? req : req.url;
    const spec = fetchResponses.get(reqUrl) || {};
    const headersMap = new Map<string, string>();
    headersMap.set('content-type', 'application/javascript');
    for (const [k, v] of Object.entries(spec.headers || {})) {
      headersMap.set(k.toLowerCase(), v);
    }

    return {
      status: spec.status ?? 200,
      type: spec.type ?? 'basic',
      body: spec.body ?? '/* network-fresh */',
      headers: {
        get: (k: string) => headersMap.get(k.toLowerCase()) ?? null,
        has: (k: string) => headersMap.has(k.toLowerCase()),
      },
      clone() {
        return this;
      },
    };
  });

  const selfMock: any = {
    location: { origin: 'https://hireflow.app' },
    clients: { claim: vi.fn(async () => {}) },
    skipWaiting: vi.fn(),
    addEventListener: (type: string, cb: (event: any) => void) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(cb);
    },
  };

  vm.runInNewContext(swSource, {
    self: selfMock,
    caches: cachesMock,
    fetch: fetchMock,
    URL,
    Response: class MockResponse {
      constructor(public body: string, public init?: any) {}
    },
    Promise,
  });

  const dispatchFetch = async (
    url: string,
    opts: {
      method?: string;
      mode?: string;
      credentials?: RequestCredentials;
      headers?: Record<string, string>;
    } = {}
  ) => {
    let respondedWith: Promise<any> | null = null;
    const headerMap = new Map(Object.entries(opts.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    const event = {
      request: {
        url,
        method: opts.method || 'GET',
        mode: opts.mode || 'cors',
        credentials: opts.credentials ?? 'same-origin',
        headers: {
          has: (name: string) => headerMap.has(name.toLowerCase()),
          get: (name: string) => headerMap.get(name.toLowerCase()) ?? null,
        },
      },
      respondWith: (p: Promise<any>) => {
        respondedWith = p;
      },
    };
    for (const fn of listeners.fetch || []) {
      fn(event);
    }
    const resolved = respondedWith ? await respondedWith : undefined;
    // Drain async caches.open(...).then(cache => cache.put(...)) microtasks
    await new Promise((r) => setTimeout(r, 10));
    return { responded: Boolean(respondedWith), response: resolved };
  };

  return {
    swSource,
    cacheVersion,
    staticCacheName,
    runtimeCacheName,
    cacheStores,
    fetchResponses,
    fetchMock,
    listeners,
    dispatchFetch,
  };
}

describe('Phase 10.7 Workstream C: Security Runtime & Acceptance Verification', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    clearMemorySnapshotCache();
    useStore.setState({
      currentUser: null,
      isAuthenticated: false,
      currentCompanyId: null,
      users: [],
      _initialized: false,
    });
    useAuthStore.setState({
      status: 'guest',
      userId: null,
      email: null,
      displayName: null,
      avatarUrl: null,
      isDemo: false,
      demoStorage: null,
      error: null,
    });
    useAtsToolStore.getState().resetAtsTool();
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
    useMySpaceStore.getState().resetAll();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('C1: Production Build CSP & Deployment Headers Parity', () => {
    it('enforces single canonical CSP meta tag and external /theme-init.js in dist/index.html', () => {
      const distHtmlPath = path.join(ROOT, 'dist', 'index.html');
      expect(fs.existsSync(distHtmlPath)).toBe(true);
      const html = fs.readFileSync(distHtmlPath, 'utf-8');

      const cspTags = [...html.matchAll(/<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/gi)];
      expect(cspTags).toHaveLength(1);
      expect(cspTags[0][0]).toContain(getProductionCspPolicy());
      expect(html).toContain('<script src="/theme-init.js"></script>');
      expect(html).not.toMatch(/<script(?![^>]*src=)[^>]*>/i);
      expect(html).not.toMatch(/http:\/\//i);

      const previewCsp = String((viteConfig as any).preview?.headers?.['Content-Security-Policy'] || '');
      expect(previewCsp).toBe(getProductionCspPolicy({ includeFrameAncestors: true }));
    });

    it('aligns public/_headers and dist/_headers CSP with canonical production Supabase + worker-src policy', () => {
      const normalizeDirectives = (policy: string) =>
        policy
          .split(';')
          .map((d) => d.trim().replace(/\s+/g, ' '))
          .filter(Boolean)
          .sort();

      const expectedDirectives = normalizeDirectives(getProductionCspPolicy({ includeFrameAncestors: true }));
      for (const rel of ['public/_headers', 'dist/_headers']) {
        const content = fs.readFileSync(path.join(ROOT, rel), 'utf-8');
        const cspLine = content
          .split(/\r?\n/)
          .find((l) => l.trim().toLowerCase().startsWith('content-security-policy:'));
        expect(cspLine, `${rel} must define Content-Security-Policy`).toBeDefined();
        expect(cspLine).not.toContain('generativelanguage.googleapis.com');
        expect(cspLine).toContain('https://*.supabase.co');
        expect(cspLine).toContain('wss://*.supabase.co');
        expect(cspLine).toContain("worker-src 'self' blob:");
        expect(normalizeDirectives(cspLine!.replace(/^[^:]+:\s*/, '').trim())).toEqual(expectedDirectives);
      }
    });
  });

  describe('C3: Service Worker (public/sw.js & dist/sw.js) Credentials, Cookie & Vary Isolation', () => {
    it('stamps dist/sw.js with build hash and replaces placeholder cleanly', () => {
      const distSw = fs.readFileSync(path.join(ROOT, 'dist', 'sw.js'), 'utf-8');
      expect(distSw).not.toContain('__HIREFLOW_SW_CACHE_VERSION__');
      expect(distSw).toMatch(/const\s+CACHE_VERSION\s*=\s*'hireflow-v5-[a-f0-9]{12}';/);
    });

    it.each(['public/sw.js', 'dist/sw.js'])(
      '%s never intercepts/caches requests with credentials: "include" or serves stale uncredentialed cache',
      async (swFile) => {
        const preCachedAssetUrl = 'https://hireflow.app/assets/shared-user-chunk.js';
        const freshCredentialedUrl = 'https://hireflow.app/assets/credentialed-profile.js';
        const staticExtUrl = 'https://hireflow.app/icons/private-avatar.svg';

        const sb = createSwSandbox(swFile, {
          [preCachedAssetUrl]: { cachedFrom: 'previous-guest', body: 'stale-uncredentialed' },
        });
        sb.fetchResponses.set(preCachedAssetUrl, { body: 'fresh-credentialed' });

        // 1. Existing cached uncredentialed asset MUST NOT be served when request uses credentials: 'include'
        const preCachedRes = await sb.dispatchFetch(preCachedAssetUrl, { credentials: 'include' });
        if (preCachedRes.responded) {
          expect(preCachedRes.response?.cachedFrom).not.toBe('previous-guest');
        }

        // 2. Fresh credentialed static-extension / asset requests MUST NOT populate RUNTIME_CACHE
        await sb.dispatchFetch(freshCredentialedUrl, { credentials: 'include' });
        await sb.dispatchFetch(staticExtUrl, { credentials: 'include' });

        const runtimeStore = sb.cacheStores.get(sb.runtimeCacheName);
        expect(runtimeStore?.has(freshCredentialedUrl) ?? false).toBe(false);
        expect(runtimeStore?.has(staticExtUrl) ?? false).toBe(false);
        expect(runtimeStore?.get(preCachedAssetUrl)?.body).not.toBe('fresh-credentialed');
      }
    );

    it.each(['public/sw.js', 'dist/sw.js'])(
      '%s never caches responses carrying Set-Cookie or Vary: Cookie / Vary: * in RUNTIME_CACHE',
      async (swFile) => {
        const sb = createSwSandbox(swFile);

        const setCookieUrl = 'https://hireflow.app/assets/session-bootstrap.js';
        const varyCookieUrl = 'https://hireflow.app/assets/personalized-theme.css';
        const varyMultiUrl = 'https://hireflow.app/assets/localized-strings.js';
        const varyStarUrl = 'https://hireflow.app/assets/dynamic-chunk.js';

        sb.fetchResponses.set(setCookieUrl, {
          headers: { 'content-type': 'application/javascript', 'set-cookie': 'hf_sid=secret; HttpOnly; Path=/' },
        });
        sb.fetchResponses.set(varyCookieUrl, {
          headers: { 'content-type': 'text/css', vary: 'Cookie' },
        });
        sb.fetchResponses.set(varyMultiUrl, {
          headers: { 'content-type': 'application/javascript', vary: 'Accept-Encoding, Cookie, Authorization' },
        });
        sb.fetchResponses.set(varyStarUrl, {
          headers: { 'content-type': 'application/javascript', vary: '*' },
        });

        await sb.dispatchFetch(setCookieUrl);
        await sb.dispatchFetch(varyCookieUrl);
        await sb.dispatchFetch(varyMultiUrl);
        await sb.dispatchFetch(varyStarUrl);

        const runtimeStore = sb.cacheStores.get(sb.runtimeCacheName);
        expect(runtimeStore?.has(setCookieUrl) ?? false).toBe(false);
        expect(runtimeStore?.has(varyCookieUrl) ?? false).toBe(false);
        expect(runtimeStore?.has(varyMultiUrl) ?? false).toBe(false);
        expect(runtimeStore?.has(varyStarUrl) ?? false).toBe(false);
      }
    );
  });

  describe('C4: Supabase Auth, RLS Policies & Client/Migration Audit', () => {
    it('enforces RLS, (select auth.uid()), least-privilege grants, and self-service erase_my_data() in 0001_candidate_os.sql', () => {
      const sql = fs.readFileSync(path.join(ROOT, 'supabase/migrations/0001_candidate_os.sql'), 'utf-8');
      const tables = [
        'text_snapshots',
        'resume_workspaces',
        'resume_versions',
        'audit_entries',
        'journal_events',
        'watchlist_targets',
        'plan_items',
        'outreach_drafts',
        'gap_status',
        'user_profiles',
      ];

      for (const table of tables) {
        expect(sql).toContain(`alter table public.${table} enable row level security;`);
        expect(sql).toContain(`delete from public.${table} where user_id = uid;`);
      }

      // Immutable tables: select + insert only, never update/delete grants or policies
      for (const imm of ['text_snapshots', 'audit_entries', 'journal_events']) {
        expect(sql).toContain(`create policy own_select on public.${imm} for select to authenticated using (user_id = (select auth.uid()));`);
        expect(sql).toContain(`create policy own_insert on public.${imm} for insert to authenticated with check (user_id = (select auth.uid()));`);
        expect(sql).not.toContain(`on public.${imm} for all`);
        expect(sql).not.toContain(`on public.${imm} for update`);
        expect(sql).not.toContain(`on public.${imm} for delete`);
      }

      expect(sql).toContain('revoke all on public.text_snapshots');
      expect(sql).toContain('grant select, insert on public.text_snapshots, public.audit_entries, public.journal_events to authenticated;');
      expect(sql).toContain("if uid is null then raise exception 'not authenticated'; end if;");
      expect(sql).toContain('revoke all on function public.erase_my_data() from public, anon;');
      expect(sql).toContain('grant execute on function public.erase_my_data() to authenticated;');
    });

    it('keeps PKCE Supabase client gated cleanly behind env config without insecure legacy stubs', () => {
      const clientSrc = fs.readFileSync(path.join(ROOT, 'src/features/auth/supabaseClient.ts'), 'utf-8');
      const envSrc = fs.readFileSync(path.join(ROOT, 'src/lib/supabase/env.ts'), 'utf-8');
      expect(clientSrc).toContain("flowType: 'pkce'");
      expect(envSrc).toContain('AUTH_NOT_CONFIGURED:');
      if (!isAuthConfigured) {
        expect(() => getSupabase()).toThrow('AUTH_NOT_CONFIGURED');
      }

      const gatewaySrc = fs.readFileSync(path.join(ROOT, 'src/sync/supabaseGateway.ts'), 'utf-8');
      expect(gatewaySrc).toContain("rpc('erase_my_data')");
    });

    it('supports mappers payload contract (without explicit user_id) via PGlite default auth.uid() or requires user_id', async () => {
      const savedWindow = (globalThis as any).window;
      delete (globalThis as any).window;
      try {
        const db = new PGlite();
        const uid = '11111111-1111-4111-8111-111111111111';
        await db.exec(`
          create role anon nologin; create role authenticated nologin;
          create schema auth;
          create table auth.users (id uuid primary key);
          create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
          grant usage on schema auth to anon, authenticated; grant usage on schema public to anon, authenticated;
          grant execute on function auth.uid() to anon, authenticated;
          insert into auth.users values ('${uid}');
        `);
        await db.exec(fs.readFileSync(path.join(ROOT, 'supabase/migrations/0001_candidate_os.sql'), 'utf-8'));

        const row = snapshotToRow({
          hash: 'a'.repeat(64),
          text: 'Resume text',
          charCount: 11,
          wordCount: 2,
          createdAt: '2026-11-26T00:00:00.000Z',
        });

        // Verify what happens when SupabaseTransport sends snapshotToRow() without user_id:
        await db.exec(`select set_config('request.jwt.claim.sub', '${uid}', false); set role authenticated;`);
        await expect(
          db.query(
            'insert into public.text_snapshots (hash, body, char_count, word_count, created_at) values ($1,$2,$3,$4,$5)',
            [row.hash, row.body, row.char_count, row.word_count, row.created_at]
          )
        ).resolves.toBeDefined();
      } finally {
        (globalThis as any).window = savedWindow ?? mockWindow;
      }
    }, 15_000);
  });

  describe('C5-C6: Cloud-First Storage Honesty, Zero Local DB Leaks & Logout Cleanup', () => {
    it('never claims localStorage or client storage are encrypted at rest and confirms zero unconfigured cloud bypasses', () => {
      expect(typeof isAuthConfigured).toBe('boolean');

      const files = [
        'src/pages/data/YourDataPage.tsx',
        'src/store/useStore.ts',
        'src/components/common/PrivacyDisclaimer.tsx',
        'src/pathways/pages/AboutDataPage.tsx',
      ];

      const falseEncryptionClaim = /\b(?:localStorage|IndexedDB|backups?|client(?:\s+browser)?\s+storage|device\s+storage)\s+(?:is|are)\s+encrypted\b|\bAES-256\b|\bencrypted\s+JSON\b|\bencrypted\s+at\s+rest\b/i;

      for (const rel of files) {
        const content = fs.readFileSync(path.join(ROOT, rel), 'utf-8');
        expect(content, `${rel} must not falsely claim client storage is encrypted`).not.toMatch(falseEncryptionClaim);
      }
    });

    it('purges memory snapshots and store state on signOut so a fresh session cannot read prior PII', async () => {
      useAuthStore.setState({ status: 'authenticated', userId: 'acct-logout-a', email: 'a@example.com' });
      const { entry } = await useAuditStore.getState().record({
        kind: 'ats_roast',
        engineVersion: '5.0.0',
        resume: { workspaceId: null, versionId: null, label: 'Private', rawText: 'PRIVATE_RESUME_PII_107 TypeScript Engineer' },
        jd: { rawText: 'PRIVATE_JD_107 Backend TypeScript Engineer', origin: 'pasted' },
        overallScore: 80,
        breakdown: [{ key: 'mustHaveCoverage', label: 'Must-Have Coverage', score: 80, weight: 0.3 }],
        gaps: [],
        strengths: ['TypeScript'],
        evidence: [],
        findings: {},
      });

      expect(getCachedSnapshotInMemory(entry.resume.snapshotHash)).not.toBeNull();
      expect(localStorage.getItem('hireflow_tool_ats_v3')).toBeNull();

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().status).toBe('guest');
      expect(useAuditStore.getState().entries).toEqual({});
      expect(getCachedSnapshotInMemory(entry.resume.snapshotHash)).toBeNull();
    });
  });
});
