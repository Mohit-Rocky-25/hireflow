// ============================================================
// Suite Engine — simulateFix and rankFixes (Stage 2.1)
// Pure, deterministic, < 5ms per simulation, zero mutation
// ============================================================

import { computeAtsScore } from '../../ats/engine/scorer';
import { SkillResult, AtsEngineResult, ParsedSection } from '../../ats/engine/types';

export interface RankedFix {
  skillId: string;
  skillName: string;
  gapClass: 'wording' | 'learn';
  gain: number;
  weight: number;
  proficiencyDistance: number;
  priority: number;
  evidenceSnippet?: string;
}

export interface SimulationFacts {
  wordCount: number;
  skillResults: SkillResult[];
  experience?: any[];
  projects?: any[];
  contactInfo?: any;
  sections?: ParsedSection[];
  candidateYears?: number;
  requiredYears?: number;
  targetTier?: any;
  baseScore?: number;
}

/**
 * Pure simulation: re-runs the existing scorer with that skill treated as matched.
 * Runs in < 2ms without mutating original data.
 */
export function simulateFix(
  facts: SimulationFacts,
  skillId: string
): { scoreBefore: number; scoreAfter: number; gain: number } {
  const safeContact = facts.contactInfo || { email: null, phone: null, github: null, linkedin: null };
  const baseComputed = computeAtsScore({
    wordCount: facts.wordCount,
    skillResults: facts.skillResults,
    experience: facts.experience || [],
    projects: facts.projects || [],
    contactInfo: safeContact,
    sections: facts.sections || [],
    candidateYears: facts.candidateYears || 0,
    requiredYears: facts.requiredYears || 2,
    targetTier: facts.targetTier || 'top_product',
  }).score;

  const scoreBefore = facts.baseScore !== undefined ? facts.baseScore : baseComputed;

  // Deep clone skillResults array
  const simulatedSkills: SkillResult[] = facts.skillResults.map((s) => {
    if (s.skillId === skillId) {
      return {
        ...s,
        found: true,
        status: 'verified',
        proficiency: Math.max(3, s.proficiency || 3),
        evidenceScore: 0.9,
      };
    }
    return s;
  });

  const simulatedResult = computeAtsScore({
    wordCount: facts.wordCount,
    skillResults: simulatedSkills,
    experience: facts.experience || [],
    projects: facts.projects || [],
    contactInfo: safeContact,
    sections: facts.sections || [],
    candidateYears: facts.candidateYears || 0,
    requiredYears: facts.requiredYears || 2,
    targetTier: facts.targetTier || 'top_product',
  });

  const rawGain = Math.max(0, simulatedResult.score - baseComputed);
  const scoreAfter = Math.min(100, scoreBefore + rawGain);
  const gain = scoreAfter - scoreBefore;

  return {
    scoreBefore,
    scoreAfter,
    gain,
  };
}

/**
 * Ranks all gaps using:
 * priority = taxonomy importance weight x proficiency distance
 * Ties broken by gain descending, then alphabetically by skillId.
 */
export function rankFixes(facts: SimulationFacts): RankedFix[] {
  const gaps = facts.skillResults.filter((s) => !s.found || s.status === 'weak');
  const ranked: RankedFix[] = [];

  for (const skill of gaps) {
    const isWeak = (skill.found && skill.status === 'weak') || (!skill.found && (skill.evidenceQuotes?.length ?? 0) > 0);
    const isSubstitute = Boolean(skill.isSubstituteMatch);
    const gapClass: 'wording' | 'learn' = isWeak || isSubstitute ? 'wording' : 'learn';

    // Proficiency distance: working=1, strong=2, expert=3
    // Missing required must-have gets higher distance
    let proficiencyDistance = 2;
    if (gapClass === 'wording') {
      proficiencyDistance = 1;
    } else if (skill.required === 'must' && (skill.weight || 4) >= 4) {
      proficiencyDistance = 3;
    }

    const weight = skill.weight || 4;
    const priority = weight * proficiencyDistance;

    const { gain } = simulateFix(facts, skill.skillId);

    // Extract verbatim evidence snippet for wording fixes if present
    let evidenceSnippet: string | undefined;
    if (skill.evidence && skill.evidence.length > 0) {
      evidenceSnippet = skill.evidence[0].quote;
    } else if (skill.evidenceQuotes && skill.evidenceQuotes.length > 0) {
      evidenceSnippet = skill.evidenceQuotes[0].quote;
    }

    ranked.push({
      skillId: skill.skillId,
      skillName: skill.canonical || skill.skillId,
      gapClass,
      gain,
      weight,
      proficiencyDistance,
      priority,
      evidenceSnippet,
    });
  }

  // Sort by priority desc, then gain desc, then alphabetical
  ranked.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.gain !== a.gain) return b.gain - a.gain;
    return a.skillId.localeCompare(b.skillId);
  });

  return ranked;
}
