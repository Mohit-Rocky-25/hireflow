import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DemoAuthProvider,
  DEMO_SESSION_STORAGE_KEY,
  validateDemoRegistrationInput,
} from '@/features/auth/authProviderContract';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (k: string) => store.get(k) ?? null,
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => {
      store.delete(k);
    },
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
  };
}

describe('Phase 5-9: DemoAuthProvider & My Space Session Lifecycle', () => {
  const sessionStorageMock = createMemoryStorage();

  beforeEach(async () => {
    sessionStorageMock.clear();
    vi.stubGlobal('sessionStorage', sessionStorageMock);
    await useAuthStore.getState().signOut();
  });

  it('validates demo registration inputs cleanly without requiring passwords', () => {
    expect(validateDemoRegistrationInput('A', 'a@b.com').valid).toBe(false);
    expect(validateDemoRegistrationInput('Ananya Rao', 'invalid-email').valid).toBe(false);
    const ok = validateDemoRegistrationInput('  Ananya Rao ', 'ANANYA@Example.com');
    expect(ok).toEqual({
      valid: true,
      displayName: 'Ananya Rao',
      email: 'ananya@example.com',
    });
  });

  it('registers a temporary DemoAuthProvider session in sessionStorage only and seeds sample workspace', async () => {
    await useAuthStore.getState().registerDemoSession('Ananya Rao', 'ananya@example.com', {
      seedSampleWorkspace: true,
    });

    const auth = useAuthStore.getState();
    expect(auth.status).toBe('authenticated');
    expect(auth.provider).toBe('demo');
    expect(auth.isDemo).toBe(true);
    expect(auth.displayName).toBe('Ananya Rao');
    expect(auth.email).toBe('ananya@example.com');
    expect(auth.userId).toMatch(/^demo-/);

    const rawDescriptor = sessionStorageMock.getItem(DEMO_SESSION_STORAGE_KEY);
    expect(rawDescriptor).not.toBeNull();
    const parsed = JSON.parse(rawDescriptor!);
    expect(parsed.provider).toBe('demo');
    expect(parsed.password).toBeUndefined();

    // Sample workspace populated in memory
    expect(Object.keys(useAuditStore.getState().entries).length).toBeGreaterThan(0);
    expect(Object.keys(useResumeStore.getState().workspaces).length).toBeGreaterThan(0);
    expect(Object.keys(useMySpaceStore.getState().watchlist).length).toBeGreaterThan(0);
  });

  it('restores demo session on reload and wipes everything cleanly on signOut', async () => {
    await useAuthStore.getState().registerDemoSession('Rohan Mehta', 'rohan@example.com', {
      seedSampleWorkspace: false,
    });

    // Simulate memory reset + reload restoration from sessionStorage
    useAuthStore.setState({
      status: 'loading',
      userId: null,
      displayName: null,
      email: null,
      provider: null,
      isDemo: false,
    });

    const restored = await useAuthStore.getState().restoreDemoSession();
    expect(restored).toBe(true);
    expect(useAuthStore.getState().status).toBe('authenticated');
    expect(useAuthStore.getState().displayName).toBe('Rohan Mehta');

    // Sign out clears DemoAuthProvider descriptor and returns to guest
    await useAuthStore.getState().signOut();
    expect(useAuthStore.getState().status).toBe('guest');
    expect(useAuthStore.getState().isDemo).toBe(false);
    expect(DemoAuthProvider.getSession()).toBeNull();
    expect(Object.keys(useAuditStore.getState().entries)).toHaveLength(0);
  });
});
