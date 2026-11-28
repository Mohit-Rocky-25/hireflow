// ============================================================
// HireFlow — Phase 11.1 Zone C: Intelligence, Evidence,
// Build Brief Linker & Pre-Finalize Validation Panel
// ============================================================

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Briefcase,
  Hammer,
  Check,
  X,
  PlusCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { ALL_PROJECT_BRIEFS } from '@/features/suite/briefs/bundleBriefs';
import { useTailorWorkspaceStore } from '../store/useTailorWorkspaceStore';
import type { TailorWorkspaceSession } from '../model/tailorWorkspaceTypes';

interface TailorIntelligencePanelProps {
  session: TailorWorkspaceSession;
}

export function TailorIntelligencePanel({ session }: TailorIntelligencePanelProps) {
  const {
    acceptSuggestion,
    rejectSuggestion,
    editSuggestionProposedText,
    confirmUserEvidence,
    linkProjectEvidence,
    runValidation,
    commitTailoredVersion,
    runCanonicalReanalysis,
  } = useTailorWorkspaceStore();

  const [activeTab, setActiveTab] = useState<'suggestions' | 'requirements' | 'evidence' | 'validate'>(
    () =>
      session.launchFocus?.mode === 'add_gap' || Boolean(session.talentLensAssessmentId)
        ? 'requirements'
        : 'suggestions'
  );
  const [editingSugId, setEditingSugId] = useState<string | null>(null);
  const [sugTextDraft, setSugTextDraft] = useState('');
  const [metricPromptId, setMetricPromptId] = useState<string | null>(null);
  const [metricTextDraft, setMetricTextDraft] = useState('');
  const [metricNoteDraft, setMetricNoteDraft] = useState('');

  // Owned project linking composer state (Part 3 — never auto-attaches templates)
  const [projectComposerBriefId, setProjectComposerBriefId] = useState<string | null>(null);
  const [projTitleDraft, setProjTitleDraft] = useState('');
  const [projExistingEntryId, setProjExistingEntryId] = useState('');
  const [projContributionDraft, setProjContributionDraft] = useState('');
  const [projTechDraft, setProjTechDraft] = useState('');
  const [projStatusDraft, setProjStatusDraft] = useState<
    'completed' | 'in_progress' | 'partial_contributor'
  >('completed');
  const [projCoContributorsDraft, setProjCoContributorsDraft] = useState('');
  const [projEvidenceDraft, setProjEvidenceDraft] = useState('');
  const [projConfirmedCheck, setProjConfirmedCheck] = useState(false);

  const existingProjectEntries = useMemo(
    () =>
      session.document.sections
        .filter((s) => s.kind === 'projects')
        .flatMap((s) => s.entries || []),
    [session.document.sections]
  );

  // Manual user-confirmed evidence adder
  const [evidenceFact, setEvidenceFact] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidenceSkill, setEvidenceSkill] = useState('');

  // Finalize & ATS re-analysis state
  const [versionLabel, setVersionLabel] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    kind: 'ok' | 'err';
    message: string;
  } | null>(null);
  const [overrideJd, setOverrideJd] = useState('');

  // Match top relevant Build Briefs for missing/partial requirements
  const recommendedBriefs = useMemo(() => {
    const missingTerms = session.requirements
      .filter((r) => r.status === 'missing_evidence' || r.status === 'not_found')
      .map((r) => r.requirementText.toLowerCase());
    if (missingTerms.length === 0) return ALL_PROJECT_BRIEFS.slice(0, 4);

    return [...ALL_PROJECT_BRIEFS]
      .sort((a, b) => {
        const aScore = a.coveredSkills.filter((sk) =>
          missingTerms.some((m) => m.includes(sk.toLowerCase()))
        ).length;
        const bScore = b.coveredSkills.filter((sk) =>
          missingTerms.some((m) => m.includes(sk.toLowerCase()))
        ).length;
        return bScore - aScore;
      })
      .slice(0, 5);
  }, [session.requirements]);

  async function handleCommitVersion() {
    setActionBusy(true);
    setActionFeedback(null);
    try {
      const ref = await commitTailoredVersion(versionLabel);
      setActionFeedback({
        kind: 'ok',
        message: `Committed immutable version "${ref.label}" to Resume Matrix.`,
      });
      setVersionLabel('');
    } catch (err) {
      setActionFeedback({
        kind: 'err',
        message: err instanceof Error ? err.message : 'Unable to commit new Resume Version.',
      });
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReanalyze() {
    setActionBusy(true);
    setActionFeedback(null);
    try {
      const ref = await runCanonicalReanalysis(overrideJd.trim() || undefined);
      setActionFeedback({
        kind: 'ok',
        message: `Canonical ${ref.engineVersion} ATS scan completed: ${ref.overallScore}/100 recorded to Audit History.`,
      });
    } catch (err) {
      setActionFeedback({
        kind: 'err',
        message: err instanceof Error ? err.message : 'ATS re-analysis could not run.',
      });
    } finally {
      setActionBusy(false);
    }
  }

  const tabs: Array<{ id: typeof activeTab; label: string; badge?: number }> = [
    {
      id: 'suggestions',
      label: 'Suggestions',
      badge: session.suggestions.filter((s) => s.status === 'pending').length,
    },
    { id: 'requirements', label: 'Fit & Gaps', badge: session.requirements.length },
    { id: 'evidence', label: 'Proof & Projects', badge: session.atomicClaims.length },
    { id: 'validate', label: 'Validate & ATS' },
  ];

  const report = session.validationReport;

  return (
    <aside
      aria-label="Tailoring Intelligence and Evidence Panel"
      className="bg-[#10100d] border border-[#24241c] rounded-2xl p-4 space-y-4 h-fit"
    >
      {/* Zone C Tabs */}
      <div role="tablist" aria-label="Intelligence views" className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#0a0a08] border border-[#24241c]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-[#faff69] text-[#0a0a08]'
                : 'text-[#9b9b8c] hover:text-[#f1f1e8]'
            }`}
          >
            {tab.label}
            {typeof tab.badge === 'number' && tab.badge > 0 ? ` (${tab.badge})` : ''}
          </button>
        ))}
      </div>

      {/* Focused ATS Finding Context Banner */}
      {session.launchFocus &&
        (session.launchFocus.focusSkill ||
          session.launchFocus.selectedBullet ||
          session.launchFocus.findingIds.length > 0) && (
          <div className="p-2.5 rounded-xl border border-[#faff69]/30 bg-[#171811] text-[11px] space-y-1">
            <div className="font-semibold text-[#faff69] uppercase tracking-wider">
              Focused Launch Context ({session.launchFocus.mode.replace(/_/g, ' ')})
            </div>
            {session.launchFocus.focusSkill && (
              <div className="text-[#f1f1e8]">
                Target Skill / Gap: <strong>{session.launchFocus.focusSkill}</strong>
              </div>
            )}
            {session.launchFocus.selectedBullet && (
              <div className="text-[#d6d6c8]">
                Selected Focus: <span className="italic">{session.launchFocus.selectedBullet}</span>
              </div>
            )}
            {session.launchFocus.findingIds.length > 0 && (
              <div className="text-[#9b9b8c]">
                Findings: {session.launchFocus.findingIds.slice(0, 3).join(', ')}
                {session.launchFocus.evidenceIds.length > 0
                  ? ` · Evidence spans: ${session.launchFocus.evidenceIds.length}`
                  : ''}
              </div>
            )}
          </div>
        )}

      {/* Tab 1: Strategy & Truth-Checked Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {session.strategyPlan.length > 0 && (
            <div className="p-3 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#faff69] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Engineering Strategy ({session.mode.toUpperCase()})
              </div>
              <ul className="space-y-1 text-xs text-[#c5c5b6] list-disc pl-4">
                {session.strategyPlan.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {session.suggestions.length === 0 ? (
            <p className="text-xs text-[#9b9b8c] p-3 rounded-xl border border-[#24241c] bg-[#0a0a08]">
              No automatic rewrite flags found. Your statements already use concrete verbs and
              verifiable phrasing; you can still refine inline or link completed projects.
            </p>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {session.suggestions.map((sug) => {
                const isEditing = editingSugId === sug.id;
                const isPromptingMetric = metricPromptId === sug.id;
                return (
                  <div
                    key={sug.id}
                    className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
                      sug.status === 'accepted'
                        ? 'border-emerald-700/50 bg-emerald-950/20'
                        : sug.status === 'rejected'
                        ? 'border-[#1b1b15] bg-[#0a0a08]/40 opacity-60'
                        : 'border-[#24241c] bg-[#0a0a08]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[#f1f1e8]">{sug.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold shrink-0 ${
                          sug.truthGatePassed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                            : 'bg-red-950 text-red-300 border border-red-700/40'
                        }`}
                      >
                        {sug.truthGatePassed ? sug.evidenceClass.replace(/_/g, ' ') : 'Truth Blocked'}
                      </span>
                    </div>

                    <p className="text-[#9b9b8c] leading-relaxed">{sug.rationale}</p>

                    {!sug.truthGatePassed && sug.truthGateIssues.length > 0 && (
                      <div className="p-2 rounded bg-[#2a120d] border border-[#ff6b4a]/30 text-[#ffb4a2] text-[11px]">
                        {sug.truthGateIssues[0]}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#6d6d61]">
                        Original Excerpt
                      </div>
                      <div className="p-2 rounded bg-[#141410] text-[#9b9b8c] border border-[#24241c]">
                        {sug.originalText}
                      </div>

                      <div className="text-[10px] uppercase tracking-wider text-[#6d6d61]">
                        Proposed Improvement
                      </div>
                      {isEditing ? (
                        <div className="space-y-1.5">
                          <textarea
                            aria-label={`Edit proposed rewrite for ${sug.title}`}
                            value={sugTextDraft}
                            onChange={(e) => setSugTextDraft(e.target.value)}
                            rows={3}
                            className="w-full p-2 rounded bg-[#141410] border border-[#faff69]/60 text-[#f1f1e8]"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                editSuggestionProposedText(sug.id, sugTextDraft);
                                setEditingSugId(null);
                              }}
                              className="px-2.5 py-1 rounded bg-[#faff69] text-[#0a0a08] font-bold"
                            >
                              Save Proposal
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSugId(null)}
                              className="px-2.5 py-1 rounded border border-[#24241c] text-[#9b9b8c]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-[#171811] text-[#f1f1e8] border border-[#2d2d22]">
                          {sug.proposedText}
                        </div>
                      )}
                    </div>

                    {sug.needsMetricPrompt && sug.metricQuestion && (
                      <div className="p-2.5 rounded-lg bg-[#19170c] border border-[#facc15]/30 space-y-2">
                        <div className="text-[11px] text-[#fde68a] font-medium">
                          {sug.metricQuestion}
                        </div>
                        {isPromptingMetric ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={metricTextDraft}
                              onChange={(e) => setMetricTextDraft(e.target.value)}
                              placeholder="Updated bullet with authentic verified number/outcome..."
                              aria-label="Verified statement with authentic metric"
                              className="w-full px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
                            />
                            <input
                              type="text"
                              value={metricNoteDraft}
                              onChange={(e) => setMetricNoteDraft(e.target.value)}
                              placeholder="Source/context (e.g., Q3 production Datadog dashboard)"
                              aria-label="Evidence note"
                              className="w-full px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!metricTextDraft.trim()) return;
                                  confirmUserEvidence({
                                    factText: metricTextDraft,
                                    evidenceNote:
                                      metricNoteDraft || 'Candidate-confirmed authentic metric',
                                    targetSkillOrMetric: sug.title,
                                    bulletId: sug.bulletId,
                                  });
                                  setMetricPromptId(null);
                                  setMetricTextDraft('');
                                  setMetricNoteDraft('');
                                }}
                                className="px-2.5 py-1 rounded bg-[#faff69] text-[#0a0a08] font-bold"
                              >
                                Confirm &amp; Apply Real Metric
                              </button>
                              <button
                                type="button"
                                onClick={() => setMetricPromptId(null)}
                                className="px-2 py-1 text-[#9b9b8c]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMetricPromptId(sug.id);
                              setMetricTextDraft(sug.proposedText);
                            }}
                            className="text-[11px] font-semibold text-[#faff69] underline"
                          >
                            Confirm Authentic Metric / Impact
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={!sug.truthGatePassed || sug.status === 'accepted'}
                        onClick={() => {
                          const res = acceptSuggestion(sug.id);
                          if (!res.ok) {
                            setActionFeedback({
                              kind: 'err',
                              message: res.error || 'Proposal blocked by Truth Gate.',
                            });
                          }
                        }}
                        className="px-3 py-1 rounded-full bg-[#faff69] text-[#0a0a08] font-bold disabled:opacity-40 inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        {sug.status === 'accepted' ? 'Applied' : 'Accept'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSugId(sug.id);
                          setSugTextDraft(sug.proposedText);
                        }}
                        className="px-3 py-1 rounded-full border border-[#24241c] text-[#f1f1e8] hover:border-[#faff69]/40"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectSuggestion(sug.id)}
                        className="px-3 py-1 rounded-full border border-[#24241c] text-[#9b9b8c] hover:text-[#ff8a70] inline-flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Requirements & Honest TalentLens / JD Separation */}
      {activeTab === 'requirements' && (
        <div className="space-y-4 text-xs">
          {session.talentLensAssessmentId && (
            <div className="p-3 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-2">
              <div className="font-semibold text-[#faff69] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                TalentLens Qualification Split
              </div>
              <p className="text-[11px] text-[#9b9b8c]">
                Benchmark role expectations never convert into candidate claims until matched in your
                resume or explicitly confirmed below.
              </p>
            </div>
          )}

          {session.requirements.length === 0 ? (
            <p className="text-[#9b9b8c] p-3 rounded-xl border border-[#24241c] bg-[#0a0a08]">
              Switch to <strong>Target Role</strong> or <strong>Target JD</strong> mode in the left
              rail to evaluate requirement-by-requirement alignment.
            </p>
          ) : (
            <div
              tabIndex={0}
              aria-label="Requirement breakdown list"
              className="space-y-2 max-h-[420px] overflow-y-auto pr-1 focus:outline-none focus:ring-1 focus:ring-[#faff69]/40 rounded-lg"
            >
              {session.requirements.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-[#f1f1e8]">{req.requirementText}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold shrink-0 ${
                        req.status === 'directly_demonstrated' || req.status === 'user_confirmed'
                          ? 'bg-emerald-950 text-emerald-300'
                          : req.status === 'partially_supported' || req.status === 'transferable'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6d6d61]">
                    Priority: <strong className="text-[#9b9b8c]">{req.priority}</strong>
                    {req.logicalOperator ? ` (${req.logicalOperator})` : ''}
                  </div>
                  <p className="text-[11px] text-[#9b9b8c]">{req.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Genuine Missing Qualification */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!evidenceFact.trim() || !evidenceSkill.trim()) return;
              confirmUserEvidence({
                factText: evidenceFact.trim(),
                evidenceNote: evidenceNote.trim() || 'User-confirmed factual record',
                targetSkillOrMetric: evidenceSkill.trim(),
              });
              setEvidenceFact('');
              setEvidenceNote('');
              setEvidenceSkill('');
            }}
            className="p-3.5 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-2"
          >
            <div className="font-semibold text-[#f1f1e8] flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-[#faff69]" />
              Confirm Real Candidate Evidence
            </div>
            <input
              type="text"
              aria-label="Verified skill or requirement"
              value={evidenceSkill}
              onChange={(e) => setEvidenceSkill(e.target.value)}
              placeholder="Skill / Requirement (e.g., Kubernetes)"
              className="w-full px-2.5 py-1.5 rounded bg-[#141410] border border-[#24241c] text-xs text-[#f1f1e8]"
            />
            <input
              type="text"
              aria-label="Factual candidate statement"
              value={evidenceFact}
              onChange={(e) => setEvidenceFact(e.target.value)}
              placeholder="True statement (e.g., Managed EKS Kubernetes clusters in capstone)"
              className="w-full px-2.5 py-1.5 rounded bg-[#141410] border border-[#24241c] text-xs text-[#f1f1e8]"
            />
            <input
              type="text"
              aria-label="Evidence verification note"
              value={evidenceNote}
              onChange={(e) => setEvidenceNote(e.target.value)}
              placeholder="Context / Verification note"
              className="w-full px-2.5 py-1.5 rounded bg-[#141410] border border-[#24241c] text-xs text-[#f1f1e8]"
            />
            <button
              type="submit"
              disabled={!evidenceFact.trim() || !evidenceSkill.trim()}
              className="w-full py-1.5 rounded-full bg-[#faff69] text-[#0a0a08] font-bold disabled:opacity-40"
            >
              Add Confirmed Evidence to Ledger
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Atomic Claims Proof Ledger & Build Briefs Project Linker */}
      {activeTab === 'evidence' && (
        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61]">
              Source &amp; Attested Claim Ledger ({session.atomicClaims.length})
            </div>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {session.atomicClaims.map((claim) => (
                <div
                  key={claim.claimId}
                  className="p-2.5 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase text-[#faff69]">
                      {claim.provenanceKind.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] ${
                        claim.userConfirmed ? 'text-amber-300' : 'text-emerald-400'
                      }`}
                    >
                      {claim.userConfirmed
                        ? 'user-attested (note only)'
                        : 'source-supported'}
                    </span>
                  </div>
                  <div className="text-[#f1f1e8] line-clamp-2">{claim.claimText}</div>
                  {claim.extractedMetrics.length > 0 && (
                    <div className="text-[10px] text-[#9b9b8c]">
                      Source Metrics: {claim.extractedMetrics.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-[#24241c] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61] flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5 text-[#faff69]" />
                Build Brief Opportunities &amp; Owned Projects
              </span>
              <Link to="/tools/build-briefs" className="text-[11px] text-[#faff69] underline">
                Full Catalog
              </Link>
            </div>
            <p className="text-[11px] text-[#9b9b8c]">
              Catalog briefs are opportunities only—they never insert completed experience until
              you confirm your actual project ownership and contribution.
            </p>
            <div className="space-y-2">
              {recommendedBriefs.map((brief) => {
                const isPlanned = (session.plannedProjectBriefIds ?? []).includes(brief.id);
                const isOwned = (session.ownedProjects ?? []).some(
                  (p) => p.linkedBriefId === brief.id
                );
                const isComposing = projectComposerBriefId === brief.id;
                return (
                  <div
                    key={brief.id}
                    className="p-2.5 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-[#f1f1e8] truncate">{brief.title}</div>
                        <div className="text-[10px] text-[#9b9b8c] truncate">
                          Relevant stack: {brief.techStack.slice(0, 4).join(' • ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={isPlanned || isOwned}
                          onClick={() => {
                            linkProjectEvidence(brief);
                            setActionFeedback({
                              kind: 'ok',
                              message: `Saved "${brief.title}" as a target Build Opportunity (not added as resume history).`,
                            });
                          }}
                          className="px-2 py-1 rounded-full border border-[#24241c] text-[10px] font-semibold text-[#9b9b8c] hover:text-[#f1f1e8] disabled:opacity-40"
                        >
                          {isPlanned ? 'Saved Goal' : 'Save Opportunity'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isComposing) {
                              setProjectComposerBriefId(null);
                            } else {
                              setProjectComposerBriefId(brief.id);
                              setProjTitleDraft(brief.title);
                              setProjExistingEntryId('');
                              setProjContributionDraft('');
                              setProjTechDraft('');
                              setProjCoContributorsDraft('');
                              setProjEvidenceDraft('');
                              setProjConfirmedCheck(false);
                            }
                          }}
                          className="px-2.5 py-1 rounded-full border border-[#24241c] text-[10px] font-semibold text-[#faff69] hover:border-[#faff69]/60"
                        >
                          {isOwned ? 'Add Contribution' : 'Attach Owned...'}
                        </button>
                      </div>
                    </div>

                    {isComposing && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const out = linkProjectEvidence(brief, {
                            confirmedByCandidate: projConfirmedCheck,
                            title: projTitleDraft,
                            existingProjectEntryId: projExistingEntryId || undefined,
                            candidateContribution: projContributionDraft,
                            technologiesUsed: projTechDraft
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean),
                            completionStatus: projStatusDraft,
                            coContributors: projCoContributorsDraft || undefined,
                            evidenceNote: projEvidenceDraft,
                          });
                          if (!out.attached) {
                            setActionFeedback({
                              kind: 'err',
                              message:
                                out.error ||
                                'Check ownership box and describe your actual contribution.',
                            });
                            return;
                          }
                          setProjectComposerBriefId(null);
                          setActionFeedback({
                            kind: 'ok',
                            message: `Attached candidate-owned contribution for "${projTitleDraft || brief.title}" and validated against Truth Gate.`,
                          });
                        }}
                        className="p-2.5 rounded-lg border border-[#2d2d22] bg-[#141410] space-y-2"
                      >
                        {existingProjectEntries.length > 0 && (
                          <select
                            aria-label="Associate with existing resume project"
                            value={projExistingEntryId}
                            onChange={(e) => setProjExistingEntryId(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-[11px] text-[#f1f1e8]"
                          >
                            <option value="">Create new candidate-owned project entry...</option>
                            {existingProjectEntries.map((pe) => (
                              <option key={pe.id} value={pe.id}>
                                Attach to existing: {pe.title}
                              </option>
                            ))}
                          </select>
                        )}
                        {!projExistingEntryId && (
                          <input
                            type="text"
                            aria-label="Project title"
                            value={projTitleDraft}
                            onChange={(e) => setProjTitleDraft(e.target.value)}
                            placeholder="Your project title"
                            className="w-full px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-[11px] text-[#f1f1e8]"
                          />
                        )}
                        <textarea
                          rows={2}
                          aria-label="Your actual contribution"
                          value={projContributionDraft}
                          onChange={(e) => setProjContributionDraft(e.target.value)}
                          placeholder="Describe strictly what YOU built or contributed..."
                          className="w-full px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-[11px] text-[#f1f1e8]"
                        />
                        <input
                          type="text"
                          aria-label="Technologies actually used"
                          value={projTechDraft}
                          onChange={(e) => setProjTechDraft(e.target.value)}
                          placeholder="Technologies YOU used (comma separated, e.g. Python, SQLite)"
                          className="w-full px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-[11px] text-[#f1f1e8]"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <select
                            aria-label="Completion status"
                            value={projStatusDraft}
                            onChange={(e) =>
                              setProjStatusDraft(
                                e.target.value as 'completed' | 'in_progress' | 'partial_contributor'
                              )
                            }
                            className="px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-[11px] text-[#f1f1e8]"
                          >
                            <option value="completed">Completed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="partial_contributor">Team / Partial Contributor</option>
                          </select>
                          <input
                            type="text"
                            aria-label="Evidence note or repo URL"
                            value={projEvidenceDraft}
                            onChange={(e) => setProjEvidenceDraft(e.target.value)}
                            placeholder="Repo / proof note"
                            className="px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-[11px] text-[#f1f1e8]"
                          />
                        </div>
                        {projStatusDraft === 'partial_contributor' && (
                          <input
                            type="text"
                            aria-label="Co-contributors"
                            value={projCoContributorsDraft}
                            onChange={(e) => setProjCoContributorsDraft(e.target.value)}
                            placeholder="Team / co-contributors context"
                            className="w-full px-2 py-1 rounded bg-[#0a0a08] border border-[#24241c] text-[11px] text-[#f1f1e8]"
                          />
                        )}
                        <label className="flex items-start gap-2 text-[11px] text-[#c5c5b6] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={projConfirmedCheck}
                            onChange={(e) => setProjConfirmedCheck(e.target.checked)}
                            className="mt-0.5"
                          />
                          <span>
                            I confirm I built/contributed to this project and actually used the
                            listed technologies (candidate-attested).
                          </span>
                        </label>
                        <button
                          type="submit"
                          disabled={!projConfirmedCheck || !projContributionDraft.trim()}
                          className="w-full py-1.5 rounded-full bg-[#faff69] text-[#0a0a08] font-bold text-[11px] disabled:opacity-40"
                        >
                          Add Candidate-Owned Project
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Pre-Finalize Validation Gate, Commit Version & Closed-Loop ATS */}
      {activeTab === 'validate' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#faff69]" />
              Final Validation Gate
            </span>
            <button
              type="button"
              onClick={() => {
                const res = runValidation();
                setActionFeedback(
                  res && res.factualPassed && res.documentPassed
                    ? { kind: 'ok', message: 'Validation Gate passed cleanly.' }
                    : {
                        kind: 'err',
                        message:
                          res?.blockingIssues[0]?.message ||
                          'Validation Gate flagged blocking issues.',
                      }
                );
              }}
              className="text-[11px] text-[#faff69] underline"
            >
              Re-check
            </button>
          </div>

          {report && (
            <div className="space-y-2">
              {report.blockingIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-2.5 rounded-xl border border-rose-700/50 bg-rose-950/30 text-rose-200 flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{issue.message}</span>
                </div>
              ))}
              {report.warnings.map((w) => (
                <div
                  key={w.id}
                  className="p-2.5 rounded-xl border border-amber-700/40 bg-amber-950/20 text-amber-200 flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{w.message}</span>
                </div>
              ))}
              {report.passedChecks.map((check, i) => (
                <div
                  key={i}
                  className="p-2 rounded-lg border border-emerald-800/40 bg-emerald-950/20 text-emerald-300 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          )}

          {/* Commit Immutable Resume Version */}
          <div className="p-3.5 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-2.5">
            <div className="font-semibold text-[#f1f1e8] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#faff69]" />
              Commit Immutable Resume Version
            </div>
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder={`Version label (e.g., Tailored for ${session.jdCompany || session.targetRole || 'Target'})`}
              aria-label="New resume version label"
              className="w-full px-2.5 py-1.5 rounded bg-[#141410] border border-[#24241c] text-xs text-[#f1f1e8]"
            />
            <button
              type="button"
              disabled={actionBusy || Boolean(report && (!report.factualPassed || !report.documentPassed))}
              onClick={handleCommitVersion}
              className="w-full py-2 rounded-full bg-[#faff69] text-[#0a0a08] font-bold disabled:opacity-40"
            >
              Commit New Version to Resume Matrix
            </button>
          </div>

          {/* Canonical 7D ATS Re-Analysis Closed Loop */}
          <div className="p-3.5 rounded-xl border border-[#24241c] bg-[#0a0a08] space-y-2.5">
            <div className="font-semibold text-[#f1f1e8] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#faff69]" />
              Canonical 7D ATS Re-Analysis
            </div>

            {(session.baselineScore !== null || session.reanalysisScore !== null) && (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#141410] border border-[#24241c]">
                  <div className="text-[10px] text-[#6d6d61] uppercase">Baseline ATS</div>
                  <div className="text-base font-bold text-[#f1f1e8]">
                    {session.baselineScore !== null ? `${session.baselineScore}/100` : '—'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#141410] border border-[#24241c]">
                  <div className="text-[10px] text-[#6d6d61] uppercase">Re-Analyzed</div>
                  <div className="text-base font-bold text-[#faff69]">
                    {session.reanalysisScore !== null ? `${session.reanalysisScore}/100` : 'Pending'}
                    {session.baselineScore !== null && session.reanalysisScore !== null && (
                      <span className="ml-1.5 text-xs">
                        ({session.reanalysisScore - session.baselineScore >= 0 ? '+' : ''}
                        {session.reanalysisScore - session.baselineScore})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!session.jdText.trim() && (
              <textarea
                value={overrideJd}
                onChange={(e) => setOverrideJd(e.target.value)}
                rows={3}
                placeholder="Paste a Job Description to score this tailored version via canonical 7D ATS engine..."
                aria-label="Job Description for ATS re-analysis"
                className="w-full px-2.5 py-1.5 rounded bg-[#141410] border border-[#24241c] text-xs text-[#f1f1e8]"
              />
            )}

            <button
              type="button"
              disabled={actionBusy || (!session.jdText.trim() && !overrideJd.trim())}
              onClick={handleReanalyze}
              className="w-full py-2 rounded-full border border-[#faff69]/70 text-[#faff69] hover:bg-[#faff69] hover:text-[#0a0a08] font-bold disabled:opacity-40 transition-colors"
            >
              {actionBusy ? 'Scoring with 4.0.0-ats7d...' : 'Run Canonical ATS Re-Analysis'}
            </button>
            {session.reanalysisScore !== null && session.reanalysisIsDraftSnapshot && (
              <p className="text-[10px] text-amber-300 leading-relaxed">
                Last scan evaluated an <strong>unsaved draft snapshot</strong> (never misattributed to v1). Commit a new Resume Version above to bind this scan to a permanent version.
              </p>
            )}
          </div>

          {actionFeedback && (
            <div
              role={actionFeedback.kind === 'err' ? 'alert' : 'status'}
              className={`p-3 rounded-xl border text-xs ${
                actionFeedback.kind === 'ok'
                  ? 'border-emerald-700/50 bg-emerald-950/30 text-emerald-200'
                  : 'border-rose-700/50 bg-rose-950/30 text-rose-200'
              }`}
            >
              {actionFeedback.message}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
