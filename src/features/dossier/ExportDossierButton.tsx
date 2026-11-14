import React, { useState, useEffect, useRef } from 'react';
import type { AuditEntry } from '@/domain/types';
import { exportDossier, type DossierFormat } from './exportDossier';
import { Download, FileText, Loader2, ChevronDown, Check, FileCode, FileSpreadsheet, File } from 'lucide-react';

interface ExportDossierButtonProps {
  audit: AuditEntry;
  resumeText?: string;
  jdText?: string;
  highlighted?: boolean;
  label?: string;
  className?: string;
}

export const ExportDossierButton: React.FC<ExportDossierButtonProps> = ({
  audit,
  resumeText,
  jdText,
  highlighted = false,
  label = 'Download Complete Report',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastFormat, setLastFormat] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: DossierFormat) => {
    setIsExporting(true);
    setIsOpen(false);
    setErrorMessage(null);
    try {
      await exportDossier({
        audit,
        resumeText,
        jdText,
        format,
      });
      setLastFormat(format.toUpperCase());
      setTimeout(() => setLastFormat(null), 3000);
    } catch (err) {
      console.error('Failed to export dossier:', err);
      const msg = err instanceof Error ? err.message : 'Export failed. Please try another format.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 6000);
    } finally {
      setIsExporting(false);
    }
  };

  const primaryBtnStyles = highlighted
    ? 'bg-[#faff69] !text-[#090907] font-bold border border-[#faff69] hover:bg-[#ebf059] shadow-sm'
    : 'border border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800';

  const chevronBtnStyles = highlighted
    ? 'bg-[#faff69] !text-[#090907] border-t border-r border-b border-[#faff69] border-l border-[#d4d84c] hover:bg-[#ebf059]'
    : 'border-t border-r border-b border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800 border-l border-neutral-800';

  return (
    <div className={`relative inline-block font-mono text-xs ${className}`} ref={menuRef}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          title="Download complete report in 1 click (PDF format)"
          className={`flex items-center gap-2 px-4 py-2 rounded-l transition-all cursor-pointer disabled:opacity-50 ${primaryBtnStyles}`}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : lastFormat ? (
            <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />
          ) : (
            <Download className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="font-bold tracking-tight">
            {isExporting ? 'Generating Report...' : lastFormat ? `${lastFormat} Downloaded` : label}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting}
          aria-expanded={isOpen}
          aria-label="Choose report download format"
          title="Choose report format (.pdf, .md, .docx, .json, .txt)"
          className={`px-2.5 py-2 rounded-r transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center ${chevronBtnStyles}`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {errorMessage && (
        <div className="absolute top-full left-0 mt-1 px-2.5 py-1 rounded bg-rose-950 border border-rose-500 text-rose-200 text-[10px] z-50 whitespace-nowrap shadow-lg">
          {errorMessage}
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 bg-[#10100d] border border-neutral-800 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-[#6d6d61]">
            Select Report Format
          </div>

          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-3.5 py-2 text-[#f1f1e8] hover:text-[#faff69] hover:bg-[#16160f] transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#faff69]" />
              <span className="font-semibold">Print-Ready PDF</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">.pdf</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('md')}
            className="w-full text-left px-3.5 py-2 text-[#f1f1e8] hover:text-[#faff69] hover:bg-[#16160f] transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold">Markdown Report</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">.md</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('docx')}
            className="w-full text-left px-3.5 py-2 text-[#f1f1e8] hover:text-[#faff69] hover:bg-[#16160f] transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">Word Document</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">.docx</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('json')}
            className="w-full text-left px-3.5 py-2 text-[#f1f1e8] hover:text-[#faff69] hover:bg-[#16160f] transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <File className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold">Raw Audit Dossier</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">.json</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('txt')}
            className="w-full text-left px-3.5 py-2 text-[#f1f1e8] hover:text-[#faff69] hover:bg-[#16160f] transition-colors cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold">Plain Text Summary</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">.txt</span>
          </button>
        </div>
      )}
    </div>
  );
};
