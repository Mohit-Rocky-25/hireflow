// ============================================================
// HireFlow v2 — Landing Page (§15)
// "A bright, minimal public landing page (no fake stats,
//  no stock hero photography) explaining the company/candidate
//  value props." — adapted to dark theme.
// ============================================================
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Components';
import {
  Sparkles, Brain, Users, CheckCircle, ArrowRight,
  Shield, Zap, Target, Building2, ChevronRight
} from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'Explainable AI Matching',
    desc: 'Candidates are ranked against weighted job requirements with evidence-based explanations — never a bare percentage with no reasoning.',
  },
  {
    icon: Shield,
    title: 'Multi-Tenant Security',
    desc: 'Row-level security ensures Company A can never access Company B\'s data. Authorization at the database layer, not just hidden in the UI.',
  },
  {
    icon: Zap,
    title: 'Structured Hiring Pipeline',
    desc: 'From job creation through screening, shortlisting, interviews, and offers — every step is tracked, auditable, and role-gated.',
  },
  {
    icon: Target,
    title: 'Five-Dimension Interviewing',
    desc: 'Interviewers evaluate candidates on standardized dimensions. BHR Managers get consolidated feedback with clear hire/no-hire recommendations.',
  },
];

const ROLES = [
  {
    icon: Building2,
    title: 'For Companies',
    points: [
      'Create jobs with weighted requirements',
      'AI-powered candidate ranking with evidence',
      'Structured interview pipeline',
      'Real-time hiring analytics',
    ],
    cta: 'Register Your Company',
    link: '/register',
  },
  {
    icon: Users,
    title: 'For Candidates',
    points: [
      'AI-parsed resume with editable extraction',
      'See your match score and reasoning per job',
      'Track application status in real-time',
      'Receive interview invitations directly',
    ],
    cta: 'Find Your Next Role',
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
    <div className="min-h-screen bg-bg font-sans text-text">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1280px] mx-auto px-[32px] h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <div className="w-[40px] h-[40px] rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/15">
              <Sparkles className="w-[20px] h-[20px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-[32px]">
            <Link to="/jobs" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
              Browse Jobs
            </Link>
            <a href="#features" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
              Features
            </a>
          </div>

          <div className="flex items-center gap-[12px]">
            {isAuthenticated ? (
              <Link to={getDashboardLink()}>
                <Button variant="primary">
                  Go to Dashboard <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-[12px] py-[8px] text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button variant="header">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-[160px] pb-[120px] min-h-[90vh] flex items-center">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[15%] left-[25%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute bottom-[15%] right-[20%] w-[400px] h-[400px] rounded-full bg-ai/6 blur-[120px]" />
        </div>

        <div className="max-w-[1280px] mx-auto px-[32px] w-full">
          <div className="max-w-[800px] page-enter">
            <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] bg-ai-light border border-ai/20 rounded-full text-[13px] font-semibold text-ai mb-[32px]">
              <Brain className="w-[16px] h-[16px] stroke-[1.5px]" />
              AI-Powered Hiring Platform
            </div>

            <h1 className="text-[52px] sm:text-[64px] lg:text-[72px] font-extrabold text-text leading-[1.05] tracking-[-0.03em] mb-[28px]">
              Hire the right people,{' '}
              <span className="text-primary">faster.</span>
            </h1>

            <p className="text-[20px] text-text-secondary leading-[32px] mb-[48px] max-w-[620px] font-normal">
              AI ranks candidates against your weighted job requirements with evidence-based explanations.
              The AI recommends — a human decides.
            </p>

            <div className="flex flex-col sm:flex-row gap-[16px]">
              <Link to="/register">
                <Button variant="header" className="h-[56px] px-[32px] text-[17px] font-semibold">
                  <Sparkles className="w-[20px] h-[20px] stroke-[1.5px]" /> Start Hiring
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="secondary" className="h-[56px] px-[32px] text-[17px] font-semibold">
                  Browse Open Roles <ChevronRight className="w-[20px] h-[20px] stroke-[1.5px]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-[120px] border-t border-border">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="text-center mb-[64px]">
            <h2 className="text-[36px] font-bold text-text tracking-[-0.02em] mb-[16px]">Who is HireFlow for?</h2>
            <p className="text-[18px] text-text-secondary max-w-[500px] mx-auto">Two sides of the hiring equation, one unified platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[32px] stagger-in">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <div key={i} className="bg-surface rounded-xl border border-border p-[40px] shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px]">
                  <div className="w-[56px] h-[56px] rounded-lg bg-surface-2 border border-border-strong flex items-center justify-center mb-[28px]">
                    <Icon className="w-[28px] h-[28px] text-primary stroke-[1.5px]" />
                  </div>
                  <h2 className="text-[24px] font-bold text-text mb-[20px] tracking-[-0.01em]">{role.title}</h2>
                  <ul className="space-y-[16px] mb-[32px]">
                    {role.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-[14px] text-[15px] text-text-secondary">
                        <CheckCircle className="w-[18px] h-[18px] text-success mt-[2px] shrink-0 stroke-[1.5px]" />
                        <span className="leading-[22px]">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={role.link}>
                    <Button variant="secondary">
                      {role.cta} <ArrowRight className="w-[16px] h-[16px] stroke-[1.5px]" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-[120px] border-t border-border">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="mb-[64px]">
            <h2 className="text-[36px] font-bold text-text mb-[16px] tracking-[-0.02em]">Built for real hiring workflows</h2>
            <p className="text-[18px] text-text-secondary max-w-[540px] leading-[28px]">
              Not a mockup. Not a job board. A complete, role-gated hiring platform with explainable AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[28px] stagger-in">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-surface rounded-xl border border-border p-[32px] shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-[2px]">
                  <div className="w-[48px] h-[48px] rounded-lg bg-primary-light flex items-center justify-center mb-[20px]">
                    <Icon className="w-[24px] h-[24px] text-primary stroke-[1.5px]" />
                  </div>
                  <h3 className="text-[18px] font-bold text-text mb-[10px]">{f.title}</h3>
                  <p className="text-[15px] text-text-secondary leading-[24px]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-[120px] border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[150px]" />
        </div>
        <div className="max-w-[720px] mx-auto px-[32px] text-center">
          <h2 className="text-[40px] font-bold text-text mb-[20px] tracking-[-0.02em]">Ready to transform your hiring?</h2>
          <p className="text-[18px] text-text-secondary mb-[40px] leading-[28px]">
            The AI recommends, a human decides. No irreversible action happens without an authenticated human confirming it.
          </p>
          <div className="flex flex-col sm:flex-row gap-[16px] justify-center">
            <Link to="/register">
              <Button variant="primary" className="h-[56px] px-[32px] text-[17px] font-semibold">
                Get Started Free <ArrowRight className="w-[20px] h-[20px] stroke-[1.5px]" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" className="h-[56px] px-[32px] text-[17px] font-semibold">
                Browse Open Roles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-[48px] border-t border-border">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-[20px]">
            <div className="flex items-center gap-[14px]">
              <div className="w-[32px] h-[32px] rounded-md bg-surface border border-border flex items-center justify-center">
                <Sparkles className="w-[16px] h-[16px] text-primary stroke-[1.5px]" />
              </div>
              <span className="text-[16px] font-bold text-text">HireFlow</span>
            </div>
            <div className="flex gap-[28px] text-[14px] font-medium text-text-secondary">
              <Link to="/jobs" className="hover:text-text transition-colors duration-[120ms]">Jobs</Link>
              <Link to="/login" className="hover:text-text transition-colors duration-[120ms]">Sign In</Link>
              <Link to="/register" className="hover:text-text transition-colors duration-[120ms]">Register</Link>
            </div>
            <p className="text-[13px] text-text-muted">© 2026 HireFlow. Built for the future of hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
