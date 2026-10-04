import { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { Users, Plus, Building2, ShieldAlert, GripHorizontal, DollarSign, Activity, GitCommit } from 'lucide-react';
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

  // ── NEW: Org Chart Sandbox State ──
  const [sandboxMode, setSandboxMode] = useState(false);
  const [orgNodes, setOrgNodes] = useState([
    { id: 'ceo', role: 'CEO', dept: 'Executive', salary: 300000, type: 'filled', parent: null },
    { id: 'cto', role: 'CTO', dept: 'Engineering', salary: 250000, type: 'filled', parent: 'ceo' },
    { id: 'vp_prod', role: 'VP Product', dept: 'Product', salary: 220000, type: 'filled', parent: 'ceo' },
    { id: 'em_1', role: 'Engineering Manager', dept: 'Engineering', salary: 180000, type: 'filled', parent: 'cto' },
    { id: 'sde_1', role: 'Senior SDE', dept: 'Engineering', salary: 150000, type: 'filled', parent: 'em_1' },
    { id: 'sde_2', role: 'SDE II', dept: 'Engineering', salary: 120000, type: 'filled', parent: 'em_1' },
    { id: 'open_1', role: 'Staff Engineer (Req)', dept: 'Engineering', salary: 200000, type: 'open', parent: 'cto' },
  ]);
  
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('nodeId', id);
    setDraggedNode(id);
  };

  const handleDropNode = (e: React.DragEvent, targetParentId: string) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData('nodeId');
    if (nodeId && nodeId !== targetParentId) {
      // Prevent cyclical references (simplified check)
      const targetNode = orgNodes.find(n => n.id === targetParentId);
      if (targetNode?.parent !== nodeId) {
        setOrgNodes(nodes => nodes.map(n => n.id === nodeId ? { ...n, parent: targetParentId } : n));
        toast('success', 'Org chart restructured successfully.');
      } else {
        toast('error', 'Cannot drop a manager under their direct report.');
      }
    }
    setDraggedNode(null);
  };

  const addVirtualSeat = (parentId: string) => {
    const newId = `virtual_${Date.now()}`;
    setOrgNodes([...orgNodes, { id: newId, role: 'New Hire (Virtual)', dept: 'TBD', salary: 100000, type: 'virtual', parent: parentId }]);
    toast('info', 'Virtual seat added to Sandbox.');
  };

  const currentBurn = orgNodes.filter(n => n.type === 'filled').reduce((a, b) => a + b.salary, 0);
  const projectedBurn = orgNodes.reduce((a, b) => a + b.salary, 0);
  
  const renderOrgNode = (nodeId: string, level = 0) => {
    const node = orgNodes.find(n => n.id === nodeId);
    if (!node) return null;
    const children = orgNodes.filter(n => n.parent === nodeId);
    
    return (
      <div key={node.id} className={`flex flex-col ${level === 0 ? 'items-center' : 'items-start'} relative`}>
        <div 
          draggable={sandboxMode}
          onDragStart={(e) => handleDragStart(e, node.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => sandboxMode && handleDropNode(e, node.id)}
          className={`relative z-10 w-[220px] p-3 rounded-card border ${
            node.type === 'filled' ? 'bg-surface border-border' : 
            node.type === 'open' ? 'bg-blue-50 border-blue-200 border-dashed' : 
            'bg-purple-50 border-purple-300 border-dashed animate-pulse-slow'
          } shadow-sm transition-all ${sandboxMode ? 'cursor-grab hover:shadow-md hover:border-primary' : ''} ${
            draggedNode === node.id ? 'opacity-50' : ''
          }`}
        >
          {sandboxMode && (
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 text-muted cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripHorizontal className="w-4 h-4" />
            </div>
          )}
          <div className="flex justify-between items-start mb-1">
            <span className="text-[12px] font-bold text-foreground truncate pr-2">{node.role}</span>
            {sandboxMode && (
              <button onClick={() => addVirtualSeat(node.id)} className="shrink-0 p-1 bg-gray-100 hover:bg-primary hover:text-white rounded text-muted transition-colors" title="Add Direct Report">
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex justify-between items-end">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${node.type === 'filled' ? 'bg-gray-100 text-secondary' : node.type === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {node.type === 'filled' ? node.dept : node.type === 'open' ? 'Open Req' : 'Sandbox Draft'}
            </span>
            <span className="text-[11px] font-mono text-muted">${(node.salary / 1000).toFixed(0)}k</span>
          </div>
        </div>
        
        {children.length > 0 && (
          <div className="flex gap-4 mt-6 relative pt-4 before:absolute before:top-0 before:left-1/2 before:w-px before:h-4 before:bg-border before:-translate-x-1/2">
            <div className="absolute top-4 left-[20%] right-[20%] h-px bg-border z-0" />
            {children.map(child => (
              <div key={child.id} className="relative pt-4 before:absolute before:top-0 before:left-1/2 before:w-px before:h-4 before:bg-border before:-translate-x-1/2">
                {renderOrgNode(child.id, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

      {/* ── NEW: Dynamic Org Chart Sandbox ── */}
      <div className="bg-surface rounded-card border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-primary" /> Dynamic Org Chart & Budget Modeler
            </h2>
            <p className="text-[11px] text-muted mt-1">Drag-and-drop to restructure. Add virtual seats to forecast budget.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 mr-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted uppercase">Current Burn</p>
                <p className="text-xs font-mono font-bold text-foreground">${(currentBurn / 1000).toFixed(0)}k <span className="text-[10px] text-muted font-sans font-normal">/yr</span></p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-right">
                <p className="text-[10px] font-bold text-purple-600 uppercase">Projected (Sandbox)</p>
                <p className="text-xs font-mono font-bold text-purple-700">${(projectedBurn / 1000).toFixed(0)}k <span className="text-[10px] text-purple-400 font-sans font-normal">/yr</span></p>
              </div>
            </div>
            <button 
              onClick={() => setSandboxMode(!sandboxMode)} 
              className={`px-4 py-2 text-xs font-semibold rounded-btn transition-all flex items-center gap-2 ${
                sandboxMode ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white border border-border text-foreground hover:bg-gray-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {sandboxMode ? 'Exit Sandbox' : 'Sandbox Mode'}
            </button>
          </div>
        </div>
        
        <div className="p-8 overflow-x-auto min-h-[400px] flex justify-center bg-gray-50/30">
          <div className="inline-block min-w-max">
            {renderOrgNode('ceo')}
          </div>
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
