// ============================================================
// HIREFLOW KNOWLEDGE EXPLORER
// Interactive search and audit tool for ESCO & O*NET canonical taxonomies
// ============================================================

import React, { useState } from 'react';
import { Search, Database, Network } from 'lucide-react';
import { CANONICAL_SKILLS, CanonicalSkill } from '../../../../lib/tailor/knowledge/skillsTaxonomy';
import { TRANSFERABILITY_GRAPH, TransferabilityEdge } from '../../../../lib/tailor/knowledge/transferability';
import { OCCUPATIONAL_ROLES } from '../../../../lib/tailor/knowledge/occupationsTaxonomy';

export function KnowledgeTab() {
  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const filteredSkills = CANONICAL_SKILLS.filter((skill: CanonicalSkill) => {
    if (selectedDomain !== 'ALL' && skill.category !== selectedDomain) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      skill.name.toLowerCase().includes(q) ||
      skill.aliases.some((a: string) => a.toLowerCase().includes(q)) ||
      skill.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Occupational Knowledge Engine Explorer
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Standardized skills taxonomy & transferability graph derived from ESCO v1.1.1 and O*NET 28.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              {CANONICAL_SKILLS.length} Canonical Skills
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              {TRANSFERABILITY_GRAPH.length} Transferable Edges
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
              {OCCUPATIONAL_ROLES.length} Role Families
            </span>
          </div>
        </div>
      </div>

      {/* Search & Domain Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search canonical skills, aliases (e.g. k8s, ts, splunk, react)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-1 text-xs">
          {['ALL', 'languages', 'frontend', 'backend', 'devops_cloud', 'database', 'security', 'data_ai'].map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedDomain === domain
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {domain.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill: CanonicalSkill) => {
          const transferableEdges = TRANSFERABILITY_GRAPH.filter(
            (e: TransferabilityEdge) => e.fromSkillId === skill.id || e.toSkillId === skill.id
          );

          return (
            <div
              key={skill.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 hover:border-indigo-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{skill.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {skill.category.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Canonical Aliases & Synonyms:
                </span>
                <div className="flex flex-wrap gap-1">
                  {skill.aliases.map((alias: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>

              {transferableEdges.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Network className="w-3 h-3 text-indigo-500" /> Transferability Links:
                  </span>
                  {transferableEdges.map((e: TransferabilityEdge, idx: number) => (
                    <div key={idx} className="text-[11px] text-slate-600 leading-snug">
                      &bull; {e.fromSkillId} &harr; {e.toSkillId} ({Math.round(e.weight * 100)}%)
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
