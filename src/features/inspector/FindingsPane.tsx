import React, { useState } from 'react';
import type { AuditEntry } from '@/domain/types';
import { usePortalStore } from '@/features/portal/usePortalStore';
import { BarChart3, AlertCircle, CheckCircle2, FileText, Code2, Plus, Check } from 'lucide-react';

interface FindingsPaneProps {
  audit: AuditEntry;
  jdText: string | null;
  activeTab: 'breakdown' | 'gaps' | 'strengths' | 'jd' | 'raw';
  onTabChange: (tab: 'breakdown' | 'gaps' | 'strengths' | 'jd' | 'raw') => void;
  selectedFindingId: string | null;
  onSelectFinding: (id: string | null) => void;
}

export const FindingsPane: React.FC<FindingsPaneProps> = ({
  audit,
  jdText,
  activeTab,
  onTabChange,
  selectedFindingId,
  onSelectFinding,
}) => {
  const addPlanItem = usePortalStore((s) => s.addPlanItem);
  const planItems = usePortalStore((s) => s.planItems);

  const [addedGapIds, setAddedGapIds] = useState<Set<string>>(() => {
    const existing = new Set<string>();
    for (const item of Object.values(planItems)) {
      if (item.linkedGapIds) {
        item.linkedGapIds.forEach((id) => existing.add(id));
      }
    }
    return existing;
  });

  const handleAddGapToPlan = (gapId: string, label: string) => {
    addPlanItem({
      kind: 'build_brief',
      refId: gapId,
      title: `Resolve: ${label}`,
      status: 'planned',
      linkedGapIds: [gapId],
      targetKey: audit.targetKey,
      addedFromAuditId: audit.id,
    });
    setAddedGapIds((prev) => new Set([...prev, gapId]));
  };

  const tabs: Array<{ id: 'breakdown' | 'gaps' | 'strengths' | 'jd' | 'raw'; label: string; count?: number }> = [
    { id: 'breakdown', label: 'Breakdown' },
    { id: 'gaps', label: 'Gaps', count: audit.gaps.length },
    { id: 'strengths', label: 'Strengths', count: audit.strengths.length },
    { id: 'jd', label: 'Job Description' },
    { id: 'raw', label: 'Raw Audit' },
  ];

  return (
    <div className="w-full lg:w-[480px] bg-[#10100d] border border-neutral-800 rounded flex flex-col min-h-[500px]">
      {/* Tabs */}
      <div className="p-2 border-b border-neutral-800 flex items-center gap-1 font-mono text-xs overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#141410] text-[#faff69] border border-[#faff69]/30 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[10px] text-neutral-500">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[700px] font-mono text-xs">
        {/* 1. Breakdown */}
        {activeTab === 'breakdown' && (
          <div className="space-y-4">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
              Dimensional Subscores
            </div>
            {audit.breakdown.length === 0 ? (
              <div className="text-neutral-500 py-6 text-center">No dimension breakdown available</div>
            ) : (
              audit.breakdown.map((item) => {
                const pct = Math.min(100, Math.max(0, item.score));
                return (
                  <div key={item.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span>{item.label}</span>
                      <span className="font-bold text-neutral-100">{item.score}/100</span>
                    </div>
                    <div className="w-full h-2 bg-[#090907] border border-neutral-800 rounded overflow-hidden">
                      <div
                        className="h-full bg-[#faff69] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. Gaps */}
        {activeTab === 'gaps' && (
          <div className="space-y-3">
            {audit.gaps.length === 0 ? (
              <div className="text-neutral-500 py-6 text-center">No critical gaps detected</div>
            ) : (
              audit.gaps.map((gap) => {
                const isSelected = selectedFindingId === gap.id;
                const isAdded = addedGapIds.has(gap.id);

                return (
                  <div
                    key={gap.id}
                    onClick={() => onSelectFinding(gap.id)}
                    className={`p-3 rounded border transition-colors cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-[#faff69] bg-[#141410]'
                        : 'border-neutral-800 bg-[#0c0c0a] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            gap.severity === 3
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : gap.severity === 2
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                          }`}
                        >
                          {gap.severity === 3 ? 'High' : gap.severity === 2 ? 'Medium' : 'Low'}
                        </span>
                        <span className="font-semibold text-neutral-200 truncate">
                          {gap.label}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAdded) handleAddGapToPlan(gap.id, gap.label);
                        }}
                        disabled={isAdded}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                          isAdded
                            ? 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            : 'bg-[#141410] text-[#faff69] hover:bg-neutral-800 border border-[#faff69]/30'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>In Plan</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Add to Plan</span>
                          </>
                        )}
                      </button>
                    </div>

                    {gap.detail && (
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {gap.detail}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. Strengths */}
        {activeTab === 'strengths' && (
          <div className="space-y-2">
            {audit.strengths.length === 0 ? (
              <div className="text-neutral-500 py-6 text-center">No explicit strengths listed</div>
            ) : (
              audit.strengths.map((str, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded border border-neutral-800 bg-[#0c0c0a] flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-neutral-300 text-[11px] leading-relaxed">
                    {str}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. Job Description */}
        {activeTab === 'jd' && (
          <div className="space-y-3">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Exact Frozen Target JD
            </div>
            {jdText ? (
              <div className="p-3 bg-[#090907] border border-neutral-800 rounded text-neutral-300 text-[11px] whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar">
                {jdText}
              </div>
            ) : (
              <div className="text-neutral-500 py-6 text-center">Job description snapshot unavailable</div>
            )}
          </div>
        )}

        {/* 5. Raw Audit JSON */}
        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
              Raw Audit Payload
            </div>
            <pre className="p-3 bg-[#090907] border border-neutral-800 rounded text-neutral-400 text-[10px] overflow-x-auto max-h-[600px] custom-scrollbar font-mono">
              {JSON.stringify(audit.findingsJson, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

