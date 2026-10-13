// ============================================================
// HIREFLOW TAILOR HEADER
// Top navigation, stage pipeline stepper, preset selector, and view tabs
// ============================================================

import React from 'react';
import {
  FileText,
  Briefcase,
  CheckCircle2,
  SlidersHorizontal,
  Download,
  ShieldCheck,
  Search,
  History,
  Layers,
  Sparkles
} from 'lucide-react';
import { PipelineStage, AppViewTab, useTailorStore } from '../../../../lib/tailor/store/tailorStore';

const STAGES: { id: PipelineStage; label: string; step: string; icon: React.ElementType }[] = [
  { id: 'resume', label: '1. Resume', step: 'A', icon: FileText },
  { id: 'job', label: '2. Job Description', step: 'B', icon: Briefcase },
  { id: 'requirements', label: '3. Requirements', step: 'C', icon: Layers },
  { id: 'evidence', label: '4. Evidence Mapping', step: 'D', icon: CheckCircle2 },
  { id: 'strategy', label: '5. Strategy Plan', step: 'E', icon: SlidersHorizontal },
  { id: 'editor', label: '6. Editor & Preview', step: 'F', icon: Sparkles },
  { id: 'export', label: '7. Validate & Export', step: 'G', icon: Download }
];

export function TailorHeader() {
  const { currentStage, setStage, activeTab, setActiveTab, activeProject, loadPresetFixture } = useTailorStore();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Bar: Title, Presets, and Main View Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                HireFlow Resume Tailor
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Truth-Locked
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activeProject.candidate.fullName} &bull; {activeProject.job.title} ({activeProject.job.company})
            </p>
          </div>
        </div>

        {/* View Switcher & Demo Presets */}
        <div className="flex items-center gap-2">
          {/* Quick Preset Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
            <span className="text-slate-500 font-medium px-2 text-[11px]">Demo Profiles:</span>
            <button
              onClick={() => loadPresetFixture('fresher')}
              className="px-2.5 py-1 rounded-md font-medium text-slate-700 hover:bg-white hover:shadow-xs transition"
              title="ECE Fresher with CGPA, college projects, and internships"
            >
              🎓 College Fresher
            </button>
            <button
              onClick={() => loadPresetFixture('security')}
              className="px-2.5 py-1 rounded-md font-medium text-slate-700 hover:bg-white hover:shadow-xs transition"
              title="Senior Cybersecurity Lead with CISSP and SOC experience"
            >
              🛡️ Security Lead
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Tailor Pipeline
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'knowledge'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Knowledge
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              History
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy
            </button>
          </nav>
        </div>
      </div>

      {/* Pipeline Stages Stepper (Visible when activeTab is pipeline) */}
      {activeTab === 'pipeline' && (
        <div className="bg-slate-50/75 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[700px] gap-2">
            {STAGES.map((s, idx) => {
              const isActive = currentStage === s.id;
              const isPast = STAGES.findIndex(item => item.id === currentStage) > idx;

              return (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : isPast
                      ? 'text-slate-800 hover:bg-slate-200/70'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isPast ? '✓' : s.step}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
