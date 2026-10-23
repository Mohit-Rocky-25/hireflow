# HireFlow Design System v2 Specification

This document serves as the single source of truth for the visual design system of HireFlow, inspired by the high-contrast obsidian aesthetic in `DESIGN.md`.

---

## 1. Design Tokens

### Color Palette

| Token Name | Value | Role & Usage |
|------------|-------|--------------|
| `--color-volt` (`#faff69`) | `#faff69` | Signature acid yellow-green accent. Primary CTAs, active highlights, link hover, focus ring, selected card borders. |
| `--color-forest` (`#166534`) | `#166534` | Deep forest green. Secondary CTA buttons ("Get Started", conversion actions) with white text ONLY. |
| `--color-forest-dark` (`#14572f`) | `#14572f` | Dark forest variant for borders and secondary accents. |
| `--color-pale-yellow` (`#f4f692`) | `#f4f692` | Active/pressed text state color. Provides subdued chromatic feedback. |
| `--color-olive-border` (`#4f5100`) | `#4f5100` | Dark olive border for ghost buttons. |
| `--color-olive-dark` (`#161600`) | `#161600` | Darkest neon-tinted surface for subtle status containers. |
| `--color-black` (`#000000`) | `#000000` | Absolute page background canvas across all routes and sections. |
| `--color-near-black` (`#141414`) | `#141414` | Slightly elevated card surfaces, button backgrounds, inputs. |
| `--color-charcoal` (`rgba(65,65,65,0.8)`) | `rgba(65, 65, 65, 0.8)` | Primary workhorse border color for cards, tables, and containers. |
| `--color-charcoal-deep` (`#343434`) | `#343434` | Divider lines and subtle component borders. |
| `--color-hover-gray` (`#3a3a3a`) | `#3a3a3a` | Dark button hover state background. |
| `--color-white` (`#ffffff`) | `#ffffff` | Primary text on dark surfaces (21:1 AAA contrast on black). |
| `--color-silver` (`#a0a0a0`) | `#a0a0a0` | Secondary text, captions, metadata (8:1 AA contrast on black). |
| `--color-danger` (`#f87171` / `#ef4444`) | `#f87171` | Muted red for errors and destructive actions (passes 4.5:1 AA contrast). |

### Strict Border Radius Scale

Only three radius values exist in the entire design system:

- **4px** (`--radius-sm`, `--radius-md`, `rounded-sm`, `rounded-md`): Buttons, badges, tags, chips, input fields, code blocks.
- **8px** (`--radius-lg`, `--radius-xl`, `rounded-lg`, `rounded-xl`): Cards, containers, modals, dialogs, drawers.
- **9999px** (`--radius-full`, `rounded-full`): Status pills, toggles, avatar indicators.

*No 12px, 16px, 24px or arbitrary rounded corners are permitted.*

### Elevation & Depth System

| Level | Treatment | Application |
|-------|-----------|-------------|
| Level 0 (Flat) | No shadow | Pure black canvas (`#000000`), text blocks |
| Level 1 (Bordered) | `1px solid rgba(65,65,65,0.8)` | Standard cards, containers, tables |
| Level 2 (Subtle) | `0px 1px 3px rgba(0,0,0,0.1)` | Subtle card surface lift |
| Level 3 (Elevated) | `0px 10px 15px -3px rgba(0,0,0,0.1)` | Hover states, dropdown menus |
| Level 4 (Pressed/Inset) | `0px 4px 25px rgba(0,0,0,0.14) inset` | Active/pressed buttons, tabs, segmented controls |
| Level 5 (Neon Border) | `1px solid #faff69` | Featured cards, active selection, primary emphasis |

### Transitions & Motion

- Duration: `120ms` to `180ms` with `ease-out`.
- Animated properties: `color`, `background-color`, `border-color`, `opacity`. No bouncing, scaling, parallax, or glowing blurs.
- Reduced Motion: Full override with `animation-duration: 0.01ms` and `transition-duration: 0.01ms` when `prefers-reduced-motion: reduce`.

---

## 2. Typography Map

### Font Families
- **Sans-serif (Primary & Display)**: `'Inter Variable', 'Inter', system-ui, -apple-system, Arial, sans-serif` (Self-hosted via `@fontsource-variable/inter`).
- **Monospace (Code & Commands)**: `'Inconsolata', ui-monospace, Consolas, monospace` (Self-hosted via `@fontsource/inconsolata`).
- *Basier is replaced by Inter 600.*

### Marketing Scale (Landing Hero & Section Heroes Only)

| Role | Font | Size | Weight | Line Height | Tracking |
|------|------|------|--------|-------------|----------|
| Display Mega | Inter | 96px (responsive: 96 → 72 → 48 → 36) | 900 (Black) | 1.00 | tight (-0.02em) |
| Display Hero | Inter | 72px (responsive: 72 → 48 → 36) | 700 (Bold) | 1.00 | tight (-0.02em) |
| Hero Subtitle | Inter | 18px–20px | 400 | 1.50 | normal |
| Oversized Stats | Inter | 72px+ (48px mobile) | 700–900 | 1.00 | tight |

### App Scale (Tools, Dense Workspaces, Management Screens)

| Role | Font | Size | Weight | Line Height | Tracking | Notes |
|------|------|------|--------|-------------|----------|-------|
| Page Title | Inter | 36px | 700 | 1.20 | -0.01em | Primary tool page title |
| Section Heading | Inter | 24px | 700 | 1.25 | -0.01em | Tool section headers |
| Card Title | Inter | 20px | 600 | 1.30 | normal | Card titles |
| Body | Inter | 16px | 400 | 1.50 | normal | Standard readable copy |
| Caption | Inter | 14px | 400–500 | 1.43 | normal | Secondary text & descriptions |
| Uppercase Label | Inter | 14px | 600 | 1.43 | 1.4px | Section overlines, category headers |
| Small | Inter | 12px | 500 | 1.33 | normal | Minimum standard UI text |
| Micro | Inter | 11px–12px | 500 | 1.50 | normal | Status tags, tiny indicators |
| Code | Inconsolata | 14px–16px | 600 | 1.50 | normal | Code snippets & formula tokens |

---

## 3. Deliberate Deviations from DESIGN.md

Where the project requirements and `DESIGN.md` differ, the project requirements supersede. The following deliberate deviations are established:

1. **Danger Color Hue**:
   - *Reason*: `DESIGN.md` defines only black, volt, forest green, and charcoal neutrals. For destructive actions (e.g., delete scan, reset data) and critical validation errors, a muted red (`#f87171` / `#ef4444`) is permitted.
   - *Constraint*: It is strictly used for errors and destructive actions, always accompanied by an icon and descriptive text label. On pure black, `#f87171` achieves 6.6:1 contrast (exceeding WCAG AA).

2. **Success & Warning States**:
   - *Reason*: No additional green or yellow hues.
   - *Implementation*: Success is rendered via Neon Volt (`#faff69`) text + checkmark icon + text label. Warning is rendered via Pale Yellow (`#f4f692`) text + alert triangle icon + text label.

3. **Forest Green Usage Restriction**:
   - *Reason*: Forest green (`#166534`) on black canvas fails WCAG AA text contrast (~2.2:1).
   - *Implementation*: Forest green is restricted strictly to button backgrounds with pure white (`#ffffff`) text (5.8:1 contrast). It is NEVER used as text or icon color directly on black.

4. **Universal Focus Ring**:
   - *Reason*: WCAG 2.1 AA accessibility requirement.
   - *Implementation*: 2px solid Neon Volt outline with 2px offset on all keyboard-focused interactive elements (`*:focus-visible`).

5. **Charts & Heatmaps (Career Trajectory & Analytics)**:
   - *Reason*: Absolute accessibility; avoid colorblind confusion.
   - *Implementation*: Single-hue luminance ramp (`#343434` charcoal → `#a0a0a0` silver → `#ffffff` white → `#f4f692` pale yellow → `#faff69` volt). Meaning is never conveyed by color alone; value labels and legends are always present.

6. **Progress & Score Meters**:
   - *Reason*: Maintain visual calm.
   - *Implementation*: Neon Volt is an accent, not a massive solid fill. Progress bars are kept thin (2–4px) or formatted with oversized white numbers with a volt border highlight.

---

## 4. Derived Components (Not in DESIGN.md)

`DESIGN.md` does not specify form controls. The following components are derived consistently using the design system primitives:

- **Input / Textarea**:
  - Background: Near Black (`#141414`)
  - Border: 1px solid Charcoal (`rgba(65, 65, 65, 0.8)`)
  - Radius: 4px
  - Text: Pure White (`#ffffff`)
  - Placeholder: Silver (`#a0a0a0`)
  - Focus: 1px Neon Volt border + 2px focus ring
  - Error: 1px Danger border + error message with icon

- **Select Dropdown**:
  - Near Black surface, charcoal border, 4px radius, custom chevron.

- **Checkbox & Radio**:
  - 16px square/circle with charcoal border; checked state fills with Neon Volt and dark icon.

- **Modal / Drawer**:
  - Background: Pure Black (`#000000`)
  - Border: 1px solid Charcoal (`rgba(65, 65, 65, 0.8)`)
  - Radius: 8px
  - Backdrop: Pure black overlay at 80% opacity (`rgba(0,0,0,0.8)`).

---

## 5. Do's and Don'ts

### Do
- Keep the entire canvas on pure black (`#000000`) — never dark gray.
- Use Neon Volt (`#faff69`) as an accent and CTA — never as a giant background banner.
- Use Inter Black (weight 900) for hero display headlines.
- Use Charcoal borders (`rgba(65, 65, 65, 0.8)`) for all container containment.
- Apply inset shadow Level 4 on active/pressed states.
- Hover all links to Neon Volt (`#faff69`).
- Display performance stats as oversized numbers (72px+ / weight 700–900).

### Don't
- Don't use light/white backgrounds anywhere.
- Don't use soft diffused box shadows.
- Don't round corners beyond 8px (except 9999px pills).
- Don't use gradients, blurs, glow effects, or parallax.
- Don't show fake social proof or uncomputed metrics.
- Don't use ClickHouse logos, branding, or marks.
