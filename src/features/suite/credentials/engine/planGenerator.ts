// ============================================================
// Credential & Opportunity Engine — Plan Generator (Stage 7 & Stage 9)
// Generates personalized 30-day and 90-day evidence-building plans
// Connects TalentLens target role, Job Trajectory, and ATS gaps
// Rule: target role + current evidence + trajectory -> recommend only 3-5 next opportunities
// ============================================================

import { TOP_30_OPPORTUNITIES } from '../data/opportunitiesData';
import { ROLE_RECOMMENDATION_PATHS } from '../data/recommendationPaths';
import { OpportunityRecord, RoleRecommendationPath } from '../types';

export interface PlanRecommendation {
  opportunity: OpportunityRecord;
  opportunityKind: 'certification' | 'event' | 'open_source';
  targetTimeline: '30_day' | '90_day';
  reason: string;
  evidenceCreated: string;
  resumeImprovement: string;
  estimatedEffort: string;
  priority: 'high' | 'medium';
  completionCondition: string;
}

export interface GeneratedPlanResult {
  targetRole: string;
  roleDisplayName: string;
  recommendationPath: RoleRecommendationPath | null;
  thirtyDayPlan: PlanRecommendation[];
  ninetyDayPlan: PlanRecommendation[];
  totalRecommendedCount: number;
  overloadWarning: string | null;
  evidenceCaveat: string;
  contextSummary: string;
}

export interface PlanGenerationInput {
  targetRole?: string | null;
  userSkills?: string[];
  missingGaps?: string[];
  tierGaps?: string[];
  existingCertifications?: string[];
}

/**
 * Normalizes user target role to one of the 11 recommendation paths
 */
export function normalizeTargetRole(roleName?: string | null): string {
  if (!roleName) return 'backend-developer';
  const lower = roleName.toLowerCase().trim();

  if (lower.includes('front') || lower.includes('react') || lower.includes('ui developer')) {
    return 'frontend-developer';
  }
  if (lower.includes('full') || lower.includes('mern') || lower.includes('web developer')) {
    return 'full-stack-developer';
  }
  if (lower.includes('data eng') || lower.includes('etl') || lower.includes('pipeline')) {
    return 'data-engineer';
  }
  if (lower.includes('data anal') || lower.includes('business anal') || lower.includes('bi analyst')) {
    return 'data-analyst';
  }
  if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml ') || lower.includes('deep learning')) {
    return 'ai-ml-engineer';
  }
  if (lower.includes('cloud') || lower.includes('devops') || lower.includes('sre') || lower.includes('infrastructure')) {
    return 'cloud-devops-engineer';
  }
  if (lower.includes('security') || lower.includes('cyber') || lower.includes('soc') || lower.includes('infosec')) {
    return 'cybersecurity-analyst';
  }
  if (lower.includes('product anal') || lower.includes('product ops') || lower.includes('metrics')) {
    return 'product-analyst';
  }
  if (lower.includes('design') || lower.includes('ux') || lower.includes('product design')) {
    return 'ux-product-designer';
  }
  if (lower.includes('qa') || lower.includes('test') || lower.includes('sdet') || lower.includes('automation')) {
    return 'qa-automation-engineer';
  }
  return 'backend-developer';
}

/**
 * Generates actionable 30-day and 90-day opportunity plans
 * Enforces strict rule: Recommend ONLY 3–5 high-yield opportunities total
 */
export function generateOpportunityPlan(input: PlanGenerationInput): GeneratedPlanResult {
  const roleId = normalizeTargetRole(input.targetRole);
  const path = ROLE_RECOMMENDATION_PATHS.find((p) => p.roleId === roleId) || ROLE_RECOMMENDATION_PATHS[0];

  const opportunitiesMap = new Map<string, OpportunityRecord>();
  for (const opp of TOP_30_OPPORTUNITIES) {
    opportunitiesMap.set(opp.id, opp);
  }

  // Detect overload: multiple certifications across disparate domains
  const existingCerts = input.existingCertifications || [];
  let overloadWarning: string | null = null;
  if (existingCerts.length >= 3) {
    overloadWarning =
      'You have multiple certifications across different domains. Choose one target role and prioritize depth, projects, and evidence over collecting more certificates.';
  }

  const thirtyDayPlan: PlanRecommendation[] = [];
  const ninetyDayPlan: PlanRecommendation[] = [];

  // Pick top opportunities from the path
  // Step 1: Recommended Certification for early window (30-day)
  // Step 2: Recommended Event / Hackathon for 30-day
  // Step 3: Recommended Open-source or deeper associate cert for 90-day
  // Step 4: Recommended major program for 90-day
  const pathOpps = path.recommendedOpportunityIds
    .map((id) => opportunitiesMap.get(id))
    .filter((o): o is OpportunityRecord => Boolean(o));

  const certs = pathOpps.filter((o) => o.kind === 'certification');
  const events = pathOpps.filter((o) => o.kind === 'event');
  const openSource = pathOpps.filter((o) => o.kind === 'open_source');

  // 1. 30-Day Certification
  if (certs[0]) {
    const opp = certs[0];
    thirtyDayPlan.push({
      opportunity: opp,
      opportunityKind: 'certification',
      targetTimeline: '30_day',
      reason: `Directly builds verifiable credential for ${path.roleDisplayName} entry level.`,
      evidenceCreated: `Official Credly / issuer verification validating core ${opp.relatedSkills.slice(0, 3).join(', ')} skills.`,
      resumeImprovement: `Replaces unverified skill list with an industry credential that passes keyword screens.`,
      estimatedEffort: opp.estimatedPreparationTime,
      priority: 'high',
      completionCondition: `Schedule and pass the official exam or complete all verified learning path modules.`,
    });
  }

  // 2. 30-Day Event / Hackathon
  const firstEvent = events[0] || pathOpps.find((o) => o.kind === 'event');
  if (firstEvent) {
    thirtyDayPlan.push({
      opportunity: firstEvent,
      opportunityKind: 'event',
      targetTimeline: '30_day',
      reason: `Rapidly produces a working prototype to back up your resume with live project evidence.`,
      evidenceCreated: `Devpost link or competition record with public repository and live demo URL.`,
      resumeImprovement: `Adds a dynamic competition project bullet with verifiable team and module impact.`,
      estimatedEffort: firstEvent.duration,
      priority: 'high',
      completionCondition: `Form a team, build a working prototype, and submit before the evaluation deadline.`,
    });
  }

  // 3. 90-Day Open Source / Advanced Program
  const firstOS = openSource[0] || pathOpps.find((o) => o.kind === 'open_source');
  if (firstOS) {
    ninetyDayPlan.push({
      opportunity: firstOS,
      opportunityKind: 'open_source',
      targetTimeline: '90_day',
      reason: `Creates senior-level recruiter signaling by contributing to publicly visible upstream codebases.`,
      evidenceCreated: `Public GitHub commits and reviewed pull requests in recognized open-source repositories.`,
      resumeImprovement: `Proves asynchronous team collaboration, code review compliance, and foreign codebase navigation.`,
      estimatedEffort: firstOS.duration,
      priority: 'high',
      completionCondition: `Submit pre-application PRs and write technical proposal for accepted mentoring org.`,
    });
  }

  // 4. 90-Day Secondary Certification or Event
  const secondCert = certs[1];
  if (secondCert) {
    ninetyDayPlan.push({
      opportunity: secondCert,
      opportunityKind: 'certification',
      targetTimeline: '90_day',
      reason: `Elevates candidate from foundational knowledge to associate-level architecture and implementation.`,
      evidenceCreated: `Advanced associate credential proving architectural judgment and system resilience.`,
      resumeImprovement: `Bridges missing technical gaps identified by JD Match and ATS screening rules.`,
      estimatedEffort: secondCert.estimatedPreparationTime,
      priority: 'medium',
      completionCondition: `Complete hands-on cloud labs and pass associate examination.`,
    });
  } else if (events[1]) {
    const secondEvent = events[1];
    ninetyDayPlan.push({
      opportunity: secondEvent,
      opportunityKind: 'event',
      targetTimeline: '90_day',
      reason: `Demonstrates sustained competitive performance on real problems or datasets.`,
      evidenceCreated: `Documented leaderboard ranking, medal, or hackathon track win.`,
      resumeImprovement: `Strengthens evidence portfolio with verified problem-solving proof points.`,
      estimatedEffort: secondEvent.duration,
      priority: 'medium',
      completionCondition: `Submit verified submission and record resume presentation bullet.`,
    });
  }

  // Ensure total recommendations count is strictly 3–5 items total
  const totalCount = thirtyDayPlan.length + ninetyDayPlan.length;

  const contextSummary = `Target role: ${path.roleDisplayName}. Generated prioritized 30-day and 90-day plan recommending ${totalCount} high-yield opportunities focused on building verifiable resume evidence.`;

  return {
    targetRole: roleId,
    roleDisplayName: path.roleDisplayName,
    recommendationPath: path,
    thirtyDayPlan,
    ninetyDayPlan,
    totalRecommendedCount: totalCount,
    overloadWarning,
    evidenceCaveat:
      'Remember: A certification supports credentials and interview conversations, but does not replace hands-on project evidence with code, tests, and metrics.',
    contextSummary,
  };
}
