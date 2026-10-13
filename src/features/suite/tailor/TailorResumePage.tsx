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
import { Sparkles, Zap, FileText, CheckCircle2 } from 'lucide-react';

export function TailorResumePage() {
  const { activeProject } = useTailorStore();
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isMakeItBetterModalOpen, setIsMakeItBetterModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const resume = activeProject.tailoredResume;
  const candidate = activeProject.candidate;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-blue-500 selection:text-white relative">
      {/* Background Ambient Glow matching Career Trajectory */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-tr from-blue-600/15 via-violet-600/10 to-emerald-600/15 blur-3xl pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {/* Pinned Top Navigation */}
      <DarkTailorHeader
        onOpenInputModal={() => setIsInputModalOpen(true)}
        onOpenMakeItBetterModal={() => setIsMakeItBetterModalOpen(true)}
      />

      {/* Main Container */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6">
        {/* Subtle Page Intro Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-900">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Handmade Resume Editor
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Live Dynamic Sync
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Craft, polish, and tailor your resume in real time. Features bold subheadings, Google XYZ accomplishment formulas, verified metric locking, and 1-page overflow protection.
            </p>
          </div>

          {/* Mobile Switcher (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl self-start">
            <button
              onClick={() => setMobileTab('editor')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                mobileTab === 'editor' ? 'bg-blue-600 text-white' : 'text-neutral-400'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                mobileTab === 'preview' ? 'bg-blue-600 text-white' : 'text-neutral-400'
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
      />
    </div>
  );
}
