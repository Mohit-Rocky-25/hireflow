// ============================================================
// HireFlow Navigation System — Unified AppShell Layout
// Mounts left-edge persistent sidebar, top navigation bar,
// skip-to-content accessibility link, breadcrumbs, and command palette
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  ChevronLeft,
  Home,
  Bell,
  Search,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { CommandPalette } from './CommandPalette';
import { useStore } from '../../store/useStore';

export function AppShellLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentUser,
    logout,
    getUnreadCount,
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    companies,
    currentCompanyId,
  } = useStore();

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;
  const notifications = currentUser ? getUserNotifications(currentUser.id).slice(0, 8) : [];
  const currentCompany = companies.find((c) => c.id === currentCompanyId);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Back button handling: go to previous page in history
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const navButtonClass = `
    group relative overflow-hidden inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl
    text-xs font-bold text-text-secondary bg-surface border border-border
    transition-all duration-150 ease-out outline-none cursor-pointer
    hover:border-text-secondary hover:text-text
    active:scale-[0.97] active:bg-[#0A0A0A] active:text-white active:border-[#0A0A0A]
    focus-visible:scale-[0.97] focus-visible:bg-[#0A0A0A] focus-visible:text-white focus-visible:border-[#0A0A0A]
    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:ring-primary
  `;

  const sweepOverlay = `
    absolute inset-0 bg-[#0A0A0A] translate-y-full
    group-active:translate-y-0 group-focus-visible:translate-y-0
    transition-transform duration-150 ease-out z-0
  `;

  const initials = currentUser
    ? currentUser.displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'HF';

  const getProfileLink = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'PLATFORM_ADMIN') return '/admin/settings';
    if (['BHR_MANAGER', 'HR_RECRUITER'].includes(currentUser.role)) return '/company/settings';
    if (currentUser.role === 'INTERVIEWER') return '/interviewer/profile';
    return '/candidate/profile';
  };

  const getSettingsLink = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'PLATFORM_ADMIN') return '/admin/settings';
    if (['BHR_MANAGER', 'HR_RECRUITER'].includes(currentUser.role)) return '/company/settings';
    return getProfileLink();
  };

  return (
    <div className="min-h-screen bg-bg text-foreground flex flex-col">
      {/* Skip to Main Content Accessibility Landmark */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Persistent Left-Edge Sidebar */}
      <AppSidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area Offset by Sidebar Width */}
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200 ease-out"
        style={{ paddingLeft: 'var(--sidebar-width, 272px)' }}
      >
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-30 h-[64px] bg-surface/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-2xs">
          {/* Left: Mobile hamburger + Back/Home buttons + Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile hamburger toggle (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* In-Page Navigation Buttons (Back & Home with Black Press Effect) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleBack}
                className={navButtonClass}
                aria-label="Go back to previous page"
                title="Go back to previous page"
              >
                <div className={sweepOverlay} />
                <ChevronLeft className="w-4 h-4 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
                <span className="hidden sm:inline relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">
                  Back
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className={navButtonClass}
                aria-label="Go to Home"
                title="Go to Home"
              >
                <div className={sweepOverlay} />
                <Home className="w-3.5 h-3.5 relative z-10 group-active:text-white group-focus-visible:text-white transition-colors" />
                <span className="hidden sm:inline relative z-10 group-active:text-white group-focus-visible:text-white transition-colors">
                  Home
                </span>
              </button>
            </div>

            {/* Breadcrumb Path */}
            <div className="hidden md:flex items-center pl-2 border-l border-border min-w-0">
              <Breadcrumbs />
            </div>
          </div>

          {/* Right: Search shortcut pill + Notification bell + User profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-muted hover:text-text transition-colors text-xs font-semibold cursor-pointer"
              title="Search navigation (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-text-muted" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-surface border border-border rounded text-text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Dropdown */}
            {currentUser && (
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setProfileOpen(false);
                  }}
                  className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition-colors relative cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5 stroke-[1.75px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {notifOpen && (
                  <div
                    className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl shadow-2xl border border-border bg-surface z-50 overflow-hidden animate-scale-in"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2/40">
                      <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-text-muted space-y-2">
                          <Bell className="w-8 h-8 mx-auto opacity-30" />
                          <p className="text-xs font-medium">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.link) navigate(n.link);
                              setNotifOpen(false);
                            }}
                            className={`p-3.5 hover:bg-surface-2 transition-colors cursor-pointer text-left ${
                              !n.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <p className="text-xs font-bold text-foreground">{n.title}</p>
                            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-text-muted mt-1 block font-mono">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            {currentUser ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotifOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer"
                  aria-label="User account menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-active flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                    {initials}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-12 w-64 rounded-2xl shadow-2xl border border-border bg-surface z-50 overflow-hidden animate-scale-in"
                  >
                    <div className="p-4 border-b border-border bg-surface-2/40">
                      <p className="text-sm font-bold text-foreground truncate">{currentUser.displayName}</p>
                      <span className="inline-block px-1.5 py-0.5 mt-1 rounded text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                        {currentUser.role.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-text-muted truncate mt-1">{currentUser.email}</p>
                    </div>

                    <div className="p-1 space-y-0.5 text-xs font-semibold">
                      <Link
                        to={getProfileLink()}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-2 transition-colors"
                      >
                        <User className="w-4 h-4 text-text-muted" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to={getSettingsLink()}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-2 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-text-muted" />
                        <span>Account Settings</span>
                      </Link>

                      {currentUser.role === 'PLATFORM_ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary hover:text-foreground hover:bg-surface-2 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-primary" />
                          <span>Admin Console</span>
                        </Link>
                      )}
                    </div>

                    <div className="p-1 border-t border-border">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors font-bold text-xs cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 shadow-2xs transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          <Outlet />
        </main>
      </div>

      {/* Navigation Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
