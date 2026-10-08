// ============================================================
// HireFlow Suite — Company vs Company Comparison Engine
// Decision Group: "What should I apply to?" (/tools/company-compare)
// Compares 2-3 target companies or roles: shared vs differentiators,
// prep overlap %, Dataset 4 tier rules, interview rounds, and profile fit.
// ============================================================

import { COMPANIES, Company, Role, COMPETENCY_SIGNALS } from '../../../pages/demo/talentLensData';
import marketTiersData from '../../../data/ats/market-tiers.json';
import { CandidateProfile } from '../profile/types';

export interface CompanySelection {
  companyId: string;
  roleTitle?: string;
}

export type MarketTierCode = 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';

export interface TierDetails {
  tier: MarketTierCode;
  displayName: string;
  description: string;
  minimumSignals: string[];
  strongSignals: string[];
  redFlags: string[];
  typicalScreeningCriteria: string[];
}

export interface CompanyComparisonTarget {
  company: Company;
  selectedRole?: Role;
  competencies: string[];
  marketTier: MarketTierCode;
  tierDetails: TierDetails;
  interviewRounds: string[];
  hiringBar: string;
}

export interface PrepOverlapPair {
  fromCompanyId: string;
  fromCompanyName: string;
  toCompanyId: string;
  toCompanyName: string;
  overlapPercentage: number; // |Skills(A) ∩ Skills(B)| / |Skills(B)| * 100
  sharedSkills: string[];
  missingSkills: string[];
}

export interface CompanyPriorityRecommendation {
  companyId: string;
  companyName: string;
  roleTitle: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  readinessTier: 'Ready to Apply' | 'Short Prep (1-2 weeks)' | 'Moderate Prep (1-2 months)' | 'Long Prep (3+ months)';
  verdict: string;
  priorityRank: number;
}

export interface PrioritizationAnalysis {
  hasProfile: boolean;
  recommendations: CompanyPriorityRecommendation[];
  topPickCompanyId: string;
  summaryRationale: string;
}

export interface CompanyComparisonResult {
  targets: CompanyComparisonTarget[];
  sharedCompetencies: string[];
  uniqueCompetencies: Record<string, string[]>;
  pairwiseOverlap: PrepOverlapPair[];
  averageOverlap: number;
  prioritization: PrioritizationAnalysis;
  freshnessNote: string;
}

const FRESHNESS_NOTE = 'Market data as of October 2026; verify current requirements on company career pages.';

export function mapCompanyToMarketTier(tier: string): MarketTierCode {
  switch (tier) {
    case 'FAANG':
      return 'Tier S';
    case 'Unicorn':
    case 'Startup':
      return 'Tier A';
    case 'MNC':
    case 'Enterprise':
      return 'Tier B';
    case 'IT Services':
      return 'Tier C';
    default:
      return 'Tier B';
  }
}

export function getTierDetails(marketTier: MarketTierCode): TierDetails {
  const match = marketTiersData.find((t) => t.tier === marketTier);
  if (match) {
    return {
      tier: marketTier,
      displayName: match.displayName,
      description: match.description,
      minimumSignals: match.minimumSignals,
      strongSignals: match.strongSignals,
      redFlags: match.redFlags,
      typicalScreeningCriteria: match.typicalScreeningCriteria,
    };
  }

  return {
    tier: marketTier,
    displayName: `${marketTier} Market Tier`,
    description: 'Standard product engineering environment.',
    minimumSignals: ['Core programming fundamentals', 'Problem solving'],
    strongSignals: ['Demonstrated project ownership', 'Production experience'],
    redFlags: ['Shallow keyword listing', 'No project depth'],
    typicalScreeningCriteria: ['Technical coding assessment', 'System architecture discussion'],
  };
}

export function getInterviewRounds(marketTier: MarketTierCode, _companyName: string): string[] {
  switch (marketTier) {
    case 'Tier S':
      return [
        '1. Online Assessment (DSA 2x Medium-Hard, 70m)',
        '2. Technical Phone Screen (DSA + CS Fundamentals, 45m)',
        '3. Virtual Onsite R1 (Data Structures & Algorithmic Optimization, 45m)',
        '4. Virtual Onsite R2 (Complex Algorithms & Concurrency, 45m)',
        '5. Virtual Onsite R3 (Distributed System Design & Latency SLAs, 60m)',
        '6. Behavioral Screen (Leadership Principles & Failure Post-Mortems, 45m)',
      ];
    case 'Tier A':
      return [
        '1. Take-Home Project / Online Machine Coding (2-4 hours)',
        '2. Live Pair Programming & Code Review (60m)',
        '3. Practical System Architecture (Microservices, Queues, Caching, 60m)',
        '4. Past Work & Technical Deep-Dive (45m)',
        '5. Culture Fit & Product Sense (Engineering Manager / Founder, 45m)',
      ];
    case 'Tier B':
      return [
        '1. Cognitive & Technical Assessment (MCQ + 2 Coding, 60m)',
        '2. Core Tech Stack Interview (Language Depth & OOP Design, 60m)',
        '3. System Design & Database Schema Modeling (60m)',
        '4. Hiring Manager & Domain Fit Round (45m)',
        '5. HR & Compensation Discussion (30m)',
      ];
    case 'Tier C':
      return [
        '1. National Qualifying Test / Online Assessment (90m)',
        '2. Technical Panel Interview (Core Languages & Final-year Projects, 45m)',
        '3. Business Communication & Client Readiness Assessment (30m)',
        '4. HR Round (30m)',
      ];
  }
}

export function getHiringBarSummary(marketTier: MarketTierCode): string {
  switch (marketTier) {
    case 'Tier S':
      return 'Ruthless Algorithmic Depth (Medium/Hard DP/Graphs 100% passes) + Distributed System Scale (QPS, Latency SLAs)';
    case 'Tier A':
      return 'High-Agency Feature Delivery (Production Code Quality + Async Queues/Caching) + Practical Tradeoffs';
    case 'Tier B':
      return 'Solid Software Engineering Fundamentals (Clean Architecture, Design Patterns, Enterprise Testing & CI/CD)';
    case 'Tier C':
      return 'Consistent Fundamentals (Data structures basics, OOP, database queries, and structured problem solving)';
  }
}

export function calculatePrepOverlap(skillsA: string[], skillsB: string[]): number {
  if (skillsB.length === 0) return 100;
  const setA = new Set(skillsA.map((s) => s.toLowerCase().trim()));
  const overlapCount = skillsB.filter((s) => setA.has(s.toLowerCase().trim())).length;
  return Math.round((overlapCount / skillsB.length) * 100);
}

function normalizeCandidateSkills(profile: CandidateProfile): Set<string> {
  const set = new Set<string>();
  for (const s of profile.skills) {
    set.add(s.canonicalId.toLowerCase().trim());
    set.add(s.displayName.toLowerCase().trim());
  }
  return set;
}

function checkCompetencyMatch(competency: string, candidateSkills: Set<string>): boolean {
  const compKey = competency.toLowerCase().trim();
  if (candidateSkills.has(compKey)) return true;

  const signals = COMPETENCY_SIGNALS[compKey];
  if (signals) {
    for (const kw of signals.keywords) {
      if (candidateSkills.has(kw.toLowerCase().trim())) {
        return true;
      }
    }
  }

  // Substring search on canonical skill keys
  for (const skill of candidateSkills) {
    if (skill.includes(compKey) || compKey.includes(skill)) {
      return true;
    }
  }

  return false;
}

export function compareCompanies(
  selections: CompanySelection[],
  profile?: CandidateProfile | null
): CompanyComparisonResult {
  if (!selections || selections.length < 2) {
    throw new Error('Comparison requires at least 2 company selections.');
  }

  const validSelections = selections.slice(0, 3);
  const targets: CompanyComparisonTarget[] = [];

  for (const sel of validSelections) {
    const company = COMPANIES.find((c) => c.id === sel.companyId);
    if (!company) {
      throw new Error(`Company not found with id: ${sel.companyId}`);
    }

    const selectedRole = sel.roleTitle
      ? company.roles.find((r) => r.title.toLowerCase() === sel.roleTitle?.toLowerCase()) || company.roles[0]
      : company.roles[0];

    // Collect competencies: use selected role's competencies or all if none
    const competencies = selectedRole ? [...selectedRole.competencies] : Array.from(new Set(company.roles.flatMap((r) => r.competencies)));
    const marketTier = mapCompanyToMarketTier(company.tier);
    const tierDetails = getTierDetails(marketTier);
    const interviewRounds = getInterviewRounds(marketTier, company.name);
    const hiringBar = getHiringBarSummary(marketTier);

    targets.push({
      company,
      selectedRole,
      competencies,
      marketTier,
      tierDetails,
      interviewRounds,
      hiringBar,
    });
  }

  // 1. Shared competencies across ALL selected targets
  const sharedCompetencies = targets[0].competencies.filter((comp) => {
    return targets.every((t) => t.competencies.includes(comp));
  });

  // 2. Unique competencies per company (not present in any other selected company)
  const uniqueCompetencies: Record<string, string[]> = {};
  for (let i = 0; i < targets.length; i++) {
    const current = targets[i];
    const otherCompetencies = new Set<string>();
    for (let j = 0; j < targets.length; j++) {
      if (i !== j) {
        targets[j].competencies.forEach((c) => otherCompetencies.add(c));
      }
    }
    uniqueCompetencies[current.company.id] = current.competencies.filter((c) => !otherCompetencies.has(c));
  }

  // 3. Pairwise prep overlap matrix
  const pairwiseOverlap: PrepOverlapPair[] = [];
  let totalOverlap = 0;
  let pairCount = 0;

  for (let i = 0; i < targets.length; i++) {
    for (let j = 0; j < targets.length; j++) {
      if (i !== j) {
        const fromT = targets[i];
        const toT = targets[j];
        const pct = calculatePrepOverlap(fromT.competencies, toT.competencies);
        const setFrom = new Set(fromT.competencies);
        const shared = toT.competencies.filter((c) => setFrom.has(c));
        const missing = toT.competencies.filter((c) => !setFrom.has(c));

        pairwiseOverlap.push({
          fromCompanyId: fromT.company.id,
          fromCompanyName: fromT.company.name,
          toCompanyId: toT.company.id,
          toCompanyName: toT.company.name,
          overlapPercentage: pct,
          sharedSkills: shared,
          missingSkills: missing,
        });

        totalOverlap += pct;
        pairCount++;
      }
    }
  }

  const averageOverlap = pairCount > 0 ? Math.round(totalOverlap / pairCount) : 0;

  // 4. Prioritization analysis based on candidate profile
  let prioritization: PrioritizationAnalysis;

  if (profile && profile.skills && profile.skills.length > 0) {
    const candidateSkills = normalizeCandidateSkills(profile);
    const recs: CompanyPriorityRecommendation[] = [];

    for (const t of targets) {
      const matched = t.competencies.filter((c) => checkCompetencyMatch(c, candidateSkills));
      const missing = t.competencies.filter((c) => !matched.includes(c));
      const matchScore = t.competencies.length > 0
        ? Math.round((matched.length / t.competencies.length) * 100)
        : 100;

      let readinessTier: CompanyPriorityRecommendation['readinessTier'];
      let verdict: string;

      if (matchScore >= 80) {
        readinessTier = 'Ready to Apply';
        verdict = `High alignment (${matchScore}%). Polish company-specific round expectations and apply immediately.`;
      } else if (matchScore >= 60) {
        readinessTier = 'Short Prep (1-2 weeks)';
        verdict = `Close match (${matchScore}%). Bridge ${missing.length} missing competency: ${missing.join(', ')} before applying.`;
      } else if (matchScore >= 40) {
        readinessTier = 'Moderate Prep (1-2 months)';
        verdict = `Foundational gaps (${matchScore}%). Requires structured practice in ${missing.slice(0, 2).join(', ')}.`;
      } else {
        readinessTier = 'Long Prep (3+ months)';
        verdict = `Significant gap (${matchScore}%). Build end-to-end evidence in ${missing.join(', ')} first.`;
      }

      recs.push({
        companyId: t.company.id,
        companyName: t.company.name,
        roleTitle: t.selectedRole?.title || 'Engineering',
        matchScore,
        matchedSkills: matched,
        missingSkills: missing,
        readinessTier,
        verdict,
        priorityRank: 0,
      });
    }

    // Sort by match score descending (highest match = priority 1)
    recs.sort((a, b) => b.matchScore - a.matchScore);
    recs.forEach((r, idx) => {
      r.priorityRank = idx + 1;
    });

    const top = recs[0];
    prioritization = {
      hasProfile: true,
      recommendations: recs,
      topPickCompanyId: top.companyId,
      summaryRationale: `Prioritize ${top.companyName} (${top.matchScore}% fit) as your primary application target. Then leverage the ${averageOverlap}% prep overlap to interview at ${recs.slice(1).map((r) => r.companyName).join(' and ')}.`,
    };
  } else {
    prioritization = {
      hasProfile: false,
      recommendations: [],
      topPickCompanyId: targets[0].company.id,
      summaryRationale: 'Load or build your Candidate Profile in the top bar to get personalized prioritization recommendations.',
    };
  }

  return {
    targets,
    sharedCompetencies,
    uniqueCompetencies,
    pairwiseOverlap,
    averageOverlap,
    prioritization,
    freshnessNote: FRESHNESS_NOTE,
  };
}
