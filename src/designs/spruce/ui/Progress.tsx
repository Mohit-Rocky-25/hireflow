import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from './Button';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  className?: string;
}

export function Progress({ value, max = 100, label, className = '' }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <div className="flex justify-between sp-caption text-sp-muted">
          <span>{label}</span>
          <span className="tabular-nums font-semibold text-sp-ink">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-2 rounded-full bg-sp-mint-200 overflow-hidden"
      >
        <div
          className="h-full bg-sp-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export function Skeleton({ width = '100%', height = '20px', className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`bg-sp-canvas-soft rounded-sp-xs animate-pulse ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`bg-sp-canvas-soft rounded-sp-lg p-8 text-center flex flex-col items-center justify-center border border-sp-hairline ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-sp-mint-50 text-sp-primary-text flex items-center justify-center mb-4">
        {icon || <HelpCircle className="w-6 h-6" />}
      </div>
      <h4 className="sp-h4 text-sp-ink font-bold">{title}</h4>
      <p className="sp-body-sm text-sp-muted max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`bg-sp-error-bg text-sp-error-text rounded-sp-lg p-4 flex items-center justify-between gap-4 border border-sp-error-text/30 ${className}`}
    >
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span className="sp-body-sm font-semibold">{message}</span>
      </div>
      {onRetry && (
        <Button variant="destructive" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
