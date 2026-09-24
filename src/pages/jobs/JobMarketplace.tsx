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
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-[24px] h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] rounded-md bg-primary flex items-center justify-center shadow-xs">
              <Sparkles className="w-[20px] h-[20px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.01em]">HireFlow</span>
          </Link>
          <div className="flex items-center gap-[32px]">
            <div className="hidden md:flex items-center gap-[24px]">
              <Link to="/demo" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
                AI Matching Demo
              </Link>
            </div>
            <div className="flex items-center gap-[12px]">
              {isAuthenticated && currentUser ? (
                <Link to={currentUser.role === 'CANDIDATE' ? '/candidate/dashboard' : '/company/dashboard'}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="px-[20px] py-[10px] rounded-md text-[15px] font-medium text-text hover:bg-surface-2 active:bg-black transition-all duration-[120ms]">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" className="h-[44px] px-[20px] text-[15px]">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Search */}
      <section className="bg-surface-2 border-b border-border py-[64px] px-[24px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-50%] left-[20%] w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        <div className="max-w-[800px] mx-auto text-center relative z-10 page-enter">
          <h1 className="text-[40px] sm:text-[48px] font-bold text-text mb-[16px] tracking-[-0.02em] leading-[1.1]">Find your next opportunity</h1>
          <p className="text-[18px] text-text-secondary mb-[40px]">Browse open positions from top companies</p>

          <Card className="p-[8px] flex flex-col sm:flex-row gap-[8px] bg-surface shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-text-muted" />
              <input
                type="text"
                placeholder="Job title, skill, or company..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-[48px] pl-[48px] pr-[16px] bg-bg rounded-md text-[15px] text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div className="relative sm:w-[240px]">
              <MapPin className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-text-muted" />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="w-full h-[48px] pl-[48px] pr-[16px] bg-bg rounded-md text-[15px] text-text border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <Button variant="primary" className="h-[48px] px-[32px] text-[15px]">
              Search
            </Button>
          </Card>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="max-w-[1200px] mx-auto px-[24px] py-[48px] page-enter">
        <div className="flex flex-col lg:flex-row gap-[32px]">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-[280px] shrink-0">
            <Card className="sticky top-[96px]">
              <div className="flex items-center gap-[8px] mb-[24px] pb-[16px] border-b border-border">
                <Filter className="w-[18px] h-[18px] text-text-muted" />
                <h3 className="text-[15px] font-semibold text-text">Filters</h3>
              </div>

              <div className="space-y-[32px]">
                <div>
                  <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.04em] mb-[12px] block">Work Mode</label>
                  <div className="space-y-[4px]">
                    {[{ v: '', l: 'All' }, { v: 'remote', l: 'Remote' }, { v: 'hybrid', l: 'Hybrid' }, { v: 'onsite', l: 'On-site' }].map(o => (
                      <button key={o.v} onClick={() => setWorkModeFilter(o.v)}
                        className={`block w-full text-left px-[12px] py-[8px] rounded-md text-[14px] transition-colors duration-[120ms] ${workModeFilter === o.v ? 'bg-primary-light text-primary font-medium' : 'text-text-secondary hover:bg-surface-2 hover:text-text'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.04em] mb-[12px] block">Employment Type</label>
                  <div className="space-y-[4px]">
                    {[{ v: '', l: 'All' }, { v: 'full-time', l: 'Full Time' }, { v: 'part-time', l: 'Part Time' }, { v: 'contract', l: 'Contract' }, { v: 'internship', l: 'Internship' }].map(o => (
                      <button key={o.v} onClick={() => setTypeFilter(o.v)}
                        className={`block w-full text-left px-[12px] py-[8px] rounded-md text-[14px] transition-colors duration-[120ms] ${typeFilter === o.v ? 'bg-primary-light text-primary font-medium' : 'text-text-secondary hover:bg-surface-2 hover:text-text'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-[24px]">
              <p className="text-[15px] font-medium text-text-secondary">{publishedJobs.length} job{publishedJobs.length !== 1 ? 's' : ''} found</p>
            </div>

            {publishedJobs.length === 0 ? (
              <Card className="min-h-[300px] flex items-center justify-center">
                <EmptyState
                  icon={<Briefcase className="w-[48px] h-[48px]" />}
                  title="No jobs found"
                  description="Try adjusting your search or filters to find what you're looking for."
                />
              </Card>
            ) : (
              <div className="space-y-[24px] stagger-in">
                {publishedJobs.map(job => {
                  const company = companies.find(c => c.id === job.companyId);
                  const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link
                      key={job.id}
                      to={`/jobs/${job.id}`}
                      className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-lg"
                    >
                      <Card hover className="group p-[24px]">
                        <div className="flex items-start justify-between gap-[16px]">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[20px] font-bold text-text group-hover:text-primary transition-colors mb-[8px]">{job.title}</h3>
                            <p className="text-[16px] text-text-secondary flex items-center gap-[8px]">
                              <Building2 className="w-[18px] h-[18px] text-text-muted" />
                              {company?.name || 'Company'}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-[24px] mt-[24px] text-[14px] text-text-secondary">
                              <span className="flex items-center gap-[8px]"><MapPin className="w-[16px] h-[16px] text-text-muted" />{job.location}</span>
                              <span className="flex items-center gap-[8px]"><Briefcase className="w-[16px] h-[16px] text-text-muted" />{job.workMode === 'remote' ? 'Remote' : job.workMode === 'hybrid' ? 'Hybrid' : 'On-site'}</span>
                              <span className="flex items-center gap-[8px] capitalize"><Clock className="w-[16px] h-[16px] text-text-muted" />{job.employmentType.replace('-', ' ')}</span>
                            </div>

                            <div className="flex flex-wrap gap-[8px] mt-[16px]">
                              {job.requirements.filter(r => r.priority === 'MANDATORY').slice(0, 4).map(r => (
                                <Badge key={r.id} variant="primary">{r.name}</Badge>
                              ))}
                              {job.requirements.filter(r => r.priority === 'MANDATORY').length > 4 && (
                                <Badge variant="default">
                                  +{job.requirements.filter(r => r.priority === 'MANDATORY').length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end">
                            <p className="text-[13px] text-text-muted">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</p>
                            <div className="mt-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-[200ms] -translate-x-2 group-hover:translate-x-0">
                              <span className="inline-flex items-center gap-[6px] text-[14px] font-medium text-primary">
                                View Role <ArrowRight className="w-[14px] h-[14px]" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
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
