import { describe, it, expect, beforeEach, vi } from 'vitest';

class StorageMock implements Storage {
  private store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  key(index: number) { return Object.keys(this.store)[index] ?? null; }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new StorageMock();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new StorageMock();
}

import { useStore } from '@/store/useStore';
import { useAtsToolStore } from '@/store/tools/atsStore';
import { useAuthStore, purgeLegacyBrowserUserData } from '@/features/auth/useAuthStore';

describe('Cloud-First Storage & Auth Security (Phase 10.8 + SEC-001)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useStore.setState({
      currentUser: null,
      isAuthenticated: false,
      users: [],
      _initialized: false,
    });
    useAuthStore.setState({
      status: 'guest',
      userId: null,
      displayName: null,
      email: null,
      avatarUrl: null,
      provider: null,
      error: null,
    });
  });

  it('never writes passwords or candidate PII to localStorage or sessionStorage', () => {
    const candidateSecretInput = ['Sample', 'Candidate', 'Secret', '2026'].join('_');
    const user = useStore.getState().register(
      {
        email: 'alice@example.com',
        name: 'Alice Candidate',
        role: 'CANDIDATE',
        avatar: '',
      },
      candidateSecretInput
    );

    expect(user.id).toBeDefined();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('purges legacy pw_ and hf_hash_ keys on startup/purge while preserving UI theme preferences', () => {
    localStorage.setItem('pw_legacy_123', 'plaintext_leaked_password');
    localStorage.setItem('hf_hash_user1', 'salt$deadbeef');
    localStorage.setItem('hireflow_tool_ats_v3', '{"rawResumeText":"secret"}');
    localStorage.setItem('hireflow:v4:profile', '{"name":"Alice"}');
    localStorage.setItem('hireflow_sim_cloud_u1', '{}');
    localStorage.setItem('hireflo_sim_cloud_u1', '{}');
    localStorage.setItem('hireflow:v4:design', 'spruce');
    localStorage.setItem('hireflow:v4:theme-mode', 'dark');
    sessionStorage.setItem('hireflow:temp', 'val');
    sessionStorage.setItem('hf_seen_cinematic', 'true');

    purgeLegacyBrowserUserData();

    expect(localStorage.getItem('pw_legacy_123')).toBeNull();
    expect(localStorage.getItem('hf_hash_user1')).toBeNull();
    expect(localStorage.getItem('hireflow_tool_ats_v3')).toBeNull();
    expect(localStorage.getItem('hireflow:v4:profile')).toBeNull();
    expect(localStorage.getItem('hireflow_sim_cloud_u1')).toBeNull();
    expect(localStorage.getItem('hireflo_sim_cloud_u1')).toBeNull();
    expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');
    expect(localStorage.getItem('hireflow:v4:theme-mode')).toBe('dark');
    expect(sessionStorage.getItem('hireflow:temp')).toBeNull();
    expect(sessionStorage.getItem('hf_seen_cinematic')).toBe('true');
  });

  it('signOut wipes in-memory ATS/user state, purges browser user keys, and notifies Service Worker', async () => {
    const postMessageMock = vi.fn();
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        onLine: true,
        serviceWorker: {
          ready: Promise.resolve({ active: { postMessage: postMessageMock } }),
          controller: { postMessage: postMessageMock },
        },
      },
      configurable: true,
    });

    useAtsToolStore.getState().setResumeText('Sensitive resume text', 'secret.pdf');
    useAtsToolStore.getState().setJdText('Confidential JD');
    localStorage.setItem('hireflow_tool_ats_v3', '{"rawResumeText":"secret"}');
    localStorage.setItem('hireflow:v4:design', 'spruce');

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().status).toBe('guest');
    expect(useAuthStore.getState().userId).toBeNull();
    expect(useAtsToolStore.getState().rawResumeText).toBe('');
    expect(useAtsToolStore.getState().jdText).toBe('');
    expect(localStorage.getItem('hireflow_tool_ats_v3')).toBeNull();
    expect(localStorage.getItem('hireflow:v4:design')).toBe('spruce');
    expect(postMessageMock).toHaveBeenCalledWith({ type: 'CLEAR_USER_CACHES' });
  });

  it('rejects unconfigured Google OAuth loudly without falling back to any demo user', async () => {
    await useAuthStore.getState().signInWithGoogle('/portal');
    const state = useAuthStore.getState();
    expect(state.status).toBe('error');
    expect(state.userId).toBeNull();
    expect(state.error).toContain('AUTH_NOT_CONFIGURED');
  });
});
