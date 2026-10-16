// ============================================================
// Credential & Opportunity Engine — Primary Page Entry
// Design Suite subsection for verifiable career evidence building (Indian Market edition)
// ============================================================

import React, { useState, useMemo } from 'react';
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
import { PageNav } from '../../../components/common/PageNav';
import { CertificationsTab } from './components/CertificationsTab';
import { EventsTab } from './components/EventsTab';
import { OpenSourceTab } from './components/OpenSourceTab';
import { OpportunityPlanTab } from './components/OpportunityPlanTab';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { Top30DirectoryModal } from './components/Top30DirectoryModal';
import { OpportunityRecord, USD_TO_INR_EXCHANGE_RATE } from './types';
import { CredentialsStorage } from './storage';
import { ALL_OPPORTUNITIES } from './data/opportunitiesData';

export type EngineTab = 'certifications' | 'events' | 'open_source' | 'opportunity_plan';

export function CredentialOpportunityEnginePage() {
  const [activeTab, setActiveTab] = useState<EngineTab>('certifications');
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityRecord | null>(null);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(() => {
    return CredentialsStorage.loadPlanItems().length;
  });

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
    <div className="min-h-screen bg-bg text-foreground relative selection:bg-primary/20">
      {/* Background ambient radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-gradient-to-b from-primary/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 space-y-8 animate-fade-in relative">
        {/* Navigation */}
        <PageNav fallbackRoute="/tools" preferFallback={true} />

        {/* Refined Executive Hero Section */}
        <div className="border border-border/80 bg-surface/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Credential & Opportunity Engine</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>1 USD ≈ ₹{USD_TO_INR_EXCHANGE_RATE} INR (Oct 2026 Reference)</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 border border-border text-text-secondary text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Zero-Hallucination · Official Portals</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                Verifiable Career Evidence & Opportunity Engine
              </h1>

              <p className="text-sm sm:text-base text-text-secondary font-medium leading-relaxed max-w-2xl">
                Explore proctored certifications with <strong className="text-foreground">Indian student fee waivers & INR pricing</strong>, premier campus hackathons (<strong className="text-foreground">Flipkart GRiD, SIH, Goldman Sachs</strong>) with direct hiring routes, and funded fellowships (<strong className="text-foreground">GSoC, C4GT, LFX</strong>) with public commit proof.
              </p>
            </div>

            {/* Quick Actions & Live Stats Card */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0 w-full lg:w-auto">
              <button
                onClick={() => setIsDirectoryOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white text-xs sm:text-sm font-black shadow-md shadow-primary/20 transition-all cursor-pointer group"
              >
                <Award className="w-4 h-4" />
                <span>Browse Directory ({totalCount} Opportunities)</span>
                <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
              </button>

              <button
                onClick={() => setActiveTab('opportunity_plan')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-border text-foreground text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                <Target className="w-4 h-4 text-primary" />
                <span>Personalized Career Roadmap</span>
                {savedCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-black rounded-md bg-primary/15 text-primary">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs with Dynamic Counter Badges */}
        <div className="border-b border-border/80">
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-none">
            {/* Tab 1: Certifications */}
            <button
              onClick={() => setActiveTab('certifications')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'certifications'
                  ? 'bg-gradient-to-r from-primary to-indigo-600 text-white border-primary/50 shadow-md shadow-primary/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>1. Certifications</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'certifications'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-2 text-text-secondary'
                }`}
              >
                {certCount}
              </span>
            </button>

            {/* Tab 2: Competitions & Events */}
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500/50 shadow-md shadow-orange-500/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>2. Competitions & Hackathons</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'events'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-2 text-text-secondary'
                }`}
              >
                {eventCount}
              </span>
            </button>

            {/* Tab 3: Open-Source Programs */}
            <button
              onClick={() => setActiveTab('open_source')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'open_source'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500/50 shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>3. Open-Source & Fellowships</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'open_source'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-2 text-text-secondary'
                }`}
              >
                {ossCount}
              </span>
            </button>

            {/* Tab 4: My Opportunity Plan */}
            <button
              onClick={() => setActiveTab('opportunity_plan')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border cursor-pointer ${
                activeTab === 'opportunity_plan'
                  ? 'bg-gradient-to-r from-primary to-indigo-600 text-white border-primary/50 shadow-md shadow-primary/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>4. Student Career Roadmap</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                  activeTab === 'opportunity_plan'
                    ? 'bg-white/20 text-white'
                    : 'bg-surface-2 text-text-secondary'
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
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
              onPlanUpdated={refreshPlanCount}
            />
          )}

          {activeTab === 'events' && (
            <EventsTab
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
              onPlanUpdated={refreshPlanCount}
            />
          )}

          {activeTab === 'open_source' && (
            <OpenSourceTab
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
              onPlanUpdated={refreshPlanCount}
            />
          )}

          {activeTab === 'opportunity_plan' && (
            <OpportunityPlanTab
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
              onPlanChanged={refreshPlanCount}
            />
          )}
        </div>

        {/* Deep Opportunity Detail Modal */}
        {selectedOpportunity && (
          <OpportunityDetailModal
            key={selectedOpportunity.id}
            opportunity={selectedOpportunity}
            onClose={() => setSelectedOpportunity(null)}
            onPlanUpdated={refreshPlanCount}
          />
        )}

        {/* Top 30 Directory Index Modal */}
        <Top30DirectoryModal
          isOpen={isDirectoryOpen}
          onClose={() => setIsDirectoryOpen(false)}
          onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
        />
      </div>
    </div>
  );
}
