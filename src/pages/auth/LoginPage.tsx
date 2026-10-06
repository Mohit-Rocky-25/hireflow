import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Code } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [email, setEmail] = useState('demo-candidate@example.com');
  const [password, setPassword] = useState('password123');

  const navigateRole = (role: string) => {
    switch (role) {
      case 'BHR_MANAGER':
      case 'HR_RECRUITER':
        navigate('/company/dashboard');
        break;
      case 'INTERVIEWER':
        navigate('/interviewer/dashboard');
        break;
      case 'CANDIDATE':
        navigate('/candidate/dashboard');
        break;
      case 'PLATFORM_ADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email, password);
    if (user) {
      navigateRole(user.role);
    } else {
      // Fallback: log in as demo candidate
      const cand = login('demo-candidate@example.com', 'password123');
      navigateRole(cand?.role || 'CANDIDATE');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    const user = login(demoEmail, 'password123');
    if (user) {
      navigateRole(user.role);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      <div className="absolute inset-0 hero-mesh opacity-50 pointer-events-none" />
      
      {/* Left side: Cinematic branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-[48px] relative bg-surface-2 border-r border-border">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div>
          <Link to="/" className="inline-flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-sm">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[2px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
          </Link>
        </div>

        <div className="max-w-[460px] relative z-10">
          <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] rounded-full bg-ai-light border border-ai/20 text-[12px] font-semibold text-ai mb-[24px]">
            Free Access Forever
          </div>
          <h1 className="text-[42px] font-extrabold text-text leading-[1.1] tracking-[-0.03em] mb-[24px]">
            Your career, <br /> decoded.
          </h1>
          <p className="text-[18px] text-text-secondary leading-[1.6]">
            Sign in to access your saved resume roasts, career roadmaps, and one-click job applications.
          </p>
          
          <div className="mt-[64px] p-[24px] rounded-2xl bg-surface/50 border border-border backdrop-blur-sm">
            <p className="text-[15px] text-text italic mb-[16px]">
              "HireFlow's ATS Roaster literally tore my resume apart. I fixed the keyword gaps it suggested, and got 3 interviews the very next week."
            </p>
            <div className="flex items-center gap-[12px]">
              <div className="w-[40px] h-[40px] rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">JD</div>
              <div>
                <p className="text-[14px] font-bold text-text">Jordan D.</p>
                <p className="text-[12px] text-text-secondary">Software Engineer @ TechCorp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-[24px] relative z-10">
        <div className="w-full max-w-[420px] space-y-[32px] page-enter">
          
          <div className="text-center lg:text-left">
            <h2 className="text-[28px] font-bold text-text mb-[8px] tracking-[-0.02em]">Welcome back</h2>
            <p className="text-[15px] text-text-secondary">Enter your details to sign in, or click a demo account below:</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleQuickLogin('demo-candidate@example.com')}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                👤 Candidate
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('demo-hr@example.com')}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
              >
                🏢 Recruiter
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('demo-interviewer@example.com')}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                🎯 Interviewer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('demo-admin@hireflow.com')}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                ⚡ Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-[20px]">
            <div className="space-y-[6px]">
              <label className="text-[13px] font-bold text-text">Email address</label>
              <div className="relative">
                <Mail className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-[48px] pl-[42px] pr-[16px] bg-surface border border-border rounded-lg text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-[6px]">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-text">Password</label>
                <a href="#" className="text-[13px] font-semibold text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-[48px] pl-[42px] pr-[16px] bg-surface border border-border rounded-lg text-[15px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full h-[48px] bg-primary text-white font-bold rounded-lg hover:bg-primary-hover active:scale-[0.99] transition-all flex items-center justify-center gap-[8px] shadow-sm">
              Sign In <ArrowRight className="w-[18px] h-[18px] stroke-[2px]" />
            </button>
          </form>

          <div className="relative flex items-center py-[8px]">
            <div className="flex-1 border-t border-border" />
            <span className="px-[16px] text-[12px] font-semibold text-text-muted uppercase tracking-wider">Or continue with</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button type="button" onClick={handleSubmit} className="w-full h-[48px] bg-surface border border-border text-text font-bold rounded-lg hover:bg-surface-2 active:scale-[0.99] transition-all flex items-center justify-center gap-[10px] shadow-sm">
            <Code className="w-[18px] h-[18px]" /> Continue with GitHub
          </button>

          <p className="text-center text-[14px] text-text-secondary">
            Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
