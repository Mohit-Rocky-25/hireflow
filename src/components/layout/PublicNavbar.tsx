import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Layers, Flame, TrendingUp, ArrowRight, Menu, X, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from '../ui/Components';

interface NavTool {
  id: string;
  name: string;
  path: string;
  icon: typeof Sparkles;
  badge: string;
  badgeBg: string;       // badge pill bg — always vivid, always visible
  badgeText: string;     // badge text color
  iconColor: string;     // icon color
  iconActiveBg: string;  // icon box bg when active
  activeBg: string;      // container bg when active
  activeBorder: string;  // container border when active
  activeText: string;    // name text when active
  hoverBg: string;       // container bg on hover (inactive)
  description: string;
}

const NAV_TOOLS: NavTool[] = [
  {
    id: 'talentlens',
    name: 'TalentLens™',
    path: '/demo',
    icon: Sparkles,
    badge: '125+ FIRMS',
    badgeBg: 'bg-sky-500',
    badgeText: 'text-white',
    iconColor: 'text-sky-400',
    iconActiveBg: 'bg-sky-500/25',
    activeBg: 'bg-sky-500/15',
    activeBorder: 'border-sky-400/50',
    activeText: 'text-sky-300 font-bold',
    hoverBg: 'hover:bg-white/5',
    description: 'Simulate hiring filters across 125+ top tech employers & campus programs',
  },
  {
    id: 'decision-suite',
    name: 'Decision Suite',
    path: '/tools',
    icon: Layers,
    badge: 'PRO',
    badgeBg: 'bg-violet-500',
    badgeText: 'text-white',
    iconColor: 'text-violet-400',
    iconActiveBg: 'bg-violet-500/25',
    activeBg: 'bg-violet-500/15',
    activeBorder: 'border-violet-400/50',
    activeText: 'text-violet-300 font-bold',
    hoverBg: 'hover:bg-white/5',
    description: 'Career engineering tools, project briefs & skill verification',
  },
  {
    id: 'ats-roaster',
    name: 'ATS Roaster',
    path: '/tools/resume-checker',
    icon: Flame,
    badge: 'HOT',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    iconColor: 'text-orange-400',
    iconActiveBg: 'bg-orange-500/25',
    activeBg: 'bg-orange-500/15',
    activeBorder: 'border-orange-400/50',
    activeText: 'text-orange-300 font-bold',
    hoverBg: 'hover:bg-white/5',
    description: 'Instant ruthless resume audit & keyword scoring',
  },
  {
    id: 'career-trajectory',
    name: 'Career Trajectory',
    path: '/tools/career-path',
    icon: TrendingUp,
    badge: '₹ CTC',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    iconColor: 'text-emerald-400',
    iconActiveBg: 'bg-emerald-500/25',
    activeBg: 'bg-emerald-500/15',
    activeBorder: 'border-emerald-400/50',
    activeText: 'text-emerald-300 font-bold',
    hoverBg: 'hover:bg-white/5',
    description: 'India tech salary ladders, company tier roadmap & CTC insights',
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

        {/* Center: Navigation Tool Dock */}
        <div className="hidden md:flex items-center gap-0.5 p-1 bg-black/40 border border-white/10 rounded-2xl shadow-sm backdrop-blur-md">
          {NAV_TOOLS.map((tool) => {
            const active = isItemActive(tool.path);
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={`
                  group relative flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] border transition-all duration-150
                  ${active
                    ? `${tool.activeBg} ${tool.activeBorder} shadow-sm`
                    : `border-transparent ${tool.hoverBg}`
                  }
                `}
              >
                {/* Icon Box */}
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                  active ? tool.iconActiveBg : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <tool.icon className={`w-3.5 h-3.5 ${tool.iconColor}`} />
                </div>

                {/* Label */}
                <span className={`whitespace-nowrap transition-colors ${
                  active ? tool.activeText : 'text-zinc-400 group-hover:text-zinc-200 font-medium'
                }`}>
                  {tool.name}
                </span>

                {/* Badge — always vivid, always solid */}
                <span className={`
                  text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md
                  ${tool.badgeBg} ${tool.badgeText}
                  ${active ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'}
                `}>
                  {tool.badge}
                </span>
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
        <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl animate-slide-up">
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-2">
            Platform Tools
          </div>
          <div className="space-y-1.5">
            {NAV_TOOLS.map((tool) => {
              const active = isItemActive(tool.path);
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    active
                      ? `${tool.activeBg} ${tool.activeBorder}`
                      : 'bg-white/5 border-white/8 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      active ? tool.iconActiveBg : 'bg-white/8'
                    }`}>
                      <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-semibold ${
                          active ? tool.activeText : 'text-zinc-200'
                        }`}>{tool.name}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${tool.badgeBg} ${tool.badgeText}`}>
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-[12px] text-zinc-500 font-normal mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                </Link>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-[13px] font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-[13px] font-semibold text-black bg-white rounded-lg shadow-xs hover:opacity-90 transition-all"
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
