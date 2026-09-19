// HireFlow — Interviewer Interviews List
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Calendar, ArrowRight, CheckCircle } from 'lucide-react';

export function InterviewerInterviews() {
  const { currentUser, interviews, jobs, users } = useStore();
  if (!currentUser) return null;
  const myInterviews = interviews.filter(i => i.interviewerId === currentUser.id).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">My Interviews</h1>
      {myInterviews.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center"><Calendar className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" /><p className="text-sm text-muted">No interviews assigned</p></div>
      ) : (
        <div className="space-y-3">
          {myInterviews.map(interview => {
            const job = jobs.find(j => j.id === interview.jobId);
            const candidate = users.find(u => u.id === interview.candidateId);
            return (
              <Link key={interview.id} to={`/interviewer/interviews/${interview.id}`} className="block bg-surface rounded-card border border-border p-5 hover:border-primary/30 hover:shadow-card-hover transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{candidate?.displayName || 'Candidate'}</p>
                    <p className="text-sm text-muted mt-1">{job?.title} • {interview.stage}</p>
                    <p className="text-xs text-muted mt-1">📅 {interview.scheduledDate} at {interview.scheduledTime} ({interview.duration}min)</p>
                  </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/interview-room/${interview.id}`}
                        onClick={e => e.stopPropagation()}
                        className="px-3 py-1.5 bg-primary-light hover:bg-primary text-primary hover:text-white text-xs font-semibold rounded-btn transition-colors"
                      >
                        Join Studio
                      </Link>
                      <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
