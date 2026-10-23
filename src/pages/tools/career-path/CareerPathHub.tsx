// ============================================================
// Career Trajectory Hub — India Market Landing Page
// Large headline, IntersectionObserver scroll animations, tool showcases
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import {
  Compass,
  Building2,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ShieldCheck,
  Zap,
  Layers,
  Award,
  Sparkles,
  Target,
} from 'lucide-react';
import { CareerPathBackButton } from '../../../components/career-path/CareerPathBackButton';
import { useProfile } from '../../../features/suite/profile/ProfileContext';
import { getCandidateTierStatus } from '../../../features/suite/integration/trajectory';

export function CareerPathHub() {
  const { profile, hasProfile } = useProfile();
  const tierStatus = getCandidateTierStatus(profile);
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  if (tabParam === 'explorer' || tabParam === 'company-levels' || tabParam === 'company-ladder') {
    return <Navigate to="/tools/career-path/company-levels" replace />;
  }
  if (tabParam === 'simulator' || tabParam === 'dream-job-roadmap' || tabParam === 'promotion-simulator') {
    return <Navigate to="/tools/career-path/dream-job-roadmap" replace />;
  }

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const [section1Visible, setSection1Visible] = useState(false);
  const [section2Visible, setSection2Visible] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setSection1Visible(true);
      setSection2Visible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === section1Ref.current && entry.isIntersecting) {
            setSection1Visible(true);
          }
          if (entry.target === section2Ref.current && entry.isIntersecting) {
            setSection2Visible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (section1Ref.current) observer.observe(section1Ref.current);
    if (section2Ref.current) observer.observe(section2Ref.current);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const scrollToSection = () => {
    section1Ref.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-volt selection:text-black">
      {/* Pinned Top Navigation */}
      <CareerPathBackButton isHub={true} />

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 lg:py-28 overflow-hidden">
        <div className="relative max-w-5xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-near-black border border-charcoal text-silver text-xs font-bold tracking-wide uppercase mb-6">
            <Zap className="w-3.5 h-3.5 text-volt" />
            <span>India Market • INR (₹) Career Intelligence</span>
          </div>

          {/* Very Large Heading (Marketing Display scale) */}
          <h1 className="font-black tracking-tight text-white leading-tight max-w-4xl text-4xl sm:text-6xl lg:text-7xl">
            Career Trajectory
          </h1>

          {/* One-line subheading */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-silver max-w-3xl font-normal leading-relaxed">
            Plan your path from campus to your dream company: real eligibility rules, fresher CTC in INR, and the exact steps to get there.
          </p>

          {/* Quick Action Navigation Buttons: exactly ONE Neon Primary, ONE Ghost */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/tools/career-path/dream-job-roadmap"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded bg-volt text-[#151515] hover:bg-[#1d1d1d] hover:text-white font-black text-sm border border-volt transition-colors min-h-[44px]"
            >
              <Compass className="w-4 h-4" />
              <span>Build my roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/tools/career-path/company-levels"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded bg-black hover:bg-near-black text-white font-bold text-sm border border-olive-border transition-colors min-h-[44px]"
            >
              <Building2 className="w-4 h-4 text-silver" />
              <span>Company Levels &amp; Pay</span>
            </Link>
          </div>

          {/* Subtle Scroll Cue */}
          <button
            type="button"
            onClick={scrollToSection}
            className="mt-16 sm:mt-20 inline-flex flex-col items-center gap-2 text-xs font-bold text-silver hover:text-volt transition-colors rounded p-2 cursor-pointer"
            aria-label="Scroll down to tool showcases"
          >
            <span>Explore the Tools</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Candidate Market Tier Positioning Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
        <div className="rounded-lg bg-near-black border border-charcoal p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-charcoal">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-black border border-charcoal flex items-center justify-center text-volt shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Your Market Tier Positioning</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-volt border border-charcoal">
                    {tierStatus.currentTier}
                  </span>
                </div>
                <p className="text-xs text-silver mt-0.5">
                  {tierStatus.summaryStatement}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
              <Link
                to="/tools/build-briefs"
                className="px-3.5 py-1.5 rounded bg-black hover:bg-hover-gray text-white hover:text-volt text-xs font-bold border border-charcoal transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-volt" />
                Bridge Gaps
              </Link>
              <Link
                to="/tools/resume-checker"
                className="px-3.5 py-1.5 rounded bg-black hover:bg-hover-gray text-silver hover:text-white text-xs font-bold border border-charcoal transition-colors"
              >
                Check Resume
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-silver">Target Promotion Bar:</span>
              <p className="text-xs font-bold text-white">{tierStatus.nextTierDisplayName}</p>
              <div className="w-full h-1 bg-black rounded-full overflow-hidden border border-charcoal mt-1.5">
                <div
                  className="h-full bg-volt rounded-full"
                  style={{ width: `${tierStatus.readinessScore}%` }}
                />
              </div>
              <p className="text-[10px] text-silver text-right">{tierStatus.readinessScore}% ready</p>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <span className="text-[11px] font-medium text-silver">Critical Tier Bridge Gaps:</span>
              <div className="flex flex-wrap gap-1.5">
                {tierStatus.tierGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-black border border-olive-border text-pale-yellow text-[11px] font-medium flex items-center gap-1"
                  >
                    • {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Showcase Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 space-y-20">
        {/* Tool 1 Showcase: Dream Job Roadmap */}
        <section
          ref={section1Ref}
          className={`transition-all duration-300 ease-out ${
            section1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          aria-labelledby="roadmap-heading"
        >
          <div className="rounded-lg bg-near-black border border-charcoal p-8 sm:p-12 lg:p-16 hover:border-silver transition-colors">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black text-volt font-bold text-xs mb-5 border border-charcoal">
                <Compass className="w-4 h-4 text-volt" />
                <span>Tool 1 • For students &amp; freshers</span>
              </div>

              <h2
                id="roadmap-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
              >
                Dream Job Roadmap
              </h2>

              <p className="mt-4 text-base sm:text-lg text-silver font-normal leading-relaxed">
                Step-by-step career path planning with dual modes: built for college students targeting dream fresher jobs and working engineers planning career growth.
              </p>

              {/* Preview Chips */}
              <div className="mt-8 flex flex-wrap gap-2.5">
                {[
                  'Fresher CTC in INR (LPA)',
                  'Tier 1/2/3 Campus Eligibility',
                  'Post-Graduation Calendar Timeline',
                  'Cross-Company Lateral Jumps',
                  'Ranked Entry Routes (PPO, NQT, GRiD)',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center px-3.5 py-1.5 rounded text-xs font-bold bg-black text-silver border border-charcoal"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* Modes highlight */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-charcoal">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-black border border-charcoal text-volt mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Student Mode</h4>
                    <p className="text-xs text-silver mt-0.5">
                      Degree, branch family, college tier, CGPA cutoffs &amp; stepping stone offers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-black border border-charcoal text-white mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Professional Mode</h4>
                    <p className="text-xs text-silver mt-0.5">
                      Current tenure, rating calibration, expected growth windows &amp; CTC jumps.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10">
                <Link
                  to="/tools/career-path/dream-job-roadmap"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-forest hover:bg-[#3a3a3a] text-white hover:text-pale-yellow font-bold text-sm border border-[#141414] transition-colors min-h-[44px]"
                >
                  <span>Build my roadmap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tool 2 Showcase: Company Levels & Pay */}
        <section
          ref={section2Ref}
          className={`transition-all duration-300 ease-out ${
            section2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          aria-labelledby="ladder-heading"
        >
          <div className="rounded-lg bg-near-black border border-charcoal p-8 sm:p-12 lg:p-16 hover:border-silver transition-colors">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black text-silver font-bold text-xs mb-5 border border-charcoal">
                <Building2 className="w-4 h-4 text-silver" />
                <span>Tool 2 • Verified company levels &amp; pay</span>
              </div>

              <h2
                id="ladder-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight"
              >
                Company Levels &amp; Pay
              </h2>

              <p className="mt-4 text-base sm:text-lg text-silver font-normal leading-relaxed">
                Explore real India-office leveling frameworks, verified INR CTC packages, and authentic promotion expectations across 52 tech organizations.
              </p>

              {/* Preview Chips */}
              <div className="mt-8 flex flex-wrap gap-2.5">
                {[
                  '52 India Tech Companies',
                  'Median, P25 & P75 INR CTC',
                  'Fixed Base + Variable + Equity Splits',
                  '6+ Structured Criteria per Level',
                  'Verified Source Links & Verification Dates',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center px-3.5 py-1.5 rounded text-xs font-bold bg-black text-silver border border-charcoal"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* Segments highlight */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-charcoal text-xs">
                <div className="p-3 rounded bg-black border border-charcoal">
                  <span className="font-bold text-white block">Big Tech India</span>
                  <span className="text-silver mt-1 block">Google, MS, Amazon, Meta</span>
                </div>

                <div className="p-3 rounded bg-black border border-charcoal">
                  <span className="font-bold text-white block">Product Unicorns</span>
                  <span className="text-silver mt-1 block">Flipkart, Swiggy, Zomato, CRED</span>
                </div>

                <div className="p-3 rounded bg-black border border-charcoal">
                  <span className="font-bold text-white block">GCC / Finance</span>
                  <span className="text-silver mt-1 block">Goldman, Walmart, JPMC, Amex</span>
                </div>

                <div className="p-3 rounded bg-black border border-charcoal">
                  <span className="font-bold text-white block">IT Services</span>
                  <span className="text-silver mt-1 block">TCS, Infosys, Wipro, HCLTech</span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10">
                <Link
                  to="/tools/career-path/company-levels"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-black hover:bg-hover-gray text-white hover:text-volt font-bold text-sm border border-charcoal transition-colors min-h-[44px]"
                >
                  <span>Explore Company Levels &amp; Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
