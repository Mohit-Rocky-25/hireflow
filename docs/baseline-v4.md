# HireFlow v4: Baseline Metrics (Stage 0.3)

Captured: 2026-10-19  
Branch: `main` (commit: `633db06`)  
Environment: Windows (AMD), Node.js v24.18.0, Vitest 5.0.3, Vite 8.3.0

---

## 1. Test Suite Baseline

- **Test Command**: `npx vitest run`
- **Test Files**: 75 passed (75 total, 100%)
- **Tests Count**: 617 passed (617 total, 100%)
- **Duration**: 47.83s

---

## 2. Typecheck & Lint Baseline

- **Typecheck Command**: `npm run typecheck` (`tsc --noEmit`)
- **Status**: PASSED (0 errors)
- **Lint Command**: `npm run lint` (`tsc --noEmit`)
- **Status**: PASSED (0 errors)

---

## 3. Production Build & Chunk Sizes Baseline

- **Build Command**: `npm run build` (`tsc && vite build`)
- **Build Time**: 4.75s
- **Output Artifacts**:
  | File | Size (raw) | Size (gzip) |
  |------|------------|-------------|
  | `dist/index.html` | 1.33 kB | 0.71 kB |
  | `dist/assets/pdf.worker.min-Dkey6ZUl.mjs` | 1,321.30 kB | - |
  | `dist/assets/index-3x6N6oG_.css` | 257.47 kB | 33.47 kB |
  | `dist/assets/index-DxbLD92g.js` | 15,685.48 kB | 1,855.55 kB |

> **Note for Stage 7 (C13 Bundle Budget)**: The baseline entry chunk `index-DxbLD92g.js` is 15.68 MB raw (1.85 MB gzip) because all routes and datasets are eagerly loaded into a single monolithic bundle. Stage 7 code splitting (React.lazy + dynamic JSON imports) will dramatically reduce entry bundle size.
