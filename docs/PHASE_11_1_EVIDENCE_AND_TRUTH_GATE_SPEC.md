# HireFlow — Phase 11.1 Evidence Integrity & Truth Gate Specification

**Primary Modules:**
- [intelligencePipeline.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/engine/intelligencePipeline.ts)
- [useTailorWorkspaceStore.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/store/useTailorWorkspaceStore.ts)
- [truthGate.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/lib/tailor/engine/truthGate.ts)

## Core Non-Negotiable Guarantees
1. **No Hallucinated Metrics:** Any numeric metric not grounded in `doc.rawSourceText`, original bullet text, or an explicit `UserConfirmedEvidenceRecord` fails both `verifySingleProposalTruth` and `validateBeforeFinalize` (`blocking`).
2. **No Verb-Rank Escalation:** Both single-proposal Truth Check (`verifySingleProposalTruth`) and final Validation Gate (`verifyFactualIntegrity`) enforce identical rules (`propRank > origRank` fails unless user-confirmed).
3. **No Summary/Skills Whitelist Bypass:**
   - `validateBeforeFinalize` restores baseline `skills` from `parseResumeRawText(doc.rawSourceText, undefined, { preserveEmptyBullets: true })`, never from edited `doc`.
   - Adding an unverified skill via `updateSkills()` or `updateSummary()` triggers a blocking validation failure until explicitly confirmed via `confirmUserEvidence()`.
4. **Candidate-Confirmed Evidence Attribution:** `confirmUserEvidence()` records `confirmedBy`, `confirmedAt`, `factText`, and `evidenceNote`. In validation, bullets are exempted strictly when `confirmedTexts.has(b.text.trim())` matches exact confirmed text, so subsequent arbitrary edits remain protected.
5. **Custom Sections Protected:** `addCustomSection()` initializes `originalText: ''` and `bullets: []` (no hardcoded placeholder bullets), subjecting user-added custom statements to full Truth Gate verification.
6. **Hardened Export Gate:** `TailorWorkspacePage.handleExport` executes `runValidation()` before allowing PDF, DOCX, or Markdown generation and blocks export with `role="alert"` whenever `!report.factualPassed || !report.documentPassed`.
