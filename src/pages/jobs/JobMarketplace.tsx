// ============================================================
// HireFlow — Public Job Marketplace
// ============================================================
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Search, MapPin, Briefcase, Clock, Building2, Filter, Sparkles, ArrowRight } from 'lucide-react';

export function JobMarketplace() {
  const { jobs, companies, isAuthenticated, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const publishedJobs = useMemo(() => {
    return jobs
      .filter(j => j.status === 'published')
      .filter(j => {
        if (search) {
          const s = search.toLowerCase();
          const company = companies.find(c => c.id === j.companyId);
          return j.title.toLowerCase().includes(s) ||
            j.department.toLowerCase().includes(s) ||
            company?.name.toLowerCase().includes(s) ||
            j.requirements.some(r => r.name.toLowerCase().includes(s));
        }
        return true;
      })
      .filter(j => !locationFilter || j.location.toLowerCase().includes(locationFilter.toLowerCase()))
      .filter(j => !workModeFilter || j.workMode === workModeFilter)
      .filter(j => !typeFilter || j.employmentType === typeFilter);
  }, [jobs, companies, search, locationFilter, workModeFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-btn bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">HireFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <Link to={currentUser.role === 'CANDIDATE' ? '/candidate/dashboard' : '/company/dashboard'}
                className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light rounded-btn transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-100 rounded-btn transition-colors">Sign In</Link>
                <Link to="/register" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Search */}
      <section className="bg-gradient-to-b from-primary-light to-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Find your next opportunity</h1>
          <p className="text-secondary mb-8">Browse open positions from top companies</p>

          <div className="bg-surface rounded-card-lg shadow-card-hover p-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-btn border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-4 py-2.5 rounded-btn border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <button className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all flex items-center gap-2 justify-center">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-surface rounded-card border border-border p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-muted" />
                <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Work Mode</label>
                  <div className="space-y-1.5">
                    {[{ v: '', l: 'All' }, { v: 'remote', l: 'Remote' }, { v: 'hybrid', l: 'Hybrid' }, { v: 'onsite', l: 'On-site' }].map(o => (
                      <button key={o.v} onClick={() => setWorkModeFilter(o.v)}
                        className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${workModeFilter === o.v ? 'bg-primary-light text-primary font-medium' : 'text-secondary hover:bg-gray-50'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Employment Type</label>
                  <div className="space-y-1.5">
                    {[{ v: '', l: 'All' }, { v: 'full-time', l: 'Full Time' }, { v: 'part-time', l: 'Part Time' }, { v: 'contract', l: 'Contract' }, { v: 'internship', l: 'Internship' }].map(o => (
                      <button key={o.v} onClick={() => setTypeFilter(o.v)}
                        className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${typeFilter === o.v ? 'bg-primary-light text-primary font-medium' : 'text-secondary hover:bg-gray-50'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted">{publishedJobs.length} job{publishedJobs.length !== 1 ? 's' : ''} found</p>
            </div>

            {publishedJobs.length === 0 ? (
              <div className="bg-surface rounded-card border border-border p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-sm text-secondary">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedJobs.map(job => {
                  const company = companies.find(c => c.id === job.companyId);
                  const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block bg-surface rounded-card border border-border p-5 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                          <p className="text-sm text-secondary mt-1 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {company?.name || 'Company'}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.workMode === 'remote' ? 'Remote' : job.workMode === 'hybrid' ? 'Hybrid' : 'On-site'}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.employmentType.replace('-', ' ')}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.requirements.filter(r => r.priority === 'MANDATORY').slice(0, 4).map(r => (
                              <span key={r.id} className="px-2 py-0.5 bg-primary-light text-primary text-xs font-medium rounded-full">{r.name}</span>
                            ))}
                            {job.requirements.filter(r => r.priority === 'MANDATORY').length > 4 && (
                              <span className="px-2 py-0.5 bg-gray-100 text-muted text-xs rounded-full">
                                +{job.requirements.filter(r => r.priority === 'MANDATORY').length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</p>
                          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                              View Role <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
