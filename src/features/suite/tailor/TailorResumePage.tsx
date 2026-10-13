// ============================================================
// HIREFLOW AI RESUME TAILORING SAAS — MAIN APPLICATION PAGE
// Route: /tools/tailor
// 7-Stage Guided Pipeline + Knowledge Explorer + Privacy Center
// ============================================================

import React from 'react';
import { useTailorStore } from '../../../lib/tailor/store/tailorStore';
import { TailorHeader } from './components/TailorHeader';
import { StageAResumeUpload } from './components/StageAResumeUpload';
import { StageBJobDescription } from './components/StageBJobDescription';
import { StageCRequirements } from './components/StageCRequirements';
import { StageDEvidenceReview } from './components/StageDEvidenceReview';
import { StageETailoringPlan } from './components/StageETailoringPlan';
import { StageFResumeEditor } from './components/StageFResumeEditor';
import { StageGValidationExport } from './components/StageGValidationExport';
import { KnowledgeTab } from './components/KnowledgeTab';
import { DashboardHistoryTab } from './components/DashboardHistoryTab';
import { PrivacyTab } from './components/PrivacyTab';

export function TailorResumePage() {
  const { currentStage, activeTab } = useTailorStore();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <TailorHeader />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pipeline' && (
          <>
            {currentStage === 'resume' && <StageAResumeUpload />}
            {currentStage === 'job' && <StageBJobDescription />}
            {currentStage === 'requirements' && <StageCRequirements />}
            {currentStage === 'evidence' && <StageDEvidenceReview />}
            {currentStage === 'strategy' && <StageETailoringPlan />}
            {currentStage === 'editor' && <StageFResumeEditor />}
            {currentStage === 'export' && <StageGValidationExport />}
          </>
        )}

        {activeTab === 'knowledge' && <KnowledgeTab />}
        {activeTab === 'dashboard' && <DashboardHistoryTab />}
        {activeTab === 'privacy' && <PrivacyTab />}
      </main>
    </div>
  );
}
