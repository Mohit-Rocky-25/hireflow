# HireFlow v3 Development Rules & Non-Negotiable Principles

## System Environment
- **Operating System:** Windows on AMD architecture.
- **Shell:** PowerShell-compatible commands only. Never use bash-only syntax (such as `export`, `grep`, `&&` chaining that breaks in older PowerShell, or bash-specific paths). Always use cross-platform paths and PowerShell idioms.

## Non-Negotiable Principles (P-1 through P-10)
- **P-1 NEVER FABRICATE:** Never invent a metric, date, salary, URL, company fact, credential detail, resume fact, quote or statistic. If a fact is not already in the repo or supplied by the user at runtime, store `null` and mark status `"unverified"`. An honest gap beats a plausible guess.
- **P-2 DETERMINISTIC FIRST:** Scoring, parsing, matching and message generation are pure functions. No `Math.random()`, no un-injected `Date.now()` or `new Date()` inside engines (inject `"today"` as a parameter), no network calls with resume text, no LLM calls.
- **P-3 EXPLAINABLE:** Every score, label and finding must carry: the evidence (exact source phrase and section), a confidence (low/medium/high), and a plain-English reason.
- **P-4 HONEST NAMING:** Our scores are our own estimates. No claim that they predict what any company's system will do. No fixed "X% of resumes are auto-rejected" statistic anywhere. Rename ATS Score -> Resume Strength, and JD score -> JD Match.
- **P-5 CONFIG, NOT MAGIC NUMBERS:** All weights, thresholds and word lists live in typed config files in `src/config/` with a one-line comment each.
- **P-6 PROVENANCE ON DATA:** Every record in every dataset (credentials, companies, roles, ladders, compensation, briefs) carries: `source` (string), `sourceUrl` (string|null), `lastVerified` (ISO date|null), `confidence` ("high"|"medium"|"low"), `status` ("verified"|"needs-recheck"|"unverified").
- **P-7 SCOPE:** Candidate-side tools only:
  1. ATS Resume Roaster (Resume Strength)
  2. JD Compare
  3. Tailor My Resume
  4. Build Briefs
  5. Credential Engine
  6. Career Trajectory
  7. TalentLens
  8. Reach Out
  plus shared data, lib, config, tests, and documentation they use.
  *Do NOT add or restore recruiter/BHR/interviewer/admin/multi-tenant code.*
  *Do NOT add auth or deployment work.*
  *Do NOT add an Application Tracker, Job Board, Offer Decoder, Company-vs-Company, Profile Check, or Evidence Card.*
  *Keep the existing UI look and feel; only small improvements.*
- **P-8 DEPENDENCIES:** No new runtime dependencies. A new devDependency is allowed only if unavoidable; state the reason in the stage summary.
- **P-9 SAFE EXECUTION:** Work exclusively on git branch `hireflow-v3`. Never push to remote. Never merge to main. Never delete user data files; move uncertain files to `_quarantine/` instead and list them in the report.
- **P-10 TRUTHFUL REPORTING:** Never claim a test or build passes unless you ran it in this session. Paste the command and the pass/fail counts in each stage summary. Anything unfinished goes into `docs/blocked.md` with the reason; never leave silent TODO stubs.

## Stage Gate Protocol (Every Stage)
1. Run: typecheck (`tsc --noEmit`), lint/tests (`npx vitest run`), production build (`npm run build`). Fix everything you broke.
2. Print a stage summary: files changed, requirements covered (IDs), commands run with results, open items.
3. Make a checkpoint commit on `hireflow-v3`: `"stage N: <title>"`.
4. If a block fails twice, write it to `docs/blocked.md` and continue; do not loop.
