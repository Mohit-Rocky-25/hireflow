/**
 * HireFlow: SegmentedControl Component (High-Contrast Dark System)
 * Keyboard-navigable segmented button group for tabs, variants, and filters.
 */

import React from 'react';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  name: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  name,
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel || name}
      className={`inline-flex rounded border border-charcoal bg-near-black p-1 text-silver ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded font-semibold uppercase tracking-[1.2px] transition-colors focus-visible:outline-2 focus-visible:outline-volt ${
              size === 'sm' ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-[12px]'
            } ${
              isSelected
                ? 'bg-black text-volt border border-volt/60 shadow-inset'
                : 'text-silver hover:text-white hover:bg-hover-gray border border-transparent active:text-pale-yellow'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
