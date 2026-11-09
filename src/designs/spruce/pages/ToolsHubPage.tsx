import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpruceShell } from '../layout/SpruceShell';
import { PageHeader } from '../layout/PageHeader';
import {
  Card,
  Button,
  AwardRibbon,
  CategoryRail,
  CategoryRailItem,
  FieldShell,
} from '../ui';
import { SpruceIllustrations } from '../illustrations';
import { careers } from '../../../careers-core';
import { Search, ArrowRight } from 'lucide-react';

interface ToolItem {
  id: string;
  pill: string;
  title: string;
  badge: string;
  description: string;
  link: string;
  cta: string;
  tags: string[];
  illustration: React.ReactNode;
  isPrimary?: boolean;
  award?: string;
}

interface DecisionGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tools: ToolItem[];
}

export function ToolsHubPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('group-a');

  const counts = careers.stats.counts();

  const decisionGroups: DecisionGroup[] = [
    {
      id: 'group-a',
      title: 'Application & Outreach',
      description: 'Audit your resume, tailor your bullets, and generate high-converting outreach messages.',
      icon: <SpruceIllustrations.resumeSheet size={24} />,
      tools: [
        {
          id: 'resume-checker',
          pill: 'Audit',
          title: 'ATS Resume Roaster',
          badge: 'Harsh Invariant Scorer',
          description: 'Scan your resume against any JD. Get strict subscore audits, verbatim citations, and simulated wording fixes.',
          link: '/tools/resume-checker',
          cta: 'Roast My Resume',
          tags: ['Invariant Engine', 'Verbatim Citations', 'Zero Fabrication'],
          illustration: <SpruceIllustrations.resumeSheet />,
          isPrimary: true,
          award: 'Start here',
        },
        {
          id: 'tailor',
          pill: 'Editor',
          title: 'Tailor My Resume',
          badge: 'Truth-Checked Suggestions',
          description: 'Reorder, rephrase, and context-enhance resume bullets with strictly verified skills and required metric placeholders.',
          link: '/tools/tailor',
          cta: 'Tailor Bullets',
          tags: ['Truth Check', 'Diff Editor', 'Version History'],
          illustration: <SpruceIllustrations.envelope />,
        },
        {
          id: 'reach-out',
          pill: 'Outreach',
          title: 'Reach Out',
          badge: 'Targeted Communication',
          description: 'Generate professional, context-aware messages across channels with strict LinkedIn 300-char limits and verifiable proof points.',
          link: '/tools/reach-out',
          cta: 'Generate Outreach',
          tags: ['LinkedIn 300 Char', 'Cold Email', 'Referrals'],
          illustration: <SpruceIllustrations.envelope />,
        },
      ],
    },
    {
      id: 'group-b',
      title: 'Projects & Career Evidence',
      description: 'Close missing resume gaps with production-grade engineering briefs and verifiable career credentials.',
      icon: <SpruceIllustrations.blocks size={24} />,
      tools: [
        {
          id: 'credential-engine',
          pill: 'Credentials',
          title: 'Credential & Opportunity Engine',
          badge: 'Evidence-Building Hub',
          description: 'Find industry-relevant certifications, competitions, and open-source programs that create verifiable resume evidence for your target role.',
          link: '/tools/credential-engine',
          cta: 'Build Career Evidence',
          tags: ['Certifications', 'Competitions & SIH', 'GSoC & LFX', 'Opportunity Plan'],
          illustration: <SpruceIllustrations.ribbonBadge />,
          isPrimary: true,
        },
        {
          id: 'build-briefs',
          pill: 'Briefs',
          title: 'Project Build Briefs',
          badge: 'Gap-Driven Generation',
          description: 'Generate production engineering briefs directly from your JD skill gaps, complete with deliverables and interview talking points.',
          link: '/tools/build-briefs',
          cta: 'Find Projects to Build',
          tags: ['Real JD Inputs', 'Scale Targets', 'Verification Rubric'],
          illustration: <SpruceIllustrations.blocks />,
        },
      ],
    },
    {
      id: 'group-c',
      title: 'Discovery & Direction',
      description: 'Explore career ladders and evaluate target roles side-by-side.',
      icon: <SpruceIllustrations.compass size={24} />,
      tools: [
        {
          id: 'career-path',
          pill: 'Trajectory',
          title: 'Career Trajectory & Levels',
          badge: 'India Market Intelligence',
          description: 'Dream job roadmaps, India-office leveling ladders, CTC medians, and market tier positioning from Tier C to Tier S.',
          link: '/tools/career-path',
          cta: 'Explore Ladders',
          tags: ['Tier Positioning', 'Promotion Blockers', 'Market CTC'],
          illustration: <SpruceIllustrations.compass />,
          isPrimary: true,
        },
        {
          id: 'jd-compare',
          pill: 'Compare',
          title: 'Compare Job Descriptions',
          badge: 'Multi-JD Evaluator',
          description: 'Compare 2–3 job descriptions side-by-side. Uncover shared vs unique gaps and choose the highest-yield target.',
          link: '/tools/jd-compare',
          cta: 'Compare JDs',
          tags: ['Deterministic Ranking', 'Shared Gaps', 'Coverage Gain'],
          illustration: <SpruceIllustrations.balance />,
        },
        {
          id: 'careers-explorer',
          pill: 'Directory',
          title: 'Careers Data Platform Explorer',
          badge: `${counts.companies}+ Employers`,
          description: `Browse the full unified dataset of ${counts.companies} top employers, ${counts.roles.toLocaleString()}+ calibrated roles, eligibility cutoffs, and audit ledgers.`,
          link: '/dev/careers-data',
          cta: 'Explore Dataset',
          tags: [`${counts.companies}+ Companies`, `${counts.roles.toLocaleString()}+ Roles`, 'Audit Ledgers'],
          illustration: <SpruceIllustrations.building />,
        },
      ],
    },
  ];

  const categoryRailItems: CategoryRailItem[] = decisionGroups.map((g) => ({
    id: g.id,
    label: g.title,
    icon: g.icon,
  }));

  const scrollToGroup = (groupId: string) => {
    setActiveGroup(groupId);
    const element = document.getElementById(groupId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    <SpruceShell>
      {/* ── 1. Page Header (Compact HeroBand) ── */}
      <PageHeader
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Tools Hub' }]}
        title="Everything you need to win your next tech role"
        subtitle="From evaluating target roles to building production proof points and simulating recruiter scans. 100% deterministic intelligence."
      />

      {/* ── 2. Search & Category Rail Controls Bar ── */}
      <div className="sticky top-[72px] z-30 bg-sp-canvas/95 backdrop-blur-sm border-b border-sp-hairline py-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Rail */}
          <CategoryRail
            items={categoryRailItems}
            activeId={activeGroup}
            onChange={scrollToGroup}
          />

          {/* Search Box (max 480px) */}
          <div className="w-full md:w-80 max-w-[480px]">
            <FieldShell>
              <div className="flex items-center px-3.5">
                <Search className="w-4 h-4 text-sp-muted shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tools by capability..."
                  className="w-full h-11 bg-transparent border-0 outline-none sp-body-sm text-sp-ink placeholder:text-sp-muted"
                />
              </div>
            </FieldShell>
          </div>
        </div>
      </div>

      {/* ── 3. Decision Groups Content ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 space-y-16">
        {filteredGroups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-36 space-y-6">
            <div>
              <h2 className="sp-h2 text-sp-ink">{group.title}</h2>
              <p className="sp-body-sm text-sp-muted mt-1">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.tools.map((tool) => (
                <Card
                  key={tool.id}
                  className="flex flex-col justify-between hover:border-sp-primary-text relative overflow-hidden"
                >
                  {tool.award && (
                    <div className="absolute top-0 left-0">
                      <AwardRibbon label={tool.award} />
                    </div>
                  )}

                  <div className={tool.award ? 'pt-4' : ''}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-sp-mint-50 flex items-center justify-center text-sp-primary-text shrink-0">
                        {tool.illustration}
                      </div>
                      <span className="sp-micro font-semibold uppercase px-2.5 py-1 rounded-sp-sm bg-sp-canvas-soft border border-sp-hairline text-sp-muted">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="sp-h3 text-sp-ink">{tool.title}</h3>
                    <p className="sp-body-sm text-sp-body mt-2 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Tag Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-4">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="sp-micro bg-sp-canvas-soft border border-sp-hairline rounded-sp-sm px-2 py-0.5 text-sp-body"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pinned Action Button */}
                  <div className="pt-6 mt-6 border-t border-sp-hairline">
                    <Button
                      variant={tool.isPrimary ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(tool.link)}
                    >
                      <span>{tool.cta}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </SpruceShell>
  );
}
