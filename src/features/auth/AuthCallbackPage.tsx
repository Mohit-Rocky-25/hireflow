// ============================================================
// HireFlow — Google OAuth PKCE Callback Page
// Exchanges authorization code, binds verified Supabase UUID,
// hydrates Postgres user data BEFORE navigating, and clears transient URL state.
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase, isSupabaseRuntimeConfigured } from './supabaseClient';
import { useAuthStore } from './useAuthStore';
import { explainAuthError, validateReturnToPath, type AuthProblem } from './authErrors';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorInfo, setErrorInfo] = useState<{
    problem: AuthProblem;
    title: string;
    detail: string;
    recoverable: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      const errorDesc = params.get('error_description');
      const codeParam = params.get('code');

      if (errorParam) {
        if (!active) return;
        setErrorInfo(explainAuthError(errorParam, errorDesc));
        return;
      }

      if (!isSupabaseRuntimeConfigured()) {
        if (!active) return;
        setErrorInfo(explainAuthError('AUTH_NOT_CONFIGURED'));
        return;
      }

      try {
        const supabase = await getSupabase();
        // Supabase client enables detectSessionInUrl: true, so inspect existing session first
        // before attempting manual PKCE code exchange to avoid double-exchanging single-use codes.
        let {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!session && !error && codeParam) {
          const exchanged = await supabase.auth.exchangeCodeForSession(codeParam);
          session = exchanged.data.session;
          error = exchanged.error;
        }

        if (error) {
          if (!active) return;
          setErrorInfo(explainAuthError(error.message));
          return;
        }

        if (!session?.user?.id) {
          if (!active) return;
          setErrorInfo(explainAuthError('expired_code'));
          return;
        }

        // Hydrate cloud account BEFORE navigating into authenticated views
        await useAuthStore.getState().resolveSession(session);

        const rawReturnTo =
          typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hireflow:returnTo') : null;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('hireflow:returnTo');
        }

        const safeTarget = validateReturnToPath(rawReturnTo) || '/portal';
        if (active) {
          navigate(safeTarget, { replace: true });
        }
      } catch (err) {
        if (!active) return;
        setErrorInfo(explainAuthError(err instanceof Error ? err.message : 'Callback failed'));
      }
    };

    void handleCallback();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleRetryGoogle = () => {
    const rawReturnTo =
      typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hireflow:returnTo') : null;
    void useAuthStore.getState().signInWithGoogle(validateReturnToPath(rawReturnTo) || '/portal');
  };

  if (errorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-6">
        <div className="max-w-md w-full rounded-xl border border-white/10 bg-[#121216] p-6 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-rose-400">
            Authentication Notice
          </div>
          <h1 className="text-lg font-semibold">{errorInfo.title}</h1>
          <p className="text-sm text-neutral-300 leading-relaxed">{errorInfo.detail}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {errorInfo.recoverable && (
              <button
                type="button"
                onClick={handleRetryGoogle}
                className="px-4 py-2 rounded-lg bg-volt text-black text-xs font-semibold hover:bg-volt-hover transition-colors cursor-pointer"
              >
                Try Google sign-in again
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/portal')}
              className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 text-white text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-6">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-volt border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-neutral-300">Verifying Google session &amp; syncing cloud data...</p>
      </div>
    </div>
  );
};
