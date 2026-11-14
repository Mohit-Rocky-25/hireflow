import { create } from 'zustand';
import { isAuthConfigured, getSupabase } from './supabaseClient';
import { AUTH_HINT_KEY } from '@/lib/storage/namespace';
import { demoAvailability } from './demoAuth';
import { buildDemoDataset } from '@/features/demo/demoDataset';
import { importDataset } from '@/features/demo/demoImporter';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { supabaseTransport } from '@/sync/supabaseTransport';

export type AuthStatus = 'guest' | 'loading' | 'authenticated' | 'error';
export type DemoStorageMode = 'cloud' | 'local';

export function validateReturnTo(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '/';
  const trimmed = url.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes(':') ||
    trimmed.includes('\n') ||
    trimmed.includes('\r')
  ) {
    return '/';
  }
  return trimmed;
}

export interface AuthState {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isDemo: boolean;
  demoStorage: DemoStorageMode | null;
  error: string | null;
  isSignInOpen: boolean;

  openSignIn: () => void;
  closeSignIn: () => void;
  signInWithDemo: () => Promise<void>;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  deleteAllCloudData: () => Promise<void>;
}

const getInitialState = (): {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  isDemo: boolean;
  demoStorage: DemoStorageMode | null;
} => {
  if (typeof localStorage !== 'undefined') {
    const hint = localStorage.getItem(AUTH_HINT_KEY) === '1';
    const demoMode = localStorage.getItem('hireflow:v5:demo-mode') as DemoStorageMode | null;
    const e2eUser = localStorage.getItem('hireflow:v5:e2e-user');

    if (hint && demoMode === 'local') {
      return {
        status: 'authenticated',
        userId: 'demo-local',
        email: 'demo@hireflow.local',
        displayName: 'Mohit',
        isDemo: true,
        demoStorage: 'local',
      };
    }

    if (import.meta.env.MODE === 'e2e' && hint && e2eUser) {
      return {
        status: 'authenticated',
        userId: e2eUser,
        email: `${e2eUser}@example.com`,
        displayName: 'Alex',
        isDemo: false,
        demoStorage: null,
      };
    }
  }
  return {
    status: 'guest',
    userId: null,
    email: null,
    displayName: null,
    isDemo: false,
    demoStorage: null,
  };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  status: initial.status,
  userId: initial.userId,
  email: initial.email,
  displayName: initial.displayName,
  avatarUrl: null,
  isDemo: initial.isDemo,
  demoStorage: initial.demoStorage,
  error: null,
  isSignInOpen: false,

  openSignIn: () => set({ isSignInOpen: true }),
  closeSignIn: () => set({ isSignInOpen: false }),

  signInWithDemo: async () => {
    const avail = demoAvailability(import.meta.env);
    if (!avail.enabled) {
      set({ error: 'Demo account is not available in this environment' });
      return;
    }

    set({ status: 'loading', error: null });

    if (avail.storage === 'cloud') {
      try {
        const supabase = await getSupabase();
        const email = import.meta.env.VITE_DEMO_EMAIL as string;
        const password = import.meta.env.VITE_DEMO_PASSWORD as string;

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error || !data.user) {
          set({ status: 'error', error: error?.message || 'Failed to sign in to demo account' });
          return;
        }

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(AUTH_HINT_KEY, '1');
          localStorage.setItem('hireflow:v5:demo-mode', 'cloud');
        }

        set({
          status: 'authenticated',
          userId: data.user.id,
          email: data.user.email ?? email,
          displayName: 'Mohit',
          isDemo: true,
          demoStorage: 'cloud',
          error: null,
        });

        // Seed if first time
        const audits = useAuditStore.getState().entries;
        const workspaces = useResumeStore.getState().workspaces;
        if (Object.keys(audits).length === 0 && Object.keys(workspaces).length === 0) {
          const ds = await buildDemoDataset();
          await importDataset(ds, true);
        }
      } catch (err) {
        set({ status: 'error', error: (err as Error).message });
      }
    } else {
      // Local demo mode (no network)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(AUTH_HINT_KEY, '1');
        localStorage.setItem('hireflow:v5:demo-mode', 'local');
      }

      set({
        status: 'authenticated',
        userId: 'demo-local',
        email: 'demo@hireflow.local',
        displayName: 'Mohit',
        isDemo: true,
        demoStorage: 'local',
        error: null,
      });

      // Seed if empty
      const audits = useAuditStore.getState().entries;
      const workspaces = useResumeStore.getState().workspaces;
      if (Object.keys(audits).length === 0 && Object.keys(workspaces).length === 0) {
        const ds = await buildDemoDataset();
        await importDataset(ds, false);
      }
    }
  },

  signInWithGoogle: async (returnTo) => {
    if (!isAuthConfigured) {
      set({ error: 'Accounts are not enabled in this build' });
      return;
    }

    const validatedReturnTo = validateReturnTo(returnTo);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('hireflow:returnTo', validatedReturnTo);
    }

    try {
      set({ status: 'loading', error: null });
      const supabase = await getSupabase();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        set({ status: 'error', error: error.message });
      }
    } catch (err) {
      set({ status: 'error', error: (err as Error).message });
    }
  },

  signOut: async () => {
    try {
      if (isAuthConfigured) {
        const supabase = await getSupabase();
        await supabase.auth.signOut().catch(() => {});
      }
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(AUTH_HINT_KEY);
        localStorage.removeItem('hireflow:v5:demo-mode');
        localStorage.removeItem('hireflow:v5:e2e-user');
      }
      set({
        status: 'guest',
        userId: null,
        email: null,
        displayName: null,
        avatarUrl: null,
        isDemo: false,
        demoStorage: null,
        error: null,
      });
    }
  },

  resetDemoData: async () => {
    const { isDemo, demoStorage } = get();
    if (!isDemo) return;

    if (demoStorage === 'cloud') {
      await supabaseTransport.erase().catch(() => {});
    }

    useAuditStore.setState({ entries: {}, events: {}, gapStatus: {} });
    useResumeStore.setState({ workspaces: {}, versions: {}, activeWorkspaceId: null });
    useMySpaceStore.setState({ watchlist: {}, planItems: {}, outreachDrafts: {} });

    const ds = await buildDemoDataset();
    await importDataset(ds, demoStorage === 'cloud');
  },

  deleteAllCloudData: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      await supabaseTransport.erase();
    } finally {
      await get().signOut();
    }
  },
}));
