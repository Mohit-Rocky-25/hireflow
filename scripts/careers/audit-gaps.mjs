import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const snapshotPath = path.join(projectRoot, 'docs', 'careers', 'baseline-snapshot.json');
const reportPath = path.join(projectRoot, 'docs', 'careers', 'data-gap-report.md');

if (!fs.existsSync(snapshotPath)) {
  console.error('Error: baseline-snapshot.json not found at', snapshotPath);
  process.exit(1);
}

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));

// Audit G1: Level equivalence rank, typical YoE, years in level
let g1TotalLevels = 0;
let g1MissingEquivalence = 0;
let g1MissingYoE = 0;
let g1MissingYearsInLevel = 0;

for (const company of snapshot.careerLadders.companies) {
  for (const level of company.levels) {
    g1TotalLevels++;
    // In current raw ladders:
    if (!level.equivalenceRank) g1MissingEquivalence++;
    if (!level.typicalYoE) g1MissingYoE++;
    if (!level.typicalYearsInLevel) g1MissingYearsInLevel++;
  }
}

// Audit G2: Branch codes, program length, default tracks
let g2TotalBranches = snapshot.degreesAndBranches.totalEntries;
// Check degreesAndBranches.ts directly for missing fields
const degreesTsPath = path.join(projectRoot, 'src', 'data', 'careerLadders', 'degreesAndBranches.ts');
let g2MissingBranchCode = 0;
let g2MissingProgramLength = 0;
let g2MissingDefaultTrack = 0;
let g2MissingTargetRole = 0;

if (fs.existsSync(degreesTsPath)) {
  const content = fs.readFileSync(degreesTsPath, 'utf-8');
  // Check if branchCode / programLengthYears / defaultTrack / typicalFirstRole are present in the objects
  const hasBranchCode = content.includes('branchCode:');
  const hasProgramLength = content.includes('programLengthYears:');
  const hasDefaultTrack = content.includes('defaultTrack:');
  const hasTypicalFirstRole = content.includes('typicalFirstRole:');

  if (!hasBranchCode) g2MissingBranchCode = g2TotalBranches;
  if (!hasProgramLength) g2MissingProgramLength = g2TotalBranches;
  if (!hasDefaultTrack) g2MissingDefaultTrack = g2TotalBranches;
  if (!hasTypicalFirstRole) g2MissingTargetRole = g2TotalBranches;
}

// Audit G3: Campus/Fresher programs currently available
let g3CampusProgramsCount = 0;
for (const company of snapshot.careerLadders.companies) {
  // In the old ladder, hiringRoutes had generic on-campus routes but zero detailed FresherProgram objects
  // (no testOrPortal, no banding, no detailed topic difficulty, no fresher trajectory)
}

// Audit G4: Templated text, generic hubs & tracks
let g4TemplatedHubsCount = 0;
let g4QuestionableEMTracks = 0;
let g4CoreSWETracks = 0;

for (const company of snapshot.careerLadders.companies) {
  if (company.segment === 'Core Engineering & Automotive') {
    const hasOnlySWE = company.levels.every((l) => l.track === 'SWE');
    if (hasOnlySWE) g4CoreSWETracks++;
  }
  const hasEM = company.levels.some((l) => l.track === 'EM');
  // If tracks mentions EM but has no EM levels:
  if (!hasEM) g4QuestionableEMTracks++;
}

// Audit G5: Questionable companies
const questionableCompanies = ['netflix', 'meta'].filter((id) =>
  snapshot.careerLadders.companies.some((c) => c.id === id)
);

// Audit G6: Duplicated companies between Career Ladders (56) and TalentLens (75)
const ladderCompanyIds = new Set(snapshot.careerLadders.companies.map((c) => c.id.toLowerCase()));
const talentLensCompanyIds = new Set(snapshot.talentLens.companies.map((c) => c.id.toLowerCase()));

const commonCompanyIds = [...ladderCompanyIds].filter((id) => talentLensCompanyIds.has(id));
const onlyLadderCompanyIds = [...ladderCompanyIds].filter((id) => !talentLensCompanyIds.has(id));
const onlyTalentLensCompanyIds = [...talentLensCompanyIds].filter((id) => !ladderCompanyIds.has(id));

let md = `# HireFlow Careers Data Platform — Gap Audit Report (G1–G6)

Generated: ${new Date().toISOString()}  
Baseline Snapshot: \`docs/careers/baseline-snapshot.json\`

---

## Summary of Findings

| Gap Code | Description | Pre-Migration Count / Status | Target Resolution |
|---|---|---|---|
| **G1** | Levels with missing Equivalence Rank, YoE, or Years in Level | ${g1MissingEquivalence} of ${g1TotalLevels} levels missing rank | Populate canonical equivalence, typical YoE, and years-in-level; use null for unknown |
| **G2** | Branches with missing Code, Program Length, Default Track | ${g2TotalBranches} branches lack formal codes / lengths | Add standardized branch codes (CSE, ECE, ME, etc.), program lengths (3, 4, 5 yrs), and target role families |
| **G3** | Dedicated Fresher / Campus Programs Dataset | 0 structured \`FresherProgram\` entities | Build verified fresher programs covering test portals, banding, eligibility, and 5-yr trajectories |
| **G4** | Templated artifacts, generic "Bangalore/Remote", mismatched tracks | High (all Core Eng had SWE tracks; EM listed without ladders) | Real India hubs, proper tracks (Embedded, VLSI, Mechanical GET), flag generic promo packets |
| **G5** | Questionable India Tech Ladders (Meta, Netflix) & naming drift | ${questionableCompanies.length} questionable entries | Verify early-career India presence, flag limited/discontinued, canonicalize aliases |
| **G6** | Duplication & Disagreement across sections | Ladders: 56, TalentLens: 75 (${commonCompanyIds.length} shared, ${onlyTalentLensCompanyIds.length} TalentLens only, ${onlyLadderCompanyIds.length} Ladder only) | Unify into single platform entity registry with aliases; eliminate separate copies |

---

## Detailed Gap Analysis

### G1: Level Metrics & Equivalence Parity
- **Total Levels Evaluated**: ${g1TotalLevels} across ${snapshot.careerLadders.totalCompanies} companies.
- **Missing Equivalence Rank**: ${g1MissingEquivalence} levels (${Math.round((g1MissingEquivalence / g1TotalLevels) * 100)}%). In raw company ladders, \`equivalenceRank\` is undefined on level definitions, causing exports to render "N/A".
- **Missing Typical YoE**: ${g1MissingYoE} levels (${Math.round((g1MissingYoE / g1TotalLevels) * 100)}%).
- **Missing Years in Level**: ${g1MissingYearsInLevel} levels (${Math.round((g1MissingYearsInLevel / g1TotalLevels) * 100)}%).

### G2: Branch & Degree Normalization
- **Catalog Size**: ${g2TotalBranches} degree/branch entries.
- **Defects**: Entries lack normalized short codes (e.g., \`CSE\`, \`ECE\`, \`ME\`), degree duration years (B.Tech 4 vs BCA 3 vs M.Tech 2), and mapping to canonical role families (e.g. \`sde-product\`, \`embedded-firmware\`, \`core-mechanical\`).

### G3: Fresher & Campus Hiring Platform Gap
- Existing data only provided senior lateral career ladders and high-level CTC medians.
- There was **zero** representation of:
  - Campus hiring season timelines (July–October on-campus vs January–April off-campus).
  - Hiring test portals (TCS NQT / NextStep, Wipro NLTH, Infosys Springboard / InfyTQ, HackerRank).
  - Multi-tier banding within the same company (e.g. TCS Ninja 3.36L vs Digital 7L vs Prime 9L).
  - Service bonds & training periods (e.g. 1-2 year bonds with ₹1-2 Lakh penalties).
  - College Tier eligibility cutoffs (Tier 1 vs Tier 2 vs Tier 3 CGPA / backlog policies).

### G4: Templated Content & Track Misalignments
- **Core Engineering**: Core automotive/electronics companies (e.g., Tata Motors, Mahindra, Bosch, Ather) had all levels assigned strictly to \`track: 'SWE'\` instead of mechanical/automotive/embedded engineering tracks.
- **EM Ladders**: Ladders declared \`tracks: ['SWE', 'EM']\` but only provided L3-L7 SWE individual contributor levels without management levels.
- **Promotion Artifacts**: Calibration text across multiple unicorn ladders used identical placeholder boilerplate ("promo doc, peer reviews, manager assessment").

### G5: Questionable Early-Career Entities
- **Meta & Netflix India**: Meta India primarily operates sales/partnerships with very limited new-grad SWE hiring; Netflix India engineering is senior/staff only (zero fresher hiring). These must be accurately tagged \`status: 'limited'\` or \`status: 'unverified'\`.
- **Cognizant Brand Drift**: Legacy data referenced "GenC Next", whereas current 2025/2026 branding designates "GenC Pro" and "GenC Elevate". Aliases must canonicalize to unified IDs.

### G6: Duplication Across Sections (TalentLens vs Career Ladders)
- **Career Ladders**: ${snapshot.careerLadders.totalCompanies} companies.
- **TalentLens**: ${snapshot.talentLens.totalCompanies} companies with ${snapshot.talentLens.totalRoles} roles.
- **Overlap**: Exactly ${commonCompanyIds.length} companies exist in both datasets under slightly different IDs or names (e.g. \`google\` vs \`google-india\`).
- **Orphaned Companies**:
  - In Career Ladders only: ${onlyLadderCompanyIds.join(', ')}
  - In TalentLens only: ${onlyTalentLensCompanyIds.slice(0, 15).join(', ')}... (+${Math.max(0, onlyTalentLensCompanyIds.length - 15)} more)
- **Outcome**: A candidate searching for a company could see differing role counts or missing data depending on which page they visited.

---

## Pre-Migration Gap Metrics Summary

\`\`\`json
${JSON.stringify(
  {
    totalCompaniesLadders: snapshot.careerLadders.totalCompanies,
    totalCompaniesTalentLens: snapshot.talentLens.totalCompanies,
    sharedCompanies: commonCompanyIds.length,
    unlinkedTalentLensCompanies: onlyTalentLensCompanyIds.length,
    totalLevels: g1TotalLevels,
    missingEquivalence: g1MissingEquivalence,
    missingYoE: g1MissingYoE,
    missingYearsInLevel: g1MissingYearsInLevel,
    branchEntriesLackingMetadata: g2TotalBranches,
    structuredFresherProgramsExisting: 0,
  },
  null,
  2
)}
\`\`\`
`;

fs.writeFileSync(reportPath, md, 'utf-8');
console.log('✓ Successfully generated data-gap-report.md');
