// ============================================================
// HireFlow — Enhanced Candidate Detail & AI Interview Prep (BHR View)
// ============================================================
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  ArrowLeft, Brain, CheckCircle, Clock, AlertTriangle, Mail, MapPin,
  Phone, Calendar, Plus, Sparkles, UserCheck, Check, Video, FileText,
  Building2, Briefcase, Award, Send, ChevronRight, X
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import type { User } from '../../types';

export function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    users,
    candidateProfiles,
    applications,
    candidateMatches,
    currentCompanyId,
    jobs,
    companyMembers,
    interviews,
    createInterview,
    updateApplicationStatus,
    addNotification,
  } = useStore();

  const user = users.find(u => u.id === id);
  const profile = candidateProfiles.find(p => p.userId === id);
  const candidateApps = applications.filter(a => a.candidateId === id && a.companyId === currentCompanyId);
  const matches = candidateMatches.filter(m => m.candidateId === id);
  const candidateInterviews = interviews.filter(i => i.candidateId === id && i.companyId === currentCompanyId);

  // Available interviewers from company members
  const interviewerMembers = companyMembers.filter(m => m.companyId === currentCompanyId && m.role === 'INTERVIEWER');
  const interviewerUsers: User[] = interviewerMembers
    .map(m => users.find(u => u.id === m.userId))
    .filter((u): u is User => Boolean(u));

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string>(candidateApps[0]?.id || '');
  const [interviewForm, setInterviewForm] = useState({
    stage: 'Technical Interview',
    interviewerId: interviewerUsers[0]?.id || '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '14:00',
    duration: 45,
  });

  // AI Interview Questions Generator state
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<{ category: string; question: string; targetCompetency: string }[]>([]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Candidate not found</p>
        <button onClick={() => navigate('/company/candidates')} className="mt-4 px-4 py-2 text-sm text-primary hover:underline">
          Back to Candidates
        </button>
      </div>
    );
  }

  const handleGenerateQuestions = (jobTitle: string) => {
    setIsGeneratingQuestions(true);
    toast('info', 'AI is formulating customized interview questions...');

    setTimeout(() => {
      const match = matches[0];
      const questions = [
        {
          category: 'Technical Architecture',
          question: `In your experience with modern frameworks for ${jobTitle}, how do you ensure zero-downtime cache invalidation and distributed data consistency?`,
          targetCompetency: 'System Architecture & Scalability',
        },
        {
          category: 'Gap Investigation',
          question: match?.potentialGaps[0]
            ? `We noted your primary focus has been full-stack engineering; could you walk us through how you bridge knowledge in ${match.potentialGaps[0].requirement}?`
            : `Walk us through the most complex debugging challenge you faced with high-traffic APIs.`,
          targetCompetency: match?.potentialGaps[0]?.requirement || 'Domain Adaptation',
        },
        {
          category: 'Problem Solving',
          question: `If you were tasked with migrating a legacy service to asynchronous background jobs with rate limits, what telemetry and failure fallbacks would you design?`,
          targetCompetency: 'Resilience & API Engineering',
        },
        {
          category: 'Behavioral & Leadership',
          question: `Describe a situation where you had a strong technical disagreement with a peer regarding component design or schema choices. How did you resolve it?`,
          targetCompetency: 'Collaboration & Communication',
        },
      ];

      setGeneratedQuestions(questions);
      setIsGeneratingQuestions(false);
      toast('success', 'AI interview questions generated based on candidate profile!');
    }, 900);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompanyId) return;
    const targetApp = candidateApps.find(a => a.id === selectedAppId) || candidateApps[0];
    if (!targetApp) {
      toast('error', 'No active application found to schedule interview for');
      return;
    }

    createInterview({
      companyId: currentCompanyId,
      applicationId: targetApp.id,
      jobId: targetApp.jobId,
      candidateId: user.id,
      interviewerId: interviewForm.interviewerId || user.id,
      stage: interviewForm.stage,
      scheduledDate: interviewForm.scheduledDate,
      scheduledTime: interviewForm.scheduledTime,
      duration: Number(interviewForm.duration),
      status: 'scheduled',
      meetingLink: `${window.location.origin}/interview-room/temp`,
    });

    updateApplicationStatus(targetApp.id, 'INTERVIEW');

    // Notify candidate
    addNotification({
      userId: user.id,
      title: 'Interview Scheduled',
      message: `You have an interview for ${jobs.find(j => j.id === targetApp.jobId)?.title || 'your applied role'} on ${interviewForm.scheduledDate} at ${interviewForm.scheduledTime}.`,
      type: 'interview',
      link: '/candidate/interviews',
    });

    toast('success', `Interview round scheduled with ${user.displayName}!`);
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/company/candidates')}
            className="p-2 rounded-btn hover:bg-gray-100 text-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{user.displayName}</h1>
            <p className="text-xs text-muted flex items-center gap-1.5">
              <span>Candidate ID: {user.id.substring(0, 10)}</span>
              <span>•</span>
              <span className="text-primary font-medium">{profile?.headline || 'Applicant'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule Interview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Candidate Profile Card */}
        <div className="space-y-6">
          <div className="bg-surface rounded-card border border-border p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-lg font-bold">
                {user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-foreground text-base">{user.displayName}</p>
                <p className="text-xs text-muted">{profile?.headline || 'Full Stack Engineer'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-secondary pt-3 border-t border-border">
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-muted shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              {profile?.phone && (
                <p className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-muted shrink-0" />
                  <span>{profile.phone}</span>
                </p>
              )}
              {profile?.location && (
                <p className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-muted shrink-0" />
                  <span>{profile.location}</span>
                </p>
              )}
            </div>

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Verified Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-primary-light text-primary text-xs font-semibold rounded-full border border-primary/10">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scheduled Interviews Card */}
          <div className="bg-surface rounded-card border border-border p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Interview Schedule
              </h3>
              <span className="text-xs text-muted">{candidateInterviews.length} rounds</span>
            </div>

            {candidateInterviews.length === 0 ? (
              <p className="text-xs text-muted italic">No interviews scheduled yet. Click "Schedule Interview" above.</p>
            ) : (
              <div className="space-y-2.5">
                {candidateInterviews.map(inv => {
                  const interviewer = users.find(u => u.id === inv.interviewerId);
                  return (
                    <div key={inv.id} className="p-3 rounded-btn bg-gray-50 border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{inv.stage}</span>
                        <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${
                          inv.status === 'completed' ? 'bg-emerald-50 text-success' : 'bg-blue-50 text-primary'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted">
                        📅 {inv.scheduledDate} at {inv.scheduledTime} ({inv.duration}m)
                      </p>
                      <p className="text-[11px] text-muted">Panel: {interviewer?.displayName || 'Assigned Interviewer'}</p>
                      <div className="pt-1 flex gap-2">
                        <Link
                          to={`/interview-room/${inv.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <Video className="w-3 h-3" /> Enter Live Studio
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Applications, AI Match Explanations & AI Prep */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applications */}
          <div className="space-y-4">
            {candidateApps.map(app => {
              const job = jobs.find(j => j.id === app.jobId);
              const match = matches.find(m => m.applicationId === app.id);

              return (
                <div key={app.id} className="bg-surface rounded-card border border-border p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                    <div>
                      <h2 className="text-base font-bold text-foreground">{job?.title || 'Applied Position'}</h2>
                      <p className="text-xs text-muted">
                        App ID: {app.id} • Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={e => {
                          updateApplicationStatus(app.id, e.target.value as any);
                          toast('success', `Application status changed to ${e.target.value}`);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold border border-border rounded-btn bg-surface focus:border-primary outline-none"
                      >
                        {['APPLIED','SCREENING','REVIEW','SHORTLISTED','INTERVIEW','FINAL_REVIEW','OFFER','HIRED','REJECTED','ON_HOLD'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* AI Match Explanation Box */}
                  {match && (
                    <div className="bg-ai-light/30 rounded-card border border-ai/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-ai" />
                          <span className="text-sm font-bold text-foreground">
                            AI Screening Match: {match.overallScore}%
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          match.overallScore >= 80 ? 'bg-green-100 text-success' : 'bg-amber-100 text-warning'
                        }`}>
                          {match.overallScore >= 80 ? 'Strong Candidate' : 'Moderate Match'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {match.strongMatches.map((m, i) => (
                          <span key={i} className="px-2.5 py-1 bg-green-50 text-success text-xs font-semibold rounded-full flex items-center gap-1 border border-green-200">
                            <CheckCircle className="w-3.5 h-3.5" /> {m.requirement}
                          </span>
                        ))}
                        {match.potentialGaps.map((m, i) => (
                          <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> {m.requirement} (Gap)
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-secondary leading-relaxed">{match.explanation}</p>
                    </div>
                  )}

                  {/* AI Interview Question Generator Section */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-ai" /> AI Interview Question Generator
                      </h3>
                      <button
                        onClick={() => handleGenerateQuestions(job?.title || 'Engineer')}
                        disabled={isGeneratingQuestions}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-ai-light text-ai hover:bg-ai/20 text-xs font-semibold rounded-btn transition-colors border border-ai/20 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {isGeneratingQuestions ? 'Generating...' : 'Generate Tailored Questions'}
                      </button>
                    </div>

                    {generatedQuestions.length > 0 && (
                      <div className="space-y-2.5 bg-gray-50/70 rounded-card p-4 border border-border animate-fade-in">
                        {generatedQuestions.map((q, idx) => (
                          <div key={idx} className="bg-surface rounded-btn p-3 border border-border space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-primary">{q.category}</span>
                              <span className="text-[10px] text-muted">Target: {q.targetCompetency}</span>
                            </div>
                            <p className="text-xs text-foreground font-medium leading-relaxed">"{q.question}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Work Experience */}
          {profile?.experience && profile.experience.length > 0 && (
            <div className="bg-surface rounded-card border border-border p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Professional Experience
              </h3>
              <div className="space-y-4 divide-y divide-border">
                {profile.experience.map(exp => (
                  <div key={exp.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">{exp.title}</p>
                      <span className="text-xs text-muted">{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-xs font-semibold text-primary">{exp.company}</p>
                    <p className="text-xs text-secondary leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile?.education && profile.education.length > 0 && (
            <div className="bg-surface rounded-card border border-border p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Academic Qualifications
              </h3>
              <div className="space-y-3">
                {profile.education.map(edu => (
                  <div key={edu.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-foreground text-sm">{edu.degree} in {edu.field}</p>
                      <p className="text-muted">{edu.institution}</p>
                    </div>
                    {edu.grade && <span className="px-2.5 py-1 bg-gray-100 rounded-btn font-semibold">{edu.grade}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-card border border-border max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Schedule Interview Session
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-btn text-muted hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Select Stage</label>
                <select
                  value={interviewForm.stage}
                  onChange={e => setInterviewForm(f => ({ ...f, stage: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none"
                >
                  <option value="Initial Phone Screen">Initial Phone Screen</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="System Design Round">System Design Round</option>
                  <option value="Behavioral & Culture Fit">Behavioral & Culture Fit</option>
                  <option value="Executive Review">Executive Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Assign Interviewer</label>
                <select
                  value={interviewForm.interviewerId}
                  onChange={e => setInterviewForm(f => ({ ...f, interviewerId: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none"
                >
                  {interviewerUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>
                  ))}
                  {interviewerUsers.length === 0 && (
                    <option value={user.id}>Direct Manager Panel</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.scheduledDate}
                    onChange={e => setInterviewForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.scheduledTime}
                    onChange={e => setInterviewForm(f => ({ ...f, scheduledTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Duration (Minutes)</label>
                <select
                  value={interviewForm.duration}
                  onChange={e => setInterviewForm(f => ({ ...f, duration: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none"
                >
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-border text-xs font-semibold rounded-btn hover:bg-gray-50 text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm"
                >
                  Confirm & Dispatch Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
