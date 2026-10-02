// ============================================================
// HireFlow — Landing Page (Aesthetic & Context-Driven)
// ============================================================
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  Sparkles, Brain, Users, CheckCircle, ArrowRight,
  Shield, Zap, Target, Building2, ChevronRight, Cpu, BarChart3, TrendingUp,
  MessageSquare
} from "lucide-react";
import { PublicNavbar } from "../components/layout/PublicNavbar";

const FEATURES = [
  {
    icon: Brain,
    title: "Explainable AI Matching",
    desc: "Candidates are ranked against weighted job requirements with clear, logical reasoning — never a bare percentage without context.",
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
      "AI-powered candidate ranking with reasoning",
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
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-[168px] pb-[128px] hero-mesh min-h-screen flex items-center">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[8%] w-[380px] h-[380px] rounded-full bg-primary/8 blur-[100px] animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute bottom-[25%] left-[5%] w-[300px] h-[300px] rounded-full bg-ai-dark/8 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-[60%] right-[30%] w-[200px] h-[200px] rounded-full bg-primary/6 blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-[32px] w-full text-center">
          <div className="max-w-[820px] mx-auto page-enter flex flex-col items-center">
            <div className="inline-flex items-center gap-[10px] px-[16px] py-[8px] rounded-full bg-ai-light border border-ai/25 text-[13px] font-semibold text-ai mb-[36px] shadow-glow-violet">
              <Brain className="w-[14px] h-[14px] stroke-[2px]" />
              The facts on work are changing now.
            </div>
            <h1 className="text-[58px] sm:text-[72px] lg:text-[84px] font-extrabold text-text leading-[1.02] tracking-[-0.04em] mb-[32px]">
              Hire the right people,{" "}
              <span className="gradient-text">faster.</span>
            </h1>
            <p className="text-[20px] text-text-secondary leading-[32px] mb-[52px] max-w-[600px] mx-auto">
              AI evaluates candidates against your job requirements and explains exactly why they match.
              <strong className="text-text font-semibold"> The AI recommends — a human decides.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-[14px] justify-center w-full">
              {isAuthenticated ? (
                <Link to={getDashboardLink()}>
                  <button className="inline-flex items-center gap-[10px] h-[56px] px-[32px] text-[17px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] active:scale-[0.99] transition-all duration-[150ms]">
                    Go to Dashboard <ArrowRight className="w-[20px] h-[20px] stroke-[1.5px]" />
                  </button>
                </Link>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
          
          <div className="mt-[80px] grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border rounded-xl overflow-hidden shadow-md page-enter max-w-[1000px] mx-auto">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-surface-2 px-[32px] py-[28px] flex flex-col items-center gap-[8px] text-center">
                  <Icon className="w-[24px] h-[24px] text-primary stroke-[1.5px] mb-[4px]" />
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
                <div key={i} className={`relative rounded-3xl bg-gradient-to-br ${role.color} border ${role.borderColor} p-[48px] overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg`}>
                  <div className={`absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-gradient-to-br ${role.color} blur-[80px] opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-700`} />
                  <div className={`w-[64px] h-[64px] rounded-2xl ${role.iconBg} border flex items-center justify-center mb-[32px] relative shadow-sm`}>
                    <Icon className={`w-[32px] h-[32px] ${role.iconColor} stroke-[1.5px]`} />
                  </div>
                  <h2 className="text-[28px] font-bold text-text mb-[24px] tracking-[-0.02em] relative">{role.title}</h2>
                  <ul className="space-y-[16px] mb-[40px] relative">
                    {role.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-[14px] text-[16px] text-text-secondary">
                        <CheckCircle className="w-[18px] h-[18px] text-success mt-[3px] shrink-0 stroke-[2px]" />
                        <span className="leading-[24px]">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={role.link} className="relative inline-block">
                    <button className={`inline-flex items-center gap-[10px] h-[48px] px-[24px] text-[15px] font-bold ${role.iconColor} border ${role.borderColor} rounded-xl bg-surface hover:bg-surface-2 transition-all duration-[120ms] shadow-sm`}>
                      {role.cta} <ArrowRight className="w-[16px] h-[16px] stroke-[2px]" />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-[120px] border-t border-border relative">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-ai-dark/5 blur-[120px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-[32px] relative z-10">
          <div className="mb-[72px] text-center md:text-left">
            <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.10em] mb-[16px]">Platform Capabilities</p>
            <h2 className="text-[42px] font-bold text-text mb-[18px] tracking-[-0.03em] max-w-[600px] md:mx-0 mx-auto">Built for real hiring workflows</h2>
            <p className="text-[18px] text-text-secondary max-w-[500px] leading-[28px] md:mx-0 mx-auto">Not a simple keyword matcher. A complete, role-gated platform powered by contextual AI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] stagger-in">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`relative rounded-3xl bg-gradient-to-br ${f.accent} border border-border p-[40px] overflow-hidden hover:border-border-strong hover:-translate-y-[4px] transition-all duration-300 shadow-sm hover:shadow-xl`}>
                  <div className={`w-[56px] h-[56px] rounded-2xl ${f.iconBg} border flex items-center justify-center mb-[24px]`}>
                    <Icon className={`w-[26px] h-[26px] ${f.iconColor} stroke-[1.5px]`} />
                  </div>
                  <h3 className="text-[20px] font-bold text-text mb-[14px] tracking-[-0.01em]">{f.title}</h3>
                  <p className="text-[16px] text-text-secondary leading-[26px]">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The AI Showcase Example */}
      <section className="py-[120px] border-t border-border bg-surface-2/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-[32px] relative z-10 flex flex-col lg:flex-row items-center gap-[64px]">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] bg-primary-light border border-primary/20 rounded-full text-[13px] font-semibold text-primary mb-[24px]">
              <Sparkles className="w-[14px] h-[14px]" /> Real Intelligence
            </div>
            <h2 className="text-[38px] md:text-[46px] font-bold text-text tracking-[-0.03em] leading-[1.1] mb-[24px]">
              Understand <span className="text-primary">why</span> they match.
            </h2>
            <p className="text-[18px] text-text-secondary leading-[1.8] mb-[32px]">
              No more guessing why an applicant got an 85% score. Our AI analyzes the context behind each skill, evaluates missing requirements, and suggests interview questions based on the candidate's actual profile gaps.
            </p>
            <ul className="space-y-[16px] text-[15px] text-text font-medium">
              <li className="flex items-center gap-[12px] justify-center lg:justify-start">
                <CheckCircle className="w-[20px] h-[20px] text-primary" /> Shows exact project context
              </li>
              <li className="flex items-center gap-[12px] justify-center lg:justify-start">
                <CheckCircle className="w-[20px] h-[20px] text-primary" /> Understands semantic relationships
              </li>
              <li className="flex items-center gap-[12px] justify-center lg:justify-start">
                <CheckCircle className="w-[20px] h-[20px] text-primary" /> Generates targeted questions
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full max-w-[600px]">
            <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="px-[24px] py-[16px] border-b border-border bg-surface-2/60 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-text-muted font-medium">AI Context Analysis</p>
                  <h3 className="text-[15px] font-bold text-text">Arjun Sharma → Senior Backend Engineer</h3>
                </div>
                <span className="px-[12px] py-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full uppercase">
                  Match Found
                </span>
              </div>

              <div className="p-[24px] space-y-[16px]">
                {/* Requirement 1 */}
                <div className="border border-border rounded-xl p-[16px] bg-surface space-y-[12px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[15px] font-bold text-text">Java & Spring Boot</span>
                      <span className="ml-[8px] text-[11px] font-semibold text-text-muted uppercase">Mandatory</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-[10px] py-[2px] rounded-full text-[11px] font-bold uppercase">Strong</span>
                  </div>
                  <div className="bg-surface-2 rounded-lg px-[12px] py-[10px]">
                    <p className="text-[13px] text-text-secondary italic">"Built distributed backend microservices in Java 17 with Spring Boot, handling 2M requests/day at TechCorp..."</p>
                  </div>
                </div>

                {/* Requirement 2 */}
                <div className="border border-border rounded-xl p-[16px] bg-surface space-y-[12px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[15px] font-bold text-text">Kafka</span>
                      <span className="ml-[8px] text-[11px] font-semibold text-text-muted uppercase">Mandatory</span>
                    </div>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-[10px] py-[2px] rounded-full text-[11px] font-bold uppercase">Partial</span>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-lg px-[12px] py-[10px]">
                    <p className="text-[13px] text-text-secondary mb-[6px]">Candidate has RabbitMQ experience, which is a closely related message broker. Semantic overlap is high.</p>
                    <p className="text-[12px] text-primary font-semibold flex items-center gap-[6px]">
                      <MessageSquare className="w-[12px] h-[12px]" /> Ask about event-driven architecture differences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[140px] relative overflow-hidden">
        <div className="absolute inset-0 -z-10 hero-mesh opacity-70" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
        <div className="max-w-[720px] mx-auto px-[32px] text-center relative z-10">
          <p className="text-[14px] font-bold text-primary uppercase tracking-[0.10em] mb-[24px]">Get Started Today</p>
          <h2 className="text-[48px] md:text-[56px] font-extrabold text-text mb-[24px] tracking-[-0.03em] leading-[1.1]">Ready to transform your hiring?</h2>
          <p className="text-[20px] text-text-secondary mb-[48px] leading-[1.6]">The AI evaluates, context clarifies, and a human decides. Experience the platform built for the future of recruitment.</p>
          <div className="flex flex-col sm:flex-row gap-[16px] justify-center">
            <Link to="/register">
              <button className="inline-flex items-center gap-[12px] h-[60px] px-[40px] text-[18px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] active:scale-[0.99] transition-all duration-[200ms]">
                Get Started Free <ArrowRight className="w-[20px] h-[20px] stroke-[2px]" />
              </button>
            </Link>
            <Link to="/jobs">
              <button className="inline-flex items-center gap-[12px] h-[60px] px-[40px] text-[17px] font-bold text-text-secondary rounded-xl border border-border hover:border-primary/50 hover:text-text hover:bg-surface-2 transition-all duration-[200ms] shadow-sm">
                Browse Open Roles
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[48px] border-t border-border bg-surface">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-[24px]">
            <div className="flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-sm">
                <Sparkles className="w-[18px] h-[18px] text-white stroke-[2px]" />
              </div>
              <span className="text-[18px] font-bold text-text tracking-[-0.02em]">HireFlow</span>
            </div>
            <div className="flex gap-[32px] text-[15px] font-medium text-text-secondary">
              <Link to="/jobs" className="hover:text-primary transition-colors duration-[200ms]">Jobs</Link>
              <Link to="/demo" className="hover:text-primary transition-colors duration-[200ms]">AI Context</Link>
              <Link to="/login" className="hover:text-primary transition-colors duration-[200ms]">Sign In</Link>
              <Link to="/register" className="hover:text-primary transition-colors duration-[200ms]">Register</Link>
            </div>
            <p className="text-[14px] text-text-muted">© 2026 HireFlow. Built for the future of work.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
