// ============================================================
// HireFlow — Enhanced Platform Admin Dashboard
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Building2, Users, Briefcase, FileText, ShieldAlert,
  ArrowRight, Activity, TrendingUp, Brain, Award, Globe, Shield
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

const ROLE_COLORS: Record<string, string> = {
  BHR_MANAGER: '#2563EB',
  HR_RECRUITER: '#7C3AED',
  INTERVIEWER: '#F59E0B',
  CANDIDATE: '#16A34A',
  PLATFORM_ADMIN: '#DC2626',
};

export function AdminDashboard() {
  const { companies, users, jobs, applications, auditLogs, interviews, candidateMatches } = useStore();

  const activeJobs = jobs.filter(j => j.status === 'published').length;
  const totalApps = applications.length;
  const hired = applications.filter(a => a.status === 'HIRED').length;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;
  const avgAiScore = candidateMatches.length > 0
    ? Math.round(candidateMatches.reduce((s, m) => s + m.overallScore, 0) / candidateMatches.length)
    : 0;

  // Users by role for pie chart
  const roleCounts: Record<string, number> = {};
  users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });
  const roleData = Object.entries(roleCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Jobs per company for bar chart
  const companyJobData = companies.map(c => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + '…' : c.name,
    jobs: jobs.filter(j => j.companyId === c.id).length,
    apps: applications.filter(a => a.companyId === c.id).length,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-btn p-3 shadow-dropdown text-xs">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Platform Administration
          </h1>
          <p className="text-sm text-muted mt-0.5">System-wide monitoring, governance, and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-success text-xs font-semibold rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Platform Healthy
          </span>
          <span className="text-xs text-muted">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Companies', value: companies.length, icon: Building2, color: 'text-blue-600 bg-blue-50', link: '/admin/companies' },
          { label: 'Users', value: users.length, icon: Users, color: 'text-indigo-600 bg-indigo-50', link: '/admin/users' },
          { label: 'Active Jobs', value: activeJobs, icon: Briefcase, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Applications', value: totalApps, icon: FileText, color: 'text-purple-600 bg-purple-50' },
          { label: 'Hired', value: hired, icon: Award, color: 'text-amber-600 bg-amber-50' },
          { label: 'Avg AI Score', value: `${avgAiScore}%`, icon: Brain, color: 'text-ai bg-ai-light' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-sm card-lift">
              <div className={`w-9 h-9 rounded-btn ${stat.color.split(' ')[1]} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${stat.color.split(' ')[0]}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
              {stat.link && (
                <Link to={stat.link} className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold mt-1.5 hover:underline">
                  Manage <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Users by Role</h3>
          {roleData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted text-sm">No data</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {roleData.map((entry, index) => (
                      <Cell key={index} fill={Object.values(ROLE_COLORS)[index % Object.values(ROLE_COLORS).length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 text-xs">
                {roleData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: Object.values(ROLE_COLORS)[i % Object.values(ROLE_COLORS).length] }} />
                      <span className="text-muted truncate">{entry.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Jobs & Apps per Company */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Activity by Company</h3>
          {companyJobData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={companyJobData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jobs" name="Jobs" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="apps" name="Applications" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations Preview */}
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Active Organizations
            </h2>
            <Link to="/admin/companies" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View All ({companies.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {companies.slice(0, 4).map(c => {
              const compJobs = jobs.filter(j => j.companyId === c.id);
              const compApps = applications.filter(a => a.companyId === c.id);
              return (
                <div key={c.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-btn bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted">{c.industry} • {c.location} • {c.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-primary font-semibold rounded-full">{compJobs.length} jobs</span>
                    <span className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-600 font-semibold rounded-full">{compApps.length} apps</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Log Preview */}
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Recent Activity
            </h2>
            <Link to="/admin/audit" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              Full Audit Log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {auditLogs.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <ShieldAlert className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted">No audit activity yet</p>
              </div>
            ) : (
              auditLogs.slice(0, 5).map((log, i) => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <div key={i} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted text-[10px] font-bold shrink-0 mt-0.5">
                      {user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-semibold text-foreground">{user?.displayName || 'System'}</span>
                        {' '}
                        <span className="text-muted">{log.action.replace(/_/g, ' ')}</span>
                        {' on '}
                        <span className="font-medium text-foreground">{log.entity}</span>
                      </p>
                      {log.details && <p className="text-[10px] text-muted mt-0.5 truncate">{log.details}</p>}
                    </div>
                    <span className="text-[10px] text-muted shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Platform Summary */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-card p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-blue-300" />
          <h3 className="text-sm font-bold">Platform Health Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Uptime', value: '99.9%' },
            { label: 'API Latency', value: '42ms' },
            { label: 'Interviews Completed', value: completedInterviews },
            { label: 'AI Analyses Run', value: candidateMatches.length },
          ].map((m, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-btn border border-white/10">
              <p className="text-lg font-bold text-white">{m.value}</p>
              <p className="text-xs text-slate-300">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
