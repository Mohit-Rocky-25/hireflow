// ============================================================
// HireFlow — Candidate Interviews
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Calendar, Clock, Video, Building2, CheckCircle, UserCheck, Play } from 'lucide-react';

export function CandidateInterviews() {
  const { currentUser, interviews, jobs, companies, users } = useStore();

  if (!currentUser) return null;

  const myInterviews = interviews.filter(i => i.candidateId === currentUser.id);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">My Interviews</h1>
        <p className="text-sm text-muted">Upcoming conversations, technical assessments, and interview details.</p>
      </div>

      {myInterviews.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center">
          <Calendar className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-foreground">No interviews scheduled</p>
          <p className="text-xs text-muted mt-1">When an employer invites you to an interview round, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myInterviews.map(interview => {
            const job = jobs.find(j => j.id === interview.jobId);
            const comp = companies.find(c => c.id === interview.companyId);
            const interviewer = users.find(u => u.id === interview.interviewerId);

            return (
              <div
                key={interview.id}
                className="bg-surface rounded-card border border-border p-5 hover:shadow-card transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-primary text-xs font-semibold rounded-full">
                        {interview.stage}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        interview.status === 'completed'
                          ? 'bg-emerald-50 text-success'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {interview.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">{job?.title || 'Job Title'}</h3>
                    <p className="text-xs text-muted flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" /> {comp?.name}
                      {interviewer && (
                        <>
                          <span>•</span>
                          <UserCheck className="w-3.5 h-3.5 text-muted" /> Interviewer: {interviewer.displayName}
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="text-xs text-secondary space-y-0.5">
                      <p className="flex items-center sm:justify-end gap-1 font-semibold text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted" /> {interview.scheduledDate}
                      </p>
                      <p className="flex items-center sm:justify-end gap-1 text-muted">
                        <Clock className="w-3.5 h-3.5 text-muted" /> {interview.scheduledTime} ({interview.duration} mins)
                      </p>
                    </div>

                    {interview.status !== 'completed' && (
                      <Link
                        to={`/interview-room/${interview.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-all"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Live Room
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
