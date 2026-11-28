// ============================================================
// HireFlow — ATS Resume Roaster (Job Fit & Resume Improvement)
// Deterministic single source of truth with Quick Roast & Deep Roaster
// ============================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ArrowUpRight,
  Bookmark,
  GraduationCap,
  Building2,
  Info,
  X,
  Search,
} from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { useProfile } from '../../features/suite/profile/ProfileContext';
import { QuickSummaryCard } from '../../features/suite/components/QuickSummaryCard';
import { buildQuickSummary } from '../../features/suite/engine/quickSummary';
import { SimulationFacts } from '../../features/suite/engine/simulateFix';
import { extractFromFile } from '../../lib/ats/fileExtractor';
import { validateResumeAuthenticity } from '../../lib/resumeValidator';
import {
  AtsInputSection,
  TargetTier,
  ExperienceLevel,
  ExtractionMetaInfo,
} from '../../features/ats/components/AtsInputSection';
import { runAtsEngine, AtsEngineResult, TargetTierId, ExperienceLevelId } from '../../lib/ats';
import type { ApplicationGuidance, QuickRoastProjection } from '../../features/ats/engine/types';
import { ScoreHeader } from '../../features/ats/components/ScoreHeader';
import { FixTheseFirst } from '../../features/ats/components/FixTheseFirst';
import { TabBar, ReportTabId } from '../../features/ats/components/TabBar';
import { OverviewTab } from '../../features/ats/components/OverviewTab';
import { SkillsTab } from '../../features/ats/components/SkillsTab';
import { AuditTab } from '../../features/ats/components/AuditTab';
import { LearningPathTab } from '../../features/ats/components/LearningPathTab';
import { DebugDrawer } from '../../features/ats/components/DebugDrawer';
import { useTalentLensStore, DEMO_TALENTLENS_RESUME } from '../demo/useTalentLensStore';
import { useAtsToolStore } from '../../store/tools/atsStore';
import { WordLimitSource } from '../../lib/config/limits';
import { resolveTargetJob } from '../../features/career-path/resolveTargetJob';
import { ConfirmRequirementsModal, ConfirmedRequirement } from '../../features/ats/components/ConfirmRequirementsModal';
import { RealityFactorsPanel } from '../../components/common/RealityFactorsPanel';
import { JobRoleProjectBridge } from '../../features/suite/briefs/components/JobRoleProjectBridge';
import { ResumePreviewModal } from '../../components/common/ResumePreviewModal';
import { FresherChecksPanel } from '../../components/common/FresherChecksPanel';
import { DataProvenanceModal } from '../../components/common/DataProvenanceModal';
import {
  useAtsRoasterController,
  previewJdRequirementsForModal,
  STAGED_MESSAGES as CONTROLLER_STAGED_MESSAGES,
} from '../../features/ats/hooks/useAtsRoasterController';
import { cloudRepository } from '../../lib/cloud/cloudRepository';
import { uploadPrivateDocument } from '../../lib/cloud/storageService';
import { useCloudDocumentsStore } from '../../lib/cloud/useDocumentsStore';
import { useCloudSyncStore } from '../../lib/cloud/useCloudSyncStore';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { ResumePicker } from '../../features/resumes/ResumePicker';
import { useResumeStore } from '../../features/resumes/useResumeStore';
import { useAuditStore } from '../../features/journal/useAuditStore';
import { useMySpaceStore } from '../../features/my-space/useMySpaceStore';
import { useHandoffStore } from '../../features/handoff/useHandoffStore';
import {
  useTailorLaunchStore,
  buildTailorLaunchUrl,
} from '../../lib/tailor/launchContext';
import { atsToAuditInput, detectTargetRoleTitle } from '../../features/ats/journalAdapter';
import {
  createAuthoritativeReportSnapshot,
  type AuthoritativeReportSnapshot,
} from '../../features/ats/engine/authoritativeSnapshot';
import { exportDossier } from '../../features/dossier/exportDossier';
import { ExportDossierButton } from '../../features/dossier/ExportDossierButton';
import { slug, makeTargetKey } from '../../domain/ids';
import { sha256Hex } from '../../lib/crypto/sha256';
import { normalizeText } from '../../lib/text/normalize';
import type { AuditEntry, TextSnapshot, Uuid } from '../../domain/types';

const STAGED_MESSAGES = [
  'Reading resume tokens & structural sections...',
  'Extracting job description requirements...',
  'Validating word boundaries & verifying evidence...',
  'Calculating 7-category weights & penalty metrics...',
  'Synthesizing grounded recruiter intelligence...',
];

export function buildQuickRoastProjection(engineResult: AtsEngineResult): QuickRoastProjection {
  if (engineResult.quickRoast) return engineResult.quickRoast;
  const verifiedStrengths = (engineResult.skillResults || [])
    .filter((s) => s.status === 'verified' && s.evidence?.length > 0)
    .slice(0, 3)
    .map((s) => ({
      title: s.canonical || s.skillId,
      evidenceQuote: s.evidence[0]?.quote || '',
    }));
  const priorityGaps = (engineResult.skillResults || [])
    .filter((s) => s.status === 'missing' || s.status === 'weak')
    .slice(0, 3)
    .map((s) => ({
      title: s.canonical || s.skillId,
      gapType: s.status === 'missing' ? 'missing_skill' : 'weak_evidence',
    }));
  const prioritizedActions = (engineResult.fixFirst || []).slice(0, 3).map((f) => ({
    title: f.title,
    action: f.reason,
  }));
  return {
    finalScore: engineResult.trace?.composite ?? engineResult.score,
    oneLineVerdict: engineResult.headline,
    strengths: verifiedStrengths,
    gaps: priorityGaps,
    prioritizedActions,
  };
}

export function deriveApplicationGuidance(engineResult: AtsEngineResult): ApplicationGuidance {
  if (engineResult.applicationGuidance) return engineResult.applicationGuidance;
  if (engineResult.confidence === 'Low') return 'Insufficient evidence to evaluate';
  const score = engineResult.trace?.composite ?? engineResult.score;
  if (score >= 80) return 'Ready to apply';
  if (score >= 60) return 'Apply after high-priority fixes';
  return 'Significant gaps to address';
}

export function buildFallbackAuditEntry(params: {
  engineResult: AtsEngineResult;
  quickRoast: QuickRoastProjection | null;
  effectiveSnapshot: AuthoritativeReportSnapshot | null;
  quickSummary: ReturnType<typeof buildQuickSummary> | null;
  detectedTargetCompany?: string;
  detectedRoleTitle: string;
  resumeFileName: string | null;
  jobRoleBridgeSkills: Array<{ name: string; isMandatory: boolean; status: 'verified' | 'gap' }>;
}): AuditEntry {
  const {
    engineResult,
    quickRoast,
    effectiveSnapshot,
    quickSummary,
    detectedTargetCompany,
    detectedRoleTitle,
    resumeFileName,
    jobRoleBridgeSkills,
  } = params;

  const authoritativeScore = engineResult.trace?.composite ?? engineResult.score;
  const effectiveCompany = engineResult.employerName || detectedTargetCompany;
  const fallbackBreakdown = engineResult.trace?.pillars
    ? engineResult.trace.pillars
        .filter((p) => p.applicable && p.effectiveWeight > 0)
        .map((p) => {
          const maxPts = Math.round(p.effectiveWeight * 100);
          return {
            key: p.id,
            label: p.label,
            score: maxPts > 0 ? Math.round((p.contribution / maxPts) * 100) : 0,
            weight: p.effectiveWeight,
          };
        })
    : (() => {
        const w = engineResult.activeWeights || {
          mustHaveCoverage: 30,
          evidenceDepth: 20,
          impactMetrics: 15,
          projectsAndOss: 10,
          seniorityFit: 10,
          formatAndParse: 10,
          tierFit: 5,
        };
        const dims = [
          { key: 'must_have', label: 'Must-Have Coverage', val: engineResult.subscores?.mustHaveCoverage ?? 0, max: w.mustHaveCoverage ?? 30 },
          { key: 'evidence', label: 'Evidence Quality', val: engineResult.subscores?.evidenceDepth ?? 0, max: w.evidenceDepth ?? 20 },
          { key: 'impact', label: 'Impact Metrics', val: engineResult.subscores?.impactMetrics ?? 0, max: w.impactMetrics ?? 15 },
          { key: 'relevance', label: 'Project Relevance', val: engineResult.subscores?.projectsAndOss ?? 0, max: w.projectsAndOss ?? 10 },
          { key: 'seniority', label: 'Seniority Fit', val: engineResult.subscores?.seniorityFit ?? 0, max: w.seniorityFit ?? 10 },
          { key: 'formatting', label: 'Formatting Safety', val: engineResult.subscores?.formatAndParse ?? 0, max: w.formatAndParse ?? 10 },
          { key: 'tier_fit', label: 'Tier Fit', val: engineResult.subscores?.tierFit ?? 0, max: w.tierFit ?? 5 },
        ];
        return dims
          .filter((d) => d.max > 0)
          .map((d) => ({
            key: d.key,
            label: d.label,
            score: Math.round((d.val / d.max) * 100),
            weight: d.max / 100,
          }));
      })();

  return {
    schemaVersion: 1,
    id: 'audit-' + Date.now(),
    targetKey: `ats:${effectiveCompany ? slug(effectiveCompany) : 'target'}:${detectedRoleTitle ? slug(detectedRoleTitle) : 'role'}`,
    kind: 'ats_roast',
    engineVersion: engineResult.engineVersion || engineResult.trace?.engineVersion || '4.0.0',
    runKey: 'local-ats-run',
    overallScore: authoritativeScore,
    createdAt: new Date().toISOString(),
    resume: {
      workspaceId: null,
      versionId: null,
      label: resumeFileName || 'Scanned Resume',
      snapshotHash: 'res-snapshot-local',
    },
    jd: {
      origin: 'pasted',
      company: effectiveCompany || undefined,
      roleTitle: detectedRoleTitle || undefined,
      snapshotHash: 'jd-snapshot-local',
    },
    breakdown: fallbackBreakdown,
    strengths: (quickRoast?.strengths || [])
      .map((s) => s.title || String(s))
      .concat(
        (engineResult.skillResults || [])
          .filter((s) => s.status === 'verified')
          .slice(0, 3)
          .map((s) => `${s.canonical || s.skillId}: verified`)
      )
      .slice(0, 5),
    gaps: (engineResult.skillResults || [])
      .filter((s) => s.status === 'missing' && s.required === 'must')
      .map((m, idx) => ({
        id: `gap-${idx}`,
        category: 'skill' as const,
        label: m.canonical || m.skillId || 'Requirement gap',
        severity: 3 as const,
        detail: `Must-have skill "${m.canonical || m.skillId}" not satisfied.`,
      })),
    delta: null,
    findingsJson: {
      kind: 'ats_roast',
      engineResult,
      authoritativeSnapshot: effectiveSnapshot,
      quickSummary,
      targetCompany: effectiveCompany,
      targetRole: detectedRoleTitle,
      bridgeSkills: jobRoleBridgeSkills,
    },
    evidence: [],
  };
}

export function ResumeChecker() {
  const [searchParams] = useSearchParams();
  const { profile, saveFromResumeText, openDrawer } = useProfile();
  const {
    navigate,
    resumeText,
    setResumeText,
    jobText,
    setJobText,
    resumeFileName,
    setResumeFileName,
    jobFileName,
    setJobFileName,
    resumePageCount,
    setResumePageCount,
    jobPageCount,
    setJobPageCount,
    resumeExtractionMeta,
    jobExtractionMeta,
    resumeSource,
    setResumeSource,
    jobSource,
    setJobSource,
    userClearedResumeRef,
    userClearedJobRef,
    activeScanIdRef,
    targetTier,
    setTargetTier,
    experienceLevel,
    setExperienceLevel,
    fileError,
    setFileError,
    isScanning,
    stagedStageIndex,
    isFileExtracting,
    engineResult,
    setEngineResult,
    latestSnapshot,
    latestAuditEntry,
    setLatestAuditEntry,
    activeTab,
    setActiveTab,
    presentationMode,
    setPresentationMode,
    showFullReport,
    setShowFullReport,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    confirmedRequirements,
    setConfirmedRequirements,
    parsedJdData,
    setParsedJdData,
    selectedResumeMeta,
    setSelectedResumeMeta,
    detectedTargetCompany,
    detectedRoleTitle,
    jobRoleBridgeSkills,
    handleFileUpload,
    handleClearResume,
    handleClearJob,
    handleTabChange: controllerTabChange,
    handleImportTalentLensResume,
    handleAnalyze,
    handleConfirmRequirements,
    handleTryAnotherJob,
  } = useAtsRoasterController();

  const [lastTargetAudit, setLastTargetAudit] = useState<AuditEntry | null>(null);
  const [dismissTargetBanner, setDismissTargetBanner] = useState(false);

  // Consume handoff from other tools (Tailor, Matrix, Watchlist)
  useEffect(() => {
    const handoff = useHandoffStore.getState().consume('/tools/resume-checker');
    const activeUserId = useAuthStore.getState().userId;
    if (handoff) {
      if (handoff.resumeVersionId) {
        const ver = useResumeStore.getState().versions[handoff.resumeVersionId];
        if (ver) {
          void cloudRepository.fetchSnapshot(ver.snapshotHash, activeUserId).then((snap) => {
            if (snap) {
              setResumeText(snap.text);
              setResumeFileName(ver.label);
              setSelectedResumeMeta({
                workspaceId: ver.workspaceId,
                versionId: ver.id,
                label: ver.label,
              });
            }
          });
        }
      }
      if (handoff.jdSnapshotHash) {
        void cloudRepository.fetchSnapshot(handoff.jdSnapshotHash, activeUserId).then((snap) => {
          if (snap) {
            setJobText(snap.text);
            setJobFileName('Saved Target JD');
          }
        });
      }
    }
  }, []);

  // Detect previous scan for this target
  useEffect(() => {
    if (!jobText.trim()) {
      setLastTargetAudit(null);
      return;
    }
    void (async () => {
      try {
        const snapHash = await sha256Hex(normalizeText(jobText));
        const tKey = await makeTargetKey({
          company: detectedTargetCompany,
          roleTitle: detectedRoleTitle,
          jdSnapshotHash: snapHash,
        });
        const entries = Object.values(useAuditStore.getState().entries);
        const matching = entries
          .filter((e) => e.targetKey === tKey && e.kind === 'ats_roast')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (matching.length > 0) {
          setLastTargetAudit(matching[0]);
        } else {
          setLastTargetAudit(null);
        }
      } catch {
        setLastTargetAudit(null);
      }
    })();
  }, [jobText, detectedTargetCompany, detectedRoleTitle]);

  const headerRef = useRef<HTMLDivElement>(null);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: ReportTabId) => {
    void activeScanIdRef.current;
    controllerTabChange(tab);
    if (tabBarRef.current) {
      tabBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Preserve lifecycle reset helper compatibility
  const resetScanOutputs = () => {
    setEngineResult(null);
    setLatestAuditEntry(null);
  };
  void resetScanOutputs;

  const quickRoast = useMemo<QuickRoastProjection | null>(() => {
    if (!engineResult) return null;
    return buildQuickRoastProjection(engineResult);
  }, [engineResult]);

  const applicationGuidance = useMemo<ApplicationGuidance | null>(() => {
    if (!engineResult) return null;
    return deriveApplicationGuidance(engineResult);
  }, [engineResult]);

  const effectiveSnapshot = useMemo<AuthoritativeReportSnapshot | null>(() => {
    if (!engineResult) return null;
    if (latestSnapshot) return latestSnapshot;
    return createAuthoritativeReportSnapshot(
      engineResult,
      normalizeText(resumeText),
      normalizeText(jobText),
      {
        resumeFileName: resumeFileName || 'resume.pdf',
        targetCompany: engineResult.employerName || detectedTargetCompany,
        targetRole: detectedRoleTitle || engineResult.bestFitTier || 'Standard Role',
        candidateName: engineResult.candidateName || engineResult.audit?.contactInfo?.name || undefined,
      }
    );
  }, [engineResult, latestSnapshot, resumeText, jobText, resumeFileName, detectedTargetCompany, detectedRoleTitle]);

  const quickSummary = React.useMemo(() => {
    if (!engineResult) return null;
    const facts: SimulationFacts = {
      skillResults: engineResult.skillResults,
      baseScore: engineResult.score,
      wordCount: engineResult.audit.wordCount,
    };
    return buildQuickSummary(facts, profile);
  }, [engineResult, profile]);

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-4 sm:px-6 md:px-8 relative">
      <PublicNavbar />

      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* In-Flow Navigation Bar */}
        <div className="flex items-center justify-between pb-2 print:hidden">
          <button
            type="button"
            onClick={() => (engineResult ? handleTryAnotherJob() : navigate('/tools'))}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-near-black border border-charcoal text-silver hover:text-white hover:border-volt text-xs font-semibold uppercase tracking-[1px] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5px]" />
            <span>{engineResult ? 'Modify Inputs' : 'Decision Suite'}</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded bg-near-black border border-charcoal text-[11px] font-semibold text-silver uppercase tracking-[1px]">
            <span>Tools</span>
            <span className="text-charcoal-deep">/</span>
            <span className="text-white">ATS Resume Roaster</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 mt-1 print:mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-near-black border border-charcoal text-silver text-xs font-semibold uppercase tracking-[1.4px] mb-4 flex-wrap justify-center">
            <span>Deterministic ATS Fit Audit</span>
            <span className="text-charcoal-deep">|</span>
            <span>Zero-Fabrication Analysis</span>
            <span className="text-charcoal-deep">|</span>
            <DataProvenanceModal
              triggerButtonText="Data Sources & Disclosures"
              triggerButtonClassName="text-volt hover:text-white uppercase tracking-[1px] text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12] mb-3.5">
            How well does your resume match,{' '}
            <span className="block text-volt">
              and what should you improve?
            </span>
          </h1>
          <p className="text-silver text-[15px] sm:text-[16px] leading-relaxed max-w-2xl mx-auto font-normal">
            Audit your resume against any target job description. Receive deterministic keyword scoring, verbatim citations, and actionable bullet rewrites calibrated to engineering hiring bars.
          </p>
        </div>

        {/* Input Panel Section */}
        {!engineResult && (
          <div className="space-y-6">
            {/* Earlier Scan Banner */}
            {lastTargetAudit && !dismissTargetBanner && (
              <div className="max-w-6xl mx-auto p-3.5 rounded bg-[#10100d] border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-[#faff69] font-semibold">Earlier scan on file:</span>
                  <span>
                    Last scored {lastTargetAudit.overallScore}/100 on {new Date(lastTargetAudit.createdAt).toLocaleDateString()} with {lastTargetAudit.gaps.length} open gaps.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissTargetBanner(true)}
                  className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Candidate OS Resume & Target Selector Toolbar */}
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 p-3 bg-[#10100d] border border-neutral-800 rounded text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-neutral-400">Resume Source:</span>
                <ResumePicker
                  onSelectResume={(text, meta) => {
                    if (text) {
                      setResumeText(text);
                      setResumeFileName(meta.label);
                      setSelectedResumeMeta(meta);
                    }
                  }}
                />
              </div>
              {Object.keys(useMySpaceStore.getState().watchlist).length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Target from Watchlist:</span>
                  <select
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const target = useMySpaceStore.getState().watchlist[val];
                      if (target && target.jdSnapshotHash) {
                        const snap = await cloudRepository.fetchSnapshot(
                          target.jdSnapshotHash,
                          useAuthStore.getState().userId
                        );
                        if (snap) {
                          setJobText(snap.text);
                          setJobFileName(`${target.companyName}, ${target.roleTitle || 'General'}`);
                        }
                      }
                    }}
                    className="bg-[#141410] border border-neutral-800 text-neutral-300 rounded px-2.5 py-1 text-xs outline-none focus:border-[#faff69]"
                  >
                    <option value="">Select saved target...</option>
                    {Object.values(useMySpaceStore.getState().watchlist).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.companyName}, {t.roleTitle || 'General'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <AtsInputSection
              resumeText={resumeText}
              jobText={jobText}
              resumeFileName={resumeFileName}
              jobFileName={jobFileName}
              resumePageCount={resumePageCount}
              jobPageCount={jobPageCount}
              targetTier={targetTier}
              experienceLevel={experienceLevel}
              isScanning={isScanning}
              isFileExtracting={isFileExtracting}
              stagedStageIndex={stagedStageIndex}
              stagedMessages={STAGED_MESSAGES}
              fileError={fileError}
              resumeSource={resumeSource}
              jobSource={jobSource}
              resumeExtractionMeta={resumeExtractionMeta}
              jobExtractionMeta={jobExtractionMeta}
              onResumeTextChange={(txt) => {
                userClearedResumeRef.current = false;
                setResumeText(txt);
                setFileError(null);
                if (!txt.trim()) {
                  setResumeFileName(null);
                  setResumePageCount(undefined);
                  setResumeSource(undefined);
                }
              }}
              onJobTextChange={(txt) => {
                userClearedJobRef.current = false;
                setJobText(txt);
                setConfirmedRequirements(null);
                setParsedJdData(null);
                setFileError(null);
                if (!txt.trim()) {
                  setJobFileName(null);
                  setJobPageCount(undefined);
                  setJobSource(undefined);
                }
              }}
              onTargetTierChange={setTargetTier}
              onExperienceLevelChange={setExperienceLevel}
              onFileUpload={handleFileUpload}
              onClearResume={handleClearResume}
              onClearJob={handleClearJob}
              onAnalyze={handleAnalyze}
              onImportTalentLensResume={handleImportTalentLensResume}
            />
          </div>
        )}

        {/* Results Screen */}
        {engineResult && (() => {
          const authoritativeScore = engineResult.trace?.composite ?? engineResult.score;
          const effectiveAudit: AuditEntry =
            latestAuditEntry ||
            buildFallbackAuditEntry({
              engineResult,
              quickRoast,
              effectiveSnapshot,
              quickSummary,
              detectedTargetCompany,
              detectedRoleTitle,
              resumeFileName,
              jobRoleBridgeSkills,
            });

          return (
          <div className="space-y-8 animate-fade-in">
            {/* Quick Summary Card Pinned at the Top */}
            {quickSummary && (
              <QuickSummaryCard
                summary={quickSummary}
                score={engineResult.score}
                isFullReportVisible={showFullReport}
                onToggleFullReport={() => setShowFullReport((prev) => !prev)}
                onFixClick={() => {
                  setPresentationMode('deep');
                  setActiveTab('skills');
                  setShowFullReport(true);
                }}
              />
            )}

            {/* Scanned Resume Content Preview Banner */}
            <ResumePreviewModal
              resumeText={resumeText}
              fileName={resumeFileName}
              showSnippetBanner={true}
            />

            {/* Top Re-Scan Action Bar with Mode Switcher & Download Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-near-black border border-charcoal shadow-level-1 print:hidden">
              <div className="flex items-center gap-3 min-w-0 text-sm">
                <span className="text-xs font-bold text-silver uppercase tracking-[1.4px]">Target:</span>
                <span className="font-bold text-white truncate">
                  {engineResult.bestFitTier} ({engineResult.seniorityFit.level} Level)
                </span>

                {applicationGuidance && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-[1px] border ${
                      applicationGuidance === 'Ready to apply'
                        ? 'bg-black text-volt border-volt/60'
                        : applicationGuidance === 'Apply after high-priority fixes'
                        ? 'bg-black text-pale-yellow border-pale-yellow/60'
                        : applicationGuidance === 'Insufficient evidence to evaluate'
                        ? 'bg-black text-silver border-charcoal'
                        : 'bg-black text-danger border-danger/60'
                    }`}
                  >
                    {applicationGuidance}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Prominently Highlighted Download Complete Report Action */}
                <ExportDossierButton
                  audit={effectiveAudit}
                  resumeText={resumeText}
                  jdText={jobText}
                  highlighted={true}
                  label="Download ATS Roast Report"
                />

                {/* Mode Switcher Toggle */}
                <div className="inline-flex rounded bg-black p-1 border border-charcoal">
                  <button
                    type="button"
                    onClick={() => setPresentationMode('quick')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[1px] rounded transition-all cursor-pointer ${
                      presentationMode === 'quick'
                        ? 'bg-near-black text-volt border border-volt shadow-level-4'
                        : 'text-silver hover:text-white'
                    }`}
                  >
                    Quick Roast
                  </button>
                  <button
                    type="button"
                    onClick={() => setPresentationMode('deep')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[1px] rounded transition-all cursor-pointer ${
                      presentationMode === 'deep'
                        ? 'bg-near-black text-volt border border-volt shadow-level-4'
                        : 'text-silver hover:text-white'
                    }`}
                  >
                    Deep Roaster
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const pj = previewJdRequirementsForModal(
                      jobText,
                      confirmedRequirements
                        ? confirmedRequirements.map((r) => ({ text: r.text, type: r.type }))
                        : undefined
                    );
                    setParsedJdData(pj);
                    setIsConfirmModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt text-xs font-bold uppercase tracking-[1px] rounded text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Review and adjust mandatory vs preferred requirements for this job"
                >
                  <Search className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Confirm Requirements
                </button>

                <ResumePreviewModal
                  resumeText={resumeText}
                  fileName={resumeFileName}
                  triggerButtonText="Inspect Scanned Resume"
                  triggerClassName="px-3.5 py-2 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt text-xs font-bold uppercase tracking-[1px] rounded text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                />

                <button
                  type="button"
                  onClick={handleTryAnotherJob}
                  className="px-4 py-2 bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt text-xs font-bold uppercase tracking-[1px] rounded text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Try Another Job
                </button>

                <button
                  type="button"
                  onClick={() => {
                    saveFromResumeText(resumeText);
                    openDrawer();
                  }}
                  className="px-4 py-2 bg-forest hover:bg-[#3a3a3a] border border-[#141414] text-xs font-bold uppercase tracking-[1px] rounded text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 stroke-[1.5px]" /> Save to my profile
                </button>
              </div>
            </div>

            {showFullReport && (
              <>
                {/* PRESENTATION MODE 1: QUICK ROAST */}
                {presentationMode === 'quick' && quickRoast && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Score & Verdict Card */}
                    <div className="bg-near-black rounded-lg p-6 sm:p-8 border border-charcoal shadow-level-1 text-center">
                      <div className="inline-flex items-center px-3 py-1 bg-black text-volt border border-volt/60 rounded text-xs font-bold uppercase tracking-[1.4px] mb-4">
                        Grounded Quick Roast
                      </div>

                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="text-6xl sm:text-7xl font-black font-mono text-white">
                          {authoritativeScore}
                          <span className="text-3xl text-volt ml-1">%</span>
                        </div>
                      </div>

                      <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {quickRoast.oneLineVerdict}
                      </div>

                      <p className="text-sm text-silver max-w-xl mx-auto mb-6">
                        Confidence: <span className="font-bold text-white capitalize">{engineResult.confidence}</span> • Band:{' '}
                        <span className="font-bold text-white">{engineResult.band}</span>
                        {applicationGuidance && (
                          <>
                            {' '}• Guidance: <span className="font-bold text-white">{applicationGuidance}</span>
                          </>
                        )}
                      </p>

                      <div className="flex justify-center items-center gap-3 flex-wrap">
                        <ExportDossierButton
                          audit={effectiveAudit}
                          resumeText={resumeText}
                          jdText={jobText}
                          highlighted={true}
                          label="Download ATS Roast Report"
                        />
                        <button
                          type="button"
                          onClick={() => setPresentationMode('deep')}
                          className="group px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-[1.4px] rounded border border-charcoal hover:border-volt hover:text-volt transition-colors inline-flex items-center gap-2 cursor-pointer font-mono"
                        >
                          <span>Inspect Full Deep Breakdown</span>
                          <ArrowUpRight className="w-4 h-4 stroke-[2px]" />
                        </button>
                      </div>
                    </div>

                    {/* 3 Strengths & 3 Gaps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1">
                        <h3 className="text-base font-bold text-white uppercase tracking-tight mb-4">
                          Key Verified Strengths (Up to 3)
                        </h3>
                        <div className="space-y-3">
                          {quickRoast.strengths.length === 0 ? (
                            <p className="text-sm text-neutral-400">No strong verified strengths detected.</p>
                          ) : (
                            quickRoast.strengths.map((s, i) => (
                              <div key={i} className="p-4 bg-black rounded-lg border border-charcoal text-sm">
                                <div className="font-bold text-white text-base">{s.title}</div>
                                <div className="text-neutral-300 mt-1.5 italic leading-relaxed">&ldquo;{s.evidenceQuote}&rdquo;</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Gaps */}
                      <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1">
                        <h3 className="text-base font-bold text-danger uppercase tracking-tight mb-4">
                          Top Priority Gaps (Up to 3)
                        </h3>
                        <div className="space-y-3">
                          {quickRoast.gaps.length === 0 ? (
                            <p className="text-sm text-neutral-400">No critical skill gaps found.</p>
                          ) : (
                            quickRoast.gaps.map((g, i) => (
                              <div key={i} className="p-4 bg-black rounded-lg border border-danger/40 text-sm">
                                <div className="font-bold text-white text-base">{g.title}</div>
                                <div className="text-danger mt-1 uppercase tracking-wider text-xs font-bold">Gap type: {g.gapType.replace(/_/g, ' ')}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prioritized Actions */}
                    <div className="bg-near-black rounded-lg p-6 border border-charcoal shadow-level-1">
                      <h3 className="text-base font-bold text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                        Top Prioritized Action Items
                      </h3>
                      <div className="space-y-3">
                        {quickRoast.prioritizedActions.map((act, i) => (
                          <div key={i} className="p-4 sm:p-5 bg-black rounded-lg border border-charcoal text-sm flex items-start gap-3.5">
                            <span className="w-7 h-7 rounded-full bg-near-black border border-charcoal text-volt font-bold text-sm flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <div>
                              <div className="font-bold text-white text-base">{act.title}</div>
                              <div className="text-neutral-300 text-sm mt-1 leading-relaxed">{act.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <JobRoleProjectBridge
                      skills={jobRoleBridgeSkills}
                      roleTitle={detectedRoleTitle}
                      className="mt-6"
                    />

                    <RealityFactorsPanel className="mt-6" />
                  </div>
                )}

                {/* PRESENTATION MODE 2: DEEP ROASTER */}
                {presentationMode === 'deep' && (
              <>
                {/* Candidate OS Progression & Actions */}
                {latestAuditEntry && (
                  <div className="p-4 rounded bg-[#10100d] border border-neutral-800 text-xs font-mono mb-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {latestAuditEntry.delta ? (
                          <span className={`px-2.5 py-1 rounded font-bold text-sm ${
                            latestAuditEntry.delta.overallDeltaPts > 0
                              ? 'bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30'
                              : latestAuditEntry.delta.overallDeltaPts < 0
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}>
                            {latestAuditEntry.delta.overallDeltaPts >= 0 ? `+${latestAuditEntry.delta.overallDeltaPts}%` : `${latestAuditEntry.delta.overallDeltaPts}%`}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] uppercase">
                            Baseline Scan
                          </span>
                        )}
                        <span className="text-neutral-300 font-semibold">
                          {latestAuditEntry.delta
                            ? `${latestAuditEntry.delta.resolvedGapIds.length} gaps resolved · ${latestAuditEntry.delta.newGapIds.length} new`
                            : `${latestAuditEntry.gaps.length} open gaps identified`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            useMySpaceStore.getState().addWatchlistTarget({
                              targetKey: latestAuditEntry.targetKey,
                              companyName: detectedTargetCompany || 'Target Company',
                              roleTitle: detectedRoleTitle || undefined,
                              jdSnapshotHash: latestAuditEntry.jd.snapshotHash,
                            });
                          }}
                          className="px-3 py-1.5 rounded border border-neutral-700 bg-[#141410] text-neutral-200 hover:text-[#faff69] hover:border-[#faff69]/40 transition-colors cursor-pointer"
                        >
                          Save to Watchlist
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const ctx = useTailorLaunchStore.getState().registerLaunchContext({
                              sourceEntryPoint: 'resume_roaster',
                              mode: 'full_tailor',
                              workspaceId: latestAuditEntry.resume.workspaceId,
                              versionId: latestAuditEntry.resume.versionId,
                              snapshotHash: latestAuditEntry.resume.snapshotHash,
                              resumeLabel: latestAuditEntry.resume.label,
                              auditId: latestAuditEntry.id,
                              talentLensAssessmentId: null,
                              findingIds: latestAuditEntry.gaps.map((g) => g.id),
                              evidenceIds: latestAuditEntry.evidence.map((ev) => ev.findingId),
                              jdIds: [],
                              jdSnapshotHash: latestAuditEntry.jd.snapshotHash,
                              jdTitle: detectedRoleTitle || undefined,
                              jdCompany: detectedTargetCompany || undefined,
                              dualJdComparisonId: null,
                              targetKey: latestAuditEntry.targetKey,
                              selectedSection: null,
                              selectedBullet: null,
                              focusSkill: latestAuditEntry.gaps[0]?.label ?? null,
                            });
                            navigate(buildTailorLaunchUrl(ctx));
                          }}
                          className="px-3 py-1.5 rounded font-semibold bg-[#faff69] text-[#090907] hover:bg-[#faff69]/90 transition-colors cursor-pointer"
                        >
                          Tailor this resume
                        </button>
                        <ExportDossierButton
                          audit={effectiveAudit}
                          resumeText={resumeText}
                          jdText={jobText}
                          highlighted={true}
                          label="Download ATS Roast Report"
                        />
                        <Link
                          to="/my-space/scans"
                          className="px-3 py-1.5 rounded border border-neutral-700 text-neutral-400 hover:text-white transition-colors"
                        >
                          View in My Space
                        </Link>
                      </div>
                    </div>
                    {latestAuditEntry.delta && (
                      <div className="text-[10px] text-neutral-500">
                        Progression compared to baseline audit ({latestAuditEntry.delta.baselineAuditId.slice(0, 8)}) recorded on {new Date(latestAuditEntry.delta.baselineCreatedAt).toLocaleDateString()}.
                      </div>
                    )}
                  </div>
                )}

                {/* Layout Section A: Score Header */}
                <ScoreHeader result={engineResult} headerRef={headerRef} />

                {/* Reality Factors (Stage 3D, Unscored) */}
                <RealityFactorsPanel className="mb-6" />

                {/* Fresher & Student Checks (Stage 4) */}
                <FresherChecksPanel resumeText={resumeText} className="mb-6" />

                {/* Layout Section B: Fix These First */}
                <FixTheseFirst
                  items={engineResult.fixFirst}
                  auditContext={
                    latestAuditEntry
                      ? {
                          workspaceId: latestAuditEntry.resume.workspaceId,
                          versionId: latestAuditEntry.resume.versionId,
                          snapshotHash: latestAuditEntry.resume.snapshotHash,
                          auditId: latestAuditEntry.id,
                          jdSnapshotHash: latestAuditEntry.jd.snapshotHash,
                          targetKey: latestAuditEntry.targetKey,
                        }
                      : undefined
                  }
                />

                {/* Target Role Skills & Project Brief Bridge */}
                <JobRoleProjectBridge
                  skills={jobRoleBridgeSkills}
                  roleTitle={detectedRoleTitle}
                  className="mb-6"
                />

                {/* Layout Section C: Tab Bar with Exactly 4 Tabs */}
                <div className="space-y-6">
                  <TabBar
                    activeTab={activeTab}
                    skillsCount={engineResult.skillResults.length}
                    onTabChange={handleTabChange}
                    tabBarRef={tabBarRef}
                  />

                  {/* Tab Content Panes */}
                  <div className="min-h-[450px]">
                    {activeTab === 'overview' && <OverviewTab result={engineResult} />}
                    {activeTab === 'skills' && <SkillsTab skills={engineResult.skillResults} />}
                    {activeTab === 'audit' && <AuditTab result={engineResult} />}
                    {activeTab === 'learning_path' && <LearningPathTab result={engineResult} />}
                  </div>
                </div>
              </>
            )}
              </>
            )}
          </div>
          );
        })()}

        {/* Legal & Data Provenance Strip */}
        <div className="mt-12 p-4 rounded-lg bg-near-black border border-charcoal flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-silver">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-volt flex-shrink-0"></span>
            <span>
              <strong>Deterministic Matching & Fair Use:</strong> Scoring executes purely on lexical & token boundaries with zero generative hallucinations. All company benchmarks and role titles are processed under Nominative Fair Use and Section 52(1)(a) of the Indian Copyright Act (Educational research & private study).
            </span>
          </div>
          <DataProvenanceModal
            triggerButtonText="Data Sources & Disclosures"
            triggerButtonClassName="px-3 py-1.5 bg-black border border-charcoal hover:border-volt rounded text-xs font-semibold uppercase tracking-[1px] text-volt hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Requirement Confirmation Modal (Stage 2C) */}
      {isConfirmModalOpen && parsedJdData && (
        <ConfirmRequirementsModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmRequirements}
          extractedRequirements={parsedJdData.extractedRequirements || []}
          unrecognizedRequirements={parsedJdData.unrecognizedRequirements || []}
        />
      )}

      {/* Dev-Only Debug Drawer */}
      <DebugDrawer result={engineResult} />
    </div>
  );
}
