/**
 * HireFlow v4: ConfirmDialog Component (X1.7)
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

  // Escape key handler
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
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl transition-all"
      >
        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Required typed input verification */}
        {requiredConfirmationWord && (
          <div className="mt-4 rounded-lg bg-slate-950/70 p-3 border border-slate-800">
            <label htmlFor="confirm-typed-input" className="block text-xs font-medium text-slate-300">
              To proceed, please type <strong className="text-rose-400 font-mono">{requiredConfirmationWord}</strong> below:
            </label>
            <input
              id="confirm-typed-input"
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={requiredConfirmationWord}
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity focus:outline-none focus:ring-2 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 focus:ring-rose-500 disabled:opacity-40'
                : 'bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500 disabled:opacity-40'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
