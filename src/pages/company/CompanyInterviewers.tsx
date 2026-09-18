// HireFlow — Company Interviewers Management
import { useStore } from '../../store/useStore';
import { UserCheck, Calendar } from 'lucide-react';

export function CompanyInterviewers() {
  const { currentCompanyId, companyMembers, users, interviews } = useStore();
  const interviewers = companyMembers.filter(m => m.companyId === currentCompanyId && m.role === 'INTERVIEWER');

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Interviewers</h1>
      {interviewers.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center">
          <UserCheck className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
          <p className="text-sm text-muted">No interviewers added yet</p>
          <p className="text-xs text-muted mt-1">Invite team members from Company Team page</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviewers.map(mem => {
            const user = users.find(u => u.id === mem.userId);
            const userInterviews = interviews.filter(i => i.interviewerId === mem.userId && i.companyId === currentCompanyId);
            const pending = userInterviews.filter(i => i.status === 'scheduled');
            const completed = userInterviews.filter(i => i.status === 'completed');
            return (
              <div key={mem.id} className="bg-surface rounded-card border border-border p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    {user?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.displayName || 'Interviewer'}</p>
                    <p className="text-xs text-muted">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" />{pending.length} pending</span>
                  <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-success" />{completed.length} completed</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
