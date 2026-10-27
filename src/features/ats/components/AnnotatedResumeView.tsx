/**
 * HireFlow v4: Annotated Resume View Component (D16)
 * Renders candidate text with character-span highlights (Red/Amber/Green),
 * side-rail inspect drawer, rewrite suggestions, and view mode toggles.
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Eye,
  Code,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  X,
  Binary,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { generateResumeAnnotations, ResumeAnnotationSpan } from '../lib/annotateResume';
import { MetricFeedbackWidget } from '../../../components/common/MetricFeedbackWidget';
import { parseResume } from '../../../lib/ats/parseResume';

export interface AnnotatedResumeViewProps {
  resumeText: string;
  targetSkills?: string[];
  onApplyRewrite?: (originalText: string, rewriteText: string) => void;
  className?: string;
}

export function AnnotatedResumeView({
  resumeText,
  targetSkills = [],
  onApplyRewrite,
  className = '',
}: AnnotatedResumeViewProps) {
  const [viewMode, setViewMode] = useState<'annotated' | 'clean' | 'raw' | 'ats_stream'>('annotated');
  const [activeAnnotation, setActiveAnnotation] = useState<ResumeAnnotationSpan | null>(null);

  const parsedResume = useMemo(() => {
    return parseResume(resumeText);
  }, [resumeText]);

  const annotations = useMemo(() => {
    return generateResumeAnnotations(resumeText, targetSkills);
  }, [resumeText, targetSkills]);

  const redCount = annotations.filter((a) => a.severity === 'red').length;
  const amberCount = annotations.filter((a) => a.severity === 'amber').length;
  const greenCount = annotations.filter((a) => a.severity === 'green').length;

  // Render annotated text by slicing non-overlapping spans
  const renderAnnotatedContent = () => {
    if (!resumeText) return null;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const ann of annotations) {
      if (ann.start < lastIndex) continue; // Skip overlapping
      if (ann.start > lastIndex) {
        elements.push(
          <span key={`text_${lastIndex}`}>{resumeText.slice(lastIndex, ann.start)}</span>
        );
      }

      const styleClasses =
        ann.severity === 'red'
          ? 'underline decoration-wavy decoration-rose-500 bg-rose-500/10 text-rose-200 cursor-pointer hover:bg-rose-500/20'
          : ann.severity === 'amber'
          ? 'underline decoration-amber-500 bg-amber-500/10 text-amber-200 cursor-pointer hover:bg-amber-500/20'
          : 'bg-emerald-500/10 text-emerald-300 font-medium cursor-pointer hover:bg-emerald-500/20 border-b border-emerald-500/40';

      elements.push(
        <mark
          key={ann.id}
          onClick={() => setActiveAnnotation(ann)}
          className={`px-1 py-0.5 rounded transition-colors ${styleClasses}`}
          title={`${ann.title} (Click to inspect)`}
        >
          {resumeText.slice(ann.start, ann.end)}
        </mark>
      );

      lastIndex = ann.end;
    }

    if (lastIndex < resumeText.length) {
      elements.push(
        <span key={`text_end`}>{resumeText.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  const handleApplyRewrite = () => {
    if (activeAnnotation && activeAnnotation.suggestedRewrite && onApplyRewrite) {
      onApplyRewrite(activeAnnotation.text, activeAnnotation.suggestedRewrite);
      setActiveAnnotation(null);
    }
  };

  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden ${className}`}>
      {/* View Header with Mode Toggles & Summary Badges */}
      <div className="border-b border-slate-800 bg-slate-950/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-emerald-400" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            Annotated Resume Scanner (D16)
          </span>

          {/* Counts */}
          <div className="flex items-center gap-1.5 ml-2">
            {redCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                <XCircle className="h-3 w-3" /> {redCount} Weak
              </span>
            )}
            {amberCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                <AlertTriangle className="h-3 w-3" /> {amberCount} Amber
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              <CheckCircle2 className="h-3 w-3" /> {greenCount} Strong
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('annotated')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              viewMode === 'annotated' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Annotated View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('clean')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              viewMode === 'clean' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Clean Text
          </button>
          <button
            type="button"
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              viewMode === 'raw' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Source
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ats_stream')}
            className={`px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
              viewMode === 'ats_stream' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            What ATS Sees
          </button>
        </div>
      </div>

      {/* Main Container Split: Text View & Side Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
        {/* Text View Area */}
        <div className={`p-5 overflow-y-auto max-h-[600px] font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap ${
          activeAnnotation ? 'lg:col-span-8 border-r border-slate-800' : 'lg:col-span-12'
        }`}>
          {viewMode === 'annotated' && renderAnnotatedContent()}
          {viewMode === 'clean' && resumeText}
          {viewMode === 'raw' && (
            <pre className="text-slate-400 font-mono text-[11px] leading-relaxed">
              {resumeText}
            </pre>
          )}
          {viewMode === 'ats_stream' && (
            <div className="space-y-4 font-sans text-xs">
              {/* ATS Ingestion Header & Verification Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Candidate Name</div>
                  <div className="text-base font-bold text-emerald-400 truncate mt-1">
                    {parsedResume.contact.name || 'Not Detected'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact Extracted</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    {parsedResume.contact.email ? '✓ Email' : '✗ Email'} · {parsedResume.contact.phone ? '✓ Phone' : '✗ Phone'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Token Count</div>
                  <div className="text-base font-mono font-bold text-slate-200 mt-1">
                    {resumeText.split(/\s+/).filter(Boolean).length} tokens
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Parsing Status</div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Linear Single-Column
                  </div>
                </div>
              </div>

              {/* Detected Sections Matrix */}
              <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Enterprise ATS Section Mapping (Workday / Taleo standard)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {[
                    { id: 'summary', label: 'Summary', found: Boolean(parsedResume.sections.summary && parsedResume.sections.summary.trim()) },
                    { id: 'skills', label: 'Skills', found: Boolean(parsedResume.sections.skills && parsedResume.sections.skills.length > 0) },
                    { id: 'experience', label: 'Experience', found: Boolean(parsedResume.sections.experience && parsedResume.sections.experience.length > 0) },
                    { id: 'projects', label: 'Projects', found: Boolean(parsedResume.sections.projects && parsedResume.sections.projects.length > 0) },
                    { id: 'education', label: 'Education', found: Boolean(parsedResume.sections.education && parsedResume.sections.education.length > 0) },
                    { id: 'certifications', label: 'Certifications', found: Boolean(parsedResume.sections.rawSections?.certifications) },
                  ].map((sec) => (
                    <div
                      key={sec.id}
                      className={`p-2.5 rounded border text-center ${
                        sec.found
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{sec.label}</div>
                      <div className="text-[11px] font-semibold mt-0.5">{sec.found ? '✓ Parsed' : '— Missing'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Parsed Stream */}
              <div className="p-3.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans mb-2">
                  Raw Parsed Token Stream (Exactly how ATS engines index your text)
                </div>
                <pre className="max-h-[340px] overflow-y-auto whitespace-pre-wrap leading-relaxed text-emerald-300/90 text-xs">
                  {resumeText
                    .split('\n')
                    .map((line, idx) => `[TOKEN_${String(idx + 1).padStart(3, '0')}] ${line}`)
                    .join('\n')}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Side Rail: Finding Inspector & Rewrite */}
        {activeAnnotation && (
          <div className="lg:col-span-4 bg-slate-950/80 p-4 flex flex-col justify-between space-y-4 text-xs">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                    Rule Triggered: {activeAnnotation.ruleId}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{activeAnnotation.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAnnotation(null)}
                  className="rounded p-1 text-slate-500 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Original snippet */}
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Target Text:
                </span>
                <p className="font-mono text-white text-xs bg-slate-950 p-2 rounded border border-slate-800/80">
                  "{activeAnnotation.text}"
                </p>
              </div>

              {/* Explanation */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  Why this matters:
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {activeAnnotation.message}
                </p>
              </div>

              {/* Suggested Rewrite */}
              {activeAnnotation.suggestedRewrite && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Suggested High-Impact Rewrite</span>
                  </div>
                  <p className="font-mono text-emerald-300 text-xs bg-slate-950/80 p-2 rounded border border-emerald-500/20">
                    "{activeAnnotation.suggestedRewrite}"
                  </p>
                  {onApplyRewrite && (
                    <button
                      type="button"
                      onClick={handleApplyRewrite}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                    >
                      <span>Apply Rewrite to Resume</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Per-finding feedback widget */}
            <div className="pt-3 border-t border-slate-800">
              <MetricFeedbackWidget ruleId={activeAnnotation.ruleId} targetKind="finding" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
