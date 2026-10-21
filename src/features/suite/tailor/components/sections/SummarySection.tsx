import React from 'react';
import { FileText } from 'lucide-react';
import { TailoredSection } from '../../../../../lib/tailor/types';

export interface SummarySectionProps {
  summarySection: TailoredSection;
  updateSummaryText: (text: string) => void;
}

export function SummarySection({
  summarySection,
  updateSummaryText,
}: SummarySectionProps) {
  return (
    <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-5 space-y-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            EXECUTIVE / PROFESSIONAL SUMMARY
          </h3>
        </div>
        <span className="text-[10px] text-neutral-500 font-mono">Live Sync</span>
      </div>

      <textarea
        value={summarySection.content.summaryText || ''}
        onChange={(e) => updateSummaryText(e.target.value)}
        rows={3}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs leading-relaxed text-neutral-200 focus:outline-none focus:border-blue-500 transition resize-none font-sans"
        placeholder="Enter executive professional summary..."
      />
    </div>
  );
}
