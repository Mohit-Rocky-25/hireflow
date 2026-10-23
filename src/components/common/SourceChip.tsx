// ============================================================
// HireFlow — Source Chip Component (Stage 3F)
// Visual provenance indicator for market claims, requirements, and cutoffs
// ============================================================

import React from 'react';
import { ExternalLink, HelpCircle, CheckCircle2, ShieldCheck, Newspaper } from 'lucide-react';
import { SignalKind, SignalConfidence } from '../../data/market/types';

interface SourceChipProps {
  kind: SignalKind | string;
  sourceName?: string;
  sourceUrl?: string | null;
  lastReviewed?: string;
  confidence?: SignalConfidence | string;
  className?: string;
}

export function SourceChip({
  kind,
  sourceName,
  sourceUrl,
  lastReviewed,
  confidence,
  className = '',
}: SourceChipProps) {
  const isPending = !sourceUrl && (confidence === 'unverified' || kind === 'editorial-opinion' || !sourceName);

  if (isPending) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-2 text-text-muted border border-border/80 ${className}`}
        title="Source pending: this signal is an empirical estimate awaiting primary employer documentation."
      >
        <HelpCircle className="w-2.5 h-2.5 text-text-muted" />
        <span>Source pending</span>
        {lastReviewed && <span className="opacity-75">· rev. {lastReviewed}</span>}
      </span>
    );
  }

  let badgeStyle = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let label = 'Reported';
  let Icon = Newspaper;

  switch (kind) {
    case 'official-requirement':
      badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
      label = 'Official';
      Icon = ShieldCheck;
      break;
    case 'company-published':
      badgeStyle = 'bg-blue-950/60 text-blue-300 border-blue-800/80';
      label = 'Company-published';
      Icon = CheckCircle2;
      break;
    case 'community-reported':
      badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-800/80';
      label = 'Reported';
      Icon = Newspaper;
      break;
    case 'editorial-opinion':
      badgeStyle = 'bg-purple-950/60 text-purple-300 border-purple-800/80';
      label = 'Opinion';
      Icon = HelpCircle;
      break;
    default:
      badgeStyle = 'bg-slate-800/80 text-slate-300 border-slate-700';
      label = 'Estimate';
  }

  const content = (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyle} ${className}`}>
      <Icon className="w-2.5 h-2.5" />
      <span>{label}</span>
      {sourceName && <span className="max-w-[130px] truncate opacity-85">({sourceName})</span>}
      {lastReviewed && <span className="opacity-75">· {lastReviewed}</span>}
      {sourceUrl && <ExternalLink className="w-2.5 h-2.5 opacity-80" />}
    </span>
  );

  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-90 inline-block transition-opacity"
        title={`View primary source: ${sourceName || sourceUrl} (reviewed: ${lastReviewed || 'recently'})`}
      >
        {content}
      </a>
    );
  }

  return content;
}
