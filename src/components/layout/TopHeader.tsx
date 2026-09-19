// ============================================================
// HireFlow — Top Header with Notification & Profile Dropdowns
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Menu, Bell, Search, LogOut, User, Settings, ChevronDown, ArrowRight, CheckCheck } from 'lucide-react';

interface TopHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { currentUser, logout, getUnreadCount, getUserNotifications, markNotificationRead, markAllNotificationsRead, companies, currentCompanyId } = useStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;
  const notifications = currentUser ? getUserNotifications(currentUser.id).slice(0, 8) : [];
  const currentCompany = companies.find(c => c.id === currentCompanyId);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getProfilePath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'BHR_MANAGER': case 'HR_RECRUITER': return '/company/settings';
      case 'INTERVIEWER': return '/interviewer/profile';
      case 'CANDIDATE': return '/candidate/profile';
      case 'PLATFORM_ADMIN': return '/admin/settings';
      default: return '/';
    }
  };

  const getSettingsPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'BHR_MANAGER': case 'HR_RECRUITER': return '/company/settings';
      case 'PLATFORM_ADMIN': return '/admin/settings';
      default: return getProfilePath();
    }
  };

  const getNotificationsPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'BHR_MANAGER': case 'HR_RECRUITER': return '/company/notifications';
      case 'INTERVIEWER': return '/interviewer/notifications';
      case 'CANDIDATE': return '/candidate/notifications';
      case 'PLATFORM_ADMIN': return '/admin/notifications';
      default: return '/';
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  const initials = currentUser.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-btn hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-sm font-medium text-foreground">
            {getGreeting()}, <span className="font-semibold">{currentUser.displayName}</span>
          </h2>
          {currentCompany && <p className="text-xs text-muted">{currentCompany.name}</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-btn border border-border hover:bg-gray-100 transition-colors text-muted hover:text-foreground"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:block text-xs">Search…</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted bg-gray-100 rounded border border-gray-200">⌘K</kbd>
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-btn hover:bg-gray-100 transition-colors text-muted hover:text-foreground relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in pulse-ring">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-96 bg-surface border border-border rounded-card shadow-dropdown animate-scale-in z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-[10px] text-muted">{unreadCount} unread</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-muted">No notifications yet</p>
                    <p className="text-xs text-muted mt-1">You'll see updates here</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.link) navigate(n.link);
                        setNotifOpen(false);
                      }}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-light/30 border-l-3 border-l-primary' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full shrink-0 mt-0.5 flex items-center justify-center ${!n.read ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-muted'}`}>
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${!n.read ? 'text-foreground' : 'text-secondary'}`}>{n.title}</p>
                        <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </button>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="border-t border-border">
                  <button
                    onClick={() => { navigate(getNotificationsPath()); setNotifOpen(false); }}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary-light/30 transition-colors"
                  >
                    View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-btn hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {currentUser.displayName}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted hidden md:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 bg-surface border border-border rounded-card shadow-dropdown animate-scale-in z-50">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{currentUser.displayName}</p>
                    <p className="text-[10px] font-medium text-primary bg-primary-light px-1.5 py-0.5 rounded-full w-fit">{currentUser.role.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <p className="text-xs text-muted mt-2">{currentUser.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setProfileOpen(false); navigate(getProfilePath()); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-muted" />
                  Profile
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate(getSettingsPath()); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted" />
                  Settings
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate(getNotificationsPath()); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <Bell className="w-4 h-4 text-muted" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-danger text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
