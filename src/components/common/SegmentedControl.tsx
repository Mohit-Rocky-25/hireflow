/**
 * HireFlow v4: SegmentedControl Component (X1.7)
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
      className={`inline-flex rounded-lg border border-slate-800 bg-slate-950/80 p-1 text-slate-300 ${
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
            className={`flex items-center gap-1.5 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'
            } ${
              isSelected
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
