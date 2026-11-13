import React from 'react';
import type { AuditEntry } from '@/domain/types';
import { ExportDossierButton } from '@/features/dossier/ExportDossierButton';
import { X, ShieldCheck, Hash, ArrowLeft } from 'lucide-react';

interface InspectorHeaderProps {
  audit: AuditEntry;
  onClose: () => void;
  resumeText?: string;
  jdText?: string;
}

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  audit,
  onClose,
  resumeText,
  jdText,
}) => {
  const company = audit.jd.company || 'Unknown Company';
  const role = audit.jd.roleTitle || 'Target Role';
  const score = audit.overallScore;
  const delta = audit.delta?.overallDeltaPts ?? null;

  return (
    <header className="border-b border-neutral-800 bg-[#10100d] px-6 py-4 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Back button & Target info */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-700 bg-[#141410] text-neutral-300 hover:text-[#faff69] hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-100 text-sm">
                {company}
              </span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-300 text-sm">
                {role}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-800 text-neutral-400 border border-neutral-700">
                {audit.kind.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">
              Evaluated on {new Date(audit.createdAt).toLocaleString()} • Engine v{audit.engineVersion}
            </div>
          </div>
        </div>

        {/* Center: Snapshot Integrity Indicators */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-neutral-400 bg-[#090907] px-3 py-1.5 rounded border border-neutral-800">
          <div className="flex items-center gap-1.5" title={`Resume SHA-256: ${audit.resume.snapshotHash}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resume:</span>
            <span className="text-neutral-200">{audit.resume.snapshotHash.slice(0, 8)}...</span>
          </div>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-1.5" title={`JD SHA-256: ${audit.jd.snapshotHash}`}>
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span>JD:</span>
            <span className="text-neutral-200">{audit.jd.snapshotHash.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Right: Score Chip & Close */}
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-neutral-400 uppercase font-semibold">Fit:</span>
            <span className="text-xl font-bold text-neutral-100">{score}</span>
            <span className="text-xs text-neutral-500">/100</span>
            {delta !== null && delta !== 0 && (
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ml-1 ${
                  delta > 0
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}%
              </span>
            )}
          </div>

          <ExportDossierButton audit={audit} resumeText={resumeText} jdText={jdText} />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close inspector"
            className="p-1.5 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
