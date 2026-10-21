import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { HeadToHeadComparison } from '../compareJDs';

export function HeadToHeadView({ h2h }: { h2h: HeadToHeadComparison }) {
  const isTie = h2h.winnerId === 'tie';
  const leadPercent = h2h.scoreDelta;
  const { jdA, jdB } = h2h;
  const { roleAExclusive, roleBExclusive } = h2h.divergence;
  const commonCore = h2h.commonCoreSkills;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Executive Verdict Hero Banner */}
      <div className="bg-surface border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" /> Strategic Application Verdict
            </div>
            {!isTie && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                +{leadPercent}% Readiness Advantage
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
              {h2h.executiveRecommendation}
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed mt-2 max-w-3xl">
              {h2h.strategicRationale}
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Synchronized Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* ROLE A CARD */}
        <div className="bg-surface border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="space-y-1">
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ROLE A
                </span>
                <h3 className="text-xl font-black text-text mt-1">{jdA.company || jdA.label}</h3>
                <p className="text-xs text-text-secondary font-medium">{jdA.roleTitle || jdA.label}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  {jdA.score}%
                </div>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  Fit Score
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                  Must-Haves
                </span>
                <span className="text-base font-black font-mono text-text">
                  {Math.round(jdA.mustHaveCoverage * 100)}%
                </span>
                <span className="block text-[10px] text-text-tertiary mt-0.5">
                  {jdA.mustHaveMet}/{jdA.mustHaveTotal} met
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                  Match Confidence
                </span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {jdA.mustHaveCoverage >= 0.75 ? 'High' : jdA.mustHaveCoverage >= 0.45 ? 'Medium' : 'Low'}
                </span>
                <span className="block text-[10px] text-text-tertiary mt-0.5">
                  Evidence-backed
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                  Readiness
                </span>
                <span className="text-xs font-bold text-text line-clamp-1">
                  {jdA.readinessAssessment}
                </span>
                <span className="block text-[10px] text-text-tertiary mt-0.5">
                  ATS Status
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Experience Level:</span>
                <strong className="text-text">{jdA.experienceLevel || '2–4 Years'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Location / CTC:</span>
                <strong className="text-text">{jdA.location || 'Bangalore / Market'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Verdict Analysis:</span>
                <strong className="text-emerald-400">{jdA.verdict}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Key Requirements Match ({jdA.matchedSkills.length} Matched / {jdA.missingMustHaves.length + jdA.missingPreferred.length} Missing)
              </span>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Qualifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {jdA.matchedSkills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {jdA.matchedSkills.length === 0 && (
                    <span className="text-xs text-text-muted">No exact skill matches</span>
                  )}
                </div>
              </div>

              {jdA.missingMustHaves.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> High-Risk Gaps (Must-Haves)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdA.missingMustHaves.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jdA.missingPreferred.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Secondary / Preferred Additions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdA.missingPreferred.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/80 flex items-center justify-between">
            <span className="text-xs text-text-muted">Need custom tuning?</span>
            <Link
              to="/tools/tailor"
              className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1 transition-colors"
            >
              Tailor for Role A <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>
        </div>

        {/* ROLE B CARD */}
        <div className="bg-surface border border-indigo-500/30 rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="space-y-1">
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  ROLE B
                </span>
                <h3 className="text-xl font-black text-text mt-1">{jdB.company || jdB.label}</h3>
                <p className="text-xs text-text-secondary font-medium">{jdB.roleTitle || jdB.label}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-400">
                  {jdB.score}%
                </div>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  Fit Score
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                  Must-Haves
                </span>
                <span className="text-base font-black font-mono text-text">
                  {Math.round(jdB.mustHaveCoverage * 100)}%
                </span>
                <span className="block text-[10px] text-text-tertiary mt-0.5">
                  {jdB.mustHaveMet}/{jdB.mustHaveTotal} met
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                  Match Confidence
                </span>
                <span className="text-base font-black font-mono text-indigo-400">
                  {jdB.mustHaveCoverage >= 0.75 ? 'High' : jdB.mustHaveCoverage >= 0.45 ? 'Medium' : 'Low'}
                </span>
                <span className="block text-[10px] text-text-tertiary mt-0.5">
                  Evidence-backed
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-surface-2 border border-border/80">
                <span className="block text-[10px] text-text-muted font-bold uppercase mb-1">
                  Readiness
                </span>
                <span className="text-xs font-bold text-text line-clamp-1">
                  {jdB.readinessAssessment}
                </span>
                <span className="block text-[10px] text-text-tertiary mt-0.5">
                  ATS Status
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Experience Level:</span>
                <strong className="text-text">{jdB.experienceLevel || '2–4 Years'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Location / CTC:</span>
                <strong className="text-text">{jdB.location || 'Bangalore / Market'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Verdict Analysis:</span>
                <strong className="text-indigo-400">{jdB.verdict}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Key Requirements Match ({jdB.matchedSkills.length} Matched / {jdB.missingMustHaves.length + jdB.missingPreferred.length} Missing)
              </span>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Qualifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {jdB.matchedSkills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {jdB.matchedSkills.length === 0 && (
                    <span className="text-xs text-text-muted">No exact skill matches</span>
                  )}
                </div>
              </div>

              {jdB.missingMustHaves.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> High-Risk Gaps (Must-Haves)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdB.missingMustHaves.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jdB.missingPreferred.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Secondary / Preferred Additions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jdB.missingPreferred.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border/80 flex items-center justify-between">
            <span className="text-xs text-text-muted">Need custom tuning?</span>
            <Link
              to="/tools/tailor"
              className="px-3.5 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1 transition-colors"
            >
              Tailor for Role B <ArrowRight className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>
        </div>
      </div>

      {/* Divergence & Common Ground Breakdown */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/80">
          <div>
            <h3 className="text-lg font-bold text-text">Architectural Divergence Analysis</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Understand exactly where these roles branch apart versus where they share common engineering ground.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-text-muted">
            {commonCore.length} Shared / {roleAExclusive.length + roleBExclusive.length} Unique
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Role A Exclusive */}
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-emerald-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">
                Exclusive to {h2h.jdA.company || 'Role A'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                {roleAExclusive.length}
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              Technologies and patterns evaluated only by {h2h.jdA.label}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {roleAExclusive.map((skill) => (
                <span
                  key={skill.skillId}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                    skill.found
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-surface-3 text-text-muted border-border/60'
                  }`}
                >
                  {skill.name} {skill.found ? '✓' : ''}
                </span>
              ))}
              {roleAExclusive.length === 0 && (
                <span className="text-xs text-text-muted">No unique skills</span>
              )}
            </div>
          </div>

          {/* Common Core */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">
                Common Core Ground
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                {commonCore.length}
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              Shared requirements — strengthening these benefits both applications simultaneously:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {commonCore.map((skill) => {
                const isBothMatched = skill.statusA === 'matched' && skill.statusB === 'matched';
                const isBothMissing = skill.statusA === 'missing' && skill.statusB === 'missing';

                return (
                  <span
                    key={skill.skillId}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                      isBothMatched
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : isBothMissing
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 font-bold'
                        : 'bg-surface-3 text-text-secondary border-border/60'
                    }`}
                  >
                    {skill.name} {isBothMatched ? '✓' : isBothMissing ? '✗' : '~'}
                  </span>
                );
              })}
              {commonCore.length === 0 && (
                <span className="text-xs text-text-muted">No shared skills</span>
              )}
            </div>
          </div>

          {/* Role B Exclusive */}
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-indigo-500/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">
                Exclusive to {h2h.jdB.company || 'Role B'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                {roleBExclusive.length}
              </span>
            </div>
            <p className="text-[11px] text-text-muted">
              Technologies and patterns evaluated only by {h2h.jdB.label}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {roleBExclusive.map((skill) => (
                <span
                  key={skill.skillId}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                    skill.found
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      : 'bg-surface-3 text-text-muted border-border/60'
                  }`}
                >
                  {skill.name} {skill.found ? '✓' : ''}
                </span>
              ))}
              {roleBExclusive.length === 0 && (
                <span className="text-xs text-text-muted">No unique skills</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic 3-Step Bridge Plan */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div>
            <h3 className="text-lg font-bold text-text">Strategic Dual-Role Bridge Plan</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Execute these sequenced steps to systematically strengthen qualifications for both companies.
            </p>
          </div>
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> High-ROI Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {h2h.bridgePlan.map((step) => (
            <div
              key={step.stepNumber}
              className="p-5 rounded-2xl bg-surface-2 border border-border/80 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-black font-mono flex items-center justify-center">
                    #{step.stepNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      step.targetRole === 'Both'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : step.targetRole === 'Role A'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    Targets: {step.targetRole}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-text">{step.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{step.action}</p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold">{step.impact}</span>
                <span className="text-text-muted text-[11px] font-mono">~{step.estimatedHours}h effort</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Link
            to="/tools/tailor"
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5"
          >
            Launch Resume Tailor <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/tools/build-briefs"
            className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text inline-flex items-center gap-1.5 transition-colors"
          >
            Generate Project Briefs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
