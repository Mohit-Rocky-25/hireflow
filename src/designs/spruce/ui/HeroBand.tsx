import React from 'react';

export interface HeroBandProps {
  breadcrumb?: React.ReactNode;
  eyebrow?: React.ReactNode;
  headline: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  rightCard?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function HeroBand({
  breadcrumb,
  eyebrow,
  headline,
  lead,
  actions,
  rightCard,
  compact = false,
  className = '',
}: HeroBandProps) {
  return (
    <section
      className={`sp-hero-band w-full border-b border-sp-forest ${
        compact ? 'py-8' : 'py-12 sm:py-16'
      } ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {breadcrumb && <div className="mb-4">{breadcrumb}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className={rightCard ? 'lg:col-span-7' : 'lg:col-span-12'}>
            {eyebrow && <div className="mb-3">{eyebrow}</div>}
            <h1 className={`${compact ? 'sp-display-lg' : 'sp-display-xl'} text-sp-on-primary text-balance`}>
              {headline}
            </h1>
            {lead && (
              <p className="sp-body-lg text-sp-on-primary/90 mt-4 max-w-2xl text-pretty font-light">
                {lead}
              </p>
            )}
            {actions && <div className="flex flex-wrap items-center gap-3 mt-8">{actions}</div>}
          </div>

          {rightCard && (
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md">{rightCard}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
