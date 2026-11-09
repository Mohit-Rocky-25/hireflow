import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemProps {
  id: string;
  title: string;
  glyph?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  className?: string;
}

export function AccordionItem({
  id,
  title,
  glyph,
  badge,
  children,
  defaultExpanded = false,
  expanded,
  onToggle,
  className = '',
}: AccordionItemProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  const handleToggle = () => {
    const next = !isExpanded;
    if (expanded === undefined) {
      setInternalExpanded(next);
    }
    onToggle?.(next);
  };

  const contentId = `${id}-content`;

  return (
    <div className={`border-b border-sp-hairline bg-sp-surface ${className}`}>
      <button
        type="button"
        id={id}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={handleToggle}
        className="w-full min-h-[48px] py-3.5 px-4 flex items-center justify-between gap-3 text-left sp-ui-label cursor-pointer hover:bg-sp-canvas-soft transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sp-primary-text"
      >
        <div className="flex items-center gap-3">
          {glyph && <span className="text-sp-primary-text shrink-0">{glyph}</span>}
          <span className="text-sp-ink font-semibold">{title}</span>
          {badge}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-sp-muted shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-180 text-sp-primary-text' : ''
          }`}
          aria-hidden="true"
        />
      </button>
      {isExpanded && (
        <div id={contentId} role="region" aria-labelledby={id} className="p-4 pt-1 sp-body-sm text-sp-body">
          {children}
        </div>
      )}
    </div>
  );
}

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return <div className={`border-t border-sp-hairline ${className}`}>{children}</div>;
}
