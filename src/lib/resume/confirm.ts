// ============================================================
// HIREFLOW CANDIDATE CONFIRMATION & OWNERSHIP MANAGER (STAGE 2)
// User explicit API: candidate confirms fact and declares ownership tier.
// Invariant P1: Facts never render until confirmed.
// Invariant P3: Ownership tier is candidate-declared (1-5); engine never inflates.
// Invariant P4: Unevidenced skills route to /tools/build-briefs?query=<skill>.
// ============================================================

import { AppendOnlyFactLedger } from './ledger';
import { Fact, OwnershipTier } from './types';

export interface SkillEvidenceAssessment {
  skill: string;
  status: 'evidenced' | 'needs_proof';
  evidencedByFactIds: string[];
  briefLink?: string;
  guidance?: string;
}

export interface SkillReadinessReport {
  totalSkillsDeclared: number;
  evidencedCount: number;
  needsProofCount: number;
  skills: SkillEvidenceAssessment[];
}

/**
 * Confirms a fact and binds the candidate's declared ownership tier.
 * Invariant P1 & P3: A fact is only renderable after explicit confirmation + ownership declaration.
 */
export function confirmFact(
  ledger: AppendOnlyFactLedger,
  factId: string,
  ownershipTier: OwnershipTier
): Fact {
  if (![1, 2, 3, 4, 5].includes(ownershipTier)) {
    throw new Error(`Invalid ownership tier "${ownershipTier}". Must be an integer between 1 and 5.`);
  }

  // 1. Mark confirmed
  ledger.confirmFact(factId, true);

  // 2. Assign candidate-declared tier
  return ledger.setOwnershipTier(factId, ownershipTier);
}

/**
 * Unconfirms a fact, ensuring it immediately ceases to appear on any rendered resume.
 */
export function unconfirmFact(
  ledger: AppendOnlyFactLedger,
  factId: string
): Fact {
  return ledger.confirmFact(factId, false);
}

/**
 * Assesses evidence coverage for a list of declared skills against renderable or confirmed facts.
 * Invariant: Unevidenced skills map to "needs proof" with a deep-link to build-briefs.
 */
export function assessSkillReadiness(
  ledger: AppendOnlyFactLedger,
  declaredSkills: string[]
): SkillReadinessReport {
  const allFacts = ledger.allLatestFacts();
  const assessments: SkillEvidenceAssessment[] = [];

  let evidencedCount = 0;
  let needsProofCount = 0;

  for (const skill of declaredSkills) {
    const cleanSkill = skill.trim();
    if (!cleanSkill) continue;

    const lowerSkill = cleanSkill.toLowerCase();
    const matchingFactIds = allFacts
      .filter(f => f.tech.some(t => t.toLowerCase() === lowerSkill) || f.object.toLowerCase().includes(lowerSkill))
      .map(f => f.id);

    if (matchingFactIds.length > 0) {
      evidencedCount++;
      assessments.push({
        skill: cleanSkill,
        status: 'evidenced',
        evidencedByFactIds: matchingFactIds,
      });
    } else {
      needsProofCount++;
      assessments.push({
        skill: cleanSkill,
        status: 'needs_proof',
        evidencedByFactIds: [],
        briefLink: `/tools/build-briefs?query=${encodeURIComponent(cleanSkill)}`,
        guidance: `No project or work experience bullet demonstrates "${cleanSkill}". Build a verified portfolio project to claim this skill legitimately.`,
      });
    }
  }

  return {
    totalSkillsDeclared: declaredSkills.length,
    evidencedCount,
    needsProofCount,
    skills: assessments,
  };
}

