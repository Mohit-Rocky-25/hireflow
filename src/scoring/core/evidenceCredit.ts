// ============================================================
// HireFlow Scoring Suite — Evidence Credit Calculator
// Pure function calculating requirement support credit & implied skills
// ============================================================

import { ScoringSpec, ContextWeightTable, ImplicationEdge } from '../spec/types';

export type MentionContext = 'experience' | 'projectWithLink' | 'academicProject' | 'skillsBlockOnly' | 'none';

export interface SkillEvidenceAssessment {
  skill: string;
  bestContext: MentionContext;
  directCredit: number;       // 0.0 to 1.0 based on contextWeight table
  impliedFrom?: string;       // Name of skill implying this skill
  impliedCredit: number;      // 0.5 * parentCredit for STRONG, 0.0 for WEAK
  effectiveCredit: number;    // Math.max(directCredit, impliedCredit)
  isImpliedOnly: boolean;
  notes: string;
}

/**
 * Returns context credit for a direct mention in a section
 */
export function getDirectContextCredit(
  context: MentionContext,
  table: ContextWeightTable
): number {
  switch (context) {
    case 'experience':
      return table.experience;
    case 'projectWithLink':
      return table.projectWithLink;
    case 'academicProject':
      return table.academicProject;
    case 'skillsBlockOnly':
      return table.skillsBlockOnly;
    case 'none':
    default:
      return 0.0;
  }
}

/**
 * Evaluates a set of requirements against candidate skill evidence and spec implication edges.
 */
export function evaluateEvidenceCredit(
  requirements: { id: string; name: string; priorityWeight: number }[],
  candidateMentions: Map<string, MentionContext>,
  spec: ScoringSpec
): {
  assessments: Map<string, SkillEvidenceAssessment>;
  weightedCoverageScore: number;
} {
  const { contextWeight, implicationEdges } = spec.evidenceTables;
  const assessments = new Map<string, SkillEvidenceAssessment>();

  // 1. Direct credit evaluation
  for (const req of requirements) {
    const canonicalLower = req.name.toLowerCase();
    const mention = candidateMentions.get(canonicalLower) || 'none';
    const directCredit = getDirectContextCredit(mention, contextWeight);

    assessments.set(canonicalLower, {
      skill: req.name,
      bestContext: mention,
      directCredit,
      impliedCredit: 0.0,
      effectiveCredit: directCredit,
      isImpliedOnly: false,
      notes: mention === 'none' ? 'Not demonstrated in resume text.' : `Direct mention in ${mention} (credit: ${directCredit}).`,
    });
  }

  // 2. Implied credit evaluation (STRONG edges only: 0.5 * parentCredit)
  for (const edge of implicationEdges) {
    const fromLower = edge.fromSkill.toLowerCase();
    const toLower = edge.toSkill.toLowerCase();

    const parentMention = candidateMentions.get(fromLower);
    if (parentMention && parentMention !== 'none') {
      const parentCredit = getDirectContextCredit(parentMention, contextWeight);
      const targetAssessment = assessments.get(toLower);

      if (targetAssessment) {
        if (edge.type === 'STRONG') {
          const impliedVal = edge.creditMultiplier * parentCredit;
          if (impliedVal > targetAssessment.effectiveCredit) {
            targetAssessment.impliedFrom = edge.fromSkill;
            targetAssessment.impliedCredit = impliedVal;
            targetAssessment.effectiveCredit = impliedVal;
            targetAssessment.isImpliedOnly = targetAssessment.directCredit === 0;
            targetAssessment.notes = `Implied by ${edge.fromSkill} (STRONG implication credit: ${impliedVal.toFixed(2)}).`;
          }
        }
        // WEAK edges grant 0.0 credit per spec Rule 3.1
      }
    }
  }

  // 3. Compute weighted coverage score
  let weightedSum = 0;
  let totalPriority = 0;

  for (const req of requirements) {
    const canonicalLower = req.name.toLowerCase();
    const assessment = assessments.get(canonicalLower);
    const credit = assessment ? assessment.effectiveCredit : 0.0;
    weightedSum += credit * req.priorityWeight;
    totalPriority += req.priorityWeight;
  }

  const rawCoverage = totalPriority > 0 ? (weightedSum / totalPriority) * 100 : 0;
  const weightedCoverageScore = Math.min(100, Math.max(0, rawCoverage));

  return {
    assessments,
    weightedCoverageScore,
  };
}
