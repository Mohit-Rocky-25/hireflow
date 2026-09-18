// ============================================================
// HireFlow — Company Candidates List
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Users, Brain, Search } from 'lucide-react';
import { useState } from 'react';

export function CompanyCandidates() {
  const { currentCompanyId, applications, users, candidateMatches, jobs } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const companyApps = applications
    .filter(a => a.companyId === currentCompanyId)
    .filter(a => !statusFilter || a.status === statusFilter)
    .filter(a => {
      if (!search) return true;
      const user = users.find(u => u.id === a.candidateId);
      return user?.displayName.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-xl font-bold text-foreground">Candidates</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none">
          <option value="">All Status</option>
          {['APPLIED','SCREENING','REVIEW','SHORTLISTED','INTERVIEW','FINAL_REVIEW','OFFER','HIRED','REJECTED','ON_HOLD'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="bg-surface rounded-card border border-border">
        {companyApps.length === 0 ? (
          <div className="p-12 text-center"><Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" /><p className="text-sm text-muted">No candidates found</p></div>
        ) : (
          <div className="divide-y divide-border">
            {companyApps.map(app => {
              const candidate = users.find(u => u.id === app.candidateId);
              const match = candidateMatches.find(m => m.applicationId === app.id);
              const job = jobs.find(j => j.id === app.jobId);
              return (
                <Link key={app.id} to={`/company/candidates/${app.candidateId}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{candidate?.displayName || 'Candidate'}</p>
                      <p className="text-xs text-muted">{job?.title} • {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {match && <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${match.overallScore >= 80 ? 'bg-green-50 text-success' : 'bg-amber-50 text-warning'}`}><Brain className="w-3 h-3 inline mr-1" />{match.overallScore}%</span>}
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${app.status === 'SHORTLISTED' ? 'bg-green-50 text-success' : app.status === 'INTERVIEW' ? 'bg-primary-light text-primary' : app.status === 'REJECTED' ? 'bg-red-50 text-danger' : 'bg-gray-100 text-muted'}`}>{app.status}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
