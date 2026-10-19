/**
 * HireFlow v4: Profile Resume Chip & Resume Selector (A1.2)
 * Consistent resume context bar across all candidate tools.
 * Displays "Using: <label> (change)", supports "this scan only" overrides,
 * and renders unified empty state when no resume is registered.
 */

import React, { useState } from 'react';
import { useProfileStore, ActiveResume } from '../../store/profileStore';
import { EmptyState } from './EmptyState';
import { Drawer } from './Drawer';
import { FileText, Check, Plus, Upload, RefreshCw } from 'lucide-react';
import { hashText } from '../../lib/safeUtils';
import { toast } from '../ui/Toast';

export interface ProfileResumeChipProps {
  onScanOnlyResumeChange?: (temporaryResume: ActiveResume | null) => void;
  activeOverride?: ActiveResume | null;
}

export function ProfileResumeChip({
  onScanOnlyResumeChange,
  activeOverride,
}: ProfileResumeChipProps) {
  const { activeResume, resumeVersions, setActiveResume, addResumeVersion } = useProfileStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newResumeText, setNewResumeText] = useState('');
  const [newResumeLabel, setNewResumeLabel] = useState('');

  const currentEffective = activeOverride || activeResume;

  const handleSelectVersion = (versionId: string) => {
    const selected = resumeVersions.find((v) => v.id === versionId);
    if (selected) {
      setActiveResume({
        versionId: selected.id,
        label: selected.label,
        ledger: selected.ledger,
        textHash: selected.textHash,
        updatedAt: selected.updatedAt,
      });
      if (onScanOnlyResumeChange) {
        onScanOnlyResumeChange(null); // clear scan-only override
      }
      setDrawerOpen(false);
      toast('info', `Switched active resume to "${selected.label}"`);
    }
  };

  const handleUseThisScanOnly = (versionId: string) => {
    const selected = resumeVersions.find((v) => v.id === versionId);
    if (selected && onScanOnlyResumeChange) {
      onScanOnlyResumeChange({
        versionId: selected.id,
        label: `${selected.label} (This scan only)`,
        ledger: selected.ledger,
        textHash: selected.textHash,
        updatedAt: selected.updatedAt,
      });
      setDrawerOpen(false);
      toast('info', `Using "${selected.label}" for this scan only. Profile unchanged.`);
    }
  };

  const handleAddNewResume = () => {
    if (!newResumeText.trim()) {
      toast('warning', 'Please paste resume text before saving.');
      return;
    }
    const label = newResumeLabel.trim() || `Resume ${resumeVersions.length + 1}`;
    const hash = hashText(newResumeText);
    const ledger = { rawText: newResumeText, addedAt: new Date().toISOString() };

    const newId = addResumeVersion(label, ledger, hash);
    if (!newId) {
      toast('warning', 'Maximum number of resume versions (5) reached. Please delete an older version.');
      return;
    }

    setNewResumeText('');
    setNewResumeLabel('');
    setDrawerOpen(false);
    toast('success', `Added and selected resume "${label}".`);
  };

  // If no resume exists in profile, render unified empty state
  if (!currentEffective) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 my-4">
        <EmptyState
          title="No Resume Added Yet"
          message="Add your engineering resume once to use it across ATS Roaster, JD Compare, Tailor, and Career Trajectory."
          actionLabel="Add Your Resume"
          onAction={() => setDrawerOpen(true)}
        />
        {/* Modal for adding resume */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Add Your Resume"
          description="Paste plain text from Word, PDF, or LinkedIn"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Resume Version Label</label>
              <input
                type="text"
                placeholder="e.g. SDE Fresher 2026, Core ECE"
                value={newResumeLabel}
                onChange={(e) => setNewResumeLabel(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Resume Text</label>
              <textarea
                rows={12}
                placeholder="Paste the full text of your resume here..."
                value={newResumeText}
                onChange={(e) => setNewResumeText(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddNewResume}
              className="w-full rounded-md bg-emerald-600 hover:bg-emerald-500 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              Save Resume to Profile
            </button>
          </div>
        </Drawer>
      </div>
    );
  }

  // Active resume exists: render compact context chip
  return (
    <>
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs text-slate-300 shadow-sm">
        <FileText className="h-3.5 w-3.5 text-emerald-400" />
        <span>
          Using: <strong className="text-white font-medium">{currentEffective.label}</strong>
        </span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="ml-1 text-emerald-400 hover:text-emerald-300 underline font-medium focus:outline-none"
        >
          (change)
        </button>
      </div>

      {/* Switcher & Manager Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Active Resume"
        description="Choose which resume version to use for candidate tools"
      >
        <div className="space-y-5 text-xs">
          {/* Version list */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Saved Versions ({resumeVersions.length}/5)
            </h4>
            <div className="space-y-2">
              {resumeVersions.map((v) => {
                const isSelected = activeResume?.versionId === v.id;
                return (
                  <div
                    key={v.id}
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-emerald-600/70 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{v.label}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] bg-emerald-900/60 text-emerald-300">
                            <Check className="h-2.5 w-2.5" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-slate-400 text-[11px] font-mono">
                        Hash: {v.textHash.slice(0, 16)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSelected && (
                        <button
                          type="button"
                          onClick={() => handleSelectVersion(v.id)}
                          className="rounded px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
                        >
                          Make Active
                        </button>
                      )}
                      {onScanOnlyResumeChange && (
                        <button
                          type="button"
                          onClick={() => handleUseThisScanOnly(v.id)}
                          className="rounded px-2 py-1 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                          title="Use for this scan without modifying profile"
                        >
                          This scan only
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add new version */}
          {resumeVersions.length < 5 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Add Another Version
              </h4>
              <input
                type="text"
                placeholder="Version label (e.g. Backend Focus)"
                value={newResumeLabel}
                onChange={(e) => setNewResumeLabel(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <textarea
                rows={6}
                placeholder="Paste new resume text..."
                value={newResumeText}
                onChange={(e) => setNewResumeText(e.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-white font-mono placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddNewResume}
                className="w-full rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 py-2 text-xs font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Version</span>
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
