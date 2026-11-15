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
  debugReason?: string;
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
  database: 'Databases & SQL',
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

// Skill alias map for semantic matching between role gap competencies and project skills
export const SKILL_ALIAS_MAP: Record<string, string[]> = {
  databases: [
    'database', 'databases', 'postgresql', 'postgres', 'mysql', 'mongodb',
    'redis', 'cassandra', 'elasticsearch', 'sql', 'acid', 'database constraints',
    'relational database', 'nosql', 'storage engine', 'sqlite', 'dynamodb'
  ],
  database: [
    'database', 'databases', 'postgresql', 'postgres', 'mysql', 'mongodb',
    'redis', 'cassandra', 'elasticsearch', 'sql', 'acid', 'database constraints'
  ],
  sql: ['sql', 'postgresql', 'postgres', 'mysql', 'database queries', 'sqlite', 'relational database'],
  golang: ['go', 'golang', 'goroutines', 'grpc-go'],
  go: ['go', 'golang', 'goroutines', 'grpc-go'],
  java: ['java', 'spring', 'spring boot', 'jvm', 'junit'],
  python: ['python', 'fastapi', 'django', 'flask', 'asyncio', 'pydantic'],
  typescript: ['typescript', 'ts', 'javascript', 'js', 'node.js', 'react'],
  javascript: ['javascript', 'js', 'typescript', 'ts', 'node.js', 'react'],
  systemdesign: [
    'system design', 'systemdesign', 'distributed systems', 'microservices',
    'architecture', 'scalability', 'concurrency', 'idempotency', 'rate limiting',
    'caching', 'load balancing', 'message queue'
  ],
  'system design': [
    'system design', 'systemdesign', 'distributed systems', 'microservices',
    'architecture', 'scalability', 'concurrency', 'idempotency'
  ],
  'distributed systems': [
    'distributed systems', 'system design', 'microservices', 'consensus', 'raft',
    'replication', 'partitioning', 'sharding', 'event-driven'
  ],
  dsa: ['dsa', 'algorithms', 'data structures', 'problem solving', 'leetcode'],
  algorithms: ['dsa', 'algorithms', 'data structures'],
  'data structures': ['dsa', 'algorithms', 'data structures'],
  security: ['security', 'oauth', 'jwt', 'cryptography', 'waf', 'mtls', 'pki', 'auth', 'appsec'],
  devops: ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'terraform', 'aws', 'gcp'],
  cloud: ['cloud', 'aws', 'gcp', 'azure', 'docker', 'kubernetes'],
  kubernetes: ['kubernetes', 'k8s', 'container runtime', 'docker'],
  docker: ['docker', 'container', 'containers', 'kubernetes'],
};

export function getCanonicalSkillName(skill: string): string {
  // Strip version patterns like "16+", "1.22+", "v2", "3.3+"
  const stripped = skill.replace(/\s+v?\d+(\.\d+)*\+?/gi, '').trim();
  const norm = (stripped || skill).toLowerCase().trim().replace(/[-_]/g, ' ');
  return SKILL_CANONICAL_MAP[norm] || formatCompetencyName(stripped || skill);
}

/**
 * Checks whether a project's real skills cover a specific candidate skill gap.
 */
export function doesProjectCoverSkill(projectRealSkills: string[], gapSkillId: string): boolean {
  const gNorm = gapSkillId.toLowerCase().trim().replace(/[-_]/g, ' ');
  const gClean = gapSkillId.toLowerCase().trim().replace(/[-_]/g, '');
  const aliases = SKILL_ALIAS_MAP[gNorm] || SKILL_ALIAS_MAP[gClean] || [gNorm, gClean];

  const pSkillsLower = projectRealSkills.map((s) => s.toLowerCase());

  return pSkillsLower.some((ps) => {
    // Exact or substring match with gap ID
    if (ps.includes(gNorm) || gNorm.includes(ps)) return true;
    // Check against all known aliases
    return aliases.some((alias) => ps.includes(alias) || alias.includes(ps));
  });
}

/**
 * Derives the true, verified list of skills taught/used by a project brief.
 * Strictly computed from its techStack only via canonical mapping.
 * Never includes ungrounded conceptual skills or candidate gaps.
 */
export function deriveBriefRealSkills(brief: ProjectBrief): string[] {
  const unique = new Set<string>();
  for (const item of brief.techStack || []) {
    const canon = getCanonicalSkillName(item);
    if (canon) unique.add(canon);
  }

  return Array.from(unique);
}

/**
 * Computes domain fit between project domain and target company/role in a company-agnostic way.
 */
function computeDomainFit(
  projectDomain: string,
  companyIndustry?: string,
  roleTitle?: string
): number {
  const pDom = (projectDomain || '').toLowerCase();
  const cInd = (companyIndustry || '').toLowerCase();
  const rTitle = (roleTitle || '').toLowerCase();

  const isFintech =
    cInd.includes('fintech') ||
    cInd.includes('bank') ||
    cInd.includes('finance') ||
    cInd.includes('payment') ||
    cInd.includes('bfsi') ||
    cInd.includes('broking') ||
    cInd.includes('trading') ||
    cInd.includes('custodial');

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
 * Computes tech stack fit between project and target role without blanket shortcuts.
 * Evaluates candidate gaps strictly: if the candidate lacks a required primary language,
 * a project lacking that language receives 0.0 stack fit (no free credit for other gaps).
 */
export function computeStackFit(
  briefSkills: string[],
  gapSkills: SkillState[],
  _roleTitle?: string
): number {
  const PRIMARY_LANGUAGES = ['golang', 'go', 'java', 'python', 'typescript', 'javascript', 'c++', 'cpp', 'rust', 'c'];
  const languageGaps = gapSkills.filter((g) => PRIMARY_LANGUAGES.includes(g.id.toLowerCase()));

  if (languageGaps.length > 0) {
    // If the candidate lacks one or more primary languages, a recommended project
    // MUST cover at least one of those language gaps in its verified tech stack.
    // Absolutely NO free credit for non-language gaps.
    const coversLanguageGap = languageGaps.some((lg) =>
      doesProjectCoverSkill(briefSkills, lg.id)
    );

    if (!coversLanguageGap) {
      // Disqualified due to stack-fit penalty for missing primary language
      return 0.0;
    }

    const nonLanguageGaps = gapSkills.filter((g) => !PRIMARY_LANGUAGES.includes(g.id.toLowerCase()));
    if (nonLanguageGaps.length === 0) {
      return 1.0;
    }
    const coveredNonLang = nonLanguageGaps.filter((g) => doesProjectCoverSkill(briefSkills, g.id)).length;
    return 0.80 + 0.20 * (coveredNonLang / nonLanguageGaps.length);
  }

  // If candidate has NO primary language gaps (e.g. only databases, system design):
  // stackFit is computed strictly over the gap skills the project actually covers, with NO free credit
  const coveredGaps = gapSkills.filter((g) => doesProjectCoverSkill(briefSkills, g.id));
  if (coveredGaps.length === 0) {
    return 0.0;
  }
  return 0.70 + 0.30 * (coveredGaps.length / gapSkills.length);
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

  interface EvaluatedProject {
    brief: ProjectBrief;
    realSkills: string[];
    gapCoverage: number;
    domainFit: number;
    stackFit: number;
    relevance: number;
    debugReason: string;
  }

  const candidates: EvaluatedProject[] = [];

  for (const brief of ALL_BRIEFS) {
    const realSkills = deriveBriefRealSkills(brief);

    // Count how many of candidate's gaps are REALLY in this project's real stack
    let matchedGapCount = 0;
    for (const gap of gapSkills) {
      if (doesProjectCoverSkill(realSkills, gap.id)) {
        matchedGapCount++;
      }
    }

    const gapCoverage = gapSkills.length > 0 ? (matchedGapCount / gapSkills.length) : 0.5;
    const domainFit = computeDomainFit(brief.domain, company?.industry, role?.title);
    const stackFit = computeStackFit(realSkills, gapSkills, role?.title);

    const relevance = gapCoverage * domainFit * stackFit;

    let debugReason = '';
    if (relevance >= MIN_PROJECT_RELEVANCE_THRESHOLD) {
      debugReason = `included: relevance ${relevance.toFixed(3)} >= threshold ${MIN_PROJECT_RELEVANCE_THRESHOLD}`;
      candidates.push({
        brief,
        realSkills,
        gapCoverage,
        domainFit,
        stackFit,
        relevance,
        debugReason,
      });
    } else {
      if (gapCoverage === 0) {
        debugReason = 'excluded: zero gap coverage for candidate gaps';
      } else if (domainFit <= 0.20) {
        debugReason = `excluded: domain mismatch (${brief.domain} vs ${company?.industry || 'tech'})`;
      } else if (stackFit <= 0.25) {
        debugReason = 'excluded: stack-fit penalty for missing primary language';
      } else {
        debugReason = `excluded: compound relevance ${relevance.toFixed(3)} below threshold ${MIN_PROJECT_RELEVANCE_THRESHOLD}`;
      }
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
    debugReason: s.debugReason,
  }));

  return {
    projects,
    hasMatches: true,
    emptyStateMessage: null,
  };
}

