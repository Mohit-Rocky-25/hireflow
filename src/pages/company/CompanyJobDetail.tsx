// ============================================================
// HireFlow — Company Job Detail (Tabs: Overview, Applicants, Ranking, Interviews)
// ============================================================
import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  ArrowLeft, Users, Brain, Calendar, Eye, Star, Pencil,
  CheckCircle, Clock, XCircle, Video, UserCheck,
  Plus, X, Send
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { sanitizeUrl } from '@/utils/security';

// ── Schedule Interview Modal ───────────────────────────────
function ScheduleInterviewModal({
  jobId,
  companyId,
  applicationId,
  candidateId,
  onClose,
}: {
  jobId: string;
  companyId: string;
  applicationId: string;
  candidateId: string;
  onClose: () => void;
}) {
  const { companyMembers, users, createInterview, updateApplicationStatus, addNotification } = useStore();
  const interviewers = companyMembers.filter(
    m => m.companyId === companyId && m.role === 'INTERVIEWER'
  );

  const [form, setForm] = useState({
    interviewerId: interviewers[0]?.userId || '',
    stage: 'Technical Round',
    scheduledDate: '',
    scheduledTime: '10:00',
    duration: '60',
    meetingLink: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.interviewerId) { toast('error', 'Please select an interviewer'); return; }
    if (!form.scheduledDate) { toast('error', 'Please pick a date'); return; }

    setSubmitting(true);
    createInterview({
      jobId,
      companyId,
      applicationId,
      candidateId,
      interviewerId: form.interviewerId,
      stage: form.stage,
      status: 'scheduled',
      scheduledDate: form.scheduledDate,
      scheduledTime: form.scheduledTime,
      duration: parseInt(form.duration, 10),
      meetingLink: form.meetingLink || undefined,
      notes: form.notes || undefined,
    });
    updateApplicationStatus(applicationId, 'INTERVIEW', `Interview scheduled: ${form.stage}`);
    toast('success', 'Interview scheduled and interviewer notified!');
    setSubmitting(false);
    onClose();
  };

  const STAGES = [
    'Phone Screen', 'Technical Round', 'System Design', 
    'HR Round', 'Cultural Fit', 'Final Round', 'Bar Raiser',
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-[18px] border border-border shadow-lg w-full max-w-[520px] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-[18px] font-bold text-text">Schedule Interview</h2>
            <p className="text-[13px] text-text-muted mt-[2px]">Assign an interviewer and set the session details</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[8px] hover:bg-surface-2 text-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Interviewer Select */}
          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">
              Assign Interviewer <span className="text-danger">*</span>
            </label>
            {interviewers.length === 0 ? (
              <div className="p-3 rounded-[10px] bg-warning-bg border border-warning/30 text-[13px] text-warning font-medium">
                No interviewers added yet. Go to <Link to="/company/team" className="underline">Company Team</Link> to add one.
              </div>
            ) : (
              <select
                value={form.interviewerId}
                onChange={e => setForm(f => ({ ...f, interviewerId: e.target.value }))}
                className="w-full h-[40px] px-3 rounded-[10px] border border-border text-[13px] text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              >
                <option value="">— Select interviewer —</option>
                {interviewers.map(m => {
                  const u = users.find(u => u.id === m.userId);
                  return (
                    <option key={m.userId} value={m.userId}>
                      {u?.displayName || m.userId}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Stage */}
          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">Interview Stage</label>
            <select
              value={form.stage}
              onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
              className="w-full h-[40px] px-3 rounded-[10px] border border-border text-[13px] text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Date + Time + Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-[13px] font-semibold text-text mb-1.5">
                Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.scheduledDate}
                onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full h-[40px] px-3 rounded-[10px] border border-border text-[13px] text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">Time</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                className="w-full h-[40px] px-3 rounded-[10px] border border-border text-[13px] text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text mb-1.5">Duration</label>
              <select
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="w-full h-[40px] px-3 rounded-[10px] border border-border text-[13px] text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {['30','45','60','90','120'].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">Meeting Link (optional)</label>
            <input
              type="url"
              placeholder="https://meet.google.com/..."
              value={form.meetingLink}
              onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))}
              className="w-full h-[40px] px-3 rounded-[10px] border border-border text-[13px] text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-text-muted"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-semibold text-text mb-1.5">Notes for Interviewer (optional)</label>
            <textarea
              rows={2}
              placeholder="Focus areas, preparation notes…"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-[10px] border border-border text-[13px] text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-text-muted resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold border border-border rounded-[10px] text-text-muted hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || interviewers.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold bg-primary text-white rounded-[10px] hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Schedule & Notify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export function CompanyJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    jobs, applications, candidateMatches, interviews, users,
    updateApplicationStatus, currentCompanyId,
  } = useStore();
  const [tab, setTab] = useState('overview');
  const [scheduleModal, setScheduleModal] = useState<{
    applicationId: string; candidateId: string;
  } | null>(null);

  const job = jobs.find(j => j.id === id);
  if (!job || job.companyId !== currentCompanyId) {
    return <div className="text-center py-12"><p className="text-text-muted">Job not found</p></div>;
  }

  const jobApps = applications.filter(a => a.jobId === id);
  const jobMatches = candidateMatches.filter(m => m.jobId === id);
  const jobInterviews = interviews.filter(i => i.jobId === id);
  const rankedCandidates = useMemo(
    () => [...jobMatches].sort((a, b) => b.overallScore - a.overallScore),
    [jobMatches]
  );

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
    { key: 'applicants', label: `Applicants (${jobApps.length})`, icon: <Users className="w-4 h-4" /> },
    { key: 'ranking', label: 'AI Ranking', icon: <Brain className="w-4 h-4" /> },
    { key: 'interviews', label: `Interviews (${jobInterviews.length})`, icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-[16px] mb-[8px]">
        <button
          onClick={() => navigate('/company/jobs')}
          className="flex items-center gap-[6px] px-[14px] py-[8px] rounded-lg bg-surface-2 border border-border hover:bg-surface-3 transition-colors text-[14px] font-semibold text-text shadow-sm shrink-0"
        >
          <ArrowLeft className="w-[16px] h-[16px]" /> Back to Jobs
        </button>
        <div className="flex-1">
          <h1 className="text-[24px] font-bold text-text tracking-[-0.01em]">{job.title}</h1>
          <p className="text-[14px] text-text-secondary mt-[2px]">{job.department} · {job.location}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${job.status === 'published' ? 'bg-success-bg text-success' : 'bg-surface-2 text-text-muted'}`}>
            {job.status}
          </span>
          <button
            onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border rounded-[8px] hover:bg-surface-2 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] rounded-[10px] p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-all flex-1 justify-center ${
              tab === t.key ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-[14px] border border-border p-5">
            <h3 className="text-[13px] font-semibold text-text mb-3">Job Details</h3>
            <div className="space-y-2 text-[13px]">
              {[
                ['Type', job.employmentType?.replace('-', ' ')],
                ['Work Mode', job.workMode],
                ['Openings', String(job.openings)],
                ['Requirements', String(job.requirements.length)],
                ['Applications', String(jobApps.length)],
                ['Interviews', String(jobInterviews.length)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-text-muted">{k}</span>
                  <span className="font-semibold capitalize text-text">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface rounded-[14px] border border-border p-5">
            <h3 className="text-[13px] font-semibold text-text mb-3">Requirements</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.requirements.map(r => (
                <span
                  key={r.id}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                    r.priority === 'MANDATORY' ? 'bg-danger-bg text-danger' :
                    r.priority === 'PREFERRED' ? 'bg-warning-bg text-warning' :
                    'bg-surface-2 text-text-muted'
                  }`}
                >
                  {r.name} ({r.weight}%)
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-surface rounded-[14px] border border-border p-5">
            <h3 className="text-[13px] font-semibold text-text mb-3">Description</h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">{job.summary}</p>
          </div>
        </div>
      )}

      {/* ── Applicants ── */}
      {tab === 'applicants' && (
        <div className="bg-surface rounded-[14px] border border-border">
          {jobApps.length === 0 ? (
            <div className="p-16 text-center">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-25" />
              <p className="text-[15px] font-semibold text-text">No applications yet</p>
              <p className="text-[13px] text-text-muted mt-1">Applications from the public marketplace will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {jobApps.map(app => {
                const candidate = users.find(u => u.id === app.candidateId);
                const match = jobMatches.find(m => m.applicationId === app.id);
                const hasInterview = jobInterviews.some(i => i.applicationId === app.id);
                return (
                  <div key={app.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-surface-2 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[13px] font-bold">
                        {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-text">{candidate?.displayName || app.candidateId}</p>
                        <p className="text-[12px] text-text-muted">{app.id} · Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {match && (
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center gap-1 ${
                          match.overallScore >= 80 ? 'bg-success-bg text-success' :
                          match.overallScore >= 60 ? 'bg-warning-bg text-warning' :
                          'bg-danger-bg text-danger'
                        }`}>
                          <Brain className="w-3 h-3" />{match.overallScore}%
                        </span>
                      )}
                      <select
                        value={app.status}
                        onChange={e => { updateApplicationStatus(app.id, e.target.value as any); toast('success', 'Status updated'); }}
                        className="px-3 py-1.5 border border-border rounded-[8px] text-[12px] font-medium focus:border-primary outline-none bg-surface text-text"
                      >
                        {['APPLIED','SCREENING','REVIEW','SHORTLISTED','INTERVIEW','FINAL_REVIEW','OFFER','HIRED','REJECTED','ON_HOLD'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {/* Schedule Interview Button */}
                      {!hasInterview && (app.status === 'SHORTLISTED' || app.status === 'INTERVIEW') ? (
                        <button
                          onClick={() => setScheduleModal({ applicationId: app.id, candidateId: app.candidateId })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[12px] font-semibold rounded-[8px] hover:bg-primary-hover shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Schedule Interview
                        </button>
                      ) : hasInterview ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-success bg-success-bg px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3.5 h-3.5" /> Interview Scheduled
                        </span>
                      ) : null}
                      <Link
                        to={`/company/candidates/${app.candidateId}`}
                        className="p-1.5 rounded-[8px] hover:bg-surface-2 text-text-muted transition-colors"
                        title="View Candidate"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── AI Ranking ── */}
      {tab === 'ranking' && (
        <div className="space-y-4">
          <div className="bg-ai-light rounded-[14px] border border-ai/20 p-4 flex items-center gap-3">
            <Brain className="w-5 h-5 text-ai shrink-0" />
            <p className="text-[13px] text-text">AI-ranked candidates based on job requirements. Evidence labels: FOUND IN RESUME · MATCHED FROM · NOT FOUND</p>
          </div>
          {rankedCandidates.length === 0 ? (
            <div className="bg-surface rounded-[14px] border border-border p-16 text-center">
              <Brain className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-25" />
              <p className="text-[15px] font-semibold text-text">No candidates analyzed yet</p>
              <p className="text-[13px] text-text-muted mt-1">AI analysis runs automatically when candidates apply.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankedCandidates.map((match, idx) => {
                const candidate = users.find(u => u.id === match.candidateId);
                return (
                  <div key={match.id} className="bg-surface rounded-[14px] border border-border p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[12px] font-bold">#{idx + 1}</div>
                        <div>
                          <p className="text-[14px] font-semibold text-text">{candidate?.displayName || 'Candidate'}</p>
                          <p className="text-[12px] text-text-muted mt-0.5">{match.evidenceSummary}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-[8px] text-[14px] font-bold ${
                        match.overallScore >= 80 ? 'bg-success-bg text-success' :
                        match.overallScore >= 60 ? 'bg-warning-bg text-warning' :
                        'bg-danger-bg text-danger'
                      }`}>
                        {match.overallScore}%
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.strongMatches.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-success-bg text-success text-[11px] rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />{m.requirementName}
                        </span>
                      ))}
                      {(match.partialMatches ?? []).map((m: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-warning-bg text-warning text-[11px] rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" />{m.requirementName}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-[12px] text-text-secondary leading-relaxed bg-surface-2/50 p-2 rounded">{match.explanation}</p>
                    <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-center">
                      <div className="text-[11px] text-text-muted font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-ai animate-pulse" /> AI recommendation ready for action
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Link
                          to={`/company/candidates/${match.candidateId}`}
                          className="px-4 py-2 text-[12px] font-bold border border-border rounded-[8px] text-text-secondary hover:bg-surface-2 hover:text-text transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Full Profile
                        </Link>
                        <button
                          onClick={() => {
                            updateApplicationStatus(match.applicationId, 'REJECTED');
                            toast('info', 'Candidate Rejected.');
                          }}
                          className="px-4 py-2 text-[12px] font-bold bg-white border border-danger/30 text-danger rounded-[8px] hover:bg-danger-bg hover:border-danger/50 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Fast Reject
                        </button>
                        <button
                          onClick={() => setScheduleModal({ applicationId: match.applicationId, candidateId: match.candidateId })}
                          className="px-5 py-2 text-[12px] font-bold bg-primary text-white rounded-[8px] hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Calendar className="w-3.5 h-3.5" /> Select for Interview
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Interviews ── */}
      {tab === 'interviews' && (
        <div className="space-y-4">
          {/* Quick schedule shortcut */}
          <div className="bg-primary-light rounded-[14px] border border-primary/20 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <p className="text-[13px] text-text">To schedule a new interview, go to the <strong>Applicants</strong> tab, shortlist a candidate, then click <strong>Schedule Interview</strong>.</p>
            </div>
            <button onClick={() => setTab('applicants')} className="shrink-0 px-3 py-1.5 bg-primary text-white text-[12px] font-semibold rounded-[8px] hover:bg-primary-hover transition-all">
              Go to Applicants
            </button>
          </div>

          {jobInterviews.length === 0 ? (
            <div className="bg-surface rounded-[14px] border border-border p-16 text-center">
              <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-25" />
              <p className="text-[15px] font-semibold text-text">No interviews scheduled yet</p>
              <p className="text-[13px] text-text-muted mt-1">Shortlist a candidate in the Applicants tab to schedule their interview.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobInterviews.map(interview => {
                const candidate = users.find(u => u.id === interview.candidateId);
                const interviewer = users.find(u => u.id === interview.interviewerId);
                const isCompleted = interview.status === 'completed';
                return (
                  <div key={interview.id} className="bg-surface rounded-[14px] border border-border p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[13px] font-bold">
                          {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-text">{candidate?.displayName} — <span className="font-normal text-text-muted">{interview.stage}</span></p>
                          <p className="text-[12px] text-text-muted mt-0.5">
                            Interviewer: <span className="font-medium text-text">{interviewer?.displayName}</span> · {interview.scheduledDate} at {interview.scheduledTime} ({interview.duration} min)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.meetingLink && !isCompleted && (
                          <a href={sanitizeUrl(interview.meetingLink)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[12px] font-semibold rounded-[8px] hover:bg-primary-hover shadow-sm">
                            <Video className="w-3.5 h-3.5" /> Join
                          </a>
                        )}
                        <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                          isCompleted ? 'bg-success-bg text-success' : 'bg-primary-light text-primary'
                        }`}>
                          {isCompleted ? 'Completed' : 'Scheduled'}
                        </span>
                      </div>
                    </div>
                    {/* Feedback summary */}
                    {interview.feedback && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex flex-wrap gap-4 text-[12px]">
                          {[
                            ['Technical', interview.feedback.technicalKnowledge],
                            ['Problem Solving', interview.feedback.problemSolving],
                            ['Communication', interview.feedback.communication],
                            ['Role Fit', interview.feedback.roleSpecific],
                          ].map(([l, v]) => (
                            <span key={l} className="text-text-muted">
                              {l}: <span className="font-bold text-text">{v}/5</span>
                            </span>
                          ))}
                          <span className={`ml-auto px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                            interview.feedback.recommendation === 'strong_hire' ? 'bg-success-bg text-success' :
                            interview.feedback.recommendation === 'hire' ? 'bg-primary-light text-primary' :
                            interview.feedback.recommendation === 'maybe' ? 'bg-warning-bg text-warning' :
                            'bg-danger-bg text-danger'
                          }`}>
                            {interview.feedback.recommendation?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        {interview.feedback.writtenFeedback && (
                          <p className="mt-2 text-[12px] text-text-secondary italic">"{interview.feedback.writtenFeedback}"</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Schedule Interview Modal ── */}
      {scheduleModal && (
        <ScheduleInterviewModal
          jobId={job.id}
          companyId={job.companyId}
          applicationId={scheduleModal.applicationId}
          candidateId={scheduleModal.candidateId}
          onClose={() => setScheduleModal(null)}
        />
      )}
    </div>
  );
}
