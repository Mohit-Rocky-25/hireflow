import React from 'react';
import { Link } from 'react-router-dom';
import type { Company } from '../talentLensData';
import { TREND_ICON } from '../talentLensData';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';
import { getVerifiedCompanyUrl } from '../../../data/market/verifiedCompanyUrls';
import { SourceChip } from '../../../components/common/SourceChip';
import { ReportErrorModal } from '../../../components/common/ReportErrorModal';

export interface CompanyHeaderCardProps {
  company: Company;
  onChangeCompany: () => void;
}

export function CompanyHeaderCard({ company, onChangeCompany }: CompanyHeaderCardProps) {
  return (
    <div className="shiny-edge-card bg-near-black border border-charcoal rounded-xl p-6 sm:p-7 mb-6 shadow-level-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <CompanyLogo company={company} size="lg" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{company.name}</h2>
              <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-black text-neutral-300 border border-charcoal">
                {company.tier}
              </span>

              {/* Depth Chip */}
              {company.depth && (
                <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                  company.depth === 'deep' ? 'bg-near-black text-volt border-volt/50' :
                  company.depth === 'standard' ? 'bg-black text-neutral-300 border-charcoal' :
                  'bg-black text-neutral-400 border-charcoal'
                }`}>
                  Depth: {company.depth}
                </span>
              )}

              {/* Data Status Chip */}
              {(!company.dataStatus || company.dataStatus === 'legacy_unaudited') ? (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-black text-neutral-400 border border-charcoal">
                  Not yet source-audited
                </span>
              ) : company.dataStatus === 'sourced' ? (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-near-black text-volt border border-volt/50">
                  Sourced
                </span>
              ) : company.dataStatus === 'quarantined' ? (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800">
                  Quarantined
                </span>
              ) : null}
            </div>
            <div className="text-sm text-neutral-300 mt-1.5 flex items-center gap-2.5 flex-wrap">
              <span>{company.hq || 'Not available'}</span>
              <span>•</span>
              <span>{company.industry || 'Not available'}</span>
              <span>•</span>
              <span className="font-bold text-white">{company.avgPackage || 'Not available'}</span>
              {(() => {
                const officialUrl = company.officialSiteUrl || getVerifiedCompanyUrl(company.id) || getVerifiedCompanyUrl(company.name);
                if (!officialUrl) return null;
                return (
                  <>
                    <span>•</span>
                    <a
                      href={officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-volt hover:underline font-semibold"
                    >
                      Official Careers Site
                    </a>
                  </>
                );
              })()}
            </div>

            {/* Sourced evidence chips if present */}
            {company.sources && company.sources.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                {company.sources.slice(0, 3).map((src, i) => (
                  <SourceChip
                    key={i}
                    kind={src.sourceKind}
                    sourceUrl={src.url}
                    lastReviewed={src.lastCheckedAt}
                    sourceName={src.field}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mini Stats (Null safe: prints 'Not available' / '—' instead of undefined/NaN) */}
          <div className="flex items-center gap-2">
            <div className="bg-black rounded-lg px-3.5 py-2 text-center border border-charcoal">
              <div className="text-sm sm:text-base font-bold text-white">
                {company.hiring2024 != null ? company.hiring2024.toLocaleString() : 'Not available'}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                Hires &lsquo;24 {company.trend ? <span className="font-bold text-volt">{TREND_ICON[company.trend]}</span> : null}
              </div>
            </div>
            <div className="bg-black rounded-lg px-3.5 py-2 text-center border border-charcoal">
              <div className="text-sm sm:text-base font-bold text-white">
                {company.openRoles != null ? `${company.openRoles}+` : 'Not available'}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">Open Roles</div>
            </div>
            <div className="bg-black rounded-lg px-3.5 py-2 text-center border border-charcoal">
              <div className="text-sm sm:text-base font-bold text-white">
                {company.glassdoor != null ? `★ ${company.glassdoor}` : 'Not available'}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider mt-0.5">Glassdoor</div>
            </div>
          </div>

          {/* Compare with another company button */}
          <Link
            to={`/tools/jd-compare?c1=${company.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <span className="text-volt text-sm font-bold">⇄</span>
            <span>Compare</span>
          </Link>

          {/* Decode offer link */}
          <Link
            to={`/tools/career-path/company-levels?company=${company.id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <span className="text-volt text-sm font-bold">₹</span>
            <span>Decode Offer</span>
          </Link>

          {/* Report an Error Modal */}
          <ReportErrorModal
            entityId={company.id}
            entityName={company.name}
            entityType="company"
            triggerButtonText="Report Error"
            triggerButtonClassName="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-neutral-400 hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          />

          {/* Sourcing & Legal Provenance Modal */}
          <DataProvenanceModal
            triggerButtonText="Data Sources & Legal Shield"
            triggerButtonClassName="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-volt font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          />

          {/* Back to Companies Button */}
          <button
            onClick={onChangeCompany}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-neutral-400 hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span className="font-bold text-xs">←</span>
            <span>Change Company</span>
          </button>
        </div>
      </div>
    </div>
  );
}
