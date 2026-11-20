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
import {
  getCanonicalSkill,
  getCanonicalSkillName,
  getCanonicalSkillId,
  CANONICAL_SKILL_REGISTRY,
} from './canonicalSkillRegistry';
import { computeDomainFit } from './domainFitTable';
export {
  getCanonicalSkill,
  getCanonicalSkillName,
  getCanonicalSkillId,
  CANONICAL_SKILL_REGISTRY,
  computeDomainFit,
};

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
  candidateGapsCount?: number;
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
  allRankedCandidates?: Array<{
    id: string;
    title: string;
    domain: string;
    techStack: string[];
    gapCoverage: number;
    domainFit: number;
    stackFit: number;
    relevance: number;
    closes: string[];
  }>;
}

const ALL_BRIEFS: ProjectBrief[] = briefsData as ProjectBrief[];

// Skill normalization map
export const SKILL_CANONICAL_MAP: Record<string, string> = {
  go: 'Go',
  golang: 'Go',
  java: 'Java',
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  'c++': 'C++',
  cpp: 'C++',
  'c#': 'C#',
  csharp: 'C#',
  '.net': '.NET',
  dotnet: '.NET',
  r: 'R',
  'ci/cd': 'CI/CD',
  cicd: 'CI/CD',
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
  golang: ['go', 'golang'],
  go: ['go', 'golang'],
  java: ['java', 'jvm'],
  python: ['python', 'cpython', 'pypy'],
  typescript: ['typescript', 'ts'],
  javascript: ['javascript', 'js'],
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
  nodejs: ['node.js', 'nodejs', 'node'],
  node: ['node.js', 'nodejs', 'node'],
  swift: ['swift'],
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
  'c++': ['c++', 'cpp', 'c / c++', 'c/c++'],
  cpp: ['c++', 'cpp', 'c / c++', 'c/c++'],
  'c#': ['c#', 'csharp'],
  csharp: ['c#', 'csharp'],
  '.net': ['.net', 'dotnet', 'asp.net'],
  dotnet: ['.net', 'dotnet', 'asp.net'],
  'ci/cd': ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment', 'devops', 'github actions', 'ci/cd & pipelines'],
  cicd: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment', 'devops', 'github actions', 'ci/cd & pipelines'],
  r: ['r', 'r programming'],
};

// getCanonicalSkillName and getCanonicalSkillId are provided by canonicalSkillRegistry.ts

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

  // Skill alias bidirectional check: handles golang <-> go, ml <-> machine learning, etc.
  const tAliases = SKILL_ALIAS_MAP[tNorm] || SKILL_ALIAS_MAP[tClean];
  if (tAliases && (tAliases.includes(pNorm) || tAliases.includes(pClean))) return true;
  const pAliases = SKILL_ALIAS_MAP[pNorm] || SKILL_ALIAS_MAP[pClean];
  if (pAliases && (pAliases.includes(tNorm) || pAliases.includes(tClean))) return true;

  // Handle special punctuation tokens like c++, c#, .net, r, ci/cd, node.js
  if (['c++', 'cpp', 'c#', 'csharp', '.net', 'dotnet', 'r', 'ci/cd', 'cicd', 'node.js', 'nodejs'].includes(tNorm)) {
    if (tNorm === 'c++' || tNorm === 'cpp') {
      return /(?:^|[\s,;(/&])(?:c\+\+|cpp)(?:$|[\s,;)/&])/i.test(projectSkill);
    }
    if (tNorm === 'c#' || tNorm === 'csharp') {
      return /(?:^|[\s,;(/&])(?:c#|csharp)(?:$|[\s,;)/&])/i.test(projectSkill);
    }
    if (tNorm === '.net' || tNorm === 'dotnet') {
      return /(?:^|[\s,;(/&])(?:\.net|dotnet)(?:$|[\s,;)/&])/i.test(projectSkill);
    }
    if (tNorm === 'ci/cd' || tNorm === 'cicd') {
      return /(?:^|[\s,;(/&])(?:ci\/cd|cicd)(?:$|[\s,;)/&])/i.test(projectSkill);
    }
    if (tNorm === 'node.js' || tNorm === 'nodejs') {
      return /(?:^|[\s,;(/&])(?:node\.js|nodejs)(?:$|[\s,;)/&])/i.test(projectSkill);
    }
    if (tNorm === 'r') {
      return /(?:^|[\s,;(/&])r(?:$|[\s,;)/&])/i.test(projectSkill);
    }
  }

  // For distinct tokens require word boundary
  const regT = getTokenRegex(tNorm);
  if (regT.test(pNorm)) return true;

  return false;
}

const BRIEF_GAP_COVERAGE_CACHE = new Map<string, boolean>();

const CERT_DOMAIN_ALLOWED_SKILLS: Record<string, string[]> = {
  'cert-aws-ccp': ['aws', 'cloud', 'devops'],
  'cert-aws-saa': ['aws', 'cloud', 'devops'],
  'cert-ckad': ['kubernetes', 'docker', 'devops', 'cloud', 'containers'],
  'cert-comptia-sec': ['security', 'application security', 'cybersecurity', 'network security', 'appsec'],
  'cert-gcp-ace': ['gcp', 'cloud', 'kubernetes', 'devops'],
};

/**
 * Checks whether a project's real skills cover a specific candidate skill gap.
 */
export function doesProjectCoverSkill(projectRealSkills: string[], gapSkillId: string, briefId?: string): boolean {
  const gNorm = gapSkillId.toLowerCase().trim().replace(/[-_]/g, ' ');
  const gClean = gapSkillId.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  if (briefId) {
    const cacheKey = `${briefId}::${gClean}`;
    const cached = BRIEF_GAP_COVERAGE_CACHE.get(cacheKey);
    if (cached !== undefined) return cached;
  }

  // 1.4: Cert-* briefs close only the skills of their certification domain (Assertion A9)
  if (briefId && briefId.startsWith('cert-')) {
    const allowed = CERT_DOMAIN_ALLOWED_SKILLS[briefId];
    if (allowed) {
      const cId = getCanonicalSkillId(gapSkillId);
      const isAllowed = allowed.some((a) => a === gClean || a === gNorm || a === cId || getCanonicalSkillId(a) === cId);
      if (!isAllowed) {
        BRIEF_GAP_COVERAGE_CACHE.set(`${briefId}::${gClean}`, false);
        return false;
      }
    }
  }

  const aliases = SKILL_ALIAS_MAP[gNorm] || SKILL_ALIAS_MAP[gClean] || [gNorm, gClean];

  const result = projectRealSkills.some((ps) => {
    // Check target gap ID directly
    if (matchSkillToken(ps, gNorm) || matchSkillToken(ps, gClean)) return true;
    // Check all known aliases
    return aliases.some((alias) => matchSkillToken(ps, alias));
  });

  if (briefId) {
    const cacheKey = `${briefId}::${gClean}`;
    BRIEF_GAP_COVERAGE_CACHE.set(cacheKey, result);
  }

  return result;
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

// computeDomainFit is table-driven and imported from ./domainFitTable

/**
 * Computes tech stack fit between project and target role without blanket shortcuts.
 * Stage E.3: Concept gaps (DSA, System Design, Databases) do not require the primary language match;
 * they may be closed by projects in another language, with missing-language projects ranked higher (0.80-1.00)
 * vs concept-only projects (0.70-0.85).
 */
export function computeStackFit(
  briefSkills: string[],
  gapSkills: SkillState[],
  _roleTitle?: string,
  briefId?: string
): number {
  const PRIMARY_LANGUAGES = [
    'golang', 'go', 'java', 'python', 'typescript', 'javascript',
    'c++', 'cpp', 'rust', 'c', 'swift', 'c#', 'csharp', 'r', 'kotlin'
  ];
  const languageGaps = gapSkills.filter((g) => PRIMARY_LANGUAGES.includes(g.id.toLowerCase()));
  const nonLanguageGaps = gapSkills.filter((g) => !PRIMARY_LANGUAGES.includes(g.id.toLowerCase()));

  const coversLanguageGap = languageGaps.some((lg) =>
    doesProjectCoverSkill(briefSkills, lg.id, briefId)
  );
  const coveredNonLangCount = nonLanguageGaps.filter((g) =>
    doesProjectCoverSkill(briefSkills, g.id, briefId)
  ).length;

  if (languageGaps.length > 0) {
    if (coversLanguageGap) {
      if (nonLanguageGaps.length === 0) {
        return 1.0;
      }
      return 0.80 + 0.20 * (coveredNonLangCount / nonLanguageGaps.length);
    } else {
      // Concept gaps (DSA, system design, databases) do not require the primary language,
      // but are ranked lower than missing-language projects.
      if (coveredNonLangCount > 0) {
        return 0.70 + 0.15 * (coveredNonLangCount / Math.max(1, nonLanguageGaps.length));
      }
      return 0.0;
    }
  }

  // If candidate has NO primary language gaps:
  if (coveredNonLangCount === 0) {
    return 0.0;
  }
  return 0.70 + 0.30 * (coveredNonLangCount / Math.max(1, nonLanguageGaps.length));
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
  breakdown?: Array<{ competency: string; analysis?: { status: string }; status?: string }>;
}): ProjectRecommendationResult {
  const { skillStates, company, role, breakdown } = params;

  // Skills already confirmed strong/expert in competency analysis are NOT candidate gaps
  const strongCompetencies = new Set<string>();
  if (breakdown) {
    for (const b of breakdown) {
      const st = b.status || b.analysis?.status;
      if (st === 'strong' || st === 'expert') {
        const comp = (b.competency || '').toLowerCase().trim();
        strongCompetencies.add(comp);
        const canon = getCanonicalSkillName(comp);
        if (canon) strongCompetencies.add(canon.toLowerCase().trim());
        const fmt = formatCompetencyName(comp);
        if (fmt) strongCompetencies.add(fmt.toLowerCase().trim());
      }
    }
  }

  // Candidate gaps that need proof-of-work
  const gapSkills = skillStates.filter((s) => {
    if (s.status !== 'not-found' && s.status !== 'mentioned') return false;
    const sId = s.id.toLowerCase().trim();
    if (strongCompetencies.has(sId)) return false;
    const canon = getCanonicalSkillName(sId);
    if (canon && strongCompetencies.has(canon.toLowerCase().trim())) return false;
    return true;
  });

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
      if (doesProjectCoverSkill(realSkills, gap.id, brief.id)) {
        closedGaps.push(formatCompetencyName(gap.id));
      }
    }

    const gapCoverage = gapSkills.length > 0 ? (closedGaps.length / gapSkills.length) : 0.5;
    const domainFit = computeDomainFit(brief.domain, company?.industry, role?.title);
    const stackFit = computeStackFit(realSkills, gapSkills, role?.title, brief.id);

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

  const PRIMARY_LANGUAGES = ['golang', 'go', 'java', 'python', 'typescript', 'javascript', 'c++', 'cpp', 'rust', 'c'];
  const languageGaps = gapSkills.filter((g) => PRIMARY_LANGUAGES.includes(g.id.toLowerCase()));

  // 1.2: A shown project must close at least one gap that no higher-ranked shown project closes;
  // otherwise omit it (fewer than two cards is fine). Recompute gapCoverage and relevance from final closes.
  interface SelectedProjectCandidate {
    cand: EvaluatedProject;
    finalCloses: string[];
    recomputedGapCoverage: number;
    recomputedRelevance: number;
  }

  const selected: SelectedProjectCandidate[] = [];
  const handledGapIds = new Set<string>();

  const getCandidateUniqueCloses = (cand: EvaluatedProject): string[] => {
    return cand.closedGaps.filter((g) => {
      const cId = getCanonicalSkillId(g);
      return !handledGapIds.has(cId);
    });
  };

  // Find Project #1
  for (const c of candidates) {
    const unCloses = getCandidateUniqueCloses(c);
    if (unCloses.length > 0) {
      const cov = Number((gapSkills.length > 0 ? (unCloses.length / gapSkills.length) : 0.5).toFixed(2));
      const dom = Number(c.domainFit.toFixed(2));
      const st = Number(c.stackFit.toFixed(2));
      const rel = Number((cov * dom * st).toFixed(2));
      if (rel >= MIN_PROJECT_RELEVANCE_THRESHOLD) {
        selected.push({
          cand: c,
          finalCloses: unCloses,
          recomputedGapCoverage: cov,
          recomputedRelevance: rel,
        });
        for (const g of unCloses) {
          handledGapIds.add(getCanonicalSkillId(g));
        }
        break;
      }
    }
  }

  // Find Project #2 (if slots available and candidate #1 was chosen)
  if (selected.length > 0 && selected.length < MAX_RECOMMENDED_PROJECTS) {
    const coveredLanguages = new Set<string>();
    for (const lg of languageGaps) {
      if (doesProjectCoverSkill(selected[0].cand.realSkills, lg.id, selected[0].cand.brief.id)) {
        coveredLanguages.add(lg.id.toLowerCase());
      }
    }
    const unaddressedLanguages = languageGaps.filter((lg) => !coveredLanguages.has(lg.id.toLowerCase()));

    let slot2Cand: { cand: EvaluatedProject; unCloses: string[]; cov: number; dom: number; st: number; rel: number } | null = null;

    // First try candidate covering unaddressed language gap that also has unique closes and meets post-dedupe threshold
    if (unaddressedLanguages.length > 0) {
      for (const c of candidates) {
        if (c === selected[0].cand) continue;
        const unCloses = getCandidateUniqueCloses(c);
        if (unCloses.length > 0 && unaddressedLanguages.some((lg) => doesProjectCoverSkill(c.realSkills, lg.id, c.brief.id))) {
          const cov = Number((gapSkills.length > 0 ? (unCloses.length / gapSkills.length) : 0.5).toFixed(2));
          const dom = Number(c.domainFit.toFixed(2));
          const st = Number(c.stackFit.toFixed(2));
          const rel = Number((cov * dom * st).toFixed(2));
          if (rel >= MIN_PROJECT_RELEVANCE_THRESHOLD) {
            slot2Cand = { cand: c, unCloses, cov, dom, st, rel };
            break;
          }
        }
      }
    }

    // Otherwise take the highest-ranked remaining candidate with unique closes and meets post-dedupe threshold
    if (!slot2Cand) {
      for (const c of candidates) {
        if (c === selected[0].cand) continue;
        const unCloses = getCandidateUniqueCloses(c);
        if (unCloses.length > 0) {
          const cov = Number((gapSkills.length > 0 ? (unCloses.length / gapSkills.length) : 0.5).toFixed(2));
          const dom = Number(c.domainFit.toFixed(2));
          const st = Number(c.stackFit.toFixed(2));
          const rel = Number((cov * dom * st).toFixed(2));
          if (rel >= MIN_PROJECT_RELEVANCE_THRESHOLD) {
            slot2Cand = { cand: c, unCloses, cov, dom, st, rel };
            break;
          }
        }
      }
    }

    if (slot2Cand) {
      selected.push({
        cand: slot2Cand.cand,
        finalCloses: slot2Cand.unCloses,
        recomputedGapCoverage: slot2Cand.cov,
        recomputedRelevance: slot2Cand.rel,
      });
      for (const g of slot2Cand.unCloses) {
        handledGapIds.add(getCanonicalSkillId(g));
      }
    }
  }

  const allRankedCandidates = candidates.map((c) => ({
    id: c.brief.id,
    title: c.brief.title,
    domain: c.brief.domain,
    techStack: c.brief.techStack || [],
    gapCoverage: Number(c.gapCoverage.toFixed(2)),
    domainFit: Number(c.domainFit.toFixed(2)),
    stackFit: Number(c.stackFit.toFixed(2)),
    relevance: Number(c.relevance.toFixed(3)),
    closes: c.closedGaps,
  }));

  if (selected.length === 0) {
    return {
      projects: [],
      hasMatches: false,
      emptyStateMessage: 'No project in the current library matches the missing skills for this role.',
      allRankedCandidates,
    };
  }

  const projects: RecommendedProjectDrop[] = selected.map((s) => {
    const c = s.cand;
    const hoursPart = c.brief.estimatedHours ? `~${c.brief.estimatedHours} hrs effort` : 'estimated effort';
    const gapsList = s.finalCloses.slice(0, 3).join(', ');
    const whyThisProject = `Closes ${gapsList} ${s.finalCloses.length === 1 ? 'gap' : 'gaps'}; aligns with ${c.brief.domain} track; ${hoursPart}.`;

    return {
      id: c.brief.id,
      title: c.brief.title,
      domain: c.brief.domain,
      difficulty: c.brief.difficulty,
      estimatedHours: c.brief.estimatedHours || 0,
      hoursDisplay: c.brief.estimatedHours ? `~${c.brief.estimatedHours} hrs` : 'estimate unavailable',
      coveredSkills: c.realSkills,
      relevanceScore: Number(s.recomputedRelevance.toFixed(2)),
      gapCoverage: Number(s.recomputedGapCoverage.toFixed(2)),
      candidateGapsCount: gapSkills.length,
      domainFit: Number(c.domainFit.toFixed(2)),
      stackFit: Number(c.stackFit.toFixed(2)),
      closes: s.finalCloses,
      reasonCodes: c.reasonCodes,
      whyThisProject,
      problemStatement: c.brief.problemStatement,
      architecture: c.brief.architecture,
      recruiterSignal: c.brief.recruiterSignal || '',
      portfolioBulletFormula: c.brief.portfolioBulletFormula,
      deliverables: (c.brief.milestones || []).map((m) => `${m.title}: ${m.doneWhen}`),
      debugReason: c.debugReason,
    };
  });

  return {
    projects,
    hasMatches: true,
    emptyStateMessage: null,
    allRankedCandidates,
  };
}
