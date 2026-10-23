// ============================================================
// HireFlow — Home / Landing Page (High-Contrast Dark System)
// Strictly adhering to DESIGN.md and Project Specifications
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
  CheckCircle2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { PublicNavbar } from '../components/common/PublicNavbar';
import { careers } from '../careers-core';

const platformStats = careers.stats.counts();
const TOTAL_COMPANIES = platformStats.companies;
const TOTAL_ROLES = platformStats.roles;
const TOTAL_FRESHER_PROGRAMS = platformStats.fresherPrograms;
const TOP_COMPANIES = careers.companies.list().slice(0, 20);

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-volt selection:text-black">
      <PublicNavbar />

      {/* ── Marketing Hero Section (§3, §4) ── */}
      <section className="relative pt-[120px] pb-[72px] sm:pt-[140px] sm:pb-[96px] bg-black">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-[960px] mx-auto flex flex-col items-center">
            
            {/* Uppercase Section Overline */}
            <p className="text-[13px] sm:text-[14px] font-semibold text-silver uppercase tracking-[1.4px] mb-6 select-none">
              Candidate Career Decision Suite
            </p>

            {/* Display Mega Headline (§3: Inter 900, 96px responsive collapse) */}
            <h1 className="text-[40px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-black text-white leading-[1.0] tracking-tight mb-8">
              TAKE CONTROL OF YOUR <span className="text-volt">CAREER.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[16px] sm:text-[18px] md:text-[20px] text-silver leading-relaxed mb-10 max-w-[680px] mx-auto font-normal">
              Simulate ATS resume filters, map your career trajectory, and test your profile against{' '}
              <strong className="text-white font-bold">{TOTAL_COMPANIES}+</strong> verified employers and{' '}
              <strong className="text-white font-bold">{TOTAL_ROLES.toLocaleString()}+</strong> calibrated roles across active recruiters — all completely free.
            </p>

            {/* Hero CTAs: Exactly ONE Neon Primary + ONE Ghost button (§4, Stage 4) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link to="/demo" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[48px] px-8 rounded text-[14px] font-bold uppercase tracking-[1.2px] text-text-on-accent bg-volt hover:bg-[#1d1d1d] hover:text-white border border-volt transition-colors active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt cursor-pointer select-none"
                >
                  <span>LAUNCH SIMULATOR</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
                </button>
              </Link>
              <Link to="/tools" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[48px] px-8 rounded text-[14px] font-semibold uppercase tracking-[1.2px] text-white bg-transparent hover:bg-near-black border border-olive-border hover:border-volt/60 transition-colors active:text-pale-yellow active:shadow-inset focus-visible:outline-2 focus-visible:outline-volt cursor-pointer select-none"
                >
                  <span>EXPLORE DECISION SUITE</span>
                </button>
              </Link>
            </div>
          </div>

          {/* ── Real Computed Performance Stats Bar (§4: Oversized numbers 72px+) ── */}
          <div className="mt-16 sm:mt-24 max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 sm:p-8 rounded-lg bg-near-black border border-charcoal">
              <div className="text-left p-4">
                <div className="text-[48px] sm:text-[64px] lg:text-[72px] font-black text-white leading-none tracking-tight font-sans">
                  {TOTAL_COMPANIES}<span className="text-volt">+</span>
                </div>
                <p className="text-[13px] font-semibold uppercase tracking-[1.4px] text-silver mt-2">
                  Verified Employers
                </p>
                <p className="text-[13px] text-silver/70 mt-1">
                  FAANG, Unicorns, GCCs, and Tier-1 engineering teams.
                </p>
              </div>

              <div className="text-left p-4 border-t sm:border-t-0 sm:border-l border-charcoal">
                <div className="text-[48px] sm:text-[64px] lg:text-[72px] font-black text-white leading-none tracking-tight font-sans">
                  {TOTAL_ROLES.toLocaleString()}<span className="text-volt">+</span>
                </div>
                <p className="text-[13px] font-semibold uppercase tracking-[1.4px] text-silver mt-2">
                  Calibrated Roles
                </p>
                <p className="text-[13px] text-silver/70 mt-1">
                  Multi-pillar competency mappings with exact CTC bands.
                </p>
              </div>

              <div className="text-left p-4 border-t lg:border-t-0 lg:border-l border-charcoal">
                <div className="text-[48px] sm:text-[64px] lg:text-[72px] font-black text-white leading-none tracking-tight font-sans">
                  102
                </div>
                <p className="text-[13px] font-semibold uppercase tracking-[1.4px] text-silver mt-2">
                  Verified Credentials
                </p>
                <p className="text-[13px] text-silver/70 mt-1">
                  Hackathons, certifications, and high-impact open source.
                </p>
              </div>

              <div className="text-left p-4 border-t sm:border-t-0 sm:border-l border-charcoal">
                <div className="text-[48px] sm:text-[64px] lg:text-[72px] font-black text-volt leading-none tracking-tight font-sans">
                  0%
                </div>
                <p className="text-[13px] font-semibold uppercase tracking-[1.4px] text-silver mt-2">
                  Data Egress
                </p>
                <p className="text-[13px] text-silver/70 mt-1">
                  100% local browser execution. Zero telemetry or CDN leaks.
                </p>
              </div>
            </div>
          </div>

          {/* Calibrated Employers Strip */}
          <div className="mt-14 max-w-[1280px] mx-auto text-left">
            <p className="text-[12px] font-semibold text-silver uppercase tracking-[1.4px] mb-4">
              Calibrated Across Active Employer Standards
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {TOP_COMPANIES.map((company) => (
                <Link
                  key={company.id}
                  to={`/demo/company/${company.id}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-near-black border border-charcoal text-[12px] font-semibold uppercase tracking-[1px] text-white hover:text-volt hover:border-volt/60 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-volt" />
                  <span>{company.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Decision Suite Core Tools Section ── */}
      <section className="py-16 sm:py-24 border-t border-charcoal bg-black">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-left">
            <p className="text-[13px] font-semibold text-silver uppercase tracking-[1.4px] mb-2">
              Core Capabilities
            </p>
            <h2 className="text-[32px] sm:text-[44px] font-black text-white tracking-tight uppercase">
              Engineered For Radical Transparency
            </h2>
            <p className="text-[16px] text-silver mt-2 max-w-2xl">
              Reverse-engineered enterprise ATS parsers, recruiter evaluation models, and India market ladders.
            </p>
          </div>

          {/* Tool Cards Grid (§4: 8px radius, charcoal border, hover elevated, featured card with volt border) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tool 1: Featured Card with Neon Border */}
            <Link
              to="/demo"
              className="group rounded-lg bg-near-black border border-volt p-8 shadow-level-5 flex flex-col justify-between hover:border-volt transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded bg-black border border-charcoal flex items-center justify-center text-volt">
                    <Brain className="w-6 h-6 stroke-[1.5px]" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[1.4px] px-2.5 py-1 rounded bg-black text-volt border border-volt">
                    Featured • Simulator
                  </span>
                </div>

                <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight group-hover:text-volt transition-colors">
                  TalentLens™ Simulator
                </h3>

                <p className="text-[14px] text-silver leading-relaxed mb-6">
                  Experience how corporate talent teams and enterprise algorithms score your candidate profile across multi-pillar benchmarks.
                </p>

                <ul className="space-y-2.5 mb-8">
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>6-layer semantic evaluation matrix</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>Real-time verbatim citation breakdown</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>Direct role-by-role eligibility checks</span>
                  </li>
                </ul>
              </div>

              <div className="w-full py-3 px-4 rounded bg-volt text-text-on-accent text-[13px] font-bold uppercase tracking-[1.2px] flex items-center justify-between group-hover:bg-[#1d1d1d] group-hover:text-white transition-colors">
                <span>Launch Simulator</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
              </div>
            </Link>

            {/* Tool 2: ATS Resume Roaster */}
            <Link
              to="/tools/resume-checker"
              className="group rounded-lg bg-near-black border border-charcoal p-8 hover:border-volt/60 hover:shadow-level-3 flex flex-col justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded bg-black border border-charcoal flex items-center justify-center text-volt">
                    <Flame className="w-6 h-6 stroke-[1.5px]" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[1.4px] px-2.5 py-1 rounded bg-black text-silver border border-charcoal">
                    Invariant Audit
                  </span>
                </div>

                <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight group-hover:text-volt transition-colors">
                  ATS Resume Roaster
                </h3>

                <p className="text-[14px] text-silver leading-relaxed mb-6">
                  Harsh, invariant-based ATS auditor. Uncovers fatal parse traps, missing hard skills, and ambiguous bullet points.
                </p>

                <ul className="space-y-2.5 mb-8">
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>Simulates raw parser text streams</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>Exact citations with score deduction log</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>No generic praise: only verifiable flaws</span>
                  </li>
                </ul>
              </div>

              <div className="w-full py-3 px-4 rounded bg-near-black border border-charcoal text-white text-[13px] font-semibold uppercase tracking-[1.2px] flex items-center justify-between group-hover:border-volt group-hover:text-volt transition-colors">
                <span>Roast My Resume</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
              </div>
            </Link>

            {/* Tool 3: Career Trajectory Hub */}
            <Link
              to="/tools/career-path"
              className="group rounded-lg bg-near-black border border-charcoal p-8 hover:border-volt/60 hover:shadow-level-3 flex flex-col justify-between transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="w-12 h-12 rounded bg-black border border-charcoal flex items-center justify-center text-volt">
                    <Target className="w-6 h-6 stroke-[1.5px]" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[1.4px] px-2.5 py-1 rounded bg-black text-silver border border-charcoal">
                    Market Ladders
                  </span>
                </div>

                <h3 className="text-[22px] font-bold text-white mb-3 tracking-tight group-hover:text-volt transition-colors">
                  Career Trajectory
                </h3>

                <p className="text-[14px] text-silver leading-relaxed mb-6">
                  India tech market ladders, cross-company level mapping (FAANG to GCCs), and verifiable CTC bands in INR.
                </p>

                <ul className="space-y-2.5 mb-8">
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>Target job roadmap generator</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>Real campus CTC bands & cutoffs</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-[14px] text-silver">
                    <CheckCircle2 className="w-4 h-4 text-volt mt-0.5 shrink-0 stroke-[1.5px]" />
                    <span>Promotion benchmarks & week-by-week plans</span>
                  </li>
                </ul>
              </div>

              <div className="w-full py-3 px-4 rounded bg-near-black border border-charcoal text-white text-[13px] font-semibold uppercase tracking-[1.2px] flex items-center justify-between group-hover:border-volt group-hover:text-volt transition-colors">
                <span>Explore Trajectories</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Conversion Section: Forest Action Button ── */}
      <section className="py-20 border-t border-charcoal bg-black">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[13px] font-semibold text-silver uppercase tracking-[1.4px] mb-3">
            Open & Free For Candidates
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
                className="inline-flex items-center gap-2.5 h-[48px] px-8 rounded bg-forest text-white border border-[#141414] hover:bg-hover-gray hover:text-white/90 text-[14px] font-semibold uppercase tracking-[1.2px] active:text-pale-yellow active:shadow-inset transition-colors cursor-pointer select-none"
              >
                <span>GET STARTED WITH TOOLS HUB</span>
                <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Minimal Footer (§3: Charcoal Top Border, Pure Black) ── */}
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
