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
  Sliders,
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Layers
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
  onToggleShowChanges?: () => void;
  isAtsTextView: boolean;
  rawText: string;
  onPresetChange?: (preset: ResumePreset) => void;
  density?: LayoutDensity;
  onDensityChange?: (density: LayoutDensity) => void;
  // Multiple downloading options callbacks
  onDownloadPdf?: () => void;
  onDownloadDocx?: () => void;
  onDownloadTxt?: () => void;
  onDownloadLatex?: () => void;
  onCopyText?: () => void;
  isGeneratingDocx?: boolean;
}

export const PaperPreview = forwardRef<HTMLDivElement, PaperPreviewProps>(
  (
    {
      model,
      template,
      showChanges,
      onToggleShowChanges,
      isAtsTextView,
      rawText,
      onPresetChange,
      density: externalDensity,
      onDensityChange,
      onDownloadPdf,
      onDownloadDocx,
      onDownloadTxt,
      onDownloadLatex,
      onCopyText,
      isGeneratingDocx = false
    },
    ref
  ) => {
    // Internal density state if not managed externally
    const [internalDensity, setInternalDensity] = useState<LayoutDensity>('comfortable');
    const activeDensity = externalDensity || internalDensity;

    // Target page selection: 1 Page vs 2 Pages
    const [targetPages, setTargetPages] = useState<1 | 2>(1);

    // Show/hide boundary guidelines overlay (for normal paper format view)
    const [showGuideline, setShowGuideline] = useState<boolean>(true);

    // Quick copy indicator
    const [copied, setCopied] = useState<boolean>(false);

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
    }, [model, template, activeDensity, showChanges, isAtsTextView, targetPages]);

    const sentinel = analyzeResumeHeight(measuredHeight, A4_TARGET_HEIGHT_PX, targetPages);
    const densityClasses = getDensityClassNames(activeDensity);

    // Smart 1-click Auto-Fit that steps density until content fits on 1 page
    const handleAutoFit = () => {
      if (activeDensity === 'comfortable') {
        handleDensityChange('balanced');
      } else if (activeDensity === 'balanced') {
        handleDensityChange('compact');
      } else {
        handleDensityChange('smart-fit');
      }
    };

    const handleQuickCopy = () => {
      onCopyText?.();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="w-full flex flex-col items-center py-6 px-2 sm:px-6 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-inner">
        {/* Top Control Center */}
        {!isAtsTextView && (
          <div className="w-full max-w-[820px] mb-4 space-y-3 px-1">
            {/* 1. Multiple Downloading Options Header Bar */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-200">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Tailored Resume</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Clean ATS Export
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  100% clean formatting. Zero green diff badges or guidelines in exported files.
                </p>
              </div>

              {/* Download Format Action Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* PDF */}
                {onDownloadPdf && (
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Print to PDF or save clean PDF file"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-600" />
                    <span>PDF</span>
                  </button>
                )}

                {/* Word (.docx) */}
                {onDownloadDocx && (
                  <button
                    type="button"
                    onClick={onDownloadDocx}
                    disabled={isGeneratingDocx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Download editable Microsoft Word document"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isGeneratingDocx ? 'Generating...' : 'Word (.docx)'}</span>
                  </button>
                )}

                {/* Plain Text (.txt) */}
                {onDownloadTxt && (
                  <button
                    type="button"
                    onClick={onDownloadTxt}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95"
                    title="Download clean plain text for ATS job portals"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Text (.txt)</span>
                  </button>
                )}

                {/* LaTeX (.tex) */}
                {onDownloadLatex && (
                  <button
                    type="button"
                    onClick={onDownloadLatex}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95"
                    title="Download compile-ready LaTeX for Overleaf"
                  >
                    <span className="font-mono text-[11px] text-amber-400 font-bold">TeX</span>
                    <span>LaTeX</span>
                  </button>
                )}

                {/* Copy */}
                {onCopyText && (
                  <button
                    type="button"
                    onClick={handleQuickCopy}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all cursor-pointer"
                    title="Copy tailored resume text to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Sentinel Status Banner & Auto-Tightener Bar */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border shadow-2xs transition-all ${
              sentinel.isOverflowing
                ? 'bg-rose-50/60 border-rose-200'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {sentinel.isOverflowing ? (
                  <>
                    <div className="p-1 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                      <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5 flex-wrap">
                        <span>Page Spill Detected: ~{sentinel.spillLines} line{sentinel.spillLines > 1 ? 's' : ''} on Page 2</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 border border-rose-200 font-bold">
                          {sentinel.occupancyPercent}% full
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Content exceeds 1 page. Use <b>Auto-Fit</b> or <b>Ultra-Fit</b> to pull content back to 1 page.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 flex-wrap">
                        <span>{targetPages === 1 ? '1-Page Certified · Zero Page 2 Spill' : '2-Page Format Certified'}</span>
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
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                {sentinel.isOverflowing && activeDensity !== 'smart-fit' && (
                  <button
                    type="button"
                    onClick={handleAutoFit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 transition-all shadow-xs cursor-pointer active:scale-95"
                    title="Automatically tighten spacing to fit 1 page"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-950" />
                    <span>Auto-Fit to 1 Page</span>
                  </button>
                )}

                {/* Density Segmented Control: Comfortable | Balanced | Compact | Ultra-Fit */}
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
                  <button
                    type="button"
                    onClick={() => handleDensityChange('smart-fit')}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeDensity === 'smart-fit'
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                    }`}
                    title="Smart-Fit (Ultra-Compact) fits full resume onto 1 page"
                  >
                    Ultra-Fit
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Secondary Toolbar: Mode Switches & Preset Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              {/* Left: View & Guideline Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Clean Mode vs Highlight Changes Switch */}
                {onToggleShowChanges && (
                  <button
                    type="button"
                    onClick={onToggleShowChanges}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      !showChanges
                        ? 'bg-white text-slate-900 border-slate-300 shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                    title="Toggle between clean final format and diff highlights"
                  >
                    {!showChanges ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>View: Clean Final Resume</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View: Highlight Changes</span>
                      </>
                    )}
                  </button>
                )}

                {/* Boundary Guideline Toggle (Normal format without red cut-off line) */}
                <button
                  type="button"
                  onClick={() => setShowGuideline(!showGuideline)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showGuideline
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-white text-slate-900 border-indigo-300 shadow-2xs font-bold'
                  }`}
                  title="Hide dashed guideline to preview normal paper format"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showGuideline ? 'Guidelines: Visible' : 'Normal Format (Guides Hidden)'}</span>
                </button>

                {/* Target Pages Toggle */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetPages(1)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      targetPages === 1
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1 Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetPages(2)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      targetPages === 2
                        ? 'bg-slate-900 text-white font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2 Pages
                  </button>
                </div>
              </div>

              {/* Right: Layout Preset Bar */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Preset:
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onPresetChange && onPresetChange('fresher')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      model.preset === 'fresher'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title="Education first — recommended for freshers, students, and recent grads"
                  >
                    <GraduationCap className="w-3 h-3" />
                    <span>Fresher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPresetChange && onPresetChange('skillsFirst')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      model.preset === 'skillsFirst'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title="Skills first — highlights core competencies and key projects"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Skills First</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPresetChange && onPresetChange('professional')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      model.preset === 'professional'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title="Experience first — standard for 2+ years industry professionals"
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>Professional</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* White Paper Sheet Canvas */}
        <div className="w-full flex justify-center overflow-x-auto pb-4">
          <div
            ref={canvasInnerRef}
            id="resume-paper-canvas"
            className={`relative w-full max-w-[820px] min-h-[1080px] bg-white text-zinc-900 ${densityClasses.paddingClass} ${densityClasses.contentClass} shadow-xl rounded-sm print:m-0 print:shadow-none print:w-full print:max-w-none transition-all duration-200 selection:bg-indigo-100 selection:text-indigo-950`}
            style={{
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06)'
            }}
          >
            {/* Visual Page-Break Guideline (Screen only, hidden in print and when guidelines are turned off) */}
            {!isAtsTextView && showGuideline && targetPages === 1 && (
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

                {/* Shaded overflow region indicator if spilled and guidelines enabled */}
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
