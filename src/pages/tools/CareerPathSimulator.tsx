// ============================================================
// Career Path & Promotion Level Simulator — India Market Edition
// Strict INR currency, Student & Working Professional modes,
// Rich structured promotion blockers & India-office ladders
// ============================================================

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CareerPathBackButton } from '../../components/career-path/CareerPathBackButton';
import { BranchCombobox } from '../../components/career-path/BranchCombobox';
import { sanitizeUrl } from '@/utils/security';
import {
  DEGREE_BRANCH_CATALOG,
  type DegreeBranchOption,
  type BranchFamily,
} from '../../data/careerLadders/degreesAndBranches';
import {
  getGraduationYearOptions,
  snapToNearestGradYear,
  calculateYearOfStudy,
} from '../../lib/academicCalendar';
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
  CartesianGrid,
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
  type CompDataPoint,
} from '../../lib/careerEngine';
import { careers, DataBadge } from '../../careers-core';
import type { FresherProgram } from '../../careers-core';

export interface CareerPathSimulatorProps {
  fixedTab?: 'simulator' | 'explorer';
}

const formatChartINRTick = (val: number): string => {
  if (val === 0) return '₹0';
  if (val >= 10000000) {
    const cr = val / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  const l = Math.round(val / 100000);
  return `₹${l} L`;
};

const renderCompTimelineTick = (timeline: CompDataPoint[]) => (props: any) => {
  const { x, y, payload } = props;
  const pt = timeline.find((d) => d.year === payload?.value) || timeline[props.index];
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={600}>
        {payload?.value}
      </text>
      {pt?.levelCode && (
        <text x={0} y={0} dy={26} textAnchor="middle" fill="#38bdf8" fontSize={10} fontWeight={700}>
          {pt.levelCode}
        </text>
      )}
    </g>
  );
};

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
  const [campusCategoryFilter, setCampusCategoryFilter] = useState<'all' | 'super-dream' | 'dream' | 'mass'>('all');
  const [campusProgramSearch, setCampusProgramSearch] = useState('');

  // ─────────────────────────────────────────────────────────────
  // SUBSECTION 1: Company Levels & Pay State
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
  const [selectedBranchOption, setSelectedBranchOption] = useState<DegreeBranchOption>(
    DEGREE_BRANCH_CATALOG[0]
  );

  // Branch eligible campus programs using careers.programs.forBranch
  const branchPrograms = useMemo(() => {
    const byFamily = careers.programs.forBranch(selectedBranchOption.family);
    const codeGuess = selectedBranchOption.id.replace('btech-', '').replace('be-', '');
    const byCode = careers.programs.forBranch(codeGuess);
    const combined = Array.from(new Set([...byFamily, ...byCode]));
    return combined;
  }, [selectedBranchOption]);

  const filteredBranchPrograms = useMemo(() => {
    return branchPrograms.filter((p) => {
      const matchCat = campusCategoryFilter === 'all' || p.campusCategory === campusCategoryFilter;
      const q = campusProgramSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.programName.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.companyId.toLowerCase().includes(q) ||
        (careers.companies.get(p.companyId)?.name.toLowerCase().includes(q) ?? false);
      return matchCat && matchSearch;
    });
  }, [branchPrograms, campusCategoryFilter, campusProgramSearch]);

  const [studentDegree, setStudentDegree] = useState<string>(DEGREE_BRANCH_CATALOG[0].label);
  const [studentTier, setStudentTier] = useState<StudentProfile['collegeTier']>('Tier 1');
  const [studentGradYear, setStudentGradYear] = useState<number>(() => {
    const opts = getGraduationYearOptions(DEGREE_BRANCH_CATALOG[0].degreeName);
    const finalYear = opts.find((o) => o.status === 'final') || opts[0];
    return finalYear.gradYear;
  });
  const [studentCgpa, setStudentCgpa] = useState<StudentProfile['cgpaBracket']>('above_8');
  const [studentInternship, setStudentInternship] = useState<StudentProfile['internshipStatus']>('none');
  const [studentDreamCompanyId, setStudentDreamCompanyId] = useState<string>('google');
  const [studentDreamLevelCode, setStudentDreamLevelCode] = useState<string>('L5');
  const [studentTrack, setStudentTrack] = useState<CareerTrack>('SWE');

  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
  const studentSearchRef = useRef<HTMLDivElement>(null);

  const [studentResult, setStudentResult] = useState<StudentPromotionPlan | null>(null);

  // Dynamic date-driven graduation year options
  const gradYearOptions = useMemo(
    () => getGraduationYearOptions(selectedBranchOption.degreeName),
    [selectedBranchOption.degreeName]
  );

  const selectedGradYearOption = useMemo(
    () => gradYearOptions.find((o) => o.gradYear === studentGradYear),
    [gradYearOptions, studentGradYear]
  );

  const handleBranchChange = (opt: DegreeBranchOption) => {
    setSelectedBranchOption(opt);
    setStudentDegree(opt.label);
    const snapped = snapToNearestGradYear(studentGradYear, opt.degreeName);
    setStudentGradYear(snapped);
  };

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

  // Scroll & Focus Management (Stage 5)
  const studentResultSectionRef = useRef<HTMLDivElement>(null);
  const studentHeadingRef = useRef<HTMLHeadingElement>(null);
  const profResultSectionRef = useRef<HTMLDivElement>(null);
  const profHeadingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (studentResult && studentResultSectionRef.current) {
      const headerOffset = 90;
      const elementPosition = studentResultSectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
      studentHeadingRef.current?.focus();
    }
  }, [studentResult]);

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
        const yos = calculateYearOfStudy(studentGradYear, selectedBranchOption.degreeName);
        const plan = resolveStudentPath({
          degreeAndBranch: selectedBranchOption.label,
          collegeTier: studentTier,
          currentYearOfStudy: yos.label,
          yearOfStudy: yos.yearOfStudy,
          branchFamily: selectedBranchOption.family,
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20 selection:bg-blue-500 selection:text-white" data-theme="career-dark">
      {/* ── Reusable Back Button & Breadcrumbs Navigation (Stage 2) ─ */}
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
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                aria-current={activeTab === 'simulator' ? 'page' : undefined}
              >
                <Compass className="w-3.5 h-3.5" />
                Dream Job Roadmap
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('explorer')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'explorer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                aria-current={activeTab === 'explorer' ? 'page' : undefined}
              >
                <Building2 className="w-3.5 h-3.5" />
                Company Levels &amp; Pay
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 1: COMPANY LEVELS & PAY
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
        )}

        {/* ═════════════════════════════════════════════════════════════
            SUBSECTION 2: DREAM JOB ROADMAP
            ═════════════════════════════════════════════════════════════ */}
        {activeTab === 'simulator' && (
          <div className="space-y-8 animate-fade-in">
            {/* Mode Switcher: Student vs Working Professional */}
            {/* Mode Switcher: Fresher Entry vs Student Roadmap vs Working Professional */}
            <div className="flex justify-center">
              <div className="inline-flex p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('fresher-programs');
                    setProfResult(null);
                    setStudentResult(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    simulatorMode === 'fresher-programs'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Fresher / Campus Entry ('26-27)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('student');
                    setProfResult(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    simulatorMode === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Campus-to-Dream Roadmap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimulatorMode('professional');
                    setStudentResult(null);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    simulatorMode === 'professional'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  I&apos;m Already Working
                </button>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────
                MODE C: FRESHER / CAMPUS ENTRY PROGRAMS VIEW
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'fresher-programs' && (
              <div className="space-y-6">
                {/* Branch Selection & Filter Header */}
                <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 shadow-xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          2026-27 Hiring Season Live
                        </span>
                        <span className="text-xs text-neutral-400 font-bold">
                          {branchPrograms.length} Eligible Programs
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Verified Campus Entry Programs for Your Engineering Branch
                      </h2>
                      <p className="text-xs text-neutral-300 mt-0.5">
                        Authentic hiring criteria, first-round screening formats, bond commitments, and promotion steps across India employers.
                      </p>
                    </div>

                    {/* Degree & Branch Combobox */}
                    <div className="w-full md:w-80 shrink-0">
                      <label className="text-xs font-bold text-neutral-400 block mb-1.5">
                        Your Branch / Discipline:
                      </label>
                      <BranchCombobox
                        value={selectedBranchOption.id}
                        onChange={handleBranchChange}
                      />
                    </div>
                  </div>

                  {/* Filter Pills & Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-neutral-400 mr-1">Category:</span>
                      {(['all', 'super-dream', 'dream', 'mass'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCampusCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all capitalize ${
                            campusCategoryFilter === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {cat === 'all' ? `All (${branchPrograms.length})` : cat.replace('-', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={campusProgramSearch}
                        onChange={(e) => setCampusProgramSearch(e.target.value)}
                        placeholder="Search company, role, program..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredBranchPrograms.map((prog) => {
                    const comp = careers.companies.get(prog.companyId);
                    const ctcStr = prog.compensation?.fixedMinLPA
                      ? `₹${prog.compensation.fixedMinLPA}${prog.compensation.fixedMaxLPA ? ` - ₹${prog.compensation.fixedMaxLPA}` : ''} LPA`
                      : 'Competitive Market Band';

                    return (
                      <div
                        key={prog.id}
                        className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-4 shadow-sm group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                                  {comp?.name || prog.companyId}
                                </span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 uppercase">
                                  {prog.campusCategory.replace('-', ' ')}
                                </span>
                                <DataBadge entity={prog} />
                              </div>
                              <h3 className="text-sm font-bold text-neutral-200">
                                {prog.programName}
                              </h3>
                              <p className="text-xs text-neutral-400 font-medium">
                                {prog.roleTitle} · {prog.roleFamily}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-emerald-400 block">
                                {ctcStr}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                Total CTC
                              </span>
                            </div>
                          </div>

                          {/* Key Criteria Pill Bar */}
                          <div className="grid grid-cols-3 gap-2 text-xs py-1">
                            <div className="p-2 rounded-xl bg-neutral-800/70 border border-neutral-700/60">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                Academic Cutoff
                              </span>
                              <span className="font-semibold text-neutral-200 text-[11px]">
                                {prog.eligibility.minCgpa ? `≥ ${prog.eligibility.minCgpa} CGPA` : 'No hard cutoff'}
                              </span>
                              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                                {prog.eligibility.backlogPolicy || '0 backlogs'}
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-neutral-800/70 border border-neutral-700/60">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                Training &amp; Bond
                              </span>
                              <span className="font-semibold text-neutral-200 text-[11px]">
                                {prog.training.bondMonths ? `${prog.training.bondMonths} mo bond` : 'Zero service bond'}
                              </span>
                              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                                {prog.training.bondAmountINR ? `₹${(prog.training.bondAmountINR / 100000).toFixed(1)}L bond` : 'No penalty'}
                              </div>
                            </div>

                            <div className="p-2 rounded-xl bg-neutral-800/70 border border-neutral-700/60">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                                Next Promotion
                              </span>
                              <span className="font-semibold text-neutral-200 text-[11px] truncate block">
                                {prog.trajectory[0] ? `${prog.trajectory[0].fromLevelCode} → ${prog.trajectory[0].toLevelCode}` : 'Fast-Track'}
                              </span>
                              <div className="text-[10px] text-emerald-400 truncate mt-0.5">
                                {prog.trajectory[0]?.typicalYearsMin ? `${prog.trajectory[0].typicalYearsMin}-${prog.trajectory[0].typicalYearsMax} yrs cadence` : 'Standard cadence'}
                              </div>
                            </div>
                          </div>

                          {/* Selection Stages Funnel */}
                          <div className="pt-2 border-t border-neutral-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                              Selection Stages ({prog.selectionProcess.length} Rounds):
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {prog.selectionProcess.map((stage, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-300"
                                >
                                  <span className="font-mono text-[10px] text-blue-400 font-bold">
                                    {idx + 1}.
                                  </span>
                                  <span>{stage.stage}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Competency badges */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] font-semibold text-neutral-400 uppercase">
                              Evaluated Skills:
                            </span>
                            {Object.keys(prog.competencyProfile).map((c) => (
                              <span
                                key={c}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700 uppercase"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
                          <Link
                            to={`/tools/resume-checker?company=${prog.companyId}&role=${encodeURIComponent(prog.roleTitle)}`}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Roast Resume Against Program
                          </Link>

                          <Link
                            to={`/demo/company/${prog.companyId}`}
                            className="text-xs font-bold text-neutral-400 hover:text-white transition-colors"
                          >
                            Company Roles &amp; Fit →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredBranchPrograms.length === 0 && (
                  <div className="p-12 text-center bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3">
                    <p className="text-sm font-bold text-neutral-300">
                      No campus programs found matching &ldquo;{campusProgramSearch}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCampusProgramSearch('');
                        setCampusCategoryFilter('all');
                      }}
                      className="text-xs font-bold text-blue-400 hover:underline"
                    >
                      Clear search and category filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────
                MODE A: STUDENT SIMULATOR FORM
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'student' && !studentResult && (
              <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 border border-neutral-800 shadow-xl max-w-3xl mx-auto space-y-6">
                <div className="border-b border-neutral-800 pb-4">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-400" /> Configure Your Campus-to-Dream Job Roadmap
                  </h2>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Select your college background and dream company to see real campus hiring routes, eligibility cutoffs, fresher CTC packages in INR, and the multi-year path to reach your dream level.
                  </p>
                </div>

                {/* College Profile Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  {/* College Tier */}
                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-xs font-black text-white">College Tier</label>
                    </div>
                    <select
                      value={studentTier}
                      onChange={(e) => setStudentTier(e.target.value as StudentProfile['collegeTier'])}
                      className="w-full min-h-[44px] h-[44px] bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Tier 1">Tier 1 (IIT, NIT, IIIT, BITS)</option>
                      <option value="Tier 2">Tier 2 (VIT, Manipal, Thapar, RVCE, etc.)</option>
                      <option value="Tier 3">Tier 3 (State / Private Colleges)</option>
                      <option value="Other">Other University</option>
                    </select>
                    <div className="h-6 flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {studentTier}
                      </span>
                      <span className="text-[11px] text-neutral-400">Campus hiring pool</span>
                    </div>
                  </div>

                  {/* Degree & Branch Combobox */}
                  <div>
                    <BranchCombobox
                      value={selectedBranchOption.id}
                      onChange={handleBranchChange}
                    />
                  </div>

                  {/* Current Year & Expected Grad Year */}
                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-xs font-black text-white">Graduation Year</label>
                    </div>
                    <select
                      value={studentGradYear}
                      onChange={(e) => setStudentGradYear(parseInt(e.target.value, 10))}
                      className="w-full min-h-[44px] h-[44px] bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {gradYearOptions.map((opt) => (
                        <option key={opt.gradYear} value={opt.gradYear}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="h-6 flex items-center gap-1.5 mt-1.5">
                      {selectedGradYearOption && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {selectedGradYearOption.shortLabel}
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-400 truncate">{selectedGradYearOption?.label || 'Target batch'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* CGPA Bracket */}
                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black text-white">CGPA Bracket</label>
                    </div>
                    <select
                      value={studentCgpa}
                      onChange={(e) => setStudentCgpa(e.target.value as StudentProfile['cgpaBracket'])}
                      className="w-full min-h-[44px] h-[44px] bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="above_8">Above 8.0 CGPA (Eligible for all drives)</option>
                      <option value="7_to_8">7.0 to 8.0 CGPA (Meets most cutoffs)</option>
                      <option value="6_to_7">6.0 to 7.0 CGPA (Eligible for select drives)</option>
                      <option value="below_6">Below 6.0 CGPA (Requires hackathons/off-campus)</option>
                    </select>
                  </div>

                  {/* Internship Status */}
                  <div>
                    <div className="h-5 flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black text-white">Internship Status</label>
                    </div>
                    <select
                      value={studentInternship}
                      onChange={(e) => setStudentInternship(e.target.value as StudentProfile['internshipStatus'])}
                      className="w-full min-h-[44px] h-[44px] bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="none">No Internship Yet</option>
                      <option value="completed">Completed Summer Internship</option>
                      <option value="ppo">Have Pre-Placement Offer (PPO)</option>
                    </select>
                  </div>
                </div>

                {/* Dream Company & Target Role Selection */}
                <div className="p-4.5 rounded-xl bg-neutral-800/60 border border-neutral-700/80 space-y-3.5 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-blue-400" /> Target Dream Company &amp; Level
                    </label>
                    {currentStudentDreamLevel && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {currentStudentDreamLevel.levelCode} • {getEquivalenceHumanLabel(currentStudentDreamLevel.equivalenceGroup)}
                      </span>
                    )}
                  </div>

                  {/* Single Searchable Autocomplete for Dream Company */}
                  <div className="relative" ref={studentSearchRef}>
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => {
                          setStudentSearchQuery(e.target.value);
                          setIsStudentSearchOpen(true);
                        }}
                        onFocus={() => setIsStudentSearchOpen(true)}
                        placeholder="Search dream role e.g. 'Google L5', 'Flipkart SDE-2', 'Amazon SDE III'..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      {studentSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setStudentSearchQuery('');
                            setIsStudentSearchOpen(false);
                          }}
                          className="absolute right-2.5 p-0.5 text-neutral-400 hover:text-white rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isStudentSearchOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-neutral-800">
                        {studentMatches.length > 0 ? (
                          studentMatches.map((m) => (
                            <div
                              key={`${m.company.id}-${m.level.levelCode}-${m.level.track}`}
                              onClick={() => handleSelectStudentDream(m.company.id, m.level.levelCode, m.level.track)}
                              className="p-2.5 hover:bg-blue-600/10 cursor-pointer flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-black text-white">{m.company.name}</span>
                                <span className="text-neutral-300 ml-1.5 font-medium">{m.level.title}</span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-black text-blue-400 border border-neutral-700">
                                {m.level.levelCode}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs space-y-2">
                            <p className="text-neutral-400">No exact ladder node matched &ldquo;{studentSearchQuery}&rdquo;.</p>
                            {studentFuzzySuggestion && (
                              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                                  <Sparkles className="w-3.5 h-3.5" /> Did you mean?
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-white">{studentFuzzySuggestion.label}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectStudentDream(
                                      studentFuzzySuggestion.company.id,
                                      studentFuzzySuggestion.level.levelCode,
                                      studentFuzzySuggestion.level.track
                                    )}
                                    className="px-2 py-1 rounded bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 shrink-0 cursor-pointer"
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
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-neutral-700/60">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block mb-1">Dream Company</span>
                      <select
                        value={studentDreamCompanyId}
                        onChange={(e) => {
                          setStudentDreamCompanyId(e.target.value);
                          const firstLvl = getLevelsForCompanyAndTrack(e.target.value, studentTrack)[0];
                          if (firstLvl) setStudentDreamLevelCode(firstLvl.levelCode);
                        }}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {getAllCompanies().map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold block mb-1">Dream Target Level</span>
                      <select
                        value={studentDreamLevelCode}
                        onChange={(e) => setStudentDreamLevelCode(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Computing Campus-to-Career Roadmap...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Build my roadmap
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Skeleton while calculating (Prevents CLS - Stage 5) */}
            {isCalculating && simulatorMode === 'student' && (
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
                STUDENT ROADMAP RESULTS DISPLAY (Stage 5 Top Opening)
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'student' && studentResult && !isCalculating && (
              <div ref={studentResultSectionRef} className="space-y-8 animate-fade-in">
                {/* Result Top Action Bar */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStudentResult(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-surface border border-border text-foreground hover:bg-surface-2 transition-all cursor-pointer shadow-xs min-h-[44px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Start Over / Edit Profile
                  </button>

                  <div className="text-right">
                    <span className="text-xs text-muted font-bold">
                      {studentResult.studentProfile.collegeTier} • {studentResult.studentProfile.currentYearOfStudy} (Class of {studentResult.studentProfile.expectedGraduationYear})
                    </span>
                  </div>
                </div>

                {/* Primary Heading with tabIndex={-1} for keyboard focus */}
                <h2
                  ref={studentHeadingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-black text-foreground outline-none flex items-center gap-2.5 tracking-tight"
                >
                  <Target className="w-6 h-6 text-primary" />
                  Your Campus-to-Offer Roadmap
                </h2>

                {/* 1. CAN I GET IN? (ELIGIBILITY & CUTOFFS) */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                        Question 1 of 5
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        Can I get in? (Eligibility &amp; Cutoffs)
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {studentResult.probability.percentage}% Target Success Probability
                    </span>
                  </div>

                  {/* Trajectory Scope */}
                  <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase block">Target Pathway</span>
                      <p className="text-sm font-black text-foreground mt-0.5">
                        Campus Entry at {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode}) &rarr; Target Level {studentResult.targetLevel.levelCode} ({studentResult.targetLevel.title})
                      </p>
                    </div>
                    <span className="text-xs font-bold text-secondary">
                      {studentResult.studentProfile.collegeTier} • {studentResult.studentProfile.degreeAndBranch}
                    </span>
                  </div>

                  {/* Eligibility Windows & Date-Driven Status */}
                  {studentResult.eligibilityWindows && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-foreground flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          Academic Status: {studentResult.eligibilityWindows.currentStatus}
                        </span>
                        <span className="font-bold text-muted text-[11px]">
                          {studentResult.eligibilityWindows.remainingSemesters} Semesters Remaining
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                        <div>
                          <span className="font-bold text-muted block">Internship Window:</span>
                          <span className="font-semibold text-foreground">{studentResult.eligibilityWindows.internshipWindow}</span>
                        </div>
                        <div>
                          <span className="font-bold text-muted block">Campus Placement Drive:</span>
                          <span className="font-semibold text-foreground">{studentResult.eligibilityWindows.campusPlacementWindow}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-secondary pt-1 border-t border-primary/15">
                        <strong className="text-foreground">Recommended Focus:</strong> {studentResult.eligibilityWindows.recommendedFocus}
                      </p>
                    </div>
                  )}

                  {/* Academic & Cutoff Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-muted uppercase block">College Tier</span>
                      <span className="font-black text-foreground mt-0.5 block">{studentResult.studentProfile.collegeTier}</span>
                      <span className="text-[10px] text-emerald-400 mt-1 block">Campus hiring pool</span>
                    </div>
                    <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-muted uppercase block">Branch Family</span>
                      <span className="font-black text-foreground mt-0.5 block truncate" title={studentResult.studentProfile.degreeAndBranch}>
                        {studentResult.studentProfile.branchFamily}
                      </span>
                      <span className="text-[10px] text-emerald-400 mt-1 block">Degree eligible</span>
                    </div>
                    <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-muted uppercase block">CGPA Cutoff Status</span>
                      <span className="font-black text-foreground mt-0.5 block">
                        {studentResult.studentProfile.cgpaBracket === 'above_8' ? '> 8.0 CGPA' : studentResult.studentProfile.cgpaBracket === '7_to_8' ? '7.0–8.0 CGPA' : studentResult.studentProfile.cgpaBracket === '6_to_7' ? '6.0–7.0 CGPA' : '< 6.0 CGPA'}
                      </span>
                      <span className="text-[10px] text-secondary mt-1 block">Meets prime cutoffs</span>
                    </div>
                    <div className="p-3 bg-surface-2/40 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-muted uppercase block">Internship Status</span>
                      <span className="font-black text-foreground mt-0.5 block capitalize">
                        {studentResult.studentProfile.internshipStatus === 'ppo' ? 'Have PPO' : studentResult.studentProfile.internshipStatus === 'completed' ? 'Completed' : 'None yet'}
                      </span>
                      <span className="text-[10px] text-secondary mt-1 block">Pre-placement track</span>
                    </div>
                  </div>
                </div>

                {/* 2. HOW DO I GET IN? (RANKED ENTRY ROUTES) */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-4">
                  <div className="border-b border-border pb-3">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                      Question 2 of 5
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      How do I get in? (Ranked Entry Routes)
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Real documented hiring pipelines for campus candidates into {studentResult.dreamCompany.name} based on your college tier ({studentResult.studentProfile.collegeTier}).
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
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : route.adjustedLikelihood === 'Medium'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              Likelihood: {route.adjustedLikelihood}
                            </span>
                          </div>

                          <p className="text-[11px] text-muted leading-relaxed">{route.likelihoodReason}</p>

                          <div className="mt-2.5 pt-2.5 border-t border-border/60 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted font-bold">Typical CTC Offer:</span>
                              <span className="font-black text-emerald-400">
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

                {/* 3. WHAT WILL I EARN? (FRESHER CTC & GROWTH TRAJECTORY) */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
                  <div className="border-b border-border pb-3">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                      Question 3 of 5
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      What will I earn? (Fresher CTC in INR)
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Verified fresher entry package at {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode}) and multi-year trajectory to target level {studentResult.targetLevel.levelCode}.
                    </p>
                  </div>

                  {/* Top Metrics Cards */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Fresher Entry Offer (INR)</span>
                      <span className="text-2xl font-black text-emerald-400 block mt-1">
                        {formatINR(studentResult.entryRoutes[0]?.expectedOfferINR || studentResult.entryLevel.comp.total.p50)}
                      </span>
                      <span className="text-xs text-secondary mt-1 block">
                        At {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode})
                      </span>
                    </div>

                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Target Level Compensation</span>
                      <span className="text-2xl font-black text-white block mt-1">
                        {formatINR(studentResult.targetLevel.comp.total.p50)}
                      </span>
                      <span className="text-xs text-secondary mt-1 block">
                        {studentResult.targetLevel.levelCode} • {studentResult.targetLevel.title}
                      </span>
                    </div>

                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Estimated Time from Graduation</span>
                      <span className="text-2xl font-black text-primary block mt-1">
                        {studentResult.totalTimeFromGraduation.likely} Years
                      </span>
                      <span className="text-xs text-muted mt-1 block">
                        Range: {studentResult.totalTimeFromGraduation.min}–{studentResult.totalTimeFromGraduation.max} yrs (By ~{studentResult.studentProfile.expectedGraduationYear + Math.round(studentResult.totalTimeFromGraduation.likely)})
                      </span>
                    </div>
                  </div>

                  {/* Rebuilt Compensation Trajectory Chart */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">
                        Projected Compensation Trajectory (Per Year in INR)
                      </span>
                      <span className="text-[11px] text-muted">
                        Starting Class of {studentResult.studentProfile.expectedGraduationYear}
                      </span>
                    </div>

                    <div
                      role="img"
                      aria-label={`Projected compensation trajectory from ${formatINR(studentResult.compTimeline[0]?.salary || 0)} at campus entry to ${formatINR(studentResult.compTimeline[studentResult.compTimeline.length - 1]?.salary || 0)} at target level.`}
                      className="h-72 w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={studentResult.compTimeline} margin={{ top: 12, right: 24, left: 10, bottom: 26 }}>
                          <defs>
                            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="year"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            tick={renderCompTimelineTick(studentResult.compTimeline)}
                            interval={0}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickFormatter={formatChartINRTick}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-neutral-900 border border-neutral-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1 backdrop-blur-md">
                                    <p className="font-black text-white">{data.year} • {data.companyName} ({data.levelCode})</p>
                                    <p className="text-emerald-400 font-extrabold text-sm">
                                      Total Annual CTC: {formatINR(data.salary)}
                                    </p>
                                    <div className="text-[10px] text-neutral-400 space-y-0.5 pt-1 border-t border-neutral-800">
                                      <p>Fixed Base: {formatINR(data.base)}</p>
                                      <p>Annual Stock: {formatINR(data.stock)}</p>
                                      <p>Yearly Bonus: {formatINR(data.bonus)}</p>
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
                            fill="url(#emeraldGradient)"
                            dot={{ r: 4, fill: '#10b981', stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 4 }}
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={800}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Accessible hidden data table */}
                    <div className="sr-only">
                      <table>
                        <caption>Projected Campus-to-Career Compensation Timeline</caption>
                        <thead>
                          <tr>
                            <th scope="col">Year</th>
                            <th scope="col">Company</th>
                            <th scope="col">Level</th>
                            <th scope="col">Total Annual CTC</th>
                            <th scope="col">Base Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentResult.compTimeline.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.year}</td>
                              <td>{item.companyName}</td>
                              <td>{item.levelCode}</td>
                              <td>{formatINR(item.salary)}</td>
                              <td>{formatINR(item.base)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 4. WHEN WILL IT HAPPEN? (CALENDAR TIMELINE) */}
                {studentResult.steps.length > 0 && (
                  <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
                    <div className="border-b border-border pb-3">
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                        Question 4 of 5
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        When will it happen? (Calendar Timeline)
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
                              <span className="font-extrabold text-foreground block">Leadership &amp; Mentorship</span>
                              <p className="text-secondary leading-relaxed">{step.requirements.influence}</p>
                            </div>
                          </div>

                          {/* Key Blockers to Overcome */}
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-xs">
                            <span className="font-black text-amber-400 flex items-center gap-1.5">
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

                {/* 5. WHAT SHOULD I DO NEXT? (ACTION STEPS & STEPPING STONES) */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
                  <div className="border-b border-border pb-3">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                      Question 5 of 5
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-blue-400" />
                      What should I do next? (Action Steps &amp; Stepping Stones)
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Immediate tactical actions for your current college semester plus high-probability stepping stone companies.
                    </p>
                  </div>

                  {/* Immediate Semester Action Plan */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-2.5 text-xs">
                    <span className="font-black text-blue-300 flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Your Recommended Tactical Next Steps
                    </span>
                    <div className="grid sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                        <span className="font-bold text-foreground block text-xs">1. Immediate Target</span>
                        <p className="text-secondary text-[11px] leading-relaxed">
                          {studentResult.eligibilityWindows?.recommendedFocus || 'Strengthen Data Structures and core Computer Science fundamentals for campus placement rounds.'}
                        </p>
                      </div>
                      <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                        <span className="font-bold text-foreground block text-xs">2. Drive Preparation</span>
                        <p className="text-secondary text-[11px] leading-relaxed">
                          Prepare for {studentResult.entryRoutes[0]?.name || 'campus online assessments'} with target company question patterns and mock coding tests.
                        </p>
                      </div>
                      <div className="bg-surface p-3 rounded-lg border border-border space-y-1">
                        <span className="font-bold text-foreground block text-xs">3. Resume &amp; Portfolio</span>
                        <p className="text-secondary text-[11px] leading-relaxed">
                          Build 2 production-grade full-stack / backend projects showcasing concurrency, clean architecture, and deployment evidence.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alternate Stepping Stones */}
                  {studentResult.alternateSteppingStones.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-foreground uppercase tracking-wider">
                          Stepping-Stone Backup Offers ({studentResult.alternateSteppingStones.length})
                        </span>
                        <span className="text-[11px] text-muted">
                          Alternative routes into {studentResult.dreamCompany.name}
                        </span>
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
              </div>
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

                {/* Additional Settings */}
                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                  <div>
                    <div className="h-5 flex items-center mb-1.5">
                      <label className="text-xs font-black text-foreground">Performance Rating</label>
                    </div>
                    <select
                      value={profPerformance}
                      onChange={(e) => setProfPerformance(e.target.value as PerformanceBracket)}
                      className="w-full min-h-[44px] h-[44px] bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="MEETS">Meets Expectations (Median)</option>
                      <option value="EXCEEDS">Exceeds Expectations (~p25)</option>
                      <option value="CONSISTENTLY_EXCEEDS">Consistently Exceeds (Top 10%)</option>
                    </select>
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

            {/* Professional Loading Skeleton (Stage 5) */}
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
                MODE B: WORKING PROFESSIONAL RESULTS DISPLAY (Stage 5)
                ───────────────────────────────────────────────────────── */}
            {simulatorMode === 'professional' && profResult && !isCalculating && (
              <div ref={profResultSectionRef} className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setProfResult(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-surface border border-border text-foreground hover:bg-surface-2 transition-all cursor-pointer shadow-xs min-h-[44px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Start Over / Reconfigure
                  </button>

                  <div className="text-right">
                    <span className="text-xs text-muted font-bold">
                      {profResult.sourceLevel.companyId.toUpperCase()} &rarr; {profResult.targetLevel.companyId.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Primary Heading with tabIndex={-1} for accessibility focus */}
                <h2
                  ref={profHeadingRef}
                  tabIndex={-1}
                  className="text-xl sm:text-2xl font-black text-foreground outline-none flex items-center gap-2.5 tracking-tight"
                >
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Your Level-Up &amp; Switch Plan
                </h2>

                {/* 1. WHERE CAN I REACH? */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                        Question 1 of 4
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        Where can I reach? (Target Level &amp; Switch Plan)
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                      {profResult.probability.percentage}% Success Probability
                    </span>
                  </div>

                  {/* Top Metrics Cards */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Target Transition</span>
                      <span className="text-xl font-black text-foreground block mt-1">
                        {profResult.sourceLevel.levelCode} &rarr; {profResult.targetLevel.levelCode}
                      </span>
                      <span className="text-xs text-secondary mt-1 block">
                        {profResult.sourceLevel.companyId.toUpperCase()} to {profResult.targetLevel.companyId.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Estimated Total Time</span>
                      <span className="text-2xl font-black text-foreground block mt-1">
                        {profResult.totalTime.likely} Years
                      </span>
                      <span className="text-xs text-muted mt-1 block">
                        Range: {profResult.totalTime.min}–{profResult.totalTime.max} yrs
                      </span>
                    </div>

                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Success Probability</span>
                      <span className="text-2xl font-black text-primary block mt-1">
                        {profResult.probability.percentage}%
                      </span>
                      <span className="text-xs text-muted mt-1 block">
                        Adjusted for {profPerformance} rating
                      </span>
                    </div>
                  </div>

                  {/* Expandable Probability Calculation Formula */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {showFormulaDetails ? 'Hide Probability Model Details' : 'View Probability Model & Stall Rates'}
                    </button>

                    {showFormulaDetails && (
                      <div className="mt-3 bg-surface-2/40 rounded-xl p-4 border border-border text-xs space-y-2">
                        <span className="font-black text-foreground block">Mathematical Probability Model</span>
                        <p className="text-secondary leading-relaxed">
                          {profResult.probability.formulaExplanation}
                        </p>
                        <div className="grid sm:grid-cols-3 gap-2 pt-1">
                          {profResult.probability.levelStallRates.map((sr, idx) => (
                            <div key={idx} className="p-2.5 bg-surface rounded-lg border border-border">
                              <span className="font-bold text-foreground block">{sr.companyId.toUpperCase()} • {sr.levelCode}</span>
                              <span className="text-muted text-[10px]">Empirical Stall Rate: {sr.stallRate}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. WHAT WILL I EARN? */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
                  <div className="border-b border-border pb-3">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                      Question 2 of 4
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      What will I earn? (Projected Compensation Jump &amp; Trajectory)
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Real level compensation bands in INR from current level to target level.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Projected Annual Comp Jump</span>
                      <span className="text-2xl font-black text-emerald-400 block mt-1">
                        +{formatINR(profResult.compJump.diff)} ({profResult.compJump.percentage > 0 ? `+${profResult.compJump.percentage}%` : '0%'})
                      </span>
                      <span className="text-xs text-muted mt-1 block">
                        {formatINR(profResult.compJump.from)} &rarr; {formatINR(profResult.compJump.to)}
                      </span>
                    </div>

                    <div className="bg-surface-2/40 rounded-xl p-4 border border-border">
                      <span className="text-xs font-bold text-muted uppercase">Target Level Total Annual CTC</span>
                      <span className="text-2xl font-black text-white block mt-1">
                        {formatINR(profResult.targetLevel.comp.total.p50)}
                      </span>
                      <span className="text-xs text-secondary mt-1 block">
                        Median verified compensation for {profResult.targetLevel.companyId.toUpperCase()} {profResult.targetLevel.levelCode}
                      </span>
                    </div>
                  </div>

                  {/* Rebuilt Compensation Trajectory Chart */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">
                        Projected Compensation Trajectory (Per Year in INR)
                      </span>
                      <span className="text-[11px] text-muted">
                        Year 0 to Target Level
                      </span>
                    </div>

                    <div
                      role="img"
                      aria-label={`Projected compensation trajectory from ${formatINR(profResult.compTimeline[0]?.salary || 0)} to ${formatINR(profResult.compTimeline[profResult.compTimeline.length - 1]?.salary || 0)} over ${profResult.totalTime.likely} years.`}
                      className="h-72 w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={profResult.compTimeline} margin={{ top: 12, right: 24, left: 10, bottom: 26 }}>
                          <defs>
                            <linearGradient id="emeraldGradientProf" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="year"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            tick={renderCompTimelineTick(profResult.compTimeline)}
                            interval={0}
                          />
                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            tickFormatter={formatChartINRTick}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-neutral-900 border border-neutral-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1 backdrop-blur-md">
                                    <p className="font-black text-white">{data.year} • {data.companyName} ({data.levelCode})</p>
                                    <p className="text-emerald-400 font-extrabold text-sm">
                                      Total Annual CTC: {formatINR(data.salary)}
                                    </p>
                                    <div className="text-[10px] text-neutral-400 space-y-0.5 pt-1 border-t border-neutral-800">
                                      <p>Fixed Base: {formatINR(data.base)}</p>
                                      <p>Annual Stock: {formatINR(data.stock)}</p>
                                      <p>Yearly Bonus: {formatINR(data.bonus)}</p>
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
                            fill="url(#emeraldGradientProf)"
                            dot={{ r: 4, fill: '#10b981', stroke: 'rgba(16, 185, 129, 0.4)', strokeWidth: 4 }}
                            activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                            isAnimationActive={!prefersReducedMotion}
                            animationDuration={800}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Accessible hidden data table */}
                    <div className="sr-only">
                      <table>
                        <caption>Projected Professional Career Compensation Timeline</caption>
                        <thead>
                          <tr>
                            <th scope="col">Year</th>
                            <th scope="col">Company</th>
                            <th scope="col">Level</th>
                            <th scope="col">Total Annual CTC</th>
                            <th scope="col">Base Pay</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profResult.compTimeline.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.year}</td>
                              <td>{item.companyName}</td>
                              <td>{item.levelCode}</td>
                              <td>{formatINR(item.salary)}</td>
                              <td>{formatINR(item.base)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 3. WHEN WILL IT HAPPEN? */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-6">
                  <div className="border-b border-border pb-3">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                      Question 3 of 4
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      When will it happen? (Promotion Plan Timeline)
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Progression milestones based on verified company ladder data and calibration cycles.
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
                            <span className="font-extrabold text-foreground block">Leadership &amp; Mentorship</span>
                            <p className="text-secondary leading-relaxed">{step.requirements.influence}</p>
                          </div>
                        </div>

                        {/* Blockers on this step */}
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2 text-xs">
                          <span className="font-black text-amber-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Promotion Blockers to Address ({step.blockers.length} Documented)
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

                {/* 4. WHAT SHOULD I DO NEXT? */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm space-y-5">
                  <div className="border-b border-border pb-3">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                      Question 4 of 4
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      What should I do next? (Action Steps &amp; Promo Packet Evidence)
                    </h3>
                    <p className="text-xs text-secondary mt-0.5">
                      Concrete steps to assemble evidence for your promotion packet or target interview loops.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 bg-surface-2/40 rounded-xl border border-border space-y-2">
                      <span className="font-black text-foreground block text-sm">1. Scope Expansion</span>
                      <p className="text-secondary leading-relaxed">
                        Anchor ownership over a multi-team project or critical architectural subsystem required for {profResult.targetLevel.levelCode}.
                      </p>
                    </div>

                    <div className="p-4 bg-surface-2/40 rounded-xl border border-border space-y-2">
                      <span className="font-black text-foreground block text-sm">2. Quantified Evidence</span>
                      <p className="text-secondary leading-relaxed">
                        Document business impact metrics (latency reduction, revenue enablement, incident reduction) in your brag document.
                      </p>
                    </div>

                    <div className="p-4 bg-surface-2/40 rounded-xl border border-border space-y-2">
                      <span className="font-black text-foreground block text-sm">3. Calibration Alignment</span>
                      <p className="text-secondary leading-relaxed">
                        Align with your manager 6 months before the cycle window on explicit promotion criteria and peer feedback nominations.
                      </p>
                    </div>
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
