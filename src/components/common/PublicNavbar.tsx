import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LogOut,
  ChevronDown,
  LayoutGrid,
  Menu,
  X,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  Home,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useCloudSyncStore } from '@/lib/cloud/useCloudSyncStore';

export function PublicNavbar() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { status, email, displayName, avatarUrl, isDemo, signOut, deleteAllCloudData, openSignIn } = useAuthStore();
  const { workspaces, activeWorkspaceId, setActive } = useResumeStore();
  const cloudSyncPhase = useCloudSyncStore((s) => s.phase);

  const [chipMenuOpen, setChipMenuOpen] = useState(false);
  const [compactLinksOpen, setCompactLinksOpen] = useState(false);

  const chipRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === 'authenticated';
  const isMySpaceOpen =
    Boolean(searchParams.get('my')) ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/my-space'));

  const syncStatusText = !isAuthenticated
    ? 'Guest session (in-memory only)'
    : isDemo
    ? 'Demo Mode (in-session only, not cloud-backed)'
    : cloudSyncPhase === 'hydrating'
    ? 'Loading cloud account...'
    : cloudSyncPhase === 'saving'
    ? 'Saving to cloud...'
    : cloudSyncPhase === 'error'
    ? 'Cloud sync error — retry needed'
    : 'Synced to Supabase Cloud';

  // Click outside listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chipRef.current && !chipRef.current.contains(event.target as Node)) {
        setChipMenuOpen(false);
      }
      if (compactRef.current && !compactRef.current.contains(event.target as Node)) {
        setCompactLinksOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMySpace = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate('/my-space');
  };

  const handleSignOut = async () => {
    setChipMenuOpen(false);
    await signOut();
    if (isMySpaceOpen) {
      const next = new URLSearchParams(searchParams);
      next.delete('my');
      next.delete('audit');
      setSearchParams(next);
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/my-space')) {
        navigate('/');
      }
    }
  };

  const handleDeleteCloudData = async () => {
    if (window.confirm('Delete all your synced data from cloud storage?')) {
      setChipMenuOpen(false);
      await deleteAllCloudData();
    }
  };

  const firstName = (displayName || 'Candidate').split(' ')[0];
  const workspaceList = Object.values(workspaces);

  return (
    <header className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 w-[min(1240px,94vw)] max-w-full h-[60px] max-md:h-[54px] max-md:top-2 flex items-center justify-between gap-4 px-3 sm:px-4 rounded-full border border-[#24241c] bg-[#0e0e0b]/85 backdrop-blur-md text-[#f1f1e8] shadow-lg">
      {/* ── Left: Home, Back, Forward, Logo, and TOOLS HUB ── */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Home button */}
          <button
            type="button"
            title="Go to Home"
            aria-label="Go to home"
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full border border-[#24241c] bg-[#16160f]/60 flex items-center justify-center text-[#9b9b8c] hover:text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[#faff69] cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
          </button>

          {/* Back button */}
          <button
            type="button"
            title="Go back"
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full border border-[#24241c] bg-[#16160f]/60 flex items-center justify-center text-[#9b9b8c] hover:text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[#faff69] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* Forward button */}
          <button
            type="button"
            title="Go forward"
            aria-label="Go forward"
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full border border-[#24241c] bg-[#16160f]/60 flex items-center justify-center text-[#9b9b8c] hover:text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors focus-visible:outline-2 focus-visible:outline-[#faff69] cursor-pointer max-sm:hidden"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-[#f1f1e8] hover:opacity-90 transition-opacity">
          <span className="w-[30px] h-[30px] rounded-lg border border-[#24241c] bg-[#16160f] flex items-center justify-center text-sm font-black text-[#faff69]">
            H
          </span>
          <span className="max-sm:hidden tracking-wider text-[15px]">HIREFLOW</span>
        </Link>

        {/* Tools Hub Pill */}
        <Link
          to="/tools"
          className="h-[36px] px-3.5 sm:px-4 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#ebf059] transition-colors shadow-sm select-none shrink-0"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Tools Hub</span>
          <span className="font-mono text-xs">&rarr;</span>
        </Link>
      </div>

      {/* ── Center: Desktop Navigation Links (Visible >= 1100px) ── */}
      <nav className="hidden min-[1100px]:flex items-center gap-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#f1f1e8]/90">
        <Link to="/demo" className="hover:text-[#faff69] transition-colors">
          TalentLens
        </Link>
        <Link to="/tools/resume-checker" className="hover:text-[#faff69] transition-colors">
          ATS Roaster
        </Link>
        <Link to="/tools/career-path" className="hover:text-[#faff69] transition-colors">
          Career Trajectory
        </Link>
        <Link to="/tools/credential-engine" className="hover:text-[#faff69] transition-colors">
          Opportunities
        </Link>
      </nav>

      {/* ── Right: Compact Nav Menu (under 1100px) + Sign In or My Space + Account Chip ── */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Compact dropdown trigger below 1100px */}
        <div className="relative min-[1100px]:hidden" ref={compactRef}>
          <button
            type="button"
            aria-label="Navigation menu"
            onClick={() => setCompactLinksOpen(!compactLinksOpen)}
            className="w-9 h-9 rounded-full border border-[#24241c] flex items-center justify-center text-[#9b9b8c] hover:text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors"
          >
            {compactLinksOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {compactLinksOpen && (
            <div className="absolute right-0 top-12 w-48 py-2 rounded-xl border border-[#24241c] bg-[#10100d] shadow-xl text-xs font-semibold uppercase tracking-wider space-y-1 z-50">
              <Link
                to="/demo"
                onClick={() => setCompactLinksOpen(false)}
                className="block px-4 py-2 text-[#9b9b8c] hover:text-[#faff69] hover:bg-[#16160f] transition-colors"
              >
                TalentLens
              </Link>
              <Link
                to="/tools/resume-checker"
                onClick={() => setCompactLinksOpen(false)}
                className="block px-4 py-2 text-[#9b9b8c] hover:text-[#faff69] hover:bg-[#16160f] transition-colors"
              >
                ATS Roaster
              </Link>
              <Link
                to="/tools/career-path"
                onClick={() => setCompactLinksOpen(false)}
                className="block px-4 py-2 text-[#9b9b8c] hover:text-[#faff69] hover:bg-[#16160f] transition-colors"
              >
                Career Trajectory
              </Link>
              <Link
                to="/tools/credential-engine"
                onClick={() => setCompactLinksOpen(false)}
                className="block px-4 py-2 text-[#9b9b8c] hover:text-[#faff69] hover:bg-[#16160f] transition-colors"
              >
                Opportunities
              </Link>
            </div>
          )}
        </div>

        {!isAuthenticated ? (
          /* Case 1: Guest -> Demo Mode + Sign in */
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="h-[38px] px-3.5 rounded-full border border-[#faff69]/40 bg-[#faff69]/10 text-[#faff69] font-semibold text-[12px] flex items-center hover:bg-[#faff69]/20 transition-colors"
            >
              Demo Mode
            </Link>
            <button
              type="button"
              onClick={() => openSignIn()}
              className="h-[38px] px-4 rounded-full border border-[#24241c] bg-[#16160f] text-[#f1f1e8] font-semibold text-[13px] hover:border-[#faff69]/50 hover:text-[#faff69] transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>
        ) : (
          /* Case 2: Signed in -> My Space button + Account Chip */
          <>
            <button
              type="button"
              onClick={toggleMySpace}
              aria-expanded={isMySpaceOpen}
              className={`h-[38px] px-3.5 sm:px-4 rounded-full border text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMySpaceOpen
                  ? 'border-[#faff69] text-[#faff69] bg-[#16160f]'
                  : 'border-[#24241c] bg-[#16160f] text-[#f1f1e8] hover:border-[#faff69]/50 hover:text-[#faff69]'
              }`}
            >
              <span>My Space</span>
              {isDemo && (
                <span className="px-1.5 py-0.5 rounded bg-[#faff69]/15 text-[#faff69] font-mono text-[9px] uppercase tracking-wider">
                  Demo
                </span>
              )}
            </button>

            {/* Account Chip */}
            <div className="relative" ref={chipRef}>
              <button
                type="button"
                onClick={() => setChipMenuOpen(!chipMenuOpen)}
                aria-expanded={chipMenuOpen}
                aria-label="Account menu"
                className="h-[38px] pl-1 pr-3 max-sm:pr-1 rounded-full border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 flex items-center gap-2 transition-colors cursor-pointer"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#faff69]/10 text-[#faff69] flex items-center justify-center font-bold text-xs">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-[13px] font-semibold text-[#f1f1e8] max-sm:hidden">
                  {firstName}
                </span>
              </button>

              {/* Account Chip Menu */}
              {chipMenuOpen && (
                <div className="absolute right-0 top-12 w-64 p-3 rounded-2xl border border-[#24241c] bg-[#10100d] shadow-2xl text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="pb-2.5 mb-2.5 border-b border-[#24241c]">
                    <div className="font-semibold text-sm text-[#f1f1e8]">{displayName || 'Candidate'}</div>
                    {email && (
                      <div className="text-[11px] text-[#9b9b8c] font-mono truncate mt-0.5">
                        {email}
                      </div>
                    )}
                  </div>

                  {/* Active Resume Track Select */}
                  {workspaceList.length > 0 && (
                    <div className="mb-3">
                      <label className="block text-[11px] font-mono uppercase text-[#6d6d61] mb-1.5">
                        Active Resume Track
                      </label>
                      <select
                        value={activeWorkspaceId || workspaceList[0]?.id}
                        onChange={(e) => setActive(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8] text-xs outline-none focus:border-[#faff69]"
                      >
                        {workspaceList.map((ws) => (
                          <option key={ws.id} value={ws.id}>
                            {ws.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sync Status in Plain Words */}
                  <div className="mb-3 px-2 py-1.5 rounded-lg bg-[#16160f] border border-[#24241c] text-[#9b9b8c] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#faff69] shrink-0" />
                    <span className="text-[11.5px] leading-tight">{syncStatusText}</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1 pt-1 border-t border-[#24241c]">
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={handleDeleteCloudData}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/20 transition-colors text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete my cloud data</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#9b9b8c] hover:text-[#f1f1e8] hover:bg-[#16160f] transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
