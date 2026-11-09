import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, X, Laptop } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { useTheme, DESIGN_REGISTRY, Design } from '../theme';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, design, resolvedTheme, setMode, setDesign } = useTheme();

  const navLinks = [
    { label: 'Tools Hub', href: '/tools' },
    { label: 'TalentLens Demo', href: '/demo' },
    { label: 'Career Path', href: '/tools/career-path' },
    { label: 'Methodology', href: '/methodology' },
  ];

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-sp-canvas border-b border-sp-hairline transition-colors">
      <div className="max-w-[1200px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Logo & Quick Home/Back */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2" aria-label="HireFlow Home">
            <Logo />
          </Link>
        </div>

        {/* Centre Links (>= 1024px) */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                to={link.href}
                className={`sp-ui-label normal-case transition-colors duration-150 relative py-2 ${
                  isActive
                    ? 'text-sp-primary-text font-bold'
                    : 'text-sp-ink hover:text-sp-primary-text font-medium'
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sp-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions, Design Selector, Theme Mode Toggle, CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Design Switcher Selector */}
          <div className="hidden sm:block">
            <select
              aria-label="Select design version"
              value={design}
              onChange={(e) => setDesign(e.target.value as Design)}
              className="h-10 px-2.5 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline text-sp-ink sp-caption font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-sp-primary-text"
            >
              {DESIGN_REGISTRY.map((d) => (
                <option key={d.id} value={d.id} className="bg-sp-surface text-sp-ink">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Mode Toggle (light / dark / system) */}
          <button
            type="button"
            title={`Toggle Theme Mode (Current: ${resolvedTheme})`}
            aria-label="Toggle light or dark theme"
            onClick={() => setMode(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline flex items-center justify-center text-sp-ink hover:bg-sp-mint-50 hover:text-sp-primary-text transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-sp-primary-text"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Quick Action CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tools')}
            >
              Tools Hub
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/demo')}
            >
              Try TalentLens
            </Button>
          </div>

          {/* Mobile Menu Button (< 1024px) */}
          <button
            type="button"
            aria-label="Open mobile menu"
            onClick={onOpenMobileMenu}
            className="lg:hidden w-10 h-10 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline flex items-center justify-center text-sp-ink hover:text-sp-primary-text transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
