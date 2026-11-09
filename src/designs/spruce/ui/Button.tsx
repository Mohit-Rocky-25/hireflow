import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'onBand';
  size?: 'md' | 'sm';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'sp-ui-label uppercase inline-flex items-center justify-center gap-2 transition-colors duration-150 ease-out cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sp-primary-text relative overflow-hidden';

    const sizes = {
      md: 'h-12 px-5 text-sm',
      sm: 'h-10 px-4 text-xs',
    };

    const variants = {
      primary:
        'rounded-sp-xs bg-sp-primary text-sp-on-primary shadow-sp-3 hover:bg-sp-primary-hover',
      secondary:
        'rounded-sp-xs bg-sp-canvas-soft text-sp-primary-text hover:bg-sp-mint-50',
      outline:
        'rounded-sp-lg border border-sp-hairline-strong text-sp-primary-text hover:bg-sp-mint-50 before:absolute before:-inset-1 before:content-[""]',
      ghost:
        'bg-transparent text-sp-primary-text underline decoration-2 underline-offset-4 hover:opacity-80 p-0 h-auto',
      destructive:
        'rounded-sp-lg border border-sp-error-text text-sp-error-text hover:bg-sp-error-bg',
      onBand:
        'rounded-sp-xs border border-white text-white hover:bg-white/10 active:bg-white/20',
    };

    const sizeClass = variant === 'ghost' ? '' : sizes[size];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${sizeClass} ${variants[variant]} ${className}`}
        {...props}
      >
        <span>{children}</span>
        {loading && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sp-mint-200 overflow-hidden">
            <span className="block h-full w-1/3 bg-sp-primary animate-pulse" />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
