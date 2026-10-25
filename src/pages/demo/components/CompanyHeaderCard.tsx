import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Company } from '../talentLensData';
import { TREND_ICON } from '../talentLensData';
import { CompanyLogo } from '../../../components/common/CompanyLogo';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';

export interface CompanyHeaderCardProps {
  company: Company;
  onChangeCompany: () => void;
}

export function CompanyHeaderCard({ company, onChangeCompany }: CompanyHeaderCardProps) {
  return (
    <div className="shiny-edge-card bg-near-black border border-charcoal rounded-lg p-6 mb-6 shadow-level-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <CompanyLogo company={company} size="lg" />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-[22px] font-bold text-white uppercase tracking-tight">{company.name}</h2>
              <span className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded bg-black text-silver border border-charcoal">
                {company.tier}
              </span>
            </div>
            <div className="text-xs text-silver mt-1 flex items-center gap-2 font-mono">
              <span>{company.hq}</span>
              <span>•</span>
              <span>{company.industry}</span>
              <span>•</span>
              <span className="font-bold text-white">{company.avgPackage}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mini Stats */}
          <div className="flex items-center gap-2">
            <div className="bg-black rounded px-3 py-1.5 text-center border border-charcoal">
              <div className="text-xs font-bold text-white font-mono">
                {company.hiring2024 != null ? company.hiring2024.toLocaleString() : '—'}
              </div>
              <div className="text-[10px] text-silver uppercase tracking-[0.5px] flex items-center justify-center gap-1">
                Hires &lsquo;24 <span className="font-bold text-volt">{TREND_ICON[company.trend]}</span>
              </div>
            </div>
            <div className="bg-black rounded px-3 py-1.5 text-center border border-charcoal">
              <div className="text-xs font-bold text-white font-mono">{company.openRoles}+</div>
              <div className="text-[10px] text-silver uppercase tracking-[0.5px]">Open Roles</div>
            </div>
            <div className="bg-black rounded px-3 py-1.5 text-center border border-charcoal">
              <div className="text-xs font-bold text-white font-mono">★ {company.glassdoor}</div>
              <div className="text-[10px] text-silver uppercase tracking-[0.5px]">Glassdoor</div>
            </div>
          </div>

          {/* Compare with another company button */}
          <Link
            to={`/tools/jd-compare?c1=${company.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-white font-semibold text-xs uppercase tracking-[1px] transition-colors"
          >
            <span className="text-volt font-mono text-[13px] font-bold">⇄</span>
            <span>Compare</span>
          </Link>

          {/* Decode offer link */}
          <Link
            to={`/tools/career-path/company-levels?company=${company.id}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-white font-semibold text-xs uppercase tracking-[1px] transition-colors"
          >
            <span className="text-volt font-mono text-[12px] font-bold">₹</span>
            <span>Decode Offer</span>
          </Link>

          {/* Sourcing & Legal Provenance Modal */}
          <DataProvenanceModal
            triggerButtonText="Data Sources & Legal Shield"
            triggerButtonClassName="flex items-center gap-1.5 px-3 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-volt font-semibold text-xs uppercase tracking-[1px] transition-colors cursor-pointer"
          />

          {/* Back to Companies Button */}
          <button
            onClick={onChangeCompany}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-silver hover:text-white font-semibold text-xs uppercase tracking-[1px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5px]" />
            <span>Change Company</span>
          </button>
        </div>
      </div>
    </div>
  );
}
