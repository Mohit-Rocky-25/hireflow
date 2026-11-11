# HireFlow Design System Specification

## 1. Overview and Design Principles

The HireFlow design system is an engineered, accessible, token-driven visual framework built for high-density technical career workflows. It enforces mathematical contrast guarantees, client-side zero-egress font delivery, fluid responsive typography, deterministic spacing scales, and strict accessibility compliance (WCAG 2.2 AA / AAA).

### Core Directives
1. Design Tokens as Single Source of Truth: All visual primitives (color, typography, space, elevation, motion) are governed by semantic CSS custom properties defined in `src/styles/tokens.css`.
2. High-Contrast Legibility: The default theme couples an OLED-grade near-black background (`oklch(0.12 0.005 260)`) with a high-contrast Neon Volt accent (`#FAFF69` / `oklch(0.96 0.21 108.5)`) and pure white text (`#FFFFFF`), delivering contrast ratios exceeding 16:1.
3. System Accessibility: All interactive controls satisfy WCAG 2.2 target criteria (minimum 44x44px touch targets on mobile, visible 2px focus-visible rings with 2px offset, full keyboard navigation, and reduced-motion fallbacks).
4. Zero Egress: Fonts are self-hosted via npm (`@fontsource-variable/*`) and bundled directly by Vite. No external runtime network requests are executed.

---

## 2. Color System

### Semantic Token Architecture
Tokens decouple UI components from raw color literals. Components consume semantic variables that resolve appropriately across dark and light modes.

| Token | Dark Value | Light Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| `--color-background` | `oklch(0.12 0.005 260)` | `oklch(0.985 0.003 260)` | Canvas background |
| `--color-surface` | `oklch(0.16 0.008 260)` | `oklch(0.96 0.005 260)` | Primary container cards, sidebars |
| `--color-surface-2` | `oklch(0.20 0.010 260)` | `oklch(0.92 0.008 260)` | Secondary cards, dropdown menus, table rows |
| `--color-surface-3` | `oklch(0.25 0.012 260)` | `oklch(0.86 0.010 260)` | Input backgrounds, active row states |
| `--color-border` | `oklch(0.28 0.012 260)` | `oklch(0.82 0.010 260)` | Subtle section dividing lines, card borders |
| `--color-border-strong` | `oklch(0.40 0.015 260)` | `oklch(0.65 0.015 260)` | Focus rings, active tabs, prominent boundaries |
| `--color-foreground` | `oklch(0.98 0 0)` | `oklch(0.15 0.010 260)` | Primary body copy, headers, active titles |
| `--color-text-secondary` | `oklch(0.75 0.010 260)` | `oklch(0.38 0.015 260)` | Subtitles, labels, secondary metadata |
| `--color-text-muted` | `oklch(0.55 0.010 260)` | `oklch(0.50 0.015 260)` | Placeholder text, inactive icons, timestamps |
| `--color-primary` | `#FAFF69` | `#4B5500` | Primary interactive accent, button fills |
| `--color-primary-foreground`| `#000000` | `#FFFFFF` | Text on top of primary button fills |
| `--color-success` | `oklch(0.72 0.17 145)` | `oklch(0.45 0.15 145)` | Validations, score improvements, passing checks |
| `--color-warning` | `oklch(0.78 0.16 75)` | `oklch(0.52 0.16 75)` | Moderate score warnings, advisory notices |
| `--color-danger` | `oklch(0.65 0.22 25)` | `oklch(0.50 0.20 25)` | Critical score blockers, error states, destructive |
| `--color-info` | `oklch(0.72 0.14 230)` | `oklch(0.48 0.14 230)` | Informational badges, citations, guidelines |

### Contrast Verification Ratios
All color pairs pass WCAG 2.2 AA / AAA automated verification via `scripts/audit-contrast.mjs`:
- Text Primary on Background: 17.77:1 (Target: >= 7.0:1 AAA)
- Text Secondary on Background: 8.04:1 (Target: >= 4.5:1 AA)
- Text on Accent: 17.32:1 (Target: >= 4.5:1 AA)
- Success Text on Background: 11.10:1 (Target: >= 4.5:1 AA)
- Warning Text on Background: 12.79:1 (Target: >= 4.5:1 AA)

---

## 3. Typography System

### Font Stack
- Display: `Bricolage Grotesque Variable`, sans-serif (Page titles, hero metrics, prominent headlines)
- Body: `IBM Plex Sans Variable`, sans-serif (Paragraphs, descriptions, form labels, data grids)
- Monospace: `JetBrains Mono Variable`, monospace (ATS match scores, code snippets, keyword tags, salary numbers)

### Fluid Type Scale (CSS Clamp Roles)
Fluid typography adapts proportionally between a mobile viewport baseline ($375\text{px}$) and desktop viewports ($1440\text{px}$+):

| Role Class | Clamp Formula | Computed Range | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.text-role-display` | `clamp(2.0rem, 1.6rem + 2.0vw, 3.25rem)` | 32px - 52px | 1.1 | -0.03em | 800 |
| `.text-role-h1` | `clamp(1.6rem, 1.3rem + 1.5vw, 2.5rem)` | 26px - 40px | 1.15 | -0.025em | 700 |
| `.text-role-h2` | `clamp(1.35rem, 1.15rem + 1.0vw, 1.875rem)` | 22px - 30px | 1.2 | -0.02em | 700 |
| `.text-role-h3` | `clamp(1.15rem, 1.05rem + 0.5vw, 1.375rem)` | 18px - 22px | 1.25 | -0.015em | 600 |
| `.text-role-h4` | `clamp(1.0rem, 0.95rem + 0.25vw, 1.125rem)` | 16px - 18px | 1.3 | -0.01em | 600 |
| `.text-role-body-lg` | `clamp(1.05rem, 1.0rem + 0.25vw, 1.125rem)` | 17px - 18px | 1.5 | normal | 400 |
| `.text-role-body` | `1rem` | 16px | 1.5 | normal | 400 |
| `.text-role-body-sm` | `0.875rem` | 14px | 1.5 | normal | 400 |
| `.text-role-caption` | `0.75rem` | 12px | 1.4 | normal | 500 |
| `.text-role-overline` | `0.6875rem` | 11px | 1.4 | +0.06em | 700 |
| `.text-role-mono-data` | `0.8125rem` | 13px | 1.4 | -0.01em | 600 |

---

## 4. Spacing, Elevation, and Geometry

### Spacing Scale
The spacing system adheres to an 8-point geometric scale (with a 4px half-step for micro-alignment):
- `4px`: Micro-gaps between icon and label, tag padding.
- `8px`: Dense list item padding, compact input padding.
- `12px`: Standard form input internal padding.
- `16px`: Standard card padding, component gap.
- `24px`: Section gap, modal padding.
- `32px`: Page header bottom margin, column grid gap.
- `48px`: Major section boundary separation.
- `64px`: Viewport top/bottom page gutter.
- `96px`: Hero banner vertical separation.

### Border Radius
- `--radius-sm`: `6px` (Badges, tags, chips)
- `--radius-md`: `10px` (Inputs, buttons, dropdowns)
- `--radius-lg`: `14px` (Cards, panels, tabs)
- `--radius-xl`: `20px` (Modals, drawers, hero banners)
- `--radius-full`: `9999px` (Status indicators, avatar pills)

### Elevation & Shadows
HireFlow avoids multi-layer blurry shadow stacking, relying primarily on 1px borders (`--color-border`) and two calibrated elevations:
- `--shadow-1`: `0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)` (Cards, dropdowns)
- `--shadow-2`: `0 4px 16px -2px rgba(0, 0, 0, 0.35), 0 2px 6px -2px rgba(0, 0, 0, 0.25)` (Modals, popovers, drawers)

---

## 5. Interaction States and Motion System

### Animation & Transition Tiers
Interaction transitions follow 4 precise duration budgets:
- Tier 1 (90ms): Micro-press, button active down-press (`transform: scale(0.98)`).
- Tier 2 (150ms): Hover state transitions (color, border-color, shadow).
- Tier 3 (220ms): State toggles (tabs, checkboxes, expandable accordions).
- Tier 4 (320ms): Structural transitions (modal fade-ins, drawer slides).

### Reduced Motion Override
When the user specifies `prefers-reduced-motion: reduce`:
- Animations (`keyframes`) are disabled (`animation: none !important`).
- Transitions are set to instant (`transition-duration: 0.01ms !important`).
- Layout scale transforms are suppressed.

### Focus Ring Standards
All focusable controls display:
`outline: 2px solid var(--color-border-strong); outline-offset: 2px;`
Never suppress outline on `:focus-visible` without providing an equivalent token-based ring.

---

## 6. Shared Component Primitives (`src/components/ui/Components.tsx`)

| Primitive | Available Variants | Key States Handled | Accessibility Features |
| :--- | :--- | :--- | :--- |
| `Button` | `primary`, `secondary`, `outline`, `ghost`, `danger` | Idle, Hover, Active, Disabled, Loading | `aria-busy`, disabled semantics, touch target >= 44px |
| `Input` | Default text, email, number | Idle, Focus, Error, Disabled | `aria-invalid`, `aria-describedby` link to error |
| `Select` | Dropdown picker | Idle, Focus, Open, Disabled | Keyboard navigable, contrast verified options |
| `Textarea` | Multi-line text field | Idle, Focus, Error, Disabled | Resizable control, character count accessible label |
| `Field` | Form field wrapper | Normal, Error, Required | Associates label with input id, renders hint/error |
| `Badge` | `default`, `success`, `warning`, `danger`, `info` | Static / Interactive | `role="status"`, color contrast >= 4.5:1 |
| `Card` | `default`, `interactive`, `highlighted` | Hover, Active, Focus-within | Semantic sectioning container |
| `StatCard` | Metric visualizer | Static | High-contrast numbers, trend indicator |
| `Tabs` | Tab navigation strip | Active tab, Inactive tab | `role="tablist"`, `aria-selected`, arrow key navigation |
| `Modal` | Dialog overlay | Open, Closing, Closed | `role="dialog"`, focus trap, escape key dismissal, restore focus |
| `EmptyState` | Empty data fallback | Static with Action | Action button, clear descriptive heading |
| `ErrorState` | Error fallback | Static with Retry Action | `role="alert"`, retry callback trigger |
| `Callout` | `info`, `warning`, `danger`, `success` | Dismissible / Permanent | `role="note"` / `role="alert"`, distinct icon badge |
| `Skeleton` | Content loading placeholder | Shimmering wave | `aria-hidden="true"`, accessible loading container |
| `ScoreMeter`| 0-100 numerical gauge | Static | `role="progressbar"`, `aria-valuenow`, calibrated bands |

---

## 7. Banned Design Patterns (Anti-Slop Guidelines)

The codebase strictly disallows the following fragile styling patterns:
1. R-SLOP-1: No arbitrary hex colors outside `tokens.css` and `tokens.ts`.
2. R-SLOP-2: No arbitrary Tailwind pixel font sizes (e.g. `text-[13px]`); use fluid `.text-role-*` or standard Tailwind scale (`text-xs`, `text-sm`, etc.).
3. R-SLOP-3: No `backdrop-filter: blur(...)` or transparent frosted glass surfaces that destroy text legibility on dark canvases.
4. R-SLOP-4: No decorative multi-stop gradients across text (`bg-clip-text text-transparent`) or buttons.
5. R-SLOP-5: No arbitrary outer glow effects (`box-shadow: 0 0 20px #...`).
6. R-SLOP-6: No emojis (`🚀`, `🔥`, `★`, `✓`, `🎯`, `⚡`) in UI text, code comments, tests, or documentation. Use Lucide SVG icons.
7. R-SLOP-7: No hardcoded padding/margin odd pixel overrides (`p-[17px]`); adhere strictly to the 8pt spacing grid.
8. R-SLOP-8: No non-semantic buttons implemented as raw unstyled `<div>` or `<span>` without keyboard handlers and ARIA attributes.

---

## 8. Verification Commands

To guarantee design token integrity and contrast compliance across development and deployment pipelines:

```bash
# Verify design tokens and ensure zero undeclared arbitrary values exist
npm run check:tokens

# Audit WCAG 2.2 contrast across dark and light themes
npm run audit:contrast

# Verify zero runtime network egress
npm run privacy:check

# Run full test suite including primitive unit and accessibility tests
npm test
```

