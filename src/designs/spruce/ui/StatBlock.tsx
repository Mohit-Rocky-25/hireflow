import React from 'react';

export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  figure: string | number;
  label: string;
  isScore?: boolean;
  withArrowMotif?: boolean;
}

export function StatBlock({
  figure,
  label,
  isScore = false,
  withArrowMotif = false,
  className = '',
  ...props
}: StatBlockProps) {
  return (
    <div
      className={`bg-sp-primary-deep text-sp-on-primary rounded-sp-lg p-5 relative overflow-hidden flex flex-col justify-between ${className}`}
      {...props}
    >
      {withArrowMotif && (
        <svg
          className="absolute -right-3 -bottom-3 w-20 h-20 pointer-events-none opacity-30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <path d="M7 17L17 7M17 7H9M17 7V15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <div className="relative z-10">
        <div className={`font-bold tabular-nums text-white ${isScore ? 'sp-score' : 'sp-stat'}`}>
          {figure}
        </div>
        <div className="sp-caption text-white/80 mt-1 uppercase tracking-wider font-semibold">
          {label}
        </div>
      </div>
    </div>
  );
}

export interface StatChipProps extends React.HTMLAttributes<HTMLDivElement> {
  figure: string | number;
  label: string;
}

export function StatChip({ figure, label, className = '', ...props }: StatChipProps) {
  return (
    <div
      className={`bg-sp-surface border border-sp-hairline rounded-sp-lg p-4 flex flex-col justify-between ${className}`}
      {...props}
    >
      <div className="sp-caption text-sp-muted font-medium mb-1">{label}</div>
      <div className="sp-stat text-sp-ink font-bold tabular-nums">{figure}</div>
    </div>
  );
}
