// ============================================================
// Reach Out v2 - Mobile Bottom Sheet for Inputs
// Accessible modal bottom sheet for mobile viewport (390px width)
// ============================================================

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title = 'Template Inputs & Guidance',
  children,
}: MobileBottomSheetProps) {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden bg-black/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop tap to dismiss */}
      <div
        className="flex-1"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        className="w-full max-h-[85vh] bg-neutral-900 border-t border-neutral-700/80 rounded-t-2xl flex flex-col shadow-2xl animate-slide-up"
      >
        {/* Header bar */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-neutral-700 mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <h2 className="text-xs font-bold text-neutral-100 uppercase tracking-wider">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close inputs panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Children */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
