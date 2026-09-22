// ============================================================
// HireFlow v2 — Company Jobs Management
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Plus, Briefcase, MapPin, Clock, Users } from 'lucide-react';
import { Button, Card, Badge, EmptyState } from '../../components/ui/Components';

export function CompanyJobs() {
  const { currentCompanyId, jobs, applications } = useStore();
  const companyJobs = jobs.filter(j => j.companyId === currentCompanyId);

  return (
    <div className="space-y-[24px] page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-[-0.01em]">Jobs</h1>
          <p className="text-[14px] text-text-secondary mt-[4px]">{companyJobs.length} total jobs</p>
        </div>
        <Link to="/company/jobs/new">
          <Button variant="primary">
            <Plus className="w-[16px] h-[16px] stroke-[2px]" /> Create Job
          </Button>
        </Link>
      </div>

      {companyJobs.length === 0 ? (
        <Card className="flex items-center justify-center min-h-[300px]">
          <EmptyState
            icon={<Briefcase className="w-[48px] h-[48px]" />}
            title="No jobs created yet"
            description="Create your first job role to start receiving candidates."
            action={
              <Link to="/company/jobs/new">
                <Button variant="primary">
                  <Plus className="w-[16px] h-[16px]" /> Create Job
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-[16px] stagger-in">
          {companyJobs.map(job => {
            const jobApps = applications.filter(a => a.jobId === job.id);
            const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Link key={job.id} to={`/company/jobs/${job.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-lg">
                <Card hover className="flex flex-col sm:flex-row sm:items-start justify-between gap-[16px] p-[24px] group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[12px]">
                      <h3 className="text-[16px] font-semibold text-text group-hover:text-primary transition-colors">{job.title}</h3>
                      <Badge variant={
                        job.status === 'published' ? 'success' :
                        job.status === 'draft' ? 'default' :
                        'danger'
                      }>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-[16px] mt-[12px] text-[13px] text-text-secondary">
                      <span className="font-medium text-text">{job.department}</span>
                      <span className="flex items-center gap-[6px]">
                        <MapPin className="w-[14px] h-[14px]" /> {job.location}
                      </span>
                      <span className="flex items-center gap-[6px] capitalize">
                        <Clock className="w-[14px] h-[14px]" /> {job.employmentType.replace('-', ' ')}
                      </span>
                      <span className="flex items-center gap-[6px]">
                        <Users className="w-[14px] h-[14px]" /> {job.openings} opening{job.openings !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-[16px] sm:gap-[4px]">
                    <div className="flex items-baseline gap-[6px]">
                      <span className="text-[18px] font-bold text-text">{jobApps.length}</span>
                      <span className="text-[13px] text-text-secondary">applicants</span>
                    </div>
                    <p className="text-[12px] text-text-muted">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
