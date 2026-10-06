// ============================================================
// Career Path Navigation Header & Back Button Component
// Accessible, responsive, pinned above sticky headers with 44px touch targets
// ============================================================

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

export interface CareerPathBackButtonProps {
  /** If true, renders the hub variant: "Back to Home" pointing to '/' */
  isHub?: boolean;
  /** Current page name for breadcrumb in sub-pages (e.g. "Promotion Roadmap Simulator") */
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
      className={`w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 z-40 transition-colors ${className}`}
      role="navigation"
      aria-label="Career Path Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isHub ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label="Back to HireFlow Home"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Home</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/tools/career-path')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                aria-label="Back to Career Path Hub"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Back</span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center p-2.5 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                aria-label="Go to Home"
                title="Go to Home"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Breadcrumb for sub-pages */}
          {!isHub && (
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 pl-2 border-l border-neutral-300 dark:border-neutral-700" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                HireFlow
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
              <Link to="/tools/career-path" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">
                Career Path
              </Link>
              {currentPageTitle && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
                  <span className="text-neutral-900 dark:text-neutral-100 font-semibold truncate max-w-[200px] md:max-w-xs" aria-current="page">
                    {currentPageTitle}
                  </span>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Region & Market Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
            India Market • INR (₹)
          </span>
        </div>
      </div>
    </div>
  );
}
