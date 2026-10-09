import React, { forwardRef } from 'react';
import { ResumeDocModel } from '../../../../lib/tailorEngine/docModel';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CompactTemplate } from './templates/CompactTemplate';

export type ResumeTemplateId = 'classic' | 'modern' | 'compact';

interface PaperPreviewProps {
  model: ResumeDocModel;
  template: ResumeTemplateId;
  showChanges: boolean;
  isAtsTextView: boolean;
  rawText: string;
}

export const PaperPreview = forwardRef<HTMLDivElement, PaperPreviewProps>(
  ({ model, template, showChanges, isAtsTextView, rawText }, ref) => {
    return (
      <div className="w-full flex justify-center py-6 px-2 sm:px-4 bg-zinc-950/60 rounded-2xl border border-zinc-850 overflow-x-auto">
        {/* White A4 Paper Sheet */}
        <div
          ref={ref}
          id="resume-paper-canvas"
          className="w-full max-w-[820px] min-h-[1080px] bg-white text-zinc-900 p-8 sm:p-14 shadow-2xl rounded-sm print:m-0 print:p-8 print:shadow-none print:w-full print:max-w-none transition-all selection:bg-indigo-100 selection:text-indigo-950"
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
    );
  }
);

PaperPreview.displayName = 'PaperPreview';
