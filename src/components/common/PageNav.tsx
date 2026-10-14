// ============================================================
// HireFlow — In-Page Contextual Back Navigation Component
// Clean, non-colliding contextual back action with the black press effect
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

interface PageNavProps {
  onBack?: () => void;
  fallbackRoute?: string;
  className?: string;
}

export function PageNav({ onBack, fallbackRoute = '/tools', className = '' }: PageNavProps) {
  const navigate = useNavigate();

  // If no custom onBack is provided, the sticky AppShellLayout header
  // already provides the persistent Back and Home buttons.
  // Rendering an absolute floating button here would cause visual overlap.
  if (!onBack) {
    return null;
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackRoute);
    }
  };

  const navButtonClass = `
    group relative overflow-hidden inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-xl
    text-xs font-bold text-text-secondary bg-surface border border-border
    transition-all duration-150 ease-out outline-none cursor-pointer
    hover:border-text-secondary hover:text-text
    active:scale-[0.97] active:bg-[#0A0A0A] active:text-white active:border-[#0A0A0A]
    focus-visible:scale-[0.97] focus-visible:bg-[#0A0A0A] focus-visible:text-white focus-visible:border-[#0A0A0A]
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:ring-primary shadow-2xs
  `;

  const sweepOverlay = `
    absolute inset-0 bg-[#0A0A0A] translate-y-full
    group-active:translate-y-0 group-focus-visible:translate-y-0
    transition-transform duration-150 ease-out z-0
  `;

  return (
    <div className={`mb-4 flex items-center gap-2 animate-fade-in ${className}`}>
      <button
        onClick={handleBack}
        className={navButtonClass}
        aria-label="Modify inputs / Go back"
      >
        <div className={sweepOverlay} />
        <ArrowLeft className="w-4 h-4 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
        <span className="relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">
          ← Modify Inputs
        </span>
      </button>
    </div>
  );
}
