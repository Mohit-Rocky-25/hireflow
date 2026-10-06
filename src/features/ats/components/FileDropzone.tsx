// ============================================================
// ATS Resume Roaster — File Dropzone & Mode Selector Component
// Provides Paste Text and TalentLens-style visual file dropzone
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
  placeholder: string;
  onFileUpload: (file: File) => void;
  onClear: () => void;
  onTextChange: (text: string) => void;
  talentLensResume?: {
    text: string;
    fileName: string;
  } | null;
  onImportTalentLens?: () => void;
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
  placeholder,
  onFileUpload,
  onClear,
  onTextChange,
  talentLensResume,
  onImportTalentLens,
}) => {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getFileExtension = (name: string | null) => {
    if (!name) return 'DOC';
    const parts = name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'DOC';
  };

  return (
    <div className="bg-surface rounded-[16px] p-6 border border-border shadow-xs flex flex-col h-[520px]">
      {/* Header with Title and Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon}
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 truncate">
            {title}
          </h2>
        </div>

        {/* TalentLens-Style Mode Switch Tabs: Paste vs Upload */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-[10px] border border-slate-200/80">
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`px-3 py-1 rounded-[7px] text-xs font-bold transition-all cursor-pointer ${
              mode === 'paste'
                ? 'bg-white text-primary shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✏️ Paste
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 rounded-[7px] text-xs font-bold transition-all cursor-pointer ${
              mode === 'upload'
                ? 'bg-white text-primary shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📎 Upload File
          </button>
        </div>
      </div>

      {/* TalentLens Quick Import Chip (Available when TalentLens has a loaded resume) */}
      {type === 'resume' && talentLensResume && talentLensResume.text && onImportTalentLens && (
        <div className="mb-3 px-3 py-1.5 rounded-[10px] bg-sky-50 border border-sky-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-slate-700 truncate">
              TalentLens Resume available: <span className="font-semibold text-primary">{talentLensResume.fileName || 'Active Resume'}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onImportTalentLens}
            className="text-primary hover:text-primary-hover font-bold text-xs underline cursor-pointer shrink-0 ml-2"
          >
            ⚡ Load from TalentLens
          </button>
        </div>
      )}

      {/* Hidden File Input for Native File Dialog */}
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

      {/* Active Mode Body */}
      {mode === 'paste' ? (
        // Mode 1: Paste Textarea (Existing Option)
        <div className="flex-1 flex flex-col min-h-0">
          {fileName && (
            <div className="mb-2 px-3 py-1.5 rounded-[8px] bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2 truncate font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-semibold text-emerald-900 truncate max-w-[200px]">
                  {fileName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-emerald-700 font-mono text-[11px]">
                  {pageCount || 1} {pageCount === 1 ? 'page' : 'pages'} · {wordCount} words
                </span>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-red-600 hover:text-red-700 font-semibold cursor-pointer text-xs ml-1"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full bg-surface-hover/70 border border-border rounded-[10px] p-4 text-[15px] sm:text-[16px] font-sans leading-relaxed focus:ring-1 focus:ring-primary/40 focus:border-primary outline-none resize-none transition-colors"
          />
        </div>
      ) : (
        // Mode 2: TalentLens-Style Visual File Dropzone & File Structure Card
        <div className="flex-1 flex flex-col min-h-0">
          {!fileName ? (
            // Empty Dropzone State
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                dragActive ? 'border-primary bg-sky-50/60 scale-[1.01]' : 'border-slate-300 bg-slate-50/60 hover:border-primary/60 hover:bg-sky-50/30'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-primary/25 shadow-xs flex items-center justify-center text-primary mb-3">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <p className="text-base font-extrabold text-slate-900">
                Drop your {type === 'resume' ? 'resume' : 'job description'} here
              </p>
              <p className="text-xs text-slate-500 mt-1">or click to browse from your device</p>
              <div className="flex items-center gap-1.5 mt-4">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600 shadow-2xs">PDF</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600 shadow-2xs">DOCX</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-mono font-bold text-slate-600 shadow-2xs">TXT</span>
              </div>
            </div>
          ) : (
            // Loaded File Structure Card (File Type Preview)
            <div className="flex-1 flex flex-col justify-between bg-slate-50 border border-slate-200/90 rounded-[12px] p-5 shadow-2xs">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex flex-col items-center justify-center text-primary shrink-0">
                      <FileText className="w-5 h-5" />
                      <span className="text-[9px] font-black font-mono leading-none mt-0.5">
                        {getFileExtension(fileName)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 text-sm truncate max-w-[220px] sm:max-w-[280px]">
                        {fileName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Parsed: {pageCount || 1} {pageCount === 1 ? 'page' : 'pages'} · {wordCount} words
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Loaded
                  </span>
                </div>

                {/* Collapsible Text Preview */}
                <div className="border border-slate-200 bg-white rounded-[10px] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100/60 hover:bg-slate-100 cursor-pointer"
                  >
                    <span>Extracted Document Text</span>
                    {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showPreview && (
                    <div className="p-3 max-h-[140px] overflow-y-auto text-xs text-slate-600 font-mono leading-relaxed bg-white whitespace-pre-wrap">
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
                  className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-sky-50 rounded-[8px] border border-primary/30 transition-colors cursor-pointer"
                >
                  Replace File
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-[8px] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Word Count & Requirement Status */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-1">
        <span className={`font-mono font-medium ${isReady ? 'text-emerald-600' : 'text-slate-500'}`}>
          {wordCount} words
        </span>
        <span className={!isReady ? 'text-amber-600 font-medium' : 'text-emerald-700 font-medium'}>
          {isReady ? '✓ Ready for parsing' : `Minimum ${minWords} words required`}
        </span>
      </div>
    </div>
  );
};
