// ============================================================
// HireFlow — Landing Page (Premium v3 — Picasso Edition)
// ============================================================
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/Components";
import {
  Sparkles, Brain, Users, CheckCircle, ArrowRight,
  Shield, Zap, Target, Building2, ChevronRight, Cpu, BarChart3, TrendingUp
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Explainable AI Matching",
    desc: "Candidates are ranked against weighted job requirements with evidence-based explanations — never a bare percentage with no reasoning.",
    accent: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-ai",
    iconBg: "bg-ai-light border-ai/20",
  },
  {
    icon: Shield,
    title: "Multi-Tenant Security",
    desc: "Row-level security ensures Company A can never access Company B's data. Authorization at the database layer, not just hidden in the UI.",
    accent: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-success",
    iconBg: "bg-success-bg border-success/20",
  },
  {
    icon: Zap,
    title: "Structured Hiring Pipeline",
    desc: "From job creation through screening, shortlisting, interviews, and offers — every step is tracked, auditable, and role-gated.",
    accent: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    iconBg: "bg-primary-light border-primary/20",
  },
  {
    icon: Target,
    title: "Five-Dimension Interviewing",
    desc: "Interviewers evaluate candidates on standardized dimensions. BHR Managers get consolidated feedback with clear hire/no-hire recommendations.",
    accent: "from-blue-500/15 to-blue-500/5",
    iconColor: "text-info",
    iconBg: "bg-info-bg border-info/20",
  },
];

const STATS = [
  { value: "10x", label: "Faster screening", icon: TrendingUp },
  { value: "95%", label: "Match accuracy", icon: Cpu },
  { value: "5", label: "Roles, one platform", icon: Users },
  { value: "∞", label: "Audit trail depth", icon: BarChart3 },
];

const ROLES = [
  {
    icon: Building2,
    title: "For Companies",
    color: "from-primary/15 to-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary",
    iconBg: "bg-primary-light",
    points: [
      "Create jobs with weighted requirements",
      "AI-powered candidate ranking with evidence",
      "Structured interview pipeline",
      "Real-time hiring analytics",
    ],
    cta: "Register Your Company",
    link: "/register",
  },
  {
    icon: Users,
    title: "For Candidates",
    color: "from-ai/15 to-ai/5",
    borderColor: "border-ai/20",
    iconColor: "text-ai",
    iconBg: "bg-ai-light",
    points: [
      "AI-parsed resume with editable extraction",
      "See your match score and reasoning per job",
      "Track application status in real-time",
      "Receive interview invitations directly",
    ],
    cta: "Find Your Next Role",
    link: "/jobs",
  },
];

export function LandingPage() {
  const { isAuthenticated, currentUser } = useStore();

  const getDashboardLink = () => {
    if (!currentUser) return "/login";
    switch (currentUser.role) {
      case "BHR_MANAGER": case "HR_RECRUITER": return "/company/dashboard";
      case "INTERVIEWER": return "/interviewer/dashboard";
      case "CANDIDATE": return "/candidate/dashboard";
      case "PLATFORM_ADMIN": return "/admin/dashboard";
      default: return "/login";
    }
  };

  return (
    <div className="min-h-screen bg-bg font-sans text-text overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border">
        <div className="max-w-[1280px] mx-auto px-[32px] h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-[14px]">
            <div className="w-[38px] h-[38px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center shadow-glow-orange">
              <Sparkles className="w-[18px] h-[18px] text-white stroke-[1.5px]" />
            </div>
            <span className="text-[20px] font-bold text-text tracking-[-0.03em]">HireFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-[36px]">
            <Link to="/jobs" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">Browse Jobs</Link>
            <a href="#features" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">Features</a>
            <Link to="/demo" className="text-[15px] font-medium text-text-secondary hover:text-text transition-colors duration-[120ms]">AI Demo</Link>
          </div>
          <div className="flex items-center gap-[10px]">
            {isAuthenticated ? (
              <Link to={getDashboardLink()}>
                <Button variant="header" className="h-[40px] px-[18px] text-[14px] font-semibold rounded-md">
                  Go to Dashboard <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-[18px] py-[9px] rounded-md text-[14px] font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-all duration-[120ms]">Sign In</Link>
                <Link to="/register">
                  <Button variant="header" className="h-[40px] px-[18px] text-[14px] font-semibold rounded-md">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-[168px] pb-[128px] hero-mesh min-h-screen flex items-center">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[8%] w-[380px] h-[380px] rounded-full bg-primary/8 blur-[100px] animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute bottom-[25%] left-[5%] w-[300px] h-[300px] rounded-full bg-ai-dark/8 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-[60%] right-[30%] w-[200px] h-[200px] rounded-full bg-primary/6 blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-[32px] w-full">
          <div className="max-w-[820px] page-enter">
            <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] rounded-full bg-ai-light border border-ai/25 text-[13px] font-semibold text-ai mb-[36px] shadow-glow-violet">
              <Brain className="w-[14px] h-[14px] stroke-[2px]" />
              AI-Powered Hiring Platform
            </div>
            <h1 className="text-[58px] sm:text-[72px] lg:text-[84px] font-extrabold text-text leading-[1.02] tracking-[-0.04em] mb-[32px]">
              Hire the right people,{" "}
              <span className="gradient-text">faster.</span>
            </h1>
            <p className="text-[20px] text-text-secondary leading-[32px] mb-[52px] max-w-[600px]">
              AI ranks candidates against your weighted job requirements with evidence-based explanations.
              <strong className="text-text font-semibold"> The AI recommends — a human decides.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-[14px]">
              <Link to="/register">
                <button className="inline-flex items-center gap-[10px] h-[56px] px-[32px] text-[17px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] active:scale-[0.99] transition-all duration-[150ms]">
                  <Sparkles className="w-[20px] h-[20px] stroke-[1.5px]" />
                  Start Hiring Free
                </button>
              </Link>
              <Link to="/jobs">
                <button className="inline-flex items-center gap-[10px] h-[56px] px-[32px] text-[16px] font-semibold text-text-secondary rounded-lg border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all duration-[150ms]">
                  Browse Open Roles <ChevronRight className="w-[18px] h-[18px] stroke-[1.5px]" />
                </button>
              </Link>
            </div>
          </div>
          <div className="mt-[80px] grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border rounded-xl overflow-hidden shadow-md page-enter">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-surface-2 px-[32px] py-[28px] flex flex-col gap-[8px]">
                  <Icon className="w-[18px] h-[18px] text-primary stroke-[1.5px] mb-[4px]" />
                  <span className="text-[36px] font-extrabold text-text tracking-[-0.04em] leading-none gradient-text">{s.value}</span>
                  <span className="text-[13px] text-text-secondary font-medium">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-[120px] border-t border-border bg-surface">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="text-center mb-[72px]">
            <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.10em] mb-[16px]">Two Sides, One Platform</p>
            <h2 className="text-[42px] font-bold text-text tracking-[-0.03em] mb-[18px]">Who is HireFlow for?</h2>
            <p className="text-[18px] text-text-secondary max-w-[460px] mx-auto leading-[28px]">Two sides of the hiring equation, unified.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[28px] stagger-in">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <div key={i} className={`relative rounded-2xl bg-gradient-to-br ${role.color} border ${role.borderColor} p-[48px] overflow-hidden group hover:-translate-y-1 transition-all duration-200`}>
                  <div className={`absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-gradient-to-br ${role.color} blur-[60px] opacity-60 pointer-events-none`} />
                  <div className={`w-[56px] h-[56px] rounded-xl ${role.iconBg} border flex items-center justify-center mb-[28px] relative`}>
                    <Icon className={`w-[28px] h-[28px] ${role.iconColor} stroke-[1.5px]`} />
                  </div>
                  <h2 className="text-[26px] font-bold text-text mb-[24px] tracking-[-0.02em] relative">{role.title}</h2>
                  <ul className="space-y-[14px] mb-[36px] relative">
                    {role.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-[14px] text-[15px] text-text-secondary">
                        <CheckCircle className="w-[17px] h-[17px] text-success mt-[3px] shrink-0 stroke-[1.5px]" />
                        <span className="leading-[22px]">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={role.link} className="relative">
                    <button className={`inline-flex items-center gap-[8px] h-[44px] px-[22px] text-[14px] font-semibold ${role.iconColor} border ${role.borderColor} rounded-lg bg-surface/60 hover:bg-surface transition-all duration-[120ms]`}>
                      {role.cta} <ArrowRight className="w-[15px] h-[15px] stroke-[1.5px]" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-[120px] border-t border-border">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="mb-[72px]">
            <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.10em] mb-[16px]">Platform Capabilities</p>
            <h2 className="text-[42px] font-bold text-text mb-[18px] tracking-[-0.03em] max-w-[560px]">Built for real hiring workflows</h2>
            <p className="text-[18px] text-text-secondary max-w-[500px] leading-[28px]">Not a mockup. Not a job board. A complete, role-gated hiring platform with explainable AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] stagger-in">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`relative rounded-2xl bg-gradient-to-br ${f.accent} border border-border p-[36px] overflow-hidden hover:border-border-strong hover:-translate-y-[2px] transition-all duration-200 shadow-xs hover:shadow-md`}>
                  <div className={`w-[48px] h-[48px] rounded-xl ${f.iconBg} border flex items-center justify-center mb-[22px]`}>
                    <Icon className={`w-[22px] h-[22px] ${f.iconColor} stroke-[1.5px]`} />
                  </div>
                  <h3 className="text-[18px] font-bold text-text mb-[12px] tracking-[-0.01em]">{f.title}</h3>
                  <p className="text-[15px] text-text-secondary leading-[24px]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 -z-10 hero-mesh opacity-70" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
        <div className="max-w-[720px] mx-auto px-[32px] text-center relative z-10">
          <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.10em] mb-[20px]">Get Started Today</p>
          <h2 className="text-[48px] font-extrabold text-text mb-[20px] tracking-[-0.03em] leading-[1.08]">Ready to transform your hiring?</h2>
          <p className="text-[18px] text-text-secondary mb-[44px] leading-[28px]">The AI recommends, a human decides. No irreversible action happens without an authenticated human confirming it.</p>
          <div className="flex flex-col sm:flex-row gap-[14px] justify-center">
            <Link to="/register">
              <button className="inline-flex items-center gap-[10px] h-[56px] px-[36px] text-[17px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] active:scale-[0.99] transition-all duration-[150ms]">
                Get Started Free <ArrowRight className="w-[20px] h-[20px] stroke-[1.5px]" />
              </button>
            </Link>
            <Link to="/jobs">
              <button className="inline-flex items-center gap-[10px] h-[56px] px-[36px] text-[16px] font-semibold text-text-secondary rounded-lg border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all duration-[150ms]">
                Browse Open Roles
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[48px] border-t border-border bg-surface">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-[20px]">
            <div className="flex items-center gap-[12px]">
              <div className="w-[32px] h-[32px] rounded-md bg-gradient-to-br from-primary to-primary-active flex items-center justify-center">
                <Sparkles className="w-[14px] h-[14px] text-white stroke-[1.5px]" />
              </div>
              <span className="text-[16px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
            </div>
            <div className="flex gap-[28px] text-[14px] font-medium text-text-secondary">
              <Link to="/jobs" className="hover:text-text transition-colors duration-[120ms]">Jobs</Link>
              <Link to="/demo" className="hover:text-text transition-colors duration-[120ms]">AI Demo</Link>
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
