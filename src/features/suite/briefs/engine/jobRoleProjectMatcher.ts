// ============================================================
// HireFlow — Job Role Skill Blueprint & Project Brief Matcher Engine
// Multi-Option Project Matcher: Analyzes candidate verified skills
// against job description gap skills, and selects 3 to 4 distinct,
// high-yield project options where EACH option closes the candidate's
// skill gaps across diverse architectural tracks & tech stacks.
// Candidates can choose either option to build and solve their issues.
// ============================================================

import briefsData from '../../../../data/suite/project-briefs.json';
import skillsTaxonomyData from '../../../../data/ats/skills-taxonomy.json';
import { ProjectBrief, BriefDifficulty, getBriefHoursRange } from '../bundleBriefs';

export interface JobRoleSkillItem {
  name: string;
  isMandatory?: boolean;
  status: 'verified' | 'gap';
}

export interface MatchedBriefRecommendation {
  brief: ProjectBrief;
  matchedGapSkills: string[];
  reinforcedSkills: string[];
  relevanceScore: number;
  hoursRange: { min: number; max: number; label: string; assumption: string };
  interviewProofPoint: string;
  pathLabel?: string;
  pathFocus?: string;
  coverageRatio?: number;
}

export interface JobRoleProjectMatchResult {
  roleTitle: string;
  totalRequired: number;
  verifiedCount: number;
  gapCount: number;
  verifiedSkills: string[];
  gapSkills: string[];
  allGapSkillsCovered: boolean;
  coveredGapSkillsList: string[];
  uncoveredGapSkillsList: string[];
  recommendations: MatchedBriefRecommendation[];
}

export interface JobRoleSkillMatcherInput {
  skills: JobRoleSkillItem[];
  roleTitle?: string;
  maxRecommendations?: number;
}

const ALL_BRIEFS: ProjectBrief[] = briefsData as ProjectBrief[];

interface TaxonomyEntry {
  canonical: string;
  category: string;
  aliases: string[];
  related?: string[];
  weight: number;
  implies?: string[];
}

const TAXONOMY: TaxonomyEntry[] = skillsTaxonomyData as TaxonomyEntry[];

// Fast taxonomy lookup table (lowercase -> canonical)
const TAXONOMY_MAP = new Map<string, string>();
const TAXONOMY_SYNONYMS = new Map<string, Set<string>>();

for (const entry of TAXONOMY) {
  const canonLower = entry.canonical.toLowerCase();
  TAXONOMY_MAP.set(canonLower, entry.canonical);

  const synonyms = new Set<string>();
  synonyms.add(canonLower);

  if (entry.aliases) {
    for (const a of entry.aliases) {
      const aLower = a.toLowerCase();
      TAXONOMY_MAP.set(aLower, entry.canonical);
      synonyms.add(aLower);
    }
  }

  if (entry.related) {
    for (const r of entry.related) {
      synonyms.add(r.toLowerCase());
    }
  }

  TAXONOMY_SYNONYMS.set(entry.canonical, synonyms);
}

/**
 * Normalizes text for lenient stem matching (strips punct, lowercase, basic plural)
 */
function normalizeStem(s: string): string {
  let str = s.toLowerCase().replace(/[-_.\s/()\[\]]/g, '');
  if (str.endsWith('s') && !str.endsWith('ss') && !str.endsWith('is')) {
    str = str.slice(0, -1);
  }
  return str;
}

/**
 * Checks if a candidate skill matches a brief's skill set or tech stack.
 * Uses exact matching for short tokens (<= 3 chars) to avoid false positives.
 */
function isSkillMatchedInBrief(skillName: string, brief: ProjectBrief): boolean {
  const cleanSkill = skillName.trim();
  const normSkill = normalizeStem(cleanSkill);
  const canon = TAXONOMY_MAP.get(cleanSkill.toLowerCase()) || cleanSkill;
  const synonyms = TAXONOMY_SYNONYMS.get(canon);

  const allBriefTerms: string[] = [
    ...(brief.coveredSkills || []),
    ...(brief.techStack || []),
    brief.title || '',
  ];

  for (const term of allBriefTerms) {
    const normTerm = normalizeStem(term);
    // Exact stem match
    if (normTerm === normSkill) return true;

    // Substring match only for non-trivial terms (length > 3)
    if (normSkill.length > 3 && normTerm.length > 3) {
      if (normTerm.includes(normSkill) || normSkill.includes(normTerm)) {
        return true;
      }
    }

    // Synonym matches
    if (synonyms) {
      for (const syn of synonyms) {
        const normSyn = normalizeStem(syn);
        if (normTerm === normSyn) return true;
        if (normSyn.length > 3 && normTerm.length > 3) {
          if (normTerm.includes(normSyn) || normSyn.includes(normTerm)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Derives descriptive architectural track metadata for each option
 */
function derivePathMetadata(
  brief: ProjectBrief,
  index: number,
  matchedGaps: string[],
  totalGaps: number
): { pathLabel: string; pathFocus: string; coverageRatio: number } {
  const coverageRatio = totalGaps > 0 ? Number((matchedGaps.length / totalGaps).toFixed(2)) : 1;
  const dLower = (brief.domain || '').toLowerCase();
  const titleLower = (brief.title || '').toLowerCase();
  const stackLower = (brief.techStack || []).join(' ').toLowerCase();

  let trackName = 'Modern Enterprise Architecture Track';
  let trackFocus = 'Production-grade enterprise pattern with verifiable scale metrics.';

  if (
    dLower.includes('ml') ||
    dLower.includes('ai') ||
    dLower.includes('llm') ||
    dLower.includes('genai') ||
    titleLower.includes('agent') ||
    titleLower.includes('inference') ||
    stackLower.includes('fastapi') ||
    stackLower.includes('pytorch') ||
    stackLower.includes('lightgbm')
  ) {
    trackName = 'AI/ML Systems & Inference Pipeline Track';
    trackFocus = 'Vector search, streaming LLM workflows, feature stores & low-latency inference.';
  } else if (
    dLower.includes('fintech') ||
    titleLower.includes('ledger') ||
    titleLower.includes('reconciliation') ||
    titleLower.includes('payment') ||
    titleLower.includes('upi')
  ) {
    trackName = 'FinTech & High-Integrity Ledger Track';
    trackFocus = 'ACID transactions, double-entry consistency, idempotency & financial audit trails.';
  } else if (
    dLower.includes('data') ||
    dLower.includes('streaming') ||
    dLower.includes('analytics') ||
    titleLower.includes('lakehouse') ||
    titleLower.includes('etl') ||
    stackLower.includes('spark') ||
    stackLower.includes('clickhouse') ||
    stackLower.includes('timescale')
  ) {
    trackName = 'Real-Time Streaming & Data Platform Track';
    trackFocus = 'High-volume event streaming, outbox patterns, CDC pipelines & analytical indexing.';
  } else if (
    dLower.includes('security') ||
    dLower.includes('cryptography') ||
    dLower.includes('defense') ||
    titleLower.includes('vault') ||
    titleLower.includes('auth') ||
    titleLower.includes('rbac') ||
    stackLower.includes('oidc') ||
    stackLower.includes('mtls')
  ) {
    trackName = 'Applied Security & Zero-Trust Track';
    trackFocus = 'Cryptographic boundary protection, token authentication, mTLS & tamper-evident storage.';
  } else if (
    dLower.includes('cloud') ||
    dLower.includes('devops') ||
    dLower.includes('kubernetes') ||
    dLower.includes('containers') ||
    stackLower.includes('kubernetes') ||
    stackLower.includes('terraform')
  ) {
    trackName = 'Cloud-Native & Container Orchestration Track';
    trackFocus = 'Containerized microservices, declarative infra, observability & zero-downtime deployment.';
  } else if (
    dLower.includes('web') ||
    dLower.includes('full-stack') ||
    stackLower.includes('react') ||
    stackLower.includes('next') ||
    stackLower.includes('typescript')
  ) {
    trackName = 'Full-Stack Platform & Real-Time Web Track';
    trackFocus = 'Type-safe client-server contracts, WebSockets, reactive state & operational UX.';
  } else if (
    dLower.includes('distributed') ||
    dLower.includes('high-scale backend') ||
    dLower.includes('systems') ||
    stackLower.includes('raft') ||
    stackLower.includes('grpc') ||
    stackLower.includes('redis') ||
    stackLower.includes('kafka')
  ) {
    trackName = 'Distributed Systems & Concurrency Track';
    trackFocus = 'High-throughput concurrency, distributed caching, rate-limiting & low-latency execution.';
  }

  const pathLabel = `Option ${index + 1} · ${trackName}`;
  return { pathLabel, pathFocus: trackFocus, coverageRatio };
}

/**
 * Multi-Option Recommendation Engine:
 * Evaluates candidate skill gaps and verified skills against the 164-brief
 * library to provide 3 to 4 distinct, high-yield project options where
 * EACH option covers the candidate's skill gaps with different architectural
 * focuses and technology stacks, allowing the candidate to choose either of them.
 */
export function matchJobRoleToProjects(input: JobRoleSkillMatcherInput): JobRoleProjectMatchResult {
  const roleTitle = input.roleTitle?.trim() || 'Target Engineering Role';
  const maxRecs = Math.max(1, Math.min(input.maxRecommendations ?? 4, 6));

  const verifiedSkills: string[] = [];
  const gapSkills: string[] = [];
  const mandatoryGaps = new Set<string>();

  for (const item of input.skills) {
    const clean = item.name.trim();
    if (!clean) continue;
    if (item.status === 'verified') {
      if (!verifiedSkills.includes(clean)) verifiedSkills.push(clean);
    } else {
      if (!gapSkills.includes(clean)) {
        gapSkills.push(clean);
        if (item.isMandatory) mandatoryGaps.add(clean);
      }
    }
  }

  const totalRequired = verifiedSkills.length + gapSkills.length;
  const gapSkillsList = Array.from(new Set(gapSkills));
  const verifiedSkillsList = Array.from(new Set(verifiedSkills));
  const hasGaps = gapSkillsList.length > 0;

  // Identify candidate languages & ecosystems from verified skills
  const candidateLanguages = new Set<string>();
  const KNOWN_LANGUAGES = ['java', 'spring', 'go', 'golang', 'python', 'rust', 'c++', 'typescript', 'javascript', 'c#', '.net', 'node'];
  for (const vs of verifiedSkillsList) {
    const vsLower = vs.toLowerCase();
    for (const kl of KNOWN_LANGUAGES) {
      if (vsLower.includes(kl)) candidateLanguages.add(kl);
    }
  }

  // Pre-evaluate and score every brief in ALL_BRIEFS
  interface EvaluatedBrief {
    brief: ProjectBrief;
    matchedGaps: string[];
    reinforced: string[];
    score: number;
    domain: string;
    primaryStack: string;
    gapCoverageRatio: number;
  }

  const evaluated: EvaluatedBrief[] = [];

  for (const brief of ALL_BRIEFS) {
    const matchedGaps = hasGaps
      ? gapSkillsList.filter((g) => isSkillMatchedInBrief(g, brief))
      : [];

    const reinforced = verifiedSkillsList.filter((vs) =>
      isSkillMatchedInBrief(vs, brief)
    );

    // If candidate has gaps, prioritize briefs that cover AT LEAST ONE gap!
    if (hasGaps && matchedGaps.length === 0) {
      continue;
    }

    let score = 0;

    // A. Gap coverage weight (+35 per matched gap)
    score += matchedGaps.length * 35;

    // B. Mandatory gap bonus (+20 per mandatory gap)
    for (const g of matchedGaps) {
      if (mandatoryGaps.has(g)) score += 20;
    }

    // C. Coverage ratio bonus (boosts briefs covering larger fraction of candidate gaps)
    const gapCoverageRatio = hasGaps
      ? matchedGaps.length / gapSkillsList.length
      : 0;
    score += Math.round(gapCoverageRatio * 40);

    // D. Candidate tech stack affinity (+25 if aligns with candidate's verified languages)
    const briefFullText = [
      ...(brief.techStack || []),
      ...(brief.coveredSkills || []),
      brief.title,
    ].join(' ').toLowerCase();

    let hasLangAffinity = false;
    for (const lang of candidateLanguages) {
      if (briefFullText.includes(lang)) {
        hasLangAffinity = true;
        break;
      }
    }
    if (hasLangAffinity) score += 25;

    // E. Reinforced skills bonus
    score += Math.min(24, reinforced.length * 8);

    // F. Target role domain synergy
    const roleLower = roleTitle.toLowerCase();
    const domainLower = (brief.domain || '').toLowerCase();
    if (roleLower.includes('backend') && (domainLower.includes('backend') || domainLower.includes('distributed'))) score += 15;
    if (roleLower.includes('cloud') && (domainLower.includes('cloud') || domainLower.includes('devops'))) score += 15;
    if (roleLower.includes('data') && (domainLower.includes('data') || domainLower.includes('analytics'))) score += 15;
    if (roleLower.includes('security') && (domainLower.includes('security') || domainLower.includes('cryptography'))) score += 15;
    if (roleLower.includes('full') && (domainLower.includes('full') || domainLower.includes('web'))) score += 15;
    if (roleLower.includes('front') && (domainLower.includes('web') || domainLower.includes('ui'))) score += 15;

    // G. Realistic execution timeline (favor reasonable student scope)
    score += Math.max(0, Math.round((100 - Math.min(100, brief.estimatedHours)) * 0.1));

    const primaryStack = (brief.techStack || []).slice(0, 2).join(' ').toLowerCase();

    evaluated.push({
      brief,
      matchedGaps,
      reinforced,
      score,
      domain: brief.domain,
      primaryStack,
      gapCoverageRatio,
    });
  }

  // Sort by score descending
  evaluated.sort((a, b) => b.score - a.score);

  // Multi-option selection: pick 3 to 4 diverse, high-yield options that cover gaps
  const selected: EvaluatedBrief[] = [];
  const selectedIds = new Set<string>();
  const coveredGapsAcrossSelected = new Set<string>();

  // Pass 1: Pick the best overall gap-closing project as Option 1
  if (evaluated.length > 0) {
    const top = evaluated[0];
    selected.push(top);
    selectedIds.add(top.brief.id);
    for (const g of top.matchedGaps) coveredGapsAcrossSelected.add(g);
  }

  // Pass 2: Ensure any gaps not covered by Option 1 get covered by subsequent options
  if (hasGaps && coveredGapsAcrossSelected.size < gapSkillsList.length && selected.length < maxRecs) {
    for (const cand of evaluated) {
      if (selectedIds.has(cand.brief.id)) continue;
      const coversUncovered = cand.matchedGaps.some((g) => !coveredGapsAcrossSelected.has(g));
      if (coversUncovered) {
        selected.push(cand);
        selectedIds.add(cand.brief.id);
        for (const g of cand.matchedGaps) coveredGapsAcrossSelected.add(g);
        if (selected.length >= maxRecs) break;
      }
    }
  }

  // Pass 3: Fill remaining options with DIVERSE alternatives that also cover gaps
  // (different domains or different tech stacks so the candidate has genuine choices!)
  const chosenDomains = new Set<string>(selected.map((s) => s.domain));
  const chosenStacks = new Set<string>(selected.map((s) => s.primaryStack));

  for (const cand of evaluated) {
    if (selected.length >= maxRecs) break;
    if (selectedIds.has(cand.brief.id)) continue;

    const isNewDomain = !chosenDomains.has(cand.domain);
    const isNewStack = !chosenStacks.has(cand.primaryStack);

    if (isNewDomain || isNewStack) {
      selected.push(cand);
      selectedIds.add(cand.brief.id);
      chosenDomains.add(cand.domain);
      chosenStacks.add(cand.primaryStack);
      for (const g of cand.matchedGaps) coveredGapsAcrossSelected.add(g);
    }
  }

  // Pass 4: If still under maxRecs, fill from any remaining gap-covering briefs
  for (const cand of evaluated) {
    if (selected.length >= maxRecs) break;
    if (selectedIds.has(cand.brief.id)) continue;

    selected.push(cand);
    selectedIds.add(cand.brief.id);
    for (const g of cand.matchedGaps) coveredGapsAcrossSelected.add(g);
  }

  // Pass 5: If candidate had 0 gaps or library had zero matching briefs for rare gaps,
  // fill with role-aligned capstones
  if (selected.length < maxRecs) {
    const roleLower = roleTitle.toLowerCase();
    const backups = ALL_BRIEFS
      .filter((b) => !selectedIds.has(b.id))
      .map((b) => {
        let score = 0;
        const reinforced = verifiedSkillsList.filter((vs) => isSkillMatchedInBrief(vs, b));
        score += reinforced.length * 10;
        const dLower = (b.domain || '').toLowerCase();
        if (roleLower.includes('system') && dLower.includes('distributed')) score += 15;
        if (roleLower.includes('cloud') && dLower.includes('cloud')) score += 15;
        if (roleLower.includes('data') && dLower.includes('data')) score += 15;
        if (roleLower.includes('security') && dLower.includes('security')) score += 15;
        if (roleLower.includes('web') && dLower.includes('web')) score += 15;
        return { brief: b, reinforced, score };
      })
      .sort((a, b) => b.score - a.score);

    for (const b of backups) {
      if (selected.length >= maxRecs) break;
      selected.push({
        brief: b.brief,
        matchedGaps: [],
        reinforced: b.reinforced,
        score: b.score,
        domain: b.brief.domain,
        primaryStack: (b.brief.techStack || []).slice(0, 2).join(' ').toLowerCase(),
        gapCoverageRatio: 0,
      });
      selectedIds.add(b.brief.id);
    }
  }

  // Map to final recommendations with path labels & metadata
  const finalRecommendations: MatchedBriefRecommendation[] = selected.map((item, idx) => {
    const { pathLabel, pathFocus, coverageRatio } = derivePathMetadata(
      item.brief,
      idx,
      item.matchedGaps,
      gapSkillsList.length
    );

    return {
      brief: item.brief,
      matchedGapSkills: item.matchedGaps,
      reinforcedSkills: item.reinforced,
      relevanceScore: item.score,
      hoursRange: getBriefHoursRange(item.brief),
      interviewProofPoint:
        item.brief.recruiterSignal || item.brief.problemItSolves || item.brief.portfolioBulletFormula,
      pathLabel,
      pathFocus,
      coverageRatio,
    };
  });

  const coveredGaps = gapSkillsList.filter((g) => coveredGapsAcrossSelected.has(g));
  const uncoveredGaps = gapSkillsList.filter((g) => !coveredGapsAcrossSelected.has(g));

  return {
    roleTitle,
    totalRequired,
    verifiedCount: verifiedSkillsList.length,
    gapCount: gapSkillsList.length,
    verifiedSkills: verifiedSkillsList,
    gapSkills: gapSkillsList,
    allGapSkillsCovered: uncoveredGaps.length === 0,
    coveredGapSkillsList: coveredGaps,
    uncoveredGapSkillsList: uncoveredGaps,
    recommendations: finalRecommendations,
  };
}
