// ============================================================
// HireFlow v2 — Role-Aware Sidebar (§6, §7)
// Sidebar width: 260px expanded / 72px collapsed
// ============================================================
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';
import {
  LayoutDashboard, Briefcase, Users, UserCheck, Calendar,
  BarChart3, Settings, FileText, Search, Bell, User,
  Building2, Shield, ChevronLeft, Award, MessageSquare,
  ChevronRight, Sparkles, ClipboardList, Home, Cpu, ListChecks
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// Sidebar items per role — directly from §7 sidebar table
const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  BHR_MANAGER: [
    { label: 'Dashboard', path: '/company/dashboard', icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Jobs', path: '/company/jobs', icon: <Briefcase className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Candidates', path: '/company/candidates', icon: <Users className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Interviewers', path: '/company/interviewers', icon: <UserCheck className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Candidate Ranking', path: '/company/ranking', icon: <ListChecks className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Analytics', path: '/company/analytics', icon: <BarChart3 className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Company Team', path: '/company/team', icon: <Building2 className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Settings', path: '/company/settings', icon: <Settings className="w-5 h-5 stroke-[1.5px]" /> },
  ],
  HR_RECRUITER: [
    { label: 'Dashboard', path: '/company/dashboard', icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'My Jobs', path: '/company/jobs', icon: <Briefcase className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Applications', path: '/company/candidates', icon: <ClipboardList className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Candidates', path: '/company/candidates', icon: <Users className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Interviews', path: '/company/interviews', icon: <Calendar className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Messages', path: '/company/messages', icon: <MessageSquare className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Analytics', path: '/company/analytics', icon: <BarChart3 className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Profile', path: '/company/settings', icon: <User className="w-5 h-5 stroke-[1.5px]" /> },
  ],
  INTERVIEWER: [
    { label: 'Dashboard', path: '/interviewer/dashboard', icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'My Interviews', path: '/interviewer/interviews', icon: <Calendar className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Assigned Candidates', path: '/interviewer/candidates', icon: <Users className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Interview Feedback', path: '/interviewer/feedback', icon: <FileText className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Profile', path: '/interviewer/profile', icon: <User className="w-5 h-5 stroke-[1.5px]" /> },
  ],
  CANDIDATE: [
    { label: 'Home', path: '/candidate/dashboard', icon: <Home className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Find Jobs', path: '/candidate/jobs', icon: <Search className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'My Applications', path: '/candidate/applications', icon: <ClipboardList className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Interviews', path: '/candidate/interviews', icon: <Calendar className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Resume', path: '/candidate/resume', icon: <FileText className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Profile', path: '/candidate/profile', icon: <User className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Notifications', path: '/candidate/notifications', icon: <Bell className="w-5 h-5 stroke-[1.5px]" /> },
  ],
  PLATFORM_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Companies', path: '/admin/companies', icon: <Building2 className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Jobs', path: '/admin/jobs', icon: <Briefcase className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'AI Configuration', path: '/admin/ai', icon: <Cpu className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Audit Logs', path: '/admin/audit', icon: <Shield className="w-5 h-5 stroke-[1.5px]" /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5 stroke-[1.5px]" /> },
  ],
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { currentUser } = useStore();
  const location = useLocation();

  if (!currentUser) return null;

  const navItems = NAV_ITEMS[currentUser.role] || [];

  return (
    <div className="h-full flex flex-col bg-surface border-r border-border w-full">
      {/* Logo */}
      <div className="h-[64px] flex items-center px-[20px] border-b border-border shrink-0">
        <div className="flex items-center gap-[12px] min-w-0">
          <div className="w-[36px] h-[36px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shrink-0 shadow-glow-orange">
            <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
          </div>
          {!collapsed && (
            <span className="text-[16px] font-bold text-text tracking-[-0.02em] truncate">
              HireFlow
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-[16px] px-[12px] space-y-[2px] overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/company/dashboard' &&
             item.path !== '/interviewer/dashboard' &&
             item.path !== '/candidate/dashboard' &&
             item.path !== '/admin/dashboard' &&
             location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path + item.label}
              to={item.path}
              className={`flex items-center gap-[12px] px-[12px] py-[10px] rounded-md text-[14px] font-medium transition-all duration-[120ms] ease-out group min-h-[40px] relative
                ${
                  isActive
                    ? 'nav-active text-primary shadow-xs'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                }
                ${collapsed ? 'justify-center px-0 rounded-md' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className={`shrink-0 transition-colors duration-[120ms] ${
                isActive ? 'text-primary' : 'text-text-muted group-hover:text-text'
              }`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-[6px] h-[6px] rounded-full bg-primary shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-[12px] py-[12px] border-t border-border shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-[8px] px-[12px] py-[8px] rounded-md text-[13px] text-text-muted hover:bg-surface-2 hover:text-text transition-all duration-[120ms] group"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 group-hover:text-primary transition-colors" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="text-[13px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
