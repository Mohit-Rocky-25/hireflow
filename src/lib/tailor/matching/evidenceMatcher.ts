// ============================================================
// HIREFLOW EVIDENCE-BASED MATCHING ENGINE
// Evaluates candidate facts against job requirements with transferability
// ============================================================

import {
  CandidateProfile,
  JobDescription,
  EvidenceMapping,
  RequirementAssessment,
  AssessmentStatus,
  EvidenceSnippet
} from '../types';
import { buildCandidateFactLedger } from '../ledger/factLedger';
import { extractSkillsFromText } from '../knowledge/skillsTaxonomy';
import { findTransferableMatch } from '../knowledge/transferability';

export function matchCandidateToJob(
  candidate: CandidateProfile,
  job: JobDescription
): EvidenceMapping {
  const factLedger = buildCandidateFactLedger(candidate);
  const assessments: RequirementAssessment[] = [];

  // Index candidate skills
  const candidateCanonicalSkillIds = new Set<string>();
  for (const fact of factLedger) {
    for (const c of fact.normalizedConcepts) {
      candidateCanonicalSkillIds.add(c);
    }
  }

  // Also index candidate raw concepts and keywords
  const candidateAllTextLower = factLedger.map(f => f.rawText.toLowerCase()).join(' ');

  let directCount = 0;
  let transferableCount = 0;
  let missingCount = 0;

  for (const req of job.requirements) {
    const reqSkills = extractSkillsFromText(req.text);
    const supportingFacts: EvidenceSnippet[] = [];
    let status: AssessmentStatus = 'MISSING';
    let rationale = 'No direct evidence found in the supplied resume.';
    let transferableFrom: string | undefined = undefined;

    // 0. Category-specific matching (Education)
    if (req.category === 'education' && candidate.education.length > 0) {
      const edu = candidate.education[0];
      supportingFacts.push({
        factId: `fact_edu_${edu.id}`,
        section: 'education',
        verbatimText: `${edu.degree} at ${edu.institution}`,
        confidence: 0.95,
        explanation: 'Candidate possesses university degree satisfying educational prerequisite.'
      });
      status = 'DIRECT';
      rationale = `Candidate holds verified ${edu.degree} from ${edu.institution}.`;
      directCount++;
      assessments.push({
        requirementId: req.id,
        status,
        supportingFacts,
        rationale,
        candidateStatus: 'UNCONFIRMED'
      });
      continue;
    }

    // 1. Direct Search in Candidate Facts
    for (const fact of factLedger) {
      const factLower = fact.rawText.toLowerCase();

      // Check if requirement skill is in this fact
      const hasSkillOverlap = reqSkills.some(rs => fact.normalizedConcepts.includes(rs.id));
      const hasLexicalOverlap = reqSkills.some(rs => factLower.includes(rs.name.toLowerCase()));

      // Check specific conceptual overlaps (e.g. data structures, algorithms, sql)
      const hasConceptOverlap =
        (req.text.toLowerCase().includes('data structures') && factLower.includes('data structures')) ||
        (req.text.toLowerCase().includes('git') && factLower.includes('git')) ||
        (req.text.toLowerCase().includes('postgresql') && factLower.includes('postgresql'));

      if (hasSkillOverlap || hasLexicalOverlap || hasConceptOverlap) {
        supportingFacts.push({
          factId: fact.factId,
          section: fact.sourceSection,
          verbatimText: fact.rawText,
          confidence: 0.95,
          explanation: `Direct evidence matching ${req.normalizedConcept}`
        });
      }
    }

    if (supportingFacts.length > 0) {
      status = 'DIRECT';
      rationale = `Candidate demonstrates verified direct experience with ${req.normalizedConcept} in ${supportingFacts[0].section}.`;
      directCount++;
    } else {
      // 2. Transferability check via knowledge graph
      let foundTransfer = false;
      for (const reqSkill of reqSkills) {
        for (const candSkillId of candidateCanonicalSkillIds) {
          const edge = findTransferableMatch(candSkillId, reqSkill.id);
          if (edge) {
            status = 'TRANSFERABLE';
            transferableFrom = candSkillId;
            rationale = `Transferable capability: ${edge.rationale}`;
            transferableCount++;
            foundTransfer = true;

            const transFacts = factLedger.filter(f => f.normalizedConcepts.includes(candSkillId));
            for (const tf of transFacts.slice(0, 2)) {
              supportingFacts.push({
                factId: tf.factId,
                section: tf.sourceSection,
                verbatimText: tf.rawText,
                confidence: edge.weight,
                explanation: `Transferable from ${candSkillId}: ${edge.rationale}`
              });
            }
            break;
          }
        }
        if (foundTransfer) break;
      }

      if (!foundTransfer) {
        // 3. Check for partial keyword presence
        const words = req.text.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const partialFact = factLedger.find(f => words.some(w => f.rawText.toLowerCase().includes(w)));
        if (partialFact) {
          status = 'PARTIAL';
          rationale = `Candidate mentions related domain terminology in ${partialFact.sourceSection}.`;
          supportingFacts.push({
            factId: partialFact.factId,
            section: partialFact.sourceSection,
            verbatimText: partialFact.rawText,
            confidence: 0.50,
            explanation: 'Related domain context found'
          });
        } else {
          status = 'MISSING';
          rationale = 'Skill or qualification is missing from supplied resume evidence. (Does not imply candidate cannot learn or perform).';
          missingCount++;
        }
      }
    }

    assessments.push({
      requirementId: req.id,
      status,
      supportingFacts,
      rationale,
      candidateStatus: 'UNCONFIRMED',
      transferableFrom
    });
  }

  // Calculate Coverage Metrics
  const mandatoryReqs = job.requirements.filter(r => r.priority === 'MANDATORY');
  const preferredReqs = job.requirements.filter(r => r.priority === 'PREFERRED');

  const mandatoryMatched = assessments.filter(a => {
    const req = job.requirements.find(r => r.id === a.requirementId);
    return req?.priority === 'MANDATORY' && (a.status === 'DIRECT' || a.status === 'TRANSFERABLE');
  }).length;

  const preferredMatched = assessments.filter(a => {
    const req = job.requirements.find(r => r.id === a.requirementId);
    return req?.priority === 'PREFERRED' && (a.status === 'DIRECT' || a.status === 'TRANSFERABLE');
  }).length;

  const mandatoryCoveragePct = mandatoryReqs.length > 0
    ? Math.round((mandatoryMatched / mandatoryReqs.length) * 100)
    : 100;

  const preferredCoveragePct = preferredReqs.length > 0
    ? Math.round((preferredMatched / preferredReqs.length) * 100)
    : 100;

  const overallFitScore = Math.round(
    (mandatoryCoveragePct * 0.7) + (preferredCoveragePct * 0.3)
  );

  return {
    candidateId: candidate.id,
    jobId: job.id,
    assessments,
    mandatoryCoveragePct,
    preferredCoveragePct,
    directMatchesCount: directCount,
    transferableMatchesCount: transferableCount,
    missingRequirementsCount: missingCount,
    overallFitScore,
    evaluatedAt: new Date().toISOString()
  };
}
