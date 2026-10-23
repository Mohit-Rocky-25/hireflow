// ============================================================
// HireFlow — Toast Notification System (High-Contrast Dark System)
// ============================================================
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// Global toast function
let globalAddToast: ((type: ToastType, message: string, duration?: number) => void) | null = null;

export function toast(type: ToastType, message: string, duration?: number) {
  if (globalAddToast) {
    globalAddToast(type, message, duration);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-volt shrink-0 stroke-[1.5px]" />,
    error: <AlertCircle className="w-5 h-5 text-danger shrink-0 stroke-[1.5px]" />,
    warning: <AlertTriangle className="w-5 h-5 text-pale-yellow shrink-0 stroke-[1.5px]" />,
    info: <Info className="w-5 h-5 text-silver shrink-0 stroke-[1.5px]" />,
  };

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 px-4 py-3 bg-near-black rounded border border-charcoal shadow-level-3 animate-fade-in text-white"
        >
          <span className="mt-0.5 shrink-0">{icons[t.type]}</span>
          <p className="text-sm text-white flex-1 font-sans">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Close notification"
            className="shrink-0 p-1 rounded text-silver hover:text-volt transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5px]" />
          </button>
        </div>
      ))}
    </div>
  );
}
