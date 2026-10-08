// ============================================================
// HireFlow Suite — Project Briefs & Set-Cover Bundler (Stage 5.1)
// Decision Group: "What do I build or fix?" (/tools/build-briefs)
// Deterministic greedy set-cover algorithm to find the minimal set of
// production-grade portfolio projects that cover the maximum candidate skill gaps.
// ============================================================

import briefsData from '../../../data/suite/project-briefs.json';

export type BriefDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ProjectBrief {
  id: string;
  title: string;
  domain: string;
  estimatedHours: number;
  difficulty: BriefDifficulty;
  coveredSkills: string[];
  problemStatement: string;
  architecture: string;
  scaleTargets: string;
  techStack: string[];
  verificationRubric: string[];
  portfolioBulletFormula: string;
}

export interface BriefCoverageDetail {
  briefId: string;
  briefTitle: string;
  skillsCovered: string[];
  estimatedHours: number;
}

export interface BundleBriefsResult {
  recommendedBriefs: ProjectBrief[];
  coveredSkills: string[];
  uncoveredSkills: string[];
  coveragePercentage: number; // 0 - 100
  totalEstimatedHours: number;
  briefCoverageMap: BriefCoverageDetail[];
}

export const ALL_PROJECT_BRIEFS: ProjectBrief[] = briefsData as ProjectBrief[];

/**
 * Normalizes a skill string for case-insensitive matching.
 */
function normalizeSkill(s: string): string {
  return s.trim().toLowerCase().replace(/[-_.]/g, '');
}

const DIFFICULTY_WEIGHT: Record<BriefDifficulty, number> = {
  advanced: 3,
  intermediate: 2,
  beginner: 1,
};

/**
 * Deterministic Greedy Set Cover:
 * Finds the minimal set of project briefs that maximizes coverage of target skill gaps.
 * Deterministic tie-breaker:
 * 1. Fewest estimated hours (time efficiency)
 * 2. Highest difficulty level (stronger portfolio signal)
 * 3. Lexicographical ID
 */
export function bundleBriefsForGaps(
  targetGaps: string[],
  availableBriefs: ProjectBrief[] = ALL_PROJECT_BRIEFS,
  maxBriefs: number = 4
): BundleBriefsResult {
  // Clean and deduplicate target gaps
  const uniqueGaps = Array.from(new Set(targetGaps.map((g) => g.trim()).filter(Boolean)));
  if (uniqueGaps.length === 0) {
    // If no specific gaps provided, return top 2 versatile full-stack & distributed briefs
    const defaultBriefs = availableBriefs.slice(0, 2);
    return {
      recommendedBriefs: defaultBriefs,
      coveredSkills: [],
      uncoveredSkills: [],
      coveragePercentage: 100,
      totalEstimatedHours: defaultBriefs.reduce((sum, b) => sum + b.estimatedHours, 0),
      briefCoverageMap: defaultBriefs.map((b) => ({
        briefId: b.id,
        briefTitle: b.title,
        skillsCovered: [],
        estimatedHours: b.estimatedHours,
      })),
    };
  }

  const uncoveredSet = new Set<string>(uniqueGaps.map(normalizeSkill));
  const normalizedGapMap = new Map<string, string>();
  for (const gap of uniqueGaps) {
    normalizedGapMap.set(normalizeSkill(gap), gap);
  }

  const chosenBriefs: ProjectBrief[] = [];
  const remainingBriefs = [...availableBriefs];
  const briefCoverageMap: BriefCoverageDetail[] = [];

  while (uncoveredSet.size > 0 && remainingBriefs.length > 0 && chosenBriefs.length < maxBriefs) {
    let bestBrief: ProjectBrief | null = null;
    let bestCoveredForThisBrief: string[] = [];

    for (const brief of remainingBriefs) {
      const covers = brief.coveredSkills
        .map(normalizeSkill)
        .filter((skill) => uncoveredSet.has(skill));

      if (covers.length === 0) continue;

      if (!bestBrief) {
        bestBrief = brief;
        bestCoveredForThisBrief = covers;
        continue;
      }

      // 1. Maximize newly covered skills count
      if (covers.length > bestCoveredForThisBrief.length) {
        bestBrief = brief;
        bestCoveredForThisBrief = covers;
      } else if (covers.length === bestCoveredForThisBrief.length) {
        // Tie-breaker 1: Lower estimated hours
        if (brief.estimatedHours < bestBrief.estimatedHours) {
          bestBrief = brief;
          bestCoveredForThisBrief = covers;
        } else if (brief.estimatedHours === bestBrief.estimatedHours) {
          // Tie-breaker 2: Higher difficulty weight
          const diffDiff = DIFFICULTY_WEIGHT[brief.difficulty] - DIFFICULTY_WEIGHT[bestBrief.difficulty];
          if (diffDiff > 0) {
            bestBrief = brief;
            bestCoveredForThisBrief = covers;
          } else if (diffDiff === 0) {
            // Tie-breaker 3: Lexicographical ID
            if (brief.id.localeCompare(bestBrief.id) < 0) {
              bestBrief = brief;
              bestCoveredForThisBrief = covers;
            }
          }
        }
      }
    }

    if (!bestBrief || bestCoveredForThisBrief.length === 0) {
      // No remaining brief covers any uncovered skills
      break;
    }

    // Add chosen brief
    chosenBriefs.push(bestBrief);
    const originalNamesCovered = bestCoveredForThisBrief.map(
      (norm) => normalizedGapMap.get(norm) || norm
    );

    briefCoverageMap.push({
      briefId: bestBrief.id,
      briefTitle: bestBrief.title,
      skillsCovered: originalNamesCovered,
      estimatedHours: bestBrief.estimatedHours,
    });

    // Remove covered skills from uncovered set
    for (const norm of bestCoveredForThisBrief) {
      uncoveredSet.delete(norm);
    }

    // Remove chosen brief from candidate pool
    const idx = remainingBriefs.indexOf(bestBrief);
    if (idx !== -1) remainingBriefs.splice(idx, 1);
  }

  // Calculate covered vs uncovered
  const coveredNorms = new Set<string>();
  for (const b of chosenBriefs) {
    for (const s of b.coveredSkills) {
      coveredNorms.add(normalizeSkill(s));
    }
  }

  const coveredSkills: string[] = [];
  const uncoveredSkills: string[] = [];

  for (const gap of uniqueGaps) {
    if (coveredNorms.has(normalizeSkill(gap))) {
      coveredSkills.push(gap);
    } else {
      uncoveredSkills.push(gap);
    }
  }

  const coveragePercentage = Math.round(
    (coveredSkills.length / Math.max(1, uniqueGaps.length)) * 100
  );
  const totalEstimatedHours = chosenBriefs.reduce((sum, b) => sum + b.estimatedHours, 0);

  return {
    recommendedBriefs: chosenBriefs,
    coveredSkills,
    uncoveredSkills,
    coveragePercentage,
    totalEstimatedHours,
    briefCoverageMap,
  };
}

/**
 * Evaluates custom manual selections of briefs against target gaps.
 */
export function evaluateCustomBriefSelection(
  selectedBriefIds: string[],
  targetGaps: string[],
  availableBriefs: ProjectBrief[] = ALL_PROJECT_BRIEFS
): BundleBriefsResult {
  const selectedBriefs = availableBriefs.filter((b) => selectedBriefIds.includes(b.id));
  const uniqueGaps = Array.from(new Set(targetGaps.map((g) => g.trim()).filter(Boolean)));

  const coveredNorms = new Set<string>();
  for (const b of selectedBriefs) {
    for (const s of b.coveredSkills) {
      coveredNorms.add(normalizeSkill(s));
    }
  }

  const coveredSkills: string[] = [];
  const uncoveredSkills: string[] = [];

  for (const gap of uniqueGaps) {
    if (coveredNorms.has(normalizeSkill(gap))) {
      coveredSkills.push(gap);
    } else {
      uncoveredSkills.push(gap);
    }
  }

  const briefCoverageMap: BriefCoverageDetail[] = selectedBriefs.map((b) => {
    const matched = b.coveredSkills.filter((s) =>
      uniqueGaps.some((g) => normalizeSkill(g) === normalizeSkill(s))
    );
    return {
      briefId: b.id,
      briefTitle: b.title,
      skillsCovered: matched,
      estimatedHours: b.estimatedHours,
    };
  });

  const coveragePercentage =
    uniqueGaps.length === 0
      ? 100
      : Math.round((coveredSkills.length / uniqueGaps.length) * 100);

  const totalEstimatedHours = selectedBriefs.reduce((sum, b) => sum + b.estimatedHours, 0);

  return {
    recommendedBriefs: selectedBriefs,
    coveredSkills,
    uncoveredSkills,
    coveragePercentage,
    totalEstimatedHours,
    briefCoverageMap,
  };
}
