// ============================================================
// Tailor UI — Strengthen This Resume Checklist Component
// Actionable improvements: missing contacts, hidden skills, metrics
// ============================================================

import React from 'react';
import { ResumeDocModel } from '../../../../lib/tailorEngine/docModel';
import { AlertCircle, CheckCircle2, Plus, Sparkles, TrendingUp, Link as LinkIcon } from 'lucide-react';

interface StrengthenChecklistProps {
  model: ResumeDocModel;
  onAddSkill?: (skill: string) => void;
}

export const StrengthenChecklist: React.FC<StrengthenChecklistProps> = ({ model, onAddSkill }) => {
  // 1. Missing contact cues
  const hasLinkedIn = model.contact.links?.some((l) => l.toLowerCase().includes('linkedin')) || false;
  const hasGitHub = model.contact.links?.some((l) => l.toLowerCase().includes('github')) || false;
  const hasPortfolio = model.contact.links?.some((l) => !l.toLowerCase().includes('linkedin') && !l.toLowerCase().includes('github')) || false;

  // 2. Metrics quantification
  const allBullets = [
    ...model.experience.flatMap((e) => e.bullets),
    ...model.projects.flatMap((p) => p.bullets)
  ];
  const quantifiedBullets = allBullets.filter((b) => /\d+%|\b\d+\s*(?:users|clients|req|ms|x|gb|mb|k|students|members)\b|\b\d{2,}\b/i.test(b.text));
  const metricsRatio = allBullets.length > 0 ? Math.round((quantifiedBullets.length / allBullets.length) * 100) : 100;

  // 3. Hidden skills from projects not in technical skills section
  const hiddenSkills = model.hiddenSkills || [];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-zinc-100">Strengthen This Resume</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
          Professional Audit
        </span>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Hidden Skills Detection */}
        {hiddenSkills.length > 0 && (
          <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-900/40 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Skills found in projects not in your Skills section:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hiddenSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => onAddSkill && onAddSkill(skill)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 transition-colors cursor-pointer group"
                  title={`Add ${skill} to skills`}
                >
                  <Plus className="w-3 h-3 text-indigo-400 group-hover:scale-125 transition-transform" />
                  <span>{skill}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact Links Checklist */}
        <div className="space-y-2">
          <div className="text-zinc-400 font-medium flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>Online Presence & Links:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${hasGitHub ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'}`}>
              {hasGitHub ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              <span>GitHub {hasGitHub ? 'linked' : 'missing'}</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${hasLinkedIn ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'}`}>
              {hasLinkedIn ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              <span>LinkedIn {hasLinkedIn ? 'linked' : 'missing'}</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${hasPortfolio ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'}`}>
              {hasPortfolio ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />}
              <span>Portfolio {hasPortfolio ? 'linked' : 'optional'}</span>
            </div>
          </div>
        </div>

        {/* Quantified Metrics Checklist */}
        <div className="p-3 bg-zinc-850/50 rounded-lg border border-zinc-800 space-y-1.5">
          <div className="flex justify-between items-center text-zinc-300">
            <span>Quantified Impact Metrics</span>
            <span className={`font-semibold ${metricsRatio >= 40 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {quantifiedBullets.length} of {allBullets.length} bullets ({metricsRatio}%)
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {metricsRatio < 40
              ? 'Recruiters favor quantifiable achievements (e.g., "improved latency by 35%", "served 10k users"). Add numbers where accurate.'
              : 'Strong numerical evidence! Your bullets highlight measurable achievements.'}
          </p>
        </div>

        {/* Sparse Resume Layout Note */}
        {model.wordCount && model.wordCount < 250 && (
          <div className="p-2.5 bg-blue-950/20 border border-blue-900/30 rounded-lg text-blue-300 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Your resume is concise ({model.wordCount} words). The Fresher layout applies balanced spacing to fill the A4 page harmoniously without looking stretched.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
