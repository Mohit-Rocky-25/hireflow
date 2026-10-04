// ============================================================
// HireFlow — Offer Management Page (BHR View)
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Award, CheckCircle, Clock, XCircle, DollarSign,
  Calendar, User, Briefcase, ArrowRight, FileText, Send
} from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function CompanyOffers() {
  const {
    currentCompanyId, applications, jobs, users, candidateProfiles,
    updateApplicationStatus, addNotification
  } = useStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  // Applications in offer/final stage
  const offerApps = applications.filter(a =>
    a.companyId === currentCompanyId &&
    ['OFFER', 'HIRED', 'FINAL_REVIEW'].includes(a.status)
  );

  const pending = offerApps.filter(a => a.status === 'OFFER');
  const accepted = offerApps.filter(a => a.status === 'HIRED');
  const rejected = offerApps.filter(a => a.status === 'FINAL_REVIEW');

  const [offerForms, setOfferForms] = useState<Record<string, { salary: string; startDate: string; note: string }>>({});

  const getForm = (appId: string) => offerForms[appId] || { salary: '', startDate: '', note: '' };
  const setForm = (appId: string, updates: Partial<{ salary: string; startDate: string; note: string }>) => {
    setOfferForms(prev => ({ ...prev, [appId]: { ...getForm(appId), ...updates } }));
  };

  const handleSendOffer = (app: typeof offerApps[0]) => {
    updateApplicationStatus(app.id, 'OFFER', `Offer extended. ${getForm(app.id).note}`);
    addNotification({
      userId: app.candidateId,
      type: 'offer',
      title: 'Offer Extended! 🎉',
      message: `You have received a job offer! Check your application for details.`,
      link: `/candidate/applications/${app.id}`,
    });
    toast('success', 'Offer sent to candidate!');
  };

  const handleMarkHired = (app: typeof offerApps[0]) => {
    updateApplicationStatus(app.id, 'HIRED', 'Offer accepted. Candidate marked as hired.');
    addNotification({
      userId: app.candidateId,
      type: 'offer',
      title: 'Welcome to the Team! 🎊',
      message: `Congratulations! Your offer has been confirmed.`,
      link: `/candidate/applications/${app.id}`,
    });
    toast('success', 'Candidate marked as Hired!');
  };

  const handleReject = (app: typeof offerApps[0]) => {
    updateApplicationStatus(app.id, 'REJECTED', 'Application declined at offer stage.');
    addNotification({
      userId: app.candidateId,
      type: 'status_change',
      title: 'Application Update',
      message: `We regret to inform you that your application has not been moved forward at this time.`,
      link: `/candidate/applications/${app.id}`,
    });
    toast('info', 'Application declined.');
  };

  const renderApp = (app: typeof offerApps[0], showActions = true) => {
    const candidate = users.find(u => u.id === app.candidateId);
    const job = jobs.find(j => j.id === app.jobId);
    const profile = candidateProfiles.find(p => p.userId === app.candidateId);
    const form = getForm(app.id);

    return (
      <div key={app.id} className="bg-surface rounded-card border border-border p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {candidate?.displayName?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'}
            </div>
            <div>
              <p className="font-semibold text-foreground">{candidate?.displayName || 'Candidate'}</p>
              <p className="text-xs text-muted">{candidate?.email}</p>
              {profile?.headline && <p className="text-xs text-secondary">{profile.headline}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{job?.title || 'Position'}</p>
            <p className="text-xs text-muted">{job?.department} • {job?.location}</p>
            <span className={`mt-1 inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
              app.status === 'HIRED' ? 'bg-green-50 text-success' :
              app.status === 'OFFER' ? 'bg-amber-50 text-amber-700' :
              'bg-purple-50 text-purple-700'
            }`}>
              {app.status}
            </span>
          </div>
        </div>

        {showActions && app.status === 'FINAL_REVIEW' && (
          <div className="space-y-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted uppercase">Prepare Offer</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Salary (USD/year)</label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                  <input
                    type="number"
                    value={form.salary}
                    onChange={e => setForm(app.id, { salary: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="e.g. 95000"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(app.id, { startDate: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted mb-1 block">Note to Candidate (Optional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={e => setForm(app.id, { note: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Congratulations! We are excited to offer you..."
                />
              </div>
            </div>
            <button
              onClick={() => handleSendOffer(app)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" /> Send Offer
            </button>
          </div>
        )}

        {showActions && app.status === 'OFFER' && (
          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <p className="text-xs text-muted flex-1">
              <Clock className="w-3.5 h-3.5 inline mr-1" /> Offer pending candidate response
            </p>
            <button
              onClick={() => handleMarkHired(app)}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white text-xs font-semibold rounded-btn hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Mark Hired
            </button>
            <button
              onClick={() => handleReject(app)}
              className="flex items-center gap-2 px-4 py-2 border border-danger text-danger text-xs font-semibold rounded-btn hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Decline
            </button>
          </div>
        )}

        {app.status === 'HIRED' && (
          <div className="flex items-center gap-2 pt-3 border-t border-border text-success">
            <CheckCircle className="w-4 h-4" />
            <p className="text-xs font-semibold">Successfully Hired! Welcome to the team.</p>
          </div>
        )}

        <div className="flex justify-end">
          <Link to={`/company/candidates/${app.candidateId}`} className="text-xs text-primary hover:underline flex items-center gap-1">
            View Full Profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  };

  const tabData = [
    { key: 'pending' as const, label: 'Pending Offers', count: pending.length + rejected.length, icon: Clock },
    { key: 'accepted' as const, label: 'Hired', count: accepted.length, icon: CheckCircle },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" /> Offer Management
          </h1>
          <p className="text-sm text-muted mt-0.5">Manage pending offers and finalize hiring decisions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'In Final Review', value: rejected.length, icon: FileText, color: 'text-purple-600 bg-purple-50' },
          { label: 'Offers Extended', value: pending.length, icon: Send, color: 'text-amber-600 bg-amber-50' },
          { label: 'Hired This Cycle', value: accepted.length, icon: Award, color: 'text-success bg-green-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-surface rounded-card border border-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-btn ${s.color.split(' ')[1]} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${s.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-btn p-1">
        {[
          { key: 'pending', label: `Pending (${rejected.length + pending.length})` },
          { key: 'accepted', label: `Hired (${accepted.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-btn transition-all ${activeTab === t.key ? 'bg-surface text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {rejected.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">In Final Review — Ready to Offer</p>
              {rejected.map(app => renderApp(app, true))}
            </>
          )}
          {pending.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mt-6">Offer Extended — Awaiting Response</p>
              {pending.map(app => renderApp(app, true))}
            </>
          )}
          {rejected.length === 0 && pending.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted">No candidates in final review or offer stage</p>
              <p className="text-xs text-muted mt-1">Move shortlisted candidates to Final Review to manage offers here</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'accepted' && (
        <div className="space-y-4">
          {accepted.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-10 h-10 text-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted">No candidates hired yet</p>
            </div>
          ) : (
            accepted.map(app => renderApp(app, false))
          )}
        </div>
      )}
    </div>
  );
}
