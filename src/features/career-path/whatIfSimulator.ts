/**
 * HireFlow v4: Career Trajectory What-If Simulator & Eligibility Gating (D20)
 * Deterministic mathematical simulation of candidate market readiness delta
 * when adding technologies, upgrading project evidence, or testing corporate cutoffs.
 */

import { ATS_PILLAR_WEIGHTS } from '../../config/scoring';
import { ExplainedValue } from '../../types/explain';

export interface WhatIfScenarioInput {
  currentSkills: string[];
  targetSkills: string[];
  currentEvidenceScore: number; // 0 - 100
  projectsCount: number;
  addedSkills: string[];
  upgradeProjectToMetrics?: boolean;
}

export interface WhatIfScenarioResult {
  baselineScore: number;
  simulatedScore: number;
  delta: number;
  pillarDeltas: {
    hardSkills: { before: number; after: number; delta: number };
    evidenceQuality: { before: number; after: number; delta: number };
  };
  explanation: ExplainedValue;
  actionableInsights: string[];
}

export function simulateWhatIfReadiness(input: WhatIfScenarioInput): WhatIfScenarioResult {
  const targetLower = new Set(input.targetSkills.map((s) => s.toLowerCase()));
  const currentLower = new Set(input.currentSkills.map((s) => s.toLowerCase()));

  // 1. Baseline hard skills coverage
  let baselineMatched = 0;
  for (const s of targetLower) {
    if (currentLower.has(s)) baselineMatched++;
  }
  const baselineHardSkills = targetLower.size > 0 ? (baselineMatched / targetLower.size) * 100 : 70;

  // 2. Simulated hard skills coverage
  const simulatedSet = new Set(currentLower);
  for (const add of input.addedSkills) {
    simulatedSet.add(add.toLowerCase());
  }

  let simulatedMatched = 0;
  for (const s of targetLower) {
    if (simulatedSet.has(s)) simulatedMatched++;
  }
  const simulatedHardSkills = targetLower.size > 0 ? (simulatedMatched / targetLower.size) * 100 : 85;

  // 3. Evidence Quality simulation
  let simulatedEvidence = input.currentEvidenceScore;
  if (input.upgradeProjectToMetrics) {
    // Upgrading bullet points to include quantified outcome metrics increases evidence score by up to 25 pts
    simulatedEvidence = Math.min(100, input.currentEvidenceScore + 25);
  }

  const baselineScore = Math.round(
    baselineHardSkills * ATS_PILLAR_WEIGHTS.hardSkills +
    input.currentEvidenceScore * ATS_PILLAR_WEIGHTS.evidenceQuality +
    65 * ATS_PILLAR_WEIGHTS.fresherReadiness +
    90 * ATS_PILLAR_WEIGHTS.formatSafety
  );

  const simulatedScore = Math.round(
    simulatedHardSkills * ATS_PILLAR_WEIGHTS.hardSkills +
    simulatedEvidence * ATS_PILLAR_WEIGHTS.evidenceQuality +
    (input.upgradeProjectToMetrics ? 75 : 65) * ATS_PILLAR_WEIGHTS.fresherReadiness +
    90 * ATS_PILLAR_WEIGHTS.formatSafety
  );

  const delta = Math.max(0, simulatedScore - baselineScore);

  const insights: string[] = [];
  if (input.addedSkills.length > 0) {
    insights.push(
      `Adding ${input.addedSkills.join(' + ')} directly targets ${simulatedMatched - baselineMatched} currently missing mandatory role skills (+${Math.round((simulatedHardSkills - baselineHardSkills) * ATS_PILLAR_WEIGHTS.hardSkills)} pts).`
    );
  }
  if (input.upgradeProjectToMetrics) {
    insights.push(
      'Upgrading bullets to include verified metrics (latency, QPS, data volume) elevates evidence tier from L1 to L3 (+25 pts on Evidence Quality).'
    );
  }

  const explain: ExplainedValue = {
    id: 'what-if-readiness-delta',
    label: 'What-If Readiness Delta',
    value: simulatedScore,
    unit: '/100',
    formula: `SimulatedScore = (SimulatedHardSkills * ${ATS_PILLAR_WEIGHTS.hardSkills}) + (SimulatedEvidence * ${ATS_PILLAR_WEIGHTS.evidenceQuality}) + (Readiness * ${ATS_PILLAR_WEIGHTS.fresherReadiness}) + (Format * ${ATS_PILLAR_WEIGHTS.formatSafety})`,
    inputs: [
      { name: 'Baseline Score', value: baselineScore },
      { name: 'Simulated Hard Skills', value: `${Math.round(simulatedHardSkills)}%` },
      { name: 'Simulated Evidence', value: `${Math.round(simulatedEvidence)}/100` },
      { name: 'Delta Gain', value: `+${delta} pts` },
    ],
    confidence: 'high',
    limitations: [
      'Simulated readiness assumes added technologies are backed by verifiable project repository code.',
      'Does not substitute for live interview problem-solving or coding round execution.',
    ],
  };

  return {
    baselineScore,
    simulatedScore,
    delta,
    pillarDeltas: {
      hardSkills: {
        before: Math.round(baselineHardSkills),
        after: Math.round(simulatedHardSkills),
        delta: Math.round(simulatedHardSkills - baselineHardSkills),
      },
      evidenceQuality: {
        before: Math.round(input.currentEvidenceScore),
        after: Math.round(simulatedEvidence),
        delta: Math.round(simulatedEvidence - input.currentEvidenceScore),
      },
    },
    explanation: explain,
    actionableInsights: insights,
  };
}

// -------------------------------------------------------------
// Product Company Academic Eligibility Gate
// -------------------------------------------------------------

export interface AcademicGateInput {
  tenthPercent?: number;
  twelfthPercent?: number;
  btechCgpa?: number; // on 10.0 scale or % (if > 10)
  activeBacklogs?: number;
}

export interface CompanyTierEligibility {
  tierName: string;
  eligible: boolean;
  status: 'fully_eligible' | 'conditionally_eligible' | 'cutoff_disqualified';
  cutoffDescription: string;
  strategyGuidance: string;
}

export function evaluateAcademicEligibility(input: AcademicGateInput): CompanyTierEligibility[] {
  const tenth = input.tenthPercent || 75;
  const twelfth = input.twelfthPercent || 75;
  const rawCgpa = input.btechCgpa || 7.5;
  const cgpa10 = rawCgpa > 10 ? rawCgpa / 9.5 : rawCgpa; // Standard conversion if entered as %
  const backlogs = input.activeBacklogs || 0;

  const results: CompanyTierEligibility[] = [];

  // 1. High-Growth Tech Startups & Open Source Driven Companies (Razorpay, Swiggy, Cred, Zerodha)
  results.push({
    tierName: 'Product Startups & Scaleups',
    eligible: true,
    status: 'fully_eligible',
    cutoffDescription: 'No strict graduation percentage cutoffs; evaluated primarily on live GitHub, projects, and machine coding rounds.',
    strategyGuidance: 'Over 32% of tier-1 startups do not enforce academic cutoffs. Focus on open-source contributions, distributed system briefs, and fast API development.',
  });

  // 2. Global Tech Giants & Tier-1 Product Companies (Google, Microsoft, Adobe, Uber)
  const isTier1Cgpa = cgpa10 >= 7.0 && tenth >= 60 && twelfth >= 60 && backlogs === 0;
  results.push({
    tierName: 'Tier-1 Product & Cloud MNCs',
    eligible: isTier1Cgpa,
    status: isTier1Cgpa ? 'fully_eligible' : cgpa10 >= 6.5 ? 'conditionally_eligible' : 'cutoff_disqualified',
    cutoffDescription: 'Typically 7.0+ CGPA (or 70%) with zero active backlogs at time of campus interview.',
    strategyGuidance: isTier1Cgpa
      ? 'Academics meet all campus shortlisting criteria. Primary discriminator is LeetCode Medium/Hard DSA and System Design.'
      : 'Off-campus referrals and open-source contribution bypass automated campus cutoff filters.',
  });

  // 3. Indian IT Service Giants (TCS, Infosys, Wipro, Cognizant, Accenture)
  const isServicesEligible = tenth >= 60 && twelfth >= 60 && (cgpa10 >= 6.0 || rawCgpa >= 60) && backlogs === 0;
  results.push({
    tierName: 'Mass Recruitment & IT Services',
    eligible: isServicesEligible,
    status: isServicesEligible ? 'fully_eligible' : 'cutoff_disqualified',
    cutoffDescription: 'Strict minimum 60% aggregate across 10th, 12th, and B.Tech with no active backlogs.',
    strategyGuidance: isServicesEligible
      ? 'Eligible for national qualifying tests (NQT). Prepare speed aptitude and core CS MCQ.'
      : 'Service giants strictly automate filtering at 60.0%. Target product startups and specialized boutiques where project proof takes precedence.',
  });

  return results;
}
