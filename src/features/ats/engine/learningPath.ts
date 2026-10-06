// ============================================================
// ATS Resume Roaster — Stage 5 Learning Path Generator (<300 lines)
// Strict rule: Zero days, dates, deadlines or time estimates.
// ============================================================

import prerequisitesData from '../knowledge/prerequisites.json';
import skillsData from '../knowledge/skills.json';
import actionVerbsData from '../knowledge/action-verbs.json';
import { SKILL_PLAYBOOKS, getGenericPlaybook } from '../knowledge/learningData';
import {
  SkillResult,
  BulletAnalysis,
  LearningPathResult,
  LearningPathItem,
  LearningStage,
  WeakBulletRewrite,
  TargetTierId,
} from './types';

export interface GenerateLearningPathParams {
  skillResults: SkillResult[];
  roleTitle?: string;
  targetTier?: TargetTierId | string;
  projects?: Array<{ title: string; techStack?: string[] }>;
  bullets?: BulletAnalysis[];
}

const FOUNDATION_CATEGORIES = new Set(['languages', 'fundamentals', 'version_control']);
const FOUNDATION_SKILLS = new Set([
  'javascript', 'python', 'java', 'sql', 'cpp', 'c', 'html', 'css',
  'git', 'dsa', 'oop', 'linux', 'rest_apis', 'bash',
]);

/**
 * Builds dependency graphs from static prerequisite rules.
 */
function buildPrerequisiteMaps() {
  const prereqOf = new Map<string, string[]>(); // skillId -> prerequisites it needs
  const unlocksMap = new Map<string, string[]>(); // skillId -> skills it unlocks

  for (const chain of prerequisitesData.chains) {
    prereqOf.set(chain.skillId, chain.prerequisites);
    for (const p of chain.prerequisites) {
      const list = unlocksMap.get(p) || [];
      list.push(chain.skillId);
      unlocksMap.set(p, list);
    }
  }

  return { prereqOf, unlocksMap };
}

/**
 * Strips weak introductory phrases from real resume bullets.
 */
function stripWeakPrefix(text: string): string {
  let cleaned = text.trim();
  const lower = cleaned.toLowerCase();
  const allWeak = [
    ...actionVerbsData.weakPhrases,
    'collaborated in',
    'collaborated with',
    'partnered with',
  ];
  for (const phrase of allWeak) {
    if (lower.startsWith(phrase)) {
      cleaned = cleaned.slice(phrase.length).trim();
      cleaned = cleaned.replace(/^(\s*to\s+|\s*with\s+|\s*in\s+|\s*for\s+|\s*and\s+)/i, '').trim();
      break;
    }
  }
  cleaned = cleaned.replace(/^(developing|building|creating|implementing|fixing|integrating|handling)\s+/i, '').trim();
  if (/^[A-Z]{2,}\b/.test(cleaned)) {
    return cleaned;
  }
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

/**
 * Eliminates any time tokens from generated templates.
 */
function sanitizeTimeWords(text: string): string {
  return text
    .replace(/\bdaily\b/gi, 'regular')
    .replace(/\bday-to-day\b/gi, 'ongoing')
    .replace(/\bdays\b/gi, 'phases')
    .replace(/\bday\b/gi, 'phase')
    .replace(/\bweekly\b/gi, 'iterative')
    .replace(/\bweeks\b/gi, 'iterations')
    .replace(/\bweek\b/gi, 'iteration')
    .replace(/\bmonthly\b/gi, 'periodic')
    .replace(/\bmonths\b/gi, 'milestones')
    .replace(/\bmonth\b/gi, 'milestone')
    .replace(/\bhourly\b/gi, 'continuous')
    .replace(/\bhours\b/gi, 'cycles')
    .replace(/\bhour\b/gi, 'cycle')
    .replace(/\bdeadlines\b/gi, 'milestones')
    .replace(/\bdeadline\b/gi, 'milestone');
}

/**
 * Selects an active action verb based on bullet context.
 */
function selectStrongVerb(bulletText: string): string {
  const lower = bulletText.toLowerCase();
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('issue')) return 'Eliminated';
  if (lower.includes('test') || lower.includes('spec') || lower.includes('qa')) return 'Automated';
  if (lower.includes('api') || lower.includes('endpoint') || lower.includes('service')) return 'Engineered';
  if (lower.includes('database') || lower.includes('query') || lower.includes('sql')) return 'Optimized';
  if (lower.includes('ui') || lower.includes('frontend') || lower.includes('component')) return 'Architected';
  if (lower.includes('deploy') || lower.includes('docker') || lower.includes('pipeline')) return 'Containerized';
  return 'Architected and deployed';
}

/**
 * Pure deterministic generator for sequenced learning path.
 */
export function generateLearningPath(params: GenerateLearningPathParams): LearningPathResult {
  const { prereqOf, unlocksMap } = buildPrerequisiteMaps();
  const roleTitle = params.roleTitle || 'Software Engineer';
  const targetTier = params.targetTier || 'Top Product';

  // 1. Filter missing and weak-evidence skills
  const candidates = params.skillResults.filter(
    (s) => s.status === 'missing' || s.status === 'weak'
  );

  const candidateIds = new Set(candidates.map((c) => c.skillId));

  // 2. Topological & Priority Ordering
  // Skills with uncompleted prerequisites in the candidate set must wait.
  const scheduled: SkillResult[] = [];
  const remaining = [...candidates];
  const completedIds = new Set<string>();

  while (remaining.length > 0) {
    // Find candidate skills whose prerequisites among candidates are already completed
    const ready = remaining.filter((c) => {
      const needed = prereqOf.get(c.skillId) || [];
      return needed.every((req) => !candidateIds.has(req) || completedIds.has(req));
    });

    if (ready.length === 0) {
      // Break cycle fallback if any cyclic constraint exists
      scheduled.push(remaining.shift()!);
      continue;
    }

    // Sort ready candidates by (a) must-have weight, (b) unlocks count, (c) canonical
    ready.sort((a, b) => {
      const aMust = a.required === 'must' ? 1000 : 0;
      const bMust = b.required === 'must' ? 1000 : 0;
      const aWeight = a.weight * 50;
      const bWeight = b.weight * 50;
      const aUnlocks = (unlocksMap.get(a.skillId)?.length || 0) * 20;
      const bUnlocks = (unlocksMap.get(b.skillId)?.length || 0) * 20;
      const scoreA = aMust + aWeight + aUnlocks;
      const scoreB = bMust + bWeight + bUnlocks;

      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.canonical.localeCompare(b.canonical);
    });

    const chosen = ready[0];
    scheduled.push(chosen);
    completedIds.add(chosen.skillId);
    const idx = remaining.findIndex((r) => r.skillId === chosen.skillId);
    remaining.splice(idx, 1);
  }

  // 3. Partition into Three Stages
  const primaryProject = params.projects && params.projects.length > 0 ? params.projects[0].title : null;
  const projectContext = primaryProject ? `project "${primaryProject}"` : 'production portfolio application';

  const items: LearningPathItem[] = scheduled.map((skill, index) => {
    const unlocks = unlocksMap.get(skill.skillId) || [];
    const needed = prereqOf.get(skill.skillId) || [];
    const unlocksInRole = unlocks.filter((u) => params.skillResults.some((sr) => sr.skillId === u));

    // Assign Stage
    let stage: LearningStage;
    if (FOUNDATION_CATEGORIES.has(skill.category) || FOUNDATION_SKILLS.has(skill.skillId) || unlocksInRole.length > 0) {
      stage = 'Foundation';
    } else if (skill.required === 'must') {
      stage = 'Core Role Skills';
    } else {
      stage = 'Differentiators';
    }

    // Load Playbook
    const playbook = SKILL_PLAYBOOKS[skill.skillId] || getGenericPlaybook(skill.canonical, roleTitle);

    let orderRationale = `Core requirement carrying ${skill.weight}/5 priority for target roles.`;
    if (unlocksInRole.length > 0) {
      orderRationale = `Foundational competency unlocking subsequent skills (${unlocksInRole.join(', ')}).`;
    } else if (needed.length > 0) {
      orderRationale = `Builds upon core prerequisites (${needed.join(', ')}).`;
    } else if (skill.required === 'nice') {
      orderRationale = `High-yield differentiator elevating candidate ranking for ${targetTier} positions.`;
    }

    const rawBullet = `${playbook.resumeAction.replace(/^.*?:/i, '').trim()} [e.g. for ${projectContext}: Integrated ${skill.canonical} to process [N] requests with [X%] latency reduction].`;
    const exampleBullet = sanitizeTimeWords(rawBullet);

    return {
      skillId: skill.skillId,
      canonical: skill.canonical,
      category: skill.category,
      stage,
      stageOrder: index + 1,
      required: skill.required,
      status: skill.status as 'missing' | 'weak',
      weight: skill.weight,
      whyItMatters: playbook.whyItMatters,
      orderRationale,
      prerequisitesNeeded: needed,
      unlocksSkills: unlocksInRole,
      steps: [
        { stepNumber: 1, title: 'Master Architectural Concepts', action: playbook.concepts },
        { stepNumber: 2, title: 'Construct Verifiable Proof Project', action: playbook.proofProject },
        { stepNumber: 3, title: 'Document Measurable Resume Bullet', action: playbook.resumeAction },
      ],
      exampleBullet,
      evidenceOfDone: playbook.evidence,
    };
  });

  const stageWeights: Record<LearningStage, number> = {
    Foundation: 1,
    'Core Role Skills': 2,
    Differentiators: 3,
  };

  items.sort((a, b) => {
    if (stageWeights[a.stage] !== stageWeights[b.stage]) {
      return stageWeights[a.stage] - stageWeights[b.stage];
    }
    return a.stageOrder - b.stageOrder;
  });

  items.forEach((item, idx) => {
    item.stageOrder = idx + 1;
  });

  // 4. Generate Resume Rewrites for 3 Weakest Real Bullets
  const realBullets = (params.bullets || []).filter((b) => b.rawText && b.rawText.trim().length > 15);
  realBullets.sort((a, b) => a.score - b.score);
  const weakestThree = realBullets.slice(0, 3);

  const rewrites: WeakBulletRewrite[] = weakestThree.map((bullet) => {
    const verb = selectStrongVerb(bullet.rawText);
    const cleaned = stripWeakPrefix(bullet.rawText);

    let weakness = 'Lacks quantified metrics and measurable engineering impact.';
    if (bullet.hasWeakPhrase && !bullet.hasMetric) {
      weakness = `Starts with passive phrase "${bullet.weakPhrase}" and contains zero quantifiable results.`;
    } else if (bullet.hasWeakPhrase) {
      weakness = `Starts with passive phrase "${bullet.weakPhrase}".`;
    } else if (!bullet.hasStrongVerb) {
      weakness = 'Missing strong action verb and concrete verification metrics.';
    }

    const rawTemplate = `${verb} ${cleaned.replace(/\.$/, '')}, accelerating throughput by [X%] and reducing latency across [N] production requests.`;
    const templateRewrite = sanitizeTimeWords(rawTemplate);

    return {
      originalBullet: bullet.rawText,
      score: bullet.score,
      weakness,
      suggestedVerb: verb,
      templateRewrite,
      placeholders: [
        '[X%] — Replace with measured speedup, capacity gain, or error rate drop',
        '[N] — Replace with true count of endpoints, database rows, or active users',
      ],
    };
  });

  const byStage = {
    foundation: items.filter((i) => i.stage === 'Foundation'),
    core: items.filter((i) => i.stage === 'Core Role Skills'),
    differentiators: items.filter((i) => i.stage === 'Differentiators'),
  };

  return {
    items,
    byStage,
    totalSkillsToAcquire: items.length,
    mustHaveCount: items.filter((i) => i.required === 'must').length,
    niceToHaveCount: items.filter((i) => i.required === 'nice').length,
    rewrites,
  };
}
