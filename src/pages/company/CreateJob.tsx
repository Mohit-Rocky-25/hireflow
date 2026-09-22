// ============================================================
// HireFlow v2 — Create Job (Multi-Step)
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { toast } from '../../components/ui/Toast';
import { ArrowLeft, ArrowRight, Check, Sparkles, Plus, X, AlertCircle } from 'lucide-react';
import { Button, Card, Input, Select, Textarea, Badge, EmptyState } from '../../components/ui/Components';
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
    <div className="max-w-[800px] mx-auto space-y-[24px] page-enter">
      {/* Header */}
      <div className="flex items-center gap-[16px]">
        <button onClick={() => navigate(-1)} className="p-[8px] rounded-md hover:bg-surface-2 transition-colors">
          <ArrowLeft className="w-[20px] h-[20px] text-text-muted hover:text-text stroke-[1.5px]" />
        </button>
        <div>
          <h1 className="text-[24px] font-bold text-text tracking-[-0.01em]">Create New Job</h1>
          <p className="text-[14px] text-text-secondary mt-[4px]">Step {step + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-[4px]">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col gap-[8px]">
            <div className={`h-[4px] rounded-full transition-colors duration-[200ms] ${i <= step ? 'bg-primary' : 'bg-surface-2'}`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[12px] font-medium text-text-muted">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => i < step && setStep(i)} className={`${i <= step ? 'text-primary' : ''} ${i < step ? 'cursor-pointer hover:text-primary-hover' : 'cursor-default'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-[32px] min-h-[500px]">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-[24px] stagger-in">
            <h2 className="text-[18px] font-semibold text-text">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
              <div className="sm:col-span-2">
                <Input label="Job Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <Input label="Department *" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Engineering" />
              <Input label="Location *" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. San Francisco, CA" />
              <Select
                label="Employment Type"
                value={form.employmentType}
                onChange={e => setForm(f => ({ ...f, employmentType: e.target.value as any }))}
                options={[
                  { value: 'full-time', label: 'Full Time' },
                  { value: 'part-time', label: 'Part Time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'internship', label: 'Internship' }
                ]}
              />
              <Select
                label="Work Mode"
                value={form.workMode}
                onChange={e => setForm(f => ({ ...f, workMode: e.target.value as any }))}
                options={[
                  { value: 'remote', label: 'Remote' },
                  { value: 'hybrid', label: 'Hybrid' },
                  { value: 'onsite', label: 'On-site' }
                ]}
              />
              <Input label="Min Salary" type="number" value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} placeholder="100000" />
              <Input label="Max Salary" type="number" value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} placeholder="150000" />
              <Input label="Openings" type="number" min="1" value={form.openings} onChange={e => setForm(f => ({ ...f, openings: e.target.value }))} />
              <Input label="Deadline" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>
        )}

        {/* Step 1: Description */}
        {step === 1 && (
          <div className="space-y-[24px] stagger-in">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-text">Job Description</h2>
              <Badge variant="ai" className="gap-[4px] cursor-pointer hover:opacity-80 transition-opacity">
                <Sparkles className="w-[12px] h-[12px]" /> AI Enhance
              </Badge>
            </div>
            <Textarea label="Role Summary *" rows={4} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Describe the role, team, and impact..." />
            
            <div>
              <label className="block text-[14px] font-medium text-text mb-[8px]">Responsibilities</label>
              <div className="space-y-[8px]">
                {form.responsibilities.map((r, i) => (
                  <div key={i} className="flex gap-[8px]">
                    <Input value={r} onChange={e => updateListField('responsibilities', i, e.target.value)} placeholder={`Responsibility ${i + 1}`} className="flex-1" />
                    {form.responsibilities.length > 1 && (
                      <button onClick={() => removeListItem('responsibilities', i)} className="w-[40px] flex items-center justify-center rounded-md border border-border text-text-muted hover:text-danger hover:border-danger transition-colors">
                        <X className="w-[16px] h-[16px]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => addListItem('responsibilities')} className="text-[13px] text-primary font-medium hover:text-primary-hover flex items-center gap-[4px] mt-[8px]">
                <Plus className="w-[14px] h-[14px]" /> Add Responsibility
              </button>
            </div>

            <Textarea label="Team Description" rows={2} value={form.teamDescription} onChange={e => setForm(f => ({ ...f, teamDescription: e.target.value }))} placeholder="Describe the team..." />
          </div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <div className="space-y-[24px] stagger-in">
            <h2 className="text-[18px] font-semibold text-text">Candidate Requirements</h2>
            
            <div className="bg-surface-2 rounded-lg border border-border p-[16px] space-y-[12px]">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-[12px]">
                <div className="sm:col-span-5">
                  <Input value={newReq.name} onChange={e => setNewReq(r => ({ ...r, name: e.target.value }))} placeholder="Requirement name (e.g. React)" />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={newReq.category}
                    onChange={e => setNewReq(r => ({ ...r, category: e.target.value as any }))}
                    options={[
                      { value: 'skill', label: 'Skill' },
                      { value: 'experience', label: 'Experience' },
                      { value: 'education', label: 'Education' },
                      { value: 'certification', label: 'Certification' },
                      { value: 'technology', label: 'Technology' },
                      { value: 'domain', label: 'Domain' }
                    ]}
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={newReq.priority}
                    onChange={e => setNewReq(r => ({ ...r, priority: e.target.value as any }))}
                    options={[
                      { value: 'MANDATORY', label: 'Mandatory' },
                      { value: 'PREFERRED', label: 'Preferred' },
                      { value: 'OPTIONAL', label: 'Optional' }
                    ]}
                  />
                </div>
                <div className="sm:col-span-1">
                  <Button variant="secondary" onClick={addRequirement} disabled={!newReq.name} className="w-full px-0">
                    <Plus className="w-[16px] h-[16px]" />
                  </Button>
                </div>
              </div>
            </div>

            {requirements.length === 0 ? (
              <EmptyState 
                title="No requirements added"
                description="Add at least one requirement to proceed."
              />
            ) : (
              <div className="space-y-[8px]">
                {requirements.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-[16px] py-[12px] bg-surface-2 border border-border rounded-lg">
                    <div className="flex items-center gap-[12px]">
                      <span className={`w-[8px] h-[8px] rounded-full ${r.priority === 'MANDATORY' ? 'bg-danger' : r.priority === 'PREFERRED' ? 'bg-warning' : 'bg-text-muted'}`} />
                      <span className="text-[14px] font-medium text-text">{r.name}</span>
                      <span className="text-[12px] text-text-muted capitalize hidden sm:inline-block">• {r.category} • {r.priority.toLowerCase()}</span>
                    </div>
                    <button onClick={() => removeRequirement(i)} className="p-[4px] text-text-muted hover:text-danger transition-colors">
                      <X className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Weights */}
        {step === 3 && (
          <div className="space-y-[24px] stagger-in">
            <div>
              <h2 className="text-[18px] font-semibold text-text mb-[4px]">Requirement Weights</h2>
              <p className="text-[14px] text-text-secondary">Configure the importance of each requirement. Total must be approximately 100%.</p>
            </div>
            
            <div className={`flex items-center gap-[8px] px-[16px] py-[12px] rounded-lg border ${totalWeight >= 95 && totalWeight <= 105 ? 'bg-success-bg border-success/20 text-success' : 'bg-danger-bg border-danger/20 text-danger'}`}>
              <span className="font-semibold text-[14px]">Total Weight: {totalWeight}%</span>
              <span className="text-[13px]">{totalWeight >= 95 && totalWeight <= 105 ? '✓ Perfect' : '(must be ~100%)'}</span>
            </div>

            <div className="space-y-[12px]">
              {requirements.map((r, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-[16px] px-[16px] py-[16px] bg-surface-2 border border-border rounded-lg">
                  <div className="flex-1 flex items-center gap-[12px]">
                    <span className={`w-[8px] h-[8px] rounded-full ${r.priority === 'MANDATORY' ? 'bg-danger' : r.priority === 'PREFERRED' ? 'bg-warning' : 'bg-text-muted'}`} />
                    <span className="text-[14px] font-medium text-text">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-[16px] sm:w-[300px]">
                    <input type="range" min="0" max="50" value={r.weight} onChange={e => setRequirements(prev => prev.map((pr, pi) => pi === i ? { ...pr, weight: Number(e.target.value) } : pr))} className="flex-1 accent-primary" />
                    <span className="text-[14px] font-bold text-text w-[36px] text-right">{r.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Screening */}
        {step === 4 && (
          <div className="space-y-[24px] stagger-in">
            <h2 className="text-[18px] font-semibold text-text">Screening Configuration</h2>
            <div className="space-y-[8px]">
              {[
                { key: 'autoResumeExtraction', label: 'Automatic Resume Extraction', desc: 'Use AI to parse resume PDFs automatically' },
                { key: 'skillMatching', label: 'Skill Matching', desc: 'Score candidates against required skills' },
                { key: 'experienceMatching', label: 'Experience Matching', desc: 'Verify years of experience' },
                { key: 'educationMatching', label: 'Education Matching', desc: 'Check educational requirements' },
                { key: 'projectRelevance', label: 'Project Relevance', desc: 'Analyze past projects for relevance' },
                { key: 'certificationMatching', label: 'Certification Matching', desc: 'Check for specific certificates' },
                { key: 'aiExplanation', label: 'AI Explanation', desc: 'Generate evidence-based reasoning for scores' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-[16px] px-[16px] py-[12px] bg-surface-2 border border-border rounded-lg cursor-pointer hover:border-border-strong transition-colors">
                  <input type="checkbox" checked={(screening as any)[item.key]} onChange={e => setScreening(s => ({ ...s, [item.key]: e.target.checked }))} className="w-[18px] h-[18px] accent-primary rounded bg-bg border-border" />
                  <div>
                    <div className="text-[14px] font-medium text-text">{item.label}</div>
                    <div className="text-[12px] text-text-muted">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] pt-[16px] border-t border-border">
              <Input label="Minimum Threshold (%)" type="number" min="0" max="100" value={screening.minimumThreshold} onChange={e => setScreening(s => ({ ...s, minimumThreshold: Number(e.target.value) }))} />
              <Select
                label="Auto Shortlist"
                value={screening.autoShortlist ? 'on' : 'off'}
                onChange={e => setScreening(s => ({ ...s, autoShortlist: e.target.value === 'on' }))}
                options={[{ value: 'off', label: 'Off (Recommended)' }, { value: 'on', label: 'On' }]}
              />
            </div>
            <p className="text-[12px] text-ai flex items-center gap-[6px]"><AlertCircle className="w-[14px] h-[14px]" /> AI recommends → Human reviews → Human decides</p>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && (
          <div className="space-y-[24px] stagger-in">
            <h2 className="text-[18px] font-semibold text-text">Preview</h2>
            <div className="bg-surface-2 border border-border rounded-lg p-[24px] space-y-[16px] text-[14px]">
              <div className="flex justify-between border-b border-border pb-[12px]"><span className="text-text-secondary">Title</span><span className="font-semibold text-text">{form.title}</span></div>
              <div className="flex justify-between border-b border-border pb-[12px]"><span className="text-text-secondary">Department</span><span className="font-medium text-text">{form.department}</span></div>
              <div className="flex justify-between border-b border-border pb-[12px]"><span className="text-text-secondary">Location</span><span className="font-medium text-text">{form.location}</span></div>
              <div className="flex justify-between border-b border-border pb-[12px]"><span className="text-text-secondary">Type</span><span className="font-medium text-text capitalize">{form.employmentType.replace('-', ' ')} • {form.workMode}</span></div>
              <div className="flex justify-between border-b border-border pb-[12px]"><span className="text-text-secondary">Openings</span><span className="font-medium text-text">{form.openings}</span></div>
              <div className="flex justify-between border-b border-border pb-[12px]"><span className="text-text-secondary">Requirements</span><span className="font-medium text-text">{requirements.length} total</span></div>
              <div className="flex justify-between pb-[4px]"><span className="text-text-secondary">Total Weight</span><span className="font-medium text-text">{totalWeight}%</span></div>
            </div>
            <div>
              <p className="text-[14px] font-medium text-text mb-[12px]">Requirements Setup</p>
              <div className="flex flex-wrap gap-[8px]">
                {requirements.map((r, i) => (
                  <Badge key={i} variant={r.priority === 'MANDATORY' ? 'danger' : r.priority === 'PREFERRED' ? 'warning' : 'default'}>
                    {r.name} ({r.weight}%)
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Publish */}
        {step === 6 && (
          <div className="text-center py-[64px] stagger-in">
            <div className="w-[64px] h-[64px] mx-auto mb-[24px] rounded-2xl bg-success-bg border border-success/20 flex items-center justify-center shadow-sm">
              <Check className="w-[32px] h-[32px] text-success stroke-[2px]" />
            </div>
            <h2 className="text-[24px] font-bold text-text mb-[8px] tracking-[-0.01em]">Ready to Publish</h2>
            <p className="text-[14px] text-text-secondary mb-[32px] max-w-[400px] mx-auto leading-[22px]">
              Your job "{form.title}" is ready to go live. Candidates will be able to find and apply immediately.
            </p>
            <div className="flex justify-center gap-[12px]">
              <Button variant="secondary" onClick={handleSaveDraft}>Save Draft</Button>
              <Button variant="primary" onClick={handlePublish}>Publish Job</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      {step < 6 && (
        <div className="flex items-center justify-between pt-[8px]">
          <Button variant="ghost" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}>
            <ArrowLeft className="w-[16px] h-[16px]" /> Previous
          </Button>
          <div className="flex items-center gap-[12px]">
            <Button variant="secondary" onClick={handleSaveDraft}>Save Draft</Button>
            <Button variant="primary" onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}>
              Next <ArrowRight className="w-[16px] h-[16px]" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
