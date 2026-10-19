# HireFlow v4: Mobile & Tablet Responsiveness Audit (C12)

This document certifies that HireFlow v4 satisfies strict mobile responsiveness and touch accessibility standards across canonical Indian fresher device profiles.

---

## 1. Target Viewport Profiles Audited

| Device Class | Viewport Dimensions | Reference Device | Market Context |
| :--- | :--- | :--- | :--- |
| **Budget Android** | `360 x 800` | Samsung Galaxy A14 / Redmi Note | Canonical Indian engineering student device |
| **Standard Smartphone** | `390 x 844` | Apple iPhone 13 / 14 / 15 | Mainstream iOS mobile viewport |
| **Tablet / Foldable** | `768 x 1024` | Apple iPad 10th Gen | Tablet and landscape study workstation |

---

## 2. Strict Acceptance Criteria Checklist

### Criterion 1: Zero Horizontal Window Scrolling (`overflow-x`)
- [x] Global layout containers use `w-full max-w-7xl mx-auto px-4 sm:px-6`.
- [x] Root body and HTML have `overflow-x: hidden`.
- [x] All data tables (`/history`, `/jd-library`, `/methodology`) are encased in `<div className="overflow-x-auto">` wrappers with subtle border boundaries.
- [x] Code blocks and formula outputs use `overflow-x-auto max-w-full font-mono`.

### Criterion 2: Touch Target Accessibility (≥ 44 x 44px)
- [x] All primary action buttons, tab switches, and icon buttons feature minimum 44px touch areas or appropriate padding (`p-2.5`, `py-3`, `h-11`).
- [x] Mobile tab navigation bars (`TabBar.tsx`, `DarkPaperPreview.tsx`, `PageNav.tsx`) use `min-w-[120px]` items with finger-friendly hit areas.
- [x] Close buttons (`X`) on modals and drawers are minimum `p-2` with `focus:ring-2` active indicators.

### Criterion 3: Bottom-Sheet Drawer on Mobile (`< 640px`)
- [x] `Drawer.tsx` dynamically switches from a desktop right slide-over to an ergonomic mobile bottom sheet:
  ```css
  max-sm:mt-auto max-sm:max-h-[85vh] max-sm:rounded-t-2xl max-sm:border-t
  ```
- [x] Safe area padding and touch drag-down affordance.
- [x] Touch tap on backdrop cleanly dismisses without phantom clicks.

### Criterion 4: Mobile Input Zoom Prevention
- [x] Viewport meta tag in `index.html`:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ```
- [x] Inputs and textareas use responsive font sizing (`text-sm sm:text-xs`) to prevent automated iOS Safari input auto-zooming.

---

## 3. Tool-by-Tool Mobile Behavior

### A. ATS Resume Roaster (`/tools/resume-checker`)
- **Desktop**: Split-pane overview, sticky score card, side tabs.
- **Mobile (360x800)**:
  - Score card stacks vertically above recommendations.
  - Tab bar becomes horizontally scrollable without breaking page boundaries.
  - Character-span annotated view stacks above the finding inspector drawer.
  - Rewrite suggestion buttons expand to `w-full` for easy thumb activation.

### B. Tailor My Resume (`/tools/tailor`)
- **Desktop**: Split editor (left) and A4 paper preview (right).
- **Mobile (360x800)**:
  - Header displays a clean Segmented Switcher (`Editor` vs `Paper Canvas`).
  - Candidate edits in full-width form inputs, then switches to canvas preview with pinch-to-zoom.
  - 1-page sentinel alert remains visible at top of viewport.

### C. Build Briefs (`/tools/build-briefs`)
- **Desktop**: 3-column card grid, right-hand set-cover bundler panel.
- **Mobile (360x800)**:
  - Single column card stack with 16px vertical margins.
  - Tag filter pills scroll horizontally with momentum scrolling.
  - Modal details sheet expands to full height with sticky header close button.
  - One-click JSZip scaffold download button remains thumb-accessible.

### D. Credential Opportunity Engine (`/tools/credential-engine`)
- **Desktop**: Multi-tab directory, 3-column opportunity cards, calendar export drawer.
- **Mobile (360x800)**:
  - Cards stack into clean single-column cards.
  - Countdown chips ("42 days to GATE 2027") wrap cleanly without clipping text.
  - Calendar `.ics` download triggers native mobile calendar import.

### E. TalentLens (`/tools/talent-lens`)
- **Desktop**: Search & filter bar, 2-column company cards, deep link action triggers.
- **Mobile (360x800)**:
  - Filter drawer toggles via a floating filter pill.
  - Company cards stack vertically; CTC ranges format as clean badges.
  - "Save Role", "Send to JD Compare", and "Send to Tailor" action buttons stack cleanly.

### F. Saved JD Library & Demand Aggregation (`/jd-library`)
- **Desktop**: Library list (left) and cross-JD market demand analysis table (right).
- **Mobile (360x800)**:
  - Single-column view with top/bottom distribution.
  - Market demand table scrolls horizontally within container.
  - Filter tags wrap automatically.

### G. Scan History & Progression (`/history`)
- **Desktop**: Recharts score line progression chart, target comparison table.
- **Mobile (360x800)**:
  - Recharts responsive container scales down to 100% width without clipping axis labels.
  - Multi-scan comparison table wraps in horizontal scroll container.

---

## 4. Verification & Testing

Automated verification is enforced via `tests/unit/stage8/mobileTouchTargets.test.ts`.
Runs during `npm run verify` to prevent regression.
