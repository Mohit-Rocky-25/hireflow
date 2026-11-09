// ============================================================
// Career Trajectory Navigation Header & Back Button Component
// Accessible, responsive, pinned with 44px touch targets
// High-Contrast Dark System with Inset Pressed Depth
// ============================================================

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface CareerPathBackButtonProps {
  /** If true, renders the hub variant: "Back to Home" pointing to '/' */
  isHub?: boolean;
  /** Current page name for breadcrumb in sub-pages (e.g. "Dream Job Roadmap") */
  currentPageTitle?: string;
  className?: string;
}

export function CareerPathBackButton({
  isHub = false,
  currentPageTitle,
  className = '',
}: CareerPathBackButtonProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`w-full bg-black border-b border-charcoal z-40 transition-colors ${className}`}
      role="navigation"
      aria-label="Career Trajectory Navigation"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="w-9 h-9 rounded bg-near-black hover:bg-hover-gray border border-charcoal flex items-center justify-center text-silver hover:text-white transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt"
              aria-label="Go to Home"
              title="Go to Home"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-5a1 1 0 0 1-1-1v-4.5h-3V20a1 1 0 0 1-1 1.5h-5A1.5 1.5 0 0 1 3 20z" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => (isHub ? navigate(-1) : navigate('/tools/career-path'))}
              className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold uppercase tracking-wider text-white bg-near-black hover:bg-hover-gray border border-charcoal rounded transition-colors cursor-pointer active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt font-mono"
              aria-label={isHub ? 'Go back' : 'Back to Career Trajectory Hub'}
            >
              <span className="font-mono text-sm leading-none">←</span>
              <span>Back</span>
            </button>
          </div>

          {/* Breadcrumb for sub-pages */}
          {!isHub && (
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[1.2px] text-silver pl-2 border-l border-charcoal" aria-label="Breadcrumb">
              <Link to="/" className="text-silver hover:text-volt transition-colors">
                HIREFLOW
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-silver/60 stroke-[1.5px]" aria-hidden="true" />
              <Link to="/tools/career-path" className="text-silver hover:text-volt transition-colors">
                CAREER TRAJECTORY
              </Link>
              {currentPageTitle && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-silver/60 stroke-[1.5px]" aria-hidden="true" />
                  <span className="text-white font-bold truncate max-w-[200px] md:max-w-xs" aria-current="page">
                    {currentPageTitle.toUpperCase()}
                  </span>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Region & Market Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-[1.4px] rounded-full bg-near-black text-volt border border-volt/40">
            <span className="w-1.5 h-1.5 rounded-full bg-volt" aria-hidden="true"></span>
            India Market • INR (₹)
          </span>
        </div>
      </div>
    </div>
  );
}
