// ============================================================
// HireFlow — Interviewer Profile Page
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { User, Mail, Phone, MapPin, Briefcase, Star, Calendar, Save, CheckCircle, Award } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function InterviewerProfile() {
  const { currentUser, interviews, updateProfile } = useStore();

  const myInterviews = interviews.filter(i => i.interviewerId === currentUser?.id);
  const completed = myInterviews.filter(i => i.status === 'completed');
  const upcoming = myInterviews.filter(i => i.status === 'scheduled');
  const withFeedback = completed.filter(i => i.feedback);
  
  const avgRating = withFeedback.length > 0
    ? ((withFeedback.reduce((sum, i) => {
        const f = i.feedback!;
        return sum + (f.technicalKnowledge + f.problemSolving + f.communication + f.roleSpecific) / 4;
      }, 0)) / withFeedback.length).toFixed(1)
    : '—';

  const [form, setForm] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    location: '',
    bio: '',
    expertise: 'Frontend Development',
    yearsExp: '5',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      updateProfile({ displayName: form.displayName });
      setSaving(false);
      toast('success', 'Profile updated successfully!');
    }, 600);
  };

  const inputCls = 'w-full px-3 py-2.5 border border-border rounded-btn text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface';
  const labelCls = 'block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5';

  if (!currentUser) return null;

  const initials = currentUser.displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted mt-0.5">Manage your interviewer profile and preferences</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Interviews', value: myInterviews.length, icon: Calendar, color: 'text-primary bg-primary-light' },
          { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'text-success bg-green-50' },
          { label: 'Upcoming', value: upcoming.length, icon: Briefcase, color: 'text-amber-600 bg-amber-50' },
          { label: 'Avg Rating Given', value: avgRating, icon: Star, color: 'text-ai bg-ai-light' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-btn ${s.color.split(' ')[1]} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface rounded-card border border-border p-6 text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto">
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-foreground">{currentUser.displayName}</p>
            <p className="text-xs text-muted mt-0.5">{currentUser.role.replace('_', ' ')}</p>
            <p className="text-xs text-muted">{currentUser.email}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {['React', 'Node.js', 'System Design', 'TypeScript'].map(skill => (
              <span key={skill} className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-medium rounded-full">
                {skill}
              </span>
            ))}
          </div>
          <div className="p-3 bg-ai-light rounded-btn border border-ai/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-ai" />
              <p className="text-xs font-bold text-ai">Top Interviewer</p>
            </div>
            <p className="text-[10px] text-muted">Completed {completed.length} evaluations</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface rounded-card border border-border p-6 space-y-5">
          <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Edit Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className={inputCls + ' pl-9'} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="email" value={form.email} readOnly className={inputCls + ' pl-9 opacity-60 cursor-not-allowed'} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls + ' pl-9'} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputCls + ' pl-9'} placeholder="City, Country" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Area of Expertise</label>
              <input type="text" value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Years of Experience</label>
              <input type="number" value={form.yearsExp} onChange={e => setForm(f => ({ ...f, yearsExp: e.target.value }))} className={inputCls} min="0" max="50" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Bio</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className={inputCls + ' resize-none'}
                placeholder="Brief description of your interviewing background and expertise..."
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Feedback History */}
      {withFeedback.length > 0 && (
        <div className="bg-surface rounded-card border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Evaluations Submitted</h2>
          </div>
          <div className="divide-y divide-border">
            {withFeedback.slice(0, 5).map(iv => {
              const f = iv.feedback!;
              const avg = ((f.technicalKnowledge + f.problemSolving + f.communication + f.roleSpecific) / 4).toFixed(1);
              return (
                <div key={iv.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{iv.stage}</p>
                    <p className="text-xs text-muted mt-0.5">{iv.scheduledDate} • Recommendation: <span className="font-medium">{f.recommendation.replace('_', ' ')}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <div key={s} className={`w-2 h-2 rounded-full ${s <= Math.round(Number(avg)) ? 'bg-primary' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-foreground">{avg}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
