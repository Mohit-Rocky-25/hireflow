// ============================================================
// HireFlow — TalentLens™ Company Roles Page (/demo/company/:companySlug)
// Step 2 & Step 3: Browse roles, select a role, inspect action panel,
// and trigger 6-Layer Deep AI Analysis (Decomposed Architecture)
// ============================================================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Brain,
  Building2,
  Briefcase,
  Search,
  ArrowLeft,
  GraduationCap,
  Info,
  BarChart3,
  Zap,
} from 'lucide-react';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { careers } from '../../careers-core';
import type { FresherProgram } from '../../careers-core';
import {
  findCompanyBySlug,
  COMPANIES,
  Role,
  deepAnalyzeCompetency,
  computeScore,
  generateImprovementPlan,
  runMarketIntelligenceEngine,
} from './talentLensData';
import { useTalentLensStore, DEMO_TALENTLENS_RESUME, setCompaniesResolver } from './useTalentLensStore';
import { useProfileStore } from '../../store/profileStore';

import { CompanyHeaderCard } from './components/CompanyHeaderCard';
import { FresherProgramCard } from './components/FresherProgramCard';
import { ExperiencedRoleCard } from './components/ExperiencedRoleCard';
import { TargetRoleActionPanel } from './components/TargetRoleActionPanel';
import { AnalysisResultView } from './components/AnalysisResultView';

setCompaniesResolver(() => COMPANIES);

export function CompanyRolesPage() {
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeResume } = useProfileStore();

  // Shared store
  const {
    resumeText,
    setResume,
    selectedRoleTitle,
    selectCompany,
    selectRole,
    result,
    setResult,
    setStep,
    resetToNewResume,
  } = useTalentLensStore();

  // Auto-populate active profile resume if talentLens store is currently empty
  useEffect(() => {
    if (!resumeText.trim() && activeResume?.ledger?.rawText) {
      setResume(activeResume.ledger.rawText, activeResume.label);
    }
  }, [activeResume, resumeText, setResume]);

  // Find company
  const company = useMemo(() => findCompanyBySlug(companySlug), [companySlug]);

  // Sync selected company to store
  useEffect(() => {
    if (company) {
      selectCompany(company);
    }
  }, [company, selectCompany]);

  // Local UI states
  const [roleSearch, setRoleSearch] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisPhase, setAnalysisPhase] = useState('');

  // View state: 'roles' vs 'analysis'
  const isAnalysisView = searchParams.get('view') === 'analysis' && result !== null;

  // Fresher programs for company (Careers Data Platform)
  const companyPrograms = useMemo(() => {
    if (!company) return [];
    return careers.programs.forCompany(company.id);
  }, [company]);

  // Selected role from company OR campus programs
  const selectedRole = useMemo<Role | null>(() => {
    if (!company || !selectedRoleTitle) return null;
    const standardRole = company.roles.find((r) => r.title === selectedRoleTitle);
    if (standardRole) return standardRole;

    // Check campus programs
    const matchingProg = companyPrograms.find(
      (p) =>
        `${p.roleTitle} (${p.programName})` === selectedRoleTitle ||
        p.programName === selectedRoleTitle ||
        p.roleTitle === selectedRoleTitle ||
        selectedRoleTitle.includes(p.programName)
    );

    if (matchingProg) {
      return {
        title: `${matchingProg.roleTitle} (${matchingProg.programName})`,
        level: matchingProg.campusCategory.toUpperCase(),
        desc: `${matchingProg.eligibility.notes || `Campus graduate engineering intake for ${company.name}`}. Cutoff: ${matchingProg.eligibility.minCgpa ?? 'None'} CGPA. Stages: ${matchingProg.selectionProcess.map((s) => s.stage).join(' → ')}.`,
        competencies: Object.keys(matchingProg.competencyProfile),
        reqLevel: matchingProg.competencyProfile as any,
      } as Role;
    }

    return null;
  }, [company, selectedRoleTitle, companyPrograms]);

  // Filtered roles
  const filteredRoles = useMemo(() => {
    if (!company) return [];
    const q = roleSearch.toLowerCase().trim();
    if (!q) return company.roles;
    return company.roles.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.level.toLowerCase().includes(q) ||
        r.competencies.some((c) => c.toLowerCase().includes(q))
    );
  }, [company, roleSearch]);

  const [roleMode, setRoleMode] = useState<'fresher' | 'experienced'>('fresher');
  const [candidateCgpa, setCandidateCgpa] = useState<number>(8.0);
  const [candidateBranch, setCandidateBranch] = useState<string>('cs');
  const [candidateBacklogs, setCandidateBacklogs] = useState<number>(0);

  const candidateFacts = useMemo(
    () => ({
      cgpa: candidateCgpa,
      branchCode: candidateBranch,
      backlogs: candidateBacklogs,
      gradYear: 2026,
    }),
    [candidateCgpa, candidateBranch, candidateBacklogs]
  );

  const filteredPrograms = useMemo(() => {
    const q = roleSearch.toLowerCase().trim();
    if (!q) return companyPrograms;
    return companyPrograms.filter(
      (p) =>
        p.programName.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.roleFamily.toLowerCase().includes(q)
    );
  }, [companyPrograms, roleSearch]);

  const handleSelectProgram = (prog: FresherProgram) => {
    const progAsRole = {
      title: `${prog.roleTitle} (${prog.programName})`,
      level: prog.campusCategory.toUpperCase(),
      desc: `${prog.eligibility.notes || `Campus graduate engineering intake for ${company?.name || prog.companyId}`}. Cutoff: ${prog.eligibility.minCgpa ?? 'None'} CGPA. Stages: ${prog.selectionProcess.map((s) => s.stage).join(' → ')}.`,
      competencies: Object.keys(prog.competencyProfile),
      reqLevel: prog.competencyProfile as any,
    } as Role;
    selectRole(progAsRole);
  };

  // Handle analysis
  const handleRunAnalysis = () => {
    if (!selectedRole || !company || !resumeText.trim()) return;

    setAnalyzing(true);
    setResult(null);

    const phases = [
      'Layer 1: Scanning keyword signals...',
      'Layer 2: Verifying contextual authenticity...',
      'Layer 3: Evaluating production depth...',
      'Layer 4: Measuring quantified impact...',
      'Layer 5: Anti-gaming cognitive screening...',
      'Layer 6: Progression & authenticity signals...',
      'Generating role-specific career acceleration plan...',
    ];

    let phaseIdx = 0;
    const interval = setInterval(() => {
      if (phaseIdx < phases.length) {
        setAnalysisPhase(phases[phaseIdx]);
        phaseIdx++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    setTimeout(() => {
      clearInterval(interval);
      const reqLevelMap = selectedRole.reqLevel as unknown as Record<string, string>;
      const breakdown = selectedRole.competencies.map((comp) => ({
        competency: comp,
        reqLevel: reqLevelMap[comp] || 'working',
        analysis: deepAnalyzeCompetency(resumeText, comp, reqLevelMap[comp] || 'working'),
      }));
      const score = computeScore(
        breakdown.map((b) => b.analysis),
        reqLevelMap,
        resumeText
      );
      const plans = generateImprovementPlan(breakdown, company, selectedRole, score);
      const marketIntel = runMarketIntelligenceEngine(
        resumeText,
        selectedRole.competencies,
        company,
        selectedRole
      );

      setResult({ score, breakdown, plans, marketIntel });
      setAnalysisPhase('');
      setAnalyzing(false);
      setStep(3);
      setSearchParams({ view: 'analysis' });

      // Smooth scroll to top of analysis
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }, 3400);
  };

  const handleBackToRoles = () => {
    setSearchParams({});
    setStep(2);
  };

  const handleChangeCompany = () => {
    setStep(2);
    navigate('/demo');
  };

  const handleNewResume = () => {
    resetToNewResume();
    navigate('/demo');
  };

  // Unknown company state
  if (!company) {
    return (
      <div className="min-h-screen bg-bg">
        <PublicNavbar />
        <div className="max-w-[800px] mx-auto px-[24px] py-[120px] text-center">
          <div className="bg-surface border border-border rounded-2xl p-[40px] shadow-md">
            <Building2 className="w-[48px] h-[48px] text-text-muted mx-auto mb-[16px]" />
            <h1 className="text-[24px] font-bold text-text mb-[8px]">Company Not Found</h1>
            <p className="text-[14px] text-text-secondary mb-[24px]">
              We couldn't find a company profile matching &ldquo;{companySlug}&rdquo;. It may have been renamed or moved.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl bg-primary text-white font-bold text-[13px] hover:bg-primary-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Company Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active step for progress bar
  const activeStep = isAnalysisView ? 3 : 2;

  return (
    <div className="min-h-screen bg-bg">
      <PublicNavbar />

      <div className="max-w-[1400px] mx-auto px-[24px] py-[88px] page-enter">
        {/* Hero headline */}
        <div className="text-center mb-[36px] max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[7px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[16px]">
            <Brain className="w-[14px] h-[14px]" />
            TalentLens™ · Placement Readiness &amp; Career Fit
          </div>
          <h1 className="text-[36px] md:text-[46px] font-extrabold text-text mb-[10px] tracking-[-0.03em] leading-[1.1]">
            Where do I fit at <span className="gradient-text">{company.name}</span>?
          </h1>
          <p className="text-[15px] text-text-secondary leading-[24px]">
            An evidence-first placement-readiness platform that helps students understand which roles and company paths fit their current profile, identify missing evidence, improve their resume, and follow a practical preparation plan.
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="flex items-center justify-center gap-0 mb-[36px]">
          {[
            { n: 1, label: 'Your Resume', to: '/demo' },
            { n: 2, label: 'Company & Role', onClick: handleBackToRoles },
            { n: 3, label: 'AI Analysis', disabled: !result },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              {s.n === 1 ? (
                <Link
                  to="/demo"
                  className={`flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl font-semibold text-[13px] transition-all ${
                    resumeText.trim()
                      ? 'bg-success/15 text-success border border-success/30 hover:bg-success/20'
                      : 'bg-surface border border-border text-text-secondary'
                  }`}
                >
                  <span className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold bg-success/20">
                    ✓
                  </span>
                  {s.label}
                </Link>
              ) : s.n === 2 ? (
                <button
                  onClick={s.onClick}
                  className={`flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl font-semibold text-[13px] transition-all cursor-pointer ${
                    activeStep === 2
                      ? 'bg-text text-bg shadow-md'
                      : 'bg-success/15 text-success border border-success/30'
                  }`}
                >
                  <span
                    className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold ${
                      activeStep === 2 ? 'bg-white/20' : 'bg-success/20'
                    }`}
                  >
                    {activeStep > 2 ? '✓' : 2}
                  </span>
                  {s.label}
                </button>
              ) : (
                <button
                  disabled={s.disabled}
                  onClick={() => {
                    if (result) setSearchParams({ view: 'analysis' });
                  }}
                  className={`flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl font-semibold text-[13px] transition-all cursor-pointer ${
                    activeStep === 3
                      ? 'bg-text text-bg shadow-md'
                      : result
                      ? 'bg-surface border border-border text-text hover:border-primary/50'
                      : 'bg-surface border border-border text-text-muted opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold ${
                      activeStep === 3 ? 'bg-white/20' : 'bg-border'
                    }`}
                  >
                    3
                  </span>
                  {s.label}
                </button>
              )}
              {i < 2 && (
                <div
                  className={`w-[32px] h-[2px] mx-[2px] rounded-full ${
                    activeStep > s.n ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Company Header Card */}
        <CompanyHeaderCard company={company} onChangeCompany={handleChangeCompany} />

        {/* ── STEP 2: COMPANY ROLES VIEW ── */}
        {!isAnalysisView && (
          <div className="flex flex-col lg:flex-row items-start gap-[24px]">
            {/* Roles Column */}
            <div className="flex-1 w-full min-w-0">
              {/* Segmented Control: Fresher vs Experienced */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-2/90 border border-border/80 rounded-2xl mb-4 shadow-xs">
                <button
                  type="button"
                  onClick={() => setRoleMode('fresher')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    roleMode === 'fresher'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md font-extrabold ring-1 ring-black/10'
                      : 'text-text-secondary hover:text-text hover:bg-surface/60'
                  }`}
                >
                  <GraduationCap
                    className={`w-4 h-4 ${
                      roleMode === 'fresher' ? 'text-amber-400 dark:text-amber-500' : 'text-text-muted'
                    }`}
                  />
                  <span className="tracking-tight">Fresher / Campus ('26-27)</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      roleMode === 'fresher'
                        ? 'bg-white/20 text-white dark:bg-black/15 dark:text-black'
                        : 'bg-surface-3 text-text-muted border border-border'
                    }`}
                  >
                    {companyPrograms.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleMode('experienced')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    roleMode === 'experienced'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-md font-extrabold ring-1 ring-black/10'
                      : 'text-text-secondary hover:text-text hover:bg-surface/60'
                  }`}
                >
                  <Briefcase
                    className={`w-4 h-4 ${
                      roleMode === 'experienced' ? 'text-sky-400 dark:text-sky-500' : 'text-text-muted'
                    }`}
                  />
                  <span className="tracking-tight">Experienced Lateral Roles</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      roleMode === 'experienced'
                        ? 'bg-white/20 text-white dark:bg-black/15 dark:text-black'
                        : 'bg-surface-3 text-text-muted border border-border'
                    }`}
                  >
                    {company.roles.length}
                  </span>
                </button>
              </div>

              {/* Search if company has more than 8 roles */}
              {company.roles.length > 8 && (
                <div className="relative mb-[16px]">
                  <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-text-secondary" />
                  <input
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder={`Search ${company.roles.length} roles at ${company.name}...`}
                    className="w-full pl-[40px] pr-[14px] h-[42px] bg-surface border border-border rounded-xl text-[13px] text-text focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                  />
                  {roleSearch && (
                    <button
                      onClick={() => setRoleSearch('')}
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] text-text-muted hover:text-text cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* ── FRESHER MODE VIEW ── */}
              {roleMode === 'fresher' && (
                <div className="space-y-4">
                  {/* Candidate Quick Eligibility Filter Bar */}
                  {companyPrograms.length > 0 && (
                    <div className="p-3.5 bg-surface border border-border rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text">Verify My Eligibility:</span>
                        <span className="text-[11px] text-text-secondary">
                          Live evaluation against 2026-27 campus hiring criteria
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-text-muted">Branch:</span>
                          <select
                            value={candidateBranch}
                            onChange={(e) => setCandidateBranch(e.target.value)}
                            className="bg-surface-2 border border-border rounded-lg px-2 py-1 text-xs font-semibold text-text outline-none"
                          >
                            <option value="cs">CS</option>
                            <option value="it">IT</option>
                            <option value="ece">ECE</option>
                            <option value="ee">EE</option>
                            <option value="mech">MECH</option>
                            <option value="civil">CIVIL</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-text-muted">CGPA:</span>
                          <select
                            value={candidateCgpa}
                            onChange={(e) => setCandidateCgpa(parseFloat(e.target.value))}
                            className="bg-surface-2 border border-border rounded-lg px-2 py-1 text-xs font-semibold text-text outline-none"
                          >
                            <option value="9.0">≥ 9.0</option>
                            <option value="8.0">≥ 8.0</option>
                            <option value="7.5">≥ 7.5</option>
                            <option value="7.0">≥ 7.0</option>
                            <option value="6.5">≥ 6.5</option>
                            <option value="6.0">≥ 6.0</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-text-muted">Backlogs:</span>
                          <select
                            value={candidateBacklogs}
                            onChange={(e) => setCandidateBacklogs(parseInt(e.target.value, 10))}
                            className="bg-surface-2 border border-border rounded-lg px-2 py-1 text-xs font-semibold text-text outline-none"
                          >
                            <option value="0">0 Active</option>
                            <option value="1">1 Active</option>
                            <option value="2">2+ Active</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty state: No campus programs */}
                  {companyPrograms.length === 0 && (
                    <div className="p-8 rounded-2xl bg-surface border border-border text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                        <Info className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-foreground">
                        No General Fresher / Campus Intake for {company.name}
                      </h4>
                      <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                        {company.name} engineering hires strictly lateral senior roles in India. There is no open campus graduate intake program.
                      </p>
                      <button
                        type="button"
                        onClick={() => setRoleMode('experienced')}
                        className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
                      >
                        Explore Experienced Roles ({company.roles.length})
                      </button>
                    </div>
                  )}

                  {/* Fresher Program Cards */}
                  {filteredPrograms.map((prog) => {
                    const isSelected =
                      !!selectedRole &&
                      (selectedRole.title === `${prog.roleTitle} (${prog.programName})` ||
                        selectedRole.title === prog.programName ||
                        selectedRole.title.includes(prog.programName));

                    return (
                      <FresherProgramCard
                        key={prog.id}
                        prog={prog}
                        company={company}
                        isSelected={isSelected}
                        candidateFacts={candidateFacts}
                        resumeText={resumeText}
                        activeResume={activeResume}
                        analyzing={analyzing}
                        onSelect={() => handleSelectProgram(prog)}
                        onRunAnalysis={handleRunAnalysis}
                        onLoadSampleResume={() =>
                          setResume(DEMO_TALENTLENS_RESUME.text, DEMO_TALENTLENS_RESUME.fileName)
                        }
                      />
                    );
                  })}
                </div>
              )}

              {/* ── EXPERIENCED MODE VIEW ── */}
              {roleMode === 'experienced' && (
                <div className="space-y-[10px]">
                  {filteredRoles.map((role) => {
                    const isSelected = selectedRole?.title === role.title;
                    return (
                      <ExperiencedRoleCard
                        key={role.title}
                        role={role}
                        company={company}
                        isSelected={isSelected}
                        resumeText={resumeText}
                        analyzing={analyzing}
                        onSelect={() => selectRole(role)}
                        onRunAnalysis={handleRunAnalysis}
                      />
                    );
                  })}

                  {filteredRoles.length === 0 && (
                    <div className="text-center py-[48px] bg-surface border border-border rounded-2xl p-[24px]">
                      <Briefcase className="w-[32px] h-[32px] text-text-muted mx-auto mb-[10px]" />
                      <h4 className="text-[14px] font-bold text-text mb-[4px]">
                        No matching roles found
                      </h4>
                      <p className="text-[12px] text-text-secondary mb-[14px]">
                        No roles at {company.name} match &ldquo;{roleSearch}&rdquo;.
                      </p>
                      <button
                        onClick={() => setRoleSearch('')}
                        className="text-primary font-semibold text-[12px] underline cursor-pointer"
                      >
                        Show all {company.roles.length} roles
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop-Only Sticky Action Panel (Right Side) */}
            <TargetRoleActionPanel
              company={company}
              selectedRole={selectedRole}
              resumeText={resumeText}
              analyzing={analyzing}
              analysisPhase={analysisPhase}
              onRunAnalysis={handleRunAnalysis}
              onLoadSampleResume={() =>
                setResume(DEMO_TALENTLENS_RESUME.text, DEMO_TALENTLENS_RESUME.fileName)
              }
            />
          </div>
        )}

        {/* ── STEP 3: ANALYSIS RESULTS VIEW ── */}
        {isAnalysisView && result && selectedRole && (
          <AnalysisResultView
            result={result}
            selectedRole={selectedRole}
            company={company}
            onBackToRoles={handleBackToRoles}
            onChangeCompany={handleChangeCompany}
            onNewResume={handleNewResume}
          />
        )}

        {/* 4-Stat Strip at bottom */}
        <div className="mt-[56px] grid grid-cols-2 md:grid-cols-4 gap-[14px] border-t border-border pt-[40px]">
          {[
            {
              icon: Building2,
              value: `${COMPANIES.length}+`,
              label: 'Employers & Recruiters',
              sub: 'FAANG, Unicorns & Cybersecurity',
            },
            {
              icon: Briefcase,
              value: `${COMPANIES.reduce((a, c) => a + c.roles.length, 0)}+`,
              label: 'Calibrated Roles',
              sub: '10+ roles per company verified',
            },
            {
              icon: BarChart3,
              value: '6-Layer',
              label: 'Analysis Engine',
              sub: 'Anti-gaming AI',
            },
            {
              icon: Zap,
              value: 'TalentLens™',
              label: 'Intelligence Platform',
              sub: 'Candidate verification',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-border rounded-2xl p-[16px] flex items-center gap-[12px]"
            >
              <div className="w-[40px] h-[40px] rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-[18px] h-[18px] text-primary" />
              </div>
              <div>
                <div className="text-[18px] font-extrabold text-text">{s.value}</div>
                <div className="text-[12px] font-semibold text-text">{s.label}</div>
                <div className="text-[11px] text-text-muted">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
