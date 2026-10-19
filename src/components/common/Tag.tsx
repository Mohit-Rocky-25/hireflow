/**
 * HireFlow v4: Tag / Badge Component (X1.7)
 * Consistent dark-theme status badges with high WCAG contrast and semantic icons.
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
  default: 'bg-slate-800 border-slate-700 text-slate-300',
  verified: 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300',
  'needs-recheck': 'bg-amber-950/60 border-amber-700/60 text-amber-300',
  unverified: 'bg-slate-900 border-slate-700 text-slate-400',
  success: 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300',
  warning: 'bg-amber-950/60 border-amber-700/60 text-amber-300',
  danger: 'bg-rose-950/60 border-rose-700/60 text-rose-300',
  info: 'bg-sky-950/60 border-sky-700/60 text-sky-300',
};

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: TagProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${sizeClass} ${VARIANT_STYLES[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
