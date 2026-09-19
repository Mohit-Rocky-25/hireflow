// ============================================================
// HireFlow — Enhanced Company Interviewers Management
// ============================================================
import { useStore } from '../../store/useStore';
import { Link } from 'react-router-dom';
import {
  UserCheck, Calendar, Star, Clock, Mail, CheckCircle,
  Award, BarChart3, Users, ArrowRight
} from 'lucide-react';

export function CompanyInterviewers() {
  const { currentCompanyId, companyMembers, users, interviews, jobs } = useStore();
  const interviewers = companyMembers.filter(m => m.companyId === currentCompanyId && m.role === 'INTERVIEWER');

  const totalInterviews = interviews.filter(i => i.companyId === currentCompanyId);
  const totalScheduled = totalInterviews.filter(i => i.status === 'scheduled').length;
  const totalCompleted = totalInterviews.filter(i => i.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" /> Interview Panel
          </h1>
          <p className="text-sm text-muted mt-0.5">{interviewers.length} interviewer{interviewers.length !== 1 ? 's' : ''} on your panel</p>
        </div>
        <Link
          to="/company/team"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Manage Team <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Panel Members', value: interviewers.length, icon: Users, color: 'text-primary bg-primary-light' },
          { label: 'Scheduled', value: totalScheduled, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed', value: totalCompleted, icon: CheckCircle, color: 'text-success bg-green-50' },
          { label: 'Total Sessions', value: totalInterviews.length, icon: BarChart3, color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-btn ${s.color.split(' ')[1]} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Interviewer Cards */}
      {interviewers.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center">
          <UserCheck className="w-12 h-12 text-muted mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium text-foreground">No interviewers on your panel</p>
          <p className="text-sm text-muted mt-1">Add interviewers from the Company Team page to start scheduling interviews.</p>
          <Link
            to="/company/team"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all"
          >
            <Users className="w-4 h-4" /> Go to Team
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviewers.map(mem => {
            const user = users.find(u => u.id === mem.userId);
            const userInterviews = interviews.filter(i => i.interviewerId === mem.userId && i.companyId === currentCompanyId);
            const pending = userInterviews.filter(i => i.status === 'scheduled');
            const completed = userInterviews.filter(i => i.status === 'completed');
            const withFeedback = completed.filter(i => i.feedback);

            // Calculate average rating
            const avgRating = withFeedback.length > 0
              ? ((withFeedback.reduce((sum, i) => {
                  const f = i.feedback!;
                  return sum + (f.technicalKnowledge + f.problemSolving + f.communication + f.roleSpecific) / 4;
                }, 0)) / withFeedback.length).toFixed(1)
              : '—';

            // Unique jobs they've interviewed for
            const uniqueJobs = [...new Set(userInterviews.map(i => i.jobId))];
            const jobNames = uniqueJobs.map(jId => jobs.find(j => j.id === jId)?.title).filter(Boolean).slice(0, 3);

            const initials = user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';

            return (
              <div key={mem.id} className="bg-surface rounded-card border border-border p-5 hover:shadow-card-hover transition-all card-lift">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{user?.displayName || 'Interviewer'}</p>
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {user?.email}
                    </p>
                  </div>
                  {withFeedback.length >= 3 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full shrink-0">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700">Top</span>
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-2 bg-gray-50 rounded-btn">
                    <p className="text-sm font-bold text-foreground">{pending.length}</p>
                    <p className="text-[10px] text-muted flex items-center justify-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> Scheduled
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-btn">
                    <p className="text-sm font-bold text-foreground">{completed.length}</p>
                    <p className="text-[10px] text-muted flex items-center justify-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Done
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-btn">
                    <p className="text-sm font-bold text-foreground">{avgRating}</p>
                    <p className="text-[10px] text-muted flex items-center justify-center gap-0.5">
                      <Star className="w-2.5 h-2.5" /> Avg Rating
                    </p>
                  </div>
                </div>

                {/* Recent jobs */}
                {jobNames.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {jobNames.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 text-[10px] bg-primary-light text-primary font-medium rounded-full">
                        {name}
                      </span>
                    ))}
                    {uniqueJobs.length > 3 && (
                      <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-muted rounded-full">
                        +{uniqueJobs.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Feedback bar */}
                {completed.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                      <span>Feedback submitted</span>
                      <span className="font-bold">{withFeedback.length}/{completed.length}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${completed.length > 0 ? (withFeedback.length / completed.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
