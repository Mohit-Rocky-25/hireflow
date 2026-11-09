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
      className="fixed bottom-5 right-5 z-50 max-w-sm p-4 bg-near-black border border-charcoal rounded-lg shadow-level-3 flex items-center gap-3 animate-fade-in text-white"
    >
      <div className="w-8 h-8 rounded bg-black border border-charcoal text-volt flex items-center justify-center shrink-0">
        <RefreshCw className="w-4 h-4 animate-spin stroke-[1.5px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-[1.2px] text-white">Update Available</p>
        <p className="text-[11px] text-silver mt-0.5">A new version of HireFlow is ready.</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={applyUpdate}
          className="px-3 py-1.5 text-xs font-bold uppercase tracking-[1.2px] bg-volt text-text-on-accent border border-volt hover:bg-[#1d1d1d] hover:text-white rounded transition-colors active:text-pale-yellow active:shadow-inset"
        >
          Reload
        </button>
        <button
          onClick={dismissUpdate}
          aria-label="Dismiss update notification"
          className="p-1 text-silver hover:text-volt transition-colors rounded"
        >
          <X className="w-4 h-4 stroke-[1.5px]" />
        </button>
      </div>
    </div>
  );
};
