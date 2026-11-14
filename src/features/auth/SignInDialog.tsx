import React, { useEffect, useRef } from 'react';
import { useAuthStore } from './useAuthStore';
import { isAuthConfigured } from './supabaseClient';
import { demoAvailability } from './demoAuth';
import { X } from 'lucide-react';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  returnTo?: string;
}

export const SignInDialog: React.FC<SignInDialogProps> = ({ isOpen, onClose, returnTo }) => {
  const { signInWithDemo, signInWithGoogle, status } = useAuthStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const avail = demoAvailability(import.meta.env);
  const showGoogle = isAuthConfigured && import.meta.env.VITE_GOOGLE_AUTH === '1';
  const isLoading = status === 'loading';

  useEffect(() => {
    if (!isOpen) return;

    // Focus heading on open
    headingRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDemoSignIn = async () => {
    await signInWithDemo();
    onClose();
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle(returnTo);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050504]/75 backdrop-blur-[3px] animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] p-8 rounded-2xl bg-[#10100d] border border-[#24241c] text-[#f1f1e8] shadow-2xl focus:outline-none"
      >
        <button
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-[#24241c] text-[#9b9b8c] hover:text-[#f1f1e8] hover:border-[#faff69]/40 flex items-center justify-center transition-colors focus:ring-2 focus:ring-[#faff69]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="font-mono text-[11px] font-semibold tracking-wider text-[#6d6d61] uppercase mb-2">
          HireFlow
        </div>

        <h2
          id="signin-title"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight text-[#f1f1e8] mb-2 focus:outline-none"
        >
          Sign in to keep your work
        </h2>

        <p className="text-[14.5px] leading-relaxed text-[#9b9b8c] mb-6">
          Your scans, targets and plan are saved to your account and follow you across devices.
        </p>

        <div className="space-y-3">
          {avail.enabled && (
            <button
              onClick={handleDemoSignIn}
              disabled={isLoading}
              className="w-full h-[42px] px-5 rounded-full font-bold text-sm bg-[#faff69] text-[#090907] hover:bg-[#ebf059] transition-colors focus:outline-none focus:ring-2 focus:ring-[#faff69] disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Continue with the demo account'}
            </button>
          )}

          {showGoogle && (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-[42px] px-5 rounded-full font-bold text-sm border border-[#24241c] bg-[#16160f] text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#faff69] disabled:opacity-50"
            >
              Continue with Google
            </button>
          )}
        </div>

        <div className="mt-5 p-3.5 rounded-lg border border-[#24241c] bg-[#16160f]/60 flex items-start gap-2.5 text-[13px] leading-relaxed text-[#9b9b8c]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#faff69] mt-1.5 flex-none" />
          <span>
            The demo account is shared and comes with sample data, so please do not enter personal details. Guests can still use every tool without signing in; nothing leaves your device.
          </span>
        </div>
      </div>
    </div>
  );
};

