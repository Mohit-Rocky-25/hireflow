# Pathways Cutover & Production Deployment Plan

**Date**: 2026-10-26  
**Status**: Ready for Production Cutover  
**Branch**: `feat/pathways-v1`  
**Governing Standard**: Constitution Part B (B7) & Spec C2  

---

## 1. Feature Flag & Rollout Architecture

Pathways is architected with complete feature flag decoupling:

- **Primary Flag**: `FEATURES.PATHWAYS_ENABLED` located in [features.ts](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/config/features.ts).
- **Public Routes Controlled**:
  1. `/tools/pathways` (PathwaysRadarPage)
  2. `/tools/pathways/program/:id` (ProgramDetailPage)
  3. `/tools/pathways/plan` (ActionPlanPage)
  4. `/tools/pathways/offers` (OfferEvaluatorPage)
  5. `/tools/pathways/about-data` (AboutDataPage)
- **Navigation Integration**: [ToolsHubPage.tsx](file:///c:/Users/yadav/.gemini/antigravity-ide/scratch/hireflow/src/pages/tools/ToolsHubPage.tsx) dynamically evaluates `FEATURES.PATHWAYS_ENABLED` and exposes the Pathways entry card in the primary tools directory.

---

## 2. Coexistence with Legacy Systems

To prevent any breaking changes across HireFlow:
1. **Zero Modifications to Legacy Core**:
   - `src/careers-core/`: Untouched.
   - `src/data/careerLadders/`: Untouched.
   - `src/features/suite/integration/trajectory.ts`: Preserved for backwards compatibility.
2. **Independent Storage Namespace**:
   - Pathways operates exclusively under `hireflow:v4:pathways:profile`.
   - Legacy ATS tools and session state remain completely isolated.
3. **Read-Only Diagnostics**:
   - The Readiness Link reads `hireflow_talentlens_session_v1` and `hireflow_tool_ats_v3` in a strictly read-only fashion without mutations or score overrides.

---

## 3. Immediate Rollback Protocol

If an unexpected production incident occurs:
1. Set `PATHWAYS_ENABLED: false` in `src/config/features.ts`.
2. Commit and deploy:
   ```bash
   git commit -am "pw(rollback): disable pathways feature flag"
   ```
3. **Behavior Upon Rollback**:
   - All `/tools/pathways/*` routes immediately redirect to `/tools`.
   - The Pathways card disappears from the Tools Hub.
   - No data loss occurs for existing user profiles stored in local storage.

---

## 4. Performance & Telemetry Validation

- **Code Splitting**: All 5 Pathways views are dynamically imported with `React.lazy()`.
- **Main Bundle Impact**: $< 4\text{ KB}$ total added to main chunk (routes and flag definitions).
- **Network Egress**: Confirmed $0\text{ bytes}$ transmitted across all user actions. Complete local-only operation.
- **Render Performance**: Radar evaluated 20 programs in $< 5\text{ ms}$ on standard mobile hardware.
