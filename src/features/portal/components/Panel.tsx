import React from 'react';

interface PanelProps {
  title: string;
  count?: number | string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  count,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = 'max-h-[480px] overflow-y-auto custom-scrollbar',
}) => {
  return (
    <section className={`bg-[#10100d] border border-neutral-800 rounded flex flex-col ${className}`}>
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-200">
              {title}
            </h2>
            {count !== undefined && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-800 text-neutral-400">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
};

