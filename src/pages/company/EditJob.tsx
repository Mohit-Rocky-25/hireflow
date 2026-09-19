// ============================================================
// HireFlow — Edit Job Page (reuses CreateJob logic)
// ============================================================
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { WorkMode, EmploymentType } from '../../types';
import { ArrowLeft, Save, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, updateJob, closeJob, publishJob, currentCompanyId } = useStore();

  const job = jobs.find(j => j.id === id);

  const [form, setForm] = useState<{
    title: string;
    department: string;
    location: string;
    workMode: WorkMode;
    employmentType: EmploymentType;
    openings: number;
    salaryMin: number;
    salaryMax: number;
    summary: string;
    deadline: string;
  }>({
    title: job?.title || '',
    department: job?.department || '',
    location: job?.location || '',
    workMode: (job?.workMode || 'hybrid') as WorkMode,
    employmentType: (job?.employmentType || 'full-time') as EmploymentType,
    openings: job?.openings || 1,
    salaryMin: job?.salaryMin || 0,
    salaryMax: job?.salaryMax || 0,
    summary: job?.summary || '',
    deadline: job?.deadline || '',
  });
  const [saving, setSaving] = useState(false);
  const [showClose, setShowClose] = useState(false);

  if (!job || job.companyId !== currentCompanyId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Job not found or access denied.</p>
        <button onClick={() => navigate('/company/jobs')} className="mt-4 text-primary text-sm hover:underline">
          ← Back to Jobs
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.location.trim()) {
      toast('error', 'Title and location are required');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateJob(job.id, {
        title: form.title.trim(),
        department: form.department.trim(),
        location: form.location.trim(),
        workMode: form.workMode,
        employmentType: form.employmentType,
        openings: Number(form.openings),
        salaryMin: Number(form.salaryMin) || undefined,
        salaryMax: Number(form.salaryMax) || undefined,
        summary: form.summary.trim(),
        deadline: form.deadline || undefined,
      });
      setSaving(false);
      toast('success', 'Job updated successfully!');
    }, 600);
  };

  const handleClose = () => {
    closeJob(job.id);
    toast('info', 'Job has been closed');
    navigate('/company/jobs');
  };

  const handlePublish = () => {
    publishJob(job.id);
    toast('success', 'Job published!');
    navigate(`/company/jobs/${job.id}`);
  };

  const inputCls = 'w-full px-3 py-2.5 border border-border rounded-btn text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface';
  const labelCls = 'block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/company/jobs/${job.id}`)} className="p-2 rounded-btn hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Edit Job</h1>
          <p className="text-sm text-muted">{job.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
            job.status === 'published' ? 'bg-green-50 text-success border border-green-200' :
            job.status === 'draft' ? 'bg-gray-100 text-muted border border-gray-200' :
            'bg-red-50 text-danger border border-red-200'
          }`}>
            {job.status}
          </span>
        </div>
      </div>

      {/* Status Actions Banner */}
      {job.status === 'draft' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-card">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">This job is a draft</p>
            <p className="text-xs text-amber-700 mt-0.5">Save your changes, then publish to make it visible to candidates.</p>
          </div>
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-btn hover:bg-amber-700 transition-colors shrink-0"
          >
            Publish Now
          </button>
        </div>
      )}

      {job.status === 'published' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-card">
          <CheckCircle className="w-5 h-5 text-success shrink-0" />
          <p className="text-sm text-success flex-1">This job is live. Candidates can discover and apply.</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-surface rounded-card border border-border p-6 space-y-5">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Basic Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Job Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div>
            <label className={labelCls}>Department</label>
            <input type="text" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} className={inputCls} placeholder="e.g. Engineering" />
          </div>
          <div>
            <label className={labelCls}>Location *</label>
            <input type="text" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputCls} placeholder="e.g. San Francisco, CA" />
          </div>
          <div>
            <label className={labelCls}>Number of Openings</label>
            <input type="number" min="1" value={form.openings} onChange={e => setForm(f => ({ ...f, openings: Number(e.target.value) }))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Work Mode</label>
            <select value={form.workMode} onChange={e => setForm(f => ({ ...f, workMode: e.target.value as WorkMode }))} className={inputCls}>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Employment Type</label>
            <select value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value as EmploymentType }))} className={inputCls}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Salary Min (USD)</label>
            <input type="number" min="0" value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: Number(e.target.value) }))} className={inputCls} placeholder="e.g. 80000" />
          </div>
          <div>
            <label className={labelCls}>Salary Max (USD)</label>
            <input type="number" min="0" value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: Number(e.target.value) }))} className={inputCls} placeholder="e.g. 120000" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Application Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-card border border-border p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground border-b border-border pb-3">Job Summary</h2>
        <div>
          <label className={labelCls}>Description / Summary</label>
          <textarea
            rows={6}
            value={form.summary}
            onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
            className={inputCls + ' resize-none'}
            placeholder="Describe the role, team culture, and what makes this position exciting..."
          />
        </div>
        <p className="text-xs text-muted">
          Note: Job requirements and screening configuration can be managed from the job detail page.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-6">
        {job.status !== 'closed' && (
          <div>
            {!showClose ? (
              <button onClick={() => setShowClose(true)} className="flex items-center gap-2 px-4 py-2 text-sm text-danger border border-danger/30 rounded-btn hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" /> Close Job
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-btn">
                <span className="text-xs text-danger font-medium">Are you sure?</span>
                <button onClick={handleClose} className="px-3 py-1 bg-danger text-white text-xs font-semibold rounded-btn hover:bg-red-700">Yes, Close</button>
                <button onClick={() => setShowClose(false)} className="px-3 py-1 text-xs text-muted border border-border rounded-btn hover:bg-gray-50">Cancel</button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => navigate(`/company/jobs/${job.id}`)}
            className="px-4 py-2 text-sm border border-border rounded-btn text-muted hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
