import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        previouslyFocusedRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'sp-modal-title' : undefined}
      aria-describedby={description ? 'sp-modal-desc' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Scrim */}
      <div
        className="fixed inset-0 bg-[var(--sp-scrim)] backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Surface */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative z-10 w-full ${maxWidths[maxWidth]} bg-sp-surface rounded-sp-lg shadow-sp-4 border border-sp-hairline p-6 outline-none ${className}`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 id="sp-modal-title" className="sp-h3 text-sp-ink">
                {title}
              </h2>
            )}
            {description && (
              <p id="sp-modal-desc" className="sp-body-sm text-sp-muted mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-sp-muted hover:text-sp-ink p-1 rounded-sp-xs focus-visible:outline-2 focus-visible:outline-sp-primary-text"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className = '',
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[var(--sp-scrim)] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} max-w-full flex`}>
        <div className={`w-screen max-w-md bg-sp-surface shadow-sp-4 border-l border-sp-hairline p-6 flex flex-col justify-between ${className}`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-sp-hairline">
              <h3 className="sp-h3 text-sp-ink">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="text-sp-muted hover:text-sp-ink p-1 rounded-sp-xs focus-visible:outline-2 focus-visible:outline-sp-primary-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-6 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  const typeClasses = {
    success: 'bg-sp-surface border-sp-primary text-sp-ink',
    error: 'bg-sp-error-bg border-sp-error-text text-sp-error-text',
    info: 'bg-sp-surface border-sp-hairline-strong text-sp-ink',
  }[type];

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-sp-4 rounded-sp-lg border px-5 py-3 sp-body-sm font-semibold flex items-center gap-3 ${typeClasses}`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss toast"
          className="text-sp-muted hover:text-sp-ink ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center justify-center bg-sp-forest text-sp-on-primary sp-micro px-3 py-1 rounded-[20px] shadow-sp-4 whitespace-nowrap z-30 pointer-events-none transition-opacity duration-150 delay-150">
        {content}
      </div>
    </div>
  );
}
