// ============================================================
// HireFlow — Tools Hub Page (High-Contrast Dark System)
// Strictly adhering to DESIGN.md and Stage 4 specs
// Linear-style telemetry badges (No vibe-coded icon squircles)
// ============================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/common/PublicNavbar';
import { careers } from '../../careers-core';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { useAuditStore } from '../../features/journal/useAuditStore';
import { useMySpaceStore } from '../../features/my-space/useMySpaceStore';
import { formatDelta } from '../../features/journal/deltaEngine';


interface ToolItem {
  id: string;
  pill: string;
  title: string;
  badge: string;
  description: string;
  link: string;
  cta: string;
  tags: string[];
}

interface DecisionGroup {
  id: string;
  groupLetter: string;
  title: string;
  description: string;
  tools: ToolItem[];
}

export function ToolsHubPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const authStatus = useAuthStore((s) => s.status);
  const isAuthenticated = authStatus === 'authenticated';
  const audits = useAuditStore((s) => s.entries);
  const planItems = useMySpaceStore((s) => s.planItems);
  const outreachDrafts = useMySpaceStore((s) => s.outreachDrafts);
  const watchlist = useMySpaceStore((s) => s.watchlist);

  const auditsList = Object.values(audits).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latestAudit = auditsList[0];
  const planCount = Object.keys(planItems).length;
  const draftsCount = Object.keys(outreachDrafts).length;
  const targetsCount = Object.values(watchlist).filter((t) => !t.archivedAt).length;

  const getCardStatus = (toolId: string) => {
    if (!isAuthenticated) return null;
    if (toolId === 'resume-checker' && latestAudit) {
      return `Last scan ${latestAudit.overallScore}`;
    }
    if ((toolId === 'credential-engine' || toolId === 'build-briefs') && planCount > 0) {
      return `${planCount} in your plan`;
    }
    if (toolId === 'reach-out' && draftsCount > 0) {
      return `${draftsCount} ${draftsCount === 1 ? 'draft' : 'drafts'}`;
    }
    if ((toolId === 'careers-explorer' || toolId === 'career-path') && targetsCount > 0) {
      return `${targetsCount} ${targetsCount === 1 ? 'target' : 'targets'}`;
    }
    return null;
  };

  const decisionGroups: DecisionGroup[] = [
    {
      id: 'group-a',
      groupLetter: 'A',
      title: 'Application & Outreach',
      description: 'Audit your resume, tailor your bullets, and generate high-converting outreach.',
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
        },
      ],
    },
    {
      id: 'group-b',
      groupLetter: 'B',
      title: 'Projects & Career Evidence',
      description: 'Close missing resume gaps with production-grade engineering briefs and verifiable career credentials.',
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
        },
      ],
    },
    {
      id: 'group-c',
      groupLetter: 'C',
      title: 'Discovery & Direction',
      description: 'Explore career ladders and evaluate target roles side-by-side.',
      tools: [
        {
          id: 'talentlens',
          pill: 'Placement',
          title: 'TalentLens Fit Simulator',
          badge: '100+ Employers | 6-Layer Evaluation',
          description: 'Calibrate your candidate placement readiness against real engineering hiring rubrics and enterprise roles.',
          link: '/demo',
          cta: 'Launch Simulator',
          tags: ['Role Benchmark', 'Gap Diagnosis', 'Readiness Score'],
        },
        {
          id: 'career-path',
          pill: 'Trajectory',
          title: 'Career Trajectory & Levels',
          badge: 'India Market Intelligence',
          description: 'Dream job roadmaps, India-office leveling ladders, CTC medians, and market tier positioning from Tier C to Tier S.',
          link: '/tools/career-path',
          cta: 'Explore Ladders',
          tags: ['Tier Positioning', 'Promotion Blockers', 'Market CTC'],
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
        },
        {
          id: 'careers-explorer',
          pill: 'Directory',
          title: 'Careers Data Platform Explorer',
          badge: `${careers.stats.counts().companies}+ Employers`,
          description: `Browse the full unified dataset of ${careers.stats.counts().companies} top employers and active recruiters, ${careers.stats.counts().roles}+ calibrated roles, eligibility cutoffs, and audit ledgers.`,
          link: '/dev/careers-data',
          cta: 'Explore Dataset',
          tags: [`${careers.stats.counts().companies}+ Companies`, `${careers.stats.counts().roles}+ Roles`, 'Audit Ledgers'],
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-volt selection:text-black">
      <PublicNavbar />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-16 animate-fade-in relative">
        {/* Hero Header (§3 App Scale) */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <p className="text-[13px] font-semibold text-silver uppercase tracking-[1.4px]">
            HireFlow Decision Suite | {totalTools} Essential Tools
          </p>
          <h1 className="text-[36px] sm:text-[48px] font-black text-white uppercase tracking-tight leading-tight">
            Everything You Need To Win Your Next Tech Role
          </h1>
          <p className="text-[16px] text-silver max-w-2xl mx-auto leading-relaxed">
            From evaluating target roles to building production proof points and simulating recruiter scans. 100% deterministic intelligence.
          </p>

          {/* Search Bar (§4 Derived Input) */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <span className="text-silver/60 absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm pointer-events-none">/</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by capability (e.g. cold email, resume, career)..."
                className="w-full pl-10 pr-4 py-3 rounded bg-near-black border border-charcoal text-[14px] text-white placeholder:text-silver/50 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Pick up where you left off (signed-in only with scan data) */}
        {isAuthenticated && latestAudit && (
          <div className="p-4 rounded-xl border border-[#24241c] bg-[#10100d] flex max-sm:flex-col sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#6d6d61]">
                Pick up where you left off
              </span>
              <span className="text-sm font-semibold text-[#f1f1e8]">
                {[latestAudit.jd.company, latestAudit.jd.roleTitle].filter(Boolean).join(', ')}, {latestAudit.overallScore} of 100
              </span>
              {latestAudit.delta?.overallDeltaPts !== undefined && latestAudit.delta?.overallDeltaPts !== null && (
                <span className="text-xs font-semibold text-[#faff69] px-2 py-0.5 rounded-full bg-[#faff69]/10">
                  {formatDelta(latestAudit.delta.overallDeltaPts)}
                </span>
              )}
            </div>
            <Link
              to={`/tools/resume-checker?company=${encodeURIComponent(latestAudit.jd.company || '')}`}
              className="px-4 py-2 rounded-full bg-[#faff69] text-[#090907] font-bold text-xs uppercase tracking-wider hover:bg-[#ebf059] transition-colors shrink-0"
            >
              Continue &rarr;
            </Link>
          </div>
        )}

        {/* Decision Groups Container */}
        <div className="space-y-16">
          {filteredGroups.map((group) => (
            <section key={group.id} className="space-y-6">
              {/* Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-charcoal">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded bg-near-black border border-charcoal font-mono text-lg font-bold text-volt flex items-center justify-center shrink-0">
                    {group.groupLetter}
                  </span>
                  <div>
                    <h2 className="text-[24px] font-bold text-white uppercase tracking-tight">
                      {group.title}
                    </h2>
                    <p className="text-[14px] text-silver">{group.description}</p>
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-silver uppercase tracking-[1.4px]">
                  {group.tools.length} Tools
                </span>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.tools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.link}
                    className="shiny-edge-card group bg-near-black rounded-lg border border-charcoal p-6 flex flex-col justify-between hover:border-volt/60 hover:shadow-level-3 transition-colors cursor-pointer select-none"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-volt tracking-widest uppercase bg-black px-2.5 py-1 rounded border border-charcoal">
                            {tool.pill}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-volt" />
                        </div>
                        <div className="flex items-center gap-2">
                          {getCardStatus(tool.id) && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-[#faff69] bg-[#faff69]/10 border border-[#faff69]/30">
                              {getCardStatus(tool.id)}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-[1.2px] bg-black text-silver border border-charcoal">
                            {tool.badge}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[20px] font-bold text-white group-hover:text-volt transition-colors leading-snug">
                          {tool.title}
                        </h3>
                        <p className="text-[14px] text-silver mt-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      {/* Capability Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {tool.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold uppercase tracking-[1px] px-2 py-0.5 rounded bg-black text-silver/80 border border-charcoal"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="mt-6 pt-4 border-t border-charcoal flex items-center justify-between">
                      <span className="text-[13px] font-bold uppercase tracking-[1.2px] text-white group-hover:text-volt transition-colors">
                        {tool.cta}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
