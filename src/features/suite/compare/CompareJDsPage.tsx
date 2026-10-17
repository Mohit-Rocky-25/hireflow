// ============================================================
// Suite UI — Compare Job Descriptions (/tools/jd-compare)
// Decision Group: "What should I apply to?"
// Head-to-Head Executive Comparison, Shared Gaps, Overlap Matrix
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
  Grid3X3,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Swords,
  Target,
  ShieldAlert,
  Briefcase,
  MapPin,
  IndianRupee,
  Clock,
  ArrowLeftRight,
  FileText,
  UserCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { PageNav } from '../../../components/common/PageNav';
import { useProfile } from '../profile/ProfileContext';
import { ProfileStatusChip } from '../profile/components/ProfileStatusChip';
import {
  compareJDs,
  CompareJDsResult,
  JDInput,
  SingleJDResult,
  HeadToHeadComparison,
} from './compareJDs';
import {
  COMPARISON_PRESETS,
  SAMPLE_CANDIDATES,
  ComparisonPreset,
  CandidatePersona,
} from './comparePresets';
import { sanitizeCsvCell } from '../../../utils/security';

export function CompareJDsPage() {
  const { profile } = useProfile();
  const [resumeText, setResumeText] = useState<string>('');
  const [activePersonaId, setActivePersonaId] = useState<string>('profile');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(COMPARISON_PRESETS[0].id);
  const [jds, setJds] = useState<JDInput[]>([
    COMPARISON_PRESETS[0].jdA,
    COMPARISON_PRESETS[0].jdB,
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<CompareJDsResult | null>(null);
  const [activeTab, setActiveTab] = useState<'headtohead' | 'ranking' | 'gaps' | 'matrix'>('headtohead');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showResumeDrawer, setShowResumeDrawer] = useState(false);

  // Initialize resume from profile or first sample persona
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (profile?.masterResumeText) {
      setResumeText(profile.masterResumeText);
      setActivePersonaId('profile');
    } else {
      setResumeText(SAMPLE_CANDIDATES[0].resumeText);
      setActivePersonaId(SAMPLE_CANDIDATES[0].id);
    }
  }, [profile]);

  const handleSelectPreset = (preset: ComparisonPreset) => {
    setSelectedPresetId(preset.id);
    setJds([
      { ...preset.jdA, id: 'jd-a' },
      { ...preset.jdB, id: 'jd-b' },
    ]);
    if (result) {
      setResult(null);
    }
  };

  const handleSelectPersona = (persona: CandidatePersona | 'profile') => {
    if (persona === 'profile') {
      setActivePersonaId('profile');
      setResumeText(profile?.masterResumeText || '');
    } else {
      setActivePersonaId(persona.id);
      setResumeText(persona.resumeText);
    }
    if (result) {
      setResult(null);
    }
  };

  const handleSwapRoles = () => {
    if (jds.length !== 2) return;
    setJds([jds[1], jds[0]]);
    if (result) {
      setResult(null);
    }
  };

  const handleAddJD = () => {
    if (jds.length >= 5) return;
    const newId = `jd-${Date.now()}`;
    setJds([
      ...jds,
      {
        id: newId,
        label: `Target Role ${jds.length + 1}`,
        text: '',
        company: '',
        roleTitle: `Role ${jds.length + 1}`,
        experienceLevel: '2+ Years',
        location: 'Remote / Hybrid',
        salaryRange: 'Competitive',
      },
    ]);
  };

  const handleRemoveJD = (id: string) => {
    if (jds.length <= 2) return;
    setJds(jds.filter((j) => j.id !== id));
  };

  const handleUpdateJD = (id: string, field: keyof JDInput, val: string) => {
    setJds(jds.map((j) => (j.id === id ? { ...j, [field]: val } : j)));
  };

  const handleRunCompare = async () => {
    const validResume = resumeText.trim() || profile?.masterResumeText || '';
    if (!validResume) return;

    setIsAnalyzing(true);
    setProgress({ done: 0, total: jds.length });

    try {
      const res = await compareJDs(validResume, jds, (done, total) => {
        setProgress({ done, total });
      });
      setResult(res);
      setActiveTab(res.headToHead ? 'headtohead' : 'ranking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;
    const headers = [
      'Rank',
      'Role',
      'Company',
      'Fit Score',
      'Verdict',
      'Callback Probability',
      'Must-Have Coverage',
      'Readiness',
      'Top Gaps',
    ];
    const rows = result.rankedJDs.map((jd, idx) => [
      sanitizeCsvCell(idx + 1),
      sanitizeCsvCell(jd.label),
      sanitizeCsvCell(jd.company || 'N/A'),
      sanitizeCsvCell(`${jd.score}%`),
      sanitizeCsvCell(jd.verdict),
      sanitizeCsvCell(`${jd.interviewProbability}%`),
      sanitizeCsvCell(`${Math.round(jd.mustHaveCoverage * 100)}% (${jd.mustHaveMet}/${jd.mustHaveTotal})`),
      sanitizeCsvCell(jd.readinessAssessment),
      sanitizeCsvCell(jd.missingMustHaves.concat(jd.missingPreferred).slice(0, 4).join(', ')),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireflow-dual-jd-comparison-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (!result) return;
    let text = '';
    if (result.headToHead) {
      const h2h = result.headToHead;
      text = `=== HIREFLOW JOB COMPARISON REPORT ===\n` +
        `Executive Recommendation: ${h2h.executiveRecommendation}\n` +
        `Strategic Rationale: ${h2h.strategicRationale}\n\n` +
        `ROLE A: ${h2h.jdA.label} — ${h2h.jdA.score}% (Must-Haves: ${Math.round(h2h.jdA.mustHaveCoverage * 100)}%, Est. Callback: ${h2h.jdA.interviewProbability}%)\n` +
        `ROLE B: ${h2h.jdB.label} — ${h2h.jdB.score}% (Must-Haves: ${Math.round(h2h.jdB.mustHaveCoverage * 100)}%, Est. Callback: ${h2h.jdB.interviewProbability}%)\n\n` +
        `Common Core Skills: ${h2h.commonCoreSkills.map((s) => s.name).join(', ')}\n` +
        `Role A Unique: ${h2h.divergence.roleAExclusive.map((s) => s.name).join(', ')}\n` +
        `Role B Unique: ${h2h.divergence.roleBExclusive.map((s) => s.name).join(', ')}\n\n` +
        `Bridge Plan:\n` +
        h2h.bridgePlan.map((s) => `${s.stepNumber}. [${s.targetRole}] ${s.title}: ${s.action}`).join('\n');
    } else {
      text = result.rankedJDs
        .map(
          (jd, i) =>
            `#${i + 1}: ${jd.label} — ${jd.score}% (${jd.verdict})\n  Must-haves: ${Math.round(
              jd.mustHaveCoverage * 100
            )}% (${jd.mustHaveMet}/${jd.mustHaveTotal})`
        )
        .join('\n\n');
    }

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const activePreset = COMPARISON_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-20 px-4 sm:px-6 md:px-8 relative">
      <PageNav onBack={result ? () => setResult(null) : undefined} fallbackRoute="/tools" preferFallback={true} />

      {/* Top Bar with Profile Chip */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <Link to="/tools" className="hover:text-primary transition-colors">Tools</Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-text">Decision Suite</span>
          <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
          <span className="text-primary font-bold">Compare Job Descriptions</span>
        </div>
        <ProfileStatusChip />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header Hero */}
        <div className="text-center max-w-4xl mx-auto mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Swords className="w-3.5 h-3.5 text-primary" /> Head-to-Head Role Evaluation
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            Compare Two Job Descriptions
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Evaluate two competing job opportunities side-by-side. Uncover which role offers higher interview conversion probability, inspect architectural divergence, and generate a step-by-step bridge plan.
          </p>
        </div>

        {/* Curated Presets Bar */}
        <div className="bg-surface border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Real-World Benchmarks</span>
            </div>
            <span className="text-[11px] text-text-muted">
              Calibrated production JDs with realistic engineering stacks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {COMPARISON_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id && !result;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40'
                      : 'bg-surface-2 hover:bg-surface-3 border-border/70 hover:border-border text-text-secondary hover:text-text'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border/80 text-primary uppercase">
                        {preset.badge}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-text line-clamp-1">{preset.title}</div>
                    <div className="text-[11px] text-text-muted line-clamp-2 leading-tight">
                      {preset.keyDivergenceSummary}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {activePreset && !result && (
            <div className="mt-3 p-3 rounded-xl bg-surface-2/60 border border-border/60 text-xs text-text-secondary flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-text">Strategic Context: </span>
                {activePreset.strategicContext}
              </div>
            </div>
          )}
        </div>

        {/* Candidate Resume / Persona Selector */}
        <div className="bg-surface border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-text">Evaluating Candidate Profile</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 border border-border text-text-secondary">
                  {resumeText.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {activePersonaId === 'profile'
                  ? 'Using your active Master Resume from profile'
                  : SAMPLE_CANDIDATES.find((c) => c.id === activePersonaId)?.skillsHeadline || 'Custom resume loaded'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {profile?.masterResumeText && (
              <button
                type="button"
                onClick={() => handleSelectPersona('profile')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePersonaId === 'profile'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-2 hover:bg-surface-3 border border-border text-text-secondary hover:text-text'
                }`}
              >
                My Master Resume
              </button>
            )}

            {SAMPLE_CANDIDATES.map((cand) => (
              <button
                key={cand.id}
                type="button"
                onClick={() => handleSelectPersona(cand)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activePersonaId === cand.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-2 hover:bg-surface-3 border border-border text-text-secondary hover:text-text'
                }`}
              >
                {cand.name} ({cand.experience})
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowResumeDrawer(!showResumeDrawer)}
              className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text-secondary hover:text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              {showResumeDrawer ? 'Hide Resume' : 'View / Edit Resume'}
            </button>
          </div>
        </div>

        {/* Resume View/Edit Drawer */}
        {showResumeDrawer && (
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Candidate Resume Raw Text
              </label>
              <span className="text-xs text-text-muted">
                Edit text to simulate resume revisions
              </span>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setActivePersonaId('custom');
                if (result) setResult(null);
              }}
              placeholder="Paste plain text resume here..."
              className="w-full h-44 bg-surface-2 border border-border rounded-xl p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {/* INPUT PHASE */}
        {!result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text">
                  Job Descriptions ({jds.length} Loaded)
                </h2>
                <p className="text-xs text-text-muted">
                  Dual-column side-by-side comparison mode
                </p>
              </div>

              <div className="flex items-center gap-2">
                {jds.length === 2 && (
                  <button
                    type="button"
                    onClick={handleSwapRoles}
                    className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Swap Role A and Role B"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-primary" /> Swap A &harr; B
                  </button>
                )}
                {jds.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddJD}
                    className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" /> Add 3rd Role
                  </button>
                )}
              </div>
            </div>

            {/* Side-by-Side Dual Column Panels */}
            <div className={`grid grid-cols-1 ${jds.length === 2 ? 'lg:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6`}>
              {jds.map((jd, idx) => {
                const words = jd.text.trim().split(/\s+/).filter(Boolean).length;
                const isShort = words > 0 && words < 20;
                const isRoleA = idx === 0;
                const isRoleB = idx === 1;

                const accentColor = isRoleA
                  ? 'border-emerald-500/30 shadow-emerald-500/5'
                  : isRoleB
                  ? 'border-indigo-500/30 shadow-indigo-500/5'
                  : 'border-border';

                const badgeBg = isRoleA
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isRoleB
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-surface-2 text-text-secondary border-border';

                return (
                  <div
                    key={jd.id}
                    className={`bg-surface border ${accentColor} rounded-2xl p-5 sm:p-6 space-y-4 relative flex flex-col justify-between shadow-lg transition-all`}
                  >
                    {/* Role Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-border/80">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-lg border font-mono ${badgeBg}`}>
                            {idx === 0 ? 'ROLE A' : idx === 1 ? 'ROLE B' : `ROLE ${idx + 1}`}
                          </span>
                          <span className="text-xs font-bold text-text-secondary">
                            {jd.company || (idx === 0 ? 'Primary Target' : 'Benchmark Target')}
                          </span>
                        </div>
                        {jds.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveJD(jd.id)}
                            className="text-text-muted hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Remove Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Aligned Metadata Inputs */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                            Company
                          </label>
                          <div className="flex items-center gap-1.5 bg-surface-2 border border-border/70 rounded-lg px-2.5 py-1.5">
                            <Building2 className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                            <input
                              type="text"
                              value={jd.company || ''}
                              onChange={(e) => handleUpdateJD(jd.id, 'company', e.target.value)}
                              placeholder="e.g. Google"
                              className="bg-transparent text-text font-semibold text-xs focus:outline-none w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                            Role Title
                          </label>
                          <div className="flex items-center gap-1.5 bg-surface-2 border border-border/70 rounded-lg px-2.5 py-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                            <input
                              type="text"
                              value={jd.roleTitle || jd.label}
                              onChange={(e) => {
                                handleUpdateJD(jd.id, 'roleTitle', e.target.value);
                                handleUpdateJD(jd.id, 'label', e.target.value);
                              }}
                              placeholder="e.g. Software Engineer L3"
                              className="bg-transparent text-text font-semibold text-xs focus:outline-none w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                            Seniority &amp; YOE
                          </label>
                          <div className="flex items-center gap-1.5 bg-surface-2 border border-border/70 rounded-lg px-2.5 py-1.5">
                            <Clock className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                            <input
                              type="text"
                              value={jd.experienceLevel || ''}
                              onChange={(e) => handleUpdateJD(jd.id, 'experienceLevel', e.target.value)}
                              placeholder="e.g. 2–4 Years"
                              className="bg-transparent text-text text-xs focus:outline-none w-full"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                            Location / CTC
                          </label>
                          <div className="flex items-center gap-1.5 bg-surface-2 border border-border/70 rounded-lg px-2.5 py-1.5">
                            <MapPin className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                            <input
                              type="text"
                              value={jd.location || ''}
                              onChange={(e) => handleUpdateJD(jd.id, 'location', e.target.value)}
                              placeholder="e.g. Bangalore / ₹30L+"
                              className="bg-transparent text-text text-xs focus:outline-none w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Job Description Textarea */}
                      <div>
                        <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">
                          Production Job Description Text
                        </label>
                        <textarea
                          value={jd.text}
                          onChange={(e) => handleUpdateJD(jd.id, 'text', e.target.value)}
                          placeholder="Paste full job description requirements and responsibilities..."
                          className="w-full h-56 bg-surface-2 border border-border rounded-xl p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-primary leading-relaxed"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted pt-3 border-t border-border/60">
                      <span className="font-mono">{words} words</span>
                      {isShort && (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Min 20 words required
                        </span>
                      )}
                      {words >= 150 && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Rich JD Context
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Run Button */}
            <div className="flex flex-col items-center justify-center pt-4 space-y-3">
              <button
                type="button"
                onClick={handleRunCompare}
                disabled={isAnalyzing || (!resumeText.trim() && !profile?.masterResumeText)}
                className="px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-black hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 inline-flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Evaluating Roles ({progress.done}/{progress.total})...
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" /> Compare &amp; Evaluate Head-to-Head
                  </>
                )}
              </button>
              <p className="text-xs text-text-muted">
                Calculates ATS evidence scores, callback probability deltas, and divergence points
              </p>
            </div>
          </div>
        )}

        {/* RESULTS PHASE */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Control & Tab Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-xs">
              <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-border/80">
                {result.headToHead && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('headtohead')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'headtohead'
                        ? 'bg-text text-bg shadow-xs'
                        : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5 inline mr-1.5" /> Head-to-Head
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('ranking')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'ranking'
                      ? 'bg-text text-bg shadow-xs'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" /> Leaderboard ({result.rankedJDs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gaps')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'gaps'
                      ? 'bg-text text-bg shadow-xs'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Shared Gaps ({result.sharedGaps.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('matrix')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'matrix'
                      ? 'bg-text text-bg shadow-xs'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <Grid3X3 className="w-3.5 h-3.5 inline mr-1.5" /> Overlap Matrix
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-text-tertiary" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy Report'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-text-tertiary" /> Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Edit Inputs
                </button>
              </div>
            </div>

            {/* TAB 1: HEAD-TO-HEAD COMPARISON (Primary View) */}
            {activeTab === 'headtohead' && result.headToHead && (
              <div className="space-y-6 animate-fade-in">
                {/* Executive Verdict Hero Banner */}
                {(() => {
                  const h2h = result.headToHead;
                  const isTie = h2h.winnerId === 'tie';
                  const leadPercent = h2h.scoreDelta;

                  return (
                    <div className="bg-surface border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="space-y-4 relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider">
                            <Target className="w-3.5 h-3.5" /> Strategic Application Verdict
                          </div>
                          {!isTie && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                              +{leadPercent}% Readiness Advantage
                            </span>
                          )}
                        </div>

                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
                            {h2h.executiveRecommendation}
                          </h2>
                          <p className="text-text-secondary text-sm sm:text-base leading-relaxed mt-2 max-w-3xl">
                            {h2h.strategicRationale}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* SIDE-BY-SIDE SYNCHRONIZED COMPARISON CARDS */}
                {(() => {
                  const { jdA, jdB } = result.headToHead;

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                      {/* ROLE A CARD */}
                      <div className="bg-surface border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
                        <div className="space-y-5">
                          {/* Header */}
                          <div className="flex items-center justify-between pb-4 border-b border-border/70">
                            <div className="space-y-1">
                              <span className="text-[11px] font-black px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                ROLE A
                              </span>
                              <h3 className="text-xl font-black text-text mt-1">{jdA.company || jdA.label}</h3>
                              <p className="text-xs text-text-secondary font-medium">{jdA.roleTitle || jdA.label}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                                {jdA.score}%
                              </div>
                              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                                Fit Score
                              </span>
                            </div>
                          </div>

                          {/* Aligned Gauges Grid */}
                          <div className="grid grid-cols-3 gap-2.5 text-center">
                            <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                              <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                                Must-Haves
                              </span>
                              <span className="text-base font-black font-mono text-text">
                                {Math.round(jdA.mustHaveCoverage * 100)}%
                              </span>
                              <span className="block text-[10px] text-text-tertiary mt-0.5">
                                {jdA.mustHaveMet}/{jdA.mustHaveTotal} met
                              </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                              <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                                Callback Odds
                              </span>
                              <span className="text-base font-black font-mono text-emerald-400">
                                ~{jdA.interviewProbability}%
                              </span>
                              <span className="block text-[10px] text-text-tertiary mt-0.5">
                                Estimated
                              </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                              <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                                Readiness
                              </span>
                              <span className="text-xs font-bold text-text line-clamp-1">
                                {jdA.readinessAssessment}
                              </span>
                              <span className="block text-[10px] text-text-tertiary mt-0.5">
                                ATS Status
                              </span>
                            </div>
                          </div>

                          {/* Role Profile Metadata */}
                          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Experience Level:</span>
                              <strong className="text-text">{jdA.experienceLevel || '1–3 Years'}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Location / CTC:</span>
                              <strong className="text-text">{jdA.location || 'Bangalore / Market'}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Verdict Analysis:</span>
                              <strong className="text-emerald-400">{jdA.verdict}</strong>
                            </div>
                          </div>

                          {/* Competency Breakdown */}
                          <div className="space-y-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                              Key Requirements Match ({jdA.matchedSkills.length} Matched / {jdA.missingMustHaves.length + jdA.missingPreferred.length} Missing)
                            </span>

                            {/* Matched */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Qualifications
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {jdA.matchedSkills.slice(0, 8).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {jdA.matchedSkills.length === 0 && (
                                  <span className="text-xs text-text-muted">No exact skill matches</span>
                                )}
                              </div>
                            </div>

                            {/* Missing Must Haves */}
                            {jdA.missingMustHaves.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> High-Risk Gaps (Must-Haves)
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {jdA.missingMustHaves.map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing Preferred */}
                            {jdA.missingPreferred.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Secondary / Preferred Additions
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {jdA.missingPreferred.slice(0, 4).map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Action Footer */}
                        <div className="pt-4 border-t border-border/80 flex items-center justify-between">
                          <span className="text-xs text-text-muted">Need custom tuning?</span>
                          <Link
                            to="/tools/tailor"
                            className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1 transition-colors"
                          >
                            Tailor for Role A <ArrowRight className="w-3.5 h-3.5 text-primary" />
                          </Link>
                        </div>
                      </div>

                      {/* ROLE B CARD */}
                      <div className="bg-surface border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
                        <div className="space-y-5">
                          {/* Header */}
                          <div className="flex items-center justify-between pb-4 border-b border-border/70">
                            <div className="space-y-1">
                              <span className="text-[11px] font-black px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                                ROLE B
                              </span>
                              <h3 className="text-xl font-black text-text mt-1">{jdB.company || jdB.label}</h3>
                              <p className="text-xs text-text-secondary font-medium">{jdB.roleTitle || jdB.label}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-400">
                                {jdB.score}%
                              </div>
                              <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                                Fit Score
                              </span>
                            </div>
                          </div>

                          {/* Aligned Gauges Grid */}
                          <div className="grid grid-cols-3 gap-2.5 text-center">
                            <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                              <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                                Must-Haves
                              </span>
                              <span className="text-base font-black font-mono text-text">
                                {Math.round(jdB.mustHaveCoverage * 100)}%
                              </span>
                              <span className="block text-[10px] text-text-tertiary mt-0.5">
                                {jdB.mustHaveMet}/{jdB.mustHaveTotal} met
                              </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                              <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                                Callback Odds
                              </span>
                              <span className="text-base font-black font-mono text-indigo-400">
                                ~{jdB.interviewProbability}%
                              </span>
                              <span className="block text-[10px] text-text-tertiary mt-0.5">
                                Estimated
                              </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                              <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                                Readiness
                              </span>
                              <span className="text-xs font-bold text-text line-clamp-1">
                                {jdB.readinessAssessment}
                              </span>
                              <span className="block text-[10px] text-text-tertiary mt-0.5">
                                ATS Status
                              </span>
                            </div>
                          </div>

                          {/* Role Profile Metadata */}
                          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Experience Level:</span>
                              <strong className="text-text">{jdB.experienceLevel || '2–4 Years'}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Location / CTC:</span>
                              <strong className="text-text">{jdB.location || 'Bangalore / Market'}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">Verdict Analysis:</span>
                              <strong className="text-indigo-400">{jdB.verdict}</strong>
                            </div>
                          </div>

                          {/* Competency Breakdown */}
                          <div className="space-y-3">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                              Key Requirements Match ({jdB.matchedSkills.length} Matched / {jdB.missingMustHaves.length + jdB.missingPreferred.length} Missing)
                            </span>

                            {/* Matched */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Qualifications
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {jdB.matchedSkills.slice(0, 8).map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {jdB.matchedSkills.length === 0 && (
                                  <span className="text-xs text-text-muted">No exact skill matches</span>
                                )}
                              </div>
                            </div>

                            {/* Missing Must Haves */}
                            {jdB.missingMustHaves.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> High-Risk Gaps (Must-Haves)
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {jdB.missingMustHaves.map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing Preferred */}
                            {jdB.missingPreferred.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Secondary / Preferred Additions
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {jdB.missingPreferred.slice(0, 4).map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Action Footer */}
                        <div className="pt-4 border-t border-border/80 flex items-center justify-between">
                          <span className="text-xs text-text-muted">Need custom tuning?</span>
                          <Link
                            to="/tools/tailor"
                            className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1 transition-colors"
                          >
                            Tailor for Role B <ArrowRight className="w-3.5 h-3.5 text-primary" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* DIVERGENCE & COMMON GROUND BREAKDOWN */}
                {(() => {
                  const h2h = result.headToHead;
                  const { roleAExclusive, roleBExclusive } = h2h.divergence;
                  const commonCore = h2h.commonCoreSkills;

                  return (
                    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/80">
                        <div>
                          <h3 className="text-lg font-bold text-text">Architectural Divergence Analysis</h3>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Understand exactly where these roles branch apart versus where they share common engineering ground.
                          </p>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-text-muted">
                          {commonCore.length} Shared / {roleAExclusive.length + roleBExclusive.length} Unique
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Role A Exclusive */}
                        <div className="p-4 rounded-2xl bg-surface-2/60 border border-emerald-500/25 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-400">
                              Exclusive to {h2h.jdA.company || 'Role A'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                              {roleAExclusive.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted">
                            Technologies and patterns evaluated only by {h2h.jdA.label}:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {roleAExclusive.map((skill) => (
                              <span
                                key={skill.skillId}
                                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                  skill.found
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                    : 'bg-surface-3 text-text-muted border-border/60'
                                }`}
                              >
                                {skill.name} {skill.found ? '✓' : ''}
                              </span>
                            ))}
                            {roleAExclusive.length === 0 && (
                              <span className="text-xs text-text-muted">No unique skills</span>
                            )}
                          </div>
                        </div>

                        {/* Common Core */}
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/25 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-primary">
                              Common Core Ground
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {commonCore.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted">
                            Shared requirements — strengthening these benefits both applications simultaneously:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {commonCore.map((skill) => {
                              const isBothMatched = skill.statusA === 'matched' && skill.statusB === 'matched';
                              const isBothMissing = skill.statusA === 'missing' && skill.statusB === 'missing';

                              return (
                                <span
                                  key={skill.skillId}
                                  className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                    isBothMatched
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                      : isBothMissing
                                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 font-bold'
                                      : 'bg-surface-3 text-text-secondary border-border/60'
                                  }`}
                                >
                                  {skill.name} {isBothMatched ? '✓' : isBothMissing ? '✗' : '~'}
                                </span>
                              );
                            })}
                            {commonCore.length === 0 && (
                              <span className="text-xs text-text-muted">No shared skills</span>
                            )}
                          </div>
                        </div>

                        {/* Role B Exclusive */}
                        <div className="p-4 rounded-2xl bg-surface-2/60 border border-indigo-500/25 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-400">
                              Exclusive to {h2h.jdB.company || 'Role B'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                              {roleBExclusive.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted">
                            Technologies and patterns evaluated only by {h2h.jdB.label}:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {roleBExclusive.map((skill) => (
                              <span
                                key={skill.skillId}
                                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                  skill.found
                                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                    : 'bg-surface-3 text-text-muted border-border/60'
                                }`}
                              >
                                {skill.name} {skill.found ? '✓' : ''}
                              </span>
                            ))}
                            {roleBExclusive.length === 0 && (
                              <span className="text-xs text-text-muted">No unique skills</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* STRATEGIC 3-STEP BRIDGE PLAN */}
                {(() => {
                  const h2h = result.headToHead;

                  return (
                    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-border/80">
                        <div>
                          <h3 className="text-lg font-bold text-text">Strategic Dual-Role Bridge Plan</h3>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Execute these sequenced steps to unlock interview calls at both companies.
                          </p>
                        </div>
                        <span className="text-xs font-bold text-primary flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> High-ROI Actions
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {h2h.bridgePlan.map((step) => (
                          <div
                            key={step.stepNumber}
                            className="p-5 rounded-2xl bg-surface-2 border border-border/80 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-black font-mono flex items-center justify-center">
                                  #{step.stepNumber}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    step.targetRole === 'Both'
                                      ? 'bg-primary/10 text-primary border border-primary/20'
                                      : step.targetRole === 'Role A'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  }`}
                                >
                                  Targets: {step.targetRole}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-text">{step.title}</h4>
                              <p className="text-xs text-text-secondary leading-relaxed">{step.action}</p>
                            </div>

                            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                              <span className="text-emerald-400 font-bold">{step.impact}</span>
                              <span className="text-text-muted text-[11px] font-mono">~{step.estimatedHours}h effort</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <Link
                          to="/tools/tailor"
                          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
                        >
                          Launch Resume Tailor <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to="/tools/build-briefs"
                          className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1.5 transition-colors"
                        >
                          Generate Project Briefs <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 2: RANKING & SCORES */}
            {activeTab === 'ranking' && (
              <div className="space-y-4">
                {result.rankedJDs.map((jd, idx) => (
                  <div
                    key={jd.id}
                    className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black font-mono flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-text">{jd.label}</h3>
                            {jd.company && (
                              <span className="text-xs px-2 py-0.5 rounded bg-surface-2 border border-border text-text-secondary">
                                {jd.company}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{jd.verdictReason}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            jd.verdict === 'Strong fit'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : jd.verdict === 'Close'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {jd.verdict}
                        </span>
                        <div className="text-right">
                          <span className="text-2xl font-black font-mono text-primary">
                            {jd.score}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-border/60 text-xs">
                      <div>
                        <span className="text-text-muted">Must-Have Alignment:</span>{' '}
                        <strong className="text-text">
                          {Math.round(jd.mustHaveCoverage * 100)}% ({jd.mustHaveMet}/{jd.mustHaveTotal})
                        </strong>
                      </div>
                      <div>
                        <span className="text-text-muted">Estimated Callback:</span>{' '}
                        <strong className="text-emerald-400 font-bold">~{jd.interviewProbability}%</strong>
                      </div>
                      <div>
                        <span className="text-text-muted">Readiness Assessment:</span>{' '}
                        <strong className="text-text">{jd.readinessAssessment}</strong>
                      </div>
                    </div>

                    {/* Top 3 Fixes for this role */}
                    {jd.topFixes.length > 0 && (
                      <div className="pt-4 space-y-2">
                        <span className="text-xs font-bold text-text-tertiary uppercase tracking-wider">
                          Top Impact Fixes for this Role
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {jd.topFixes.map((fix) => (
                            <div
                              key={fix.skillId}
                              className="p-2.5 rounded-xl bg-surface-2 border border-border/80 text-xs flex items-center justify-between"
                            >
                              <span className="font-semibold text-text">{fix.skillName}</span>
                              <span className="text-emerald-400 font-bold">+{fix.gain}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SHARED Gaps */}
            {activeTab === 'gaps' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-surface border border-border">
                  <h3 className="text-sm font-bold text-text">
                    Cross-Application Leverage Opportunities
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Fix these competencies once to simultaneously boost multiple job applications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sharedGaps.map((gap) => (
                    <div
                      key={gap.skillId}
                      className="bg-surface border border-border rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-text">{gap.skillName}</h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            Missing in {gap.jdsMissingCount} JDs
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          Appears in: {gap.jdsMissingLabels.join(', ')}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <span className="text-text-muted">Total Potential Gain:</span>
                        <strong className="text-emerald-400 font-bold">
                          +{gap.totalSimulatedGain}% combined improvement
                        </strong>
                      </div>
                    </div>
                  ))}

                  {result.sharedGaps.length === 0 && (
                    <div className="p-8 text-center text-xs text-text-muted col-span-2">
                      No multi-role shared gaps detected across these job descriptions.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: OVERLAP MATRIX */}
            {activeTab === 'matrix' && (
              <div className="bg-surface border border-border rounded-2xl p-5 overflow-x-auto space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-border/80">
                  <span className="font-bold text-text">
                    Competency Matrix ({result.matrix.skills.length} skills tracked)
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Exact
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Alias
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Implied
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" /> Related
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Missing
                    </span>
                  </div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-text-muted">
                      <th className="py-2.5 px-3 font-semibold">Skill / Competency</th>
                      {result.rankedJDs.map((jd) => (
                        <th key={jd.id} className="py-2.5 px-3 font-semibold truncate max-w-[140px]">
                          {jd.company || jd.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    {result.matrix.skills.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-2/40 transition-colors">
                        <td className="py-2 px-3 font-sans font-medium text-text">{s.name}</td>
                        {result.rankedJDs.map((jd) => {
                          const tier = result.matrix.cells[s.id]?.[jd.id] || 'missing';
                          const color =
                            tier === 'exact'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : tier === 'alias'
                              ? 'text-sky-400 bg-sky-500/10'
                              : tier === 'implied'
                              ? 'text-amber-400 bg-amber-500/10'
                              : tier === 'related'
                              ? 'text-violet-400 bg-violet-500/10'
                              : 'text-rose-400 bg-rose-500/10';

                          return (
                            <td key={jd.id} className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>
                                {tier}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
