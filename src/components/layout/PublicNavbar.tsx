import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Components';

export function PublicNavbar() {
  const { isAuthenticated, currentUser } = useStore();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'BHR_MANAGER': case 'HR_RECRUITER': return '/company/dashboard';
      case 'INTERVIEWER': return '/interviewer/dashboard';
      case 'CANDIDATE': return '/candidate/dashboard';
      case 'PLATFORM_ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border">
      <div className="max-w-[1280px] mx-auto px-[32px] h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-[24px]">
          <div className="flex items-center gap-[8px] mr-[8px]">
            <button title="Go back" onClick={() => navigate(-1)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors">
              <ChevronLeft className="w-[18px] h-[18px]" />
            </button>
            <button title="Go forward" onClick={() => navigate(1)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors">
              <ChevronRight className="w-[18px] h-[18px]" />
            </button>
          </div>
          <Link to="/" className="flex items-center gap-[14px]">
            <div className="w-[38px] h-[38px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.03em]">HireFlow</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-[36px]">
          <Link to="/jobs" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">Browse Jobs</Link>
          <Link to="/demo" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">AI Demo</Link>
          <Link to="/portal" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">Candidate Portal</Link>
        </div>
        <div className="flex items-center gap-[10px]">
          {isAuthenticated ? (
            <Link to={getDashboardLink()}>
              <Button variant="header" className="h-[40px] px-[18px] text-[14px] font-semibold rounded-md">
                Go to Dashboard <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-[18px] py-[9px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all duration-[120ms]">Sign In</Link>
              <Link to="/register">
                <Button variant="header" className="h-[40px] px-[18px] text-[14px] font-semibold rounded-md">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
