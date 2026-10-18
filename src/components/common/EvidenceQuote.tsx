import React from 'react';

export interface EvidenceQuoteProps {
  phrase: string;
  section?: string | null;
  level?: number | string | null;
  className?: string;
}

export const EvidenceQuote: React.FC<EvidenceQuoteProps> = ({
  phrase,
  section,
  level,
  className = '',
}) => {
  return (
    <div
      className={`flex items-start gap-2.5 p-2.5 bg-gray-900/60 border border-gray-800 rounded-lg text-xs ${className}`}
    >
      <span className="text-gray-500 font-serif text-base select-none leading-none">“</span>
      <div className="flex-1 space-y-1">
        <p className="text-gray-200 font-mono italic leading-relaxed break-words">
          {phrase}
        </p>
        <div className="flex items-center gap-2 pt-0.5">
          {section && (
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider bg-gray-800/80 px-1.5 py-0.5 rounded">
              Section: {section}
            </span>
          )}
          {level !== undefined && level !== null && (
            <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider bg-indigo-950/50 border border-indigo-800/40 px-1.5 py-0.5 rounded">
              Evidence Level L{level}
            </span>
          )}
        </div>
      </div>
      <span className="text-gray-500 font-serif text-base select-none leading-none">”</span>
    </div>
  );
};
