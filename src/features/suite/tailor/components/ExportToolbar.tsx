import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Bookmark,
  Eye,
  EyeOff
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
  onDownloadTxt?: () => void;
  onDownloadLatex?: () => void;
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
  onDownloadTxt,
  onDownloadLatex,
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

        {/* Clean Mode vs Highlight Changes Switch */}
        <button
          type="button"
          onClick={onToggleShowChanges}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
            showChanges
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900'
          }`}
          title={showChanges ? 'Switch to clean final paper preview' : 'Highlight accepted changes'}
        >
          {showChanges ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
              <span>Highlight changes</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Clean final resume</span>
            </>
          )}
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
          <span>ATS text view</span>
        </button>
      </div>

      {/* Right: Export & Download Actions */}
      <div className="flex items-center gap-1.5 justify-end flex-wrap">
        {/* Copy Plain Text */}
        <button
          type="button"
          onClick={handleCopyClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          title="Copy formatted text to clipboard"
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
            title="Save this version into Candidate Profile"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-500" />}
            <span>{savedSuccess ? 'Saved' : 'Save'}</span>
          </button>
        )}

        {/* LaTeX (.tex) */}
        {onDownloadLatex && (
          <button
            type="button"
            onClick={onDownloadLatex}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Download Jake's Resume LaTeX (.tex) file"
          >
            <span className="font-mono text-[11px] text-amber-600 font-bold">TeX</span>
            <span>LaTeX</span>
          </button>
        )}

        {/* Plain Text (.txt) */}
        {onDownloadTxt && (
          <button
            type="button"
            onClick={onDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Download plain text file for job portals"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>.txt</span>
          </button>
        )}

        {/* Print / PDF */}
        <button
          type="button"
          onClick={onPrintPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer shadow-2xs"
          title="Print to PDF (Clean recruiter format with zero diff badges)"
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
          title="Download Microsoft Word (.docx) document"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isGeneratingDocx ? 'Generating...' : 'Word (.docx)'}</span>
        </button>
      </div>
    </div>
  );
};
