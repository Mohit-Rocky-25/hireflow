// ============================================================
// HireFlow — Landing Page (Aesthetic & Context-Driven)
// ============================================================
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  Sparkles, Brain, Users, CheckCircle, ArrowRight,
  Shield, Zap, Target, Building2, ChevronRight, Cpu, BarChart3, TrendingUp,
  MessageSquare, FileText, Briefcase, GraduationCap, Flame
} from "lucide-react";
import { PublicNavbar } from "../app/layout/PublicNavbar";
import { careers } from "../careers-core";
import { COMPANIES } from "./demo/talentLensData";

const TOTAL_COMPANIES = COMPANIES.length;
const TOTAL_ROLES = COMPANIES.reduce((acc, c) => acc + c.roles.length, 0);

const FEATURES = [
  {
    icon: Brain,
    title: "Harsh Truth AI",
    desc: "We don't sugarcoat. Our AI acts like a ruthless recruiter, tearing apart your resume to tell you exactly why you'd be rejected.",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50 border-violet-200/80",
  },
  {
    icon: Target,
    title: "Trajectory Mapping",
    desc: "Stop guessing your next move. Input your dream job and we generate a year-by-year syllabus of skills you need to learn.",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200/80",
  },
  {
    icon: Zap,
    title: "Instant ATS Simulation",
    desc: "Drop in any Job Description and your Resume. We instantly simulate an enterprise ATS scan to give you a match score.",
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50 border-sky-200/80",
  },
];

const TOOLS = [
  {
    icon: Brain,
    title: "TalentLens Simulator",
    badge: `${TOTAL_COMPANIES}+ Employers & Recruiters · 6-Layer AI`,
    badgeStyle: "bg-sky-50 text-sky-700 border-sky-200/80 group-hover:bg-sky-100",
    iconBoxStyle: "bg-sky-500/10 border-sky-500/20 text-sky-600 group-hover:bg-sky-500 group-hover:text-white",
    cardHoverStyle: "hover:border-sky-400/90 hover:ring-2 hover:ring-sky-400/15",
    accentGrad: "from-sky-500 to-indigo-500",
    buttonStyle: "group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500",
    points: [
      "Experience our proprietary B2B AI matching engine",
      "See how recruiters evaluate your profile behind the scenes",
      "Understand semantic gap analysis & evidence extraction"
    ],
    cta: "Launch Simulator",
    link: "/demo",
  },
  {
    icon: Flame,
    title: "ATS Resume Roaster",
    badge: "Hot · Instant Audit",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/80 group-hover:bg-amber-100",
    iconBoxStyle: "bg-amber-500/10 border-amber-500/20 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
    cardHoverStyle: "hover:border-amber-400/90 hover:ring-2 hover:ring-amber-400/15",
    accentGrad: "from-amber-500 to-orange-500",
    buttonStyle: "group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500",
    points: [
      "Simulate exactly what ATS filters see",
      "Get a harsh match score for any Job Description",
      "Identify missing hard skills & red flags instantly"
    ],
    cta: "Roast My Resume",
    link: "/tools/resume-checker",
  },
  {
    icon: Target,
    title: "Career Trajectory",
    badge: "₹ CTC · Level Ladders",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80 group-hover:bg-emerald-100",
    iconBoxStyle: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    cardHoverStyle: "hover:border-emerald-400/90 hover:ring-2 hover:ring-emerald-400/15",
    accentGrad: "from-emerald-500 to-teal-500",
    buttonStyle: "group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600",
    points: [
      "Plan your path from campus to dream companies",
      "Real eligibility rules, cutoffs & fresher CTC in INR",
      "Step-by-step offer routes, timeline & action guide"
    ],
    cta: "Plan My Trajectory",
    link: "/tools/career-path",
  },
];

export function LandingPage() {
  const { isAuthenticated, currentUser } = useStore();


  return (
    <div className="min-h-screen bg-bg font-sans text-text overflow-x-hidden">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative pt-[136px] pb-[96px] lg:pt-[152px] lg:pb-[112px] hero-mesh flex items-center">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[18%] right-[8%] w-[380px] h-[380px] rounded-full bg-primary/8 blur-[100px] animate-float" style={{ animationDelay: "0s" }} />
          <div className="absolute bottom-[22%] left-[5%] w-[300px] h-[300px] rounded-full bg-ai-dark/8 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-[55%] right-[30%] w-[200px] h-[200px] rounded-full bg-primary/6 blur-[80px] animate-float" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[32px] w-full text-center">
          <div className="max-w-[860px] mx-auto page-enter flex flex-col items-center">
            
            {/* Main Headline — Deep Solid Black */}
            <h1 className="text-[52px] sm:text-[68px] lg:text-[84px] font-black text-black leading-[1.03] tracking-[-0.04em] mb-[24px]">
              Take control of your{" "}
              <span className="gradient-text">Career.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[18px] sm:text-[20px] text-text-secondary leading-[30px] sm:leading-[32px] mb-[44px] max-w-[620px] mx-auto font-normal">
              Simulate ATS resume filters, map your career trajectory, and test your resume against {TOTAL_COMPANIES}+ verified employers and {TOTAL_ROLES.toLocaleString()}+ calibrated roles across active recruiters — all completely free.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-[14px] justify-center w-full">
              <Link to="/demo">
                <button className="inline-flex items-center gap-[10px] h-[54px] px-[32px] text-[16px] font-bold text-white rounded-xl bg-gradient-to-r from-primary to-ai shadow-glow-orange hover:scale-[1.02] active:scale-[0.99] transition-all duration-[150ms]">
                  <Sparkles className="w-[18px] h-[18px] stroke-[1.8px]" />
                  Try TalentLens™
                </button>
              </Link>
              <Link to="/tools/resume-checker">
                <button className="inline-flex items-center gap-[10px] h-[54px] px-[28px] text-[15px] font-semibold text-text-secondary rounded-xl border border-border-strong bg-white hover:border-border-accent hover:text-black hover:bg-surface-2 transition-all duration-[150ms] shadow-xs">
                  ATS Roaster
                </button>
              </Link>
              <Link to="/tools">
                <button className="inline-flex items-center gap-[10px] h-[54px] px-[28px] text-[15px] font-semibold text-text-secondary rounded-xl border border-border-strong bg-white hover:border-border-accent hover:text-black hover:bg-surface-2 transition-all duration-[150ms] shadow-xs">
                  Decision Suite <ChevronRight className="w-[16px] h-[16px] stroke-[2px]" />
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Bento Grid */}
          <div className="mt-[64px] sm:mt-[80px] grid grid-cols-1 md:grid-cols-3 gap-[20px] sm:gap-[24px] page-enter max-w-[1140px] mx-auto w-full px-2 sm:px-[20px]">
            {/* Card 1: Employers (Wide) */}
            <div className="md:col-span-2 relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[36px] sm:p-[40px] overflow-hidden group hover:border-blue-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] text-left">
              <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[60px] h-[60px] rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-[28px] group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="w-[30px] h-[30px] text-blue-500" />
                </div>
                <div>
                  <h3 className="text-[52px] sm:text-[56px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-indigo-400 transition-all duration-500">{TOTAL_COMPANIES}+</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Top Employers & Recruiters</p>
                  <p className="text-[15px] text-text-secondary font-medium">FAANG, Unicorns, Cybersecurity, GCCs, and Indian Tech Giants verified.</p>
                </div>
              </div>
              <div className="absolute bottom-[-15%] right-[-5%] opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none rotate-12">
                <Building2 className="w-[280px] h-[280px] text-blue-500" />
              </div>
            </div>

            {/* Card 2: Roles (Tall/Square) */}
            <div className="relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[36px] sm:p-[40px] overflow-hidden group hover:border-amber-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] text-left">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-amber-500/10 blur-[60px] pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[60px] h-[60px] rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-[28px] group-hover:scale-110 transition-transform duration-500">
                  <Briefcase className="w-[30px] h-[30px] text-amber-500" />
                </div>
                <div>
                  <h3 className="text-[52px] sm:text-[56px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-400 transition-all duration-500">{TOTAL_ROLES.toLocaleString()}+</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Calibrated Roles</p>
                  <p className="text-[15px] text-text-secondary font-medium">Deep 6-layer competency mapping across all companies.</p>
                </div>
              </div>
            </div>

            {/* Card 3: ATS Audit (Square) */}
            <div className="relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[36px] sm:p-[40px] overflow-hidden group hover:border-violet-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)] text-left">
              <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-violet-500/10 blur-[70px] pointer-events-none group-hover:bg-violet-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[60px] h-[60px] rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-[28px] group-hover:scale-110 transition-transform duration-500">
                  <Zap className="w-[30px] h-[30px] text-violet-500" />
                </div>
                <div>
                  <h3 className="text-[44px] sm:text-[48px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-purple-400 transition-all duration-500">6-Layer</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Deep ATS Audit</p>
                  <p className="text-[15px] text-text-secondary font-medium">Harsh citations & gap fixes.</p>
                </div>
              </div>
            </div>

            {/* Card 4: Campus Intelligence (Wide) */}
            <div className="md:col-span-2 relative rounded-[32px] bg-gradient-to-br from-surface/80 to-surface-2/80 backdrop-blur-md border border-border/80 p-[36px] sm:p-[40px] overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] text-left">
              <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="w-[60px] h-[60px] rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-[28px] group-hover:scale-110 transition-transform duration-500">
                  <GraduationCap className="w-[30px] h-[30px] text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-[52px] sm:text-[56px] font-black text-text tracking-tighter leading-none mb-[12px] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-400 transition-all duration-500">'26-27</h3>
                  <p className="text-[20px] font-extrabold text-text mb-[6px] tracking-tight">Campus Intelligence</p>
                  <p className="text-[15px] text-text-secondary font-medium">85+ verified fresher programs, actual CTC bands & eligibility.</p>
                </div>
              </div>
              <div className="absolute bottom-[-20%] right-[-5%] opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none -rotate-12">
                <GraduationCap className="w-[260px] h-[260px] text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tools Cards (Symmetrical 3-Column Grid) */}
      <section className="py-[100px] border-t border-border bg-slate-50/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[32px]">
          <div className="text-center mb-[60px]">
            <p className="text-[12px] font-bold text-primary uppercase tracking-[0.14em] mb-[12px]">Free Tools</p>
            <h2 className="text-[38px] sm:text-[46px] font-black text-black tracking-[-0.03em] mb-[14px]">
              Accelerate your career.
            </h2>
            <p className="text-[17px] sm:text-[18px] text-text-secondary max-w-[500px] mx-auto leading-relaxed">
              Everything you need to land your next big role.
            </p>
          </div>

          {/* Symmetrical 3-Column Layout with Premium Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-[1240px] mx-auto">
            {TOOLS.map((role, i) => {
              const Icon = role.icon;
              return (
                <Link
                  key={i}
                  to={role.link}
                  className={`group relative rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-9 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-2 active:scale-[0.985] transition-all duration-200 cursor-pointer overflow-hidden ${role.cardHoverStyle}`}
                >
                  {/* Subtle top glow bar on hover */}
                  <div className={`absolute top-0 left-6 right-6 h-[3px] rounded-b-full bg-gradient-to-r ${role.accentGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

                  <div>
                    {/* Top row: Icon and Badge */}
                    <div className="flex items-center justify-between gap-4 mb-7">
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-200 shadow-xs ${role.iconBoxStyle}`}>
                        <Icon className="w-7 h-7 stroke-[2px]" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${role.badgeStyle}`}>
                        {role.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[24px] sm:text-[26px] font-black text-black mb-4 tracking-tight group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>

                    {/* Points list */}
                    <ul className="space-y-3.5 mb-8">
                      {role.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-3 text-[14px] sm:text-[15px] text-text-secondary font-medium leading-snug">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 stroke-[2.2px]" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Button */}
                  <div className={`w-full py-3.5 px-5 rounded-xl border border-slate-200/90 bg-slate-50 text-slate-800 text-[14px] font-bold flex items-center justify-between transition-all duration-200 shadow-2xs ${role.buttonStyle}`}>
                    <span>{role.cta}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2px] group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Features (Symmetrical 3-Column Grid) */}
      <section id="features" className="py-[100px] border-t border-border bg-white relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[32px] relative z-10">
          <div className="mb-[60px] text-center max-w-2xl mx-auto">
            <p className="text-[12px] font-bold text-primary uppercase tracking-[0.14em] mb-[12px]">Core Features</p>
            <h2 className="text-[38px] sm:text-[46px] font-black text-black mb-[14px] tracking-[-0.03em]">
              Built for the modern candidate
            </h2>
            <p className="text-[17px] sm:text-[18px] text-text-secondary leading-relaxed">
              We reverse-engineered enterprise ATS systems so you can finally beat them.
            </p>
          </div>

          {/* Symmetrical 3-Column Layout with Zero Orphan Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-[1240px] mx-auto">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-3xl bg-slate-50/70 border border-slate-200/80 p-8 hover:bg-white hover:border-slate-300 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-2xl ${f.iconBg} border flex items-center justify-center mb-6 shadow-xs group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className={`w-6 h-6 ${f.iconColor} stroke-[2px]`} />
                  </div>
                  <h3 className="text-[20px] font-bold text-black mb-2.5 tracking-tight group-hover:text-primary transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-text-secondary leading-relaxed font-normal">
                    {f.desc}
                  </p>
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
              Stop firing your resume into the void. Our scanner evaluates your profile with industry-leading precision, instantly flagging missing hard skills, overused buzzwords, and formatting errors before you apply.
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
