// ============================================================
// HIREFLOW AI RESUME TAILORING SAAS — MAIN APPLICATION PAGE
// Route: /tools/tailor
// Dark UI Handmade Resume Editor with Google XYZ standard elevation & live A4 canvas
// ============================================================

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTailorStore } from '../../../lib/tailor/store/tailorStore';
import { DarkTailorHeader } from './components/DarkTailorHeader';
import { HandmadeResumeEditor } from './components/HandmadeResumeEditor';
import { DarkPaperPreview } from './components/DarkPaperPreview';
import { DirectInputModal } from './components/DirectInputModal';
import { MakeItBetterModal } from './components/MakeItBetterModal';
import { MakeItBetterResult } from '../../../lib/tailor/engine/makeItBetterEngine';
import { DataProvenanceModal } from '../../../components/common/DataProvenanceModal';
import { Sparkles, Zap, FileText, CheckCircle2, Target, X, Columns, Eye, Edit3 } from 'lucide-react';

export function TailorResumePage() {
  const { activeProject } = useTailorStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusParam = searchParams.get('focus') || searchParams.get('skill') || '';
  const bulletParam = searchParams.get('bullet') || '';
  const modeParam = searchParams.get('mode') || '';

  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isMakeItBetterModalOpen, setIsMakeItBetterModalOpen] = useState(false);
  const [makeItBetterResult, setMakeItBetterResult] = useState<MakeItBetterResult | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;

  const targetFocus = focusParam || bulletParam;

  return (
    // Viewport-locked shell: header + body fill exactly 100vh, nothing overflows at page level
    <div className="h-screen overflow-hidden bg-black text-foreground flex flex-col selection:bg-volt selection:text-black">
      {/* Pinned Top Navigation */}
      <DarkTailorHeader
        onOpenInputModal={() => setIsInputModalOpen(true)}
        onOpenMakeItBetterModal={() => setIsMakeItBetterModalOpen(true)}
        onMakeItBetterResult={setMakeItBetterResult}
      />

      {/* Main body — fills remaining height, no page-level scroll */}
      <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
        {/* Top bar: title + view switcher — fixed height, never scrolls */}
        <div className="shrink-0 px-4 sm:px-6 lg:px-8 pt-4 pb-3 border-b border-border">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Handmade Resume Editor
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-volt/10 text-volt border border-volt/30 uppercase tracking-wider">
                  Live Sync
                </span>
                <DataProvenanceModal triggerButtonText="Data Sources & Legal Shield" />
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed font-medium">
                Craft, polish, and tailor your resume in real time. Bold subheadings, Google XYZ formulas, verified metric locking, 1-page overflow protection.
              </p>
            </div>

            {/* Desktop & Mobile View Mode Switcher */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Switcher */}
              <div className="lg:hidden flex items-center p-1 bg-surface border border-border rounded">
                <button
                  type="button"
                  onClick={() => setMobileTab('editor')}
                  className={`px-4 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                    mobileTab === 'editor' ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('preview')}
                  className={`px-4 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                    mobileTab === 'preview' ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Canvas
                </button>
              </div>

              {/* Desktop View Switcher */}
              <div className="hidden lg:flex items-center p-0.5 bg-surface border border-charcoal rounded text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1.5 font-mono uppercase text-[11px] font-bold rounded transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'split' ? 'bg-volt text-black shadow-xs' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Side-by-side Editor & Paper Canvas"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1.5 font-mono uppercase text-[11px] font-bold rounded transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'editor' ? 'bg-volt text-black shadow-xs' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Focus on Full-Width Editor"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 font-mono uppercase text-[11px] font-bold rounded transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'preview' ? 'bg-volt text-black shadow-xs' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Focus on Full A4 Paper Canvas"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Canvas</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Target Focus Banner — shrinks away when not active */}
        {targetFocus && (
          <div className="shrink-0 px-4 sm:px-6 lg:px-8 py-2 border-b border-volt/20 bg-near-black/80">
            <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-white animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-volt shrink-0 animate-ping" />
                <div>
                  <span className="text-volt font-bold uppercase tracking-wider text-xs">🎯 Target:</span>{' '}
                  <span className="text-white font-black underline decoration-volt decoration-2">{targetFocus}</span>
                  <span className="text-neutral-400 ml-2 hidden md:inline text-xs">
                    {modeParam === 'upgrade' ? '— Bullet elevation' : '— ATS requirement imported'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('focus'); next.delete('skill'); next.delete('bullet'); next.delete('mode');
                  setSearchParams(next);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-silver hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3 h-3 text-silver" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── Workspace — fills ALL remaining height, no scroll at this level ── */}
        {resume && (
          <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-4 max-w-[1600px] mx-auto w-full flex flex-col">
            <div className={`flex-1 min-h-0 grid grid-cols-1 gap-4 ${
              viewMode === 'split' ? 'lg:grid-cols-[1fr_420px]' : 'lg:grid-cols-1'
            }`}>
              {/* Left Column: Handmade Editor — scrolls internally */}
              <div className={`min-h-0 overflow-y-auto ${
                viewMode === 'split' ? '' : viewMode === 'editor' ? 'w-full' : 'hidden'
              } ${mobileTab === 'preview' ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
                <HandmadeResumeEditor initialFocus={targetFocus} />
              </div>

              {/* Right Column: Live Paper Canvas — fixed height, no scroll */}
              <div className={`min-h-0 flex flex-col ${
                viewMode === 'split' ? '' : viewMode === 'preview' ? 'w-full' : 'hidden'
              } ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
                <DarkPaperPreview resume={resume} candidate={candidate} className="flex-1 min-h-0" />
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no resume loaded */}
        {!resume && (
          <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm font-mono">
            No resume loaded. Open the input modal to paste your JD and resume data.
          </div>
        )}
      </main>

      {/* Direct Input & Re-Analyze Modal */}
      <DirectInputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
      />

      {/* "Make It Better" Standards Upgrade Modal */}
      <MakeItBetterModal
        isOpen={isMakeItBetterModalOpen}
        onClose={() => setIsMakeItBetterModalOpen(false)}
        result={makeItBetterResult}
      />
    </div>
  );
}

