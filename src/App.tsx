// ============================================================
// HireFlow v2 ΓÇö App Entry with Routing
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { CinematicLoader } from './components/Loader/CinematicLoader';

// Layouts
import { AppShell } from './app/layout/AppShell';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PublicCompanyProfile } from './pages/company/PublicCompanyProfile';
import { MatchingDemo } from './pages/demo/MatchingDemo';
import { CompanyRolesPage } from './pages/demo/CompanyRolesPage';
import { CandidatePortal } from './pages/portal/CandidatePortal';

// Tools
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

// Company / BHR Pages
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyJobs } from './pages/company/CompanyJobs';
import { CreateJob } from './pages/company/CreateJob';
import { EditJob } from './pages/company/EditJob';
import { CompanyJobDetail } from './pages/company/CompanyJobDetail';
import { CompanyCandidates } from './pages/company/CompanyCandidates';
import { CandidateDetail } from './pages/company/CandidateDetail';
import { CompanyInterviewers } from './pages/company/CompanyInterviewers';
import { CompanyAnalytics } from './pages/company/CompanyAnalytics';
import { CompanyTeam } from './pages/company/CompanyTeam';
import { CompanySettings } from './pages/company/CompanySettings';
import { CompanyOffers } from './pages/company/CompanyOffers';
import { CandidateIntelligencePage as CandidateIntelligence } from './pages/company/CandidateIntelligence';

// Interviewer Pages
import { InterviewerDashboard } from './pages/interviewer/InterviewerDashboard';
import { InterviewerInterviews } from './pages/interviewer/InterviewerInterviews';
import { InterviewDetail } from './pages/interviewer/InterviewDetail';
import { InterviewerProfile } from './pages/interviewer/InterviewerProfile';


// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCompanies } from './pages/admin/AdminCompanies';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAuditLog } from './pages/admin/AdminAuditLog';
import { AdminSettings } from './pages/admin/AdminSettings';

// Shared Pages
import { NotificationsPage } from './pages/NotificationsPage';

// Guards
import { ProtectedRoute } from './app/ProtectedRoute';
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
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/company/:id" element={<PublicCompanyProfile />} />
        <Route path="/demo" element={<MatchingDemo />} />
        <Route path="/demo/company/:companySlug" element={<CompanyRolesPage />} />
        <Route path="/portal" element={<CandidatePortal />} />
        
        {/* Free ATS Candidate Tools */}
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

        {/* Company / BHR / HR Routes */}
        <Route path="/company" element={<ProtectedRoute roles={['BHR_MANAGER', 'HR_RECRUITER']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="jobs" element={<CompanyJobs />} />
          <Route path="jobs/new" element={<CreateJob />} />
          <Route path="jobs/:id" element={<CompanyJobDetail />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />
          <Route path="candidates" element={<CompanyCandidates />} />
          <Route path="candidates/:candidateId" element={<CandidateDetail />} />
          <Route path="candidates/:candidateId/intelligence" element={<CandidateIntelligence />} />
          <Route path="interviewers" element={<CompanyInterviewers />} />
          <Route path="analytics" element={<CompanyAnalytics />} />
          <Route path="team" element={<CompanyTeam />} />
          <Route path="offers" element={<CompanyOffers />} />
          <Route path="settings" element={<CompanySettings />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Interviewer Routes */}
        <Route path="/interviewer" element={<ProtectedRoute roles={['INTERVIEWER']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InterviewerDashboard />} />
          <Route path="interviews" element={<InterviewerInterviews />} />
          <Route path="interviews/:id" element={<InterviewDetail />} />
          <Route path="profile" element={<InterviewerProfile />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Candidate Routes - Omitted candidate dashboard/profile; redirect directly to Career Decision Suite */}
        <Route path="/candidate/*" element={<Navigate to="/tools" replace />} />
        <Route path="/candidate" element={<Navigate to="/tools" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['PLATFORM_ADMIN']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="audit" element={<AdminAuditLog />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="ai" element={<Navigate to="/admin/settings" replace />} />
        </Route>

        {/* Catch all */}
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
