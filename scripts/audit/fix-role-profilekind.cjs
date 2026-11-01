const fs = require('fs');

const path = 'src/pages/demo/talentLensData.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "  profileKind?: 'representative';",
  "  profileKind?: 'sourced' | 'estimate' | 'representative';"
);

fs.writeFileSync(path, content, 'utf8');
console.log('talentLensData.ts updated');
