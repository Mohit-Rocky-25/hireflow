// ============================================================
// HireFlow — Company Jobs Management
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Plus, Briefcase, MapPin, Clock, Users, Eye, MoreVertical } from 'lucide-react';

export function CompanyJobs() {
  const { currentCompanyId, jobs, applications } = useStore();
  const companyJobs = jobs.filter(j => j.companyId === currentCompanyId);

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-muted',
    published: 'bg-green-50 text-success',
    closed: 'bg-red-50 text-danger',
    archived: 'bg-gray-100 text-muted',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Jobs</h1>
          <p className="text-sm text-muted mt-1">{companyJobs.length} total jobs</p>
        </div>
        <Link to="/company/jobs/new" className="px-5 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Job
        </Link>
      </div>

      {companyJobs.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center">
          <Briefcase className="w-12 h-12 text-muted mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No jobs created yet</h3>
          <p className="text-sm text-secondary mb-6">Create your first job role to start receiving candidates.</p>
          <Link to="/company/jobs/new" className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {companyJobs.map(job => {
            const jobApps = applications.filter(a => a.jobId === job.id);
            const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Link key={job.id} to={`/company/jobs/${job.id}`} className="bg-surface rounded-card border border-border p-5 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[job.status]}`}>{job.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                      <span>{job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.employmentType.replace('-', ' ')}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{jobApps.length}</span>
                      <span className="text-xs text-muted">applicants</span>
                    </div>
                    <p className="text-xs text-muted">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
