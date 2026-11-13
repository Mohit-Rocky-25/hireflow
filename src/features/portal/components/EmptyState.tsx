import React from 'react';

interface EmptyStateProps {
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, description, action }) => {
  return (
    <div className="py-12 px-4 text-center font-mono text-xs">
      <div className="text-neutral-400 font-semibold mb-1">{message}</div>
      {description && <p className="text-neutral-500 max-w-sm mx-auto mb-4">{description}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-3 py-1.5 rounded border border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

