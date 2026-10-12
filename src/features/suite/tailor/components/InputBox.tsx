import React, { useRef, useState, useMemo } from 'react';
import {
  Upload,
  ClipboardPaste,
  FileText,
  CheckCircle2,
  Building2,
  AlertTriangle,
  Copy,
  Check,
  X,
  FileUp,
  FileCode,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { extractTextFromFile } from '../../../../lib/tailorEngine/fileParser';
import { parseResumeOverview, parseJDOverview, ParsedResume, ParsedJD, pluralize } from '../../../../lib/tailorEngine/parser';

export interface InputBoxProps {
  stepNumber: 1 | 2;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  text: string;
  setText: (v: string) => void;
  placeholder: string;
  isJD?: boolean;
  extraHeader?: React.ReactNode;
  onLoadSample?: () => void;
  sampleButtonLabel?: string;
}

export function InputBox({
  stepNumber,
  label,
  subtitle,
  icon,
  text,
  setText,
  placeholder,
  isJD = false,
  extraHeader,
  onLoadSample,
  sampleButtonLabel,
}: InputBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadedMeta, setUploadedMeta] = useState<{
    name: string;
    size: number;
    words: number;
  } | null>(null);

  // Process file upload or drop
  const handleFile = async (file: File) => {
    if (!file) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const extracted = await extractTextFromFile(file);
      const words = extracted.trim() ? extracted.trim().split(/\s+/).length : 0;
      setText(extracted);
      setUploadedMeta({
        name: file.name,
        size: file.size,
        words,
      });
      // Once parsed, allow viewing in paste/editor tab or stay in upload tab
    } catch (err: any) {
      setExtractError(err.message || 'Error parsing document. Please copy and paste the text instead.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
        setUploadedMeta(null);
      } else {
        textareaRef.current?.focus();
      }
    } catch {
      // Fallback: focus textarea for manual Ctrl+V
      textareaRef.current?.focus();
    }
  };

  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setText('');
    setUploadedMeta(null);
    setExtractError(null);
  };

  const overview = useMemo(() => {
    if (!text.trim()) return null;
    if (isJD) {
      return parseJDOverview(text);
    } else {
      return parseResumeOverview(text);
    }
  }, [text, isJD]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const targetWords = 30;
  const wordProgress = Math.min(100, Math.round((wordCount / targetWords) * 100));

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 flex flex-col shadow-sm hover:shadow-md transition-all h-full">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 border shadow-xs ${
              stepNumber === 1
                ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                : 'bg-violet-50 text-violet-700 border-violet-200/80'
            }`}
          >
            {stepNumber}
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {icon}
              {label}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 font-normal mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {extraHeader}
          {onLoadSample && !text.trim() && (
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/60 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              {sampleButtonLabel || 'Load Sample'}
            </button>
          )}
        </div>
      </div>

      {/* Segmented Mode Selector (Paste Text vs Upload File) */}
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Text
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
            <span className="hidden sm:inline text-[10px] text-slate-400 font-normal">
              (.pdf, .docx, .txt)
            </span>
          </button>
        </div>

        {/* Quick Clear / Copy Shortcuts */}
        {text.trim() && (
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer font-medium"
              title="Copy all text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer font-medium"
              title="Clear text"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Body: Paste Editor or Upload Area */}
      <div className="flex-1 flex flex-col min-h-[280px]">
        {activeTab === 'paste' ? (
          <div className="flex-1 flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
            {/* Editor Action Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200/80 bg-white/90 text-[11px] font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>Plain Text / Markdown</span>
              </div>
              <div className="flex items-center gap-2">
                {!text.trim() && (
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-medium text-xs transition-colors cursor-pointer"
                  >
                    <ClipboardPaste className="w-3 h-3 text-slate-500" />
                    Paste Clipboard
                  </button>
                )}
                <span className="text-slate-400 font-sans">
                  {pluralize(wordCount, 'word')}
                </span>
              </div>
            </div>

            {/* High-Contrast Monospace Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (uploadedMeta) setUploadedMeta(null);
              }}
              placeholder={placeholder}
              className="w-full flex-1 min-h-[230px] p-4 bg-transparent text-[13.5px] leading-relaxed text-slate-800 font-mono placeholder:text-slate-400 placeholder:font-sans focus:outline-none resize-y"
            />
          </div>
        ) : (
          /* Upload View with Drag & Drop or Parsed File Card */
          <div className="flex-1 flex flex-col justify-center">
            {uploadedMeta && text.trim() ? (
              /* Already Uploaded File Card */
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[240px] sm:max-w-[320px]">
                        {uploadedMeta.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatFileSize(uploadedMeta.size)} · {pluralize(uploadedMeta.words, 'word')} extracted
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Parsed
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Inspect / Edit in Editor
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Upload Different File
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex-1 min-h-[240px] rounded-xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                }`}
              >
                {isExtracting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-bold text-slate-800">
                      Extracting text from document...
                    </p>
                    <p className="text-xs text-slate-500">
                      Validating file structure and formatting
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">
                      Drag & drop your document here
                    </p>
                    <p className="text-xs text-slate-500 mb-4 max-w-xs">
                      or click to browse from your device
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap justify-center mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600 shadow-xs">
                        .PDF
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600 shadow-xs">
                        .DOCX
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600 shadow-xs">
                        .TXT
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-600 shadow-xs">
                        .MD
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      100% Client-Side Extraction · Up to 5 MB
                    </p>
                  </>
                )}
              </div>
            )}

            {extractError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p>{extractError}</p>
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Dynamic Word Count Progress Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              wordCount === 0
                ? 'w-0'
                : wordCount < targetWords
                ? 'bg-amber-400'
                : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500'
            }`}
            style={{ width: `${wordProgress}%` }}
          />
        </div>

        {/* Footer Intelligence Bar & Status Chips */}
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-700 font-bold">
              {pluralize(wordCount, 'word')}
            </span>
            {wordCount > 0 && wordCount < targetWords && (
              <span className="text-[11px] text-amber-600 font-medium">
                ({targetWords - wordCount} more recommended)
              </span>
            )}
          </div>

          {/* Structural Overview Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {!text.trim() ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[11px]">
                Awaiting content
              </span>
            ) : overview && !isJD && 'sections' in overview ? (
              (overview as ParsedResume).sections.length < 2 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Layout recovery active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {pluralize((overview as ParsedResume).sections.length, 'section')} ·{' '}
                  {pluralize((overview as ParsedResume).bulletCount, 'bullet')} ·{' '}
                  {pluralize((overview as ParsedResume).metricsFound, 'metric')}
                </span>
              )
            ) : overview && isJD && 'mustHaves' in overview ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                {(overview as ParsedJD).role || 'Job detected'} ·{' '}
                {pluralize((overview as ParsedJD).mustHaves.length, 'must-have')} ·{' '}
                {pluralize((overview as ParsedJD).niceToHaves.length, 'nice-to-have')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                ✓ Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
