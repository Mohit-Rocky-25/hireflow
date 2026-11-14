import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMySpaceStore } from './useMySpaceStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { buildWatchlistRows, type WatchlistRow } from './mySpaceSelectors';
import { formatDelta } from '@/features/journal/deltaEngine';
import { toast } from '@/components/ui/Toast';
import { slug } from '@/domain/ids';
import { Plus, Trash2 } from 'lucide-react';
import type { AuditEntry, WatchlistTarget } from '@/domain/types';

interface TargetsSectionProps {
  onSelectAudit?: (auditId: string) => void;
  watchlist?: Record<string, WatchlistTarget>;
  entries?: Record<string, AuditEntry>;
}

export const TargetsSection: React.FC<TargetsSectionProps> = ({
  onSelectAudit = () => {},
  watchlist: propWatchlist,
  entries: propEntries,
}) => {
  const navigate = useNavigate();
  const storeWatchlist = useMySpaceStore((s) => s.watchlist);
  const addWatchlistTarget = useMySpaceStore((s) => s.addWatchlistTarget);
  const removeWatchlistTarget = useMySpaceStore((s) => s.removeWatchlistTarget);
  const restoreWatchlistTarget = useMySpaceStore((s) => s.restoreWatchlistTarget);
  const storeEntries = useAuditStore((s) => s.entries);

  const watchlist = propWatchlist ?? storeWatchlist;
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

  const handleRemove = (target: WatchlistTarget) => {
    removeWatchlistTarget(target.id);
    toast('info', 'Removed target.', 8000, {
      label: 'Undo',
      onClick: () => {
        restoreWatchlistTarget(target);
      },
    });
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
    <div className="max-w-[900px]">
      <div className="flex justify-between items-baseline mb-2">
        <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6d6d61] uppercase">
          Target Watchlist
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#24241c] bg-[#16160f] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 hover:text-[#faff69] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add target</span>
        </button>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-[#f1f1e8] mb-6">
        Targets
      </h2>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="mb-6 p-4 rounded-xl border border-[#24241c] bg-[#10100d] flex flex-wrap gap-3 items-center"
        >
          <input
            type="text"
            placeholder="Company name (e.g. Razorpay)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
            autoFocus
          />
          <input
            type="text"
            placeholder="Role title (e.g. Software Engineer)"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-sm outline-none focus:border-[#faff69]"
          />
          <button
            type="submit"
            className="h-[38px] px-4 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors cursor-pointer shrink-0"
          >
            Save Target
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="h-[38px] px-3 rounded-full border border-[#24241c] text-[#9b9b8c] text-xs font-semibold hover:text-[#f1f1e8] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {rows.length === 0 ? (
        <div className="py-12 text-center border border-[#24241c] rounded-xl bg-[#10100d] p-8">
          <p className="text-[#9b9b8c] text-sm mb-4">No targets tracked yet.</p>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-block px-5 py-2.5 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors cursor-pointer"
          >
            Add Your First Target
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#1b1b15] border border-[#24241c] rounded-xl bg-[#10100d] px-5">
          {rows.map((row) => {
            const hasScans = row.latestScore !== null;
            return (
              <div
                key={row.target.id}
                className="py-4 flex max-sm:flex-col sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-base text-[#f1f1e8]">
                    {row.target.companyName}
                  </div>
                  {row.target.roleTitle && (
                    <div className="text-xs text-[#9b9b8c] mt-0.5">{row.target.roleTitle}</div>
                  )}
                  {hasScans ? (
                    <div className="text-xs text-[#6d6d61] mt-1 flex items-center gap-3">
                      <span>
                        {row.openGapCount} open {row.openGapCount === 1 ? 'gap' : 'gaps'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#6d6d61] mt-1">Not scanned yet</div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {hasScans ? (
                    <>
                      <div className="text-right font-mono tabular-nums">
                        <span className="text-base font-bold text-[#f1f1e8]">
                          {row.latestScore} <small className="text-[#6d6d61] font-normal text-xs">of 100</small>
                        </span>
                        {row.latestDeltaPts !== null && (
                          <span
                            className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              row.latestDeltaPts >= 0
                                ? 'text-[#faff69] bg-[#faff69]/10'
                                : 'text-[#ff8a70] bg-[#ff8a70]/10'
                            }`}
                          >
                            {formatDelta(row.latestDeltaPts)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleScan(row)}
                        className="px-3 py-1.5 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 hover:text-[#faff69] transition-colors cursor-pointer"
                      >
                        Scan again
                      </button>

                      {row.lastAuditId && (
                        <button
                          type="button"
                          onClick={() => onSelectAudit(row.lastAuditId!)}
                          className="px-3 py-1.5 rounded-full bg-[#16160f] border border-[#24241c] text-xs font-semibold text-[#faff69] hover:bg-[#24241c] transition-colors cursor-pointer"
                        >
                          Open latest scan
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleScan(row)}
                      className="px-4 py-2 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors cursor-pointer"
                    >
                      Scan against this role
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={`Remove ${row.target.companyName}`}
                    onClick={() => handleRemove(row.target)}
                    className="p-2 rounded-full text-[#6d6d61] hover:text-[#ff8a70] hover:bg-[#16160f] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

