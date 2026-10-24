// ============================================================
// HireFlow — Advisory Eligibility Card (Stage 4)
// Compares student CGPA/percentage and batch against official drive cutoffs
// Always displays SourceChip and explicit verification advisory
// ============================================================

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Info, Edit3 } from 'lucide-react';
import { getFresherIntake, FresherIntakeData, FresherIntakeModal } from './FresherIntakeModal';
import { getMarketEntries } from '../../data/market';
import { SourceChip } from './SourceChip';
import { CompanyLogo } from './CompanyLogo';

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

  let statusText = 'Likely Eligible for Initial Screening';
  let badgeStyle = 'bg-black text-volt border border-volt/60';
  let Icon = ShieldCheck;

  if (candidatePercent >= requiredPercent) {
    statusText = 'Likely Eligible for Screening';
    badgeStyle = 'bg-black text-volt border border-volt/60';
    Icon = ShieldCheck;
  } else if (candidatePercent >= requiredPercent - 3) {
    statusText = 'Check Carefully (Borderline Cutoff)';
    badgeStyle = 'bg-black text-pale-yellow border border-pale-yellow/60';
    Icon = AlertTriangle;
  } else {
    statusText = 'Likely Below Drive Cutoff';
    badgeStyle = 'bg-black text-danger border border-danger/60';
    Icon = XCircle;
  }

  return (
    <>
      <div className={`shiny-edge-card bg-near-black border border-charcoal rounded-lg p-4 sm:p-5 shadow-level-1 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-[1px] border inline-flex items-center gap-1.5 ${badgeStyle}`}>
              <Icon className="w-3.5 h-3.5 stroke-[1.5px]" />
              {statusText}
            </span>
            <span className="text-xs text-silver hidden sm:inline-flex items-center gap-1.5 font-mono">
              · <CompanyLogo company={targetCompanyId || entry.id || entry.displayName} size="xs" showBorder={false} interactive={false} />
              <span>{entry.displayName}</span>
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-semibold uppercase tracking-[1px] text-white hover:text-volt hover:border-volt transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-black border border-charcoal px-2.5 py-1 rounded"
          >
            <Edit3 className="w-3 h-3 stroke-[1.5px]" /> Edit Profile ({intake.cgpa}{intake.cgpaScale === 10 ? '/10' : '%'}, {intake.batchYear})
          </button>
        </div>

        {/* Criteria Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black p-3 rounded border border-charcoal text-xs mb-3">
          <div>
            <span className="text-silver block text-[10px] font-bold uppercase tracking-[1.4px] mb-0.5">Your Recorded Profile</span>
            <span className="font-bold text-white">
              {intake.cgpa} {intake.cgpaScale === 10 ? 'CGPA (~' + candidatePercent + '%)' : '%'} · {intake.batchYear} Batch
            </span>
          </div>

          <div>
            <span className="text-silver block text-[10px] font-bold uppercase tracking-[1.4px] mb-0.5">Official Baseline Cutoff</span>
            <span className="font-bold text-white">
              {requiredPercent}% Aggregate (~{requiredCgpa} CGPA in 10th, 12th, Degree)
            </span>
          </div>

          <div>
            <span className="text-silver block text-[10px] font-bold uppercase tracking-[1.4px] mb-0.5">Primary Source</span>
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
        <p className="text-[11px] text-silver leading-relaxed flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-silver shrink-0 mt-0.5 stroke-[1.5px]" />
          <span>
            {eligibilityRule?.note || 'Eligibility cutoffs vary by batch, drive type (campus vs off-campus pool), and participating college tiers.'}{' '}
            <strong className="text-white">Always verify current criteria directly on the official portal for your graduating batch.</strong>
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
