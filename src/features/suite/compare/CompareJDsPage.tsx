// ============================================================
// Suite UI — Compare Job Descriptions (/tools/jd-compare)
// Decision Group: "What should I apply to?"
// Rank roles by fit, discover shared gaps, cross-JD fix impact, matrix
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
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
} from 'lucide-react';
import { PageNav } from '../../../components/common/PageNav';
import { useProfile } from '../profile/ProfileContext';
import { ProfileStatusChip } from '../profile/components/ProfileStatusChip';
import { compareJDs, CompareJDsResult, JDInput } from './compareJDs';
import { COMPANIES } from '../../../pages/demo/talentLensData';
import { sanitizeCsvCell } from '../../../utils/security';

const INITIAL_JDS: JDInput[] = [
  {
    id: 'jd-1',
    label: 'Google — Software Engineer L3',
    text: `About the Role:\nGoogle is looking for a Software Engineer to develop scalable applications and resilient distributed systems.\nResponsibilities:\n- Design, test, deploy, and maintain software solutions.\n- Manage individual project priorities, deadlines, and deliverables.\nRequirements:\n- Experience with software development in one or more programming languages: Java, C++, Python, or Go.\n- Experience working with data structures, algorithms, and software design principles.\n- Experience with distributed systems and cloud platforms is preferred.`,
  },
  {
    id: 'jd-2',
    label: 'Microsoft — Software Engineer II',
    text: `About the Role:\nMicrosoft is seeking a Software Engineer II to architect customer-facing cloud services and modern web experiences.\nResponsibilities:\n- Implement robust microservices and collaborate with product engineering teams.\n- Ensure code quality, comprehensive automated testing, and reliable deployment.\nRequirements:\n- Solid proficiency in TypeScript, React, and Node.js microservices.\n- Strong understanding of relational databases (PostgreSQL or SQL Server).\n- Hands-on experience with Docker containerization and CI/CD pipelines.`,
  },
];

export function CompareJDsPage() {
  const { profile } = useProfile();
  const [resumeText, setResumeText] = useState<string>('');
  const [jds, setJds] = useState<JDInput[]>(INITIAL_JDS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<CompareJDsResult | null>(null);
  const [activeTab, setActiveTab] = useState<'ranking' | 'gaps' | 'matrix'>('ranking');
  const [copiedRanking, setCopiedRanking] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (profile?.masterResumeText && !resumeText) {
      setResumeText(profile.masterResumeText);
    }
  }, [profile]);

  const handleAddJD = () => {
    if (jds.length >= 5) return;
    const newId = `jd-${Date.now()}`;
    setJds([...jds, { id: newId, label: `Target Role ${jds.length + 1}`, text: '' }]);
  };

  const handleRemoveJD = (id: string) => {
    if (jds.length <= 2) return;
    setJds(jds.filter((j) => j.id !== id));
  };

  const handleUpdateJD = (id: string, field: 'label' | 'text', val: string) => {
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
      setActiveTab('ranking');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;
    const headers = ['Rank', 'Role', 'Fit Score', 'Verdict', 'Must-Have Coverage', 'Top Fixes'];
    const rows = result.rankedJDs.map((jd, idx) => [
      sanitizeCsvCell(idx + 1),
      sanitizeCsvCell(jd.label),
      sanitizeCsvCell(`${jd.score}%`),
      sanitizeCsvCell(jd.verdict),
      sanitizeCsvCell(`${Math.round(jd.mustHaveCoverage * 100)}% (${jd.mustHaveMet}/${jd.mustHaveTotal})`),
      sanitizeCsvCell(jd.topFixes.map((f) => f.skillName).join(', ')),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hireflow-jd-compare-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRanking = () => {
    if (!result) return;
    const text = result.rankedJDs
      .map(
        (jd, i) =>
          `#${i + 1}: ${jd.label} — ${jd.score}% (${jd.verdict})\n  Must-haves: ${Math.round(
            jd.mustHaveCoverage * 100
          )}% (${jd.mustHaveMet}/${jd.mustHaveTotal})\n  Top Fixes: ${jd.topFixes
            .map((f) => `+${f.gain}% ${f.skillName}`)
            .join(', ')}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopiedRanking(true);
    setTimeout(() => setCopiedRanking(false), 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-16 px-4 sm:px-6 md:px-8 relative">
      <PageNav onBack={result ? () => setResult(null) : undefined} />
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-end">
        <ProfileStatusChip />
      </div>

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/25 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> What should I apply to?
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Compare Job Descriptions
          </h1>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
            Rank multiple roles by genuine evidence fit, uncover high-leverage shared gaps across all of them, and optimize where you invest your prep time.
          </p>
        </div>

        {/* Input Phase */}
        {!result && (
          <div className="space-y-6">
            {/* Resume Input if no profile */}
            {(!profile || !profile.masterResumeText) && (
              <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
                <label className="block text-xs font-bold text-text-secondary uppercase">
                  Master Resume Text
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your master resume plain text here..."
                  className="w-full h-36 bg-surface-2 border border-border rounded-xl p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* JDs Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-text">
                    Target Job Descriptions ({jds.length}/5)
                  </h3>
                  <p className="text-xs text-text-muted">
                    Compare 2 to 5 opportunities side-by-side
                  </p>
                </div>
                {jds.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddJD}
                    className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" /> Add another JD
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jds.map((jd, idx) => {
                  const words = jd.text.trim().split(/\s+/).filter(Boolean).length;
                  const isShort = words > 0 && words < 20;

                  return (
                    <div
                      key={jd.id}
                      className="bg-surface border border-border rounded-2xl p-4 sm:p-5 space-y-3 relative flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={jd.label}
                            onChange={(e) => handleUpdateJD(jd.id, 'label', e.target.value)}
                            placeholder={`Role ${idx + 1} Label`}
                            className="w-full font-bold text-sm bg-transparent border-b border-border/80 focus:border-primary focus:outline-none py-1 text-text"
                          />
                          {jds.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveJD(jd.id)}
                              className="text-text-muted hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Remove JD"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <textarea
                          value={jd.text}
                          onChange={(e) => handleUpdateJD(jd.id, 'text', e.target.value)}
                          placeholder="Paste job description requirements and responsibilities..."
                          className="w-full h-44 bg-surface-2 border border-border rounded-xl p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 border-t border-border/40">
                        <span>{words} words</span>
                        {isShort && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Min 20 words recommended
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Run Action */}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={handleRunCompare}
                disabled={isAnalyzing || (!resumeText.trim() && !profile?.masterResumeText)}
                className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing {progress.done}/{progress.total} JDs...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" /> Compare &amp; Rank Roles
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border shadow-xs">
              {/* Tab Navigation (max 3 tabs) */}
              <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('ranking')}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'ranking'
                      ? 'bg-text text-bg shadow-xs'
                      : 'text-text-secondary hover:text-text'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" /> Ranking
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
                  <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Shared Gaps
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
                  onClick={handleCopyRanking}
                  className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-text inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedRanking ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-text-tertiary" />}
                  <span>{copiedRanking ? 'Copied' : 'Copy'}</span>
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
                  Edit JDs
                </button>
              </div>
            </div>

            {/* Notifications if any duplicates merged or unparseable */}
            {result.mergedDuplicatesCount > 0 && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  {result.mergedDuplicatesCount} duplicate job description(s) detected and automatically merged.
                </span>
              </div>
            )}

            {/* TAB 1: Ranking */}
            {activeTab === 'ranking' && (
              <div className="space-y-4">
                {result.rankedJDs.map((jd, idx) => (
                  <div
                    key={jd.id}
                    className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black font-mono flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-text">{jd.label}</h3>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-border/60 text-xs">
                      <div>
                        <span className="text-text-muted">Must-Have Alignment:</span>{' '}
                        <strong className="text-text">
                          {Math.round(jd.mustHaveCoverage * 100)}% ({jd.mustHaveMet} of {jd.mustHaveTotal} must-haves met)
                        </strong>
                      </div>
                      <div>
                        <span className="text-text-muted">Total Competencies Scanned:</span>{' '}
                        <strong className="text-text">{jd.skillResults.length} requirements</strong>
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

            {/* TAB 2: Shared Gaps */}
            {activeTab === 'gaps' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-surface border border-border">
                  <h3 className="text-sm font-bold text-text">
                    Cross-Application Leverage
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

            {/* TAB 3: Overlap Matrix */}
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
                          {jd.label}
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
