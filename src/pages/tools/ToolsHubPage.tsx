import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  GitCompare,
  FileEdit,
  Mail,
  FolderGit2,
  Compass,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { PageNav } from '../../components/common/PageNav';

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
  title: string;
  description: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    hoverBorder: string;
    shadowGlow: string;
    button: string;
  };
  tools: ToolItem[];
}

export function ToolsHubPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const decisionGroups: DecisionGroup[] = [
    {
      id: 'group-a',
      groupLetter: 'A',
      title: 'Application & Outreach',
      description: 'Audit your resume, tailor your bullets, and generate high-converting cold outreach.',
      colorTheme: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        hoverBorder: 'hover:border-emerald-500/60',
        shadowGlow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)]',
        button: 'bg-emerald-600 text-white',
      },
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
          title: 'Reach Out',
          badge: 'Targeted Communication',
          description: 'Generate professional, context-aware messages across channels with strict LinkedIn 300-char limits and verifiable proof points.',
          link: '/tools/reach-out',
          cta: 'Generate Outreach',
          icon: Mail,
          tags: ['LinkedIn 300 Char', 'Cold Email', 'Referrals'],
        },
      ],
    },
    {
      id: 'group-b',
      groupLetter: 'B',
      title: 'Projects to Build',
      description: 'Close missing resume gaps with production-grade engineering briefs.',
      colorTheme: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-600 dark:text-cyan-400',
        hoverBorder: 'hover:border-cyan-500/60',
        shadowGlow: 'hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]',
        button: 'bg-cyan-600 text-white',
      },
      tools: [
        {
          id: 'build-briefs',
          title: 'Project Build Briefs',
          badge: 'Gap-Driven Generation',
          description: 'Generate production engineering briefs directly from your JD skill gaps, complete with deliverables and interview talking points.',
          link: '/tools/build-briefs',
          cta: 'Find Projects to Build',
          icon: FolderGit2,
          tags: ['Real JD Inputs', 'Scale Targets', 'Verification Rubric'],
        },
      ],
    },
    {
      id: 'group-c',
      groupLetter: 'C',
      title: 'Discovery & Direction',
      description: 'Explore career ladders and evaluate target roles side-by-side.',
      colorTheme: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        text: 'text-indigo-500',
        hoverBorder: 'hover:border-indigo-500/50',
        shadowGlow: 'hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]',
        button: 'bg-indigo-500 text-white',
      },
      tools: [
        {
          id: 'career-path',
          title: 'Career Trajectory & Levels',
          badge: 'India Market Intelligence',
          description: 'Dream job roadmaps, India-office leveling ladders, CTC medians, and market tier positioning from Tier C to Tier S.',
          link: '/tools/career-path',
          cta: 'Explore Ladders',
          icon: Compass,
          tags: ['Tier Positioning', 'Promotion Blockers', 'Market CTC'],
        },
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
      ],
    },
  ];

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

  const totalTools = decisionGroups.reduce((acc, g) => acc + g.tools.length, 0);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 animate-fade-in relative">
      <PageNav />
      {/* Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-wide uppercase">
          <Sparkles className="w-4 h-4" />
          <span>HireFlow Decision Suite • {totalTools} Essential Tools</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-tight">
          Everything You Need to Win Your Next Tech Role
        </h1>
        <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto font-medium">
          From evaluating your target roles to building the right projects and presenting yourself better. No gimmicks, pure intelligence.
        </p>

        {/* Search Bar */}
        <div className="pt-6 max-w-xl mx-auto">
          <div className="relative group">
            <Search className="w-6 h-6 text-muted absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by capability (e.g. cold email, resume, career)..."
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface border-2 border-border text-base text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Decision Groups Container */}
      <div className="space-y-20">
        {filteredGroups.map((group) => (
          <section key={group.id} className="space-y-8">
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-border">
              <div className="flex items-start gap-6">
                <span className={`w-14 h-14 rounded-2xl ${group.colorTheme.bg} ${group.colorTheme.border} border-2 font-mono text-2xl font-black ${group.colorTheme.text} flex items-center justify-center shrink-0`}>
                  {group.groupLetter}
                </span>
                <div>
                  <h2 className="text-[clamp(32px,4vw,44px)] font-[800] text-foreground tracking-tight leading-none mb-3">
                    {group.title}
                  </h2>
                  <p className="text-lg text-muted font-medium">{group.description}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-muted font-mono uppercase tracking-wider mb-2">
                {group.tools.length} Tools
              </span>
            </div>

            {/* Tools Grid */}
            <div className={`grid gap-6 ${group.tools.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
              {group.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    to={tool.link}
                    className={`group block bg-surface rounded-[24px] border-2 border-border p-8 min-h-[280px] flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${group.colorTheme.hoverBorder} ${group.colorTheme.shadowGlow} overflow-hidden`}
                  >
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className={`w-16 h-16 rounded-2xl ${group.colorTheme.bg} ${group.colorTheme.border} border-2 flex items-center justify-center ${group.colorTheme.text} transition-colors shrink-0`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${group.colorTheme.bg} ${group.colorTheme.text} border border-transparent group-hover:${group.colorTheme.border}`}>
                          {tool.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-2xl sm:text-[28px] font-bold text-foreground transition-colors group-hover:text-foreground/90 leading-tight">
                          {tool.title}
                        </h3>
                        <p className="text-base text-text-secondary mt-3 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      {/* Capability Tags */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tool.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[12px] font-bold px-3 py-1 rounded-md bg-surface-2 text-text-secondary border border-border group-hover:${group.colorTheme.border} transition-colors`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-8 pt-6 border-t-2 border-border flex items-center justify-between">
                      <div className={`inline-flex items-center justify-center h-12 px-6 rounded-xl font-bold text-sm transition-all ${group.colorTheme.button} hover:opacity-90`}>
                        {tool.cta}
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-surface-2 border-2 border-border group-hover:${group.colorTheme.border} transition-transform group-hover:translate-x-1`}>
                        <ArrowRight className={`w-6 h-6 ${group.colorTheme.text}`} />
                      </div>
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
