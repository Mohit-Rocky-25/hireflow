// ============================================================
// HireFlow — Interview Detail & Feedback (Interviewer View)
// ============================================================
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Calendar, Clock, Video, CheckCircle, Star, User, Briefcase, FileText } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, interviews, jobs, users, candidateProfiles, submitFeedback } = useStore();

  const interview = interviews.find(i => i.id === id);
  const job = jobs.find(j => j.id === interview?.jobId);
  const candidate = users.find(u => u.id === interview?.candidateId);
  const profile = candidateProfiles.find(p => p.userId === interview?.candidateId);

  const [ratings, setRatings] = useState({
    technicalKnowledge: interview?.feedback?.technicalKnowledge || 4,
    problemSolving: interview?.feedback?.problemSolving || 4,
    communication: interview?.feedback?.communication || 4,
    roleSpecific: interview?.feedback?.roleSpecific || 4,
  });

  const [recommendation, setRecommendation] = useState<'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire'>(
    interview?.feedback?.recommendation || 'hire'
  );
  const [writtenFeedback, setWrittenFeedback] = useState(interview?.feedback?.writtenFeedback || '');

  if (!interview || !job || !candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Interview not found</p>
        <button onClick={() => navigate('/interviewer/interviews')} className="mt-4 px-4 py-2 text-sm text-primary hover:underline">
          Return to Interviews
        </button>
      </div>
    );
  }

  const isCompleted = interview.status === 'completed' && Boolean(interview.feedback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!writtenFeedback.trim()) {
      toast('error', 'Please provide written feedback');
      return;
    }

    submitFeedback(interview.id, {
      interviewId: interview.id,
      interviewerId: currentUser.id,
      technicalKnowledge: ratings.technicalKnowledge,
      problemSolving: ratings.problemSolving,
      communication: ratings.communication,
      roleSpecific: ratings.roleSpecific,
      writtenFeedback: writtenFeedback.trim(),
      recommendation,
    });

    toast('success', 'Interview feedback submitted successfully!');
    navigate('/interviewer/interviews');
  };

  const renderStars = (key: keyof typeof ratings, label: string) => (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm font-bold text-primary">{ratings[key]} / 5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={isCompleted}
            onClick={() => setRatings(prev => ({ ...prev, [key]: star }))}
            className={`p-2 rounded-btn border transition-all ${
              star <= ratings[key]
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-border text-muted hover:border-gray-400'
            }`}
          >
            <Star className={`w-5 h-5 ${star <= ratings[key] ? 'fill-primary' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/interviewer/interviews')} className="p-2 rounded-btn hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-muted" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Interview Evaluation: {candidate.displayName}</h1>
          <p className="text-sm text-muted">{job.title} • {interview.stage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate & Interview Details */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-border p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Candidate Summary
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {candidate.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{candidate.displayName}</p>
                <p className="text-xs text-muted">{profile?.headline || 'Candidate'}</p>
              </div>
            </div>

            <div className="text-sm space-y-1 text-secondary pt-2 border-t border-border">
              <p className="text-xs text-muted">Email: {candidate.email}</p>
              {profile?.location && <p className="text-xs text-muted">Location: {profile.location}</p>}
            </div>

            {profile?.skills && profile.skills.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted uppercase mb-2">Key Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-card border border-border p-5 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Session Info
            </h3>
            <div className="space-y-2 text-sm text-secondary">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted" /> Date: {interview.scheduledDate}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" /> Time: {interview.scheduledTime} ({interview.duration} min)
              </p>
              {interview.meetingLink && (
                <div className="pt-2">
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-btn hover:bg-primary-hover"
                  >
                    <Video className="w-3.5 h-3.5" /> Join Video Call
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-card border border-border p-5 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Job Requirements
            </h3>
            <ul className="space-y-2 text-xs text-secondary">
              {job.requirements.map(req => (
                <li key={req.id} className="p-2 rounded-btn bg-gray-50 border border-border">
                  <span className="font-medium text-foreground">{req.name}</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-primary font-semibold">
                    {req.priority}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Structured Feedback Form */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-card border border-border p-6 shadow-card">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Structured Evaluation Form
                </h2>
                <p className="text-xs text-muted">Submit accurate, objective ratings and observations.</p>
              </div>
              {isCompleted && (
                <span className="px-3 py-1 bg-green-50 text-success text-xs font-bold rounded-full flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Feedback Submitted
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderStars('technicalKnowledge', '1. Technical Knowledge')}
                {renderStars('problemSolving', '2. Problem Solving')}
                {renderStars('communication', '3. Communication Skills')}
                {renderStars('roleSpecific', '4. Role-Specific Competence')}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Overall Recommendation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {[
                    { id: 'strong_hire', label: 'Strong Hire', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                    { id: 'hire', label: 'Hire', color: 'bg-blue-50 text-blue-700 border-blue-300' },
                    { id: 'maybe', label: 'Maybe', color: 'bg-amber-50 text-amber-700 border-amber-300' },
                    { id: 'no_hire', label: 'No Hire', color: 'bg-rose-50 text-rose-700 border-rose-300' },
                    { id: 'strong_no_hire', label: 'Strong No', color: 'bg-red-100 text-red-800 border-red-400' },
                  ].map(rec => (
                    <button
                      key={rec.id}
                      type="button"
                      disabled={isCompleted}
                      onClick={() => setRecommendation(rec.id as any)}
                      className={`px-3 py-2 text-xs font-semibold rounded-btn border text-center transition-all ${
                        recommendation === rec.id
                          ? `${rec.color} ring-2 ring-primary ring-offset-1`
                          : 'border-border text-muted hover:bg-gray-50'
                      }`}
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Written Feedback & Observations
                </label>
                <textarea
                  rows={5}
                  disabled={isCompleted}
                  value={writtenFeedback}
                  onChange={e => setWrittenFeedback(e.target.value)}
                  placeholder="Describe strengths, code quality, reasoning ability, team culture fit, and development areas..."
                  className="w-full px-3 py-2 rounded-btn border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                  required
                />
              </div>

              {!isCompleted && (
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => navigate('/interviewer/interviews')}
                    className="px-4 py-2 text-sm border border-border rounded-btn text-muted hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-btn hover:bg-primary-hover shadow-sm transition-all"
                  >
                    Submit Evaluation
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
