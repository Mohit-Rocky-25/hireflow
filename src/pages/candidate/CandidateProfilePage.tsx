// ============================================================
// HireFlow — Candidate Profile Settings & Dashboard
// Premium layout with Tabs, Skill Matrix, and Applications Tracker
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save, Plus, X, BarChart3, ListTodo, Settings2, Target, Zap, Clock } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

type Tab = 'overview' | 'applications' | 'edit';

export function CandidateProfilePage() {
  const { currentUser, candidateProfiles, updateProfile, updateCandidateProfile } = useStore();
  const profile = candidateProfiles.find(p => p.userId === currentUser?.id);

  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Form State
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [summary, setSummary] = useState(profile?.summary || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  if (!currentUser || !profile) return null;

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ displayName });
    updateCandidateProfile(profile.id, {
      headline,
      summary,
      phone,
      location,
      skills,
    });
    toast('success', 'Profile updated successfully!');
  };

  // Mock Data for "Overview" & "Applications"
  const proficiencyLevels = [
    { skill: 'React / Next.js', level: 90 },
    { skill: 'TypeScript', level: 85 },
    { skill: 'Node.js', level: 75 },
    { skill: 'System Design', level: 60 },
    { skill: 'AWS / Cloud', level: 70 },
  ];

  const mockApplications = [
    { id: 1, role: 'Senior Frontend Engineer', company: 'Tata Motors', status: 'Technical Interview', date: 'Oct 1, 2026', color: 'bg-primary' },
    { id: 2, role: 'Full Stack Developer', company: 'Wipro', status: 'Screening', date: 'Sep 28, 2026', color: 'bg-warning' },
    { id: 3, role: 'Software Development Engineer II', company: 'Airtel', status: 'Offer Received', date: 'Sep 25, 2026', color: 'bg-success' },
  ];

  return (
    <div className="space-y-[32px] animate-fade-in max-w-[1000px] mx-auto">
      
      {/* Header Profile Card */}
      <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm flex items-start gap-[24px] relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-glow rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-20 pointer-events-none" />
        
        <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center text-[32px] font-extrabold shadow-glow-orange shrink-0 z-10">
          {currentUser.displayName.substring(0, 2).toUpperCase()}
        </div>
        
        <div className="flex-1 z-10">
          <h1 className="text-[28px] font-bold text-text tracking-tight mb-[4px]">{currentUser.displayName}</h1>
          <p className="text-[15px] font-medium text-text-secondary mb-[16px]">{profile.headline || 'Add a professional headline'}</p>
          
          <div className="flex flex-wrap gap-[16px]">
            <div className="flex items-center gap-[6px] text-[13px] text-text-muted">
              <Mail className="w-[14px] h-[14px]" /> {currentUser.email}
            </div>
            {profile.location && (
              <div className="flex items-center gap-[6px] text-[13px] text-text-muted">
                <MapPin className="w-[14px] h-[14px]" /> {profile.location}
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-[6px] text-[13px] text-text-muted">
                <Phone className="w-[14px] h-[14px]" /> {profile.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[8px] border-b border-border pb-[16px]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-[16px] py-[8px] rounded-lg text-[14px] font-semibold transition-all flex items-center gap-[8px] ${activeTab === 'overview' ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-surface-2 hover:text-text'}`}
        >
          <BarChart3 className="w-[16px] h-[16px]" /> AI Overview
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-[16px] py-[8px] rounded-lg text-[14px] font-semibold transition-all flex items-center gap-[8px] ${activeTab === 'applications' ? 'bg-ai-light text-ai' : 'text-text-secondary hover:bg-surface-2 hover:text-text'}`}
        >
          <ListTodo className="w-[16px] h-[16px]" /> Applications
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-[16px] py-[8px] rounded-lg text-[14px] font-semibold transition-all flex items-center gap-[8px] ${activeTab === 'edit' ? 'bg-surface-2 text-text border border-border shadow-sm' : 'text-text-secondary hover:bg-surface-2 hover:text-text'}`}
        >
          <Settings2 className="w-[16px] h-[16px]" /> Edit Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] animate-fade-in">
            {/* Skill Matrix */}
            <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm">
              <h2 className="text-[16px] font-bold text-text flex items-center gap-[8px] mb-[24px]">
                <Zap className="w-[18px] h-[18px] text-warning" /> Skill Proficiency Matrix
              </h2>
              <div className="space-y-[16px]">
                {proficiencyLevels.map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[13px] font-semibold text-text mb-[6px]">
                      <span>{p.skill}</span>
                      <span className="text-text-muted">{p.level}%</span>
                    </div>
                    <div className="w-full h-[6px] bg-surface-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-ai rounded-full animate-loading-bar" 
                        style={{ width: `${p.level}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights & Matches */}
            <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm">
              <h2 className="text-[16px] font-bold text-text flex items-center gap-[8px] mb-[24px]">
                <Target className="w-[18px] h-[18px] text-ai" /> Profile AI Insights
              </h2>
              <div className="space-y-[16px]">
                <div className="p-[16px] bg-ai-light rounded-xl border border-ai/20">
                  <p className="text-[14px] text-ai-dark font-medium leading-[22px]">
                    Your profile matches strongly with **Frontend Architecture** roles. Adding more keywords related to "System Design" will boost your match rate for Senior positions by 24%.
                  </p>
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-text mb-[12px] uppercase tracking-wider">Detected Skills</h3>
                  <div className="flex flex-wrap gap-[8px]">
                    {skills.length > 0 ? skills.map((s, i) => (
                      <span key={i} className="px-[12px] py-[4px] bg-surface-2 text-text text-[12px] font-bold rounded-md border border-border">
                        {s}
                      </span>
                    )) : (
                      <span className="text-[13px] text-text-muted">No skills added yet. Go to Edit Profile to add some!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="animate-fade-in bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-[24px] border-b border-border bg-surface-2/50 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-text flex items-center gap-[8px]">
                <Briefcase className="w-[18px] h-[18px] text-primary" /> Active Applications
              </h2>
            </div>
            <div className="divide-y divide-border">
              {mockApplications.map((app) => (
                <div key={app.id} className="p-[24px] hover:bg-surface-2 transition-colors flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold text-text mb-[4px]">{app.role}</h3>
                    <div className="flex items-center gap-[12px] text-[13px] text-text-muted font-medium">
                      <span className="flex items-center gap-[4px] text-text"><Briefcase className="w-[14px] h-[14px]"/> {app.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-[4px]"><Clock className="w-[14px] h-[14px]"/> Applied: {app.date}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-[8px]">
                    <span className={`px-[12px] py-[4px] rounded-full text-[12px] font-bold text-white shadow-sm ${app.color}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT TAB */}
        {activeTab === 'edit' && (
          <form onSubmit={handleSubmit} className="space-y-[24px] animate-fade-in">
            {/* Personal Details */}
            <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm space-y-[24px]">
              <h2 className="text-[16px] font-bold text-text flex items-center gap-[10px]">
                <User className="w-[18px] h-[18px] text-text-secondary" /> Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                <div>
                  <label className="block text-[13px] font-semibold text-text mb-[8px]">Full Name</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all" required />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-text mb-[8px]">Email Address <span className="text-text-muted font-normal">(Read Only)</span></label>
                  <input type="email" value={currentUser.email} disabled className="w-full h-[44px] px-[16px] text-[14px] text-text-muted rounded-xl bg-surface-3 border border-border cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-text mb-[8px]">Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-text mb-[8px]">Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" className="w-full h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text mb-[8px]">Professional Headline</label>
                <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Senior Frontend Engineer | React & TypeScript Enthusiast" className="w-full h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-text mb-[8px]">Bio / Summary</label>
                <textarea rows={4} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Tell hiring managers about your background, career achievements, and interests..." className="w-full px-[16px] py-[12px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[100px]" />
              </div>
            </div>

            {/* Skills Tag Management */}
            <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm space-y-[20px]">
              <div>
                <h2 className="text-[16px] font-bold text-text flex items-center gap-[10px]">
                  <GraduationCap className="w-[18px] h-[18px] text-text-secondary" /> Skills & Specializations
                </h2>
                <p className="text-[13px] text-text-secondary mt-[6px]">Add relevant skills to improve your AI match rate.</p>
              </div>

              <div className="flex gap-[12px]">
                <input type="text" placeholder="e.g. React, Docker, Python..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} className="flex-1 h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:ring-2 focus:ring-ai focus:border-transparent transition-all" />
                <button type="button" onClick={() => { if (skillInput.trim() && !skills.includes(skillInput.trim())) { setSkills([...skills, skillInput.trim()]); setSkillInput(''); } }} className="h-[44px] px-[20px] bg-surface-2 text-text text-[13px] font-bold rounded-xl border border-border hover:border-border-strong hover:bg-surface-3 transition-all flex items-center gap-[6px]">
                  <Plus className="w-[14px] h-[14px]" /> Add
                </button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-[8px]">
                  {skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-[6px] px-[12px] py-[6px] bg-ai-light text-ai text-[12px] font-bold rounded-full border border-ai/20">
                      {s}
                      <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-danger hover:bg-danger-bg rounded-full p-[2px] transition-colors focus:outline-none"><X className="w-[12px] h-[12px]" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-[12px]">
              <button type="submit" className="h-[44px] px-[24px] bg-gradient-to-r from-primary to-primary-hover text-white text-[14px] font-bold rounded-xl shadow-glow-orange hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-[8px]">
                <Save className="w-[16px] h-[16px]" /> Save Profile Updates
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
