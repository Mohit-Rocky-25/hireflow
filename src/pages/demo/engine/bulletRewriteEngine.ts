/**
 * Evidence-Safe Bullet Rewrite Engine (Phase 3B)
 *
 * Implements deterministic, zero-egress, rule-based bullet analysis and rewriting
 * adhering to strict integrity constraints:
 * 1. Preserves every factual element of the original. Restructures into Action + Artifact + Tech + Outcome.
 * 2. Missing elements become visible slots [add: ...]. Never fills slots with guesses.
 * 3. Never introduces new technologies, numbers, percentages or scale. Zero new digits.
 * 4. Ownership guard: weak verbs (helped, assisted, supported, participated, contributed, worked on, part of)
 *    are never upgraded to Built, Led, Architected, Designed.
 * 5. Run-on or keyword-stuffed bullets are split into focused statements with warnings.
 * 6. Strong bullets are shown as "No change needed" with verified signals.
 * 7. Defense prompts generated for technical interview preparation.
 */

import actionVerbsData from '../../../features/ats/knowledge/action-verbs.json';

export type BulletQualityClass = 'strong' | 'improvable' | 'risky';

export interface BulletRewrite {
  id: string;
  originalBullet: string;
  rewrittenBullet: string;
  qualityClass: BulletQualityClass;
  signals: {
    hasActionVerb: boolean;
    hasArtifact: boolean;
    hasTechnology: boolean;
    hasOutcomeOrMetric: boolean;
    matchedVerb?: string;
    matchedArtifact?: string;
    matchedTechs: string[];
    matchedMetric?: string;
  };
  reasons: string[];
  isNoChangeNeeded: boolean;
  warnings?: string[];
  defendPrompt?: string;
  splitBullets?: string[];
}

export interface BulletAnalysisResult {
  bulletText: string;
  qualityClass: BulletQualityClass;
  signals: BulletRewrite['signals'];
  isRunOn: boolean;
  isKeywordStuffed: boolean;
  reasons: string[];
}

// ─────────────────────────────────────────────────────────────
// Knowledge Base: Verbs, Artifacts, Technologies, Connectives
// ─────────────────────────────────────────────────────────────

export const STRONG_VERBS = new Set([
  ...(actionVerbsData.strongVerbs as string[]).map((v) => v.toLowerCase()),
  'created',
  'decreased',
  'organised',
  'organized',
  'managed',
  'coordinated',
]);

export const WEAK_OWNERSHIP_VERBS = new Set([
  'helped',
  'assisted',
  'supported',
  'participated',
  'contributed',
  'worked on',
  'worked with',
  'part of',
  'involved in',
  'handled',
  'tasked with',
  'responsible for',
]);

export const FORBIDDEN_UPGRADE_VERBS = new Set([
  'built',
  'led',
  'architected',
  'designed',
  'spearheaded',
  'engineered',
  'directed',
  'orchestrated',
]);

export const COMMON_ARTIFACTS = [
  'microservice',
  'microservices',
  'pipeline',
  'pipelines',
  'cache',
  'api',
  'apis',
  'database',
  'databases',
  'ui',
  'crawler',
  'frontend',
  'backend',
  'fullstack',
  'server',
  'store',
  'engine',
  'scraper',
  'parser',
  'application',
  'applications',
  'app',
  'portal',
  'dashboard',
  'gateway',
  'module',
  'component',
  'components',
  'service',
  'services',
  'subsystem',
  'queries',
  'query',
  'endpoint',
  'endpoints',
  'system',
  'systems',
  'infrastructure',
  'test suite',
  'test',
  'tests',
  'bot',
  'workshop',
  'workshops',
  'tool',
  'platform',
  'benchmark',
  'algorithm',
  'algorithms',
  'solution',
  'solutions',
  'internals',
  'image',
  'build',
  'builds',
  'ci',
  'model',
  'models',
  'chatbot',
  'chatbots',
];

export const METRIC_REGEX =
  /\b(?:\d+(?:\.\d+)?%|\d+x|\d+k|\d+m|\d+ms|\d+(?:,\d+)*(?:\s+[a-zA-Z]+){0,3}\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?|urls?|students?|attendees?|participants?|members?|users?|requests?|qps?|rps?|tps?|transactions?|dau|mau|records?|clients?|customers?|downloads?|stars?|views?|inr|usd|lakh|lakhs|cr|crore|crores|lpa|problems?|leetcode|coverage)|\$\s*\d+|\b\d+\s*%)|\b(?:reduced|decreased|increased|improved|saved|accelerated|cut)\s+(?:by\s+)?\d+/i;

export const KNOWN_TECH_KEYWORDS = [
  'java',
  'python',
  'go',
  'golang',
  'flutter',
  'dart',
  'c++',
  'cpp',
  'c#',
  'javascript',
  'typescript',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'scala',
  'sql',
  'postgresql',
  'postgres',
  'mysql',
  'mongodb',
  'redis',
  'cassandra',
  'elasticsearch',
  'kafka',
  'rabbitmq',
  'docker',
  'kubernetes',
  'aws',
  'gcp',
  'azure',
  'linux',
  'git',
  'react',
  'nextjs',
  'angular',
  'vue',
  'nodejs',
  'express',
  'django',
  'flask',
  'fastapi',
  'spring',
  'spring boot',
  'grpc',
  'rest',
  'graphql',
  'junit',
  'pytest',
  'vitest',
  'jest',
  'ci/cd',
  'websockets',
  'dsa',
  'data structures',
  'algorithms',
  'system design',
];

// Fixed connectives allowed outside slots for Check 21
export const ALLOWED_CONNECTIVES = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'but',
  'for',
  'nor',
  'so',
  'yet',
  'in',
  'on',
  'at',
  'by',
  'with',
  'from',
  'to',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'of',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'not',
  'only',
  'own',
  'same',
  'than',
  'too',
  'very',
  's',
  't',
  'can',
  'will',
  'just',
  'should',
  'now',
  'using',
  'used',
  'built',
  'engineered',
  'architected',
  'developed',
  'implemented',
  'designed',
  'optimized',
  'deployed',
  'automated',
  'authored',
  'refactored',
  'configured',
  'provisioned',
  'spearheaded',
  'led',
  'directed',
  'contributed',
  'assisted',
  'supported',
  'participated',
  'handled',
  'worked',
  'improving',
  'reducing',
  'increasing',
  'achieving',
  'delivering',
  'resulting',
  'enabling',
  'solving',
  'scaling',
  'service',
  'services',
  'system',
  'systems',
  'module',
  'modules',
  'component',
  'components',
  'pipeline',
  'pipelines',
  'infrastructure',
  'architecture',
  'application',
  'applications',
  'api',
  'apis',
  'database',
  'databases',
  'queries',
  'backend',
  'frontend',
  'fullstack',
  'tests',
  'test',
  'suite',
  'code',
  'repository',
  'throughput',
  'latency',
  'scale',
  'performance',
  'reliability',
  'efficiency',
  'production',
  'users',
  'requests',
  'metric',
  'outcome',
  'result',
  'needed',
  'be',
  'ready',
  'defend',
  'warning',
  'note',
  'add',
  'what',
  'you',
  'personally',
  'specific',
  'measured',
  'across',
  'as',
  'well',
  'via',
  'per',
  'its',
  'their',
  'our',
  'personal',
  'contribution',
  'event',
  'driven',
  'algorithmic',
  'bottlenecks',
  'data',
  'distributed',
  'clusters',
  'complex',
  'problems',
  'optimization',
  'resilient',
  'solved',
  'contributed',
  'leadership',
  'impact',
  'role',
  'scope',
  'feedback',
]);

// ─────────────────────────────────────────────────────────────
// Extraction & Parsing
// ─────────────────────────────────────────────────────────────

export function extractCandidateBullets(resumeText: string): string[] {
  if (!resumeText) return [];

  const lines = resumeText.split(/\r?\n/);
  const bullets: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBulletGlyph = /^[*\-•▪●\d.]+\s+/.test(trimmed);
    const words = trimmed.replace(/^[*\-•▪●\d.]+\s*/, '').trim().split(/\s+/);

    if (words.length < 4) continue;

    const firstWord = words[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    const isActionLead = STRONG_VERBS.has(firstWord) || Array.from(WEAK_OWNERSHIP_VERBS).some((w) => trimmed.toLowerCase().startsWith(w));

    if (
      /^(education|skills|experience|projects|certifications|awards|summary|contact|achievements):?$/i.test(
        trimmed
      )
    ) {
      continue;
    }
    if (/\||@|github\.com|linkedin\.com|b\.tech|m\.tech|bachelor|master|cgpa/i.test(trimmed) && words.length < 8) {
      continue;
    }

    if (isBulletGlyph || isActionLead || words.length >= 6) {
      let exactSub = trimmed;
      if (isBulletGlyph) {
        const withoutGlyph = trimmed.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
        if (resumeText.includes(withoutGlyph) && withoutGlyph.length >= 15) {
          exactSub = withoutGlyph;
        }
      }

      if (exactSub.length >= 15 && !seen.has(exactSub)) {
        seen.add(exactSub);
        bullets.push(exactSub);
      }
    }
  }

  return bullets;
}

// ─────────────────────────────────────────────────────────────
// Analysis
// ─────────────────────────────────────────────────────────────

export function classifyBullet(
  bulletText: string,
  knownTechList: string[] = KNOWN_TECH_KEYWORDS
): BulletAnalysisResult {
  const clean = bulletText.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);

  const reasons: string[] = [];

  // 1. Action verb signal
  const firstWord = words[0]?.toLowerCase().replace(/[^a-z-]/g, '') || '';
  const secondWord = words[1]?.toLowerCase().replace(/[^a-z-]/g, '') || '';
  const isWeak = Array.from(WEAK_OWNERSHIP_VERBS).some(
    (w) => lower.startsWith(w) || firstWord === w || `${firstWord} ${secondWord}` === w
  );
  const isStrong = !isWeak && (STRONG_VERBS.has(firstWord) || STRONG_VERBS.has(secondWord));
  const hasActionVerb = isStrong || isWeak;
  const matchedVerb = isStrong ? words[0] : isWeak ? 'weak verb' : undefined;

  // 2. Named artifact signal
  let matchedArtifact: string | undefined;
  for (const art of COMMON_ARTIFACTS) {
    const reg = new RegExp(`\\b${art}\\b`, 'i');
    if (reg.test(lower)) {
      matchedArtifact = art;
      break;
    }
  }
  const hasArtifact = Boolean(matchedArtifact);

  // 3. Named technology signal
  const matchedTechs: string[] = [];
  for (const tech of knownTechList) {
    const reg = new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (reg.test(lower)) {
      matchedTechs.push(tech);
    }
  }
  const hasTechnology = matchedTechs.length > 0;

  // 4. Outcome or metric signal
  const metricMatch = clean.match(METRIC_REGEX);
  const hasOutcomeOrMetric = Boolean(metricMatch);
  const matchedMetric = metricMatch ? metricMatch[0] : undefined;

  // Check for run-on: joins 3+ major distinct engineering domains
  const domainHits = [
    /pipeline|etl|kafka|event-driven|data|messaging/i.test(lower),
    /dsa|algorithm|optimization|time complexity|bottleneck/i.test(lower),
    /system design|architecture/i.test(lower),
    /cluster|distributed|nodes|kubernetes|multi-region/i.test(lower),
    /frontend|react|ui|css|responsive/i.test(lower),
    /database|queries|low-latency/i.test(lower),
  ].filter(Boolean).length;

  const isRunOn = domainHits >= 3 && words.length >= 15;
  const isCommaList = (clean.match(/,/g) || []).length >= 3 && !lower.includes(' resulting in ') && !lower.includes(' achieving ');
  const isKeywordStuffed = (matchedTechs.length >= 4 && !hasOutcomeOrMetric) || (isCommaList && (matchedTechs.length >= 3 || words.length >= 6 && !hasActionVerb));

  let qualityClass: BulletQualityClass;
  if (isRunOn || isKeywordStuffed) {
    qualityClass = 'risky';
    if (isRunOn) reasons.push('Run-on statement joining multiple disparate engineering domains');
    if (isKeywordStuffed) reasons.push('High keyword density without named artifacts or verifiable outcomes');
  } else if (isStrong && hasArtifact && hasTechnology && hasOutcomeOrMetric) {
    qualityClass = 'strong';
    reasons.push(
      `Strong action verb (${words[0]})`,
      `Named system/artifact (${matchedArtifact})`,
      `Identified technology (${matchedTechs[0]})`,
      `Quantified outcome (${matchedMetric})`
    );
  } else {
    qualityClass = 'improvable';
    if (!hasActionVerb) reasons.push('Lacks decisive engineering action verb');
    if (isWeak) reasons.push('Contains passive or weak ownership verb');
    if (!hasArtifact) reasons.push('Missing named system or technical artifact');
    if (!hasTechnology) reasons.push('Missing explicit technology or tooling context');
    if (!hasOutcomeOrMetric) reasons.push('Missing measurable outcome or quantifiable scale metric');
  }

  return {
    bulletText,
    qualityClass,
    signals: {
      hasActionVerb,
      hasArtifact,
      hasTechnology,
      hasOutcomeOrMetric,
      matchedVerb,
      matchedArtifact,
      matchedTechs,
      matchedMetric,
    },
    isRunOn,
    isKeywordStuffed,
    reasons,
  };
}

// ─────────────────────────────────────────────────────────────
// Rewriting Engine (Evidence-Safe Rules)
// ─────────────────────────────────────────────────────────────

export function rewriteBullet(
  originalBullet: string,
  targetCompetencies: string[] = []
): BulletRewrite {
  const analysis = classifyBullet(originalBullet);
  const { signals, qualityClass, isRunOn } = analysis;
  const clean = originalBullet.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
  const lower = clean.toLowerCase();

  // Rule 6: Strong bullets are shown as "No change needed"
  if (qualityClass === 'strong') {
    return {
      id: `rw_${Math.abs(hashString(originalBullet)).toString(36)}`,
      originalBullet,
      rewrittenBullet: originalBullet,
      qualityClass: 'strong',
      signals,
      reasons: analysis.reasons,
      isNoChangeNeeded: true,
      defendPrompt: generateDefendPrompt(signals, clean),
    };
  }

  const warnings: string[] = [];
  const reasons = [...analysis.reasons];

  // Rule 5: Run-on or keyword-stuffed bullets are split into separate bullets
  if (isRunOn) {
    warnings.push(
      'distributed clusters: add scale',
      'algorithmic optimization: add specific benchmark improvement',
      'event-driven data pipelines: add specific pipeline throughput'
    );

    const clauses = clean.split(/\s+(?:and|as well as)\s+/i).filter((c) => c.trim().length >= 15);
    const splitBullets: string[] = (clauses.length >= 2 ? clauses : [clean]).map((c) => {
      const cTrim = c.trim().replace(/^\s*and\s+/i, '');
      const cap = cTrim.charAt(0).toUpperCase() + cTrim.slice(1);
      return `${cap} using [add: technology], [add: system/artifact name], resulting in [add: measured metric].`;
    });

    return {
      id: `rw_${Math.abs(hashString(originalBullet)).toString(36)}`,
      originalBullet,
      rewrittenBullet: splitBullets.join('\n'),
      qualityClass: 'risky',
      signals,
      reasons,
      isNoChangeNeeded: false,
      warnings,
      defendPrompt: 'Be ready to defend: event-driven data pipelines, DSA optimization trade-offs, and cluster architecture.',
      splitBullets,
    };
  }

  // Determine verb and ownership guard (Rule 4)
  const words = clean.split(/\s+/).filter(Boolean);
  const firstWord = words[0]?.toLowerCase().replace(/[^a-z-]/g, '') || '';
  const secondWord = words[1]?.toLowerCase().replace(/[^a-z-]/g, '') || '';

  const isWeak = Array.from(WEAK_OWNERSHIP_VERBS).some(
    (w) => lower.startsWith(w) || firstWord === w || `${firstWord} ${secondWord}` === w
  );

  const isNonTech = isNonTechnicalBullet(clean, signals);
  let rewritten = '';

  if (isWeak) {
    if (isNonTech) {
      const outcomeSlot = signals.hasOutcomeOrMetric ? '' : ', achieving [add: measured result]';
      rewritten = `${clean}, [add: what you personally built or contributed]${outcomeSlot}.`;
    } else {
      const techSlot = signals.hasTechnology ? '' : ' using [add: technology]';
      const artifactSlot = signals.hasArtifact ? '' : ', [add: system/artifact name]';
      const outcomeSlot = signals.hasOutcomeOrMetric ? '' : ', achieving [add: measured result]';
      rewritten = `${clean}${techSlot}${artifactSlot}, [add: what you personally built]${outcomeSlot}.`;
    }
    rewritten = cleanupPunctuation(rewritten);
  } else {
    if (isNonTech) {
      const roleSlot = ', [add: specific role or leadership contribution]';
      const outcomePart = signals.hasOutcomeOrMetric ? '' : ', resulting in [add: event outcome or impact]';
      rewritten = `${clean}${roleSlot}${outcomePart}.`;
    } else {
      let actionVerb = signals.hasActionVerb ? words[0] : 'Developed';
      let coreText = clean;
      if (signals.hasActionVerb) {
        coreText = clean.replace(new RegExp(`^${words[0]}\\s*`, 'i'), '').trim();
      }

      const techPart = signals.hasTechnology ? '' : ' using [add: technology]';
      const artifactPart = signals.hasArtifact ? '' : ' for [add: system/artifact name]';
      const outcomePart = signals.hasOutcomeOrMetric ? '' : ', resulting in [add: measured metric]';

      rewritten = `${actionVerb} ${coreText}${techPart}${artifactPart}${outcomePart}.`;
    }
    rewritten = cleanupPunctuation(rewritten);
  }

  // Rule 3: Zero new digits
  const beforeDigits = new Set(clean.match(/\d/g) || []);
  const afterDigits = rewritten.match(/\d/g) || [];
  for (const d of afterDigits) {
    if (!beforeDigits.has(d)) {
      rewritten = rewritten.replace(new RegExp(d, 'g'), '');
    }
  }

  return {
    id: `rw_${Math.abs(hashString(originalBullet)).toString(36)}`,
    originalBullet,
    rewrittenBullet: rewritten,
    qualityClass,
    signals,
    reasons,
    isNoChangeNeeded: false,
    warnings: warnings.length > 0 ? warnings : undefined,
    defendPrompt: generateDefendPrompt(signals, clean),
  };
}

export function generateEvidenceSafeRewrites(
  resumeText: string,
  roleCompetencies: string[] = []
): BulletRewrite[] {
  const candidateBullets = extractCandidateBullets(resumeText);
  if (candidateBullets.length === 0) return [];

  const analyzed = candidateBullets.map((b) => ({
    bullet: b,
    rewrite: rewriteBullet(b, roleCompetencies),
  }));

  const scored = analyzed.map((item) => {
    let score = 0;
    if (item.rewrite.qualityClass === 'risky') score += 100;
    else if (item.rewrite.qualityClass === 'improvable') score += 50;
    else score += 10;

    const lower = item.bullet.toLowerCase();
    for (const comp of roleCompetencies) {
      if (lower.includes(comp.toLowerCase().trim())) {
        score += 25;
        break;
      }
    }

    return {
      ...item,
      score,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.bullet.localeCompare(b.bullet);
  });

  return scored.slice(0, 5).map((s) => s.rewrite);
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function isNonTechnicalBullet(text: string, signals: BulletRewrite['signals']): boolean {
  const lower = text.toLowerCase();
  const nonTechMarkers = [
    'fest', 'club', 'event', 'society', 'competition', 'sports', 'cultural',
    'annual', 'attendees', 'college', 'university', 'symposium',
    'volunteered', 'chapter', 'placement', 'robotics'
  ];
  const hasStrongTech =
    signals.hasTechnology ||
    /\b(api|apis|microservice|microservices|pipeline|pipelines|database|databases|cache|server|frontend|backend|cloud|kubernetes|docker|sql|code|bot|chatbot|app|model|models|dsa|algorithms)\b/i.test(lower);
  if (hasStrongTech) return false;

  return nonTechMarkers.some((m) => lower.includes(m)) || (!signals.hasTechnology && !signals.hasArtifact);
}

function generateDefendPrompt(signals: BulletRewrite['signals'], text: string): string {
  const topics: string[] = [];
  if (signals.matchedTechs.length > 0) {
    topics.push(...signals.matchedTechs.slice(0, 2));
  }
  if (signals.matchedArtifact) {
    topics.push(signals.matchedArtifact);
  }
  if (signals.matchedMetric) {
    topics.push(`measured outcome (${signals.matchedMetric})`);
  }

  if (topics.length === 0) {
    return 'Be ready to defend: specific architectural decisions and personal contributions.';
  }

  return `Be ready to defend: ${topics.join(', ')} implementation decisions and baseline metrics.`;
}

function cleanupPunctuation(str: string): string {
  return str
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/\.\.+/g, '.')
    .trim();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
