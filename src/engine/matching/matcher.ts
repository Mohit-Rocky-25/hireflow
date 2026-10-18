// ============================================================
// HireFlow v3 — Deterministic Matcher Engine (R4.7, R4.8)
// Pure explainable requirement matching & hard-skill scoring
// ============================================================

import {
  JDRequirement,
  MatchResult,
  RequirementMatch,
  SkillEvidence,
  MatchClassification,
} from './types';
import { SKILL_MAP } from '../../data/skills';
import {
  MATCH_CLASSIFICATION_MULTIPLIERS,
  REQUIREMENT_WEIGHT_CLASSES,
} from '../../config/scoring';

/**
 * Evaluates candidate skill evidence against target JD requirements.
 * Fully deterministic; no Math.random(), no clock dependency.
 */
export function matchCandidateToJD(
  requirements: JDRequirement[],
  evidenceList: SkillEvidence[],
  hasExtractedDegree = false,
  hasFresherProjects = true
): MatchResult {
  const evidenceMap = new Map<string, SkillEvidence>(
    evidenceList.map((e) => [e.skillId, e])
  );

  const matches: RequirementMatch[] = [];
  let totalWeightedScore = 0;
  let totalMaxWeight = 0;

  let mandatoryCount = 0;
  let mandatoryMatchedCount = 0;
  const missingMandatory: string[] = [];

  let preferredCount = 0;
  let preferredMatchedCount = 0;

  const missingSkillsSet = new Map<string, { skillId: string; canonical: string; weight: number; isMandatory: boolean }>();

  // Process requirements grouped or individually
  requirements.forEach((req) => {
    const isMandatory = req.kind === 'mandatory';
    const isPreferred = req.kind === 'preferred';

    if (isMandatory) mandatoryCount++;
    if (isPreferred) preferredCount++;

    // 1. Degree Requirements Matching
    if (req.kind === 'degree') {
      const status: MatchClassification = hasExtractedDegree ? 'DIRECT' : 'PARTIAL';
      const scoreMultiplier = hasExtractedDegree
        ? MATCH_CLASSIFICATION_MULTIPLIERS.DIRECT
        : MATCH_CLASSIFICATION_MULTIPLIERS.PARTIAL;

      matches.push({
        requirement: req,
        status,
        scoreMultiplier,
        evidence: null,
        reason: hasExtractedDegree
          ? 'Qualifying engineering degree detected in education section.'
          : 'Degree details not clearly detected; consider adding explicit degree and branch.',
      });

      totalWeightedScore += req.weightClass * scoreMultiplier;
      totalMaxWeight += req.weightClass;
      return;
    }

    // 2. Experience Requirements Matching (Fresher-friendly)
    if (req.kind === 'experience') {
      const status: MatchClassification = hasFresherProjects ? 'DIRECT' : 'PARTIAL';
      const scoreMultiplier = hasFresherProjects
        ? MATCH_CLASSIFICATION_MULTIPLIERS.DIRECT
        : MATCH_CLASSIFICATION_MULTIPLIERS.PARTIAL;

      matches.push({
        requirement: req,
        status,
        scoreMultiplier,
        evidence: null,
        reason: hasFresherProjects
          ? 'Demonstrated project portfolio matches entry-level / fresher requirement.'
          : 'Fresher projects or internship evidence needed to establish technical experience.',
      });

      totalWeightedScore += req.weightClass * scoreMultiplier;
      totalMaxWeight += req.weightClass;
      return;
    }

    // 3. Technical Skills Matching (handles individual skills & OR-groups)
    let bestStatus: MatchClassification = 'MISSING';
    let bestMultiplier = 0;
    let matchedEvidence: SkillEvidence | null = null;
    let transferableInfo: RequirementMatch['transferableVia'];
    let reason = 'No evidence found in resume for target skill.';

    for (const skillId of req.skills) {
      const directEv = evidenceMap.get(skillId);

      // (a) Direct evidence check
      if (directEv) {
        if (directEv.level >= 1) {
          bestStatus = 'DIRECT';
          bestMultiplier = MATCH_CLASSIFICATION_MULTIPLIERS.DIRECT;
          matchedEvidence = directEv;
          reason = `Direct evidence found in ${directEv.section}: "${directEv.phrase.slice(0, 80)}"`;
          break; // DIRECT is optimal
        } else {
          // L0 listed only -> PARTIAL
          if (bestMultiplier < MATCH_CLASSIFICATION_MULTIPLIERS.PARTIAL) {
            bestStatus = 'PARTIAL';
            bestMultiplier = MATCH_CLASSIFICATION_MULTIPLIERS.PARTIAL;
            matchedEvidence = directEv;
            reason = `Listed in ${directEv.section}, but not demonstrated in projects or experience.`;
          }
        }
      }

      // (b) Transferable relation check (siblings & parents)
      const skillDef = SKILL_MAP.get(skillId);
      if (skillDef) {
        // Check siblings (e.g. knowing PostgreSQL when MySQL is required)
        for (const sibId of skillDef.siblings) {
          const sibEv = evidenceMap.get(sibId);
          if (sibEv && sibEv.level >= 1) {
            if (bestMultiplier < MATCH_CLASSIFICATION_MULTIPLIERS.TRANSFERABLE) {
              bestStatus = 'TRANSFERABLE';
              bestMultiplier = MATCH_CLASSIFICATION_MULTIPLIERS.TRANSFERABLE;
              matchedEvidence = sibEv;
              transferableInfo = { fromSkill: sibEv.canonical, relation: 'sibling' };
              reason = `Transferable experience: You have ${sibEv.canonical} experience (${sibEv.section}) related to required ${skillDef.canonical}.`;
            }
          }
        }

        // Check parents (e.g. knowing a frontend framework when a category is required)
        for (const parentCat of skillDef.parents) {
          // Find if candidate has any skill that shares this parent
          for (const [candidateSkillId, candEv] of evidenceMap.entries()) {
            const candDef = SKILL_MAP.get(candidateSkillId);
            if (candDef && candDef.parents.includes(parentCat) && candEv.level >= 1) {
              if (bestMultiplier < MATCH_CLASSIFICATION_MULTIPLIERS.TRANSFERABLE) {
                bestStatus = 'TRANSFERABLE';
                bestMultiplier = MATCH_CLASSIFICATION_MULTIPLIERS.TRANSFERABLE;
                matchedEvidence = candEv;
                transferableInfo = { fromSkill: candEv.canonical, relation: 'parent' };
                reason = `Transferable domain skill: ${candEv.canonical} demonstrates competency in ${parentCat}.`;
              }
            }
          }
        }
      }
    }

    // Check if status is MISSING
    if (bestStatus === 'MISSING') {
      req.skills.forEach((sId) => {
        const def = SKILL_MAP.get(sId);
        const name = def?.canonical || sId;
        missingSkillsSet.set(sId, {
          skillId: sId,
          canonical: name,
          weight: req.weightClass,
          isMandatory,
        });
        if (isMandatory && !missingMandatory.includes(name)) {
          missingMandatory.push(name);
        }
      });
    }

    if (bestStatus === 'DIRECT' || bestStatus === 'TRANSFERABLE') {
      if (isMandatory) mandatoryMatchedCount++;
      if (isPreferred) preferredMatchedCount++;
    }

    matches.push({
      requirement: req,
      status: bestStatus,
      scoreMultiplier: bestMultiplier,
      evidence: matchedEvidence,
      transferableVia: transferableInfo,
      reason,
    });

    totalWeightedScore += req.weightClass * bestMultiplier;
    totalMaxWeight += req.weightClass;
  });

  const hardSkillScore = totalMaxWeight > 0
    ? Math.round((totalWeightedScore / totalMaxWeight) * 100)
    : 0;

  const mustHavePct = mandatoryCount > 0
    ? Math.round((mandatoryMatchedCount / mandatoryCount) * 100)
    : 100;

  const preferredPct = preferredCount > 0
    ? Math.round((preferredMatchedCount / preferredCount) * 100)
    : 100;

  // Match confidence derived from:
  // (a) Mandatory requirements coverage
  // (b) Clear requirements found
  let matchConfidence: MatchResult['matchConfidence'] = 'high';
  if (mustHavePct < 45 || requirements.length < 3) {
    matchConfidence = 'low';
  } else if (mustHavePct < 75 || requirements.length < 5) {
    matchConfidence = 'medium';
  }

  // Top gaps sorted descending by requirement weight
  const topGaps = Array.from(missingSkillsSet.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  return {
    hardSkillScore,
    mustHaveCoverage: {
      total: mandatoryCount,
      matched: mandatoryMatchedCount,
      percentage: mustHavePct,
      missing: missingMandatory,
    },
    preferredCoverage: {
      total: preferredCount,
      matched: preferredMatchedCount,
      percentage: preferredPct,
    },
    matchConfidence,
    matches,
    topGaps,
    findings: [],
  };
}
