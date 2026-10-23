/**
 * HireFlow: ConfirmDialog Component (High-Contrast Dark System)
 * Accessible modal dialog for user confirmation with support for destructive actions
 * and required typed verification strings (e.g. typing "CLEAR" to erase data).
 */

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requiredConfirmationWord?: string;
  ariaLabel?: string;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  requiredConfirmationWord,
  ariaLabel,
}: ConfirmDialogProps) {
  const [typedInput, setTypedInput] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTypedInput('');
      previouslyFocusedElement.current = document.activeElement as HTMLElement;

      const timer = setTimeout(() => {
        if (dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'input, button:not([disabled])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
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
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isConfirmationSatisfied =
    !requiredConfirmationWord || typedInput.trim().toUpperCase() === requiredConfirmationWord.toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-lg border border-charcoal bg-black p-6 text-white shadow-level-3 animate-fade-in"
      >
        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-near-black border border-danger/60 text-danger">
              <AlertTriangle className="h-5 w-5 stroke-[1.5px]" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-[18px] font-bold text-white tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-silver leading-relaxed">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded p-1.5 text-silver hover:bg-hover-gray hover:text-volt focus-visible:outline-2 focus-visible:outline-volt"
          >
            <X className="h-4 w-4 stroke-[1.5px]" />
          </button>
        </div>

        {/* Required typed input verification */}
        {requiredConfirmationWord && (
          <div className="mt-4 rounded bg-near-black p-3.5 border border-charcoal">
            <label htmlFor="confirm-typed-input" className="block text-xs font-semibold uppercase tracking-[1.2px] text-silver">
              To proceed, please type <strong className="text-danger font-mono font-bold">{requiredConfirmationWord}</strong> below:
            </label>
            <input
              id="confirm-typed-input"
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={requiredConfirmationWord}
              className="mt-2 w-full rounded border border-charcoal bg-black px-3.5 py-2 text-sm text-white placeholder:text-silver/50 focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-charcoal bg-near-black px-4 py-2 text-sm font-semibold text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={!isConfirmationSatisfied}
            onClick={() => {
              if (isConfirmationSatisfied) {
                onConfirm();
              }
            }}
            className={`rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-volt active:shadow-inset ${
              isDestructive
                ? 'bg-near-black text-danger border border-danger/80 hover:bg-danger/20 active:text-pale-yellow'
                : 'bg-forest text-white border border-[#141414] hover:bg-hover-gray active:text-pale-yellow'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
