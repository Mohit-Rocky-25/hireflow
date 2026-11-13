import React, { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { isAuthConfigured, getSupabase } from './supabaseClient';
import { AUTH_HINT_KEY } from '@/lib/storage/namespace';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useEffect(() => {
    // Mode e2e hook: install fake harness without pulling into normal production
    if (import.meta.env.MODE === 'e2e') {
      void import('./e2eHarness')
        .then(({ installE2eHarness }) => {
          installE2eHarness();
        })
        .catch(() => {});
      return;
    }

    if (!isAuthConfigured) {
      return;
    }

    const hasAuthHint = typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_HINT_KEY) === '1';
    const isCallbackPage = typeof window !== 'undefined' && window.location.pathname === '/auth/callback';

    // Zero-egress rule C2: Do NOT contact Supabase if guest has no saved auth hint and is not on the callback page!
    if (!hasAuthHint && !isCallbackPage) {
      return;
    }

    void (async () => {
      try {
        const supabase = await getSupabase();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(AUTH_HINT_KEY);
          }
          useAuthStore.setState({ status: 'guest', userId: null, email: null });
        } else {
          useAuthStore.setState({
            status: 'authenticated',
            userId: session.user.id,
            email: session.user.email ?? null,
          });
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(AUTH_HINT_KEY, '1');
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            useAuthStore.setState({
              status: 'authenticated',
              userId: session.user.id,
              email: session.user.email ?? null,
            });
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(AUTH_HINT_KEY, '1');
            }
          } else {
            useAuthStore.setState({
              status: 'guest',
              userId: null,
              email: null,
            });
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem(AUTH_HINT_KEY);
            }
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch {
        useAuthStore.setState({ status: 'guest', userId: null, email: null });
      }
    })();
  }, []);

  return <>{children}</>;
};
