import React from 'react';
import { AlertCircle } from 'lucide-react';

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
      className={`p-4 bg-near-black border border-danger/60 rounded-lg text-white space-y-2 ${className}`}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-danger shrink-0 stroke-[1.5px]" aria-hidden="true" />
        <h5 className="font-bold text-[14px] text-danger">{title}</h5>
      </div>
      <p className="text-[13px] text-silver leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt hover:text-volt rounded transition-colors active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
