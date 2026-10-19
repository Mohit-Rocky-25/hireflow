import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Menu, X, Compass, FileSearch, Award, Scale, Database } from 'lucide-react';

export function PublicNavbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border bg-surface/85 backdrop-blur-xl">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[32px] h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-[16px] sm:gap-[24px]">
          <div className="flex items-center gap-[8px] mr-[4px]">
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
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[38px] h-[38px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.03em]">HireFlow</span>
          </Link>
        </div>

        {/* Center: Clean Navigation */}
        <div className="hidden md:flex items-center gap-[28px] lg:gap-[32px]">
          <Link
            to="/demo"
            className="inline-flex items-center gap-[6px] text-[14px] font-bold text-white bg-gradient-to-r from-primary to-ai px-[14px] py-[6px] rounded-full hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> TalentLens™
          </Link>
          <Link
            to="/tools"
            className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]"
          >
            Decision Suite
          </Link>
          <Link
            to="/tools/resume-checker"
            className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]"
          >
            ATS Roaster
          </Link>
          <Link
            to="/tools/career-path"
            className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]"
          >
            Career Trajectory
          </Link>
          <Link
            to="/tools/credential-engine"
            className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]"
          >
            Opportunities
          </Link>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-[10px]">
          <Link
            to="/tools"
            className="hidden sm:inline-flex items-center gap-2 px-[18px] py-[9px] rounded-md text-[14px] font-semibold text-white bg-gradient-to-r from-primary to-primary-active hover:opacity-95 shadow-sm transition-all"
          >
            <span>Open Tools Hub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

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
              Decision Suite Hub
            </Link>
            <Link
              to="/tools/resume-checker"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 flex items-center gap-2"
            >
              <FileSearch className="w-4 h-4 text-primary" />
              <span>ATS Roaster</span>
            </Link>
            <Link
              to="/tools/career-path"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Career Trajectory</span>
            </Link>
            <Link
              to="/tools/credential-engine"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Credential & Opportunity Engine</span>
            </Link>
            <Link
              to="/methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 flex items-center gap-2"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Scoring Methodology</span>
            </Link>
            <Link
              to="/data"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Your Data & Privacy</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
