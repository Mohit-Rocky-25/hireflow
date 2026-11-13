import React, { useState } from 'react';
import type { ResumeVersion, Uuid } from '@/domain/types';
import { GitBranch, Check, Eye, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHandoffStore } from '@/features/handoff/useHandoffStore';

interface ResumeLineageProps {
  workspaceId: Uuid;
  versions: ResumeVersion[];
  headVersionId: Uuid | null;
  onSetHead: (versionId: Uuid) => void;
  onSelectVersion: (version: ResumeVersion) => void;
  onBranch: (version: ResumeVersion) => void;
  onCompare: (v1: ResumeVersion, v2: ResumeVersion) => void;
}

export const ResumeLineage: React.FC<ResumeLineageProps> = ({
  workspaceId,
  versions,
  headVersionId,
  onSetHead,
  onSelectVersion,
  onBranch,
  onCompare,
}) => {
  const navigate = useNavigate();
  const setHandoff = useHandoffStore((s) => s.set);
  const [selectedForCompare, setSelectedForCompare] = useState<ResumeVersion | null>(null);

  const sortedVersions = [...versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleScanVersion = (version: ResumeVersion) => {
    setHandoff({
      from: '/portal/resumes',
      to: '/tools/resume-checker',
      resumeVersionId: version.id,
    });
    navigate('/tools/resume-checker');
  };

  if (sortedVersions.length === 0) {
    return (
      <div className="p-8 text-center text-neutral-500 font-mono text-xs">
        No versions recorded for this workspace.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-mono font-semibold text-neutral-400 uppercase tracking-wider mb-2">
        Version Lineage & Branches
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px before:bg-neutral-800">
        {sortedVersions.map((version) => {
          const isHead = version.id === headVersionId;
          const hash8 = version.snapshotHash.slice(0, 8);

          return (
            <div key={version.id} className="relative group">
              {/* Connector dot */}
              <div
                className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 transition-colors ${
                  isHead
                    ? 'bg-[#faff69] border-[#faff69]'
                    : 'bg-[#10100d] border-neutral-600 group-hover:border-neutral-400'
                }`}
              />

              <div className="bg-[#141410] border border-neutral-800 rounded p-4 text-xs font-mono">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-100">{version.label}</span>
                    {isHead && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                        HEAD
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 uppercase">
                      {version.source}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {new Date(version.createdAt).toLocaleDateString()} · <span className="font-mono text-neutral-400">{hash8}</span>
                  </div>
                </div>

                {version.note && (
                  <p className="text-[11px] text-neutral-400 mb-3 italic">
                    {version.note}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80 text-[11px]">
                  <button
                    onClick={() => onSelectVersion(version)}
                    className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View text
                  </button>

                  {!isHead && (
                    <button
                      onClick={() => onSetHead(version.id)}
                      className="inline-flex items-center gap-1 text-neutral-400 hover:text-[#faff69] transition-colors"
                    >
                      <Check className="w-3 h-3" /> Set as head
                    </button>
                  )}

                  <button
                    onClick={() => onBranch(version)}
                    className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                  >
                    <GitBranch className="w-3 h-3" /> Branch from here
                  </button>

                  <button
                    onClick={() => {
                      if (!selectedForCompare) {
                        setSelectedForCompare(version);
                      } else {
                        onCompare(selectedForCompare, version);
                        setSelectedForCompare(null);
                      }
                    }}
                    className={`inline-flex items-center gap-1 transition-colors ${
                      selectedForCompare?.id === version.id
                        ? 'text-[#faff69]'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {selectedForCompare?.id === version.id ? 'Select 2nd to compare' : 'Compare with...'}
                  </button>

                  <button
                    onClick={() => handleScanVersion(version)}
                    className="inline-flex items-center gap-1 text-[#faff69] hover:underline ml-auto"
                  >
                    <Play className="w-3 h-3" /> Scan this version
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
