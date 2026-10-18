# Verification Workflow (/verify)

Run this workflow at the end of each stage or when invoking `/verify` to validate the health, safety, and integrity of the HireFlow v3 candidate tools suite.

## Execution Steps (PowerShell)

Execute the verification steps sequentially:

```powershell
# 1. Typecheck
npx tsc --noEmit

# 2. Lint & Unit Tests
npx vitest run

# 3. Production Build
npm run build

# 4. Data Validation
npm run validate:data

# 5. Accessibility & Contrast Test
npx vitest run src/__tests__/a11y/contrast.test.ts

# 6. Privacy & Egress Scan
npx vitest run src/__tests__/security/privacy-egress.test.ts
```

## Pass / Fail Report Output Format

Always output the final results as a single-screen Markdown table:

| Verification Gate | Command | Status | Details / Metrics |
| :--- | :--- | :--- | :--- |
| **Typecheck** | `npx tsc --noEmit` | PASS / FAIL | Zero TypeScript compiler diagnostics |
| **Unit Tests** | `npx vitest run` | PASS / FAIL | Total tests passed / failed |
| **Production Build** | `npm run build` | PASS / FAIL | Vite client bundle size & asset count |
| **Data Validation** | `npm run validate:data` | PASS / FAIL | Provenance schema & duplicate check |
| **Contrast & A11y** | `vitest run contrast` | PASS / FAIL | WCAG AA 4.5:1 ratio verified |
| **Privacy Scan** | `vitest run privacy-egress` | PASS / FAIL | Zero network leaks, local storage verified |
