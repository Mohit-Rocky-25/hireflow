// ============================================================
// HireFlow — Phase 11.1 Zone A: Structure, Target & Section Rail
// ============================================================

import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Briefcase,
  Target,
  Sparkles,
  FileText,
  Edit3,
  Check,
} from 'lucide-react';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useTailorWorkspaceStore } from '../store/useTailorWorkspaceStore';
import type { TailorMode, TailorWorkspaceSession } from '../model/tailorWorkspaceTypes';

interface TailorStructureRailProps {
  session: TailorWorkspaceSession;
}

export function TailorStructureRail({ session }: TailorStructureRailProps) {
  const savedJds = useSavedJdStore((s) => s.jds);
  const {
    setMode,
    setTargetContext,
    moveSection,
    toggleSectionVisibility,
    renameSection,
    addCustomSection,
    removeSection,
  } = useTailorWorkspaceStore();

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitleDraft, setSectionTitleDraft] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const sortedSections = [...session.document.sections].sort((a, b) => a.order - b.order);

  const modes: Array<{ id: TailorMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'improve', label: 'Improve', icon: Sparkles },
    { id: 'role', label: 'Role Fit', icon: Target },
    { id: 'jd', label: 'Target JD', icon: Briefcase },
  ];

  return (
    <aside
      aria-label="Resume Structure and Target Controls"
      className="bg-[#10100d] border border-[#24241c] rounded-2xl p-4 space-y-5 h-fit"
    >
      {/* Source Lineage Summary */}
      <div className="space-y-1.5 border-b border-[#24241c] pb-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61]">
          Source Lineage
        </div>
        <div className="text-xs font-semibold text-[#f1f1e8] flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#faff69]" />
          <span className="truncate">{session.resumeLabel}</span>
        </div>
        <div className="text-[11px] text-[#9b9b8c]">
          Origin: <span className="text-[#f1f1e8]">{session.entrySource.replace(/_/g, ' ')}</span>
          {session.dualJdComparisonId && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#1b1b15] text-[#faff69]">
              Dual-JD
            </span>
          )}
          {session.talentLensAssessmentId && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#1b1b15] text-[#faff69]">
              TalentLens
            </span>
          )}
        </div>
      </div>

      {/* Mode Selector */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61]">
          Engineering Mode
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = session.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(m.id)}
                className={`px-2 py-2 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 border transition-colors ${
                  active
                    ? 'border-[#faff69] bg-[#1a1a10] text-[#faff69]'
                    : 'border-[#24241c] bg-[#0a0a08] text-[#9b9b8c] hover:text-[#f1f1e8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode 2 / Mode 3 Target Inputs */}
      {session.mode !== 'improve' && (
        <div className="space-y-2.5 border-t border-[#24241c] pt-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61]">
            Target Context
          </div>
          <input
            type="text"
            value={session.targetRole}
            onChange={(e) => void setTargetContext({ targetRole: e.target.value })}
            placeholder="Target Role (e.g., Backend Engineer)"
            aria-label="Target Role"
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
          />
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={session.targetSeniority}
              onChange={(e) => void setTargetContext({ targetSeniority: e.target.value })}
              placeholder="Level (Intern/Sr)"
              aria-label="Target Seniority"
              className="px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
            />
            <input
              type="text"
              value={session.targetIndustry}
              onChange={(e) => void setTargetContext({ targetIndustry: e.target.value })}
              placeholder="Domain / Track"
              aria-label="Target Industry"
              className="px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
            />
          </div>

          {session.mode === 'jd' && (
            <div className="space-y-2 pt-1">
              {savedJds.length > 0 && (
                <select
                  value={session.jdId || ''}
                  onChange={(e) => {
                    const jd = savedJds.find((j) => j.id === e.target.value);
                    if (jd) {
                      void setTargetContext({
                        jdId: jd.id,
                        jdTitle: jd.title,
                        jdCompany: jd.company || '',
                        jdText: jd.text,
                      });
                    }
                  }}
                  aria-label="Load saved job description"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
                >
                  <option value="">Switch to a saved JD...</option>
                  {savedJds.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} {j.company ? `(${j.company})` : ''}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                value={session.jdText}
                onChange={(e) => void setTargetContext({ jdText: e.target.value })}
                rows={4}
                placeholder="Paste or refine target Job Description..."
                aria-label="Target Job Description text"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
              />
            </div>
          )}
        </div>
      )}

      {/* Section Organizer */}
      <div className="space-y-2 border-t border-[#24241c] pt-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6d6d61]">
            Document Sections ({sortedSections.length})
          </span>
        </div>

        <ul className="space-y-1.5">
          {sortedSections.map((sec, idx) => (
            <li
              key={sec.id}
              className={`p-2 rounded-lg border text-xs ${
                sec.visible
                  ? 'border-[#24241c] bg-[#0a0a08] text-[#f1f1e8]'
                  : 'border-[#1b1b15] bg-[#0a0a08]/50 text-[#6d6d61]'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                {editingSectionId === sec.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      autoFocus
                      aria-label={`Rename section ${sec.title}`}
                      value={sectionTitleDraft}
                      onChange={(e) => setSectionTitleDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingSectionId(null);
                      }}
                      className="flex-1 px-1.5 py-0.5 rounded bg-[#141410] border border-[#faff69]/50 text-xs text-[#f1f1e8]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        renameSection(sec.id, sectionTitleDraft);
                        setEditingSectionId(null);
                      }}
                      aria-label="Save section title"
                      className="p-1 text-[#faff69]"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="font-medium truncate flex-1">{sec.title}</span>
                )}

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSection(sec.id, 'up')}
                    aria-label={`Move ${sec.title} up`}
                    className="p-1 text-[#6d6d61] hover:text-[#f1f1e8] disabled:opacity-25"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sortedSections.length - 1}
                    onClick={() => moveSection(sec.id, 'down')}
                    aria-label={`Move ${sec.title} down`}
                    className="p-1 text-[#6d6d61] hover:text-[#f1f1e8] disabled:opacity-25"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSectionId(sec.id);
                      setSectionTitleDraft(sec.title);
                    }}
                    aria-label={`Rename ${sec.title}`}
                    className="p-1 text-[#6d6d61] hover:text-[#f1f1e8]"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSectionVisibility(sec.id)}
                    aria-label={sec.visible ? `Hide ${sec.title}` : `Show ${sec.title}`}
                    className="p-1 text-[#6d6d61] hover:text-[#faff69]"
                  >
                    {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                  {sortedSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        confirmRemoveId === sec.id
                          ? (removeSection(sec.id), setConfirmRemoveId(null))
                          : setConfirmRemoveId(sec.id)
                      }
                      aria-label={
                        confirmRemoveId === sec.id
                          ? `Confirm remove ${sec.title}`
                          : `Remove ${sec.title}`
                      }
                      className={`p-1 ${
                        confirmRemoveId === sec.id
                          ? 'text-[#ff6b4a] font-bold'
                          : 'text-[#6d6d61] hover:text-[#ff8a70]'
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              {confirmRemoveId === sec.id && (
                <div role="status" className="mt-1.5 text-[10px] text-[#ffb4a2] flex items-center justify-between">
                  <span>Click trash again to confirm removal</span>
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveId(null)}
                    className="underline text-[#9b9b8c]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Add Custom Section */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newSectionTitle.trim()) return;
            addCustomSection(newSectionTitle.trim());
            setNewSectionTitle('');
          }}
          className="flex items-center gap-1.5 pt-1"
        >
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Add section (e.g., Publications)"
            aria-label="New custom section title"
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0a0a08] border border-[#24241c] text-xs text-[#f1f1e8]"
          />
          <button
            type="submit"
            disabled={!newSectionTitle.trim()}
            aria-label="Add custom section"
            className="p-1.5 rounded-lg border border-[#24241c] text-[#faff69] hover:border-[#faff69]/60 disabled:opacity-30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
