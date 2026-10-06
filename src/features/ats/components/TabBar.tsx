// ============================================================
// ATS Resume Roaster — Results Tab Bar (Stage 4)
// Exactly 4 tabs with solid dark active state and 1px inactive border
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
      className="p-1.5 rounded-[16px] bg-surface border border-border flex items-center gap-2 overflow-x-auto scrollbar-none shadow-xs"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[150px] inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-[12px] text-sm transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 border border-transparent font-medium'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
