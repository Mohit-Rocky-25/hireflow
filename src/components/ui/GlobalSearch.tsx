// ============================================================
// HireFlow — Global Command Search (Ctrl+K / Cmd+K)
// ============================================================
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Search, Briefcase, Users, Calendar, BarChart3,
  FileText, Settings, Building2, User, Award, X, ArrowRight, Zap
} from 'lucide-react';

interface SearchResult {
  type: 'page' | 'job' | 'candidate' | 'action';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { currentUser, jobs, users, companies } = useStore();

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const allResults = useMemo<SearchResult[]>(() => {
    if (!currentUser) return [];

    const pages: SearchResult[] = [];

    // Role-based pages
    if (['BHR_MANAGER', 'HR_RECRUITER'].includes(currentUser.role)) {
      pages.push(
        { type: 'page', title: 'Dashboard', subtitle: 'Company overview', icon: <BarChart3 className="w-4 h-4" />, path: '/company/dashboard' },
        { type: 'page', title: 'Jobs', subtitle: 'Manage job listings', icon: <Briefcase className="w-4 h-4" />, path: '/company/jobs' },
        { type: 'page', title: 'Create New Job', subtitle: 'Post a new position', icon: <Zap className="w-4 h-4" />, path: '/company/jobs/new' },
        { type: 'page', title: 'Candidates', subtitle: 'View applicants', icon: <Users className="w-4 h-4" />, path: '/company/candidates' },
        { type: 'page', title: 'Analytics', subtitle: 'Hiring metrics & charts', icon: <BarChart3 className="w-4 h-4" />, path: '/company/analytics' },
        { type: 'page', title: 'Offers', subtitle: 'Manage offers & hires', icon: <Award className="w-4 h-4" />, path: '/company/offers' },
        { type: 'page', title: 'Team', subtitle: 'Manage team members', icon: <Building2 className="w-4 h-4" />, path: '/company/team' },
        { type: 'page', title: 'Settings', subtitle: 'Company configuration', icon: <Settings className="w-4 h-4" />, path: '/company/settings' },
      );
    }
    if (currentUser.role === 'CANDIDATE') {
      pages.push(
        { type: 'page', title: 'Dashboard', subtitle: 'Your overview', icon: <BarChart3 className="w-4 h-4" />, path: '/candidate/dashboard' },
        { type: 'page', title: 'Find Jobs', subtitle: 'Browse open positions', icon: <Search className="w-4 h-4" />, path: '/candidate/jobs' },
        { type: 'page', title: 'My Applications', subtitle: 'Track your apps', icon: <FileText className="w-4 h-4" />, path: '/candidate/applications' },
        { type: 'page', title: 'Resume', subtitle: 'Manage your resume', icon: <FileText className="w-4 h-4" />, path: '/candidate/resume' },
        { type: 'page', title: 'Profile', subtitle: 'Edit your profile', icon: <User className="w-4 h-4" />, path: '/candidate/profile' },
      );
    }
    if (currentUser.role === 'INTERVIEWER') {
      pages.push(
        { type: 'page', title: 'Dashboard', subtitle: 'Your interviews', icon: <BarChart3 className="w-4 h-4" />, path: '/interviewer/dashboard' },
        { type: 'page', title: 'My Interviews', subtitle: 'View sessions', icon: <Calendar className="w-4 h-4" />, path: '/interviewer/interviews' },
        { type: 'page', title: 'Profile', subtitle: 'Edit your profile', icon: <User className="w-4 h-4" />, path: '/interviewer/profile' },
      );
    }
    if (currentUser.role === 'PLATFORM_ADMIN') {
      pages.push(
        { type: 'page', title: 'Admin Dashboard', subtitle: 'Platform overview', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/dashboard' },
        { type: 'page', title: 'Companies', subtitle: 'All organizations', icon: <Building2 className="w-4 h-4" />, path: '/admin/companies' },
        { type: 'page', title: 'Users', subtitle: 'All platform users', icon: <Users className="w-4 h-4" />, path: '/admin/users' },
        { type: 'page', title: 'Audit Log', subtitle: 'System events', icon: <FileText className="w-4 h-4" />, path: '/admin/audit' },
        { type: 'page', title: 'Platform Settings', subtitle: 'Global configuration', icon: <Settings className="w-4 h-4" />, path: '/admin/settings' },
      );
    }

    // Jobs as searchable
    jobs.filter(j => j.status === 'published').forEach(job => {
      const comp = companies.find(c => c.id === job.companyId);
      pages.push({
        type: 'job',
        title: job.title,
        subtitle: `${comp?.name || ''} • ${job.location}`,
        icon: <Briefcase className="w-4 h-4" />,
        path: `/jobs/${job.id}`,
      });
    });

    return pages;
  }, [currentUser, jobs, companies]);

  const filtered = query.trim()
    ? allResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : allResults.slice(0, 8);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter' && filtered[selected]) {
        navigate(filtered[selected].path);
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, selected, navigate]);

  if (!open) return null;

  const TYPE_LABELS: Record<string, string> = {
    page: 'Page',
    job: 'Job',
    candidate: 'Person',
    action: 'Action',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-surface rounded-card-lg border border-border shadow-modal animate-scale-in overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, jobs, actions…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-muted"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted bg-gray-100 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
              <p className="text-sm text-muted">No results for "{query}"</p>
            </div>
          ) : (
            filtered.map((result, i) => (
              <button
                key={i}
                onClick={() => { navigate(result.path); setOpen(false); }}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selected ? 'bg-primary-light' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-btn flex items-center justify-center shrink-0 ${
                  i === selected ? 'bg-primary text-white' : 'bg-gray-100 text-muted'
                }`}>
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${i === selected ? 'text-primary' : 'text-foreground'}`}>
                    {result.title}
                  </p>
                  <p className="text-xs text-muted truncate">{result.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-semibold text-muted uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 rounded">
                    {TYPE_LABELS[result.type] || result.type}
                  </span>
                  {i === selected && <ArrowRight className="w-3.5 h-3.5 text-primary" />}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-gray-50/50 flex items-center gap-4 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[9px] font-mono">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[9px] font-mono">↵</kbd> open
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-[9px] font-mono">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
