import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, TrendingUp } from 'lucide-react';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { formatDelta } from '@/features/journal/deltaEngine';

interface HistorySectionProps {
  onSelectAudit: (auditId: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onSelectAudit }) => {
  const entries = useAuditStore((s) => s.entries);
  const scans = useScanHistoryStore((s) => s.scans);
  const [query, setQuery] = useState('');
  const [toolFilter, setToolFilter] = useState<'all' | 'ats' | 'talentlens'>('all');

  const rows = useMemo(() => {
    const seen = new Set<string>();
    const combined: Array<{
      id: string;
      title: string;
      resumeLabel: string;
      tool: string;
      kind: 'ats' | 'talentlens';
      score: number;
      deltaPts: number | null;
      createdAt: string;
      inspectable: boolean;
    }> = [];

    for (const a of Object.values(entries)) {
      seen.add(a.id);
      combined.push({
        id: a.id,
        title: [a.jd.company, a.jd.roleTitle].filter(Boolean).join(', ') || 'Target Evaluation',
        resumeLabel: a.resume.label,
        tool: a.kind === 'talentlens' ? 'TalentLens' : 'ATS Roast',
        kind: a.kind === 'talentlens' ? 'talentlens' : 'ats',
        score: a.overallScore,
        deltaPts: a.delta?.overallDeltaPts ?? null,
        createdAt: a.createdAt,
        inspectable: true,
      });
    }

    for (const s of scans) {
      if (seen.has(s.id)) continue;
      combined.push({
        id: s.id,
        title: s.targetLabel,
        resumeLabel: s.resumeLabel,
        tool: s.tool,
        kind: s.tool.toLowerCase().includes('talent') ? 'talentlens' : 'ats',
        score: s.scores.overall ?? 0,
        deltaPts: null,
        createdAt: s.createdAt,
        inspectable: false,
      });
    }

    const q = query.trim().toLowerCase();
    return combined
      .filter((r) => (toolFilter === 'all' ? true : r.kind === toolFilter))
      .filter((r) =>
        !q
          ? true
          : r.title.toLowerCase().includes(q) ||
            r.resumeLabel.toLowerCase().includes(q) ||
            r.tool.toLowerCase().includes(q)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [entries, scans, query, toolFilter]);

  return (
    <div className="max-w-[1000px] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase mb-1">
            Evaluations
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f1f1e8]">
            Score Progression
          </h1>
          <p className="text-sm text-[#9b9b8c] mt-1">
            Chronological history across ATS Resume Roaster and TalentLens evaluations.
          </p>
        </div>
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#24241c] bg-[#10100d] text-xs font-semibold text-[#faff69] hover:border-[#faff69]/40 transition-colors"
        >
          <span>Open Full Progression Compare</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#10100d] border border-[#24241c]">
          {(['all', 'ats', 'talentlens'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setToolFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                toolFilter === tab
                  ? 'bg-[#1b1b15] text-[#faff69]'
                  : 'text-[#9b9b8c] hover:text-[#f1f1e8]'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'ats' ? 'ATS Roast' : 'TalentLens'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9b9b8c]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by role or resume..."
            aria-label="Filter score progression"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#10100d] border border-[#24241c] text-xs text-[#f1f1e8] placeholder-[#9b9b8c]/70 focus:outline-none focus:border-[#faff69]"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 rounded-xl border border-[#24241c] bg-[#10100d] text-center space-y-3">
          <TrendingUp className="w-7 h-7 text-[#9b9b8c] mx-auto" />
          <p className="text-sm text-[#9b9b8c]">
            {query || toolFilter !== 'all'
              ? 'No evaluation records match your current filter.'
              : 'No scan progression records in this session yet.'}
          </p>
          <Link
            to="/tools/resume-checker"
            className="inline-block px-5 py-2 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider"
          >
            Run ATS Resume Roaster
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#1b1b15] border border-[#24241c] rounded-xl bg-[#10100d] px-5">
          {rows.map((r) => (
            <div key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#f1f1e8] truncate">{r.title}</div>
                <div className="text-xs text-[#9b9b8c] mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{r.resumeLabel}</span>
                  <span>&middot;</span>
                  <span>{r.tool}</span>
                  <span>&middot;</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-base font-bold text-[#faff69] tabular-nums">
                  {r.score}/100
                </span>
                {r.deltaPts !== null && (
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                      r.deltaPts >= 0
                        ? 'text-[#faff69] bg-[#faff69]/10'
                        : 'text-[#ff8a70] bg-[#ff8a70]/10'
                    }`}
                  >
                    {formatDelta(r.deltaPts)}
                  </span>
                )}
                {r.inspectable && (
                  <button
                    type="button"
                    onClick={() => onSelectAudit(r.id)}
                    className="px-3 py-1 rounded-full border border-[#24241c] text-xs font-semibold text-[#f1f1e8] hover:border-[#faff69]/40 cursor-pointer"
                  >
                    Inspect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
