import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

interface PageNavProps {
  onBack?: () => void;
  fallbackRoute?: string;
}

export function PageNav({ onBack, fallbackRoute = '/tools' }: PageNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
        onClick={handleBack}
        className={navButtonClass}
        aria-label="Go back"
      >
        <div className={sweepOverlay} />
        <ArrowLeft className="w-4 h-4 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
        <span className="relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">Back</span>
      </button>

      <button 
        onClick={() => navigate('/')}
        className={navButtonClass}
        aria-label="Go home"
      >
        <div className={sweepOverlay} />
        <Home className="w-4 h-4 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
        <span className="relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">Home</span>
      </button>
    </div>
  );
}
