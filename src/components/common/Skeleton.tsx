/**
 * HireFlow v4: Skeleton Component (X1.7)
 * Accessible placeholder loading state with aria-live and reduced-motion support.
 */

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded h-4 my-1'
      : 'rounded-lg';

  const style: React.CSSProperties = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
  };

  return (
    <div
      role="status"
      aria-label="Loading content..."
      style={style}
      className={`animate-pulse bg-slate-800/80 ${variantClass} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
