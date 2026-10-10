// ============================================================
// HireFlow — Landing Page (Aesthetic & Context-Driven)
// ============================================================
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  Sparkles, Brain, Users, CheckCircle, ArrowRight,
  Shield, Zap, Target, Building2, ChevronRight, Cpu, BarChart3, TrendingUp,
  MessageSquare, FileText, Briefcase, GraduationCap
} from "lucide-react";
import { PublicNavbar } from "../components/layout/PublicNavbar";
import { careers } from "../careers-core";

const FEATURES = [
  {
    icon: Brain,
    title: "Harsh Truth AI",
    desc: "We don't sugarcoat. Our AI acts like a ruthless recruiter, tearing apart your resume to tell you exactly why you'd be rejected.",
    accent: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-ai",
    iconBg: "bg-ai-light border-ai/20",
  },
  {
    icon: Target,
    title: "Trajectory Mapping",
    desc: "Stop guessing your next move. Input your dream job and we generate a year-by-year syllabus of skills you need to learn.",
    accent: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-success",
    iconBg: "bg-success-bg border-success/20",
  },
  {
    icon: Zap,
    title: "Instant ATS Simulation",
    desc: "Drop in any Job Description and your Resume. We instantly simulate an enterprise ATS scan to give you a match score.",
    accent: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    iconBg: "bg-primary-light border-primary/20",
  },
];

const STATS = [
  {
    value: "100+",
    label: "Top Employers",
    sub: "FAANG, Unicorns & GCCs",
    icon: Building2,
    color: "from-blue-500/15 to-indigo-500/5",
    iconColor: "text-blue-500",
    badgeBg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    value: "908+",
    label: "Calibrated Roles",
    sub: "Real 6-layer competency weights",
    icon: Briefcase,
    color: "from-amber-500/15 to-orange-500/5",
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    value: "6-Layer",
    label: "Deep ATS Audit",
    sub: "Harsh invariant citations & fixes",
    icon: Zap,
    color: "from-violet-500/15 to-purple-500/5",
    iconColor: "text-violet-500",
    badgeBg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    value: "'26-27",
    label: "Campus Intelligence",
    sub: "60 verified fresher programs & cutoffs",
    icon: GraduationCap,
    color: "from-emerald-500/15 to-teal-500/5",
    iconColor: "text-emerald-500",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

const TOOLS = [
  {
    icon: FileText,
    title: "ATS Resume Roaster",
    color: "from-primary/15 to-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary",
    iconBg: "bg-primary-light",
    points: [
      "Simulate exactly what ATS filters see",
      "Get a harsh match score for any Job Description",
      "Identify missing hard skills and red flags instantly"
    ],
    cta: "Roast My Resume",
    link: "/tools/resume-checker",
  },
  {
    icon: Target,
    title: "Career Trajectory",
    subtitle: "Dream Job Roadmap · Company Levels & Pay",
    color: "from-ai/15 to-ai/5",
    borderColor: "border-ai/20",
    iconColor: "text-ai",
    iconBg: "bg-ai-light",
    points: [
      "Plan your path from campus to dream companies",
      "Real eligibility rules, cutoffs & fresher CTC in INR",
      "Step-by-step offer routes, timeline & action guide"
    ],
    cta: "Plan My Trajectory",
    link: "/tools/career-path",
  },
  {
    icon: Brain,
    title: "TalentLens Simulator",
    color: "from-violet-500/15 to-violet-500/5",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
    points: [
      "Experience our proprietary B2B AI matching engine",
      "See how recruiters evaluate your profile behind the scenes",
      "Understand semantic gap analysis and evidence extraction"
    ],
    cta: "Launch Simulator",
    link: "/demo",
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
            <div className="inline-flex items-center gap-[12px] px-[6px] py-[6px] pr-[18px] rounded-full bg-white border border-border shadow-sm mb-[40px] hover:shadow-md hover:-translate-y-[1px] transition-all duration-300 group cursor-default">
              <div className="flex items-center justify-center px-[12px] py-[4px] rounded-full bg-gradient-to-r from-primary to-ai shadow-glow-violet">
                <span className="text-[11px] font-black text-white uppercase tracking-wider">New</span>
              </div>
              <span className="text-[14px] font-semibold text-text-secondary group-hover:text-text transition-colors flex items-center gap-[6px]">
                Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ai font-extrabold tracking-tight">TalentLens™ v7</span> 
                <span className="text-[13px] font-medium text-text-muted ml-[4px]">The ultimate candidate intelligence engine</span>
              </span>
            </div>
            <h1 className="text-[58px] sm:text-[72px] lg:text-[84px] font-extrabold text-text leading-[1.02] tracking-[-0.04em] mb-[32px]">
              Take control of your{" "}
              <span className="gradient-text">Career.</span>
            </h1>
            <p className="text-[20px] text-text-secondary leading-[32px] mb-[52px] max-w-[600px] mx-auto">
              Simulate ATS resume filters, map your career trajectory, and test your resume against {careers.stats.counts().companies} verified companies and {careers.stats.counts().roles}+ roles — all completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-[14px] justify-center w-full">
              <Link to="/demo">
                <button className="inline-flex items-center gap-[10px] h-[56px] px-[32px] text-[17px] font-bold text-white rounded-lg bg-gradient-to-r from-primary to-ai shadow-glow-orange hover:scale-[1.02] active:scale-[0.99] transition-all duration-[150ms]">
                  <Sparkles className="w-[20px] h-[20px] stroke-[1.5px]" />
                  Try TalentLens™
                </button>
              </Link>
              <Link to="/tools/resume-checker">
                <button className="inline-flex items-center gap-[10px] h-[56px] px-[28px] text-[16px] font-semibold text-text-secondary rounded-lg border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all duration-[150ms]">
                  ATS Roaster
                </button>
              </Link>
              <Link to="/tools">
                <button className="inline-flex items-center gap-[10px] h-[56px] px-[28px] text-[16px] font-semibold text-text-secondary rounded-lg border border-border-strong hover:border-border-accent hover:text-text hover:bg-surface-2 transition-all duration-[150ms]">
                  Decision Suite <ChevronRight className="w-[18px] h-[18px] stroke-[1.5px]" />
                </button>
              </Link>
            </div>
          </div>
          <div className="mt-[80px] grid grid-cols-1 md:grid-cols-3 gap-[24px] page-enter max-w-[1140px] mx-auto w-full px-[20px]">
            {/* Card 1: Employers (Wide) */}
            <div className="md:col-span-2 relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[40px] overflow-hidden group hover:border-blue-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)]">
              <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[64px] h-[64px] rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-[32px] group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="w-[32px] h-[32px] text-blue-500" />
                </div>
                <div>
                  <h3 className="text-[56px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-500">100+</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Top Tech Employers</p>
                  <p className="text-[15px] text-text-secondary font-medium">FAANG, Unicorns, and elite GCCs verified.</p>
                </div>
              </div>
              <div className="absolute bottom-[-15%] right-[-5%] opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none rotate-12">
                <Building2 className="w-[280px] h-[280px] text-blue-500" />
              </div>
            </div>

            {/* Card 2: Roles (Tall/Square) */}
            <div className="relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[40px] overflow-hidden group hover:border-amber-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)]">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-amber-500/10 blur-[60px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[64px] h-[64px] rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-[32px] group-hover:scale-110 transition-transform duration-500">
                  <Briefcase className="w-[32px] h-[32px] text-amber-500" />
                </div>
                <div>
                  <h3 className="text-[56px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-400 transition-all duration-500">908+</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Calibrated Roles</p>
                  <p className="text-[15px] text-text-secondary font-medium">Deep 6-layer competency mapping.</p>
                </div>
              </div>
            </div>

            {/* Card 3: ATS Audit (Square) */}
            <div className="relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[40px] overflow-hidden group hover:border-violet-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)]">
              <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-violet-500/10 blur-[70px] pointer-events-none group-hover:bg-violet-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[64px] h-[64px] rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-[32px] group-hover:scale-110 transition-transform duration-500">
                  <Zap className="w-[32px] h-[32px] text-violet-500" />
                </div>
                <div>
                  <h3 className="text-[48px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-purple-400 transition-all duration-500">6-Layer</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Deep ATS Audit</p>
                  <p className="text-[15px] text-text-secondary font-medium">Harsh citations & gap fixes.</p>
                </div>
              </div>
            </div>

            {/* Card 4: Campus Intelligence (Wide) */}
            <div className="md:col-span-2 relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[40px] overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)]">
              <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[64px] h-[64px] rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-[32px] group-hover:scale-110 transition-transform duration-500">
                  <GraduationCap className="w-[32px] h-[32px] text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-[56px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-400 transition-all duration-500">'26-27</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Campus Intelligence</p>
                  <p className="text-[15px] text-text-secondary font-medium">60 verified fresher programs, actual CTC bands & eligibility.</p>
                </div>
              </div>
              <div className="absolute bottom-[-20%] right-[-5%] opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none -rotate-12">
                <GraduationCap className="w-[260px] h-[260px] text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-[120px] border-t border-border bg-surface">
        <div className="max-w-[1280px] mx-auto px-[32px]">
          <div className="text-center mb-[72px]">
            <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.10em] mb-[16px]">Free Tools</p>
            <h2 className="text-[42px] font-bold text-text tracking-[-0.03em] mb-[18px]">Accelerate your career.</h2>
            <p className="text-[18px] text-text-secondary max-w-[460px] mx-auto leading-[28px]">Everything you need to land your next big role.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[28px] stagger-in">
            {TOOLS.map((role, i) => {
              const Icon = role.icon;
              return (
                <div key={i} className={`relative rounded-3xl bg-gradient-to-br ${role.color} border ${role.borderColor} p-[48px] overflow-hidden group hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg`}>
                  <div className={`absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-gradient-to-br ${role.color} blur-[80px] opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-700`} />
                  <div className={`w-[64px] h-[64px] rounded-2xl ${role.iconBg} border flex items-center justify-center mb-[32px] relative shadow-sm`}>
                    <Icon className={`w-[32px] h-[32px] ${role.iconColor} stroke-[1.5px]`} />
                  </div>
                  <h2 className="text-[28px] font-bold text-text mb-[8px] tracking-[-0.02em] relative">{role.title}</h2>
                  {role.subtitle ? (
                    <p className="text-[13px] font-semibold text-text-secondary mb-[20px] relative">{role.subtitle}</p>
                  ) : (
                    <div className="mb-[16px]" />
                  )}
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
            <p className="text-[13px] font-semibold text-primary uppercase tracking-[0.10em] mb-[16px]">Core Features</p>
            <h2 className="text-[42px] font-bold text-text mb-[18px] tracking-[-0.03em] max-w-[600px] md:mx-0 mx-auto">Built for the modern candidate</h2>
            <p className="text-[18px] text-text-secondary max-w-[500px] leading-[28px] md:mx-0 mx-auto">We reverse-engineered enterprise ATS systems so you can finally beat them.</p>
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-ai/5 blur-[120px] pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-[32px] relative z-10 flex flex-col lg:flex-row items-center gap-[64px]">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-[8px] px-[12px] py-[6px] bg-ai-light border border-ai/20 rounded-full text-[13px] font-semibold text-ai mb-[24px]">
              <Sparkles className="w-[14px] h-[14px]" /> Harsh Truth AI
            </div>
            <h2 className="text-[38px] md:text-[46px] font-bold text-text tracking-[-0.03em] leading-[1.1] mb-[24px]">
              Know exactly <span className="text-ai">why</span> you're getting rejected.
            </h2>
            <p className="text-[18px] text-text-secondary leading-[1.8] mb-[32px]">
              Stop firing your resume into the void. Our scanner reads exactly like Workday or Greenhouse, instantly flagging missing hard skills, overused buzzwords, and formatting errors before you apply.
            </p>
            <ul className="space-y-[16px] text-[15px] text-text font-medium">
              <li className="flex items-center gap-[12px] justify-center lg:justify-start">
                <CheckCircle className="w-[20px] h-[20px] text-ai" /> Enterprise ATS simulation
              </li>
              <li className="flex items-center gap-[12px] justify-center lg:justify-start">
                <CheckCircle className="w-[20px] h-[20px] text-ai" /> Identifies semantic keyword gaps
              </li>
              <li className="flex items-center gap-[12px] justify-center lg:justify-start">
                <CheckCircle className="w-[20px] h-[20px] text-ai" /> No-BS actionable feedback
              </li>
            </ul>
          </div>
          
          <div className="flex-1 w-full max-w-[600px]">
            <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="px-[24px] py-[16px] border-b border-border bg-surface-2/60 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-text-muted font-medium">ATS Match Report</p>
                  <h3 className="text-[15px] font-bold text-text">Target: Senior Frontend Engineer</h3>
                </div>
                <span className="px-[12px] py-[4px] bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold rounded-full uppercase">
                  Score: 42%
                </span>
              </div>

              <div className="p-[24px] space-y-[16px]">
                {/* Error 1 */}
                <div className="border border-border rounded-xl p-[16px] bg-surface space-y-[12px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[15px] font-bold text-text">Missing Skill: Webpack/Vite</span>
                      <span className="ml-[8px] text-[11px] font-semibold text-text-muted uppercase">Critical</span>
                    </div>
                    <span className="bg-red-50 text-red-700 border border-red-200 px-[10px] py-[2px] rounded-full text-[11px] font-bold uppercase">Missing</span>
                  </div>
                  <div className="bg-red-50/50 border border-red-100 rounded-lg px-[12px] py-[10px]">
                    <p className="text-[13px] text-red-800 mb-[6px] font-medium">Auto-Reject Triggered</p>
                    <p className="text-[13px] text-text-secondary">The job description mentions Webpack 5 times. You have exactly zero mentions of bundlers in your resume. ATS systems will auto-filter you immediately.</p>
                  </div>
                </div>

                {/* Error 2 */}
                <div className="border border-border rounded-xl p-[16px] bg-surface space-y-[12px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[15px] font-bold text-text">Impact Metrics</span>
                      <span className="ml-[8px] text-[11px] font-semibold text-text-muted uppercase">Warning</span>
                    </div>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-[10px] py-[2px] rounded-full text-[11px] font-bold uppercase">Needs Work</span>
                  </div>
                  <div className="bg-surface-2 rounded-lg px-[12px] py-[10px]">
                    <p className="text-[13px] text-text-secondary">"Responsible for building components" is a weak bullet point. Change this to "Built 15+ reusable components, reducing development time by 30%". Give us the data.</p>
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
          <h2 className="text-[48px] md:text-[56px] font-extrabold text-text mb-[24px] tracking-[-0.03em] leading-[1.1]">Ready to decode your career?</h2>
          <p className="text-[20px] text-text-secondary mb-[48px] leading-[1.6]">Simulate ATS filters, map your trajectory, and apply to top companies.</p>
          <div className="flex flex-col sm:flex-row gap-[16px] justify-center">
            <Link to="/register">
              <button className="inline-flex items-center gap-[12px] h-[60px] px-[40px] text-[18px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-glow-orange hover:scale-[1.02] active:scale-[0.99] transition-all duration-[200ms]">
                Get Started Free <ArrowRight className="w-[20px] h-[20px] stroke-[2px]" />
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
