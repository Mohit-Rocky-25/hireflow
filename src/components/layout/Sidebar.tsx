// ============================================================
// HireFlow — Role-Aware Sidebar
// ============================================================
import { NavLink, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';
import {
  LayoutDashboard, Briefcase, Users, UserCheck, Calendar,
  BarChart3, Settings, FileText, Search, Bell, User,
  Building2, Shield, ChevronLeft, Award,
  ChevronRight, Sparkles, ClipboardList, Home
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

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  BHR_MANAGER: [
    { label: 'Dashboard', path: '/company/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Jobs', path: '/company/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Candidates', path: '/company/candidates', icon: <Users className="w-5 h-5" /> },
    { label: 'Interviewers', path: '/company/interviewers', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Analytics', path: '/company/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Offers', path: '/company/offers', icon: <Award className="w-5 h-5" /> },
    { label: 'Team', path: '/company/team', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Notifications', path: '/company/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Settings', path: '/company/settings', icon: <Settings className="w-5 h-5" /> },
  ],
  HR_RECRUITER: [
    { label: 'Dashboard', path: '/company/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Jobs', path: '/company/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Candidates', path: '/company/candidates', icon: <Users className="w-5 h-5" /> },
    { label: 'Analytics', path: '/company/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Notifications', path: '/company/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', path: '/company/settings', icon: <User className="w-5 h-5" /> },
  ],
  INTERVIEWER: [
    { label: 'Dashboard', path: '/interviewer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Interviews', path: '/interviewer/interviews', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Notifications', path: '/interviewer/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', path: '/interviewer/profile', icon: <User className="w-5 h-5" /> },
  ],
  CANDIDATE: [
    { label: 'Home', path: '/candidate/dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Find Jobs', path: '/candidate/jobs', icon: <Search className="w-5 h-5" /> },
    { label: 'My Applications', path: '/candidate/applications', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'Interviews', path: '/candidate/interviews', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Resume', path: '/candidate/resume', icon: <FileText className="w-5 h-5" /> },
    { label: 'Notifications', path: '/candidate/notifications', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', path: '/candidate/profile', icon: <User className="w-5 h-5" /> },
  ],
  PLATFORM_ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Companies', path: '/admin/companies', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Audit Log', path: '/admin/audit', icon: <Shield className="w-5 h-5" /> },
    { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
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
      <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-btn bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground tracking-tight truncate">
              HireFlow
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-light text-primary shadow-sm'
                  : 'text-secondary hover:bg-gray-50 hover:text-foreground'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <span className={`shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted group-hover:text-foreground'}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-btn text-sm text-muted hover:bg-gray-50 hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
