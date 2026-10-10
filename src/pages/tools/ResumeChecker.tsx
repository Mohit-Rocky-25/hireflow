// ============================================================
// HireFlow — ATS Resume Roaster (Job Fit & Resume Improvement)
// Deterministic single source of truth with Quick Roast & Deep Roaster
// ============================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  Sparkles,
  RotateCcw,
  Zap,
  Compass,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Bookmark,
  GraduationCap,
  Building2,
  Info,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageNav } from '../../components/common/PageNav';
import { useProfile } from '../../features/suite/profile/ProfileContext';
import { QuickSummaryCard } from '../../features/suite/components/QuickSummaryCard';
import { buildQuickSummary } from '../../features/suite/engine/quickSummary';
import { SimulationFacts } from '../../features/suite/engine/simulateFix';
import { parseResumeFile } from '../../features/ats/fileParser';
import {
  AtsInputSection,
  TargetTier,
  ExperienceLevel,
} from '../../features/ats/components/AtsInputSection';
import { runAtsEngine, AtsEngineResult, TargetTierId, ExperienceLevelId } from '../../features/ats/engine';
import { ScoreHeader } from '../../features/ats/components/ScoreHeader';
import { FixTheseFirst } from '../../features/ats/components/FixTheseFirst';
import { TabBar, ReportTabId } from '../../features/ats/components/TabBar';
import { OverviewTab } from '../../features/ats/components/OverviewTab';
import { SkillsTab } from '../../features/ats/components/SkillsTab';
import { AuditTab } from '../../features/ats/components/AuditTab';
import { LearningPathTab } from '../../features/ats/components/LearningPathTab';
import { DebugDrawer } from '../../features/ats/components/DebugDrawer';
import { useTalentLensStore, DEMO_TALENTLENS_RESUME } from '../demo/useTalentLensStore';
import { careers, DataBadge } from '../../careers-core';
import { WordLimitSource } from '../../config/limits';

const STAGED_MESSAGES = [
  'Reading resume tokens & structural sections...',
  'Extracting job description requirements...',
  'Validating word boundaries & verifying evidence...',
  'Calculating 7-category weights & penalty metrics...',
  'Synthesizing grounded recruiter intelligence...',
];

export function ResumeChecker() {
  const [searchParams] = useSearchParams();
  const { profile, saveFromResumeText, openDrawer } = useProfile();
  const [showFullReport, setShowFullReport] = useState(true);

  const queryCompanyId = searchParams.get('company');
  const queryRoleTitle = searchParams.get('role');
  const isFromTalentLens = Boolean(queryCompanyId && queryRoleTitle);

  const initialStoredResume = useTalentLensStore.getState().resumeText;
  const initialStoredFileName = useTalentLensStore.getState().resumeFileName;

  const [resumeText, setResumeText] = useState<string>(() => {
    if (initialStoredResume) return initialStoredResume;
    if (isFromTalentLens) return DEMO_TALENTLENS_RESUME.text;
    return '';
  });

  const [jobText, setJobText] = useState<string>(() => {
    if (queryCompanyId && queryRoleTitle) {
      const comp = careers.companies.get(queryCompanyId);
      const roles = comp ? careers.roles.forCompany(comp.id) : [];
      const role = roles.find((r) => r.title.toLowerCase() === queryRoleTitle.toLowerCase());
      if (comp && role) {
        return [
          `Company: ${comp.name} (${comp.marketTier} Tier)`,
          `Target Position: ${role.title} (${role.level})`,
          ``,
          `Role Description:`,
          `Engineering role at ${comp.name} within ${comp.marketSegment} segment across ${comp.indiaOffices.join(', ')}.`,
          ``,
          `Core Competency Requirements:`,
          ...Object.entries(role.competencies).map(([c, lvl]) => `- ${c.toUpperCase()}: Required proficiency level "${lvl}"`),
          ``,
          `Industry: ${comp.marketSegment}`,
          `Headquarters: ${comp.headquarters || 'India'}`,
          `Compensation Benchmark: Competitive Market Band`,
        ].join('\n');
      }
    }
    return '';
  });

  const [resumeFileName, setResumeFileName] = useState<string | null>(() => {
    if (initialStoredResume) return initialStoredFileName || DEMO_TALENTLENS_RESUME.fileName;
    if (isFromTalentLens) return DEMO_TALENTLENS_RESUME.fileName;
    return null;
  });

  const [jobFileName, setJobFileName] = useState<string | null>(() => {
    if (queryCompanyId && queryRoleTitle) {
      const comp = careers.companies.get(queryCompanyId);
      if (comp) {
        return `${comp.name}_${queryRoleTitle.replace(/\s+/g, '_')}_Requirements.txt`;
      }
    }
    return null;
  });

  const [resumeSource, setResumeSource] = useState<WordLimitSource>(() => {
    if (initialStoredResume || isFromTalentLens) return 'talentlens';
    return undefined;
  });

  const [jobSource, setJobSource] = useState<WordLimitSource>(() => {
    if (isFromTalentLens) return 'prefilled';
    return undefined;
  });

  const [resumePageCount, setResumePageCount] = useState<number | undefined>();
  const [jobPageCount, setJobPageCount] = useState<number | undefined>();
  const [targetTier, setTargetTier] = useState<TargetTier>('Auto');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Auto');
  const [fileError, setFileError] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [stagedStageIndex, setStagedStageIndex] = useState(0);
  const [isFileExtracting, setIsFileExtracting] = useState(false);
  const [engineResult, setEngineResult] = useState<AtsEngineResult | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTabId>('overview');
  const [presentationMode, setPresentationMode] = useState<'deep' | 'quick'>('deep');

  // Fresher / Campus Program scan target selection
  const [selectedCampusCompanyId, setSelectedCampusCompanyId] = useState<string>('');
  const [selectedCampusProgramId, setSelectedCampusProgramId] = useState<string>('');

  const campusCompanies = useMemo(() => {
    const progs = careers.programs.query();
    const companyIds = Array.from(new Set(progs.map((p) => p.companyId)));
    return companyIds
      .map((id) => careers.companies.get(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const campusProgramsForSelectedCompany = useMemo(() => {
    if (!selectedCampusCompanyId) return [];
    return careers.programs.forCompany(selectedCampusCompanyId);
  }, [selectedCampusCompanyId]);

  const activeCampusProgram = useMemo(() => {
    if (!selectedCampusProgramId) return null;
    return careers.programs.get(selectedCampusProgramId) || null;
  }, [selectedCampusProgramId]);

  const handleSelectCampusProgram = (progId: string) => {
    setSelectedCampusProgramId(progId);
    const prog = careers.programs.get(progId);
    if (!prog) return;
    const comp = careers.companies.get(prog.companyId);
    const compKeys = Object.keys(prog.competencyProfile || {});
    const ctcStr = prog.compensation?.fixedMinLPA
      ? `₹${prog.compensation.fixedMinLPA}${prog.compensation.fixedMaxLPA ? ` - ₹${prog.compensation.fixedMaxLPA}` : ''} LPA`
      : 'Competitive Campus Package';
    const rounds = prog.selectionProcess.map((s) => s.stage).join(' → ') || 'OA → Technical → HR';

    const generatedJD = [
      `Target Campus Program: ${prog.programName} (${prog.roleTitle})`,
      `Company: ${comp?.name || prog.companyId} (${comp?.marketTier || 'Tier A'} Tier)`,
      `Campus Category: ${prog.campusCategory.toUpperCase()}`,
      `Eligible Branches: ${prog.eligibility.branchCodes.join(', ') || 'Engineering & Technology'}`,
      `Academic Cutoff: ${prog.eligibility.minCgpa ? `${prog.eligibility.minCgpa} CGPA` : 'No hard cutoff'} · ${prog.eligibility.backlogPolicy || 'Zero active backlogs'}`,
      `Compensation: ${ctcStr}`,
      `Selection Funnel: ${rounds}`,
      ``,
      `Core Competency Requirements:`,
      ...compKeys.map((k) => `- ${k.toUpperCase()}: Required proficiency "${prog.competencyProfile[k]}"`),
      ``,
      `Role Description & Screening Emphasis:`,
      `Campus engineering intake for ${comp?.name || prog.companyId}. Evaluation emphasizes foundational problem-solving, algorithmic reasoning, and clean production code.`,
      `First round focus: ${prog.selectionProcess[0]?.stage || 'Online Assessment'} (${prog.selectionProcess[0]?.topics?.join(', ') || 'DSA & CS Core'}).`,
    ].join('\n');

    setJobText(generatedJD);
    setJobFileName(`${comp?.name || prog.companyId}_${prog.programName.replace(/\s+/g, '_')}_2026.txt`);
    setJobSource('prefilled');
    setFileError(null);
  };

  const headerRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Sync from TalentLens URL query parameters & ensure store has resume loaded
  useEffect(() => {
    const compId = searchParams.get('company');
    const rTitle = searchParams.get('role');
    if (compId && rTitle) {
      const stored = useTalentLensStore.getState().resumeText;
      const storedFile = useTalentLensStore.getState().resumeFileName;
      if (!resumeText) {
        const textToUse = stored || DEMO_TALENTLENS_RESUME.text;
        const fileToUse = storedFile || DEMO_TALENTLENS_RESUME.fileName;
        setResumeText(textToUse);
        setResumeFileName(fileToUse);
        setResumeSource('talentlens');
        if (!stored) {
          useTalentLensStore.getState().setResume(textToUse, fileToUse);
        }
      } else if (!resumeSource) {
        setResumeSource('talentlens');
      }

      if (!jobText) {
        const comp = careers.companies.get(compId);
        const roles = comp ? careers.roles.forCompany(comp.id) : [];
        const role = roles.find((r) => r.title.toLowerCase() === rTitle.toLowerCase());
        if (comp && role) {
          const generatedJD = [
            `Company: ${comp.name} (${comp.marketTier} Tier)`,
            `Target Position: ${role.title} (${role.level})`,
            ``,
            `Role Description:`,
            `Engineering role at ${comp.name} within ${comp.marketSegment} segment across ${comp.indiaOffices.join(', ')}.`,
            ``,
            `Core Competency Requirements:`,
            ...Object.entries(role.competencies).map(([c, lvl]) => `- ${c.toUpperCase()}: Required proficiency level "${lvl}"`),
            ``,
            `Industry: ${comp.marketSegment}`,
            `Headquarters: ${comp.headquarters || 'India'}`,
            `Compensation Benchmark: Competitive Market Band`,
          ].join('\n');

          setJobText(generatedJD);
          setJobFileName(`${comp.name}_${role.title.replace(/\s+/g, '_')}_Requirements.txt`);
          setJobSource('prefilled');
        }
      }
    } else {
      const stored = useTalentLensStore.getState().resumeText;
      const storedFile = useTalentLensStore.getState().resumeFileName;
      if (!resumeText && stored) {
        setResumeText(stored);
        setResumeFileName(storedFile || DEMO_TALENTLENS_RESUME.fileName);
        setResumeSource('talentlens');
      }
    }
  }, [searchParams, resumeText, jobText, resumeSource]);

  useEffect(() => {
    if (!isScanning) {
      setStagedStageIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setStagedStageIndex((prev) => (prev + 1) % STAGED_MESSAGES.length);
    }, 600);
    return () => clearInterval(timer);
  }, [isScanning]);

  const handleFileUpload = async (file: File, type: 'resume' | 'job') => {
    setIsFileExtracting(true);
    setFileError(null);
    try {
      const res = await parseResumeFile(file);
      if (!res.success) {
        setFileError(res.error || 'Failed to read document.');
        return;
      }
      if (type === 'resume') {
        setResumeText(res.text);
        setResumeFileName(res.fileName);
        setResumePageCount(res.pageCount);
        setResumeSource('upload');
      } else {
        setJobText(res.text);
        setJobFileName(res.fileName);
        setJobPageCount(res.pageCount);
        setJobSource('upload');
      }
    } catch (err: any) {
      setFileError(err?.message || 'Error processing uploaded file.');
    } finally {
      setIsFileExtracting(false);
    }
  };

  const handleClearResume = () => {
    setResumeText('');
    setResumeFileName(null);
    setResumePageCount(undefined);
    setResumeSource(undefined);
    setFileError(null);
  };

  const handleClearJob = () => {
    setJobText('');
    setJobFileName(null);
    setJobPageCount(undefined);
    setJobSource(undefined);
    setFileError(null);
    setSelectedCampusCompanyId('');
    setSelectedCampusProgramId('');
  };

  const handleTabChange = (tab: ReportTabId) => {
    setActiveTab(tab);
    if (tabBarRef.current) {
      tabBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleImportTalentLensResume = (text: string, fileName: string) => {
    setResumeText(text);
    setResumeFileName(fileName || DEMO_TALENTLENS_RESUME.fileName);
    setResumePageCount(1);
    setResumeSource('talentlens');
    setFileError(null);
  };

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jobText.trim()) return;

    setIsScanning(true);
    setActiveTab('overview');

    const tierMap: Record<string, TargetTierId> = {
      'Top Product': 'top_product',
      'Startup / Unicorn': 'startup_unicorn',
      'Service / MNC': 'service_mnc',
    };
    const levelMap: Record<string, ExperienceLevelId> = {
      Fresher: 'fresher',
      '1-3 yrs': '1-3',
      '3-6 yrs': '3-6',
      '6+ yrs': '6+',
    };

    const mappedTier = tierMap[targetTier] || 'auto';
    const mappedLevel = levelMap[experienceLevel] || 'auto';

    setTimeout(() => {
      try {
        const response = runAtsEngine(resumeText, jobText, {
          tier: mappedTier,
          level: mappedLevel,
          resumeSource,
          jdSource: jobSource,
        });

        if (!response.success) {
          setFileError(response.message);
          return;
        }

        setEngineResult(response.result);

        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          headerRef.current?.focus();
        }, 150);
      } catch (err: any) {
        setFileError(err?.message || 'Unexpected analysis error occurred.');
      } finally {
        setIsScanning(false);
      }
    }, 400);
  };

  const handleTryAnotherJob = () => {
    setJobText('');
    setJobFileName(null);
    setJobPageCount(undefined);
    setEngineResult(null);
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canonical = engineResult?.canonicalResult;

  const quickSummary = React.useMemo(() => {
    if (!engineResult) return null;
    const facts: SimulationFacts = {
      skillResults: engineResult.skillResults,
      baseScore: engineResult.score,
      wordCount: engineResult.audit.wordCount,
    };
    return buildQuickSummary(facts, profile);
  }, [engineResult, profile]);

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-16 px-4 sm:px-6 md:px-8 relative">
      {/* Top Navigation */}
      <div className="print:hidden">
        <PageNav onBack={engineResult ? () => handleTryAnotherJob() : undefined} />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Hero Title with Updated Positioning (STAGE 9) */}
        <div className="text-center max-w-3xl mx-auto mb-6 mt-2 print:mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> ATS Resume Roaster · Job Fit &amp; Resume Improvement
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            How well does this resume match,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai">
              and what should I improve?
            </span>
          </h1>
          <p className="text-text-secondary text-[16px] leading-relaxed max-w-2xl mx-auto">
            Zero hallucinations. Verifiable citations. Calibrated against real engineering hiring bars. Directional diagnostic evaluation.
          </p>
        </div>

        {/* Input Panel Section */}
        {!engineResult && (
          <div className="space-y-6">
            {/* Quick Load Campus Hiring Target Selector */}
            <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      No JD? Scan against a 2026-27 Campus Hiring Program
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Target verified engineering fresher criteria across {campusCompanies.length} top employers.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start sm:self-auto">
                  60 Verified Campus Programs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5">
                    1. Select Employer:
                  </label>
                  <select
                    value={selectedCampusCompanyId}
                    onChange={(e) => {
                      const compId = e.target.value;
                      setSelectedCampusCompanyId(compId);
                      const progs = careers.programs.forCompany(compId);
                      if (progs.length > 0) {
                        handleSelectCampusProgram(progs[0].id);
                      } else {
                        setSelectedCampusProgramId('');
                      }
                    }}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="">-- Choose Company --</option>
                    {campusCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.marketSegment})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1.5">
                    2. Select Campus Program:
                  </label>
                  <select
                    value={selectedCampusProgramId}
                    onChange={(e) => handleSelectCampusProgram(e.target.value)}
                    disabled={!selectedCampusCompanyId || campusProgramsForSelectedCompany.length === 0}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                  >
                    <option value="">
                      {selectedCampusCompanyId
                        ? campusProgramsForSelectedCompany.length > 0
                          ? '-- Choose Program --'
                          : 'No campus programs found'
                        : 'Select employer first'}
                    </option>
                    {campusProgramsForSelectedCompany.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.programName} ({p.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* "How this program reads your resume" Note */}
              {activeCampusProgram && (
                <div className="mt-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-500/15">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5 text-xs">
                      <Info className="w-4 h-4 shrink-0" />
                      How {careers.companies.get(activeCampusProgram.companyId)?.name} reads your resume for {activeCampusProgram.programName}
                    </span>
                    <DataBadge entity={activeCampusProgram} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-1 text-[11px]">
                    <div className="bg-surface-2 p-2.5 rounded-lg border border-border">
                      <span className="text-text-muted block text-[10px] uppercase font-bold">Academic Gate</span>
                      <span className="font-semibold text-foreground text-xs">
                        {activeCampusProgram.eligibility.minCgpa ? `≥ ${activeCampusProgram.eligibility.minCgpa} CGPA` : 'No hard cutoff'}
                      </span>
                      <div className="text-[10px] text-text-secondary truncate mt-0.5">
                        {activeCampusProgram.eligibility.backlogPolicy || 'Zero active backlogs'}
                      </div>
                    </div>
                    <div className="bg-surface-2 p-2.5 rounded-lg border border-border">
                      <span className="text-text-muted block text-[10px] uppercase font-bold">First Round</span>
                      <span className="font-semibold text-foreground text-xs truncate block">
                        {activeCampusProgram.selectionProcess[0]?.stage || 'Online Assessment'}
                      </span>
                      <div className="text-[10px] text-text-secondary truncate mt-0.5">
                        {activeCampusProgram.selectionProcess[0]?.topics?.slice(0, 3).join(', ') || 'DSA & CS Core'}
                      </div>
                    </div>
                    <div className="bg-surface-2 p-2.5 rounded-lg border border-border">
                      <span className="text-text-muted block text-[10px] uppercase font-bold">Compensation</span>
                      <span className="font-semibold text-emerald-400 text-xs">
                        {activeCampusProgram.compensation?.fixedMinLPA ? `₹${activeCampusProgram.compensation.fixedMinLPA} LPA` : 'Standard Band'}
                      </span>
                      <div className="text-[10px] text-text-secondary truncate mt-0.5">
                        {activeCampusProgram.campusCategory.toUpperCase()} Category
                      </div>
                    </div>
                  </div>

                  <p className="text-text-secondary leading-relaxed pt-1">
                    <strong className="text-foreground">Recruiter screening criteria:</strong> ATS parsers and campus evaluators filter on clean branch eligibility ({activeCampusProgram.eligibility.branchCodes.join(', ')}), explicit programming language tokens ({Object.keys(activeCampusProgram.competencyProfile).join(', ')}), verifiable GitHub/production project links, and zero unaddressed backlogs.
                  </p>
                </div>
              )}
            </div>

            <AtsInputSection
              resumeText={resumeText}
            jobText={jobText}
            resumeFileName={resumeFileName}
            jobFileName={jobFileName}
            resumePageCount={resumePageCount}
            jobPageCount={jobPageCount}
            targetTier={targetTier}
            experienceLevel={experienceLevel}
            isScanning={isScanning}
            isFileExtracting={isFileExtracting}
            stagedStageIndex={stagedStageIndex}
            stagedMessages={STAGED_MESSAGES}
            fileError={fileError}
            resumeSource={resumeSource}
            jobSource={jobSource}
            onResumeTextChange={(txt) => {
              setResumeText(txt);
              setFileError(null);
            }}
            onJobTextChange={(txt) => {
              setJobText(txt);
              setFileError(null);
            }}
            onTargetTierChange={setTargetTier}
            onExperienceLevelChange={setExperienceLevel}
            onFileUpload={handleFileUpload}
            onClearResume={handleClearResume}
            onClearJob={handleClearJob}
            onAnalyze={handleAnalyze}
            onImportTalentLensResume={handleImportTalentLensResume}
          />
        </div>
      )}

        {/* Results Screen */}
        {engineResult && (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Summary Card Pinned at the Top (Stage 2.2) */}
            {quickSummary && (
              <QuickSummaryCard
                summary={quickSummary}
                score={engineResult.score}
                isFullReportVisible={showFullReport}
                onToggleFullReport={() => setShowFullReport((prev) => !prev)}
                onFixClick={() => {
                  setPresentationMode('deep');
                  setActiveTab('skills');
                  setShowFullReport(true);
                }}
              />
            )}

            {/* Top Re-Scan Action Bar with Mode Switcher (STAGE 9) */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[16px] bg-surface border border-border shadow-xs print:hidden">
                <div className="flex items-center gap-3 min-w-0 text-sm">
                  <span className="text-xs font-bold text-text-tertiary uppercase">Target:</span>
                  <span className="font-bold text-text truncate">
                    {engineResult.bestFitTier} ({engineResult.seniorityFit.level} Level)
                  </span>

                {canonical && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      canonical.applicationGuidance === 'Ready to apply'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : canonical.applicationGuidance === 'Apply after high-priority fixes'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : canonical.applicationGuidance === 'Insufficient evidence to evaluate'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {canonical.applicationGuidance}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Switcher Toggle */}
                <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setPresentationMode('quick')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      presentationMode === 'quick'
                        ? 'bg-text text-bg shadow-xs'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 inline mr-1" /> Quick Roast
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresentationMode('deep')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      presentationMode === 'deep'
                        ? 'bg-text text-bg shadow-xs'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 inline mr-1" /> Deep Roaster
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleTryAnotherJob}
                  className="px-4 py-2 bg-surface hover:bg-surface-2 border border-border text-xs font-bold rounded-xl text-text transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-primary" /> Try Another Job
                </button>

                <button
                  type="button"
                  onClick={() => {
                    saveFromResumeText(resumeText);
                    openDrawer();
                  }}
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-bold rounded-xl text-primary transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Save to my profile
                </button>
              </div>
            </div>

            {showFullReport && (
              <>
                {/* PRESENTATION MODE 1: QUICK ROAST (STAGE 9) */}
                {presentationMode === 'quick' && canonical && (
              <div className="space-y-6 animate-fade-in">
                {/* Score & Verdict Card */}
                <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border shadow-xs text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase mb-4">
                    <ShieldCheck className="w-4 h-4" /> Grounded Quick Roast
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="text-6xl sm:text-7xl font-black font-mono text-primary">
                      {canonical.scores.finalScore}
                      <span className="text-3xl opacity-50">%</span>
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-bold text-text mb-2">
                    {canonical.quickRoast.oneLineVerdict}
                  </div>

                  <p className="text-sm text-text-secondary max-w-xl mx-auto mb-6">
                    Confidence: <span className="font-bold capitalize">{canonical.confidence}</span> • Guidance:{' '}
                    <span className="font-bold">{canonical.applicationGuidance}</span>
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPresentationMode('deep')}
                      className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                    >
                      Inspect Full Deep Breakdown <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3 Strengths & 3 Gaps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-surface rounded-2xl p-6 border border-emerald-200/50 shadow-xs">
                    <h3 className="text-base font-bold text-emerald-700 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Key Verified Strengths (Up to 3)
                    </h3>
                    <div className="space-y-3">
                      {canonical.quickRoast.strengths.length === 0 ? (
                        <p className="text-xs text-text-secondary">No strong verified strengths detected.</p>
                      ) : (
                        canonical.quickRoast.strengths.map((s, i) => (
                          <div key={i} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                            <div className="font-bold text-slate-900">{s.title}</div>
                            <div className="text-slate-600 mt-1 italic">&ldquo;{s.evidenceQuote}&rdquo;</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Gaps */}
                  <div className="bg-surface rounded-2xl p-6 border border-rose-200/50 shadow-xs">
                    <h3 className="text-base font-bold text-rose-700 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600" /> Top Priority Gaps (Up to 3)
                    </h3>
                    <div className="space-y-3">
                      {canonical.quickRoast.gaps.length === 0 ? (
                        <p className="text-xs text-text-secondary">No critical skill gaps found.</p>
                      ) : (
                        canonical.quickRoast.gaps.map((g, i) => (
                          <div key={i} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs">
                            <div className="font-bold text-slate-900">{g.title}</div>
                            <div className="text-rose-700 mt-0.5 capitalize">Gap type: {g.gapType.replace('_', ' ')}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Prioritized Actions */}
                <div className="bg-surface rounded-2xl p-6 border border-border shadow-xs">
                  <h3 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Top Prioritized Action Items
                  </h3>
                  <div className="space-y-3">
                    {canonical.quickRoast.prioritizedActions.map((act, i) => (
                      <div key={i} className="p-4 bg-surface-2 rounded-xl border border-border text-xs flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-text text-sm">{act.title}</div>
                          <div className="text-text-secondary mt-1">{act.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRESENTATION MODE 2: DEEP ROASTER (STAGE 9) */}
            {presentationMode === 'deep' && (
              <>
                {/* Layout Section A: Score Header */}
                <ScoreHeader result={engineResult} headerRef={headerRef} />

                {/* Layout Section B: Fix These First */}
                <FixTheseFirst items={engineResult.fixFirst} />

                {/* Layout Section C: Tab Bar with Exactly 4 Tabs */}
                <div className="space-y-6">
                  <TabBar
                    activeTab={activeTab}
                    skillsCount={engineResult.skillResults.length}
                    onTabChange={handleTabChange}
                    tabBarRef={tabBarRef}
                  />

                  {/* Tab Content Panes */}
                  <div className="min-h-[450px]">
                    {activeTab === 'overview' && <OverviewTab result={engineResult} />}
                    {activeTab === 'skills' && <SkillsTab skills={engineResult.skillResults} />}
                    {activeTab === 'audit' && <AuditTab result={engineResult} />}
                    {activeTab === 'learning_path' && <LearningPathTab result={engineResult} />}
                  </div>
                </div>
              </>
            )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Dev-Only Debug Drawer */}
      <DebugDrawer result={engineResult} />
    </div>
  );
}
