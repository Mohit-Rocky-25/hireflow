import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTheme, DESIGN_REGISTRY, Design } from '../theme';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation();
  const { design, setDesign } = useTheme();

  const navLinks = [
    { label: 'Tools Hub', href: '/tools' },
    { label: 'TalentLens Demo', href: '/demo' },
    { label: 'ATS Resume Roaster', href: '/tools/resume-checker' },
    { label: 'Resume Tailor', href: '/tools/tailor' },
    { label: 'Reach Out Generator', href: '/tools/reach-out' },
    { label: 'Project Build Briefs', href: '/tools/build-briefs' },
    { label: 'Career Path & Levels', href: '/tools/career-path' },
    { label: 'Credential Engine', href: '/tools/credential-engine' },
    { label: 'Methodology & Transparency', href: '/methodology' },
  ];

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Navigation Menu">
      <div className="flex flex-col gap-6">
        {/* Navigation Links */}
        <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
                className={`py-2.5 px-3 rounded-sp-xs sp-ui-label normal-case transition-colors ${
                  isActive
                    ? 'bg-sp-mint-100 text-sp-primary-text font-bold'
                    : 'text-sp-ink hover:bg-sp-canvas-soft'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Switch Design Version */}
        <div className="pt-4 border-t border-sp-hairline">
          <label htmlFor="mobile-design-select" className="sp-caption text-sp-muted block mb-2">
            Active Design System
          </label>
          <select
            id="mobile-design-select"
            value={design}
            onChange={(e) => setDesign(e.target.value as Design)}
            className="w-full h-11 px-3 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline text-sp-ink sp-caption font-semibold"
          >
            {DESIGN_REGISTRY.map((d) => (
              <option key={d.id} value={d.id} className="bg-sp-surface text-sp-ink">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-sp-hairline">
          <Link to="/demo" onClick={onClose} className="w-full">
            <Button variant="primary" className="w-full">
              Try TalentLens
            </Button>
          </Link>
          <Link to="/tools" onClick={onClose} className="w-full">
            <Button variant="outline" className="w-full">
              Explore Tools Hub
            </Button>
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
