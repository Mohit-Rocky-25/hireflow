// ============================================================
// HireFlow — ATS Resume Roaster (Job Fit & Resume Improvement)
// Deterministic single source of truth with Quick Roast & Deep Roaster
// ============================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
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
  Search,
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { useProfile } from '../../features/suite/profile/ProfileContext';
import { QuickSummaryCard } from '../../features/suite/components/QuickSummaryCard';
import { buildQuickSummary } from '../../features/suite/engine/quickSummary';
import { SimulationFacts } from '../../features/suite/engine/simulateFix';
import { parseResumeFile } from '../../features/ats/fileParser';
import { validateResumeAuthenticity } from '../../lib/resumeValidator';
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
import { useAtsToolStore } from '../../store/tools/atsStore';
import { WordLimitSource } from '../../lib/config/limits';
import { resolveTargetJob } from '../../features/career-path/resolveTargetJob';
import { ConfirmRequirementsModal, ConfirmedRequirement } from '../../features/ats/components/ConfirmRequirementsModal';
import { RealityFactorsPanel } from '../../components/common/RealityFactorsPanel';
import { EligibilityCard } from '../../components/common/EligibilityCard';
import { FresherChecksPanel } from '../../components/common/FresherChecksPanel';
import { DataProvenanceModal } from '../../components/common/DataProvenanceModal';
import { parseJD } from '../../lib/ats/parseJD';

const STAGED_MESSAGES = [
  'Reading resume tokens & structural sections...',
  'Extracting job description requirements...',
  'Validating word boundaries & verifying evidence...',
  'Calculating 7-category weights & penalty metrics...',
  'Synthesizing grounded recruiter intelligence...',
];

export function ResumeChecker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, saveFromResumeText, openDrawer } = useProfile();
  const [showFullReport, setShowFullReport] = useState(true);

  const queryCompanyId = searchParams.get('company');
  const queryRoleTitle = searchParams.get('role');
  const queryProgramId = searchParams.get('program');
  const isFromTalentLens = Boolean(queryCompanyId && (queryRoleTitle || queryProgramId));

  const initialStoredResume = useTalentLensStore.getState().resumeText;
  const initialStoredFileName = useTalentLensStore.getState().resumeFileName;

  const initialResolvedJob = useMemo(() => {
    return resolveTargetJob(queryCompanyId, queryRoleTitle, queryProgramId);
  }, [queryCompanyId, queryRoleTitle, queryProgramId]);

  const [resumeText, setResumeText] = useState<string>(() => {
    if (initialStoredResume) return initialStoredResume;
    if (isFromTalentLens) return DEMO_TALENTLENS_RESUME.text;
    return '';
  });

  const [jobText, setJobText] = useState<string>(() => {
    return initialResolvedJob.text;
  });

  const [resumeFileName, setResumeFileName] = useState<string | null>(() => {
    if (initialStoredResume) return initialStoredFileName || DEMO_TALENTLENS_RESUME.fileName;
    if (isFromTalentLens) return DEMO_TALENTLENS_RESUME.fileName;
    return null;
  });

  const [jobFileName, setJobFileName] = useState<string | null>(() => {
    return initialResolvedJob.fileName;
  });

  const [resumeSource, setResumeSource] = useState<WordLimitSource>(() => {
    if (initialStoredResume || isFromTalentLens) return 'talentlens';
    return undefined;
  });

  const [jobSource, setJobSource] = useState<WordLimitSource>(() => {
    if (initialResolvedJob.text) return 'prefilled';
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmedRequirements, setConfirmedRequirements] = useState<ConfirmedRequirement[] | null>(null);
  const [parsedJdData, setParsedJdData] = useState<ReturnType<typeof parseJD> | null>(null);

  // Campus UI removed for TalentLens JD single source

  const headerRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const userClearedJobRef = useRef(false);
  const userClearedResumeRef = useRef(false);

  // Sync from TalentLens URL query parameters & ensure store has resume loaded
  useEffect(() => {
    const compId = searchParams.get('company');
    const rTitle = searchParams.get('role');
    const pId = searchParams.get('program');
    if (compId && (rTitle || pId)) {
      const stored = useTalentLensStore.getState().resumeText;
      const storedFile = useTalentLensStore.getState().resumeFileName;
      if (!userClearedResumeRef.current && !resumeText) {
        const textToUse = stored || DEMO_TALENTLENS_RESUME.text;
        const fileToUse = storedFile || DEMO_TALENTLENS_RESUME.fileName;
        setResumeText(textToUse);
        setResumeFileName(fileToUse);
        setResumeSource('talentlens');
        if (!stored) {
          useTalentLensStore.getState().setResume(textToUse, fileToUse);
        }
      }

      if (!userClearedJobRef.current && !jobText) {
        const resolved = resolveTargetJob(compId, rTitle, pId);
        if (resolved.text) {
          setJobText(resolved.text);
          setJobFileName(resolved.fileName);
          setJobSource('prefilled');
        }
      }
    }
  }, [searchParams]);

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
        const validity = validateResumeAuthenticity(res.text);
        if (!validity.isValid) {
          setFileError(validity.reason || 'Uploaded file is not a resume. It lacks standard resume sections (Experience, Education, Skills).');
          return;
        }
        userClearedResumeRef.current = false;
        setResumeText(res.text);
        setResumeFileName(res.fileName);
        setResumePageCount(res.pageCount);
        setResumeSource('upload');
      } else {
        userClearedJobRef.current = false;
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
    userClearedResumeRef.current = true;
    setResumeText('');
    setResumeFileName(null);
    setResumePageCount(undefined);
    setResumeSource(undefined);
    setFileError(null);
  };

  const handleClearJob = () => {
    userClearedJobRef.current = true;
    setJobText('');
    setJobFileName(null);
    setJobPageCount(undefined);
    setJobSource(undefined);
    setFileError(null);
    setConfirmedRequirements(null);
    setParsedJdData(null);
  };

  const handleTabChange = (tab: ReportTabId) => {
    setActiveTab(tab);
    if (tabBarRef.current) {
      tabBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleImportTalentLensResume = (text: string, fileName: string) => {
    userClearedResumeRef.current = false;
    setResumeText(text);
    setResumeFileName(fileName || DEMO_TALENTLENS_RESUME.fileName);
    setResumePageCount(1);
    setResumeSource('talentlens');
    setFileError(null);
  };

  const executeAnalysis = (confirmedList?: ConfirmedRequirement[]) => {
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
        const activeRequirements = confirmedList || confirmedRequirements || undefined;
        const response = runAtsEngine(resumeText, jobText, {
          tier: mappedTier,
          level: mappedLevel,
          resumeSource,
          jdSource: jobSource,
          confirmedRequirements: activeRequirements ? activeRequirements.map(r => ({ text: r.text, type: r.type })) : undefined,
        });

        if (!response.success) {
          setFileError(response.message);
          return;
        }

        setEngineResult(response.result);

        const missing = (response.result.skillResults || [])
          .filter((s: any) => s.status === 'missing')
          .map((s: any) => s.name);
        useAtsToolStore.getState().setLatestMissingSkills(missing);
        useAtsToolStore.getState().addHistoryEntry({
          resumeFileName: resumeFileName || 'resume.pdf',
          targetRole: response.result.bestFitTier || 'Standard Role',
          score: response.result.trace?.compositeDisplay ?? response.result.score,
          matchedCount: response.result.audit.skillsParsedCount,
          missingCount: response.result.missingKeywordsCount,
          specVersion: response.result.specVersion,
          engineVersion: response.result.engineVersion,
          specFingerprint: response.result.specFingerprint,
        });

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

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jobText.trim()) return;

    if (!confirmedRequirements) {
      const pj = parseJD(jobText);
      setParsedJdData(pj);
      setIsConfirmModalOpen(true);
      return;
    }

    executeAnalysis(confirmedRequirements);
  };

  const handleConfirmRequirements = (confirmed: ConfirmedRequirement[]) => {
    setConfirmedRequirements(confirmed);
    executeAnalysis(confirmed);
  };

  const handleTryAnotherJob = () => {
    setJobText('');
    setJobFileName(null);
    setJobPageCount(undefined);
    setEngineResult(null);
    setConfirmedRequirements(null);
    setParsedJdData(null);
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
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 sm:px-6 md:px-8 relative">
      <PublicNavbar />

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* In-Flow Navigation Bar */}
        <div className="flex items-center justify-between pb-2 print:hidden">
          <button
            type="button"
            onClick={() => (engineResult ? handleTryAnotherJob() : navigate('/tools'))}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-near-black border border-charcoal text-silver hover:text-white hover:border-volt text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5px]" />
            <span>{engineResult ? 'Modify Inputs' : 'Decision Suite'}</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded bg-near-black border border-charcoal text-[11px] font-semibold text-silver uppercase tracking-[1px]">
            <span className="w-2 h-2 rounded-full bg-volt inline-block"></span>
            <span>Tools</span>
            <span className="text-charcoal-deep">/</span>
            <span className="text-white">ATS Resume Roaster</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 mt-1 print:mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-near-black border border-charcoal text-silver text-xs font-semibold uppercase tracking-[1.4px] mb-4 flex-wrap justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
            <span>Deterministic ATS Fit Audit</span>
            <span className="text-charcoal-deep">|</span>
            <span>Zero-Fabrication Analysis</span>
            <span className="text-charcoal-deep">|</span>
            <DataProvenanceModal
              triggerButtonText="Data Sources & Legal Shield"
              triggerButtonClassName="text-volt hover:text-white uppercase tracking-[1px] text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12] mb-3.5">
            How well does your resume match,{' '}
            <span className="block text-volt">
              and what should you improve?
            </span>
          </h1>
          <p className="text-silver text-[15px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto font-normal">
            Audit your resume against any target job description. Receive deterministic keyword scoring, verbatim citations, and actionable bullet rewrites calibrated to engineering hiring bars.
          </p>
        </div>

        {/* Input Panel Section */}
        {!engineResult && (
          <div className="space-y-6">
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
                userClearedResumeRef.current = false;
                setResumeText(txt);
                setFileError(null);
                if (!txt.trim()) {
                  setResumeFileName(null);
                  setResumePageCount(undefined);
                  setResumeSource(undefined);
                }
              }}
              onJobTextChange={(txt) => {
                userClearedJobRef.current = false;
                setJobText(txt);
                setFileError(null);
                if (!txt.trim()) {
                  setJobFileName(null);
                  setJobPageCount(undefined);
                  setJobSource(undefined);
                }
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
            {/* Quick Summary Card Pinned at the Top */}
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

            {/* Top Re-Scan Action Bar with Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-near-black border border-charcoal shadow-level-1 print:hidden">
              <div className="flex items-center gap-3 min-w-0 text-sm">
                <span className="text-xs font-bold text-silver uppercase tracking-[1.4px]">Target:</span>
                <span className="font-bold text-white truncate">
                  {engineResult.bestFitTier} ({engineResult.seniorityFit.level} Level)
                </span>

                {canonical && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-[1px] border ${
                      canonical.applicationGuidance === 'Ready to apply'
                        ? 'bg-black text-volt border-volt/60'
                        : canonical.applicationGuidance === 'Apply after high-priority fixes'
                        ? 'bg-black text-pale-yellow border-pale-yellow/60'
                        : canonical.applicationGuidance === 'Insufficient evidence to evaluate'
                        ? 'bg-black text-silver border-charcoal'
                        : 'bg-black text-danger border-danger/60'
                    }`}
                  >
                    {canonical.applicationGuidance}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Switcher Toggle */}
                <div className="inline-flex rounded bg-black p-1 border border-charcoal">
                  <button
                    type="button"
                    onClick={() => setPresentationMode('quick')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[1px] rounded transition-all cursor-pointer ${
                      presentationMode === 'quick'
                        ? 'bg-near-black text-volt border border-volt shadow-level-4'
                        : 'text-silver hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 inline mr-1 stroke-[1.5px]" /> Quick Roast
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresentationMode('deep')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[1px] rounded transition-all cursor-pointer ${
                      presentationMode === 'deep'
                        ? 'bg-near-black text-volt border border-volt shadow-level-4'
                        : 'text-silver hover:text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5 inline mr-1 stroke-[1.5px]" /> Deep Roaster
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const pj = parseJD(jobText, confirmedRequirements ? confirmedRequirements.map(r => ({ text: r.text, type: r.type })) : undefined);
                    setParsedJdData(pj);
                    setIsConfirmModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt text-xs font-bold uppercase tracking-[1px] rounded text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Review and adjust mandatory vs preferred requirements for this job"
                >
                  <Search className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Confirm Requirements
                </button>

                <button
                  type="button"
                  onClick={handleTryAnotherJob}
                  className="px-4 py-2 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt text-xs font-bold uppercase tracking-[1px] rounded text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Try Another Job
                </button>

                <button
                  type="button"
                  onClick={() => {
                    saveFromResumeText(resumeText);
                    openDrawer();
                  }}
                  className="px-4 py-2 bg-forest hover:bg-[#3a3a3a] border border-[#141414] text-xs font-bold uppercase tracking-[1px] rounded text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 stroke-[1.5px]" /> Save to my profile
                </button>
              </div>
            </div>

            {showFullReport && (
              <>
                {/* PRESENTATION MODE 1: QUICK ROAST */}
                {presentationMode === 'quick' && canonical && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Score & Verdict Card */}
                    <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-volt border border-volt/60 rounded text-xs font-bold uppercase tracking-[1.4px] mb-4">
                        <ShieldCheck className="w-4 h-4 text-volt stroke-[1.5px]" /> Grounded Quick Roast
                      </div>

                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="text-6xl sm:text-7xl font-black font-mono text-white">
                          {canonical.scores.finalScore}
                          <span className="text-3xl text-volt ml-1">%</span>
                        </div>
                      </div>

                      <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {canonical.quickRoast.oneLineVerdict}
                      </div>

                      <p className="text-sm text-silver max-w-xl mx-auto mb-6">
                        Confidence: <span className="font-bold text-white capitalize">{canonical.confidence}</span> • Guidance:{' '}
                        <span className="font-bold text-white">{canonical.applicationGuidance}</span>
                      </p>

                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPresentationMode('deep')}
                          className="group px-5 py-2.5 bg-volt !text-black text-xs font-bold uppercase tracking-[1.4px] rounded border border-volt hover:bg-[#1d1d1d] hover:!text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span className="!text-black group-hover:!text-white font-black">Inspect Full Deep Breakdown</span>
                          <ArrowUpRight className="w-4 h-4 stroke-[2px] !text-black group-hover:!text-white" />
                        </button>
                      </div>
                    </div>

                    {/* 3 Strengths & 3 Gaps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1">
                        <h3 className="text-base font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-volt stroke-[1.5px]" /> Key Verified Strengths (Up to 3)
                        </h3>
                        <div className="space-y-3">
                          {canonical.quickRoast.strengths.length === 0 ? (
                            <p className="text-xs text-silver">No strong verified strengths detected.</p>
                          ) : (
                            canonical.quickRoast.strengths.map((s, i) => (
                              <div key={i} className="p-3 bg-black rounded border border-charcoal text-xs">
                                <div className="font-bold text-white">{s.title}</div>
                                <div className="text-silver mt-1 italic">&ldquo;{s.evidenceQuote}&rdquo;</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Gaps */}
                      <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1">
                        <h3 className="text-base font-bold text-danger uppercase tracking-tight mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-danger stroke-[1.5px]" /> Top Priority Gaps (Up to 3)
                        </h3>
                        <div className="space-y-3">
                          {canonical.quickRoast.gaps.length === 0 ? (
                            <p className="text-xs text-silver">No critical skill gaps found.</p>
                          ) : (
                            canonical.quickRoast.gaps.map((g, i) => (
                              <div key={i} className="p-3 bg-black rounded border border-danger/40 text-xs">
                                <div className="font-bold text-white">{g.title}</div>
                                <div className="text-danger mt-0.5 uppercase tracking-[1px] text-[10px]">Gap type: {g.gapType.replace('_', ' ')}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prioritized Actions */}
                    <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1">
                      <h3 className="text-base font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-volt stroke-[1.5px]" /> Top Prioritized Action Items
                      </h3>
                      <div className="space-y-3">
                        {canonical.quickRoast.prioritizedActions.map((act, i) => (
                          <div key={i} className="p-4 bg-black rounded border border-charcoal text-xs flex items-start gap-3">
                            <span className="w-6 h-6 rounded bg-near-black border border-charcoal text-volt font-mono font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <div>
                              <div className="font-bold text-white text-sm">{act.title}</div>
                              <div className="text-silver mt-1">{act.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <RealityFactorsPanel className="mt-6" />
                  </div>
                )}

                {/* PRESENTATION MODE 2: DEEP ROASTER */}
                {presentationMode === 'deep' && (
              <>
                {/* Layout Section A: Score Header */}
                <ScoreHeader result={engineResult} headerRef={headerRef} />

                {/* Reality Factors (Stage 3D, Unscored) */}
                <RealityFactorsPanel className="mb-6" />

                {/* Eligibility Card (Stage 4, Advisory) */}
                <EligibilityCard className="mb-6" />

                {/* Fresher & Student Checks (Stage 4) */}
                <FresherChecksPanel resumeText={resumeText} className="mb-6" />

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

        {/* Legal & Data Provenance Strip */}
        <div className="mt-12 p-4 rounded-lg bg-near-black border border-charcoal flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-silver">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-volt flex-shrink-0"></span>
            <span>
              <strong>Deterministic Matching & Fair Use:</strong> Scoring executes purely on lexical & token boundaries with zero generative hallucinations. All company benchmarks and role titles are processed under Nominative Fair Use and Section 52(1)(a) of the Indian Copyright Act (Educational research & private study).
            </span>
          </div>
          <DataProvenanceModal
            triggerButtonText="Legal Shield & Sourcing"
            triggerButtonClassName="px-3 py-1.5 bg-black border border-charcoal hover:border-volt rounded text-xs font-semibold uppercase tracking-[1px] text-volt hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Requirement Confirmation Modal (Stage 2C) */}
      {isConfirmModalOpen && parsedJdData && (
        <ConfirmRequirementsModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmRequirements}
          extractedRequirements={parsedJdData.extractedRequirements || []}
          unrecognizedRequirements={parsedJdData.unrecognizedRequirements || []}
        />
      )}

      {/* Dev-Only Debug Drawer */}
      <DebugDrawer result={engineResult} />
    </div>
  );
}
