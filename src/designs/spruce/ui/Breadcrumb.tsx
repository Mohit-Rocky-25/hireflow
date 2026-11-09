import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onBand?: boolean;
  className?: string;
}

export function Breadcrumb({ items, onBand = true, className = '' }: BreadcrumbProps) {
  const textColor = onBand ? 'text-sp-on-primary' : 'text-sp-muted';
  const activeColor = onBand ? 'text-sp-on-primary font-bold' : 'text-sp-ink font-bold';

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 sp-caption ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${textColor}`} aria-hidden="true" />
            )}
            {isLast || (!item.href && !item.onClick) ? (
              <span className={`select-none ${activeColor}`} aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className={`${textColor} opacity-80 hover:opacity-100 hover:underline transition-opacity`}
              >
                {item.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className={`${textColor} opacity-80 hover:opacity-100 hover:underline transition-opacity cursor-pointer`}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
