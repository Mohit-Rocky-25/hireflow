import React, { useEffect, useState } from 'react';
import { useResumeStore } from './useResumeStore';
import type { Uuid, TextSnapshot } from '@/domain/types';
import { FileText, ChevronDown } from 'lucide-react';

interface ResumePickerProps {
  onSelectResume: (text: string, meta: { workspaceId: Uuid | null; versionId: Uuid | null; label: string }) => void;
  className?: string;
}

export const ResumePicker: React.FC<ResumePickerProps> = ({ onSelectResume, className = '' }) => {
  const { workspaces, versions, activeWorkspaceId, getHeadSnapshot } = useResumeStore();
  const [selectedVersionId, setSelectedVersionId] = useState<string>('custom');

  const activeWorkspaces = Object.values(workspaces).filter((w) => !w.archivedAt);

  useEffect(() => {
    // Default to active workspace head if available
    if (activeWorkspaceId && workspaces[activeWorkspaceId]?.headVersionId) {
      const headId = workspaces[activeWorkspaceId].headVersionId!;
      setSelectedVersionId(headId);
      void getHeadSnapshot(activeWorkspaceId).then((snap) => {
        if (snap) {
          const ws = workspaces[activeWorkspaceId];
          const ver = versions[headId];
          onSelectResume(snap.text, {
            workspaceId: activeWorkspaceId,
            versionId: headId,
            label: `${ws?.name || 'Workspace'} / ${ver?.label || 'Head'}`,
          });
        }
      });
    }
  }, [activeWorkspaceId]);

  const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedVersionId(val);

    if (val === 'custom') {
      onSelectResume('', { workspaceId: null, versionId: null, label: 'Custom Resume' });
      return;
    }

    const version = versions[val];
    if (version) {
      const ws = workspaces[version.workspaceId];
      const snap = await useResumeStore.getState().getHeadSnapshot(version.workspaceId);
      if (snap) {
        onSelectResume(snap.text, {
          workspaceId: version.workspaceId,
          versionId: version.id,
          label: `${ws?.name || 'Workspace'} / ${version.label}`,
        });
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <label htmlFor="resume-picker-select" className="sr-only">Choose Resume</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            id="resume-picker-select"
            value={selectedVersionId}
            onChange={handleSelectChange}
            aria-label="Choose Resume"
            className="w-full appearance-none px-3 py-1.5 pr-8 text-xs font-mono rounded border border-neutral-800 bg-[#10100d] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#faff69] cursor-pointer"
          >
            {activeWorkspaces.length > 0 ? (
              activeWorkspaces.map((ws) => {
                const wsVersions = Object.values(versions).filter((v) => v.workspaceId === ws.id);
                return (
                  <optgroup key={ws.id} label={ws.name + (ws.isPrimary ? ' (Primary)' : '')}>
                    {wsVersions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {ws.name} / {v.label} {v.id === ws.headVersionId ? '(Head)' : ''}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            ) : null}
            <option value="custom">Paste / Upload custom resume</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
