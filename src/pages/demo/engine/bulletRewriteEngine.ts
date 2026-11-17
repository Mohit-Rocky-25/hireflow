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
  isSkillsList?: boolean;
}

export interface BulletAnalysisResult {
  bulletText: string;
  qualityClass: BulletQualityClass;
  signals: BulletRewrite['signals'];
  isRunOn: boolean;
  isKeywordStuffed: boolean;
  isSkillsList?: boolean;
  reasons: string[];
}

// ─────────────────────────────────────────────────────────────
// Knowledge Base: Verbs, Artifacts, Technologies, Connectives
// ─────────────────────────────────────────────────────────────

export const STRONG_VERBS = new Set([
  ...(actionVerbsData.strongVerbs as string[]).map((v) => v.toLowerCase()),
  'created',
  'decreased',
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
];

export const METRIC_REGEX =
  /\b(?:\d+(?:\.\d+)?%|\d+x|\d+k|\d+m|\d+ms|\d+(?:,\d+)*(?:\s+[a-zA-Z]+){0,3}\s*(?:minutes?|mins?|seconds?|secs?|hours?|hrs?|urls?|students?|attendees?|participants?|members?|users?|requests?|qps?|rps?|tps?|transactions?|dau|mau|records?|clients?|customers?|downloads?|stars?|views?|inr|usd|lakh|lakhs|cr|crore|crores|lpa|problems?|leetcode|coverage)|\$\s*\d+|\b\d+\s*%)|\b(?:reduced|decreased|increased|improved|saved|accelerated|cut)\s+(?:by\s+)?\d+/i;

export const KNOWN_TECH_KEYWORDS = [
  'java',
  'python',
  'go',
  'golang',
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
  'node',
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

// Small neutral connective set allowed outside slots for Check 21
export const NEUTRAL_CONNECTIVES = new Set([
  'and',
  'or',
  'with',
  'using',
  'in',
  'for',
  'to',
  'the',
  'a',
  'an',
  'of',
  'by',
  'on',
  'at',
  'from',
  'into',
  'as',
]);

export const ALLOWED_CONNECTIVES = NEUTRAL_CONNECTIVES;

// Forbidden action and outcome asserting words: strictly disallowed outside slots unless present in original bullet
export const FORBIDDEN_ACTION_OUTCOME_WORDS = new Set([
  'deployed',
  'serving',
  'achieving',
  'delivering',
  'resulting',
  'launched',
  'improved',
  'scaled',
  'reduced',
  'increased',
  'decreased',
  'accelerated',
  'automated',
  'generated',
  'saved',
  'boosted',
  'optimized',
  'engineered',
  'architected',
  'developed',
  'built',
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
  const isSkillsListLine = (matchedTechs.length >= 3 && !hasActionVerb) ||
    ((clean.match(/,/g) || []).length >= 4 && matchedTechs.length >= 2 && !hasActionVerb);
  const isKeywordStuffed = (matchedTechs.length >= 4 && !hasOutcomeOrMetric) || (isCommaList && (matchedTechs.length >= 3 || (words.length >= 6 && !hasActionVerb)));

  let qualityClass: BulletQualityClass;
  if (isSkillsListLine) {
    qualityClass = 'risky';
    reasons.push('Skills list without project context');
  } else if (isRunOn || isKeywordStuffed) {
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
    isSkillsList: isSkillsListLine,
    reasons,
  };
}

// ─────────────────────────────────────────────────────────────
// Rewriting Engine (Evidence-Safe Rules)
// ─────────────────────────────────────────────────────────────

export function shouldSplitBullet(
  text: string,
  analysis: BulletAnalysisResult
): { shouldSplit: boolean; clauses: string[]; warnings: string[] } {
  if (analysis.isSkillsList) {
    return { shouldSplit: false, clauses: [], warnings: [] };
  }
  if (!analysis.signals.hasActionVerb) {
    return { shouldSplit: false, clauses: [], warnings: [] };
  }

  const clean = text.replace(/^[*\-•▪●\d.]+\s*/, '').trim();
  const lower = clean.toLowerCase();
  const warnings: string[] = [];

  // Check if this is a technology list following "using" or "with"
  // e.g. "Built full-stack application using MongoDB, Express, React, and Node"
  // Must NOT split inside a technology list! (R1.a)
  const techStackMatch = clean.match(/\b(?:using|with)\s+([^.]+)/i);
  if (techStackMatch) {
    const candidateTechs = techStackMatch[1]
      .split(/,\s*(?:and\s+)?|\s+and\s+/i)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);
    const knownHits = candidateTechs.filter((t) =>
      KNOWN_TECH_KEYWORDS.some((kt) => kt === t || kt.includes(t) || t.includes(kt))
    );
    if (knownHits.length >= 2 && !/\band\s+(?:solved|optimized|designed|built|architected|engineered|implemented|addressed|scaled)\b/i.test(clean)) {
      return { shouldSplit: false, clauses: [], warnings: [] };
    }
  }

  // 1. Multi-domain run-on (e.g. B3)
  if (analysis.isRunOn) {
    if (lower.includes('distributed cluster') || lower.includes('cluster')) {
      warnings.push('distributed clusters: add scale');
    }
    if (lower.includes('dsa') || lower.includes('algorithmic optimization')) {
      warnings.push('algorithmic optimization: add specific benchmark improvement');
    }
    if (lower.includes('pipeline') || lower.includes('event-driven')) {
      warnings.push('event-driven data pipelines: add specific pipeline throughput');
    }

    // Coordinated predicates: split on "and <verb>" or semicolons, preserving the verb in clause 2
    const splitRegex = /\s*;\s*|\s+and\s+(?=(?:solved|optimized|designed|built|architected|engineered|implemented|addressed|scaled|developed|created|refactored|led)\b)/i;
    const clauses = clean
      .split(splitRegex)
      .map((c) => c.trim())
      .filter((c) => c.length >= 15);

    if (clauses.length >= 2) {
      if (!clauses.every((c) => clean.includes(c))) {
        return { shouldSplit: false, clauses: [], warnings: [] };
      }

      return { shouldSplit: true, clauses, warnings };
    }
    const genericAndSplit = clean.split(/\s+and\s+/i).map((c) => c.trim()).filter((c) => c.length >= 15);
    if (genericAndSplit.length >= 2) {
      if (!genericAndSplit.every((c) => clean.includes(c))) {
        return { shouldSplit: false, clauses: [], warnings: [] };
      }
      return { shouldSplit: true, clauses: genericAndSplit, warnings };
    }
  }

  // 2. Multi-concept listing with 4+ accomplishments/concepts (e.g. B11)
  // Only for independent accomplishments without existing metrics, NEVER inside a technology list
  if (analysis.signals.hasOutcomeOrMetric) {
    return { shouldSplit: false, clauses: [], warnings: [] };
  }

  const cleanNoDigits = clean.replace(/\d+,\d+/g, '');
  const commaCount = (cleanNoDigits.match(/,/g) || []).length;
  const hasAnd = /\band\b/i.test(clean);

  if ((commaCount >= 3 || (commaCount >= 2 && hasAnd)) && clean.length >= 45) {
    const forMatch = clean.match(/\s+(for\s+(?:a\s+|an\s+|the\s+)?[\w\s/-]+)$/i);
    const scopeSuffix = forMatch ? ` ${forMatch[1]}` : '';
    const bodyWithoutSuffix = forMatch ? clean.slice(0, forMatch.index) : clean;

    const verbMatch = bodyWithoutSuffix.match(/^([A-Za-z]+)\s+/);
    const leadingVerb = verbMatch ? verbMatch[1] : '';
    const itemsPart = leadingVerb ? bodyWithoutSuffix.slice(leadingVerb.length).trim() : bodyWithoutSuffix;

    const rawItems = itemsPart.split(/(?<!\d),\s*|\s+and\s+/i).map((s) => s.trim()).filter((s) => s.length >= 1);

    if (rawItems.length >= 4) {
      const clauses: string[] = [];
      for (let i = 0; i < rawItems.length; i += 2) {
        const chunk = rawItems.slice(i, i + 2);
        const chunkText = chunk.join(', ');
        const prefix = (i === 0 && leadingVerb) ? `${leadingVerb} ` : '';
        const isLast = i + 2 >= rawItems.length;
        const suffix = isLast && scopeSuffix ? scopeSuffix : '';
        clauses.push(`${prefix}${chunkText}${suffix}`);
      }

      rawItems.forEach((item) => {
        const iLower = item.toLowerCase();
        if (iLower.includes('jwt') || iLower.includes('auth')) {
          warnings.push('JWT authentication: add security scope');
        } else if (iLower.includes('docker') || iLower.includes('container')) {
          warnings.push('Docker deployment: add target environment');
        } else if (iLower.includes('ci/cd') || iLower.includes('pipeline')) {
          warnings.push('CI/CD: add pipeline tool');
        } else if (iLower.includes('test') || iLower.includes('unit')) {
          warnings.push('unit tests: add test coverage');
        } else if (iLower.includes('role-based') || iLower.includes('rbac')) {
          warnings.push('role-based access: add authorization model');
        } else {
          warnings.push(`${item}: add specific scale or metrics`);
        }
      });

      if (!clauses.every((c) => clean.includes(c))) {
        return { shouldSplit: false, clauses: [], warnings: [] };
      }

      return { shouldSplit: true, clauses, warnings };
    }
  }

  return { shouldSplit: false, clauses: [], warnings: [] };
}

export function rewriteBullet(
  originalBullet: string,
  targetCompetencies: string[] = []
): BulletRewrite {
  const analysis = classifyBullet(originalBullet);
  const { signals, qualityClass } = analysis;
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
      defendPrompt: generateQuestionsToPrepare(signals, clean),
    };
  }

  const warnings: string[] = [];
  const reasons = [...analysis.reasons];

  // Skills-list lines: no split, no metric slots, one clear warning
  if (analysis.isSkillsList) {
    const cleanNoPunct = clean.replace(/[.,\s]+$/, '');
    return {
      id: `rw_${Math.abs(hashString(originalBullet)).toString(36)}`,
      originalBullet,
      rewrittenBullet: cleanNoPunct,
      qualityClass: 'risky',
      signals,
      reasons: ['Skills list without project context'],
      isNoChangeNeeded: false,
      warnings: ['This is a skills list. Technologies belong in project bullets where they were used.'],
      defendPrompt: generateQuestionsToPrepare(signals, clean),
      isSkillsList: true,
    };
  }

  // Rule 5: Run-on or multi-accomplishment bullets are split
  const splitData = shouldSplitBullet(clean, analysis);
  if (splitData.shouldSplit && splitData.clauses.length >= 2) {
    const splitBullets: string[] = splitData.clauses.map((c) => {
      const cTrim = c.trim().replace(/^\s*and\s+/i, '').replace(/[.,\s]+$/, '');
      return cleanupPunctuation(`${cTrim}, with [add: measured metric or scale, if applicable].`);
    });

    return {
      id: `rw_${Math.abs(hashString(originalBullet)).toString(36)}`,
      originalBullet,
      rewrittenBullet: splitBullets.join('\n'),
      qualityClass: 'risky',
      signals,
      reasons,
      isNoChangeNeeded: false,
      warnings: splitData.warnings.length > 0 ? splitData.warnings : undefined,
      defendPrompt: generateQuestionsToPrepare(signals, clean),
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
  const cleanBase = clean.replace(/[.,\s]+$/, '');
  let rewritten = '';

  const eventSlot = ', with [add: event outcome or impact, if applicable]';
  const defaultMetricSlot = ', with [add: measured metric, if available]';
  const userScaleSlot = ', with [add: measured metric or user scale, if available]';

  if (isWeak) {
    if (isNonTech) {
      const outcomeSlot = signals.hasOutcomeOrMetric ? '' : eventSlot;
      rewritten = `${cleanBase}, [add: what you personally built or contributed]${outcomeSlot}.`;
    } else {
      const techSlot = signals.hasTechnology ? '' : ', using [add: technology or framework, if applicable]';
      const artifactSlot = signals.hasArtifact ? '' : ', for [add: system or service name, if applicable]';
      const outcomeSlot = signals.hasOutcomeOrMetric ? '' : userScaleSlot;
      rewritten = `${cleanBase}${techSlot}${artifactSlot}, [add: what you personally built or contributed]${outcomeSlot}.`;
    }
    rewritten = cleanupPunctuation(rewritten);
  } else {
    if (isNonTech) {
      const roleSlot = '[add: specific role or leadership contribution]';
      const outcomePart = signals.hasOutcomeOrMetric ? '' : eventSlot;
      rewritten = `${cleanBase}, ${roleSlot}${outcomePart}.`;
    } else {
      const techPart = signals.hasTechnology ? '' : ', using [add: architecture or framework, if applicable]';
      const artifactPart = signals.hasArtifact ? '' : ', for [add: system or artifact name, if applicable]';
      const outcomePart = signals.hasOutcomeOrMetric ? '' : defaultMetricSlot;

      rewritten = `${cleanBase}${techPart}${artifactPart}${outcomePart}.`;
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
    defendPrompt: generateQuestionsToPrepare(signals, clean),
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

export function isEventBullet(text: string): boolean {
  const lower = text.toLowerCase();
  // Never match event-driven, event sourcing, event streaming, event loop, etc.
  if (/\bevent[-\s]?(?:driven|sourcing|stream|streaming|loop|emitter|bus|listener|handler|queue)\b/i.test(lower)) {
    return false;
  }
  return /\b(hackathon|fest|festival|workshop|club|society|symposium|meetup|competition|conference)\b/i.test(lower);
}

export function isNonTechnicalBullet(text: string, signals: BulletRewrite['signals']): boolean {
  const lower = text.toLowerCase();
  if (/\bevent[-\s]?(?:driven|sourcing|stream|streaming|loop|emitter|bus|listener|handler|queue)\b/i.test(lower)) {
    return false;
  }
  const hasStrongTech =
    signals.hasTechnology ||
    /\b(api|apis|microservice|microservices|pipeline|pipelines|database|databases|cache|server|frontend|backend|cloud|kubernetes|docker|sql|code|bot|chatbot|app|model|models|dsa|algorithms)\b/i.test(lower);
  if (hasStrongTech) return false;

  const nonTechMarkers = [
    'fest', 'club', 'festival', 'society', 'competition', 'sports', 'cultural',
    'annual', 'attendees', 'college', 'university', 'symposium',
    'volunteered', 'chapter', 'placement', 'robotics'
  ];
  return nonTechMarkers.some((m) => lower.includes(m)) || (!signals.hasTechnology && !signals.hasArtifact);
}

export function generateQuestionsToPrepare(signals: BulletRewrite['signals'], text: string): string {
  const terms: string[] = [];
  if (signals.matchedTechs.length > 0) {
    terms.push(...signals.matchedTechs.slice(0, 2));
  }
  if (signals.matchedArtifact) {
    terms.push(signals.matchedArtifact);
  }

  if (terms.length > 0) {
    return `Questions to prepare: (1) How did you benchmark and validate this ${terms.join(' / ')} implementation? (2) What architectural trade-offs did you evaluate?`;
  }

  return `Questions to prepare: (1) What architectural trade-offs did you evaluate? (2) How did you validate and test the reported outcome?`;
}

// Retain alias for backward compatibility
export const generateDefendPrompt = generateQuestionsToPrepare;

function cleanupPunctuation(str: string): string {
  return str
    .replace(/\.\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/,\s*,/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/\s+\.(?=\s|$)/g, '.')
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
