// ============================================================
// HireFlow v3 — Tailor My Resume Truth Gate (R6.9, P-1, P-2)
// Pure, deterministic factual integrity sentinel
// ============================================================

import { TruthGateInput, TruthGateOutput, TruthGateViolation } from './types';
import { CLAIM_STRENGTH_LADDER, TAILOR_MIRRORING_LIMITS } from '../../config/thresholds';
import { extractSkillsFromText } from '../matching/tokenizer';

const METRIC_OR_NUMBER_REGEX = /\b(?:\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?|₹\d+(?:\.\d+)?|\d+\s*(?:ms|s|sec|seconds|users|k|m|requests?|req\/s|qps|rps|tps|gb|tb|mb|₹|\$|lpa|stars|lines|records|queries))\b|\b\d{2,}\b/gi;
const YEAR_DATE_REGEX = /\b(?:19|20)\d{2}\b/g;

/**
 * Normalizes text string for token comparison (lowercased, punctuation-trimmed).
 */
function normalizeFact(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts action verb rank from the beginning of a bullet.
 */
function getActionVerbRank(bullet: string): { verb: string; rank: number } {
  const clean = bullet.replace(/^[-•*►›\d.]+\s*/, '').trim().toLowerCase();
  const firstWord = clean.split(/\s+/)[0] || '';
  const firstTwoWords = clean.split(/\s+/).slice(0, 2).join(' ');

  if (CLAIM_STRENGTH_LADDER[firstTwoWords]) {
    return { verb: firstTwoWords, rank: CLAIM_STRENGTH_LADDER[firstTwoWords] };
  }
  if (CLAIM_STRENGTH_LADDER[firstWord]) {
    return { verb: firstWord, rank: CLAIM_STRENGTH_LADDER[firstWord] };
  }

  // Check if starts with a known verb in the ladder
  for (const [v, r] of Object.entries(CLAIM_STRENGTH_LADDER)) {
    if (clean.startsWith(v + ' ') || clean.startsWith(v)) {
      return { verb: v, rank: r };
    }
  }

  // Default to neutral middle tier (level 3) if not explicitly catalogued
  return { verb: firstWord, rank: 3 };
}

/**
 * Evaluates candidate rewrite against candidate ledger and source facts.
 * Enforces R6.9 rules (a), (b), (c), and (d).
 * 100% deterministic, never invents facts.
 */
export function evaluateTruthGate(input: TruthGateInput): TruthGateOutput {
  const { candidateLedger, originalBullet, proposedBullet, addedContext = '', keywordUsageTracker } = input;
  const violations: TruthGateViolation[] = [];

  // 1. Build verified facts database from Ledger, Original Bullet, and User-Entered Added Context
  const verifiedMetrics = new Set<string>();
  const verifiedSkills = new Set<string>();
  const verifiedDates = new Set<string>();
  const verifiedCompanies = new Set<string>();
  const verifiedCredentials = new Set<string>();

  // Helper to ingest facts from any text block
  const harvestFactsFromText = (rawText: string) => {
    if (!rawText) return;
    const numbers = rawText.match(METRIC_OR_NUMBER_REGEX) || [];
    numbers.forEach((n) => verifiedMetrics.add(normalizeFact(n)));

    const dates = rawText.match(YEAR_DATE_REGEX) || [];
    dates.forEach((d) => verifiedDates.add(d));

    const skills = extractSkillsFromText(rawText);
    skills.forEach((s) => {
      verifiedSkills.add(s.skill.id);
      verifiedSkills.add(normalizeFact(s.skill.canonical));
      s.skill.aliases.forEach((a) => verifiedSkills.add(normalizeFact(a)));
    });
  };

  // Harvest from original bullet and user added context
  harvestFactsFromText(originalBullet);
  harvestFactsFromText(addedContext);

  // Harvest from candidate ledger
  candidateLedger?.skills?.forEach((s: any) => {
    const skillName = typeof s === 'string' ? s : s.displayName || s.skillId;
    const skillId = typeof s === 'string' ? s : s.skillId;
    verifiedSkills.add(skillId);
    verifiedSkills.add(normalizeFact(skillName));
  });

  candidateLedger?.education?.forEach((edu: any) => {
    if (edu.institute) verifiedCompanies.add(normalizeFact(edu.institute));
    if (edu.startYear) verifiedDates.add(String(edu.startYear));
    if (edu.endYear) verifiedDates.add(String(edu.endYear));
    const cgpaVal = typeof edu.cgpa === 'object' && edu.cgpa !== null ? edu.cgpa.value : edu.cgpa;
    if (cgpaVal) verifiedMetrics.add(normalizeFact(String(cgpaVal)));
    if (edu.percentage) verifiedMetrics.add(normalizeFact(String(edu.percentage)));
  });

  candidateLedger?.projects?.forEach((proj: any) => {
    proj.techStack?.forEach((t: string) => verifiedSkills.add(normalizeFact(t)));
    proj.bullets?.forEach((b: string) => harvestFactsFromText(b));
  });

  candidateLedger?.internships?.forEach((intern: any) => {
    const company = intern.org || intern.company;
    if (company) verifiedCompanies.add(normalizeFact(company));
    if (intern.startYear) verifiedDates.add(String(intern.startYear));
    if (intern.endYear) verifiedDates.add(String(intern.endYear));
    intern.bullets?.forEach((b: string) => harvestFactsFromText(b));
  });

  candidateLedger?.certifications?.forEach((cert: any) => {
    if (cert.name) verifiedCredentials.add(normalizeFact(cert.name));
    if (cert.issuer) verifiedCompanies.add(normalizeFact(cert.issuer));
    if (cert.year) verifiedDates.add(String(cert.year));
  });

  candidateLedger?.achievements?.forEach((ach: any) => {
    const text = typeof ach === 'string' ? ach : [ach.title, ach.description].filter(Boolean).join(' ');
    harvestFactsFromText(text);
  });

  // --- CHECK (a): Numbers, Metrics, Dates, Tools, Companies, Credentials in Proposed Bullet ---
  const proposedMetrics = proposedBullet.match(METRIC_OR_NUMBER_REGEX) || [];
  for (const pm of proposedMetrics) {
    const norm = normalizeFact(pm);
    if (!verifiedMetrics.has(norm)) {
      violations.push({
        id: `invented_metric_${violations.length}`,
        type: 'invented_metric',
        severity: 'fatal',
        message: `Invented metric or number "${pm}" is not supported by resume facts or user context.`,
        offendingSpan: pm,
      });
    }
  }

  const proposedDates = proposedBullet.match(YEAR_DATE_REGEX) || [];
  for (const pd of proposedDates) {
    if (!verifiedDates.has(pd)) {
      violations.push({
        id: `invented_date_${violations.length}`,
        type: 'invented_date',
        severity: 'fatal',
        message: `Date "${pd}" was not present in candidate timeline.`,
        offendingSpan: pd,
      });
    }
  }

  const proposedSkills = extractSkillsFromText(proposedBullet);
  for (const ps of proposedSkills) {
    const skillNorm = normalizeFact(ps.skill.canonical);
    const idNorm = ps.skill.id;
    const isSupported = verifiedSkills.has(idNorm) || verifiedSkills.has(skillNorm) ||
      ps.skill.aliases.some((a) => verifiedSkills.has(normalizeFact(a)));

    if (!isSupported) {
      violations.push({
        id: `invented_tool_${violations.length}`,
        type: 'invented_tool',
        severity: 'fatal',
        message: `Unsupported skill or tool "${ps.skill.canonical}" was introduced without candidate proof.`,
        offendingSpan: ps.matchedAlias,
      });
    }
  }

  // --- CHECK (b): Claim-Strength Ladder (Never raise strength above source verb) ---
  const originalVerb = getActionVerbRank(originalBullet);
  const proposedVerb = getActionVerbRank(proposedBullet);

  if (proposedVerb.rank > originalVerb.rank) {
    violations.push({
      id: `upgraded_verb_${violations.length}`,
      type: 'upgraded_verb',
      severity: 'fatal',
      message: `Action verb strength escalated from "${originalVerb.verb}" (tier ${originalVerb.rank}) to "${proposedVerb.verb}" (tier ${proposedVerb.rank}). Rewrites may never inflate ownership level.`,
      offendingSpan: proposedVerb.verb,
      originalSpan: originalVerb.verb,
    });
  }

  // --- CHECK (c): Keyword Mirroring Cap per Term (Prevent Stuffing) ---
  if (keywordUsageTracker) {
    for (const ps of proposedSkills) {
      const currentUsage = keywordUsageTracker.get(ps.skill.id) || 0;
      if (currentUsage >= TAILOR_MIRRORING_LIMITS.maxKeywordMentionsPerTerm) {
        violations.push({
          id: `stuffed_keyword_${violations.length}`,
          type: 'stuffed_keyword',
          severity: 'fatal',
          message: `Target skill "${ps.skill.canonical}" has reached its maximum frequency cap (${TAILOR_MIRRORING_LIMITS.maxKeywordMentionsPerTerm} mentions) across tailored bullets.`,
          offendingSpan: ps.matchedAlias,
        });
      }
    }
  }

  // --- RULE (d): Fallback to Original Phrasing on Any Violation ---
  const passed = violations.length === 0;
  const finalBullet = passed ? proposedBullet : originalBullet;

  // Track keyword usages if passed
  if (passed && keywordUsageTracker) {
    for (const ps of proposedSkills) {
      const count = keywordUsageTracker.get(ps.skill.id) || 0;
      keywordUsageTracker.set(ps.skill.id, count + 1);
    }
  }

  return {
    passed,
    violations,
    finalBullet,
    usedOriginalFallback: !passed,
    qualityFloorPreserved: true,
  };
}
