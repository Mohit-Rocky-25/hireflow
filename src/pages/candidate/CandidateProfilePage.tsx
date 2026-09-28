// ============================================================
// HireFlow — Candidate Profile Settings & Information
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Save, Plus, X } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function CandidateProfilePage() {
  const { currentUser, candidateProfiles, updateProfile, updateCandidateProfile } = useStore();
  const profile = candidateProfiles.find(p => p.userId === currentUser?.id);

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

  return (
    <div className="space-y-[32px] animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-[24px] font-bold text-text mb-[4px] tracking-[-0.01em]">Candidate Profile</h1>
        <p className="text-[14px] text-text-secondary">Keep your professional bio and contact details up-to-date.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-[24px]">
        {/* Personal Details */}
        <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm space-y-[24px]">
          <h2 className="text-[16px] font-bold text-text flex items-center gap-[10px]">
            <div className="w-[32px] h-[32px] rounded-lg bg-primary-light border border-primary/20 flex items-center justify-center">
              <User className="w-[16px] h-[16px] text-primary" />
            </div>
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <div>
              <label className="block text-[13px] font-semibold text-text mb-[8px]">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-text mb-[8px]">Email Address <span className="text-text-muted font-normal">(Read Only)</span></label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full h-[44px] px-[16px] text-[14px] text-text-muted rounded-xl bg-surface-3 border border-border cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-text mb-[8px]">Phone Number</label>
              <div className="relative">
                <Phone className="w-[16px] h-[16px] text-text-muted absolute left-[16px] top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full h-[44px] pl-[44px] pr-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-text mb-[8px]">Location</label>
              <div className="relative">
                <MapPin className="w-[16px] h-[16px] text-text-muted absolute left-[16px] top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full h-[44px] pl-[44px] pr-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text mb-[8px]">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer | React & TypeScript Enthusiast"
              className="w-full h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text mb-[8px]">Bio / Summary</label>
            <textarea
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Tell hiring managers about your background, career achievements, and interests..."
              className="w-full px-[16px] py-[12px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[100px]"
            />
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="bg-surface rounded-2xl border border-border p-[32px] shadow-sm space-y-[20px]">
          <div>
            <h2 className="text-[16px] font-bold text-text flex items-center gap-[10px]">
              <div className="w-[32px] h-[32px] rounded-lg bg-ai-light border border-ai/20 flex items-center justify-center">
                <GraduationCap className="w-[16px] h-[16px] text-ai" />
              </div>
              Skills & Specializations
            </h2>
            <p className="text-[13px] text-text-secondary mt-[6px] ml-[42px]">Add relevant skills to improve your AI match rate. Press Enter to add.</p>
          </div>

          <div className="flex gap-[12px] ml-[42px]">
            <input
              type="text"
              placeholder="e.g. React, Docker, Python..."
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="flex-1 h-[44px] px-[16px] text-[14px] text-text rounded-xl bg-surface-2 border border-border focus:outline-none focus:ring-2 focus:ring-ai focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => {
                if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                  setSkills([...skills, skillInput.trim()]);
                  setSkillInput('');
                }
              }}
              className="h-[44px] px-[20px] bg-surface-2 text-text text-[13px] font-bold rounded-xl border border-border hover:border-border-strong hover:bg-surface-3 transition-all flex items-center gap-[6px]"
            >
              <Plus className="w-[14px] h-[14px]" /> Add
            </button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-[8px] ml-[42px]">
              {skills.map(s => (
                <span
                  key={s}
                  className="inline-flex items-center gap-[6px] px-[12px] py-[6px] bg-ai-light text-ai text-[12px] font-bold rounded-full border border-ai/20"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-danger hover:bg-danger-bg rounded-full p-[2px] transition-colors focus:outline-none"
                  >
                    <X className="w-[12px] h-[12px]" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-[12px]">
          <button
            type="submit"
            className="h-[44px] px-[24px] bg-gradient-to-r from-primary to-primary-hover text-white text-[14px] font-bold rounded-xl shadow-glow-orange hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-[8px]"
          >
            <Save className="w-[16px] h-[16px]" /> Save Profile Updates
          </button>
        </div>
      </form>
    </div>
  );
}
