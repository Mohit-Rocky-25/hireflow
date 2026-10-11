// ============================================================
// Credential & Opportunity Engine — Primary Page Entry
// Design Suite subsection for verifiable career evidence building
// ============================================================

import React, { useState } from 'react';
import {
  Award,
  Trophy,
  GitBranch,
  Target,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Search,
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
    <div className="min-h-screen bg-bg text-foreground">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in relative">
        {/* Navigation */}
        <PageNav fallbackRoute="/tools" />

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-10 sm:pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold tracking-wide uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Design Suite · Evidence-Building Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
            Credential & Opportunity Engine
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-3xl mx-auto font-medium leading-relaxed">
            Find industry-relevant certifications, competitions, and open-source programs that create verifiable resume evidence for your target role.
          </p>

          {/* Quick Metrics & Directory Trigger */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsDirectoryOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 border border-border hover:border-primary/50 text-xs font-bold text-foreground transition-all shadow-xs group cursor-pointer"
            >
              <Award className="w-4 h-4 text-primary" />
              <span>Browse Top 30 Catalog Index (Ranked)</span>
              <span className="text-primary group-hover:translate-x-0.5 transition-transform">↗</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-semibold text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>30 High-Value Opportunities</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-semibold text-text-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>100% Zero-Fabrication Official Sources</span>
            </span>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <div className="border-b border-border">
          <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto pb-3 scrollbar-none">
            {/* Tab 1: Certifications */}
            <button
              onClick={() => setActiveTab('certifications')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 ${
                activeTab === 'certifications'
                  ? 'bg-primary text-white border-primary shadow-md scale-102'
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
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 ${
                activeTab === 'events'
                  ? 'bg-primary text-white border-primary shadow-md scale-102'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>2. Competitions & Events</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                activeTab === 'events' ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-secondary'
              }`}>
                Hackathons & SIH
              </span>
            </button>

            {/* Tab 3: Open-Source Programs */}
            <button
              onClick={() => setActiveTab('open_source')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 ${
                activeTab === 'open_source'
                  ? 'bg-primary text-white border-primary shadow-md scale-102'
                  : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-2'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>3. Open-Source Programs</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                activeTab === 'open_source' ? 'bg-white/20 text-white' : 'bg-surface-2 text-text-secondary'
              }`}>
                GSoC & LFX
              </span>
            </button>

            {/* Tab 4: My Opportunity Plan */}
            <button
              onClick={() => setActiveTab('opportunity_plan')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all border-2 ${
                activeTab === 'opportunity_plan'
                  ? 'bg-primary text-white border-primary shadow-md scale-102'
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
