// ============================================================
// HireFlow — Register Page
// ============================================================
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Sparkles, ArrowRight, Building2, User, AlertCircle } from 'lucide-react';
import { toast } from '../../components/ui/Toast';
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
    <div className="min-h-screen flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-ai via-primary to-primary-700 items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Join HireFlow</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            {formData.role === 'BHR_MANAGER'
              ? 'Create your company profile, publish jobs, and let AI help you find the perfect candidates.'
              : 'Discover relevant opportunities, apply with your profile, and track your application status in real-time.'
            }
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface overflow-y-auto">
        <div className="w-full max-w-md animate-slide-up">
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-btn bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">HireFlow</span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-sm text-secondary mb-6">Get started in just a few minutes</p>

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setFormData(f => ({ ...f, role: 'CANDIDATE' }))}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-btn border-2 text-sm font-semibold transition-all ${
                formData.role === 'CANDIDATE'
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-secondary hover:border-primary/30'
              }`}
            >
              <User className="w-4 h-4" />
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setFormData(f => ({ ...f, role: 'BHR_MANAGER' }))}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-btn border-2 text-sm font-semibold transition-all ${
                formData.role === 'BHR_MANAGER'
                  ? 'border-primary bg-primary-light text-primary'
                  : 'border-border text-secondary hover:border-primary/30'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 mb-6 bg-red-50 border border-red-200 rounded-btn text-sm text-danger animate-scale-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.displayName}
                onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                value={formData.password}
                onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {formData.role === 'BHR_MANAGER' && (
              <>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Company Details</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="company-name">Company Name</label>
                  <input
                    id="company-name"
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData(f => ({ ...f, companyName: e.target.value }))}
                    placeholder="Your company name"
                    required
                    className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="company-industry">Industry</label>
                  <select
                    id="company-industry"
                    value={formData.companyIndustry}
                    onChange={e => setFormData(f => ({ ...f, companyIndustry: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="">Select industry</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="company-location">Location</label>
                  <input
                    id="company-location"
                    type="text"
                    value={formData.companyLocation}
                    onChange={e => setFormData(f => ({ ...f, companyLocation: e.target.value }))}
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
