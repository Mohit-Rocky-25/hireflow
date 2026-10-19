import React from 'react';
import { useServiceWorkerUpdate } from '../../lib/pwa/registerServiceWorker';
import { RefreshCw, X } from 'lucide-react';

export const PwaUpdateToast: React.FC = () => {
  const { updateAvailable, applyUpdate, dismissUpdate } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm p-4 bg-slate-900/95 border border-purple-500/40 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
        <RefreshCw className="w-4 h-4 animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-100">Update Available</p>
        <p className="text-[11px] text-slate-400">A new version of HireFlow is ready.</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={applyUpdate}
          className="px-2.5 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-sm"
        >
          Reload
        </button>
        <button
          onClick={dismissUpdate}
          aria-label="Dismiss update notification"
          className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
