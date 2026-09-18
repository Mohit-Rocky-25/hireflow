// HireFlow — Company Team
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Users, Plus, Mail } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function CompanyTeam() {
  const { currentCompanyId, companyMembers, users, companies, register, addCompanyMember } = useStore();
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState<{ name: string; email: string; role: 'HR_RECRUITER' | 'INTERVIEWER' | 'BHR_MANAGER'; password: string }>({ name: '', email: '', role: 'HR_RECRUITER', password: 'demo123' });

  const members = companyMembers.filter(m => m.companyId === currentCompanyId);
  const company = companies.find(c => c.id === currentCompanyId);

  const handleInvite = () => {
    if (!invite.name || !invite.email || !currentCompanyId) return;
    const user = register({ displayName: invite.name, email: invite.email, role: invite.role as any, companyId: currentCompanyId }, invite.password);
    addCompanyMember({ userId: user.id, companyId: currentCompanyId, role: invite.role as any, permissions: invite.role === 'INTERVIEWER' ? ['view_assigned_interviews'] : ['view_jobs', 'view_applications'] });
    // Re-login as current user since register switches user
    const currentUser = useStore.getState().users.find(u => u.companyId === currentCompanyId && u.role === 'BHR_MANAGER');
    if (currentUser) useStore.setState({ currentUser, isAuthenticated: true });
    toast('success', `${invite.name} added as ${invite.role.replace('_', ' ')}`);
    setInvite({ name: '', email: '', role: 'HR_RECRUITER', password: 'demo123' });
    setShowInvite(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-foreground">Company Team</h1><p className="text-sm text-muted">{company?.name}</p></div>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all flex items-center gap-2"><Plus className="w-4 h-4" />Invite Member</button>
      </div>

      {showInvite && (
        <div className="bg-surface rounded-card border border-border p-5 animate-scale-in">
          <h3 className="text-sm font-semibold text-foreground mb-4">Invite Team Member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={invite.name} onChange={e => setInvite(i => ({ ...i, name: e.target.value }))} placeholder="Full name" className="px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
            <input value={invite.email} onChange={e => setInvite(i => ({ ...i, email: e.target.value }))} placeholder="Email" type="email" className="px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
            <select value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value as any }))} className="px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none">
              <option value="HR_RECRUITER">HR Recruiter</option>
              <option value="INTERVIEWER">Interviewer</option>
              <option value="BHR_MANAGER">BHR Manager</option>
            </select>
            <div className="flex gap-2">
              <button onClick={handleInvite} className="flex-1 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-btn hover:bg-primary-hover transition-all">Add</button>
              <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 border border-border text-sm rounded-btn hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-card border border-border">
        {members.map(mem => {
          const user = users.find(u => u.id === mem.userId);
          return (
            <div key={mem.id} className="flex items-center justify-between px-5 py-4 border-b border-border last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                  {user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user?.displayName}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-gray-100 text-muted text-xs font-medium rounded-full capitalize">{mem.role.replace('_', ' ')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
