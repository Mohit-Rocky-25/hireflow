// ============================================================
// ATS Resume Roaster — Skills Tab Component (Stage 4)
// Grounded skills inventory, filters, 0-5 proficiency dots, verified quotes
// ============================================================

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Quote,
} from 'lucide-react';
import { SkillResult } from '../engine/types';

interface Props {
  skills: SkillResult[];
}

type FilterType = 'all' | 'missing' | 'must' | 'weak';

export const SkillsTab: React.FC<Props> = ({ skills }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const matchedCount = skills.filter(s => s.found).length;
  const missingCount = skills.filter(s => s.status === 'missing').length;
  const verifiedCount = skills.filter(s => s.status === 'verified').length;
  const weakCount = skills.filter(s => s.status === 'weak').length;

  const filteredSkills = skills.filter(s => {
    if (filter === 'missing') return s.status === 'missing';
    if (filter === 'must') return s.required === 'must';
    if (filter === 'weak') return s.status === 'weak';
    return true;
  });

  const toggleExpand = (skillId: string) => {
    setExpandedSkillId(prev => (prev === skillId ? null : skillId));
  };

  const renderProficiencyDots = (proficiency: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(dot => (
          <div
            key={dot}
            className={`w-2.5 h-2.5 rounded-full ${
              dot <= proficiency
                ? proficiency >= 4
                  ? 'bg-emerald-600'
                  : proficiency >= 2
                  ? 'bg-sky-600'
                  : 'bg-amber-500'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface rounded-[16px] p-5 border border-border shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Requirements</div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">{skills.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total job skills</div>
        </div>

        <div className="bg-surface rounded-[16px] p-5 border border-border shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase">Verified Evidence</div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-1">{verifiedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Backed by bullets</div>
        </div>

        <div className="bg-surface rounded-[16px] p-5 border border-border shadow-xs">
          <div className="text-xs font-bold text-amber-700 uppercase">Weak Evidence</div>
          <div className="text-2xl font-black font-mono text-amber-700 mt-1">{weakCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Skills list only</div>
        </div>

        <div className="bg-surface rounded-[16px] p-5 border border-border shadow-xs">
          <div className="text-xs font-bold text-rose-700 uppercase">Missing Skills</div>
          <div className="text-2xl font-black font-mono text-rose-700 mt-1">{missingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Not detected in text</div>
        </div>
      </div>

      {/* 2. Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: 'all', label: `All Skills (${skills.length})` },
            { id: 'must', label: `Must-Have Only (${skills.filter(s => s.required === 'must').length})` },
            { id: 'missing', label: `Missing (${missingCount})` },
            { id: 'weak', label: `Weak Evidence (${weakCount})` },
          ] as const
        ).map(chip => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={`px-3.5 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${
              filter === chip.id
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 3. Skills Table Panel */}
      <div className="bg-surface rounded-[16px] border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-6">Skill</th>
                <th className="py-3.5 px-4">Importance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Proficiency</th>
                <th className="py-3.5 px-6">Verbatim Resume Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[15px]">
              {filteredSkills.map(skill => {
                const isExpanded = expandedSkillId === skill.skillId;
                const primaryEvidence = skill.evidence[0];
                return (
                  <tr key={skill.skillId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Skill Name & Category */}
                    <td className="py-4 px-6 font-semibold text-slate-900 align-top">
                      <div>{skill.canonical}</div>
                      <span className="text-xs text-slate-500 font-normal capitalize">
                        {skill.category.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Importance */}
                    <td className="py-4 px-4 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                          skill.required === 'must'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {skill.required === 'must' ? 'Must-Have' : 'Nice-to-Have'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 align-top">
                      {(() => {
                        const evStatus = (skill as any).evidenceStatus || 
                          (skill.status === 'verified' ? (skill.evidence && skill.evidence.some(e => e.hasMetric) ? 'proven' : 'strongly_supported')
                            : skill.status === 'weak' ? 'claimed_only'
                            : (skill as any).isSubstituteMatch ? 'related'
                            : 'missing');

                        switch (evStatus) {
                          case 'proven':
                            return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Proven</span>;
                          case 'strongly_supported':
                            return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strongly Supported</span>;
                          case 'partially_supported':
                            return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Partially Supported</span>;
                          case 'claimed_only':
                            return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300"><HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Claimed Only</span>;
                          case 'inferred':
                            return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"><Layers className="w-3.5 h-3.5 text-indigo-600" /> Inferred</span>;
                          case 'related':
                            return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">↔ Related</span>;
                          case 'missing':
                          default:
                            return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300"><AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Missing</span>;
                        }
                      })()}
                    </td>

                    {/* Proficiency Dots */}
                    <td className="py-4 px-4 align-top">
                      {renderProficiencyDots(skill.proficiency)}
                      <span className="text-[11px] text-slate-500 font-mono block mt-1">
                        {skill.proficiency}/5
                      </span>
                    </td>

                    {/* Verbatim Evidence Quote */}
                    <td className="py-4 px-6 align-top">
                      {skill.evidence.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">
                          No text evidence found in resume
                        </span>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-[8px] border border-slate-200 leading-relaxed font-mono shadow-2xs">
                            <span className="text-primary font-sans font-bold mr-1.5">
                              [{primaryEvidence.section}]:
                            </span>
                            "{isExpanded || primaryEvidence.quote.length <= 110
                              ? primaryEvidence.quote
                              : `${primaryEvidence.quote.slice(0, 110)}...`}"
                          </div>

                          {primaryEvidence.quote.length > 110 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(skill.skillId)}
                              className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" /> Collapse quote
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" /> Read full quote
                                </>
                              )}
                            </button>
                          )}

                          {skill.evidence.length > 1 && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              +{skill.evidence.length - 1} additional citation(s) in resume
                            </div>
                          )}
                        </div>
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
