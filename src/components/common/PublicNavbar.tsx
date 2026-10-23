import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Menu, X, Compass, FileSearch, Award, Scale, Database, UserCheck } from 'lucide-react';

export function PublicNavbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black border-b border-charcoal">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Go back"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.5px]" />
            </button>
            <button
              type="button"
              title="Go forward"
              onClick={() => navigate(1)}
              className="w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.5px]" />
            </button>
          </div>

          <Link to="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-8 h-8 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt font-black text-sm group-hover:border-volt transition-colors">
              H
            </div>
            <span className="text-[20px] font-black text-white tracking-tight font-sans">
              HIRE<span className="text-volt">FLOW</span>
            </span>
          </Link>
        </div>

        {/* Center: High-Contrast Category Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            to="/demo"
            className="text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-volt" />
            TALENTLENS
          </Link>
          <Link
            to="/tools"
            className="text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
          >
            DECISION SUITE
          </Link>
          <Link
            to="/tools/resume-checker"
            className="text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
          >
            ATS ROASTER
          </Link>
          <Link
            to="/tools/career-path"
            className="text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
          >
            CAREER TRAJECTORY
          </Link>
          <Link
            to="/tools/credential-engine"
            className="text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
          >
            OPPORTUNITIES
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/tools"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold text-text-on-accent bg-volt hover:bg-[#1d1d1d] hover:text-white border border-volt transition-colors active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
          >
            <span>OPEN TOOLS HUB</span>
            <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded bg-near-black border border-charcoal text-silver hover:text-volt transition-colors focus-visible:outline-2 focus-visible:outline-volt"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5px]" /> : <Menu className="w-5 h-5 stroke-[1.5px]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal bg-black px-4 py-4 space-y-2 shadow-level-3 animate-fade-in">
          <div className="flex flex-col gap-1">
            <Link
              to="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded bg-near-black border border-charcoal text-[13px] font-semibold uppercase tracking-[1.4px] text-volt hover:border-volt transition-colors"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 stroke-[1.5px]" />
                TALENTLENS™ SIMULATOR
              </span>
              <span className="text-xs text-silver">PRIMARY →</span>
            </Link>
            <Link
              to="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black transition-colors"
            >
              DECISION SUITE HUB
            </Link>
            <Link
              to="/tools/resume-checker"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center gap-2 transition-colors"
            >
              <FileSearch className="w-4 h-4 stroke-[1.5px] text-silver" />
              <span>ATS ROASTER</span>
            </Link>
            <Link
              to="/tools/career-path"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center gap-2 transition-colors"
            >
              <Compass className="w-4 h-4 stroke-[1.5px] text-silver" />
              <span>CAREER TRAJECTORY</span>
            </Link>
            <Link
              to="/tools/credential-engine"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center gap-2 transition-colors"
            >
              <Award className="w-4 h-4 stroke-[1.5px] text-silver" />
              <span>CREDENTIAL & OPPORTUNITY ENGINE</span>
            </Link>
            <Link
              to="/methodology"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center gap-2 transition-colors"
            >
              <Scale className="w-4 h-4 stroke-[1.5px] text-silver" />
              <span>SCORING METHODOLOGY</span>
            </Link>
            <Link
              to="/data"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center gap-2 transition-colors"
            >
              <Database className="w-4 h-4 stroke-[1.5px] text-silver" />
              <span>YOUR DATA & PRIVACY</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
