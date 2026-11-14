// ============================================================
// HireFlow — TalentLens Report Integrity Validator (Stage 7)
// Pure validation module enforcing the 7 integrity guarantees.
// Throws in test/development; sanitizes & downgrades in production.
// ============================================================

import briefsData from '../../../data/suite/project-briefs.json';
import { ProjectBrief } from '@/features/suite/briefs/bundleBriefs';
import { deriveBriefRealSkills, MIN_PROJECT_RELEVANCE_THRESHOLD } from './projectMatcherIntegrity';
import { classifySkillKind } from './skillStateEngine';

export interface ReportViolation {
  check: 'consistency' | 'coverage' | 'relevance' | 'sources' | 'templates' | 'numbers' | 'evidence';
  message: string;
  field?: string;
  value?: any;
}

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
 * Validates a TalentLens report or DossierModel against the 7 Integrity Invariants.
 */
export function validateReport(report: any): ValidateReportResult {
  const violations: ReportViolation[] = [];
  const isDevOrTest = process.env.NODE_ENV !== 'production';

  // Deep clone for safe sanitization without mutating caller's original
  const sanitized = JSON.parse(JSON.stringify(report || {}));

  // Resolve breakdown / skills
  const breakdown: any[] = sanitized.breakdown || sanitized.result?.breakdown || [];
  const marketIntel = sanitized.talentLensIntel || sanitized.marketIntel || sanitized.result?.marketIntel;
  const plans: any[] = sanitized.learningPath?.plans || sanitized.learningPlans || sanitized.plans || sanitized.result?.plans || [];
  const projectDrops: any[] = sanitized.projectDrops || [];
  const companyContext = sanitized.companyContext;

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
          // Production sanitize: rewrite to honest statement
          f.finding = `No evidence found in the resume for ${f.category.toUpperCase()}.`;
          f.status = 'critical';
          f.evidence = [];
        }
        if (Array.isArray(f.evidence) && f.evidence.length > 0) {
          violations.push({
            check: 'consistency',
            message: `Not-found skill ${f.category} contains non-empty evidence array.`,
            field: 'marketIntel.findings.evidence',
            value: f.evidence,
          });
          f.evidence = [];
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 2: Coverage (project's covers is subset of real stack)
  // ─────────────────────────────────────────────────────────────
  for (const p of projectDrops) {
    const brief = BRIEFS_MAP.get(p.id) || BRIEFS_MAP.get((p.title || '').toLowerCase().trim());
    if (brief) {
      const realSkills = deriveBriefRealSkills(brief).map((s) => s.toLowerCase());
      for (const cov of p.coveredSkills || []) {
        const covLower = cov.toLowerCase();
        const inReal = realSkills.some((rs) => rs.includes(covLower) || covLower.includes(rs));
        if (!inReal) {
          violations.push({
            check: 'coverage',
            message: `Project "${p.title}" claims to cover "${cov}" which is absent from its real stack.`,
            field: 'projectDrops.coveredSkills',
            value: cov,
          });
        }
      }
      // Production sanitize: filter to real skills only
      p.coveredSkills = deriveBriefRealSkills(brief);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 3: Relevance (every shown project meets threshold)
  // ─────────────────────────────────────────────────────────────
  const filteredProjects: any[] = [];
  for (const p of projectDrops) {
    if (p.relevanceScore != null && p.relevanceScore < MIN_PROJECT_RELEVANCE_THRESHOLD) {
      violations.push({
        check: 'relevance',
        message: `Project "${p.title}" relevance ${p.relevanceScore} falls below minimum threshold ${MIN_PROJECT_RELEVANCE_THRESHOLD}.`,
        field: 'projectDrops.relevanceScore',
        value: p.relevanceScore,
      });
    } else {
      filteredProjects.push(p);
    }
  }
  sanitized.projectDrops = filteredProjects.slice(0, 2);

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
          companyContext[sf] = val.replace(/verified/gi, 'unverified');
        } else if (!hasProvenance) {
          violations.push({
            check: 'sources',
            message: `Company statistic "${fieldName}" is missing source, period or estimate annotation.`,
            field: `companyContext.${fieldName}`,
            value: val,
          });
          companyContext[sf] = `${val} (estimate)`;
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
      // Production sanitize: replace {{x}} with [x]
      if (plan.bulletTemplate) {
        plan.bulletTemplate = plan.bulletTemplate.replace(/{{\s*([\w\s/-]+)\s*}}/g, '[$1]');
      }
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
      // Production sanitize: rewrite to authoring artifact
      plan.suggestedAction =
        'Author a written technical artifact (architecture RFC, system design walkthrough, or technical post-mortem) demonstrating structured communication and decision rationale.';
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 6: Numbers (no duplicated gain ranges, cumulative <= 100)
  // ─────────────────────────────────────────────────────────────
  const seenGainRanges = new Set<string>();
  for (const plan of plans) {
    const gainStr = plan.hypotheticalScoreGain;
    if (gainStr && typeof gainStr === 'string' && plan.priority === 'critical') {
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
          plan.hypotheticalScoreGain = gainStr.replace(/->\s*\d+/, '-> 100');
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHECK 7: Evidence uniqueness (no sentence is primary for > 1)
  // ─────────────────────────────────────────────────────────────
  const primarySentencesClaimed = new Set<string>();
  for (const b of breakdown) {
    const contextList = b.analysis?.contextSentences || b.contextSentences || [];
    if (contextList.length > 0) {
      const primary = contextList[0];
      if (primary && primarySentencesClaimed.has(primary)) {
        violations.push({
          check: 'evidence',
          message: `Sentence "${primary.slice(0, 50)}..." is claimed as primary proof for multiple skills.`,
          field: 'breakdown.contextSentences',
          value: primary,
        });
        // Production sanitize: downgrade to secondary mention
        if (b.analysis) {
          b.analysis.contextSentences = contextList.slice(1);
          if (b.analysis.contextSentences.length === 0) {
            b.analysis.status = 'working';
          }
        }
      } else if (primary) {
        primarySentencesClaimed.add(primary);
      }
    }
  }

  const isValid = violations.length === 0;

  if (!isValid && isDevOrTest && process.env.STRICT_REPORT_VALIDATOR === 'true') {
    const msg = violations.map((v) => `[${v.check}] ${v.message}`).join('\n');
    throw new Error(`Report Integrity Violations Detected:\n${msg}`);
  }

  return {
    isValid,
    violations,
    sanitizedReport: sanitized,
  };
}

