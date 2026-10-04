import React from 'react';
import { Eye, ShieldAlert, Award, AlertCircle } from 'lucide-react';

interface Props {
  verdict: {
    headline: string;
    tone: 'strong' | 'borderline' | 'weak';
    oneParagraphSummary: string;
  };
  recruiterFirst6Seconds: string;
  isAiPowered: boolean;
}

export const RecruiterScanView: React.FC<Props> = ({
  verdict,
  recruiterFirst6Seconds,
  isAiPowered,
}) => {
  const getToneStyle = () => {
    switch (verdict.tone) {
      case 'strong':
        return {
          bg: 'bg-success-bg border-success/30 text-success',
          icon: Award,
          title: 'Strong Candidate Profile',
        };
      case 'borderline':
        return {
          bg: 'bg-warning-bg border-warning/30 text-warning',
          icon: AlertCircle,
          title: 'Borderline ATS Screen',
        };
      default:
        return {
          bg: 'bg-danger-bg border-danger/30 text-danger',
          icon: ShieldAlert,
          title: 'High Screening Rejection Risk',
        };
    }
  };

  const tone = getToneStyle();
  const Icon = tone.icon;

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="text-base font-black text-text tracking-tight">Recruiter's 6-Second Glance</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${tone.bg}`}>
            <Icon className="w-3.5 h-3.5" />
            {tone.title}
          </span>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-surface-2 text-text-muted rounded">
            {isAiPowered ? 'Gemini Flash Reasoning' : 'Deterministic Fact Engine'}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
        <h4 className="text-sm font-bold text-text">{verdict.headline}</h4>
        <p className="text-xs text-text-secondary leading-relaxed">{verdict.oneParagraphSummary}</p>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> What the recruiter sees in the first 6 seconds:
        </span>
        <p className="text-xs text-text leading-relaxed font-sans">{recruiterFirst6Seconds}</p>
      </div>
    </div>
  );
};
