// ============================================================
// HireFlow v2 ΓÇö App Entry with Routing
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { CinematicLoader } from './components/Loader/CinematicLoader';

// Layouts
import { AppShell } from './components/layout/AppShell';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { JobMarketplace } from './pages/jobs/JobMarketplace';
import { PublicJobDetail } from './pages/jobs/PublicJobDetail';
import { PublicCompanyProfile } from './pages/company/PublicCompanyProfile';
import { MatchingDemo } from './pages/demo/MatchingDemo';
import { CompanyRolesPage } from './pages/demo/CompanyRolesPage';
import { CandidatePortal } from './pages/portal/CandidatePortal';

// Tools
import { ResumeChecker } from './pages/tools/ResumeChecker';
import { CareerPathHub } from './pages/tools/career-path/CareerPathHub';
import { PromotionSimulatorPage } from './pages/tools/career-path/PromotionSimulatorPage';
import { CompanyLadderPage } from './pages/tools/career-path/CompanyLadderPage';
import { TalentLens } from './pages/tools/TalentLens';

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

// Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';

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
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobMarketplace />} />
        <Route path="/jobs/:id" element={<PublicJobDetail />} />
        <Route path="/company/:id" element={<PublicCompanyProfile />} />
        <Route path="/demo" element={<MatchingDemo />} />
        <Route path="/demo/company/:companySlug" element={<CompanyRolesPage />} />
        <Route path="/portal" element={<CandidatePortal />} />
        
        {/* Free ATS Candidate Tools */}
        <Route path="/tools/resume-checker" element={<ResumeChecker />} />
        <Route path="/tools/career-path" element={<CareerPathHub />} />
        <Route path="/tools/career-path/promotion-simulator" element={<PromotionSimulatorPage />} />
        <Route path="/tools/career-path/company-ladder" element={<CompanyLadderPage />} />
        <Route path="/tools/career-path/simulator" element={<Navigate to="/tools/career-path/promotion-simulator" replace />} />
        <Route path="/tools/career-path/explorer" element={<Navigate to="/tools/career-path/company-ladder" replace />} />
        <Route path="/tools/talent-lens" element={<TalentLens />} />

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

        {/* Candidate Routes */}
        <Route path="/candidate" element={<ProtectedRoute roles={['CANDIDATE']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
          <Route path="jobs" element={<CandidateJobs />} />
          <Route path="jobs/:id" element={<PublicJobDetail />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="applications/:id" element={<CandidateApplicationDetail />} />
          <Route path="interviews" element={<CandidateInterviews />} />
          <Route path="resume" element={<CandidateResume />} />
          <Route path="company-match" element={<CompanyMatch />} />
          <Route path="profile" element={<CandidateProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['PLATFORM_ADMIN']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="audit" element={<AdminAuditLog />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="jobs" element={<Navigate to="/jobs" replace />} />
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="ai" element={<Navigate to="/admin/settings" replace />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
    </>
  );
}
