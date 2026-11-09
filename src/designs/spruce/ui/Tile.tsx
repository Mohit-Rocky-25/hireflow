import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Tile({
  illustration,
  title,
  description,
  badge,
  href,
  onClick,
  selected = false,
  className = '',
  ...props
}: TileProps) {
  const content = (
    <div
      className={`rounded-sp-xl p-6 border transition-colors duration-150 relative flex flex-col justify-between group ${
        selected
          ? 'border-2 border-sp-primary bg-sp-mint-50'
          : 'border-sp-hairline bg-sp-surface hover:bg-sp-mint-50 cursor-pointer'
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className="absolute top-5 right-5 text-sp-primary-text group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
      </div>

      <div className="flex flex-col gap-4">
        {illustration && (
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            {illustration}
          </div>
        )}
        {badge && <div>{badge}</div>}
        <div>
          <h3 className="sp-h3 text-sp-ink">{title}</h3>
          <p className="sp-body-sm text-sp-muted mt-1.5 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline">
        {content}
      </a>
    );
  }

  return content;
}
