// ============================================================
// HireFlow Suite - Reach Out (/tools/reach-out)
// Unified Outreach Engine: 12 Master Topics, 50 Deterministic Templates
// Features:
// - Interactive Topic Spawn Architecture (TalentLens-inspired)
// - Required input markers & explicit "Confirm & Apply Changes" button
// - Contextual input requirements panel accessible on every view
// - Market-Standard Evidence & Skill Context Presets
// - Per-template inline draft editor for custom tailoring
// - Single-click "Copy to Clipboard" & instant "Download (.txt)" options
// - Platform rules collapsible with verification tracking
// - Limits notice and strict zero-egress honesty footer
// ============================================================

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Download,
  Sparkles,
  Mail,
  MessageSquare,
  Users,
  Clock,
  Building2,
  Search,
  Filter,
  GraduationCap,
  Rocket,
  Code2,
  RefreshCw,
  Zap,
  Award,
  Layers,
  Sliders,
  ExternalLink,
  RotateCcw,
  Shield,
  Edit3,
  GitFork,
  Globe,
} from 'lucide-react';
import { useProfile } from '../profile/ProfileContext';
import { COMPANIES } from '../../../pages/demo/talentLensData';
import {
  ALL_REACH_OUT_TEMPLATES,
  SCENARIO_GROUPS,
  PLATFORM_RULES,
} from '../../reach-out/data';
import { EVIDENCE_PRESETS, EvidencePreset } from '../../reach-out/data/evidencePresets';
import { renderReachOutMessage } from '../../reach-out/engine/slotResolver';
import { ReachOutSlots, ReachOutTemplate, ChannelId } from '../../reach-out/types';

// ── Vibrant Channel Styling ──
export interface ChannelMeta {
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeCls: string;
  borderCls: string;
  bgCls: string;
  textCls: string;
}

export const CHANNEL_CONFIG: Record<string, ChannelMeta> = {
  cold_email: {
    label: 'Cold Email',
    shortLabel: 'Email',
    icon: Mail,
    badgeCls: 'bg-black text-volt border-charcoal',
    borderCls: 'border-charcoal',
    bgCls: 'bg-black',
    textCls: 'text-volt',
  },
  linkedin_connect: {
    label: 'LinkedIn Connect (300 char)',
    shortLabel: 'Connect',
    icon: MessageSquare,
    badgeCls: 'bg-black text-volt border-charcoal',
    borderCls: 'border-charcoal',
    bgCls: 'bg-black',
    textCls: 'text-volt',
  },
  linkedin_inmail: {
    label: 'LinkedIn InMail',
    shortLabel: 'InMail',
    icon: Send,
    badgeCls: 'bg-black text-volt border-charcoal',
    borderCls: 'border-charcoal',
    bgCls: 'bg-black',
    textCls: 'text-volt',
  },
  warm_referral: {
    label: 'Warm Referral',
    shortLabel: 'Referral',
    icon: Users,
    badgeCls: 'bg-black text-pale-yellow border-charcoal',
    borderCls: 'border-charcoal',
    bgCls: 'bg-black',
    textCls: 'text-pale-yellow',
  },
  follow_up: {
    label: 'Follow-Up',
    shortLabel: 'Follow-Up',
    icon: Clock,
    badgeCls: 'bg-black text-silver border-charcoal',
    borderCls: 'border-charcoal',
    bgCls: 'bg-black',
    textCls: 'text-silver',
  },
  direct_message: {
    label: 'Direct Message',
    shortLabel: 'DM',
    icon: Zap,
    badgeCls: 'bg-black text-volt border-charcoal',
    borderCls: 'border-charcoal',
    bgCls: 'bg-black',
    textCls: 'text-volt',
  },
  reply: {
    label: 'Reply Handling',
    shortLabel: 'Reply',
    icon: RefreshCw,
    badgeCls: 'bg-black text-silver border-charcoal',
    borderCls: 'border-charcoal',
    bgCls: 'bg-black',
    textCls: 'text-silver',
  },
};

// ── Master Topic Visual Metadata ──
interface TopicMeta {
  id: string;
  icon: React.ElementType;
  gradient: string;
  pillBorder: string;
  pillBg: string;
  pillText: string;
  accentBg: string;
  tagline: string;
}

const TOPIC_METADATA: Record<string, TopicMeta> = {
  'first-touch-recruiters': {
    id: 'first-touch-recruiters',
    icon: Briefcase,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Technical recruiters & talent acquisition scouts',
  },
  'first-touch-engineers': {
    id: 'first-touch-engineers',
    icon: Code2,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Engineering managers, tech leads & staff engineers',
  },
  'campus-fresher-programs': {
    id: 'campus-fresher-programs',
    icon: GraduationCap,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Off-campus drives, university relations, TPO & PPO conversions',
  },
  'alumni-mutual-warm': {
    id: 'alumni-mutual-warm',
    icon: Users,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-pale-yellow',
    accentBg: 'bg-black',
    tagline: 'College alumni, department seniors & mutual connections',
  },
  'startup-founder-direct': {
    id: 'startup-founder-direct',
    icon: Rocket,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Early-stage founders, CTOs & founding engineer roles',
  },
  'referral-engine': {
    id: 'referral-engine',
    icon: Award,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Forwardable blurbs, Job ID asks & low-friction referrals',
  },
  'open-source-portfolio': {
    id: 'open-source-portfolio',
    icon: Sparkles,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Merged PRs, system architecture, teardowns & demo shares',
  },
  'follow-ups': {
    id: 'follow-ups',
    icon: Clock,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-silver',
    accentBg: 'bg-black',
    tagline: '5-day value adds, calm check-ins & polite loop closures',
  },
  'interview-lifecycle': {
    id: 'interview-lifecycle',
    icon: CheckCircle2,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Post-OA confirmations, thank-you notes & status checks',
  },
  'informational-chats': {
    id: 'informational-chats',
    icon: MessageSquare,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-pale-yellow',
    accentBg: 'bg-black',
    tagline: '15-minute stack discussions & engineering decision advice',
  },
  're-engagement-replies': {
    id: 're-engagement-replies',
    icon: RefreshCw,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-silver',
    accentBg: 'bg-black',
    tagline: '6-month re-engagement, no-headcount replies & logistics',
  },
  'events-community': {
    id: 'events-community',
    icon: Zap,
    gradient: 'from-[#141414] to-black',
    pillBorder: 'border-charcoal',
    pillBg: 'bg-black',
    pillText: 'text-volt',
    accentBg: 'bg-black',
    tagline: 'Conferences, hackathons, speakers & developer meetups',
  },
};

// Clean browser download helper
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

  // ── Confirmed Slot State (Active in generator) ──
  const [appliedSlots, setAppliedSlots] = useState<ReachOutSlots>({
    company: 'Razorpay',
    role: 'Backend Engineer',
    recipient_name: 'Rahul Sharma',
    recipient_type: 'Recruiter',
    primary_skill: 'Node.js & PostgreSQL',
    proof_point: 'scaled REST APIs reducing latency by 45%',
    college: 'NIT Trichy',
    admired_project: 'UPI payment switch',
    portfolio: 'myname.dev',
    github: 'github.com/myname/portfolio',
    your_name: 'Arjun Mehta',
    your_email: 'arjun.mehta@example.com',
    batch_year: '2026',
    job_id: 'REQ-0482',
    source_trigger: 'your engineering blog post on high-concurrency payment queues',
    event_name: 'GopherCon India',
    talk_topic: 'distributed systems reliability',
    interviewer_topic: 'system design trade-offs',
    days_since_last_contact: 7,
    availability_date: 'Immediate',
    notice_period: 'Immediate / 15 days',
    location_preference: 'Bengaluru / Remote',
    personal_line: 'Your team\'s open-source work directly influenced my final-year project.',
    what_changed: 'shipped production microservices with 99.9% uptime',
    referrer_relationship: 'former_colleague',
    specific_observation: 'clean circuit-breaker implementation on checkout',
    pr_link: 'github.com/org/repo/pull/124',
    expected_ctc: 'Market Standard',
  });

  // ── Draft Slot State (Form input values before confirmation) ──
  const [draftSlots, setDraftSlots] = useState<ReachOutSlots>({ ...appliedSlots });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [justConfirmed, setJustConfirmed] = useState<boolean>(false);

  // ── Navigation, Search & Controls ──
  const [selectedTopicId, setSelectedTopicId] = useState<string>('first-touch-recruiters');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showInputsDrawer, setShowInputsDrawer] = useState<boolean>(true);
  const [showPlatformRules, setShowPlatformRules] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Custom Editable Drafts per Template ──
  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>({});
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // Sync candidate identity from profile context if available
  useEffect(() => {
    if (profile) {
      setDraftSlots((prev) => ({
        ...prev,
        your_name: profile.identity?.name || prev.your_name,
        your_email: profile.identity?.email || prev.your_email,
        college: profile.education?.[0]?.institution || prev.college,
      }));
      setAppliedSlots((prev) => ({
        ...prev,
        your_name: profile.identity?.name || prev.your_name,
        your_email: profile.identity?.email || prev.your_email,
        college: profile.education?.[0]?.institution || prev.college,
      }));
    }
  }, [profile]);

  // Track draft modifications
  const handleInputChange = (field: keyof ReachOutSlots, value: any) => {
    setDraftSlots((prev) => {
      const next = { ...prev, [field]: value };
      setHasUnsavedChanges(true);
      return next;
    });
  };

  // Explicit Confirm & Apply Button
  const handleConfirmChanges = () => {
    setAppliedSlots({ ...draftSlots });
    setHasUnsavedChanges(false);
    setJustConfirmed(true);
    setTimeout(() => setJustConfirmed(null as any), 3000);
  };

  // Apply a Market-Standard Evidence Preset
  const handleApplyEvidencePreset = (presetId: string) => {
    const preset = EVIDENCE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDraftSlots((prev) => ({
      ...prev,
      role: preset.role,
      primary_skill: preset.primarySkill,
      proof_point: preset.proofPoint,
      admired_project: preset.admiredProject,
      personal_line: preset.personalLine,
    }));
    setHasUnsavedChanges(true);
  };

  // Reset to original defaults
  const handleResetDefaults = () => {
    const defaults: ReachOutSlots = {
      company: 'Razorpay',
      role: 'Backend Engineer',
      recipient_name: 'Rahul Sharma',
      recipient_type: 'Recruiter',
      primary_skill: 'Node.js & PostgreSQL',
      proof_point: 'scaled REST APIs reducing latency by 45%',
      college: 'NIT Trichy',
      admired_project: 'UPI payment switch',
      portfolio: 'myname.dev',
      github: 'github.com/myname/portfolio',
      your_name: profile?.identity?.name || 'Arjun Mehta',
      your_email: profile?.identity?.email || 'arjun.mehta@example.com',
      batch_year: '2026',
      job_id: 'REQ-0482',
      source_trigger: 'your engineering blog post on high-concurrency payment queues',
      event_name: 'GopherCon India',
      talk_topic: 'distributed systems reliability',
      interviewer_topic: 'system design trade-offs',
      days_since_last_contact: 7,
      availability_date: 'Immediate',
      notice_period: 'Immediate / 15 days',
      location_preference: 'Bengaluru / Remote',
      personal_line: 'Your team\'s open-source work directly influenced my final-year project.',
      what_changed: 'shipped production microservices with 99.9% uptime',
      referrer_relationship: 'former_colleague',
      specific_observation: 'clean circuit-breaker implementation on checkout',
      pr_link: 'github.com/org/repo/pull/124',
      expected_ctc: 'Market Standard',
    };
    setDraftSlots(defaults);
    setAppliedSlots(defaults);
    setHasUnsavedChanges(false);
    setCustomDrafts({});
    setEditingTemplateId(null);
  };

  // Handle Quick Pick Target Company
  const handleSelectCompany = (compName: string) => {
    const comp = COMPANIES.find((c) => c.name === compName || c.id === compName);
    if (!comp) return;
    const roleTitle = comp.roles[0]?.title || 'Software Engineer';
    const skills = comp.roles[0]?.competencies.slice(0, 3).join(', ') || 'Go, Distributed Systems';

    setDraftSlots((prev) => ({
      ...prev,
      company: comp.name,
      role: roleTitle,
      primary_skill: skills,
      admired_project: `${comp.name}'s ${comp.industry} infrastructure`,
    }));
    setHasUnsavedChanges(true);
  };

  // Copy handler
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download single template
  const handleDownloadSingle = (tmpl: ReachOutTemplate, renderedSubject?: string, renderedBody?: string) => {
    const subject = renderedSubject || '';
    const body = renderedBody || '';
    const cleanComp = (appliedSlots.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanName = tmpl.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Outreach_${cleanComp}_${cleanName}.txt`;

    const fileContent = [
      '================================================================================',
      `HIREFLOW OUTREACH GENERATOR — ${tmpl.name.toUpperCase()}`,
      '================================================================================',
      `Channel:        ${CHANNEL_CONFIG[tmpl.channel]?.label || tmpl.channel}`,
      `Target Company: ${appliedSlots.company || 'Target Company'}`,
      `Target Role:    ${appliedSlots.role || 'Target Role'}`,
      `Recipient:      ${appliedSlots.recipient_name || 'Recipient'} (${appliedSlots.recipient_type || 'Contact'})`,
      `Primary Stack:  ${appliedSlots.primary_skill || 'Tech Stack'}`,
      '================================================================================',
      '',
      subject ? `SUBJECT LINE:\n${subject}\n\n` : '',
      `MESSAGE BODY:\n${body}`,
      '',
      '================================================================================',
      `WORD COUNT: ${body.split(/\s+/).filter(Boolean).length} | CHAR COUNT: ${body.length}`,
      'WHEN TO USE:',
      tmpl.whenToUse || 'Direct outreach scenario.',
      '================================================================================',
    ].join('\n');

    downloadTextFile(filename, fileContent);
  };

  // Download all templates in current topic
  const handleDownloadAllInTopic = (groupId: string) => {
    const group = SCENARIO_GROUPS.find((g) => g.id === groupId);
    const templatesInGroup = ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === groupId);
    const cleanComp = (appliedSlots.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanGroup = (group?.shortLabel || 'Topic').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `HireFlow_${cleanComp}_${cleanGroup}_All_Connects.txt`;

    const sections = templatesInGroup.map((tmpl, idx) => {
      const rendered = renderReachOutMessage(tmpl, appliedSlots, { openerIndex: 0, subjectIndex: 0 });
      const bodyToUse = customDrafts[tmpl.id] || rendered.body;
      return [
        `--------------------------------------------------------------------------------`,
        `[${idx + 1}] ${tmpl.name.toUpperCase()} (${CHANNEL_CONFIG[tmpl.channel]?.label || tmpl.channel})`,
        `Target Audience: ${tmpl.recipientTypes.join(', ')}`,
        `--------------------------------------------------------------------------------`,
        rendered.subject ? `SUBJECT: ${rendered.subject}\n` : '',
        bodyToUse,
        '',
        `Guidance: ${tmpl.whenToUse}`,
        '',
      ].filter(Boolean).join('\n');
    });

    const fileContent = [
      '================================================================================',
      `HIREFLOW OUTREACH PLAYBOOK — ${group?.title.toUpperCase() || 'TOPIC'}`,
      `Target Company: ${appliedSlots.company} | Role: ${appliedSlots.role}`,
      `Total Templates: ${templatesInGroup.length}`,
      '================================================================================',
      '',
      ...sections,
      '================================================================================',
      'Generated by HireFlow Outreach Engine (Strictly Deterministic)',
      '================================================================================',
    ].join('\n');

    downloadTextFile(filename, fileContent);
  };

  // Active topic metadata
  const currentTopicMeta = TOPIC_METADATA[selectedTopicId] || TOPIC_METADATA['first-touch-recruiters'];
  const currentGroup = SCENARIO_GROUPS.find((g) => g.id === selectedTopicId) || SCENARIO_GROUPS[0];

  // Templates in current topic
  const currentTopicTemplates = useMemo(() => {
    let list = ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === selectedTopicId);
    if (channelFilter !== 'all') {
      list = list.filter((t) => t.channel === channelFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.intent.toLowerCase().includes(q) ||
          t.whenToUse.toLowerCase().includes(q) ||
          t.channel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedTopicId, channelFilter, searchQuery]);

  // Channels available in current topic
  const availableChannelsInTopic = useMemo(() => {
    const allInGroup = ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === selectedTopicId);
    const channelSet = new Set(allInGroup.map((t) => t.channel));
    return Array.from(channelSet);
  }, [selectedTopicId]);

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-volt selection:text-black">
      {/* ── Top Bar / Breadcrumb ── */}
      <div className="border-b border-charcoal bg-black/95 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-xs text-silver hover:text-white font-bold px-3 py-1.5 rounded bg-near-black hover:bg-hover-gray transition-colors border border-charcoal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tools Hub
            </Link>
            <span className="text-charcoal">/</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded bg-near-black text-volt border border-charcoal">
              <Sparkles className="w-3 h-3 text-volt" />
              Reach Out Engine
            </span>
            <span className="text-sm font-extrabold text-white hidden sm:inline">
              Cold Outreach Generator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/history"
              className="px-3.5 py-1.5 text-xs font-bold bg-near-black hover:bg-hover-gray border border-charcoal hover:border-silver rounded text-white transition-all flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-volt" />
              Application Tracker
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ── Page Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-near-black border border-charcoal flex items-center justify-center text-volt">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Reach Out — Cold Outreach Generator
              </h1>
              <p className="text-xs sm:text-sm text-silver mt-0.5">
                Targeted outreach playbooks across 12 hiring scenarios: select a topic below to spawn matching cold emails, InMails, referrals, and LinkedIn connection notes.
              </p>
            </div>
          </div>
        </div>

        {/* ── Interactive Input Requirements Panel (Accessible on every view) ── */}
        <div className="bg-near-black border border-charcoal rounded-lg p-5 sm:p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-charcoal">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-black border border-charcoal flex items-center justify-center text-volt font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-white">Outreach Slot Inputs & Personalization</h2>
                  {hasUnsavedChanges ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-pale-yellow border border-olive-border animate-pulse">
                      ● Unsaved Changes — Click Confirm to Apply
                    </span>
                  ) : justConfirmed ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-volt border border-volt flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-volt" />
                      Changes Confirmed & Applied!
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-silver border border-charcoal">
                      ✓ Synchronized
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-silver mt-0.5">
                  Fields with <span className="text-danger font-bold">* Required</span> auto-fill your templates. Edit anywhere and click &quot;Confirm &amp; Apply Changes&quot;.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Market-Standard Evidence Preset Selector */}
              <div className="flex items-center gap-1.5 bg-black border border-charcoal rounded px-2.5 py-1">
                <Sparkles className="w-3.5 h-3.5 text-volt" />
                <span className="text-[11px] font-semibold text-silver">Evidence Preset:</span>
                <select
                  onChange={(e) => handleApplyEvidencePreset(e.target.value)}
                  className="bg-black text-xs font-bold text-white focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Load Market Evidence Example...</option>
                  {EVIDENCE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-black text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Pick Company Dropdown */}
              <div className="flex items-center gap-1.5 bg-black border border-charcoal rounded px-2.5 py-1">
                <Building2 className="w-3.5 h-3.5 text-silver" />
                <span className="text-[11px] font-semibold text-silver">Company Preset:</span>
                <select
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  className="bg-black text-xs font-bold text-white focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Select Company...</option>
                  {COMPANIES.slice(0, 30).map((c) => (
                    <option key={c.id} value={c.name} className="bg-black text-white">
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset to defaults */}
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded border border-charcoal text-xs font-semibold text-silver hover:text-white hover:bg-hover-gray transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset to default slots"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>

              {/* Toggle Collapse */}
              <button
                onClick={() => setShowInputsDrawer((prev) => !prev)}
                className="px-3 py-1.5 rounded border border-charcoal text-xs font-semibold text-silver hover:text-white hover:bg-hover-gray transition-colors flex items-center gap-1 cursor-pointer"
              >
                {showInputsDrawer ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Collapse Inputs
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Expand Inputs
                  </>
                )}
              </button>

              {/* Explicit Confirm Button (Prominently Styled) */}
              <button
                onClick={handleConfirmChanges}
                className={`px-5 py-2 rounded font-black text-xs transition-colors flex items-center gap-2 cursor-pointer border ${
                  hasUnsavedChanges
                    ? 'bg-volt text-[#151515] hover:bg-[#1d1d1d] hover:text-white border-volt ring-2 ring-volt/40'
                    : 'bg-forest text-white hover:bg-[#3a3a3a] border-border-default'
                }`}
              >
                <Check className="w-4 h-4" />
                Confirm & Apply Changes
              </button>
            </div>
          </div>

          {/* Form Content */}
          {showInputsDrawer && (
            <div className="pt-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* ── Column 1: Target Position ── */}
                <div className="bg-black border border-charcoal rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-black text-volt uppercase tracking-wider pb-1 border-b border-charcoal">
                    <Building2 className="w-3.5 h-3.5 text-volt" />
                    1. Target Position
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-silver">Target Company</label>
                      <span className="text-[10px] font-bold text-danger bg-black px-1.5 py-0.5 rounded border border-danger/40">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="e.g. Razorpay, Swiggy, Zepto"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-silver">Target Role</label>
                      <span className="text-[10px] font-bold text-danger bg-black px-1.5 py-0.5 rounded border border-danger/40">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.role || ''}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="e.g. Backend Engineer, Fullstack SDE"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-silver">Recipient Type</label>
                      <span className="text-[10px] text-silver/80">Target audience</span>
                    </div>
                    <select
                      value={draftSlots.recipient_type || 'Recruiter'}
                      onChange={(e) => handleInputChange('recipient_type', e.target.value)}
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    >
                      <option value="Recruiter" className="bg-black text-white">Recruiter / Talent Scout</option>
                      <option value="Hiring Manager" className="bg-black text-white">Hiring Manager / Tech Lead</option>
                      <option value="Peer Engineer" className="bg-black text-white">Peer Engineer / Senior SDE</option>
                      <option value="Alumnus" className="bg-black text-white">College Alumnus</option>
                      <option value="Founder/CTO" className="bg-black text-white">Founder / CTO</option>
                      <option value="Referrer" className="bg-black text-white">Referrer / Team Member</option>
                      <option value="Campus Recruiter" className="bg-black text-white">Campus Recruiter / University Relations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-silver mb-1">Requisition / Job ID (Optional)</label>
                    <input
                      type="text"
                      value={draftSlots.job_id || ''}
                      onChange={(e) => handleInputChange('job_id', e.target.value)}
                      placeholder="e.g. REQ-0482 or Job URL"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>
                </div>

                {/* ── Column 2: Candidate Technical Proof Points ── */}
                <div className="bg-black border border-charcoal rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-black text-volt uppercase tracking-wider pb-1 border-b border-charcoal">
                    <Sparkles className="w-3.5 h-3.5 text-volt" />
                    2. Technical Proof Points
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-silver">Primary Stack & Skills</label>
                      <span className="text-[10px] font-bold text-danger bg-black px-1.5 py-0.5 rounded border border-danger/40">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.primary_skill || ''}
                      onChange={(e) => handleInputChange('primary_skill', e.target.value)}
                      placeholder="e.g. React & Node.js, Go & Kafka"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-silver">Quantified Proof Point</label>
                      <span className="text-[10px] font-bold text-danger bg-black px-1.5 py-0.5 rounded border border-danger/40">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.proof_point || ''}
                      onChange={(e) => handleInputChange('proof_point', e.target.value)}
                      placeholder="e.g. built real-time WebSocket dashboard handling 800+ concurrent users"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-silver mb-1">College / University</label>
                    <input
                      type="text"
                      value={draftSlots.college || ''}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      placeholder="e.g. NIT Trichy, IIT Madras, BITS Pilani"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  {/* ── Portfolio & GitHub Links Sub-Options ── */}
                  <div className="bg-near-black border border-charcoal rounded p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-volt" />
                        Code & Project Links
                      </label>
                      <span className="text-[10px] text-silver font-medium bg-black px-1.5 py-0.5 rounded border border-charcoal">
                        Add GitHub, Portfolio, or both
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-silver mb-1 flex items-center gap-1">
                          <GitFork className="w-3 h-3 text-silver" />
                          GitHub Profile / Repo Link
                        </label>
                        <input
                          type="text"
                          value={draftSlots.github || ''}
                          onChange={(e) => handleInputChange('github', e.target.value)}
                          placeholder="e.g. github.com/arjunmehta"
                          className="w-full bg-black border border-charcoal rounded px-2.5 py-1.5 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-silver mb-1 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-silver" />
                          Portfolio Website Link
                        </label>
                        <input
                          type="text"
                          value={draftSlots.portfolio || ''}
                          onChange={(e) => handleInputChange('portfolio', e.target.value)}
                          placeholder="e.g. arjunmehta.dev"
                          className="w-full bg-black border border-charcoal rounded px-2.5 py-1.5 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-mono"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-silver flex items-center gap-1.5 pt-0.5 border-t border-charcoal">
                      <span className="font-semibold text-silver shrink-0">In template:</span>
                      <code className="bg-black px-1.5 py-0.5 rounded text-[10px] font-mono text-volt truncate max-w-full">
                        {draftSlots.portfolio && draftSlots.github
                          ? `${draftSlots.portfolio} | ${draftSlots.github}`
                          : draftSlots.portfolio || draftSlots.github || 'No link provided'}
                      </code>
                    </div>
                  </div>
                </div>

                {/* ── Column 3: Personalization & Recipient Details ── */}
                <div className="bg-black border border-charcoal rounded-lg p-4 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-black text-volt uppercase tracking-wider pb-1 border-b border-charcoal">
                    <Users className="w-3.5 h-3.5 text-volt" />
                    3. Recipient & Personalization
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-silver mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={draftSlots.recipient_name || ''}
                      onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-silver mb-1">Personal Hook / Connection Note</label>
                    <input
                      type="text"
                      value={draftSlots.personal_line || ''}
                      onChange={(e) => handleInputChange('personal_line', e.target.value)}
                      placeholder="e.g. Loved your recent post on distributed transaction sagas"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-silver mb-1">Admired Project or Feature</label>
                    <input
                      type="text"
                      value={draftSlots.admired_project || ''}
                      onChange={(e) => handleInputChange('admired_project', e.target.value)}
                      placeholder="e.g. UPI payment switch, Real-time dispatch"
                      className="w-full bg-near-black border border-charcoal rounded px-3 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-silver mb-1">Your Name & Email</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={draftSlots.your_name || ''}
                        onChange={(e) => handleInputChange('your_name', e.target.value)}
                        placeholder="Your Name"
                        className="bg-near-black border border-charcoal rounded px-2.5 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                      />
                      <input
                        type="text"
                        value={draftSlots.your_email || ''}
                        onChange={(e) => handleInputChange('your_email', e.target.value)}
                        placeholder="Your Email"
                        className="bg-near-black border border-charcoal rounded px-2.5 py-2 text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action for Confirmation */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-silver flex items-center gap-2">
                  <span>Current Target:</span>
                  <span className="font-bold text-white bg-black px-2 py-0.5 rounded border border-charcoal">
                    {appliedSlots.company || 'Not set'}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-white bg-black px-2 py-0.5 rounded border border-charcoal">
                    {appliedSlots.role || 'Not set'}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-white bg-black px-2 py-0.5 rounded border border-charcoal">
                    {appliedSlots.primary_skill || 'Not set'}
                  </span>
                </div>

                <button
                  onClick={handleConfirmChanges}
                  className="px-6 py-2.5 rounded bg-volt text-[#151515] hover:bg-[#1d1d1d] hover:text-white font-black text-xs border border-volt transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Apply Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Section Title: Outreach Playbooks / Scenarios (TalentLens-inspired) ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-volt" />
                Select Outreach Playbook
              </h2>
              <p className="text-xs text-silver mt-0.5">
                Click any topic below to spawn matching cold emails, InMails, referrals, and connection notes with un-hallucinated proof points.
              </p>
            </div>

            {/* Quick Keyword Search */}
            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-silver" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates or keywords..."
                className="w-full pl-9 pr-3 py-1.5 bg-near-black border border-charcoal rounded text-xs text-white placeholder-silver/60 focus:outline-none focus:border-volt focus:ring-2 focus:ring-volt font-medium"
              />
            </div>
          </div>

          {/* ── Master Topic Selection Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
            {SCENARIO_GROUPS.map((group) => {
              const meta = TOPIC_METADATA[group.id] || TOPIC_METADATA['first-touch-recruiters'];
              const Icon = meta.icon;
              const isSelected = selectedTopicId === group.id;

              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedTopicId(group.id);
                    setChannelFilter('all');
                  }}
                  className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-near-black border-volt ring-1 ring-volt'
                      : 'bg-black hover:bg-near-black border-charcoal hover:border-silver'
                  }`}
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded flex items-center justify-center text-volt bg-near-black border border-charcoal">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black text-silver border border-charcoal">
                        {group.count} connects
                      </span>
                    </div>

                    <div className="font-bold text-xs text-white group-hover:text-volt transition-colors line-clamp-1">
                      {group.shortLabel}
                    </div>
                    <div className="text-[10px] text-silver mt-0.5 line-clamp-2 leading-relaxed">
                      {meta.tagline}
                    </div>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="mt-3 pt-2 border-t border-charcoal flex items-center justify-between">
                    <span className="text-[10px] font-bold text-silver">
                      {isSelected ? '● Spawned' : 'Spawn →'}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-volt' : 'bg-transparent'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Spawned Topic View (All connects under this topic) ── */}
        <div className="bg-near-black border border-charcoal rounded-lg p-6 sm:p-7">
          {/* Header of Spawned Topic */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-charcoal">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-volt bg-black border border-charcoal shrink-0">
                {React.createElement(currentTopicMeta.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-volt uppercase tracking-wider">
                    Spawned Topic {currentGroup.number} of 12
                  </span>
                  <span className="text-charcoal">·</span>
                  <span className="text-xs font-bold text-silver">
                    {currentTopicTemplates.length} outreach templates ready
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {currentGroup.title}
                </h2>
                <p className="text-xs sm:text-sm text-silver mt-1 max-w-2xl">
                  {currentGroup.description}
                </p>
              </div>
            </div>

            {/* Topic Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Download all in this topic */}
              <button
                onClick={() => handleDownloadAllInTopic(selectedTopicId)}
                className="px-4 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal text-xs font-bold text-white hover:text-volt transition-colors flex items-center gap-2 cursor-pointer"
                title="Download all templates in this category as a clean .txt file"
              >
                <Download className="w-3.5 h-3.5 text-volt" />
                Download All ({currentTopicTemplates.length})
              </button>

              {/* Quick Input Toggle for this page */}
              <button
                onClick={() => setShowInputsDrawer((prev) => !prev)}
                className="px-4 py-2 rounded bg-black hover:bg-hover-gray border border-charcoal text-white hover:text-volt text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-volt" />
                {showInputsDrawer ? 'Hide Inputs' : 'Tweak Inputs Here'}
              </button>
            </div>
          </div>

          {/* ── Channel Filter Tabs within Spawned Topic ── */}
          <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-border/80">
            <span className="text-xs font-bold text-text-muted mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Connect Type:
            </span>

            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer shrink-0 border ${
                channelFilter === 'all'
                  ? 'bg-volt text-[#151515] border-volt font-black'
                  : 'bg-black text-silver hover:text-white hover:bg-hover-gray border-charcoal'
              }`}
            >
              All Types ({ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === selectedTopicId).length})
            </button>

            {availableChannelsInTopic.map((chKey) => {
              const ch = CHANNEL_CONFIG[chKey] || {
                label: chKey,
                shortLabel: chKey,
                icon: MessageSquare,
                badgeCls: 'bg-near-black text-silver border-charcoal',
              };
              const Icon = ch.icon;
              const count = ALL_REACH_OUT_TEMPLATES.filter(
                (t) => t.group === selectedTopicId && t.channel === chKey
              ).length;

              return (
                <button
                  key={chKey}
                  onClick={() => setChannelFilter(chKey)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    channelFilter === chKey
                      ? 'bg-volt text-[#151515] border-volt font-black'
                      : 'bg-black border-charcoal text-silver hover:text-white hover:bg-hover-gray'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {ch.shortLabel} ({count})
                </button>
              );
            })}
          </div>

          {/* ── Spawned Cards Grid ── */}
          {currentTopicTemplates.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-8 h-8 text-pale-yellow mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No matching outreach templates found</p>
              <p className="text-xs text-silver mt-1">Try resetting the channel filter or search term.</p>
              <button
                onClick={() => {
                  setChannelFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-1.5 rounded bg-volt text-[#151515] text-xs font-black hover:bg-[#1d1d1d] hover:text-white border border-volt"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {currentTopicTemplates.map((tmpl) => {
                const rendered = renderReachOutMessage(tmpl, appliedSlots, {
                  openerIndex: 0,
                  subjectIndex: 0,
                });
                const isLinkedInConnect = tmpl.channel === 'linkedin_connect';
                const bodyText = customDrafts[tmpl.id] ?? rendered.body;
                const charCount = bodyText.length;
                const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
                const charLimitProgress = isLinkedInConnect ? Math.round((charCount / 300) * 100) : 0;
                const channelConfig = CHANNEL_CONFIG[tmpl.channel] || {
                  label: tmpl.channel,
                  shortLabel: tmpl.channel,
                  icon: MessageSquare,
                  badgeCls: 'bg-near-black text-silver border-charcoal',
                  borderCls: 'border-charcoal',
                  bgCls: 'bg-near-black',
                  textCls: 'text-white',
                };
                const ChannelIcon = channelConfig.icon;
                const hasPlaceholders = rendered.unresolvedSlots.length > 0;
                const copyKey = tmpl.id;
                const isEditing = editingTemplateId === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    className="bg-black border border-charcoal hover:border-volt rounded-lg p-5 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-sm font-black text-white group-hover:text-volt transition-colors">
                            {tmpl.name}
                          </h3>
                          <div className="text-[11px] text-silver mt-0.5">
                            Target Audience:{' '}
                            <span className="font-semibold text-white">
                              {tmpl.recipientTypes.join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Channel Badge */}
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border shrink-0 flex items-center gap-1 bg-near-black text-volt border-charcoal"
                        >
                          <ChannelIcon className="w-3 h-3" />
                          {channelConfig.shortLabel}
                        </span>
                      </div>

                      {/* Char / Word Count + Progress */}
                      <div className="flex items-center justify-between text-[11px] text-silver mb-3 pb-2.5 border-b border-charcoal">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{wordCount} words</span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              isLinkedInConnect && charCount > 300 ? 'text-danger font-extrabold' : ''
                            }`}
                          >
                            {charCount} {isLinkedInConnect ? '/ 300 chars' : 'characters'}
                          </span>
                        </div>

                        {/* LinkedIn 300 Char Limit Meter */}
                        {isLinkedInConnect && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1 bg-near-black rounded-full overflow-hidden border border-charcoal">
                              <div
                                className={`h-full transition-all ${
                                  charCount > 300
                                    ? 'bg-danger'
                                    : charCount > 270
                                    ? 'bg-pale-yellow'
                                    : 'bg-volt'
                                }`}
                                style={{ width: `${Math.min(100, charLimitProgress)}%` }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                300 - charCount >= 0 ? 'text-volt' : 'text-danger'
                              }`}
                            >
                              {300 - charCount >= 0
                                ? `${300 - charCount} chars left`
                                : 'OVER LIMIT'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Subject Line (if present) */}
                      {rendered.subject && (
                        <div className="mb-3 p-3 rounded bg-near-black border border-charcoal text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-volt font-black uppercase tracking-wider">
                              Subject Line
                            </span>
                            <button
                              onClick={() => handleCopy(`${copyKey}-subject`, rendered.subject!)}
                              className="text-[10px] font-bold text-silver hover:text-white cursor-pointer flex items-center gap-1"
                            >
                              {copiedId === `${copyKey}-subject` ? (
                                <Check className="w-3 h-3 text-volt" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy Subject
                            </button>
                          </div>
                          <div className="font-semibold text-white">{rendered.subject}</div>
                        </div>
                      )}

                      {/* Message Body / Inline Editable Draft */}
                      <div className="mb-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-silver uppercase tracking-wider">
                            Message Body
                          </span>
                          <button
                            onClick={() => {
                              if (!isEditing && !customDrafts[tmpl.id]) {
                                setCustomDrafts((prev) => ({ ...prev, [tmpl.id]: rendered.body }));
                              }
                              setEditingTemplateId(isEditing ? null : tmpl.id);
                            }}
                            className="text-[10px] font-bold text-silver hover:text-volt transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-volt" />
                            {isEditing ? 'Done Editing' : 'Customize Draft'}
                          </button>
                        </div>

                        {isEditing ? (
                          <textarea
                            value={customDrafts[tmpl.id] ?? rendered.body}
                            onChange={(e) =>
                              setCustomDrafts((prev) => ({ ...prev, [tmpl.id]: e.target.value }))
                            }
                            rows={8}
                            className="w-full p-3.5 rounded bg-black border border-volt text-xs text-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-volt"
                          />
                        ) : (
                          <div className="p-4 rounded bg-near-black border border-charcoal text-xs text-white font-mono leading-relaxed whitespace-pre-wrap select-all">
                            {bodyText}
                          </div>
                        )}
                      </div>

                      {/* Placeholder Tracker / Status */}
                      <div className="mb-3">
                        {hasPlaceholders ? (
                          <div className="p-2.5 rounded bg-black border border-olive-border flex items-start gap-2 text-xs text-pale-yellow">
                            <AlertTriangle className="w-4 h-4 text-pale-yellow shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold">
                                {rendered.unresolvedSlots.length} slot
                                {rendered.unresolvedSlots.length > 1 ? 's' : ''} need input:
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rendered.unresolvedSlots.map((slot, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-1.5 py-0.5 rounded bg-near-black text-pale-yellow font-mono text-[10px] border border-olive-border"
                                  >
                                    {slot}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded bg-black border border-charcoal flex items-center gap-2 text-xs text-volt font-bold">
                            <CheckCircle2 className="w-4 h-4 text-volt" />
                            Ready to send — 0 placeholders remaining
                          </div>
                        )}
                      </div>

                      {/* Best Practice Guidance */}
                      <div className="p-2.5 rounded bg-near-black border border-charcoal text-[11px] text-silver leading-relaxed mb-3">
                        <span className="font-bold text-white">When to use: </span>
                        {tmpl.whenToUse}
                      </div>

                      {/* Mandatory Limits Notice */}
                      <div className="p-2 rounded bg-black border border-charcoal text-[11px] text-silver leading-relaxed mb-4">
                        Replies depend on your profile, timing and the company&apos;s hiring state. No template can guarantee one.
                      </div>

                      {/* Optional Review Status Line (renders only when filled) */}
                      {tmpl.reviewedBy?.name && tmpl.reviewedBy?.role && tmpl.reviewedBy?.date && (
                        <div className="text-[11px] text-silver pb-3 border-b border-charcoal">
                          Reviewed by {tmpl.reviewedBy.name}, {tmpl.reviewedBy.role}, {tmpl.reviewedBy.date}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-charcoal flex items-center justify-between gap-2 flex-wrap">
                      <Link
                        to="/history"
                        className="text-xs font-semibold text-silver hover:text-volt flex items-center gap-1"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-volt" />
                        Log in Tracker
                      </Link>

                      <div className="flex items-center gap-2">
                        {/* Download as .txt */}
                        <button
                          onClick={() => handleDownloadSingle(tmpl, rendered.subject, bodyText)}
                          className="px-3 py-1.5 rounded bg-near-black hover:bg-hover-gray border border-charcoal text-xs font-bold text-white hover:text-volt transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Download message as .txt"
                        >
                          <Download className="w-3.5 h-3.5 text-silver" />
                          Download
                        </button>

                        {/* Copy to Clipboard (Forest button per guardrail) */}
                        <button
                          onClick={() =>
                            handleCopy(
                              copyKey,
                              rendered.subject ? `Subject: ${rendered.subject}\n\n${bodyText}` : bodyText
                            )
                          }
                          className="px-4 py-1.5 rounded bg-forest hover:bg-[#3a3a3a] text-white hover:text-pale-yellow text-xs font-bold border border-[#141414] transition-colors cursor-pointer inline-flex items-center gap-1.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
                        >
                          {copiedId === copyKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === copyKey ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Platform Rules Collapsible Section ── */}
        <div className="mt-8 border border-charcoal rounded-lg bg-near-black overflow-hidden">
          <button
            onClick={() => setShowPlatformRules((prev) => !prev)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-hover-gray transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-volt" />
              <div>
                <span className="text-xs font-black text-white">Platform rules</span>
                <span className="text-[11px] text-silver ml-2">({PLATFORM_RULES.length} standards)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-silver">
              <span>{showPlatformRules ? 'Hide rules' : 'View platform rules'}</span>
              {showPlatformRules ? (
                <ChevronUp className="w-4 h-4 text-silver" />
              ) : (
                <ChevronDown className="w-4 h-4 text-silver" />
              )}
            </div>
          </button>

          {showPlatformRules && (
            <div className="border-t border-charcoal p-5 bg-black divide-y divide-charcoal">
              {PLATFORM_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 text-xs"
                >
                  <div className="max-w-2xl">
                    <div className="font-bold text-white">{rule.rule}</div>
                    <div className="text-[11px] text-silver mt-0.5">{rule.value}</div>
                  </div>

                  <div className="text-[11px] shrink-0">
                    {rule.sourceUrl ? (
                      <a
                        href={rule.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-volt hover:underline font-bold inline-flex items-center gap-1"
                      >
                        {`Source: ${rule.sourceName}, last checked ${rule.lastCheckedDate}`}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-silver italic px-2 py-0.5 rounded bg-near-black border border-charcoal">
                        Source pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Honesty Footer (Strictly pre-written, client-side only) ── */}
        <div className="mt-12 pt-6 border-t border-charcoal text-center">
          <p className="text-xs font-semibold text-silver">
            Pre-written templates. Nothing you type leaves your browser.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReachOutPage;
