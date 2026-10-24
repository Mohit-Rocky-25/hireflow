// ============================================================
// HIREFLOW CAREER PATH — LADDER LEVEL EXPLORER
// Interactive comparison of verified engineering career ladders
// Level progression (L3–L8, TCS Ninja/Digital/Prime, etc.)
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from '../../../components/career-path/Dropdown';
import { sanitizeUrl } from '@/lib/security';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
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
      <div className="bg-surface rounded-md p-6 border border-border space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-foreground">Explore Verified India Ladders</h2>
            <p className="text-xs text-secondary mt-0.5">
              Real promotion cadences, committee review criteria, time-in-level statistics, and verified India CTC packages.
            </p>
          </div>
          {/* Track Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted uppercase font-mono">Track:</span>
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
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-[11px] font-bold text-muted mr-1 font-mono uppercase">Segment:</span>
          <button
            type="button"
            onClick={() => setSelectedSegment('ALL')}
            className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedSegment === 'ALL'
                ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
                : 'bg-surface-2 text-muted border border-border hover:text-foreground'
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
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedSegment === seg
                    ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]'
                    : 'bg-surface-2 text-muted border border-border hover:text-foreground'
                }`}
              >
                {seg} ({count})
              </button>
            );
          })}
        </div>

        {/* Company Picker Dropdown */}
        <div className="pt-2">
          <label className="text-xs font-bold text-foreground block mb-1.5 uppercase font-mono">Select Company:</label>
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
        <div className="lg:col-span-5 bg-surface rounded-md p-5 border border-border space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CompanyLogo company={activeCompanyLadder.id} size="xs" showBorder={false} interactive={false} />
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider font-mono">
                {activeCompanyLadder.name} • {selectedTrack} Ladder
              </h3>
            </div>
            <span className="text-[11px] text-muted font-bold font-mono">
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
                  className={`group relative p-3.5 rounded border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-surface-2 border-volt shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
                      : 'bg-surface border-border hover:bg-surface-2 hover:border-border-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isSelected
                          ? 'bg-volt text-black'
                          : 'bg-surface-2 border border-border text-foreground group-hover:border-volt/50'
                      }`}
                    >
                      {lvl.levelCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-foreground group-hover:text-volt transition-colors">
                          {lvl.title}
                        </h4>
                        {lvl.isTerminal ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/30">
                            Terminal
                          </span>
                        ) : lvl.upOrOutPolicy ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Up or Out
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        {lvl.yoeTypicalMin}–{lvl.yoeTypicalMax} yrs exp • Median promo: <span className="font-mono">{lvl.timeInLevel.median}</span> yrs
                      </p>
                    </div>
                  </div>

                  <div className="text-right pl-2">
                    <p className="text-xs font-mono font-black text-foreground">
                      {formatINRRange(lvl.comp.total.p25, lvl.comp.total.p75)}
                    </p>
                    <span className="text-[10px] text-muted font-bold uppercase font-mono">Annual</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Level Panel */}
        <div className="lg:col-span-7 bg-surface rounded-md p-6 border border-border space-y-6">
          {activeDetailLevel ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-volt text-black font-mono font-black text-xs">
                      {activeDetailLevel.levelCode}
                    </span>
                    <span className="text-xs text-muted font-mono font-bold">
                      {getEquivalenceHumanLabel(activeDetailLevel.equivalenceGroup)}
                    </span>
                    {activeDetailLevel.confidence === 'verified' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified (2+ Sources)
                      </span>
                    ) : activeDetailLevel.confidence === 'community' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-2 text-muted border border-border">
                        Community Data
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        Estimate (Unverified)
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    {activeDetailLevel.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <CompanyLogo company={activeCompanyLadder.id} size="xs" showBorder={false} interactive={false} />
                    <p className="text-xs text-secondary">
                      {activeCompanyLadder.name} • Typical {activeDetailLevel.yoeTypicalMin}–{activeDetailLevel.yoeTypicalMax} Years Experience
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/tools/resume-checker"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-volt/10 hover:bg-volt/20 text-volt border border-volt/30 text-xs font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Check my resume against this level
                    </Link>
                  </div>
                </div>

                {/* Top CTC Card */}
                <div className="text-right bg-surface-2/60 p-3.5 rounded border border-border">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1 justify-end font-mono">
                    Typical Total Annual Pay Range
                    <span className="group relative cursor-help">
                      <HelpCircle className="w-3 h-3 text-muted hover:text-foreground" />
                      <span className="pointer-events-none absolute -left-48 top-5 w-56 rounded bg-foreground text-background p-2 text-[10px] font-normal leading-tight opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-30">
                        Estimated range (p25–p75) representing lower to upper quartile. Total annual pay = base + yearly bonus + yearly value of stock. Shown per year in INR.
                      </span>
                    </span>
                  </span>
                  <span className="text-2xl font-mono font-black text-volt block mt-0.5">
                    {formatINRRange(activeDetailLevel.comp.total.p25, activeDetailLevel.comp.total.p75)}
                  </span>
                  <span className="text-[10px] text-muted block mt-0.5 font-mono">
                    Median benchmark: {formatINR(activeDetailLevel.comp.total.p50)} • Verified India Office Data
                  </span>
                </div>
              </div>

              {/* Detailed Compensation Breakdown in INR */}
              <div className="bg-surface-2/40 rounded p-4 border border-border space-y-2.5">
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider font-mono">
                  Annual Compensation Breakdown (Per Year in INR)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <span className="text-[10px] text-muted block font-bold uppercase font-mono">Fixed / Base</span>
                    <span className="font-mono font-black text-foreground">{formatINR(activeDetailLevel.comp.base)}</span>
                  </div>
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <span className="text-[10px] text-muted block font-bold uppercase font-mono">Variable / Bonus</span>
                    <span className="font-mono font-black text-foreground">{formatINR(activeDetailLevel.comp.variable)}</span>
                  </div>
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <span className="text-[10px] text-muted block font-bold uppercase font-mono">Stock (Annual)</span>
                    <span className="font-mono font-black text-foreground">{formatINR(activeDetailLevel.comp.stock)}</span>
                  </div>
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <span className="text-[10px] text-muted block font-bold uppercase font-mono">Joining Bonus</span>
                    <span className="font-mono font-black text-foreground">
                      {activeDetailLevel.comp.joiningBonus ? formatINR(activeDetailLevel.comp.joiningBonus) : 'None / Discretionary'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time in Level & Velocity Stats */}
              <div className="grid sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-surface-2/40 rounded border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase font-mono">Fast-Track (p25)</span>
                  <span className="text-base font-mono font-black text-foreground">{activeDetailLevel.timeInLevel.p25} Years</span>
                </div>
                <div className="p-3 bg-surface-2/40 rounded border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase font-mono">Typical (Median)</span>
                  <span className="text-base font-mono font-black text-volt">{activeDetailLevel.timeInLevel.median} Years</span>
                </div>
                <div className="p-3 bg-surface-2/40 rounded border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase font-mono">Conservative (p75)</span>
                  <span className="text-base font-mono font-black text-foreground">{activeDetailLevel.timeInLevel.p75} Years</span>
                </div>
                <div className="p-3 bg-surface-2/40 rounded border border-border">
                  <span className="text-[10px] font-bold text-muted block uppercase font-mono">Stall Rate</span>
                  <span className="text-base font-mono font-black text-amber-400">~{activeDetailLevel.timeInLevel.stallRatePct}%</span>
                </div>
              </div>

              {/* Promotion Requirements INTO this Level */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-volt" /> Promotion Requirements Into {activeDetailLevel.levelCode}
                </h3>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-surface-2/40 rounded border border-border space-y-1">
                    <span className="font-extrabold text-foreground block uppercase font-mono text-[11px]">Scope of Ownership</span>
                    <p className="text-secondary leading-relaxed">{activeDetailLevel.promotionRequirements.scope}</p>
                  </div>
                  <div className="p-3 bg-surface-2/40 rounded border border-border space-y-1">
                    <span className="font-extrabold text-foreground block uppercase font-mono text-[11px]">Impact Expectations</span>
                    <p className="text-secondary leading-relaxed">{activeDetailLevel.promotionRequirements.impact}</p>
                  </div>
                  <div className="p-3 bg-surface-2/40 rounded border border-border space-y-1">
                    <span className="font-extrabold text-foreground block uppercase font-mono text-[11px]">Leadership & Influence</span>
                    <p className="text-secondary leading-relaxed">{activeDetailLevel.promotionRequirements.influence}</p>
                  </div>
                </div>

                {/* Concrete Promo Packet Evidence */}
                <div className="bg-surface-2/30 rounded p-3.5 border border-border space-y-1.5">
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-volt" /> Expected Promo Packet Evidence
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
                  <Clock className="w-4 h-4 text-volt" /> How Promotions Work at {activeCompanyLadder.name}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-surface-2/40 rounded border border-border">
                    <span className="text-[10px] font-bold text-muted block uppercase font-mono">Cadence & Cycle Months</span>
                    <p className="font-bold text-foreground mt-0.5">{activeDetailLevel.promotionProcess.cadence}</p>
                    <span className="text-[11px] text-secondary mt-1 block">
                      Type: {activeDetailLevel.promotionProcess.cycleType === 'cycle' ? 'Cycle-bound only' : 'Rolling & Cycle'}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-2/40 rounded border border-border">
                    <span className="text-[10px] font-bold text-muted block uppercase font-mono">Nominator & Decider</span>
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
              <div className="border border-border rounded bg-surface-2/20 overflow-hidden pt-1">
                <button
                  type="button"
                  onClick={() => setIsSourcesOpen(!isSourcesOpen)}
                  className="w-full px-4 py-3 text-left text-xs font-black text-foreground flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-volt" />
                    Where does this data come from? (Verified Sources & Verification Date)
                  </span>
                  {isSourcesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isSourcesOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-border space-y-3 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-muted pb-1 border-b border-border/40 font-mono">
                      <span>Last Verified: <strong className="text-foreground">{activeDetailLevel.lastVerified}</strong></span>
                      <span>Confidence: <strong className="text-foreground capitalize">{activeDetailLevel.confidence}</strong></span>
                    </div>
                    <p className="text-secondary">
                      All numbers reflect actual India office compensation and verified company promotion frameworks. Sourced from:
                    </p>
                    <div className="space-y-2">
                      {activeDetailLevel.sources.map((s, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded bg-surface border border-border flex items-center justify-between">
                          <div>
                            <a
                              href={sanitizeUrl(s.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-extrabold text-volt hover:underline flex items-center gap-1"
                            >
                              {s.name} <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-[10px] text-muted block mt-0.5 font-mono">
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
