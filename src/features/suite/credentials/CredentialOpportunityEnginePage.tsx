// ============================================================
// Credential & Opportunity Engine — Primary Page Entry
// Design Suite subsection for verifiable career evidence building (Indian Market edition)
// ============================================================

import React, { useState } from 'react';
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
} from 'lucide-react';
import { PageNav } from '../../../components/common/PageNav';
import { CertificationsTab } from './components/CertificationsTab';
import { EventsTab } from './components/EventsTab';
import { OpenSourceTab } from './components/OpenSourceTab';
import { OpportunityPlanTab } from './components/OpportunityPlanTab';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { Top30DirectoryModal } from './components/Top30DirectoryModal';
import { OpportunityRecord } from './types';
import { CredentialsStorage } from './storage';

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

  return (
    <div className="min-h-screen bg-bg text-foreground relative selection:bg-primary/20">
      {/* Background radiant ambient lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-primary/15 via-orange-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in relative">
        {/* Navigation */}
        <PageNav fallbackRoute="/tools" />

        {/* Effulgent Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-6 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-primary/15 to-emerald-500/15 border border-primary/25 text-primary text-xs sm:text-sm font-black tracking-wide uppercase shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
            <span>Design Suite · Indian Engineering Career Evidence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.15]">
            Credential & Opportunity Engine
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto font-medium leading-relaxed">
            Discover industry certifications with <strong className="text-foreground">INR pricing & student fee waivers</strong>, premier Indian collegiate hackathons (<strong className="text-foreground">Flipkart GRiD, TCS CodeVita, SIH</strong>) with direct PPOs up to ₹32 LPA, and paid fellowships (<strong className="text-foreground">GSoC, C4GT India</strong>) with verifiable public commit histories.
          </p>

          {/* Quick Metrics & Directory Trigger */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsDirectoryOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-2 border border-border hover:border-primary text-xs font-black text-foreground transition-all shadow-sm hover:shadow-md group cursor-pointer"
            >
              <Award className="w-4 h-4 text-primary" />
              <span>Browse All 42 Opportunities (Ranked Index)</span>
              <span className="text-primary group-hover:translate-x-0.5 transition-transform">↗</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-2 border border-border text-xs font-bold text-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>🇮🇳 Indian Market Pricing & Waivers</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-2 border border-border text-xs font-bold text-foreground">
              <Briefcase className="w-3.5 h-3.5 text-orange-500" />
              <span>Direct PPOs (₹26–32 LPA) & Stipends</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-2 border border-border text-xs font-bold text-foreground">
              <Zap className="w-3.5 h-3.5 text-cyan-500" />
              <span>100% Active Direct Portal Links</span>
            </span>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <div className="border-b border-border">
          <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-3 scrollbar-none">
            {/* Tab 1: Certifications */}
            <button
              onClick={() => setActiveTab('certifications')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 cursor-pointer ${
                activeTab === 'certifications'
                  ? 'bg-gradient-to-r from-primary to-indigo-600 text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>1. Certifications</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                activeTab === 'certifications' ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-secondary'
              }`}>
                21
              </span>
            </button>

            {/* Tab 2: Competitions & Events */}
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>2. Competitions & Hackathons</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-secondary'
              }`}>
                13 Flagships
              </span>
            </button>

            {/* Tab 3: Open-Source Programs */}
            <button
              onClick={() => setActiveTab('open_source')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 cursor-pointer ${
                activeTab === 'open_source'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>3. Open-Source & Fellowships</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                activeTab === 'open_source' ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-secondary'
              }`}>
                8 Programs
              </span>
            </button>

            {/* Tab 4: My Opportunity Plan */}
            <button
              onClick={() => setActiveTab('opportunity_plan')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 cursor-pointer ${
                activeTab === 'opportunity_plan'
                  ? 'bg-gradient-to-r from-primary to-indigo-600 text-white border-primary shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>4. My Opportunity Plan</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                activeTab === 'opportunity_plan' ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-secondary'
              }`}>
                {savedCount > 0 ? `${savedCount} Saved` : '30D/90D'}
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
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          onPlanUpdated={refreshPlanCount}
        />

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
