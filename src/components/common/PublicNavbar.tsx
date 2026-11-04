// ============================================================
// HireFloo — Canonical Public Navigation Bar
// Left: Navigation & Tools Hub | Center: Core Categories
// Right: High-Classic Luxury Executive Profile & Total Google Auth
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { autoSyncManager, SyncState } from '../../lib/sync/autoSyncManager';
import { AuthModal } from '../auth/AuthModal';
import { toast } from '../ui/Toast';

export function PublicNavbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);

  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const unsub = autoSyncManager.subscribe((state, lastTime) => {
      setSyncState(state);
      setLastSyncedAt(lastTime);
    });
    return unsub;
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualSync = async () => {
    toast('info', 'Syncing your evaluations and resumes to the cloud...');
    const ok = await autoSyncManager.triggerPushSync();
    if (ok) {
      toast('success', 'All evaluations and candidate facts synced across your devices!');
    } else {
      toast('warning', 'Sync deferred. Data safely saved in local ledger.');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast('info', 'Signed out. Your candidate profile and data remain safely stored locally.');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-[#070709] border-b border-charcoal/90 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          
          {/* ── Left: Controls, Logo, and TOOLS HUB Button ── */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* History controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                title="Go to Home"
                aria-label="Go to home"
                onClick={() => navigate('/')}
                className="w-8 h-8 rounded-lg bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-5a1 1 0 0 1-1-1v-4.5h-3V20a1 1 0 0 1-1 1.5h-5A1.5 1.5 0 0 1 3 20z" />
                </svg>
              </button>
              <button
                type="button"
                title="Go back"
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt font-mono text-sm leading-none"
              >
                ←
              </button>
              <button
                type="button"
                title="Go forward"
                aria-label="Go forward"
                onClick={() => navigate(1)}
                className="w-8 h-8 rounded-lg bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt font-mono text-sm leading-none"
              >
                →
              </button>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-8 h-8 rounded-lg bg-near-black border border-charcoal flex items-center justify-center text-volt font-black text-sm group-hover:border-volt transition-colors">
                H
              </div>
              <span className="text-[19px] font-black text-white tracking-tight font-sans">
                HIRE<span className="text-volt">FLOO</span>
              </span>
            </Link>

            {/* 🌟 TOOLS HUB — Positioned on the Left Side! */}
            <Link
              to="/tools"
              className="group hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-black bg-volt hover:bg-[#1a1a1a] hover:text-white border border-volt transition-all shadow-[0_0_15px_rgba(245,255,0,0.18)] hover:shadow-[0_0_24px_rgba(245,255,0,0.35)] select-none cursor-pointer"
              title="Open Central Tools Hub"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-black group-hover:text-volt transition-colors" />
              <span className="text-black group-hover:text-white font-black">TOOLS HUB</span>
              <span className="font-mono text-xs text-black group-hover:text-volt transition-colors">→</span>
            </Link>
          </div>

          {/* ── Center: High-Contrast Category Links ── */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              to="/demo"
              className="text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
            >
              TALENTLENS
            </Link>
            <Link
              to="/tools/resume-checker"
              className="text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
            >
              ATS ROASTER
            </Link>
            <Link
              to="/tools/career-path"
              className="text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
            >
              CAREER TRAJECTORY
            </Link>
            <Link
              to="/tools/credential-engine"
              className="text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
            >
              OPPORTUNITIES
            </Link>
          </div>

          {/* ── Right: High-Classic Luxury Executive Profile & Total Google Auth ── */}
          <div className="flex items-center gap-3">
            {!currentUser ? (
              /* Case 1: Logged Out — High-Classic Executive Sign In */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="relative group inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-b from-[#1c1c20] via-[#121215] to-[#0a0a0d] border border-neutral-700/80 hover:border-volt/80 shadow-[0_2px_12px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(245,255,0,0.22)] transition-all duration-200 cursor-pointer overflow-hidden"
                  title="Sign In with Google or Email"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                  
                  {/* Google 'G' Mark */}
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                  </svg>

                  <span className="tracking-wide">Sign In</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-volt/10 text-volt border border-volt/30 font-semibold">
                    PRO
                  </span>
                </button>

                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
                  title="Open Dedicated Login Portal"
                >
                  Portal ↗
                </Link>
              </div>
            ) : (
              /* Case 2: Logged In (e.g. Mohit) — Ultra-Premium Executive Profile Pill */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer border ${
                    userDropdownOpen
                      ? 'bg-[#18181b] border-volt shadow-[0_0_20px_rgba(245,255,0,0.25)]'
                      : 'bg-gradient-to-b from-[#18181b] to-[#0e0e11] border-neutral-700/80 hover:border-volt/70 hover:shadow-[0_0_16px_rgba(245,255,0,0.18)]'
                  }`}
                  aria-expanded={userDropdownOpen}
                >
                  {/* Luxury Monogram with Glowing Ring & Sync Beacon */}
                  <div className="relative">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border border-volt/50 flex items-center justify-center text-volt font-black text-xs shadow-inner group-hover:scale-105 transition-transform">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
                    </div>
                    {/* Live Sync Beacon */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black ${
                        syncState === 'syncing'
                          ? 'bg-volt animate-spin'
                          : syncState === 'synced'
                          ? 'bg-emerald-400 animate-pulse'
                          : syncState === 'offline'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      title={
                        syncState === 'syncing'
                          ? 'Syncing to cloud...'
                          : syncState === 'synced'
                          ? 'Encrypted cloud sync active'
                          : 'Offline storage'
                      }
                    />
                  </div>

                  {/* Display Name + PRO Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold tracking-tight text-xs max-w-[110px] truncate uppercase">
                      {currentUser.displayName.split(' ')[0]}
                    </span>
                    <span className="hidden sm:inline-flex items-center text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-volt/10 text-volt border border-volt/30">
                      PRO
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-volt transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-volt' : ''
                    }`}
                  />
                </button>

                {/* 🌟 Ultra-Premium Executive Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-72 bg-[#0c0c0e]/98 backdrop-blur-2xl border border-neutral-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 z-50 animate-fade-in text-xs font-mono">
                    {/* Header */}
                    <div className="pb-3 border-b border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-volt text-black font-black flex items-center justify-center text-sm shadow-md flex-shrink-0">
                          {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-black text-white text-sm truncate uppercase tracking-tight">
                            {currentUser.displayName}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate">
                            {currentUser.email || 'Verified Candidate'}
                          </div>
                        </div>
                      </div>

                      {/* Google / Cloud Sync Status */}
                      <div className="mt-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Cloud Sync Calibrated</span>
                        </div>
                        {lastSyncedAt && (
                          <span className="text-[9px] text-neutral-500">{lastSyncedAt}</span>
                        )}
                      </div>
                    </div>

                    {/* Quick Executive Shortcuts */}
                    <div className="py-2.5 space-y-1">
                      <button
                        type="button"
                        onClick={handleManualSync}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/[0.05] text-neutral-300 hover:text-white flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <RefreshCw className="w-3.5 h-3.5 text-volt group-hover:rotate-180 transition-transform" />
                          <span>Sync Cloud Now</span>
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                          Instant
                        </span>
                      </button>

                      <Link
                        to="/data"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/[0.05] text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Saved Resumes &amp; Scores</span>
                      </Link>

                      <Link
                        to="/history"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/[0.05] text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Audit Scan History</span>
                      </Link>

                      <Link
                        to="/jd-library"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/[0.05] text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Saved JD Library</span>
                      </Link>

                      <Link
                        to="/tools"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white/[0.05] text-neutral-300 hover:text-white flex items-center gap-2.5 transition-colors"
                      >
                        <LayoutGrid className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Central Tools Hub</span>
                      </Link>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-2.5 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </span>
                        <span className="text-[10px] text-neutral-500 group-hover:text-rose-400">
                          Keep local data
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-8 h-8 rounded-lg bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-volt transition-colors focus-visible:outline-2 focus-visible:outline-volt font-mono text-base cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-charcoal bg-[#070709] px-4 py-4 space-y-3 shadow-level-3 animate-fade-in font-mono">
            {/* Mobile Account Row */}
            <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] flex items-center justify-between">
              {!currentUser ? (
                <div className="w-full flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-volt text-black font-bold text-xs uppercase flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Sign In</span>
                  </button>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-xs uppercase font-bold"
                  >
                    Portal ↗
                  </Link>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-volt text-black font-black flex items-center justify-center text-xs">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{currentUser.displayName}</div>
                      <div className="text-[10px] text-emerald-400">● Cloud Synced</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-1">
              <Link
                to="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-black bg-volt flex items-center justify-between"
              >
                <span>OPEN TOOLS HUB</span>
                <span>→</span>
              </Link>
              <Link
                to="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>TALENTLENS SIMULATOR</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/tools/resume-checker"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>ATS ROASTER</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/tools/career-path"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>CAREER TRAJECTORY</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/tools/credential-engine"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>CREDENTIAL & OPPORTUNITY ENGINE</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/data"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[12px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>YOUR DATA & PRIVACY</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
