import React from 'react';

export interface SpecCellProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

export function SpecCell({ label, value, hint, className = '', ...props }: SpecCellProps) {
  return (
    <div className={`border-l border-sp-hairline pl-4 flex flex-col justify-between ${className}`} {...props}>
      <span className="sp-caption text-sp-muted uppercase tracking-wider font-semibold">{label}</span>
      <div className="sp-body-sm font-semibold text-sp-ink mt-0.5 tabular-nums">{value}</div>
      {hint && <span className="sp-micro text-sp-muted mt-0.5">{hint}</span>}
    </div>
  );
}

export interface SpecGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4 | 6;
  children: React.ReactNode;
}

export function SpecGrid({ columns = 3, children, className = '', ...props }: SpecGridProps) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[columns];

  return (
    <div className={`grid ${colClass} gap-4 sm:gap-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
