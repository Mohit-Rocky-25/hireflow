// ============================================================
// HIREFLOW CANONICAL TRUTH GATE TYPES & QUALITY RULES (STAGE 5)
// One Truth Gate, Quality Rules, Two Readouts (JD Coverage % + Checklist) (P8)
// ============================================================

export type GateSeverity = 'BLOCKING' | 'WARNING';

export type GateRuleId =
  // 10 Blocking Rules (G-01 to G-10)
  | 'G-01' // Unconfirmed fact rendered on document tree
  | 'G-02' // Fact without declared candidate ownership tier (1-5)
  | 'G-03' // Unreplaced metric placeholder ([X%], [X], [metric])
  | 'G-04' // Claim strength ladder violation (verb exceeds declared tier)
  | 'G-05' // Invented metric detected (metric absent in confirmed fact)
  | 'G-06' // Missing mandatory identity fields (fullName, email)
  | 'G-07' // Entry with empty organization or primary title
  | 'G-08' // Section without title or negative line budget
  | 'G-09' // Date format violation or invalid historical year (< 1960)
  | 'G-10' // Overlength entry scope line (> 120 chars) or orgContext (> 60 chars)
  // 10 Warning Rules (W-01 to W-10)
  | 'W-01' // Weak opener phrase (responsible for, assisted with)
  | 'W-02' // Unevidenced skill in skills section
  | 'W-03' // Bullet lacks quantifiable metric
  | 'W-04' // Banned buzzword found in summary or bullet
  | 'W-05' // Missing mandatory target requirement
  | 'W-06' // Page overflow warning (content exceeds page capacity)
  | 'W-07' // Regional spelling inconsistency
  | 'W-08' // Overlength bullet (> 200 characters)
  | 'W-09' // Section order differs from recommended sequence without override
  | 'W-10'; // Sub-bullet count in entry exceeds 6 bullets

export interface GateIssue {
  ruleId: GateRuleId;
  severity: GateSeverity;
  message: string;
  location: {
    sectionId?: string;
    entryId?: string;
    factId?: string;
    bulletIndex?: number;
  };
  suggestedFix: string;
}

export interface GateResult {
  passed: boolean;
  blockingCount: number;
  warningCount: number;
  issues: GateIssue[];
  // Readout 1: Deterministic JD coverage percentage
  jdCoveragePct: number;
  // Readout 2: Quality checklist categorized by severity and section
  checklist: {
    blocking: GateIssue[];
    warnings: GateIssue[];
  };
  evaluatedAt: string;
}

