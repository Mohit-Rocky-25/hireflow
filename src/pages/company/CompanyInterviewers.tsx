import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { UserCheck, Calendar, Clock, Video, FileText, CheckCircle2, ChevronRight, Award, Brain, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CompanyInterviewers() {
  const { currentCompanyId, companyMembers, users, interviews, applications, jobs, candidateMatches } = useStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'team'>('upcoming');

  const interviewers = companyMembers.filter(m => m.companyId === currentCompanyId && m.role === 'INTERVIEWER');
  
  // For the sake of the demo, assume the logged-in user is an interviewer, or just show all interviews if HR.
  // We'll show a combined "Workspace" view.
  const allCompanyInterviews = interviews.filter(i => i.companyId === currentCompanyId);
  const upcoming = allCompanyInterviews.filter(i => i.status === 'scheduled');
  const completed = allCompanyInterviews.filter(i => i.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 tracking-tight">
            <Video className="w-6 h-6 text-primary" /> Interviewer Workspace
          </h1>
          <p className="text-sm text-muted mt-1">Manage your schedule, submit scorecards, and review AI candidate intel.</p>
        </div>
        <div className="flex bg-surface-2 p-1 rounded-lg border border-border">
          <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'upcoming' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-foreground'}`}>Upcoming ({upcoming.length})</button>
          <button onClick={() => setActiveTab('completed')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'completed' ? 'bg-white shadow-sm text-success' : 'text-muted hover:text-foreground'}`}>Completed ({completed.length})</button>
          <button onClick={() => setActiveTab('team')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'team' ? 'bg-white shadow-sm text-foreground' : 'text-muted hover:text-foreground'}`}>Team Load</button>
        </div>
      </div>

      {activeTab === 'upcoming' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-foreground mb-4">Your Next Interviews</h3>
            {upcoming.length === 0 ? (
              <div className="bg-surface rounded-card border border-border p-12 text-center shadow-sm">
                <Calendar className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
                <p className="text-sm text-muted">Your calendar is clear.</p>
              </div>
            ) : (
              upcoming.map(interview => {
                const app = applications.find(a => a.id === interview.applicationId);
                const candidate = users.find(u => u.id === app?.candidateId);
                const job = jobs.find(j => j.id === app?.jobId);
                const match = candidateMatches.find(m => m.applicationId === app?.id);
                const interviewer = users.find(u => u.id === interview.interviewerId);

                return (
                  <div key={interview.id} className="bg-surface rounded-card border border-border p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-bold text-foreground">{candidate?.displayName || 'Unknown Candidate'}</h4>
                          <span className="px-2 py-0.5 bg-primary-light/30 text-primary-dark text-[10px] font-bold rounded-full uppercase tracking-wider">{interview.round} Round</span>
                        </div>
                        <p className="text-xs text-muted font-medium">{job?.title}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-foreground bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          <Clock className="w-4 h-4 text-primary" /> {new Date(interview.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">{new Date(interview.scheduledAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-ai-light/20 border border-ai/10 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-ai uppercase mb-1 flex items-center gap-1"><Brain className="w-3 h-3"/> Copilot Intel</p>
                        <p className="text-[11px] text-secondary leading-relaxed">
                          Candidate has a <strong className="text-ai">{match?.overallScore || 85}% overall match</strong>. Focus questions on <strong className="text-foreground">System Design scalability</strong> as their resume lacked explicit metrics for traffic handled.
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                        <p className="text-[10px] font-bold text-muted uppercase mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3"/> Interviewer</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {interviewer?.displayName?.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-foreground">{interviewer?.displayName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                      <Link to={`/company/candidates/${candidate?.id}`} className="px-4 py-2 text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1">
                        <FileText className="w-4 h-4" /> View Resume
                      </Link>
                      <button className="px-5 py-2 bg-black-btn text-white text-xs font-bold rounded-btn hover:bg-black-hover transition-colors flex items-center gap-2 shadow-sm">
                        <Video className="w-4 h-4" /> Join Video Call
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-surface rounded-card border border-border p-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-primary"/> Interview Guide</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-xs text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" /> Start with behavioral questions (15 mins)
                </li>
                <li className="flex items-start gap-2 text-xs text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" /> Technical whiteboarding (30 mins)
                </li>
                <li className="flex items-start gap-2 text-xs text-secondary">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" /> Candidate questions (15 mins)
                </li>
              </ul>
              <button className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-btn transition-colors">Download Rubric</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="bg-warning-bg border border-warning/20 p-4 rounded-card flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-warning-dark">Pending Scorecards</h4>
              <p className="text-xs text-warning-dark/80 mt-1">You have 1 interview requiring feedback submission.</p>
            </div>
          </div>
          <div className="grid gap-4">
            {completed.map(interview => {
              const app = applications.find(a => a.id === interview.applicationId);
              const candidate = users.find(u => u.id === app?.candidateId);
              return (
                <div key={interview.id} className="bg-surface rounded-card border border-border p-5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-secondary text-sm font-semibold">
                      {candidate?.displayName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{candidate?.displayName}</p>
                      <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {new Date(interview.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-btn hover:bg-primary-hover shadow-sm transition-all">
                    Submit Scorecard
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {interviewers.map(mem => {
            const user = users.find(u => u.id === mem.userId);
            const userInterviews = interviews.filter(i => i.interviewerId === mem.userId && i.companyId === currentCompanyId);
            const pending = userInterviews.filter(i => i.status === 'scheduled');
            const done = userInterviews.filter(i => i.status === 'completed');
            const load = pending.length + done.length;

            return (
              <div key={mem.id} className="bg-surface rounded-card border border-border p-5 shadow-sm hover:shadow-card-hover transition-all relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${load > 5 ? 'bg-danger' : load > 2 ? 'bg-warning' : 'bg-success'}`} />
                <div className="flex items-center gap-4 mb-4 mt-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                    {user?.displayName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{user?.displayName}</p>
                    <p className="text-[10px] uppercase font-bold text-muted mt-0.5 tracking-wider">Interviewer</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                  <div className="text-center bg-gray-50 p-2 rounded-lg">
                    <p className="text-xl font-black text-foreground">{pending.length}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wide">Upcoming</p>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded-lg">
                    <p className="text-xl font-black text-foreground">{done.length}</p>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-wide">Completed</p>
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
