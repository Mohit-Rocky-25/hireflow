// ============================================================
// ATS Resume Roaster — Level-Aware Seniority Mode Evaluator (Stage D)
// Pure, deterministic, data-driven signal evaluation (P1, P3, P7)
// Zero hardcoded level logic: all profiles and rules live in config
// ============================================================

import {
  getSeniorityLevel,
  inferSeniorityLevelFromYears,
  SeniorityLevelConfig,
  AdviceCardConfig,
} from '../../../config/atsConfig';
import { ParsedSection } from './types';

export interface EvaluatedSignal {
  id: string;
  label: string;
  description: string;
  weight: number;
  earnedScore: number;
  isMet: boolean;
  evidenceSnippet?: string;
  explanation: string;
}

export interface SeniorityModeResult {
  detectedLevel: string;
  displayName: string;
  typicalBarText: string;
  isUserOverride: boolean;
  scoredSignals: EvaluatedSignal[];
  signalsTotalScore: number;
  signalsMaxScore: number;
  signalsRatio: number;
  activeAdviceCards: AdviceCardConfig[];
  explanation: string;
}

/**
 * Normalizes user-selected or inferred level string to canonical profile key via config.
 */
export function normalizeSeniorityLevel(levelStr?: string): string {
  return getSeniorityLevel(levelStr).level.id;
}

/**
 * Generic, data-driven evaluator for seniority mode signals and advice cards.
 */
export function evaluateSenioritySignals(params: {
  resumeText: string;
  sections: ParsedSection[];
  bullets: Array<{ rawText: string; score?: number }>;
  candidateYears: number;
  levelOverride?: string;
}): SeniorityModeResult {
  const { resumeText, sections, bullets, candidateYears, levelOverride } = params;
  const isUserOverride = Boolean(levelOverride && levelOverride !== 'auto');

  // Determine profile from config (pure data-driven, P1)
  const profile: SeniorityLevelConfig = isUserOverride
    ? getSeniorityLevel(levelOverride).level
    : inferSeniorityLevelFromYears(candidateYears);
  const lowerResume = resumeText.toLowerCase();

  // Find relevant sections
  const eduSection = sections.find((s) => s.type === 'education')?.content.toLowerCase() || '';
  const expSection = sections.find((s) => s.type === 'experience')?.content.toLowerCase() || '';
  const projSection = sections.find((s) => s.type === 'projects')?.content.toLowerCase() || '';

  const evaluatedSignals: EvaluatedSignal[] = [];

  for (const signal of profile.scoredSignals) {
    let isMet = false;
    let evidenceSnippet: string | undefined = undefined;
    let explanation = '';

    switch (signal.detectionMode) {
      case 'internships': {
        for (const pat of signal.patterns) {
          const idx = lowerResume.indexOf(pat.toLowerCase());
          if (idx !== -1) {
            isMet = true;
            const start = Math.max(0, idx - 20);
            const end = Math.min(resumeText.length, idx + pat.length + 40);
            evidenceSnippet = resumeText.slice(start, end).trim();
            explanation = `Demonstrates practical training / internship exposure ("${pat}").`;
            break;
          }
        }
        if (!isMet) {
          explanation = 'No formal internship, co-op, or apprenticeship experience detected.';
        }
        break;
      }

      case 'coding_profiles': {
        for (const pat of signal.patterns) {
          const idx = lowerResume.indexOf(pat.toLowerCase());
          if (idx !== -1) {
            isMet = true;
            const start = Math.max(0, idx - 10);
            const end = Math.min(resumeText.length, idx + pat.length + 30);
            evidenceSnippet = resumeText.slice(start, end).trim();
            explanation = `Competitive coding profile or coding repository detected ("${pat}").`;
            break;
          }
        }
        if (!isMet) {
          explanation = 'No competitive coding platform links (LeetCode, Codeforces, HackerRank, GitHub) detected.';
        }
        break;
      }

      case 'cgpa': {
        const cgpaRegex = /\b(?:cgpa|gpa|percentage|aggregate|pointer)\s*[:=-]?\s*([0-9]{1,2}(?:\.[0-9]{1,2})?)(?:\s*(?:\/|\bout of\b)\s*(?:10|4|100))?/i;
        const match = (eduSection || lowerResume).match(cgpaRegex);
        if (match) {
          isMet = true;
          evidenceSnippet = match[0].trim();
          explanation = `Documented academic standing: "${match[0].trim()}".`;
        } else {
          for (const pat of signal.patterns) {
            if (eduSection.includes(pat.toLowerCase()) || lowerResume.includes(pat.toLowerCase())) {
              isMet = true;
              evidenceSnippet = pat;
              explanation = `Academic consistency signal noted: "${pat}".`;
              break;
            }
          }
        }
        if (!isMet) {
          explanation = 'Degree CGPA / aggregate percentage not explicitly stated in education section.';
        }
        break;
      }

      case 'branch_fundamentals': {
        // Detect non-CS branch from signal config
        const textToScan = eduSection || lowerResume;
        const nonCsBranches = signal.nonCsBranches || [];
        const csBranches = signal.csBranches || [];
        const isNonCs = nonCsBranches.some((b) => textToScan.includes(b.toLowerCase()));
        const isCs = csBranches.some((b) => textToScan.includes(b.toLowerCase()));

        // Scan for core CS fundamentals
        const foundFundamentals: string[] = [];
        for (const pat of signal.patterns) {
          if (lowerResume.includes(pat.toLowerCase())) {
            foundFundamentals.push(pat);
          }
        }

        if (isNonCs) {
          if (foundFundamentals.length >= 2) {
            isMet = true;
            evidenceSnippet = foundFundamentals.slice(0, 3).join(', ');
            explanation = `Non-CS engineering branch successfully bridged with core CS fundamentals (${evidenceSnippet}).`;
          } else {
            isMet = false;
            explanation = `Non-CS branch detected without sufficient core CS coursework (OS, DBMS, Networks, DSA).`;
          }
        } else {
          // CS branch or standard branch
          if (foundFundamentals.length > 0 || isCs) {
            isMet = true;
            evidenceSnippet = foundFundamentals.length > 0 ? foundFundamentals.slice(0, 3).join(', ') : 'Computer Science Degree';
            explanation = `Core CS academic alignment verified.`;
          } else {
            isMet = true;
            explanation = `Standard degree background.`;
          }
        }
        break;
      }

      case 'pattern':
      default: {
        const matches: string[] = [];
        for (const pat of signal.patterns) {
          const patLower = pat.toLowerCase();
          // Check bullets and experience
          const inBullets = bullets.some((b) => b.rawText.toLowerCase().includes(patLower));
          const inExp = expSection.includes(patLower) || projSection.includes(patLower);
          if (inBullets || inExp) {
            matches.push(pat);
          }
        }

        if (matches.length > 0) {
          isMet = true;
          evidenceSnippet = matches.slice(0, 3).join(', ');
          explanation = `Demonstrated ${signal.label.toLowerCase()} in project/work bullets (${evidenceSnippet}).`;
        } else {
          isMet = false;
          explanation = `Missing clear evidence of ${signal.label.toLowerCase()} in bullet points.`;
        }
        break;
      }
    }

    const earnedScore = isMet ? signal.weight : 0;
    evaluatedSignals.push({
      id: signal.id,
      label: signal.label,
      description: signal.description,
      weight: signal.weight,
      earnedScore,
      isMet,
      evidenceSnippet,
      explanation,
    });
  }

  const signalsTotalScore = evaluatedSignals.reduce((acc, s) => acc + s.earnedScore, 0);
  const signalsMaxScore = evaluatedSignals.reduce((acc, s) => acc + s.weight, 0);
  const signalsRatio = signalsMaxScore > 0 ? signalsTotalScore / signalsMaxScore : 1.0;

  // Evaluate advice cards from config
  const signalMap = new Map(evaluatedSignals.map((s) => [s.id, s]));
  const activeAdviceCards = profile.adviceCards.filter((card) => {
    if (card.condition === 'always') return true;
    if (card.condition === 'missing_signal' && card.signalId) {
      const sig = signalMap.get(card.signalId);
      return sig ? !sig.isMet : false;
    }
    if (card.condition === 'low_score') {
      return signalsRatio < 0.6;
    }
    return false;
  });

  const explanation = `${profile.displayName} mode (~${candidateYears} YOE): ${
    isUserOverride ? 'Selected by user override.' : 'Inferred from detected experience span.'
  } Evaluated ${evaluatedSignals.length} core level signals (${signalsTotalScore}/${signalsMaxScore} pts).`;

  return {
    detectedLevel: profile.id,
    displayName: profile.displayName,
    typicalBarText: profile.typicalBarText,
    isUserOverride,
    scoredSignals: evaluatedSignals,
    signalsTotalScore,
    signalsMaxScore,
    signalsRatio,
    activeAdviceCards,
    explanation,
  };
}
