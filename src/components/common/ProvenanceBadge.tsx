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
    verified: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/50',
    'needs-recheck': 'bg-amber-950/80 text-amber-300 border-amber-700/50',
    unverified: 'bg-gray-800/80 text-gray-400 border-gray-700/50',
  }[status];

  const dotColor = {
    verified: 'bg-emerald-400',
    'needs-recheck': 'bg-amber-400',
    unverified: 'bg-gray-500',
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
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${badgeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{label}</span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-0.5 hover:underline opacity-80"
          aria-label={`Official source link for ${source || 'record'}`}
        >
          ↗
        </a>
      )}
    </span>
  );
};
