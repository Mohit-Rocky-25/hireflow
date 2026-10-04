import { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Search,
  FileText,
  ArrowRight,
  ScanLine,
  UploadCloud,
  Target,
  Landmark,
  Sparkles,
  History,
  RotateCcw,
  AlertTriangle,
  Layers,
  FileCheck,
  CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyzeResume, extractTextFromFile, AnalysisResponse } from '../../lib/ats';
import { DEMO_PRESETS } from '../../data/ats/demoPresets';
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
  const [targetCompanyTier, setTargetCompanyTier] = useState<
    'Auto' | 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C'
  >('Auto');
  const [experienceLevel, setExperienceLevel] = useState<
    'Auto' | 'Fresher' | '1-3' | '3-5' | '5+'
  >('Auto');

  const [isScanning, setIsScanning] = useState(false);
  const [stagedStageIndex, setStagedStageIndex] = useState(0);
  const [isFileExtracting, setIsFileExtracting] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<MainReportTab>(() => {
    try {
      const saved = localStorage.getItem('hireflow_active_ats_tab');
      return (saved as MainReportTab) || 'overview';
    } catch {
      return 'overview';
    }
  });
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
    try {
      localStorage.setItem('hireflow_active_ats_tab', tab);
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (file: File, type: 'resume' | 'job') => {
    setIsFileExtracting(true);
    try {
      const extracted = await extractTextFromFile(file);
      if (type === 'resume') {
        setResumeText(extracted);
        setResumeFileName(file.name);
      } else {
        setJobText(extracted);
        setJobFileName(file.name);
      }
    } catch (err) {
      console.error('File extraction failed:', err);
    } finally {
      setIsFileExtracting(false);
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setResumeText(preset.resumeText);
    setJobText(preset.jdText);
    setResumeFileName(null);
    setJobFileName(null);
  };

  const handleScan = async () => {
    if (!resumeText.trim() || !jobText.trim()) return;
    setIsScanning(true);

    try {
      const analysis = await analyzeResume(resumeText, jobText, {
        targetCompanyTier,
        experienceLevel,
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

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        <div className="text-center max-w-3xl mx-auto mb-8 mt-2 print:mb-4">
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

          {/* Quick Demo Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 print:hidden">
            <span className="text-xs text-text-tertiary font-semibold">Test Presets:</span>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset.id)}
                className="px-2.5 py-1 rounded text-xs font-medium bg-surface hover:bg-surface-hover border border-border text-text transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{preset.label}</span>
                <span className="px-1 py-0.2 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary">
                  {preset.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <Landmark className="w-4 h-4 text-primary shrink-0" />
            <label className="text-xs font-semibold text-text whitespace-nowrap">Target Tier:</label>
            <select
              value={targetCompanyTier}
              onChange={(e) => setTargetCompanyTier(e.target.value as any)}
              className="bg-surface-hover border border-border rounded-md px-2.5 py-1 text-xs text-text font-medium outline-none cursor-pointer"
            >
              <option value="Auto">Auto Detect from JD</option>
              <option value="Tier S">Tier S (Google, Meta, Uber, Stripe)</option>
              <option value="Tier A">Tier A (High-Growth Unicorns)</option>
              <option value="Tier B">Tier B (Mid-Market Product Firms)</option>
              <option value="Tier C">Tier C (Enterprise IT Services)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-4 h-4 text-ai shrink-0" />
            <label className="text-xs font-semibold text-text whitespace-nowrap">Experience Level:</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="bg-surface-hover border border-border rounded-md px-2.5 py-1 text-xs text-text font-medium outline-none cursor-pointer"
            >
              <option value="Auto">Auto Detect from Resume</option>
              <option value="Fresher">Fresher / Graduate (0 - 1 yr)</option>
              <option value="1-3">Junior (1 - 3 yrs)</option>
              <option value="3-5">Mid-Level (3 - 5 yrs)</option>
              <option value="5+">Senior / Staff (5+ yrs)</option>
            </select>
          </div>
        </div>

        {/* Two Input Panels */}
        {!result && (
          <div className="grid md:grid-cols-2 gap-6 relative">
            {/* Resume Panel */}
            <div className="bg-surface rounded-xl p-5 border border-border shadow-xs flex flex-col h-[480px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <h2 className="text-sm font-bold text-text truncate">Your Resume</h2>
                  {resumeFileName && (
                    <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded truncate max-w-[130px]">
                      {resumeFileName}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-semibold transition-colors">
                  <UploadCloud className="w-3.5 h-3.5" /> Upload File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], 'resume');
                      }
                    }}
                  />
                </label>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your plain text resume here, or upload .pdf / .docx..."
                className="flex-1 w-full bg-surface-hover border border-border rounded-lg p-3.5 text-xs font-mono focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
                <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                <span>Minimum 80 words recommended</span>
              </div>
            </div>

            {/* Job Description Panel */}
            <div className="bg-surface rounded-xl p-5 border border-border shadow-xs flex flex-col h-[480px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="w-4 h-4 text-ai shrink-0" />
                  <h2 className="text-sm font-bold text-text truncate">Target Job Description</h2>
                  {jobFileName && (
                    <span className="text-[11px] font-mono text-ai bg-ai/10 px-2 py-0.5 rounded truncate max-w-[130px]">
                      {jobFileName}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-ai/10 text-ai hover:bg-ai/20 rounded text-xs font-semibold transition-colors">
                  <UploadCloud className="w-3.5 h-3.5" /> Upload File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], 'job');
                      }
                    }}
                  />
                </label>
              </div>
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the target job description or requirements here..."
                className="flex-1 w-full bg-surface-hover border border-border rounded-lg p-3.5 text-xs font-mono focus:ring-1 focus:ring-ai outline-none resize-none leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-tertiary">
                <span>{jobText.split(/\s+/).filter(Boolean).length} words</span>
                <span>Minimum 60 words recommended</span>
              </div>
            </div>
          </div>
        )}

        {/* Scan Action Button / Loading State */}
        {!result && (
          <div className="flex flex-col items-center justify-center mt-6 space-y-3">
            {isScanning ? (
              <div className="p-6 bg-surface rounded-xl border border-border shadow-sm max-w-md w-full text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                  <ScanLine className="w-5 h-5 animate-spin" />
                  <span>Analyzing Match Dynamics</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((stagedStageIndex + 1) / STAGED_MESSAGES.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary font-mono animate-pulse">
                  {STAGED_MESSAGES[stagedStageIndex]}
                </p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={!resumeText.trim() || !jobText.trim() || isFileExtracting}
                  className={`px-8 py-3.5 rounded-full font-bold text-sm md:text-base transition-all shadow-sm ${
                    !resumeText.trim() || !jobText.trim() || isFileExtracting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-hover hover:shadow-md cursor-pointer'
                  }`}
                >
                  {isFileExtracting ? 'Extracting File...' : 'Run ATS Resume Audit'}
                </button>
                <p className="text-xs text-text-tertiary text-center">
                  Zero hallucinations • Verbatim quotes verified • Word-boundary skill matching
                </p>
              </>
            )}
          </div>
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
