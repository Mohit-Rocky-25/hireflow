// ============================================================
// HireFlow — TalentLens Report Integrity Validator (Stage 7 & Phase 3B)
// Pure validation module enforcing the integrity guarantees (Checks 1-25).
// Checks only, never mutates caller input.
// ============================================================

import briefsData from '../../../data/suite/project-briefs.json';
import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';
import { deriveBriefRealSkills, getCanonicalSkillName, MIN_PROJECT_RELEVANCE_THRESHOLD } from './projectMatcherIntegrity';
import { formatCompetencyName } from '../talentLensEngine';
import { classifySkillKind } from './skillStateEngine';
import { validateBriefConcepts, CONCEPT_DEFINITIONS } from './conceptTagValidator';
import {
  ALLOWED_CONNECTIVES,
  FORBIDDEN_ACTION_OUTCOME_WORDS,
  WEAK_OWNERSHIP_VERBS,
  FORBIDDEN_UPGRADE_VERBS,
  STRONG_VERBS,
} from './bulletRewriteEngine';

export type ReportViolationCheck =
  | 'consistency'
  | 'coverage'
  | 'relevance'
  | 'sources'
  | 'templates'
  | 'numbers'
  | 'dates'
  | 'anti-gaming'
  | 'evidence'
  | 'strengths'
  | 'parse'
  | 'not-assessed'
  | 'confidence'
  | 'stack-coverage'
  | 'score-path'
  | 'project-numbers'
  | 'vetted-concepts'
  | 'determinism'
  | 'before-substring'
  | 'no-new-digits'
  | 'allowed-words-or-slots'
  | 'ownership-guard'
  | 'slot-markers'
  | 'rewrite-determinism'
  | 'max-rewrites';

export interface ReportViolation {
  check: ReportViolationCheck;
  message: string;
  field?: string;
  value?: any;
}

export interface ValidatorCheckDefinition {
  number: number;
  id: ReportViolationCheck;
  name: string;
  assertion: string;
  provingTestFile: string;
  provingTestName: string;
  hasNegativeTest: boolean;
}

export const VALIDATOR_REGISTRY: ValidatorCheckDefinition[] = [
  {
    number: 1,
    id: 'consistency',
    name: 'State Consistency & Invariant Integrity',
    assertion: 'Status, score, and band must align; no not-found competency can be described as demonstrated.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 1: consistency (flags mismatch between score and band)',
    hasNegativeTest: true,
  },
  {
    number: 2,
    id: 'numbers',
    name: 'Score Bounds & Numerical Ranges',
    assertion: 'Scores and percentage numbers must fall within valid bounds [0, 100].',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 2: numbers (flags out-of-bounds scores)',
    hasNegativeTest: true,
  },
  {
    number: 3,
    id: 'relevance',
    name: 'Project Minimum Relevance Threshold',
    assertion: 'Every recommended project must meet minimum relevance threshold >= 0.20.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 3: relevance (flags project below 0.20 threshold)',
    hasNegativeTest: true,
  },
  {
    number: 4,
    id: 'sources',
    name: 'Grounded Sources & Citations',
    assertion: 'Every statistic must include source annotation, period, or estimate label.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 4: sources (flags ungrounded company statistics)',
    hasNegativeTest: true,
  },
  {
    number: 5,
    id: 'templates',
    name: 'Template Sanitization & Skill Kind Matching',
    assertion: 'No raw template syntax outside allowed blocks; soft skills must receive written artifact templates.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 5: templates (flags raw template syntax or soft skill deploying code)',
    hasNegativeTest: true,
  },
  {
    number: 6,
    id: 'confidence',
    name: 'Confidence Score Consistency',
    assertion: 'Confidence score must correspond to evidence depth and context score.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 6: confidence (flags absent skill with high confidence)',
    hasNegativeTest: true,
  },
  {
    number: 7,
    id: 'strengths',
    name: 'Strengths Evidence Grounding',
    assertion: 'Every highlighted strength must cite demonstrated skills with evidence quotes.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 7: strengths (flags ungrounded strength claims)',
    hasNegativeTest: true,
  },
  {
    number: 8,
    id: 'parse',
    name: 'Resume Parse Transparency & Verification',
    assertion: 'Parse block counts must match actual parsed content; thin parses flagged.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 8: parse (flags mismatched parse counts)',
    hasNegativeTest: true,
  },
  {
    number: 9,
    id: 'not-assessed',
    name: 'Not-Assessed Competencies Handling',
    assertion: 'Not-assessed skills must never be scored 0 or reported as absent.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 9: not-assessed (flags not-assessed skill scored 0)',
    hasNegativeTest: true,
  },
  {
    number: 10,
    id: 'dates',
    name: 'Temporal Consistency & Date Sanity',
    assertion: 'Work history dates and durations must be plausible and chronologically valid.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 10: dates (flags chronological impossibility)',
    hasNegativeTest: true,
  },
  {
    number: 11,
    id: 'anti-gaming',
    name: 'Anti-Gaming & Keyword Stuffing Detection',
    assertion: 'Competencies with raw keyword repetition without project context must be flagged.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 11: anti-gaming (flags uncontextualized keyword stuffing)',
    hasNegativeTest: true,
  },
  {
    number: 12,
    id: 'evidence',
    name: 'Evidence Uniqueness & Non-Contradiction',
    assertion: 'No single evidence quote may serve as primary proof for multiple competencies.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 12: evidence (flags evidence quote reused across skills)',
    hasNegativeTest: true,
  },
  {
    number: 13,
    id: 'stack-coverage',
    name: 'Project Tech Stack Grounding',
    assertion: 'Project covered skills must strictly be a subset of verified techStack or vetted concepts.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 13: stack-coverage (flags fabricated tech skill)',
    hasNegativeTest: true,
  },
  {
    number: 14,
    id: 'coverage',
    name: 'Candidate Gap Coverage Integrity',
    assertion: 'Recommended projects must close verified candidate gaps, never non-gaps.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 14: coverage (flags project closes skill not in candidate gaps)',
    hasNegativeTest: true,
  },
  {
    number: 15,
    id: 'score-path',
    name: 'Score Path Reproducibility & Monotonicity',
    assertion: 'Cumulative score path gains must be strictly monotonic, reproducible by re-scoring, and sum <= 100.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 15: score-path (flags non-monotonic progression)',
    hasNegativeTest: true,
  },
  {
    number: 16,
    id: 'project-numbers',
    name: 'Project Numbers & Plausible Hours',
    assertion: 'Project estimated hours must fall in [1, 200] and hoursDisplay must match.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 16: project-numbers (flags implausible project hours)',
    hasNegativeTest: true,
  },
  {
    number: 17,
    id: 'vetted-concepts',
    name: 'Vetted Concept Tags Grounding',
    assertion: 'All claimed concept tags must have backing textual evidence in the brief.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 17: vetted-concepts (flags ungrounded concept tag)',
    hasNegativeTest: true,
  },
  {
    number: 18,
    id: 'determinism',
    name: 'Order-Independence & Determinism',
    assertion: 'Engine execution and evidence assignment must be order-independent and deterministic with zero NaN.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 18: determinism (flags NaN or non-finite score)',
    hasNegativeTest: true,
  },
  {
    number: 19,
    id: 'before-substring',
    name: 'Before-Substring Verbatim Integrity',
    assertion: 'Original bullet in every rewrite must be an exact verbatim substring of the candidate resume.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 19: before-substring (flags rewrite of non-existent bullet)',
    hasNegativeTest: true,
  },
  {
    number: 20,
    id: 'no-new-digits',
    name: 'Zero New Digits or Quantified Numbers',
    assertion: 'Rewritten bullets must never introduce new digits or number words not in the source bullet.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 20: no-new-digits (flags rewrite introducing new numbers or number words)',
    hasNegativeTest: true,
  },
  {
    number: 21,
    id: 'allowed-words-or-slots',
    name: 'Allowed Words, Syntactic Connectives or Slots',
    assertion: 'All content words in rewritten bullets must exist in source or neutral connectives list; zero introduced action/outcome words.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 21: allowed-words-or-slots (flags forbidden action/outcome words)',
    hasNegativeTest: true,
  },
  {
    number: 22,
    id: 'ownership-guard',
    name: 'Weak Verb Ownership Guard',
    assertion: 'Weak ownership verbs must never be upgraded to strong action verbs without an explicit bracketed slot.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 22: ownership-guard (flags weak verb upgraded without slot)',
    hasNegativeTest: true,
  },
  {
    number: 23,
    id: 'slot-markers',
    name: 'Slots Only Inside Rewrite and Fill-in Blocks',
    assertion: 'Slot markers must use valid [add: ...] or [fill-in: ...] syntax and only appear inside rewrite/fill-in blocks.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 23: slot-markers (flags malformed slot syntax)',
    hasNegativeTest: true,
  },
  {
    number: 24,
    id: 'rewrite-determinism',
    name: 'Rewrite Determinism & Unique Identifiers',
    assertion: 'Bullet rewrite IDs must be unique and generate deterministically across repeated runs.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 24: rewrite-determinism (flags duplicate rewrite IDs)',
    hasNegativeTest: true,
  },
  {
    number: 25,
    id: 'max-rewrites',
    name: 'At Most 5 Rewrites Enforcement',
    assertion: 'A report must contain at most 5 bullet rewrites to preserve candidate authenticity.',
    provingTestFile: 'tests/talentlens/validatorHygiene.test.ts',
    provingTestName: 'Negative Check 25: max-rewrites (flags more than 5 rewrites in report)',
    hasNegativeTest: true,
  },
];

export interface ValidateReportResult {
  isValid: boolean;
  violations: ReportViolation[];
  sanitizedReport: any;
}

const ALL_BRIEFS: ProjectBrief[] = briefsData as ProjectBrief[];
const BRIEFS_MAP = new Map<string, ProjectBrief>(
  ALL_BRIEFS.map((b) => [b.id, b])
);
// Also map by normalized title
for (const b of ALL_BRIEFS) {
  BRIEFS_MAP.set(b.title.toLowerCase().trim(), b);
}

/**
 * Pure function: converts raw double-brace placeholders {{...}} into visible [...] brackets
 * during report assembly. Keeps caller objects immutable and never mutates in validateReport.
 */
export function sanitizeReportPlaceholders<T>(report: T): T {
  if (!report || typeof report !== 'object') return report;
  const clone = JSON.parse(JSON.stringify(report));
  const sanitizeString = (str: string) => str.replace(/{{\s*([\w\s/-]+)\s*}}/g, '[$1]');

  const sanitizeObj = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObj(obj[key]);
      }
    }
  };

  sanitizeObj(clone);
  return clone;
}

/**
 * Validates a generated TalentLens report or DossierModel against Checks 1 through 25.
 * Strictly pure: does not mutate the passed report object.
 */
export function validateReport(report: any): ValidateReportResult {
  const violations: ReportViolation[] = [];
  const isDevOrTest = process.env.NODE_ENV !== 'production';

  const r = report || {};

  // Resolve breakdown / skills
  const breakdown: any[] = r.breakdown || r.result?.breakdown || [];
  const marketIntel = r.talentLensIntel || r.marketIntel || r.result?.marketIntel;
  const plans: any[] = r.learningPath?.plans || r.learningPlans || r.plans || r.result?.plans || [];
  const projectDrops: any[] = r.projectDrops || [];
  const companyContext = r.companyContext;

  // ─────────────────────────────────────────────────────────────
  // CHECK 1: Consistency (no not-found skill described as present)
  // ─────────────────────────────────────────────────────────────
  const notFoundSkills = new Set<string>();
  for (const b of breakdown) {
    const key = (b.key || b.competency || '').toLowerCase().trim();
    const status = b.status || b.analysis?.status;
    if (status === 'not-found' || status === 'absent' || b.score === 0) {
      notFoundSkills.add(key);
      if (b.competency) notFoundSkills.add(b.competency.toLowerCase().trim());
      if (b.label) notFoundSkills.add(b.label.toLowerCase().trim());
    }
  }

  if (marketIntel?.findings) {
    for (const f of marketIntel.findings) {
      const cat = (f.category || '').toLowerCase().trim();
      if (notFoundSkills.has(cat)) {
        if (/signals are present/i.test(f.finding)) {
          violations.push({
            check: 'consistency',
            message: `Not-found skill ${f.category} is falsely described as having signals present in market intel.`,
            field: 'marketIntel.findings',
            value: f.finding,
          });
        }
        if (Array.isArray(f.evidence) && f.evidence.length > 0) {
          violations.push({
            check: 'consistency',
            message: `Not-found skill ${f.category} contains non-empty evidence array.`,
            field: 'marketIntel.findings.evidence',
            value: f.evidence,
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 2 & 14: Stack Coverage (project's covered skills are subset of techStack only)
  // ─────────────────────────────────────────────────────────────
  for (const p of projectDrops) {
    const brief = BRIEFS_MAP.get(p.id) || BRIEFS_MAP.get((p.title || '').toLowerCase().trim());
    if (brief) {
      const realSkills = deriveBriefRealSkills(brief).map((s) => s.toLowerCase());
      for (const cov of p.coveredSkills || []) {
        const covLower = cov.toLowerCase();
        const inReal = realSkills.some((rs) => rs.includes(covLower) || covLower.includes(rs));
        const kind = classifySkillKind(cov);
        if (!inReal && kind !== 'concept') {
          violations.push({
            check: 'stack-coverage',
            message: `Project "${p.title}" claims to cover "${cov}" which is absent from its real stack.`,
            field: 'projectDrops.coveredSkills',
            value: cov,
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 3: Relevance (every shown project meets threshold)
  // ─────────────────────────────────────────────────────────────
  for (const p of projectDrops) {
    if (p.relevanceScore != null && p.relevanceScore < MIN_PROJECT_RELEVANCE_THRESHOLD) {
      violations.push({
        check: 'relevance',
        message: `Project "${p.title}" relevance ${p.relevanceScore} falls below minimum threshold ${MIN_PROJECT_RELEVANCE_THRESHOLD}.`,
        field: 'projectDrops.relevanceScore',
        value: p.relevanceScore,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 14: Coverage (Project closes must be active candidate gaps)
  // ─────────────────────────────────────────────────────────────
  const candidateGaps = new Set<string>();
  for (const b of breakdown) {
    const status = b.status || b.analysis?.status;
    if (status === 'absent' || status === 'not-found' || status === 'working' || status === 'mentioned') {
      if (b.key) candidateGaps.add(b.key.toLowerCase().trim());
      if (b.competency) candidateGaps.add(b.competency.toLowerCase().trim());
      if (b.label) candidateGaps.add(b.label.toLowerCase().trim());
      const fmt = formatCompetencyName(b.key || b.competency || '');
      if (fmt) candidateGaps.add(fmt.toLowerCase().trim());
    }
  }

  for (const p of projectDrops) {
    for (const c of p.closes || []) {
      const cLower = c.toLowerCase().trim();
      const isGap = Array.from(candidateGaps).some((g) => {
        if (!g) return false;
        if (g === cLower || g.includes(cLower) || cLower.includes(g)) return true;
        const fmtG = formatCompetencyName(g).toLowerCase().trim();
        return fmtG === cLower || fmtG.includes(cLower) || cLower.includes(fmtG);
      });
      if (!isGap && candidateGaps.size > 0) {
        violations.push({
          check: 'coverage',
          message: `Project "${p.title}" claims to close "${c}" which is not an active skill gap for this candidate.`,
          field: 'projectDrops.closes',
          value: c,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 4: Sources (every stat has source+period or estimate)
  // ─────────────────────────────────────────────────────────────
  if (companyContext) {
    const statFields: (keyof typeof companyContext)[] = ['hires2024', 'openRoles', 'avgPackage', 'glassdoor'];
    for (const sf of statFields) {
      const fieldName = String(sf);
      const val = companyContext[sf];
      if (val && typeof val === 'string') {
        const hasProvenance =
          /estimate|unverified|ai-extracted|\d{4}-\d{2}|public/i.test(val) ||
          /not available|market competitive/i.test(val);
        const hasFalseVerified = /verified/i.test(val) && !/unverified/i.test(val);
        if (hasFalseVerified) {
          violations.push({
            check: 'sources',
            message: `Stat "${fieldName}" claims ungrounded "verified" status without backing verification flag.`,
            field: `companyContext.${fieldName}`,
            value: val,
          });
        } else if (!hasProvenance) {
          violations.push({
            check: 'sources',
            message: `Company statistic "${fieldName}" is missing source, period or estimate annotation.`,
            field: `companyContext.${fieldName}`,
            value: val,
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 5: Templates (no raw {{}} outside block, no kind mismatch)
  // ─────────────────────────────────────────────────────────────
  for (const plan of plans) {
    // Check for raw double curly braces {{...}}
    const hasRawDoubleBraces =
      /{{\s*[\w\s/-]+\s*}}/.test(plan.bulletTemplate || '') ||
      /{{\s*[\w\s/-]+\s*}}/.test(plan.detail || '') ||
      /{{\s*[\w\s/-]+\s*}}/.test(plan.suggestedAction || '');

    if (hasRawDoubleBraces) {
      violations.push({
        check: 'templates',
        message: `Plan "${plan.title}" contains unreplaced raw double-brace placeholder.`,
        field: 'plans.bulletTemplate',
        value: plan.bulletTemplate,
      });
    }

    // Check skill kind template mismatch (soft skill deploying code project)
    const titleLower = (plan.title || '').toLowerCase();
    const actionLower = (plan.suggestedAction || '').toLowerCase();
    const isSoftSkillPlan = /communication|leadership|collaboration|teamwork/.test(titleLower);

    if (isSoftSkillPlan && /deploy an open-source project.*automated tests/i.test(actionLower)) {
      violations.push({
        check: 'templates',
        message: `Soft skill plan "${plan.title}" uses mismatched technical deployment action template.`,
        field: 'plans.suggestedAction',
        value: plan.suggestedAction,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 6: Numbers (no duplicated gain ranges, cumulative <= 100)
  // ─────────────────────────────────────────────────────────────
  const seenGainRanges = new Set<string>();
  for (const plan of plans) {
    const gainStr = plan.hypotheticalScoreGain;
    if (gainStr && typeof gainStr === 'string' && plan.priority === 'critical' && gainStr !== 'not scored' && /\+\d+/.test(gainStr)) {
      if (seenGainRanges.has(gainStr)) {
        violations.push({
          check: 'numbers',
          message: `Duplicated hypothetical score gain range "${gainStr}" detected in critical actions without cumulative progression.`,
          field: 'plans.hypotheticalScoreGain',
          value: gainStr,
        });
      } else {
        seenGainRanges.add(gainStr);
      }

      // Check cumulative path upper bound
      const matchPath = gainStr.match(/->\s*(\d+)/);
      if (matchPath) {
        const projectedScore = parseInt(matchPath[1], 10);
        if (projectedScore > 100) {
          violations.push({
            check: 'numbers',
            message: `Cumulative score projection ${projectedScore} exceeds maximum 100.`,
            field: 'plans.hypotheticalScoreGain',
            value: projectedScore,
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 7: Dates (valid ISO format, not in future)
  // ─────────────────────────────────────────────────────────────
  const nowIso = new Date().toISOString().slice(0, 10);
  const dateCandidates = [
    r.asOfDate,
    r.generatedAt,
    r.overall?.baselineDate,
  ].filter(Boolean);

  for (const d of dateCandidates) {
    if (typeof d === 'string' && d.length >= 10) {
      const iso = d.slice(0, 10);
      if (iso > nowIso) {
        violations.push({
          check: 'dates',
          message: `Report contains future-dated timestamp: ${iso} (current date is ${nowIso}).`,
          field: 'date',
          value: iso,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 8: Anti-Gaming Flag (must flag raw skill list mentions)
  // ─────────────────────────────────────────────────────────────
  for (const b of breakdown) {
    if (b.analysis?.antiGamingFlag) {
      const ev = b.analysis.evidence || [];
      const hasDetailedContext = ev.some((e: string) => e.length > 50 && /deployed|engineered|reduced|scaled/i.test(e));
      if (hasDetailedContext) {
        violations.push({
          check: 'anti-gaming',
          message: `Anti-gaming flag falsely triggered for competency "${b.competency || b.key}" with detailed contextual evidence.`,
          field: 'breakdown.antiGamingFlag',
          value: b.competency,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 9: Evidence Audit (every quote must be grounded in resume)
  // ─────────────────────────────────────────────────────────────
  const candidateResume =
    r.appendix?.resumeText ||
    r.resumeText ||
    r.context?.rawResumeText ||
    r.result?.trace?.resumeText ||
    '';

  if (candidateResume && candidateResume.length > 0) {
    const resumeNorm = candidateResume.toLowerCase();
    for (const b of breakdown) {
      const quotes = b.evidenceQuotes || b.analysis?.evidence || [];
      for (const q of quotes) {
        if (typeof q === 'string' && q.length > 15) {
          const qNorm = q.toLowerCase().replace(/^[*\-•▪●\d.]+\s*/, '').trim();
          if (qNorm.length > 15 && !resumeNorm.includes(qNorm)) {
            const shortQ = qNorm.slice(0, 20);
            if (!resumeNorm.includes(shortQ)) {
              violations.push({
                check: 'evidence',
                message: `Evidence quote "${q}" for "${b.competency || b.key}" not found in resume text.`,
                field: 'breakdown.evidenceQuotes',
                value: q,
              });
            }
          }
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 10: Verified Strengths (only strong skills with quotes)
  // ─────────────────────────────────────────────────────────────
  const verifiedStrengths = r.verifiedStrengths || [];
  for (const vs of verifiedStrengths) {
    if (!vs.evidenceText || vs.evidenceText.trim() === '') {
      violations.push({
        check: 'strengths',
        message: `Verified strength "${vs.label}" lacks quote text.`,
        field: 'verifiedStrengths.evidenceText',
        value: vs.evidenceText,
      });
    }
    const matchingComps = vs.skill
      ? breakdown.filter((b) => (b.key || b.competency || '').toLowerCase() === vs.skill.toLowerCase())
      : [];
    const candidates = matchingComps.length > 0
      ? matchingComps
      : breakdown.filter(
          (b) =>
            (b.label || '').toLowerCase() === vs.label.toLowerCase() ||
            (b.key || b.competency || '').toLowerCase() === vs.label.toLowerCase()
        );
    if (candidates.length > 0) {
      const hasStrong = candidates.some((b) => {
        const st = b.status || b.analysis?.status;
        return st === 'strong' || st === 'expert' || st === 'demonstrated';
      });
      if (!hasStrong) {
        const status = candidates[0].status || candidates[0].analysis?.status;
        violations.push({
          check: 'strengths',
          message: `Skill "${vs.label}" promoted to Verified Strength but has non-strong status "${status}".`,
          field: 'verifiedStrengths',
          value: status,
        });
      }
    }
  }

  // Also check raw strengths array if present
  if (Array.isArray(r.strengths)) {
    for (const str of r.strengths) {
      const rawStrName = typeof str === 'string' ? str : str?.skill || str?.name || '';
      const strName = rawStrName.includes(':') ? rawStrName.split(':')[0].trim() : rawStrName;
      const matchingComps = breakdown.filter(
        (b) =>
          (b.key || b.competency || '').toLowerCase() === strName.toLowerCase() ||
          (b.label || '').toLowerCase() === strName.toLowerCase()
      );
      if (matchingComps.length > 0) {
        const hasStrong = matchingComps.some((b) => {
          const st = b.status || b.analysis?.status;
          return st === 'strong' || st === 'expert' || st === 'demonstrated';
        });
        if (!hasStrong) {
          const status = matchingComps[0].status || matchingComps[0].analysis?.status;
          violations.push({
            check: 'strengths',
            message: `Skill "${strName}" claimed in strengths list has non-demonstrated status "${status}".`,
            field: 'strengths',
            value: status,
          });
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 11: Parse Summary (honest, zero hallucinated fields)
  // ─────────────────────────────────────────────────────────────
  const parseSummary = r.parseSummary;
  if (parseSummary) {
    if (parseSummary.name && /undefined|null|unknown candidate/i.test(parseSummary.name)) {
      violations.push({
        check: 'parse',
        message: `Candidate name in parse summary is placeholder "${parseSummary.name}".`,
        field: 'parseSummary.name',
        value: parseSummary.name,
      });
    }
    if (parseSummary.email && !parseSummary.email.includes('@')) {
      violations.push({
        check: 'parse',
        message: `Candidate email "${parseSummary.email}" is invalid.`,
        field: 'parseSummary.email',
        value: parseSummary.email,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 12: Not-Assessed Status Consistency
  // ─────────────────────────────────────────────────────────────
  for (const b of breakdown) {
    const status = b.status || b.analysis?.status;
    const statusLabel = b.statusLabel;
    const compKey = (b.key || b.competency || '').toLowerCase().trim();

    if (status === 'not-assessed' && statusLabel !== 'Not assessed') {
      violations.push({
        check: 'not-assessed',
        message: `Skill "${b.key || b.competency}" marked not-assessed must display label "Not assessed" (got "${statusLabel}").`,
        field: 'breakdown.statusLabel',
        value: statusLabel,
      });
    }

    // Soft skills must be marked not-assessed without code claims
    if (classifySkillKind(compKey) === 'soft-skill' && (status === 'demonstrated' || status === 'expert')) {
      violations.push({
        check: 'not-assessed',
        message: `Soft skill "${b.key || b.competency}" must be marked not-assessed (got "${status}").`,
        field: 'breakdown.status',
        value: status,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 13: Confidence Tag Consistency
  // ─────────────────────────────────────────────────────────────
  for (const b of breakdown) {
    const status = b.status || b.analysis?.status;
    const tag = b.confidenceTag;
    if (tag) {
      if (!['High', 'Medium', 'Low'].includes(tag)) {
        violations.push({
          check: 'confidence',
          message: `Competency "${b.key || b.competency}" has invalid confidence tag "${tag}". Must be High, Medium, or Low.`,
          field: 'breakdown.confidenceTag',
          value: tag,
        });
      } else if (status === 'strong' && tag === 'Low') {
        violations.push({
          check: 'confidence',
          message: `Strong competency "${b.key || b.competency}" has inconsistent confidence tag "Low".`,
          field: 'breakdown.confidenceTag',
          value: tag,
        });
      } else if ((status === 'mentioned' || status === 'not-found' || status === 'not-assessed' || status === 'absent') && tag === 'High') {
        violations.push({
          check: 'confidence',
          message: `Undemonstrated skill "${b.key || b.competency}" (${status}) has inconsistent confidence tag "High".`,
          field: 'breakdown.confidenceTag',
          value: tag,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 15: Score Path Reproducibility & Monotonicity
  // ─────────────────────────────────────────────────────────────
  for (const plan of plans) {
    const gainStr = plan.hypotheticalScoreGain;
    if (gainStr && typeof gainStr === 'string') {
      const titleLower = (plan.title || '').toLowerCase();
      const isSoftSkill =
        (/communication|leadership|collaboration|teamwork/i.test(titleLower) &&
          !/protocol|acme|tls|daemon|engine|service|pipeline|cluster|database|cache/i.test(titleLower)) ||
        (!/^build\s+/i.test(titleLower) && classifySkillKind(titleLower) === 'soft-skill');

      if (isSoftSkill) {
        if (!/not scored/i.test(gainStr)) {
          violations.push({
            check: 'score-path',
            message: `Soft skill action "${plan.title}" must have gain "not scored" and add 0 pts.`,
            field: 'plans.hypotheticalScoreGain',
            value: gainStr,
          });
        }
      } else {
        // Enforce score path purity: un-rescored actions or hardcoded ranges without cumulative path
        if (/\+\d+\s*to\s*\+\d+/i.test(gainStr) && !/Cumulative path/i.test(gainStr)) {
          violations.push({
            check: 'score-path',
            message: `Action "${plan.title}" contains hardcoded range gain "${gainStr}" without cumulative progression path.`,
            field: 'plans.hypotheticalScoreGain',
            value: gainStr,
          });
        }

        const matchPath = gainStr.match(/Cumulative path:\s*(\d+)\s*->\s*(\d+)/i);
        if (matchPath) {
          const fromScore = parseInt(matchPath[1], 10);
          const toScore = parseInt(matchPath[2], 10);
          if (toScore < fromScore) {
            violations.push({
              check: 'score-path',
              message: `Non-monotonic score path progression (${fromScore} -> ${toScore}) in action "${plan.title}".`,
              field: 'plans.hypotheticalScoreGain',
              value: gainStr,
            });
          }
          if (toScore > 100) {
            violations.push({
              check: 'score-path',
              message: `Cumulative score projection ${toScore} exceeds 100.`,
              field: 'plans.hypotheticalScoreGain',
              value: toScore,
            });
          }
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 16: Project Numbers Recomputation (hours and closed gaps)
  // ─────────────────────────────────────────────────────────────
  for (const p of projectDrops) {
    if (p.estimatedHours != null) {
      if (p.estimatedHours <= 0 || p.estimatedHours > 200) {
        violations.push({
          check: 'project-numbers',
          message: `Project "${p.title}" estimated hours ${p.estimatedHours} outside plausible range [1, 200].`,
          field: 'projectDrops.estimatedHours',
          value: p.estimatedHours,
        });
      }
    }
    if (p.hoursDisplay && p.estimatedHours) {
      const expectedHoursDisplay = `~${p.estimatedHours} hrs`;
      if (p.hoursDisplay !== expectedHoursDisplay && !/estimate/i.test(p.hoursDisplay)) {
        violations.push({
          check: 'project-numbers',
          message: `Project "${p.title}" hoursDisplay "${p.hoursDisplay}" does not match estimated hours "${expectedHoursDisplay}".`,
          field: 'projectDrops.hoursDisplay',
          value: p.hoursDisplay,
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 17: Vetted Concept Tags (concepts must have backing evidence in brief text)
  // ─────────────────────────────────────────────────────────────
  for (const p of projectDrops) {
    const rawBrief = BRIEFS_MAP.get(p.id) || BRIEFS_MAP.get((p.title || '').toLowerCase().trim());
    if (rawBrief) {
      const brief = {
        ...rawBrief,
        coveredSkills: Array.from(new Set([...(rawBrief.coveredSkills || []), ...(p.coveredSkills || [])])),
      };
      const { vettedConceptTags } = validateBriefConcepts(brief);
      const vettedLower = vettedConceptTags.map((c) => c.toLowerCase());
      const claimedSkills: string[] = p.coveredSkills || [];

      for (const s of claimedSkills) {
        const sLower = s.toLowerCase();

        // Check if s matches any defined concept definition
        const matchedConcept = CONCEPT_DEFINITIONS.find((def) =>
          def.label.toLowerCase() === sLower ||
          def.aliases.some((a) => a.toLowerCase() === sLower)
        );

        if (matchedConcept) {
          // If the brief also has this exact skill in techStack, it's grounded in technology stack
          const isTechGrounded = (brief.techStack || []).some((t) => {
            const tNorm = getCanonicalSkillName(t).toLowerCase();
            return tNorm === sLower || t.toLowerCase() === sLower;
          });

          if (!isTechGrounded) {
            const isVetted = vettedLower.some(
              (vl) => vl.includes(matchedConcept.label.toLowerCase()) || matchedConcept.label.toLowerCase().includes(vl)
            );
            if (!isVetted) {
              violations.push({
                check: 'vetted-concepts',
                message: `Project "${p.title}" claims concept "${s}" without verified textual evidence in its brief.`,
                field: 'projectDrops.coveredSkills',
                value: s,
              });
            }
          }
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 18: Determinism & Non-Degeneracy
  // ─────────────────────────────────────────────────────────────
  const overallScore = r.score ?? r.overallScore ?? r.result?.score;
  if (typeof overallScore === 'number') {
    if (Number.isNaN(overallScore) || !Number.isFinite(overallScore)) {
      violations.push({
        check: 'determinism',
        message: `Overall score is NaN or non-finite.`,
        field: 'score',
        value: overallScore,
      });
    } else if (overallScore < 0 || overallScore > 100) {
      violations.push({
        check: 'numbers',
        message: `Overall score ${overallScore} is out of bounds [0, 100].`,
        field: 'score',
        value: overallScore,
      });
    }
  }
  for (const b of breakdown) {
    if (typeof b.score === 'number' && Number.isNaN(b.score)) {
      violations.push({
        check: 'determinism',
        message: `Competency score for "${b.competency || b.key}" is NaN.`,
        field: 'breakdown.score',
        value: b.score,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECKS 19 - 25: Evidence-Safe Bullet Rewrites
  // ─────────────────────────────────────────────────────────────
  const rewrites: any[] =
    r.bulletRewrites ||
    r.learningPath?.bulletRewrites ||
    r.result?.bulletRewrites ||
    [];

  const resumeText: string =
    r.resumeText ||
    r.appendix?.resumeText ||
    r.context?.rawResumeText ||
    r.result?.trace?.resumeText ||
    '';

  // CHECK 25: At most 5 rewrites per report
  if (rewrites.length > 5) {
    violations.push({
      check: 'max-rewrites',
      message: `Report has ${rewrites.length} rewrites, exceeding maximum of 5.`,
      field: 'bulletRewrites',
      value: rewrites.length,
    });
  }

  for (const rw of rewrites) {
    const beforeText: string = rw.originalBullet || '';
    const afterText: string = rw.rewrittenBullet || '';

    // CHECK 19: every rewrite's "before" text is an exact substring of the resume text
    if (resumeText && beforeText && !resumeText.includes(beforeText)) {
      violations.push({
        check: 'before-substring',
        message: `Rewrite original bullet "${beforeText.slice(0, 50)}..." is not an exact substring of resume text.`,
        field: 'bulletRewrites.originalBullet',
        value: beforeText,
      });
    }

    // Check 19 (exact substring without normalization for rewrite parts)
    const clausesToCheck = Array.isArray(rw.splitBullets) && rw.splitBullets.length > 0
      ? rw.splitBullets
      : afterText.split(/\n+/).filter(Boolean);

    for (const clause of clausesToCheck) {
      const nonSlotParts = clause
        .split(/[,\s]*(?:with|using|for|in|to|and|via|at)?\s*\[(?:add|warning|note|fill-in):[^\]]+\]|\[[^\]]+\]/gi)
        .map((p: string) => p.replace(/[.,\s]+$/, '').replace(/^[.,\s]+/, '').trim())
        .filter((p: string) => p.length >= 2 && !ALLOWED_CONNECTIVES.has(p.toLowerCase()));

      for (const part of nonSlotParts) {
        if (beforeText && !beforeText.includes(part)) {
          const corePart = part.replace(/,\s*(with|using|in|for|to|and)$/i, '').trim();
          const lowerFirstPart = corePart.charAt(0).toLowerCase() + corePart.slice(1);
          if (
            corePart.length >= 2 &&
            !beforeText.includes(corePart) &&
            !beforeText.includes(lowerFirstPart)
          ) {
            violations.push({
              check: 'before-substring',
              message: `Rewrite part "${part.slice(0, 50)}" is not an exact substring of original bullet "${beforeText.slice(0, 50)}".`,
              field: 'bulletRewrites.rewrittenBullet',
              value: part,
            });
          }
        }
      }
    }

    // CHECK 20: no digit, number word, or metric unit appears in "after" that is absent from "before"
    const beforeDigits = new Set(beforeText.match(/\d/g) || []);
    const afterDigits: string[] = afterText.match(/\d/g) || [];
    const newDigits = afterDigits.filter((d: string) => !beforeDigits.has(d));
    if (newDigits.length > 0) {
      violations.push({
        check: 'no-new-digits',
        message: `Rewritten bullet introduced new digit(s) [${Array.from(new Set(newDigits)).join(', ')}] not present in original bullet.`,
        field: 'bulletRewrites.rewrittenBullet',
        value: newDigits,
      });
    }

    // Number words & units outside slot markers
    const NUMBER_WORDS_AND_UNITS = new Set([
      'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
      'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million', 'billion',
      'lakh', 'lakhs', 'crore', 'crores', 'percent', 'percentage', 'k', 'ms', 'qps', 'tps', 'rps'
    ]);
    const strippedAfterText = afterText.replace(/\[(?:add|warning|note|fill-in):[^\]]+\]|\[[^\]]+\]/gi, ' ');
    const afterTokens = strippedAfterText.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
    const beforeTokens = new Set(beforeText.toLowerCase().match(/\b[a-z0-9]+\b/g) || []);
    const newNumberWords = afterTokens.filter((t) => NUMBER_WORDS_AND_UNITS.has(t) && !beforeTokens.has(t));
    if (newNumberWords.length > 0) {
      violations.push({
        check: 'no-new-digits',
        message: `Rewritten bullet introduced new number word(s) or unit(s) [${Array.from(new Set(newNumberWords)).join(', ')}] not present in original bullet.`,
        field: 'bulletRewrites.rewrittenBullet',
        value: newNumberWords,
      });
    }

    if (Array.isArray(rw.splitBullets)) {
      for (const sb of rw.splitBullets) {
        const sbDigits: string[] = sb.match(/\d/g) || [];
        const newSbDigits = sbDigits.filter((d: string) => !beforeDigits.has(d));
        if (newSbDigits.length > 0) {
          violations.push({
            check: 'no-new-digits',
            message: `Split bullet introduced new digit(s) [${Array.from(new Set(newSbDigits)).join(', ')}] not present in original bullet.`,
            field: 'bulletRewrites.splitBullets',
            value: newSbDigits,
          });
        }
        const strippedSb = sb.replace(/\[(?:add|warning|note|fill-in):[^\]]+\]|\[[^\]]+\]/gi, ' ');
        const sbTokens = strippedSb.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
        const newSbNumberWords = sbTokens.filter((t: string) => NUMBER_WORDS_AND_UNITS.has(t) && !beforeTokens.has(t));
        if (newSbNumberWords.length > 0) {
          violations.push({
            check: 'no-new-digits',
            message: `Split bullet introduced new number word(s) or unit(s) [${Array.from(new Set(newSbNumberWords)).join(', ')}] not present in original bullet.`,
            field: 'bulletRewrites.splitBullets',
            value: newSbNumberWords,
          });
        }
      }
    }

    // CHECK 21: every content word in "after" comes from "before", fixed connective list, or a slot marker
    // Words that assert an action or outcome (deployed, serving, achieving, delivering, resulting, launched, improved, etc.)
    // may appear only if present in the original bullet.
    const strippedAfter = afterText.replace(/\[(?:add|warning|note|fill-in):[^\]]+\]|\[[^\]]+\]/gi, ' ');

    const checkBulletContentWords = (text: string, fieldName: string) => {
      const stripped = text.replace(/\[(?:add|warning|note|fill-in):[^\]]+\]|\[[^\]]+\]/gi, ' ');
      const contentWords = stripped.match(/\b[a-zA-Z]{2,}\b/g) || [];
      const beforeWords = new Set(
        (beforeText.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || [])
      );

      for (const w of contentWords) {
        const wLower = w.toLowerCase();
        if (FORBIDDEN_ACTION_OUTCOME_WORDS.has(wLower) && !beforeWords.has(wLower)) {
          violations.push({
            check: 'allowed-words-or-slots',
            message: `Action or outcome word "${w}" introduced in rewrite but was not present in original bullet.`,
            field: fieldName,
            value: w,
          });
        } else if (!beforeWords.has(wLower) && !ALLOWED_CONNECTIVES.has(wLower)) {
          violations.push({
            check: 'allowed-words-or-slots',
            message: `Content word "${w}" in rewritten bullet not present in original bullet and not in allowed connectives list.`,
            field: fieldName,
            value: w,
          });
        }
      }
    };

    checkBulletContentWords(afterText, 'bulletRewrites.rewrittenBullet');

    if (Array.isArray(rw.splitBullets)) {
      for (const sb of rw.splitBullets) {
        checkBulletContentWords(sb, 'bulletRewrites.splitBullets');
      }
    }

    // CHECK 22: ownership guard (no upgrade of weak ownership verbs)
    const beforeLower = beforeText.toLowerCase();
    const hasWeakVerb = Array.from(WEAK_OWNERSHIP_VERBS).some(
      (wv) => beforeLower.startsWith(wv) || beforeLower.includes(` ${wv} `)
    );
    const hasStrongVerbBefore = Array.from(STRONG_VERBS).some(
      (sv) => beforeLower.startsWith(sv) || beforeLower.includes(` ${sv} `)
    );

    if (hasWeakVerb && !hasStrongVerbBefore) {
      const afterWords = strippedAfter.toLowerCase().match(/\b[a-zA-Z]{2,}\b/g) || [];
      for (const aw of afterWords) {
        if (FORBIDDEN_UPGRADE_VERBS.has(aw)) {
          violations.push({
            check: 'ownership-guard',
            message: `Weak ownership verb in original bullet was improperly upgraded to strong verb "${aw}".`,
            field: 'bulletRewrites.rewrittenBullet',
            value: aw,
          });
        }
      }

      const hasOwnershipSlot = /\[add:\s*(?:what you personally built|your specific contribution|personal contribution)[^\]]*\]/i.test(afterText);
      if (!hasOwnershipSlot && !rw.isNoChangeNeeded) {
        violations.push({
          check: 'ownership-guard',
          message: `Weak ownership bullet missing personal contribution slot marker.`,
          field: 'bulletRewrites.rewrittenBullet',
          value: afterText,
        });
      }
    }

    // CHECK 23: slots appear only in rewrite and fill-in blocks and are visibly marked
    const slotMatches = afterText.match(/\[[^\]]+\]/g) || [];
    for (const sm of slotMatches) {
      if (!/^\[(?:add|warning|note|fill-in):[^\]]+\]$/i.test(sm) && !/^\[[\w\s/-]+\]$/.test(sm)) {
        violations.push({
          check: 'slot-markers',
          message: `Malformed slot marker "${sm}" in rewritten bullet.`,
          field: 'bulletRewrites.rewrittenBullet',
          value: sm,
        });
      }
    }
  }

  // CHECK 24: Rewrite Determinism & Integrity (unique deterministic rewrite IDs)
  const seenRewriteIds = new Set<string>();
  for (const rw of rewrites) {
    if (rw.id && seenRewriteIds.has(rw.id)) {
      violations.push({
        check: 'rewrite-determinism',
        message: `Duplicate rewrite ID detected: "${rw.id}". Rewrites must have deterministic, distinct IDs.`,
        field: 'bulletRewrites.id',
        value: rw.id,
      });
    }
    if (rw.id) seenRewriteIds.add(rw.id);
  }

  const isValid = violations.length === 0;

  if (!isValid && isDevOrTest && process.env.STRICT_REPORT_VALIDATOR === 'true') {
    const msg = violations.map((v) => `[${v.check}] ${v.message}`).join('\n');
    throw new Error(`Report Integrity Violations Detected:\n${msg}`);
  }

  const sanitizedReport = JSON.parse(JSON.stringify(report || {}));
  for (const p of sanitizedReport.projectDrops || []) {
    const brief = BRIEFS_MAP.get(p.id) || BRIEFS_MAP.get((p.title || '').toLowerCase().trim());
    if (brief) {
      p.coveredSkills = deriveBriefRealSkills(brief);
    }
  }

  return {
    isValid,
    violations,
    sanitizedReport,
  };
}
