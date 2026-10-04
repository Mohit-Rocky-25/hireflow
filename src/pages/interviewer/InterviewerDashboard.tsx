// HireFlow — Interviewer Dashboard
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Calendar, Clock, CheckCircle, ArrowRight, ClipboardList } from 'lucide-react';

export function InterviewerDashboard() {
  const { currentUser, interviews, jobs, users } = useStore();
  if (!currentUser) return null;

  const myInterviews = interviews.filter(i => i.interviewerId === currentUser.id);
  const scheduled = myInterviews.filter(i => i.status === 'scheduled');
  const completed = myInterviews.filter(i => i.status === 'completed');
  const pendingFeedback = myInterviews.filter(i => i.status === 'scheduled' || (i.status === 'completed' && !i.feedback));

  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{greeting()}, {currentUser.displayName}</h1>
        <p className="text-sm text-muted mt-1">Your interview workspace</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Scheduled', value: scheduled.length, icon: <Calendar className="w-5 h-5" />, color: 'text-primary bg-primary-light' },
          { label: 'Pending Feedback', value: pendingFeedback.length, icon: <ClipboardList className="w-5 h-5" />, color: 'text-warning bg-amber-50' },
          { label: 'Completed', value: completed.length, icon: <CheckCircle className="w-5 h-5" />, color: 'text-success bg-green-50' },
          { label: 'Total', value: myInterviews.length, icon: <Clock className="w-5 h-5" />, color: 'text-muted bg-gray-100' },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface rounded-card border border-border p-5">
            <div className={`w-10 h-10 rounded-btn ${kpi.color} flex items-center justify-center mb-3`}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-card border border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">My Interviews</h2>
          <Link to="/interviewer/interviews" className="text-xs text-primary font-medium">View all</Link>
        </div>
        {scheduled.length === 0 ? (
          <div className="px-5 py-8 text-center"><Calendar className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" /><p className="text-sm text-muted">No interviews scheduled</p></div>
        ) : (
          <div className="divide-y divide-border">
            {scheduled.map(interview => {
              const job = jobs.find(j => j.id === interview.jobId);
              const candidate = users.find(u => u.id === interview.candidateId);
              return (
                <Link key={interview.id} to={`/interviewer/interviews/${interview.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="text-sm font-medium text-foreground">{candidate?.displayName || 'Candidate'}</p>
                    <p className="text-xs text-muted">{job?.title} • {interview.stage} • {interview.scheduledDate} at {interview.scheduledTime}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
