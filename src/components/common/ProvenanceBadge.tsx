import React from 'react';

export interface ProvenanceBadgeProps {
  status: 'verified' | 'needs-recheck' | 'unverified';
  source?: string | null;
  lastVerified?: string | null;
  sourceUrl?: string | null;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  status,
  source,
  lastVerified,
  sourceUrl,
  className = '',
}) => {
  const tooltipText = [
    status === 'verified'
      ? 'Verified data from primary source'
      : status === 'needs-recheck'
      ? 'Flagged for re-verification'
      : 'Unconfirmed entry — treated as unverified',
    source ? `Source: ${source}` : null,
    lastVerified ? `Verified: ${lastVerified}` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  const badgeStyles = {
    verified: 'bg-near-black text-volt border-volt/50',
    'needs-recheck': 'bg-near-black text-pale-yellow border-pale-yellow/50',
    unverified: 'bg-near-black text-silver border-charcoal',
  }[status];

  const dotColor = {
    verified: 'bg-volt',
    'needs-recheck': 'bg-pale-yellow',
    unverified: 'bg-silver',
  }[status];

  const label = {
    verified: 'Verified',
    'needs-recheck': 'Needs Recheck',
    unverified: 'Unverified',
  }[status];

  return (
    <span
      role="status"
      title={tooltipText}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[1.2px] border transition-colors select-none ${badgeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-0.5 text-white hover:text-volt transition-colors"
          aria-label={`Official source link for ${source || 'record'}`}
        >
          ↗
        </a>
      )}
    </span>
  );
};
