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
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    title: '7-Step Job Wizard',
    desc: 'Create precise job requisitions with configurable screening weights, auto-shortlisting thresholds, and AI-assisted descriptions.',
  },
  {
    icon: Target,
    color: 'text-success bg-green-50 border-green-200',
    title: 'Structured Interviewing',
    desc: 'Interviewers evaluate on 5 standardized dimensions. BHRs get consolidated feedback with clear hire/no-hire recommendations.',
  },
  {
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    title: 'Real-Time Analytics',
    desc: 'Track your hiring funnel, pipeline conversion rates, AI score distributions, and time-to-hire metrics with beautiful dashboards.',
  },
  {
    icon: Award,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
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
    color: "bg-blue-100 text-blue-700",
  },
  {
    quote: "We evaluated 400 candidates for one role. HireFlow surfaced our top 10 in minutes—all were top performers.",
    name: "Marcus Johnson",
    role: "HR Director, Innovate Labs",
    initials: "MJ",
    color: "bg-purple-100 text-purple-700",
  },
  {
    quote: "As a candidate, I finally got to see exactly why I matched (or didn't). That transparency is refreshing.",
    name: "Alex Rivera",
    role: "Senior Engineer",
    initials: "AR",
    color: "bg-emerald-100 text-emerald-700",
  },
];

const ROLES = [
  {
    icon: Building2,
    title: 'For Companies',
    color: 'from-blue-600 to-indigo-700',
    textColor: 'text-white',
    points: ['Post jobs with AI-assisted descriptions', 'Rank candidates by weighted requirements', 'Schedule and manage interviews', 'Track hiring pipeline analytics'],
    cta: 'Start Hiring',
    link: '/register',
  },
  {
    icon: Users,
    title: 'For Candidates',
    color: 'from-purple-600 to-pink-600',
    textColor: 'text-white',
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
    <div className="min-h-screen bg-background font-sans">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-btn bg-primary flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">HireFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/jobs" className="text-sm font-medium text-secondary hover:text-black hover:bg-gray-100 active:bg-black active:text-white px-3 py-1.5 rounded-[10px] transition-all">Browse Jobs</Link>
            <a href="#features" className="text-sm font-medium text-secondary hover:text-black hover:bg-gray-100 active:bg-black active:text-white px-3 py-1.5 rounded-[10px] transition-all">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-secondary hover:text-black hover:bg-gray-100 active:bg-black active:text-white px-3 py-1.5 rounded-[10px] transition-all">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 px-5 py-2 bg-black text-white text-sm font-semibold rounded-[10px] hover:bg-neutral-900 active:bg-black border border-black shadow-sm transition-all active:scale-95"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-secondary hover:text-white hover:bg-black active:bg-black active:text-white rounded-[10px] transition-all">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-[10px] hover:bg-neutral-900 active:bg-black border border-black shadow-sm transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Gradient BG */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-ai/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-ai-light border border-ai/20 rounded-full text-sm font-semibold text-ai mb-8 animate-fade-in">
            <Brain className="w-4 h-4" />
            AI-Powered Hiring Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight mb-6 animate-fade-in">
            Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Right People</span>
            <br />Faster Than Ever
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-secondary leading-relaxed mb-10">
            HireFlow uses AI to rank candidates against weighted job requirements with evidence-based explanations.
            Stop sifting through hundreds of resumes — let intelligence surface the best matches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold text-base rounded-btn hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              <Sparkles className="w-5 h-5" /> Start for Free
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface text-foreground font-bold text-base rounded-btn border border-border hover:bg-gray-50 transition-all shadow-sm"
            >
              Browse Jobs <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <div key={i} className={`rounded-2xl bg-gradient-to-br ${role.color} p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 transform`}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">{role.title}</h2>
                  <ul className="space-y-2.5 mb-8">
                    {role.points.map((p, j) => (
                      <li key={j} className="flex items-center gap-3 text-white/90 text-sm">
                        <CheckCircle className="w-4 h-4 text-white/80 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={role.link}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-bold text-sm rounded-btn hover:bg-gray-50 transition-all shadow-sm"
                  >
                    {role.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need to Hire Better</h2>
            <p className="max-w-xl mx-auto text-secondary">Built for modern, data-driven HR teams that want to move fast without sacrificing quality.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`p-6 rounded-2xl border ${f.color.split(' ').slice(1).join(' ')} bg-opacity-30 hover:shadow-lg transition-all hover:-translate-y-0.5 transform`}>
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-secondary leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Loved by Hiring Teams & Candidates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-secondary leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-sm font-bold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Join 500+ companies using HireFlow to find and hire the right people faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold text-base rounded-btn hover:bg-blue-50 transition-all shadow-lg"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold text-base rounded-btn hover:bg-white/10 transition-all"
            >
              Browse Open Roles
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-btn bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">HireFlow</span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-400">
              <Link to="/jobs" className="px-3.5 py-1.5 rounded-[10px] bg-neutral-900 text-gray-300 hover:text-white hover:bg-black active:bg-black active:text-white border border-neutral-800 transition-all font-medium">Browse Jobs</Link>
              <Link to="/login" className="px-3.5 py-1.5 rounded-[10px] bg-neutral-900 text-gray-300 hover:text-white hover:bg-black active:bg-black active:text-white border border-neutral-800 transition-all font-medium">Sign In</Link>
              <Link to="/register" className="px-3.5 py-1.5 rounded-[10px] bg-neutral-900 text-gray-300 hover:text-white hover:bg-black active:bg-black active:text-white border border-neutral-800 transition-all font-medium">Create Company</Link>
            </div>
            <p className="text-xs text-gray-500">© 2026 HireFlow. Built for the future of hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
