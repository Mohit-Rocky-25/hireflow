// ============================================================
// HireFlow — Candidate Jobs Marketplace
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Search, MapPin, Briefcase, DollarSign, Building2, Filter } from 'lucide-react';

export function CandidateJobs() {
  const { jobs, companies, applications, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [workMode, setWorkMode] = useState('ALL');

  const publishedJobs = jobs.filter(j => j.status === 'published');
  const appliedJobIds = new Set(
    applications.filter(a => a.candidateId === currentUser?.id).map(a => a.jobId)
  );

  const departments = ['ALL', ...Array.from(new Set(publishedJobs.map(j => j.department)))];

  const filtered = publishedJobs.filter(job => {
    const comp = companies.find(c => c.id === job.companyId);
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.summary.toLowerCase().includes(search.toLowerCase()) ||
      comp?.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept = department === 'ALL' || job.department === department;
    const matchesMode = workMode === 'ALL' || job.workMode === workMode;
    return matchesSearch && matchesDept && matchesMode;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Explore Career Opportunities</h1>
        <p className="text-sm text-muted">Find matching roles across top participating companies.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search position or company..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted shrink-0" />
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary bg-white"
            >
              {departments.map(d => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={workMode}
              onChange={e => setWorkMode(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-btn border border-border focus:outline-none focus:border-primary bg-white"
            >
              <option value="ALL">All Work Modes</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-Site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-surface rounded-card border border-border">
            <Briefcase className="w-10 h-10 text-muted mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium text-foreground">No matching positions found</p>
            <p className="text-xs text-muted mt-1">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          filtered.map(job => {
            const comp = companies.find(c => c.id === job.companyId);
            const hasApplied = appliedJobIds.has(job.id);

            return (
              <div
                key={job.id}
                className="bg-surface rounded-card border border-border p-5 hover:border-primary/40 hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-muted" /> {comp?.name}
                      </p>
                    </div>
                    {hasApplied && (
                      <span className="px-2.5 py-0.5 bg-green-50 text-success text-[11px] font-semibold rounded-full border border-green-200">
                        Applied
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-secondary line-clamp-2 mb-4">{job.summary}</p>

                  <div className="flex flex-wrap gap-2 text-xs text-muted mb-4">
                    <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-btn border border-border">
                      <MapPin className="w-3 h-3 text-muted" /> {job.location} ({job.workMode})
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-btn border border-border">
                      <Briefcase className="w-3 h-3 text-muted" /> {job.employmentType}
                    </span>
                    {job.salaryMin && job.salaryMax && (
                      <span className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-btn border border-border font-medium text-foreground">
                        <DollarSign className="w-3 h-3 text-success" />
                        {job.salaryCurrency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted">
                    {job.requirements.length} requirement criteria
                  </span>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-4 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-btn hover:bg-primary-light transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
