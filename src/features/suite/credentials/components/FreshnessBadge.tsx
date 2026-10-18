import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, ExternalLink, Calendar } from 'lucide-react';
import { OpportunityRecord, getFreshness, FreshnessStatus } from '../types';

interface FreshnessBadgeProps {
  opportunity: Pick<OpportunityRecord, 'lastVerified' | 'verificationStatus' | 'sourceUrl' | 'datesChangeYearly'>;
  showIcon?: boolean;
  className?: string;
}

export function FreshnessBadge({
  opportunity,
  showIcon = true,
  className = '',
}: FreshnessBadgeProps) {
  const freshness: FreshnessStatus = getFreshness(opportunity, new Date());
  const { lastVerified, verificationStatus } = opportunity;

  let badgeStyle = 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
  let label = 'Unverified';
  let icon = <AlertTriangle className="w-3 h-3" />;
  let tooltip = 'Unverified listing. Dates and fees change yearly, confirm on the official page.';

  if (verificationStatus === 'verified' && freshness === 'fresh') {
    badgeStyle = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    label = lastVerified ? `Fresh (${lastVerified})` : 'Fresh';
    icon = <ShieldCheck className="w-3 h-3 text-emerald-500" />;
    tooltip = `Last verified on ${lastVerified || 'recent date'}. Dates and fees change yearly, confirm on the official page.`;
  } else if (freshness === 'aging' || verificationStatus === 'needs-recheck') {
    badgeStyle = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    label = lastVerified ? `Aging (${lastVerified})` : 'Needs Recheck';
    icon = <Clock className="w-3 h-3 text-amber-500" />;
    tooltip = `Last verified on ${lastVerified || 'prior cycle'}. Dates and fees change yearly, confirm on the official page.`;
  } else if (freshness === 'stale' && verificationStatus === 'verified') {
    badgeStyle = 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
    label = lastVerified ? `Stale (${lastVerified})` : 'Stale';
    icon = <Clock className="w-3 h-3 text-orange-500" />;
    tooltip = `Last verified on ${lastVerified}. Dates and fees change yearly, confirm on the official page.`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border ${badgeStyle} ${className}`}
      title={tooltip}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
}

interface OfficialSourceLinkProps {
  sourceUrl: string | null;
  className?: string;
}

export function OfficialSourceLink({ sourceUrl, className = '' }: OfficialSourceLinkProps) {
  if (!sourceUrl) {
    return (
      <span className={`text-xs text-text-muted font-medium italic ${className}`}>
        Source not confirmed
      </span>
    );
  }

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition-colors ${className}`}
      title={`Open official source: ${sourceUrl}`}
    >
      <span>Official source</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

interface DatesChangeNoticeProps {
  datesChangeYearly: boolean;
  className?: string;
}

export function DatesChangeNotice({ datesChangeYearly, className = '' }: DatesChangeNoticeProps) {
  if (!datesChangeYearly) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-medium ${className}`}
      title="Dates change every year, check the official page before planning."
    >
      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span>Dates change every year, check the official page before planning.</span>
    </div>
  );
}
