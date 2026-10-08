// ============================================================
// HireFlow Suite — Batch Readiness Engine (Stage 7.3)
// College Placement Cell cohort auditor:
// Analyzes batches of student resumes against target tech companies,
// computes multi-company readiness heatmap, ranks curriculum gaps,
// and enforces strict privacy anonymization by default.
// ============================================================

import { COMPANIES, COMPETENCY_SIGNALS } from '../../../pages/demo/talentLensData';

export type ReadinessTier = 'ready_now' | 'two_week_prep' | 'high_gap';

export interface CohortCandidate {
  id: string;
  name: string;
  branch: 'CSE' | 'IT' | 'ECE' | 'AI/DS' | 'Other';
  cgpa?: number;
  skills: string[];
  rawResumeSnippet?: string;
}

export interface CompanyReadinessScore {
  companyId: string;
  companyName: string;
  tier: string;
  score: number; // 0-100
  readinessTier: ReadinessTier;
  matchedCompetencies: string[];
  missingCompetencies: string[];
}

export interface CohortHeatmapRow {
  candidateId: string;
  candidateName: string; // "Candidate 001" if anonymized
  realName: string;
  branch: string;
  cgpa?: number;
  scores: Record<string, CompanyReadinessScore>; // keyed by companyId
  avgScore: number;
  readyNowCount: number;
}

export interface TopBatchGap {
  competency: string;
  displayName: string;
  missingCount: number;
  missingPercent: number; // 0-100
  recommendedWorkshop: string;
  impactedCompanies: string[];
}

export interface CompanyBatchSummary {
  companyId: string;
  companyName: string;
  tier: string;
  readyNowCount: number;
  prepNeededCount: number;
  highGapCount: number;
  readyNowPercent: number;
  averageScore: number;
}

export interface BatchAnalysisReport {
  totalCandidates: number;
  anonymized: boolean;
  targetCompanies: Array<{ id: string; name: string; tier: string; logo?: string }>;
  rows: CohortHeatmapRow[];
  topBatchGaps: TopBatchGap[];
  companySummaries: CompanyBatchSummary[];
  overallReadyNowCandidates: number;
  overallReadyNowPercent: number;
}

// 6 Benchmark Target Companies for Indian Tech Placement Cells
export const BENCHMARK_COMPANY_IDS = [
  'razorpay',
  'flipkart',
  'zomato',
  'swiggy',
  'phonepe',
  'cred',
];

/**
 * Normalizes and matches candidate skills against target role competencies.
 * Evaluates candidate against open software engineering roles at the company;
 * the best matching role determines the candidate's readiness score.
 */
function evaluateCandidateForCompany(
  candidateSkills: string[],
  companyId: string
): CompanyReadinessScore {
  const company = COMPANIES.find((c) => c.id === companyId) || COMPANIES[0];
  const allRoles = company.roles || [];

  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase().trim());

  let bestScore = 0;
  let bestMatched: string[] = [];
  let bestMissing: string[] = [];

  allRoles.forEach((role) => {
    const roleComps = role.competencies || [];
    if (roleComps.length === 0) return;

    const matched: string[] = [];
    const missing: string[] = [];

    roleComps.forEach((compKey) => {
      const signals = COMPETENCY_SIGNALS[compKey];
      const keywords = signals ? signals.keywords : [compKey];

      const hasMatch = normalizedCandidate.some((cSkill) =>
        keywords.some(
          (kw) => cSkill.includes(kw.toLowerCase()) || kw.toLowerCase().includes(cSkill)
        )
      );

      if (hasMatch) {
        matched.push(compKey);
      } else {
        missing.push(compKey);
      }
    });

    const roleScore = Math.round((matched.length / roleComps.length) * 100);
    if (roleScore >= bestScore) {
      bestScore = roleScore;
      bestMatched = matched;
      bestMissing = missing;
    }
  });

  const score = Math.max(0, Math.min(100, bestScore));

  let readinessTier: ReadinessTier = 'high_gap';
  if (score >= 75) {
    readinessTier = 'ready_now';
  } else if (score >= 60) {
    readinessTier = 'two_week_prep';
  }

  return {
    companyId: company.id,
    companyName: company.name,
    tier: company.tier || 'Tech Tier 1',
    score,
    readinessTier,
    matchedCompetencies: bestMatched,
    missingCompetencies: bestMissing,
  };
}

/**
 * Maps competency keys to readable workshop titles
 */
const WORKSHOP_MAPPINGS: Record<string, string> = {
  systemdesign: 'High-Concurrency System Design & Distributed Caching Boot Camp',
  dsa: 'Advanced Data Structures & Graph Algorithms Intensive',
  kubernetes: 'Docker Multi-Stage & Kubernetes Production Deployment Lab',
  kafka: 'Event Streaming with Apache Kafka & Asynchronous Ingestion',
  golang: 'Go Concurrency (Goroutines & Channels) Microservices Sprint',
  databases: 'Relational Indexing, Sharding & NoSQL Query Optimization',
  security: 'OWASP Top 10, JWT Security & Rate Limiting Workshop',
  aws: 'Cloud Architecture & AWS Serverless Best Practices',
  react: 'Production React 19, Server Components & State Architecture',
  nodejs: 'Event Loop Profiling & Fastify/NodeJS High-Throughput APIs',
};

/**
 * Deterministically analyzes a batch of candidates for placement readiness
 */
export function analyzeBatch(
  candidates: CohortCandidate[],
  anonymize: boolean = true,
  targetCompanyIds: string[] = BENCHMARK_COMPANY_IDS
): BatchAnalysisReport {
  const targetCompanies = targetCompanyIds
    .map((id) => COMPANIES.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({ id: c!.id, name: c!.name, tier: c!.tier, logo: c!.logo }));

  // Missing competency count across cohort (unique students missing per competency)
  const gapCounts: Record<string, { studentIds: Set<string>; companies: Set<string> }> = {};

  const rows: CohortHeatmapRow[] = candidates.map((cand, idx) => {
    const scores: Record<string, CompanyReadinessScore> = {};
    let totalScore = 0;
    let readyNowCount = 0;

    targetCompanies.forEach((comp) => {
      const res = evaluateCandidateForCompany(cand.skills, comp.id);
      scores[comp.id] = res;
      totalScore += res.score;
      if (res.readinessTier === 'ready_now') {
        readyNowCount++;
      }

      // Track missing competencies for cohort gaps
      res.missingCompetencies.forEach((missing) => {
        if (!gapCounts[missing]) {
          gapCounts[missing] = { studentIds: new Set(), companies: new Set() };
        }
        gapCounts[missing].studentIds.add(cand.id);
        gapCounts[missing].companies.add(comp.name);
      });
    });

    const avgScore = targetCompanies.length > 0 ? Math.round(totalScore / targetCompanies.length) : 0;
    const displayName = anonymize
      ? `Candidate ${String(idx + 1).padStart(3, '0')}`
      : cand.name;

    return {
      candidateId: cand.id,
      candidateName: displayName,
      realName: cand.name,
      branch: cand.branch,
      cgpa: cand.cgpa,
      scores,
      avgScore,
      readyNowCount,
    };
  });

  // Compile top batch gaps sorted descending
  const totalCands = candidates.length || 1;
  const topBatchGaps: TopBatchGap[] = Object.entries(gapCounts)
    .map(([compKey, info]) => {
      const missingCount = info.studentIds.size;
      const missingPercent = Math.round((missingCount / totalCands) * 100);
      return {
        competency: compKey,
        displayName: compKey.toUpperCase(),
        missingCount,
        missingPercent,
        recommendedWorkshop:
          WORKSHOP_MAPPINGS[compKey] ||
          `${compKey.toUpperCase()} Hands-on Engineering Workshop`,
        impactedCompanies: Array.from(info.companies),
      };
    })
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 8);

  // Compile per-company summaries
  const companySummaries: CompanyBatchSummary[] = targetCompanies.map((comp) => {
    let ready = 0;
    let prep = 0;
    let gap = 0;
    let sumScore = 0;

    rows.forEach((r) => {
      const scoreObj = r.scores[comp.id];
      if (scoreObj) {
        sumScore += scoreObj.score;
        if (scoreObj.readinessTier === 'ready_now') ready++;
        else if (scoreObj.readinessTier === 'two_week_prep') prep++;
        else gap++;
      }
    });

    const avg = rows.length > 0 ? Math.round(sumScore / rows.length) : 0;
    const readyPercent = Math.round((ready / totalCands) * 100);

    return {
      companyId: comp.id,
      companyName: comp.name,
      tier: comp.tier,
      readyNowCount: ready,
      prepNeededCount: prep,
      highGapCount: gap,
      readyNowPercent: readyPercent,
      averageScore: avg,
    };
  });

  // Overall candidates ready for at least 1 benchmark company
  const overallReady = rows.filter((r) => r.readyNowCount > 0).length;
  const overallReadyPercent = Math.round((overallReady / totalCands) * 100);

  return {
    totalCandidates: candidates.length,
    anonymized: anonymize,
    targetCompanies,
    rows,
    topBatchGaps,
    companySummaries,
    overallReadyNowCandidates: overallReady,
    overallReadyNowPercent: overallReadyPercent,
  };
}

/**
 * Generates a realistic, deterministic 20-candidate batch for college placement cells
 */
export function generateSampleCohort(count: number = 20): CohortCandidate[] {
  const firstNames = [
    'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Vikram',
    'Pooja', 'Aditya', 'Meera', 'Rahul', 'Divya',
    'Karan', 'Priyanka', 'Siddharth', 'Ishita', 'Arjun',
    'Neha', 'Varun', 'Tanvi', 'Abhishek', 'Rhea',
  ];
  const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair',
    'Iyer', 'Gupta', 'Singh', 'Chopra', 'Deshmukh',
    'Joshi', 'Menon', 'Kulkarni', 'Bhat', 'Rao',
    'Aggarwal', 'Mehta', 'Sengupta', 'Saxena', 'Kapoor',
  ];

  const branches: Array<'CSE' | 'IT' | 'ECE' | 'AI/DS'> = ['CSE', 'IT', 'ECE', 'AI/DS'];

  const skillPools = [
    // High-readiness candidate (DSA + System Design + Web + Cloud)
    ['Java', 'Spring Boot', 'DSA', 'SQL', 'System Design', 'Docker', 'AWS', 'Redis'],
    // Mid-readiness backend candidate
    ['Python', 'Django', 'PostgreSQL', 'DSA', 'Docker', 'REST API'],
    // Full-stack JavaScript
    ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Git'],
    // ECE / Embedded / Foundations
    ['C++', 'DSA', 'Linux', 'SQL', 'Computer Networks', 'Git'],
    // Data Science & ML
    ['Python', 'Pandas', 'NumPy', 'Scikit-Learn', 'SQL', 'FastAPI'],
    // Cloud / DevOps focus
    ['Go', 'Docker', 'Kubernetes', 'Linux', 'AWS', 'DSA'],
  ];

  const result: CohortCandidate[] = [];

  for (let i = 0; i < count; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[i % lastNames.length];
    const branch = branches[i % branches.length];
    // Deterministic CGPA between 7.4 and 9.6
    const cgpa = Number((7.4 + ((i * 7) % 23) * 0.1).toFixed(2));
    const skills = skillPools[i % skillPools.length];

    result.push({
      id: `stu-${i + 1}`,
      name: `${fName} ${lName}`,
      branch,
      cgpa,
      skills: [...skills],
    });
  }

  return result;
}

/**
 * Exports batch report as clean, deterministic CSV RFC 4180
 */
export function exportBatchReadinessCSV(report: BatchAnalysisReport): string {
  const companyHeaders = report.targetCompanies.map((c) => `"${c.name} (%)"`).join(',');
  const lines: string[] = [];

  lines.push(`"Candidate ID","Candidate Name","Branch","CGPA","Average Readiness (%)","Ready-Now Companies Count",${companyHeaders}`);

  report.rows.forEach((r) => {
    const nameField = `"${r.candidateName}"`;
    const compScores = report.targetCompanies
      .map((c) => r.scores[c.id]?.score ?? 0)
      .join(',');

    lines.push(
      `"${r.candidateId}",${nameField},"${r.branch}",${r.cgpa || 'N/A'},${r.avgScore},${r.readyNowCount},${compScores}`
    );
  });

  lines.push('');
  lines.push('"--- TOP CURRICULUM GAPS ACROSS BATCH ---"');
  lines.push('"Competency","Missing Student Count","Missing Percentage (%)","Recommended Action / Workshop"');

  report.topBatchGaps.forEach((g) => {
    lines.push(
      `"${g.displayName}",${g.missingCount},${g.missingPercent}%,"${g.recommendedWorkshop}"`
    );
  });

  return lines.join('\n');
}
