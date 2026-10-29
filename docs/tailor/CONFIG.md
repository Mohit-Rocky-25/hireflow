# HireFlow Canonical Resume Configuration (Rule A1)

In compliance with **Rule A1**, every numerical threshold, margin, weight, and constant used by the resume engines lives canonically in `src/config/resume.ts`. No magic numbers exist in engine code or components.

---

## Configuration Reference (`src/config/resume.ts`)

### 1. Paper Geometry & Dimensions (`DIMENSIONS`)

All layout calculations use typographic points ($72\text{ pt} = 1\text{ in} = 96\text{ CSS px}$).

| Paper Size | Width (Points) | Height (Points) | Width (Pixels @ 96 DPI) | Height (Pixels @ 96 DPI) | Aspect Ratio |
|---|---|---|---|---|---|
| **A4** | $595.28\text{ pt}$ | $841.89\text{ pt}$ | $793.7\text{ px}$ | $1122.5\text{ px}$ | $\approx 1:\sqrt{2}$ |
| **Letter** | $612.00\text{ pt}$ | $792.00\text{ pt}$ | $816.0\text{ px}$ | $1056.0\text{ px}$ | $1:1.294$ |

### 2. Typography Floors & Hierarchy (`TYPOGRAPHY`)

No body text or bullet statement may drop below the $9.5\text{ pt}$ readability floor.

```typescript
export const RESUME_CONFIG = {
  TYPOGRAPHY: {
    MIN_FONT_SIZE_PT: 9.5,            // Hard floor across all templates
    TITLE_FONT_SIZE_PT: 16.0,         // Candidate Name
    HEADING_FONT_SIZE_PT: 11.5,       // Section Heading
    ENTRY_FONT_SIZE_PT: 10.0,         // Role / Degree / Company
    BODY_FONT_SIZE_PT: 9.5,           // Bullets & Content
    DEFAULT_LINE_HEIGHT_RATIO: 1.3,
  },
  // ...
};
```

### 3. Sequence Decision Thresholds (`SEQUENCE`)

```typescript
export const RESUME_CONFIG = {
  // ...
  SEQUENCE: {
    RECENT_GRAD_YEARS_THRESHOLD: 2,   // <= 2 years since graduation triggers R1 (Education early)
    EXPERIENCED_YEARS_THRESHOLD: 3,    // >= 3 years experience triggers R3 (Experience first)
    CAMPUS_BATCH_WINDOW: 1,           // Graduation year window for campus placements
  },
};
```

### 4. Layout Sentinels & Spacing (`SENTINEL`)

```typescript
export const RESUME_CONFIG = {
  // ...
  SENTINEL: {
    MAX_ONE_PAGE_FILL_RATIO: 0.98,    // 98% page height threshold before overflow warning
    WARNING_OVERFLOW_RATIO: 1.05,
    AUTOFIT_MARGIN_STEP_PT: 2.0,      // Point decrement step for auto-fit compaction
    AUTOFIT_FONT_STEP_PT: 0.25,       // Point decrement step down to 9.5 pt floor
  },
};
```
