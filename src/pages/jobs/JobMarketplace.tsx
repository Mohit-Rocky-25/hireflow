// ============================================================
// HireFlow v2 — Public Job Marketplace
// ============================================================
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Search, MapPin, Briefcase, Clock, Building2, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { Button, Card, Badge, Input, EmptyState } from '../../components/ui/Components';

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
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-[24px] h-[68px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[18px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
          </Link>
          <div className="flex items-center gap-[28px]">
            <div className="hidden md:flex items-center gap-[24px]">
              <Link to="/demo" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
                AI Matching Demo
              </Link>
            </div>
            <div className="flex items-center gap-[10px]">
              {isAuthenticated && currentUser ? (
                <Link to={currentUser.role === 'CANDIDATE' ? '/candidate/dashboard' : '/company/dashboard'}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="px-[16px] py-[8px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all duration-[120ms]">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <Button variant="header" className="h-[40px] px-[18px] text-[14px]">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Search */}
      <section className="hero-mesh border-b border-border py-[72px] px-[24px] relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-30%] left-[15%] w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] rounded-full bg-ai-dark/6 blur-[100px]" />
        </div>
        <div className="max-w-[760px] mx-auto text-center relative z-10 page-enter">
          <div className="inline-flex items-center gap-[8px] px-[14px] py-[6px] rounded-full bg-primary-light border border-primary/20 text-[12px] font-semibold text-primary mb-[24px]">
            <Sparkles className="w-[12px] h-[12px]" /> {publishedJobs.length} open positions
          </div>
          <h1 className="text-[44px] sm:text-[56px] font-extrabold text-text mb-[16px] tracking-[-0.04em] leading-[1.05]">
            Find your next{' '}
            <span className="gradient-text">opportunity</span>
          </h1>
          <p className="text-[18px] text-text-secondary mb-[40px] leading-[28px]">Browse open positions from top companies</p>

          <div className="bg-surface/80 backdrop-blur-sm rounded-xl border border-border p-[8px] flex flex-col sm:flex-row gap-[8px] shadow-md">
            <div className="flex-1 relative">
              <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-[48px] pl-[48px] pr-[16px] bg-surface-2 rounded-lg text-[15px] text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-text-muted"
              />
            </div>
            <div className="relative sm:w-[220px]">
              <MapPin className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted" />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full h-[48px] pl-[48px] pr-[16px] bg-surface-2 rounded-lg text-[15px] text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-text-muted"
              />
            </div>
            <button className="h-[48px] px-[28px] text-[15px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] transition-all duration-[150ms]">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="max-w-[1200px] mx-auto px-[24px] py-[48px] page-enter">
        <div className="flex flex-col lg:flex-row gap-[32px]">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-[260px] shrink-0">
            <div className="sticky top-[88px] bg-surface rounded-xl border border-border shadow-xs overflow-hidden">
              <div className="flex items-center gap-[8px] px-[20px] py-[16px] border-b border-border bg-surface-2">
                <Filter className="w-[16px] h-[16px] text-primary stroke-[1.5px]" />
                <h3 className="text-[14px] font-semibold text-text">Filters</h3>
              </div>

              <div className="p-[16px] space-y-[24px]">
                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.07em] mb-[10px] block">Work Mode</label>
                  <div className="space-y-[2px]">
                    {[{ v: '', l: 'All Modes' }, { v: 'remote', l: 'Remote' }, { v: 'hybrid', l: 'Hybrid' }, { v: 'onsite', l: 'On-site' }].map(o => (
                      <button key={o.v} onClick={() => setWorkModeFilter(o.v)}
                        className={`block w-full text-left px-[12px] py-[8px] rounded-md text-[13px] transition-all duration-[120ms] ${
                          workModeFilter === o.v
                            ? 'bg-primary-light text-primary font-semibold border border-primary/20'
                            : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                        }`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-[0.07em] mb-[10px] block">Employment Type</label>
                  <div className="space-y-[2px]">
                    {[{ v: '', l: 'All Types' }, { v: 'full-time', l: 'Full Time' }, { v: 'part-time', l: 'Part Time' }, { v: 'contract', l: 'Contract' }, { v: 'internship', l: 'Internship' }].map(o => (
                      <button key={o.v} onClick={() => setTypeFilter(o.v)}
                        className={`block w-full text-left px-[12px] py-[8px] rounded-md text-[13px] transition-all duration-[120ms] ${
                          typeFilter === o.v
                            ? 'bg-primary-light text-primary font-semibold border border-primary/20'
                            : 'text-text-secondary hover:bg-surface-2 hover:text-text'
                        }`}>
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
            <div className="flex items-center justify-between mb-[24px]">
              <p className="text-[15px] font-medium text-text-secondary">{publishedJobs.length} job{publishedJobs.length !== 1 ? 's' : ''} found</p>
            </div>

            {publishedJobs.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border min-h-[300px] flex items-center justify-center">
                <EmptyState
                  icon={<Briefcase className="w-[48px] h-[48px]" />}
                  title="No jobs found"
                  description="Try adjusting your search or filters to find what you're looking for."
                />
              </div>
            ) : (
              <div className="space-y-[16px] stagger-in">
                {publishedJobs.map(job => {
                  const company = companies.find(c => c.id === job.companyId);
                  const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-xl"
                    >
                      <div className="group bg-surface rounded-xl border border-border p-[24px] hover:border-primary/40 hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 shadow-xs relative overflow-hidden">
                        {/* Hover accent line */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-l-xl" />
                        <div className="flex items-start justify-between gap-[16px]">
                          <div className="flex-1 min-w-0 pl-[4px]">
                            <h3 className="text-[19px] font-bold text-text group-hover:text-primary transition-colors mb-[6px] tracking-[-0.01em]">{job.title}</h3>
                            <p className="text-[14px] text-text-secondary flex items-center gap-[6px] mb-[16px]">
                              <Building2 className="w-[14px] h-[14px] text-text-muted" />
                              {company?.name || 'Company'}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-[16px] text-[13px] text-text-secondary mb-[16px]">
                              <span className="flex items-center gap-[6px]"><MapPin className="w-[14px] h-[14px] text-text-muted" />{job.location}</span>
                              <span className="flex items-center gap-[6px]"><Briefcase className="w-[14px] h-[14px] text-text-muted" />{job.workMode === 'remote' ? 'Remote' : job.workMode === 'hybrid' ? 'Hybrid' : 'On-site'}</span>
                              <span className="flex items-center gap-[6px] capitalize"><Clock className="w-[14px] h-[14px] text-text-muted" />{job.employmentType.replace('-', ' ')}</span>
                            </div>

                            <div className="flex flex-wrap gap-[6px]">
                              {job.requirements.filter(r => r.priority === 'MANDATORY').slice(0, 4).map(r => (
                                <Badge key={r.id} variant="primary">{r.name}</Badge>
                              ))}
                              {job.requirements.filter(r => r.priority === 'MANDATORY').length > 4 && (
                                <Badge variant="default">+{job.requirements.filter(r => r.priority === 'MANDATORY').length - 4} more</Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end gap-[12px]">
                            <p className="text-[12px] text-text-muted font-medium">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</p>
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-[200ms] translate-x-2 group-hover:translate-x-0">
                              <span className="inline-flex items-center gap-[5px] text-[13px] font-semibold text-primary">
                                View Role <ArrowRight className="w-[13px] h-[13px]" />
                              </span>
                            </div>
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
