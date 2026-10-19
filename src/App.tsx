// ============================================================
// HireFlow v3 — Candidate Career Decision Suite (Client-Side)
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useStore } from './store/useStore';
import { CinematicLoader } from './components/Loader/CinematicLoader';

// Lazy-loaded Pages & Tools (C13: Code-splitting)
const LandingPage = React.lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const MatchingDemo = React.lazy(() => import('./pages/demo/MatchingDemo').then((m) => ({ default: m.MatchingDemo })));
const CompanyRolesPage = React.lazy(() => import('./pages/demo/CompanyRolesPage').then((m) => ({ default: m.CompanyRolesPage })));

const ResumeChecker = React.lazy(() => import('./pages/tools/ResumeChecker').then((m) => ({ default: m.ResumeChecker })));
const CareerPathHub = React.lazy(() => import('./pages/tools/career-path/CareerPathHub').then((m) => ({ default: m.CareerPathHub })));
const DreamJobRoadmapPage = React.lazy(() => import('./pages/tools/career-path/DreamJobRoadmapPage').then((m) => ({ default: m.DreamJobRoadmapPage })));
const CompanyLevelsPage = React.lazy(() => import('./pages/tools/career-path/CompanyLevelsPage').then((m) => ({ default: m.CompanyLevelsPage })));
const TalentLens = React.lazy(() => import('./pages/tools/TalentLens').then((m) => ({ default: m.TalentLens })));
const ToolsHubPage = React.lazy(() => import('./pages/tools/ToolsHubPage').then((m) => ({ default: m.ToolsHubPage })));
const CompareJDsPage = React.lazy(() => import('./features/suite/compare/CompareJDsPage').then((m) => ({ default: m.CompareJDsPage })));
const TailorResumePage = React.lazy(() => import('./features/suite/tailor/TailorResumePage').then((m) => ({ default: m.TailorResumePage })));
const ReachOutPage = React.lazy(() => import('./features/suite/outreach/ReachOutPage').then((m) => ({ default: m.ReachOutPage })));
const BuildBriefsPage = React.lazy(() => import('./features/suite/briefs/BuildBriefsPage').then((m) => ({ default: m.BuildBriefsPage })));
const CredentialOpportunityEnginePage = React.lazy(() => import('./features/suite/credentials/CredentialOpportunityEnginePage').then((m) => ({ default: m.CredentialOpportunityEnginePage })));
const CareersDataExplorer = React.lazy(() => import('./careers-core/dev/CareersDataExplorer').then((m) => ({ default: m.CareersDataExplorer })));
const YourDataPage = React.lazy(() => import('./pages/data/YourDataPage').then((m) => ({ default: m.YourDataPage })));
const ScanHistoryPage = React.lazy(() => import('./pages/history/ScanHistoryPage').then((m) => ({ default: m.ScanHistoryPage })));
const SavedJdLibraryPage = React.lazy(() => import('./pages/jd-library/SavedJdLibraryPage').then((m) => ({ default: m.SavedJdLibraryPage })));
const MethodologyPage = React.lazy(() => import('./pages/methodology/MethodologyPage'));

// Overlays & Providers
import { ToastContainer } from './components/ui/Toast';
import { ProfileProvider } from './features/suite/profile/ProfileContext';
import { ProfileDrawer } from './features/suite/profile/components/ProfileDrawer';
import { LocalhostNavigator } from './components/common/LocalhostNavigator';
import { PwaUpdateToast } from './components/common/PwaUpdateToast';
import { OfflineIndicator } from './components/common/OfflineIndicator';

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading module...</span>
    </div>
  );
}

export default function App() {
  const { initDemoData, _initialized } = useStore();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!_initialized) {
      initDemoData();
    }
  }, [_initialized, initDemoData]);

  const handleLoadingFinish = useCallback(() => {
    setAppReady(true);
  }, []);

  return (
    <>
      {!appReady && <CinematicLoader onFinish={handleLoadingFinish} isAppReady={_initialized} />}
      <ProfileProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public Landing & Interactive Company Demo */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<MatchingDemo />} />
            <Route path="/demo/company/:companySlug" element={<CompanyRolesPage />} />

            {/* Free ATS & Career Decision Suite Tools */}
            <Route path="/tools" element={<ToolsHubPage />} />
            <Route path="/tools/resume-checker" element={<ResumeChecker />} />
            <Route path="/tools/jd-compare" element={<CompareJDsPage />} />
            <Route path="/tools/tailor" element={<TailorResumePage />} />
            <Route path="/tools/reach-out" element={<ReachOutPage />} />
            <Route path="/tools/build-briefs" element={<BuildBriefsPage />} />
            <Route path="/tools/career-path" element={<CareerPathHub />} />
            <Route path="/tools/career-path/dream-job-roadmap" element={<DreamJobRoadmapPage />} />
            <Route path="/tools/career-path/company-levels" element={<CompanyLevelsPage />} />
            <Route path="/tools/career-path/promotion-simulator" element={<Navigate to="/tools/career-path/dream-job-roadmap" replace />} />
            <Route path="/tools/career-path/company-ladder" element={<Navigate to="/tools/career-path/company-levels" replace />} />
            <Route path="/tools/career-path/simulator" element={<Navigate to="/tools/career-path/dream-job-roadmap" replace />} />
            <Route path="/tools/career-path/explorer" element={<Navigate to="/tools/career-path/company-levels" replace />} />
            <Route path="/tools/talent-lens" element={<TalentLens />} />
            <Route path="/tools/credential-engine" element={<CredentialOpportunityEnginePage />} />
            <Route path="/tools/credentials" element={<Navigate to="/tools/credential-engine" replace />} />
            <Route path="/tools/opportunity-engine" element={<Navigate to="/tools/credential-engine" replace />} />
            <Route path="/dev/careers-data" element={<CareersDataExplorer />} />
            <Route path="/data" element={<YourDataPage />} />
            <Route path="/settings" element={<Navigate to="/data" replace />} />
            <Route path="/history" element={<ScanHistoryPage />} />
            <Route path="/jd-library" element={<SavedJdLibraryPage />} />
            <Route path="/tools/jd-library" element={<Navigate to="/jd-library" replace />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/tools/methodology" element={<Navigate to="/methodology" replace />} />

            {/* Legacy Fallbacks (graceful redirects for old bookmarks) */}
            <Route path="/portal/*" element={<Navigate to="/tools" replace />} />
            <Route path="/portal" element={<Navigate to="/tools" replace />} />
            <Route path="/company/*" element={<Navigate to="/tools" replace />} />
            <Route path="/company" element={<Navigate to="/tools" replace />} />
            <Route path="/interviewer/*" element={<Navigate to="/tools" replace />} />
            <Route path="/interviewer" element={<Navigate to="/tools" replace />} />
            <Route path="/admin/*" element={<Navigate to="/tools" replace />} />
            <Route path="/admin" element={<Navigate to="/tools" replace />} />
            <Route path="/candidate/*" element={<Navigate to="/tools" replace />} />
            <Route path="/candidate" element={<Navigate to="/tools" replace />} />
            <Route path="/login" element={<Navigate to="/tools" replace />} />
            <Route path="/register" element={<Navigate to="/tools" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ProfileDrawer />
          <ToastContainer />
          <LocalhostNavigator />
          <PwaUpdateToast />
          <OfflineIndicator />
        </BrowserRouter>
      </ProfileProvider>
    </>
  );
}
