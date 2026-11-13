import React, { useState } from 'react';
import type { AuditEntry } from '@/domain/types';
import { exportDossier, type DossierFormat } from './exportDossier';
import { Download, FileText, Loader2, ChevronDown, Check } from 'lucide-react';

interface ExportDossierButtonProps {
  audit: AuditEntry;
  resumeText?: string;
  jdText?: string;
  className?: string;
}

export const ExportDossierButton: React.FC<ExportDossierButtonProps> = ({
  audit,
  resumeText,
  jdText,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastFormat, setLastFormat] = useState<string | null>(null);

  const handleExport = async (format: DossierFormat) => {
    setIsExporting(true);
    setIsOpen(false);
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
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`relative inline-block font-mono text-xs ${className}`}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-l border border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : lastFormat ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isExporting ? 'Generating...' : lastFormat ? `${lastFormat} Ready` : 'Export Dossier'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting}
          aria-label="Choose export format"
          className="px-1.5 py-1.5 rounded-r border-t border-r border-b border-neutral-700 bg-[#141410] text-[#faff69] hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-[#10100d] border border-neutral-800 rounded shadow-2xl py-1 z-50">
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-3 py-2 text-neutral-300 hover:text-[#faff69] hover:bg-neutral-800/80 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>Print-Ready PDF</span>
            <span className="text-[10px] text-neutral-500">.pdf</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('docx')}
            className="w-full text-left px-3 py-2 text-neutral-300 hover:text-[#faff69] hover:bg-neutral-800/80 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>Word Document</span>
            <span className="text-[10px] text-neutral-500">.docx</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('json')}
            className="w-full text-left px-3 py-2 text-neutral-300 hover:text-[#faff69] hover:bg-neutral-800/80 transition-colors cursor-pointer flex items-center justify-between"
          >
            <span>Raw Dossier Data</span>
            <span className="text-[10px] text-neutral-500">.json</span>
          </button>
        </div>
      )}
    </div>
  );
};

