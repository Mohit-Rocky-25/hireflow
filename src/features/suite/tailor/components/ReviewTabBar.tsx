import React, { useState } from 'react';
import {
  CheckCheck,
  XCircle,
  RotateCcw,
  ArrowDown,
  Sparkles,
  Layers,
  HelpCircle,
  Wrench
} from 'lucide-react';
import { SuggestionType } from '../../../../lib/tailorEngine/engine';

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
  onReviewNext,
  onAcceptAll,
  onRejectAll,
  onUndoBulk,
  showUndoToast
}) => {
  const percentComplete = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;

  const tabs: { id: ReviewTab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', count: counts.all, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'rephrase', label: 'Rephrase', count: counts.rephrase, icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'skills', label: 'Skills', count: counts.skills, icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'add_context', label: 'Add Context', count: counts.add_context, icon: <HelpCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="sticky top-[64px] z-20 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-850 py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Tab selection */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isEmpty = tab.count === 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                disabled={isEmpty && tab.id !== 'all'}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                    : isEmpty
                    ? 'text-zinc-600 opacity-50 cursor-not-allowed'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-600/30 text-indigo-300' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Progress and Bulk Actions */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          {/* Progress Bar & Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-20 md:w-28 bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400 whitespace-nowrap font-medium">
              {reviewedCount} of {totalCount} reviewed
            </span>
          </div>

          {/* Review Next */}
          <button
            type="button"
            onClick={onReviewNext}
            disabled={reviewedCount >= totalCount}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Review next</span>
          </button>

          {/* Bulk Accept / Reject */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onAcceptAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition-colors"
              title="Accept all ready suggestions (skips uncompleted items)"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Accept All</span>
            </button>

            <button
              type="button"
              onClick={onRejectAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-800/60 transition-colors"
              title="Reject all pending suggestions"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reject All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Undo Toast */}
      {showUndoToast && onUndoBulk && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-2">
          <span className="text-xs text-zinc-200 font-medium">Bulk action applied.</span>
          <button
            type="button"
            onClick={onUndoBulk}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-950/60 border border-indigo-800/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        </div>
      )}
    </div>
  );
};
