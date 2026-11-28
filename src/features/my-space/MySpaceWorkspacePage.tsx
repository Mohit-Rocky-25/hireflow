// ============================================================
// HireFlow — Phase 12 Reconstructed My Space Workspace
// Central authenticated/demo workspace unifying career assets,
// continuation workflows, activity feed, nested inspector,
// history, saved JDs, data management, and tool handoffs.
// ============================================================

import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  TrendingUp,
  Layers,
  Target,
  Bookmark,
  ListTodo,
  Send,
  User,
  Database,
  Search,
  Menu,
  X,
  LogOut,
  FlaskConical,
  Sparkles,
  ArrowUpRight,
  Compass,
  GitCompare,
  FileEdit,
  Hammer,
  Award,
  MessageSquare,
  Map as MapIcon,
  LayoutGrid,
  ChevronRight,
  Trash2,
  FileDown,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useAuditStore } from '@/features/journal/useAuditStore';
import { useMySpaceStore } from './useMySpaceStore';
import { useResumeStore } from '@/features/resumes/useResumeStore';
import { useSavedJdStore } from '@/store/savedJdStore';
import { useTailorWorkspaceStore } from '@/features/tailor/store/useTailorWorkspaceStore';
import { useTailorLaunchStore } from '@/lib/tailor/launchContext';
import { loadDemoIntoStores } from '@/features/demo/demoImporter';
import { OverviewSection } from './OverviewSection';
import { ScansSection } from './ScansSection';
import { TargetsSection } from './TargetsSection';
import { PlanSection } from './PlanSection';
import { OutreachSection } from './OutreachSection';
import { ResumesSection } from './ResumesSection';
import { ProfileSection } from './ProfileSection';
import { WorkspaceStatusPill } from './components/WorkspaceStatusPill';
import { HistorySection } from './components/HistorySection';
import { SavedJdsSection } from './components/SavedJdsSection';
import { DataSessionSection } from './components/DataSessionSection';
import { toast } from '@/components/ui/Toast';

export type WorkspaceSectionId =
  | 'overview'
  | 'scans'
  | 'history'
  | 'resumes'
  | 'targets'
  | 'jds'
  | 'plan'
  | 'outreach'
  | 'profile'
  | 'data';

interface NavEntry {
  id: WorkspaceSectionId;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface ToolEntry {
  label: string;
  to: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const HIREFLOW_TOOLS: ToolEntry[] = [
  { label: 'ATS Resume Roaster', to: '/tools/resume-checker', description: '7D audit & gap scoring', icon: FileSearch },
  { label: 'Tailor My Resume', to: '/tools/tailor', description: 'Rewrite bullets & export', icon: FileEdit },
  { label: 'TalentLens', to: '/demo', description: 'Company & role benchmarks', icon: Compass },
  { label: 'Dual-JD Compare', to: '/tools/jd-compare', description: 'Head-to-head JD analysis', icon: GitCompare },
  { label: 'Build Briefs', to: '/tools/build-briefs', description: 'Verification projects', icon: Hammer },
  { label: 'Opportunities', to: '/tools/credential-engine', description: 'Credentials & fellowships', icon: Award },
  { label: 'Reach Out', to: '/tools/reach-out', description: 'Outreach message studio', icon: MessageSquare },
  { label: 'Career Trajectory', to: '/tools/career-path', description: 'Level ladders & roadmaps', icon: MapIcon },
  { label: 'Tools Hub', to: '/tools', description: 'All HireFlow tools', icon: LayoutGrid },
];

export const MySpaceWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { section: routeSection } = useParams<{ section?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const auditId = searchParams.get('audit');

  const { displayName, email, isDemo, signOut } = useAuthStore();
  const entries = useAuditStore((s) => s.entries);
  const watchlist = useMySpaceStore((s) => s.watchlist);
  const planItems = useMySpaceStore((s) => s.planItems);
  const outreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const workspaces = useResumeStore((s) => s.workspaces);
  const versions = useResumeStore((s) => s.versions);
  const savedJds = useSavedJdStore((s) => s.jds);
  const tailorSessions = useTailorWorkspaceStore((s) => s.sessions);
  const exportHistory = useTailorWorkspaceStore((s) => s.exportHistory);

  const [navSearch, setNavSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const validSections: WorkspaceSectionId[] = [
    'overview',
    'scans',
    'history',
    'resumes',
    'targets',
    'jds',
    'plan',
    'outreach',
    'profile',
    'data',
  ];

  const activeSection: WorkspaceSectionId =
    routeSection && validSections.includes(routeSection as WorkspaceSectionId)
      ? (routeSection as WorkspaceSectionId)
      : 'overview';

  const navEntries: NavEntry[] = useMemo(
    () => [
      { id: 'overview', label: 'Overview', group: 'Workspace', icon: LayoutDashboard },
      { id: 'scans', label: 'Scans & Audits', group: 'Evaluations', icon: FileSearch, count: Object.keys(entries).length },
      { id: 'history', label: 'Score Progression', group: 'Evaluations', icon: TrendingUp, count: Object.keys(entries).length },
      {
        id: 'resumes',
        label: 'Resume Matrix',
        group: 'Resumes & Targets',
        icon: Layers,
        count: Object.values(workspaces).filter((w) => !w.archivedAt).length + Object.keys(tailorSessions).length,
      },
      {
        id: 'targets',
        label: 'Target Watchlist',
        group: 'Resumes & Targets',
        icon: Target,
        count: Object.values(watchlist).filter((t) => !t.archivedAt).length,
      },
      { id: 'jds', label: 'Saved JDs', group: 'Resumes & Targets', icon: Bookmark, count: savedJds.length },
      { id: 'plan', label: 'Skill & Build Plan', group: 'Action & Outreach', icon: ListTodo, count: Object.keys(planItems).length },
      { id: 'outreach', label: 'Outreach Vault', group: 'Action & Outreach', icon: Send, count: Object.keys(outreachDrafts).length },
      { id: 'profile', label: 'Profile & Identity', group: 'Account & Data', icon: User },
      { id: 'data', label: 'Data & Session', group: 'Account & Data', icon: Database },
    ],
    [entries, workspaces, tailorSessions, watchlist, savedJds.length, planItems, outreachDrafts]
  );

  const filteredNav = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return navEntries;
    return navEntries.filter((n) => n.label.toLowerCase().includes(q) || n.group.toLowerCase().includes(q));
  }, [navEntries, navSearch]);

  const filteredTools = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    if (!q) return HIREFLOW_TOOLS;
    return HIREFLOW_TOOLS.filter((t) => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }, [navSearch]);

  const groupedNav = useMemo(() => {
    const map = new Map<string, NavEntry[]>();
    for (const item of filteredNav) {
      const list = map.get(item.group) || [];
      list.push(item);
      map.set(item.group, list);
    }
    return Array.from(map.entries());
  }, [filteredNav]);

  const activeMeta = navEntries.find((n) => n.id === activeSection) || navEntries[0];

  const exportArtifactsCount = useMemo(
    () => Object.values(exportHistory).reduce((sum, list) => sum + (list?.length ?? 0), 0),
    [exportHistory]
  );

  const handleSelectSection = (id: string) => {
    setMobileMenuOpen(false);
    navigate(`/my-space/${id === 'overview' ? '' : id}`);
  };

  const handleSelectAudit = (id: string | null) => {
    if (id) {
      navigate(`/my-space/scans?audit=${encodeURIComponent(id)}`);
    } else {
      const next = new URLSearchParams(searchParams);
      next.delete('audit');
      setSearchParams(next);
    }
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      await loadDemoIntoStores(displayName || undefined);
      toast('success', 'Loaded Demo / Sample workspace assets into session memory.');
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleSignOut = async () => {
    navigate('/', { replace: true });
    await signOut();
    toast('info', 'Signed out. Protected workspace cleared.');
  };

  const handleLaunchTailorFromWorkspace = () => {
    const activeWorkspaces = Object.values(workspaces).filter((w) => !w.archivedAt);
    const primaryWs = activeWorkspaces.find((w) => w.isPrimary) ?? activeWorkspaces[0];
    const headVer = primaryWs?.headVersionId ? versions[primaryWs.headVersionId] : undefined;
    if (primaryWs) {
      const launch = useTailorLaunchStore.getState().registerLaunchContext({
        sourceEntryPoint: 'my_space',
        mode: 'full_tailor',
        workspaceId: primaryWs.id,
        versionId: headVer?.id ?? null,
        snapshotHash: headVer?.snapshotHash ?? null,
        resumeLabel: primaryWs.name,
        auditId: null,
        talentLensAssessmentId: null,
        jdIds: [],
        jdSnapshotHash: null,
        dualJdComparisonId: null,
        targetKey: null,
        selectedSection: null,
        selectedBullet: null,
        focusSkill: null,
      });
      navigate(`/tools/tailor?ctx=${launch.launchId}`);
      return;
    }
    navigate('/tools/tailor');
  };

  const hasAnyAssets =
    Object.keys(entries).length > 0 ||
    Object.keys(workspaces).length > 0 ||
    Object.keys(watchlist).length > 0 ||
    Object.keys(tailorSessions).length > 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#10100d] border-r border-[#1b1b15]">
      <div className="p-4 border-b border-[#1b1b15] flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg border border-[#24241c] bg-[#16160f] flex items-center justify-center font-black text-[#faff69] text-sm shrink-0">
            H
          </span>
          <div className="min-w-0">
            <div className="text-sm font-extrabold tracking-wider text-[#f1f1e8] truncate">HIREFLOW</div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9b9b8c]">
              My Space
            </div>
          </div>
        </Link>
        {isDemo && (
          <span className="px-2 py-0.5 rounded-full bg-[#faff69]/10 border border-[#faff69]/30 text-[#faff69] font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
            Demo
          </span>
        )}
      </div>

      {/* Search / Filter */}
      <div className="p-3 border-b border-[#1b1b15]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#9b9b8c]" />
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Filter sections or tools..."
            aria-label="Filter My Space sections or tools"
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#090907] border border-[#24241c] text-xs text-[#f1f1e8] placeholder-[#9b9b8c]/70 focus:outline-none focus:border-[#faff69]"
          />
          {navSearch && (
            <button
              type="button"
              onClick={() => setNavSearch('')}
              aria-label="Clear filter"
              className="absolute right-2 top-2 text-[#9b9b8c] hover:text-[#f1f1e8] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5" aria-label="My Space navigation">
        {groupedNav.map(([groupName, items]) => (
          <div key={groupName}>
            <div className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b9b8c]">
              {groupName}
            </div>
            <div className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSection(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors motion-reduce:transition-none cursor-pointer ${
                      isActive
                        ? 'bg-[#16160f] text-[#f1f1e8] border border-[#24241c]'
                        : 'text-[#b6b6a8] hover:text-[#f1f1e8] hover:bg-[#16160f]/50 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#faff69]' : 'text-[#9b9b8c]'}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.count !== undefined && (
                      <span className="font-mono text-[11px] tabular-nums text-[#9b9b8c]">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* HireFlow Tools */}
        {filteredTools.length > 0 && (
          <div>
            <div className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b9b8c]">
              HireFlow Tools
            </div>
            <div className="space-y-0.5">
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.to}
                    to={tool.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#b6b6a8] hover:text-[#faff69] hover:bg-[#16160f]/50 transition-colors motion-reduce:transition-none"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 shrink-0 text-[#9b9b8c]" />
                      <span className="truncate">{tool.label}</span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 shrink-0 opacity-70" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {groupedNav.length === 0 && filteredTools.length === 0 && (
          <div className="px-2.5 py-4 text-xs text-[#9b9b8c]">
            No sections or tools match &ldquo;{navSearch}&rdquo;.
          </div>
        )}
      </nav>

      {/* Account Footer */}
      <div className="p-3 border-t border-[#1b1b15] space-y-2.5">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-[#faff69]/15 border border-[#faff69]/30 text-[#faff69] flex items-center justify-center font-bold text-xs shrink-0">
            {(displayName || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#f1f1e8] truncate">
              {displayName || 'Candidate'}
            </div>
            <div className="text-[11px] font-mono text-[#9b9b8c] truncate">
              {email || 'In-session workspace'}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#24241c] bg-[#090907] text-xs font-semibold text-[#b6b6a8] hover:text-[#f1f1e8] hover:border-[#faff69]/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090907] text-[#f1f1e8] flex overflow-x-hidden selection:bg-[#faff69] selection:text-[#090907]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[268px] shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Workspace navigation drawer">
          <div
            className="fixed inset-0 bg-black/75"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[280px] max-w-[85vw] h-full">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-[#16160f] border border-[#24241c] text-[#f1f1e8]"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Bar + Breadcrumbs */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 border-b border-[#1b1b15] bg-[#090907]/95 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open workspace navigation"
              className="lg:hidden p-2 rounded-lg border border-[#24241c] bg-[#10100d] text-[#f1f1e8]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-[#9b9b8c] truncate">
              <button
                type="button"
                onClick={() => handleSelectSection('overview')}
                className="hover:text-[#f1f1e8] cursor-pointer"
              >
                My Space
              </button>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[#f1f1e8] font-semibold truncate">{activeMeta.label}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden md:block">
              <WorkspaceStatusPill />
            </div>
            {!hasAnyAssets && (
              <button
                type="button"
                onClick={handleLoadSample}
                disabled={isLoadingSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#faff69]/40 bg-[#faff69]/10 text-[#faff69] text-xs font-semibold hover:bg-[#faff69]/20 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingSample ? 'Loading...' : 'Load Sample Workspace'}</span>
              </button>
            )}
            <Link
              to="/tools/resume-checker"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs hover:bg-[#ebf059] transition-colors"
            >
              <span>Run ATS Scan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Honest Demo Mode Banner */}
        {isDemo && (
          <div className="px-4 sm:px-8 py-2.5 bg-[#10100d] border-b border-[#1b1b15] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#b6b6a8]">
              <FlaskConical className="w-4 h-4 text-[#faff69] shrink-0" />
              <span>
                <strong className="text-[#f1f1e8]">Demo Mode Active:</strong> Signed in as{' '}
                <span className="text-[#f1f1e8]">{displayName}</span> ({email}). Workspace state runs in session memory and any preloaded records are labelled <strong className="text-[#faff69]">Sample / Demo</strong>.
              </span>
            </div>
            <Link to="/register" className="font-mono text-[11px] text-[#faff69] hover:underline">
              Switch Demo Profile
            </Link>
          </div>
        )}

        {/* Active Section Body */}
        <main id="main-content" className="flex-1 p-5 sm:p-8 lg:p-10 max-w-[1280px] w-full min-w-0">
          {activeSection === 'overview' && (
            <div className="space-y-8">
              <OverviewSection
                onNavigateSection={handleSelectSection}
                onSelectAudit={handleSelectAudit}
              />

              {/* Connected HireFlow Ecosystem Strip */}
              <section className="pt-6 border-t border-[#1b1b15]" aria-label="Connected HireFlow Tools">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#9b9b8c] uppercase">
                    Connected HireFlow Tools
                  </div>
                  <Link to="/tools" className="text-xs text-[#faff69] hover:underline">
                    Open Tools Hub &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {HIREFLOW_TOOLS.slice(0, 8).map((tool) => {
                    const Icon = tool.icon;
                    if (tool.to === '/tools/tailor') {
                      return (
                        <button
                          key={tool.to}
                          type="button"
                          onClick={handleLaunchTailorFromWorkspace}
                          className="text-left p-4 rounded-xl border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 transition-colors motion-reduce:transition-none flex flex-col gap-1.5 cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <Icon className="w-4 h-4 text-[#faff69]" />
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#9b9b8c]" />
                          </div>
                          <div className="text-sm font-semibold text-[#f1f1e8]">{tool.label}</div>
                          <div className="text-xs text-[#9b9b8c]">{tool.description}</div>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={tool.to}
                        to={tool.to}
                        className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] hover:border-[#faff69]/40 transition-colors motion-reduce:transition-none flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <Icon className="w-4 h-4 text-[#faff69]" />
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#9b9b8c]" />
                        </div>
                        <div className="text-sm font-semibold text-[#f1f1e8]">{tool.label}</div>
                        <div className="text-xs text-[#9b9b8c]">{tool.description}</div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeSection === 'scans' && (
            <ScansSection
              selectedAuditId={auditId}
              onSelectAudit={handleSelectAudit}
            />
          )}

          {activeSection === 'history' && (
            <HistorySection onSelectAudit={(id) => handleSelectAudit(id)} />
          )}

          {activeSection === 'resumes' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[#9b9b8c]">
                  Manage snapshot-locked Resume Matrix versions, saved Tailor drafts, and PDF/DOCX/Markdown exports:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/tools/resume-checker"
                    className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-[#f1f1e8] hover:border-[#faff69]/40 font-semibold"
                  >
                    Open ATS Roaster
                  </Link>
                  <Link
                    to="/tools/tailor"
                    className="px-3.5 py-1.5 rounded-full bg-[#faff69]/10 border border-[#faff69]/30 text-[#faff69] hover:bg-[#faff69] hover:text-[#090907] font-semibold transition-colors"
                  >
                    Open Tailor Studio
                  </Link>
                </div>
              </div>
              <SavedTailorDraftsPanel />
              <ResumesSection />
            </div>
          )}

          {activeSection === 'targets' && (
            <TargetsSection onSelectAudit={handleSelectAudit} />
          )}

          {activeSection === 'jds' && <SavedJdsSection />}

          {activeSection === 'plan' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-[#9b9b8c]">
                  Bridge skill gaps into verified deliverables and portfolio evidence:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/tools/build-briefs"
                    className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-[#f1f1e8] hover:border-[#faff69]/40 font-semibold"
                  >
                    Open Build Briefs
                  </Link>
                  <Link
                    to="/tools/credential-engine"
                    className="px-3.5 py-1.5 rounded-full border border-[#24241c] text-[#f1f1e8] hover:border-[#faff69]/40 font-semibold"
                  >
                    Open Opportunities
                  </Link>
                </div>
              </div>
              <PlanSection />
            </div>
          )}

          {activeSection === 'outreach' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] text-xs text-[#9b9b8c]">
                <strong className="text-[#f1f1e8]">Outreach Vault:</strong> Drafts saved from{' '}
                <Link to="/tools/reach-out" className="text-[#faff69] underline">
                  /tools/reach-out
                </Link>{' '}
                appear here automatically with status tracking and copy actions.
              </div>
              <OutreachSection />
            </div>
          )}

          {activeSection === 'profile' && <ProfileSection />}

          {activeSection === 'data' && (
            <DataSessionSection
              workspacesCount={Object.keys(workspaces).length}
              versionsCount={Object.keys(versions).length}
              tailoringDraftsCount={Object.keys(tailorSessions).length}
              exportArtifactsCount={exportArtifactsCount}
              auditsCount={Object.keys(entries).length}
              savedJdsCount={savedJds.length}
              planItemsCount={Object.keys(planItems).length}
              outreachDraftsCount={Object.keys(outreachDrafts).length}
            />
          )}
        </main>
      </div>
    </div>
  );
};

function SavedTailorDraftsPanel() {
  const navigate = useNavigate();
  const sessionsMap = useTailorWorkspaceStore((s) => s.sessions);
  const exportHistory = useTailorWorkspaceStore((s) => s.exportHistory);
  const deleteDraft = useTailorWorkspaceStore((s) => s.deleteDraft);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const drafts = useMemo(
    () => Object.values(sessionsMap).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [sessionsMap]
  );

  const recentExports = useMemo(
    () =>
      Object.entries(exportHistory)
        .flatMap(([sid, items]) => items.map((item) => ({ ...item, sessionId: sid })))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [exportHistory]
  );

  if (drafts.length === 0 && recentExports.length === 0) return null;

  return (
    <div className="space-y-4">
      {drafts.length > 0 && (
        <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#faff69]">
              Saved Tailoring Drafts ({drafts.length})
            </div>
            <span className="text-[11px] text-[#9b9b8c]">
              Working drafts stay separate from immutable Resume Versions until committed
            </span>
          </div>
          <div className="divide-y divide-[#1b1b15]">
            {drafts.map((d) => (
              <div key={d.sessionId} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#f1f1e8] truncate">{d.title}</div>
                  <div className="text-xs text-[#9b9b8c] mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Mode: {d.mode.toUpperCase()}</span>
                    <span>&middot;</span>
                    <span>Status: {d.draftStatus.replace(/_/g, ' ')}</span>
                    {d.reanalysisScore != null && (
                      <>
                        <span>&middot;</span>
                        <span className="text-[#faff69] font-mono">ATS {d.reanalysisScore}/100</span>
                      </>
                    )}
                    {d.cloudSyncStatus === 'error' && (
                      <span className="text-rose-300 font-mono">Save error</span>
                    )}
                  </div>
                  {confirmDeleteId === d.sessionId && (
                    <div role="status" className="text-[11px] text-[#ffb4a2] mt-1">
                      Click trash again to confirm deleting draft
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/tools/tailor?draft=${d.sessionId}`)}
                    className="px-3.5 py-1.5 rounded-full bg-[#faff69] text-[#090907] text-xs font-bold hover:bg-[#ebf059] cursor-pointer"
                  >
                    Resume Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDeleteId === d.sessionId) {
                        void deleteDraft(d.sessionId);
                        setConfirmDeleteId(null);
                      } else {
                        setConfirmDeleteId(d.sessionId);
                      }
                    }}
                    aria-label={
                      confirmDeleteId === d.sessionId
                        ? `Confirm delete draft ${d.title}`
                        : `Delete draft ${d.title}`
                    }
                    className={`p-1.5 rounded-full cursor-pointer ${
                      confirmDeleteId === d.sessionId
                        ? 'text-[#ff6b4a] font-bold'
                        : 'text-[#9b9b8c] hover:text-[#ff8a70]'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentExports.length > 0 && (
        <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#f1f1e8] flex items-center gap-2">
            <FileDown className="w-3.5 h-3.5 text-[#faff69]" />
            <span>Export History ({recentExports.length})</span>
          </div>
          <div className="divide-y divide-[#1b1b15]">
            {recentExports.map((ex) => (
              <div key={ex.artifactId} className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-semibold text-[#f1f1e8] truncate">{ex.fileName}</span>
                  <span className="text-[#9b9b8c] ml-2 font-mono uppercase">
                    {ex.format} &middot; {Math.max(1, Math.round(ex.byteSize / 1024))} KB &middot;{' '}
                    {new Date(ex.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  to={`/tools/tailor?draft=${encodeURIComponent(ex.sessionId)}`}
                  className="text-[#faff69] hover:underline font-semibold shrink-0"
                >
                  Open Source Draft
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
