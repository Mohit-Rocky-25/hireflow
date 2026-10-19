/**
 * HireFlow v4: Metric Component (X1.7, B6)
 * Strict metric display component that pairs every derived numerical value with an ExplainDrawer trigger.
 */

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { ExplainedValue } from '../../types/explain';
import { ExplainDrawer } from './ExplainDrawer';

export interface MetricProps {
  label: string;
  value: number | string;
  unit?: string;
  explain: ExplainedValue;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onReportWrongResult?: (metricId: string) => void;
}

export function Metric({
  label,
  value,
  unit,
  explain,
  className = '',
  size = 'md',
  onReportWrongResult,
}: MetricProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const valueSizeClass =
    size === 'lg'
      ? 'text-3xl font-bold tracking-tight'
      : size === 'sm'
      ? 'text-lg font-semibold'
      : 'text-2xl font-bold';

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label and Info Trigger */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label={`Inspect calculation for ${label}`}
          title="How is this calculated?"
          className="rounded p-0.5 text-slate-500 hover:text-emerald-400 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Numerical display */}
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`font-mono text-white ${valueSizeClass}`}>{value}</span>
        {unit && <span className="text-xs font-medium text-emerald-400">{unit}</span>}
      </div>

      {/* Drawer */}
      <ExplainDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        explained={explain}
        onReportWrongResult={onReportWrongResult}
      />
    </div>
  );
}
