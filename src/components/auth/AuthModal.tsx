// ============================================================
// HireFlow — Cloud-First Authentication Modal
// Uses Supabase Auth via useAuthStore exclusively.
// ============================================================

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import {
  getSupabaseConfigStatus,
} from '../../lib/supabase/env';
import { toast } from '../ui/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const storeError = useAuthStore((s) => s.error);

  if (!isOpen) return null;

  const configStatus = getSupabaseConfigStatus();
  const configured = configStatus.configured;

  const handleGoogleSignInClick = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await signInWithGoogle('/portal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
        toast('success', 'Signed in to your HireFlow cloud account.');
        onClose();
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          return;
        }
        const { needsEmailConfirmation } = await signUpWithEmail(
          fullName.trim(),
          email.trim(),
          password
        );
        if (needsEmailConfirmation) {
          toast('info', 'Account created. Check your inbox to verify your email.');
        } else {
          toast('success', 'Cloud account created and hydrated.');
          onClose();
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedError = errorMessage || storeError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 p-7 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-black border border-white/15 flex items-center justify-center font-black text-white text-base">
              H
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">HireFlow</h2>
              <span className="text-[11px] text-neutral-400">Cloud-First Career Workspace</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(null); }}
            className={`py-2 rounded-lg cursor-pointer ${
              mode === 'signin' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`py-2 rounded-lg cursor-pointer ${
              mode === 'signup' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {!configured && (
          <div
            role="alert"
            className="p-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl"
          >
            Cloud auth not configured:{' '}
            {configStatus.invalidReason || `missing ${configStatus.missingVars.join(', ')}.`}
          </div>
        )}

        {displayedError && (
          <div
            role="alert"
            className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl"
          >
            {displayedError}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignInClick}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-9 pr-10 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 space-y-2 text-center">
          <button
            type="button"
            onClick={() => {
              toast('info', 'Continuing as Guest in transient browser memory.');
              onClose();
            }}
            className="text-xs text-neutral-400 hover:text-white cursor-pointer font-medium"
          >
            Continue as Guest (In-Memory Only)
          </button>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span>Supabase Auth &amp; Postgres RLS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
