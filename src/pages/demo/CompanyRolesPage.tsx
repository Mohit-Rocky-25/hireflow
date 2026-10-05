// ============================================================
// HireFlow — TalentLens™ Company Roles Page (/demo/company/:companySlug)
// Step 2 & Step 3: Browse roles, select a role, inspect action panel,
// and trigger 6-Layer Deep AI Analysis
// ============================================================
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Brain,
  Building2,
  Briefcase,
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Terminal,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap,
  Target,
  FileText,
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import {
  findCompanyBySlug,
  COMPANIES,
  Role,
  Company,
  TREND_COLOR,
  TREND_ICON,
  STATUS_CONFIG,
  deepAnalyzeCompetency,
  computeScore,
  generateImprovementPlan,
  runMarketIntelligenceEngine,
  AnalysisResult,
  getCompanySlug,
} from './talentLensData';
import { useTalentLensStore } from './useTalentLensStore';

export function CompanyRolesPage() {
  const { companySlug = '' } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Shared store
  const {
    resumeText,
    selectedRoleTitle,
    selectCompany,
    selectRole,
    result,
    setResult,
    step,
    setStep,
    resetToNewResume,
  } = useTalentLensStore();

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
  const [showSuggestions, setShowSuggestions] = useState(false);

  // View state: 'roles' vs 'analysis'
  const isAnalysisView = searchParams.get('view') === 'analysis' && result !== null;

  // Selected role from company
  const selectedRole = useMemo(() => {
    if (!company) return null;
    return company.roles.find((r) => r.title === selectedRoleTitle) || null;
  }, [company, selectedRoleTitle]);

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

  // Handle analysis
  const handleRunAnalysis = () => {
    if (!selectedRole || !company || !resumeText.trim()) return;

    setAnalyzing(true);
    setResult(null);
    setShowSuggestions(false);

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

  const scoreColor = result
    ? result.score >= 80
      ? 'text-success'
      : result.score >= 55
      ? 'text-warning'
      : 'text-danger'
    : 'text-primary';

  const verdict = result
    ? result.score >= 85
      ? 'Strong Match 🚀'
      : result.score >= 70
      ? 'Good Potential 🟡'
      : result.score >= 50
      ? 'Needs Work 🔧'
      : 'Significant Gap ❌'
    : '';

  return (
    <div className="min-h-screen bg-bg">
      <PublicNavbar />

      <div className="max-w-[1400px] mx-auto px-[24px] py-[88px] page-enter">
        {/* Hero headline */}
        <div className="text-center mb-[36px] max-w-[900px] mx-auto">
          <div className="inline-flex items-center gap-[10px] px-[16px] py-[7px] bg-ai-light border border-ai/25 rounded-full text-[13px] font-semibold text-ai mb-[16px]">
            <Brain className="w-[14px] h-[14px]" />
            TalentLens™ — {company.name} Role Intelligence &amp; AI Screening
          </div>
          <h1 className="text-[36px] md:text-[46px] font-extrabold text-text mb-[10px] tracking-[-0.03em] leading-[1.1]">
            Targeting <span className="gradient-text">{company.name}</span>
          </h1>
          <p className="text-[15px] text-text-secondary leading-[24px]">
            Select an open role to evaluate your resume against verified 2024-25 engineering competencies and hiring bars.
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
                  className={`flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl font-semibold text-[13px] transition-all ${
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
                  className={`flex items-center gap-[8px] px-[18px] py-[9px] rounded-xl font-semibold text-[13px] transition-all ${
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
        <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[28px] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
            <div className="flex items-center gap-[16px]">
              <div
                className={`w-[56px] h-[56px] rounded-2xl bg-gradient-to-br ${company.gradient} flex items-center justify-center text-white font-extrabold text-[18px] flex-shrink-0 shadow-md`}
              >
                {company.logo}
              </div>
              <div>
                <div className="flex items-center gap-[10px] flex-wrap">
                  <h2 className="text-[22px] font-bold text-text">{company.name}</h2>
                  <span
                    className={`text-[11px] font-bold px-[8px] py-[2px] rounded-full ${
                      company.tier === 'FAANG'
                        ? 'bg-ai-light text-ai'
                        : company.tier === 'Unicorn'
                        ? 'bg-primary-light text-primary'
                        : company.tier === 'MNC'
                        ? 'bg-info-bg text-info'
                        : company.tier === 'Startup'
                        ? 'bg-success-bg text-success'
                        : 'bg-surface-3 text-text-secondary'
                    }`}
                  >
                    {company.tier}
                  </span>
                </div>
                <div className="text-[13px] text-text-secondary mt-[2px] flex items-center gap-[8px]">
                  <span>{company.hq}</span>
                  <span>•</span>
                  <span>{company.industry}</span>
                  <span>•</span>
                  <span className="font-semibold text-text">{company.avgPackage}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-[12px] flex-wrap">
              {/* Mini Stats */}
              <div className="flex items-center gap-[8px]">
                <div className="bg-surface-2 rounded-xl px-[12px] py-[8px] text-center border border-border/60">
                  <div className="text-[13px] font-extrabold text-text">
                    {company.hiring2024.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-text-muted flex items-center justify-center gap-[2px]">
                    Hires &lsquo;24{' '}
                    <span className={`font-bold ${TREND_COLOR[company.trend]}`}>
                      {TREND_ICON[company.trend]}
                    </span>
                  </div>
                </div>
                <div className="bg-surface-2 rounded-xl px-[12px] py-[8px] text-center border border-border/60">
                  <div className="text-[13px] font-extrabold text-text">{company.openRoles}+</div>
                  <div className="text-[10px] text-text-muted">Open Roles</div>
                </div>
                <div className="bg-surface-2 rounded-xl px-[12px] py-[8px] text-center border border-border/60">
                  <div className="text-[13px] font-extrabold text-text">⭐ {company.glassdoor}</div>
                  <div className="text-[10px] text-text-muted">Glassdoor</div>
                </div>
              </div>

              {/* Back to Companies Button */}
              <button
                onClick={handleChangeCompany}
                className="flex items-center gap-[6px] px-[14px] py-[9px] rounded-xl border border-border text-text hover:bg-surface-2 font-medium text-[13px] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-text-secondary" />
                Change Company
              </button>
            </div>
          </div>
        </div>

        {/* ── STEP 2: COMPANY ROLES VIEW ── */}
        {!isAnalysisView && (
          <div className="flex flex-col lg:flex-row items-start gap-[24px]">
            {/* Roles Column */}
            <div className="flex-1 w-full min-w-0">
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
                      className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[11px] text-text-muted hover:text-text"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Roles List */}
              <div className="space-y-[10px]">
                {filteredRoles.map((role) => {
                  const isSelected = selectedRole?.title === role.title;
                  return (
                    <div key={role.title} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => selectRole(role)}
                        className={`w-full text-left p-[18px] rounded-2xl border transition-all flex flex-col justify-between gap-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isSelected
                            ? 'bg-text text-bg border-text shadow-md'
                            : 'bg-surface border-border text-text hover:border-primary/40 hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-[12px]">
                          <div>
                            <div className="flex items-center gap-[8px] flex-wrap">
                              <h3
                                className={`text-[15px] font-bold ${
                                  isSelected ? 'text-bg' : 'text-text'
                                }`}
                              >
                                {role.title}
                              </h3>
                              <span
                                className={`text-[10px] font-bold px-[8px] py-[2px] rounded-full ${
                                  isSelected
                                    ? 'bg-white/20 text-bg'
                                    : 'bg-surface-3 text-text-secondary'
                                }`}
                              >
                                {role.level}
                              </span>
                            </div>
                            <p
                              className={`text-[12px] mt-[4px] leading-[18px] ${
                                isSelected ? 'text-bg/80' : 'text-text-secondary'
                              }`}
                            >
                              {role.desc}
                            </p>
                          </div>

                          <div
                            className={`w-[22px] h-[22px] rounded-full border flex items-center justify-center flex-shrink-0 mt-[2px] ${
                              isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'border-border-strong bg-surface-2'
                            }`}
                          >
                            {isSelected && <span className="text-[12px] font-black">✓</span>}
                          </div>
                        </div>

                        {/* Competency badges */}
                        <div className="flex items-center gap-[6px] flex-wrap pt-[8px] border-t border-current/10">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${
                              isSelected ? 'text-bg/60' : 'text-text-muted'
                            }`}
                          >
                            Required Competencies:
                          </span>
                          {role.competencies.map((c) => (
                            <span
                              key={c}
                              className={`text-[10px] font-bold px-[7px] py-[2px] rounded-md uppercase ${
                                isSelected
                                  ? 'bg-white/15 text-bg'
                                  : 'bg-surface-2 text-text-secondary border border-border/80'
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </button>

                      {/* Mobile-Only Action Panel (Right under selected role card) */}
                      {isSelected && (
                        <div className="lg:hidden mt-[10px] mb-[12px] bg-surface-2 border border-primary/40 rounded-2xl p-[18px] animate-slide-up shadow-sm">
                          <div className="flex items-center gap-[10px] mb-[10px]">
                            <div className="w-[32px] h-[32px] rounded-xl bg-primary-light flex items-center justify-center text-primary">
                              <Brain className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-text">
                                {company.name} — {role.title}
                              </div>
                              <div className="text-[11px] text-text-secondary">
                                {role.competencies.length} competencies to analyze
                              </div>
                            </div>
                          </div>

                          {!resumeText.trim() ? (
                            <div className="p-[10px] bg-warning-bg border border-warning/30 rounded-xl mb-[12px] text-[12px] text-warning">
                              <p className="font-semibold mb-[2px]">⚠ Add resume first</p>
                              <Link to="/demo" className="text-primary font-bold underline">
                                ← Click here to paste or upload your resume in Step 1
                              </Link>
                            </div>
                          ) : (
                            <div className="p-[10px] bg-success-bg border border-success/20 rounded-xl mb-[12px] flex items-center gap-[8px] text-[12px] text-success">
                              <CheckCircle className="w-4 h-4 flex-shrink-0" />
                              <span>Resume loaded ({resumeText.split(/\s+/).length} words)</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={handleRunAnalysis}
                            disabled={analyzing || !resumeText.trim()}
                            title={
                              !resumeText.trim()
                                ? 'Add resume first'
                                : 'Run 6-layer deep screening analysis'
                            }
                            className="w-full bg-primary text-white py-[11px] px-[16px] rounded-xl font-bold text-[13px] hover:bg-primary-hover transition-all flex items-center justify-center gap-[8px] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                          >
                            {analyzing ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Analyzing deeply...</span>
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4" />
                                <span>Run Deep AI Analysis</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
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
                      className="text-primary font-semibold text-[12px] underline"
                    >
                      Show all {company.roles.length} roles
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop-Only Sticky Action Panel (Right Side) */}
            <div className="hidden lg:block w-[380px] shrink-0 sticky top-[96px]">
              <div className="bg-surface border border-border rounded-2xl p-[22px] shadow-md">
                <div className="flex items-center gap-[10px] mb-[16px]">
                  <div className="w-[40px] h-[40px] rounded-xl bg-primary-light flex items-center justify-center text-primary flex-shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-[15px]">Target Role Verification</h3>
                    <p className="text-[12px] text-text-secondary">6-Layer Anti-Gaming Engine</p>
                  </div>
                </div>

                {selectedRole ? (
                  <>
                    <div className="p-[14px] bg-surface-2 border border-border rounded-xl mb-[16px]">
                      <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-[2px]">
                        Selected Position
                      </div>
                      <div className="font-extrabold text-text text-[15px]">
                        {company.name} — {selectedRole.title}
                      </div>
                      <div className="text-[12px] text-text-secondary mt-[2px]">
                        Level: <span className="font-semibold text-text">{selectedRole.level}</span>
                      </div>
                      <div className="mt-[10px] pt-[10px] border-t border-border flex items-center justify-between text-[12px]">
                        <span className="text-text-muted">Target Competencies</span>
                        <span className="font-bold text-primary">
                          {selectedRole.competencies.length} to analyze
                        </span>
                      </div>
                    </div>

                    {/* Competency signal tags */}
                    <div className="mb-[16px]">
                      <div className="text-[11px] font-semibold text-text-secondary mb-[6px]">
                        Cognitive layers evaluated:
                      </div>
                      <div className="flex flex-wrap gap-[4px]">
                        {selectedRole.competencies.map((comp) => (
                          <span
                            key={comp}
                            className="text-[11px] font-bold px-[8px] py-[3px] rounded-lg bg-surface-2 border border-border text-text"
                          >
                            {comp.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resume state check */}
                    {!resumeText.trim() ? (
                      <div className="p-[12px] bg-warning-bg border border-warning/30 rounded-xl mb-[16px] text-[12px] text-warning">
                        <div className="font-bold mb-[2px]">⚠ Add resume first</div>
                        <p className="text-[11px] text-warning/90 leading-[16px] mb-[6px]">
                          Resume text is required to benchmark your competencies against {company.name}&lsquo;s hiring standards.
                        </p>
                        <Link
                          to="/demo"
                          className="inline-flex items-center gap-[4px] text-primary font-bold text-[12px] underline"
                        >
                          <FileText className="w-3.5 h-3.5" /> Go to Step 1 &amp; Add Resume
                        </Link>
                      </div>
                    ) : (
                      <div className="p-[12px] bg-success-bg border border-success/25 rounded-xl mb-[16px] flex items-center gap-[10px] text-[12px] text-success">
                        <CheckCircle className="w-[18px] h-[18px] flex-shrink-0" />
                        <div>
                          <div className="font-bold">Resume verified in state</div>
                          <div className="text-[11px] text-success/80">
                            {resumeText.split(/\s+/).length} words ready for multi-layer scan
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={handleRunAnalysis}
                      disabled={analyzing || !resumeText.trim()}
                      title={
                        !resumeText.trim()
                          ? 'Add resume first'
                          : 'Run 6-layer deep screening analysis'
                      }
                      className="w-full bg-primary text-white py-[12px] px-[20px] rounded-xl font-bold text-[14px] hover:bg-primary-hover transition-all flex items-center justify-center gap-[8px] disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Analyzing deeply...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          <span>Run Deep AI Analysis</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-[36px] px-[16px] bg-surface-2 border border-dashed border-border rounded-xl">
                    <Briefcase className="w-[32px] h-[32px] text-text-muted mx-auto mb-[10px]" />
                    <div className="text-[14px] font-bold text-text mb-[4px]">
                      Select a role first
                    </div>
                    <p className="text-[12px] text-text-secondary mb-[16px]">
                      Click any role from {company.name}&lsquo;s list on the left to inspect requirements and run AI screening.
                    </p>
                    <button
                      disabled
                      title="Select a role first"
                      className="w-full bg-surface-3 text-text-muted py-[11px] px-[16px] rounded-xl font-bold text-[13px] opacity-50 cursor-not-allowed"
                    >
                      Select a role first
                    </button>
                  </div>
                )}

                {/* Staged Phase Loader (Inside Action Panel) */}
                {analyzing && (
                  <div className="mt-[16px] p-[12px] bg-ai-light border border-ai/30 rounded-xl text-center">
                    <div className="text-[12px] font-bold text-ai animate-pulse">
                      {analysisPhase || 'Scanning resume signals...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: ANALYSIS RESULTS VIEW ── */}
        {isAnalysisView && result && selectedRole && (
          <div className="max-w-[960px] mx-auto animate-fade-in">
            {/* Score hero */}
            <div
              className={`bg-surface border rounded-2xl p-[32px] mb-[20px] text-center shadow-md ${
                result.score >= 80
                  ? 'border-success/30'
                  : result.score >= 55
                  ? 'border-warning/30'
                  : 'border-danger/30'
              }`}
            >
              <div className="flex items-center justify-center gap-[10px] mb-[8px]">
                <div className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">
                  {company.name}
                </div>
                <div className="w-[3px] h-[3px] rounded-full bg-text-secondary" />
                <div className="text-[12px] font-semibold text-text-secondary">
                  {selectedRole.title}
                </div>
                <div className="w-[3px] h-[3px] rounded-full bg-text-secondary" />
                <div className="text-[11px] text-text-secondary">{selectedRole.level}</div>
              </div>
              <div className={`text-[80px] font-extrabold ${scoreColor} leading-none mb-[4px]`}>
                {result.score}
                <span className="text-[36px] opacity-40">%</span>
              </div>
              <div className="text-[22px] font-bold text-text mb-[6px]">{verdict}</div>
              <div className="text-[13px] text-text-secondary mb-[18px]">{selectedRole.desc}</div>

              {/* Anti-gaming summary badge */}
              {result.breakdown.some((b) => b.analysis.antiGamingFlag) && (
                <div className="inline-flex items-center gap-[8px] px-[14px] py-[7px] bg-warning-bg border border-warning/30 rounded-xl text-[12px] font-semibold text-warning mb-[12px]">
                  <AlertTriangle className="w-[13px] h-[13px]" />
                  TalentLens™ detected keyword stuffing in{' '}
                  {result.breakdown.filter((b) => b.analysis.antiGamingFlag).length} competency
                  area(s) — authenticity penalty applied
                </div>
              )}

              <div className="flex justify-center gap-[8px] flex-wrap">
                {result.breakdown.map((b) => {
                  const cfg = STATUS_CONFIG[b.analysis.status] || STATUS_CONFIG.absent;
                  return (
                    <span
                      key={b.competency}
                      className={`text-[11px] font-bold px-[10px] py-[4px] rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border} flex items-center gap-[4px]`}
                    >
                      {b.analysis.antiGamingFlag && <AlertTriangle className="w-[9px] h-[9px]" />}
                      {b.analysis.status === 'expert'
                        ? '✓✓'
                        : b.analysis.status === 'strong'
                        ? '✓'
                        : b.analysis.status === 'working'
                        ? '~'
                        : '✗'}{' '}
                      {b.competency.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 6-Layer analysis legend */}
            <div className="bg-surface border border-border rounded-2xl p-[16px] mb-[20px] shadow-sm">
              <div className="flex flex-wrap gap-[8px] items-center">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wide mr-[4px]">
                  TalentLens™ 6-Layer Analysis:
                </span>
                {[
                  'L1 Keywords',
                  'L2 Context',
                  'L3 Production Depth',
                  'L4 Quantified Impact',
                  'L5 Cognitive Screening',
                  'L6 Progression',
                ].map((layer, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-[8px] py-[3px] rounded-full bg-primary-light border border-primary/20 text-primary"
                  >
                    {layer}
                  </span>
                ))}
                <span className="text-[11px] text-text-muted ml-auto">
                  Score is weighted — not just keyword count
                </span>
              </div>
            </div>

            {/* Company context */}
            <div className="bg-surface border border-border rounded-2xl p-[20px] mb-[20px] shadow-sm">
              <h3 className="font-bold text-text text-[15px] mb-[14px] flex items-center gap-[8px]">
                <Building2 className="w-[15px] h-[15px] text-primary" /> Company Hiring Context —{' '}
                {company.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
                {[
                  {
                    label: 'Hires 2024',
                    value: company.hiring2024.toLocaleString(),
                    sub: `${TREND_ICON[company.trend]} from ${company.hiring2023.toLocaleString()} (2023)`,
                    subColor: TREND_COLOR[company.trend],
                  },
                  {
                    label: 'Open Roles',
                    value: `${company.openRoles}+`,
                    sub: company.industry,
                  },
                  {
                    label: 'Avg Package',
                    value: company.avgPackage,
                    sub: company.tier,
                  },
                  {
                    label: 'Glassdoor',
                    value: `⭐ ${company.glassdoor}`,
                    sub: 'Employee Rating',
                  },
                ].map(({ label, value, sub, subColor }) => (
                  <div key={label} className="bg-surface-2 rounded-xl p-[12px] text-center">
                    <div className="text-[10px] text-text-muted mb-[2px]">{label}</div>
                    <div className="text-[17px] font-bold text-text">{value}</div>
                    <div className={`text-[11px] mt-[1px] ${subColor || 'text-text-secondary'}`}>
                      {sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deep skill breakdown */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[20px] shadow-sm">
              <h3 className="font-bold text-text text-[15px] mb-[18px] flex items-center gap-[8px]">
                <Target className="w-[15px] h-[15px] text-primary" /> 6-Layer Competency
                Intelligence Report
              </h3>
              <div className="space-y-[14px]">
                {result.breakdown.map((b) => {
                  const cfg = STATUS_CONFIG[b.analysis.status] || STATUS_CONFIG.absent;
                  return (
                    <div
                      key={b.competency}
                      className={`p-[16px] rounded-xl border ${cfg.bg} ${cfg.border}`}
                    >
                      <div className="flex items-center justify-between mb-[8px]">
                        <div className="flex items-center gap-[8px]">
                          <span className={`text-[14px] font-extrabold uppercase ${cfg.color}`}>
                            {b.competency}
                          </span>
                          <span className="text-[10px] bg-surface/60 text-text-secondary px-[7px] py-[2px] rounded-full font-medium">
                            Required: {b.reqLevel}
                          </span>
                          {b.analysis.antiGamingFlag && (
                            <span className="text-[10px] bg-warning-bg text-warning px-[7px] py-[2px] rounded-full font-bold border border-warning/20">
                              ⚠ Gaming Detected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-[8px]">
                          <span className={`text-[12px] font-bold ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-[11px] text-text-muted">
                            ({b.analysis.confidence}% confidence)
                          </span>
                        </div>
                      </div>

                      {/* 5-layer score bars */}
                      <div className="grid grid-cols-5 gap-[4px] mb-[10px]">
                        {[
                          { label: 'L1 Keywords', val: b.analysis.layerScores.l1 },
                          { label: 'L2 Context', val: b.analysis.layerScores.l2 },
                          { label: 'L3 Depth', val: b.analysis.layerScores.l3 },
                          { label: 'L4 Impact', val: b.analysis.layerScores.l4 },
                          { label: 'L5 Auth', val: b.analysis.layerScores.l5 },
                        ].map((layer) => (
                          <div key={layer.label} className="text-center">
                            <div className="h-[4px] bg-surface-3 rounded-full mb-[3px]">
                              <div
                                className={`h-full rounded-full ${
                                  layer.val > 60
                                    ? 'bg-success'
                                    : layer.val > 30
                                    ? 'bg-warning'
                                    : 'bg-danger'
                                }`}
                                style={{ width: `${Math.max(0, Math.min(100, layer.val))}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-text-muted">{layer.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Context sentences */}
                      {b.analysis.contextSentences.length > 0 && (
                        <div className="mb-[8px] p-[10px] bg-surface/60 rounded-lg border border-border/50">
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-[4px]">
                            Verified context sentences:
                          </div>
                          {b.analysis.contextSentences.slice(0, 2).map((s, i) => (
                            <p
                              key={i}
                              className="text-[11px] text-text-secondary italic leading-[16px]"
                            >
                              &ldquo;{s.length > 120 ? s.substring(0, 120) + '...' : s}&rdquo;
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Improvement Plan */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[28px] shadow-sm">
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full flex items-center justify-between mb-[2px]"
              >
                <h3 className="font-bold text-text text-[15px] flex items-center gap-[8px]">
                  <Lightbulb className="w-[15px] h-[15px] text-warning" /> TalentLens™ Career
                  Acceleration Plan ({result.plans.length} actions)
                </h3>
                {showSuggestions ? (
                  <ChevronUp className="w-[15px] h-[15px] text-text-secondary" />
                ) : (
                  <ChevronDown className="w-[15px] h-[15px] text-text-secondary" />
                )}
              </button>
              {showSuggestions && (
                <div className="mt-[16px] space-y-[14px]">
                  {result.plans.map((plan, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-[16px] ${
                        plan.priority === 'critical'
                          ? 'bg-danger-bg border-danger/25'
                          : plan.priority === 'high'
                          ? 'bg-warning-bg border-warning/25'
                          : 'bg-surface-2 border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-[8px]">
                        <div className="flex items-center gap-[8px]">
                          <span
                            className={`text-[10px] font-black uppercase px-[8px] py-[2px] rounded-full tracking-wide ${
                              plan.priority === 'critical'
                                ? 'bg-danger text-white'
                                : plan.priority === 'high'
                                ? 'bg-warning text-bg'
                                : 'bg-primary-light text-primary border border-primary/20'
                            }`}
                          >
                            {plan.priority}
                          </span>
                          <h4 className="font-bold text-text text-[13px]">{plan.title}</h4>
                        </div>
                        <span className="text-[10px] text-text-muted whitespace-nowrap ml-[8px] bg-surface px-[7px] py-[2px] rounded-full">
                          {plan.timeframe}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-secondary leading-[19px] mb-[10px]">
                        {plan.detail}
                      </p>
                      <div className="space-y-[3px]">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-[4px]">
                          Curated resources:
                        </div>
                        {plan.resources.map((r, ri) => (
                          <div key={ri} className="flex items-start gap-[6px]">
                            <span className="text-primary font-bold text-[11px] flex-shrink-0 mt-[1px]">
                              {ri + 1}.
                            </span>
                            <p className="text-[11px] text-text-secondary leading-[16px]">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Market Intelligence Report */}
            <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[28px] shadow-sm">
              <div className="flex items-start justify-between mb-[18px]">
                <div>
                  <h3 className="font-bold text-text text-[15px] mb-[4px] flex items-center gap-[8px]">
                    <Terminal className="w-[15px] h-[15px] text-primary" />
                    Market Intelligence &amp; Build Verification Report
                  </h3>
                  <p className="text-[12px] text-text-secondary">
                    Deep research engine — cross-references your actual build usage against 2024-25 market standards.
                  </p>
                </div>
                <div
                  className={`px-[12px] py-[6px] rounded-xl text-[11px] font-black uppercase tracking-wide flex-shrink-0 ml-[12px] ${
                    result.marketIntel.marketPosition === 'Industry Leader'
                      ? 'bg-success/15 text-success border border-success/25'
                      : result.marketIntel.marketPosition === 'Market Current'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : result.marketIntel.marketPosition === 'Needs Modernization'
                      ? 'bg-warning/10 text-warning border border-warning/20'
                      : 'bg-danger/10 text-danger border border-danger/20'
                  }`}
                >
                  {result.marketIntel.marketPosition}
                </div>
              </div>

              {/* 4 metric scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] mb-[18px]">
                {[
                  {
                    label: 'Overall Market Fit',
                    val: result.marketIntel.overallMarketFit,
                    sub: 'vs 2024-25 benchmark',
                    color:
                      result.marketIntel.overallMarketFit >= 70
                        ? 'text-success'
                        : result.marketIntel.overallMarketFit >= 45
                        ? 'text-warning'
                        : 'text-danger',
                  },
                  {
                    label: 'Tech Currency',
                    val: result.marketIntel.techCurrencyScore,
                    sub: 'Modern vs outdated stack',
                    color:
                      result.marketIntel.techCurrencyScore >= 70
                        ? 'text-success'
                        : result.marketIntel.techCurrencyScore >= 45
                        ? 'text-warning'
                        : 'text-danger',
                  },
                  {
                    label: 'Build Authenticity',
                    val: result.marketIntel.buildAuthenticity,
                    sub: 'Deployment, tests, monitoring',
                    color:
                      result.marketIntel.buildAuthenticity >= 60
                        ? 'text-success'
                        : result.marketIntel.buildAuthenticity >= 40
                        ? 'text-warning'
                        : 'text-danger',
                  },
                  {
                    label: 'Fundamental Depth',
                    val: result.marketIntel.fundamentalDepth,
                    sub: 'Production patterns used',
                    color:
                      result.marketIntel.fundamentalDepth >= 60
                        ? 'text-success'
                        : result.marketIntel.fundamentalDepth >= 35
                        ? 'text-warning'
                        : 'text-danger',
                  },
                ].map((m) => (
                  <div key={m.label} className="bg-surface-2 rounded-xl p-[12px] text-center">
                    <div className={`text-[28px] font-extrabold ${m.color}`}>
                      {m.val}
                      <span className="text-[14px] opacity-50">%</span>
                    </div>
                    <div className="text-[11px] font-bold text-text mt-[2px]">{m.label}</div>
                    <div className="text-[10px] text-text-muted">{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Verdict */}
              <div className="p-[14px] bg-surface-2 rounded-xl border border-border mb-[18px]">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wide mb-[4px]">
                  Build Research Verdict
                </div>
                <p className="text-[13px] text-text leading-[20px]">
                  {result.marketIntel.buildVerdict}
                </p>
              </div>

              {/* Per-competency findings */}
              <div className="space-y-[10px] mb-[16px]">
                <div className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
                  Per-Competency Market Research
                </div>
                {result.marketIntel.findings.map((f, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-[13px] ${
                      f.status === 'cutting-edge'
                        ? 'bg-success/5 border-success/20'
                        : f.status === 'current'
                        ? 'bg-primary/5 border-primary/15'
                        : f.status === 'dated'
                        ? 'bg-warning/5 border-warning/20'
                        : 'bg-danger/5 border-danger/20'
                    }`}
                  >
                    <div className="flex items-center gap-[8px] mb-[6px]">
                      <span className="text-[14px]">{f.icon}</span>
                      <span className="text-[12px] font-black uppercase tracking-wide text-text">
                        {f.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-[7px] py-[2px] rounded-full ml-auto ${
                          f.status === 'cutting-edge'
                            ? 'bg-success/15 text-success'
                            : f.status === 'current'
                            ? 'bg-primary/10 text-primary'
                            : f.status === 'dated'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {f.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-[12px] text-text-secondary leading-[18px] mb-[6px]">
                      {f.finding}
                    </p>
                    {f.evidence.length > 0 && (
                      <div className="flex flex-wrap gap-[4px]">
                        {f.evidence.map((ev, ei) => (
                          <span
                            key={ei}
                            className="text-[10px] font-medium px-[7px] py-[2px] rounded-full bg-surface border border-border text-text-muted"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-[6px] text-[10px] text-text-muted italic">
                      {f.marketContext}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 Action Buttons */}
            <div className="flex flex-wrap gap-[12px] justify-center pt-[10px] pb-[32px]">
              <button
                type="button"
                onClick={handleBackToRoles}
                className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl bg-primary text-white font-semibold text-[13px] hover:bg-primary-hover transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Roles
              </button>
              <button
                type="button"
                onClick={handleChangeCompany}
                className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl border border-border text-text hover:bg-surface-2 font-medium text-[13px] transition-all"
              >
                <Building2 className="w-4 h-4 text-text-secondary" /> Change Company
              </button>
              <button
                type="button"
                onClick={handleNewResume}
                className="flex items-center gap-[8px] px-[20px] py-[10px] rounded-xl border border-border text-text-secondary hover:text-text hover:bg-surface-2 font-medium text-[13px] transition-all"
              >
                <RefreshCw className="w-4 h-4" /> New Resume
              </button>
            </div>
          </div>
        )}

        {/* 4-Stat Strip at bottom (Preserved) */}
        <div className="mt-[56px] grid grid-cols-2 md:grid-cols-4 gap-[14px] border-t border-border pt-[40px]">
          {[
            {
              icon: Building2,
              value: `${COMPANIES.length}`,
              label: 'Companies',
              sub: 'FAANG to Deep Tech',
            },
            {
              icon: Briefcase,
              value: `${COMPANIES.reduce((a, c) => a + c.roles.length, 0)}+`,
              label: 'Specific Roles',
              sub: 'Real 2024-25 requirements',
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
