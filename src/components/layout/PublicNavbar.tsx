import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Layers, Flame, TrendingUp, ArrowRight, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Components';

interface NavToolItem {
  id: string;
  name: string;
  path: string;
  icon: typeof Sparkles;
  badge?: string;
  description: string;
  activeClasses: {
    container: string;
    iconBox: string;
    text: string;
    badge: string;
  };
  inactiveClasses: {
    container: string;
    iconBox: string;
    text: string;
    badge: string;
  };
}

const NAV_TOOLS: NavToolItem[] = [
  {
    id: 'talentlens',
    name: 'TalentLens™',
    path: '/demo',
    icon: Sparkles,
    badge: '125+ FIRMS',
    description: 'Simulate hiring filters across top tech employers & campus programs',
    activeClasses: {
      container: 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700/70 shadow-sm',
      iconBox: 'bg-sky-500 text-white shadow-xs',
      text: 'text-sky-950 dark:text-sky-100 font-extrabold',
      badge: 'bg-sky-500 text-white font-black',
    },
    inactiveClasses: {
      container: 'hover:bg-sky-50/50 dark:hover:bg-sky-950/20 hover:border-sky-200 dark:hover:border-sky-800/40',
      iconBox: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500/20',
      text: 'text-text-secondary group-hover:text-text font-semibold',
      badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/25 font-bold',
    },
  },
  {
    id: 'decision-suite',
    name: 'Decision Suite',
    path: '/tools',
    icon: Layers,
    badge: 'PRO',
    description: 'Career engineering tools, project briefs & skill verification',
    activeClasses: {
      container: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700/70 shadow-sm',
      iconBox: 'bg-indigo-600 text-white shadow-xs',
      text: 'text-indigo-950 dark:text-indigo-100 font-extrabold',
      badge: 'bg-indigo-600 text-white font-black',
    },
    inactiveClasses: {
      container: 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-200 dark:hover:border-indigo-800/40',
      iconBox: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20',
      text: 'text-text-secondary group-hover:text-text font-semibold',
      badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 font-bold',
    },
  },
  {
    id: 'ats-roaster',
    name: 'ATS Roaster',
    path: '/tools/resume-checker',
    icon: Flame,
    badge: 'HOT',
    description: 'Instant ruthless resume audit & keyword scoring',
    activeClasses: {
      container: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/70 shadow-sm',
      iconBox: 'bg-amber-500 text-white shadow-xs',
      text: 'text-amber-950 dark:text-amber-100 font-extrabold',
      badge: 'bg-amber-500 text-white font-black',
    },
    inactiveClasses: {
      container: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20 hover:border-amber-200 dark:hover:border-amber-800/40',
      iconBox: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20',
      text: 'text-text-secondary group-hover:text-text font-semibold',
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 font-bold',
    },
  },
  {
    id: 'career-trajectory',
    name: 'Career Trajectory',
    path: '/tools/career-path',
    icon: TrendingUp,
    badge: '₹ CTC',
    description: 'India tech salary ladders, company tier roadmap & CTC insights',
    activeClasses: {
      container: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/70 shadow-sm',
      iconBox: 'bg-emerald-600 text-white shadow-xs',
      text: 'text-emerald-950 dark:text-emerald-100 font-extrabold',
      badge: 'bg-emerald-600 text-white font-black',
    },
    inactiveClasses: {
      container: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800/40',
      iconBox: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20',
      text: 'text-text-secondary group-hover:text-text font-semibold',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-bold',
    },
  },
];

export function PublicNavbar() {
  const { isAuthenticated, currentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'BHR_MANAGER':
      case 'HR_RECRUITER':
        return '/company/dashboard';
      case 'INTERVIEWER':
        return '/interviewer/dashboard';
      case 'CANDIDATE':
        return '/candidate/dashboard';
      case 'PLATFORM_ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  const isItemActive = (toolPath: string) => {
    const currentPath = location.pathname;
    if (toolPath === '/demo') {
      return currentPath === '/demo' || currentPath.startsWith('/demo/');
    }
    if (toolPath === '/tools/resume-checker') {
      return currentPath === '/tools/resume-checker' || currentPath.startsWith('/tools/resume-checker/');
    }
    if (toolPath === '/tools/career-path') {
      return currentPath.startsWith('/tools/career-path');
    }
    if (toolPath === '/tools') {
      return (
        currentPath === '/tools' ||
        (currentPath.startsWith('/tools/') &&
          !currentPath.startsWith('/tools/resume-checker') &&
          !currentPath.startsWith('/tools/career-path'))
      );
    }
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-border/80 transition-all duration-200">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-ai flex items-center justify-center shadow-xs group-hover:scale-105 transition-all duration-200">
              <Sparkles className="w-4 h-4 text-white stroke-[2px]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-bold text-text tracking-tight group-hover:text-primary transition-colors">
                HireFlow
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-surface-2 text-text-muted border border-border">
                Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Sleek High-Contrast Navigation Widget Dock */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-surface-2/80 dark:bg-zinc-900/90 border border-border rounded-2xl shadow-xs backdrop-blur-md">
          {NAV_TOOLS.map((tool) => {
            const active = isItemActive(tool.path);
            const classes = active ? tool.activeClasses : tool.inactiveClasses;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] border border-transparent transition-all duration-150 group ${classes.container}`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${classes.iconBox}`}>
                  <tool.icon className="w-3.5 h-3.5" />
                </div>
                <span className={classes.text}>{tool.name}</span>
                {tool.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md tracking-wider uppercase ${classes.badge}`}>
                    {tool.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link to={getDashboardLink()}>
              <Button
                variant="header"
                className="h-[36px] px-4 text-[13px] font-semibold rounded-full flex items-center gap-1.5 shadow-xs"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5 stroke-[2px]" />
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-[13px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all"
              >
                Sign In
              </Link>
              <Link to="/register">
                <button className="h-[36px] px-4 rounded-full bg-text text-surface hover:opacity-90 font-semibold text-[13px] shadow-xs hover:shadow transition-all duration-150 flex items-center gap-1">
                  Get Started
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-lg animate-slide-up">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted px-2">
            Platform Tools
          </div>
          <div className="space-y-1.5">
            {NAV_TOOLS.map((tool) => {
              const active = isItemActive(tool.path);
              const classes = active ? tool.activeClasses : tool.inactiveClasses;
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    active
                      ? `${classes.container} border`
                      : 'bg-surface border-border text-text-secondary hover:text-text hover:bg-surface-2/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${classes.iconBox}`}>
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[14px]">
                        <span className={classes.text}>{tool.name}</span>
                        {tool.badge && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase ${classes.badge}`}>
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-text-muted font-normal mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </Link>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-[13px] font-medium text-text-secondary hover:text-text rounded-lg hover:bg-surface-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-[13px] font-semibold text-surface bg-text rounded-lg shadow-xs hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
