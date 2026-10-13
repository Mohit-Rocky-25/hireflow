// ============================================================
// HIREFLOW PAPER PREVIEW COMPONENT
// WYSIWYG realistic document preview supporting 4 templates & height sentinel
// ============================================================

import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { TailoredResume, CandidateProfile, TailoredSection } from '../../../../lib/tailor/types';
import { evaluateLayoutHeight } from '../../../../lib/tailor/export/layoutSentinel';

interface PaperPreviewProps {
  resume: TailoredResume;
  candidate: CandidateProfile;
  className?: string;
}

export function PaperPreview({ resume, candidate, className = '' }: PaperPreviewProps) {
  const [zoom, setZoom] = useState<number>(100);
  const settings = resume.layoutSettings;
  const heightReport = evaluateLayoutHeight(resume);

  // Styling maps based on settings
  const fontSizes: Record<'compact' | 'standard' | 'spacious', string> = {
    compact: 'text-[9.5pt] leading-[13pt]',
    standard: 'text-[10pt] leading-[14pt]',
    spacious: 'text-[10.5pt] leading-[15pt]'
  };

  const marginPaddings: Record<'tight' | 'standard' | 'relaxed', string> = {
    tight: 'p-8 sm:p-10',
    standard: 'p-10 sm:p-12',
    relaxed: 'p-12 sm:p-14'
  };

  const template = settings.template;

  return (
    <div className={`flex flex-col h-full bg-slate-200/70 rounded-2xl border border-slate-300 overflow-hidden ${className}`}>
      {/* Top Toolbar: Zoom & Page Sentinel Indicator */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            Live Paper Preview ({template})
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              heightReport.densityStatus === 'page_overflow'
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            ~{heightReport.estimatedPages} {heightReport.estimatedPages === 1 ? 'Page' : 'Pages'}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setZoom(Math.max(60, zoom - 10))}
            className="p-1 rounded hover:bg-white text-slate-600 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 text-slate-700 min-w-[36px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(140, zoom + 10))}
            className="p-1 rounded hover:bg-white text-slate-600 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1 rounded hover:bg-white text-slate-600 transition"
            title="Reset Zoom (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Overflow Warning Banner */}
      {heightReport.hasSpillRisk && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            {heightReport.recommendations[0]} Consider switching to <strong>Compact</strong> template or reducing margins.
          </span>
        </div>
      )}

      {/* Scrollable Preview Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          id="printable-resume"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            width: settings.paperSize === 'letter' ? '8.5in' : '210mm',
            minHeight: settings.paperSize === 'letter' ? '11in' : '297mm'
          }}
          className={`bg-white shadow-xl text-slate-900 border border-slate-200/80 transition-transform duration-100 ${
            marginPaddings[settings.margins]
          } ${fontSizes[settings.fontSize]} ${
            template === 'classic' ? 'font-serif' : 'font-sans'
          }`}
        >
          {/* Resume Header */}
          <header className={`mb-4 ${template === 'modern' ? 'border-b-2 border-indigo-600 pb-3' : 'text-center border-b border-slate-300 pb-2'}`}>
            <h1 className={`text-2xl font-bold tracking-tight uppercase ${template === 'modern' ? 'text-indigo-950' : 'text-black'}`}>
              {candidate.fullName}
            </h1>

            {/* Contact details */}
            <div className={`flex flex-wrap gap-x-3 gap-y-0.5 text-[9pt] text-slate-600 mt-1 ${template === 'modern' ? '' : 'justify-center'}`}>
              {candidate.contact.location && <span>{candidate.contact.location}</span>}
              {candidate.contact.phone && <span>&bull; {candidate.contact.phone}</span>}
              {candidate.contact.email && <span>&bull; {candidate.contact.email}</span>}
              {candidate.contact.linkedin && <span>&bull; {candidate.contact.linkedin.replace(/^https?:\/\//, '')}</span>}
              {candidate.contact.github && <span>&bull; {candidate.contact.github.replace(/^https?:\/\//, '')}</span>}
            </div>
          </header>

          {/* Sections */}
          <div className="space-y-3.5">
            {resume.sections.map((section: TailoredSection) => {
              if (!section.visible) return null;

              return (
                <section key={section.id} className="space-y-1">
                  {/* Section Title */}
                  <h2
                    className={`font-bold tracking-wider uppercase border-b pb-0.5 ${
                      template === 'modern'
                        ? 'text-xs text-indigo-900 border-indigo-200'
                        : template === 'executive'
                        ? 'text-xs text-slate-900 border-slate-900'
                        : 'text-xs text-slate-800 border-slate-300'
                    }`}
                  >
                    {section.title}
                  </h2>

                  {/* Summary Text */}
                  {section.content.summaryText && (
                    <p className="text-slate-800 leading-relaxed text-[9.5pt] pt-0.5">
                      {section.content.summaryText}
                    </p>
                  )}

                  {/* Categorized Skills */}
                  {section.content.skillsByCategory && (
                    <div className="space-y-0.5 text-[9.5pt] pt-0.5">
                      {Object.entries(section.content.skillsByCategory).map(([cat, rawSkills]) => {
                        const skills = rawSkills as string[];
                        if (!skills || skills.length === 0) return null;
                        return (
                          <div key={cat} className="flex flex-wrap gap-1 leading-snug">
                            <span className="font-bold text-slate-900">{cat}:</span>
                            <span className="text-slate-800">{skills.join(', ')}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Entries (Experience, Education, Projects) */}
                  {section.content.entries && (
                    <div className="space-y-2.5 pt-0.5">
                      {section.content.entries.map((entry) => (
                        <div key={entry.id} className="space-y-0.5">
                          {/* Entry Title & Metadata */}
                          <div className="flex flex-wrap items-baseline justify-between gap-2 text-[9.5pt]">
                            <div>
                              <span className="font-bold text-slate-900">{entry.primaryTitle}</span>
                              {entry.secondaryTitle && (
                                <span className="text-slate-700 italic"> &mdash; {entry.secondaryTitle}</span>
                              )}
                            </div>
                            {entry.dateRange && (
                              <span className="font-semibold text-slate-600 text-[9pt] shrink-0">
                                {entry.dateRange}
                              </span>
                            )}
                          </div>

                          {/* Location if present */}
                          {entry.location && (
                            <div className="text-[8.5pt] text-slate-500 italic">
                              {entry.location}
                            </div>
                          )}

                          {/* Bullets */}
                          {entry.bullets && entry.bullets.length > 0 && (
                            <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.5pt] text-slate-800 leading-snug">
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
