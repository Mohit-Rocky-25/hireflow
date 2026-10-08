// ============================================================
// Suite UI — Company vs Company Comparison (/tools/company-compare)
// Decision Group: "What should I apply to?"
// Side-by-side comparison of 2-3 target companies or roles:
// shared competencies, differentiators, prep overlap %, tier rules,
// and candidate profile prioritization recommendation.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileText,
  Clock,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { COMPANIES, Company } from '../../../pages/demo/talentLensData';
import {
  compareCompanies,
  CompanySelection,
  CompanyComparisonResult,
} from './compareCompanies';
import { useProfile } from '../profile/ProfileContext';

export function CompanyComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, openDrawer } = useProfile();

  // Active tab: overview | requirements | prioritize
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'prioritize'>('overview');

  // Initial selection from search params or defaults
  const [selections, setSelections] = useState<CompanySelection[]>(() => {
    const c1 = searchParams.get('c1') || 'swiggy';
    const c2 = searchParams.get('c2') || 'zomato';
    const c3 = searchParams.get('c3');

    const initial: CompanySelection[] = [
      { companyId: COMPANIES.some((c) => c.id === c1) ? c1 : 'swiggy' },
      { companyId: COMPANIES.some((c) => c.id === c2) ? c2 : 'zomato' },
    ];
    if (c3 && COMPANIES.some((c) => c.id === c3)) {
      initial.push({ companyId: c3 });
    }
    return initial;
  });

  // Sync back to search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selections[0]) params.set('c1', selections[0].companyId);
    if (selections[1]) params.set('c2', selections[1].companyId);
    if (selections[2]) params.set('c3', selections[2].companyId);
    setSearchParams(params, { replace: true });
  }, [selections, setSearchParams]);

  // Compute comparison result
  const comparison: CompanyComparisonResult = useMemo(() => {
    try {
      return compareCompanies(selections, profile);
    } catch {
      return compareCompanies(
        [{ companyId: 'swiggy' }, { companyId: 'zomato' }],
        profile
      );
    }
  }, [selections, profile]);

  const handleUpdateCompany = (index: number, newCompanyId: string) => {
    setSelections((prev) => {
      const next = [...prev];
      const comp = COMPANIES.find((c) => c.id === newCompanyId);
      next[index] = {
        companyId: newCompanyId,
        roleTitle: comp?.roles[0]?.title,
      };
      return next;
    });
  };

  const handleUpdateRole = (index: number, roleTitle: string) => {
    setSelections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], roleTitle };
      return next;
    });
  };

  const handleAddSlot = () => {
    if (selections.length >= 3) return;
    const existingIds = new Set(selections.map((s) => s.companyId));
    const nextPick = COMPANIES.find((c) => !existingIds.has(c.id)) || COMPANIES[0];
    setSelections((prev) => [
      ...prev,
      { companyId: nextPick.id, roleTitle: nextPick.roles[0]?.title },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    if (selections.length <= 2) return;
    setSelections((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/tools/career-path"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text font-semibold px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tools Hub
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Group A: What should I apply to?
            </span>
            <span className="text-sm font-bold text-text">Company vs Company</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tools/tracker"
              className="px-3 py-1.5 text-xs font-semibold bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-text transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-text-secondary" />
              Application Tracker
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-primary" />
            Company vs Company Comparison
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Compare 2 or 3 target companies side-by-side. Uncover shared expectations, company differentiators, directed prep overlap %, and personalized candidate readiness.
          </p>
        </div>

        {/* Freshness Note */}
        <div className="mb-6 p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between flex-wrap gap-2 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>{comparison.freshnessNote}</span>
          </div>
          <span className="text-text-muted">Dataset 6 (100 Companies) · Dataset 4 (Market Tiers)</span>
        </div>

        {/* Company & Role Selector Toolbar */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Selected Targets ({comparison.targets.length} of 3)
            </div>
            {selections.length < 3 && (
              <button
                onClick={handleAddSlot}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add 3rd Company
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparison.targets.map((target, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-2 border border-border relative flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-muted">Target {idx + 1}</span>
                  {selections.length > 2 && (
                    <button
                      onClick={() => handleRemoveSlot(idx)}
                      className="p-1 rounded-lg text-text-muted hover:text-danger hover:bg-surface transition-colors cursor-pointer"
                      title="Remove target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Company Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Company</label>
                  <select
                    value={target.company.id}
                    onChange={(e) => handleUpdateCompany(idx, e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-semibold text-text focus:outline-none focus:border-primary"
                  >
                    {COMPANIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.tier})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Role Track</label>
                  <select
                    value={target.selectedRole?.title || target.company.roles[0]?.title}
                    onChange={(e) => handleUpdateRole(idx, e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-semibold text-text focus:outline-none focus:border-primary"
                  >
                    {target.company.roles.map((r, rIdx) => (
                      <option key={rIdx} value={r.title}>
                        {r.title} ({r.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <Layers className="w-4 h-4" />
            Overview &amp; Overlap
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'requirements'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Requirements &amp; Gaps
          </button>
          <button
            onClick={() => setActiveTab('prioritize')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'prioritize'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            <Compass className="w-4 h-4" />
            Which Should I Prioritize?
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Prep Overlap Highlight Banner */}
            <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text">Directed Preparation Overlap</h3>
              </div>
              <p className="text-xs text-text-secondary mb-4">
                Calculated using <code className="bg-surface px-1.5 py-0.5 rounded text-primary">|Skills(A) ∩ Skills(B)| / |Skills(B)| * 100</code>.
                Shows what percentage of the second company's expectations are covered when you prepare for the first.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comparison.pairwiseOverlap.map((pair, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-semibold text-text-secondary">
                        Prep for <span className="font-bold text-text">{pair.fromCompanyName}</span> → Cover{' '}
                        <span className="font-bold text-text">{pair.toCompanyName}</span>
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {pair.sharedSkills.length} shared competencies ({pair.sharedSkills.join(', ')})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-extrabold text-primary">
                        {pair.overlapPercentage}%
                      </span>
                      <div className="text-[10px] text-text-muted">coverage</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side-by-side Target Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-${comparison.targets.length} gap-6`}>
              {comparison.targets.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    {/* Header with Logo */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.company.gradient} flex items-center justify-center text-white font-extrabold text-lg shadow-sm`}
                        >
                          {t.company.logo}
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold text-text">{t.company.name}</h2>
                          <div className="text-xs text-text-secondary">{t.company.industry} · {t.company.hq}</div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          t.marketTier === 'Tier S'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : t.marketTier === 'Tier A'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : t.marketTier === 'Tier B'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {t.marketTier} ({t.company.tier})
                      </span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-2 border border-border/80 mb-5 text-center">
                      <div>
                        <div className="text-[10px] text-text-muted font-bold uppercase">Package</div>
                        <div className="text-xs font-bold text-text mt-0.5">{t.company.avgPackage}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted font-bold uppercase">Rating</div>
                        <div className="text-xs font-bold text-text mt-0.5 flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {t.company.glassdoor}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted font-bold uppercase">Hiring Trend</div>
                        <div className="text-xs font-bold text-text mt-0.5 flex items-center justify-center gap-1">
                          {t.company.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          ) : t.company.trend === 'down' ? (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          ) : (
                            <Minus className="w-3 h-3 text-amber-400" />
                          )}
                          <span className="capitalize">{t.company.trend}</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Role Spec */}
                    <div className="mb-5">
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                        Track: {t.selectedRole?.title} ({t.selectedRole?.level})
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {t.selectedRole?.desc}
                      </p>
                    </div>

                    {/* Hiring Bar Summary */}
                    <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 mb-5">
                      <div className="text-xs font-bold text-text mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        Hiring Bar Expectation
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {t.hiringBar}
                      </p>
                    </div>

                    {/* Typical Interview Rounds */}
                    <div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                        Typical Interview Pipeline
                      </div>
                      <ul className="space-y-1.5">
                        {t.interviewRounds.map((rnd, rIdx) => (
                          <li
                            key={rIdx}
                            className="text-xs text-text-secondary flex items-start gap-2 bg-surface-2/60 p-2 rounded-lg"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{rnd}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Link */}
                  <div className="mt-6 pt-4 border-t border-border flex justify-end">
                    <Link
                      to={`/demo/company/${t.company.id}`}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      View full profile in TalentLens
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: REQUIREMENTS BREAKDOWN */}
        {activeTab === 'requirements' && (
          <div className="space-y-8">
            {/* Shared Competencies */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-text">Shared Competencies Across All Targets</h3>
              </div>
              <p className="text-xs text-text-secondary mb-4">
                These core skills are universally evaluated by all {comparison.targets.length} selected organizations. Preparing these gives 100% transferable return.
              </p>

              {comparison.sharedCompetencies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {comparison.sharedCompetencies.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-2 text-xs text-text-muted">
                  No single skill is unanimously shared across all selected tracks. Focus on pairwise overlapping competencies.
                </div>
              )}
            </div>

            {/* Differentiators per Company */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text">Company-Specific Differentiators</h3>
              </div>
              <p className="text-xs text-text-secondary mb-5">
                Competencies expected specifically by one company that the others do NOT require. These determine your final sprint preparation.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparison.targets.map((t, idx) => {
                  const unique = comparison.uniqueCompetencies[t.company.id] || [];
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-surface-2 border border-border flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-bold text-text">{t.company.name}</span>
                          <span className="text-[10px] text-text-muted uppercase">Differentiators</span>
                        </div>

                        {unique.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {unique.map((u, uIdx) => (
                              <span
                                key={uIdx}
                                className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase"
                              >
                                {u}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-text-muted italic">
                            All competencies are shared with at least one other selected company.
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-text-secondary mt-4 pt-3 border-t border-border/80">
                        Total role competencies: {t.competencies.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Overlap Matrix Table */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs overflow-x-auto">
              <h3 className="text-base font-bold text-text mb-2">Pairwise Overlap Matrix</h3>
              <p className="text-xs text-text-secondary mb-4">
                Directed matrix: read row as "If I prepare for [Row Company], how much of [Column Company] is satisfied?"
              </p>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-text-muted uppercase font-bold">
                    <th className="py-2.5 px-3">From \ To</th>
                    {comparison.targets.map((colT, cIdx) => (
                      <th key={cIdx} className="py-2.5 px-3">{colT.company.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {comparison.targets.map((rowT, rIdx) => (
                    <tr key={rIdx} className="hover:bg-surface-2/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-text">{rowT.company.name}</td>
                      {comparison.targets.map((colT, cIdx) => {
                        if (rowT.company.id === colT.company.id) {
                          return (
                            <td key={cIdx} className="py-3 px-3 text-text-muted font-bold">
                              100% (Self)
                            </td>
                          );
                        }
                        const pair = comparison.pairwiseOverlap.find(
                          (p) => p.fromCompanyId === rowT.company.id && p.toCompanyId === colT.company.id
                        );
                        return (
                          <td key={cIdx} className="py-3 px-3 font-extrabold text-primary">
                            {pair ? `${pair.overlapPercentage}%` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PRIORITIZE BASED ON PROFILE */}
        {activeTab === 'prioritize' && (
          <div className="space-y-6">
            {!comparison.prioritization.hasProfile ? (
              <div className="p-8 rounded-2xl bg-surface border border-border text-center max-w-xl mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text mb-2">
                  No Candidate Profile Loaded
                </h3>
                <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                  Personalized company prioritization compares your verified resume competencies and evidence ladder against each company's hiring bar. Load your profile to see deterministic recommendations.
                </p>
                <button
                  onClick={openDrawer}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Load or Build Candidate Profile
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Rationale */}
                <div className="p-5 rounded-2xl bg-surface border border-primary/30 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text mb-1">
                      HireFlow Priority Recommendation
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {comparison.prioritization.summaryRationale}
                    </p>
                  </div>
                </div>

                {/* Ranked Recommendations */}
                <div className="space-y-4">
                  {comparison.prioritization.recommendations.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-5 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                            rec.priorityRank === 1
                              ? 'bg-primary text-white'
                              : 'bg-surface-2 text-text-secondary border border-border'
                          }`}
                        >
                          #{rec.priorityRank}
                        </div>

                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-base font-bold text-text">{rec.companyName}</h4>
                            <span className="text-xs text-text-muted">· {rec.roleTitle}</span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                rec.readinessTier === 'Ready to Apply'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : rec.readinessTier === 'Short Prep (1-2 weeks)'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : rec.readinessTier === 'Moderate Prep (1-2 months)'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}
                            >
                              {rec.readinessTier}
                            </span>
                          </div>

                          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                            {rec.verdict}
                          </p>

                          {/* Matched vs Missing */}
                          <div className="flex flex-wrap gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-text-muted font-semibold">Matched:</span>
                              <span className="text-emerald-400 font-bold">
                                {rec.matchedSkills.length > 0 ? rec.matchedSkills.join(', ') : 'None'}
                              </span>
                            </div>
                            {rec.missingSkills.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-text-muted font-semibold">Gaps:</span>
                                <span className="text-amber-400 font-bold">
                                  {rec.missingSkills.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Score & Actions */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-primary">{rec.matchScore}%</div>
                          <div className="text-[10px] text-text-muted uppercase font-bold">Role Alignment</div>
                        </div>

                        <Link
                          to="/tools/tracker"
                          className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text transition-colors"
                        >
                          Add to Tracker
                        </Link>
                      </div>
                    </div>
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
