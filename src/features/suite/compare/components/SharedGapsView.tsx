import React from 'react';
import { CompareJDsResult } from '../compareJDs';

export function SharedGapsView({ sharedGaps }: { sharedGaps: CompareJDsResult['sharedGaps'] }) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-surface border border-border">
        <h3 className="text-sm font-bold text-text">
          Cross-Application Leverage Opportunities
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Address these competencies once to strengthen alignment across multiple job applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sharedGaps.map((gap) => (
          <div
            key={gap.skillId}
            className="bg-surface border border-border rounded-2xl p-5 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text">{gap.skillName}</h4>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Missing in {gap.jdsMissingCount} JDs
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Appears in: {gap.jdsMissingLabels.join(', ')}
              </p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <span className="text-text-muted">Total Potential Gain:</span>
              <strong className="text-emerald-400 font-bold">
                +{gap.totalSimulatedGain}% combined improvement
              </strong>
            </div>
          </div>
        ))}

        {sharedGaps.length === 0 && (
          <div className="p-8 text-center text-xs text-text-muted col-span-2">
            No multi-role shared gaps detected across these job descriptions.
          </div>
        )}
      </div>
    </div>
  );
}
