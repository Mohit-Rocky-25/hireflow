// ============================================================
// Career Trajectory Navigation Header & Back Button Component
// Accessible, responsive, pinned above sticky headers with 44px touch targets
// Matches the dark design system of the Career Trajectory section
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
      className={`w-full bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80 z-40 transition-colors ${className}`}
      role="navigation"
      aria-label="Career Trajectory Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isHub ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 rounded-lg transition-colors min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              aria-label="Back to HireFlow Home"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-300" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/tools/career-path')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 rounded-lg transition-colors min-h-[44px] min-w-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                aria-label="Back to Career Trajectory Hub"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-300" aria-hidden="true" />
                <span>Back</span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center p-2.5 text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 rounded-lg transition-colors min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                aria-label="Go to Home"
                title="Go to Home"
              >
                <Home className="w-4 h-4 text-neutral-300" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Breadcrumb for sub-pages */}
          {!isHub && (
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-neutral-400 pl-2 border-l border-neutral-700" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white transition-colors">
                HireFlow
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
              <Link to="/tools/career-path" className="hover:text-white transition-colors">
                Career Trajectory
              </Link>
              {currentPageTitle && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
                  <span className="text-white font-semibold truncate max-w-[200px] md:max-w-xs" aria-current="page">
                    {currentPageTitle}
                  </span>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Region & Market Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
            India Market • INR (₹)
          </span>
        </div>
      </div>
    </div>
  );
}
