import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Shield } from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { WorkspaceStatusPill } from './WorkspaceStatusPill';

interface DataSessionSectionProps {
  workspacesCount: number;
  versionsCount: number;
  tailoringDraftsCount: number;
  exportArtifactsCount: number;
  auditsCount: number;
  savedJdsCount: number;
  planItemsCount: number;
  outreachDraftsCount: number;
}

export const DataSessionSection: React.FC<DataSessionSectionProps> = ({
  workspacesCount,
  versionsCount,
  tailoringDraftsCount,
  exportArtifactsCount,
  auditsCount,
  savedJdsCount,
  planItemsCount,
  outreachDraftsCount,
}) => {
  const { isDemo, status } = useAuthStore();

  const metrics = [
    { label: 'Resume Workspaces', value: workspacesCount, to: '/my-space/resumes' },
    { label: 'Resume Versions', value: versionsCount, to: '/my-space/resumes' },
    { label: 'Tailoring Drafts', value: tailoringDraftsCount, to: '/my-space/resumes' },
    { label: 'Export Artifacts', value: exportArtifactsCount, to: '/my-space/resumes' },
    { label: 'ATS & TL Audits', value: auditsCount, to: '/my-space/scans' },
    { label: 'Saved JDs', value: savedJdsCount, to: '/my-space/jds' },
    { label: 'Plan Items', value: planItemsCount, to: '/my-space/plan' },
    { label: 'Outreach Drafts', value: outreachDraftsCount, to: '/my-space/outreach' },
  ];

  return (
    <div className="max-w-[960px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase mb-1">
            Storage &amp; Privacy
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f1e8]">
            Data &amp; Session
          </h1>
          <div className="mt-2">
            <WorkspaceStatusPill />
          </div>
        </div>
        <Link
          to="/data"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs hover:bg-[#ebf059]"
        >
          <span>Open Full Data &amp; Storage Center</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] flex items-start gap-3 text-xs text-[#9b9b8c]">
        <Shield className="w-4 h-4 text-[#faff69] shrink-0 mt-0.5" />
        <p>
          {isDemo || status !== 'authenticated'
            ? 'Resume text, audits, and tailoring drafts remain strictly in transient in-memory session stores during Demo/Guest usage and are not synced permanently to external storage.'
            : 'Authenticated workspace assets sync via explicit CloudRepository boundaries without writing resume PII into browser localStorage or IndexedDB.'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        {metrics.map((m) => (
          <Link
            key={m.label}
            to={m.to}
            className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 transition-colors"
          >
            <div className="text-[#9b9b8c]">{m.label}</div>
            <div className="text-2xl font-bold text-[#f1f1e8] mt-1 tabular-nums">{m.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};
