import React from 'react';

export interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-near-black border border-charcoal rounded-lg space-y-3 ${className}`}
    >
      {icon ? (
        <div className="text-silver mb-1 stroke-[1.5px]">{icon}</div>
      ) : (
        <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-silver text-lg mb-1">
          📁
        </div>
      )}
      <h4 className="text-[16px] font-bold text-white">{title}</h4>
      <p className="text-[14px] text-silver max-w-sm leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-[13px] font-bold text-text-on-accent bg-volt hover:bg-[#1d1d1d] hover:text-white border border-volt rounded transition-colors active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
