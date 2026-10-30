// ============================================================
// HIREFLOW DARK STUDIO PAPER PREVIEW
// Crisp white document canvas rendered within an aesthetic dark studio container
// Includes real-time 1-page overflow sentinel & interactive zoom
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [zoom, setZoom] = useState<number>(100);
  const [fitZoom, setFitZoom] = useState<number>(55);
  const [downloading, setDownloading] = useState<boolean>(false);
  const { autoFitOnePage, setLayoutSetting } = useTailorStore();

  const settings = resume.layoutSettings;
  const paperSize = settings.paperSize || 'a4';
  const heightReport = evaluateLayoutHeight(resume);

  // Dynamically compute fitZoom so entire A4 sheet is 100% visible with ZERO scrolling
  const updateFitZoom = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const pagePxWidth = paperSize === 'letter' ? 816 : 794;
    const pagePxHeight = paperSize === 'letter' ? 1056 : 1123;

    // Available space inside the studio container with generous padding
    const availableWidth = Math.max(200, containerWidth - 32);
    const availableHeight = Math.max(250, containerHeight - 32);

    const zoomW = (availableWidth / pagePxWidth) * 100;
    const zoomH = (availableHeight / pagePxHeight) * 100;

    // Constrain to fit within both dimensions so it NEVER scrolls or overflows
    const computed = Math.min(100, Math.max(35, Math.floor(Math.min(zoomW, zoomH))));
    setFitZoom(computed);
  }, [paperSize]);

  useEffect(() => {
    updateFitZoom();
    window.addEventListener('resize', updateFitZoom);
    return () => window.removeEventListener('resize', updateFitZoom);
  }, [updateFitZoom]);

  const effectiveZoom = zoomMode === 'fit' ? fitZoom : zoom;

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
  const pageWidth = paperSize === 'letter' ? '8.5in' : '210mm';
  const pageHeight = paperSize === 'letter' ? '11in' : '297mm';

  return (
    <div className={`flex flex-col h-full bg-surface border border-charcoal rounded overflow-hidden shadow-2xl ${className}`}>
      {/* ── Studio Top Toolbar ── */}
      <div className="bg-black border-b border-charcoal px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs text-neutral-300">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-volt" />
          <span className="font-mono font-bold text-white uppercase tracking-wider text-[11px]">
            Live Paper Canvas
          </span>

          {/* Paper Size Selector (A4 standard) */}
          <div className="flex items-center bg-surface p-0.5 rounded border border-charcoal">
            <button
              type="button"
              onClick={() => setLayoutSetting('paperSize', 'a4')}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition cursor-pointer ${
                paperSize === 'a4'
                  ? 'bg-volt text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Standard International A4 (210mm x 297mm)"
            >
              A4
            </button>
            <button
              type="button"
              onClick={() => setLayoutSetting('paperSize', 'letter')}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition cursor-pointer ${
                paperSize === 'letter'
                  ? 'bg-volt text-black shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="US Letter (8.5in x 11in)"
            >
              Letter
            </button>
          </div>

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

          {/* Zoom and Fit View Controls */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded border border-charcoal">
            <button
              type="button"
              onClick={() => {
                setZoomMode('fit');
                updateFitZoom();
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                zoomMode === 'fit' ? 'bg-volt text-black' : 'text-neutral-400 hover:text-white'
              }`}
              title="Fit entire 1-page sheet to screen with zero scrolling"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomMode('manual');
                setZoom(100);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                zoomMode === 'manual' && zoom === 100 ? 'bg-volt text-black' : 'text-neutral-400 hover:text-white'
              }`}
              title="Actual 100% Print Size"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomMode('manual');
                setZoom(Math.max(40, effectiveZoom - 10));
              }}
              className="p-1 rounded hover:bg-surface-elevated text-neutral-400 hover:text-volt transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-neutral-300 min-w-[34px] text-center">
              {Math.round(effectiveZoom)}%
            </span>
            <button
              type="button"
              onClick={() => {
                setZoomMode('manual');
                setZoom(Math.min(140, effectiveZoom + 10));
              }}
              className="p-1 rounded hover:bg-surface-elevated text-neutral-400 hover:text-volt transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Fixed-Dimension Paper Sheet Canvas ── */}
      <div
        ref={containerRef}
        className={`flex-1 ${
          zoomMode === 'fit' ? 'overflow-hidden' : 'overflow-auto'
        } p-3 sm:p-5 flex justify-center items-center bg-black/95 select-none transition-all`}
      >
        <div
          style={{
            width: `calc(${pageWidth} * ${effectiveZoom / 100})`,
            height: `calc(${pageHeight} * ${effectiveZoom / 100})`,
            overflow: 'hidden',
          }}
          className="shrink-0 shadow-2xl rounded-xs transition-all duration-150 relative bg-white border border-slate-400/50"
        >
          <div
            id="printable-resume"
            style={{
              width: pageWidth,
              height: pageHeight,
              maxHeight: pageHeight,
              transform: `scale(${effectiveZoom / 100})`,
              transformOrigin: 'top left',
              overflow: 'hidden',
            }}
            className={`bg-white text-slate-900 border border-slate-300/80 transition-all duration-150 select-text ${
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
  </div>
);
}
