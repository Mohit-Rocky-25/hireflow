// ============================================================
// HireFlow Suite — TruthCheck Verification Module (Stage 4.1)
// Strict Non-Fabrication Assertion for Resume Tailoring
// Asserts that no suggested bullet introduces unverified skills,
// frameworks, or fake metrics without bracketed placeholders.
// ============================================================

import skillsTaxonomy from '../../../data/ats/skills-taxonomy.json';
import { CandidateProfile } from '../profile/types';

export interface TruthCheckResult {
  passed: boolean;
  violations: string[];
  anchoredOriginalSnippet?: string;
  detectedNewSkills: string[];
  detectedNewMetrics: string[];
}

// Build a fast lookup map of taxonomy terms (canonical and aliases)
interface SkillTerm {
  canonical: string;
  term: string;
}

const ALL_SKILL_TERMS: SkillTerm[] = [];
for (const entry of skillsTaxonomy) {
  ALL_SKILL_TERMS.push({
    canonical: entry.canonical.toLowerCase(),
    term: entry.canonical.toLowerCase(),
  });
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      ALL_SKILL_TERMS.push({
        canonical: entry.canonical.toLowerCase(),
        term: alias.toLowerCase(),
      });
    }
  }
}

// Sort by length descending to match longer terms first
ALL_SKILL_TERMS.sort((a, b) => b.term.length - a.term.length);

/**
 * Extracts recognized technical skills from a string of text.
 */
export function extractSkillsFromText(text: string): Set<string> {
  const found = new Set<string>();
  const lower = ` ${text.toLowerCase()} `;

  for (const { canonical, term } of ALL_SKILL_TERMS) {
    // Word boundary check
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_+#])${escaped}(?:$|[^a-zA-Z0-9_+#])`, 'i');
    if (regex.test(lower)) {
      found.add(canonical);
    }
  }

  return found;
}

/**
 * Extracts numeric metrics outside of square brackets.
 * Looks for patterns like "45%", "60,000 users", "100ms", "3x", "$2M", "₹50L".
 */
export function extractUnbracketedMetrics(text: string): string[] {
  // First, strip all bracketed placeholders like [metric: ...] or [X%]
  const cleaned = text.replace(/\[[^\]]+\]/g, ' ');

  const metrics: string[] = [];
  // Regex for percentages, multiplier, latency, scales, currency, and compound units like 50k users
  const metricRegex = /\b\d+(?:\.\d+)?\s*(?:k|m|million|billion)?\s*(?:users|qps|rps|req\/s|gb|tb|lpa|cr|%|x|ms|s)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = metricRegex.exec(cleaned)) !== null) {
    const val = match[0].trim();
    if (val.length > 0) {
      metrics.push(val);
    }
  }

  return metrics;
}

/**
 * Checks if a string contains bracketed placeholders like [metric: ...] or [X%]
 */
export function hasPlaceholder(text: string): boolean {
  return /\[(?:metric|X%|N|outcome|scale|number|percent)[^\]]*\]/i.test(text);
}

/**
 * Asserts whether a proposed tailored bullet is truthful relative to
 * the original resume text and candidate profile.
 */
export function assertTruthful(
  proposedBullet: string,
  originalBullet: string,
  fullResumeText?: string,
  profile?: CandidateProfile | null
): TruthCheckResult {
  const violations: string[] = [];

  // 1. Establish verified knowledge baseline
  const knownSkills = new Set<string>();

  // From original bullet
  extractSkillsFromText(originalBullet).forEach((s) => knownSkills.add(s));

  // From full resume if provided
  if (fullResumeText) {
    extractSkillsFromText(fullResumeText).forEach((s) => knownSkills.add(s));
  }

  // From profile if provided
  if (profile) {
    profile.skills.forEach((s) => {
      knownSkills.add(s.canonicalId.toLowerCase());
      knownSkills.add(s.displayName.toLowerCase());
    });
  }

  // 2. Check proposed bullet for new skills not in verified baseline
  // Strip bracketed placeholders before checking skills so template hints are not mistaken for skills
  const cleanedProposedForSkills = proposedBullet.replace(/\[[^\]]+\]/g, ' ');
  const proposedSkills = extractSkillsFromText(cleanedProposedForSkills);
  const detectedNewSkills: string[] = [];

  for (const skill of proposedSkills) {
    if (!knownSkills.has(skill)) {
      detectedNewSkills.push(skill);
      violations.push(
        `Fabrication detected: Proposed bullet introduces unverified technology "${skill}" not found in original resume or profile.`
      );
    }
  }

  // 3. Check for unbracketed fabricated metrics
  const originalMetrics = new Set(
    extractUnbracketedMetrics(originalBullet).map((m) => m.toLowerCase())
  );
  if (fullResumeText) {
    extractUnbracketedMetrics(fullResumeText).forEach((m) =>
      originalMetrics.add(m.toLowerCase())
    );
  }

  const proposedMetrics = extractUnbracketedMetrics(proposedBullet);
  const detectedNewMetrics: string[] = [];

  for (const metric of proposedMetrics) {
    if (!originalMetrics.has(metric.toLowerCase())) {
      detectedNewMetrics.push(metric);
      violations.push(
        `Fabricated metric detected: Proposed bullet introduced concrete metric "${metric}" without source evidence. Use bracketed placeholder like "[metric: ...]" instead.`
      );
    }
  }

  // 4. Anchor verification: proposed bullet must share semantic anchor with original
  const origTokens = new Set(
    originalBullet
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );
  const proposedTokens = proposedBullet
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const anchorOverlap = proposedTokens.filter((t) => origTokens.has(t)).length;

  if (origTokens.size > 2 && anchorOverlap === 0) {
    violations.push(
      'Anchor missing: Proposed bullet has zero semantic overlap with the original source sentence.'
    );
  }

  return {
    passed: violations.length === 0,
    violations,
    anchoredOriginalSnippet: originalBullet.slice(0, 80),
    detectedNewSkills,
    detectedNewMetrics,
  };
}
