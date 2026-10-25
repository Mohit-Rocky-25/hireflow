# Consumed Fields Analysis

This document records every field across `Company`, `Role`, and `CompanyEligibilityRule`, identifying:
1. The reading code (`file:line`).
2. The operational effect: **score**, **UI display**, **Roaster import**, or **none**.

---

## 1. Company Fields

| Field Name | Type | Key Reading Code Locations | Operational Effect | Notes / Risk |
|---|---|---|---|---|
| `id` | `string` | `src/lib/companySearchEngine.ts:18`<br>`src/pages/demo/MatchingDemo.tsx:128, 480`<br>`src/pages/demo/talentLensEngine.ts:1179`<br>`src/pages/demo/CompanyRolesPage.tsx:150` | UI display, navigation, lookup | Primary key. Must be URL-safe slug. |
| `name` | `string` | `src/lib/companySearchEngine.ts:32`<br>`src/pages/demo/MatchingDemo.tsx:490`<br>`src/pages/demo/components/CompanyHeaderCard.tsx:40`<br>`src/pages/demo/talentLensEngine.ts:1115` | UI display, search, archetype heuristic | Displayed prominently. Used in fallback archetype matching. |
| `logo` | `string` | `src/components/common/CompanyLogo.tsx:16`<br>`src/pages/demo/components/CompanyHeaderCard.tsx:37`<br>`src/pages/demo/MatchingDemo.tsx:484` | UI display | Monogram text / brand mark. |
| `gradient` | `string` | *(no reader in `src/`)* | **none** | Legacy/dormant property. Has no functional or visual effect. |
| `industry` | `string` | `src/lib/companySearchEngine.ts:35`<br>`src/pages/demo/MatchingDemo.tsx:497`<br>`src/pages/demo/components/CompanyHeaderCard.tsx:45`<br>`src/pages/demo/talentLensEngine.ts:1114` | UI display, search filter, scoring context | Used in heuristic to detect quant/trading or high-growth archetypes. |
| `hq` | `string` | `src/lib/companySearchEngine.ts:36`<br>`src/pages/demo/MatchingDemo.tsx:498`<br>`src/pages/demo/components/CompanyHeaderCard.tsx:46` | UI display, search filter | Geographic location pill. |
| `tier` | `string` | `src/lib/companySearchEngine.ts:37`<br>`src/pages/demo/MatchingDemo.tsx:488`<br>`src/pages/demo/components/CompanyHeaderCard.tsx:42`<br>`src/pages/demo/talentLensEngine.ts:1113` | UI display, search filter, scoring context (archetype) | Critical: Maps directly to 1 of 6 canonical market archetypes (`big_tech_product`, `indian_high_growth`, `service_track`, `early_growth_startup`, `quant_trading`, `product_mnc_gcc`). |
| `hiring2023` | `number?` | `src/pages/demo/talentLensData.ts` (stored) | UI display (optional) | Informational metrics. |
| `hiring2024` | `number?` | `src/pages/demo/talentLensData.ts` (stored) | UI display (optional) | Informational metrics. |
| `openRoles` | `number?` | `src/pages/demo/MatchingDemo.tsx:492`<br>`src/pages/demo/components/CompanyHeaderCard.tsx:48`<br>`src/pages/demo/components/AnalysisResultView.tsx:515` | UI display | **Caution**: Rendered as `{company.openRoles}+`. If undefined, produces `undefined+`. Requires null-safe fallback (Task 1.3). |
| `roles` | `Role[]` | `src/lib/companySearchEngine.ts:40`<br>`src/pages/demo/CompanyRolesPage.tsx:165`<br>`src/pages/demo/useTalentLensStore.ts:45`<br>`src/pages/demo/__tests__/talentlens.test.ts:28` | UI display, role selection, test assertions | Array of roles. Existing test expects `>= 10` roles for legacy companies. |
| `source` | `string?` | `src/pages/demo/talentLensData.ts:154332`<br>`src/pages/demo/__tests__/talentlens.test.ts:51` | UI display, test assertion | Provenance attribution. |
| `sourceUrl` | `string?` | `src/pages/demo/talentLensData.ts:154333` | UI display (link) | Link to official careers or source page. |
| `lastVerified`| `string?` | `src/pages/demo/talentLensData.ts:154334` | UI display, freshness audit | ISO date string (`YYYY-MM-DD`). |
| `confidence` | `string?` | `src/pages/demo/talentLensData.ts:154335`<br>`src/pages/demo/__tests__/talentlens.test.ts:53` | UI display, test assertion | `'high' \| 'medium' \| 'low'`. |
| `status` | `string?` | `src/pages/demo/talentLensData.ts:154336`<br>`src/pages/demo/__tests__/talentlens.test.ts:54` | UI display, test assertion | `'verified' \| 'needs-recheck' \| 'unverified'`. |

---

## 2. Role Fields

| Field Name | Type | Key Reading Code Locations | Operational Effect | Notes / Risk |
|---|---|---|---|---|
| `title` | `string` | `src/lib/companySearchEngine.ts:41`<br>`src/pages/demo/CompanyRolesPage.tsx:210`<br>`src/pages/demo/components/TargetRoleActionPanel.tsx:55`<br>`src/pages/demo/talentLensEngine.ts:1097` | UI display, search, scoring context (role family) | Used in heuristic to classify `Frontend`, `Backend`, `Data/ML`, `Mobile`, `DevOps`, or `General`. |
| `level` | `string` | `src/pages/demo/components/ExperiencedRoleCard.tsx:45`<br>`src/pages/demo/talentLensEngine.ts:1151` | UI display, scoring context (`jdLevel`) | Checks if string contains `'senior'` to set `jdLevel: 'senior' \| 'entry'`. |
| `desc` | `string` | `src/pages/demo/components/ExperiencedRoleCard.tsx:60` | UI display | Short human-readable summary. |
| `competencies` | `string[]` | `src/pages/demo/talentLensEngine.ts:1025, 1087, 1096, 1130`<br>`src/pages/demo/components/ExperiencedRoleCard.tsx:75`<br>`src/pages/demo/components/AnalysisResultView.tsx:120` | **score**, UI display | Drives the entire competency matching engine and requirement list. Can take any subset of the 20 canonical keys (no 4-item minimum enforced). |
| `reqLevel` | `Record<string, string>?` | `src/pages/demo/talentLensEngine.ts:989, 1027, 1089, 1131` | **score** | Sets requirement strength: `'expert' \| 'strong'` sets `must`; others set `preferred`. |
| `location` | `string?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:50` | UI display | e.g. "Bengaluru, India" |
| `employmentType` | `string?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:52` | UI display | e.g. "Full-time" |
| `experienceLevel`| `string?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:54` | UI display | e.g. "0-2 years" |
| `aboutRole` | `string?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:85` | UI display | Deep descriptive paragraph. |
| `responsibilities`| `string[]?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:95` | UI display | Bullet points. |
| `requiredQualifications` | `string[]?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:105` | UI display | Bullet points. |
| `toolsAndTech` / `requiredSkills` / `preferredSkills` | `string[]?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:115` | UI display | Badges. |
| `hiringProcess` / `selectionProcess` | `object[]?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:125` | UI display | Recruitment timeline steps. |
| `compensation` / `benefits` | `string?` | `src/pages/demo/components/ExperiencedRoleCard.tsx:135` | UI display | Compensation notes. |
| `fullText` | `string?` | `src/pages/demo/CompanyRolesPage.tsx:195` | **Roaster import**, UI display | Imported directly as target JD into ATS Resume Roaster. Must be clean plain text. |
| `source` | `string?` | `src/pages/demo/talentLensData.ts:154339` | UI display | Provenance tracking. |
| `sourceUrl` | `string?` | `src/pages/demo/talentLensData.ts:154340` | UI display (link) | Link to source job posting. |
| `lastVerified`| `string?` | `src/pages/demo/talentLensData.ts:154341` | UI display | Audit date (`YYYY-MM-DD`). |
| `confidence` | `string?` | `src/pages/demo/talentLensData.ts:154342` | UI display | Provenance confidence. |
| `status` | `string?` | `src/pages/demo/talentLensData.ts:154343` | UI display | Provenance status. |

---

## 3. Eligibility Rule Fields (`CompanyEligibilityRule`)

| Field Name | Type | Key Reading Code Locations | Operational Effect | Notes / Risk |
|---|---|---|---|---|
| `companyId` | `string` | `src/data/market/companyEligibility.ts:240`<br>`src/features/suite/engine/quickSummary.ts:50` | Lookup key | Matches against target company ID. |
| `companyName` | `string` | `src/data/market/companyEligibility.ts:22` | UI display | Canonical corporate name. |
| `displayName` | `string` | `src/features/suite/engine/quickSummary.ts:60`<br>`src/pages/demo/components/AnalysisResultView.tsx:320` | UI display | Program display name shown in gate UI. |
| `aggregatePercent` | `number` | `src/data/market/companyEligibility.ts:24`<br>`src/features/suite/engine/quickSummary.ts:65` | **score / gate** | Evaluated against candidate's academic percentage. In Stage 1, this must become nullable (H7: no conversion). |
| `cgpaEquivalent` | `number` | `src/data/market/companyEligibility.ts:25`<br>`src/features/suite/engine/quickSummary.ts:70` | **score / gate** | Evaluated against candidate's CGPA. In Stage 1, this must become nullable (H7: no conversion). |
| `sourceName` | `string` | `src/data/market/companyEligibility.ts:26`<br>`src/pages/demo/components/AnalysisResultView.tsx:330` | UI display | Provenance attribution. |
| `sourceUrl` | `string?` | `src/data/market/companyEligibility.ts:27`<br>`src/pages/demo/components/AnalysisResultView.tsx:332` | UI display (link) | Required under ADR-001 / Stage 1. |
| `notes` | `string` | `src/data/market/companyEligibility.ts:28`<br>`src/pages/demo/components/AnalysisResultView.tsx:340` | UI display | Explanatory eligibility criteria. |
| `confidence` | `string` | `src/data/market/companyEligibility.ts:29` | UI display | `'high' \| 'medium'`. |
| `lastReviewed`| `string` | `src/data/market/companyEligibility.ts:30` | UI display | ISO date (`YYYY-MM-DD`). |
