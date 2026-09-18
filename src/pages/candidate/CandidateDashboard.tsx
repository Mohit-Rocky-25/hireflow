// ============================================================
// HireFlow — Candidate Dashboard
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Briefcase, Send, Calendar, Award, ArrowRight, CheckCircle, Clock, FileText, ChevronRight } from 'lucide-react';

export function CandidateDashboard() {
  const { currentUser, applications, jobs, companies, interviews, candidateProfiles } = useStore();

  if (!currentUser) return null;

  const myApps = applications.filter(a => a.candidateId === currentUser.id);
  const myInterviews = interviews.filter(i => i.candidateId === currentUser.id);
  const profile = candidateProfiles.find(p => p.userId === currentUser.id);
  const publishedJobs = jobs.filter(j => j.status === 'published');

  const stats = [
    { label: 'Applications Sent', value: myApps.length, icon: Send, color: 'text-primary', bg: 'bg-primary-light' },
    {
      label: 'In Review / Active',
      value: myApps.filter(a => ['APPLIED', 'SCREENING', 'REVIEW', 'SHORTLISTED'].includes(a.status)).length,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Interviews Scheduled',
      value: myInterviews.filter(i => i.status === 'scheduled').length,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Offers Received',
      value: myApps.filter(a => a.status === 'OFFER' || a.status === 'HIRED').length,
      icon: Award,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  const completion = profile?.profileCompletion || 65;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-card text-white p-6 md:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {currentUser.displayName}!</h1>
          <p className="text-blue-100 text-sm mt-1">
            Track your applications, interview invites, and discover high-match opportunities.
          </p>
        </div>
        <Link
          to="/candidate/jobs"
          className="px-5 py-2.5 bg-white text-primary font-semibold text-sm rounded-btn hover:bg-blue-50 transition-all shadow-sm shrink-0"
        >
          Explore New Jobs
        </Link>
      </div>

      {/* Profile Completion Alert */}
      {completion < 100 && (
        <div className="bg-surface border border-border rounded-card p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ai/10 flex items-center justify-center text-ai font-bold text-sm shrink-0">
              {completion}%
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Complete your candidate profile</p>
              <p className="text-xs text-muted">Upload your latest resume to enhance your AI matching score.</p>
            </div>
          </div>
          <Link
            to="/candidate/resume"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            Update Resume <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted">{stat.label}</span>
                <div className={`p-2 rounded-btn ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Active Applications
            </h2>
            <Link to="/candidate/applications" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View all ({myApps.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myApps.length === 0 ? (
            <div className="bg-surface rounded-card border border-border p-8 text-center">
              <Briefcase className="w-8 h-8 text-muted mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">No applications submitted yet</p>
              <p className="text-xs text-muted mt-1">Start browsing open roles to submit your first application.</p>
              <Link to="/candidate/jobs" className="mt-4 inline-block px-4 py-2 bg-primary text-white text-xs font-medium rounded-btn">
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myApps.slice(0, 4).map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                const comp = companies.find(c => c.id === app.companyId);
                return (
                  <Link
                    key={app.id}
                    to={`/candidate/applications/${app.id}`}
                    className="block bg-surface rounded-card border border-border p-4 hover:border-primary/40 hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{job?.title || 'Unknown Position'}</p>
                        <p className="text-xs text-muted mt-0.5">{comp?.name} • Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        app.status === 'HIRED' || app.status === 'OFFER' ? 'bg-emerald-50 text-emerald-700' :
                        app.status === 'SHORTLISTED' || app.status === 'INTERVIEW' ? 'bg-primary-light text-primary' :
                        app.status === 'REJECTED' ? 'bg-red-50 text-danger' :
                        'bg-gray-100 text-secondary'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Upcoming Interviews
              </h3>
              <Link to="/candidate/interviews" className="text-xs text-primary hover:underline">
                View All
              </Link>
            </div>

            {myInterviews.length === 0 ? (
              <p className="text-xs text-muted text-center py-6">No scheduled interviews at this time.</p>
            ) : (
              <div className="space-y-2">
                {myInterviews.slice(0, 3).map(iv => {
                  const job = jobs.find(j => j.id === iv.jobId);
                  return (
                    <div key={iv.id} className="p-3 bg-gray-50 border border-border rounded-btn text-xs space-y-1">
                      <p className="font-semibold text-foreground">{job?.title}</p>
                      <p className="text-muted">📅 {iv.scheduledDate} at {iv.scheduledTime} ({iv.duration}m)</p>
                      <p className="text-primary font-medium">{iv.stage}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-surface rounded-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Featured Openings</h3>
            <div className="space-y-2.5">
              {publishedJobs.slice(0, 3).map(job => {
                const comp = companies.find(c => c.id === job.companyId);
                return (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block p-3 rounded-btn border border-border hover:border-primary/30 transition-all"
                  >
                    <p className="text-xs font-bold text-foreground">{job.title}</p>
                    <p className="text-[11px] text-muted">{comp?.name} • {job.location} ({job.workMode})</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
