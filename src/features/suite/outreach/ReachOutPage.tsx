// ============================================================
// Suite UI — Reach Out (/tools/reach-out)
// Decision Group: "How do I present myself better?"
// Cold outreach message generator across 5 channels:
// LinkedIn connect (300 char limit), InMail, Cold email, Referral, Follow-up.
// Deterministic slot-filling, live char counters, and placeholder detection.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Send,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Building2,
  User,
  GraduationCap,
  Briefcase,
  HelpCircle,
  ExternalLink,
  PlusCircle,
  Share2,
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

const CHANNELS: { id: OutreachChannel | 'all'; label: string }[] = [
  { id: 'all', label: 'All Channels (15)' },
  { id: 'linkedin_connect', label: 'LinkedIn Connect (300 char)' },
  { id: 'linkedin_inmail', label: 'LinkedIn InMail' },
  { id: 'cold_email', label: 'Cold Email' },
  { id: 'warm_referral', label: 'Warm Referral' },
  { id: 'follow_up', label: 'Follow-Up' },
];

export function ReachOutPage() {
  const { profile } = useProfile();

  // Channel filter
  const [activeChannel, setActiveChannel] = useState<OutreachChannel | 'all'>('all');

  // Slot inputs
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

  // Copy toast state: templateId -> boolean
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize from CandidateProfile if available
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
  }, [profile]);

  // Handle Quick Company Select from Dataset 6
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

  const currentSlots: OutreachSlots = useMemo(() => {
    return {
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
    };
  }, [
    targetCompany,
    targetRole,
    recipientName,
    recipientRole,
    recipientTitle,
    primarySkill,
    proofPoint,
    commonGround,
    collegeName,
    admiredProject,
    portfolioLink,
    profile,
  ]);

  const messages: GeneratedMessage[] = useMemo(() => {
    return generateOutreach(currentSlots, activeChannel);
  }, [currentSlots, activeChannel]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* Top Banner */}
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
            Deterministic slot-filling cold outreach messages with strict length limits, un-hallucinated proof points from your candidate profile, and real-time placeholder tracking.
          </p>
        </div>

        {/* Slot Inputs Grid */}
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
                <option value="">Select from 100 Companies...</option>
                {COMPANIES.slice(0, 25).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.tier})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Target Company */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Target Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Razorpay, Swiggy, Google"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Backend Engineer, Frontend SDE-2"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Recipient Audience */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Recipient Type</label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value as RecipientType)}
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              >
                <option value="Recruiter">Recruiter / Talent Partner</option>
                <option value="Hiring Manager">Hiring Manager / Tech Lead</option>
                <option value="Peer Engineer">Peer Software Engineer</option>
                <option value="Alumnus">Alumnus / Second-degree Connection</option>
              </select>
            </div>

            {/* Recipient Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Recipient Name (Optional)</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sarah / leave empty for [Recipient Name]"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Primary Skill */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Primary Skill / Stack</label>
              <input
                type="text"
                value={primarySkill}
                onChange={(e) => setPrimarySkill(e.target.value)}
                placeholder="e.g. Node.js & TypeScript"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Proof Point */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Candidate's #1 Proof Point</label>
              <input
                type="text"
                value={proofPoint}
                onChange={(e) => setProofPoint(e.target.value)}
                placeholder="e.g. scaled REST APIs reducing latency by 45%"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* College Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">College / University</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. IIT Delhi, BITS Pilani"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Admired Project */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Admired Project / Feature</label>
              <input
                type="text"
                value={admiredProject}
                onChange={(e) => setAdmiredProject(e.target.value)}
                placeholder="e.g. real-time order tracking"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Portfolio / GitHub Link</label>
              <input
                type="text"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                placeholder="e.g. github.com/username"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Channel Filter Tabs */}
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

        {/* Generated Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {messages.map((msg) => {
            const isLinkedInConnect = msg.channel === 'linkedin_connect';
            const charLimitProgress = isLinkedInConnect ? Math.round((msg.charCount / 300) * 100) : 0;

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
                        Target Audience: <span className="font-semibold text-text-secondary">{msg.targetAudience}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        msg.channel === 'linkedin_connect'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : msg.channel === 'linkedin_inmail'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : msg.channel === 'cold_email'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : msg.channel === 'warm_referral'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {msg.channel.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Character / Word count bar */}
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
                            className={`h-full ${
                              msg.charCount > 300
                                ? 'bg-red-500'
                                : msg.charCount > 270
                                ? 'bg-amber-500'
                                : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(100, charLimitProgress)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold">
                          {300 - msg.charCount >= 0 ? `${300 - msg.charCount} left` : 'OVER LIMIT'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subject line if email */}
                  {msg.subject && (
                    <div className="mb-3 p-2.5 rounded-xl bg-surface-2 border border-border text-xs">
                      <div className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Subject Line</div>
                      <div className="font-semibold text-text">{msg.subject}</div>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-xs text-text font-mono leading-relaxed whitespace-pre-wrap mb-4">
                    {msg.body}
                  </div>

                  {/* Placeholder Alert Badge */}
                  <div className="mb-4">
                    {msg.placeholdersCount > 0 ? (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">
                            {msg.placeholdersCount} placeholder{msg.placeholdersCount > 1 ? 's' : ''} need input:
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {msg.placeholders.map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]"
                              >
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

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Link
                    to="/tools/tracker"
                    className="text-xs font-semibold text-text-secondary hover:text-text flex items-center gap-1"
                  >
                    <Briefcase className="w-3 h-3 text-primary" />
                    Log in Tracker
                  </Link>

                  <button
                    onClick={() =>
                      handleCopy(
                        msg.templateId,
                        msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    {copiedId === msg.templateId ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedId === msg.templateId ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
