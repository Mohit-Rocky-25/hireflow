import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, DollarSign, ArrowLeft } from 'lucide-react';
import type { Company } from '../talentLensData';
import { TREND_COLOR, TREND_ICON } from '../talentLensData';

export interface CompanyHeaderCardProps {
  company: Company;
  onChangeCompany: () => void;
}

export function CompanyHeaderCard({ company, onChangeCompany }: CompanyHeaderCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-[24px] mb-[28px] shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
        <div className="flex items-center gap-[16px]">
          <div
            className={`w-[56px] h-[56px] rounded-2xl bg-gradient-to-br ${company.gradient} flex items-center justify-center text-white font-extrabold text-[18px] flex-shrink-0 shadow-md`}
          >
            {company.logo}
          </div>
          <div>
            <div className="flex items-center gap-[10px] flex-wrap">
              <h2 className="text-[22px] font-bold text-text">{company.name}</h2>
              <span
                className={`text-[11px] font-bold px-[8px] py-[2px] rounded-full ${
                  company.tier === 'FAANG'
                    ? 'bg-ai-light text-ai'
                    : company.tier === 'Unicorn'
                    ? 'bg-primary-light text-primary'
                    : company.tier === 'MNC'
                    ? 'bg-info-bg text-info'
                    : company.tier === 'Startup'
                    ? 'bg-success-bg text-success'
                    : 'bg-surface-3 text-text-secondary'
                }`}
              >
                {company.tier}
              </span>
            </div>
            <div className="text-[13px] text-text-secondary mt-[2px] flex items-center gap-[8px]">
              <span>{company.hq}</span>
              <span>•</span>
              <span>{company.industry}</span>
              <span>•</span>
              <span className="font-semibold text-text">{company.avgPackage}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-[12px] flex-wrap">
          {/* Mini Stats */}
          <div className="flex items-center gap-[8px]">
            <div className="bg-surface-2 rounded-xl px-[12px] py-[8px] text-center border border-border/60">
              <div className="text-[13px] font-extrabold text-text">
                {company.hiring2024 != null ? company.hiring2024.toLocaleString() : '—'}
              </div>
              <div className="text-[10px] text-text-muted flex items-center justify-center gap-[2px]">
                Hires &lsquo;24{' '}
                <span className={`font-bold ${TREND_COLOR[company.trend]}`}>
                  {TREND_ICON[company.trend]}
                </span>
              </div>
            </div>
            <div className="bg-surface-2 rounded-xl px-[12px] py-[8px] text-center border border-border/60">
              <div className="text-[13px] font-extrabold text-text">{company.openRoles}+</div>
              <div className="text-[10px] text-text-muted">Open Roles</div>
            </div>
            <div className="bg-surface-2 rounded-xl px-[12px] py-[8px] text-center border border-border/60">
              <div className="text-[13px] font-extrabold text-text">⭐ {company.glassdoor}</div>
              <div className="text-[10px] text-text-muted">Glassdoor</div>
            </div>
          </div>

          {/* Compare with another company button */}
          <Link
            to={`/tools/company-compare?c1=${company.id}`}
            className="flex items-center gap-[6px] px-[14px] py-[9px] rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-[13px] transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Compare with another company...
          </Link>

          {/* Decode offer link */}
          <Link
            to={`/tools/offer-decoder?company=${company.id}`}
            className="flex items-center gap-[6px] px-[14px] py-[9px] rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-semibold text-[13px] transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            Have an offer? Decode it...
          </Link>

          {/* Back to Companies Button */}
          <button
            onClick={onChangeCompany}
            className="flex items-center gap-[6px] px-[14px] py-[9px] rounded-xl border border-border text-text hover:bg-surface-2 font-medium text-[13px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-text-secondary" />
            Change Company
          </button>
        </div>
      </div>
    </div>
  );
}
