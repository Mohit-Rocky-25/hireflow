// ============================================================
// HireFlow — Demo Registration Experience (/register)
// Uses DemoAuthProvider (sessionStorage-only identity descriptor).
// Never collects passwords or real Google credentials.
// Designed so SupabaseAuthProvider replaces it cleanly later.
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  ArrowRight,
  ChevronLeft,
  LayoutGrid,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import {
  DemoAuthProvider,
  validateDemoRegistrationInput,
} from '../../features/auth/authProviderContract';
import { validateReturnToPath } from '../../features/auth/authErrors';
import { toast } from '../../components/ui/Toast';

export function DemoRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { status, displayName: activeName, isDemo, registerDemoSession } = useAuthStore();

  const searchParams = new URLSearchParams(location.search);
  const targetPath = validateReturnToPath(searchParams.get('returnTo')) || '/my-space';

  const existingDemo = DemoAuthProvider.getSession();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [seedSampleWorkspace, setSeedSampleWorkspace] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const check = validateDemoRegistrationInput(fullName, email);
    if (!check.valid) {
      setErrorMessage(check.error);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerDemoSession(check.displayName, check.email, {
        seedSampleWorkspace,
      });
      toast('success', `Entered Demo Mode as ${check.displayName}.`);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to start demo session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeExistingDemo = () => {
    if (status === 'authenticated' && isDemo) {
      navigate(targetPath, { replace: true });
    } else if (existingDemo) {
      void useAuthStore
        .getState()
        .registerDemoSession(existingDemo.displayName, existingDemo.email, {
          seedSampleWorkspace: existingDemo.seededSample,
        })
        .then(() => {
          navigate(targetPath, { replace: true });
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#090907] text-[#f1f1e8] flex flex-col justify-between selection:bg-[#faff69] selection:text-[#090907]">
      <header className="w-full px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#1b1b15] bg-[#0e0e0b]/90">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16160f] hover:bg-[#1e1e15] border border-[#24241c] text-[#9b9b8c] hover:text-[#f1f1e8] text-xs font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#16160f] border border-[#24241c] flex items-center justify-center font-black text-[#faff69] text-xs">
              H
            </span>
            <span className="text-sm font-extrabold tracking-wider text-[#f1f1e8]">HIREFLOW</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9b9b8c] hover:text-[#f1f1e8] border border-[#24241c] bg-[#10100d] transition-colors"
          >
            Cloud Sign In
          </Link>
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#090907] bg-[#faff69] hover:bg-[#ebf059] transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tools Hub</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-[#24241c] bg-[#10100d] shadow-2xl p-7 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#16160f] border border-[#24241c] flex items-center justify-center font-black text-[#faff69] text-base">
                H
              </span>
              <div>
                <div className="text-sm font-bold text-[#f1f1e8]">HireFlow Workspace</div>
                <div className="text-[11px] font-mono text-[#6d6d61] uppercase tracking-wider">
                  DemoAuthProvider
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#faff69]/40 bg-[#faff69]/10 text-[#faff69] font-mono text-[10px] font-bold uppercase tracking-wider">
              <FlaskConical className="w-3 h-3" />
              Demo Mode
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f1f1e8]">
              Register Demo Workspace
            </h1>
            <p className="text-xs text-[#9b9b8c] mt-1.5 leading-relaxed">
              Create a temporary in-session demo profile to explore <strong className="text-[#f1f1e8]">My Space</strong> and all HireFlow tools immediately — no Google or Supabase credentials required.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-[#24241c] bg-[#090907] text-[11.5px] text-[#9b9b8c] leading-relaxed">
            <strong className="text-[#f1f1e8]">Honest Demo Boundary:</strong> Only your demo name and email descriptor are stored in <code className="text-[#faff69]">sessionStorage</code> for refresh continuity. No passwords are collected and data is not cloud-persisted.
          </div>

          {(existingDemo || (status === 'authenticated' && isDemo)) && (
            <div className="p-3.5 rounded-xl border border-[#faff69]/30 bg-[#faff69]/5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#f1f1e8] truncate">
                  Active demo session: {activeName || existingDemo?.displayName}
                </div>
                <div className="text-[11px] font-mono text-[#9b9b8c] truncate">
                  {existingDemo?.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleResumeExistingDemo}
                className="shrink-0 px-3 py-1.5 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs hover:bg-[#ebf059] transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/30 text-xs text-rose-200 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="demo-name" className="block text-xs font-mono uppercase tracking-wider text-[#9b9b8c] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-[#6d6d61]" />
                <input
                  id="demo-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ananya Rao"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090907] border border-[#24241c] text-sm text-[#f1f1e8] placeholder-[#6d6d61] focus:outline-none focus:border-[#faff69]"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="demo-email" className="block text-xs font-mono uppercase tracking-wider text-[#9b9b8c] mb-1.5">
                Email Address (Demo Identifier)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#6d6d61]" />
                <input
                  id="demo-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090907] border border-[#24241c] text-sm text-[#f1f1e8] placeholder-[#6d6d61] focus:outline-none focus:border-[#faff69]"
                  required
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#24241c] bg-[#090907] cursor-pointer">
              <input
                type="checkbox"
                checked={seedSampleWorkspace}
                onChange={(e) => setSeedSampleWorkspace(e.target.checked)}
                className="mt-0.5 accent-[#faff69]"
              />
              <span className="text-xs text-[#9b9b8c] leading-relaxed">
                <strong className="text-[#f1f1e8]">Load Sample / Demo Workspace</strong> (labelled sample resumes, audits, targets &amp; plan items so My Space is populated immediately).
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-full bg-[#faff69] hover:bg-[#ebf059] text-[#090907] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Demo Workspace...' : 'Enter Demo My Space'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-[#1b1b15] flex items-center justify-between text-[11px] text-[#6d6d61]">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#faff69]" />
              Replaceable by SupabaseAuthProvider later
            </span>
            <Link to="/tools" className="text-[#9b9b8c] hover:text-[#faff69] underline">
              Browse as Guest
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
