// ============================================================
// HireFlow — Admin Platform Settings
// ============================================================
import { useState } from 'react';
import { Settings, Shield, Bell, Brain, Globe, Save, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: SettingSection[] = [
  { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  { id: 'ai', label: 'AI Configuration', icon: <Brain className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Globe className="w-4 h-4" /> },
];

export function AdminSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    platformName: 'HireFlow',
    supportEmail: 'support@hireflow.io',
    maxCompanies: 100,
    maxUsersPerCompany: 50,
    maintenanceMode: false,
    allowNewRegistrations: true,
  });

  const [ai, setAi] = useState({
    provider: 'openai',
    model: 'gpt-4o-mini',
    defaultThreshold: 60,
    autoShortlistEnabled: false,
    evidenceExplanations: true,
    maxTokensPerAnalysis: 2000,
  });

  const [security, setSecurity] = useState({
    mfaRequired: false,
    sessionTimeoutHours: 24,
    passwordMinLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    auditLogRetentionDays: 90,
  });

  const [notifications, setNotifications] = useState({
    emailOnNewApplication: true,
    emailOnStatusChange: true,
    emailOnInterviewScheduled: true,
    emailOnFeedbackSubmitted: true,
    digestFrequency: 'daily',
  });

  const handleSave = () => {
    setSaved(true);
    toast('success', 'Platform settings saved successfully');
    setTimeout(() => setSaved(false), 3000);
  };

  const inputCls = 'px-3 py-2 border border-border rounded-btn text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface w-full';
  const labelCls = 'block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5';

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Platform Settings
          </h1>
          <p className="text-sm text-muted mt-0.5">System-wide configuration and governance controls</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm"
        >
          {saved ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <nav className="w-48 shrink-0 space-y-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all text-left ${
                activeSection === s.id ? 'bg-primary-light text-primary' : 'text-secondary hover:bg-gray-50 hover:text-foreground'
              }`}
            >
              <span className={activeSection === s.id ? 'text-primary' : 'text-muted'}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Settings Panel */}
        <div className="flex-1 bg-surface rounded-card border border-border p-6 space-y-6">
          {/* General */}
          {activeSection === 'general' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">General Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Platform Name</label>
                  <input type="text" value={general.platformName} onChange={e => setGeneral(g => ({ ...g, platformName: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Support Email</label>
                  <input type="email" value={general.supportEmail} onChange={e => setGeneral(g => ({ ...g, supportEmail: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Companies</label>
                  <input type="number" value={general.maxCompanies} onChange={e => setGeneral(g => ({ ...g, maxCompanies: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Max Users per Company</label>
                  <input type="number" value={general.maxUsersPerCompany} onChange={e => setGeneral(g => ({ ...g, maxUsersPerCompany: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <div className="space-y-4 pt-2 border-t border-border">
                {[
                  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily restrict platform access for all users' },
                  { key: 'allowNewRegistrations', label: 'Allow New Registrations', desc: 'Let new companies and candidates sign up' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={general[item.key as keyof typeof general] as boolean}
                      onChange={v => setGeneral(g => ({ ...g, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
              {general.maintenanceMode && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-btn">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">Maintenance mode is active. Regular users cannot access the platform.</p>
                </div>
              )}
            </>
          )}

          {/* AI Configuration */}
          {activeSection === 'ai' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-ai" /> AI Configuration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>AI Provider</label>
                  <select value={ai.provider} onChange={e => setAi(a => ({ ...a, provider: e.target.value }))} className={inputCls}>
                    <option value="openai">OpenAI (GPT)</option>
                    <option value="google">Google (Gemini)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="mock">Mock Provider (Dev)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Model</label>
                  <select value={ai.model} onChange={e => setAi(a => ({ ...a, model: e.target.value }))} className={inputCls}>
                    <option value="gpt-4o-mini">gpt-4o-mini (fast)</option>
                    <option value="gpt-4o">gpt-4o (smart)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="claude-3-haiku">claude-3-haiku</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Default Match Threshold (%)</label>
                  <input type="range" min="0" max="100" value={ai.defaultThreshold} onChange={e => setAi(a => ({ ...a, defaultThreshold: Number(e.target.value) }))} className="w-full" />
                  <p className="text-xs text-muted mt-1 text-right">{ai.defaultThreshold}% minimum score to proceed</p>
                </div>
                <div>
                  <label className={labelCls}>Max Tokens per Analysis</label>
                  <input type="number" value={ai.maxTokensPerAnalysis} onChange={e => setAi(a => ({ ...a, maxTokensPerAnalysis: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <div className="space-y-4 pt-2 border-t border-border">
                {[
                  { key: 'autoShortlistEnabled', label: 'Auto-Shortlist', desc: 'Automatically shortlist candidates above the threshold' },
                  { key: 'evidenceExplanations', label: 'Evidence Explanations', desc: 'Generate detailed match/gap explanations for HR review' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={ai[item.key as keyof typeof ai] as boolean}
                      onChange={v => setAi(a => ({ ...a, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Security Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Session Timeout (hours)</label>
                  <input type="number" value={security.sessionTimeoutHours} onChange={e => setSecurity(s => ({ ...s, sessionTimeoutHours: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Minimum Password Length</label>
                  <input type="number" value={security.passwordMinLength} onChange={e => setSecurity(s => ({ ...s, passwordMinLength: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Audit Log Retention (days)</label>
                  <input type="number" value={security.auditLogRetentionDays} onChange={e => setSecurity(s => ({ ...s, auditLogRetentionDays: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <div className="space-y-4 pt-2 border-t border-border">
                {[
                  { key: 'mfaRequired', label: 'Require MFA', desc: 'Enforce multi-factor authentication for all users' },
                  { key: 'requireUppercase', label: 'Require Uppercase', desc: 'Passwords must contain at least one uppercase letter' },
                  { key: 'requireNumbers', label: 'Require Numbers', desc: 'Passwords must contain at least one number' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={security[item.key as keyof typeof security] as boolean}
                      onChange={v => setSecurity(s => ({ ...s, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Notification Settings</h2>
              <div className="mb-4">
                <label className={labelCls}>Digest Frequency</label>
                <select value={notifications.digestFrequency} onChange={e => setNotifications(n => ({ ...n, digestFrequency: e.target.value }))} className={inputCls} style={{ width: 'fit-content' }}>
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>
              <div className="space-y-4 border-t border-border pt-4">
                {[
                  { key: 'emailOnNewApplication', label: 'New Application', desc: 'Notify HR when a new application is received' },
                  { key: 'emailOnStatusChange', label: 'Status Change', desc: 'Notify candidates when their application status changes' },
                  { key: 'emailOnInterviewScheduled', label: 'Interview Scheduled', desc: 'Notify interviewer and candidate when interview is set' },
                  { key: 'emailOnFeedbackSubmitted', label: 'Feedback Submitted', desc: 'Notify BHR when interviewer submits evaluation' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifications[item.key as keyof typeof notifications] as boolean}
                      onChange={v => setNotifications(n => ({ ...n, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <>
              <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Integrations</h2>
              <div className="space-y-4">
                {[
                  { name: 'Slack', desc: 'Send hiring notifications to Slack channels', status: 'not_connected', icon: '💬' },
                  { name: 'Google Calendar', desc: 'Sync interview schedules to Google Calendar', status: 'not_connected', icon: '📅' },
                  { name: 'Greenhouse ATS', desc: 'Bi-directional sync with Greenhouse', status: 'coming_soon', icon: '🌱' },
                  { name: 'LinkedIn Jobs', desc: 'Post jobs directly to LinkedIn', status: 'coming_soon', icon: '💼' },
                  { name: 'Zoom', desc: 'Auto-generate Zoom links for video interviews', status: 'not_connected', icon: '📹' },
                ].map((integration, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-border rounded-btn">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{integration.name}</p>
                        <p className="text-xs text-muted">{integration.desc}</p>
                      </div>
                    </div>
                    {integration.status === 'coming_soon' ? (
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-muted rounded-full">Coming Soon</span>
                    ) : (
                      <button className="px-4 py-1.5 text-xs font-semibold border border-border rounded-btn hover:bg-gray-50 transition-colors">
                        Connect
                      </button>
                    )}
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
