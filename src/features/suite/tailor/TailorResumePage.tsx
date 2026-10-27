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
import { Sparkles, Zap, FileText, CheckCircle2, Target, X } from 'lucide-react';

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

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;

  const targetFocus = focusParam || bulletParam;

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col selection:bg-volt selection:text-black relative">
      {/* Pinned Top Navigation */}
      <DarkTailorHeader
        onOpenInputModal={() => setIsInputModalOpen(true)}
        onOpenMakeItBetterModal={() => setIsMakeItBetterModalOpen(true)}
        onMakeItBetterResult={setMakeItBetterResult}
      />

      {/* Main Container */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6">
        {/* Subtle Page Intro Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Handmade Resume Editor
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-volt/10 text-volt border border-volt/30 uppercase tracking-wider">
                Live Dynamic Sync
              </span>
              <DataProvenanceModal triggerButtonText="Data Sources & Legal Shield" />
            </div>
            <p className="text-sm text-neutral-300 mt-1.5 max-w-2xl leading-relaxed font-medium">
              Craft, polish, and tailor your resume in real time. Features bold subheadings, Google XYZ accomplishment formulas, verified metric locking, and 1-page overflow protection.
            </p>
          </div>

          {/* Mobile Switcher (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center p-1 bg-surface border border-border rounded self-start">
            <button
              onClick={() => setMobileTab('editor')}
              className={`px-4 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                mobileTab === 'editor' ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-4 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                mobileTab === 'preview' ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Paper Canvas
            </button>
          </div>
        </div>

        {/* Target Focus Imported Banner */}
        {targetFocus && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-near-black border border-volt/40 rounded-lg text-sm text-white animate-fade-in shadow-level-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-volt shrink-0 animate-ping" />
              <div>
                <span className="text-volt font-bold uppercase tracking-wider text-xs">🎯 Tailor Improvement Target:</span>{' '}
                <span className="text-white font-black underline decoration-volt decoration-2 text-base">{targetFocus}</span>
                <span className="text-neutral-300 ml-2 hidden md:inline text-xs font-medium">
                  {modeParam === 'upgrade'
                    ? '— Loaded for bullet elevation & XYZ quantification'
                    : '— Direct ATS requirement imported from Resume Checker'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('focus');
                next.delete('skill');
                next.delete('bullet');
                next.delete('mode');
                setSearchParams(next);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded bg-black hover:bg-hover-gray border border-charcoal hover:border-volt text-silver hover:text-white transition-colors cursor-pointer shrink-0"
              title="Clear focus and show all sections"
            >
              <X className="w-3.5 h-3.5 text-silver" />
              Clear Focus
            </button>
          </div>
        )}

        {/* Desktop Split View: Editor (Left) & Live Canvas (Right) */}
        {resume && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
            {/* Left Column: Handmade Editor */}
            <div className={`lg:col-span-7 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
              <HandmadeResumeEditor initialFocus={targetFocus} />
            </div>

            {/* Right Column: Live Paper Canvas */}
            <div className={`lg:col-span-5 lg:sticky lg:top-20 h-[calc(100vh-6.5rem)] ${mobileTab === 'editor' ? 'hidden lg:block' : ''}`}>
              <DarkPaperPreview resume={resume} candidate={candidate} className="h-full" />
            </div>
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
