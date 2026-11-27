# HireFlow — Complete Application Route Inventory

Verified directly from `src/App.tsx` (with Classic vs. Spruce `DesignGate` resolution):

| Route | Aliases / Redirects | Primary Component(s) | Purpose & Store |
|---|---|---|---|
| `/` | — | `LandingPage` / `SpruceLandingPage` | Public landing page |
| `/login`, `/register` | — | `LoginPage` (`initialMode="signin" \| "signup"`) | Authentication / Demo registration entry |
| `/auth/callback` | — | `AuthCallbackPage` | OAuth PKCE callback handler (`useAuthStore`) |
| `/portal`, `/portal/*` | `/portal/resumes`, `/portal/audits/:auditId` | `PortalRedirect` → `/?my=...` | Legacy My Space redirect routes |
| `/demo` | `/talentlens`, `/talent-lens`, `/demo/talentlens` | `MatchingDemo` / `SpruceTalentLensPage` | TalentLens company & role readiness benchmark (`useTalentLensStore`) |
| `/demo/company/:companySlug` | — | `CompanyRolesPage` / `SpruceCompanyRolesPage` | Company-specific role explorer |
| `/tools` | — | `ToolsHubPage` / `SpruceToolsHubPage` | Suite tools directory |
| `/tools/resume-checker` | `/roaster`, `/tools/resume-roaster`, `/tools/roaster`, `/tools/checker` | `ResumeChecker` / `SpruceResumeCheckerPage` | ATS Resume Roaster (`runAtsEngine` `4.0.0-ats7d`, writes `useAuditStore`, `useAtsToolStore`, `useScanHistoryStore`) |
| `/tools/jd-compare` | `/compare`, `/tools/company-compare` | `CompareJDsPage` / `SpruceCompareJDsPage` | Dual/Multi-JD head-to-head comparison & shared gaps |
| `/tools/tailor` | `/tailor`, `/tools/resume-tailor`, `/tools/tailor-draft` | `TailorResumePage` / `SpruceTailorPage` | Tailor My Resume editor (`useTailorStore`) |
| `/tools/reach-out` | `/reach-out` | `ReachOutPage` / `SpruceReachOutPage` | Cold outreach & referral message studio |
| `/tools/build-briefs` | `/briefs`, `/tools/project-briefs`, `/tools/briefs` | `BuildBriefsPage` / `SpruceBuildBriefsPage` | Portfolio project briefs & verification kits (`useBriefProgressStore`) |
| `/tools/credential-engine` | `/credentials`, `/tools/credentials`, `/tools/opportunity-engine` | `CredentialOpportunityEnginePage` / `SpruceCredentialEnginePage` | Certifications & fellowships engine (`CredentialsStorage`) |
| `/tools/career-path` | — | `CareerPathHub` / `SpruceCareerPathHubPage` | Career Trajectory hub |
| `/tools/career-path/dream-job-roadmap` | `/tools/career-path/promotion-simulator`, `/simulator` | `DreamJobRoadmapPage` | Dream job roadmap & promotion simulator |
| `/tools/career-path/company-levels` | `/tools/career-path/company-ladder`, `/explorer`, `/tools/offer-decoder` | `CompanyLevelsPage` | Company level & compensation ladder |
| `/tools/talent-lens` | — | `TalentLens` | Standalone TalentLens route |
| `/history` | `/tools/tracker` | `ScanHistoryPage` | Scan progression chart & side-by-side compare (`useScanHistoryStore`) |
| `/jd-library` | `/tools/jd-library` | `SavedJdLibraryPage` | Saved JD Library & cross-JD skill demand (`useSavedJdStore`) |
| `/data` | `/settings` | `YourDataPage` | Account status, Private Storage documents, Legacy Importer, Erase Data |
| `/methodology` | `/tools/methodology` | `MethodologyPage` | Scoring methodology & transparency |
| `/tools/pathways/*` | `/pathways` | `PathwaysRadarPage`, `ProgramDetailPage`, `ActionPlanPage`, `OfferEvaluatorPage`, `AboutDataPage` | Campus Pathways suite (behind `FEATURES.PATHWAYS_ENABLED`) |
| `/dev/careers-data` | — | `CareersDataExplorer` | Internal careers dataset explorer |
| `/__spruce` | — | `SpruceGalleryPage` (`DEV` only) | Design system component gallery |
