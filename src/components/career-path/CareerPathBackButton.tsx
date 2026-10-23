// ============================================================
// Career Trajectory Navigation Header & Back Button Component
// Accessible, responsive, pinned with 44px touch targets
// High-Contrast Dark System with Inset Pressed Depth
// ============================================================

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isHub ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-white bg-near-black hover:bg-hover-gray border border-charcoal rounded transition-colors min-h-[44px] min-w-[44px] active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
              aria-label="Back to HireFlow Home"
            >
              <ArrowLeft className="w-4 h-4 text-silver stroke-[1.5px]" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/tools/career-path')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-near-black hover:bg-hover-gray border border-charcoal rounded transition-colors min-h-[44px] min-w-[44px] cursor-pointer active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
                aria-label="Back to Career Trajectory Hub"
              >
                <ArrowLeft className="w-4 h-4 text-silver stroke-[1.5px]" aria-hidden="true" />
                <span>Back</span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center p-2.5 text-white bg-near-black hover:bg-hover-gray border border-charcoal rounded transition-colors min-h-[44px] min-w-[44px] active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
                aria-label="Go to Home"
                title="Go to Home"
              >
                <Home className="w-4 h-4 text-silver stroke-[1.5px]" aria-hidden="true" />
              </Link>
            </div>
          )}

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
