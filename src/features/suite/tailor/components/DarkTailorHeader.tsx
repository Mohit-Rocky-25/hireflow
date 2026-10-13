// ============================================================
// HIREFLOW DARK RESUME TAILOR HEADER
// Sleek dark UI header aligned with Career Trajectory and Landing Page aesthetics
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Briefcase,
  Download,
  Printer,
  Copy,
  Check,
  UploadCloud,
  ChevronLeft,
  Zap,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { downloadResumeAsDocx } from '../../../../lib/tailor/export/docxExporter';
import { triggerPrintToPdf, generatePlainTextResume } from '../../../../lib/tailor/export/pdfExporter';

interface DarkTailorHeaderProps {
  onOpenInputModal: () => void;
  onOpenMakeItBetterModal: () => void;
}

export function DarkTailorHeader({
  onOpenInputModal,
  onOpenMakeItBetterModal
}: DarkTailorHeaderProps) {
  const {
    activeProject,
    loadPresetFixture,
    applyMakeItBetter
  } = useTailorStore();

  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [elevating, setElevating] = useState(false);

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;

  const handleCopyText = () => {
    if (!resume) return;
    const text = generatePlainTextResume(resume, candidate);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    if (!resume) return;
    setDownloadingDocx(true);
    try {
      await downloadResumeAsDocx(resume, candidate);
    } catch (e) {
      console.error('Failed to download docx:', e);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleTriggerMakeItBetter = () => {
    setElevating(true);
    applyMakeItBetter();
    setTimeout(() => {
      setElevating(false);
      onOpenMakeItBetterModal();
    }, 400);
  };

  return (
    <header className="bg-neutral-950/95 border-b border-neutral-800 backdrop-blur-md sticky top-0 z-40 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back Link + Brand Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Back to Suite Tools"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    HireFlow Resume Studio
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Truth Locked
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md">
                  {candidate.fullName} &bull; Tailoring for <span className="text-neutral-200 font-medium">{activeProject.job.title}</span> at <span className="text-neutral-200 font-medium">{activeProject.job.company}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Center / Right: Quick Presets */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-400">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider pr-1">
              Presets:
            </span>
            <button
              onClick={() => loadPresetFixture('fresher')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
              title="Load Fresher Software Engineer Profile (Jeswanth Kumar)"
            >
              🎓 College Fresher
            </button>
            <button
              onClick={() => loadPresetFixture('security')}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
              title="Load Senior Cybersecurity Engineer Profile (Alex Morgan)"
            >
              🛡️ Security Lead
            </button>
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Input Data Button */}
            <button
              onClick={onOpenInputModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-semibold text-neutral-200 transition shadow-xs"
              title="Paste or upload custom Resume & Job Description"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Resume &amp; JD</span>
            </button>

            {/* "Make It Better" Primary Action */}
            <button
              onClick={handleTriggerMakeItBetter}
              disabled={elevating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition hover:-translate-y-0.5 active:translate-y-0"
              title="Upgrade to Top 1% Industry Standards (Google XYZ, Power Verbs, 1-Page Fit)"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-300 ${elevating ? 'animate-spin' : ''}`} />
              <span>Make It Better</span>
            </button>

            {/* Export Actions */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={handleDownloadDocx}
                disabled={downloadingDocx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition disabled:opacity-50"
                title="Download genuine Microsoft Word .DOCX binary"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">DOCX</span>
              </button>

              <button
                onClick={triggerPrintToPdf}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition"
                title="Print or Save as Vector PDF"
              >
                <Printer className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              <button
                onClick={handleCopyText}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                title="Copy Clean ATS Plain Text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
