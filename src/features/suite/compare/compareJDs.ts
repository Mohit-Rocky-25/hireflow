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

export interface CompareJDsResult {
  rankedJDs: SingleJDResult[];
  sharedGaps: SharedGap[];
  uniqueGaps: UniqueGap[];
  matrix: OverlapMatrix;
  mergedDuplicatesCount: number;
  unparseableJDsCount: number;
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
  if (skill.evidence?.[0]?.evidenceTier !== undefined && skill.evidence[0].evidenceTier < 0.5) return 'implied';
  return 'exact';
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
  };
}
