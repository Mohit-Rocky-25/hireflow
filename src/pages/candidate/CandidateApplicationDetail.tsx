// ============================================================
// HireFlow — Candidate Application Detail
// ============================================================
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Building2, Calendar, CheckCircle2, Clock, Brain, Video, MapPin } from 'lucide-react';
import type { ApplicationStatus } from '../../types';

export function CandidateApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applications, jobs, companies, candidateMatches, interviews } = useStore();

  const application = applications.find(a => a.id === id);
  const job = jobs.find(j => j.id === application?.jobId);
  const company = companies.find(c => c.id === application?.companyId);
  const match = candidateMatches.find(m => m.applicationId === id);
  const interview = interviews.find(i => i.applicationId === id);

  if (!application || !job || !company) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Application not found</p>
        <button
          onClick={() => navigate('/candidate/applications')}
          className="mt-4 px-4 py-2 text-sm text-primary hover:underline"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const pipelineStages: ApplicationStatus[] = [
    'APPLIED',
    'SCREENING',
    'REVIEW',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFER',
  ];

  const currentIdx = pipelineStages.indexOf(application.status);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/candidate/applications')}
          className="p-2 rounded-btn hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-muted" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
          <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
            <Building2 className="w-3.5 h-3.5" /> {company.name} • Applied on {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Pipeline Status Progress Tracker */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-sm">
        <h2 className="text-sm font-bold text-foreground mb-4">Application Progress</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 z-0" />
          {pipelineStages.map((stage, idx) => {
            const isPassed = currentIdx >= idx;
            const isCurrent = application.status === stage;

            return (
              <div key={stage} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : isPassed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-muted border border-border'
                  }`}
                >
                  {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-semibold mt-2 ${isCurrent ? 'text-primary' : 'text-muted'}`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Interview Card if applicable */}
      {interview && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Interview Scheduled</h3>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-100 text-primary text-xs font-bold rounded-full">
              {interview.stage}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-secondary">
            <p><strong>Date:</strong> {interview.scheduledDate}</p>
            <p><strong>Time:</strong> {interview.scheduledTime} ({interview.duration} mins)</p>
          </div>
          {interview.meetingLink && (
            <div className="pt-2">
              <a
                href={interview.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm"
              >
                <Video className="w-4 h-4" /> Join Online Meeting
              </a>
            </div>
          )}
        </div>
      )}

      {/* AI Match Overview */}
      {match && (
        <div className="bg-surface rounded-card border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-ai" /> AI Resume Match Analysis
            </h3>
            <span className="text-sm font-bold text-ai bg-ai-light px-3 py-1 rounded-full">
              {match.overallScore}% Fit
            </span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">{match.explanation}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-btn bg-emerald-50/50 border border-emerald-100 space-y-2">
              <p className="text-xs font-bold text-emerald-800">Strong Matches</p>
              <ul className="space-y-1">
                {match.strongMatches.map((m, i) => (
                  <li key={i} className="text-xs text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>{m.requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-btn bg-amber-50/50 border border-amber-100 space-y-2">
              <p className="text-xs font-bold text-amber-800">Areas for Growth</p>
              <ul className="space-y-1">
                {match.potentialGaps.map((m, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{m.requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Status History Timeline */}
      <div className="bg-surface rounded-card border border-border p-6 space-y-4">
        <h3 className="text-sm font-bold text-foreground">Timeline Updates</h3>
        <div className="space-y-3">
          {application.statusHistory.map((item, i) => (
            <div key={i} className="flex gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">{item.status}</p>
                <p className="text-muted">{new Date(item.timestamp).toLocaleString()}</p>
                {item.note && <p className="text-secondary mt-1 italic">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Link
          to={`/jobs/${job.id}`}
          className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
        >
          View Full Job Description <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        </Link>
      </div>
    </div>
  );
}
