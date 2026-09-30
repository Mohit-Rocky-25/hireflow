// ============================================================
// HireFlow v3 — Top Header — Black Dropdown Menus
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Menu, Bell, Search, LogOut, User, Settings, ChevronDown, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const getProfileLink = () => {
    if (currentUser.role === 'PLATFORM_ADMIN') return '/admin/settings';
    if (['BHR_MANAGER', 'HR_RECRUITER'].includes(currentUser.role)) return '/company/settings';
    if (currentUser.role === 'INTERVIEWER') return '/interviewer/profile';
    return '/candidate/profile';
  };

  const getSettingsLink = () => {
    if (currentUser.role === 'PLATFORM_ADMIN') return '/admin/settings';
    if (['BHR_MANAGER', 'HR_RECRUITER'].includes(currentUser.role)) return '/company/settings';
    return getProfileLink();
  };

  return (
    <header className="h-[68px] bg-surface border-b border-border flex items-center justify-between px-[24px] lg:px-[32px] shrink-0 z-40 shadow-sm">
      {/* Left — greeting */}
      <div className="flex items-center gap-[16px]">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-[8px] rounded-md hover:bg-surface-2 transition-colors duration-[120ms]"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-text stroke-[1.5px]" />
        </button>

        <div className="hidden md:flex items-center gap-[8px] mr-[8px]">
          <button title="Go back" onClick={() => navigate(-1)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors">
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>
          <button title="Go forward" onClick={() => navigate(1)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-surface-2 transition-colors">
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="hidden sm:block">
          <h2 className="text-[15px] font-semibold text-text-secondary leading-[22px]">
            {getGreeting()},{' '}
            <span className="font-bold text-text">{currentUser.displayName}</span>
          </h2>
          {currentCompany && (
            <p className="text-[12px] text-text-muted flex items-center gap-[6px] mt-[1px]">
              <span className="w-[5px] h-[5px] rounded-full bg-success inline-block" />
              {currentCompany.name}
            </p>
          )}
        </div>
      </div>

      {/* Center — Search */}
      <div className="hidden md:flex items-center flex-1 max-w-[400px] mx-[32px]">
        <div className="w-full flex items-center h-[40px] px-[14px] bg-surface-2 border border-border rounded-xl text-text-muted hover:border-border-strong focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-[120ms]">
          <Search className="w-[16px] h-[16px] stroke-[1.5px] shrink-0" />
          <input
            type="text"
            placeholder="Search jobs, candidates, interviews..."
            className="flex-1 ml-[10px] bg-transparent text-[14px] text-text placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-[8px]">
        <button className="md:hidden p-[8px] rounded-md hover:bg-surface-2 transition-colors duration-[120ms] text-text-muted hover:text-text">
          <Search className="w-5 h-5 stroke-[1.5px]" />
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="p-[8px] rounded-xl hover:bg-surface-2 transition-colors duration-[120ms] text-text-muted hover:text-text relative"
          >
            <Bell className="w-5 h-5 stroke-[1.5px]" />
            {unreadCount > 0 && (
              <span className="absolute top-[4px] right-[4px] w-[16px] h-[16px] bg-gradient-to-br from-primary to-primary-active text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── BLACK NOTIFICATIONS DROPDOWN ── */}
          {notifOpen && (
            <div
              className="absolute right-0 top-[56px] w-[340px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] animate-scale-in z-50 overflow-hidden"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-[18px] py-[14px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-[14px] font-bold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[12px] font-semibold transition-colors"
                    style={{ color: '#0EA5E9' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#38BDF8')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#0EA5E9')}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-[18px] py-[36px] text-center">
                    <Bell className="w-[32px] h-[32px] mx-auto mb-[10px] opacity-20 stroke-[1.5px]" style={{ color: 'rgba(255,255,255,0.5)' }} />
                    <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { markNotificationRead(n.id); if (n.link) navigate(n.link); setNotifOpen(false); }}
                      className="w-full text-left px-[18px] py-[13px] transition-colors"
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: !n.read ? 'rgba(14,165,233,0.08)' : 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = !n.read ? 'rgba(14,165,233,0.14)' : 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = !n.read ? 'rgba(14,165,233,0.08)' : 'transparent')}
                    >
                      <div className="flex items-start gap-[10px]">
                        {!n.read && <div className="w-[6px] h-[6px] rounded-full mt-[5px] flex-shrink-0" style={{ background: '#0EA5E9' }} />}
                        <div className={!n.read ? '' : 'ml-[16px]'}>
                          <p className="text-[13px] font-semibold text-white">{n.title}</p>
                          <p className="text-[12px] mt-[2px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{n.message}</p>
                          <p className="text-[11px] mt-[4px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
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
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-[8px] pl-[10px] pr-[8px] py-[6px] rounded-xl hover:bg-surface-2 transition-colors duration-[120ms] group"
          >
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary to-primary-active flex items-center justify-center text-white text-[12px] font-bold shadow-sm">
              {initials}
            </div>
            <span className="hidden md:block text-[13px] font-semibold text-text max-w-[120px] truncate">
              {currentUser.displayName}
            </span>
            <ChevronDown className={`w-[14px] h-[14px] text-text-muted hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* ── BLACK PROFILE DROPDOWN ── */}
          {profileOpen && (
            <div
              className="absolute right-0 top-[56px] w-[260px] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] animate-scale-in z-50 overflow-hidden"
              style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* User info header */}
              <div className="px-[18px] py-[16px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-[12px]">
                  <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-primary to-primary-active flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-[11px] mt-[1px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {currentUser.role.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{currentUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-[6px]">
                <Link
                  to={getProfileLink()}
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-[12px] px-[18px] py-[11px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
                >
                  <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <User className="w-[14px] h-[14px] stroke-[1.5px]" />
                  </div>
                  <span className="text-[13px] font-medium">My Profile</span>
                </Link>

                <Link
                  to={getSettingsLink()}
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-[12px] px-[18px] py-[11px] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
                >
                  <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Settings className="w-[14px] h-[14px] stroke-[1.5px]" />
                  </div>
                  <span className="text-[13px] font-medium">Account Settings</span>
                </Link>

                {currentUser.role === 'PLATFORM_ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-[12px] px-[18px] py-[11px] transition-colors"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
                  >
                    <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)' }}>
                      <Shield className="w-[14px] h-[14px] stroke-[1.5px]" style={{ color: '#8B5CF6' }} />
                    </div>
                    <span className="text-[13px] font-medium">Admin Panel</span>
                  </Link>
                )}
              </div>

              {/* Sign out */}
              <div className="px-[10px] pb-[10px]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-[12px] px-[12px] py-[11px] mt-[6px] rounded-xl transition-all"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#FCA5A5' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; (e.currentTarget as HTMLElement).style.color = '#FCA5A5'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = '#FCA5A5'; }}
                >
                  <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
                    <LogOut className="w-[14px] h-[14px] stroke-[1.5px]" />
                  </div>
                  <span className="text-[13px] font-bold">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
