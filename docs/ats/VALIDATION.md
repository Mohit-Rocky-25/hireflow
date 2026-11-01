# ATS Roaster — Scoring Validation

> Validation table based on golden test fixtures in `tests/fixtures/golden/`.
> The expected score ranges below were manually calibrated by reviewing what
> the deterministic scorer *actually produces* against each fixture and JD combo.
> All scores are produced by `runAtsEngine()` with `skipAi: true`.

---

## Validation Matrix

| Resume Fixture | JD Fixture | Expected Score Range | Band | Key Check |
|---|---|---|---|---|
| `golden_resume_01_single_column.txt` | `golden_jd_01_backend_sde.txt` | 62–78 | Good Fit / Partial Fit | Standard layout, good skills coverage |
| `golden_resume_02_twocolumn_overleaf.txt` | `golden_jd_01_backend_sde.txt` | 55–75 | Partial–Good Fit | Two-column parse must not scramble sections |
| `golden_resume_03_sidebar.txt` | `golden_jd_02_frontend_react.txt` | 48–68 | Partial–Good Fit | Sidebar layout, React/TS skills expected |
| `golden_resume_04_table_heavy.txt` | `golden_jd_03_fullstack_enterprise.txt` | 42–62 | Weak–Partial Fit | Table layout warning expected |
| `golden_resume_05_stuffed_skills.txt` | `golden_jd_01_backend_sde.txt` | **≤ 55** | Must be penalised | Stuffing penalty must apply; score must not exceed 55 |
| `golden_resume_06_weak_fresher.txt` | `golden_jd_04_devops_cloud.txt` | 20–42 | Weak–Low Fit | Fresher vs senior JD; must not score above 42 |
| `golden_resume_07_strong_fresher.txt` | `golden_jd_01_backend_sde.txt` | 50–70 | Partial–Good Fit | Strong fresher with projects gets credit |
| `golden_resume_08_services_company.txt` | `golden_jd_01_backend_sde.txt` | 55–75 | Partial–Good Fit | Services background, partial product fit |

---

## Short-Skill Word Boundary Test

These skills must **not** false-positive match inside longer words:

| Skill | Must NOT match | Must match |
|---|---|---|
| `R` | `React`, `Ruby`, `Raspberry`, `CRUD`, `for` | `R programming`, `R, Python, SQL` |
| `C` | `Cisco`, `React`, `cache`, `docker` | `C language`, `C, C++, Java` |
| `Go` | `GoLang` (should match via alias), `Google`, `MongoDB`, `algorithm` | `Go`, `Golang`, `Go programming` |
| `C++` | `C++14` should still match (suffix number OK) | `C++`, `C++ 17`, `modern C++` |
| `C#` | `C#5`, `C# 9.0` should match | `C#`, `C# programming` |
| `.NET` | `NET framework` (missing dot) should NOT match | `.NET`, `.NET Core`, `ASP.NET` |

The skill matcher uses `buildAliasRegex()` in `src/features/ats/engine/skillMatcher.ts` which applies the pattern:
`(?<![A-Za-z0-9+#.])SKILL(?![A-Za-z0-9+#.])` — this prevents matches inside larger tokens.

---

## Stuffing Test — Pass Condition

Resume `golden_resume_05_stuffed_skills.txt` must trigger:
1. `formatAuditor` returns a `Skill Overload` penalty (−5 points).
2. The UI shows a "Skill Stuffing Detected" warning badge.
3. The final score is capped below 55 for the standard backend JD.

---

## Honest UI Note (in-app)

The ATS Roaster UI must show the following disclaimer in the results panel:

> "Score is based on a local rule-based engine that simulates keyword and structure screening. Real ATS systems differ by employer, vendor, and role. This score is a directional signal, not a guarantee."

Verify this text is present in `src/features/ats/` or `src/pages/ats/` result display components.

---

## Verification Status

| Check | Status | Notes |
|---|---|---|
| TSC compile | ✓ Pass | 0 errors as of Nov 2026 |
| Word boundary matching for short skills | ✓ Implemented | `buildAliasRegex` in `skillMatcher.ts` |
| Stuffing detection | ✓ Implemented | `formatAuditor.ts` + `scorer.ts` penalty |
| Two-column layout | ✓ Implemented | `fileParser.ts` with header band detection |
| Honest UI disclaimer | Needs verification | Check result display component |
| Golden fixture automated tests | Needs implementation | Add to `tests/ats/golden.test.ts` |

