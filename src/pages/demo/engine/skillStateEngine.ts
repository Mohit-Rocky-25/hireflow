// ============================================================
// HireFlow — Single Source of Truth for Skill State (Stage 2)
// Pure module: builds definitive, non-contradictory skill states
// consumed across Competency Table, Market Intelligence,
// Action Plans, Project Matcher, and Dossier Export.
// ============================================================

import { matchesTokenSafely } from '@/scoring/core';
import { COMPETENCY_SIGNALS, formatCompetencyName, getSentences } from '../talentLensEngine';

export type SkillKind = 'language' | 'framework' | 'database' | 'concept' | 'domain' | 'soft-skill';
export type RequirementSource = 'jd-text' | 'inferred-from-company-tier';
export type SkillEvidenceStrength = 'demonstrated' | 'mentioned';
export type SkillStatus = 'demonstrated' | 'mentioned' | 'not-found';

export interface SkillEvidenceItem {
  text: string;
  strength: SkillEvidenceStrength;
}

export interface SkillState {
  id: string;
  label: string;
  kind: SkillKind;
  requirementLevel: string;
  requirementSource: RequirementSource;
  evidence: SkillEvidenceItem[];
  status: SkillStatus;
  // Diagnostics & compatibility metadata
  score: number;
  confidence: number;
  gaps: string[];
  summaryLine: string;
  contextSentences: string[];
  layerScores?: { l1: number; l2: number; l3: number; l4: number; l5: number };
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

  // Domains & Infrastructure
  finance: 'domain',
  fintech: 'domain',
  security: 'domain',
  appsec: 'domain',
  devops: 'domain',
  cloud: 'domain',
  aws: 'domain',
  gcp: 'domain',
  azure: 'domain',
  kubernetes: 'domain',
  docker: 'domain',
  ml: 'domain',
  ai: 'domain',
  'machine learning': 'domain',
  web: 'domain',

  // Soft Skills
  communication: 'soft-skill',
  leadership: 'soft-skill',
  teamwork: 'soft-skill',
  collaboration: 'soft-skill',
  ownership: 'soft-skill',
  mentorship: 'soft-skill',
};

export function classifySkillKind(skillId: string): SkillKind {
  const norm = skillId.toLowerCase().trim().replace(/[-_]/g, '');
  if (SKILL_KIND_MAP[norm]) return SKILL_KIND_MAP[norm];
  if (SKILL_KIND_MAP[skillId.toLowerCase().trim()]) return SKILL_KIND_MAP[skillId.toLowerCase().trim()];

  if (/leader|manage|communicat|collaborat|mentor|present/i.test(norm)) return 'soft-skill';
  if (/sql|db|postgres|mongo|redis|store|data/i.test(norm)) return 'database';
  if (/react|angular|vue|spring|django|flask|fastapi|node|express/i.test(norm)) return 'framework';
  if (/java|python|golang|go|rust|c\+\+|cpp|csharp|kotlin|swift/i.test(norm)) return 'language';
  if (/design|algo|dsa|structure|architect|concurr/i.test(norm)) return 'concept';
  return 'domain';
}

const ACTION_VERBS = [
  'built', 'developed', 'designed', 'implemented', 'architected', 'migrated',
  'engineered', 'scaled', 'optimized', 'reduced', 'automated', 'shipped',
  'deployed', 'maintained', 'created', 'refactored', 'integrated', 'modeled',
  'trained', 'benchmarked', 'delivered', 'solved', 'orchestrated'
];

/**
 * Checks if a sentence demonstrates technical action with authentic engineering context.
 * Rejects bare keyword dumps, list headers, and comma-separated buzzword lists.
 */
export function isDemonstratedContext(sentence: string): boolean {
  const s = sentence.toLowerCase().trim();
  if (s.length < 20) return false;

  // Header or list pattern check
  if (/^(skills|technologies|tools|languages|competencies|proficiencies|technical\s+skills|frameworks)\s*[:|-]/i.test(s)) {
    return false;
  }

  // Count commas and technical buzzwords in the sentence
  const words = s.split(/\s+/);
  if (words.length < 6) return false;

  // Excessive comma list check (e.g. "Used X, Y, Z, A, B, C")
  const commaCount = (s.match(/,/g) || []).length;
  if (commaCount >= 4 && words.length <= commaCount * 3) {
    return false;
  }

  // Must contain an active engineering verb
  const hasAction = ACTION_VERBS.some((verb) => {
    const rx = new RegExp(`\\b${verb}\\b`, 'i');
    return rx.test(s);
  });

  if (!hasAction) return false;

  // Must have context beyond just verb + keywords (e.g. what was built or solved)
  const hasOutcomeOrObject = /to\s+|for\s+|using\s+|with\s+|by\s+|which\s+|achiev|reduc|improv|scal|handl|serv|process|stream|pipelin|servic|app|api|cluster|quer/i.test(s);
  return hasOutcomeOrObject;
}

/**
 * Builds unified, consistent skill states for an evaluation.
 * Enforces:
 * 1. Single source of truth across all report sections.
 * 2. Primary evidence uniqueness (one sentence is primary proof for at most one skill).
 * 3. Contextual evidence gating ('demonstrated' vs 'mentioned' vs 'not-found').
 * 4. Honest requirement sourcing ('jd-text' vs 'inferred-from-company-tier').
 */
export function buildSkillStates(input: BuildSkillStatesInput): SkillState[] {
  const { resumeText, competencies, reqLevels = {}, role, company } = input;
  const rawSentences = getSentences(resumeText);

  // Check if role is campus / fresher hiring
  const isCampus =
    (role?.title || '').toLowerCase().includes('campus') ||
    (role?.title || '').toLowerCase().includes('fresher') ||
    (role?.level || '').toLowerCase().includes('entry') ||
    (role?.level || '').toLowerCase().includes('intern');

  const jdFull = [
    role?.title,
    role?.desc,
    role?.fullText,
    ...(Array.isArray(role?.requiredSkills) ? role.requiredSkills.map((s) => (typeof s === 'string' ? s : s?.skill || '')) : [])
  ].filter(Boolean).join(' ').toLowerCase();

  // Set of sentences already claimed as primary proof by an earlier skill
  const claimedPrimarySentences = new Set<string>();

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

    // Signals for this competency
    const signals = COMPETENCY_SIGNALS[compLower] || {
      keywords: [compLower],
      contextPhrases: [],
      redFlags: []
    };

    // Find sentences matching this skill
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

    for (const sentence of matchingSentences) {
      const isDemonstration = isDemonstratedContext(sentence);

      if (isDemonstration && !hasPrimaryDemonstration && !claimedPrimarySentences.has(sentence)) {
        // Can claim as primary demonstration
        claimedPrimarySentences.add(sentence);
        hasPrimaryDemonstration = true;
        evidenceItems.push({ text: sentence, strength: 'demonstrated' });
        contextSentences.push(sentence);
      } else {
        // Already claimed or lacks demonstration context -> counts as 'mentioned'
        evidenceItems.push({ text: sentence, strength: 'mentioned' });
      }
    }

    // Determine status
    let status: SkillStatus;
    if (evidenceItems.length === 0) {
      status = 'not-found';
    } else if (hasPrimaryDemonstration) {
      status = 'demonstrated';
    } else {
      status = 'mentioned';
    }

    // Determine score / confidence
    let score = 0;
    if (status === 'demonstrated') {
      score = evidenceItems.length >= 2 ? 85 : 70;
    } else if (status === 'mentioned') {
      score = 40;
    } else {
      score = 0;
    }

    // State-specific summary line (fixes D12)
    let summaryLine: string;
    if (status === 'not-found') {
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
    if (status === 'not-found') {
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
      score,
      confidence: score,
      gaps,
      summaryLine,
      contextSentences,
      layerScores: {
        l1: status === 'not-found' ? 0 : 70,
        l2: status === 'demonstrated' ? 80 : status === 'mentioned' ? 30 : 0,
        l3: status === 'demonstrated' ? 60 : 0,
        l4: status === 'demonstrated' ? 50 : 0,
        l5: 100,
      },
    });
  }

  return results;
}
