// ============================================================
// Career Path & Promotion Level Hub — India Market Landing Page
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
} from 'lucide-react';
import { CareerPathBackButton } from '../../../components/career-path/CareerPathBackButton';

export function CareerPathHub() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  if (tabParam === 'explorer') {
    return <Navigate to="/tools/career-path/company-ladder" replace />;
  }
  if (tabParam === 'simulator') {
    return <Navigate to="/tools/career-path/promotion-simulator" replace />;
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Pinned Top Navigation */}
      <CareerPathBackButton isHub={true} />

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 lg:py-32 overflow-hidden">
        {/* Subtle background glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/10 via-emerald-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full"
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide uppercase mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>India Market • INR (₹) Engineering Intelligence</span>
          </div>

          {/* Very Large Heading */}
          <h1
            className="font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.05] max-w-4xl"
            style={{ fontSize: 'clamp(2.75rem, 7vw, 5.5rem)' }}
          >
            Engineering Career Path &amp; Promotion Simulator
          </h1>

          {/* One-line subheading */}
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 max-w-3xl font-normal leading-relaxed">
            Data-backed career trajectories, campus hiring cutoffs, and India-office compensation bands from fresher to staff engineer.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/tools/career-path/promotion-simulator"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <Compass className="w-5 h-5" />
              <span>Launch Promotion Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/tools/career-path/company-ladder"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold text-base border border-neutral-300 dark:border-neutral-700 shadow-sm transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
            >
              <Building2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              <span>Explore Company Ladders</span>
            </Link>
          </div>

          {/* Subtle Scroll Cue */}
          <button
            type="button"
            onClick={scrollToSection}
            className="mt-16 sm:mt-24 inline-flex flex-col items-center gap-2 text-xs font-medium text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded p-2"
            aria-label="Scroll down to tool showcases"
          >
            <span>Explore the Two Intelligence Engines</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Tool Showcase Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 space-y-24">
        {/* Tool 1 Showcase: Promotion Roadmap Simulator */}
        <section
          ref={section1Ref}
          className={`transition-all duration-700 ease-out transform ${
            section1Visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}
          aria-labelledby="simulator-heading"
        >
          <div className="relative rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 lg:p-16 shadow-xl shadow-neutral-200/40 dark:shadow-none overflow-hidden group">
            {/* Background accent */}
            <div
              className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"
              aria-hidden="true"
            />

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-5">
                <Compass className="w-4 h-4" />
                <span>Tool 1 • Interactive Trajectory Engine</span>
              </div>

              <h2
                id="simulator-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight"
              >
                Promotion Roadmap Simulator
              </h2>

              <p className="mt-4 text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed">
                Deterministic career projections with dual modes for college students targeting dream fresher jobs and working engineers planning promotion cycles.
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
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* Modes highlight */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Student Mode</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Degree, branch family, college tier, CGPA cutoffs &amp; stepping stone offers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Professional Mode</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Current tenure, rating calibration, expected promo windows &amp; CTC jumps.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10">
                <Link
                  to="/tools/career-path/promotion-simulator"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                >
                  <span>Open Promotion Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tool 2 Showcase: Company Ladder Explorer */}
        <section
          ref={section2Ref}
          className={`transition-all duration-700 ease-out transform ${
            section2Visible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}
          aria-labelledby="ladder-heading"
        >
          <div className="relative rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 lg:p-16 shadow-xl shadow-neutral-200/40 dark:shadow-none overflow-hidden group">
            {/* Background accent */}
            <div
              className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"
              aria-hidden="true"
            />

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-5">
                <Building2 className="w-4 h-4" />
                <span>Tool 2 • Verified Market Intelligence</span>
              </div>

              <h2
                id="ladder-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight"
              >
                Company Ladder Explorer
              </h2>

              <p className="mt-4 text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed">
                Explore real India-office leveling frameworks, verified INR CTC packages, and authentic promotion blockers across 52 tech organizations.
              </p>

              {/* Preview Chips */}
              <div className="mt-8 flex flex-wrap gap-2.5">
                {[
                  '52 India Tech Companies',
                  'Median, P25 & P75 INR CTC',
                  'Fixed Base + Variable + Equity Splits',
                  '6+ Structured Blockers per Level',
                  'Verified Source Links & Verification Dates',
                ].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {/* Segments highlight */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-semibold text-neutral-900 dark:text-white block">Big Tech India</span>
                  <span className="text-neutral-500 dark:text-neutral-400 mt-1 block">Google, MS, Amazon, Meta</span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-semibold text-neutral-900 dark:text-white block">Product Unicorns</span>
                  <span className="text-neutral-500 dark:text-neutral-400 mt-1 block">Flipkart, Swiggy, Zomato, CRED</span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-semibold text-neutral-900 dark:text-white block">GCC / Finance</span>
                  <span className="text-neutral-500 dark:text-neutral-400 mt-1 block">Goldman, Walmart, JPMC, Amex</span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60">
                  <span className="font-semibold text-neutral-900 dark:text-white block">IT Services</span>
                  <span className="text-neutral-500 dark:text-neutral-400 mt-1 block">TCS, Infosys, Wipro, HCLTech</span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10">
                <Link
                  to="/tools/career-path/company-ladder"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-base shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
                >
                  <span>Explore Company Ladders</span>
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
