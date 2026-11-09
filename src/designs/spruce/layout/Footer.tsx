import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="bg-sp-canvas-soft border-t border-sp-hairline py-12 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="sp-caption text-sp-muted max-w-sm mt-1">
              Evidence-grounded candidate career platform. Transparent, private, deterministic placement intelligence.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-6 sp-ui-label normal-case text-sp-muted" aria-label="Footer Navigation">
            <Link to="/tools" className="hover:text-sp-primary-text transition-colors">
              Tools Hub
            </Link>
            <Link to="/demo" className="hover:text-sp-primary-text transition-colors">
              TalentLens Demo
            </Link>
            <Link to="/tools/career-path" className="hover:text-sp-primary-text transition-colors">
              Career Trajectory
            </Link>
            <Link to="/methodology" className="hover:text-sp-primary-text transition-colors">
              Methodology
            </Link>
            <Link to="/data" className="hover:text-sp-primary-text transition-colors">
              Your Data & Privacy
            </Link>
          </nav>
        </div>

        {/* Bottom Disclosures & Copyright */}
        <div className="mt-8 pt-8 border-t border-sp-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sp-caption text-sp-muted">
          <p>© {new Date().getFullYear()} HireFloo. Nominative Fair Use • Non-Affiliated.</p>
          <p>Zero external egress • All analysis runs locally in your browser.</p>
        </div>
      </div>
    </footer>
  );
}
