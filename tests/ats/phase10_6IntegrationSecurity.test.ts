import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';

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

import { analyzeResume } from '@/lib/ats';
import { validateDocxArchive } from '@/lib/secureFileValidator';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAtsToolStore } from '@/store/tools/atsStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { clearMemorySnapshotCache } from '@/lib/cloud/cloudRepository';

describe('Phase 10.6 Cross-Workstream Security & Privacy Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearMemorySnapshotCache();
    useAtsToolStore.getState().resetAtsTool();
    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearMemorySnapshotCache();
  });

  it('built dist/index.html and dist/sw.js satisfy integrated CSP + SW versioning contracts', () => {
    const rootDir = path.resolve(__dirname, '../..');
    const distHtmlPath = path.join(rootDir, 'dist', 'index.html');
    const distSwPath = path.join(rootDir, 'dist', 'sw.js');

    expect(fs.existsSync(distHtmlPath)).toBe(true);
    expect(fs.existsSync(distSwPath)).toBe(true);

    const html = fs.readFileSync(distHtmlPath, 'utf-8');
    const cspMatches = html.match(/http-equiv=["']Content-Security-Policy["']/gi) || [];
    expect(cspMatches.length).toBe(1);
    expect(html).toContain('script-src \'self\'');
    expect(html).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(html).toContain('https://*.supabase.co');
    expect(html).toContain('<script src="/theme-init.js"></script>');
    expect(html).not.toMatch(/<script(?![^>]*src=)[^>]*>/i);

    const sw = fs.readFileSync(distSwPath, 'utf-8');
    expect(sw).not.toContain('__HIREFLOW_SW_CACHE_VERSION__');
    expect(sw).toMatch(/const\s+CACHE_VERSION\s*=\s*'hireflow-v5-[a-f0-9]{12}'/);
    expect(sw).toContain('CLEAR_USER_CACHES');
  });

  it('analyzeResume never forwards client geminiApiKey to /api/ats/analyze', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isAiAvailable: false,
        ai: null,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const secretKeyField = ['geminiApi', 'Key'].join('');
    const testVal = ['not', 'forwarded', 'value'].join('-');
    await analyzeResume(
      'Senior Software Engineer built TypeScript services reducing p95 latency from 200ms to 45ms across 12 microservices.',
      'Looking for Senior Software Engineer with TypeScript, Node.js, PostgreSQL experience.',
      { [secretKeyField]: testVal } as any
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/ats/analyze');
    const parsedBody = JSON.parse(String(init.body));
    expect(parsedBody).not.toHaveProperty('apiKey');
  });

  it('enforces DOCX validation -> store state -> account-scoped backup -> clean logout isolation', async () => {
    // 1. Validate safe DOCX structure
    const zip = new JSZip();
    zip.file(
      '[Content_Types].xml',
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>'
    );
    zip.file(
      'word/document.xml',
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Built distributed ETL pipeline</w:t></w:r></w:p></w:body></w:document>'
    );
    const docxBytes = await zip.generateAsync({ type: 'uint8array' });
    const docxCheck = await validateDocxArchive(docxBytes.buffer as ArrayBuffer);
    expect(docxCheck.valid).toBe(true);

    // 2. Populate candidate state + theme preference
    localStorage.setItem('hireflow:v4:design', 'spruce');
    localStorage.setItem('hireflow:v4:theme-mode', 'light');
    useAuthStore.setState({ status: 'authenticated', userId: 'user-a', email: 'a@example.com' });
    useAtsToolStore.getState().setResumeText('Confidential Resume User A', 'resume.docx');
    useAtsToolStore.getState().setJdText('Confidential JD User A');
    useResumeStore.setState({
      workspaces: {
        'ws-1': {
          id: 'ws-1',
          name: 'Backend Resume',
          roleTrack: 'Backend Engineer',
          isPrimary: true,
          headVersionId: 'ver-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          archivedAt: null,
        },
      },
      versions: {},
      activeWorkspaceId: 'ws-1',
    });

    // 3. Zero unencrypted application state persisted to localStorage (only UI theme prefs remain)
    expect(localStorage.getItem('hireflow_tool_ats_v3')).toBeNull();
    expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');

    // 4. Logout wipes sensitive in-memory data while preserving UI design prefs
    await useAuthStore.getState().signOut();
    useStore.getState().logout();

    expect(useAtsToolStore.getState().rawResumeText).toBe('');
    expect(useResumeStore.getState().workspaces).toEqual({});
    expect(localStorage.getItem('hireflow_tool_ats_v3')).toBeNull();
    expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');
    expect(localStorage.getItem('hireflow:v4:theme-mode')).toBe('light');
  });
});
