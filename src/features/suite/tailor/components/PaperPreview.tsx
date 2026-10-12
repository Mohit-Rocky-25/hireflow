import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { ResumeDocModel, ResumePreset } from '../../../../lib/tailorEngine/docModel';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CompactTemplate } from './templates/CompactTemplate';
import {
  GraduationCap,
  Briefcase,
  Code2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sliders
} from 'lucide-react';
import {
  LayoutDensity,
  A4_TARGET_HEIGHT_PX,
  analyzeResumeHeight,
  getNextTighterDensity,
  getDensityClassNames
} from '../../../../lib/tailorEngine/heightSentinel';

export type ResumeTemplateId = 'classic' | 'modern' | 'compact';

interface PaperPreviewProps {
  model: ResumeDocModel;
  template: ResumeTemplateId;
  showChanges: boolean;
  isAtsTextView: boolean;
  rawText: string;
  onPresetChange?: (preset: ResumePreset) => void;
  density?: LayoutDensity;
  onDensityChange?: (density: LayoutDensity) => void;
}

export const PaperPreview = forwardRef<HTMLDivElement, PaperPreviewProps>(
  (
    {
      model,
      template,
      showChanges,
      isAtsTextView,
      rawText,
      onPresetChange,
      density: externalDensity,
      onDensityChange
    },
    ref
  ) => {
    // Internal density state if not managed externally
    const [internalDensity, setInternalDensity] = useState<LayoutDensity>('comfortable');
    const activeDensity = externalDensity || internalDensity;

    const handleDensityChange = (newDensity: LayoutDensity) => {
      setInternalDensity(newDensity);
      onDensityChange?.(newDensity);
    };

    // Canvas DOM reference for real-time height measurement
    const canvasInnerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => canvasInnerRef.current as HTMLDivElement);

    const [measuredHeight, setMeasuredHeight] = useState<number>(1080);

    // Measure canvas height with ResizeObserver
    useEffect(() => {
      const el = canvasInnerRef.current;
      if (!el) return;

      const updateHeight = () => {
        if (el) {
          setMeasuredHeight(el.offsetHeight || el.scrollHeight || 1080);
        }
      };

      updateHeight();

      const observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(el);

      return () => observer.disconnect();
    }, [model, template, activeDensity, showChanges, isAtsTextView]);

    const sentinel = analyzeResumeHeight(measuredHeight, A4_TARGET_HEIGHT_PX);
    const densityClasses = getDensityClassNames(activeDensity);

    const handleAutoFit = () => {
      const next = getNextTighterDensity(activeDensity);
      handleDensityChange(next);
    };

    return (
      <div className="w-full flex flex-col items-center py-6 px-2 sm:px-6 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-inner">
        {/* Top Control Bar: Real-Time 1-Page Height Sentinel */}
        {!isAtsTextView && (
          <div className="w-full max-w-[820px] mb-4 space-y-2.5 px-1">
            {/* Sentinel Status Banner & Auto-Tightener Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5">
                {sentinel.isOverflowing ? (
                  <>
                    <div className="p-1 rounded-lg bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                        <span>Page Spill Detected: ~{sentinel.spillLines} line{sentinel.spillLines > 1 ? 's' : ''} on Page 2</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 border border-rose-200 font-bold">
                          {sentinel.occupancyPercent}% full
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Content exceeds single A4 page. Recruiters strongly favor clean 1-page resumes.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <span>1-Page Certified · Zero Page 2 Spill</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-200 font-bold text-emerald-800">
                          {sentinel.occupancyPercent}% filled
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {sentinel.advisoryText}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons: Auto-Fit & Density Switcher */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {sentinel.isOverflowing && activeDensity !== 'compact' && (
                  <button
                    type="button"
                    onClick={handleAutoFit}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Automatically tighten margins and font scale to fit onto 1 page"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-950" />
                    <span>Auto-Fit to 1 Page</span>
                  </button>
                )}

                {/* Density Segmented Control */}
                <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <span className="pl-1.5 pr-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" />
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDensityChange('comfortable')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeDensity === 'comfortable'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Comfortable
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDensityChange('balanced')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeDensity === 'balanced'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDensityChange('compact')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeDensity === 'compact'
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>
            </div>

            {/* Layout Preset Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Layout Preset:</span>
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => onPresetChange && onPresetChange('fresher')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    model.preset === 'fresher'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Education first — recommended for freshers, students, and recent grads"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Fresher</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPresetChange && onPresetChange('skillsFirst')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    model.preset === 'skillsFirst'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Skills first — highlights core competencies and key projects"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Skills First</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPresetChange && onPresetChange('professional')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    model.preset === 'professional'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="Experience first — standard for 2+ years industry professionals"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Professional</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* White A4 Paper Sheet Canvas with Height Sentinel Boundary */}
        <div className="w-full flex justify-center overflow-x-auto pb-4">
          <div
            ref={canvasInnerRef}
            id="resume-paper-canvas"
            className={`relative w-full max-w-[820px] min-h-[1080px] bg-white text-zinc-900 ${densityClasses.paddingClass} ${densityClasses.contentClass} shadow-xl rounded-sm print:m-0 print:shadow-none print:w-full print:max-w-none transition-all duration-200 selection:bg-indigo-100 selection:text-indigo-950`}
            style={{
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {/* Visual A4 Page-Break Guideline (Screen only, hidden in print) */}
            {!isAtsTextView && (
              <>
                <div
                  className={`absolute left-0 right-0 border-t-2 border-dashed pointer-events-none print:hidden z-20 transition-all ${
                    sentinel.isOverflowing ? 'border-rose-400' : 'border-slate-300'
                  }`}
                  style={{ top: `${A4_TARGET_HEIGHT_PX}px` }}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 -top-3.5">
                    {sentinel.isOverflowing ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Page 1 Boundary — Content below spills to Page 2 (+{sentinel.spillLines} lines)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap shadow-2xs">
                        Page 1 Printable Boundary (A4 Max)
                      </span>
                    )}
                  </div>
                </div>

                {/* Shaded overflow region indicator if spilled */}
                {sentinel.isOverflowing && (
                  <div
                    className="absolute left-0 right-0 bottom-0 bg-rose-500/5 border-l-4 border-rose-500 pointer-events-none print:hidden z-10"
                    style={{ top: `${A4_TARGET_HEIGHT_PX}px` }}
                  />
                )}
              </>
            )}

            {isAtsTextView ? (
              <div className="font-mono text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap select-text">
                <div className="pb-3 mb-4 border-b border-zinc-300 text-zinc-500 font-sans text-xs">
                  === ATS PARSER RAW TEXT VIEW (No tables, graphics, or formatting layers) ===
                </div>
                {rawText}
              </div>
            ) : template === 'modern' ? (
              <ModernTemplate model={model} showChanges={showChanges} />
            ) : template === 'compact' ? (
              <CompactTemplate model={model} showChanges={showChanges} />
            ) : (
              <ClassicTemplate model={model} showChanges={showChanges} />
            )}
          </div>
        </div>
      </div>
    );
  }
);

PaperPreview.displayName = 'PaperPreview';
