const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/pages/tools/ResumeChecker.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Imports
content = content.replace(
  /import \{ careers, DataBadge \} from '\.\.\/\.\.\/careers-core';/,
  "import { COMPANIES } from '../demo/talentLensData';"
);

// 2. Initial state logic for jobText
content = content.replace(
  /const \[jobText, setJobText\] = useState<string>\(\(\) => \{[\s\S]*?if \(queryCompanyId && queryRoleTitle\) \{[\s\S]*?const comp = careers\.companies\.get\(queryCompanyId\);[\s\S]*?const roles = comp \? careers\.roles\.forCompany\(comp\.id\) : \[\];[\s\S]*?const role = roles\.find\(\(r\) => r\.title\.toLowerCase\(\) === queryRoleTitle\.toLowerCase\(\)\);[\s\S]*?if \(comp && role\) \{[\s\S]*?return \[[\s\S]*?\]\.join\('\\n'\);[\s\S]*?\}[\s\S]*?\}[\s\S]*?return '';[\s\S]*?\}\);/,
  `const [jobText, setJobText] = useState<string>(() => {
    if (queryCompanyId && queryRoleTitle) {
      const comp = COMPANIES.find(c => c.id === queryCompanyId);
      const role = comp?.roles.find(r => r.title.toLowerCase() === queryRoleTitle.toLowerCase());
      if (comp && role && role.fullText) {
        return role.fullText;
      }
    }
    return '';
  });`
);

// 3. Initial state logic for jobFileName
content = content.replace(
  /const \[jobFileName, setJobFileName\] = useState<string \| null>\(\(\) => \{[\s\S]*?if \(queryCompanyId && queryRoleTitle\) \{[\s\S]*?const comp = careers\.companies\.get\(queryCompanyId\);[\s\S]*?if \(comp\) \{[\s\S]*?return \`\$\{comp\.name\}_\$\{queryRoleTitle\.replace\(\/\\s\+\/g, '_'\)\}_Requirements\.txt\`;[\s\S]*?\}[\s\S]*?\}[\s\S]*?return null;[\s\S]*?\}\);/,
  `const [jobFileName, setJobFileName] = useState<string | null>(() => {
    if (queryCompanyId && queryRoleTitle) {
      const comp = COMPANIES.find(c => c.id === queryCompanyId);
      if (comp) {
        return \`\$\{comp.name\}_\$\{queryRoleTitle.replace(/\\s+/g, '_')\}_JD.txt\`;
      }
    }
    return null;
  });`
);

// 4. Remove Campus UI States and Handlers
content = content.replace(
  /\/\/ Fresher \/ Campus Program scan target selection[\s\S]*?setFileError\(null\);\s*\};/,
  '// Campus UI removed for TalentLens JD single source'
);

// 5. Update useEffect logic
content = content.replace(
  /if \(!jobText\) \{[\s\S]*?const comp = careers\.companies\.get\(compId\);[\s\S]*?const roles = comp \? careers\.roles\.forCompany\(comp\.id\) : \[\];[\s\S]*?const role = roles\.find\(\(r\) => r\.title\.toLowerCase\(\) === rTitle\.toLowerCase\(\)\);[\s\S]*?if \(comp && role\) \{[\s\S]*?const generatedJD = \[[\s\S]*?\]\.join\('\\n'\);[\s\S]*?setJobText\(generatedJD\);[\s\S]*?setJobFileName\(\`\$\{comp\.name\}_\$\{role\.title\.replace\(\/\\s\+\/g, '_'\)\}_Requirements\.txt\`\);[\s\S]*?setJobSource\('prefilled'\);[\s\S]*?\}[\s\S]*?\}/,
  `if (!jobText) {
        const comp = COMPANIES.find(c => c.id === compId);
        const role = comp?.roles.find((r) => r.title.toLowerCase() === rTitle.toLowerCase());
        if (comp && role && role.fullText) {
          setJobText(role.fullText);
          setJobFileName(\`\$\{comp.name\}_\$\{role.title.replace(/\\s+/g, '_')\}_JD.txt\`);
          setJobSource('prefilled');
        }
      }`
);

// 6. Remove campus clear states
content = content.replace(
  /setSelectedCampusCompanyId\(''\);\s*setSelectedCampusProgramId\(''\);/,
  ''
);

// 7. Remove Quick Load Campus Hiring Target Selector UI
content = content.replace(
  /\{\/\* Quick Load Campus Hiring Target Selector \*\/\}[\s\S]*?\}\)[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>[\s\S]*?\n\s*\{\/\* Input Panel Section \*\/\}[\s\S]*?(?=\s*<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">)/,
  ''
);
// Above regex is tricky. Let's do it safer.

fs.writeFileSync(filePath, content);
console.log('Done 1-6');
