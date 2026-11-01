import fs from 'fs';

console.log('--- Decoupling talentLensEngine from talentLensData ---');

// 1. In AnalysisResultView.tsx
const arvPath = 'src/pages/demo/components/AnalysisResultView.tsx';
if (fs.existsSync(arvPath)) {
  let content = fs.readFileSync(arvPath, 'utf8');
  content = content.replace(
    /from '\.\.\/talentLensData';/g,
    "from '../talentLensEngine';"
  );
  fs.writeFileSync(arvPath, content, 'utf8');
  console.log('Updated AnalysisResultView.tsx imports to talentLensEngine');
}

// 2. In CompanyHeaderCard.tsx
const chcPath = 'src/pages/demo/components/CompanyHeaderCard.tsx';
if (fs.existsSync(chcPath)) {
  let content = fs.readFileSync(chcPath, 'utf8');
  content = content.replace(
    /import { TREND_ICON } from '\.\.\/talentLensData';/,
    "import { TREND_ICON } from '../talentLensEngine';"
  );
  fs.writeFileSync(chcPath, content, 'utf8');
  console.log('Updated CompanyHeaderCard.tsx imports to talentLensEngine');
}

// 3. In talentLensData.ts - remove re-exports of talentLensEngine
const tldPath = 'src/pages/demo/talentLensData.ts';
if (fs.existsSync(tldPath)) {
  let content = fs.readFileSync(tldPath, 'utf8');
  const reexportTarget = /\/\/ Re-export all computation, analysis, and evaluation functions from canonical talentLensEngine[\s\S]*?export const findCompanyBySlug[\s\S]*?;\r?\n\s*\};\r?\n/;
  const cleanFind = `export const findCompanyBySlug = (slug: string): Company | undefined => {
  return COMPANIES.find((c) => c.id === slug || c.name.toLowerCase() === slug.toLowerCase());
};
`;
  content = content.replace(reexportTarget, cleanFind);
  fs.writeFileSync(tldPath, content, 'utf8');
  console.log('Removed talentLensEngine re-exports from talentLensData.ts');
}

// 4. Update vite.config.ts manualChunks to isolate scoring and ATS taxonomy
const vitePath = 'vite.config.ts';
let viteContent = fs.readFileSync(vitePath, 'utf8');
const manualChunksRegex = /manualChunks\(id\) \{[\s\S]*?if \(id\.includes\('node_modules'\)\) \{/;
const newChunks = `manualChunks(id) {
          if (id.includes('talentLensData')) {
            return 'data-talentlens';
          }
          if (id.includes('companyCatalog')) {
            return 'data-company-catalog';
          }
          if (id.includes('src/scoring') || id.includes('src/data/ats') || id.includes('src/config/scoring')) {
            return 'ats-scoring-spec';
          }
          if (id.includes('node_modules')) {`;
viteContent = viteContent.replace(manualChunksRegex, newChunks);
fs.writeFileSync(vitePath, viteContent, 'utf8');
console.log('Updated vite.config.ts with ats-scoring-spec manualChunk');

