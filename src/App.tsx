// ============================================================
// HireFlow v3 — Public ATS Utility Platform
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ToastContainer } from './components/ui/Toast';

// Core Public Pages
import { LandingPage } from './pages/LandingPage';
import { JobMarketplace } from './pages/jobs/JobMarketplace';
import { PublicJobDetail } from './pages/jobs/PublicJobDetail';

// New Public Utility Tools
import { ResumeChecker } from './pages/tools/ResumeChecker';
import { CareerPathSimulator } from './pages/tools/CareerPathSimulator';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

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
    {!appReady && <LoadingScreen onFinish={handleLoadingFinish} />}
    <BrowserRouter>
      <Routes>
        {/* Public Homepage & Job Board */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobMarketplace />} />
        <Route path="/jobs/:id" element={<PublicJobDetail />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Free ATS Candidate Tools */}
        <Route path="/tools/resume-checker" element={<ResumeChecker />} />
        <Route path="/tools/career-path" element={<CareerPathSimulator />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
    </>
  );
}
