// ============================================================
// HireFlow ATS Engine — Main Deterministic Analyzer Facade
// ============================================================

import { DeterministicFacts } from './types';
import { parseResume } from './parseResume';
import { parseJD } from './parseJD';
import { matchSkills } from './matchSkills';
import { evidenceScorer } from './evidenceScorer';
import { formatAuditor } from './formatAuditor';
import { seniorityFit } from './seniorityFit';
import { marketPositioning } from './marketPositioning';
import { scoreAggregator } from './scoreAggregator';

export * from './types';
export * from './parseResume';
export * from './parseJD';
export * from './matchSkills';
export * from './evidenceScorer';
export * from './formatAuditor';
export * from './seniorityFit';
export * from './marketPositioning';
export * from './scoreAggregator';
export * from './fileExtractor';
export * from './prompts';
export * from './invariants';
export * from './pipeline';

import {
  SYSTEM_PROMPT,
  buildAIPrompt,
  validateAndSanitizeAICommentary,
  generateDeterministicFallbackAI,
} from './prompts';
import { enforceInvariants } from './invariants';
import { AnalysisResponse } from './types';
import { runHybridAnalysis } from './pipeline';

export function analyzeDeterministic(
  resumeText: string,
  jdText: string,
  options?: { targetCompanyTier?: string; experienceLevel?: string }
): DeterministicFacts {
  // 1. Parse Resume & JD
  const parsedResume = parseResume(resumeText);
  const parsedJD = parseJD(jdText);

  // If user explicitly specified experience level in UI, apply override
  if (options?.experienceLevel && options.experienceLevel !== 'Auto') {
    if (options.experienceLevel === 'Fresher') parsedResume.totalYearsEstimate = 0.5;
    else if (options.experienceLevel === '1-3') parsedResume.totalYearsEstimate = 2;
    else if (options.experienceLevel === '3-5') parsedResume.totalYearsEstimate = 4;
    else if (options.experienceLevel === '5+') parsedResume.totalYearsEstimate = 6;
  }

  // 2. Score Bullets
  const scoredBullets = evidenceScorer(parsedResume.bullets);
  parsedResume.bullets = scoredBullets;

  // 3. Match Skills against Taxonomy
  const skillMatches = matchSkills(
    parsedResume.skillsExtracted,
    parsedJD.mustHaves,
    parsedJD.niceToHaves,
    parsedResume.rawText
  );

  // 4. Audit Format Safety
  const formatRisks = formatAuditor(parsedResume);

  // 5. Seniority Fit
  const seniority = seniorityFit(parsedResume, parsedJD);

  // 6. Market Positioning
  const positioning = marketPositioning(parsedResume, parsedJD);

  // 7. Score Aggregator
  const scoreBreakdown = scoreAggregator(
    parsedResume,
    parsedJD,
    skillMatches,
    scoredBullets,
    seniority,
    formatRisks
  );

  // 8. Segregate Matched vs Missing Keywords
  const matchedKeywords = skillMatches
    .filter((s) => s.status === 'exact' || s.status === 'alias' || s.status === 'implied')
    .map((s) => s.skill);

  const missingKeywords = skillMatches
    .filter((s) => s.status === 'missing' || s.status === 'related')
    .map((s) => s.skill);

  const wordingFixSkills = skillMatches
    .filter((s) => s.gapType === 'wording_fix')
    .map((s) => s.skill);

  const learnNeededSkills = skillMatches
    .filter((s) => s.gapType === 'learn_needed')
    .map((s) => s.skill);

  // 9. Generate Deterministic Harsh Truths
  const harshTruths: string[] = [];

  // Check bullet style
  const jdStyleBullets = scoredBullets.filter((b) => b.isJobDescriptionStyle);
  if (jdStyleBullets.length > 0) {
    harshTruths.push('Your bullet points read like a job description, not a list of accomplishments.');
  }

  // Check metrics on frontend/backend skills
  const bulletsWithMetrics = scoredBullets.filter((b) => b.hasMetric);
  if (
    (matchedKeywords.includes('React') || matchedKeywords.includes('JavaScript') || matchedKeywords.includes('Node.js')) &&
    bulletsWithMetrics.length === 0
  ) {
    const prominentSkill = matchedKeywords.includes('React') ? 'React' : matchedKeywords[0] || 'your core stack';
    harshTruths.push(`You list "${prominentSkill}" but provided zero metrics on performance improvements or traffic handled.`);
  }

  // Check DevOps gap
  const devopsSkills = ['Docker', 'Kubernetes', 'CI/CD Pipelines'];
  const missingDevOps = devopsSkills.filter((d) => missingKeywords.includes(d));
  if (missingDevOps.length >= 2) {
    harshTruths.push(
      'The job requires extensive DevOps knowledge (Docker/K8s) which is completely absent from your resume.'
    );
  }

  // Check keyword stuffing
  if (scoreBreakdown.keywordStuffingPenalty < 0) {
    harshTruths.push(
      'You listed multiple advanced technologies in your skills section that have zero supporting evidence or project context in your experience.'
    );
  }

  // Check seniority
  if (seniority.status === 'underqualified') {
    harshTruths.push(seniority.reasoning);
  }

  // Fallback harsh truth if less than 3
  if (harshTruths.length < 3) {
    if (missingKeywords.length > 0) {
      harshTruths.push(
        `Critical gap in target stack: Missing ${missingKeywords.slice(0, 3).join(', ')} which are core requirements for this position.`
      );
    }
  }

  const rawFacts: DeterministicFacts = {
    resume: parsedResume,
    jd: parsedJD,
    skillMatches,
    matchedKeywords,
    missingKeywords,
    wordingFixSkills,
    learnNeededSkills,
    bulletAnalyses: scoredBullets,
    formatRisks,
    seniorityFit: seniority,
    marketPositioning: positioning,
    scoreBreakdown,
    harshTruthsDeterministic: harshTruths.slice(0, 5),
  };

  const { facts: validatedFacts } = enforceInvariants(rawFacts, resumeText);
  return validatedFacts;
}

export interface AnalyzeOptions {
  targetCompanyTier?: 'Auto' | 'Tier S' | 'Tier A' | 'Tier B' | 'Tier C';
  experienceLevel?: 'Auto' | 'Fresher' | '1-3' | '3-5' | '5+';
  geminiApiKey?: string;
  skipAi?: boolean;
}

export async function analyzeResume(
  resumeText: string,
  jdText: string,
  options?: AnalyzeOptions
): Promise<AnalysisResponse> {
  // 1. Run deterministic facts engine
  const facts = analyzeDeterministic(resumeText, jdText, options);

  if (options?.skipAi) {
    const fallbackAI = generateDeterministicFallbackAI(facts);
    const { facts: f, ai: a } = enforceInvariants(facts, resumeText, fallbackAI);
    return {
      facts: f,
      ai: a,
      isAiAvailable: false,
    };
  }

  // 2. Try calling backend dev server API
  try {
    const res = await fetch('/api/ats/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText,
        jdText,
        facts,
        apiKey: options?.geminiApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.facts || data.ai) {
        const factsToUse = data.facts || facts;
        const { facts: f, ai: a } = enforceInvariants(factsToUse, resumeText, data.ai);
        return {
          facts: f,
          ai: a,
          isAiAvailable: data.isAiAvailable ?? true,
          aiErrorNotice: data.aiErrorNotice,
          passA: data.passA,
          passB: data.passB,
          narrative: data.narrative,
          debugMath: data.debugMath,
        };
      }
    }
  } catch (err) {
    console.debug('Dev server API not reached or error, falling back:', err);
  }

  // 3. If client provided custom Gemini API key directly in UI (or localStorage)
  if (options?.geminiApiKey) {
    try {
      const prompt = buildAIPrompt(facts, resumeText, jdText);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${options.geminiApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const jsonRes = await response.json();
        const rawText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          const sanitized = validateAndSanitizeAICommentary(parsed, resumeText, facts);
          const { facts: f, ai: a } = enforceInvariants(facts, resumeText, sanitized);
          return {
            facts: f,
            ai: a,
            isAiAvailable: true,
          };
        }
      }
    } catch (err) {
      console.warn('Direct client Gemini call failed:', err);
    }
  }

  // 4. Default high-grade deterministic fallback commentary
  const hybrid = runHybridAnalysis(resumeText, jdText, { apiKey: options?.geminiApiKey });
  const { facts: f, ai: a } = enforceInvariants(hybrid.facts, resumeText, hybrid.ai);
  return {
    ...hybrid,
    facts: f,
    ai: a,
    isAiAvailable: false,
    aiErrorNotice: 'Simulated screening score based on grounded deterministic parser. Real ATS behavior varies by company.',
  };
}

