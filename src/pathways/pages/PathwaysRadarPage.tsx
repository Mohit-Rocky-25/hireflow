// ============================================================
// Pathways Architecture — Route 1: Eligibility Radar & CGPA Gap Page
// Wireframe C13 Screen 1. Zero component arithmetic (Constitution E6).
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PATHWAYS_PROGRAMS } from '../facts/programs.generated';
import { evaluateEligibility, calculateCgpaGap } from '../engine/eligibility';
import { usePathwaysProfileStore } from '../profile/profileStore';
import { ProfileBudgetBar } from '../components/ProfileBudgetBar';
import { EvidenceChip } from '../components/EvidenceChip';
import { NonAffiliationFooter } from '../components/NonAffiliationFooter';
import { FeedbackModal } from '../components/FeedbackModal';
import { formatRupees } from '../utils/money';

export const PathwaysRadarPage: React.FC = () => {
  const { profile } = usePathwaysProfileStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackSubjectId, setFeedbackSubjectId] = useState<string | null>(null);

  // CGPA Gap Calculator State
  const [calcTargetCgpa, setCalcTargetCgpa] = useState(7.0);
  const [calcCompletedSems, setCalcCompletedSems] = useState(4);
  const [calcTotalSems] = useState(8);

  // Evaluate all programs deterministically via pure engine
  const evaluatedPrograms = useMemo(() => {
    return PATHWAYS_PROGRAMS.map((prog) => {
      const evalResult = evaluateEligibility(profile, prog);
      return {
        program: prog,
        evaluation: evalResult
      };
    });
  }, [profile]);

  // Filter and search
  const filteredPrograms = useMemo(() => {
    return evaluatedPrograms.filter((item) => {
      const matchesSearch =
        item.program.facts.officialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.program.facts.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.program.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus === 'all') return true;
      return item.evaluation.status === filterStatus;
    });
  }, [evaluatedPrograms, filterStatus, searchQuery]);

  // Compute CGPA gap via pure engine
  const cgpaGapResult = useMemo(() => {
    return calculateCgpaGap(profile.cgpa, calcCompletedSems, calcTotalSems, calcTargetCgpa);
  }, [profile.cgpa, calcCompletedSems, calcTotalSems, calcTargetCgpa]);

  const statusBadges: Record<string, { label: string; className: string }> = {
    meets: { label: 'Meets Criteria', className: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' },
    check: { label: 'Check Details', className: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
    fails: { label: 'Does Not Meet', className: 'bg-rose-950/80 border-rose-500/50 text-rose-300' },
    unknown: { label: 'No Data Published', className: 'bg-zinc-800 border-zinc-600 text-zinc-300' }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <ProfileBudgetBar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-volt/10 text-volt border border-volt/30 uppercase">
                Fresher Campus Intelligence
              </span>
              <span className="text-zinc-500 text-xs font-mono">20 Verified Programs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
              Pathways Eligibility Radar
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Deterministic evaluation against recorded official campus criteria. All facts backed by verified primary documents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tools/pathways/offers"
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-white transition-colors"
            >
              Offer Evaluator →
            </Link>
            <Link
              to="/tools/pathways/plan"
              className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono text-emerald-300 transition-colors"
            >
              Action Plan →
            </Link>
          </div>
        </div>

        {/* Section 1: CGPA Gap Calculator Widget */}
        <section className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <span>⚡ CGPA Gap Bridge Calculator</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculates required future semester GPA using exact formula: R = (T·N - C·n) / (N - n)
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded">
              Current: {profile.cgpa.toFixed(2)} CGPA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Target Cutoff CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={calcTargetCgpa}
                onChange={(e) => setCalcTargetCgpa(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:border-volt"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Completed Semesters (n)</label>
              <select
                value={calcCompletedSems}
                onChange={(e) => setCalcCompletedSems(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:border-volt"
              >
                <option value={1}>Semester 1 (7 left)</option>
                <option value={2}>Semester 2 (6 left)</option>
                <option value={3}>Semester 3 (5 left)</option>
                <option value={4}>Semester 4 (4 left)</option>
                <option value={5}>Semester 5 (3 left)</option>
                <option value={6}>Semester 6 (2 left)</option>
                <option value={7}>Semester 7 (1 left)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col justify-center">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Required Future Average</span>
              {cgpaGapResult.isAchieved ? (
                <div className="text-emerald-400 font-bold text-sm font-mono mt-1">
                  ✓ Already Achieved ({profile.cgpa} ≥ {calcTargetCgpa})
                </div>
              ) : !cgpaGapResult.isPossible ? (
                <div className="text-rose-400 font-bold text-xs font-mono mt-1">
                  ✕ Impossible on 10.0 scale ({cgpaGapResult.requiredRemainingCgpa})
                </div>
              ) : (
                <div className="text-volt font-bold text-base font-mono mt-1">
                  {cgpaGapResult.requiredRemainingCgpa} CGPA / sem
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'meets', 'check', 'fails', 'unknown'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-black font-semibold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-volt"
            />
          </div>
        </div>

        {/* Section 3: Programs Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.length === 0 ? (
            <div className="col-span-full p-8 text-center rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs font-mono">
              No programs match your current filter. Try selecting 'All' or clearing search.
            </div>
          ) : (
            filteredPrograms.map(({ program: p, evaluation: ev }) => {
              const badge = statusBadges[ev.status] || statusBadges.unknown;
              const elig = p.facts.eligibility || {};

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                          {p.facts.officialName}
                        </span>
                        <h3 className="text-lg font-black text-white leading-snug">
                          {p.facts.programName}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono border font-bold whitespace-nowrap ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Criteria Snapshot */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs font-mono bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/50">
                      <div>
                        <span className="text-xs font-bold text-zinc-400 block mb-0.5">CGPA Cutoff</span>
                        <span className="text-sm font-bold text-white">
                          {elig.cgpaMin !== undefined ? `${elig.cgpaMin} / ${elig.cgpaScale || 10}` : 'Unstated'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-400 block mb-0.5">Active Backlogs</span>
                        <span className="text-sm font-bold text-white">
                          {elig.maxActiveBacklogs !== undefined ? `Max ${elig.maxActiveBacklogs}` : 'Unstated'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-400 block mb-0.5">Service Agreement</span>
                        <span className="text-sm font-bold text-white">
                          {p.facts.bondMonths ? `${p.facts.bondMonths} Mo (${formatRupees(p.facts.bondAmount || 0)})` : 'Nil (0 Bond)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-400 block mb-0.5">Stipend</span>
                        <span className="text-sm font-bold text-volt">
                          {p.facts.stipend ? formatRupees(p.facts.stipend) : 'Unstated'}
                        </span>
                      </div>
                    </div>

                    {/* Caveats or Blocking Inputs */}
                    {ev.caveats.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1 font-medium">
                        {ev.caveats.map((c, idx) => (
                          <p key={idx} className="leading-relaxed">⚠ {c}</p>
                        ))}
                      </div>
                    )}

                    {ev.blockingInputs.length > 0 && (
                      <div className="text-xs font-mono font-bold text-amber-300">
                        Check these details: add {ev.blockingInputs.join(', ')} to settle this evaluation.
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <EvidenceChip evidence={p.evidence['officialName']} label="Evidence" />
                      <button
                        type="button"
                        onClick={() => setFeedbackSubjectId(p.id)}
                        className="text-zinc-400 hover:text-white text-[11px] underline cursor-pointer"
                      >
                        Report Error
                      </button>
                    </div>

                    <Link
                      to={`/tools/pathways/program/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      <FeedbackModal
        isOpen={Boolean(feedbackSubjectId)}
        onClose={() => setFeedbackSubjectId(null)}
        subjectId={feedbackSubjectId || ''}
      />

      <NonAffiliationFooter />
    </div>
  );
};
