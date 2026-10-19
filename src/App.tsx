// ============================================================
// HireFlow v3 — Candidate Career Decision Suite (Client-Side)
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { CinematicLoader } from './components/Loader/CinematicLoader';

// Public & Demo Pages
import { LandingPage } from './pages/LandingPage';
import { MatchingDemo } from './pages/demo/MatchingDemo';
import { CompanyRolesPage } from './pages/demo/CompanyRolesPage';

// Candidate Career Decision Suite Tools
import { ResumeChecker } from './pages/tools/ResumeChecker';
import { CareerPathHub } from './pages/tools/career-path/CareerPathHub';
import { DreamJobRoadmapPage } from './pages/tools/career-path/DreamJobRoadmapPage';
import { CompanyLevelsPage } from './pages/tools/career-path/CompanyLevelsPage';
import { TalentLens } from './pages/tools/TalentLens';
import { ToolsHubPage } from './pages/tools/ToolsHubPage';
import { CompareJDsPage } from './features/suite/compare/CompareJDsPage';
import { TailorResumePage } from './features/suite/tailor/TailorResumePage';
import { ReachOutPage } from './features/suite/outreach/ReachOutPage';
import { BuildBriefsPage } from './features/suite/briefs/BuildBriefsPage';
import { CredentialOpportunityEnginePage } from './features/suite/credentials/CredentialOpportunityEnginePage';
import { CareersDataExplorer } from './careers-core/dev/CareersDataExplorer';

// Overlays & Providers
import { ToastContainer } from './components/ui/Toast';
import { ProfileProvider } from './features/suite/profile/ProfileContext';
import { ProfileDrawer } from './features/suite/profile/components/ProfileDrawer';
import { LocalhostNavigator } from './components/common/LocalhostNavigator';

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
          <ProfileDrawer />
          <ToastContainer />
          <LocalhostNavigator />
        </BrowserRouter>
      </ProfileProvider>
    </>
  );
}
