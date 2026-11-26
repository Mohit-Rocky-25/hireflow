// ============================================================
// HireFlow — Route Guard for Authenticated Cloud Account Views
// ============================================================

import React from 'react';
import { useAuthStore } from './useAuthStore';
import { SignInButton } from './SignInButton';

interface RequireAuthProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  returnTo?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  title = 'Sign in with Google required',
  description = 'Your data is stored privately in your Supabase cloud account protected by Row Level Security.',
  returnTo,
}) => {
  const status = useAuthStore((s) => s.status);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[220px]">
        <div className="w-6 h-6 rounded-full border-2 border-volt border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="rounded-xl border border-white/10 bg-[#121216] p-6 max-w-md mx-auto my-8 space-y-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-xs text-neutral-300 leading-relaxed">{description}</p>
        <SignInButton returnTo={returnTo} />
      </div>
    );
  }

  return <>{children}</>;
};
