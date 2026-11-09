import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

export interface ExpertTipProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  children: React.ReactNode;
}

export function ExpertTip({ label = 'Expert Tip', children, className = '', ...props }: ExpertTipProps) {
  return (
    <div
      className={`bg-sp-lime-panel text-sp-on-lime rounded-sp-lg p-6 border border-sp-hairline-strong relative ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <ArrowRight className="w-4 h-4 text-sp-on-lime stroke-[3]" aria-hidden="true" />
        <span className="sp-ui-label uppercase tracking-wide text-sp-on-lime">{label}</span>
      </div>
      <div className="sp-body-sm text-sp-on-lime space-y-2">{children}</div>
    </div>
  );
}
