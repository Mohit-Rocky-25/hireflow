import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Briefcase, Send, Calendar, Award, ArrowRight, CheckCircle2, Clock, FileText, ChevronRight, Brain, AlertCircle, ShieldCheck, Share2, Eye } from 'lucide-react';
import type { ApplicationStatus } from '../../types';
import { useProfile } from '../../features/suite/profile/ProfileContext';

export function CandidateDashboard() {
  const { currentUser, applications, jobs, companies, interviews, candidateProfiles, candidateMatches } = useStore();
  const { profile: suiteProfile, hasProfile } = useProfile();

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

  const hasResume = !!profile?.resumeFileName;
  const hasHeadline = !!profile?.headline;
  const hasSkills = !!(profile?.skills && profile.skills.length > 0);
  let completion = 20; // base for creating account
  const missingFields = [];
  if (hasResume) completion += 40; else missingFields.push("Upload Resume");
  if (hasHeadline) completion += 10; else missingFields.push("Add Headline");
  if (hasSkills) completion += 30; else missingFields.push("Add/Parse Skills");

  const pipelineStages: ApplicationStatus[] = ['APPLIED', 'SCREENING', 'REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFER'];

  const getMatchScore = (jobId: string) => {
    const match = candidateMatches.find(m => m.jobId === jobId);
    if (match) return match.overallScore;
    return Math.min(99, 45 + (jobId.length * 7) % 55); 
  };

  const recommendedJobs = publishedJobs
    .map(j => ({ job: j, score: getMatchScore(j.id) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

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
        <div className="bg-surface border border-border rounded-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#2563EB" strokeWidth="12"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * completion) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-primary leading-none">{completion}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Complete your candidate profile</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {missingFields.map(f => (
                  <span key={f} className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium">
                    <AlertCircle className="w-3 h-3" /> Missing: {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link
            to="/candidate/resume"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            Update Profile <ChevronRight className="w-3.5 h-3.5" />
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

      {/* Verifiable Evidence Card Banner */}
      <div className="bg-surface border border-border hover:border-primary/40 rounded-2xl p-5 shadow-xs transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">Verifiable Evidence Card</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  SHA-256 Verified
                </span>
              </div>
              <p className="text-xs text-muted mt-1 max-w-xl">
                Stand out from inflated resumes. Package your Level 0–4 audited skills, verbatim metrics, and repo proofs into a tamper-evident card recruiters trust.
              </p>
              {hasProfile && suiteProfile && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] font-medium text-muted">
                    Profile loaded: <strong className="text-foreground">{suiteProfile.skills.length} skills analyzed</strong>
                  </span>
                  <span className="text-border">•</span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {suiteProfile.skills.filter(s => s.evidenceLevel >= 3).length} high-evidence proofs (L3/L4)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <Link
              to="/tools/evidence-card"
              className="px-4 py-2 bg-gradient-to-r from-primary to-ai text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Build Evidence Card
            </Link>
            <Link
              to="/card"
              className="px-3.5 py-2 bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-foreground rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Viewer
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Applications */}
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
            <div className="space-y-4">
              {myApps.slice(0, 3).map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                const comp = companies.find(c => c.id === app.companyId);
                const currentIdx = pipelineStages.indexOf(app.status);

                return (
                  <Link
                    key={app.id}
                    to={`/candidate/applications/${app.id}`}
                    className="block bg-surface rounded-card border border-border p-5 hover:border-primary/40 hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[15px] font-bold text-foreground">{job?.title || 'Unknown Position'}</p>
                        <p className="text-[12px] text-muted mt-0.5">{comp?.name} • Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                        app.status === 'HIRED' || app.status === 'OFFER' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        app.status === 'REJECTED' ? 'bg-rose-50 text-danger border-rose-200' :
                        'bg-blue-50 text-primary border-blue-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {app.status !== 'REJECTED' && (
                      <div className="relative pt-4 px-2">
                        <div className="absolute left-2 right-2 top-6 h-0.5 bg-gray-100 z-0" />
                        <div className="relative z-10 flex justify-between">
                          {pipelineStages.map((stage, idx) => {
                            const isPassed = currentIdx >= idx;
                            const isCurrent = app.status === stage;
                            return (
                              <div key={stage} className="flex flex-col items-center gap-2">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                  isCurrent ? 'bg-primary ring-4 ring-primary/20 text-white' :
                                  isPassed ? 'bg-emerald-500 text-white' : 'bg-gray-200 border border-gray-300'
                                }`}>
                                  {isPassed && !isCurrent && <CheckCircle2 className="w-3 h-3" />}
                                </div>
                                <span className={`text-[9px] font-bold ${isCurrent ? 'text-primary' : 'text-muted'}`}>{stage.substring(0,4)}...</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews & Recommended Jobs */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Upcoming Interviews
              </h3>
              <Link to="/candidate/interviews" className="text-[11px] font-bold text-primary hover:underline">
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
                    <div key={iv.id} className="p-3 bg-surface-2 border border-border rounded-btn text-xs space-y-1">
                      <p className="font-bold text-foreground">{job?.title}</p>
                      <p className="text-muted">📅 {iv.scheduledDate} at {iv.scheduledTime} ({iv.duration}m)</p>
                      <p className="text-primary font-medium">{iv.stage}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-surface rounded-card border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-ai" /> Recommended For You
            </h3>
            <div className="space-y-3">
              {recommendedJobs.map(({job, score}) => {
                const comp = companies.find(c => c.id === job.companyId);
                return (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="block p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-surface-2 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${score >= 80 ? 'bg-ai-light/50 text-ai' : score >= 60 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>
                        {score}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-muted">{comp?.name} • {job.location}</p>
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
