// ============================================================
// HireFlow — Job Role Skill Blueprint & Project Brief Matcher Engine
// Dynamically maps required job description skills against candidate
// resume verified vs gap skills, and runs deterministic greedy
// set-cover over all 158 project briefs to recommend high-yield
// projects that close skill holes and prepare candidates for interviews.
// ============================================================

import briefsData from '../../../../data/suite/project-briefs.json';
import skillsTaxonomyData from '../../../../data/ats/skills-taxonomy.json';
import { ProjectBrief, BriefDifficulty, getBriefHoursRange } from '../bundleBriefs';

export interface JobRoleSkillItem {
  name: string;
  isMandatory?: boolean;
  status: 'verified' | 'gap';
}

export interface MatchedBriefRecommendation {
  brief: ProjectBrief;
  matchedGapSkills: string[];
  reinforcedSkills: string[];
  relevanceScore: number;
  hoursRange: { min: number; max: number; label: string; assumption: string };
  interviewProofPoint: string;
}

export interface JobRoleProjectMatchResult {
  roleTitle: string;
  totalRequired: number;
  verifiedCount: number;
  gapCount: number;
  verifiedSkills: string[];
  gapSkills: string[];
  allGapSkillsCovered: boolean;
  coveredGapSkillsList: string[];
  uncoveredGapSkillsList: string[];
  recommendations: MatchedBriefRecommendation[];
}

export interface JobRoleSkillMatcherInput {
  skills: JobRoleSkillItem[];
  roleTitle?: string;
  maxRecommendations?: number;
}

const ALL_BRIEFS: ProjectBrief[] = briefsData as ProjectBrief[];

interface TaxonomyEntry {
  canonical: string;
  category: string;
  aliases: string[];
  related?: string[];
  weight: number;
  implies?: string[];
}

const TAXONOMY: TaxonomyEntry[] = skillsTaxonomyData as TaxonomyEntry[];

// Fast taxonomy lookup table (lowercase -> canonical)
const TAXONOMY_MAP = new Map<string, string>();
const TAXONOMY_SYNONYMS = new Map<string, Set<string>>();

for (const entry of TAXONOMY) {
  const canonLower = entry.canonical.toLowerCase();
  TAXONOMY_MAP.set(canonLower, entry.canonical);

  const synonyms = new Set<string>();
  synonyms.add(canonLower);

  if (entry.aliases) {
    for (const a of entry.aliases) {
      const aLower = a.toLowerCase();
      TAXONOMY_MAP.set(aLower, entry.canonical);
      synonyms.add(aLower);
    }
  }

  if (entry.related) {
    for (const r of entry.related) {
      synonyms.add(r.toLowerCase());
    }
  }

  TAXONOMY_SYNONYMS.set(entry.canonical, synonyms);
}

/**
 * Normalizes text for lenient stem matching (strips punct, lowercase, basic plural)
 */
function normalizeStem(s: string): string {
  let str = s.toLowerCase().replace(/[-_.\s/()\[\]]/g, '');
  if (str.endsWith('s') && !str.endsWith('ss') && !str.endsWith('is')) {
    str = str.slice(0, -1);
  }
  return str;
}

/**
 * Checks if a candidate skill matches a brief's skill set or tech stack.
 */
function isSkillMatchedInBrief(skillName: string, brief: ProjectBrief): boolean {
  const normSkill = normalizeStem(skillName);
  const canon = TAXONOMY_MAP.get(skillName.toLowerCase()) || skillName;
  const synonyms = TAXONOMY_SYNONYMS.get(canon);

  const allBriefTerms: string[] = [
    ...brief.coveredSkills,
    ...brief.techStack,
    brief.title,
  ];

  for (const term of allBriefTerms) {
    const normTerm = normalizeStem(term);
    if (normTerm === normSkill || normTerm.includes(normSkill) || normSkill.includes(normTerm)) {
      return true;
    }

    if (synonyms) {
      for (const syn of synonyms) {
        const normSyn = normalizeStem(syn);
        if (normTerm === normSyn || normTerm.includes(normSyn) || normSyn.includes(normTerm)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Deterministic engine: matches required role skills against the 158-brief
 * library to find the optimal project portfolio that closes skill gaps.
 */
export function matchJobRoleToProjects(input: JobRoleSkillMatcherInput): JobRoleProjectMatchResult {
  const roleTitle = input.roleTitle?.trim() || 'Target Engineering Role';
  const maxRecs = Math.max(1, Math.min(input.maxRecommendations ?? 4, 6));

  const verifiedSkills: string[] = [];
  const gapSkills: string[] = [];
  const mandatoryGaps = new Set<string>();

  for (const item of input.skills) {
    const clean = item.name.trim();
    if (!clean) continue;
    if (item.status === 'verified') {
      if (!verifiedSkills.includes(clean)) verifiedSkills.push(clean);
    } else {
      if (!gapSkills.includes(clean)) {
        gapSkills.push(clean);
        if (item.isMandatory) mandatoryGaps.add(clean);
      }
    }
  }

  const totalRequired = verifiedSkills.length + gapSkills.length;
  const remainingGaps = new Set<string>(gapSkills);
  const chosenRecommendations: MatchedBriefRecommendation[] = [];

  // Phase 1: Greedy Set-Cover over missing gap skills
  const availableBriefs = [...ALL_BRIEFS];

  while (remainingGaps.size > 0 && availableBriefs.length > 0 && chosenRecommendations.length < maxRecs) {
    let bestBrief: ProjectBrief | null = null;
    let bestMatchedGaps: string[] = [];
    let bestScore = -1;

    for (const brief of availableBriefs) {
      const matchedGapsForBrief = Array.from(remainingGaps).filter((gap) =>
        isSkillMatchedInBrief(gap, brief)
      );

      if (matchedGapsForBrief.length === 0) continue;

      // Score = 20 pts per gap + 15 bonus if mandatory + time efficiency bonus
      let score = matchedGapsForBrief.length * 20;
      for (const g of matchedGapsForBrief) {
        if (mandatoryGaps.has(g)) score += 15;
      }

      // Tie-breaker: prioritize briefs with fewer hours (faster closure)
      score += Math.max(0, 100 - brief.estimatedHours);

      // Domain keyword synergy bonus
      if (roleTitle.toLowerCase().includes('backend') && brief.domain.includes('Backend')) score += 10;
      if (roleTitle.toLowerCase().includes('cloud') && brief.domain.includes('Cloud')) score += 10;
      if (roleTitle.toLowerCase().includes('data') && brief.domain.includes('Data')) score += 10;
      if (roleTitle.toLowerCase().includes('frontend') && brief.domain.includes('Web')) score += 10;

      if (score > bestScore) {
        bestScore = score;
        bestBrief = brief;
        bestMatchedGaps = matchedGapsForBrief;
      }
    }

    if (!bestBrief || bestMatchedGaps.length === 0) {
      // No remaining briefs cover any more remaining gaps
      break;
    }

    // Identify which verified skills this brief reinforces
    const reinforced = verifiedSkills.filter((vs) => isSkillMatchedInBrief(vs, bestBrief!));

    chosenRecommendations.push({
      brief: bestBrief,
      matchedGapSkills: bestMatchedGaps,
      reinforcedSkills: reinforced,
      relevanceScore: bestScore,
      hoursRange: getBriefHoursRange(bestBrief),
      interviewProofPoint: bestBrief.recruiterSignal || bestBrief.problemItSolves || bestBrief.portfolioBulletFormula,
    });

    // Remove covered gaps
    for (const g of bestMatchedGaps) {
      remainingGaps.delete(g);
    }

    // Remove brief from available pool
    const idx = availableBriefs.indexOf(bestBrief);
    if (idx !== -1) availableBriefs.splice(idx, 1);
  }

  // Phase 2: If we still have recommendation slots available,
  // recommend high-yield capstone briefs aligned with role
  if (chosenRecommendations.length < maxRecs) {
    const roleLower = roleTitle.toLowerCase();
    const sortedBackups = availableBriefs
      .map((b) => {
        let score = 0;
        // Reinforces verified skills
        const reinforced = verifiedSkills.filter((vs) => isSkillMatchedInBrief(vs, b));
        score += reinforced.length * 10;
        if (roleLower.includes('system') && b.domain.includes('Distributed')) score += 15;
        if (roleLower.includes('cloud') && b.domain.includes('Cloud')) score += 15;
        if (roleLower.includes('frontend') && b.domain.includes('Web')) score += 15;
        if (roleLower.includes('data') && b.domain.includes('Data')) score += 15;
        if (b.difficulty === 'advanced') score += 5;
        return { brief: b, reinforced, score };
      })
      .sort((a, b) => b.score - a.score);

    for (const item of sortedBackups) {
      if (chosenRecommendations.length >= maxRecs) break;
      chosenRecommendations.push({
        brief: item.brief,
        matchedGapSkills: [],
        reinforcedSkills: item.reinforced,
        relevanceScore: item.score,
        hoursRange: getBriefHoursRange(item.brief),
        interviewProofPoint: item.brief.recruiterSignal || item.brief.problemItSolves,
      });
    }
  }

  const coveredGaps = gapSkills.filter((g) => !remainingGaps.has(g));
  const uncoveredGaps = Array.from(remainingGaps);

  return {
    roleTitle,
    totalRequired,
    verifiedCount: verifiedSkills.length,
    gapCount: gapSkills.length,
    verifiedSkills,
    gapSkills,
    allGapSkillsCovered: uncoveredGaps.length === 0,
    coveredGapSkillsList: coveredGaps,
    uncoveredGapSkillsList: uncoveredGaps,
    recommendations: chosenRecommendations,
  };
}

