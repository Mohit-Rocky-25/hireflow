// ============================================================
// Career Path & Promotion Level Simulator — India Market Edition
// Strict INR currency, Student & Working Professional modes,
// Rich structured promotion blockers & India-office ladders
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Clock,
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
  GraduationCap,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  Target,
  FileText,
  Flame,
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
  getAllMarketSegments,
  filterByMarketSegment,
  getEquivalenceHumanLabel,
} from '../../data/careerLadders';
import type {
  CareerLevel,
  CareerTrack,
  CompanyLadder,
  MarketSegment,
  BlockerCategory,
  StructuredBlocker,
} from '../../data/careerLadders/types';
import {
  resolvePath,
  resolveStudentPath,
  formatINR,
  type PerformanceBracket,
  type PromotionPlan,
  type StudentProfile,
  type StudentPromotionPlan,
} from '../../lib/careerEngine';

export function CareerPathSimulator() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'explorer'>('simulator');
  const [simulatorMode, setSimulatorMode] = useState<'student' | 'professional'>('student');

  // ─────────────────────────────────────────────────────────────
  // SUBSECTION 1: Company Ladder Explorer State
  // ─────────────────────────────────────────────────────────────
  const allMarketSegments = useMemo(() => getAllMarketSegments(), []);
  const [selectedSegment, setSelectedSegment] = useState<MarketSegment | 'ALL'>('ALL');
  const filteredCompanies = useMemo(
    () => filterByMarketSegment(selectedSegment),
    [selectedSegment]
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('google');
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>('SWE');
  const [selectedLevelCode, setSelectedLevelCode] = useState<string | null>('L4');
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [expandedBlockerCat, setExpandedBlockerCat] = useState<string | null>(null);

  const activeCompanyLadder = useMemo(() => {
    return getCompanyLadder(selectedCompanyId) || filteredCompanies[0] || getAllCompanies()[0];
  }, [selectedCompanyId, filteredCompanies]);

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

  // Group blockers by category for rich display
  const groupedBlockers = useMemo(() => {
    if (!activeDetailLevel) return {};
    const map: Record<string, StructuredBlocker[]> = {};
    for (const b of activeDetailLevel.promotionProcess.blockers) {
      if (!map[b.category]) map[b.category] = [];
      map[b.category].push(b);
    }
    return map;
  }, [activeDetailLevel]);

  // ─────────────────────────────────────────────────────────────
  // SUBSECTION 2: Student Mode Simulator State
  // ─────────────────────────────────────────────────────────────
  const [studentDegree, setStudentDegree] = useState<StudentProfile['degreeAndBranch']>('BTech_CSE_IT');
  const [studentTier, setStudentTier] = useState<StudentProfile['collegeTier']>('Tier 1');
  const [studentYearOfStudy, setStudentYearOfStudy] = useState<StudentProfile['currentYearOfStudy']>('Final Year');
  const [studentGradYear, setStudentGradYear] = useState<number>(2026);
  const [studentCgpa, setStudentCgpa] = useState<StudentProfile['cgpaBracket']>('above_8');
  const [studentInternship, setStudentInternship] = useState<StudentProfile['internshipStatus']>('none');
  const [studentDreamCompanyId, setStudentDreamCompanyId] = useState<string>('google');
  const [studentDreamLevelCode, setStudentDreamLevelCode] = useState<string>('L5');
  const [studentTrack, setStudentTrack] = useState<CareerTrack>('SWE');

  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
  const studentSearchRef = useRef<HTMLDivElement>(null);

  const [studentResult, setStudentResult] = useState<StudentPromotionPlan | null>(null);

  // ─────────────────────────────────────────────────────────────
  // SUBSECTION 2: Working Professional Mode Simulator State
  // ─────────────────────────────────────────────────────────────
  const [profSourceCompanyId, setProfSourceCompanyId] = useState<string>('amazon');
  const [profSourceLevelCode, setProfSourceLevelCode] = useState<string>('L5');
  const [profTargetCompanyId, setProfTargetCompanyId] = useState<string>('meta');
  const [profTargetLevelCode, setProfTargetLevelCode] = useState<string>('E6');
  const [profTrack, setProfTrack] = useState<CareerTrack>('SWE');
  const [profTargetTrack, setProfTargetTrack] = useState<CareerTrack>('SWE');
  const [profPerformance, setProfPerformance] = useState<PerformanceBracket>('MEETS');
  const [profYearsInLevel, setProfYearsInLevel] = useState<number>(1.5);
  const [profCurrentCtcLPA, setProfCurrentCtcLPA] = useState<string>('');

  const [sourceSearchQuery, setSourceSearchQuery] = useState<string>('');
  const [targetSearchQuery, setTargetSearchQuery] = useState<string>('');
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  const [profResult, setProfResult] = useState<PromotionPlan | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target as Node)) {
        setIsTargetDropdownOpen(false);
      }
      if (studentSearchRef.current && !studentSearchRef.current.contains(e.target as Node)) {
        setIsStudentSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute fuzzy matches
  const sourceMatches = useMemo(() => searchLevels(sourceSearchQuery), [sourceSearchQuery]);
  const targetMatches = useMemo(() => searchLevels(targetSearchQuery), [targetSearchQuery]);
  const studentMatches = useMemo(() => searchLevels(studentSearchQuery), [studentSearchQuery]);

  const sourceFuzzySuggestion = useMemo(() => getFuzzySuggestion(sourceSearchQuery), [sourceSearchQuery]);
  const targetFuzzySuggestion = useMemo(() => getFuzzySuggestion(targetSearchQuery), [targetSearchQuery]);
  const studentFuzzySuggestion = useMemo(() => getFuzzySuggestion(studentSearchQuery), [studentSearchQuery]);

  const currentProfSourceCompany = useMemo(() => getCompanyLadder(profSourceCompanyId), [profSourceCompanyId]);
  const currentProfSourceLevel = useMemo(() => getLevel(profSourceCompanyId, profSourceLevelCode, profTrack), [profSourceCompanyId, profSourceLevelCode, profTrack]);
  const currentProfTargetCompany = useMemo(() => getCompanyLadder(profTargetCompanyId), [profTargetCompanyId]);
  const currentProfTargetLevel = useMemo(() => getLevel(profTargetCompanyId, profTargetLevelCode, profTargetTrack), [profTargetCompanyId, profTargetLevelCode, profTargetTrack]);

  const profSourceLevels = useMemo(() => getLevelsForCompanyAndTrack(profSourceCompanyId, profTrack), [profSourceCompanyId, profTrack]);
  const profTargetLevels = useMemo(() => getLevelsForCompanyAndTrack(profTargetCompanyId, profTargetTrack), [profTargetCompanyId, profTargetTrack]);

  const studentDreamCompany = useMemo(() => getCompanyLadder(studentDreamCompanyId), [studentDreamCompanyId]);
  const studentDreamLevels = useMemo(() => getLevelsForCompanyAndTrack(studentDreamCompanyId, studentTrack), [studentDreamCompanyId, studentTrack]);
  const currentStudentDreamLevel = useMemo(() => getLevel(studentDreamCompanyId, studentDreamLevelCode, studentTrack), [studentDreamCompanyId, studentDreamLevelCode, studentTrack]);

  // Handlers for selection
  const handleSelectSource = (companyId: string, levelCode: string, track: CareerTrack) => {
    setProfSourceCompanyId(companyId);
    setProfSourceLevelCode(levelCode);
    setProfTrack(track);
    setSourceSearchQuery('');
    setIsSourceDropdownOpen(false);
  };

  const handleSelectTarget = (companyId: string, levelCode: string, track: CareerTrack) => {
    setProfTargetCompanyId(companyId);
    setProfTargetLevelCode(levelCode);
    setProfTargetTrack(track);
    setTargetSearchQuery('');
    setIsTargetDropdownOpen(false);
  };

  const handleSelectStudentDream = (companyId: string, levelCode: string, track: CareerTrack) => {
    setStudentDreamCompanyId(companyId);
    setStudentDreamLevelCode(levelCode);
    setStudentTrack(track);
    setStudentSearchQuery('');
    setIsStudentSearchOpen(false);
  };

  // Run Student Simulation
  const handleSimulateStudent = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const plan = resolveStudentPath({
          degreeAndBranch: studentDegree,
          collegeTier: studentTier,
          currentYearOfStudy: studentYearOfStudy,
          expectedGraduationYear: studentGradYear,
          cgpaBracket: studentCgpa,
          internshipStatus: studentInternship,
          dreamCompanyId: studentDreamCompanyId,
          dreamLevelCode: studentDreamLevelCode,
          track: studentTrack,
        });
        setStudentResult(plan);
      } catch (err) {
        console.error('Student roadmap calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 250);
  };

  // Run Professional Simulation
  const handleSimulateProf = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const ctcNum = parseFloat(profCurrentCtcLPA);
        const currentAnnualCTC = !isNaN(ctcNum) && ctcNum > 0 ? Math.round(ctcNum * 100000) : undefined;

        const plan = resolvePath(
          { companyId: profSourceCompanyId, levelCode: profSourceLevelCode, track: profTrack },
          { companyId: profTargetCompanyId, levelCode: profTargetLevelCode, track: profTargetTrack },
          {
            performanceBracket: profPerformance,
            yearsInCurrentLevel: profYearsInLevel,
            currentAnnualCTC,
          }
        );
        setProfResult(plan);
      } catch (err) {
        console.error('Professional roadmap calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── Breadcrumb & Top Header ───────────────────────────────── */}
      <div className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted mb-1 font-medium">
                <Link to="/" className="hover:text-primary transition-colors">HireFlow</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-semibold">Career Path & Promotion Simulator</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] ml-1">
                  India Market • INR
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Engineering Promotion & Level Simulator
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'simulator'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Promotion Roadmap Simulator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('explorer')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'explorer'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Company Ladder Explorer
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 1: COMPANY LADDER EXPLORER
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'explorer' && (
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
                  <select
                    value={selectedTrack}
                    onChange={(e) => setSelectedTrack(e.target.value as CareerTrack)}
                    className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="SWE">Software Engineering (SWE)</option>
                    <option value="EM">Engineering Management (EM)</option>
                  </select>
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
                  All Segments ({getAllCompanies().length})
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
                <select
                  value={selectedCompanyId}
                  onChange={(e) => {
                    setSelectedCompanyId(e.target.value);
                    const firstLvl = getLevelsForCompanyAndTrack(e.target.value, selectedTrack)[0];
                    if (firstLvl) setSelectedLevelCode(firstLvl.levelCode);
                  }}
                  className="w-full sm:w-80 bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm font-black text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  {filteredCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.marketSegment})
                    </option>
                  ))}
                </select>
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
                        onClick={() => setSelectedLevelCode(lvl.levelCode)}
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
                            {formatINR(lvl.comp.total.p50)}
                          </p>
                          <span className="text-[10px] text-muted font-bold">Median CTC</span>
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
                              Estimate
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-black text-foreground tracking-tight">
                          {activeDetailLevel.title}
                        </h2>
                        <p className="text-xs text-secondary mt-1">
                          {activeCompanyLadder.name} • Typical {activeDetailLevel.yoeTypicalMin}–{activeDetailLevel.yoeTypicalMax} Years Experience
                        </p>
                      </div>

                      {/* Top CTC Card */}
                      <div className="text-right bg-surface-2/60 p-3 rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1 justify-end">
                          Typical Total Annual Pay (Median)
                          <span className="group relative cursor-help">
                            <HelpCircle className="w-3 h-3 text-muted hover:text-foreground" />
                            <span className="pointer-events-none absolute -left-48 top-5 w-56 rounded-lg bg-foreground text-background p-2 text-[10px] font-normal leading-tight opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-30">
                              Median = the middle value. Half of the people at this level earn less, half earn more. Total annual pay = base + yearly bonus + yearly value of stock. Shown per year in INR.
                            </span>
                          </span>
                        </span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {formatINR(activeDetailLevel.comp.total.p50)}
                        </span>
                        <span className="text-[10px] text-muted block mt-0.5">
                          Lower range (25% earn less): {formatINR(activeDetailLevel.comp.total.p25)}
                          <br />
                          Upper range (75% earn less): {formatINR(activeDetailLevel.comp.total.p75)}
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

                    {/* Structured Promotion Blockers (Minimum 6 per level) */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" /> Common Reasons Promotions Get Blocked ({activeDetailLevel.promotionProcess.blockers.length} Documented)
                        </h3>
                        <span className="text-[10px] text-muted font-bold">Grouped by Category</span>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(groupedBlockers).map(([category, blockers]) => {
                          const isExpanded = expandedBlockerCat === category;
                          return (
                            <div key={category} className="border border-border rounded-xl bg-surface-2/30 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setExpandedBlockerCat(isExpanded ? null : category)}
                                className="w-full px-4 py-2.5 text-left text-xs font-black text-foreground flex items-center justify-between hover:bg-surface-2/60 transition-colors"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  {category} ({blockers.length})
                                </span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>

                              {isExpanded && (
                                <div className="px-4 pb-3 space-y-3 pt-1 border-t border-border/60">
                                  {blockers.map((b, bIdx) => (
                                    <div key={bIdx} className="bg-surface p-3 rounded-lg border border-border space-y-1.5 text-xs">
                                      <p className="font-extrabold text-foreground">{b.title}</p>
                                      <div className="text-secondary leading-relaxed space-y-1">
                                        <p><strong className="text-foreground">Why this blocks promo:</strong> {b.whyItBlocks}</p>
                                        <p><strong className="text-emerald-600 dark:text-emerald-400">What counters it:</strong> {b.evidenceToCounter}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

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
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
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
        )}

        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 2: PROMOTION ROADMAP SIMULATOR
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'simulator' && (
          <div className="space-y-8 animate-fade-in">
            {/* Mode Switcher: Student vs Working Professional */}
            <div className="flex justify-center">
              <div className="inline-flex p-1.5 bg-surface-2 border border-border rounded-2xl shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('student');
                    setProfResult(null);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    simulatorMode === 'student'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  I&apos;m a Student (College to Dream Company)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('professional');
                    setStudentResult(null);
                  }}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    simulatorMode === 'professional'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  I&apos;m a Working Professional
                </button>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────
                MODE A: STUDENT SIMULATOR FORM
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'student' && !studentResult && (
              <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-xl max-w-3xl mx-auto space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" /> Configure Your College-to-Dream Job Roadmap
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    Select your college background and dream company. The engine maps real campus hiring routes, eligibility cutoffs, fresher CTC packages in INR, and the multi-year promotion trajectory to reach your dream level.
                  </p>
                </div>

                {/* College Profile Inputs */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* College Tier */}
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">College Tier</label>
                    <select
                      value={studentTier}
                      onChange={(e) => setStudentTier(e.target.value as StudentProfile['collegeTier'])}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="Tier 1">Tier 1 (IIT, NIT, IIIT, BITS)</option>
                      <option value="Tier 2">Tier 2 (VIT, Manipal, Thapar, RVCE, etc.)</option>
                      <option value="Tier 3">Tier 3 (State / Private Colleges)</option>
                      <option value="Other">Other University</option>
                    </select>
                  </div>

                  {/* Degree & Branch */}
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">Degree & Branch</label>
                    <select
                      value={studentDegree}
                      onChange={(e) => setStudentDegree(e.target.value as StudentProfile['degreeAndBranch'])}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="BTech_CSE_IT">B.Tech (CSE / IT)</option>
                      <option value="BTech_ECE">B.Tech (ECE / EE)</option>
                      <option value="BTech_Other">B.Tech (Other Branches)</option>
                      <option value="BCA_MCA">BCA / MCA</option>
                      <option value="MTech">M.Tech (CSE / IT)</option>
                      <option value="Other">Other Degree</option>
                    </select>
                  </div>

                  {/* Current Year & Expected Grad Year */}
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">Graduation Year</label>
                    <select
                      value={studentGradYear}
                      onChange={(e) => setStudentGradYear(parseInt(e.target.value, 10))}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value={2026}>2026 (Graduating Soon)</option>
                      <option value={2027}>2027 (Penultimate Year)</option>
                      <option value={2028}>2028 (2nd Year)</option>
                      <option value={2029}>2029 (1st Year)</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  {/* CGPA Bracket */}
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">CGPA Bracket</label>
                    <select
                      value={studentCgpa}
                      onChange={(e) => setStudentCgpa(e.target.value as StudentProfile['cgpaBracket'])}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="above_8">Above 8.0 CGPA (Eligible for all drives)</option>
                      <option value="7_to_8">7.0 to 8.0 CGPA (Meets most cutoffs)</option>
                      <option value="6_to_7">6.0 to 7.0 CGPA (Eligible for select drives)</option>
                      <option value="below_6">Below 6.0 CGPA (Requires hackathons/off-campus)</option>
                    </select>
                  </div>

                  {/* Internship Status */}
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">Internship Status</label>
                    <select
                      value={studentInternship}
                      onChange={(e) => setStudentInternship(e.target.value as StudentProfile['internshipStatus'])}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="none">No Internship Yet</option>
                      <option value="completed">Completed Summer Internship</option>
                      <option value="ppo">Have Pre-Placement Offer (PPO)</option>
                    </select>
                  </div>
                </div>

                {/* Dream Company & Target Role Selection */}
                <div className="p-4 rounded-xl bg-surface-2/40 border border-border space-y-3.5 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-primary" /> Target Dream Company & Level
                    </label>
                    {currentStudentDreamLevel && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {currentStudentDreamLevel.levelCode} • {getEquivalenceHumanLabel(currentStudentDreamLevel.equivalenceGroup)}
                      </span>
                    )}
                  </div>

                  {/* Single Searchable Autocomplete for Dream Company */}
                  <div className="relative" ref={studentSearchRef}>
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => {
                          setStudentSearchQuery(e.target.value);
                          setIsStudentSearchOpen(true);
                        }}
                        onFocus={() => setIsStudentSearchOpen(true)}
                        placeholder="Search dream role e.g. 'Google L5', 'Flipkart SDE-2', 'Amazon SDE III'..."
                        className="w-full bg-surface border border-border rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary outline-none"
                      />
                      {studentSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setStudentSearchQuery('');
                            setIsStudentSearchOpen(false);
                          }}
                          className="absolute right-2.5 p-0.5 text-muted hover:text-foreground rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isStudentSearchOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border">
                        {studentMatches.length > 0 ? (
                          studentMatches.map((m) => (
                            <div
                              key={`${m.company.id}-${m.level.levelCode}-${m.level.track}`}
                              onClick={() => handleSelectStudentDream(m.company.id, m.level.levelCode, m.level.track)}
                              className="p-2.5 hover:bg-primary/5 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-black text-foreground">{m.company.name}</span>
                                <span className="text-secondary ml-1.5 font-medium">{m.level.title}</span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-black text-primary border border-border">
                                {m.level.levelCode}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs space-y-2">
                            <p className="text-muted">No exact ladder node matched &ldquo;{studentSearchQuery}&rdquo;.</p>
                            {studentFuzzySuggestion && (
                              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
                                  <Sparkles className="w-3.5 h-3.5" /> Did you mean?
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-foreground">{studentFuzzySuggestion.label}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectStudentDream(
                                      studentFuzzySuggestion.company.id,
                                      studentFuzzySuggestion.level.levelCode,
                                      studentFuzzySuggestion.level.track
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

                  {/* Company & Level Selectors */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                    <div>
                      <span className="text-[10px] text-muted font-bold block mb-1">Dream Company</span>
                      <select
                        value={studentDreamCompanyId}
                        onChange={(e) => {
                          setStudentDreamCompanyId(e.target.value);
                          const firstLvl = getLevelsForCompanyAndTrack(e.target.value, studentTrack)[0];
                          if (firstLvl) setStudentDreamLevelCode(firstLvl.levelCode);
                        }}
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                      >
                        {getAllCompanies().map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted font-bold block mb-1">Dream Target Level</span>
                      <select
                        value={studentDreamLevelCode}
                        onChange={(e) => setStudentDreamLevelCode(e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                      >
                        {studentDreamLevels.map((l) => (
                          <option key={l.levelCode} value={l.levelCode}>{l.levelCode} • {l.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Calculate Roadmap Button */}
                <button
                  type="button"
                  onClick={handleSimulateStudent}
                  disabled={isCalculating}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Computing Campus-to-Career Pathway...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Student Promotion Roadmap
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                STUDENT ROADMAP RESULTS DISPLAY
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'student' && studentResult && (
              <div className="space-y-8 animate-fade-in">
                {/* Result Top Action Bar */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStudentResult(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-surface border border-border text-foreground hover:bg-surface-2 transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Start Over / Edit Profile
                  </button>

                  <div className="text-right">
                    <span className="text-xs text-muted font-bold">
                      {studentResult.studentProfile.collegeTier} • Class of {studentResult.studentProfile.expectedGraduationYear}
                    </span>
                  </div>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted uppercase">Fresher Entry Offer (INR)</span>
                    <span className="text-2xl font-black text-foreground block mt-1">
                      {formatINR(studentResult.entryRoutes[0]?.expectedOfferINR || studentResult.entryLevel.comp.total.p50)}
                    </span>
                    <span className="text-xs text-secondary mt-1 block">
                      At {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode})
                    </span>
                  </div>

                  <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted uppercase">Target Level Compensation</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                      {formatINR(studentResult.targetLevel.comp.total.p50)}
                    </span>
                    <span className="text-xs text-secondary mt-1 block">
                      {studentResult.targetLevel.levelCode} • {studentResult.targetLevel.title}
                    </span>
                  </div>

                  <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted uppercase">Estimated Time from Graduation</span>
                    <span className="text-2xl font-black text-primary block mt-1">
                      {studentResult.totalTimeFromGraduation.likely} Years
                    </span>
                    <span className="text-xs text-muted mt-1 block">
                      Range: {studentResult.totalTimeFromGraduation.min}–{studentResult.totalTimeFromGraduation.max} yrs (By ~{studentResult.studentProfile.expectedGraduationYear + Math.round(studentResult.totalTimeFromGraduation.likely)})
                    </span>
                  </div>
                </div>

                {/* 1. RANKED ENTRY ROUTES INTO DREAM COMPANY */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" /> Entry Stage: Ranked Hiring Routes into {studentResult.dreamCompany.name}
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Real documented hiring pipelines for campus candidates based on your college tier ({studentResult.studentProfile.collegeTier}).
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {studentResult.entryRoutes.map((route, rIdx) => (
                      <div
                        key={rIdx}
                        className="bg-surface-2/40 border border-border rounded-xl p-4 space-y-2.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-black text-foreground">{route.name}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                route.adjustedLikelihood === 'High'
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  : route.adjustedLikelihood === 'Medium'
                                  ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              }`}
                            >
                              Likelihood: {route.adjustedLikelihood}
                            </span>
                          </div>

                          <p className="text-[11px] text-muted leading-relaxed">{route.likelihoodReason}</p>

                          <div className="mt-2.5 pt-2.5 border-t border-border/60 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted font-bold">Typical CTC Offer:</span>
                              <span className="font-black text-emerald-600 dark:text-emerald-400">
                                {formatINR(route.expectedOfferINR)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted font-bold">Eligibility Cutoff:</span>
                              <span className="font-semibold text-foreground">
                                {route.eligibility.cgpaMin}+ CGPA ({route.eligibility.allowedBranches[0]}...)
                              </span>
                            </div>
                          </div>

                          {/* Selection Rounds */}
                          <div className="mt-3 pt-2.5 border-t border-border/60">
                            <span className="text-[10px] font-black text-muted uppercase block mb-1">
                              Selection Rounds ({route.selectionRounds.length})
                            </span>
                            <ul className="space-y-1 text-[11px] text-secondary">
                              {route.selectionRounds.map((rnd, rndIdx) => (
                                <li key={rndIdx} className="flex items-start gap-1.5">
                                  <span className="text-primary font-bold">{rndIdx + 1}.</span>
                                  <span>{rnd}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. PROMOTION ROADMAP TIMELINE */}
                {studentResult.steps.length > 0 && (
                  <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
                    <div className="border-b border-border pb-3">
                      <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Promotion Roadmap (Post-Graduation)
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Step-by-step career path from {studentResult.entryLevel.levelCode} to {studentResult.targetLevel.levelCode} anchored to your graduation calendar year.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {studentResult.steps.map((step) => (
                        <div
                          key={step.stepIndex}
                          className="p-5 rounded-xl border border-border bg-surface-2/30 space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                                {step.stepIndex}
                              </span>
                              <h4 className="text-sm font-black text-foreground">
                                {step.fromLevel.levelCode} ({step.fromLevel.title}) &rarr; {step.toLevel.levelCode} ({step.toLevel.title})
                              </h4>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black text-primary block">
                                {step.calendarYearWindow}
                              </span>
                              <span className="text-[10px] text-muted">
                                Duration: ~{step.durationYears.likely} yrs (range: {step.durationYears.min}–{step.durationYears.max} yrs)
                              </span>
                            </div>
                          </div>

                          {/* Requirements Grid */}
                          <div className="grid sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                              <span className="font-extrabold text-foreground block">Scope Required</span>
                              <p className="text-secondary leading-relaxed">{step.requirements.scope}</p>
                            </div>
                            <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                              <span className="font-extrabold text-foreground block">Measurable Impact</span>
                              <p className="text-secondary leading-relaxed">{step.requirements.impact}</p>
                            </div>
                            <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                              <span className="font-extrabold text-foreground block">Leadership & Mentorship</span>
                              <p className="text-secondary leading-relaxed">{step.requirements.influence}</p>
                            </div>
                          </div>

                          {/* Structured Blockers on this step */}
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-xs">
                            <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> Key Blockers to Overcome on this Promotion ({step.blockers.length} Documented)
                            </span>
                            <div className="grid sm:grid-cols-2 gap-2 pt-1">
                              {step.blockers.slice(0, 4).map((blk, blkIdx) => (
                                <div key={blkIdx} className="bg-surface p-2.5 rounded-lg border border-border space-y-1">
                                  <span className="font-bold text-foreground block text-[11px]">{blk.title}</span>
                                  <p className="text-[10px] text-muted leading-tight">{blk.whyItBlocks}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. COMPENSATION TRAJECTORY CHART (GREEN SALARY CHART) */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                      <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Projected Compensation Trajectory (INR per year)
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Year 0 (Graduation: {studentResult.studentProfile.expectedGraduationYear}) to Target Level.
                      </p>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={studentResult.compTimeline} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="year" stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis
                          stroke="#888888"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => formatINR(val)}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-surface border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                                  <p className="font-black text-foreground">{data.year} • {data.companyName}</p>
                                  <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                                    Total Annual CTC: {formatINR(data.salary)}
                                  </p>
                                  <div className="text-[10px] text-muted space-y-0.5 pt-1 border-t border-border">
                                    <p>Base Pay: {formatINR(data.base)}</p>
                                    <p>Annual Stock: {formatINR(data.stock)}</p>
                                    <p>Bonus: {formatINR(data.bonus)}</p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="salary"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url#emeraldGradient"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. ALTERNATE STEPPING STONE ROUTES */}
                {studentResult.alternateSteppingStones.length > 0 && (
                  <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <Compass className="w-5 h-5 text-blue-500" /> Alternate Routes & Stepping Stones
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        High-probability stepping stone companies to build production depth before switching to {studentResult.dreamCompany.name}.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {studentResult.alternateSteppingStones.map((stone, sIdx) => (
                        <div key={sIdx} className="bg-surface-2/40 border border-border rounded-xl p-4 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-foreground text-sm">{stone.company.name}</span>
                            <span className="px-2 py-0.5 rounded bg-surface text-[10px] font-bold text-muted border border-border">
                              {stone.typicalDurationYears} yrs stepping stone
                            </span>
                          </div>
                          <p className="text-primary font-bold">{stone.entryRole} ({formatINR(stone.entryOfferINR)})</p>
                          <p className="text-secondary leading-relaxed pt-1">{stone.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                MODE B: WORKING PROFESSIONAL SIMULATOR FORM
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'professional' && !profResult && (
              <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-xl max-w-3xl mx-auto space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" /> Working Professional Promotion Roadmap
                  </h2>
                  <p className="text-xs text-secondary mt-1">
                    Simulate deterministic promotion timelines, cross-company equivalence jumps, and compensation trajectory in INR.
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
                      {currentProfSourceLevel && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {currentProfSourceLevel.levelCode} • {getEquivalenceHumanLabel(currentProfSourceLevel.equivalenceGroup)}
                        </span>
                      )}
                    </div>

                    {/* Single Searchable Autocomplete for Current */}
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
                          placeholder="Search role e.g. 'Amazon SDE II', 'TCS Digital'..."
                          className="w-full bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary outline-none"
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
                                  <span className="font-black text-foreground">{m.company.name}</span>
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
                                    <span className="font-semibold text-foreground">{sourceFuzzySuggestion.label}</span>
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

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Company</span>
                        <select
                          value={profSourceCompanyId}
                          onChange={(e) => {
                            setProfSourceCompanyId(e.target.value);
                            const firstLvl = getLevelsForCompanyAndTrack(e.target.value, profTrack)[0];
                            if (firstLvl) setProfSourceLevelCode(firstLvl.levelCode);
                          }}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {getAllCompanies().map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Level</span>
                        <select
                          value={profSourceLevelCode}
                          onChange={(e) => setProfSourceLevelCode(e.target.value)}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {profSourceLevels.map((l) => (
                            <option key={l.levelCode} value={l.levelCode}>{l.levelCode} • {l.title}</option>
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
                      {currentProfTargetLevel && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {currentProfTargetLevel.levelCode} • {getEquivalenceHumanLabel(currentProfTargetLevel.equivalenceGroup)}
                        </span>
                      )}
                    </div>

                    {/* Single Searchable Autocomplete for Target */}
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
                          placeholder="Search target e.g. 'Meta E6', 'Flipkart SDE-3'..."
                          className="w-full bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-xs font-semibold text-foreground placeholder:text-muted focus:ring-2 focus:ring-primary outline-none"
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
                                  <span className="font-black text-foreground">{m.company.name}</span>
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
                                    <span className="font-semibold text-foreground">{targetFuzzySuggestion.label}</span>
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

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Company</span>
                        <select
                          value={profTargetCompanyId}
                          onChange={(e) => {
                            setProfTargetCompanyId(e.target.value);
                            const firstLvl = getLevelsForCompanyAndTrack(e.target.value, profTargetTrack)[0];
                            if (firstLvl) setProfTargetLevelCode(firstLvl.levelCode);
                          }}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {getAllCompanies().map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Level</span>
                        <select
                          value={profTargetLevelCode}
                          onChange={(e) => setProfTargetLevelCode(e.target.value)}
                          className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                        >
                          {profTargetLevels.map((l) => (
                            <option key={l.levelCode} value={l.levelCode}>{l.levelCode} • {l.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Simulator Settings */}
                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1">Performance Rating</label>
                    <select
                      value={profPerformance}
                      onChange={(e) => setProfPerformance(e.target.value as PerformanceBracket)}
                      className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="MEETS">Meets Expectations (Median)</option>
                      <option value="EXCEEDS">Exceeds Expectations (~p25)</option>
                      <option value="CONSISTENTLY_EXCEEDS">Consistently Exceeds (Top 10%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1">
                      Years in Current Level (0–15)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      step={0.5}
                      value={profYearsInLevel}
                      onChange={(e) => setProfYearsInLevel(parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-muted mt-0.5 block">Deducted from 1st promo window</span>
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1">
                      Current Annual CTC (₹ LPA, Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 42 (for ₹42 LPA)"
                      value={profCurrentCtcLPA}
                      onChange={(e) => setProfCurrentCtcLPA(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-muted mt-0.5 block">Shows real % jump</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateProf}
                  disabled={isCalculating}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Computing Promotion Pathway...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Simulate Promotion Trajectory
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                MODE B: WORKING PROFESSIONAL RESULTS DISPLAY
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'professional' && profResult && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setProfResult(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-surface border border-border text-foreground hover:bg-surface-2 transition-all cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Start Over / Reconfigure
                  </button>

                  <div className="text-right">
                    <span className="text-xs text-muted font-bold">
                      {profResult.sourceLevel.companyId.toUpperCase()} &rarr; {profResult.targetLevel.companyId.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Top Metrics Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted uppercase">Estimated Total Time</span>
                    <span className="text-2xl font-black text-foreground block mt-1">
                      {profResult.totalTime.likely} Years
                    </span>
                    <span className="text-xs text-muted mt-1 block">
                      Range: {profResult.totalTime.min}–{profResult.totalTime.max} yrs
                    </span>
                  </div>

                  <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted uppercase">Projected Annual Comp Jump</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                      +{formatINR(profResult.compJump.diff)} ({profResult.compJump.percentage > 0 ? `+${profResult.compJump.percentage}%` : '0%'})
                    </span>
                    <span className="text-xs text-muted mt-1 block">
                      {formatINR(profResult.compJump.from)} &rarr; {formatINR(profResult.compJump.to)}
                    </span>
                  </div>

                  <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
                    <span className="text-xs font-bold text-muted uppercase">Reaching Target Probability</span>
                    <span className="text-2xl font-black text-primary block mt-1">
                      {profResult.probability.percentage}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                      className="text-xs text-primary font-bold hover:underline mt-1 block cursor-pointer"
                    >
                      How this is calculated {showFormulaDetails ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Expandable Probability Calculation Formula */}
                {showFormulaDetails && (
                  <div className="bg-surface rounded-2xl p-5 border border-border text-xs space-y-2">
                    <span className="font-black text-foreground block">Mathematical Probability Model</span>
                    <p className="text-secondary leading-relaxed">
                      {profResult.probability.formulaExplanation}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-2 pt-1">
                      {profResult.probability.levelStallRates.map((sr, idx) => (
                        <div key={idx} className="p-2 bg-surface-2 rounded-lg border border-border">
                          <span className="font-bold text-foreground block">{sr.companyId.toUpperCase()} • {sr.levelCode}</span>
                          <span className="text-muted text-[10px]">Empirical Stall Rate: {sr.stallRate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* THE PROMOTION PLAN TIMELINE */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" /> The Promotion Plan
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Deterministic progression based on verified company ladder data.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {profResult.steps.map((step) => (
                      <div
                        key={step.stepIndex}
                        className="p-5 rounded-xl border border-border bg-surface-2/30 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">
                              {step.stepIndex}
                            </span>
                            <h4 className="text-sm font-black text-foreground">
                              {step.fromLevel.companyId.toUpperCase()} {step.fromLevel.levelCode} &rarr; {step.toLevel.companyId.toUpperCase()} {step.toLevel.levelCode}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border">
                              {step.stepType.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-primary block">
                              Duration: ~{step.durationYears.likely} yrs (range: {step.durationYears.min}–{step.durationYears.max} yrs)
                            </span>
                            <span className="text-[10px] text-muted">{step.cycleWindow}</span>
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className="grid sm:grid-cols-3 gap-3 text-xs">
                          <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                            <span className="font-extrabold text-foreground block">Scope Required</span>
                            <p className="text-secondary leading-relaxed">{step.requirements.scope}</p>
                          </div>
                          <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                            <span className="font-extrabold text-foreground block">Measurable Impact</span>
                            <p className="text-secondary leading-relaxed">{step.requirements.impact}</p>
                          </div>
                          <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                            <span className="font-extrabold text-foreground block">Leadership & Mentorship</span>
                            <p className="text-secondary leading-relaxed">{step.requirements.influence}</p>
                          </div>
                        </div>

                        {/* Blockers on this step */}
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-xs">
                          <span className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Structured Promotion Blockers ({step.blockers.length} Documented)
                          </span>
                          <div className="grid sm:grid-cols-2 gap-2 pt-1">
                            {step.blockers.slice(0, 4).map((blk, blkIdx) => (
                              <div key={blkIdx} className="bg-surface p-2.5 rounded-lg border border-border space-y-1">
                                <span className="font-bold text-foreground block text-[11px]">{blk.title}</span>
                                <p className="text-[10px] text-muted leading-tight">{blk.whyItBlocks}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COMPENSATION TRAJECTORY CHART (GREEN SALARY CHART) */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                      <h3 className="text-base font-black text-foreground flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Projected Compensation Trajectory (INR per year)
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Year 0 to Target Level. Real level comp bands in INR.
                      </p>
                    </div>
                  </div>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={profResult.compTimeline} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="emeraldGradientProf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="year" stroke="#888888" fontSize={11} tickLine={false} />
                        <YAxis
                          stroke="#888888"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(val) => formatINR(val)}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-surface border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                                  <p className="font-black text-foreground">{data.year} • {data.companyName}</p>
                                  <p className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                                    Total Annual CTC: {formatINR(data.salary)}
                                  </p>
                                  <div className="text-[10px] text-muted space-y-0.5 pt-1 border-t border-border">
                                    <p>Base: {formatINR(data.base)}</p>
                                    <p>Stock: {formatINR(data.stock)}</p>
                                    <p>Bonus: {formatINR(data.bonus)}</p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="salary"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url#emeraldGradientProf"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
