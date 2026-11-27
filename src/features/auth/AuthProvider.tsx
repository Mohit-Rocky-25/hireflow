// ============================================================
// HireFlow — Cloud Session Provider
// Restores Supabase Auth PKCE session across page reloads, handles
// token refresh, session expiration, sign-out, and account switches.
// ============================================================

import React, { useEffect } from 'react';
import { getSupabase, isSupabaseRuntimeConfigured } from './supabaseClient';
import {
  useAuthStore,
  purgeInsecureLegacyCredentialKeys,
} from './useAuthStore';
import { AUTH_CALLBACK_PATH } from '@/lib/supabase/env';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    let active = true;
    let unsubscribeAuth: (() => void) | null = null;

    // Purge stale legacy plaintext password, offline outbox, or demo harness keys on startup
    // while keeping pre-cloud user records readable for one-time /data import until erased/imported.
    purgeInsecureLegacyCredentialKeys();

    const init = async () => {
      // Strictly non-production test harness (disabled in production bundles)
      if (!import.meta.env.PROD && import.meta.env.VITE_E2E_AUTH_BYPASS === 'true') {
        const mod = await import('./e2eHarness');
        const e2eUser = mod.readE2EHarnessUser();
        if (e2eUser && active) {
          useAuthStore.getState().setE2EUser(e2eUser.userId, e2eUser);
          return;
        }
      }

      if (!isSupabaseRuntimeConfigured()) {
        if (active && typeof window !== 'undefined' && window.location.pathname !== AUTH_CALLBACK_PATH) {
          const restored = await useAuthStore.getState().restoreDemoSession();
          if (!restored && active) {
            useAuthStore.getState().setGuest();
          }
        }
        return;
      }

      try {
        const supabase = await getSupabase();

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!active) return;

          if (event === 'SIGNED_OUT') {
            void useAuthStore.getState().resolveSession(null);
            return;
          }

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session) {
              void useAuthStore.getState().resolveSession(session);
            } else {
              void useAuthStore.getState().handleSessionExpired('Session expired. Please sign in again.');
            }
          }
        });
        unsubscribeAuth = () => subscription.unsubscribe();

        // When returning from OAuth redirect, AuthCallbackPage handles PKCE code verification & initial hydration.
        if (typeof window !== 'undefined' && window.location.pathname === AUTH_CALLBACK_PATH) {
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (!active) return;

        if (error) {
          await useAuthStore.getState().handleSessionExpired(error.message);
          return;
        }

        if (data.session) {
          await useAuthStore.getState().resolveSession(data.session);
        } else {
          useAuthStore.getState().setGuest();
        }
      } catch (err) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Failed to initialize cloud session.';
        useAuthStore.getState().setError(msg);
      }
    };

    void init();

    return () => {
      active = false;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  return <>{children}</>;
};
