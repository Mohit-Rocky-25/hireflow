// ============================================================
// Career Path & Promotion Level Simulator
// Deterministic promotion roadmaps, company ladders, and comp bands
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  Building2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  Award,
  Users,
  Compass,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getAllCompanies,
  getCompanyLadder,
  getLevelsForCompanyAndTrack,
  searchLevels,
  getFuzzySuggestion,
  getLevel,
} from '../../data/careerLadders';
import type {
  CareerLevel,
  CareerTrack,
  CompanyLadder,
} from '../../data/careerLadders/types';
import {
  resolvePath,
  convertComp,
  DEFAULT_USD_INR_RATE,
  type PerformanceBracket,
  type PromotionPlan,
} from '../../lib/careerEngine';

export function CareerPathSimulator() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'simulator'>('simulator');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');

  // ─────────────────────────────────────────────────────────────
  // SUBSECTION 1: Company Ladder Explorer State
  // ─────────────────────────────────────────────────────────────
  const allCompanies = useMemo(() => getAllCompanies(), []);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('google');
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>('SWE');
  const [selectedLevelCode, setSelectedLevelCode] = useState<string | null>('L5');

  const activeCompanyLadder = useMemo(() => {
    return getCompanyLadder(selectedCompanyId) || allCompanies[0];
  }, [selectedCompanyId, allCompanies]);

  const activeLadderLevels = useMemo(() => {
    const lvls = getLevelsForCompanyAndTrack(activeCompanyLadder.id, selectedTrack);
    return lvls.length > 0 ? lvls : getLevelsForCompanyAndTrack(activeCompanyLadder.id, 'SWE');
  }, [activeCompanyLadder, selectedTrack]);

  const activeDetailLevel = useMemo(() => {
    if (!selectedLevelCode) return activeLadderLevels[0] || null;
    return (
      activeLadderLevels.find((l) => l.levelCode === selectedLevelCode) ||
      activeLadderLevels[0] ||
      null
    );
  }, [activeLadderLevels, selectedLevelCode]);

  // ─────────────────────────────────────────────────────────────
  // SUBSECTION 2: Promotion Roadmap Simulator State
  // ─────────────────────────────────────────────────────────────
  const [sourceCompanyId, setSourceCompanyId] = useState<string>('google');
  const [sourceLevelCode, setSourceLevelCode] = useState<string>('L4');
  const [targetCompanyId, setTargetCompanyId] = useState<string>('google');
  const [targetLevelCode, setTargetLevelCode] = useState<string>('L6');
  const [simTrack, setSimTrack] = useState<CareerTrack>('SWE');
  const [targetTrack, setTargetTrack] = useState<CareerTrack>('SWE');
  const [performanceBracket, setPerformanceBracket] = useState<PerformanceBracket>('MEETS');
  const [yearsInCurrentLevel, setYearsInCurrentLevel] = useState<number>(1.0);

  // Autocomplete search states
  const [sourceSearchQuery, setSourceSearchQuery] = useState<string>('');
  const [targetSearchQuery, setTargetSearchQuery] = useState<string>('');
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

  const [simulationResult, setSimulationResult] = useState<PromotionPlan | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sourceDropdownRef.current &&
        !sourceDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSourceDropdownOpen(false);
      }
      if (
        targetDropdownRef.current &&
        !targetDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTargetDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute fuzzy matches for inputs
  const sourceMatches = useMemo(() => {
    return searchLevels(sourceSearchQuery);
  }, [sourceSearchQuery]);

  const targetMatches = useMemo(() => {
    return searchLevels(targetSearchQuery);
  }, [targetSearchQuery]);

  const sourceFuzzySuggestion = useMemo(() => {
    return getFuzzySuggestion(sourceSearchQuery);
  }, [sourceSearchQuery]);

  const targetFuzzySuggestion = useMemo(() => {
    return getFuzzySuggestion(targetSearchQuery);
  }, [targetSearchQuery]);

  const currentSourceCompany = useMemo(() => {
    return getCompanyLadder(sourceCompanyId);
  }, [sourceCompanyId]);

  const currentSourceLevel = useMemo(() => {
    return getLevel(sourceCompanyId, sourceLevelCode, simTrack);
  }, [sourceCompanyId, sourceLevelCode, simTrack]);

  const currentTargetCompany = useMemo(() => {
    return getCompanyLadder(targetCompanyId);
  }, [targetCompanyId]);

  const currentTargetLevel = useMemo(() => {
    return getLevel(targetCompanyId, targetLevelCode, targetTrack);
  }, [targetCompanyId, targetLevelCode, targetTrack]);

  const handleSelectSource = (companyId: string, levelCode: string, track: CareerTrack) => {
    setSourceCompanyId(companyId);
    setSourceLevelCode(levelCode);
    setSimTrack(track);
    setSourceSearchQuery('');
    setIsSourceDropdownOpen(false);
  };

  const handleSelectTarget = (companyId: string, levelCode: string, track: CareerTrack) => {
    setTargetCompanyId(companyId);
    setTargetLevelCode(levelCode);
    setTargetTrack(track);
    setTargetSearchQuery('');
    setIsTargetDropdownOpen(false);
  };

  const sourceLevelsForSim = useMemo(() => {
    return getLevelsForCompanyAndTrack(sourceCompanyId, simTrack);
  }, [sourceCompanyId, simTrack]);

  const targetLevelsForSim = useMemo(() => {
    return getLevelsForCompanyAndTrack(targetCompanyId, targetTrack);
  }, [targetCompanyId, targetTrack]);

  // Run simulation
  const handleSimulate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const plan = resolvePath(
          { companyId: sourceCompanyId, levelCode: sourceLevelCode, track: simTrack },
          { companyId: targetCompanyId, levelCode: targetLevelCode, track: targetTrack },
          {
            performanceBracket,
            yearsInCurrentLevel,
            currency,
            exchangeRateUsdToInr: DEFAULT_USD_INR_RATE,
          }
        );
        setSimulationResult(plan);
      } catch (err) {
        console.error('Promotion path resolution error:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 280);
  };

  const handleResetSimulator = () => {
    setSimulationResult(null);
  };

  // Helper formatting for currency
  const formatCurrency = (val: number, cur: 'USD' | 'INR') => {
    if (cur === 'INR') {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-bg text-text pt-20 pb-16 px-4 md:px-8 relative">
      {/* Top Left Navigation Link */}
      <div className="max-w-7xl mx-auto mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Real Company Ladder & Promotion Data
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
            Career Path & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Promotion Simulator</span>
          </h1>
          <p className="text-secondary text-base md:text-lg">
            Explore verified engineering ladders, promotion requirements, and compensation bands.
            Simulate realistic, deterministic promotion timelines across Big Tech and India product unicorns.
          </p>

          {/* Global Currency Switcher */}
          <div className="mt-4 inline-flex items-center gap-3 bg-surface border border-border rounded-full px-4 py-1.5 shadow-sm text-xs font-semibold">
            <span className="text-muted">Display Currency:</span>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-0.5 rounded-full transition-all ${
                currency === 'USD'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-secondary hover:text-text'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-2.5 py-0.5 rounded-full transition-all ${
                currency === 'INR'
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'text-secondary hover:text-text'
              }`}
            >
              INR (₹)
            </button>
            <span className="text-[10px] text-muted border-l border-border pl-2">
              Rate: 1 USD = {DEFAULT_USD_INR_RATE} INR
            </span>
          </div>
        </div>

        {/* Top Two Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-surface-2 border border-border rounded-xl shadow-xs gap-1">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-surface text-foreground shadow-sm border border-border/60'
                  : 'text-secondary hover:text-text'
              }`}
            >
              <Compass className="w-4 h-4 text-primary" />
              Promotion Roadmap Simulator
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'explorer'
                  ? 'bg-surface text-foreground shadow-sm border border-border/60'
                  : 'text-secondary hover:text-text'
              }`}
            >
              <Layers className="w-4 h-4 text-blue-500" />
              Company Ladder Explorer
            </button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 1: COMPANY LADDER EXPLORER
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'explorer' && (
          <div className="space-y-6 animate-fade-in">
            {/* Explorer Controls: Company & Track */}
            <div className="bg-surface rounded-xl p-5 border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" /> Company
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                      setSelectedLevelCode(null);
                    }}
                    className="bg-surface-2 border border-border rounded-lg px-3.5 py-2 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                  >
                    {allCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.tier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" /> Track
                  </label>
                  <select
                    value={selectedTrack}
                    onChange={(e) => {
                      setSelectedTrack(e.target.value as CareerTrack);
                      setSelectedLevelCode(null);
                    }}
                    className="bg-surface-2 border border-border rounded-lg px-3.5 py-2 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="SWE">Software Engineering (SWE)</option>
                    <option value="EM">Engineering Management (EM)</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-muted flex items-center gap-2">
                <span>Headquarters: <strong className="text-foreground">{activeCompanyLadder.headquarters}</strong></span>
                <span>•</span>
                <span>Tier: <strong className="text-foreground">{activeCompanyLadder.tier}</strong></span>
              </div>
            </div>

            {/* Ladder Stepper Layout */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Vertical Stepper */}
              <div className="lg:col-span-5 bg-surface rounded-xl p-5 border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                    {activeCompanyLadder.name} • {selectedTrack} Ladder
                  </h3>
                  <span className="text-xs text-muted font-medium">
                    {activeLadderLevels.length} Levels Defined
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {activeLadderLevels.map((lvl, idx) => {
                    const isSelected = activeDetailLevel?.levelCode === lvl.levelCode;
                    const convertedComp = convertComp(
                      lvl.comp.total.p50,
                      lvl.comp.currency,
                      currency,
                      DEFAULT_USD_INR_RATE
                    );

                    return (
                      <div
                        key={lvl.levelCode}
                        onClick={() => setSelectedLevelCode(lvl.levelCode)}
                        className={`group relative p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-xs'
                            : 'bg-surface-2/60 border-border hover:bg-surface-2 hover:border-border-hover'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${
                              isSelected
                                ? 'bg-primary text-white shadow-xs'
                                : 'bg-surface border border-border text-foreground group-hover:border-primary/50'
                            }`}
                          >
                            {lvl.levelCode}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                                {lvl.title}
                              </h4>
                              {lvl.isTerminal ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  Terminal
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  Up or Out
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-secondary mt-0.5">
                              {lvl.yoeTypicalMin}–{lvl.yoeTypicalMax} yrs exp • Median promo: {lvl.timeInLevel.median} yrs
                            </p>
                          </div>
                        </div>

                        <div className="text-right pl-3">
                          <p className="text-sm font-black text-foreground">
                            {formatCurrency(convertedComp, currency)}
                          </p>
                          <span className="text-[10px] text-muted">p50 total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Level Panel */}
              <div className="lg:col-span-7 bg-surface rounded-xl p-6 border border-border shadow-sm space-y-6">
                {activeDetailLevel ? (
                  <>
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-border">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-black text-xs">
                            {activeDetailLevel.levelCode}
                          </span>
                          <span className="text-xs text-muted font-bold">
                            {activeDetailLevel.equivalenceGroup}
                          </span>
                          {activeDetailLevel.confidence === 'estimate' ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Estimate
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-black text-foreground">
                          {activeDetailLevel.title}
                        </h2>
                        <p className="text-xs text-secondary mt-1">
                          {activeCompanyLadder.name} • Typical {activeDetailLevel.yoeTypicalMin}–{activeDetailLevel.yoeTypicalMax} Years Experience
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider block">
                          Total Compensation (p50)
                        </span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(
                            convertComp(activeDetailLevel.comp.total.p50, activeDetailLevel.comp.currency, currency, DEFAULT_USD_INR_RATE),
                            currency
                          )}
                        </span>
                        <span className="text-xs text-muted block mt-0.5">
                          Range: {formatCurrency(convertComp(activeDetailLevel.comp.total.p25, activeDetailLevel.comp.currency, currency, DEFAULT_USD_INR_RATE), currency)} – {formatCurrency(convertComp(activeDetailLevel.comp.total.p75, activeDetailLevel.comp.currency, currency, DEFAULT_USD_INR_RATE), currency)}
                        </span>
                      </div>
                    </div>

                    {/* Section 1: Time in Level & Stall Rate */}
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="bg-surface-2 p-3.5 rounded-lg border border-border">
                        <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                          Fast-Track (p25)
                        </span>
                        <span className="text-lg font-black text-foreground">
                          {activeDetailLevel.timeInLevel.p25} Years
                        </span>
                      </div>
                      <div className="bg-surface-2 p-3.5 rounded-lg border border-border">
                        <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                          Median Time in Level
                        </span>
                        <span className="text-lg font-black text-primary">
                          {activeDetailLevel.timeInLevel.median} Years
                        </span>
                      </div>
                      <div className="bg-surface-2 p-3.5 rounded-lg border border-border">
                        <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                          Stall / Plateau Rate
                        </span>
                        <span className="text-lg font-black text-amber-600">
                          {activeDetailLevel.timeInLevel.stallRatePct}%
                        </span>
                      </div>
                    </div>

                    {/* Section 2: Promotion Requirements Into This Level */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-primary" /> Promotion Requirements into {activeDetailLevel.levelCode}
                      </h3>

                      <div className="space-y-2 text-sm bg-surface-2/40 p-4 rounded-lg border border-border">
                        <div>
                          <strong className="text-foreground font-bold">Scope of Ownership: </strong>
                          <span className="text-secondary">{activeDetailLevel.promotionRequirements.scope}</span>
                        </div>
                        <div>
                          <strong className="text-foreground font-bold">Impact Expectations: </strong>
                          <span className="text-secondary">{activeDetailLevel.promotionRequirements.impact}</span>
                        </div>
                        <div>
                          <strong className="text-foreground font-bold">Leadership & Influence: </strong>
                          <span className="text-secondary">{activeDetailLevel.promotionRequirements.influence}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-2">
                          Evidence Expected in Promotion Packet:
                        </span>
                        <ul className="space-y-1.5">
                          {activeDetailLevel.promotionRequirements.evidence.map((ev, i) => (
                            <li key={i} className="text-xs text-secondary flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Section 3: How the Promotion Process Works */}
                    <div className="space-y-3 pt-3 border-t border-border">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-blue-500" /> How the Promotion Process Works at {activeCompanyLadder.name}
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-surface-2 p-3 rounded-lg border border-border">
                          <span className="font-bold text-muted block mb-0.5">Calibration Cadence:</span>
                          <span className="text-foreground font-semibold">{activeDetailLevel.promotionProcess.cadence}</span>
                        </div>
                        <div className="bg-surface-2 p-3 rounded-lg border border-border">
                          <span className="font-bold text-muted block mb-0.5">Nomination Model:</span>
                          <span className="text-foreground font-semibold">{activeDetailLevel.promotionProcess.nominator}</span>
                        </div>
                        <div className="bg-surface-2 p-3 rounded-lg border border-border sm:col-span-2">
                          <span className="font-bold text-muted block mb-0.5">Committee & Calibration Body:</span>
                          <span className="text-foreground font-semibold">{activeDetailLevel.promotionProcess.committee}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-1.5">
                          Common Reasons Promotions Get Blocked:
                        </span>
                        <ul className="space-y-1">
                          {activeDetailLevel.promotionProcess.commonBlockers.map((b, i) => (
                            <li key={i} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Section 4: Data Sources & Last Updated */}
                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted gap-2">
                      <div className="flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>Sources: {activeDetailLevel.sources.join(', ')}</span>
                      </div>
                      <span>Last Updated: {activeDetailLevel.lastUpdated}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted">Select a level on the left to inspect requirements.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 2: PROMOTION ROADMAP SIMULATOR
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'simulator' && (
          <div className="space-y-8 animate-fade-in">
            {/* Input Form Card */}
            {!simulationResult && (
              <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-xl max-w-3xl mx-auto space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-black text-foreground">
                    Configure Your Promotion Trajectory
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    Select your current and target levels from verified company ladders. The engine will determine deterministic timeline, requirements, and compensation trajectory.
                  </p>
                </div>

                {/* Position Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Position Card */}
                  <div className="bg-surface-2/40 border border-border rounded-xl p-4.5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" /> Current Position
                      </label>
                      {currentSourceLevel && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {currentSourceLevel.levelCode} • {currentSourceLevel.equivalenceGroup}
                        </span>
                      )}
                    </div>

                    {/* Autocomplete Search Bar */}
                    <div className="relative" ref={sourceDropdownRef}>
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={sourceSearchQuery}
                          onChange={(e) => {
                            setSourceSearchQuery(e.target.value);
                            setIsSourceDropdownOpen(true);
                          }}
                          onFocus={() => setIsSourceDropdownOpen(true)}
                          placeholder="Search role e.g. 'Google L4', 'Meta E5'..."
                          className="w-full bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        {sourceSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSourceSearchQuery('');
                              setIsSourceDropdownOpen(false);
                            }}
                            className="absolute right-2.5 p-0.5 text-muted hover:text-foreground rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown */}
                      {isSourceDropdownOpen && (
                        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border">
                          {sourceMatches.length > 0 ? (
                            sourceMatches.map((m) => (
                              <div
                                key={`${m.company.id}-${m.level.levelCode}-${m.level.track}`}
                                onClick={() => handleSelectSource(m.company.id, m.level.levelCode, m.level.track)}
                                className="p-2.5 hover:bg-primary/5 cursor-pointer flex items-center justify-between text-xs transition-colors"
                              >
                                <div>
                                  <span className="font-extrabold text-foreground">{m.company.name}</span>
                                  <span className="text-secondary ml-1.5 font-medium">{m.level.title}</span>
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-black text-primary border border-border">
                                  {m.level.levelCode}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-xs space-y-2">
                              <p className="text-muted">No exact ladder node matched &ldquo;{sourceSearchQuery}&rdquo;.</p>
                              {sourceFuzzySuggestion && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Did you mean?
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-foreground">
                                      {sourceFuzzySuggestion.label}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectSource(
                                        sourceFuzzySuggestion.company.id,
                                        sourceFuzzySuggestion.level.levelCode,
                                        sourceFuzzySuggestion.level.track
                                      )}
                                      className="px-2 py-1 rounded bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 shrink-0"
                                    >
                                      Select
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Or Manual Dropdown Selectors */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Company</span>
                        <select
                          value={sourceCompanyId}
                          onChange={(e) => {
                            setSourceCompanyId(e.target.value);
                            const firstLvl = getLevelsForCompanyAndTrack(e.target.value, simTrack)[0];
                            if (firstLvl) setSourceLevelCode(firstLvl.levelCode);
                          }}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {allCompanies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Level</span>
                        <select
                          value={sourceLevelCode}
                          onChange={(e) => setSourceLevelCode(e.target.value)}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {sourceLevelsForSim.map((l) => (
                            <option key={l.levelCode} value={l.levelCode}>
                              {l.levelCode} • {l.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Target Position Card */}
                  <div className="bg-surface-2/40 border border-border rounded-xl p-4.5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-500" /> Target Position
                      </label>
                      {currentTargetLevel && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {currentTargetLevel.levelCode} • {currentTargetLevel.equivalenceGroup}
                        </span>
                      )}
                    </div>

                    {/* Autocomplete Search Bar */}
                    <div className="relative" ref={targetDropdownRef}>
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={targetSearchQuery}
                          onChange={(e) => {
                            setTargetSearchQuery(e.target.value);
                            setIsTargetDropdownOpen(true);
                          }}
                          onFocus={() => setIsTargetDropdownOpen(true)}
                          placeholder="Search target e.g. 'Meta E6', 'Amazon Principal'..."
                          className="w-full bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                        {targetSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setTargetSearchQuery('');
                              setIsTargetDropdownOpen(false);
                            }}
                            className="absolute right-2.5 p-0.5 text-muted hover:text-foreground rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown */}
                      {isTargetDropdownOpen && (
                        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border">
                          {targetMatches.length > 0 ? (
                            targetMatches.map((m) => (
                              <div
                                key={`${m.company.id}-${m.level.levelCode}-${m.level.track}`}
                                onClick={() => handleSelectTarget(m.company.id, m.level.levelCode, m.level.track)}
                                className="p-2.5 hover:bg-blue-500/5 cursor-pointer flex items-center justify-between text-xs transition-colors"
                              >
                                <div>
                                  <span className="font-extrabold text-foreground">{m.company.name}</span>
                                  <span className="text-secondary ml-1.5 font-medium">{m.level.title}</span>
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-black text-blue-500 border border-border">
                                  {m.level.levelCode}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-xs space-y-2">
                              <p className="text-muted">No exact ladder node matched &ldquo;{targetSearchQuery}&rdquo;.</p>
                              {targetFuzzySuggestion && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
                                    <Sparkles className="w-3.5 h-3.5" /> Did you mean?
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-foreground">
                                      {targetFuzzySuggestion.label}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectTarget(
                                        targetFuzzySuggestion.company.id,
                                        targetFuzzySuggestion.level.levelCode,
                                        targetFuzzySuggestion.level.track
                                      )}
                                      className="px-2 py-1 rounded bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 shrink-0"
                                    >
                                      Select
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Or Manual Dropdown Selectors */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Company</span>
                        <select
                          value={targetCompanyId}
                          onChange={(e) => {
                            setTargetCompanyId(e.target.value);
                            const firstLvl = getLevelsForCompanyAndTrack(e.target.value, targetTrack)[0];
                            if (firstLvl) setTargetLevelCode(firstLvl.levelCode);
                          }}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {allCompanies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Level</span>
                        <select
                          value={targetLevelCode}
                          onChange={(e) => setTargetLevelCode(e.target.value)}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {targetLevelsForSim.map((l) => (
                            <option key={l.levelCode} value={l.levelCode}>
                              {l.levelCode} • {l.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Simulation Controls */}
                <div className="grid sm:grid-cols-3 gap-4 pt-3 border-t border-border">
                  {/* Track Selection */}
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Career Track
                    </label>
                    <select
                      value={simTrack}
                      onChange={(e) => {
                        const tr = e.target.value as CareerTrack;
                        setSimTrack(tr);
                        setTargetTrack(tr);
                      }}
                      className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="SWE">Software Engineering (SWE)</option>
                      <option value="EM">Engineering Management (EM)</option>
                    </select>
                  </div>

                  {/* Performance Bracket */}
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Performance Rating
                    </label>
                    <select
                      value={performanceBracket}
                      onChange={(e) => setPerformanceBracket(e.target.value as PerformanceBracket)}
                      className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="MEETS">Meets Expectations (Median)</option>
                      <option value="EXCEEDS">Exceeds Expectations (~p25)</option>
                      <option value="CONSISTENTLY_EXCEEDS">Consistently Exceeds (Top 10%)</option>
                    </select>
                  </div>

                  {/* Years Already in Level */}
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                      Tenure in Current Level
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={8}
                      step={0.5}
                      value={yearsInCurrentLevel}
                      onChange={(e) => setYearsInCurrentLevel(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                      placeholder="e.g. 1.0 years"
                    />
                  </div>
                </div>

                {/* Instant Search Bar for Fuzzy Matching */}
                <div className="relative pt-2" ref={sourceDropdownRef}>
                  <label className="block text-xs font-bold text-muted mb-1 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5" /> Or Quick Search by Title / Level:
                  </label>
                  <input
                    type="text"
                    value={sourceSearchQuery}
                    onChange={(e) => {
                      setSourceSearchQuery(e.target.value);
                      setIsSourceDropdownOpen(true);
                    }}
                    onFocus={() => setIsSourceDropdownOpen(true)}
                    placeholder="Search e.g. 'Google L5', 'Flipkart SDE-2', 'Amazon Principal'..."
                    className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                  {isSourceDropdownOpen && sourceMatches.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl max-h-52 overflow-y-auto divide-y divide-border/60">
                      {sourceMatches.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSourceCompanyId(item.company.id);
                            setSourceLevelCode(item.level.levelCode);
                            setSimTrack(item.level.track);
                            setIsSourceDropdownOpen(false);
                            setSourceSearchQuery('');
                          }}
                          className="px-3 py-2 text-xs hover:bg-surface-2 cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-bold text-foreground">{item.label}</span>
                          <span className="text-[10px] text-muted">{item.company.tier}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSimulate}
                  disabled={isCalculating}
                  className="w-full py-3.5 rounded-xl font-black text-sm bg-primary text-white hover:bg-primary-hover shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Resolving Promotion Path...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Generate Promotion Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Output Roadmap View */}
            {simulationResult && (
              <div className="space-y-8 animate-fade-in">
                {/* Notice Banner if Target is Junior or Same Level */}
                {simulationResult.status !== 'SUCCESS' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{simulationResult.message}</span>
                  </div>
                )}

                {/* Summary Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Estimated Time Card */}
                  <div className="bg-surface rounded-xl p-5 border border-border shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
                        Estimated Time
                      </p>
                      <p className="text-2xl font-black text-foreground">
                        {simulationResult.totalTime.likely} Years
                      </p>
                      <p className="text-xs text-secondary mt-0.5">
                        Range: {simulationResult.totalTime.min} – {simulationResult.totalTime.max} yrs
                      </p>
                    </div>
                  </div>

                  {/* Projected Comp Jump Card */}
                  <div className="bg-surface rounded-xl p-5 border border-border shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
                        Projected Comp Jump
                      </p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(simulationResult.compJump.diff, currency)}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">
                        +{simulationResult.compJump.percentage}% lift over baseline
                      </p>
                    </div>
                  </div>

                  {/* Promotion Probability Card */}
                  <div className="bg-surface rounded-xl p-5 border border-border shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
                          Success Probability
                        </p>
                        <button
                          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          {showFormulaDetails ? 'Hide math' : 'Formula'}
                        </button>
                      </div>
                      <p className="text-2xl font-black text-foreground">
                        {simulationResult.probability.percentage}%
                      </p>
                      <p className="text-xs text-secondary mt-0.5">
                        Based on {simulationResult.steps.length} promotion step stall rates
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expandable Probability Calculation Formula Drawer */}
                {showFormulaDetails && (
                  <div className="bg-surface-2 p-4 rounded-xl border border-border text-xs text-secondary space-y-2 animate-fade-in">
                    <strong className="text-foreground block font-bold">
                      How this probability is calculated:
                    </strong>
                    <p className="font-mono text-primary bg-surface p-2 rounded border border-border/80">
                      {simulationResult.probability.formulaExplanation}
                    </p>
                    <div className="space-y-1 pt-1">
                      {simulationResult.probability.levelStallRates.map((s, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            Step {idx + 1} ({s.companyId.toUpperCase()} {s.levelCode}):
                          </span>
                          <span className="font-bold text-foreground">
                            {s.stallRate}% industry stall rate
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Two-Column Results: The Promotion Plan Timeline & Salary Trajectory Chart */}
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                  {/* Left: The Promotion Plan Timeline */}
                  <div className="lg:col-span-6 bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h3 className="text-base font-black text-foreground">
                        The Promotion Plan
                      </h3>
                      <span className="text-xs text-muted font-semibold">
                        {simulationResult.steps.length} Step(s) to Target
                      </span>
                    </div>

                    <div className="space-y-6">
                      {simulationResult.steps.map((step, idx) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-primary/30 space-y-3">
                          {/* Dot indicator on timeline */}
                          <div className="absolute -left-2 top-0 w-3.5 h-3.5 rounded-full bg-primary border-2 border-surface shadow-xs" />

                          {/* Step Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary">
                                STEP {step.stepIndex}
                              </span>
                              <h4 className="text-sm font-extrabold text-foreground">
                                {step.fromLevel.levelCode} → {step.toLevel.levelCode} ({step.toLevel.title})
                              </h4>
                            </div>
                            <span className="text-xs font-bold text-muted">
                              ~{step.durationYears.likely} yrs (range: {step.durationYears.min}–{step.durationYears.max})
                            </span>
                          </div>

                          {/* Step Type Badge */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              step.isCompanySwitch
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : step.stepType === 'TRACK_SWITCH'
                                ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            }`}>
                              {step.stepType.replace('_', ' ')}
                            </span>
                            <span className="text-muted text-[11px]">{step.cycleWindow}</span>
                          </div>

                          {/* Requirements & Scope */}
                          <div className="bg-surface-2 p-3 rounded-lg border border-border text-xs space-y-1.5">
                            <div>
                              <strong className="text-foreground">Scope: </strong>
                              <span className="text-secondary">{step.requirements.scope}</span>
                            </div>
                            <div>
                              <strong className="text-foreground">Impact: </strong>
                              <span className="text-secondary">{step.requirements.impact}</span>
                            </div>
                            <div>
                              <strong className="text-foreground">Process: </strong>
                              <span className="text-secondary">{step.process.cadence} • Chaired by {step.process.committee}</span>
                            </div>
                          </div>

                          {/* Blockers */}
                          {step.blockers.length > 0 && (
                            <div className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>Key Risk: {step.blockers[0]}</span>
                            </div>
                          )}

                          {step.notes && (
                            <p className="text-xs text-muted italic bg-surface-2/30 p-2 rounded">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Salary Trajectory Chart */}
                  <div className="lg:col-span-6 bg-surface rounded-2xl p-6 border border-border shadow-sm flex flex-col space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h3 className="text-base font-black text-foreground">
                        Compensation Trajectory
                      </h3>
                      <span className="text-xs text-muted font-semibold">
                        Year 0 → Year {simulationResult.compTimeline[simulationResult.compTimeline.length - 1]?.yearNum || 1}
                      </span>
                    </div>

                    <div className="flex-1 min-h-[320px] w-full">
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart
                          data={simulationResult.compTimeline}
                          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="careerCompGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="year"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => formatCurrency(v, currency)}
                            width={75}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                              fontSize: '12px',
                            }}
                            formatter={(value: any, name: any, item: any) => [
                              formatCurrency(Number(value), currency),
                              `${item.payload.companyName} • ${item.payload.levelCode} Total Comp`,
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="salary"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#careerCompGrad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Strategic Advice Notes */}
                    {simulationResult.strategicAdvice.length > 0 && (
                      <div className="bg-surface-2 p-4 rounded-xl border border-border space-y-2 text-xs">
                        <strong className="text-foreground block font-bold flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-primary" /> Strategic Promotion Guidance
                        </strong>
                        {simulationResult.strategicAdvice.map((adv, i) => (
                          <p key={i} className="text-secondary leading-relaxed">
                            {adv}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions & Data Sources Footnote */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-4">
                  <div className="text-xs text-muted flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Data sourced from Levels.fyi, Progression.fyi, and company engineering frameworks.</span>
                  </div>

                  <button
                    onClick={handleResetSimulator}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-surface-2 hover:bg-surface-3 border border-border text-foreground transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Start Over / Modify Inputs
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
