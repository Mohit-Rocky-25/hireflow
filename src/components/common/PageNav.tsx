import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PageNavProps {
  onBack?: () => void;
  fallbackRoute?: string;
  preferFallback?: boolean;
}

export function PageNav({ onBack, fallbackRoute = '/tools', preferFallback = false }: PageNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    // Top-level tools hub goes back directly to Home (/)
    if (location.pathname === '/tools') {
      navigate(fallbackRoute || '/');
      return;
    }

    // If explicit preferFallback is set, return to the designated route
    if (preferFallback && fallbackRoute) {
      navigate(fallbackRoute);
      return;
    }
    
    // Per R8.4: Back goes to previous page, with fallback if direct entry
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackRoute || '/tools');
    }
  };

  const navButtonClass = `
    group relative overflow-hidden inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg
    text-sm font-semibold text-text-secondary bg-surface border border-border
    transition-all duration-150 ease-out outline-none
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
    <div className="absolute top-6 left-6 z-40 flex items-center gap-3 animate-fade-in">
      <button 
        onClick={() => navigate('/')}
        className={navButtonClass}
        aria-label="Go home"
      >
        <div className={sweepOverlay} />
        <span className="font-mono text-sm leading-none relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">⌂</span>
        <span className="relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">Home</span>
      </button>

      <button 
        onClick={handleBack}
        className={navButtonClass}
        aria-label="Go back"
      >
        <div className={sweepOverlay} />
        <span className="font-mono text-sm leading-none relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">←</span>
        <span className="relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">Back</span>
      </button>
    </div>
  );
}
