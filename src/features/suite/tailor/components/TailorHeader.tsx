import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

interface TailorHeaderProps {
  onBack?: () => void;
  h1Visible?: boolean;
}

export function TailorHeader({ onBack, h1Visible = true }: TailorHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/tools');
    }
  };

  const navButtonClass = `
    group relative overflow-hidden inline-flex items-center justify-center gap-2 h-11 min-w-[44px] min-h-[44px] px-3.5 rounded-xl
    text-sm font-semibold text-text-secondary bg-surface border border-border
    transition-all duration-150 ease-out outline-none shrink-0
    hover:border-text-secondary hover:text-text
    active:scale-[0.97] active:bg-[#0A0A0A] active:text-white active:border-[#0A0A0A]
    focus-visible:scale-[0.97] focus-visible:bg-[#0A0A0A] focus-visible:text-white focus-visible:border-[#0A0A0A]
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:ring-primary
  `;

  const sweepOverlay = `
    absolute inset-0 bg-[#0A0A0A] translate-y-full
    group-active:translate-y-0 group-focus-visible:translate-y-0
    transition-transform duration-150 ease-out z-0
  `;

  return (
    <header
      id="tailor-header"
      className="sticky top-0 z-30 h-16 w-full border-b border-border bg-surface/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: 44px Navigation Buttons */}
        <div id="header-nav-left" className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleBack}
            className={navButtonClass}
            aria-label="Go back"
            id="header-btn-back"
          >
            <div className={sweepOverlay} />
            <ArrowLeft className="w-4 h-4 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
            <span className="hidden sm:inline relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">
              Back
            </span>
          </button>

          <button
            onClick={() => navigate('/')}
            className={navButtonClass}
            aria-label="Go home"
            id="header-btn-home"
          >
            <div className={sweepOverlay} />
            <Home className="w-4 h-4 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
            <span className="hidden sm:inline relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">
              Home
            </span>
          </button>
        </div>

        {/* Center: Breadcrumb and compact scroll-title */}
        <div
          id="header-nav-center"
          className="flex items-center gap-2 min-w-0 overflow-hidden text-sm"
        >
          <Link
            to="/tools"
            className="text-text-secondary hover:text-text font-medium transition-colors shrink-0 truncate max-w-[110px] sm:max-w-none"
          >
            Decision Suite
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="font-bold text-text truncate">
            Tailor My Resume
          </span>

          {/* Compact title badge appearing only when H1 has scrolled off */}
          {!h1Visible && (
            <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 animate-fade-in shrink-0">
              <Sparkles className="w-3 h-3" />
              Tailoring Active
            </span>
          )}
        </div>

        {/* Right: TruthCheck Badge */}
        <div id="header-nav-right" className="flex items-center gap-2 shrink-0">
          <div
            id="truthcheck-badge"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold"
            title="TruthCheck™: 100% Deterministic & Non-Fabricated"
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="hidden sm:inline">TruthCheck™ Non-Fabrication</span>
            <span className="sm:hidden text-[11px]">TruthCheck™</span>
          </div>
        </div>
      </div>
    </header>
  );
}
