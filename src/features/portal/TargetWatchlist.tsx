import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalStore } from './usePortalStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { buildWatchlistRows, type WatchlistRow } from './portalSelectors';
import { Panel } from './components/Panel';
import { EmptyState } from './components/EmptyState';
import { ScoreSparkline } from './ScoreSparkline';
import { slug } from '@/domain/ids';
import { Plus, Trash2, ArrowUpRight, Search } from 'lucide-react';

import type { AuditEntry, Uuid, WatchlistTarget } from '@/domain/types';

interface TargetWatchlistProps {
  watchlist?: Record<Uuid, WatchlistTarget>;
  entries?: Record<Uuid, AuditEntry>;
}

export const TargetWatchlist: React.FC<TargetWatchlistProps> = ({
  watchlist: propWatchlist,
  entries: propEntries,
}) => {
  const navigate = useNavigate();
  const storeWatchlist = usePortalStore((s) => s.watchlist);
  const watchlist = propWatchlist ?? storeWatchlist;
  const addWatchlistTarget = usePortalStore((s) => s.addWatchlistTarget);
  const removeWatchlistTarget = usePortalStore((s) => s.removeWatchlistTarget);
  const storeEntries = useAuditStore((s) => s.entries);
  const entries = propEntries ?? storeEntries;

  const [isAdding, setIsAdding] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');

  const rows: WatchlistRow[] = buildWatchlistRows(
    Object.values(watchlist),
    Object.values(entries)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const c = companyName.trim();
    const r = roleTitle.trim();
    if (!c) return;

    const targetKey = r ? `${slug(c)}:${slug(r)}` : slug(c);
    addWatchlistTarget({
      targetKey,
      companyName: c,
      roleTitle: r || undefined,
    });

    setCompanyName('');
    setRoleTitle('');
    setIsAdding(false);
  };

  const handleScan = (row: WatchlistRow) => {
    const params = new URLSearchParams();
    params.set('company', row.target.companyName);
    if (row.target.roleTitle) {
      params.set('role', row.target.roleTitle);
    }
    navigate(`/tools/resume-checker?${params.toString()}`);
  };

  return (
    <Panel
      title="Target Watchlist"
      count={rows.length}
      subtitle="Track benchmark fit, gaps, and historical progression across roles"
      action={
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded border border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Target</span>
        </button>
      }
    >
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-4 p-3 rounded border border-neutral-800 bg-[#141410] font-mono text-xs flex flex-wrap gap-2 items-center"
        >
          <input
            type="text"
            placeholder="Company (e.g. Google)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded bg-[#090907] border border-neutral-700 text-neutral-100 placeholder-neutral-500 outline-none focus:border-[#faff69]"
            autoFocus
          />
          <input
            type="text"
            placeholder="Role (e.g. Software Engineer)"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded bg-[#090907] border border-neutral-700 text-neutral-100 placeholder-neutral-500 outline-none focus:border-[#faff69]"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!companyName.trim()}
              className="px-3 py-1.5 rounded bg-[#faff69] text-black font-semibold hover:bg-[#e5eb5d] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1.5 rounded border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <EmptyState
          message="No target companies or roles added yet"
          description="Add companies and positions to monitor your ATS score trajectories, resolve gaps, and keep historical snapshots."
          action={{
            label: "Add your first target",
            onClick: () => setIsAdding(true),
          }}
        />
      ) : (
        <div className="space-y-2">
          {rows.map((row) => {
            const delta = row.latestDeltaPts;
            return (
              <div
                key={row.target.id}
                className="p-3 rounded border border-neutral-800 bg-[#0c0c0a] hover:border-neutral-700 transition-colors font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Target Information */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-100 truncate">
                      {row.target.companyName}
                    </span>
                    <span className="text-neutral-600">/</span>
                    <span className="text-neutral-300 truncate">
                      {row.target.roleTitle || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                    <span>
                      {row.lastAuditAt
                        ? `Last scanned ${new Date(row.lastAuditAt).toLocaleDateString()}`
                        : 'Never scanned'}
                    </span>
                    <span>•</span>
                    <span className={row.openGapCount > 0 ? 'text-amber-400/90' : 'text-neutral-500'}>
                      {row.openGapCount} {row.openGapCount === 1 ? 'gap' : 'gaps'}
                    </span>
                  </div>
                </div>

                {/* Score & Progression Sparkline */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-neutral-100 text-sm">
                        {row.latestScore !== null ? `${row.latestScore}` : '—'}
                      </span>
                      {row.latestScore !== null && (
                        <span className="text-[10px] text-neutral-500">/100</span>
                      )}
                      {delta !== null && delta !== 0 && (
                        <span
                          className={`text-[10px] font-semibold px-1 py-0.2 rounded ${
                            delta > 0
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}%
                        </span>
                      )}
                    </div>
                    {row.bestScore !== null && (
                      <span className="text-[10px] text-neutral-500">
                        Peak: {row.bestScore}
                      </span>
                    )}
                  </div>

                  {row.sparkline.length > 0 && (
                    <div className="hidden sm:block">
                      <ScoreSparkline data={row.sparkline} width={56} height={20} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <button
                      type="button"
                      onClick={() => handleScan(row)}
                      title="Run new scan for this target"
                      className="p-1.5 rounded border border-neutral-800 bg-[#141410] text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>

                    {row.lastAuditId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/portal/audits/${row.lastAuditId}`)}
                        title="Inspect latest audit"
                        className="p-1.5 rounded border border-neutral-800 bg-[#141410] text-neutral-300 hover:text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeWatchlistTarget(row.target.id)}
                      title="Remove from watchlist"
                      className="p-1.5 rounded border border-neutral-800 bg-[#141410] text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
