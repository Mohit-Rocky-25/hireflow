import React from 'react';
import {
  CheckCheck,
  XCircle,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  Wrench
} from 'lucide-react';

export type ReviewTab = 'all' | 'rephrase' | 'skills' | 'add_context';

interface ReviewTabBarProps {
  activeTab: ReviewTab;
  onTabChange: (tab: ReviewTab) => void;
  counts: {
    all: number;
    rephrase: number;
    skills: number;
    add_context: number;
  };
  reviewedCount: number;
  totalCount: number;
  onReviewNext: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onUndoBulk?: () => void;
  showUndoToast?: boolean;
}

export const ReviewTabBar: React.FC<ReviewTabBarProps> = ({
  activeTab,
  onTabChange,
  counts,
  reviewedCount,
  totalCount,
  onAcceptAll,
  onRejectAll,
  onUndoBulk,
  showUndoToast
}) => {
  const percentComplete = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;

  const tabs: { id: ReviewTab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Revisions', count: counts.all, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'rephrase', label: 'Action Verbs', count: counts.rephrase, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'skills', label: 'Skills', count: counts.skills, icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'add_context', label: 'Impact / Metrics', count: counts.add_context, icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="sticky top-[64px] z-20 bg-white/95 backdrop-blur-md border-y border-slate-200 py-3 px-4 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Tab selection dock */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isEmpty = tab.count === 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                disabled={isEmpty && tab.id !== 'all'}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : isEmpty
                    ? 'text-slate-400 opacity-60 cursor-not-allowed'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Progress and Bulk Actions */}
        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
          {/* Progress Bar & Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-20 sm:w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              {reviewedCount}/{totalCount}
            </span>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAcceptAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accept All</span>
            </button>

            <button
              type="button"
              onClick={onRejectAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Decline All</span>
            </button>

            {showUndoToast && onUndoBulk && (
              <button
                type="button"
                onClick={onUndoBulk}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all animate-fade-in shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
