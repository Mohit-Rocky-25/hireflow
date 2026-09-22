// ============================================================
// HireFlow — Login Page
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Sparkles, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from '../../components/ui/Toast';
import { Button, Input } from '../../components/ui/Components';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));

    const user = login(email, password);
    setLoading(false);

    if (!user) {
      setError('Invalid email or password. Try demo accounts with password: demo123');
      return;
    }

    toast('success', `Welcome back, ${user.displayName}!`);

    // Redirect based on role
    const redirects: Record<string, string> = {
      PLATFORM_ADMIN: '/admin/dashboard',
      BHR_MANAGER: '/company/dashboard',
      HR_RECRUITER: '/company/dashboard',
      INTERVIEWER: '/interviewer/dashboard',
      CANDIDATE: '/candidate/dashboard',
    };
    navigate(redirects[user.role] || '/');
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-[24px] bg-bg relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        
        <div className="w-full max-w-[420px] z-10 page-enter">
          <Link to="/" className="inline-flex items-center gap-[12px] mb-[40px]">
            <div className="w-[40px] h-[40px] rounded-md bg-primary flex items-center justify-center shadow-xs">
              <Sparkles className="w-[20px] h-[20px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.01em]">HireFlow</span>
          </Link>

          <h1 className="text-[28px] font-bold text-text mb-[8px] tracking-[-0.02em]">Welcome back</h1>
          <p className="text-[15px] text-text-secondary mb-[32px]">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-start gap-[12px] p-[16px] mb-[24px] bg-danger-bg border border-danger/20 rounded-md text-[14px] text-danger animate-scale-in">
              <AlertCircle className="w-[20px] h-[20px] shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[20px]">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[12px] top-[34px] text-text-muted hover:text-text transition-colors duration-[120ms]"
              >
                {showPassword ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[48px]"
            >
              {loading ? (
                <div className="w-[20px] h-[20px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-[16px] h-[16px]" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-[24px] text-center text-[14px] text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:text-primary-hover transition-colors">
              Sign Up
            </Link>
          </p>

          {/* Quick Demo Login */}
          <div className="mt-[32px] pt-[24px] border-t border-border">
            <p className="text-[12px] font-semibold text-text-muted mb-[16px] uppercase tracking-[0.04em]">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-[12px]">
              {[
                { label: 'BHR Manager', email: 'demo-bhr@example.com' },
                { label: 'HR Recruiter', email: 'demo-hr@example.com' },
                { label: 'Interviewer', email: 'demo-interviewer@example.com' },
                { label: 'Candidate', email: 'demo-candidate@example.com' },
              ].map(demo => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => quickLogin(demo.email)}
                  className="px-[12px] py-[10px] text-[13px] font-medium text-text-secondary border border-border rounded-md bg-surface-2 hover:bg-border transition-colors text-left"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-surface-2 items-center justify-center p-[48px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-ai/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        </div>
        
        <div className="text-center max-w-[480px] z-10">
          <div className="w-[64px] h-[64px] mx-auto mb-[32px] rounded-2xl bg-surface border border-border flex items-center justify-center shadow-sm">
            <Sparkles className="w-[32px] h-[32px] text-primary" />
          </div>
          <h2 className="text-[32px] font-bold text-text mb-[16px] tracking-[-0.02em]">AI-Powered Hiring Platform</h2>
          <p className="text-[16px] text-text-secondary leading-[28px]">
            Companies define what they need. Candidates provide their qualifications.
            The platform analyzes the relationship between the two.
          </p>
        </div>
      </div>
    </div>
  );
}
