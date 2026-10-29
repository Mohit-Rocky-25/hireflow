// ============================================================
// HireFlow — Scanned Resume Content Preview Modal
// Provides a transparent, high-contrast plain-English preview of
// the exact text extracted from an uploaded resume file (PDF/DOCX/TXT).
// Allows candidates to verify whether their actual resume was uploaded.
// ============================================================

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Eye,
  X,
  Copy,
  Check,
  Download,
  Search,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export interface ResumePreviewModalProps {
  resumeText: string;
  fileName?: string | null;
  triggerButtonText?: string;
  triggerClassName?: string;
  showSnippetBanner?: boolean;
}

function countWords(str: string): number {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function calculateReadingMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}

export function ResumePreviewModal({
  resumeText,
  fileName,
  triggerButtonText,
  triggerClassName,
  showSnippetBanner = false,
}: ResumePreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(() => countWords(resumeText), [resumeText]);
  const readingTime = useMemo(() => calculateReadingMinutes(wordCount), [wordCount]);

  const displayFileName = fileName?.trim() || 'Active Resume';
  const isTooShort = wordCount > 0 && wordCount < 80;
  const isHealthy = wordCount >= 80;

  const handleCopy = () => {
    if (!resumeText) return;
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!resumeText) return;
    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${displayFileName.replace(/\.[^/.]+$/, '')}-extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlightedLines = useMemo(() => {
    if (!resumeText) return [];
    return resumeText.split('\n');
  }, [resumeText]);

  const matchesSearch = (line: string) => {
    if (!searchQuery.trim()) return false;
    return line.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <>
      {/* Trigger Button or Banner */}
      {showSnippetBanner ? (
        <div className="p-3.5 sm:p-4 rounded-lg bg-black border border-charcoal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt shrink-0">
              <FileText className="w-4 h-4 stroke-[1.5px]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-white truncate max-w-[260px] sm:max-w-[360px]">
                  {displayFileName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-near-black border border-charcoal text-silver">
                  {wordCount} words
                </span>
              </div>
              <p className="text-[11px] text-silver mt-0.5">
                Extracted resume text used for this scan. Verify your file contents below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 rounded bg-near-black hover:bg-hover-gray border border-charcoal hover:border-volt text-xs font-mono font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-volt" />
            <span>Preview Extracted Text</span>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            triggerClassName ||
            'h-10 px-3.5 border border-charcoal rounded text-xs font-mono bg-black text-white hover:text-volt hover:border-volt flex items-center gap-2 transition-colors cursor-pointer'
          }
          title="Inspect the exact plain-English text extracted from your resume"
        >
          <FileText className="w-3.5 h-3.5 text-volt" />
          <span>{triggerButtonText || 'Preview Extracted Resume'}</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#121212] border border-charcoal rounded-xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-charcoal flex items-start justify-between gap-4 bg-near-black">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5 text-volt stroke-[1.5px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Scanned Resume Text Preview
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-black border border-volt/40 text-volt">
                      {displayFileName}
                    </span>
                  </div>
                  <p className="text-xs text-silver mt-0.5">
                    This is the exact plain-English text extracted from your file and evaluated by the engine.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded bg-black hover:bg-hover-gray border border-charcoal flex items-center justify-center text-silver hover:text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Bar & In-Resume Search */}
            <div className="px-4 sm:px-5 py-3 border-b border-charcoal bg-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-silver font-mono text-[11px] flex-wrap">
                <span className="flex items-center gap-1">
                  {isHealthy ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-volt" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-danger" />
                  )}
                  <strong className="text-white">{wordCount}</strong> words extracted
                </span>
                <span>·</span>
                <span>~{readingTime} min read</span>
                <span>·</span>
                <span className="text-volt">100% Client-Side Privacy (Zero Egress)</span>
              </div>

              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-silver absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search inside resume..."
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-near-black border border-charcoal text-xs text-white placeholder:text-silver/60 focus:outline-none focus:border-volt"
                />
              </div>
            </div>

            {/* Warning if Word Count is too low (e.g. unparsed scan or empty file) */}
            {isTooShort && (
              <div className="p-3 bg-danger/10 border-b border-danger/30 text-danger text-xs flex items-center gap-2 px-5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Notice:</strong> Very few words were extracted ({wordCount} words). If your resume was an image-based scan or flattened PDF, the ATS engine cannot read your text properly.
                </span>
              </div>
            )}

            {/* Resume Text Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#0a0a0a] text-xs sm:text-sm font-mono text-neutral-200 leading-relaxed selection:bg-volt selection:text-black space-y-1">
              {resumeText ? (
                highlightedLines.map((line, idx) => {
                  const isMatch = matchesSearch(line);
                  return (
                    <div
                      key={idx}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        isMatch
                          ? 'bg-volt/20 text-white font-bold border-l-2 border-volt'
                          : line.trim() === ''
                          ? 'h-3'
                          : 'hover:bg-near-black/50'
                      }`}
                    >
                      {line || '\u00A0'}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-silver">
                  <AlertTriangle className="w-8 h-8 text-danger mx-auto mb-2" />
                  <p className="font-bold text-white">No resume text detected</p>
                  <p className="text-xs text-silver mt-1">Please attach or paste a valid resume to inspect.</p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-3.5 sm:p-4 border-t border-charcoal bg-near-black flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-silver/80 text-[11px] font-mono">
                Verify this text to ensure you uploaded your correct resume.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded bg-black hover:bg-hover-gray border border-charcoal text-white hover:text-volt font-mono font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-volt" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded bg-black hover:bg-hover-gray border border-charcoal text-white hover:text-volt font-mono font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded bg-volt text-black hover:bg-white font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

