import React from 'react';
import { FormatRiskItem } from '../../lib/ats/types';
import { FileWarning, CheckCircle2, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

interface Props {
  formatRisks: FormatRiskItem[];
  formatScore: number;
}

export const FormatAuditView: React.FC<Props> = ({ formatRisks, formatScore }) => {
  const getSeverityBadge = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical':
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger-bg text-danger border border-danger/30 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> {severity.toUpperCase()} RISK
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-warning-bg text-warning border border-warning/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> MEDIUM RISK
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-info-bg text-info border border-info/30 flex items-center gap-1">
            <Info className="w-3 h-3" /> LOW RISK
          </span>
        );
    }
  };

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-black text-text tracking-tight flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-primary" /> ATS Parser & Format Safety Audit
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Evaluates mechanical parser risks (Greenhouse, Lever, Workday, Taleo).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-text-secondary">Safety Rating:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-black ${
              formatScore >= 80
                ? 'bg-success-bg text-success border border-success/30'
                : formatScore >= 60
                ? 'bg-warning-bg text-warning border border-warning/30'
                : 'bg-danger-bg text-danger border border-danger/30'
            }`}
          >
            {formatScore}%
          </span>
        </div>
      </div>

      {formatRisks.length === 0 ? (
        <div className="p-6 rounded-xl bg-success-bg/20 border border-success/30 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
          <h4 className="text-sm font-bold text-text">Flawless ATS Formatting</h4>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            No parser-blocking errors, missing headings, or unreadable structures detected. Your layout will parse reliably across major applicant tracking systems.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {formatRisks.map((risk) => (
            <div
              key={risk.id}
              className="p-4 rounded-xl border border-border bg-surface-2/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-text">{risk.name}</h4>
                  {getSeverityBadge(risk.severity)}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{risk.description}</p>
                {risk.evidence && (
                  <p className="text-[11px] font-mono text-text-muted bg-surface px-2.5 py-1 rounded border border-border inline-block">
                    Detected: {risk.evidence}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
