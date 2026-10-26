/**
 * HireFlow v4: Role Presets & Non-CS Branch Bridge Engine (A5)
 * Derives synthetic JD requirements from fresher role families and computes
 * transferable skill pathways for non-CS/IT candidates (ECE, EEE, Mechanical, Civil).
 */

import presetsData from '../../data/presets/role-presets.json';
import { REQUIREMENT_WEIGHT_CLASSES } from '../../config/scoring';

export interface RolePresetFamily {
  familyId: string;
  title: string;
  description: string;
  coreSkills: string[];
  commonSkills: string[];
  bonusSkills: string[];
  branchTransferable: Record<string, string[]>;
}

export interface SyntheticRequirement {
  id: string;
  skill: string;
  importance: 'must_have' | 'good_to_have' | 'mentioned';
  weight: number;
  sourceCategory: 'core' | 'common' | 'bonus';
}

export interface BranchBridgeResult {
  branch: string;
  isCsIt: boolean;
  promptSetBranch: boolean;
  transferableSkills: string[];
  skillsToAdd: string[];
  message: string;
}

export function getRolePresets(): RolePresetFamily[] {
  return presetsData.families as RolePresetFamily[];
}

export function getPresetById(familyId: string): RolePresetFamily | undefined {
  return (presetsData.families as RolePresetFamily[]).find((f) => f.familyId === familyId);
}

/**
 * Transforms a role family preset into synthetic evaluation requirements.
 * Allows candidates to run baseline ATS scans without entering a custom JD.
 */
export function buildRequirementsFromPreset(preset: RolePresetFamily): {
  requirements: SyntheticRequirement[];
  baselineLabel: string;
} {
  const requirements: SyntheticRequirement[] = [];

  // Core skills -> mandatory (3.0 weight)
  preset.coreSkills.forEach((skill, idx) => {
    requirements.push({
      id: `core-${idx}`,
      skill,
      importance: 'must_have',
      weight: REQUIREMENT_WEIGHT_CLASSES.mandatory,
      sourceCategory: 'core',
    });
  });

  // Common skills -> preferred (1.5 weight)
  preset.commonSkills.forEach((skill, idx) => {
    requirements.push({
      id: `common-${idx}`,
      skill,
      importance: 'good_to_have',
      weight: REQUIREMENT_WEIGHT_CLASSES.preferred,
      sourceCategory: 'common',
    });
  });

  // Bonus skills -> mentioned (1.0 weight)
  preset.bonusSkills.forEach((skill, idx) => {
    requirements.push({
      id: `bonus-${idx}`,
      skill,
      importance: 'mentioned',
      weight: REQUIREMENT_WEIGHT_CLASSES.mentioned,
      sourceCategory: 'bonus',
    });
  });

  return {
    requirements,
    baselineLabel: `HireFlo Fresher Baseline: ${preset.title}`,
  };
}

const CS_IT_BRANCHES = new Set(['cse', 'cs', 'it', 'computer science', 'information technology', 'software engineering']);

/**
 * Computes non-CS branch bridging advice based on academic engineering curriculum.
 */
export function getBranchBridgeAdvice(
  branch: string | undefined | null,
  familyId: string,
  candidateSkills: string[] = []
): BranchBridgeResult {
  if (!branch || !branch.trim()) {
    return {
      branch: 'Unknown',
      isCsIt: false,
      promptSetBranch: true,
      transferableSkills: [],
      skillsToAdd: [],
      message: 'Set your engineering branch in your profile to view transferable skill pathways.',
    };
  }

  const normalizedBranch = branch.trim().toUpperCase();
  const isCs = /computer\s*science|cse|\bcs\b|\bit\b|information\s*technology|software\s*engineering/i.test(branch);

  const preset = getPresetById(familyId);
  if (!preset) {
    return {
      branch: normalizedBranch,
      isCsIt: isCs,
      promptSetBranch: false,
      transferableSkills: [],
      skillsToAdd: [],
      message: 'Role family not found.',
    };
  }

  if (isCs) {
    return {
      branch: normalizedBranch,
      isCsIt: true,
      promptSetBranch: false,
      transferableSkills: preset.coreSkills,
      skillsToAdd: [],
      message: 'Direct engineering branch match. Core focus is hands-on project proof and system depth.',
    };
  }

  // Non-CS branch: match with branchTransferable
  let matchedBranchKey = 'ECE';
  let displayBranch = normalizedBranch;
  if (normalizedBranch.includes('ELECTR') && (normalizedBranch.includes('COMM') || normalizedBranch.includes('TELE'))) {
    matchedBranchKey = 'ECE';
    displayBranch = normalizedBranch.includes('ECE') ? normalizedBranch : `${normalizedBranch} (ECE)`;
  } else if (normalizedBranch.includes('ECE')) {
    matchedBranchKey = 'ECE';
  } else if (normalizedBranch.includes('EEE') || normalizedBranch.includes('ELECTRI')) {
    matchedBranchKey = 'EEE';
    displayBranch = normalizedBranch.includes('EEE') ? normalizedBranch : `${normalizedBranch} (EEE)`;
  } else if (normalizedBranch.includes('MECH')) {
    matchedBranchKey = 'Mechanical';
  } else if (normalizedBranch.includes('CIVIL')) {
    matchedBranchKey = 'Civil';
  } else {
    matchedBranchKey = 'ECE';
  }

  const transferable = preset.branchTransferable[matchedBranchKey] || [];
  const candidateLower = candidateSkills.map((s) => s.toLowerCase());

  const skillsToAdd = preset.coreSkills.filter(
    (core) => !candidateLower.includes(core.toLowerCase())
  );

  return {
    branch: displayBranch,
    isCsIt: false,
    promptSetBranch: false,
    transferableSkills: transferable,
    skillsToAdd,
    message: `Bridging from ${displayBranch} into ${preset.title}. Lead with transferable core problem-solving and software coursework, then prove software depth with projects.`,
  };
}
