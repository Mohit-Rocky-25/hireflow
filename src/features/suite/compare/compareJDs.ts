// ============================================================
// Suite Engine — Compare Job Descriptions (Stage 3.1)
// Rank roles, discover shared gaps, cross-JD fix impact, matrix
// ============================================================

import { runAtsEngine } from '../../ats/engine';
import { SkillResult } from '../../ats/engine/types';
import { RankedFix, rankFixes, simulateFix, SimulationFacts } from '../engine/simulateFix';
import { buildQuickSummary } from '../engine/quickSummary';

export interface JDInput {
  id: string;
  label: string;
  text: string;
  company?: string;
  roleTitle?: string;
  experienceLevel?: string;
  location?: string;
  salaryRange?: string;
  marketTier?: string;
}

export interface SingleJDResult {
  id: string;
  label: string;
  hash: string;
  score: number;
  mustHaveCoverage: number;
  mustHaveMet: number;
  mustHaveTotal: number;
  verdict: string;
  verdictReason: string;
  topFixes: RankedFix[];
  skillResults: SkillResult[];
  failedToParse?: boolean;
  parseError?: string;
  company?: string;
  roleTitle?: string;
  experienceLevel?: string;
  location?: string;
  salaryRange?: string;
  marketTier?: string;
  matchedSkills: string[];
  missingMustHaves: string[];
  missingPreferred: string[];
  interviewProbability: number;
  readinessAssessment: 'Interview Ready' | 'Competitive Contender' | 'Targeted Gap Closure' | 'High Risk';
}

export interface SharedGap {
  skillId: string;
  skillName: string;
  jdsMissingCount: number;
  jdsMissingLabels: string[];
  importanceWeight: number;
  simulatedGains: Record<string, number>;
  totalSimulatedGain: number;
}

export interface UniqueGap {
  skillId: string;
  skillName: string;
  jdId: string;
  jdLabel: string;
}

export interface OverlapMatrix {
  skills: { id: string; name: string }[];
  cells: Record<string, Record<string, 'exact' | 'alias' | 'implied' | 'related' | 'missing'>>;
}

export interface HeadToHeadComparison {
  jdA: SingleJDResult;
  jdB: SingleJDResult;
  winnerId: string | 'tie';
  winnerLabel: string;
  scoreDelta: number;
  leadMargin: number;
  executiveRecommendation: string;
  strategicRationale: string;
  commonCoreSkills: {
    skillId: string;
    name: string;
    statusA: 'matched' | 'weak' | 'missing';
    statusB: 'matched' | 'weak' | 'missing';
    isMustHaveInBoth: boolean;
  }[];
  divergence: {
    roleAExclusive: {
      skillId: string;
      name: string;
      found: boolean;
      required: 'must' | 'preferred';
    }[];
    roleBExclusive: {
      skillId: string;
      name: string;
      found: boolean;
      required: 'must' | 'preferred';
    }[];
  };
  bridgePlan: {
    stepNumber: number;
    title: string;
    action: string;
    impact: string;
    targetRole: 'Role A' | 'Role B' | 'Both';
    estimatedHours: number;
  }[];
}

export interface CompareJDsResult {
  rankedJDs: SingleJDResult[];
  sharedGaps: SharedGap[];
  uniqueGaps: UniqueGap[];
  matrix: OverlapMatrix;
  mergedDuplicatesCount: number;
  unparseableJDsCount: number;
  headToHead?: HeadToHeadComparison | null;
}

/**
 * Deterministic hash for string comparison.
 */
function hashText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

/**
 * Maps a skill match to one of the 4 match tiers or missing.
 */
function getMatchTier(skill: SkillResult): 'exact' | 'alias' | 'implied' | 'related' | 'missing' {
  if (!skill.found) return 'missing';
  if (skill.isSubstituteMatch) return 'related';
  if (skill.status === 'weak') return 'alias';
  const maxTier = skill.evidence?.reduce((max, e) => Math.max(max, e.evidenceTier ?? 0), 0) ?? 0;
  if (maxTier < 0.5 && skill.status !== 'verified') return 'implied';
  return 'exact';
}

/**
 * Computes estimated interview callback probability (5% - 95%)
 */
function calculateInterviewProbability(score: number, mustHaveCoverage: number): number {
  let prob = score * 0.65 + mustHaveCoverage * 100 * 0.35;
  if (mustHaveCoverage >= 0.85) prob += 8;
  if (mustHaveCoverage < 0.5) prob -= 18;
  return Math.min(95, Math.max(5, Math.round(prob)));
}

/**
 * Categorizes readiness tier
 */
function determineReadiness(score: number, mustHaveCoverage: number): SingleJDResult['readinessAssessment'] {
  if (score >= 75 && mustHaveCoverage >= 0.8) return 'Interview Ready';
  if (score >= 60 && mustHaveCoverage >= 0.65) return 'Competitive Contender';
  if (score >= 45) return 'Targeted Gap Closure';
  return 'High Risk';
}

/**
 * Builds side-by-side head-to-head comparison between two job descriptions
 */
function buildHeadToHead(jdA: SingleJDResult, jdB: SingleJDResult): HeadToHeadComparison {
  const scoreDelta = Math.abs(jdA.score - jdB.score);
  const leadMargin = jdA.score - jdB.score;

  let winnerId: string | 'tie' = 'tie';
  let winnerLabel = 'Even Match';

  if (leadMargin > 3) {
    winnerId = jdA.id;
    winnerLabel = jdA.company ? `${jdA.company} (${jdA.label})` : jdA.label;
  } else if (leadMargin < -3) {
    winnerId = jdB.id;
    winnerLabel = jdB.company ? `${jdB.company} (${jdB.label})` : jdB.label;
  } else {
    // Tie-break by must-have coverage
    const covDelta = jdA.mustHaveCoverage - jdB.mustHaveCoverage;
    if (covDelta > 0.1) {
      winnerId = jdA.id;
      winnerLabel = jdA.company ? `${jdA.company} (${jdA.label})` : jdA.label;
    } else if (covDelta < -0.1) {
      winnerId = jdB.id;
      winnerLabel = jdB.company ? `${jdB.company} (${jdB.label})` : jdB.label;
    }
  }

  // Common core skills vs divergence
  const skillsMapA = new Map(jdA.skillResults.map((s) => [s.skillId, s]));
  const skillsMapB = new Map(jdB.skillResults.map((s) => [s.skillId, s]));

  const commonCoreSkills: HeadToHeadComparison['commonCoreSkills'] = [];
  const roleAExclusive: HeadToHeadComparison['divergence']['roleAExclusive'] = [];
  const roleBExclusive: HeadToHeadComparison['divergence']['roleBExclusive'] = [];

  for (const [idA, skillA] of skillsMapA.entries()) {
    const skillB = skillsMapB.get(idA);
    if (skillB) {
      commonCoreSkills.push({
        skillId: idA,
        name: skillA.canonical,
        statusA: !skillA.found ? 'missing' : skillA.status === 'weak' ? 'weak' : 'matched',
        statusB: !skillB.found ? 'missing' : skillB.status === 'weak' ? 'weak' : 'matched',
        isMustHaveInBoth: skillA.required === 'must' && skillB.required === 'must',
      });
    } else {
      roleAExclusive.push({
        skillId: idA,
        name: skillA.canonical,
        found: skillA.found,
        required: skillA.required === 'must' ? 'must' : 'preferred',
      });
    }
  }

  for (const [idB, skillB] of skillsMapB.entries()) {
    if (!skillsMapA.has(idB)) {
      roleBExclusive.push({
        skillId: idB,
        name: skillB.canonical,
        found: skillB.found,
        required: skillB.required === 'must' ? 'must' : 'preferred',
      });
    }
  }

  // Executive rationale
  let executiveRecommendation = '';
  let strategicRationale = '';

  if (winnerId === jdA.id) {
    executiveRecommendation = `Prioritize ${jdA.label} first (${jdA.score}% vs ${jdB.score}%).`;
    strategicRationale = `Your resume demonstrates significantly stronger alignment with ${jdA.label}'s core requirements (${Math.round(
      jdA.mustHaveCoverage * 100
    )}% must-haves met vs ${Math.round(
      jdB.mustHaveCoverage * 100
    )}%). Apply here first while closing remaining bridge gaps for ${jdB.label}.`;
  } else if (winnerId === jdB.id) {
    executiveRecommendation = `Prioritize ${jdB.label} first (${jdB.score}% vs ${jdA.score}%).`;
    strategicRationale = `Your profile shows superior readiness for ${jdB.label} (${Math.round(
      jdB.mustHaveCoverage * 100
    )}% must-haves met vs ${Math.round(
      jdA.mustHaveCoverage * 100
    )}%). You have an estimated ${jdB.interviewProbability}% interview callback rate compared to ${jdA.interviewProbability}% for ${jdA.label}.`;
  } else {
    executiveRecommendation = `Both roles present nearly identical readiness profiles (${jdA.score}% vs ${jdB.score}%).`;
    strategicRationale = `Your core qualifications match both roles equally. Focus your preparation on the shared core competencies (${commonCoreSkills.length} common skills) to qualify for both pipelines simultaneously.`;
  }

  // Actionable Bridge Plan (3 concrete steps)
  const bridgePlan: HeadToHeadComparison['bridgePlan'] = [];

  // Step 1: Shared missing skills (cross-role leverage)
  const sharedMissing = commonCoreSkills.filter((s) => s.statusA === 'missing' && s.statusB === 'missing');
  if (sharedMissing.length > 0) {
    const topShared = sharedMissing.slice(0, 2).map((s) => s.name).join(' & ');
    bridgePlan.push({
      stepNumber: 1,
      title: `Close Shared Core Competencies: ${topShared}`,
      action: `Add concrete project bullet points demonstrating hands-on usage of ${topShared} with verifiable scale or latency metrics.`,
      impact: `Simultaneously lifts both role scores (+8% to +14% total boost).`,
      targetRole: 'Both',
      estimatedHours: 4,
    });
  } else {
    bridgePlan.push({
      stepNumber: 1,
      title: 'Strengthen Shared Core Evidence Depth',
      action: 'Upgrade project bullet points for common core technologies to include quantifiable business outcomes (latency, throughput, revenue).',
      impact: 'Solidifies verified match tier for both ATS filters.',
      targetRole: 'Both',
      estimatedHours: 3,
    });
  }

  // Step 2: Role A specific high-priority fix
  const targetForStep2 = winnerId === jdB.id ? jdB : jdA;
  const missingMust = targetForStep2.missingMustHaves[0] || targetForStep2.topFixes[0]?.skillName;
  bridgePlan.push({
    stepNumber: 2,
    title: `Target ${targetForStep2.company || targetForStep2.label} Must-Have: ${missingMust || 'Key Competencies'}`,
    action: missingMust
      ? `Tailor your primary experience section to highlight ${missingMust} architecture and production deployment.`
      : `Fine-tune resume keywords to match ${targetForStep2.label} exact phrasing.`,
    impact: `Protects against automated recruiter rejection filters (+${targetForStep2.topFixes[0]?.gain || 6}% score boost).`,
    targetRole: targetForStep2.id === jdA.id ? 'Role A' : 'Role B',
    estimatedHours: 2,
  });

  // Step 3: Secondary expansion
  const alternateRole = winnerId === jdB.id ? jdA : jdB;
  const missingAlt = alternateRole.missingMustHaves[0] || alternateRole.topFixes[0]?.skillName || 'Architecture Primitives';
  bridgePlan.push({
    stepNumber: 3,
    title: `Secondary Role Adaptation: ${alternateRole.company || alternateRole.label}`,
    action: `Create a dedicated tailored resume variant highlighting ${missingAlt} before applying to ${alternateRole.label}.`,
    impact: `Bridges the ${scoreDelta}% gap and turns this second role into a high-confidence backup offer.`,
    targetRole: alternateRole.id === jdA.id ? 'Role A' : 'Role B',
    estimatedHours: 3,
  });

  return {
    jdA,
    jdB,
    winnerId,
    winnerLabel,
    scoreDelta,
    leadMargin,
    executiveRecommendation,
    strategicRationale,
    commonCoreSkills,
    divergence: {
      roleAExclusive,
      roleBExclusive,
    },
    bridgePlan,
  };
}

/**
 * Compares 2 to 5 JDs against a single candidate resume.
 * Yields via setTimeout(0) to ensure the UI remains smooth and never freezes.
 */
export async function compareJDs(
  resumeText: string,
  jds: JDInput[],
  onProgress?: (done: number, total: number) => void
): Promise<CompareJDsResult> {
  const seenHashes = new Set<string>();
  const uniqueInputs: JDInput[] = [];
  let mergedDuplicatesCount = 0;

  for (const jd of jds) {
    const trimmed = (jd.text || '').trim();
    if (!trimmed) continue;
    const h = hashText(trimmed.toLowerCase());
    if (seenHashes.has(h)) {
      mergedDuplicatesCount++;
    } else {
      seenHashes.add(h);
      uniqueInputs.push(jd);
    }
  }

  const jdResults: SingleJDResult[] = [];
  let unparseableJDsCount = 0;

  for (let i = 0; i < uniqueInputs.length; i++) {
    const jd = uniqueInputs[i];
    await new Promise((resolve) => setTimeout(resolve, 0));
    const jdWords = jd.text.trim().split(/\s+/).filter(Boolean).length;
    if (jdWords < 20) {
      unparseableJDsCount++;
      jdResults.push({
        id: jd.id,
        label: jd.label || `Role ${i + 1}`,
        hash: hashText(jd.text),
        score: 0,
        mustHaveCoverage: 0,
        mustHaveMet: 0,
        mustHaveTotal: 0,
        verdict: 'Insufficient input',
        verdictReason: `Job description is too short (${jdWords} words detected; minimum 20 required).`,
        topFixes: [],
        skillResults: [],
        failedToParse: true,
        parseError: `Job description is too short (${jdWords} words). Minimum 20 words required.`,
        company: jd.company,
        roleTitle: jd.roleTitle,
        experienceLevel: jd.experienceLevel,
        location: jd.location,
        salaryRange: jd.salaryRange,
        marketTier: jd.marketTier,
        matchedSkills: [],
        missingMustHaves: [],
        missingPreferred: [],
        interviewProbability: 5,
        readinessAssessment: 'High Risk',
      });
      onProgress?.(i + 1, uniqueInputs.length);
      continue;
    }

    const response = runAtsEngine(resumeText, jd.text);
    if (!response.success) {
      unparseableJDsCount++;
      jdResults.push({
        id: jd.id,
        label: jd.label || `Role ${i + 1}`,
        hash: hashText(jd.text),
        score: 0,
        mustHaveCoverage: 0,
        mustHaveMet: 0,
        mustHaveTotal: 0,
        verdict: 'Insufficient input',
        verdictReason: response.message,
        topFixes: [],
        skillResults: [],
        failedToParse: true,
        parseError: response.message,
        company: jd.company,
        roleTitle: jd.roleTitle,
        experienceLevel: jd.experienceLevel,
        location: jd.location,
        salaryRange: jd.salaryRange,
        marketTier: jd.marketTier,
        matchedSkills: [],
        missingMustHaves: [],
        missingPreferred: [],
        interviewProbability: 5,
        readinessAssessment: 'High Risk',
      });
    } else {
      const res = response.result;
      const facts: SimulationFacts = {
        wordCount: res.audit.wordCount,
        skillResults: res.skillResults,
        baseScore: res.score,
      };

      const summary = buildQuickSummary(facts);
      const mustSkills = res.skillResults.filter((s) => s.required === 'must');
      const mustMet = mustSkills.filter((s) => s.found).length;
      const mustTotal = mustSkills.length;
      const mustCoverage = mustTotal > 0 ? mustMet / mustTotal : 1.0;

      const matchedSkills = res.skillResults.filter((s) => s.found).map((s) => s.canonical);
      const missingMustHaves = res.skillResults
        .filter((s) => !s.found && s.required === 'must')
        .map((s) => s.canonical);
      const missingPreferred = res.skillResults
        .filter((s) => !s.found && s.required !== 'must')
        .map((s) => s.canonical);

      const interviewProbability = calculateInterviewProbability(res.score, mustCoverage);
      const readinessAssessment = determineReadiness(res.score, mustCoverage);

      jdResults.push({
        id: jd.id,
        label: jd.label || `Role ${i + 1}`,
        hash: hashText(jd.text),
        score: res.score,
        mustHaveCoverage: mustCoverage,
        mustHaveMet: mustMet,
        mustHaveTotal: mustTotal,
        verdict: summary.verdict,
        verdictReason: summary.verdictReason,
        topFixes: summary.topFixes,
        skillResults: res.skillResults,
        company: jd.company,
        roleTitle: jd.roleTitle,
        experienceLevel: jd.experienceLevel,
        location: jd.location,
        salaryRange: jd.salaryRange,
        marketTier: jd.marketTier,
        matchedSkills,
        missingMustHaves,
        missingPreferred,
        interviewProbability,
        readinessAssessment,
      });
    }

    onProgress?.(i + 1, uniqueInputs.length);
  }

  // 1. Ranking by score descending, tie-broken by must-have coverage, then label
  const rankedJDs = [...jdResults].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.mustHaveCoverage !== a.mustHaveCoverage) return b.mustHaveCoverage - a.mustHaveCoverage;
    return a.label.localeCompare(b.label);
  });

  const validJDs = rankedJDs.filter((r) => !r.failedToParse);

  // 2. Identify shared and unique gaps
  const missingBySkill = new Map<string, { name: string; weight: number; jdIds: string[]; jdLabels: string[] }>();

  for (const jd of validJDs) {
    for (const skill of jd.skillResults) {
      if (!skill.found) {
        const existing = missingBySkill.get(skill.skillId) || {
          name: skill.canonical,
          weight: skill.weight || 4,
          jdIds: [],
          jdLabels: [],
        };
        existing.jdIds.push(jd.id);
        existing.jdLabels.push(jd.label);
        missingBySkill.set(skill.skillId, existing);
      }
    }
  }

  const sharedGaps: SharedGap[] = [];
  const uniqueGaps: UniqueGap[] = [];

  for (const [skillId, info] of missingBySkill.entries()) {
    if (info.jdIds.length >= 2) {
      // Shared gap across 2+ JDs
      const gains: Record<string, number> = {};
      let totalGain = 0;

      for (const jdId of info.jdIds) {
        const jd = validJDs.find((j) => j.id === jdId);
        if (jd) {
          const sim = simulateFix(
            {
              wordCount: 300,
              skillResults: jd.skillResults,
              baseScore: jd.score,
            },
            skillId
          );
          gains[jdId] = sim.gain;
          totalGain += sim.gain;
        }
      }

      sharedGaps.push({
        skillId,
        skillName: info.name,
        jdsMissingCount: info.jdIds.length,
        jdsMissingLabels: info.jdLabels,
        importanceWeight: info.weight,
        simulatedGains: gains,
        totalSimulatedGain: totalGain,
      });
    } else if (info.jdIds.length === 1) {
      uniqueGaps.push({
        skillId,
        skillName: info.name,
        jdId: info.jdIds[0],
        jdLabel: info.jdLabels[0],
      });
    }
  }

  // Sort shared gaps by (jdsMissingCount * importanceWeight) descending
  sharedGaps.sort((a, b) => {
    const scoreA = a.jdsMissingCount * a.importanceWeight;
    const scoreB = b.jdsMissingCount * b.importanceWeight;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.totalSimulatedGain - a.totalSimulatedGain;
  });

  // Sort unique gaps by skill name
  uniqueGaps.sort((a, b) => a.skillName.localeCompare(b.skillName));

  // 3. Overlap Matrix
  const allSkillsMap = new Map<string, string>();
  for (const jd of validJDs) {
    for (const skill of jd.skillResults) {
      allSkillsMap.set(skill.skillId, skill.canonical);
    }
  }

  const skillsList = Array.from(allSkillsMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const cells: OverlapMatrix['cells'] = {};

  for (const s of skillsList) {
    cells[s.id] = {};
    for (const jd of validJDs) {
      const match = jd.skillResults.find((sr) => sr.skillId === s.id);
      cells[s.id][jd.id] = match ? getMatchTier(match) : 'missing';
    }
  }

  // 4. Head-to-Head Comparison (when at least 2 valid JDs exist)
  let headToHead: HeadToHeadComparison | null = null;
  if (validJDs.length >= 2) {
    // If the input was specifically 2 JDs, compare in input order (A vs B)
    const firstInputValid = jdResults.find((r) => r.id === uniqueInputs[0]?.id && !r.failedToParse);
    const secondInputValid = jdResults.find((r) => r.id === uniqueInputs[1]?.id && !r.failedToParse);

    if (firstInputValid && secondInputValid) {
      headToHead = buildHeadToHead(firstInputValid, secondInputValid);
    } else {
      headToHead = buildHeadToHead(validJDs[0], validJDs[1]);
    }
  }

  return {
    rankedJDs,
    sharedGaps,
    uniqueGaps,
    matrix: {
      skills: skillsList,
      cells,
    },
    mergedDuplicatesCount,
    unparseableJDsCount,
    headToHead,
  };
}
