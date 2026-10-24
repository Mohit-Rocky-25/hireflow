// ============================================================
// Reach Out v2 - Top Navigation Bar
// Uses dark cool-neutral surfaces matching the Decision Suite hub
// Back & Home buttons with black press effect
// ============================================================

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, Sparkles, Briefcase } from 'lucide-react';
import { LINKEDIN_CONNECT_LIMITS } from '../engine/config';

interface ReachOutNavProps {
  linkedInTier: 'free' | 'premium';
  onToggleLinkedInTier: (tier: 'free' | 'premium') => void;
}

export function ReachOutNav({
  linkedInTier,
  onToggleLinkedInTier,
}: ReachOutNavProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/tools');
    }
  };

  const navButtonClass = `
    group relative overflow-hidden inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg
    text-xs font-semibold text-neutral-300 bg-neutral-900 border border-neutral-700/70
    transition-all duration-150 ease-out outline-none cursor-pointer
    hover:border-neutral-500 hover:text-white
    active:scale-[0.97] active:bg-[#0A0A0A] active:text-white active:border-[#0A0A0A]
    focus-visible:scale-[0.97] focus-visible:bg-[#0A0A0A] focus-visible:text-white focus-visible:border-[#0A0A0A]
    focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none
  `;

  const sweepOverlay = `
    absolute inset-0 bg-[#0A0A0A] translate-y-full
    group-active:translate-y-0 group-focus-visible:translate-y-0
    transition-transform duration-150 ease-out z-0
  `;

  return (
    <header className="w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 sticky top-0 z-30 transition-colors">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Back & Home buttons with black press effect */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleBack}
            className={navButtonClass}
            aria-label="Go back to previous page"
          >
            <div className={sweepOverlay} />
            <ArrowLeft className="w-3.5 h-3.5 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
            <span className="relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">Back</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className={navButtonClass}
            aria-label="Go to HireFlow Home"
          >
            <div className={sweepOverlay} />
            <Home className="w-3.5 h-3.5 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
            <span className="relative z-10 group-active:text-white group-focus-visible:text-white transition-colors hidden sm:inline">Home</span>
          </button>

          {/* Breadcrumb & Section Name */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-neutral-800 text-xs">
            <Link to="/tools" className="text-neutral-400 hover:text-neutral-200 transition-colors">
              Tools Hub
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-200 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Reach Out (Cold Outreach Generator)
            </span>
          </div>
        </div>

        {/* Right: Controls & Tracker Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* LinkedIn Tier Selector */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-[11px]">
            <span className="px-2 text-neutral-400 hidden lg:inline">LinkedIn Limit:</span>
            <button
              type="button"
              onClick={() => onToggleLinkedInTier('free')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                linkedInTier === 'free'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="LinkedIn Free note character limit (200)"
            >
              Free ({LINKEDIN_CONNECT_LIMITS.free}c)
            </button>
            <button
              type="button"
              onClick={() => onToggleLinkedInTier('premium')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                linkedInTier === 'premium'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="LinkedIn Premium note character limit (300)"
            >
              Premium ({LINKEDIN_CONNECT_LIMITS.premium}c)
            </button>
          </div>

          {/* Log in Tracker Link (Hard Guardrail 6) */}
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
            title="Log outreach note in Application Tracker"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Log in Tracker</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
