// ============================================================
// HireFlow — Interviewer Interviews (Full Premium Build)
// ============================================================
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { sanitizeUrl } from '@/utils/security';
import {
  Calendar, ArrowRight, CheckCircle, Clock, Search,
  Video, Briefcase, User, ClipboardList, AlertCircle,
} from 'lucide-react';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'pending_feedback';

export function InterviewerInterviews() {
  const { currentUser, interviews, jobs, users } = useStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  if (!currentUser) return null;

  const myInterviews = interviews.filter(i => i.interviewerId === currentUser.id);

  const counts = useMemo(() => ({
    all: myInterviews.length,
    upcoming: myInterviews.filter(i => i.status === 'scheduled').length,
    completed: myInterviews.filter(i => i.status === 'completed').length,
    pending_feedback: myInterviews.filter(i => i.status === 'completed' && !i.feedback).length,
  }), [myInterviews]);

  const filtered = useMemo(() => {
    let list = myInterviews;
    if (activeTab === 'upcoming') list = list.filter(i => i.status === 'scheduled');
    if (activeTab === 'completed') list = list.filter(i => i.status === 'completed');
    if (activeTab === 'pending_feedback') list = list.filter(i => i.status === 'completed' && !i.feedback);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => {
        const job = jobs.find(j => j.id === i.jobId);
        const candidate = users.find(u => u.id === i.candidateId);
        return (
          job?.title?.toLowerCase().includes(q) ||
          candidate?.displayName?.toLowerCase().includes(q) ||
          i.stage?.toLowerCase().includes(q)
        );
      });
    }

    return list.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [myInterviews, activeTab, search, jobs, users]);

  const TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-4 h-4" /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'pending_feedback', label: 'Pending Feedback', icon: <AlertCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-[-0.01em]">My Interviews</h1>
          <p className="text-[14px] text-text-secondary mt-[2px]">
            {counts.all} total · {counts.upcoming} upcoming · {counts.pending_feedback} awaiting your feedback
          </p>
        </div>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Assigned', value: counts.all, color: 'text-text bg-surface', icon: <ClipboardList className="w-4 h-4 text-text-muted" /> },
          { label: 'Upcoming', value: counts.upcoming, color: 'text-primary bg-primary-light', icon: <Calendar className="w-4 h-4 text-primary" /> },
          { label: 'Pending Feedback', value: counts.pending_feedback, color: 'text-warning bg-warning-bg', icon: <AlertCircle className="w-4 h-4 text-warning" /> },
          { label: 'Completed', value: counts.completed, color: 'text-success bg-success-bg', icon: <CheckCircle className="w-4 h-4 text-success" /> },
        ].map((s, i) => (
          <div key={i} className="bg-surface rounded-[14px] border border-border p-4 flex items-center gap-3 shadow-xs">
            <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${s.color.split(' ').slice(1).join(' ')}`}>{s.icon}</div>
            <div>
              <p className={`text-[20px] font-bold ${s.color.split(' ')[0]}`}>{s.value}</p>
              <p className="text-[11px] text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-1 bg-[#F1F5F9] rounded-[10px] p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-surface text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {t.icon}
              {t.label}
              <span className={`ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-primary/10 text-primary' : 'bg-border text-text-muted'}`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate, job, or stage…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-[40px] pl-9 pr-4 rounded-[10px] border border-border bg-surface text-[13px] text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-[14px] border border-border p-16 text-center">
          <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-25" />
          <p className="text-[15px] font-semibold text-text">No interviews found</p>
          <p className="text-[13px] text-text-muted mt-1">
            {search ? 'Try adjusting your search.' : 'Interviews assigned to you will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(interview => {
            const job = jobs.find(j => j.id === interview.jobId);
            const candidate = users.find(u => u.id === interview.candidateId);
            const isCompleted = interview.status === 'completed';
            const hasFeedback = Boolean(interview.feedback);
            const needsFeedback = isCompleted && !hasFeedback;

            return (
              <Link
                key={interview.id}
                to={`/interviewer/interviews/${interview.id}`}
                className="block bg-surface rounded-[14px] border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Candidate + Job info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[14px] font-bold shrink-0">
                      {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[15px] font-semibold text-text group-hover:text-primary transition-colors">
                          {candidate?.displayName || 'Candidate'}
                        </p>
                        {/* Stage badge */}
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary-light text-primary">
                          {interview.stage}
                        </span>
                        {/* Status badge */}
                        {needsFeedback && (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-warning-bg text-warning flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Feedback Required
                          </span>
                        )}
                        {hasFeedback && (
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-success-bg text-success flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Submitted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[12px] text-text-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" /> {job?.title || 'Unknown Role'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {interview.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {interview.scheduledTime} · {interview.duration} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {interview.meetingLink && !isCompleted && (
                      <a
                        href={sanitizeUrl(interview.meetingLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[12px] font-semibold rounded-[8px] hover:bg-primary-hover shadow-sm transition-all"
                      >
                        <Video className="w-3.5 h-3.5" /> Join Call
                      </a>
                    )}
                    {needsFeedback && (
                      <span className="px-3 py-1.5 bg-warning text-white text-[12px] font-semibold rounded-[8px] shadow-sm flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5" /> Submit Feedback
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Feedback preview if submitted */}
                {hasFeedback && interview.feedback && (
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4">
                    {[
                      { label: 'Technical', value: interview.feedback.technicalKnowledge },
                      { label: 'Problem Solving', value: interview.feedback.problemSolving },
                      { label: 'Communication', value: interview.feedback.communication },
                      { label: 'Role Fit', value: interview.feedback.roleSpecific },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[12px]">
                        <span className="text-text-muted">{r.label}:</span>
                        <span className="font-bold text-text">{r.value}/5</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <div key={s} className={`w-2 h-2 rounded-full ${s <= r.value ? 'bg-primary' : 'bg-border'}`} />
                          ))}
                        </div>
                      </div>
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
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
