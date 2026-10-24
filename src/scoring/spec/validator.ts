// ============================================================
// HireFlow Scoring Suite — Scoring Specification Validator
// Validates spec consistency, completeness, and boundary constraints.
// ============================================================

import { ScoringSpec, ProfileDefinition, PillarDefinition } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateScoringSpec(spec: ScoringSpec): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Semantic Versioning Checks
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
  if (!semverRegex.test(spec.specVersion)) {
    errors.push(`Invalid specVersion format: "${spec.specVersion}". Expected semver (e.g. 2.4.0).`);
  }
  if (!semverRegex.test(spec.engineVersion)) {
    errors.push(`Invalid engineVersion format: "${spec.engineVersion}". Expected semver (e.g. 4.0.0).`);
  }

  // 2. Applicability Rules Indexing
  const ruleMap = new Map<string, { description: string; predicateId: string }>();
  for (const rule of spec.applicabilityRules) {
    if (!rule.id || rule.id.trim() === '') {
      errors.push('Applicability rule found with empty id.');
      continue;
    }
    if (ruleMap.has(rule.id)) {
      errors.push(`Duplicate applicability rule ID: "${rule.id}".`);
    }
    if (!rule.description || rule.description.trim() === '') {
      errors.push(`Applicability rule "${rule.id}" lacks a human-readable description string.`);
    }
    if (!rule.predicateId || rule.predicateId.trim() === '') {
      errors.push(`Applicability rule "${rule.id}" lacks a predicateId.`);
    }
    ruleMap.set(rule.id, rule);
  }

  // 3. Pillar Checks
  const pillarMap = new Map<string, PillarDefinition>();
  for (const pillar of spec.pillars) {
    if (pillarMap.has(pillar.id)) {
      errors.push(`Duplicate pillar ID: "${pillar.id}".`);
    }
    pillarMap.set(pillar.id, pillar);

    if (!pillar.label || pillar.label.trim() === '') {
      errors.push(`Pillar "${pillar.id}" has empty label.`);
    }
    if (!pillar.plainDescription || pillar.plainDescription.trim() === '') {
      errors.push(`Pillar "${pillar.id}" has empty plainDescription.`);
    }
    if (!pillar.computeId || pillar.computeId.trim() === '') {
      errors.push(`Pillar "${pillar.id}" has empty computeId.`);
    }

    // Check that all appliesWhen rule IDs are known
    for (const ruleId of pillar.appliesWhen) {
      if (!ruleMap.has(ruleId)) {
        errors.push(`Pillar "${pillar.id}" references unknown applicability rule: "${ruleId}".`);
      }
    }

    // Check subFeatures
    if (pillar.subFeatures && pillar.subFeatures.length > 0) {
      const subFeatureIds = new Set<string>();
      let subFeatureWeightSum = 0;
      for (const sf of pillar.subFeatures) {
        if (subFeatureIds.has(sf.id)) {
          errors.push(`Pillar "${pillar.id}" contains duplicate subFeature ID: "${sf.id}".`);
        }
        subFeatureIds.add(sf.id);
        if (sf.nominalWeight < 0 || sf.nominalWeight > 100) {
          errors.push(`SubFeature "${sf.id}" in pillar "${pillar.id}" has nominalWeight ${sf.nominalWeight} outside [0, 100].`);
        }
        subFeatureWeightSum += sf.nominalWeight;
      }
      if (Math.abs(subFeatureWeightSum - 100) > 0.001) {
        errors.push(`Pillar "${pillar.id}" subFeatures nominal weights sum to ${subFeatureWeightSum}, expected 100.`);
      }
    }
  }

  // 4. Profile Checks
  const profileMap = new Map<string, ProfileDefinition>();
  for (const profile of spec.profiles) {
    if (profileMap.has(profile.id)) {
      errors.push(`Duplicate profile ID: "${profile.id}".`);
    }
    profileMap.set(profile.id, profile);

    for (const ruleId of profile.selectorRules) {
      if (!ruleMap.has(ruleId)) {
        errors.push(`Profile "${profile.id}" references unknown selector rule: "${ruleId}".`);
      }
    }

    // Weights sum check across all defined pillars
    let weightSum = 0;
    for (const [pillarId, weight] of Object.entries(profile.weights)) {
      if (!pillarMap.has(pillarId)) {
        errors.push(`Profile "${profile.id}" references unknown pillar ID: "${pillarId}".`);
      }
      if (weight < 0 || weight > 100) {
        errors.push(`Profile "${profile.id}" weight for pillar "${pillarId}" is ${weight}, outside [0, 100].`);
      }
      weightSum += weight;

      // Ensure pillar's nominalWeights matches profile weight
      const pillar = pillarMap.get(pillarId);
      if (pillar && pillar.nominalWeights[profile.id] !== weight) {
        errors.push(
          `Discrepancy: Pillar "${pillarId}" nominalWeights[${profile.id}] (${pillar.nominalWeights[profile.id]}) != Profile weights (${weight}).`
        );
      }
    }

    if (Math.abs(weightSum - 100) > 0.001) {
      errors.push(`Profile "${profile.id}" weights sum to ${weightSum}, expected exactly 100.`);
    }

    if (!profile.note || profile.note.trim() === '') {
      errors.push(`Profile "${profile.id}" must include a descriptive note.`);
    }
  }

  // 5. Evidence Tables Checks
  const { contextWeight, bulletScoring, priorityWeights, implicationEdges, parserFriendliness, caps } =
    spec.evidenceTables;

  // contextWeight in [0, 1]
  for (const [key, val] of Object.entries(contextWeight)) {
    if (typeof val !== 'number' || val < 0 || val > 1) {
      errors.push(`evidenceTables.contextWeight.${key} (${val}) is outside [0, 1].`);
    }
  }

  // bulletScoring checks
  const bulletSum =
    bulletScoring.actionVerbMax +
    bulletScoring.measuredResultMax +
    bulletScoring.techInContextMax +
    bulletScoring.outcomeImpactMax;
  if (Math.abs(bulletSum - 100) > 0.001) {
    errors.push(`evidenceTables.bulletScoring category maxes sum to ${bulletSum}, expected exactly 100.`);
  }

  for (const [key, val] of Object.entries(bulletScoring.verbClasses)) {
    if (val < 0 || val > bulletScoring.actionVerbMax) {
      errors.push(`bulletScoring.verbClasses.${key} (${val}) is outside [0, ${bulletScoring.actionVerbMax}].`);
    }
  }
  for (const [key, val] of Object.entries(bulletScoring.measuredResultClasses)) {
    if (val < 0 || val > bulletScoring.measuredResultMax) {
      errors.push(
        `bulletScoring.measuredResultClasses.${key} (${val}) is outside [0, ${bulletScoring.measuredResultMax}].`
      );
    }
  }
  for (const [key, val] of Object.entries(bulletScoring.techContextClasses)) {
    if (val < 0 || val > bulletScoring.techInContextMax) {
      errors.push(`bulletScoring.techContextClasses.${key} (${val}) is outside [0, ${bulletScoring.techInContextMax}].`);
    }
  }
  for (const [key, val] of Object.entries(bulletScoring.outcomeClasses)) {
    if (val < 0 || val > bulletScoring.outcomeImpactMax) {
      errors.push(`bulletScoring.outcomeClasses.${key} (${val}) is outside [0, ${bulletScoring.outcomeImpactMax}].`);
    }
  }

  // priorityWeights
  if (priorityWeights.mandatory < priorityWeights.preferred || priorityWeights.preferred < priorityWeights.mentioned) {
    errors.push(
      `evidenceTables.priorityWeights ordering violation: mandatory (${priorityWeights.mandatory}) must be >= preferred (${priorityWeights.preferred}) >= mentioned (${priorityWeights.mentioned}).`
    );
  }

  // implicationEdges
  for (const edge of implicationEdges) {
    if (!edge.fromSkill || !edge.toSkill) {
      errors.push(`implicationEdge has empty fromSkill or toSkill.`);
    }
    if (edge.creditMultiplier < 0 || edge.creditMultiplier > 1) {
      errors.push(`implicationEdge (${edge.fromSkill} -> ${edge.toSkill}) creditMultiplier outside [0, 1].`);
    }
    if (!edge.rationale || edge.rationale.trim() === '') {
      errors.push(`implicationEdge (${edge.fromSkill} -> ${edge.toSkill}) lacks rationale.`);
    }
  }

  // parserFriendliness
  if (parserFriendliness.baseScore !== 100) {
    errors.push(`parserFriendliness.baseScore is ${parserFriendliness.baseScore}, expected 100.`);
  }
  for (const d of parserFriendliness.deductions) {
    if (d.deductionPoints < 0 || d.deductionPoints > 100) {
      errors.push(`parser deduction "${d.id}" points (${d.deductionPoints}) outside [0, 100].`);
    }
  }
  for (const adv of parserFriendliness.advisories) {
    if (adv.deductionPoints < 0 || adv.deductionPoints > 100) {
      errors.push(`parser advisory "${adv.id}" points (${adv.deductionPoints}) outside [0, 100].`);
    }
  }

  // caps
  if (caps.minComposite !== 0 || caps.maxComposite !== 100) {
    errors.push(`caps composite range must be [0, 100].`);
  }
  if (caps.minPillarScore !== 0 || caps.maxPillarScore !== 100) {
    errors.push(`caps pillar range must be [0, 100].`);
  }
  if (caps.minBulletScore !== 0 || caps.maxBulletScore !== 100) {
    errors.push(`caps bullet range must be [0, 100].`);
  }

  // 6. Band parameters
  if (spec.bandParameters.weightPerturbationFactor <= 0 || spec.bandParameters.weightPerturbationFactor >= 1) {
    errors.push(`bandParameters.weightPerturbationFactor must be between 0 and 1.`);
  }
  if (spec.bandParameters.confidenceThreshold <= 0 || spec.bandParameters.confidenceThreshold > 1) {
    errors.push(`bandParameters.confidenceThreshold must be between 0 and 1.`);
  }
  if (spec.bandParameters.stableWidthMax >= spec.bandParameters.moderateWidthMax) {
    errors.push(`bandParameters stableWidthMax must be less than moderateWidthMax.`);
  }

  // 7. Provenance checks
  if (!spec.provenance || spec.provenance.length === 0) {
    errors.push('Scoring spec must include provenance records.');
  } else {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const prov of spec.provenance) {
      if (!['editorial', 'dataset', 'official'].includes(prov.sourceKind)) {
        errors.push(`Provenance record "${prov.tableId}" has invalid sourceKind: "${prov.sourceKind}".`);
      }
      if (!isoDateRegex.test(prov.lastReviewed)) {
        errors.push(`Provenance record "${prov.tableId}" has invalid lastReviewed date: "${prov.lastReviewed}". Expected YYYY-MM-DD.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function assertValidScoringSpec(spec: ScoringSpec): void {
  const result = validateScoringSpec(spec);
  if (!result.valid) {
    throw new Error(
      `ScoringSpec validation failed with ${result.errors.length} error(s):\n  - ` +
        result.errors.join('\n  - ')
    );
  }
}
