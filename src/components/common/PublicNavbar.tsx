import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, CheckCircle2, RefreshCw, LogOut, User, ChevronDown, Sparkles } from 'lucide-react';
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
      toast('success', 'All data synced across your devices!');
    } else {
      toast('warning', 'Sync deferred. Data saved locally.');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    toast('info', 'Signed out. Your local data remains safe on this device.');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-black border-b border-charcoal">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Go to Home"
                aria-label="Go to home"
                onClick={() => navigate('/')}
                className="w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt"
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
                className="w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt font-mono text-sm leading-none"
              >
                ←
              </button>
              <button
                type="button"
                title="Go forward"
                aria-label="Go forward"
                onClick={() => navigate(1)}
                className="w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-white hover:bg-hover-gray active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-volt font-mono text-sm leading-none"
              >
                →
              </button>
            </div>

            <Link to="/" className="flex items-center gap-2.5 group select-none">
              <div className="w-8 h-8 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt font-black text-sm group-hover:border-volt transition-colors">
                H
              </div>
              <span className="text-[20px] font-black text-white tracking-tight font-sans">
                HIRE<span className="text-volt">FLO</span>
              </span>
            </Link>
          </div>

          {/* Center: High-Contrast Category Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              to="/demo"
              className="text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt active:text-pale-yellow transition-colors"
            >
              TALENTLENS
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

          {/* Right Action & Cloud Account Controls */}
          <div className="flex items-center gap-3">
            
            {/* Auto-Sync / Account Pill */}
            {!currentUser ? (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-surface border border-charcoal hover:border-volt/50 transition-colors"
                title="Sign in to sync your data across devices"
              >
                <Cloud className="w-3.5 h-3.5 text-volt" />
                <span>Cloud Sync / Sign In</span>
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-surface border border-charcoal hover:border-volt transition-colors"
                >
                  {/* Status Indicator */}
                  {syncState === 'syncing' ? (
                    <RefreshCw className="w-3.5 h-3.5 text-volt animate-spin" />
                  ) : syncState === 'synced' ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ) : syncState === 'offline' ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  ) : (
                    <Cloud className="w-3.5 h-3.5 text-volt" />
                  )}

                  <span className="text-white font-bold truncate max-w-[100px] sm:max-w-[130px]">
                    {currentUser.displayName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-surface border border-charcoal rounded-xl shadow-level-3 p-3 z-50 animate-fade-in text-xs font-mono">
                    <div className="pb-3 border-b border-charcoal">
                      <div className="font-bold text-white truncate">{currentUser.displayName}</div>
                      <div className="text-[11px] text-neutral-400 truncate">{currentUser.email}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Cloud Auto-Sync Active</span>
                      </div>
                      {lastSyncedAt && (
                        <div className="text-[10px] text-neutral-500 mt-1">
                          Last synced: {lastSyncedAt}
                        </div>
                      )}
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        type="button"
                        onClick={handleManualSync}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-surface-elevated text-neutral-300 hover:text-white flex items-center justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 text-volt" />
                          <span>Sync Now</span>
                        </span>
                        <span className="text-[10px] text-neutral-500">Instant</span>
                      </button>

                      <Link
                        to="/data"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-surface-elevated text-neutral-300 hover:text-white flex items-center gap-2"
                      >
                        <Cloud className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Storage & Privacy Settings</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-charcoal">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-500/10 text-rose-400 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/tools"
              className="group hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded text-[13px] font-bold !text-black bg-volt hover:bg-[#1d1d1d] hover:!text-white border border-volt transition-colors active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt"
            >
              <span className="!text-black group-hover:!text-white font-black">OPEN TOOLS HUB</span>
              <span className="font-mono text-sm leading-none !text-black group-hover:!text-white">→</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded bg-near-black border border-charcoal flex items-center justify-center text-silver hover:text-volt transition-colors focus-visible:outline-2 focus-visible:outline-volt font-mono text-base"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-charcoal bg-black px-4 py-4 space-y-2 shadow-level-3 animate-fade-in font-mono">
            {/* Mobile Account Row */}
            <div className="p-3 mb-2 rounded-lg bg-surface border border-charcoal flex items-center justify-between">
              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                  className="w-full py-2 px-3 rounded bg-volt text-black font-bold text-xs uppercase flex items-center justify-center gap-2"
                >
                  <Cloud className="w-4 h-4 text-black" />
                  <span>Sign In for Multi-Device Sync</span>
                </button>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-xs">{currentUser.displayName}</div>
                    <div className="text-[10px] text-emerald-400">● Cloud Synced</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Link
                to="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>TALENTLENS SIMULATOR</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>DECISION SUITE HUB</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/tools/resume-checker"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>ATS ROASTER</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/tools/career-path"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>CAREER TRAJECTORY</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/tools/credential-engine"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
              >
                <span>CREDENTIAL & OPPORTUNITY ENGINE</span>
                <span className="font-mono text-silver text-xs">→</span>
              </Link>
              <Link
                to="/data"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded text-[13px] font-semibold uppercase tracking-[1.4px] text-white hover:text-volt hover:bg-near-black flex items-center justify-between transition-colors"
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
