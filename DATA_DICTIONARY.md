# DATA DICTIONARY — HIREFLOW AI RESUME TAILORING SAAS

## 1. Core Domain Entities

### 1.1 `CandidateProfile`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for candidate profile |
| `fullName` | `string` | Candidate full name |
| `headline` | `string` | Professional headline or target role |
| `contact` | `ContactInfo` | Email, phone, location, LinkedIn, GitHub, portfolio URL |
| `summary` | `string` | Executive summary or objective statement |
| `education` | `EducationEntry[]` | Degree, institution, location, dates, CGPA/GPA/%, honors, coursework |
| `experience` | `ExperienceEntry[]` | Company, position, dates, location, bullet points, skills used |
| `projects` | `ProjectEntry[]` | Project name, role, technologies, link, bullet points |
| `skills` | `CategorizedSkills` | Grouped technical and domain skills |
| `certifications`| `CertificationEntry[]`| Certification name, issuing org, issue date, credential ID/URL |
| `rawText` | `string` | Full unformatted text extracted from source document |
| `sourceFileName`| `string` | Name of the uploaded file |

### 1.2 `JobDescription`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for job description |
| `title` | `string` | Extracted or entered job title |
| `company` | `string` | Target employer or organization |
| `department` | `string` | Division / team |
| `location` | `string` | Geographic location or Remote status |
| `seniority` | `SeniorityLevel` | Inferred seniority level (intern to executive) |
| `rawText` | `string` | Original job description text |
| `requirements` | `JobRequirement[]` | Extracted individual requirements |

### 1.3 `JobRequirement`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique requirement identifier (e.g. `req_01`) |
| `text` | `string` | Verbatim text snippet from job description |
| `normalizedConcept`| `string` | Standardized canonical skill or qualification |
| `category` | `RequirementCategory`| `skill` \| `responsibility` \| `education` \| `experience` \| `certification` \| `domain` |
| `priority` | `RequirementPriority`| `MANDATORY` \| `PREFERRED` |
| `confidence` | `number` | Extraction confidence (0.0 to 1.0) |

### 1.4 `RequirementAssessment` (Evidence Mapping)
| Field | Type | Description |
| :--- | :--- | :--- |
| `requirementId` | `string` | Reference to target `JobRequirement.id` |
| `status` | `AssessmentStatus` | `DIRECT` \| `TRANSFERABLE` \| `PARTIAL` \| `MISSING` \| `UNCERTAIN` \| `CONFLICTING` |
| `supportingFacts`| `EvidenceSnippet[]`| Array of matched candidate facts with section and verbatim text |
| `rationale` | `string` | Human-readable explanation of why this evidence satisfies the requirement |
| `candidateStatus`| `CandidateConfirmation`| `UNCONFIRMED` \| `CONFIRMED` \| `CORRECTED` \| `REJECTED` |

### 1.5 `TailoredResume`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` (UUID) | Unique identifier for tailored resume instance |
| `projectId` | `string` | Associated tailoring project ID |
| `candidateId` | `string` | Associated candidate profile ID |
| `jobId` | `string` | Associated job description ID |
| `template` | `ResumeTemplate` | `classic` \| `modern` \| `compact` \| `executive` |
| `sections` | `TailoredSection[]` | Ordered sections with tailored bullets and headings |
| `layoutSettings`| `LayoutSettings` | Margins, font scale, line height, paper format (`letter` \| `a4`) |
| `truthGateResult`| `TruthGateResult` | Factual integrity verification report and blocking flags |
| `version` | `number` | Version increment number |
| `createdAt` | `string` (ISO) | Timestamp of generation |
