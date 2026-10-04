// ============================================================
// HireFlow — Admin Audit Log Full View
// ============================================================
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Shield, Search, Filter, Download, Clock, User, Building2, FileText, RefreshCw } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  created_job: 'bg-blue-50 text-blue-700',
  published_job: 'bg-green-50 text-success',
  closed_job: 'bg-red-50 text-danger',
  submitted_feedback: 'bg-purple-50 text-purple-700',
  status_change: 'bg-amber-50 text-amber-700',
  login: 'bg-gray-100 text-muted',
  registered: 'bg-emerald-50 text-emerald-700',
};

export function AdminAuditLog() {
  const { auditLogs, users, companies } = useStore();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const sorted = [...auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filtered = sorted.filter(log => {
    const matchSearch = search === '' ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(search.toLowerCase());
    const matchEntity = entityFilter === 'all' || log.entity === entityFilter;
    return matchSearch && matchEntity;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const entities = [...new Set(auditLogs.map(l => l.entity))];

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.displayName || userId;
  const getCompanyName = (companyId?: string) => companyId ? companies.find(c => c.id === companyId)?.name : null;

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Entity', 'User', 'Company', 'Details'].join(','),
      ...filtered.map(l => [
        new Date(l.createdAt).toISOString(),
        l.action,
        l.entity,
        getUserName(l.userId),
        getCompanyName(l.companyId) || '',
        (l.details || '').replace(/,/g, ';'),
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hireflow_audit_log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" /> Audit Log
          </h1>
          <p className="text-sm text-muted mt-0.5">{auditLogs.length} total events recorded across the platform</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search actions, entities, details…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted shrink-0" />
          <select
            value={entityFilter}
            onChange={e => { setEntityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Entities</option>
            {entities.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Events', value: auditLogs.length, icon: FileText, color: 'text-primary bg-primary-light' },
          { label: 'Unique Users', value: new Set(auditLogs.map(l => l.userId)).size, icon: User, color: 'text-ai bg-ai-light' },
          { label: 'Companies Involved', value: new Set(auditLogs.filter(l => l.companyId).map(l => l.companyId)).size, icon: Building2, color: 'text-success bg-green-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-btn ${s.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Table */}
      <div className="bg-surface rounded-card border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-gray-50/50">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide">
            Showing {filtered.length} events
          </p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <RefreshCw className="w-3.5 h-3.5" /> Live
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted">No audit events match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginated.map((log, i) => {
              const colorCls = ACTION_COLORS[log.action] || 'bg-gray-100 text-muted';
              return (
                <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors text-sm">
                  <div className="text-[10px] text-muted shrink-0 mt-0.5 w-32">
                    <p className="font-medium">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${colorCls}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted">on</span>
                      <span className="text-xs font-semibold text-foreground">{log.entity}</span>
                    </div>
                    {log.details && <p className="text-xs text-secondary mt-0.5 truncate">{log.details}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-foreground">{getUserName(log.userId)}</p>
                    {log.companyId && <p className="text-[10px] text-muted">{getCompanyName(log.companyId)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-gray-50/50">
            <p className="text-xs text-muted">Page {page} of {totalPages}</p>
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
