// ============================================================
// HireFlow — Public Job Detail Page
// ============================================================
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  ArrowLeft, MapPin, Briefcase, Clock, Building2, Calendar,
  DollarSign, Users, CheckCircle, Star, Sparkles, ExternalLink
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function PublicJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, companies, isAuthenticated, currentUser, applications, createApplication } = useStore();
  
  const job = jobs.find(j => j.id === id);
  const company = job ? companies.find(c => c.id === job.companyId) : null;

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Job not found</h2>
          <Link to="/jobs" className="text-primary text-sm font-medium hover:text-primary-hover">← Back to Jobs</Link>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-surface rounded-card border border-border p-6 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
                  <p className="text-base text-secondary mt-1 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {company?.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.workMode === 'remote' ? 'Remote' : job.workMode === 'hybrid' ? 'Hybrid' : 'On-site'}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{job.employmentType.replace('-', ' ')}</span>
                {job.salaryMin && job.salaryMax && (
                  <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />{formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}</span>
                )}
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
              </div>

              <p className="text-xs text-muted mt-3">Posted {daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}</p>
            </div>

            {/* Description */}
            <div className="bg-surface rounded-card border border-border p-6 animate-slide-up">
              <h2 className="text-lg font-semibold text-foreground mb-3">About the Role</h2>
              <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">{job.summary}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-surface rounded-card border border-border p-6 animate-slide-up">
                <h2 className="text-lg font-semibold text-foreground mb-3">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-secondary">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            <div className="bg-surface rounded-card border border-border p-6 animate-slide-up">
              <h2 className="text-lg font-semibold text-foreground mb-4">Requirements</h2>
              
              {mandatoryReqs.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    Must Have
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mandatoryReqs.map(r => (
                      <span key={r.id} className="px-3 py-1 bg-red-50 text-danger text-xs font-medium rounded-full border border-red-100">
                        {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preferredReqs.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    Nice to Have
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {preferredReqs.map(r => (
                      <span key={r.id} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
                        {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {optionalReqs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted" />
                    Optional
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {optionalReqs.map(r => (
                      <span key={r.id} className="px-3 py-1 bg-gray-50 text-muted text-xs font-medium rounded-full border border-gray-200">
                        {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div className="bg-surface rounded-card border border-border p-5 sticky top-20 animate-slide-up">
              <button
                onClick={handleApply}
                disabled={!!hasApplied}
                className={`w-full py-3 text-sm font-semibold rounded-btn transition-all flex items-center justify-center gap-2 ${
                  hasApplied
                    ? 'bg-success/10 text-success cursor-default'
                    : 'bg-black-btn text-white hover:bg-black-hover shadow-sm hover:shadow-md'
                }`}
              >
                {hasApplied ? (
                  <><CheckCircle className="w-4 h-4" /> Applied</>
                ) : (
                  <>Apply Now</>
                )}
              </button>

              {job.deadline && (
                <p className="text-xs text-muted text-center mt-3 flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Company Info */}
            {company && (
              <div className="bg-surface rounded-card border border-border p-5 animate-slide-up">
                <h3 className="text-sm font-semibold text-foreground mb-3">About {company.name}</h3>
                <p className="text-sm text-secondary mb-3 leading-relaxed">{company.description}</p>
                <div className="space-y-2 text-xs text-muted">
                  <p className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{company.industry}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{company.location}</p>
                  <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{company.size} employees</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
