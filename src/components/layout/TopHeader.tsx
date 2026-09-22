// ============================================================
// HireFlow v2 — Top Header (§7, §13)
// Height: 64px. Greeting from profiles.display_name.
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Menu, Bell, Search, LogOut, User, Settings, ChevronDown } from 'lucide-react';

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

  // Dynamic greeting from §7 — always reads from profiles.display_name
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
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
    <header className="h-[64px] bg-surface border-b border-border flex items-center justify-between px-[24px] shrink-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-[16px]">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-[8px] rounded-md hover:bg-surface-2 transition-colors duration-[120ms]"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-text stroke-[1.5px]" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-[14px] font-medium text-text">
            {getGreeting()}, <span className="font-semibold">{currentUser.displayName}</span>
          </h2>
          {currentCompany && (
            <p className="text-[12px] text-text-muted">{currentCompany.name}</p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-[4px]">
        {/* Search */}
        <button className="p-[8px] rounded-md hover:bg-surface-2 transition-colors duration-[120ms] text-text-muted hover:text-text">
          <Search className="w-5 h-5 stroke-[1.5px]" />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-[8px] rounded-md hover:bg-surface-2 transition-colors duration-[120ms] text-text-muted hover:text-text relative"
          >
            <Bell className="w-5 h-5 stroke-[1.5px]" />
            {unreadCount > 0 && (
              <span className="absolute top-[4px] right-[4px] w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-[52px] w-[320px] bg-surface border border-border rounded-lg shadow-lg animate-scale-in z-50">
              <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-border">
                <h3 className="text-[14px] font-semibold text-text">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[12px] text-primary hover:text-primary-hover font-medium transition-colors duration-[120ms]"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-[16px] py-[32px] text-center">
                    <Bell className="w-[32px] h-[32px] text-text-muted mx-auto mb-[8px] opacity-40 stroke-[1.5px]" />
                    <p className="text-[13px] text-text-muted">No notifications yet</p>
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
                      className={`w-full text-left px-[16px] py-[12px] border-b border-border/50 hover:bg-surface-2 transition-colors duration-[120ms] ${!n.read ? 'bg-primary-light' : ''}`}
                    >
                      <p className="text-[13px] font-medium text-text">{n.title}</p>
                      <p className="text-[12px] text-text-muted mt-[2px]">{n.message}</p>
                      <p className="text-[11px] text-text-muted mt-[4px]">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-[8px] pl-[12px] pr-[8px] py-[6px] rounded-md hover:bg-surface-2 transition-colors duration-[120ms]"
          >
            <div className="w-[32px] h-[32px] rounded-full bg-primary-light flex items-center justify-center text-primary text-[12px] font-semibold">
              {initials}
            </div>
            <span className="hidden md:block text-[13px] font-medium text-text max-w-[120px] truncate">
              {currentUser.displayName}
            </span>
            <ChevronDown className="w-[14px] h-[14px] text-text-muted hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[52px] w-[240px] bg-surface border border-border rounded-lg shadow-lg animate-scale-in z-50">
              <div className="px-[16px] py-[12px] border-b border-border">
                <p className="text-[14px] font-semibold text-text">{currentUser.displayName}</p>
                <p className="text-[12px] text-text-muted mt-[2px]">{currentUser.role.replace(/_/g, ' ')}</p>
                <p className="text-[12px] text-text-muted">{currentUser.email}</p>
              </div>
              <div className="py-[4px]">
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-[12px] px-[16px] py-[10px] text-[13px] text-text hover:bg-surface-2 transition-colors duration-[120ms]"
                >
                  <User className="w-4 h-4 text-text-muted stroke-[1.5px]" />
                  Profile
                </button>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-[12px] px-[16px] py-[10px] text-[13px] text-text hover:bg-surface-2 transition-colors duration-[120ms]"
                >
                  <Settings className="w-4 h-4 text-text-muted stroke-[1.5px]" />
                  Account Settings
                </button>
              </div>
              <div className="border-t border-border py-[4px]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-[12px] px-[16px] py-[10px] text-[13px] text-danger hover:bg-danger-bg transition-colors duration-[120ms]"
                >
                  <LogOut className="w-4 h-4 stroke-[1.5px]" />
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
