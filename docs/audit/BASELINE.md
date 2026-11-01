# HireFlow Baseline Measurement Report
**Date:** November 1, 2026
**Branch:** `fix/honesty-and-completion`
**Pre-Audit Commit:** `dc462c3`

## 1. Automated Test Suite
- **Total Test Files:** 333
- **Test Files Passed:** 333 (100%)
- **Total Individual Tests:** 1,812
- **Tests Passed:** 1,812 (100%)
- **Vitest Suite Duration:** 174.66s

## 2. TypeScript Compilation Check
- **Command:** `npx tsc --noEmit`
- **Result:** Exited with code 0 (0 errors)

## 3. Production Build & Bundle Metrics
- **Build Duration:** 11.24s (`tsc && vite build`)
- **Main App Chunk (`dist/assets/index-BwycLiW3.js`):** 678.10 kB (184.26 kB gzip)
- **TalentLens Data Chunk (`dist/assets/data-talentlens-D577XVz7.js`):** 10,138.49 kB (700.48 kB gzip)
- **Vendor React Chunk:** 281.21 kB (89.84 kB gzip)
- **Vendor Charts Chunk:** 376.66 kB (108.61 kB gzip)
- **Careers Context Chunk:** 1,183.01 kB (86.93 kB gzip)
- **CSS Bundle (`dist/assets/index-CSgXW43q.css`):** 70.21 kB (12.35 kB gzip)

## 4. First-Load Transfer & Preload Finding
- **Inspection of `dist/index.html`:**
  ```html
  <script type="module" crossorigin src="/assets/index-BwycLiW3.js"></script>
  <link rel="modulepreload" crossorigin href="/assets/data-talentlens-D577XVz7.js">
  ```
- **Finding:** Despite manual chunking in `vite.config.ts`, `data-talentlens` is listed as a `modulepreload` in `dist/index.html`. This forces the client to download the 10.1MB / 700kB gzip dataset on first page load before navigating to TalentLens.
- **Remediation Target (Stage 3.1):** Break static imports from entry routes, extract a lightweight index for company listings, and lazy-load full company profiles dynamically on demand.
