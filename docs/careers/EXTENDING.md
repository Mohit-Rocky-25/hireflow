# Extending the HireFlow Careers Data Platform

This guide explains how to extend the HireFlow Careers Data Platform without breaking backward compatibility or fragmenting data across feature silos.

---

## 1. The Core Principle: The One-Door Rule
- **No section owns the dataset.**
- Feature code (Career Trajectory, TalentLens, ATS Roaster, Tailor My Resume) must **never** maintain internal company lists, hardcoded counts, or duplicate roles.
- All reads go through `import { careers } from '@/careers-core';`.

---

## 2. Recipe 1: Adding a New Company

1. Open `src/careers-core/data/companies.ts`.
2. Add the canonical company record:
```ts
{
  id: 'novo-nordisk',
  name: 'Novo Nordisk India',
  aliases: ['novo nordisk', 'novo-nordisk'],
  marketSegment: 'GCC / Finance',
  marketTier: 'Tier B',
  headquarters: 'Bagsværd, Denmark',
  indiaOffices: ['Bengaluru'],
  tracks: ['DATA', 'SWE'],
  provenance: {
    sources: [
      {
        url: 'https://www.novonordisk.co.in/careers.html',
        title: 'Novo Nordisk Global Business Services India',
        publisher: 'Novo Nordisk',
        type: 'official',
        accessed: '2026-10-10'
      }
    ],
    confidence: 'high',
    lastVerified: '2026-10-10',
    dataYear: '2026'
  }
}
```
3. Add company alias in `src/careers-core/registry/aliasRegistry.ts` if needed.
4. Run `node scripts/careers/validate.mjs` to ensure referential integrity.

---

## 3. Recipe 2: Adding a Fresher / Campus Program

1. Open `src/careers-core/data/fresherPrograms.ts`.
2. Append the verified program definition:
```ts
{
  id: 'company-program-id',
  companyId: 'company-id',
  programName: 'Campus SDE Program',
  roleTitle: 'Associate Software Engineer',
  aliases: ['Company Campus Hire'],
  programType: 'fulltime',
  roleFamily: 'sde-product',
  campusCategory: 'dream',
  hiringReach: 'select-campuses',
  channels: ['on-campus', 'internship-ppo'],
  testOrPortal: 'HackerRank Online Assessment',
  eligibility: {
    degrees: ['B.Tech', 'M.Tech'],
    branchFamilies: ['software', 'data-ai'],
    branchCodes: ['CSE', 'IT', 'AIML'],
    graduationYears: [2026],
    minCgpa: 7.0,
    minPercentage: null,
    backlogPolicy: 'Zero active backlogs',
    gapYearPolicy: null,
    notes: 'Campus drive in Aug-Sep.'
  },
  selectionProcess: [
    { stage: 'OA', type: 'coding', durationMin: 60, topics: ['DSA', 'SQL'], difficulty: 'medium' }
  ],
  compensation: {
    currency: 'INR',
    fixedMinLPA: 12.0,
    fixedMaxLPA: 15.0,
    variableLPA: 1.5,
    joiningBonusINR: null,
    stipendPerMonthINR: null,
    esopNote: null,
    asOfYear: 2026
  },
  training: { durationMonths: 1, bondMonths: 0, bondAmountINR: null, notes: null },
  locations: ['Bengaluru'],
  seasons: { typicalMonths: [8, 9], notes: null },
  entry: { companyLevelCode: 'L3', equivalenceLevelId: 'L3_ENTRY' },
  competencyProfile: { dsa: 'strong', java: 'working' },
  derivedFrom: 'official-jd',
  trajectory: [],
  status: 'active',
  provenance: {
    sources: [{ url: '...', title: 'Official Campus Page', publisher: 'Company', type: 'official', accessed: '2026-10-10' }],
    confidence: 'high',
    lastVerified: '2026-10-10',
    dataYear: '2026'
  }
}
```

---

## 4. Recipe 3: Attaching Custom Fields via `careers.ext`

Future sections can attach proprietary metadata to companies or programs **without modifying the core schema**:

```ts
import { careers } from '@/careers-core';

// 1. Register namespace
careers.ext.register('interview-coach', {
  mockQuestions: 'string[]',
  recommendedPrepDays: 'number'
});

// 2. Attach data
careers.ext.set('company', 'google', 'interview-coach', {
  mockQuestions: ['Design a distributed counter', 'Invert a binary tree'],
  recommendedPrepDays: 45
});

// 3. Retrieve anywhere
const prepData = careers.ext.get('company', 'google', 'interview-coach');
console.log(prepData.recommendedPrepDays); // 45
```

---

## 5. Recipe 4: Consuming in Under 20 Lines

Any feature can consume the platform cleanly:

```tsx
import { useCompanies, DataBadge } from '@/careers-core';

export function QuickCompanyDirectory() {
  const companies = useCompanies('Big Tech India');

  return (
    <div className="space-y-2">
      {companies.map((c) => (
        <div key={c.id} className="flex items-center justify-between p-3 border rounded-xl">
          <span className="font-semibold">{c.name}</span>
          <DataBadge entity={c} />
        </div>
      ))}
    </div>
  );
}
```
