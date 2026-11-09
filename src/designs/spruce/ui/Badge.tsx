import React from 'react';
import { Check, Minus, X, ShieldCheck } from 'lucide-react';

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Eyebrow({ children, className = '', ...props }: EyebrowProps) {
  return (
    <span className={`sp-eyebrow text-sp-muted ${className}`} {...props}>
      {children}
    </span>
  );
}

export interface EditorialBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function EditorialBadge({ children, className = '', ...props }: EditorialBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 sp-micro uppercase font-bold text-sp-lime-panel ${className}`}
      {...props}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-sp-lime-panel shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}

export interface AwardRibbonProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function AwardRibbon({ label, className = '', ...props }: AwardRibbonProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-sp-mint-100 text-sp-primary-text sp-eyebrow px-3 py-1 font-bold rounded-none relative border-l-2 border-sp-primary ${className}`}
      {...props}
    >
      <span>{label}</span>
    </div>
  );
}

export interface CompareBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function CompareBadge({ children, className = '', ...props }: CompareBadgeProps) {
  return (
    <span
      className={`inline-flex items-center sp-eyebrow bg-sp-lime-panel text-sp-on-lime font-bold rounded-sp-xl px-3 py-1 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export type StatusChipVariant = 'matched' | 'partial' | 'missing';

export interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusChipVariant;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, label, size = 'sm', className = '', ...props }: StatusChipProps) {
  const configs = {
    matched: {
      defaultLabel: 'Matched',
      classes: 'bg-sp-mint-100 text-sp-primary-text border border-sp-primary-text/20',
      icon: <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" aria-hidden="true" />,
    },
    partial: {
      defaultLabel: 'Partial',
      classes: 'bg-sp-info-bg text-sp-info-text border border-sp-info-text/20',
      icon: <Minus className="w-3.5 h-3.5 shrink-0 stroke-[3]" aria-hidden="true" />,
    },
    missing: {
      defaultLabel: 'Missing',
      classes: 'bg-sp-error-bg text-sp-error-text border border-sp-error-text/20',
      icon: <X className="w-3.5 h-3.5 shrink-0 stroke-[3]" aria-hidden="true" />,
    },
  };

  const config = configs[status] || configs.missing;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sp-sm font-semibold select-none ${
        size === 'sm' ? 'h-6 px-2.5 sp-caption' : 'h-7 px-3 text-xs'
      } ${config.classes} ${className}`}
      {...props}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
}
