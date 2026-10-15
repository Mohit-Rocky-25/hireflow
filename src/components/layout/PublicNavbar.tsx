import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  UserCheck,
  Flame,
  TrendingUp,
  GitCompare,
  FileEdit,
  Mail,
  FolderGit2,
  Zap,
  Layers,
  Target,
  Award,
  User,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Components';

export function PublicNavbar() {
  const { isAuthenticated, currentUser } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'BHR_MANAGER':
      case 'HR_RECRUITER':
        return '/company/dashboard';
      case 'INTERVIEWER':
        return '/interviewer/dashboard';
      case 'CANDIDATE':
        return '/candidate/dashboard';
      case 'PLATFORM_ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[32px] h-[68px] flex items-center justify-between">
        
        {/* Left: History Nav + Brand Logo */}
        <div className="flex items-center gap-[16px] sm:gap-[20px]">
          <div className="flex items-center gap-[6px]">
            <button
              type="button"
              title="Go back"
              onClick={() => navigate(-1)}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              title="Go forward"
              onClick={() => navigate(1)}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-[18px] h-[18px]" />
            </button>
          </div>

          <Link to="/" onClick={closeDropdowns} className="flex items-center gap-[10px]">
            <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-black text-text tracking-[-0.03em]">HireFlow</span>
          </Link>
        </div>

        {/* Center: Properly Categorized Navigation with Main Flagships in Primary Position */}
        <div className="hidden md:flex items-center gap-[18px] lg:gap-[24px]">
          
          {/* Main Position 1: TalentLens Flagship Pill */}
          <Link
            to="/demo"
            onClick={closeDropdowns}
            className="inline-flex items-center gap-[6px] text-[14px] font-bold text-white bg-gradient-to-r from-primary to-ai px-[14px] py-[6px] rounded-full hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>TalentLens™</span>
          </Link>

          {/* Category 1: AI Hiring Simulators Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('simulators')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-text-secondary hover:text-foreground py-2 transition-colors cursor-pointer"
              aria-expanded={activeDropdown === 'simulators'}
            >
              <span>AI Simulators</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === 'simulators' ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {activeDropdown === 'simulators' && (
              <div className="absolute top-full left-0 w-72 rounded-2xl bg-surface border border-border shadow-xl p-2 space-y-1 animate-fade-in z-50">
                <Link
                  to="/demo"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      TalentLens™ Simulator
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Recruiter POV simulation across 130+ tech hiring bars.
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tools/resume-checker"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      ATS Resume Roaster
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Ruthless automated screening audit with verbatim citations.
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tools/career-path"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Career Trajectory & Levels
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Engineering level ladders and ₹ CTC benchmarks in LPA.
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Category 2: Career Decision Suite Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('decision-suite')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-text-secondary hover:text-foreground py-2 transition-colors cursor-pointer"
              aria-expanded={activeDropdown === 'decision-suite'}
            >
              <span>Decision Suite</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === 'decision-suite' ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {activeDropdown === 'decision-suite' && (
              <div className="absolute top-full left-0 w-80 rounded-2xl bg-surface border border-border shadow-xl p-2 space-y-1 animate-fade-in z-50">
                <Link
                  to="/tools/jd-compare"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <GitCompare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Side-by-Side JD Match
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Compare two job descriptions for skill overlap and fit.
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tools/tailor"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Resume Tailor Studio
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      XYZ formula bullet tailoring with zero hallucinations.
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tools/reach-out"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Cold Outreach Generator
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Generate 300-char LinkedIn connect pitches & HM emails.
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tools/build-briefs"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Executive Interview Briefs
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Talking points and career cheat sheets for interviews.
                    </div>
                  </div>
                </Link>

                <div className="pt-1 border-t border-border mt-1">
                  <Link
                    to="/tools"
                    onClick={closeDropdowns}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-2/60 hover:bg-surface-2 text-xs font-bold text-primary transition-colors"
                  >
                    <span>View All Decision Tools →</span>
                    <Zap className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Category 3: Levels & Pay Benchmarks Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('levels')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-text-secondary hover:text-foreground py-2 transition-colors cursor-pointer"
              aria-expanded={activeDropdown === 'levels'}
            >
              <span>Levels & Pay</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${activeDropdown === 'levels' ? 'rotate-180 text-primary' : ''}`} />
            </button>

            {activeDropdown === 'levels' && (
              <div className="absolute top-full left-0 w-72 rounded-2xl bg-surface border border-border shadow-xl p-2 space-y-1 animate-fade-in z-50">
                <Link
                  to="/tools/career-path/company-levels"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Company Levels & Pay
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Cross-company level mapping & ₹ CTC salary bands.
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tools/career-path/dream-job-roadmap"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Milestone Roadmap
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      Milestone planner to reach tier-1 dream roles.
                    </div>
                  </div>
                </Link>

                <Link
                  to="/tools/credential-engine"
                  onClick={closeDropdowns}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      Credential Engine
                    </div>
                    <div className="text-[11px] text-text-muted leading-tight mt-0.5">
                      102 verified certs, hackathons & open source fellowships.
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-[10px]">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.role === 'CANDIDATE' && (
                <Link
                  to="/candidate/profile"
                  onClick={closeDropdowns}
                  className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary hover:text-foreground hover:bg-surface-2 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Engineering Profile</span>
                </Link>
              )}

              <div className="hidden lg:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-foreground leading-tight">{currentUser.displayName}</span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">{currentUser.role.replace(/_/g, ' ')}</span>
              </div>

              <Link to={getDashboardLink()} onClick={closeDropdowns}>
                <Button variant="header" className="h-[40px] px-[16px] text-[13px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm">
                  <span>Open Workspace</span> <ArrowRight className="w-4 h-4 stroke-[2px]" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-[8px]">
              <Link
                to="/login"
                onClick={closeDropdowns}
                className="px-[18px] py-[9px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all duration-[120ms]"
              >
                Sign In
              </Link>
              <Link to="/register" onClick={closeDropdowns}>
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
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg max-h-[calc(100vh-68px)] overflow-y-auto">
          {/* Main Flagship */}
          <Link
            to="/demo"
            onClick={closeDropdowns}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-primary to-ai"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> TalentLens™ Recruiter Sim
            </span>
            <span className="text-xs opacity-80">Launch →</span>
          </Link>

          <div className="space-y-1 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">
              AI Hiring Simulators
            </div>
            <Link
              to="/tools/resume-checker"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>ATS Resume Roaster</span>
            </Link>
            <Link
              to="/tools/career-path"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Career Trajectory & ₹ CTC Ladders</span>
            </Link>
          </div>

          <div className="space-y-1 pt-2 border-t border-border">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">
              Career Decision Suite
            </div>
            <Link
              to="/tools/jd-compare"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <GitCompare className="w-3.5 h-3.5 text-purple-400" />
              <span>Side-by-Side JD Match</span>
            </Link>
            <Link
              to="/tools/tailor"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <FileEdit className="w-3.5 h-3.5 text-primary" />
              <span>Resume Tailor Studio</span>
            </Link>
            <Link
              to="/tools/reach-out"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cold Outreach Generator</span>
            </Link>
            <Link
              to="/tools/build-briefs"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Executive Interview Briefs</span>
            </Link>
            <Link
              to="/tools"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-primary hover:bg-surface-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>All Decision Tools Hub</span>
            </Link>
          </div>

          <div className="space-y-1 pt-2 border-t border-border">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 py-1">
              Levels & Pay Benchmarks
            </div>
            <Link
              to="/tools/career-path/company-levels"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Company Levels & Pay</span>
            </Link>
            <Link
              to="/tools/career-path/dream-job-roadmap"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <Target className="w-3.5 h-3.5 text-orange-400" />
              <span>Milestone Roadmap</span>
            </Link>
            <Link
              to="/tools/credential-engine"
              onClick={closeDropdowns}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface-2"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Credential Engine</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                onClick={closeDropdowns}
                className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs text-center shadow-sm"
              >
                Open Workspace →
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={closeDropdowns}
                  className="flex-1 py-2 text-center text-xs font-bold rounded-lg border border-border bg-surface-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeDropdowns}
                  className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-primary text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default PublicNavbar;
