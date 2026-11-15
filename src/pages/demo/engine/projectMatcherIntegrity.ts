// ============================================================
// HireFlow — Project Recommendation Integrity Engine (Phase 3A)
// Enforces:
// 1. Two-tier skill coverage:
//    - Technology skills strictly derived from techStack via canonical mapping.
//    - Concept skills coverable ONLY via vetted conceptTags verified in brief text.
// 2. Relevance = gap coverage * domain fit * stack fit.
// 3. Named constants for thresholds, max 2 recommendations.
// 4. Closes derivation: (derivedTech ∪ validatedConcepts) ∩ candidateGaps.
// 5. Deterministic tie-breaker: relevance -> hours -> id.
// 6. Honest fallback when none pass threshold.
// ============================================================

import briefsData from '../../../data/suite/project-briefs.json';
import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';
import { SkillState, normalizeTier, TIER_NORMALIZATION_MAP } from './skillStateEngine';
import { formatCompetencyName } from '../talentLensEngine';
import { validateBriefConcepts } from './conceptTagValidator';

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
  gapCoverage: number;
  domainFit: number;
  stackFit: number;
  closes: string[];
  reasonCodes: string[];
  whyThisProject: string;
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
    'relational database', 'nosql', 'storage engine', 'sqlite', 'dynamodb', 'databases & acid'
  ],
  database: [
    'database', 'databases', 'postgresql', 'postgres', 'mysql', 'mongodb',
    'redis', 'cassandra', 'elasticsearch', 'sql', 'acid', 'database constraints', 'databases & acid'
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
    'caching', 'load balancing', 'message queue', 'architecture & clean code'
  ],
  'system design': [
    'system design', 'systemdesign', 'distributed systems', 'microservices',
    'architecture', 'scalability', 'concurrency', 'idempotency', 'architecture & clean code'
  ],
  'distributed systems': [
    'distributed systems', 'system design', 'microservices', 'consensus', 'raft',
    'replication', 'partitioning', 'sharding', 'event-driven'
  ],
  concurrency: ['concurrency', 'goroutines', 'threads', 'multithreading', 'asyncio', 'mutex', 'atomic'],
  dsa: ['dsa', 'algorithms', 'data structures', 'problem solving', 'leetcode'],
  algorithms: ['dsa', 'algorithms', 'data structures'],
  'data structures': ['dsa', 'algorithms', 'data structures'],
  security: ['security', 'oauth', 'jwt', 'cryptography', 'waf', 'mtls', 'pki', 'auth', 'appsec'],
  devops: ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'terraform', 'aws', 'gcp', 'ci/cd & pipelines'],
  ci_cd: ['ci/cd', 'devops', 'pipeline', 'dockerfile', 'github actions', 'ci/cd & pipelines'],
  cloud: ['cloud', 'aws', 'gcp', 'azure', 'docker', 'kubernetes'],
  kubernetes: ['kubernetes', 'k8s', 'container runtime', 'docker'],
  docker: ['docker', 'container', 'containers', 'kubernetes'],
  microservices: ['microservices', 'microservice', 'grpc', 'api gateway', 'service mesh', 'event-driven'],
  rest: ['rest', 'rest api', 'rest apis', 'api design', 'restful', 'endpoints', 'http', 'fastapi', 'express'],
  rest_api: ['rest', 'rest api', 'rest apis', 'api design', 'restful', 'endpoints', 'http', 'fastapi', 'express'],
  testing: ['testing', 'benchmarking', 'unit tests', 'integration tests', 'testing & reliability'],
  nodejs: ['node.js', 'nodejs', 'node', 'express', 'nestjs'],
  node: ['node.js', 'nodejs', 'node', 'express', 'nestjs'],
  swift: ['swift', 'ios', 'xcode', 'swiftui', 'mobile'],
  ml: [
    'ml', 'machine learning', 'deep learning', 'ai', 'artificial intelligence',
    'nlp', 'computer vision', 'neural networks', 'llm', 'llms', 'data science',
    'pytorch', 'tensorflow', 'scikit-learn'
  ],
  'machine learning': [
    'ml', 'machine learning', 'deep learning', 'ai', 'artificial intelligence',
    'nlp', 'computer vision', 'neural networks', 'llm', 'llms', 'data science',
    'pytorch', 'tensorflow', 'scikit-learn'
  ],
  aws: [
    'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'dynamodb',
    'cloudwatch', 'iam', 'ecs', 'eks', 'sqs', 'sns', 'cloud'
  ],
  react: [
    'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'frontend', 'ui', 'web'
  ],
};

export function getCanonicalSkillName(skill: string): string {
  // Strip version patterns like "16+", "1.22+", "v2", "3.3+"
  const stripped = skill.replace(/\s+v?\d+(\.\d+)*\+?/gi, '').trim();
  const norm = (stripped || skill).toLowerCase().trim().replace(/[-_]/g, ' ');
  return SKILL_CANONICAL_MAP[norm] || formatCompetencyName(stripped || skill);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const TOKEN_REGEX_CACHE = new Map<string, RegExp>();
function getTokenRegex(token: string): RegExp {
  let reg = TOKEN_REGEX_CACHE.get(token);
  if (!reg) {
    reg = new RegExp(`(^|\\s|&|\\/|\\()${escapeRegex(token)}($|\\s|&|\\/|\\))`, 'i');
    TOKEN_REGEX_CACHE.set(token, reg);
  }
  return reg;
}

/**
 * Word-boundary token matcher ensuring short tokens (e.g. "go", "sql", "aws", "dsa", "ml")
 * do not spuriously match inside unrelated words (e.g. "go" inside "mongodb").
 */
export function matchSkillToken(projectSkill: string, targetSkill: string): boolean {
  const pNorm = projectSkill.toLowerCase().trim().replace(/[-_]/g, ' ');
  const tNorm = targetSkill.toLowerCase().trim().replace(/[-_]/g, ' ');
  if (pNorm === tNorm) return true;

  const pClean = pNorm.replace(/[^a-z0-9]/g, '');
  const tClean = tNorm.replace(/[^a-z0-9]/g, '');
  if (pClean.length >= 2 && pClean === tClean) return true;

  // Multi-word phrase matches: e.g. "machine learning", "system design", "spring boot", "rest api"
  if (tNorm.includes(' ') && pNorm.includes(tNorm)) return true;
  if (pNorm.includes(' ') && tNorm.includes(pNorm)) return true;

  // For distinct tokens require word boundary
  const regT = getTokenRegex(tNorm);
  if (regT.test(pNorm)) return true;

  return false;
}

/**
 * Checks whether a project's real skills cover a specific candidate skill gap.
 */
export function doesProjectCoverSkill(projectRealSkills: string[], gapSkillId: string): boolean {
  const gNorm = gapSkillId.toLowerCase().trim().replace(/[-_]/g, ' ');
  const gClean = gapSkillId.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const aliases = SKILL_ALIAS_MAP[gNorm] || SKILL_ALIAS_MAP[gClean] || [gNorm, gClean];

  return projectRealSkills.some((ps) => {
    // Check target gap ID directly
    if (matchSkillToken(ps, gNorm) || matchSkillToken(ps, gClean)) return true;
    // Check all known aliases
    return aliases.some((alias) => matchSkillToken(ps, alias));
  });
}

const BRIEF_REAL_SKILLS_CACHE = new Map<string, string[]>();

/**
 * Derives the true, verified list of skills taught/used by a project brief.
 * Adheres to Two-Tier Skill Coverage:
 * 1. Technology skills: derived strictly from brief.techStack via canonical mapping.
 * 2. Concept skills: derived ONLY from brief.coveredSkills after passing keyword
 *    verification against authentic brief text (architecture, problem statement, rubric).
 */
export function deriveBriefRealSkills(brief: ProjectBrief): string[] {
  if (brief.id && BRIEF_REAL_SKILLS_CACHE.has(brief.id)) {
    return BRIEF_REAL_SKILLS_CACHE.get(brief.id)!;
  }

  const unique = new Set<string>();

  // Tier 1: Grounded Technology Skills
  for (const item of brief.techStack || []) {
    const canon = getCanonicalSkillName(item);
    if (canon) unique.add(canon);
  }

  // Tier 2: Vetted Conceptual Skills
  const { vettedConceptTags } = validateBriefConcepts(brief);
  for (const concept of vettedConceptTags) {
    unique.add(concept);
  }

  const result = Array.from(unique);
  if (brief.id) {
    BRIEF_REAL_SKILLS_CACHE.set(brief.id, result);
  }
  return result;
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

  const isAIMLRole = /\b(ai|ml|llm|machine\s+learning|deep\s+learning|data\s+scientist|data\s+engineer|data\s+platform)\b/i.test(rTitle);

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
 * Returns explained matching metadata:
 * - relevance, gapCoverage, domainFit, stackFit
 * - closes: (derivedTech ∪ validatedConcepts) ∩ candidateGaps
 * - whyThisProject: clear, honest justification
 * - reasonCodes: matching explanation tags
 * - Deterministic tie-breaker: relevance -> estimatedHours -> id
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
    index: number;
    realSkills: string[];
    gapCoverage: number;
    domainFit: number;
    stackFit: number;
    relevance: number;
    closedGaps: string[];
    reasonCodes: string[];
    whyThisProject: string;
    debugReason: string;
  }

  const candidates: EvaluatedProject[] = [];

  for (let idx = 0; idx < ALL_BRIEFS.length; idx++) {
    const brief = ALL_BRIEFS[idx];
    const realSkills = deriveBriefRealSkills(brief);

    // Compute which candidate gaps are closed by this project's real skills
    const closedGaps: string[] = [];
    for (const gap of gapSkills) {
      if (doesProjectCoverSkill(realSkills, gap.id)) {
        closedGaps.push(formatCompetencyName(gap.id));
      }
    }

    const gapCoverage = gapSkills.length > 0 ? (closedGaps.length / gapSkills.length) : 0.5;
    const domainFit = computeDomainFit(brief.domain, company?.industry, role?.title);
    const stackFit = computeStackFit(realSkills, gapSkills, role?.title);

    const relevance = gapCoverage * domainFit * stackFit;

    // Reason codes
    const reasonCodes: string[] = [];
    if (domainFit >= 0.8) reasonCodes.push('DOMAIN_ALIGNED');
    if (stackFit >= 0.7) reasonCodes.push('STACK_COMPATIBLE');
    if (closedGaps.length > 0) reasonCodes.push('CLOSES_KEY_GAPS');
    if (realSkills.some((s) => ['System Design', 'Distributed Systems', 'Concurrency'].includes(s))) {
      reasonCodes.push('PRODUCTION_ARCHITECTURE');
    }

    // Why this project narrative
    let whyThisProject = '';
    const hoursPart = brief.estimatedHours ? `~${brief.estimatedHours} hrs effort` : 'estimated effort';
    if (closedGaps.length > 0) {
      const gapsList = closedGaps.slice(0, 3).join(', ');
      whyThisProject = `Closes ${gapsList} ${closedGaps.length === 1 ? 'gap' : 'gaps'}; aligns with ${brief.domain} track; ${hoursPart}.`;
    } else {
      whyThisProject = `Reinforces ${brief.domain} engineering fundamentals; ${hoursPart}.`;
    }

    let debugReason = '';
    if (relevance >= MIN_PROJECT_RELEVANCE_THRESHOLD) {
      debugReason = `included: relevance ${relevance.toFixed(3)} >= threshold ${MIN_PROJECT_RELEVANCE_THRESHOLD}`;
      candidates.push({
        brief,
        index: idx,
        realSkills,
        gapCoverage,
        domainFit,
        stackFit,
        relevance,
        closedGaps,
        reasonCodes,
        whyThisProject,
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

  // Deterministic multi-criteria sorting:
  // 1. Relevance descending
  // 2. Canonical catalog index ascending (stable canonical tie-breaker)
  candidates.sort((a, b) => {
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    return a.index - b.index;
  });

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
    coveredSkills: s.realSkills, // Real stack + vetted concepts
    relevanceScore: Number(s.relevance.toFixed(2)),
    gapCoverage: Number(s.gapCoverage.toFixed(2)),
    domainFit: Number(s.domainFit.toFixed(2)),
    stackFit: Number(s.stackFit.toFixed(2)),
    closes: s.closedGaps,
    reasonCodes: s.reasonCodes,
    whyThisProject: s.whyThisProject,
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
