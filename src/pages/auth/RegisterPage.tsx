// ============================================================
// HireFlow — Register Page
// ============================================================
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Sparkles, ArrowRight, Building2, User, AlertCircle } from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { Button, Input, Select } from '../../components/ui/Components';
import type { UserRole } from '../../types';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'company' ? 'BHR_MANAGER' : 'CANDIDATE';

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: initialRole as UserRole,
    companyName: '',
    companyDescription: '',
    companyIndustry: '',
    companyLocation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, createCompany, addCompanyMember, users } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 500));

    // Check if email exists
    if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      setError('An account with this email already exists.');
      setLoading(false);
      return;
    }

    try {
      const user = register({
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
      }, formData.password);

      // If BHR Manager, create company
      if (formData.role === 'BHR_MANAGER' && formData.companyName) {
        const company = createCompany({
          name: formData.companyName,
          description: formData.companyDescription || `${formData.companyName} hiring platform`,
          industry: formData.companyIndustry || 'Technology',
          location: formData.companyLocation || 'India',
          size: '1-50',
        });
        addCompanyMember({
          userId: user.id,
          companyId: company.id,
          role: 'BHR_MANAGER',
          permissions: ['all'],
        });
      }

      // If candidate, create candidate profile
      if (formData.role === 'CANDIDATE') {
        useStore.getState().createCandidateProfile({
          userId: user.id,
          skills: [],
          experience: [],
          education: [],
          projects: [],
          certifications: [],
          technologies: [],
          resumeParsed: false,
        });
      }

      toast('success', `Welcome to HireFlow, ${user.displayName}!`);
      setLoading(false);

      const redirects: Record<string, string> = {
        BHR_MANAGER: '/company/dashboard',
        CANDIDATE: '/candidate/dashboard',
        HR_RECRUITER: '/company/dashboard',
        INTERVIEWER: '/interviewer/dashboard',
        PLATFORM_ADMIN: '/admin/dashboard',
      };
      navigate(redirects[user.role] || '/');
    } catch (err) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Left - Visual: Premium Orange Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-[48px] relative overflow-hidden bg-gradient-to-br from-primary-active via-primary to-[#EA580C]">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[-5%] w-[400px] h-[400px] rounded-full bg-white/10 blur-[80px] animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-[-10%] right-[10%] w-[350px] h-[350px] rounded-full bg-white/8 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        </div>
        {/* Mesh grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="text-center max-w-[440px] z-10">
          <div className="w-[80px] h-[80px] mx-auto mb-[36px] rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-[40px] h-[40px] text-white stroke-[1.5px]" />
          </div>
          <h2 className="text-[36px] font-extrabold text-white mb-[20px] tracking-[-0.03em] leading-[1.1]">Join HireFlow</h2>
          <p className="text-[17px] text-white/80 leading-[28px] mb-[40px]">
            {formData.role === 'BHR_MANAGER'
              ? 'Create your company profile, publish jobs, and let AI help you find the perfect candidates.'
              : 'Discover relevant opportunities, apply with your profile, and track your application status in real-time.'
            }
          </p>
          <div className="flex flex-col gap-[12px] text-left">
            {(formData.role === 'BHR_MANAGER' ? [
              '🏢 Post unlimited jobs with smart requirements',
              '🤖 AI auto-screens every applicant',
              '📊 Full analytics on your hiring pipeline',
              '👥 Invite team members & interviewers',
            ] : [
              '🔍 AI-powered job recommendations',
              '📄 Smart resume parsing & skill detection',
              '📈 Real-time application status tracking',
              '🎯 Compare your profile against MNC requirements',
            ]).map((f, i) => (
              <div key={i} className="flex items-center gap-[12px] bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-[16px] py-[12px]">
                <span className="text-[14px] font-medium text-white">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-[24px] bg-bg overflow-y-auto">
        <div className="w-full max-w-[420px] page-enter py-[32px]">
          <Link to="/" className="inline-flex items-center gap-[12px] mb-[40px]">
            <div className="w-[40px] h-[40px] rounded-md bg-primary flex items-center justify-center shadow-xs">
              <Sparkles className="w-[20px] h-[20px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.01em]">HireFlow</span>
          </Link>

          <h1 className="text-[28px] font-bold text-text mb-[8px] tracking-[-0.02em]">Create your account</h1>
          <p className="text-[15px] text-text-secondary mb-[32px]">Get started in just a few minutes</p>

          {/* Role Selector */}
          <div className="flex gap-[12px] mb-[32px]">
            <button
              type="button"
              onClick={() => setFormData(f => ({ ...f, role: 'CANDIDATE' }))}
              className={`flex-1 flex items-center justify-center gap-[8px] px-[16px] py-[12px] rounded-md border text-[14px] font-medium transition-all duration-[120ms] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                formData.role === 'CANDIDATE'
                  ? 'border-primary bg-primary-light text-primary shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-surface-2 hover:text-text'
              }`}
            >
              <User className="w-[18px] h-[18px]" />
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setFormData(f => ({ ...f, role: 'BHR_MANAGER' }))}
              className={`flex-1 flex items-center justify-center gap-[8px] px-[16px] py-[12px] rounded-md border text-[14px] font-medium transition-all duration-[120ms] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                formData.role === 'BHR_MANAGER'
                  ? 'border-primary bg-primary-light text-primary shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:border-border-strong hover:bg-surface-2 hover:text-text'
              }`}
            >
              <Building2 className="w-[18px] h-[18px]" />
              Company
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-[12px] p-[16px] mb-[24px] bg-danger-bg border border-danger/20 rounded-md text-[14px] text-danger animate-scale-in">
              <AlertCircle className="w-[20px] h-[20px] shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[20px]">
            <Input
              label="Full Name"
              type="text"
              value={formData.displayName}
              onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
              placeholder="Create a password"
              required
              minLength={6}
            />

            {formData.role === 'BHR_MANAGER' && (
              <div className="pt-[24px] mt-[8px] space-y-[20px] border-t border-border animate-fade-in">
                <p className="text-[12px] font-semibold text-text-muted uppercase tracking-[0.04em]">Company Details</p>
                <Input
                  label="Company Name"
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData(f => ({ ...f, companyName: e.target.value }))}
                  placeholder="Your company name"
                  required
                />
                <Select
                  label="Industry"
                  value={formData.companyIndustry}
                  onChange={e => setFormData(f => ({ ...f, companyIndustry: e.target.value }))}
                  options={[
                    { value: '', label: 'Select industry' },
                    { value: 'Information Technology', label: 'Information Technology' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Healthcare', label: 'Healthcare' },
                    { value: 'Education', label: 'Education' },
                    { value: 'E-Commerce', label: 'E-Commerce' },
                    { value: 'Manufacturing', label: 'Manufacturing' },
                    { value: 'Consulting', label: 'Consulting' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <Input
                  label="Location"
                  type="text"
                  value={formData.companyLocation}
                  onChange={e => setFormData(f => ({ ...f, companyLocation: e.target.value }))}
                  placeholder="e.g. Bangalore, India"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] mt-[8px]"
            >
              {loading ? (
                <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-[16px] h-[16px]" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-[24px] text-center text-[14px] text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:text-primary-hover transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
