import { create } from 'zustand';
import { isAuthConfigured, getSupabase } from './supabaseClient';
import { AUTH_HINT_KEY } from '@/lib/storage/namespace';

export type AuthStatus = 'guest' | 'loading' | 'authenticated' | 'error';

export function validateReturnTo(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '/portal';
  const trimmed = url.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/\\') ||
    trimmed.includes(':') ||
    trimmed.includes('\n') ||
    trimmed.includes('\r')
  ) {
    return '/portal';
  }
  return trimmed;
}

export interface AuthState {
  status: AuthStatus;
  userId: string | null;
  email: string | null;
  error: string | null;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAllCloudData: () => Promise<void>;
}

const getInitialState = (): { status: AuthStatus; userId: string | null; email: string | null } => {
  if (import.meta.env.MODE === 'e2e' && typeof localStorage !== 'undefined') {
    const hint = localStorage.getItem(AUTH_HINT_KEY) === '1';
    const e2eUser = localStorage.getItem('hireflow:v5:e2e-user');
    if (hint && e2eUser) {
      return { status: 'authenticated', userId: e2eUser, email: `${e2eUser}@example.com` };
    }
  }
  return { status: 'guest', userId: null, email: null };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  status: initial.status,
  userId: initial.userId,
  email: initial.email,
  error: null,

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      set({ status: 'error', error: msg });
    }
  },

  signOut: async () => {
    try {
      if (isAuthConfigured && get().status === 'authenticated') {
        const supabase = await getSupabase();
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(AUTH_HINT_KEY);
      }
      set({
        status: 'guest',
        userId: null,
        email: null,
        error: null,
      });
    }
  },

  deleteAllCloudData: async () => {
    if (!isAuthConfigured || get().status !== 'authenticated') return;
    const supabase = await getSupabase();
    const { error } = await supabase.rpc('erase_my_data');
    if (error) {
      throw error;
    }
  },
}));
