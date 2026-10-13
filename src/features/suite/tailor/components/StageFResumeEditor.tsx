// ============================================================
// STAGE F — STRUCTURED RESUME EDITOR & LIVE PREVIEW
// Desktop split workspace, section reordering, bullet inline edits, and template switcher
// ============================================================

import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit2,
  Check,
  Sliders,
  FileCheck2,
  BookmarkPlus
} from 'lucide-react';
import { useTailorStore } from '../../../../lib/tailor/store/tailorStore';
import { PaperPreview } from './PaperPreview';
import { ResumeTemplateId, TailoredSection } from '../../../../lib/tailor/types';

export function StageFResumeEditor() {
  const {
    activeProject,
    setStage,
    updateBulletText,
    toggleSectionVisibility,
    reorderSections,
    setTemplate,
    setLayoutSetting,
    saveProjectSnapshot
  } = useTailorStore();

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;

  const [activeTabMobile, setActiveTabMobile] = useState<'editor' | 'preview'>('editor');
  const [editingBulletId, setEditingBulletId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [saveToast, setSaveToast] = useState<boolean>(false);

  if (!resume) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <p className="text-sm text-slate-500">No tailored resume generated yet.</p>
      </div>
    );
  }

  const handleStartEdit = (bulletId: string, currentText: string) => {
    setEditingBulletId(bulletId);
    setEditingText(currentText);
  };

  const handleSaveBullet = (sectionId: string, entryId: string, bulletId: string) => {
    updateBulletText(sectionId, entryId, bulletId, editingText);
    setEditingBulletId(null);
  };

  const handleSaveSnapshot = () => {
    saveProjectSnapshot('Manual user checkpoint');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Switcher Toggle (Hidden on Desktop) */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-slate-200 rounded-xl">
        <button
          onClick={() => setActiveTabMobile('editor')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            activeTabMobile === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Structured Content Editor
        </button>
        <button
          onClick={() => setActiveTabMobile('preview')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            activeTabMobile === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Live Paper Preview
        </button>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Structured Editor (7 Columns on Desktop) */}
        <div className={`lg:col-span-6 space-y-4 ${activeTabMobile === 'preview' ? 'hidden lg:block' : ''}`}>
          {/* Template & Layout Controls Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Template & Typography Controls
              </span>
              <button
                onClick={handleSaveSnapshot}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                title="Save Checkpoint Snapshot"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                {saveToast ? 'Saved!' : 'Save Version'}
              </button>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">
                ATS Design Template
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'modern', name: 'Modern', desc: 'Clean Inter accents' },
                  { id: 'classic', name: 'Classic', desc: 'Serif corporate' },
                  { id: 'compact', name: 'Compact', desc: 'Ultra-dense 1-page' },
                  { id: 'executive', name: 'Executive', desc: 'Leadership layout' }
                ].map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setTemplate(tmpl.id as ResumeTemplateId)}
                    className={`p-2 rounded-xl border text-left transition ${
                      resume.layoutSettings.template === tmpl.id
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{tmpl.name}</div>
                    <div className="text-[10px] text-slate-500">{tmpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Margins & Font Size Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Margins
                </label>
                <select
                  value={resume.layoutSettings.margins}
                  onChange={(e) => setLayoutSetting('margins', e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="tight">Tight (0.4 in - maximum density)</option>
                  <option value="standard">Standard (0.5 in - balanced)</option>
                  <option value="relaxed">Relaxed (0.65 in - spacious)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Font Scale
                </label>
                <select
                  value={resume.layoutSettings.fontSize}
                  onChange={(e) => setLayoutSetting('fontSize', e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="compact">Compact (9.5pt)</option>
                  <option value="standard">Standard (10pt)</option>
                  <option value="spacious">Spacious (10.5pt)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sections List with Reordering & Inline Bullet Edits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Sections & Tailored Bullets ({resume.sections.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Click bullet to edit
              </span>
            </div>

            {resume.sections.map((section: TailoredSection, secIdx: number) => (
              <div
                key={section.id}
                className={`bg-white rounded-2xl border transition-all ${
                  section.visible ? 'border-slate-200 shadow-xs' : 'border-slate-200/50 opacity-60 bg-slate-50'
                }`}
              >
                {/* Section Header with Reorder & Visibility Actions */}
                <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400">#{secIdx + 1}</span>
                    <span className="text-xs font-bold text-slate-900">{section.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => reorderSections(secIdx, Math.max(0, secIdx - 1))}
                      disabled={secIdx === 0}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition"
                      title="Move Section Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => reorderSections(secIdx, Math.min(resume.sections.length - 1, secIdx + 1))}
                      disabled={secIdx === resume.sections.length - 1}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition"
                      title="Move Section Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleSectionVisibility(section.id)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 transition"
                      title={section.visible ? 'Hide Section' : 'Show Section'}
                    >
                      {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Section Body */}
                {section.visible && (
                  <div className="p-4 space-y-3">
                    {section.content.summaryText && (
                      <p className="text-xs text-slate-700 font-mono leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {section.content.summaryText}
                      </p>
                    )}

                    {section.content.entries?.map((entry) => (
                      <div key={entry.id} className="space-y-2 border-b border-slate-100/80 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-bold text-slate-800">
                            {entry.primaryTitle} {entry.secondaryTitle ? `— ${entry.secondaryTitle}` : ''}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">{entry.dateRange}</span>
                        </div>

                        {/* Bullets List */}
                        <div className="space-y-1.5 pl-1">
                          {entry.bullets?.map((bullet) => {
                            const isEditing = editingBulletId === bullet.id;

                            return (
                              <div key={bullet.id} className="text-xs text-slate-700 group">
                                {isEditing ? (
                                  <div className="space-y-2 bg-indigo-50/50 p-2 rounded-xl border border-indigo-200">
                                    <textarea
                                      rows={3}
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      className="w-full text-xs font-mono p-2 bg-white rounded-lg border border-slate-300 focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setEditingBulletId(null)}
                                        className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded-md"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveBullet(section.id, entry.id, bullet.id)}
                                        className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 shadow-2xs"
                                      >
                                        <Check className="w-3 h-3" /> Save Changes
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => handleStartEdit(bullet.id, bullet.text)}
                                    className="p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer flex items-start justify-between gap-2 transition"
                                  >
                                    <span className="leading-relaxed">&bull; {bullet.text}</span>
                                    <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Action Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <button
              onClick={() => setStage('strategy')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Strategy Plan</span>
            </button>

            <button
              onClick={() => setStage('export')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Proceed to Factual Validation & Export</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Pane: Live WYSIWYG Paper Preview (6 Columns on Desktop) */}
        <div className={`lg:col-span-6 sticky top-24 h-[calc(100vh-120px)] ${activeTabMobile === 'editor' ? 'hidden lg:block' : ''}`}>
          <PaperPreview resume={resume} candidate={candidate} className="h-full" />
        </div>
      </div>
    </div>
  );
}
