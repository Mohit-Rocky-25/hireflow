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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Candidate Profile</h1>
        <p className="text-sm text-muted">Keep your professional bio and contact details up-to-date.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-surface rounded-card border border-border p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Email (Read Only)</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3 py-2 text-sm rounded-btn border border-border bg-gray-50 text-muted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Professional Headline</label>
            <input
              type="text"
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer | React & TypeScript Enthusiast"
              className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Bio / Summary</label>
            <textarea
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Tell hiring managers about your background, career achievements, and interests..."
              className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="bg-surface rounded-card border border-border p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">Skills & Specializations</h2>
          <p className="text-xs text-muted">Type a skill name and press Enter to add it.</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Docker, GraphQL, Python)..."
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="flex-1 px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => {
                if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                  setSkills([...skills, skillInput.trim()]);
                  setSkillInput('');
                }
              }}
              className="px-4 py-2 bg-gray-100 text-foreground text-xs font-semibold rounded-btn hover:bg-gray-200"
            >
              <Plus className="w-4 h-4 inline" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary text-xs font-semibold rounded-full border border-blue-200"
              >
                {s}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="hover:text-danger focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-all"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
