// ============================================================
// HireFlow — Compact Sign-In Button
// Triggers Google OAuth sign-in modal cleanly.
// ============================================================

import React from 'react';
import { useAuthStore } from './useAuthStore';

interface SignInButtonProps {
  returnTo?: string;
  className?: string;
  label?: string;
}

export const SignInButton: React.FC<SignInButtonProps> = ({
  returnTo,
  className = '',
  label = 'Sign in with Google',
}) => {
  const openSignIn = useAuthStore((s) => s.openSignIn);

  return (
    <button
      type="button"
      onClick={() => openSignIn(undefined, returnTo)}
      className={`px-3 py-1.5 rounded-lg bg-volt hover:bg-volt-hover text-black text-xs font-semibold transition-colors cursor-pointer ${className}`}
    >
      {label}
    </button>
  );
};
