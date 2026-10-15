// ============================================================
// HireFlow — Candidate Applications List
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { FileText, ArrowRight, Building2, Calendar } from 'lucide-react';
import type { ApplicationStatus } from '../../types';

export function CandidateApplications() {
  const { currentUser, applications, jobs, companies } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!currentUser) return null;

  const myApps = applications.filter(a => a.candidateId === currentUser.id);

  const filteredApps = myApps.filter(app => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'OFFER':
      case 'HIRED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SHORTLISTED':
      case 'INTERVIEW':
        return 'bg-blue-50 text-primary border-blue-200';
      case 'REJECTED':
        return 'bg-rose-50 text-danger border-rose-200';
      default:
        return 'bg-gray-100 text-secondary border-border';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Applications</h1>
          <p className="text-sm text-muted">Track the recruitment status across all your submissions.</p>
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-btn border border-border bg-surface text-foreground focus:outline-none focus:border-primary"
        >
          <option value="ALL">All Statuses ({myApps.length})</option>
          <option value="APPLIED">Applied</option>
          <option value="SCREENING">Screening</option>
          <option value="REVIEW">In Review</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="HIRED">Hired</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {filteredApps.length === 0 ? (
        <div className="bg-surface rounded-card border border-border p-12 text-center">
          <FileText className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-foreground">No applications found</p>
          <p className="text-xs text-muted mt-1">Submit your profile to active listings to see them here.</p>
          <Link
            to="/candidate/jobs"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover"
          >
            Browse Open Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map(app => {
            const job = jobs.find(j => j.id === app.jobId);
            const comp = companies.find(c => c.id === app.companyId);

            return (
              <Link
                key={app.id}
                to={`/candidate/applications/${app.id}`}
                className="block bg-surface rounded-card border border-border p-5 hover:border-primary/40 hover:shadow-card-hover transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {job?.title || 'Job Position'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> {comp?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
