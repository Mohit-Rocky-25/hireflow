// ============================================================
// HireFlow v3 — JD Compare Engine (R6.1, R6.2, R6.3, R6.4)
// Pure, deterministic cross-role comparison, Venn breakdown, and bridge plans
// ============================================================

import { parseJobDescription } from '../matching/jdParser';
import { matchCandidateToJD } from '../matching/matcher';
import { SkillEvidence, MatchClassification } from '../matching/types';
import { IngestionResult } from '../ingestion/types';
import { classifyResumeEvidence } from '../matching/evidenceClassifier';
import { TAILOR_MIRRORING_LIMITS } from '../../config/thresholds';
import { SKILL_MAP } from '../../data/skills';

export interface TargetJDInput {
  id: string;
  label: string;
  jdText: string;
  company?: string;
  roleTitle?: string;
}

export interface MatchConfidenceDetails {
  tier: 'high' | 'medium' | 'low';
  factors: {
    mandatoryCoverage: string;
    jdExtractionQuality: string;
    resumeParseQuality: string;
  };
}

export interface JDAnalysisOutput {
  id: string;
  label: string;
  company?: string;
  roleTitle?: string;
  fitScore: number;
  mustHaveCoverage: {
    total: number;
    matched: number;
    percentage: number;
    missing: string[];
  };
  preferredCoverage: {
    total: number;
    matched: number;
    percentage: number;
  };
  matchConfidence: MatchConfidenceDetails;
  readinessTier: 'Ready to apply' | 'Needs a bridge';
  readinessReason: string;
  requiredSkills: {
    skillId: string;
    canonical: string;
    isMandatory: boolean;
    matchStatus: MatchClassification;
  }[];
  jdUnderstanding: {
    mandatoryList: string[];
    preferredList: string[];
    ignoredBoilerplate: string[];
  };
}

export interface VennSkillItem {
  skillId: string;
  canonical: string;
  isMandatoryInA?: boolean;
  isMandatoryInB?: boolean;
  evidenceQuote: {
    phrase: string;
    section: string;
    level: number;
  } | null;
}

export interface VennBreakdown {
  shared: VennSkillItem[];
  roleAOnly: VennSkillItem[];
  roleBOnly: VennSkillItem[];
}

export interface BridgeStep {
  skillId: string;
  skillName: string;
  type: 'project_brief' | 'credential' | 'gap_notice';
  title: string;
  actionNote: string;
  sourceRef?: string;
}

export interface JDCompareResult {
  roleA: JDAnalysisOutput;
  roleB?: JDAnalysisOutput;
  venn?: VennBreakdown;
  bridgePlan: BridgeStep[];
  disclaimer: string;
}

/**
 * Compares one or two JDs against candidate resume evidence.
 * Deterministic; clock-free; explainable.
 */
export function compareJDsAndCandidate(
  resumeInput: IngestionResult | SkillEvidence[],
  roleAInput: TargetJDInput,
  roleBInput?: TargetJDInput
): JDCompareResult {
  // Extract or receive evidence
  let evidenceList: SkillEvidence[];
  let readingConfidence = 'high';
  let sectionsFoundCount = 4;

  if (Array.isArray(resumeInput)) {
    evidenceList = resumeInput;
  } else {
    const sectionInputs = resumeInput.sections.map((s) => ({ name: s.name, content: s.content }));
    evidenceList = classifyResumeEvidence(sectionInputs).evidenceList;
    readingConfidence = resumeInput.diagnostics.readingOrderConfidence;
    sectionsFoundCount = resumeInput.diagnostics.sectionsFound.length;
  }

  const evidenceMap = new Map<string, SkillEvidence>();
  evidenceList.forEach((e) => evidenceMap.set(e.skillId, e));

  // Analyze Role A
  const roleA = analyzeSingleJD(roleAInput, evidenceList, readingConfidence, sectionsFoundCount);

  // If Role B is provided, analyze Role B and compute Venn + Bridge
  let roleB: JDAnalysisOutput | undefined;
  let venn: VennBreakdown | undefined;

  if (roleBInput) {
    roleB = analyzeSingleJD(roleBInput, evidenceList, readingConfidence, sectionsFoundCount);

    const skillsA = new Map(roleA.requiredSkills.map((s) => [s.skillId, s]));
    const skillsB = new Map(roleB.requiredSkills.map((s) => [s.skillId, s]));

    const shared: VennSkillItem[] = [];
    const roleAOnly: VennSkillItem[] = [];
    const roleBOnly: VennSkillItem[] = [];

    // All unique skills across both JDs
    const allSkillIds = new Set([...skillsA.keys(), ...skillsB.keys()]);

    allSkillIds.forEach((skillId) => {
      const inA = skillsA.get(skillId);
      const inB = skillsB.get(skillId);
      const ev = evidenceMap.get(skillId);

      const item: VennSkillItem = {
        skillId,
        canonical: SKILL_MAP.get(skillId)?.canonical || inA?.canonical || inB?.canonical || skillId,
        isMandatoryInA: inA?.isMandatory,
        isMandatoryInB: inB?.isMandatory,
        evidenceQuote: ev
          ? { phrase: ev.phrase, section: ev.section, level: ev.level }
          : null,
      };

      if (inA && inB) {
        shared.push(item);
      } else if (inA) {
        roleAOnly.push(item);
      } else if (inB) {
        roleBOnly.push(item);
      }
    });

    venn = { shared, roleAOnly, roleBOnly };
  }

  // 3. Build Bridge Plan for Missing Core Skills (R6.3)
  const missingSkills = new Set<string>();
  roleA.mustHaveCoverage.missing.forEach((s) => missingSkills.add(s));
  if (roleB) {
    roleB.mustHaveCoverage.missing.forEach((s) => missingSkills.add(s));
  }

  const bridgePlan: BridgeStep[] = [];
  const topGaps = Array.from(missingSkills).slice(0, 5);

  topGaps.forEach((gapName) => {
    // Look up in skills taxonomy
    const skillDef = Array.from(SKILL_MAP.values()).find(
      (s) => s.canonical.toLowerCase() === gapName.toLowerCase() || s.id === gapName.toLowerCase()
    );

    if (skillDef) {
      // Find matching known brief or credential patterns
      if (['aws', 'docker', 'kubernetes', 'cloud'].includes(skillDef.id)) {
        bridgePlan.push({
          skillId: skillDef.id,
          skillName: skillDef.canonical,
          type: 'credential',
          title: 'AWS Certified Cloud Practitioner or Docker Basics',
          actionNote: `Study official architecture guides and verify fundamentals for ${skillDef.canonical}.`,
          sourceRef: 'HireFlo Verified Opportunities Data',
        });
      } else if (['react', 'vue', 'angular', 'nextjs'].includes(skillDef.id)) {
        bridgePlan.push({
          skillId: skillDef.id,
          skillName: skillDef.canonical,
          type: 'project_brief',
          title: `Interactive Web Application with ${skillDef.canonical}`,
          actionNote: `Build an end-to-end frontend dashboard with responsive layout and push repository to GitHub.`,
          sourceRef: 'HireFlo Curated Briefs Library',
        });
      } else if (['nodejs', 'python', 'fastapi', 'postgresql', 'mysql', 'sql'].includes(skillDef.id)) {
        bridgePlan.push({
          skillId: skillDef.id,
          skillName: skillDef.canonical,
          type: 'project_brief',
          title: `RESTful Microservice with ${skillDef.canonical}`,
          actionNote: `Implement CRUD endpoints with indexed relational database queries and automated API tests.`,
          sourceRef: 'HireFlo Curated Briefs Library',
        });
      } else {
        // Honest fallback when no curated brief exists in repo (Principle P-1)
        bridgePlan.push({
          skillId: skillDef.id,
          skillName: skillDef.canonical,
          type: 'gap_notice',
          title: skillDef.canonical,
          actionNote: 'No matching item in HireFlo yet. Self-directed documentation review recommended.',
        });
      }
    } else {
      bridgePlan.push({
        skillId: gapName.toLowerCase().replace(/\s+/g, '-'),
        skillName: gapName,
        type: 'gap_notice',
        title: gapName,
        actionNote: 'No matching item in HireFlo yet. Self-directed documentation review recommended.',
      });
    }
  });

  return {
    roleA,
    roleB,
    venn,
    bridgePlan: bridgePlan.slice(0, 3), // Show up to 3 structured steps (R6.3)
    disclaimer: 'This is HireFlo\'s own estimate of job match. Different companies use different systems and humans make the final call.',
  };
}

function analyzeSingleJD(
  input: TargetJDInput,
  evidenceList: SkillEvidence[],
  readingConfidence: string,
  sectionsFoundCount: number
): JDAnalysisOutput {
  const parsedJD = parseJobDescription(input.jdText);
  const matchResult = matchCandidateToJD(parsedJD.requirements, evidenceList, true, true);

  const mustHavePct = matchResult.mustHaveCoverage.percentage;
  const isReady = mustHavePct >= TAILOR_MIRRORING_LIMITS.readyToApplyThresholdPct;

  // Match confidence derived from 3 explicit factors (R2.4)
  let confidenceTier: 'high' | 'medium' | 'low' = 'high';
  if (mustHavePct < 45 || parsedJD.requirements.length < 3 || readingConfidence === 'low') {
    confidenceTier = 'low';
  } else if (mustHavePct < 75 || parsedJD.requirements.length < 5 || readingConfidence === 'medium') {
    confidenceTier = 'medium';
  }

  const confidenceDetails: MatchConfidenceDetails = {
    tier: confidenceTier,
    factors: {
      mandatoryCoverage: `${mustHavePct}% of must-have requirements backed by candidate evidence`,
      jdExtractionQuality: `${parsedJD.requirements.length} requirement lines extracted across ${parsedJD.sections.length} parsed sections`,
      resumeParseQuality: `${readingConfidence.toUpperCase()} reading order confidence with ${sectionsFoundCount} standard sections verified`,
    },
  };

  const requiredSkills = matchResult.matches.map((m) => ({
    skillId: m.requirement.skills[0] || m.requirement.id,
    canonical: m.requirement.skills[0]
      ? SKILL_MAP.get(m.requirement.skills[0])?.canonical || m.requirement.skills[0]
      : m.requirement.text.slice(0, 30),
    isMandatory: m.requirement.weightClass >= 2.5,
    matchStatus: m.status,
  }));

  const mandatoryList = parsedJD.requirements
    .filter((r) => r.weightClass >= 2.5)
    .map((r) => r.text);

  const preferredList = parsedJD.requirements
    .filter((r) => r.weightClass < 2.5)
    .map((r) => r.text);

  return {
    id: input.id,
    label: input.label,
    company: input.company,
    roleTitle: input.roleTitle,
    fitScore: matchResult.hardSkillScore,
    mustHaveCoverage: matchResult.mustHaveCoverage,
    preferredCoverage: matchResult.preferredCoverage,
    matchConfidence: confidenceDetails,
    readinessTier: isReady ? 'Ready to apply' : 'Needs a bridge',
    readinessReason: isReady
      ? `You meet ${mustHavePct}% of mandatory requirements, above the ${TAILOR_MIRRORING_LIMITS.readyToApplyThresholdPct}% readiness threshold.`
      : `Needs a bridge: Mandatory coverage is ${mustHavePct}%. Closing 1–2 must-have gaps will raise match confidence.`,
    requiredSkills,
    jdUnderstanding: {
      mandatoryList,
      preferredList,
      ignoredBoilerplate: parsedJD.ignoredLines,
    },
  };
}
