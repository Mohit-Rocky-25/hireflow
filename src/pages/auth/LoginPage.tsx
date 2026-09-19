// ============================================================
// HireFlow — Login Page
// ============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Sparkles, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

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
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <div className="w-full max-w-md animate-slide-up">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-btn bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">HireFlow</span>
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
          <p className="text-sm text-secondary mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-start gap-3 p-3 mb-6 bg-red-50 border border-red-200 rounded-btn text-sm text-danger animate-scale-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-btn text-sm text-foreground placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:text-primary-hover transition-colors">
              Sign Up
            </Link>
          </p>

          {/* Quick Demo Login & Data Mode */}
          <div className="mt-8 pt-6 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Demo Access & Database State</p>
              {useStore.getState().isDemoMode ? (
                <button
                  type="button"
                  onClick={() => {
                    useStore.getState().resetToCleanSlate();
                    toast('info', 'Clean database active. All mock records wiped.');
                  }}
                  className="text-[11px] text-danger hover:underline font-semibold"
                >
                  Wipe Demo Data
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    useStore.getState().loadDemoData();
                    toast('success', 'Demo data loaded.');
                  }}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Load Demo Data
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'BHR Manager', email: 'demo-bhr@example.com' },
                { label: 'HR Recruiter', email: 'demo-hr@example.com' },
                { label: 'Interviewer', email: 'demo-interviewer@example.com' },
                { label: 'Candidate', email: 'demo-candidate@example.com' },
              ].map(demo => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => {
                    if (!useStore.getState().isDemoMode) {
                      useStore.getState().loadDemoData();
                    }
                    quickLogin(demo.email);
                  }}
                  className="px-3 py-2 text-xs font-medium text-secondary border border-border rounded-btn hover:bg-gray-50 hover:border-primary/30 transition-all text-left"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary-700 to-ai items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">AI-Powered Hiring Platform</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Companies define what they need. Candidates provide their qualifications.
            The platform analyzes the relationship between the two.
          </p>
        </div>
      </div>
    </div>
  );
}
