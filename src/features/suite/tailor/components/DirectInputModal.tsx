// ============================================================
// HIREFLOW DIRECT INPUT MODAL
// Paste or upload resume and job description directly without rigid wizard steps
// ============================================================

import React, { useState } from 'react';
import { X, UploadCloud, Briefcase, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';

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

  if (!isOpen) return null;

  const handleApply = () => {
    setIsProcessing(true);
    if (resumeText.trim()) {
      uploadResumeText(resumeText, 'Custom_Candidate_Resume.txt');
    }
    if (jobText.trim()) {
      setJobDescriptionText(jobText);
    }
    runAnalysisAndMatching();
    generateTailoredResumeDraft();
    setIsProcessing(false);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Input Resume &amp; Job Description</h2>
              <p className="text-xs text-neutral-400">Paste or edit raw texts to re-align your resume tailoring</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
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
            Candidate Resume
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
            Target Job Description
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'resume' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Paste raw resume text or load from file (.txt, .md):</span>
                <label className="cursor-pointer text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Text File</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={14}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                placeholder="Paste your raw resume text here..."
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-neutral-400">
                Paste the target Job Description (role title, requirements, qualifications):
              </div>
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={14}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
                placeholder="Paste the target Job Description here..."
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Factual integrity guard enabled &bull; Zero metric distortion
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Update &amp; Re-Analyze</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
