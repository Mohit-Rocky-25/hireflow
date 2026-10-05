// ============================================================
// HireFlow ATS Resume Roaster — Input Screen Component (Stage 1)
// Clean segmented selectors, 16px+ typography, parsed badges
// ============================================================

import React from 'react';
import { FileText, Search, UploadCloud, X, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react';
import { countWords } from '../fileParser';
import { SegmentedSelectors, TargetTier, ExperienceLevel } from './SegmentedSelectors';

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
}) => {
  const resumeWords = countWords(resumeText);
  const jobWords = countWords(jobText);

  const isResumeReady = resumeWords >= 80;
  const isJobReady = jobWords >= 60;
  const canAnalyze = isResumeReady && isJobReady && !isFileExtracting && !isScanning;

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
        <div className="max-w-4xl mx-auto p-4 rounded-[12px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-800 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
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

      {/* Two Main Input Panels */}
      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Resume Input Panel */}
        <div className="bg-surface rounded-[16px] p-6 border border-border shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-5 h-5 text-text shrink-0" />
              <h2 className="text-[22px] sm:text-[24px] font-extrabold text-text truncate">
                Your Resume
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {resumeText && (
                <button
                  type="button"
                  onClick={onClearResume}
                  className="px-2.5 py-1 text-xs font-semibold text-text-tertiary hover:text-red-500 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear resume"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-text hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[8px] text-xs font-bold transition-all border border-border/70 shadow-2xs">
                <UploadCloud className="w-4 h-4" /> Upload File
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onFileUpload(e.target.files[0], 'resume');
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {resumeFileName && (
            <div className="mb-3 px-3 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 border border-border/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate text-text font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-text truncate max-w-[180px] sm:max-w-[240px]">
                  {resumeFileName}
                </span>
              </div>
              <span className="text-text-tertiary font-mono shrink-0 ml-2">
                Parsed: {resumePageCount || 1} {resumePageCount === 1 ? 'page' : 'pages'} · {resumeWords} words
              </span>
            </div>
          )}

          <textarea
            value={resumeText}
            onChange={(e) => onResumeTextChange(e.target.value)}
            placeholder="Paste your resume text here, or upload PDF / DOCX above..."
            className="flex-1 w-full bg-surface-hover/70 border border-border rounded-[10px] p-4 text-[16px] font-sans leading-relaxed focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 outline-none resize-none transition-colors"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
            <span className={`font-mono font-medium ${isResumeReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-tertiary'}`}>
              {resumeWords} words
            </span>
            <span className={!isResumeReady ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
              {isResumeReady ? '✓ Ready for parsing' : 'Minimum 80 words required'}
            </span>
          </div>
        </div>

        {/* Job Description Input Panel */}
        <div className="bg-surface rounded-[16px] p-6 border border-border shadow-xs flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="w-5 h-5 text-text shrink-0" />
              <h2 className="text-[22px] sm:text-[24px] font-extrabold text-text truncate">
                Target Job Description
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {jobText && (
                <button
                  type="button"
                  onClick={onClearJob}
                  className="px-2.5 py-1 text-xs font-semibold text-text-tertiary hover:text-red-500 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  title="Clear job description"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-text hover:bg-slate-200 dark:hover:bg-slate-700 rounded-[8px] text-xs font-bold transition-all border border-border/70 shadow-2xs">
                <UploadCloud className="w-4 h-4" /> Upload File
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onFileUpload(e.target.files[0], 'job');
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {jobFileName && (
            <div className="mb-3 px-3 py-1.5 rounded-[8px] bg-slate-100 dark:bg-slate-800 border border-border/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate text-text font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-text truncate max-w-[180px] sm:max-w-[240px]">
                  {jobFileName}
                </span>
              </div>
              <span className="text-text-tertiary font-mono shrink-0 ml-2">
                Parsed: {jobPageCount || 1} {jobPageCount === 1 ? 'page' : 'pages'} · {jobWords} words
              </span>
            </div>
          )}

          <textarea
            value={jobText}
            onChange={(e) => onJobTextChange(e.target.value)}
            placeholder="Paste the target job description or requirements here..."
            className="flex-1 w-full bg-surface-hover/70 border border-border rounded-[10px] p-4 text-[16px] font-sans leading-relaxed focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 outline-none resize-none transition-colors"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
            <span className={`font-mono font-medium ${isJobReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-tertiary'}`}>
              {jobWords} words
            </span>
            <span className={!isJobReady ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
              {isJobReady ? '✓ Requirements detectable' : 'Minimum 60 words required'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Action Button / Loading State */}
      <div className="flex flex-col items-center justify-center pt-2 space-y-3 max-w-xl mx-auto">
        {isScanning ? (
          <div className="p-6 bg-surface rounded-[16px] border border-border shadow-sm w-full text-center space-y-3">
            <div className="flex items-center justify-center gap-2.5 text-text font-bold text-sm">
              <ScanLine className="w-5 h-5 animate-spin" />
              <span>Analyzing Match Dynamics</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-slate-900 dark:bg-slate-100 h-full transition-all duration-300 rounded-full"
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
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white hover:-translate-y-0.5 hover:shadow-md cursor-pointer active:translate-y-0'
              }`}
            >
              Analyze Resume
            </button>

            {!canAnalyze && (
              <p className="text-xs text-amber-700 dark:text-amber-400 text-center font-medium bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md border border-amber-200 dark:border-amber-900/40">
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
