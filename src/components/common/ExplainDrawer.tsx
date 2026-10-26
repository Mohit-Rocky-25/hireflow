/**
 * HireFlow v4: ExplainDrawer Component (X1.7, B6.3)
 * Transparent "How is this calculated?" inspect panel for every derived metric in HireFlo.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from './Drawer';
import { ExplainedValue } from '../../types/explain';
import { Calculator, Info, AlertCircle, FileText, Flag } from 'lucide-react';
import { Tag } from './Tag';

export interface ExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  explained?: ExplainedValue | null;
  onReportWrongResult?: (metricId: string) => void;
}

export function ExplainDrawer({
  isOpen,
  onClose,
  explained,
  onReportWrongResult,
}: ExplainDrawerProps) {
  if (!explained) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={explained.label}
      description={`Metric ID: ${explained.id}`}
      widthClass="sm:max-w-md md:max-w-lg"
    >
      <div className="space-y-6 text-sm text-slate-300">
        {/* Calculated Value Highlight */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Current Computed Value</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">{explained.value}</span>
            {explained.unit && <span className="text-lg font-medium text-emerald-400">{explained.unit}</span>}
            {explained.confidence && (
              <span className="ml-auto">
                <Tag
                  variant={
                    explained.confidence === 'high'
                      ? 'verified'
                      : explained.confidence === 'medium'
                      ? 'needs-recheck'
                      : 'unverified'
                  }
                  size="sm"
                >
                  {explained.confidence} confidence
                </Tag>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Formula */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <Calculator className="h-4 w-4 text-emerald-400" />
            <span>Calculation Formula</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto">
            {explained.formula}
          </div>
        </div>

        {/* Breakdown of Inputs */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <FileText className="h-4 w-4 text-sky-400" />
            <span>Contributing Inputs & Sources</span>
          </div>
          <div className="space-y-2">
            {explained.inputs.map((inp, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs"
              >
                <div>
                  <span className="font-medium text-white">{inp.name}</span>
                  {inp.source && <p className="mt-0.5 text-slate-400 text-[11px]">{inp.source}</p>}
                </div>
                <span className="font-mono font-semibold text-slate-200 shrink-0 ml-3">{inp.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Period */}
        {explained.dataPeriod && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs flex items-center justify-between">
            <span className="text-slate-400">Underlying Data Period:</span>
            <span className="font-medium text-slate-200">{explained.dataPeriod}</span>
          </div>
        )}

        {/* Honest Limitations */}
        {explained.limitations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>What this number does NOT mean</span>
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-400">
              {explained.limitations.map((lim, idx) => (
                <li key={idx} className="leading-relaxed">{lim}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions & Report Wrong Result */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <Link
            to="/methodology"
            onClick={onClose}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Full Methodology</span>
          </Link>

          {onReportWrongResult && (
            <button
              type="button"
              onClick={() => onReportWrongResult(explained.id)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Flag className="h-3.5 w-3.5 text-rose-400" />
              <span>Report a wrong result</span>
            </button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
