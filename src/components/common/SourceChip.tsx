// ============================================================
// HireFlow — Source Chip Component (High-Contrast Dark System)
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
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[1.2px] bg-near-black text-silver border border-charcoal ${className}`}
        title="Source pending: this signal is an empirical estimate awaiting primary employer documentation."
      >
        <HelpCircle className="w-3 h-3 text-silver stroke-[1.5px]" />
        <span>Source pending</span>
        {lastReviewed && <span className="opacity-75">· rev. {lastReviewed}</span>}
      </span>
    );
  }

  let badgeStyle = 'bg-near-black text-silver border-charcoal';
  let label = 'Reported';
  let Icon = Newspaper;

  switch (kind) {
    case 'official-requirement':
      badgeStyle = 'bg-near-black text-volt border-volt/50';
      label = 'Official';
      Icon = ShieldCheck;
      break;
    case 'company-published':
      badgeStyle = 'bg-near-black text-volt border-volt/50';
      label = 'Company-published';
      Icon = CheckCircle2;
      break;
    case 'community-reported':
      badgeStyle = 'bg-near-black text-pale-yellow border-pale-yellow/50';
      label = 'Reported';
      Icon = Newspaper;
      break;
    case 'editorial-opinion':
      badgeStyle = 'bg-near-black text-silver border-charcoal';
      label = 'Opinion';
      Icon = HelpCircle;
      break;
    default:
      badgeStyle = 'bg-near-black text-silver border-charcoal';
      label = 'Estimate';
  }

  const content = (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[1.2px] border ${badgeStyle} ${className}`}>
      <Icon className="w-3 h-3 stroke-[1.5px]" />
      <span>{label}</span>
      {sourceName && <span className="max-w-[130px] truncate opacity-90">({sourceName})</span>}
      {lastReviewed && <span className="opacity-75">· {lastReviewed}</span>}
      {sourceUrl && <ExternalLink className="w-3 h-3 opacity-80 stroke-[1.5px]" />}
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
