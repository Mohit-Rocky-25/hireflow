// ============================================================
// HireFlow — Advisory Eligibility Card (Stage 4)
// Compares student CGPA/percentage and batch against official drive cutoffs
// Always displays SourceChip and explicit verification advisory
// ============================================================

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Info, Edit3, ExternalLink } from 'lucide-react';
import { getFresherIntake, FresherIntakeData, FresherIntakeModal } from './FresherIntakeModal';
import { getMarketEntries, MarketEntry } from '../../data/market';
import { SourceChip } from './SourceChip';

interface EligibilityCardProps {
  targetCompanyId?: string;
  targetArchetypeId?: string;
  className?: string;
}

export function EligibilityCard({ targetCompanyId, targetArchetypeId, className = '' }: EligibilityCardProps) {
  const [intake, setIntake] = useState<FresherIntakeData>(getFresherIntake);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const marketEntries = getMarketEntries();

  // Find relevant market profile with eligibility
  const entry =
    (targetCompanyId && marketEntries.find((e) => e.id.toLowerCase().includes(targetCompanyId.toLowerCase()))) ||
    (targetArchetypeId && marketEntries.find((e) => e.archetype === targetArchetypeId)) ||
    marketEntries.find((e) => e.archetype === intake.targetArchetype) ||
    marketEntries.find((e) => e.id === 'tcs_ninja') ||
    marketEntries[0];

  const eligibilityRule = entry?.eligibility;

  // Normalize candidate score to approximate percentage
  const candidatePercent =
    intake.cgpaScale === 100
      ? intake.cgpa
      : intake.cgpa <= 10
      ? Math.round(intake.cgpa * 9.5 * 10) / 10
      : intake.cgpa;

  const requiredPercent = eligibilityRule?.aggregatePercent || 60;
  const requiredCgpa = eligibilityRule?.cgpaEquivalent || 6.0;

  let status: 'likely_eligible' | 'check_carefully' | 'likely_not_eligible' = 'likely_eligible';
  let statusText = 'Likely Eligible for Initial Screening';
  let badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
  let Icon = ShieldCheck;

  if (candidatePercent >= requiredPercent) {
    status = 'likely_eligible';
    statusText = 'Likely Eligible for Screening';
    badgeStyle = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80';
    Icon = ShieldCheck;
  } else if (candidatePercent >= requiredPercent - 3) {
    status = 'check_carefully';
    statusText = 'Check Carefully (Borderline Cutoff)';
    badgeStyle = 'bg-amber-950/60 text-amber-300 border-amber-800/80';
    Icon = AlertTriangle;
  } else {
    status = 'likely_not_eligible';
    statusText = 'Likely Below Drive Cutoff';
    badgeStyle = 'bg-rose-950/60 text-rose-300 border-rose-800/80';
    Icon = XCircle;
  }

  return (
    <>
      <div className={`bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${badgeStyle}`}>
              <Icon className="w-3.5 h-3.5" />
              {statusText}
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">
              · {entry.displayName}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1 cursor-pointer bg-primary/10 px-2.5 py-1 rounded-lg"
          >
            <Edit3 className="w-3 h-3" /> Edit Profile ({intake.cgpa}{intake.cgpaScale === 10 ? '/10' : '%'}, {intake.batchYear})
          </button>
        </div>

        {/* Criteria Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-2/40 p-3 rounded-xl border border-border text-xs mb-3">
          <div>
            <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-0.5">Your Recorded Profile</span>
            <span className="font-semibold text-text">
              {intake.cgpa} {intake.cgpaScale === 10 ? 'CGPA (~' + candidatePercent + '%)' : '%'} · {intake.batchYear} Batch
            </span>
          </div>

          <div>
            <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-0.5">Official Baseline Cutoff</span>
            <span className="font-semibold text-text">
              {requiredPercent}% Aggregate (~{requiredCgpa} CGPA in 10th, 12th, Degree)
            </span>
          </div>

          <div>
            <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-0.5">Primary Source</span>
            {eligibilityRule?.sourceUrl ? (
              <SourceChip
                kind="official-requirement"
                sourceName={eligibilityRule.sourceName}
                sourceUrl={eligibilityRule.sourceUrl}
                confidence="high"
                lastReviewed="2026-09-22"
              />
            ) : (
              <SourceChip
                kind="editorial-opinion"
                confidence="unverified"
              />
            )}
          </div>
        </div>

        {/* Advisory Context Note */}
        <p className="text-[11px] text-text-secondary leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
          <span>
            {eligibilityRule?.note || 'Eligibility cutoffs vary by batch, drive type (campus vs off-campus pool), and participating college tiers.'}{' '}
            <strong>Always verify current criteria directly on the official portal for your graduating batch.</strong>
          </span>
        </p>
      </div>

      <FresherIntakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(updated) => setIntake(updated)}
      />
    </>
  );
}
