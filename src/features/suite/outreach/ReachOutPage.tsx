// ============================================================
// HireFlow Suite — Reach Out Studio V3 (Default Theme)
// Powered by shared headless controller `useReachOutStudio`.
// Zero runtime network egress • Pure client-side determinism.
// ============================================================

import React, { useState } from 'react';
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
  FlaskConical,
  X,
  Code2,
  Sparkles,
} from 'lucide-react';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';
import { PLATFORM_RULES } from '../../reach-out/data/platformRules';
import { useReachOutStudio } from './useReachOutStudio';
import {
  PURPOSE_CONFIG,
  RELATIONSHIP_LABELS,
  STAGE_LABELS,
} from './engine/contextIntelligence';
import type { CandidateStage, OutreachPurpose, OutreachRecipientType, OutreachRelationship } from './types';

export interface ChannelMeta {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  limitRule: string;
}

export const CHANNEL_TABS: ChannelMeta[] = [
  {
    id: 'linkedin_connect',
    label: 'LinkedIn Connect',
    shortLabel: 'Connect',
    icon: MessageSquare,
    description: 'Concise connection invitations (1–2 sentences) to establish initial rapport.',
    limitRule: 'Configured safety cap: 200 chars (Free) / 300 chars (Premium).',
  },
  {
    id: 'cold_email',
    label: 'Email',
    shortLabel: 'Email',
    icon: Mail,
    description: 'Direct email to recruiters, hiring managers, peers, referrals, and follow-ups.',
    limitRule: 'Configured target: 50–90 words (hard safety cap: 200 words).',
  },
  {
    id: 'linkedin_inmail',
    label: 'LinkedIn InMail',
    shortLabel: 'InMail',
    icon: Send,
    description: 'Direct messaging for LinkedIn Premium/Recruiter members.',
    limitRule: 'Configured target: 600 chars (hard safety cap: 1,900 chars).',
  },
  {
    id: 'all',
    label: 'All Channels',
    shortLabel: 'All',
    icon: Sliders,
    description: 'Browse all 87 calibrated templates across all channels and intents.',
    limitRule: 'Channel-specific safety limits apply automatically.',
  },
];

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
  const studio = useReachOutStudio();
  const [bottomTab, setBottomTab] = useState<'quality' | 'strategy' | 'guidance'>('quality');

  const {
    channelTemplates,
    selectedTemplate,
    selectedTemplateId,
    selectedChannel,
    purpose,
    relationship,
    stage,
    filterRecipient,
    searchQuery,
    variantIndex,
    isPremiumLinkedIn,
    isSampleMode,
    slots,
    recipientEmail,
    candidateOptions,
    selectedCandidateId,
    selectedCandidateOption,
    selectedProjectId,
    targetOptions,
    selectedTargetId,
    identityConflicts,
    composerBody,
    composerSubject,
    isDirty,
    showRegenerateConfirm,
    editingDraftId,
    parentDraftId,
    currentVaultDraft,
    missingDraftError,
    savedFeedback,
    copiedNote,
    copiedSubject,
    showTemplateBrowser,
    showPlatformRulesModal,
    platformRulesSearch,
    filteredModalRules,
    showProvenance,
    fitResult,
    evaluation,
    slotValidation,
    admiredValidation,
    proofValidation,
    droppedBlocksExplanation,
    toggleLinkedInMode,
    handleChannelSwitch,
    handlePurposeChange,
    setRelationship,
    setStage,
    setFilterRecipient,
    setSearchQuery,
    handleSelectTemplate,
    handleSlotChange,
    setRecipientEmail,
    applyCandidateOption,
    selectProjectOption,
    applyTargetOption,
    setComposerBody,
    setComposerSubject,
    resetToGenerated,
    handleCycleVariant,
    confirmRegenerateVariant,
    setShowRegenerateConfirm,
    loadSample,
    handleResetData,
    handleCopyNote,
    handleCopySubject,
    getMailtoHref,
    handleSaveToVault,
    handleMarkSent,
    setShowTemplateBrowser,
    setShowPlatformRulesModal,
    setPlatformRulesSearch,
    setShowProvenance,
  } = studio;

  const activeChannelMeta =
    CHANNEL_TABS.find((c) => c.id === selectedChannel) || CHANNEL_TABS[0];

  const isFollowUpTemplate =
    selectedTemplate.channel === 'follow_up' ||
    selectedTemplate.goal === 'G6' ||
    selectedTemplate.goal === 'G7';
  const showSubjectInput =
    selectedTemplate.channel === 'cold_email' ||
    selectedTemplate.channel === 'linkedin_inmail' ||
    selectedTemplate.channel === 'follow_up' ||
    Boolean(composerSubject);
  const mailtoHref = getMailtoHref();

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-volt/20">
      {/* Top Bar */}
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white">
                  Reach Out
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-volt/10 text-volt border border-volt/20">
                  Evidence-Grounded Studio
                </span>
                {isSampleMode && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Sample Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60">
                Context-aware outreach grounded in your resume, projects, and target role &bull; Zero runtime network egress
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* LinkedIn Account Tier Toggle */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs">
              <span className="text-white/50 px-2 font-mono text-[11px]">LinkedIn:</span>
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

            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Load Sample</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPlatformRulesModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-volt" />
              <span className="hidden sm:inline">Platform Rules</span>
              <span className="text-[10px] font-mono px-1.5 rounded bg-white/10 text-white/70">
                {PLATFORM_RULES.length}
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="p-2 rounded-xl border border-white/10 text-white/60 hover:text-rose-400 hover:border-rose-400/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer"
              title="Clear all fields"
              aria-label="Reset Reach Out inputs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Channel Navigation Bar */}
      <div className="border-b border-white/[0.08] bg-[#0c0d10]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-black' : 'text-white/60'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#141518] border border-white/10 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-white/50 font-mono uppercase">Template:</span>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                aria-label="Select outreach template"
                className="bg-transparent text-xs text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer max-w-[200px] sm:max-w-[250px] truncate"
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
              aria-label="View methodology and data provenance"
              className="text-white/50 hover:text-volt p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer"
              title="View Evidence & Methodology"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/60 border-t border-white/[0.04] pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/90 font-medium">{activeChannelMeta.label}:</span>
            <span>{activeChannelMeta.description}</span>
            <span className="text-volt font-mono hidden md:inline">&bull; {activeChannelMeta.limitRule}</span>
          </div>
          <Link to="/my-space/outreach" className="text-volt hover:underline font-medium">
            Open My Space Outreach Vault &rarr;
          </Link>
        </div>
      </div>

      {/* Expandable Template Browser */}
      {showTemplateBrowser && (
        <div className="bg-[#101114] border-b border-white/10 px-4 py-4">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeChannelMeta.label} templates...`}
                  aria-label="Search outreach templates"
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>
              <select
                value={filterRecipient}
                onChange={(e) => setFilterRecipient(e.target.value)}
                aria-label="Filter templates by recipient"
                className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              >
                <option value="all">All Recipients</option>
                <option value="in-house recruiter">Recruiter</option>
                <option value="hiring manager">Hiring Manager</option>
                <option value="engineer or peer">Peer Engineer</option>
                <option value="alumnus/alumna">Alumnus</option>
                <option value="senior leader or founder">Founder / Leader</option>
                <option value="campus/university relations">Campus Relations</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {channelTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                    tmpl.id === selectedTemplateId
                      ? 'bg-[#18191d] border-volt ring-1 ring-volt/20'
                      : 'bg-black/40 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{tmpl.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/70">
                      {tmpl.goal}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 line-clamp-2">{tmpl.whenToUse}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts: Missing Draft / Sample Mode / Identity Conflict */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4 space-y-2">
        {missingDraftError && (
          <div
            role="alert"
            className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-200"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{missingDraftError}</span>
          </div>
        )}
        {isSampleMode && (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Sample Mode Active:</strong> Showing fictional sample data for exploration only. Do not send sample text to real contacts.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="text-xs font-semibold underline hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
            >
              Clear Sample
            </button>
          </div>
        )}
        {identityConflicts.map((conflict, idx) => (
          <div
            key={idx}
            className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-200"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{conflict}</span>
          </div>
        ))}
      </div>

      {/* Main 2-Column Studio Grid */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Context & Slot Inputs */}
        <section className="lg:col-span-6 flex flex-col gap-4" aria-label="Outreach Details Form">
          {/* Context Picker */}
          <div className="bg-[#111215] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-volt" />
                1. Grounded Context & Purpose
              </span>
              {selectedCandidateOption && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-volt/10 text-volt border border-volt/25">
                  {selectedCandidateOption.provenanceLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Candidate Source
                </label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => {
                    const opt = candidateOptions.find((c) => c.id === e.target.value);
                    if (opt) applyCandidateOption(opt);
                  }}
                  aria-label="Candidate evidence source"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <option value="">Manual entry (empty)</option>
                  {candidateOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Target Context (JD / Watchlist / Role)
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => {
                    const opt = targetOptions.find((t) => t.id === e.target.value);
                    if (opt) applyTargetOption(opt);
                  }}
                  aria-label="Target context source"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <option value="">Manual target entry</option>
                  {targetOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCandidateOption && selectedCandidateOption.projectOptions.length > 0 && (
              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Verified Project Evidence
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => selectProjectOption(e.target.value)}
                  aria-label="Select verified project evidence"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  {selectedCandidateOption.projectOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.provenance === 'candidate_attested' ? 'Candidate-attested' : 'Resume-supported'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => handlePurposeChange(e.target.value as OutreachPurpose)}
                  aria-label="Communication purpose"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  {PURPOSE_CONFIG.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as OutreachRelationship)}
                  aria-label="Recipient relationship"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  {Object.entries(RELATIONSHIP_LABELS).map(([k, lbl]) => (
                    <option key={k} value={k}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">Career Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as CandidateStage)}
                  aria-label="Candidate career stage"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  {Object.entries(STAGE_LABELS).map(([k, lbl]) => (
                    <option key={k} value={k}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {!slotValidation.valid && (
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="block font-medium">Missing Required Fields:</strong>
                <span className="text-[11px] text-rose-300/80">
                  {slotValidation.issues.map((i) => i.slot).join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Recipient & Target Inputs */}
          <div className="bg-[#111215] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
            <span className="text-xs font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Briefcase className="w-3.5 h-3.5 text-volt" />
              2. Recipient & Target Role
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Target Company
                </label>
                <input
                  type="text"
                  value={slots.targetCompany || ''}
                  onChange={(e) => handleSlotChange('targetCompany', e.target.value)}
                  placeholder="Enter target company"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Your Target Job Role
                </label>
                <input
                  type="text"
                  value={slots.targetRole || ''}
                  onChange={(e) => handleSlotChange('targetRole', e.target.value)}
                  placeholder="e.g. Backend Software Engineer"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={slots.recipientName || ''}
                  onChange={(e) => handleSlotChange('recipientName', e.target.value)}
                  placeholder="Contact's name"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Recipient Designation (Optional)
                </label>
                <input
                  type="text"
                  value={slots.recipientType || ''}
                  onChange={(e) => handleSlotChange('recipientType', e.target.value)}
                  placeholder="e.g. Staff Engineer, Technical Recruiter"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Recipient Email (For mailto: only)
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Optional recipient email"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={slots.your_name || ''}
                  onChange={(e) => handleSlotChange('your_name', e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>
            </div>
          </div>

          {/* Evidence & Proof */}
          <div className="bg-[#111215] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
            <span className="text-xs font-semibold text-white flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <Code2 className="w-3.5 h-3.5 text-volt" />
              3. Candidate Evidence & Specific Context
            </span>

            <div>
              <label className="text-[11px] text-white/70 font-medium block mb-1">
                Primary Stack / Core Skills
              </label>
              <input
                type="text"
                value={slots.primarySkill || ''}
                onChange={(e) => handleSlotChange('primarySkill', e.target.value)}
                placeholder="e.g. TypeScript, Go, PostgreSQL"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-white/70 font-medium">
                  Genuine Reason / Referenced Work (Optional)
                </label>
                {admiredValidation.issue && (
                  <span className="text-[10px] text-amber-400 font-mono">Generic Praise Detected</span>
                )}
              </div>
              <input
                type="text"
                value={slots.admiredProject || ''}
                onChange={(e) => handleSlotChange('admiredProject', e.target.value)}
                placeholder="Only cite real public work, posts, or open roles you read"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              />
              {admiredValidation.issue && (
                <p className="mt-1 text-[11px] text-amber-300">{admiredValidation.issue.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-white/70 font-medium">
                  Authentic Proof Point (Project, Experience, or Confirmed Metric)
                </label>
                {proofValidation.issue && (
                  <span className="text-[10px] text-amber-400 font-mono">Needs Evidence</span>
                )}
              </div>
              <textarea
                rows={2}
                value={slots.proofPoint || ''}
                onChange={(e) => handleSlotChange('proofPoint', e.target.value)}
                placeholder="State concrete work you built or verified outcomes without exaggerating"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              />
              {proofValidation.issue && (
                <p className="mt-1 text-[11px] text-amber-300">{proofValidation.issue.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  Repo / Portfolio Link
                </label>
                <input
                  type="text"
                  value={slots.portfolio || ''}
                  onChange={(e) => handleSlotChange('portfolio', e.target.value)}
                  placeholder="Optional URL"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/70 font-medium block mb-1">
                  College / Community (For Alumni / Campus)
                </label>
                <input
                  type="text"
                  value={slots.college || ''}
                  onChange={(e) => handleSlotChange('college', e.target.value)}
                  placeholder="Optional institution"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>
            </div>

            {isFollowUpTemplate && (
              <div className="pt-2 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-white/70 font-medium block mb-1">
                    New Update / Work Completed Since Last Message
                  </label>
                  <input
                    type="text"
                    value={slots.followUpNewInfo || ''}
                    onChange={(e) => handleSlotChange('followUpNewInfo', e.target.value)}
                    placeholder="Concrete update or artifact link"
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/70 font-medium block mb-1">
                    Days Elapsed
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={slots.daysSince || 7}
                    onChange={(e) => handleSlotChange('daysSince', parseInt(e.target.value, 10) || 7)}
                    className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Editable Composer + Live Quality Evaluation */}
        <section className="lg:col-span-6 flex flex-col gap-4" aria-label="Editable Message Composer">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Editable Message Composer
                </h2>
                {isDirty && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Edited Manually
                  </span>
                )}
                {parentDraftId && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Linked Follow-Up
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/60">
                Edit freely before copying or saving &bull; Live linter checks your actual edited text
              </p>
            </div>

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
                {selectedTemplate.channel === 'linkedin_connect' || selectedTemplate.channel === 'linkedin_inmail'
                  ? `${fitResult.charCount} / ${fitResult.hardMax} chars`
                  : `${fitResult.wordCount} / ${fitResult.hardMax} words (${fitResult.status})`}
              </span>
            </div>
          </div>

          <div className="bg-[#111215] border border-white/[0.08] rounded-xl px-3.5 py-2 text-[11px] text-white/60 leading-relaxed">
            Replies depend on your profile, timing and the company&apos;s hiring state. No template can guarantee one. {/* // banned claim disclaimer */}
          </div>

          {showRegenerateConfirm && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
              <span>Cycling variants will replace your manual edits. Proceed?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={confirmRegenerateVariant}
                  className="px-3 py-1 rounded-lg bg-amber-400 text-black font-semibold cursor-pointer"
                >
                  Replace with New Variant
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="px-3 py-1 rounded-lg border border-white/20 text-white cursor-pointer"
                >
                  Keep My Edits
                </button>
              </div>
            </div>
          )}

          <div className="bg-[#111215] border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-xl">
            {showSubjectInput && (
              <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="outreach-subject-input"
                    className="text-[10px] font-mono text-white/60 uppercase tracking-wider"
                  >
                    Editable Subject Line
                  </label>
                  <button
                    type="button"
                    onClick={handleCopySubject}
                    className="text-volt hover:text-volt/80 text-[11px] inline-flex items-center gap-1 font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  >
                    {copiedSubject ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                  </button>
                </div>
                <input
                  id="outreach-subject-input"
                  type="text"
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  placeholder="Optional subject line"
                  className="w-full bg-transparent border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                />
              </div>
            )}

            <div className="bg-[#0a0a0c] border border-white/10 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="outreach-body-textarea"
                  className="text-[10px] font-mono text-white/60 uppercase tracking-wider"
                >
                  Message Body ({evaluation.charCount} chars &bull; {evaluation.wordCount} words)
                </label>
                {isDirty && (
                  <button
                    type="button"
                    onClick={resetToGenerated}
                    className="text-[11px] text-white/70 hover:text-volt underline cursor-pointer"
                  >
                    Reset to Generated Version
                  </button>
                )}
              </div>
              <textarea
                id="outreach-body-textarea"
                rows={7}
                value={composerBody}
                onChange={(e) => setComposerBody(e.target.value)}
                placeholder="Fill in your details on the left or write your message directly..."
                className="w-full bg-transparent text-xs sm:text-[13px] text-white leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt rounded-lg p-1.5 resize-y"
              />
              {droppedBlocksExplanation && (
                <div className="pt-2 border-t border-white/10 text-[11px] text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{droppedBlocksExplanation}</span>
                </div>
              )}
              {evaluation.shorteningGuidance && (
                <div className="pt-2 border-t border-rose-500/30 text-[11px] text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{evaluation.shorteningGuidance}</span>
                </div>
              )}
            </div>

            {/* Composer Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleCycleVariant}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-volt border border-volt/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Phrasing</span>
                <span className="text-[10px] font-mono text-white/50">#{variantIndex + 1}</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/10 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  >
                    <Mail className="w-3.5 h-3.5 text-volt" />
                    <span>Open Email App</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveToVault(true)}
                  disabled={!composerBody.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 bg-white/[0.04] text-white/80 hover:text-white text-xs font-semibold cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <span>Save Incomplete Draft</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveToVault(false)}
                  disabled={!evaluation.canCopyOrExport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-volt/30 bg-volt/10 text-volt hover:bg-volt/20 text-xs font-semibold cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{savedFeedback || (editingDraftId ? 'Update Vault Draft' : 'Save to Vault')}</span>
                </button>

                {currentVaultDraft?.status !== 'sent' && (
                  <button
                    type="button"
                    onClick={handleMarkSent}
                    disabled={!evaluation.canCopyOrExport}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mark as Sent</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!evaluation.canCopyOrExport) return;
                    const full = composerSubject ? `Subject: ${composerSubject}\n\n${composerBody}` : composerBody;
                    downloadTextFile(`outreach-${selectedTemplate.id}.txt`, full);
                  }}
                  disabled={!evaluation.canCopyOrExport}
                  className="p-2 rounded-xl border border-white/10 text-white/70 hover:text-white cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                  aria-label="Download outreach text"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyNote}
                  disabled={!evaluation.canCopyOrExport}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-volt hover:bg-volt/90 text-black cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
                >
                  {copiedNote ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNote ? 'Copied!' : 'Copy Message'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quality / Strategy / Guidance Tabs */}
          <div className="bg-[#111215] border border-white/10 rounded-2xl overflow-hidden text-xs">
            <div className="flex border-b border-white/10 bg-[#0c0d10]">
              <button
                type="button"
                onClick={() => setBottomTab('quality')}
                className={`flex-1 py-2.5 px-3 font-semibold border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  bottomTab === 'quality' ? 'border-volt text-volt' : 'border-transparent text-white/60'
                }`}
              >
                Quality Audit ({evaluation.blockers.length === 0 ? 'Pass' : `${evaluation.blockers.length} Blockers`})
              </button>
              <button
                type="button"
                onClick={() => setBottomTab('strategy')}
                className={`flex-1 py-2.5 px-3 font-semibold border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  bottomTab === 'strategy' ? 'border-volt text-volt' : 'border-transparent text-white/60'
                }`}
              >
                Why & Strategy
              </button>
              <button
                type="button"
                onClick={() => setBottomTab('guidance')}
                className={`flex-1 py-2.5 px-3 font-semibold border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt ${
                  bottomTab === 'guidance' ? 'border-volt text-volt' : 'border-transparent text-white/60'
                }`}
              >
                Platform Limits
              </button>
            </div>

            {bottomTab === 'quality' && (
              <div className="p-4 space-y-2.5">
                {evaluation.blockers.length === 0 && evaluation.warnings.length === 0 ? (
                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>0 quality blockers or unresolved placeholders detected. Ready to copy or save.</span>
                  </div>
                ) : (
                  <>
                    {evaluation.blockers.map((b) => (
                      <div key={b.id} className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 text-[11px] text-rose-200">
                        <div className="font-semibold text-rose-300">BLOCKER ({b.id}): {b.message}</div>
                        <div className="mt-1 text-volt">Fix: {b.fix}</div>
                      </div>
                    ))}
                    {evaluation.warnings.map((w) => (
                      <div key={w.id} className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-200">
                        <div className="font-semibold text-amber-300">WARNING ({w.id}): {w.message}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {bottomTab === 'strategy' && (
              <div className="p-4 space-y-2.5 text-[11px]">
                <div>
                  <span className="text-volt font-semibold uppercase block">Why this approach works</span>
                  <p className="text-white/75">{selectedTemplate.whyItWorks}</p>
                </div>
                <div>
                  <span className="text-rose-300 font-semibold uppercase block">When not to use</span>
                  <p className="text-white/70">{selectedTemplate.whenNotToUse}</p>
                </div>
              </div>
            )}

            {bottomTab === 'guidance' && (
              <div className="p-4 space-y-2 text-[11px] text-white/70">
                <p>
                  Channel targets are HireFlow&apos;s configured safety limits. Word/length heuristics are derived from B2B outbound studies (Hunter 34M dataset, Boomerang) and assumed to transfer to job-seeker outreach.
                </p>
                <p className="text-white/50">
                  Check your LinkedIn app counter; platform limits and note quotas change over time.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPlatformRulesModal(true)}
                  className="text-volt underline font-semibold cursor-pointer"
                >
                  Inspect Platform Rules &amp; Sources ({PLATFORM_RULES.length})
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Platform Rules Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-8" aria-label="Platform rules and delivery standards">
        <div className="border border-white/10 rounded-2xl bg-[#111215] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-volt/10 text-volt border border-volt/20 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Platform rules &amp; HireFlow safety limits</div>
              <div className="text-[11px] text-white/60">
                {`${PLATFORM_RULES.length} documented constraints (last checked ${PLATFORM_RULES[0]?.lastCheckedDate})`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPlatformRulesModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-volt/40 bg-volt/10 hover:bg-volt hover:text-black text-volt transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt cursor-pointer shrink-0"
          >
            Open Rules Viewer
          </button>
        </div>
      </section>

      <footer className="mt-auto py-6 border-t border-white/10 text-center bg-[#0c0d10]">
        <p className="text-xs font-semibold text-white/60">
          Pre-written templates. Nothing you type leaves your browser.
        </p>
      </footer>

      {/* Platform Rules Accessible Modal */}
      {showPlatformRulesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="platform-rules-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#0f1013] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/10 bg-[#141519] flex items-center justify-between">
              <div>
                <h3 id="platform-rules-title" className="text-sm font-bold text-white">
                  Platform rules &amp; HireFlow safety limits
                </h3>
                <p className="text-xs text-white/60">
                  External references and HireFlow&apos;s configured limits ({PLATFORM_RULES.length} rules)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlatformRulesModal(false)}
                className="p-2 rounded-xl text-white/60 hover:text-white cursor-pointer"
                aria-label="Close Platform Rules Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-white/[0.06] bg-[#0c0d0f]">
              <input
                type="text"
                value={platformRulesSearch}
                onChange={(e) => setPlatformRulesSearch(e.target.value)}
                placeholder="Filter rules..."
                aria-label="Filter platform rules"
                className="w-full bg-[#141519] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
              />
            </div>
            <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-[#0a0a0c]">
              {filteredModalRules.map((rule, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#121316] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">{rule.rule}</h4>
                    <p className="text-xs text-white/70 mt-1">{rule.value}</p>
                    <p className="text-[11px] text-white/50 mt-1">
                      Source: {rule.sourceName}, last checked {rule.lastCheckedDate}
                    </p>
                  </div>
                  {rule.sourceUrl && (
                    <a
                      href={rule.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-volt/10 text-volt border border-volt/20 text-xs font-semibold shrink-0"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
