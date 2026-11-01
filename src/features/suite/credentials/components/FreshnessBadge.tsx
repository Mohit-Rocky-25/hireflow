import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { OpportunityRecord, getFreshness, FreshnessStatus } from '../types';

interface FreshnessBadgeProps {
  opportunity: Pick<OpportunityRecord, 'lastVerified' | 'verificationStatus' | 'sourceUrl' | 'datesChangeYearly'> & {
    checkedOn?: string | null;
    checkedBy?: string | null;
  };
  showIcon?: boolean;
  className?: string;
}

export function FreshnessBadge({
  opportunity,
  showIcon = true,
  className = '',
}: FreshnessBadgeProps) {
  const { lastVerified, verificationStatus, checkedOn, checkedBy, sourceUrl } = opportunity;
  const hasManualCheck = Boolean(checkedOn && verificationStatus === 'checked-manually');

  if (verificationStatus === 'expired') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border bg-rose-500/15 text-rose-400 border-rose-500/30 ${className}`}
        title="Cycle ended or archived. Verify upcoming dates on official portal."
      >
        {showIcon && <AlertCircle className="w-3 h-3 text-rose-400" />}
        <span>Expired / Past Cycle</span>
      </span>
    );
  }

  if (hasManualCheck) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ${className}`}
        title={`Manually checked on ${checkedOn}${checkedBy ? ` by ${checkedBy}` : ''}. Dates and eligibility subject to employer change.`}
      >
        {showIcon && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
        <span>Last checked: {checkedOn}</span>
      </span>
    );
  }

  // Honest default: details may be outdated
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border bg-amber-500/15 text-amber-400 border-amber-500/30 ${className}`}
      title="Details may be outdated. Check the official page before applying."
    >
      {showIcon && <Clock className="w-3 h-3 text-amber-400" />}
      <span>Details may be outdated</span>
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
