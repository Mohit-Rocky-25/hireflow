// ============================================================
// ATS Resume Roaster — File Dropzone & Editor Component
// Token-driven, dark, flat high-contrast code-editor feel
// ============================================================

import React, { useState, useRef } from 'react';
import { ResumePreviewModal } from '../../../components/common/ResumePreviewModal';
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

export interface ExtractionMetaInfo {
  confidencePct: number;
  methodLabel: string;
  warnings: string[];
}

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
  extractionMeta?: ExtractionMetaInfo;
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

function formatWarningPill(w: string): string {
  switch (w) {
    case 'multi-column':
      return '2-Column Reading Order';
    case 'text-box':
      return 'Word Textboxes Recovered';
    case 'table-layout':
      return 'Table Grid Cells Parsed';
    case 'repeating-header-stripped':
      return 'Running Headers Cleaned';
    case 'image-only':
      return 'Scanned Content Flagged';
    default:
      return w.replace(/-/g, ' ');
  }
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
  extractionMeta,
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

  const progressPercent = Math.min(100, Math.round((wordCount / minWords) * 100));

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragActive(false);
      }}
      onDrop={handleDrop}
      className={`group relative bg-near-black border rounded-lg p-6 flex flex-col h-[590px] transition-colors duration-150 ${
        dragActive
          ? 'border-volt bg-black shadow-level-5'
          : 'border-charcoal hover:border-charcoal-deep shadow-level-1'
      }`}
    >
      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 z-30 rounded-lg bg-black/95 border-2 border-dashed border-volt flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-none">
          <div className="w-14 h-14 rounded bg-near-black border border-volt flex items-center justify-center text-volt mb-3">
            <Upload className="w-7 h-7 stroke-[1.5px]" />
          </div>
          <p className="text-[18px] font-bold text-white uppercase tracking-tight">Drop file to attach</p>
          <p className="text-[13px] text-silver mt-1">Extracts text and auto-scans for ATS compatibility</p>
        </div>
      )}

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-white tracking-tight leading-none mb-1">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-[1px] ${
                  isReady
                    ? 'bg-black text-volt border border-volt/60'
                    : wordCount > 0
                    ? 'bg-black text-pale-yellow border border-pale-yellow/60'
                    : 'bg-black text-silver border border-charcoal'
                }`}
              >
                {isReady ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-volt stroke-[1.5px]" />
                    <span>Ready for scan</span>
                  </>
                ) : wordCount > 0 ? (
                  <>
                    <AlertCircle className="w-3 h-3 text-pale-yellow stroke-[1.5px]" />
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
        <div className="flex items-center gap-1 p-1 bg-black rounded border border-charcoal">
          <button
            type="button"
            onClick={() => setMode('paste')}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition-all cursor-pointer select-none ${
              mode === 'paste'
                ? 'bg-near-black text-volt border border-volt shadow-level-4'
                : 'text-silver hover:text-white font-medium'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-[1px] transition-all cursor-pointer select-none ${
              mode === 'upload'
                ? 'bg-near-black text-volt border border-volt shadow-level-4'
                : 'text-silver hover:text-white font-medium'
            }`}
          >
            Upload File
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black text-volt border border-charcoal hover:border-volt text-[11px] font-semibold uppercase tracking-[1px] transition-colors cursor-pointer"
                title="Load active resume from TalentLens"
              >
                <Sparkles className="w-3 h-3 text-volt" />
                <span>Use TalentLens ({talentLensResume.fileName || 'Active'})</span>
              </button>
            )}

            {onLoadSample && (
              <button
                type="button"
                onClick={() => onLoadSample('sample')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black text-silver hover:text-white border border-charcoal hover:border-silver text-[11px] font-semibold uppercase tracking-[1px] transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Load Sample Resume</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-silver uppercase tracking-[1.4px] mr-1">Presets:</span>
            {onLoadSample && (
              <>
                <button
                  type="button"
                  onClick={() => onLoadSample('fullstack')}
                  className="px-2 py-0.5 rounded bg-black hover:bg-hover-gray text-silver hover:text-white border border-charcoal text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  + Fullstack SDE
                </button>
                <button
                  type="button"
                  onClick={() => onLoadSample('senior-backend')}
                  className="px-2 py-0.5 rounded bg-black hover:bg-hover-gray text-silver hover:text-white border border-charcoal text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  + Senior Backend
                </button>
              </>
            )}
          </div>
        )}

        {/* Clear Button */}
        {!fileName && text && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-danger hover:underline cursor-pointer ml-auto shrink-0 flex items-center gap-1 transition-colors px-2 py-0.5 rounded hover:bg-black uppercase tracking-[1px] font-semibold"
            title="Clear text"
          >
            <RotateCcw className="w-3 h-3" /> Clear Text
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
            e.target.value = '';
          }
        }}
      />

      {/* Main Body: Mode 1 (Paste Editor) vs Mode 2 (File Dropzone) */}
      {mode === 'paste' ? (
        <div className="flex-1 flex flex-col min-h-0 relative rounded border border-charcoal bg-black focus-within:border-volt transition-colors overflow-hidden">
          
          {/* File attachment banner if loaded via file */}
          {fileName && (
            <div className="px-3.5 py-2 bg-near-black border-b border-charcoal flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2 truncate font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-volt shrink-0 stroke-[1.5px]" />
                <span className="font-bold text-white truncate max-w-[220px]">
                  {fileName}
                </span>
                <span className="text-silver font-mono text-[11px]">
                  ({pageCount || 1} {pageCount === 1 ? 'page' : 'pages'})
                </span>
              </div>
              <button
                type="button"
                onClick={onClear}
                className="text-danger hover:underline font-semibold cursor-pointer text-xs ml-2 inline-flex items-center gap-1"
                title="Remove attached file"
              >
                <Trash2 className="w-3 h-3" /> Remove File
              </button>
            </div>
          )}

          {/* Editor Sub-Header Bar */}
          <div className="px-3.5 py-1.5 bg-near-black border-b border-charcoal flex items-center justify-between text-[11px] text-silver font-medium">
            <div className="flex items-center gap-2">
              <FileCode className="w-3 h-3 text-silver stroke-[1.5px]" />
              <span className="uppercase tracking-[1px]">Plain Text / Markdown</span>
            </div>
            {text && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-silver hover:text-white cursor-pointer font-semibold transition-colors uppercase tracking-[1px]"
                title="Copy text to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-volt" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {/* Text Area */}
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full p-4 bg-transparent text-[14px] font-mono leading-relaxed text-white placeholder:text-silver placeholder:font-sans focus:outline-none resize-none overflow-y-auto selection:bg-volt selection:text-black"
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
              className={`flex-1 border border-dashed rounded flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-volt bg-near-black'
                  : 'border-charcoal bg-black hover:border-volt hover:bg-near-black'
              }`}
            >
              <div className="w-12 h-12 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt mb-3 group-hover:border-volt transition-colors">
                <Upload className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <p className="text-[16px] font-bold text-white uppercase tracking-tight">
                Drop your {type === 'resume' ? 'resume file' : 'job description'} here
              </p>
              <p className="text-xs text-silver mt-1 max-w-[260px] leading-relaxed">
                or click to browse PDF, DOCX, or TXT from your computer
              </p>
              <div className="flex items-center gap-1.5 mt-4">
                <span className="px-2 py-0.5 rounded bg-near-black border border-charcoal text-[11px] font-mono font-bold text-silver">PDF</span>
                <span className="px-2 py-0.5 rounded bg-near-black border border-charcoal text-[11px] font-mono font-bold text-silver">DOCX</span>
                <span className="px-2 py-0.5 rounded bg-near-black border border-charcoal text-[11px] font-mono font-bold text-silver">TXT</span>
              </div>
            </div>
          ) : (
            /* Uploaded File Inspector Card */
            <div className="flex-1 flex flex-col justify-between bg-black border border-charcoal rounded p-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded bg-near-black border border-charcoal flex flex-col items-center justify-center text-volt shrink-0">
                      <FileText className="w-5 h-5 stroke-[1.5px]" />
                      <span className="text-[9px] font-bold font-mono leading-none mt-0.5">
                        {getFileExtension(fileName)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate max-w-[240px] sm:max-w-[280px]">
                        {fileName}
                      </p>
                      <p className="text-xs text-silver font-mono mt-0.5">
                        {pageCount || 1} {pageCount === 1 ? 'page' : 'pages'} · {wordCount} words extracted
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-black text-volt border border-volt/60 text-[11px] font-semibold uppercase tracking-[1px] shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-volt stroke-[1.5px]" /> Parsed
                    </span>
                    {extractionMeta && (
                      <span className="text-[10px] text-silver font-mono">
                        {extractionMeta.confidencePct}% · {extractionMeta.methodLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Extractor Layout Warnings / Recovery Cues */}
                {extractionMeta && extractionMeta.warnings && extractionMeta.warnings.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {extractionMeta.warnings.map((w, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-near-black border border-charcoal text-silver"
                      >
                        <span className="w-1 h-1 rounded-full bg-volt" />
                        {formatWarningPill(w)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Collapsible Text Preview */}
                <div className="border border-charcoal bg-near-black rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-silver bg-black hover:bg-hover-gray cursor-pointer transition-colors uppercase tracking-[1px]"
                  >
                    <span>Inspect Extracted Text</span>
                    {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showPreview && (
                    <div className="p-3.5 max-h-[140px] overflow-y-auto text-xs text-silver font-mono leading-relaxed bg-black whitespace-pre-wrap selection:bg-volt selection:text-black">
                      {text}
                    </div>
                  )}
                </div>

                {/* Full Extracted Plain English Modal Trigger */}
                <ResumePreviewModal
                  resumeText={text}
                  fileName={fileName}
                  triggerButtonText="Inspect Full Extracted Text (Pure English)"
                  triggerClassName="w-full mt-2 py-2 px-3 rounded bg-black hover:bg-near-black border border-charcoal hover:border-volt text-volt text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-charcoal">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white hover:text-volt rounded border border-charcoal hover:border-volt transition-colors cursor-pointer uppercase tracking-[1px]"
                >
                  Replace File
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="px-3.5 py-1.5 text-xs font-semibold text-danger hover:underline rounded transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-[1px]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove File
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Footer: Metrics & Progress */}
      <div className="mt-3.5 pt-2 border-t border-charcoal flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-white">{wordCount}</span>
            <span className="text-silver">words</span>
          </div>
          <span className={`text-[11px] font-semibold uppercase tracking-[1px] ${isReady ? 'text-volt' : 'text-silver'}`}>
            {maxWords && wordCount > maxWords
              ? `Max ${maxWords} words, please trim`
              : wordCount < minWords
              ? `Need ≥ ${minWords} words`
              : `Meets ≥ ${minWords} words requirement`}
          </span>
        </div>

        {/* Thin 2px progress bar */}
        <div className="w-full bg-black rounded-full h-[2px] overflow-hidden border border-charcoal">
          <div
            className={`h-full transition-all duration-300 ${
              isReady ? 'bg-volt' : 'bg-pale-yellow'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

    </div>
  );
};
