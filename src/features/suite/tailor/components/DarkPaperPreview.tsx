// ============================================================
// HIREFLOW DARK STUDIO PAPER PREVIEW
// Crisp white document canvas rendered within an aesthetic dark studio container
// Includes real-time 1-page overflow sentinel & interactive zoom
// ============================================================

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  FileText,
  Zap,
  CheckCircle2,
  Printer,
  Download
} from 'lucide-react';
import { TailoredResume, CandidateProfile, TailoredSection } from '../../../../lib/tailor/types';
import { evaluateLayoutHeight } from '../../../../lib/tailor/export/layoutSentinel';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { triggerPrintToPdf, downloadResumeAsPdf } from '../../../../lib/tailor/export/pdfExporter';

interface DarkPaperPreviewProps {
  resume: TailoredResume;
  candidate: CandidateProfile;
  className?: string;
}

export function DarkPaperPreview({ resume, candidate, className = '' }: DarkPaperPreviewProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [downloading, setDownloading] = useState<boolean>(false);
  const { autoFitOnePage } = useTailorStore();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadResumeAsPdf(resume, candidate);
    } catch {
      triggerPrintToPdf();
    } finally {
      setDownloading(false);
    }
  };

  const settings = resume.layoutSettings;
  const heightReport = evaluateLayoutHeight(resume);

  // Density classes based on layout settings
  const fontSizes: Record<'compact' | 'standard' | 'spacious', string> = {
    compact: 'text-[9pt] leading-[12.5pt]',
    standard: 'text-[9.5pt] leading-[13.5pt]',
    spacious: 'text-[10pt] leading-[14.5pt]'
  };

  const marginPaddings: Record<'tight' | 'standard' | 'relaxed', string> = {
    tight: 'p-6 sm:p-7',
    standard: 'p-8 sm:p-9',
    relaxed: 'p-10 sm:p-11'
  };

  const lineSpacings: Record<'dense' | 'standard' | 'loose', {
    sectionGap: string;
    entryGap: string;
    bulletGap: string;
    leading: string;
  }> = {
    dense: {
      sectionGap: 'space-y-1.5',
      entryGap: 'space-y-1',
      bulletGap: 'space-y-0.5',
      leading: 'leading-tight'
    },
    standard: {
      sectionGap: 'space-y-2.5',
      entryGap: 'space-y-1.5',
      bulletGap: 'space-y-1',
      leading: 'leading-snug'
    },
    loose: {
      sectionGap: 'space-y-3.5',
      entryGap: 'space-y-2',
      bulletGap: 'space-y-1.5',
      leading: 'leading-relaxed'
    }
  };

  const template = settings.template;
  const currentSpacing = lineSpacings[settings.lineSpacing || 'standard'];
  const pageWidth = settings.paperSize === 'letter' ? '8.5in' : '210mm';
  const pageHeight = settings.paperSize === 'letter' ? '11in' : '297mm';

  return (
    <div className={`flex flex-col h-full bg-surface border border-charcoal rounded overflow-hidden shadow-2xl ${className}`}>
      {/* ── Studio Top Toolbar ── */}
      <div className="bg-black border-b border-charcoal px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-volt" />
          <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px]">
            Live Paper Canvas
          </span>

          {/* 1-Page Height Sentinel Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${
                heightReport.densityStatus === 'page_overflow'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-volt/10 text-volt border border-volt/30'
              }`}
            >
              {heightReport.densityStatus === 'page_overflow' ? (
                <AlertTriangle className="w-3 h-3 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-3 h-3 text-volt" />
              )}
              <span>
                {heightReport.estimatedPages === 1 ? '1 Page • Optimal Fit' : `${heightReport.estimatedPages} Pages • Spillover`}
              </span>
            </span>

            {heightReport.hasSpillRisk && (
              <button
                onClick={autoFitOnePage}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-volt hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] text-black transition"
                title="Automatically compress spacing to fit on 1 page"
              >
                <Zap className="w-2.5 h-2.5 text-black" />
                <span>Auto-Fit 1P</span>
              </button>
            )}
          </div>
        </div>

        {/* Actions & Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider font-bold bg-volt hover:bg-volt-hover active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] text-black transition cursor-pointer shadow-xs disabled:opacity-50"
            title="Download Vector PDF directly generated in memory"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>{downloading ? 'Exporting...' : 'Export PDF'}</span>
          </button>

          <button
            type="button"
            onClick={triggerPrintToPdf}
            className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-neutral-400 hover:text-white border border-charcoal transition cursor-pointer"
            title="Browser Print Preview (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5 bg-surface p-1 rounded border border-charcoal">
            <button
              type="button"
              onClick={() => setZoom(Math.max(60, zoom - 10))}
              className="p-1 rounded hover:bg-surface-elevated text-neutral-400 hover:text-volt transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-neutral-300 min-w-[36px] text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(130, zoom + 10))}
              className="p-1 rounded hover:bg-surface-elevated text-neutral-400 hover:text-volt transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1 rounded hover:bg-surface-elevated text-neutral-400 hover:text-volt transition cursor-pointer"
              title="Reset to 100%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable Document Sheet ── */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-black">
        <div
          id="printable-resume"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: pageWidth,
            minHeight: pageHeight,
            maxHeight: heightReport.densityStatus === 'page_overflow' ? undefined : pageHeight,
          }}
          className={`bg-white text-slate-900 shadow-2xl rounded-xs border border-slate-300/80 transition-all duration-150 relative ${
            marginPaddings[settings.margins]
          } ${fontSizes[settings.fontSize]} ${
            template === 'classic' ? 'font-serif' : 'font-sans'
          }`}
        >
          {/* Candidate Header */}
          <header className={`mb-2.5 ${template === 'modern' ? 'border-b-2 border-slate-900 pb-2' : 'text-center border-b border-slate-300 pb-1.5'}`}>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight uppercase ${template === 'modern' ? 'text-slate-950' : 'text-black'}`}>
              {candidate.fullName || 'Candidate Name'}
            </h1>

            {/* Contact details */}
            <div className={`flex flex-wrap gap-x-3 gap-y-0.5 text-[8.5pt] text-slate-700 mt-1 ${template === 'modern' ? '' : 'justify-center'}`}>
              {candidate.contact?.location && <span>{candidate.contact.location}</span>}
              {candidate.contact?.phone && <span>&bull; {candidate.contact.phone}</span>}
              {candidate.contact?.email && <span>&bull; {candidate.contact.email}</span>}
              {candidate.contact?.linkedin && <span>&bull; {candidate.contact.linkedin.replace(/^https?:\/\//, '')}</span>}
              {candidate.contact?.github && <span>&bull; {candidate.contact.github.replace(/^https?:\/\//, '')}</span>}
            </div>
          </header>

          {/* Sections with Dynamic Layout Density */}
          <div className={currentSpacing.sectionGap}>
            {resume.sections.map((section: TailoredSection) => {
              if (!section.visible) return null;

              return (
                <section key={section.id} className="space-y-0.5">
                  {/* Bold Subheading */}
                  <h2
                    className={`font-black tracking-wider uppercase border-b pb-0.5 text-[9pt] ${
                      template === 'modern'
                        ? 'text-slate-900 border-slate-900'
                        : template === 'executive'
                        ? 'text-slate-950 border-slate-950'
                        : 'text-slate-800 border-slate-400'
                    }`}
                  >
                    {section.title}
                  </h2>

                  {/* Professional Summary */}
                  {section.content.summaryText && (
                    <p className={`text-slate-800 ${currentSpacing.leading} text-[8.5pt] pt-0.5`}>
                      {section.content.summaryText}
                    </p>
                  )}

                  {/* Skills Section */}
                  {section.content.skillsByCategory && (
                    <div className={`space-y-0.5 text-[8.5pt] pt-0.5 ${currentSpacing.leading}`}>
                      {Object.entries(section.content.skillsByCategory).map(([cat, rawSkills]) => {
                        const skills = rawSkills as string[];
                        if (!skills || skills.length === 0) return null;
                        return (
                          <div key={cat} className="flex flex-wrap gap-1 leading-tight">
                            <span className="font-bold text-slate-950">{cat}:</span>
                            <span className="text-slate-800">{skills.join(', ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Experience, Education & Projects */}
                  {section.content.entries && (
                    <div className={`${currentSpacing.entryGap} pt-0.5`}>
                      {section.content.entries.map((entry) => (
                        <div key={entry.id} className="space-y-0.5">
                          {/* Title & Organization Header */}
                          <div className="flex flex-wrap items-baseline justify-between gap-2 text-[8.5pt]">
                            <div>
                              <span className="font-extrabold text-slate-950">{entry.primaryTitle}</span>
                              {entry.secondaryTitle && (
                                <span className="text-slate-700 italic"> &mdash; {entry.secondaryTitle}</span>
                              )}
                            </div>
                            {entry.dateRange && (
                              <span className="font-bold text-slate-600 text-[8pt] shrink-0">
                                {entry.dateRange}
                              </span>
                            )}
                          </div>

                          {/* Bullets with Google XYZ Action Statements */}
                          {entry.bullets && entry.bullets.length > 0 && (
                            <ul className={`list-disc list-outside ml-4 ${currentSpacing.bulletGap} text-[8.5pt] text-slate-800 ${currentSpacing.leading}`}>
                              {entry.bullets.map((b) => (
                                <li key={b.id} className="pl-0.5">
                                  {b.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Visible Page Break / Spill Boundary Sentinel */}
          {heightReport.hasSpillRisk && (
            <div className="mt-4 pt-2 border-t-2 border-dashed border-amber-500/80 text-center select-none print:hidden">
              <span className="inline-block bg-amber-950 text-amber-300 border border-amber-500/60 px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold shadow-md">
                Page 1 Cutoff &bull; {heightReport.recommendations[0] || 'Content spills onto Page 2'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
