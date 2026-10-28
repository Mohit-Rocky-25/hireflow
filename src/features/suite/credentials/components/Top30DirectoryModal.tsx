// ============================================================
// Credential & Opportunity Engine — Opportunity Directory Component
// Complete searchable table view of all 42 opportunities with INR pricing & links
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  ExternalLink,
  ChevronRight,
  Award,
  IndianRupee,
} from 'lucide-react';
import { ALL_OPPORTUNITIES } from '../data/opportunitiesData';
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
  const [onlyIndian, setOnlyIndian] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    return ALL_OPPORTUNITIES.filter((opp) => {
      if (onlyIndian && !opp.isIndianFlagship && opp.id !== 'opp-sih') return false;

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
  }, [searchQuery, tierFilter, kindFilter, onlyIndian]);

  const handleExternalRedirect = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url && !(e.currentTarget as HTMLAnchorElement)?.href) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getDomainFromUrl = (url?: string) => {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-fade-in cursor-pointer"
    >
      <div
        className="bg-surface border-2 border-border/80 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-surface-2 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Verified Career Evidence Catalog Directory
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Curated, verified benchmark catalog of {ALL_OPPORTUNITIES.length} high-value certifications, Indian hackathons, and open-source programs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-surface-2 hover:bg-rose-500/10 hover:text-rose-600 border border-border hover:border-rose-500/30 text-text-secondary transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            aria-label="Close modal"
            title="Close directory (Esc)"
          >
            <X className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Close</span>
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
              placeholder="Search by title, role, skill, or issuer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setOnlyIndian(!onlyIndian)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                onlyIndian
                  ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40'
                  : 'bg-surface-2 border-border text-text-secondary hover:text-foreground'
              }`}
            >
              <span>🇮🇳</span>
              <span>Indian Flagships</span>
            </button>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="All">All Tiers</option>
              <option value="tier1">Tier 1 · Build First</option>
              <option value="tier2">Tier 2 · Build Next</option>
              <option value="tier3">Tier 3 · Post-Core</option>
            </select>

            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary font-medium"
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
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Opportunity Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Indian Market Fee (INR)</th>
                <th className="py-3 px-3">Best-For Roles</th>
                <th className="py-3 px-3">Resume Val</th>
                <th className="py-3 px-3">Typical Window</th>
                <th className="py-3 px-3">Official Portal</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((opp) => {
                const portalUrl = opp.directPortalUrl || opp.officialUrl;
                const isIndianFlag = opp.isIndianFlagship || opp.id === 'opp-sih';

                return (
                  <tr
                    key={opp.id}
                    onClick={() => {
                      onSelectOpportunity(opp);
                      onClose();
                    }}
                    className="hover:bg-surface-2 transition-colors cursor-pointer group"
                    title={`Click to open full preparation brief for ${opp.name}`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-primary">#{opp.rank}</td>
                    <td className="py-3 px-3 font-bold text-foreground group-hover:text-primary transition-colors">
                      <div className="flex items-center gap-1.5">
                        {isIndianFlag && <span title="Indian Flagship">🇮🇳</span>}
                        <span>{opp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 capitalize">{opp.type.replace('_', ' ')}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {opp.costInr || opp.cost || 'Free'}
                    </td>
                    <td className="py-3 px-3 truncate max-w-[160px]">{opp.targetRoles.slice(0, 2).join(', ')}</td>
                    <td className="py-3 px-3 capitalize font-semibold text-foreground">{opp.resumeValue}</td>
                    <td className="py-3 px-3 truncate max-w-[150px]">{opp.typicalWindow.replace('Typical window: ', '')}</td>
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <a
                          href={portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleExternalRedirect(e, portalUrl)}
                          className="p-1 rounded-md text-primary hover:bg-primary/10 inline-flex items-center gap-1 font-bold cursor-pointer"
                          title={`Open official portal for ${opp.name} (${getDomainFromUrl(portalUrl)})`}
                        >
                          <span>Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {(opp.syllabusUrl || opp.officialUrl) && (
                          <a
                            href={opp.syllabusUrl || opp.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleExternalRedirect(e, opp.syllabusUrl || opp.officialUrl)}
                            className="p-1 rounded-md text-text-secondary hover:text-foreground hover:bg-surface transition-colors inline-flex items-center gap-0.5 text-[11px] font-medium cursor-pointer"
                            title="Open curriculum / syllabus"
                          >
                            <span>Syllabus</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOpportunity(opp);
                          onClose();
                        }}
                        className="text-primary font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        title="View comprehensive preparation brief & aid"
                      >
                        <span>Brief</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
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
}
