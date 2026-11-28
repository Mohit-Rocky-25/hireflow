// ============================================================
// HireFlow — Spruce Reach Out Studio (Theme Parity via useReachOutStudio)
// Shares 100% of business logic with Default ReachOutPage.
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { SpruceShell } from '../../layout/SpruceShell';
import { PageHeader } from '../../layout/PageHeader';
import {
  Card,
  Button,
  Tabs,
  StatusChip,
  FieldShell,
  TextInput,
  Textarea,
} from '../../ui';
import { useReachOutStudio } from '../../../../features/suite/outreach/useReachOutStudio';
import {
  PURPOSE_CONFIG,
  RELATIONSHIP_LABELS,
  STAGE_LABELS,
} from '../../../../features/suite/outreach/engine/contextIntelligence';
import type {
  CandidateStage,
  OutreachPurpose,
  OutreachRelationship,
} from '../../../../features/suite/outreach/types';
import { PLATFORM_RULES } from '../../../../features/reach-out/data/platformRules';
import {
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Download,
  Mail,
  Send,
  FlaskConical,
  X,
  ExternalLink,
} from 'lucide-react';

const CHANNELS = [
  { id: 'all', label: 'All Channels' },
  { id: 'linkedin_connect', label: 'LinkedIn Connect' },
  { id: 'linkedin_inmail', label: 'InMail' },
  { id: 'cold_email', label: 'Email' },
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

export function SpruceReachOutPage() {
  const studio = useReachOutStudio();
  const {
    channelTemplates,
    selectedTemplate,
    selectedTemplateId,
    selectedChannel,
    purpose,
    relationship,
    stage,
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
    currentVaultDraft,
    missingDraftError,
    savedFeedback,
    copiedNote,
    showPlatformRulesModal,
    filteredModalRules,
    fitResult,
    evaluation,
    droppedBlocksExplanation,
    toggleLinkedInMode,
    handleChannelSwitch,
    handlePurposeChange,
    setRelationship,
    setStage,
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
    getMailtoHref,
    handleSaveToVault,
    handleMarkSent,
    setShowPlatformRulesModal,
  } = studio;

  const mailtoHref = getMailtoHref();
  const showSubjectInput =
    selectedTemplate.channel === 'cold_email' ||
    selectedTemplate.channel === 'linkedin_inmail' ||
    selectedTemplate.channel === 'follow_up' ||
    Boolean(composerSubject);

  return (
    <SpruceShell>
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'Reach Out' },
        ]}
        title="Direct Outreach & Message Studio"
        subtitle="Context-aware outreach grounded in your resume, projects, and target role."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Alerts */}
        {missingDraftError && (
          <div role="alert" className="p-3 rounded-sp-sm border border-rose-500/40 bg-rose-50 text-xs text-rose-800">
            {missingDraftError}
          </div>
        )}
        {isSampleMode && (
          <div className="p-3 rounded-sp-sm border border-amber-400 bg-amber-50 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
            <span>
              <strong>Sample Mode Active:</strong> Fictional sample data for exploration only. Do not send to real contacts.
            </span>
            <button type="button" onClick={handleResetData} className="underline font-semibold cursor-pointer">
              Clear Sample
            </button>
          </div>
        )}
        {identityConflicts.map((c, idx) => (
          <div key={idx} className="p-3 rounded-sp-sm border border-amber-300 bg-amber-50 text-xs text-amber-900">
            {c}
          </div>
        ))}

        {/* Channel Selection & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sp-hairline">
          <Tabs
            items={CHANNELS}
            activeId={selectedChannel}
            onChange={(id) => handleChannelSwitch(id)}
          />

          <div className="flex flex-wrap items-center gap-2">
            {selectedChannel === 'linkedin_connect' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleLinkedInMode(false)}
                  className={`px-2.5 py-1 rounded-sp-xs sp-caption font-bold border cursor-pointer ${
                    !isPremiumLinkedIn
                      ? 'bg-sp-primary text-sp-on-primary border-sp-primary'
                      : 'bg-sp-canvas-soft text-sp-ink border-sp-hairline'
                  }`}
                >
                  Free (200c)
                </button>
                <button
                  type="button"
                  onClick={() => toggleLinkedInMode(true)}
                  className={`px-2.5 py-1 rounded-sp-xs sp-caption font-bold border cursor-pointer ${
                    isPremiumLinkedIn
                      ? 'bg-sp-primary text-sp-on-primary border-sp-primary'
                      : 'bg-sp-canvas-soft text-sp-ink border-sp-hairline'
                  }`}
                >
                  Premium (300c)
                </button>
              </div>
            )}
            <Button variant="secondary" size="sm" onClick={loadSample}>
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Load Sample</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowPlatformRulesModal(true)}>
              Platform Rules ({PLATFORM_RULES.length})
            </Button>
            <Button variant="secondary" size="sm" onClick={handleResetData}>
              Reset
            </Button>
          </div>
        </div>

        {/* 2-Column Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Context & Details */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="p-5 bg-sp-surface space-y-4">
              <div className="flex items-center justify-between border-b border-sp-hairline pb-2">
                <h3 className="sp-h3 text-sp-ink">1. Context, Purpose & Template</h3>
                {selectedCandidateOption && (
                  <StatusChip status="matched" label={selectedCandidateOption.provenanceLabel} />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="sp-caption text-sp-body font-semibold block mb-1">Candidate Source</label>
                  <select
                    value={selectedCandidateId}
                    onChange={(e) => {
                      const opt = candidateOptions.find((c) => c.id === e.target.value);
                      if (opt) applyCandidateOption(opt);
                    }}
                    className="w-full px-3 py-2 rounded-sp-sm border border-sp-hairline bg-sp-canvas text-xs text-sp-ink"
                  >
                    <option value="">Manual entry</option>
                    {candidateOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="sp-caption text-sp-body font-semibold block mb-1">Target Context</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => {
                      const opt = targetOptions.find((t) => t.id === e.target.value);
                      if (opt) applyTargetOption(opt);
                    }}
                    className="w-full px-3 py-2 rounded-sp-sm border border-sp-hairline bg-sp-canvas text-xs text-sp-ink"
                  >
                    <option value="">Manual target</option>
                    {targetOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCandidateOption && selectedCandidateOption.projectOptions.length > 0 && (
                <div>
                  <label className="sp-caption text-sp-body font-semibold block mb-1">Verified Project Evidence</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => selectProjectOption(e.target.value)}
                    className="w-full px-3 py-2 rounded-sp-sm border border-sp-hairline bg-sp-canvas text-xs text-sp-ink"
                  >
                    {selectedCandidateOption.projectOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="sp-caption text-sp-body font-semibold block mb-1">Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => handlePurposeChange(e.target.value as OutreachPurpose)}
                    className="w-full px-2.5 py-2 rounded-sp-sm border border-sp-hairline bg-sp-canvas text-xs text-sp-ink"
                  >
                    {PURPOSE_CONFIG.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="sp-caption text-sp-body font-semibold block mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as OutreachRelationship)}
                    className="w-full px-2.5 py-2 rounded-sp-sm border border-sp-hairline bg-sp-canvas text-xs text-sp-ink"
                  >
                    {Object.entries(RELATIONSHIP_LABELS).map(([k, lbl]) => (
                      <option key={k} value={k}>{lbl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="sp-caption text-sp-body font-semibold block mb-1">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as CandidateStage)}
                    className="w-full px-2.5 py-2 rounded-sp-sm border border-sp-hairline bg-sp-canvas text-xs text-sp-ink"
                  >
                    {Object.entries(STAGE_LABELS).map(([k, lbl]) => (
                      <option key={k} value={k}>{lbl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="sp-caption text-sp-body font-semibold block mb-1">Template</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-sp-sm border border-sp-hairline bg-sp-canvas text-xs text-sp-ink"
                >
                  {channelTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.goal})</option>
                  ))}
                </select>
              </div>
            </Card>

            <Card className="p-5 bg-sp-surface space-y-4">
              <h3 className="sp-h3 text-sp-ink border-b border-sp-hairline pb-2">2. Recipient & Evidence Slots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="sp-caption text-sp-body font-semibold">Recipient Name</label>
                  <FieldShell>
                    <TextInput
                      value={slots.recipientName || ''}
                      onChange={(e) => handleSlotChange('recipientName', e.target.value)}
                      placeholder="Contact name"
                    />
                  </FieldShell>
                </div>
                <div className="space-y-1">
                  <label className="sp-caption text-sp-body font-semibold">Target Company</label>
                  <FieldShell>
                    <TextInput
                      value={slots.targetCompany || ''}
                      onChange={(e) => handleSlotChange('targetCompany', e.target.value)}
                      placeholder="Company name"
                    />
                  </FieldShell>
                </div>
                <div className="space-y-1">
                  <label className="sp-caption text-sp-body font-semibold">Target Job Role</label>
                  <FieldShell>
                    <TextInput
                      value={slots.targetRole || ''}
                      onChange={(e) => handleSlotChange('targetRole', e.target.value)}
                      placeholder="Target role"
                    />
                  </FieldShell>
                </div>
                <div className="space-y-1">
                  <label className="sp-caption text-sp-body font-semibold">Recipient Email</label>
                  <FieldShell>
                    <TextInput
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Optional email for mailto:"
                    />
                  </FieldShell>
                </div>
              </div>
              <div className="space-y-1">
                <label className="sp-caption text-sp-body font-semibold">Primary Stack</label>
                <FieldShell>
                  <TextInput
                    value={slots.primarySkill || ''}
                    onChange={(e) => handleSlotChange('primarySkill', e.target.value)}
                    placeholder="e.g. TypeScript, Go, PostgreSQL"
                  />
                </FieldShell>
              </div>
              <div className="space-y-1">
                <label className="sp-caption text-sp-body font-semibold">Authentic Proof Point</label>
                <FieldShell>
                  <Textarea
                    rows={2}
                    value={slots.proofPoint || ''}
                    onChange={(e) => handleSlotChange('proofPoint', e.target.value)}
                    placeholder="Verified project or outcome"
                  />
                </FieldShell>
              </div>
            </Card>
          </div>

          {/* Right: Editable Composer */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="p-5 bg-sp-surface space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sp-hairline pb-3">
                <div>
                  <h3 className="sp-h3 text-sp-ink">Editable Message Composer</h3>
                  <p className="sp-caption text-sp-muted">
                    {isDirty ? 'Edited manually — manual text preserved' : 'Live generated draft'}
                  </p>
                </div>
                <div aria-live="polite">
                  <StatusChip
                    status={fitResult.status === 'overflow' ? 'missing' : fitResult.status === 'warning' ? 'partial' : 'matched'}
                    label={
                      selectedTemplate.channel === 'linkedin_connect' || selectedTemplate.channel === 'linkedin_inmail'
                        ? `${fitResult.charCount} / ${fitResult.hardMax} chars`
                        : `${fitResult.wordCount} / ${fitResult.hardMax} words`
                    }
                  />
                </div>
              </div>

              {showRegenerateConfirm && (
                <div className="p-3 rounded-sp-sm border border-amber-300 bg-amber-50 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                  <span>Cycling variants will replace your manual edits.</span>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={confirmRegenerateVariant}>Replace</Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowRegenerateConfirm(false)}>Keep Edits</Button>
                  </div>
                </div>
              )}

              {showSubjectInput && (
                <div className="space-y-1">
                  <label className="sp-caption text-sp-body font-semibold">Editable Subject</label>
                  <FieldShell>
                    <TextInput
                      value={composerSubject}
                      onChange={(e) => setComposerSubject(e.target.value)}
                      placeholder="Optional email/InMail subject"
                    />
                  </FieldShell>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="sp-caption text-sp-body font-semibold">Message Body</label>
                  {isDirty && (
                    <button type="button" onClick={resetToGenerated} className="text-xs underline text-sp-primary cursor-pointer">
                      Reset to Generated
                    </button>
                  )}
                </div>
                <FieldShell>
                  <Textarea
                    rows={7}
                    value={composerBody}
                    onChange={(e) => setComposerBody(e.target.value)}
                    placeholder="Write or generate your outreach message..."
                  />
                </FieldShell>
              </div>

              {droppedBlocksExplanation && (
                <p className="text-xs text-amber-700">{droppedBlocksExplanation}</p>
              )}
              {evaluation.shorteningGuidance && (
                <p className="text-xs text-rose-700 font-medium">{evaluation.shorteningGuidance}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-sp-hairline">
                <Button variant="secondary" size="sm" onClick={handleCycleVariant}>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Variant #{variantIndex + 1}</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleSaveToVault(true)} disabled={!composerBody.trim()}>
                  Save Incomplete
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleSaveToVault(false)} disabled={!evaluation.canCopyOrExport}>
                  {savedFeedback || (editingDraftId ? 'Update Vault' : 'Save to Vault')}
                </Button>
                {currentVaultDraft?.status !== 'sent' && (
                  <Button variant="secondary" size="sm" onClick={handleMarkSent} disabled={!evaluation.canCopyOrExport}>
                    <Send className="w-3.5 h-3.5" />
                    <span>Mark as Sent</span>
                  </Button>
                )}
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sp-sm border border-sp-hairline text-xs font-semibold text-sp-ink hover:bg-sp-canvas-soft"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email App</span>
                  </a>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!evaluation.canCopyOrExport}
                  onClick={() => {
                    if (!evaluation.canCopyOrExport) return;
                    const full = composerSubject ? `Subject: ${composerSubject}\n\n${composerBody}` : composerBody;
                    downloadTextFile(`outreach-${selectedTemplate.id}.txt`, full);
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyNote} disabled={!evaluation.canCopyOrExport}>
                  {copiedNote ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNote ? 'Copied' : 'Copy Message'}</span>
                </Button>
              </div>
            </Card>

            {/* Live Quality Check */}
            <Card className="p-5 bg-sp-surface space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="sp-h4 text-sp-ink">Quality & Guardrails</h4>
                <Link to="/my-space/outreach" className="text-xs underline text-sp-primary">
                  Open Vault
                </Link>
              </div>
              {evaluation.blockers.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>0 blockers. Ready to copy or save.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {evaluation.blockers.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-sp-sm bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>{b.id}:</strong> {b.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Platform Rules Modal */}
      {showPlatformRulesModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] bg-sp-surface border border-sp-hairline rounded-sp-md shadow-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-sp-hairline flex items-center justify-between">
              <h3 className="sp-h4 text-sp-ink">Platform rules &amp; HireFlow safety limits</h3>
              <button type="button" onClick={() => setShowPlatformRulesModal(false)} aria-label="Close Platform Rules Modal" className="p-1.5 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {filteredModalRules.map((rule, i) => (
                <div key={i} className="p-3 rounded-sp-sm border border-sp-hairline flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sp-ink">{rule.rule}</div>
                    <div className="text-sp-body mt-0.5">{rule.value}</div>
                    <div className="text-sp-muted mt-0.5">Source: {rule.sourceName}, last checked {rule.lastCheckedDate}</div>
                  </div>
                  {rule.sourceUrl && (
                    <a href={rule.sourceUrl} target="_blank" rel="noreferrer" className="text-sp-primary underline inline-flex items-center gap-1 shrink-0">
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SpruceShell>
  );
}
