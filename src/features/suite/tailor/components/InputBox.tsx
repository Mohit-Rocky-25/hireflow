import React, { useRef, useState } from 'react';
import { Upload, ClipboardPaste, FileText, CheckCircle2, Building2, AlertTriangle } from 'lucide-react';
import { extractTextFromFile } from '../../../../lib/tailorEngine/fileParser';
import { parseResumeOverview, parseJDOverview, ParsedResume, ParsedJD, pluralize } from '../../../../lib/tailorEngine/parser';

interface InputBoxProps {
  stepNumber: 1 | 2;
  label: string;
  icon: React.ReactNode;
  text: string;
  setText: (v: string) => void;
  placeholder: string;
  isJD?: boolean;
  extraHeader?: React.ReactNode;
}

export function InputBox({
  stepNumber,
  label,
  icon,
  text,
  setText,
  placeholder,
  isJD = false,
  extraHeader,
}: InputBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const extracted = await extractTextFromFile(file);
      setText(extracted);
    } catch (err: any) {
      alert(err.message || 'Error extracting file text');
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      alert('Unable to access clipboard automatically. Please paste into the box below.');
    }
  };

  const overview = React.useMemo(() => {
    if (!text.trim()) return null;
    if (isJD) {
      return parseJDOverview(text);
    } else {
      return parseResumeOverview(text);
    }
  }, [text, isJD]);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-surface border-2 border-border hover:border-border-strong rounded-2xl p-6 flex flex-col shadow-sm transition-all h-full">
      {/* Numbered Card Heading (18-20px Bold) */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono text-sm font-black flex items-center justify-center shrink-0">
            {stepNumber}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-text flex items-center gap-2">
            {icon}
            {label}
          </h2>
        </div>
        {extraHeader}
      </div>

      {/* Segmented Paste/Upload Control */}
      <div className="flex items-center gap-2 mb-4 p-1 rounded-xl bg-surface-2 border border-border w-fit">
        <button
          type="button"
          onClick={() => {
            setActiveTab('paste');
            handlePaste();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'paste'
              ? 'bg-surface text-text shadow-xs border border-border'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          Paste from Clipboard
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            fileInputRef.current?.click();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'upload'
              ? 'bg-surface text-text shadow-xs border border-border'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Document (.pdf, .docx, .txt)
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.txt,.md"
          onChange={handleUpload}
        />
      </div>

      {/* 15px High-contrast Textarea with Focus Ring and Min Height 260px */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full flex-1 min-h-[260px] bg-surface-2 border-2 border-border rounded-xl p-4 text-[15px] leading-[1.6] text-text font-mono placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-y"
      />

      {/* Status Chips with Correct Plurals (B7) */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs font-medium text-text-secondary flex-wrap gap-2">
        <span className="font-mono text-text-muted">
          {pluralize(wordCount, 'word')}
        </span>

        {overview && (
          <div className="flex items-center gap-2 flex-wrap">
            {!isJD && 'sections' in overview ? (
              (overview as ParsedResume).sections.length < 2 ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Couldn't detect sections — recovering layout...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {pluralize((overview as ParsedResume).sections.length, 'section')} ·{' '}
                  {pluralize((overview as ParsedResume).bulletCount, 'bullet')} ·{' '}
                  {pluralize((overview as ParsedResume).metricsFound, 'metric')}
                </span>
              )
            ) : overview && 'mustHaves' in overview ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {(overview as ParsedJD).role} ·{' '}
                {pluralize((overview as ParsedJD).mustHaves.length, 'must-have')} ·{' '}
                {pluralize((overview as ParsedJD).niceToHaves.length, 'nice-to-have')}
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
