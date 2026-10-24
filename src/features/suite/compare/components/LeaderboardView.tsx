import React from 'react';
import { SingleJDResult } from '../compareJDs';
import { CompanyLogo } from '../../../../components/common/CompanyLogo';

export function LeaderboardView({ rankedJDs }: { rankedJDs: SingleJDResult[] }) {
  return (
    <div className="space-y-4">
      {rankedJDs.map((jd, idx) => (
        <div
          key={jd.id}
          className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black font-mono flex items-center justify-center shrink-0">
                #{idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text">{jd.label}</h3>
                  {jd.company && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded bg-surface-2 border border-border text-text-secondary">
                      <CompanyLogo company={jd.company} size="xs" showBorder={false} interactive={false} />
                      <span>{jd.company}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{jd.verdictReason}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  jd.verdict === 'Strong fit'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : jd.verdict === 'Close'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {jd.verdict}
              </span>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-primary">
                  {jd.score}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-border/60 text-xs">
            <div>
              <span className="text-text-muted">Must-Have Alignment:</span>{' '}
              <strong className="text-text">
                {Math.round(jd.mustHaveCoverage * 100)}% ({jd.mustHaveMet}/{jd.mustHaveTotal})
              </strong>
            </div>
            <div>
              <span className="text-text-muted">Match Confidence:</span>{' '}
              <strong className="text-emerald-400 font-bold">
                {jd.mustHaveCoverage >= 0.75 ? 'High' : jd.mustHaveCoverage >= 0.45 ? 'Medium' : 'Low'}
              </strong>
            </div>
            <div>
              <span className="text-text-muted">Readiness Assessment:</span>{' '}
              <strong className="text-text">{jd.readinessAssessment}</strong>
            </div>
          </div>

          {/* Top 3 Fixes for this role */}
          {jd.topFixes.length > 0 && (
            <div className="pt-4 space-y-2">
              <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                Top Impact Fixes for this Role
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {jd.topFixes.map((fix) => (
                  <div
                    key={fix.skillId}
                    className="p-2.5 rounded-xl bg-surface-2 border border-border/80 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-text">{fix.skillName}</span>
                    <span className="text-emerald-400 font-bold">+{fix.gain}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
