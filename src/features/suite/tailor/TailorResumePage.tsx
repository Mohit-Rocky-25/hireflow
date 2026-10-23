// ============================================================
// HIREFLOW AI RESUME TAILORING SAAS — MAIN APPLICATION PAGE
// Route: /tools/tailor
// Dark UI Handmade Resume Editor with Google XYZ standard elevation & live A4 canvas
// ============================================================

import React, { useState } from 'react';
import { useTailorStore } from '../../../lib/tailor/store/tailorStore';
import { DarkTailorHeader } from './components/DarkTailorHeader';
import { HandmadeResumeEditor } from './components/HandmadeResumeEditor';
import { DarkPaperPreview } from './components/DarkPaperPreview';
import { DirectInputModal } from './components/DirectInputModal';
import { MakeItBetterModal } from './components/MakeItBetterModal';
import { MakeItBetterResult } from '../../../lib/tailor/engine/makeItBetterEngine';
import { Sparkles, Zap, FileText, CheckCircle2 } from 'lucide-react';

export function TailorResumePage() {
  const { activeProject } = useTailorStore();
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isMakeItBetterModalOpen, setIsMakeItBetterModalOpen] = useState(false);
  const [makeItBetterResult, setMakeItBetterResult] = useState<MakeItBetterResult | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Handmade Resume Editor
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-volt/10 text-volt border border-volt/30 uppercase">
                Live Dynamic Sync
              </span>
            </div>
            <p className="text-xs text-secondary mt-1 max-w-2xl leading-relaxed">
              Craft, polish, and tailor your resume in real time. Features bold subheadings, Google XYZ accomplishment formulas, verified metric locking, and 1-page overflow protection.
            </p>
          </div>

          {/* Mobile Switcher (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center p-1 bg-surface border border-border rounded self-start">
            <button
              onClick={() => setMobileTab('editor')}
              className={`px-4 py-1.5 text-xs font-mono font-bold rounded transition cursor-pointer ${
                mobileTab === 'editor' ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' : 'text-muted hover:text-foreground'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-4 py-1.5 text-xs font-mono font-bold rounded transition cursor-pointer ${
                mobileTab === 'preview' ? 'bg-volt text-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]' : 'text-muted hover:text-foreground'
              }`}
            >
              Paper Canvas
            </button>
          </div>
        </div>

        {/* Desktop Split View: Editor (Left) & Live Canvas (Right) */}
        {resume && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
            {/* Left Column: Handmade Editor */}
            <div className={`lg:col-span-7 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
              <HandmadeResumeEditor />
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
