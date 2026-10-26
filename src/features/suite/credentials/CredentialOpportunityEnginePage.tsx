// ============================================================
// Credential & Opportunity Engine — Primary Page Entry
// Design Suite subsection for verifiable career evidence building (Indian Market edition)
// ============================================================

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  Trophy,
  GitBranch,
  Target,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  Briefcase,
  Zap,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import { PublicNavbar } from '../../../components/common/PublicNavbar';
import { CertificationsTab } from './components/CertificationsTab';
import { EventsTab } from './components/EventsTab';
import { OpenSourceTab } from './components/OpenSourceTab';
import { OpportunityPlanTab } from './components/OpportunityPlanTab';
import { OpportunityDetailModal, ModalTab } from './components/OpportunityDetailModal';
import { Top30DirectoryModal } from './components/Top30DirectoryModal';
import { OpportunityRecord, USD_TO_INR_EXCHANGE_RATE } from './types';
import { CredentialsStorage } from './storage';
import { ALL_OPPORTUNITIES } from './data/opportunitiesData';

export type EngineTab = 'certifications' | 'events' | 'open_source' | 'opportunity_plan';

export function CredentialOpportunityEnginePage() {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('q') || searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState<EngineTab>('certifications');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityRecord | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<ModalTab>('overview');
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(() => {
    return CredentialsStorage.loadPlanItems().length;
  });

  const handleOpenOpportunity = (opp: OpportunityRecord, tab: ModalTab = 'overview') => {
    setSelectedOpportunity(opp);
    setModalInitialTab(tab);
  };

  const refreshPlanCount = () => {
    setSavedCount(CredentialsStorage.loadPlanItems().length);
  };

  // Dynamic opportunity counts by section
  const { certCount, eventCount, ossCount, totalCount } = useMemo(() => {
    const certs = ALL_OPPORTUNITIES.filter((o) => o.kind === 'certification').length;
    const events = ALL_OPPORTUNITIES.filter(
      (o) =>
        o.kind === 'event' ||
        o.type === 'hackathon' ||
        o.type === 'codathon' ||
        o.type === 'ideathon' ||
        o.type === 'datathon' ||
        o.type === 'ctf' ||
        o.type === 'ai_challenge' ||
        o.type === 'case_competition'
    ).length;
    const oss = ALL_OPPORTUNITIES.filter(
      (o) =>
        o.kind === 'open_source' ||
        o.type === 'mentorship' ||
        o.type === 'fellowship' ||
        o.type === 'contribution_program' ||
        o.type === 'seasonal_program'
    ).length;

    return {
      certCount: certs,
      eventCount: events,
      ossCount: oss,
      totalCount: ALL_OPPORTUNITIES.length,
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-volt/20">
      <PublicNavbar />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8 animate-fade-in relative">

        {/* Refined Executive Hero Section */}
        <div className="border border-charcoal bg-surface rounded p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-volt" />
                  <span>Credential & Opportunity Engine</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-charcoal text-neutral-300 text-xs font-mono font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
                  <span>1 USD ≈ ₹{USD_TO_INR_EXCHANGE_RATE} INR (Oct 2026 Reference)</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-charcoal text-neutral-400 text-xs font-mono font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-volt" />
                  <span>Zero-Hallucination · Official Portals</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-mono font-black text-white tracking-tight leading-tight uppercase">
                Verifiable Career Evidence & Opportunity Engine
              </h1>

              <p className="text-sm sm:text-base text-neutral-400 font-medium leading-relaxed max-w-2xl">
                Explore proctored certifications with <strong className="text-white">Indian student fee waivers & INR pricing</strong>, premier campus hackathons (<strong className="text-white">Flipkart GRiD, SIH, Goldman Sachs</strong>) with direct hiring routes, and funded fellowships (<strong className="text-white">GSoC, C4GT, LFX</strong>) with public commit proof.
              </p>
            </div>

            {/* Quick Actions & Live Stats Card */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setIsDirectoryOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-volt hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] text-black text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all cursor-pointer group shadow-xs"
              >
                <Award className="w-4 h-4 text-black" />
                <span>Browse Directory ({totalCount} Opportunities)</span>
                <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </button>

              <button
                onClick={() => setActiveTab('opportunity_plan')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-surface hover:bg-surface-elevated border border-charcoal text-white text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Target className="w-4 h-4 text-volt" />
                <span>Personalized Career Roadmap</span>
                {savedCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-mono font-black rounded bg-volt/20 text-volt">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs with Dynamic Counter Badges */}
        <div className="border-b border-charcoal">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-none">
            {/* Tab 1: Certifications */}
            <button
              onClick={() => setActiveTab('certifications')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'certifications'
                  ? 'bg-volt text-black border-volt shadow-xs'
                  : 'bg-surface border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>1. Certifications</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'certifications'
                    ? 'bg-black/20 text-black'
                    : 'bg-surface-elevated text-neutral-400'
                }`}
              >
                {certCount}
              </span>
            </button>

            {/* Tab 2: Competitions & Events */}
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-volt text-black border-volt shadow-xs'
                  : 'bg-surface border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>2. Competitions & Hackathons</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'events'
                    ? 'bg-black/20 text-black'
                    : 'bg-surface-elevated text-neutral-400'
                }`}
              >
                {eventCount}
              </span>
            </button>

            {/* Tab 3: Open-Source Programs */}
            <button
              onClick={() => setActiveTab('open_source')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'open_source'
                  ? 'bg-volt text-black border-volt shadow-xs'
                  : 'bg-surface border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>3. Open-Source & Fellowships</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'open_source'
                    ? 'bg-black/20 text-black'
                    : 'bg-surface-elevated text-neutral-400'
                }`}
              >
                {ossCount}
              </span>
            </button>

            {/* Tab 4: My Opportunity Plan */}
            <button
              onClick={() => setActiveTab('opportunity_plan')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'opportunity_plan'
                  ? 'bg-volt text-black border-volt shadow-xs'
                  : 'bg-surface border-charcoal text-neutral-400 hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>4. Student Career Roadmap</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'opportunity_plan'
                    ? 'bg-black/20 text-black'
                    : 'bg-surface-elevated text-neutral-400'
                }`}
              >
                {savedCount > 0 ? `${savedCount} Saved` : '30-60-90D'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="pt-2">
          {activeTab === 'certifications' && (
            <CertificationsTab
              onSelectOpportunity={handleOpenOpportunity}
              onPlanUpdated={refreshPlanCount}
              initialSearchQuery={searchParam}
            />
          )}

          {activeTab === 'events' && (
            <EventsTab
              onSelectOpportunity={handleOpenOpportunity}
              onPlanUpdated={refreshPlanCount}
            />
          )}

          {activeTab === 'open_source' && (
            <OpenSourceTab
              onSelectOpportunity={handleOpenOpportunity}
              onPlanUpdated={refreshPlanCount}
            />
          )}

          {activeTab === 'opportunity_plan' && (
            <OpportunityPlanTab
              onSelectOpportunity={handleOpenOpportunity}
              onPlanChanged={refreshPlanCount}
            />
          )}
        </div>

        {/* Deep Opportunity Detail Modal */}
        {selectedOpportunity && (
          <OpportunityDetailModal
            key={selectedOpportunity.id}
            opportunity={selectedOpportunity}
            initialTab={modalInitialTab}
            onClose={() => setSelectedOpportunity(null)}
            onPlanUpdated={refreshPlanCount}
          />
        )}

        {/* Top 30 Directory Index Modal */}
        <Top30DirectoryModal
          isOpen={isDirectoryOpen}
          onClose={() => setIsDirectoryOpen(false)}
          onSelectOpportunity={(opp) => handleOpenOpportunity(opp, 'overview')}
        />
      </div>
    </div>
  );
}
