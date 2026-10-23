// ============================================================
// HireFlow — Primitive Component Library (High-Contrast Dark System)
// Token-driven, sharp 4px/8px corners, pure black & neon volt accents
// ============================================================
import React from 'react';
import { AlertCircle, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

// ── Button Primitives (§4: 4px radius, touch height, inset active) ──

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'header' | 'action' | 'neon' | 'dark' | 'outline';
  size?: 'default' | 'small' | 'large';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold text-center transition-colors duration-150 ease-out cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-volt focus-visible:outline-offset-2';

  const sizes = {
    small: 'h-[36px] min-h-[36px] px-3 text-[13px] rounded',
    default: 'h-[44px] min-h-[44px] px-4 text-[14px] rounded',
    large: 'h-[48px] min-h-[48px] px-6 text-[16px] rounded',
  };

  // Button Treatments strictly matching DESIGN.md (§4)
  const variants = {
    // Neon Primary: volt bg, #151515 text, 4px radius, 1px volt border
    // Hover: dark bg #1d1d1d, white/volt text; Active: pale-yellow text + inset shadow
    primary:
      'bg-volt text-text-on-accent border border-volt hover:bg-[#1d1d1d] hover:text-white active:text-pale-yellow active:shadow-inset font-bold',
    neon:
      'bg-volt text-text-on-accent border border-volt hover:bg-[#1d1d1d] hover:text-white active:text-pale-yellow active:shadow-inset font-bold',

    // Forest Action: forest green bg (#166534), pure white text, 1px #141414 border
    action:
      'bg-forest text-white border border-[#141414] hover:bg-hover-gray hover:text-white/80 active:text-pale-yellow active:shadow-inset',

    // Dark Solid: near-black bg, white text, charcoal border
    secondary:
      'bg-near-black text-white border border-charcoal hover:bg-hover-gray hover:text-white/90 active:text-pale-yellow active:shadow-inset',
    dark:
      'bg-near-black text-white border border-charcoal hover:bg-hover-gray hover:text-white/90 active:text-pale-yellow active:shadow-inset',

    // Ghost / Outlined: transparent, white text, 1px olive border (#4f5100), wide padding
    ghost:
      'bg-transparent text-white border border-olive-border hover:bg-near-black hover:border-volt/60 active:text-pale-yellow active:shadow-inset px-6',
    outline:
      'bg-transparent text-white border border-charcoal hover:border-volt hover:text-volt active:text-pale-yellow active:shadow-inset',

    // Header action button (maps to Neon or Forest)
    header:
      'bg-forest text-white border border-forest-dark hover:bg-hover-gray active:text-pale-yellow active:shadow-inset font-bold',

    // Danger: muted red border on dark surface, white text, icon + text
    danger:
      'bg-near-black text-white border border-danger/60 hover:bg-danger/20 hover:border-danger active:text-pale-yellow active:shadow-inset',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── Badge / Tag / Chip (§4: 4px radius, uppercase 12-14px label style) ──

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'ai' | 'success' | 'warning' | 'danger' | 'volt' | 'forest';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 h-[24px] px-2.5 rounded text-[11px] font-semibold uppercase tracking-[1.4px] leading-none select-none';

  const variants = {
    default: 'bg-near-black text-silver border border-charcoal',
    primary: 'bg-near-black text-volt border border-volt/40',
    volt: 'bg-near-black text-volt border border-volt',
    forest: 'bg-forest/20 text-white border border-forest',
    ai: 'bg-near-black text-volt border border-volt/40',
    success: 'bg-near-black text-volt border border-volt/40',
    warning: 'bg-near-black text-pale-yellow border border-pale-yellow/40',
    danger: 'bg-near-black text-danger border border-danger/40',
  };

  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}

// ── Card (§4, §6: 8px radius, charcoal border, hover & featured states) ──

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  featured?: boolean;
  selected?: boolean;
}

export function Card({
  children,
  className = '',
  hover = false,
  featured = false,
  selected = false,
}: CardProps) {
  const isHighlighted = featured || selected;
  return (
    <div
      className={`bg-near-black rounded-lg border p-6 sm:p-8 transition-colors duration-150 ${
        isHighlighted
          ? 'border-volt shadow-level-5'
          : 'border-charcoal'
      } ${
        hover
          ? 'hover:border-volt/70 hover:shadow-level-3 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── StatCard (§4: Oversized numbers 72px+/36px+, silver caption) ──

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendUp, className = '' }: StatCardProps) {
  return (
    <div
      className={`bg-near-black rounded-lg border border-charcoal p-6 hover:border-volt/60 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-silver uppercase tracking-[1.4px]">
            {label}
          </p>
          <p className="text-[36px] sm:text-[44px] font-black text-white mt-2 leading-none tracking-tight font-sans">
            {value}
          </p>
          {trend && (
            <p
              className={`text-[12px] font-medium mt-3 flex items-center gap-1 ${
                trendUp ? 'text-volt' : 'text-pale-yellow'
              }`}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ── EmptyState (§5.9) ──

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center bg-near-black rounded-lg border border-charcoal ${className}`}
    >
      {icon && <div className="text-silver mb-4 opacity-70 stroke-[1.5px]">{icon}</div>}
      <h3 className="text-[18px] font-bold text-white mb-2">{title}</h3>
      <p className="text-[14px] text-silver max-w-md leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ── ErrorState & Callout (§1B, §5.9) ──

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = 'An error occurred during calculation.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center bg-near-black rounded-lg border border-danger/60 ${className}`}
    >
      <div className="w-12 h-12 rounded bg-black border border-danger/40 flex items-center justify-center mb-4 text-danger">
        <AlertCircle className="w-6 h-6 stroke-[1.5px]" />
      </div>
      <h3 className="text-[18px] font-bold text-white mb-2">Error Encountered</h3>
      <p className="text-[14px] text-silver max-w-md leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 h-[44px] px-5 bg-near-black text-white text-[14px] font-semibold rounded border border-charcoal hover:border-volt hover:text-volt transition-colors"
        >
          <RefreshCw className="w-4 h-4 stroke-[1.5px]" />
          Retry Action
        </button>
      )}
    </div>
  );
}

// ── Callout Box (Stage 1B: Info / Warning / Error / Success) ──

export interface CalloutProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ type = 'info', title, children, className = '' }: CalloutProps) {
  const styles = {
    info: {
      border: 'border-charcoal',
      icon: <AlertCircle className="w-5 h-5 text-silver shrink-0 stroke-[1.5px]" />,
      titleColor: 'text-white',
    },
    warning: {
      border: 'border-pale-yellow/50',
      icon: <AlertTriangle className="w-5 h-5 text-pale-yellow shrink-0 stroke-[1.5px]" />,
      titleColor: 'text-pale-yellow',
    },
    error: {
      border: 'border-danger/60',
      icon: <AlertCircle className="w-5 h-5 text-danger shrink-0 stroke-[1.5px]" />,
      titleColor: 'text-danger',
    },
    success: {
      border: 'border-volt/50',
      icon: <CheckCircle2 className="w-5 h-5 text-volt shrink-0 stroke-[1.5px]" />,
      titleColor: 'text-volt',
    },
  };

  const current = styles[type];

  return (
    <div className={`p-4 bg-near-black rounded-lg border ${current.border} flex items-start gap-3 ${className}`}>
      {current.icon}
      <div className="text-[14px] leading-relaxed">
        {title && <h4 className={`font-bold mb-1 ${current.titleColor}`}>{title}</h4>}
        <div className="text-silver">{children}</div>
      </div>
    </div>
  );
}

// ── Skeleton Loader ──

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton className="h-3 w-32 mb-4" />
      <Skeleton className="h-10 w-24 mb-3" />
      <Skeleton className="h-3 w-48" />
    </Card>
  );
}

// ── Input (§4 Derived: Near-black surface, charcoal border, 4px radius) ──

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-semibold text-silver uppercase tracking-[1.2px] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full h-[44px] px-3.5 rounded text-[14px] text-white bg-near-black border ${
            error ? 'border-danger focus:border-danger' : 'border-charcoal focus:border-volt'
          } placeholder:text-silver/60 focus:outline-none focus:ring-1 ${
            error ? 'focus:ring-danger' : 'focus:ring-volt'
          } transition-colors duration-150 ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-danger mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 stroke-[1.5px]" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ── Select Dropdown (§4 Derived) ──

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[13px] font-semibold text-silver uppercase tracking-[1.2px] mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full h-[44px] px-3.5 rounded text-[14px] text-white bg-near-black border ${
          error ? 'border-danger focus:border-danger' : 'border-charcoal focus:border-volt'
        } focus:outline-none focus:ring-1 ${
          error ? 'focus:ring-danger' : 'focus:ring-volt'
        } transition-colors duration-150 cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-near-black text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[12px] text-danger mt-1.5 flex items-center gap-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 stroke-[1.5px]" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Textarea (§4 Derived) ──

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-semibold text-silver uppercase tracking-[1.2px] mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full min-h-[120px] p-3.5 rounded text-[14px] text-white bg-near-black border ${
            error ? 'border-danger focus:border-danger' : 'border-charcoal focus:border-volt'
          } placeholder:text-silver/60 focus:outline-none focus:ring-1 ${
            error ? 'focus:ring-danger' : 'focus:ring-volt'
          } transition-colors duration-150 resize-y ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-danger mt-1.5 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 stroke-[1.5px]" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ── Modal (§4, §6: 8px radius, pure black canvas, charcoal border) ──

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = '540px' }: ModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-black border border-charcoal rounded-lg shadow-level-3 w-full animate-fade-in overflow-hidden z-10"
        style={{ maxWidth }}
      >
        {title && (
          <div className="px-6 py-4 border-b border-charcoal flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-white font-sans">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="text-silver hover:text-volt p-1 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
