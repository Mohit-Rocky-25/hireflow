# HireFlow v4 Development Rules & Non-Negotiable Principles

## System Environment
- **Operating System:** Windows on AMD architecture.
- **Shell:** PowerShell-compatible commands only. Never use bash-only syntax (e.g. `export`, `grep`, or bash-specific subshells). Always use cross-platform paths and PowerShell idioms.

## Absolute Git Rules
- **DO NOT RUN** `git commit`, `git push`, `git add`, `git checkout`, `git switch`, `git branch`, `git merge`, `git rebase`, `git stash`, `git reset`, `git clean`, `git restore`, or any command that changes git state. The owner will review, test, and push manually.
- **Read-only git is allowed:** `git status`, `git diff`, `git log` to inspect changes.
- **Because nothing is committed, write progress to `docs/stage-log.md` after every stage** (what was done, files touched, commands run with results) so work can resume after an interruption.

## Non-Negotiable Principles (P-1 through P-13)
- **P-1 NEVER FABRICATE:** Never invent a metric, date, salary, URL, company fact, credential detail, resume fact, formula description, or statistic. If a fact is unknown store `null` and mark `"unverified"`. When documenting how a number is computed, derive the description ONLY by reading the code that computes it.
- **P-2 DETERMINISTIC ENGINES:** Engines (`src/engine` or the repo's pure-logic folders) are pure functions: no `Math.random`, no `Date.now()`/`new Date()`, no network, no storage access. Time, IDs, and hashes are created in the UI/store layer and passed in.
- **P-3 PRIVACY:** No resume text, JD text, or personal data leaves the browser. No analytics, telemetry, or remote logging. No new network calls with user content. Everything added is local-only.
- **P-4 EXPLAINABLE:** Every derived number shown to a user must be explainable from its inputs (Stage 5).
- **P-5 CONFIG NOT MAGIC NUMBERS:** Every cap, threshold, budget, and word list goes into typed config files (`src/config/limits.ts`, `thresholds.ts`, etc.) with a one-line comment.
- **P-6 SCOPE:** Candidate-side tools only:
  1. ATS Resume Roaster (Resume Strength)
  2. JD Compare
  3. Tailor My Resume
  4. Build Briefs
  5. Credential Engine
  6. Career Trajectory
  7. TalentLens
  8. Reach Out
  plus shared code, lib, config, stores, data, and tests.
  *Do NOT add or restore recruiter/BHR/interviewer/admin/multi-tenant code.*
  *Do NOT add auth or deployment work.*
  *Do NOT add an Application Tracker, Job Board, application-status pipeline, Offer Decoder, Company-vs-Company comparison page, Profile Check, or Evidence Card.*
  *Existing buttons such as "Compare with another company" and "Have an offer? Decode it" must be left untouched; if they are dead links, only list them in the final report.*
- **P-7 HONEST NAMING:** Do not add any claim that HireFlow predicts what a company's hiring system will decide, any "probability of success/callback", or any fixed statistic about auto-rejection. If an existing "success probability" style number is displayed, remove it from the UI and note it in `docs/decisions.md`.
- **P-8 LOOK AND FEEL:** Keep the existing design language and tokens. New UI must reuse existing components and tokens. No redesigns. Do not rewrite landing-page copy beyond what a requirement here strictly needs.
- **P-9 DEPENDENCIES:** No new runtime dependencies. A new devDependency is allowed only when unavoidable (state why in `docs/decisions.md`). Installed versions must be compatible with the repo's Vite/React/TypeScript versions; if a package is incompatible, implement the feature by hand instead.
- **P-10 SAFE FILE OPERATIONS:** Never delete data files or directories. Never use recursive delete commands. If something must be removed, move it into `_quarantine/` and list it in the final report. Only touch files inside the project folder.
- **P-11 TRUTHFUL REPORTING:** Never claim a test, build, or check passes unless you ran it in this session; paste the command and the pass/fail counts into `docs/stage-log.md`. Never leave silent TODO stubs; anything unfinished goes to `docs/blocked.md`.
- **P-12 NO FEEDBACK LOOPS INTO SCORING:** User feedback, scan history, and saved data must never automatically change scoring weights or thresholds.
- **P-13 SECURE-CONTEXT AWARENESS:** The owner will test on a phone over the local network (plain HTTP), where `crypto.subtle`, `crypto.randomUUID`, and service workers are unavailable. Every feature that uses them must degrade gracefully with a fallback.

## Stage Gate Protocol (After Every Stage)
1. Run typecheck, lint, the full test suite, and a production build. Fix everything broken.
2. Append a summary to `docs/stage-log.md`: requirements covered (IDs), files changed, commands run with results, open items.
3. Update `docs/requirements-v4.md` (traceability table: requirement ID, stage, acceptance test names, status).
4. If a requirement fails twice, move it to `docs/blocked.md` and continue. Do not loop.
