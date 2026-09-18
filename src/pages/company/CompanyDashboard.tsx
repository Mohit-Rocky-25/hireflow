// ============================================================
// HireFlow — Company / BHR Dashboard
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  Briefcase, Users, ClipboardList, Calendar, Plus,
  TrendingUp, ArrowRight, Eye, Brain, Clock
} from 'lucide-react';

export function CompanyDashboard() {
  const { currentUser, currentCompanyId, jobs, applications, interviews, candidateMatches, companies } = useStore();
  
  if (!currentUser || !currentCompanyId) return null;
  
  const company = companies.find(c => c.id === currentCompanyId);
  const companyJobs = jobs.filter(j => j.companyId === currentCompanyId);
  const activeJobs = companyJobs.filter(j => j.status === 'published');
  const companyApps = applications.filter(a => a.companyId === currentCompanyId);
  const needsReview = companyApps.filter(a => ['APPLIED', 'SCREENING', 'REVIEW'].includes(a.status));
  const todayInterviews = interviews.filter(i => i.companyId === currentCompanyId && i.scheduledDate === new Date().toISOString().split('T')[0]);
  const shortlisted = companyApps.filter(a => a.status === 'SHORTLISTED');

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const recentApps = companyApps
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const upcomingInterviews = interviews
    .filter(i => i.companyId === currentCompanyId && i.status === 'scheduled')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting()}, {currentUser.displayName}</h1>
          <p className="text-sm text-secondary mt-1">Manage your company's hiring pipeline{company ? ` — ${company.name}` : ''}</p>
        </div>
        <Link
          to="/company/jobs/new"
          className="px-5 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Jobs', value: activeJobs.length, icon: <Briefcase className="w-5 h-5" />, color: 'text-primary bg-primary-light', link: '/company/jobs' },
          { label: 'Total Applications', value: companyApps.length, icon: <ClipboardList className="w-5 h-5" />, color: 'text-ai bg-ai-light', link: '/company/candidates' },
          { label: 'Needs Review', value: needsReview.length, icon: <Eye className="w-5 h-5" />, color: 'text-warning bg-amber-50', link: '/company/candidates' },
          { label: 'Interviews Today', value: todayInterviews.length, icon: <Calendar className="w-5 h-5" />, color: 'text-success bg-green-50', link: '/company/interviewers' },
        ].map((kpi, i) => (
          <Link key={i} to={kpi.link} className="bg-surface rounded-card border border-border p-5 hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-btn ${kpi.color} flex items-center justify-center`}>
                {kpi.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted mt-1">{kpi.label}</p>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Applications</h2>
            <Link to="/company/candidates" className="text-xs text-primary font-medium hover:text-primary-hover">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentApps.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <ClipboardList className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted">No applications yet</p>
                <p className="text-xs text-muted mt-1">Once candidates apply, they will appear here</p>
              </div>
            ) : recentApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              const match = candidateMatches.find(m => m.applicationId === app.id);
              return (
                <Link key={app.id} to={`/company/candidates/${app.candidateId}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{app.id}</p>
                    <p className="text-xs text-muted">{job?.title || 'Job'} • {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {match && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${match.overallScore >= 80 ? 'bg-green-50 text-success' : match.overallScore >= 60 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-danger'}`}>
                        {match.overallScore}%
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      app.status === 'SHORTLISTED' ? 'bg-green-50 text-success' :
                      app.status === 'INTERVIEW' ? 'bg-primary-light text-primary' :
                      app.status === 'REJECTED' ? 'bg-red-50 text-danger' :
                      'bg-gray-100 text-muted'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Upcoming Interviews</h2>
            <Link to="/company/interviewers" className="text-xs text-primary font-medium hover:text-primary-hover">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingInterviews.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Calendar className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
                <p className="text-sm text-muted">No interviews scheduled</p>
                <p className="text-xs text-muted mt-1">Shortlist a candidate to schedule an interview</p>
              </div>
            ) : upcomingInterviews.map(interview => {
              const job = jobs.find(j => j.id === interview.jobId);
              return (
                <div key={interview.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{interview.stage}</p>
                    <p className="text-xs text-muted">{job?.title} • {interview.scheduledDate} at {interview.scheduledTime}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">{interview.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {candidateMatches.length > 0 && (
        <div className="bg-ai-light rounded-card border border-ai/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-ai" />
            <h2 className="text-sm font-semibold text-foreground">AI Screening Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-btn p-3 border border-ai/10">
              <p className="text-2xl font-bold text-foreground">{candidateMatches.length}</p>
              <p className="text-xs text-muted">Candidates Analyzed</p>
            </div>
            <div className="bg-surface rounded-btn p-3 border border-ai/10">
              <p className="text-2xl font-bold text-success">{candidateMatches.filter(m => m.overallScore >= 80).length}</p>
              <p className="text-xs text-muted">High Match (80%+)</p>
            </div>
            <div className="bg-surface rounded-btn p-3 border border-ai/10">
              <p className="text-2xl font-bold text-foreground">{Math.round(candidateMatches.reduce((s, m) => s + m.overallScore, 0) / candidateMatches.length)}%</p>
              <p className="text-xs text-muted">Avg Match Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
