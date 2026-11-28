// ============================================================
// HireFlow — Phase 13 Shared Headless Controller: useReachOutStudio
// Single source of truth for Default & Spruce Reach Out pages.
// Deterministic, client-side, zero network egress, evidence-grounded.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import templatesRaw from '../../../data/suite/outreach/templates.json';
import { PLATFORM_RULES } from '../../reach-out/data/platformRules';
import { useProfile } from '../profile/ProfileContext';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useSavedRoleStore } from '@/store/savedRoleStore';
import { useMySpaceStore } from '@/features/my-space/useMySpaceStore';
import { toast } from '@/components/ui/Toast';
import type { OutreachDraft } from '@/domain/types';
import type {
  CandidateStage,
  OutreachChannel,
  OutreachPurpose,
  OutreachRecipientType,
  OutreachRelationship,
  OutreachSlotsV2,
  OutreachTemplateV2,
} from './types';
import { fitMessageToLength, type LengthFitResult } from './engine/lengthFit';
import { validateAdmiredWork, validateProofPoint, validateSlots } from './engine/validateSlots';
import {
  evaluateFinalComposerText,
  extractCandidateEvidenceOptions,
  extractTargetContextOptions,
  PURPOSE_CONFIG,
  resolveTemplatesForPurpose,
  scoreMessageQualityRubric,
  selectRelevantProofAndSkills,
  type CandidateEvidenceOption,
  type FinalComposerEvaluation,
  type MessageQualityRubricScores,
  type RelevantEvidenceSelection,
  type TargetContextOption,
} from './engine/contextIntelligence';

const ALL_TEMPLATES = templatesRaw as OutreachTemplateV2[];

export const EMPTY_OUTREACH_SLOTS: OutreachSlotsV2 = {
  targetCompany: '',
  targetRole: '',
  recipientName: '',
  recipientType: '',
  primarySkill: '',
  admiredProject: '',
  proofPoint: '',
  proofShort: '',
  college: '',
  portfolio: '',
  followUpNewInfo: '',
  daysSince: 7,
  your_name: '',
  your_email: '',
};

export const SAMPLE_OUTREACH_SLOTS: OutreachSlotsV2 = {
  targetCompany: 'Finlo Payments (Sample)',
  targetRole: 'Backend Software Engineer',
  recipientName: 'Priya Nair',
  recipientType: 'in-house recruiter',
  primarySkill: 'Go & PostgreSQL',
  admiredProject: 'the settlement reconciliation engine and public post-mortem',
  proofPoint: 'built Go distributed job queue handling 6,500 jobs/sec in local benchmark',
  proofShort: 'built Go job queue (6.5k jobs/s)',
  college: 'National Institute of Technology Karnataka',
  portfolio: 'github.com/sample-candidate/pgqueue',
  followUpNewInfo: 'published reproducibility benchmarks and test harness',
  daysSince: 7,
  your_name: 'Aarav Menon (Sample)',
  your_email: 'aarav.sample@example.com',
};

export function useReachOutStudio() {
  const [searchParams] = useSearchParams();
  const { profile: suiteProfile } = useProfile();
  const authDisplayName = useAuthStore((s) => s.displayName);
  const authEmail = useAuthStore((s) => s.email);
  const domainProfile = useMemo(
    () => ({
      displayName: authDisplayName || undefined,
      email: authEmail || undefined,
      targetRoles: [] as string[],
    }),
    [authDisplayName, authEmail]
  );
  const workspaces = useResumeStore((s) => s.workspaces);
  const versions = useResumeStore((s) => s.versions);
  const tailorSessions = useTailorWorkspaceStore((s) => s.sessions);
  const savedJds = useSavedJdStore((s) => s.jds);
  const savedRoles = useSavedRoleStore((s) => s.roles);
  const watchlist = useMySpaceStore((s) => s.watchlist);
  const outreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const saveOutreachDraft = useMySpaceStore((s) => s.saveOutreachDraft);
  const markOutreachSent = useMySpaceStore((s) => s.markOutreachSent);

  // Mode & UI State
  const [isPremiumLinkedIn, setIsPremiumLinkedIn] = useState(false);
  const toggleLinkedInMode = (premium: boolean) => setIsPremiumLinkedIn(premium);
  const [isSampleMode, setIsSampleMode] = useState(false);

  const [selectedChannel, setSelectedChannel] = useState<string>('linkedin_connect');
  const [purpose, setPurpose] = useState<OutreachPurpose>('cold_intro');
  const [relationship, setRelationship] = useState<OutreachRelationship>('cold');
  const [stage, setStage] = useState<CandidateStage>('ic_engineer');
  const [filterRecipient, setFilterRecipient] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    ALL_TEMPLATES.find((t) => t.channel === 'linkedin_connect')?.id || ALL_TEMPLATES[0].id
  );
  const [variantIndex, setVariantIndex] = useState<number>(0);

  // Slots & Context Selection
  const [slots, setSlots] = useState<OutreachSlotsV2>(EMPTY_OUTREACH_SLOTS);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  // Editable Composer State
  const [composerBody, setComposerBodyState] = useState<string>('');
  const [composerSubject, setComposerSubjectState] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(() =>
    Boolean(searchParams.get('draftId') || searchParams.get('draft'))
  );
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState<boolean>(false);

  // Vault Round-Trip & Follow-Up Linkage
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [parentDraftId, setParentDraftId] = useState<string | null>(null);
  const [missingDraftError, setMissingDraftError] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const [copiedSubject, setCopiedSubject] = useState<boolean>(false);

  // Modal & Drawer UI State
  const [showTemplateBrowser, setShowTemplateBrowser] = useState<boolean>(false);
  const [showPlatformRulesModal, setShowPlatformRulesModal] = useState<boolean>(false);
  const [platformRulesSearch, setPlatformRulesSearch] = useState<string>('');
  const [showProvenance, setShowProvenance] = useState<boolean>(false);
  const [showOverLengthModal, setShowOverLengthModal] = useState<boolean>(false);

  const hydratedQueryKeyRef = useRef<string>('');
  const suppressNextAutoSyncRef = useRef<boolean>(false);

  // Candidate & Target Evidence Options
  const { options: candidateOptions, conflicts: identityConflicts } = useMemo(
    () =>
      extractCandidateEvidenceOptions({
        domainProfile,
        suiteProfile,
        workspaces,
        versions,
        tailorSessions,
      }),
    [domainProfile, suiteProfile, workspaces, versions, tailorSessions]
  );

  const targetOptions = useMemo(
    () => extractTargetContextOptions({ savedJds, watchlist, savedRoles }),
    [savedJds, watchlist, savedRoles]
  );

  const selectedCandidateOption: CandidateEvidenceOption | undefined = useMemo(
    () => candidateOptions.find((c) => c.id === selectedCandidateId),
    [candidateOptions, selectedCandidateId]
  );

  const selectedTargetOption: TargetContextOption | undefined = useMemo(
    () => targetOptions.find((t) => t.id === selectedTargetId),
    [targetOptions, selectedTargetId]
  );

  // Apply Candidate Context Helper (relevance-ranked proof & trimmed skills)
  const applyCandidateOption = useCallback(
    (opt: CandidateEvidenceOption) => {
      setIsSampleMode(false);
      setSelectedCandidateId(opt.id);
      const relevant = selectRelevantProofAndSkills(opt, slots.targetRole);
      const firstProj = relevant.selectedProjects[0] || opt.projectOptions[0];
      setSelectedProjectId(firstProj?.id || '');
      setSlots((prev) => ({
        ...prev,
        your_name: opt.candidateName ?? prev.your_name,
        your_email: opt.candidateEmail ?? prev.your_email,
        college: opt.college ?? prev.college,
        primarySkill: relevant.primarySkill || opt.primarySkill || prev.primarySkill,
        proofPoint: relevant.proofPoint || prev.proofPoint,
        proofShort: relevant.proofShort || prev.proofShort,
        portfolio: opt.portfolio ?? prev.portfolio,
      }));
    },
    [slots.targetRole]
  );

  const selectProjectOption = useCallback(
    (projectId: string) => {
      setSelectedProjectId(projectId);
      const proj = selectedCandidateOption?.projectOptions.find((p) => p.id === projectId);
      if (!proj) return;
      setSlots((prev) => ({
        ...prev,
        proofPoint: proj.proofText,
        proofShort: proj.shortText,
        primarySkill: proj.tech || prev.primarySkill,
      }));
    },
    [selectedCandidateOption]
  );

  const applyTargetOption = useCallback((opt: TargetContextOption) => {
    setIsSampleMode(false);
    setSelectedTargetId(opt.id);
    setSlots((prev) => ({
      ...prev,
      targetCompany: opt.targetCompany || prev.targetCompany,
      targetRole: opt.targetRole || prev.targetRole,
    }));
  }, []);

  // Deterministic Query & Context Hydration (Respects Exact Precedence)
  useEffect(() => {
    const draftId = searchParams.get('draftId') || searchParams.get('draft');
    const followUpFrom = searchParams.get('followUpFrom');
    const companyParam = searchParams.get('company');
    const roleParam = searchParams.get('role');
    const personParam = searchParams.get('person');

    const queryKey = [draftId, followUpFrom, companyParam, roleParam, personParam].join('|');
    if (hydratedQueryKeyRef.current === queryKey) return;

    // 1. Protect unsaved manual edits after initial query hydration
    if (isDirty && hydratedQueryKeyRef.current !== '') return;

    hydratedQueryKeyRef.current = queryKey;
    setMissingDraftError(null);

    // 2. Exact saved draft hydration (never overwritten by incidental query params)
    if (draftId) {
      const saved = outreachDrafts[draftId];
      if (!saved) {
        setMissingDraftError(
          `Saved outreach draft "${draftId}" was not found or may have been deleted.`
        );
        return;
      }
      setIsSampleMode(false);
      setEditingDraftId(saved.id);
      setParentDraftId(saved.parentDraftId ?? null);
      if (saved.channel) setSelectedChannel(saved.channel);
      if (saved.templateId && ALL_TEMPLATES.some((t) => t.id === saved.templateId)) {
        setSelectedTemplateId(saved.templateId);
      }
      if (saved.relationship) {
        setRelationship(saved.relationship as OutreachRelationship);
      }
      if (saved.intent) {
        const matchedPurpose = PURPOSE_CONFIG.find((p) => p.intent === saved.intent);
        if (matchedPurpose) setPurpose(matchedPurpose.id);
      }

      const snapSlots = saved.slotsSnapshot?.slots || saved.slots || {};
      setSlots({
        ...EMPTY_OUTREACH_SLOTS,
        ...snapSlots,
        targetCompany: saved.company || snapSlots.targetCompany || snapSlots.company || '',
        targetRole: saved.targetRole || snapSlots.targetRole || '',
        recipientName: saved.person || snapSlots.recipientName || snapSlots.person || '',
      });
      const restoredBody =
        saved.message ??
        saved.renderedText.replace(/^Subject:\s*[^\r\n]+\r?\n\r?\n/, '');
      suppressNextAutoSyncRef.current = true;
      setComposerBodyState(restoredBody);
      setComposerSubjectState(saved.subject || '');
      setIsDirty(true); // Preserve restored manual draft content until regenerated
      return;
    }

    // 2b. Follow-up draft linked to a sent parent message
    if (followUpFrom) {
      const parent = outreachDrafts[followUpFrom];
      if (!parent) {
        setMissingDraftError(`Original outreach "${followUpFrom}" was not found for follow-up.`);
        return;
      }
      setIsSampleMode(false);
      setEditingDraftId(null);
      setParentDraftId(parent.id);
      const safeParentChannel: OutreachChannel =
        parent.channel === 'linkedin_connect' ||
        parent.channel === 'linkedin_inmail' ||
        parent.channel === 'cold_email'
          ? parent.channel
          : 'cold_email';
      setSelectedChannel(safeParentChannel);
      setPurpose('conversation_follow_up');
      setRelationship('previous-contact');
      const fuTemplate = ALL_TEMPLATES.find((t) => t.channel === 'follow_up');
      if (fuTemplate) setSelectedTemplateId(fuTemplate.id);
      const snapSlots = parent.slotsSnapshot?.slots || parent.slots || {};
      setSlots({
        ...EMPTY_OUTREACH_SLOTS,
        ...snapSlots,
        targetCompany: parent.company || snapSlots.targetCompany || snapSlots.company || '',
        targetRole: parent.targetRole || snapSlots.targetRole || '',
        recipientName: parent.person || snapSlots.recipientName || snapSlots.person || '',
        followUpNewInfo: '',
      });
      setIsDirty(false);
      return;
    }

    // 3-5. Explicit query params -> active workspace/profile context
    const nextSlots: OutreachSlotsV2 = { ...EMPTY_OUTREACH_SLOTS };
    const preferredCandidate = candidateOptions[0];
    if (preferredCandidate) {
      setSelectedCandidateId(preferredCandidate.id);
      const firstProj = preferredCandidate.projectOptions[0];
      if (firstProj) setSelectedProjectId(firstProj.id);
      nextSlots.your_name = preferredCandidate.candidateName || '';
      nextSlots.your_email = preferredCandidate.candidateEmail || '';
      nextSlots.college = preferredCandidate.college || '';
      nextSlots.primarySkill = preferredCandidate.primarySkill || '';
      nextSlots.proofPoint = firstProj?.proofText || preferredCandidate.proofPoint || '';
      nextSlots.proofShort = firstProj?.shortText || preferredCandidate.proofShort || '';
      nextSlots.portfolio = preferredCandidate.portfolio || '';
    }
    if (companyParam) nextSlots.targetCompany = companyParam;
    if (roleParam) nextSlots.targetRole = roleParam;
    if (personParam) nextSlots.recipientName = personParam;

    if (companyParam || roleParam || personParam || preferredCandidate) {
      setSlots(nextSlots);
    }
  }, [searchParams, outreachDrafts, candidateOptions, isDirty]);

  // Template Filtering by Channel, Purpose, Recipient & Search
  const channelTemplates = useMemo(() => {
    const purposeFiltered = resolveTemplatesForPurpose(
      ALL_TEMPLATES,
      selectedChannel,
      purpose
    );
    return purposeFiltered.filter((t) => {
      if (
        filterRecipient !== 'all' &&
        !t.recipientTypes.includes(filterRecipient as OutreachRecipientType)
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.whenToUse.toLowerCase().includes(q) ||
          t.angle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedChannel, purpose, filterRecipient, searchQuery]);

  const selectedTemplate = useMemo(
    () => ALL_TEMPLATES.find((t) => t.id === selectedTemplateId) || ALL_TEMPLATES[0],
    [selectedTemplateId]
  );

  // Auto-select compatible template when purpose/channel changes
  const handleChannelSwitch = (channelId: string) => {
    setSelectedChannel(channelId);
    setSearchQuery('');
    setFilterRecipient('all');
    if (channelId !== 'all') {
      const compatible = resolveTemplatesForPurpose(ALL_TEMPLATES, channelId, purpose);
      if (compatible.length > 0 && !compatible.some((t) => t.id === selectedTemplateId)) {
        setSelectedTemplateId(compatible[0].id);
        setVariantIndex(0);
      }
    }
  };

  const handlePurposeChange = (nextPurpose: OutreachPurpose) => {
    setPurpose(nextPurpose);
    const cfg = PURPOSE_CONFIG.find((p) => p.id === nextPurpose);
    if (cfg) {
      setRelationship(cfg.defaultRelationship);
    }
    const compatible = resolveTemplatesForPurpose(ALL_TEMPLATES, selectedChannel, nextPurpose);
    if (compatible.length > 0) {
      setSelectedTemplateId(compatible[0].id);
      setVariantIndex(0);
    }
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setVariantIndex(0);
    setShowTemplateBrowser(false);
  };

  // Pure Engine Generation (NEVER overwrites manual composer edits if isDirty === true)
  const generatedFit: LengthFitResult = useMemo(() => {
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

  // Sync generated output into composer ONLY when not manually edited
  useEffect(() => {
    if (suppressNextAutoSyncRef.current) {
      suppressNextAutoSyncRef.current = false;
      return;
    }
    if (!isDirty) {
      setComposerBodyState(generatedFit.body);
      setComposerSubjectState(generatedFit.subject || '');
    }
  }, [generatedFit.body, generatedFit.subject, isDirty]);

  const setComposerBody = (value: string) => {
    setComposerBodyState(value);
    setIsDirty(value !== generatedFit.body || composerSubject !== (generatedFit.subject || ''));
  };

  const setComposerSubject = (value: string) => {
    setComposerSubjectState(value);
    setIsDirty(composerBody !== generatedFit.body || value !== (generatedFit.subject || ''));
  };

  const resetToGenerated = () => {
    setComposerBodyState(generatedFit.body);
    setComposerSubjectState(generatedFit.subject || '');
    setIsDirty(false);
    setShowRegenerateConfirm(false);
  };

  const handleCycleVariant = () => {
    if (isDirty) {
      setShowRegenerateConfirm(true);
      return;
    }
    setVariantIndex((prev) => prev + 1);
  };

  const confirmRegenerateVariant = () => {
    setIsDirty(false);
    setShowRegenerateConfirm(false);
    setVariantIndex((prev) => prev + 1);
  };

  // Final Live Evaluation on Actual Edited Text
  const evaluation: FinalComposerEvaluation = useMemo(
    () =>
      evaluateFinalComposerText({
        body: composerBody,
        subject: composerSubject || undefined,
        channel: selectedTemplate.channel,
        relationship,
        isPremiumLinkedIn,
        slots,
        requiredSlots: selectedTemplate.requiredSlots || [],
      }),
    [composerBody, composerSubject, selectedTemplate, relationship, isPremiumLinkedIn, slots]
  );

  // Deterministic 10-dimension 1-5 quality rubric (separate from canCopyOrExport)
  const evidenceSelection: RelevantEvidenceSelection = useMemo(
    () => selectRelevantProofAndSkills(selectedCandidateOption, slots.targetRole),
    [selectedCandidateOption, slots.targetRole]
  );

  const qualityRubric: MessageQualityRubricScores = useMemo(
    () =>
      scoreMessageQualityRubric({
        body: composerBody,
        subject: composerSubject || undefined,
        channel: selectedTemplate.channel,
        relationship,
        purpose,
        slots,
        evaluation,
        provenance: evidenceSelection.provenance,
      }),
    [composerBody, composerSubject, selectedTemplate, relationship, purpose, slots, evaluation, evidenceSelection]
  );

  // Compatibility object matching legacy `fitResult.*` UI telemetry contract
  const fitResult: LengthFitResult = useMemo(
    () => ({
      ...generatedFit,
      body: composerBody,
      subject: composerSubject || undefined,
      charCount: evaluation.charCount,
      wordCount: evaluation.wordCount,
      status: evaluation.status,
      overflowAmount: evaluation.overflowAmount,
      targetMax: evaluation.targetMax,
      hardMax: evaluation.hardMax,
    }),
    [generatedFit, composerBody, composerSubject, evaluation]
  );

  const slotValidation = useMemo(
    () => validateSlots(slots, selectedTemplate.requiredSlots || ['targetCompany', 'recipientName']),
    [slots, selectedTemplate]
  );
  const admiredValidation = useMemo(
    () => (slots.admiredProject?.trim() ? validateAdmiredWork(slots.admiredProject) : { valid: true }),
    [slots.admiredProject]
  );
  const proofValidation = useMemo(
    () => (slots.proofPoint?.trim() ? validateProofPoint(slots.proofPoint) : { valid: true }),
    [slots.proofPoint]
  );

  const droppedBlocksExplanation =
    !isDirty && generatedFit.droppedBlocks.length > 0
      ? `Auto-fitted to configured ${generatedFit.hardMax} safety limit by omitting optional ${generatedFit.droppedBlocks.join(', ')} block(s).`
      : null;

  // Actions: Sample, Reset, Copy, Export, Mailto, Save Vault, Mark Sent
  const loadSample = () => {
    setIsSampleMode(true);
    setSelectedCandidateId('');
    setSelectedTargetId('');
    setEditingDraftId(null);
    setParentDraftId(null);
    setSlots(SAMPLE_OUTREACH_SLOTS);
    setIsDirty(false);
  };

  const handleResetData = () => {
    setIsSampleMode(false);
    setEditingDraftId(null);
    setParentDraftId(null);
    setSelectedCandidateId('');
    setSelectedProjectId('');
    setSelectedTargetId('');
    setRecipientEmail('');
    setSlots(EMPTY_OUTREACH_SLOTS);
    setIsDirty(false);
    setShowRegenerateConfirm(false);
  };

  const handleSlotChange = (field: keyof OutreachSlotsV2, value: string | number) => {
    setSlots((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyNote = async (): Promise<boolean> => {
    if (!evaluation.canCopyOrExport) {
      if (selectedTemplate.channel === 'linkedin_connect' && evaluation.status === 'overflow') {
        setShowOverLengthModal(true);
      }
      toast('error', 'Resolve message blockers before copying.');
      return false;
    }
    try {
      await navigator.clipboard.writeText(composerBody);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopySubject = async () => {
    if (!composerSubject) return;
    try {
      await navigator.clipboard.writeText(composerSubject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch {
      // ignore
    }
  };

  const getMailtoHref = (): string | null => {
    if (selectedTemplate.channel === 'linkedin_connect' || selectedTemplate.channel === 'linkedin_inmail') {
      return null;
    }
    if (!evaluation.canCopyOrExport) return null;
    const params = new URLSearchParams();
    if (composerSubject) params.set('subject', composerSubject);
    params.set('body', composerBody);
    const to = recipientEmail.trim();
    return `mailto:${encodeURIComponent(to)}?${params.toString().replace(/\+/g, '%20')}`;
  };

  const handleSaveToVault = (asIncomplete: boolean = false): OutreachDraft | null => {
    if (!composerBody.trim()) {
      toast('error', 'Cannot save an empty message.');
      return null;
    }
    if (!asIncomplete && !evaluation.canCopyOrExport) {
      toast('error', 'Message has unresolved blockers. Fix them or save as an Incomplete Draft.');
      return null;
    }

    const cfg = PURPOSE_CONFIG.find((p) => p.id === purpose);
    const stringSlots: Record<string, string> = {};
    for (const [k, v] of Object.entries(slots)) {
      if (v !== undefined && v !== null) stringSlots[k] = String(v);
    }

    const saved = saveOutreachDraft({
      id: editingDraftId || undefined,
      templateId: selectedTemplate.id,
      channel: selectedTemplate.channel,
      status: editingDraftId && outreachDrafts[editingDraftId]?.status ? outreachDrafts[editingDraftId].status : 'draft',
      person: slots.recipientName || 'Contact',
      company: slots.targetCompany || '',
      targetRole: slots.targetRole || '',
      intent: cfg?.intent || 'introduction',
      relationship,
      subject: composerSubject || undefined,
      message: composerBody,
      renderedText: composerSubject
        ? `Subject: ${composerSubject}\n\n${composerBody}`
        : composerBody,
      parentDraftId,
      isIncomplete: asIncomplete,
      slots: {
        person: slots.recipientName || 'Contact',
        company: slots.targetCompany || '',
      },
      slotsSnapshot: {
        slots: stringSlots,
        candidateSourceLabel: isSampleMode
          ? 'Sample Mode (Fictional Demo)'
          : selectedCandidateOption?.label || 'Manual Entry',
        candidateSourceKind: isSampleMode ? 'sample' : selectedCandidateOption?.kind || 'manual',
        targetSourceLabel: isSampleMode
          ? 'Sample Mode (Fictional Demo)'
          : selectedTargetOption?.label || 'Manual Entry',
        targetSourceKind: isSampleMode ? 'sample' : selectedTargetOption?.kind || 'manual',
        provenanceNotes: selectedCandidateOption
          ? [selectedCandidateOption.provenanceLabel]
          : ['Manual input'],
      },
    });

    setEditingDraftId(saved.id);
    setSavedFeedback(asIncomplete ? 'Saved Incomplete Draft' : 'Saved to Vault');
    setTimeout(() => setSavedFeedback(null), 2500);
    toast(
      'success',
      asIncomplete
        ? 'Incomplete draft saved to My Space Outreach Vault.'
        : 'Outreach message saved to My Space Outreach Vault.'
    );
    return saved;
  };

  const handleMarkSent = () => {
    let targetId = editingDraftId;
    if (!targetId) {
      const saved = handleSaveToVault(false);
      if (!saved) return;
      targetId = saved.id;
    }
    const updated = markOutreachSent(targetId);
    if (updated) {
      toast('success', 'Marked as Sent. 5-day follow-up reminder scheduled.');
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

  const currentVaultDraft = editingDraftId ? outreachDrafts[editingDraftId] : undefined;

  return {
    allTemplates: ALL_TEMPLATES,
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
    showOverLengthModal,
    fitResult,
    generatedFit,
    evaluation,
    evidenceSelection,
    qualityRubric,
    slotValidation,
    admiredValidation,
    proofValidation,
    droppedBlocksExplanation,
    // Actions
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
    setShowOverLengthModal,
  };
}
