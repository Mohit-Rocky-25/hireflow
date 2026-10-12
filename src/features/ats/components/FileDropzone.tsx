// ============================================================
// ATS Resume Roaster — File Dropzone & Editor Component
// Top-Designer Grade UI/UX with Code Editor Feel, Quick Presets & Fluid Transitions
// ============================================================

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
  PlusCircle,
  FileCode,
  AlertCircle
} from 'lucide-react';

export interface FileDropzoneProps {
  type: 'resume' | 'job';
  title: string;
  icon: React.ReactNode;
  text: string;
  fileName: string | null;
  pageCount?: number;
  wordCount: number;
  isReady: boolean;
  minWords: number;
  maxWords?: number;
  placeholder: string;
  onFileUpload: (file: File) => void;
  onClear: () => void;
  onTextChange: (text: string) => void;
  talentLensResume?: {
    text: string;
    fileName: string;
  } | null;
  onImportTalentLens?: () => void;
  onLoadSample?: (text: string, title?: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  type,
  title,
  icon,
  text,
  fileName,
  pageCount,
  wordCount,
  isReady,
  minWords,
  maxWords,
  placeholder,
  onFileUpload,
  onClear,
  onTextChange,
  talentLensResume,
  onImportTalentLens,
  onLoadSample,
}) => {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getFileExtension = (name: string | null) => {
    if (!name) return 'DOC';
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'DOC';
  };

  const accentColor = type === 'resume' ? 'sky' : 'indigo';
  const progressPercent = Math.min(100, Math.round((wordCount / minWords) * 100));

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.07)] hover:border-slate-300 flex flex-col h-[590px] transition-all duration-300">
      
      {/* Top subtle decorative accent line */}
      <div
        className={`absolute top-0 left-8 right-8 h-[3px] rounded-b-full ${
          type === 'resume'
            ? 'bg-gradient-to-r from-sky-400 to-blue-600'
            : 'bg-gradient-to-r from-indigo-500 to-violet-600'
        }`}
      />

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              type === 'resume'
                ? 'bg-sky-50 border-sky-100 text-sky-600'
                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
            }`}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-[19px] sm:text-[21px] font-black text-slate-950 tracking-tight leading-none mb-1">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isReady
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : wordCount > 0
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                    : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                }`}
              >
                {isReady ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Ready for scan</span>
                  </>
                ) : wordCount > 0 ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>{minWords - wordCount} more words needed</span>
                  </>
                ) : (
                  <span>Awaiting input</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switch Tabs: Paste vs Upload */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              mode === 'paste'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            ✏️ Paste Text
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              mode === 'upload'
                ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 ring-1 ring-slate-900/5'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            📎 Upload File
          </button>
        </div>
      </div>

      {/* Quick Action Helpers / Presets Bar */}
      <div className="mb-3 flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        {type === 'resume' ? (
          <div className="flex items-center gap-2 flex-wrap">
            {talentLensResume && talentLensResume.text && onImportTalentLens && (
              <button
                type="button"
                onClick={onImportTalentLens}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                title="Load active resume from TalentLens"
              >
                <Sparkles className="w-3 h-3 text-sky-600" />
                <span>Use TalentLens ({talentLensResume.fileName || 'Active'})</span>
              </button>
            )}

            {onLoadSample && (
              <button
                type="button"
                onClick={() => onLoadSample('sample')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <PlusCircle className="w-3 h-3 text-slate-500" />
                <span>Load Sample Resume</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Presets:</span>
            {onLoadSample && (
              <>
                <button
                  type="button"
                  onClick={() => onLoadSample('fullstack')}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 text-[11px] font-bold transition-all cursor-pointer"
                >
                  + Fullstack SDE
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSample('senior-backend')}
                  className="px-2 py-0.5 rounded-md bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/70 text-[11px] font-bold transition-all cursor-pointer"
                >
                  + Senior Backend
                </button>
              </>
            )}
          </div>
        )}

        {/* Clear Button if text exists */}
        {text && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer ml-auto shrink-0 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Main Body: Mode 1 (Paste Editor) vs Mode 2 (File Dropzone) */}
      {mode === 'paste' ? (
        <div className="flex-1 flex flex-col min-h-0 relative rounded-2xl border border-slate-200/90 bg-slate-50/40 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/10 transition-all duration-200 overflow-hidden shadow-2xs">
          
          {/* File attachment banner if loaded via file */}
          {fileName && (
            <div className="px-3.5 py-2 bg-emerald-50/90 border-b border-emerald-200/80 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2 truncate font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-900 truncate max-w-[220px]">
                  {fileName}
                </span>
                <span className="text-emerald-700 font-mono text-[11px]">
                  ({pageCount || 1} {pageCount === 1 ? 'page' : 'pages'})
                </span>
              </div>
              <button
                type="button"
                onClick={onClear}
                className="text-red-600 hover:text-red-700 font-bold cursor-pointer text-xs ml-2 hover:underline"
              >
                Clear File
              </button>
            </div>
          )}

          {/* Editor Sub-Header Bar */}
          <div className="px-3.5 py-1.5 bg-slate-100/70 border-b border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <FileCode className="w-3 h-3 text-slate-400" />
              <span>Plain Text / Markdown</span>
            </div>
            {text && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer font-semibold transition-colors"
                title="Copy text to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>

          {/* Text Area */}
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full p-4 bg-transparent text-[13.5px] sm:text-[14px] font-mono leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none resize-none overflow-y-auto selection:bg-sky-500/20"
          />
        </div>
      ) : (
        /* Mode 2: Visual File Dropzone */
        <div className="flex-1 flex flex-col min-h-0">
          {!fileName ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
                  : 'border-slate-200 bg-gradient-to-b from-slate-50/50 to-slate-100/40 hover:border-sky-400/80 hover:bg-sky-50/30 shadow-2xs'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-sky-600 mb-3.5 group-hover:scale-110 group-hover:border-sky-300 transition-all duration-200">
                <Upload className="w-7 h-7 stroke-[2px]" />
              </div>
              <p className="text-[16px] font-black text-slate-950">
                Drop your {type === 'resume' ? 'resume file' : 'job description'} here
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-[260px] leading-relaxed">
                or click to browse PDF, DOCX, or TXT from your computer
              </p>
              <div className="flex items-center gap-1.5 mt-4">
                <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600 shadow-2xs">PDF</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600 shadow-2xs">DOCX</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600 shadow-2xs">TXT</span>
              </div>
            </div>
          ) : (
            /* Uploaded File Inspector Card */
            <div className="flex-1 flex flex-col justify-between bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/25 flex flex-col items-center justify-center text-sky-600 shrink-0">
                      <FileText className="w-5 h-5" />
                      <span className="text-[9px] font-black font-mono leading-none mt-0.5">
                        {getFileExtension(fileName)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-950 text-sm truncate max-w-[240px] sm:max-w-[280px]">
                        {fileName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {pageCount || 1} {pageCount === 1 ? 'page' : 'pages'} · {wordCount} words extracted
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Parsed
                  </span>
                </div>

                {/* Collapsible Text Preview */}
                <div className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100/70 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <span>Inspect Extracted Text</span>
                    {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showPreview && (
                    <div className="p-3.5 max-h-[140px] overflow-y-auto text-xs text-slate-600 font-mono leading-relaxed bg-white whitespace-pre-wrap selection:bg-sky-500/20">
                      {text}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-bold text-sky-600 hover:bg-sky-50 rounded-lg border border-sky-300 transition-colors cursor-pointer"
                >
                  Replace File
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Footer: Metrics & Progress */}
      <div className="mt-3.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-slate-900">{wordCount}</span>
            <span className="text-slate-400">words</span>
          </div>
          <span className={`text-[11px] font-bold ${isReady ? 'text-emerald-700' : 'text-slate-500'}`}>
            {maxWords && wordCount > maxWords
              ? `Max ${maxWords} words, please trim`
              : wordCount < minWords
              ? `Need ≥ ${minWords} words`
              : `✓ Meets ≥ ${minWords} words requirement`}
          </span>
        </div>

        {/* Subtle Word Count Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isReady ? 'bg-emerald-500' : 'bg-sky-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

    </div>
  );
};
