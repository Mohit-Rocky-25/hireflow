// ============================================================
// HireFlow — Global Cloud Sync & Loud Failure Banner
// Surfaces cloud read/write failures with explicit Retry UI.
// Zero silent fallback to browser storage.
// ============================================================

import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, X, Loader2 } from 'lucide-react';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

export const CloudSyncBanner: React.FC = () => {
  const phase = useCloudSyncStore((s) => s.phase);
  const error = useCloudSyncStore((s) => s.error);
  const failedOperationLabel = useCloudSyncStore((s) => s.failedOperationLabel);
  const pendingRetry = useCloudSyncStore((s) => s.pendingRetry);
  const retryLastFailed = useCloudSyncStore((s) => s.retryLastFailed);
  const dismissError = useCloudSyncStore((s) => s.dismissError);
  const [retrying, setRetrying] = useState(false);

  if (phase === 'error' && error) {
    const handleRetry = async () => {
      if (!pendingRetry || retrying) return;
      setRetrying(true);
      try {
        await retryLastFailed();
      } finally {
        setRetrying(false);
      }
    };

    return (
      <div
        role="alert"
        aria-live="assertive"
        data-testid="cloud-sync-error-banner"
        className="w-full bg-red-950/95 border-b border-red-500/40 text-red-100 px-4 py-2.5 z-50 relative"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold text-red-200 shrink-0">
              Cloud sync failed{failedOperationLabel ? ` (${failedOperationLabel})` : ''}:
            </span>
            <span className="text-red-100/90 truncate" title={error}>
              {error}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pendingRetry && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                data-testid="cloud-sync-retry-button"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500 hover:bg-red-400 disabled:opacity-60 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {retrying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{retrying ? 'Retrying...' : 'Retry'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={dismissError}
              aria-label="Dismiss cloud error"
              className="p-1 rounded hover:bg-red-500/20 text-red-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'hydrating' || phase === 'saving') {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="cloud-sync-status"
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111318]/90 border border-white/10 text-xs text-neutral-300 shadow-lg backdrop-blur-sm pointer-events-none"
      >
        <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
        <span>{phase === 'hydrating' ? 'Syncing cloud account...' : 'Saving to cloud...'}</span>
      </div>
    );
  }

  return null;
};
