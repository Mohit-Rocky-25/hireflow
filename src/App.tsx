// ============================================================
// HireFlow v3 — Candidate Career Decision Suite (Client-Side)
// ============================================================
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Pathways Suite (C2 behind PATHWAYS_ENABLED)
import { FEATURES } from './config';
const PathwaysRadarPage = React.lazy(() => import('./pathways/pages/PathwaysRadarPage').then((m) => ({ default: m.PathwaysRadarPage })));
const ProgramDetailPage = React.lazy(() => import('./pathways/pages/ProgramDetailPage').then((m) => ({ default: m.ProgramDetailPage })));
const ActionPlanPage = React.lazy(() => import('./pathways/pages/ActionPlanPage').then((m) => ({ default: m.ActionPlanPage })));
const OfferEvaluatorPage = React.lazy(() => import('./pathways/pages/OfferEvaluatorPage').then((m) => ({ default: m.OfferEvaluatorPage })));
const AboutDataPage = React.lazy(() => import('./pathways/pages/AboutDataPage').then((m) => ({ default: m.AboutDataPage })));

// Overlays & Providers
import { ToastContainer } from './components/ui/Toast';
import { ProfileProvider } from './features/suite/profile/ProfileContext';
import { ProfileDrawer } from './features/suite/profile/components/ProfileDrawer';
import { LocalhostNavigator } from './components/common/LocalhostNavigator';
import { PwaUpdateToast } from './components/common/PwaUpdateToast';
import { OfflineIndicator } from './components/common/OfflineIndicator';

function RouteFallback() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-10 h-10 border-2 border-charcoal border-t-volt rounded-full animate-spin" />
      <span className="text-xs font-mono text-silver uppercase tracking-[1.4px]">Loading module...</span>
    </div>
  );
}

function RedirectWithSearch({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`${to}${location.search}`} replace />;
}

export default function App() {
  const { initDemoData, _initialized } = useStore();
  const [appReady, setAppReady] = useState(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        return window.sessionStorage.getItem('hf_seen_cinematic') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    if (!_initialized) {
      initDemoData();
    }
  }, [_initialized, initDemoData]);

  const handleLoadingFinish = useCallback(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem('hf_seen_cinematic', 'true');
      } catch {}
    }
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
            <Route path="/tools/credentials" element={<RedirectWithSearch to="/tools/credential-engine" />} />
            <Route path="/tools/opportunity-engine" element={<RedirectWithSearch to="/tools/credential-engine" />} />
            <Route path="/tools/resume-tailor" element={<RedirectWithSearch to="/tools/tailor" />} />
            <Route path="/tools/tailor-draft" element={<RedirectWithSearch to="/tools/tailor" />} />
            <Route path="/tools/project-briefs" element={<RedirectWithSearch to="/tools/build-briefs" />} />
            <Route path="/tools/briefs" element={<RedirectWithSearch to="/tools/build-briefs" />} />
            <Route path="/tools/tracker" element={<RedirectWithSearch to="/history" />} />
            <Route path="/tools/company-compare" element={<RedirectWithSearch to="/tools/jd-compare" />} />
            <Route path="/tools/offer-decoder" element={<RedirectWithSearch to="/tools/career-path/company-levels" />} />
            <Route path="/tools/resume-roaster" element={<RedirectWithSearch to="/tools/resume-checker" />} />
            <Route path="/tools/roaster" element={<RedirectWithSearch to="/tools/resume-checker" />} />
            <Route path="/tools/checker" element={<RedirectWithSearch to="/tools/resume-checker" />} />
            <Route path="/dev/careers-data" element={<CareersDataExplorer />} />
            <Route path="/data" element={<YourDataPage />} />
            <Route path="/settings" element={<RedirectWithSearch to="/data" />} />
            <Route path="/history" element={<ScanHistoryPage />} />
            <Route path="/jd-library" element={<SavedJdLibraryPage />} />
            <Route path="/tools/jd-library" element={<RedirectWithSearch to="/jd-library" />} />
            <Route path="/methodology" element={<MethodologyPage />} />
            <Route path="/tools/methodology" element={<RedirectWithSearch to="/methodology" />} />

            {/* Pathways Fresher Campus Intelligence Suite (C2 behind PATHWAYS_ENABLED) */}
            <Route path="/tools/pathways" element={FEATURES.PATHWAYS_ENABLED ? <PathwaysRadarPage /> : <Navigate to="/tools" replace />} />
            <Route path="/tools/pathways/program/:id" element={FEATURES.PATHWAYS_ENABLED ? <ProgramDetailPage /> : <Navigate to="/tools" replace />} />
            <Route path="/tools/pathways/plan" element={FEATURES.PATHWAYS_ENABLED ? <ActionPlanPage /> : <Navigate to="/tools" replace />} />
            <Route path="/tools/pathways/offers" element={FEATURES.PATHWAYS_ENABLED ? <OfferEvaluatorPage /> : <Navigate to="/tools" replace />} />
            <Route path="/tools/pathways/about-data" element={FEATURES.PATHWAYS_ENABLED ? <AboutDataPage /> : <Navigate to="/tools" replace />} />

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
