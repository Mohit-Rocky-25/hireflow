/**
 * HireFlow: Scoring Methodology & Provenance Page (Phase 4 Transparency)
 * Comprehensive, honest, and verifiable documentation of all scoring algorithms,
 * JD Alignment Index, Project Substance Index, Truth Gate invariants,
 * live configuration constants, and sanitized diagnostic utilities.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Calculator,
  Database,
  AlertTriangle,
  Copy,
  Check,
  FileCode,
  Download,
  Info,
  Scale,
  Target,
  Layers,
  Cpu,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import {
  ATS_PILLAR_WEIGHTS,
  REQUIREMENT_WEIGHT_CLASSES,
  MATCH_CLASSIFICATION_MULTIPLIERS,
  EVIDENCE_LEVEL_MULTIPLIERS,
  VERB_STRENGTH_MODIFIERS,
  JD_ALIGNMENT_WEIGHTS,
  PROJECT_SUBSTANCE_WEIGHTS,
  TRUTH_GATE_RULES,
  MRVI_WEIGHTS,
  calculateMrvi,
} from '../../config/scoring';
import { ENGINE_VERSION, computeConfigFingerprint } from '../../config/versions';
import { useFeedbackStore } from '../../store/feedbackStore';
import { copyDiagnosticPayload, generateDiagnosticPayload } from '../../lib/diagnostics/reportWrongResult';
import { PageNav } from '../../components/common/PageNav';

interface ProvenanceEntry {
  dataset: string;
  relevance: string;
  source: string;
  sampleSize: string;
  period: string;
  biases: string;
}

const PROVENANCE_DATA: ProvenanceEntry[] = [
  {
    dataset: 'Indian Engineering Campus Placements',
    relevance: 'Tier-1, 2, and 3 campus placement drive patterns (TCS, Infosys, Wipro, Product Startups)',
    source: 'Aggregated anonymized fresher hiring drives & AICTE curriculum updates',
    sampleSize: '2,400+ job descriptions across 18 tech hubs',
    period: '2024–2026 academic calendar',
    biases: 'Heavier representation of Bangalore, Hyderabad, Pune, and NCR engineering hubs.',
  },
  {
    dataset: 'ATS Parser Taxonomy & Extraction Rules',
    relevance: 'Standard text extraction and section segmentation across Workday, Greenhouse, Taleo',
    source: 'Public documentation and client-side regex parsing tests against standard ATS templates',
    sampleSize: '120 standard resume templates tested',
    period: 'Continuous 2026 benchmarking',
    biases: 'Optimized for single-column and clear dual-column linear text; tables penalize parsing safety.',
  },
  {
    dataset: 'AICTE Model Curriculum & Non-CS Bridges',
    relevance: 'Hardware, signals, and math coursework transferable to software engineering roles',
    source: 'AICTE Model Undergraduate Engineering Curriculum (ECE, EEE, Mech, Civil)',
    sampleSize: '4 canonical engineering streams',
    period: '2018–2024 revisions',
    biases: 'Autonomous institutions may include custom CS electives not covered in standard AICTE baselines.',
  },
];

export function MethodologyPage() {
  const [copiedMetricId, setCopiedMetricId] = useState<string | null>(null);
  const [selectedDiagnosticMetric, setSelectedDiagnosticMetric] = useState('overall-ats-score');
  const [diagnosticJson, setDiagnosticJson] = useState<string | null>(null);

  // MRVI Interactive Simulator
  const [mrviDemand, setMrviDemand] = useState(85);
  const [mrviRecruiter, setMrviRecruiter] = useState(90);
  const [mrviRisk, setMrviRisk] = useState(80);
  const computedMrvi = calculateMrvi({
    marketDemand: mrviDemand,
    recruiterImpact: mrviRecruiter,
    riskMitigation: mrviRisk,
  });

  const feedbackStats = useFeedbackStore((s) => s.getSummaryStats());
  const exportFeedbackJson = useFeedbackStore((s) => s.exportFeedbackJson);

  const handleCopyDiagnostic = async (metricId: string) => {
    const success = await copyDiagnosticPayload(metricId);
    if (success) {
      setCopiedMetricId(metricId);
      setTimeout(() => setCopiedMetricId(null), 2500);
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
    a.download = `hireflow-feedback-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto space-y-12">
        <PageNav fallbackRoute="/tools" />

        {/* Title Header */}
        <div className="border-b border-charcoal pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 text-volt text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-volt/20">
            <Scale className="h-3.5 w-3.5" />
            <span>Deterministic Rigor &amp; Full Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase">
            Scoring Methodology &amp; Provenance
          </h1>
          <p className="mt-3 text-base text-neutral-400 max-w-3xl leading-relaxed">
            HireFlow rejects black-box scoring and marketing hype. Every metric, match percentage, and guideline
            is mathematically derived from published configuration constants, verifiable syntax trees, and deterministic client-side heuristics.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 bg-surface p-3 rounded-md border border-charcoal">
            <span>Engine Version: <strong className="text-white">{ENGINE_VERSION}</strong></span>
            <span className="text-charcoal">•</span>
            <span>Config Fingerprint: <strong className="text-volt">{computeConfigFingerprint()}</strong></span>
            <span className="text-charcoal">•</span>
            <span>Local Feedback Recorded: <strong className="text-white">{feedbackStats.total}</strong> ({feedbackStats.up} 👍 / {feedbackStats.down} 👎)</span>
          </div>
        </div>

        {/* Honest Mission & Diagnostic Framing */}
        <div className="rounded-md border border-charcoal bg-surface p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5 text-volt">
            <ShieldCheck className="h-6 w-6 shrink-0" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              Technical Philosophy: Deterministic Diagnostics, Zero Magic
            </h2>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            <strong className="text-white">HireFlow is an evidence diagnostic tool</strong> designed to help candidates self-audit their resumes before submitting to human hiring managers and applicant tracking systems.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded bg-surface-elevated border border-charcoal space-y-1">
              <strong className="text-white block font-mono uppercase tracking-wider">No &ldquo;AI Probabilities&rdquo;</strong>
              <p className="text-neutral-400">We do not claim predictive crystal balls. A 75% score means 75/100 points of concrete requirement coverage.</p>
            </div>
            <div className="p-3 rounded bg-surface-elevated border border-charcoal space-y-1">
              <strong className="text-white block font-mono uppercase tracking-wider">No Hardcoded Score Bumps</strong>
              <p className="text-neutral-400">Tailoring bullet points computes the real before-and-after ATS delta &mdash; never guaranteed fictional boosts (+31 points).</p>
            </div>
            <div className="p-3 rounded bg-surface-elevated border border-charcoal space-y-1">
              <strong className="text-white block font-mono uppercase tracking-wider">100% Client-Side Privacy</strong>
              <p className="text-neutral-400">All parsers, tokenizers, and PDF generators run locally in your browser. Zero resume text ever leaves your device.</p>
            </div>
          </div>
        </div>

        {/* Section 1: The Four Evaluation Pillars */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">1. Core Resume Evaluation Pillars</h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Overall ATS scoring is normalized across four foundational pillars, tuned specifically
            for Indian engineering fresher placement drives:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.hardSkills * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Technical Hard Skills</h3>
              <p className="text-xs text-neutral-400">
                Matches candidate languages, frameworks, databases, and core CS fundamentals against target role requirements.
              </p>
            </div>

            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.evidenceQuality * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Evidence Quality</h3>
              <p className="text-xs text-neutral-400">
                Measures presence of quantifiable outcome metrics (latency, QPS, user counts) and strong active engineering verbs.
              </p>
            </div>

            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.fresherReadiness * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Fresher Readiness</h3>
              <p className="text-xs text-neutral-400">
                Evaluates independent project depth, GitHub links, live demos, and verifiable academic engineering foundations.
              </p>
            </div>

            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.formatSafety * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Format Safety</h3>
              <p className="text-xs text-neutral-400">
                Checks document parseability: absence of nested tables, multi-column flows, unreadable glyphs, and ATS truncation risks.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: JD Alignment Index Formula */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">2. Job Description Alignment Index (JD Index)</h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Replaces speculative &ldquo;interview likelihood&rdquo; with an objective, observable coverage benchmark:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="p-4 rounded-md border border-charcoal bg-surface space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase block">
                {Math.round(JD_ALIGNMENT_WEIGHTS.mustHaveSkills * 100)}% Weight
              </span>
              <h3 className="font-bold text-white text-sm">Must-Have Skills</h3>
              <p className="text-neutral-400">Direct or transferable match on mandatory technical requirements.</p>
            </div>

            <div className="p-4 rounded-md border border-charcoal bg-surface space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase block">
                {Math.round(JD_ALIGNMENT_WEIGHTS.evidenceDepth * 100)}% Weight
              </span>
              <h3 className="font-bold text-white text-sm">Evidence Depth</h3>
              <p className="text-neutral-400">Measured outcomes (L3) vs work bullets (L2) vs simple keyword lists (L0).</p>
            </div>

            <div className="p-4 rounded-md border border-charcoal bg-surface space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase block">
                {Math.round(JD_ALIGNMENT_WEIGHTS.preferredSkills * 100)}% Weight
              </span>
              <h3 className="font-bold text-white text-sm">Preferred Tech</h3>
              <p className="text-neutral-400">Coverage on secondary frameworks, cloud providers, and auxiliary tools.</p>
            </div>

            <div className="p-4 rounded-md border border-charcoal bg-surface space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase block">
                {Math.round(JD_ALIGNMENT_WEIGHTS.seniorityScope * 100)}% Weight
              </span>
              <h3 className="font-bold text-white text-sm">Seniority Scope</h3>
              <p className="text-neutral-400">Alignment of architectural ownership and project scope with target level.</p>
            </div>

            <div className="p-4 rounded-md border border-charcoal bg-surface space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase block">
                {Math.round(JD_ALIGNMENT_WEIGHTS.formatSafety * 100)}% Weight
              </span>
              <h3 className="font-bold text-white text-sm">Parse Safety</h3>
              <p className="text-neutral-400">Header structure, standard section titles, and zero unparsed glyphs.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Project Substance Index Formula */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">3. Project Substance Index (Engineering Rigor)</h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Distinguishes real, production-caliber engineering systems from shallow tutorial clones:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(PROJECT_SUBSTANCE_WEIGHTS.architectureSystemsDepth * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Architecture &amp; Systems Depth</h3>
              <p className="text-xs text-neutral-400">
                Presence of asynchronous job queues (Redis, Kafka), composite indexing, connection pooling, and circuit breaker patterns.
              </p>
            </div>

            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(PROJECT_SUBSTANCE_WEIGHTS.productionRigor * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Production Rigor &amp; Testing</h3>
              <p className="text-xs text-neutral-400">
                Automated test suites (unit, integration), Dockerfiles, CI/CD deployment pipelines, and live verifiable deployment URLs.
              </p>
            </div>

            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(PROJECT_SUBSTANCE_WEIGHTS.quantifiedOutcomes * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Quantified Outcomes</h3>
              <p className="text-xs text-neutral-400">
                Empirical metrics: p99 latency reduction, sustained throughput/QPS, error rate drops, or storage optimizations.
              </p>
            </div>

            <div className="rounded-md border border-charcoal bg-surface p-4 space-y-1.5">
              <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider">
                {Math.round(PROJECT_SUBSTANCE_WEIGHTS.techStackCraftsmanship * 100)}% Weight
              </span>
              <h3 className="text-base font-bold text-white">Modern Craftsmanship</h3>
              <p className="text-xs text-neutral-400">
                Strict type safety, idiomatic error handling, clean repository structure, and absence of generic template code.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Truth Gate Non-Negotiable Invariants */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">4. Truth Gate Verification Invariants</h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Every candidate tailoring pass is gated by deterministic truth verification rules:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRUTH_GATE_RULES.map((rule) => (
              <div key={rule.id} className="p-4 rounded-md border border-charcoal bg-surface space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-volt">{rule.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/20 uppercase tracking-wider">
                    Non-Negotiable
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{rule.rule}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{rule.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Market Requirement & Value Index (MRVI) */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">5. Market Requirement &amp; Value Index (MRVI)</h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Measures the empirical hiring advantage delivered by each resume capability in the 2025–2026 hiring market:
          </p>

          <div className="p-5 rounded-md border border-charcoal bg-surface space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-volt font-bold tracking-wider">Formula</span>
                <p className="font-mono text-sm text-neutral-200 mt-0.5">
                  MRVI = (MarketDemand &times; 40%) + (RecruiterGlance &times; 35%) + (RiskMitigation &times; 25%)
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">Simulated Score</span>
                <span className="text-3xl font-black text-volt font-mono">{computedMrvi}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Market Demand Penalty (40%)</span>
                  <span className="font-mono text-volt font-bold">{mrviDemand}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mrviDemand}
                  onChange={(e) => setMrviDemand(Number(e.target.value))}
                  className="w-full accent-[#faff69] cursor-pointer"
                />
                <p className="text-[11px] text-neutral-400">Rejection penalty if missing from resume.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Recruiter Glance Impact (35%)</span>
                  <span className="font-mono text-volt font-bold">{mrviRecruiter}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mrviRecruiter}
                  onChange={(e) => setMrviRecruiter(Number(e.target.value))}
                  className="w-full accent-[#faff69] cursor-pointer"
                />
                <p className="text-[11px] text-neutral-400">Attention captured in the initial 6-second scan.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Disqualification Mitigation (25%)</span>
                  <span className="font-mono text-volt font-bold">{mrviRisk}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mrviRisk}
                  onChange={(e) => setMrviRisk(Number(e.target.value))}
                  className="w-full accent-[#faff69] cursor-pointer"
                />
                <p className="text-[11px] text-neutral-400">Protection against parse bugs &amp; unbacked claims.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Weighting & Multipliers Table */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">6. Multipliers &amp; Dynamic Weights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {/* Requirement Weights */}
            <div className="rounded-md border border-charcoal bg-surface p-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Requirement Priority Weights</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-charcoal pb-1">
                  <dt className="text-neutral-400">Mandatory / Must-Have</dt>
                  <dd className="font-mono font-bold text-volt">{REQUIREMENT_WEIGHT_CLASSES.mandatory}x</dd>
                </div>
                <div className="flex justify-between border-b border-charcoal pb-1">
                  <dt className="text-neutral-400">Preferred / Good-to-Have</dt>
                  <dd className="font-mono font-bold text-neutral-200">{REQUIREMENT_WEIGHT_CLASSES.preferred}x</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Mentioned in Passing</dt>
                  <dd className="font-mono font-bold text-neutral-400">{REQUIREMENT_WEIGHT_CLASSES.mentioned}x</dd>
                </div>
              </dl>
            </div>

            {/* Evidence Depth Tiers */}
            <div className="rounded-md border border-charcoal bg-surface p-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Evidence Depth Tiers</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-charcoal pb-1">
                  <dt className="text-neutral-400">L3: Measured Metric Outcome</dt>
                  <dd className="font-mono font-bold text-volt">{EVIDENCE_LEVEL_MULTIPLIERS.L3_MEASURED_OUTCOME * 100}%</dd>
                </div>
                <div className="flex justify-between border-b border-charcoal pb-1">
                  <dt className="text-neutral-400">L2: Internship / Live Work</dt>
                  <dd className="font-mono font-bold text-neutral-200">{EVIDENCE_LEVEL_MULTIPLIERS.L2_INTERNSHIP_WORK * 100}%</dd>
                </div>
                <div className="flex justify-between border-b border-charcoal pb-1">
                  <dt className="text-neutral-400">L1: Project Demonstration</dt>
                  <dd className="font-mono font-bold text-neutral-300">{EVIDENCE_LEVEL_MULTIPLIERS.L1_PROJECT_BULLET * 100}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">L0: Listed in Skills Block</dt>
                  <dd className="font-mono font-bold text-neutral-400">{EVIDENCE_LEVEL_MULTIPLIERS.L0_LISTED_ONLY * 100}%</dd>
                </div>
              </dl>
            </div>

            {/* Action Verb Modifiers */}
            <div className="rounded-md border border-charcoal bg-surface p-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Action Verb Impact</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-charcoal pb-1">
                  <dt className="text-neutral-400">Strong Engineering Verbs</dt>
                  <dd className="font-mono font-bold text-volt">+{Math.round((VERB_STRENGTH_MODIFIERS.STRONG - 1) * 100)}%</dd>
                </div>
                <div className="flex justify-between border-b border-charcoal pb-1">
                  <dt className="text-neutral-400">Standard Descriptive Verbs</dt>
                  <dd className="font-mono font-bold text-neutral-300">Baseline ({VERB_STRENGTH_MODIFIERS.STANDARD}x)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-400">Weak / Passive Openers</dt>
                  <dd className="font-mono font-bold text-neutral-400">{VERB_STRENGTH_MODIFIERS.WEAK}x</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Section 7: Data Provenance Table */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">7. Data Provenance &amp; Calibration Baselines</h2>
          </div>
          <div className="overflow-x-auto rounded-md border border-charcoal bg-surface">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-surface-elevated text-neutral-400 uppercase font-mono font-semibold text-[11px] border-b border-charcoal">
                <tr>
                  <th className="p-3">Dataset / Benchmark</th>
                  <th className="p-3">Fresher Relevance</th>
                  <th className="p-3">Sample Size</th>
                  <th className="p-3">Observation Period</th>
                  <th className="p-3">Known Biases &amp; Limits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal font-normal">
                {PROVENANCE_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="p-3 font-semibold text-white">{row.dataset}</td>
                    <td className="p-3 text-neutral-300">{row.relevance}</td>
                    <td className="p-3 font-mono text-neutral-300 whitespace-nowrap">{row.sampleSize}</td>
                    <td className="p-3 font-mono text-neutral-400 whitespace-nowrap">{row.period}</td>
                    <td className="p-3 text-neutral-400 max-w-xs">{row.biases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 8: Report a Wrong Result Diagnostic Tool */}
        <section className="space-y-6 rounded-md border border-charcoal bg-surface p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-volt" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">8. &ldquo;Report a Wrong Result&rdquo; Diagnostic Utility</h2>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            If an ATS scan or match result seems inaccurate, generate a sanitized diagnostic snapshot.
            In compliance with our zero-data-leakage architecture, this snapshot contains <strong className="text-white">zero PII</strong>
            (no names, phone numbers, email addresses, or raw resume text). It includes only token weights,
            math inputs, and engine fingerprints.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={selectedDiagnosticMetric}
              onChange={(e) => {
                setSelectedDiagnosticMetric(e.target.value);
                setDiagnosticJson(null);
              }}
              className="rounded border border-charcoal bg-surface-elevated px-3 py-2 text-xs text-white font-mono focus:border-volt focus:outline-none"
            >
              <option value="overall-ats-score">Overall ATS Score</option>
              <option value="jd-match-score">JD Match Score</option>
              <option value="hard-skills-coverage">Hard Skills Coverage</option>
              <option value="evidence-depth-score">Evidence Depth Score</option>
              <option value="verb-impact-score">Verb Impact Score</option>
              <option value="demanded-skill-score">Demanded Skill Market Score</option>
              <option value="branch-bridge-match">Branch Bridge Transferability</option>
            </select>

            <button
              type="button"
              onClick={handlePreviewDiagnostic}
              className="inline-flex items-center justify-center gap-1.5 rounded border border-charcoal bg-surface-elevated px-4 py-2 text-xs font-mono font-medium text-neutral-200 hover:text-white hover:border-neutral-500 transition-colors"
            >
              <FileCode className="h-4 w-4 text-volt" />
              <span>Preview Payload</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyDiagnostic(selectedDiagnosticMetric)}
              className="inline-flex items-center justify-center gap-1.5 rounded bg-volt px-4 py-2 text-xs font-mono font-bold text-black hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all shadow-sm"
            >
              {copiedMetricId === selectedDiagnosticMetric ? (
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
                className="inline-flex items-center justify-center gap-1.5 rounded border border-charcoal bg-surface-elevated px-4 py-2 text-xs font-mono font-medium text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors ml-auto"
              >
                <Download className="h-4 w-4 text-volt" />
                <span>Export {feedbackStats.total} Local Feedback Items</span>
              </button>
            )}
          </div>

          {diagnosticJson && (
            <div className="mt-4">
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
            <span>Specifications documented in <code className="text-neutral-300">docs/metric-inventory.md</code></span>
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

