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
    high: 'bg-emerald-950/70 text-emerald-300 border-emerald-600/40',
    medium: 'bg-amber-950/70 text-amber-300 border-amber-600/40',
    low: 'bg-gray-800/80 text-gray-300 border-gray-600/40',
  }[confidence];

  const sizeStyles = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  const label = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  }[confidence];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-wide uppercase ${styles} ${sizeStyles} ${className}`}
      aria-label={`Confidence level: ${confidence}`}
    >
      {label}
    </span>
  );
};
