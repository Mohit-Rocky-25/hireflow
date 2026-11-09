import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

export function Card({
  selected = false,
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const base = 'rounded-sp-lg p-6 transition-colors duration-150 relative';
  const stateClass = selected
    ? 'border-2 border-sp-primary bg-sp-mint-50'
    : 'border border-sp-hairline-strong bg-sp-surface';
  const interactiveClass = interactive && !selected ? 'hover:border-sp-primary-text cursor-pointer' : '';

  return (
    <div className={`${base} ${stateClass} ${interactiveClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
