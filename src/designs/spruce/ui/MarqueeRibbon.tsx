import React from 'react';
import { Sparkles } from 'lucide-react';

export interface MarqueeRibbonProps {
  items: string[];
  className?: string;
}

export function MarqueeRibbon({ items, className = '' }: MarqueeRibbonProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`overflow-hidden py-4 -rotate-1 w-full bg-sp-lime-panel text-sp-on-lime border-y border-sp-hairline-strong select-none ${className}`}>
      <div className="flex items-center gap-8 whitespace-nowrap animate-marquee md:animate-none">
        {items.concat(items).map((item, idx) => (
          <div key={idx} className="inline-flex items-center gap-4 sp-ui-label uppercase tracking-widest text-sp-on-lime">
            <span>{item}</span>
            <Sparkles className="w-3.5 h-3.5 text-sp-on-lime opacity-60 shrink-0" aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}
