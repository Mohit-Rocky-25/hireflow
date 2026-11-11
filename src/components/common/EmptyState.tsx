import React from 'react';
import { FolderOpen } from 'lucide-react';

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
      className={`flex flex-col items-center justify-center p-8 text-center bg-surface-1 border border-border-default rounded-lg space-y-3 ${className}`}
    >
      {icon ? (
        <div className="text-text-secondary mb-1 stroke-[1.5px]">{icon}</div>
      ) : (
        <div className="w-10 h-10 rounded bg-surface-2 border border-border-subtle flex items-center justify-center text-text-secondary mb-1">
          <FolderOpen className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
      <h4 className="text-role-h4 font-bold text-text-primary">{title}</h4>
      <p className="text-role-body-sm text-text-secondary max-w-sm leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 text-role-body-sm font-semibold text-text-on-accent bg-accent hover:bg-accent-hover active:bg-accent-pressed border border-accent rounded transition-colors focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
