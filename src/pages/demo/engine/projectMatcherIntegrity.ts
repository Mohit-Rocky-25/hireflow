// ============================================================
// HireFlow — Project Recommendation Integrity Engine (Stage 3)
// Enforces:
// 1. "Covers" is strictly derived from each project's real stack.
//    Never copied from candidate gaps (fixes D1).
// 2. Relevance = gap coverage * domain fit * stack fit (fixes D2).
// 3. Named constants for thresholds, max 2 recommendations.
// 4. Honest fallback when none pass threshold.
// 5. Preserves existing library without inventing projects.
// ============================================================

import briefsData from '../../../data/suite/project-briefs.json';
import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';
import { SkillState } from './skillStateEngine';
import { formatCompetencyName } from '../talentLensEngine';

export const MIN_PROJECT_RELEVANCE_THRESHOLD = 0.20;
export const MAX_RECOMMENDED_PROJECTS = 2;

export interface RecommendedProjectDrop {
  id: string;
  title: string;
  domain: string;
  difficulty: string;
  estimatedHours: number;
  hoursDisplay: string;
  coveredSkills: string[];
  relevanceScore: number;
  problemStatement: string;
  architecture: string;
  recruiterSignal: string;
  portfolioBulletFormula: string;
  deliverables: string[];
}

export interface ProjectRecommendationResult {
  projects: RecommendedProjectDrop[];
  hasMatches: boolean;
  emptyStateMessage: string | null;
}

const ALL_BRIEFS: ProjectBrief[] = briefsData as ProjectBrief[];

// Skill normalization map
const SKILL_CANONICAL_MAP: Record<string, string> = {
  go: 'Go',
  golang: 'Go',
  java: 'Java',
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  react: 'React',
  'react.js': 'React',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  fastapi: 'FastAPI',
  'spring boot': 'Spring Boot',
  spring: 'Spring Boot',
  dsa: 'DSA',
  algorithms: 'DSA',
  'data structures': 'DSA',
  systemdesign: 'System Design',
  'system design': 'System Design',
  'distributed systems': 'Distributed Systems',
  concurrency: 'Concurrency',
  sql: 'SQL',
  databases: 'Databases & SQL',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  kafka: 'Kafka',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  aws: 'AWS',
  gcp: 'GCP',
  microservices: 'Microservices',
  grpc: 'gRPC',
};

export function getCanonicalSkillName(skill: string): string {
  const norm = skill.toLowerCase().trim().replace(/[-_]/g, ' ');
  return SKILL_CANONICAL_MAP[norm] || formatCompetencyName(skill);
}

/**
 * Derives the true, verified list of skills taught/used by a project brief.
 * Strictly computed from its techStack and coveredSkills.
 * NEVER copied from candidate gaps.
 */
export function deriveBriefRealSkills(brief: ProjectBrief): string[] {
  const combined = [
    ...(brief.techStack || []),
    ...(brief.coveredSkills || []),
  ];

  const unique = new Set<string>();
  for (const item of combined) {
    const canon = getCanonicalSkillName(item);
    if (canon) unique.add(canon);
  }

  return Array.from(unique);
}

/**
 * Computes domain fit between project domain and target company/role
 */
function computeDomainFit(
  projectDomain: string,
  companyIndustry?: string,
  companyName?: string,
  roleTitle?: string
): number {
  const pDom = (projectDomain || '').toLowerCase();
  const cInd = (companyIndustry || '').toLowerCase();
  const cName = (companyName || '').toLowerCase();
  const rTitle = (roleTitle || '').toLowerCase();

  const isFintech = cInd.includes('fintech') || cInd.includes('bank') || /cred|razorpay|phonepe|groww|zerodha|paytm/i.test(cName);
  const isAIMLRole = rTitle.includes('ml') || rTitle.includes('ai') || rTitle.includes('data');

  if (isFintech && !isAIMLRole) {
    // For fintech backend/core engineering:
    if (pDom.includes('fintech') || pDom.includes('ledger') || pDom.includes('accounting')) return 1.0;
    if (pDom.includes('distributed') || pDom.includes('high-scale backend') || pDom.includes('security') || pDom.includes('cryptography')) return 0.85;
    if (pDom.includes('cloud') || pDom.includes('streaming') || pDom.includes('data platform')) return 0.75;
    if (pDom.includes('full-stack') || pDom.includes('web')) return 0.5;
    if (pDom.includes('ai/ml') || pDom.includes('computer vision') || pDom.includes('generative ai') || pDom.includes('llmops')) {
      // Irrelevant for fintech core campus role (Fixes D2)
      return 0.1;
    }
  }

  if (isAIMLRole) {
    if (pDom.includes('ai') || pDom.includes('ml') || pDom.includes('llm') || pDom.includes('inference')) return 1.0;
    if (pDom.includes('data') || pDom.includes('streaming')) return 0.8;
    return 0.2;
  }

  // Default balanced domain fit
  if (pDom.includes('distributed') || pDom.includes('backend') || pDom.includes('cloud')) return 0.85;
  if (pDom.includes('security') || pDom.includes('fintech')) return 0.8;
  return 0.6;
}

/**
 * Computes tech stack fit between project and target role
 */
function computeStackFit(
  briefSkills: string[],
  gapSkills: SkillState[],
  roleTitle?: string
): number {
  const briefSkillsLower = briefSkills.map((s) => s.toLowerCase());

  // Check if role requires specific primary languages (e.g. Go, Java, Python)
  const roleRequiresGo = gapSkills.some((g) => g.id === 'golang' || g.id === 'go');
  const briefHasGo = briefSkillsLower.some((s) => s.includes('go') || s === 'golang');

  if (roleRequiresGo) {
    // If the candidate has a Go gap, projects with Go get high stack fit, non-Go get low fit
    return briefHasGo ? 1.0 : 0.2;
  }

  const roleRequiresJava = gapSkills.some((g) => g.id === 'java');
  const briefHasJava = briefSkillsLower.some((s) => s.includes('java') || s.includes('spring'));
  if (roleRequiresJava) {
    return briefHasJava ? 1.0 : 0.25;
  }

  return 0.75;
}

/**
 * Matches target role gaps to project briefs with strict integrity gating.
 */
export function matchProjectsWithIntegrity(params: {
  skillStates: SkillState[];
  company?: { name?: string; industry?: string; tier?: string };
  role?: { title?: string; level?: string };
}): ProjectRecommendationResult {
  const { skillStates, company, role } = params;

  // Candidate gaps that need proof-of-work
  const gapSkills = skillStates.filter((s) => s.status === 'not-found' || s.status === 'mentioned');
  const gapNamesLower = gapSkills.map((g) => g.id.toLowerCase());

  interface EvaluatedProject {
    brief: ProjectBrief;
    realSkills: string[];
    gapCoverage: number;
    domainFit: number;
    stackFit: number;
    relevance: number;
  }

  const candidates: EvaluatedProject[] = [];

  for (const brief of ALL_BRIEFS) {
    const realSkills = deriveBriefRealSkills(brief);
    const realSkillsLower = realSkills.map((s) => s.toLowerCase());

    // Count how many of candidate's gaps are REALLY in this project's real stack
    let matchedGapCount = 0;
    for (const gap of gapSkills) {
      const gLower = gap.id.toLowerCase();
      const isCovered = realSkillsLower.some((rs) => rs.includes(gLower) || gLower.includes(rs));
      if (isCovered) matchedGapCount++;
    }

    const gapCoverage = gapSkills.length > 0 ? (matchedGapCount / gapSkills.length) : 0.5;
    const domainFit = computeDomainFit(brief.domain, company?.industry, company?.name, role?.title);
    const stackFit = computeStackFit(realSkills, gapSkills, role?.title);

    const relevance = gapCoverage * domainFit * stackFit;

    if (relevance >= MIN_PROJECT_RELEVANCE_THRESHOLD) {
      candidates.push({
        brief,
        realSkills,
        gapCoverage,
        domainFit,
        stackFit,
        relevance,
      });
    }
  }

  // Sort descending by relevance
  candidates.sort((a, b) => b.relevance - a.relevance);

  const selected = candidates.slice(0, MAX_RECOMMENDED_PROJECTS);

  if (selected.length === 0) {
    return {
      projects: [],
      hasMatches: false,
      emptyStateMessage: 'No project in the current library matches the missing skills for this role.',
    };
  }

  const projects: RecommendedProjectDrop[] = selected.map((s) => ({
    id: s.brief.id,
    title: s.brief.title,
    domain: s.brief.domain,
    difficulty: s.brief.difficulty,
    estimatedHours: s.brief.estimatedHours || 0,
    hoursDisplay: s.brief.estimatedHours ? `~${s.brief.estimatedHours} hrs` : 'estimate unavailable',
    coveredSkills: s.realSkills, // STRICTLY REAL SKILLS (Fixes D1)
    relevanceScore: Number(s.relevance.toFixed(2)),
    problemStatement: s.brief.problemStatement,
    architecture: s.brief.architecture,
    recruiterSignal: s.brief.recruiterSignal || '',
    portfolioBulletFormula: s.brief.portfolioBulletFormula,
    deliverables: (s.brief.milestones || []).map((m) => `${m.title}: ${m.doneWhen}`),
  }));

  return {
    projects,
    hasMatches: true,
    emptyStateMessage: null,
  };
}

