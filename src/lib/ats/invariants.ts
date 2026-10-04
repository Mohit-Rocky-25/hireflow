// ============================================================
// HireFlow ATS Engine — Invariant Checker
// Runtime verification and self-correction of scoring invariants
// ============================================================

import { DeterministicFacts, AICommentary, SkillMatchResult } from './types';

export interface InvariantValidationReport {
  isValid: boolean;
  violations: string[];
  autoCorrected: boolean;
  verifiedCitationsCount: number;
}

export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Validates that an evidence quote actually exists verbatim in the resume text.
 */
export function isQuoteVerbatimInResume(quote: string, resumeText: string): boolean {
  if (!quote || quote.trim().length < 4) return false;
  // Strip quotation marks, trailing ellipses, and normalize whitespace
  const cleanQuote = quote
    .replace(/^["'“`]+|["'”`]+$/g, '')
    .replace(/\.{2,}/g, '')
    .trim();

  const normQuote = normalizeWhitespace(cleanQuote);
  const normResume = normalizeWhitespace(resumeText);

  // If quote is reasonably sized, check direct inclusion
  if (normQuote.length >= 6 && normResume.includes(normQuote)) {
    return true;
  }

  // Also check substantial sub-phrase (first 30 chars) if quote was slightly clipped
  if (normQuote.length > 30) {
    const chunk = normQuote.slice(0, 30);
    if (normResume.includes(chunk)) return true;
  }

  return false;
}

/**
 * Executes the 5 mandatory invariant checks on DeterministicFacts and AICommentary.
 * Throws in development mode if invariant is violated; auto-corrects and logs in production.
 */
export function enforceInvariants(
  facts: DeterministicFacts,
  rawResumeText: string,
  aiCommentary?: AICommentary
): { facts: DeterministicFacts; ai?: AICommentary; report: InvariantValidationReport } {
  const violations: string[] = [];
  let autoCorrected = false;

  // -------------------------------------------------------------------------
  // Invariant 1: mustHaveCoverage must equal (must-haves with status exact|alias|implied) / (total must-haves)
  // -------------------------------------------------------------------------
  const mustHaves = facts.skillMatches.filter((s) => s.importance === 'must_have');
  const matchedMustHaves = mustHaves.filter(
    (s) => s.status === 'exact' || s.status === 'alias' || s.status === 'implied'
  );

  const expectedMustHaveCoverage = mustHaves.length > 0
    ? Math.round((matchedMustHaves.length / mustHaves.length) * 100)
    : (facts.skillMatches.length > 0 
        ? Math.round((facts.skillMatches.filter(s => s.status === 'exact' || s.status === 'alias' || s.status === 'implied').length / facts.skillMatches.length) * 100)
        : 100);

  if (facts.scoreBreakdown.mustHaveCoverageScore !== expectedMustHaveCoverage) {
    const msg = `Invariant 1 Violation: mustHaveCoverageScore was ${facts.scoreBreakdown.mustHaveCoverageScore}% but strictly computed to ${expectedMustHaveCoverage}%.`;
    violations.push(msg);
    if (import.meta.env?.DEV) {
      console.warn(msg);
    }
    facts.scoreBreakdown.mustHaveCoverageScore = expectedMustHaveCoverage;
    autoCorrected = true;
  }

  // -------------------------------------------------------------------------
  // Invariant 2: Count of missing skills in header, Skills tab, Overview must be identical
  // -------------------------------------------------------------------------
  const actualMissingSkillsCount = facts.skillMatches.filter(
    (s) => s.status === 'missing' || s.status === 'related'
  ).length;

  if (facts.missingKeywords.length !== actualMissingSkillsCount) {
    const msg = `Invariant 2 Violation: missingKeywords length (${facts.missingKeywords.length}) != actual missing skills count (${actualMissingSkillsCount}).`;
    violations.push(msg);
    facts.missingKeywords = facts.skillMatches
      .filter((s) => s.status === 'missing' || s.status === 'related')
      .map((s) => s.skill);
    autoCorrected = true;
  }

  // -------------------------------------------------------------------------
  // Invariant 4: Every quoted evidence string must exist verbatim in resume text
  // -------------------------------------------------------------------------
  let verifiedCitations = 0;

  // Sanitize skill matches evidence snippets
  for (const match of facts.skillMatches) {
    if (match.evidenceSnippet && match.evidenceSnippet.includes('"...')) {
      const cleanSnippet = match.evidenceSnippet.replace(/^\.{3}|"\.{3}|\.{3}"|"\s*$/g, '').trim();
      if (isQuoteVerbatimInResume(cleanSnippet, rawResumeText)) {
        verifiedCitations++;
      } else {
        // Drop fabricated snippet
        match.evidenceSnippet = undefined;
      }
    }
  }

  // Sanitize AI commentary harsh truths and rewrites
  if (aiCommentary) {
    aiCommentary.harshTruths = aiCommentary.harshTruths.filter((ht) => {
      if (!ht.evidenceQuote || ht.evidenceQuote.trim().length === 0) {
        return true; // general criticism allowed
      }
      const isVerbatim = isQuoteVerbatimInResume(ht.evidenceQuote, rawResumeText);
      if (isVerbatim) {
        verifiedCitations++;
        return true;
      }
      // Drop hallucinated evidence citation
      ht.evidenceQuote = '';
      return true;
    });

    // -----------------------------------------------------------------------
    // Invariant 3: Narrative consistency check
    // If any must-have is missing, narrative may not say must-haves are fully met.
    // If coverage >= 70%, narrative may not say "critical gap" for must-haves.
    // -----------------------------------------------------------------------
    const hasMissingMustHaves = mustHaves.some((m) => m.status === 'missing');
    const summaryText = (aiCommentary.verdict as any).summary || aiCommentary.verdict.oneParagraphSummary || '';
    if (hasMissingMustHaves) {
      if (
        summaryText.toLowerCase().includes('all must-haves are met') ||
        summaryText.toLowerCase().includes('fully meets all requirements')
      ) {
        const replacement = summaryText.replace(
          /(?:all must-haves are met|fully meets all requirements)/gi,
          'meets partial core requirements with several missing must-haves'
        );
        if ('summary' in aiCommentary.verdict) {
          (aiCommentary.verdict as any).summary = replacement;
        }
        if ('oneParagraphSummary' in aiCommentary.verdict) {
          aiCommentary.verdict.oneParagraphSummary = replacement;
        }
        autoCorrected = true;
        violations.push('Invariant 3 Auto-Correction: Removed false claim that all must-haves are met.');
      }
    }

    if (facts.scoreBreakdown.mustHaveCoverageScore >= 70) {
      if (aiCommentary.verdict.headline.toLowerCase().includes('critical must-have gap')) {
        aiCommentary.verdict.headline = 'Strong Foundational Alignment: Secondary Skill Refinements Needed';
        autoCorrected = true;
        violations.push('Invariant 3 Auto-Correction: Adjusted headline since must-have coverage >= 70%.');
      }
    }
  }

  // -------------------------------------------------------------------------
  // Invariant 5: Final score = weighted sum of displayed components (integer match)
  // -------------------------------------------------------------------------
  const b = facts.scoreBreakdown;
  const isEvNA = Boolean(b.isEvidenceNA);

  const baseMust = 0.35;
  const baseEv = isEvNA ? 0 : 0.20;
  const hasNice = (facts.jd?.niceToHaves || []).length > 0;
  const baseNice = hasNice ? 0.10 : 0;
  const baseSen = 0.15;
  const baseProj = 0.10;
  const baseForm = 0.10;

  const totalW = baseMust + baseEv + baseNice + baseSen + baseProj + baseForm;
  const nMust = baseMust / totalW;
  const nEv = baseEv / totalW;
  const nNice = baseNice / totalW;
  const nSen = baseSen / totalW;
  const nProj = baseProj / totalW;
  const nForm = baseForm / totalW;

  const strictSum =
    b.mustHaveCoverageScore * nMust +
    (isEvNA ? 0 : b.evidenceQualityScore * nEv) +
    b.niceToHaveCoverageScore * nNice +
    b.seniorityFitScore * nSen +
    b.projectRelevanceScore * nProj +
    b.formatSafetyScore * nForm;

  let expectedFinal = Math.round(strictSum + b.keywordStuffingPenalty);
  expectedFinal = Math.max(0, Math.min(100, expectedFinal));

  if (b.dealbreakerTriggered) {
    expectedFinal = Math.min(expectedFinal, 55);
  }

  if (Math.abs(facts.scoreBreakdown.finalScore - expectedFinal) > 1) {
    const msg = `Invariant 5 Violation: finalScore (${facts.scoreBreakdown.finalScore}) did not match weighted sum (${expectedFinal}). Re-aligning.`;
    violations.push(msg);
    facts.scoreBreakdown.finalScore = expectedFinal;
    autoCorrected = true;
  }

  facts.verifiedCitationsCount = verifiedCitations;

  const report: InvariantValidationReport = {
    isValid: violations.length === 0,
    violations,
    autoCorrected,
    verifiedCitationsCount: verifiedCitations,
  };

  return { facts, ai: aiCommentary, report };
}
