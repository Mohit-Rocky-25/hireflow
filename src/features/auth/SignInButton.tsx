import React from 'react';
import { useAuthStore } from './useAuthStore';
import { isAuthConfigured } from './supabaseClient';

interface SignInButtonProps {
  returnTo?: string;
  className?: string;
}

export const SignInButton: React.FC<SignInButtonProps> = ({ returnTo, className = '' }) => {
  const { signInWithGoogle, status } = useAuthStore();
  const isLoading = status === 'loading';

  if (!isAuthConfigured) {
    return (
      <button
        disabled
        aria-disabled="true"
        className={`px-4 py-2 text-xs font-mono font-medium rounded border border-neutral-800 bg-[#10100d] text-neutral-500 cursor-not-allowed ${className}`}
      >
        Accounts are not enabled in this build
      </button>
    );
  }

  return (
    <button
      onClick={() => void signInWithGoogle(returnTo)}
      disabled={isLoading}
      aria-label="Sign in with Google"
      className={`px-4 py-2 text-xs font-mono font-semibold rounded bg-[#faff69] text-[#090907] hover:bg-[#ebf059] transition-colors focus:outline-none focus:ring-2 focus:ring-[#faff69] disabled:opacity-50 ${className}`}
    >
      {isLoading ? 'Connecting...' : 'Sign in with Google'}
    </button>
  );
};
