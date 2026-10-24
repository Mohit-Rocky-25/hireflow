// ============================================================
// ATS Resume Roaster — Skills Tab Component (Stage 4)
// Grounded skills inventory, filters, proficiency dots, verified quotes
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  PenTool,
  FolderGit2,
  GraduationCap,
} from 'lucide-react';
import { SkillResult } from '../engine/types';

interface Props {
  skills: SkillResult[];
}

type FilterType = 'all' | 'missing' | 'must' | 'weak';

export const SkillsTab: React.FC<Props> = ({ skills }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

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
            className={`w-2 h-2 rounded-full ${
              dot <= proficiency
                ? proficiency >= 4
                  ? 'bg-volt'
                  : proficiency >= 2
                  ? 'bg-pale-yellow'
                  : 'bg-silver'
                : 'bg-charcoal-deep'
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
        <div className="bg-near-black rounded-lg p-5 border border-charcoal shadow-level-1">
          <div className="text-xs font-semibold text-silver uppercase tracking-[1.4px]">Requirements</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{skills.length}</div>
          <div className="text-[11px] text-silver mt-0.5">Total job skills</div>
        </div>

        <div className="bg-near-black rounded-lg p-5 border border-charcoal shadow-level-1">
          <div className="text-xs font-semibold text-volt uppercase tracking-[1.4px]">Evidence in Bullets</div>
          <div className="text-2xl font-bold font-mono text-volt mt-1">{verifiedCount}</div>
          <div className="text-[11px] text-silver mt-0.5">Verified in experience text</div>
        </div>

        <div className="bg-near-black rounded-lg p-5 border border-charcoal shadow-level-1">
          <div className="text-xs font-semibold text-pale-yellow uppercase tracking-[1.4px]">Skills List Only</div>
          <div className="text-2xl font-bold font-mono text-pale-yellow mt-1">{weakCount}</div>
          <div className="text-[11px] text-silver mt-0.5">Mentioned without context</div>
        </div>

        <div className="bg-near-black rounded-lg p-5 border border-charcoal shadow-level-1">
          <div className="text-xs font-semibold text-danger uppercase tracking-[1.4px]">Missing Skills</div>
          <div className="text-2xl font-bold font-mono text-danger mt-1">{missingCount}</div>
          <div className="text-[11px] text-silver mt-0.5">Not detected in resume</div>
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
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-[1.2px] transition-all cursor-pointer ${
              filter === chip.id
                ? 'bg-near-black text-volt border border-volt shadow-level-4 font-bold'
                : 'bg-black text-silver hover:text-white hover:bg-hover-gray border border-charcoal'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 3. Skills Table Panel */}
      <div className="bg-near-black rounded-lg border border-charcoal shadow-level-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-charcoal bg-black text-xs font-semibold text-silver uppercase tracking-[1.4px]">
                <th className="py-3.5 px-6">Skill</th>
                <th className="py-3.5 px-4">Importance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Proficiency</th>
                <th className="py-3.5 px-6">Verbatim Resume Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/80 text-[14px]">
              {filteredSkills.map(skill => {
                const isExpanded = expandedSkillId === skill.skillId;
                const primaryEvidence = skill.evidence[0];
                return (
                  <tr key={skill.skillId} className="hover:bg-hover-gray/20 transition-colors">
                    {/* Skill Name & Category */}
                    <td className="py-4 px-6 font-bold text-white align-top">
                      <div>{skill.canonical}</div>
                      <span className="text-xs text-silver font-normal capitalize">
                        {skill.category.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Importance */}
                    <td className="py-4 px-4 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-[1px] ${
                          skill.required === 'must'
                            ? 'bg-black text-volt border border-volt/60'
                            : 'bg-black text-silver border border-charcoal'
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
                            return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-black text-volt border border-volt/60 uppercase tracking-[1px]"><CheckCircle2 className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Demonstrated</span>;
                          case 'strongly_supported':
                            return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-black text-volt border border-volt/60 uppercase tracking-[1px]"><CheckCircle2 className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Supported</span>;
                          case 'partially_supported':
                            return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-black text-white border border-charcoal uppercase tracking-[1px]"><CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[1.5px]" /> Partial</span>;
                          case 'claimed_only':
                            return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-black text-pale-yellow border border-pale-yellow/60 uppercase tracking-[1px]"><HelpCircle className="w-3.5 h-3.5 text-pale-yellow stroke-[1.5px]" /> Claimed</span>;
                          case 'inferred':
                            return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-black text-white border border-charcoal uppercase tracking-[1px]"><Layers className="w-3.5 h-3.5 text-silver stroke-[1.5px]" /> Inferred</span>;
                          case 'related':
                            return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-black text-silver border border-charcoal uppercase tracking-[1px]">↔ Related</span>;
                          case 'missing':
                          default:
                            return <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-black text-danger border border-danger/60 uppercase tracking-[1px]"><AlertCircle className="w-3.5 h-3.5 text-danger stroke-[1.5px]" /> Missing</span>;
                        }
                      })()}
                    </td>

                    {/* Proficiency Dots */}
                    <td className="py-4 px-4 align-top">
                      {renderProficiencyDots(skill.proficiency)}
                      <span className="text-[11px] text-silver font-mono block mt-1">
                        {skill.proficiency}/5
                      </span>
                    </td>

                    {/* Verbatim Evidence Quote */}
                    <td className="py-4 px-6 align-top">
                      {skill.evidence.length === 0 ? (
                        <div className="space-y-2">
                          <span className="text-xs text-danger font-medium block">
                            No text evidence found in resume
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <Link
                              to={`/tools/tailor?skill=${encodeURIComponent(skill.canonical)}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[1px] px-2.5 py-1 rounded bg-forest text-white border border-[#141414] hover:bg-[#3a3a3a] transition-colors"
                              title="Draft bullet in Tailor Studio"
                            >
                              <PenTool className="w-3 h-3 stroke-[1.5px]" />
                              Tailor Bullet
                            </Link>
                            <Link
                              to={`/tools/build-briefs?query=${encodeURIComponent(skill.canonical)}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[1px] px-2.5 py-1 rounded bg-black text-silver hover:text-white border border-charcoal hover:border-silver transition-colors"
                              title="Generate 3-day project scaffold"
                            >
                              <FolderGit2 className="w-3 h-3 stroke-[1.5px]" />
                              Project Brief
                            </Link>
                            <Link
                              to={`/tools/credential-engine?q=${encodeURIComponent(skill.canonical)}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[1px] px-2.5 py-1 rounded bg-black text-silver hover:text-white border border-charcoal hover:border-silver transition-colors"
                              title="Find industry certifications"
                            >
                              <GraduationCap className="w-3 h-3 stroke-[1.5px]" />
                              Certify
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-white bg-black p-2.5 rounded border border-charcoal leading-relaxed font-mono">
                            <span className="text-volt font-sans font-bold mr-1.5">
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
                              className="text-xs text-volt font-bold hover:underline inline-flex items-center gap-1 cursor-pointer uppercase tracking-[1px]"
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
                            <div className="text-[11px] text-silver font-medium">
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
