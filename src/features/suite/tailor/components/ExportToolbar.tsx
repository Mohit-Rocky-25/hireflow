import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Eye,
  Sliders,
  Bookmark,
  ChevronDown
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Left: Template & View Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Template Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          {(['classic', 'modern', 'compact'] as ResumeTemplateId[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTemplateChange(t)}
              className={`px-3 py-1 rounded capitalize font-medium transition-all ${
                template === t
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
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
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
            showChanges
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 font-semibold'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showChanges ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          Show changes
        </button>

        {/* ATS Text View Toggle */}
        <button
          type="button"
          onClick={onToggleAtsTextView}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
            isAtsTextView
              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60 font-semibold'
              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          ATS text view
        </button>

        {/* Page Count Badge */}
        <span className="text-[11px] text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 font-mono">
          1 Page (Est.)
        </span>
      </div>

      {/* Right: Export & Download Actions */}
      <div className="flex items-center gap-2 justify-end flex-wrap">
        {/* Copy Plain Text */}
        <button
          type="button"
          onClick={handleCopyClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {/* Save to Profile */}
        {onSaveToProfile && (
          <button
            type="button"
            onClick={handleSaveClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-zinc-400" />}
            <span>{savedSuccess ? 'Saved' : 'Save'}</span>
          </button>
        )}

        {/* Print / PDF */}
        <button
          type="button"
          onClick={onPrintPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          title="Print or Save as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-indigo-400" />
          <span>Print / PDF</span>
        </button>

        {/* Download Word (.docx) */}
        <button
          type="button"
          onClick={onDownloadDocx}
          disabled={isGeneratingDocx}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isGeneratingDocx ? 'Generating...' : 'Download .docx'}</span>
        </button>
      </div>
    </div>
  );
};
