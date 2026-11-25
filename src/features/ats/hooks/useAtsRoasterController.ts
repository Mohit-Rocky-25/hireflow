import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProfile } from '../../suite/profile/ProfileContext';
import { extractFromFile } from '../../../lib/ats/fileExtractor';
import { validateResumeAuthenticity } from '../../../lib/resumeValidator';
import { TargetTier, ExperienceLevel, ExtractionMetaInfo } from '../components/AtsInputSection';
import { runAtsEngine, AtsEngineResult, TargetTierId, ExperienceLevelId } from '../../../lib/ats';
import { ReportTabId } from '../components/TabBar';
import { useTalentLensStore, DEMO_TALENTLENS_RESUME } from '../../../pages/demo/useTalentLensStore';
import { useAtsToolStore } from '../../../store/tools/atsStore';
import { WordLimitSource } from '../../../lib/config/limits';
import { resolveTargetJob } from '../../career-path/resolveTargetJob';
import { ConfirmedRequirement } from '../components/ConfirmRequirementsModal';
import { parseJD } from '../../../lib/ats/parseJD';
// autoSync removed (cloud-first)
import { createAuthoritativeReportSnapshot, type AuthoritativeReportSnapshot } from '../engine/authoritativeSnapshot';
import { normalizeText } from '../../../lib/text/normalize';
import { atsToAuditInput, detectTargetRoleTitle } from '../journalAdapter';
import { useAuditStore } from '../../journal/useAuditStore';
import type { AuditEntry } from '../../../domain/types';

export const STAGED_MESSAGES = [
  'Reading resume tokens & structural sections...',
  'Extracting job description requirements...',
  'Validating word boundaries & verifying evidence...',
  'Calculating 7-category weights & penalty metrics...',
  'Synthesizing grounded recruiter intelligence...',
];

export function useAtsRoasterController() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, saveFromResumeText, openDrawer } = useProfile();
  const [showFullReport, setShowFullReport] = useState(true);

  const queryCompanyId = searchParams.get('company');
  const queryRoleTitle = searchParams.get('role');
  const queryProgramId = searchParams.get('program');
  const isFromTalentLens = Boolean(queryCompanyId && (queryRoleTitle || queryProgramId));

  const initialStoredResume = useTalentLensStore.getState().resumeText;
  const initialStoredFileName = useTalentLensStore.getState().resumeFileName;

  const initialResolvedJob = useMemo(() => {
    return resolveTargetJob(queryCompanyId, queryRoleTitle, queryProgramId);
  }, [queryCompanyId, queryRoleTitle, queryProgramId]);

  const [resumeText, setResumeText] = useState<string>(() => {
    if (initialStoredResume) return initialStoredResume;
    if (isFromTalentLens) return DEMO_TALENTLENS_RESUME.text;
    return '';
  });

  const [jobText, setJobText] = useState<string>(() => {
    return initialResolvedJob.text;
  });

  const detectedTargetCompany = useMemo(() => {
    if (queryCompanyId) return queryCompanyId;
    const match = jobText.match(/(?:Company|Employer|Organization):\s*([^\r\n,]+)/i);
    if (match && match[1]) return match[1].trim();
    return undefined;
  }, [queryCompanyId, jobText]);

  const [resumeFileName, setResumeFileName] = useState<string | null>(() => {
    if (initialStoredResume) return initialStoredFileName || DEMO_TALENTLENS_RESUME.fileName;
    if (isFromTalentLens) return DEMO_TALENTLENS_RESUME.fileName;
    return null;
  });

  const [jobFileName, setJobFileName] = useState<string | null>(() => {
    return initialResolvedJob.fileName;
  });

  const [resumeSource, setResumeSource] = useState<WordLimitSource>(() => {
    if (initialStoredResume || isFromTalentLens) return 'talentlens';
    return undefined;
  });

  const [jobSource, setJobSource] = useState<WordLimitSource>(() => {
    if (initialResolvedJob.text) return 'prefilled';
    if (isFromTalentLens) return 'prefilled';
    return undefined;
  });

  const [resumePageCount, setResumePageCount] = useState<number | undefined>();
  const [jobPageCount, setJobPageCount] = useState<number | undefined>();
  const [resumeExtractionMeta, setResumeExtractionMeta] = useState<ExtractionMetaInfo | undefined>();
  const [jobExtractionMeta, setJobExtractionMeta] = useState<ExtractionMetaInfo | undefined>();
  const [targetTier, setTargetTier] = useState<TargetTier>('Auto');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Auto');
  const [fileError, setFileError] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [stagedStageIndex, setStagedStageIndex] = useState(0);
  const [isFileExtracting, setIsFileExtracting] = useState(false);
  const [engineResult, setEngineResult] = useState<AtsEngineResult | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<AuthoritativeReportSnapshot | null>(null);
  const [latestAuditEntry, setLatestAuditEntry] = useState<AuditEntry | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTabId>('overview');
  const [presentationMode, setPresentationMode] = useState<'deep' | 'quick'>('deep');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmedRequirements, setConfirmedRequirements] = useState<ConfirmedRequirement[] | null>(null);
  const [parsedJdData, setParsedJdData] = useState<ReturnType<typeof parseJD> | null>(null);

  const jobRoleBridgeSkills = useMemo(() => {
    if (!engineResult?.skillResults) return [];
    return engineResult.skillResults.map((s: any) => ({
      name: s.canonical,
      isMandatory: s.required === 'must',
      status: (s.found && s.status === 'verified' ? 'verified' : 'gap') as 'verified' | 'gap',
    }));
  }, [engineResult?.skillResults]);

  const detectedRoleTitle = useMemo(() => {
    return detectTargetRoleTitle(jobText, queryCompanyId);
  }, [queryCompanyId, jobText]);

  const userClearedJobRef = useRef(false);
  const userClearedResumeRef = useRef(false);
  const activeScanIdRef = useRef(0);

  useEffect(() => {
    const compId = searchParams.get('company');
    const rTitle = searchParams.get('role');
    const pId = searchParams.get('program');
    if (compId && (rTitle || pId)) {
      const stored = useTalentLensStore.getState().resumeText;
      const storedFile = useTalentLensStore.getState().resumeFileName;
      if (!userClearedResumeRef.current && !resumeText) {
        const textToUse = stored || DEMO_TALENTLENS_RESUME.text;
        const fileToUse = storedFile || DEMO_TALENTLENS_RESUME.fileName;
        setResumeText(textToUse);
        setResumeFileName(fileToUse);
        setResumeSource('talentlens');
        if (!stored) {
          useTalentLensStore.getState().setResume(textToUse, fileToUse);
        }
      }

      if (!userClearedJobRef.current && !jobText) {
        const resolved = resolveTargetJob(compId, rTitle, pId);
        if (resolved.text) {
          setJobText(resolved.text);
          setJobFileName(resolved.fileName);
          setJobSource('prefilled');
        }
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isScanning) {
      setStagedStageIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setStagedStageIndex((prev) => (prev + 1) % STAGED_MESSAGES.length);
    }, 600);
    return () => clearInterval(timer);
  }, [isScanning]);

  const clearPriorUploadState = (type: 'resume' | 'job') => {
    activeScanIdRef.current += 1;
    setEngineResult(null);
    setLatestSnapshot(null);
    setLatestAuditEntry(null);
    setShowFullReport(false);
    if (type === 'resume') {
      userClearedResumeRef.current = true;
      setResumeText('');
      setResumeFileName(null);
      setResumePageCount(undefined);
      setResumeExtractionMeta(undefined);
      setResumeSource(undefined);
    } else {
      userClearedJobRef.current = true;
      setJobText('');
      setJobFileName(null);
      setJobPageCount(undefined);
      setJobExtractionMeta(undefined);
      setJobSource(undefined);
      setConfirmedRequirements(null);
      setParsedJdData(null);
    }
  };

  const handleFileUpload = async (file: File, type: 'resume' | 'job') => {
    setIsFileExtracting(true);
    setFileError(null);
    try {
      const outcome = await extractFromFile(file);
      if (!outcome.ok) {
        let msg = outcome.message;
        if (outcome.reason === 'image-only') {
          msg =
            'Scanned / Image-Only Document: This file contains raster images without selectable text. ATS engines require digital text. Please export your resume directly as a text PDF from Google Docs / Microsoft Word, or switch to the Paste Text tab.';
        } else if (outcome.reason === 'encrypted') {
          msg = 'Password Protected File: This document is encrypted and cannot be processed without a password.';
        } else if (outcome.reason === 'corrupt') {
          msg = 'Corrupt File Signature: File structure is damaged or invalid. Please re-export or re-save the document.';
        }
        clearPriorUploadState(type);
        setFileError(msg);
        return;
      }

      const meta: ExtractionMetaInfo = {
        confidencePct: Math.round(outcome.data.confidence * 100),
        methodLabel:
          outcome.data.method === 'pdf-text'
            ? 'PDF Text'
            : outcome.data.method === 'docx'
            ? 'DOCX XML'
            : 'Local Text',
        warnings: outcome.data.warnings || [],
      };

      if (type === 'resume') {
        const validity = validateResumeAuthenticity(outcome.data.text);
        if (!validity.isValid) {
          clearPriorUploadState('resume');
          setFileError(
            validity.reason ||
              'Uploaded file is not a resume. It lacks standard resume sections (Experience, Education, Skills).'
          );
          return;
        }
        userClearedResumeRef.current = false;
        setResumeText(outcome.data.text);
        setResumeFileName(file.name);
        setResumePageCount(outcome.data.pages);
        setResumeExtractionMeta(meta);
        setResumeSource('upload');
      } else {
        userClearedJobRef.current = false;
        setJobText(outcome.data.text);
        setJobFileName(file.name);
        setJobPageCount(outcome.data.pages);
        setJobExtractionMeta(meta);
        setJobSource('upload');
        setConfirmedRequirements(null);
        setParsedJdData(null);
      }
    } catch (err: any) {
      clearPriorUploadState(type);
      setFileError(err?.message || 'Error processing uploaded file.');
    } finally {
      setIsFileExtracting(false);
    }
  };

  const handleClearResume = () => {
    activeScanIdRef.current += 1;
    userClearedResumeRef.current = true;
    setIsScanning(false);
    setResumeText('');
    setResumeFileName(null);
    setResumePageCount(undefined);
    setResumeExtractionMeta(undefined);
    setResumeSource(undefined);
    setEngineResult(null);
    setLatestSnapshot(null);
    setLatestAuditEntry(null);
    setShowFullReport(false);
    setFileError(null);
  };

  const handleClearJob = () => {
    activeScanIdRef.current += 1;
    userClearedJobRef.current = true;
    setIsScanning(false);
    setJobText('');
    setJobFileName(null);
    setJobPageCount(undefined);
    setJobExtractionMeta(undefined);
    setJobSource(undefined);
    setEngineResult(null);
    setLatestSnapshot(null);
    setLatestAuditEntry(null);
    setShowFullReport(false);
    setFileError(null);
    setConfirmedRequirements(null);
    setParsedJdData(null);
  };

  const handleTabChange = (tab: ReportTabId) => {
    setActiveTab(tab);
  };

  const handleImportTalentLensResume = (text: string, fileName: string) => {
    userClearedResumeRef.current = false;
    setResumeText(text);
    setResumeFileName(fileName || DEMO_TALENTLENS_RESUME.fileName);
    setResumePageCount(1);
    setResumeSource('talentlens');
    setFileError(null);
  };

  const executeAnalysis = (confirmedList?: ConfirmedRequirement[]) => {
    const currentScanId = ++activeScanIdRef.current;
    setIsScanning(true);
    setFileError(null);
    setActiveTab('overview');

    const tierMap: Record<string, TargetTierId> = {
      'Top Product': 'top_product',
      'Startup / Unicorn': 'startup_unicorn',
      'Service / MNC': 'service_mnc',
    };
    const levelMap: Record<string, ExperienceLevelId> = {
      Fresher: 'fresher',
      '1-3 yrs': '1-3',
      '3-6 yrs': '3-6',
      '6+ yrs': '6+',
    };

    const mappedTier = tierMap[targetTier] || 'auto';
    const mappedLevel = levelMap[experienceLevel] || 'auto';

    setTimeout(() => {
      if (activeScanIdRef.current !== currentScanId) {
        return;
      }
      try {
        const activeRequirements = confirmedList || confirmedRequirements || undefined;
        const normalizedResume = normalizeText(resumeText);
        const normalizedJd = normalizeText(jobText);
        const response = runAtsEngine(normalizedResume, normalizedJd, {
          tier: mappedTier,
          level: mappedLevel,
          resumeSource,
          jdSource: jobSource,
          confirmedRequirements: activeRequirements ? activeRequirements.map((r: any) => ({ text: r.text, type: r.type })) : undefined,
        });

        if (activeScanIdRef.current !== currentScanId) {
          return;
        }

        if (!response.success) {
          setEngineResult(null);
          setFileError(response.message);
          return;
        }

        setEngineResult(response.result);
        setShowFullReport(true);

        const effectiveTargetCompany = response.result.employerName || detectedTargetCompany;
        const effectiveTargetRole = detectedRoleTitle || response.result.bestFitTier || 'Target Role';
        const candidateName = response.result.candidateName || response.result.audit?.contactInfo?.name || undefined;
        const snapshot = createAuthoritativeReportSnapshot(
          response.result,
          normalizedResume,
          normalizedJd,
          {
            resumeFileName: resumeFileName || 'Pasted Resume',
            targetCompany: effectiveTargetCompany,
            targetRole: effectiveTargetRole,
            candidateName,
          }
        );
        setLatestSnapshot(snapshot);
        setLatestAuditEntry(null);

        void (async () => {
          try {
            const auditInput = atsToAuditInput({
              result: response.result,
              resumeText: normalizedResume,
              jdText: normalizedJd,
              source: (resumeSource === 'upload' ? 'upload' : 'paste') as any,
              workspaceId: null,
              resumeVersionId: null,
              resumeLabel: resumeFileName || 'Scanned Resume',
              targetCompany: effectiveTargetCompany,
              targetRole: effectiveTargetRole,
              candidateName,
            });
            const { entry } = await useAuditStore.getState().record(auditInput);
            if (activeScanIdRef.current === currentScanId) {
              setLatestAuditEntry(entry);
            }
          } catch (recordErr) {
            console.warn('Candidate OS audit record notice:', recordErr);
          }
        })();

        const missingCount = response.result.skillResults.filter((s) => !s.found).length;
        const matchedCount = response.result.skillResults.length - missingCount;
        useAtsToolStore.getState().addHistoryEntry({
          resumeFileName: resumeFileName || 'Pasted Resume',
          targetRole: effectiveTargetRole,
          score: response.result.score,
          matchedCount,
          missingCount,
          specVersion: response.result.specVersion,
          engineVersion: response.result.engineVersion,
          specFingerprint: response.result.specFingerprint,
          candidateName,
          targetCompany: effectiveTargetCompany,
          seniorityStatus: response.result.seniorityMatchResult?.status,
          isEligible: response.result.seniorityMatchResult?.isEligible,
          authoritativeSnapshot: snapshot,
        });
      } catch (err: any) {
        if (activeScanIdRef.current === currentScanId) {
          setEngineResult(null);
          setFileError(err?.message || 'Calculation exception during ATS parsing.');
        }
      } finally {
        if (activeScanIdRef.current === currentScanId) {
          setIsScanning(false);
        }
      }
    }, 1200);
  };

  return {
    navigate,
    resumeText,
    setResumeText,
    jobText,
    setJobText,
    resumeFileName,
    jobFileName,
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
    latestSnapshot,
    latestAuditEntry,
    activeTab,
    setActiveTab,
    presentationMode,
    setPresentationMode,
    showFullReport,
    setShowFullReport,
    detectedTargetCompany,
    detectedRoleTitle,
    jobRoleBridgeSkills,
    handleFileUpload,
    handleClearResume,
    handleClearJob,
    handleTabChange,
    handleImportTalentLensResume,
    executeAnalysis,
  };
}
