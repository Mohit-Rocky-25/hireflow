import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { SyncStatusPill } from '@/sync/SyncStatusPill';
import { Compass, FileText, LogOut, Sparkles } from 'lucide-react';

export const PortalHeader: React.FC = () => {
  const navigate = useNavigate();
  const { email, signOut } = useAuthStore();
  const { profile } = useProfileStore();
  const { workspaces, activeWorkspaceId, setActive } = useResumeStore();

  const activeWorkspaces = Object.values(workspaces).filter((w) => !w.archivedAt);
  const activeWs = activeWorkspaceId ? workspaces[activeWorkspaceId] : activeWorkspaces[0];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090907]/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4 font-mono text-xs">
        {/* Left: Branding & Candidate Badge */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-bold text-neutral-100 text-sm tracking-tight group-hover:text-[#faff69] transition-colors">
              HIREFLOW
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30 uppercase font-semibold">
              Candidate Hub
            </span>
          </Link>

          <span className="text-neutral-700 hidden sm:inline">/</span>

          {/* Active Resume Workspace Selector */}
          <div className="hidden sm:flex items-center gap-2 text-neutral-400">
            <FileText className="w-3.5 h-3.5 text-[#faff69]" />
            <span>Active Track:</span>
            {activeWorkspaces.length > 0 ? (
              <select
                value={activeWs?.id || ''}
                onChange={(e) => setActive(e.target.value)}
                className="bg-[#141410] border border-neutral-800 text-neutral-200 rounded px-2 py-1 text-xs outline-none focus:border-[#faff69]"
              >
                {activeWorkspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.roleTrack || 'General'})
                  </option>
                ))}
              </select>
            ) : (
              <Link to="/portal/resumes" className="text-neutral-500 hover:text-neutral-300 underline">
                No active track (Create one)
              </Link>
            )}
            <Link
              to="/portal/resumes"
              className="text-[10px] text-[#faff69] hover:underline ml-1"
            >
              Matrix &rarr;
            </Link>
          </div>
        </div>

        {/* Right: Sync Status, Candidate Info & Sign Out */}
        <div className="flex items-center gap-3">
          <SyncStatusPill />

          <div className="hidden md:flex flex-col items-end text-[11px] leading-tight">
            <span className="text-neutral-200 font-medium">
              {profile.displayName || 'Candidate'}
            </span>
            <span className="text-[10px] text-neutral-500">
              {email || (profile.degree ? `${profile.degree} ${profile.branch || ''}` : 'Local Account')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 rounded border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

