# HireFlow — Phase 11.1 7-Layer Resume Intelligence Engine Specification

**Implementation:** [intelligencePipeline.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/features/tailor/engine/intelligencePipeline.ts)

## Pipeline Architecture
1. **Layer 1 — Strict Source Parsing (`parseSourceToStructuredDocument`):**
   - Calls `parseResumeRawText(normalized, undefined, { preserveEmptyBullets: true })` (`src/lib/tailor/parser/resumeParser.ts`).
   - Preserves zero-fabrication fidelity: bulletless entries keep `bullets: []` instead of injecting default accomplishment sentences or `'Recent'` dates.
   - Classifies employment vs internship vs academic/open-source/personal projects into `ProvenanceKind` without polluting exported organization names.
2. **Layer 2 — Atomic Claim Proof Ledger (`extractAtomicClaims`):**
   - Decomposes summary, work, project, education, and user-confirmed evidence into `AtomicClaim` items carrying `sourceWorkspaceId`, `sourceVersionId`, `sourceSnapshotHash`, `provenanceKind`, `evidenceExcerpts`, `normalizedConcepts`, `extractedMetrics`, and `userConfirmed`.
3. **Layers 3–6 — Mode-Aware Diagnosis & Strategy (`analyzeTailorWorkspace`):**
   - `jd`: Evaluates requirements via canonical `runAtsEngine(serialized, jdText)` and `parseJobDescription(jdText)`, capturing `orGroupId` (`OR` vs `AND`) and mapping status (`directly_demonstrated`, `partially_supported`, `transferable`, `contradicted`, `missing_evidence`, `user_confirmed`).
   - `role`: Maps `demonstratedEvidenceLabels` separately from `missingQualificationLabels`.
   - `improve`: Identifies weak passive openers and unquantified statements (`needsMetricPrompt`) while never auto-inserting synthetic metrics.
   - Passive clarification respects exact `CLAIM_STRENGTH_LADDER` rank limits (`origRank === propRank`), generating non-escalating clarifying rewrites or flagging unconfirmed escalation cleanly.
4. **Layer 7 — Pre-Finalize Validation Gate (`validateBeforeFinalize`):**
   - Runs `verifyFactualIntegrity` against baseline `rawSourceText` + explicit `UserConfirmedEvidenceRecord[]` only (never trusting edited `doc` skills).
   - Verifies summary metrics/skills, skills-list additions, internal identifier absence (`fact_`, `ctx-`, `claim_`, `b_exp_`, `b_proj_`), and visible section count before allowing `commitTailoredVersion` or document exports.
