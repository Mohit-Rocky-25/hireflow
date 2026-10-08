// ============================================================
// HireFlow Suite — Batch Readiness Page (/tools/batch-readiness)
// Decision Group: "Connecting HireFlow's Roles"
// College Placement Cell cohort auditor:
// Interactive multi-company heatmap, curriculum gap rankings,
// and privacy-first candidate anonymization.
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Download,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  analyzeBatch,
  generateSampleCohort,
  exportBatchReadinessCSV,
  CohortCandidate,
  ReadinessTier,
  CohortHeatmapRow,
} from './batchAnalyzer';

export function BatchReadinessPage() {
  const [cohortSize, setCohortSize] = useState<number>(20);
  const [anonymize, setAnonymize] = useState<boolean>(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'heatmap' | 'gaps' | 'companies'>('heatmap');
  const [inspectedStudent, setInspectedStudent] = useState<CohortHeatmapRow | null>(null);

  // Generate cohort
  const [candidates, setCandidates] = useState<CohortCandidate[]>(() =>
    generateSampleCohort(20)
  );

  const handleCohortSizeChange = (newSize: number) => {
    setCohortSize(newSize);
    setCandidates(generateSampleCohort(newSize));
    setInspectedStudent(null);
  };

  const handleRegenerate = () => {
    setCandidates(generateSampleCohort(cohortSize));
    setInspectedStudent(null);
  };

  // Run analysis
  const report = useMemo(() => {
    return analyzeBatch(candidates, anonymize);
  }, [candidates, anonymize]);

  // Filtered rows by branch
  const filteredRows = useMemo(() => {
    if (selectedBranch === 'ALL') return report.rows;
    return report.rows.filter((r) => r.branch === selectedBranch);
  }, [report.rows, selectedBranch]);

  // Export CSV
  const handleDownloadCSV = () => {
    const csvContent = exportBatchReadinessCSV(report);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `hireflow_cohort_readiness_${anonymize ? 'anonymized' : 'full'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tierBadge = (tier: ReadinessTier, score: number) => {
    switch (tier) {
      case 'ready_now':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {score}%
          </span>
        );
      case 'two_week_prep':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {score}%
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {score}%
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools Hub
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Decision Group E • Connecting HireFlow's Roles
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Zero-Bias Audit
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
              Batch Readiness & Placement Cell Heatmap
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-3xl">
              Institutional readiness intelligence for college placement drives: benchmark student cohorts against Tier 1 tech hiring bars, surface curriculum-wide gaps, and enforce candidate privacy with zero-bias anonymization.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              Export CSV Report
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Regenerate Cohort
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Anonymization, Size, Branch Filter */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Anonymize Toggle */}
          <button
            type="button"
            onClick={() => setAnonymize(!anonymize)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              anonymize
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-surface-2 border-border text-foreground'
            }`}
          >
            {anonymize ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {anonymize ? 'Anonymization ON (Privacy Mode)' : 'Real Names Visible'}
          </button>

          {/* Cohort Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>Cohort Size:</span>
            {[10, 20, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handleCohortSizeChange(size)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  cohortSize === size
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-2 text-foreground hover:bg-surface-3 border border-border'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-muted" />
          <span className="text-muted">Branch:</span>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-xs text-foreground font-medium focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Branches ({report.rows.length})</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="AI/DS">AI/DS</option>
          </select>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Total Cohort</span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{report.totalCandidates}</p>
          <p className="text-[11px] text-muted mt-1">Students analyzed across campus</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Ready-Now Candidates</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {report.overallReadyNowCandidates}{' '}
            <span className="text-sm font-medium text-muted">
              ({report.overallReadyNowPercent}%)
            </span>
          </p>
          <p className="text-[11px] text-muted mt-1">Ready for $\ge 1$ Tier 1 company bar</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Benchmark Companies</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{report.targetCompanies.length}</p>
          <p className="text-[11px] text-muted mt-1">Indian Tech & Unicorn targets</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted">Top Curriculum Gap</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-extrabold text-foreground truncate">
            {report.topBatchGaps[0]?.displayName || 'System Design'}
          </p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">
            Missing in {report.topBatchGaps[0]?.missingPercent || 0}% of cohort
          </p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'heatmap'
              ? 'bg-surface text-foreground border border-border shadow-xs'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-primary" />
          Competency Heatmap Matrix
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'gaps'
              ? 'bg-surface text-foreground border border-border shadow-xs'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          Top Batch Gaps & Workshops ({report.topBatchGaps.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'companies'
              ? 'bg-surface text-foreground border border-border shadow-xs'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
          Company Hiring Bars
        </button>
      </div>

      {/* Tab 1: Heatmap Matrix */}
      {activeTab === 'heatmap' && (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Cohort $\times$ Company Readiness Matrix</h2>
              <p className="text-xs text-muted">
                Showing {filteredRows.length} candidates. Click on any student row to inspect skill breakdowns.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-muted">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ready Now ($\ge 75\%$)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 2-Wk Prep (60–74%)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Gap ($< 60\%$)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 border-b border-border text-muted font-bold">
                <tr>
                  <th className="py-3 px-4">Candidate ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4 text-center">Avg Match</th>
                  {report.targetCompanies.map((comp) => (
                    <th key={comp.id} className="py-3 px-4 text-center">
                      {comp.name}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center">Ready Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRows.map((row) => (
                  <tr
                    key={row.candidateId}
                    onClick={() => setInspectedStudent(row)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-muted">
                      {row.candidateId}
                    </td>
                    <td className="py-3 px-4 font-bold text-foreground group-hover:text-primary transition-colors">
                      {row.candidateName}
                    </td>
                    <td className="py-3 px-4 text-muted">{row.branch}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-foreground">
                      {row.cgpa ? row.cgpa.toFixed(1) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                      {row.avgScore}%
                    </td>
                    {report.targetCompanies.map((comp) => {
                      const scoreObj = row.scores[comp.id];
                      return (
                        <td key={comp.id} className="py-3 px-4 text-center">
                          {scoreObj ? tierBadge(scoreObj.readinessTier, scoreObj.score) : '—'}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {row.readyNowCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Gaps */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-1">
              Top Identified Curriculum Gaps Across Cohort
            </h2>
            <p className="text-xs text-muted mb-4">
              Ranked competencies missing across student resumes with high-yield workshop recommendations to maximize campus offer conversions.
            </p>

            <div className="space-y-4">
              {report.topBatchGaps.map((gap, idx) => (
                <div
                  key={gap.competency}
                  className="p-4 rounded-xl bg-surface-2 border border-border space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-surface border border-border font-mono text-xs font-bold flex items-center justify-center text-muted">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{gap.displayName}</h3>
                        <p className="text-[11px] text-muted">
                          Affects requirements at: {gap.impactedCompanies.join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-rose-500">
                        {gap.missingCount} of {report.totalCandidates} students ({gap.missingPercent}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${gap.missingPercent}%` }}
                    />
                  </div>

                  {/* Recommended Workshop */}
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                    <BookOpen className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="font-bold text-primary">Recommended Placement Intervention:</span>{' '}
                      <span className="text-secondary">{gap.recommendedWorkshop}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Company Summaries */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.companySummaries.map((summary) => (
            <div
              key={summary.companyId}
              className="bg-surface rounded-2xl border border-border p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">{summary.companyName}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {summary.tier}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Avg {summary.averageScore}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {summary.readyNowCount}
                  </p>
                  <p className="text-[10px] text-muted">Ready Now</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {summary.prepNeededCount}
                  </p>
                  <p className="text-[10px] text-muted">2-Wk Prep</p>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <p className="text-lg font-bold text-danger">
                    {summary.highGapCount}
                  </p>
                  <p className="text-[10px] text-muted">High Gap</p>
                </div>
              </div>

              <div className="text-[11px] text-muted pt-1 flex items-center justify-between">
                <span>Pass Rate:</span>
                <span className="font-bold text-foreground font-mono">
                  {summary.readyNowPercent}% of cohort
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspected Student Modal / Drawer */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-2xl border border-border p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {inspectedStudent.candidateName}
                </h3>
                <p className="text-xs text-muted">
                  Branch: {inspectedStudent.branch} • CGPA: {inspectedStudent.cgpa || 'N/A'} • Avg Score: {inspectedStudent.avgScore}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-surface-2 hover:bg-surface-3 text-foreground"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Company Readiness Breakdown
              </p>
              {Object.values(inspectedStudent.scores).map((score) => (
                <div
                  key={score.companyId}
                  className="p-3 rounded-xl bg-surface-2 border border-border text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{score.companyName}</span>
                    {tierBadge(score.readinessTier, score.score)}
                  </div>
                  {score.matchedCompetencies.length > 0 && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      ✓ Matched: {score.matchedCompetencies.join(', ')}
                    </p>
                  )}
                  {score.missingCompetencies.length > 0 && (
                    <p className="text-[11px] text-rose-500">
                      ✗ Missing: {score.missingCompetencies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
