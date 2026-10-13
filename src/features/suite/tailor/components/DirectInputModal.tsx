// ============================================================
// HIREFLOW DIRECT INPUT MODAL (MULTI-FORMAT FILE ENGINE)
// Supports PDF, DOCX, TXT, MD, and JSON resume & JD file uploads
// with drag-and-drop and instant text extraction
// ============================================================

import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Briefcase,
  FileText,
  CheckCircle2,
  Sparkles,
  FileCode,
  File,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { extractTextFromFile } from '../../../../lib/ats/fileExtractor';

interface DirectInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DirectInputModal({ isOpen, onClose }: DirectInputModalProps) {
  const {
    activeProject,
    uploadResumeText,
    setJobDescriptionText,
    runAnalysisAndMatching,
    generateTailoredResumeDraft
  } = useTailorStore();

  const [resumeText, setResumeText] = useState(activeProject.candidate.rawText || '');
  const [jobText, setJobText] = useState(activeProject.job.rawText || '');
  const [activeTab, setActiveTab] = useState<'resume' | 'job'>('resume');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    setIsProcessing(true);
    if (resumeText.trim()) {
      uploadResumeText(resumeText, uploadedFileName || 'Candidate_Resume.txt');
    }
    if (jobText.trim()) {
      setJobDescriptionText(jobText);
    }
    runAnalysisAndMatching();
    generateTailoredResumeDraft();
    setIsProcessing(false);
    onClose();
  };

  const processFile = async (file: File, target: 'resume' | 'job') => {
    setIsExtracting(true);
    setUploadedFileName(file.name);
    try {
      const extracted = await extractTextFromFile(file);
      if (target === 'resume') {
        setResumeText(extracted);
      } else {
        setJobText(extracted);
      }
    } catch (err) {
      console.error('File extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'resume' | 'job') => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, target);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, target: 'resume' | 'job') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, target);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Upload &amp; Direct Data Hub</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  PDF &bull; DOCX &bull; TXT &bull; MD &bull; JSON
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Upload or paste your resume and target job description with instant local parsing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 px-6 pt-3 gap-2 bg-neutral-900">
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'resume'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Candidate Resume</span>
            {uploadedFileName && activeTab === 'resume' && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                Loaded
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'job'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Target Job Description</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'resume' ? (
            <div className="space-y-3">
              {/* Drag and Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'resume')}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition flex flex-col items-center justify-center gap-2 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                }`}
              >
                {isExtracting ? (
                  <div className="flex items-center gap-2 text-xs text-blue-400 py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Extracting text from {uploadedFileName}...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-neutral-400" />
                    <div className="text-xs text-neutral-300">
                      <span className="font-bold text-white">Drag &amp; drop your resume</span> or{' '}
                      <label className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer underline underline-offset-2">
                        browse files
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.txt,.md,.json"
                          onChange={(e) => handleFileInputChange(e, 'resume')}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Supports PDF, DOCX (Word), TXT, Markdown (.md), and JSON formats
                    </div>
                  </>
                )}
              </div>

              {/* Status banner if file uploaded */}
              {uploadedFileName && !isExtracting && (
                <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Extracted from <strong className="text-white">{uploadedFileName}</strong> ({resumeText.length} characters)
                  </span>
                  <button
                    onClick={() => setUploadedFileName(null)}
                    className="text-[11px] text-neutral-400 hover:text-white"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Textarea for direct inspection & edits */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Resume Text Content:</span>
                  <span>{resumeText.split('\n').filter(Boolean).length} lines</span>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition resize-none leading-relaxed"
                  placeholder="Paste or inspect your resume text..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Optional JD File Drag and Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'job')}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40'
                }`}
              >
                <div className="text-xs text-neutral-300">
                  <span>Drop target job description document or </span>
                  <label className="text-blue-400 hover:text-blue-300 font-bold cursor-pointer underline">
                    browse
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      onChange={(e) => handleFileInputChange(e, 'job')}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[10px] text-neutral-500">
                  Accepts PDF, Word (.docx), or plain text JD specifications
                </span>
              </div>

              {/* JD Text Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Job Description Text (Title, requirements, qualifications):</span>
                  <span>{jobText.length} characters</span>
                </div>
                <textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  rows={10}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition resize-none leading-relaxed"
                  placeholder="Paste target Job Description here..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Local browser processing &bull; Zero external upload leakage
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Update &amp; Synchronize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
