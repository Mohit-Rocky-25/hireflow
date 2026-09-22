// ============================================================
// HireFlow v2 — Company / BHR Dashboard
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  Briefcase, Users, ClipboardList, Calendar, Plus,
  ArrowRight, Eye, Brain
} from 'lucide-react';
import { Button, Card, StatCard, Badge, EmptyState } from '../../components/ui/Components';

export function CompanyDashboard() {
  const { currentUser, currentCompanyId, jobs, applications, interviews, candidateMatches, companies } = useStore();
  
  if (!currentUser || !currentCompanyId) return null;
  
  const company = companies.find(c => c.id === currentCompanyId);
  const companyJobs = jobs.filter(j => j.companyId === currentCompanyId);
  const activeJobs = companyJobs.filter(j => j.status === 'published');
  const companyApps = applications.filter(a => a.companyId === currentCompanyId);
  const needsReview = companyApps.filter(a => ['APPLIED', 'SCREENING', 'REVIEW'].includes(a.status));
  const todayInterviews = interviews.filter(i => i.companyId === currentCompanyId && i.scheduledDate === new Date().toISOString().split('T')[0]);

  const recentApps = companyApps
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const upcomingInterviews = interviews
    .filter(i => i.companyId === currentCompanyId && i.status === 'scheduled')
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, 5);

  return (
    <div className="space-y-[32px] page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-[-0.01em]">Overview</h1>
          <p className="text-[14px] text-text-secondary mt-[4px]">Manage your hiring pipeline{company ? ` — ${company.name}` : ''}</p>
        </div>
        <Link to="/company/jobs/new">
          <Button variant="primary">
            <Plus className="w-[16px] h-[16px] stroke-[2px]" /> Create Job
          </Button>
        </Link>
      </div>

      {/* KPI Row (§7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px] stagger-in">
        <Link to="/company/jobs" className="block outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
          <StatCard
            label="Active Jobs"
            value={activeJobs.length}
            icon={<Briefcase className="w-[20px] h-[20px]" />}
          />
        </Link>
        <Link to="/company/candidates" className="block outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
          <StatCard
            label="Total Applications"
            value={companyApps.length}
            icon={<ClipboardList className="w-[20px] h-[20px]" />}
          />
        </Link>
        <Link to="/company/candidates?filter=review" className="block outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
          <StatCard
            label="Needs Review"
            value={needsReview.length}
            icon={<Eye className="w-[20px] h-[20px]" />}
            trend={needsReview.length > 0 ? "Requires attention" : "All caught up"}
            trendUp={needsReview.length === 0}
          />
        </Link>
        <Link to="/company/interviewers" className="block outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
          <StatCard
            label="Interviews Today"
            value={todayInterviews.length}
            icon={<Calendar className="w-[20px] h-[20px]" />}
          />
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        {/* Recent Applications */}
        <Card className="flex flex-col p-0 overflow-hidden">
          <div className="px-[20px] py-[16px] border-b border-border flex items-center justify-between bg-surface-2">
            <h2 className="text-[14px] font-semibold text-text">Recent Applications</h2>
            <Link to="/company/candidates" className="text-[13px] text-text-secondary font-medium hover:text-text transition-colors duration-[120ms]">View all</Link>
          </div>
          <div className="flex-1 divide-y divide-border">
            {recentApps.length === 0 ? (
              <EmptyState 
                icon={<Users className="w-[32px] h-[32px]" />}
                title="No applications yet"
                description="Once candidates apply, they will appear here"
              />
            ) : recentApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              const match = candidateMatches.find(m => m.applicationId === app.id);
              return (
                <Link key={app.id} to={`/company/candidates/${app.candidateId}`} className="flex items-center justify-between px-[20px] py-[16px] hover:bg-surface-2 transition-colors duration-[120ms] group outline-none focus-visible:bg-surface-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-text truncate group-hover:text-primary transition-colors">{app.id}</p>
                    <p className="text-[13px] text-text-secondary mt-[2px]">{job?.title || 'Job'} • {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-[12px] shrink-0">
                    {match && (
                      <Badge variant={match.overallScore >= 80 ? 'success' : match.overallScore >= 60 ? 'warning' : 'danger'}>
                        {match.overallScore}% Match
                      </Badge>
                    )}
                    <Badge variant={
                      app.status === 'SHORTLISTED' ? 'success' :
                      app.status === 'INTERVIEW' ? 'primary' :
                      app.status === 'REJECTED' ? 'danger' :
                      'default'
                    }>
                      {app.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="flex flex-col p-0 overflow-hidden">
          <div className="px-[20px] py-[16px] border-b border-border flex items-center justify-between bg-surface-2">
            <h2 className="text-[14px] font-semibold text-text">Upcoming Interviews</h2>
            <Link to="/company/interviewers" className="text-[13px] text-text-secondary font-medium hover:text-text transition-colors duration-[120ms]">View all</Link>
          </div>
          <div className="flex-1 divide-y divide-border">
            {upcomingInterviews.length === 0 ? (
              <EmptyState 
                icon={<Calendar className="w-[32px] h-[32px]" />}
                title="No interviews scheduled"
                description="Shortlist a candidate to schedule an interview"
              />
            ) : upcomingInterviews.map(interview => {
              const job = jobs.find(j => j.id === interview.jobId);
              return (
                <div key={interview.id} className="px-[20px] py-[16px] flex items-center justify-between hover:bg-surface-2 transition-colors duration-[120ms]">
                  <div>
                    <p className="text-[14px] font-medium text-text">{interview.stage}</p>
                    <p className="text-[13px] text-text-secondary mt-[2px]">{job?.title} • {interview.scheduledDate} at {interview.scheduledTime}</p>
                  </div>
                  <Badge variant="primary">{interview.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      {candidateMatches.length > 0 && (
        <Card className="bg-ai-light/30 border-ai/20">
          <div className="flex items-center gap-[8px] mb-[16px]">
            <Brain className="w-[20px] h-[20px] text-ai stroke-[1.5px]" />
            <h2 className="text-[14px] font-semibold text-text">AI Screening Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
            <div className="bg-surface rounded-md p-[16px] border border-border">
              <p className="text-[24px] font-bold text-text leading-none mb-[4px]">{candidateMatches.length}</p>
              <p className="text-[12px] text-text-secondary">Candidates Analyzed</p>
            </div>
            <div className="bg-surface rounded-md p-[16px] border border-border">
              <p className="text-[24px] font-bold text-success leading-none mb-[4px]">{candidateMatches.filter(m => m.overallScore >= 80).length}</p>
              <p className="text-[12px] text-text-secondary">High Match (80%+)</p>
            </div>
            <div className="bg-surface rounded-md p-[16px] border border-border">
              <p className="text-[24px] font-bold text-text leading-none mb-[4px]">{Math.round(candidateMatches.reduce((s, m) => s + m.overallScore, 0) / candidateMatches.length)}%</p>
              <p className="text-[12px] text-text-secondary">Avg Match Score</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
