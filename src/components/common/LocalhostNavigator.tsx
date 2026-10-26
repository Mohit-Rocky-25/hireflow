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
  Scale,
  History,
  Bookmark,
} from 'lucide-react';

interface RouteItem {
  id: string;
  name: string;
  path: string;
  category: 'Career Decision Suite' | 'Public Explorers';
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

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5177';
  const currentPort = typeof window !== 'undefined' ? window.location.port || '80' : '5177';

  const routes: RouteItem[] = [
    {
      id: 'credentials',
      name: 'Credential & Opportunity Engine',
      path: '/tools/credential-engine',
      category: 'Career Decision Suite',
      badge: 'Updated & Live',
      description: '102 verified hackathons, open source, & certifications with full-page detail view',
      icon: Award,
    },
    {
      id: 'resume-checker',
      name: 'ATS Resume Roaster',
      path: '/tools/resume-checker',
      category: 'Career Decision Suite',
      badge: 'Core Tool',
      description: 'Harsh invariant ATS checker with verbatim citations & score auditing',
      icon: FileSearch,
    },
    {
      id: 'tailor',
      name: 'Resume Tailor Engine',
      path: '/tools/tailor',
      category: 'Career Decision Suite',
      badge: 'Core Tool',
      description: 'Truth-checked resume bullet tailoring and context-enhanced alignment',
      icon: FileEdit,
    },
    {
      id: 'jd-compare',
      name: 'Compare Job Descriptions',
      path: '/tools/jd-compare',
      category: 'Career Decision Suite',
      description: 'Side-by-side JD skill extraction, compensation, and gap analysis',
      icon: GitCompare,
    },
    {
      id: 'reach-out',
      name: 'Executive Outreach Generator',
      path: '/tools/reach-out',
      category: 'Career Decision Suite',
      description: 'Targeted recruiter, peer, and hiring manager outreach copy',
      icon: Mail,
    },
    {
      id: 'build-briefs',
      name: 'Executive Briefs Builder',
      path: '/tools/build-briefs',
      category: 'Career Decision Suite',
      description: 'Distill and export structured career briefs for interviews',
      icon: FolderGit2,
    },
    {
      id: 'career-path',
      name: 'Career Path Hub',
      path: '/tools/career-path',
      category: 'Career Decision Suite',
      description: 'Role ladders, progression timelines, and promotion benchmarks',
      icon: Compass,
    },
    {
      id: 'dream-job-roadmap',
      name: 'Dream Job Roadmap',
      path: '/tools/career-path/dream-job-roadmap',
      category: 'Career Decision Suite',
      description: 'Step-by-step career pathing simulator to reach tier-1 target jobs',
      icon: Compass,
    },
    {
      id: 'company-levels',
      name: 'Company Levels Matrix',
      path: '/tools/career-path/company-levels',
      category: 'Career Decision Suite',
      description: 'Cross-company engineering level mapping (FAANG, Unicorns, GCCs)',
      icon: Layers,
    },
    {
      id: 'talent-lens',
      name: 'TalentLens Simulator',
      path: '/tools/talent-lens',
      category: 'Career Decision Suite',
      description: 'Simulate recruiter evaluation of your candidate profile',
      icon: UserCheck,
    },
    {
      id: 'tools-hub',
      name: 'Free Tools Hub',
      path: '/tools',
      category: 'Career Decision Suite',
      description: 'Central directory of all candidate career tools and simulators',
      icon: Layers,
    },
    {
      id: 'home',
      name: 'Home / Landing Page',
      path: '/',
      category: 'Public Explorers',
      description: 'HireFlo public hero landing page with feature showcase',
      icon: Home,
    },
    {
      id: 'matching-demo',
      name: 'Company Matching Demo',
      path: '/demo',
      category: 'Public Explorers',
      description: 'Interactive company-candidate matching algorithm visualizer',
      icon: Sparkles,
    },
    {
      id: 'dev-careers-data',
      name: 'Careers Data Explorer',
      path: '/dev/careers-data',
      category: 'Public Explorers',
      badge: 'Dev Utility',
      description: 'Raw taxonomy and careers dataset browser for developers',
      icon: Database,
    },
    {
      id: 'methodology',
      name: 'Scoring Methodology & Transparency',
      path: '/methodology',
      category: 'Public Explorers',
      badge: 'Zero Black Box',
      description: 'Mathematical derivation, ATS weights, constants, and diagnostic reports',
      icon: Scale,
    },
    {
      id: 'your-data',
      name: 'Your Data & Privacy Settings',
      path: '/data',
      category: 'Career Decision Suite',
      badge: 'Local Only',
      description: 'Inspect device storage, export/import backups, and clear all data',
      icon: Database,
    },
    {
      id: 'scan-history',
      name: 'Scan History & Trajectory',
      path: '/history',
      category: 'Career Decision Suite',
      description: 'Review ATS scan progression, score trends, and compare scans',
      icon: History,
    },
    {
      id: 'jd-library',
      name: 'Saved Job Descriptions Library',
      path: '/jd-library',
      category: 'Career Decision Suite',
      description: 'Saved JD catalog and cross-JD market demand skill aggregation',
      icon: Bookmark,
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
    }, 1500);
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
            className="flex items-center justify-center w-10 h-10 rounded bg-near-black text-volt border border-charcoal shadow-level-3 hover:border-volt transition-colors"
          >
            <Zap className="w-5 h-5 fill-volt stroke-[1.5px]" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 p-1 bg-near-black text-white rounded border border-charcoal shadow-level-3 hover:border-volt/60 transition-colors">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-black hover:bg-hover-gray text-xs font-semibold uppercase tracking-[1.2px] text-white transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-volt fill-volt stroke-[1.5px]" />
              <span>Localhost Links</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-near-black border border-charcoal text-volt font-mono">
                :{currentPort}
              </span>
            </button>
            <button
              onClick={toggleMinimize}
              title="Minimize pill"
              className="p-1 rounded text-silver hover:text-white hover:bg-hover-gray transition-colors"
            >
              <Minimize2 className="w-3.5 h-3.5 stroke-[1.5px]" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Directory */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-black border border-charcoal rounded-lg shadow-level-3 overflow-hidden text-white">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-charcoal bg-near-black flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-black border border-charcoal text-volt">
                  <Zap className="w-5 h-5 fill-volt stroke-[1.5px]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white uppercase tracking-tight">HireFlo Localhost Directory</h2>
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-near-black text-volt border border-volt/40">
                      Live on :{currentPort}
                    </span>
                  </div>
                  <p className="text-xs text-silver mt-0.5">
                    Click any page to navigate instantly, or copy the direct local URL.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyAllLinks}
                  className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-[1.2px] bg-near-black hover:bg-hover-gray text-white border border-charcoal transition-colors flex items-center gap-1.5"
                  title="Copy all localhost URLs to clipboard"
                >
                  {copiedId === '__all__' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
                      <span className="text-volt">Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 stroke-[1.5px]" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded text-silver hover:text-volt hover:bg-near-black transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5 stroke-[1.5px]" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="px-6 py-3 border-b border-charcoal bg-black">
              <div className="relative">
                <Search className="w-4 h-4 text-silver absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5px]" />
                <input
                  type="text"
                  placeholder="Search routes by name, path, or description... (e.g. credentials, tailor, resume)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm bg-near-black border border-charcoal rounded text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt"
                />
              </div>
            </div>

            {/* Routes List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {(['Career Decision Suite', 'Public Explorers'] as const).map((category) => {
                const categoryRoutes = filteredRoutes.filter((r) => r.category === category);
                if (categoryRoutes.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-silver uppercase tracking-[1.4px] px-1">
                      <span>{category}</span>
                      <span className="text-[11px] font-normal text-silver/60">
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
                            className={`group flex items-center justify-between p-3 rounded border transition-colors ${
                              isCurrent
                                ? 'bg-near-black border-volt shadow-level-5'
                                : 'bg-near-black border-charcoal hover:border-volt/60'
                            }`}
                          >
                            <Link
                              to={route.path}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 min-w-0 flex-1 pr-3"
                            >
                              <div
                                className={`p-2 rounded ${
                                  isCurrent
                                    ? 'bg-black text-volt border border-volt/40'
                                    : 'bg-black text-silver group-hover:text-volt border border-charcoal'
                                }`}
                              >
                                <Icon className="w-4 h-4 stroke-[1.5px]" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-semibold truncate ${
                                      isCurrent ? 'text-volt font-bold' : 'text-white group-hover:text-volt'
                                    }`}
                                  >
                                    {route.name}
                                  </span>
                                  {route.badge && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-[1.2px] bg-near-black text-volt border border-volt/40">
                                      {route.badge}
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-[1.2px] bg-black text-volt border border-volt">
                                      Active Tab
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <code className="text-[11px] font-mono text-silver group-hover:text-white truncate">
                                    {route.path}
                                  </code>
                                  <span className="text-[11px] text-silver/70 hidden sm:inline truncate">
                                    • {route.description}
                                  </span>
                                </div>
                              </div>
                            </Link>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => copyUrl(route.id, route.path)}
                                title={`Copy ${origin}${route.path}`}
                                className={`p-1.5 rounded text-xs font-mono transition-colors flex items-center gap-1 ${
                                  isCopied
                                    ? 'bg-black text-volt border border-volt'
                                    : 'bg-black hover:bg-hover-gray text-silver hover:text-white border border-charcoal'
                                }`}
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-volt stroke-[1.5px]" />
                                    <span className="text-[11px] font-sans">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 stroke-[1.5px]" />
                                    <span className="text-[11px] font-sans hidden sm:inline">Copy</span>
                                  </>
                                )}
                              </button>

                              <Link
                                to={route.path}
                                onClick={() => setIsOpen(false)}
                                title="Open Page"
                                className="p-1.5 rounded bg-black hover:bg-hover-gray text-silver hover:text-volt border border-charcoal transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5 stroke-[1.5px]" />
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
                <div className="py-12 text-center text-silver">
                  <p className="text-sm font-medium">No routes match "{search}"</p>
                  <button
                    onClick={() => setSearch('')}
                    className="mt-2 text-xs text-volt hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>

            {/* Footer with Keyboard shortcut info */}
            <div className="px-6 py-3 border-t border-charcoal bg-near-black flex items-center justify-between text-xs text-silver">
              <div className="flex items-center gap-2">
                <span>Shortcut:</span>
                <kbd className="px-1.5 py-0.5 bg-black text-silver rounded border border-charcoal font-mono text-[10px]">
                  Ctrl + /
                </kbd>
                <span>or</span>
                <kbd className="px-1.5 py-0.5 bg-black text-silver rounded border border-charcoal font-mono text-[10px]">
                  Ctrl + Shift + L
                </kbd>
              </div>
              <span className="text-[11px] text-silver/60">
                Base: <code className="text-silver">{origin}</code>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
