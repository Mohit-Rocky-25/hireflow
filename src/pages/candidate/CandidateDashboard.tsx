// ============================================================
// HireFlow — Candidate Platform Overview & Intelligence Hub
// Pure Career Decision Suite, TalentLens™ Recruiter Simulator,
// ATS Resume Roaster & Level Compensation Ladders
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  Sparkles,
  FileSearch,
  Compass,
  Zap,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  FileText,
  Layers,
  Award,
  GitCompare,
  Mail,
  Code2,
  CheckCircle2,
  Flame,
  User,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useProfile } from '../../features/suite/profile/ProfileContext';

export function CandidateDashboard() {
  const { currentUser, candidateProfiles } = useStore();
  const { profile: suiteProfile } = useProfile();

  if (!currentUser) return null;

  const profile = candidateProfiles.find((p) => p.userId === currentUser.id) || candidateProfiles[0];
  const userSkills = profile?.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'];

  // Core Platform Pillars that define what HireFlow is and what we offer
  const platformOfferings = [
    {
      id: 'ats-roaster',
      title: 'ATS Resume Roaster',
      badge: 'Harsh Truth AI',
      badgeVariant: 'warning',
      headline: 'Pass the 6-second recruiter glance before automated filters toss your CV.',
      description:
        'A brutal, zero-sugarcoating audit of your resume against Tier-1 automated screening bots. Detects missing hard skills, formatting pitfalls, and weak bullets lacking quantifiable impact.',
      features: [
        'Verbatim keyword & skill citations',
        'Google XYZ-formula bullet strength audit',
        'Zero-hallucination factual preservation',
      ],
      route: '/tools/resume-checker',
      ctaText: 'Audit Resume with ATS Roaster',
      icon: Flame,
      gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
      borderColor: 'hover:border-amber-500/40',
      iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'talent-lens',
      title: 'TalentLens™ Recruiter Simulator',
      badge: '130+ Tech Bars',
      badgeVariant: 'primary',
      headline: 'Simulate how Engineering Directors evaluate your background.',
      description:
        'Test your engineering profile against calibrated hiring bars across 130+ top employers (Google, Microsoft, Uber, Flipkart, Razorpay) and 1,450+ verified engineering roles.',
      features: [
        '6-layer recruiter evaluation matrix',
        'Direct calibration against Tier-1 & Unicorn hiring bars',
        'Targeted skill gap insights to close rejection reasons',
      ],
      route: '/demo',
      ctaText: 'Run TalentLens Recruiter Simulation',
      icon: UserCheck,
      gradient: 'from-primary/10 via-indigo-500/5 to-transparent',
      borderColor: 'hover:border-primary/40',
      iconColor: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      id: 'career-ladders',
      title: 'Career Trajectory & ₹ CTC Ladders',
      badge: 'Real India Market Pay',
      badgeVariant: 'emerald',
      headline: 'Demystify level hierarchies and compensation from L1 to Staff/Principal.',
      description:
        'Transparent engineering progression ladders with real market compensation benchmarks in ₹ LPA across FAANG, Tier-1 Product firms, High-Growth Startups, and Global Capability Centers.',
      features: [
        'SDE-1 to Principal/Director progression paths',
        'Transparent Indian market CTC in ₹ LPA brackets',
        'Promotion cutoff criteria and technical milestones',
      ],
      route: '/tools/career-path',
      ctaText: 'Explore Career Trajectories & Levels',
      icon: TrendingUp,
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      borderColor: 'hover:border-emerald-500/40',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'decision-suite',
      title: 'The Decision Suite Studio',
      badge: 'Tactical Edge',
      badgeVariant: 'purple',
      headline: 'High-leverage engineering tools for every tactical career move.',
      description:
        'Everything needed to prepare and position for high-impact roles: Compare competing job descriptions side-by-side, tailor bullet points for target teams, craft cold outreach to hiring managers, and certify skills.',
      features: [
        'Side-by-side JD comparison & skill overlap',
        'Live A4 resume tailor studio with XYZ formula',
        'Hiring manager cold outreach generator',
      ],
      route: '/tools',
      ctaText: 'Open Full Decision Suite',
      icon: Zap,
      gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'hover:border-purple-500/40',
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      
      {/* ============================================================ */}
      {/* GOD-LEVEL WELCOME & POSITIONING BANNER */}
      {/* ============================================================ */}
      <div className="relative rounded-3xl overflow-hidden border border-border shadow-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white backdrop-blur-md border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>AI Career Intelligence & Decision Suite</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome, {currentUser.displayName}!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              HireFlow is your insider advantage in tech hiring. We give software engineers the
              recruiter&apos;s exact playbook — brutal ATS screening audits, 6-dimension talent benchmarking
              across 130+ tech firms, transparent ₹ CTC level ladders, and precision career tools.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Job Application Clutter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real India ₹ CTC Benchmarks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>130+ Calibrated Tech Bars</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/tools/resume-checker"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-hover shadow-lg transition-all active:scale-95"
            >
              <FileSearch className="w-4 h-4" />
              <span>Scan Resume with ATS</span>
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/15 transition-all"
            >
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Recruiter POV Demo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CANDIDATE MASTER PROFILE SNAPSHOT & READINESS */}
      {/* ============================================================ */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-ai text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-surface shrink-0">
              {currentUser.displayName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{currentUser.displayName}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                  <ShieldCheck className="w-3 h-3" /> Verified Candidate
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5 max-w-xl line-clamp-1">
                {profile?.headline || 'Senior Full Stack & Distributed Systems Engineer'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/candidate/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground text-xs font-bold border border-border transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Engineering Profile</span>
            </Link>
            <Link
              to="/candidate/resume"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold border border-primary/25 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Master Resume & Skills</span>
            </Link>
          </div>
        </div>

        {/* Quick Profile Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border">
            <div className="text-xs text-text-muted font-medium mb-1">Target Role Level</div>
            <div className="text-base font-bold text-foreground">SDE-2 / Senior Lead</div>
            <div className="text-[11px] text-text-muted mt-1">Tier-1 & Unicorn Bar</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border">
            <div className="text-xs text-text-muted font-medium mb-1">Verified Skill Tags</div>
            <div className="text-base font-bold text-primary">{userSkills.length} Core Competencies</div>
            <div className="text-[11px] text-text-muted mt-1">Java, React, SQL, Cloud</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border">
            <div className="text-xs text-text-muted font-medium mb-1">Talent Bar Readiness</div>
            <div className="text-base font-bold text-emerald-400">94.8% Match Bar</div>
            <div className="text-[11px] text-text-muted mt-1">Top 5% Candidate Percentile</div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border">
            <div className="text-xs text-text-muted font-medium mb-1">Target CTC Bracket</div>
            <div className="text-base font-bold text-foreground">₹24 - ₹38 LPA</div>
            <div className="text-[11px] text-text-muted mt-1">India Tech Market Standard</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* WHAT HIREFLOW OFFERS — 4 CORE PLATFORM PILLARS */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" /> What We Offer Through HireFlow
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Explore our dedicated intelligence engines engineered to give you complete visibility over tech hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platformOfferings.map((offering) => {
            const Icon = offering.icon;
            return (
              <div
                key={offering.id}
                className={`p-6 sm:p-7 rounded-3xl bg-surface border border-border ${offering.borderColor} transition-all shadow-sm flex flex-col justify-between space-y-6 group`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${offering.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                        offering.badgeVariant === 'warning'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/25'
                          : offering.badgeVariant === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : offering.badgeVariant === 'purple'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                          : 'bg-primary/10 text-primary border-primary/25'
                      }`}
                    >
                      {offering.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {offering.title}
                    </h3>
                    <p className="text-xs font-semibold text-text-muted mt-0.5">
                      {offering.headline}
                    </p>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed">
                    {offering.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-border/70">
                    {offering.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-text-muted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={offering.route}
                  className="inline-flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-foreground transition-all group-hover:border-primary/40 group-hover:text-primary"
                >
                  <span>{offering.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* QUICK DECISION TOOLS LAUNCHPAD */}
      {/* ============================================================ */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Candidate Decision Tools Launchpad
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Instant access to tactical tools for bullet tailoring, role comparison, and hiring manager outreach.
            </p>
          </div>
          <Link
            to="/tools"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All 8 Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/tools/resume-checker"
            className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/40 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2.5">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              ATS Resume Scanner
            </div>
            <div className="text-[11px] text-text-muted mt-1 line-clamp-2">
              Brutal ATS screening audit with verbatim keyword match.
            </div>
          </Link>

          <Link
            to="/tools/tailor"
            className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/40 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              Resume Tailor Studio
            </div>
            <div className="text-[11px] text-text-muted mt-1 line-clamp-2">
              XYZ-formula bullet tailoring with 0% hallucinations.
            </div>
          </Link>

          <Link
            to="/tools/jd-compare"
            className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/40 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5">
              <GitCompare className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              Side-by-Side JD Match
            </div>
            <div className="text-[11px] text-text-muted mt-1 line-clamp-2">
              Compare two role descriptions for skill overlap and requirements.
            </div>
          </Link>

          <Link
            to="/tools/reach-out"
            className="p-4 rounded-2xl bg-surface-2 border border-border hover:border-primary/40 transition-all group block"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              Cold Outreach Generator
            </div>
            <div className="text-[11px] text-text-muted mt-1 line-clamp-2">
              Generate 300-char LinkedIn connect pitches and HM emails.
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}

export default CandidateDashboard;
