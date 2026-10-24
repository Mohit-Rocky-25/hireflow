// ============================================================
// HireFlow — Home / Landing Page (High-Contrast Dark System)
// Complete original copy and sections with pure dark styling
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Target,
  Zap,
  Building2,
  Briefcase,
  GraduationCap,
  Flame,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { careers } from '../careers-core';
import { CompanyLogo } from '../components/common/CompanyLogo';

const platformStats = careers.stats.counts();
const TOTAL_COMPANIES = platformStats.companies;
const TOTAL_ROLES = platformStats.roles;
const TOTAL_FRESHER_PROGRAMS = platformStats.fresherPrograms;
const TOP_COMPANIES = careers.companies.list().slice(0, 24);

const FEATURES = [
  {
    icon: Brain,
    title: 'Harsh Truth AI',
    desc: "We don't sugarcoat. Our AI acts like a ruthless recruiter, tearing apart your resume to tell you exactly why you'd be rejected.",
    iconColor: 'text-volt',
    iconBg: 'bg-near-black border-charcoal',
  },
  {
    icon: Target,
    title: 'Trajectory Mapping',
    desc: 'Stop guessing your next move. Input your dream job and we generate a year-by-year syllabus of skills you need to learn.',
    iconColor: 'text-volt',
    iconBg: 'bg-near-black border-charcoal',
  },
  {
    icon: Zap,
    title: 'Instant ATS Simulation',
    desc: 'Drop in any Job Description and your Resume. We instantly simulate an enterprise ATS scan to give you a match score.',
    iconColor: 'text-volt',
    iconBg: 'bg-near-black border-charcoal',
  },
];

const TOOLS = [
  {
    icon: Brain,
    title: 'TalentLens™ Simulator',
    badge: `${TOTAL_COMPANIES}+ Employers & Recruiters · 6-Layer AI`,
    badgeStyle: 'bg-black text-silver border-charcoal group-hover:border-volt/60 group-hover:text-volt',
    iconBoxStyle: 'bg-black border-charcoal text-volt',
    cardHoverStyle: 'hover:border-volt/60 hover:shadow-level-3',
    points: [
      'Experience our proprietary B2B AI matching engine',
      'See how recruiters evaluate your profile behind the scenes',
      'Understand semantic gap analysis & evidence extraction',
    ],
    cta: 'Launch Simulator',
    link: '/demo',
  },
  {
    icon: Flame,
    title: 'ATS Resume Roaster',
    badge: 'Hot · Invariant Audit',
    badgeStyle: 'bg-black text-silver border-charcoal group-hover:border-volt/60 group-hover:text-volt',
    iconBoxStyle: 'bg-black border-charcoal text-volt',
    cardHoverStyle: 'hover:border-volt/60 hover:shadow-level-3',
    points: [
      'Simulate exactly what ATS filters see',
      'Get a harsh match score for any Job Description',
      'Identify missing hard skills & red flags instantly',
    ],
    cta: 'Roast My Resume',
    link: '/tools/resume-checker',
  },
  {
    icon: Target,
    title: 'Career Trajectory',
    badge: '₹ CTC · Level Ladders',
    badgeStyle: 'bg-black text-silver border-charcoal group-hover:border-volt/60 group-hover:text-volt',
    iconBoxStyle: 'bg-black border-charcoal text-volt',
    cardHoverStyle: 'hover:border-volt/60 hover:shadow-level-3',
    points: [
      'Plan your path from campus to dream companies',
      'Real eligibility rules, cutoffs & fresher CTC in INR',
      'Step-by-step offer routes, timeline & action guide',
    ],
    cta: 'Plan My Trajectory',
    link: '/tools/career-path',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-volt selection:text-black">
      <PublicNavbar />

      {/* ── 1. Marketing Hero Section ── */}
      <section className="relative pt-[120px] pb-[72px] sm:pt-[140px] sm:pb-[96px] bg-black">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-[960px] mx-auto flex flex-col items-center">
            
            {/* Uppercase Section Overline */}
            <p className="text-[13px] sm:text-[14px] font-semibold text-silver uppercase tracking-[1.4px] mb-6 select-none">
              Candidate Career Decision Suite
            </p>

            {/* Display Mega Headline */}
            <h1 className="text-[40px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-black text-white leading-[1.0] tracking-tight mb-8">
              TAKE CONTROL OF YOUR <span className="text-volt">CAREER.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[16px] sm:text-[18px] md:text-[20px] text-silver leading-relaxed mb-10 max-w-[680px] mx-auto font-normal">
              Simulate ATS resume filters, map your career trajectory, and test your resume against{' '}
              <strong className="text-white font-bold">{TOTAL_COMPANIES}+</strong> verified employers and{' '}
              <strong className="text-white font-bold">{TOTAL_ROLES.toLocaleString()}+</strong> calibrated roles across active recruiters — all completely free.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link to="/demo" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[48px] px-8 rounded text-[14px] font-bold uppercase tracking-[1.2px] !text-black bg-volt hover:bg-[#1d1d1d] hover:!text-white border border-volt transition-colors active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt cursor-pointer select-none"
                >
                  <span className="!text-black group-hover:!text-white font-black">TRY TALENTLENS™</span>
                  <ArrowRight className="w-4 h-4 stroke-[2px] !text-black group-hover:!text-white" />
                </button>
              </Link>
              <Link to="/tools/resume-checker" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[48px] px-8 rounded text-[14px] font-semibold uppercase tracking-[1.2px] text-white bg-transparent hover:bg-near-black border border-charcoal hover:border-volt/60 transition-colors active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt cursor-pointer select-none"
                >
                  <span>ATS ROASTER</span>
                </button>
              </Link>
              <Link to="/tools" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[48px] px-8 rounded text-[14px] font-semibold uppercase tracking-[1.2px] text-white bg-transparent hover:bg-near-black border border-charcoal hover:border-volt/60 transition-colors active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt cursor-pointer select-none"
                >
                  <span>DECISION SUITE</span>
                  <ChevronRight className="w-4 h-4 stroke-[1.5px]" />
                </button>
              </Link>
            </div>
          </div>

          {/* ── 2. Stats Bento Grid ── */}
          <div className="mt-16 sm:mt-24 max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              
              {/* Card 1: Employers (Wide 2-col) */}
              <div className="md:col-span-2 relative rounded-2xl bg-near-black border border-charcoal p-8 sm:p-10 overflow-hidden group hover:border-volt/40 transition-all duration-300">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-14 h-14 rounded-xl bg-black border border-charcoal flex items-center justify-center text-volt mb-6 group-hover:border-volt/40 transition-colors">
                    <Building2 className="w-7 h-7 stroke-[1.5px]" />
                  </div>
                  <div>
                    <div className="text-[52px] sm:text-[64px] font-black text-white tracking-tight leading-none mb-3">
                      {TOTAL_COMPANIES}<span className="text-volt">+</span>
                    </div>
                    <p className="text-[18px] sm:text-[20px] font-bold text-white mb-2 tracking-tight">
                      Top Employers &amp; Recruiters
                    </p>
                    <p className="text-[14px] sm:text-[15px] text-silver leading-relaxed">
                      FAANG, Unicorns, Cybersecurity, GCCs, and Indian Tech Giants verified.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Roles */}
              <div className="relative rounded-2xl bg-near-black border border-charcoal p-8 sm:p-10 overflow-hidden group hover:border-volt/40 transition-all duration-300">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-14 h-14 rounded-xl bg-black border border-charcoal flex items-center justify-center text-volt mb-6 group-hover:border-volt/40 transition-colors">
                    <Briefcase className="w-7 h-7 stroke-[1.5px]" />
                  </div>
                  <div>
                    <div className="text-[52px] sm:text-[64px] font-black text-white tracking-tight leading-none mb-3">
                      {TOTAL_ROLES.toLocaleString()}<span className="text-volt">+</span>
                    </div>
                    <p className="text-[18px] sm:text-[20px] font-bold text-white mb-2 tracking-tight">
                      Calibrated Roles
                    </p>
                    <p className="text-[14px] sm:text-[15px] text-silver leading-relaxed">
                      Deep 6-layer competency mapping across all companies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Deep ATS Audit */}
              <div className="relative rounded-2xl bg-near-black border border-charcoal p-8 sm:p-10 overflow-hidden group hover:border-volt/40 transition-all duration-300">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-14 h-14 rounded-xl bg-black border border-charcoal flex items-center justify-center text-volt mb-6 group-hover:border-volt/40 transition-colors">
                    <Zap className="w-7 h-7 stroke-[1.5px]" />
                  </div>
                  <div>
                    <div className="text-[52px] sm:text-[64px] font-black text-white tracking-tight leading-none mb-3">
                      6-Layer
                    </div>
                    <p className="text-[18px] sm:text-[20px] font-bold text-white mb-2 tracking-tight">
                      Deep ATS Audit
                    </p>
                    <p className="text-[14px] sm:text-[15px] text-silver leading-relaxed">
                      Harsh citations, invariant scoring &amp; exact gap fixes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Campus Intelligence (Wide 2-col) */}
              <div className="md:col-span-2 relative rounded-2xl bg-near-black border border-charcoal p-8 sm:p-10 overflow-hidden group hover:border-volt/40 transition-all duration-300">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-14 h-14 rounded-xl bg-black border border-charcoal flex items-center justify-center text-volt mb-6 group-hover:border-volt/40 transition-colors">
                    <GraduationCap className="w-7 h-7 stroke-[1.5px]" />
                  </div>
                  <div>
                    <div className="text-[52px] sm:text-[64px] font-black text-white tracking-tight leading-none mb-3">
                      &apos;26-27
                    </div>
                    <p className="text-[18px] sm:text-[20px] font-bold text-white mb-2 tracking-tight">
                      Campus Intelligence
                    </p>
                    <p className="text-[14px] sm:text-[15px] text-silver leading-relaxed">
                      {TOTAL_FRESHER_PROGRAMS}+ verified fresher programs, actual CTC bands &amp; eligibility rules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calibrated Employers Strip with Authentic Vector Logos */}
          <div className="mt-14 max-w-[1280px] mx-auto text-left">
            <p className="text-[12px] font-semibold text-silver uppercase tracking-[1.4px] mb-4">
              Calibrated Across {TOTAL_COMPANIES}+ Verified Employers &amp; Recruiters
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {TOP_COMPANIES.map((company) => (
                <Link
                  key={company.id}
                  to={`/demo/company/${company.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-near-black border border-charcoal text-[12px] font-semibold uppercase tracking-[1px] text-white hover:text-volt hover:border-volt/60 transition-colors group"
                >
                  <CompanyLogo company={company} size="xs" showBorder={false} interactive={false} />
                  <span>{company.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Core Features Section ── */}
      <section id="features" className="py-20 sm:py-24 border-t border-charcoal bg-black relative">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <p className="text-[12px] font-bold text-volt uppercase tracking-[1.4px] mb-3">
              Core Features
            </p>
            <h2 className="text-[32px] sm:text-[44px] font-black text-white tracking-tight uppercase mb-3">
              Built for the modern candidate
            </h2>
            <p className="text-[16px] text-silver leading-relaxed">
              We reverse-engineered enterprise ATS systems so you can finally beat them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1240px] mx-auto">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl bg-near-black border border-charcoal p-8 hover:border-volt/60 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-black border border-charcoal text-volt flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-volt/40 transition-all">
                    <Icon className="w-6 h-6 stroke-[1.5px]" />
                  </div>
                  <h3 className="text-[20px] font-bold text-white mb-2.5 tracking-tight group-hover:text-volt transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-silver leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. The AI Showcase: "Know exactly why you're getting rejected" ── */}
      <section className="py-20 sm:py-28 border-t border-charcoal bg-black relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Narrative Column */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-near-black border border-charcoal rounded-full text-[12px] font-bold text-volt uppercase tracking-[1.2px] mb-6">
              <Sparkles className="w-3.5 h-3.5 stroke-[2px]" /> Harsh Truth AI
            </div>
            
            <h2 className="text-[36px] sm:text-[46px] md:text-[50px] font-black text-white tracking-tight leading-[1.05] uppercase mb-6">
              Know exactly <span className="text-volt">why</span> you&apos;re getting rejected.
            </h2>
            
            <p className="text-[16px] sm:text-[17px] text-silver leading-relaxed mb-8 max-w-xl">
              Stop firing your resume into the void. Our scanner evaluates your profile with industry-leading precision, instantly flagging missing hard skills, overused buzzwords, and formatting errors before you apply.
            </p>
            
            <ul className="space-y-4 text-[14px] sm:text-[15px] text-white font-medium">
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2 className="w-5 h-5 text-volt shrink-0 stroke-[1.8px]" />
                <span>Enterprise ATS simulation</span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2 className="w-5 h-5 text-volt shrink-0 stroke-[1.8px]" />
                <span>Identifies semantic keyword gaps</span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2 className="w-5 h-5 text-volt shrink-0 stroke-[1.8px]" />
                <span>No-BS actionable feedback</span>
              </li>
            </ul>
          </div>
          
          {/* Right Live ATS Match Report Mockup Card */}
          <div className="flex-1 w-full max-w-[580px]">
            <div className="bg-near-black border border-charcoal rounded-2xl shadow-level-3 overflow-hidden">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-charcoal bg-black flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-mono uppercase text-silver tracking-wider">ATS Match Report</p>
                  <h3 className="text-[15px] font-bold text-white">Target: Senior Frontend Engineer</h3>
                </div>
                <span className="px-3 py-1 bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-bold rounded-full uppercase">
                  Score: 42%
                </span>
              </div>

              {/* Body Errors List */}
              <div className="p-6 space-y-4">
                
                {/* Error 1: Missing Critical Skill */}
                <div className="border border-charcoal rounded-xl p-4 bg-black space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-[14px] font-bold text-white font-mono">Missing Skill: Webpack/Vite</span>
                    </div>
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                      Critical
                    </span>
                  </div>
                  <div className="bg-near-black rounded-lg p-3 border border-charcoal">
                    <p className="text-[12px] font-bold text-rose-300 mb-1">
                      Critical Must-Have Gap Identified
                    </p>
                    <p className="text-[13px] text-silver leading-relaxed">
                      The job description highlights Webpack 5 times as a core requirement, but no bundler evidence was found in your resume. Recruiters skimming applications will likely notice this gap immediately.
                    </p>
                  </div>
                </div>

                {/* Error 2: Impact Metrics */}
                <div className="border border-charcoal rounded-xl p-4 bg-black space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-[14px] font-bold text-white font-mono">Impact Metrics</span>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                      Needs Work
                    </span>
                  </div>
                  <div className="bg-near-black rounded-lg p-3 border border-charcoal">
                    <p className="text-[13px] text-silver leading-relaxed">
                      &ldquo;Responsible for building components&rdquo; is a weak bullet point. Change this to <span className="text-white font-semibold">&ldquo;Built 15+ reusable components, reducing development time by 30%&rdquo;</span>. Give us the data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Free Tools Cards (Symmetrical 3-Column Grid) ── */}
      <section className="py-20 sm:py-24 border-t border-charcoal bg-black">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-[12px] font-bold text-volt uppercase tracking-[1.4px] mb-3">
              Free Tools
            </p>
            <h2 className="text-[32px] sm:text-[44px] font-black text-white tracking-tight uppercase mb-3">
              Accelerate your career.
            </h2>
            <p className="text-[16px] text-silver leading-relaxed">
              Everything you need to land your next big role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1240px] mx-auto">
            {TOOLS.map((role, i) => {
              const Icon = role.icon;
              return (
                <Link
                  key={i}
                  to={role.link}
                  className={`group relative rounded-2xl bg-near-black border border-charcoal p-8 sm:p-9 flex flex-col justify-between transition-all duration-200 cursor-pointer ${role.cardHoverStyle}`}
                >
                  <div>
                    {/* Top row: Icon and Badge */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-black border border-charcoal flex items-center justify-center text-volt">
                        <Icon className="w-6 h-6 stroke-[1.5px]" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[1.2px] px-2.5 py-1 rounded bg-black text-silver border border-charcoal">
                        {role.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight group-hover:text-volt transition-colors">
                      {role.title}
                    </h3>

                    {/* Points list */}
                    <ul className="space-y-3 mb-8">
                      {role.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-[14px] text-silver leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interactive Button */}
                  <div className="w-full py-3 px-4 rounded bg-near-black border border-charcoal text-white text-[13px] font-semibold uppercase tracking-[1.2px] flex items-center justify-between group-hover:border-volt group-hover:text-volt transition-colors">
                    <span>{role.cta}</span>
                    <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Conversion Section ── */}
      <section className="py-20 border-t border-charcoal bg-black">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[13px] font-semibold text-silver uppercase tracking-[1.4px] mb-3">
            Open &amp; Free For Candidates
          </p>
          <h2 className="text-[36px] sm:text-[48px] font-black text-white uppercase tracking-tight mb-4">
            Zero Black Box. Zero Gatekeeping.
          </h2>
          <p className="text-[16px] text-silver max-w-xl mx-auto mb-8 leading-relaxed">
            Every score, formula, and invariant audit rule is publicly transparent. No accounts or credit cards required.
          </p>
          <div className="flex justify-center">
            <Link to="/tools">
              <button
                type="button"
                className="group inline-flex items-center gap-2.5 h-[48px] px-8 rounded bg-volt !text-black border border-volt hover:bg-[#1d1d1d] hover:!text-white text-[14px] font-bold uppercase tracking-[1.2px] transition-colors cursor-pointer select-none"
              >
                <span className="!text-black group-hover:!text-white font-black">GET STARTED WITH TOOLS HUB</span>
                <ArrowRight className="w-4 h-4 stroke-[2px] !text-black group-hover:!text-white" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. Minimal Footer ── */}
      <footer className="py-12 border-t border-charcoal bg-black">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 select-none">
              <div className="w-7 h-7 rounded bg-near-black border border-charcoal flex items-center justify-center text-volt font-black text-xs">
                H
              </div>
              <span className="text-[18px] font-black text-white tracking-tight font-sans">
                HIRE<span className="text-volt">FLOW</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-6 text-[13px] font-semibold uppercase tracking-[1.2px] text-silver">
              <Link to="/tools" className="text-silver hover:text-volt transition-colors">Tools Hub</Link>
              <Link to="/methodology" className="text-silver hover:text-volt transition-colors">Methodology</Link>
              <Link to="/data" className="text-silver hover:text-volt transition-colors">Your Data</Link>
              <Link to="/demo" className="text-silver hover:text-volt transition-colors">TalentLens</Link>
            </div>

            <p className="text-[13px] text-silver/60">
              © 2026 HireFlow. Client-side career intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
