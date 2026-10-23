import React from 'react';

export interface ConfidenceChipProps {
  confidence: 'high' | 'medium' | 'low';
  size?: 'sm' | 'md';
  className?: string;
}

export const ConfidenceChip: React.FC<ConfidenceChipProps> = ({
  confidence,
  size = 'md',
  className = '',
}) => {
  const styles = {
    high: 'bg-near-black text-volt border border-volt/60',
    medium: 'bg-near-black text-pale-yellow border border-pale-yellow/60',
    low: 'bg-near-black text-silver border border-charcoal',
  }[confidence];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]';

  const label = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  }[confidence];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded uppercase tracking-[1.2px] select-none ${styles} ${sizeStyles} ${className}`}
      aria-label={`Confidence level: ${confidence}`}
    >
      {label}
    </span>
  );
};
