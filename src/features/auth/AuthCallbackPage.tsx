import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase, isAuthConfigured } from './supabaseClient';
import { useAuthStore, validateReturnTo } from './useAuthStore';
import { AUTH_HINT_KEY } from '@/lib/storage/namespace';
import { explainAuthError, type AuthProblem } from './demoAuth';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [problem, setProblem] = useState<AuthProblem | null>(null);

  useEffect(() => {
    // 1. Check for query or hash params with error
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const params: Record<string, string | undefined> = {
      error: searchParams.get('error') || hashParams.get('error') || undefined,
      error_code: searchParams.get('error_code') || hashParams.get('error_code') || undefined,
      error_description: searchParams.get('error_description') || hashParams.get('error_description') || undefined,
    };

    const explained = explainAuthError(params);
    if (explained) {
      setProblem(explained);
      return;
    }

    if (!isAuthConfigured) {
      navigate('/', { replace: true });
      return;
    }

    void (async () => {
      try {
        const supabase = await getSupabase();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          const errExplained = explainAuthError({
            error: error?.name || 'session_error',
            error_description: error?.message || 'Authentication session could not be established',
          });
          setProblem(errExplained ?? {
            title: 'Sign-in failed',
            detail: error?.message || 'Authentication session could not be established.',
            fix: 'Try again, or use the demo account.',
          });
          return;
        }

        useAuthStore.setState({
          status: 'authenticated',
          userId: session.user.id,
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Mohit',
          avatarUrl: session.user.user_metadata?.avatar_url || null,
        });
        localStorage.setItem(AUTH_HINT_KEY, '1');

        const rawReturnTo = sessionStorage.getItem('hireflow:returnTo');
        sessionStorage.removeItem('hireflow:returnTo');
        const target = validateReturnTo(rawReturnTo || undefined);
        navigate(target, { replace: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        setProblem(explainAuthError({ error_description: msg }) ?? {
          title: 'Sign-in failed',
          detail: msg,
          fix: 'Try again, or use the demo account.',
        });
      }
    })();
  }, [navigate]);

  if (problem) {
    return (
      <div className="min-h-screen bg-[#090907] text-[#f1f1e8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#10100d] border border-[#24241c] p-7 rounded-2xl shadow-xl">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#ff8a70] mb-2">
            Sign-in issue
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#f1f1e8] mb-2">
            {problem.title}
          </h2>
          <p className="text-[13.5px] text-[#9b9b8c] leading-relaxed mb-4">
            {problem.detail}
          </p>
          <div className="p-3.5 rounded-lg border border-[#24241c] bg-[#16160f] text-xs text-[#d9d9cd] leading-relaxed mb-6">
            <span className="font-semibold text-[#f1f1e8]">How to fix it: </span>
            {problem.fix}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/?signin=true', { replace: true })}
              className="flex-1 h-10 px-4 rounded-full text-xs font-semibold border border-[#24241c] text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => {
                void useAuthStore.getState().signInWithDemo().then(() => {
                  navigate('/?my=overview', { replace: true });
                });
              }}
              className="flex-1 h-10 px-4 rounded-full text-xs font-bold bg-[#faff69] text-[#090907] hover:bg-[#ebf059] transition-colors"
            >
              Use the demo account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090907] text-[#9b9b8c] flex items-center justify-center p-4">
      <div className="text-xs font-mono animate-pulse">
        Completing authentication...
      </div>
    </div>
  );
};
