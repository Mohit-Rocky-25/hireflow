import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase, isAuthConfigured } from './supabaseClient';
import { useAuthStore, validateReturnTo } from './useAuthStore';
import { AUTH_HINT_KEY } from '@/lib/storage/namespace';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthConfigured) {
      navigate('/portal', { replace: true });
      return;
    }

    void (async () => {
      try {
        const supabase = await getSupabase();
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setErrorMsg(error?.message || 'Authentication session could not be established.');
          return;
        }

        useAuthStore.setState({
          status: 'authenticated',
          userId: session.user.id,
          email: session.user.email ?? null,
        });
        localStorage.setItem(AUTH_HINT_KEY, '1');

        const rawReturnTo = sessionStorage.getItem('hireflow:returnTo');
        sessionStorage.removeItem('hireflow:returnTo');
        const target = validateReturnTo(rawReturnTo || undefined);
        navigate(target, { replace: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        setErrorMsg(msg);
      }
    })();
  }, [navigate]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#090907] text-neutral-300 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#10100d] border border-neutral-800 p-6 rounded-lg text-center">
          <h2 className="text-sm font-mono uppercase tracking-wider text-red-400 mb-2">Authentication Error</h2>
          <p className="text-xs text-neutral-400 mb-4">{errorMsg}</p>
          <button
            onClick={() => navigate('/portal', { replace: true })}
            className="px-4 py-2 text-xs font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090907] text-neutral-300 flex items-center justify-center p-4">
      <div className="text-xs font-mono text-neutral-400 animate-pulse">
        Completing authentication...
      </div>
    </div>
  );
};
