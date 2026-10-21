import React from 'react';
import { CompareJDsResult, SingleJDResult } from '../compareJDs';

export function OverlapMatrixView({
  matrix,
  rankedJDs,
}: {
  matrix: CompareJDsResult['matrix'];
  rankedJDs: SingleJDResult[];
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 overflow-x-auto space-y-4">
      <div className="flex items-center justify-between text-xs pb-3 border-b border-border/80">
        <span className="font-bold text-text">
          Competency Matrix ({matrix.skills.length} skills tracked)
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Exact
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Alias
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Implied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" /> Related
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Missing
          </span>
        </div>
      </div>

      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border/60 text-text-muted">
            <th className="py-2.5 px-3 font-semibold">Skill / Competency</th>
            {rankedJDs.map((jd) => (
              <th key={jd.id} className="py-2.5 px-3 font-semibold truncate max-w-[140px]">
                {jd.company || jd.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 font-mono">
          {matrix.skills.map((s) => (
            <tr key={s.id} className="hover:bg-surface-2/40 transition-colors">
              <td className="py-2 px-3 font-sans font-medium text-text">{s.name}</td>
              {rankedJDs.map((jd) => {
                const tier = matrix.cells[s.id]?.[jd.id] || 'missing';
                const color =
                  tier === 'exact'
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : tier === 'alias'
                    ? 'text-sky-400 bg-sky-500/10'
                    : tier === 'implied'
                    ? 'text-amber-400 bg-amber-500/10'
                    : tier === 'related'
                    ? 'text-violet-400 bg-violet-500/10'
                    : 'text-rose-400 bg-rose-500/10';

                return (
                  <td key={jd.id} className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>
                      {tier}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
