// ============================================================
// HireFlow — ATS Resume Roaster (Stage 4 Results Redesign)
// Deterministic single scroll page with 4 tabs and zero hallucinations
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
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

const STAGED_MESSAGES = [
  'Reading resume tokens & structural sections...',
  'Extracting job description requirements...',
  'Validating word boundaries & verifying evidence...',
  'Calculating 7-category weights & penalty metrics...',
  'Synthesizing grounded recruiter intelligence...',
];

export function ResumeChecker() {
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [jobFileName, setJobFileName] = useState<string | null>(null);
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

  const headerRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

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
      } else {
        setJobText(res.text);
        setJobFileName(res.fileName);
        setJobPageCount(res.pageCount);
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
    setFileError(null);
  };

  const handleClearJob = () => {
    setJobText('');
    setJobFileName(null);
    setJobPageCount(undefined);
    setFileError(null);
  };

  const handleTabChange = (tab: ReportTabId) => {
    setActiveTab(tab);
    // Keep scroll at tab bar when switching tabs
    if (tabBarRef.current) {
      tabBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jobText.trim()) return;

    setIsScanning(true);
    // Reset active tab to 'overview' on every scan (fixes random tab bug)
    setActiveTab('overview');

    const mappedTier: TargetTierId =
      targetTier === 'Top Product'
        ? 'top_product'
        : targetTier === 'Startup / Unicorn'
        ? 'startup_unicorn'
        : targetTier === 'Service / MNC'
        ? 'service_mnc'
        : 'auto';

    const mappedLevel: ExperienceLevelId =
      experienceLevel === 'Fresher'
        ? 'fresher'
        : experienceLevel === '1-3 yrs'
        ? '1-3'
        : experienceLevel === '3-6 yrs'
        ? '3-6'
        : experienceLevel === '6+ yrs'
        ? '6+'
        : 'auto';

    setTimeout(() => {
      try {
        const response = runAtsEngine(resumeText, jobText, {
          tier: mappedTier,
          level: mappedLevel,
        });

        if (!response.success) {
          setFileError(response.message);
          return;
        }

        setEngineResult(response.result);

        // Always scroll to top of results and focus header on new analysis
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

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-16 px-4 sm:px-6 md:px-8 relative">
      {/* Top Navigation */}
      <div className="absolute top-8 left-6 sm:left-8 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-text hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowRight className="w-5 h-5 rotate-180" /> Back to Home
        </Link>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-6 mt-2 print:mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Deterministic ATS Evaluation Engine
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            ATS Resume{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai">
              Roaster
            </span>
          </h1>
          <p className="text-text-secondary text-[16px] leading-relaxed max-w-2xl mx-auto">
            Zero hallucinations. Verifiable citations. Calibrated against real engineering hiring bars.
          </p>
        </div>

        {/* Input Panel Section */}
        {!engineResult && (
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
          />
        )}

        {/* Results Screen (Single Scroll Page) */}
        {engineResult && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Re-Scan Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[16px] bg-surface border border-border shadow-xs print:hidden">
              <div className="flex items-center gap-2 min-w-0 text-sm">
                <span className="text-xs font-bold text-text-tertiary uppercase">Target:</span>
                <span className="font-bold text-text truncate">
                  {engineResult.bestFitTier} ({engineResult.seniorityFit.level} Level)
                </span>
              </div>

              <button
                type="button"
                onClick={handleTryAnotherJob}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold rounded-[8px] text-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-primary" /> Analyze Another Job Description
              </button>
            </div>

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
          </div>
        )}
      </div>

      {/* Dev-Only Debug Drawer */}
      <DebugDrawer result={engineResult} />
    </div>
  );
}
