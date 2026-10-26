// ============================================================
// Pathways Architecture — Route 2: Program Detail Page
// Wireframe C13 Screen 2. Zero component arithmetic (Constitution E6).
// ============================================================

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PATHWAYS_PROGRAMS } from '../facts/programs.generated';
import { evaluateEligibility } from '../engine/eligibility';
import { usePathwaysProfileStore } from '../profile/profileStore';
import { EvidenceChip } from '../components/EvidenceChip';
import { NonAffiliationFooter } from '../components/NonAffiliationFooter';
import { FeedbackModal } from '../components/FeedbackModal';
import { formatRupees } from '../utils/money';

export const ProgramDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = usePathwaysProfileStore();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const program = useMemo(() => {
    return PATHWAYS_PROGRAMS.find((p) => p.id === id);
  }, [id]);

  const evaluation = useMemo(() => {
    if (!program) return null;
    return evaluateEligibility(profile, program);
  }, [program, profile]);

  if (!program || !evaluation) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between font-sans">
        <main className="max-w-4xl mx-auto w-full p-6 text-center py-20 space-y-4">
          <h1 className="text-2xl font-bold text-white">Program Not Found</h1>
          <p className="text-zinc-400 text-sm">
            We could not find a verified campus program with ID &quot;{id}&quot;.
          </p>
          <Link
            to="/tools/pathways"
            className="inline-block px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-volt text-xs font-mono"
          >
            ← Return to Eligibility Radar
          </Link>
        </main>
        <NonAffiliationFooter />
      </div>
    );
  }

  const statusBadges: Record<string, { label: string; className: string }> = {
    meets: { label: 'Meets Published Criteria', className: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' },
    check: { label: 'Check These Details', className: 'bg-amber-950/80 border-amber-500/50 text-amber-300' },
    fails: { label: 'Does Not Meet a Criterion', className: 'bg-rose-950/80 border-rose-500/50 text-rose-300' },
    unknown: { label: 'No Criteria Published', className: 'bg-zinc-800 border-zinc-600 text-zinc-300' }
  };

  const currentBadge = statusBadges[evaluation.status] || statusBadges.unknown;
  const officialEvidence = program.evidence['officialName'] || Object.values(program.evidence)[0];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between font-sans">
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link
            to="/tools/pathways"
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Radar
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-xs font-mono text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/40 px-3 py-1.5 rounded transition-colors"
            >
              Report an Error
            </button>
            <a
              href={program.facts.programPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-volt hover:underline flex items-center gap-1 border border-volt/30 px-3 py-1.5 rounded bg-volt/10"
            >
              Official Portal ↗
            </a>
          </div>
        </div>

        {/* Hero Header */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 sm:p-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {program.id}
            </span>
            <span className={`text-xs font-mono px-2.5 py-0.5 rounded border ${currentBadge.className}`}>
              {currentBadge.label}
            </span>
            {officialEvidence && <EvidenceChip evidence={officialEvidence} />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {program.facts.officialName}
          </h1>
          <p className="text-sm text-zinc-400">
            {program.facts.programName} • Verified as of {program.lastChecked}
          </p>
        </div>

        {/* Published Criteria Section */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Published Eligibility Criteria
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1">
              <div className="text-zinc-400">CGPA Cutoff</div>
              <div className="text-white font-medium text-sm">
                {program.facts.eligibility.cgpaMin !== undefined
                  ? `${program.facts.eligibility.cgpaMin} / ${program.facts.eligibility.cgpaScale || 10}`
                  : 'Not published'}
              </div>
              {program.evidence['eligibility.cgpaMin'] && (
                <EvidenceChip evidence={program.evidence['eligibility.cgpaMin']} />
              )}
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1">
              <div className="text-zinc-400">Class X / 10th Minimum</div>
              <div className="text-white font-medium text-sm">
                {program.facts.eligibility.percent10Min !== undefined
                  ? `${program.facts.eligibility.percent10Min}%`
                  : 'Not published'}
              </div>
              {program.evidence['eligibility.percent10Min'] && (
                <EvidenceChip evidence={program.evidence['eligibility.percent10Min']} />
              )}
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1">
              <div className="text-zinc-400">Class XII / 12th Minimum</div>
              <div className="text-white font-medium text-sm">
                {program.facts.eligibility.percent12Min !== undefined
                  ? `${program.facts.eligibility.percent12Min}%`
                  : 'Not published'}
              </div>
              {program.evidence['eligibility.percent12Min'] && (
                <EvidenceChip evidence={program.evidence['eligibility.percent12Min']} />
              )}
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1">
              <div className="text-zinc-400">Active Backlogs Allowed</div>
              <div className="text-white font-medium text-sm">
                {program.facts.eligibility.maxActiveBacklogs !== undefined
                  ? `${program.facts.eligibility.maxActiveBacklogs} backlog(s)`
                  : 'Not published'}
              </div>
              {program.evidence['eligibility.maxActiveBacklogs'] && (
                <EvidenceChip evidence={program.evidence['eligibility.maxActiveBacklogs']} />
              )}
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1">
              <div className="text-zinc-400">Academic Gap Limit</div>
              <div className="text-white font-medium text-sm">
                {program.facts.eligibility.maxGapMonths !== undefined
                  ? `${program.facts.eligibility.maxGapMonths} months maximum`
                  : 'Not published'}
              </div>
              {program.evidence['eligibility.maxGapMonths'] && (
                <EvidenceChip evidence={program.evidence['eligibility.maxGapMonths']} />
              )}
            </div>

            <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1">
              <div className="text-zinc-400">Service Bond Terms</div>
              <div className="text-white font-medium text-sm">
                {program.facts.bondMonths !== undefined && program.facts.bondAmount !== undefined
                  ? `${formatRupees(program.facts.bondAmount)} for ${program.facts.bondMonths} months`
                  : program.facts.bondMonths === 0
                  ? 'No bond'
                  : 'Not published'}
              </div>
              {program.evidence['bondMonths'] && (
                <EvidenceChip evidence={program.evidence['bondMonths']} />
              )}
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1 text-xs">
            <div className="text-zinc-400">Eligible Branches</div>
            <div className="text-zinc-200">
              {program.facts.eligibility.branches && program.facts.eligibility.branches.length > 0
                ? program.facts.eligibility.branches.join(', ')
                : 'All engineering branches'}
            </div>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 space-y-1 text-xs">
            <div className="text-zinc-400">Eligible Degrees</div>
            <div className="text-zinc-200">
              {program.facts.eligibility.degrees && program.facts.eligibility.degrees.length > 0
                ? program.facts.eligibility.degrees.join(', ')
                : 'B.Tech / B.E. / MCA'}
            </div>
          </div>
        </section>

        {/* Selection Stages Section */}
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Selection Stages (Published)
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">Official Process</span>
          </div>

          {program.facts.stages && program.facts.stages.length > 0 ? (
            <div className="space-y-2">
              {program.facts.stages.map((stage, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-xs font-medium">{stage.name}</div>
                    {(stage.platform || stage.duration) && (
                      <div className="text-[11px] text-zinc-400">
                        {stage.platform ? `Platform: ${stage.platform}` : ''}
                        {stage.platform && stage.duration ? ' • ' : ''}
                        {stage.duration ? `Duration: ${stage.duration}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">
              Selection stages are not explicitly published on the primary portal.
            </p>
          )}

          <div className="p-3 bg-zinc-950/40 rounded border border-zinc-800 text-[11px] text-zinc-400">
            Note: Selection stage timelines and topics reflect standard campus drive patterns and are subject to change per institute drive.
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            to={`/tools/pathways/plan?target=${program.id}`}
            className="w-full sm:w-1/2 py-3 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono text-center font-medium transition-colors"
          >
            Create Action Plan for {program.facts.officialName} →
          </Link>
          <Link
            to={`/tools/pathways/offers?program=${program.id}`}
            className="w-full sm:w-1/2 py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-mono text-center font-medium transition-colors"
          >
            Evaluate an Offer from This Program →
          </Link>
        </div>
      </main>

      {feedbackOpen && (
        <FeedbackModal
          isOpen={feedbackOpen}
          subjectId={program.id}
          onClose={() => setFeedbackOpen(false)}
        />
      )}

      <NonAffiliationFooter />
    </div>
  );
};
