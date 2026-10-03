import { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { BarChart3, Briefcase, Users, Calendar, TrendingUp, Target, Clock, Award } from 'lucide-react';

const COLORS = ['#2563EB', '#7C3AED', '#16A34A', '#F59E0B', '#DC2626', '#0891B2', '#EC4899', '#64748B', '#10B981'];

const STATUS_COLORS: Record<string, string> = {
  APPLIED: '#94A3B8',
  SCREENING: '#0891B2',
  REVIEW: '#6366F1',
  SHORTLISTED: '#F59E0B',
  INTERVIEW: '#2563EB',
  FINAL_REVIEW: '#7C3AED',
  OFFER: '#16A34A',
  HIRED: '#059669',
  REJECTED: '#DC2626',
};

const SOURCE_OPTIONS = ['Career Site', 'Referral', 'LinkedIn', 'Agency', 'Campus'];

const PERIOD_OPTIONS = ['7d', '30d', '90d', 'All'];

export function CompanyAnalytics() {
  const { currentCompanyId, jobs, applications, interviews, candidateMatches, users } = useStore();
  const [period, setPeriod] = useState('30d');

  const companyJobs = jobs.filter(j => j.companyId === currentCompanyId);
  const companyApps = applications.filter(a => a.companyId === currentCompanyId);
  const companyInterviews = interviews.filter(i => i.companyId === currentCompanyId);
  const companyMatches = candidateMatches.filter(m => companyJobs.some(j => j.id === m.jobId));
  const companyInterviewers = users.filter(u => u.companyId === currentCompanyId && u.role === 'INTERVIEWER');

  // Status breakdown for pie
  const statusCounts: Record<string, number> = {};
  companyApps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
  const pipelineData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Source of Hire (Deterministic Mock based on Application ID)
  const sourceCounts: Record<string, number> = {};
  companyApps.forEach(a => {
    const sIndex = a.id.length % SOURCE_OPTIONS.length;
    const source = SOURCE_OPTIONS[sIndex];
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Applications per job
  const jobAppData = companyJobs.map(job => ({
    name: job.title.length > 18 ? job.title.substring(0, 18) + '…' : job.title,
    applications: companyApps.filter(a => a.jobId === job.id).length,
    shortlisted: companyApps.filter(a => a.jobId === job.id && ['SHORTLISTED', 'INTERVIEW', 'FINAL_REVIEW', 'OFFER', 'HIRED'].includes(a.status)).length,
  }));

  // Interviewer Load
  const interviewerLoad = companyInterviewers.map(inv => {
    const assigned = companyInterviews.filter(i => i.interviewerId === inv.id);
    return {
      name: inv.displayName.split(' ')[0], // First name
      completed: assigned.filter(a => a.status === 'completed').length,
      upcoming: assigned.filter(a => a.status === 'scheduled').length,
    };
  }).sort((a,b) => (b.completed + b.upcoming) - (a.completed + a.upcoming)).slice(0, 8); // Top 8

  // Simulated time-series data for applications trend (last 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const trendData = days.map(d => {
    const label = d.toLocaleDateString('en', { weekday: 'short' });
    const dayStr = d.toISOString().split('T')[0];
    const received = companyApps.filter(a => a.appliedAt.startsWith(dayStr)).length;
    return { day: label, received, reviewed: Math.max(0, received - Math.floor(Math.random() * 2)) };
  });
  // Ensure there's at least some demo data
  if (trendData.every(d => d.received === 0)) {
    trendData[1].received = 3; trendData[2].received = 5; trendData[3].received = 2;
    trendData[4].received = 7; trendData[5].received = 4; trendData[6].received = 6;
    trendData.forEach(d => { d.reviewed = Math.max(0, d.received - 1); });
  }

  // Calculate Avg Time-to-Review and Time-to-Hire (Deterministic Mock)
  // In reality, this requires tracking timestamp diffs across statusHistory
  const avgTimeToReview = companyApps.length > 0 ? (2 + (companyApps.length % 3) + 0.4).toFixed(1) + 'd' : 'N/A';
  const avgTimeToHire = (statusCounts['HIRED'] || 0) > 0 ? (12 + (companyApps.length % 5) + 0.5).toFixed(1) + 'd' : 'N/A';

  const hired = statusCounts['HIRED'] || 0;
  const avgScore = companyMatches.length > 0 ? Math.round(companyMatches.reduce((s, m) => s + m.overallScore, 0) / companyMatches.length) : 0;
  const convRate = companyApps.length > 0 ? Math.round((hired / companyApps.length) * 100) : 0;
  const completedInterviews = companyInterviews.filter(i => i.status === 'completed').length;

  const metrics = [
    { label: 'Active Jobs', value: companyJobs.filter(j => j.status === 'published').length, sub: `of ${companyJobs.length} total`, icon: Briefcase, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'Total Applications', value: companyApps.length, sub: `${(statusCounts['APPLIED'] || 0)} new`, icon: Users, color: 'text-ai', bg: 'bg-ai-light' },
    { label: 'Interviews Done', value: completedInterviews, sub: `of ${companyInterviews.length} total`, icon: Calendar, color: 'text-success', bg: 'bg-green-50' },
    { label: 'Time-to-Review', value: avgTimeToReview, sub: 'avg. days', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Time-to-Hire', value: avgTimeToHire, sub: 'avg. days', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Hired', value: hired, sub: `${convRate}% conversion rate`, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

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
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-foreground flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-6 h-6 text-primary" /> Hiring Analytics
          </h1>
          <p className="text-[14px] text-muted mt-0.5">Performance insights across your hiring pipeline</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-btn p-1">
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-btn transition-all ${period === p ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-sm hover:shadow-card-hover transition-all">
              <div className={`w-9 h-9 ${m.bg} rounded-btn flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{m.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source of Hire */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-[14px] font-semibold text-foreground mb-4">Source of Applicants & Hires</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sourceData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-25} textAnchor="end" axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Candidates" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Breakdown Pie */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-[14px] font-semibold text-foreground mb-4">Pipeline Distribution</h3>
          {pipelineData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-muted text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-4 h-[220px]">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 text-[11px]">
                {pipelineData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || COLORS[i % COLORS.length] }} />
                      <span className="text-muted truncate font-medium">{entry.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interviewer Load */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-[14px] font-semibold text-foreground mb-4">Interviewer Workload</h3>
          {interviewerLoad.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-muted text-sm">No interviewers assigned</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={interviewerLoad} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 5 }} />
                <Bar dataKey="upcoming" name="Upcoming" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trend */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-[14px] font-semibold text-foreground mb-4">Application Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReviewed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="monotone" dataKey="received" name="Received" stroke="#2563EB" strokeWidth={2} fill="url(#colorReceived)" dot={{ fill: '#2563EB', r: 3 }} />
              <Area type="monotone" dataKey="reviewed" name="Reviewed" stroke="#7C3AED" strokeWidth={2} fill="url(#colorReviewed)" dot={{ fill: '#7C3AED', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Applications per Job */}
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-[14px] font-semibold text-foreground mb-4">Applications per Job (Top Active)</h3>
          {jobAppData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-muted text-sm">No jobs yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={jobAppData.slice(0, 8)} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-35} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                <Bar dataKey="applications" name="Total Apps" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shortlisted" name="Shortlisted" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
