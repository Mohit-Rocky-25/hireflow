// ============================================================
// HireFlow — Enhanced Interviewer Dashboard
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Calendar, Clock, CheckCircle, ArrowRight, ClipboardList,
  Star, User, AlertCircle, Video, Briefcase
} from 'lucide-react';

export function InterviewerDashboard() {
  const { currentUser, interviews, jobs, users, companies } = useStore();
  if (!currentUser) return null;

  const myInterviews = interviews.filter(i => i.interviewerId === currentUser.id);
  const scheduled = myInterviews.filter(i => i.status === 'scheduled');
  const completed = myInterviews.filter(i => i.status === 'completed');
  const withFeedback = completed.filter(i => i.feedback);
  const pendingFeedback = completed.filter(i => !i.feedback);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  // Today's interviews
  const today = new Date().toISOString().split('T')[0];
  const todayInterviews = scheduled.filter(i => i.scheduledDate === today);

  // Average rating given
  const avgRating = withFeedback.length > 0
    ? ((withFeedback.reduce((sum, i) => {
        const f = i.feedback!;
        return sum + (f.technicalKnowledge + f.problemSolving + f.communication + f.roleSpecific) / 4;
      }, 0)) / withFeedback.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-card text-white p-6 md:p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting()}, {currentUser.displayName}</h1>
          <p className="text-purple-100 text-sm mt-1">
            {todayInterviews.length > 0
              ? `You have ${todayInterviews.length} interview${todayInterviews.length > 1 ? 's' : ''} today`
              : 'No interviews today — enjoy your day!'}
          </p>
        </div>
        <Link
          to="/interviewer/interviews"
          className="px-5 py-2.5 bg-white text-purple-700 font-semibold text-sm rounded-btn hover:bg-purple-50 transition-all shadow-sm shrink-0"
        >
          View All Interviews
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Today', value: todayInterviews.length, icon: Calendar, color: 'text-primary bg-primary-light' },
          { label: 'Scheduled', value: scheduled.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Awaiting Feedback', value: pendingFeedback.length, icon: ClipboardList, color: 'text-danger bg-red-50' },
          { label: 'Completed', value: withFeedback.length, icon: CheckCircle, color: 'text-success bg-green-50' },
          { label: 'Avg Rating Given', value: avgRating, icon: Star, color: 'text-ai bg-ai-light' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-sm card-lift">
              <div className={`w-9 h-9 rounded-btn ${kpi.color.split(' ')[1]} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${kpi.color.split(' ')[0]}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Feedback Alert */}
      {pendingFeedback.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-card">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{pendingFeedback.length} interview{pendingFeedback.length > 1 ? 's' : ''} awaiting your feedback</p>
            <p className="text-xs text-amber-700 mt-0.5">Submit your evaluation to help the hiring team make a decision.</p>
          </div>
          <Link
            to="/interviewer/interviews"
            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-btn hover:bg-amber-700 transition-colors shrink-0"
          >
            Submit Feedback
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Interviews */}
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" /> Today's Sessions
            </h2>
            {todayInterviews.length > 0 && (
              <span className="px-2 py-0.5 bg-primary-light text-primary text-xs font-bold rounded-full pulse-ring">
                {todayInterviews.length} live
              </span>
            )}
          </div>
          {todayInterviews.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Calendar className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted">No sessions today</p>
              <p className="text-xs text-muted mt-1">Enjoy your free day!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {todayInterviews.map(interview => {
                const job = jobs.find(j => j.id === interview.jobId);
                const candidate = users.find(u => u.id === interview.candidateId);
                return (
                  <Link
                    key={interview.id}
                    to={`/interviewer/interviews/${interview.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{candidate?.displayName || 'Candidate'}</p>
                      <p className="text-xs text-muted">{job?.title} • {interview.stage} • {interview.scheduledTime} ({interview.duration}m)</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted" /> Upcoming Sessions
            </h2>
            <Link to="/interviewer/interviews" className="text-xs text-primary font-medium hover:text-primary-hover">View all</Link>
          </div>
          {scheduled.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Calendar className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted">No upcoming interviews</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {scheduled.slice(0, 5).map(interview => {
                const job = jobs.find(j => j.id === interview.jobId);
                const candidate = users.find(u => u.id === interview.candidateId);
                return (
                  <Link
                    key={interview.id}
                    to={`/interviewer/interviews/${interview.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-muted text-sm font-bold shrink-0">
                      {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{candidate?.displayName || 'Candidate'}</p>
                      <p className="text-xs text-muted">{job?.title} • {interview.stage}</p>
                      <p className="text-xs text-muted">📅 {interview.scheduledDate} at {interview.scheduledTime}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Feedback Submitted */}
      {withFeedback.length > 0 && (
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" /> Recent Evaluations
            </h2>
          </div>
          <div className="divide-y divide-border">
            {withFeedback.slice(0, 3).map(iv => {
              const f = iv.feedback!;
              const avg = ((f.technicalKnowledge + f.problemSolving + f.communication + f.roleSpecific) / 4).toFixed(1);
              const job = jobs.find(j => j.id === iv.jobId);
              const candidate = users.find(u => u.id === iv.candidateId);
              return (
                <div key={iv.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-success text-xs font-bold shrink-0">
                      {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{candidate?.displayName || 'Candidate'}</p>
                      <p className="text-xs text-muted">{job?.title} • {iv.stage} • {iv.scheduledDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      f.recommendation === 'strong_hire' ? 'bg-green-50 text-success' :
                      f.recommendation === 'hire' ? 'bg-blue-50 text-primary' :
                      f.recommendation === 'no_hire' ? 'bg-red-50 text-danger' :
                      'bg-gray-100 text-muted'
                    }`}>
                      {f.recommendation.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-foreground">{avg}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
