import React from 'react';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function Logo({ size = 'md', showWordmark = true, className = '', ...props }: LogoProps) {
  const markDimensions = {
    sm: 24,
    md: 28,
    lg: 36,
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} {...props}>
      <svg
        width={markDimensions}
        height={markDimensions}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* 28px square forest fill with 2px radius */}
        <rect width="28" height="28" rx="2" fill="var(--sp-forest)" />
        {/* Right-pointing chevron with diagonally cut tail in lime-hero */}
        <path
          d="M8 7L17 14L8 21H13L21 14L13 7H8Z"
          fill="var(--sp-lime-hero)"
        />
      </svg>
      {showWordmark && (
        <span className="sp-h4 tracking-tight flex items-center">
          <span className="text-sp-ink font-bold">Hire</span>
          <span className="text-sp-primary-text font-bold">Floo</span>
        </span>
      )}
    </div>
  );
}
