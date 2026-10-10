// ============================================================
// Careers Data Platform — React Context, Hooks & DataBadge
// Shared UI hooks and provenance indicator for all HireFlow views
// ============================================================

import React, { createContext, useContext, useMemo, useState } from 'react';
import { careers } from '../api';
import type {
  PlatformCompany,
  FresherProgram,
  CandidateFacts,
  EligibilityResult,
  EntityProvenance,
} from '../schema/types';
import { ShieldCheck, Info, ExternalLink, AlertCircle } from 'lucide-react';

interface CareersContextValue {
  careers: typeof careers;
}

const CareersContext = createContext<CareersContextValue>({ careers });

export function CareersProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ careers }), []);
  return <CareersContext.Provider value={value}>{children}</CareersContext.Provider>;
}

export function useCareers() {
  return useContext(CareersContext).careers;
}

export function useCompanies(segment?: string) {
  return useMemo(() => {
    return segment && segment !== 'ALL'
      ? careers.companies.bySegment(segment as any)
      : careers.companies.list();
  }, [segment]);
}

export function useCompany(idOrAlias: string) {
  return useMemo(() => careers.companies.get(idOrAlias), [idOrAlias]);
}

export function usePrograms(companyId?: string) {
  return useMemo(() => {
    return companyId
      ? careers.programs.forCompany(companyId)
      : careers.programs.query();
  }, [companyId]);
}

export function useProgram(programId: string) {
  return useMemo(() => careers.programs.get(programId), [programId]);
}

export function useEligibility(facts: CandidateFacts | null | undefined, programId: string): EligibilityResult {
  return useMemo(() => careers.eligibility.check(facts, programId), [facts, programId]);
}

export function useCareersSearch(query: string) {
  return useMemo(() => careers.search(query), [query]);
}

export function useCareersStats() {
  return useMemo(() => careers.stats.counts(), []);
}

// ── Reusable DataBadge Component with Sources Popover ───────────────────────────
interface DataBadgeProps {
  entity?: {
    provenance?: EntityProvenance;
    name?: string;
    programName?: string;
  };
  provenance?: EntityProvenance;
  showSources?: boolean;
}

export function DataBadge({ entity, provenance, showSources = true }: DataBadgeProps) {
  const prov = provenance || entity?.provenance;
  const [showPopover, setShowPopover] = useState(false);

  if (!prov) return null;

  const isHigh = prov.confidence === 'high';
  const isMed = prov.confidence === 'medium';
  const isLow = prov.confidence === 'low' || prov.confidence === 'unverified';

  const badgeColor = isHigh
    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    : isMed
    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    : 'bg-amber-500/10 border-amber-500/20 text-amber-400';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${badgeColor} hover:opacity-90`}
        title={`Verified ${prov.lastVerified} · ${prov.sources?.length || 0} sources`}
      >
        {isHigh ? (
          <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        ) : (
          <Info className="w-3 h-3 text-current shrink-0" />
        )}
        <span>
          {isHigh ? 'Verified' : isMed ? 'Documented' : 'Estimated'} {prov.dataYear}
        </span>
        {prov.sources && prov.sources.length > 0 && (
          <span className="text-[10px] opacity-75">({prov.sources.length})</span>
        )}
      </button>

      {/* Interactive Sources Popover */}
      {showPopover && showSources && (
        <div
          className="absolute z-50 left-0 mt-1.5 w-72 rounded-xl bg-neutral-900 border border-neutral-800 p-3 shadow-xl text-xs text-neutral-200 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <span className="font-semibold text-neutral-100">Data Provenance</span>
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
              {prov.confidence} Confidence
            </span>
          </div>

          <div className="space-y-1.5 mb-2">
            <div className="text-[11px] text-neutral-400">
              Last verified: <span className="text-neutral-200">{prov.lastVerified}</span>
            </div>
            {prov.stale && (
              <div className="flex items-center gap-1 text-[11px] text-amber-400">
                <AlertCircle className="w-3 h-3" />
                <span>Notice: Record may be pending next cycle review.</span>
              </div>
            )}
          </div>

          <div className="font-medium text-neutral-300 text-[11px] mb-1">Recorded Sources:</div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {prov.sources && prov.sources.length > 0 ? (
              prov.sources.map((src, i) => (
                <div key={i} className="p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50 space-y-1">
                  <div className="font-medium text-neutral-200 text-xs leading-snug">{src.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
                    <span>{src.publisher} ({src.type})</span>
                    <div className="flex items-center gap-2">
                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 font-semibold underline"
                          title="Open official verified URL"
                        >
                          Official Link <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${src.publisher} ${src.title} campus careers official`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300 font-medium"
                        title="If company season page moved, search live campus drive"
                      >
                        Search Live ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-400 italic">No external sources listed.</div>
            )}
          </div>

          <div className="mt-2 text-[10px] text-neutral-400 leading-tight border-t border-neutral-800 pt-1.5">
            Tip: Corporate portals frequently archive past seasonal links. If an employer's URL moved, click <span className="text-emerald-400 font-semibold">Search Live ↗</span> for the latest recruitment cycle.
          </div>

          <button
            type="button"
            onClick={() => setShowPopover(false)}
            className="mt-2.5 w-full py-1 text-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
