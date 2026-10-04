// ============================================================
// HireFlow — Platform Admin Dashboard
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Building2, Users, Briefcase, FileText, ShieldAlert, ArrowRight, Activity } from 'lucide-react';

export function AdminDashboard() {
  const { companies, users, jobs, applications, auditLogs } = useStore();

  const stats = [
    { label: 'Total Companies', value: companies.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/companies' },
    { label: 'Platform Users', value: users.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/users' },
    { label: 'Active Jobs', value: jobs.filter(j => j.status === 'published').length, icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Applications', value: applications.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Platform Administration</h1>
          <p className="text-sm text-muted">System-wide monitoring, multi-tenant governance, and audit records.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-success text-xs font-semibold rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Healthy
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted">{stat.label}</span>
                <div className={`p-2 rounded-btn ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              {stat.link && (
                <Link to={stat.link} className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-2 hover:underline">
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registered Companies Preview */}
        <div className="bg-surface rounded-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Active Organizations
            </h2>
            <Link to="/admin/companies" className="text-xs text-primary font-semibold hover:underline">
              View All ({companies.length})
            </Link>
          </div>

          <div className="space-y-3">
            {companies.slice(0, 4).map(c => {
              const compJobs = jobs.filter(j => j.companyId === c.id);
              return (
                <div key={c.id} className="p-3 bg-gray-50 border border-border rounded-btn flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted">{c.industry} • {c.location} • {c.size}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs bg-blue-100 text-primary font-medium rounded-full">
                    {compJobs.length} open jobs
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Activity & Logs */}
        <div className="bg-surface rounded-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Audit & System Activity
            </h2>
            <span className="text-xs text-muted">{auditLogs.length} events logged</span>
          </div>

          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No recent audit activity records found.</p>
            ) : (
              auditLogs.slice(0, 5).map((log, i) => (
                <div key={i} className="text-xs border-b border-border pb-2.5 last:border-b-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-foreground">{log.action}</span>
                    <span className="text-muted">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-muted">{log.entity}: {log.entityId} {log.details ? `— ${log.details}` : ''}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
