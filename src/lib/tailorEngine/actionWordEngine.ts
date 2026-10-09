// ============================================================
// Tailor Engine — Action Word Engine & 4-Slot Formula Evaluator
// Action, Object, Tool, Result formula + Light-touch S1-S5 Tailoring
// ============================================================

import actionVerbsData from '../../data/tailor/action-verbs.json';

export interface BulletFormula {
  action: boolean; // Starts with strong active past-tense verb
  object: boolean; // Mentions target system / feature / platform / problem
  tool: boolean;   // Mentions specific tech / framework / library / hardware
  result: boolean; // Mentions measurable metric / percentage / scale / outcome
  score: number;   // 0 to 4
}

// Flat list of all recognized strong action verbs
export const ALL_ACTION_VERBS: string[] = Object.values(
  actionVerbsData.categories
).flatMap((cat) => cat.verbs);

const WEAK_OPENERS: Array<{ regex: RegExp; replacement: string }> = [
  { regex: /^(?:responsible for developing|responsible for the development of)\s+/i, replacement: 'Developed ' },
  { regex: /^(?:responsible for building|responsible for the building of)\s+/i, replacement: 'Built ' },
  { regex: /^(?:responsible for managing|responsible for the management of)\s+/i, replacement: 'Managed ' },
  { regex: /^(?:responsible for designing|responsible for the design of)\s+/i, replacement: 'Designed ' },
  { regex: /^(?:responsible for creating|responsible for the creation of)\s+/i, replacement: 'Created ' },
  { regex: /^(?:responsible for maintaining|responsible for the maintenance of)\s+/i, replacement: 'Maintained ' },
  { regex: /^(?:responsible for optimizing|responsible for the optimization of)\s+/i, replacement: 'Optimized ' },
  { regex: /^(?:responsible for implementing|responsible for the implementation of)\s+/i, replacement: 'Implemented ' },
  { regex: /^(?:responsible for|tasked with|assigned to)\s+/i, replacement: '' },
  { regex: /^(?:helped with writing|helped write)\s+/i, replacement: 'Authored ' },
  { regex: /^(?:helped with|helped in|assisted with|assisted in)\s+/i, replacement: 'Contributed to ' },
  { regex: /^(?:worked on developing|worked on building)\s+/i, replacement: 'Developed ' },
  { regex: /^(?:worked on optimizing)\s+/i, replacement: 'Optimized ' },
  { regex: /^(?:worked on)\s+/i, replacement: 'Engineered ' },
  { regex: /^(?:involved in)\s+/i, replacement: 'Participated in ' }
];

const COMMON_TECH_TOKENS = new Set([
  'react', 'node', 'node.js', 'typescript', 'javascript', 'python', 'java', 'c', 'c++',
  'postgresql', 'postgres', 'mysql', 'sql', 'redis', 'firebase', 'mongodb', 'docker',
  'kubernetes', 'k8s', 'aws', 'gcp', 'linux', 'git', 'github', 'esp32', 'arduino',
  'raspberry pi', 'html', 'css', 'jest', 'cypress', 'express', 'rest', 'api', 'iot'
]);

const OBJECT_NOUNS_REGEX = /\b(?:system|platform|application|service|microservice|feature|dashboard|pipeline|queue|database|query|queries|frontend|backend|infrastructure|architecture|workflow|interface|module|firmware|hardware|circuit|device|prototype)\b/i;

const RESULT_METRICS_REGEX = /(?:\d+%\s*(?:reduction|increase|improvement|drop|faster|latency|boost|efficiency)?|\b\d+(?:,\d+)?\+?\s*(?:users|clients|requests|req\/s|rps|queries|qps|active|records|ms|seconds|minutes|hrs|gb|mb|k)\b|\breducing\s+latency\s+by|\bdecreased\s+load\s+time|\bscaled\s+to\b)/i;

/**
 * Evaluates the 4-slot bullet formula (Action, Object, Tool, Result).
 */
export function evaluateBulletFormula(rawBullet: string): BulletFormula {
  const clean = rawBullet.replace(/^[-•*●▪‣]\s*/, '').trim();
  if (!clean) {
    return { action: false, object: false, tool: false, result: false, score: 0 };
  }

  // 1. Action: First word is a recognized action verb or past-tense verb
  const firstWord = clean.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
  const action = ALL_ACTION_VERBS.includes(firstWord) || /^(?:built|designed|developed|engineered|implemented|optimized|created|authored|spearheaded|streamlined|automated|refactored|deployed|configured|tested|resolved|integrated)$/.test(firstWord);

  // 2. Object: Mentions target system/feature/problem
  const object = OBJECT_NOUNS_REGEX.test(clean);

  // 3. Tool: Mentions specific tech/framework/library/hardware
  const words = clean.toLowerCase().split(/[\s,./()]+/);
  const tool = words.some((w) => COMMON_TECH_TOKENS.has(w)) || /\b(?:react|node|postgres|redis|jest|cypress|esp32|docker|aws)\b/i.test(clean);

  // 4. Result: Contains measurable metrics, speedups, scale, numbers
  const result = RESULT_METRICS_REGEX.test(clean) || /\b\d+(?:,\d+)?\b/.test(clean);

  const score = (action ? 1 : 0) + (object ? 1 : 0) + (tool ? 1 : 0) + (result ? 1 : 0);

  return { action, object, tool, result, score };
}

function lcsWordsLength(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = new Array(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    let prev = 0;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const wordA = a[i - 1].toLowerCase().replace(/[.,!?;:]/g, '');
      const wordB = b[j - 1].toLowerCase().replace(/[.,!?;:]/g, '');
      if (wordA === wordB) {
        dp[j] = prev + 1;
      } else {
        dp[j] = Math.max(dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }
  return dp[n];
}

/**
 * Calculates word diff count using Longest Common Subsequence (LCS)
 * to avoid naive token index misalignment.
 */
export function calculateWordDiffBudget(original: string, proposed: string): {
  wordsChanged: number;
  totalWords: number;
  percentChanged: number;
  withinBudget: boolean;
} {
  const origTokens = original.trim().split(/\s+/).filter(Boolean);
  const propTokens = proposed.trim().split(/\s+/).filter(Boolean);

  if (origTokens.length === 0) {
    return { wordsChanged: propTokens.length, totalWords: 0, percentChanged: 0, withinBudget: true };
  }

  const common = lcsWordsLength(origTokens, propTokens);
  const removed = origTokens.length - common;
  const added = propTokens.length - common;
  const wordsChanged = Math.max(removed, added);

  const totalWords = origTokens.length;
  const percentChanged = Math.round((wordsChanged / totalWords) * 100) / 100;
  const withinBudget = percentChanged <= 0.35;

  return {
    wordsChanged,
    totalWords,
    percentChanged,
    withinBudget
  };
}

export interface TailoredBulletResult {
  originalText: string;
  proposedText: string;
  formulaBefore: BulletFormula;
  formulaAfter: BulletFormula;
  stepsApplied: string[];
  budget: {
    wordsChanged: number;
    totalWords: number;
    percentChanged: number;
    withinBudget: boolean;
  };
}

/**
 * Sequence S1–S5 light-touch tailoring with ≤ 35% word budget.
 */
export function tailorBulletLightTouch(
  originalBullet: string,
  jdKeywords: string[] = []
): TailoredBulletResult {
  const clean = originalBullet.replace(/^[-•*●▪‣]\s*/, '').trim();
  const formulaBefore = evaluateBulletFormula(clean);
  const stepsApplied: string[] = [];

  let text = clean;

  // S1: Replace weak opening verbs
  for (const { regex, replacement } of WEAK_OPENERS) {
    if (regex.test(text)) {
      text = text.replace(regex, replacement).trim();
      // Capitalize first character
      text = text.charAt(0).toUpperCase() + text.slice(1);
      stepsApplied.push('S1: Upgraded weak opening verb to active past-tense');
      break;
    }
  }

  // S4: Standardize casing for common tech acronyms / proper names
  const casingMap: Record<string, string> = {
    '\\bjava\\b': 'Java',
    '\\bpython\\b': 'Python',
    '\\bjavascript\\b': 'JavaScript',
    '\\btypescript\\b': 'TypeScript',
    '\\breact\\b': 'React',
    '\\bpostgresql\\b': 'PostgreSQL',
    '\\bpostgres\\b': 'PostgreSQL',
    '\\bnode\\b': 'Node.js',
    '\\bnodejs\\b': 'Node.js',
    '\\bgithub\\b': 'GitHub',
    '\\bgit\\b': 'Git',
    '\\bhtml\\b': 'HTML',
    '\\bcss\\b': 'CSS'
  };

  for (const [pattern, proper] of Object.entries(casingMap)) {
    const rx = new RegExp(pattern, 'g');
    if (rx.test(text) && !text.includes(proper)) {
      text = text.replace(rx, proper);
      stepsApplied.push('S4: Standardized technology name capitalization');
    }
  }

  // S3: Tighten trailing run-on punctuation
  if (!text.endsWith('.')) {
    text += '.';
  }

  // Calculate budget
  let budget = calculateWordDiffBudget(clean, text);

  // If budget exceeded 35%, revert to simple S1 fix
  if (!budget.withinBudget) {
    text = clean.replace(/^(?:responsible for|worked on|helped with)\s+/i, '').trim();
    text = text.charAt(0).toUpperCase() + text.slice(1);
    budget = calculateWordDiffBudget(clean, text);
  }

  const formulaAfter = evaluateBulletFormula(text);

  return {
    originalText: clean,
    proposedText: text,
    formulaBefore,
    formulaAfter,
    stepsApplied,
    budget
  };
}

/**
 * Seniority Mismatch detection between candidate experience and JD requirements.
 */
export function checkSeniorityMismatch(
  resumeText: string,
  jdText: string
): { isMismatch: boolean; advisoryNote?: string } {
  const isSeniorJD = /\b(?:senior|lead|principal|staff|architect|director|5\+\s*years|7\+\s*years|8\+\s*years)\b/i.test(jdText);
  const isFresherCandidate =
    /\b(?:b\.?tech|b\.?e\.?|bachelor|fresher|junior|intern|internship|expected\s+202[5-9]|202[5-9]\b)/i.test(resumeText) &&
    !/\b(?:senior|lead|architect|5\+\s*years)\b/i.test(resumeText);

  if (isSeniorJD && isFresherCandidate) {
    return {
      isMismatch: true,
      advisoryNote:
        'Seniority Mismatch: This Job Description targets a Senior/Staff role with extensive industry experience. The engine will align technical keywords while preserving your honest student/fresher project credentials without falsifying seniority.'
    };
  }

  return { isMismatch: false };
}
