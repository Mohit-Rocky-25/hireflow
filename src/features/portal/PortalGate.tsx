import React from 'react';
import { SignInButton } from '@/features/auth/SignInButton';

export const PortalGate: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#090907] text-neutral-200">
      <div className="max-w-xl w-full bg-[#10100d] border border-neutral-800 p-8 rounded-lg">
        <div className="mb-6">
          <div className="inline-block px-2.5 py-1 text-[11px] font-mono tracking-wider uppercase bg-[#181814] text-[#faff69] border border-[#faff69]/20 rounded mb-3">
            Candidate Hub
          </div>
          <h1 className="text-xl font-mono font-semibold text-neutral-100 mb-2">
            Sign In to Unlock Candidate Command Center
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The Candidate Hub unifies your audit history, resume matrix versions, execution plans, and outreach drafts across all 11 evaluation tools into a single personalized view.
          </p>
        </div>

        <div className="p-4 bg-[#141410] border border-neutral-800/80 rounded mb-6 text-xs text-neutral-300">
          <div className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
            Privacy Guarantee
          </div>
          <p className="text-neutral-400 leading-relaxed">
            Everything you do without an account stays on your device and is never uploaded. When you choose to sign in, your data is isolated in your personal account with Row Level Security.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-neutral-800/60">
          <div className="text-[11px] font-mono text-neutral-500">
            Sign in with Google to continue
          </div>
          <SignInButton returnTo="/portal" />
        </div>
      </div>
    </div>
  );
};
