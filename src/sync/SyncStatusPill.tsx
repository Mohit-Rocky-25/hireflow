import React, { useState } from 'react';
import { useSyncStore } from './useSyncStore';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { syncEngine } from './syncEngine';
import { Cloud, Check, RefreshCw, WifiOff, AlertTriangle, Trash2 } from 'lucide-react';

export const SyncStatusPill: React.FC = () => {
  const { status, pendingCount, lastSyncedAt, lastError } = useSyncStore();
  const { deleteAllCloudData, status: authStatus } = useAuthStore();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthenticated = authStatus === 'authenticated';

  const getLabelAndIcon = () => {
    if (!isAuthenticated || status === 'local_only') {
      return { label: 'Local only', icon: <Cloud className="w-3.5 h-3.5 text-neutral-500" /> };
    }
    if (status === 'syncing') {
      return { label: `Syncing (${pendingCount})`, icon: <RefreshCw className="w-3.5 h-3.5 text-[#faff69] animate-spin" /> };
    }
    if (status === 'offline') {
      return { label: `Offline - ${pendingCount} pending`, icon: <WifiOff className="w-3.5 h-3.5 text-neutral-400" /> };
    }
    if (status === 'degraded') {
      return { label: 'Needs attention', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> };
    }
    return { label: 'Synced', icon: <Check className="w-3.5 h-3.5 text-[#faff69]" /> };
  };

  const { label, icon } = getLabelAndIcon();

  const handleRetry = () => {
    void syncEngine.flush();
  };

  const handleDeleteCloudData = async () => {
    setIsDeleting(true);
    try {
      await deleteAllCloudData();
      setConfirmDelete(false);
      setPopoverOpen(false);
    } catch {
      // ignore
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setPopoverOpen(!popoverOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono border border-neutral-800 bg-[#10100d] text-neutral-300 hover:border-neutral-700 transition-colors focus:outline-none focus:ring-1 focus:ring-[#faff69]"
        title="Sync status"
      >
        {icon}
        <span>{label}</span>
      </button>

      {popoverOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-[#141410] border border-neutral-800 p-4 shadow-2xl z-50 text-neutral-300 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80 mb-3">
            <span className="font-semibold text-neutral-100">Sync Details</span>
            <span className="text-[10px] text-neutral-500">{label}</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-neutral-400 mb-4">
            <div>Pending operations: <span className="text-neutral-200">{pendingCount}</span></div>
            <div>
              Last synced:{' '}
              <span className="text-neutral-200">
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            {lastError && (
              <div className="text-amber-400 text-[10px] break-words">
                Error: {lastError}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
            <button
              onClick={handleRetry}
              className="w-full px-3 py-1.5 rounded text-[11px] font-semibold bg-[#181814] hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition-colors"
            >
              Retry now
            </button>

            {isAuthenticated && (
              <>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full px-3 py-1.5 rounded text-[10px] text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete all my cloud data
                  </button>
                ) : (
                  <div className="p-2 rounded bg-red-950/30 border border-red-900/50 space-y-2">
                    <div className="text-[10px] text-red-300 leading-tight">
                      Permanently erase all cloud snapshots and audits?
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => void handleDeleteCloudData()}
                        disabled={isDeleting}
                        className="flex-1 py-1 text-[10px] rounded bg-red-600 hover:bg-red-500 text-white font-semibold"
                      >
                        {isDeleting ? 'Erasing...' : 'Yes, erase'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-1 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
