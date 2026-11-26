// ============================================================
// HireFlow — Google OAuth Sign-In Dialog (Zero Demo Bypasses)
// ============================================================

import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { useAuthStore } from './useAuthStore';
import { isSupabaseRuntimeConfigured, getSupabaseConfigStatus } from './supabaseClient';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  returnTo?: string;
}

export const SignInDialog: React.FC<SignInDialogProps> = ({ isOpen, onClose, returnTo }) => {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const dialogReason = useAuthStore((s) => s.dialogReason);
  const authError = useAuthStore((s) => s.error);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const configured = isSupabaseRuntimeConfigured();
  const configStatus = getSupabaseConfigStatus();

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signInWithGoogle(returnTo);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#121216] text-white p-6 space-y-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="signin-dialog-title" className="text-lg font-semibold">
              Sign in with Google
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {dialogReason ||
                'Connect your Google identity via Supabase Auth to save resumes, scans, targets, and files in your private cloud account.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!configured && (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1"
          >
            <div className="font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Supabase Cloud Authentication Not Configured</span>
            </div>
            <p className="text-amber-100/80 leading-relaxed">
              {configStatus.invalidReason ||
                `Missing required variable(s): ${configStatus.missingVars.join(', ')}.`}
            </p>
          </div>
        )}

        {authError && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
          >
            {authError}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogle}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 disabled:opacity-50 text-black text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>{busy ? 'Redirecting to Google...' : 'Continue with Google'}</span>
          </button>

          <p className="text-[11px] text-neutral-400 leading-relaxed text-center">
            Guest mode runs purely in transient page memory — closing or reloading the tab clears unauthenticated scans unless signed in.
          </p>
        </div>
      </div>
    </div>
  );
};
