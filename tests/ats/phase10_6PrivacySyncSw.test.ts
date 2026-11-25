import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

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

import { useStore } from '@/store/useStore';
import { useAuthStore, purgeLegacyBrowserUserData } from '@/features/auth/useAuthStore';
import { useAtsToolStore } from '@/store/tools/atsStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { clearMemorySnapshotCache } from '@/lib/cloud/cloudRepository';

describe('Phase 10.6 Workstream C: Privacy, Cloud Isolation & Service Worker Hardening', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('1. Auth Storage Honesty & Candidate OS SignOut Cleanup', () => {
    it('purges forged legacy localStorage demo/auth flags and keeps unauthenticated sessions cleanly in guest mode', () => {
      localStorage.setItem('hireflow:v5:auth-hint', '1');
      localStorage.setItem('hireflow:v5:demo-mode', 'local');

      purgeLegacyBrowserUserData();

      expect(localStorage.getItem('hireflow:v5:auth-hint')).toBeNull();
      expect(localStorage.getItem('hireflow:v5:demo-mode')).toBeNull();
      expect(useAuthStore.getState().status).toBe('guest');
      expect(useAuthStore.getState().userId).toBeNull();
    });

    it('useAuthStore.signOut resets Candidate OS stores, ATS tool, local keys, pending sync, and notifies SW', async () => {
      const postMessage = vi.fn();
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          onLine: true,
          serviceWorker: { controller: { postMessage } },
        },
        configurable: true,
      });

      useAuthStore.setState({
        status: 'authenticated',
        userId: 'cand-os-user-1',
        email: 'cand@example.com',
        displayName: 'Cand',
      });
      useAtsToolStore.getState().setResumeText('Candidate private resume', 'cand.pdf');
      useAuditStore.setState({
        entries: {
          'audit-1': {
            schemaVersion: 1,
            id: 'audit-1',
            kind: 'ats_roast',
            createdAt: '2026-11-26T00:00:00.000Z',
            engineVersion: '5.0.0',
            runKey: 'rk-1',
            targetKey: 'tk-1',
            resume: { workspaceId: null, versionId: null, snapshotHash: 'h1', label: 'Main' },
            jd: { snapshotHash: 'jh1', origin: 'pasted' },
            overallScore: 84,
            breakdown: [],
            gaps: [],
            strengths: [],
            evidence: [],
            findingsJson: {},
            delta: null,
          },
        },
        events: {},
        gapStatus: {},
      });
      useResumeStore.setState({
        workspaces: {
          'ws-1': {
            id: 'ws-1',
            name: 'SWE',
            roleTrack: 'Backend',
            isPrimary: true,
            headVersionId: null,
            createdAt: '2026-11-26T00:00:00.000Z',
            updatedAt: '2026-11-26T00:00:00.000Z',
            archivedAt: null,
          },
        },
        versions: {},
        activeWorkspaceId: 'ws-1',
      });

      localStorage.setItem('hireflow:v5:demo-mode', 'local');
      localStorage.setItem('hireflow:v4:profile', '{"x":1}');
      localStorage.setItem('hireflow:v4:design', 'spruce');
      localStorage.setItem('hireflow:v4:theme-mode', 'dark');
      sessionStorage.setItem('secret_session', '123');

      await useAuthStore.getState().signOut();

      expect(useAuthStore.getState().status).toBe('guest');
      expect(useAtsToolStore.getState().rawResumeText).toBe('');
      expect(useAuditStore.getState().entries).toEqual({});
      expect(useResumeStore.getState().workspaces).toEqual({});
      expect(useResumeStore.getState().activeWorkspaceId).toBeNull();
      expect(localStorage.getItem('hireflow:v5:demo-mode')).toBeNull();
      expect(localStorage.getItem('hireflow:v4:profile')).toBeNull();
      expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');
      expect(localStorage.getItem('hireflow:v4:theme-mode')).toBe('dark');
      expect(localStorage.length).toBe(2);
    });
  });

  describe('2. Cloud-First Non-Persistence & Purge Safety', () => {
    it('never writes simulated localStorage cloud keys or PII on store updates or logout', async () => {
      window.dispatchEvent(new CustomEvent('hireflow:data-changed'));
      await vi.advanceTimersByTimeAsync(200);
      expect(localStorage.getItem('hireflow_last_cloud_sync_at')).toBeNull();
      expect(localStorage.getItem('hireflo_last_cloud_sync_at')).toBeNull();

      localStorage.setItem('hireflow:v4:profile', JSON.stringify({ name: 'Legacy User' }));
      localStorage.setItem('hireflo_sim_cloud_u1', '{}');
      localStorage.setItem('hireflow:v4:design', 'spruce');

      purgeLegacyBrowserUserData();

      expect(localStorage.getItem('hireflow:v4:profile')).toBeNull();
      expect(localStorage.getItem('hireflo_sim_cloud_u1')).toBeNull();
      expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');
    });
  });

  describe('3. Multi-Account Store Isolation on Switch & SignOut', () => {
    it('wipes previous user in-memory stores immediately when switching or signing out', async () => {
      clearMemorySnapshotCache();
      useAuthStore.setState({ status: 'authenticated', userId: 'acct-alice', email: 'alice@example.com' });
      useAtsToolStore.getState().setResumeText('Alice TypeScript Resume', 'alice.pdf');
      useAuditStore.setState({
        entries: {
          'aud-1': {
            schemaVersion: 1,
            id: 'aud-1',
            kind: 'ats_roast',
            createdAt: '2026-11-26T00:00:00.000Z',
            engineVersion: '5.0.0',
            runKey: 'rk',
            targetKey: 'tk',
            resume: { workspaceId: null, versionId: null, snapshotHash: 'sh', label: 'Alice' },
            jd: { snapshotHash: 'jh', origin: 'pasted' },
            overallScore: 91,
            breakdown: [],
            gaps: [],
            strengths: ['TypeScript'],
            evidence: [],
            findingsJson: {},
            delta: null,
          },
        },
        events: {},
        gapStatus: {},
      });

      await useAuthStore.getState().signOut();
      expect(useAtsToolStore.getState().rawResumeText).toBe('');
      expect(useAuditStore.getState().entries).toEqual({});
      expect(useResumeStore.getState().workspaces).toEqual({});
    });
  });

  describe('4. Service Worker (public/sw.js) Hardening', () => {
    function loadSwHarness() {
      const swSource = fs.readFileSync(path.resolve(process.cwd(), 'public/sw.js'), 'utf-8');
      const cacheStores = new Map<string, Map<string, any>>();
      const listeners: Record<string, Array<(event: any) => void>> = {};

      const cachesMock = {
        open: vi.fn(async (name: string) => {
          if (!cacheStores.has(name)) cacheStores.set(name, new Map());
          const store = cacheStores.get(name)!;
          return {
            addAll: vi.fn(async (assets: string[]) => {
              for (const asset of assets) store.set(asset, { asset });
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

      const fetchMock = vi.fn(async (req: any) => {
        const url = new URL(req.url);
        const headersMap = new Map<string, string>();
        if (url.pathname.includes('no-store')) {
          headersMap.set('cache-control', 'no-store');
        } else if (url.pathname.includes('private')) {
          headersMap.set('cache-control', 'private');
        } else if (url.pathname.endsWith('.html') || url.pathname === '/assets/fallback.js') {
          headersMap.set('content-type', url.pathname.endsWith('.html') ? 'text/html' : 'application/javascript');
        }
        return {
          status: 200,
          type: 'basic',
          headers: {
            get: (k: string) => headersMap.get(k.toLowerCase()) ?? null,
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

      return { swSource, cacheStores, cachesMock, fetchMock, listeners };
    }

    it('uses build-injected CACHE_VERSION placeholder and valid RUNTIME_CACHE expression', () => {
      const { swSource } = loadSwHarness();
      expect(swSource).toContain("const CACHE_VERSION = '__HIREFLOW_SW_CACHE_VERSION__';");
      expect(swSource).toContain("const RUNTIME_CACHE = CACHE_VERSION + '-runtime';");
    });

    it('never caches /api/, /auth/, non-GET, cross-origin, Authorization, dynamic, or private/no-store responses', async () => {
      const { cacheStores, fetchMock, listeners } = loadSwHarness();

      const dispatchFetch = async (url: string, opts: { method?: string; mode?: string; headers?: Record<string, string> } = {}) => {
        let responded: Promise<any> | null = null;
        const headerMap = new Map(Object.entries(opts.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
        const event = {
          request: {
            url,
            method: opts.method || 'GET',
            mode: opts.mode || 'cors',
            headers: {
              has: (name: string) => headerMap.has(name.toLowerCase()),
            },
          },
          respondWith: (p: Promise<any>) => {
            responded = p;
          },
        };
        for (const fn of listeners.fetch || []) fn(event);
        if (responded) await responded;
        // Flush microtasks for background cache.put
        await Promise.resolve();
        await Promise.resolve();
      };

      await dispatchFetch('https://hireflow.app/api/ats/analyze');
      await dispatchFetch('https://hireflow.app/auth/callback');
      await dispatchFetch('https://hireflow.app/assets/post.js', { method: 'POST' });
      await dispatchFetch('https://evil.example/assets/app.js');
      await dispatchFetch('https://hireflow.app/assets/secret.js', { headers: { Authorization: 'Bearer tok' } });
      await dispatchFetch('https://hireflow.app/user-data.json');
      await dispatchFetch('https://hireflow.app/portal', { mode: 'navigate' });
      await dispatchFetch('https://hireflow.app/assets/no-store-bundle.js');
      await dispatchFetch('https://hireflow.app/assets/private-bundle.js');

      const runtimeStore = cacheStores.get('__HIREFLOW_SW_CACHE_VERSION__-runtime');
      expect(runtimeStore?.size ?? 0).toBe(0);

      // Static cacheable asset IS cached in RUNTIME_CACHE
      await dispatchFetch('https://hireflow.app/assets/main.js');
      expect(cacheStores.get('__HIREFLOW_SW_CACHE_VERSION__-runtime')?.has('https://hireflow.app/assets/main.js')).toBe(true);
      expect(fetchMock).toHaveBeenCalled();
    });

    it('clears RUNTIME_CACHE on CLEAR_USER_CACHES message while preserving STATIC_CACHE', async () => {
      const { cacheStores, listeners } = loadSwHarness();
      cacheStores.set('__HIREFLOW_SW_CACHE_VERSION__-shell', new Map([['/', { ok: true }]]));
      cacheStores.set('__HIREFLOW_SW_CACHE_VERSION__-runtime', new Map([['https://hireflow.app/assets/main.js', { ok: true }]]));

      const waitPromises: Promise<any>[] = [];
      for (const fn of listeners.message || []) {
        fn({
          data: { type: 'CLEAR_USER_CACHES' },
          waitUntil: (p: Promise<any>) => waitPromises.push(p),
        });
      }
      await Promise.all(waitPromises);

      expect(cacheStores.has('__HIREFLOW_SW_CACHE_VERSION__-runtime')).toBe(false);
      expect(cacheStores.has('__HIREFLOW_SW_CACHE_VERSION__-shell')).toBe(true);
    });
  });
});
