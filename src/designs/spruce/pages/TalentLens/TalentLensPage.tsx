import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  FieldShell,
  TextInput,
  CompareBadge,
  StatusChip,
} from '../../ui';
import { COMPANIES, findCompanyBySlug } from '../../../../pages/demo/talentLensData';
import { getCompanySlug } from '../../../../pages/demo/talentLensEngine';
import { ArrowRight, Search, Building2, Layers } from 'lucide-react';

export function SpruceTalentLensPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const filteredCompanies = useMemo(() => {
    return COMPANIES.filter((c) => {
      if (selectedTier !== 'all' && c.tier !== selectedTier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.hq.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchQuery, selectedTier]);

  const tiers = useMemo(() => {
    const set = new Set<string>();
    COMPANIES.forEach((c) => {
      if (c.tier) set.add(c.tier);
    });
    return ['all', ...Array.from(set)];
  }, []);

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'TalentLens Demo' },
        ]}
        title="Where do I fit, and what should I prepare for?"
        subtitle="An evidence-first placement readiness platform that calibrates your skills, projects, and credentials against real hiring rubrics."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Search & Tier Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sp-hairline">
          <FieldShell className="max-w-md w-full">
            <TextInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, industry, or location..."
            />
          </FieldShell>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="sp-caption text-sp-muted font-bold mr-1">Tier:</span>
            {tiers.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTier(t)}
                className={`px-3 py-1 rounded-sp-xs sp-caption font-bold border transition-colors cursor-pointer ${
                  selectedTier === t
                    ? 'bg-sp-primary text-sp-on-primary border-sp-primary'
                    : 'bg-sp-surface text-sp-body border-sp-hairline hover:bg-sp-mint-50/50'
                }`}
              >
                {t === 'all' ? 'All Tiers' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Company Rate Cards Grid per Appendix 5.10 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company, idx) => {
            const slug = company.id || getCompanySlug(company.name);
            const roleCount = company.roles?.length ?? company.openRoles ?? 0;
            const monogram = company.logo || company.name.charAt(0).toUpperCase();

            return (
              <div
                key={company.id || slug}
                onClick={() => navigate(`/demo/company/${slug}`)}
                className="group relative rounded-sp-xl bg-sp-surface border border-sp-hairline-strong p-5 hover:border-sp-primary-text transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sp-mint-100 text-sp-primary-text font-bold text-base flex items-center justify-center shrink-0 border border-sp-mint-200">
                      {monogram.slice(0, 3)}
                    </div>
                    <div>
                      <h3 className="sp-h3 text-sp-ink font-bold group-hover:text-sp-primary-text transition-colors">
                        {company.name}
                      </h3>
                      <p className="sp-caption text-sp-muted">
                        {company.industry} • {company.hq}
                      </p>
                    </div>
                  </div>

                  {idx === 0 && (
                    <CompareBadge>High Volume</CompareBadge>
                  )}
                </div>

                <div className="pt-3 border-t border-sp-hairline flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="sp-caption text-sp-muted tabular-nums">
                      {roleCount} {roleCount === 1 ? 'Track' : 'Tracks'}
                    </span>
                    <span className="sp-caption text-sp-faint">•</span>
                    <span className="sp-caption text-sp-body font-semibold">
                      {company.tier || 'MNC'}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-sp-primary text-sp-on-primary flex items-center justify-center group-hover:bg-sp-primary-hover transition-colors shadow-sp-3">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SpruceShell>
  );
}
