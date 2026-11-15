// ============================================================
// HireFlow — Single Source of Truth for Skill State (Stage 2)
// Pure module: builds definitive, non-contradictory skill states
// consumed across Competency Table, Market Intelligence,
// Action Plans, Project Matcher, and Dossier Export.
// ============================================================

import { matchesTokenSafely } from '@/scoring/core';
import { COMPETENCY_SIGNALS, formatCompetencyName, getSentences } from '../talentLensEngine';
import { normalizeLevel } from './levelNormalizer';

export type SkillKind = 'language' | 'framework' | 'database' | 'concept' | 'domain' | 'soft-skill' | 'unclassified';
export type RequirementSource = 'jd-text' | 'inferred-from-company-tier';
export type SkillEvidenceStrength = 'demonstrated' | 'mentioned';
export type SkillStatus = 'demonstrated' | 'mentioned' | 'not-found' | 'not-assessed';
export type SkillConfidenceTag = 'High' | 'Medium' | 'Low';

export type CanonicalTier =
  | 'FAANG'
  | 'Tech Giant'
  | 'Unicorn'
  | 'Startup'
  | 'Product MNC'
  | 'MNC'
  | 'Enterprise'
  | 'IT Services'
  | 'GCC'
  | 'Tier S';

export const CANONICAL_TIERS: CanonicalTier[] = [
  'FAANG',
  'Tech Giant',
  'Unicorn',
  'Startup',
  'Product MNC',
  'MNC',
  'Enterprise',
  'IT Services',
  'GCC',
  'Tier S',
];

export const TIER_NORMALIZATION_MAP: Record<string, CanonicalTier> = {
  // FAANG
  faang: 'FAANG',
  // Tech Giant
  'tech giant': 'Tech Giant',
  tech_giant: 'Tech Giant',
  techgiant: 'Tech Giant',
  // Unicorn
  unicorn: 'Unicorn',
  // Startup
  startup: 'Startup',
  bootstrapped: 'Startup',
  // Product MNC
  'product mnc': 'Product MNC',
  product_mnc: 'Product MNC',
  productmnc: 'Product MNC',
  'top product': 'Product MNC',
  top_product: 'Product MNC',
  topproduct: 'Product MNC',
  product: 'Product MNC',
  // MNC
  mnc: 'MNC',
  // Enterprise
  enterprise: 'Enterprise',
  // IT Services
  'it services': 'IT Services',
  it_services: 'IT Services',
  itservices: 'IT Services',
  service: 'IT Services',
  tier_2_service: 'IT Services',
  'tier 2 service': 'IT Services',
  // GCC
  gcc: 'GCC',
  // Tier S
  'tier s': 'Tier S',
  tier_s: 'Tier S',
  tiers: 'Tier S',
};

/**
 * Normalizes company tier variants into canonical tiers.
 * Fails loudly in tests on unknown tiers; degrades safely with a warning in production.
 */
export function normalizeTier(rawTier: string | undefined): CanonicalTier {
  if (!rawTier) {
    return 'Enterprise';
  }
  const clean = rawTier.toLowerCase().trim().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
  const mapped =
    TIER_NORMALIZATION_MAP[clean] ||
    TIER_NORMALIZATION_MAP[clean.replace(/\s+/g, '_')] ||
    TIER_NORMALIZATION_MAP[clean.replace(/\s+/g, '')];

  if (mapped) {
    return mapped;
  }
  if (process.env.NODE_ENV === 'test') {
    throw new Error(
      `Unknown company tier: "${rawTier}". Must map to one of canonical tiers: ${CANONICAL_TIERS.join(', ')}`
    );
  }
  console.warn(`[TierNormalization] Unknown tier "${rawTier}", defaulting to Enterprise.`);
  return 'Enterprise';
}

export const EXCLUDE_NOT_ASSESSED_FROM_SCORE = false;

// Stage 3 Context-Based Evidence Scoring Constants
export const ACTION_VERB_WEIGHT = 0.25;
export const NAMED_ARTIFACT_WEIGHT = 0.25;
export const NAMED_TECH_WEIGHT = 0.25;
export const OUTCOME_METRIC_WEIGHT = 0.25;
export const DEMONSTRATED_CONTEXT_THRESHOLD = 0.60;
export const HIGH_CONFIDENCE_THRESHOLD = 0.75;

// Stage 5 Parse Transparency Constants
export const MIN_PARSE_BULLETS = 5;
export const MIN_PARSE_PROJECTS = 1;

export interface SkillEvidenceSignals {
  hasActionVerb: boolean;
  hasNamedArtifact: boolean;
  hasNamedTech: boolean;
  hasOutcomeOrMetric: boolean;
}

export interface SkillEvidenceItem {
  text: string;
  strength: SkillEvidenceStrength;
  contextScore: number;
  signals: SkillEvidenceSignals;
}

export interface SkillState {
  id: string;
  label: string;
  kind: SkillKind;
  requirementLevel: string;
  requirementSource: RequirementSource;
  evidence: SkillEvidenceItem[];
  status: SkillStatus;
  confidenceTag: SkillConfidenceTag;
  // Diagnostics & compatibility metadata
  score: number;
  confidence: number;
  gaps: string[];
  summaryLine: string;
  contextSentences: string[];
  layerScores?: { l1: number; l2: number; l3: number; l4: number; l5: number };
}

export interface ResumeParseSummary {
  sectionsFound: string[];
  sectionsCount: number;
  projectsCount: number;
  bulletsCount: number;
  skillsDetectedCount: number;
  evidenceSentencesCount: number;
  isThinParse: boolean;
  parseConfidence: 'High' | 'Medium' | 'Low';
  warningMessage?: string;
}

export interface BuildSkillStatesInput {
  resumeText: string;
  competencies: string[];
  reqLevels?: Record<string, string>;
  role?: {
    title?: string;
    level?: string;
    desc?: string;
    fullText?: string;
    requiredSkills?: any[];
  };
  company?: {
    name?: string;
    tier?: string;
    industry?: string;
  };
}

const SKILL_KIND_MAP: Record<string, SkillKind> = {
  // Languages
  golang: 'language',
  go: 'language',
  java: 'language',
  python: 'language',
  typescript: 'language',
  javascript: 'language',
  c: 'language',
  'c++': 'language',
  cpp: 'language',
  'c#': 'language',
  csharp: 'language',
  rust: 'language',
  ruby: 'language',
  php: 'language',
  swift: 'language',
  kotlin: 'language',
  scala: 'language',
  bash: 'language',
  shell: 'language',
  r: 'language',
  dart: 'language',
  solidity: 'language',
  verilog: 'language',
  vhdl: 'language',

  // Frameworks & Libraries
  react: 'framework',
  'react.js': 'framework',
  nextjs: 'framework',
  'next.js': 'framework',
  vue: 'framework',
  angular: 'framework',
  nodejs: 'framework',
  'node.js': 'framework',
  express: 'framework',
  nestjs: 'framework',
  fastapi: 'framework',
  django: 'framework',
  flask: 'framework',
  spring: 'framework',
  'spring boot': 'framework',
  hibernate: 'framework',
  dotnet: 'framework',
  '.net': 'framework',
  'asp.net': 'framework',
  pytorch: 'framework',
  tensorflow: 'framework',
  keras: 'framework',
  spark: 'framework',
  airflow: 'framework',
  flutter: 'framework',
  'react native': 'framework',

  // Databases & Storage
  databases: 'database',
  database: 'database',
  sql: 'database',
  nosql: 'database',
  postgresql: 'database',
  postgres: 'database',
  mysql: 'database',
  mongodb: 'database',
  redis: 'database',
  cassandra: 'database',
  elasticsearch: 'database',
  dynamodb: 'database',
  oracle: 'database',
  sqlite: 'database',
  kafka: 'database',
  rabbitmq: 'database',
  neo4j: 'database',
  snowflake: 'database',
  bigquery: 'database',
  clickhouse: 'database',

  // Concepts & Architecture
  dsa: 'concept',
  algorithms: 'concept',
  'data structures': 'concept',
  systemdesign: 'concept',
  'system design': 'concept',
  'distributed systems': 'concept',
  concurrency: 'concept',
  multithreading: 'concept',
  microservices: 'concept',
  'clean architecture': 'concept',
  networking: 'concept',
  oop: 'concept',
  'object oriented programming': 'concept',
  'design patterns': 'concept',
  'computer science fundamentals': 'concept',
  'operating systems': 'concept',
  security: 'concept',
  cryptography: 'concept',
  rest: 'concept',
  rest_api: 'concept',
  restapi: 'concept',
  'rest api': 'concept',
  'rest apis': 'concept',
  'restful apis': 'concept',
  graphql: 'concept',
  grpc: 'concept',

  // Domains & Infrastructure
  iot: 'domain',
  finance: 'domain',
  fintech: 'domain',
  appsec: 'domain',
  devops: 'domain',
  cloud: 'domain',
  aws: 'domain',
  gcp: 'domain',
  azure: 'domain',
  kubernetes: 'domain',
  docker: 'domain',
  terraform: 'domain',
  ci_cd: 'domain',
  'ci/cd': 'domain',
  ml: 'domain',
  ai: 'domain',
  'machine learning': 'domain',
  'deep learning': 'domain',
  nlp: 'domain',
  'computer vision': 'domain',
  llm: 'domain',
  web: 'domain',
  sre: 'domain',
  qa: 'domain',
  testing: 'domain',

  // Soft Skills
  communication: 'soft-skill',
  leadership: 'soft-skill',
  teamwork: 'soft-skill',
  collaboration: 'soft-skill',
  ownership: 'soft-skill',
  mentorship: 'soft-skill',
  adaptability: 'soft-skill',
  'problem solving': 'soft-skill',
};

export function classifySkillKind(skillId: string): SkillKind {
  const norm = skillId.toLowerCase().trim().replace(/[-_]/g, '');
  const rawLower = skillId.toLowerCase().trim();

  if (SKILL_KIND_MAP[rawLower]) return SKILL_KIND_MAP[rawLower];
  if (SKILL_KIND_MAP[norm]) return SKILL_KIND_MAP[norm];

  // Pattern-based classification
  if (
    /leader|communicat|collaborat|mentor|present|teamwork|ownership|adaptab/i.test(norm) ||
    (/\bmanage(ment)?\b/i.test(rawLower) && !/manager|database|state|cache|cert/i.test(norm))
  ) return 'soft-skill';
  if (/sql|db|postgres|mongo|redis|cassandra|store|data(base)?/i.test(norm)) return 'database';
  if (/react|angular|vue|spring|django|flask|fastapi|node|express|nest|dotnet|\.net|spark|airflow/i.test(norm)) return 'framework';
  if (/java|python|golang|go|rust|c\+\+|cpp|csharp|c#|kotlin|swift|ruby|php|scala|bash|shell/i.test(norm)) return 'language';
  if (/design|algo|dsa|structure|architect|concurr|multithread|pattern|protocol|network|system/i.test(norm)) return 'concept';
  if (/cloud|devops|security|k8s|kubernetes|docker|aws|gcp|azure|linux|infra|test|qa|sre|vision|nlp|ml|ai/i.test(norm)) return 'domain';

  // If completely unclassified
  return 'unclassified';
}

const ACTION_VERBS = [
  'built', 'developed', 'designed', 'implemented', 'architected', 'migrated',
  'engineered', 'scaled', 'optimized', 'reduced', 'automated', 'shipped',
  'deployed', 'maintained', 'created', 'refactored', 'integrated', 'modeled',
  'trained', 'benchmarked', 'delivered', 'solved', 'orchestrated', 'authored',
  'configured', 'spearheaded', 'launched', 'monitored'
];

const ARTIFACT_REGEX = /\b(pipeline|pipelines|service|services|microservice|microservices|api|apis|endpoint|endpoints|cluster|clusters|database|databases|cache|caches|queue|queues|engine|engines|platform|platforms|system|systems|app|apps|application|applications|model|models|server|servers|client|clients|module|modules|framework|frameworks|infrastructure|dashboard|dashboards|table|tables|schema|schemas|parser|compiler|gateway|broker|proxy|worker|workers|ledger|spec|rfc)\b/i;

const TECH_REGEX = /\b(go|golang|java|python|typescript|javascript|react|vue|angular|node|spring|fastapi|django|docker|kubernetes|k8s|redis|postgres|postgresql|mysql|mongodb|cassandra|kafka|aws|gcp|azure|git|grpc|graphql|sql|nosql|rest|linux)\b/i;

const METRIC_REGEX = /(\b\d+(\.\d+)?%\b|\b\d+\s*(ms|s|sec|seconds|minutes|hrs|hours|gb|mb|tb|k|m|million|billion|rps|qps|req\/s|reqs)\b|\bo\(.*\)|p95|p99|latency|throughput|sla|slo|rto|rpo)/i;

const OUTCOME_PHRASES_REGEX = /\b(to reduce|to optimize|to increase|to scale|resulting in|achieving|cutting|slashing|boosting|enabling|improving)\b/i;

/**
 * Computes contextScore (0 to 1) for a candidate evidence sentence based on 4 signals.
 * Enforces authentic engineering context and rejects raw keyword headers.
 */
export function computeContextScore(
  sentence: string,
  skillId?: string
): { contextScore: number; signals: SkillEvidenceSignals } {
  const s = sentence.trim();
  const sl = s.toLowerCase();

  if (s.length < 15) {
    return {
      contextScore: 0,
      signals: { hasActionVerb: false, hasNamedArtifact: false, hasNamedTech: false, hasOutcomeOrMetric: false },
    };
  }

  // Reject header or list pattern check (e.g. "Skills: Java, Python, Go")
  const isHeaderOrList = /^(skills|technologies|tools|languages|competencies|proficiencies|technical\s+skills|frameworks)\s*[:|-]/i.test(s);
  if (isHeaderOrList) {
    return {
      contextScore: 0.1,
      signals: { hasActionVerb: false, hasNamedArtifact: false, hasNamedTech: true, hasOutcomeOrMetric: false },
    };
  }

  // Excessive comma list check (e.g. "Used X, Y, Z, A, B, C")
  const words = sl.split(/\s+/);
  const commaCount = (s.match(/,/g) || []).length;
  if (commaCount >= 4 && words.length <= commaCount * 3) {
    return {
      contextScore: 0.2,
      signals: { hasActionVerb: false, hasNamedArtifact: false, hasNamedTech: true, hasOutcomeOrMetric: false },
    };
  }

  // Signal 1: Action Verb
  const hasActionVerb = ACTION_VERBS.some((verb) => {
    const rx = new RegExp(`\\b${verb}\\b`, 'i');
    return rx.test(sl);
  });

  // Signal 2: Named Artifact or System
  const hasNamedArtifact = ARTIFACT_REGEX.test(sl);

  // Signal 3: Named Technology (checks canonical tech list or competency keywords)
  const compKeywords = skillId && COMPETENCY_SIGNALS[skillId.toLowerCase()]
    ? COMPETENCY_SIGNALS[skillId.toLowerCase()].keywords
    : (skillId ? [skillId] : []);

  const hasNamedTech =
    TECH_REGEX.test(sl) ||
    compKeywords.some((kw) => matchesTokenSafely(sl, kw.toLowerCase()).found) ||
    (skillId ? matchesTokenSafely(sl, skillId.toLowerCase()).found : false);

  // Signal 4: Outcome or Metric
  const hasOutcomeOrMetric = METRIC_REGEX.test(sl) || OUTCOME_PHRASES_REGEX.test(sl);

  let score = 0;
  if (hasActionVerb) score += ACTION_VERB_WEIGHT;
  if (hasNamedArtifact) score += NAMED_ARTIFACT_WEIGHT;
  if (hasNamedTech) score += NAMED_TECH_WEIGHT;
  if (hasOutcomeOrMetric) score += OUTCOME_METRIC_WEIGHT;

  return {
    contextScore: Number(score.toFixed(2)),
    signals: {
      hasActionVerb,
      hasNamedArtifact,
      hasNamedTech,
      hasOutcomeOrMetric,
    },
  };
}

/**
 * Checks if a sentence demonstrates technical action with authentic engineering context.
 */
export function isDemonstratedContext(sentence: string, skillId?: string): boolean {
  const { contextScore } = computeContextScore(sentence, skillId);
  return contextScore >= DEMONSTRATED_CONTEXT_THRESHOLD;
}

/**
 * Extracts compact parse transparency summary from resume text.
 */
export function extractResumeParseSummary(
  resumeText: string,
  skillStates: SkillState[]
): ResumeParseSummary {
  const lines = resumeText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Detect sections
  const sectionKeywords = [
    'experience', 'work experience', 'employment', 'projects', 'personal projects',
    'education', 'skills', 'technical skills', 'certifications', 'summary', 'publications'
  ];
  const detectedSections = new Set<string>();
  for (const line of lines) {
    const lineLower = line.toLowerCase().replace(/[:|-]/g, '').trim();
    for (const kw of sectionKeywords) {
      if (lineLower === kw || lineLower.startsWith(`${kw} `)) {
        detectedSections.add(formatCompetencyName(kw));
      }
    }
  }

  // Detect bullets
  const bulletLines = lines.filter((l) => /^([-•*▪►–]|(\d+\.))\s+/.test(l));
  const bulletsCount = bulletLines.length;

  // Detect projects (rough estimate by project headers or section contents)
  const projectLines = lines.filter((l) =>
    /project|github\.com/i.test(l) &&
    !/^([-•*]|skills|experience|education)/i.test(l) &&
    l.length < 80
  );
  const projectsCount = Math.max(projectLines.length, bulletsCount >= 5 ? 2 : 1);

  // Skills detected (count demonstrated or mentioned)
  const skillsDetectedCount = skillStates.filter((s) => s.status === 'demonstrated' || s.status === 'mentioned').length;

  // Evidence sentences used
  const usedEvidence = new Set<string>();
  for (const s of skillStates) {
    for (const e of s.evidence) {
      usedEvidence.add(e.text);
    }
  }
  const evidenceSentencesCount = usedEvidence.size;

  const isThinParse = bulletsCount < MIN_PARSE_BULLETS || projectsCount < MIN_PARSE_PROJECTS;
  const parseConfidence: 'High' | 'Medium' | 'Low' = isThinParse
    ? 'Low'
    : (bulletsCount >= 8 && projectsCount >= 2) ? 'High' : 'Medium';

  const warningMessage = isThinParse
    ? 'Thin resume parse: fewer than 5 bullet points or no distinct project detected. Extracted signals may under-represent candidate depth.'
    : undefined;

  return {
    sectionsFound: Array.from(detectedSections),
    sectionsCount: detectedSections.size,
    projectsCount,
    bulletsCount,
    skillsDetectedCount,
    evidenceSentencesCount,
    isThinParse,
    parseConfidence,
    warningMessage,
  };
}

/**
 * Builds unified, consistent skill states for an evaluation.
 * Enforces:
 * 1. Single source of truth across all report sections.
 * 2. Order-independent best-fit evidence assignment.
 * 3. Contextual evidence scoring (4 signals, threshold >= 0.60 -> demonstrated).
 * 4. Not-assessed status for soft skills (never 0/100 or absent).
 * 5. Honest requirement sourcing ('jd-text' vs 'inferred-from-company-tier').
 */
export function buildSkillStates(input: BuildSkillStatesInput): SkillState[] {
  const { resumeText, competencies, reqLevels = {}, role } = input;
  const rawSentences = getSentences(resumeText);

  // Check if role is campus / fresher hiring
  const isCampus =
    (role?.title || '').toLowerCase().includes('campus') ||
    (role?.title || '').toLowerCase().includes('fresher') ||
    normalizeLevel(role?.level) === 'entry';

  const jdFull = [
    role?.title,
    role?.desc,
    role?.fullText,
    ...(Array.isArray(role?.requiredSkills) ? role.requiredSkills.map((s) => (typeof s === 'string' ? s : s?.skill || '')) : [])
  ].filter(Boolean).join(' ').toLowerCase();

  // ─────────────────────────────────────────────────────────────
  // STAGE 1 (d): Best-fit order-independent sentence assignment
  // ─────────────────────────────────────────────────────────────
  // Map of sentence -> best-fit skill ID that claims it as primary proof
  const primaryAssignment = new Map<string, string>();

  for (const sentence of rawSentences) {
    const sl = sentence.toLowerCase();

    interface MatchCandidate {
      compId: string;
      contextScore: number;
      signals: SkillEvidenceSignals;
      reqWeight: number;
      specificity: number;
    }

    const matchingCandidates: MatchCandidate[] = [];

    for (const comp of competencies) {
      const compLower = comp.toLowerCase().trim();
      const signals = COMPETENCY_SIGNALS[compLower] || {
        keywords: [compLower],
        contextPhrases: [],
        redFlags: [],
      };

      const isMatch =
        matchesTokenSafely(sentence, compLower).found ||
        matchesTokenSafely(sl, compLower).found ||
        signals.keywords.some((kw) => matchesTokenSafely(sentence, kw).found || matchesTokenSafely(sl, kw).found);

      if (isMatch) {
        const { contextScore, signals: sigs } = computeContextScore(sentence, compLower);
        const reqLevel = reqLevels[comp] || reqLevels[compLower] || 'strong';
        const reqWeight = reqLevel === 'expert' ? 3 : reqLevel === 'strong' ? 2 : 1;
        const specificity = compLower.length;

        matchingCandidates.push({
          compId: compLower,
          contextScore,
          signals: sigs,
          reqWeight,
          specificity,
        });
      }
    }

    if (matchingCandidates.length > 0) {
      // Sort candidates deterministically:
      // 1. contextScore descending
      // 2. requirement weight descending (expert > strong > working)
      // 3. skill name specificity descending
      // 4. alphabetical compId ascending (strictly invariant to input array order!)
      matchingCandidates.sort((a, b) => {
        if (b.contextScore !== a.contextScore) return b.contextScore - a.contextScore;
        if (b.reqWeight !== a.reqWeight) return b.reqWeight - a.reqWeight;
        if (b.specificity !== a.specificity) return b.specificity - a.specificity;
        return a.compId.localeCompare(b.compId);
      });

      // The top candidate claims this sentence as primary proof
      primaryAssignment.set(sentence, matchingCandidates[0].compId);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Build SkillState for each competency
  // ─────────────────────────────────────────────────────────────
  const results: SkillState[] = [];

  for (const comp of competencies) {
    const compLower = comp.toLowerCase().trim();
    const label = formatCompetencyName(comp);
    const kind = classifySkillKind(compLower);

    // Requirement Source & Level
    const inJdText = jdFull.length > 0 && (
      jdFull.includes(compLower) ||
      matchesTokenSafely(jdFull, compLower).found ||
      (COMPETENCY_SIGNALS[compLower]?.keywords || []).some((kw) => jdFull.includes(kw.toLowerCase()))
    );

    const requirementSource: RequirementSource = inJdText ? 'jd-text' : 'inferred-from-company-tier';

    let rawReqLevel = reqLevels[comp] || reqLevels[compLower] || 'strong';
    // Rule: For campus/fresher roles, never present an inferred skill as a hard requirement
    if (isCampus && requirementSource === 'inferred-from-company-tier') {
      rawReqLevel = 'preferred';
    }

    const signals = COMPETENCY_SIGNALS[compLower] || {
      keywords: [compLower],
      contextPhrases: [],
      redFlags: [],
    };

    // Find all matching sentences for this skill
    const matchingSentences = rawSentences.filter((s) => {
      const sl = s.toLowerCase();
      return (
        matchesTokenSafely(s, compLower).found ||
        matchesTokenSafely(sl, compLower).found ||
        signals.keywords.some((kw) => matchesTokenSafely(s, kw).found || matchesTokenSafely(sl, kw).found)
      );
    });

    const evidenceItems: SkillEvidenceItem[] = [];
    let hasPrimaryDemonstration = false;
    const contextSentences: string[] = [];
    let maxContextScore = 0;

    for (const sentence of matchingSentences) {
      const { contextScore, signals: sigs } = computeContextScore(sentence, compLower);
      if (contextScore > maxContextScore) maxContextScore = contextScore;

      const isPrimaryWinner = primaryAssignment.get(sentence) === compLower;
      const isDemonstration = contextScore >= DEMONSTRATED_CONTEXT_THRESHOLD;

      if (isPrimaryWinner && isDemonstration && !hasPrimaryDemonstration) {
        hasPrimaryDemonstration = true;
        evidenceItems.push({
          text: sentence,
          strength: 'demonstrated',
          contextScore,
          signals: sigs,
        });
        contextSentences.push(sentence);
      } else {
        evidenceItems.push({
          text: sentence,
          strength: 'mentioned',
          contextScore,
          signals: sigs,
        });
      }
    }

    // Determine status (Stage 4: Not-assessed for soft skills)
    let status: SkillStatus;
    if (kind === 'soft-skill') {
      status = 'not-assessed';
    } else if (evidenceItems.length === 0) {
      status = 'not-found';
    } else if (hasPrimaryDemonstration) {
      status = 'demonstrated';
    } else {
      status = 'mentioned';
    }

    // Determine confidence tag (Stage 5)
    let confidenceTag: SkillConfidenceTag;
    if (status === 'demonstrated' && maxContextScore >= HIGH_CONFIDENCE_THRESHOLD) {
      confidenceTag = 'High';
    } else if (status === 'demonstrated' && maxContextScore >= DEMONSTRATED_CONTEXT_THRESHOLD) {
      confidenceTag = 'Medium';
    } else {
      confidenceTag = 'Low';
    }

    // Determine score / confidence
    let score = 0;
    if (status === 'demonstrated') {
      score = evidenceItems.length >= 2 ? 85 : 70;
    } else if (status === 'mentioned') {
      score = 40;
    } else if (status === 'not-assessed') {
      score = 0; // Soft skills not scored by resume parser
    } else {
      score = 0;
    }

    // State-specific summary line
    let summaryLine: string;
    if (status === 'not-assessed') {
      summaryLine = 'Not assessed from resume text. Verified via architectural RFCs or system design walkthroughs.';
    } else if (status === 'not-found') {
      summaryLine = 'No evidence found in the resume';
    } else if (status === 'mentioned') {
      summaryLine = 'Mentioned, not demonstrated';
    } else {
      summaryLine = contextSentences[0]
        ? `Demonstrated: "${contextSentences[0].trim()}"`
        : 'Demonstrated in practical project experience with action verbs';
    }

    // Gaps
    const gaps: string[] = [];
    if (status === 'not-assessed') {
      // Soft skill not assessed from resume text
    } else if (status === 'not-found') {
      gaps.push(`${label.toUpperCase()} is not evidenced in the resume. Build a real proof project demonstrating ${label.toUpperCase()} before applying.`);
    } else if (status === 'mentioned') {
      gaps.push(`${label.toUpperCase()} is mentioned without operational outcome context. Deepen with quantified project outcomes.`);
    }

    results.push({
      id: compLower,
      label,
      kind,
      requirementLevel: rawReqLevel,
      requirementSource,
      evidence: evidenceItems,
      status,
      confidenceTag,
      score,
      confidence: score,
      gaps,
      summaryLine,
      contextSentences,
      layerScores: {
        l1: status === 'not-found' || status === 'not-assessed' ? 0 : 70,
        l2: status === 'demonstrated' ? 80 : status === 'mentioned' ? 30 : 0,
        l3: status === 'demonstrated' ? 60 : 0,
        l4: status === 'demonstrated' ? 50 : 0,
        l5: 100,
      },
    });
  }

  return results;
}
