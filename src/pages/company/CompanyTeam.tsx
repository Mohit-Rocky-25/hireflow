import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Users, Plus, Building2, ShieldAlert } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function CompanyTeam() {
  const { currentCompanyId, companyMembers, users, companies, register, addCompanyMember, currentUser } = useStore();
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState<{ name: string; email: string; role: 'HR_RECRUITER' | 'INTERVIEWER' | 'BHR_MANAGER'; password: string }>({ name: '', email: '', role: 'HR_RECRUITER', password: 'demo123' });

  // Only BHR Manager can view this page
  if (currentUser?.role !== 'BHR_MANAGER') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <ShieldAlert className="w-12 h-12 text-danger mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Access Restricted</h2>
        <p className="text-sm text-muted max-w-md">
          Only Business HR Managers have permission to view the company hiring plan and manage team members.
        </p>
      </div>
    );
  }

  const members = companyMembers.filter(m => m.companyId === currentCompanyId);
  const company = companies.find(c => c.id === currentCompanyId);

  const handleInvite = () => {
    if (!invite.name || !invite.email || !currentCompanyId) return;
    const user = register({ displayName: invite.name, email: invite.email, role: invite.role as any, companyId: currentCompanyId }, invite.password);
    addCompanyMember({ userId: user.id, companyId: currentCompanyId, role: invite.role as any, permissions: invite.role === 'INTERVIEWER' ? ['view_assigned_interviews'] : ['view_jobs', 'view_applications'] });
    
    const curr = useStore.getState().users.find(u => u.companyId === currentCompanyId && u.role === 'BHR_MANAGER');
    if (curr) useStore.setState({ currentUser: curr, isAuthenticated: true });
    
    toast('success', `${invite.name} added as ${invite.role.replace('_', ' ')}`);
    setInvite({ name: '', email: '', role: 'HR_RECRUITER', password: 'demo123' });
    setShowInvite(false);
  };

  // Mock Hiring Plan for BHR Manager
  const hiringPlan = [
    { dept: 'Engineering', planned: 45, filled: 32 },
    { dept: 'Product', planned: 12, filled: 8 },
    { dept: 'Design', planned: 8, filled: 7 },
    { dept: 'Marketing', planned: 15, filled: 5 },
    { dept: 'Sales', planned: 30, filled: 12 },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Hiring Plan & Team</h1>
          <p className="text-sm text-muted">{company?.name} • BHR Manager Access Only</p>
        </div>
      </div>

      {/* Hiring Plan Section */}
      <div className="bg-surface rounded-card border border-border shadow-sm p-6">
        <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Headcount Plan (FY 2026)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hiringPlan.map(plan => {
            const percent = Math.round((plan.filled / plan.planned) * 100);
            return (
              <div key={plan.dept} className="p-4 rounded-xl border border-border bg-surface-2 hover:border-primary/30 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-bold text-foreground">{plan.dept}</span>
                  <span className="text-[11px] font-semibold text-text-muted">{plan.filled} / {plan.planned} filled</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${percent >= 90 ? 'bg-success' : percent >= 50 ? 'bg-primary' : 'bg-warning'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="bg-surface rounded-card border border-border shadow-sm">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Internal Hiring Team
          </h2>
          <button onClick={() => setShowInvite(true)} className="px-3 py-1.5 bg-black-btn text-white text-[12px] font-semibold rounded-btn hover:bg-black-hover transition-all flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Invite Member
          </button>
        </div>

        {showInvite && (
          <div className="bg-surface-2 border-b border-border p-5 animate-scale-in">
            <h3 className="text-[13px] font-bold text-foreground mb-3">Invite New Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={invite.name} onChange={e => setInvite(i => ({ ...i, name: e.target.value }))} placeholder="Full name" className="px-3 py-2 border border-border rounded-btn text-xs focus:border-primary outline-none bg-surface" />
              <input value={invite.email} onChange={e => setInvite(i => ({ ...i, email: e.target.value }))} placeholder="Email" type="email" className="px-3 py-2 border border-border rounded-btn text-xs focus:border-primary outline-none bg-surface" />
              <select value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value as any }))} className="px-3 py-2 border border-border rounded-btn text-xs focus:border-primary outline-none bg-surface">
                <option value="HR_RECRUITER">HR Recruiter</option>
                <option value="INTERVIEWER">Interviewer</option>
                <option value="BHR_MANAGER">BHR Manager</option>
              </select>
              <div className="flex gap-2">
                <button onClick={handleInvite} className="flex-1 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover transition-all">Add Member</button>
                <button onClick={() => setShowInvite(false)} className="px-4 py-2 border border-border text-xs rounded-btn hover:bg-gray-100 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-border">
          {members.map(mem => {
            const user = users.find(u => u.id === mem.userId);
            return (
              <div key={mem.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-light/50 border border-primary/20 flex items-center justify-center text-primary text-[14px] font-bold">
                    {user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-foreground">{user?.displayName}</p>
                    <p className="text-[12px] text-muted">{user?.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${
                  mem.role === 'BHR_MANAGER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  mem.role === 'HR_RECRUITER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {mem.role.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
