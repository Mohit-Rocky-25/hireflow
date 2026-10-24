// ============================================================
// HIREFLOW CAREER PATH — STUDENT PLACEMENT PATHWAY
// Mode C: Fresher / Campus Entry Programs View
// Mode A: Campus-to-Dream Roadmap Form & Detailed Results
// ============================================================

import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from '../../../components/career-path/Dropdown';
import {
  DEGREE_BRANCH_CATALOG,
  type DegreeBranchOption,
} from '../../../data/careerLadders/degreesAndBranches';
import {
  getGraduationYearOptions,
  snapToNearestGradYear,
  calculateYearOfStudy,
} from '../../../lib/academicCalendar';
import {
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Search,
  Sparkles,
  Award,
  Compass,
  X,
  GraduationCap,
  CheckCircle2,
  Target,
  FileText,
} from 'lucide-react';
import {
  getAllCompanies,
  getLevelsForCompanyAndTrack,
  searchLevels,
  getFuzzySuggestion,
  getLevel,
  getEquivalenceHumanLabel,
} from '../../../data/careerLadders';
import type { CareerTrack } from '../../../data/careerLadders/types';
import {
  resolveStudentPath,
  formatINR,
  formatINRRange,
  type StudentProfile,
  type StudentPromotionPlan,
} from '../../../lib/careerEngine';
import { useAtsToolStore } from '../../../store/tools/atsStore';
import { careers, DataBadge } from '../../../careers-core';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
import { CompensationTrajectoryChart } from './CompensationTrajectoryChart';
import { PromotionBlockersChecklist } from './PromotionBlockersChecklist';

export function SkillsToClosePanel() {
  const latestMissingSkills = useAtsToolStore((s) => s.latestMissingSkills);

  if (!latestMissingSkills || latestMissingSkills.length === 0) {
    return (
      <div className="shiny-edge-card bg-near-black rounded-xl p-6 sm:p-8 border border-charcoal space-y-4">
        <div className="flex items-center gap-2.5">
          <Target className="w-5 h-5 text-volt" />
          <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
            Skills to Close (Target Career Alignment)
          </h3>
        </div>
        <div className="bg-black/80 border border-charcoal rounded-lg p-5 text-xs space-y-3">
          <p className="text-silver text-sm leading-relaxed">
            No recent resume scan found. Run a scan in ATS Resume Roaster or Tailor My Resume to detect skill gaps for your target path and see your targeted skills to close.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/tools/resume-checker"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-volt text-black text-xs font-mono font-black uppercase tracking-wider hover:bg-[#1d1d1d] hover:!text-white transition-colors cursor-pointer select-none"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Run ATS Resume Scan
            </Link>
            <Link
              to="/tools/tailor"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-near-black border border-charcoal text-white hover:text-volt hover:border-volt/60 text-xs font-mono font-bold transition-colors cursor-pointer select-none"
            >
              <FileText className="w-3.5 h-3.5" />
              Open Tailor My Resume
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shiny-edge-card bg-near-black rounded-xl p-6 sm:p-8 border border-charcoal space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-charcoal">
        <div>
          <span className="text-[10px] font-black uppercase text-volt font-mono tracking-wider">
            Target Growth Pathway
          </span>
          <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-volt" />
            Skills to Close ({latestMissingSkills.length} Detected Gap{latestMissingSkills.length > 1 ? 's' : ''})
          </h3>
          <p className="text-xs sm:text-sm text-silver mt-1">
            Identified from your latest resume scan. Closing these gaps accelerates entry readiness and Year 1–2 milestone achievement.
          </p>
        </div>
        <Link
          to="/tools/resume-checker"
          className="text-xs font-mono font-bold text-volt hover:underline flex items-center gap-1.5"
        >
          Re-scan resume <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestMissingSkills.map((skill, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-charcoal bg-black/80 space-y-2.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-black text-white text-sm">{skill}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Target Gap
                </span>
              </div>
              <p className="text-[12px] text-silver leading-relaxed">
                Required for technical screening rounds and Year 1–2 delivery milestones on this path.
              </p>
            </div>
            <div className="pt-2.5 border-t border-charcoal flex items-center justify-between text-xs">
              <Link
                to={`/tools/briefs?skill=${encodeURIComponent(skill)}`}
                className="font-mono font-bold text-volt hover:underline flex items-center gap-1"
              >
                Find Practice Brief &rarr;
              </Link>
              <Link
                to={`/tools/credentials?search=${encodeURIComponent(skill)}`}
                className="text-silver hover:text-white font-semibold font-mono"
              >
                Certifications
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface StudentPlacementPathwayProps {
  mode: 'student' | 'fresher-programs';
  prefersReducedMotion?: boolean;
}

export function StudentPlacementPathway({
  mode,
  prefersReducedMotion = false,
}: StudentPlacementPathwayProps) {
  // Shared Branch selection
  const [selectedBranchOption, setSelectedBranchOption] = useState<DegreeBranchOption>(
    DEGREE_BRANCH_CATALOG[0]
  );

  // Mode C (Fresher Programs) State
  const [campusCategoryFilter, setCampusCategoryFilter] = useState<'all' | 'super-dream' | 'dream' | 'mass'>('all');
  const [campusProgramSearch, setCampusProgramSearch] = useState('');

  // Mode A (Student Roadmap) State
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
  const [isCalculating, setIsCalculating] = useState(false);

  // Scroll & Focus refs
  const studentResultSectionRef = useRef<HTMLDivElement>(null);
  const studentHeadingRef = useRef<HTMLHeadingElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (studentSearchRef.current && !studentSearchRef.current.contains(e.target as Node)) {
        setIsStudentSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Date-driven graduation year options
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

  const studentMatches = useMemo(() => searchLevels(studentSearchQuery), [studentSearchQuery]);
  const studentFuzzySuggestion = useMemo(() => getFuzzySuggestion(studentSearchQuery), [studentSearchQuery]);
  const studentDreamLevels = useMemo(() => getLevelsForCompanyAndTrack(studentDreamCompanyId, studentTrack), [studentDreamCompanyId, studentTrack]);
  const currentStudentDreamLevel = useMemo(() => getLevel(studentDreamCompanyId, studentDreamLevelCode, studentTrack), [studentDreamCompanyId, studentDreamLevelCode, studentTrack]);

  const handleSelectStudentDream = (companyId: string, levelCode: string, track: CareerTrack) => {
    setStudentDreamCompanyId(companyId);
    setStudentDreamLevelCode(levelCode);
    setStudentTrack(track);
    setStudentSearchQuery('');
    setIsStudentSearchOpen(false);
  };

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

  return (
    <>
      {/* ─────────────────────────────────────────────────────────
          MODE C: FRESHER / CAMPUS ENTRY PROGRAMS VIEW
          ───────────────────────────────────────────────────────── */}
      {mode === 'fresher-programs' && (
        <div className="space-y-6">
          {/* Branch Selection & Filter Header */}
          <div className="shiny-edge-card bg-near-black rounded-xl p-6 sm:p-8 border border-charcoal space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-charcoal">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-volt/15 text-volt border border-volt/40">
                    2026-27 Hiring Season Live
                  </span>
                  <span className="text-xs text-silver font-mono font-bold">
                    {branchPrograms.length} Eligible Programs
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                  <Sparkles className="w-5 h-5 text-volt shrink-0" />
                  Verified Campus Entry Programs for Your Engineering Branch
                </h2>
                <p className="text-xs sm:text-sm text-silver mt-1 leading-relaxed">
                  Authentic hiring criteria, first-round screening formats, bond commitments, and promotion steps across India employers.
                </p>
              </div>

              {/* Degree & Branch Dropdown */}
              <div className="w-full md:w-80 shrink-0">
                <label className="text-xs font-bold text-silver uppercase font-mono block mb-1.5">
                  Your Branch / Discipline:
                </label>
                <Dropdown
                  searchable={true}
                  value={selectedBranchOption.id}
                  onChange={(val) => {
                    const opt = DEGREE_BRANCH_CATALOG.find((d) => d.id === val);
                    if (opt) handleBranchChange(opt);
                  }}
                  options={DEGREE_BRANCH_CATALOG.map((item) => ({
                    value: item.id,
                    label: item.branchName,
                    sublabel: `${item.familyLabel} • ${item.degreeName} (${item.programLength} Years)`,
                    category: item.degreeGroup,
                  }))}
                  placeholder="Select branch..."
                />
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono uppercase font-bold text-silver mr-1">Category:</span>
                {(['all', 'super-dream', 'dream', 'mass'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCampusCategoryFilter(cat)}
                    className={`px-4 py-2 rounded text-xs font-mono font-bold transition-all uppercase cursor-pointer select-none ${
                      campusCategoryFilter === cat
                        ? 'bg-volt !text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] font-black'
                        : 'bg-black text-silver border border-charcoal hover:text-white hover:border-volt/60'
                    }`}
                  >
                    {cat === 'all' ? `All (${branchPrograms.length})` : cat.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-silver absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={campusProgramSearch}
                  onChange={(e) => setCampusProgramSearch(e.target.value)}
                  placeholder="Search company, role, program..."
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-black border border-charcoal text-sm text-white placeholder:text-silver/60 focus:outline-none focus:ring-1 focus:ring-volt focus:border-volt"
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
                  className="shiny-edge-card bg-near-black rounded-xl p-6 border border-charcoal hover:border-volt/60 transition-all flex flex-col justify-between gap-5 shadow-level-2 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <CompanyLogo company={comp || prog.companyId} size="xs" />
                          <span className="font-bold text-white text-base group-hover:text-volt transition-colors">
                            {comp?.name || prog.companyId}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-volt/15 text-volt border border-volt/40 uppercase">
                            {prog.campusCategory.replace('-', ' ')}
                          </span>
                          <DataBadge entity={prog} />
                        </div>
                        <h3 className="text-[16px] font-bold text-white tracking-tight">
                          {prog.programName}
                        </h3>
                        <p className="text-xs text-silver font-medium mt-0.5">
                          {prog.roleTitle} · {prog.roleFamily}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-black text-volt block leading-tight">
                          {ctcStr}
                        </span>
                        <span className="text-[10px] text-silver font-mono uppercase tracking-wider">
                          Total CTC
                        </span>
                      </div>
                    </div>

                    {/* Key Criteria Pill Bar */}
                    <div className="grid grid-cols-3 gap-2.5 text-xs py-1">
                      <div className="p-2.5 rounded-lg bg-black border border-charcoal">
                        <span className="text-[10px] text-silver font-mono font-bold uppercase tracking-wider block mb-1">
                          Cutoff
                        </span>
                        <span className="font-bold text-white text-[12px] block">
                          {prog.eligibility.minCgpa ? `≥ ${prog.eligibility.minCgpa} CGPA` : 'No hard cutoff'}
                        </span>
                        <div className="text-[10px] text-silver truncate mt-1 font-mono">
                          {prog.eligibility.backlogPolicy || '0 backlogs'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black border border-charcoal">
                        <span className="text-[10px] text-silver font-mono font-bold uppercase tracking-wider block mb-1">
                          Training &amp; Bond
                        </span>
                        <span className="font-bold text-white text-[12px] block">
                          {prog.training.bondMonths ? `${prog.training.bondMonths} mo bond` : 'Zero service bond'}
                        </span>
                        <div className="text-[10px] text-silver truncate mt-1 font-mono">
                          {prog.training.bondAmountINR ? `₹${(prog.training.bondAmountINR / 100000).toFixed(1)}L bond` : 'No penalty'}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black border border-charcoal">
                        <span className="text-[10px] text-silver font-mono font-bold uppercase tracking-wider block mb-1">
                          Next Promotion
                        </span>
                        <span className="font-bold text-white text-[12px] truncate block font-mono">
                          {prog.trajectory[0] ? `${prog.trajectory[0].fromLevelCode} → ${prog.trajectory[0].toLevelCode}` : 'Fast-Track'}
                        </span>
                        <div className="text-[10px] text-volt truncate mt-1 font-mono font-bold">
                          {prog.trajectory[0]?.typicalYearsMin ? `${prog.trajectory[0].typicalYearsMin}-${prog.trajectory[0].typicalYearsMax} yrs` : 'Standard cadence'}
                        </div>
                      </div>
                    </div>

                    {/* Selection Stages Funnel */}
                    <div className="pt-3 border-t border-charcoal">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-silver block mb-2">
                        Selection Stages ({prog.selectionProcess.length} Rounds):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {prog.selectionProcess.map((stage, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black border border-charcoal text-[11px] text-white"
                          >
                            <span className="font-mono text-[10px] text-volt font-bold">
                              {idx + 1}.
                            </span>
                            <span className="font-semibold text-white">{stage.stage}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Competency badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-mono font-bold text-silver uppercase mr-1">
                        Evaluated:
                      </span>
                      {Object.keys(prog.competencyProfile).map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black text-silver border border-charcoal uppercase"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3.5 border-t border-charcoal flex items-center justify-between gap-3">
                    <Link
                      to={`/tools/resume-checker?company=${prog.companyId}&role=${encodeURIComponent(prog.roleTitle)}&program=${encodeURIComponent(prog.id)}`}
                      className="px-4 py-2 rounded bg-volt hover:bg-[#1d1d1d] active:shadow-inset !text-black hover:!text-white text-xs font-mono font-black uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 group/btn cursor-pointer select-none"
                    >
                      <FileText className="w-3.5 h-3.5 stroke-[2px] !text-black group-hover/btn:!text-white" />
                      <span className="!text-black group-hover/btn:!text-white font-black">Roast Resume Against Program</span>
                    </Link>

                    <Link
                      to={`/demo/company/${prog.companyId}`}
                      className="text-xs font-mono font-bold text-silver hover:text-volt transition-colors flex items-center gap-1"
                    >
                      Company Roles &amp; Fit →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBranchPrograms.length === 0 && (
            <div className="p-12 text-center bg-surface border border-border rounded-md space-y-3">
              <p className="text-sm font-bold text-foreground">
                No campus programs found matching &ldquo;{campusProgramSearch}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => {
                  setCampusProgramSearch('');
                  setCampusCategoryFilter('all');
                }}
                className="text-xs font-mono font-bold text-volt hover:underline cursor-pointer"
              >
                Clear search and category filters
              </button>
            </div>
          )}

          {/* Skills to Close for Fresher Programs */}
          <SkillsToClosePanel />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          MODE A: STUDENT SIMULATOR FORM
          ───────────────────────────────────────────────────────── */}
      {mode === 'student' && !studentResult && (
        <div className="shiny-edge-card bg-near-black rounded-xl p-8 sm:p-10 border border-charcoal max-w-5xl md:max-w-6xl mx-auto space-y-8">
          <div className="border-b border-charcoal pb-5">
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-volt shrink-0" /> Configure Your Campus-to-Dream Job Roadmap
            </h2>
            <p className="text-sm sm:text-base text-silver mt-2 leading-relaxed">
              Select your college background and dream company to see real campus hiring routes, eligibility cutoffs, fresher CTC packages in INR, and the multi-year path to reach your dream level.
            </p>
          </div>

          {/* College Profile Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* College Tier */}
            <div>
              <div className="h-6 flex items-center mb-2">
                <label className="text-sm font-bold text-white uppercase font-mono">College Tier</label>
              </div>
              <Dropdown
                value={studentTier}
                onChange={(val) => setStudentTier(val as StudentProfile['collegeTier'])}
                options={[
                  { value: 'Tier 1', label: 'Tier 1 (IIT, NIT, IIIT, BITS)', sublabel: 'Direct Day 1 & Day 2 slotting' },
                  { value: 'Tier 2', label: 'Tier 2 (VIT, Manipal, Thapar, RVCE, etc.)', sublabel: 'National product drive cutoffs' },
                  { value: 'Tier 3', label: 'Tier 3 (State / Private Colleges)', sublabel: 'Mass campus + off-campus challenges' },
                  { value: 'Other', label: 'Other University', sublabel: 'Autonomous / distance / non-traditional' },
                ]}
              />
              <div className="h-7 flex items-center gap-2 mt-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-volt/10 text-volt border border-volt/30">
                  {studentTier}
                </span>
                <span className="text-xs text-muted font-medium">Campus hiring pool</span>
              </div>
            </div>

            {/* Degree & Branch Dropdown */}
            <div>
              <div className="h-6 flex items-center mb-2">
                <label className="text-sm font-bold text-foreground uppercase font-mono">Degree &amp; Branch</label>
              </div>
              <Dropdown
                searchable={true}
                value={selectedBranchOption.id}
                onChange={(val) => {
                  const opt = DEGREE_BRANCH_CATALOG.find((d) => d.id === val);
                  if (opt) handleBranchChange(opt);
                }}
                options={DEGREE_BRANCH_CATALOG.map((item) => ({
                  value: item.id,
                  label: item.branchName,
                  sublabel: `${item.familyLabel} • ${item.degreeName} (${item.programLength} Years)`,
                  category: item.degreeGroup,
                }))}
                placeholder="Select Degree & Branch"
              />
              <div className="h-7 flex items-center gap-2 mt-2">
                {selectedBranchOption && (
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-volt/10 text-volt border border-volt/30 truncate max-w-[200px]">
                    {selectedBranchOption.familyLabel}
                  </span>
                )}
                <span className="text-xs text-muted font-medium truncate">Specialization</span>
              </div>
            </div>

            {/* Current Year & Expected Grad Year */}
            <div>
              <div className="h-6 flex items-center mb-2">
                <label className="text-sm font-bold text-foreground uppercase font-mono">Graduation Year</label>
              </div>
              <Dropdown
                value={studentGradYear}
                onChange={(val) => setStudentGradYear(parseInt(String(val), 10))}
                options={gradYearOptions.map((opt) => ({
                  value: opt.gradYear,
                  label: opt.label,
                  sublabel: opt.shortLabel,
                }))}
              />
              <div className="h-7 flex items-center gap-2 mt-2">
                {selectedGradYearOption && (
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-volt/10 text-volt border border-volt/30">
                    {selectedGradYearOption.shortLabel}
                  </span>
                )}
                <span className="text-xs text-muted font-medium truncate">{selectedGradYearOption?.label || 'Target batch'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* CGPA Bracket */}
            <div>
              <div className="h-6 flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-foreground uppercase font-mono">CGPA Bracket</label>
              </div>
              <Dropdown
                value={studentCgpa}
                onChange={(val) => setStudentCgpa(val as StudentProfile['cgpaBracket'])}
                options={[
                  { value: 'above_8', label: 'Above 8.0 CGPA', sublabel: 'Eligible for all drives' },
                  { value: '7_to_8', label: '7.0 to 8.0 CGPA', sublabel: 'Meets most cutoffs' },
                  { value: '6_to_7', label: '6.0 to 7.0 CGPA', sublabel: 'Eligible for select drives' },
                  { value: 'below_6', label: 'Below 6.0 CGPA', sublabel: 'Requires hackathons/off-campus' },
                ]}
              />
            </div>

            {/* Internship Status */}
            <div>
              <div className="h-6 flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-foreground uppercase font-mono">Internship Status</label>
              </div>
              <Dropdown
                value={studentInternship}
                onChange={(val) => setStudentInternship(val as StudentProfile['internshipStatus'])}
                options={[
                  { value: 'none', label: 'No Internship Yet', sublabel: 'Focus on projects & DSA portfolio' },
                  { value: 'completed', label: 'Completed Summer Internship', sublabel: 'Verified industry experience' },
                  { value: 'ppo', label: 'Have Pre-Placement Offer (PPO)', sublabel: 'Targeting upgrade or dream tier' },
                ]}
              />
            </div>
          </div>

          {/* Dream Company & Target Role Selection */}
          <div className="p-6 sm:p-7 rounded bg-surface-2/40 border border-border space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-black text-foreground uppercase font-mono tracking-wider flex items-center gap-2">
                <Target className="w-5 h-5 text-volt" /> Target Dream Company &amp; Level
              </label>
              {currentStudentDreamLevel && (
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-volt/10 text-volt border border-volt/30">
                  {currentStudentDreamLevel.levelCode} • {getEquivalenceHumanLabel(currentStudentDreamLevel.equivalenceGroup)}
                </span>
              )}
            </div>

            {/* Single Searchable Autocomplete for Dream Company */}
            <div className="relative" ref={studentSearchRef}>
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-muted absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => {
                    setStudentSearchQuery(e.target.value);
                    setIsStudentSearchOpen(true);
                  }}
                  onFocus={() => setIsStudentSearchOpen(true)}
                  placeholder="Search dream role e.g. 'Google L5', 'Flipkart SDE-2', 'Amazon SDE III'..."
                  className="w-full min-h-[52px] h-[52px] bg-surface border border-border focus:border-volt rounded pl-12 pr-10 py-3 text-sm font-semibold text-foreground placeholder:text-muted focus:ring-1 focus:ring-volt outline-none"
                />
                {studentSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSearchQuery('');
                      setIsStudentSearchOpen(false);
                    }}
                    className="absolute right-3.5 p-1 text-muted hover:text-foreground rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isStudentSearchOpen && (
                <div className="absolute z-30 left-0 right-0 mt-2 bg-surface border border-border rounded shadow-2xl max-h-64 overflow-y-auto divide-y divide-border">
                  {studentMatches.length > 0 ? (
                    studentMatches.map((m) => (
                      <div
                        key={`${m.company.id}-${m.level.levelCode}-${m.level.track}`}
                        onClick={() => handleSelectStudentDream(m.company.id, m.level.levelCode, m.level.track)}
                        className="p-3.5 hover:bg-surface-2 cursor-pointer flex items-center justify-between text-sm transition-colors"
                      >
                        <div>
                          <span className="font-black text-foreground">{m.company.name}</span>
                          <span className="text-secondary ml-2 font-medium">{m.level.title}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-surface-2 text-xs font-mono font-black text-volt border border-border">
                          {m.level.levelCode}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm space-y-2">
                      <p className="text-muted">No exact ladder node matched &ldquo;{studentSearchQuery}&rdquo;.</p>
                      {studentFuzzySuggestion && (
                        <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-sm">
                          <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                            <Sparkles className="w-4 h-4" /> Did you mean?
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-foreground">{studentFuzzySuggestion.label}</span>
                            <button
                              type="button"
                              onClick={() => handleSelectStudentDream(
                                studentFuzzySuggestion.company.id,
                                studentFuzzySuggestion.level.levelCode,
                                studentFuzzySuggestion.level.track
                              )}
                              className="px-3 py-1.5 rounded bg-volt text-black font-black uppercase font-mono text-xs hover:bg-volt-hover shrink-0 cursor-pointer"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-border">
              <div>
                <span className="text-xs font-bold text-muted uppercase font-mono tracking-wide block mb-2">Dream Company</span>
                <Dropdown
                  searchable={true}
                  value={studentDreamCompanyId}
                  onChange={(val) => {
                    setStudentDreamCompanyId(val);
                    const firstLvl = getLevelsForCompanyAndTrack(val, studentTrack)[0];
                    if (firstLvl) setStudentDreamLevelCode(firstLvl.levelCode);
                  }}
                  options={getAllCompanies().map((c) => ({
                    value: c.id,
                    label: c.name,
                    sublabel: `${c.marketSegment} • India Engineering Hub`,
                    category: c.marketSegment,
                  }))}
                  placeholder="Select dream company..."
                />
              </div>

              <div>
                <span className="text-xs font-bold text-muted uppercase font-mono tracking-wide block mb-2">Dream Target Level</span>
                <Dropdown
                  searchable={true}
                  value={studentDreamLevelCode}
                  onChange={(val) => setStudentDreamLevelCode(val)}
                  options={studentDreamLevels.map((l) => ({
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

          {/* Calculate Roadmap Button */}
          <button
            type="button"
            onClick={handleSimulateStudent}
            disabled={isCalculating}
            className="w-full h-[54px] py-3.5 rounded bg-volt hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] text-black font-black uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isCalculating ? (
              <span className="flex items-center gap-2.5 font-mono text-sm">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Computing Campus-to-Career Roadmap...
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Build my roadmap
              </>
            )}
          </button>
        </div>
      )}

      {/* Skeleton while calculating */}
      {isCalculating && mode === 'student' && (
        <div className="bg-surface rounded-md p-8 border border-border max-w-4xl mx-auto space-y-6 min-h-[380px] animate-pulse">
          <div className="h-6 bg-surface-2 rounded w-1/3 mb-4" />
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="h-28 bg-surface-2 rounded" />
            <div className="h-28 bg-surface-2 rounded" />
            <div className="h-28 bg-surface-2 rounded" />
          </div>
          <div className="h-44 bg-surface-2 rounded mt-4" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          STUDENT ROADMAP RESULTS DISPLAY
          ───────────────────────────────────────────────────────── */}
      {mode === 'student' && studentResult && !isCalculating && (
        <div ref={studentResultSectionRef} className="max-w-5xl md:max-w-6xl mx-auto space-y-8 animate-fade-in">
          {/* Result Top Action Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStudentResult(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold bg-surface border border-border text-foreground hover:bg-surface-2 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" /> Start Over / Edit Profile
            </button>

            <div className="text-right">
              <span className="text-xs text-muted font-mono font-bold">
                {studentResult.studentProfile.collegeTier} • {studentResult.studentProfile.currentYearOfStudy} (Class of {studentResult.studentProfile.expectedGraduationYear})
              </span>
            </div>
          </div>

          {/* Primary Heading with tabIndex={-1} for keyboard focus */}
          <h2
            ref={studentHeadingRef}
            tabIndex={-1}
            className="text-2xl sm:text-3xl font-black text-foreground outline-none flex items-center gap-3 tracking-tight"
          >
            <Target className="w-7 h-7 text-volt" />
            Your Campus-to-Offer Roadmap
          </h2>

          {/* 1. CAN I GET IN? (ELIGIBILITY & CUTOFFS) */}
          <div className="bg-surface rounded-md p-7 sm:p-8 border border-border space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs font-mono font-black uppercase text-volt tracking-wider">
                  Question 1 of 5
                </span>
                <h3 className="text-lg sm:text-xl font-black text-foreground mt-1 flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-volt" />
                  Can I get in? (Eligibility &amp; Cutoffs)
                </h3>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-black bg-volt/10 text-volt border border-volt/30">
                {studentResult.probability.percentage}% Target Success Probability
              </span>
            </div>

            {/* Trajectory Scope */}
            <div className="p-4 rounded bg-surface-2/60 border border-border flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-muted font-mono font-bold uppercase block">Target Pathway</span>
                <p className="text-base font-black text-foreground mt-0.5">
                  Campus Entry at {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode}) &rarr; Target Level {studentResult.targetLevel.levelCode} ({studentResult.targetLevel.title})
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-secondary">
                {studentResult.studentProfile.collegeTier} • {studentResult.studentProfile.degreeAndBranch}
              </span>
            </div>

            {/* Eligibility Windows & Date-Driven Status */}
            {studentResult.eligibilityWindows && (
              <div className="p-5 rounded bg-surface-2/40 border border-border space-y-2.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono font-black text-foreground flex items-center gap-2 text-base">
                    <GraduationCap className="w-5 h-5 text-volt" />
                    Academic Status: {studentResult.eligibilityWindows.currentStatus}
                  </span>
                  <span className="font-mono font-bold text-muted text-xs">
                    {studentResult.eligibilityWindows.remainingSemesters} Semesters Remaining
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pt-1 text-xs sm:text-sm">
                  <div>
                    <span className="font-mono font-bold text-muted block mb-0.5 uppercase text-[11px]">Internship Window:</span>
                    <span className="font-semibold text-foreground">{studentResult.eligibilityWindows.internshipWindow}</span>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-muted block mb-0.5 uppercase text-[11px]">Campus Placement Drive:</span>
                    <span className="font-semibold text-foreground">{studentResult.eligibilityWindows.campusPlacementWindow}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-secondary pt-2 border-t border-border">
                  <strong className="text-foreground font-mono">Recommended Focus:</strong> {studentResult.eligibilityWindows.recommendedFocus}
                </p>
              </div>
            )}

            {/* Academic & Cutoff Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pt-1">
              <div className="p-3.5 bg-surface-2/40 rounded border border-border">
                <span className="text-xs font-bold text-muted uppercase font-mono block">College Tier</span>
                <span className="text-base font-mono font-black text-foreground mt-1 block">{studentResult.studentProfile.collegeTier}</span>
                <span className="text-xs text-volt mt-1 block font-mono font-semibold">Campus hiring pool</span>
              </div>
              <div className="p-3.5 bg-surface-2/40 rounded border border-border">
                <span className="text-xs font-bold text-muted uppercase font-mono block">Branch Family</span>
                <span className="text-base font-mono font-black text-foreground mt-1 block truncate" title={studentResult.studentProfile.degreeAndBranch}>
                  {studentResult.studentProfile.branchFamily}
                </span>
                <span className="text-xs text-volt mt-1 block font-mono font-semibold">Degree eligible</span>
              </div>
              <div className="p-3.5 bg-surface-2/40 rounded border border-border">
                <span className="text-xs font-bold text-muted uppercase font-mono block">CGPA Cutoff Status</span>
                <span className="text-base font-mono font-black text-foreground mt-1 block">
                  {studentResult.studentProfile.cgpaBracket === 'above_8' ? '> 8.0 CGPA' : studentResult.studentProfile.cgpaBracket === '7_to_8' ? '7.0–8.0 CGPA' : studentResult.studentProfile.cgpaBracket === '6_to_7' ? '6.0–7.0 CGPA' : '< 6.0 CGPA'}
                </span>
                <span className="text-xs text-secondary mt-1 block font-medium">Meets prime cutoffs</span>
              </div>
              <div className="p-3.5 bg-surface-2/40 rounded border border-border">
                <span className="text-xs font-bold text-muted uppercase font-mono block">Internship Status</span>
                <span className="text-base font-mono font-black text-foreground mt-1 block capitalize">
                  {studentResult.studentProfile.internshipStatus === 'ppo' ? 'Have PPO' : studentResult.studentProfile.internshipStatus === 'completed' ? 'Completed' : 'None yet'}
                </span>
                <span className="text-xs text-secondary mt-1 block font-medium">Pre-placement track</span>
              </div>
            </div>
          </div>

          {/* 2. HOW DO I GET IN? (RANKED ENTRY ROUTES) */}
          <div className="bg-surface rounded-md p-7 sm:p-8 border border-border space-y-5">
            <div className="border-b border-border pb-4">
              <span className="text-xs font-mono font-black uppercase text-volt tracking-wider">
                Question 2 of 5
              </span>
              <h3 className="text-lg sm:text-xl font-black text-foreground mt-1 flex items-center gap-2.5">
                <Award className="w-6 h-6 text-volt" />
                How do I get in? (Ranked Entry Routes)
              </h3>
              <p className="text-sm text-secondary mt-1">
                Real documented hiring pipelines for campus candidates into {studentResult.dreamCompany.name} based on your college tier ({studentResult.studentProfile.collegeTier}).
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {studentResult.entryRoutes.map((route, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-surface-2/40 border border-border rounded p-5 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm sm:text-base font-black text-foreground">{route.name}</span>
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-mono font-black uppercase ${
                          route.adjustedLikelihood === 'High'
                            ? 'bg-volt/10 text-volt border border-volt/30'
                            : route.adjustedLikelihood === 'Medium'
                            ? 'bg-surface-2 text-muted border border-border'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        Likelihood: {route.adjustedLikelihood}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-muted leading-relaxed">{route.likelihoodReason}</p>

                    <div className="mt-2.5 pt-2.5 border-t border-border text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted font-bold font-mono uppercase">Typical CTC Offer:</span>
                        <span className="font-mono font-black text-volt">
                          {formatINR(route.expectedOfferINR)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted font-bold font-mono uppercase">Cutoff:</span>
                        <span className="font-semibold text-foreground font-mono">
                          {route.eligibility.cgpaMin}+ CGPA ({route.eligibility.allowedBranches[0]}...)
                        </span>
                      </div>
                    </div>

                    {/* Selection Rounds */}
                    <div className="mt-3 pt-2.5 border-t border-border">
                      <span className="text-[10px] font-mono font-black text-muted uppercase block mb-1">
                        Selection Rounds ({route.selectionRounds.length})
                      </span>
                      <ul className="space-y-1 text-[11px] text-secondary">
                        {route.selectionRounds.map((rnd, rndIdx) => (
                          <li key={rndIdx} className="flex items-start gap-1.5">
                            <span className="text-volt font-bold font-mono">{rndIdx + 1}.</span>
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
          <div className="bg-surface rounded-md p-6 border border-border space-y-5">
            <div className="border-b border-border pb-3">
              <span className="text-[10px] font-mono font-black uppercase text-volt tracking-wider">
                Question 3 of 5
              </span>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-volt" />
                What will I earn? (Fresher CTC in INR)
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Verified fresher entry package at {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode}) and multi-year trajectory to target level {studentResult.targetLevel.levelCode}.
              </p>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-surface-2/40 rounded p-4 border border-border">
                <span className="text-xs font-bold text-muted uppercase font-mono">Fresher Entry Offer</span>
                <span className="text-xl font-mono font-black text-volt block mt-1">
                  {formatINRRange(
                    studentResult.entryRoutes[0]?.expectedOfferINR || studentResult.entryLevel.comp.total.p25,
                    studentResult.entryLevel.comp.total.p75
                  )}
                </span>
                <span className="text-xs text-secondary mt-1 block">
                  At {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode})
                </span>
              </div>

              <div className="bg-surface-2/40 rounded p-4 border border-border">
                <span className="text-xs font-bold text-muted uppercase font-mono">Target Level Range</span>
                <span className="text-xl font-mono font-black text-foreground block mt-1">
                  {formatINRRange(studentResult.targetLevel.comp.total.p25, studentResult.targetLevel.comp.total.p75)}
                </span>
                <span className="text-xs text-secondary mt-1 block">
                  {studentResult.targetLevel.levelCode} • {studentResult.targetLevel.title}
                </span>
              </div>

              <div className="bg-surface-2/40 rounded p-4 border border-border">
                <span className="text-xs font-bold text-muted uppercase font-mono">Estimated Time</span>
                <span className="text-2xl font-mono font-black text-volt block mt-1">
                  {studentResult.totalTimeFromGraduation.likely} Years
                </span>
                <span className="text-xs text-muted mt-1 block font-mono">
                  Range: {studentResult.totalTimeFromGraduation.min}–{studentResult.totalTimeFromGraduation.max} yrs (By ~{studentResult.studentProfile.expectedGraduationYear + Math.round(studentResult.totalTimeFromGraduation.likely)})
                </span>
              </div>
            </div>

            {/* Rebuilt Compensation Trajectory Chart */}
            <div className="pt-2">
              <CompensationTrajectoryChart
                timeline={studentResult.compTimeline}
                title="Projected Compensation Trajectory (Per Year in INR)"
                subtitle={`Starting Class of ${studentResult.studentProfile.expectedGraduationYear}`}
                ariaLabel={`Projected compensation trajectory from ${formatINR(studentResult.compTimeline[0]?.salary || 0)} at campus entry to ${formatINR(studentResult.compTimeline[studentResult.compTimeline.length - 1]?.salary || 0)} at target level.`}
                tableCaption="Projected Campus-to-Career Compensation Timeline"
                gradientId="emeraldGradientStudent"
                prefersReducedMotion={prefersReducedMotion}
              />
            </div>
          </div>

          {/* 4. WHEN WILL IT HAPPEN? (CALENDAR TIMELINE) */}
          {studentResult.steps.length > 0 && (
            <div className="bg-surface rounded-md p-6 border border-border space-y-6">
              <div className="border-b border-border pb-3">
                <span className="text-[10px] font-mono font-black uppercase text-volt tracking-wider">
                  Question 4 of 5
                </span>
                <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-volt" />
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
                    className="p-5 rounded border border-border bg-surface-2/30 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-volt text-black text-xs font-mono font-black flex items-center justify-center">
                          {step.stepIndex}
                        </span>
                        <h4 className="text-sm font-black text-foreground">
                          {step.fromLevel.levelCode} ({step.fromLevel.title}) &rarr; {step.toLevel.levelCode} ({step.toLevel.title})
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-volt block">
                          {step.calendarYearWindow}
                        </span>
                        <span className="text-[10px] text-muted font-mono">
                          Duration: ~{step.durationYears.likely} yrs (range: {step.durationYears.min}–{step.durationYears.max} yrs)
                        </span>
                      </div>
                    </div>

                    {/* Requirements Grid */}
                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-surface p-3 rounded border border-border space-y-1">
                        <span className="font-mono font-bold uppercase text-[11px] text-foreground block">Scope Required</span>
                        <p className="text-secondary leading-relaxed">{step.requirements.scope}</p>
                      </div>
                      <div className="bg-surface p-3 rounded border border-border space-y-1">
                        <span className="font-mono font-bold uppercase text-[11px] text-foreground block">Measurable Impact</span>
                        <p className="text-secondary leading-relaxed">{step.requirements.impact}</p>
                      </div>
                      <div className="bg-surface p-3 rounded border border-border space-y-1">
                        <span className="font-mono font-bold uppercase text-[11px] text-foreground block">Leadership &amp; Mentorship</span>
                        <p className="text-secondary leading-relaxed">{step.requirements.influence}</p>
                      </div>
                    </div>

                    {/* Key Blockers to Overcome */}
                    <PromotionBlockersChecklist
                      blockers={step.blockers}
                      mode="card-grid"
                      maxCards={4}
                      title={`Key Blockers to Overcome on this Promotion (${step.blockers.length} Documented)`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4.1 FIRST TWO YEARS FRESHER MILESTONES */}
          <div className="bg-surface rounded-md p-6 border border-border space-y-5">
            <div className="border-b border-border pb-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-volt/10 text-volt border border-volt/30 inline-block mb-1">
                Early Career Core Focus
              </span>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                <Target className="w-5 h-5 text-volt" />
                First Two Years: Critical Engineering Milestones
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Clear operational milestones for your first 24 months at {studentResult.dreamCompany.name} ({studentResult.entryLevel.levelCode}), derived from verified promotion criteria.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Year 1 */}
              <div className="p-4 rounded border border-border bg-surface-2/40 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-black text-foreground text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-volt" /> Year 1: Onboarding &amp; Delivery Execution
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-volt/10 text-volt">
                    Months 1–12
                  </span>
                </div>
                <div className="space-y-2 text-xs text-secondary">
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <strong className="text-foreground block text-[11px] font-mono mb-0.5 uppercase">Production Ownership:</strong>
                    Ship first feature PR within 30 days; master CI/CD deployment pipelines, unit testing, and team code review SLA standards.
                  </div>
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <strong className="text-foreground block text-[11px] font-mono mb-0.5 uppercase">Operational Reliability:</strong>
                    Shadow team on-call rotation by month 6; write comprehensive runbooks for handled production incidents.
                  </div>
                </div>
              </div>

              {/* Year 2 */}
              <div className="p-4 rounded border border-border bg-surface-2/40 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-black text-foreground text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-volt" /> Year 2: Independent Subsystem Scope
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-volt/10 text-volt">
                    Months 13–24
                  </span>
                </div>
                <div className="space-y-2 text-xs text-secondary">
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <strong className="text-foreground block text-[11px] font-mono mb-0.5 uppercase">End-to-End Design:</strong>
                    Author RFC/technical design doc for a service integration or performance optimization; drive implementation end-to-end.
                  </div>
                  <div className="bg-surface p-2.5 rounded border border-border">
                    <strong className="text-foreground block text-[11px] font-mono mb-0.5 uppercase">Promotion Packet Evidence:</strong>
                    Deliver measurable business metric (latency reduction, cost savings, or error rate drop) required for advancement to {studentResult.targetLevel.levelCode}.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. WHAT SHOULD I DO NEXT? (ACTION STEPS & STEPPING STONES) */}
          <div className="bg-surface rounded-md p-6 border border-border space-y-6">
            <div className="border-b border-border pb-3">
              <span className="text-[10px] font-mono font-black uppercase text-volt tracking-wider">
                Question 5 of 5
              </span>
              <h3 className="text-base sm:text-lg font-black text-foreground mt-0.5 flex items-center gap-2">
                <Compass className="w-5 h-5 text-volt" />
                What should I do next? (Action Steps &amp; Stepping Stones)
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Immediate tactical actions for your current college semester plus high-probability stepping stone companies.
              </p>
            </div>

            {/* Immediate Semester Action Plan */}
            <div className="p-4 rounded bg-surface-2/40 border border-border space-y-2.5 text-xs">
              <span className="font-mono font-black text-volt flex items-center gap-2 text-sm uppercase">
                <Sparkles className="w-4 h-4 text-volt" />
                Your Recommended Tactical Next Steps
              </span>
              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-surface p-3 rounded border border-border space-y-1">
                  <span className="font-mono font-bold text-foreground block text-xs uppercase">1. Immediate Target</span>
                  <p className="text-secondary text-[11px] leading-relaxed">
                    {studentResult.eligibilityWindows?.recommendedFocus || 'Strengthen Data Structures and core Computer Science fundamentals for campus placement rounds.'}
                  </p>
                </div>
                <div className="bg-surface p-3 rounded border border-border space-y-1">
                  <span className="font-mono font-bold text-foreground block text-xs uppercase">2. Drive Preparation</span>
                  <p className="text-secondary text-[11px] leading-relaxed">
                    Prepare for {studentResult.entryRoutes[0]?.name || 'campus online assessments'} with target company question patterns and mock coding tests.
                  </p>
                </div>
                <div className="bg-surface p-3 rounded border border-border space-y-1">
                  <span className="font-mono font-bold text-foreground block text-xs uppercase">3. Resume &amp; Portfolio</span>
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
                  <span className="text-xs font-mono font-black text-foreground uppercase tracking-wider">
                    Stepping-Stone Backup Offers ({studentResult.alternateSteppingStones.length})
                  </span>
                  <span className="text-[11px] text-muted font-mono">
                    Alternative routes into {studentResult.dreamCompany.name}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {studentResult.alternateSteppingStones.map((stone, sIdx) => (
                    <div key={sIdx} className="bg-surface-2/40 border border-border rounded p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-foreground text-sm">{stone.company.name}</span>
                        <span className="px-2 py-0.5 rounded bg-surface text-[10px] font-mono font-bold text-muted border border-border">
                          {stone.typicalDurationYears} yrs stepping stone
                        </span>
                      </div>
                      <p className="text-volt font-mono font-bold">{stone.entryRole} ({formatINR(stone.entryOfferINR)})</p>
                      <p className="text-secondary leading-relaxed pt-1">{stone.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skills to Close Panel */}
          <SkillsToClosePanel />
        </div>
      )}
    </>
  );
}
