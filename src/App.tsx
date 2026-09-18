// ============================================================
// HireFlow — App Entry with Routing
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';

// Layouts
import { AppShell } from './components/layout/AppShell';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { JobMarketplace } from './pages/jobs/JobMarketplace';
import { PublicJobDetail } from './pages/jobs/PublicJobDetail';

// Company / BHR Pages
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { CompanyJobs } from './pages/company/CompanyJobs';
import { CreateJob } from './pages/company/CreateJob';
import { CompanyJobDetail } from './pages/company/CompanyJobDetail';
import { CompanyCandidates } from './pages/company/CompanyCandidates';
import { CandidateDetail } from './pages/company/CandidateDetail';
import { CompanyInterviewers } from './pages/company/CompanyInterviewers';
import { CompanyAnalytics } from './pages/company/CompanyAnalytics';
import { CompanyTeam } from './pages/company/CompanyTeam';
import { CompanySettings } from './pages/company/CompanySettings';

// Interviewer Pages
import { InterviewerDashboard } from './pages/interviewer/InterviewerDashboard';
import { InterviewerInterviews } from './pages/interviewer/InterviewerInterviews';
import { InterviewDetail } from './pages/interviewer/InterviewDetail';

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateJobs } from './pages/candidate/CandidateJobs';
import { CandidateApplications } from './pages/candidate/CandidateApplications';
import { CandidateApplicationDetail } from './pages/candidate/CandidateApplicationDetail';
import { CandidateInterviews } from './pages/candidate/CandidateInterviews';
import { CandidateResume } from './pages/candidate/CandidateResume';
import { CandidateProfilePage } from './pages/candidate/CandidateProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCompanies } from './pages/admin/AdminCompanies';
import { AdminUsers } from './pages/admin/AdminUsers';

// Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  const { initDemoData, _initialized } = useStore();

  useEffect(() => {
    if (!_initialized) {
      initDemoData();
    }
  }, [_initialized, initDemoData]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs" element={<JobMarketplace />} />
        <Route path="/jobs/:id" element={<PublicJobDetail />} />

        {/* Company / BHR / HR Routes */}
        <Route path="/company" element={<ProtectedRoute roles={['BHR_MANAGER', 'HR_RECRUITER']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="jobs" element={<CompanyJobs />} />
          <Route path="jobs/new" element={<CreateJob />} />
          <Route path="jobs/:id" element={<CompanyJobDetail />} />
          <Route path="candidates" element={<CompanyCandidates />} />
          <Route path="candidates/:id" element={<CandidateDetail />} />
          <Route path="interviewers" element={<CompanyInterviewers />} />
          <Route path="analytics" element={<CompanyAnalytics />} />
          <Route path="team" element={<CompanyTeam />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>

        {/* Interviewer Routes */}
        <Route path="/interviewer" element={<ProtectedRoute roles={['INTERVIEWER']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InterviewerDashboard />} />
          <Route path="interviews" element={<InterviewerInterviews />} />
          <Route path="interviews/:id" element={<InterviewDetail />} />
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
          <Route path="profile" element={<CandidateProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['PLATFORM_ADMIN']}><AppShell /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
