// ============================================================
// HIREFLOW CAREER PATH — LADDER LEVEL EXPLORER
// Interactive comparison of verified engineering career ladders
// Level progression (L3–L8, TCS Ninja/Digital/Prime, etc.)
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from '../../../components/career-path/Dropdown';
import { sanitizeUrl } from '@/lib/security';
import {
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Target,
  Info,
} from 'lucide-react';
import {
  getAllCompanies,
  getCompanyLadder,
  getLevelsForCompanyAndTrack,
  getAllMarketSegments,
  filterByMarketSegment,
  getEquivalenceHumanLabel,
} from '../../../data/careerLadders';
import type {
  CareerLevel,
  CareerTrack,
  CompanyLadder,
  MarketSegment,
  StructuredBlocker,
} from '../../../data/careerLadders/types';
import { formatINR, formatINRRange } from '../../../lib/careerEngine';
import { PromotionBlockersChecklist } from './PromotionBlockersChecklist';

export interface LadderLevelExplorerProps {
  initialCompanyId?: string;
  initialTrack?: CareerTrack;
  initialSegment?: MarketSegment | 'ALL';
  onLevelSelect?: (level: CareerLevel, company: CompanyLadder) => void;
}

export function LadderLevelExplorer({
  initialCompanyId = 'google',
  initialTrack = 'SWE',
  initialSegment = 'ALL',
  onLevelSelect,
}: LadderLevelExplorerProps) {
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>(initialTrack);
  const [selectedSegment, setSelectedSegment] = useState<MarketSegment | 'ALL'>(initialSegment);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const allMarketSegments = getAllMarketSegments();
  const allCompanies = getAllCompanies();

  const filteredCompanies =
    selectedSegment === 'ALL'
      ? allCompanies
      : allCompanies.filter((c) => c.marketSegment === selectedSegment);

  const activeCompanyLadder: CompanyLadder =
    getCompanyLadder(selectedCompanyId) || allCompanies[0];

  const activeLadderLevels: CareerLevel[] = getLevelsForCompanyAndTrack(
    activeCompanyLadder.id,
    selectedTrack
  );

  const [selectedLevelCode, setSelectedLevelCode] = useState<string>(
    activeLadderLevels[0]?.levelCode || ''
  );

  const activeDetailLevel: CareerLevel | undefined =
    activeLadderLevels.find((lvl) => lvl.levelCode === selectedLevelCode) ||
    activeLadderLevels[0];

  const handleSelectLevel = (lvl: CareerLevel) => {
    setSelectedLevelCode(lvl.levelCode);
    onLevelSelect?.(lvl, activeCompanyLadder);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Market Segment & Filter Header */}
      <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground">Explore Verified India Ladders</h2>
            <p className="text-xs text-secondary mt-0.5">
              Real promotion cadences, committee review criteria, time-in-level statistics, and verified India CTC packages.
            </p>
          </div>
          {/* Track Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted uppercase">Track:</span>
            <div className="w-60">
              <Dropdown
                value={selectedTrack}
                onChange={(val) => {
                  const newTrack = val as CareerTrack;
                  setSelectedTrack(newTrack);
                  const firstLvl = getLevelsForCompanyAndTrack(selectedCompanyId, newTrack)[0];
                  if (firstLvl) setSelectedLevelCode(firstLvl.levelCode);
                }}
                options={[
                  { value: 'SWE', label: 'Software Engineering (SWE)', sublabel: 'IC Engineering track' },
                  { value: 'EM', label: 'Engineering Management (EM)', sublabel: 'People management track' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Market Segment Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
          <span className="text-[11px] font-bold text-muted mr-1">Market Segment:</span>
          <button
            type="button"
            onClick={() => setSelectedSegment('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedSegment === 'ALL'
                ? 'bg-foreground text-background'
                : 'bg-surface-2 text-muted hover:text-foreground'
            }`}
          >
            All Segments ({allCompanies.length})
          </button>
          {allMarketSegments.map((seg) => {
            const count = filterByMarketSegment(seg).length;
            return (
              <button
                key={seg}
                type="button"
                onClick={() => setSelectedSegment(seg)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedSegment === seg
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-2 text-muted hover:text-foreground'
                }`}
              >
                {seg} ({count})
              </button>
            );
          })}
        </div>

        {/* Company Picker Dropdown */}
        <div className="pt-2">
          <label className="text-xs font-bold text-foreground block mb-1.5">Select Company:</label>
          <div className="w-full sm:w-80">
            <Dropdown
              searchable={true}
              value={selectedCompanyId}
              onChange={(val) => {
                setSelectedCompanyId(val);
                const firstLvl = getLevelsForCompanyAndTrack(val, selectedTrack)[0];
                if (firstLvl) setSelectedLevelCode(firstLvl.levelCode);
              }}
              options={filteredCompanies.map((c) => ({
                value: c.id,
                label: c.name,
                sublabel: c.marketSegment,
                category: c.marketSegment,
              }))}
              placeholder="Select company..."
            />
          </div>
        </div>
      </div>

      {/* Ladder Stepper Layout */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vertical Ladder Stepper */}
        <div className="lg:col-span-5 bg-surface rounded-2xl p-5 border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
              {activeCompanyLadder.name} • {selectedTrack} Ladder
            </h3>
            <span className="text-[11px] text-muted font-bold">
              {activeLadderLevels.length} Levels
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {activeLadderLevels.map((lvl) => {
              const isSelected = activeDetailLevel?.levelCode === lvl.levelCode;
              return (
                <div
                  key={lvl.levelCode}
                  onClick={() => handleSelectLevel(lvl)}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                      : 'bg-surface-2/60 border-border hover:bg-surface-2 hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface border border-border text-foreground group-hover:border-primary/50'
                      }`}
                    >
                      {lvl.levelCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                          {lvl.title}
                        </h4>
                        {lvl.isTerminal ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Terminal
                          </span>
                        ) : lvl.upOrOutPolicy ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            Up or Out
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        {lvl.yoeTypicalMin}–{lvl.yoeTypicalMax} yrs exp • Median promo: {lvl.timeInLevel.median} yrs
                      </p>
                    </div>
                  </div>

                  <div className="text-right pl-2">
                    <p className="text-xs font-black text-foreground">
                      {formatINRRange(lvl.comp.total.p25, lvl.comp.total.p75)}
                    </p>
                    <span className="text-[10px] text-muted font-bold">Annual Range</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Level Panel */}
        <div className="lg:col-span-7 bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
          {activeDetailLevel ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-black text-xs">
                      {activeDetailLevel.levelCode}
                    </span>
                    <span className="text-xs text-muted font-bold">
                      {getEquivalenceHumanLabel(activeDetailLevel.equivalenceGroup)}
                    </span>
                    {activeDetailLevel.confidence === 'verified' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified (2+ Sources)
                      </span>
                    ) : activeDetailLevel.confidence === 'community' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Community Data
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Estimate (Unverified)
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    {activeDetailLevel.title}
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    {activeCompanyLadder.name} • Typical {activeDetailLevel.yoeTypicalMin}–{activeDetailLevel.yoeTypicalMax} Years Experience
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/tools/resume-checker"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Check my resume against this level
                    </Link>
                  </div>
                </div>

                {/* Top CTC Card */}
                <div className="text-right bg-surface-2/60 p-3 rounded-xl border border-border">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1 justify-end">
                    Typical Total Annual Pay Range
                    <span className="group relative cursor-help">
                      <HelpCircle className="w-3 h-3 text-muted hover:text-foreground" />
                      <span className="pointer-events-none absolute -left-48 top-5 w-56 rounded-lg bg-foreground text-background p-2 text-[10px] font-normal leading-tight opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-30">
                        Estimated range (p25–p75) representing lower to upper quartile. Total annual pay = base + yearly bonus + yearly value of stock. Shown per year in INR.
                      </span>
                    </span>
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {formatINRRange(activeDetailLevel.comp.total.p25, activeDetailLevel.comp.total.p75)}
                  </span>
                  <span className="text-[10px] text-muted block mt-0.5">
                    Median benchmark: {formatINR(activeDetailLevel.comp.total.p50)} • Verified India Office Data
                  </span>
                </div>
              </div>

              {/* Detailed Compensation Breakdown in INR */}
              <div className="bg-surface-2/40 rounded-xl p-4 border border-border space-y-2.5">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                  Annual Compensation Breakdown (Per Year in INR)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-surface p-2.5 rounded-lg border border-border">
                    <span className="text-[10px] text-muted block font-bold">Fixed / Base Pay</span>
                    <span className="font-extrabold text-foreground">{formatINR(activeDetailLevel.comp.base)}</span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-lg border border-border">
                    <span className="text-[10px] text-muted block font-bold">Variable / Bonus</span>
                    <span className="font-extrabold text-foreground">{formatINR(activeDetailLevel.comp.variable)}</span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-lg border border-border">
                    <span className="text-[10px] text-muted block font-bold">Stock (Annual Vesting)</span>
                    <span className="font-extrabold text-foreground">{formatINR(activeDetailLevel.comp.stock)}</span>
                  </div>
                  <div className="bg-surface p-2.5 rounded-lg border border-border">
                    <span className="text-[10px] text-muted block font-bold">Joining Bonus (Known)</span>
                    <span className="font-extrabold text-foreground">
                      {activeDetailLevel.comp.joiningBonus ? formatINR(activeDetailLevel.comp.joiningBonus) : 'None / Discretionary'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time in Level & Velocity Stats */}
              <div className="grid sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase">Fast-Track (p25)</span>
                  <span className="text-base font-black text-foreground">{activeDetailLevel.timeInLevel.p25} Years</span>
                </div>
                <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase">Typical (Median)</span>
                  <span className="text-base font-black text-primary">{activeDetailLevel.timeInLevel.median} Years</span>
                </div>
                <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase">Conservative (p75)</span>
                  <span className="text-base font-black text-foreground">{activeDetailLevel.timeInLevel.p75} Years</span>
                </div>
                <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase">Stall Rate</span>
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">~{activeDetailLevel.timeInLevel.stallRatePct}%</span>
                </div>
              </div>

              {/* Promotion Requirements INTO this Level */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Promotion Requirements Into {activeDetailLevel.levelCode}
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-surface-2/40 rounded-xl border border-border space-y-1">
                    <span className="font-extrabold text-foreground block">Scope of Ownership</span>
                    <p className="text-secondary leading-relaxed">{activeDetailLevel.promotionRequirements.scope}</p>
                  </div>
                  <div className="p-3 bg-surface-2/40 rounded-xl border border-border space-y-1">
                    <span className="font-extrabold text-foreground block">Impact Expectations</span>
                    <p className="text-secondary leading-relaxed">{activeDetailLevel.promotionRequirements.impact}</p>
                  </div>
                  <div className="p-3 bg-surface-2/40 rounded-xl border border-border space-y-1">
                    <span className="font-extrabold text-foreground block">Leadership & Influence</span>
                    <p className="text-secondary leading-relaxed">{activeDetailLevel.promotionRequirements.influence}</p>
                  </div>
                </div>

                {/* Concrete Promo Packet Evidence */}
                <div className="bg-surface-2/30 rounded-xl p-3.5 border border-border space-y-1.5">
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Expected Promo Packet Evidence
                  </span>
                  <ul className="space-y-1 text-xs text-secondary list-disc list-inside">
                    {activeDetailLevel.promotionRequirements.evidence.map((ev, idx) => (
                      <li key={idx} className="leading-relaxed">{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* How Promotion Process Works */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> How Promotions Work at {activeCompanyLadder.name}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                    <span className="text-[10px] font-bold text-muted block uppercase">Cadence & Cycle Months</span>
                    <p className="font-bold text-foreground mt-0.5">{activeDetailLevel.promotionProcess.cadence}</p>
                    <span className="text-[11px] text-secondary mt-1 block">
                      Type: {activeDetailLevel.promotionProcess.cycleType === 'cycle' ? 'Cycle-bound only' : 'Rolling & Cycle'}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                    <span className="text-[10px] font-bold text-muted block uppercase">Nominator & Decider</span>
                    <p className="font-bold text-foreground mt-0.5">{activeDetailLevel.promotionProcess.nominator}</p>
                    <span className="text-[11px] text-secondary mt-1 block">
                      Decider: {activeDetailLevel.promotionProcess.decider} ({activeDetailLevel.promotionProcess.calibrationLayers} layers)
                    </span>
                  </div>
                </div>
              </div>

              {/* Common Reasons Promotions Get Blocked */}
              <PromotionBlockersChecklist
                blockers={activeDetailLevel.promotionProcess.blockers}
                mode="category-accordion"
              />

              {/* Where does this data come from? (Collapsible Section) */}
              <div className="border border-border rounded-xl bg-surface-2/20 overflow-hidden pt-1">
                <button
                  type="button"
                  onClick={() => setIsSourcesOpen(!isSourcesOpen)}
                  className="w-full px-4 py-3 text-left text-xs font-black text-foreground flex items-center justify-between hover:bg-surface-2/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    Where does this data come from? (Verified Sources & Verification Date)
                  </span>
                  {isSourcesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isSourcesOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/60 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-muted pb-1 border-b border-border/40">
                      <span>Last Verified: <strong className="text-foreground">{activeDetailLevel.lastVerified}</strong></span>
                      <span>Confidence: <strong className="text-foreground capitalize">{activeDetailLevel.confidence}</strong></span>
                    </div>
                    <p className="text-secondary">
                      All numbers reflect actual India office compensation and verified company promotion frameworks. Sourced from:
                    </p>
                    <div className="space-y-2">
                      {activeDetailLevel.sources.map((s, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between">
                          <div>
                            <a
                              href={sanitizeUrl(s.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-extrabold text-primary hover:underline flex items-center gap-1"
                            >
                              {s.name} <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-[10px] text-muted block mt-0.5">
                              Extracted: {s.extractedFields.join(', ')} • Retrieved on {s.retrievedAt}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted">Select a level on the left to inspect requirements.</div>
          )}
        </div>
      </div>
    </div>
  );
}
