// ============================================================
// HireFlow — Route Guard for Authenticated Cloud Account Views
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';
import { SignInButton } from './SignInButton';
import { isSupabaseRuntimeConfigured } from './supabaseClient';
import { FlaskConical, ArrowRight } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  returnTo?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  title = 'Workspace access required',
  description = 'Enter Demo Mode with a temporary session profile, or sign in with Google once cloud credentials are configured.',
  returnTo,
}) => {
  const status = useAuthStore((s) => s.status);
  const cloudConfigured = isSupabaseRuntimeConfigured();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[220px]">
        <div className="w-6 h-6 rounded-full border-2 border-volt border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    const registerUrl = returnTo
      ? `/register?returnTo=${encodeURIComponent(returnTo)}`
      : '/register';
    return (
      <div className="rounded-2xl border border-[#24241c] bg-[#10100d] p-7 max-w-md mx-auto my-12 space-y-4 text-[#f1f1e8]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#faff69]/30 bg-[#faff69]/10 text-[#faff69] font-mono text-[10px] font-bold uppercase tracking-wider">
          <FlaskConical className="w-3 h-3" />
          Protected Workspace
        </div>
        <h2 className="text-lg font-bold text-[#f1f1e8]">{title}</h2>
        <p className="text-xs text-[#9b9b8c] leading-relaxed">{description}</p>
        <div className="flex flex-col gap-2.5 pt-1">
          <Link
            to={registerUrl}
            className="w-full py-2.5 px-4 rounded-full bg-[#faff69] hover:bg-[#ebf059] text-[#090907] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <span>Register Demo Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          {cloudConfigured && <SignInButton returnTo={returnTo} />}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
