import React, { useRef } from 'react';
import { Upload, ClipboardPaste } from 'lucide-react';
import { extractTextFromFile } from '../../../../lib/tailorEngine/fileParser';
import { parseResumeOverview, parseJDOverview, ParsedResume, ParsedJD } from '../../../../lib/tailorEngine/parser';

interface InputBoxProps {
  label: string;
  icon: React.ReactNode;
  text: string;
  setText: (v: string) => void;
  placeholder: string;
  isJD?: boolean;
  extraHeader?: React.ReactNode;
}

export function InputBox({ label, icon, text, setText, placeholder, isJD = false, extraHeader }: InputBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const extracted = await extractTextFromFile(file);
      setText(extracted);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      alert("Failed to read clipboard. Please paste manually.");
    }
  };

  const overview = React.useMemo(() => {
    if (!text) return null;
    if (isJD) {
       return parseJDOverview(text);
    } else {
       return parseResumeOverview(text);
    }
  }, [text, isJD]);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col shadow-xs h-full">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <label className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {label}
        </label>
        {extraHeader}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <button onClick={handlePaste} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[11px] font-semibold transition-colors border border-border">
          <ClipboardPaste className="w-3.5 h-3.5" />
          Paste Text
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-[11px] font-semibold transition-colors border border-border">
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt,.md" onChange={handleUpload} />
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full flex-1 min-h-[220px] bg-surface-2 border border-border rounded-xl p-3 text-xs text-text font-mono leading-relaxed placeholder:text-text-muted focus:outline-none focus:border-primary"
      />
      
      <div className="flex items-center justify-between mt-3 text-[11px] text-text-muted">
        <span>{text.split(/\s+/).filter(Boolean).length} words</span>
        {overview && (
          <div className="flex items-center gap-2">
            {!isJD && 'sections' in overview ? (
              <span className="text-success flex items-center gap-1">
                ✓ Found {(overview as ParsedResume).sections.length} sections, {(overview as ParsedResume).bulletCount} bullets, {(overview as ParsedResume).metricsFound} metrics
              </span>
            ) : overview && 'role' in overview ? (
              <span className="text-primary flex items-center gap-1">
                ✓ {(overview as ParsedJD).role} @ {(overview as ParsedJD).company} | {(overview as ParsedJD).mustHaves.length} Must-haves
              </span>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
