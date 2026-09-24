// ============================================================
// HireFlow v2 — UI Component Library (§5.8, §5.9, §13)
// Every component uses the v2 design tokens literally.
// ============================================================
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ── Button (§5.8: 40px height, radius-md, 16px horizontal padding) ──

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'header';
  size?: 'default' | 'small';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'default', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-[8px] font-medium transition-all duration-[120ms] ease-out disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    default: 'h-[40px] px-[16px] text-[14px] rounded-md',
    small: 'h-[32px] px-[12px] text-[13px] rounded-sm',
  };

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-xs hover:shadow-sm',
    secondary: 'bg-surface-2 text-text border border-border hover:bg-border hover:border-border-strong',
    danger: 'bg-danger text-white hover:brightness-110 shadow-xs',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text',
    header: 'bg-header-btn text-header-btn-text hover:bg-header-btn-hover shadow-xs font-semibold',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── Badge / Status Pill (§5.8: 22px height, full radius, 8px horiz padding) ──

interface BadgeProps {
  variant?: 'default' | 'primary' | 'ai' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const base = 'inline-flex items-center h-[22px] px-[8px] rounded-full text-[12px] font-medium leading-none';

  const variants = {
    default: 'bg-surface-2 text-text-secondary',
    primary: 'bg-primary-light text-primary',
    ai: 'bg-ai-light text-ai',
    success: 'bg-success-bg text-success',
    warning: 'bg-warning-bg text-warning',
    danger: 'bg-danger-bg text-danger',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ── Card (§5.8: 20px padding desktop, 16px mobile, radius-lg, shadow-xs) ──

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`bg-surface rounded-xl border border-border p-[32px] sm:p-[40px] shadow-xs ${hover ? 'hover:shadow-sm transition-shadow duration-[120ms]' : ''} ${className}`}>
      {children}
    </div>
  );
}

// ── StatCard (§7 — top stat row) ──

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium text-text-muted uppercase tracking-[0.04em]">{label}</p>
          <p className="text-[24px] font-bold text-text mt-[4px] leading-[32px]">{value}</p>
          {trend && (
            <p className={`text-[12px] font-medium mt-[4px] ${trendUp ? 'text-success' : 'text-danger'}`}>
              {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-[40px] h-[40px] rounded-md bg-surface-2 flex items-center justify-center text-text-muted">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── EmptyState (§5.9 — explanatory + one action) ──

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[48px] px-[24px] text-center">
      {icon && <div className="text-text-muted mb-[16px] opacity-40">{icon}</div>}
      <h3 className="text-[16px] font-semibold text-text mb-[8px]">{title}</h3>
      <p className="text-[14px] text-text-secondary max-w-[400px] leading-[20px]">{description}</p>
      {action && <div className="mt-[20px]">{action}</div>}
    </div>
  );
}

// ── ErrorState (§5.9 — plain-language cause + retry action) ──

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[48px] px-[24px] text-center">
      <div className="w-[48px] h-[48px] rounded-lg bg-danger-bg flex items-center justify-center mb-[16px]">
        <AlertCircle className="w-[24px] h-[24px] text-danger stroke-[1.5px]" />
      </div>
      <h3 className="text-[16px] font-semibold text-text mb-[8px]">Error</h3>
      <p className="text-[14px] text-text-secondary max-w-[400px] leading-[20px]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-[20px] inline-flex items-center gap-[8px] h-[40px] px-[16px] bg-surface-2 text-text text-[14px] font-medium rounded-md border border-border hover:bg-border transition-colors duration-[120ms]"
        >
          <RefreshCw className="w-4 h-4 stroke-[1.5px]" />
          Try Again
        </button>
      )}
    </div>
  );
}

// ── Skeleton (§5.9 — skeleton shapes matching the eventual layout) ──

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

// ── SkeletonCard ──

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="h-[12px] w-[120px] mb-[12px]" />
      <Skeleton className="h-[28px] w-[80px] mb-[8px]" />
      <Skeleton className="h-[12px] w-[60px]" />
    </Card>
  );
}

// ── Input (§5.8: 40px height, 1px border, focus ring primary at 2px) ──

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-[14px] font-medium text-text mb-[6px]">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full h-[40px] px-[12px] rounded-md text-[14px] text-text bg-bg border border-border placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-[120ms] ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-[12px] text-danger mt-[4px]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ── Select ──

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label className="block text-[14px] font-medium text-text mb-[6px]">{label}</label>
      )}
      <select
        className={`w-full h-[40px] px-[12px] rounded-md text-[14px] text-text bg-bg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-[120ms] appearance-none ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-[12px] text-danger mt-[4px]">{error}</p>}
    </div>
  );
}

// ── Textarea ──

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-[14px] font-medium text-text mb-[6px]">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`w-full min-h-[100px] px-[12px] py-[10px] rounded-md text-[14px] text-text bg-bg border border-border placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-[120ms] resize-y ${error ? 'border-danger' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-[12px] text-danger mt-[4px]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ── Modal (§5.5: radius-xl, shadow-lg) ──

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = '480px' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-surface border border-border rounded-xl shadow-lg animate-scale-in w-full"
        style={{ maxWidth }}
      >
        {title && (
          <div className="px-[24px] py-[16px] border-b border-border">
            <h2 className="text-[18px] font-semibold text-text">{title}</h2>
          </div>
        )}
        <div className="px-[24px] py-[20px]">
          {children}
        </div>
      </div>
    </div>
  );
}
