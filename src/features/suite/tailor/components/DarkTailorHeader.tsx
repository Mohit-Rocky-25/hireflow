// ============================================================
// HIREFLOW DARK RESUME TAILOR HEADER
// Sleek dark UI header with multi-format download suite (DOCX, PDF, TXT, MD, JSON)
// and quick profile presets
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
  CheckCircle2,
  ChevronDown,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { CompanyLogo } from '../../../../components/common/CompanyLogo';
import { downloadResumeAsDocx } from '../../../../lib/tailor/export/docxExporter';
import {
  triggerPrintToPdf,
  generatePlainTextResume,
  downloadResumeAsPdf,
  downloadResumeAsTxt,
  downloadResumeAsMarkdown,
  downloadResumeAsJson
} from '../../../../lib/tailor/export/pdfExporter';

import { MakeItBetterResult } from '../../../../lib/tailor/engine/makeItBetterEngine';

interface DarkTailorHeaderProps {
  onOpenInputModal: () => void;
  onOpenMakeItBetterModal: () => void;
  onMakeItBetterResult: (result: MakeItBetterResult | null) => void;
}

export function DarkTailorHeader({
  onOpenInputModal,
  onOpenMakeItBetterModal,
  onMakeItBetterResult
}: DarkTailorHeaderProps) {
  const {
    activeProject,
    loadPresetFixture,
    applyMakeItBetter
  } = useTailorStore();

  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [elevating, setElevating] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;

  const showToast = (msg: string) => {
    setDownloadToast(msg);
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const handleCopyText = () => {
    if (!resume) return;
    const text = generatePlainTextResume(resume, candidate);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied plain text to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = async () => {
    if (!resume) return;
    setDownloadingDocx(true);
    try {
      await downloadResumeAsDocx(resume, candidate);
      showToast('Downloaded .DOCX (Word)');
    } catch (e) {
      console.error('Failed to download docx:', e);
    } finally {
      setDownloadingDocx(false);
      setDownloadMenuOpen(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!resume) return;
    setDownloadingPdf(true);
    try {
      await downloadResumeAsPdf(resume, candidate);
      showToast('Downloaded .PDF (Vector Document)');
    } catch (e) {
      console.error('Failed to download pdf:', e);
      triggerPrintToPdf();
    } finally {
      setDownloadingPdf(false);
      setDownloadMenuOpen(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!resume) return;
    downloadResumeAsTxt(resume, candidate);
    showToast('Downloaded .TXT resume');
    setDownloadMenuOpen(false);
  };

  const handleDownloadMarkdown = () => {
    if (!resume) return;
    downloadResumeAsMarkdown(resume, candidate);
    showToast('Downloaded .MD resume');
    setDownloadMenuOpen(false);
  };

  const handleDownloadJson = () => {
    if (!resume) return;
    downloadResumeAsJson(resume, candidate);
    showToast('Downloaded .JSON backup');
    setDownloadMenuOpen(false);
  };

  const handleTriggerMakeItBetter = () => {
    setElevating(true);
    const result = applyMakeItBetter();
    onMakeItBetterResult(result);
    setTimeout(() => {
      setElevating(false);
      onOpenMakeItBetterModal();
    }, 400);
  };

  return (
    <header className="bg-black/95 border-b border-charcoal backdrop-blur-md sticky top-0 z-40 text-neutral-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Home & Back Buttons + Brand Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="w-9 h-9 rounded bg-near-black hover:bg-hover-gray border border-charcoal flex items-center justify-center text-silver hover:text-white transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt"
                aria-label="Go to Home"
                title="Go to Home"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-5a1 1 0 0 1-1-1v-4.5h-3V20a1 1 0 0 1-1 1.5h-5A1.5 1.5 0 0 1 3 20z" />
                </svg>
              </Link>

              <Link
                to="/tools"
                className="w-9 h-9 rounded bg-near-black hover:bg-hover-gray border border-charcoal flex items-center justify-center text-silver hover:text-white transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt font-mono text-sm leading-none"
                title="Back to Suite Tools"
                aria-label="Go back"
              >
                ←
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded bg-volt text-black flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white uppercase font-mono">
                    HIRE<span className="text-volt">FLO</span> RESUME STUDIO
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-volt/10 text-volt border border-volt/30">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Truth Locked
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 truncate max-w-xs sm:max-w-md flex items-center gap-1.5 flex-wrap">
                  <span>{candidate.fullName} &bull; Tailoring for <span className="text-neutral-200 font-medium">{activeProject.job.title}</span> at</span>
                  <span className="inline-flex items-center gap-1 text-neutral-200 font-medium">
                    <CompanyLogo company={activeProject.job.company} size="xs" showBorder={false} interactive={false} />
                    <span>{activeProject.job.company}</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Center / Right: Quick Presets */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-charcoal text-xs text-neutral-400">
            <span className="text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider pr-1">
              Presets:
            </span>
            <button
              onClick={() => loadPresetFixture('fresher')}
              className="px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-volt hover:bg-surface-elevated transition"
              title="Load Fresher Software Engineer Profile (Jeswanth Kumar)"
            >
              🎓 College Fresher
            </button>
            <button
              onClick={() => loadPresetFixture('security')}
              className="px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-volt hover:bg-surface-elevated transition"
              title="Load Senior Cybersecurity Engineer Profile (Alex Morgan)"
            >
              🛡️ Security Lead
            </button>
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2 flex-wrap relative">
            {/* Input Data Button */}
            <button
              onClick={onOpenInputModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-elevated border border-charcoal text-xs font-mono uppercase tracking-wider text-neutral-200 transition shadow-xs"
              title="Upload or paste custom Resume & Job Description"
            >
              <UploadCloud className="w-3.5 h-3.5 text-volt" />
              <span>Upload / Input</span>
            </button>

            {/* "Make It Better" Primary Action */}
            <button
              onClick={handleTriggerMakeItBetter}
              disabled={elevating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-volt hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] text-black text-xs font-mono font-bold uppercase tracking-wider transition hover:-translate-y-0.5 active:translate-y-0"
              title="Upgrade to Top 1% Industry Standards (Google XYZ, Power Verbs, 1-Page Fit)"
            >
              <Zap className={`w-3.5 h-3.5 text-black ${elevating ? 'animate-spin' : ''}`} />
              <span>Make It Better</span>
            </button>

            {/* Download Hub Dropdown & Quick Actions */}
            <div className="relative">
              <div className="flex items-center gap-1 bg-surface p-1 rounded border border-charcoal">
                <button
                  onClick={handleDownloadDocx}
                  disabled={downloadingDocx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider text-neutral-200 hover:text-volt hover:bg-surface-elevated transition disabled:opacity-50"
                  title="Download genuine Microsoft Word .DOCX binary"
                >
                  <Download className="w-3.5 h-3.5 text-volt" />
                  <span className="hidden sm:inline">DOCX</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider text-neutral-200 hover:text-volt hover:bg-surface-elevated transition disabled:opacity-50"
                  title="Download genuine vector PDF directly generated in memory"
                >
                  <Printer className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="hidden sm:inline">{downloadingPdf ? 'PDF...' : 'PDF'}</span>
                </button>

                <button
                  onClick={() => setDownloadMenuOpen(!downloadMenuOpen)}
                  className="p-1 rounded text-neutral-400 hover:text-volt hover:bg-surface-elevated transition"
                  title="More download formats (TXT, MD, JSON)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleCopyText}
                  className="p-1.5 rounded text-neutral-400 hover:text-volt hover:bg-surface-elevated transition"
                  title="Copy Clean ATS Plain Text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-volt" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Multi-Format Download Dropdown Menu */}
              {downloadMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-black border border-charcoal rounded shadow-2xl z-50 p-1.5 space-y-1 animate-fade-in text-xs">
                  <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider border-b border-charcoal">
                    Export Resume As
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-elevated text-neutral-200 hover:text-volt flex items-center gap-2 transition font-mono"
                  >
                    <Download className="w-3.5 h-3.5 text-volt" />
                    <span>Vector PDF (.pdf)</span>
                  </button>
                  <button
                    onClick={handleDownloadDocx}
                    disabled={downloadingDocx}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-elevated text-neutral-200 hover:text-volt flex items-center gap-2 transition font-mono"
                  >
                    <Download className="w-3.5 h-3.5 text-volt" />
                    <span>Microsoft Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerPrintToPdf();
                      setDownloadMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-elevated text-neutral-200 hover:text-volt flex items-center gap-2 transition font-mono"
                  >
                    <Printer className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Browser Print Dialog</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-elevated text-neutral-200 hover:text-volt flex items-center gap-2 transition font-mono"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Plain Text (.txt)</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-elevated text-neutral-200 hover:text-volt flex items-center gap-2 transition font-mono"
                  >
                    <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Markdown (.md)</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-surface-elevated text-neutral-200 hover:text-volt flex items-center gap-2 transition font-mono"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Structured Data (.json)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Download Toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black border border-volt/40 text-volt px-4 py-2 rounded shadow-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-volt" />
          <span>{downloadToast}</span>
        </div>
      )}
    </header>
  );
}
