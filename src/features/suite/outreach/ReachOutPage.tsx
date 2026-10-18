// ============================================================
// Suite UI — Reach Out (/tools/reach-out)
// Decision Group: "How do I present myself better?"
// Cold outreach message generator across 6 channels:
// LinkedIn connect (300 char limit), InMail, Cold email, Referral, Follow-up,
// Academic Outreach (professor / admissions).
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
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import {
  generateOutreach,
  extractSlotsFromProfile,
  OutreachSlots,
  OutreachChannel,
  RecipientType,
  GeneratedMessage,
  GroundedOutreachFormat,
  GroundedOutreachVariant,
  GroundedOutreachInput,
  GroundedOutreachResult,
} from './generateOutreach';
import { useProfile } from '../profile/ProfileContext';
import { careers } from '../../../careers-core';

function renderHighlightedOutreachText(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (/^\[[^\]]+\]$/.test(part)) {
          return (
            <span
              key={i}
              className="bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 inline-block mx-0.5"
            >
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

const CHANNELS: { id: OutreachChannel | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Channels (50)', emoji: '🗂️' },
  { id: 'linkedin_connect', label: 'LinkedIn Connect (300 char)', emoji: '🔗' },
  { id: 'linkedin_inmail', label: 'LinkedIn InMail', emoji: '💬' },
  { id: 'cold_email', label: 'Cold Email', emoji: '📧' },
  { id: 'warm_referral', label: 'Warm Referral', emoji: '🤝' },
  { id: 'follow_up', label: 'Follow-Up', emoji: '🔄' },
  { id: 'academic_outreach', label: 'Academic / MS Outreach', emoji: '🎓' },
];

export function ReachOutPage() {
  const { profile } = useProfile();

  // Channel filter
  const [activeChannel, setActiveChannel] = useState<OutreachChannel | 'all'>('all');

  // Slot inputs
  const [targetCompany, setTargetCompany] = useState<string>('Razorpay');
  const [targetRole, setTargetRole] = useState<string>('Backend Engineer');
  const [candidateName, setCandidateName] = useState<string>(profile?.identity?.name || '');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientRole, setRecipientRole] = useState<RecipientType>('Recruiter');
  const [recipientTitle, setRecipientTitle] = useState<string>('Technical Recruiter');
  const [primarySkill, setPrimarySkill] = useState<string>('Node.js & PostgreSQL');
  const [proofPoint, setProofPoint] = useState<string>('scaled REST APIs reducing latency by 45%');
  const [commonGround, setCommonGround] = useState<string>('distributed fintech architecture');
  const [collegeName, setCollegeName] = useState<string>('');
  const [admiredProject, setAdmiredProject] = useState<string>('UPI payment switch');
  const [portfolioLink, setPortfolioLink] = useState<string>('github.com/myname/portfolio');
  // Academic-outreach-specific slots
  const [researchTopic, setResearchTopic] = useState<string>('');
  const [mastersProgram, setMastersProgram] = useState<string>('');

  // Copy toast state: templateId -> boolean
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [blockedCopyId, setBlockedCopyId] = useState<string | null>(null);

  // Grounded Studio Controls (Stage 5)
  const [groundedFormat, setGroundedFormat] = useState<GroundedOutreachFormat>('linkedin');
  const [groundedVariant, setGroundedVariant] = useState<GroundedOutreachVariant>('project-first');
  const [isWhyPanelOpen, setIsWhyPanelOpen] = useState<boolean>(true);
  const [groundedCopied, setGroundedCopied] = useState<boolean>(false);

  // Initialize from CandidateProfile if available
  useEffect(() => {
    if (profile) {
      const extracted = extractSlotsFromProfile(profile, targetCompany, targetRole);
      if (extracted.candidateName) setCandidateName(extracted.candidateName);
      if (extracted.primarySkill) setPrimarySkill(extracted.primarySkill);
      if (extracted.proofPoint) setProofPoint(extracted.proofPoint);
      if (extracted.collegeName) setCollegeName(extracted.collegeName);
      if (extracted.portfolioLink) setPortfolioLink(extracted.portfolioLink);
      if (extracted.targetCompany) setTargetCompany(extracted.targetCompany);
      if (extracted.targetRole) setTargetRole(extracted.targetRole);
    }
  }, [profile]);

  // Handle Quick Company Select from Careers Platform
  const handleSelectCompany = (compName: string) => {
    const comp = careers.companies.get(compName) || careers.companies.list().find((c) => c.name === compName);
    if (!comp) return;
    setTargetCompany(comp.name);
    const roles = careers.roles.forCompany(comp.id);
    if (roles[0]) {
      setTargetRole(roles[0].title);
      const topComps = Object.keys(roles[0].competencies).slice(0, 3);
      setPrimarySkill(topComps.join(', ') || 'Software Engineering');
    }
    setAdmiredProject(`${comp.name}'s ${comp.marketSegment} engineering platform`);
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
      candidateName: candidateName.trim() || profile?.identity?.name || undefined,
      candidateEmail: profile?.identity?.email || undefined,
      researchTopic: researchTopic || undefined,
      mastersProgram: mastersProgram || undefined,
    };
  }, [
    targetCompany,
    targetRole,
    candidateName,
    recipientName,
    recipientRole,
    recipientTitle,
    primarySkill,
    proofPoint,
    commonGround,
    collegeName,
    admiredProject,
    portfolioLink,
    researchTopic,
    mastersProgram,
    profile,
  ]);

  const messages: GeneratedMessage[] = useMemo(() => {
    return generateOutreach(currentSlots, activeChannel);
  }, [currentSlots, activeChannel]);

  const groundedInput: GroundedOutreachInput = useMemo(() => {
    const topProj = profile?.projects?.[0];
    const secProj = profile?.projects?.[1];

    return {
      recipientName: recipientName.trim() || undefined,
      recipientTitle: recipientTitle.trim() || undefined,
      targetCompany: targetCompany.trim() || '',
      targetRole: targetRole.trim() || '',
      candidateName: candidateName.trim() || profile?.identity?.name || undefined,
      candidateEmail: profile?.identity?.email || undefined,
      portfolioLink: portfolioLink.trim() || undefined,
      primarySkill: primarySkill.trim() || undefined,
      topProject: {
        name: topProj?.name || (proofPoint ? 'Core Project' : undefined) || '',
        metric: proofPoint.trim() || topProj?.bullets?.[0] || undefined,
        tech: topProj?.stack || (primarySkill ? primarySkill.split(/[&,]/).map((s) => s.trim()) : undefined),
      },
      secondaryProject: secProj
        ? {
            name: secProj.name,
            metric: secProj.bullets?.[0],
            tech: secProj.stack,
          }
        : undefined,
      credentialOrAward: commonGround.trim() || undefined,
      admiredProjectOrTeam: admiredProject.trim() || undefined,
    };
  }, [
    profile,
    recipientName,
    recipientTitle,
    targetCompany,
    targetRole,
    candidateName,
    portfolioLink,
    primarySkill,
    proofPoint,
    commonGround,
    admiredProject,
  ]);

  const groundedResult: GroundedOutreachResult = useMemo(() => {
    return generateOutreach(groundedInput, groundedFormat, groundedVariant);
  }, [groundedInput, groundedFormat, groundedVariant]);

  const handleCopyGrounded = () => {
    if (!groundedResult.isReadyToSend) return;
    const textToCopy = groundedResult.subject
      ? `Subject: ${groundedResult.subject}\n\n${groundedResult.body}`
      : groundedResult.body;
    navigator.clipboard.writeText(textToCopy);
    setGroundedCopied(true);
    setTimeout(() => setGroundedCopied(false), 2000);
  };

  const handleCopy = (msg: GeneratedMessage) => {
    if (msg.placeholdersCount > 0) {
      setBlockedCopyId(msg.templateId);
      setTimeout(() => setBlockedCopyId(null), 3500);
      return;
    }
    const fullText = msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body;
    navigator.clipboard.writeText(fullText);
    setCopiedId(msg.templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-16">
      {/* Top Banner */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
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
                <option value="">Select from {careers.stats.counts().companies} Companies...</option>
                {careers.companies.list().slice(0, 25).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.marketTier})
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
                <option value="Professor">Professor / Faculty (Academic)</option>
                <option value="Admissions">Admissions Office / Program Director</option>
              </select>
            </div>

            {/* Your Name */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">Your Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Rahul Sharma / leave empty for [Your Name]"
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
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

            {/* Academic: Research Topic */}
            {(activeChannel === 'academic_outreach' || activeChannel === 'all') && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  🎓 Research Topic / Paper Title
                  <span className="ml-1 text-[10px] text-primary font-normal">(Academic only)</span>
                </label>
                <input
                  type="text"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  placeholder="e.g. Federated Learning for NLP, LLM inference optimization"
                  className="w-full bg-surface-2 border border-primary/30 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Academic: Masters Program */}
            {(activeChannel === 'academic_outreach' || activeChannel === 'all') && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  🎓 Masters / PhD Program Name
                  <span className="ml-1 text-[10px] text-primary font-normal">(Academic only)</span>
                </label>
                <input
                  type="text"
                  value={mastersProgram}
                  onChange={(e) => setMastersProgram(e.target.value)}
                  placeholder="e.g. MS in Computer Science, MEng in AI"
                  className="w-full bg-surface-2 border border-primary/30 rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* Grounded Studio Section (Stage 5) */}
        <div className="bg-surface border-2 border-primary/30 rounded-3xl p-6 sm:p-7 mb-10 shadow-lg space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-foreground">
                      Grounded Outreach Studio
                    </h2>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      Provenance Tracked
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Tailored message generation anchored strictly to real candidate facts. Copy is locked until bracketed placeholders are resolved.
                  </p>
                </div>
              </div>
            </div>

            {/* Format & Variant Switchers */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Format Switcher */}
              <div className="inline-flex rounded-xl p-1 bg-surface-2 border border-border">
                {[
                  { id: 'linkedin' as const, label: 'LinkedIn Connect (300 char)' },
                  { id: 'cold_email' as const, label: 'Cold Email (90-130w)' },
                  { id: 'referral' as const, label: 'Referral Request' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setGroundedFormat(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      groundedFormat === f.id
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-foreground hover:bg-surface-3'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Variant Switcher */}
              <div className="inline-flex rounded-xl p-1 bg-surface-2 border border-border">
                {[
                  { id: 'project-first' as const, label: 'Project-First' },
                  { id: 'role-first' as const, label: 'Role-First' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setGroundedVariant(v.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      groundedVariant === v.id
                        ? 'bg-foreground text-background shadow-xs'
                        : 'text-text-secondary hover:text-foreground hover:bg-surface-3'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Facts Used Provenance Bar */}
          <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real Facts Used in Generator:</span>
            </span>
            {groundedResult.factsUsed.length > 0 ? (
              groundedResult.factsUsed.map((fact, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] font-medium"
                >
                  {fact}
                </span>
              ))
            ) : (
              <span className="text-text-muted text-[11px] italic">
                No verified project facts detected in profile yet — using fallback brackets.
              </span>
            )}
          </div>

          {/* Live Message Output Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">
                  {groundedResult.wordCount} words
                </span>
                <span className="text-border">·</span>
                <span className={groundedResult.exceedsLimit ? 'text-red-500 font-bold' : 'text-text-muted'}>
                  {groundedResult.charCount} {groundedFormat === 'linkedin' ? '/ 300 chars' : 'characters'}
                </span>
                <span className="text-border">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {groundedResult.questionMarksCount} Question Mark ({groundedResult.hasClearAsk ? 'Clear Ask' : 'Gentle Ask'})
                </span>
                <span className="text-border">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  0 Banned Phrases
                </span>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                disabled={!groundedResult.isReadyToSend}
                onClick={handleCopyGrounded}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 ${
                  groundedResult.isReadyToSend
                    ? 'bg-primary text-white hover:bg-primary/90 cursor-pointer'
                    : 'bg-surface-3 text-text-muted border border-border cursor-not-allowed opacity-60'
                }`}
                title={groundedResult.isReadyToSend ? 'Copy message to clipboard' : 'Fill all highlighted brackets before copying'}
              >
                {groundedCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{groundedResult.isReadyToSend ? 'Copy Grounded Message' : 'Fill Missing Info to Copy'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Subject Line if present */}
            {groundedResult.subject && (
              <div className="p-3 rounded-xl bg-surface-2 border border-border text-xs">
                <div className="text-[10px] text-text-muted font-bold uppercase mb-1">Subject Line</div>
                <div className="font-bold text-foreground">
                  {renderHighlightedOutreachText(groundedResult.subject)}
                </div>
              </div>
            )}

            {/* Message Body with Highlighted Placeholders */}
            <div className="p-4 sm:p-5 rounded-xl bg-surface-2 border border-border/80 font-sans text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap select-all">
              {renderHighlightedOutreachText(groundedResult.body)}
            </div>

            {/* Missing Info Alert (if placeholders exist) */}
            {groundedResult.placeholders.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">
                    Missing info required to unlock copy ({groundedResult.placeholders.length} remaining):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {groundedResult.placeholders.map((ph, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-200 font-mono text-[11px] font-bold border border-amber-500/30"
                      >
                        {ph}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible "Why this message says this" Panel */}
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setIsWhyPanelOpen(!isWhyPanelOpen)}
                className="flex items-center justify-between w-full py-2 text-xs font-bold text-text-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-primary" />
                  <span>Why this message says this (Strategic Grounding)</span>
                </span>
                {isWhyPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isWhyPanelOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-surface-2/40 border border-border/60 text-xs mt-2">
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block">1. Hook Rationale</span>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      {groundedResult.explanation.hookRationale}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block">2. Evidence Rationale</span>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      {groundedResult.explanation.evidenceRationale}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block">3. Ask Rationale</span>
                    <p className="text-[11px] text-text-secondary leading-normal">
                      {groundedResult.explanation.askRationale}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Channel Filter Tabs */}
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeChannel === ch.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <span>{ch.emoji}</span>
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
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-text">{msg.name}</h3>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Target Audience: <span className="font-semibold text-text-secondary">{msg.targetAudience}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border shrink-0 ${
                        msg.channel === 'linkedin_connect'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : msg.channel === 'linkedin_inmail'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : msg.channel === 'cold_email'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : msg.channel === 'warm_referral'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : msg.channel === 'academic_outreach'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {msg.channel === 'academic_outreach' ? '🎓 Academic' : msg.channel.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Template Strategy / Description */}
                  {msg.description && (
                    <p className="text-[11px] text-text-secondary leading-normal mb-3 pb-2 border-b border-border/60">
                      {msg.description}
                    </p>
                  )}

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
                  <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80 text-[13px] text-text font-sans leading-relaxed whitespace-pre-wrap mb-4">
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
                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/tools/tracker"
                      className="text-xs font-semibold text-text-secondary hover:text-text flex items-center gap-1"
                    >
                      <Briefcase className="w-3 h-3 text-primary" />
                      Log in Tracker
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopy(msg)}
                      title={
                        msg.placeholdersCount > 0
                          ? `Resolve ${msg.placeholdersCount} placeholder${msg.placeholdersCount > 1 ? 's' : ''} in the left sidebar to copy`
                          : 'Copy email subject and body to clipboard'
                      }
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 ${
                        copiedId === msg.templateId
                          ? 'bg-emerald-600 text-white'
                          : blockedCopyId === msg.templateId
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400/50'
                          : msg.placeholdersCount > 0
                          ? 'bg-surface-2 hover:bg-surface-3 text-text-secondary border border-border hover:border-amber-500/50'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {copiedId === msg.templateId ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied!
                        </>
                      ) : blockedCopyId === msg.templateId ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Fill Placeholders First
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>

                  {blockedCopyId === msg.templateId && (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Copy blocked to protect you: please fill <strong>{msg.placeholders.join(', ')}</strong> in the left sidebar before copying.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
