import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Bookmark
} from 'lucide-react';
import { ResumeTemplateId } from './PaperPreview';

interface ExportToolbarProps {
  template: ResumeTemplateId;
  onTemplateChange: (t: ResumeTemplateId) => void;
  showChanges: boolean;
  onToggleShowChanges: () => void;
  isAtsTextView: boolean;
  onToggleAtsTextView: () => void;
  onDownloadDocx: () => void;
  onPrintPdf: () => void;
  onCopyText: () => void;
  onSaveToProfile?: () => void;
  isGeneratingDocx?: boolean;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  template,
  onTemplateChange,
  showChanges,
  onToggleShowChanges,
  isAtsTextView,
  onToggleAtsTextView,
  onDownloadDocx,
  onPrintPdf,
  onCopyText,
  onSaveToProfile,
  isGeneratingDocx
}) => {
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopyClick = () => {
    onCopyText();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    onSaveToProfile?.();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
      {/* Left: Template & View Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Template Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          {(['classic', 'modern', 'compact'] as ResumeTemplateId[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTemplateChange(t)}
              className={`px-3 py-1.5 rounded-lg capitalize font-bold transition-all cursor-pointer ${
                template === t
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Show Changes Toggle */}
        <button
          type="button"
          onClick={onToggleShowChanges}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            showChanges
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showChanges ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          Highlight changes
        </button>

        {/* ATS Text View Toggle */}
        <button
          type="button"
          onClick={onToggleAtsTextView}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            isAtsTextView
              ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          ATS text view
        </button>

        {/* Page Count Badge */}
        <span className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 font-mono font-bold">
          1 Page (Est.)
        </span>
      </div>

      {/* Right: Export & Download Actions */}
      <div className="flex items-center gap-2 justify-end flex-wrap">
        {/* Copy Plain Text */}
        <button
          type="button"
          onClick={handleCopyClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Save to Profile */}
        {onSaveToProfile && (
          <button
            type="button"
            onClick={handleSaveClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-500" />}
            <span>{savedSuccess ? 'Saved' : 'Save'}</span>
          </button>
        )}

        {/* Print / PDF */}
        <button
          type="button"
          onClick={onPrintPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          title="Print or Save as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-indigo-600" />
          <span>Print / PDF</span>
        </button>

        {/* Download Word (.docx) */}
        <button
          type="button"
          onClick={onDownloadDocx}
          disabled={isGeneratingDocx}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-violet-600 hover:brightness-105 active:scale-[0.98] disabled:opacity-50 text-white transition-all shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isGeneratingDocx ? 'Generating...' : 'Download .docx'}</span>
        </button>
      </div>
    </div>
  );
};
