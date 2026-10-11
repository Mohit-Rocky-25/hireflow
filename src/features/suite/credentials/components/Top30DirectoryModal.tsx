// ============================================================
// Credential & Opportunity Engine — Top 30 Directory Component (Stage 10)
// Complete ranked table view of all 30 opportunities
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord } from '../types';

interface Top30DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOpportunity: (opp: OpportunityRecord) => void;
}

export function Top30DirectoryModal({
  isOpen,
  onClose,
  onSelectOpportunity,
}: Top30DirectoryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [kindFilter, setKindFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    return TOP_30_OPPORTUNITIES.filter((opp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = opp.name.toLowerCase().includes(q);
        const matchesOrg = opp.organizer.toLowerCase().includes(q);
        const matchesRoles = opp.targetRoles.some((r) => r.toLowerCase().includes(q));
        if (!matchesName && !matchesOrg && !matchesRoles) return false;
      }
      if (tierFilter !== 'All' && opp.releaseTier !== tierFilter) return false;
      if (kindFilter !== 'All' && opp.kind !== kindFilter) return false;
      return true;
    });
  }, [searchQuery, tierFilter, kindFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-surface border-2 border-border rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-surface-2 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Top 30 Opportunity Catalog Directory
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Curated, verified benchmark catalog for BTech & college engineering students.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="p-4 bg-surface border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, role, or organizer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Tiers</option>
              <option value="tier1">Tier 1 · Build First (1-10)</option>
              <option value="tier2">Tier 2 · Build Next (11-20)</option>
              <option value="tier3">Tier 3 · Post-Core (21-30)</option>
            </select>

            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Types</option>
              <option value="certification">Certifications</option>
              <option value="event">Competitions & Hackathons</option>
              <option value="open_source">Open-Source Programs</option>
            </select>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto flex-1 p-4">
          <table className="w-full text-left text-xs text-text-secondary border-collapse">
            <thead>
              <tr className="border-b border-border text-foreground font-bold uppercase tracking-wider text-[11px] bg-surface-2">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Opportunity Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Best-For Roles</th>
                <th className="py-3 px-3">Resume Val</th>
                <th className="py-3 px-3">Evidence Val</th>
                <th className="py-3 px-3">Typical Window</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Last Verified</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((opp) => (
                <tr
                  key={opp.id}
                  onClick={() => {
                    onSelectOpportunity(opp);
                    onClose();
                  }}
                  className="hover:bg-surface-2 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 font-mono font-bold text-primary">#{opp.rank}</td>
                  <td className="py-3 px-3 font-bold text-foreground group-hover:text-primary transition-colors">
                    {opp.name}
                  </td>
                  <td className="py-3 px-3 capitalize">{opp.type.replace('_', ' ')}</td>
                  <td className="py-3 px-3 truncate max-w-[140px]">{opp.category[0]}</td>
                  <td className="py-3 px-3 truncate max-w-[160px]">{opp.targetRoles.slice(0, 2).join(', ')}</td>
                  <td className="py-3 px-3 capitalize font-semibold text-foreground">{opp.resumeValue}</td>
                  <td className="py-3 px-3 capitalize font-semibold text-foreground">{opp.evidenceValue}</td>
                  <td className="py-3 px-3 truncate max-w-[150px]">{opp.typicalWindow.replace('Typical window: ', '')}</td>
                  <td className="py-3 px-3 capitalize font-semibold text-foreground">{opp.confidence}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{opp.lastVerifiedAt}</td>
                  <td className="py-3 px-3">
                    <span className="text-primary font-bold group-hover:underline inline-flex items-center gap-1">
                      Details →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
