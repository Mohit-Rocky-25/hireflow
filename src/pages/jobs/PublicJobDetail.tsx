// ============================================================
// HireFlow v2 — Public Job Detail Page
// ============================================================
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  ArrowLeft, MapPin, Briefcase, Clock, Building2, Calendar,
  DollarSign, Users, CheckCircle
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { Button, Card, Badge } from '../../components/ui/Components';

export function PublicJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, companies, isAuthenticated, currentUser, applications, createApplication } = useStore();
  
  const job = jobs.find(j => j.id === id);
  const company = job ? companies.find(c => c.id === job.companyId) : null;

  if (!job) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center page-enter">
          <h2 className="text-[20px] font-semibold text-text mb-[8px]">Job not found</h2>
          <Link to="/jobs" className="text-primary text-[14px] font-medium hover:text-primary-hover">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  const hasApplied = currentUser && applications.some(
    a => a.jobId === job.id && a.candidateId === currentUser.id
  );

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (currentUser?.role !== 'CANDIDATE') {
      toast('error', 'Only candidates can apply to jobs');
      return;
    }
    if (hasApplied) {
      toast('warning', 'You have already applied to this job');
      return;
    }

    createApplication({
      jobId: job.id,
      candidateId: currentUser!.id,
      companyId: job.companyId,
      status: 'APPLIED',
    });
    toast('success', 'Application submitted successfully!');
  };

  const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt || job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const mandatoryReqs = job.requirements.filter(r => r.priority === 'MANDATORY');
  const preferredReqs = job.requirements.filter(r => r.priority === 'PREFERRED');
  const optionalReqs = job.requirements.filter(r => r.priority === 'OPTIONAL');

  const formatSalary = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-[1000px] mx-auto px-[24px] h-[56px] flex items-center gap-[16px]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-[6px] text-[14px] text-text-muted hover:text-text transition-colors duration-[120ms]">
            <ArrowLeft className="w-[16px] h-[16px] stroke-[1.5px]" />
            Back
          </button>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-[24px] py-[32px] page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-[24px]">
            {/* Job Header */}
            <Card className="p-[24px] stagger-in">
              <h1 className="text-[28px] font-bold text-text tracking-[-0.01em]">{job.title}</h1>
              <p className="text-[16px] text-text-secondary mt-[8px] flex items-center gap-[6px]">
                <Building2 className="w-[18px] h-[18px] text-text-muted" />
                {company?.name}
              </p>

              <div className="flex flex-wrap items-center gap-[16px] mt-[16px] text-[14px] text-text-muted">
                <span className="flex items-center gap-[6px]"><MapPin className="w-[16px] h-[16px]" />{job.location}</span>
                <span className="flex items-center gap-[6px]"><Briefcase className="w-[16px] h-[16px]" />{job.workMode === 'remote' ? 'Remote' : job.workMode === 'hybrid' ? 'Hybrid' : 'On-site'}</span>
                <span className="flex items-center gap-[6px] capitalize"><Clock className="w-[16px] h-[16px]" />{job.employmentType.replace('-', ' ')}</span>
                {job.salaryMin && job.salaryMax && (
                  <span className="flex items-center gap-[6px]"><DollarSign className="w-[16px] h-[16px]" />{formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}</span>
                )}
                <span className="flex items-center gap-[6px]"><Users className="w-[16px] h-[16px]" />{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
              </div>

              <p className="text-[12px] text-text-muted mt-[16px]">Posted {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}</p>
            </Card>

            {/* Description */}
            <Card className="p-[24px] stagger-in">
              <h2 className="text-[18px] font-semibold text-text mb-[12px]">About the Role</h2>
              <p className="text-[15px] text-text-secondary leading-[26px] whitespace-pre-wrap">{job.summary}</p>
            </Card>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <Card className="p-[24px] stagger-in">
                <h2 className="text-[18px] font-semibold text-text mb-[16px]">Responsibilities</h2>
                <ul className="space-y-[12px]">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-[10px] text-[15px] text-text-secondary leading-[24px]">
                      <CheckCircle className="w-[18px] h-[18px] text-success mt-[3px] shrink-0 stroke-[1.5px]" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Requirements */}
            <Card className="p-[24px] stagger-in">
              <h2 className="text-[18px] font-semibold text-text mb-[20px]">Requirements</h2>
              
              {mandatoryReqs.length > 0 && (
                <div className="mb-[20px]">
                  <h3 className="text-[14px] font-semibold text-text mb-[12px] flex items-center gap-[8px]">
                    <span className="w-[8px] h-[8px] rounded-full bg-danger" />
                    Must Have
                  </h3>
                  <div className="flex flex-wrap gap-[8px]">
                    {mandatoryReqs.map(r => (
                      <Badge key={r.id} variant="danger">{r.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {preferredReqs.length > 0 && (
                <div className="mb-[20px]">
                  <h3 className="text-[14px] font-semibold text-text mb-[12px] flex items-center gap-[8px]">
                    <span className="w-[8px] h-[8px] rounded-full bg-warning" />
                    Nice to Have
                  </h3>
                  <div className="flex flex-wrap gap-[8px]">
                    {preferredReqs.map(r => (
                      <Badge key={r.id} variant="warning">{r.name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {optionalReqs.length > 0 && (
                <div>
                  <h3 className="text-[14px] font-semibold text-text mb-[12px] flex items-center gap-[8px]">
                    <span className="w-[8px] h-[8px] rounded-full bg-text-muted" />
                    Optional
                  </h3>
                  <div className="flex flex-wrap gap-[8px]">
                    {optionalReqs.map(r => (
                      <Badge key={r.id} variant="default">{r.name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-[24px]">
            {/* Apply Card */}
            <Card className="sticky top-[80px] p-[24px] stagger-in">
              <Button
                variant={hasApplied ? 'secondary' : 'primary'}
                onClick={handleApply}
                disabled={!!hasApplied}
                className={`w-full h-[48px] text-[15px] ${hasApplied ? 'bg-success-bg text-success border-success/20 cursor-default hover:bg-success-bg' : ''}`}
              >
                {hasApplied ? (
                  <><CheckCircle className="w-[18px] h-[18px]" /> Applied</>
                ) : (
                  <>Apply Now</>
                )}
              </Button>

              {job.deadline && (
                <p className="text-[12px] text-text-muted text-center mt-[16px] flex items-center justify-center gap-[6px]">
                  <Calendar className="w-[14px] h-[14px]" />
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              )}
            </Card>

            {/* Company Info */}
            {company && (
              <Card className="p-[24px] stagger-in">
                <h3 className="text-[15px] font-semibold text-text mb-[12px]">About {company.name}</h3>
                <p className="text-[14px] text-text-secondary mb-[16px] leading-[22px]">{company.description}</p>
                <div className="space-y-[10px] text-[13px] text-text-muted">
                  <p className="flex items-center gap-[8px]"><Building2 className="w-[16px] h-[16px]" />{company.industry}</p>
                  <p className="flex items-center gap-[8px]"><MapPin className="w-[16px] h-[16px]" />{company.location}</p>
                  <p className="flex items-center gap-[8px]"><Users className="w-[16px] h-[16px]" />{company.size} employees</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
