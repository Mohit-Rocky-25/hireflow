import React from 'react';
import { Link } from 'react-router-dom';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { PortalHeader } from './PortalHeader';
import { KpiStrip } from './KpiStrip';
import { TargetWatchlist } from './TargetWatchlist';
import { AuditTimeline } from './AuditTimeline';
import { ExecutionPlan } from './ExecutionPlan';
import { OutreachVault } from './OutreachVault';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { usePortalStore } from './usePortalStore';
import { FileText, Cpu, Compass, Download } from 'lucide-react';

const PortalContent: React.FC = () => {
  const entries = useAuditStore((s) => s.entries);
  const planItems = usePortalStore((s) => s.planItems);

  const entryList = Object.values(entries);
  const planList = Object.values(planItems);

  return (
    <div className="min-h-screen bg-[#090907] text-neutral-200">
      <PortalHeader />

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Quick Action Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded border border-neutral-800 bg-[#10100d] font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Jump to workspace:</span>
            <Link
              to="/portal/resumes"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume Matrix</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tools/resume-checker"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-[#141410] text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Launch ATS Roaster</span>
            </Link>
            <Link
              to="/demo/company-roles"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-800 bg-[#141410] text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>TalentLens Hub</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Strip */}
        <KpiStrip entries={entryList} planItems={planList} />

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Watchlist & Historical Audit Timeline */}
          <div className="lg:col-span-7 space-y-6">
            <TargetWatchlist />
            <AuditTimeline />
          </div>

          {/* Right Column (5 cols): Execution Plan & Outreach Vault */}
          <div className="lg:col-span-5 space-y-6">
            <ExecutionPlan />
            <OutreachVault />
          </div>
        </div>
      </main>
    </div>
  );
};

export const PortalPage: React.FC<{ isAuthenticated?: boolean }> = ({ isAuthenticated }) => {
  return (
    <RequireAuth isAuthenticated={isAuthenticated}>
      <PortalContent />
    </RequireAuth>
  );
};

export default PortalPage;
