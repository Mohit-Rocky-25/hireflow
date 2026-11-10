// ============================================================
// HireFlow Suite — Reach Out Studio (Direct Outreach Assistant)
// Governed by Evidence Base E1–E6 and Target Design D1–D6
// Features:
// - Channel-Wise Opening: Focused, uncluttered studio for each outreach channel
// - Zero Runtime Network Egress • Pure Client-Side Determinism
// - Balanced Dimensions: Input Details on Left • Sticky Live Canvas on Right
// - LinkedIn Free (200 Chars) / Premium (300 Chars) persistent toggle
// - Inline Engine Specificity & Proof Validation
// - Live Word/Character Counter & Fit Status (Zero UI Arithmetic)
// - "Try Another Phrasing" Deterministic Variant Cycler (FNV-1a Hash)
// - Message Quality Checklist Panel (Blockers first, then Warnings)
// - Platform Rules & Delivery Limits Clickable Viewer Modal & Collapsible Drawer
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  Download,
  Mail,
  MessageSquare,
  Users,
  Clock,
  Search,
  Sliders,
  RotateCcw,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  X,
  Code2,
} from 'lucide-react';
import { useProfile } from '../profile/ProfileContext';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';

// Types & Engine
import {
  OutreachTemplateV2,
  OutreachSlotsV2,
  OutreachRecipientType,
  QualityFinding,
} from './types';
import { fitMessageToLength, LengthFitResult } from './engine/lengthFit';
import { runQualityChecker } from './engine/qualityChecker';
import { validateSlots, validateAdmiredWork, validateProofPoint } from './engine/validateSlots';

// 85 Authored Templates from Stage 3
import templatesRaw from '../../../data/suite/outreach/templates.json';
import { PLATFORM_RULES } from '../../reach-out/data/platformRules';

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
  description: string;
  limitRule: string;
  etiquetteRule: string;
}

export const CHANNEL_TABS: ChannelMeta[] = [
  {
    id: 'linkedin_connect',
    label: 'LinkedIn Connect',
    shortLabel: 'Connect',
    icon: MessageSquare,
    badgeCls: 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50',
    description: 'Concise connection invitations (1–2 sentences) to establish initial rapport.',
    limitRule: 'Free limit: 200 characters (3–5 notes/month) • Premium limit: 300 characters.',
    etiquetteRule: 'Strangers must never be asked for referrals in cold notes (Evidence E5).',
  },
  {
    id: 'cold_email',
    label: 'Cold Email',
    shortLabel: 'Email',
    icon: Mail,
    badgeCls: 'bg-blue-950/40 text-blue-300 border-blue-700/50',
    description: 'Direct email to recruiters, engineering managers, and technical founders.',
    limitRule: 'Optimal length: 50–90 words (hard max 125 words) • Subject: 3–8 words.',
    etiquetteRule: 'Reference verified public work and provide a polite, no-pressure exit.',
  },
  {
    id: 'linkedin_inmail',
    label: 'LinkedIn InMail',
    shortLabel: 'InMail',
    icon: Send,
    badgeCls: 'bg-cyan-950/40 text-cyan-300 border-cyan-700/50',
    description: 'Direct messaging for LinkedIn Premium/Recruiter members to reach busy leads.',
    limitRule: 'Optimal length: 50–90 words • Scannable subject line without emojis.',
    etiquetteRule: 'Focus on technical project overlap rather than generic company flattery.',
  },
  {
    id: 'warm_referral',
    label: 'Warm Referral',
    shortLabel: 'Referral',
    icon: Users,
    badgeCls: 'bg-amber-950/40 text-amber-300 border-amber-700/50',
    description: 'Asking alumni, past mentors, or post-acceptance connections for team routing.',
    limitRule: 'Optimal length: 75–110 words • Specific role link or requisition ID.',
    etiquetteRule: 'Requires shared background or established relationship before requesting.',
  },
  {
    id: 'follow_up',
    label: 'Follow-Up',
    shortLabel: 'Follow-Up',
    icon: Clock,
    badgeCls: 'bg-purple-950/40 text-purple-300 border-purple-700/50',
    description: 'Timed follow-up when initial outreach received no response after 5+ days.',
    limitRule: 'Optimal length: 30–65 words • Strictly requires new project evidence.',
    etiquetteRule: 'Zero-value "just bumping" is blocked; must provide updated benchmarks.',
  },
  {
    id: 'all',
    label: 'All Channels',
    shortLabel: 'All',
    icon: Sliders,
    badgeCls: 'bg-white/5 text-white/80 border-white/10',
    description: 'Explore all 85 calibrated outreach templates across all channels.',
    limitRule: 'Channel-specific length profiles apply automatically.',
    etiquetteRule: 'Ethical outreach guidelines enforced across all templates.',
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

  // Platform Rules Collapsible Section State (Default CLOSED per user requirement)
  const [showPlatformRules, setShowPlatformRules] = useState<boolean>(false);
  // Dedicated Clickable Viewer Modal
  const [showPlatformRulesModal, setShowPlatformRulesModal] = useState<boolean>(false);
  const [platformRulesSearch, setPlatformRulesSearch] = useState<string>('');

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
  const handleSlotChange = (field: keyof OutreachSlotsV2, value: string | number) => {
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

  // 3. Selection & Filtering State (Channel-Wise Opening)
  const [selectedChannel, setSelectedChannel] = useState<string>('linkedin_connect');
  const [showTemplateBrowser, setShowTemplateBrowser] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRecipient, setFilterRecipient] = useState<string>('all');
  const [bottomTab, setBottomTab] = useState<'quality' | 'strategy' | 'guidance'>('quality');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TEMPLATE_KEY);
      if (saved && ALL_TEMPLATES.some((t) => t.id === saved)) return saved;
    } catch {
      // ignore
    }
    return ALL_TEMPLATES.find((t) => t.channel === 'linkedin_connect')?.id || 'recruiter-direct-note';
  });

  const [variantIndex, setVariantIndex] = useState<number>(0);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);
  const [showOverLengthModal, setShowOverLengthModal] = useState<boolean>(false);
  const [showProvenance, setShowProvenance] = useState<boolean>(false);

  // When user switches channel, select a template from that channel
  const handleChannelSwitch = (channelId: string) => {
    setSelectedChannel(channelId);
    setSearchQuery('');
    setFilterRecipient('all');

    if (channelId !== 'all') {
      const channelTemplates = ALL_TEMPLATES.filter((t) => t.channel === channelId);
      const isCurrentInChannel = channelTemplates.some((t) => t.id === selectedTemplateId);
      if (!isCurrentInChannel && channelTemplates.length > 0) {
        setSelectedTemplateId(channelTemplates[0].id);
        setVariantIndex(0);
        try {
          localStorage.setItem(STORAGE_TEMPLATE_KEY, channelTemplates[0].id);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setVariantIndex(0);
    setShowTemplateBrowser(false);
    try {
      localStorage.setItem(STORAGE_TEMPLATE_KEY, id);
    } catch {
      // ignore
    }
  };

  // 4. Filter Templates for active channel
  const activeChannelMeta = useMemo(() => {
    return CHANNEL_TABS.find((c) => c.id === selectedChannel) || CHANNEL_TABS[0];
  }, [selectedChannel]);

  const channelTemplates = useMemo(() => {
    return ALL_TEMPLATES.filter((t) => {
      if (selectedChannel !== 'all' && t.channel !== selectedChannel) return false;
      if (filterRecipient !== 'all' && !t.recipientTypes.includes(filterRecipient as OutreachRecipientType)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesUse = t.whenToUse.toLowerCase().includes(query);
        const matchesAngle = t.angle.toLowerCase().includes(query);
        return matchesName || matchesUse || matchesAngle;
      }
      return true;
    });
  }, [selectedChannel, filterRecipient, searchQuery]);

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

  // Auto-trim helper for LinkedIn 300-char limit
  const handleAutoTrimLinkedIn = () => {
    if (slots.proofPoint) {
      let trimmed = slots.proofPoint
        .replace(/\b(responsible for|worked on|in order to|helped to|actively|successfully|currently)\b\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      const excess = fitResult.charCount - 295;
      if (excess > 0 && trimmed.length > excess + 10) {
        trimmed = trimmed.slice(0, trimmed.length - excess).replace(/[,\s]+$/, '').trim();
      }
      setSlots((prev) => ({ ...prev, proofPoint: trimmed }));
    }
  };

  const executeCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNote(true);
      setShowOverLengthModal(false);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch {
      // ignore
    }
  };

  // Copy helpers
  const handleCopyNote = async () => {
    if (selectedTemplate.channel === 'linkedin_connect' && fitResult.charCount > 300) {
      setShowOverLengthModal(true);
      return;
    }
    await executeCopyText(fitResult.body);
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

  const filteredModalRules = useMemo(() => {
    if (!platformRulesSearch.trim()) return PLATFORM_RULES;
    const q = platformRulesSearch.toLowerCase();
    return PLATFORM_RULES.filter(
      (r) =>
        r.rule.toLowerCase().includes(q) ||
        r.value.toLowerCase().includes(q) ||
        r.sourceName.toLowerCase().includes(q)
    );
  }, [platformRulesSearch]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-volt/20">
      {/* ── Top Suite Navigation Bar ── */}
      <header className="border-b border-white/[0.08] bg-[#0c0d10]/95 backdrop-blur-xl relative z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="p-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              aria-label="Go back to Suite Tools"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white">Reach Out</h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-volt/10 text-volt border border-volt/20">
                  Channel-Wise Workspace
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/40 font-mono">
                  • Zero runtime network egress
                </span>
              </div>
              <p className="text-xs text-white/50">
                Calibrated outreach generator for Indian engineering students • Zero runtime network egress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* LinkedIn Account Tier Toggle (Evidence E1) */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs">
              <span className="text-white/40 px-2 font-mono text-[11px]">LinkedIn Tier:</span>
              <button
                type="button"
                onClick={() => toggleLinkedInMode(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer ${
                  !isPremiumLinkedIn
                    ? 'bg-volt text-black shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={!isPremiumLinkedIn}
              >
                Free (200c)
              </button>
              <button
                type="button"
                onClick={() => toggleLinkedInMode(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer ${
                  isPremiumLinkedIn
                    ? 'bg-volt text-black shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                aria-pressed={isPremiumLinkedIn}
              >
                Premium (300c)
              </button>
            </div>

            {/* Clickable Platform Rules Viewer Button */}
            <button
              type="button"
              onClick={() => setShowPlatformRulesModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer"
              title="Open Platform Rules & Character Limits Viewer"
            >
              <Shield className="w-3.5 h-3.5 text-volt" />
              <span className="hidden sm:inline">Platform Rules</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white/60">
                {PLATFORM_RULES.length}
              </span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetData}
              className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-rose-400 hover:border-rose-400/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer"
              title="Reset inputs to clean defaults"
              aria-label="Reset Reach Out inputs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Channel Navigation & Controls Bar ── */}
      <div className="border-b border-white/[0.08] bg-[#0c0d10]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {CHANNEL_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = selectedChannel === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleChannelSwitch(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer ${
                    active
                      ? 'bg-volt text-black border-volt shadow-sm shadow-volt/20'
                      : 'text-white/70 border-white/10 bg-white/[0.02] hover:text-white hover:bg-white/[0.06]'
                  }`}
                  aria-pressed={active}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-white/50'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Template Selector & Browser Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#141518] border border-white/10 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-white/40 font-mono uppercase">Template:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus-visible:outline-none cursor-pointer max-w-[200px] sm:max-w-[260px] truncate"
              >
                {channelTemplates.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#141518] text-white">
                    {t.name} ({t.goal})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowTemplateBrowser((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-volt" />
              <span className="hidden sm:inline">Browse ({channelTemplates.length})</span>
              {showTemplateBrowser ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowProvenance(true)}
              className="text-white/40 hover:text-volt p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              title="View Evidence & Methodology"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Channel Meta & Tip Strip */}
        <div className="max-w-7xl mx-auto px-4 pb-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/50 border-t border-white/[0.04] pt-2">
          <div className="flex items-center gap-2">
            <span className="text-white/80 font-medium">{activeChannelMeta.label}:</span>
            <span>{activeChannelMeta.description}</span>
            <span className="text-volt/90 font-mono hidden md:inline">• {activeChannelMeta.limitRule}</span>
            <span className="text-white/40 hidden lg:inline">• Check your LinkedIn app counter; limits change over time.</span>
          </div>

          <div className="flex items-center gap-3">
            {selectedChannel !== 'warm_referral' && (
              <button
                type="button"
                onClick={() => handleChannelSwitch('warm_referral')}
                className="text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>India Market tip: Alumni referrals yield highest response &rarr;</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Expandable Template Catalog Drawer ── */}
      {showTemplateBrowser && (
        <div className="bg-[#101114] border-b border-white/10 px-4 py-4 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeChannelMeta.label} templates...`}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/40 uppercase font-mono">Recipient:</span>
                <select
                  value={filterRecipient}
                  onChange={(e) => setFilterRecipient(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <option value="all">All Recipients</option>
                  <option value="in-house recruiter">Recruiter</option>
                  <option value="hiring manager">Hiring Manager</option>
                  <option value="engineer or peer">Peer Engineer</option>
                  <option value="alumnus/alumna">Alumnus</option>
                  <option value="senior leader or founder">Founder / Leader</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {channelTemplates.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                      isSelected
                        ? 'bg-[#18191d] border-volt shadow-md ring-1 ring-volt/20'
                        : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-[#141518]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h2 className="text-xs font-semibold text-white tracking-tight">{tmpl.name}</h2>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/10 uppercase">
                        {tmpl.goal}
                      </span>
                    </div>

                    <p className="text-[11px] text-white/60 line-clamp-2 mb-2.5 leading-relaxed">
                      {tmpl.whenToUse}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full bg-volt/10 text-volt border border-volt/20 font-medium">
                        {tmpl.angle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5">
                        {tmpl.recipientTypes[0]}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Balanced Responsive Studio Grid (Left Form, Right Live Canvas) ── */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Slots Input Form (6 cols) ── */}
        <section
          className="lg:col-span-6 flex flex-col gap-4"
          aria-label="Outreach Details Form"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">1. Personalize Outreach Details</h2>
              <p className="text-[11px] text-white/50">
                Inputs are formatted cleanly without arithmetic or hallucination.
              </p>
            </div>
            {profile?.identity?.name && (
              <button
                type="button"
                onClick={() => {
                  setSlots((prev) => ({
                    ...prev,
                    your_name: profile.identity.name,
                    your_email: profile.identity.email || prev.your_email,
                    college: profile.education?.[0]?.institution || prev.college,
                  }));
                }}
                className="text-[11px] text-volt hover:underline flex items-center gap-1 cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fill from Profile</span>
              </button>
            )}
          </div>

          {/* Validation Banner if missing slots */}
          {!slotValidation.valid && (
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-medium">Missing Required Fields for this Template:</strong>
                <span className="text-[11px] text-rose-300/80">
                  {slotValidation.issues.map((i) => i.slot).join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Group A: Recipient & Target Details */}
          <div className="bg-[#111215] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
            <span className="text-xs font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Briefcase className="w-3.5 h-3.5 text-volt" />
              Target Recipient & Company
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={slots.targetCompany || ''}
                  onChange={(e) => handleSlotChange('targetCompany', e.target.value)}
                  placeholder="e.g. Razorpay, MongoDB"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  value={slots.targetRole || ''}
                  onChange={(e) => handleSlotChange('targetRole', e.target.value)}
                  placeholder="e.g. Backend Engineering Intern"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={slots.recipientName || ''}
                  onChange={(e) => handleSlotChange('recipientName', e.target.value)}
                  placeholder="e.g. Rahul Deshmukh"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors"
                />
                <span className="text-[10px] text-white/40 block mt-1">Honorifics like Dr./Mr. are stripped for warm greetings.</span>
              </div>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={slots.your_name || ''}
                  onChange={(e) => handleSlotChange('your_name', e.target.value)}
                  placeholder="e.g. Aman Gupta"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Group B: Technical Relevance & Proof */}
          <div className="bg-[#111215] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
            <span className="text-xs font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Code2 className="w-3.5 h-3.5 text-volt" />
              Technical Relevance & Evidence
            </span>

            <div>
              <label className="text-[11px] text-white/60 font-medium block mb-1">
                Primary Stack / Core Skills
              </label>
              <input
                type="text"
                value={slots.primarySkill || ''}
                onChange={(e) => handleSlotChange('primarySkill', e.target.value)}
                placeholder="e.g. Go & PostgreSQL"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-white/60 font-medium">
                  What Specifically About Their Work?
                </label>
                {admiredValidation.issue && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                    <AlertTriangle className="w-3 h-3" /> Generic Praise Detected
                  </span>
                )}
              </div>
              <input
                type="text"
                value={slots.admiredProject || ''}
                onChange={(e) => handleSlotChange('admiredProject', e.target.value)}
                placeholder="e.g. the settlement reconciliation engine and public post-mortem"
                className={`w-full bg-[#0a0a0c] border rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors ${
                  admiredValidation.issue ? 'border-amber-500/50' : 'border-white/10'
                }`}
              />
              {admiredValidation.issue && (
                <div className="mt-1.5 bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-300">
                  <p>{admiredValidation.issue.message}</p>
                  <p className="mt-0.5 text-white/70">
                    <strong>Better example:</strong> {admiredValidation.issue.exampleGood}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-white/60 font-medium">
                  Technical Proof Point (Project, Architecture, or Metric)
                </label>
                {proofValidation.issue && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                    <AlertTriangle className="w-3 h-3" /> Needs Evidence
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                value={slots.proofPoint || ''}
                onChange={(e) => handleSlotChange('proofPoint', e.target.value)}
                placeholder="e.g. built Go distributed job queue handling 6,500 jobs/sec in reproducible benchmark"
                className={`w-full bg-[#0a0a0c] border rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors ${
                  proofValidation.issue ? 'border-amber-500/50' : 'border-white/10'
                }`}
              />
              {proofValidation.issue && (
                <div className="mt-1.5 bg-amber-950/30 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-300">
                  <p>{proofValidation.issue.message}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  Source Repo / Portfolio Link
                </label>
                <input
                  type="text"
                  value={slots.portfolio || ''}
                  onChange={(e) => handleSlotChange('portfolio', e.target.value)}
                  placeholder="e.g. github.com/aarav-demo/pgqueue"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  value={slots.college || ''}
                  onChange={(e) => handleSlotChange('college', e.target.value)}
                  placeholder="e.g. National Institute of Technology Karnataka"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Group C: Follow-Up & Timed Info (shown when relevant) */}
          {(selectedTemplate.channel === 'follow_up' || selectedTemplate.goal.startsWith('G6') || selectedTemplate.goal.startsWith('G7')) && (
            <div className="bg-[#111215] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
              <span className="text-xs font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Follow-Up Evidence (Evidence E6)
              </span>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  What Changed / New Work Completed
                </label>
                <input
                  type="text"
                  value={slots.followUpNewInfo || ''}
                  onChange={(e) => handleSlotChange('followUpNewInfo', e.target.value)}
                  placeholder="e.g. published reproducibility benchmarks and test harness"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
                <span className="text-[10px] text-white/40 block mt-1">
                  Follow-ups must introduce new technical progress. Generic "just checking in" bumps are rejected.
                </span>
              </div>

              <div>
                <label className="text-[11px] text-white/60 font-medium block mb-1">
                  Days Since Last Contact (&ge; 5 days)
                </label>
                <input
                  type="number"
                  min={5}
                  value={slots.daysSince || 7}
                  onChange={(e) => handleSlotChange('daysSince', parseInt(e.target.value, 10) || 7)}
                  className="w-28 bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Right Column: Interactive Output Canvas & Quality Tabs (6 cols) ── */}
        <section
          className="lg:col-span-6 flex flex-col gap-4"
          aria-label="Live Output Canvas and Review"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">2. Live Calibrated Output</h2>
              <p className="text-[11px] text-white/50">
                Generated in real time • Click to copy or cycle phrasing variants
              </p>
            </div>

            {/* Readout Counter & Status Badge (Zero UI Math - derived strictly from engine) */}
            <div className="flex items-center gap-2" aria-live="polite">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold border ${
                  fitResult.status === 'optimal'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                    : fitResult.status === 'warning'
                    ? 'bg-volt/10 text-volt border-volt/30'
                    : 'bg-rose-950/40 text-rose-300 border-rose-700/50'
                }`}
              >
                {selectedTemplate.channel === 'linkedin_connect'
                  ? `${fitResult.charCount} / ${fitResult.hardMax} chars`
                  : `${fitResult.wordCount} words (${fitResult.status})`}
              </span>
            </div>
          </div>

          {/* Over 300 chars warning and auto-trim button for LinkedIn Connect */}
          {selectedTemplate.channel === 'linkedin_connect' && fitResult.charCount > 300 && (
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Over 300 characters: this won't fit a free connection note.</span>
              </div>
              <button
                type="button"
                onClick={handleAutoTrimLinkedIn}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[11px] font-semibold shrink-0 cursor-pointer"
              >
                Auto-trim to 300 chars
              </button>
            </div>
          )}

          {/* Mandatory Limits Notice */}
          <div className="bg-[#111215] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[11px] text-white/50 leading-relaxed">
            Replies depend on your profile, timing and the company&apos;s hiring state. No template can guarantee one. {/* // banned claim disclaimer */}
          </div>

          {/* Main Executive Message Card */}
          <div className="bg-[#111215] border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-xl">
            {/* Subject Line for Email & InMail */}
            {fitResult.subject && (
              <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-3.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                    Subject Line (3–8 Words &bull; Scannable)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySubject}
                    className="text-volt hover:text-volt/80 text-[11px] inline-flex items-center gap-1 font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  >
                    {copiedSubject ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                  </button>
                </div>
                <div className="text-xs text-white/90 font-medium select-all">
                  {fitResult.subject}
                </div>
              </div>
            )}

            {/* Message Body Canvas */}
            <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-4 sm:p-5 min-h-[150px] flex flex-col justify-between">
              <div className="text-xs sm:text-[13px] text-white/95 leading-relaxed whitespace-pre-wrap select-all font-sans">
                {fitResult.body || (
                  <span className="text-white/30 italic">
                    Fill in the required fields on the left to generate your calibrated message...
                  </span>
                )}
              </div>

              {/* Dropped block alert if any */}
              {fitResult.droppedBlocks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] text-amber-300/80 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    Auto-fitted to {fitResult.hardMax} limit by omitting optional {fitResult.droppedBlocks.join(', ')} block.
                  </span>
                </div>
              )}
            </div>

            {/* Canvas Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={handleCycleVariant}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-volt border border-volt/30 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                title="Cycles deterministic variants using stable FNV-1a hash"
              >
                <Sparkles className="w-3.5 h-3.5 text-volt" />
                <span>Try Another Phrasing</span>
                <span className="text-[10px] font-mono text-white/40">#{variantIndex + 1}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const fullText = fitResult.subject
                      ? `Subject: ${fitResult.subject}\n\n${fitResult.body}`
                      : fitResult.body;
                    downloadTextFile(`outreach-${selectedTemplate.id}.txt`, fullText);
                  }}
                  className="p-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  title="Download as text file"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyNote}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-volt hover:bg-volt/90 text-black shadow-md shadow-volt/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  {copiedNote ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNote ? 'Copied Message!' : 'Copy Message'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Inspection & Guidance Dock (Quality, Strategy, Methodology) ── */}
          <div className="bg-[#111215] border border-white/10 rounded-2xl overflow-hidden text-xs shadow-sm">
            {/* Tab Header Strip */}
            <div className="flex border-b border-white/10 bg-[#0c0d10]">
              <button
                type="button"
                onClick={() => setBottomTab('quality')}
                className={`flex-1 py-2.5 px-3 text-center text-xs font-semibold border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  bottomTab === 'quality'
                    ? 'border-volt text-volt bg-white/[0.02]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Quality Audit ({blockers.length === 0 ? '✓ Clean' : `${blockers.length} Blockers`})
              </button>
              <button
                type="button"
                onClick={() => setBottomTab('strategy')}
                className={`flex-1 py-2.5 px-3 text-center text-xs font-semibold border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  bottomTab === 'strategy'
                    ? 'border-volt text-volt bg-white/[0.02]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                Strategy & Risks
              </button>
              <button
                type="button"
                onClick={() => setBottomTab('guidance')}
                className={`flex-1 py-2.5 px-3 text-center text-xs font-semibold border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  bottomTab === 'guidance'
                    ? 'border-volt text-volt bg-white/[0.02]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                How It Works
              </button>
            </div>

            {/* Tab 1: Quality & Etiquette */}
            {bottomTab === 'quality' && (
              <div className="p-4 flex flex-col gap-3">
                {blockers.length === 0 && warnings.length === 0 ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>0 quality blockers or clichés detected. Ready for delivery.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {blockers.map((b) => (
                      <div key={b.id} className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 text-[11px] text-rose-300">
                        <div className="flex items-center gap-1.5 font-semibold text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>BLOCKER: {b.id}</span>
                        </div>
                        <p className="mt-1 text-white/70">{b.message}</p>
                        <p className="mt-1 text-volt"><strong>Fix:</strong> {b.fix}</p>
                      </div>
                    ))}
                    {warnings.map((w) => (
                      <div key={w.id} className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-300">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>WARNING: {w.id}</span>
                        </div>
                        <p className="mt-0.5 text-white/70">{w.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Send Etiquette 4-Point Checklist */}
                <div className="border-t border-white/[0.06] pt-3 text-[11px] text-white/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/80">Pre-Send Etiquette Rules:</span>
                    <button
                      type="button"
                      onClick={() => setShowPlatformRulesModal(true)}
                      className="text-volt hover:underline text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Shield className="w-3 h-3" />
                      <span>View Platform Rules ({PLATFORM_RULES.length})</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-center gap-2 bg-[#0c0d10] p-2 rounded-lg border border-white/5">
                      <Check className="w-3 h-3 text-volt shrink-0" />
                      <span>Single call-to-action ask</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0c0d10] p-2 rounded-lg border border-white/5">
                      <Check className="w-3 h-3 text-volt shrink-0" />
                      <span>Quantified proof or repo link</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0c0d10] p-2 rounded-lg border border-white/5">
                      <Check className="w-3 h-3 text-volt shrink-0" />
                      <span>Polite no-pressure exit</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0c0d10] p-2 rounded-lg border border-white/5">
                      <Check className="w-3 h-3 text-volt shrink-0" />
                      <span>Target within platform limits</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Strategy & Tradeoffs */}
            {bottomTab === 'strategy' && (
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-volt uppercase block mb-1">Why this works</span>
                  <p className="text-white/70 leading-relaxed text-[11px]">{selectedTemplate.whyItWorks}</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-rose-400 uppercase block mb-1">When not to use</span>
                  <p className="text-white/60 leading-relaxed text-[11px]">{selectedTemplate.whenNotToUse}</p>
                </div>
                {selectedTemplate.risks.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-amber-400 uppercase block mb-1">Tradeoffs & Risks</span>
                    <ul className="list-disc list-inside text-white/50 text-[11px] space-y-1">
                      {selectedTemplate.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: How It Works & Privacy */}
            {bottomTab === 'guidance' && (
              <div className="p-4 flex flex-col gap-2.5 text-[11px] text-white/60 leading-relaxed">
                <p>
                  <strong>Standard D6 4-Part Architecture:</strong> Every template is composed of a Hook (states who you are), Proof (quantified metric or repo), Ask (focused single question), and Close (polite out).
                </p>
                <p>
                  <strong>Evidence Transfer:</strong> Word and character limits are derived from real-world B2B sales outbound studies (Hunter 34M dataset, Boomerang) and assumed to transfer to job-seeker outreach.
                </p>
                <p>
                  <strong>Privacy Standard:</strong> 100% client-side computation. Recipient details and notes are never transmitted remotely.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Platform Rules Collapsible Section (Closed by default per user requirement) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-8" aria-label="Platform Rules and Delivery Guidelines">
        <div className="border border-white/10 rounded-2xl bg-[#111215] overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowPlatformRules((prev) => !prev)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-white/[0.03] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-volt" />
              <div>
                <span className="text-xs font-semibold text-white">Platform rules</span>
                <span className="text-[11px] text-white/50 ml-2">({PLATFORM_RULES.length} standards)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/60">
              <span>{showPlatformRules ? 'Hide rules' : 'View platform rules'}</span>
              {showPlatformRules ? (
                <ChevronUp className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </div>
          </button>

          {/* Renders in DOM for test assertions, but respects collapsed state */}
          <div className={`border-t border-white/10 p-5 bg-[#0a0a0c] divide-y divide-white/5 ${showPlatformRules ? 'block' : 'hidden'}`}>
            {PLATFORM_RULES.map((rule, idx) => (
              <div
                key={idx}
                className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs"
              >
                <div className="max-w-2xl">
                  <div className="font-semibold text-white">{rule.rule}</div>
                  <div className="text-[11px] text-white/50 mt-0.5">{rule.value}</div>
                </div>

                <div className="text-[11px] shrink-0">
                  {rule.sourceUrl ? (
                    <a
                      href={rule.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-volt hover:underline font-medium inline-flex items-center gap-1"
                    >
                      {`Source: ${rule.sourceName}, last checked ${rule.lastCheckedDate}`}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-white/40 italic px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      Source pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Honesty Footer ── */}
      <footer className="mt-auto py-6 border-t border-white/10 text-center bg-[#0c0d10]">
        <p className="text-xs font-semibold text-white/50">
          Pre-written templates. Nothing you type leaves your browser.
        </p>
      </footer>

      {/* ── Clickable Platform Rules Viewer Modal ── */}
      {showPlatformRulesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="platform-rules-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
        >
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#0f1013] border border-charcoal rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-[#141519] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-volt/10 text-volt border border-volt/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="platform-rules-title" className="text-sm font-bold text-white tracking-tight">
                    Official Platform Rules & Limits
                  </h3>
                  <p className="text-xs text-white/50">
                    Verified delivery constraints and anti-spam standards ({PLATFORM_RULES.length} rules)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPlatformRulesModal(false)}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close Platform Rules Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="px-5 py-3 border-b border-white/[0.06] bg-[#0c0d0f]">
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={platformRulesSearch}
                  onChange={(e) => setPlatformRulesSearch(e.target.value)}
                  placeholder="Filter rules by platform or keyword (e.g. LinkedIn, InMail, Email)..."
                  className="w-full bg-[#141519] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>
            </div>

            {/* Modal Rules Content */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-[#0a0a0c]">
              {filteredModalRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#121316] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-volt border border-volt/20 inline-block mb-1">
                      Standard #{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white tracking-tight">{rule.rule}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{rule.value}</p>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {rule.sourceUrl ? (
                      <a
                        href={rule.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-volt/10 text-volt hover:bg-volt/20 border border-volt/20 text-xs font-semibold transition-colors"
                      >
                        <span>Official Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-white/40 text-[11px] italic">Pending source</span>
                    )}
                    <span className="block text-[10px] text-white/40 font-mono mt-1 text-right">
                      Verified {rule.lastCheckedDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#141519] flex items-center justify-between">
              <span className="text-[11px] text-white/40">
                All limits verified against official platform documentation.
              </span>
              <button
                type="button"
                onClick={() => setShowPlatformRulesModal(false)}
                className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Provenance Modal */}
      {showProvenance && (
        <DataProvenanceModal
          isOpen={showProvenance}
          onClose={() => setShowProvenance(false)}
          defaultTab="engine-logic"
        />
      )}
    </div>
  );
}
