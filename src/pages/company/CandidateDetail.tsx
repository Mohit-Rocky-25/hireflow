// ============================================================
// HireFlow — Candidate Detail (BHR View)
// ============================================================
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Brain, CheckCircle, Clock, AlertTriangle, Mail, MapPin, Phone } from 'lucide-react';

export function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, candidateProfiles, applications, candidateMatches, currentCompanyId, jobs } = useStore();
  
  const user = users.find(u => u.id === id);
  const profile = candidateProfiles.find(p => p.userId === id);
  const candidateApps = applications.filter(a => a.candidateId === id && a.companyId === currentCompanyId);
  const matches = candidateMatches.filter(m => m.candidateId === id);

  if (!user) return <div className="text-center py-12"><p className="text-muted">Candidate not found</p></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-btn hover:bg-gray-100"><ArrowLeft className="w-5 h-5 text-muted" /></button>
        <h1 className="text-xl font-bold text-foreground">{user.displayName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="bg-surface rounded-card border border-border p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
              {user.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.displayName}</p>
              <p className="text-sm text-muted">{profile?.headline || 'Candidate'}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-secondary">
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted" />{user.email}</p>
            {profile?.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted" />{profile.phone}</p>}
            {profile?.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted" />{profile.location}</p>}
          </div>
          {profile?.skills && profile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted uppercase mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">{profile.skills.map((s, i) => <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-xs rounded-full">{s}</span>)}</div>
            </div>
          )}
        </div>

        {/* Applications + Match */}
        <div className="lg:col-span-2 space-y-4">
          {candidateApps.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            const match = matches.find(m => m.applicationId === app.id);
            return (
              <div key={app.id} className="bg-surface rounded-card border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{job?.title || 'Job'}</p>
                    <p className="text-xs text-muted">{app.id} • Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${app.status === 'SHORTLISTED' ? 'bg-green-50 text-success' : app.status === 'INTERVIEW' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-muted'}`}>{app.status}</span>
                </div>
                
                {match && (
                  <div className="bg-ai-light rounded-btn p-4 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-ai" />
                      <span className="text-sm font-semibold text-foreground">AI Match: {match.overallScore}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {match.strongMatches.map((m, i) => <span key={i} className="px-2 py-0.5 bg-green-50 text-success text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />{m.requirement}</span>)}
                      {match.potentialGaps.map((m, i) => <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{m.requirement}</span>)}
                    </div>
                    <p className="text-xs text-secondary">{match.explanation}</p>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted uppercase mb-2">Status History</p>
                  <div className="space-y-1">
                    {app.statusHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className={`w-1.5 h-1.5 rounded-full ${i === app.statusHistory.length - 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <span className="font-medium text-foreground">{h.status}</span>
                        <span className="text-muted">{new Date(h.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Experience */}
          {profile?.experience && profile.experience.length > 0 && (
            <div className="bg-surface rounded-card border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Experience</h3>
              {profile.experience.map(exp => (
                <div key={exp.id} className="mb-3 last:mb-0">
                  <p className="text-sm font-medium text-foreground">{exp.title}</p>
                  <p className="text-xs text-muted">{exp.company} • {exp.startDate} — {exp.current ? 'Present' : exp.endDate}</p>
                  <p className="text-xs text-secondary mt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {profile?.education && profile.education.length > 0 && (
            <div className="bg-surface rounded-card border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Education</h3>
              {profile.education.map(edu => (
                <div key={edu.id} className="mb-2 last:mb-0">
                  <p className="text-sm font-medium text-foreground">{edu.degree} in {edu.field}</p>
                  <p className="text-xs text-muted">{edu.institution} {edu.grade ? `• ${edu.grade}` : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
