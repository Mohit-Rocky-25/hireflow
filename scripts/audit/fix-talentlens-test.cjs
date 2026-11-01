const fs = require('fs');
let s = fs.readFileSync('src/pages/demo/__tests__/talentlens.test.ts', 'utf8');
s = s.replace(
  /import \{[\s\S]*?\} from '\.\.\/talentLensData';/,
  "import { COMPANIES, findCompanyBySlug } from '../talentLensData';\nimport { getCompanySlug, deepAnalyzeCompetency, computeScore, generateImprovementPlan, runMarketIntelligenceEngine } from '../talentLensEngine';"
);
fs.writeFileSync('src/pages/demo/__tests__/talentlens.test.ts', s);
console.log('Fixed talentlens.test.ts');

