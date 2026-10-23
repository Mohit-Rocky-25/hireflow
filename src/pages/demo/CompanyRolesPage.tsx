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
      <div className="min-h-screen bg-black text-white">
        <PublicNavbar />
        <div className="max-w-[800px] mx-auto px-6 py-[120px] text-center">
          <div className="bg-[#141414] border border-charcoal rounded-lg p-10">
            <Building2 className="w-12 h-12 text-silver mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Company Not Found</h1>
            <p className="text-sm text-silver mb-6">
              We couldn't find a company profile matching &ldquo;{companySlug}&rdquo;. It may have been renamed or moved.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-volt text-[#151515] font-bold text-xs hover:bg-[#1a1a1a] hover:text-volt border border-volt transition-colors"
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
    <div className="min-h-screen bg-black text-white">
      <PublicNavbar />

      <div className="max-w-[1400px] mx-auto px-6 py-[88px] page-enter">
        {/* Hero headline */}
        <div className="text-center mb-9 max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141414] border border-charcoal rounded text-xs font-mono uppercase tracking-wider text-volt mb-4">
            <Brain className="w-3.5 h-3.5 text-volt" />
            TalentLens™ · Placement Readiness &amp; Career Fit
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
            Where do I fit at <span className="text-volt">{company.name}</span>?
          </h1>
          <p className="text-sm text-silver leading-relaxed max-w-2xl mx-auto">
            An evidence-first placement-readiness platform that helps students understand which roles and company paths fit their current profile, identify missing evidence, improve their resume, and follow a practical preparation plan.
          </p>
        </div>

        {/* 3-Step Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-9">
          <div className="inline-flex items-center bg-[#141414] border border-charcoal rounded p-1 gap-1">
            {[
              { n: 1, label: '1. Your Resume', to: '/demo' },
              { n: 2, label: '2. Company & Role', onClick: handleBackToRoles },
              { n: 3, label: '3. AI Analysis', disabled: !result },
            ].map((s) => (
              <React.Fragment key={s.n}>
                {s.n === 1 ? (
                  <Link
                    to="/demo"
                    className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all ${
                      resumeText.trim()
                        ? 'bg-black text-volt border border-charcoal hover:border-volt'
                        : 'text-silver hover:text-white'
                    }`}
                  >
                    <span className="text-volt font-bold">✓</span>
                    {s.label}
                  </Link>
                ) : s.n === 2 ? (
                  <button
                    onClick={s.onClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      activeStep === 2
                        ? 'bg-volt text-[#151515] font-bold'
                        : 'bg-black text-volt border border-charcoal'
                    }`}
                  >
                    <span>{activeStep > 2 ? '✓' : ''}</span>
                    {s.label}
                  </button>
                ) : (
                  <button
                    disabled={s.disabled}
                    onClick={() => {
                      if (result) setSearchParams({ view: 'analysis' });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      activeStep === 3
                        ? 'bg-volt text-[#151515] font-bold'
                        : result
                        ? 'bg-black text-silver border border-charcoal hover:border-volt hover:text-white'
                        : 'text-silver/40 cursor-not-allowed'
                    }`}
                  >
                    {s.label}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Company Header Card */}
        <CompanyHeaderCard company={company} onChangeCompany={handleChangeCompany} />

        {/* ── STEP 2: COMPANY ROLES VIEW ── */}
        {!isAnalysisView && (
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Roles Column */}
            <div className="flex-1 w-full min-w-0">
              {/* Segmented Control: Fresher vs Experienced */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#141414] border border-charcoal rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setRoleMode('fresher')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    roleMode === 'fresher'
                      ? 'bg-black text-volt border border-volt'
                      : 'text-silver hover:text-white hover:bg-black/50'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${roleMode === 'fresher' ? 'text-volt' : 'text-silver'}`} />
                  <span>Fresher / Campus ('26-27)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#141414] text-silver border border-charcoal">
                    {companyPrograms.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleMode('experienced')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    roleMode === 'experienced'
                      ? 'bg-black text-volt border border-volt'
                      : 'text-silver hover:text-white hover:bg-black/50'
                  }`}
                >
                  <Briefcase className={`w-4 h-4 ${roleMode === 'experienced' ? 'text-volt' : 'text-silver'}`} />
                  <span>Experienced Lateral Roles</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#141414] text-silver border border-charcoal">
                    {company.roles.length}
                  </span>
                </button>
              </div>

              {/* Search if company has more than 8 roles */}
              {company.roles.length > 8 && (
                <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-silver" />
                  <input
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder={`Search ${company.roles.length} roles at ${company.name}...`}
                    className="w-full pl-10 pr-14 h-10 bg-[#141414] border border-charcoal rounded text-xs text-white placeholder:text-silver focus:outline-none focus:border-volt transition-colors"
                  />
                  {roleSearch && (
                    <button
                      onClick={() => setRoleSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-silver hover:text-volt cursor-pointer"
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
                    <div className="p-3.5 bg-[#141414] border border-charcoal rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono uppercase text-xs">Verify Eligibility:</span>
                        <span className="text-xs text-silver">
                          Live evaluation against 2026-27 campus hiring criteria
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-silver font-mono">Branch:</span>
                          <select
                            value={candidateBranch}
                            onChange={(e) => setCandidateBranch(e.target.value)}
                            className="bg-black border border-charcoal rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-volt"
                          >
                            <option value="cs">CS</option>
                            <option value="it">IT</option>
                            <option value="ece">ECE</option>
                            <option value="ee">EE</option>
                            <option value="mech">MECH</option>
                            <option value="civil">CIVIL</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-silver font-mono">CGPA:</span>
                          <select
                            value={candidateCgpa}
                            onChange={(e) => setCandidateCgpa(parseFloat(e.target.value))}
                            className="bg-black border border-charcoal rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-volt"
                          >
                            <option value="9.0">≥ 9.0</option>
                            <option value="8.0">≥ 8.0</option>
                            <option value="7.5">≥ 7.5</option>
                            <option value="7.0">≥ 7.0</option>
                            <option value="6.5">≥ 6.5</option>
                            <option value="6.0">≥ 6.0</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-silver font-mono">Backlogs:</span>
                          <select
                            value={candidateBacklogs}
                            onChange={(e) => setCandidateBacklogs(parseInt(e.target.value, 10))}
                            className="bg-black border border-charcoal rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-volt"
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
                    <div className="p-8 rounded-lg bg-[#141414] border border-charcoal text-center space-y-3">
                      <div className="w-10 h-10 rounded bg-black border border-charcoal text-pale-yellow mx-auto flex items-center justify-center">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white">
                        No General Fresher / Campus Intake for {company.name}
                      </h4>
                      <p className="text-xs text-silver max-w-md mx-auto leading-relaxed">
                        {company.name} engineering hires strictly lateral senior roles in India. There is no open campus graduate intake program.
                      </p>
                      <button
                        type="button"
                        onClick={() => setRoleMode('experienced')}
                        className="px-5 py-2 rounded bg-volt text-[#151515] font-bold text-xs hover:bg-[#1a1a1a] hover:text-volt border border-volt transition-colors cursor-pointer"
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
                <div className="space-y-3">
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
                    <div className="text-center py-12 bg-[#141414] border border-charcoal rounded-lg p-6">
                      <Briefcase className="w-8 h-8 text-silver mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-white mb-1">
                        No matching roles found
                      </h4>
                      <p className="text-xs text-silver mb-3">
                        No roles at {company.name} match &ldquo;{roleSearch}&rdquo;.
                      </p>
                      <button
                        onClick={() => setRoleSearch('')}
                        className="text-volt font-mono text-xs hover:underline cursor-pointer"
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
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-charcoal pt-10">
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
              className="bg-[#141414] border border-charcoal rounded-lg p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5 text-volt" />
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-white">{s.value}</div>
                <div className="text-xs font-mono uppercase text-silver">{s.label}</div>
                <div className="text-[11px] text-silver/60">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
