// ============================================================
// Pathways Architecture — Route 3: Action Plan Page
// Wireframe C13 Screen 3. Zero component arithmetic (Constitution E6).
// ============================================================

import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PATHWAYS_PROGRAMS } from '../facts/programs.generated';
import { generateActionPlan } from '../engine/plan';
import { resolveLocalReadiness } from '../engine/readiness';
import { EDITORIAL_ASSUMPTIONS } from '../models/assumptions';
import { usePathwaysProfileStore } from '../profile/profileStore';
import { ProfileBudgetBar } from '../components/ProfileBudgetBar';
import { NonAffiliationFooter } from '../components/NonAffiliationFooter';

export const ActionPlanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTarget = searchParams.get('target') || PATHWAYS_PROGRAMS[0]?.id || 'tcs-ninja';
  const { profile } = usePathwaysProfileStore();

  const [selectedTargetId, setSelectedTargetId] = useState<string>(initialTarget);
  const [selectedPace, setSelectedPace] = useState<'relaxed' | 'standard' | 'intense'>('standard');
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});
  const [showAssumptionsModal, setShowAssumptionsModal] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  const targetProgram = useMemo(() => {
    return PATHWAYS_PROGRAMS.find((p) => p.id === selectedTargetId) || PATHWAYS_PROGRAMS[0];
  }, [selectedTargetId]);

  const readinessSummary = useMemo(() => {
    return resolveLocalReadiness();
  }, []);

  const planResult = useMemo(() => {
    if (!targetProgram) return null;
    return generateActionPlan(profile, targetProgram, selectedPace);
  }, [profile, targetProgram, selectedPace]);

  const toggleTask = (id: string) => {
    setCompletedTaskIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyPlan = () => {
    if (!planResult || !targetProgram) return;
    const lines = [
      `# Pathways Action Plan: ${targetProgram.facts.officialName}`,
      `Pace: ${selectedPace.toUpperCase()} (${planResult.paceMultiplier}x)`,
      `Estimated Duration: ${planResult.totalWeeksRange.min} - ${planResult.totalWeeksRange.max} weeks (likely: ${planResult.totalWeeksRange.likely} weeks)`,
      '',
      '## Tasks',
      ...planResult.tasks.map(
        (t) =>
          `- [${completedTaskIds[t.id] ? 'x' : ' '}] ${t.title} (${t.effortMinWeeks}-${t.effortMaxWeeks} wks): ${t.actionRequired}`
      ),
      '',
      'Generated via HireFlow Pathways. Relative week ranges. Draft assumptions apply.'
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2000);
  };

  const phaseOneTasks = useMemo(() => {
    return planResult ? planResult.tasks.filter((t) => t.category === 'eligibility_blocker') : [];
  }, [planResult]);

  const phaseTwoTasks = useMemo(() => {
    return planResult ? planResult.tasks.filter((t) => t.category === 'readiness_gap') : [];
  }, [planResult]);

  const phaseThreeTasks = useMemo(() => {
    return planResult ? planResult.tasks.filter((t) => t.category === 'process_prep') : [];
  }, [planResult]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      <ProfileBudgetBar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                Deterministic Action Planner
              </span>
              <span className="text-zinc-500 text-xs font-mono">Relative Weeks Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
              Action Plan: Engineering Career Path
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Stays in your browser. Never uploaded. Derived from official stage types and your current profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPlan}
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-white transition-colors"
            >
              {copiedStatus ? '✓ Copied!' : 'Copy Plan'}
            </button>
            <button
              onClick={() => setShowAssumptionsModal(true)}
              className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono transition-colors"
            >
              Assumptions Panel
            </button>
          </div>
        </div>

        {/* Inputs (Budget 3 Controls) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
              1. Target Program
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-volt"
            >
              {PATHWAYS_PROGRAMS.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.facts.officialName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
              2. Preparation Pace
            </label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedPace('relaxed')}
                className={`py-1.5 text-center text-xs rounded transition-colors ${
                  selectedPace === 'relaxed'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Relaxed
              </button>
              <button
                type="button"
                onClick={() => setSelectedPace('standard')}
                className={`py-1.5 text-center text-xs rounded transition-colors ${
                  selectedPace === 'standard'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setSelectedPace('intense')}
                className={`py-1.5 text-center text-xs rounded transition-colors ${
                  selectedPace === 'intense'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Intense
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">
              3. Current Semester
            </label>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white">
              Semester {profile.currentSemester || 6} of 8
            </div>
          </div>
        </div>

        {/* Draft Assumptions Disclosure Banner */}
        {planResult?.draftAssumptionsInUse && (
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-3">
            <span className="text-amber-400 text-base leading-none">⚠️</span>
            <div className="text-xs space-y-1">
              <div className="font-semibold text-amber-300">Draft Assumptions In Use</div>
              <p className="text-zinc-400">
                Task timelines are editorial draft estimates. No calendar dates are promised; ranges are relative weeks. Click the Assumptions Panel to inspect rationale.
              </p>
            </div>
          </div>
        )}

        {/* Readiness Diagnostic Banner */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-mono text-zinc-400 uppercase">Local Diagnostic Status</div>
            <div className="text-sm text-white font-medium">
              {readinessSummary.hasDiagnostic
                ? `Diagnostic Active: ${readinessSummary.talentLens?.archetype || 'TalentLens Record Found'}`
                : 'No diagnostic trace found in local storage.'}
            </div>
            <p className="text-xs text-zinc-400">
              {readinessSummary.hasDiagnostic
                ? 'Readiness gap recommendations automatically integrated below.'
                : 'Scan your resume in Roaster to unlock personalized readiness tasks.'}
            </p>
          </div>
          <Link
            to={readinessSummary.callToActionUrl}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-volt text-xs font-mono transition-colors shrink-0"
          >
            {readinessSummary.callToAction} →
          </Link>
        </div>

        {/* Total Timeline Overview */}
        {planResult && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Total Program Prep Window</span>
            <span className="text-volt font-bold text-sm">
              {planResult.totalWeeksRange.min} – {planResult.totalWeeksRange.max} Weeks (Likely: {planResult.totalWeeksRange.likely} wks)
            </span>
          </div>
        )}

        {/* 3 Ordered Roadmaps */}
        <div className="space-y-6">
          {/* Phase 1: Eligibility Blockers */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs font-mono">
                1
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Phase 1: Eligibility Blockers
              </h2>
            </div>

            {phaseOneTasks.length > 0 ? (
              <div className="space-y-2">
                {phaseOneTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      completedTaskIds[t.id]
                        ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!completedTaskIds[t.id]}
                        onChange={() => {}}
                        className="mt-0.5 accent-emerald-500"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-medium ${
                              completedTaskIds[t.id] ? 'line-through text-zinc-500' : 'text-white'
                            }`}
                          >
                            {t.title}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            W{t.effortMinWeeks}–W{t.effortMaxWeeks}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{t.actionRequired}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/80 text-xs text-emerald-400">
                ✓ No active eligibility blockers identified for {targetProgram?.facts.officialName}.
              </div>
            )}
          </section>

          {/* Phase 2: Readiness Gaps */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-mono">
                2
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Phase 2: Technical Readiness Gaps
              </h2>
            </div>

            {phaseTwoTasks.length > 0 ? (
              <div className="space-y-2">
                {phaseTwoTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      completedTaskIds[t.id]
                        ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={!!completedTaskIds[t.id]}
                        onChange={() => {}}
                        className="mt-0.5 accent-emerald-500"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-medium ${
                              completedTaskIds[t.id] ? 'line-through text-zinc-500' : 'text-white'
                            }`}
                          >
                            {t.title}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            W{t.effortMinWeeks}–W{t.effortMaxWeeks}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{t.actionRequired}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/80 text-xs text-zinc-400">
                Scan your resume in Roaster to uncover customized technical readiness gaps.
              </div>
            )}
          </section>

          {/* Phase 3: Process Prep */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <span className="w-5 h-5 rounded-full bg-volt/20 text-volt flex items-center justify-center text-xs font-mono">
                3
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Phase 3: Selection Process Preparation
              </h2>
            </div>

            <div className="space-y-2">
              {phaseThreeTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    completedTaskIds[t.id]
                      ? 'bg-zinc-950/40 border-zinc-800/50 opacity-60'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!completedTaskIds[t.id]}
                      onChange={() => {}}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${
                            completedTaskIds[t.id] ? 'line-through text-zinc-500' : 'text-white'
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          W{t.effortMinWeeks}–W{t.effortMaxWeeks}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{t.actionRequired}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Assumptions Modal */}
      {showAssumptionsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-xl w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Editorial Assumptions Register
              </h3>
              <button
                onClick={() => setShowAssumptionsModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {Object.values(EDITORIAL_ASSUMPTIONS).map((assump) => (
                <div key={assump.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-volt font-semibold">{assump.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {assump.status}
                    </span>
                  </div>
                  <p className="text-zinc-300">{assump.rationale}</p>
                  <div className="text-[11px] text-zinc-500">
                    Reviewer Category: {assump.reviewerCategory || 'Unassigned'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <NonAffiliationFooter />
    </div>
  );
};
