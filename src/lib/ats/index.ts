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
export * from './canonicalAnalysis';

import {
  SYSTEM_PROMPT,
  buildAIPrompt,
  validateAndSanitizeAICommentary,
  generateDeterministicFallbackAI,
} from './prompts';
import { enforceInvariants } from './invariants';
import { AnalysisResponse } from './types';
import { runHybridAnalysis } from './pipeline';
export * from './analyzeDeterministic';
import { analyzeDeterministic } from './analyzeDeterministic';

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

  // SEC-003 Remediation: Never perform direct browser fetch with API keys in URL query params.
  // All AI model requests must be brokered through the local /api/ats/analyze proxy.
  // If the proxy is unavailable, gracefully fall back to the verified deterministic engine.

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

