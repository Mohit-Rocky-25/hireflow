/**
 * HireFlow: Drawer Component (High-Contrast Dark System)
 * Slide-over drawer on desktop (right panel) and bottom sheet on mobile (<640px).
 * Features: focus trap, Esc to close, focus restoration, backdrop dismiss, accessible ARIA attributes.
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabel?: string;
  widthClass?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  ariaLabel,
  widthClass = 'sm:max-w-md md:max-w-lg',
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const timer = setTimeout(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            drawerRef.current.focus();
          }
        }
      }, 50);

      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content: Bottom-sheet on mobile (<640px), right-slide on desktop */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={`relative z-10 flex w-full flex-col bg-black border-charcoal text-white shadow-level-3 transition-transform duration-150 ease-out
          max-sm:mt-auto max-sm:max-h-[85vh] max-sm:rounded-t-2xl max-sm:border-t
          sm:h-full sm:border-l ${widthClass}`}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1 rounded-full bg-charcoal" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-charcoal px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-white tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-xs text-silver">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded p-2 text-silver hover:bg-hover-gray hover:text-volt focus-visible:outline-2 focus-visible:outline-volt"
          >
            <X className="h-5 w-5 stroke-[1.5px]" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {children}
        </div>

        {/* Footer if provided */}
        {footer && (
          <div className="border-t border-charcoal px-6 py-4 bg-near-black">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
