import React, { useState } from 'react';
import { SkillMatchResult } from '../../lib/ats/types';
import { Search, Filter, CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

interface Props {
  skillMatches: SkillMatchResult[];
}

export const SkillMatrixTable: React.FC<Props> = ({ skillMatches }) => {
  const [filter, setFilter] = useState<'all' | 'must_have' | 'wording_fix' | 'learn_needed' | 'matched'>('all');
  const [search, setSearch] = useState('');

  const mustHavesMissingCount = skillMatches.filter(
    (s) => s.importance === 'must_have' && s.status === 'missing'
  ).length;

  const wordingFixCount = skillMatches.filter((s) => s.gapType === 'wording_fix').length;
  const learnNeededCount = skillMatches.filter((s) => s.gapType === 'learn_needed').length;
  const matchedCount = skillMatches.filter((s) => s.gapType === 'matched').length;

  const filteredSkills = skillMatches.filter((s) => {
    if (search && !s.skill.toLowerCase().includes(search.toLowerCase()) && !s.category.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filter === 'must_have') {
      return s.importance === 'must_have' && s.status === 'missing';
    }
    if (filter === 'wording_fix') {
      return s.gapType === 'wording_fix';
    }
    if (filter === 'learn_needed') {
      return s.gapType === 'learn_needed';
    }
    if (filter === 'matched') {
      return s.gapType === 'matched';
    }
    return true;
  });

  const getStatusBadge = (s: SkillMatchResult) => {
    if (s.status === 'exact') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-success-bg text-success border border-success/20">
          <CheckCircle2 className="w-3 h-3" /> Exact Match
        </span>
      );
    }
    if (s.status === 'alias' || s.status === 'implied') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-primary-light text-primary border border-primary/20">
          <CheckCircle2 className="w-3 h-3" /> {s.status === 'alias' ? 'Alias Match' : 'Implied Match'}
        </span>
      );
    }
    if (s.gapType === 'wording_fix') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-warning-bg text-warning border border-warning/20">
          <AlertCircle className="w-3 h-3" /> Wording Fix
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-danger-bg text-danger border border-danger/20">
        <XCircle className="w-3 h-3" /> Missing
      </span>
    );
  };

  return (
    <div className="bg-surface rounded-card p-6 border border-border shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-text tracking-tight">Keyword & Skill Gap Matrix</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Classified by severity: wording fixes vs. real architectural learning requirements.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-surface-2 border border-border rounded-lg text-xs text-text focus:ring-1 focus:ring-primary outline-none w-48"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-border pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-text text-surface font-black'
              : 'bg-surface-2 text-text-secondary hover:text-text'
          }`}
        >
          All ({skillMatches.length})
        </button>
        <button
          onClick={() => setFilter('must_have')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
            filter === 'must_have'
              ? 'bg-danger text-white'
              : 'bg-danger-bg text-danger hover:bg-danger/20'
          }`}
        >
          Missing Must-Haves ({mustHavesMissingCount})
        </button>
        <button
          onClick={() => setFilter('wording_fix')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
            filter === 'wording_fix'
              ? 'bg-warning text-white'
              : 'bg-warning-bg text-warning hover:bg-warning/20'
          }`}
        >
          Wording Fixes ({wordingFixCount})
        </button>
        <button
          onClick={() => setFilter('learn_needed')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
            filter === 'learn_needed'
              ? 'bg-ai text-white'
              : 'bg-ai-light text-ai hover:bg-ai/20'
          }`}
        >
          Learn Needed ({learnNeededCount})
        </button>
        <button
          onClick={() => setFilter('matched')}
          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
            filter === 'matched'
              ? 'bg-success text-white'
              : 'bg-success-bg text-success hover:bg-success/20'
          }`}
        >
          Matched ({matchedCount})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Skill / Technology</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Importance</th>
              <th className="py-2.5 px-3">Match Status</th>
              <th className="py-2.5 px-3">Actionable Diagnosis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredSkills.map((s) => (
              <tr key={s.skill} className="hover:bg-surface-2/60 transition-colors">
                <td className="py-2.5 px-3 font-bold text-text flex items-center gap-2">
                  <span>{s.skill}</span>
                  {s.matchedAs && s.matchedAs !== s.skill && (
                    <span className="text-[10px] text-text-muted font-normal">
                      (via "{s.matchedAs}")
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-text-secondary capitalize">
                  <span className="px-2 py-0.5 bg-surface-2 rounded text-[10px] font-mono">
                    {s.category.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  {s.importance === 'must_have' ? (
                    <span className="px-2 py-0.5 bg-danger-bg text-danger font-bold text-[10px] rounded uppercase tracking-wider border border-danger/20">
                      Must Have
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-surface-2 text-text-muted font-semibold text-[10px] rounded">
                      Nice to Have
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3">{getStatusBadge(s)}</td>
                <td className="py-2.5 px-3 text-text-secondary">
                  {s.gapType === 'matched' ? (
                    <span className="text-text-muted italic">Found in resume text</span>
                  ) : s.gapType === 'wording_fix' ? (
                    <span className="text-warning font-medium">
                      {s.evidenceSnippet
                        ? `Related signal detected: "${s.evidenceSnippet}". Rename or add "${s.skill}".`
                        : `Mention "${s.skill}" explicitly in experience bullets.`}
                    </span>
                  ) : (
                    <span className="text-danger font-medium">
                      Missing entirely. Build a demo project or take a targeted course.
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filteredSkills.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-text-muted italic">
                  No skills matching current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
