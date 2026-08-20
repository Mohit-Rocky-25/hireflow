# WCAG 2.1 AA Accessibility Compliance Roadmap

Accessibility roadmap ensuring barrier-free navigation for job seekers and hiring teams across HireFlow web clients.

## 1. Compliance Focus Areas

- **Keyboard Traversal:** Ensure complete end-to-end job application submission using solely keyboard tab and enter navigation.
- **Color Contrast:** Minimum $4.5:1$ contrast ratio for regular UI text and $3:1$ for large headings and interactive button states.
- **Screen Reader Semantics:** ARIA live regions for async job filtering results and explicit `aria-invalid` form field warnings.

## 2. Automated Regression Tests

- Integrate `@axe-core/playwright` audits in automated test passes to block accessibility regressions on core candidate flows.

