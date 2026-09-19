// ============================================================
// HireFlow — Notifications Center (All Roles)
// ============================================================
import { useStore } from '../store/useStore';
import type { Notification } from '../types';
import { Bell, CheckCheck, Briefcase, Calendar, Star, AlertCircle, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  new_application: <Briefcase className="w-4 h-4 text-primary" />,
  interview_scheduled: <Calendar className="w-4 h-4 text-purple-600" />,
  status_change: <Star className="w-4 h-4 text-amber-600" />,
  offer: <Star className="w-4 h-4 text-success" />,
  feedback_submitted: <CheckCheck className="w-4 h-4 text-success" />,
  alert: <AlertCircle className="w-4 h-4 text-danger" />,
};

const NOTIF_BG: Record<string, string> = {
  new_application: 'bg-blue-50',
  interview_scheduled: 'bg-purple-50',
  status_change: 'bg-amber-50',
  offer: 'bg-green-50',
  feedback_submitted: 'bg-emerald-50',
  alert: 'bg-red-50',
};

export function NotificationsPage() {
  const { currentUser, getUserNotifications, markNotificationRead, markAllNotificationsRead, notifications } = useStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const myNotifs = getUserNotifications(currentUser.id);
  const unread = myNotifs.filter((n: Notification) => !n.read);

  const handleClick = (notif: typeof myNotifs[0]) => {
    markNotificationRead(notif.id);
    if (notif.link) navigate(notif.link);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-muted mt-0.5">
            {unread.length > 0 ? `${unread.length} unread notification${unread.length > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary border border-primary/20 rounded-btn hover:bg-primary-light transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Unread Badge */}
      {unread.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-primary-light border border-primary/20 rounded-btn">
          <Bell className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-sm font-medium text-primary">{unread.length} new notification{unread.length > 1 ? 's' : ''} since you last checked</p>
        </div>
      )}

      {/* Notification List */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {myNotifs.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 text-muted mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium text-foreground">No notifications yet</p>
            <p className="text-sm text-muted mt-1">You'll be notified of important updates here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {myNotifs.map((notif: Notification) => {
              const bgCls = NOTIF_BG[notif.type] || 'bg-gray-50';
              const icon = NOTIF_ICONS[notif.type] || <Info className="w-4 h-4 text-muted" />;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-all hover:bg-gray-50 ${!notif.read ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                >
                  <div className={`w-9 h-9 rounded-full ${bgCls} flex items-center justify-center shrink-0 mt-0.5`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-secondary'}`}>{notif.title}</p>
                      <span className="text-[10px] text-muted whitespace-nowrap shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{notif.message}</p>
                    {notif.link && (
                      <p className="text-xs text-primary font-medium mt-1.5 flex items-center gap-1">
                        View details <ArrowRight className="w-3 h-3" />
                      </p>
                    )}
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
