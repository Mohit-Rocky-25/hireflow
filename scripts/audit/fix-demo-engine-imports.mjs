import fs from 'fs';

console.log('--- Pointing demo pages to talentLensEngine ---');

// 1. CompanyRolesPage.tsx
const crpPath = 'src/pages/demo/CompanyRolesPage.tsx';
if (fs.existsSync(crpPath)) {
  let content = fs.readFileSync(crpPath, 'utf8');
  content = content.replace(
    /from '\.\/talentLensData';/,
    "from './talentLensEngine';\nimport { COMPANIES, findCompanyBySlug } from './talentLensData';"
  );
  fs.writeFileSync(crpPath, content, 'utf8');
  console.log('Updated CompanyRolesPage.tsx');
}

// 2. MatchingDemo.tsx
const mdPath = 'src/pages/demo/MatchingDemo.tsx';
if (fs.existsSync(mdPath)) {
  let content = fs.readFileSync(mdPath, 'utf8');
  content = content.replace(
    /from "\.\/talentLensData";/,
    `from "./talentLensEngine";
import { COMPANIES, findCompanyBySlug } from "./talentLensData";`
  );
  content = content.replace(
    /INDUSTRIES\.map\(\(i\) =>/g,
    'INDUSTRIES.map((i: string) =>'
  );
  content = content.replace(
    /TIERS\.map\(\(t\) =>/g,
    'TIERS.map((t: string) =>'
  );
  fs.writeFileSync(mdPath, content, 'utf8');
  console.log('Updated MatchingDemo.tsx');
}

// 3. useTalentLensStore.ts
const storePath = 'src/pages/demo/useTalentLensStore.ts';
if (fs.existsSync(storePath)) {
  let content = fs.readFileSync(storePath, 'utf8');
  content = content.replace(
    /from '\.\/talentLensData';/,
    "from './talentLensEngine';\nimport type { Company, Role } from './talentLensData';"
  );
  fs.writeFileSync(storePath, content, 'utf8');
  console.log('Updated useTalentLensStore.ts');
}

// 4. OpportunityPlanTab.tsx (fix parameter types)
const oppPlanPath = 'src/features/suite/credentials/components/OpportunityPlanTab.tsx';
if (fs.existsSync(oppPlanPath)) {
  let content = fs.readFileSync(oppPlanPath, 'utf8');
  content = content.replace(
    /\(b\) => b\.title === opp\.name/g,
    '(b: any) => b.title === opp.name'
  );
  content = content.replace(
    /\(b\) => b\.skills && b\.skills\.some/g,
    '(b: any) => b.skills && b.skills.some'
  );
  fs.writeFileSync(oppPlanPath, content, 'utf8');
  console.log('Updated OpportunityPlanTab.tsx parameter types');
}

console.log('--- Demo imports successfully updated ---');

