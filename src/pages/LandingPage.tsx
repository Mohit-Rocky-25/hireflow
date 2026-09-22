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
      <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1280px] mx-auto px-[24px] h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[18px] font-semibold text-text tracking-[-0.01em]">HireFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-[24px]">
            <Link to="/jobs" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
              Browse Jobs
            </Link>
            <a href="#features" className="text-[14px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">
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
      <section className="relative pt-[140px] pb-[80px] min-h-[85vh] flex items-center">
        {/* Subtle ambient glow — NOT gradient-heavy or glassmorphism */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-primary/6 blur-[100px]" />
          <div className="absolute bottom-[20%] right-[25%] w-[300px] h-[300px] rounded-full bg-ai/5 blur-[100px]" />
        </div>

        <div className="max-w-[1280px] mx-auto px-[24px] w-full">
          <div className="max-w-[720px]">
            <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] bg-ai-light border border-ai/20 rounded-full text-[12px] font-medium text-ai mb-[24px]">
              <Brain className="w-[14px] h-[14px] stroke-[1.5px]" />
              AI-Powered Hiring Platform
            </div>

            <h1 className="text-[48px] sm:text-[56px] lg:text-[64px] font-bold text-text leading-[1.1] tracking-[-0.02em] mb-[24px]">
              Hire the right people,{' '}
              <span className="text-primary">faster.</span>
            </h1>

            <p className="text-[18px] text-text-secondary leading-[28px] mb-[40px] max-w-[560px]">
              AI ranks candidates against your weighted job requirements with evidence-based explanations.
              The AI recommends — a human decides.
            </p>

            <div className="flex flex-col sm:flex-row gap-[12px]">
              <Link to="/register">
                <Button variant="header" className="h-[48px] px-[24px] text-[16px]">
                  <Sparkles className="w-[18px] h-[18px] stroke-[1.5px]" /> Start Hiring
                </Button>
              </Link>
              <Link to="/jobs">
                <Button variant="secondary" className="h-[48px] px-[24px] text-[16px]">
                  Browse Open Roles <ChevronRight className="w-[18px] h-[18px] stroke-[1.5px]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Cards ── */}
      <section className="py-[80px] border-t border-border">
        <div className="max-w-[1280px] mx-auto px-[24px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <div key={i} className="bg-surface rounded-lg border border-border p-[32px] shadow-xs hover:shadow-sm transition-shadow duration-[120ms]">
                  <div className="w-[48px] h-[48px] rounded-md bg-surface-2 border border-border flex items-center justify-center mb-[24px]">
                    <Icon className="w-[24px] h-[24px] text-primary stroke-[1.5px]" />
                  </div>
                  <h2 className="text-[20px] font-semibold text-text mb-[16px]">{role.title}</h2>
                  <ul className="space-y-[12px] mb-[24px]">
                    {role.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-[12px] text-[14px] text-text-secondary">
                        <CheckCircle className="w-[16px] h-[16px] text-success mt-[2px] shrink-0 stroke-[1.5px]" />
                        <span className="leading-[20px]">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={role.link}>
                    <Button variant="secondary" size="small">
                      {role.cta} <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-[80px] border-t border-border">
        <div className="max-w-[1280px] mx-auto px-[24px]">
          <div className="mb-[48px]">
            <h2 className="text-[28px] font-bold text-text mb-[12px]">Built for real hiring workflows</h2>
            <p className="text-[16px] text-text-secondary max-w-[480px]">
              Not a mockup. Not a job board. A complete, role-gated hiring platform with explainable AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-surface rounded-lg border border-border p-[24px] shadow-xs hover:shadow-sm transition-shadow duration-[120ms]">
                  <div className="w-[40px] h-[40px] rounded-md bg-primary-light flex items-center justify-center mb-[16px]">
                    <Icon className="w-[20px] h-[20px] text-primary stroke-[1.5px]" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-text mb-[8px]">{f.title}</h3>
                  <p className="text-[14px] text-text-secondary leading-[20px]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-[80px] border-t border-border">
        <div className="max-w-[640px] mx-auto px-[24px] text-center">
          <h2 className="text-[32px] font-bold text-text mb-[16px]">Ready to transform your hiring?</h2>
          <p className="text-[16px] text-text-secondary mb-[32px] leading-[24px]">
            The AI recommends, a human decides. No irreversible action happens without an authenticated human confirming it.
          </p>
          <div className="flex flex-col sm:flex-row gap-[12px] justify-center">
            <Link to="/register">
              <Button variant="primary" className="h-[48px] px-[24px] text-[16px]">
                Get Started Free <ArrowRight className="w-[18px] h-[18px] stroke-[1.5px]" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" className="h-[48px] px-[24px] text-[16px]">
                Browse Open Roles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-[32px] border-t border-border">
        <div className="max-w-[1280px] mx-auto px-[24px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-[16px]">
            <div className="flex items-center gap-[12px]">
              <div className="w-[28px] h-[28px] rounded-sm bg-surface border border-border flex items-center justify-center">
                <Sparkles className="w-[14px] h-[14px] text-primary stroke-[1.5px]" />
              </div>
              <span className="text-[14px] font-semibold text-text">HireFlow</span>
            </div>
            <div className="flex gap-[24px] text-[13px] font-medium text-text-secondary">
              <Link to="/jobs" className="hover:text-text transition-colors duration-[120ms]">Jobs</Link>
              <Link to="/login" className="hover:text-text transition-colors duration-[120ms]">Sign In</Link>
              <Link to="/register" className="hover:text-text transition-colors duration-[120ms]">Register</Link>
            </div>
            <p className="text-[12px] text-text-muted">© 2026 HireFlow. Built for the future of hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
