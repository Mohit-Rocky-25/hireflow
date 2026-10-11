// ============================================================
// Credential & Opportunity Engine — Competitions & Events Tab (Stage 5)
// Deeply structured guidance for hackathons, datathons, CTFs, & SIH
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  Search,
  Trophy,
  Users,
  Calendar,
  Globe,
  Sparkles,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Info,
  HelpCircle,
} from 'lucide-react';
import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';
import { OpportunityRecord, EventType } from '../types';
import { CredentialsStorage } from '../storage';

interface EventsTabProps {
  onSelectOpportunity: (opportunity: OpportunityRecord) => void;
  onPlanUpdated?: () => void;
}

const EVENT_TYPE_DEFINITIONS: Array<{
  type: string;
  name: string;
  description: string;
  bestFor: string;
}> = [
  {
    type: 'hackathon',
    name: 'Hackathon',
    description: 'Sprint-based competition to build and deploy a working prototype or MVP from scratch in a limited time (24–48 hours).',
    bestFor: 'Proving rapid end-to-end full stack delivery, API integration, and teamwork under pressure.',
  },
  {
    type: 'codathon',
    name: 'Codathon',
    description: 'Competitive programming or algorithmic contest solving data structures and mathematical optimization problems.',
    bestFor: 'Proving runtime efficiency, algorithm design, and algorithmic problem-solving speed for Tier S online assessments.',
  },
  {
    type: 'ideathon',
    name: 'Ideathon',
    description: 'Structured innovation competition focused on idea validation, solution design, technical feasibility, and business cases.',
    bestFor: 'Proving product framing, market research, and architectural problem breakdown.',
  },
  {
    type: 'datathon',
    name: 'Datathon',
    description: 'Data analytics, predictive modeling, and feature engineering challenge on structured or unstructured real-world datasets.',
    bestFor: 'Proving leak-free cross-validation, feature extraction, and metric optimization for data roles.',
  },
  {
    type: 'ctf',
    name: 'Cybersecurity CTF',
    description: 'Capture-the-flag security challenge covering cryptography, reverse engineering, web vulnerabilities (OWASP), and forensics.',
    bestFor: 'Proving hands-on defensive and offensive security skill with concrete flags captured.',
  },
  {
    type: 'case_competition',
    name: 'Case Competition',
    description: 'Business, product, strategy, or analytics case solving presented to executive leadership or consulting panels.',
    bestFor: 'Proving economic impact modeling, stakeholder communication, and strategic problem framing.',
  },
  {
    type: 'ai_challenge',
    name: 'AI / ML Challenge',
    description: 'Applied machine learning or generative AI competition building custom models or agents for domain tasks.',
    bestFor: 'Proving model fine-tuning, latency optimization, and real-world evaluation metrics.',
  },
  {
    type: 'game_jam',
    name: 'Game Jam',
    description: 'Rapid video game development sprint designing game mechanics, physics, and assets within 48–72 hours.',
    bestFor: 'Proving real-time graphics programming, game engines (Unity, Unreal), and asset pipeline integration.',
  },
  {
    type: 'robotics',
    name: 'Robotics Challenge',
    description: 'Hardware, embedded systems, microcontrollers (ROS, Arduino, ESP32), and automation robotics challenges.',
    bestFor: 'Proving hardware-software sensor integration and embedded firmware engineering.',
  },
];

export function EventsTab({
  onSelectOpportunity,
  onPlanUpdated,
}: EventsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [selectedScope, setSelectedScope] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const items = CredentialsStorage.loadPlanItems();
    return new Set(items.map((i) => i.opportunityId));
  });

  const eventOpportunities = useMemo(() => {
    return TOP_30_OPPORTUNITIES.filter(
      (o) =>
        o.kind === 'event' ||
        o.id === 'opp-sih' ||
        o.id === 'opp-kaggle-comp' ||
        o.id === 'opp-mlh-hackathons' ||
        o.id === 'opp-hacktoberfest' ||
        o.id === 'opp-mlh-fellowship'
    );
  }, []);

  const filteredEvents = useMemo(() => {
    return eventOpportunities.filter((event) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = event.name.toLowerCase().includes(query);
        const matchesOrg = event.organizer.toLowerCase().includes(query);
        const matchesSkills = event.relatedSkills.some((s) => s.toLowerCase().includes(query));
        const matchesRoles = event.targetRoles.some((r) => r.toLowerCase().includes(query));
        if (!matchesName && !matchesOrg && !matchesSkills && !matchesRoles) return false;
      }

      if (selectedType !== 'All' && event.type !== selectedType) {
        return false;
      }

      if (selectedRole !== 'All' && !event.targetRoles.includes(selectedRole)) {
        return false;
      }

      if (selectedMode !== 'All' && event.mode !== selectedMode) {
        return false;
      }

      if (selectedScope !== 'All' && event.scope !== selectedScope) {
        return false;
      }

      if (selectedTier !== 'All' && event.releaseTier !== selectedTier) {
        return false;
      }

      return true;
    });
  }, [
    eventOpportunities,
    searchQuery,
    selectedType,
    selectedRole,
    selectedMode,
    selectedScope,
    selectedTier,
  ]);

  const handleCopyTemplate = (e: React.MouseEvent, event: OpportunityRecord) => {
    e.stopPropagation();
    navigator.clipboard.writeText(event.resumePresentationTemplate);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePlan = (e: React.MouseEvent, oppId: string) => {
    e.stopPropagation();
    if (savedIds.has(oppId)) {
      CredentialsStorage.removePlanItem(oppId);
      const next = new Set(savedIds);
      next.delete(oppId);
      setSavedIds(next);
    } else {
      const opp = eventOpportunities.find((c) => c.id === oppId);
      if (opp) {
        CredentialsStorage.savePlanItem({
          opportunityId: opp.id,
          status: 'interested',
          targetTimeline: '30_day',
          priority: 'high',
          reasonForRecommendation: `Saved from Events catalog: ${opp.name}`,
          evidenceCreated: `Verified competition outcome for ${opp.targetRoles[0] || 'Target Role'}`,
          resumeImprovementSupported: `Adds verifiable project bullet under ${opp.name}`,
          estimatedEffort: opp.duration,
          completionCondition: 'Build and deploy working prototype before deadline.',
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        const next = new Set(savedIds);
        next.add(oppId);
        setSavedIds(next);
      }
    }
    if (onPlanUpdated) onPlanUpdated();
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Smart India Hackathon Special Spotlight Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-surface-2 border-2 border-primary/30 shadow-md space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
              🇮🇳
            </span>
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                Flagship National Platform · Smart India Hackathon
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-foreground">
                How College Students Compete & Build Career Proof
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              const sih = TOP_30_OPPORTUNITIES.find((o) => o.id === 'opp-sih');
              if (sih) onSelectOpportunity(sih);
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
          >
            <span>Explore SIH Playbook</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          Smart India Hackathon (SIH) is the world’s largest nationwide student innovation platform where collegiate teams solve real problem statements posted by Central Government Ministries, State Departments, and PSUs. <strong>Participation begins at the institute internal round:</strong> your college conducts an internal hackathon to nominate the top 30-40 teams to the national portal. Never hardcode unconfirmed dates—rely on verified typical annual windows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
            <strong className="text-foreground block">1. Form 6-Member Squad</strong>
            <span className="text-text-secondary">Mandatory 6 members with at least 1 female teammate. Balance frontend, backend, devops, and pitch lead.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
            <strong className="text-foreground block">2. Internal College Selection</strong>
            <span className="text-text-secondary">Compete in internal campus hackathon (Aug–Sep) to secure official college SPOC nomination.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1">
            <strong className="text-foreground block">3. 36-Hour Grand Finale</strong>
            <span className="text-text-secondary">Travel to assigned nodal center and build non-stop prototype under live ministry evaluator checks.</span>
          </div>
        </div>
      </div>

      {/* Clear Distinction Guide: Hackathon vs Codathon vs Datathon vs CTF vs Ideathon */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-extrabold text-foreground tracking-tight">
            Understanding Competition Types: What Each Format Proves
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EVENT_TYPE_DEFINITIONS.map((item) => (
            <div
              key={item.type}
              onClick={() => setSelectedType(selectedType === item.type ? 'All' : item.type)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedType === item.type
                  ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
                  : 'bg-surface border-border hover:border-border/80 hover:bg-surface-2'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-foreground">{item.name}</span>
                {selectedType === item.type && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Active Filter
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-2.5">
                {item.description}
              </p>
              <div className="text-[11px] font-medium text-primary">
                <strong>Proves:</strong> {item.bestFor}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
        <div className="relative">
          <Search className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name, skill, organizer (e.g. Smart India Hackathon, Kaggle, MLH, Devpost)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Event Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Types</option>
              {EVENT_TYPE_DEFINITIONS.map((def) => (
                <option key={def.type} value={def.type}>{def.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Target Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Roles</option>
              <option value="Full-Stack Developer">Full-Stack Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="AI/ML Engineer">AI/ML Engineer</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Modes</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
              <option value="offline">In-person</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Scope</label>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Scopes</option>
              <option value="national">National</option>
              <option value="international">International</option>
              <option value="college">College Level</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-text-secondary">Release Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="All">All Tiers</option>
              <option value="tier1">Tier 1 · Build First</option>
              <option value="tier2">Tier 2 · Build Next</option>
              <option value="tier3">Tier 3 · Post-Core</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const isSaved = savedIds.has(event.id);
          return (
            <div
              key={event.id}
              onClick={() => onSelectOpportunity(event)}
              className="group bg-surface rounded-3xl border-2 border-border p-6 sm:p-7 flex flex-col justify-between hover:border-primary/60 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg space-y-6"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-primary/10 text-primary border border-primary/20">
                      #{event.rank} of Top 30
                    </span>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-surface-2 text-text-secondary border border-border capitalize">
                      {event.type.replace('_', ' ')}
                    </span>
                    {event.scope && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-surface-2 text-text-secondary border border-border capitalize">
                        {event.scope}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleTogglePlan(e, event.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      isSaved
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-2 border-border text-text-secondary hover:text-foreground'
                    }`}
                    title={isSaved ? 'In your plan' : 'Save to My Opportunity Plan'}
                    aria-label={isSaved ? 'In your plan' : 'Save to My Opportunity Plan'}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">
                    Organizer: <span className="text-foreground font-semibold">{event.organizer}</span>
                  </p>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                  {event.whatItIs}
                </p>

                {/* Key logistics row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-text-secondary">
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Duration</span>
                    <strong className="text-foreground">{event.duration}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Team Size</span>
                    <strong className="text-foreground">{event.teamSize || 'Solo / Team'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
                    <span className="text-[10px] text-muted block uppercase font-bold">Typical Window</span>
                    <strong className="text-foreground truncate block">{event.typicalWindow.replace('Typical window: ', '')}</strong>
                  </div>
                </div>

                {/* Resume bullet preview card */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Resume Presentation Formula
                    </span>
                    <button
                      onClick={(e) => handleCopyTemplate(e, event)}
                      className="text-[11px] font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {copiedId === event.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Formula</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-foreground bg-surface p-2.5 rounded-lg border border-border">
                    {event.resumePresentationTemplate}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Last verified: <strong className="text-foreground">{event.lastVerifiedAt}</strong>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                  <span>View Full Details & Checklist</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
