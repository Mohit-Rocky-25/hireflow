// ============================================================
// HireFlow ATS Resume Roaster — Input Screen Component (Stage 1)
// Clean segmented selectors, 16px+ typography, parsed badges
// ============================================================

import React, { useMemo } from 'react';
import { FileText, Search, ScanLine, AlertCircle } from 'lucide-react';
import { countWords } from '../fileParser';
import { SegmentedSelectors, TargetTier, ExperienceLevel } from './SegmentedSelectors';
import { FileDropzone } from './FileDropzone';
import { useTalentLensStore } from '../../../pages/demo/useTalentLensStore';

export type { TargetTier, ExperienceLevel };

interface Props {
  resumeText: string;
  jobText: string;
  resumeFileName: string | null;
  jobFileName: string | null;
  resumePageCount?: number;
  jobPageCount?: number;
  targetTier: TargetTier;
  experienceLevel: ExperienceLevel;
  isScanning: boolean;
  isFileExtracting: boolean;
  stagedStageIndex: number;
  stagedMessages: string[];
  fileError: string | null;
  onResumeTextChange: (text: string) => void;
  onJobTextChange: (text: string) => void;
  onTargetTierChange: (tier: TargetTier) => void;
  onExperienceLevelChange: (level: ExperienceLevel) => void;
  onFileUpload: (file: File, type: 'resume' | 'job') => void;
  onClearResume: () => void;
  onClearJob: () => void;
  onAnalyze: () => void;
  onImportTalentLensResume?: (text: string, fileName: string) => void;
}

export const AtsInputSection: React.FC<Props> = ({
  resumeText,
  jobText,
  resumeFileName,
  jobFileName,
  resumePageCount,
  jobPageCount,
  targetTier,
  experienceLevel,
  isScanning,
  isFileExtracting,
  stagedStageIndex,
  stagedMessages,
  fileError,
  onResumeTextChange,
  onJobTextChange,
  onTargetTierChange,
  onExperienceLevelChange,
  onFileUpload,
  onClearResume,
  onClearJob,
  onAnalyze,
  onImportTalentLensResume,
}) => {
  const resumeWords = countWords(resumeText);
  const jobWords = countWords(jobText);

  const isResumeReady = resumeWords >= 80;
  const isJobReady = jobWords >= 60;
  const canAnalyze = isResumeReady && isJobReady && !isFileExtracting && !isScanning;

  // Access resume state from TalentLens if candidate previously used TalentLens (primitive selectors avoid infinite getSnapshot loops)
  const tlResumeText = useTalentLensStore((state) => state.resumeText);
  const tlResumeFileName = useTalentLensStore((state) => state.resumeFileName);
  const talentLensResume = useMemo(() => {
    return tlResumeText ? { text: tlResumeText, fileName: tlResumeFileName } : null;
  }, [tlResumeText, tlResumeFileName]);

  const getDisabledReason = () => {
    if (isFileExtracting) return 'Reading and validating uploaded file...';
    if (!isResumeReady && !isJobReady) {
      return `Resume needs 80+ words (currently ${resumeWords}) · Job description needs 60+ words (currently ${jobWords})`;
    }
    if (!isResumeReady) {
      return `Resume needs at least 80 words to evaluate (currently ${resumeWords} words)`;
    }
    if (!isJobReady) {
      return `Job description needs at least 60 words to extract requirements (currently ${jobWords} words)`;
    }
    return '';
  };

  return (
    <div className="space-y-8">
      {fileError && (
        <div className="max-w-4xl mx-auto p-4 rounded-[12px] bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">File Extraction Notice: </span>
            {fileError}
          </div>
        </div>
      )}

      {/* Target Tier & Experience Level Selectors */}
      <SegmentedSelectors
        targetTier={targetTier}
        experienceLevel={experienceLevel}
        onTargetTierChange={onTargetTierChange}
        onExperienceLevelChange={onExperienceLevelChange}
      />

      {/* Two Main Input Panels: Paste Option + TalentLens-Style File Dropzone Structure */}
      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Resume Input Dropzone & Text Area */}
        <FileDropzone
          type="resume"
          title="Your Resume"
          icon={<FileText className="w-5 h-5 text-primary shrink-0" />}
          text={resumeText}
          fileName={resumeFileName}
          pageCount={resumePageCount}
          wordCount={resumeWords}
          isReady={isResumeReady}
          minWords={80}
          placeholder="Paste your resume text here, or switch to Upload File to drop your PDF / DOCX above..."
          onFileUpload={(file) => onFileUpload(file, 'resume')}
          onClear={onClearResume}
          onTextChange={onResumeTextChange}
          talentLensResume={talentLensResume}
          onImportTalentLens={() => {
            if (talentLensResume) {
              if (onImportTalentLensResume) {
                onImportTalentLensResume(talentLensResume.text, talentLensResume.fileName);
              } else {
                onResumeTextChange(talentLensResume.text);
              }
            }
          }}
        />

        {/* Target Job Description Dropzone & Text Area */}
        <FileDropzone
          type="job"
          title="Target Job Description"
          icon={<Search className="w-5 h-5 text-primary shrink-0" />}
          text={jobText}
          fileName={jobFileName}
          pageCount={jobPageCount}
          wordCount={jobWords}
          isReady={isJobReady}
          minWords={60}
          placeholder="Paste the target job description or requirements here, or switch to Upload File..."
          onFileUpload={(file) => onFileUpload(file, 'job')}
          onClear={onClearJob}
          onTextChange={onJobTextChange}
        />
      </div>

      {/* Main Action Button / Loading State */}
      <div className="flex flex-col items-center justify-center pt-2 space-y-3 max-w-xl mx-auto">
        {isScanning ? (
          <div className="p-6 bg-surface rounded-[16px] border border-border shadow-sm w-full text-center space-y-3">
            <div className="flex items-center justify-center gap-2.5 text-text font-bold text-sm">
              <ScanLine className="w-5 h-5 animate-spin text-primary" />
              <span>Analyzing Match Dynamics</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((stagedStageIndex + 1) / stagedMessages.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-text-secondary font-mono animate-pulse">
              {stagedMessages[stagedStageIndex]}
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onAnalyze}
              disabled={!canAnalyze}
              className={`w-full sm:w-auto px-10 py-3.5 rounded-[12px] font-bold text-[16px] transition-all shadow-sm ${
                !canAnalyze
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:translate-y-0'
              }`}
            >
              Analyze Resume
            </button>

            {!canAnalyze && (
              <p className="text-xs text-amber-800 text-center font-medium bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                {getDisabledReason()}
              </p>
            )}

            {canAnalyze && (
              <p className="text-xs text-text-tertiary text-center">
                Deterministic token-boundary parsing · Verified citations · Zero hallucinations
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
