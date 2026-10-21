// ============================================================
// Career Path & Promotion Level Simulator — India Market Edition
// Strict INR currency, Student & Working Professional modes,
// Rich structured promotion blockers & India-office ladders
// ============================================================

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CareerPathBackButton } from '../../components/career-path/CareerPathBackButton';
import { Dropdown } from '../../components/career-path/Dropdown';
import {
  TrendingUp,
  Clock,
  Building2,
  ChevronRight,
  AlertTriangle,
  Info,
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  Award,
  X,
  GraduationCap,
  Briefcase,
  Target,
} from 'lucide-react';

import {
  getAllCompanies,
  getCompanyLadder,
  getLevelsForCompanyAndTrack,
  searchLevels,
  getFuzzySuggestion,
  getLevel,
  getEquivalenceHumanLabel,
} from '../../data/careerLadders';
import type {
  CareerTrack,
} from '../../data/careerLadders/types';
import {
  resolvePath,
  formatINR,
  formatINRRange,
  type PerformanceBracket,
  type PromotionPlan,
} from '../../lib/careerEngine';

import { LadderLevelExplorer } from './components/LadderLevelExplorer';
import { StudentPlacementPathway } from './components/StudentPlacementPathway';
import { CompensationTrajectoryChart } from './components/CompensationTrajectoryChart';
import { PromotionBlockersChecklist } from './components/PromotionBlockersChecklist';
import { ProfessionalPromotionResult } from './components/ProfessionalPromotionResult';

export interface CareerPathSimulatorProps {
  fixedTab?: 'simulator' | 'explorer';
}

export function CareerPathSimulator({ fixedTab }: CareerPathSimulatorProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isExplorerRoute = location.pathname.includes('/company-levels') || location.pathname.includes('/company-ladder');
  const isSimulatorRoute = location.pathname.includes('/dream-job-roadmap') || location.pathname.includes('/promotion-simulator');
  const derivedTab = fixedTab || (isExplorerRoute ? 'explorer' : isSimulatorRoute ? 'simulator' : 'simulator');

  const [activeTab, setActiveTabState] = useState<'simulator' | 'explorer'>(derivedTab);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Set dark color-scheme on mount and restore on unmount (Stage 2)
  useEffect(() => {
    const prevColorScheme = document.documentElement.style.colorScheme;
    const prevBg = document.body.style.backgroundColor;
    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#0a0a0a';

    return () => {
      document.documentElement.style.colorScheme = prevColorScheme;
      document.body.style.backgroundColor = prevBg;
    };
  }, []);

  useEffect(() => {
    if (fixedTab) {
      setActiveTabState(fixedTab);
    } else if (isExplorerRoute) {
      setActiveTabState('explorer');
    } else if (isSimulatorRoute) {
      setActiveTabState('simulator');
    }
  }, [fixedTab, isExplorerRoute, isSimulatorRoute]);

  const handleTabChange = (tab: 'simulator' | 'explorer') => {
    setActiveTabState(tab);
    if (tab === 'simulator') {
      navigate('/tools/career-path/dream-job-roadmap');
    } else {
      navigate('/tools/career-path/company-levels');
    }
  };

  const [simulatorMode, setSimulatorMode] = useState<'student' | 'fresher-programs' | 'professional'>('student');

  // ─────────────────────────────────────────────────────────────
  // Working Professional Mode Simulator State
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

  // Scroll & Focus Management
  const profResultSectionRef = useRef<HTMLDivElement>(null);
  const profHeadingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (profResult && profResultSectionRef.current) {
      const headerOffset = 90;
      const elementPosition = profResultSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
      profHeadingRef.current?.focus();
    }
  }, [profResult]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(e.target as Node)) {
        setIsTargetDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute fuzzy matches
  const sourceMatches = useMemo(() => searchLevels(sourceSearchQuery), [sourceSearchQuery]);
  const targetMatches = useMemo(() => searchLevels(targetSearchQuery), [targetSearchQuery]);

  const sourceFuzzySuggestion = useMemo(() => getFuzzySuggestion(sourceSearchQuery), [sourceSearchQuery]);
  const targetFuzzySuggestion = useMemo(() => getFuzzySuggestion(targetSearchQuery), [targetSearchQuery]);

  const currentProfSourceLevel = useMemo(() => getLevel(profSourceCompanyId, profSourceLevelCode, profTrack), [profSourceCompanyId, profSourceLevelCode, profTrack]);
  const currentProfTargetLevel = useMemo(() => getLevel(profTargetCompanyId, profTargetLevelCode, profTargetTrack), [profTargetCompanyId, profTargetLevelCode, profTargetTrack]);

  const profSourceLevels = useMemo(() => getLevelsForCompanyAndTrack(profSourceCompanyId, profTrack), [profSourceCompanyId, profTrack]);
  const profTargetLevels = useMemo(() => getLevelsForCompanyAndTrack(profTargetCompanyId, profTargetTrack), [profTargetCompanyId, profTargetTrack]);

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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20 selection:bg-blue-500 selection:text-white" data-theme="career-dark">
      {/* ── Reusable Back Button & Breadcrumbs Navigation ─────────── */}
      <CareerPathBackButton
        isHub={false}
        currentPageTitle={
          activeTab === 'simulator'
            ? 'Dream Job Roadmap'
            : 'Company Levels & Pay'
        }
      />

      {/* ── Sub-Page Title & Tab Navigation Bar ───────────────────── */}
      <div className="border-b border-neutral-800/80 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {activeTab === 'simulator'
                  ? 'Dream Job Roadmap'
                  : 'Company Levels & Pay'}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                {activeTab === 'simulator'
                  ? 'Plan your path from campus to dream companies: real eligibility, fresher CTC, and clear next steps.'
                  : 'Real India-office levels, verified CTC bands in INR, and promotion requirements.'}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-800 rounded-xl border border-neutral-700">
              <button
                type="button"
                onClick={() => handleTabChange('simulator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Dream Job Roadmap
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('explorer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'explorer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Company Levels &amp; Pay
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 1: COMPANY LEVELS & PAY EXPLORER
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'explorer' && (
          <LadderLevelExplorer
            initialCompanyId="google"
            initialTrack="SWE"
            initialSegment="ALL"
          />
        )}

        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 2: DREAM JOB ROADMAP
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'simulator' && (
          <div className="space-y-8 animate-fade-in">
            {/* Mode Switcher: Fresher Entry vs Student Roadmap vs Working Professional */}
            <div className="flex justify-center">
              <div className="inline-flex p-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-md flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('fresher-programs');
                    setProfResult(null);
                  }}
                  className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    simulatorMode === 'fresher-programs'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Fresher / Campus Entry (&apos;26-27)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('student');
                    setProfResult(null);
                  }}
                  className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    simulatorMode === 'student'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Campus-to-Dream Roadmap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('professional');
                  }}
                  className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                    simulatorMode === 'professional'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  I&apos;m Already Working
                </button>
              </div>
            </div>

            {/* Student Pathways (Fresher Programs & Student Roadmap) */}
            {(simulatorMode === 'fresher-programs' || simulatorMode === 'student') && (
              <StudentPlacementPathway
                mode={simulatorMode}
                prefersReducedMotion={prefersReducedMotion}
              />
            )}

            {/* ─────────────────────────────────────────────────────────
                MODE B: WORKING PROFESSIONAL SIMULATOR FORM
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'professional' && !profResult && (
              <div className="bg-surface rounded-2xl p-6 md:p-8 border border-border shadow-xl max-w-3xl mx-auto space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" /> Configure Your Career Switch &amp; Level-Up Plan
                  </h2>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">
                    Plan your path to a higher level or cross-company switch: equivalence jumps, target compensation in INR, and promotion requirements.
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Company</span>
                        <Dropdown
                          searchable={true}
                          value={profSourceCompanyId}
                          onChange={(val) => {
                            setProfSourceCompanyId(val);
                            const firstLvl = getLevelsForCompanyAndTrack(val, profTrack)[0];
                            if (firstLvl) setProfSourceLevelCode(firstLvl.levelCode);
                          }}
                          options={getAllCompanies().map((c) => ({
                            value: c.id,
                            label: c.name,
                            sublabel: c.marketSegment,
                            category: c.marketSegment,
                          }))}
                          placeholder="Select current company..."
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Level</span>
                        <Dropdown
                          searchable={true}
                          value={profSourceLevelCode}
                          onChange={(val) => setProfSourceLevelCode(val)}
                          options={profSourceLevels.map((l) => ({
                            value: l.levelCode,
                            label: `${l.levelCode} • ${l.title}`,
                            sublabel: `${getEquivalenceHumanLabel(l.equivalenceGroup)} • Min ${l.yoeTypicalMin}+ YOE`,
                            badge: l.levelCode,
                          }))}
                          placeholder="Select current level..."
                        />
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Company</span>
                        <Dropdown
                          searchable={true}
                          value={profTargetCompanyId}
                          onChange={(val) => {
                            setProfTargetCompanyId(val);
                            const firstLvl = getLevelsForCompanyAndTrack(val, profTargetTrack)[0];
                            if (firstLvl) setProfTargetLevelCode(firstLvl.levelCode);
                          }}
                          options={getAllCompanies().map((c) => ({
                            value: c.id,
                            label: c.name,
                            sublabel: c.marketSegment,
                            category: c.marketSegment,
                          }))}
                          placeholder="Select target company..."
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-muted font-bold block mb-1">Level</span>
                        <Dropdown
                          searchable={true}
                          value={profTargetLevelCode}
                          onChange={(val) => setProfTargetLevelCode(val)}
                          options={profTargetLevels.map((l) => ({
                            value: l.levelCode,
                            label: `${l.levelCode} • ${l.title}`,
                            sublabel: `${getEquivalenceHumanLabel(l.equivalenceGroup)} • Min ${l.yoeTypicalMin}+ YOE`,
                            badge: l.levelCode,
                          }))}
                          placeholder="Select target level..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-xs font-black text-foreground">Performance Rating</label>
                    </div>
                    <Dropdown
                      value={profPerformance}
                      onChange={(val) => setProfPerformance(val as PerformanceBracket)}
                      options={[
                        { value: 'MEETS', label: 'Meets Expectations', sublabel: 'Median standard band' },
                        { value: 'EXCEEDS', label: 'Exceeds Expectations', sublabel: 'Fast-track trajectory (~p25)' },
                        { value: 'CONSISTENTLY_EXCEEDS', label: 'Consistently Exceeds', sublabel: 'Top 10% highest velocity' },
                      ]}
                    />
                  </div>

                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-xs font-black text-foreground">
                        Years in Current Level (0–15)
                      </label>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      step={0.5}
                      value={profYearsInLevel}
                      onChange={(e) => setProfYearsInLevel(parseFloat(e.target.value) || 0)}
                      className="w-full min-h-[44px] h-[44px] bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-muted mt-1 block">Deducted from 1st promo window</span>
                  </div>

                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-xs font-black text-foreground">
                        Current Annual CTC (₹ LPA, Optional)
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 42 (for ₹42 LPA)"
                      value={profCurrentCtcLPA}
                      onChange={(e) => setProfCurrentCtcLPA(e.target.value)}
                      className="w-full min-h-[44px] h-[44px] bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="text-[10px] text-muted mt-1 block">Shows real % jump</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateProf}
                  disabled={isCalculating}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Computing Promotion Pathway...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Build my switch &amp; level-up plan
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Professional Loading Skeleton */}
            {isCalculating && simulatorMode === 'professional' && (
              <div className="bg-surface rounded-2xl p-8 border border-border shadow-xl max-w-4xl mx-auto space-y-6 min-h-[380px] animate-pulse">
                <div className="h-6 bg-surface-2 rounded-lg w-1/3 mb-4" />
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="h-28 bg-surface-2 rounded-2xl" />
                  <div className="h-28 bg-surface-2 rounded-2xl" />
                  <div className="h-28 bg-surface-2 rounded-2xl" />
                </div>
                <div className="h-44 bg-surface-2 rounded-2xl mt-4" />
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                MODE B: WORKING PROFESSIONAL RESULTS DISPLAY
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'professional' && profResult && !isCalculating && (
              <ProfessionalPromotionResult
                profResult={profResult}
                profPerformance={profPerformance}
                prefersReducedMotion={prefersReducedMotion}
                onReset={() => setProfResult(null)}
                sectionRef={profResultSectionRef}
                headingRef={profHeadingRef}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
