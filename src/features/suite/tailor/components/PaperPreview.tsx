import React, { forwardRef } from 'react';
import { ResumeDocModel, ResumePreset } from '../../../../lib/tailorEngine/docModel';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CompactTemplate } from './templates/CompactTemplate';
import { GraduationCap, Briefcase, Code2, Sparkles } from 'lucide-react';

export type ResumeTemplateId = 'classic' | 'modern' | 'compact';

interface PaperPreviewProps {
  model: ResumeDocModel;
  template: ResumeTemplateId;
  showChanges: boolean;
  isAtsTextView: boolean;
  rawText: string;
  onPresetChange?: (preset: ResumePreset) => void;
}

export const PaperPreview = forwardRef<HTMLDivElement, PaperPreviewProps>(
  ({ model, template, showChanges, isAtsTextView, rawText, onPresetChange }, ref) => {
    // Dynamic page padding ladder based on word density to keep page balanced
    const pagePadding =
      model.wordCount && model.wordCount < 250
        ? 'p-10 sm:p-16'
        : model.wordCount && model.wordCount > 450
        ? 'p-6 sm:p-10'
        : 'p-8 sm:p-14';

    return (
      <div className="w-full flex flex-col items-center py-4 px-2 sm:px-4 bg-zinc-950/60 rounded-2xl border border-zinc-850">
        {/* Preset Selector Toolbar */}
        {!isAtsTextView && (
          <div className="w-full max-w-[820px] mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Layout Preset:</span>
            </div>
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => onPresetChange && onPresetChange('fresher')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  model.preset === 'fresher'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Education first — recommended for freshers, students, and recent grads"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Fresher</span>
              </button>
              <button
                onClick={() => onPresetChange && onPresetChange('skillsFirst')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  model.preset === 'skillsFirst'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Skills first — highlights core competencies and key projects"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Skills First</span>
              </button>
              <button
                onClick={() => onPresetChange && onPresetChange('professional')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  model.preset === 'professional'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Experience first — standard for 2+ years industry professionals"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Professional</span>
              </button>
            </div>
          </div>
        )}

        {/* White A4 Paper Sheet Canvas */}
        <div className="w-full flex justify-center overflow-x-auto">
          <div
            ref={ref}
            id="resume-paper-canvas"
            className={`w-full max-w-[820px] min-h-[1080px] bg-white text-zinc-900 ${pagePadding} shadow-2xl rounded-sm print:m-0 print:p-8 print:shadow-none print:w-full print:max-w-none transition-all selection:bg-indigo-100 selection:text-indigo-950`}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.08)'
            }}
          >
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
