import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Copy,
  Check,
  Search,
  X,
  ExternalLink,
  Zap,
  Minimize2,
  Maximize2,
  Award,
  FileSearch,
  FileEdit,
  GitCompare,
  Mail,
  FolderGit2,
  Building2,
  UserCheck,
  ShieldAlert,
  Home,
  Layers,
  Database,
  Sparkles,
} from 'lucide-react';

interface RouteItem {
  id: string;
  name: string;
  path: string;
  category: 'Suite & Tools' | 'Public & Portals' | 'Dashboards & Admin';
  badge?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function LocalhostNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('hireflow_localhost_nav_minimized') === 'true';
  });
  const location = useLocation();

  // Listen for Ctrl+Shift+L or Ctrl+/ keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === '/') || (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l'))) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const currentPort = typeof window !== 'undefined' ? window.location.port || '80' : '5173';

  const routes: RouteItem[] = [
    {
      id: 'credentials',
      name: 'Credential & Opportunity Engine',
      path: '/tools/credential-engine',
      category: 'Suite & Tools',
      badge: 'Updated & Live',
      description: '102 verified hackathons, open source, & certifications with full-page detail view',
      icon: Award,
    },
    {
      id: 'resume-checker',
      name: 'ATS Resume Roaster',
      path: '/tools/resume-checker',
      category: 'Suite & Tools',
      badge: 'Core Tool',
      description: 'Harsh invariant ATS checker with verbatim citations & score auditing',
      icon: FileSearch,
    },
    {
      id: 'tailor',
      name: 'Resume Tailor Engine',
      path: '/tools/tailor',
      category: 'Suite & Tools',
      badge: 'Core Tool',
      description: 'Truth-checked resume bullet tailoring and context-enhanced alignment',
      icon: FileEdit,
    },
    {
      id: 'jd-compare',
      name: 'Compare Job Descriptions',
      path: '/tools/jd-compare',
      category: 'Suite & Tools',
      description: 'Side-by-side JD skill extraction, compensation, and gap analysis',
      icon: GitCompare,
    },
    {
      id: 'reach-out',
      name: 'Executive Outreach Generator',
      path: '/tools/reach-out',
      category: 'Suite & Tools',
      description: 'Targeted recruiter, peer, and hiring manager outreach copy',
      icon: Mail,
    },
    {
      id: 'build-briefs',
      name: 'Executive Briefs Builder',
      path: '/tools/build-briefs',
      category: 'Suite & Tools',
      description: 'Distill and export structured career briefs for interviews',
      icon: FolderGit2,
    },
    {
      id: 'career-path',
      name: 'Career Path Hub',
      path: '/tools/career-path',
      category: 'Suite & Tools',
      description: 'Role ladders, progression timelines, and promotion benchmarks',
      icon: Compass,
    },
    {
      id: 'dream-job-roadmap',
      name: 'Dream Job Roadmap',
      path: '/tools/career-path/dream-job-roadmap',
      category: 'Suite & Tools',
      description: 'Step-by-step career pathing simulator to reach tier-1 target jobs',
      icon: Compass,
    },
    {
      id: 'company-levels',
      name: 'Company Levels Matrix',
      path: '/tools/career-path/company-levels',
      category: 'Suite & Tools',
      description: 'Cross-company engineering level mapping (FAANG, Unicorns, GCCs)',
      icon: Layers,
    },
    {
      id: 'talent-lens',
      name: 'TalentLens Simulator',
      path: '/tools/talent-lens',
      category: 'Suite & Tools',
      description: 'Simulate recruiter evaluation of your candidate profile',
      icon: UserCheck,
    },
    {
      id: 'home',
      name: 'Home / Landing Page',
      path: '/',
      category: 'Public & Portals',
      description: 'HireFlow public hero landing page with feature showcase',
      icon: Home,
    },
    {
      id: 'tools-hub',
      name: 'Free Tools Hub',
      path: '/tools',
      category: 'Public & Portals',
      description: 'Central directory of all candidate career tools and simulators',
      icon: Layers,
    },
    {
      id: 'portal',
      name: 'Candidate Portal',
      path: '/portal',
      category: 'Public & Portals',
      description: 'Candidate profile, saved applications, and timeline view',
      icon: UserCheck,
    },
    {
      id: 'matching-demo',
      name: 'Company Matching Demo',
      path: '/demo',
      category: 'Public & Portals',
      description: 'Interactive company-candidate matching algorithm visualizer',
      icon: Sparkles,
    },
    {
      id: 'login',
      name: 'Login Portal',
      path: '/login',
      category: 'Public & Portals',
      description: 'Authentication login page with demo role switches',
      icon: UserCheck,
    },
    {
      id: 'register',
      name: 'Register Account',
      path: '/register',
      category: 'Public & Portals',
      description: 'Candidate and Recruiter onboarding registration flow',
      icon: UserCheck,
    },
    {
      id: 'dev-careers-data',
      name: 'Careers Data Explorer',
      path: '/dev/careers-data',
      category: 'Public & Portals',
      badge: 'Dev Utility',
      description: 'Raw taxonomy and careers dataset browser for developers',
      icon: Database,
    },
    {
      id: 'company-dashboard',
      name: 'Company / Recruiter Dashboard',
      path: '/company/dashboard',
      category: 'Dashboards & Admin',
      badge: 'Protected',
      description: 'Recruiter pipeline, applicant review, and candidate intelligence',
      icon: Building2,
    },
    {
      id: 'interviewer-dashboard',
      name: 'Interviewer Dashboard',
      path: '/interviewer/dashboard',
      category: 'Dashboards & Admin',
      badge: 'Protected',
      description: 'Scheduled interviews, scorecard inputs, and notes',
      icon: UserCheck,
    },
    {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      path: '/admin/dashboard',
      category: 'Dashboards & Admin',
      badge: 'Protected',
      description: 'Platform management, companies, user roles, and audit log',
      icon: ShieldAlert,
    },
  ];

  const filteredRoutes = useMemo(() => {
    if (!search.trim()) return routes;
    const query = search.toLowerCase();
    return routes.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.path.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
    );
  }, [search, routes]);

  const copyUrl = (id: string, path: string) => {
    const fullUrl = `${origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const copyAllLinks = () => {
    const allFormatted = routes
      .map((r) => `* ${r.name}: ${origin}${r.path}`)
      .join('\n');
    navigator.clipboard.writeText(allFormatted);
    setCopiedId('__all__');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !isMinimized;
    setIsMinimized(nextVal);
    localStorage.setItem('hireflow_localhost_nav_minimized', String(nextVal));
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-4 left-4 z-40 select-none">
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            title="Expand Localhost Navigator"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900/90 text-amber-400 border border-amber-500/30 shadow-xl backdrop-blur-md hover:scale-105 transition-all"
          >
            <Zap className="w-5 h-5 fill-amber-400" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 text-white rounded-full border border-slate-700/60 shadow-2xl backdrop-blur-md hover:border-amber-500/50 transition-all">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 text-xs font-semibold text-slate-100 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>Localhost Links</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 font-mono">
                :{currentPort}
              </span>
            </button>
            <button
              onClick={toggleMinimize}
              title="Minimize pill"
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Directory */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Zap className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">HireFlow Localhost Directory</h2>
                    <span className="px-2 py-0.5 text-xs font-mono rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live on :{currentPort}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any page to navigate instantly, or copy the direct local URL.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyAllLinks}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
                  title="Copy all localhost URLs to clipboard"
                >
                  {copiedId === '__all__' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/90">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search routes by name, path, or description... (e.g. credentials, tailor, resume)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {/* Routes List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {['Suite & Tools', 'Public & Portals', 'Dashboards & Admin'].map((category) => {
                const categoryRoutes = filteredRoutes.filter((r) => r.category === category);
                if (categoryRoutes.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                      <span>{category}</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        {categoryRoutes.length} links
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {categoryRoutes.map((route) => {
                        const Icon = route.icon;
                        const isCurrent = location.pathname === route.path;
                        const isCopied = copiedId === route.id;

                        return (
                          <div
                            key={route.id}
                            className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-amber-500/10 border-amber-500/40'
                                : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                            }`}
                          >
                            <Link
                              to={route.path}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 min-w-0 flex-1 pr-3"
                            >
                              <div
                                className={`p-2 rounded-lg ${
                                  isCurrent
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-800/80 text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-semibold truncate ${
                                      isCurrent ? 'text-amber-300 font-bold' : 'text-slate-200 group-hover:text-white'
                                    }`}
                                  >
                                    {route.name}
                                  </span>
                                  {route.badge && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      {route.badge}
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                      Active Tab
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <code className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300 truncate">
                                    {route.path}
                                  </code>
                                  <span className="text-[11px] text-slate-500 hidden sm:inline truncate">
                                    • {route.description}
                                  </span>
                                </div>
                              </div>
                            </Link>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => copyUrl(route.id, route.path)}
                                title={`Copy ${origin}${route.path}`}
                                className={`p-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 ${
                                  isCopied
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60'
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-sans">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-sans hidden sm:inline">Copy</span>
                                  </>
                                )}
                              </button>

                              <Link
                                to={route.path}
                                onClick={() => setIsOpen(false)}
                                title="Open Page"
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredRoutes.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium">No routes match "{search}"</p>
                  <button
                    onClick={() => setSearch('')}
                    className="mt-2 text-xs text-amber-400 hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>

            {/* Footer with Keyboard shortcut info */}
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Shortcut:</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[10px]">
                  Ctrl + /
                </kbd>
                <span>or</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-[10px]">
                  Ctrl + Shift + L
                </kbd>
              </div>
              <span className="text-[11px] text-slate-500">
                Base: <code className="text-slate-400">{origin}</code>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
