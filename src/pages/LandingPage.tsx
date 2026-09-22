// ============================================================
// HireFlow — Premium Landing Page
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Sparkles, Brain, Users, Briefcase, CheckCircle, ArrowRight,
  TrendingUp, Shield, Zap, Star, Building2, ChevronRight, Target, Award
} from 'lucide-react';

const STATS = [
  { value: '10,000+', label: 'Candidates Hired' },
  { value: '500+', label: 'Companies Onboarded' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '3x', label: 'Faster Hiring' },
];

const FEATURES = [
  {
    icon: Brain,
    color: 'text-ai bg-ai-light border-ai/20',
    title: 'AI-Powered Candidate Ranking',
    desc: 'Our AI analyzes resumes against weighted job requirements, surfacing the best matches with evidence-based explanations—not just keyword counts.',
  },
  {
    icon: Shield,
    color: 'text-primary bg-primary-light border-primary/20',
    title: 'Multi-Tenant Security',
    desc: 'Enterprise-grade row-level security ensures Company A can never access Company B\'s data. Built-in audit trails for full compliance.',
  },
  {
    icon: Zap,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    title: '7-Step Job Wizard',
    desc: 'Create precise job requisitions with configurable screening weights, auto-shortlisting thresholds, and AI-assisted descriptions.',
  },
  {
    icon: Target,
    color: 'text-success bg-success/10 border-success/20',
    title: 'Structured Interviewing',
    desc: 'Interviewers evaluate on 5 standardized dimensions. BHRs get consolidated feedback with clear hire/no-hire recommendations.',
  },
  {
    icon: TrendingUp,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    title: 'Real-Time Analytics',
    desc: 'Track your hiring funnel, pipeline conversion rates, AI score distributions, and time-to-hire metrics with beautiful dashboards.',
  },
  {
    icon: Award,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    title: 'End-to-End Pipeline',
    desc: 'From job posting to offer letter, manage every step—screening, shortlisting, interviews, feedback, and final decisions—in one place.',
  },
];

const TESTIMONIALS = [
  {
    quote: "HireFlow cut our time-to-hire from 6 weeks to 2. The AI ranking is frighteningly accurate.",
    name: "Sarah Chen",
    role: "Head of Talent, TechCorp",
    initials: "SC",
    color: "bg-primary-900/50 text-primary-300",
  },
  {
    quote: "We evaluated 400 candidates for one role. HireFlow surfaced our top 10 in minutes—all were top performers.",
    name: "Marcus Johnson",
    role: "HR Director, Innovate Labs",
    initials: "MJ",
    color: "bg-ai-900/50 text-ai-300",
  },
  {
    quote: "As a candidate, I finally got to see exactly why I matched (or didn't). That transparency is refreshing.",
    name: "Alex Rivera",
    role: "Senior Engineer",
    initials: "AR",
    color: "bg-emerald-900/50 text-emerald-300",
  },
];

const ROLES = [
  {
    icon: Building2,
    title: 'For Companies',
    color: 'from-surface to-background border border-border',
    textColor: 'text-foreground',
    points: ['Post jobs with AI-assisted descriptions', 'Rank candidates by weighted requirements', 'Schedule and manage interviews', 'Track hiring pipeline analytics'],
    cta: 'Start Hiring',
    link: '/register',
  },
  {
    icon: Users,
    title: 'For Candidates',
    color: 'from-surface to-background border border-border',
    textColor: 'text-foreground',
    points: ['Upload resume with AI parsing', 'See your AI match score per job', 'Track application status in real-time', 'Get interview invitations directly'],
    cta: 'Find Your Job',
    link: '/jobs',
  },
];

export function LandingPage() {
  const { isAuthenticated, currentUser } = useStore();

  const getDashboardLink = () => {
    if (!currentUser) return '/login';
    switch (currentUser.role) {
      case 'BHR_MANAGER': case 'HR_RECRUITER': return '/company/dashboard';
      case 'INTERVIEWER': return '/interviewer/dashboard';
      case 'CANDIDATE': return '/candidate/dashboard';
      case 'PLATFORM_ADMIN': return '/admin/dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary-500/30 selection:text-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-btn bg-gradient-to-br from-primary to-ai flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">HireFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/jobs" className="text-sm font-medium text-secondary hover:text-white transition-colors">Browse Jobs</Link>
            <a href="#features" className="text-sm font-medium text-secondary hover:text-white transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-secondary hover:text-white transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-btn hover:bg-primary-hover transition-all shadow-md shadow-primary/10 hover:shadow-primary/30"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-secondary hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-white text-black font-semibold text-sm rounded-btn hover:bg-gray-100 transition-all shadow-lg hover:shadow-white/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-40 pb-32 overflow-hidden flex items-center justify-center min-h-[90vh]">
        {/* Deep Dark Ambient Glow */}
        <div className="absolute inset-0 -z-10 bg-background">
          <div className="absolute top-[20%] left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[10%] right-1/4 w-[400px] h-[400px] rounded-full bg-ai/10 blur-[120px] mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-surface/50 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium text-primary-100 mb-10 animate-fade-in shadow-xl">
            <Brain className="w-4 h-4 text-primary" />
            AI-Powered Hiring Platform
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-white leading-tight tracking-tighter mb-8 animate-fade-in drop-shadow-sm">
            Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai">Right People</span>
            <br />Faster Than Ever
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-secondary leading-relaxed mb-12 font-light">
            HireFlow uses AI to rank candidates against weighted job requirements with evidence-based explanations.
            Stop sifting through hundreds of resumes — let intelligence surface the best matches.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-primary to-primary-600 text-white font-semibold text-lg rounded-btn hover:brightness-110 transition-all shadow-2xl shadow-primary/25 hover:-translate-y-1 transform"
            >
              <Sparkles className="w-5 h-5" /> Start for Free
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-surface/80 backdrop-blur-md text-white font-semibold text-lg rounded-btn border border-white/10 hover:bg-surface hover:border-white/20 transition-all shadow-lg hover:-translate-y-1 transform"
            >
              Browse Jobs <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-12 sm:gap-24 opacity-80">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-white mb-2">{s.value}</p>
                <p className="text-sm font-medium text-muted uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-32 bg-surface/30 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <div key={i} className={`rounded-[32px] bg-gradient-to-b ${role.color} p-12 shadow-2xl hover:shadow-black/50 transition-all hover:-translate-y-2 transform relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 backdrop-blur-sm">
                      <Icon className="w-8 h-8 text-primary-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">{role.title}</h2>
                    <ul className="space-y-4 mb-10">
                      {role.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-4 text-secondary text-base">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{p}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={role.link}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium text-base rounded-btn transition-all shadow-sm border border-white/5"
                    >
                      {role.cta} <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Everything You Need to Hire Better</h2>
            <p className="max-w-2xl mx-auto text-xl text-secondary font-light">Built for modern, data-driven HR teams that want to move fast without sacrificing quality.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-8 rounded-[24px] bg-surface/50 border border-white/5 hover:border-white/10 hover:bg-surface transition-all hover:-translate-y-1 transform shadow-lg">
                  <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                  <p className="text-base text-secondary leading-relaxed font-light">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-32 bg-surface/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Loved by Hiring Teams & Candidates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface/60 rounded-[24px] border border-white/5 p-10 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between h-full">
                <div>
                  <div className="flex gap-1.5 mb-6">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-amber-400/90 text-amber-400/90" />)}
                  </div>
                  <p className="text-lg text-secondary leading-relaxed mb-10 font-light italic">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center text-sm font-bold border border-white/10`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{t.name}</p>
                    <p className="text-sm text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 relative overflow-hidden flex justify-center items-center">
        {/* Dynamic Abstract Background for CTA */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700/20 via-background to-ai-600/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px] mix-blend-screen" />
        
        <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center bg-surface/40 backdrop-blur-2xl border border-white/10 p-16 sm:p-24 rounded-[40px] shadow-2xl">
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 tracking-tighter">Ready to Transform Your Hiring?</h2>
          <p className="text-secondary text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Join 500+ companies using HireFlow to find and hire the right people faster. Experience the dark, premium workspace today.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary hover:bg-primary-hover text-white font-semibold text-lg rounded-btn transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 transform"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-transparent border border-white/20 text-white font-semibold text-lg rounded-btn hover:bg-white/5 transition-all"
            >
              Browse Open Roles
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-background py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-btn bg-surface border border-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">HireFlow</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-secondary">
              <Link to="/jobs" className="hover:text-primary-400 transition-colors">Jobs</Link>
              <Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link>
              <Link to="/register" className="hover:text-primary-400 transition-colors">Register</Link>
            </div>
            <p className="text-sm text-muted font-light">© 2026 HireFlow. Built for the future of hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
