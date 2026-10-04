import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Search, MapPin, Briefcase, DollarSign, Building2, Filter, Heart, ArrowDownUp, Brain } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function CandidateJobs() {
  const { jobs, companies, applications, currentUser, candidateMatches } = useStore();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [workMode, setWorkMode] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [jobType, setJobType] = useState('ALL');
  const [sortBy, setSortBy] = useState('match');
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const publishedJobs = jobs.filter(j => j.status === 'published');
  const appliedJobIds = new Set(
    applications.filter(a => a.candidateId === currentUser?.id).map(a => a.jobId)
  );

  const departments = ['ALL', ...Array.from(new Set(publishedJobs.map(j => j.department)))];
  const locations = ['ALL', ...Array.from(new Set(publishedJobs.map(j => j.location)))];
  const jobTypes = ['ALL', ...Array.from(new Set(publishedJobs.map(j => j.employmentType)))];

  const getMatchScore = (jobId: string) => {
    // In a real app, this would be computed against the candidate profile.
    // We use a mock deterministic score based on job ID length for demo purposes,
    // or fetch from candidateMatches if it exists for this job (even though it's tied to application)
    const match = candidateMatches.find(m => m.jobId === jobId);
    if (match) return match.overallScore;
    return Math.min(99, 45 + (jobId.length * 7) % 55); 
  };

  const toggleSave = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSaved = new Set(savedJobs);
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId);
      toast('success', 'Job removed from saved list');
    } else {
      newSaved.add(jobId);
      toast('success', 'Job saved for later');
    }
    setSavedJobs(newSaved);
  };

  const filteredAndSorted = useMemo(() => {
    let result = publishedJobs.filter(job => {
      const comp = companies.find(c => c.id === job.companyId);
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.summary.toLowerCase().includes(search.toLowerCase()) ||
        comp?.name.toLowerCase().includes(search.toLowerCase());
      
      const matchesDept = department === 'ALL' || job.department === department;
      const matchesMode = workMode === 'ALL' || job.workMode === workMode;
      const matchesLoc = location === 'ALL' || job.location === location;
      const matchesType = jobType === 'ALL' || job.employmentType === jobType;
      
      return matchesSearch && matchesDept && matchesMode && matchesLoc && matchesType;
    });

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
      }
      if (sortBy === 'salary') {
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      }
      if (sortBy === 'match') {
        return getMatchScore(b.id) - getMatchScore(a.id);
      }
      return 0;
    });

    return result;
  }, [publishedJobs, search, department, workMode, location, jobType, sortBy, companies]);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-foreground">Explore Career Opportunities</h1>
        <p className="text-sm text-muted">Find matching roles across top participating companies.</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface rounded-card border border-border p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search position or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground focus:outline-none placeholder:text-text-muted"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-md border border-border focus:outline-none focus:border-primary bg-surface-2">
              {departments.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All' : d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-md border border-border focus:outline-none focus:border-primary bg-surface-2">
              {locations.map(l => <option key={l} value={l}>{l === 'ALL' ? 'All' : l}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Work Mode</label>
            <select value={workMode} onChange={e => setWorkMode(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-md border border-border focus:outline-none focus:border-primary bg-surface-2">
              <option value="ALL">All</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-Site</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">Job Type</label>
            <select value={jobType} onChange={e => setJobType(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-md border border-border focus:outline-none focus:border-primary bg-surface-2">
              {jobTypes.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All' : t.replace('-', ' ')}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-text-muted uppercase flex items-center gap-1"><ArrowDownUp className="w-3 h-3"/> Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-2 py-1.5 text-xs font-semibold rounded-md border border-primary/40 bg-primary/5 text-primary focus:outline-none">
              <option value="match">Best Match Score</option>
              <option value="newest">Newest First</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSorted.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-surface rounded-card border border-border">
            <Briefcase className="w-10 h-10 text-muted mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium text-foreground">No matching positions found</p>
            <p className="text-xs text-muted mt-1">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          filteredAndSorted.map(job => {
            const comp = companies.find(c => c.id === job.companyId);
            const hasApplied = appliedJobIds.has(job.id);
            const isSaved = savedJobs.has(job.id);
            const matchScore = getMatchScore(job.id);

            return (
              <div
                key={job.id}
                className="bg-surface rounded-card border border-border hover:border-primary/40 hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 font-extrabold text-text text-lg">
                        {comp?.logo || comp?.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-foreground hover:text-primary transition-colors leading-tight">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h3>
                        <p className="text-[12px] text-muted flex items-center gap-1 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-muted" /> {comp?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button onClick={(e) => toggleSave(e, job.id)} className="text-text-muted hover:text-danger transition-colors">
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-danger text-danger' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-text-secondary mb-4">
                    <span className="flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded-full border border-border">
                      <MapPin className="w-3 h-3" /> {job.location} ({job.workMode})
                    </span>
                    <span className="flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded-full border border-border">
                      <Briefcase className="w-3 h-3" /> {job.employmentType.replace('-', ' ')}
                    </span>
                    {job.salaryMin && job.salaryMax && (
                      <span className="flex items-center gap-1 bg-green-50 text-success px-2 py-0.5 rounded-full border border-green-200">
                        <DollarSign className="w-3 h-3" />
                        {job.salaryCurrency === 'INR' ? '₹' : job.salaryCurrency} {(job.salaryMin/100000).toFixed(1)} - {(job.salaryMax/100000).toFixed(1)} LPA
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[13px] text-secondary line-clamp-2">{job.summary}</p>
                </div>

                <div className="px-5 py-3 bg-surface-2 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border ${matchScore >= 80 ? 'bg-ai-light/50 text-ai border-ai/20' : matchScore >= 60 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                      <Brain className="w-3.5 h-3.5" /> {matchScore}% Match
                    </div>
                    {hasApplied && (
                      <span className="px-2 py-1 bg-success-bg text-success text-[11px] font-bold rounded-md border border-success/20">
                        Applied
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1"
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
