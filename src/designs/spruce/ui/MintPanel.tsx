import React from 'react';

export interface MintPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MintPanel({ children, className = '', ...props }: MintPanelProps) {
  return (
    <div
      className={`bg-sp-mint-50 rounded-sp-2xl p-6 sm:p-10 border border-sp-hairline ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MediaFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MediaFrame({ children, className = '', ...props }: MediaFrameProps) {
  return (
    <div
      className={`bg-sp-mint-100 rounded-sp-2xl p-3 border border-sp-hairline ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
