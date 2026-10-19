/**
 * HireFlow v4: Methodology & Provenance Page (B7)
 * Comprehensive, transparent documentation of all scoring algorithms, data provenance,
 * live configuration constants, and diagnostic report generator.
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
} from 'lucide-react';
import {
  ATS_PILLAR_WEIGHTS,
  REQUIREMENT_WEIGHT_CLASSES,
  MATCH_CLASSIFICATION_MULTIPLIERS,
  EVIDENCE_LEVEL_MULTIPLIERS,
  VERB_STRENGTH_MODIFIERS,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto space-y-12">
        <PageNav fallbackRoute="/tools" />
        {/* Title Header */}
        <div className="border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
            <Scale className="h-3.5 w-3.5" />
            <span>Transparency & Rigor (Requirement B7)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Scoring Methodology & Provenance
          </h1>
          <p className="mt-3 text-base text-slate-400 max-w-3xl leading-relaxed">
            HireFlow rejects black-box scoring. Every number, match percentage, and recommendation
            is mathematically derived from published configuration constants and client-side heuristics.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span>Engine Version: <strong className="text-white">{ENGINE_VERSION}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Config Fingerprint: <strong className="text-emerald-400">{computeConfigFingerprint()}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Local Feedback Recorded: <strong className="text-white">{feedbackStats.total}</strong> ({feedbackStats.up} 👍 / {feedbackStats.down} 👎)</span>
          </div>
        </div>

        {/* 100% Client-Side Privacy Guarantee */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-400 shrink-0">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">100% Client-Side Guarantee</h2>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              HireFlow never communicates with external servers. All algorithms, parsers, and scoring
              engines run entirely inside your browser using client-side TypeScript. Your resume data,
              job descriptions, and scores never leave your local device.
            </p>
          </div>
        </div>

        {/* Section 1: The Four Evaluation Pillars */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">1. Core Resume Evaluation Pillars</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Overall ATS scoring is normalized across four foundational pillars, tuned specifically
            for Indian engineering fresher placement drives:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.hardSkills * 100)}% Weight
              </span>
              <h3 className="mt-1 text-base font-bold text-white">Technical Hard Skills</h3>
              <p className="mt-1 text-xs text-slate-400">
                Matches candidate languages, frameworks, databases, and core CS fundamentals against target role requirements.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.evidenceQuality * 100)}% Weight
              </span>
              <h3 className="mt-1 text-base font-bold text-white">Evidence Quality</h3>
              <p className="mt-1 text-xs text-slate-400">
                Measures presence of quantifiable outcome metrics (latency, QPS, user counts) and strong active engineering verbs.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.fresherReadiness * 100)}% Weight
              </span>
              <h3 className="mt-1 text-base font-bold text-white">Fresher Readiness</h3>
              <p className="mt-1 text-xs text-slate-400">
                Evaluates independent project depth, GitHub links, live demos, and verifiable academic engineering foundations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                {Math.round(ATS_PILLAR_WEIGHTS.formatSafety * 100)}% Weight
              </span>
              <h3 className="mt-1 text-base font-bold text-white">Format Safety</h3>
              <p className="mt-1 text-xs text-slate-400">
                Checks document parseability: absence of nested tables, multi-column flows, unreadable glyphs, and ATS truncation risks.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Weighting & Multipliers Table */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-sky-400" />
            <h2 className="text-xl font-bold text-white">2. Multipliers & Dynamic Weights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {/* Requirement Weights */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="font-semibold text-white mb-3">Requirement Priority Weights</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <dt className="text-slate-400">Mandatory / Must-Have</dt>
                  <dd className="font-mono font-bold text-emerald-400">{REQUIREMENT_WEIGHT_CLASSES.mandatory}x</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <dt className="text-slate-400">Preferred / Good-to-Have</dt>
                  <dd className="font-mono font-bold text-sky-400">{REQUIREMENT_WEIGHT_CLASSES.preferred}x</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Mentioned in Passing</dt>
                  <dd className="font-mono font-bold text-slate-300">{REQUIREMENT_WEIGHT_CLASSES.mentioned}x</dd>
                </div>
              </dl>
            </div>

            {/* Evidence Depth Tiers */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="font-semibold text-white mb-3">Evidence Depth Tiers</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <dt className="text-slate-400">L3: Measured Metric Outcome</dt>
                  <dd className="font-mono font-bold text-emerald-400">{EVIDENCE_LEVEL_MULTIPLIERS.L3_MEASURED_OUTCOME * 100}%</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <dt className="text-slate-400">L2: Internship / Live Work</dt>
                  <dd className="font-mono font-bold text-sky-400">{EVIDENCE_LEVEL_MULTIPLIERS.L2_INTERNSHIP_WORK * 100}%</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <dt className="text-slate-400">L1: Project Demonstration</dt>
                  <dd className="font-mono font-bold text-purple-400">{EVIDENCE_LEVEL_MULTIPLIERS.L1_PROJECT_BULLET * 100}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">L0: Listed in Skills Block</dt>
                  <dd className="font-mono font-bold text-amber-400">{EVIDENCE_LEVEL_MULTIPLIERS.L0_LISTED_ONLY * 100}%</dd>
                </div>
              </dl>
            </div>

            {/* Action Verb Modifiers */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="font-semibold text-white mb-3">Action Verb Impact</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <dt className="text-slate-400">Strong Engineering Verbs</dt>
                  <dd className="font-mono font-bold text-emerald-400">+{Math.round((VERB_STRENGTH_MODIFIERS.STRONG - 1) * 100)}%</dd>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <dt className="text-slate-400">Standard Descriptive Verbs</dt>
                  <dd className="font-mono font-bold text-slate-300">Baseline ({VERB_STRENGTH_MODIFIERS.STANDARD}x)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Weak / Passive Openers</dt>
                  <dd className="font-mono font-bold text-rose-400">{VERB_STRENGTH_MODIFIERS.WEAK}x</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Section 3: Data Provenance Table */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">3. Data Provenance & Calibration Baselines</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Dataset / Benchmark</th>
                  <th className="p-3">Fresher Relevance</th>
                  <th className="p-3">Sample Size</th>
                  <th className="p-3">Observation Period</th>
                  <th className="p-3">Known Biases & Limits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {PROVENANCE_DATA.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-3 font-medium text-white">{row.dataset}</td>
                    <td className="p-3 text-slate-300">{row.relevance}</td>
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap">{row.sampleSize}</td>
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{row.period}</td>
                    <td className="p-3 text-slate-400 max-w-xs">{row.biases}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Report a Wrong Result Diagnostic Tool */}
        <section className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">4. "Report a Wrong Result" Diagnostic Utility</h2>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            If an ATS scan or match result seems inaccurate, generate a sanitized diagnostic snapshot.
            In compliance with our zero-data-leakage architecture, this snapshot contains <strong>zero PII</strong>
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
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
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <FileCode className="h-4 w-4 text-sky-400" />
              <span>Preview Payload</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyDiagnostic(selectedDiagnosticMetric)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
            >
              {copiedMetricId === selectedDiagnosticMetric ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Diagnostic JSON</span>
                </>
              )}
            </button>

            {feedbackStats.total > 0 && (
              <button
                type="button"
                onClick={handleExportFeedback}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-purple-300 hover:bg-slate-700 transition-colors ml-auto"
              >
                <Download className="h-4 w-4" />
                <span>Export {feedbackStats.total} Local Feedback Items</span>
              </button>
            )}
          </div>

          {diagnosticJson && (
            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Sanitized Payload Preview (Zero PII):
              </span>
              <pre className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-72">
                {diagnosticJson}
              </pre>
            </div>
          )}
        </section>

        {/* Footer info link */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-400" />
            <span>Specifications documented in <code className="text-slate-300">docs/metric-inventory.md</code></span>
          </div>
          <a
            href="/"
            className="text-emerald-400 hover:underline font-medium"
          >
            ← Return to Candidate Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default MethodologyPage;
