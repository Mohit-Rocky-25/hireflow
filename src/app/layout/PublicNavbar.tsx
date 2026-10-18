import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '@/components/ui/Components';

export function PublicNavbar() {
  const { isAuthenticated, currentUser } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'BHR_MANAGER':
      case 'HR_RECRUITER':
        return '/company/dashboard';
      case 'INTERVIEWER':
        return '/interviewer/dashboard';
      case 'CANDIDATE':
        return '/tools';
      case 'PLATFORM_ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border bg-surface/85 backdrop-blur-xl">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[32px] h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-[16px] sm:gap-[24px]">
          <div className="flex items-center gap-[8px] mr-[4px]">
            <button
              type="button"
              title="Go back"
              onClick={() => navigate(-1)}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors"
            >
              <ChevronLeft className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              title="Go forward"
              onClick={() => navigate(1)}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors"
            >
              <ChevronRight className="w-[18px] h-[18px]" />
            </button>
          </div>
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[38px] h-[38px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.03em]">HireFlow</span>
          </Link>
        </div>

        {/* Center: Old Clean Navigation where ONLY TalentLens is highlighted in the starting */}
        <div className="hidden md:flex items-center gap-[32px] lg:gap-[36px]">
          <Link
            to="/demo"
            className="inline-flex items-center gap-[6px] text-[15px] font-bold text-white bg-gradient-to-r from-primary to-ai px-[14px] py-[6px] rounded-full hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> TalentLens™
          </Link>
          <Link
            to="/tools"
            className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]"
          >
            Decision Suite
          </Link>
          <Link
            to="/tools/resume-checker"
            className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]"
          >
            ATS Roaster
          </Link>
          <Link
            to="/tools/career-path"
            className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]"
          >
            Career Trajectory
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-[10px]">
          {isAuthenticated && currentUser ? (
            currentUser.role !== 'CANDIDATE' ? (
              <Link to={getDashboardLink()}>
                <Button variant="header" className="h-[40px] px-[18px] text-[14px] font-semibold rounded-md">
                  Portal <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-[10px]">
                <span className="text-[13px] font-semibold text-text hidden sm:inline px-3 py-1 rounded-full bg-surface-2 border border-border">
                  {currentUser.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    useStore.getState().logout();
                    navigate('/');
                  }}
                  className="px-[14px] py-[7px] rounded-md text-[13px] font-semibold text-text-secondary hover:text-text hover:bg-surface-2 border border-border transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )
          ) : (
            <div className="hidden sm:flex items-center gap-[8px]">
              <Link
                to="/login"
                className="px-[18px] py-[9px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all duration-[120ms]"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="header" className="h-[40px] px-[18px] text-[14px] font-semibold rounded-md">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg">
          <div className="flex flex-col gap-2">
            <Link
              to="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-primary to-ai"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> TalentLens™
              </span>
              <span className="text-xs opacity-80">Primary →</span>
            </Link>
            <Link
              to="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2"
            >
              Decision Suite
            </Link>
            <Link
              to="/tools/resume-checker"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2"
            >
              ATS Roaster
            </Link>
            <Link
              to="/tools/career-path"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2"
            >
              Career Trajectory
            </Link>
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-[14px] font-medium text-text-secondary hover:text-text rounded-md hover:bg-surface-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-[14px] font-semibold text-white bg-text rounded-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
