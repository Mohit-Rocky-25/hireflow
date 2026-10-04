// ============================================================
// HireFlow ATS Engine — marketPositioning
// Pure TypeScript module to benchmark resume across market tiers
// ============================================================

import { MarketTierFit, ParsedJD, ParsedResume } from './types';
import marketTiersData from '../../data/ats/market-tiers.json';

export function marketPositioning(
  resume: ParsedResume,
  _jd: ParsedJD
): {
  bestFitTier: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
  tierFits: MarketTierFit[];
  topMissingSignals: string[];
} {
  const textLower = resume.rawText.toLowerCase();
  const resumeSkillsLower = new Set(resume.skillsExtracted.map((s) => s.toLowerCase()));

  const tierFits: MarketTierFit[] = [];

  for (const tierObj of marketTiersData) {
    const tierName = tierObj.tier as 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
    let signalsScore = 0;
    const presentSignals: string[] = [];
    const missingSignals: string[] = [];

    // Check minimum signals
    for (const sig of tierObj.minimumSignals) {
      const words = sig.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matches = words.filter((w) => textLower.includes(w)).length;
      if (matches >= 2 || textLower.includes(sig.toLowerCase().slice(0, 15))) {
        signalsScore += 15;
        presentSignals.push(sig);
      } else {
        missingSignals.push(sig);
      }
    }

    // Check strong signals
    for (const sig of tierObj.strongSignals) {
      const words = sig.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matches = words.filter((w) => textLower.includes(w)).length;
      if (matches >= 2) {
        signalsScore += 20;
        presentSignals.push(sig);
      } else {
        missingSignals.push(sig);
      }
    }

    // Check tier specific key skills
    if (tierName === 'Tier S') {
      const sSkills = ['distributed systems', 'system design', 'data structures & algorithms', 'kafka', 'c++', 'go', 'kubernetes'];
      const hitCount = sSkills.filter((s) => resumeSkillsLower.has(s) || textLower.includes(s)).length;
      signalsScore += hitCount * 6;

      // Scale metrics check
      const hasScaleMetrics = resume.bullets.some((b) => b.hasMetric && (b.rawText.includes('RPS') || b.rawText.includes('QPS') || b.rawText.includes('ms') || b.rawText.includes('%')));
      if (hasScaleMetrics) signalsScore += 15;
      else missingSignals.push('Demonstrated high-scale throughput (RPS, QPS) or latency (p99 ms) optimizations');
    } else if (tierName === 'Tier A') {
      const aSkills = ['react', 'node.js', 'typescript', 'postgresql', 'docker', 'ci/cd pipelines', 'aws'];
      const hitCount = aSkills.filter((s) => resumeSkillsLower.has(s) || textLower.includes(s)).length;
      signalsScore += hitCount * 6;

      const hasShippedProduction = resume.bullets.some((b) => b.hasActionVerb && b.hasOutcome);
      if (hasShippedProduction) signalsScore += 15;
      else missingSignals.push('End-to-end production feature delivery with measurable user or business metrics');
    } else if (tierName === 'Tier B') {
      const bSkills = ['java', 'spring boot', 'sql', 'unit testing', 'git', 'rest apis'];
      const hitCount = bSkills.filter((s) => resumeSkillsLower.has(s) || textLower.includes(s)).length;
      signalsScore += hitCount * 8;
    } else {
      // Tier C
      signalsScore = Math.min(100, signalsScore + 40); // Baseline qualification for IT services
    }

    // Check red flags penalty
    for (const rf of tierObj.redFlags) {
      if (tierName === 'Tier S' || tierName === 'Tier A') {
        const hasWeakBullets = resume.bullets.filter((b) => b.isJobDescriptionStyle).length > 2;
        if (hasWeakBullets) signalsScore -= 15;
      }
    }

    const finalScore = Math.max(10, Math.min(98, Math.round(signalsScore)));
    const fitLevel: 'Strong Fit' | 'Borderline Fit' | 'Gap' =
      finalScore >= 75 ? 'Strong Fit' : finalScore >= 50 ? 'Borderline Fit' : 'Gap';

    tierFits.push({
      tier: tierName,
      displayName: tierObj.displayName,
      score: finalScore,
      fitLevel,
      presentSignals: presentSignals.slice(0, 3),
      missingSignalsForNextTier: missingSignals.slice(0, 3),
    });
  }

  // Determine best fit tier
  // Prioritize higher tiers if score is >= 70, otherwise pick highest score
  let bestFitTier: 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C' = 'Tier C';
  const tierS = tierFits.find((t) => t.tier === 'Tier S')!;
  const tierA = tierFits.find((t) => t.tier === 'Tier A')!;
  const tierB = tierFits.find((t) => t.tier === 'Tier B')!;

  if (tierS.score >= 75) {
    bestFitTier = 'Tier S';
  } else if (tierA.score >= 68) {
    bestFitTier = 'Tier A';
  } else if (tierB.score >= 60) {
    bestFitTier = 'Tier B';
  } else {
    bestFitTier = 'Tier C';
  }

  // Find signals to reach next tier
  let topMissingSignals: string[] = [];
  if (bestFitTier === 'Tier S') {
    topMissingSignals = ['Maintain competitive programming ranking', 'Contribute to foundational open-source repositories'];
  } else if (bestFitTier === 'Tier A') {
    topMissingSignals = tierS.missingSignalsForNextTier;
  } else if (bestFitTier === 'Tier B') {
    topMissingSignals = tierA.missingSignalsForNextTier;
  } else {
    topMissingSignals = tierB.missingSignalsForNextTier;
  }

  return {
    bestFitTier,
    tierFits,
    topMissingSignals,
  };
}
