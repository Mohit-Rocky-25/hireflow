// ============================================================
// HireFlow Navigation System — Left-Edge Persistent Sidebar
// Full-height panel, 272px expanded / 72px collapsed rail,
// role-aware progressive disclosure accordions, WCAG 2.2 AA compliant
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Search,
  LogOut,
  User,
  Settings,
  Shield,
  X,
  Compass,
} from 'lucide-react';
import { getSidebarEntriesForRole } from '../../navigation/registry';
import { getNavIcon } from '../../navigation/icons';
import { useStore } from '../../store/useStore';
import type { NavSection, NavEntry, NavBadge } from '../../navigation/types';

const COLLAPSED_STORAGE_KEY = 'hireflow_sidebar_collapsed';

export interface AppSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  onOpenCommandPalette: () => void;
}

export function AppSidebar({
  isMobileOpen,
  onMobileClose,
  onOpenCommandPalette,
}: AppSidebarProps) {
  const { currentUser, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarNavRef = useRef<HTMLElement>(null);

  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    // On tablet viewports (768px - 1023px), default to collapsed rail
    const width = window.innerWidth;
    if (width >= 768 && width < 1024) return true;
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
  });

  // Track accordion open sections
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set());

  // Listen for Ctrl+B / Cmd+B keyboard shortcut to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsCollapsed((prev) => {
          const next = !prev;
          localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update CSS variable --sidebar-width on the document root
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 1024) {
        document.documentElement.style.setProperty('--sidebar-width', '0px');
      } else {
        document.documentElement.style.setProperty(
          '--sidebar-width',
          isCollapsed ? '72px' : '272px'
        );
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isCollapsed]);

  // Read sidebar navigation data for current role
  const { rootEntries, sections } = useMemo(() => {
    return getSidebarEntriesForRole(currentUser?.role || 'public');
  }, [currentUser?.role]);

  // Auto-expand the accordion section containing the active route
  useEffect(() => {
    const activeSection = sections.find(({ entries }) =>
      entries.some((entry) => location.pathname === entry.route || (entry.route !== '/' && location.pathname.startsWith(entry.route)))
    );

    if (activeSection) {
      setOpenSectionIds((prev) => {
        const next = new Set(prev);
        next.add(activeSection.section.id);
        return next;
      });
    }
  }, [location.pathname, sections]);

  // Handle accordion toggle
  const toggleSection = (sectionId: string) => {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Toggle desktop collapsed mode
  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  };

  // Handle item navigation click
  const handleItemClick = () => {
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (isMobileOpen) onMobileClose();
  };

  // Resolve dynamic badge text/count
  const renderBadge = (badgeConfig?: NavBadge | (() => NavBadge | null)) => {
    if (!badgeConfig) return null;
    const badge = typeof badgeConfig === 'function' ? badgeConfig() : badgeConfig;
    if (!badge) return null;

    const countVal = badge.dynamicCount ? badge.dynamicCount() : badge.count;
    const textVal = badge.text || (countVal !== undefined ? String(countVal) : '');
    if (!textVal) return null;

    const variantStyles = {
      primary: 'bg-primary/15 text-primary border-primary/25',
      emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
      amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      slate: 'bg-surface-3 text-text-secondary border-border',
    }[badge.variant || 'primary'];

    return (
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${variantStyles}`}>
        {textVal}
      </span>
    );
  };

  // Home target based on role
  const getHomeTarget = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'PLATFORM_ADMIN':
        return '/admin/dashboard';
      case 'BHR_MANAGER':
      case 'HR_RECRUITER':
        return '/company/dashboard';
      case 'INTERVIEWER':
        return '/interviewer/dashboard';
      case 'CANDIDATE':
        return '/candidate/dashboard';
      default:
        return '/';
    }
  };

  const initials = currentUser
    ? currentUser.displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'HF';

  return (
    <>
      {/* Mobile Drawer Backdrop Scrim (< 1024px) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        ref={sidebarNavRef}
        aria-label="Sidebar Navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 bg-surface border-r border-border flex flex-col transition-all duration-200 ease-out select-none
          ${/* Desktop Dimensions */ ''}
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[272px]'}
          ${/* Mobile Drawer Placement */ ''}
          ${isMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header / Brand Logo */}
        <div className="h-[68px] px-4 flex items-center justify-between border-b border-border shrink-0 bg-surface">
          <Link
            to={getHomeTarget()}
            onClick={handleItemClick}
            className="flex items-center gap-3 min-w-0 group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1"
            title="Go to Home / Dashboard"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shrink-0 shadow-sm shadow-primary/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white stroke-[2px]" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 truncate">
                <span className="text-[17px] font-black text-foreground tracking-tight block leading-tight">
                  HireFlow
                </span>
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  AI Hiring Platform
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Close navigation drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop Collapse Toggle in Header */}
          {!isMobileOpen && (
            <button
              onClick={handleToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Quick Search / Command Palette Trigger (Ctrl+K) */}
        <div className="p-3 border-b border-border/80 shrink-0">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-muted hover:text-foreground transition-all text-xs font-semibold group cursor-pointer ${
              isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
            }`}
            title="Search sections, pages & tools (Ctrl+K)"
            aria-label="Quick search navigation"
          >
            <Search className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0" />
            {(!isCollapsed || isMobileOpen) && (
              <>
                <span className="truncate flex-1 text-left">Search pages...</span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-surface border border-border text-text-muted">
                  ⌘K
                </kbd>
              </>
            )}
          </button>
        </div>

        {/* Navigation Content Area */}
        <nav
          className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin"
          aria-label="Primary Application Navigation"
        >
          {/* Top Root Entries (e.g. Home / Dashboard) */}
          {rootEntries.length > 0 && (
            <div className="space-y-1">
              {rootEntries.map((entry) => {
                const isActive =
                  location.pathname === entry.route ||
                  (entry.route !== '/' && location.pathname === entry.route + '/');

                return (
                  <NavLink
                    key={entry.id}
                    to={entry.route}
                    onClick={handleItemClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl min-h-[44px] text-[15px] font-semibold transition-all group relative ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                        : 'text-text-secondary hover:bg-surface-2 hover:text-foreground'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed && !isMobileOpen ? entry.label : undefined}
                  >
                    {/* Left Active Accent Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-md" />
                    )}

                    <span className={`shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-foreground'}`}>
                      {getNavIcon(entry.icon, 'w-5 h-5')}
                    </span>

                    {(!isCollapsed || isMobileOpen) && (
                      <>
                        <span className="truncate flex-1">{entry.label}</span>
                        {renderBadge(entry.badge)}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}

          {/* Collapsible Sections Accordion */}
          {sections.map(({ section, entries }) => {
            const isOpen = openSectionIds.has(section.id);
            const isSectionActive = entries.some(
              (entry) => location.pathname === entry.route || (entry.route !== '/' && location.pathname.startsWith(entry.route))
            );

            // Collapsed rail mode: show section icon with popover tooltip
            if (isCollapsed && !isMobileOpen) {
              return (
                <div key={section.id} className="pt-2 border-t border-border/60 first:border-t-0 first:pt-0 space-y-1">
                  {entries.map((entry) => {
                    const isActive =
                      location.pathname === entry.route ||
                      (entry.route !== '/' && location.pathname.startsWith(entry.route));

                    return (
                      <NavLink
                        key={entry.id}
                        to={entry.route}
                        onClick={handleItemClick}
                        className={`flex items-center justify-center h-11 w-full rounded-xl transition-all group relative ${
                          isActive
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-text-secondary hover:bg-surface-2 hover:text-foreground'
                        }`}
                        title={`${section.label}: ${entry.label}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-md" />
                        )}
                        <span className={`transition-colors ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-foreground'}`}>
                          {getNavIcon(entry.icon, 'w-5 h-5')}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              );
            }

            // Expanded Mode: Collapsible Accordion Header + Subsections
            return (
              <div key={section.id} className="pt-2 border-t border-border/60 first:border-t-0 first:pt-0">
                {/* Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isOpen}
                  aria-controls={`nav-section-${section.id}`}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer group ${
                    isSectionActive
                      ? 'text-primary'
                      : 'text-text-muted hover:text-foreground hover:bg-surface-2/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="shrink-0 opacity-80">{getNavIcon(section.icon, 'w-3.5 h-3.5')}</span>
                    <span className="truncate">{section.label}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>

                {/* Section Items */}
                {isOpen && (
                  <div id={`nav-section-${section.id}`} className="mt-1 space-y-0.5 pl-2">
                    {entries.map((entry) => {
                      const isActive =
                        location.pathname === entry.route ||
                        (entry.route !== '/' && location.pathname.startsWith(entry.route));

                      return (
                        <NavLink
                          key={entry.id}
                          to={entry.route}
                          onClick={handleItemClick}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl min-h-[44px] text-[15px] font-semibold transition-all group relative ${
                            isActive
                              ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                              : 'text-text-secondary hover:bg-surface-2 hover:text-foreground'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          {/* Left Accent Bar on active item */}
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-md" />
                          )}

                          <span className={`shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-foreground'}`}>
                            {getNavIcon(entry.icon, 'w-4 h-4')}
                          </span>

                          <span className="truncate flex-1">{entry.label}</span>

                          {renderBadge(entry.badge)}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom User Profile & Sign Out Bar */}
        {currentUser ? (
          <div className="p-3 border-t border-border bg-surface-2/50 shrink-0">
            <div className={`flex items-center gap-3 ${isCollapsed && !isMobileOpen ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-active flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                {initials}
              </div>

              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">{currentUser.displayName}</p>
                  <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20 truncate">
                    {currentUser.role.replace(/_/g, ' ')}
                  </span>
                </div>
              )}

              {(!isCollapsed || isMobileOpen) && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign out of account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-border shrink-0">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <User className="w-4 h-4" />
              {(!isCollapsed || isMobileOpen) && <span>Sign In</span>}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
