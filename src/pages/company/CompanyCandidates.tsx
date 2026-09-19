// ============================================================
// HireFlow — Enhanced Company Candidates List
// ============================================================
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Users, Brain, Search, Filter, ArrowRight, ArrowUpDown, Mail, Calendar, Download } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  APPLIED: 'bg-gray-100 text-muted',
  SCREENING: 'bg-cyan-50 text-cyan-700',
  REVIEW: 'bg-indigo-50 text-indigo-700',
  SHORTLISTED: 'bg-amber-50 text-amber-700',
  INTERVIEW: 'bg-blue-50 text-primary',
  FINAL_REVIEW: 'bg-purple-50 text-purple-700',
  OFFER: 'bg-green-50 text-success',
  HIRED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-danger',
  ON_HOLD: 'bg-gray-100 text-muted',
};

export function CompanyCandidates() {
  const { currentCompanyId, applications, users, candidateMatches, jobs } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const companyJobs = useMemo(() => jobs.filter(j => j.companyId === currentCompanyId), [jobs, currentCompanyId]);

  const companyApps = useMemo(() => {
    return applications
      .filter(a => a.companyId === currentCompanyId)
      .filter(a => !statusFilter || a.status === statusFilter)
      .filter(a => !jobFilter || a.jobId === jobFilter)
      .filter(a => {
        if (!search) return true;
        const user = users.find(u => u.id === a.candidateId);
        return user?.displayName.toLowerCase().includes(search.toLowerCase()) ||
          user?.email.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          const scoreA = candidateMatches.find(m => m.applicationId === a.id)?.overallScore || 0;
          const scoreB = candidateMatches.find(m => m.applicationId === b.id)?.overallScore || 0;
          return scoreB - scoreA;
        }
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      });
  }, [applications, currentCompanyId, statusFilter, jobFilter, search, users, sortBy, candidateMatches]);

  const totalPages = Math.ceil(companyApps.length / PER_PAGE);
  const paginated = companyApps.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Status summary counts
  const statusSummary = useMemo(() => {
    const apps = applications.filter(a => a.companyId === currentCompanyId);
    return {
      total: apps.length,
      applied: apps.filter(a => a.status === 'APPLIED').length,
      screening: apps.filter(a => ['SCREENING', 'REVIEW'].includes(a.status)).length,
      shortlisted: apps.filter(a => a.status === 'SHORTLISTED').length,
      interview: apps.filter(a => a.status === 'INTERVIEW').length,
      offered: apps.filter(a => ['OFFER', 'HIRED'].includes(a.status)).length,
      rejected: apps.filter(a => a.status === 'REJECTED').length,
    };
  }, [applications, currentCompanyId]);

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Job', 'Status', 'AI Score', 'Applied At'].join(','),
      ...companyApps.map(app => {
        const user = users.find(u => u.id === app.candidateId);
        const job = jobs.find(j => j.id === app.jobId);
        const score = candidateMatches.find(m => m.applicationId === app.id)?.overallScore;
        return [
          user?.displayName || '', user?.email || '', job?.title || '',
          app.status, score || 'N/A', new Date(app.appliedAt).toISOString(),
        ].join(',');
      }),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'candidates_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Candidates
          </h1>
          <p className="text-sm text-muted mt-0.5">{statusSummary.total} candidates in your pipeline</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-border text-sm font-semibold rounded-btn hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { label: 'All', count: statusSummary.total, value: '' },
          { label: 'New', count: statusSummary.applied, value: 'APPLIED' },
          { label: 'In Review', count: statusSummary.screening, value: 'SCREENING' },
          { label: 'Shortlisted', count: statusSummary.shortlisted, value: 'SHORTLISTED' },
          { label: 'Interview', count: statusSummary.interview, value: 'INTERVIEW' },
          { label: 'Offered/Hired', count: statusSummary.offered, value: 'OFFER' },
          { label: 'Rejected', count: statusSummary.rejected, value: 'REJECTED' },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              statusFilter === s.value
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-secondary border-border hover:bg-gray-50'
            }`}
          >
            {s.label}
            <span className={`text-xs font-bold ${statusFilter === s.value ? 'text-white/80' : 'text-muted'}`}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={jobFilter}
            onChange={e => { setJobFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All Jobs</option>
            {companyJobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <button
            onClick={() => setSortBy(s => s === 'date' ? 'score' : 'date')}
            className={`flex items-center gap-1.5 px-3 py-2.5 border border-border rounded-btn text-sm font-medium transition-colors ${
              sortBy === 'score' ? 'bg-ai-light text-ai border-ai/20' : 'text-secondary hover:bg-gray-50'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortBy === 'score' ? 'By Score' : 'By Date'}
          </button>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border bg-gray-50/50 text-xs font-semibold text-muted uppercase tracking-wider">
          <div className="col-span-4">Candidate</div>
          <div className="col-span-3">Applied For</div>
          <div className="col-span-2">AI Score</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1"></div>
        </div>

        {paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-foreground">No candidates match your filters</p>
            <p className="text-xs text-muted mt-1">Try adjusting your search or status filter</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginated.map(app => {
              const candidate = users.find(u => u.id === app.candidateId);
              const match = candidateMatches.find(m => m.applicationId === app.id);
              const job = jobs.find(j => j.id === app.jobId);
              const initials = candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??';
              const statusCls = STATUS_COLORS[app.status] || 'bg-gray-100 text-muted';

              return (
                <Link
                  key={app.id}
                  to={`/company/candidates/${app.candidateId}`}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors group items-center"
                >
                  {/* Candidate */}
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {candidate?.displayName || 'Candidate'}
                      </p>
                      <p className="text-xs text-muted flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" /> {candidate?.email}
                      </p>
                    </div>
                  </div>

                  {/* Job */}
                  <div className="sm:col-span-3">
                    <p className="text-sm text-foreground truncate">{job?.title || 'Unknown'}</p>
                    <p className="text-xs text-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* AI Score */}
                  <div className="sm:col-span-2">
                    {match ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              match.overallScore >= 80 ? 'bg-success' :
                              match.overallScore >= 60 ? 'bg-amber-500' : 'bg-danger'
                            }`}
                            style={{ width: `${match.overallScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold ${
                          match.overallScore >= 80 ? 'text-success' :
                          match.overallScore >= 60 ? 'text-amber-600' : 'text-danger'
                        }`}>
                          {match.overallScore}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted italic">Pending</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusCls}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="sm:col-span-1 flex justify-end">
                    <ArrowRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-gray-50/50">
            <p className="text-xs text-muted">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, companyApps.length)} of {companyApps.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-border rounded-btn disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-border rounded-btn disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
