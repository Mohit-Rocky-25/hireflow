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

    if (typeof localStorage !== 'undefined') {
      const demoMode = localStorage.getItem('hireflow:v5:demo-mode');
      if (demoMode === 'local') {
        // Local demo mode requires zero network egress
        return;
      }
    }

    if (!isAuthConfigured) {
      return;
    }

    const hasAuthHint = typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_HINT_KEY) === '1';
    const isCallbackPage = typeof window !== 'undefined' && window.location.pathname === '/auth/callback';

    // Zero-egress rule C2: Do NOT contact Supabase if guest has no saved auth hint and is not on callback page
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
            localStorage.removeItem('hireflow:v5:demo-mode');
          }
          useAuthStore.setState({
            status: 'guest',
            userId: null,
            email: null,
            displayName: null,
            isDemo: false,
            demoStorage: null,
          });
        } else {
          const isDemoUser = session.user.email === import.meta.env.VITE_DEMO_EMAIL;
          useAuthStore.setState({
            status: 'authenticated',
            userId: session.user.id,
            email: session.user.email ?? null,
            displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Mohit',
            avatarUrl: session.user.user_metadata?.avatar_url || null,
            isDemo: isDemoUser,
            demoStorage: isDemoUser ? 'cloud' : null,
          });
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(AUTH_HINT_KEY, '1');
            if (isDemoUser) {
              localStorage.setItem('hireflow:v5:demo-mode', 'cloud');
            }
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const isDemoUser = session.user.email === import.meta.env.VITE_DEMO_EMAIL;
            useAuthStore.setState({
              status: 'authenticated',
              userId: session.user.id,
              email: session.user.email ?? null,
              displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Mohit',
              avatarUrl: session.user.user_metadata?.avatar_url || null,
              isDemo: isDemoUser,
              demoStorage: isDemoUser ? 'cloud' : null,
            });
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(AUTH_HINT_KEY, '1');
              if (isDemoUser) {
                localStorage.setItem('hireflow:v5:demo-mode', 'cloud');
              }
            }
          } else {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem(AUTH_HINT_KEY);
              localStorage.removeItem('hireflow:v5:demo-mode');
            }
            useAuthStore.setState({
              status: 'guest',
              userId: null,
              email: null,
              displayName: null,
              avatarUrl: null,
              isDemo: false,
              demoStorage: null,
            });
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    })();
  }, []);

  return <>{children}</>;
};
