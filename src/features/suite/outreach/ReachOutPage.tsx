// ============================================================
// HireFlow Suite - Reach Out (/tools/reach-out)
// Original card-grid UI restored.
// Original 15 templates shown at top as always.
// New 50 v2 templates shown below as collapsible scenario subsections
// in the same card style — no separate layout or dark redesign.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
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
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  generateOutreach,
  extractSlotsFromProfile,
  OutreachSlots,
  OutreachChannel,
  RecipientType,
  GeneratedMessage,
} from './generateOutreach';
import { useProfile } from '../profile/ProfileContext';
import { COMPANIES } from '../../../pages/demo/talentLensData';
import {
  ALL_REACH_OUT_TEMPLATES,
  SCENARIO_GROUPS,
} from '../../reach-out/data';
import { renderReachOutMessage } from '../../reach-out/engine/slotResolver';
import { ReachOutSlots } from '../../reach-out/types';

const CHANNELS: { id: OutreachChannel | 'all'; label: string }[] = [
  { id: 'all', label: 'All Channels (15)' },
  { id: 'linkedin_connect', label: 'LinkedIn Connect (300 char)' },
  { id: 'linkedin_inmail', label: 'LinkedIn InMail' },
  { id: 'cold_email', label: 'Cold Email' },
  { id: 'warm_referral', label: 'Warm Referral' },
  { id: 'follow_up', label: 'Follow-Up' },
];

const CHANNEL_BADGE: Record<string, string> = {
  linkedin_connect: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  linkedin_inmail: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cold_email: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warm_referral: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  follow_up: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  direct_message: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  reply: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export function ReachOutPage() {
  const { profile } = useProfile();

  // ── Original 15 template state ──────────────────────────────
  const [activeChannel, setActiveChannel] = useState<OutreachChannel | 'all'>('all');
  const [targetCompany, setTargetCompany] = useState<string>('Razorpay');
  const [targetRole, setTargetRole] = useState<string>('Backend Engineer');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientRole, setRecipientRole] = useState<RecipientType>('Recruiter');
  const [recipientTitle, setRecipientTitle] = useState<string>('Technical Recruiter');
  const [primarySkill, setPrimarySkill] = useState<string>('Node.js & PostgreSQL');
  const [proofPoint, setProofPoint] = useState<string>('scaled REST APIs reducing latency by 45%');
  const [commonGround, setCommonGround] = useState<string>('distributed fintech architecture');
  const [collegeName, setCollegeName] = useState<string>('');
  const [admiredProject, setAdmiredProject] = useState<string>('UPI payment switch');
  const [portfolioLink, setPortfolioLink] = useState<string>('github.com/myname/portfolio');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Extended library state ──────────────────────────────────
  const [showExtended, setShowExtended] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Sync from profile
  useEffect(() => {
    if (profile) {
      const extracted = extractSlotsFromProfile(profile, targetCompany, targetRole);
      if (extracted.primarySkill) setPrimarySkill(extracted.primarySkill);
      if (extracted.proofPoint) setProofPoint(extracted.proofPoint);
      if (extracted.collegeName) setCollegeName(extracted.collegeName);
      if (extracted.portfolioLink) setPortfolioLink(extracted.portfolioLink);
      if (extracted.targetCompany) setTargetCompany(extracted.targetCompany);
      if (extracted.targetRole) setTargetRole(extracted.targetRole);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const handleSelectCompany = (compName: string) => {
    const comp = COMPANIES.find((c) => c.name === compName || c.id === compName);
    if (!comp) return;
    setTargetCompany(comp.name);
    if (comp.roles[0]) {
      setTargetRole(comp.roles[0].title);
      setPrimarySkill(comp.roles[0].competencies.slice(0, 3).join(', '));
    }
    setAdmiredProject(`${comp.name}'s ${comp.industry} platform`);
  };

  const currentSlots: OutreachSlots = useMemo(() => ({
    targetCompany,
    targetRole,
    recipientName: recipientName || undefined,
    recipientRole,
    recipientTitle: recipientTitle || undefined,
    primarySkill: primarySkill || undefined,
    proofPoint: proofPoint || undefined,
    commonGround: commonGround || undefined,
    collegeName: collegeName || undefined,
    admiredProject: admiredProject || undefined,
    portfolioLink: portfolioLink || undefined,
    candidateName: profile?.identity?.name || undefined,
    candidateEmail: profile?.identity?.email || undefined,
  }), [
    targetCompany, targetRole, recipientName, recipientRole, recipientTitle,
    primarySkill, proofPoint, commonGround, collegeName, admiredProject,
    portfolioLink, profile,
  ]);

  const messages: GeneratedMessage[] = useMemo(
    () => generateOutreach(currentSlots, activeChannel),
    [currentSlots, activeChannel]
  );

  // Shared slots for v2 templates — map from the same inputs above
  const v2Slots: ReachOutSlots = useMemo(() => ({
    company: targetCompany,
    role: targetRole,
    recipient_name: recipientName || 'Recipient',
    recipient_type: recipientRole as any,
    primary_skill: primarySkill,
    proof_point: proofPoint,
    college: collegeName || 'your college',
    admired_project: admiredProject,
    portfolio: portfolioLink,
    your_name: profile?.identity?.name || '[Your Name]',
    your_email: profile?.identity?.email || '[Your Email]',
    batch_year: '2026',
    source_trigger: 'your recent engineering post',
    event_name: 'GopherCon India',
    talk_topic: 'distributed systems',
    interviewer_topic: 'system design trade-offs',
    days_since_last_contact: 7,
    availability_date: 'Immediate',
    notice_period: 'Immediate / 15 days',
    location_preference: 'Bengaluru / Remote',
    personal_line: 'Your team\'s open-source work directly influenced my recent project.',
    what_changed: 'shipped production microservices',
    referrer_relationship: 'former_colleague',
    job_id: 'REQ-0001',
  }), [
    targetCompany, targetRole, recipientName, recipientRole,
    primarySkill, proofPoint, collegeName, admiredProject, portfolioLink, profile,
  ]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* Sticky Top Bar */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/tools/career-path"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text font-semibold px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Tools Hub
            </Link>
            <span className="text-border">/</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Group B: Present
            </span>
            <span className="text-sm font-bold text-text">Reach Out</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/tools/tracker"
              className="px-3 py-1.5 text-xs font-semibold bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-text transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-text-secondary" />
              Log in Application Tracker
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight flex items-center gap-2.5">
            <Send className="w-7 h-7 text-primary" />
            Reach Out — Cold Outreach Generator
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Deterministic slot-filling cold outreach messages with strict length limits, un-hallucinated proof points, and real-time placeholder tracking.
          </p>
        </div>

        {/* ── Slot Inputs Grid ── */}
        <div className="bg-surface border border-border rounded-2xl p-5 mb-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Outreach Slot Inputs (Auto-filled from Profile where available)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-muted">Target Company Quick Pick:</span>
              <select
                onChange={(e) => handleSelectCompany(e.target.value)}
                className="bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs text-text focus:outline-none focus:border-primary"
              >
                <option value="">Select from Companies...</option>
                {COMPANIES.slice(0, 30).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Company */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Target Company *</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Razorpay"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* Role */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Target Role *</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Backend Engineer"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* Recipient Name */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* Recipient Role */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Recipient Type</label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value as RecipientType)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              >
                <option value="Recruiter">Recruiter</option>
                <option value="Hiring Manager">Hiring Manager</option>
                <option value="Peer Engineer">Peer Engineer</option>
                <option value="Alumnus">Alumnus</option>
                <option value="Founder/CTO">Founder/CTO</option>
                <option value="Referrer">Referrer</option>
                <option value="Campus Recruiter">Campus Recruiter</option>
              </select>
            </div>
            {/* Primary Skill */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Primary Skill *</label>
              <input
                type="text"
                value={primarySkill}
                onChange={(e) => setPrimarySkill(e.target.value)}
                placeholder="e.g. Go & Distributed Systems"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* Proof Point */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Quantified Proof Point *</label>
              <input
                type="text"
                value={proofPoint}
                onChange={(e) => setProofPoint(e.target.value)}
                placeholder="e.g. reduced tail latency by 35% on 5k req/s"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* Common Ground */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Common Ground / Interest</label>
              <input
                type="text"
                value={commonGround}
                onChange={(e) => setCommonGround(e.target.value)}
                placeholder="e.g. distributed fintech systems"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* College */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">College / University</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. NIT Trichy"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* Admired Project */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Admired Project / Feature</label>
              <input
                type="text"
                value={admiredProject}
                onChange={(e) => setAdmiredProject(e.target.value)}
                placeholder="e.g. UPI payment switch"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
            {/* Portfolio */}
            <div>
              <label className="block text-[11px] font-semibold text-text-muted mb-1">Portfolio / GitHub Link</label>
              <input
                type="text"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                placeholder="github.com/yourname/portfolio"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* ── Channel Filter Tabs ── */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeChannel === ch.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* ── Original 15 Templates (card grid) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {messages.map((msg) => {
            const isLinkedInConnect = msg.channel === 'linkedin_connect';
            const charLimitProgress = isLinkedInConnect ? Math.round((msg.charCount / 300) * 100) : 0;
            const badgeClass = CHANNEL_BADGE[msg.channel] || 'bg-surface-2 text-text-muted border-border';

            return (
              <div
                key={msg.templateId}
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between shadow-xs"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-text">{msg.name}</h3>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        For: <span className="font-semibold text-text-secondary">{msg.targetAudience}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${badgeClass}`}>
                      {msg.channel.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Char / Word count */}
                  <div className="flex items-center justify-between text-[11px] text-text-muted mb-3 pb-2 border-b border-border/80">
                    <div className="flex items-center gap-3">
                      <span>{msg.wordCount} words</span>
                      <span>·</span>
                      <span className={msg.exceedsLimit ? 'text-red-400 font-bold' : ''}>
                        {msg.charCount} {isLinkedInConnect ? '/ 300' : 'chars'}
                      </span>
                    </div>
                    {isLinkedInConnect && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden border border-border">
                          <div
                            className={`h-full ${msg.charCount > 300 ? 'bg-red-500' : msg.charCount > 270 ? 'bg-amber-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min(100, charLimitProgress)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold">
                          {300 - msg.charCount >= 0 ? `${300 - msg.charCount} left` : 'OVER LIMIT'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  {msg.subject && (
                    <div className="mb-3 p-2.5 rounded-xl bg-surface-2 border border-border text-xs">
                      <div className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Subject Line</div>
                      <div className="font-semibold text-text">{msg.subject}</div>
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-xs text-text font-mono leading-relaxed whitespace-pre-wrap mb-4">
                    {msg.body}
                  </div>

                  {/* Placeholder badge */}
                  <div className="mb-4">
                    {msg.placeholdersCount > 0 ? (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">{msg.placeholdersCount} placeholder{msg.placeholdersCount > 1 ? 's' : ''} need input:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.placeholders.map((p, pIdx) => (
                              <span key={pIdx} className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready to send — 0 placeholders remaining
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Link to="/tools/tracker" className="text-xs font-semibold text-text-secondary hover:text-text flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-primary" />
                    Log in Tracker
                  </Link>
                  <button
                    onClick={() => handleCopy(msg.templateId, msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body)}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    {copiedId === msg.templateId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === msg.templateId ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Extended Outreach Library (50 v2 templates) ── */}
        <div className="mb-8">
          <button
            onClick={() => setShowExtended((prev) => !prev)}
            className="w-full flex items-center justify-between px-5 py-4 bg-surface border border-border rounded-2xl hover:bg-surface-2 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-primary" />
              <div className="text-left">
                <div className="text-sm font-bold text-text">Extended Outreach Library</div>
                <div className="text-xs text-text-muted mt-0.5">
                  50 additional outreach templates across 12 scenario groups — alumni, startup founders, open source, referrals, events, interview lifecycle, and more
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                50 templates
              </span>
              {showExtended ? (
                <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-text transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text transition-colors" />
              )}
            </div>
          </button>

          {showExtended && (
            <div className="mt-4 space-y-4">
              {SCENARIO_GROUPS.map((group) => {
                const groupTemplates = ALL_REACH_OUT_TEMPLATES.filter((t) => t.group === group.id);
                const isExpanded = expandedGroups.has(group.id);

                return (
                  <div key={group.id} className="border border-border rounded-2xl overflow-hidden">
                    {/* Group accordion header */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-surface hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-text-muted w-6 text-right">
                          {group.number}.
                        </span>
                        <div className="text-left">
                          <div className="text-sm font-bold text-text">{group.title}</div>
                          <div className="text-[11px] text-text-muted mt-0.5">{group.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary border border-border">
                          {group.count} templates
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                    </button>

                    {/* Group expanded card grid */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-bg grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {groupTemplates.map((tmpl) => {
                          const rendered = renderReachOutMessage(tmpl, v2Slots, { openerIndex: 0, subjectIndex: 0 });
                          const isLiConnect = tmpl.channel === 'linkedin_connect';
                          const badgeClass = CHANNEL_BADGE[tmpl.channel] || 'bg-surface-2 text-text-muted border-border';
                          const hasPlaceholders = rendered.unresolvedSlots.length > 0;
                          const copyKey = `v2-${tmpl.id}`;

                          return (
                            <div
                              key={tmpl.id}
                              className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between"
                            >
                              <div>
                                {/* Header */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <h3 className="text-xs font-bold text-text">{tmpl.name}</h3>
                                    <div className="text-[11px] text-text-muted mt-0.5">
                                      For: <span className="font-semibold text-text-secondary">{tmpl.recipientTypes.join(', ')}</span>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${badgeClass}`}>
                                    {tmpl.channel.replace(/_/g, ' ')}
                                  </span>
                                </div>

                                {/* Char/word count */}
                                <div className="flex items-center gap-3 text-[11px] text-text-muted mb-2 pb-2 border-b border-border/60">
                                  <span>{rendered.wordCount} words</span>
                                  <span>·</span>
                                  <span className={isLiConnect && rendered.charCount > 300 ? 'text-red-400 font-bold' : ''}>
                                    {rendered.charCount} {isLiConnect ? '/ 300' : 'chars'}
                                  </span>
                                  {isLiConnect && (
                                    <div className="w-12 h-1 bg-surface-2 rounded-full overflow-hidden border border-border ml-1">
                                      <div
                                        className={`h-full ${rendered.charCount > 300 ? 'bg-red-500' : rendered.charCount > 270 ? 'bg-amber-500' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(100, (rendered.charCount / 300) * 100)}%` }}
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* Subject */}
                                {rendered.subject && (
                                  <div className="mb-2 p-2 rounded-lg bg-surface-2 border border-border text-xs">
                                    <div className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Subject</div>
                                    <div className="font-semibold text-text text-[11px]">{rendered.subject}</div>
                                  </div>
                                )}

                                {/* Body */}
                                <div className="p-3 rounded-lg bg-surface-2 border border-border/80 text-[11px] text-text font-mono leading-relaxed whitespace-pre-wrap mb-3">
                                  {rendered.body}
                                </div>

                                {/* Placeholder / ready badge */}
                                <div className="mb-3">
                                  {hasPlaceholders ? (
                                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-1.5 text-xs text-amber-400">
                                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-bold">{rendered.unresolvedSlots.length} field{rendered.unresolvedSlots.length > 1 ? 's' : ''} need input: </span>
                                        <span className="font-mono text-[10px]">{rendered.unresolvedSlots.slice(0, 4).join(', ')}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Ready to send
                                    </div>
                                  )}
                                </div>

                                {/* Guidance pill */}
                                <div className="text-[10px] text-text-muted bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 leading-relaxed">
                                  <span className="font-semibold text-text-secondary">When to use: </span>
                                  {tmpl.whenToUse}
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="pt-3 border-t border-border flex items-center justify-between gap-2 mt-3">
                                <Link to="/tools/tracker" className="text-[11px] font-semibold text-text-secondary hover:text-text flex items-center gap-1">
                                  <Briefcase className="w-3 h-3 text-primary" />
                                  Log in Tracker
                                </Link>
                                <button
                                  onClick={() => handleCopy(
                                    copyKey,
                                    rendered.subject ? `Subject: ${rendered.subject}\n\n${rendered.body}` : rendered.body
                                  )}
                                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  {copiedId === copyKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copiedId === copyKey ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReachOutPage;
