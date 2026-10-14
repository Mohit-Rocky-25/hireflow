// ============================================================
// HireFlow Navigation System — 404 Not Found Page
// Suggests the closest registry entries and tools based on the requested URL
// ============================================================

import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft, Sparkles, Compass, AlertCircle } from 'lucide-react';
import { getSuggestionsFor404 } from '../navigation/registry';
import { getNavIcon } from '../navigation/icons';
import { useStore } from '../store/useStore';

export function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const suggestions = getSuggestionsFor404(location.pathname, currentUser?.role);

  return (
    <div className="min-h-screen bg-bg text-foreground flex flex-col items-center justify-center p-6 sm:p-12 animate-fade-in">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider shadow-2xs">
          <AlertCircle className="w-4 h-4" />
          <span>Error 404 · Page Not Found</span>
        </div>

        {/* Main Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight">
            We couldn't find that page
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-lg mx-auto font-medium">
            The path <code className="px-2 py-0.5 rounded bg-surface-2 text-primary font-mono text-sm">{location.pathname}</code> does not exist or may have moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-foreground font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>HireFlow Home</span>
          </Link>
        </div>

        {/* Registry-Powered Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="pt-8 border-t border-border/80 text-left space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Suggested destinations from navigation registry</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((entry) => (
                <Link
                  key={entry.id}
                  to={entry.route}
                  className="p-4 rounded-2xl bg-surface hover:bg-surface-2 border border-border hover:border-primary/40 transition-all flex items-start gap-3.5 group shadow-xs hover:-translate-y-0.5"
                >
                  <span className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                    {getNavIcon(entry.icon, 'w-5 h-5')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {entry.label}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5 leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
