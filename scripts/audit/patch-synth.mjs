import fs from 'fs';

const synthPath = 'src/data/careerLadders/synthesizer.ts';
let content = fs.readFileSync(synthPath, 'utf8');

// Ensure Role and Company typing handles CatalogCompany cleanly
content = content.replace(
  /type Company = CatalogCompany \| any;\ntype Role = any;/,
  "import type { CatalogRoleSummary } from '../companyCatalog';\ntype Company = (CatalogCompany | any);\ntype Role = (CatalogRoleSummary | any);"
);

content = content.replace(
  /const entryRole = roles\.find\(\(r\) =>/g,
  'const entryRole = roles.find((r: any) =>'
);
content = content.replace(
  /const midRole = roles\.find\(\(r\) =>/g,
  'const midRole = roles.find((r: any) =>'
);
content = content.replace(
  /const seniorRole = roles\.find\(\(r\) =>/g,
  'const seniorRole = roles.find((r: any) =>'
);
content = content.replace(
  /const staffRole = roles\.find\(\(r\) =>/g,
  'const staffRole = roles.find((r: any) =>'
);

fs.writeFileSync(synthPath, content, 'utf8');
console.log('Fixed synthesizer.ts types');

