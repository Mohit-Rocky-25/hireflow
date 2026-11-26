// ============================================================
// HireFlow — Cloud-First Authentication Store
// Identity owner = Supabase Auth UUID (`session.user.id`).
// Zero demo bypasses, zero localStorage password hashes.
// ============================================================

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import {
  getSupabase,
  isSupabaseRuntimeConfigured,
  getSupabaseConfigStatus,
  getAuthRedirectUrl,
} from './supabaseClient';
import { validateReturnToPath } from './authErrors';

export type AuthStatus = 'loading' | 'authenticated' | 'guest' | 'error';

export interface AuthState {
  status: AuthStatus;
  userId: string | null;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'email' | 'e2e' | null;
  error: string | null;
  openDialog: boolean;
  dialogReason: string | null;
  returnTo: string | null;

  openSignIn: (reason?: string, returnTo?: string) => void;
  closeSignIn: () => void;
  clearError: () => void;
  setGuest: () => void;
  setError: (message: string) => void;
  resolveSession: (session: Session | null, options?: { skipHydration?: boolean }) => Promise<void>;
  handleSessionExpired: (reason?: string) => Promise<void>;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  deleteAllCloudData: () => Promise<void>;
  setE2EUser: (userId: string, opts?: { displayName?: string; email?: string }) => void;
}

const PRESERVED_UI_LOCAL_KEYS = new Set(['hireflow:v4:design', 'hireflow:v4:theme-mode']);
const PRESERVED_UI_SESSION_KEYS = new Set(['hf_seen_cinematic']);

/**
 * Removes only insecure pre-cloud credential, outbox, demo, and test-harness keys on boot
 * so legitimate pre-cloud user records remain inspectable for the /data One-Time Legacy Importer.
 */
export function purgeInsecureLegacyCredentialKeys(): void {
  const ls =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : typeof globalThis !== 'undefined' && 'localStorage' in globalThis
      ? (globalThis as { localStorage?: Storage }).localStorage ?? null
      : null;
  const ss =
    typeof window !== 'undefined' && window.sessionStorage
      ? window.sessionStorage
      : typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis
      ? (globalThis as { sessionStorage?: Storage }).sessionStorage ?? null
      : null;

  try {
    if (ls) {
      const toDelete: string[] = [];
      for (let i = 0; i < ls.length; i++) {
        const k = ls.key(i);
        if (!k || PRESERVED_UI_LOCAL_KEYS.has(k)) continue;
        if (
          k.startsWith('hireflow:auth:') ||
          k.startsWith('hireflow:sync') ||
          k.startsWith('hireflow:v5:outbox') ||
          k.startsWith('hireflow-offline-outbox') ||
          k.startsWith('hireflow-sync-queue') ||
          k === 'hireflow-demo-store' ||
          k.startsWith('pw_') ||
          k === 'e2e_auth_user'
        ) {
          toDelete.push(k);
        }
      }
      toDelete.forEach((k) => ls.removeItem(k));
    }
    if (ss) {
      const toDelete: string[] = [];
      for (let i = 0; i < ss.length; i++) {
        const k = ss.key(i);
        if (!k || PRESERVED_UI_SESSION_KEYS.has(k)) continue;
        if (k === 'e2e_auth_user' || k.startsWith('pw_')) {
          toDelete.push(k);
        }
      }
      toDelete.forEach((k) => ss.removeItem(k));
    }
  } catch {
    // ignore storage access errors in constrained contexts
  }
}

export function purgeLegacyBrowserUserData(): void {
  const ls =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : typeof globalThis !== 'undefined' && 'localStorage' in globalThis
      ? (globalThis as { localStorage?: Storage }).localStorage ?? null
      : null;
  const ss =
    typeof window !== 'undefined' && window.sessionStorage
      ? window.sessionStorage
      : typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis
      ? (globalThis as { sessionStorage?: Storage }).sessionStorage ?? null
      : null;

  try {
    if (ls) {
      const toDelete: string[] = [];
      for (let i = 0; i < ls.length; i++) {
        const k = ls.key(i);
        if (!k || PRESERVED_UI_LOCAL_KEYS.has(k)) continue;
        if (
          k.startsWith('hireflow') ||
          k.startsWith('hireflo') ||
          k.startsWith('hf_') ||
          k.startsWith('pw_') ||
          k === 'e2e_auth_user'
        ) {
          toDelete.push(k);
        }
      }
      toDelete.forEach((k) => ls.removeItem(k));
    }
    if (ss) {
      const toDelete: string[] = [];
      for (let i = 0; i < ss.length; i++) {
        const k = ss.key(i);
        if (!k || PRESERVED_UI_SESSION_KEYS.has(k)) continue;
        if (k.startsWith('hireflow') || k.startsWith('hf_') || k === 'temp_key') {
          toDelete.push(k);
        }
      }
      toDelete.forEach((k) => ss.removeItem(k));
    }
  } catch {
    // ignore storage access errors in constrained contexts
  }
}

async function clearServiceWorkerUserCaches(): Promise<void> {
  const nav =
    typeof navigator !== 'undefined'
      ? navigator
      : typeof window !== 'undefined'
      ? window.navigator
      : undefined;
  if (!nav || !('serviceWorker' in nav)) return;
  try {
    if (nav.serviceWorker.controller) {
      nav.serviceWorker.controller.postMessage({ type: 'CLEAR_USER_CACHES' });
    }
    if (nav.serviceWorker.ready) {
      const reg = await nav.serviceWorker.ready;
      reg?.active?.postMessage({ type: 'CLEAR_USER_CACHES' });
    }
  } catch {
    // ignore SW unavailability
  }
}

function buildConfigErrorMessage(): string {
  const status = getSupabaseConfigStatus();
  if (status.invalidReason) return `AUTH_NOT_CONFIGURED: ${status.invalidReason}`;
  return `AUTH_NOT_CONFIGURED: Missing environment variable(s): ${status.missingVars.join(', ')}. Configure Supabase before signing in.`;
}

function extractIdentityFromSession(session: Session): {
  userId: string;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'email';
} {
  const user = session.user;
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const rawName =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    (typeof meta.name === 'string' && meta.name.trim()) ||
    (user.email ? user.email.split('@')[0] : '') ||
    'Signed-in User';
  const avatarUrl =
    (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null;
  const provider = user.app_metadata?.provider === 'email' ? 'email' : 'google';

  return {
    userId: user.id,
    displayName: rawName,
    email: user.email ?? null,
    avatarUrl,
    provider,
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: 'loading',
  userId: null,
  displayName: null,
  email: null,
  avatarUrl: null,
  provider: null,
  error: null,
  openDialog: false,
  dialogReason: null,
  returnTo: null,

  openSignIn: (reason, returnTo) =>
    set({
      openDialog: true,
      dialogReason: reason || null,
      returnTo: validateReturnToPath(returnTo) || null,
      error: null,
    }),

  closeSignIn: () =>
    set({
      openDialog: false,
      dialogReason: null,
      error: null,
    }),

  clearError: () => set({ error: null }),

  setGuest: () => {
    const prevUserId = get().userId;
    if (prevUserId) {
      void import('@/lib/cloud/cloudHydrator').then((m) => m.resetAllUserMemoryStores());
    }
    set({
      status: 'guest',
      userId: null,
      displayName: null,
      email: null,
      avatarUrl: null,
      provider: null,
      error: null,
    });
  },

  setError: (message) =>
    set({
      status: 'error',
      error: message,
    }),

  resolveSession: async (session, options) => {
    const prevUserId = get().userId;
    if (!session?.user?.id) {
      if (prevUserId) {
        const { resetAllUserMemoryStores } = await import('@/lib/cloud/cloudHydrator');
        resetAllUserMemoryStores();
      }
      set({
        status: 'guest',
        userId: null,
        displayName: null,
        email: null,
        avatarUrl: null,
        provider: null,
        error: null,
      });
      return;
    }

    const identity = extractIdentityFromSession(session);
    const switchedUser = Boolean(prevUserId && prevUserId !== identity.userId);
    const isFreshLogin = prevUserId !== identity.userId;

    if (switchedUser) {
      const { resetAllUserMemoryStores } = await import('@/lib/cloud/cloudHydrator');
      resetAllUserMemoryStores();
    }

    set({
      status: 'authenticated',
      userId: identity.userId,
      displayName: identity.displayName,
      email: identity.email,
      avatarUrl: identity.avatarUrl,
      provider: identity.provider,
      error: null,
      openDialog: false,
      dialogReason: null,
    });

    if (!options?.skipHydration) {
      const { useCloudSyncStore } = await import('@/lib/cloud/useCloudSyncStore');
      const alreadyHydrated =
        !isFreshLogin && useCloudSyncStore.getState().hydratedUserId === identity.userId;
      if (!alreadyHydrated) {
        const { hydrateUserFromCloud } = await import('@/lib/cloud/cloudHydrator');
        try {
          await hydrateUserFromCloud(identity.userId, {
            displayName: identity.displayName,
            email: identity.email,
            avatarUrl: identity.avatarUrl,
          });
        } catch {
          // Error is explicitly surfaced via useCloudSyncStore + CloudSyncBanner with Retry.
        }
      }
    }
  },

  handleSessionExpired: async (reason) => {
    const { resetAllUserMemoryStores } = await import('@/lib/cloud/cloudHydrator');
    resetAllUserMemoryStores();
    set({
      status: 'guest',
      userId: null,
      displayName: null,
      email: null,
      avatarUrl: null,
      provider: null,
      error: reason || 'Your cloud session expired. Please sign in with Google again.',
    });
  },

  signInWithGoogle: async (returnTo) => {
    if (!isSupabaseRuntimeConfigured()) {
      const msg = buildConfigErrorMessage();
      set({ status: 'error', error: msg });
      return;
    }

    const validReturnTo = validateReturnToPath(returnTo || get().returnTo);
    if (validReturnTo && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('hireflow:returnTo', validReturnTo);
    }

    set({ error: null });
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(),
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) {
        set({ status: 'error', error: error.message });
      }
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Google OAuth redirect failed.',
      });
    }
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseRuntimeConfigured()) {
      const msg = buildConfigErrorMessage();
      set({ error: msg });
      throw new Error(msg);
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      throw new Error(error.message);
    }
    await get().resolveSession(data.session);
  },

  signUpWithEmail: async (fullName, email, password) => {
    if (!isSupabaseRuntimeConfigured()) {
      const msg = buildConfigErrorMessage();
      set({ error: msg });
      throw new Error(msg);
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });
    if (error) {
      set({ error: error.message });
      throw new Error(error.message);
    }
    if (data.session) {
      await get().resolveSession(data.session);
      return { needsEmailConfirmation: false };
    }
    return { needsEmailConfirmation: true };
  },

  signOut: async () => {
    const { resetAllUserMemoryStores } = await import('@/lib/cloud/cloudHydrator');
    resetAllUserMemoryStores();
    purgeLegacyBrowserUserData();
    await clearServiceWorkerUserCaches();

    if (isSupabaseRuntimeConfigured()) {
      try {
        const supabase = await getSupabase();
        await supabase.auth.signOut();
      } catch {
        // local session state already purged unconditionally
      }
    }

    set({
      status: 'guest',
      userId: null,
      displayName: null,
      email: null,
      avatarUrl: null,
      provider: null,
      error: null,
      openDialog: false,
      dialogReason: null,
      returnTo: null,
    });
  },

  deleteAllCloudData: async () => {
    const uid = get().userId;
    if (get().status !== 'authenticated' || !uid) {
      throw new Error('Authentication required before deleting cloud account records.');
    }
    const { cloudRepository } = await import('@/lib/cloud/cloudRepository');
    await cloudRepository.eraseAllUserCloudData(uid);
    await get().signOut();
  },

  setE2EUser: (userId, opts) => {
    if (import.meta.env?.PROD && import.meta.env?.MODE !== 'test') {
      return;
    }
    set({
      status: 'authenticated',
      userId,
      displayName: opts?.displayName || 'Test Candidate',
      email: opts?.email || `${userId}@example.test`,
      avatarUrl: null,
      provider: 'e2e',
      error: null,
      openDialog: false,
      dialogReason: null,
    });
  },
}));
