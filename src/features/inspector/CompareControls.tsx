import React from 'react';
import type { AuditEntry, Uuid } from '@/domain/types';
import { GitCompare, X } from 'lucide-react';

interface CompareControlsProps {
  availableAudits: readonly AuditEntry[];
  currentCompareId: Uuid | null;
  onSelectCompare: (id: Uuid | null) => void;
}

export const CompareControls: React.FC<CompareControlsProps> = ({
  availableAudits,
  currentCompareId,
  onSelectCompare,
}) => {
  if (availableAudits.length === 0) {
    return (
      <div className="p-3 bg-[#0a0a08] border border-neutral-800 rounded font-mono text-xs text-neutral-500 flex items-center justify-between">
        <span>Single evaluation on file for this target</span>
        <span className="text-[10px] text-neutral-600">Scan again to track diffs</span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-[#10100d] border border-neutral-800 rounded font-mono text-xs flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <GitCompare className="w-3.5 h-3.5 text-[#faff69]" />
        <span className="text-neutral-300 font-medium">Compare with past audit:</span>
        <select
          value={currentCompareId ?? ''}
          onChange={(e) => onSelectCompare(e.target.value ? e.target.value : null)}
          className="bg-[#141410] border border-neutral-700 text-neutral-200 rounded px-2.5 py-1 text-xs outline-none focus:border-[#faff69]"
        >
          <option value="">No comparison (Single View)</option>
          {availableAudits.map((a) => (
            <option key={a.id} value={a.id}>
              {new Date(a.createdAt).toLocaleDateString()} — Fit: {a.overallScore}/100 ({a.resume.label})
            </option>
          ))}
        </select>
      </div>

      {currentCompareId && (
        <button
          type="button"
          onClick={() => onSelectCompare(null)}
          className="flex items-center gap-1 px-2 py-0.5 rounded border border-neutral-700 bg-[#141410] text-neutral-400 hover:text-neutral-200 text-[11px] cursor-pointer"
        >
          <X className="w-3 h-3" />
          <span>Exit Diff</span>
        </button>
      )}
    </div>
  );
};

