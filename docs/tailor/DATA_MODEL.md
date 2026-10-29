# HireFlow Resume Data Model — Tailor My Resume (v4.0.0)

## Overview

The HireFlow Resume data model is organized into two primary layers:
1. **The Ground-Truth Layer**: Append-only fact ledger, candidate facts, and target job criteria.
2. **The Document & Layout Layer**: Structured resume document tree, geometric layout blocks in points, and export verification artifacts.

---

## 1. Fact Ledger & Candidate Truth

### `Fact`
Represents an atomic, confirmed or unconfirmed candidate claim.

```typescript
export interface Fact {
  id: string;                         // Canonical fact identifier (e.g. f_exp_12)
  version: number;                    // 1-based version index in append-only history
  source: 'user' | 'imported';        // Source provenance
  confirmed: boolean;                 // P1: Must be explicitly true to render
  kind: 'experience' | 'education' | 'project' | 'skill' | 'certification';
  action: string;                     // Primary action verb (e.g. "Engineered")
  object: string;                     // Core deliverable or object
  tech: string[];                     // Normalized technical concepts
  evidence?: {
    type: 'metric' | 'link' | 'artifact' | 'credential';
    value: string;                    // e.g. "45,000 req/sec", "sub-50ms"
  };
  ownership?: OwnershipTier;          // P3: 1 Supported .. 5 Set Direction
  hash: string;                       // Pure synchronous FNV-1a content hash
  createdAt: string;                  // Deterministic ISO-8601 timestamp
  supersededBy?: string;              // Points to newer version if edited
}
```

### `OwnershipTier`
```typescript
export type OwnershipTier = 1 | 2 | 3 | 4 | 5;
// 1 = Supported / Assisted
// 2 = Contributed a part / Implemented
// 3 = Owned a deliverable / Engineered
// 4 = Led a workstream / Spearheaded
// 5 = Set direction / Championed
```

### `AppendOnlyFactLedger`
Maintains fact history without ever deleting or mutating previous entries.
- `addFact(input)`: Generates synchronous FNV-1a hash, sets `version = 1`.
- `editFact(factId, updates)`: Appends new version $V+1$, links previous as `supersededBy`.
- `confirmFact(factId, confirmed)`: Marks fact confirmed for rendering.
- `setOwnershipTier(factId, tier)`: Sets declared ownership ladder tier.
- `renderableFacts()`: Returns latest confirmed facts with declared ownership tier.

---

## 2. Target Job Criteria

### `Target` and `TargetRequirement`
```typescript
export interface TargetRequirement {
  id: string;
  text: string;
  category: 'skill' | 'responsibility' | 'education' | 'experience' | 'certification';
  priority: 'MANDATORY' | 'PREFERRED';
  weight: number;                     // Weight for JD Coverage % calculation
  canonicalSkillId?: string;
}

export interface Target {
  id: string;
  title: string;
  company: string;
  seniority: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  region: RegionProfileId;
  requirements: TargetRequirement[];
  domainKeywords: string[];
  rawText: string;
  eligibilityCriteria?: {
    hasEligibilityLine: boolean;
    minDegree?: string;
    minCGPA?: number;
    minPercentage?: number;
    eligibleBatches?: number[];
    requiredCertification?: string;
  };
}
```

---

## 3. Resume Document Tree

### `ResumeDocumentTree`
```typescript
export interface ResumeDocumentTree {
  id: string;
  version: number;
  candidate: CandidateIdentity;
  sections: ResumeSection[];
  layoutSettings: LayoutSettings;
  target?: Target;
  gateResult?: GateResult;
  updatedAt: string;
}

export interface ResumeSection {
  type: SectionType;
  title: string;
  visible: boolean;
  entries: Array<{
    id: string;
    title: string;
    subtitle?: string;
    dates?: string;
    location?: string;
    bullets: Array<{
      factId: string;
      text: string;
      ownershipTier: OwnershipTier;
    }>;
  }>;
  skillsByCategory?: Record<string, string[]>;
  summaryText?: string;
}
```

---

## 4. Geometric Layout Tree (Points)

### `LayoutDocument`
```typescript
export interface LayoutPoint {
  x: number;
  y: number;
}

export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutBlock extends LayoutRect {
  id: string;
  type: 'header-name' | 'header-contact' | 'section-heading' | 'section-rule' | 'entry-title' | 'entry-date' | 'bullet' | 'text';
  text?: string;
  fontSizePt: number;                 // Typography floor >= 9.5 pt
  lineHeightPt: number;
  fontFamily: 'Helvetica' | 'Times-Roman' | 'Courier';
  isBold?: boolean;
  isItalic?: boolean;
  colorHex: string;
  sectionType?: string;
  factId?: string;
}

export interface LayoutPage {
  pageNumber: number;
  widthPt: number;                    // A4 = 595.28 pt, Letter = 612.0 pt
  heightPt: number;                   // A4 = 841.89 pt, Letter = 792.0 pt
  marginsPt: { top: number; bottom: number; left: number; right: number };
  usableWidthPt: number;
  usableHeightPt: number;
  blocks: LayoutBlock[];
}

export interface LayoutDocument {
  id: string;
  template: ResumeTemplateId;
  paperSize: 'a4' | 'letter';
  pages: LayoutPage[];
  totalPageCount: number;
  measuredTotalHeightPt: number;
  generatedAt: string;
}
```
