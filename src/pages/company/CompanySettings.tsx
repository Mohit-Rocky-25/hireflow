// ============================================================
// HireFlow — Enhanced Company Settings
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Settings, Save, Building2, Globe, MapPin, Users,
  Bell, Shield, Palette, CheckCircle, Zap
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

const SECTIONS = [
  { id: 'profile', label: 'Company Profile', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'ai', label: 'AI Screening', icon: Zap },
];

export function CompanySettings() {
  const { currentCompanyId, companies, updateCompany, currentUser } = useStore();
  const company = companies.find(c => c.id === currentCompanyId);

  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: company?.name || '',
    description: company?.description || '',
    industry: company?.industry || '',
    location: company?.location || '',
    website: company?.website || '',
    size: company?.size || '',
  });

  const [notifSettings, setNotifSettings] = useState({
    newApplication: true,
    statusChange: true,
    interviewReminder: true,
    feedbackSubmitted: true,
    weeklyDigest: false,
  });

  const [aiSettings, setAiSettings] = useState({
    autoScreening: true,
    autoShortlist: false,
    minimumScore: 60,
    requireEvidence: true,
    aiExplanations: true,
  });

  const handleSave = () => {
    if (!currentCompanyId) return;
    updateCompany(currentCompanyId, {
      name: form.name.trim(),
      description: form.description.trim(),
      industry: form.industry.trim(),
      location: form.location.trim(),
      website: form.website.trim() || undefined,
      size: form.size,
    });
    setSaved(true);
    toast('success', 'Settings saved successfully!');
    setTimeout(() => setSaved(false), 3000);
  };

  const inputCls = 'w-full px-3 py-2.5 border border-border rounded-btn text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface';
  const labelCls = 'block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5';

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
        <p className="text-muted text-sm">No company profile found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Company Settings
          </h1>
          <p className="text-sm text-muted mt-0.5">Manage {company.name}'s profile and configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm"
        >
          {saved ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Company Identity Card */}
      <div className="bg-gradient-to-r from-primary to-indigo-700 rounded-card p-6 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shrink-0">
          {company.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold">{company.name}</p>
          <p className="text-blue-100 text-sm">{company.industry} • {company.location} • {company.size}</p>
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-200 text-xs hover:text-white flex items-center gap-1 mt-1">
              <Globe className="w-3 h-3" /> {company.website}
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-48 shrink-0 space-y-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all text-left ${
                  activeSection === s.id ? 'bg-primary-light text-primary' : 'text-secondary hover:bg-gray-50 hover:text-foreground'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeSection === s.id ? 'text-primary' : 'text-muted'}`} />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <div className="flex-1 bg-surface rounded-card border border-border p-6 space-y-6">
          {/* Company Profile */}
          {activeSection === 'profile' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Company Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Company Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Industry</label>
                  <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} className={inputCls}>
                    {['Technology', 'Finance', 'Healthcare', 'Education', 'E-commerce', 'SaaS', 'Consulting', 'Manufacturing', 'Media', 'Other'].map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Company Size</label>
                  <select value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className={inputCls}>
                    {['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'].map(opt => (
                      <option key={opt} value={opt}>{opt} employees</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputCls + ' pl-9'} placeholder="City, Country" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className={inputCls + ' pl-9'} placeholder="https://yourcompany.com" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Company Description</label>
                  <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls + ' resize-none'} placeholder="Describe your company culture, mission, and values..." />
                </div>
              </div>
            </>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Notification Preferences</h2>
              <div className="space-y-5">
                {[
                  { key: 'newApplication', label: 'New Application Received', desc: 'Get notified when a candidate applies to any open role' },
                  { key: 'statusChange', label: 'Application Status Change', desc: 'Notifications when application stages are updated' },
                  { key: 'interviewReminder', label: 'Interview Reminders', desc: 'Reminders 1 hour before scheduled interviews' },
                  { key: 'feedbackSubmitted', label: 'Interviewer Feedback', desc: 'Alert when an interviewer submits their evaluation' },
                  { key: 'weeklyDigest', label: 'Weekly Hiring Summary', desc: 'Weekly email digest of your hiring pipeline status' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifSettings[item.key as keyof typeof notifSettings]}
                      onChange={v => setNotifSettings(n => ({ ...n, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Security & Access Control</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-btn flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-success">Multi-tenant security is active</p>
                    <p className="text-xs text-success/80">Row-level isolation ensures your data is completely separate from other companies.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-border rounded-btn">
                    <p className="text-xs font-semibold text-muted uppercase mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-foreground">4</p>
                    <p className="text-xs text-muted mt-1">1 BHR Manager, 1 Recruiter, 2 Interviewers</p>
                  </div>
                  <div className="p-4 border border-border rounded-btn">
                    <p className="text-xs font-semibold text-muted uppercase mb-1">Last Login</p>
                    <p className="text-sm font-bold text-foreground">{currentUser?.displayName}</p>
                    <p className="text-xs text-muted mt-1">Just now</p>
                  </div>
                </div>
                <div className="p-4 border border-border rounded-btn">
                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted" /> Role Permissions
                  </p>
                  {[
                    { role: 'BHR Manager', perms: 'Full access: jobs, candidates, team, settings, analytics' },
                    { role: 'HR Recruiter', perms: 'Create/manage jobs, view candidates, view analytics' },
                    { role: 'Interviewer', perms: 'View assigned interviews only, submit feedback' },
                  ].map((r, i) => (
                    <div key={i} className="py-2.5 border-b border-border/50 last:border-b-0">
                      <p className="text-xs font-bold text-foreground">{r.role}</p>
                      <p className="text-xs text-muted mt-0.5">{r.perms}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* AI Screening */}
          {activeSection === 'ai' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-ai" /> AI Screening Configuration
              </h2>
              <div className="mb-5">
                <label className={labelCls}>Minimum Match Score (%)</label>
                <input
                  type="range" min="0" max="100"
                  value={aiSettings.minimumScore}
                  onChange={e => setAiSettings(a => ({ ...a, minimumScore: Number(e.target.value) }))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>0% — Everyone</span>
                  <span className="font-bold text-primary">{aiSettings.minimumScore}% threshold</span>
                  <span>100% — Perfect match</span>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'autoScreening', label: 'Automatic AI Screening', desc: 'Run AI analysis on every application immediately upon submission' },
                  { key: 'autoShortlist', label: 'Auto-Shortlist Above Threshold', desc: 'Automatically move high-scoring candidates to shortlisted status' },
                  { key: 'requireEvidence', label: 'Require Evidence', desc: 'Only surface match reasons backed by resume evidence' },
                  { key: 'aiExplanations', label: 'AI Explanations for Candidates', desc: 'Allow candidates to see their AI match score and reasons' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={aiSettings[item.key as keyof typeof aiSettings] as boolean}
                      onChange={v => setAiSettings(a => ({ ...a, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
