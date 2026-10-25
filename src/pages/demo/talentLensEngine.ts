// ============================================================
// HireFlow — TalentLens™ AI Calculation & Evaluation Engine (Stage 4)
// Single Source of Truth architecture: Runs from CANONICAL_SCORING_SPEC
// Produces authoritative ScoreTrace, sensitivity band, and honest market guidance.
// ============================================================

import {
  matchesTokenSafely,
  scoreBulletPoint,
  runScoringEngine,
  parseResumeToScoringInput,
  evaluateEligibilityGate,
  ScoreTrace,
  ScoreBand,
  ScoringContext,
  ConfirmedRequirement,
  ResumeScoringInput,
  EligibilityGateResult,
  EligibilityCandidateInput,
} from '../../scoring/core';
import { CANONICAL_SCORING_SPEC } from '../../scoring/spec';
import { MARKET_ENTRIES, MarketEntry } from '../../data/market';
import { CURRICULUM_DOMAINS } from '../../data/curriculum/curriculumData';
import { validateResumeAuthenticity } from '../../lib/resumeValidator';

export interface Role {
  title: string;
  level: string;
  desc: string;
  competencies: string[];
  reqLevel?: Record<string, string>;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  aboutRole?: string;
  responsibilities?: string[];
  requiredQualifications?: string[];
  toolsAndTech?: string[];
  requiredSkills?: string[];
  fullText?: string;
  selectionProcess?: { stage: string }[];
  source?: string;
  sourceUrl?: string | null;
  lastVerified?: string | null;
  confidence?: 'high' | 'medium' | 'low';
  status?: 'verified' | 'needs-recheck' | 'unverified';
  [key: string]: any;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  gradient: string;
  industry: string;
  hq: string;
  tier: string;
  hiring2023?: number;
  hiring2024?: number;
  openRoles?: number;
  roles: Role[];
  source?: string;
  sourceUrl?: string | null;
  lastVerified?: string | null;
  confidence?: 'high' | 'medium' | 'low';
  status?: 'verified' | 'needs-recheck' | 'unverified';
  [key: string]: any;
}

export const INDUSTRIES = [
  'All', 'Technology', 'Fintech', 'E-commerce', 'IT Services', 'SaaS',
  'Food Tech', 'Mobility', 'Quick Commerce', 'Stock Broking', 'Gaming',
  'Developer Tools', 'HRTech SaaS', 'Neobanking / Fintech',
  'Investment Banking Tech', 'Semiconductor / AI', 'Industrial Tech / Software',
  'Automotive Software / IoT', 'Retail Tech', 'Payments / Fintech',
  'Enterprise SaaS', 'Enterprise Software',
];

export const TIERS = ['All', 'FAANG', 'Unicorn', 'MNC', 'IT Services', 'Startup', 'Enterprise'];

export const TREND_COLOR: Record<string, string> = { up: 'text-success', down: 'text-danger', stable: 'text-warning' };
export const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' };

export const STATUS_CONFIG = {
  expert: { label: 'Expert', color: 'text-success', bg: 'bg-success-bg', border: 'border-success/20', bar: 'bg-success' },
  strong: { label: 'Strong', color: 'text-primary', bg: 'bg-primary-light', border: 'border-primary/20', bar: 'bg-primary' },
  working: { label: 'Partial', color: 'text-warning', bg: 'bg-warning-bg', border: 'border-warning/20', bar: 'bg-warning' },
  absent: { label: 'Not Found', color: 'text-danger', bg: 'bg-danger-bg', border: 'border-danger/20', bar: 'bg-danger' },
};

export const getCompanySlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function getSentences(text: string): string[] {
  return text.split(/[.!\n]/).map((s) => s.trim()).filter((s) => s.length > 10);
}

export const COMPETENCY_SIGNALS: Record<string, { keywords: string[]; contextPhrases: string[]; redFlags: string[] }> = {
  dsa: {
    keywords: ['dsa', 'data structures', 'algorithms', 'leetcode', 'competitive programming', 'dynamic programming', 'binary search', 'hash table', 'hashmap', 'time complexity', 'space complexity', 'depth-first search', 'breadth-first search', 'dijkstra', 'big-o'],
    contextPhrases: ['solved 300+', 'competitive programming', 'icpc', 'codeforces', 'leetcode rating', 'contest participant'],
    redFlags: ['basic understanding only', 'learning data structures', 'no practical coding experience'],
  },
  systemdesign: {
    keywords: ['system design', 'microservices', 'distributed systems', 'high availability', 'load balancer', 'load balancing', 'cdn tier', 'caching tier', 'redis cache', 'database sharding', 'cap theorem', 'kafka', 'message queue', 'distributed architecture', 'fault tolerance', 'rate limiting', 'consistent hashing'],
    contextPhrases: ['architected distributed system', 'high availability architecture', 'fault tolerant microservices', 'horizontally scalable system', 'designed microservices', 'caching tier'],
    redFlags: ['basic architecture only', 'monolith only', 'no distributed system experience'],
  },
  java: {
    keywords: ['java', 'spring boot', 'spring framework', 'jvm', 'jpa', 'hibernate', 'maven', 'gradle', 'java ee', 'jakarta ee', 'jdk', 'core java', 'java 17', 'java 21', 'java 11', 'virtual threads'],
    contextPhrases: ['production java', 'spring boot microservices', 'jvm tuning', 'enterprise java backend', 'high throughput java'],
    redFlags: ['java basics only', 'learning java', 'hello world only'],
  },
  python: {
    keywords: ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'pytorch', 'tensorflow', 'scikit-learn', 'asyncio', 'celery', 'pytest', 'pydantic', 'sqlalchemy'],
    contextPhrases: ['production python', 'fastapi microservices', 'ml pipeline', 'async python', 'python backend service'],
    redFlags: ['python beginner', 'learning python', 'basic scripting only'],
  },
  golang: {
    keywords: ['golang', 'go language', 'goroutine', 'goroutines', 'go channels', 'gin framework', 'echo framework', 'gorm', 'grpc', 'protobuf', 'go modules'],
    contextPhrases: ['production go', 'concurrent systems in go', 'high performance go', 'grpc microservices in go'],
    redFlags: ['learning go', 'go basics only'],
  },
  nodejs: {
    keywords: ['node.js', 'nodejs', 'express.js', 'fastify', 'nestjs', 'node runtime', 'node backend', 'node server', 'event loop node', 'npm packages'],
    contextPhrases: ['node production backend', 'event-driven node service', 'high throughput node.js', 'real-time node api'],
    redFlags: ['node beginner', 'learning node'],
  },
  react: {
    keywords: ['react', 'react.js', 'reactjs', 'react native', 'redux toolkit', 'next.js', 'jsx', 'tsx', 'zustand', 'react query', 'tanstack query', 'react router'],
    contextPhrases: ['production react app', 'react component architecture', 'next.js application', 'state management with zustand', 'frontend performance optimization'],
    redFlags: ['learning react', 'tutorial project only'],
  },
  typescript: {
    keywords: ['typescript', 'tsx', 'tsconfig', 'type-safe typescript', 'strict typescript', 'tsc'],
    contextPhrases: ['strict typescript codebase', 'type-safe architecture in typescript', 'shared domain types in typescript'],
    redFlags: ['just started typescript', 'any types everywhere'],
  },
  aws: {
    keywords: ['aws', 'amazon web services', 'aws ec2', 'aws s3', 'aws lambda', 'aws rds', 'dynamodb', 'aws sqs', 'aws sns', 'cloudfront', 'aws iam', 'aws vpc', 'aws eks', 'aws ecs', 'cloudformation', 'terraform aws'],
    contextPhrases: ['aws certified', 'cloud architecture on aws', 'production aws environment', 'serverless on aws', 'infrastructure as code on aws'],
    redFlags: ['no cloud exposure', 'learning aws'],
  },
  kubernetes: {
    keywords: ['kubernetes', 'k8s', 'kubectl', 'helm charts', 'helm chart', 'k8s cluster', 'kubernetes cluster', 'service mesh', 'istio', 'argo cd', 'k8s pod', 'k8s ingress', 'gitops'],
    contextPhrases: ['production k8s cluster', 'managed kubernetes cluster', 'helm charts deployment', 'service mesh in production'],
    redFlags: ['basic docker only', 'no k8s experience'],
  },
  ml: {
    keywords: ['machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 'scikit-learn', 'xgboost', 'nlp', 'computer vision', 'large language model', 'llm', 'model fine-tuning'],
    contextPhrases: ['trained ml model', 'deployed machine learning model', 'ml training pipeline', 'inference latency optimization'],
    redFlags: ['ml basics only', 'course certificate without projects'],
  },
  databases: {
    keywords: ['postgresql', 'postgres', 'mysql', 'mongodb', 'cassandra', 'redis cache', 'elasticsearch', 'sql queries', 'relational database', 'nosql database', 'database schema design', 'database query optimization', 'database indexing', 'database replication', 'acid compliance'],
    contextPhrases: ['database query tuning', 'production schema design', 'connection pooling in postgres', 'database indexing optimization'],
    redFlags: ['basic sql only', 'no database experience'],
  },
  leadership: {
    keywords: ['tech lead', 'team lead', 'engineering lead', 'lead engineer', 'lead developer', 'mentored engineers', 'mentoring junior engineers', 'cross-functional leadership', 'technical roadmap', 'architected solutions'],
    contextPhrases: ['led engineering team', 'mentored software engineers', 'drove technical architecture decisions', 'cross-functional roadmap planning'],
    redFlags: ['no collaboration experience'],
  },
  devops: {
    keywords: ['ci/cd pipeline', 'github actions', 'gitlab ci', 'jenkins pipeline', 'terraform', 'ansible', 'infrastructure as code', 'prometheus monitoring', 'grafana dashboards', 'datadog', 'site reliability engineering', 'sre'],
    contextPhrases: ['automated ci/cd pipeline', 'infrastructure as code with terraform', 'production monitoring with prometheus', 'zero downtime deployments'],
    redFlags: ['manual deployments only', 'no ci/cd exposure'],
  },
  security: {
    keywords: ['application security', 'appsec', 'oauth2', 'oauth 2.0', 'jwt authentication', 'ssl/tls', 'encryption at rest', 'xss prevention', 'sql injection prevention', 'owasp top 10', 'rbac', 'penetration testing'],
    contextPhrases: ['security compliance audit', 'owasp security guidelines', 'authenticated api endpoints', 'vulnerability penetration testing'],
    redFlags: ['no security awareness', 'unauthenticated apis'],
  },
  swift: {
    keywords: ['swift language', 'swiftui', 'uikit', 'xcode', 'core data', 'combine framework', 'ios app development', 'app store release'],
    contextPhrases: ['shipped ios app to app store', 'production swift codebase', 'native ios architecture'],
    redFlags: ['learning swift', 'tutorial app only'],
  },
  kotlin: {
    keywords: ['kotlin language', 'jetpack compose', 'android development', 'kotlin coroutines', 'room db', 'retrofit android', 'play store release'],
    contextPhrases: ['shipped android app to play store', 'production kotlin application', 'jetpack compose ui'],
    redFlags: ['learning android', 'hello world app only'],
  },
  finance: {
    keywords: ['fintech', 'payment gateway', 'upi integration', 'banking software', 'trading platform', 'financial systems', 'pci-dss compliance', 'payment settlement engine', 'double-entry ledger'],
    contextPhrases: ['payment gateway integration', 'high-throughput transaction processing', 'idempotent payment flows', 'financial compliance'],
    redFlags: ['no finance exposure'],
  },
  communication: {
    keywords: ['technical writing', 'authored architecture rfc', 'system design document', 'conducted code reviews', 'technical presentation'],
    contextPhrases: ['authored architecture rfc document', 'comprehensive technical documentation', 'conducted rigorous code reviews', 'presented engineering architecture'],
    redFlags: ['no documentation habits'],
  },
  concurrency: {
    keywords: ['multithreading', 'concurrent programming', 'thread safety', 'thread pool', 'mutex', 'deadlock prevention', 'race condition resolution', 'concurrency control', 'virtual threads'],
    contextPhrases: ['high-concurrency system', 'thread-safe architecture', 'prevented race conditions in production'],
    redFlags: ['no multithreading experience'],
  },
};

export function verifyKeywordInContext(text: string, keyword: string): { inContext: boolean; contextSentences: string[] } {
  const sentences = getSentences(text);
  const experienceMarkers = [
    'built', 'developed', 'designed', 'implemented', 'used', 'worked', 'deployed',
    'architected', 'migrated', 'maintained', 'optimized', 'integrated', 'scaled', 'led',
    'created', 'shipped', 'managed', 'contributed', 'reduced', 'improved', 'automated',
    'engineered', 'packaged', 'tested', 'monitored',
  ];
  const contextSentences = sentences.filter((s) => {
    const sl = s.toLowerCase();
    const hasKw = matchesTokenSafely(s, keyword).found || matchesTokenSafely(sl, keyword).found;
    return hasKw && experienceMarkers.some((m) => sl.includes(m));
  });
  return { inContext: contextSentences.length > 0, contextSentences: contextSentences.slice(0, 2) };
}

export function detectKeywordStuffing(text: string, keywords: string[]): { isStuffing: boolean; stuffingScore: number } {
  const sentences = getSentences(text);
  const totalKeywordsFound = keywords.filter((kw) => matchesTokenSafely(text, kw).found).length;
  const keywordsInContext = keywords.filter((kw) =>
    sentences.some((s) => {
      const sl = s.toLowerCase();
      return (
        matchesTokenSafely(sl, kw).found &&
        /built|developed|designed|implemented|used|worked|deployed|optimized|engineered/.test(sl)
      );
    })
  ).length;
  const ratio = totalKeywordsFound > 0 ? keywordsInContext / totalKeywordsFound : 1.0;
  return {
    isStuffing: totalKeywordsFound >= 4 && ratio < 0.25, // spec-exempt: keyword stuffing context ratio threshold
    stuffingScore: Math.round(ratio * 100),
  };
}

export function parseImpactMetrics(text: string): {
  hasScale: boolean;
  hasMetrics: boolean;
  hasTeamSize: boolean;
  hasProduction: boolean;
  scaleDetails: string[];
  metricDetails: string[];
} {
  const tl = text.toLowerCase();
  const scalePatterns: [RegExp, string][] = [
    [/(\d[\d,.]*)\s*(m|million|billion)\s*(users?|customers?|requests?|transactions?|daily\s+requests?)/gi, 'M/B-scale requests/users'],
    [/(\d[\d,.]*)k?\+?\s*(users?|dau|mau|customers?)/gi, 'user-scale metrics'],
    [/(\d[\d,.]*)\s*(requests?|rps|qps)\s*(per\s*(second|minute|day))?/gi, 'throughput / RPS metrics'],
    [/(\d[\d,.]*)\s*(tb|gb|pb)\s*(of\s*)?(data|storage)/gi, 'data volume scale'],
    [/(\d[\d,.]*)\%\s*(uptime|availability|sla)/gi, 'SLA / uptime metrics'],
  ];
  const metricPatterns: [RegExp, string][] = [
    [/(\d[\d,.]*)\s*%\s*(reduction|improvement|increase|faster|decrease|across)/gi, 'percentage improvement'],
    [/(?:reduc(?:ed?|ing)|decreas(?:ed?|ing)|improv(?:ed?|ing)|cut(?:ting)?)\s+.*?(by\s+\d|latency|time|cost|database\s+cpu)/gi, 'latency/cost reduction'],
    [/(\d+)x\s+(faster|improvement|speedup)/gi, 'speedup multiplier'],
    [/saved?\s+.*?(hours?|\$|dollars?|rupees?|inr|time)/gi, 'operational savings'],
  ];
  const scaleDetails: string[] = [];
  const metricDetails: string[] = [];
  scalePatterns.forEach(([p, label]) => {
    if (new RegExp(p).test(tl)) scaleDetails.push(label);
  });
  metricPatterns.forEach(([p, label]) => {
    if (new RegExp(p).test(tl)) metricDetails.push(label);
  });
  const hasTeamSize = /led\s+(a\s+)?(team\s+of)?\s*\d+|managed\s+\d+\s*(engineers?|developers?|people)|team\s+of\s*\d+/i.test(tl);
  const hasProduction = /production|prod\s+env|live\s+(system|service|app)|deployed\s+to\s+(prod|aws|gcp|azure|cloud)|in\s+production/i.test(tl);
  return { hasScale: scaleDetails.length > 0, hasMetrics: metricDetails.length > 0, hasTeamSize, hasProduction, scaleDetails, metricDetails };
}

export function detectProgressionSignals(text: string): {
  hasProgression: boolean;
  yearsOfExperience: number;
  hasPremiumEdu: boolean;
  hasOpenSource: boolean;
  details: string[];
} {
  const tl = text.toLowerCase();
  let yearsOfExperience = 0;
  const yrMatch = /(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|exp|working|in\s+)/i.exec(tl);
  if (yrMatch) yearsOfExperience = parseInt(yrMatch[1], 10);
  const hasPremiumEdu = /\b(iit|nit|bits\s+pilani|iiit|iisc|iim|mit\b|stanford|berkeley|cmu|carnegie\s+mellon|waterloo|oxford|cambridge)\b/i.test(tl);
  const hasOpenSource = /github\.com\/([\w-]+\/[\w-]+)|open[- ]?source\s+contributor|maintainer\s+of|published\s+(npm|pypi)|(\d+)\s*stars?\s+on\s+github/i.test(tl);
  const hasProgression = /promoted|senior\s+engineer|lead\s+engineer|principal|staff\s+engineer|architect|engineering\s+manager|founded|co-?founded/i.test(tl);
  const details: string[] = [];
  if (yearsOfExperience > 0) details.push(`${yearsOfExperience}+ years experience`);
  if (hasPremiumEdu) details.push('Recognized institution reference');
  if (hasOpenSource) details.push('Open source / public repository presence');
  if (hasProgression) details.push('Career growth signals');
  return { hasProgression, yearsOfExperience, hasPremiumEdu, hasOpenSource, details };
}

/**
 * 6-layer competency analysis evaluating candidate demonstration against a target role requirement.
 * Uses shared tokenizer and bullet scoring primitives for exact consistency with Roaster.
 */
export function deepAnalyzeCompetency(
  resumeText: string,
  competency: string,
  reqLevel: string,
  competencySignalsOverride?: Record<string, { keywords: string[]; contextPhrases: string[]; redFlags: string[] }>
): {
  status: 'expert' | 'strong' | 'working' | 'absent';
  confidence: number;
  evidence: string[];
  gaps: string[];
  layerScores: { l1: number; l2: number; l3: number; l4: number; l5: number };
  contextSentences: string[];
  antiGamingFlag: boolean;
} {
  const text = resumeText.toLowerCase();
  const signals = (competencySignalsOverride && competencySignalsOverride[competency]) ||
    COMPETENCY_SIGNALS[competency] || {
      keywords: [competency],
      contextPhrases: [],
      redFlags: [],
    };

  const resumeData = parseResumeToScoringInput(resumeText);

  // Layer 1: Keyword discovery using boundary-safe token matching
  const kwMatches = signals.keywords.filter(
    (kw) => matchesTokenSafely(resumeText, kw).found || matchesTokenSafely(text, kw).found
  );
  const l1Score = Math.min(100, kwMatches.length * 20);

  // Layer 2: Context verification in experience or project bullets
  const contextResults = kwMatches.map((kw) => verifyKeywordInContext(resumeText, kw)).filter((r) => r.inContext);
  const contextSentences = contextResults.flatMap((r) => r.contextSentences).slice(0, 3);
  const l2Score = contextResults.length > 0 ? Math.min(100, 40 + contextResults.length * 30) : 0;

  // Layer 3: Production depth & ecosystem cues
  const ctxMatches = signals.contextPhrases.filter((phrase) => text.includes(phrase.toLowerCase()));
  const compContextText = contextSentences.join(' ');
  const compImpact = contextSentences.length > 0
    ? parseImpactMetrics(compContextText)
    : { hasScale: false, hasMetrics: false, hasTeamSize: false, hasProduction: false, scaleDetails: [], metricDetails: [] };

  const l3Score = Math.min(100, ctxMatches.length * 35 + (compImpact.hasProduction ? 25 : 0));

  // Layer 4: Impact metrics evaluated ONLY in context where this competency is actually applied
  const l4Score = (compImpact.hasScale ? 35 : 0) + (compImpact.hasMetrics ? 30 : 0) + (compImpact.hasTeamSize ? 20 : 0) + (compImpact.hasProduction ? 15 : 0);

  // Layer 5: Anti-gaming stuffing detection
  const stuffing = detectKeywordStuffing(text, signals.keywords);
  const antiGamingFlag = stuffing.isStuffing;
  const l5Penalty = stuffing.isStuffing ? -25 : 0;

  const redFlagCount = signals.redFlags.filter((rf) => text.includes(rf.toLowerCase())).length;

  const rawScore = (l1Score * 0.20) + (l2Score * 0.35) + (l3Score * 0.20) + (l4Score * 0.25) + l5Penalty - (redFlagCount * 15);
  const clampedScore = Math.max(0, Math.min(100, rawScore));

  let detectedLevel: 'expert' | 'strong' | 'working' | 'absent';
  let confidence: number;

  const isInSkillsBlock = Boolean(
    resumeData.skillsBlockText &&
    signals.keywords.some((kw) => matchesTokenSafely(resumeData.skillsBlockText, kw).found)
  );

  if (kwMatches.length === 0) {
    detectedLevel = 'absent';
    confidence = 0;
  } else if (redFlagCount > 0 && kwMatches.length < 2) {
    detectedLevel = 'absent';
    confidence = 0;
  } else if (contextResults.length === 0) {
    // No experience or project bullet demonstrated this competency
    if (isInSkillsBlock && !antiGamingFlag) {
      detectedLevel = 'working';
      confidence = 25;
    } else {
      // Casual token mention in prose without technical context -> ABSENT
      detectedLevel = 'absent';
      confidence = 0;
    }
  } else if (contextResults.length >= 2 && (compImpact.hasScale || compImpact.hasMetrics || compImpact.hasProduction || clampedScore >= 60)) {
    detectedLevel = 'expert';
    confidence = Math.min(95, Math.max(72, Math.round(clampedScore)));
  } else if (contextResults.length >= 1) {
    detectedLevel = 'strong';
    confidence = Math.min(85, Math.max(50, Math.round(clampedScore)));
  } else {
    detectedLevel = 'working';
    confidence = Math.min(45, Math.max(20, Math.round(clampedScore)));
  }

  const LEVELS = ['working', 'strong', 'expert'];
  const detectedIdx = LEVELS.indexOf(detectedLevel === 'absent' ? 'working' : detectedLevel);
  const requiredIdx = LEVELS.indexOf(reqLevel === 'working' ? 'working' : reqLevel);
  const meetsRequirement = detectedLevel !== 'absent' && detectedIdx >= requiredIdx;

  const evidence: string[] = [];
  const gaps: string[] = [];

  if (detectedLevel === 'absent') {
    // Invariant: An absent competency must NEVER claim false positive evidence
    gaps.push(`${competency.toUpperCase()} is not evidenced in the resume. Build a real proof project demonstrating ${competency.toUpperCase()} before applying.`);
  } else {
    if (contextSentences.length > 0) {
      evidence.push(`Found in ${contextResults.length} project/experience description(s) with action verbs and operational context.`);
    } else if (kwMatches.length > 0) {
      evidence.push(`"${kwMatches[0]}" detected in skills block — evaluated with baseline credit per scoring spec.`);
    }

    if (ctxMatches.length > 0) {
      evidence.push(`Ecosystem signals detected: "${ctxMatches.slice(0, 2).join('", "')}".`);
    }
    if (compImpact.hasScale) {
      evidence.push(`System-scale metrics found (${compImpact.scaleDetails.slice(0, 2).join(', ')}).`);
    }
    if (compImpact.hasMetrics) {
      evidence.push(`Quantified outcomes identified (${compImpact.metricDetails.slice(0, 2).join(', ')}).`);
    }
    if (compImpact.hasProduction) {
      evidence.push('Production deployment or live environment indicators detected.');
    }

    if (antiGamingFlag) {
      gaps.push(`Evidence Depth Note: "${competency.toUpperCase()}" appears primarily in list format. Demonstrate it in project bullets with action verbs.`);
    }
    if (!meetsRequirement) {
      gaps.push(`Role lists "${reqLevel}" proficiency for ${competency.toUpperCase()} while current resume demonstrates "${detectedLevel}". Deepen with quantified project outcomes.`);
    }
  }

  return {
    status: detectedLevel,
    confidence: Math.round(confidence),
    evidence,
    gaps,
    layerScores: {
      l1: Math.round(l1Score),
      l2: Math.round(l2Score),
      l3: Math.round(l3Score),
      l4: Math.round(l4Score),
      l5: stuffing.stuffingScore,
    },
    contextSentences,
    antiGamingFlag,
  };
}

/**
 * Computes the authoritative score for a candidate against a target role.
 * Executes the core scoring engine and returns trace.compositeDisplay (0-100).
 */
export function computeScore(
  roleAnalysis: ReturnType<typeof deepAnalyzeCompetency>[],
  reqLevels: Record<string, string>,
  resumeText: string,
  company?: { name: string; tier: string; industry: string },
  role?: { title: string; level?: string }
): number {
  const validity = validateResumeAuthenticity(resumeText);
  if (!validity.isValid) {
    return 0;
  }

  const resumeData = parseResumeToScoringInput(resumeText);
  if (roleAnalysis.length > 0 && roleAnalysis.every((a) => a.status === 'absent') && resumeData.sectionsFound.length === 0) {
    return 0;
  }

  // 1. Resolve role family from title and competencies
  const compNames = Object.keys(reqLevels).join(' ').toLowerCase();
  const title = (role?.title || '').toLowerCase();
  let roleFamily: ScoringContext['roleFamily'] = 'General';
  if (/frontend|react|ui|web/i.test(title) || /react|typescript/i.test(compNames)) {
    roleFamily = 'Frontend';
  } else if (/backend|api|server|cloud/i.test(title) || /java|golang|python|spring/i.test(compNames)) {
    roleFamily = 'Backend';
  } else if (/data|ml|ai|machine learning/i.test(title) || /ml|python|pytorch/i.test(compNames)) {
    roleFamily = 'Data/ML';
  } else if (/mobile|android|ios/i.test(title) || /kotlin|swift/i.test(compNames)) {
    roleFamily = 'Mobile';
  } else if (/devops|sre|infra/i.test(title) || /kubernetes|aws|docker/i.test(compNames)) {
    roleFamily = 'DevOps';
  }

  // 2. Resolve archetype from company tier/industry (Task 6.4)
  let archetype = 'product_mnc_gcc';
  const tier = (company?.tier || '').toUpperCase();
  const ind = (company?.industry || '').toLowerCase();
  const cName = (company?.name || '').toLowerCase();

  if (/trading|hft|quantitative|quant/i.test(ind) || /tower|graviton|jane street|alphagrep|futures first|quadeye/i.test(cName)) {
    archetype = 'quant_trading';
  } else if (tier === 'FAANG' || tier === 'TECH_GIANT') {
    archetype = 'big_tech_product';
  } else if (tier === 'UNICORN' || /quick commerce|food tech|mobility/i.test(ind)) {
    archetype = 'indian_high_growth';
  } else if (tier === 'IT SERVICES' || tier === 'IT_SERVICES') {
    archetype = 'service_track';
  } else if (tier === 'STARTUP' || tier === 'BOOTSTRAPPED') {
    archetype = 'early_growth_startup';
  } else {
    archetype = 'product_mnc_gcc';
  }

  // 3. Convert role competencies into ConfirmedRequirements
  const confirmedRequirements: ConfirmedRequirement[] = Object.entries(reqLevels).map(([compKey, level], idx) => {
    const isMust = level === 'expert' || level === 'strong';
    return {
      id: `talentlens_req_${idx + 1}_${compKey}`,
      text: compKey,
      category: isMust ? 'must' : 'preferred',
      confidence: 1.0,
      sourceSentence: `${role?.title || 'Target Role'} competency requirement for ${compKey} (${level} level).`,
      inTaxonomy: true,
    };
  });

  const progression = detectProgressionSignals(resumeText);
  const experienceLevel = progression.yearsOfExperience >= 2.0 ? '2+ yrs' : '0-2 yrs';

  const context: ScoringContext = {
    experienceLevel,
    roleFamily,
    jdPresent: true,
    confirmedRequirements,
    jdLevel: (role?.level || '').toLowerCase().includes('senior') ? 'senior' : 'entry',
    archetype,
    candidateYearsExperience: progression.yearsOfExperience,
    requiredYearsExperience: experienceLevel === '2+ yrs' ? 2 : 0,
  };

  const trace = runScoringEngine(context, resumeData, {
    tool: 'talentlens',
    spec: CANONICAL_SCORING_SPEC,
  });

  return trace.compositeDisplay;
}

export const MARKET_INTELLIGENCE: Record<string, {
  currentStandard: string[];
  outdated: string[];
  emerging: string[];
  productionPatterns: string[];
  architectureSignals: string[];
  marketAdoption2024: string;
  redFlags: string[];
}> = {
  java: {
    currentStandard: ['spring boot 3', 'virtual threads', 'graalvm', 'micronaut', 'quarkus', 'java 17', 'java 21', 'records'],
    outdated: ['struts', 'ejb', 'spring 4', 'xml config', 'ant build'],
    emerging: ['project loom', 'graalvm native image', 'spring ai'],
    productionPatterns: ['connection pooling (hikari)', 'circuit breaker (resilience4j)', 'distributed tracing (micrometer/otel)', 'caching (caffeine/redis)'],
    architectureSignals: ['hexagonal architecture', 'clean architecture', 'domain-driven design', 'event-driven microservices'],
    marketAdoption2024: 'Java 17/21 is standard. Spring Boot 3 adoption is high across fintech and tier-1 product engineering.',
    redFlags: ['e.printstacktrace in prod', 'synchronous rest chaining > 4 hops', 'raw jdbc without pool'],
  },
  python: {
    currentStandard: ['fastapi', 'pydantic v2', 'poetry', 'ruff', 'uv', 'asyncio', 'python 3.11+', 'type hints', 'httpx', 'sqlalchemy 2.0'],
    outdated: ['django 1.x', 'python 2', 'pipenv', 'setup.py for new projects'],
    emerging: ['uv (astral)', 'polars', 'marimo', 'litestar'],
    productionPatterns: ['async workers (gunicorn+uvicorn)', 'task queue with backpressure', 'structured logging', 'database migrations in ci/cd'],
    architectureSignals: ['event-driven microservices', 'hexagonal architecture', 'clean repository pattern'],
    marketAdoption2024: 'FastAPI is standard for APIs. Type hints and Pydantic v2 are expected in modern production services.',
    redFlags: ['blocking io inside async def', 'bare except clauses', 'no type hints'],
  },
  golang: {
    currentStandard: ['go 1.21+', 'structured logging (slog)', 'generics', 'context propagation', 'golangci-lint', 'testify', 'sqlc', 'grpc-go'],
    outdated: ['gorilla/mux (archived)', 'glide/dep', 'untyped context values'],
    emerging: ['go 1.22+ routing', 'wasm with go', 'temporal go sdk'],
    productionPatterns: ['graceful shutdown', 'channel buffers for rate limiting', 'errgroup for concurrency', 'prometheus metrics middleware'],
    architectureSignals: ['internal package pattern', 'ports-and-adapters', 'grpc service mesh'],
    marketAdoption2024: 'Go is standard for high-throughput infrastructure and microservices across tech scale-ups.',
    redFlags: ['ignoring returned errors', 'goroutine leaks without context cancellation'],
  },
  react: {
    currentStandard: ['react 18/19', 'next.js 14+ (app router)', 'vite', 'typescript', 'tailwind css', 'zustand', 'tanstack query'],
    outdated: ['class components', 'create-react-app (deprecated)', 'styled-components for new projects'],
    emerging: ['react 19 compiler', 'server components', 'tanstack start'],
    productionPatterns: ['optimistic updates', 'code-splitting / lazy loading', 'virtualized lists', 'error boundaries per route'],
    architectureSignals: ['component-driven architecture', 'design system tokens', 'modular state machines'],
    marketAdoption2024: 'React 18+ with Vite/Next.js and Tailwind is industry standard for modern web applications.',
    redFlags: ['useeffect for derived state', 'unmemoized expensive computations in render'],
  },
  typescript: {
    currentStandard: ['typescript 5.x', 'strict: true', 'zod', 'satisfies operator', 'template literal types'],
    outdated: ['any everywhere', 'tslint (deprecated)', 'namespaces'],
    emerging: ['isolated declarations', 'type-level programming patterns'],
    productionPatterns: ['branded types for ids', 'exhaustive switch checks', 'discriminated unions'],
    architectureSignals: ['monorepo sharing types between fe/be', 'contract-first api design'],
    marketAdoption2024: 'Strict TypeScript is universal across tier-1 software companies.',
    redFlags: ['any types in public interfaces', 'ts-ignore without tracking comments'],
  },
  kubernetes: {
    currentStandard: ['k8s 1.28+', 'helm 3', 'kustomize', 'argo cd (gitops)', 'istio/linkerd', 'prometheus operator'],
    outdated: ['helm 2 (tiller)', 'manual kubectl apply in prod', 'dockershim'],
    emerging: ['gateway api', 'karpenter', 'cilium mesh'],
    productionPatterns: ['pod disruption budgets', 'resource requests/limits', 'readiness and liveness probes'],
    architectureSignals: ['gitops deployment pipelines', 'canary rollouts'],
    marketAdoption2024: 'ArgoCD + Helm is standard. Production clusters mandate strict security standards.',
    redFlags: ['containers running as root', 'no resource limits', 'plain secrets in git'],
  },
  aws: {
    currentStandard: ['aws cdk v2', 'terraform 1.6+', 'lambda with arm/graviton', 'ecs fargate', 'aurora serverless v2', 'eventbridge', 'secrets manager'],
    outdated: ['cloudformation raw json/yaml', 'ec2 without auto-scaling', 's3 without encryption'],
    emerging: ['graviton 4', 'bedrock', 'lambda response streaming'],
    productionPatterns: ['least-privilege iam roles', 'vpc private subnets with nat gateways', 'cloudwatch alarms with sns routing'],
    architectureSignals: ['well-architected framework', 'multi-account landing zone'],
    marketAdoption2024: 'CDK/Terraform is standard for IaC. Serverless-first is prevalent for APIs and event handling.',
    redFlags: ['root account api keys', 'security groups with 0.0.0.0/0 on db ports'],
  },
  dsa: {
    currentStandard: ['neetcode 150 patterns', 'two pointers', 'sliding window', 'monotonic stack', 'trie', 'union-find', 'bfs/dfs', 'dynamic programming', 'topological sort'],
    outdated: ['bubble sort in production contexts', 'recursion without memoization on exponential problems'],
    emerging: ['algorithmic formulation under live collaborative review'],
    productionPatterns: ['cache-aware data structures', 'bloom filters', 'consistent hashing', 'lru cache with o(1) operations'],
    architectureSignals: ['algorithm selection based on p99 latency constraints'],
    marketAdoption2024: 'Problem solving proficiency is an established technical filter for global product firms.',
    redFlags: ['o(n^2) nested loops on unbounded user input'],
  },
  systemdesign: {
    currentStandard: ['caching tiers (redis/cdn)', 'rate limiting (token bucket)', 'idempotency keys', 'message brokers (kafka/sqs)', 'database sharding', 'read replicas'],
    outdated: ['monolith without horizontal scalability plan', 'single database without failover'],
    emerging: ['event sourcing with cqrs', 'distributed tracing with opentelemetry', 'cell-based architecture'],
    productionPatterns: ['circuit breaker', 'retry with exponential backoff and jitter', 'dead letter queues', 'graceful degradation'],
    architectureSignals: ['cap theorem trade-off justification', 'p99 latency budget planning'],
    marketAdoption2024: 'System design evaluation is standard for mid, senior, and staff roles.',
    redFlags: ['single point of failure', 'no caching tier', 'synchronous blocking chains'],
  },
};

export interface MarketIntelligenceReport {
  overallMarketFit: number;
  buildAuthenticity: number;
  techCurrencyScore: number;
  fundamentalDepth: number;
  findings: {
    category: string;
    icon: string;
    status: 'cutting-edge' | 'current' | 'dated' | 'critical';
    finding: string;
    marketContext: string;
    evidence: string[];
  }[];
  stackCurrency: {
    modernPractices: string[];
    outdatedSignals: string[];
    emergingAdoption: string[];
    missingForMarket: string[];
  };
  buildVerdict: string;
  marketPosition: 'Industry Leader' | 'Market Current' | 'Needs Modernization' | 'Significantly Behind';
}

export function runMarketIntelligenceEngine(
  resumeText: string,
  competencies: string[],
  company: { name: string; tier: string; industry: string },
  role: { title: string }
): MarketIntelligenceReport {
  const text = resumeText.toLowerCase();

  const findings: MarketIntelligenceReport['findings'] = [];
  const modernPractices: string[] = [];
  const outdatedSignals: string[] = [];
  const emergingAdoption: string[] = [];
  const missingForMarket: string[] = [];

  let modernScore = 0;
  let outdatedPenalty = 0;
  let emergingBonus = 0;
  let fundamentalScore = 0;

  competencies.forEach((comp) => {
    const intel = MARKET_INTELLIGENCE[comp];
    if (!intel) return;

    const foundModern = intel.currentStandard.filter((s) => text.includes(s));
    const foundOutdated = intel.outdated.filter((s) => text.includes(s));
    const foundEmerging = intel.emerging.filter((s) => text.includes(s));
    const foundProduction = intel.productionPatterns.filter((s) => text.includes(s));
    const foundArchitecture = intel.architectureSignals.filter((s) => text.includes(s));
    const foundRedFlags = intel.redFlags.filter((s) => text.includes(s));

    foundModern.forEach((m) => modernPractices.push(`${comp.toUpperCase()}: ${m}`));
    foundOutdated.forEach((o) => outdatedSignals.push(`${comp.toUpperCase()}: ${o}`));
    foundEmerging.forEach((e) => emergingAdoption.push(`${comp.toUpperCase()}: ${e}`));

    const compModernRatio =
      (foundModern.length + foundEmerging.length * 1.5) /
      Math.max(1, intel.currentStandard.length * 0.3);
    const compProductionDepth = foundProduction.length + foundArchitecture.length;

    modernScore += Math.min(100, compModernRatio * 100);
    outdatedPenalty += foundOutdated.length * 12 + foundRedFlags.length * 20;
    emergingBonus += foundEmerging.length * 8;
    fundamentalScore += compProductionDepth * 10;

    const compScore = Math.min(
      100,
      Math.max(
        0,
        compModernRatio * 60 +
          compProductionDepth * 8 -
          foundOutdated.length * 15 -
          foundRedFlags.length * 25 +
          foundEmerging.length * 10
      )
    );

    let status: 'cutting-edge' | 'current' | 'dated' | 'critical';
    let icon: string;
    let finding: string;

    if (foundRedFlags.length > 0) {
      status = 'critical';
      icon = '🚨';
      const flagList = foundRedFlags.slice(0, 2).join(', ');
      finding = `Practice note: Resume references ${flagList}. Production environments at ${company.name} typically emphasize ${foundModern.slice(0, 2).join(', ') || intel.currentStandard.slice(0, 2).join(', ')}.`;
    } else if (compScore >= 70 || foundEmerging.length >= 2) {
      status = 'cutting-edge';
      icon = '⚡';
      finding = `Demonstrates modern ${comp.toUpperCase()} usage: ${foundModern.slice(0, 3).join(', ')}${foundEmerging.length ? ` + emerging: ${foundEmerging[0]}` : ''}. Aligns with contemporary engineering standards.`;
    } else if (compScore >= 40 || foundModern.length >= 2) {
      status = 'current';
      icon = '✓';
      finding = `${comp.toUpperCase()} usage appears current (${foundModern.slice(0, 2).join(', ')}) with baseline production familiarity. ${company.tier} expectations: ${intel.productionPatterns.slice(0, 3).join(', ')}.`;
    } else if (foundOutdated.length > 0) {
      status = 'dated';
      icon = '⚠';
      const outdatedList = foundOutdated.slice(0, 2).join(', ');
      finding = `${comp.toUpperCase()} stack appears dated (${outdatedList}). ${intel.marketAdoption2024} Add at least 2 modern practices to enhance competitiveness.`;
    } else {
      status = 'current';
      icon = '◑';
      finding = `${comp.toUpperCase()} signals are present but insufficient to assess production depth. Market standard: ${intel.marketAdoption2024}`;
    }

    if (intel.currentStandard.every((s) => !text.includes(s))) {
      missingForMarket.push(`${comp.toUpperCase()}: No contemporary standard practices found (reference: ${intel.currentStandard.slice(0, 3).join(', ')})`);
    }

    findings.push({
      category: comp.toUpperCase(),
      icon,
      status,
      finding,
      marketContext: intel.marketAdoption2024,
      evidence: [
        ...foundModern.slice(0, 3).map((m) => `Current: "${m}"`),
        ...foundEmerging.slice(0, 2).map((e) => `Emerging: "${e}"`),
        ...foundProduction.slice(0, 2).map((p) => `Production pattern: "${p}"`),
        ...foundOutdated.slice(0, 2).map((o) => `Dated reference: "${o}"`),
        ...foundRedFlags.slice(0, 2).map((r) => `Practice note: "${r}"`),
      ].filter(Boolean).slice(0, 5),
    });
  });

  const hasMultipleProjects = (text.match(/project|built|developed|created|shipped|launched/gi) || []).length >= 4;
  const hasTeamContext = /team of \d+|led \d+|managed \d+|collaborated with|cross.functional/i.test(text);
  const hasOpenSource = /github\.com|open.?source|contributor|stars|fork|pull request|pr merged/i.test(text);
  const hasDeployment = /deployed|production|live|aws|gcp|azure|vercel|heroku|docker|kubernetes/i.test(text);
  const hasMonitoring = /monitoring|observability|prometheus|grafana|datadog|sentry|new relic|cloudwatch|logging/i.test(text);
  const hasTesting = /unit test|integration test|e2e|tdd|jest|pytest|junit|coverage|ci.?cd/i.test(text);
  const hasDocumentation = /documented|architecture doc|rfc|adr|confluence|wiki|readme|swagger|openapi/i.test(text);

  const buildAuthFactors = [hasMultipleProjects, hasTeamContext, hasOpenSource, hasDeployment, hasMonitoring, hasTesting, hasDocumentation];
  const buildAuthScore = Math.round((buildAuthFactors.filter(Boolean).length / buildAuthFactors.length) * 100);

  const n = competencies.length || 1;
  const techCurrency = Math.min(99, Math.max(5, Math.round(modernScore / n - outdatedPenalty / n + emergingBonus)));
  const fundamentalDepth = Math.min(99, Math.max(5, Math.round((fundamentalScore / n) * 3)));
  const overallMarketFit = Math.round(techCurrency * 0.40 + buildAuthScore * 0.35 + fundamentalDepth * 0.25); // spec-exempt: market intelligence diagnostic weight blend

  let marketPosition: MarketIntelligenceReport['marketPosition'];
  let buildVerdict: string;
  if (overallMarketFit >= 75) {
    marketPosition = 'Industry Leader';
    buildVerdict = `Stack and build patterns align strongly with current engineering standards at ${company.name}. Strong candidate profile for initial screening review.`;
  } else if (overallMarketFit >= 55) {
    marketPosition = 'Market Current';
    buildVerdict = `Core stack is current with good foundational breadth. 4-8 weeks of targeted project modernization would strengthen application standing.`;
  } else if (overallMarketFit >= 35) {
    marketPosition = 'Needs Modernization';
    buildVerdict = `Several key technologies appear legacy relative to modern industry practices. Focus on documenting ${outdatedSignals.length} modern engineering practices.`;
  } else {
    marketPosition = 'Significantly Behind';
    buildVerdict = `Stack shows limited alignment with modern production workflows. Structured 3-6 month plan recommended covering current frameworks and automated testing.`;
  }

  return {
    overallMarketFit: Math.min(99, Math.max(5, overallMarketFit)),
    buildAuthenticity: buildAuthScore,
    techCurrencyScore: Math.min(99, Math.max(5, techCurrency)),
    fundamentalDepth: Math.min(99, Math.max(5, fundamentalDepth)),
    findings,
    stackCurrency: { modernPractices, outdatedSignals, emergingAdoption, missingForMarket },
    buildVerdict,
    marketPosition,
  };
}

/**
 * Generates prioritized improvement plans classified by closability.
 * Follows Rule F14 & Rule F12: Never promises "gap closed"; always says "builds evidence for".
 * Includes what-if delta rescore ranges and bullet templates with placeholders.
 */
export function generateImprovementPlan(
  breakdown: { competency: string; reqLevel: string; analysis: ReturnType<typeof deepAnalyzeCompetency> }[],
  company: { name: string; tier: string; industry: string },
  role: { title: string; desc: string },
  score: number
): {
  priority: 'critical' | 'high' | 'medium';
  title: string;
  detail: string;
  timeframe: string;
  closability: '7 days' | '30 days' | '90+ days' | 'not closable by resume alone';
  suggestedAction: string;
  hypotheticalScoreGain: string;
  bulletTemplate: string;
  resources: string[];
}[] {
  const plans: {
    priority: 'critical' | 'high' | 'medium';
    title: string;
    detail: string;
    timeframe: string;
    closability: '7 days' | '30 days' | '90+ days' | 'not closable by resume alone';
    suggestedAction: string;
    hypotheticalScoreGain: string;
    bulletTemplate: string;
    resources: string[];
  }[] = [];

  const SKILL_RESOURCES: Record<string, string[]> = {
    dsa: ['NeetCode 150 → Blind 75 patterns (NeetCode.io, free)', 'CTCI — Gayle Laakmann McDowell', 'Codeforces Div.2 A-D practice rounds'],
    systemdesign: ['Designing Data-Intensive Applications — Martin Kleppmann', 'System Design Interview Vol.1 — Alex Xu', 'ByteByteGo public engineering architecture guides'],
    java: ['Effective Java 3rd Ed. — Joshua Bloch', 'Production Spring Boot guides (Baeldung.com)', 'Build high-throughput microservice in Java 17+ with metrics'],
    python: ['Fluent Python 2nd Ed. — Luciano Ramalho', 'FastAPI production tutorials (Real Python)', 'Deploy ML inference endpoint with FastAPI and Docker'],
    golang: ['Effective Go + A Tour of Go (golang.org, official)', 'Build concurrent Go microservices with goroutines and gRPC'],
    react: ['Epic React — Kent C. Dodds', 'Joy of React — Josh Comeau', 'Build full-stack app with React 18, Vite, and Zustand'],
    typescript: ['Total TypeScript — Matt Pocock', 'TypeScript Deep Dive — Basarat Ali Syed', 'Migrate project to strict TypeScript with zero any'],
    kubernetes: ['Kubernetes The Hard Way — Kelsey Hightower', 'CKA official curriculum (Linux Foundation)', 'Deploy multi-service app with Helm charts and monitoring'],
    aws: ['AWS Solutions Architect Associate SAA-C03 curriculum', 'Cloud Resume Challenge (cloudresumechallenge.dev)', 'Deploy serverless app with API Gateway, Lambda, and DynamoDB'],
  };

  // 1. Missing Must-Have Competencies (90+ days for fundamentals, 30 days for domain technologies)
  breakdown
    .filter((b) => b.analysis.status === 'absent')
    .forEach((b) => {
      const isFundamental = ['dsa', 'systemdesign', 'algorithms'].includes(b.competency);
      const closability = isFundamental ? '90+ days' : '30 days';
      const timeframe = isFundamental ? '12-week roadmap' : '4-6 weeks';
      const minGain = 3;
      const maxGain = 6;
      const projectedMin = Math.min(100, score + minGain);
      const projectedMax = Math.min(100, score + maxGain);

      plans.push({
        priority: 'critical',
        title: `Build Evidence for Missing Competency: ${b.competency.toUpperCase()}`,
        detail: `"${role.title}" lists ${b.competency.toUpperCase()} as a core expectation. Resume currently contains zero verified project or work mentions. Action plan: (1) Build a working proof project, (2) Document implementation decisions with metrics, (3) Update resume bullets using STAR format.`,
        timeframe,
        closability,
        suggestedAction: isFundamental
          ? `Complete structured algorithmic patterns (two pointers, trees, graphs) and document problem-solving approaches.`
          : `Deploy an open-source project showcasing production patterns in ${b.competency.toUpperCase()} with automated tests.`,
        hypotheticalScoreGain: `+${minGain} to +${maxGain} pts (Estimate: ${projectedMin} to ${projectedMax}) if you add real evidence`,
        bulletTemplate: `Built {{feature/system}} with ${b.competency.toUpperCase()}, achieving {{result you measured}} across {{scale}} requests/users.`,
        resources: SKILL_RESOURCES[b.competency] || [`Official ${b.competency} documentation`, `Build 2 practical projects with ${b.competency}`, `Open-source contributions`],
      });
    });

  // 2. Partial Evidence (Working level -> Strong/Expert) - Closable in 7 to 30 days
  breakdown
    .filter((b) => b.analysis.status === 'working' && (b.reqLevel === 'expert' || b.reqLevel === 'strong'))
    .forEach((b) => {
      const minGain = 2;
      const maxGain = 4;
      const projectedMin = Math.min(100, score + minGain);
      const projectedMax = Math.min(100, score + maxGain);

      plans.push({
        priority: 'high',
        title: `Deepen ${b.competency.toUpperCase()} Evidence: Skills List → Active Project Bullets`,
        detail: `Resume references ${b.competency.toUpperCase()} primarily in list format. To increase evaluation confidence at ${company.name}, articulate technical decisions and measurable outcomes in project bullets.`,
        timeframe: '7-14 days focused rewrite',
        closability: '7 days',
        suggestedAction: `Rewrite project bullets to name specific tools, versions, and system scale metrics achieved with ${b.competency.toUpperCase()}.`,
        hypotheticalScoreGain: `+${minGain} to +${maxGain} pts (Estimate: ${projectedMin} to ${projectedMax}) if you add real evidence`,
        bulletTemplate: `Utilized ${b.competency.toUpperCase()} to architect {{specific component}}, improving {{measured metric}} by {{result you measured}}.`,
        resources: [`Deploy project with documented scale`, `Add benchmarks/tests to repository`, `Write engineering post on lessons learned`],
      });
    });

  // 3. Keyword Stuffing Flag - 7-day rewrite
  breakdown
    .filter((b) => b.analysis.antiGamingFlag)
    .forEach((b) => {
      plans.push({
        priority: 'high',
        title: `Rewrite ${b.competency.toUpperCase()} Mentions — Excessive List Format Detected`,
        detail: `TalentLens detected that "${b.competency.toUpperCase()}" appears repeatedly outside project descriptions. Embed technical skills directly into project narratives with action verbs.`,
        timeframe: '3-5 days',
        closability: '7 days',
        suggestedAction: `Remove raw skill keyword repetitions and integrate into STAR bullet points.`,
        hypotheticalScoreGain: `+2 to +4 pts (improves parser friendliness & evidence quality)`,
        bulletTemplate: `Engineered {{module}} using ${b.competency.toUpperCase()}, optimizing {{metric}} by {{result you measured}}.`,
        resources: ['Google XYZ bullet format guide', 'Clean code resume principles'],
      });
    });

  // 4. Quantified Metrics Gap
  const anyNoMetrics = breakdown.some(
    (b) => b.analysis.status !== 'absent' && !b.analysis.evidence.some((e) => e.includes('metrics') || e.includes('scale'))
  );
  if (anyNoMetrics) {
    plans.push({
      priority: 'medium',
      title: 'Quantify Engineering Accomplishments with Numerical Metrics',
      detail: `Engineering screeners at ${company.name} prioritize verifiable impact. Add numerical indicators answering: How many users? What throughput or latency? What percentage improvement?`,
      timeframe: '3-5 days',
      closability: '7 days',
      suggestedAction: `Review each bullet point and attach a measured outcome (e.g. p99 latency reduction, user volume, test coverage).`,
      hypotheticalScoreGain: '+3 to +5 pts in Evidence Quality if you add real metrics',
      bulletTemplate: `Optimized {{subsystem}} resulting in {{result you measured}} (reduced p99 from {{before}} to {{after}}).`,
      resources: ['STAR method for technical resumes', 'Engineering metric framing guides'],
    });
  }

  // Tier guidance roadmap
  const tierAdvice: Record<string, string> = {
    FAANG: `${company.name} screening pipeline typically evaluates: algorithmic correctness, clean modular code, and behavioral depth. Current readiness estimate: ${score}%.`,
    Unicorn: `${company.name} emphasizes product execution velocity and end-to-end feature ownership. Prepare working demo links and architecture stories.`,
    MNC: `${company.name} values disciplined engineering practices, automated testing (JUnit/Jest), and robust enterprise architecture.`,
    'IT Services': `${company.name} recruitment evaluates foundational programming syntax, standard ATS document layout, and NQT assessment standing.`,
    Startup: `${company.name} evaluates live URLs, shipped GitHub projects, and autonomous full-stack execution velocity.`,
    Enterprise: `${company.name} prioritizes clean OOP patterns, database query performance, and long-term maintainability.`,
  };

  plans.push({
    priority: 'medium',
    title: `${company.name} Technical Preparation Direction`,
    detail: tierAdvice[company.tier] || `Review public engineering publications for ${company.name} to understand architectural stack priorities.`,
    timeframe: '2-4 weeks',
    closability: '30 days',
    suggestedAction: 'Align project portfolio with primary stack components used at target company tier.',
    hypotheticalScoreGain: 'Increases contextual relevance in technical interview rounds',
    bulletTemplate: `Built {{project}} aligning with ${company.name} engineering stack; validated with {{test suite / metric}}.`,
    resources: [`"${company.name} engineering blog"`, `Public interview experience archives`],
  });

  return plans.slice(0, 7);
}

export type CompetencyAnalysis = ReturnType<typeof deepAnalyzeCompetency>;
export type ImprovementPlan = ReturnType<typeof generateImprovementPlan>;

export interface AnalysisResult {
  score: number;
  breakdown: {
    competency: string;
    reqLevel: string;
    analysis: CompetencyAnalysis;
  }[];
  plans: ImprovementPlan;
  marketIntel: MarketIntelligenceReport;
  trace: ScoreTrace;
  readinessLabel: 'Within reach' | 'Stretch' | 'Far';
  band: ScoreBand;
  eligibilityStatus?: EligibilityGateResult;
  isValidResume?: boolean;
  invalidReason?: string;
  invalidIssues?: string[];
}

/**
 * Main comprehensive analysis runner for TalentLens.
 * Evaluates candidate against target company role using CANONICAL_SCORING_SPEC.
 * Produces authoritative ScoreTrace, sensitivity band, and eligibility status.
 */
export function analyzeRoleMatch(
  resumeText: string,
  company: Company,
  role: Role,
  intake?: EligibilityCandidateInput
): AnalysisResult {
  const reqLevelMap = (role.reqLevel as unknown as Record<string, string>) || {};

  // Level 1 Gatekeeper: Reject non-resume text with score 0 and unscoreable explanation
  const validity = validateResumeAuthenticity(resumeText);
  if (!validity.isValid) {
    const dummyTrace: ScoreTrace = {
      tool: 'talentlens',
      specVersion: CANONICAL_SCORING_SPEC.specVersion,
      engineVersion: CANONICAL_SCORING_SPEC.engineVersion,
      specFingerprint: 'unscoreable_non_resume',
      context: {
        experienceLevel: '0-2 yrs',
        roleFamily: 'General',
        jdPresent: true,
        confirmedRequirements: [],
        jdLevel: 'entry',
        archetype: 'product_mnc_gcc',
        candidateYearsExperience: 0,
        requiredYearsExperience: 0,
      },
      profileId: 'fresher',
      pillars: [],
      adjustments: [],
      composite: 0,
      compositeDisplay: 0,
      band: {
        low: 0,
        high: 0,
        width: 0,
        label: 'Sensitive',
      },
      confidence: 1.0,
      warnings: [validity.reason || 'Document not recognized as an authentic resume.'],
      advisories: validity.issues,
    };

    const emptyBreakdown = role.competencies.map((comp) => ({
      competency: comp,
      reqLevel: reqLevelMap[comp] || 'working',
      analysis: {
        status: 'absent' as const,
        confidence: 0,
        evidence: [],
        gaps: [validity.reason || 'Document not recognized as an authentic resume.'],
        layerScores: { l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 },
        contextSentences: [],
        antiGamingFlag: false,
      },
    }));

    return {
      score: 0,
      breakdown: emptyBreakdown,
      plans: [
        {
          priority: 'critical',
          title: 'Provide a Genuine Technical Resume',
          detail: validity.reason || 'The text provided does not contain recognizable resume sections (Experience, Education, Projects, Skills) or sufficient technical vocabulary. TalentLens requires a real resume to perform placement readiness calibration.',
          timeframe: 'Immediate',
          closability: 'not closable by resume alone',
          suggestedAction: 'Upload or paste an authentic technical resume containing your educational qualifications, project portfolio, and technical skills.',
          hypotheticalScoreGain: 'Enables calibrated readiness scoring and personalized gap analysis',
          bulletTemplate: 'Education: [Degree] from [Institution] | Technical Skills: [Languages, Frameworks] | Projects: [Title, Tools, Scale]',
          resources: ['Use HireFlow Verified Engineering Sample Resume', 'Google XYZ Resume Formula Guide'],
        },
      ],
      marketIntel: {
        overallMarketFit: 0,
        buildAuthenticity: 0,
        techCurrencyScore: 0,
        fundamentalDepth: 0,
        findings: [
          {
            category: 'Document Authenticity',
            icon: '⚠️',
            status: 'critical',
            finding: 'Non-Resume Input Detected',
            marketContext: validity.reason || 'TalentLens requires an authentic engineering resume to evaluate.',
            evidence: [],
          },
        ],
        stackCurrency: {
          modernPractices: [],
          outdatedSignals: [],
          emergingAdoption: [],
          missingForMarket: ['Standard Resume Headings (Experience, Skills, Education)'],
        },
        buildVerdict: 'Unscoreable: Submitted document lacks resume structure or career credentials.',
        marketPosition: 'Significantly Behind',
      },
      trace: dummyTrace,
      readinessLabel: 'Far',
      band: dummyTrace.band,
      isValidResume: false,
      invalidReason: validity.reason,
      invalidIssues: validity.issues,
    };
  }
  const breakdown = role.competencies.map((comp) => ({
    competency: comp,
    reqLevel: reqLevelMap[comp] || 'working',
    analysis: deepAnalyzeCompetency(resumeText, comp, reqLevelMap[comp] || 'working'),
  }));

  const resumeData = parseResumeToScoringInput(resumeText);

  // 1. Resolve role family
  const compNames = role.competencies.join(' ').toLowerCase();
  const title = (role.title || '').toLowerCase();
  let roleFamily: ScoringContext['roleFamily'] = 'General';
  if (/frontend|react|ui|web/i.test(title) || /react|typescript/i.test(compNames)) {
    roleFamily = 'Frontend';
  } else if (/backend|api|server|cloud/i.test(title) || /java|golang|python|spring/i.test(compNames)) {
    roleFamily = 'Backend';
  } else if (/data|ml|ai|machine learning/i.test(title) || /ml|python|pytorch/i.test(compNames)) {
    roleFamily = 'Data/ML';
  } else if (/mobile|android|ios/i.test(title) || /kotlin|swift/i.test(compNames)) {
    roleFamily = 'Mobile';
  } else if (/devops|sre|infra/i.test(title) || /kubernetes|aws|docker/i.test(compNames)) {
    roleFamily = 'DevOps';
  }

  // 2. Resolve archetype (Task 6.4)
  let archetype = 'product_mnc_gcc';
  const tier = (company.tier || '').toUpperCase();
  const ind = (company.industry || '').toLowerCase();
  const cName = (company.name || '').toLowerCase();

  if (/trading|hft|quantitative|quant/i.test(ind) || /tower|graviton|jane street|alphagrep|futures first|quadeye/i.test(cName)) {
    archetype = 'quant_trading';
  } else if (tier === 'FAANG' || tier === 'TECH_GIANT') {
    archetype = 'big_tech_product';
  } else if (tier === 'UNICORN' || /quick commerce|food tech|mobility/i.test(ind)) {
    archetype = 'indian_high_growth';
  } else if (tier === 'IT SERVICES' || tier === 'IT_SERVICES') {
    archetype = 'service_track';
  } else if (tier === 'STARTUP' || tier === 'BOOTSTRAPPED') {
    archetype = 'early_growth_startup';
  } else {
    archetype = 'product_mnc_gcc';
  }

  // 3. Build confirmed requirements
  const confirmedRequirements: ConfirmedRequirement[] = role.competencies.map((compKey, idx) => {
    const level = reqLevelMap[compKey] || 'working';
    const isMust = level === 'expert' || level === 'strong';
    return {
      id: `tl_req_${idx + 1}_${compKey}`,
      text: compKey,
      category: isMust ? 'must' : 'preferred',
      confidence: 1.0,
      sourceSentence: `${role.title} requirement for ${compKey} (${level} level).`,
      inTaxonomy: true,
    };
  });

  const progression = detectProgressionSignals(resumeText);
  const experienceLevel = progression.yearsOfExperience >= 2.0 ? '2+ yrs' : '0-2 yrs';

  const context: ScoringContext = {
    experienceLevel,
    roleFamily,
    jdPresent: true,
    confirmedRequirements,
    jdLevel: (role.level || '').toLowerCase().includes('senior') ? 'senior' : 'entry',
    archetype,
    candidateYearsExperience: progression.yearsOfExperience,
    requiredYearsExperience: experienceLevel === '2+ yrs' ? 2 : 0,
    candidateCgpa: intake?.cgpa,
    candidateBatchYear: intake?.batchYear,
  };

  const trace = runScoringEngine(context, resumeData, {
    tool: 'talentlens',
    spec: CANONICAL_SCORING_SPEC,
  });

  const score = trace.compositeDisplay;
  const plans = generateImprovementPlan(breakdown, company, role, score);
  const marketIntel = runMarketIntelligenceEngine(resumeText, role.competencies, company, role);

  // Label from CANONICAL_SCORING_SPEC thresholds
  const { labelThresholds } = CANONICAL_SCORING_SPEC;
  const readinessLabel: 'Within reach' | 'Stretch' | 'Far' =
    score >= labelThresholds.withinReach
      ? 'Within reach'
      : score >= labelThresholds.stretch
      ? 'Stretch'
      : 'Far';

  // Evaluate eligibility gate
  const matchedMarketEntry =
    MARKET_ENTRIES.find((e) => e.id.toLowerCase() === company.id.toLowerCase()) ||
    MARKET_ENTRIES.find((e) => e.archetype === archetype);

  const eligibilityStatus = intake
    ? evaluateEligibilityGate(intake, matchedMarketEntry)
    : undefined;

  return {
    score,
    breakdown,
    plans,
    marketIntel,
    trace,
    readinessLabel,
    band: trace.band,
    eligibilityStatus,
  };
}

export const findCompanyBySlug = (slug: string, companyCatalog: Company[] = []): Company | undefined => {
  if (!slug) return undefined;
  const normalized = slug.toLowerCase().trim();
  const cleaned = normalized.replace(/[^a-z0-9]/g, '');
  return companyCatalog.find((c) => {
    const slugName = getCompanySlug(c.name);
    const slugId = getCompanySlug(c.id);
    const cleanName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanId = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (
      slugName === normalized ||
      slugId === normalized ||
      c.id.toLowerCase() === normalized ||
      cleanName === cleaned ||
      cleanId === cleaned ||
      (cleaned.length >= 5 && (cleanName.includes(cleaned) || cleanId.includes(cleaned)))
    );
  });
};

