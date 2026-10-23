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
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderCls: 'border-emerald-500',
    bgCls: 'bg-emerald-500/10',
    textCls: 'text-emerald-600',
  },
  linkedin_connect: {
    label: 'LinkedIn Connect (300 char)',
    shortLabel: 'Connect',
    icon: MessageSquare,
    badgeCls: 'bg-sky-50 text-sky-700 border-sky-200',
    borderCls: 'border-sky-500',
    bgCls: 'bg-sky-500/10',
    textCls: 'text-sky-600',
  },
  linkedin_inmail: {
    label: 'LinkedIn InMail',
    shortLabel: 'InMail',
    icon: Send,
    badgeCls: 'bg-purple-50 text-purple-700 border-purple-200',
    borderCls: 'border-purple-500',
    bgCls: 'bg-purple-500/10',
    textCls: 'text-purple-600',
  },
  warm_referral: {
    label: 'Warm Referral',
    shortLabel: 'Referral',
    icon: Users,
    badgeCls: 'bg-amber-50 text-amber-800 border-amber-200',
    borderCls: 'border-amber-500',
    bgCls: 'bg-amber-500/10',
    textCls: 'text-amber-600',
  },
  follow_up: {
    label: 'Follow-Up',
    shortLabel: 'Follow-Up',
    icon: Clock,
    badgeCls: 'bg-rose-50 text-rose-700 border-rose-200',
    borderCls: 'border-rose-500',
    bgCls: 'bg-rose-500/10',
    textCls: 'text-rose-600',
  },
  direct_message: {
    label: 'Direct Message',
    shortLabel: 'DM',
    icon: Zap,
    badgeCls: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    borderCls: 'border-cyan-500',
    bgCls: 'bg-cyan-500/10',
    textCls: 'text-cyan-600',
  },
  reply: {
    label: 'Reply Handling',
    shortLabel: 'Reply',
    icon: RefreshCw,
    badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    borderCls: 'border-indigo-500',
    bgCls: 'bg-indigo-500/10',
    textCls: 'text-indigo-600',
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
    gradient: 'from-blue-600 to-sky-500',
    pillBorder: 'border-blue-200',
    pillBg: 'bg-blue-50',
    pillText: 'text-blue-700',
    accentBg: 'bg-blue-500/10',
    tagline: 'Technical recruiters & talent acquisition scouts',
  },
  'first-touch-engineers': {
    id: 'first-touch-engineers',
    icon: Code2,
    gradient: 'from-indigo-600 to-purple-600',
    pillBorder: 'border-indigo-200',
    pillBg: 'bg-indigo-50',
    pillText: 'text-indigo-700',
    accentBg: 'bg-indigo-500/10',
    tagline: 'Engineering managers, tech leads & staff engineers',
  },
  'campus-fresher-programs': {
    id: 'campus-fresher-programs',
    icon: GraduationCap,
    gradient: 'from-emerald-600 to-teal-500',
    pillBorder: 'border-emerald-200',
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-700',
    accentBg: 'bg-emerald-500/10',
    tagline: 'Off-campus drives, university relations, TPO & PPO conversions',
  },
  'alumni-mutual-warm': {
    id: 'alumni-mutual-warm',
    icon: Users,
    gradient: 'from-amber-600 to-orange-500',
    pillBorder: 'border-amber-200',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-800',
    accentBg: 'bg-amber-500/10',
    tagline: 'College alumni, department seniors & mutual connections',
  },
  'startup-founder-direct': {
    id: 'startup-founder-direct',
    icon: Rocket,
    gradient: 'from-rose-600 to-pink-500',
    pillBorder: 'border-rose-200',
    pillBg: 'bg-rose-50',
    pillText: 'text-rose-700',
    accentBg: 'bg-rose-500/10',
    tagline: 'Early-stage founders, CTOs & founding engineer roles',
  },
  'referral-engine': {
    id: 'referral-engine',
    icon: Award,
    gradient: 'from-cyan-600 to-blue-600',
    pillBorder: 'border-cyan-200',
    pillBg: 'bg-cyan-50',
    pillText: 'text-cyan-800',
    accentBg: 'bg-cyan-500/10',
    tagline: 'Forwardable blurbs, Job ID asks & low-friction referrals',
  },
  'open-source-portfolio': {
    id: 'open-source-portfolio',
    icon: Sparkles,
    gradient: 'from-violet-600 to-indigo-600',
    pillBorder: 'border-violet-200',
    pillBg: 'bg-violet-50',
    pillText: 'text-violet-700',
    accentBg: 'bg-violet-500/10',
    tagline: 'Merged PRs, system architecture, teardowns & demo shares',
  },
  'follow-ups': {
    id: 'follow-ups',
    icon: Clock,
    gradient: 'from-red-600 to-rose-600',
    pillBorder: 'border-red-200',
    pillBg: 'bg-red-50',
    pillText: 'text-red-700',
    accentBg: 'bg-red-500/10',
    tagline: '5-day value adds, calm check-ins & polite loop closures',
  },
  'interview-lifecycle': {
    id: 'interview-lifecycle',
    icon: CheckCircle2,
    gradient: 'from-teal-600 to-cyan-600',
    pillBorder: 'border-teal-200',
    pillBg: 'bg-teal-50',
    pillText: 'text-teal-700',
    accentBg: 'bg-teal-500/10',
    tagline: 'Post-OA confirmations, thank-you notes & status checks',
  },
  'informational-chats': {
    id: 'informational-chats',
    icon: MessageSquare,
    gradient: 'from-yellow-600 to-amber-600',
    pillBorder: 'border-amber-200',
    pillBg: 'bg-amber-50',
    pillText: 'text-amber-800',
    accentBg: 'bg-amber-500/10',
    tagline: '15-minute stack discussions & engineering decision advice',
  },
  're-engagement-replies': {
    id: 're-engagement-replies',
    icon: RefreshCw,
    gradient: 'from-slate-700 to-indigo-700',
    pillBorder: 'border-slate-300',
    pillBg: 'bg-slate-100',
    pillText: 'text-slate-800',
    accentBg: 'bg-slate-500/10',
    tagline: '6-month re-engagement, no-headcount replies & logistics',
  },
  'events-community': {
    id: 'events-community',
    icon: Zap,
    gradient: 'from-emerald-600 to-green-600',
    pillBorder: 'border-emerald-200',
    pillBg: 'bg-emerald-50',
    pillText: 'text-emerald-700',
    accentBg: 'bg-emerald-500/10',
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
    portfolio: 'github.com/myname/portfolio',
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
  const [showPlatformRules, setShowPlatformRules] = useState<boolean>(false);
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
      portfolio: 'github.com/myname/portfolio',
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
    <div className="min-h-screen bg-bg text-text pb-24 font-sans selection:bg-primary/20 selection:text-primary">
      {/* ── Top Bar / Breadcrumb ── */}
      <div className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/tools/career-path"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text font-bold px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors border border-transparent hover:border-border"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tools Hub
            </Link>
            <span className="text-border">/</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3 text-primary animate-pulse" />
              Reach Out Engine
            </span>
            <span className="text-sm font-extrabold text-text hidden sm:inline">
              Cold Outreach Generator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tools/tracker"
              className="px-3.5 py-1.5 text-xs font-bold bg-surface hover:bg-surface-2 border border-border rounded-xl text-text transition-all hover:shadow-xs flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              Application Tracker
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ── Page Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2">
                Reach Out — Cold Outreach Generator
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                Targeted outreach playbooks across 12 hiring scenarios: select a topic below to spawn matching cold emails, InMails, referrals, and LinkedIn connection notes.
              </p>
            </div>
          </div>
        </div>

        {/* ── Interactive Input Requirements Panel (Accessible on every view) ── */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 mb-8 shadow-sm transition-all">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-text">Outreach Slot Inputs & Personalization</h2>
                  {hasUnsavedChanges ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                      ● Unsaved Changes — Click Confirm to Apply
                    </span>
                  ) : justConfirmed ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Changes Confirmed & Applied!
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      ✓ Synchronized
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Fields with <span className="text-red-500 font-bold">* Required</span> auto-fill your templates. Edit anywhere and click "Confirm & Apply Changes".
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Market-Standard Evidence Preset Selector */}
              <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl px-2.5 py-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-text-muted">Evidence Preset:</span>
                <select
                  onChange={(e) => handleApplyEvidencePreset(e.target.value)}
                  className="bg-transparent text-xs font-bold text-text focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Load Market Evidence Example...</option>
                  {EVIDENCE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Pick Company Dropdown */}
              <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl px-2.5 py-1">
                <Building2 className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[11px] font-semibold text-text-muted">Company Preset:</span>
                <select
                  onChange={(e) => handleSelectCompany(e.target.value)}
                  className="bg-transparent text-xs font-bold text-text focus:outline-none cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Select Company...</option>
                  {COMPANIES.slice(0, 30).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.tier})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset to defaults */}
              <button
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset to default slots"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>

              {/* Toggle Collapse */}
              <button
                onClick={() => setShowInputsDrawer((prev) => !prev)}
                className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:text-text hover:bg-surface-2 transition-colors flex items-center gap-1 cursor-pointer"
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
                className={`px-5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  hasUnsavedChanges
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white scale-[1.02] ring-2 ring-primary/40 ring-offset-2'
                    : 'bg-primary hover:bg-primary/90 text-white'
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
                <div className="bg-surface-2/60 border border-border rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 uppercase tracking-wider pb-1 border-b border-border/80">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    1. Target Position
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-text">Target Company</label>
                      <span className="text-[10px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="e.g. Razorpay, Swiggy, Zepto"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-text">Target Role</label>
                      <span className="text-[10px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.role || ''}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="e.g. Backend Engineer, Fullstack SDE"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-text">Recipient Type</label>
                      <span className="text-[10px] text-text-muted">Target audience</span>
                    </div>
                    <select
                      value={draftSlots.recipient_type || 'Recruiter'}
                      onChange={(e) => handleInputChange('recipient_type', e.target.value)}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    >
                      <option value="Recruiter">Recruiter / Talent Scout</option>
                      <option value="Hiring Manager">Hiring Manager / Tech Lead</option>
                      <option value="Peer Engineer">Peer Engineer / Senior SDE</option>
                      <option value="Alumnus">College Alumnus</option>
                      <option value="Founder/CTO">Founder / CTO</option>
                      <option value="Referrer">Referrer / Team Member</option>
                      <option value="Campus Recruiter">Campus Recruiter / University Relations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">Requisition / Job ID (Optional)</label>
                    <input
                      type="text"
                      value={draftSlots.job_id || ''}
                      onChange={(e) => handleInputChange('job_id', e.target.value)}
                      placeholder="e.g. REQ-0482 or Job URL"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                {/* ── Column 2: Candidate Technical Proof Points ── */}
                <div className="bg-surface-2/60 border border-border rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider pb-1 border-b border-border/80">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    2. Technical Proof Points
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-text">Primary Stack & Skills</label>
                      <span className="text-[10px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.primary_skill || ''}
                      onChange={(e) => handleInputChange('primary_skill', e.target.value)}
                      placeholder="e.g. React & Node.js, Go & Kafka"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-text">Quantified Proof Point</label>
                      <span className="text-[10px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                        * Required
                      </span>
                    </div>
                    <input
                      type="text"
                      value={draftSlots.proof_point || ''}
                      onChange={(e) => handleInputChange('proof_point', e.target.value)}
                      placeholder="e.g. built real-time WebSocket dashboard handling 800+ concurrent users"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">College / University</label>
                    <input
                      type="text"
                      value={draftSlots.college || ''}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      placeholder="e.g. NIT Trichy, IIT Madras, BITS Pilani"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">Portfolio or GitHub Link</label>
                    <input
                      type="text"
                      value={draftSlots.portfolio || ''}
                      onChange={(e) => handleInputChange('portfolio', e.target.value)}
                      placeholder="e.g. github.com/yourname/portfolio"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                {/* ── Column 3: Personalization & Recipient Details ── */}
                <div className="bg-surface-2/60 border border-border rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-purple-700 uppercase tracking-wider pb-1 border-b border-border/80">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    3. Recipient & Personalization
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={draftSlots.recipient_name || ''}
                      onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">Personal Hook / Connection Note</label>
                    <input
                      type="text"
                      value={draftSlots.personal_line || ''}
                      onChange={(e) => handleInputChange('personal_line', e.target.value)}
                      placeholder="e.g. Loved your recent post on distributed transaction sagas"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">Admired Project or Feature</label>
                    <input
                      type="text"
                      value={draftSlots.admired_project || ''}
                      onChange={(e) => handleInputChange('admired_project', e.target.value)}
                      placeholder="e.g. UPI payment switch, Real-time dispatch"
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text mb-1">Your Name & Email</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={draftSlots.your_name || ''}
                        onChange={(e) => handleInputChange('your_name', e.target.value)}
                        placeholder="Your Name"
                        className="bg-surface border border-border rounded-xl px-2.5 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                      />
                      <input
                        type="text"
                        value={draftSlots.your_email || ''}
                        onChange={(e) => handleInputChange('your_email', e.target.value)}
                        placeholder="Your Email"
                        className="bg-surface border border-border rounded-xl px-2.5 py-2 text-xs text-text focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action for Confirmation */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-text-muted flex items-center gap-2">
                  <span>Current Target:</span>
                  <span className="font-bold text-text bg-surface-2 px-2 py-0.5 rounded-md border border-border">
                    {appliedSlots.company || 'Not set'}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-text bg-surface-2 px-2 py-0.5 rounded-md border border-border">
                    {appliedSlots.role || 'Not set'}
                  </span>
                  <span>·</span>
                  <span className="font-bold text-text bg-surface-2 px-2 py-0.5 rounded-md border border-border">
                    {appliedSlots.primary_skill || 'Not set'}
                  </span>
                </div>

                <button
                  onClick={handleConfirmChanges}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
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
              <h2 className="text-lg font-black text-text flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Select Outreach Playbook
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Click any topic below to spawn matching cold emails, InMails, referrals, and connection notes with un-hallucinated proof points.
              </p>
            </div>

            {/* Quick Keyword Search */}
            <div className="relative min-w-[260px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates or keywords..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border rounded-xl text-xs text-text focus:outline-none focus:border-primary shadow-2xs"
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
                  className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-surface border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]'
                      : 'bg-surface/80 hover:bg-surface border-border hover:border-border-strong hover:shadow-xs'
                  }`}
                >
                  {/* Top Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${meta.gradient} shadow-xs`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border">
                        {group.count} connects
                      </span>
                    </div>

                    <div className="font-extrabold text-xs text-text group-hover:text-primary transition-colors line-clamp-1">
                      {group.shortLabel}
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {meta.tagline}
                    </div>
                  </div>

                  {/* Bottom Indicator */}
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-secondary">
                      {isSelected ? '● Spawned' : 'Spawn →'}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-transparent'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Spawned Topic View (All connects under this topic) ── */}
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-xs">
          {/* Header of Spawned Topic */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-border">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${currentTopicMeta.gradient} shadow-md shrink-0`}
              >
                {React.createElement(currentTopicMeta.icon, { className: 'w-6 h-6' })}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-primary uppercase tracking-wider">
                    Spawned Topic {currentGroup.number} of 12
                  </span>
                  <span className="text-border">·</span>
                  <span className="text-xs font-bold text-text-muted">
                    {currentTopicTemplates.length} outreach templates ready
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-text mt-0.5">
                  {currentGroup.title}
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
                  {currentGroup.description}
                </p>
              </div>
            </div>

            {/* Topic Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Download all in this topic */}
              <button
                onClick={() => handleDownloadAllInTopic(selectedTopicId)}
                className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text hover:text-primary transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                title="Download all templates in this category as a clean .txt file"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                Download All ({currentTopicTemplates.length})
              </button>

              {/* Quick Input Toggle for this page */}
              <button
                onClick={() => setShowInputsDrawer((prev) => !prev)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                channelFilter === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-3'
              }`}
            >
              All Types ({ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === selectedTopicId).length})
            </button>

            {availableChannelsInTopic.map((chKey) => {
              const ch = CHANNEL_CONFIG[chKey] || {
                label: chKey,
                shortLabel: chKey,
                icon: MessageSquare,
                badgeCls: 'bg-surface-2 text-text-muted',
              };
              const Icon = ch.icon;
              const count = ALL_REACH_OUT_TEMPLATES.filter(
                (t) => t.group === selectedTopicId && t.channel === chKey
              ).length;

              return (
                <button
                  key={chKey}
                  onClick={() => setChannelFilter(chKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                    channelFilter === chKey
                      ? `${ch.badgeCls} ring-2 ring-primary/20 shadow-xs font-extrabold`
                      : 'bg-surface border-border text-text-secondary hover:text-text hover:bg-surface-2'
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
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-text">No matching outreach templates found</p>
              <p className="text-xs text-text-muted mt-1">Try resetting the channel filter or search term.</p>
              <button
                onClick={() => {
                  setChannelFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold"
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
                  badgeCls: 'bg-surface-2 text-text-muted border-border',
                  borderCls: 'border-border',
                  bgCls: 'bg-surface-2',
                  textCls: 'text-text',
                };
                const ChannelIcon = channelConfig.icon;
                const hasPlaceholders = rendered.unresolvedSlots.length > 0;
                const copyKey = tmpl.id;
                const isEditing = editingTemplateId === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    className="bg-surface border border-border hover:border-primary/40 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-sm font-extrabold text-text group-hover:text-primary transition-colors">
                            {tmpl.name}
                          </h3>
                          <div className="text-[11px] text-text-muted mt-0.5">
                            Target Audience:{' '}
                            <span className="font-semibold text-text-secondary">
                              {tmpl.recipientTypes.join(', ')}
                            </span>
                          </div>
                        </div>

                        {/* Channel Badge */}
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 flex items-center gap-1 ${channelConfig.badgeCls}`}
                        >
                          <ChannelIcon className="w-3 h-3" />
                          {channelConfig.shortLabel}
                        </span>
                      </div>

                      {/* Char / Word Count + Progress */}
                      <div className="flex items-center justify-between text-[11px] text-text-muted mb-3 pb-2.5 border-b border-border/80">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{wordCount} words</span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              isLinkedInConnect && charCount > 300 ? 'text-red-500 font-extrabold' : ''
                            }`}
                          >
                            {charCount} {isLinkedInConnect ? '/ 300 chars' : 'characters'}
                          </span>
                        </div>

                        {/* LinkedIn 300 Char Limit Meter */}
                        {isLinkedInConnect && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden border border-border">
                              <div
                                className={`h-full transition-all ${
                                  charCount > 300
                                    ? 'bg-red-500'
                                    : charCount > 270
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, charLimitProgress)}%` }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-extrabold ${
                                300 - charCount >= 0 ? 'text-emerald-600' : 'text-red-500'
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
                        <div className="mb-3 p-3 rounded-xl bg-surface-2/90 border border-border text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-primary font-black uppercase tracking-wider">
                              Subject Line
                            </span>
                            <button
                              onClick={() => handleCopy(`${copyKey}-subject`, rendered.subject!)}
                              className="text-[10px] font-bold text-text-muted hover:text-text cursor-pointer flex items-center gap-1"
                            >
                              {copiedId === `${copyKey}-subject` ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy Subject
                            </button>
                          </div>
                          <div className="font-semibold text-text">{rendered.subject}</div>
                        </div>
                      )}

                      {/* Message Body / Inline Editable Draft */}
                      <div className="mb-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Message Body
                          </span>
                          <button
                            onClick={() => {
                              if (!isEditing && !customDrafts[tmpl.id]) {
                                setCustomDrafts((prev) => ({ ...prev, [tmpl.id]: rendered.body }));
                              }
                              setEditingTemplateId(isEditing ? null : tmpl.id);
                            }}
                            className="text-[10px] font-bold text-text-secondary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-primary" />
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
                            className="w-full p-3.5 rounded-xl bg-surface border-2 border-primary/50 text-xs text-text font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                          />
                        ) : (
                          <div className="p-4 rounded-xl bg-surface-2/70 border border-border/80 text-xs text-text font-mono leading-relaxed whitespace-pre-wrap select-all">
                            {bodyText}
                          </div>
                        )}
                      </div>

                      {/* Placeholder Tracker / Status */}
                      <div className="mb-3">
                        {hasPlaceholders ? (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold">
                                {rendered.unresolvedSlots.length} slot
                                {rendered.unresolvedSlots.length > 1 ? 's' : ''} need input:
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rendered.unresolvedSlots.map((slot, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] border border-amber-300"
                                  >
                                    {slot}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-700 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Ready to send — 0 placeholders remaining
                          </div>
                        )}
                      </div>

                      {/* Best Practice Guidance */}
                      <div className="p-2.5 rounded-xl bg-surface-2 border border-border text-[11px] text-text-muted leading-relaxed mb-3">
                        <span className="font-bold text-text-secondary">When to use: </span>
                        {tmpl.whenToUse}
                      </div>

                      {/* Mandatory Limits Notice */}
                      <div className="p-2 rounded-xl bg-surface-2/60 border border-border/70 text-[11px] text-text-muted leading-relaxed mb-4">
                        Replies depend on your profile, timing and the company's hiring state. No template can guarantee one.
                      </div>

                      {/* Optional Review Status Line (renders only when filled) */}
                      {tmpl.reviewedBy?.name && tmpl.reviewedBy?.role && tmpl.reviewedBy?.date && (
                        <div className="text-[11px] text-text-muted pb-3 border-b border-border/60">
                          Reviewed by {tmpl.reviewedBy.name}, {tmpl.reviewedBy.role}, {tmpl.reviewedBy.date}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                      <Link
                        to="/tools/tracker"
                        className="text-xs font-semibold text-text-secondary hover:text-text flex items-center gap-1"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        Log in Tracker
                      </Link>

                      <div className="flex items-center gap-2">
                        {/* Download as .txt */}
                        <button
                          onClick={() => handleDownloadSingle(tmpl, rendered.subject, bodyText)}
                          className="px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Download message as .txt"
                        >
                          <Download className="w-3.5 h-3.5 text-text-muted" />
                          Download
                        </button>

                        {/* Copy to Clipboard */}
                        <button
                          onClick={() =>
                            handleCopy(
                              copyKey,
                              rendered.subject ? `Subject: ${rendered.subject}\n\n${bodyText}` : bodyText
                            )
                          }
                          className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
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
        <div className="mt-8 border border-border rounded-2xl bg-surface overflow-hidden shadow-2xs">
          <button
            onClick={() => setShowPlatformRules((prev) => !prev)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-primary" />
              <div>
                <span className="text-xs font-extrabold text-text">Platform rules</span>
                <span className="text-[11px] text-text-muted ml-2">({PLATFORM_RULES.length} standards)</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <span>{showPlatformRules ? 'Hide rules' : 'View platform rules'}</span>
              {showPlatformRules ? (
                <ChevronUp className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              )}
            </div>
          </button>

          {showPlatformRules && (
            <div className="border-t border-border p-5 bg-surface-2/30 divide-y divide-border/60">
              {PLATFORM_RULES.map((rule, idx) => (
                <div
                  key={idx}
                  className="py-3 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 text-xs"
                >
                  <div className="max-w-2xl">
                    <div className="font-extrabold text-text">{rule.rule}</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{rule.value}</div>
                  </div>

                  <div className="text-[11px] shrink-0">
                    {rule.sourceUrl ? (
                      <a
                        href={rule.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                      >
                        Source: {rule.sourceName}, last checked {rule.lastCheckedDate}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-text-muted italic px-2 py-0.5 rounded bg-surface border border-border">
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
        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs font-semibold text-text-muted">
            Pre-written templates. Nothing you type leaves your browser.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReachOutPage;
