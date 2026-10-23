// ============================================================
// ATS Resume Roaster — Results Tab Bar (Stage 4)
// Exactly 4 tabs with solid dark active state and 1px volt border
// ============================================================

import React from 'react';
import { BarChart3, Layers, FileCheck, Compass } from 'lucide-react';

export type ReportTabId = 'overview' | 'skills' | 'audit' | 'learning_path';

interface Props {
  activeTab: ReportTabId;
  skillsCount: number;
  onTabChange: (tab: ReportTabId) => void;
  tabBarRef?: React.RefObject<HTMLDivElement | null>;
}

export const TabBar: React.FC<Props> = ({
  activeTab,
  skillsCount,
  onTabChange,
  tabBarRef,
}) => {
  const tabs = [
    { id: 'overview' as const, label: '1. Overview', icon: BarChart3 },
    { id: 'skills' as const, label: `2. Skills (${skillsCount})`, icon: Layers },
    { id: 'audit' as const, label: '3. Resume Audit', icon: FileCheck },
    { id: 'learning_path' as const, label: '4. Learning Path', icon: Compass },
  ];

  return (
    <div
      ref={tabBarRef as any}
      className="p-1.5 rounded-lg bg-near-black border border-charcoal flex items-center gap-2 overflow-x-auto scrollbar-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded text-xs font-semibold uppercase tracking-[1.2px] transition-colors duration-150 cursor-pointer select-none ${
              isActive
                ? 'bg-black text-volt border border-volt shadow-level-4 font-bold'
                : 'bg-transparent text-silver hover:text-white hover:bg-hover-gray border border-transparent font-medium'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0 stroke-[1.5px]" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
