import React from 'react';
import { HelpCircle, AlertTriangle, Lightbulb, MessageSquareCode } from 'lucide-react';

interface Props {
  questions: Array<{
    question: string;
    whyTheyWillAsk: string;
    prepHint: string;
  }>;
}

export const InterviewRisksView: React.FC<Props> = ({ questions }) => {
  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-black text-text tracking-tight flex items-center gap-2">
          <MessageSquareCode className="w-5 h-5 text-warning" /> Interview Risk Radar
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Based on the gaps in your resume, here are the exact probe questions hiring managers will use to test your real depth.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-border bg-surface-2/60 space-y-3 hover:border-warning/40 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-warning/20 text-warning flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <h4 className="text-xs font-bold text-text leading-snug">
                "{q.question}"
              </h4>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pl-7">
              <div className="bg-surface rounded-lg p-2.5 border border-border">
                <span className="text-[10px] font-black uppercase tracking-wider text-danger flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3" /> Why they will ask:
                </span>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {q.whyTheyWillAsk}
                </p>
              </div>

              <div className="bg-surface rounded-lg p-2.5 border border-border">
                <span className="text-[10px] font-black uppercase tracking-wider text-success flex items-center gap-1 mb-1">
                  <Lightbulb className="w-3 h-3" /> How to prepare:
                </span>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {q.prepHint}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
