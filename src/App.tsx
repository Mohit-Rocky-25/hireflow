// ============================================================
// HireFlow v2 — Unified App Entry with Extensible Navigation Shell
// ============================================================
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { CinematicLoader } from './components/Loader/CinematicLoader';

// Navigation & Layout Shell
import { AppShellLayout } from './components/navigation/AppShellLayout';
import { ScrollAndTitleManager } from './components/navigation/ScrollAndTitleManager';
import { NotFoundPage } from './pages/NotFoundPage';

// Public Pages (Render outside Sidebar shell)
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PublicJobDetail } from './pages/jobs/PublicJobDetail';
import { PublicCompanyProfile } from './pages/company/PublicCompanyProfile';
import { MatchingDemo } from './pages/demo/MatchingDemo';
import { CompanyRolesPage } from './pages/demo/CompanyRolesPage';
import { CandidatePortal } from './pages/portal/CandidatePortal';

// Tools & Engines
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

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateJobs } from './pages/candidate/CandidateJobs';
import { CandidateApplications } from './pages/candidate/CandidateApplications';
import { CandidateApplicationDetail } from './pages/candidate/CandidateApplicationDetail';
import { CandidateInterviews } from './pages/candidate/CandidateInterviews';
import { CandidateResume } from './pages/candidate/CandidateResume';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';
import { CompanyMatch } from './pages/candidate/CompanyMatch';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCompanies } from './pages/admin/AdminCompanies';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAuditLog } from './pages/admin/AdminAuditLog';
import { AdminSettings } from './pages/admin/AdminSettings';

// Shared Pages
import { NotificationsPage } from './pages/NotificationsPage';

// Guards & Contexts
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
          <ScrollAndTitleManager />
          <Routes>
            {/* Standalone Landing, Auth & Public Portals (Without Sidebar Shell) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/portal" element={<CandidatePortal />} />
            <Route path="/company/:id" element={<PublicCompanyProfile />} />
            <Route path="/demo" element={<MatchingDemo />} />
            <Route path="/demo/company/:companySlug" element={<CompanyRolesPage />} />
            <Route path="/jobs/:id" element={<PublicJobDetail />} />

            {/* Legacy URL Aliases & Canonical Redirects */}
            <Route path="/tools/tracker" element={<Navigate to="/candidate/applications" replace />} />
            <Route path="/tools/career-path/promotion-simulator" element={<Navigate to="/tools/career-path/dream-job-roadmap" replace />} />
            <Route path="/tools/career-path/company-ladder" element={<Navigate to="/tools/career-path/company-levels" replace />} />
            <Route path="/tools/career-path/simulator" element={<Navigate to="/tools/career-path/dream-job-roadmap" replace />} />
            <Route path="/tools/career-path/explorer" element={<Navigate to="/tools/career-path/company-levels" replace />} />
            <Route path="/tools/credentials" element={<Navigate to="/tools/credential-engine" replace />} />
            <Route path="/tools/opportunity-engine" element={<Navigate to="/tools/credential-engine" replace />} />
            <Route path="/admin/analytics" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/ai" element={<Navigate to="/admin/settings" replace />} />

            {/* Persistent Application Shell with Left-Edge Sidebar Navigation */}
            <Route element={<AppShellLayout />}>
              {/* Free Candidate Tools & Decision Suite */}
              <Route path="/tools" element={<ToolsHubPage />} />
              <Route path="/tools/resume-checker" element={<ResumeChecker />} />
              <Route path="/tools/jd-compare" element={<CompareJDsPage />} />
              <Route path="/tools/tailor" element={<TailorResumePage />} />
              <Route path="/tools/reach-out" element={<ReachOutPage />} />
              <Route path="/tools/build-briefs" element={<BuildBriefsPage />} />
              <Route path="/tools/career-path" element={<CareerPathHub />} />
              <Route path="/tools/career-path/dream-job-roadmap" element={<DreamJobRoadmapPage />} />
              <Route path="/tools/career-path/company-levels" element={<CompanyLevelsPage />} />
              <Route path="/tools/talent-lens" element={<TalentLens />} />
              <Route path="/tools/credential-engine" element={<CredentialOpportunityEnginePage />} />
              <Route path="/dev/careers-data" element={<CareersDataExplorer />} />

              {/* Company / BHR / HR Recruiter Portal */}
              <Route path="/company" element={<ProtectedRoute roles={['BHR_MANAGER', 'HR_RECRUITER']}><Outlet /></ProtectedRoute>}>
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

              {/* Interviewer Portal */}
              <Route path="/interviewer" element={<ProtectedRoute roles={['INTERVIEWER']}><Outlet /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<InterviewerDashboard />} />
                <Route path="interviews" element={<InterviewerInterviews />} />
                <Route path="interviews/:id" element={<InterviewDetail />} />
                <Route path="profile" element={<InterviewerProfile />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Candidate Workspace */}
              <Route path="/candidate" element={<ProtectedRoute roles={['CANDIDATE']}><Outlet /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<CandidateDashboard />} />
                <Route path="profile" element={<CandidateProfilePage />} />
                <Route path="resume" element={<CandidateResume />} />
                <Route path="notifications" element={<NotificationsPage />} />
                {/* Purged application & interview tracking routes redirect to candidate overview */}
                <Route path="applications" element={<Navigate to="/candidate/dashboard" replace />} />
                <Route path="applications/:id" element={<Navigate to="/candidate/dashboard" replace />} />
                <Route path="interviews" element={<Navigate to="/candidate/dashboard" replace />} />
                <Route path="jobs" element={<Navigate to="/demo" replace />} />
                <Route path="jobs/:id" element={<Navigate to="/demo" replace />} />
                <Route path="company-match" element={<Navigate to="/demo" replace />} />
              </Route>

              {/* Platform Administration Console */}
              <Route path="/admin" element={<ProtectedRoute roles={['PLATFORM_ADMIN']}><Outlet /></ProtectedRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="audit" element={<AdminAuditLog />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* Smart 404 Fallback with Registry Recommendations */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ProfileDrawer />
          <ToastContainer />
          <LocalhostNavigator />
        </BrowserRouter>
      </ProfileProvider>
    </>
  );
}
