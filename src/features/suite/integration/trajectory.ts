// ============================================================
// HireFlow Suite — Career Trajectory Integration Engine (Stage 7.4)
// Bridges candidate scan / profile to the Career Path Hub,
// computes market tier positioning (Tier C -> B -> A -> S),
// identifies cross-tier gaps, and maps actionable bridge briefs.
// ============================================================

import { CandidateProfile, EvidenceLevel } from '../profile/types';
import marketTiersData from '../../../data/ats/market-tiers.json';

export interface CandidateTierStatus {
  currentTier: 'Tier C' | 'Tier B' | 'Tier A' | 'Tier S';
  currentTierDisplayName: string;
  nextTier: 'Tier B' | 'Tier A' | 'Tier S' | 'Peak';
  nextTierDisplayName: string;
  yearsExp: number;
  readinessScore: number; // 0-100 towards next tier
  tierGaps: string[];
  keyStrengths: string[];
  recommendedBriefIds: string[];
  summaryStatement: string;
}

const TIER_ORDER: Array<'Tier C' | 'Tier B' | 'Tier A' | 'Tier S'> = [
  'Tier C',
  'Tier B',
  'Tier A',
  'Tier S',
];

const TIER_NAMES: Record<string, string> = {
  'Tier S': 'Tier S — Elite Product & Quant (FAANG / High-Scale)',
  'Tier A': 'Tier A — Scale-Ups & Unicorns (Razorpay, Swiggy, CRED)',
  'Tier B': 'Tier B — Mid-Market & Growth Tech',
  'Tier C': 'Tier C — Early Career & IT Services',
  Peak: 'Principal & Distinguished Architecture Bar',
};

/**
 * Computes candidate market tier status and next tier promotion requirements
 */
export function getCandidateTierStatus(profile: CandidateProfile | null): CandidateTierStatus {
  if (!profile) {
    return {
      currentTier: 'Tier C',
      currentTierDisplayName: TIER_NAMES['Tier C'],
      nextTier: 'Tier B',
      nextTierDisplayName: TIER_NAMES['Tier B'],
      yearsExp: 0,
      readinessScore: 35,
      tierGaps: ['Data Structures & Algorithms', 'Unit Testing', 'Relational Databases (PostgreSQL)'],
      keyStrengths: [],
      recommendedBriefIds: ['brief-distributed-rate-limiter', 'brief-financial-ledger'],
      summaryStatement: 'Upload or scan your resume to evaluate market tier positioning and bridge promotion gaps.',
    };
  }

  const skills = profile.skills || [];
  const yearsExp = profile.yearsExperience || 0;
  const projects = profile.projects || [];

  // Skill analysis
  const skillNames = skills.map((s) => s.displayName.toLowerCase());
  const highEvidenceSkills = skills.filter((s) => s.evidenceLevel >= 3);
  const hasScaleMetrics = projects.some((p) => p.hasMetric);
  const hasRepoLinks = projects.some((p) => (p.links || []).length > 0);

  // Core domain flags
  const hasDistSystems = skillNames.some((s) =>
    ['kafka', 'redis', 'distributed systems', 'system design', 'cassandra', 'microservices'].includes(s)
  );
  const hasCloudDevOps = skillNames.some((s) =>
    ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform'].includes(s)
  );
  const hasStrongDSA = skillNames.some((s) =>
    ['dsa', 'data structures', 'algorithms', 'competitive programming', 'leetcode'].includes(s)
  );
  const hasCoreBackend = skillNames.some((s) =>
    ['java', 'go', 'golang', 'python', 'nodejs', 'node.js', 'c++'].includes(s)
  );

  // Deterministic Tier Classification
  let currentTier: 'Tier C' | 'Tier B' | 'Tier A' | 'Tier S' = 'Tier C';

  if (hasDistSystems && hasScaleMetrics && hasStrongDSA && highEvidenceSkills.length >= 4) {
    currentTier = 'Tier S';
  } else if ((hasDistSystems || hasCloudDevOps) && hasCoreBackend && (hasScaleMetrics || highEvidenceSkills.length >= 2)) {
    currentTier = 'Tier A';
  } else if (hasCoreBackend || skillNames.length >= 4) {
    currentTier = 'Tier B';
  } else {
    currentTier = 'Tier C';
  }

  // Next Tier calculation
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const nextTier = (currentIdx < TIER_ORDER.length - 1 ? TIER_ORDER[currentIdx + 1] : 'Peak') as
    | 'Tier B'
    | 'Tier A'
    | 'Tier S'
    | 'Peak';

  // Identify specific gaps for the next tier
  const tierGaps: string[] = [];
  const recommendedBriefIds: string[] = [];

  if (nextTier === 'Tier B') {
    if (!hasCoreBackend) tierGaps.push('Production Backend Language (Go / Java / Python)');
    if (!skillNames.includes('postgresql') && !skillNames.includes('sql'))
      tierGaps.push('Relational Database Schema Design (PostgreSQL / SQL)');
    if (!skillNames.includes('git')) tierGaps.push('Git Version Control & CI Workflow');
    recommendedBriefIds.push('brief-fullstack-crm', 'brief-financial-ledger');
  } else if (nextTier === 'Tier A') {
    if (!hasDistSystems) tierGaps.push('Distributed Caching & In-Memory Stores (Redis / Memcached)');
    if (!hasCloudDevOps) tierGaps.push('Containerization & Reproducible Environments (Docker)');
    if (!hasScaleMetrics) tierGaps.push('Verbatim Scale & Latency Metrics in Resume Bullets');
    recommendedBriefIds.push('brief-distributed-rate-limiter', 'brief-idempotent-payments');
  } else if (nextTier === 'Tier S') {
    if (!hasStrongDSA) tierGaps.push('Algorithmic Concurrency & Deep DSA Benchmarks');
    if (!skillNames.includes('kafka')) tierGaps.push('High-Throughput Event Streaming (Kafka / Partitioning)');
    if (!hasRepoLinks) tierGaps.push('Verifiable Open-Source or High-Coverage Repository Citations');
    recommendedBriefIds.push('brief-distributed-wal', 'brief-high-throughput-cdc');
  }

  if (tierGaps.length === 0) {
    tierGaps.push('Technical Leadership & Architectural Decision Records (ADRs)');
    recommendedBriefIds.push('brief-distributed-wal');
  }

  // Readiness calculation (0-100)
  const baseScore = currentIdx * 25 + 20;
  const gapPenalty = tierGaps.length * 10;
  const metricsBonus = hasScaleMetrics ? 15 : 0;
  const readinessScore = Math.max(15, Math.min(95, baseScore - gapPenalty + metricsBonus));

  const keyStrengths = highEvidenceSkills.map((s) => s.displayName).slice(0, 4);

  const summaryStatement =
    currentTier === 'Tier S'
      ? `Positioned at ${TIER_NAMES[currentTier]}. Target elite engineering staff bars by publishing benchmarks and architectural post-mortems.`
      : `Currently positioned at ${TIER_NAMES[currentTier]}. Crossing into ${TIER_NAMES[nextTier]} requires closing ${tierGaps.length} critical competency gaps.`;

  return {
    currentTier,
    currentTierDisplayName: TIER_NAMES[currentTier],
    nextTier,
    nextTierDisplayName: TIER_NAMES[nextTier],
    yearsExp,
    readinessScore,
    tierGaps,
    keyStrengths,
    recommendedBriefIds,
    summaryStatement,
  };
}
