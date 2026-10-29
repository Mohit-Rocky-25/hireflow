// ============================================================
// HireFlow — Job Role Skill Blueprint & Project Brief Bridge
// Dynamic gap-to-project recommendation section displayed on
// ATS Resume Roaster and TalentLens scan results.
// Pinpoints left-out skills and recommends production project briefs.
// ============================================================

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Hammer,
  ShieldCheck,
  Eye,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  matchJobRoleToProjects,
  JobRoleSkillItem,
  JobRoleProjectMatchResult,
  MatchedBriefRecommendation,
} from '../engine/jobRoleProjectMatcher';
import { ProjectBrief } from '../bundleBriefs';
import { domainColor, DIFFICULTY_BADGE } from './briefHelpers';
import { BriefDetailModal } from './BriefDetailModal';

export interface JobRoleProjectBridgeProps {
  skills: JobRoleSkillItem[];
  roleTitle?: string;
  className?: string;
}

export function JobRoleProjectBridge({
  skills,
  roleTitle = 'Target Role',
  className = '',
}: JobRoleProjectBridgeProps) {
  const [activeModalBrief, setActiveModalBrief] = useState<ProjectBrief | null>(null);
  const [savedBriefIds, setSavedBriefIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hireflow_saved_briefs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleSave = (id: string) => {
    const next = savedBriefIds.includes(id)
      ? savedBriefIds.filter((x) => x !== id)
      : [...savedBriefIds, id];
    setSavedBriefIds(next);
    try {
      localStorage.setItem('hireflow_saved_briefs', JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const matchResult: JobRoleProjectMatchResult = useMemo(() => {
    return matchJobRoleToProjects({
      skills,
      roleTitle,
      maxRecommendations: 4,
    });
  }, [skills, roleTitle]);

  if (matchResult.totalRequired === 0) {
    return null;
  }

  return (
    <section className={`bg-near-black border border-charcoal rounded-xl p-5 sm:p-7 shadow-level-2 animate-fade-in ${className}`}>
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-charcoal">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black border border-volt/40 text-[11px] font-mono font-bold uppercase tracking-wider text-volt">
            <Sparkles className="w-3.5 h-3.5 text-volt" />
            <span>Target Role Skill Blueprint · Gap-To-Project Bridge</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Required Skills &amp; Recommended Project Briefs
          </h2>
          <p className="text-xs sm:text-sm text-silver max-w-2xl leading-relaxed">
            Skills extracted from your target job description matched against your resume evidence. Left-out skills are dynamically linked to production-grade project briefs engineered to fill holes and ace technical interviews.
          </p>
        </div>

        {/* Telemetry Summary Counters */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 bg-black border border-charcoal rounded-lg text-center min-w-[76px]">
            <span className="block text-lg font-bold font-mono text-white leading-tight">
              {matchResult.totalRequired}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-silver">
              Required
            </span>
          </div>

          <div className="px-3 py-2 bg-black border border-volt/40 rounded-lg text-center min-w-[76px]">
            <span className="block text-lg font-bold font-mono text-volt leading-tight">
              {matchResult.verifiedCount}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-silver">
              Verified
            </span>
          </div>

          <div className="px-3 py-2 bg-black border border-danger/40 rounded-lg text-center min-w-[76px]">
            <span className="block text-lg font-bold font-mono text-danger leading-tight">
              {matchResult.gapCount}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-silver">
              Holes to Fill
            </span>
          </div>
        </div>
      </div>

      {/* ── Subsection 1: Skills Required For Target Role ── */}
      <div className="py-6 border-b border-charcoal space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-volt" />
            <span>Role Skills Status ({matchResult.roleTitle})</span>
          </h3>
          <span className="text-xs text-silver font-mono">
            Green = Verified on Resume · Red/Amber = Missing Gap Holes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Verified Skills */}
          <div className="bg-black/80 rounded-lg border border-charcoal p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-volt font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-volt" /> Verified Evidence ({matchResult.verifiedCount})
              </span>
              <span className="text-silver/60">Sufficient Resume Proof</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matchResult.verifiedSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded bg-[#141414] border border-volt/30 text-volt text-xs font-mono inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-volt" />
                  <span>{skill}</span>
                </span>
              ))}
              {matchResult.verifiedSkills.length === 0 && (
                <p className="text-xs text-silver/60 italic py-1">
                  No verified skills detected for this role requirements list.
                </p>
              )}
            </div>
          </div>

          {/* Missing / Gap Skills */}
          <div className="bg-black/80 rounded-lg border border-charcoal p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-danger font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-danger" /> Left-Out Skill Holes ({matchResult.gapCount})
              </span>
              <span className="text-silver/60">Candidate Missing Proof</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matchResult.gapSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded bg-[#141414] border border-danger/40 text-danger text-xs font-mono inline-flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3 text-danger" />
                  <span>{skill}</span>
                </span>
              ))}
              {matchResult.gapSkills.length === 0 && (
                <p className="text-xs text-volt font-mono py-1">
                  ✓ Outstanding! 100% of required role skills have verified resume evidence.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Subsection 2: Recommended Project Briefs to Close Skill Holes ── */}
      <div className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
              <Hammer className="w-4 h-4 text-volt" />
              <span>Recommended Project Briefs To Fill Skill Holes</span>
            </h3>
            <p className="text-xs text-silver mt-0.5">
              Production architectures from our 158-brief catalog, complete with verified scale targets and interview talking points.
            </p>
          </div>
          <Link
            to="/tools/build-briefs"
            className="text-xs font-mono text-volt hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Browse Full 158 Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchResult.recommendations.map((rec) => {
            const { brief, matchedGapSkills, reinforcedSkills, hoursRange, interviewProofPoint } = rec;
            const dc = domainColor(brief.domain);
            const diffClass = DIFFICULTY_BADGE[brief.difficulty] ?? DIFFICULTY_BADGE.intermediate;

            return (
              <div
                key={brief.id}
                className="shiny-edge-card bg-black border border-charcoal rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-volt/60 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono">
                    <span className={`px-2 py-0.5 rounded border ${dc.border} ${dc.text} ${dc.bg} font-semibold uppercase tracking-wider`}>
                      {brief.domain}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded border uppercase font-bold text-[10px] ${diffClass}`}>
                        {brief.difficulty}
                      </span>
                      <span className="text-silver/80 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-silver" />
                        <span>{hoursRange.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Problem */}
                  <div>
                    <h4 className="text-base font-bold text-white hover:text-volt transition-colors leading-snug">
                      {brief.title}
                    </h4>
                    <p className="text-xs text-silver/80 mt-1.5 line-clamp-2 leading-relaxed">
                      {brief.problemStatement}
                    </p>
                  </div>

                  {/* Targeted Gaps Filled (Pills) */}
                  {matchedGapSkills.length > 0 && (
                    <div className="p-2.5 rounded bg-near-black border border-volt/30 space-y-1.5">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-volt flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-volt" />
                        <span>Closes Your Left-Out Skill Holes:</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {matchedGapSkills.map((gap) => (
                          <span
                            key={gap}
                            className="px-2 py-0.5 rounded bg-black border border-volt/50 text-white text-[11px] font-mono font-semibold"
                          >
                            +{gap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview Talking Point */}
                  <div className="p-2.5 rounded bg-near-black/60 border border-charcoal text-xs space-y-1">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-silver flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-volt" />
                      <span>Interview Proof Point / Recruiter Signal:</span>
                    </p>
                    <p className="text-silver/90 italic text-[11px] leading-relaxed line-clamp-2">
                      "{interviewProofPoint}"
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-charcoal/60 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalBrief(brief)}
                    className="px-3 py-1.5 rounded bg-[#141414] hover:bg-near-black border border-charcoal hover:border-silver text-xs font-mono font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-volt" />
                    <span>Preview Architecture</span>
                  </button>

                  <Link
                    to={`/tools/build-briefs?query=${encodeURIComponent(brief.title)}`}
                    className="px-3 py-1.5 rounded bg-volt text-black hover:bg-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Build Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modal Preview ── */}
      {activeModalBrief && (
        <BriefDetailModal
          brief={activeModalBrief}
          onClose={() => setActiveModalBrief(null)}
          isSaved={savedBriefIds.includes(activeModalBrief.id)}
          onToggleSave={handleToggleSave}
        />
      )}
    </section>
  );
}

