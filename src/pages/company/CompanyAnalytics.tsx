// HireFlow — Company Analytics
import { useStore } from '../../store/useStore';
import { BarChart3, Briefcase, Users, Calendar, TrendingUp } from 'lucide-react';

export function CompanyAnalytics() {
  const { currentCompanyId, jobs, applications, interviews, candidateMatches } = useStore();
  const companyJobs = jobs.filter(j => j.companyId === currentCompanyId);
  const companyApps = applications.filter(a => a.companyId === currentCompanyId);
  const companyInterviews = interviews.filter(i => i.companyId === currentCompanyId);

  const statusCounts: Record<string, number> = {};
  companyApps.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

  const metrics = [
    { label: 'Active Jobs', value: companyJobs.filter(j => j.status === 'published').length, icon: <Briefcase className="w-5 h-5" />, color: 'text-primary bg-primary-light' },
    { label: 'Total Applications', value: companyApps.length, icon: <Users className="w-5 h-5" />, color: 'text-ai bg-ai-light' },
    { label: 'Interviews', value: companyInterviews.length, icon: <Calendar className="w-5 h-5" />, color: 'text-success bg-green-50' },
    { label: 'Hired', value: statusCounts['HIRED'] || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'text-warning bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-surface rounded-card border border-border p-5">
            <div className={`w-10 h-10 rounded-btn ${m.color} flex items-center justify-center mb-3`}>{m.icon}</div>
            <p className="text-2xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Overview</h3>
          {companyApps.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">Not enough data yet</p>
          ) : (
            <div className="space-y-3">
              {['APPLIED','SCREENING','REVIEW','SHORTLISTED','INTERVIEW','FINAL_REVIEW','OFFER','HIRED','REJECTED'].map(status => {
                const count = statusCounts[status] || 0;
                const pct = companyApps.length > 0 ? (count / companyApps.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-24 shrink-0">{status}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Applications per Job</h3>
          {companyJobs.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">Not enough data yet</p>
          ) : (
            <div className="space-y-3">
              {companyJobs.map(job => {
                const count = companyApps.filter(a => a.jobId === job.id).length;
                const maxApps = Math.max(...companyJobs.map(j => companyApps.filter(a => a.jobId === j.id).length), 1);
                return (
                  <div key={job.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-32 shrink-0 truncate">{job.title}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-ai rounded-full transition-all" style={{ width: `${(count / maxApps) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
