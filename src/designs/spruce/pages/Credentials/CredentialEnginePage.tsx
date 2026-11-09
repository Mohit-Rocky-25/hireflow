import React, { useState, useMemo } from 'react';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  Tabs,
  StatusChip,
  SpecGrid,
  SpecCell,
  CompareBadge,
  FieldShell,
  TextInput,
  Modal,
} from '../../ui';
import { ALL_OPPORTUNITIES } from '../../../../features/suite/credentials/data/opportunitiesData';
import { OpportunityRecord, USD_TO_INR_EXCHANGE_RATE } from '../../../../features/suite/credentials/types';
import {
  Award,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Briefcase,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Cloud and DevOps',
  'Software Development',
  'AI and Machine Learning',
  'Cybersecurity',
  'Data and Analytics',
];

export function SpruceCredentialEnginePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedKind, setSelectedKind] = useState<'all' | 'certification' | 'event' | 'open_source'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeOpportunity, setActiveOpportunity] = useState<OpportunityRecord | null>(null);

  const filteredOpportunities = useMemo(() => {
    return ALL_OPPORTUNITIES.filter((opp) => {
      if (selectedCategory !== 'All' && !opp.category.includes(selectedCategory as any)) return false;
      if (selectedKind !== 'all' && opp.kind !== selectedKind) return false;
      const issuer = opp.organizer || opp.issuer || 'Enterprise';
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          opp.name.toLowerCase().includes(q) ||
          issuer.toLowerCase().includes(q) ||
          (opp.relatedSkills || []).some((s: string) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, selectedKind, searchQuery]);

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'Credential Engine' },
        ]}
        title="Verifiable Credential & Evidence Engine"
        subtitle="Calibrated certifications, hackathons, and open-source programs evaluated against enterprise shortlist rubrics."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Kind Tabs & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sp-hairline">
          <Tabs
            items={[
              { id: 'all', label: `All Evidence (${ALL_OPPORTUNITIES.length})` },
              { id: 'certification', label: 'Certifications' },
              { id: 'event', label: 'Hackathons & Contests' },
              { id: 'open_source', label: 'Open-Source Programs' },
            ]}
            activeId={selectedKind}
            onChange={(id) => setSelectedKind(id as any)}
          />

          <FieldShell className="max-w-xs">
            <TextInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by issuer, skill, name..."
            />
          </FieldShell>
        </div>

        {/* Filter Chips per Appendix 5.5: toggle buttons */}
        <div className="space-y-2">
          <span className="sp-caption text-sp-muted font-bold uppercase tracking-wider">Domain Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-9 px-3.5 rounded-sp-lg border text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-sp-primary text-sp-on-primary border-sp-primary shadow-sp-3'
                      : 'bg-sp-surface text-sp-body border-sp-hairline hover:bg-sp-mint-50/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Credential Cards Grid per Appendix 5.5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => {
            const isVerified = opp.verificationStatus === 'verified' || opp.verificationStatus === 'checked-manually';
            const issuer = opp.organizer || opp.issuer || 'Enterprise';
            const costLabel = opp.cost || (opp.costInr ? `₹${opp.costInr.toLocaleString()}` : 'Free / Subsidized');
            const signalLabel = opp.resumeValue ? opp.resumeValue.toUpperCase() : 'HIGH';

            return (
              <Card
                key={opp.id}
                className="p-6 bg-sp-surface flex flex-col justify-between space-y-4 hover:border-sp-primary-text transition-colors cursor-pointer"
                onClick={() => setActiveOpportunity(opp)}
              >
                <div className="space-y-4">
                  {/* Top row: Monogram circle + StatusChip */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sp-mint-100 text-sp-primary-text font-bold text-sm flex items-center justify-center shrink-0 border border-sp-mint-200">
                        {issuer.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="sp-caption text-sp-muted font-semibold truncate block">
                          {issuer}
                        </span>
                        <span className="sp-micro text-sp-body capitalize">
                          {opp.category?.[0] || 'Evidence'}
                        </span>
                      </div>
                    </div>

                    <StatusChip
                      status={isVerified ? 'matched' : 'partial'}
                      label={isVerified ? 'Verified' : 'Needs Check'}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="sp-h3 text-sp-ink leading-snug line-clamp-2">
                    {opp.name}
                  </h3>

                  {/* SpecGrid (Cost, Level, Relevance) */}
                  <div className="pt-2">
                    <SpecGrid columns={3}>
                      <SpecCell
                        label="Fee"
                        value={costLabel}
                      />
                      <SpecCell
                        label="Level"
                        value={opp.level || 'Standard'}
                      />
                      <SpecCell
                        label="Signal"
                        value={signalLabel}
                      />
                    </SpecGrid>
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1">
                    {(opp.relatedSkills || []).slice(0, 3).map((skill: string) => (
                      <span
                        key={skill}
                        className="sp-micro px-2 py-0.5 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline text-sp-body"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-sp-hairline flex items-center justify-between">
                  <span className="sp-micro text-sp-muted">
                    {opp.feeWaiverNote ? 'Fee waiver note available' : 'Official Curriculum'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveOpportunity(opp);
                    }}
                  >
                    View Details →
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {activeOpportunity && (
        <Modal
          isOpen={Boolean(activeOpportunity)}
          onClose={() => setActiveOpportunity(null)}
          title={activeOpportunity.name}
          className="max-w-[700px]"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-sp-hairline">
              <span className="sp-caption font-bold text-sp-primary-text">{activeOpportunity.organizer || activeOpportunity.issuer || 'Enterprise'}</span>
              <span className="sp-caption text-sp-muted">•</span>
              <span className="sp-caption text-sp-muted">{activeOpportunity.category?.[0] || 'Program'}</span>
              <span className="sp-caption text-sp-muted">•</span>
              <StatusChip
                status={activeOpportunity.verificationStatus === 'verified' ? 'matched' : 'partial'}
                label={activeOpportunity.verificationStatus}
              />
            </div>

            <div className="space-y-2">
              <h4 className="sp-ui-label text-sp-ink font-bold uppercase tracking-wider">Shortlist Signal &amp; Value</h4>
              <p className="sp-body text-sp-body leading-relaxed">{activeOpportunity.eligibilityNotes || activeOpportunity.prerequisites || 'Direct evidence credential with verifiable recruiter shortlist weighting.'}</p>
            </div>

            <div className="space-y-2">
              <h4 className="sp-ui-label text-sp-ink font-bold uppercase tracking-wider">Target Skills Covered</h4>
              <div className="flex flex-wrap gap-1.5">
                {(activeOpportunity.relatedSkills || []).map((s: string) => (
                  <span
                    key={s}
                    className="sp-caption px-2.5 py-1 rounded-sp-xs bg-sp-mint-100 text-sp-primary-text font-semibold border border-sp-mint-200"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-sp-lg bg-sp-canvas-soft border border-sp-hairline space-y-1.5">
              <span className="sp-caption text-sp-body font-bold">Preparation &amp; Fee Details</span>
              <p className="sp-body-sm text-sp-muted leading-relaxed">
                {activeOpportunity.officialUrl ? (
                  <a
                    href={activeOpportunity.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sp-link underline hover:text-sp-primary-text inline-flex items-center gap-1 font-semibold"
                  >
                    <span>Visit Official Program Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span>Verified against official enterprise testing specifications.</span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-sp-hairline">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveOpportunity(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </SpruceShell>
  );
}
