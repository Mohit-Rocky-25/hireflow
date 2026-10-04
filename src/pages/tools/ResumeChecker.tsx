import { useState, useRef } from 'react';
import {
  Brain,
  Search,
  AlertTriangle,
  CheckCircle,
  FileText,
  XCircle,
  ArrowRight,
  ScanLine,
  UploadCloud,
  Target,
  Wand2,
  Eye,
  Landmark,
  CalendarCheck2,
  MessageSquareCode,
  FileWarning,
  Users,
  Sparkles,
  Layers,
  History,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyzeResume, extractTextFromFile, AnalysisResponse } from '../../lib/ats';
import { DEMO_PRESETS } from '../../data/ats/demoPresets';
import { ScoreBreakdownCard } from '../../components/ats/ScoreBreakdownCard';
import { SkillMatrixTable } from '../../components/ats/SkillMatrixTable';
import { BulletDoctor } from '../../components/ats/BulletDoctor';
import { RecruiterScanView } from '../../components/ats/RecruiterScanView';
import { MarketPositioningView } from '../../components/ats/MarketPositioningView';
import { ActionPlanChecklist } from '../../components/ats/ActionPlanChecklist';
import { InterviewRisksView } from '../../components/ats/InterviewRisksView';
import { FormatAuditView } from '../../components/ats/FormatAuditView';
import { MarketStressTester } from '../../components/ats/MarketStressTester';
import { ExportActions } from '../../components/ats/ExportActions';

type ResultTab =
  | 'breakdown'
  | 'skills'
  | 'bullets'
  | 'recruiter'
  | 'tiers'
  | 'action'
  | 'interview'
  | 'format'
  | 'stress';

interface ScanHistoryItem {
  id: string;
  role: string;
  score: number;
  date: string;
  response: AnalysisResponse;
}

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
  const [isFileExtracting, setIsFileExtracting] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('breakdown');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

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

      // Save to session history
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

  const finalScore = result ? result.facts.scoreBreakdown.finalScore : 68;
  const strokeOffset = Math.round(440 - (440 * Math.max(0, Math.min(100, finalScore))) / 100);

  const getScoreStrokeClass = (score: number) => {
    if (score >= 75) return 'stroke-success';
    if (score >= 50) return 'stroke-warning';
    return 'stroke-danger';
  };

  const getScoreTextClass = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-16 px-6 sm:px-8 relative">
      {/* Absolute Top-Left Back Button */}
      <div className="absolute top-8 left-8 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xl font-black text-text hover:text-primary transition-colors"
        >
          <ArrowRight className="w-6 h-6 rotate-180" /> Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 mt-4 print:mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Deterministic Fact Engine + Gemini Flash AI
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4">
            ATS Resume{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai">
              Roaster
            </span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Stop guessing why you got rejected. Paste your resume and the job description below to see exactly what modern ATS filters and top recruiters see.
          </p>

          {/* Quick Demo Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 print:hidden">
            <span className="text-xs text-text-muted font-bold">Quick Demos:</span>
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset.id)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface-2 hover:bg-surface-3 border border-border text-text transition-colors flex items-center gap-1.5"
              >
                <span>{preset.label}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-surface text-primary">
                  {preset.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="max-w-3xl mx-auto bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            <label className="text-xs font-bold text-text">Target Company Tier:</label>
            <select
              value={targetCompanyTier}
              onChange={(e) => setTargetCompanyTier(e.target.value as any)}
              className="bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs text-text font-medium outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Auto">Auto Detect from JD</option>
              <option value="Tier S">Tier S (Google, Meta, Uber, Stripe)</option>
              <option value="Tier A">Tier A (High-Growth Unicorns)</option>
              <option value="Tier B">Tier B (Mid-Market Product Companies)</option>
              <option value="Tier C">Tier C (IT Services / Consulting)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-ai" />
            <label className="text-xs font-bold text-text">Experience Level:</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs text-text font-medium outline-none focus:ring-1 focus:ring-ai"
            >
              <option value="Auto">Auto Detect from Resume</option>
              <option value="Fresher">Fresher (0 - 1 year)</option>
              <option value="1-3">Junior (1 - 3 years)</option>
              <option value="3-5">Mid-Level (3 - 5 years)</option>
              <option value="5+">Senior / Staff (5+ years)</option>
            </select>
          </div>
        </div>

        {/* Input Panels */}
        {!result && (
          <div className="grid md:grid-cols-2 gap-6 relative">
            {/* Resume Panel */}
            <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Your Resume</h2>
                  {resumeFileName && (
                    <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded truncate max-w-[150px]">
                      {resumeFileName}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-semibold transition-colors">
                  <UploadCloud className="w-4 h-4" /> Upload File
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
                placeholder="Paste your plain text resume here, or click Upload File (.pdf, .docx, .txt)..."
                className="flex-1 w-full bg-surface-2 border border-border rounded-lg p-4 text-xs font-mono focus:ring-2 focus:ring-primary outline-none resize-none custom-scrollbar leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                <span>Plain text or uploaded document</span>
              </div>
            </div>

            {/* Job Description Panel */}
            <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex flex-col h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-ai" />
                  <h2 className="text-lg font-bold">Target Job Description</h2>
                  {jobFileName && (
                    <span className="text-[11px] font-mono text-ai bg-ai/10 px-2 py-0.5 rounded truncate max-w-[150px]">
                      {jobFileName}
                    </span>
                  )}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-ai/10 text-ai hover:bg-ai/20 rounded-md text-sm font-semibold transition-colors">
                  <UploadCloud className="w-4 h-4" /> Upload File
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
                placeholder="Paste the job description you want to apply for..."
                className="flex-1 w-full bg-surface-2 border border-border rounded-lg p-4 text-xs font-mono focus:ring-2 focus:ring-ai outline-none resize-none custom-scrollbar leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                <span>{jobText.split(/\s+/).filter(Boolean).length} words</span>
                <span>Role title, requirements, stack</span>
              </div>
            </div>
          </div>
        )}

        {/* Scan Action Button */}
        {!result && (
          <div className="flex flex-col items-center justify-center mt-6 space-y-2">
            <button
              onClick={handleScan}
              disabled={!resumeText.trim() || !jobText.trim() || isScanning || isFileExtracting}
              className={`relative overflow-hidden group px-8 py-4 rounded-full font-black text-lg transition-all shadow-md ${
                isScanning || isFileExtracting
                  ? 'bg-surface-3 text-text-muted cursor-not-allowed'
                  : 'bg-primary text-white hover:scale-105 hover:shadow-glow-orange cursor-pointer'
              }`}
            >
              {isScanning ? (
                <span className="flex items-center gap-2 relative z-10">
                  <ScanLine className="w-5 h-5 animate-spin" /> Scanning Systems & Reasoning...
                </span>
              ) : isFileExtracting ? (
                <span className="flex items-center gap-2 relative z-10">
                  <UploadCloud className="w-5 h-5 animate-bounce" /> Extracting Document...
                </span>
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  <Brain className="w-5 h-5" /> Analyze My Resume
                </span>
              )}
              {!isScanning && !isFileExtracting && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-hover to-ai opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            <p className="text-xs text-text-muted">
              Evaluates mandatory skills, metric density, ATS layout safety, and recruiter first-glance signals.
            </p>
          </div>
        )}

        {/* Analysis Results View */}
        {result && (
          <div ref={resultsRef} className="animate-fade-in space-y-8">
            {/* Top Bar with Re-scan & Export */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border shadow-xs print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary">Evaluating for:</span>
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold text-xs rounded-md">
                  {result.facts.jd.roleTitle || 'Target Role'}
                </span>
                <span className="text-xs text-text-muted">
                  (Required: {result.facts.seniorityFit.requiredYears} yrs | Candidate: ~
                  {result.facts.seniorityFit.candidateYears} yrs)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ExportActions facts={result.facts} ai={result.ai} />
                <button
                  onClick={() => setResult(null)}
                  className="px-3.5 py-1.5 bg-surface-2 border border-border text-xs font-bold rounded-btn hover:bg-surface-3 text-text transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Try Another Job
                </button>
              </div>
            </div>

            {/* Original Score Card Shell */}
            <div className="bg-surface rounded-card border border-border p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-warning/10 rounded-full blur-3xl -z-10" />

              <div className="shrink-0 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-surface-3 stroke-[12px] fill-none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className={`${getScoreStrokeClass(
                        finalScore
                      )} stroke-[12px] fill-none transition-all duration-1000 ease-out`}
                      style={{
                        strokeDasharray: 440,
                        strokeDashoffset: strokeOffset,
                      }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-foreground">{finalScore}%</span>
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">
                      Match Score
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <h2
                  className={`text-2xl font-bold tracking-tight ${getScoreTextClass(finalScore)}`}
                >
                  {result.ai?.verdict.headline ||
                    (finalScore >= 75
                      ? 'Solid Contender: Strong Technical Alignment'
                      : finalScore >= 50
                      ? "You probably won't get an interview without adjustments."
                      : 'High Rejection Risk: Substantial Skill & Metric Deficits')}
                </h2>

                <p className="text-text-secondary text-sm leading-relaxed">
                  Your resume scored a <strong className="text-text">{finalScore}%</strong> match
                  against this job description. Modern ATS screeners auto-reject profiles below 75%
                  for this stack.
                  {result.facts.missingKeywords.length > 0 && (
                    <span>
                      {' '}
                      You are missing core technologies ({result.facts.missingKeywords.slice(0, 3).join(', ')})
                      explicitly mandated in the requirements.
                    </span>
                  )}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-text-muted font-bold">
                    Market Best Fit: <strong className="text-text">{result.facts.marketPositioning.bestFitTier}</strong>
                  </span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted font-bold">
                    Seniority Match:{' '}
                    <span
                      className={`capitalize ${
                        result.facts.seniorityFit.status === 'fit'
                          ? 'text-success'
                          : result.facts.seniorityFit.status === 'underqualified'
                          ? 'text-danger'
                          : 'text-warning'
                      }`}
                    >
                      {result.facts.seniorityFit.status}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Original Two Panels: Keywords & The Harsh Truth */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Keywords Container */}
              <div className="space-y-6">
                <div className="bg-surface rounded-card p-6 border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-danger" /> Missing Keywords
                    </span>
                    <span className="text-xs font-mono text-danger font-bold">
                      {result.facts.missingKeywords.length} Missing
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.facts.missingKeywords.map((kw: string) => (
                      <span
                        key={kw}
                        className="px-3 py-1.5 bg-danger-bg text-danger text-xs font-bold rounded-md border border-danger/20"
                      >
                        {kw}
                      </span>
                    ))}
                    {result.facts.missingKeywords.length === 0 && (
                      <span className="text-xs text-text-muted italic">All target skills detected!</span>
                    )}
                  </div>
                </div>

                <div className="bg-surface rounded-card p-6 border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" /> Matched Keywords
                    </span>
                    <span className="text-xs font-mono text-success font-bold">
                      {result.facts.matchedKeywords.length} Matched
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.facts.matchedKeywords.map((kw: string) => (
                      <span
                        key={kw}
                        className="px-3 py-1.5 bg-success-bg text-success text-xs font-bold rounded-md border border-success/20"
                      >
                        {kw}
                      </span>
                    ))}
                    {result.facts.matchedKeywords.length === 0 && (
                      <span className="text-xs text-text-muted italic">No matching keywords found.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Harsh Truths Panel */}
              <div className="bg-surface rounded-card p-6 border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" /> The Harsh Truth
                    </span>
                    <span className="text-xs font-mono text-warning font-bold">
                      Recruiter Feedback
                    </span>
                  </h3>
                  <div className="space-y-3.5">
                    {result.facts.harshTruthsDeterministic.map((truth: string, i: number) => (
                      <div
                        key={i}
                        className="flex gap-3 bg-warning/5 p-3.5 rounded-lg border border-warning/15 items-start"
                      >
                        <span className="w-5 h-5 shrink-0 rounded-full bg-warning/20 text-warning flex items-center justify-center text-xs font-black mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed font-sans">{truth}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {result.ai?.harshTruths && result.ai.harshTruths.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border text-[11px] text-text-muted flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-ai" />
                    <span>Evidence-grounded citations verified against your resume bullets.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Extended Analysis Navigation Tabs */}
            <div className="space-y-6 pt-4 print:hidden">
              <div className="border-b border-border flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveTab('breakdown')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'breakdown'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" /> Score Breakdown
                </button>

                <button
                  onClick={() => setActiveTab('skills')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'skills'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> Skill Matrix ({result.facts.skillMatches.length})
                </button>

                <button
                  onClick={() => setActiveTab('bullets')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'bullets'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" /> Bullet Doctor ({result.ai?.bulletRewrites.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('recruiter')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'recruiter'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Recruiter 6-Sec Scan
                </button>

                <button
                  onClick={() => setActiveTab('tiers')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'tiers'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" /> Market Tiers
                </button>

                <button
                  onClick={() => setActiveTab('action')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'action'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <CalendarCheck2 className="w-3.5 h-3.5" /> Action Plan
                </button>

                <button
                  onClick={() => setActiveTab('interview')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'interview'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <MessageSquareCode className="w-3.5 h-3.5" /> Interview Radar
                </button>

                <button
                  onClick={() => setActiveTab('format')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'format'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-secondary hover:text-text hover:bg-surface-2'
                  }`}
                >
                  <FileWarning className="w-3.5 h-3.5" /> Format Audit ({result.facts.formatRisks.length})
                </button>

                <button
                  onClick={() => setActiveTab('stress')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    activeTab === 'stress'
                      ? 'bg-ai text-white shadow-xs'
                      : 'text-ai hover:bg-ai/10'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Market Stress Test
                </button>
              </div>

              {/* Tab Contents */}
              <div className="space-y-6">
                {activeTab === 'breakdown' && (
                  <ScoreBreakdownCard breakdown={result.facts.scoreBreakdown} />
                )}

                {activeTab === 'skills' && (
                  <SkillMatrixTable skillMatches={result.facts.skillMatches} />
                )}

                {activeTab === 'bullets' && (
                  <BulletDoctor
                    bulletRewrites={result.ai?.bulletRewrites || []}
                    bulletAnalyses={result.facts.bulletAnalyses}
                  />
                )}

                {activeTab === 'recruiter' && (
                  <RecruiterScanView
                    verdict={
                      result.ai?.verdict || {
                        headline: 'Candidate Fit Analysis',
                        tone: 'borderline',
                        oneParagraphSummary:
                          'Candidate has foundational qualifications but needs metric quantification.',
                      }
                    }
                    recruiterFirst6Seconds={
                      result.ai?.recruiterFirst6Seconds ||
                      'Glances at company names and missing DevOps infrastructure. Marked as borderline hold.'
                    }
                    isAiPowered={result.isAiAvailable}
                  />
                )}

                {activeTab === 'tiers' && (
                  <MarketPositioningView
                    positioning={result.facts.marketPositioning}
                    aiNotes={result.ai?.marketPositioning}
                  />
                )}

                {activeTab === 'action' && (
                  <ActionPlanChecklist
                    sevenDayPlan={result.ai?.sevenDayPlan || []}
                    thirtyDayPlan={result.ai?.thirtyDayPlan || []}
                  />
                )}

                {activeTab === 'interview' && (
                  <InterviewRisksView questions={result.ai?.interviewRiskQuestions || []} />
                )}

                {activeTab === 'format' && (
                  <FormatAuditView
                    formatRisks={result.facts.formatRisks}
                    formatScore={result.facts.scoreBreakdown.formatSafetyScore}
                  />
                )}

                {activeTab === 'stress' && <MarketStressTester facts={result.facts} />}
              </div>
            </div>

            {/* Session Comparison History */}
            {history.length > 1 && (
              <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-3 print:hidden">
                <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
                  <History className="w-4 h-4 text-primary" /> Session Scan History (Compare JDs)
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setResult(item.response)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        item.response === result
                          ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                          : 'bg-surface-2/60 border-border hover:bg-surface-2'
                      }`}
                    >
                      <div className="text-xs font-bold text-text truncate">{item.role}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-mono font-black text-primary">{item.score}%</span>
                        <span className="text-text-muted">{item.date}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
