// ============================================================
// HireFlow — Create Job (Multi-Step)
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { toast } from '../../components/ui/Toast';
import { ArrowLeft, ArrowRight, Check, Sparkles, Plus, X, AlertCircle } from 'lucide-react';
import type { JobRequirement, RequirementPriority, ScreeningConfig } from '../../types';

const STEPS = ['Basic Info', 'Description', 'Requirements', 'Weights', 'Screening', 'Preview', 'Publish'];

export function CreateJob() {
  const navigate = useNavigate();
  const { currentCompanyId, createJob, publishJob } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', department: '', employmentType: 'full-time' as const, workMode: 'hybrid' as const,
    location: '', salaryMin: '', salaryMax: '', openings: '1', deadline: '',
    summary: '', responsibilities: [''], dayToDay: [''],
    teamDescription: '',
  });
  const [requirements, setRequirements] = useState<Omit<JobRequirement, 'id' | 'jobId'>[]>([]);
  const [newReq, setNewReq] = useState({ name: '', category: 'skill' as JobRequirement['category'], priority: 'MANDATORY' as RequirementPriority, weight: 10, description: '' });
  const [screening, setScreening] = useState<ScreeningConfig>({
    autoResumeExtraction: true, skillMatching: true, experienceMatching: true,
    educationMatching: true, projectRelevance: true, certificationMatching: true,
    aiExplanation: true, minimumThreshold: 70, autoShortlist: false,
  });

  const totalWeight = requirements.reduce((s, r) => s + r.weight, 0);

  const addRequirement = () => {
    if (!newReq.name) return;
    setRequirements(prev => [...prev, { ...newReq }]);
    setNewReq({ name: '', category: 'skill', priority: 'MANDATORY', weight: 10, description: '' });
  };

  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    if (!currentCompanyId) return;
    const job = createJob({
      companyId: currentCompanyId,
      title: form.title, department: form.department,
      employmentType: form.employmentType, workMode: form.workMode,
      location: form.location,
      salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
      salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      salaryCurrency: 'INR', openings: Number(form.openings) || 1,
      deadline: form.deadline || undefined,
      summary: form.summary,
      responsibilities: form.responsibilities.filter(Boolean),
      dayToDay: form.dayToDay.filter(Boolean),
      teamDescription: form.teamDescription,
      requirements: requirements.map((r, i) => ({ ...r, id: `req-new-${i}`, jobId: '' })),
      screeningConfig: screening,
      status: 'draft',
    });
    publishJob(job.id);
    toast('success', `Job "${form.title}" published successfully!`);
    navigate('/company/jobs');
  };

  const handleSaveDraft = () => {
    if (!currentCompanyId) return;
    createJob({
      companyId: currentCompanyId,
      title: form.title || 'Untitled Job', department: form.department || '',
      employmentType: form.employmentType, workMode: form.workMode,
      location: form.location || '', salaryCurrency: 'INR', openings: Number(form.openings) || 1,
      summary: form.summary || '', responsibilities: form.responsibilities.filter(Boolean),
      requirements: requirements.map((r, i) => ({ ...r, id: `req-new-${i}`, jobId: '' })),
      screeningConfig: screening, status: 'draft',
    });
    toast('info', 'Job saved as draft');
    navigate('/company/jobs');
  };

  const canNext = () => {
    if (step === 0) return form.title && form.department && form.location;
    if (step === 1) return form.summary;
    if (step === 2) return requirements.length > 0;
    if (step === 3) return totalWeight >= 95 && totalWeight <= 105;
    return true;
  };

  const updateListField = (field: 'responsibilities' | 'dayToDay', index: number, value: string) => {
    setForm(f => ({ ...f, [field]: f[field].map((v: string, i: number) => i === index ? value : v) }));
  };
  const addListItem = (field: 'responsibilities' | 'dayToDay') => {
    setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  };
  const removeListItem = (field: 'responsibilities' | 'dayToDay', index: number) => {
    setForm(f => ({ ...f, [field]: f[field].filter((_: string, i: number) => i !== index) }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-btn hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Create New Job</h1>
          <p className="text-sm text-muted">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-1">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-border'}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => i < step && setStep(i)} className={`${i <= step ? 'text-primary font-medium' : ''} ${i < step ? 'cursor-pointer hover:text-primary-hover' : 'cursor-default'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-surface rounded-card border border-border p-6 animate-slide-up">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Job Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Backend Developer" className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department *</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Engineering" className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Employment Type</label>
                <select value={form.employmentType} onChange={e => setForm(f => ({ ...f, employmentType: e.target.value as any }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none">
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Work Mode</label>
                <select value={form.workMode} onChange={e => setForm(f => ({ ...f, workMode: e.target.value as any }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none">
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Location *</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Bangalore, India" className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Min Salary (₹)</label>
                <input type="number" value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} placeholder="800000" className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Max Salary (₹)</label>
                <input type="number" value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} placeholder="1500000" className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Openings</label>
                <input type="number" min="1" value={form.openings} onChange={e => setForm(f => ({ ...f, openings: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Description */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Job Description</h2>
              <button className="px-3 py-1.5 text-xs font-medium text-ai bg-ai-light rounded-btn hover:bg-ai/10 transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Improve
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Role Summary *</label>
              <textarea rows={4} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Describe the role, team, and impact..." className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Responsibilities</label>
              {form.responsibilities.map((r, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={r} onChange={e => updateListField('responsibilities', i, e.target.value)} placeholder={`Responsibility ${i + 1}`} className="flex-1 px-4 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none" />
                  {form.responsibilities.length > 1 && <button onClick={() => removeListItem('responsibilities', i)} className="p-2 text-muted hover:text-danger"><X className="w-4 h-4" /></button>}
                </div>
              ))}
              <button onClick={() => addListItem('responsibilities')} className="text-xs text-primary font-medium hover:text-primary-hover flex items-center gap-1 mt-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Team Description</label>
              <textarea rows={2} value={form.teamDescription} onChange={e => setForm(f => ({ ...f, teamDescription: e.target.value }))} placeholder="Describe the team..." className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none resize-none" />
            </div>
          </div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Candidate Requirements</h2>
            <div className="bg-gray-50 rounded-btn p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={newReq.name} onChange={e => setNewReq(r => ({ ...r, name: e.target.value }))} placeholder="Requirement name (e.g. Java)" className="px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none bg-surface" />
                <select value={newReq.category} onChange={e => setNewReq(r => ({ ...r, category: e.target.value as any }))} className="px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none bg-surface">
                  <option value="skill">Skill</option>
                  <option value="experience">Experience</option>
                  <option value="education">Education</option>
                  <option value="certification">Certification</option>
                  <option value="technology">Technology</option>
                  <option value="domain">Domain</option>
                </select>
                <select value={newReq.priority} onChange={e => setNewReq(r => ({ ...r, priority: e.target.value as any }))} className="px-3 py-2 border border-border rounded-btn text-sm focus:border-primary outline-none bg-surface">
                  <option value="MANDATORY">Mandatory</option>
                  <option value="PREFERRED">Preferred</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
                <button onClick={addRequirement} disabled={!newReq.name} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-btn hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-1 justify-center">
                  <Plus className="w-4 h-4" />Add
                </button>
              </div>
            </div>
            {requirements.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No requirements added yet. Add at least one requirement to proceed.</p>
            ) : (
              <div className="space-y-2">
                {requirements.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-btn">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${r.priority === 'MANDATORY' ? 'bg-danger' : r.priority === 'PREFERRED' ? 'bg-warning' : 'bg-muted'}`} />
                      <span className="text-sm font-medium text-foreground">{r.name}</span>
                      <span className="text-xs text-muted capitalize">{r.category} • {r.priority.toLowerCase()}</span>
                    </div>
                    <button onClick={() => removeRequirement(i)} className="p-1 text-muted hover:text-danger"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Weights */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Requirement Weights</h2>
            <p className="text-sm text-muted">Configure the importance of each requirement. Total must be approximately 100%.</p>
            <div className={`text-sm font-semibold px-3 py-2 rounded-btn ${totalWeight >= 95 && totalWeight <= 105 ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'}`}>
              Total Weight: {totalWeight}% {totalWeight >= 95 && totalWeight <= 105 ? '✓' : '(must be ~100%)'}
            </div>
            <div className="space-y-3">
              {requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-btn">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${r.priority === 'MANDATORY' ? 'bg-danger' : r.priority === 'PREFERRED' ? 'bg-warning' : 'bg-muted'}`} />
                  <span className="text-sm font-medium text-foreground flex-1">{r.name}</span>
                  <span className="text-xs text-muted capitalize">{r.priority.toLowerCase()}</span>
                  <div className="flex items-center gap-2">
                    <input type="range" min="0" max="50" value={r.weight} onChange={e => setRequirements(prev => prev.map((pr, pi) => pi === i ? { ...pr, weight: Number(e.target.value) } : pr))} className="w-24 accent-primary" />
                    <span className="text-sm font-semibold text-foreground w-10 text-right">{r.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Screening */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Screening Configuration</h2>
            <div className="space-y-3">
              {[
                { key: 'autoResumeExtraction', label: 'Automatic Resume Extraction' },
                { key: 'skillMatching', label: 'Skill Matching' },
                { key: 'experienceMatching', label: 'Experience Matching' },
                { key: 'educationMatching', label: 'Education Matching' },
                { key: 'projectRelevance', label: 'Project Relevance' },
                { key: 'certificationMatching', label: 'Certification Matching' },
                { key: 'aiExplanation', label: 'AI Explanation' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-btn cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <input type="checkbox" checked={(screening as any)[item.key]} onChange={e => setScreening(s => ({ ...s, [item.key]: e.target.checked }))} className="w-4 h-4 accent-primary rounded" />
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Minimum Threshold (%)</label>
                <input type="number" min="0" max="100" value={screening.minimumThreshold} onChange={e => setScreening(s => ({ ...s, minimumThreshold: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Auto Shortlist</label>
                <select value={screening.autoShortlist ? 'on' : 'off'} onChange={e => setScreening(s => ({ ...s, autoShortlist: e.target.value === 'on' }))} className="w-full px-4 py-2.5 border border-border rounded-btn text-sm focus:border-primary outline-none">
                  <option value="off">Off (Recommended)</option>
                  <option value="on">On</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />AI recommends → Human reviews → Human decides</p>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Preview</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted">Title</span><span className="font-medium text-foreground">{form.title}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted">Department</span><span className="font-medium">{form.department}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted">Location</span><span className="font-medium">{form.location}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted">Type</span><span className="font-medium capitalize">{form.employmentType.replace('-', ' ')} • {form.workMode}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted">Openings</span><span className="font-medium">{form.openings}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="text-muted">Requirements</span><span className="font-medium">{requirements.length} total</span></div>
              <div className="flex justify-between py-2"><span className="text-muted">Total Weight</span><span className="font-medium">{totalWeight}%</span></div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {requirements.map((r, i) => (
                <span key={i} className={`px-2.5 py-1 text-xs font-medium rounded-full ${r.priority === 'MANDATORY' ? 'bg-red-50 text-danger' : r.priority === 'PREFERRED' ? 'bg-amber-50 text-warning' : 'bg-gray-100 text-muted'}`}>
                  {r.name} ({r.weight}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Publish */}
        {step === 6 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-success/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Ready to Publish</h2>
            <p className="text-sm text-secondary mb-6">Your job "{form.title}" is ready to go live. Candidates will be able to find and apply.</p>
            <div className="flex justify-center gap-3">
              <button onClick={handleSaveDraft} className="px-5 py-2.5 border border-border text-sm font-medium rounded-btn hover:bg-gray-50 transition-colors">Save Draft</button>
              <button onClick={handlePublish} className="px-8 py-2.5 bg-black-btn text-white text-sm font-semibold rounded-btn hover:bg-black-hover transition-all shadow-sm">Publish Job</button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 6 && (
        <div className="flex justify-between">
          <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0} className="px-5 py-2.5 text-sm font-medium text-muted hover:text-foreground disabled:opacity-30 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" />Previous
          </button>
          <div className="flex gap-3">
            <button onClick={handleSaveDraft} className="px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground border border-border rounded-btn hover:bg-gray-50 transition-colors">Save Draft</button>
            <button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()} className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center gap-2">
              Next<ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
