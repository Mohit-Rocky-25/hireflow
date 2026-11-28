import React from 'react';
import { Cloud, FlaskConical, RefreshCw, AlertCircle, UserCheck } from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

interface WorkspaceStatusPillProps {
  isDemoOverride?: boolean;
  statusOverride?: string;
}

export const WorkspaceStatusPill: React.FC<WorkspaceStatusPillProps> = ({
  isDemoOverride,
  statusOverride,
}) => {
  const { status: storeStatus, isDemo: storeIsDemo } = useAuthStore();
  const status = statusOverride ?? storeStatus;
  const isDemo = isDemoOverride ?? storeIsDemo;
  const syncPhase = useCloudSyncStore((s) => s.phase);
  const syncError = useCloudSyncStore((s) => s.error);
  const retryLastFailed = useCloudSyncStore((s) => s.retryLastFailed);

  if (isDemo) {
    return (
      <span
        title="Demo workspace runs in session memory (RAM) only and does not sync to Supabase."
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#faff69]/35 bg-[#faff69]/10 text-[#faff69] font-mono text-[11px] font-semibold"
      >
        <FlaskConical className="w-3.5 h-3.5 shrink-0" />
        <span>Demo Session · RAM Only</span>
      </span>
    );
  }

  if (status === 'authenticated') {
    if (syncPhase === 'error') {
      return (
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-rose-500/40 bg-rose-950/40 text-rose-200 font-mono text-[11px] font-semibold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate max-w-[180px]">{syncError || 'Cloud sync error'}</span>
          <button
            type="button"
            onClick={() => void retryLastFailed()}
            className="underline hover:text-white cursor-pointer"
          >
            Retry
          </button>
        </span>
      );
    }
    if (syncPhase === 'hydrating' || syncPhase === 'saving') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#24241c] bg-[#16160f] text-[#f1f1e8] font-mono text-[11px] font-semibold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none text-[#faff69]" />
          <span>{syncPhase === 'hydrating' ? 'Restoring cloud...' : 'Saving...'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/35 bg-emerald-950/30 text-emerald-300 font-mono text-[11px] font-semibold">
        <Cloud className="w-3.5 h-3.5 shrink-0" />
        <span>Cloud Synced</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#24241c] bg-[#16160f] text-[#9b9b8c] font-mono text-[11px] font-semibold">
      <UserCheck className="w-3.5 h-3.5 shrink-0" />
      <span>Guest Session · RAM Only</span>
    </span>
  );
};
