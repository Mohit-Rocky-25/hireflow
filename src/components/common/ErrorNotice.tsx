import React from 'react';

export interface ErrorNoticeProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-200 text-xs space-y-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
        <h5 className="font-semibold text-red-100">{title}</h5>
      </div>
      <p className="text-red-300/90 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-2.5 py-1 text-xs font-medium text-white bg-red-900/80 hover:bg-red-800 rounded-md border border-red-700/50 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
