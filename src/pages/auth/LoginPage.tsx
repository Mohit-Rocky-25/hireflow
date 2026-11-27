// ============================================================
// HireFlow — Cloud-First Authentication Page
// Uses Supabase Auth (Google OAuth PKCE & Email Auth) exclusively.
// Zero localStorage password hashes, zero fake Google choosers.
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ChevronLeft,
  LayoutGrid,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { validateReturnToPath } from '../../features/auth/authErrors';
import {
  getSupabaseConfigStatus,
} from '../../lib/supabase/env';
import { toast } from '../../components/ui/Toast';

export function LoginPage({ initialMode }: { initialMode?: 'signin' | 'signup' } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const storeError = useAuthStore((s) => s.error);

  const searchParams = new URLSearchParams(location.search);
  const initialModeParam = searchParams.get('mode');
  const redirectTo =
    validateReturnToPath(searchParams.get('returnTo') || searchParams.get('redirect')) || '/portal';

  const [mode, setMode] = useState<'signin' | 'signup'>(
    initialMode || (initialModeParam === 'signup' ? 'signup' : 'signin')
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const configStatus = getSupabaseConfigStatus();
  const configured = configStatus.configured;

  const handleGoogleSignInClick = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await signInWithGoogle(redirectTo);
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
        navigate(redirectTo);
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
          navigate(redirectTo);
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to complete authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = () => {
    toast('info', 'Continuing as Guest in transient browser memory.');
    navigate(redirectTo);
  };

  const displayedError = errorMessage || storeError;

  return (
    <div className="min-h-screen bg-[#0c0d11] text-white flex flex-col justify-between relative selection:bg-neutral-700 selection:text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[25%] w-[550px] h-[450px] bg-blue-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[20%] w-[500px] h-[450px] bg-indigo-600/[0.04] rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white font-bold text-xs">
              H
            </div>
            <span className="text-sm font-bold text-white tracking-tight">HireFlow</span>
          </Link>
        </div>

        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Tools Hub</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-[#111318] border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 p-7 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-black border border-white/15 flex items-center justify-center font-black text-white text-base shadow-sm">
              H
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">HireFlow</h2>
              <span className="text-[11px] text-neutral-400">Cloud-First Career Workspace</span>
            </div>
          </div>

          <div className="pt-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {mode === 'signin' ? 'Sign in to your account' : 'Create your cloud account'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Sign in with Google via Supabase Auth to store resumes, audits, and documents privately in Postgres &amp; Storage.
            </p>
          </div>

          {!configured && (
            <div
              role="alert"
              className="p-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl leading-relaxed"
            >
              Cloud auth not configured:{' '}
              {configStatus.invalidReason ||
                `missing ${configStatus.missingVars.join(', ')}. Configure Supabase env vars to enable sign-in.`}
            </div>
          )}

          {displayedError && (
            <div
              role="alert"
              className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl leading-relaxed"
            >
              {displayedError}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs flex items-center justify-center gap-3 transition-all duration-150 shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">or email via Supabase</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 p-1 bg-black/50 border border-white/5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 border-t border-white/5 space-y-3 text-center">
            <Link
              to={`/register${redirectTo ? `?returnTo=${encodeURIComponent(redirectTo === '/portal' ? '/my-space' : redirectTo)}` : ''}`}
              className="w-full py-2.5 px-4 rounded-xl bg-[#faff69] hover:bg-[#ebf059] text-[#090907] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Enter Demo Mode (No Credentials Required)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Continue as Guest (In-Memory Session Only)
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Supabase RLS Enforced &bull; Private Document Storage</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-4 sm:px-8 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>&copy; {new Date().getFullYear()} HireFlow. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link to="/methodology" className="hover:text-white transition-colors">Methodology</Link>
          <Link to="/data" className="hover:text-white transition-colors">Your Data &amp; Cloud Sync</Link>
        </div>
      </footer>
    </div>
  );
}
