import React, { useState, useMemo } from 'react';
import { Filter, Check, X, AlertCircle } from 'lucide-react';
import { AnalysisResponse, SkillMatchResult } from '../../lib/ats/types';

interface Props {
  data: AnalysisResponse;
}

type FilterOption = 'all' | 'missing' | 'must' | 'wording';

export const SkillsTab: React.FC<Props> = ({ data }) => {
  const { facts, passB } = data;
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortByWeight, setSortByWeight] = useState(true);

  // Map judgments from passB if present
  const judgmentsMap = useMemo(() => {
    const map = new Map<string, any>();
    if (passB?.judgments) {
      for (const j of passB.judgments) {
        map.set(j.requirementId, j);
      }
    }
    return map;
  }, [passB]);

  // Filtered & sorted skill rows
  const filteredSkills = useMemo(() => {
    let list = [...facts.skillMatches];

    if (filter === 'missing') {
      list = list.filter((s) => s.status === 'missing' || s.status === 'related');
    } else if (filter === 'must') {
      list = list.filter((s) => s.importance === 'must_have');
    } else if (filter === 'wording') {
      list = list.filter((s) => s.gapType === 'wording_fix');
    }

    if (sortByWeight) {
      list.sort((a, b) => b.weight - a.weight);
    }

    return list;
  }, [facts.skillMatches, filter, sortByWeight]);

  // Level computation (0-5)
  const getLevel = (skill: SkillMatchResult, index: number) => {
    const j = judgmentsMap.get(`req-${index + 1}`);
    if (j) return j.proficiencyLevel;

    if (skill.status === 'exact' || skill.status === 'alias') {
      return skill.isClaimedOnly ? 1 : 3;
    }
    if (skill.status === 'implied') return 3;
    if (skill.status === 'related') return 2;
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Compact Keyword Summary Chips (Missing / Matched) */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matched Keywords */}
          <div>
            <div className="text-xs font-semibold text-text uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-3.5 h-3.5" /> Matched Keywords ({facts.matchedKeywords.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {facts.matchedKeywords.length > 0 ? (
                facts.matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-tertiary italic">No direct keyword matches found.</span>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          <div>
            <div className="text-xs font-semibold text-text uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-700">
                <X className="w-3.5 h-3.5" /> Missing Keywords ({facts.missingKeywords.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {facts.missingKeywords.length > 0 ? (
                facts.missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-xs text-emerald-700">All target keywords matched!</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Requirement Table Container */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Table Controls / Filters */}
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-text-tertiary mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {(
              [
                { id: 'all', label: `All (${facts.skillMatches.length})` },
                { id: 'missing', label: `Missing (${facts.missingKeywords.length})` },
                { id: 'must', label: `Must-Have Only` },
                { id: 'wording', label: `Wording Fixes (${facts.wordingFixSkills.length})` },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  filter === btn.id
                    ? 'bg-primary text-white'
                    : 'bg-surface-hover text-text-secondary hover:text-text border border-border'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSortByWeight((prev) => !prev)}
            className="text-xs text-text-secondary hover:text-text font-medium flex items-center gap-1 cursor-pointer"
          >
            Sort: <span className="font-semibold">{sortByWeight ? 'Weight (High to Low)' : 'Standard'}</span>
          </button>
        </div>

        {/* The One Skills Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover border-b border-border text-text-tertiary uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">Requirement</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Proficiency (0-5)</th>
                <th className="py-2.5 px-4">Evidence Quote</th>
                <th className="py-2.5 px-3.5">Fix Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text">
              {filteredSkills.map((skill, idx) => {
                const level = getLevel(skill, idx);
                const isMust = skill.importance === 'must_have';

                // Status chip styling
                const statusLabel =
                  skill.status === 'exact'
                    ? 'Exact'
                    : skill.status === 'alias'
                    ? 'Alias'
                    : skill.status === 'implied'
                    ? 'Implied'
                    : skill.status === 'related'
                    ? 'Partial'
                    : 'Missing';

                const statusBg =
                  skill.status === 'exact' || skill.status === 'alias' || skill.status === 'implied'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : skill.status === 'related'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200';

                return (
                  <tr key={idx} className="hover:bg-surface-hover/50 transition-colors">
                    {/* Requirement */}
                    <td className="py-3 px-3.5 font-medium text-text">
                      <div className="font-semibold">{skill.skill}</div>
                      <div className="text-[10px] text-text-tertiary">Weight: {skill.weight}/5</div>
                    </td>

                    {/* Must / Nice */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          isMust
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isMust ? 'Must' : 'Nice'}
                      </span>
                    </td>

                    {/* Status Chip */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${statusBg}`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    {/* Level 0-5 Dots */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1" title={`Level ${level}/5`}>
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <span
                            key={dot}
                            className={`w-2 h-2 rounded-full ${
                              dot <= level ? 'bg-primary' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-[10px] text-text-tertiary font-mono">{level}</span>
                      </div>
                    </td>

                    {/* Evidence Quote */}
                    <td className="py-3 px-4 max-w-xs break-words">
                      {skill.evidenceSnippet ? (
                        <span className="text-[11px] text-text-secondary italic">
                          "{skill.evidenceSnippet.slice(0, 95)}..."
                        </span>
                      ) : (
                        <span className="text-[11px] text-text-tertiary italic">No verbatim citation found</span>
                      )}
                    </td>

                    {/* Fix Type */}
                    <td className="py-3 px-3.5">
                      {skill.status === 'missing' || skill.status === 'related' ? (
                        <div>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              skill.gapType === 'wording_fix'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {skill.gapType === 'wording_fix' ? 'Wording Fix (~1d)' : 'Learn Needed (~7d)'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Verified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
