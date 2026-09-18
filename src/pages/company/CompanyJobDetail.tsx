// ============================================================
// HireFlow — Company Job Detail (Tabs: Overview, Applicants, Ranking, Interviews)
// ============================================================
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Users, Brain, Calendar, BarChart3, CheckCircle, XCircle, Clock, Eye, Star } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function CompanyJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, applications, candidateMatches, interviews, users, updateApplicationStatus, companies, currentCompanyId } = useStore();
  const [tab, setTab] = useState('overview');

  const job = jobs.find(j => j.id === id);
  if (!job || job.companyId !== currentCompanyId) {
    return <div className="text-center py-12"><p className="text-muted">Job not found</p></div>;
  }

  const jobApps = applications.filter(a => a.jobId === id);
  const jobMatches = candidateMatches.filter(m => m.jobId === id);
  const jobInterviews = interviews.filter(i => i.jobId === id);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { key: 'applicants', label: `Applicants (${jobApps.length})`, icon: <Users className="w-4 h-4" /> },
    { key: 'ranking', label: 'AI Ranking', icon: <Brain className="w-4 h-4" /> },
    { key: 'interviews', label: `Interviews (${jobInterviews.length})`, icon: <Calendar className="w-4 h-4" /> },
  ];

  const rankedCandidates = jobMatches.sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-btn hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-muted" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
          <p className="text-sm text-muted">{job.department} • {job.location}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${job.status === 'published' ? 'bg-green-50 text-success' : 'bg-gray-100 text-muted'}`}>{job.status}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-btn p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-btn text-sm font-medium transition-all flex-1 justify-center ${tab === t.key ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Job Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted">Type</span><span className="font-medium capitalize">{job.employmentType.replace('-', ' ')}</span></div>
              <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted">Work Mode</span><span className="font-medium capitalize">{job.workMode}</span></div>
              <div className="flex justify-between py-1.5 border-b border-border/50"><span className="text-muted">Openings</span><span className="font-medium">{job.openings}</span></div>
              <div className="flex justify-between py-1.5"><span className="text-muted">Requirements</span><span className="font-medium">{job.requirements.length}</span></div>
            </div>
          </div>
          <div className="bg-surface rounded-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Requirements</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.requirements.map(r => (
                <span key={r.id} className={`px-2.5 py-1 text-xs font-medium rounded-full ${r.priority === 'MANDATORY' ? 'bg-red-50 text-danger' : r.priority === 'PREFERRED' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-muted'}`}>
                  {r.name} ({r.weight}%)
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-surface rounded-card border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Description</h3>
            <p className="text-sm text-secondary leading-relaxed">{job.summary}</p>
          </div>
        </div>
      )}

      {/* Applicants */}
      {tab === 'applicants' && (
        <div className="bg-surface rounded-card border border-border">
          {jobApps.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted">No applications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {jobApps.map(app => {
                const candidate = users.find(u => u.id === app.candidateId);
                const match = jobMatches.find(m => m.applicationId === app.id);
                return (
                  <div key={app.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{candidate?.displayName || app.candidateId}</p>
                        <p className="text-xs text-muted">{app.id} • Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {match && (
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${match.overallScore >= 80 ? 'bg-green-50 text-success' : match.overallScore >= 60 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-danger'}`}>
                          <Brain className="w-3 h-3" />{match.overallScore}%
                        </span>
                      )}
                      <select
                        value={app.status}
                        onChange={e => { updateApplicationStatus(app.id, e.target.value as any); toast('success', 'Status updated'); }}
                        className="px-3 py-1.5 border border-border rounded-btn text-xs font-medium focus:border-primary outline-none"
                      >
                        {['APPLIED','SCREENING','REVIEW','SHORTLISTED','INTERVIEW','FINAL_REVIEW','OFFER','HIRED','REJECTED','ON_HOLD'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ranking */}
      {tab === 'ranking' && (
        <div className="space-y-4">
          <div className="bg-ai-light rounded-card border border-ai/20 p-4 flex items-center gap-3">
            <Brain className="w-5 h-5 text-ai" />
            <p className="text-sm text-foreground">AI-ranked candidates based on job requirements and evidence analysis</p>
          </div>
          {rankedCandidates.length === 0 ? (
            <div className="bg-surface rounded-card border border-border p-12 text-center">
              <Brain className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted">No candidates analyzed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankedCandidates.map((match, idx) => {
                const candidate = users.find(u => u.id === match.candidateId);
                return (
                  <div key={match.id} className="bg-surface rounded-card border border-border p-5 hover:shadow-card-hover transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">#{idx + 1}</div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{candidate?.displayName || 'Candidate'}</p>
                          <p className="text-xs text-muted mt-0.5">{match.evidenceSummary}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-btn text-sm font-bold ${match.overallScore >= 80 ? 'bg-green-50 text-success' : match.overallScore >= 60 ? 'bg-amber-50 text-warning' : 'bg-red-50 text-danger'}`}>
                        {match.overallScore}%
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.strongMatches.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-50 text-success text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />{m.requirement}</span>
                      ))}
                      {match.potentialGaps.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full flex items-center gap-1"><Clock className="w-3 h-3" />{m.requirement}</span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-secondary">{match.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interviews */}
      {tab === 'interviews' && (
        <div className="bg-surface rounded-card border border-border">
          {jobInterviews.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted">No interviews scheduled</p>
              <p className="text-xs text-muted mt-1">Shortlist a candidate to schedule an interview</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {jobInterviews.map(interview => {
                const candidate = users.find(u => u.id === interview.candidateId);
                const interviewer = users.find(u => u.id === interview.interviewerId);
                return (
                  <div key={interview.id} className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{candidate?.displayName} — {interview.stage}</p>
                        <p className="text-xs text-muted">Interviewer: {interviewer?.displayName} • {interview.scheduledDate} at {interview.scheduledTime}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${interview.status === 'completed' ? 'bg-green-50 text-success' : 'bg-primary-light text-primary'}`}>{interview.status}</span>
                    </div>
                    {interview.feedback && (
                      <div className="mt-2 pl-4 border-l-2 border-success/30">
                        <p className="text-xs text-muted">Feedback: Tech {interview.feedback.technicalKnowledge}/5 • Problem {interview.feedback.problemSolving}/5 • Comm {interview.feedback.communication}/5</p>
                        <p className="text-xs text-secondary mt-1">{interview.feedback.writtenFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
