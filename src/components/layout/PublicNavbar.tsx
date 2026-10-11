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
  // Light palette design system
  activeContainer: string;
  inactiveContainer: string;
  activeIconBox: string;
  inactiveIconBox: string;
  activeText: string;
  inactiveText: string;
  activeBadge: string;
  inactiveBadge: string;
  description: string;
}

const NAV_TOOLS: NavTool[] = [
  {
    id: 'talentlens',
    name: 'TalentLens™',
    path: '/demo',
    icon: Sparkles,
    badge: '125+ FIRMS',
    activeContainer: 'bg-white shadow-sm border-sky-300 ring-1 ring-sky-500/20',
    inactiveContainer: 'border-transparent hover:bg-white/70 hover:border-slate-200/80 hover:shadow-2xs',
    activeIconBox: 'bg-sky-500 text-white shadow-xs',
    inactiveIconBox: 'bg-sky-50 text-sky-600 border border-sky-100/80 group-hover:bg-sky-100/70',
    activeText: 'text-slate-950 font-bold',
    inactiveText: 'text-slate-800 group-hover:text-slate-950 font-semibold',
    activeBadge: 'bg-sky-500 text-white shadow-xs',
    inactiveBadge: 'bg-sky-50 text-sky-700 border border-sky-200/70 group-hover:bg-sky-100 group-hover:text-sky-800',
    description: 'Simulate hiring filters across 125+ top tech employers & campus programs',
  },
  {
    id: 'decision-suite',
    name: 'Decision Suite',
    path: '/tools',
    icon: Layers,
    badge: 'PRO',
    activeContainer: 'bg-white shadow-sm border-indigo-300 ring-1 ring-indigo-500/20',
    inactiveContainer: 'border-transparent hover:bg-white/70 hover:border-slate-200/80 hover:shadow-2xs',
    activeIconBox: 'bg-indigo-600 text-white shadow-xs',
    inactiveIconBox: 'bg-indigo-50 text-indigo-600 border border-indigo-100/80 group-hover:bg-indigo-100/70',
    activeText: 'text-slate-950 font-bold',
    inactiveText: 'text-slate-800 group-hover:text-slate-950 font-semibold',
    activeBadge: 'bg-indigo-600 text-white shadow-xs',
    inactiveBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/70 group-hover:bg-indigo-100 group-hover:text-indigo-800',
    description: 'Career engineering tools, project briefs & skill verification',
  },
  {
    id: 'ats-roaster',
    name: 'ATS Roaster',
    path: '/tools/resume-checker',
    icon: Flame,
    badge: 'HOT',
    activeContainer: 'bg-white shadow-sm border-amber-300 ring-1 ring-amber-500/20',
    inactiveContainer: 'border-transparent hover:bg-white/70 hover:border-slate-200/80 hover:shadow-2xs',
    activeIconBox: 'bg-amber-500 text-white shadow-xs',
    inactiveIconBox: 'bg-amber-50 text-amber-600 border border-amber-100/80 group-hover:bg-amber-100/70',
    activeText: 'text-slate-950 font-bold',
    inactiveText: 'text-slate-800 group-hover:text-slate-950 font-semibold',
    activeBadge: 'bg-amber-500 text-white shadow-xs',
    inactiveBadge: 'bg-amber-50 text-amber-700 border border-amber-200/70 group-hover:bg-amber-100 group-hover:text-amber-800',
    description: 'Instant ruthless resume audit & keyword scoring',
  },
  {
    id: 'career-trajectory',
    name: 'Career Trajectory',
    path: '/tools/career-path',
    icon: TrendingUp,
    badge: '₹ CTC',
    activeContainer: 'bg-white shadow-sm border-emerald-300 ring-1 ring-emerald-500/20',
    inactiveContainer: 'border-transparent hover:bg-white/70 hover:border-slate-200/80 hover:shadow-2xs',
    activeIconBox: 'bg-emerald-600 text-white shadow-xs',
    inactiveIconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-100/80 group-hover:bg-emerald-100/70',
    activeText: 'text-slate-950 font-bold',
    inactiveText: 'text-slate-800 group-hover:text-slate-950 font-semibold',
    activeBadge: 'bg-emerald-600 text-white shadow-xs',
    inactiveBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70 group-hover:bg-emerald-100 group-hover:text-emerald-800',
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between">

        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-all duration-200">
              <Sparkles className="w-4 h-4 text-white stroke-[2.5px]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[18px] font-extrabold text-slate-950 tracking-tight group-hover:text-sky-600 transition-colors">
                HireFlow
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                Suite
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Premium Light-Palette Subsections Widget Dock */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100/95 border border-slate-200/90 rounded-2xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          {NAV_TOOLS.map((tool) => {
            const active = isItemActive(tool.path);
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className={`
                  group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] border transition-all duration-150 select-none
                  ${active ? tool.activeContainer : tool.inactiveContainer}
                `}
              >
                {/* Icon Box */}
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                  active ? tool.activeIconBox : tool.inactiveIconBox
                }`}>
                  <tool.icon className="w-3.5 h-3.5 stroke-[2.2px]" />
                </div>

                {/* Sub-section Label - Dark & prominent */}
                <span className={`whitespace-nowrap transition-colors tracking-tight ${
                  active ? tool.activeText : tool.inactiveText
                }`}>
                  {tool.name}
                </span>

                {/* Crisp Light Palette Badge */}
                <span className={`
                  text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md transition-all
                  ${active ? tool.activeBadge : tool.inactiveBadge}
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
                className="h-[36px] px-4 text-[13px] font-semibold rounded-full flex items-center gap-1.5 shadow-xs bg-slate-900 hover:bg-black text-white"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5 stroke-[2px]" />
              </Button>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-[13px] font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all"
              >
                Sign In
              </Link>
              <Link to="/register">
                <button className="h-[36px] px-4 rounded-full bg-slate-950 hover:bg-black text-white font-bold text-[13px] shadow-sm hover:shadow transition-all duration-150 flex items-center gap-1.5">
                  Get Started
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Clean, crisp light palette) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl animate-slide-up">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 px-2">
            Platform Subsections
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
                      ? `${tool.activeContainer} bg-white ring-1 ring-slate-900/10`
                      : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      active ? tool.activeIconBox : tool.inactiveIconBox
                    }`}>
                      <tool.icon className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[14px] font-bold ${
                          active ? 'text-slate-950' : 'text-slate-800'
                        }`}>{tool.name}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                          active ? tool.activeBadge : tool.inactiveBadge
                        }`}>
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 font-normal mt-0.5">{tool.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </Link>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-[13px] font-bold text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-[13px] font-bold text-white bg-slate-950 hover:bg-black rounded-xl shadow-xs transition-all"
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
