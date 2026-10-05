import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  History,
  RotateCcw,
  AlertTriangle,
  Brain,
  Layers,
  FileCheck,
  CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyzeResume, AnalysisResponse } from '../../lib/ats';
import { parseResumeFile } from '../../features/ats/fileParser';
import {
  AtsInputSection,
  TargetTier,
  ExperienceLevel,
} from '../../features/ats/components/AtsInputSection';
import { VerdictCard } from '../../components/ats/VerdictCard';
import { OverviewTab } from '../../components/ats/OverviewTab';
import { SkillsTab } from '../../components/ats/SkillsTab';
import { ResumeTab } from '../../components/ats/ResumeTab';
import { ActionPlanTab } from '../../components/ats/ActionPlanTab';
import { ExportActions } from '../../components/ats/ExportActions';
import { DebugDrawer } from '../../components/ats/DebugDrawer';

export type MainReportTab = 'overview' | 'skills' | 'resume' | 'action';

interface ScanHistoryItem {
  id: string;
  role: string;
  score: number;
  date: string;
  response: AnalysisResponse;
}

const STAGED_MESSAGES = [
  'Reading resume structure & sections...',
  'Mapping job requirements graph...',
  'Judging evidence & verbatim citations...',
  'Scoring competencies & calculating weights...',
  'Generating tactical recruiter feedback...',
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
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<MainReportTab>('overview');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Staged loading effect
  useEffect(() => {
    if (!isScanning) {
      setStagedStageIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setStagedStageIndex((prev) => (prev + 1) % STAGED_MESSAGES.length);
    }, 700);
    return () => clearInterval(timer);
  }, [isScanning]);

  const handleTabChange = (tab: MainReportTab) => {
    setActiveTab(tab);
  };

  const handleFileUpload = async (file: File, type: 'resume' | 'job') => {
    setIsFileExtracting(true);
    setFileError(null);
    try {
      const res = await parseResumeFile(file);
      if (!res.success) {
        setFileError(res.error || 'Failed to read file.');
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

  const handleScan = async () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setIsScanning(true);
    setActiveTab('overview');

    const mappedTier =
      targetTier === 'Top Product'
        ? 'Tier S'
        : targetTier === 'Startup / Unicorn'
        ? 'Tier A'
        : targetTier === 'Service / MNC'
        ? 'Tier C'
        : 'Auto';

    const mappedLevel =
      experienceLevel === 'Fresher'
        ? 'Fresher'
        : experienceLevel === '1-3 yrs'
        ? '1-3'
        : experienceLevel === '3-6 yrs'
        ? '3-5'
        : experienceLevel === '6+ yrs'
        ? '5+'
        : 'Auto';

    try {
      const analysis = await analyzeResume(resumeText, jobText, {
        targetCompanyTier: mappedTier,
        experienceLevel: mappedLevel,
      });

      setResult(analysis);

      // Save to session history (last 5 scans)
      const historyItem: ScanHistoryItem = {
        id: Date.now().toString(),
        role: analysis.facts.jd.roleTitle || 'Target Role',
        score: analysis.facts.scoreBreakdown.finalScore,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response: analysis,
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 4)]);

      // Scroll to top of results on new scan
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        resultsRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error('ATS scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTryAnotherJob = () => {
    // Keeps resume, clears JD
    setJobText('');
    setJobFileName(null);
    setJobPageCount(undefined);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-16 px-4 sm:px-6 md:px-8 relative">
      {/* Absolute Top-Left Back Button */}
      <div className="absolute top-8 left-6 sm:left-8 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm md:text-base font-bold text-text hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowRight className="w-5 h-5 rotate-180" /> Back to Home
        </Link>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-6 mt-2 print:mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> High-Precision ATS Evaluator & Recruiter Radar
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            ATS Resume{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai">
              Roaster
            </span>
          </h1>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Grounded candidate evaluation combining exact token-boundary parsing with deep technical recruiter heuristics.
          </p>
        </div>

        {/* Input Section (When no active analysis result) */}
        {!result && (
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
            onAnalyze={handleScan}
          />
        )}

        {/* Analysis Results View */}
        {result && (
          <div ref={resultsRef} className="animate-fade-in space-y-6">
            {/* Top Bar with Re-scan & Export */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border shadow-xs print:hidden">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-text-tertiary">Target Role:</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary font-bold text-xs rounded truncate">
                  {result.facts.jd.roleTitle || 'Software Engineer'}
                </span>
                <span className="text-xs text-text-tertiary hidden sm:inline">
                  (Req: {result.facts.seniorityFit.requiredYears} yrs | Cand: ~
                  {result.facts.seniorityFit.candidateYears} yrs)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ExportActions facts={result.facts} ai={result.ai} />
                <button
                  type="button"
                  onClick={handleTryAnotherJob}
                  className="px-3 py-1.5 bg-surface-hover border border-border text-xs font-semibold rounded hover:bg-border text-text transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Try Another Job
                </button>
              </div>
            </div>

            {/* Notice for AI Unavailable / Fallback (if applicable) */}
            {!result.isAiAvailable && result.aiErrorNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{result.aiErrorNotice}</span>
              </div>
            )}

            {/* TOP VERDICT CARD (Always Visible) */}
            <VerdictCard data={result} />

            {/* SINGLE NAVIGABLE REPORT WITH EXACTLY 4 TABS */}
            <div className="space-y-6 pt-2">
              {/* Segmented Control Bar */}
              <div className="bg-surface rounded-xl border border-border p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-xs">
                {(
                  [
                    { id: 'overview', label: '1. Overview', icon: Brain },
                    { id: 'skills', label: `2. Skills (${result.facts.skillMatches.length})`, icon: Layers },
                    { id: 'resume', label: '3. Resume Audit', icon: FileCheck },
                    { id: 'action', label: '4. Action Plan', icon: CalendarCheck },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 4 Tab Views */}
              <div className="min-h-[400px]">
                {activeTab === 'overview' && <OverviewTab data={result} />}
                {activeTab === 'skills' && <SkillsTab data={result} />}
                {activeTab === 'resume' && <ResumeTab data={result} />}
                {activeTab === 'action' && <ActionPlanTab data={result} />}
              </div>
            </div>

            {/* Footer Session Scan History (Last 5 Scans) */}
            {history.length > 1 && (
              <div className="bg-surface rounded-xl p-5 border border-border shadow-xs space-y-3 print:hidden">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  <History className="w-3.5 h-3.5 text-primary" /> Recent Scans in This Session
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setResult(item.response)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        item.response === result
                          ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                          : 'bg-surface-hover border-border hover:border-slate-400'
                      }`}
                    >
                      <div className="text-xs font-semibold text-text truncate">{item.role}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-mono font-bold text-primary">{item.score}%</span>
                        <span className="text-text-tertiary">{item.date}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DEV-ONLY DEBUG DRAWER */}
      <DebugDrawer data={result} />
    </div>
  );
}
