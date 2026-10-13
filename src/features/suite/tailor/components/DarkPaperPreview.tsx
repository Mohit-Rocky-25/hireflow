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
  Printer
} from 'lucide-react';
import { TailoredResume, CandidateProfile, TailoredSection } from '../../../../lib/tailor/types';
import { evaluateLayoutHeight } from '../../../../lib/tailor/export/layoutSentinel';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { triggerPrintToPdf } from '../../../../lib/tailor/export/pdfExporter';

interface DarkPaperPreviewProps {
  resume: TailoredResume;
  candidate: CandidateProfile;
  className?: string;
}

export function DarkPaperPreview({ resume, candidate, className = '' }: DarkPaperPreviewProps) {
  const [zoom, setZoom] = useState<number>(100);
  const { autoFitOnePage } = useTailorStore();

  const settings = resume.layoutSettings;
  const heightReport = evaluateLayoutHeight(resume);

  // Density classes based on layout settings
  const fontSizes: Record<'compact' | 'standard' | 'spacious', string> = {
    compact: 'text-[9pt] leading-[12.5pt]',
    standard: 'text-[9.5pt] leading-[13.5pt]',
    spacious: 'text-[10pt] leading-[14.5pt]'
  };

  const marginPaddings: Record<'tight' | 'standard' | 'relaxed', string> = {
    tight: 'p-7 sm:p-9',
    standard: 'p-9 sm:p-11',
    relaxed: 'p-11 sm:p-13'
  };

  const template = settings.template;

  return (
    <div className={`flex flex-col h-full bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm ${className}`}>
      {/* ── Studio Top Toolbar ── */}
      <div className="bg-neutral-950/80 border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Live Paper Canvas
          </span>

          {/* 1-Page Height Sentinel Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                heightReport.densityStatus === 'page_overflow'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
              }`}
            >
              {heightReport.densityStatus === 'page_overflow' ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              <span>
                {heightReport.estimatedPages === 1 ? '1 Page • Optimal Fit' : `${heightReport.estimatedPages} Pages • Spillover`}
              </span>
            </span>

            {heightReport.hasSpillRisk && (
              <button
                onClick={autoFitOnePage}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition"
                title="Automatically compress spacing to fit on 1 page"
              >
                <Zap className="w-2.5 h-2.5" />
                <span>Auto-Fit 1P</span>
              </button>
            )}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setZoom(Math.max(60, zoom - 10))}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-neutral-300 min-w-[36px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(130, zoom + 10))}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            title="Reset to 100%"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Scrollable Document Sheet ── */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-neutral-950/90">
        <div
          id="printable-resume"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: settings.paperSize === 'letter' ? '8.5in' : '210mm',
            minHeight: settings.paperSize === 'letter' ? '11in' : '297mm'
          }}
          className={`bg-white text-slate-900 shadow-2xl rounded-xs border border-slate-300/80 transition-transform duration-100 ${
            marginPaddings[settings.margins]
          } ${fontSizes[settings.fontSize]} ${
            template === 'classic' ? 'font-serif' : 'font-sans'
          }`}
        >
          {/* Candidate Header */}
          <header className={`mb-3.5 ${template === 'modern' ? 'border-b-2 border-slate-900 pb-2.5' : 'text-center border-b border-slate-300 pb-2'}`}>
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

          {/* Sections with Bold Subheadings */}
          <div className="space-y-3">
            {resume.sections.map((section: TailoredSection) => {
              if (!section.visible) return null;

              return (
                <section key={section.id} className="space-y-1">
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
                    <p className="text-slate-800 leading-relaxed text-[8.5pt] pt-0.5">
                      {section.content.summaryText}
                    </p>
                  )}

                  {/* Skills Section */}
                  {section.content.skillsByCategory && (
                    <div className="space-y-0.5 text-[8.5pt] pt-0.5">
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
                    <div className="space-y-2 pt-0.5">
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
                            <ul className="list-disc list-outside ml-4 space-y-0.5 text-[8.5pt] text-slate-800 leading-snug">
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
        </div>
      </div>
    </div>
  );
}
