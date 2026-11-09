import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SpruceShell } from '../layout/SpruceShell';
import {
  HeroBand,
  EditorialBadge,
  Button,
  Card,
  StatBlock,
  StatChip,
  MintPanel,
  Eyebrow,
  Tile,
  ExpertTip,
  SpecGrid,
  SpecCell,
  StatusChip,
  MarqueeRibbon,
} from '../ui';
import { SpruceIllustrations } from '../illustrations';
import { careers } from '../../../careers-core';
import { PLATFORM_DATA_META } from '../../../data/meta';
import { Check, ArrowRight } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  const platformStats = careers.stats.counts();
  const TOTAL_COMPANIES = platformStats.companies;
  const TOTAL_ROLES = platformStats.roles;
  const TOTAL_FRESHER_PROGRAMS = platformStats.fresherPrograms;
  const TOP_COMPANIES = careers.companies.list().slice(0, 24);

  const features = [
    {
      code: 'Harsh Truth AI',
      title: 'Harsh truth AI',
      desc: "We don't sugarcoat. Our AI acts like a ruthless recruiter, tearing apart your resume to tell you exactly why you'd be rejected.",
      icon: <SpruceIllustrations.target size={36} />,
    },
    {
      code: 'Trajectory',
      title: 'Trajectory mapping',
      desc: 'Stop guessing your next move. Input your dream job and we generate a year-by-year syllabus of skills you need to learn.',
      icon: <SpruceIllustrations.compass size={36} />,
    },
    {
      code: 'Simulation',
      title: 'Instant ATS simulation',
      desc: 'Drop in any Job Description and your Resume. We instantly simulate an enterprise ATS scan to give you a match score.',
      icon: <SpruceIllustrations.balance size={36} />,
    },
  ];

  const tools = [
    {
      title: 'TalentLens™ Simulator',
      desc: 'Proprietary candidate placement engine evaluating multi-layer semantic gap proof and recruiter decision signals.',
      illustration: <SpruceIllustrations.target />,
      link: '/demo',
    },
    {
      title: 'ATS Resume Roaster',
      desc: 'Simulate exactly what enterprise ATS filters see with calibrated scoring and invariant gap detection.',
      illustration: <SpruceIllustrations.resumeSheet />,
      link: '/tools/resume-checker',
    },
    {
      title: 'Career Trajectory',
      desc: 'Plan your path from campus to dream companies with real eligibility rules, level cutoffs and CTC progression in INR.',
      illustration: <SpruceIllustrations.compass />,
      link: '/tools/career-path',
    },
  ];

  const marqueeFacts = [
    `${TOTAL_COMPANIES}+ Verified Employers`,
    `${TOTAL_ROLES.toLocaleString()}+ Calibrated Roles`,
    'Zero Egress Client-Side Privacy',
    `${TOTAL_FRESHER_PROGRAMS}+ Campus Pathways`,
    '100% Deterministic Rule-Based Scoring',
  ];

  return (
    <SpruceShell>
      {/* ── 1. Marketing Hero Section ── */}
      <HeroBand
        eyebrow={
          <div className="flex items-center gap-2">
            <EditorialBadge>Candidate Career Decision Suite</EditorialBadge>
          </div>
        }
        headline={
          <>
            Take control of your <span className="text-sp-lime-hero">career</span>.
          </>
        }
        lead={
          <>
            Simulate ATS resume filters, map your career trajectory, and test your resume against{' '}
            <strong className="text-white font-semibold">{TOTAL_COMPANIES}+</strong> verified employers and{' '}
            <strong className="text-white font-semibold">{TOTAL_ROLES.toLocaleString()}+</strong> calibrated roles across active recruiters — all completely free.
          </>
        }
        actions={
          <>
            <Button variant="primary" onClick={() => navigate('/demo')}>
              Try TalentLens™
            </Button>
            <Button variant="onBand" onClick={() => navigate('/tools/resume-checker')}>
              ATS Roaster
            </Button>
            <Button variant="onBand" onClick={() => navigate('/tools')}>
              Decision Suite
            </Button>
          </>
        }
        rightCard={
          <Card className="shadow-sp-4 p-6 bg-sp-surface text-sp-ink border-sp-hairline">
            <div className="flex items-center justify-between pb-3 border-b border-sp-hairline">
              <span className="sp-caption text-sp-muted uppercase font-semibold">Live ATS Preview</span>
              <StatusChip status="partial" label="Scan Complete" />
            </div>
            <div className="my-5">
              <StatBlock figure="42%" label="ATS Baseline Match Score" isScore withArrowMotif />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-sp-body">Webpack / Bundler</span>
                <StatusChip status="missing" label="Missing Gap" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-sp-body">Distributed Systems Proof</span>
                <StatusChip status="partial" label="Partial Metric" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-sp-body">Core TypeScript</span>
                <StatusChip status="matched" label="Verified" />
              </div>
            </div>
          </Card>
        }
      />

      {/* ── 2. Stats Strip ── */}
      <section className="py-12 bg-sp-canvas">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <MintPanel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatBlock
                figure={`${TOTAL_COMPANIES}+`}
                label="Verified Employers"
                withArrowMotif
              />
              <StatChip
                figure={`${TOTAL_ROLES.toLocaleString()}+`}
                label="Calibrated Roles"
              />
              <StatChip
                figure="6-Layer"
                label="Deep ATS Audit"
              />
              <StatChip
                figure={`${TOTAL_FRESHER_PROGRAMS}+`}
                label="Campus Programs"
              />
            </div>
          </MintPanel>
        </div>
      </section>

      {/* ── 3. Calibrated Employers ── */}
      <section className="py-8 bg-sp-canvas border-b border-sp-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <Eyebrow>
              {PLATFORM_DATA_META.companyCounts.fullProfiles} Detailed Company Profiles &amp;{' '}
              {PLATFORM_DATA_META.companyCounts.basicListings} Directory Listings
            </Eyebrow>
            <Link to="/demo" className="sp-caption text-sp-primary-text font-semibold hover:underline">
              View Data Disclosures →
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {TOP_COMPANIES.map((company: any) => (
              <Link
                key={company.id}
                to={`/demo/company/${company.id}`}
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-sp-lg border border-sp-hairline-strong bg-sp-surface sp-ui-sm text-sp-ink hover:border-sp-primary-text hover:bg-sp-mint-50 transition-colors select-none"
              >
                <span className="w-5 h-5 rounded-full bg-sp-mint-100 text-sp-primary-text flex items-center justify-center font-bold text-[10px]">
                  {company.name.charAt(0)}
                </span>
                <span className="font-medium">{company.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Core Features Section ── */}
      <section className="py-16 sm:py-20 bg-sp-canvas-soft border-b border-sp-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <Eyebrow>Core Features</Eyebrow>
            <h2 className="sp-h1 text-sp-ink mt-2">Built for the modern candidate</h2>
            <p className="sp-body text-sp-muted mt-2">
              We reverse-engineered enterprise ATS systems so you can finally beat them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card
                key={f.code}
                className={`flex flex-col justify-between ${
                  i === 0 ? 'md:col-span-1 md:row-span-1 border-sp-primary-text' : ''
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-sp-mint-50 text-sp-primary-text flex items-center justify-center mb-5">
                    {f.icon}
                  </div>
                  <h3 className="sp-h3 text-sp-ink">{f.title}</h3>
                  <p className="sp-body-sm text-sp-body mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Harsh Truth Split Section ── */}
      <section className="py-16 sm:py-24 bg-sp-canvas border-b border-sp-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative Column (ExpertTip) */}
            <div className="lg:col-span-7">
              <ExpertTip label="Harsh Truth Recruiter Intelligence">
                <h2 className="sp-h2 text-sp-on-lime font-bold">
                  Know exactly why you&apos;re getting rejected.
                </h2>
                <p className="sp-body text-sp-on-lime leading-relaxed mt-2">
                  Stop firing your resume into the void. Our scanner evaluates your profile with industry-leading precision, instantly flagging missing hard skills, overused buzzwords, and formatting errors before you apply.
                </p>
                <div className="pt-4 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-sp-primary stroke-[3]" />
                    <span className="font-semibold text-sp-on-lime">Enterprise ATS simulation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-sp-primary stroke-[3]" />
                    <span className="font-semibold text-sp-on-lime">Identifies semantic keyword gaps</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-sp-primary stroke-[3]" />
                    <span className="font-semibold text-sp-on-lime">No-BS actionable feedback</span>
                  </div>
                </div>
              </ExpertTip>
            </div>

            {/* Right Live ATS Match Report Mockup Card */}
            <div className="lg:col-span-5">
              <Card className="shadow-sp-4 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-sp-hairline">
                  <div>
                    <span className="sp-eyebrow text-sp-muted">ATS Match Report</span>
                    <h3 className="sp-h3 text-sp-ink mt-0.5">Target: Senior Frontend Engineer</h3>
                  </div>
                  <StatBlock figure="42%" label="Score" className="py-2 px-3.5" />
                </div>

                <div className="mt-5 space-y-4">
                  <div className="p-3.5 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="sp-ui-label text-sp-ink">Missing Skill: Webpack/Vite</span>
                      <StatusChip status="missing" label="Critical" />
                    </div>
                    <p className="sp-body-sm text-sp-muted">
                      The job description highlights Webpack 5 times as a core requirement, but no bundler evidence was found in your resume.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-sp-xs bg-sp-canvas-soft border border-sp-hairline space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="sp-ui-label text-sp-ink">Impact Metrics Quality</span>
                      <StatusChip status="partial" label="Needs Work" />
                    </div>
                    <p className="sp-body-sm text-sp-muted">
                      &ldquo;Responsible for building components&rdquo; is a weak bullet point. Change to quantifiable proof with measurable scale.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Free Tools Cards ── */}
      <section className="py-16 sm:py-20 bg-sp-canvas-soft border-b border-sp-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <Eyebrow>Free Tools</Eyebrow>
            <h2 className="sp-h1 text-sp-ink mt-2">Accelerate your career</h2>
            <p className="sp-body text-sp-muted mt-2">
              Everything you need to land your next big role.
            </p>
          </div>

          <MintPanel className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Tile
                  key={tool.title}
                  illustration={tool.illustration}
                  title={tool.title}
                  description={tool.desc}
                  onClick={() => navigate(tool.link)}
                />
              ))}
            </div>
          </MintPanel>

          {/* Optional Marquee Ribbon directly below */}
          <div className="mt-8">
            <MarqueeRibbon items={marqueeFacts} />
          </div>
        </div>
      </section>

      {/* ── 7. Conversion Section ── */}
      <section className="py-20 bg-sp-canvas">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <MintPanel className="text-center py-12 sm:py-16 flex flex-col items-center">
            <Eyebrow>Open &amp; Free For Candidates</Eyebrow>
            <h2 className="sp-h1 text-sp-ink mt-3 max-w-xl">
              Zero black box. Zero gatekeeping.
            </h2>
            <p className="sp-body text-sp-body max-w-xl mx-auto mt-3 mb-8">
              Every score, formula, and invariant audit rule is publicly transparent. No accounts or credit cards required.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate('/tools')}>
              <span>Get started with tools hub</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </MintPanel>
        </div>
      </section>
    </SpruceShell>
  );
}
