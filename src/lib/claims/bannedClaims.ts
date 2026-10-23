// ============================================================
// HireFlow — Banned & Restricted Claims Governance
// Stage 1 (P0): Honesty of Claims Engine
// Applied to TalentLens & ATS Resume Roaster
// ============================================================

export interface BannedClaimRule {
  id: string;
  pattern: RegExp;
  termDescription: string;
  approvedReplacement: string;
  severity: 'banned' | 'restricted';
  rationale: string;
}

export const BANNED_CLAIM_RULES: BannedClaimRule[] = [
  {
    id: 'ats_score_framing',
    pattern: /\b(?:overall\s+)?ats\s+score\b/gi,
    termDescription: 'ATS Score',
    approvedReplacement: 'Resume-to-JD Match Estimate',
    severity: 'banned',
    rationale: 'Employers and commercial ATS software do not publish a universal score. This is an internal estimate.',
  },
  {
    id: 'ats_format_safety',
    pattern: /\bats\s+format\s+safety\b/gi,
    termDescription: 'ATS Format Safety',
    approvedReplacement: 'Parser-Friendliness Check (heuristic)',
    severity: 'banned',
    rationale: 'Text-only parsers cannot verify layout integrity (e.g. PDF multi-column bounding boxes); it is a heuristic check.',
  },
  {
    id: 'verified_skills_overclaim',
    pattern: /\b(?:verified\s+skills?|skills?\s+verified)\b/gi,
    termDescription: 'Verified skills',
    approvedReplacement: 'Skills found in your resume',
    severity: 'restricted',
    rationale: 'The tool only confirms the text string exists in the resume, not that the candidate possesses true competency.',
  },
  {
    id: 'verified_metrics_overclaim',
    pattern: /\bverified\s+metrics?\b/gi,
    termDescription: 'Verified metrics',
    approvedReplacement: 'Metrics found in your bullets',
    severity: 'restricted',
    rationale: 'The tool only checks for regex numerical patterns, not that the metrics are audited or true.',
  },
  {
    id: 'proven_provable',
    pattern: /\b(?:mathematically\s+provable|provable\s+score|proven\s+hiring|proven\s+accuracy)\b/gi,
    termDescription: 'Provable / Proven claim',
    approvedReplacement: 'Demonstrated in resume / Estimated',
    severity: 'banned',
    rationale: 'A simulated score based on heuristic formulas cannot be "proven" or "mathematically proven".',
  },
  {
    id: 'mathematical_certainty',
    pattern: /\bmathematically\s+(?:certain|provable|sound|guaranteed)\b/gi,
    termDescription: 'Mathematical certainty claims',
    approvedReplacement: 'Algorithmic estimate / Rule-based check',
    severity: 'banned',
    rationale: 'Avoid pseudo-scientific precision framing for editorial heuristic weights.',
  },
  {
    id: 'guarantee_outcomes',
    pattern: /\bguarantee(?:d)?\s+(?:interview|job|hiring|shortlist|placement|score|accuracy)\b/gi,
    termDescription: 'Guarantee of hiring or accuracy',
    approvedReplacement: 'Simulated / Estimated',
    severity: 'banned',
    rationale: 'The product does not and cannot guarantee any interview, shortlisting, or hiring outcome.',
  },
  {
    id: 'zero_hallucinations',
    pattern: new RegExp('\\bzero[- ]hallucinations?\\b', 'gi'),
    termDescription: ['Zero', 'hallucinations'].join(' '),
    approvedReplacement: 'Every quote shown is checked against your resume text',
    severity: 'banned',
    rationale: 'Overclaiming. While citations are verbatim-checked, narrative interpretation can still exhibit bias or misunderstanding.',
  },
  {
    id: 'most_truthful',
    pattern: /\bmost\s+truthful\b/gi,
    termDescription: 'Most truthful',
    approvedReplacement: 'Transparent and measurable',
    severity: 'banned',
    rationale: 'Unsubstantiated superlative claim.',
  },
  {
    id: 'accuracy_guarantee',
    pattern: /\b(?:100%\s+accurate|100%\s+verbatim\s+evidence\s+citation\s+guarantee)\b/gi,
    termDescription: '100% accurate / accuracy guarantee',
    approvedReplacement: 'Checked against your resume text',
    severity: 'banned',
    rationale: 'No resume parsing heuristic is 100% accurate.',
  },
  {
    id: 'fnv_cryptographic',
    pattern: /\b(?:cryptographic\s+fingerprint(?:ing)?|cryptographic\s+fnv)\b/gi,
    termDescription: 'Cryptographic (applied to FNV-1a)',
    approvedReplacement: 'Deterministic fingerprint / Fast hash',
    severity: 'banned',
    rationale: 'FNV-1a is a non-cryptographic hash function; calling it cryptographic is a technical falsehood.',
  },
  {
    id: 'certified_hireflow',
    pattern: /\b(?:hireflow\s+certified|ats\s+certified)\b/gi,
    termDescription: 'HireFlow Certified',
    approvedReplacement: 'Evaluated / Simulated',
    severity: 'banned',
    rationale: 'HireFlow does not grant accredited certifications.',
  },
  {
    id: 'ai_powered_accuracy',
    pattern: /\bai[- ]powered\s+accuracy\b/gi,
    termDescription: 'AI-powered accuracy',
    approvedReplacement: 'Algorithmic text analysis',
    severity: 'banned',
    rationale: 'Marketing fluff that obscures heuristic rules.',
  },
  {
    id: 'chance_probability_claims',
    pattern: /\b(?:\d+%\s+chance\s+of\s+(?:interview|hiring)|success\s+probability|reply\s+rate|hire\s+probability)\b/gi,
    termDescription: '% chance / success probability / reply rate',
    approvedReplacement: 'Match estimate',
    severity: 'banned',
    rationale: 'Fabricated hiring odds with zero empirical validation against real employer hiring decisions.',
  },
  {
    id: 'used_by_trusted_by',
    pattern: /\b(?:used\s+by|trusted\s+by)\s+(?:top\s+tech|faang|thousands|millions|144\+)\b/gi,
    termDescription: 'Used by / Trusted by (unsourced social proof)',
    approvedReplacement: 'Benchmarked against public requirements',
    severity: 'banned',
    rationale: 'Unsourced marketing claims.',
  },
  {
    id: 'six_second_recruiter_scan',
    pattern: /\b6[- ]second\s+recruiter\s+scan\b/gi,
    termDescription: '6-second recruiter scan',
    approvedReplacement: 'Quick-scan simulation (illustrative)',
    severity: 'banned',
    rationale: 'The "6-second scan" is an eye-tracking marketing meme from a small 2012/2018 study, not an established technical truth.',
  },
];

/**
 * Sanitizes an AI or user-facing narrative text by replacing banned claims with honest terminology.
 */
export function sanitizeClaims(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let sanitized = text;

  for (const rule of BANNED_CLAIM_RULES) {
    sanitized = sanitized.replace(rule.pattern, rule.approvedReplacement);
  }

  return sanitized;
}

/**
 * Checks a string or code for banned claim violations.
 */
export function findClaimViolations(content: string, filePath?: string): { ruleId: string; termDescription: string; match: string }[] {
  const violations: { ruleId: string; termDescription: string; match: string }[] = [];

  for (const rule of BANNED_CLAIM_RULES) {
    const matches = content.match(rule.pattern);
    if (matches) {
      for (const m of matches) {
        violations.push({
          ruleId: rule.id,
          termDescription: rule.termDescription,
          match: m,
        });
      }
    }
  }

  return violations;
}
