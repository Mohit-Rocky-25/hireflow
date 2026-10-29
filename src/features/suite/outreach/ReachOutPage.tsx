// ============================================================
// HireFlow Suite — Reach Out (Cold Outreach & Direct Mail Assistant)
// Governed by Evidence Base E1–E6 and Target Design D1–D6
// Features:
// - Zero Runtime Network Egress • Pure Client-Side Determinism
// - LinkedIn Free (200 Chars) / Premium (300 Chars) persistent toggle
// - Full Matrix Template Browser (85 Templates, G1–G9, 6 Recipient Types)
// - Required Slot Form with Inline Engine Specificity Validation
// - Live Word/Character Counter & Fit Status (Zero UI Arithmetic)
// - "Try Another Phrasing" Deterministic Variant Cycler (FNV-1a Hash)
// - Message Quality Checklist Panel (Blockers first, then Warnings)
// - Send Etiquette Guidance Checklist (Evidence E5 & E6)
// ============================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Copy,
  Check,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  Download,
  Mail,
  MessageSquare,
  Users,
  Clock,
  Search,
  Filter,
  GraduationCap,
  Rocket,
  Code2,
  RefreshCw,
  Zap,
  Award,
  Shield,
  RotateCcw,
  Sliders,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useProfile } from '../profile/ProfileContext';
import { COMPANIES } from '../../../pages/demo/talentLensData';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';

// Types & Engine
import {
  OutreachTemplateV2,
  OutreachSlotsV2,
  OutreachChannel,
  OutreachGoal,
  OutreachRecipientType,
  OutreachAngle,
  QualityFinding,
} from './types';
import { fitMessageToLength, LengthFitResult } from './engine/lengthFit';
import { runQualityChecker } from './engine/qualityChecker';
import { validateSlots, validateAdmiredWork, validateProofPoint } from './engine/validateSlots';
import { CHANNEL_PROFILES } from '../../../config/outreach';

// 85 Authored Templates from Stage 3
import templatesRaw from '../../../data/suite/outreach/templates.json';

const ALL_TEMPLATES = templatesRaw as OutreachTemplateV2[];

// LocalStorage Persistence Keys
const STORAGE_PREMIUM_KEY = 'hireflow:reachout:isPremiumLinkedIn';
const STORAGE_DRAFT_KEY = 'hireflow:reachout:draft_v2';
const STORAGE_TEMPLATE_KEY = 'hireflow:reachout:selectedTemplateId';

// Channel Navigation Meta
export interface ChannelMeta {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeCls: string;
  subtitle?: string;
}

export const CHANNEL_TABS: ChannelMeta[] = [
  {
    id: 'all',
    label: 'All Channels',
    shortLabel: 'All',
    icon: Sliders,
    badgeCls: 'bg-white/5 text-white/80 border-white/10',
  },
  {
    id: 'linkedin_connect',
    label: 'LinkedIn Connect',
    shortLabel: 'Connect',
    icon: MessageSquare,
    badgeCls: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40',
  },
  {
    id: 'linkedin_inmail',
    label: 'LinkedIn InMail',
    shortLabel: 'InMail',
    icon: Send,
    badgeCls: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40',
    subtitle: 'InMail needs Premium — or message after they accept',
  },
  {
    id: 'cold_email',
    label: 'Cold Email',
    shortLabel: 'Email',
    icon: Mail,
    badgeCls: 'bg-blue-950/30 text-blue-400 border-blue-800/40',
  },
  {
    id: 'warm_referral',
    label: 'Warm Referral',
    shortLabel: 'Referral',
    icon: Users,
    badgeCls: 'bg-amber-950/30 text-amber-400 border-amber-800/40',
  },
  {
    id: 'follow_up',
    label: 'Follow-Up',
    shortLabel: 'Follow-Up',
    icon: Clock,
    badgeCls: 'bg-purple-950/30 text-purple-400 border-purple-800/40',
  },
];

// Goal Display Dictionary
export const GOAL_LABELS: Record<string, string> = {
  G1: 'Introduce & Inquire',
  G2: 'Internal Referral Ask',
  G3: 'Focused Advice Inquiry',
  G4: 'Job Posting Response',
  G5: 'Share Technical Project',
  G6: 'Follow-Up (No Reply)',
  G7: 'Follow-Up After Applying',
  G8: 'Thank You Note',
  G9: 'Event / Hackathon Outreach',
};

// Default Fictional Indian Candidate Slots (Evidence H8)
const DEFAULT_SLOTS: OutreachSlotsV2 = {
  targetCompany: 'Razorpay',
  targetRole: 'Backend Engineering Intern',
  recipientName: 'Rahul Deshmukh',
  primarySkill: 'Go & PostgreSQL',
  admiredProject: 'the settlement reconciliation engine and public post-mortem',
  proofPoint: 'built Go distributed job queue handling 6,500 jobs/sec in reproducible benchmark',
  proofShort: 'built Go job queue (6.5k jobs/s)',
  college: 'National Institute of Technology Karnataka, Surathkal',
  portfolio: 'github.com/aarav-demo/pgqueue',
  followUpNewInfo: 'published reproducibility benchmarks and test harness',
  daysSince: 7,
  your_name: 'Aarav Menon',
  your_email: 'aarav.menon@example.com',
};

// Helper: Download text file
function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ReachOutPage() {
  const { profile } = useProfile();

  // 1. LinkedIn Free vs Premium Toggle (Evidence E1 & Decision D5)
  const [isPremiumLinkedIn, setIsPremiumLinkedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREMIUM_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleLinkedInMode = (premium: boolean) => {
    setIsPremiumLinkedIn(premium);
    try {
      localStorage.setItem(STORAGE_PREMIUM_KEY, String(premium));
    } catch {
      // safe fallback
    }
  };

  // 2. Draft Slots State (Local-only persistence per H1 & Stage 5.2)
  const [slots, setSlots] = useState<OutreachSlotsV2>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // safe fallback
    }
    return DEFAULT_SLOTS;
  });

  // Sync profile data if loaded
  useEffect(() => {
    if (profile?.identity?.name) {
      setSlots((prev) => ({
        ...prev,
        your_name: profile.identity.name,
        your_email: profile.identity.email || prev.your_email,
        college: profile.education?.[0]?.institution || prev.college,
      }));
    }
  }, [profile]);

  // Persist slot edits locally
  const handleSlotChange = (field: keyof OutreachSlotsV2, value: any) => {
    setSlots((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(updated));
      } catch {
        // quota ignore
      }
      return updated;
    });
  };

  // 3. Selection & Filtering State
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [filterRecipient, setFilterRecipient] = useState<string>('all');
  const [filterAngle, setFilterAngle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TEMPLATE_KEY);
      if (saved && ALL_TEMPLATES.some((t) => t.id === saved)) return saved;
    } catch {
      // ignore
    }
    return ALL_TEMPLATES[0]?.id || 'recruiter-direct-note';
  });

  const [variantIndex, setVariantIndex] = useState<number>(0);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);
  const [showProvenance, setShowProvenance] = useState<boolean>(false);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setVariantIndex(0);
    try {
      localStorage.setItem(STORAGE_TEMPLATE_KEY, id);
    } catch {
      // ignore
    }
  };

  // 4. Filter Templates
  const filteredTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter((t) => {
      if (selectedChannel !== 'all' && t.channel !== selectedChannel) return false;
      if (filterGoal !== 'all' && t.goal !== filterGoal) return false;
      if (filterRecipient !== 'all' && !t.recipientTypes.includes(filterRecipient as OutreachRecipientType)) return false;
      if (filterAngle !== 'all' && t.angle !== filterAngle) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesUse = t.whenToUse.toLowerCase().includes(query);
        const matchesAngle = t.angle.toLowerCase().includes(query);
        return matchesName || matchesUse || matchesAngle;
      }
      return true;
    });
  }, [selectedChannel, filterGoal, filterRecipient, filterAngle, searchQuery]);

  const selectedTemplate = useMemo(() => {
    return ALL_TEMPLATES.find((t) => t.id === selectedTemplateId) || ALL_TEMPLATES[0];
  }, [selectedTemplateId]);

  // 5. Pure Engine Derivations (ZERO UI ARITHMETIC - satisfies H4 and check:ui-math)
  const fitResult: LengthFitResult = useMemo(() => {
    if (!selectedTemplate) {
      return {
        body: '',
        charCount: 0,
        wordCount: 0,
        linkCount: 0,
        status: 'optimal',
        droppedBlocks: [],
        overflowAmount: 0,
        targetMax: 0,
        hardMax: 0,
      };
    }
    return fitMessageToLength(selectedTemplate, slots, variantIndex, { isPremiumLinkedIn });
  }, [selectedTemplate, slots, variantIndex, isPremiumLinkedIn]);

  const slotValidation = useMemo(() => {
    return validateSlots(slots, selectedTemplate?.requiredSlots || ['targetCompany', 'targetRole', 'recipientName']);
  }, [slots, selectedTemplate]);

  const admiredValidation = useMemo(() => {
    return validateAdmiredWork(slots.admiredProject || '');
  }, [slots.admiredProject]);

  const proofValidation = useMemo(() => {
    return validateProofPoint(slots.proofPoint || '');
  }, [slots.proofPoint]);

  const qualityFindings: QualityFinding[] = useMemo(() => {
    if (!selectedTemplate) return [];
    return runQualityChecker({
      body: fitResult.body,
      subject: fitResult.subject,
      channel: selectedTemplate.channel,
      relationship: selectedTemplate.relationship,
      maxLength: fitResult.hardMax,
      admiredProject: slots.admiredProject,
      proofPoint: slots.proofPoint,
      followUpNewInfo: slots.followUpNewInfo,
    });
  }, [selectedTemplate, slots, fitResult]);

  const blockers = useMemo(() => qualityFindings.filter((f: QualityFinding) => f.severity === 'BLOCK'), [qualityFindings]);
  const warnings = useMemo(() => qualityFindings.filter((f: QualityFinding) => f.severity === 'WARN'), [qualityFindings]);

  // "Try Another Phrasing" deterministic variant cycler (FNV-1a salt increment)
  const handleCycleVariant = () => {
    setVariantIndex((prev) => prev + 1);
  };

  // Copy helpers
  const handleCopyNote = async () => {
    try {
      await navigator.clipboard.writeText(fitResult.body);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopySubject = async () => {
    if (!fitResult.subject) return;
    try {
      await navigator.clipboard.writeText(fitResult.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset Reach Out data to default state? This will clear locally stored drafts.')) {
      setSlots(DEFAULT_SLOTS);
      setIsPremiumLinkedIn(false);
      try {
        localStorage.removeItem(STORAGE_DRAFT_KEY);
        localStorage.removeItem(STORAGE_PREMIUM_KEY);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-white/20">
      {/* ── Top Suite Navigation Bar ── */}
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="p-1.5 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              aria-label="Go back to Suite Tools"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-white">Reach Out</h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-volt/10 text-volt border border-volt/20">
                  v2.0 Deterministic
                </span>
              </div>
              <p className="text-xs text-white/50">
                Cold outreach assistant for Indian engineering students & freshers • Zero runtime network egress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* LinkedIn Account Tier Toggle (Evidence E1) */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-lg text-xs">
              <span className="text-white/50 px-2 font-medium">LinkedIn Limit:</span>
              <button
                type="button"
                onClick={() => toggleLinkedInMode(false)}
                className={`px-2.5 py-1 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  !isPremiumLinkedIn
                    ? 'bg-volt text-black font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
                aria-pressed={!isPremiumLinkedIn}
              >
                Free (200c)
              </button>
              <button
                type="button"
                onClick={() => toggleLinkedInMode(true)}
                className={`px-2.5 py-1 rounded font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  isPremiumLinkedIn
                    ? 'bg-volt text-black font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
                aria-pressed={isPremiumLinkedIn}
              >
                Premium (300c)
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetData}
              className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-rose-400 hover:border-rose-400/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              title="Reset inputs to clean defaults"
              aria-label="Reset Reach Out inputs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Subheader Notice on LinkedIn Quota & Evidence ── */}
      <div className="bg-white/[0.02] border-b border-white/5 px-4 py-2 text-xs text-white/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-volt shrink-0" />
            <span>
              <strong>Platform Notice:</strong> LinkedIn free accounts cap connection notes at 200 characters and 3–5
              notes/month. Check your LinkedIn app counter; limits change over time.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowProvenance(true)}
            className="text-volt hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
          >
            <span>Evidence & Provenance</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Channel Navigation Tabs ── */}
      <div className="border-b border-white/10 bg-black/40 px-4">
        <div className="max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-2 py-2">
          {CHANNEL_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = selectedChannel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedChannel(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  active
                    ? 'bg-white/10 text-white border-white/30 shadow-sm'
                    : 'text-white/60 border-transparent hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={active}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-volt' : 'text-white/40'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Responsive Grid Layout (360px Mobile to 1440px Desktop) ── */}
      <main className="max-w-7xl mx-auto w-full p-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: Template Catalog & Filter Controls (5 cols) ── */}
        <section
          className="lg:col-span-5 flex flex-col gap-4"
          aria-label="Template Library Browser"
        >
          {/* Filter Bar */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-3 flex flex-col gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by role, stack, or angle..."
                className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-white/40 uppercase block mb-1">Goal</label>
                <select
                  value={filterGoal}
                  onChange={(e) => setFilterGoal(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <option value="all">All Goals (G1–G9)</option>
                  {Object.entries(GOAL_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {k}: {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase block mb-1">Recipient</label>
                <select
                  value={filterRecipient}
                  onChange={(e) => setFilterRecipient(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <option value="all">All Recipients</option>
                  <option value="in-house recruiter">Recruiter</option>
                  <option value="hiring manager">Hiring Manager</option>
                  <option value="engineer or peer">Peer Engineer</option>
                  <option value="alumnus/alumna">Alumnus</option>
                  <option value="senior leader or founder">Founder / CTO</option>
                  <option value="campus/university relations">Campus Relations</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/40 uppercase block mb-1">Angle</label>
                <select
                  value={filterAngle}
                  onChange={(e) => setFilterAngle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <option value="all">All Angles</option>
                  <option value="project-led">Project-Led</option>
                  <option value="skill-led">Skill-Led</option>
                  <option value="shared-background-led">Shared Background</option>
                  <option value="curiosity-led">Curiosity-Led</option>
                  <option value="event-led">Event-Led</option>
                </select>
              </div>
            </div>
          </div>

          {/* Template Card Scroll List */}
          <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredTemplates.length === 0 ? (
              <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center text-white/50 text-xs">
                No outreach templates match your active filters. Try broadening your criteria.
              </div>
            ) : (
              filteredTemplates.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`text-left p-3 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                      isSelected
                        ? 'bg-[#181818] border-volt/60 shadow-lg ring-1 ring-volt/20'
                        : 'bg-[#111] border-white/10 hover:border-white/20 hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h2 className="text-xs font-semibold text-white tracking-tight">{tmpl.name}</h2>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/10 uppercase">
                        {tmpl.goal}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/60 line-clamp-2 mb-2 leading-relaxed">
                      {tmpl.whenToUse}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/5">
                        {tmpl.channel.replace('_', ' ')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-volt/10 text-volt border border-volt/20">
                        {tmpl.angle}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">
                        {tmpl.relationship}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Template Architecture Details */}
          {selectedTemplate && (
            <div className="bg-[#111] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-semibold text-white/90">Template Strategy</span>
                <span className="text-white/40 text-[10px] uppercase font-mono">
                  Reviewed: {selectedTemplate.lastReviewed}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-volt uppercase block mb-0.5">Why this works</span>
                <p className="text-white/70 leading-relaxed text-[11px]">{selectedTemplate.whyItWorks}</p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-rose-400 uppercase block mb-0.5">When not to use</span>
                <p className="text-white/60 leading-relaxed text-[11px]">{selectedTemplate.whenNotToUse}</p>
              </div>

              {selectedTemplate.risks.length > 0 && (
                <div>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase block mb-0.5">Tradeoffs & Risks</span>
                  <ul className="list-disc list-inside text-white/50 text-[11px] space-y-0.5">
                    {selectedTemplate.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Right Column: Interactive Editor, Preview & Quality Panel (7 cols) ── */}
        <section
          className="lg:col-span-7 flex flex-col gap-5"
          aria-label="Outreach Editor & Live Output"
        >
          {/* Live Message Output Canvas */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            {/* Header Readout Strip (Zero UI Math - fits directly from engine) */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Live Assembled Note
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  (Variant #{variantIndex})
                </span>
              </div>

              {/* Status & Counter Badge */}
              <div
                className="flex items-center gap-2"
                aria-live="polite"
              >
                <div
                  className={`text-xs font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                    fitResult.status === 'optimal'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                      : fitResult.status === 'warning'
                      ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                      : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                  }`}
                >
                  <span className="font-semibold">
                    {selectedTemplate.channel === 'linkedin_connect'
                      ? `${fitResult.charCount} / ${fitResult.hardMax} chars`
                      : `${fitResult.wordCount} words (Target: ${fitResult.targetMax})`}
                  </span>
                  <span className="text-[10px] uppercase opacity-80">• {fitResult.status}</span>
                </div>
              </div>
            </div>

            {/* Dropped Blocks Notice if trimmed for length */}
            {fitResult.droppedBlocks.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-2 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Auto-trimmed optional block ({fitResult.droppedBlocks.join(', ')}) to satisfy platform character ceiling without mid-word cuts.
                </span>
              </div>
            )}

            {/* Subject Line Field (Email & InMail only) */}
            {fitResult.subject && (
              <div className="bg-black/60 border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Subject Line</span>
                  <span className="text-xs text-white font-medium truncate block">{fitResult.subject}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="px-2.5 py-1 text-xs rounded border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors shrink-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  aria-label="Copy Subject Line"
                >
                  {copiedSubject ? <Check className="w-3.5 h-3.5 text-volt" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSubject ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {/* Assembled Body Text Canvas */}
            <div
              className="bg-black border border-white/10 rounded-lg p-4 font-mono text-xs leading-relaxed text-white/90 whitespace-pre-wrap select-text min-h-[140px] focus:outline-none focus:ring-1 focus:ring-volt/50"
              tabIndex={0}
              aria-label="Assembled Outreach Message Preview"
            >
              {fitResult.body}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleCycleVariant}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                title="Cycles wording variants deterministically using stable FNV-1a hash"
              >
                <RefreshCw className="w-3.5 h-3.5 text-volt" />
                <span>Try another phrasing</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadTextFile(`${selectedTemplate.id}-draft.txt`, fitResult.subject ? `Subject: ${fitResult.subject}\n\n${fitResult.body}` : fitResult.body)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  aria-label="Download message as .txt file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download (.txt)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyNote}
                  className="px-4 py-1.5 rounded-lg bg-volt text-black font-semibold text-xs transition-all hover:bg-volt/90 flex items-center gap-1.5 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Copy assembled message body to clipboard"
                >
                  {copiedNote ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNote ? 'Copied to Clipboard' : 'Copy Message'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Inline Slot Input Form (Strictly Validated by Engine) ── */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div>
                <h3 className="text-xs font-semibold text-white">Recipient & Evidence Slots</h3>
                <p className="text-[11px] text-white/50">Required fields marked with (*). Engine rejects generic flattery.</p>
              </div>
              <span className="text-[10px] font-mono uppercase text-volt">Instant Reactive Sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Recipient Name */}
              <div>
                <label className="text-white/70 block mb-1 font-medium">
                  Recipient Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={slots.recipientName || ''}
                  onChange={(e) => handleSlotChange('recipientName', e.target.value)}
                  placeholder="e.g. Rahul Deshmukh or Dr. Srinivasan"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              {/* Target Company */}
              <div>
                <label className="text-white/70 block mb-1 font-medium">
                  Target Company <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={slots.targetCompany || ''}
                  onChange={(e) => handleSlotChange('targetCompany', e.target.value)}
                  placeholder="e.g. Finlo Technologies"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              {/* Target Role */}
              <div>
                <label className="text-white/70 block mb-1 font-medium">
                  Target Role <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={slots.targetRole || ''}
                  onChange={(e) => handleSlotChange('targetRole', e.target.value)}
                  placeholder="e.g. Backend Engineering Intern"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              {/* Primary Skill */}
              <div>
                <label className="text-white/70 block mb-1 font-medium">
                  Primary Skill / Core Stack <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={slots.primarySkill || ''}
                  onChange={(e) => handleSlotChange('primarySkill', e.target.value)}
                  placeholder="e.g. Go & PostgreSQL"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              {/* What specifically about their work? (admiredProject) */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/70 font-medium">
                    What specifically about their work? (No generic flattery)
                  </label>
                  {!admiredValidation.valid && slots.admiredProject && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Generic phrase rejected
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={slots.admiredProject || ''}
                  onChange={(e) => handleSlotChange('admiredProject', e.target.value)}
                  placeholder="e.g. the technical post-mortem on your zero-downtime replication failover"
                  className={`w-full bg-black border rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                    !admiredValidation.valid && slots.admiredProject ? 'border-rose-500/80' : 'border-white/10'
                  }`}
                />
                <div className="flex items-center justify-between text-[10px] text-white/40 mt-1">
                  <span>Good: "the zero-downtime database failover"</span>
                  <span className="text-rose-400/80">Bad: "your great company / amazing culture"</span>
                </div>
              </div>

              {/* Quantified Proof Point */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-white/70 font-medium">
                    Quantified Proof Point (Verifiable project result or benchmark)
                  </label>
                  {!proofValidation.valid && slots.proofPoint && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Needs quantified evidence
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={slots.proofPoint || ''}
                  onChange={(e) => handleSlotChange('proofPoint', e.target.value)}
                  placeholder="e.g. built Go distributed job queue handling 6,500 jobs/sec in benchmark"
                  className={`w-full bg-black border rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                    !proofValidation.valid && slots.proofPoint ? 'border-rose-500/80' : 'border-white/10'
                  }`}
                />
                <div className="flex items-center justify-between text-[10px] text-white/40 mt-1">
                  <span>Good: "built Go queue (6.5k jobs/s)"</span>
                  <span className="text-rose-400/80">Bad: "I know Go and PostgreSQL"</span>
                </div>
              </div>

              {/* College & Portfolio */}
              <div>
                <label className="text-white/70 block mb-1 font-medium">College / Alma Mater</label>
                <input
                  type="text"
                  value={slots.college || ''}
                  onChange={(e) => handleSlotChange('college', e.target.value)}
                  placeholder="e.g. NIT Warangal"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1 font-medium">Portfolio / Repository Link</label>
                <input
                  type="text"
                  value={slots.portfolio || ''}
                  onChange={(e) => handleSlotChange('portfolio', e.target.value)}
                  placeholder="e.g. github.com/myname/project"
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              {/* Follow-Up Specific Fields (Prominent when follow-up selected) */}
              {(selectedTemplate.channel === 'follow_up' || selectedTemplate.goal === 'G6' || selectedTemplate.goal === 'G7') && (
                <div className="md:col-span-2 bg-purple-950/20 border border-purple-800/40 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-300">
                      Follow-Up Integrity Constraint (Evidence E6)
                    </span>
                    <span className="text-[10px] font-mono text-purple-400">Strictly Requires New Evidence</span>
                  </div>
                  <div>
                    <label className="text-white/80 block mb-1 font-medium">
                      What new progress or benchmark did you achieve? <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={slots.followUpNewInfo || ''}
                      onChange={(e) => handleSlotChange('followUpNewInfo', e.target.value)}
                      placeholder="e.g. published reproducibility benchmark and open-source test harness"
                      className="w-full bg-black border border-purple-800/50 rounded px-2.5 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Message Quality Checklist Panel (Blockers First) ── */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-volt" />
                <h3 className="text-xs font-semibold text-white">Message Quality & Honesty Checklist</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className={blockers.length > 0 ? 'text-rose-400 font-bold' : 'text-white/40'}>
                  {blockers.length} Blockers
                </span>
                <span>•</span>
                <span className={warnings.length > 0 ? 'text-amber-400' : 'text-white/40'}>
                  {warnings.length} Warnings
                </span>
              </div>
            </div>

            {/* Checklist findings */}
            <div className="flex flex-col gap-2">
              {blockers.map((b: QualityFinding, i: number) => (
                <div
                  key={`blk-${i}`}
                  className="bg-rose-950/20 border border-rose-800/40 rounded-lg p-2.5 text-xs text-rose-300 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-200">{b.message}</strong>
                    <span className="text-[11px] text-rose-300/80 mt-0.5 block">{b.fix}</span>
                  </div>
                </div>
              ))}

              {warnings.map((w: QualityFinding, i: number) => (
                <div
                  key={`wrn-${i}`}
                  className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-2.5 text-xs text-amber-300 flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-amber-200">{w.message}</strong>
                    <span className="text-[11px] text-amber-300/80 mt-0.5 block">{w.fix}</span>
                  </div>
                </div>
              ))}

              {qualityFindings.length === 0 && (
                <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    All quality and honesty checks passed. Message is quantified, specific, and adheres to platform limits.
                  </span>
                </div>
              )}
            </div>

            {/* Etiquette Checklist per Evidence E5 & E6 */}
            <div className="bg-black/50 border border-white/5 rounded-lg p-3 text-[11px] text-white/50 flex flex-col gap-1.5 mt-1">
              <span className="text-white/70 font-semibold uppercase text-[10px] tracking-wider">
                Outreach Etiquette Checklist
              </span>
              <ul className="space-y-1">
                <li>• Verify the recipient's identity and active team before clicking send.</li>
                <li>• Send to one person at a time — mass BCC or script blasts damage your sender reputation.</li>
                <li>• Send from your authentic personal email or LinkedIn profile.</li>
                <li>• Follow-up pacing: wait 5–7 days before your first follow-up; send at most 2 follow-ups total.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* ── Data Provenance Modal ── */}
      <DataProvenanceModal
        isOpen={showProvenance}
        onClose={() => setShowProvenance(false)}
        defaultTab="engine-logic"
      />
    </div>
  );
}
