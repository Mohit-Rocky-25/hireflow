/**
 * HireFlow: Scoring Methodology & Provenance Page (Stage 6)
 * Built strictly from CANONICAL_SCORING_SPEC and provenance.generated.json.
 * Zero hardcoded scoring weights, zero UI arithmetic, zero banned claims.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  Calculator,
  Database,
  AlertTriangle,
  Copy,
  Check,
  FileCode,
  Download,
  Info,
  Target,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronDown,
  Play,
  ArrowRight,
  ExternalLink,
  Eye,
  BarChart3,
  BadgeCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CANONICAL_SCORING_SPEC } from '../../scoring/spec/canonicalSpec';
import { computeSpecFingerprint } from '../../scoring/core/fingerprint';
import { runScoringEngine } from '../../scoring/core/traceBuilder';
import { buildScoringContext } from '../../scoring/core/context';
import { parseResumeToScoringInput } from '../../scoring/core/resumeParser';
import { parseJobDescription } from '../../scoring/core/jdParser';
import { buildZeroPiiReportPayload } from '../../scoring/core/reportPayload';
import { SYNTHETIC_FIXTURES, SyntheticFixture } from '../../scoring/__fixtures__/syntheticFixtures';
import provenanceData from '../../data/provenance.generated.json';
import { useFeedbackStore } from '../../store/feedbackStore';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { copyDiagnosticPayload, generateDiagnosticPayload } from '../../lib/diagnostics/reportWrongResult';
import { ScoreTrace, PillarTraceItem } from '../../scoring/core/types';
import { ExperienceLevel } from '../../scoring/spec/types';

// Feature-to-Pillar Canonical Mapping Table (Rule A3)
const SINGLE_COUNTING_MAPPING = [
  {
    feature: 'Mandatory Technical Skills (Direct & Transferable)',
    pillar: 'Requirement Coverage',
    pillarId: 'requirement_coverage',
    howEvaluated: 'Keyword boundary matching against target job description requirements with taxonomy synonyms.',
    prohibitedIn: 'Evidence Quality, Project Readiness, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Preferred / Secondary Skills',
    pillar: 'Requirement Coverage',
    pillarId: 'requirement_coverage',
    howEvaluated: 'Secondary technology stack coverage with placement-based sub-weighting.',
    prohibitedIn: 'Evidence Quality, Project Readiness, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Action Verbs (Strong vs Standard vs Passive)',
    pillar: 'Evidence Quality',
    pillarId: 'evidence_quality',
    howEvaluated: 'Bullet-level syntax evaluation for decisive engineering action verbs.',
    prohibitedIn: 'Requirement Coverage, Project Readiness, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Measured Outcome Metrics (% latency, QPS, scale)',
    pillar: 'Evidence Quality',
    pillarId: 'evidence_quality',
    howEvaluated: 'Regex numerical metrics tied to nouns within work and project bullet points.',
    prohibitedIn: 'Requirement Coverage, Project Readiness, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Skills Demonstrated in Active Operational Context',
    pillar: 'Evidence Quality',
    pillarId: 'evidence_quality',
    howEvaluated: 'Keywords used alongside decisive action and outcome (not bare skills lists).',
    prohibitedIn: 'Requirement Coverage, Project Readiness, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Architecture & Systems Depth (queuing, caching, pipelines)',
    pillar: 'Project & Practical Readiness',
    pillarId: 'project_readiness',
    howEvaluated: 'Presence of engineering systems concepts (Redis, Kafka, Docker, indexing).',
    prohibitedIn: 'Requirement Coverage, Evidence Quality, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Production Rigor (automated testing, CI/CD, Docker)',
    pillar: 'Project & Practical Readiness',
    pillarId: 'project_readiness',
    howEvaluated: 'Verifiable traces of unit tests, integration tests, containerization, or workflows.',
    prohibitedIn: 'Requirement Coverage, Evidence Quality, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Practical Artifacts (live URLs, GitHub repositories)',
    pillar: 'Project & Practical Readiness',
    pillarId: 'project_readiness',
    howEvaluated: 'Live demo links, competitive programming profiles, and repository references.',
    prohibitedIn: 'Requirement Coverage, Evidence Quality, Parser-Friendliness, Experience Fit',
  },
  {
    feature: 'Section Hierarchy & Layout Extractability',
    pillar: 'Parser-Friendliness',
    pillarId: 'parser_friendliness',
    howEvaluated: 'Standard section titles (Experience, Education, Projects, Skills) and linear text flow.',
    prohibitedIn: 'Requirement Coverage, Evidence Quality, Project Readiness, Experience Fit',
  },
  {
    feature: 'Regional Campus Advisories (photos, declarations)',
    pillar: 'Parser-Friendliness (Advisories Only)',
    pillarId: 'parser_friendliness',
    howEvaluated: 'Generates helpful regional guidance; zero score deductions are applied.',
    prohibitedIn: 'All other pillars',
  },
  {
    feature: 'Career Tenure & Seniority Alignment',
    pillar: 'Experience & Seniority Fit',
    pillarId: 'experience_fit',
    howEvaluated: 'Continuous piecewise tenure curve against role minimum years (excluded for freshers).',
    prohibitedIn: 'Requirement Coverage, Evidence Quality, Project Readiness, Parser-Friendliness',
  },
];

const DIAGNOSTIC_METRIC_OPTIONS = [
  { value: 'resume-match-estimate', label: 'Resume Match Estimate' },
  { value: 'requirement-coverage', label: 'Requirement Coverage Pillar' },
  { value: 'evidence-quality', label: 'Evidence Quality Pillar' },
  { value: 'project-readiness', label: 'Project Readiness Pillar' },
  { value: 'parser-friendliness', label: 'Parser-Friendliness Check' },
  { value: 'experience-fit', label: 'Experience Fit Pillar' },
];

export function MethodologyPage() {
  const spec = CANONICAL_SCORING_SPEC;
  const specFingerprint = useMemo(() => computeSpecFingerprint(spec), [spec]);

  // Try the engine interactive state
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(SYNTHETIC_FIXTURES[0].id);
  const [activeTab, setActiveTab] = useState<'simulator' | 'pillars' | 'provenance' | 'validation'>('simulator');
  const [copiedTrace, setCopiedTrace] = useState(false);
  const [copiedDiagnostic, setCopiedDiagnostic] = useState(false);
  const [showDiagnosticJson, setShowDiagnosticJson] = useState(false);

  // Diagnostic utility state
  const [selectedDiagnosticMetric, setSelectedDiagnosticMetric] = useState('resume-match-estimate');
  const [diagnosticJson, setDiagnosticJson] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFixture = useMemo<SyntheticFixture>(() => {
    return SYNTHETIC_FIXTURES.find((f) => f.id === selectedFixtureId) || SYNTHETIC_FIXTURES[0];
  }, [selectedFixtureId]);

  // Execute engine in real time on selected fixture
  const liveTrace = useMemo<ScoreTrace>(() => {
    const parsedJd = selectedFixture.jdText ? parseJobDescription(selectedFixture.jdText) : undefined;
    const expLevel: ExperienceLevel =
      selectedFixture.experienceLevel === '3+ yrs' ? '2+ yrs' : selectedFixture.experienceLevel;
    const context = buildScoringContext({
      experienceLevel: expLevel,
      roleFamily: selectedFixture.roleFamily,
      parsedJd,
      archetype:
        selectedFixture.targetTier === 'top_product'
          ? 'big_tech_product'
          : selectedFixture.targetTier === 'unicorn'
            ? 'indian_high_growth'
            : selectedFixture.targetTier === 'gcc'
              ? 'product_mnc_gcc'
              : selectedFixture.targetTier === 'it_services'
                ? 'service_track'
                : selectedFixture.targetTier === 'startup'
                  ? 'early_growth_startup'
                  : undefined,
    });
    const resumeInput = parseResumeToScoringInput(selectedFixture.resumeText);
    return runScoringEngine(context, resumeInput);
  }, [selectedFixture]);

  // Zero-PII payload for live trace
  const zeroPiiPayload = useMemo(() => {
    return buildZeroPiiReportPayload(liveTrace, 'Methodology page interactive simulator trace inspection');
  }, [liveTrace]);

  const feedbackItems = useFeedbackStore((s) => s.items);
  const exportFeedbackJson = useFeedbackStore((s) => s.exportFeedbackJson);

  const feedbackStats = useMemo(() => {
    let up = 0;
    let down = 0;
    for (const it of feedbackItems) {
      if (it.verdict === 'up') up++;
      else if (it.verdict === 'down') down++;
    }
    return { total: feedbackItems.length, up, down };
  }, [feedbackItems]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleCopyTraceJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(zeroPiiPayload, null, 2));
      setCopiedTrace(true);
      setTimeout(() => setCopiedTrace(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyDiagnostic = async (metricId: string) => {
    const success = await copyDiagnosticPayload(metricId);
    if (success) {
      setCopiedDiagnostic(true);
      setTimeout(() => setCopiedDiagnostic(false), 2000);
    }
  };

  const handlePreviewDiagnostic = () => {
    const payload = generateDiagnosticPayload(selectedDiagnosticMetric);
    setDiagnosticJson(JSON.stringify(payload, null, 2));
  };

  const handleExportFeedback = () => {
    const jsonStr = exportFeedbackJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireflo-feedback-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative">
      <PublicNavbar />
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Title Header */}
        <div className="border-b border-charcoal pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 text-volt text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-volt/20">
            <Scale className="h-3.5 w-3.5" />
            <span>Deterministic Scoring Specification &bull; Open Provenance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Scoring Methodology &amp; Provenance
          </h1>
          <p className="mt-3 text-base text-neutral-400 max-w-4xl leading-relaxed">
            HireFlo operates on a single machine-readable canonical specification. Every metric, weight,
            sensitivity band, and dynamic context profile derives directly from{' '}
            <code className="text-volt font-mono">CANONICAL_SCORING_SPEC</code> with zero UI arithmetic,
            zero network egress, and client-side execution.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 bg-surface p-3.5 rounded-md border border-charcoal">
            <span>Spec Version: <strong className="text-white">{spec.specVersion}</strong></span>
            <span className="text-charcoal">&bull;</span>
            <span>Engine Version: <strong className="text-white">{spec.engineVersion}</strong></span>
            <span className="text-charcoal">&bull;</span>
            <span>Spec Fingerprint: <strong className="text-volt">{specFingerprint}</strong></span>
            <span className="text-charcoal">&bull;</span>
            <span>Provenance Datasets: <strong className="text-white">{provenanceData.datasets.length} Audited</strong></span>
            {feedbackStats.total > 0 && (
              <>
                <span className="text-charcoal">&bull;</span>
                <span>Feedback Recorded: <strong className="text-white">{feedbackStats.total}</strong> ({feedbackStats.up} &#128077; / {feedbackStats.down} &#128078;)</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-charcoal pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-volt text-black font-bold shadow-sm'
                : 'bg-surface text-neutral-300 hover:text-white border border-charcoal'
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Try the Engine (Live Trace)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pillars')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'pillars'
                ? 'bg-volt text-black font-bold shadow-sm'
                : 'bg-surface text-neutral-300 hover:text-white border border-charcoal'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>5 Canonical Pillars</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('validation')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'validation'
                ? 'bg-volt text-black font-bold shadow-sm'
                : 'bg-surface text-neutral-300 hover:text-white border border-charcoal'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Validation &amp; Invariants</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('provenance')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'provenance'
                ? 'bg-volt text-black font-bold shadow-sm'
                : 'bg-surface text-neutral-300 hover:text-white border border-charcoal'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Data Provenance (P-6)</span>
          </button>
        </div>

        {/* Section: Index Architecture & Single-Counting Guarantees (Rule A3) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Canonical Index Architecture &amp; Single-Counting Guarantees
            </h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            HireFlo maintains two diagnostic estimates powered by the identical core scoring specification:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-md border border-charcoal bg-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-volt font-bold tracking-wider">ATS Resume Roaster</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/20">
                  Target Role Focused
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Resume Match Estimate</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Evaluates candidate resume evidence against a specific job description. Analyzes requirement coverage,
                action verbs, metric outcomes, and parser safety. If no job description is provided, runs in role baseline mode.
              </p>
            </div>

            <div className="rounded-md border border-charcoal bg-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-volt font-bold tracking-wider">TalentLens Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/20">
                  Market Archetype Focused
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Market Readiness Estimate</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Evaluates candidate resume evidence across 6 distinct market archetypes (Big Tech, Quant Trading,
                Indian Scale-Ups, Enterprise GCCs, IT Services, and Early Startups) with calibrated archetype weightings.
              </p>
            </div>
          </div>

          {/* Rule A3 Single-Counting Table */}
          <div className="rounded-md border border-charcoal bg-surface p-5 space-y-4">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-volt" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Rule A3: Single-Counting Architectural Guarantee
              </h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every resume feature is evaluated in <strong className="text-white">exactly ONE pillar</strong>.
              No signal is counted twice, and no parallel duplicate indices measure the same candidate attribute.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-surface-elevated text-neutral-400 uppercase font-mono font-semibold text-[11px] border-b border-charcoal">
                  <tr>
                    <th className="p-3">Candidate Signal / Feature</th>
                    <th className="p-3">Exclusive Home Pillar</th>
                    <th className="p-3">How It Is Evaluated</th>
                    <th className="p-3">Strictly Prohibited In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal font-normal">
                  {SINGLE_COUNTING_MAPPING.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{item.feature}</td>
                      <td className="p-3 font-mono text-volt">{item.pillar}</td>
                      <td className="p-3 text-neutral-300">{item.howEvaluated}</td>
                      <td className="p-3 text-neutral-500 font-mono text-[11px]">{item.prohibitedIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Tab 1: Interactive "Try the engine" Live Simulator Panel */}
        {activeTab === 'simulator' && (
          <section className="space-y-6 rounded-md border border-charcoal bg-surface p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-volt/10 text-volt border border-volt/20 uppercase tracking-wider mb-2">
                  <Play className="h-3 w-3" />
                  <span>Interactive Engine Demonstration</span>
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  Live Trace Inspector
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Select any of the 24 canonical synthetic fixtures. The core engine executes client-side and produces an authoritative <code className="text-neutral-200">ScoreTrace</code>.
                </p>
              </div>

              {/* Fixture Selector Dropdown */}
              <div className="w-full sm:w-80 space-y-1.5">
                <label htmlFor="fixture-select" className="text-[11px] font-mono text-neutral-400 uppercase block">
                  Select Synthetic Fixture:
                </label>
                <select
                  id="fixture-select"
                  aria-label="Select Synthetic Fixture"
                  value={selectedFixtureId}
                  onChange={(e) => setSelectedFixtureId(e.target.value)}
                  className="w-full rounded border border-charcoal bg-black px-3 py-2 text-xs font-mono text-white focus:border-volt focus:outline-none"
                >
                  {SYNTHETIC_FIXTURES.map((fixture) => (
                    <option key={fixture.id} value={fixture.id}>
                      {fixture.label} ({fixture.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fixture Info Card */}
            <div className="p-4 rounded bg-surface-elevated border border-charcoal grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">Experience Level</span>
                <span className="text-white font-bold">{selectedFixture.experienceLevel}</span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">Role Family</span>
                <span className="text-white font-bold">{selectedFixture.roleFamily}</span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">Category</span>
                <span className="text-volt font-bold">{selectedFixture.category}</span>
              </div>
              <div>
                <span className="text-neutral-500 uppercase block text-[10px]">Target Tier</span>
                <span className="text-neutral-300 font-bold">{selectedFixture.targetTier || 'Standard Technology Track'}</span>
              </div>
              <div className="sm:col-span-4 text-neutral-400 font-sans text-xs border-t border-charcoal pt-2">
                <strong className="text-neutral-300 font-mono text-xs">Profile Description: </strong>
                {selectedFixture.description}
              </div>
            </div>

            {/* Live Trace Score Summary Banner */}
            <div className="p-6 rounded-md border border-volt/30 bg-gradient-to-r from-black via-surface-elevated to-black flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-volt font-bold tracking-wider">
                  Authoritative ScoreTrace Estimate
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                    {liveTrace.compositeDisplay}
                  </span>
                  <span className="text-lg text-neutral-400 font-mono">/ 100</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-volt/15 text-volt border border-volt/30 ml-2">
                    {liveTrace.band.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 pt-1">
                  <span>Sensitivity Band:</span>
                  <span className="text-white font-bold">[{liveTrace.band.low} &ndash; {liveTrace.band.high}]</span>
                  <span className="text-charcoal">&bull;</span>
                  <span>Active Profile:</span>
                  <span className="text-volt font-bold uppercase">{liveTrace.profileId}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDiagnosticJson((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-medium border border-charcoal bg-black text-neutral-200 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-volt" />
                  <span>{showDiagnosticJson ? 'Hide Trace Payload' : 'Inspect Zero-PII Payload'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyTraceJson}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono font-bold bg-volt text-black hover:bg-volt-hover transition-colors cursor-pointer"
                >
                  {copiedTrace ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-black" />
                      <span>Copied Trace JSON!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-black" />
                      <span>Copy Sanitized Trace</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Trace 5 Pillars Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold tracking-wider">
                Live Pillar Trace Breakdown (Dynamic Renormalization)
              </h3>
              <div className="overflow-x-auto rounded-md border border-charcoal bg-black">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-surface text-neutral-400 uppercase font-mono font-semibold text-[11px] border-b border-charcoal">
                    <tr>
                      <th className="p-3">Pillar Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 font-mono">Nominal Wt</th>
                      <th className="p-3 font-mono">Effective Wt</th>
                      <th className="p-3 font-mono">Raw Score</th>
                      <th className="p-3 font-mono">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal font-mono text-xs">
                    {liveTrace.pillars.map((p: PillarTraceItem) => {
                      const isApplicable = p.applicable;
                      return (
                        <tr key={p.id} className="hover:bg-surface-elevated/30 transition-colors">
                          <td className="p-3 font-sans font-semibold text-white">
                            {p.label}
                            {!isApplicable && p.notApplicableReason && (
                              <span className="block text-[11px] font-sans text-neutral-500 font-normal">
                                {p.notApplicableReason}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {isApplicable ? (
                              <span className="text-emerald-400 text-[11px] uppercase font-bold">Evaluated</span>
                            ) : (
                              <span className="text-neutral-500 text-[11px] uppercase">Excluded</span>
                            )}
                          </td>
                          <td className="p-3 text-neutral-400">{p.nominalWeight}%</td>
                          <td className="p-3 text-volt font-bold">{Math.round(p.effectiveWeight * 100)}%</td>
                          <td className="p-3 text-white font-bold">{p.rawScore} / 100</td>
                          <td className="p-3 text-volt font-bold">{Math.round(p.contribution)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">
                * When Experience Fit is excluded for fresher roles, effective weights dynamically renormalize to guarantee a 100-point composite sum.
              </p>
            </div>

            {/* Zero-PII Payload Preview */}
            {showDiagnosticJson && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Zero-PII Diagnostic Snapshot (Scrubbed Names, Emails, Phones):</span>
                  <span className="text-volt">Stamped: {liveTrace.specFingerprint}</span>
                </div>
                <pre className="rounded border border-charcoal bg-black p-4 text-xs font-mono text-volt overflow-x-auto max-h-72">
                  {JSON.stringify(zeroPiiPayload, null, 2)}
                </pre>
              </div>
            )}
          </section>
        )}

        {/* Tab 2: The 5 Canonical Pillars & Sub-Features */}
        {activeTab === 'pillars' && (
          <section className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-volt" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  The Five Canonical Evaluation Pillars
                </h2>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Rendered directly from <code className="text-neutral-300">CANONICAL_SCORING_SPEC.pillars</code>.
                Weights adapt dynamically based on candidate experience level and market context:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {spec.pillars.map((pillar, idx) => (
                <div key={pillar.id} className="rounded-md border border-charcoal bg-surface p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal pb-3">
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-volt/10 text-volt text-xs font-mono font-bold flex items-center justify-center border border-volt/20">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white">{pillar.label}</h3>
                      <code className="text-[11px] font-mono text-neutral-500">({pillar.id})</code>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-neutral-400">
                        Fresher: <strong className="text-volt">{pillar.nominalWeights.fresher}%</strong>
                      </span>
                      <span className="text-charcoal">&bull;</span>
                      <span className="text-neutral-400">
                        Experienced: <strong className="text-white">{pillar.nominalWeights.experienced}%</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">{pillar.plainDescription}</p>

                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">
                      Sub-Features &amp; Rubric Components:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {pillar.subFeatures.map((sub) => (
                        <div key={sub.id} className="p-3 rounded bg-surface-elevated border border-charcoal space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-volt font-bold">
                              {sub.nominalWeight}% Sub-Weight
                            </span>
                            <span className="text-[9px] font-mono text-neutral-500 uppercase">{sub.sourceKind}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white">{sub.label}</h4>
                          <p className="text-[11px] text-neutral-400 leading-normal">{sub.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Market Archetype Profiles */}
            <div className="space-y-4 pt-4 border-t border-charcoal">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-volt" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                  Dynamic Market Archetypes (TalentLens)
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                TalentLens calibrates pillar weights against 6 distinct hiring archetypes:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(spec.archetypeProfiles || {}).map(([key, arch]) => (
                  <div key={key} className="p-4 rounded-md border border-charcoal bg-surface space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-volt font-bold uppercase">{arch.label}</span>
                      <span className="text-[10px] font-mono text-neutral-500">{arch.id}</span>
                    </div>
                    <p className="text-xs text-neutral-300">{arch.note}</p>
                    <div className="space-y-1 text-xs font-mono border-t border-charcoal pt-2 text-neutral-400">
                      <div className="flex justify-between">
                        <span>Req Coverage:</span>
                        <span className="text-white font-bold">{arch.weights.requirement_coverage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Evidence Quality:</span>
                        <span className="text-white font-bold">{arch.weights.evidence_quality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Project Readiness:</span>
                        <span className="text-white font-bold">{arch.weights.project_readiness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parser Safety:</span>
                        <span className="text-white font-bold">{arch.weights.parser_friendliness}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Depth & Bullet Scoring Rubric */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-charcoal">
              {/* Context Weights */}
              <div className="p-4 rounded-md border border-charcoal bg-surface space-y-3">
                <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                  Placement Context Multipliers
                </h4>
                <dl className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Experience Section</dt>
                    <dd className="text-volt font-bold">{spec.evidenceTables.contextWeight.experience}x</dd>
                  </div>
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Project with Live Link</dt>
                    <dd className="text-white font-bold">{spec.evidenceTables.contextWeight.projectWithLink}x</dd>
                  </div>
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Academic Project</dt>
                    <dd className="text-neutral-300 font-bold">{spec.evidenceTables.contextWeight.academicProject}x</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-400">Skills Block Only</dt>
                    <dd className="text-neutral-500 font-bold">{spec.evidenceTables.contextWeight.skillsBlockOnly}x</dd>
                  </div>
                </dl>
              </div>

              {/* Requirement Priority Weights */}
              <div className="p-4 rounded-md border border-charcoal bg-surface space-y-3">
                <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                  Requirement Priority Multipliers
                </h4>
                <dl className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Mandatory / Must-Have</dt>
                    <dd className="text-volt font-bold">{spec.evidenceTables.priorityWeights.mandatory}x</dd>
                  </div>
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Preferred / Good-to-Have</dt>
                    <dd className="text-white font-bold">{spec.evidenceTables.priorityWeights.preferred}x</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-400">Mentioned in Passing</dt>
                    <dd className="text-neutral-400 font-bold">{spec.evidenceTables.priorityWeights.mentioned}x</dd>
                  </div>
                </dl>
              </div>

              {/* Bullet Scoring Maximums */}
              <div className="p-4 rounded-md border border-charcoal bg-surface space-y-3">
                <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">
                  100-Point Bullet Scoring Rubric
                </h4>
                <dl className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Decisive Action Verb</dt>
                    <dd className="text-volt font-bold">{spec.evidenceTables.bulletScoring.actionVerbMax} pts</dd>
                  </div>
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Measured Numerical Metric</dt>
                    <dd className="text-volt font-bold">{spec.evidenceTables.bulletScoring.measuredResultMax} pts</dd>
                  </div>
                  <div className="flex justify-between border-b border-charcoal pb-1">
                    <dt className="text-neutral-400">Technology in Action</dt>
                    <dd className="text-volt font-bold">{spec.evidenceTables.bulletScoring.techInContextMax} pts</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-400">Outcome &amp; Business Impact</dt>
                    <dd className="text-volt font-bold">{spec.evidenceTables.bulletScoring.outcomeImpactMax} pts</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        )}

        {/* Tab 3: Validation Status & Invariants (Task 6.4) */}
        {activeTab === 'validation' && (
          <section className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-volt" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  Validation Status &amp; Invariant Verification
                </h2>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Clear and honest documentation of what the HireFlo scoring suite programmatically verifies versus its boundaries and limitations:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: What IS Programmatically Checked */}
              <div className="rounded-md border border-emerald-500/30 bg-surface p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Programmatically Checked &amp; Enforced
                  </h3>
                </div>
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-mono">Boundary-Safe Tokenization:</strong>
                      <span>Word-boundary regular expressions prevent false-positive substring matches (e.g., &ldquo;Go&rdquo; vs &ldquo;Google&rdquo;).</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-mono">Metamorphic Monotonicity:</strong>
                      <span>Adding authentic requirement evidence or measured engineering outcomes never decreases candidate scores.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-mono">Rule A3 Single-Counting Invariant:</strong>
                      <span>Every feature lives in exactly one pillar. Unit tests enforce zero duplicate signal accumulation.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-mono">Continuous Piecewise Seniority:</strong>
                      <span>Smooth experience curve prevents cliff-edge score penalties for minor tenure differences.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-mono">100% Client-Side Evaluation:</strong>
                      <span>Zero network requests during scoring. All tokenization, parsing, and math execute in your local browser sandbox.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-mono">Zero-PII Diagnostic Redaction:</strong>
                      <span>Names, phone numbers, email addresses, URLs, and street addresses are systematically scrubbed prior to any export.</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Box 2: What IS NOT Checked & Honest Limitations */}
              <div className="rounded-md border border-neutral-700 bg-surface p-6 space-y-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Boundaries &amp; Honest Limitations
                  </h3>
                </div>
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-mono font-bold shrink-0">&times;</span>
                    <div>
                      <strong className="text-white block font-mono">No Real Callback Probabilities:</strong>
                      <span>HireFlo provides an internal estimate of requirement coverage; we do not claim to predict real-world employer interview callbacks.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-mono font-bold shrink-0">&times;</span>
                    <div>
                      <strong className="text-white block font-mono">No Live Code Execution:</strong>
                      <span>We evaluate claimed skills and metrics in text; we do not run unit tests on candidate code or execute remote repositories.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-mono font-bold shrink-0">&times;</span>
                    <div>
                      <strong className="text-white block font-mono">Heuristic Layout Extraction:</strong>
                      <span>Text extractors cannot assess visual PDF typography bounding boxes; parser checks are heuristic benchmarks.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-mono font-bold shrink-0">&times;</span>
                    <div>
                      <strong className="text-white block font-mono">Unverified External Data:</strong>
                      <span>Any dataset lacking direct automated verification is marked as &ldquo;Source pending&rdquo; in our provenance registry.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: Data Provenance Table (Task 6.5) */}
        {activeTab === 'provenance' && (
          <section className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-volt" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  Data Provenance &amp; Calibration Baselines (P-6)
                </h2>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Rendered strictly from <code className="text-neutral-300">src/data/provenance.generated.json</code>.
                Every dataset logged includes purpose, verification status, derived counts, and documented limitations:
              </p>
            </div>

            <div className="overflow-x-auto rounded-md border border-charcoal bg-surface">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-surface-elevated text-neutral-400 uppercase font-mono font-semibold text-[11px] border-b border-charcoal">
                  <tr>
                    <th className="p-3">Dataset / Asset</th>
                    <th className="p-3">Purpose &amp; Scope</th>
                    <th className="p-3">Source Reference</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 font-mono">Derived Metrics</th>
                    <th className="p-3">Documented Biases &amp; Limits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal font-normal">
                  {provenanceData.datasets.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="p-3 font-semibold text-white">
                        {row.name}
                        <code className="block text-[10px] font-mono text-neutral-500 font-normal">{row.id}</code>
                      </td>
                      <td className="p-3 text-neutral-300 max-w-xs">{row.purpose}</td>
                      <td className="p-3 font-mono text-neutral-400 max-w-[200px] break-all">{row.source}</td>
                      <td className="p-3">
                        {row.status === 'verified' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            Audited
                          </span>
                        )}
                        {row.status === 'editorial' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                            Editorial
                          </span>
                        )}
                        {row.status === 'unverified' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                            Source Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-volt text-[11px] whitespace-nowrap">
                        {row.derivedMetrics ? (
                          <ul className="space-y-0.5">
                            {Object.entries(row.derivedMetrics).map(([k, v]) => (
                              <li key={k}>
                                {k}: <strong>{String(v)}</strong>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-neutral-500">None</span>
                        )}
                      </td>
                      <td className="p-3 text-neutral-400 max-w-xs leading-normal">{row.biasesOrLimitations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section: Diagnostic Utility ("Report a Wrong Result") */}
        <section className="space-y-6 rounded-md border border-charcoal bg-surface p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              &ldquo;Report a Wrong Result&rdquo; Diagnostic Utility
            </h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            If an evaluation estimate appears inaccurate, export a sanitized diagnostic snapshot.
            In compliance with our zero-data-leakage architecture, this snapshot contains <strong className="text-white">zero PII</strong>
            (no names, phone numbers, email addresses, URLs, or raw resume text). It includes only token weights,
            math inputs, and engine fingerprints.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div ref={dropdownRef} className="relative inline-block w-full sm:w-auto">
              <button
                type="button"
                id="diagnostic-metric-select-btn"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full sm:w-64 inline-flex items-center justify-between gap-2 rounded border border-charcoal bg-[#121212] px-3.5 py-2 text-xs text-white font-mono hover:border-neutral-500 focus:border-volt focus:outline-none transition-colors cursor-pointer shadow-sm"
              >
                <span className="truncate font-semibold text-white">
                  {DIAGNOSTIC_METRIC_OPTIONS.find((opt) => opt.value === selectedDiagnosticMetric)?.label || 'Select Metric'}
                </span>
                <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-volt' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div
                  role="listbox"
                  aria-labelledby="diagnostic-metric-select-btn"
                  className="absolute left-0 mt-1.5 w-full sm:w-72 rounded-lg border border-charcoal bg-[#0f0f0f] py-1.5 z-50 animate-fade-in"
                  style={{
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {DIAGNOSTIC_METRIC_OPTIONS.map((opt) => {
                    const isSelected = opt.value === selectedDiagnosticMetric;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setSelectedDiagnosticMetric(opt.value);
                          setDiagnosticJson(null);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-volt/15 text-volt font-bold'
                            : 'text-neutral-200 hover:bg-[#1f1f1f] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-volt ml-2 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handlePreviewDiagnostic}
              className="inline-flex items-center justify-center gap-1.5 rounded border border-charcoal bg-surface-elevated px-4 py-2 text-xs font-mono font-medium text-neutral-200 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer"
            >
              <FileCode className="h-4 w-4 text-volt" />
              <span>Preview Payload</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyDiagnostic(selectedDiagnosticMetric)}
              className="inline-flex items-center justify-center gap-1.5 rounded bg-volt px-4 py-2 text-xs font-mono font-bold text-black hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all shadow-sm cursor-pointer"
            >
              {copiedDiagnostic ? (
                <>
                  <Check className="h-4 w-4 text-black" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-black" />
                  <span>Copy Diagnostic JSON</span>
                </>
              )}
            </button>

            {feedbackStats.total > 0 && (
              <button
                type="button"
                onClick={handleExportFeedback}
                className="inline-flex items-center justify-center gap-1.5 rounded border border-charcoal bg-surface-elevated px-4 py-2 text-xs font-mono font-medium text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors ml-auto cursor-pointer"
              >
                <Download className="h-4 w-4 text-volt" />
                <span>Export {feedbackStats.total} Local Feedback Items</span>
              </button>
            )}
          </div>

          {diagnosticJson && (
            <div className="mt-4 animate-fade-in">
              <span className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                Sanitized Payload Preview (Zero PII):
              </span>
              <pre className="rounded border border-charcoal bg-black p-4 text-xs font-mono text-volt overflow-x-auto max-h-72">
                {diagnosticJson}
              </pre>
            </div>
          )}
        </section>

        {/* Footer info link */}
        <div className="pt-6 border-t border-charcoal text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-volt" />
            <span>Specifications documented in <code className="text-neutral-300 font-mono">docs/scoring-spec.md</code></span>
          </div>
          <a
            href="/"
            className="text-volt hover:underline font-mono text-xs font-medium"
          >
            &larr; Return to Candidate Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default MethodologyPage;
