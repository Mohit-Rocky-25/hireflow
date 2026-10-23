/**
 * HireFlow: Tag / Badge Component (High-Contrast Dark System)
 * Consistent dark-theme status badges with high WCAG contrast and sharp 4px corners.
 */

import React from 'react';

export type TagVariant =
  | 'default'
  | 'verified'
  | 'needs-recheck'
  | 'unverified'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<TagVariant, string> = {
  default: 'bg-near-black border-charcoal text-silver',
  verified: 'bg-near-black border-volt/50 text-volt',
  'needs-recheck': 'bg-near-black border-pale-yellow/50 text-pale-yellow',
  unverified: 'bg-near-black border-charcoal text-silver',
  success: 'bg-near-black border-volt/50 text-volt',
  warning: 'bg-near-black border-pale-yellow/50 text-pale-yellow',
  danger: 'bg-near-black border-danger/60 text-danger',
  info: 'bg-near-black border-charcoal text-silver',
};

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: TagProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px] font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border uppercase tracking-[1.2px] select-none ${sizeClass} ${VARIANT_STYLES[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
