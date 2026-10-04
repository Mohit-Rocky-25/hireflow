// ============================================================
// HireFlow v2 — Company Jobs Management
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Plus, Briefcase, MapPin, Clock, Users, IndianRupee } from 'lucide-react';
import { Button, Card, Badge, EmptyState } from '../../components/ui/Components';

export function CompanyJobs() {
  const { currentCompanyId, jobs, applications, users } = useStore();
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
        <Card className="p-0 overflow-x-auto stagger-in">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Job Role</th>
                <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Department / Owner</th>
                <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Location / Mode</th>
                <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Salary</th>
                <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Pipeline</th>
                <th className="px-[20px] py-[12px] text-[12px] font-semibold text-text-secondary uppercase tracking-wider text-right">Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {companyJobs.map(job => {
                const jobApps = applications.filter(a => a.jobId === job.id);
                const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                const owner = users.find(u => u.companyId === job.companyId && u.role === 'BHR_MANAGER');
                
                // stage breakdown
                const applied = jobApps.filter(a => a.status === 'APPLIED').length;
                const screening = jobApps.filter(a => ['SCREENING', 'REVIEW'].includes(a.status)).length;
                const interviewing = jobApps.filter(a => a.status === 'INTERVIEW').length;
                const offers = jobApps.filter(a => ['OFFER', 'HIRED'].includes(a.status)).length;

                return (
                  <tr key={job.id} className="hover:bg-surface-2 transition-colors duration-150 group">
                    <td className="px-[20px] py-[16px] max-w-[250px]">
                      <Link to={`/company/jobs/${job.id}`} className="block focus-visible:outline-primary">
                        <div className="font-semibold text-text group-hover:text-primary transition-colors truncate">{job.title}</div>
                        <div className="text-[12px] text-text-secondary mt-[2px]">{jobApps.length} applicants</div>
                      </Link>
                    </td>
                    <td className="px-[20px] py-[16px]">
                      <Badge variant={job.status === 'published' ? 'success' : job.status === 'draft' ? 'default' : 'danger'}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-[20px] py-[16px]">
                      <div className="text-[13px] font-medium text-text">{job.department}</div>
                      <div className="text-[12px] text-text-secondary mt-[2px]">{owner?.displayName || 'Recruiter'}</div>
                    </td>
                    <td className="px-[20px] py-[16px]">
                      <div className="text-[13px] text-text">{job.location}</div>
                      <div className="text-[12px] text-text-secondary mt-[2px] capitalize">{job.workMode}</div>
                    </td>
                    <td className="px-[20px] py-[16px]">
                      <div className="text-[13px] text-text whitespace-nowrap">
                        {job.salaryCurrency === 'INR' ? '₹' : job.salaryCurrency} {job.salaryMin ? (job.salaryMin / 100000).toFixed(1) : '?'} - {job.salaryMax ? (job.salaryMax / 100000).toFixed(1) : '?'} LPA
                      </div>
                    </td>
                    <td className="px-[20px] py-[16px]">
                      <div className="flex items-center gap-[4px] text-[11px] font-medium text-text-secondary">
                        <span className="bg-surface border border-border px-1.5 py-0.5 rounded" title="Applied">{applied}A</span>
                        <span className="bg-surface border border-border px-1.5 py-0.5 rounded" title="Screening">{screening}S</span>
                        <span className="bg-surface border border-border px-1.5 py-0.5 rounded" title="Interviewing">{interviewing}I</span>
                        <span className="bg-surface border border-border px-1.5 py-0.5 rounded" title="Offered/Hired">{offers}O</span>
                      </div>
                    </td>
                    <td className="px-[20px] py-[16px] text-right text-[13px] text-text-secondary">
                      {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
