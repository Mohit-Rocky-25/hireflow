// ============================================================
// HireFlow Suite — Unified Tools Hub (/tools)
// Stage 8.1: Decision Suite Command Center
// Organizes all 10 suite tools across the 5 core candidate & recruiter decision groups.
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  GitCompare,
  Kanban,
  Building2,
  FileEdit,
  Mail,
  UserCheck,
  FolderGit2,
  Receipt,
  ShieldCheck,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  Search,
  CheckCircle2,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useProfile } from '../../features/suite/profile/ProfileContext';

interface ToolItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  link: string;
  cta: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

interface DecisionGroup {
  id: string;
  groupLetter: string;
  question: string;
  description: string;
  color: string;
  borderColor: string;
  tools: ToolItem[];
}

export function ToolsHubPage() {
  const { profile, hasProfile, openDrawer } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');

  const decisionGroups: DecisionGroup[] = [
    {
      id: 'group-a',
      groupLetter: 'A',
      question: 'What should I apply to?',
      description: 'Side-by-side job evaluation, pipeline tracking, and company hiring bar comparisons.',
      color: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/30',
      tools: [
        {
          id: 'jd-compare',
          title: 'Compare Job Descriptions',
          badge: 'Multi-JD Evaluator',
          description: 'Compare 2–3 job descriptions side-by-side. Uncover shared vs unique gaps and choose the highest-yield target.',
          link: '/tools/jd-compare',
          cta: 'Compare JDs',
          icon: GitCompare,
          tags: ['Deterministic Ranking', 'Shared Gaps', 'Coverage Gain'],
        },
        {
          id: 'tracker',
          title: 'Application Tracker',
          badge: 'Pipeline Insights',
          description: 'Kanban pipeline with response rates, interview conversion metrics, gone-quiet alerts, and CSV import/export.',
          link: '/tools/tracker',
          cta: 'Track Applications',
          icon: Kanban,
          tags: ['Funnel Analytics', 'Gone-Quiet Alerts', 'CSV Parser'],
        },
        {
          id: 'company-compare',
          title: 'Company vs Company',
          badge: 'Prep Overlap Engine',
          description: 'Compare hiring bars and interview rounds across Indian tech companies with directed preparation overlap percentages.',
          link: '/tools/company-compare',
          cta: 'Compare Companies',
          icon: Building2,
          tags: ['Dataset 6', 'Overlap Formula', 'Interview Rounds'],
        },
      ],
    },
    {
      id: 'group-b',
      groupLetter: 'B',
      question: 'How do I present myself better?',
      description: 'Audit ATS readability, generate cold outreach, tailor bullets with truth checks, and audit public profiles.',
      color: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
      tools: [
        {
          id: 'resume-checker',
          title: 'ATS Resume Roaster',
          badge: 'Harsh Invariant Scorer',
          description: 'Scan your resume against any JD. Get strict subscore audits, verbatim citations, and simulated wording fixes.',
          link: '/tools/resume-checker',
          cta: 'Roast My Resume',
          icon: FileSearch,
          tags: ['Invariant Engine', 'Verbatim Citations', 'Zero Fabrication'],
        },
        {
          id: 'tailor',
          title: 'Tailor My Resume',
          badge: 'Truth-Checked Suggestions',
          description: 'Reorder, rephrase, and context-enhance resume bullets with zero hallucinated skills and required metric placeholders.',
          link: '/tools/tailor',
          cta: 'Tailor Bullets',
          icon: FileEdit,
          tags: ['Truth Check', 'Diff Editor', 'Version History'],
        },
        {
          id: 'reach-out',
          title: 'Reach Out (Cold Outreach)',
          badge: '15 High-Converting Templates',
          description: 'Generate high-response messages across 5 channels with strict LinkedIn 300-char limits and verbatim proof points.',
          link: '/tools/reach-out',
          cta: 'Generate Outreach',
          icon: Mail,
          tags: ['LinkedIn 300 Char', 'Cold Email', 'Tracker Handoff'],
        },
        {
          id: 'profile-check',
          title: 'Profile Check (LinkedIn & GitHub)',
          badge: 'Public Signal Audit',
          description: 'Audit your public profile headlines, 4-part About section, experience bullet density, and GitHub repository hygiene.',
          link: '/tools/profile-check',
          cta: 'Audit Public Signal',
          icon: UserCheck,
          tags: ['Public Signal 0-100', 'Screener Checklist', 'Repo Hygiene'],
        },
      ],
    },
    {
      id: 'group-c',
      groupLetter: 'C',
      question: 'What do I build or fix?',
      description: 'Close missing resume gaps with production-grade engineering briefs and set-cover bundling.',
      color: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30',
      tools: [
        {
          id: 'build-briefs',
          title: 'Project Build Briefs',
          badge: 'Optimal Set-Cover Bundler',
          description: '14 production engineering briefs with scale targets, verification rubrics, and bullet formulas that cover multiple missing skills at once.',
          link: '/tools/build-briefs',
          cta: 'Find Projects to Build',
          icon: FolderGit2,
          tags: ['Greedy Set-Cover', 'Scale Targets', 'Verification Rubric'],
        },
      ],
    },
    {
      id: 'group-d',
      groupLetter: 'D',
      question: 'What offer should I take?',
      description: 'Decode CTC into real take-home cash under FY 2026-27 tax rules, ESOP vesting, and contract risk flags.',
      color: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30',
      tools: [
        {
          id: 'offer-decoder',
          title: 'Offer Decoder',
          badge: 'FY 2026-27 Tax Engine',
          description: 'Gross-to-net waterfall, Section 87A marginal relief cap, state professional tax, 4-year projection, and contract risk detection.',
          link: '/tools/offer-decoder',
          cta: 'Decode Offer CTC',
          icon: Receipt,
          tags: ['Marginal Relief Cap', 'State PT', 'Dark Waterfall Chart'],
        },
      ],
    },
    {
      id: 'group-e',
      groupLetter: 'E',
      question: 'Connecting HireFlow\'s Roles',
      description: 'Verifiable candidate evidence cards, institutional placement cell audits, and career ladder trajectories.',
      color: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      borderColor: 'border-cyan-500/30',
      tools: [
        {
          id: 'evidence-card',
          title: 'Verifiable Evidence Card',
          badge: 'SHA-256 Tamper-Proof',
          description: 'Generate portable, privacy-minimal proof cards packing Level 0–4 audited skills, verbatim quotes, and repo links without backend storage.',
          link: '/tools/evidence-card',
          cta: 'Build Evidence Card',
          icon: ShieldCheck,
          tags: ['Deflate-Raw Codec', 'Zero Fluff', 'Recruiter Proof'],
        },
        {
          id: 'batch-readiness',
          title: 'Batch Readiness (Placement Cells)',
          badge: 'College Cohort Heatmap',
          description: 'Institutional readiness intelligence: benchmark student cohorts against target tech companies, rank curriculum gaps, and enforce zero-bias privacy.',
          link: '/tools/batch-readiness',
          cta: 'Audit Cohort Readiness',
          icon: Users,
          tags: ['Heatmap Matrix', 'Workshop Recommendations', 'CSV Export'],
        },
        {
          id: 'career-path',
          title: 'Career Trajectory & Levels',
          badge: 'India Market INR Intelligence',
          description: 'Dream job roadmaps, India-office leveling ladders, CTC medians, and market tier positioning from Tier C to Tier S.',
          link: '/tools/career-path',
          cta: 'Explore Ladders',
          icon: Compass,
          tags: ['Tier Positioning', 'Promotion Blockers', 'Market CTC'],
        },
      ],
    },
  ];

  // Search filtering
  const filteredGroups = decisionGroups
    .map((group) => {
      const matchingTools = group.tools.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return { ...group, tools: matchingTools };
    })
    .filter((g) => g.tools.length > 0);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>HireFlow Decision Suite • 10 Integrated Tools</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Everything You Need to Win Your Next Tech Role
        </h1>
        <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
          From deciding where to apply to negotiating your final offer: pure in-browser execution, zero fabrication, and deterministic hiring intelligence.
        </p>

        {/* Search Bar */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by capability (e.g. tax, cold email, kafka)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-border text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Decision Groups Container */}
      <div className="space-y-12">
        {filteredGroups.map((group) => (
          <section key={group.id} className="space-y-5">
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-surface-2 border border-border font-mono text-xs font-black text-primary flex items-center justify-center shrink-0">
                  {group.groupLetter}
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                    {group.question}
                  </h2>
                  <p className="text-xs text-muted">{group.description}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-muted font-mono">
                {group.tools.length} Tools
              </span>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    to={tool.link}
                    className="group bg-surface rounded-2xl border border-border hover:border-primary/40 p-6 flex flex-col justify-between transition-all hover:shadow-card-hover relative overflow-hidden"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border group-hover:bg-primary/10 group-hover:border-primary/20 flex items-center justify-center text-primary transition-colors shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-2 border border-border text-muted">
                          {tool.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-secondary mt-1.5 leading-relaxed line-clamp-3">
                          {tool.description}
                        </p>
                      </div>

                      {/* Capability Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tool.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-2 text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-5 mt-4 border-t border-border flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>{tool.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
