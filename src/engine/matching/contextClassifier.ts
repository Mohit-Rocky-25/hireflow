// ============================================================
// HireFlow v3 — Context & Negation Classifier (R4.4)
// Bounded window polarity & qualification classification
// ============================================================

export type MentionContextType = 'negated' | 'weak' | 'planned' | 'strong' | 'neutral';

export interface ContextClassification {
  type: MentionContextType;
  triggerPhrase?: string;
}

const NEGATION_PATTERNS = [
  /\bno\s+experience\s+(?:with|in)\b/i,
  /\bnot\s+familiar\s+(?:with)?\b/i,
  /\bnever\s+(?:worked|used|coded)\s+(?:with|in)?\b/i,
  /\bhaven'?t\s+(?:used|worked)\b/i,
  /\bwithout\s+any\s+(?:prior\s+)?experience\b/i,
  /\blacks?\s+(?:experience|knowledge)\b/i,
  /\bno\s+(?:practical\s+)?knowledge\s+of\b/i,
];

const WEAK_PATTERNS = [
  /\bbasic\s+(?:knowledge|understanding|exposure)\b/i,
  /\bfamiliar\s+with\b/i,
  /\bexposure\s+to\b/i,
  /\btheoretical\s+(?:knowledge|understanding)\b/i,
  /\belementary\b/i,
  /\bacademic\s+exposure\b/i,
  /\bintroductory\b/i,
  /\bminimal\s+experience\b/i,
];

const PLANNED_PATTERNS = [
  /\bcurrently\s+(?:learning|studying)\b/i,
  /\blearning\b/i,
  /\bplanning\s+to\s+learn\b/i,
  /\benrolled\s+in\b/i,
  /\baspiring\s+to\s+learn\b/i,
  /\binterested\s+in\s+learning\b/i,
];

const STRONG_PATTERNS = [
  /\b(?:built|developed|deployed|implemented|optimised|optimized|designed|integrated|architected|engineered|scaled|automated|refactored|spearheaded|maintained|authored)\b/i,
];

/**
 * Evaluates the text surrounding a skill mention to detect negation, weak qualifiers, or strong action verbs.
 */
export function classifyMentionContext(
  surroundingWindow: string,
  matchedToken?: string
): ContextClassification {
  if (!surroundingWindow) {
    return { type: 'neutral' };
  }

  // If a matchedToken is provided, isolate the specific clause containing the token
  let activeClause = surroundingWindow;
  if (matchedToken) {
    const clauses = surroundingWindow.split(/\b(?:but|however|although|whereas|yet)\b/i);
    const tokenClause = clauses.find((c) =>
      c.toLowerCase().includes(matchedToken.toLowerCase())
    );
    if (tokenClause) {
      activeClause = tokenClause;
    }
  }

  // 1. Negation (Highest priority: zero credit)
  for (const pattern of NEGATION_PATTERNS) {
    const match = pattern.exec(activeClause);
    if (match) {
      return { type: 'negated', triggerPhrase: match[0] };
    }
  }

  // 2. Planned / In-Progress learning
  for (const pattern of PLANNED_PATTERNS) {
    const match = pattern.exec(activeClause);
    if (match) {
      return { type: 'planned', triggerPhrase: match[0] };
    }
  }

  // 3. Weak / Superficial mentions
  for (const pattern of WEAK_PATTERNS) {
    const match = pattern.exec(activeClause);
    if (match) {
      return { type: 'weak', triggerPhrase: match[0] };
    }
  }

  // 4. Strong Action verbs
  for (const pattern of STRONG_PATTERNS) {
    const match = pattern.exec(activeClause);
    if (match) {
      return { type: 'strong', triggerPhrase: match[0] };
    }
  }

  return { type: 'neutral' };
}
