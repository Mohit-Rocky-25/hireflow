// ============================================================
// HireFlow v3 — Candidate Career Decision Suite (Client-Side)
// ============================================================
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useStore } from './store/useStore';
import { CinematicLoader } from './components/Loader/CinematicLoader';
import { Loader as SpruceLoader } from './designs/spruce/layout/Loader';
import { useTheme } from './lib/theme/useTheme';
import { DesignGate } from './components/common/DesignGate';
import {
  SpruceLandingPage,
  SpruceToolsHubPage,
  SpruceResumeCheckerPage,
  SpruceTailorPage,
  SpruceReachOutPage,
  SpruceBuildBriefsPage,
  SpruceCredentialEnginePage,
  SpruceCareerPathHubPage,
  SpruceCompareJDsPage,
  SpruceTalentLensPage,
  SpruceCompanyRolesPage,
  SpruceGalleryPage,
} from './designs/spruce';
import { initSupabaseAuthListener } from './lib/supabase/client';
import { autoSyncManager } from './lib/sync/autoSyncManager';

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
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));

// Candidate Career Operating System (v5)
import { AuthProvider } from './features/auth/AuthProvider';
import { RequireAuth } from './features/auth/RequireAuth';
import { PortalRedirect } from './features/my-space/portalRedirectMap';
import { MySpaceSheet } from './features/my-space/MySpaceSheet';
import { SignInDialog } from './features/auth/SignInDialog';
import { useAuthStore } from './features/auth/useAuthStore';
const AuthCallbackPage = React.lazy(() => import('./features/auth/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })));
const ResumeMatrixPage = React.lazy(() => import('./features/resumes/ResumeMatrixPage').then((m) => ({ default: m.ResumeMatrixPage })));
const HistoricalResumeInspector = React.lazy(() => import('./features/inspector/HistoricalResumeInspector').then((m) => ({ default: m.HistoricalResumeInspector })));

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
import { ErrorState } from './components/ui/Components';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'HireFlow — Free Candidate-Side Career Toolkit',
  '/demo': 'TalentLens — Role Benchmark & Fit Evaluation | HireFlow',
  '/tools': 'Central Tools Hub | HireFlow',
  '/tools/resume-checker': 'ATS Resume Roaster — 7-Dimension Evaluation | HireFlow',
  '/tools/jd-compare': 'Compare JDs — Head-to-Head Evaluation | HireFlow',
  '/tools/tailor': 'Tailor My Resume — Grounded Adaptation Studio | HireFlow',
  '/tools/reach-out': 'Reach Out — Channel-Calibrated Networking Studio | HireFlow',
  '/tools/build-briefs': 'Project Briefs — Production Portfolio Engine | HireFlow',
  '/tools/career-path': 'Career Trajectory — Career Ladder Simulator | HireFlow',
  '/tools/career-path/dream-job-roadmap': 'Dream Job Roadmap | HireFlow',
  '/tools/career-path/company-levels': 'Company Engineering Levels & Ladders | HireFlow',
  '/tools/talent-lens': 'TalentLens Workspace | HireFlow',
  '/tools/credential-engine': 'Credential & Opportunity Engine | HireFlow',
  '/data': 'Data Management & Zero-Egress Privacy | HireFlow',
  '/history': 'Scan History & Audit Log | HireFlow',
  '/jd-library': 'Saved Job Descriptions | HireFlow',
  '/methodology': 'Scoring Spec & Methodology | HireFlow',
  '/login': 'Candidate Sign In | HireFlow',
  '/register': 'Candidate Account Registration | HireFlow',
};

function RouteChangeHandler() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const exact = ROUTE_TITLES[location.pathname];
    if (exact) {
      document.title = exact;
    } else if (location.pathname.startsWith('/demo/company/')) {
      document.title = 'Company Roles & Eligibility Calibration | HireFlow';
    } else if (location.pathname.startsWith('/tools/pathways')) {
      document.title = 'Pathways — Campus Intelligence & Readiness | HireFlow';
    } else {
      document.title = 'HireFlow — Candidate Career Decision Suite';
    }

    const targetHeading = document.querySelector('h1') as HTMLElement | null;
    if (targetHeading) {
      if (!targetHeading.hasAttribute('tabIndex')) {
        targetHeading.setAttribute('tabIndex', '-1');
      }
      targetHeading.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  return null;
}

function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999999] focus:px-4 focus:py-2 focus:bg-volt focus:text-black focus:rounded-md focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-volt"
    >
      Skip to content
    </a>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6" id="main-content">
      <ErrorState
        title="Page not found"
        message="The page or tool route you requested does not exist or has been moved."
        actionLabel="Go to Central Tools Hub"
        onAction={() => {
          window.location.href = '/tools';
        }}
      />
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ToolErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('HireFlow Error Boundary caught an exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6" id="main-content">
          <ErrorState
            title="Something went wrong"
            message={this.state.error?.message || 'An unexpected error occurred in this view.'}
            actionLabel="Return to Tools Hub"
            onAction={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/tools';
            }}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const design = useTheme((s) => s.design);
  const { isSignInOpen, closeSignIn } = useAuthStore();
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

  // Supabase real-time auth listener (Google OAuth redirect & session recovery)
  useEffect(() => {
    const unsub = initSupabaseAuthListener(
      (user) => {
        const currentUser = useStore.getState().currentUser;
        if (!currentUser || currentUser.id !== user.id) {
          useStore.setState({
            currentUser: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl || '',
              role: 'CANDIDATE',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            isAuthenticated: true,
          });
          autoSyncManager.pullFromCloud(user.id);
        }
      },
      () => {
        useStore.getState().logout();
      }
    );
    return unsub;
  }, []);

  const handleLoadingFinish = useCallback(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem('hf_seen_cinematic', 'true');
      } catch {}
    }
    setAppReady(true);
  }, []);

  return (
    <ToolErrorBoundary>
      <SkipToContent />
      {!appReady && (
        design === 'spruce' ? (
          <SpruceLoader onFinish={handleLoadingFinish} isAppReady={_initialized} />
        ) : (
          <CinematicLoader onFinish={handleLoadingFinish} isAppReady={_initialized} />
        )
      )}
      <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <RouteChangeHandler />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {import.meta.env.DEV && <Route path="/__spruce" element={<SpruceGalleryPage />} />}
              {/* Candidate Career Operating System (v5) */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/portal" element={<PortalRedirect />} />
              <Route path="/portal/resumes" element={<PortalRedirect />} />
              <Route path="/portal/audits/:auditId" element={<PortalRedirect />} />
              <Route path="/portal/*" element={<PortalRedirect />} />

              {/* Public Landing & Interactive Company Demo */}
              <Route path="/" element={<DesignGate spruce={SpruceLandingPage} default={LandingPage} />} />
              <Route path="/demo" element={<DesignGate spruce={SpruceTalentLensPage} default={MatchingDemo} />} />
              <Route path="/demo/company/:companySlug" element={<DesignGate spruce={SpruceCompanyRolesPage} default={CompanyRolesPage} />} />

              {/* Free ATS & Career Decision Suite Tools */}
              <Route path="/tools" element={<DesignGate spruce={SpruceToolsHubPage} default={ToolsHubPage} />} />
              <Route path="/tools/resume-checker" element={<DesignGate spruce={SpruceResumeCheckerPage} default={ResumeChecker} />} />
              <Route path="/tools/jd-compare" element={<DesignGate spruce={SpruceCompareJDsPage} default={CompareJDsPage} />} />
              <Route path="/tools/tailor" element={<DesignGate spruce={SpruceTailorPage} default={TailorResumePage} />} />
              <Route path="/tools/reach-out" element={<DesignGate spruce={SpruceReachOutPage} default={ReachOutPage} />} />
              <Route path="/tools/build-briefs" element={<DesignGate spruce={SpruceBuildBriefsPage} default={BuildBriefsPage} />} />
              <Route path="/tools/career-path" element={<DesignGate spruce={SpruceCareerPathHubPage} default={CareerPathHub} />} />
            <Route path="/tools/career-path/dream-job-roadmap" element={<DreamJobRoadmapPage />} />
            <Route path="/tools/career-path/company-levels" element={<CompanyLevelsPage />} />
            <Route path="/tools/career-path/promotion-simulator" element={<Navigate to="/tools/career-path/dream-job-roadmap" replace />} />
            <Route path="/tools/career-path/company-ladder" element={<Navigate to="/tools/career-path/company-levels" replace />} />
            <Route path="/tools/career-path/simulator" element={<Navigate to="/tools/career-path/dream-job-roadmap" replace />} />
            <Route path="/tools/career-path/explorer" element={<Navigate to="/tools/career-path/company-levels" replace />} />
            <Route path="/talentlens" element={<Navigate to="/demo" replace />} />
            <Route path="/talent-lens" element={<Navigate to="/demo" replace />} />
            <Route path="/demo/talentlens" element={<Navigate to="/demo" replace />} />
            <Route path="/roaster" element={<RedirectWithSearch to="/tools/resume-checker" />} />
            <Route path="/tailor" element={<RedirectWithSearch to="/tools/tailor" />} />
            <Route path="/briefs" element={<RedirectWithSearch to="/tools/build-briefs" />} />
            <Route path="/compare" element={<RedirectWithSearch to="/tools/jd-compare" />} />
            <Route path="/credentials" element={<RedirectWithSearch to="/tools/credential-engine" />} />
            <Route path="/reach-out" element={<RedirectWithSearch to="/tools/reach-out" />} />
            <Route path="/pathways" element={<RedirectWithSearch to="/tools/pathways" />} />
            <Route path="/tools/talent-lens" element={<TalentLens />} />
            <Route path="/tools/credential-engine" element={<DesignGate spruce={SpruceCredentialEnginePage} default={CredentialOpportunityEnginePage} />} />
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
            <Route path="/company/*" element={<Navigate to="/tools" replace />} />
            <Route path="/company" element={<Navigate to="/tools" replace />} />
            <Route path="/interviewer/*" element={<Navigate to="/tools" replace />} />
            <Route path="/interviewer" element={<Navigate to="/tools" replace />} />
            <Route path="/admin/*" element={<Navigate to="/tools" replace />} />
            <Route path="/admin" element={<Navigate to="/tools" replace />} />
            <Route path="/candidate/*" element={<Navigate to="/tools" replace />} />
            <Route path="/candidate" element={<Navigate to="/tools" replace />} />
            <Route path="/login" element={<LoginPage initialMode="signin" />} />
            <Route path="/register" element={<LoginPage initialMode="signup" />} />

            {/* Catch-all: robust 404 handler with ErrorState primitive (R-WAY-3) */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <ProfileDrawer />
        <MySpaceSheet />
        <SignInDialog isOpen={isSignInOpen} onClose={closeSignIn} />
        <ToastContainer />
        <LocalhostNavigator />
        <PwaUpdateToast />
        <OfflineIndicator />
        </BrowserRouter>
      </ProfileProvider>
      </AuthProvider>
    </ToolErrorBoundary>
  );
}
