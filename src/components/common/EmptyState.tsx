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
      className={`flex flex-col items-center justify-center p-8 text-center bg-gray-900/40 border border-gray-800 rounded-xl space-y-3 ${className}`}
    >
      {icon ? (
        <div className="text-gray-400 mb-1">{icon}</div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-400 text-lg mb-1">
          📁
        </div>
      )}
      <h4 className="text-sm font-semibold text-gray-200">{title}</h4>
      <p className="text-xs text-gray-400 max-w-sm leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
