// ============================================================
// Structured Promotion Blockers Catalog
// Comprehensive company & level-specific promotion blockers
// ============================================================

import type { StructuredBlocker } from './types';

export function createLevelBlockers(
  companyName: string,
  levelCode: string,
  nextLevelCode: string,
  levelRank: 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'manager' | 'director'
): StructuredBlocker[] {
  switch (levelRank) {
    case 'entry':
      return [
        {
          title: 'Executing only bounded tasks without independent architectural ownership',
          category: 'Scope too small',
          whyItBlocks: `At ${companyName}, promoting from ${levelCode} to ${nextLevelCode} requires moving past guided ticket execution. Engineers who need continuous supervision or detailed pseudo-code from senior peers are rated as still operating at entry level.`,
          evidenceToCounter: `Provide 2-3 production feature deliveries where you took fuzzy user stories, wrote RFC/technical design docs independently, and drove execution with minimal senior oversight.`,
        },
        {
          title: 'Code velocity high but system impact and reliability unmeasured',
          category: 'Impact not measurable',
          whyItBlocks: `Submitting many PRs is insufficient for ${nextLevelCode} at ${companyName}. Calibration committees look for production reliability, latency improvements, and zero-defect deployments rather than pure line count.`,
          evidenceToCounter: `Include Datadog/Prometheus dashboards or launch metrics demonstrating 99.9% uptime, reduced query latency, or zero P0 regressions across your owned modules.`,
        },
        {
          title: 'Lack of multi-quarter sustained performance evidence',
          category: 'Performance history',
          whyItBlocks: `Calibration guidelines require 6 to 12 consecutive months of consistently performing at ${nextLevelCode} expectations before promotion is granted ('promo is a lagging indicator, not a reward for potential').`,
          evidenceToCounter: `Document 2 consecutive performance review cycles rated 'Exceeds Expectations' with written peer feedback confirming you were already functioning at ${nextLevelCode}.`,
        },
        {
          title: 'Work confined within immediate pod without cross-functional visibility',
          category: 'Visibility and sponsorship',
          whyItBlocks: `At calibration, committee members outside your immediate team evaluate your packet. If your technical contribution is unknown to neighboring tech leads, the nomination lacks cross-team backing.`,
          evidenceToCounter: `Secure written endorsements and code review feedback from tech leads in upstream/downstream collaborating squads.`,
        },
        {
          title: 'Weak collaboration hygiene or defensive code review posture',
          category: 'Behavior and collaboration',
          whyItBlocks: `${companyName} values constructive code review culture. Engineers who push back defensively on constructive feedback or fail to review peer PRs promptly fail the culture calibration bar.`,
          evidenceToCounter: `Show evidence of high-quality, empathetic PR reviews for teammates, active participation in sprint retrospectives, and onboarding help for incoming interns or junior peers.`,
        },
        {
          title: 'Packet missing required calibration artifacts and manager sponsorship',
          category: 'Process and calibration',
          whyItBlocks: `A poorly constructed promo packet lacking concrete diffs, customer testimonials, and proactive manager advocacy in calibration leads to deferral to the subsequent cycle.`,
          evidenceToCounter: `Draft your promo packet with your manager 8 weeks before cycle cutoff, conducting a dry run review with an external staff engineer.`,
        },
      ];

    case 'mid':
      return [
        {
          title: 'Operating within single-service boundaries rather than multi-service architecture',
          category: 'Scope too small',
          whyItBlocks: `Promotion to ${nextLevelCode} at ${companyName} requires owning end-to-end multi-service architectures and high-ambiguity problem spaces. Working solely on minor service enhancements blocks advancement.`,
          evidenceToCounter: `Present technical design documents (RFCs) showing architecture across at least 2-3 decoupled microservices, database schema migrations, and event-driven pipelines.`,
        },
        {
          title: 'Technical output not explicitly tied to business OKRs or cost savings',
          category: 'Impact not measurable',
          whyItBlocks: `Committees require demonstrable business metrics at ${nextLevelCode}—such as infrastructure cost reductions, conversion lift, or significant API throughput milestones.`,
          evidenceToCounter: `Quantify revenue or infrastructure impact: e.g., 'Reduced cloud compute spend by ₹25L/year by optimizing DynamoDB access patterns' or 'Reduced checkout latency by 180ms'.`,
        },
        {
          title: 'No skip-level visibility or committee advocacy beyond direct manager',
          category: 'Visibility and sponsorship',
          whyItBlocks: `At ${companyName}, Director-level calibration committees review ${nextLevelCode} promotions. If your Engineering Director or peer tech leads have not heard of your work, your manager cannot defend the case.`,
          evidenceToCounter: `Lead brownbag tech talks, contribute to org-wide architecture reviews, and present key quarter deliverables in departmental town halls.`,
        },
        {
          title: 'Org headcount quotas or constrained promotion budget in business unit',
          category: 'Headcount, budget and org factors',
          whyItBlocks: `Many organizations enforce strict bell curves and tier-wise budget caps per cycle. Even solid performers get deferred when the org quota is exhausted by critical business units.`,
          evidenceToCounter: `Demonstrate mission-critical indispensability to core business initiatives and align with management on multi-cycle promo pipeline priority.`,
        },
        {
          title: 'Absence of proactive mentorship and talent force-multiplication',
          category: 'Behavior and collaboration',
          whyItBlocks: `${nextLevelCode} engineers must multiply their team's output. Working as a brilliant solo contributor without mentoring juniors or elevating team coding standards triggers a calibration block.`,
          evidenceToCounter: `Document regular 1:1 mentorship of 1-2 junior engineers, authored team runbooks, and leading postmortem reviews without blame.`,
        },
        {
          title: 'Recent rating dip or manager turnover right before calibration cycle',
          category: 'Performance history',
          whyItBlocks: `A manager transition within 3-4 months of the cycle often delays promotions because the new manager lacks historical context and credibility to defend the candidate in committee.`,
          evidenceToCounter: `Maintain an up-to-date running 'Brag Document' with verified timestamps, peer recommendations, and measurable outcomes to hand off to the new manager.`,
        },
      ];

    case 'senior':
      return [
        {
          title: 'Scope limited to single team roadmap instead of org-wide technical strategy',
          category: 'Scope too small',
          whyItBlocks: `Staff-level (${nextLevelCode}) at ${companyName} requires driving strategic initiatives across 3+ squads or an entire business domain. Managing single-team sprints is considered senior IC scope, not staff.`,
          evidenceToCounter: `Architect and drive a multi-team cross-cutting initiative (e.g. unified authentication, migration to event-driven core, org-wide security compliance).`,
        },
        {
          title: 'No VP/Director-level business case justifying the Staff Engineer seat',
          category: 'Headcount, budget and org factors',
          whyItBlocks: `Staff-level titles are strictly headcount-controlled at ${companyName}. Without an open organizational business need for a Staff Engineer to govern a major initiative, the packet is frozen.`,
          evidenceToCounter: `Collaborate with your Director/VP to identify an open multi-million rupee architectural bottleneck and formally step into the tech lead role for it.`,
        },
        {
          title: 'Failure to de-risk high-ambiguity projects before committee review',
          category: 'Impact not measurable',
          whyItBlocks: `Staff candidates are expected to anticipate technical failures, platform scaling bottlenecks, and compliance vulnerabilities 6-12 months before they materialize.`,
          evidenceToCounter: `Provide disaster recovery drills, automated failure-injection tests (chaos engineering), and long-term tech roadmaps adopted across the business pillar.`,
        },
        {
          title: 'Lack of vocal sponsorship across peer Staff/Principal engineers in calibration',
          category: 'Visibility and sponsorship',
          whyItBlocks: `Staff promo packets must pass review by a centralized Staff Calibration Council. If existing Staff/Principal engineers review the packet and vote neutral or negative, promotion is denied.`,
          evidenceToCounter: `Partner with Staff+ engineers across the company on RFC reviews, engineering councils, and invite them to critique your high-impact design proposals early.`,
        },
        {
          title: 'Over-indexing on coding tickets while neglecting organizational influence',
          category: 'Behavior and collaboration',
          whyItBlocks: `Senior engineers who remain heads-down in IDE without driving company RFC standards, interviewing, or shaping engineering culture cannot cross into Staff level.`,
          evidenceToCounter: `Author company-wide engineering best-practice standards, speak at internal tech summits, and lead interviewer training programs.`,
        },
        {
          title: 'Packet lacks proof of operating at Staff level for 12+ sustained months',
          category: 'Process and calibration',
          whyItBlocks: `The bar for Staff promotion is 'ready now with undeniable sustained track record'. Any perception that the candidate is merely 'promising' results in immediate deferral.`,
          evidenceToCounter: `Compile 4 quarters of measurable cross-team deliverables where you were recognized by peer managers as the de facto technical authority.`,
        },
      ];

    case 'staff':
    case 'principal':
      return [
        {
          title: 'Initiatives lack executive and company-wide strategic enterprise impact',
          category: 'Scope too small',
          whyItBlocks: `Principal and Distinguished tiers at ${companyName} require reshaping company technology strategy, patent portfolios, or unlocking ₹50Cr+ annual business capabilities.`,
          evidenceToCounter: `Present multi-year technology architectures approved by CTO/VP, patented core systems, or foundational platforms underpinning 50%+ of company revenue.`,
        },
        {
          title: 'Executive committee and VP alignment absent in promo package',
          category: 'Visibility and sponsorship',
          whyItBlocks: `Promotions at this tier require direct endorsement from VP of Engineering and CTO. Lack of executive alignment results in immediate packet rejection.`,
          evidenceToCounter: `Direct sponsorship letters from Vice Presidents confirming company-wide transformation delivered under your technical stewardship.`,
        },
        {
          title: 'Macro economic headcount freeze or executive band quotas',
          category: 'Headcount, budget and org factors',
          whyItBlocks: `Principal engineer titles are capped at 1-3% of total engineering headcount globally. Vacancies must be explicitly approved by executive leadership.`,
          evidenceToCounter: `Establish clear succession planning and demonstrate that your technical leadership directly impacts enterprise valuation or massive operational risk reduction.`,
        },
        {
          title: 'Industry and open-source external footprint insufficient',
          category: 'Visibility and sponsorship',
          whyItBlocks: `Principal and Fellow levels require external industry credibility—keynotes, top-tier conference publications, standard-setting consortiums, or renowned open-source libraries.`,
          evidenceToCounter: `Document keynote presentations at international tech summits, published research papers, or leadership roles in industry standard working groups.`,
        },
        {
          title: 'Impact not validated by multi-year business P&L outcomes',
          category: 'Impact not measurable',
          whyItBlocks: `At this level, engineering impact must directly correlate with enterprise balance sheets, customer retention at scale, or generational platform cost reductions.`,
          evidenceToCounter: `Audited financial metrics and CFO/VP validated data demonstrating measurable multi-crore efficiency gains or new revenue lines unlocked.`,
        },
        {
          title: 'Failure to groom the next generation of Staff and Senior tech leads',
          category: 'Behavior and collaboration',
          whyItBlocks: `Technical luminaries who work in isolation without raising the technical ceiling of dozens of senior engineers fail the principal leadership covenant.`,
          evidenceToCounter: `Showcase documented promotion paths of 4-5 engineers you personally mentored into Senior and Staff engineering levels.`,
        },
      ];

    case 'manager':
    case 'director':
      return [
        {
          title: 'Managing only direct team execution without second-line or org-scale leadership',
          category: 'Scope too small',
          whyItBlocks: `Promoting to Senior Manager or Director at ${companyName} requires managing managers, defining department headcount budgets, and overseeing 30-100+ engineers.`,
          evidenceToCounter: `Document successful transition to managing 2-3 engineering managers, defining multi-million rupee hiring roadmaps, and org restructuring.`,
        },
        {
          title: 'High attrition rate or low employee engagement in team pulse surveys',
          category: 'Behavior and collaboration',
          whyItBlocks: `A manager whose squad has high turnover, burnout indicators, or low engagement scores in quarterly surveys will be blocked by HR and leadership calibration.`,
          evidenceToCounter: `Maintain 90%+ retention of top performers, positive engagement pulse scores, and multiple internal promotion success stories within your org.`,
        },
        {
          title: 'Engineering delivery detached from business revenue and product KPIs',
          category: 'Impact not measurable',
          whyItBlocks: `Engineering leadership at this level is evaluated on product velocity, uptime SLAs, and business revenue impact. Delivering features that do not move metrics blocks promo.`,
          evidenceToCounter: `Present quarterly business reviews (QBRs) co-signed by Product and Business VPs showing target KPI achievement.`,
        },
        {
          title: 'Sponsorship missing from VP / C-suite calibration review',
          category: 'Visibility and sponsorship',
          whyItBlocks: `Director and Senior Manager promotions are decided in closed executive calibration panels where peer Directors and VPs must voice strong support.`,
          evidenceToCounter: `Lead cross-department engineering councils, participate in budget allocations, and build close alignment with VP of Product and VP of Engineering.`,
        },
        {
          title: 'Org budget freezes, hiring slowdowns, or restructuring',
          category: 'Headcount, budget and org factors',
          whyItBlocks: `Executive promotions require an open management charter. If business targets are flat or restructuring is underway, management promotions are paused.`,
          evidenceToCounter: `Demonstrate capability to optimize existing teams, consolidate duplicate systems, and maintain throughput under strict budget constraints.`,
        },
        {
          title: 'Over-involvement in low-level coding at the expense of talent development',
          category: 'Process and calibration',
          whyItBlocks: `Managers who remain hands-on coders rather than empowering tech leads, coaching engineers, and driving cross-functional alignment are seen as misaligned with management expectations.`,
          evidenceToCounter: `Show delegation matrices, clear delegation of technical decisions to Staff/Senior ICs, and focus on strategic execution and talent calibration.`,
        },
      ];
  }
}
